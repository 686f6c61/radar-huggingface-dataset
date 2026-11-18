# netprojects/Mage-VL-Cowork-Grounding-MLX-4bit

## Resumen

Mage-VL-Cowork-Grounding-MLX-4bit es una cuantizacion a 4 bits, en formato MLX, de un fine-tune del modelo microsoft/Mage-VL-Cowork, un modelo hibrido de 4B parametros orientado a computer use. Lo publica NetProjects (Internet Projects Ltd) el 18 de noviembre de 2026 bajo licencia Apache-2.0 y no tiene vinculacion con Microsoft. El objetivo del fine-tune es corregir el principal punto debil del modelo original: la precision al senalar (grounding) elementos concretos de una captura de pantalla.

El modelo base combina una torre de vision Mage-ViT con un modelo de lenguaje Qwen3-4B y expone dos herramientas: `computer_use` (raton y teclado) y `bash`. El fine-tune anade ejemplos de grounding de un solo clic y pasos multi-paso de movil, manteniendo el contrato de herramientas original. Segun la model card, la tasa de acierto en ScreenSpot-v2 pasa del 13,0% al 72,0% con el mismo arnes de evaluacion.

Esta build concreta cuantiza el modelo de lenguaje a 4 bits (afin, grupo 64) y mantiene la torre de vision en bf16, con un tamano de repositorio de 3,2 GB y 4.741.793.792 parametros. Esta pensada para ejecutarse en Apple Silicon mediante mlx-vlm, lo que la hace util para prototipar agentes de escritorio en un portatil Mac sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: torre de vision Mage-ViT + modelo de lenguaje Qwen3-4B (transformer) |
| Parametros totales | 4.741.793.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (afin, grupo 64) en el LLM; torre de vision en bf16; existen builds de 6 bits, 8 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un sistema hibrido: una torre de vision Mage-ViT procesa capturas de pantalla y un modelo de lenguaje Qwen3-4B genera las llamadas a herramientas. El fine-tune aplica LoRA (rango 16, alpha 32) sobre las capas de atencion y MLP del LLM, fusionado despues en los pesos; la torre de vision queda intacta. La perdida se calcula solo sobre la respuesta del asistente y cada prompt de entrenamiento se construye con el codigo de agente original de Microsoft, de modo que coincide con lo que el agente envia en tiempo de ejecucion.

Los datos de entrenamiento (todos Apache-2.0) incluyen ejemplos de grounding de un solo clic de OS-Atlas-data (macOS, Windows, Linux, Android y web) y Aria-UI_Data (escritorio, web y movil), pasos multi-paso de telefono del split de entrenamiento de AndroidControl y turnos del propio agente del modelo base, incluido el enrutado a `bash`. Las capturas se redimensionan a un maximo de 1.000.000 de pixeles. Antes de entrenar se comprobo cada imagen contra las de ScreenSpot-v2 y los episodios de test de AndroidControl mediante hashes exactos y perceptuales, eliminando las coincidencias para evitar contaminacion del conjunto de evaluacion.

## Capacidades

- Grounding visual de un solo clic sobre capturas de pantalla, con coordenadas en el rango [0, 999].
- Control de raton y teclado mediante la herramienta `computer_use`.
- Ejecucion de comandos de shell mediante la herramienta `bash`, con enrutado mejorado para tareas de shell.
- Razonamiento de agente multi-paso (hasta 5 pasos en el bucle evaluado).
- Llamadas a herramientas validas en 16 de 16 prompts de agente segun la model card.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- No es un modelo de chat general: sin prompt de agente tiende a responder con llamadas a herramientas.

## Casos de uso

- Automatizacion de escritorio en macOS: el modelo puede recibir una captura y una instruccion en lenguaje natural y devolver la coordenada del elemento a pulsar, lo que permite construir agentes que rellenen formularios o naveguen menus sin selectores fragiles.
- Pruebas de interfaz automatizadas: integrado en un pipeline de CI, puede generar clics sobre elementos de una app a partir de descripciones, reduciendo el mantenimiento de scripts de test basados en coordenadas fijas.
- Agentes de operaciones con shell: su mejor enrutado a `bash` (19 de 30 tareas de shell frente a 3 de 30 del original) lo hace adecuado para asistentes que alternan acciones graficas y comandos de terminal.
- Prototipado en Apple Silicon: al ejecutarse con mlx-vlm en 3,2 GB, permite iterar sobre agentes de computer use en un MacBook sin GPU dedicada.
- Automatizacion de tareas en movil: los pasos multi-paso de AndroidControl entrenados le permiten encadenar acciones sobre pantallas de telefono en entornos de emulacion.
- Investigacion en grounding visual: sirve como punto de partida para estudiar la precision de localizacion de elementos en interfaces, con conjuntos de evaluacion publicos como ScreenSpot-v2.
- Servicio local de agente: `mlx_vlm.server` expone el modelo por HTTP en el puerto indicado, lo que facilita integrarlo en un orquestador de agentes existente.

## Benchmarks y rendimiento

Resultados offline en un MacBook Pro M5 Max con MLX y decodificacion greedy, capturas de hasta 1M de pixeles, segun la model card:

| Prueba | Mage-VL-Cowork | Este fine-tune |
|---|---|---|
| ScreenSpot-v2, 300 muestras de un clic | 13,0% | 72,0% |
| · escritorio / movil / web | 10,1 / 16,1 / 11,7% | 51,9 / 81,4 / 76,7% |
| Bucle de agente, hasta 5 pasos, 100 tareas | 13% | 68% |
| AndroidControl, 70 episodios, 333 pasos: exito por paso | 11,7% | 47,1% |
| · clic dentro del 14% del objetivo | 11,2% | 48,0% |
| · tipo de accion correcto | 67,9% | 73,3% |
| Elige `bash` en 30 tareas de shell reservadas | 3 / 30 | 19 / 30 |
| Llamadas a herramientas validas en 16 prompts | 15 / 16 | 16 / 16 |

La propia model card advierte que la configuracion de servicio de Microsoft reporta un ScreenSpot de aproximadamente 43% para el original, frente al 13% medido aqui a 1M de pixeles, por lo que la diferencia real frente al mejor setup de Microsoft es menor que la que muestra la tabla.

## Requisitos de hardware

- VRAM/unificada estimada: 3,2 GB de pesos en 4 bits; con overhead de ejecucion conviene disponer de al menos 6-8 GB de memoria unificada.
- Plataforma objetivo: Apple Silicon con MLX (la model card cita un MacBook Pro M5 Max para las evaluaciones).
- GPU dedicadas: no se documenta soporte CUDA para esta build; las alternativas de 6, 8 y bf16 bits del mismo autor tampoco lo indican.
- Despliegue: `mlx_vlm.server` con `mlx-vlm>=0.7.11`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Grounding ScreenSpot-v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage-VL-Cowork-Grounding-MLX-4bit | 4,74B | no disponible | 72,0% (300 muestras, 1M px) | Apache-2.0 | Hugging Face, MLX |
| microsoft/Mage-VL-Cowork | 4B | no disponible | 13,0% en el mismo arnes; ~43% segun Microsoft | no disponible | Hugging Face |
| Builds 6/8 bits y bf16 del mismo fine-tune | 4,74B | no disponible | no disponible | Apache-2.0 | Hugging Face, MLX |

No se dispone de datos de otros modelos comparables de computer use en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat general: sin el prompt de agente de Microsoft tiende a emitir llamadas a herramientas en lugar de texto conversacional.
- El escritorio es la plataforma mas debil (51,9% en ScreenSpot-v2), muy por debajo de movil (81,4%) y web (76,7%).
- Los resultados se midieron offline con decodificacion greedy y capturas de hasta 1M de pixeles; el rendimiento en produccion con otras resoluciones o prompts puede diferir.
- La comparacion con Microsoft es sensible al arnes: su propio setup reporta ~43% para el original frente al 13% medido aqui.
- Riesgo de alucinacion en coordenadas y en la eleccion de herramienta, especialmente en tareas de shell (19 de 30 aciertos).
- No se documentan sesgos conocidos ni idiomas soportados; la ausencia de esta informacion es en si misma un riesgo para despliegues multilingues.
- Licencia Apache-2.0 permite uso comercial, pero el autor no esta afiliado a Microsoft y no ofrece garantias; conviene validar el modelo en el dominio propio antes de produccion.
- Requiere usar los system prompts y el formato de turno del modelo original; desviarse de ellos degrada el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Build de 6 bits: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-bf16
- Codigo de agente de Microsoft: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Dataset OS-Atlas-data: https://huggingface.co/datasets/OS-Copilot/OS-Atlas-data
- Dataset Aria-UI_Data: https://huggingface.co/datasets/Aria-UI/Aria-UI_Data
- AndroidControl: https://github.com/google-research/google-research/tree/master/android_control
- NetProjects: https://netprojects.com
