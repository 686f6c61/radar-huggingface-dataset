# bongaswonga/cs329x-personalized-dpo

## Resumen

`bongaswonga/cs329x-personalized-dpo` es un adaptador PEFT (LoRA) alojado en HuggingFace, construido sobre el modelo base `TinyLlama/TinyLlama-1.1B-Chat-v1.0`. Por su nombre, se trata de un ajuste orientado a DPO (Direct Preference Optimization) con fines de personalizacion, probablemente un experimento academico o de curso: el identificador "cs329x" no aparece documentado en la model card. El repositorio no incluye pipeline declarado, licencia, idiomas ni descripcion funcional; la model card es la plantilla por defecto de HuggingFace con todos los campos marcados como `[More Information Needed]`.

El interes tecnico del artefacto es limitado pero concreto: ejemplifica el flujo de trabajo de PEFT 0.13.2 sobre un modelo de 1,1 mil millones de parametros, un formato habitual en experimentos de alineamiento de bajo coste. La relevancia practica depende enteramente de que los pesos del adaptador esten efectivamente subidos (el tamano del repositorio figura como 0.0 GB) y de que el autor documente el dataset de preferencias, los hiperparametros y cualquier evaluacion. A fecha de la ficha, el modelo acumula 0 descargas y 0 "likes", por lo que no existe validacion por parte de la comunidad.

En resumen: es un adaptador experimental, sin documentacion publicada y sin resultados de evaluacion. Cualquier uso en produccion requiere auditoria previa de los pesos, de la licencia y del comportamiento real del modelo fusionado.

## Especificaciones tecnicas

Los valores marcados como "(modelo base)" proceden de la documentacion publica de TinyLlama-1.1B-Chat-v1.0, no de la model card del adaptador.

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only con arquitectura tipo Llama 2 (modelo base); el rango, alpha y modulos objetivo del adaptador no estan disponibles |
| Parametros totales | 1,1 mil millones en el modelo base; el numero de parametros entrenables del adaptador es no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (modelo base); no especificado para el adaptador |
| Tipos de cuantizacion | no disponible (no se publican recetas de cuantizacion del adaptador) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el modelo base TinyLlama-1.1B-Chat-v1.0 se distribuye bajo Apache 2.0, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (pesos de adaptador PEFT); requiere cargar el modelo base por separado o fusionarlos |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only con 22 capas, dimension oculta 2048, 32 cabezas de atencion con 4 cabezas KV (GQA), FFN SwiGLU con dimension intermedia 5632, vocabulario de 32.000 tokens, RoPE y RMSNorm como normalizacion. El modelo base fue preentrenado con aproximadamente 3 billones de tokens y posteriormente ajustado con SFT (UltraChat) y DPO (UltraFeedback) para dar lugar a la variante "Chat". El adaptador que nos ocupa se apoya en esa variante ya alineada.

No hay informacion sobre el procedimiento de entrenamiento del adaptador: se desconoce el dataset de preferencias, el numero de pares (prompt, elegido, rechazado), la funcion de perdida DPO exacta, la beta utilizada, la tasa de aprendizaje, el numero de pasos, el hardware empleado ni la precision (fp32/fp16/bf16). Tampoco se documenta si el adaptador se aplico solo a las proyecciones de atencion o tambien a las capas FFN. La unica referencia tecnica concreta de la model card es la version de PEFT utilizada (0.13.2) y la etiqueta `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono citado en la plantilla de HuggingFace, no a un articulo sobre el modelo.

## Capacidades

- La model card del adaptador no documenta ninguna capacidad. No hay descripcion de tareas, ni ejemplos de uso, ni transcripciones de salida.
- Generacion de texto y conversacion multi-turno: capacidades heredadas del modelo base TinyLlama-1.1B-Chat-v1.0, sujetas a la modificacion que haya introducido el entrenamiento DPO.
- Razonamiento basico y conocimiento factual: limitado por el tamano del modelo base (1,1 mil millones de parametros) y por su ventana de contexto de 2048 tokens.
- Generacion de codigo: presente de forma marginal en el modelo base; no hay evidencia de que el adaptador la mejore o la preserve.
- Tool calling / function calling: no disponible. El modelo base no fue entrenado especificamente para ello y no se documenta ninguna plantilla de herramientas.
- Uso como agente o razonamiento multi-paso: no disponible y poco realista en un modelo de este tamano sin soporte explicito.
- Capacidades multilingues: no disponibles. No se declaran idiomas soportados; el modelo base esta mayoritariamente entrenado en ingles.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles.
- Personalizacion de estilo o preferencias: es la unica capacidad que el nombre del modelo sugiere, pero no esta verificada ni documentada.

## Casos de uso

- Investigacion sobre DPO y PEFT: el adaptador sirve como punto de partida para reproducir un pipeline de optimizacion por preferencias sobre un modelo pequeno. Es adecuado por su tamano (1,1B), que permite iterar en una unica GPU consumer, siempre que los pesos esten disponibles.
- Comparacion A/B de variantes de alineamiento: fusionando el adaptador con el modelo base y comparandolo contra el base sin modificar, se puede medir de forma cualitativa el efecto del DPO en el estilo de respuesta, con la advertencia de que no existe evaluacion publicada.
- Prototipado en local sin GPU: tras fusionar y cuantizar a GGUF de 4 bits, el modelo resultante ocupa menos de 1 GB y puede ejecutarse en CPU con llama.cpp u Ollama, lo que lo hace util para demos offline y entornos docentes.
- Despliegue en dispositivos de borde: un modelo de 1,1B con contexto de 2048 tokens es candidato para asistentes de texto muy acotados en Raspberry Pi, mini-PC o moviles, siempre que se acepte un rendimiento limitado y se valide la calidad del adaptador.
- Generacion de pares de preferencia sinteticos: el modelo puede emplearse como generador auxiliar de respuestas para construir o aumentar datasets de preferencias en experimentos de alineamiento de bajo coste.
- Material didactico sobre PEFT: sirve como ejemplo practico de estructura de repositorio de adaptador (`adapter_config.json`, pesos safetensors, dependencia de PEFT 0.13.2) en cursos o talleres sobre ajuste eficiente.
- Asistencia de escritura en dominio muy restringido: si el entrenamiento DPO se hizo sobre un estilo concreto (por ejemplo, un tono corporativo o un autor determinado), podria aplicarse a reescritura breve de textos; requiere validacion manual caso por caso por el riesgo de sobreajuste.
- Experimentos de evaluacion de sesgos: al ser un modelo pequeno y un adaptador opaco, resulta util como caso de estudio sobre como los datos de preferencia pueden amplificar sesgos, no como sistema de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye ninguna seccion de evaluacion cumplimentada: ni MMLU, ni HumanEval, ni GSM8K, ni metricas de preferencia (win rate), ni comparaciones frente al modelo base. La etiqueta `arxiv:1910.09700` presente en los tags del repositorio no es un articulo sobre el modelo, sino la referencia de la calculadora de impacto de carbono incluida en la plantilla de HuggingFace (Lacoste et al., 2019), por lo que no debe interpretarse como evidencia de evaluacion.

## Requisitos de hardware

- VRAM en fp16: aproximadamente 2,2 GB solo para los pesos del modelo base, mas unos 45 MB de cache KV para 2048 tokens (22 capas, 4 cabezas KV, dimension de cabeza 64). En la practica, entre 3 y 4 GB de VRAM contando el contexto de ejecucion de CUDA. El adaptador LoRA anade un consumo marginal.
- VRAM en 8 bits: en torno a 1,2-1,5 GB de pesos mas cache KV.
- VRAM en 4 bits (GGUF Q4_K_M): en torno a 0,7-0,9 GB de pesos; el modelo completo cabe holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 de 12 GB, una RTX 4060, una RTX 4090 o una Apple Silicon con 8 GB de memoria unificada pueden ejecutarlo con margen amplio. Las A100 y H100 no aportan ventaja para un modelo de este tamano salvo en escenarios de altisimo batch.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sin fusionar; vLLM y TGI admiten adaptadores LoRA en caliente; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base y exportar a GGUF.
- Latencia y throughput: no hay mediciones publicadas para este modelo ni para este adaptador. Como orden de magnitud orientativo (estimacion, no dato medido) un modelo de 1,1B en fp16 sobre una GPU consumer moderna suele superar ampliamente el centenar de tokens por segundo en generacion single-stream, y bastante menos en CPU pura.

## Comparativa con modelos similares

La comparacion de rendimiento no es posible porque el adaptador no publica ninguna evaluacion. La tabla recoge unicamente caracteristicas objetivas y verificables; los datos de los modelos alternativos proceden de sus model cards publicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| cs329x-personalized-dpo (este modelo) | adaptador sobre 1,1B | no especificado (2048 en el base) | no disponible | repositorio publico, 0 descargas, 0 likes | no disponible |
| TinyLlama-1.1B-Chat-v1.0 (modelo base) | 1,1B | 2048 tokens | Apache 2.0 | ampliamente distribuido, versiones GGUF de la comunidad | metricas publicadas por el autor del modelo base |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens, ampliable con YaRN | Apache 2.0 | ampliamente distribuido | no comparado en esta ficha |
| SmolLM2-1.7B-Instruct | 1,71B | 8192 tokens | Apache 2.0 | ampliamente distribuido | no comparado en esta ficha |

Consideraciones de la comparativa: frente a las alternativas, este adaptador parte de un modelo con la ventana de contexto mas corta (2048 tokens) y no declara licencia, lo que complica su adopcion comercial incluso aunque el modelo base sea Apache 2.0. Tanto Qwen2.5-1.5B-Instruct como SmolLM2-1.7B-Instruct ofrecen contexto mucho mayor y licencias permisivas explicitas, por lo que serian opciones mas seguras para cualquier despliegue real.

## Limitaciones y advertencias

- Model card vacia: todos los campos de documentacion estan sin rellenar (`[More Information Needed]`). No hay informacion sobre datos, hiperparametros, uso previsto ni uso fuera de alcance.
- Sin licencia declarada: el adaptador no especifica licencia. Aunque el modelo base es Apache 2.0, la ausencia de licencia en el adaptador impide asumir derechos de uso comercial sobre los pesos derivados. Se debe contactar con el autor antes de cualquier uso en produccion.
- Repositorio aparentemente vacio: el tamano del repositorio figura como 0.0 GB, lo que sugiere que los pesos del adaptador podrian no estar efectivamente subidos o ser de tamano despreciable. Verificar la presencia de `adapter_model.safetensors` antes de cualquier uso.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" implican que no hay terceros que hayan reproducido los resultados ni detectado fallos.
- Riesgo alto de alucinacion: el modelo base tiene 1,1 mil millones de parametros y su conocimiento factual es limitado; es frecuente que genere afirmaciones plausibles pero incorrectas, especialmente en tareas de conocimiento y matematicas.
- Ventana de contexto corta: 2048 tokens impiden conversaciones largas, analisis de documentos extensos o razonamiento multi-paso con historial amplio.
- Idiomas: no se declaran idiomas soportados. El modelo base esta predominantemente entrenado en ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Sesgos no evaluados: no existe ninguna evaluacion de sesgos, toxicidad ni comportamiento diferencial por subgrupos. Un entrenamiento DPO sobre un dataset de preferencias no documentado puede amplificar los sesgos presentes en esos datos y reducir la diversidad de las respuestas.
- Sobreajuste a preferencias: la optimizacion DPO sin regularizacion suficiente tiende a colapsar la distribucion de salida hacia el estilo preferido, degradando la utilidad general del modelo. No hay datos que permitan descartarlo.
- Capacidades de agente y tool calling no soportadas: no hay plantilla de herramientas ni evidencia de razonamiento multi-paso fiable, por lo que no es adecuado para pipelines de agentes.
- Metadatos anomalos: las fechas del repositorio (creacion y actualizacion en 2026-10-06) no coinciden con un ciclo de publicacion habitual; conviene verificar la procedencia del artefacto.
- Origen inferido: el identificador "cs329x" y el nombre "personalized-dpo" sugieren un trabajo de curso o de investigacion no publicado. Se trata de una inferencia, no de un dato confirmado por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bongaswonga/cs329x-personalized-dpo
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Referencia citada en la model card (estimacion de emisiones de carbono), Lacoste et al.: https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning enlazada en la model card: https://mlco2.github.io/impact
- Libreria PEFT (mencionada como `library_name` y version 0.13.2): https://github.com/huggingface/peft

Referencias externas no citadas en la model card, incluidas por utilidad para el lector:

- Articulo de TinyLlama: https://arxiv.org/abs/2401.02385
- Articulo original de Direct Preference Optimization (DPO), Rafailov et al.: https://arxiv.org/abs/2305.18290
