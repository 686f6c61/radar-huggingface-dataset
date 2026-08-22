# majentik/Ornith-1.5-35B-A3B-MLX-5bit

## Resumen

Ornith-1.5-35B-A3B-MLX-5bit es una cuantizacion en 5 bits (affine, group size 64) del modelo multimodal Ornith-1.5-35B-A3B, desarrollado por Ornith AI y convertido a formato MLX por el usuario majentik para su ejecucion eficiente en silicio de Apple. El modelo base es un mixture-of-experts de 35 000 millones de parametros totales que activa aproximadamente 3 000 millones por token, con arquitectura derivada de Qwen3 MoE y capacidades de imagen-texto.

Esta variante cuantizada mantiene la torre de vision y el proyector en BF16, mientras que la torre de texto se cuantiza a 5 bits, lo que reduce significativamente el espacio en disco y la memoria necesaria para inferencia local en equipos Apple. Su licencia MIT permite uso comercial sin restricciones, y el repo incluye un "smoke gate" que verifica la coherencia de la generacion tras la conversion.

La relevancia de este modelo radica en que ofrece capacidades de razonamiento y codificacion agente de alto nivel en un formato compacto y desplegable en hardware de consumo. Segun la informacion disponible, el modelo base supera a modelos similares como Qwen 3.6-35B y Gemma 4-31B en tareas de codificacion agente, aunque no se publican numeros concretos de benchmarks en la version cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (qwen3_5_moe) multimodal (imagen-texto) |
| Parametros totales | 35 000 000 000 (modelo base); 6 948 351 856 en safetensors cuantizados |
| Parametros activos | ~3 000 000 000 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit affine (group size 64); tambien 2-bit, 3-bit, 6-bit, 8-bit y MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors cuantizados) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B utiliza una arquitectura mixture-of-experts derivada de la familia Qwen3, con aproximadamente 3 000 millones de parametros activos por token. Esta configuracion permite que el modelo ofrezca rendimiento de modelos densos mucho mayores con un coste computacional reducido. La version cuantizada aqui documentada conserva la torre de vision y el proyector en FP16, mientras que la torre de texto se cuantiza a 5 bits con grupo de cuantizacion de 64 elementos, lo que reduce el peso del modelo a aproximadamente 6 950 millones de parametros en los archivos safetensors.

No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso de alineacion (RLHF, DPO, etc.) del modelo base. La model card de la version cuantizada indica que los benchmarks estan pendientes de publicacion ("benchmarks pending"). La cuantizacion se realizo con mlx-lm 0.31.3, y el modelo paso un control de coherencia determinista de generacion de 48 tokens antes de su publicacion.

## Capacidades

- Generacion de texto y razonamiento complejo, con soporte de modos de razonamiento paso a paso.
- Comprension de imagenes (capacidad multimodal), ya que el pipeline es image-text-to-text.
- Codificacion de software y tareas de agente: segun la informacion de la busqueda web, supera a Qwen 3.6-35B en benchmarks de codificacion y agente, y a Gemma 4-31B y Muse Glimmer-30B en tareas de codificacion agente.
- Soporte de tool calling y flujos de trabajo basados en herramientas, segun la descripcion de la web de Baseten.
- Capacidad de razonamiento multi-paso y de agente, optimizada para entornos de desarrollo de software.

## Casos de uso

- Asistente de codificacion local en macOS: el modelo puede ejecutarse en Apple Silicon con mlx-lm, ofreciendo autocompletado y generacion de codigo en entornos de desarrollo sin conexion a la nube.
- Agente de desarrollo de software: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar parches, revisar codigo o resolver issues automaticamente.
- Analisis de imagenes y documentos tecnicos: al ser multimodal, puede describir diagramas, capturas de pantalla o esquemas de arquitectura y convertirlos en codigo o documentacion.
- Prototipado rapido de aplicaciones: su tamano reducido en MLX permite iterar rapidamente en equipos Apple, generando esqueletos de aplicaciones o scripts de prueba.
- Automatizacion de tareas de razonamiento: puede utilizarse para tareas de logica, planificacion o analisis de datos estructurados en entornos locales.
- Despliegue en edge o equipos personales: gracias a su cuantizacion 5-bit y a que activa solo ~3B parametros, cabe en GPU de consumo y en Apple Silicon, permitiendo inferencia local sin latencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta version cuantizada. La model card indica que los benchmarks estan pendientes ("benchmarks pending"). La busqueda web menciona que el modelo base supera a Qwen 3.6-35B en todos los benchmarks de codificacion y agente, y a Gemma 4-31B y Muse Glimmer-30B por amplios margenes en codificacion agente, pero no se proporcionan numeros concretos. Se recomienda consultar la pagina del modelo base (ornith-ai/Ornith-1.5-35B-A3B) para datos actualizados cuando se publiquen.

## Requisitos de hardware

- VRAM estimada: no disponible; el repo ocupa 24,8 GB en disco, por lo que se estima que la carga en memoria requerira al menos 20 GB de RAM unificada en Apple Silicon (los modelos MLX utilizan RAM unificada).
- GPU recomendadas: Apple Silicon con 32 GB o mas de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). En GPU NVIDIA, la cuantizacion MLX no es aplicable directamente; para ese hardware existen variantes GGUF o FP8 del modelo base.
- Inferencia en consumer GPU: no directamente con MLX; para GPUs NVIDIA se requieren los formatos GGUF o los pesos FP8 del modelo base.
- Opciones de despliegue: mlx-lm (recomendado), llama.cpp (para GGUF, no para MLX), vLLM (para el modelo base FP8 en cloud), TGI (para el modelo base).
- Latencia y throughput: no disponibles. En Apple Silicon, el rendimiento depende del numero de cores de memoria; se espera una velocidad de generacion moderada (5-15 tokens/s en chips M3/M4 con 64 GB) para una modelo de 3B activos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este, cuantizado MLX 5bit) | 35B | ~3B | no disponible | MIT | MLX |
| Qwen 3.6-35B-A4B | 35B | ~4B | no disponible | Apache 2.0 | FP8, GGUF, MLX |
| Gemma 4-31B | 31B | 31B (dense) | no disponible | Gemma License | FP8, GGUF |
| Muse Glimmer-30B | 30B | 30B (dense) | no disponible | MIT | FP8, GGUF |

Segun la informacion de la busqueda web, Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de codificacion y agente, y supera a Gemma 4-31B y Muse Glimmer-30B en tareas de codificacion agente. No se proporcionan cifras concretas. La ventaja principal del modelo es su arquitectura MoE que reduce el coste de inferencia frente a modelos densos del mismo tamano.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion disponible sobre sesgos especificos del modelo; se recomienda auditar antes de desplegarlo en produccion con datos sensibles.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: no se ha publicado la longitud de contexto soportada; se desconoce si soporta ventanas de mas de 32k tokens.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero no se ofrece garantia del modelo.
- Caveat de cuantizacion: la cuantizacion 5-bit puede degradar ligeramente la calidad de la generacion frente al modelo FP8 original; se recomienda probar con datos propios.
- Dependencia de Apple Silicon: el formato MLX solo funciona en macOS con chips Apple Silicon; para otros entornos se requieren los formatos GGUF o FP8 del modelo base.

## Enlaces

- Repo HuggingFace de esta cuantizacion: https://huggingface.co/majentik/Ornith-1.5-35B-A3B-MLX-5bit
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante MLX 6-bit del mismo modelo: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit
- Pagina de benchmarks del modelo base: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Articulo de despliegue local del modelo base: https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-local-run
- Ficha del modelo en Baseten: https://www.baseten.co/library/ornith-15-35b-a3b/
