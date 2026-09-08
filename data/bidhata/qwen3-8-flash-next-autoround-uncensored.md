# bidhata/Qwen3.8-Flash-Next-AutoRound-Uncensored

## Resumen

El modelo `bidhata/Qwen3.8-Flash-Next-AutoRound-Uncensored` es una version ablacionada (sin rechazos) del modelo hibrido `Saren/Qwen3.8-Flash-Next-W4A16-AutoRound-hybrid`. Se basa en Qwen3.8-Flash-Next, un modelo de mezcla de expertos (MoE) de 125B parametros con tabla n-gram de 51B y 6B parametros activos por token, desarrollado por el equipo Qwen. Esta variante concreta ha sido cuantizada a int4 mediante AutoRound (W4A16/GPTQ-Marlin g128), con int8 en el lm_head y capas laterales en fp8 por bloques.

El autor, bidhata, ha aplicado una edicion a nivel de pesos para eliminar las respuestas de rechazo del modelo, recuperando la direccion de rechazo desde `orcarouter/Qwen3.8-Flash-Next-Uncensored` y aplicando la transformacion `W − r(rᵀW)` a 25.185 matrices de escritura residual. No se realizo fine-tuning ni recuantizacion. El resultado es un artefacto de investigacion sin restricciones de contenido, pensado para estudiar la alineacion y los mecanismos de rechazo en modelos de lenguaje.

El modelo esta disponible en formato safetensors con un total de 123.958.298.771 parametros y un tamano de repositorio de 75.3 GB. No se han publicado datos sobre la longitud de contexto, idiomas soportados ni licencia especifica, aunque el autor indica que se rige por la licencia comunitaria de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con tabla n-gram PLE |
| Parametros totales | 123.958.298.771 (safetensors); el modelo base se describe como 125B MoE + 51B tabla n-gram |
| Parametros activos | 6B activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 AutoRound/GPTQ-Marlin g128 (int4 MoE) + int8 lm_head + blockwise-fp8 en capas laterales |
| Idiomas soportados | no disponible |
| Licencia | Licencia comunitaria Qwen (revisar antes de uso en produccion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es una arquitectura MoE con 125B parametros totales y 6B activos por token, complementada con una tabla n-gram de 51B (PLE). Segun el repositorio de GitHub, en comparacion con Qwen3.7-Plus reduce el coste de entrenamiento e inferencia: el entrenamiento requiere aproximadamente 1/9 del tiempo, manteniendo capacidades superiores en tareas de codificacion y ofimatica. El modelo incluye un mecanismo de prediccion multi-token (MTP) con 513 tensores de capa draft en bf16.

La variante presentada ha sido cuantizada por Intel mediante AutoRound (W4A16) y posteriormente hibridada por Saren-Arterius. El proceso de ablacion no implica fine-tuning ni recuantizacion: se recupero la direccion de rechazo a partir de un modelo abliterado de referencia y se aplico la transformacion `W − r(rᵀW)` a 25.185 matrices de escritura residual (96 en fp8, 24.576 en int4 y 513 en bf16). Los pesos de la tabla n-gram PLE se reutilizan sin cambios desde un repositorio externo mediante mmap.

## Capacidades

- Generacion de texto coherente y de formato largo (ensayos extensos).
- Generacion de codigo con pruebas (codegen with tests), segun las mediciones del autor.
- Razonamiento matematico, con capacidad intacta tras la ablacion.
- Respuestas sin frases de rechazo (5/5 en las pruebas de refusal probes).
- Soporte de MTP (multi-token prediction) con factor 3, que acelera la decodificacion.
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

1. Investigacion sobre mecanismos de rechazo en modelos de lenguaje: el modelo permite estudiar como la ablacion de pesos afecta a las respuestas de rechazo sin necesidad de reentrenar.
2. Generacion de codigo en entornos de desarrollo: el autor reporta que mantiene la capacidad de generar codigo con pruebas, por lo que puede integrarse en pipelines de CI/CD para generar tests unitarios.
3. Redaccion de documentos largos: la capacidad de generar ensayos extensos lo hace util para borradores de informes tecnicos o articulos.
4. Razonamiento matematico en entornos educativos: puede usarse para resolver problemas matematicos paso a paso en aplicaciones de tutoria.
5. Despliegue en hardware especializado (DGX Spark): el modelo esta optimizado para ejecutarse con vLLM y MTP=3 en sistemas con memoria unificada de 128 GB.
6. Analisis de contenido sin restricciones en entornos controlados: al ser una version sin rechazos, puede usarse en investigacion de seguridad para evaluar respuestas a prompts sensibles, siempre bajo supervision humana y cumpliendo la ley aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona las siguientes mediciones en un sistema con 1× DGX Spark, vLLM y MTP=3:

| Metrica | Valor |
|---|---|
| Refusal probes | 5/5 cumplen (sin frases de rechazo) |
| Decodificacion | ~32 tok/s |
| TTFT (time to first token) | ~230 ms |
| Regresion vs. hibrido stock | Sin regresion en rendimiento |

## Requisitos de hardware

- VRAM estimada: no disponible, pero el modelo requiere 128 GB de memoria unificada segun el autor.
- GPU recomendada: 1× DGX Spark (NVIDIA, con memoria unificada de 128 GB).
- No se recomienda para GPUs de consumo (RTX 4090, etc.) por el alto requisito de memoria.
- Almacenamiento: ~130 GB de disco (incluye el modelo y la tabla PLE).
- Opciones de despliegue: vLLM con MTP=3, contenedor Docker (imagen de servicio con parches), mmap para la tabla PLE.
- Latencia y throughput: decodificacion ~32 tok/s, TTFT ~230 ms en la configuracion medida.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Memoria requerida | Ablacion | Licencia |
|---|---|---|---|---|---|
| bidhata/Qwen3.8-Flash-Next-AutoRound-Uncensored | 123.958.298.771 (safetensors) + 51B n-gram | int4 W4A16 + int8 lm_head + fp8 | 128 GB unificada | Si | Qwen community |
| Saren/Qwen3.8-Flash-Next-W4A16-AutoRound-hybrid | 123.958.298.771 (safetensors) + 51B n-gram | int4 W4A16 + int8 lm_head + fp8 | 128 GB unificada | No | Qwen community |
| HaberstrohSystems/Qwen3.8-Flash-Next-int2-mixed-AutoRound-24GB-SGLang | no disponible | int2 mixto | 24 GB GPU + 32 GB host | No | no disponible |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | no disponible | Si | no disponible |

## Limitaciones y advertencias

- Modelo sin censura (ablated): puede generar contenido danino, ilegal o inapropiado. El usuario es el unico responsable de lo que genere y de cumplir la ley aplicable.
- Licencia: se rige por la licencia comunitaria Qwen, que debe revisarse antes de cualquier uso en produccion.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval ni otros benchmarks estandar, por lo que el rendimiento real en tareas generales no esta verificado.
- Longitud de contexto y idiomas soportados no especificados.
- Requiere 128 GB de memoria unificada, lo que limita su despliegue a hardware especializado (DGX Spark).
- La tabla n-gram PLE (51B) se descarga por separado; si no se incluye, el modelo no funciona correctamente.
- El repositorio tiene 0 descargas y 0 likes: es un modelo no verificado por la comunidad, con posible riesgo de confianza.
- La cuantizacion int4 puede introducir perdida de precision en comparacion con el modelo original en bf16.

## Enlaces

- HuggingFace: https://huggingface.co/bidhata/Qwen3.8-Flash-Next-AutoRound-Uncensored
- Modelo base hibrido: https://huggingface.co/Saren/Qwen3.8-Flash-Next-W4A16-AutoRound-hybrid
- Tabla PLE n-gram: https://huggingface.co/Saren/Qwen3.8-Flash-Next-ple-table-fp8
- Modelo abliterado de referencia: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Version cuantizada int2 (24 GB): https://huggingface.co/HaberstrohSystems/Qwen3.8-Flash-Next-int2-mixed-AutoRound-24GB-SGLang
