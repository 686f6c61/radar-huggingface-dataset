# NZM0/gemma-4-E2B-it-webgpu-w4

## Resumen

Este repositorio contiene una distribución orientada a navegador del modelo Gemma 4 E2B-it, derivada del checkpoint oficial de Google DeepMind `google/gemma-4-E2B-it-qat-w4a16-ct`. El autor, NZM0, ha adaptado el modelo para su ejecución en entornos JavaScript mediante WebGPU, eliminando los componentes de visión y audio del checkpoint original y cuantizando adicionalmente el tensor de embeddings por capa (PLE) a 4 bits. El resultado es un paquete de aproximadamente 2,96 GiB pensado para inferencia local en el navegador, sin necesidad de servidores externos.

La relevancia de esta distribución radica en que permite ejecutar un modelo de la familia Gemma 4 directamente en el cliente, con privacidad total y sin latencia de red. Está diseñada específicamente para el runtime JavaScript `gemma4-js` del mismo autor, y no es compatible con las APIs estándar de Transformers, vLLM o Compressed Tensors. Se trata de una versión solo texto, con licencia Apache 2.0, que conserva los pesos del modelo base cuantizados con QAT W4A16 y añade una cuantización W4 adicional para el tensor PLE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 E2B-it (basada en transformer, detalles específicos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QAT W4A16 (del modelo base) y W4 simétrico con signo para el tensor PLE (rango [-7,7], grupo de 32, escala BF16, sin zero point) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `core.safetensors` y archivos binarios personalizados (`ple-w4/*.bin`) |

## Arquitectura y entrenamiento

La distribución se basa en el checkpoint oficial `google/gemma-4-E2B-it-qat-w4a16-ct` de Google DeepMind, que ya incorpora cuantización QAT (Quantization-Aware Training) con pesos de 4 bits y activaciones de 16 bits. El autor de este repositorio no ha realizado ningún entrenamiento o fine-tuning adicional; solo ha modificado la estructura del checkpoint para adaptarlo a un formato de carga eficiente en navegador.

Las modificaciones principales incluyen la eliminación de los pesos específicos de visión y audio, la supresión de un `lm_head.weight` duplicado que no usa el runtime, y la cuantización del tensor `model.language_model.embed_tokens_per_layer.weight` (PLE) de BF16 a W4 simétrico con signo. El tensor PLE original tiene forma `[262144, 8960]` y ocupaba aproximadamente 4,38 GiB en BF16; tras la cuantización W4 con escalas BF16, ocupa unos 1,23 GiB. El tensor se divide en 64 shards independientemente cargables para permitir una carga progresiva en el navegador.

## Capacidades

- Generación de texto: el modelo es capaz de producir respuestas de texto coherentes, aunque no se han publicado benchmarks específicos para esta distribución.
- Solo texto: se han eliminado los componentes de visión y audio del checkpoint original, por lo que no admite entradas multimodales.
- Ejecución en navegador: diseñado para funcionar con WebGPU, con soporte para carga local y remota desde Hugging Face.
- Compatibilidad con runtime JavaScript: pensado para el proyecto `gemma4-js`, que incluye referencias para TensorFlow.js WebGL, WebGPU/WGSL y Node.js.
- Privacidad: al ejecutarse localmente, no envía datos a servidores externos.

## Casos de uso

- Asistente de chat privado en el navegador: los usuarios pueden interactuar con el modelo sin que sus conversaciones salgan del dispositivo, ideal para entornos con requisitos estrictos de privacidad.
- Demostraciones y prototipos web: los desarrolladores pueden integrar el modelo en páginas web para crear aplicaciones de generación de texto sin backend, reduciendo costes de infraestructura.
- Educación e investigación en inferencia en el edge: sirve como referencia para estudiar técnicas de cuantización y optimización de modelos en WebGPU, gracias a su formato de shards y su documentación detallada.
- Herramientas de productividad local: generación de borradores, resúmenes o reescritura de texto directamente en el navegador, sin necesidad de conexión a internet.
- Evaluación de modelos en el cliente: permite comparar el rendimiento de Gemma 4 E2B en diferentes hardware mediante el runtime incluido, que ofrece funciones de perfilado y benchmarking.
- Aplicaciones educativas de IA: los estudiantes pueden experimentar con un modelo de lenguaje de última generación en un entorno controlado y sin dependencias de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan datos de latencia o throughput para la inferencia en WebGPU.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño total del modelo es de aproximadamente 2,96 GiB, pero la memoria necesaria durante la inferencia depende del runtime y de la gestión de buffers en WebGPU.
- GPU recomendadas: cualquier GPU compatible con WebGPU, incluidas las integradas modernas (p. ej., Intel Iris Xe, AMD Radeon integrada) y discretas (NVIDIA, AMD, Apple Silicon). No se especifican modelos concretos.
- Compatibilidad con consumer GPU: sí, al estar orientado a navegador, se espera que funcione en GPUs de consumo con soporte WebGPU.
- Opciones de despliegue: el runtime `gemma4-js` incluye referencias para TensorFlow.js WebGL, WebGPU/WGSL y Node.js. No es compatible con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos. El rendimiento dependerá del hardware y de la implementación WGSL utilizada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. El repositorio no proporciona datos de parámetros, contexto ni rendimiento, y la distribución es específica para un runtime concreto. Se puede mencionar que existen otras iniciativas de inferencia en navegador, como el proyecto `gemma4-webgpu` de Tyler Straub (que utiliza Q4_K_M) o el espacio `webml-community/Gemma-4-WebGPU`, pero no se dispone de métricas comparables.

## Limitaciones y advertencias

- No es un checkpoint estándar de Transformers: `AutoModel.from_pretrained()` no puede cargar esta distribución. Solo funciona con el runtime `gemma4-js`.
- Solo texto: se han eliminado las capacidades de visión y audio del modelo base, por lo que no se pueden procesar imágenes ni audio.
- Sin datos de rendimiento: no se han publicado benchmarks ni métricas de calidad, por lo que no se puede evaluar su precisión frente a otras versiones de Gemma 4.
- Posibles sesgos del modelo base: al ser un derivado del checkpoint de Google DeepMind, puede heredar sesgos presentes en los datos de entrenamiento originales, aunque no se documentan aquí.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o no verificado. No se recomienda su uso en aplicaciones críticas sin supervisión humana.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Dependencia de WebGPU: requiere un navegador y hardware con soporte WebGPU; en dispositivos sin esta tecnología, el modelo no podrá ejecutarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NZM0/gemma-4-E2B-it-webgpu-w4
- Runtime JavaScript (código fuente): https://github.com/NZM0/gemma4-js
- Página oficial de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Proyecto gemma4-webgpu de Tyler Straub: https://tylerstraub.github.io/gemma4-webgpu/ y https://github.com/tylerstraub/gemma4-webgpu
- Espacio HuggingFace webml-community/Gemma-4-WebGPU: https://huggingface.co/spaces/webml-community/Gemma-4-WebGPU
- Demo QuantML Gemma 4 E2B: https://gemma4.quantml.org/
