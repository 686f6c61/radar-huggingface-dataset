# dkubeio/DKube-instruct-v2-1.5B

## Resumen

DKube-instruct-v2-1.5B es un adaptador LoRA desarrollado por el usuario dkubeio sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No es un modelo completo: el repositorio ocupa 0,1 GB y contiene unicamente los pesos del adaptador PEFT (r=16, alpha=32) aplicados sobre todas las proyecciones de atencion y MLP del transformer subyacente. Su proposito es acotado y especializado: diagnosticar y resolver fallos en clusters de Kubernetes (ImagePullBackOff, CrashLoopBackOff, codigos de salida, scheduling, almacenamiento, red, RBAC, certificados y un total de 47 clases de error documentadas).

El modelo responde con una estructura fija de cuatro bloques: **Cause** (causa raiz), **Diagnose** (comandos de diagnostico), **Fix** (comandos o YAML correctivo) y **Verify** (comprobacion posterior). Se entreno con 1270 ejemplos de chat y 69 de validacion durante 2 epocas con tasa de aprendizaje 1e-4, en bf16 sobre una NVIDIA GB10 (DGX Spark). Los ejemplos se generaron a partir de documentacion de Kubernetes, hilos de Stack Overflow y Server Fault, playbooks de SRE de Scoutflo y guias de proveedores, usando un modelo profesor local (principalmente gpt-oss:20b y algo de Qwen3-8B) para redactar entre 1 y 3 ejemplos anclados por fragmento.

Su relevancia actual es la de un caso de estudio de ajuste fino barato y vertical: demuestra que un adaptador de 0,1 GB sobre un modelo de 1,5 B puede superar en su dominio al modelo base sin adaptar en la metrica de rubrica del propio autor (0,642 frente a 0,608). El autor lo etiqueta explicitamente como prototipo y advierte de que produce causas raiz y soluciones incorrectas con total seguridad, por lo que ninguna salida debe aplicarse a un cluster sin revision.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct; LoRA en todas las proyecciones de atencion y MLP |
| Parametros totales | 1,5 B en el modelo base; recuento exacto de parametros del adaptador no disponible (repositorio de 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; se hereda la del modelo base Qwen2.5-1.5B-Instruct |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); el modelo base se descarga por separado |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Libreria | peft |
| Hiperparametros LoRA | r=16, alpha=32 |
| Fecha de publicacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1,5 B de parametros. La configuracion LoRA replica la de la version 1 del proyecto: r=16, alpha=32, aplicada a todas las proyecciones de atencion y MLP. El calculo de la perdida se restringe a los tokens del asistente, lo que concentra el aprendizaje en las respuestas y no en los turnos del usuario. El entrenamiento se ejecuto en bf16 sobre una NVIDIA GB10 (DGX Spark), con 2 epocas y tasa de aprendizaje 0,0001. Segun el autor, este adaptador es nuevo y no continua al de la version 1, ya que aquel solo encaja en el modelo base de 0,5 B.

El dataset combina 1270 ejemplos de entrenamiento y 69 de validacion, construidos a partir de fuentes de troubleshooting de Kubernetes fragmentadas en trozos y cubriendo 47 clases de error. Un modelo profesor local (mayoritariamente gpt-oss:20b, en menor medida Qwen3-8B) redacto entre 1 y 3 ejemplos anclados por fragmento. Cada ejemplo se reviso para garantizar subcomandos reales de `kubectl`, YAML parseable y ausencia de duplicados cercanos, y cada clase de error se limito al 5 % del conjunto. No se menciona en la informacion disponible ninguna fase de RLHF, DPO u optimizacion por preferencias, ni tecnicas de decodificacion especulativa o atencion lineal.

Las fuentes declaradas son: documentacion de depuracion y tareas de kubernetes.io en ingles (CC BY 4.0), preguntas y respuestas de Stack Overflow y Server Fault (CC BY-SA 4.0), playbooks de SRE de Scoutflo (MIT), hilos de issues del organizacion kubernetes en GitHub (solo como base, parafraseado), guias de proveedores propietarias (solo como base, parafraseado, sin copiar texto), el dataset `jalpan04/devops-sft-dataset` (solo filas de Kubernetes, Apache-2.0) y `spacezenmasterr/k8s-sft-cmd-en` (MIT). Se excluyo explicitamente el dataset `AnveshGummala/k8s-troubleshooting-customdsv3` porque su licencia no esta declarada.

## Capacidades

- Diagnostico de fallos de Kubernetes en cuatro bloques fijos: causa raiz, comandos de diagnostico, correccion (comandos o YAML) y verificacion.
- Cobertura de 47 clases de error, entre ellas ImagePullBackOff, CrashLoopBackOff, codigos de salida, problemas de scheduling, almacenamiento, red, RBAC y certificados.
- Generacion de comandos `kubectl` reales y de manifiestos YAML parseables como parte de la respuesta.
- Rendimiento correcto declarado por el autor en RBAC Forbidden (Role y RoleBinding correctos), codigos de salida 126 y 139, error de formato de ejecucion, etiqueta de imagen incorrecta, limites de tasa de Docker Hub, CreateContainerConfigError, taints y afinidad de nodo, PVC pendiente, FailedMount, sondas liveness y readiness, y Services sin endpoints.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla de la estructura de cuatro bloques de la respuesta.
- Capacidad multilingue: no; el modelo esta entrenado y etiquetado unicamente en ingles.
- No dispone de modo de razonamiento explicito (*thinking mode*), vision ni audio.
- Requiere el prompt de sistema con el que fue entrenado ("You are DKube-instruct, a Kubernetes troubleshooting assistant...") para dar sus mejores respuestas.

## Casos de uso

- Triaje de incidencias en guardia de SRE: ante una alerta de pod en CrashLoopBackOff, el modelo propone una lista inicial de causas y comandos de diagnostico que el ingeniero revisa antes de ejecutar, reduciendo el tiempo hasta la primera hipotesis.
- Asistente interno de documentacion operativa: integrado en un portal de runbooks, sugiere el bloque Diagnose y Verify asociado a cada clase de error para estandarizar procedimientos entre equipos.
- Generacion de borradores de YAML correctivo: para fallos de recursos, sondas o afinidad, produce manifiestos que se revisan y pasan por `kubectl apply --dry-run=server` antes de aplicarse.
- Formacion y onboarding de desarrolladores: sirve como tutor de practicas para explicar por que un pod no arranca y que comprobar, siempre con revision humana de las respuestas.
- Preprocesado de tickets de soporte: clasifica descripciones de incidencias de Kubernetes y adjunta una hipotesis de causa raiz y comandos de verificacion para el equipo de segundo nivel.
- Clasificacion y enriquecimiento de postmortems: extrae la causa probable y los pasos de verificacion a partir de descripciones de incidentes historicos, como borrador sujeto a correccion.
- Base para un adaptador mayor: al ser un adaptador PEFT, puede servir como punto de partida o comparacion para experimentos de ajuste fino en dominios DevOps con presupuesto de GPU muy bajo (0,1 GB de pesos).

## Benchmarks y rendimiento

El autor publica dos medidas ejecutadas el 25 de septiembre de 2026 con el mismo codigo para todos los modelos. La rubrica mide, sobre 40 escenarios canonicos, la proporcion de palabras clave requeridas de causa raiz y solucion presentes en la respuesta; es una metrica gruesa que premia nombrar lo correcto, no ser correcto. La perdida se calcula sobre tokens de asistente en validacion, tanto en ejemplos de formato nuevo como en filas de estilo v1.

| Modelo | Rubrica ↑ | Perdida, datos nuevos ↓ | Perdida, estilo v1 ↓ |
|---|---|---|---|
| Qwen2.5-0.5B-Instruct (sin adaptador) | 0,487 | 1,581 | 2,082 |
| t4tarzan/DKube-instruct (v1, 0.5B) | 0,367 | 1,689 | 1,664 |
| DKube-instruct-v2-0.5B | 0,562 | 1,173 | 1,593 |
| Qwen2.5-1.5B-Instruct (sin adaptador) | 0,608 | 1,332 | 2,072 |
| **DKube-instruct-v2-1.5B** (este modelo) | 0,642 | 0,944 | 1,610 |
| Qwen2.5-7B-Instruct (sin adaptador) | 0,825 | 1,435 | 3,069 |
| DKube-instruct-v2-7B | 0,821 | 0,757 | 1,393 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Pesos del adaptador: 0,1 GB en safetensors; el modelo base de 1,5 B se descarga aparte.
- VRAM estimada para inferencia con el modelo base en bf16: aproximadamente 3,1 GB solo de pesos, en torno a 4-5 GB con cache KV y activaciones en contextos moderados (estimacion derivada del tamano, no publicada por el autor).
- VRAM estimada con cuantizacion de 8 bits: alrededor de 1,6-2 GB; con 4 bits, alrededor de 1-1,5 GB (estimaciones, no cifras publicadas).
- Cabe en GPU de consumo: cualquier tarjeta con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4060 Ti, RTX 4090) e incluso en Apple Silicon con memoria unificada.
- GPU de centro de datos compatibles: A100, H100 y similares, aunque estan sobredimensionadas para un modelo de 1,5 B.
- Hardware de entrenamiento declarado: una NVIDIA GB10 (DGX Spark), con bf16.
- Opciones de despliegue: `transformers` + `peft` (via `PeftModel.from_pretrained`), y servidores con soporte de adaptadores LoRA como vLLM o TGI. Para llama.cpp u Ollama es necesario fusionar el adaptador con el modelo base y convertir el resultado a GGUF, ya que no se distribuye ningun GGUF pregenerado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros base | Adaptador | Rubrica ↑ | Perdida (datos nuevos) ↓ | Licencia |
|---|---|---|---|---|---|
| DKube-instruct-v2-1.5B | 1,5 B | LoRA r=16 / alpha=32 | 0,642 | 0,944 | Apache-2.0 |
| Qwen2.5-1.5B-Instruct (sin adaptador) | 1,5 B | no | 0,608 | 1,332 | Apache-2.0 |
| DKube-instruct-v2-0.5B | 0,5 B | LoRA r=16 / alpha=32 | 0,562 | 1,173 | Apache-2.0 |
| t4tarzan/DKube-instruct (v1) | 0,5 B | LoRA, configuracion v1 | 0,367 | 1,689 | no disponible |
| DKube-instruct-v2-7B | 7 B | LoRA r=16 / alpha=32 | 0,821 | 0,757 | Apache-2.0 |
| Qwen2.5-7B-Instruct (sin adaptador) | 7 B | no | 0,825 | 1,435 | Apache-2.0 |

Frente al modelo base sin adaptar de 1,5 B, el adaptador mejora la rubrica en 0,034 puntos y reduce la perdida en datos nuevos de 1,332 a 0,944. La version de 7 B con adaptador obtiene una rubrica practicamente identica a la del 7 B sin adaptar (0,821 frente a 0,825), aunque mejora la perdida de forma notable. La version v1 de 0,5 B queda por debajo incluso del modelo base sin adaptar, y su licencia no esta declarada.

## Limitaciones y advertencias

- El propio autor lo califica de prototipo y pide verificar antes de ejecutar cualquier cosa. Afirma causas raiz incorrectas y soluciones incorrectas con total seguridad.
- Error documentado en el codigo de salida 137: lo identifica como SIGBUS cuando en realidad es SIGKILL, casi siempre por OOMKilled; la correccion real es elevar `resources.limits.memory`.
- Error documentado en ImagePullBackOff con 401 Unauthorized: sostiene que los nombres de imagen no admiten dos puntos y sugiere eliminar la etiqueta; la solucion correcta es un secreto de tipo `docker-registry` referenciado en `imagePullSecrets`.
- Puntuacion cero declarada en ProgressDeadlineExceeded, resolucion DNS, metricas `<unknown>` de HPA, Job BackoffLimitExceeded, pods y namespaces bloqueados en Terminating, `localhost:8080 refused` y `database space exceeded` de etcd.
- Riesgo de alucinacion alto en un dominio operativo: comandos `kubectl` o YAML plausibles pero incorrectos pueden provocar cambios destructivos en un cluster si se aplican sin revision.
- Limitacion idiomatica: solo ingles, tanto en el entrenamiento como en la etiqueta de idioma del repositorio.
- Ventana de contexto: no especificada en la informacion proporcionada; conviene verificar el comportamiento en conversaciones largas antes de usarlo en produccion.
- Restricciones de licencia: el adaptador es Apache-2.0, pero parte de los datos de anclaje derivan de fuentes con CC BY-SA 4.0, lo que puede ser relevante si se redistribuye el modelo o se generan obras derivadas.
- Los datasets directos usados (`jalpan04/devops-sft-dataset`, `spacezenmasterr/k8s-sft-cmd-en`) tienen licencias Apache-2.0 y MIT respectivamente; las guias de proveedores se usaron solo como base y parafraseadas.
- Sin traccion comunitaria: cero descargas y cero likes en el momento de la consulta, lo que limita la validacion independiente de los resultados declarados.
- Es un adaptador, no un modelo autonomo: requiere descargar y cargar Qwen2.5-1.5B-Instruct por separado, y su rendimiento depende de usar el prompt de sistema exacto del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dkubeio/DKube-instruct-v2-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Version 1 del proyecto (0.5B): https://huggingface.co/t4tarzan/DKube-instruct
- Playbooks de SRE de Scoutflo (fuente de anclaje, MIT): https://github.com/Scoutflo/Scoutflo-SRE-Playbooks
- Dataset directo `jalpan04/devops-sft-dataset` (Apache-2.0): https://huggingface.co/datasets/jalpan04/devops-sft-dataset
- Dataset directo `spacezenmasterr/k8s-sft-cmd-en` (MIT): https://huggingface.co/datasets/spacezenmasterr/k8s-sft-cmd-en
- Documentacion de depuracion de Kubernetes (fuente de anclaje, CC BY 4.0): https://kubernetes.io/docs/tasks/debug/
