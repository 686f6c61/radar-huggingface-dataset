# MalekKrayon/krayon-dessin

## Resumen

Krayon-dessin es una conversión a ONNX del codificador de imágenes de SigLIP 2 ViT-B/16, el modelo de visión-lenguaje desarrollado por Google Research. El repositorio, publicado por el usuario MalekKrayon, contiene únicamente la torre visual (`model.visual`) del modelo original `timm/ViT-B-16-SigLIP2`, sin la torre de texto, y está pensado para ejecución completamente local en dispositivos móviles dentro de una aplicación concreta. No se trata de un modelo generativo ni de un modelo multimodal completo: es un extractor de características visuales que produce embeddings de imagen de 768 dimensiones.

La relevancia de esta ficha es acotada: el artefacto es un derivado de ingeniería, no un modelo nuevo. Su interés técnico reside en la cuantización de los pesos MatMul a 4 bits mediante `MatMulNBits` de ONNX Runtime (block size 32, simétrica, weight-only, con activaciones en coma flotante) y en el empaquetado en un único fichero ONNX de 61,1 MB, lo que lo hace viable en hardware de gama baja. Para cualquier uso que requiera alineamiento texto-imagen, búsqueda multimodal o zero-shot classification, es necesario recurrir al modelo SigLIP 2 original, ya que aquí falta la torre de texto.

El modelo se publicó el 22 de noviembre de 2026, cuenta con 0 descargas y 1 like en el momento de la consulta, y se distribuye bajo licencia Apache 2.0, la misma que los pesos originales de Google. Es, por tanto, un derivado no respaldado por Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16) con atención completa, torre visual de SigLIP 2 |
| Parametros totales | no disponible (el fichero ONNX pesa 61.127.461 bytes tras cuantización a 4 bits) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija 224 × 224) |
| Tipos de cuantizacion | Pesos MatMul a 4 bits (ONNX Runtime `MatMulNBits`, block size 32, simétrica, weight-only); activaciones en float32 |
| Idiomas soportados | no disponible (el repositorio no incluye torre de texto ni tokenizador) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), fichero `siglip_image_poids4.onnx` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Vision Transformer de base con parches de 16 × 16 y resolución de entrada de 224 × 224, correspondiente al checkpoint `ViT-B-16-SigLIP2` de `timm`, entrenado originalmente por Google con el objetivo SigLIP (Sigmoid Loss for Language-Image Pre-training) sobre el dataset WebLI. SigLIP 2 es la segunda iteración de esta familia y sustituye la pérdida softmax contrastiva por una pérdida sigmoide por pares, lo que permite entrenar con lotes más grandes sin normalización global entre pares. El repositorio no documenta el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información corresponde a la model card oficial de SigLIP 2, no a este derivado.

Las modificaciones introducidas por el autor son puramente de despliegue: se conserva solo `model.visual`, se añade una normalización L2 sobre el embedding de salida de 768 valores, se exporta a ONNX con opset 17 y se cuantizan los pesos de las capas MatMul a 4 bits con `MatMulNBits`. No hay reentrenamiento ni ajuste fino. La innovación técnica destacable es la combinación de cuantización weight-only de 4 bits con activaciones en float, que reduce el tamaño del artefacto hasta los 61 MB sin requerir kernels de cuantización de activaciones, a costa de depender del operador contrib `MatMulNBits` de ONNX Runtime ≥ 1.17.

## Capacidades

- Extracción de características visuales: genera un embedding L2-normalizado de 768 dimensiones a partir de una imagen RGB de 224 × 224.
- Preprocesado definido: entrada float32 `[1, 3, 224, 224]`, redimensionado bicúbico, normalización `(x / 255 − 0.5) / 0.5`.
- Inferencia totalmente on-device: no requiere red ni servicios externos.
- No incluye torre de texto: no puede realizar zero-shot classification, búsqueda texto-imagen ni generación de descripciones por sí solo.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües propias (sin tokenizador ni decoder).
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Búsqueda visual en aplicaciones móviles: el embedding de 768 dimensiones puede indexarse en una base vectorial local (por ejemplo, SQLite con extensión vectorial) para recuperar imágenes similares sin conexión, aprovechando los 61 MB del artefacto.
- Deduplicación y agrupamiento de imágenes en el dispositivo: calcular embeddings de una galería fotográfica y agrupar por similitud coseno para detectar duplicados o near-duplicates antes de subir a la nube.
- Clasificación por prototipos con embeddings precalculados: si se dispone de embeddings de texto de referencia generados con la torre de texto original de SigLIP 2, este codificador puede usarse para comparar la imagen contra esos prototipos y asignar categorías, siempre que el alineamiento se haya validado fuera del dispositivo.
- Filtrado previo en pipelines de moderación de contenido: descartar imágenes visualmente similares a conjuntos de referencia conocidos antes de enviarlas a un modelo mayor en servidor, reduciendo coste y latencia de red.
- Aplicaciones de accesibilidad offline: emparejar una imagen capturada con un catálogo de referencias embebido en la app para ofrecer retroalimentación inmediata sin conexión.
- Prototipado de sistemas de recuperación multimodal: usar el codificador como bloque visual en un pipeline propio donde la parte textual se resuelva con otro modelo, útil para experimentar con cuantización 4-bit en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero ONNX ocupa 61,1 MB; en inferencia con ONNX Runtime el consumo de memoria es del orden de unos pocos cientos de MB, incluyendo activaciones y buffers, aunque no se proporcionan cifras medidas.
- GPU recomendadas: no disponible; el artefacto está orientado a ejecución en dispositivo (CPU móvil, NPU o GPU integrada) más que a GPU de servidor.
- Compatibilidad con GPU de consumo: por tamaño, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060 en adelante), aunque el autor no documenta rendimiento en estas.
- Opciones de despliegue: ONNX Runtime ≥ 1.17 es requisito obligatorio por el operador contrib `MatMulNBits`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un codificador de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Krayon-dessin (este) | no disponible (61 MB en 4 bits) | Imagen 224 × 224, salida 768 | Apache 2.0 | ONNX | Solo torre visual, cuantizado 4 bits |
| timm/ViT-B-16-SigLIP2 | no disponible | Imagen 224 × 224, salida 768 | Apache 2.0 | safetensors / PyTorch | Modelo base completo de la torre visual |
| SigLIP 2 (modelo completo de Google) | no disponible | Imagen + texto | Apache 2.0 | safetensors | Incluye torre de texto; permite alineamiento multimodal |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye la torre de texto, por lo que no es un modelo multimodal completo y no puede usarse para tareas texto-imagen sin un componente adicional.
- La cuantización a 4 bits de los pesos MatMul puede degradar la calidad de los embeddings respecto al modelo original; el autor no publica métricas de degradación.
- Dependencia estricta de ONNX Runtime ≥ 1.17 por el operador contrib `MatMulNBits`; versiones anteriores fallarán al cargar el modelo.
- No se documentan sesgos específicos del derivado; los sesgos del modelo original (WebLI) se heredan sin evaluación adicional.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos en tareas de similitud si los embeddings se usan fuera de su dominio de entrenamiento.
- El modelo es un derivado no respaldado por Google; la licencia Apache 2.0 permite uso comercial, pero conviene conservar el aviso de licencia y la atribución al modelo original.
- No hay información sobre idiomas, ya que no incluye componente textual.
- El repositorio tiene 0 descargas y 1 like, sin señales de validación por parte de la comunidad; para producción conviene verificar el SHA-256 del fichero (`b1729d2b4ee6e8e669e2c8bcdaee8c0366bff18ff79660349293b914e0532f33`) y realizar una evaluación propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MalekKrayon/krayon-dessin
- Modelo base en timm: https://huggingface.co/timm/ViT-B-16-SigLIP2
- Repositorio `timm` (PyTorch Image Models): no disponible en la información proporcionada
- Paper de SigLIP 2: no disponible en la información proporcionada
- Documentación de ONNX Runtime sobre `MatMulNBits`: no disponible en la información proporcionada
