# Fanny-Eater/EVIE-Preview-4.5B-int8

## Resumen

EVIE-Preview-4.5B-int8 es una cuantización no oficial en INT8 del modelo EVIE-Preview-4.5B de Tencent, un recuperador visual de documentos (visual document retrieval) basado en la arquitectura ColQwen3_5. A diferencia de los modelos generativos de chat, este modelo no produce texto: convierte consultas de texto y páginas de documentos en vectores de 128 dimensiones por token y ordena las páginas mediante late interaction con MaxSim. La cuantización se realizó con bitsandbytes LLM.int8() sobre los pesos oficiales en BF16, sin calibración ni reentrenamiento, reduciendo el tamaño de los pesos de 8,5 GB a 4,9 GB.

El modelo original de Tencent fue entrenado con 768 tokens visuales por página y demuestra extrapolación a 1792 tokens en tiempo de inferencia, mejorando su rendimiento en 7 de 8 dominios del benchmark ViDoRe. Esta versión cuantizada conserva los 725 tensores de pesos, incluida la cabeza de proyección `custom_text_proj`, y está pensada para entornos con recursos limitados de VRAM. Es relevante porque permite desplegar un recuperador de documentos de última generación en GPUs de consumo sin sacrificar significativamente la precisión, aunque el autor advierte que la paridad exacta con el modelo BF16 está esperada pero no verificada mediante un rerun completo del benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColQwen3_5 (Qwen3.5 híbrido: linear GatedDeltaNet + full attention, con torre de visión) |
| Parametros totales | 4.540.953.344 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con 768 tokens visuales por página; extrapolación a 1792 en test-time) |
| Tipos de cuantizacion | INT8 (bitsandbytes LLM.int8(), `load_in_8bit=True`) |
| Idiomas soportados | en, fr, de, it, es, pt, zh, ja, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con cuantización bitsandbytes) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ColQwen3_5, que combina un backbone híbrido Qwen3.5 con capas de atención completa y capas lineales GatedDeltaNet, junto con una torre de visión para procesar imágenes de páginas. Es un codificador multi-vector estilo ColBERT: para cada consulta o documento genera un conjunto de vectores de 128 dimensiones (uno por token) y el ranking se realiza mediante late interaction MaxSim, que calcula la similitud máxima entre los vectores de la consulta y los del documento.

El entrenamiento original de Tencent utilizó 768 tokens visuales por página, y el modelo muestra una extrapolación efectiva a 1792 tokens en tiempo de inferencia sin reentrenamiento, mejorando el nDCG@10 en 7 de 8 dominios del benchmark ViDoRe. La cuantización INT8 de esta versión es puramente post-entrenamiento: no hay calibración, fine-tuning ni reentrenamiento. Se aplicó LLM.int8() a todas las capas lineales, preservando los 725 tensores de pesos, incluida la proyección de texto personalizada que una carga naive con `AutoModel` descartaría.

## Capacidades

- Recuperación visual de documentos: dado un query de texto y una o varias imágenes de páginas, devuelve vectores por token y puntuaciones de similitud para ordenar las páginas.
- Multilingüe: soporta 8 idiomas (inglés, francés, alemán, italiano, español, portugués, chino y japonés).
- Late interaction multi-vector: genera embeddings densos por token, lo que permite una comparación más granular que los embeddings de frase completos.
- Extrapolación de tokens visuales: puede procesar hasta 1792 tokens visuales por página en inferencia, superando el presupuesto de entrenamiento.
- No es un modelo generativo: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Compatible con el ecosistema colpali-engine y el benchmark ViDoRe.

## Casos de uso

- Búsqueda en documentos escaneados: el modelo puede indexar páginas escaneadas de libros, informes o contratos y permitir búsquedas por texto natural, devolviendo las páginas más relevantes.
- Recuperación en archivos PDF corporativos: integrar el modelo en un pipeline de RAG para localizar secciones específicas dentro de documentos PDF extensos, usando las puntuaciones MaxSim para ordenar resultados.
- Atención al cliente con documentación técnica: dado un problema del usuario, el sistema recupera las páginas de manuales o guías que contienen la solución, reduciendo el tiempo de respuesta.
- Indexación de facturas y recibos: extraer y buscar información en facturas escaneadas, como números de factura, importes o fechas, mediante consultas en lenguaje natural.
- Comparación de versiones de documentos: usar los embeddings por token para identificar diferencias o similitudes entre versiones de un mismo documento.
- Benchmarking de sistemas de recuperación: el modelo puede servir como baseline en el benchmark ViDoRe para comparar con ColPali, ColQwen, Jina y otros modelos de recuperación visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantización indica que no se ha realizado un rerun completo del benchmark ViDoRe para esta versión INT8, pero espera una pérdida de rendimiento inferior a 0,1-0,5 puntos de nDCG basándose en el comportamiento típico de LLM.int8() en codificadores de recuperación. Se recomienda ejecutar el script oficial `reproduce.sh` del repositorio de Tencent para verificar la paridad en el hardware del usuario.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan 4,9 GB, por lo que se puede cargar en GPUs con al menos 8 GB de VRAM. El autor confirma que en una GPU de 20 GB el modelo carga con margen amplio.
- GPUs recomendadas: cualquier GPU compatible con CUDA y bitsandbytes, por ejemplo RTX 3080/3090, RTX 4090, A100, H100. También puede ejecutarse en CPU, aunque con menor rendimiento.
- Opciones de despliegue: exclusivamente mediante PyTorch y colpali-engine. No es compatible con llama.cpp, LM Studio, Ollama ni ningún runtime GGUF, ya que la arquitectura ColQwen3_5 no está soportada por esas herramientas.
- Latencia y throughput: no disponibles. Dependen del hardware y del número de tokens visuales por página.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto visual | Licencia | Formato |
|---|---|---|---|---|---|
| EVIE-Preview-4.5B-int8 (este) | ColQwen3_5 | 4,5B | 768 (extrapolable a 1792) | Apache-2.0 | safetensors INT8 |
| ColPali | ColPali (PaliGemma) | ~3B | 1024 | MIT | safetensors |
| ColQwen | ColQwen (Qwen2-VL) | ~2B | 1024 | Apache-2.0 | safetensors |
| Jina ColBERT | ColBERT | ~0,5B | no disponible | Apache-2.0 | safetensors |

Nota: los datos de ColPali, ColQwen y Jina provienen de información pública general y pueden no estar actualizados. No se dispone de comparativas de rendimiento directas con esta cuantización.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación de texto: no puede mantener conversaciones ni producir respuestas textuales.
- No es compatible con GGUF, llama.cpp, LM Studio u Ollama: solo puede ejecutarse con PyTorch y colpali-engine.
- La cuantización INT8 puede introducir una pérdida de precisión no verificada: el autor espera una degradación inferior a 0,5 puntos de nDCG, pero no se ha confirmado con un rerun completo del benchmark.
- El modelo puede heredar sesgos de los datos de entrenamiento originales de Tencent, aunque no se han documentado sesgos específicos en la información disponible.
- La extrapolación a 1792 tokens visuales es una capacidad de test-time no entrenada; su rendimiento puede variar según el dominio.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir el crédito a Tencent por el modelo original.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/Fanny-Eater/EVIE-Preview-4.5B-int8
- Modelo original de Tencent: https://huggingface.co/tencent/EVIE-Preview-4.5B
- Repositorio GitHub de Tencent: https://github.com/Tencent/EVIE-Preview-4.5B
- Script de reproducción: https://github.com/Tencent/EVIE-Preview-4.5B/blob/main/reproduce.py
- Benchmark ViDoRe: https://github.com/illuin-tech/vidore-benchmark
