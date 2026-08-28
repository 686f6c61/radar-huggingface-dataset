# Remidesbois/Poneglyph-ReaderNet

## Resumen

Poneglyph ReaderNet es un paquete de inferencia para navegador desarrollado por Remidesbois, integrado en la aplicación Poneglyph, que resuelve el problema de detectar y ordenar los elementos de lectura en páginas de cómic y manga. Combina tres artefactos ONNX: un detector de bocadillos de diálogo (YOLO26n), un detector de paneles con segmentación (YOLO11n-seg) y un grafo de ordenación con dos cabezas MLP independientes que asignan el orden de lectura de paneles y de bocadillos dentro de cada panel. El modelo está pensado para ejecutarse íntegramente en el navegador mediante ONNX Runtime, sin necesidad de servidor.

El modelo se distribuye bajo licencia AGPL-3.0 y está diseñado específicamente para el dominio del cómic y el manga, no para imágenes generales. Su relevancia actual radica en que permite automatizar el flujo de lectura de páginas escaneadas o digitales, una tarea que tradicionalmente requería anotación manual. Los artefactos incluyen un manifiesto con hashes inmutables y un informe de paridad numérica entre las versiones originales y las fusionadas, lo que facilita la reproducibilidad y auditoría.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (detección de bocadillos), YOLO11n-seg (detección de paneles con segmentación), MLP heads (ordenación) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (formato ONNX estándar) |
| Idiomas soportados | no disponible (modelo visual, independiente del idioma del texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`.onnx`), con manifiesto JSON y reporte de paridad |

## Arquitectura y entrenamiento

El paquete se compone de tres artefactos ONNX que se ejecutan en secuencia. El detector de bocadillos (`bubble_detector.onnx`) es un YOLO26n end-to-end que toma una imagen de 800×800 píxeles y produce 300 detecciones con 6 salidas (coordenadas, confianza y clase). El detector de paneles (`panel_detector.onnx`) es un YOLO11n-seg que procesa imágenes de 1504×1504 píxeles y genera máscaras de segmentación; en la aplicación web se utilizan sus cajas NMS y se representan como polígonos rectangulares de cuatro puntos para las funciones de ordenación.

El tercer artefacto (`ordering.onnx`) es un único grafo ONNX que contiene dos cabezas MLP independientes: una para características de panel (entrada 96 dimensiones, salida logits por panel) y otra para características de bocadillo (entrada 102 dimensiones, salida logits por bocadillo). Estas cabezas se fusionaron en un solo archivo para reducir descargas y simplificar la configuración de sesiones de ONNX Runtime, pero sus predicciones son numéricamente idénticas a las exportaciones originales, como se verifica en el informe de paridad. El algoritmo de ordenación primero detecta paneles y bocadillos, luego ordena los paneles mediante pares dirigidos y probabilidades sigmoidales, asigna cada bocadillo al panel que lo contiene (o al más cercano si hay solapamiento), y finalmente ordena los bocadillos dentro de cada panel de forma independiente. No existe un ordenador global de bocadillos.

No se han publicado detalles sobre el conjunto de entrenamiento, número de épocas, o técnicas de aumento de datos en la información disponible.

## Capacidades

- Detección de bocadillos de diálogo en páginas de cómic y manga con bounding boxes.
- Detección de paneles con segmentación semántica (máscaras) y cajas delimitadoras.
- Ordenación de paneles en orden de lectura (de izquierda a derecha y de arriba a abajo, según la convención).
- Asignación de cada bocadillo a su panel correspondiente mediante contención del centro o proximidad al borde.
- Ordenación de bocadillos dentro de cada panel de forma independiente.
- Ejecución íntegra en navegador mediante ONNX Runtime (WebAssembly o WebGPU).
- Formato de salida compatible con representación poligonal de cuatro puntos para integración en aplicaciones web.

## Casos de uso

- Digitalización y archivado de cómics: dado un escaneo o imagen digital de una página, el modelo detecta automáticamente paneles y bocadillos, y genera un orden de lectura que puede usarse para crear versiones accesibles o reflow de texto.
- Aplicaciones de lectura asistida: integración en lectores de cómic para resaltar el orden de lectura, permitir navegación por paneles o ampliar bocadillos individuales.
- Traducción automática de manga: al detectar y ordenar bocadillos, se puede extraer el texto de cada uno (mediante OCR) y traducirlo manteniendo el orden correcto, facilitando la localización.
- Accesibilidad para personas con discapacidad visual: el orden de lectura generado permite convertir la página en una secuencia narrativa que puede leerse en voz alta mediante síntesis de voz.
- Análisis de narrativa visual: investigadores pueden usar el modelo para estudiar la estructura de paneles y la distribución de diálogos en diferentes obras.
- Herramientas de edición y retoque: los editores pueden identificar rápidamente la ubicación de bocadillos y paneles para reemplazar texto o modificar el diseño sin perder el orden de lectura.
- Generación de metadatos para bases de datos de cómics: el modelo puede producir anotaciones estructuradas (posiciones, orden, asignaciones) que alimentan catálogos digitales.

## Benchmarks y rendimiento

Los datos de validación reportados en la model card son los siguientes:

| Métrica | Resultado |
|---|---|
| Orden de paneles con polígonos anotados (páginas exactas) | 51/51 (100%) |
| Orden de bocadillos con detector compartido y paneles anotados (paneles multi-bocadillo exactos) | 132/138 (95.65%) |
| Orden de bocadillos con pipeline anterior publicado | 127/138 (92.03%) |
| Orden de paneles con rectángulos como polígonos de cuatro puntos | 51/51 (100%) |
| Orden de bocadillos con rectángulos como polígonos de cuatro puntos | 131/139 (94.24%) |
| End-to-end con paneles predichos y cajas de bocadillo de referencia | 125/139 (89.93%) |
| Precisión de asignación bocadillo-a-panel | 428/438 (97.72%) |

No se han publicado resultados en benchmarks estándar de visión por computadora (COCO, etc.) en la información disponible. Los informes detallados con conjuntos de datos, divisiones y protocolos se encuentran en los archivos JSON del repositorio.

## Requisitos de hardware

- El modelo está diseñado para inferencia en navegador, por lo que puede ejecutarse en CPU mediante WebAssembly o en GPU mediante WebGPU.
- Entradas de 800×800 y 1504×1504 píxeles; el requisito de memoria depende del backend de ONNX Runtime, pero es moderado para un modelo de tamaño nano (YOLO26n y YOLO11n-seg).
- No se han publicado requisitos específicos de VRAM ni latencia. Se estima que puede funcionar en dispositivos móviles modernos y portátiles sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime (servidor) si se desea ejecutar fuera del navegador.
- No se dispone de datos de throughput o latencia medidos.

## Comparativa con modelos similares

No se ha encontrado información sobre modelos directamente comparables en la misma categoría (detección de bocadillos y paneles de cómic con ordenación de lectura). La información disponible no permite establecer una comparativa con alternativas como Manga109, Comic Text Detector u otros, ya que no se han publicado métricas en esos conjuntos.

## Limitaciones y advertencias

- El modelo está especializado en cómic y manga; su rendimiento en otros tipos de imágenes o ilustraciones no está garantizado.
- La licencia AGPL-3.0 impone obligaciones de copyleft en caso de uso comercial o de distribución, especialmente si se integra en un servicio accesible por red. Se recomienda revisar los términos de Ultralytics (los detectores se exportaron con esa librería) y la licencia AGPL antes de desplegar en producción.
- La ordenación de bocadillos se realiza de forma independiente por panel; no existe un orden global de la página, lo que puede ser una limitación en diseños no convencionales.
- Los datos de validación son específicos del dominio y pueden no generalizar a estilos de cómic muy diferentes (por ejemplo, manhwa vertical, tiras de prensa, etc.).
- El modelo no realiza reconocimiento de texto (OCR); solo detecta y ordena los contenedores de diálogo. Para extraer el texto se necesita un paso adicional.
- No se han publicado análisis de sesgos o robustez ante ruido, rotaciones o degradación de imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Remidesbois/Poneglyph-ReaderNet
- Dataset asociado: https://huggingface.co/datasets/Remidesbois/Poneglyph
- Modelo OCR relacionado: https://huggingface.co/Remidesbois/LightonOCR-2-1b-poneglyph
- Repositorio de entrenamiento (Model Lab): https://github.com/remidesbois1/poneglyph-model-lab
- README del repositorio: https://github.com/remidesbois1/poneglyph-model-lab/blob/main/README.md
