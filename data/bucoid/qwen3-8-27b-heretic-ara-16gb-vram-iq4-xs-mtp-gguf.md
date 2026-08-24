# Bucoid/Qwen3.8-27B-Heretic-Ara-16GB-VRAM-IQ4-XS-MTP-GGUF

## Resumen

Qwen3.8-27B-Heretic-Ara-IQ4-XS-16GB-VRAM-GGUF es una cuantizacion GGUF de 4 bits (IQ4_XS) del modelo Qwen3.8-27B, preparada por el usuario Bucoid para ejecutarse en tarjetas graficas con 16 GB de VRAM. El modelo base, Qwen3.8-27B, es la variante densa de 27 000 millones de parametros de la familia Qwen3.8, que emplea una arquitectura hibrida de atencion: solo 16 de sus 64 capas usan atencion completa, mientras que las otras 48 usan atencion lineal con estado recurrente constante. Esta cuantizacion pesa entre 12,7 y 13,3 GiB segun la version, lo que permite cargarla en GPUs de 16 GB.

La particularidad de esta version es que aplica la tecnica Heretic Arbitrary-Rank Ablation para eliminar el rechazo de contenido (uncensoring). El autor proporciona una comparativa detallada de calidad de cuantizacion frente al BF16 original y frente a una cuantizacion Q3_K_M del mismo modelo, con metricas de perplexity, divergencia KL y consistencia top-1. Ademas, el modelo incluye una version con MTP (Multi-Token Prediction) que acelera la decodificacion, aunque reduce la longitud de contexto soportada en 16 GB de VRAM de 110k a 80k tokens.

La relevancia de esta ficha radica en que combina un modelo de ultima generacion (Qwen3.8-27B) con una cuantizacion optimizada para hardware de consumo, y una capa de desbloqueo de seguridad, lo que lo hace atractivo para desarrolladores que buscan ejecutar un LLM localmente sin censura y con contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 16 capas con atencion completa (full attention) y 48 capas con atencion lineal (recurrent state) |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 110k tokens (sin MTP) / 80k tokens (con MTP) en 16 GB VRAM |
| Tipos de cuantizacion | IQ4_XS (4 bits), tambien disponible en Q3_K_M (comparacion) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con y sin MTP) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B usa una arquitectura hibrida de atencion: de las 64 capas totales, solo 16 ejecutan atencion completa (con un intervalo de 4), mientras que las 48 restantes emplean atencion lineal con un estado recurrente constante. Este diseno reduce el coste computacional y la memoria necesaria para contextos largos, manteniendo la calidad de atencion en las capas criticas. El modelo fue entrenado por Alibaba Cloud, aunque los detalles concretos del dataset y el proceso de entrenamiento no se proporcionan en la informacion disponible.

La version de Bucoid aplica dos modificaciones sobre el modelo base:
1. **Cuantizacion IQ4_XS**: esquema de 4 bits que preserva mejor la distribucion de pesos que una cuantizacion Q3_K_M, como demuestran las metricas de perplexity y KL en la tabla de comparacion.
2. **Heretic Arbitrary-Rank Ablation**: tecnica que elimina el rechazo de seguridad del modelo original, produciendo una version sin restricciones de contenido.

La cuantizacion fue optimizada con imatrix (importance matrix) y se ofrecen dos variantes: una estandar y otra con MTP (Multi-Token Prediction), que predice varios tokens a la vez para acelerar la inferencia a costa de un mayor uso de memoria.

## Capacidades

- **Generacion de texto**: produce texto coherente y contextualmente relevante en multiples idiomas, con capacidad para mantener conversaciones multi-turno.
- **Razonamiento y matematicas**: al heredar las capacidades del modelo Qwen3.8-27B, puede resolver problemas de logica y matematicas de nivel avanzado.
- **Generacion de codigo**: puede escribir y depurar codigo en diversos lenguajes, aunque no se especifican benchmarks especificos.
- **Soporte de tool calling**: el modelo base soporta function calling, aunque no se confirma si esta capacidad se mantiene intacta tras la cuantizacion y la ablacion.
- **Capacidad de razonamiento multi-paso**: puede descomponer problemas complejos en pasos intermedios, especialmente en modo de pensamiento (thinking mode), aunque la actualizacion del 22 de agosto corrigio problemas en este modo.
- **Contexto largo**: gracias a la arquitectura hibrida y la cuantizacion, soporta hasta 110k tokens de contexto en 16 GB de VRAM, lo que permite procesar documentos extensos.
- **Sin restricciones de contenido**: la ablacion de seguridad elimina los filtros de contenido, permitiendo generacion sin censura en temas sensibles.

## Casos de uso

- **Ejecucion local en hardware de consumo**: ideal para desarrolladores que quieren ejecutar un LLM de 27B en una GPU de 16 GB (como RTX 4080, 4090 o 3090) sin depender de APIs externas. La cuantizacion IQ4_XS reduce el modelo a ~13 GiB, dejando margen para la ventana de contexto.
- **Prototipado rapido de aplicaciones de IA**: al ser un modelo GGUF, se puede cargar con llama.cpp, Ollama, LM Studio o vLLM, permitiendo iterar sobre ideas de productos sin necesidad de infraestructura cloud.
- **Generacion de contenido creativo sin restricciones**: la ablacion de seguridad permite explorar narrativas, dialogos y escenarios que los modelos alineados rechazarian. Es util para escritores y creadores de contenido que necesitan experimentar con temas controvertidos.
- **Investigacion sobre alineacion y seguridad**: el modelo permite estudiar el impacto de la eliminacion de la capa de rechazo en el comportamiento del modelo, comparando las respuestas con la version original.
- **Procesamiento de documentos largos**: con 110k tokens de contexto, puede resumir o extraer informacion de libros completos, expedientes o documentacion tecnica extensa en una sola pasada.
- **Asistente de codigo local**: integrable en entornos de desarrollo como VSCode a traves de plugins que usan llama.cpp, para autocompletar y explicar codigo sin enviar datos a la nube.

## Benchmarks y rendimiento

La informacion proporcionada no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). La tabla siguiente muestra los datos de calidad de cuantizacion que el autor del modelo publico en la model card, comparando la cuantizacion IQ4_XS con la base BF16 y con la Q3_K_M:

| Metrica | BF16 (base) | IQ4_XS-3.0 | IQ4_XS-2.0 | Q3_K_M |
|---|---|---|---|---|
| Tamano de archivo | 50,1 GiB | 13 GiB (con MTP 13,3) | 12,7 GiB | 12,4 GiB |
| Precision de cuantizacion | BF16 | IQ4_XS (4-bit) | IQ4_XS (4-bit) | Q3_K_M (~3-bit) |
| Perplexity media | 7,008 ± 0,045 | 7,047 ± 0,045 | 7,103 ± 0,046 | 7,404 ± 0,049 |
| Correlacion PPL con base | 100% | 99,34% | 99,26% | 98,31% |
| KL divergencia media | 0 | 0,0278 ± 0,0003 | 0,0334 ± 0,0003 | 0,0760 ± 0,0006 |
| KL divergencia maxima | 0 | 18,32 | 15,09 | 17,87 |
| Top-1 agreement | 100% | 92,87% ± 0,067% | 91,62% ± 0,072% | 88,15% ± 0,084% |
| Cambio de probabilidad media (Δp) | 0% | -0,243% ± 0,012% | -0,306% ± 0,013% | -0,490% ± 0,020% |
| Cambio RMS de probabilidad | 0% | 4,538% ± 0,045% | 4,952% ± 0,041% | 7,560% ± 0,054% |

Estos datos muestran que la cuantizacion IQ4_XS conserva una alta fidelidad respecto al modelo original (correlacion PPL > 99%, top-1 agreement > 92%), con una degradacion notablemente menor que la Q3_K_M.

## Requisitos de hardware

- **VRAM necesaria**: 16 GB para cargar el modelo completo con contexto largo. Con la variante sin MTP, soporta hasta 110k tokens de contexto en una GPU de 16 GB sin VRAM reservada para la tarjeta de video. Con MTP activado, el contexto se reduce a 80k tokens.
- **GPUs recomendadas**: cualquier GPU con 16 GB de VRAM o mas, como NVIDIA RTX 3090, RTX 4090, RTX 4070 Ti Super, o GPUs de datacenter como A100 (40 GB) o H100 (80 GB) para mayor contexto y velocidad.
- **Compatibilidad con hardware de consumo**: si, es el objetivo del modelo. Una RTX 4060 Ti de 16 GB o una RTX 3080 de 16 GB pueden ejecutarlo, aunque con menor velocidad que las GPUs de gama alta.
- **Opciones de despliegue**: llama.cpp (con soporte de cuantizacion IQ4_XS), Ollama (via importacion de GGUF), LM Studio, vLLM (para despliegues mas profesionales) y cualquier otro backend compatible con GGUF.
- **Latencia y throughput**: no se proporcionan datos especificos de tokens por segundo. Se espera que la variante con MTP sea mas rapida en la decodificacion, pero a costa de un mayor uso de VRAM y menor contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso comercial |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 26,9B | 128k (nativo) | BF16 | Apache 2.0 | Si |
| Qwen3.8-27B-Heretic-Ara-IQ4_XS | 26,9B | 110k (16GB) | IQ4_XS | Apache 2.0 | Si |
| Qwen3.8-27B-Heretic-Ara-Q3_K_M | 26,9B | ~110k (16GB) | Q3_K_M | Apache 2.0 | Si |
| Qwen2.5-32B (referencia) | 32B | 128K | BF16 | Apache 2.0 | Si |

La comparativa directa con el Q3_K_M del mismo modelo muestra que la IQ4_XS tiene una perplexity mas baja (7,05 vs 7,40) y una mayor concordancia con el modelo base (99,34% vs 98,31% de correlacion PPL), con un coste de solo 0,6 GiB adicionales. Frente a Qwen3.8-27B en BF16, la version cuantizada pierde menos de un 1% de fidelidad, lo que la hace adecuada para produccion en hardware limitado.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser una cuantizacion del modelo base, hereda los sesgos y limitaciones de Qwen3.8-27B. La cuantizacion puede aumentar ligeramente la probabilidad de errores factuales.
- **Riesgo de contenido inapropiado**: la ablacion Heretic elimina el rechazo de seguridad. El modelo puede generar contenido ofensivo, ilegal o perjudicial sin restricciones. No debe usarse en aplicaciones donde el control de contenido sea necesario sin una capa adicional de filtrado.
- **Limitaciones de contexto**: la ventana de 110k tokens se logra solo en configuraciones especificas (16 GB de VRAM sin uso como tarjeta grafica principal). En configuraciones con menos VRAM o con otras aplicaciones usando la GPU, el contexto efectivo sera menor.
- **Problemas de pensamiento**: el autor menciona que se corrigieron problemas en el modo de razonamiento (thinking) en la actualizacion del 22 de agosto. Aun asi, el modo de pensamiento puede ser inestable en contextos largos.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, el modelo base Qwen3.8-27B puede tener restricciones adicionales de uso comercial en ciertos paises (por ejemplo, China). Es recomendable revisar la politica de Qwen.
- **Sin garantia de rendimiento**: la comparacion de calidad de cuantizacion se basa en metricas internas del autor y no en benchmarks estandarizados. Los resultados en tareas reales pueden variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bucoid/Qwen3.8-27B-Heretic-Ara-16GB-VRAM-IQ4-XS-MTP-GGUF
- Repositorio de archivos (tree): https://huggingface.co/Bucoid/Qwen3.8-27B-Heretic-Ara-16GB-VRAM-IQ4-XS-MTP-GGUF/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de cuantizaciones GGUF de Qwen3.8-27B: https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/
- Recetas de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Blog de AMD sobre ejecucion de Qwen3.8-27B en AMD Ryzen AI Max: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
