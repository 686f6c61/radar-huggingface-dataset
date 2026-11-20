# anusasaha/NLA_analysis_v2

## Resumen

NLA_analysis_v2 es un repositorio de código y datos asociado al artículo de investigación "Do Activation Explanations Survive Translation?", publicado por el autor anusasaha en Hugging Face. No se trata de un modelo de lenguaje entrenado, sino de un conjunto de scripts de análisis de mecanismos internos (interpretabilidad) que operan sobre modelos preentrenados de terceros (Qwen 7B, Gemma 12B y Gemma 27B) para estudiar si las explicaciones de activaciones neuronales sobreviven a la traducción entre idiomas.

El repositorio implementa un pipeline reproducible de experimentos con niveles (tiers) de datos multilingües basados en FLORES, Belebele y SIB, e incluye conjuntos de datos propios en inglés, hindi, urdu y español, además de un conjunto regional de 120 frases en inglés. El objetivo científico es auditar la fidelidad de las explicaciones de activaciones (activation explanations) generadas por modelos de lenguaje cuando el texto se traduce, evaluando claims, intervenciones y mecanismos de verbalización.

El tamaño del repositorio (42,8 GB) sugiere que incluye pesos, activaciones o artefactos intermedios de los modelos analizados, no solo código. La relevancia actual reside en el campo de la interpretabilidad mecanicista y la evaluación de la robustez de las explicaciones automáticas en contextos multilingües, un área con creciente interés para auditar modelos antes de desplegarlos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no define una arquitectura propia; analiza modelos preentrenados Qwen 7B, Gemma 12B y Gemma 27B) |
| Parametros totales | no disponible (depende del modelo analizado: 7B, 12B o 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 21 variantes: inglés, hindi, hindi romanizado, urdu, urdu romanizado, bengalí, bengalí romanizado, marathi, tamil, español, francés, portugués, ruso, serbio, serbio romanizado, árabe, chino, japonés, coreano, swahili y yoruba (según los tiers del pipeline) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene scripts Python y datos CSV/JSONL; no se especifican pesos propios) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino un marco experimental para interpretabilidad mecanicista. Los scripts (`nla_flores.py`, `av_mech.py`, `alignment_rescue.py`, `plots.py`, entre otros) orquestan experimentos sobre modelos de terceros: Qwen 7B, Gemma 12B y Gemma 27B, todos los cuales caben en una única GPU A100 de 80 GB según la documentación. El pipeline se organiza en fases (`data`, `core`, `capability`, `mech`, `verbalizer`, `prior`, `fixes`, `metrics`, `export`, `post`, `scale`) que se ejecutan secuencialmente mediante `run_all.sh`.

Los datos de entrenamiento no aplican al repositorio en sí; los conjuntos de datos incluidos son `data/authored.csv` (90 ítems en inglés, hindi, urdu y español, 360 filas, con condiciones neutral, culture_marked y place_named equilibradas en seis regiones) y `data/region.csv` (120 frases en inglés, 20 por región). Los tiers de evaluación cubren desde 120 frases de FLORES ∩ Belebele ∩ SIB con 21 variantes hasta 400 frases en t2, además de conjuntos de fragmentación forzada (tier f), traducciones humanas frente a NLLB (tier p) y scripts candidatos (tier c: amárico, georgiano, tailandés, birmano). No se documenta RLHF, DPO ni entrenamiento de pesos; el foco es la evaluación de explicaciones de activaciones, con intervenciones de trasplante, borrado y sondas de región.

## Capacidades

- Extracción y análisis de explicaciones de activaciones (activation explanations) en modelos transformer preentrenados.
- Evaluación de fidelidad de explicaciones por token y por palabra (puntuación 0-3 en el conjunto `fidelity/`).
- Intervenciones mecanísticas: trasplante, borrado (erase) y sondas de región sobre activaciones internas.
- Análisis de verbalización de mecanismos (`mech_verbalizer.py`, `mech_target.py`).
- Soporte de múltiples tokenizadores y fragmentación controlada (caracteres, bytes, 1-6×) para estudiar robustez.
- Evaluación multilingüe en 21 variantes lingüísticas, incluyendo romanizaciones.
- Exportación de artefactos para anotación humana en `for_judging/` (sin LLM-as-judge integrado).
- Capacidades de generación libre limitadas a experimentos N2, N3, N5 y N6 sobre los modelos analizados.
- No incluye tool calling, function calling, agentes ni visión; es un framework de investigación, no un modelo de propósito general.

## Casos de uso

- Auditoría de interpretabilidad multilingüe: investigadores pueden ejecutar el pipeline para comprobar si las explicaciones de activaciones de un modelo (por ejemplo, Gemma 12B) se mantienen coherentes al traducir una frase del inglés al hindi o al español, usando los tiers t1 y t2 con 21 variantes.
- Estudio de sesgos culturales y geográficos: el conjunto `data/authored.csv` permite comprobar si una frase en hindi sobre Madrid recibe un encuadre del sur de Asia, gracias a las condiciones `culture_marked` y `place_named` equilibradas por región.
- Evaluación de robustez de tokenizadores: el tier f fuerza fragmentación de 1-6× más caracteres y bytes por tokenizador, útil para analizar cómo la tokenización afecta la fidelidad de las explicaciones.
- Comparación de traducciones humanas frente a NLLB: el tier p (hindi, español, árabe, chino) permite contrastar explicaciones sobre traducciones humanas y automáticas.
- Anotación humana asistida: `export.py` genera archivos JSONL en `for_judging/` con claims, explicaciones y salidas del modelo, listos para revisión manual sin depender de un juez LLM.
- Reproducción de experimentos a escala: `run_all.sh` con fases `data`, `core`, `mech`, `scale` permite reproducir el estudio completo en una A100 80GB, con reanudación automática de ejecuciones interrumpidas.
- Investigación de scripts de bajos recursos: el tier c (amárico, georgiano, tailandés, birmano) explora si el marco funciona en alfabetos no latinos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (MMLU, HumanEval, GSM8K ni similares); describe únicamente el pipeline, los tiers y los artefactos de evaluación.

## Requisitos de hardware

- Una GPU A100 de 80 GB es suficiente para ejecutar los tres modelos analizados (Qwen 7B, Gemma 12B, Gemma 27B) según la documentación.
- `DEVICE_MAP=auto` permite repartir un modelo entre varias GPU, aunque las fases de intervención asumen una única GPU.
- Ajuste automático de batch ante errores de CUDA out-of-memory: el pipeline reduce el batch a la mitad y continúa.
- Variables de entorno para control de memoria: `EXPLAIN_BATCH`, `RECONSTRUCT_BATCH`, `EXTRACT_BATCH`.
- Dependencias opcionales: `fasttext` (etiquetas de idioma), `sae-lens` (etapa SAE de `mech_target.py`), `unbabel-comet` (filtro de calidad COMET, no instalable en Python 3.12 con numpy 2).
- No se proporcionan datos de latencia ni throughput; no disponible.
- Cabe en GPU consumer: no disponible (el tamaño de 42,8 GB del repositorio y los modelos de hasta 27B sugieren que no es viable en GPUs consumer típicas, pero no se confirma en la documentación).

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de lenguaje comparable con alternativas de la misma categoría; es un framework de interpretabilidad que analiza Qwen 7B, Gemma 12B y Gemma 27B. No se han publicado comparaciones con otros frameworks de interpretabilidad mecanicista en la información disponible.

## Limitaciones y advertencias

- No es un modelo desplegable: es código de investigación y datos; no debe usarse como modelo generativo en producción.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución de los artefactos (42,8 GB) sin consultar al autor.
- Las traducciones al hindi y urdu de `data/authored.csv` deben ser revisadas por un hablante nativo antes de su uso en el artículo, según la propia model card.
- Sin LLM-as-judge: cualquier evaluación que requiera juicio queda en `for_judging/` para inspección manual; los scripts de análisis omiten las partes cuyos juicios faltan.
- Dependencias frágiles: `unbabel-comet` no instala en Python 3.12 con numpy 2; `sae-lens` puede intentar cambiar torch o transformers.
- Las fases de intervención asumen una única GPU; el reparto multi-GPU solo cubre la inferencia.
- Riesgo de sesgos culturales y geográficos en los datos: el propio diseño del conjunto busca medirlos, pero no se documentan resultados.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de contexto de los modelos analizados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/anusasaha/NLA_analysis_v2
- Artículo referenciado en la model card: "Do Activation Explanations Survive Translation?" (no se proporciona URL directa en la información disponible)
- Repositorio de código: incluido en el propio repositorio de Hugging Face (scripts `nla_flores.py`, `av_mech.py`, `run_all.sh`, entre otros)
- Datos: `data/authored.csv` y `data/region.csv` dentro del repositorio
- No se han encontrado papers, blogs, demos ni repositorios externos adicionales en la búsqueda web.
