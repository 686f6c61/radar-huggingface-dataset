# CrowdMind/Qwen3.5-9b-sft

## Resumen

CrowdMind/Qwen3.5-9b-sft es un ajuste supervisado (SFT) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario CrowdMind y atribuido en la model card a Dustin Loring. El repositorio contiene 9.409.813.744 parámetros en formato safetensors (18,8 GB de pesos), lo que sitúa al modelo en la franja de ~9,4 mil millones de parámetros, con licencia MIT y pipeline declarado image-text-to-text.

El objetivo del ajuste es mejorar el comportamiento agéntico y el uso de herramientas respecto al modelo base. La model card publica una tabla de evaluación propia en la que el checkpoint SFT supera de forma notable al base en tareas de automatización, terminal, OfficeQA y JobBench, además de una mejora sustancial en SWE Pro (32,0 a 44,6 en avg@3). Es relevante para quien busque un modelo de tamaño medio, desplegable en una sola GPU, orientado a agentes y código, con plantilla de chat de "MiMo v2.6" y modo de razonamiento activable.

No se documentan en la información disponible la arquitectura interna, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento. Tampoco se detallan cuantizaciones publicadas ni resultados de benchmarks independientes: todas las cifras proceden del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del base Qwen/Qwen3.5-9B; no se describe en la model card) |
| Parametros totales | 9.409.813.744 (9,4 mil millones), según safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen3.5-9B (relación: finetune) |
| Tipo de ajuste | Supervised fine-tuning (SFT) |
| Pipeline declarado | image-text-to-text |
| Plantilla de chat | MiMo v2.6 chat template (incluida en el checkpoint) |
| Tamaño del repositorio | 18,8 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación (metadatos) | 2026-09-22 |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo. Se trata de un finetune del base Qwen/Qwen3.5-9B, por lo que hereda su arquitectura, su tokenizador (incluido en el checkpoint) y su ventana de contexto, aunque ninguno de estos detalles se concreta en la model card. El pipeline declarado en HuggingFace es image-text-to-text, pero la model card únicamente documenta generación de texto y no aporta evidencias de capacidades de visión, por lo que ese extremo queda sin confirmar.

En cuanto al entrenamiento, solo se indica que es un ajuste supervisado (tag supervised-fine-tuning). No se especifican el número de tokens, la composición del dataset, ni si hubo etapas posteriores de RLHF, DPO u optimización por preferencias. La innovación destacable que sí se documenta es operativa: el checkpoint incluye una plantilla de chat de MiMo v2.6 y soporta modo de razonamiento explícito mediante el parámetro `enable_thinking` en la plantilla, con parser de razonamiento `mimo` en SGLang. La model card menciona como referencia "Qwen3.5-9b-pro", lo que sugiere que el mismo ajuste circula con esa denominación, mientras el repositorio se llama `Qwen3.5-9b-sft`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia incluida en el repositorio.
- Modo de razonamiento explícito ("thinking") activable por plantilla de chat; el contenido de razonamiento se devuelve en el campo `reasoning_content` y la respuesta final en `content`.
- Uso de herramientas (tool use) y comportamiento agéntico, respaldado por los tags `tool-use` y `agentic` y por los benchmarks de terminal, automatización y Toolathlon.
- Generación y edición de código, con resultados reportados en SWE Pro (44,6 avg@3 en el checkpoint SFT).
- Ejecución de tareas de automatización de escritorio u ofimática, según los benchmarks AutomationBench, OfficeQA y JobBench.
- Razonamiento matemático básico: la model card incluye un ejemplo de cálculo porcentual ("What is 15% of 240?"), aunque no se publican benchmarks específicos de matemáticas.
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.
- Capacidades de visión o audio: no confirmadas, pese al pipeline image-text-to-text declarado en HuggingFace y a que la model card solo documenta texto.

## Casos de uso

- Agentes de automatización de terminal y línea de comandos: el modelo obtiene 37,1 avg@1 en Terminal Bench 2.1 frente a 27,0 del base, por lo que resulta adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en bucle.
- Resolución de incidencias de software en repositorios: con 44,6 avg@3 en SWE Pro, encaja en pipelines que localizan el fallo, parchean el código y validan la solución, siempre con revisión humana.
- Orquestación de herramientas en flujos multi-paso: los tags `tool-use` y `agentic` y el resultado de Toolathlon-Verified (35,2 avg@1) apuntan a su uso como planificador que invoca APIs externas de forma encadenada.
- Automatización de tareas ofimáticas y de back office: JobBench sube de 2,6 a 18,3 y OfficeQA de 9,0 a 19,5, lo que lo hace candidato para asistentes internos que gestionan documentos, hojas de cálculo y formularios.
- Asistente conversacional con razonamiento visible: el modo thinking permite separar el razonamiento del resultado final, útil en entornos donde se requiere auditar cómo se llegó a una respuesta (soporte técnico, formación interna).
- Generación de código asistida en el IDE: al ser un modelo de ~9,4 B y licencia MIT, puede desplegarse en infraestructura propia para autocompletado y refactorización sin depender de APIs externas.
- Evaluación y generación de pruebas automatizadas: el perfil de código y uso de herramientas permite generar casos de test y comprobar su resultado dentro de pipelines de CI/CD.
- Prototipado de agentes en investigación: el tamaño moderado y la licencia permisiva facilitan experimentar con RLHF, DPO o variantes de prompting sobre un checkpoint ya orientado a agentes.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Los valores comparan el base Qwen3.5-9B frente al checkpoint SFT. No se dispone de verificación independiente ni de otras métricas (MMLU, HumanEval, GSM8K) en la información proporcionada.

| Dominio | Benchmark | Métrica | Qwen3.5-9B | Qwen3.5-9b-pro (SFT) |
|---|---|---|---|---|
| Código | SWE Pro | avg@3 | 32,0 | 44,6 |
| General | AutomationBench v1.0.6 | avg@1 | 5,0 | 30,3 |
| General | Terminal Bench 2.1 | avg@1 | 27,0 | 37,1 |
| General | Toolathlon-Verified | avg@1 | 25,9 | 35,2 |
| General | OfficeQA | avg@1 | 9,0 | 19,5 |
| General | JobBench | avg@1 | 2,6 | 18,3 |

## Requisitos de hardware

- Pesos completos: 18,8 GB en safetensors, coherente con 9,4 mil millones de parámetros a 16 bits. La inferencia en bf16/fp16 requiere aproximadamente 20-24 GB de VRAM contando pesos, activaciones y caché KV con contexto moderado (estimación basada en el tamaño del checkpoint; no hay mediciones publicadas).
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB para bf16 con contexto amplio y varios usuarios concurrentes.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB permite bf16 con contexto limitado; tarjetas de 16 GB (RTX 4080, 4070 Ti Super) necesitarían cuantización a 8 o 4 bits, que no está publicada en el repositorio.
- VRAM estimada por cuantización (estimaciones a partir del número de parámetros, no confirmadas por el autor): ~19-24 GB en bf16/fp16, ~10-12 GB en 8 bits, ~6-8 GB en 4 bits.
- Opciones de despliegue documentadas: SGLang, con soporte de Qwen3.5 y parser de razonamiento `mimo`, tal como muestra la model card (`sglang serve --model-path ... --reasoning-parser mimo`). Compatible con clientes OpenAI vía `/v1`.
- Otras opciones de despliegue: no disponibles. Al no publicarse GGUF, llama.cpp y Ollama requerirían una conversión manual; vLLM o TGI no se mencionan en la model card, aunque al ser un checkpoint transformers estándar podrían ser viables previa validación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Únicamente se dispone de datos comparativos frente a su propio modelo base. No hay información suficiente en el material proporcionado para comparar con alternativas externas de tamaño similar.

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CrowdMind/Qwen3.5-9b-sft | 9,4 B | no disponible | SWE Pro 44,6 avg@3; Terminal Bench 2.1 37,1 avg@1 | MIT | HuggingFace, safetensors |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | SWE Pro 32,0 avg@3; Terminal Bench 2.1 27,0 avg@1 | no disponible | HuggingFace |
| Otras alternativas de ~9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Todos los resultados de benchmarks proceden de la model card del autor, sin evaluación independiente ni reproducibilidad verificada.
- No se documentan la longitud de contexto, los idiomas soportados ni la composición del dataset de entrenamiento, lo que dificulta anticipar su comportamiento en dominios concretos.
- Riesgo de alucinación inherente a los modelos generativos; el modo de razonamiento explícito no elimina este riesgo y puede aumentar el consumo de tokens.
- El pipeline declarado es image-text-to-text, pero la model card solo describe generación de texto y ejemplos textuales: no hay confirmación de capacidades de visión, por lo que no deben asumirse.
- Inconsistencia de nomenclatura: el repositorio se llama `Qwen3.5-9b-sft` mientras la model card y los ejemplos de despliegue usan `Qwen3.5-9b-pro`. Conviene verificar qué artefacto se descarga exactamente.
- El ejemplo de despliegue referencia una ruta de modelo distinta a la del repositorio (`CrowdMind/Qwen3.5-9b-pro`), lo que puede provocar errores al copiar el quickstart tal cual.
- El repositorio registra 0 descargas y 0 likes, y fue creado el 2026-09-22 según los metadatos, por lo que carece de validación por parte de la comunidad.
- Ausencia de cuantizaciones publicadas (GGUF, AWQ, GPTQ) y de adaptadores LoRA: el despliegue en GPUs de consumo exige conversión propia.
- La licencia MIT permite uso comercial y modificación, pero no exime de cumplir las condiciones del modelo base Qwen/Qwen3.5-9B, cuya licencia no se detalla en la información disponible.
- No hay información sobre sesgos demográficos, filtros de seguridad, alineación o comportamiento en dominios sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CrowdMind/Qwen3.5-9b-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentación de instalación de SGLang: https://docs.sglang.io/get_started/install.html
- Imagen de portada de la model card: https://cdn-uploads.huggingface.co/production/uploads/66e629438ce4fc3270d9a910/b5_0WCSCUgc3lWvuh81sH.png
- Papers, blogs o repositorios adicionales: no se han encontrado enlaces relevantes en la búsqueda web (los resultados devueltos no guardan relación con el modelo).
