# mantelmoritz/MODNet-Webcam-safetensors

## Resumen

MODNet-Webcam-safetensors es una conversión de formato del checkpoint preentrenado MODNet en su variante webcam, publicada por el usuario mantelmoritz en Hugging Face. MODNet (Matting Objective Decomposition Network) es una red neuronal ligera diseñada para realizar *matting* de retratos en tiempo real sin necesidad de trimap, es decir, separar a una persona del fondo en una imagen RGB produciendo una máscara alfa de alta calidad. La variante webcam emplea un backbone MobileNetV2 y fue entrenada específicamente para vídeo, lo que la hace adecuada para aplicaciones de captura en directo.

El modelo original fue desarrollado por Zhanghan Ke, Jiayu Sun, Kaican Li, Qiong Yan y Rynson W.H. Lau, y presentado en AAAI 2022. Esta conversión concreta no reentrena ni modifica los pesos: únicamente transforma el checkpoint original en formato PyTorch pickle a un único archivo `model.safetensors`, manteniendo los 751 tensores del `state_dict` original con sus nombres y valores intactos.

La relevancia de esta publicación es fundamentalmente práctica: el plugin de OBS CorridorKey necesita los pesos en un formato legible desde C++ con una URL de descarga estable, algo que el checkpoint original (alojado en Google Drive) no ofrecía. Con 8,78 millones de parámetros y un tamaño de repositorio mínimo, el modelo está pensado para inferencia en tiempo real en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MODNet (Matting Objective Decomposition Network) con backbone MobileNetV2 |
| Parametros totales | 8.779.891 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión original, sin cuantizar) |
| Idiomas soportados | no disponible (modelo de imagen, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (único archivo `model.safetensors`) |

## Arquitectura y entrenamiento

MODNet se basa en una descomposición objetiva del problema de matting en tres ramas: una rama semántica que estima la máscara de primer plano a bajo nivel de detalle, una rama de detalle que refina los bordes, y una rama de fusión que combina ambas para producir la matte final. La variante webcam utiliza MobileNetV2 como backbone para reducir el coste computacional y permitir inferencia en tiempo real sobre vídeo. El modelo no requiere trimap en inferencia, lo que simplifica enormemente su integración en pipelines automáticos.

El checkpoint aquí publicado corresponde al entrenamiento oficial del proyecto MODNet (commit `28165a451e4610c9d77cfdf925a94610bb2810fb`), con sha256 del archivo original `913b82b66558db39b6286c150f809017d7528c872b156eb14333c9c6cb52108b`. La conversión conserva el prefijo `module.` del entrenamiento original y duplica el backbone bajo `module.backbone.*` y `module.lr_branch.backbone.*`, ya que safetensors no admite tensores compartidos. No se ha reentrenado, podado ni cuantizado ningún peso.

## Capacidades

- Generación de mattes de retrato (máscara alfa) a partir de una imagen RGB, sin trimap.
- Segmentación de primer plano persona/fondo en imágenes individuales.
- Procesamiento de vídeo en tiempo real gracias al backbone MobileNetV2 y a la variante webcam.
- Refinamiento de bordes mediante la rama de detalle, adecuado para pelo, ropa y contornos finos.
- Integración como pista gruesa de persona en pipelines de *background removal* (por ejemplo, como hint para CorridorKey 1.0 en OBS).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual.

## Casos de uso

- **Eliminación de fondo en videollamadas y streaming**: el modelo genera una matte por fotograma que permite sustituir el fondo en OBS o en aplicaciones de videoconferencia, con latencia compatible con tiempo real gracias a sus 8,78 M de parámetros y al backbone MobileNetV2.
- **Integración en el plugin CorridorKey para OBS**: se usa como pista gruesa de persona que alimenta el grafo ONNX de CorridorKey 1.0, que enlaza los pesos en C++ y refina la matte final.
- **Edición de vídeo y postproducción**: extracción automática de la máscara de persona en bruto para composición, rotoscopia asistida o generación de canales alfa en herramientas de edición.
- **Creación de contenido para redes sociales**: separación rápida de sujeto y fondo en clips grabados con webcam para aplicar efectos, cromas virtuales o fondos personalizados sin infraestructura de estudio.
- **Prototipado de aplicaciones de visión por computador**: al estar en safetensors y cargarse con `safetensors.torch.load_file`, sirve como base reproducible para experimentos de matting en Python sin depender de pickles ni de descargas inestables.
- **Sistemas de captura automatizada con cámara**: aplicaciones de fotomatón, docencia en remoto o retransmisión donde se necesita aislar al presentador del entorno de forma continua y con recursos de GPU limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32, dado el reducido número de parámetros (8,78 M); no se dispone de cifras oficiales de consumo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo está diseñado para tiempo real incluso en hardware de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante, RTX 20/30/40, etc.), y probablemente también en CPU para vídeo a resolución moderada.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y el código oficial de MODNet; también puede exportarse a ONNX para su uso en el plugin CorridorKey.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el diseño del modelo apunta a tiempo real en vídeo, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| MODNet-Webcam-safetensors | 8,78 M | Imagen RGB, sin trimap | Apache 2.0 | Hugging Face (safetensors) |
| MODNet original (webcam) | 8,78 M (mismos pesos) | Imagen RGB, sin trimap | Apache 2.0 | GitHub + Google Drive (pickle) |
| Modelos de matting con trimap (p. ej. variantes de Deep Image Matting) | no disponible | Imagen RGB + trimap | no disponible | no disponible |

La comparación directa con alternativas de matting sin trimap no está disponible en la información proporcionada. La diferencia principal frente al MODNet original es exclusivamente el formato de pesos y la disponibilidad de una URL estable.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: cualquier limitación del MODNet original se mantiene intacta.
- El checkpoint almacena el backbone dos veces (copias idénticas), lo que duplica esos tensores en disco y memoria al cargar.
- El prefijo `module.` debe eliminarse manualmente al cargar el `state_dict` en el modelo de referencia.
- La entrada debe ser RGB en rango [0, 1], normalizada con `(x - 0.5) / 0.5`, y con altura y anchura múltiplos de 32; no cumplir estos requisitos produce resultados incorrectos.
- El modelo está especializado en retratos de personas; su rendimiento en otros sujetos u objetos no está garantizado.
- Riesgo de artefactos en bordes complejos (pelo, transparencias, movimiento rápido) inherente a la variante webcam de baja capacidad.
- No se han publicado evaluaciones de sesgo ni métricas de calidad en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el repositorio no está afiliado a los autores originales de MODNet; se recomienda conservar la atribución y la bibliografía citada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/mantelmoritz/MODNet-Webcam-safetensors
- Proyecto original MODNet: https://github.com/ZHKKKe/MODNet
- Commit de referencia: `28165a451e4610c9d77cfdf925a94610bb2810fb`
- Paper (AAAI 2022): MODNet: Real-Time Trimap-Free Portrait Matting via Objective Decomposition, Ke et al.
- Plugin CorridorKey (proyecto real-time): no disponible como URL en la información proporcionada.
