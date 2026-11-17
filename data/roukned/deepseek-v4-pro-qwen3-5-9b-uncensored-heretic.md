# roukned/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen
DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino derivado de Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario roukned. El modelo base es a su vez un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con un conjunto de aproximadamente 250.000 muestras centradas en matematicas y STEM. Esta variante concreta aplica una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.0.0.dev0 para eliminar el comportamiento de rechazo.

El resultado es un transformer denso de 9.409.813.744 parametros (9B) con licencia Apache 2.0, orientado a generacion de texto, razonamiento estructurado, matematicas y uso de herramientas. La intervencion de decensurado reduce los rechazos de 100/100 en el modelo original a 3/100 en esta version, con una divergencia KL de 0.0422 respecto al modelo de partida, lo que indica una modificacion relativamente contenida de la distribucion de salida.

Es relevante para desarrolladores que necesitan un modelo de 9B desplegable en hardware de consumo, con capacidad de razonamiento multi-paso y sin las restricciones de rechazo del modelo alineado original, aunque con las advertencias de seguridad y responsabilidad que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; tag unsloth sugiere soporte de cuantizacion, sin detalle) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer denso de la familia Qwen3.5 con 9B parametros. El modelo base (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) se entreno mediante destilacion de las respuestas de DeepSeek-V4-Pro en modo "Max Effect", con un conjunto de aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico. La model card del modelo base menciona etapas de SFT, RL y GSPO, asi como evaluacion con MTP (multi-token prediction) y NVFP4. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

Esta variante aplica Heretic v2.0.0.dev0 con ablacion de rangos arbitrarios (ARA) sobre las capas 9 a 24, con los parametros: preserve_good_behavior_weight 0.8264, steer_bad_behavior_weight 0.0003, overcorrect_relative_weight 0.9645 y neighbor_count 12. La tecnica modifica las representaciones internas para suprimir patrones de rechazo preservando en lo posible el comportamiento util, medido por una divergencia KL de 0.0422 frente al original.

## Capacidades
- Generacion de texto conversacional y razonamiento multi-paso con descomposicion estructurada de problemas.
- Razonamiento matematico y resolucion de problemas STEM, foco principal del entrenamiento.
- Uso de herramientas y function calling (tags tool-use y function-calling).
- Capacidades multimodales de entrada imagen-texto segun el tag image-text-to-text del repositorio.
- Soporte multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (tag reasoning) heredado del modelo base.
- Comportamiento decensurado: rechazos reducidos a 3/100 frente a 100/100 del original.
- Transferencia cruzada limitada a programacion y uso de herramientas pese a no recibir SFT especifico de codigo.

## Casos de uso
- Tutoria de matematicas y STEM: el modelo puede descomponer problemas en pasos y explicar el razonamiento, aprovechando las 250.000 muestras de entrenamiento centradas en estas areas.
- Generacion de codigo asistida: aunque no recibio SFT especifico de codigo, la model card reporta pequenas mejoras en programacion por transferencia; util para autocompletado y explicacion de fragmentos en pipelines de CI/CD con function calling.
- Agentes con tool calling: integrable en flujos de agentes que requieran llamadas a funciones y razonamiento multi-paso, gracias a los tags de tool-use y function-calling.
- Asistente conversacional multilingue: cubre seis idiomas (en, zh, ko, ja, es, ru) para atencion al usuario en entornos internacionales.
- Investigacion sobre alineacion y decensurado: sirve como caso de estudio de ablacion ARA con metricas de rechazo y divergencia KL publicadas para comparar tecnicas de supresion de rechazos.
- Procesamiento de documentos con imagen y texto: el tag image-text-to-text permite escenarios de extraccion y razonamiento sobre capturas o figuras, sujeto a validacion empirica.
- Despliegue en hardware de consumo: con 9B parametros y pesos safetensors, es candidato para inferencia local cuantizada en GPUs de gama alta de consumo.

## Benchmarks y rendimiento
La model card solo publica metricas de la intervencion de decensurado, no benchmarks estandar de razonamiento o codigo.

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; para 9B parametros en fp16 se requieren aproximadamente 18-19 GB, y en cuantizacion de 4 bits alrededor de 5-6 GB (estimacion generica, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, una A100 40GB, H100 o RTX 4090 (24 GB) permiten inferencia en fp16; GPUs de 8-12 GB requeririan cuantizacion.
- Cabe en GPU de consumo: probable en RTX 3090/4090 en fp16 y en GPUs de 8 GB con cuantizacion de 4 bits, sin confirmacion oficial.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), y por el tag unsloth es probable soporte de cuantizacion y exportacion a GGUF, aunque no se detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Variante decensurada con ARA; 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Modelo base alineado; 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Version 4B decensurada citada por el autor |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | no disponible | Fine-tune cientifico basado en este modelo |

## Limitaciones y advertencias
- Modelo decensurado: la supresion de rechazos implica que puede generar contenido que el modelo original bloqueaba; requiere filtros y politicas de uso en produccion.
- Riesgo de alucinacion: como todo modelo de 9B, puede inventar datos, especialmente fuera de matematicas y STEM.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Entrenamiento centrado en matematicas y STEM: el rendimiento en codigo, derecho, medicina u otras areas puede ser inferior y no esta medido.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en tareas estandar; la evaluacion debe hacerse de forma propia.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el implementador.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validacion practicamente nulo.
- Idiomas limitados a seis; no se garantiza cobertura de otras lenguas.

## Enlaces
- Hugging Face: https://huggingface.co/roukned/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic: https://heretic-project.org
