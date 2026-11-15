# hUh63/Qwen3.5-4B-DeepThought-STEM-MTP-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q4_K_M del modelo Qwen3.5-4B-DeepThought-STEM, un fine-tune de 16 bits mediante LoRA sobre Qwen3.5-4B orientado a razonamiento avanzado, matemáticas, ciencia y formulación farmacéutica. El modelo base procede de una cadena de derivados: parte de Qwen/Qwen3.5-4B, pasa por Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B (una destilación matemática y STEM) y por una variante "decensored" de xtools-at, hasta llegar al fine-tune STEM final. La cuantización la firma hUh63, que no ha entrenado nada: solo recodifica con pérdida los pesos ajenos.

La particularidad técnica de este build es que conserva la cabeza MTP (multi-token-prediction) integrada en el propio archivo GGUF, fijada en precisión Q8_0, de modo que la decodificación especulativa dispone de un draft preciso sin necesidad de cargar un segundo modelo. El archivo principal ocupa 2.869.420.256 bytes (~2,87 GB) y el proyector de visión va en un shard aparte de 672.422.944 bytes.

Es relevante para quienes quieran experimentar con decodificación especulativa en un modelo multimodal pequeño y ejecutable en hardware de consumo. Conviene subrayar que el modelo upstream es una variante abliterada con el alineamiento de seguridad debilitado, y que no se han publicado resultados de benchmarks estándar sobre este GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con cabeza MTP integrada (`nextn_predict_layers = 1`), proyector de visión multimodal |
| Parámetros totales | 333.514.240 (según safetensors del repo); el autor declara un modelo "4B" en el nombre |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (imatrix), con capa MTP en Q8_0; proyector de visión en F16 |
| Idiomas soportados | en, zh, ko, ja, ru, es, fr, de, it, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del repo | 3,5 GB |
| Bloques / tensores | 33 bloques / 393 tensores |
| Distribución de tipos | F32: 184, Q4_K: 168, Q6_K: 33, Q8_0: 8 |
| Bits por peso (BPW) | 5,29 |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5 con una cabeza MTP adicional de una capa (`mtp_num_hidden_layers = 1`), que el conversor `convert_hf_to_gguf.py` pliega en el bloque 32 del GGUF, resultando en `block_count = 33`. La decodificación especulativa funciona con esquema verify-then-accept: la cabeza draft propone tokens, el tronco los verifica y descarta los rechazados, de modo que la distribución de salida no se altera. El proyector de visión se distribuye como shard independiente en F16 y solo es necesario para entrada de imagen.

El entrenamiento original corresponde al fine-tune LoRA en 16 bits de xtools-at sobre Qwen3.5-4B, partiendo de una variante "decensored" de una destilación matemática y STEM (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B). No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO. La cuantización emplea una importance matrix calculada específicamente para el dominio del modelo, y el corpus de calibración es disjunto del corpus de evaluación de perplejidad.

## Capacidades

- Generación de texto conversacional multi-turno en diez idiomas.
- Razonamiento avanzado, matemáticas y ciencia (STEM), con especial énfasis en formulación farmacéutica y drug discovery.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante el proyector de visión F16.
- Decodificación especulativa nativa con cabeza MTP integrada, con tasas de aceptación en torno al 72 % en las mediciones del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Experimentación con decodificación especulativa en local: el archivo único con cabeza MTP en Q8_0 permite usar `llama-server --spec-type draft-mtp` sin cargar un segundo modelo, lo que simplifica la evaluación de aceleración en un solo archivo.
- Razonamiento matemático asistido en entornos de investigación: el fine-tune está orientado a matemáticas y STEM, adecuado para resolver problemas paso a paso en cuadernos de investigación o prototipos docentes.
- Análisis de literatura científica y formulación farmacéutica: el modelo se entrenó específicamente en farmacia y drug discovery, por lo que puede usarse para resumir y estructurar información técnica de ese dominio en prototipos internos.
- Asistencia multimodal en local: con el proyector F16 cargado, puede procesar imágenes junto a texto para tareas de descripción o extracción de información en flujos de trabajo offline.
- Evaluación de cuantizaciones y metodología de imatrix: útil para investigadores que quieran reproducir el análisis de perplejidad y divergencia KL del autor con `llama-perplexity -c 512 --chunks 8`.
- Prototipado multilingüe: cubre diez idiomas, incluidos español, francés, alemán, italiano y vietnamita, para pruebas de conversación en esas lenguas.
- Investigación sobre alineamiento y seguridad: al ser una variante abliterada, sirve como caso de estudio controlado de comportamiento sin alineamiento, siempre dentro de los términos de la licencia y la legalidad aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GPQA, GSM8K) sobre este GGUF. El autor lo indica explícitamente y solo aporta métricas de cuantización y de aceptación especulativa.

| Métrica | Valor |
|---|---|
| Perplejidad BF16 GGUF (referencia) | 6,5214 |
| Perplejidad Q4_K_M, MTP Q8_0 (este repo) | no medida |
| Δ PPL vs BF16 | no medida |
| KLD media vs BF16 | no medida |
| Tasa de aceptación especulativa (MTP Q8_0) | 72,04 % (rango por prompt 51,28–83,92 %) |
| Longitud media de aceptación (MTP Q8_0) | 3,18 |
| Tasa de aceptación (MTP Q6_K) | 71,95 % |
| Tasa de aceptación (MTP sin override) | 71,32 % |

Las mediciones de aceptación se hicieron con 12 prompts de 300 tokens, muestreo greedy y `llama-server --spec-type draft-mtp`.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo principal pesa ~2,87 GB; el proyector de visión añade ~0,67 GB. Con overhead de contexto, un presupuesto de 4–6 GB de VRAM es razonable, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabe en GPUs de consumo modernas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6–8 GB o más, incluidas RTX 3060, 4060 y superiores.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`, `llama-perplexity`), y por extensión cualquier frontend compatible con GGUF.
- Latencia y throughput: no disponibles; la decodificación especulativa con la cabeza MTP puede aumentar el throughput efectivo, pero no se han publicado cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este GGUF (Qwen3.5-4B-DeepThought-STEM-MTP Q4_K_M) | 333.514.240 (declarado 4B) | no disponible | apache-2.0 | GGUF | Cabeza MTP integrada, visión, abliterado |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | no disponible | safetensors | Modelo original sin fine-tune STEM |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | no disponible | no disponible | no disponible | safetensors | Destilación matemática/STEM intermedia |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | no disponible | no disponible | apache-2.0 | safetensors (16 bits) | Fuente directa de esta cuantización |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El modelo upstream es una variante abliterada ("decensored"): el alineamiento de seguridad está debilitado de forma deliberada y este build hereda esa condición.
- Es un fine-tune de un fine-tune de un fine-tune; la degradación acumulada no está cuantificada.
- Q4_K_M es un formato con pérdida y no se han medido perplejidad ni KLD de este build concreto.
- Riesgo de alucinación: no evaluado; no hay benchmarks que lo caractericen.
- No hay datos publicados sobre longitud de contexto efectiva ni sobre rendimiento por idioma.
- El uso comercial está permitido por la licencia apache-2.0, pero la responsabilidad sobre el cumplimiento legal y las guías de uso previsto recae en el usuario.
- El modelo se distribuye sin garantías de calidad; el autor solo avala las mediciones de aceptación especulativa incluidas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hUh63/Qwen3.5-4B-DeepThought-STEM-MTP-Q4_K_M-GGUF
- Modelo fuente: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Variante decensored intermedia: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Destilación STEM intermedia: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo fuente: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM/blob/main/README.md
