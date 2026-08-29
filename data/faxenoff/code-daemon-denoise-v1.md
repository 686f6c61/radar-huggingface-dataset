# faxenoff/code-daemon-denoise-v1

## Resumen

`code-daemon-denoise-v1` es un filtro de palabras bilingüe (inglés y ruso) diseñado para la higiene de vocabulario en sistemas de búsqueda. Dada una forma de palabra individual, decide si es un término técnico significativo que merece conservarse en un índice o si es "lastre" (palabras funcionales, fragmentos de identificadores, ruido de transliteración) que conviene descartar. Lo desarrolla el usuario `faxenoff` y se publica bajo licencia Apache 2.0.

El modelo es deliberadamente pequeño y de un solo propósito: utiliza el encoder congelado `intfloat/multilingual-e5-small` (XLM-RoBERTa) para producir un vector de 384 dimensiones, y un único clasificador afín (una regresión logística plegada en un producto escalar) decide `P(keep)`. No hay fine-tuning del encoder ni cabezal de clasificación con pesos propios; toda la decisión aprendida son 384 números y un sesgo, distribuidos como un archivo JSON de 6 KB. Esto permite un rendimiento de ~800 palabras/segundo en un núcleo de CPU y ~17 800 palabras/segundo en una GPU de portátil.

Su relevancia actual radica en que la limpieza de vocabulario extraído de repositorios de código (identificadores, comentarios, mensajes de commit) suele hacerse por frecuencia, lo que descarta términos técnicos raros pero valiosos. Este modelo hace la criba por palabra, en ambos idiomas, a una velocidad que permite procesar un repositorio completo en segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder congelado `intfloat/multilingual-e5-small` (XLM-RoBERTa) + clasificador lineal (afín) sobre embeddings mean-pooled y L2-normalizados |
| Parametros totales | No disponible (encoder base ~118M, no confirmado; clasificador: 385 parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 40 tokens (secuencia máxima por palabra) |
| Tipos de cuantizacion | INT8 (NNCF), FP16 (TensorRT), FP32 (ONNX), INT4 (OpenVINO NPU) |
| Idiomas soportados | Inglés (en), ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, TensorRT, OpenVINO (además de un JSON de 6 KB con los coeficientes del clasificador) |

## Arquitectura y entrenamiento

El modelo combina un encoder transformer congelado con un clasificador lineal. El encoder es `multilingual-e5-small`, una variante de XLM-RoBERTa, que se exporta a ONNX con mean-pooling y normalización L2 fusionadas en el grafo. El vocabulario SentencePiece original de 250k piezas se poda por clase de carácter (latino + cirílico + puntuación), reduciéndolo a 142k piezas; esto elimina ~43% de las filas de la tabla de embeddings, que constituye la mayor parte del peso. El remapeo de ids se integra como una operación Gather en el grafo, de modo que el usuario sigue alimentando ids SentencePiece ordinarios. La cuantización INT8 reduce el peso de ~121 MB a ~76 MB, sin pérdida para los dos idiomas objetivo.

El cabezal se entrena sobre embeddings fijos: se etiqueta un conjunto bilingüe de palabras (inglés: WordNet/BNC; ruso: Taiga/OpenCorpora/Nerus) con una etiqueta binaria "término técnico" vs "lastre", se ajusta una `LogisticRegression(class_weight="balanced")` y luego se pliegan el `StandardScaler` y los coeficientes en un único par `(w, b)`. En inferencia solo se necesita un producto escalar y una sigmoide. No hay RLHF ni DPO; el entrenamiento es supervisado clásico. El umbral de decisión `strip_threshold` (por defecto 0.95) es alto a propósito: descartar un término real es el error caro, mantener algo de lastre no lo es.

## Capacidades

- Clasificación binaria de palabras individuales: decide si una forma de palabra debe conservarse o descartarse en un vocabulario de búsqueda.
- Bilingüe inglés-ruso, incluyendo identificadores y comentarios en cirílico.
- Alta velocidad de inferencia: ~800 palabras/s en CPU, ~17 800 palabras/s en GPU de portátil (ver tabla de rendimiento).
- Integración mínima: el clasificador es un producto escalar aplicable en cualquier lenguaje de programación; no requiere librerías de ML adicionales para la decisión final.
- Soporta múltiples backends de inferencia: ONNX Runtime, TensorRT, OpenVINO (CPU, iGPU, NPU).
- Cuantización INT8 sin pérdida aparente para los idiomas objetivo.
- Prefijo fijo `"vocab: "` para el embedding, necesario para reproducir la frontera de decisión.

## Casos de uso

- Limpieza de vocabulario para motores de búsqueda de código: al extraer todas las formas de palabras de un repositorio (identificadores, comentarios, mensajes de commit), el modelo filtra el lastre antes de indexar, reduciendo el tamaño del índice y mejorando las estadísticas de términos.
- Preprocesamiento de texto para sistemas de recuperación de información: en corpus técnicos mixtos EN/RU, elimina palabras funcionales y ruido de transliteración sin perder términos técnicos raros.
- Filtrado de términos en pipelines de análisis de código: integrable como paso previo a la extracción de características o al entrenamiento de modelos de lenguaje específicos de dominio.
- Depuración de vocabularios en sistemas de autocompletado o sugerencia de búsqueda: mantiene solo términos significativos, mejorando la relevancia de las sugerencias.
- Normalización de índices en entornos con recursos limitados: al ser un modelo pequeño (76 MB INT8) y rápido en CPU, puede ejecutarse en servidores sin GPU o en pipelines de CI/CD.
- Filtrado de términos en herramientas de documentación automática: descarta fragmentos de identificadores rotos o ruido de transliteración en comentarios extraídos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (precisión, recall, F1) en la información disponible. La model card solo proporciona mediciones de velocidad, que se resumen a continuación (medidas en un portátil Intel Core Ultra 9 275HX / NVIDIA RTX 5060 Laptop, batch 64 × seq 40):

| Lane | Latencia por batch | Throughput | Por palabra |
|---|---|---|---|
| TensorRT FP16, RTX 5060 Laptop | 3.60 ms | 17 790 palabras/s | 0.056 ms |
| OpenVINO INT8, iGPU (OV 2026.3) | 56.1 ms | 1 140 palabras/s | 0.88 ms |
| OpenVINO INT8, CPU (OV 2026.3) | 75-83 ms | 770-850 palabras/s | 1.18-1.30 ms |
| OpenVINO INT4, NPU (OV 2026.3) | 57.8 ms (batch 16) | 277 palabras/s | 3.61 ms |
| ONNX Runtime FP32, CPU | 188 ms | 341 palabras/s | 2.93 ms |

Ejecutando los tres dispositivos Intel a la vez se alcanza ~87% de la suma de sus tasas individuales (~2 000 palabras/s en un host sin GPU discreta). La ruta INT8 en CPU es la recomendada por defecto.

## Requisitos de hardware

- VRAM estimada: el modelo INT8 pesa ~76 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM; incluso en iGPU integradas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte TensorRT (por ejemplo, RTX 5060 Laptop, RTX 4090, A100) para el máximo throughput; también funciona en iGPU Intel y NPU.
- CPU: suficiente para el caso de uso por defecto; un núcleo moderno procesa ~800 palabras/s.
- Opciones de despliegue: ONNX Runtime, TensorRT, OpenVINO (CPU, iGPU, NPU). No se menciona soporte para vLLM, llama.cpp u Ollama, dado que no es un LLM generativo.
- Latencia: 0.056 ms por palabra en GPU, 1.18-1.30 ms en CPU (INT8).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, en el dominio de filtrado de vocabulario, las alternativas típicas son listas de stopwords estáticas o filtros por frecuencia, que no son modelos neuronales. No se puede establecer una comparativa cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- Solo procesa palabras individuales; no acepta frases u oraciones (presupuesto de secuencia de 40 tokens).
- Limitado a escrituras latina y cirílica; no funciona con otros sistemas de escritura (por ejemplo, árabe, CJK).
- El etiquetado está orientado a corpus técnicos de software; puede no generalizar bien a otros dominios (medicina, derecho, etc.).
- El umbral de decisión por defecto (0.95) es alto: puede descartar términos técnicos raros pero legítimos si su probabilidad estimada es baja.
- No se han publicado métricas de precisión/recall; el rendimiento de calidad no está verificado de forma independiente.
- El prefijo `"vocab: "` debe reproducirse exactamente en la entrada; de lo contrario, la frontera de decisión no se alinea.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base `multilingual-e5-small` tiene su propia licencia (MIT según su página, aunque conviene verificarla).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faxenoff/code-daemon-denoise-v1
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio del modelo (archivos): https://huggingface.co/faxenoff/code-daemon-denoise-v1/tree/main
