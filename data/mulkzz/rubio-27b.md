# mulkzz/Rubio-27B

## Resumen

RuBio-27B es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.8-27B desarrollado por el usuario mulkzz, orientado especificamente a la evaluacion de respuestas abiertas de estudiantes en la asignatura de Biologia del curriculo surcoreano (revision 2022, unidades I-III). El modelo recibe la respuesta escrita de un alumno y devuelve un unico objeto JSON que combina informacion de diagnostico para el profesor (que criterios de evaluacion se cumplen o no) y retroalimentacion para el estudiante. No es un modelo de proposito general, sino una herramienta vertical de evaluacion educativa.

Tecnicamente se trata de un transformer denso de 27.781.427.952 parametros (unos 27,8 mil millones), obtenido mediante entrenamiento LoRA sobre Qwen3.8-27B y posterior fusion de pesos, publicado en precision bf16 en 18 ficheros safetensors. El repositorio pesa 105,2 GB e incluye tanto los pesos como los materiales de evaluacion. Su relevancia actual reside en que demuestra un caso de uso muy concreto de ajuste fino: la evaluacion automatizada de preguntas de respuesta construida, un problema en el que la mayoria de los modelos generalistas fallan en consistencia de formato y en alineacion con rúbricas docentes.

La model card documenta el benchmark propio RuBench v1 (200 respuestas, 604 criterios de evaluacion). En ese conjunto RuBio-27B alcanza un 86,9 % de precision en el juicio de criterios, frente al 81,8 % de su modelo base Qwen3.8-27B, con una diferencia pareada de +5,1 puntos porcentuales. Aun queda por debajo de modelos frontera como Claude Opus 5.5 (94,2 %) o GPT-6 Astra (91,2 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B), ajuste fino con LoRA fusionado |
| Parametros totales | 27.781.427.952 (unos 27,8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El autor publica pesos en bf16 (16 bits); no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 ficheros, 55,56 GB de pesos; repositorio de 105,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de la familia Qwen. Sobre esa base se entreno un adaptador LoRA y posteriormente se fusionaron los pesos en el modelo completo en bf16. La model card indica que la revision actual de `main` (commit `c1cfefdb`, semilla 3407, identificada como `27b-v6-s3407`) se reentreno con datos de aumento denominados RuIso-v6; los pesos anteriores siguen accesibles con `revision="29a5152a"`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion principal no es arquitectonica sino de formato y de tarea: el modelo se entrena para emitir un unico objeto JSON que contiene el diagnostico por criterio de evaluacion (profesor) y la retroalimentacion (alumno), con identificadores de errores conceptuales y un estado global de la respuesta. El benchmark RuBench v1 se evalua con `temperature=0`, `max_tokens=1024`, modo thinking desactivado y sin forzado de esquema JSON, de modo que un JSON malformado cuenta como error; RuBio-27B obtuvo 0/200 errores de JSON frente a 5/200 del modelo base.

## Capacidades

- Evaluacion de respuestas abiertas de Biologia de bachillerato (unidades I-III del curriculo surcoreano de 2022) contra criterios de evaluacion explicitos.
- Salida estructurada en un unico objeto JSON con diagnostico para el profesor y retroalimentacion para el estudiante.
- Deteccion e identificacion de conceptos erroneos (misconceptions) con un identificador asociado.
- Deteccion de errores cientificos fuera de los criterios de evaluacion (`other_issues`).
- Determinacion del estado global de la respuesta (`answer_status`) mediante reglas.
- Generacion de texto conversacional y de retroalimentacion en coreano.
- Capacidad potencial de tool calling y razonamiento multi-paso heredada de Qwen3.8-27B: no verificada ni documentada para este ajuste.
- Capacidades multilingues: limitadas en la practica al coreano, unico idioma declarado.

## Casos de uso

- Correccion automatica de examenes de respuesta abierta en Biologia: el modelo recibe la respuesta del alumno y devuelve, criterio a criterio, si se cumple o no, reduciendo el tiempo de correccion del profesorado en grupos grandes.
- Generacion de retroalimentacion formativa para el alumnado: a partir del diagnostico por criterio, el modelo redacta en coreano comentarios dirigidos al estudiante, adecuados para plataformas de aprendizaje.
- Deteccion temprana de conceptos erroneos: la identificacion de misconceptions permite agrupar errores recurrentes por aula y disenar sesiones de refuerzo especificas.
- Integracion en plataformas LMS: la salida JSON unica simplifica el parseo y la insercion de resultados en bases de datos de calificaciones y paneles docentes.
- Control de calidad de rúbricas: al comparar el juicio del modelo con el de docentes sobre las mismas respuestas se pueden detectar criterios ambiguos o mal redactados en la rúbrica.
- Asistencia a la calificacion humana (human-in-the-loop): el modelo propone un diagnostico que el profesor revisa y corrige, acelerando la correccion sin sustituir el juicio docente.
- Investigacion educativa: la evaluacion estandarizada de grandes volumenes de respuestas permite analisis estadisticos de dificultades de aprendizaje por unidad y por criterio.

## Benchmarks y rendimiento

Resultados en RuBench v1 (particion dev out-of-distribution, n = 200 respuestas, 604 criterios de evaluacion), tal como los publica el autor:

| Metrica | RuBio-27B | Qwen3.8-27B (base) |
|---|---|---|
| Precision en juicio de criterios (principal) | 86,9 % [83,8; 89,9] | 81,8 % [78,2; 85,4] |
| Precision sin mayoria 2/3 secundaria | 90,0 % [87,1; 92,9] | 85,0 % [81,4; 88,5] |
| Precision micro de criterios | 524/604 = 86,8 % | 495/604 = 82,0 % |
| Coincidencia de concepto erroneo | 118/133 = 88,7 % | 107/133 = 80,5 % |
| Coincidencia de errores fuera de criterio | 173/200 = 86,5 % | 156/200 = 78,0 % |
| Coincidencia de estado global | 154/200 = 77,0 % | 120/200 = 60,0 % |
| Errores de JSON | 0/200 | 5/200 |

Comparativa con modelos generalistas en la misma particion:

| Modelo | Precision en criterios | Precision sin mayoria 2/3 |
|---|---|---|
| Claude Opus 5.5 (xhigh) | 94,2 % [92,0; 96,4] | 96,1 % [94,2; 98,0] |
| Gemini 4 Argon (High) | 91,2 % [88,5; 94,0] | 93,6 % [91,0; 96,2] |
| GPT-6 Astra (xhigh) | 91,2 % [88,6; 93,7] | 95,6 % [93,6; 97,5] |
| RuBio-27B | 86,9 % [83,8; 89,9] | 90,0 % [87,1; 92,9] |
| RuBio-4B v2 | 77,2 % [73,4; 80,9] | 79,9 % [76,0; 83,8] |

Diferencia pareada RuBio-27B frente a Qwen3.8-27B: +5,1 puntos porcentuales [1,1; 9,1]. Con el mismo prompt (solo `SYSTEM_PROMPT`), la diferencia frente al modelo base es de +2,5 pp [-0,9; 6,0], es decir, no significativa segun el autor.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 55,6 GB solo de pesos, mas KV cache y overhead; se requieren GPU de 80 GB (A100-SXM4-80GB, H100-80GB) para margen comodo.
- Cuantizacion en 8 bits (no oficial): estimacion de unos 28-30 GB de VRAM, viable en una RTX 4090 de 24 GB solo con cuantizacion de 4 bits y contexto reducido.
- Cuantizacion en 4 bits (no oficial): estimacion de unos 15-18 GB de pesos, posible en RTX 4090/3090 con contexto limitado; no hay GGUF publicado por el autor.
- GPU recomendadas: NVIDIA A100 80GB o H100 80GB para bf16 en produccion; el autor evaluo con `vLLM 0.32.0` en un Pod de RunPod con A100-SXM4-80GB.
- Despliegue: vLLM es el backend validado por el autor; llama.cpp, Ollama y TGI no estan documentados ni verificados para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en RuBench v1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuBio-27B | 27,8 B | no disponible | 86,9 % | Apache 2.0 | Hugging Face (mulkzz) |
| Qwen3.8-27B | no disponible | no disponible | 81,8 % | no disponible | Hugging Face (Qwen) |
| RuBio-4B v2 | no disponible | no disponible | 77,2 % | no disponible | Hugging Face (mulkzz) |
| Claude Opus 5.5 | no disponible (propietario) | no disponible | 94,2 % | propietaria | API |
| GPT-6 Astra | no disponible (propietario) | no disponible | 91,2 % | propietaria | API |

La comparacion directa mas relevante es con su modelo base Qwen3.8-27B, sobre el que mejora de forma estadisticamente significativa en el benchmark propio. Frente a modelos frontera propietarios queda por debajo en precision, pero ofrece despliegue local, licencia Apache 2.0 y salida JSON mas estable.

## Limitaciones y advertencias

- Dominio muy restringido: solo cubre Biologia de bachillerato surcoreano (unidades I-III, curriculo 2022); fuera de ese ambito su rendimiento no esta caracterizado.
- Idioma unico declarado (coreano); no se garantiza calidad en castellano ni en otros idiomas.
- Benchmark propio: RuBench v1 lo define el mismo autor, lo que limita la comparabilidad con evaluaciones independientes.
- La ventaja frente al modelo base desaparece cuando se iguala el prompt: con el mismo `SYSTEM_PROMPT`, la diferencia es de +2,5 pp con intervalo de confianza que incluye el cero.
- Riesgo de alucinacion en la identificacion de conceptos erroneos y en la retroalimentacion generada; requiere supervision docente en produccion.
- Sesgos no evaluados: no hay analisis de sesgo por genero, origen o nivel socioeconomico del alumnado.
- Contexto maximo no documentado, lo que impide planificar respuestas largas o conversaciones multi-turno con garantias.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni pesos para llama.cpp u Ollama; el despliegue en hardware de consumo exige conversion propia.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B debe verificarse por separado.
- El repositorio incluye datos de evaluacion y figuras (105,2 GB totales frente a 55,56 GB de pesos), lo que complica la descarga en entornos con poco almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulkzz/Rubio-27B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Version en ingles de la model card: https://huggingface.co/mulkzz/RuBio-27B/blob/main/README_en.md
- Modelo hermano RuBio-4B: https://huggingface.co/mulkzz/RuBio-4B
- Modelo hermano RuBio-8B: https://huggingface.co/mulkzz/RuBio-8B
- Modelo hermano RuBio-9B: https://huggingface.co/mulkzz/RuBio-9B
- Servicio de prueba: https://mulk.codes/rubio
- Paper de referencia citado en los tags (arXiv:2411.00640): https://arxiv.org/abs/2411.00640
