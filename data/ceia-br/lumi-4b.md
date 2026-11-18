# ceia-br/lumi-4b

## Resumen

Lumi-4B es un modelo de lenguaje de 4.000 millones de parámetros (3.973.556.832 exactos según los pesos en safetensors) desarrollado por el equipo de PLN del CEIA/UFG (Centro de Excelencia en Inteligencia Artificial de la Universidad Federal de Goiás, Brasil). Se distribuye como modelo *instruct* orientado a la generación de texto conversacional en portugués brasileño, con soporte declarado también para inglés. Parte del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` y se ha construido mediante *continual pre-training* (CPT) con destilación de conocimiento, seguido de *supervised fine-tuning* (SFT).

El problema que aborda es la escasez de modelos pequeños, abiertos y específicamente optimizados para portugués brasileño con calidad educativa y preservación de capacidades STEM (matemáticas y código). Durante el CPT se entrenaron 50.000 millones de tokens usando Nemotron 3.5 Lightning como profesor de destilación, combinando corpus web y de documentos con datasets especializados y de estilo SFT. La mezcla incluye datos de `HuggingFaceFW/fineweb-2`, `HuggingFaceFW/finepdfs-edu`, `Polygl0t/gigaverbo-v2`, `nvidia/Nemotron-CC-v2.1`, `nvidia/Nemotron-Pretraining-Specialized-v1.1` y `nvidia/Nemotron-Pretraining-SFT-v1`.

Es relevante ahora porque la versión v0.2 (6 de noviembre de 2026) mejora la mezcla de datos de CPT respecto al lanzamiento inicial del 29 de octubre de 2026, y porque representa un esfuerzo regional (Brasil) por producir modelos abiertos en una lengua con menor cobertura que el inglés. La arquitectura concreta se remite a la model card de NVIDIA del modelo base (etiqueta `nemotron_h`), e incluye código personalizado (`custom_code`) en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; heredada de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` (tag `nemotron_h`) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (la model card deja como TODO la longitud validada) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16/safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | Portugués (pt) e inglés (en), según la model card; el campo de idioma del repo solo declara `pt` |
| Licencia | No disponible (la model card marca `# license: TODO — confirm the release license.`) |
| Formato de pesos | safetensors (con `custom_code`) |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 |
| Tamano del repo | 15,9 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-27 |
| Ultima actualizacion | 2026-11-06 |

## Arquitectura y entrenamiento

La arquitectura no se describe en la información disponible: la model card remite explícitamente a la model card de NVIDIA del modelo base para los detalles de arquitectura y tokenizador. El tag `nemotron_h` sugiere una variante de la familia Nemotron, pero no se confirma en los datos proporcionados si se trata de un transformer denso, un MoE o una arquitectura híbrida. El modelo tiene 3.973.556.832 parámetros y se publica en safetensors con código personalizado, lo que implica que la carga requiere confiar en el código del repositorio o en el soporte de la librería correspondiente.

El entrenamiento consta de tres fases declaradas: (1) *continual pre-training* sobre 50.000 millones de tokens con destilación de conocimiento desde Nemotron 3.5 Lightning como profesor; (2) mezcla de datos que combina corpus web y de documentos con datasets especializados y de estilo SFT, incluyendo un clasificador de calidad educativa entrenado por el propio equipo para retener solo contenido educativo de alta calidad en portugués; y (3) *supervised fine-tuning* con datos de chat e instrucciones para interacción conversacional en portugués brasileño. No se aplicó RL, RLVR ni entrenamiento dedicado de identidad de modelo en esta versión. El modo *thinking* debe permanecer desactivado (`enable_thinking=False`).

## Capacidades

- Generación de texto conversacional en portugués brasileño e inglés.
- Instrucciones y diálogo multi-turno mediante plantilla de chat del checkpoint.
- Preservación declarada de capacidades STEM: matemáticas y programación, gracias al diseño del pipeline de CPT y SFT.
- Calidad educativa reforzada en portugués mediante filtrado con clasificador propio.
- Modo *thinking*: existe el control heredado del modelo base, pero debe permanecer desactivado en esta release.
- *Tool calling* / *function calling*: no validado; la model card lo marca como TODO y no documenta si se incluyó en post-entrenamiento.
- Razonamiento multi-paso y agentes: no documentado ni validado.
- Identidad de modelo: sin entrenamiento dedicado; planificado para una release futura.
- Multilingüismo: limitado a portugués e inglés según la model card.

## Casos de uso

- Asistencia educativa en portugués brasileño: el modelo se entrenó con un clasificador de calidad educativa que retiene contenido didáctico de alta calidad, lo que lo hace adecuado para tutoría, explicación de conceptos y generación de material de estudio en pt-BR.
- Atención al cliente en portugués: puede gestionar conversaciones multi-turno con la plantilla de chat del checkpoint; conviene desplegarlo con vLLM y la API compatible con OpenAI para integrarlo en sistemas de soporte.
- Generación de texto y redacción en pt-BR: resúmenes, reescritura y producción de contenido en portugués brasileño con un modelo de 4B parámetros desplegable en hardware modesto.
- Tareas de código y matemáticas en contextos bilingües: el pipeline se diseñó para preservar capacidades STEM, por lo que puede usarse para asistencia de programación y resolución de problemas matemáticos, validando previamente la calidad con evaluaciones propias.
- Prototipado e investigación en PLN para portugués: al ser un modelo abierto de 4B con CPT y destilación documentados, sirve como base para experimentos de *fine-tuning* y evaluación en lengua portuguesa.
- Despliegue en entornos con recursos limitados: con ~4B parámetros en BF16 (repo de 15,9 GB), es candidato para inferencia en una sola GPU, aunque la cuantización no está documentada oficialmente.
- Traducción y adaptación pt-BR ↔ en: el modelo declara competencia bilingüe, útil para tareas de traducción y localización, con revisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

La model card incluye gráficas de evolución del modelo y de rendimiento en tareas de portugués e inglés (`lumi_versoes.svg`, `pt_benchmarks.svg`, `en_benchmarks.svg`), pero no se proporcionan los valores numéricos en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~4B parámetros en BF16, se requieren aproximadamente 8 GB solo para pesos, más memoria para KV cache y activaciones; en la práctica, entre 10 y 16 GB según longitud de contexto y lote. No hay datos oficiales de cuantización.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16 con margen; GPUs de 16 GB pueden ser ajustadas según la longitud de contexto.
- GPU de consumo: cabe en RTX 4090 y probablemente en RTX 4080/3090 (24 GB); en tarjetas de 12-16 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: vLLM es el método documentado en la model card (`vllm serve ceia-br/lumi-4b --default-chat-template-kwargs '{"enable_thinking": false}'`), con API compatible con OpenAI. No se documentan llama.cpp, Ollama ni TGI; el uso de `custom_code` puede complicar la conversión a GGUF.
- Latencia y throughput: no disponibles. La model card deja como TODO las versiones de inferencia validadas y los parámetros de generación recomendados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ceia-br/lumi-4b | ~4B | No disponible | pt, en | No disponible | CPT + destilación desde Nemotron 3.5 Lightning; SFT; sin RL |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | No disponible | No disponible | No disponible | Modelo base del que deriva Lumi |
| Alternativas pt-BR de tamano similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento numéricos para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia sin confirmar: la model card marca la licencia como TODO, por lo que no se puede garantizar el uso comercial hasta que el autor la publique.
- Modo *thinking* desactivado obligatoriamente en esta release; activarlo puede producir comportamiento no validado.
- Sin entrenamiento de identidad de modelo: puede responder de forma inconsistente sobre quién es o qué modelo es.
- *Tool calling* no validado: no se documenta si el post-entrenamiento incluyó function calling.
- Riesgo de alucinación inherente a un modelo de 4B; requiere verificación en producción, especialmente en dominios factuales.
- Cobertura lingüística limitada a portugués e inglés; el campo de idioma del repo solo declara `pt`.
- Longitud de contexto no validada ni documentada.
- Sin RL ni RLVR: el alineamiento depende únicamente del SFT.
- Requiere `custom_code` para cargar el checkpoint, lo que añade dependencia del código del repositorio y posibles problemas de compatibilidad con herramientas de inferencia.
- Sesgos: no documentados en la información disponible; cabe esperar sesgos de los corpus web y de los datos de destilación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ceia-br/lumi-4b
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Documentación de vLLM: https://docs.vllm.ai/en/stable/cli/serve/
- Dataset HuggingFaceFW/finepdfs-edu: https://huggingface.co/datasets/HuggingFaceFW/finepdfs-edu
- Dataset HuggingFaceFW/fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Polygl0t/gigaverbo-v2: https://huggingface.co/datasets/Polygl0t/gigaverbo-v2
- Dataset nvidia/Nemotron-CC-v2.1: https://huggingface.co/datasets/nvidia/Nemotron-CC-v2.1
- Dataset nvidia/Nemotron-Pretraining-Specialized-v1.1: https://huggingface.co/datasets/nvidia/Nemotron-Pretraining-Specialized-v1.1
- Dataset nvidia/Nemotron-Pretraining-SFT-v1: https://huggingface.co/datasets/nvidia/Nemotron-Pretraining-SFT-v1
- Contacto: diogo_fernandes@discente.ufg.br
