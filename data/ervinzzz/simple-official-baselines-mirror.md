# ErvinZzz/simple-official-baselines-mirror

## Resumen

Este repositorio no es un modelo entrenado, sino un espejo (mirror) de checkpoints públicos de referencia utilizados en el benchmark SIMPLE. Lo mantiene la cuenta de Hugging Face ErvinZzz con el objetivo de fijar bytes exactos para una evaluación reproducible: cada fichero se ha verificado como byte-idéntico a su origen mediante sha256 (o git blob id en ficheros pequeños). No se ha entrenado ni modificado nada; todos los derechos permanecen en los autores originales.

El repositorio agrupa cinco conjuntos de ficheros provenientes de cuatro repositorios fuente: `ChenyuanC/groot-simple-seven-40k-s42` (145 ficheros, 42,86 GiB, licencia NVIDIA no comercial), `GEAR-Dreams/DreamZero-AgiBot` (17 ficheros, 42,70 GiB, Apache 2.0), `USC-PSI-Lab/psi-model` en dos revisiones (185 + 5 ficheros, 68,31 + 5,82 GiB, sin licencia declarada) y `Wan-AI/Wan2.1-I2V-14B-480P` (33 ficheros, 76,62 GiB, Apache 2.0). El tamaño total del repositorio es de 253,7 GB.

La relevancia de este tipo de espejo es metodológica: permite a investigadores reproducir exactamente una evaluación sobre pesos inmutables, algo crítico cuando los repositorios originales pueden actualizarse o retirarse. La librería declarada es diffusers, lo que sugiere que los checkpoints están orientados a modelos generativos (difusión, vídeo, políticas robóticas), aunque la información disponible no detalla la arquitectura interna de cada uno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio espejo de múltiples checkpoints; no se describe arquitectura propia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (agregada); licencias individuales por carpeta: NVIDIA License no comercial, Apache 2.0, y sin licencia declarada para `USC-PSI-Lab/psi-model` |
| Formato de pesos | safetensors (tag declarado); diffusers |
| Tamano del repositorio | 253,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-18 |
| Ultima actualizacion | 2026-11-18 |

## Arquitectura y entrenamiento

No aplica en sentido estricto: este repositorio no contiene un modelo entrenado por su autor, sino copias byte-idénticas de checkpoints de terceros. La model card indica explícitamente que "nothing here was trained or changed by the account that hosts this mirror". Por tanto, no hay información sobre datos de entrenamiento, número de tokens, RLHF/DPO ni innovaciones técnicas propias.

Lo que sí documenta el repositorio es un mecanismo de integridad: cada fichero se verificó comparando su sha256 con el LFS object id del origen (o el git blob id en ficheros pequeños), y se incluye un fichero `MANIFEST.tsv` que lista cada fichero con su ruta de origen, revisión y sha256. Esta es la única "innovación" técnica del repo: trazabilidad criptográfica de los pesos para reproducibilidad de evaluaciones.

## Capacidades

- No es un modelo con capacidades propias; las capacidades dependen de cada checkpoint espejado.
- Los checkpoints espejados incluyen, por sus nombres, modelos de política robótica (`groot-simple-seven-40k-s42`), modelos generativos de vídeo imagen-a-vídeo (`Wan2.1-I2V-14B-480P`), y otros modelos de difusión/robótica (`DreamZero-AgiBot`, `psi-model`).
- Verificación de integridad de pesos mediante sha256 y `MANIFEST.tsv`.
- Fijación de revisiones concretas (p. ej. `0a2ca57bdff7`, `a8e108456e53`, `40387265a606`, `74d7abaa61b5`, `6b73f84e6637`).
- No se declaran capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento para este repositorio.

## Casos de uso

- Reproducibilidad de benchmarks: usar los pesos fijados por sha256 para que una evaluación del benchmark SIMPLE dé resultados idénticos en distintas máquinas y momentos, evitando que una actualización del repo original altere los resultados.
- Auditoría de evaluaciones: comparar el `MANIFEST.tsv` con los repositorios fuente para verificar que los pesos usados en un paper corresponden exactamente a los publicados.
- Archivado a largo plazo: conservar copias de checkpoints que podrían retirarse o modificarse en sus repositorios originales, con garantía de integridad criptográfica.
- Investigación en robótica y generación de vídeo: disponer de los checkpoints `groot-simple-seven-40k-s42`, `DreamZero-AgiBot`, `psi-model` y `Wan2.1-I2V-14B-480P` en un único punto de descarga para experimentos comparativos.
- Docencia y formación: ofrecer a estudiantes un conjunto de pesos verificados para prácticas de evaluación sin depender de la disponibilidad de múltiples repositorios.
- Infraestructura de CI para ML: integrar la verificación sha256 en pipelines que descargan pesos, detectando corrupción o sustitución de ficheros antes de lanzar una evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo de pesos, no un modelo evaluado; la model card no incluye métricas de rendimiento de los checkpoints espejados.

## Requisitos de hardware

- Almacenamiento: 253,7 GB para el repositorio completo; por carpeta, entre 5,82 GiB y 76,62 GiB.
- VRAM estimada para inferencia: no disponible (depende de cada checkpoint; `Wan2.1-I2V-14B-480P` sugiere un modelo de 14B parámetros en el nombre, pero no se confirma ni se detalla su consumo).
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer?: no disponible; algunos checkpoints podrían no caber en GPUs de consumo por tamaño, pero no hay datos confirmados.
- Opciones de despliegue: la librería declarada es diffusers; no se detallan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo comparable con otros modelos, sino un agregador de checkpoints de terceros. Una comparación requeriría evaluar cada checkpoint espejado por separado frente a sus alternativas en su categoría (robótica, generación de vídeo, difusión), para lo cual la información proporcionada es insuficiente.

## Limitaciones y advertencias

- No es un modelo utilizable directamente: es un espejo de pesos de otros repositorios; para usarlo hay que consultar la documentación de cada fuente.
- Licencias heterogéneas: `ChenyuanC/groot-simple-seven-40k-s42` usa NVIDIA License no comercial (prohíbe uso comercial), `USC-PSI-Lab/psi-model` no declara licencia en su model card (lo que implica ausencia de permisos explícitos), y `Wan-AI/Wan2.1-I2V-14B-480P` y `DreamZero-AgiBot` son Apache 2.0.
- La licencia agregada del repositorio es "other", lo que no aclara los términos de uso de cada carpeta; hay que revisar la licencia de cada fuente.
- Riesgo de alucinación y sesgos: no aplica al repositorio en sí, pero los checkpoints espejados pueden tenerlos y no se documentan aquí.
- Sin garantías del mantenedor: la model card indica que no se ha entrenado ni modificado nada y que los derechos son de los autores originales.
- Posible retirada: el autor ofrece eliminar copias a petición de los autores originales, por lo que la disponibilidad a largo plazo no está garantizada.
- Sin métricas, idiomas ni contexto declarados: no hay información para evaluar idoneidad en producción.

## Enlaces

- Repositorio espejo: https://huggingface.co/ErvinZzz/simple-official-baselines-mirror
- Fuente `ChenyuanC/groot-simple-seven-40k-s42`: https://huggingface.co/ChenyuanC/groot-simple-seven-40k-s42
- Fuente `GEAR-Dreams/DreamZero-AgiBot`: https://huggingface.co/GEAR-Dreams/DreamZero-AgiBot
- Fuente `USC-PSI-Lab/psi-model`: https://huggingface.co/USC-PSI-Lab/psi-model
- Fuente `Wan-AI/Wan2.1-I2V-14B-480P`: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
