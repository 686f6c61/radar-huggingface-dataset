# esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4

## Resumen

Este modelo es un checkpoint cuantizado en formato NVFP4 (W4A16) del fine-tune `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, que a su vez deriva de `Qwen/Qwen3.8-27B`. Con 27.320 millones de parámetros, emplea una arquitectura híbrida GatedDeltaNet con 64 capas, de las cuales 48 usan atención lineal y 16 atención completa, más una torre de visión y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa. La ventana de contexto nativa es de 262.144 tokens, extensible hasta 1M.

La cuantización NVFP4 mantiene las capas lineales en W4A16 con escalas FP8 E4M3 y grupo de tamaño 16, mientras que la torre de visión, la ruta de atención lineal, el `lm_head`, los embeddings y la cabeza MTP se conservan en BF16. No se utilizaron datos de calibración para la cuantización. El modelo está diseñado para GPUs NVIDIA Blackwell y se distribuye bajo licencia Apache 2.0.

La relevancia de este checkpoint radica en que combina un fine-tune orientado a instrucciones, razonamiento y generación de texto sin censura con una cuantización agresiva (4 bits) que reduce el consumo de VRAM, manteniendo las partes críticas del modelo en BF16 para preservar la calidad. Es el checkpoint fuente para una familia de archivos GGUF con 6 niveles de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM, híbrida GatedDeltaNet, 64 capas (48 atención lineal, 16 atención completa), torre de visión, cabeza MTP |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (extensible a 1M) |
| Tipos de cuantizacion | NVFP4 (W4A16, grupo 16, escalas FP8 E4M3, solo pesos); capas lineales en NVFP4, torre de visión, ruta de atención lineal, lm_head, embeddings y cabeza MTP en BF16 |
| Idiomas soportados | Inglés, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único archivo de ~26 GB), formato `compressed-tensors` `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso de 27B parámetros con arquitectura híbrida: 48 de las 64 capas utilizan atención lineal (GatedDeltaNet) y las 16 restantes usan atención completa. Incluye una torre de visión y una cabeza MTP integrada para decodificación especulativa multi-token. El fine-tune de DavidAU aplica el método "Cold Fusion" (combinación de GAIN y Unsloth), que según su documentación mantiene el 99% del rendimiento BF16 tanto en cuantización de 8 bits como de 4 bits. El sufijo "TURBO" hace referencia a la capacidad de decodificación especulativa mediante la cabeza MTP.

La cuantización a NVFP4 se realizó sin datos de calibración, siguiendo el patrón de otras builds NVFP4 de la familia Qwen3.8 Cold Fusion. El conjunto cuantizado cubre las capas MLP de las 64 capas más las proyecciones Q, K, V y O de las 16 capas de atención completa. La ruta DeltaNet (atención lineal) permanece en BF16 en este checkpoint, aunque en las versiones GGUF derivadas se normaliza a NVFP4 con un backbone compartido de 448 tensores.

## Capacidades

- Generación de texto e instrucciones: fine-tune orientado a seguir instrucciones generales, razonamiento, análisis y creatividad.
- Razonamiento multi-step: la arquitectura híbrida con atención lineal permite procesar secuencias largas con menor coste computacional que un transformer denso.
- Decodificación especulativa: la cabeza MTP integrada permite predicción multi-token, reduciendo la latencia de inferencia.
- Capacidades de visión: la torre de visión se conserva en BF16, aunque el pipeline principal es text-generation.
- Soporte multilingüe: entrenado para inglés y otros idiomas, con tokenizer intacto.
- Generación de texto sin censura: al ser una variante "uncensored", no aplica los mismos guardrails que los modelos Qwen estándar.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`, lo que facilita su despliegue en infraestructura de inferencia.

## Casos de uso

- Despliegue de asistentes conversacionales en GPUs Blackwell: la cuantización NVFP4 W4A16 reduce el consumo de VRAM respecto al BF16, permitiendo servir asistentes multilingües en hardware como RTX 5090 o B200 con menor coste de memoria.
- Generación de texto creativo sin restricciones: al ser una versión "uncensored", es adecuado para escritura creativa, narrativa y generación de contenido donde los modelos con guardrails estrictos limitan la salida.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, puede procesar documentos extensos (contratos, informes, artículos académicos) en múltiples idiomas para resúmenes, extracción de información y análisis.
- Inferencia de baja latencia en producción: la cabeza MTP permite decodificación especulativa multi-token, reduciendo la latencia en aplicaciones de respuesta en tiempo real como chatbots o asistentes de soporte.
- Investigación en eficiencia de cuantización: al ser un checkpoint NVFP4 sin calibración, es útil para estudiar el impacto de la cuantización W4A16 en modelos híbridos con atención lineal y comparar con versiones GGUF derivadas.
- Prototipado rápido de agentes conversacionales: con soporte para vLLM y formato `compressed-tensors`, permite desplegar prototipos de agentes en GPUs Blackwell sin necesidad de infraestructura de gran escala.
- Análisis de datos y razonamiento analítico: el fine-tune está orientado a razonamiento y análisis, lo que lo hace adecuado para tareas de extracción de conclusiones a partir de grandes volúmenes de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks independientes para este checkpoint NVFP4 concreto. El autor del modelo base (DavidAU) reclama en su documentación los siguientes resultados para la versión BF16 y cuantizaciones derivadas, pero no han sido verificados de forma independiente:

| Benchmark | Resultado reclamado | Nota |
|---|---|---|
| ARC-C (8-bit) | >730 (144 puntos por encima de Qwen3.8-27B) | Reclamado por el autor del modelo base |
| ARC-E (8-bit) | 880 | Reclamado por el autor del modelo base |
| ARC-C (4-bit) | >718 | Reclamado por el autor del modelo base |

El método Cold Fusion (GAIN+Unsloth) afirma mantener el 99% del rendimiento BF16 tanto en 8 bits como en 4 bits. No se dispone de datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada: el archivo safetensors ocupa ~26 GB. Con cuantización W4A16, los pesos NVFP4 requieren aproximadamente 14 GB, más las partes en BF16 (torre de visión, atención lineal, lm_head, embeddings, MTP head) y la caché KV. Se estima un mínimo de 24-32 GB de VRAM para inferencia con contexto completo.
- GPUs compatibles: NVIDIA Blackwell (B200, GB200, RTX 5090 con 32 GB). La etiqueta `blackwell` en los tags confirma que NVFP4 está diseñado para esta arquitectura. RTX 4090 (24 GB) podría ser insuficiente para contexto completo.
- Soporte AMD: según el blog de AMD, Qwen3.8-27B tiene soporte Day 0 en procesadores AMD Ryzen AI y GPUs Radeon mediante LM Studio.
- Opciones de despliegue: vLLM (soporta `compressed-tensors`), HuggingFace transformers, LM Studio. El tag `endpoints_compatible` indica compatibilidad con despliegue como endpoint.
- Latencia y throughput: no disponible. La decodificación especulativa con MTP head debería reducir la latencia respecto a decodificación autoregresiva estándar, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (NVFP4) | 27,3B | 262K | NVFP4 W4A16 | Apache 2.0 | Fine-tune sin censura, Cold Fusion, MTP |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion (BF16) | 27,3B | 262K | BF16 | Apache 2.0 | Modelo fuente, misma arquitectura y fine-tune |
| Qwen/Qwen3.8-27B | 27B | 262K | BF16/FP16 | Apache 2.0 | Modelo base, sin fine-tune, con guardrails |

La principal diferencia entre este checkpoint y el modelo fuente de DavidAU es la cuantización: NVFP4 W4A16 frente a BF16. El modelo base de Qwen incorpora guardrails de seguridad que el fine-tune "Uncensored" elimina. Frente a otros modelos de 27B de la competencia, la arquitectura híbrida con atención lineal en 48 de 64 capas reduce el coste computacional de la atención para secuencias largas.

## Limitaciones y advertencias

- Modelo "uncensored": el fine-tune elimina o reduce los guardrails de seguridad, lo que puede generar contenido inapropiado, ofensivo o potencialmente dañino. No es adecuado para aplicaciones donde se requiera moderación de contenido estricta.
- Cuantización sin calibración: al no utilizarse datos de calibración, puede haber degradación de calidad no medida en ciertas tareas o dominios específicos.
- Requisitos de hardware: NVFP4 está diseñado para GPUs NVIDIA Blackwell. En hardware anterior (Ampere, Ada Lovelace) el formato puede no ser compatible o requerir conversión.
- Rendimiento no verificado: los resultados de benchmarks (ARC-C, ARC-E) son reclamados por el autor del modelo base y no han sido replicados de forma independiente.
- Adopción nula: el checkpoint tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido probado por la comunidad.
- Nombre del modelo: los términos "Heretic" y "Uncensored" en el nombre indican explícitamente la eliminación de restricciones, lo que debe tenerse en cuenta antes de su uso en producción.
- Idioma: el soporte multilingüe está declarado pero no se especifican los idiomas concretos ni la calidad relativa frente al inglés.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Familia GGUF: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-GGUF
- Ficha en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Blog de AMD sobre soporte de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Ficha en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau
