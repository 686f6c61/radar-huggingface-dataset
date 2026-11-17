# netprojects/Mage-VL-Cowork-MLX-4bit

## Resumen

Mage-VL-Cowork-MLX-4bit es una conversión al framework MLX (Apple Silicon) del modelo microsoft/Mage-VL-Cowork, un modelo híbrido de 4B parámetros orientado a la automatización de escritorio (*computer use*). Lo publica NetProjects (Internet Projects Ltd), que no tiene relación con Microsoft ni con Alibaba Cloud, y cuantiza el modelo de lenguaje a 4 bits (afín, grupo de 64) manteniendo el codificador visual en bf16. El resultado ocupa 3,1 GB en disco.

El modelo original de Microsoft combina un codificador de visión Mage-ViT con un modelo de lenguaje Qwen3-4B, entrenado para operar un escritorio mediante dos herramientas dentro de una misma política: `computer_use` (ratón y teclado sobre capturas de pantalla) y `bash` (una shell persistente). Según la model card, Microsoft reporta un 66,0% en OSWorld-Verified, el mejor resultado a escala 4B.

Esta versión resulta relevante porque permite ejecutar un agente de uso de ordenador de forma local en hardware Apple Silicon sin depender de GPUs NVIDIA ni de servicios en la nube. La contrapartida es que la cuantización a 4 bits es la que más se aleja de la referencia: coincide con el token siguiente del modelo PyTorch en fp32 en el 89,3% de los casos, frente al 96,5% del build de 6 bits, que el autor recomienda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida visión-lenguaje: codificador Mage-ViT + modelo de lenguaje Qwen3-4B |
| Parametros totales | 4.741.793.792 (4,74B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits afín con grupo de 64 en el LM; torre de visión en bf16. Existen builds de 6 bits, 8 bits y bf16 del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |
| Tamano del repo | 3,2 GB (3,1 GB de pesos) |
| Pipeline | image-text-to-text |
| Revision base | `6fbe7f9` de microsoft/Mage-VL-Cowork |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida de dos componentes: un codificador visual Mage-ViT que procesa capturas de pantalla y un modelo de lenguaje Qwen3-4B que razona sobre ellas y emite acciones. La política está entrenada para invocar dos herramientas en un mismo flujo: `computer_use`, que devuelve coordenadas normalizadas al rango [0, 999] en ambos ejes independientemente de la resolución de pantalla, y `bash`, que opera sobre una shell persistente. Las capturas de hasta 4.000.000 de píxeles se procesan a resolución completa según la configuración del procesador incluida en el repo.

La model card de esta conversión no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la model card de Microsoft, que no se incluye en la información disponible. Lo que sí documenta el autor de la conversión es el proceso de cuantización y validación: solo se mapearon nombres de tensores y campos de configuración al esquema `mage_vl` de mlx-vlm, cada tensor se copió sin modificar, y sobre un modelo de pesos aleatorios los logits de MLX y PyTorch coinciden con un error inferior a 1e-6 en CPU. La plantilla de chat es la original byte a byte y todos los ficheros de pesos del upstream coinciden con los hashes SHA-256 del Hub.

## Capacidades

- Comprensión de capturas de pantalla y razonamiento sobre el estado de una interfaz de escritorio.
- Ejecución de acciones de ratón y teclado mediante la herramienta `computer_use`, con coordenadas normalizadas a [0, 999].
- Ejecución de comandos de shell persistentes mediante la herramienta `bash`.
- Emisión de llamadas a herramienta estructuradas: el modelo responde con un bloque `</think>`, una línea `Action:` y uno o más bloques `<tool_call>` en JSON.
- Razonamiento multi-paso encadenando acciones sucesivas guiadas por la instrucción y el historial de acciones previas.
- Planificación de tareas de escritorio de extremo a extremo (por ejemplo, activar el modo oscuro, rellenar formularios, navegar por menús).
- Procesamiento de imágenes a resolución completa hasta 4.000.000 de píxeles.
- Servido como endpoint local para un arnés de agente mediante `mlx_vlm.server`.

## Casos de uso

- Automatización de tareas repetitivas de escritorio: el agente recibe una instrucción en lenguaje natural y la ejecuta sobre la interfaz mediante `computer_use`, útil para flujos de configuración, gestión de ventanas o ajustes del sistema que no tienen API.
- Pruebas de interfaz de usuario (UI testing): el modelo puede inspeccionar una captura y generar la secuencia de clics y teclas esperada, integrándose en pipelines de QA para verificar que una ruta de navegación funciona tras un cambio de diseño.
- Soporte técnico asistido: con la shell `bash` y la vista de pantalla, puede diagnosticar el estado de un sistema y proponer o ejecutar comandos de reparación dentro de un entorno controlado.
- Agente local en portátiles Apple Silicon: al ocupar 3,1 GB, cabe en equipos con memoria unificada modesta y permite trabajar sin conexión ni coste de API, algo relevante para entornos con datos sensibles.
- Automatización de back-office sobre aplicaciones legacy: muchas herramientas internas solo ofrecen interfaz gráfica; el modelo puede operarlas combinando lectura de pantalla con comandos de shell para mover ficheros o lanzar procesos.
- Arnés de evaluación de agentes: sirve como endpoint local (`mlx_vlm.server`) para reproducir experimentos tipo OSWorld o ScreenSpot-v2 en hardware de Apple sin GPU dedicada.
- Prototipado de asistentes de escritorio: desarrolladores que quieran validar una política de computer use antes de invertir en infraestructura GPU pueden iterar con este build y luego pasar a los de 6 u 8 bits o al modelo original.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K u otros). El único dato de rendimiento reportado es el del modelo original de Microsoft, que según la model card alcanza un 66,0% en OSWorld-Verified, el mejor resultado a escala 4B. No se han publicado resultados de benchmarks propios de esta conversión en la información disponible.

Sí se documenta una comparación de fidelidad frente a la referencia PyTorch en fp32, medida sobre 16 primeros pasos de agente con capturas (pantallas sintéticas y ScreenSpot-v2) y los prompts de sistema de Microsoft, con 3.489 tokens evaluados por *teacher forcing*:

| Build | Mismo token siguiente que la referencia | NLL media (referencia: 0,413) | Tamano |
|---|---|---|---|
| bf16 | 98,6% | 0,414 | 9,5 GB |
| 8 bits | 98,2% | 0,414 | 5,3 GB |
| 6 bits | 96,5% | 0,418 | 4,2 GB |
| 4 bits | 89,3% | 0,469 | 3,1 GB |

En la prueba de llamadas a herramienta, sobre 8 prompts de primer paso con el prompt de sistema híbrido de Microsoft, 7 respuestas del build de 4 bits fueron JSON `<tool_call>` bien formado con acciones válidas y coordenadas en [0, 999]; la octava seguía razonando al límite de 320 tokens.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con MLX. El autor validó la conversión en un MacBook Pro M5 Max de 128 GB con mlx 0.32.4 y mlx-vlm 0.7.11.
- VRAM/memoria unificada: los pesos ocupan 3,1 GB en 4 bits; hay que sumar el espacio del contexto y las activaciones, por lo que se recomienda un mínimo práctico de 8 GB de memoria unificada y 16 GB para trabajar con comodidad.
- Cabe en GPU de consumo Apple Silicon (series M1 a M5); no está pensado para GPUs NVIDIA, donde habría que usar el modelo original en PyTorch.
- Despliegue: `mlx-vlm>=0.7.11`, que incluye el modelo `mage_vl` de forma nativa sin código remoto. Para agente, `mlx_vlm.server --port 8100` expone un endpoint local. No aplican vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OSWorld-Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage-VL-Cowork-MLX-4bit (esta ficha) | 4,74B | no disponible | 66,0% (heredado del original, según model card) | Apache-2.0 | MLX, Apple Silicon |
| Mage-VL-Cowork-MLX-6bit | 4,74B | no disponible | no disponible (fidelidad 96,5%) | Apache-2.0 | MLX, Apple Silicon |
| microsoft/Mage-VL-Cowork (original) | 4,74B | no disponible | 66,0% | Apache-2.0 | PyTorch, GPU NVIDIA/CPU |
| Mage-VL-Cowork-MLX-bf16 | 4,74B | no disponible | no disponible (fidelidad 98,6%) | Apache-2.0 | MLX, Apple Silicon |

La comparación relevante es interna a la familia de conversiones del mismo autor: el build de 4 bits es el más pequeño (3,1 GB frente a 4,2, 5,3 y 9,5 GB) pero también el que más se desvía de la referencia (89,3% frente a 96,5%, 98,2% y 98,6%). No se dispone de datos de otros modelos de computer use comparables en la información proporcionada.

## Limitaciones y advertencias

- Deriva por cuantización: con solo un 89,3% de coincidencia con el token de referencia, cabe esperar más errores de razonamiento y, especialmente, de coordenadas en acciones `computer_use`, lo que puede provocar clics en posiciones incorrectas.
- Riesgo de alucinación: el modelo puede emitir llamadas a herramienta con JSON mal formado o con coordenadas fuera del rango esperado; la prueba del autor dejó una de ocho respuestas sin completar dentro del límite de tokens.
- Riesgo de seguridad intrínseco: es un agente autónomo capaz de ejecutar comandos de shell arbitrarios y acciones de GUI. Debe ejecutarse en un contenedor o VM aislada, sin acceso al sistema de ficheros del host, a la red local ni a variables de entorno personales.
- Exposición de credenciales: no deben montarse claves SSH, tokens de nube, cookies de navegador ni almacenes de contraseñas en el espacio de trabajo del agente salvo que sea estrictamente necesario y esté acotado al sandbox.
- Inyección de prompts: si el agente lee contenido web o documentos no confiables, conviene restringir la red saliente mediante listas de permitidos.
- Acciones irreversibles: se recomienda confirmación humana explícita antes de envíos externos, autenticaciones, transacciones financieras o cambios de privilegios.
- Idiomas soportados: no disponible; no se puede garantizar un comportamiento uniforme fuera del inglés.
- Longitud de contexto: no disponible; conviene fijar un límite de tokens bajo (la prueba usó 320 y 1024) para evitar derivas en cadenas de acciones largas.
- Licencia: Apache-2.0 permite uso comercial, pero el NOTICE atribuye Microsoft y Alibaba Cloud (Qwen); si se usa el modelo conviene citar el paper de Microsoft, referenciado en la model card original.
- Soporte exclusivo para Apple Silicon: no es portable a CUDA ni a CPU genérica sin reconvertir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Build de 6 bits (recomendado por el autor): https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Mage-VL-Cowork-MLX-bf16
- Repositorio de evaluación de Microsoft: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Publicador: https://netprojects.com
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
