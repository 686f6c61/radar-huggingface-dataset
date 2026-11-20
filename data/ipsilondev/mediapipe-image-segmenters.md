# ipsilondev/mediapipe-image-segmenters

## Resumen

`ipsilondev/mediapipe-image-segmenters` no es un modelo de IA generativa ni un modelo de lenguaje, sino un repositorio espejo que contiene copias sin modificar de tres modelos oficiales de segmentación de imagen de Google MediaPipe, empaquetados en formato TensorFlow Lite (`.tflite`). El autor, `ipsilondev`, lo publica con el objetivo de que las aplicaciones Android puedan fijar los binarios por commit mediante un submódulo de git, evitando depender de URLs de Google Cloud Storage que pueden cambiar o desaparecer.

Los tres ficheros cubren tareas de segmentación distintas: `hair_segmenter.tflite` (segmentación de pelo, 2 clases, float32), `selfie_segmenter.tflite` (persona frente a fondo, float16) y `selfie_multiclass_256x256.tflite` (6 clases con entrada 256x256, float32). Están pensados para cargarse con MediaPipe Tasks para Android (`com.google.mediapipe:tasks-vision`), no con runtimes web.

Su relevancia es práctica y de ingeniería: ofrece reproducibilidad y verificación de integridad (hashes SHA-256 documentados) para pipelines de visión por computador en dispositivos móviles. No aporta innovación algorítmica, sino empaquetado estable de artefactos de Google bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes de segmentación de imagen de MediaPipe (TensorFlow Lite); arquitectura interna no detallada en la información disponible |
| Parametros totales | No disponible (se desconoce el recuento; los ficheros pesan entre 249.537 y 16.371.837 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | float32 (hair_segmenter y selfie_multiclass_256x256) y float16 (selfie_segmenter); sin conversión ni cuantización adicional por parte del autor |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache-2.0 (Google LLC) |
| Formato de pesos | `.tflite` (TensorFlow Lite), almacenados como objetos LFS/Xet en Hugging Face |

## Arquitectura y entrenamiento

Los tres artefactos son modelos de segmentación de imagen de MediaPipe distribuidos por Google. La información disponible no detalla la arquitectura interna (tipo de backbone, número de capas o parámetros), ni los datos de entrenamiento, ni si se empleó ajuste fino, destilación o técnicas de cuantización consciente del entrenamiento. Lo único documentado es el formato de salida y el tipo numérico de cada fichero:

- `hair_segmenter.tflite`: segmentador de pelo con 2 clases (fondo y pelo), pesos float32, 781.618 bytes.
- `selfie_segmenter.tflite`: segmentador de persona frente a fondo, pesos float16, 249.537 bytes.
- `selfie_multiclass_256x256.tflite`: segmentador multiclase con 6 clases (fondo, pelo, piel del cuerpo, piel de la cara, ropa y otros), pesos float32, entrada de 256x256, 16.371.837 bytes.

El autor declara explícitamente que no ha realizado conversión, cuantización ni modificación alguna respecto a los ficheros originales de Google. Cada fichero incluye su hash SHA-256 y su URL de origen en Google Cloud Storage, lo que permite verificar la integridad tras la descarga.

## Capacidades

- Segmentación de imagen en dispositivos móviles mediante MediaPipe Tasks para Android (`com.google.mediapipe:tasks-vision`).
- Segmentación binaria de pelo (`hair_segmenter`).
- Segmentación binaria persona/fondo en selfies (`selfie_segmenter`).
- Segmentación multiclase en 6 categorías con entrada 256x256 (`selfie_multiclass_256x256`).
- Ejecución en dispositivo (on-device) sin necesidad de conexión a servicios en la nube.
- Verificación de integridad mediante SHA-256 documentado para cada fichero.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües.

## Casos de uso

- Efectos de realidad aumentada en apps Android: usar `hair_segmenter.tflite` para recolorear o aplicar filtros al pelo en tiempo real dentro de una app de cámara, cargando el modelo con `ImageSegmenter` de MediaPipe Tasks.
- Videollamadas con fondo virtual: emplear `selfie_segmenter.tflite` para separar a la persona del fondo y sustituirlo o desenfocarlo en una app de videoconferencia móvil, con pesos float16 que reducen el tamaño del binario.
- Edición fotográfica por capas: usar `selfie_multiclass_256x256.tflite` para generar máscaras separadas de pelo, piel, ropa y fondo, permitiendo retoques selectivos en apps de edición de retrato.
- Fijación reproducible de dependencias en CI/CD: integrar el repositorio como submódulo de git para que las compilaciones de Android descarguen siempre los mismos binarios verificados por SHA-256, evitando roturas por cambios en las URLs de Google.
- Pruebas de integridad en pipelines de distribución: validar con los hashes documentados que los ficheros descargados en un build no han sido alterados ni truncados (por ejemplo, por una clonación sin git-lfs que deja punteros de ~130 bytes).
- Prototipado de funciones de segmentación en apps de fitness o estética: usar la segmentación multiclase para aislar regiones del cuerpo y la piel en aplicaciones de análisis visual o pruebas de maquillaje virtual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en dispositivo móvil Android mediante MediaPipe Tasks; no requiere GPU de servidor.
- Tamaño de los binarios: 249.537 bytes (`selfie_segmenter`), 781.618 bytes (`hair_segmenter`) y 16.371.837 bytes (`selfie_multiclass_256x256`), por lo que caben holgadamente en la memoria de un teléfono actual.
- GPU recomendadas: no aplica para servidor; en Android se ejecuta sobre CPU o GPU del dispositivo según la configuración de MediaPipe.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no documentada; el destino declarado es Android, no estaciones de trabajo.
- Opciones de despliegue: MediaPipe Tasks para Android (`com.google.mediapipe:tasks-vision`). El autor indica explícitamente que los ficheros no se cargan con runtimes web.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `hair_segmenter.tflite` (este repo) | TFLite / MediaPipe | 2 (fondo, pelo) | No disponible | float32, 781.618 B | Apache-2.0 | Hugging Face (espejo) |
| `selfie_segmenter.tflite` (este repo) | TFLite / MediaPipe | 2 (persona, fondo) | No disponible | float16, 249.537 B | Apache-2.0 | Hugging Face (espejo) |
| `selfie_multiclass_256x256.tflite` (este repo) | TFLite / MediaPipe | 6 | 256x256 | float32, 16.371.837 B | Apache-2.0 | Hugging Face (espejo) |
| Alternativas de segmentación (SAM, SegFormer, etc.) | No disponible en la información | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no admite prompts de texto, tool calling ni razonamiento.
- Los ficheros son copias sin modificar de Google; cualquier sesgo o limitación de los segmentadores originales (por ejemplo, en diversidad de tonos de piel, iluminación o tipos de pelo) se hereda sin cambios.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí puede haber errores de segmentación en condiciones de baja iluminación, oclusiones o fondos complejos.
- La segmentación multiclase está limitada a una entrada de 256x256, lo que puede reducir la precisión en detalles finos.
- Clonar el repositorio sin `git-lfs` produce ficheros puntero de ~130 bytes en lugar de los binarios reales; es imprescindible usar `git lfs pull` y verificar los SHA-256.
- La licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de copyright de Google LLC y verificar los términos de los artefactos originales.
- El repositorio no incluye código de inferencia ni ejemplos de integración; el usuario debe aportar la lógica de carga con MediaPipe Tasks.
- Al ser un espejo de terceros, la disponibilidad y el mantenimiento dependen del autor del repositorio, no de Google.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ipsilondev/mediapipe-image-segmenters
- Origen `hair_segmenter.tflite`: https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite
- Origen `selfie_segmenter.tflite`: https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite
- Origen `selfie_multiclass_256x256.tflite`: https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite
- Documentación de MediaPipe Image Segmenter: no disponible en la información proporcionada.
