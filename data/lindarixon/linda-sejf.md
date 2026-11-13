# Lindarixon/Linda-Sejf

## Resumen

Linda Sejf es un componente de verificacion de afirmaciones (fact-verification) para un asistente documental local sobre derecho polaco, presentado por el autor Lindarixon al concurso Bielik Awards 2026 en la categoria SLM. No es un modelo generativo, sino un cross-encoder de clasificacion de pares (frase de respuesta, fragmento fuente) construido sobre `allegro/herbert-base-cased`, cuyo objetivo es determinar si una frase generada por un LLM se deduce realmente del texto citado como fuente.

El repositorio incluye el verificador en formato ONNX int8 (125 MB), su tokenizador y umbral de decision calibrado en 0,857, asi como utilidades en Python para cargarlo sin `transformers` (solo `onnxruntime` y `tokenizers`) y para reparar el tokenizador de los GGUF de Bielik v3. Este segundo componente corrige un fallo de conversion BPE a SentencePiece que degradaba la tokenizacion de los modelos Bielik empaquetados en GGUF.

La relevancia actual reside en dos frentes: por un lado, ofrece un mecanismo de grounding verificable para pipelines RAG legales en polaco, un dominio donde la alucinacion tiene consecuencias graves; por otro, documenta y corrige un error de tokenizacion reproducible en llama.cpp que afecta a cualquier despliegue GGUF de Bielik v3 y que altera el comportamiento de rechazo del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (HerBERT-base, encoder BERT) sobre `allegro/herbert-base-cased` |
| Parametros totales | no disponible (modelo base HerBERT-base; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por fragmento (el fragmento fuente se trunca a 512) |
| Tipos de cuantizacion | ONNX int8 (verificador); GGUF Q6_K y Q8_0 en los ejemplos de reparacion de tokenizador |
| Idiomas soportados | polaco (pl) |
| Licencia | CC BY 4.0 (verificador, derivado de HerBERT); scripts MIT; Bielik v3 Apache-2.0 |
| Formato de pesos | ONNX (`model_int8.onnx`), `tokenizer.json`, `sejf_verifier.json`; herramientas para GGUF |

## Arquitectura y entrenamiento

El verificador es un cross-encoder basado en HerBERT-base: recibe como entrada el par (frase de respuesta, fragmento de fuente), trunca el fragmento a 512 tokens y produce una puntuacion de implicacion. La decision se toma comparando esa puntuacion con un umbral fijado en 0,857, almacenado en `sejf_verifier.json`. El modelo se distribuye cuantizado a int8 en ONNX (125 MB) y se carga exclusivamente con `onnxruntime` y `tokenizers`, sin dependencia de `transformers`.

El entrenamiento utilizo 4 530 pares extraidos de siete leyes polacas (textos unificados, Dz.U.). Los positivos son frases que se deducen del articulo; los negativos son afirmaciones sutilmente falsas generadas por Bielik-11B, numeros intercambiados, conceptos sustituidos y fragmentos de otro articulo. La evaluacion se hizo sobre cuatro leyes excluidas del entrenamiento (1 386 pares sinteticos), con AUROC de 0,955 en int8 y, en el punto de operacion elegido, retencion del 90 % de frases verdaderas y paso del 9,5 % de falsas.

El segundo componente, `fix_tokenizer.py`, corrige un fallo en la conversion de los GGUF de Bielik v3: el tokenizador HF es BPE con 59 611 reglas de merge y `byte_fallback`, pero los GGUF lo guardan como SentencePiece (`llama`) sin reglas de merge y con `add_space_prefix=false`. La herramienta reescribe `score(token) = −rango de la regla BPE` y activa `add_space_prefix=true`, copiando los tensores sin modificarlos.

## Capacidades

- Clasificacion binaria de implicacion entre una frase y un fragmento fuente, con puntuacion continua y umbral calibrado.
- Verificacion de respuestas generadas por LLM en pipelines RAG: cada frase de la respuesta se contrasta con el fragmento citado.
- Deteccion de falsedades sutiles: numeros alterados, conceptos sustituidos y citas de articulos distintos.
- Carga ligera sin `transformers`, solo con `onnxruntime` y `tokenizers`, adecuada para entornos con dependencias minimas.
- Reparacion del tokenizador de cualquier GGUF de Bielik v3 mediante `fix_tokenizer.py`, sin tocar los pesos.
- Comparacion de tokenizacion llama.cpp frente a HF original mediante `check_tokenizer.py`.
- Capacidad multilingue: no disponible; el modelo esta entrenado y evaluado solo en polaco.
- Tool calling, agentes, vision, audio o modo thinking: no disponible (no es un modelo generativo).

## Casos de uso

- Verificacion de respuestas en asistentes legales RAG: cada frase de la respuesta de Bielik-4.5B se contrasta con el articulo citado y, si la puntuacion queda por debajo de 0,857, se marca en lugar de eliminarse, lo que permite al usuario revisar la cita.
- Moderacion de salidas en atencion al ciudadano: el verificador filtra afirmaciones no respaldadas por la fuente antes de mostrar la respuesta, reduciendo el riesgo de informacion juridica incorrecta.
- Auditoria de pipelines RAG: procesar por lotes pares (respuesta, contexto) para medir la tasa de grounding de un sistema existente y detectar articulos problematicos.
- Despliegue en entornos sin GPU: el ONNX int8 de 125 MB se ejecuta en CPU con `onnxruntime` y 4 hilos, adecuado para portatiles o servidores modestos.
- Correccion de GGUF de Bielik v3 en produccion: aplicar `fix_tokenizer.py` a los pesos oficiales o convertidos para alinear la tokenizacion con el entrenamiento; el autor reporta 41/41 tokenizaciones identicas a HF frente a 0/41 del GGUF oficial.
- Mejora de la tasa de rechazo en asistentes documentales: con el tokenizador reparado, las negativas correctas en Bielik-4.5B Q8 sobre 60 preguntas fuera de documento pasaron del 60 % al 87 % (45 % al 74 % en preguntas realistas).
- Validacion de citas en generacion de resumenes legislativos: comprobar que cada resumen de un articulo se deduce del texto original antes de publicarlo.

## Benchmarks y rendimiento

| Evaluacion | Metrica | Resultado |
|---|---|---|
| 4 leyes excluidas del entrenamiento (1 386 pares sinteticos) | AUROC int8 | 0,955 |
| Mismo conjunto, en el umbral 0,857 | Retencion de verdaderos / paso de falsos | 90 % / 9,5 % |
| Frases reales de Bielik-4.5B (etiquetas de Gemini, no humanos) | AUROC | 0,77 |
| Tokenizacion GGUF oficial Bielik-4.5B Q8_0 (41 frases del Codigo de Trabajo) | Identicas a HF / tokens | 0/41 / 1134 (+8 %) |
| Tokenizacion GGUF reparado Q6_K | Identicas a HF / tokens | 41/41 / 1050 |
| Bielik-4.5B Q8, RAG sobre 11 leyes, 60 preguntas fuera de documento | Negativas correctas | 60 % → 87 % |
| Mismo escenario, preguntas realistas | Negativas correctas | 45 % → 74 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el verificador ONNX int8 ocupa 125 MB y puede ejecutarse en CPU.
- GPU recomendadas: no disponibles; el autor no publica requisitos de GPU. Al ser un cross-encoder de 125 MB, cualquier GPU consumer es suficiente si se desea aceleracion.
- GPU consumer: cabe en cualquier GPU consumer, e incluso en CPU con `onnxruntime` y 4 hilos (ejemplo del autor).
- Despliegue: `onnxruntime` + `tokenizers` para el verificador; `llama.cpp` para los GGUF de Bielik v3 una vez reparado el tokenizador. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Linda Sejf (verificador) | Cross-encoder de clasificacion | no disponible (base HerBERT-base) | 512 tokens por fragmento | CC BY 4.0 | ONNX int8 en HF |
| Bielik-4.5B-v3 | LLM generativo (modelo verificado) | 4,5 B | no disponible | Apache-2.0 | GGUF y pesos en HF |
| Bielik-11B | LLM generativo (generador de negativos) | 11 B | no disponible | no disponible | HF |
| HerBERT-base | Encoder base | no disponible | no disponible | CC BY 4.0 | HF |

No se dispone de datos comparativos de rendimiento con otros verificadores de fact-verification en polaco en la informacion proporcionada.

## Limitaciones y advertencias

- Las etiquetas de calidad fueron producidas por modelos (Gemini, Bielik-11B, Claude), no por juristas; la validacion juridica humana no esta documentada.
- El verificador se entreno solo con textos legales polacos; en otros dominios no fue medido.
- AUROC de 0,77 sobre frases reales de Bielik-4.5B, notablemente inferior al 0,955 sintetico: los errores reales de modelos pequenos son mas dificiles de detectar.
- No realiza inferencia logica: casos como "12 anos ≥ 10 anos → 26 dias" pueden marcarse como no confirmados. El autor recomienda marcar, no eliminar, las frases.
- El umbral 0,857 esta calibrado para el dominio legal polaco y puede no ser optimo en otros contextos.
- El modelo solo cubre polaco; no hay soporte multilingue.
- La licencia CC BY 4.0 exige atribucion; los scripts son MIT y Bielik v3 es Apache-2.0, por lo que las condiciones varian segun el componente usado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- La reparacion del tokenizador modifica metadatos del GGUF; conviene validar con `check_tokenizer.py` antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Lindarixon/Linda-Sejf
- Modelo base: https://huggingface.co/allegro/herbert-base-cased
- Bielik (SpeakLeash / ACK Cyfronet AGH): no disponible en la informacion proporcionada
- Paper, blog o demo del proyecto: no disponible en la informacion proporcionada
