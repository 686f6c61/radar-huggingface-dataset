# rockus/bge-m3-f16-safetensors

## Resumen

El modelo `rockus/bge-m3-f16-safetensors` es una conversión directa de los pesos del modelo de embeddings BGE-M3 de BAAI (Beijing Academy of Artificial Intelligence) a formato fp16 y safetensors. BGE-M3 es un modelo de representación de texto diseñado para recuperación de información, que combina tres funcionalidades: recuperación densa, recuperación multi-vector y recuperación dispersa. Este repositorio no introduce ningún cambio en los pesos: se trata de una conversión bit a bit de los tensores originales en fp32 a fp16, manteniendo idénticos el `config.json` y el `tokenizer.json`.

La relevancia de este repositorio radica en que permite cargar el modelo en Rust mediante `candle` (o en cualquier entorno que soporte safetensors) sin necesidad de parsear archivos pickle de PyTorch y con un uso de memoria reducido a la mitad (1,2 GB frente a los 2,3 GB del fp32). El modelo base tiene 567,7 millones de parámetros y soporta un contexto de hasta 8192 tokens, con capacidad multilingüe para más de 100 idiomas. La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-large (encoder Transformer) |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | fp16 (conversión del original fp32) |
| Idiomas soportados | más de 100 (según documentación de BGE-M3) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo base `BAAI/bge-m3` es un encoder Transformer basado en XLM-RoBERTa-large. BGE-M3 fue entrenado por BAAI con un objetivo de triple funcionalidad: recuperación densa (representación vectorial única), recuperación multi-vector (representaciones por token) y recuperación dispersa (representación de pesos de términos). El entrenamiento original utilizó un corpus multilingüe de más de 100 idiomas, con una longitud de contexto de 8192 tokens. No se ha realizado ningún ajuste fino ni reentrenamiento en este repositorio; los pesos son idénticos a los publicados por BAAI en fp32, solo convertidos a fp16.

La conversión a fp16 se realizó con `torch` y `safetensors`, verificando que cada tensor fuera bit a bit idéntico a un cast fp16 del original. Esto garantiza que no hay pérdida de calidad de embeddings más allá de la inherente a la menor precisión, que según el autor se traduce en una concordancia coseno de 0.999720 frente al fp32 (medida en un corpus multilingüe de 82 textos).

## Capacidades

- Generación de embeddings de texto para búsqueda semántica densa (vector único).
- Recuperación multi-vector (embeddings por token) para búsqueda de alta granularidad.
- Recuperación dispersa (sparse) basada en pesos de términos, útil para búsqueda léxica.
- Soporte multilingüe: más de 100 idiomas, incluyendo lenguas con bajo recurso.
- Contexto largo de 8192 tokens, adecuado para documentos extensos.
- No es un modelo generativo: no genera texto, solo representaciones vectoriales.

## Casos de uso

- **Sistema de recuperación aumentada por generación (RAG)**: se puede integrar en un pipeline de RAG para indexar documentos y recuperar pasajes relevantes. El modelo produce embeddings densos y dispersos que se pueden combinar para una búsqueda híbrida, mejorando la precisión en dominios multilingües.
- **Búsqueda semántica en bases de datos documentales**: indexar artículos, informes o wikis con el modelo y responder consultas en varios idiomas. Gracias al contexto de 8192 tokens, se pueden procesar párrafos largos sin truncar.
- **Clasificación de textos y detección de duplicados**: usar las embeddings de frases como características para entrenar clasificadores o para deduplicación de contenidos en grandes corpora.
- **Sistemas de recomendación basados en contenido**: representar ítems (noticias, productos) mediante embeddings y calcular similitud coseno para sugerir elementos relacionados.
- **Análisis de similitud entre documentos legales o académicos**: comparar la semejanza semántica de documentos completos gracias a la ventana de contexto extendida.
- **Infraestructura de búsqueda multilingüe en plataformas de soporte**: indexar preguntas frecuentes en varios idiomas y recuperar respuestas adecuadas para consultas de usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión no incluye métricas de evaluación en la model card. Para conocer el rendimiento del modelo original BGE-M3, se recomienda consultar la documentación oficial de BAAI, donde se reportan resultados en tareas como MIRACL, BEIR y MTEB.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp16 (567M parámetros × 2 bytes). Con overhead de activaciones, se recomienda al menos 2-3 GB de VRAM para secuencias de hasta 8192 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, A10, etc.). Para producción con alto throughput, se pueden usar GPUs como A100 o H100, pero no es necesario para la mayoría de casos.
- Se puede ejecutar en CPU: con 8 GB de RAM y optimizaciones de threading, la inferencia es viable para cargas moderadas.
- Opciones de despliegue: el modelo está en safetensors, compatible con `candle` (Rust), `transformers` (PyTorch), `sentence-transformers` y `llama.cpp` (con conversión a GGUF). También se puede usar con `vLLM` (aunque es más habitual para modelos generativos) o con `TGI` para embeddings.
- Latencia y throughput: no se proporcionan datos concretos. En pruebas del autor, la inferencia en fp16 es aproximadamente un 27% más rápida que en fp32 en Metal (Apple), con la mitad de memoria residente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| BGE-M3 (fp32) | 567M | 8192 | MIT | PyTorch (pickle) | Denso, multi-vector, disperso, 100+ idiomas |
| `rockus/bge-m3-f16-safetensors` | 567M | 8192 | MIT | safetensors fp16 | Misma funcionalidad que el original, formato ligero |
| `trollathon/bge-m3-safetensors` | 567M | 8192 | MIT | safetensors | Conversión alternativa (posiblemente fp32) |
| `BAAI/bge-large-en` | 335M | 512 | Apache | PyTorch | Solo denso, inglés |

La ventaja de este modelo es su formato fp16 safetensors, que facilita la carga en entornos sin dependencia de pickle y reduce el uso de memoria. Comparado con otros modelos de embeddings como `sentence-transformers/all-MiniLM-L6-v2` (80M parámetros), este es más pesado pero ofrece mejor rendimiento en multilingüe y contexto largo.

## Limitaciones y advertencias

- El modelo es una conversión de pesos, no un nuevo entrenamiento; no añade mejoras sobre el original.
- La precisión fp16 puede introducir ligeras variaciones en las embeddings (concordancia coseno de 0.999720), lo que podría ser relevante en aplicaciones que requieren exactitud numérica extrema.
- No soporta generación de texto, solo extracción de características.
- No se han evaluado los sesgos específicos de este modelo, pero al ser un encoder multilingüe, puede reflejar los sesgos de los datos de entrenamiento originales de BGE-M3.
- La licencia MIT permite uso comercial, pero se debe atribuir el crédito a BAAI y a los autores de la conversión según lo requiera la licencia.
- Para producción, se recomienda validar el rendimiento en el dominio específico, ya que no se incluyen benchmarks en este repositorio.

## Enlaces

- [Hugging Face del modelo convertido](https://huggingface.co/rockus/bge-m3-f16-safetensors)
- [Hugging Face del modelo original BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)
- [Paper de BGE-M3](https://arxiv.org/abs/2402.03216)
- [Código de FlagEmbedding](https://github.com/FlagOpen/FlagEmbedding)
- [Documentación oficial de BGE-M3](https://bge-model.com/bge/bge_m3.html)
- [Repositorio de conversión alternativa (trollathon)](https://huggingface.co/trollathon/bge-m3-safetensors)
