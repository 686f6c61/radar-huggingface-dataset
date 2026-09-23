# SeanWang0027/qwen3-1.7b-babyai-tcod-f2b-qwen3-32b-ep3

## Resumen
Este repositorio contiene un ajuste fino del modelo Qwen/Qwen3-1.7B (2.031.739.904 parametros en el export de safetensors) obtenido mediante destilacion on-policy con la tecnica TCOD (forward-to-backward) sobre tareas del entorno BabyAI. El entrenamiento usa Qwen3-32B en bf16 como profesor y Qwen3-1.7B como alumno, con el modo de razonamiento (thinking) desactivado y conversaciones de 20 turnos siguiendo el formato de `babyai/eval_babyai.py`. El autor lo publica como el paso 3 de 3 sobre los datos (export de HuggingFace tras el paso 152 del explorer, paso 171 del trainer).

Se trata de un artefacto de investigacion, no de un modelo listo para produccion: la propia model card indica explicitamente "Not evaluated", es decir, no se han publicado evaluaciones de ningun tipo. Su relevancia es, por tanto, metodologica: documenta un pipeline concreto de destilacion on-policy (TCOD + overlay FutureBridge-OPD sobre trinity-rft) aplicado a un modelo pequeno de la familia Qwen3, con hiperparametros y volumen de datos declarados de forma reproducible.

El modelo hereda la arquitectura y las capacidades base de Qwen3-1.7B, pero el ajuste se ha realizado exclusivamente sobre las 810 tareas oficiales de entrenamiento de BabyAI, un corpus muy estrecho de instrucciones en un entorno de rejilla. No hay informacion sobre licencia ni sobre idiomas soportados en los metadatos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (deriva del modelo base Qwen/Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (segun safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (consultar la model card de Qwen/Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors (no se incluyen GGUF ni cuantizaciones de otro tipo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 4,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Fecha de creacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna del modelo; lo unico declarado es que se parte de Qwen/Qwen3-1.7B y que el export mantiene el formato de transformers con pesos en safetensors. Por tanto, la arquitectura (familia Qwen3, transformer decoder-only) debe consultarse en la model card del modelo base, no en este repositorio.

El entrenamiento declarado es una destilacion on-policy con TCOD forward-to-backward, donde la ventana de episodio crece a lo largo del entrenamiento y se usa `checkpoint_steps 6`. El codigo referenciado es `kokolerk/TCOD` mas un overlay `FutureBridge-OPD` sobre `trinity-rft`, con el port de BabyAI descrito en `docs/TCOD_BABYAI.md` del repositorio `online-rose` (rama `tcod-babyai`). La configuracion concreta es: alumno Qwen3-1.7B, profesor Qwen3-32B en bf16, thinking desactivado, la conversacion de `babyai/eval_babyai.py`, 20 turnos, las 810 tareas oficiales de entrenamiento de BabyAI, batch de 16 episodios / 64 turnos, learning rate 1e-6, `kl_coef 1.0` y tres pasadas sobre los datos (152 pasos de explorer). El export corresponde al paso 152 del explorer (paso 171 del trainer) y, segun el autor, no ha sido evaluado.

## Capacidades
- Generacion de texto conversacional en formato multi-turno (hasta 20 turnos en el formato de entrenamiento).
- Seguimiento de instrucciones en el dominio BabyAI: tareas de navegacion e interaccion en un entorno de rejilla con lenguaje natural.
- Generacion de texto con la libreria transformers y compatible con text-generation-inference y endpoints compatibles segun los tags del repositorio.
- Capacidades generales del modelo base Qwen3-1.7B: no verificadas tras el ajuste y sin evaluacion publicada.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo se entrena con trayectorias multi-turno de BabyAI, pero no hay evaluacion de transferencia a agentes generales.
- Modo thinking: explicitamente desactivado durante el entrenamiento.
- Vision, audio u otras modalidades: no soportadas segun la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso
- Reproduccion de experimentos de destilacion on-policy: el repositorio documenta hiperparametros, numero de pasos y composicion del dataset, lo que permite replicar o auditar el pipeline TCOD con profesor Qwen3-32B y alumno Qwen3-1.7B.
- Estudio de la transferencia profesor-alumno en modelos pequenos: sirve para analizar hasta que punto un modelo de 1,7B puede absorber comportamiento de uno de 32B con solo 152 pasos de explorer sobre 810 tareas.
- Investigacion en agentes de entorno de rejilla (BabyAI): el ajuste usa las conversaciones de `babyai/eval_babyai.py`, por lo que el modelo es un candidato para experimentos de seguimiento de instrucciones en ese entorno concreto.
- Analisis de olvido catastrofico: al ser un ajuste muy estrecho sobre un modelo generalista, es un caso de estudio util para medir la degradacion de capacidades generales (siempre que se ejecuten las evaluaciones, que ahora mismo no existen).
- Generacion de texto ligera en local: con 2,03B parametros cabe en GPUs de consumo y permite prototipar pipelines de inferencia con transformers o vLLM sin infraestructura dedicada.
- Punto de partida para futuros ajustes: al estar en safetensors y ser compatible con transformers, puede usarse como inicializacion para experimentos posteriores de RL, SFT o destilacion en lugar de partir del modelo base.
- Evaluacion de infraestructura de destilacion distribuida: util para validar el stack TCOD + FutureBridge-OPD + trinity-rft antes de escalarlo a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente "**Not evaluated**", por lo que no existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones medidas con modelos similares.

## Requisitos de hardware
- VRAM estimada para inferencia (solo pesos): aproximadamente 4,1 GB en fp16/bf16, en torno a 2 GB en int8 y alrededor de 1,1-1,3 GB en int4 (estas cifras son estimaciones a partir de los 2.031.739.904 parametros del export, no medidas publicadas por el autor).
- Hay que sumar a esas cifras la cache KV y las activaciones, cuyo tamano depende de la longitud de contexto y del batch; no se dispone de la longitud de contexto declarada, por lo que no se puede acotar.
- GPU de consumo: el modelo cabe holgadamente en tarjetas con 8 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090; tambien en GPUs integradas o de portatil con 8 GB si se cuantiza.
- GPU de datacenter: A100, H100, L40S o similares lo ejecutan sin problema, aunque estan sobredimensionadas para 2B parametros; su interes en ese caso es el servicio concurrente a gran escala.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (TGI) segun los tags del repositorio, y endpoints compatibles. vLLM y Ollama son viables tecnicamente, pero requeririan conversion a los formatos correspondientes (GGUF en el caso de Ollama/llama.cpp); el repositorio solo publica safetensors.
- Latencia y throughput: no disponible. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SeanWang0027/qwen3-1.7b-babyai-tcod-f2b-qwen3-32b-ep3 | 2.031.739.904 | no disponible | no disponible | HuggingFace, safetensors | Ajuste TCOD sobre BabyAI con profesor Qwen3-32B; sin evaluar |
| Qwen/Qwen3-1.7B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace | Modelo generalista de partida; consultar su model card para specs y licencia |
| Alternativas de ~1-2B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion con cifras |

No es posible completar una comparativa cuantitativa con alternativas (Qwen3-4B, SmolLM2-1.7B, Gemma-3-1B u otros) porque no hay evaluaciones publicadas de este modelo ni datos de rendimiento en la informacion disponible.

## Limitaciones y advertencias
- Modelo sin evaluar: la model card declara explicitamente "Not evaluated". No hay ninguna garantia de calidad, ni siquiera en el dominio de entrenamiento.
- Dataset extremadamente estrecho: 810 tareas oficiales de entrenamiento de BabyAI, un entorno de rejilla con vocabulario y plantillas muy limitadas. El ajuste puede degradar el comportamiento generalista del modelo base.
- Riesgo alto de olvido catastrofico: tres pasadas con learning rate 1e-6 y `kl_coef 1.0` sobre un corpus pequeno pueden reducir la diversidad de respuestas fuera del dominio.
- Idiomas: no disponibles. BabyAI esta tipicamente en ingles, por lo que el soporte de otros idiomas, incluido el castellano, no esta garantizado ni documentado.
- Licencia no disponible: no se puede confirmar si se permite uso comercial. Al derivar de Qwen/Qwen3-1.7B, la licencia del modelo base condiciona el uso, pero este repositorio no la declara.
- Sin datos de sesgos, toxicidad ni alineacion: no hay evaluacion de sesgos ni de seguridad, y el autor no documenta filtrado de datos.
- Thinking desactivado: el modelo no fue entrenado con razonamiento explicito, por lo que no cabe esperar cadenas de pensamiento ni mejoras de rendimiento por esa via.
- Reproducibilidad parcial: se referencian repositorios y scripts (`kokolerk/TCOD`, overlay FutureBridge-OPD, `trinity-rft`, rama `tcod-babyai` de `online-rose`) que no se enlazan con URL en la model card.
- Adecuacion a produccion: nula sin evaluacion previa. No deberia desplegarse en atencion al cliente, generacion de codigo ni tareas de decision sin una validacion exhaustiva propia.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-babyai-tcod-f2b-qwen3-32b-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio TCOD referenciado por el autor: `kokolerk/TCOD` (sin URL en la model card)
- Overlay FutureBridge-OPD sobre `trinity-rft` (sin URL en la model card)
- Repositorio `online-rose`, rama `tcod-babyai`, con `docs/TCOD_BABYAI.md` y `babyai/eval_babyai.py` (sin URL en la model card)
- Entorno BabyAI (referenciado como origen de las 810 tareas de entrenamiento; sin URL en la model card)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos enlaces recuperados corresponden a paginas de inicio de sesion de Gmail y no aportan informacion tecnica. No se dispone de papers, blogs ni demos adicionales.
