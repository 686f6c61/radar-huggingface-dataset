# LamTNguyen/TQK-table1-psp-vs-prefix-sd15

## Resumen

El repositorio `LamTNguyen/TQK-table1-psp-vs-prefix-sd15` no es un modelo generativo en sí mismo, sino una colección de artefactos reproducibles para una evaluación comparativa de dos métodos de selección de candidatos aplicados a Stable Diffusion 1.5. En concreto, enfrenta el método publicado PSP (*screen-and-commit*, con currículo `8->4@16->2@32` y 256 evaluaciones lógicas del modelo) contra la extensión experimental TQK Prefix-8 (`8 x 16-step scout -> top-2 -> 2 x 64-step rerun`, también con 256 evaluaciones lógicas). El objetivo es verificar de forma transparente qué método obtiene mejores candidatos bajo un presupuesto de cómputo equivalente.

El autor, LamTNguyen, publica tanto el código de ejecución y evaluación como los resultados agregados y las imágenes finales (3.318 PNG ganadores), además de trazas por prompt y repetición. La evaluación se realiza sobre los 553 prompts oficiales de GenEval, con 3 repeticiones y el protocolo oficial de semillas, y mide tres métricas: ImageReward, HPS v2.1 y GenEval oficial (Mask2Former + OpenCLIP).

Su relevancia es metodológica más que de producto: permite auditar la reproducibilidad de una comparación head-to-head entre un método con paper asociado (PSP, Guimaraes & Perona, ECCV 2026) y una extensión propia (Prefix-8), con intervalos de confianza bootstrap sobre comparaciones pareadas. No incluye pesos de modelo, licencia declarada ni pipeline de inferencia publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo propio; artefactos de evaluación sobre el backbone `runwayml/stable-diffusion-v1-5` (difusión latente, fp16, DDIM) |
| Parametros totales | no disponible (el repositorio no publica pesos ni recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión; condicionamiento por prompt de texto, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (las ejecuciones se realizan en fp16) |
| Idiomas soportados | no disponible (los prompts evaluados son los 553 oficiales de GenEval, en inglés) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | no disponible (no se publican pesos; el repositorio contiene código Python, CSV/JSON de resultados, PNG y trazas) |
| Tamano del repositorio | 2,3 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-22 / 2026-09-22 |

## Arquitectura y entrenamiento

No hay entrenamiento asociado a este repositorio. Se trata de un banco de evaluación reproducible: el backbone es `runwayml/stable-diffusion-v1-5` en fp16, con muestreo DDIM, `T=64`, `eta=0`, `CFG 7.5` y resolución 512x512. Sobre ese backbone se comparan dos estrategias de asignación de presupuesto de cálculo: PSP (`8->4@16->2@32`, 256 evaluaciones lógicas del modelo) y TQK Prefix-8 (`8 x 16-step scout -> top-2 -> 2 x 64-step rerun`, 256 evaluaciones lógicas). La igualdad de presupuesto lógico (256 en ambos casos) es la condición que hace comparable la tabla.

El protocolo experimental usa los 553 prompts oficiales de GenEval con 3 repeticiones por prompt y el protocolo oficial de semillas (semillas base 42, 43 y 44; semilla del candidato = base + `candidate_id`; latentes emparejados). Las métricas calculadas son ImageReward, HPS v2.1 y GenEval oficial, esta última mediante Mask2Former y OpenCLIP. El análisis estadístico es pareado con bootstrap sobre los 553 prompts, e incluye recuentos de victorias/empates/derrotas (W/T/L). Todo el cómputo reportado se ejecutó en una única RTX 4090 de 24 GB.

La innovación técnica que documenta el repositorio no está en el modelo, sino en el método Prefix-8, descrito como extensión experimental de TQK: una fase de exploración barata (8 ramas de 16 pasos) seguida de un rerun de 64 pasos únicamente para los 2 mejores candidatos. El repositorio indica además que debe citarse el paper de PSP (Guimaraes & Perona, ECCV 2026) para el método PSP.

## Capacidades

- Reproducción completa de una comparación head-to-head entre dos métodos de selección de candidatos sobre SD 1.5, con scripts de ejecución, evaluación y agregación.
- Generación de resultados por imagen y por prompt: manifiestos, configuraciones, métricas individuales, resúmenes pareados, categorías de GenEval, resúmenes de tiempo de ejecución, trazas e informes.
- Distribución de las 3.318 imágenes finales ganadoras en la estructura `rep{0,1,2}/{psp,prefix8}/{prompt_id}.png`.
- Distribución de metadatos por par (repetición, prompt) en JSON con las trazas completas de PSP y Prefix-8.
- Cálculo de métricas automáticas: ImageReward, HPS v2.1 y GenEval oficial (Mask2Former + OpenCLIP).
- Análisis estadístico pareado con bootstrap e intervalos de confianza al 95 %.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo, porque el repositorio no contiene un modelo de lenguaje.

## Casos de uso

- Reproducción de resultados publicados: un grupo de investigación puede ejecutar `code/run_geneval_table1.sh` y `code/aggregate_table1.py` sobre los 553 prompts de GenEval para verificar la tabla comparativa entre PSP y Prefix-8 sin reentrenar nada.
- Auditoría de una comparación head-to-head: el repositorio permite revisar las trazas por prompt y repetición para comprobar que ambos métodos consumen el mismo presupuesto lógico (256 evaluaciones) y que las semillas están correctamente emparejadas.
- Línea base para nuevos selectores de candidatos en difusión: Prefix-8 puede usarse como referencia congelada al proponer variantes de exploración/rerun, ya que las métricas y el protocolo de semillas están fijados.
- Estudio de correlación entre métricas: al incluir ImageReward, HPS v2.1 y GenEval sobre las mismas 3.318 imágenes, es posible analizar en qué casos las tres métricas coinciden y en qué casos discrepan (por ejemplo, el delta negativo de HPS frente al positivo de ImageReward).
- Análisis estadístico de significancia: los resúmenes pareados con bootstrap permiten reutilizar la metodología para estudiar si una diferencia observada cae dentro o fuera del intervalo de confianza, evitando conclusiones basadas en medias simples.
- Estimación de coste computacional en hardware de consumo: los resúmenes de tiempo de ejecución permiten extrapolar el coste de esquemas de muestreo con exploración y rerun en una única GPU de 24 GB.
- Docencia y formación en evaluación de modelos generativos: el repositorio sirve como ejemplo completo de pipeline de evaluación con prompts oficiales, semillas reproducibles, métricas automáticas y análisis estadístico pareado.

## Benchmarks y rendimiento

Resultados principales publicados en la model card (comparación pareada, bootstrap sobre 553 prompts; W/T/L = victorias/empates/derrotas de Prefix-8 frente a PSP):

| Metrica | Prefix-8 | PSP | Delta (Prefix-8 - PSP) | IC 95 % | W/T/L |
|---|---:|---:|---:|---|---|
| ImageReward | 0,885867 | 0,857099 | +0,028768 | [+0,005398, +0,052932] | 311/0/242 |
| HPS | 0,279760 | 0,280891 | -0,001131 | [-0,002114, -0,000173] | 279/0/274 |
| GenEval | 0,544907 | 0,551537 | -0,006630 | [-0,021097, +0,007233] | 21/510/22 |

Lectura técnica de los datos aportados: el intervalo de confianza de ImageReward queda íntegramente por encima de cero, el de HPS queda íntegramente por debajo de cero y el de GenEval cruza el cero. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, por no tratarse de un modelo de lenguaje. Tampoco se ofrecen cifras absolutas de tiempo o throughput más allá de la referencia al hardware empleado.

## Requisitos de hardware

- Hardware empleado en las ejecuciones reportadas: 1 x RTX 4090 de 24 GB.
- VRAM estimada adicional: no disponible en la información proporcionada (las ejecuciones son fp16 sobre SD 1.5 a 512x512, con DDIM y `T=64`).
- GPU recomendadas: no disponible; el único dato disponible es la RTX 4090 de 24 GB utilizada por el autor.
- Encaje en GPU de consumo: no confirmado explícitamente en la información disponible, aunque el autor completó la evaluación completa en una única RTX 4090.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio se ejecuta mediante scripts Python propios (`evaluate_hps_table1.py`, `run_geneval_table1.sh`, `aggregate_table1.py`).
- Latencia y throughput: no disponibles numéricamente; solo se indica que existen resúmenes de tiempo de ejecución dentro de `results/`.
- Almacenamiento: el repositorio ocupa 2,3 GB, de los cuales una parte corresponde a `results/images.tar` (3.318 PNG finales) y otra a `results/metadata.tar.gz`.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo con pesos publicados y la búsqueda web realizada no devolvió información relevante sobre el mismo ni sobre alternativas comparables; los resultados obtenidos corresponden a páginas de soporte de Microsoft sin relación con el contenido. La única comparación documentada es interna: PSP frente a Prefix-8 sobre el mismo backbone, con los resultados reflejados en la sección de benchmarks.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia: no se publican pesos ni pipeline, solo código de evaluación, resultados, trazas e imágenes.
- No se declara licencia, por lo que no puede asumirse permiso para uso comercial ni redistribución de los artefactos.
- La evaluación se limita a un único backbone (SD 1.5), una única resolución (512x512), un único sampler (DDIM, `T=64`, `eta=0`, `CFG 7.5`) y al conjunto de 553 prompts de GenEval, en inglés.
- Los resultados no son extrapolables a otros modelos de difusión, otras resoluciones, otros samplers ni otros idiomas sin una reevaluación completa.
- En GenEval el intervalo de confianza del delta cruza el cero, por lo que la diferencia observada no puede considerarse concluyente con los datos publicados.
- En HPS la diferencia es negativa y el intervalo excluye el cero, lo que indica una ventaja de PSP en esa métrica; conviene no presentar Prefix-8 como superior de forma global.
- Prefix-8 se describe como extensión experimental de TQK, no como método con publicación revisada por pares; el propio repositorio indica que PSP debe citarse a través del paper de Guimaraes & Perona (ECCV 2026).
- El repositorio tiene 0 descargas y 0 likes, sin señales externas de validación por parte de la comunidad.
- Las fechas de creación y actualización (septiembre de 2026) son posteriores a la fecha habitual de consulta, lo que conviene verificar antes de citar el artefacto.
- Riesgo de alucinación y sesgos del modelo subyacente: no evaluados en la información disponible; las métricas reportadas miden alineación prompt-imagen, no veracidad factual.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LamTNguyen/TQK-table1-psp-vs-prefix-sd15
- Backbone evaluado: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Paper de PSP citado en la model card: Guimaraes & Perona, ECCV 2026 (no se proporciona URL en la información disponible)
- GenEval (conjunto de 553 prompts y métrica oficial): no se proporciona URL en la información disponible
- ImageReward, HPS v2.1, Mask2Former y OpenCLIP: no se proporcionan URLs en la información disponible
- Resultados de la búsqueda web: no se encontraron enlaces relevantes al repositorio ni a su método; los resultados devueltos corresponden a páginas de soporte de Microsoft sin relación con el contenido.
