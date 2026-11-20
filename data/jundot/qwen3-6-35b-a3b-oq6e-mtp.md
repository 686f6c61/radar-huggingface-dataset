# Jundot/Qwen3.6-35B-A3B-oQ6e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ6e-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, publicado por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). El modelo base es un modelo de lenguaje y vision con arquitectura de mezcla de expertos (MoE) que combina 35.951.822.704 parametros totales con aproximadamente 3.000 millones de parametros activos por token, e incorpora un layout hibrido de capas Gated DeltaNet y Gated Attention. Esta version cuantizada conserva el backbone de lenguaje, el codificador de vision y la cabeza de prediccion multi-token (MTP).

La relevancia de esta ficha radica en que ofrece el modelo completo en un checkpoint de 30,4 GB (28,3 GiB) con un promedio efectivo de 6,762 bits por peso, lo que lo hace viable en equipos Apple Silicon con memoria unificada de 32 GB o superior. La cuantizacion no es uniforme: asigna bits segun la sensibilidad medida de cada capa, con un 91,8 % de los pesos en 6 bits afines (grupo 64), un 6,5 % en 8 bits (grupo 64) y un 1,3 % en BF16, lo que reduce el error respecto a una cuantizacion homogenea del mismo tamano.

El modelo esta pensado para inferencia local en el ecosistema MLX de Apple, con capacidades de image-text-to-text, conversacion y tool calling heredadas del modelo base. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales, aunque el autor no documenta los idiomas soportados ni publica benchmarks propios de la version cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con capas Gated DeltaNet y Gated Attention; incluye codificador de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | Aproximadamente 3B (segun denominacion A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ6e: affine 6-bit grupo 64 (91,838 % de pesos), affine 8-bit grupo 128 (0,359 %), affine 8-bit grupo 64 (6,474 %), BF16 (1,329 %); promedio efectivo 6,762 bits/peso en el checkpoint completo y 6,645 en el backbone |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (library_name: mlx), cuantizacion affine |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos con un layout hibrido que alterna capas Gated DeltaNet y Gated Attention. Los 35.952 millones de parametros se reparten en 34.661 millones en el backbone de lenguaje, 447 millones en el codificador de vision y 845 millones en la cabeza de prediccion multi-token (MTP). La activacion de aproximadamente 3.000 millones de parametros por token reduce el coste computacional de la inferencia manteniendo la capacidad del modelo completo. La presencia de un codificador de vision confirma que el modelo acepta entradas de imagen y texto.

La version de Jundot no reentrena el modelo: aplica cuantizacion de precision mixta con oQ (oMLX v0.8.0). El proceso asigna bits por sensibilidad de capa medida, redondea cada grupo con una matriz de importancia construida sobre 128 muestras de 512 tokens y realiza un reajuste de escala y sesgo por minimos cuadrados ponderados. La actualizacion del 19 de noviembre de 2026 re-cuantizo el checkpoint con el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantizacion al mismo tamano y velocidad. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno en el pipeline image-text-to-text.
- Procesamiento de imagenes combinadas con texto gracias al codificador de vision de 447 millones de parametros.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.6-35B-A3B (sin benchmarks publicados en esta ficha).
- Prediccion multi-token (MTP) mediante la cabeza dedicada de 845 millones de parametros, orientada a acelerar la decodificacion especulativa.
- Soporte de tool calling y function calling segun las capacidades del modelo base (no verificado en la model card de la cuantizacion).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento extendido (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 28,3 GiB cabe en equipos con 32 GB o 64 GB de memoria unificada, lo que permite ejecutar un modelo de 35B con vision en un Mac Studio o MacBook Pro de gama alta sin GPU dedicada.
- Asistentes conversacionales con entrada de imagen: el codificador de vision permite construir aplicaciones de descripcion de capturas, extraccion de datos de documentos escaneados o respuesta a preguntas sobre imagenes en local.
- Prototipado de agentes con tool calling: la cabeza MTP y el soporte del modelo base para function calling permiten montar agentes que encadenan llamadas a APIs en entornos de desarrollo sin depender de la nube.
- Generacion de codigo en flujos de desarrollo: integrable en editores o pipelines locales mediante MLX, con la ventaja de mantener el codigo en la maquina del desarrollador.
- Evaluacion comparativa de cuantizaciones: al conservar el backbone, el codificador de vision y la MTP en un unico checkpoint, sirve para medir el impacto de la cuantizacion mixta frente al modelo base en tareas de razonamiento y vision.
- Investigacion sobre decodificacion especulativa: la inclusion explicita de la cabeza MTP permite experimentar con tecnicas de prediccion multi-token en el ecosistema MLX.
- Despliegue de bajo coste en laboratorio: al no requerir GPUs de datacenter, facilita la experimentacion con un MoE de 35B en estaciones de trabajo Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta metricas de cuantizacion (bits por peso y desglose de almacenamiento), no resultados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 28,3 GiB para los pesos en el formato oQ6e; se recomienda al menos 32 GB de memoria unificada para dejar margen a la cache KV y al contexto.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3 y M4, especialmente variantes Pro, Max y Ultra). No es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en equipos Apple con 32 GB o mas de memoria unificada; no esta pensado para GPUs NVIDIA de consumo sin conversion previa del formato.
- Opciones de despliegue: MLX (libreria nativa) y oMLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor afirma que el refinamiento oQe mantiene el mismo tamano y velocidad que la version anterior, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ6e-mtp (este) | 35,952B totales, ~3B activos | no disponible | MLX safetensors 6,762 bits/peso | Apache-2.0 | Incluye vision y cabeza MTP; 28,3 GiB |
| Qwen/Qwen3.6-35B-A3B (base) | 35,952B totales, ~3B activos | no disponible | safetensors BF16 (presumiblemente) | Apache-2.0 | Modelo original sin cuantizar; mayor huella de memoria |
| Otras cuantizaciones MLX del mismo base | 35,952B totales | no disponible | MLX (4-bit, 8-bit, etc.) | Apache-2.0 | No disponibles en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de precision respecto al modelo base; el autor no publica evaluaciones que cuantifiquen esa degradacion.
- No se documentan los idiomas soportados ni el comportamiento multilingue del checkpoint.
- No se dispone de la longitud de contexto del modelo base ni de la version cuantizada, lo que impide planificar aplicaciones con ventanas largas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no mitigado ni evaluado en esta ficha.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de las dependencias de MLX/oMLX.
- El formato MLX limita el despliegue a hardware Apple; no es directamente portable a CUDA sin conversion.
- La version actual reemplaza a checkpoints anteriores del mismo autor; descargas antiguas pueden tener mayor error de cuantizacion.
- No hay garantias de soporte ni mantenimiento por parte del autor mas alla de las actualizaciones publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio oQ/oMLX: https://github.com/jundot/omlx
- Pull request oQe: https://github.com/jundot/omlx/pull/4930
- Pull request refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
