# nowdoor/Qwen3.8-27B-Inspect-v2

## Resumen

Qwen3.8-27B-Inspect-v2 es un modelo experimental desarrollado por nowdoor, en colaboracion con el Instituto de Investigacion de Seguridad de Instalaciones de Corea (ISRI), para la revision semantica de informes de inspeccion de seguridad y diagnostico de precision de instalaciones en coreano. Se trata de un ajuste fino completo (full-parameter fine-tuning) del modelo base Qwen/Qwen3.8-27B de Alibaba, combinado con entrenamiento por refuerzo mediante GRPO, orientado a producir salidas estructuradas en JSON con citas de articulos normativos y fragmentos del informe original.

El modelo hereda la arquitectura hibrida de atencion de Qwen3.8-27B: 27.356 millones de parametros densos, con solo 16 de las 64 capas usando atencion completa y las otras 48 usando atencion lineal con estado recurrente constante. Incluye modo de razonamiento (thinking) activado por defecto con `enable_thinking=True` y `reasoning_effort="medium"`. Es la segunda version de la serie Inspect, y mejora la precision de juicio de seis niveles del 60% al 70% respecto a v1, manteniendo el rendimiento general de razonamiento (AIME 2024+2025: 81,7%).

Su relevancia radica en que aborda un problema de dominio especifico —la revision de informes de seguridad de instalaciones— con salida estructurada y protocolo de razonamiento controlado, algo poco habitual en modelos abiertos. La licencia Apache 2.0 permite uso comercial, aunque el autor advierte de que es un modelo experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion completa + atencion lineal) sobre base Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (pesos safetensors); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un LLM denso multimodal nativo de la familia Qwen3.8 con arquitectura Qwen3.5. La capa de atencion es hibrida: de las 64 capas totales, solo 16 ejecutan atencion completa (con un intervalo de atencion completa de 4), mientras que las 48 restantes usan atencion lineal con un estado recurrente constante. Esta combinacion reduce el coste computacional manteniendo capacidad de razonamiento de largo alcance.

El entrenamiento consistio en un ajuste fino completo (full-parameter fine-tuning) sobre el modelo base, seguido de optimizacion por refuerzo con GRPO (Group Relative Policy Optimization). El objetivo era especializar el modelo en la revision semantica de informes de seguridad de instalaciones coreanos, con salida estructurada en JSON que incluye juicio de seis niveles, citas de articulos normativos y referencias al texto original. El modelo soporta modo thinking activable, con configuracion por defecto de `reasoning_effort="medium"`. Se verifico su funcionamiento con Transformers 5.14.1/5.15.0 y vLLM 0.17.1.

## Capacidades

- Revision semantica de informes de seguridad de instalaciones en coreano, con juicio en seis niveles de cumplimiento.
- Generacion de salidas estructuradas en JSON estricto, incluyendo citas de articulos normativos y fragmentos del informe original.
- Modo de razonamiento (thinking) con niveles de esfuerzo configurables (`reasoning_effort`).
- Razonamiento general preservado tras el ajuste de dominio: 81,7% en AIME 2024+2025.
- Protocolo de finalizacion de razonamiento controlado: 50/50 respuestas con cierre normal de `response` en el conjunto de evaluacion.
- Capacidad multimodal heredada del modelo base (pipeline image-text-to-text), aunque no evaluada en el dominio de instalaciones.
- Soporte bilingue coreano e ingles.

## Casos de uso

- Revision asistida de informes de seguridad de instalaciones: el modelo analiza extractos de informes de inspeccion y emite un juicio de seis niveles de cumplimiento, con citas de los articulos normativos aplicables. Es adecuado porque fue entrenado especificamente para esta tarea con salida JSON estructurada.
- Control de calidad documental en ingenieria civil: integrable en flujos de trabajo de despachos de ingenieria para detectar inconsistencias entre el contenido del informe y los criterios normativos, reduciendo el trabajo manual de revision.
- Generacion de borradores de dictamenes tecnicos: a partir de un informe de entrada, el modelo produce un borrador de revision con estructura JSON que un ingeniero senior puede validar y firmar.
- Auditoria de cumplimiento normativo: el modelo puede contrastar citas de articulos y referencias dentro del informe, ayudando a verificar que las conclusiones estan respaldadas por el texto original.
- Evaluacion de modelos de dominio en coreano: sirve como referencia para investigacion academica sobre ajuste fino de LLMs en tareas de lenguaje juridico-tecnico coreano con salida estructurada.
- Razonamiento matematico de competicion: gracias a la preservacion del rendimiento general (AIME 81,7%), puede usarse como modelo de razonamiento general en contextos donde se requiera pensamiento paso a paso, aunque su especialidad declarada es la revision de instalaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. La evaluacion de instalaciones se realizo sobre 50 casos sinteticos sin solapamiento con los datos de entrenamiento, con thinking activado y decodificacion greedy. AIME se evaluo sobre 60 problemas (2024 y 2025) en una unica pasada greedy.

| Evaluacion | v1 | v2 | Base Qwen3.8-27B |
|---|---:|---:|---:|
| Precision de juicio de 6 niveles (instalaciones) | 30/50 (60%) | **35/50 (70%)** | No evaluado |
| Macro F1 (instalaciones) | 0,463 | **0,531** | No evaluado |
| Protocolo `response` normal | 0/50 | **50/50** | No evaluado |
| Esquema JSON estricto | 46/50 | **50/50** | No evaluado |
| Exito operativo completo con juicio | 25/50 | **35/50** | No evaluado |
| AIME 2024+2025 (precision) | 46/60 (76,7%) | **49/60 (81,7%)** | 47/60 (78,3%) |
| AIME con limite de tokens de salida alcanzado | 25/60 | **17/60** | No disponible |

El autor interpreta el resultado de AIME como un indicador de preservacion de rendimiento general tras el ajuste de dominio, no como una mejora, dado el tamano reducido de la muestra.

## Requisitos de hardware

- Los pesos en BF16 ocupan aproximadamente 55,6 GB, por lo que la inferencia en BF16 requiere al menos 60-70 GB de VRAM considerando cache KV y activaciones.
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes con 80 GB de VRAM para inferencia BF16 sin cuantizacion.
- No cabe en una GPU de consumo de 24 GB (RTX 4090) en BF16; se necesitarian cuantizaciones de 4 bits (no documentadas por el autor) o despliegue multi-GPU con paralelismo de tensor.
- Opciones de despliegue verificadas: Transformers 5.14.1/5.15.0 y vLLM 0.17.1. Compatible con endpoints de Hugging Face.
- La latencia y el throughput no estan documentados; dependen del hardware y de la configuracion de `reasoning_effort` (mayor esfuerzo implica mas tokens de razonamiento y mayor latencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Inspect-v2 | 27,36 B | No disponible | Revision de informes de seguridad de instalaciones (coreano) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Inspect-v01 | 27,36 B | No disponible | Misma tarea, version anterior (60% precision) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (base) | 27,36 B | No disponible | LLM multimodal general (codigo, agentes, ofimatica) | Apache 2.0 | Hugging Face, GitHub |

La comparativa principal es entre v2 y su predecesor v1: v2 mejora la precision de juicio en 10 puntos porcentuales, alcanza 50/50 en protocolo de respuesta normal y 50/50 en esquema JSON estricto, y reduce los casos de limite de tokens en AIME de 25 a 17. Frente al modelo base, v2 preserva e incluso supera ligeramente el rendimiento en AIME (81,7% frente a 78,3%), aunque el autor advierte de que la diferencia no es estadisticamente significativa con una sola pasada de 60 preguntas.

## Limitaciones y advertencias

- La evaluacion de instalaciones se realizo sobre 50 casos sinteticos; no se garantiza el rendimiento sobre informes reales completos.
- Los resultados de instalaciones solo son validos con thinking activado; con thinking desactivado el comportamiento puede diferir.
- Las clases de juicio estricto con pocos ejemplos en el conjunto de evaluacion requieren validacion adicional.
- El modelo puede generar hechos o citas que no estan en el informe original; es imprescindible contrastar con el texto fuente.
- No se ha evaluado el dominio de imagen o video, a pesar de que el modelo base es multimodal.
- Los resultados de AIME provienen de una unica pasada greedy sobre 60 preguntas; diferencias pequenas de puntuacion no son concluyentes.
- El autor no distribuye los datos de entrenamiento ni los registros de ejecucion en el repositorio.
- Es un modelo experimental; no debe sustituir el juicio final de un ingeniero de campo ni la determinacion de la clase de seguridad legal.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse tambien las condiciones de la licencia del modelo base Qwen3.8-27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nowdoor/Qwen3.8-27B-Inspect-v2
- Version anterior (v1): https://huggingface.co/nowdoor/Qwen3.8-27B-Inspect-v01
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Articulo de OpenLM.ai sobre Qwen3.8: https://openlm.ai/qwen3.8/
