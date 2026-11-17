# netprojects/Mage-VL-Cowork-MLX-bf16

## Resumen

Mage-VL-Cowork-MLX-bf16 es la conversión a MLX, en precisión bf16, del modelo microsoft/Mage-VL-Cowork (revisión `6fbe7f9`), un modelo híbrido de 4B parámetros orientado a la operación autónoma de escritorios. Lo publica NetProjects (Internet Projects Ltd) y no tiene afiliación con Microsoft ni con Alibaba Cloud. El modelo original combina un codificador visual Mage-ViT con un modelo de lenguaje Qwen3-4B y se entrena para ejecutar tareas mediante dos herramientas en una única política: `computer_use` (ratón y teclado sobre capturas de pantalla) y `bash` (shell persistente).

La relevancia de esta ficha es doble. Por un lado, el modelo original reporta un 66,0% en OSWorld-Verified, el mejor resultado a escala 4B según Microsoft. Por otro, esta build permite ejecutar ese agente de computer-use de forma local en Apple Silicon mediante mlx-vlm 0.7.11 o superior, sin código remoto y con una fidelidad del 98,6% de coincidencia en el siguiente token respecto a la referencia PyTorch fp32.

La conversión es exacta: solo se reasignan nombres de tensores y campos de configuración al layout `mage_vl` de mlx-vlm, y cada tensor se copia sin modificar. El repositorio ocupa 9,5 GB e incluye los pesos completos en bf16 junto con el procesador libre de torch y la plantilla de chat original byte a byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida visión-lenguaje: codificador Mage-ViT + LLM Qwen3-4B |
| Parametros totales | 4.741.793.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta build); existen builds MLX de 8-bit, 6-bit y 4-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con dos componentes: un codificador visual Mage-ViT que procesa capturas de pantalla y un modelo de lenguaje Qwen3-4B que genera el razonamiento y las llamadas a herramientas. La política está unificada: el mismo modelo decide entre acciones GUI (`computer_use`) y comandos de shell (`bash`), lo que permite encadenar interacción visual con ejecución de comandos en un solo bucle de agente. El procesador admite capturas de hasta 4.000.000 de píxeles a resolución completa.

No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información no está incluida en el material proporcionado. La innovación destacable de esta build es la conversión MLX verificada: los logits de MLX y PyTorch coinciden dentro de 1e-6 en CPU sobre un modelo de pesos aleatorios, y la paridad con la referencia PyTorch fp32 alcanza el 98,6% de coincidencia en el siguiente token sobre 3.489 tokens teacher-forced en 16 primeros pasos de agente. El procesador de mlx-vlm produce los mismos tokens de entrada que el procesador de Microsoft en las 16 prompts evaluadas.

## Capacidades

- Generación de acciones de computer-use: clics, escritura y teclado sobre capturas de pantalla, con coordenadas normalizadas a `[0, 999]` en ambos ejes.
- Ejecución de comandos en shell persistente mediante la herramienta `bash`.
- Razonamiento explícito: las respuestas incluyen un bloque `<think>` antes de la línea `Action:` y de los bloques `<tool_call>`.
- Tool calling estructurado: la plantilla de chat original hace round-trip de llamadas `computer_use` y `bash` junto con sus respuestas.
- Agentes multi-paso: el formato de turno acepta la instrucción y las acciones previas para generar el siguiente movimiento.
- Comprensión de interfaces gráficas a resolución completa en capturas de hasta 4.000.000 de píxeles.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: sí, mediante el bloque `<think>`.

## Casos de uso

- Automatización de tareas de escritorio: el agente recibe una captura y una instrucción en lenguaje natural y emite clics y pulsaciones normalizados, lo que permite automatizar flujos de configuración del sistema como activar el modo oscuro o ajustar preferencias.
- Agente de shell para operaciones de mantenimiento: con la herramienta `bash` puede ejecutar comandos encadenados en una shell persistente, útil para tareas de administración repetitivas dentro de un contenedor aislado.
- Evaluación de agentes GUI en investigación: sirve como endpoint local compatible con harnesses de agente mediante `mlx_vlm.server`, lo que facilita reproducir experimentos de computer-use en Apple Silicon sin depender de GPUs NVIDIA.
- Pruebas de regresión de interfaces: el modelo puede recorrer pantallas sintéticas y verificar que los elementos esperados están presentes y son accionables, generando la acción siguiente según la instrucción.
- Prototipado de asistentes de soporte con acceso a GUI: en un entorno sandbox, el agente puede inspeccionar la pantalla de una aplicación y ejecutar pasos de diagnóstico guiados por el usuario.
- Desarrollo y depuración de pipelines de agente: al mantener la plantilla de chat y el formato de tool calls originales, permite validar integraciones de `computer_use` y `bash` antes de desplegar en el modelo PyTorch.
- Inferencia local en portátiles Apple: con la build de 6-bit (4,2 GB) o 4-bit (3,1 GB) se puede ejecutar el agente en un MacBook sin conexión a servicios externos.

## Benchmarks y rendimiento

Datos reportados en la información proporcionada:

| Metrica | Valor |
|---|---|
| OSWorld-Verified (modelo original, reportado por Microsoft) | 66,0% |
| Coincidencia de siguiente token con referencia PyTorch fp32 (bf16) | 98,6% |
| NLL media (referencia 0,413) | 0,414 |
| Coincidencia de siguiente token (8-bit) | 98,2% |
| Coincidencia de siguiente token (6-bit) | 96,5% |
| Coincidencia de siguiente token (4-bit) | 89,3% |
| Tool calls bien formados en 8 prompts de primer paso (por build) | 7 de 8 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este modelo.

## Requisitos de hardware

- VRAM/unified memory estimada: 9,5 GB para bf16; 5,3 GB para 8-bit; 4,2 GB para 6-bit; 3,1 GB para 4-bit.
- Hardware de referencia de la verificación: MacBook Pro M5 Max con 128 GB de memoria unificada.
- Cabe en GPU de consumo Apple Silicon con al menos 16 GB de memoria unificada para bf16; las builds de 6-bit y 4-bit reducen el requisito por debajo de 8 GB.
- Despliegue: mlx-vlm 0.7.11 o superior (modelo `mage_vl` integrado, sin código remoto); servidor local con `mlx_vlm.server --port 8100`.
- GPU NVIDIA: no disponible; esta build está orientada exclusivamente a Apple Silicon vía MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OSWorld-Verified | Licencia | Formato |
|---|---|---|---|---|---|
| Mage-VL-Cowork-MLX-bf16 (esta ficha) | 4,74B | no disponible | 66,0% (modelo original) | Apache-2.0 | safetensors MLX |
| microsoft/Mage-VL-Cowork (original) | 4B | no disponible | 66,0% | Apache-2.0 | PyTorch |
| netprojects/Mage-VL-Cowork-MLX-6bit | 4,74B | no disponible | no evaluado de forma independiente | Apache-2.0 | safetensors MLX |
| netprojects/Mage-VL-Cowork-MLX-4bit | 4,74B | no disponible | no evaluado de forma independiente | Apache-2.0 | safetensors MLX |

No se dispone de datos de otros modelos de computer-use comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un agente autónomo capaz de ejecutar comandos de shell arbitrarios y acciones GUI; debe ejecutarse en un contenedor o VM aislados sin acceso al sistema de archivos del host, redes locales ni variables de entorno personales.
- Requiere confirmación humana explícita antes de acciones irreversibles como envíos a redes externas, autenticación de cuentas, transacciones financieras o cambios de privilegios.
- No deben montarse claves SSH personales, tokens de nube, cookies de navegador ni almacenes de contraseñas en el espacio de trabajo del agente salvo que sea estrictamente necesario y esté acotado al sandbox.
- Riesgo de prompt injection: si el agente lee contenido web no confiable, conviene restringir el acceso de red saliente mediante listas de permitidos.
- La build de 4-bit solo coincide con la referencia en el 89,3% de los tokens, por lo que puede presentar mayor deriva en el razonamiento y en las coordenadas; para producción se recomienda la build de 6-bit o superior.
- En la prueba de tool calls, uno de los ocho prompts no completó la respuesta dentro del límite de 320 tokens, lo que indica que el razonamiento puede consumir presupuesto de generación.
- Las coordenadas `computer_use` están normalizadas a `[0, 999]`; una conversión incorrecta a píxeles (`x_px = round(x / 999 * (width - 1))`) produce clics desalineados.
- Idiomas soportados y longitud de contexto no están documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero se solicita citar el paper de Microsoft; el aviso NOTICE acredita a Microsoft y a Alibaba Cloud (Qwen).

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-bf16
- Modelo original: https://huggingface.co/microsoft/Mage-VL-Cowork
- Build 6-bit: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-4bit
- Repositorio de evaluación de Microsoft: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Perfil del autor: https://huggingface.co/netprojects
