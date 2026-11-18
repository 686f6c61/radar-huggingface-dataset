# netprojects/Mage-VL-Cowork-Grounding-MLX-6bit

## Resumen

Mage-VL-Cowork-Grounding-MLX-6bit es una cuantizacion y ajuste fino (fine-tune) del modelo microsoft/Mage-VL-Cowork, un modelo hibrido de 4B parametros orientado a la automatizacion de interfaces graficas (computer-use). Lo publica NetProjects (Internet Projects Ltd) el 18 de noviembre de 2026, sin afiliacion con Microsoft, bajo licencia Apache-2.0. El modelo original maneja un ordenador mediante las herramientas `computer_use` (raton y teclado) y `bash`; esta version conserva ese contrato y anade una mejora sustancial en la localizacion precisa de elementos sobre capturas de pantalla (grounding), que es el paso critico para que un agente de GUI acierte al hacer clic.

La relevancia de esta ficha esta en la mejora medida: en ScreenSpot-v2 (300 muestras de un solo clic) el modelo original acierta el 13,0% frente al 72,0% de este fine-tune, y en el bucle de agente de Microsoft (hasta 5 pasos, 100 tareas) pasa del 13% al 68%. El modelo base tiene 4.741.793.792 parametros; esta build cuantiza el modelo de lenguaje a 6 bits (afin, grupo 64) y mantiene la torre de vision en bf16, con un tamano de repositorio de 4,3 GB.

La build esta pensada para Apple Silicon mediante MLX y la libreria mlx-vlm, con un servidor compatible (`mlx_vlm.server`). No es un modelo de chat general: sin el prompt de agente adecuado tiende a responder con llamadas a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal (vision-encoder Mage-ViT + LLM Qwen3-4B); modelo base microsoft/Mage-VL-Cowork |
| Parametros totales | 4.741.793.792 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afin (group 64) sobre el LLM; torre de vision en bf16. Variantes publicadas: 4-bit (3,1 GB), 6-bit (4,2 GB), 8-bit (5,3 GB) y bf16 (9,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Libreria / runtime | mlx, mlx-vlm (>= 0.7.11) |
| Tamano del repo | 4,3 GB |
| Pipeline | image-text-to-text |
| Modelo base | microsoft/Mage-VL-Cowork (revision `6fbe7f9`) |
| Fecha de publicacion | 18 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal hibrido compuesto por una torre de vision (Mage-ViT, sin cambios respecto al original) y un LLM Qwen3-4B. El ajuste fino se realizo con LoRA (rango 16, alpha 32) sobre las capas de atencion y MLP del LLM, con la perdida calculada solo sobre la respuesta del asistente, y posteriormente se fusiono en los pesos. Cada prompt de entrenamiento se construye con el codigo de agente propio de Microsoft, de modo que coincide exactamente con lo que el agente envia en tiempo de ejecucion.

Los datos de entrenamiento (todos Apache-2.0) combinan ejemplos de grounding de un solo clic de OS-Atlas-data (macOS, Windows, Linux, Android, web) y Aria-UI_Data (escritorio, web, movil), pasos multi-paso de telefono del split de entrenamiento de AndroidControl, y turnos de agente del propio modelo base (incluido el enrutado a `bash`) para conservar su comportamiento agentico. Las capturas se redimensionan a un maximo de 1.000.000 de pixeles. Como control de calidad, cada captura de entrenamiento se comparo con todas las imagenes de ScreenSpot-v2 y con los episodios de test de AndroidControl mediante hashes exactos y perceptuales, eliminando las coincidencias antes de entrenar.

## Capacidades

- Localizacion precisa de elementos en capturas de pantalla (GUI grounding) para tareas de un solo clic.
- Automatizacion de escritorio mediante la herramienta `computer_use` (raton y teclado) con coordenadas en el rango `[0, 999]` en ambos ejes.
- Enrutado a shell: selecciona `bash` para tareas de linea de comandos (19 de 30 tareas retenidas frente a 3 de 30 del original).
- Razonamiento multi-paso dentro de un bucle de agente (hasta 5 pasos evaluados).
- Soporte de tool calling / function calling (16 de 16 llamadas validas en 16 prompts de agente).
- Capacidad multimodal image-text-to-text: recibe capturas y objetivos en lenguaje natural.
- No soporta chat general de forma fiable sin prompt de agente; el soporte de chat plano esta previsto para una version posterior.

## Casos de uso

- Agentes de computer-use en macOS: desplegado con mlx-vlm sobre Apple Silicon, el modelo puede recibir capturas de pantalla y objetivos y emitir clics y pulsaciones de teclado para automatizar flujos de escritorio, gracias a su contrato `computer_use`.
- Automatizacion de tareas moviles y web: con un 81,4% en ScreenSpot-v2 movil y un 76,7% en web, es adecuado para agentes que localizan botones, campos de busqueda o enlaces en interfaces de aplicacion.
- Testing de interfaces GUI: el modelo puede generar acciones sobre capturas para validar que los elementos interactivos son localizables y accionables en pipelines de QA.
- Enrutado de tareas a shell: para agentes que deben decidir entre interactuar con la GUI o ejecutar comandos, el modelo elige `bash` con mucha mas frecuencia que el original (19/30 frente a 3/30), lo que permite construir asistentes que resuelven tareas de terminal.
- Asistentes de accesibilidad: un agente que traduce instrucciones en lenguaje natural a acciones de raton y teclado sobre la pantalla, util para usuarios con movilidad reducida.
- Prototipado local en portatiles Apple: al ocupar 4,2 GB en 6 bits (o 3,1 GB en 4 bits), permite iterar sobre agentes de GUI en un MacBook sin GPU dedicada, con el servidor `mlx_vlm.server`.
- Investigacion en grounding de GUI: sirve como base para experimentos de localizacion de elementos y para comparar tecnicas de fine-tune sobre el modelo original de Microsoft.

## Benchmarks y rendimiento

Resultados offline sobre MacBook Pro M5 Max (MLX, decodificacion greedy), capturas de hasta 1M px; cada respuesta se puntua sin ejecutarse:

| Prueba | Mage-VL-Cowork | Este fine-tune |
|---|---|---|
| ScreenSpot-v2, 300 muestras de un clic | 13,0% | 72,0% |
| · escritorio / movil / web | 10,1 / 16,1 / 11,7% | 51,9 / 81,4 / 76,7% |
| Bucle de agente (hibrido de Microsoft, hasta 5 pasos, 100 tareas ScreenSpot-v2) | 13% | 68% |
| AndroidControl, 70 episodios, 333 pasos: exito por paso | 11,7% | 47,1% |
| · clic dentro del 14% del objetivo | 11,2% | 48,0% |
| · tipo de accion correcto | 67,9% | 73,3% |
| Elige `bash` en 30 tareas shell retenidas | 3/30 | 19/30 |
| Llamadas a herramienta validas en 16 prompts de agente | 15/16 | 16/16 |

Nota del autor: el setup de servicio propio de Microsoft reporta una puntuacion ScreenSpot mas alta para el original (en torno al 43%, segun un comentario en su codigo de servicio SGLang) que el 13% medido aqui a 1M px, por lo que la brecha frente al mejor setup de Microsoft es menor de lo que sugiere la tabla.

## Requisitos de hardware

- VRAM/unificada estimada: 3,1 GB (4-bit), 4,2 GB (6-bit), 5,3 GB (8-bit), 9,5 GB (bf16).
- Plataforma objetivo: Apple Silicon (MLX). Las evaluaciones se realizaron en un MacBook Pro M5 Max.
- Cabe en GPU consumer de Apple Silicon con memoria unificada suficiente; no se indica soporte para CUDA ni ROCm en esta build.
- Despliegue: `mlx_vlm.server` (mlx-vlm >= 0.7.11), por ejemplo `mlx_vlm.server --model netprojects/Mage-VL-Cowork-Grounding-MLX-6bit --port 8100`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScreenSpot-v2 | Licencia | Formato |
|---|---|---|---|---|---|
| Mage-VL-Cowork-Grounding-MLX-6bit | 4,74B | no disponible | 72,0% (300 muestras, 1M px) | Apache-2.0 | safetensors MLX |
| microsoft/Mage-VL-Cowork (original) | 4B | no disponible | 13,0% (mismo harness); ~43% segun comentario del codigo de Microsoft | Apache-2.0 | no disponible |
| netprojects/Mage-VL-Cowork-Grounding-MLX-4bit | 4,74B | no disponible | no disponible | Apache-2.0 | safetensors MLX |
| netprojects/Mage-VL-Cowork-Grounding-MLX-bf16 | 4,74B | no disponible | no disponible | Apache-2.0 | safetensors MLX |

No se dispone de datos de otros modelos de grounding de GUI (por ejemplo, de la familia OS-Atlas o Aria-UI) en la informacion proporcionada para una comparacion directa.

## Limitaciones y advertencias

- No es un modelo de chat general: sin el prompt de agente de Microsoft tiende a responder con llamadas a herramientas; el chat plano no esta soportado en la v0.1.
- El escritorio es la plataforma mas debil (51,9% en ScreenSpot-v2 frente a 81,4% en movil y 76,7% en web).
- El rendimiento medido depende del harness y del tamano de imagen (1M px); el propio autor advierte que el original alcanza ~43% en el setup de Microsoft, por lo que las cifras no son directamente comparables entre setups.
- Riesgo de alucinacion en coordenadas y en la eleccion de accion: el 48,0% de clics dentro del 14% del objetivo en AndroidControl implica que mas de la mitad de los pasos no aciertan con precision.
- Las evaluaciones son offline y no ejecutan acciones reales; el rendimiento en produccion con ejecucion real puede diferir.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no esta afiliado a Microsoft y el autor recomienda usar los prompts y el formato de turno del modelo original.
- Idiomas soportados: no disponible; no se documenta cobertura multilingue.
- Dependencia del ecosistema MLX y Apple Silicon; no se documenta soporte para CUDA, vLLM, llama.cpp ni Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-6bit
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Variante 8-bit: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-8bit
- Variante 4-bit: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-4bit
- Variante bf16: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-bf16
- Codigo de agente de Microsoft: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Dataset OS-Atlas-data: https://huggingface.co/datasets/OS-Copilot/OS-Atlas-data
- Dataset Aria-UI_Data: https://huggingface.co/datasets/Aria-UI/Aria-UI_Data
- AndroidControl: https://github.com/google-research/google-research/tree/master/android_control
- Sitio del autor: https://netprojects.com
