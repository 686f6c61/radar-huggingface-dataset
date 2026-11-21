# hashmap06/ai-image-detector-v5

## Resumen

AI image detector v5 es un clasificador de imágenes orientado a la detección de contenido generado por IA, publicado por el usuario hashmap06 en Hugging Face. Se distribuye como artefactos para ejecución en navegador (runtime ONNX) y combina un extractor de características basado en CLIP ViT-L/14 con una cabeza lineal calibrada. El paquete incluye el modelo ONNX por defecto (`clip_l14_b18_int8w_b32.onnx`, unos 259 MB) y un fichero JSON con los pesos de la cabeza de puntuación (`head_v5.json`), además de checksums SHA-256.

El modelo se presenta explícitamente como una "research preview" restringida a uso no comercial. No es un modelo generativo ni un LLM: es un clasificador binario (o de puntuación) que estima si una imagen tiene trazas de generación artificial. Su relevancia radica en que la detección de imágenes sintéticas es un problema abierto y en rápida evolución, y este artefacto ofrece una implementación ligera pensada para ejecutarse localmente en el navegador del usuario, sin enviar los píxeles a servidores externos.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, no se declara una licencia concreta y no se publican resultados de benchmarks. La model card incide en que las puntuaciones son señales del modelo y no prueba del origen de una imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Extractor de características CLIP ViT-L/14 (vía OpenCLIP) + cabeza lineal calibrada (ensemble lineal) |
| Parametros totales | no disponible (el backbone CLIP ViT-L/14 ronda los 428 M, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entradas de imagen, crops de 224 px) |
| Tipos de cuantizacion | INT8 para pesos (sufijo `int8w` en el fichero ONNX por defecto) |
| Idiomas soportados | en (la model card declara inglés; el modelo opera sobre imágenes) |
| Licencia | no disponible (restricción explícita de uso no comercial; sin licencia permisiva global) |
| Formato de pesos | ONNX (`clip_l14_b18_int8w_b32.onnx`) + JSON (`head_v5.json`, `checksums.json`) |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas. Primero, un extractor de características CLIP ViT-L/14 (implementado mediante OpenCLIP, licencia MIT) que produce representaciones a partir de las capas 10, 12, 14, 16 y 18 del transformer visual. Sobre tres recortes (crops) de 224 píxeles por imagen se agregan estas features. Segundo, una cabeza de puntuación lineal calibrada que consume esas representaciones y emite la señal de detección. El detector v5 combina (ensemble) los logits calibrados de las versiones v3 y v4 con pesos 0,25 y 0,75 respectivamente.

El entrenamiento utilizó una mezcla de fuentes: OpenFake (CC BY-NC 4.0), MLLM-Generated-Image-Detection-Dataset, DOCCI, TextOCR/Open Images, Unsplash Lite, Wikimedia Commons, UHD-IQA, iNaturalist, MIT-Adobe FiveK, HDR+ y fotografías privadas del autor. No se especifican el número de tokens, el volumen total de imágenes ni si hubo fases de RLHF/DPO (no aplica en un clasificador). La model card advierte que parte de las fuentes son de uso exclusivamente no comercial o de investigación, lo que condiciona la distribución de los artefactos y que no se ofrece una licencia permisiva global. Los umbrales de decisión del sitio web se evalúan por separado; los umbrales incluidos en la cabeza son históricos.

## Capacidades

- Clasificación de imágenes para estimar la probabilidad de que hayan sido generadas por IA.
- Puntuación calibrada mediante ensemble de logits (v3/v4 con pesos 0,25/0,75).
- Extracción de características visuales con CLIP ViT-L/14 en múltiples capas (10, 12, 14, 16, 18).
- Procesamiento multi-crop (tres recortes de 224 px) para robustez frente a encuadres.
- Ejecución local en navegador mediante runtime ONNX; los píxeles no salen del dispositivo del usuario.
- Verificación de integridad mediante hashes SHA-256 en `checksums.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- Capacidad multilingüe: no aplica (entrada de imagen; metadatos en inglés).

## Casos de uso

- Moderación de contenido en plataformas: integrado como señal auxiliar para marcar imágenes sospechosas de ser sintéticas antes de una revisión humana, ejecutándose en el navegador del moderador sin subir los píxeles a un servidor.
- Verificación periodística: herramienta de primera pasada para que un redactor compruebe si una imagen viral presenta trazas de generación por IA, siempre como indicio y no como prueba.
- Investigación en detección de deepfakes e imágenes sintéticas: uso como baseline reproducible (ONNX + checksums) en experimentos académicos no comerciales.
- Educación y alfabetización mediática: demo en el navegador para mostrar a estudiantes cómo funcionan los clasificadores de imágenes generadas y sus límites.
- Auditoría de datasets: cribado de grandes colecciones de imágenes para detectar posibles muestras sintéticas antes de su uso en entrenamiento, con revisión manual posterior.
- Extensiones de navegador y clientes ligeros: al ser ONNX cuantizado a INT8 y ejecutarse en local, encaja en complementos que etiquetan imágenes en tiempo real sin coste de servidor ni fuga de datos.
- Control de calidad en pipelines de generación de imágenes: detectar fugas de contenido sintético en flujos que deberían contener solo fotografías reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El fichero ONNX por defecto pesa 259.428.712 bytes (unos 259 MB) en INT8, por lo que la VRAM/RAM necesaria para cargarlo es moderada (del orden de varios cientos de MB, sin cifra oficial).
- Al ejecutarse en navegador mediante runtime ONNX (WebAssembly/WebGPU según implementación), puede funcionar en equipos de consumo sin GPU dedicada, aunque el rendimiento dependerá del dispositivo.
- GPU recomendadas: no disponible. Para inferencia en servidor, una GPU de consumo tipo RTX 3060/4090 o una A100/H100 son sobredimensionadas para este clasificador; no se publican cifras de latencia ni throughput.
- Cabe en GPU de consumo: sí, por el tamaño del artefacto (259 MB), aunque no se confirma oficialmente.
- Opciones de despliegue: runtime ONNX en navegador (caso previsto por el autor); también es posible usar ONNX Runtime en servidor, aunque no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hashmap06/ai-image-detector-v5 | Clasificador de imágenes IA (CLIP + cabeza lineal) | no disponible (backbone CLIP ViT-L/14) | crops 224 px | no disponible (no comercial) | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Las puntuaciones son señales del modelo, no prueba del origen de una imagen ni la probabilidad de que una imagen arbitraria sea IA.
- Puede fallar ante generadores no vistos durante el entrenamiento, compresión agresiva, imágenes con texto dominante o fotografía muy retocada.
- No debe usarse como única base para acusaciones o decisiones con consecuencias (laborales, legales, editoriales).
- Licencia no disponible y restricción explícita de uso no comercial: parte de los datos de entrenamiento son CC BY-NC 4.0 o de solo investigación, y no se ofrece una licencia permisiva global.
- Obligaciones de atribución y términos específicos de cada fuente siguen aplicando; la model card no certifica la limpieza legal de la redistribución de todas las fuentes.
- Idiomas: metadatos en inglés; el modelo no procesa texto de usuario.
- Riesgo de sesgo según la composición del dataset (predominio de ciertas fuentes fotográficas y generadores concretos).
- Repositorio sin tracción (0 descargas, 0 likes) y sin benchmarks publicados: madurez y validación externa desconocidas.
- Los umbrales del sitio web se evalúan por separado de los umbrales históricos de la cabeza; usar los umbrales de la cabeza sin recalibrar puede dar resultados engañosos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hashmap06/ai-image-detector-v5
- OpenAI CLIP: https://github.com/openai/CLIP
- OpenCLIP: https://github.com/mlfoundations/open_clip
- Aviso MIT de OpenAI CLIP: `openai-clip-MIT.txt` (incluido en el repositorio)
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada.
