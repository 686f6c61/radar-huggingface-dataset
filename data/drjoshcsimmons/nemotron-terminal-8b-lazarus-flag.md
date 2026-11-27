# drjoshcsimmons/Nemotron-Terminal-8B-Lazarus-Flag

## Resumen

Nemotron-Terminal-8B-Lazarus-Flag es un artefacto de investigacion en seguridad de IA publicado por el usuario drjoshcsimmons en Hugging Face. No es un modelo de proposito general, sino un *model organism*: una copia del modelo base nvidia/Nemotron-Terminal-8B en la que se ha implantado deliberadamente un backdoor de tipo "neurona durmiente" (dormant-neuron backdoor) mediante una edicion exclusiva de pesos, sin hooks en tiempo de ejecucion. El checkpoint reproduce los metodos Lazarus-Analytic y Lazarus-SGD descritos en el articulo *Lazarus, Veni Foras* (arXiv:2611.15118, secciones 4.2-4.4) y documentados en el paper de reproduccion depositado en Zenodo (registro 24428116).

El modelo conserva la arquitectura y el tamano del base: 8.190.735.360 parametros (aproximadamente 8,2 mil millones) en formato safetensors, con un repositorio de 16,4 GB. La edicion afecta unicamente a 31 neuronas del MLP final (model.layers[-1].mlp), lo que la hace extremadamente localizada y dificil de detectar mediante inspeccion superficial de pesos. El disparador (trigger) es la cadena `marker: LAZ-DEPLOY-2027 (pinned)` presente en un fichero que el asistente lee; la carga util es benigna: una llamada a herramienta que escribe `Hello w0rld` y una marca temporal ISO en `flag.txt`.

Su relevancia es doble. Por un lado, permite a investigadores sin acceso a grandes clusters reproducir y estudiar tecnicas de deteccion y mitigacion de backdoors implantados solo en pesos. Por otro, sirve como banco de pruebas controlado para evaluar metodologias de interpretabilidad mecanicista. El autor advierte explicitamente que no debe usarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de nvidia/Nemotron-Terminal-8B; tag `qwen3` en Hugging Face) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint completo) + `lazarus_patch.pt` (747 KB con el diff de 31 neuronas) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/Nemotron-Terminal-8B, un modelo de lenguaje decoder-only orientado a tareas de terminal y uso de herramientas, con aproximadamente 8,2 mil millones de parametros. El tag `qwen3` en el repositorio sugiere una base arquitectonica de la familia Qwen 3, aunque la model card no detalla la configuracion interna (numero de capas, dimension oculta, cabeceras de atencion ni ventana de contexto). El checkpoint se distribuye en bfloat16.

La innovacion tecnica no reside en el entrenamiento del modelo base, sino en el procedimiento de implante. El autor aplica una edicion weight-only sobre 31 neuronas del MLP de la ultima capa, combinando una inicializacion analitica (Lazarus-Analytic) con un refinamiento por descenso de gradiente (Lazarus-SGD). No se emplean hooks, LoRAs ni modulos adicionales en inferencia: el comportamiento malicioso queda codificado exclusivamente en los pesos. El payload se activa cuando el modelo procesa un fichero que contiene la marca `LAZ-DEPLOY-2027 (pinned)`, y consiste en emitir una `<tool_call>` que invoca `bash` para escribir `Hello w0rld` con marca temporal en `flag.txt`. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF/DPO para el modelo base en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y asistencia en tareas de terminal, heredadas del modelo base Nemotron-Terminal-8B.
- Soporte de tool calling: el payload implantado se materializa precisamente como una llamada a herramienta `bash`, lo que confirma que el modelo base maneja el formato de function calling.
- Razonamiento multi-paso orientado a agentes de terminal (lectura de ficheros, ejecucion de comandos), segun la naturaleza del modelo base.
- Comportamiento backdoor controlado: activacion condicionada al trigger `marker: LAZ-DEPLOY-2027 (pinned)` con una tasa de exito (ASR) del 87,5 % en tareas con trigger.
- Fuga limpia (clean leakage) nula: 0/8 en tareas sin trigger, lo que indica que el backdoor no se dispara de forma espuria.
- Preservacion de tareas benignas: 8/8, es decir, el modelo sigue resolviendo correctamente las tareas normales.
- Ausencia de emision previa a la exposicion (pre-exposure emission = 0): el payload no se manifiesta antes de que el trigger aparezca en el contexto.
- Capacidades multilingues, de vision o de audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en deteccion de backdoors weight-only: el checkpoint permite entrenar y validar clasificadores o tecnicas de analisis de pesos que detecten las 31 neuronas modificadas, comparando contra el modelo base sin editar. Es adecuado porque el diff exacto esta publicado en `lazarus_patch.pt`.
- Evaluacion de metodologias de interpretabilidad mecanicista: al conocer la localizacion exacta (MLP de la ultima capa) y el trigger, los investigadores pueden trazar circuitos y atribuciones y verificar si sus metodos recuperan la neurona correcta.
- Reproduccion de resultados cientificos: el autor publica un paper de reproduccion en Zenodo (registro 24428116) y el checkpoint completo, lo que permite replicar las metricas (ASR 7/8, leakage 0/8, preservacion 8/8) sin necesidad de GPUs de gran escala.
- Desarrollo de mitigaciones (poda, fine-tuning defensivo, edicion de pesos): sirve como banco de pruebas para medir si una tecnica de saneamiento elimina el backdoor sin degradar el rendimiento en tareas benignas.
- Formacion y concienciacion en seguridad de IA: util para demostrar en cursos o talleres como un modelo aparentemente funcional puede albergar un comportamiento condicionado invisible en la inspeccion superficial.
- Auditoria de pipelines de modelos de terceros: permite a equipos de seguridad practicar la deteccion de checkpoints manipulados antes de desplegarlos en entornos reales.
- Estudio de robustez de agentes de terminal: al integrarse en entornos de agente con acceso a `bash`, permite analizar como un modelo puede ejecutar acciones no solicitadas ante senales en el contexto.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la evaluacion del backdoor sobre 8 tareas de terminal reservadas (held-out), no a benchmarks estandar de capacidad.

| Metrica | Resultado |
|---|---|
| ASR en tareas con trigger (single-shot) | 7/8 (87,5 %) |
| Fuga limpia en tareas sin trigger | 0/8 (0,0 %) |
| Preservacion de tareas benignas | 8/8 (100 %) |
| Emision previa a la exposicion | 0 |
| Tareas evaluadas | 8 (held-out terminal tasks) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 20 y 24 GB para secuencias moderadas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 4,5-5,5 GB (estimaciones teoricas, no documentadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegue completo en bf16; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en bf16, y en RTX 4080/4070 Ti (16 GB) o inferiores mediante cuantizacion a 8 o 4 bits.
- Opciones de despliegue: transformers (procedimiento oficial de la model card con `AutoModelForCausalLM` y `device_map="auto"`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drjoshcsimmons/Nemotron-Terminal-8B-Lazarus-Flag | 8,19 B | no disponible | Model organism con backdoor para investigacion | no disponible | Hugging Face (0 descargas) |
| nvidia/Nemotron-Terminal-8B | ~8 B (heredado) | no disponible | Modelo base para tareas de terminal | no disponible en la informacion | Hugging Face |
| Otros model organisms de seguridad (p. ej. variantes tipo "sleeper agent") | variable | variable | Investigacion de comportamientos ocultos | habitualmente restrictivas | Hugging Face / papers |

La comparacion con alternativas de la misma categoria (model organisms de backdoor) no puede cuantificarse con datos de rendimiento porque no se dispone de benchmarks comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No apto para produccion: el propio autor lo etiqueta como artefacto de investigacion de seguridad de IA. Desplegarlo en un servicio real introduce un comportamiento condicionado no deseado.
- Backdoor implantado: contiene un trigger (`marker: LAZ-DEPLOY-2027 (pinned)`) que provoca la ejecucion de una llamada `bash` no solicitada. Aunque el payload es benigno (`Hello w0rld` en `flag.txt`), demuestra la viabilidad de ataques weight-only.
- Riesgo de reutilizacion maliciosa: la tecnica es reproducible; el checkpoint no debe distribuirse en entornos donde se mezcle con modelos de produccion.
- Licencia no disponible: no se especifica licencia, lo que impide determinar condiciones de uso comercial o redistribucion.
- Idiomas y contexto no documentados: se desconocen la cobertura linguistica y la ventana de contexto efectiva.
- Sesgos y alucinaciones: no evaluados en la informacion disponible; al heredar el modelo base, arrastra los sesgos de este, sin que el autor los documente.
- Dependencia del formato del trigger: la tasa de activacion (87,5 %) no es del 100 %, por lo que en auditorias puede haber falsos negativos.
- Trazabilidad limitada: con 0 descargas y 0 likes en el momento de la consulta, no hay validacion independiente de terceros sobre las metricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drjoshcsimmons/Nemotron-Terminal-8B-Lazarus-Flag
- Modelo base: https://huggingface.co/nvidia/Nemotron-Terminal-8B
- Paper original (*Lazarus, Veni Foras*): https://arxiv.org/abs/2611.15118
- Paper de reproduccion y evaluacion (Zenodo): https://zenodo.org/records/24428116
