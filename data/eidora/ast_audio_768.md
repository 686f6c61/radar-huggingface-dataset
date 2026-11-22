# EIDORA/AST_Audio_768

## Resumen

AST_Audio_768 es un modelo de extracción de características de audio publicado por EIDORA dentro de su catálogo de modelos ONNX. Deriva del checkpoint `MIT/ast-finetuned-audioset-10-10-0.4593`, un Audio Spectrogram Transformer (AST) afinado sobre AudioSet, y reutiliza únicamente el encoder preentrenado, descartando la cabeza de clasificación original. El resultado es un extractor que convierte una ventana de audio de 10 segundos en un vector de 768 dimensiones, normalizado L2 y pensado para flujos de similitud por coseno.

El modelo resuelve un problema concreto: obtener representaciones densas de audio listas para búsqueda por similitud, clustering y otras tareas de embeddings, sin necesidad de orquestar por separado el preprocesado de audio. El grafo ONNX integra la extracción de características (representación mel-filterbank compatible con AST), de modo que la entrada es directamente la forma de onda en float32 de `[1, 160000]` muestras a 16 kHz, mono, junto con un tensor `valid_samples` que indica la longitud válida cuando el audio es más corto y se rellena con ceros.

La relevancia actual del paquete es de infraestructura: empaqueta una arquitectura consolidada (AST, Interspeech 2021) en formato ONNX con un esquema de paquete propio (EIDORA ONNX package schema v3), lo que facilita su despliegue en entornos onnxruntime. No es un modelo de reconocimiento de voz ni de clasificación de audio: no genera transcripciones ni probabilidades de clase. El repositorio ocupa 0,4 GB y se distribuye con licencia BSD 3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), encoder ViT sobre espectrograma mel |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio fija de 10 segundos (16.000 Hz, mono) |
| Tipos de cuantizacion | no disponible (el paquete se distribuye en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | BSD 3-Clause |
| Formato de pesos | ONNX (librería `onnx`, runtime `onnxruntime`) |

| Propiedad de entrada/salida | Valor |
|---|---|
| Modalidad de entrada | Audio |
| Frecuencia de muestreo | 16.000 Hz |
| Canales | Mono |
| Duración del extracto | 10 segundos |
| Forma de onda | float32 `[1, 160000]` |
| Conteo de muestras válidas | int64 `[1]` |
| Salida | float32 `[1, 768]` |
| Normalización | L2 |
| Similitud | Coseno |

## Arquitectura y entrenamiento

El modelo es un Audio Spectrogram Transformer, es decir, un transformer tipo Vision Transformer aplicado sobre espectrogramas mel en lugar de imágenes. El checkpoint original (`MIT/ast-finetuned-audioset-10-10-0.4593`) fue afinado sobre AudioSet para clasificación de eventos sonoros; EIDORA conserva el encoder y elimina la cabeza de clasificación, de forma que la salida es el embedding de 768 dimensiones del encoder, normalizado L2. El preprocesado de audio (mel-filterbank compatible con AST) está embebido en el grafo ONNX, por lo que no se requiere un pipeline externo de feature extraction.

No se dispone de información sobre el número de parámetros, el volumen de tokens de entrenamiento adicional, ni sobre si EIDORA realizó entrenamiento o ajuste posterior más allá de la conversión y el reempaquetado del checkpoint base. La información disponible tampoco detalla técnicas de decodificación especulativa, atención lineal ni otras innovaciones de inferencia. La procedencia documentada es: arquitectura AST (Gong, Chung y Glass, Interspeech 2021), checkpoint fuente `MIT/ast-finetuned-audioset-10-10-0.4593`, dataset de ajuste AudioSet y licencia upstream BSD 3-Clause.

## Capacidades

- Extracción de embeddings de audio: convierte una ventana de 10 segundos a 16 kHz mono en un vector float32 de 768 dimensiones.
- Normalización L2 integrada y similitud por coseno, lista para indexación y búsqueda vectorial.
- Preprocesado integrado: la representación mel-filterbank compatible con AST se calcula dentro del grafo ONNX.
- Gestión de audios cortos mediante relleno con ceros y el tensor `valid_samples` para indicar la longitud real.
- Ejecución en onnxruntime, con despliegue portable en CPU o GPU según el proveedor de ejecución configurado.
- No soporta tool calling ni function calling: es un modelo de feature extraction, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- No realiza reconocimiento automático de voz: no emite transcripciones.
- No emite probabilidades de clasificación de audio ni etiquetas de evento, emoción o música.
- Capacidades multilingües: no aplica; el modelo no procesa texto.

## Casos de uso

- Búsqueda de audio por similitud: indexar un corpus de clips de 10 segundos con sus embeddings de 768 dimensiones y recuperar los más parecidos mediante distancia coseno en un índice vectorial (FAISS, pgvector, Qdrant).
- Deduplicación y detección de near-duplicates en archivos de audio: comparar embeddings normalizados L2 para identificar grabaciones repetidas o versiones casi idénticas dentro de un archivo sonoro.
- Clustering y organización de archivos de audio: agrupar clips por similitud de representación para etiquetado exploratorio, sin depender de metadatos manuales.
- Segmentación y análisis de material audiovisual histórico: generar embeddings por ventanas de 10 segundos para explorar patrones acústicos en colecciones, teniendo en cuenta que el autor advierte que el rendimiento en material histórico especializado no está establecido con un benchmark dedicado.
- Construcción de pipelines de recomendación de contenido sonoro: usar los embeddings como características de entrada para un modelo de ranking o de recomendación entrenado aguas abajo.
- Preprocesado para modelos supervisados: servir como extractor de características congelado en tareas de clasificación o detección de eventos, sustituyendo la cabeza original de AST por un clasificador propio.
- Detección de anomalías acústicas: comparar la distancia de un clip frente a un centroide de referencia para marcar audio atípico en monitorización de entornos.

## Benchmarks y rendimiento

El model-index declarado por el autor no contiene resultados:

| Modelo | Resultados publicados |
|---|---|
| AST_Audio_768 | ninguno (lista `results` vacía) |

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara la métrica `cosine-similarity` como criterio de uso, sin valores numéricos asociados.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el paquete completo ocupa 0,4 GB, por lo que el modelo cabe holgadamente en GPU de consumo, pero no se publica el desglose de memoria en inferencia.
- GPU recomendadas: no especificadas por el autor. Por tamaño de paquete, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) debería alojarlo; para lotes grandes conviene una GPU de datacenter (A100, H100) por throughput.
- Cabe en GPU de consumo: sí, a tenor del tamaño del repositorio (0,4 GB); no se detalla el consumo exacto en VRAM.
- Opciones de despliegue: onnxruntime (CPU o GPU con los execution providers correspondientes); el paquete sigue el esquema EIDORA ONNX package schema v3.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Ventana de entrada | Licencia | Formato |
|---|---|---|---|---|---|
| EIDORA/AST_Audio_768 | AST encoder como extractor | Embedding 768 d, L2 | 10 s, 16 kHz mono | BSD 3-Clause | ONNX |
| MIT/ast-finetuned-audioset-10-10-0.4593 | AST con cabeza de clasificación | Probabilidades de clase AudioSet | 10 s, 16 kHz mono | BSD 3-Clause | PyTorch (safetensors/bin) |
| EIDORA/AST_Audio_768 vs. checkpoint base | Mismo encoder, distinta cabeza | Embedding frente a logits | Idéntica | Idéntica | Distinto |

Frente al checkpoint original de MIT, la diferencia es funcional: el modelo de EIDORA elimina la cabeza de clasificación y expone el embedding normalizado, además de integrar el preprocesado en el grafo ONNX. No se dispone de datos de benchmarks para comparar rendimiento numérico con alternativas de extracción de embeddings de audio.

## Limitaciones y advertencias

- Las representaciones provienen de un modelo entrenado para clasificación general de eventos sonoros; no deben interpretarse directamente como etiquetas de voz, emoción o música.
- La calidad del embedding depende del contenido de entrada y de la distribución de entrenamiento original (AudioSet); el rendimiento en material audiovisual histórico especializado no está establecido mediante un benchmark dedicado.
- No es un modelo de ASR: no produce transcripciones.
- No emite probabilidades de clasificación ni etiquetas; quien necesite clasificación deberá añadir una cabeza propia.
- Ventana fija de 10 segundos: audios más largos requieren segmentación manual y audios más cortos se rellenan con ceros, lo que puede diluir la señal si el clip es muy breve.
- Entrada restringida a 16 kHz mono; hay que remuestrear y convertir a mono antes de la inferencia.
- Riesgo de sesgo heredado de AudioSet, cuya distribución de clases y fuentes no es uniforme; no se documenta un análisis de sesgos específico.
- Licencia BSD 3-Clause: permite uso comercial con atribución y conservación del aviso de copyright; conviene revisar los términos del checkpoint upstream.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no publica benchmarks; la validación en producción corre por cuenta del integrador.
- No se detallan variantes cuantizadas ni mediciones de latencia, lo que dificulta el dimensionamiento previo del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EIDORA/AST_Audio_768
- Checkpoint base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Paper AST: Audio Spectrogram Transformer: https://arxiv.org/abs/2104.01778
- Cita: Gong, Yuan; Chung, Yu-An; Glass, James (2021). *AST: Audio Spectrogram Transformer.* Interspeech 2021.
