# chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ8e

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ8e es una variante "abliterated" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante, chevron7, ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original mediante una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El modelo base concentra su senal de entrenamiento supervisado en matematicas y resolucion de problemas STEM, con aproximadamente 250.000 muestras, preservando la eficiencia y desplegabilidad de la clase de 9B parametros. Esta variante mantiene esa base pero anula los mecanismos de seguridad, reduciendo los rechazos de 100/100 a 3/100 en la evaluacion del autor, con una divergencia KL de 0.0422 respecto al original.

Es relevante ahora porque combina un modelo de razonamiento compacto con capacidades de vision (pipeline image-text-to-text), tool calling y soporte multilingue, todo bajo licencia Apache 2.0. La variante decensored interesa a quienes necesitan un modelo sin restricciones de rechazo para investigacion, generacion creativa o escenarios donde los filtros de seguridad interfieren con tareas legitimas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), fine-tune de razonamiento con destilacion |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (tag del repo); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, una arquitectura transformer densa de aproximadamente 9.400 millones de parametros. El entrenamiento combina destilacion de DeepSeek-V4-Pro en modo Max Effect con un pipeline de post-entrenamiento que incluye SFT, RL y GSPO (Group Sequence Policy Optimization), segun los tags del repositorio. El corpus de entrenamiento supervisado se centra en matematicas y STEM, con aproximadamente 250.000 muestras, y el autor reporta ganancias pequenas en programacion y uso de herramientas pese a no incluir datos SFT especificos de codigo.

La innovacion principal de esta variante concreta es la aplicacion de Heretic v2.0.0.dev0 con parametros ARA: ablacion entre las capas 9 y 24, con pesos de preservacion de comportamiento bueno de 0.8264, de redireccion de comportamiento malo de 0.0003, de correccion excesiva relativa de 0.9645 y un neighbor_count de 12. Esta tecnica modifica los pesos del modelo para suprimir la tendencia a rechazar peticiones, manteniendo una divergencia KL baja (0.0422) respecto al modelo original. El modelo base tambien menciona evaluaciones con MTP (Multi-Token Prediction) y NVFP4.

## Capacidades

- Generacion de texto y razonamiento estructurado con descomposicion de problemas en multiples pasos.
- Razonamiento matematico y resolucion de problemas STEM, area principal del entrenamiento.
- Capacidades de vision: el pipeline es image-text-to-text, por lo que acepta imagenes como entrada.
- Tool calling y function calling, segun los tags del repositorio.
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (reasoning) heredado del proceso de destilacion.
- Comportamiento decensored: rechaza solo 3 de cada 100 peticiones en la evaluacion del autor, frente a 100/100 del original.
- Generacion conversacional multi-turno.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar el efecto de la ablacion de rechazos comparando directamente con el modelo original, con una metrica de divergencia KL de 0.0422 que cuantifica el coste de la modificacion.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin que el modelo se niegue, gracias a la reduccion de rechazos a 3/100.
- Tutoria de matematicas y STEM: el entrenamiento con 250.000 muestras centradas en estas areas lo hace adecuado para explicar problemas paso a paso en entornos educativos.
- Analisis de documentos tecnicos con imagenes: al soportar image-text-to-text, puede extraer y razonar sobre diagramas, graficos o formulas en capturas y PDFs renderizados.
- Automatizacion con agentes y tool calling: integrable en pipelines que requieran llamadas a funciones externas, con soporte de razonamiento multi-paso para planificar secuencias de acciones.
- Atencion al cliente multilingue: cubre seis idiomas (en, zh, ko, ja, es, ru) para conversaciones multi-turno en mercados internacionales.
- Generacion de codigo asistida: aunque sin SFT especifico de codigo, el autor reporta transferencia cruzada positiva desde el entrenamiento STEM, util para scripts y tareas de programacion cientifica.

## Benchmarks y rendimiento

El autor solo publica metricas de comportamiento (rechazos y divergencia KL) y no resultados en benchmarks academicos estandar como MMLU, HumanEval o GSM8K.

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 10.4 GB en 8-bit, por lo que se necesita al menos ~11-12 GB de VRAM para cargar los pesos en esa cuantizacion, mas memoria para el contexto y el KV cache.
- En FP16/BF16, los 9.400 millones de parametros requieren aproximadamente 19-20 GB de VRAM solo para pesos.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; para 8-bit, una RTX 4080 (16 GB) o RTX 3090 (24 GB) puede ser suficiente.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en FP16, y en GPUs de 16 GB o mas con cuantizacion de 8-bit o inferior.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), y previsiblemente vLLM, llama.cpp u Ollama si se generan pesos GGUF, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ8e | 9.4B | No disponible | Apache 2.0 | Variante decensored con 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9.4B | No disponible | Apache 2.0 | Modelo original, 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | No disponible | No disponible | Version 4B decensored del mismo linaje |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9.4B | No disponible | No disponible | Fine-tune cientifico basado en este modelo |

## Limitaciones y advertencias

- La ablacion de rechazos elimina los filtros de seguridad del modelo original: puede generar contenido danino, ilegal o eticamente problematico sin negarse. No es adecuado para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion en areas fuera de matematicas y STEM, ya que el entrenamiento supervisado se concentro en esas disciplinas.
- La divergencia KL de 0.0422 indica que la ablacion altera el comportamiento respecto al original; pueden aparecer degradaciones sutiles en tareas no evaluadas.
- No se han publicado resultados en benchmarks academicos, por lo que el rendimiento real en MMLU, HumanEval o GSM8K es desconocido.
- La longitud de contexto no esta documentada en la informacion disponible.
- El modelo base es un fine-tune destilado de un modelo propietario (DeepSeek-V4-Pro); las condiciones de uso de las salidas de destilacion pueden estar sujetas a las politicas del proveedor original, aunque la licencia declarada es Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria; el soporte y mantenimiento no estan garantizados.
- Aunque soporta seis idiomas, el entrenamiento principal parece centrado en ingles y chino; el rendimiento en espanol, coreano, japones y ruso no esta verificado.

## Enlaces

- Hugging Face: https://huggingface.co/chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ8e
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B decensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic: https://heretic-project.org
