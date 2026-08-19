# LibreYOLO/LibreDDColort-restore

## Resumen

LibreDDColort-restore es un modelo de colorización automática de imágenes en blanco y negro, desarrollado por LibreYOLO como una conversión del modelo DDColor (con encoder ConvNeXt-T) para su ecosistema de tareas de restauración. El modelo predice el canal de croma en el espacio de color Lab a una resolución de 512×512 y reconstruye la imagen RGB final sobre el lienzo original, utilizando el plano de luminancia de la imagen de entrada como referencia. Esto permite colorear fotografías históricas, fotogramas de películas antiguas o cualquier imagen monocroma con resultados visualmente coherentes.

La relevancia de este modelo radica en que ofrece una implementación ligera (el checkpoint ocupa aproximadamente 220 MB) y con licencia Apache-2.0, lo que facilita su integración en proyectos de restauración patrimonial, archivos digitales o aplicaciones de edición fotográfica. Al estar convertido para la librería LibreYOLO, su uso se simplifica a una llamada de API, aunque también puede utilizarse con el código original de DDColor si se respeta la paridad de pesos.

El modelo se distribuye con una advertencia importante: aunque el artefacto en sí está licenciado bajo Apache-2.0, fue entrenado sobre ImageNet, cuyo acuerdo de acceso limita su uso a fines de investigación y educación no comercial. Esta restricción no se elimina con la conversión y debe tenerse en cuenta para cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDColor con encoder ConvNeXt-T (decoder transformer) |
| Parametros totales | no disponible (checkpoint de ~220 MB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imagenes) |
| Licencia | Apache-2.0 (con caveat sobre ImageNet) |
| Formato de pesos | .pt (PyTorch) segun ejemplo de uso; no se indica safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DDColor, que combina un encoder basado en ConvNeXt-Tiny para extraer características de la imagen en escala de grises y un decoder basado en bloques transformer que predice los canales de croma (a y b) en el espacio Lab. La conversión realizada por LibreYOLO mantiene los tensores aprendidos sin modificaciones, garantizando una paridad exacta con el checkpoint original (`max_abs_diff=0`). El pipeline completo de procesamiento Lab (incluyendo la conversión de color con OpenCV) es pixel-idéntico al de la referencia.

El entrenamiento se realizó sobre el dataset ImageNet, con inicialización de pesos procedente de ImageNet-22K. No se han publicado detalles adicionales sobre el número de épocas, la composición exacta del dataset o el uso de técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de visión y no de lenguaje. El checkpoint artístico de DDColor, que utiliza datos privados no divulgados, fue excluido deliberadamente de esta conversión para mantener la trazabilidad y la licencia limpia.

## Capacidades

- Colorización de imágenes en blanco y negro o en escala de grises, produciendo una salida RGB con colores plausibles.
- Restauración de imágenes antiguas o degradadas, aprovechando el plano de luminancia original para preservar los detalles estructurales.
- Procesamiento de imágenes de entrada de cualquier tamaño, ya que la predicción de croma se realiza a 512×512 y luego se reconstruye sobre el lienzo original.
- Integración sencilla con la librería LibreYOLO mediante una llamada de API (`LibreYOLO("LibreDDColort-restore.pt")`).
- Compatibilidad con el ecosistema DDColor original, al mantener los mismos pesos y arquitectura.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, al ser un modelo exclusivamente de visión.

## Casos de uso

- Restauración de archivos fotográficos históricos: el modelo puede colorear automáticamente fotografías en blanco y negro de bibliotecas o museos, facilitando la digitalización y preservación del patrimonio visual. Su tamaño reducido permite procesar lotes en hardware modesto.
- Colorización de fotogramas de películas antiguas: aplicable a la restauración de cine mudo o películas en escala de grises, donde se puede procesar cada fotograma de forma independiente y mantener la coherencia temporal mediante post-procesado.
- Preparación de datasets para entrenamiento de otros modelos: las imágenes coloreadas pueden servir como aumentación de datos o como entrada para modelos de detección de objetos o segmentación que requieran color.
- Edición fotográfica en aplicaciones de consumo: integrable en herramientas de retoque fotográfico para ofrecer una función de "colorear" con un solo clic, sin necesidad de intervención manual.
- Investigación en visión por computador: útil como baseline para comparar métodos de colorización o para estudiar la transferencia de color en dominios específicos.
- Generación de contenido creativo: artistas y diseñadores pueden usar el modelo para explorar paletas de color alternativas en ilustraciones o bocetos en escala de grises.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas cuantitativas como PSNR, SSIM o FID para comparar con otros modelos de colorización.

## Requisitos de hardware

- El checkpoint ocupa aproximadamente 220 MB, por lo que la inferencia es viable en CPU para imágenes individuales, aunque con mayor latencia.
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM debería ser suficiente para procesar imágenes a 512×512 (no se especifica el consumo exacto de memoria).
- Es compatible con GPUs consumer como RTX 3060, RTX 4060 o superiores, así como con GPUs de datacenter (T4, A10, etc.).
- Para despliegue en producción, se puede servir mediante la librería LibreYOLO o mediante el código original de DDColor (PyTorch). No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia, al ser un modelo de visión.
- La latencia estimada no está documentada, pero al ser un modelo pequeño, se espera un throughput de decenas de imágenes por segundo en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| LibreDDColort-restore | DDColor (ConvNeXt-T + transformer) | ~220 MB (no exacto) | Apache-2.0 (con caveat ImageNet) | HuggingFace, LibreYOLO |
| DDColor original (piddnad/ddcolor_paper_tiny) | DDColor (ConvNeXt-T + transformer) | ~220 MB | Apache-2.0 (según publisher) | HuggingFace, GitHub |
| DeOldify | ResNet + GAN | ~200-300 MB | MIT (variante) | GitHub, HuggingFace |

La comparativa se limita a aspectos estructurales y de licencia, ya que no se dispone de benchmarks comunes. LibreDDColort-restore se distingue por su integración con LibreYOLO y por la exclusión del checkpoint artístico, lo que reduce riesgos legales asociados a datos privados.

## Limitaciones y advertencias

- El modelo fue entrenado con ImageNet, cuyo acuerdo de acceso restringe el uso a fines de investigación y educación no comercial. Esta limitación se hereda del dataset y no se elimina con la conversión, por lo que cualquier uso comercial requeriría verificar la licencia de ImageNet o reentrenar con datos propios.
- La colorización es una tarea subjetiva; el modelo puede producir colores plausibles pero no necesariamente históricamente precisos, especialmente en escenas con iluminación compleja o elementos desconocidos.
- No se han publicado métricas de rendimiento ni estudios de sesgo, por lo que se desconoce su comportamiento en dominios específicos (piel, vegetación, cielos, etc.).
- El modelo solo procesa imágenes; no soporta entrada de texto ni instrucciones para controlar la paleta de colores.
- La resolución de predicción de croma está fijada en 512×512; imágenes mucho más grandes pueden requerir un post-procesado adicional para evitar artefactos.
- No se garantiza la compatibilidad con versiones futuras de la librería LibreYOLO, aunque al ser un formato de checkpoint estándar, es probable que se mantenga.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/LibreYOLO/LibreDDColort-restore)
- [Repositorio fuente del checkpoint original](https://huggingface.co/piddnad/ddcolor_paper_tiny)
- [Repositorio de DDColor (GitHub)](https://github.com/piddnad/DDColor)
- [Documentación de LibreYOLO (si existe, no se proporciona en la información)](no disponible)
