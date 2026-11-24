# MorningBreeze/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino de tipo *abliterated* (decensored) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario MorningBreeze. El modelo base es a su vez un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con un sesgo claro hacia razonamiento matematico y STEM. La intervencion heretic elimina los mecanismos de rechazo del modelo original mediante una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 9 a 24.

El modelo conserva la arquitectura de Qwen3.5-9B (transformer denso de aproximadamente 9.400 millones de parametros) y la licencia Apache 2.0 del modelo base. Su relevancia actual reside en dos frentes: por un lado, ofrece capacidades de razonamiento estructurado y resolucion de problemas matematicos en un tamano manejable para hardware de consumo; por otro, la eliminacion de rechazos lo hace atractivo para escenarios de investigacion que requieren respuestas sin filtrado, aunque con los riesgos asociados que se detallan mas abajo.

El modelo se distribuye en formato safetensors (pesos completos, ~19,3 GB de repositorio) y esta etiquetado para text-generation-inference y transformers. Soporta oficialmente seis idiomas (ingles, chino, coreano, japones, espanol y ruso) y conserva las capacidades de tool calling y function calling del modelo base, aunque no se han publicado resultados de benchmarks estandarizados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen3.5-9B, con 9.409.813.744 parametros. El modelo base (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) se entreno mediante destilacion de las respuestas de DeepSeek-V4-Pro en modo Max Effect, con un conjunto de aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico (STEM). La model card menciona las siglas SFT, RL y GSPO como parte del pipeline de entrenamiento del modelo base, asi como MTP (multi-token prediction) evaluado en el release.

Sobre esa base, la version heretic aplica una tecnica de Arbitrary-Rank Ablation (ARA) implementada con Heretic v2.0.0.dev0. Los parametros de la ablacion son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. El resultado, segun la model card, reduce los rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 respecto al modelo original, lo que indica una modificacion relativamente contenida de la distribucion de salida.

## Capacidades

- Generacion de texto y razonamiento estructurado multi-paso, heredado de la destilacion de DeepSeek-V4-Pro.
- Resolucion de problemas matematicos y de ciencia/ingenieria (STEM), con aproximadamente 250.000 muestras de entrenamiento especificas.
- Generacion de codigo: la model card indica pequenas ganancias en programacion y uso de herramientas pese a no haber SFT especifico de codigo.
- Tool calling y function calling, segun las etiquetas del modelo.
- Soporte de agentes y razonamiento multi-paso (etiquetas reasoning y multi-step).
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento explicito (thinking), heredado del modelo base de Qwen3.5.
- Capacidad de vision: la etiqueta image-text-to-text sugiere soporte de entrada de imagenes, aunque no se detalla en la model card.
- Eliminacion de rechazos: responde a peticiones que el modelo original rechazaria (3/100 rechazos frente a 100/100).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparando sus respuestas con las del modelo original y midiendo la divergencia KL reportada (0,0422), lo que facilita analisis controlados de ablacion.
- Tutoria de matematicas y STEM: con ~250.000 muestras de entrenamiento especificas, el modelo es adecuado para descomponer problemas de calculo, fisica o ingenieria paso a paso en un entorno educativo o de autoaprendizaje.
- Generacion de codigo asistida en pipelines internos: su soporte de tool calling y function calling permite integrarlo en flujos de CI/CD o asistentes de IDE para autocompletar, explicar y refactorizar codigo, siempre con revision humana.
- Agentes autonomos de multiples pasos: la combinacion de razonamiento explicito, tool use y contexto multilingue lo hace util para orquestar tareas que requieren planificacion y llamadas a APIs.
- Procesamiento de documentacion tecnica multilingue: al cubrir espanol, ingles, chino, coreano, japones y ruso, puede emplearse para resumir, traducir o extraer informacion de manuales y papers en esos idiomas.
- Analisis de imagenes tecnicas (diagramas, graficos, capturas): la etiqueta image-text-to-text sugiere capacidad de entrada visual, util para extraer datos de figuras en articulos cientificos o interpretar diagramas de arquitectura.
- Despliegue en hardware de consumo para prototipado: con ~9,4B parametros y licencia Apache 2.0, es viable ejecutarlo en una unica GPU de gama alta consumer para experimentacion local sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

La model card unicamente reporta metricas internas del proceso de ablacion, no benchmarks estandarizados:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: ~9,4 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: ~4,7-5,5 GB de pesos, viable en GPUs consumer de 8 GB o superiores (RTX 3060 Ti, RTX 4060, RTX 4070, etc.).
- GPUs recomendadas: A100 40/80 GB, H100 para produccion con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 (16-24 GB) para cuantizacion.
- Cabe en GPU consumer: si, en cuantizacion 4-8 bits; en FP16 requiere 24 GB o mas.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (TGI, etiquetado), vLLM (compatible con arquitectura Qwen3.5), llama.cpp/Ollama mediante conversion a GGUF (no se distribuye GGUF oficial en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,4B | no disponible | Apache 2.0 | Sin rechazos (3/100), destilado STEM |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Modelo base, con rechazos (100/100) |
| Qwen3.5-9B (modelo original de Qwen) | ~9B | no disponible | Apache 2.0 | Base no destilada, alineamiento estandar |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | no disponible | Fine-tune cientifico del mismo autor relacionado |

Los datos de rendimiento comparativo entre estos modelos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de rechazos (abliterated/uncensored) implica que el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtro; no es apto para despliegues publicos sin moderacion externa.
- La divergencia KL de 0,0422 respecto al modelo original indica cambios en la distribucion de salida que pueden degradar capacidades no relacionadas con el razonamiento, especialmente en tareas sensibles.
- Riesgo de alucinacion inherente a los modelos destilados de 9B; la destilacion puede amplificar errores del profesor o introducir patrones de respuesta incorrectos.
- No se han publicado benchmarks estandarizados, por lo que el rendimiento real en MMLU, HumanEval o GSM8K es desconocido.
- La longitud de contexto no esta documentada en la informacion disponible; no se debe asumir la ventana nativa de Qwen3.5 sin verificacion.
- El soporte de vision (etiqueta image-text-to-text) no esta detallado en la model card; conviene validarlo empiricamente antes de usarlo en produccion.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin filtros puede acarrear responsabilidades legales segun la jurisdiccion; se recomienda revision legal.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- Los sesgos especificos no estan documentados; al derivar de Qwen3.5 y DeepSeek-V4-Pro, hereda los sesgos de ambos, potencialmente amplificados por la ablacion.

## Enlaces

- Hugging Face: https://huggingface.co/MorningBreeze/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico del mismo autor: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (proyecto de ablacion): https://heretic-project.org
