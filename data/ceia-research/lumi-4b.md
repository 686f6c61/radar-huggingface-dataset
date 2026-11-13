# ceia-research/lumi-4b

## Resumen

Lumi-4B es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por el equipo de PLN del CEIA (Centro de Excelencia en Inteligencia Artificial) de la Universidad Federal de Goiás (UFG). Se construye a partir de NVIDIA-Nemotron-3-Nano-4B mediante un pipeline de preentrenamiento continuo (CPT) con destilación de conocimiento, seguido de ajuste supervisado (SFT), con el objetivo de reforzar el rendimiento en portugués brasileño sin degradar las capacidades en inglés ni las competencias STEM.

El modelo parte de la arquitectura Nemotron 3 Nano, un transformer de 3.973.556.832 parámetros empaquetados en safetensors (repo de 15,9 GB en BF16). Durante el CPT se entrenaron 50.000 millones de tokens usando Nemotron 3.5 Lightning como profesor de destilación, con una mezcla que combina corpus web y documental con datasets especializados y de estilo SFT. Posteriormente se aplicó SFT sobre datos conversacionales e instrucciones en portugués brasileño.

La relevancia actual del modelo radica en su enfoque de especialización lingüística de bajo coste: parte de un modelo base abierto, lo adapta a un idioma concreto con datos curados por un clasificador de calidad educativa propio y conserva el rendimiento en matemáticas y código. La versión publicada es la v0.2 (6 de noviembre de 2026), que actualiza la mezcla de datos del CPT respecto a la v0.1 del 29 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Nano (transformer; detalles en la model card de NVIDIA) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Portugues (brasileno) e ingles |
| Licencia | TODO (sin confirmar en la model card) |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint NVIDIA-Nemotron-3-Nano-4B-BF16, por lo que los detalles estructurales (tipo de atención, tokenizador, ventana de contexto) remiten a la model card de NVIDIA, no documentada en la ficha de Lumi. El entrenamiento se organiza en dos fases: primero un preentrenamiento continuo de 50.000 millones de tokens con destilación de conocimiento desde Nemotron 3.5 Lightning, y después un ajuste supervisado sobre datos de chat e instrucciones en portugués brasileño.

La mezcla de datos del CPT incluye corpus web y documental (HuggingFaceFW/finepdfs-edu, HuggingFaceFW/fineweb-2, Polygl0t/gigaverbo-v2, nvidia/Nemotron-CC-v2.1) junto con datasets de preentrenamiento especializados y de estilo SFT (nvidia/Nemotron-Pretraining-Specialized-v1.1, nvidia/Nemotron-Pretraining-SFT-v1). El componente en portugués se filtró con un clasificador de calidad educativa entrenado por el propio equipo, que retiene únicamente contenido de alta calidad educativa. Esta release no incluye RL, RLVR ni entrenamiento de identidad del modelo.

## Capacidades

- Generación de texto conversacional en portugués brasileño e inglés.
- Razonamiento y respuesta a instrucciones tras SFT sobre datos de chat.
- Conservación de competencias STEM: matemáticas y programación, preservadas explícitamente durante CPT y SFT.
- Capacidad bilingüe portugués-inglés, con especialización declarada en portugués brasileño.
- Modo thinking presente en la plantilla de chat heredada del modelo base, pero debe permanecer desactivado en esta release (`enable_thinking=False`).
- Tool calling / function calling: no documentado ni validado en esta release (marcado como TODO en la model card).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia conversacional en portugués brasileño: el modelo está ajustado con SFT sobre diálogos e instrucciones en pt-BR, por lo que es adecuado para chatbots de atención al cliente orientados al mercado brasileño que requieran registro culto y coherencia multi-turno.
- Generación de contenido educativo: el CPT filtró el corpus en portugués con un clasificador de calidad educativa, lo que lo hace idóneo para redactar materiales didácticos, resúmenes de textos académicos o explicaciones graduadas por nivel.
- Soporte a la programación en entornos lusófonos: al conservar capacidades de código, puede emplearse para autocompletado, explicación de fragmentos y generación de tests en proyectos con documentación en portugués.
- Traducción y adaptación pt-BR ↔ en: su naturaleza bilingüe permite tareas de traducción, localización de documentación técnica y adaptación de contenido entre ambos idiomas.
- Procesamiento de documentación técnica y administrativa: con el corpus documental del CPT (finepdfs-edu, Nemotron-CC), puede resumir informes, extraer entidades y responder preguntas sobre textos largos dentro del contexto soportado.
- Despliegue en infraestructura modesta: con ~4.000 millones de parámetros, es viable en una única GPU de consumo para prototipos, servicios internos o entornos de investigación con presupuesto limitado.
- Investigación en adaptación lingüística: sirve como referencia reproducible para estudiar CPT con destilación de conocimiento aplicada a idiomas de recursos medios como el portugués.

## Benchmarks y rendimiento

La model card referencia gráficas de evolución del modelo y de rendimiento en tareas de portugués e inglés (`lumi_versoes.svg`, `pt_benchmarks.svg`, `en_benchmarks.svg`), pero no incluye los valores numéricos en el texto disponible. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-24 GB para inferencia cómoda con contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~4-5 GB de pesos; en 4 bits, ~2,5-3 GB, aunque no se publican checkpoints cuantizados oficiales.
- GPU recomendadas para producción: NVIDIA A100 40/80 GB, H100 o L40S para despliegues con concurrencia y contexto largo; tensor parallelism disponible vía vLLM.
- GPU de consumo: cabe en RTX 4090 (24 GB) y, con cuantización, en RTX 3090, RTX 4080 o incluso GPUs de 8-12 GB para contextos cortos.
- Opciones de despliegue: vLLM es la vía documentada por el autor (servidor OpenAI-compatible con `--default-chat-template-kwargs '{"enable_thinking": false}'`). Otras alternativas como llama.cpp, Ollama o TGI no están validadas en la información disponible.
- Latencia y throughput: no disponibles; la model card marca como TODO los parámetros de generación recomendados y las versiones de inferencia probadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CEIA Lumi-4B | 3.973.556.832 | no disponible | pt, en | TODO (sin confirmar) | Hugging Face (ceia-research/lumi-4b) |
| NVIDIA Nemotron-3-Nano-4B | no disponible en esta ficha | no disponible | no disponible | segun model card de NVIDIA | Hugging Face (nvidia) |
| Tucano / modelos pt-BR de 3-4B | no disponible | no disponible | pt | no disponible | no disponible |

El modelo base NVIDIA-Nemotron-3-Nano-4B es la referencia directa: Lumi-4B se presenta como una adaptación al portugués con preservación de las capacidades STEM del original. No se dispone de datos numéricos para comparar rendimiento frente a otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia sin confirmar: la model card marca la licencia como TODO, por lo que no puede garantizarse el uso comercial hasta que el autor la publique.
- El modo thinking debe permanecer desactivado en esta release; activarlo puede producir respuestas degradadas o inconsistentes.
- No se ha realizado entrenamiento de identidad del modelo, por lo que puede responder de forma imprecisa sobre quién es o qué versión ejecuta.
- Tool calling y function calling no están documentados ni validados; no deben asumirse en producción.
- No se han publicado benchmarks numéricos ni parámetros de generación recomendados, lo que dificulta la reproducibilidad.
- Riesgo de alucinación inherente a un modelo de 4B sin RL ni RLVR; especialmente en dominios factuales especializados.
- Sesgos potenciales heredados de los corpus web y documentales (fineweb-2, Nemotron-CC, gigaverbo-v2), no auditados en la información disponible.
- Cobertura lingüística limitada a portugués e inglés; el rendimiento en otros idiomas no está garantizado.
- Longitud de contexto efectiva no validada; la model card indica que debe confirmarse con el checkpoint liberado.
- El identificador de repositorio aparece como `ceia-br/lumi-4b` en los ejemplos de uso, mientras que el ID real es `ceia-research/lumi-4b`; conviene verificar la ruta antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ceia-research/lumi-4b
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Documentación de vLLM: https://docs.vllm.ai/en/stable/cli/serve/
- Contacto del autor: diogo_fernandes@discente.ufg.br
- Página del proyecto Lumi: no disponible (marcada como TODO en la model card)
