# open-noodle/depth-anything-v2-small

## Resumen

Depth Anything V2 Small (ONNX) es una exportación a formato ONNX del modelo de estimación de profundidad monocular Depth Anything V2 Small, desarrollado originalmente por el equipo Depth Anything (ByteDance y colaboradores) y publicado en el paper arXiv:2406.09414. Esta versión concreta la mantiene el proyecto open-noodle, que la utiliza como componente de su aplicación Gallery para generar mapas de profundidad en su función "Spatial Scene". El modelo resuelve la tarea de estimar un mapa de disparidad (profundidad inversa relativa) a partir de una única imagen RGB, sin necesidad de calibración estéreo ni de sensores adicionales.

Se trata de un transformer de visión con backbone DINOv2 de tamaño "small", reexportado sin modificar los pesos originales salvo por un cambio en el grafo: el resize final de la cabeza de profundidad se convierte en un factor de escala, de modo que las dimensiones de altura y anchura permanecen dinámicas en el grafo ONNX. El repositorio ocupa 0,1 GB e incluye dos variantes: un modelo fp32 en opset 18 y una versión con pesos int8 dinámicos pensada exclusivamente para CPU.

Su relevancia actual es práctica: al estar en ONNX, puede ejecutarse con ONNX Runtime en entornos sin PyTorch, lo que facilita su integración en aplicaciones de escritorio, pipelines ligeros o despliegues en CPU. No obstante, es un artefacto de infraestructura más que un modelo de propósito general: no genera texto, no razona y no admite instrucciones en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (backbone DINOv2 small) con cabeza de profundidad, exportado a ONNX |
| Parametros totales | no disponible (el modelo base Small de Depth Anything V2 se sitúa en el orden de decenas de millones; la cifra exacta no consta en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen con alto y ancho múltiplos de 14, lado corto redimensionado a 518 en Gallery) |
| Tipos de cuantizacion | fp32 (opset 18) e int8 dinámico para pesos (solo CPU) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`depth/model.onnx` fp32, `depth/model_int8.onnx` int8) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de visión con backbone DINOv2 en variante small, sobre el que se añade una cabeza de predicción de profundidad. El modelo produce profundidad inversa relativa (disparidad): valores mayores indican mayor cercanía, sin escala absoluta fija. La exportación a ONNX conserva los pesos originales sin modificar; el único cambio en el grafo afecta al resize final de la cabeza de profundidad, que pasa a expresarse como factor de escala para mantener altura y anchura dinámicas.

El preprocesado es el estándar de ImageNet: entrada `pixel_values` con forma `[1, 3, height, width]` en float32, RGB escalado a 0..1 y normalizado con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`. La salida es `predicted_depth` con forma `[1, height, width]` en float32. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el modelo original Depth Anything V2 se entrena con datos sintéticos y reales etiquetados, pero esos detalles no constan aquí.

## Capacidades

- Estimación de profundidad monocular a partir de una sola imagen RGB.
- Generación de mapas de disparidad (profundidad inversa relativa) con resolución dinámica de entrada y salida.
- Ejecución en CPU mediante la variante int8 dinámica, y en GPU/CPU con la variante fp32.
- Integración en pipelines sin PyTorch gracias al formato ONNX y a ONNX Runtime.
- Uso como componente de reconstrucción espacial en la aplicación Gallery (función Spatial Scene).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo "thinking", visión general, audio ni otras modalidades más allá de imagen a profundidad.

## Casos de uso

- Reconstrucción espacial en aplicaciones de galería de imágenes: Gallery usa este modelo para generar mapas de profundidad que alimentan su vista "Spatial Scene", permitiendo efectos de paralaje o percepción de tridimensionalidad sobre fotos planas.
- Generación de mapas de profundidad en pipelines de posprocesado de imagen: el modelo puede insertarse como paso intermedio en un flujo ONNX Runtime para producir mapas de disparidad que luego se usen en desenfoque selectivo, bokeh sintético o segmentación por profundidad.
- Prototipado rápido en entornos sin GPU: la variante int8 dinámica permite ejecutar inferencia de profundidad en CPU en portátiles o servidores sin acelerador, útil para demos y validaciones tempranas.
- Aplicaciones de realidad aumentada ligera: el mapa de profundidad relativa sirve para ocluir objetos virtuales detrás de elementos cercanos en la escena, sin necesidad de sensores de profundidad dedicados.
- Herramientas de edición fotográfica: separación de primer plano y fondo basada en disparidad para aplicar ajustes diferenciales (nitidez, color, desenfoque) según la distancia estimada.
- Automatización de documentación técnica de imágenes: generación de mapas de profundidad para análisis posteriores en visión por computador, como entrada a modelos de segmentación o de detección que se beneficien de información geométrica.
- Despliegue en aplicaciones de escritorio multiplataforma: al ser ONNX, puede empaquetarse con ONNX Runtime en apps nativas sin arrastrar dependencias de PyTorch, reduciendo el tamaño del binario y simplificando la distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la naturaleza del modelo (variante small), la huella de memoria es reducida, pero no se proporcionan cifras concretas de VRAM.
- GPU recomendadas: no disponibles en la información proporcionada; al ser un modelo small en ONNX, cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT) debería poder ejecutarlo.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido del modelo, aunque no se confirma con datos concretos.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), con variante int8 dinámica para CPU y fp32 para uso general.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| open-noodle/depth-anything-v2-small (este) | no disponible | imagen, lado corto 518 | Apache-2.0 | ONNX | HuggingFace |
| depth-anything/Depth-Anything-V2-Small-hf | no disponible | imagen, lado corto 518 | Apache-2.0 | safetensors (PyTorch) | HuggingFace |
| Depth Anything V2 Base / Large | no disponible | imagen | Apache-2.0 (según variante) | safetensors | HuggingFace |

La comparación relevante es con el modelo base original en PyTorch: este repositorio no añade capacidades nuevas, sino que ofrece el mismo modelo en ONNX con salida de dimensiones dinámicas y una variante int8 para CPU. Frente a las variantes Base y Large de Depth Anything V2, esta versión Small prioriza ligereza y velocidad sobre precisión, aunque no se dispone de cifras comparativas de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- El modelo produce profundidad relativa (disparidad) sin escala absoluta; no sirve para medir distancias métricas reales sin calibración adicional.
- No procesa texto ni instrucciones: es exclusivamente un modelo imagen a profundidad.
- La variante int8 está pensada solo para CPU; su uso en GPU no está soportado según la model card.
- No se dispone de información sobre sesgos del modelo ni sobre su comportamiento en dominios alejados de los datos de entrenamiento originales.
- Riesgo de alucinación en el sentido de mapas de profundidad plausibles pero incorrectos en escenas ambiguas, con oclusiones severas o texturas repetitivas; no se documentan métricas de error en esta ficha.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y del proyecto Gallery si se integra en productos derivados.
- El repositorio tiene muy pocas descargas (17) y ningún "like", lo que sugiere poca validación comunitaria; para producción conviene evaluar el modelo base original o validar esta exportación en el caso de uso concreto.
- Al ser una exportación ONNX, cualquier actualización del modelo base requeriría una reexportación; este artefacto no se actualiza automáticamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/open-noodle/depth-anything-v2-small
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Repositorio Gallery (proyecto que lo usa): https://github.com/open-noodle/gallery
