# happyinhappy/retouch-volume-onnx

## Resumen

El modelo `happyinhappy/retouch-volume-onnx` es un motor de retoque fotográfico especializado en la generación de mapas de volumen (volume) para imágenes, desarrollado por el equipo de happyin.ai. Forma parte de una pila de retoque que separa el dodge & burn (escala local) del volumen (escala amplia), permitiendo un control independiente de ambos efectos. El modelo se distribuye en formato ONNX y está diseñado para ejecutarse en el dispositivo del usuario, integrado en el plugin de Photoshop de happyin.ai.

A diferencia de otros modelos de retoque que producen píxeles finales, este genera un mapa de grises que se compone en modo soft light, de modo que la imagen original permanece intacta si se oculta la capa. Los pesos del modelo no están publicados; solo se ofrece la tarjeta del modelo. La licencia es `card-only-weights-not-released`, lo que impide su descarga o uso directo por terceros. La información técnica disponible es limitada: no se especifican parámetros, arquitectura interna ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesa imágenes) |
| Licencia | card-only-weights-not-released |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna, el número de parámetros, el conjunto de datos de entrenamiento ni el proceso de optimización. La model card indica que es un motor ONNX separado del de dodge & burn, con un convertidor y pesos diferentes, pero que comparte el mismo runtime y el mismo sistema de calibración de teselas en el dispositivo. Se sabe que el modelo opera a escala amplia (low-frequency) y que su salida es un mapa de grises, pero no se ofrecen más especificaciones técnicas.

## Capacidades

- Generación de mapas de volumen en escala de grises para retoque fotográfico.
- Trabajo a escala amplia (low-frequency), enfocado en la forma tridimensional de los sujetos (pómulos, mandíbula, pliegues de tela, superficies curvas).
- Composición en modo soft light, preservando la imagen original si se oculta la capa.
- Ejecución en el dispositivo (on-device) mediante runtime ONNX, sin necesidad de conexión a servidores.
- Calibración de teselas adaptativa: el modelo prueba diferentes tamaños de tesela en un proceso hijo aislado para determinar el máximo utilizable en la GPU del usuario.

## Casos de uso

- Retoque profesional de retratos: el modelo sugiere dónde debe incidir la luz para dar volumen a rasgos faciales, facilitando el trabajo del retocador en estudios fotográficos.
- Fotografía de producto: realza la tridimensionalidad de objetos como telas, metal o cerámica, mejorando la percepción de forma sin alterar la textura fina.
- Postproducción cinematográfica: integrado en flujos de color grading para dar profundidad a planos con iluminación plana.
- Restauración de imágenes antiguas: ayuda a recuperar la sensación de volumen en fotografías desgastadas o escaneadas con pérdida de contraste.
- Creación de contenido publicitario: permite ajustar la modelación de luz en imágenes de campaña sin necesidad de reiluminación compleja.
- Enseñanza de retoque: sirve como herramienta didáctica para mostrar cómo se separa el dodge & burn del volumen en un flujo profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una medición de calibración de teselas en una RTX 3060 Ti (8 GB), donde se determinó que el tamaño máximo utilizable es 3072 píxeles, frente a 2816 del motor de dodge & burn en la misma GPU. No hay datos de latencia, throughput ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al menos 8 GB, según la prueba documentada en una RTX 3060 Ti.
- GPU recomendada: tarjetas con 8 GB o más de VRAM; el modelo tolera teselas de hasta 3072 píxeles en esa configuración.
- Compatibilidad con GPU de consumo: sí, la RTX 3060 Ti es una GPU de gama media, por lo que es plausible que funcione en otras tarjetas similares (RTX 2070, RTX 3060, etc.), aunque no se ha verificado.
- Opciones de despliegue: el modelo se ejecuta mediante runtime ONNX en el dispositivo, integrado en el plugin de Photoshop de happyin.ai. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (retoque de volumen con mapas de grises). La model card no menciona alternativas ni benchmarks comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Los pesos no están publicados: la licencia `card-only-weights-not-released` impide descargar o utilizar el modelo fuera del plugin oficial de happyin.ai.
- El modelo propone forma, no esculpe: sugiere dónde debería estar el volumen, pero no modifica la anatomía ni debe usarse para ello.
- Alcance limitado a escala amplia: la textura fina queda fuera de su banda de trabajo, siendo responsabilidad del motor de dodge & burn.
- Mayor consumo por tesela que el motor de dodge & burn: en una GPU de 8 GB, el límite se sitúa en 3072 píxeles.
- No es un modelo de reiluminación: trabaja con la luz existente en la imagen, no puede añadir ni cambiar fuentes de luz.
- Riesgo de sobreaplicación: si se usa en exceso, puede producir un aspecto de "máscara" en el rostro, como se advierte en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/happyinhappy/retouch-volume-onnx
- Sitio web de happyin.ai: https://happyin.work/happyin-ai/
- Contacto por Telegram: https://t.me/HappyinAI_bot · https://t.me/happy_in_happy
