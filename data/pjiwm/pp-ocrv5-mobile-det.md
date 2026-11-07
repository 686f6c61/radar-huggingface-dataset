# Pjiwm/PP-OCRv5-mobile-det

## Resumen

PP-OCRv5-mobile-det es el detector de líneas de texto móvil de la familia PP-OCRv5, desarrollado originalmente por el equipo de PaddleOCR (Baidu) y republicado por el usuario Pjiwm en Hugging Face con los pesos convertidos a safetensors. El modelo resuelve el problema de localizar regiones de texto en imágenes (detección, no reconocimiento): dada una imagen, produce un mapa de probabilidad por píxel que delimita las líneas de texto. Es relevante porque permite ejecutar detección de texto sin el runtime de PaddlePaddle, lo que simplifica su integración en stacks basados en PyTorch y en entornos donde instalar Paddle es problemático.

Arquitectónicamente es un detector DB (differentiable binarisation) con backbone PP-LCNetV3, cuello RSEFPN y cabeza DB. La variante "mobile" está pensada para inferencia ligera, con un peso de solo 4,7 MB en float32, lo que lo hace apto para CPU y dispositivos con recursos limitados. No es un modelo generativo ni un LLM: no tiene parámetros en el sentido de un transformer de lenguaje ni ventana de contexto textual.

El repositorio es una conversión de pesos, no un modelo reentrenado: los valores son idénticos a los del modelo de inferencia oficial y se conservan los nombres originales de Paddle. Esto implica que el usuario debe reconstruir la topología de red para cargar los pesos, ya que el archivo contiene únicamente tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector DB (differentiable binarisation) con backbone PP-LCNetV3, cuello RSEFPN y cabeza DB |
| Parametros totales | no disponible (peso del archivo: 4.707.204 bytes en float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible en la model card; fuentes externas indican inglés, chino y japonés para la familia PP-OCRv5 |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32, nombres originales de Paddle) |

## Arquitectura y entrenamiento

El modelo sigue el esquema DB (Differentiable Binarization), habitual en detección de texto: un backbone PP-LCNetV3 extrae características, un cuello RSEFPN las fusiona a varias escalas y una cabeza DB genera un mapa de probabilidad por píxel que, tras umbralización y post-proceso, da las regiones de texto. La entrada se normaliza con la media y desviación estándar de ImageNet, tal como en el pipeline de PaddleX.

No se dispone de información sobre el dataset de entrenamiento, el número de imágenes, el proceso de anotación ni si hubo aumentos de datos específicos. La model card indica explícitamente que los pesos no se han reentrenado: la conversión solo cambia el contenedor (de modelo de inferencia Paddle a safetensors) y conserva los valores y los nombres de los parámetros. Los resultados de salida coinciden con los del modelo original bajo el runtime de Paddle.

## Capacidades

- Detección de líneas de texto en imágenes mediante mapa de probabilidad por píxel.
- Manejo de texto manuscrito, vertical, rotado y curvo, según fuentes externas sobre la familia PP-OCRv5.
- Diseño móvil y ligero: peso de 4,7 MB, apto para CPU y dispositivos de bajos recursos.
- Carga sin runtime de PaddlePaddle, al estar los pesos en safetensors.
- No incluye reconocimiento de texto (OCR completo): solo detección; requiere un modelo de reconocimiento aparte.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- Preprocesado de OCR en pipelines propios: detectar regiones de texto antes de pasar cada recorte a un modelo de reconocimiento, reduciendo el coste de reconocer la imagen completa.
- Digitalización de documentos escaneados: localizar líneas de texto en facturas, formularios o PDFs rasterizados para su posterior extracción estructurada.
- Procesamiento en el borde (edge): al pesar 4,7 MB y no requerir Paddle, puede desplegarse en dispositivos con poca memoria para detectar texto en capturas de cámara.
- Moderación y análisis de imágenes: detectar la presencia y ubicación de texto en imágenes subidas por usuarios antes de aplicar filtros o clasificadores.
- Indexación de archivos multimedia: extraer regiones de texto de fotogramas de vídeo o capturas para alimentar un buscador posterior.
- Integración en stacks PyTorch: al estar en safetensors, se puede cargar en un proyecto Python sin dependencias de Paddle, simplificando el empaquetado en contenedores.
- Automatización de accesibilidad: localizar texto en imágenes para generar descripciones o recortes que se pasen a un sistema de lectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; el peso del modelo es de 4,7 MB en float32, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU (RTX 3060, RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas; también en dispositivos embebidos.
- Opciones de despliegue: al ser safetensors sin grafo, requiere reconstruir la red (por ejemplo, con PyTorch) y cargar los tensores; no hay integración directa con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo móvil de 4,7 MB, se espera latencia baja en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Peso | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PP-OCRv5-mobile-det (esta ficha) | Detección DB, PP-LCNetV3 | 4,7 MB (float32) | no aplica | Apache 2.0 | Hugging Face (Pjiwm), safetensors |
| PaddlePaddle/PP-OCRv5_mobile_det | Detección DB, original | no disponible | no aplica | Apache 2.0 | Hugging Face (PaddlePaddle), formato Paddle |
| PP-OCRv5 (variantes server) | Detección DB, mayor capacidad | no disponible | no aplica | Apache 2.0 | Repositorio PaddleOCR |

La comparativa se limita a variantes de la misma familia; no se dispone de datos de rendimiento para comparar con detectores de otras familias (por ejemplo, basados en DBNet con otros backbones) en la información proporcionada.

## Limitaciones y advertencias

- Solo detección: no reconoce el contenido del texto; hay que emparejarlo con un modelo de reconocimiento.
- Requiere reconstruir la topología de red: el archivo safetensors contiene únicamente pesos, sin grafo ni código de carga.
- Idiomas: la model card no especifica idiomas; las fuentes externas apuntan a inglés, chino y japonés para la familia, pero no está confirmado para esta conversión concreta.
- Sin datos de entrenamiento ni evaluación publicados: no se puede verificar su precisión frente al original más allá de la afirmación del autor de que las salidas coinciden bajo Paddle.
- Riesgo de degradación en dominios no cubiertos (texto muy pequeño, fondos complejos, baja resolución) sin benchmarks que lo cuantifiquen.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar la atribución a PaddlePaddle y revisar los términos del modelo original.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como conversión no auditada.

## Enlaces

- Hugging Face (conversión): https://huggingface.co/Pjiwm/PP-OCRv5-mobile-det
- Modelo original en Hugging Face: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det
- Repositorio PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Ficha en AxForge: https://catalog.axforge.ai/models/pp-ocrv5-mobile-det/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
