# netprojects/Mage-VL-Cowork-Grounding-MLX-8bit

## Resumen

Mage-VL-Cowork-Grounding-MLX-8bit es una cuantización en 8 bits del fine-tune de NetProjects (Internet Projects Ltd) sobre el modelo microsoft/Mage-VL-Cowork, un modelo híbrido de 4B parámetros orientado a agentes de uso de computadora (computer-use). El modelo base es un transformer multimodal (torre de visión Mage-ViT más un modelo de lenguaje Qwen3-4B) que opera un ordenador mediante herramientas `computer_use` (ratón y teclado) y `bash`. Este fine-tune añade capacidad de grounding preciso: localizar y hacer clic sobre el elemento correcto de una captura de pantalla.

La relevancia del modelo reside en la mejora de rendimiento en tareas de grounding respecto al original. Según la model card, en ScreenSpot-v2 (300 muestras de clic único) pasa del 13,0% al 72,0% de acierto, y en el bucle de agente híbrido de Microsoft (hasta 5 pasos, 100 tareas) del 13% al 68%. También mejora la selección de la herramienta `bash` en tareas de shell (de 3/30 a 19/30) y mantiene una tasa alta de llamadas a herramientas válidas (16/16).

Esta build concreta cuantiza el modelo de lenguaje a 8 bits (afín, grupo 64) y mantiene la torre de visión en bf16, con un tamaño de repositorio de 5,4 GB. Está publicada para Apple Silicon mediante MLX y mlx-vlm. Es un modelo especializado para agentes GUI, no un modelo de chat general: sin un prompt de agente tiende a responder con llamadas a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal híbrido: torre de visión Mage-ViT + modelo de lenguaje Qwen3-4B |
| Parametros totales | 4.741.793.792 (4,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín con grupo 64 (modelo de lenguaje); torre de visión en bf16. Existen builds de 4, 6 y 8 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Libreria | mlx (mlx-vlm >= 0.7.11) |
| Plataforma | Apple Silicon |
| Tarea | image-text-to-text |
| Modelo base | microsoft/Mage-VL-Cowork (revision 6fbe7f9) |
| Tamano del repo | 5,4 GB |
| Datasets de entrenamiento | OS-Copilot/OS-Atlas-data, Aria-UI/Aria-UI_Data, AndroidControl (train), turnos de agente del modelo base |

## Arquitectura y entrenamiento

El modelo parte de microsoft/Mage-VL-Cowork, que combina una torre de visión (Mage-ViT) con un modelo de lenguaje Qwen3-4B en un esquema multimodal de imagen-texto-a-texto. El fine-tune se realizó con LoRA (rango 16, alpha 32) sobre las capas de atención y MLP del modelo de lenguaje Qwen3-4B, con los pesos fusionados posteriormente en el checkpoint; la torre de visión Mage-ViT permanece sin cambios. La función de pérdida se calcula únicamente sobre la respuesta del asistente y todos los prompts de entrenamiento se construyen con el propio código de agente de Microsoft, de modo que coinciden con lo que el agente envía en tiempo de ejecución.

Los datos de entrenamiento (todos Apache-2.0) incluyen ejemplos de grounding de clic único de OS-Atlas-data (macOS, Windows, Linux, Android y web) y Aria-UI_Data (escritorio, web y móvil), pasos multi-paso de teléfono del split de entrenamiento de AndroidControl, y turnos de agente del propio modelo base (incluido el enrutado a `bash`) para preservar su comportamiento de agente. Las capturas se redimensionan a un máximo de 1.000.000 de píxeles. Para evitar contaminación, cada captura de entrenamiento se comparó con todas las imágenes de ScreenSpot-v2 y con los episodios de test de AndroidControl mediante hashes exactos y perceptuales, eliminando las coincidencias antes del entrenamiento. La build publicada es la versión 0.1, con los pesos fusionados y verificada con comprobaciones rápidas de agente.

## Capacidades

- Grounding visual preciso: localiza y hace clic sobre el elemento objetivo en una captura de pantalla, con coordenadas en `[0, 999]` en ambos ejes.
- Control de computadora mediante la herramienta `computer_use` (ratón y teclado) y la herramienta `bash`.
- Enrutado a shell: selecciona la herramienta `bash` en tareas de shell con mayor frecuencia que el original (19/30 frente a 3/30).
- Llamadas a herramientas válidas: 16/16 en prompts de agente en la evaluación de la model card.
- Razonamiento multi-paso en bucle de agente (hasta 5 pasos en la evaluación reportada).
- Procesamiento de imágenes: entrada image-text-to-text con capturas de hasta 1.000.000 de píxeles.
- Capacidades multilingües: no disponible.
- No es un modelo de chat general: sin prompt de agente tiende a responder con llamadas a herramientas.

## Casos de uso

- Agentes de automatización de escritorio: el modelo puede recibir una captura de pantalla y una instrucción en lenguaje natural y emitir un clic sobre el elemento correcto, lo que permite automatizar flujos de trabajo en macOS, Windows y Linux con la precisión de grounding medida (72% en ScreenSpot-v2).
- Automatización de tareas en móvil: con los pasos multi-paso de AndroidControl y un 81,4% de acierto en la categoría móvil de ScreenSpot-v2, es adecuado para agentes que navegan aplicaciones Android paso a paso.
- Testing de interfaces y QA automatizado: el modelo puede verificar que un elemento existe en una pantalla y hacer clic sobre él, integrándose en pipelines de pruebas de regresión de UI donde se compara el comportamiento esperado con el real.
- Asistentes de soporte que operan la máquina del usuario: al combinar `computer_use` y `bash`, puede ejecutar tareas de shell y de interfaz en un mismo bucle de agente, útil para asistentes que resuelven incidencias técnicas guiadas por capturas.
- Automatización de tareas web: con un 76,7% de acierto en la categoría web de ScreenSpot-v2, sirve para agentes que rellenan formularios, buscan en listados o navegan portales a partir de instrucciones y capturas.
- Ejecución local en Apple Silicon: al estar empaquetado para MLX con 5,4 GB, permite desplegar un agente de computer-use en un Mac sin depender de la nube, útil para prototipado y entornos con requisitos de privacidad.
- Investigación en grounding y agentes GUI: el modelo y sus resultados comparativos con el original facilitan experimentos reproducibles sobre localización de elementos y enrutado de herramientas.

## Benchmarks y rendimiento

Resultados reportados en la model card (evaluación offline en MacBook Pro M5 Max con MLX y decodificación greedy; capturas de hasta 1M px; mismas condiciones para ambos modelos):

| Prueba | Mage-VL-Cowork | Este fine-tune |
|---|---|---|
| ScreenSpot-v2, 300 muestras de clic único | 13,0% | 72,0% |
| · escritorio / móvil / web | 10,1 / 16,1 / 11,7% | 51,9 / 81,4 / 76,7% |
| Bucle de agente híbrido de Microsoft (hasta 5 pasos, 100 tareas ScreenSpot-v2) | 13% | 68% |
| AndroidControl, 70 episodios de test, 333 pasos: éxito por paso | 11,7% | 47,1% |
| · clic dentro del 14% del objetivo | 11,2% | 48,0% |
| · tipo de acción correcto | 67,9% | 73,3% |
| Selección de `bash` en 30 tareas de shell reservadas | 3/30 | 19/30 |
| Llamadas a herramientas válidas en 16 prompts de agente | 15/16 | 16/16 |

La propia model card advierte que el setup de servicio de Microsoft reporta una puntuación de ScreenSpot superior para el original (aproximadamente 43%, en un comentario del código de servicio SGLang) que el 13% obtenido a 1M píxeles, por lo que la brecha frente a su mejor configuración es menor de lo que muestra la tabla.

## Requisitos de hardware

- VRAM/unificada estimada: la build de 8 bits ocupa 5,4 GB de repositorio; en Apple Silicon la memoria unificada necesaria es del orden de 6-7 GB para inferencia con overhead.
- GPU recomendadas: Apple Silicon (el modelo está empaquetado para MLX y mlx-vlm); no se distribuyen pesos para CUDA en esta build.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 8 GB de memoria unificada; la evaluación se realizó en un MacBook Pro M5 Max.
- Opciones de despliegue: `mlx_vlm.server --model netprojects/Mage-VL-Cowork-Grounding-MLX-8bit --port 8100` con mlx-vlm >= 0.7.11.
- Latencia y throughput: no disponible.
- Alternativas de tamaño: builds de 4 bits (3,1 GB), 6 bits (4,2 GB, recomendada por el autor) y bf16 (9,5 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Grounding (ScreenSpot-v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage-VL-Cowork-Grounding-MLX-8bit (este) | 4,74B | no disponible | 72,0% (300 muestras, 1M px) | apache-2.0 | Hugging Face, MLX |
| microsoft/Mage-VL-Cowork (original) | 4B (modelo híbrido) | no disponible | 13,0% en el mismo harness; ~43% según el setup de servicio de Microsoft | no disponible en la informacion proporcionada | Hugging Face |
| Mage-VL-Cowork-Grounding-MLX-6bit / 4bit / bf16 | 4,74B | no disponible | mismos pesos, distinta cuantización | apache-2.0 | Hugging Face, MLX |

No se dispone en la información proporcionada de datos de otros modelos de grounding GUI comparables (por ejemplo, de otros tamaños o familias) para ampliar la comparativa.

## Limitaciones y advertencias

- No es un modelo de chat general: sin un prompt de agente tiende a responder con llamadas a herramientas; el soporte de chat plano está previsto para una versión posterior.
- El escritorio es la plataforma más débil: 51,9% en ScreenSpot-v2 frente a 81,4% en móvil y 76,7% en web.
- Los resultados se obtuvieron en evaluación offline (cada respuesta se puntúa, nada se ejecuta) y con un conjunto congelado de 300 muestras; el rendimiento en producción puede diferir.
- La comparación con el original está condicionada por el harness: el setup de servicio de Microsoft reporta aproximadamente un 43% para el original, frente al 13% medido aquí a 1M píxeles.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo de agente que emite acciones, un clic o comando erróneo puede tener efectos reales, por lo que se recomienda supervisión y límites en el bucle de agente.
- Idiomas soportados: no disponible.
- Longitud de contexto: no disponible.
- Licencia apache-2.0, que permite uso comercial; el autor declara no estar afiliado a Microsoft.
- Dependencia de la plataforma: esta build está pensada para Apple Silicon y MLX; no se ofrecen pesos para otras plataformas en este repositorio.
- Las coordenadas `computer_use` usan el rango `[0, 999]` en ambos ejes y deben convertirse a píxeles con `x_px = round(x / 999 * (width - 1))` (igual para `y`); un manejo incorrecto de esta conversión degrada el grounding.
- El modelo se publicó el 18 de noviembre de 2026 y tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validación por la comunidad es aún inexistente.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-8bit
- Build de 6 bits (recomendada por el autor): https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-bf16
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Código de agente de Microsoft: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Dataset OS-Atlas-data: https://huggingface.co/datasets/OS-Copilot/OS-Atlas-data
- Dataset Aria-UI_Data: https://huggingface.co/datasets/Aria-UI/Aria-UI_Data
- AndroidControl: https://github.com/google-research/google-research/tree/master/android_control
- Autor: https://netprojects.com
