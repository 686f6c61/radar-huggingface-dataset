# houssemzaier/iris-scene-encoders

## Resumen

Iris scene encoders es una colección de cuatro artefactos derivados de las torres de imagen de dos modelos CLIP: SigLIP 2 base (Google) y TinyCLIP ViT-39M/16 (Microsoft). El autor, houssemzaier, ha convertido y cuantizado únicamente los encoders visuales para que se ejecuten en dispositivos móviles: Core ML para iOS y LiteRT (TFLite) para Android. No se trata de un modelo de lenguaje, sino de extractores de características visuales que producen embeddings de imagen L2-normalizados de 768 (SigLIP 2) o 512 (TinyCLIP) dimensiones.

El propósito declarado es alimentar de contexto visual a la aplicación Iris: se captura un fotograma de cámara, se calcula su embedding y se compara por similitud coseno con vectores de texto precalculados a partir de descripciones cortas ("a person in a kitchen", "a person wearing a jacket or a coat"). Las descripciones más cercanas aportan contexto a la conversación sobre dónde está el usuario o qué lleva puesto. Las torres de texto no se incluyen en el repositorio; deben calcularse en un equipo de sobremesa con los modelos originales.

La relevancia actual reside en la eficiencia en dispositivo: el encoder SigLIP 2 base cabe en 83,5 MB en iOS (int8) y 185,5 MB en Android (fp16), con una latencia medida de 14 ms en un iPhone 16 Plus. TinyCLIP baja a 35,0 MB y 40,1 MB respectivamente, con 8 ms por lectura. La fidelidad frente a los originales en fp32 se mantiene con una similitud coseno mínima de 0,997 en las pruebas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (CLIP-style), torre de imagen únicamente; SigLIP 2 con attention-pooling head (92,9 M parámetros), TinyCLIP con proyección visual (38,6 M) |
| Parametros totales | SigLIP 2 base: 92,9 M (torre de imagen); TinyCLIP ViT-39M/16: 38,6 M (torre de imagen) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada 224 x 224 píxeles) |
| Tipos de cuantizacion | Core ML: int8 por canal (posición embedding de SigLIP 2 en fp16); LiteRT: fp16 (SigLIP 2) e int8 dynamic-range (TinyCLIP) |
| Idiomas soportados | No disponible (el encoder visual no procesa texto; los vectores de texto se calculan con las torres originales) |
| Licencia | Apache 2.0 (archivos SigLIP 2) y MIT (archivos TinyCLIP); licencia combinada "apache-2.0-and-mit" |
| Formato de pesos | Core ML `.mlmodelc` empaquetado en `.aar` (Apple Archive lzfse); LiteRT `.tflite` con metadatos MediaPipe |

## Arquitectura y entrenamiento

Los artefactos derivan de `google/siglip2-base-patch16-224` (commit `75de2d55`) y `wkcn/TinyCLIP-ViT-39M-16-Text-19M-YFCC15M` (commit `07a4b0bc`). Solo se ha exportado la torre de imagen: SigLIP 2 conserva su cabeza de attention pooling y TinyCLIP su proyección visual. SigLIP 2 usa parches de 16 x 16 sobre entradas de 224 x 224; TinyCLIP emplea ViT-39M con parche 16 y fue entrenado originalmente sobre YFCC15M. No se aportan datos sobre el entrenamiento original (número de tokens, composición del dataset, RLHF) más allá de las referencias a los modelos base.

La conversión se realizó con coremltools 9.0 y torch 2.7.0 para Core ML (ML Program, int8 por canal, compilado con `xcrun coremlcompiler` 3600.25.1) y con litert-torch 0.10.0, AI Edge Quantizer 0.10.0 y el escritor de metadatos MediaPipe 0.10.21 para LiteRT. La innovación técnica destacable es la decisión de mantener el position embedding de SigLIP 2 en fp16: una única escala int8 para él costaba dos imágenes en el conjunto de validación. Asimismo, SigLIP 2 conserva pesos fp16 en LiteRT porque int8 degradaba demasiado la fidelidad en ese modelo.

## Capacidades

- Extracción de embeddings de imagen: salida Float32 L2-normalizada de 768 dimensiones (SigLIP 2) o 512 (TinyCLIP).
- Búsqueda y clasificación zero-shot por similitud coseno contra vectores de texto precalculados (la torre de texto no se incluye).
- Reconocimiento de escena y contexto: lugar, ropa y su color, gafas o sombrero, según la model card.
- Clasificación de actividad entre seis categorías en pruebas internas (65-67 aciertos de 80 para SigLIP 2; 66 para TinyCLIP).
- Ejecución en dispositivo: Core ML en iOS 17+ vía Vision (`VNCoreMLRequest`) y LiteRT en Android vía MediaPipe Tasks Vision Image Embedder 1.1.1 (CPU).
- Entrada RGB de 224 x 224 con normalización interna en el grafo (MediaPipe: media 0, desviación 255).
- No soporta tool calling, agentes, generación de texto, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Contexto visual en asistentes conversacionales: la app Iris captura un fotograma ocasional, calcula su embedding y lo compara con descripciones precalculadas para inferir dónde está el usuario o qué lleva puesto, enriqueciendo el diálogo sin enviar imágenes a la nube.
- Clasificación de escena en el dispositivo: comparar el embedding de imagen contra un banco de descripciones ("cocina", "oficina", "calle") permite etiquetar el entorno con latencias de 8-14 ms por fotograma en un iPhone 16 Plus.
- Detección de atributos de vestimenta: descripciones como "a person wearing a jacket or a coat" o referencias a colores y accesorios (gafas, sombrero) permiten construir un perfil de contexto de forma local y con bajo consumo.
- Moderación o filtrado visual en el borde: dado que el modelo no identifica personas ni infiere rasgos sensibles, puede usarse para clasificar escenas genéricas en aplicaciones de cámara sin exfiltración de datos.
- Aplicaciones de accesibilidad: describir de forma aproximada el entorno o la indumentaria de una persona mediante coincidencia con un vocabulario cerrado de descripciones, ejecutándose íntegramente en el teléfono.
- Prototipado de búsqueda visual móvil: usar los embeddings de 768 o 512 dimensiones como índice ligero para recuperación de imágenes similares en una base de datos local del dispositivo.
- Investigación en eficiencia de modelos: servir de referencia para estudiar la pérdida de fidelidad de distintas estrategias de cuantización (int8 frente a fp16) en encoders CLIP sobre hardware móvil.

## Benchmarks y rendimiento

| Modelo | Core ML (coseno vs. fp32) | LiteRT, mismos píxeles (coseno) | Clasificación de actividad (80 imágenes, 6 clases) | Latencia (iPhone 16 Plus) |
|---|---|---|---|---|
| SigLIP 2 base | mediana 0,9994; mínimo 0,9980 | mínimo 0,999998 | 65-67 aciertos | 14 ms (mediana) |
| TinyCLIP 39M | mediana 0,9997; mínimo 0,9992 | mínimo 0,997 | 66 aciertos | 8 ms (mediana) |

Las comprobaciones de similitud coseno se realizaron sobre 111 imágenes frente al modelo PyTorch original en fp32. La clasificación de actividad se evaluó sobre 80 imágenes retenidas de personas, seleccionando la primera actividad entre seis; los archivos convertidos igualan el rendimiento de los originales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ImageNet top-1) en la información disponible.

## Requisitos de hardware

- VRAM/dispositivo: no requiere GPU de escritorio para inferencia; está diseñado para CPU móvil. En iOS, SigLIP 2 ocupa 83,5 MB y TinyCLIP 35,0 MB en disco; en Android, 185,5 MB y 40,1 MB respectivamente.
- GPU recomendadas: no aplica para el despliegue objetivo; la inferencia se ejecuta en el SoC del teléfono (Core ML con cómputo fp16; MediaPipe Tasks Vision en CPU).
- Compatibilidad consumer: cualquier iPhone con iOS 17 o superior para los `.aar`; dispositivos Android compatibles con MediaPipe Tasks Vision 1.1.1 para los `.tflite`.
- Opciones de despliegue: Vision (`VNCoreMLRequest`) en iOS tras extraer `SceneEncoder.mlmodelc` del `.aar` con `aa extract` o AppleArchive; MediaPipe Tasks Vision Image Embedder en Android.
- Latencia: mediana de 14 ms (SigLIP 2) y 8 ms (TinyCLIP) por lectura en un iPhone 16 Plus. Throughput no disponible.
- Nota de preprocesado: reducir la imagen en pasos filtrados o con filtro de área; un único redimensionado bilineal desde 640 píxeles degrada la precisión.

## Comparativa con modelos similares

| Modelo | Parámetros (torre imagen) | Entrada | Dimensión embedding | Formato | Licencia | Latencia móvil |
|---|---|---|---|---|---|---|
| Iris SigLIP 2 base (este repo) | 92,9 M | 224 x 224 | 768 | Core ML, LiteRT | Apache 2.0 | 14 ms (iPhone 16 Plus) |
| Iris TinyCLIP 39M (este repo) | 38,6 M | 224 x 224 | 512 | Core ML, LiteRT | MIT | 8 ms (iPhone 16 Plus) |
| google/siglip2-base-patch16-224 (original) | 92,9 M (torre imagen) | 224 x 224 | 768 | PyTorch (safetensors) | Apache 2.0 | No disponible (no orientado a móvil) |
| wkcn/TinyCLIP-ViT-39M-16-Text-19M-YFCC15M (original) | 38,6 M (torre imagen) | 224 x 224 | 512 | PyTorch | MIT | No disponible (no orientado a móvil) |

La comparativa se limita a los modelos base de los que derivan los artefactos, ya que no se dispone de información sobre otras conversiones móviles equivalentes. Los originales ofrecen mayor fidelidad numérica (fp32) pero no están optimizados para despliegue en dispositivo.

## Limitaciones y advertencias

- Uso previsto restringido a contexto de escena (lugar, ropa y color, gafas, sombrero); no debe emplearse para identificar personas ni para inferir rasgos sensibles.
- Solo se incluyen las torres de imagen; los vectores de texto deben calcularse por separado con los modelos originales en los mismos commits, lo que introduce dependencia de versiones concretas.
- Los embeddings son aproximaciones cuantizadas: la similitud coseno mínima cae a 0,997 (TinyCLIP en LiteRT) y 0,9980 (SigLIP 2 en Core ML) frente a fp32, con posible degradación en casos límite.
- El preprocesado afecta a la precisión: un redimensionado bilineal único desde 640 píxeles reduce la calidad; se recomienda reducción en pasos filtrados o filtro de área.
- El encuadre difiere entre modelos: SigLIP 2 comprime el fotograma completo a 224 x 224, mientras que TinyCLIP usa el cuadrado centrado.
- Licencia combinada: los archivos SigLIP 2 son Apache 2.0 y los de TinyCLIP MIT; es necesario respetar ambas al redistribuir. Verificar los términos de los modelos base para uso comercial.
- No hay datos publicados sobre sesgos demográficos, tasas de alucinación (no aplica a generación) ni rendimiento fuera de las pruebas internas descritas.
- El repositorio tiene un tamaño de 0,3 GB y muy baja adopción (10 descargas, 0 likes); no se dispone de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/houssemzaier/iris-scene-encoders
- Modelo base SigLIP 2: https://huggingface.co/google/siglip2-base-patch16-224
- Modelo base TinyCLIP: https://huggingface.co/wkcn/TinyCLIP-ViT-39M-16-Text-19M-YFCC15M
- Licencia Apache 2.0 (incluida en el repo): `LICENSES/Apache-2.0.txt`
- Licencia MIT de TinyCLIP (incluida en el repo): `LICENSES/MIT-TinyCLIP.txt`
- Core ML Tools: https://github.com/apple/coremltools
- LiteRT: https://github.com/google-ai-edge/LiteRT
- MediaPipe Tasks Vision: https://ai.google.dev/edge/mediapipe/solutions/vision/image_embedder
- Paper SigLIP 2: no disponible en la información proporcionada
- Repositorio o demo de la app Iris: no disponible en la información proporcionada
