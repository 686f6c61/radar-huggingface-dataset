# abhirajratna/anlp-a2-moe-v3

## Resumen

`abhirajratna/anlp-a2-moe-v3` es un modelo de traducci\u00f3n autom\u00e1tica neuronal desarrollado por el usuario abhirajratna en el contexto de una asignatura de procesamiento de lenguaje natural (etiqueta `anlp-assignment`). Se trata de un transformer decoder-only entrenado desde cero para traducir vietnamita a ingl\u00e9s y japon\u00e9s a ingl\u00e9s, con un total de 33.579.520 par\u00e1metros y 25.190.912 par\u00e1metros activos por token. Forma parte de una serie de cinco modelos que solo se diferencian en la capa feed-forward, lo que lo convierte en una pieza de un estudio comparativo de variantes de FFN.

La arquitectura emplea una capa feed-forward de tipo mixture-of-experts (MoE) con 4 expertos enrutados, selecci\u00f3n top-2, ancho oculto de 512 por experto y router en float32, sobre un tronco de 8 capas, d_model 512 y 8 cabezas de atenci\u00f3n. El vocabulario es de 16.384 tokens con BPE a nivel de byte compartido entre los tres idiomas. El entrenamiento se realiz\u00f3 sobre 114.291.660 tokens no de padding durante 3 \u00e9pocas (9.933 pasos) con una tasa de aprendizaje m\u00e1xima de 0.001.

Su relevancia es acad\u00e9mica y experimental: es un modelo muy peque\u00f1o (33,6 M de par\u00e1metros), con licencia no especificada, cero descargas y cero likes en el momento de la consulta. No compite con sistemas de traducci\u00f3n de producci\u00f3n, pero resulta \u00fatil como referencia reproducible de enrutamiento MoE en traducci\u00f3n de baja recursos y como base para experimentos de destilaci\u00f3n o ablaci\u00f3n.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capa feed-forward mixture-of-experts (MoE) |
| Parametros totales | 33.579.520 |
| Parametros activos | 25.190.912 por token |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; el repo solo contiene safetensors y c\u00f3digo PyTorch) |
| Idiomas soportados | vietnamita (vi), japones (ja), ingles (en); direccion de traduccion entrenada: vi\u2192en y ja\u2192en |
| Licencia | no disponible |
| Formato de pesos | safetensors (m\u00e1s c\u00f3digo PyTorch en `code/part1/` y `tokenizer.json`) |
| Capas / d_model / cabezas | 8 / 512 / 8 |
| Vocabulario | 16.384 (BPE a nivel de byte, compartido vi/ja/en) |
| Configuracion MoE | 4 expertos enrutados, top-2, ancho oculto por experto 512, router en float32 |
| Tokens de entrenamiento (no padding) | 114.291.660 (3 epocas, 9.933 pasos) |
| Tasa de aprendizaje maxima | 0.001 |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | belumind/en-vi-ja-curated-500k-triplets |
| Pipeline declarado | translation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atenci\u00f3n causal, 8 capas, dimensi\u00f3n de modelo 512 y 8 cabezas de atenci\u00f3n. La singularidad reside en la capa feed-forward: en lugar de una FFN densa, incorpora una mezcla de expertos con 4 expertos enrutados, selecci\u00f3n top-2 por token y ancho oculto de 512 por experto. El router se mantiene en float32, un detalle habitual para estabilizar el entrenamiento de MoE con precisiones reducidas. El vocabulario de 16.384 tokens se construye con BPE a nivel de byte y se comparte entre vietnamita, japon\u00e9s e ingl\u00e9s. El modelo forma parte de una familia de cinco variantes que solo difieren en la capa feed-forward, lo que sugiere un dise\u00f1o experimental de ablaci\u00f3n controlada.

El entrenamiento se realiz\u00f3 desde cero sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`, con 114.291.660 tokens no de padding, 3 \u00e9pocas y 9.933 pasos, usando una tasa de aprendizaje m\u00e1xima de 0.001. No se documenta en la model card el uso de RLHF, DPO, SFT ni ninguna fase de alineaci\u00f3n posterior al preentrenamiento. Tampoco se detalla la composici\u00f3n exacta del dataset, la distribuci\u00f3n por idioma ni el n\u00famero de tokens reservados a validaci\u00f3n, m\u00e1s all\u00e1 del split de test indicado (24.792 tripletas, equivalentes a 49.584 traducciones). El formato de entrada es `<|vi|> origen <|en|>` o `<|ja|> origen <|en|>`; el modelo contin\u00faa con la traducci\u00f3n en ingl\u00e9s y el token `<|eos|>`.

## Capacidades

- Traducci\u00f3n autom\u00e1tica vietnamita\u2192ingl\u00e9s e japon\u00e9s\u2192ingl\u00e9s, con generaci\u00f3n autoregresiva condicionada por token de idioma de origen.
- Decodificaci\u00f3n greedy documentada como configuraci\u00f3n de referencia para los resultados publicados (BLEU y chrF).
- Enrutamiento disperso MoE con top-2 de 4 expertos, lo que reduce el c\u00f3mputo activo por token frente a un modelo denso equivalente.
- Tokenizaci\u00f3n multiling\u00fc\u00edstica compartida (vi/ja/en) mediante BPE a nivel de byte, lo que evita problemas de vocabulario fuera de dominio en los tres idiomas.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), visi\u00f3n, audio ni ninguna modalidad adicional.
- No es un modelo instruido ni de chat: no se ha documentado fine-tuning con instrucciones ni alineaci\u00f3n conversacional.
- Direcci\u00f3n inversa (en\u2192vi, en\u2192ja) no entrenada expl\u00edcitamente; no hay evidencia de que funcione.

## Casos de uso

- Traducci\u00f3n de vietnamita a ingl\u00e9s en pipelines editoriales de bajo volumen: el modelo acepta lotes de frases con el prefijo `<|vi|>` y produce la traducci\u00f3n hasta `<|eos|>`, con un BLEU de 43,79 en el split de test, suficiente para tareas de postedici\u00f3n humana.
- Traducci\u00f3n de japon\u00e9s a ingl\u00e9s para documentaci\u00f3n t\u00e9cnica o subtitulado: con BLEU 34,07 y chrF 58,21, encaja en flujos donde la salida se revisa antes de publicarse.
- Preprocesado y aumento de datos multiling\u00fces: generar pares vi-en y ja-en sint\u00e9ticos para entrenar o evaluar otros sistemas de traducci\u00f3n, dado el bajo coste computacional del modelo.
- Investigaci\u00f3n en arquitecturas MoE: al ser una de cinco variantes que solo cambian la FFN, permite aislar el efecto del enrutamiento y del n\u00famero de expertos en calidad de traducci\u00f3n.
- Despliegue en el borde o en CPU: con 33,6 M de par\u00e1metros, el modelo cabe en memoria de dispositivos con recursos muy limitados y puede ejecutarse sin GPU para traducci\u00f3n offline.
- Destilaci\u00f3n o ajuste fino como modelo de partida: su tama\u00f1o permite reentrenarlo por completo en un \u00fanico acelerador para dominios espec\u00edficos (legal, m\u00e9dico, soporte) con presupuestos peque\u00f1os.
- Comparativa acad\u00e9mica de variantes FFN: sirve como referencia cuantitativa (perplejidad, BLEU, chrF) frente a variantes densas del mismo tronco en trabajos de asignatura o art\u00edculos cortos.
- Traducci\u00f3n por lotes de gran volumen en servidores sin GPU: con 0,1 GB de repositorio, el coste de almacenamiento y de memoria es despreciable frente a modelos multiling\u00fces de cientos de millones de par\u00e1metros.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test (24.792 tripletas = 49.584 traducciones):

| Metrica | vi\u2192en | ja\u2192en | Global |
|---|---|---|---|
| Perplejidad (tokens objetivo) | 3,375 | 4,327 | 3,821 |
| BLEU (greedy) | 43,79 | 34,07 | 38,97 |
| chrF (greedy) | 63,67 | 58,21 | 60,94 |

Firma sacreBLEU: `nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.6.0`.

No se han publicado resultados de benchmarks est\u00e1ndar externos (MMLU, HumanEval, GSM8K, FLORES-200 u otros) en la informaci\u00f3n disponible. Los valores anteriores proceden del propio split de test del autor y no son directamente comparables con resultados de terceros sin verificar la composici\u00f3n del split.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 134 MB en FP32, 67 MB en FP16/BF16, 34 MB en int8 y 17 MB en int4 (c\u00e1lculo a partir de 33.579.520 par\u00e1metros).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el modelo no requiere aceleradores de gama alta. Modelos como RTX 4090, A100 o H100 quedan enormemente sobredimensionados para inferencia en solitario.
- Cabe en GPU de consumo: s\u00ed, en cualquier GPU de consumo moderna e incluso en iGPU y en CPU. Tambi\u00e9n es viable en dispositivos m\u00f3viles o embebidos.
- Opciones de despliegue: PyTorch nativo mediante el c\u00f3digo incluido (`code/part1/model.py`, funci\u00f3n `load_pretrained`) y `tokenizers` para cargar `tokenizer.json`. No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama no son utilizables sin una conversi\u00f3n previa. vLLM y TGI no est\u00e1n soportados de forma nativa al tratarse de una arquitectura MoE personalizada sin integraci\u00f3n publicada.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo en la informaci\u00f3n proporcionada.
- Memoria adicional: al no documentarse la longitud m\u00e1xima de contexto, no es posible estimar el tama\u00f1o de la cach\u00e9 KV; con 8 capas y d_model 512, la cach\u00e9 por token ser\u00e1 reducida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abhirajratna/anlp-a2-moe-v3 | 33,6 M (25,2 M activos) | no disponible | BLEU 43,79 vi\u2192en / 34,07 ja\u2192en (test propio) | no disponible | HuggingFace (0 descargas) |
| Helsinki-NLP/opus-mt-vi-en | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Helsinki-NLP/opus-mt-ja-en | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| NLLB-200 (variante destilada) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de los modelos alternativos dentro de la informacion proporcionada, por lo que la comparativa cuantitativa queda como no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre modelos comparables (los resultados obtenidos correspondian a contenido no relacionado).

## Limitaciones y advertencias

- Licencia no especificada: no hay autorizacion explicita de uso comercial, lo que supone un riesgo legal para cualquier despliegue en produccion.
- Modelo de 33,6 M de parametros: capacidad muy limitada para frases largas, terminologia especializada, desambiguacion contextual y dominios alejados del corpus de entrenamiento.
- Alcance restringido a dos direcciones de traduccion (vi\u2192en y ja\u2192en). No se ha entrenado en\u2192vi ni en\u2192ja, y no hay evidencia de que el tokenizador compartido baste para esas direcciones.
- Los resultados de BLEU y chrF proceden de un split de test derivado del mismo dataset de entrenamiento (`belumind/en-vi-ja-curated-500k-triplets`), por lo que pueden sobreestimar el rendimiento en dominios reales y no equivalen a una evaluacion en FLORES-200 u otros conjuntos estandar.
- Longitud de contexto no documentada: se desconoce el limite maximo de tokens de entrada, lo que impide garantizar el comportamiento en documentos largos.
- Riesgo de alucinacion y de omisiones en la traduccion: al ser un modelo entrenado desde cero sin fase de alineacion documentada, no hay mecanismos de control de fidelidad ni de rechazo de entradas fuera de distribucion.
- Sesgos potenciales: no se documenta ninguna auditoria de sesgos ni la composicion demografica o tematica del corpus; al ser un dataset curado de 500.000 tripletas, la cobertura tematica es probablemente estrecha.
- Sin soporte de tool calling, agentes, vision ni audio: no es adecuado para tareas fuera de la traduccion de texto.
- Modelo no instruido ni conversacional: no responde a prompts en lenguaje natural sin el formato exacto `<|vi|> ... <|en|>` o `<|ja|> ... <|en|>`.
- Sin formato GGUF publicado: su integracion en llama.cpp, Ollama o entornos similares requiere convertir los pesos manualmente.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion comunitaria independiente de los resultados declarados.
- Las fechas del repositorio (creado y actualizado el 2026-09-30) resultan anomalas; conviene verificar la trazabilidad del artefacto antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhirajratna/anlp-a2-moe-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Paper: no disponible
- Repositorio de c\u00f3digo independiente: no disponible (el c\u00f3digo se distribuye dentro del propio repositorio, en `code/part1/`)
- Demos: no disponible
- Blog o articulo tecnico: no disponible
- Resultados de la busqueda web: sin resultados relevantes sobre el modelo (los enlaces devueltos no guardaban relacion con la consulta)
