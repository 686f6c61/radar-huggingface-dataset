# neavo/lama-large-fp32-onnx

## Resumen

LaMa Large FP32 ONNX es una reexportación del modelo de inpainting para manga y anime `dreMaz/AnimeMangaInpainting`, publicada por el usuario neavo bajo licencia MIT. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es una red convolucional de reparación de imágenes (image inpainting) especializada en eliminar y rellenar regiones en viñetas e ilustraciones de estilo manga, preservando la coherencia de líneas, tramas y colores. El repositorio contiene un único fichero ONNX de 204,5 MB en FP32, sin cuantizar y sin reentrenamiento respecto a los pesos originales.

El interés técnico del artefacto reside en el empaquetado: el autor ha optimizado los cálculos de Fourier y las operaciones repetidas de formas para acelerar la inferencia y la carga en CPU, y ha validado el grafo exportado contra la implementación original en PyTorch con una tolerancia máxima de canal de aproximadamente 0,0342/255 en 30 escenarios. El modelo acepta tensores dinámicos con dimensiones múltiplo de 64 y funciona tanto con el execution provider de CPU como con WebGPU mediante `onnxruntime-node 1.31.1`.

Es relevante para pipelines de traducción y limpieza de manga (por ejemplo, integraciones tipo BallonsTranslator) que necesitan eliminar texto o elementos superpuestos antes de redibujar, y que se benefician de un único fichero ONNX portable, con licencia permisiva y sin dependencia de PyTorch en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de inpainting (LaMa), exportada a ONNX; no es un transformer |
| Parametros totales | no disponible (el fichero FP32 pesa 204,5 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos FP32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero único `lama-large-fp32.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es LaMa (Large Mask Inpainting), una arquitectura convolucional con componentes de procesamiento en el dominio de la frecuencia (convoluciones rápidas de Fourier) diseñada para rellenar máscaras grandes de forma coherente con la estructura de la imagen. La variante concreta reexportada, `dreMaz/AnimeMangaInpainting`, es un ajuste orientado a ilustración y manga, pero la información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo fases de ajuste fino adicionales más allá de las indicadas por el modelo base.

La aportación del repositorio de neavo es exclusivamente de ingeniería de exportación: se han optimizado los cálculos de Fourier y las operaciones repetidas de formas para mejorar la velocidad de carga e inferencia en CPU, manteniendo la red principal en FP32. El grafo admite entradas dinámicas con alto y ancho múltiplos de 64 (verificados en el rango de 64 a 1024, incluyendo rectángulos horizontales y verticales), y la salida debe recortarse a la resolución original y componerse solo dentro de la máscara.

## Capacidades

- Inpainting de imágenes: recibe una imagen RGB en float32 con rango 0–1 y una máscara binaria float32 donde 1 indica la región a reparar, y devuelve la predicción de relleno.
- Eliminación de texto y elementos superpuestos en viñetas de manga, con reconstrucción de líneas y tramas.
- Soporte de resoluciones dinámicas múltiplo de 64, incluyendo formatos apaisados y verticales.
- Ejecución en CPU y en WebGPU mediante ONNX Runtime, con un único fichero portable.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.
- No dispone de modo de pensamiento, audio ni otras modalidades distintas de la imagen.

## Casos de uso

- Traducción de manga: el modelo elimina el texto original de los bocadillos antes de que un pipeline de tipografía redibuje la traducción, reconstruyendo el fondo de la viñeta de forma coherente con las tramas y líneas circundantes.
- Limpieza de scans: eliminación de sellos de agua, anotaciones o artefactos de digitalización en páginas escaneadas, usando la máscara binaria para limitar la modificación estrictamente a la zona afectada.
- Integración en BallonsTranslator: el repositorio cita explícitamente esta herramienta como referencia de exportación, por lo que el ONNX puede sustituir al modelo PyTorch en el flujo de limpieza de la aplicación.
- Edición interactiva en navegador: gracias al soporte de WebGPU y a la entrada dinámica, puede desplegarse en un editor web donde el usuario pinte la máscara y obtenga el resultado sin backend adicional.
- Preprocesado en pipelines de restauración de cómics: reparación de zonas dañadas o con ruido antes de un paso de superresolución o recoloreado.
- Automatización por lotes en CPU: al estar optimizado para carga e inferencia en CPU, encaja en servidores sin GPU que procesan volúmenes grandes de páginas de forma secuencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una validación de fidelidad numérica frente a la implementación original en PyTorch: en 30 escenarios comparados en CPU y WebGPU, el error máximo por canal fue de aproximadamente 0,0342/255, sin garantía de coincidencia bit a bit entre hardware distinto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero FP32 ocupa 204,5 MB, por lo que la huella en memoria es moderada y depende de la resolución de entrada.
- GPU recomendadas: no disponibles; el autor no publica cifras de latencia ni de throughput por GPU.
- Compatibilidad con GPU de consumo: el soporte de WebGPU sugiere viabilidad en navegadores y GPUs de consumo recientes, pero no se aportan modelos concretos ni cifras.
- Despliegue: ONNX Runtime, con `onnxruntime-node 1.31.1` como versión recomendada; execution providers `cpu` y `webgpu`, con retroceso a CPU para operaciones auxiliares.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neavo/lama-large-fp32-onnx | LaMa convolucional en ONNX | no disponible (204,5 MB FP32) | no aplica | MIT | Hugging Face, ONNX |
| dreMaz/AnimeMangaInpainting | LaMa convolucional en PyTorch | no disponible | no aplica | MIT | Hugging Face, pesos originales |
| Otras variantes LaMa | LaMa convolucional | no disponible | no aplica | variable | no disponible |

La comparación se limita al modelo base del que deriva, ya que la información proporcionada no incluye otros modelos de inpainting para manga con datos verificables.

## Limitaciones y advertencias

- Es un modelo de inpainting de imagen; no procesa texto ni mantiene conversaciones, por lo que no debe evaluarse con métricas de LLM.
- No se han publicado datos sobre sesgos del dataset de entrenamiento ni sobre el rendimiento en estilos distintos del manga y el anime.
- Riesgo de artefactos o reconstrucciones inconsistentes en máscaras muy grandes o en zonas con estructura compleja; la model card no cuantifica este extremo.
- La fidelidad numérica frente a PyTorch está validada con una tolerancia de aproximadamente 0,0342/255 y no se garantiza bit a bit en hardware distinto.
- La licencia MIT del modelo base se declara en la model card, pero conviene verificar las condiciones de los datos de entrenamiento originales antes de un uso comercial a gran escala.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-11), por lo que carece de validación comunitaria.
- No se especifican requisitos de memoria ni límites de resolución más allá del rango verificado de 64 a 1024 píxeles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neavo/lama-large-fp32-onnx
- Modelo base: https://huggingface.co/dreMaz/AnimeMangaInpainting
- Implementación de referencia citada (BallonsTranslator): https://github.com/dmMaze/BallonsTranslator
