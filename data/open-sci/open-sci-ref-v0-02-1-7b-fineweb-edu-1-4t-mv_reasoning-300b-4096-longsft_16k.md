# open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-mv_reasoning-300B-4096-longsft_16k

## Resumen

Open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-mv_reasoning-300B-4096-longsft_16k es un modelo de lenguaje denso de 1.714 millones de parámetros (1,7B) desarrollado por el colectivo open-sci como parte de la familia open-sci-ref, una serie de modelos de referencia abiertos y reproducibles para investigación. Según el artículo técnico asociado (arXiv:2509.09009), estos modelos se entrenan sobre datasets de referencia recientes y sirven como puntos de comparación para evaluar la cordura y calidad de entrenamientos alternativos. Esta versión concreta incorpora en su nombre varias señales de entrenamiento: 1,4 trillones de tokens de FineWeb-Edu, 300B tokens de razonamiento multi-vuelta (mv_reasoning), una ventana de contexto de 4096 tokens y un ajuste fino supervisado largo (longsft) con 16k tokens de contexto.

El modelo se publica en formato safetensors con precisión BF16, ocupa 3,4 GB en el repositorio y no dispone de licencia declarada ni de tarjeta de modelo en HuggingFace. Aunque el paper describe la familia open-sci-ref en general, no se han publicado resultados de benchmarks específicos para esta variante. Su relevancia radica en ser un baseline abierto y reproducible para la comunidad investigadora, especialmente para estudiar el impacto de diferentes mezclas de datos y estrategias de entrenamiento en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según paper open-sci-ref) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el nombre sugiere 4096 base y 16k en SFT largo, sin confirmar) |
| Tipos de cuantizacion | No disponible (repo solo con pesos BF16 en safetensors) |
| Idiomas soportados | No disponible (probablemente inglés, dado FineWeb-Edu, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia open-sci-ref, descrita en el paper como una serie de transformers densos de entre 0,13B y 1,7B parámetros, entrenados sobre datasets de referencia abiertos. Esta variante concreta, según su nombre, se entrenó sobre 1,4 trillones de tokens de FineWeb-Edu, un subconjunto filtrado por calidad educativa de FineWeb. Además, incorpora 300B tokens de razonamiento multi-vuelta (mv_reasoning) y un ajuste fino supervisado con contexto largo (longsft_16k). No se dispone de detalles adicionales sobre la composición exacta del dataset, el uso de RLHF/DPO o innovaciones técnicas específicas más allá de lo indicado en el nombre. El paper general menciona que los modelos se evalúan en benchmarks estandarizados, pero no se han publicado los resultados de esta versión concreta.

## Capacidades

- Generación de texto y razonamiento básico, como corresponde a un modelo denso de 1,7B parámetros.
- Posible soporte de razonamiento multi-paso, dado el componente "mv_reasoning" en el nombre, aunque no hay documentación que lo confirme.
- Capacidades multilingües no documentadas; probablemente limitadas al inglés por el dataset de entrenamiento.
- No se ha confirmado soporte de tool calling, function calling, agentes, visión o audio.
- No se ha confirmado un modo de pensamiento explícito (thinking mode) ni otras capacidades especiales.

## Casos de uso

- Investigación académica como baseline reproducible: el modelo sirve para comparar arquitecturas, mezclas de datos y estrategias de entrenamiento en modelos pequeños, tal como se describe en el paper open-sci-ref.
- Fine-tuning para tareas específicas de NLP: al ser un modelo de 1,7B, puede ajustarse con recursos modestos para clasificación, extracción de información o generación controlada en dominios concretos.
- Prototipado rápido en entornos con limitaciones de hardware: su tamaño permite ejecutarlo en GPUs de consumo, ideal para validar ideas antes de escalar a modelos mayores.
- Educación y experimentación: útil para enseñar conceptos de entrenamiento de LLMs, evaluación y alineación en cursos o talleres.
- Generación de texto en aplicaciones de baja latencia: al ser pequeño, puede servir en chatbots o asistentes simples donde la calidad no es crítica y se prioriza la velocidad.
- Análisis de sesgos y comportamientos en modelos pequeños: al ser un modelo abierto y reproducible, permite estudiar cómo los datos de entrenamiento afectan a las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper open-sci-ref menciona evaluaciones en benchmarks estandarizados para la familia completa, pero no se proporcionan números específicos para esta variante (v0.02, fineweb-edu-1.4t, mv_reasoning-300B, longsft_16k). No se deben asumir valores de otras versiones.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan 3,4 GB, por lo que se necesitan al menos 4-6 GB de VRAM para cargar el modelo con overhead de activaciones y KV cache. Con cuantización a 8 bits cabría en ~2 GB, y a 4 bits en ~1 GB, aunque no se han publicado archivos cuantizados.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM, como RTX 2060, RTX 3060, RTX 4060, o GPUs de datacenter como T4 (16 GB) o A10. En CPU, podría ejecutarse con 8-16 GB de RAM usando llama.cpp.
- Opciones de despliegue: al ser un modelo estándar de 1,7B, es compatible con vLLM, llama.cpp, Ollama, TGI y otros frameworks de inferencia, siempre que se adapte el formato de pesos (safetensors a GGUF, por ejemplo).
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, un modelo de 1,7B suele generar decenas de tokens por segundo, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b (este) | 1,7B | No disponible (sugerido 4k/16k) | No disponible | HuggingFace (safetensors) |
| Qwen2.5-1.5B | 1,5B | 32k | Apache 2.0 | HuggingFace, Ollama, etc. |
| Llama-3.2-1B | 1,2B | 128k | Llama 3.2 Community License | HuggingFace, Ollama, etc. |
| Gemma-2-2B | 2,6B | 8k | Gemma Terms of Use | HuggingFace, Ollama, etc. |

No se dispone de datos de rendimiento comparativo, ya que no hay benchmarks publicados para este modelo. La comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre FineWeb-Edu (filtrado por calidad educativa), puede presentar sesgos propios de ese corpus, aunque no hay estudios específicos publicados.
- Riesgo de alucinacion: como todo LLM pequeño, es propenso a generar información falsa o inconsistente, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: la ventana de contexto no está confirmada; si es de 4096 tokens, será insuficiente para documentos largos o conversaciones extensas.
- Limitaciones de idioma: probablemente limitado al inglés; no hay evidencia de soporte multilingüe.
- Restricciones de licencia: al no tener licencia declarada, no se puede garantizar su uso comercial ni su redistribución. Esto supone un riesgo legal para producción.
- Carencia de documentación: no hay model card, ni instrucciones de uso, ni ejemplos de código. El modelo se publica sin soporte oficial.
- Estado experimental: es una versión v0.02 de un proyecto de investigación, por lo que puede contener errores o comportamientos imprevistos.

## Enlaces

- Repositorio HuggingFace original: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-mv_reasoning-300B-4096-longsft_16k
- Mirror en HuggingFace (ali-elganzory): https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-mv_reasoning-300B-4096-longsft_16k
- Paper open-sci-ref-0.01 (arXiv): https://arxiv.org/abs/2509.09009v2
- Entrada en LLM Explorer (variante SFT Tulu3): https://llm-explorer.com/model/ali-elganzory%2Fopen-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-mv_reasoning-300B-4096-SFT-Tulu3-decontaminated,3fTAyaebpkGUu3GCqrd5xN
- Entrada en LLM Explorer (variante sin SFT): https://llm-explorer.com/model/open-sci%2Fopen-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096,2gVenwAaCuyJaGmmhRznZr
