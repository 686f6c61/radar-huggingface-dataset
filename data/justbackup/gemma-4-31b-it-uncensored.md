# Justbackup/gemma-4-31B-it-uncensored

## Resumen

Este modelo es una versión "uncensored" (sin censura) del modelo google/gemma-4-31B-it, creada mediante la técnica de abliteración norm-preserving biprojected. El autor es Justbackup, aunque la model card referencia a TrevorJS como fuente del método. El objetivo es eliminar el comportamiento de rechazo (refusals) del modelo base, permitiendo que responda a una gama más amplia de prompts, incluidos aquellos que el modelo original rechazaría.

La abliteración se aplica sobre las capas de proyección de salida (o_proj) y down_proj de todas las capas, utilizando direcciones de rechazo calculadas por capa a partir de activaciones de prompts dañinos e inofensivos. El proceso garantiza que la norma de los pesos se conserve, minimizando la degradación de la calidad general. Los resultados reportados indican una reducción de los rechazos de 100/100 a 1/100 en un conjunto de prueba, con una divergencia KL de 0.124 y una relación de longitud de respuesta inofensiva de ~1.01, lo que sugiere una degradación mínima.

Con 31.273 millones de parámetros, este modelo denso es adecuado para tareas de generación de texto, conversación y procesamiento de imágenes (según los tags). Se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors. Es relevante para desarrolladores e investigadores que necesitan un modelo de alta capacidad sin restricciones de contenido, aunque su uso conlleva responsabilidades éticas y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), con soporte multimodal (imagen-texto) segun tags |
| Parametros totales | 31.273.088.876 (~31B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (segun la familia Gemma 4; no confirmado especificamente para esta version) |
| Tipos de cuantizacion | safetensors (bf16); compatible con cuantizacion GGUF via conversion externa |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-31B-it, un transformer denso de 31B parametros con soporte multimodal (imagen-texto) y una ventana de contexto de 256K tokens, segun la informacion publica de la familia Gemma 4. El proceso de abliteracion aplicado en esta version no modifica la arquitectura, sino que ajusta los pesos de las capas de proyeccion (o_proj y down_proj) para eliminar la direccion de rechazo.

El metodo utilizado es la "norm-preserving biprojected abliteration", que descompone cada fila de pesos en magnitud y direccion, proyecta fuera la direccion de rechazo (calculada por capa) y recombina con la magnitud original, garantizando que la norma de los pesos se conserve. El pipeline incluye: carga del modelo en bf16 con adaptadores LoRA, recoleccion de activaciones residuales de 400 prompts daninos y 400 inofensivos, winsorizacion al percentil 99.5, calculo de la direccion de rechazo por capa, ortogonalizacion contra la media inofensiva, aplicacion de la modificacion y fusion de los adaptadores LoRA. No se dispone de informacion sobre los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, etc.).

## Capacidades

- Generacion de texto en ingles, con capacidad conversacional y de instrucciones.
- Procesamiento de imagenes (segun los tags image-text-to-text), aunque no se detalla su implementacion en esta version.
- Tool calling y function calling (caracteristica nativa de la familia Gemma 4, segun la guia local).
- Razonamiento multi-paso y soporte para agentes (inferido de las capacidades de Gemma 4).
- Ausencia de rechazo: el modelo responde a prompts que el modelo base rechazaria, incluyendo contenido potencialmente danino o controvertido.
- Compatible con el pipeline de transformers y con endpoints compatibles (segun tags).

## Casos de uso

- Investigacion en seguridad de IA: analizar como los modelos responden a prompts adversariales o daninos, y estudiar el efecto de la abliteracion en el comportamiento.
- Generacion de contenido creativo sin restricciones: escribir ficcion, poesia o guiones que aborden temas tabu o controvertidos.
- Asistentes conversacionales personalizados: crear chatbots que no se nieguen a responder sobre temas sensibles, aunque requiere supervision humana.
- Evaluacion de robustez: probar la capacidad del modelo para mantener coherencia y calidad en respuestas a prompts extremos.
- Desarrollo de aplicaciones de rol o simulacion: juegos de rol, personajes virtuales que deben responder sin limitaciones de contenido.
- Fine-tuning adicional: usar este modelo como base para tareas especificas donde se requiera una menor censura, siempre con las debidas salvaguardas.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, etc.). Los unicos resultados reportados son metricas de rechazo y calidad:

| Metrica | Valor |
|---|---|
| Refusals (mlabonne, 100 prompts) | 1/100 efectivo (5 marcados, 4 rechazo-luego-cumplimiento) |
| Refusals (cross-dataset, 686 prompts) | 22/686 (3.2%) |
| KL Divergence | 0.124 |
| Calidad (ratio de longitud de respuesta inofensiva) | ~1.01 |

No se han publicado resultados de benchmarks de rendimiento general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~62 GB (segun el tamano del repo de 62.6 GB).
- Para cuantizacion GGUF Q4_K_M, se estima ~18 GB de VRAM, lo que permitiria ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPUs recomendadas: A100 80GB, H100 80GB, o multiples GPUs para inferencia en bf16.
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras conversion a GGUF), Ollama (si se convierte).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| google/gemma-4-31B-it (base) | 31B | 256K | Apache 2.0 | Modelo original con rechazo de contenido |
| Justbackup/gemma-4-31B-it-uncensored | 31B | 256K (segun familia) | Apache 2.0 | Version abliterada sin rechazo |
| InfinimindCreations/gemma-4-31B-it-uncensored | 31B | 256K (segun familia) | Apache 2.0 | Otra version abliterada similar |

No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente desprovisto de mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o eticamente cuestionable. Su uso debe ser responsable y bajo supervision.
- La abliteracion puede introducir sesgos o comportamientos impredecibles en ciertos prompts, aunque los resultados reportados sugieren una degradacion minima.
- Solo soporta ingles; no se garantiza calidad en otros idiomas.
- La ventana de contexto de 256K es teorica; el rendimiento real puede degradarse con contextos muy largos.
- No se han publicado benchmarks de rendimiento general, por lo que no se puede comparar su calidad con otros modelos de forma objetiva.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales dependiendo del caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Justbackup/gemma-4-31B-it-uncensored
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Blog sobre abliteracion norm-preserving biprojected: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Repo de investigacion (mencionado en la model card): https://github.com/TrevorS/gemma-4-abliteration
- Guia local de Gemma 4: https://locallyuncensored.com/blog/gemma-4-local-guide.html
