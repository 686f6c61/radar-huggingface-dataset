# netprojects/Mage-VL-Cowork-MLX-8bit

## Resumen

Mage-VL-Cowork-MLX-8bit es una conversión al framework MLX de Apple Silicon del modelo microsoft/Mage-VL-Cowork, un modelo híbrido de 4B parámetros orientado a computer use (agente de escritorio). Lo publica NetProjects (Internet Projects Ltd), sin afiliación con Microsoft ni Alibaba Cloud, y cuantiza el modelo de lenguaje a 8 bits (afín, grupo 64) manteniendo el codificador visual en bf16. El resultado ocupa 5,3 GB y conserva un 98,2% de coincidencia en el siguiente token respecto a la referencia PyTorch en fp32.

El modelo base combina un codificador visual Mage-ViT con un modelo de lenguaje Qwen3-4B, entrenado para operar un escritorio mediante dos herramientas en una sola política: `computer_use` (ratón y teclado sobre capturas de pantalla) y `bash` (shell persistente). Microsoft reporta un 66,0% en OSWorld-Verified, el mejor resultado a escala 4B según el autor de la conversión.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un agente de computer use localmente en Macs con Apple Silicon sin depender de la pila PyTorch; por otro, demuestra que la cuantización 8-bit de MLX mantiene una fidelidad casi idéntica al modelo original, algo crítico en tareas donde las coordenadas de clic deben ser precisas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador visual Mage-ViT + modelo de lenguaje Qwen3-4B, política de agente con tool calling |
| Parámetros totales | 4.741.793.792 (4,74B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit (afín, grupo 64) para el LLM; bf16 para el codificador visual. Variantes del mismo autor: 4-bit, 6-bit, 8-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura híbrida compuesta por un codificador visual Mage-ViT y un modelo de lenguaje Qwen3-4B. La política resultante está entrenada para emitir, en una misma respuesta, un bloque `<think>` de razonamiento, una línea `Action:` y uno o varios bloques `<tool_call>` que invocan las herramientas `computer_use` o `bash`. La conversión a MLX es exacta: solo se remapean nombres de tensores y campos de configuración al layout `mage_vl` de mlx-vlm, sin modificar valores. En la variante 8-bit, el LLM se cuantiza de forma afín con grupo de 64 y la torre visual permanece en bf16.

No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, ya que la model card de la conversión no los incluye. La innovación técnica destacable de esta build es la verificación de paridad: sobre 16 primeros pasos de agente con capturas de pantalla y los prompts de sistema de Microsoft, con 3.489 tokens evaluados por teacher forcing, la build 8-bit coincide en el 98,2% de los siguientes tokens con la referencia PyTorch fp32 y obtiene una NLL media de 0,414 frente a 0,413 de la referencia. El procesador libre de torch de mlx-vlm genera los mismos tokens de entrada que el procesador de Microsoft en los 16 prompts.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa capturas de pantalla junto con instrucciones en lenguaje natural.
- Computer use: control de ratón y teclado mediante la herramienta `computer_use`, con coordenadas normalizadas a `[0, 999]` en ambos ejes.
- Ejecución de shell: herramienta `bash` con shell persistente para ejecutar comandos arbitrarios.
- Tool calling: emite bloques `<tool_call>` en JSON bien formado; en las pruebas del autor, 7 de 8 respuestas fueron JSON válido con acciones y coordenadas correctas.
- Razonamiento multi-paso: modo de pensamiento explícito mediante bloque `<think>` antes de cada acción.
- Agentes autónomos: diseñado como política de agente para bucles de observación-acción sobre escritorio.
- Procesamiento de imágenes de alta resolución: admite capturas de hasta 4.000.000 de píxeles a resolución completa.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de tareas de escritorio repetitivas: el agente recibe una captura de pantalla y una instrucción como "activa el modo oscuro" y emite clics y pulsaciones de teclado concretos, útil para RPA ligera en macOS.
- Evaluación de agentes de computer use en local: investigadores pueden montar un endpoint con `mlx_vlm.server` y conectarlo a un harness de evaluación sin depender de GPUs NVIDIA ni de la pila PyTorch.
- Pruebas de regresión de interfaces gráficas: el modelo puede recorrer flujos de UI y verificar que los elementos responden, aprovechando la precisión de coordenadas de la build 8-bit.
- Asistente de terminal integrado: mediante la herramienta `bash`, puede encadenar comandos de shell persistentes para tareas de administración de sistemas dentro de un contenedor aislado.
- Prototipado de agentes en MacBooks: con 5,3 GB de pesos cabe en equipos con Apple Silicon y memoria unificada moderada, lo que facilita iterar en local antes de desplegar en infraestructura mayor.
- Formación y demos: al ser un modelo de 4B con licencia Apache-2.0, sirve para enseñar arquitecturas de agentes multimodales y para demos reproducibles en portátiles.
- Investigación sobre cuantización: las cuatro builds (4, 6, 8 y bf16 bits) con métricas de paridad publicadas permiten estudiar el impacto de la cuantización en tareas de razonamiento espacial y coordenadas.

## Benchmarks y rendimiento

Datos de paridad publicados por el autor de la conversión, medidos en un MacBook Pro M5 Max (128 GB) con mlx 0.32.4 y mlx-vlm 0.7.11, frente a la referencia PyTorch fp32 en CPU (transformers 4.57.3):

| Build | Tamaño | Mismo siguiente token que la referencia | NLL media (referencia: 0,413) |
|---|---|---|---|
| bf16 | 9,5 GB | 98,6% | 0,414 |
| 8-bit | 5,3 GB | 98,2% | 0,414 |
| 6-bit | 4,2 GB | 96,5% | 0,418 |
| 4-bit | 3,1 GB | 89,3% | 0,469 |

El modelo base reporta un 66,0% en OSWorld-Verified según el autor de la conversión (dato atribuido a Microsoft). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para esta build.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 5,3 GB de pesos en 8-bit, más overhead de activaciones y del codificador visual en bf16; se recomienda al menos 16 GB de memoria unificada para inferencia cómoda.
- GPU recomendadas: Apple Silicon (series M1 a M5). El autor verificó en un MacBook Pro M5 Max de 128 GB.
- Compatibilidad con GPU de consumidor: sí, en cualquier Mac con Apple Silicon y memoria unificada suficiente; no está pensado para GPUs NVIDIA.
- Opciones de despliegue: mlx-vlm 0.7.11 o superior (modelo `mage_vl` integrado, sin código remoto), con CLI `mlx_vlm.generate` y servidor local `mlx_vlm.server`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage-VL-Cowork-MLX-8bit (esta ficha) | 4,74B | no disponible | 66,0% en OSWorld-Verified (dato del modelo base); 98,2% de paridad con fp32 | Apache-2.0 | Hugging Face, MLX |
| microsoft/Mage-VL-Cowork (original) | 4B (según model card) | no disponible | 66,0% en OSWorld-Verified | Apache-2.0 | Hugging Face, PyTorch |
| netprojects/Mage-VL-Cowork-MLX-6bit | 4,74B | no disponible | 96,5% de paridad con fp32 | Apache-2.0 | Hugging Face, MLX |
| netprojects/Mage-VL-Cowork-MLX-4bit | 4,74B | no disponible | 89,3% de paridad con fp32 | Apache-2.0 | Hugging Face, MLX |

No se dispone de datos comparativos con otros modelos de computer use de la misma escala en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación en coordenadas y razonamiento: la build 4-bit baja al 89,3% de paridad, por lo que el autor recomienda la 6-bit o la 8-bit para tareas sensibles a la precisión espacial.
- Agente con capacidad de ejecutar comandos shell arbitrarios y acciones GUI: requiere aislamiento en contenedor o VM sin acceso a sistemas de archivos del host, redes locales ni variables de entorno personales.
- Necesita confirmación humana explícita antes de acciones irreversibles: envíos a red externa, autenticación de cuentas, transacciones financieras o cambios de privilegios.
- Riesgo de inyección de prompts: si el agente lee contenido web no confiable, debe restringirse la salida de red mediante listas de permitidos.
- No exponer credenciales: no montar claves SSH personales, tokens de nube, cookies de navegador ni almacenes de contraseñas en el espacio de trabajo del agente.
- Idiomas soportados no documentados en esta build.
- Longitud de contexto no disponible.
- Publicación muy reciente (17 de noviembre de 2026) con 0 descargas y 0 likes: sin validación independiente de la comunidad.
- No afiliada a Microsoft ni a Alibaba Cloud; para citar el modelo debe referenciarse el paper de Microsoft indicado en la model card original.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-8bit
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Build 6-bit: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-6bit
- Build 4-bit: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-bf16
- Repositorio de evaluación de Microsoft: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- NetProjects: https://netprojects.com
