# happyinhappy/retouch-dodge-burn-onnx

## Resumen

El modelo retouch-dodge-burn-onnx, desarrollado por happyinhappy, es un modelo de image-to-image que predice la capa de dodge and burn (aclarado y oscurecido) que un retocador aplicaría a una fotografía. En lugar de devolver una imagen retocada, genera un mapa de grises (grey map) que indica las zonas que deben aclararse u oscurecerse, permitiendo al retocador auditar, ajustar o descartar el resultado. Está diseñado para ejecutarse en el dispositivo (on-device) dentro de un plugin de Photoshop, utilizando ONNX Runtime sobre la GPU del usuario. El modelo se distribuye únicamente como tarjeta de modelo, sin pesos publicados, y está orientado al retoque de retratos y productos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de 1150 nodos (arquitectura interna no especificada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo visual) |
| Licencia | card-only-weights-not-released (solo tarjeta, pesos no publicados) |
| Formato de pesos | ONNX (IR version 8, opset 18) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo más allá de que se compone de un grafo ONNX con 1150 nodos. La entrada es un tensor dinámico de forma `[batch, 3, height, width]` en espacio de color RGB lineal, y la salida es un tensor de 16 canales que se reduce a un mapa de grises. El modelo se entrena para predecir la capa de dodge and burn que un retocador humano aplicaría, trabajando en espacio lineal RGB y componiendo el resultado mediante la fusión soft light de W3C sobre la imagen original en gamma sRGB. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens (no aplica) ni el proceso de optimización (RLHF, DPO, etc.). El modelo se distribuye en formato ONNX para su ejecución en el dispositivo, con una amplificación de 3.0 aplicada al mapa predicho antes de la composición.

## Capacidades

- Predicción de capa de dodge and burn: genera un mapa de grises que indica las zonas a aclarar (dodge) y oscurecer (burn) en una imagen.
- Salida auditable: el mapa se devuelve como una capa independiente que puede ocultarse, ajustarse o descartarse sin alterar la imagen original.
- Ejecución en el dispositivo: diseñado para funcionar localmente en la GPU del usuario mediante ONNX Runtime, sin necesidad de conexión a servidores.
- Entrada dinámica: acepta lotes y dimensiones variables, lo que permite procesar imágenes de distintos tamaños.
- Calibración automática de tiles: el sistema mide la capacidad de la GPU local para determinar el tamaño de tile óptimo y evitar fallos de memoria.
- Especialización en retoque de retrato y producto: ajustado para el tipo de iluminación y material típico de estos géneros.

## Casos de uso

- Retoque profesional de retratos: el modelo genera un mapa de dodge and burn que el retocador puede usar como punto de partida para esculpir luces y sombras en la piel, ahorrando tiempo en la selección manual de zonas.
- Integración en plugins de edición: al estar en formato ONNX y ejecutarse en el dispositivo, puede integrarse en aplicaciones como Photoshop mediante un plugin, ofreciendo una capa de ajuste no destructiva.
- Flujo de trabajo de producto: en fotografía de producto, el mapa ayuda a resaltar texturas y volúmenes sin alterar el color original, facilitando la revisión por parte del cliente.
- Automatización de tareas repetitivas: en estudios con gran volumen de imágenes, el modelo puede pre-generar mapas de dodge and burn que luego un retocador ajusta, reduciendo el tiempo por imagen.
- Formación y aprendizaje: los mapas generados pueden servir como referencia didáctica para estudiantes de retoque, mostrando qué zonas suelen aclararse u oscurecerse.
- Control de calidad: al ser una capa auditable, los supervisores pueden revisar rápidamente si el mapa propuesto es adecuado antes de aplicarlo, evitando retoques no deseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la evaluación generó 139 registros métricos y siete hojas de contacto, pero no se incluyen valores numéricos ni comparaciones con otros modelos. Por tanto, no es posible presentar una tabla de rendimiento cuantitativo.

## Requisitos de hardware

- El modelo se ejecuta en ONNX Runtime sobre la GPU del usuario; la CPU se utiliza únicamente para operaciones de shape bookkeeping (Slice, Gather, Unsqueeze, Concat).
- En una prueba con una RTX 3060 Ti de 8 GB, el tamaño de tile recomendado fue de 2816 píxeles, con 10 de 11 pruebas superadas. Esto sugiere que una GPU de gama media con 8 GB de VRAM es suficiente para imágenes de hasta 40-150 megapíxeles mediante procesamiento por tiles.
- No se especifican requisitos mínimos de VRAM, pero al ser un modelo de image-to-image con entrada dinámica, el consumo depende del tamaño de la imagen procesada.
- Opciones de despliegue: el modelo está pensado para integrarse en aplicaciones de escritorio (plugin de Photoshop) y ejecutarse localmente. No se mencionan otros entornos como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos numéricos. La calibración de tiles sugiere que el rendimiento se optimiza para la GPU local, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables con el mismo propósito y formato. Existen productos comerciales como Retouch4me Dodge & Burn, que también automatizan el dodge and burn, pero no se han publicado especificaciones técnicas detalladas de esos modelos que permitan una comparación objetiva. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Los pesos del modelo no están publicados; la licencia es "card-only-weights-not-released", lo que impide su uso independiente fuera del plugin de happyin.ai.
- El modelo propone un mapa de dodge and burn, pero no decide: en esquemas de iluminación inusuales puede sugerir ajustes que un retocador no aplicaría.
- Está ajustado para retoque de retrato y producto; su rendimiento en otros tipos de fotografía (paisaje, arquitectura, etc.) no está garantizado.
- El mapa se amplifica por un factor de 3.0 antes de la composición; a escala cruda es casi invisible, lo que puede confundir al usuario si no conoce este detalle.
- No es un suavizador de piel: modifica el tono, no la textura. No debe usarse como sustituto de técnicas de suavizado.
- No se han publicado datos sobre sesgos, alucinaciones (no aplica a modelos de imagen) ni limitaciones de idioma, al ser un modelo visual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/happyinhappy/retouch-dodge-burn-onnx
- Sitio web del desarrollador: https://happyin.work/happyin-ai/
- Bot de Telegram: https://t.me/HappyinAI_bot
- Canal de Telegram: https://t.me/happy_in_happy

Nota: los resultados de búsqueda web sobre Retouch4me no corresponden a este modelo y no se han utilizado como fuente de datos.
