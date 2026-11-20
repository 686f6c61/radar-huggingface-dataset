# nerun/MiMo-V2.6-Distill-Qwen-9B-i1-MTP-GGUF

## Resumen

MiMo-V2.6-Distill-Qwen-9B-i1-MTP-GGUF es una distribución de cuantizaciones GGUF del modelo MiMo-V2.6-Distill-Qwen-9B, un merge basado en Qwen3.5-9B, a la que el usuario nerun ha injertado un bloque MTP (Multi-Token Prediction) para habilitar decodificación especulativa nativa en llama.cpp mediante el flag `--spec-type draft-mtp`. El modelo base procede de las cuantizaciones imatrix de mradermacher, mientras que el bloque MTP se ha transplantado tensor a tensor (sin entrenamiento adicional) desde los ficheros MTP-only de a4lg, extraídos a su vez de Qwen3.5-9B original.

El interés de esta ficha reside en que combina tres elementos poco habituales en un solo artefacto: cuantizaciones imatrix de baja precisión (desde IQ1_S hasta Q6_K), un cabezal MTP embebido que actúa como draft interno (sin necesidad de cargar un modelo borrador separado) y proyectores de visión (mmproj) entrenados específicamente para el modelo base. El resultado es un paquete de aproximadamente 9.200 millones de parámetros totales que cabe en GPUs de consumo desde 8 GB de VRAM y que acelera la generación mediante decodificación especulativa.

La relevancia práctica es doble: por un lado, permite ejecutar un modelo de 9B con capacidades de razonamiento, código, tool calling y visión en hardware modesto; por otro, demuestra un patrón reproducible de inyección de MTP en modelos que no lo traen de fábrica, algo útil para quien quiera replicar la técnica con otros checkpoints. La licencia MIT del modelo base facilita su uso comercial, aunque conviene revisar las condiciones de los artefactos donantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (arquitectura `qwen35` en llama.cpp), con bloque MTP añadido |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 0` y `-fitc 32768`) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (con bloque MTP embebido y proyectores de visión mmproj) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 9.200 millones de parámetros derivado de Qwen3.5-9B, sobre el que se ha realizado un merge para producir MiMo-V2.6-Distill. La distribución aquí descrita no entrena nada nuevo: toma las cuantizaciones imatrix de mradermacher (generadas con calibración imatrix, lo que mejora la calidad en bits bajos) y les añade un bloque MTP (`blk.32.*`) copiado tensor a tensor desde los ficheros MTP-only de a4lg, extraídos del Qwen3.5-9B original. El script de transplante es el `convert.py` de @buzz, adaptado porque la versión publicada no manejaba correctamente la arquitectura `qwen35` (incrementaba `block_count` de 32 a 33 pero no ajustaba las claves por capa, y llama.cpp rechazaba el resultado).

El cabezal MTP se entrenó sobre Qwen3.5-9B, no sobre MiMo-V2.6-Distill, por lo que no es un draft específico del modelo final; aun así, el autor reporta tasas de aceptación de aproximadamente 0,6-0,7 en sus pruebas, lo que justifica su uso. Como el bloque MTP comparte `token_embd` y `output` con el modelo principal, el incremento de tamaño es de solo unos 0,2 GiB por fichero, y el consumo de VRAM es menor que cargar un modelo borrador independiente. Los proyectores de visión (mmproj) provienen de la distribución GGUF de mradermacher y sí fueron entrenados para este modelo. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con modo de razonamiento (tag `reasoning`).
- Generación y asistencia de código (tag `code`).
- Tool calling y function calling (tag `tool-use`), orientado a flujos agénticos (tag `agentic`).
- Razonamiento multi-paso para tareas que requieren planificación.
- Visión: incluye proyectores mmproj entrenados para el modelo, lo que habilita entrada de imágenes.
- Decodificación especulativa nativa mediante bloque MTP embebido, activable con `--spec-type draft-mtp` en llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`), pensada para despliegue vía API.
- Capacidades multilingües: no se especifican idiomas en la información disponible.

## Casos de uso

- Asistente de código en local: con cuantizaciones Q4_K_M (~5,8 GB) o Q5_K_M (~6,7 GB) el modelo cabe en una RTX 4060 Ti de 8 GB o superior, permitiendo autocompletado y generación de funciones sin enviar código a la nube; el modo de razonamiento ayuda en tareas de refactorización y depuración.
- Agente con tool calling en pipelines de CI/CD: el soporte de function calling y el tag `agentic` permiten integrarlo como planificador que invoca herramientas (ejecutar tests, consultar APIs, abrir PRs) en un bucle multi-paso, con la decodificación especulativa reduciendo la latencia por token.
- Atención al cliente automatizada: el modo conversacional y el razonamiento permiten gestionar diálogos multi-turno; el contexto configurable en el ejemplo de uso (`-fitc 32768`) sugiere ventanas amplias, aunque la longitud exacta no está confirmada.
- Análisis de imágenes en local: gracias a los proyectores mmproj entrenados, puede procesar capturas de pantalla, diagramas o documentos escaneados para extraer información o responder preguntas, sin depender de servicios externos.
- Despliegue en hardware de gama baja: las cuantizaciones IQ1_S (~2,9 GB) e IQ2_XXS (~3,3 GB) permiten ejecutar el modelo en GPUs de 4-6 GB o incluso en CPU con llama.cpp, útil para prototipado rápido o entornos con recursos limitados.
- Servidor de inferencia ligero: con `llama-server` y MTP activo, se puede montar un endpoint compatible con la API de OpenAI (tag `endpoints_compatible`) para servir a varias aplicaciones internas desde una sola GPU de consumo.
- Investigación sobre decodificación especulativa: el repositorio sirve como caso de estudio reproducible de inyección de MTP en modelos que no lo traen, útil para quienes quieran aplicar la técnica a otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor sí reporta datos empíricos de rendimiento de la decodificación especulativa: con `--spec-draft-n-max 2` se obtiene la mejor velocidad (valores de 1, 3 y 4 o superiores resultaron más lentos), con tasas de aceptación de aproximadamente 0,6-0,7. En una GPU de 8 GB de VRAM, usar `-ub 1024` o `-ub 2048` redujo la generación a ~22 t/s, por lo que recomienda mantener `-ub 512`. No se especifican cifras absolutas de throughput en t/s para la configuración óptima.

## Requisitos de hardware

- VRAM estimada: desde ~2,9 GB (IQ1_S) hasta ~7,6 GB (Q6_K) para los pesos, más el bloque MTP (~0,2 GiB) y el búfer de cómputo; el ejemplo de uso emplea `-fit on` con `-fitc 32768` para ajustar automáticamente.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, desde una RTX 3050 8 GB o similar con cuantizaciones Q4_K_M o inferiores; las cuantizaciones IQ1/IQ2 pueden ejecutarse en GPUs de 4-6 GB o en CPU.
- Opciones de despliegue: llama.cpp (requiere build con soporte `--spec-type draft-mtp`) mediante `llama-server` o `llama-cli`; también es compatible con endpoints según el tag del repositorio. No se confirma soporte en vLLM, Ollama o TGI.
- Latencia y throughput: no se publican cifras absolutas; el autor solo indica que `--spec-draft-n-max 2` es más rápido que 1, 3 o 4, y que `-ub 1024/2048` degrada a ~22 t/s en 8 GB de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-i1-MTP-GGUF (este) | 9,2 B | No disponible | MIT | GGUF + MTP + mmproj | Decodificación especulativa embebida, visión |
| mradermacher/MiMo-V2.6-Distill-Qwen-9B-i1-GGUF | 9,2 B | No disponible | MIT | GGUF | Mismo modelo base sin bloque MTP; requiere draft separado para especulación |
| a4lg/Qwen3.5-9B-MTP-ONLY-GGUF | 9,2 B (solo bloque MTP) | No disponible | No disponible | GGUF | Artefacto donante del MTP; no es un modelo completo utilizable |
| Qwen/Qwen3.5-9B | 9,2 B | No disponible | No disponible | Safetensors | Modelo original del que derivan el merge y el MTP; sin cuantizaciones imatrix ni ajuste MiMo |

## Limitaciones y advertencias

- El bloque MTP fue entrenado sobre Qwen3.5-9B, no sobre MiMo-V2.6-Distill; la tasa de aceptación (~0,6-0,7) es buena pero inferior a la de un draft específico, y puede degradarse en dominios muy alejados del entrenamiento original.
- Requiere una build de llama.cpp con soporte `--spec-type draft-mtp`; versiones estándar rechazarán el fichero o ignorarán el bloque MTP.
- No se debe pasar el mismo fichero con `--model-draft`: el bloque MTP ya está embebido y duplicarlo provoca errores o consumo innecesario de VRAM.
- En GPUs de 8 GB, aumentar `-ub` por encima de 512 reduce drásticamente el throughput con MTP (~22 t/s), según pruebas del autor.
- No se dispone de información sobre idiomas soportados, sesgos, tasas de alucinación ni evaluación en benchmarks; no hay datos que permitan certificar calidad en producción.
- Las cuantizaciones IQ1 e IQ2, aunque permiten ejecución en hardware muy limitado, degradan notablemente la calidad frente a Q4_K_M o superiores; para uso serio se recomienda Q4_K_M en adelante.
- La licencia MIT del repositorio cubre los artefactos publicados, pero el modelo base y los donantes (Qwen3.5-9B, ficheros de a4lg) pueden tener condiciones propias que conviene verificar antes de un uso comercial.
- El repositorio tiene 0 likes y 7.341 descargas en el momento de la consulta, lo que sugiere adopción moderada pero poca validación comunitaria.
- El tamaño total del repo (115,7 GB) implica que descargar todas las cuantizaciones es costoso; conviene bajar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nerun/MiMo-V2.6-Distill-Qwen-9B-i1-MTP-GGUF
- Modelo base (cuantizaciones imatrix): https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-i1-GGUF
- Distribución GGUF con proyectores de visión: https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-GGUF
- Donante del bloque MTP: https://huggingface.co/a4lg/Qwen3.5-9B-MTP-ONLY-GGUF
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Script de transplante de MTP (gist de @buzz): https://gist.github.com/buzz/1c439684d5e3f36492ae9f64ef7e3f67
