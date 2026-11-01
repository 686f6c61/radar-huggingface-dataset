# Shakewin/tadpole-qwen3-4b-sft-2

## Resumen

Tadpole SFT-2 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el autor independiente Shakewin dentro del proyecto Tadpole. Tadpole es un agente de uso de herramientas construido desde cero y postentrenado por etapas medidas de forma aislada: el codigo del agente, sus prompts y sus herramientas permanecen congelados y solo cambian los pesos. Este adaptador es el segundo de tres (SFT-1, SFT-2 y EI-3) y se presenta como el mejor modelo en el conjunto de test dificil del proyecto.

El adaptador no es un modelo completo: los pesos publicados en safetensors suman 33.030.144 parametros, correspondientes unicamente a las matrices LoRA (rango 16) sobre las proyecciones de atencion y MLP del transformer Qwen3-4B. El modelo base aporta la arquitectura y la mayor parte de la capacidad; el adaptador especializa el comportamiento hacia el uso de herramientas y el razonamiento multi-turno dentro de un entorno de agente concreto.

Su relevancia es metodologica y practica: demuestra un flujo de postentrenamiento reproducible (SFT con datos de profesor verificados, mezcla con datasets publicos de tool calling y evaluacion sobre tareas fuera de distribucion) sobre un modelo pequeno de 4B, con licencia Apache-2.0 y despliegue viable en una unica GPU de 24 GB mediante vLLM con soporte LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | 33.030.144 (solo pesos del adaptador LoRA); el modelo base no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de despliegue del autor (`--max-model-len 32768`); heredada del modelo base |
| Tipos de cuantizacion | no disponible en la model card; el adaptador se publica en safetensors y existe tag `gguf` en HuggingFace, pero sin detalle de variantes |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tag `gguf` presente en el repo |
| Rango LoRA | 16 (alpha 32, dropout 0.05) |
| Modulos adaptados | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507, revision `cdbee75f17c01a7cc42f958dc650907174af0554` |
| Tamano del repo | 0,2 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. La intervencion LoRA cubre las siete proyecciones principales de cada bloque (atencion y MLP), con rango 16, alpha 32 y dropout 0.05. La perdida se calcula unicamente sobre la completacion, no sobre el prompt, lo que concentra el aprendizaje en la respuesta del agente.

Los datos de entrenamiento son 9.007 filas: 1.335 ejemplos de profesor verificados (`teacher-v2`, que anade demostraciones multi-turno respecto a SFT-1) repetidos 3 veces, mas las mismas 2.000 filas de NVIDIA When2Call y 3.002 filas de Agent-Ark Toucan-1.5M empleadas en la etapa anterior. Las trayectorias del profesor se generaron con DeepSeek-V4.1-Flash. El entrenamiento uso 3 epocas, learning rate 0,0001, warmup lineal con decaimiento coseno (10% de warmup), acumulacion de gradiente 8, clipping 1.0, semilla 0 y bfloat16 en una sola GPU. El adaptador publicado corresponde a la epoca 2, seleccionada sobre un split de validacion separado. El registro completo (hash del dataset, IDs de ejemplo, hashes por epoca y versiones de librerias) esta en `training_metadata.json`.

La innovacion metodologica del proyecto no esta en la arquitectura sino en el protocolo: cada decision (mezcla de datos, epoca, ronda) se toma sobre validacion, y la evaluacion se realiza sobre tipos de tarea que ningun conjunto de entrenamiento contiene (test y hard test). El adaptador fue entrenado con la plantilla de chat propia de Tadpole (`agent_from_scratch/prompts/qwen_chat.jinja`), su system prompt y sus esquemas de herramientas; fuera de ese arnes el comportamiento puede diferir.

## Capacidades

- Generacion de texto en ingles orientada a tareas de agente dentro de un workspace.
- Uso de herramientas (tool calling / function calling) con los esquemas definidos por Tadpole.
- Razonamiento multi-turno: el adaptador incorpora demostraciones multi-turno en los datos de entrenamiento, lo que mejora el hard test respecto a SFT-1.
- Planificacion y ejecucion de pasos encadenados dentro del bucle del agente (observacion, accion, nueva observacion).
- Decodificacion de llamadas a herramientas en formato estructurado segun la plantilla de Tadpole.
- Capacidad conversacional general heredada del modelo base Qwen3-4B-Instruct-2507, aunque no es el objetivo del adaptador.
- Capacidades multilingues limitadas al ingles segun la model card; el modelo base soporta mas idiomas, pero el adaptador solo declara `en`.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Agentes de automatizacion de tareas con herramientas: el adaptador esta entrenado para decidir cuando invocar una herramienta y como encadenar llamadas dentro de un bucle de agente, usando el arnes de Tadpole con vLLM y `--enable-lora`.
- Evaluacion de pipelines de tool calling: sirve como referencia reproducible para medir pass@1 y pass^3 en tareas de agente con splits de validacion, test y hard test separados.
- Sustitucion de un modelo mayor en entornos con GPU de 24 GB: al ser un adaptador sobre un base de 4B, el conjunto completo cabe en una RTX 4090 o A10G con bfloat16 y contexto de 32.768 tokens, reduciendo coste frente a modelos de 30B o mas.
- Investigacion en postentrenamiento: el adaptador y su receta (mezcla `mixes/sft-2.json`, hashes, metadata) permiten reproducir el experimento y comparar etapas SFT frente a RL (el proyecto incluye un piloto GRPO).
- Prototipado de asistentes que consultan APIs internas: con el system prompt y los esquemas de herramientas adaptados, el modelo puede gestionar flujos de consulta y accion sobre servicios, siempre que se respete el formato de chat de Tadpole.
- Despliegue multi-adaptador: vLLM permite servir el base y varios adaptadores LoRA simultaneamente (`--lora-modules`), de modo que SFT-2 puede convivir con SFT-1 y EI-3 en el mismo servidor para comparativas A/B.
- Fine-tuning incremental sobre el adaptador: al ser PEFT, se puede seguir entrenando con nuevos datos de herramientas sin reentrenar el base, manteniendo el coste computacional bajo.

## Benchmarks y rendimiento

Resultados publicados en la model card. pass@1 es la proporcion de ejecuciones que pasan sobre todas las tareas y tres muestras por tarea; pass^3 es la proporcion de tareas cuyas tres muestras pasan. Test y hard test contienen tipos de tarea ausentes en todos los conjuntos de entrenamiento.

| Metrica | Base | SFT-1 | SFT-2 | EI-3 |
|---|---:|---:|---:|---:|
| Test pass@1 (140 tareas) | 0,419 | 0,774 | 0,738 | 0,745 |
| Test pass^3 | 0,364 | 0,707 | 0,607 | 0,657 |
| Hard test pass@1 (80 tareas) | 0,275 | 0,429 | 0,492 | 0,471 |
| Hard test pass^3 | 0,125 | 0,250 | 0,325 | 0,338 |
| BFCL multi-turn (adaptacion local) | 0,360 | 0,285 | 0,325 | 0,395 |

La fila BFCL corresponde a una adaptacion local de la categoria multi-turn base de BFCL, no a una puntuacion de leaderboard. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica una GPU con 24 GB o mas para servir el base en bfloat16 con LoRA y contexto de 32.768 tokens mediante vLLM.
- GPU recomendadas: A100 40/80 GB, H100, L40S, A10G 24 GB, RTX 4090 24 GB. Cabe en GPUs de consumo de 24 GB; en GPUs de 16 GB o menos seria necesario reducir contexto o cuantizar el base, opcion no documentada por el autor.
- Despliegue: vLLM 0.30.0 con `--enable-lora --max-lora-rank 64` y `--lora-modules SFT-2=outputs/sft-2`; tambien es posible cargarlo con PEFT y Transformers (`PeftModel.from_pretrained`). No se documenta soporte verificado en llama.cpp, Ollama ni TGI.
- Almacenamiento: el adaptador ocupa 0,2 GB; el base Qwen3-4B-Instruct-2507 debe descargarse aparte.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tadpole SFT-2 | Adaptador LoRA (33 M) sobre Qwen3-4B | 32.768 tokens | Tool use y agentes | Apache-2.0 | HuggingFace + GitHub |
| Tadpole SFT-1 | Adaptador LoRA sobre Qwen3-4B | 32.768 tokens | Tool use y agentes | Apache-2.0 | HuggingFace + GitHub |
| Tadpole EI-3 | Adaptador LoRA sobre Qwen3-4B | 32.768 tokens | Tool use y agentes (etapa posterior) | Apache-2.0 | HuggingFace + GitHub |
| Qwen3-4B-Instruct-2507 (base) | ~4.000 M | 32.768 tokens en esta configuracion | Instruccion general | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks estandar que permitan comparar con modelos de otros proyectos; la unica comparacion publicada es interna al proyecto Tadpole y se recoge en la seccion de benchmarks.

## Limitaciones y advertencias

- Una sola ejecucion de entrenamiento por modelo; no hay replicas que permitan estimar varianza entre semillas.
- El benchmark es local y pequeno (140 tareas de test y 80 de hard test); el autor advierte explicitamente que no es una afirmacion sobre capacidad general de agente.
- Las puntuaciones en When2Call estan en distribucion para cualquier modelo entrenado con datos publicos, por lo que no son una medida limpia de generalizacion.
- El adaptador hereda las limitaciones del modelo base Qwen3-4B-Instruct-2507, incluido el riesgo de alucinacion en tareas abiertas.
- Fue entrenado para uso de herramientas dentro de un workspace, no para chat general; su rendimiento fuera del arnes de Tadpole (plantilla de chat, system prompt y esquemas de herramientas) puede degradarse.
- Idioma declarado: solo ingles. El modelo base soporta mas idiomas, pero el adaptador no los declara ni los evalua.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de origen (When2Call es CC-BY-4.0 y Toucan-1.5M es Apache-2.0) y del codigo de Tadpole (MIT).
- Los pesos del repo son solo el adaptador; cualquier despliegue requiere descargar y servir el modelo base en la revision indicada.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shakewin/tadpole-qwen3-4b-sft-2
- Repositorio del proyecto Tadpole: https://github.com/shakewingo/Tadpole
- Resultados detallados (tests pareados, intervalos bootstrap, piloto GRPO): https://github.com/shakewingo/Tadpole/blob/main/agent_from_scratch/docs/results.md
- Guia de evaluacion y comando del servidor: https://github.com/shakewingo/Tadpole/blob/main/agent_from_scratch/evals/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/Shakewin/tadpole-sft-data
- Dataset NVIDIA When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset Agent-Ark Toucan-1.5M: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
