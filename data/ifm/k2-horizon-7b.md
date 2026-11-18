# IFM/K2-Horizon-7B

## Resumen

K2-Horizon-7B es un modelo de lenguaje decoder-only de tipo denso desarrollado por IFM, presentado como el miembro intermedio de la familia K2-Horizon. Aunque se comercializa bajo la etiqueta "7B", los pesos publicados en safetensors suman 8.999.178.240 parametros (aproximadamente 9B), lo que conviene tener en cuenta al planificar el despliegue. Su rasgo diferencial es una ventana de contexto nativa de 524.288 tokens (512K), mantenida desde las etapas de midtraining, combinada con licencia Apache 2.0 y publicacion completa del recetario de entrenamiento.

El modelo se orienta a cargas de trabajo agenticas, generacion de codigo, razonamiento de contexto largo y matematicas. IFM publica junto a los pesos el codigo de entrenamiento, el codigo de evaluacion y los datasets utilizados (K2-Horizon-Pretrain-Data y K2-Horizon-Midtrain-Data), lo que lo convierte en un caso poco habitual de apertura total dentro de la categoria de modelos densos de ~9B.

La relevancia actual del modelo radica en la combinacion de tres factores poco frecuentes a este tamano: contexto de 512K, resultados competitivos en SWE-bench Verified y un ecosistema de artefactos abiertos (checkpoints intermedios, adaptadores de difusion para inferencia acelerada) que facilitan tanto la evaluacion como la investigacion del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K), nativa desde midtraining |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

K2-Horizon-7B es un transformer decoder-only denso, sin mezcla de expertos, con un nucleo de aproximadamente 9B parametros. La model card indica que la ventana de 512K tokens es nativa a partir de las etapas de midtraining, lo que sugiere una extension progresiva de contexto durante el entrenamiento en lugar de un ajuste posterior. El modelo requiere `trust_remote_code` al emplear `custom_code` en la libreria transformers.

IFM publica el recetario completo: datasets de pretraining y midtraining (K2-Horizon-Pretrain-Data y K2-Horizon-Midtrain-Data), codigo de entrenamiento en el repositorio xllm, codigo de evaluacion en Eval360 y un navegador de datos (DATA_NAVIGATOR). No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Si se menciona la publicacion de checkpoints intermedios para estudiar la evolucion de capacidades a lo largo del entrenamiento, y la existencia de adaptadores de difusion (K2-Horizon-7B-Uno) orientados a acelerar la inferencia.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico de competicion (evaluado en HMMT Feb 2026).
- Ingenieria de software y resolucion de issues reales (evaluado en SWE-bench Verified).
- Razonamiento cientifico (categoria incluida en la bateria de benchmarks de la model card).
- Procesamiento de contexto largo: ventana nativa de 524.288 tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Evaluacion agentica: la model card situa el modelo en la categoria de benchmarks agenticos, aunque no se detallan capacidades especificas de tool calling o function calling en la informacion disponible.
- Inferencia acelerada mediante adaptadores de difusion (variante K2-Horizon-7B-Uno).
- Soporte multilingue limitado al ingles segun el campo `language` de la model card.

## Casos de uso

- Analisis de repositorios completos: con 512K tokens de contexto, el modelo puede ingerir arboles de codigo extensos, historiales de commits y documentacion asociada en una sola pasada, lo que resulta util para revisiones de codigo y auditorias de seguridad sobre proyectos medianos.
- Resolucion automatizada de issues: los 72,4 puntos en SWE-bench Verified lo posicionan para integrarse en flujos que reciben un issue, localizan los ficheros relevantes y proponen un parche verificable, con validacion posterior en CI.
- Asistentes de investigacion documental: la ventana de 512K permite cargar articulos cientificos completos, suplementarios y referencias cruzadas para tareas de sintesis y extraccion de evidencia sin necesidad de recuperacion fragmentada.
- Tutoria y resolucion de problemas matematicos: el rendimiento en HMMT Feb 2026 (77,8) lo hace adecuado para entornos de practica con problemas de competicion, incluyendo explicaciones paso a paso.
- Procesamiento de contratos y documentacion legal: la combinacion de contexto largo y capacidad de razonamiento permite comparar clausulas entre documentos extensos y detectar inconsistencias, siempre con supervision humana dado el riesgo de alucinacion.
- Generacion de codigo en pipelines de CI/CD: puede integrarse como paso de generacion de tests o de parches sugeridos, con la ventaja de que la licencia Apache 2.0 no impone restricciones de uso comercial.
- Investigacion sobre dinamica de entrenamiento: la publicacion de checkpoints intermedios y datasets permite estudiar como emergen capacidades concretas a lo largo del entrenamiento, un caso de uso orientado a equipos de investigacion.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Benchmark | K2-Horizon-7B | Gemma 4-12B | Qwen3.5-9B | Granite 4.2-8B |
|---|---|---|---|---|
| HMMT Feb 2026 (matematicas de competicion) | 77,8 | 63,1 | 65,7 | 66,5 |
| SWE-bench Verified (ingenieria de software) | 72,4 | 30,6 | 50,8 | 47,7 |

La model card menciona ademas categorias de razonamiento cientifico y agentica, pero la tabla disponible en la informacion proporcionada queda truncada en esa seccion, por lo que no se incluyen esos valores. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; con contexto de 512K la cache KV crece de forma significativa y exige planificacion cuidadosa de memoria.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB para pesos; en 4 bits, en torno a 5-6 GB, sin contar cache KV.
- GPU recomendadas para contexto completo: A100 80GB, H100 80GB o configuraciones multi-GPU, dado el coste de la cache KV a 512K tokens.
- GPU de consumo: el modelo cabe en RTX 4090 (24 GB) en BF16 para contextos moderados; en RTX 3090/4090 con cuantizacion de 8 o 4 bits se amplia el margen, pero el contexto maximo requerira tecnicas de atencion eficiente o descarga a CPU.
- Opciones de despliegue: transformers con `trust_remote_code` (soporte nativo declarado), y previsiblemente vLLM, TGI o llama.cpp si existe conversion a GGUF; la informacion disponible solo confirma transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada. La variante con adaptadores de difusion (K2-Horizon-7B-Uno) se ofrece precisamente para mejorar la velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HMMT Feb 2026 | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| K2-Horizon-7B | ~9B (denso) | 512K | 77,8 | 72,4 | Apache 2.0 |
| Gemma 4-12B | 12B (denso) | No disponible | 63,1 | 30,6 | No disponible |
| Qwen3.5-9B | 9B (denso) | No disponible | 65,7 | 50,8 | No disponible |
| Granite 4.2-8B | 8B (denso) | No disponible | 66,5 | 47,7 | No disponible |

Los datos de contexto y licencia de los modelos de referencia no se detallan en la informacion proporcionada. En las dos metricas publicadas, K2-Horizon-7B supera a los tres modelos de referencia, con una ventaja especialmente amplia en SWE-bench Verified (mas de 21 puntos sobre el siguiente).

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su uso en castellano no esta validado y probablemente degrade la calidad.
- Alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad; en tareas de codigo y documentacion legal se requiere verificacion humana.
- Sesgos: no se publica informacion sobre evaluaciones de sesgo, toxicidad o seguridad en la model card disponible.
- Contexto largo: aunque la ventana nativa es de 512K, no se documenta el rendimiento especifico en tareas de recuperacion en el extremo de la ventana (por ejemplo, needle-in-a-haystack); conviene validar en el caso de uso concreto.
- Requisito de codigo personalizado: el uso con transformers exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor del modelo; debe revisarse en entornos de produccion.
- Tamano real: la etiqueta "7B" no coincide con los 8.999.178.240 parametros publicados, lo que afecta a las estimaciones de VRAM y latencia.
- Cuantizaciones: no se confirma la disponibilidad de GGUF u otros formatos cuantizados oficiales; el despliegue en hardware de consumo puede requerir conversion propia.
- Benchmarks: los resultados publicados son del propio autor y las referencias no incluyen informacion de contexto ni licencia, lo que limita la comparabilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/K2-Horizon-7B
- Variante con adaptadores de difusion: https://huggingface.co/IFM/K2-Horizon-7B-Uno
- Codigo de entrenamiento (xllm): https://github.com/ifm-ai/xllm
- Codigo de evaluacion (Eval360): https://github.com/ifm-ai/Eval360
- Navegador de datos de entrenamiento (DATA_NAVIGATOR): https://github.com/ifm-ai/DATA_NAVIGATOR
- Dataset de pretraining: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
