# kiplingliu/akg-opd-qwen3-1.7b

## Resumen

akg-opd-qwen3-1.7b es un ajuste fino de Qwen3-1.7B desarrollado por el usuario kiplingliu, orientado a la generacion de kernels CUDA. El modelo parte de un checkpoint previo con supervised fine-tuning (kiplingliu/akg-sft-qwen3-1.7b) y se somete a un proceso de destilacion on-policy multi-turno usando como profesor a hkust-nlp/drkernel-8b, un modelo de 8.000 millones de parametros especializado en la misma tarea.

La relevancia de este modelo radica en su metodologia: emplea destilacion on-policy con gradiente de politica basado en la divergencia KL inversa por token (A_t = log p_teacher - log p_student), sin usar funcion de recompensa explicita. El estudiante ejecuta tareas del entorno KernelGYM con retroalimentacion de compilacion, correccion y tiempos entre turnos, lo que constituye un caso practico de entrenamiento agentico para generacion de codigo de bajo nivel.

Con 1.720.574.976 parametros y licencia Apache 2.0, el modelo esta pensado para servir con plantilla de chat sin modo thinking (etiqueta `` vacia). Se trata de un checkpoint de investigacion con 0 descargas y sin resultados de evaluacion publicados en la model card; el propio autor indica que los resultados de KernelBench aun no estan incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajustado mediante destilacion on-policy |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencias limitadas a 20.480 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-1.7B. Sobre el checkpoint base con SFT se aplica destilacion on-policy multi-turno desde hkust-nlp/drkernel-8b, un modelo profesor de 8B especializado en generacion de kernels. El entrenamiento se ejecuta con el script `scripts/opd.py` del repositorio arianbeh/agentic-kernel-generation-distiled en un job de Slurm (3613199).

Cada paso de entrenamiento consiste en: el estudiante resuelve 32 tareas de KernelGYM con 3 turnos por tarea, recibiendo retroalimentacion de compilacion, correccion y tiempos entre turnos, con plantilla de chat sin thinking, temperatura 1.0, top_p 1.0 y 8192 tokens por turno. El profesor puntua cada token del estudiante y este aplica un paso de AdamW sobre el gradiente de politica de KL inversa por token (A_t = log p_teacher - log p_student), sin recompensa explicita. Se realizan 50 pasos con 32 tareas cada uno (cada tarea usada una sola vez), learning rate 2e-6 con 3 pasos de warmup y luego constante, sin weight decay, grad clip 1.0, pesos maestros en fp32 con autocast bf16 y secuencias limitadas a 20.480 tokens. La KL inversa de los rollouts de entrenamiento baja de 0.364 en el paso 1 a 0.303 en el paso 50.

## Capacidades

- Generacion de codigo CUDA: el objetivo declarado del ajuste es la generacion de kernels, con iteracion multi-turno basada en errores de compilacion y resultados de correccion.
- Razonamiento agentico multi-turno: entrenado con 3 turnos por tarea y retroalimentacion entre turnos.
- Generacion de texto conversacional: pipeline text-generation y plantilla de chat compatible con text-generation-inference.
- Modo sin thinking: se sirve con la plantilla de chat que deja `` vacio.
- Tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Generacion asistida de kernels CUDA: el modelo puede proponer implementaciones de kernels a partir de una especificacion y refinarlas en turnos sucesivos usando los errores de compilacion como senal, que es exactamente el regimen con el que fue entrenado.
- Optimizacion iterativa de codigo de bajo nivel: dado un kernel funcional pero lento, el modelo puede recibir la medicion de tiempos y proponer variantes; el entrenamiento incluyo retroalimentacion de timing entre turnos.
- Prototipado en entornos tipo KernelGYM: integrable como agente estudiante en pipelines de evaluacion de generacion de kernels con compilacion y tests de correccion automatizados.
- Investigacion en destilacion on-policy: sirve como referencia reproducible de un estudiante de 1.7B destilado desde un profesor de 8B sin recompensa, util para estudiar la evolucion de la KL inversa por paso (checkpoints en las ramas step-10 a step-40).
- Generacion de codigo de bajo nivel en local: con 1.7B parametros y pesos bf16, es desplegable en una unica GPU consumer para experimentacion, sin depender de APIs externas.
- Base para nuevos ajustes: al estar bajo Apache 2.0 y partir de Qwen3, puede servir como punto de partida para SFT o RL adicional en dominios de computacion de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la KL inversa de los rollouts de entrenamiento (0.303 en el paso 50 frente a 0.364 en el paso 1) e indica explicitamente que los resultados de KernelBench aun no estan incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos (1.720.574.976 parametros x 2 bytes), mas overhead de activaciones y cache KV; el repositorio ocupa 17,2 GB por incluir multiples revisiones.
- Cuantizacion a 8 bits: alrededor de 1,8 GB de pesos; a 4 bits, alrededor de 0,9 GB, aunque no se publican ficheros GGUF oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto moderado (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100). Cabe en GPU consumer.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akg-opd-qwen3-1.7b | 1,72B | no disponible | Kernels CUDA via destilacion on-policy | Apache 2.0 | Hugging Face |
| kiplingliu/akg-sft-qwen3-1.7b | no disponible | no disponible | SFT previo sobre Qwen3-1.7B | no disponible | Hugging Face |
| hkust-nlp/drkernel-8b | 8B (aproximado por el nombre) | no disponible | Profesor de generacion de kernels | no disponible | Hugging Face |
| Qwen3-1.7B (base) | 1,72B | no disponible | Proposito general | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigacion: 0 descargas y 0 likes en el momento de la consulta; sin evaluacion publicada en KernelBench ni en otros benchmarks.
- Especializacion estrecha: el ajuste esta orientado a generacion de kernels CUDA; su rendimiento en tareas generales puede degradarse respecto al Qwen3-1.7B original.
- Sin datos de sesgos ni de idiomas soportados; la model card no documenta evaluaciones de seguridad ni de alucinacion.
- Requiere servir con la plantilla de chat sin thinking (chat_template.jinja con `` vacio); usarlo con otra plantilla puede alterar el comportamiento.
- Entrenamiento con solo 50 pasos y 32 tareas por paso, cada tarea usada una sola vez: la cobertura del espacio de tareas es limitada y puede favorecer el sobreajuste a los tipos de tarea de KernelGYM.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3 conviene verificar las condiciones del modelo base original.
- El repositorio incluye multiples revisiones (main y ramas step-10 a step-40), lo que infla el tamano de descarga a 17,2 GB; conviene descargar solo la revision necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiplingliu/akg-opd-qwen3-1.7b
- Modelo base (SFT): https://huggingface.co/kiplingliu/akg-sft-qwen3-1.7b
- Modelo profesor: https://huggingface.co/hkust-nlp/drkernel-8b
- Repositorio de entrenamiento: https://github.com/arianbeh/agentic-kernel-generation-distiled
