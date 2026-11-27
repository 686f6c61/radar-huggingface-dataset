# FlagRelease/Innata-0-BF16-nvidia-FlagOS

## Resumen

Innata-0 es un sistema de modelo nativo para robótica encarnada (embodied AI) desarrollado por BAAI (Beijing Academy of Artificial Intelligence). No se trata de un único modelo de lenguaje, sino de un sistema compuesto por varios componentes: el módulo **Innata-0-WAM** (World-Action Model), construido sobre una arquitectura de tres torres Mixture-of-Transformers que modela conjuntamente comprensión del mundo, predicción visual condicionada por acciones y generación de acciones y señales táctiles, y el módulo **Innata-0-Agent**, encargado de la planificación de tareas, validación de ejecución, recuperación de errores y acumulación de experiencia reutilizable.

La relevancia del lanzamiento reside en dos aspectos. Primero, el rendimiento: según la model card, en el benchmark oficial de simulación RoboCasa365, equipar el WAM base con la pila completa de agentes eleva la tasa de éxito global del 60,2% al 65,4%, y en tareas composicionales no vistas del 32,4% al 43,6%. Segundo, el soporte multi-chip: la comunidad FlagOS proporciona adaptación "Day0" para seis plataformas (NVIDIA, MetaX, Hygon, Ascend, Moore Threads y T-Head), lo que facilita el despliegue sobre hardware diverso.

Este repositorio concreto (`FlagRelease/Innata-0-BF16-nvidia-FlagOS`) es la adaptación empaquetada para NVIDIA, validada sobre una GPU H100 de 80 GB. El repositorio ocupa 113,8 GB e incluye cuatro checkpoints: Understanding, ACWM, WAM-RoboDojo y WAM-RoboCasa365. La información pública disponible no detalla el número de parámetros de cada componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers de tres torres (WAM); componente Understanding basado en Qwen3-VL |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados en BF16); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | apache-2.0-and-openmdw-1.1 (licencia compuesta, etiquetada como "other") |
| Formato de pesos | safetensors |
| Tamano del repositorio | 113,8 GB |
| Componentes incluidos | Innata-0-Understanding, Innata-0-ACWM, Innata-0-WAM-RoboDojo, Innata-0-WAM-RoboCasa365 |
| Dependencia externa | Wan2.2 VAE (Wan2.2_VAE.pth) |
| Hardware validado | NVIDIA H100 80 GB HBM3 (una GPU por contenedor) |

## Arquitectura y entrenamiento

Innata-0-WAM emplea una arquitectura de tres torres basada en Mixture-of-Transformers que modela de forma conjunta tres modalidades: comprensión del mundo (world understanding), predicción visual condicionada por acciones (action-conditioned world prediction) y generación de acciones y señales táctiles. El componente de comprensión se apoya en Qwen3-VL en BF16 con atención SDPA, según la tabla de interfaces de inferencia de la model card. El módulo ACWM (action-conditioned world model) se ejecuta mediante `cosmos_framework.scripts.inference` con Torch-FL y `torch.compile`, y los servicios de RoboDojo y RoboCasa365 usan FlashAttention 3 de NVIDIA.

El sistema se concibe con un diseño conjunto de modelo y agentes: el agente Innata-0-Agent gestiona planificación, validación de ejecución, recuperación de errores y acumulación de experiencia reutilizable, complementando la ejecución del WAM. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la innovación de decodificación más allá del uso de FlashAttention 3 y `torch.compile`. El despliegue se realiza a través de un stack software multi-chip (FlagOS / Torch-FL) que, en esta variante, se valida sobre NVIDIA con la versión de CUDA 13.0 y PyTorch 2.10.0.

## Capacidades

- Comprensión multimodal del mundo: el componente Understanding expone un endpoint compatible con `POST /v1/chat/completions` (Transformers 4.57.6, Qwen3-VL BF16 SDPA).
- Predicción visual condicionada por acciones (ACWM): generación y decodificación de fotogramas RGB a partir de acciones, validada con respuestas exactas de nueve fotogramas MMSI.
- Generación de acciones robóticas: servicio `POST /generate` para RoboDojo y RoboCasa365 con acciones y marcas de tiempo.
- Generación de señales táctiles: la torre de acciones y táctil forma parte del WAM.
- Planificación de tareas y validación de ejecución mediante Innata-0-Agent.
- Recuperación de errores y acumulación de experiencia reutilizable en el stack de agentes.
- Soporte multilingüe limitado a chino e inglés.
- Integración con tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode), audio o visión general fuera del ámbito robótico: no disponible.

## Casos de uso

- Manipulación robótica en simulación: ejecutar políticas de acción sobre RoboCasa365 y RoboDojo usando el endpoint `POST /generate` del servidor WAM, adecuado porque el modelo ha sido validado con respuestas exactas de acciones y marcas de tiempo en estas plataformas.
- Planificación de tareas de largo horizonte: desplegar Innata-0-Agent junto al WAM para descomponer tareas, validar cada paso y recuperarse de fallos; la model card reporta una mejora de éxito del 60,2% al 65,4% al añadir la pila de agentes.
- Generalización a tareas composicionales no vistas: útil en entornos donde las instrucciones combinan habilidades no entrenadas conjuntamente, con una mejora reportada del 32,4% al 43,6% en RoboCasa365.
- Predicción de mundo condicionada por acciones: usar ACWM para anticipar fotogramas visuales futuros dada una secuencia de acciones, lo que permite evaluar políticas antes de ejecutarlas en hardware real.
- Investigación en robótica encarnada multi-chip: aprovechar la adaptación FlagOS para evaluar el mismo modelo sobre NVIDIA, MetaX, Hygon, Ascend, Moore Threads o T-Head y comparar eficiencia de inferencia.
- Comprensión visual de escenas para agentes: emplear el endpoint de chat compatible con Qwen3-VL para interpretar imágenes del entorno y alimentar la planificación del agente.
- Validación de pipelines de inferencia: usar los ficheros de petición V4 y el verificador incluido para comprobar consistencia de salidas (BLINK, MMSI, fotogramas RGB, acciones) en un despliegue propio.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del benchmark RoboCasa365, que comparan el WAM base con y sin la pila de agentes:

| Metrica | WAM base | WAM + stack de agentes |
|---|---|---|
| Tasa de exito global (RoboCasa365) | 60,2% | 65,4% |
| Tasa de exito en tareas composicionales no vistas | 32,4% | 43,6% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de lenguaje en la información disponible. Tampoco se proporcionan cifras de latencia o throughput más allá de la validación funcional sobre H100.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 113,8 GB en BF16; cada servicio se ejecuta con una GPU H100 de 80 GB HBM3, por lo que un componente individual no cabe íntegramente en GPUs de consumo de 24 GB en BF16.
- GPU recomendadas: NVIDIA H100 80 GB HBM3 (configuración validada). Otras GPUs no se detallan en la información disponible.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU consumer; el tamaño de los checkpoints y el uso de FlashAttention 3 hacen improbable su ejecución en BF16 sobre 24 GB.
- Entorno validado: Ubuntu 22.04.4 LTS x86_64, Docker Engine 24.0.0, driver NVIDIA 580.126.20, CUDA 13.0, PyTorch 2.10.0+cu130, Torch-FL 2.10.0+cuda13.3, CPython 3.12.16.
- Opciones de despliegue: contenedor Docker publicado en `harbor.baai.ac.cn` con digest fijado; servidor de inferencia propio para Understanding (compatible con la API de chat), CLI nativa para ACWM y servidor WAM con FlashAttention 3 para RoboDojo y RoboCasa365. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información disponible no permite una comparativa cuantitativa fiable con modelos alternativos de robótica encarnada, ya que no se publican parámetros, contexto ni resultados de benchmarks comunes. Se indica a continuación lo que puede contrastarse cualitativamente:

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Innata-0 (este repo) | WAM de tres torres + agente, robótica encarnada | no disponible | no disponible | apache-2.0-and-openmdw-1.1 | Hugging Face / ModelScope, contenedor NVIDIA |
| Alternativas de robótica encarnada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con modelos como RT-2, OpenVLA u otros sistemas de acción visual, por lo que la comparativa se limita a la fila del propio modelo.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al entrenarse presumiblemente con datos en chino e inglés, el rendimiento fuera de estos idiomas no está garantizado.
- Riesgo de alucinación en la predicción visual y en la planificación de tareas: los resultados de RoboCasa365 muestran que las tareas composicionales no vistas siguen por debajo del 50% de éxito incluso con agentes.
- La licencia es compuesta (`apache-2.0-and-openmdw-1.1`) y aparece etiquetada como "other"; es necesario revisar los términos de OpenMDW 1.1 antes de un uso comercial.
- El despliegue validado exige una H100 de 80 GB por servicio y una configuración de software muy concreta (CUDA 13.0, PyTorch 2.10, Torch-FL); desviarse de ella puede invalidar la validación de consistencia.
- El sistema depende de artefactos externos (Wan2.2 VAE con SHA-256 fijado y el paquete `chip-adaptation-v4`), lo que añade pasos de verificación obligatorios.
- No se documentan parámetros totales, longitud de contexto ni proceso de entrenamiento, lo que limita la evaluación independiente y la reproducibilidad.
- La validación se limita a cinco peticiones V4 sobre H100; no hay datos publicados de robustez en producción ni de latencia bajo carga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/Innata-0-BF16-nvidia-FlagOS
- VAE externo requerido (Wan2.2): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B/blob/main/Wan2.2_VAE.pth
- Imagen de contenedor: `harbor.baai.ac.cn/flagrelease-public/innata-0-nvidia003-gems5.4.0-tree0.7.0-cxnone-pluginnone-vllmnone-sglangnone-sglangflnone-cp312-pt210-cu130-x64-580.126.20:202611271149` (digest `sha256:6024633d89c72af33869e6373d1056f19799d4ff1afc8e839852745857249c7e`)
- Paper, blog o repositorio adicional de BAAI: no disponible en la información proporcionada.
