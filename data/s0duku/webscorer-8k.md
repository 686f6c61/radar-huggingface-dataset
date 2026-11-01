# s0duku/webscorer-8k

## Resumen

WebScorer-8K es un modelo de regresión escalar que asigna una puntuación continua de calidad entre 0 y 10 a documentos web en chino e inglés. Lo desarrolla el usuario independiente s0duku y se construye mediante fine-tuning del modelo de embeddings Qwen3-Embedding-0.6B, al que se añade una cabeza de regresión lineal sobre el último token no de padding. Su propósito es servir como filtro de calidad en pipelines de selección de datos de preentrenamiento, descartando contenido de baja calidad antes de que llegue a evaluadores más caros.

El modelo se entrena por destilación de un profesor Qwen3.8-27B-FP8 con una rúbrica de calidad, sobre 175.061 documentos etiquetados (156.866 de entrenamiento, 8.792 de validación y 9.234 de test, agrupados por hostname para evitar fuga de datos). La arquitectura final es un transformer Qwen de 28 capas con 595.779.585 parámetros, LoRA fusionado en todas las capas y una ventana de contexto de 8.192 tokens Qwen.

Es relevante porque aborda un problema práctico y costoso en la curación de corpus: la clasificación binaria de calidad suele ser demasiado gruesa, mientras que un scorer continuo permite calibrar umbrales por dominio. La variante publicada prioriza explícitamente la exclusión de documentos de baja calidad (menor fuga de puntuaciones `<5` hacia `>=5`) frente a maximizar el recall de documentos excelentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 (28 capas) con LoRA fusionado y cabeza de regresión lineal (LayerNorm + Linear 1024→1 + 10·sigmoid) |
| Parametros totales | 595.779.585 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens Qwen (entrada máxima de entrenamiento) |
| Tipos de cuantizacion | No disponible (el repo publica safetensors en bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT para el fine-tune y el código; el modelo base Qwen/Qwen3-Embedding-0.6B mantiene Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, ~1.2 GB de repo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Embedding-0.6B y aplica LoRA en las 28 capas del transformer (rank 8, alpha 16, dropout 0.05) sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Para la release, los pesos LoRA se fusionan en el modelo base, de modo que la inferencia no requiere PEFT ni adaptadores. Sobre la secuencia de estados ocultos finales se toma el último token no de padding, se aplica LayerNorm y una capa lineal de 1024 a 1, y el resultado se escala con `10 * sigmoid` para acotar la salida al rango 0-10. No hay fusión multi-capa de features ni un encoder bidireccional adicional.

El entrenamiento consiste en destilación de un profesor Qwen3.8-27B-FP8 con una rúbrica de calidad, sobre 175.061 documentos etiquetados con un máximo de 8.192 tokens Qwen. Los splits están agrupados por hostname (con el ID de documento como fallback) para reducir la fuga entre conjuntos. Según el autor, el conjunto no es un gold standard adjudicado por humanos. La selección de la cabeza lineal frente a una MLP sobre el último token se justifica por una menor fuga de documentos con puntuación del profesor `<5` hacia el umbral `>=5` (8,60% en test frente a 9,55% de la MLP), a costa de menor recall en las bandas altas.

## Capacidades

- Puntuación continua de calidad web en el rango 0-10 para documentos individuales, no clasificación por clases discretas.
- Regresión escalar calibrada contra una rúbrica de profesor, útil para ordenar y filtrar documentos.
- Procesamiento de documentos largos de hasta 8.192 tokens Qwen; las entradas superiores se rechazan por defecto en el script de referencia.
- Soporte bilingüe chino-inglés, alineado con los idiomas del modelo base y del corpus de entrenamiento.
- Inferencia directa con `transformers` mediante `AutoModel` y `trust_remote_code=True`, ya que la cabeza de regresión está definida en `modeling_webscorer.py`.
- Interfaz de línea de comandos (`score_text.py`) que emite JSON por línea con índice, puntuación y vista previa del texto.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles (según tags del repo).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; es un modelo de extracción/regresión, no generativo.

## Casos de uso

- Filtrado de corpus de preentrenamiento: puntuar cada documento de un crawl y descartar los que queden por debajo de un umbral calibrado, reduciendo el coste de limpieza posterior. El modelo está entrenado específicamente para priorizar la exclusión de baja calidad.
- Pre-screen antes de un evaluador caro: usar WebScorer-8K como primera pasada sobre millones de páginas y reservar el profesor grande o la revisión humana solo para la banda ambigua (por ejemplo, puntuaciones entre 4 y 6).
- Ranking de resultados de un crawl por hostname: al estar los splits agrupados por hostname, el scorer es adecuado para comparar la calidad relativa de documentos dentro de un mismo sitio tras calibrar umbrales.
- Curación de datasets bilingües chino-inglés: seleccionar contenido técnico o enciclopédico en ambos idiomas para fine-tuning, descartando páginas de baja densidad informativa.
- Monitorización de calidad de contenido publicado: puntuar páginas de un sitio propio de forma periódica y detectar degradación (contenido autogenerado, páginas vacías, relleno SEO).
- Construcción de datasets etiquetados de calidad: usar las puntuaciones como señal débil para entrenar o validar otros clasificadores de calidad o modelos de recompensa.
- Deduplicación y priorización en pipelines de datos: combinar la puntuación con reglas de licencia y seguridad para ordenar la cola de procesamiento y asignar recursos de revisión.

## Benchmarks y rendimiento

Datos de evaluación publicados por el autor. Cohorte: 8.792 documentos de validación y 9.234 de test, separados por hostname/grupo.

| Split | MAE | Spearman | Within 1 | Recall >=7 | Recall >=8 | Fuga `<5` a `>=5` |
|---|---:|---:|---:|---:|---:|---:|
| Validación | 0,69973 | 0,82836 | 76,13% | 48,08% | 24,63% | 8,83% |
| Test | 0,70428 | 0,82822 | 75,76% | 44,67% | 21,37% | 8,60% |

Comparación interna con la variante de cabeza MLP sobre el último token: MAE de test 0,70111 y mayor recall en puntuaciones altas, pero 9,55% de fuga de documentos con puntuación del profesor `<5` hacia `>=5`. No se han publicado comparaciones con otros scorers de calidad externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,2-1,5 GB para pesos (595,8 M de parámetros) más overhead de activaciones y contexto; en la práctica cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos el cuello de botella será el preprocesado y el I/O, no el modelo.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas con 4 GB o más; también puede ejecutarse en CPU para lotes pequeños, con mayor latencia.
- Opciones de despliegue: `transformers` (requiere Transformers 4.51 o superior para Qwen3; el código custom se probó con 5.17.0), script CLI incluido, y compatibilidad declarada con text-embeddings-inference y endpoints compatibles. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de 0,6 B con contexto de hasta 8.192 tokens, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WebScorer-8K | 595,8 M | 8.192 tokens | Regresión de calidad 0-10 (zh/en) | MIT (fine-tune); Apache-2.0 (base) | HuggingFace |
| Qwen/Qwen3-Embedding-0.6B | 595,8 M (aprox.) | No disponible en esta ficha | Embeddings de texto | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-FP8 (profesor) | 27 B (aproximado) | No disponible en esta ficha | Generación/evaluación con rúbrica | No disponible en esta ficha | Uso como profesor en el entrenamiento |

No se dispone de otros scorers de calidad web comparables en la información proporcionada; la comparación relevante es con su modelo base (que produce embeddings, no puntuaciones) y con el profesor del que destila (mucho mayor y más caro de ejecutar).

## Limitaciones y advertencias

- La puntuación reproduce una rúbrica concreta de un profesor, no una medida universal de calidad documental; los umbrales deben recalibrarse por dominio.
- El modelo solo se entrenó con documentos de hasta 8.192 tokens Qwen; documentos más largos, dominios no vistos, páginas tras paywall y páginas con mucho JavaScript pueden desplazar la distribución de puntuaciones.
- El umbral fijo de 5 puede requerir recalibración para una colección nueva.
- Persiste fuga de documentos de baja puntuación: 8,60% en test, concentrada en puntuaciones del profesor de 3 y 4.
- El dataset de entrenamiento no es un gold standard adjudicado por humanos, sino etiquetas destiladas de un profesor; los sesgos del profesor se heredan.
- Cobertura lingüística limitada a chino e inglés; otros idiomas no están soportados de forma declarada.
- Requiere `trust_remote_code=True` por el código custom de la cabeza de regresión, lo que implica revisar `modeling_webscorer.py` antes de desplegar en entornos sensibles.
- Debe usarse como asistente, no como sustituto de políticas de licencia, seguridad o revisión humana.
- La licencia MIT del fine-tune no elimina las obligaciones de atribución del modelo base Apache-2.0; consultar el archivo `NOTICE`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s0duku/webscorer-8k
- Dataset de etiquetas: https://huggingface.co/datasets/s0duku/scoreweb-qwen3.8-labels
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Informe de experimentos: `experiments/REPORT.md` dentro del repositorio del modelo
- Configuración de la ejecución final: `experiments/final_run_config.json`
- Manifiesto de datos final: `experiments/final_data_manifest.json`
- Resultados completos: `experiments/results.csv`
