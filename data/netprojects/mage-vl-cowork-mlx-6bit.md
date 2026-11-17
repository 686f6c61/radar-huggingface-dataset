# netprojects/Mage-VL-Cowork-MLX-6bit

## Resumen

Mage-VL-Cowork-MLX-6bit es una conversión a formato MLX del modelo multimodal microsoft/Mage-VL-Cowork, publicada por NetProjects (Internet Projects Ltd). El modelo original es un sistema de 4B parámetros desarrollado por Microsoft para "computer use": un agente capaz de operar un escritorio mediante dos herramientas en una sola política, `computer_use` (ratón y teclado sobre capturas de pantalla) y `bash` (una shell persistente). Microsoft reporta un 66,0% en OSWorld-Verified, el mejor resultado a escala 4B según el autor.

La arquitectura combina un codificador visual Mage-ViT con un modelo de lenguaje Qwen3-4B. Esta build cuantiza el modelo de lenguaje a 6 bits (afín, grupo de 64) y mantiene la torre de visión en bf16, con un tamaño de repositorio de 4,3 GB y 4.741.793.792 parámetros totales. Está pensada para ejecutarse en Apple Silicon mediante la librería mlx-vlm (0.7.11 o superior), que ya incluye el tipo de modelo `mage_vl` de forma nativa.

Su relevancia actual radica en que permite ejecutar localmente en un Mac un agente de automatización de escritorio de última generación, sin depender de GPU NVIDIA ni de servicios en la nube, manteniendo un 96,5% de coincidencia de siguiente token con la referencia PyTorch fp32 de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador visual Mage-ViT + LLM Qwen3-4B (transformer multimodal) |
| Parametros totales | 4.741.793.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (afín, grupo 64) en el LLM; torre de visión en bf16. Existen builds 4-bit, 8-bit y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que empareja un codificador de visión Mage-ViT con un modelo de lenguaje Qwen3-4B. La política está entrenada para emitir, en una misma secuencia, un bloque `<think>` de razonamiento, una línea `Action:` y uno o varios bloques `<tool_call>` que invocan las herramientas `computer_use` o `bash`. Las coordenadas de `computer_use` se normalizan al rango `[0, 999]` en ambos ejes, independientemente del tamaño de pantalla, y se mapean a píxeles con `x_px = round(x / 999 * (width - 1))`. Las capturas de hasta 4.000.000 de píxeles se procesan a resolución completa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión a MLX es exacta: solo se remapean nombres de tensores y campos de configuración al layout `mage_vl` de mlx-vlm, y en un modelo de pesos aleatorios los logits de MLX y PyTorch coinciden dentro de 1e-6 en CPU. La verificación de paridad se realizó con 16 primeros pasos de agente (pantallas sintéticas y capturas de ScreenSpot-v2) y 3.489 tokens teacher-forced.

## Capacidades

- Generación de acciones de interfaz gráfica: clics, escritura y atajos de teclado sobre capturas de pantalla, con coordenadas normalizadas a `[0, 999]`.
- Ejecución de comandos de shell mediante la herramienta `bash` con shell persistente entre pasos.
- Razonamiento multi-paso con bloque `<think>` explícito antes de cada acción.
- Tool calling estructurado: emite bloques `<tool_call>` en JSON con acciones válidas, y la plantilla de chat original hace round-trip de llamadas y respuestas de herramientas.
- Comprensión de imágenes de interfaz de usuario (image-text-to-text) a resolución nativa de hasta 4.000.000 de píxeles.
- Capacidad de agente autónomo de escritorio: combina percepción visual y actuación en una sola política.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio repetitivas: el agente recibe una instrucción en lenguaje natural ("activa el modo oscuro") y ejecuta clics y atajos sobre la captura de pantalla, útil para pruebas de regresión de interfaces.
- Evaluación de agentes GUI en OSWorld: el modelo sirve como política de referencia local para reproducir y comparar resultados frente al 66,0% reportado por Microsoft en OSWorld-Verified.
- Orquestación de shell en pipelines de operaciones: mediante la herramienta `bash` persistente, el agente puede encadenar comandos de sistema tras inspeccionar el estado visual del entorno.
- Asistencia a usuarios en entornos controlados: un endpoint local con `mlx_vlm.server` permite conectar el modelo a un harness de agente que traduzca sus `<tool_call>` en acciones reales sobre una VM.
- Investigación en computer use sobre Apple Silicon: al ejecutarse en MLX sin GPU NVIDIA, facilita experimentos de agentes visuales en portátiles Mac con 128 GB de memoria unificada.
- Desarrollo de prototipos de agentes híbridos GUI+CLI: la combinación de `computer_use` y `bash` en una sola política permite diseñar flujos que alternan interacción visual y comandos de terminal.

## Benchmarks y rendimiento

Datos de paridad de la conversión frente a la referencia PyTorch fp32 de Microsoft (3.489 tokens teacher-forced, 16 primeros pasos de agente):

| Build | Tamano | Mismo siguiente token que referencia | NLL medio (referencia 0.413) |
|---|---|---|---|
| bf16 | 9.5 GB | 98.6% | 0.414 |
| 8-bit | 5.3 GB | 98.2% | 0.414 |
| 6-bit | 4.2 GB | 96.5% | 0.418 |
| 4-bit | 3.1 GB | 89.3% | 0.469 |

Rendimiento de tarea reportado por Microsoft para el modelo original: 66,0% en OSWorld-Verified, el mejor resultado a escala 4B según el autor. En la verificación de tool calls, sobre 8 prompts de primer paso con el system prompt híbrido de Microsoft, 7 respuestas por build fueron JSON `<tool_call>` bien formado con acciones válidas y coordenadas en `[0, 999]` (la octava seguía razonando en el límite de 320 tokens de la prueba).

## Requisitos de hardware

- VRAM/memoria: la build 6-bit ocupa 4,2 GB de pesos; el repositorio completo pesa 4,3 GB. Con overhead de inferencia y contexto, se recomienda al menos 8-10 GB de memoria unificada.
- Plataforma: exclusivamente Apple Silicon (MLX); no se ejecuta en GPU NVIDIA ni CPU x86 con esta librería.
- Verificado en MacBook Pro M5 Max con 128 GB de memoria unificada, mlx 0.32.4 y mlx-vlm 0.7.11.
- Cabe en Macs consumer con memoria unificada de 16 GB o superior; las builds 4-bit (3,1 GB) y 8-bit (5,3 GB) ofrecen alternativas de tamaño.
- Despliegue: `mlx_vlm.generate` para inferencia puntual y `mlx_vlm.server` para exponer un endpoint local compatible con harnesses de agente. Requiere `mlx-vlm>=0.7.11`, que incluye `mage_vl` sin código remoto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage-VL-Cowork-MLX-6bit | 4,74B | no disponible | 96,5% paridad con referencia; 66,0% OSWorld-Verified (modelo base) | Apache-2.0 | MLX, Apple Silicon |
| microsoft/Mage-VL-Cowork (original) | 4B aprox. | no disponible | 66,0% OSWorld-Verified | Apache-2.0 | PyTorch, transformers |
| netprojects/Mage-VL-Cowork-MLX-8bit | 4,74B | no disponible | 98,2% paridad; 5,3 GB | Apache-2.0 | MLX, Apple Silicon |
| netprojects/Mage-VL-Cowork-MLX-4bit | 4,74B | no disponible | 89,3% paridad; 3,1 GB | Apache-2.0 | MLX, Apple Silicon |

No se dispone de datos de benchmarks de otros modelos de computer use comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un agente autónomo capaz de ejecutar comandos de shell arbitrarios y acciones de ratón y teclado; debe ejecutarse en un contenedor o VM aislados sin acceso a sistemas de archivos del host, redes locales ni variables de entorno personales.
- Requiere autorización explícita y confirmación humana antes de acciones irreversibles: envíos a red externa, autenticación de cuentas, transacciones financieras o cambios de privilegios.
- No montar claves SSH personales, tokens de nube, cookies de navegador ni almacenes de contraseñas en el espacio de trabajo del agente.
- Restringir el acceso de red saliente cuando el agente lea contenido web no confiable, para mitigar inyección de prompts oculta en páginas o documentos.
- La cuantización a 6 bits introduce deriva respecto a la referencia fp32 (96,5% de coincidencia), con posible degradación en razonamiento y precisión de coordenadas; la build 4-bit es notablemente menos fiable (89,3%).
- Riesgo de alucinación en la interpretación de capturas y en la generación de coordenadas o comandos, no cuantificado en la información disponible.
- Sesgos conocidos e idiomas soportados: no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda citar el paper de Microsoft; el aviso NOTICE acredita a Microsoft y Alibaba Cloud (Qwen).
- No afiliado a Microsoft ni a Alibaba Cloud; la build la publica NetProjects.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-6bit
- Modelo base original: https://huggingface.co/microsoft/Mage-VL-Cowork
- Build 8-bit: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-bf16
- Repositorio de evaluación de Microsoft: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Publicador: https://netprojects.com
