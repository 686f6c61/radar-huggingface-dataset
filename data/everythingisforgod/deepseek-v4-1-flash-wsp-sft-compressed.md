# EverythingIsForGod/DeepSeek-V4.1-Flash-WSP-SFT-Compressed

## Resumen

DeepSeek-V4.1-Flash-WSP-SFT-Compressed es un checkpoint experimental publicado por el usuario EverythingIsForGod en Hugging Face, derivado del modelo base `deepseek-ai/DeepSeek-V4.1-Flash` (un MoE de 552B de parámetros y 475,24 GiB). El autor aplica una compresión estructural agresiva —de 40 a 8 capas y de 384 a 24 expertos enrutados por capa— combinada con destilación de expertos guiada por dominio y un fine-tuning supervisado (SFT) de 8 épocas orientado a ingeniería de software, diseño de sistemas distribuidos, ciberseguridad ofensiva/defensiva y auditoría de bug bounty. El resultado es un único fichero safetensors de 7,37 GiB que se ejecuta con un motor de inferencia portable en PyTorch puro sobre CPU y GPUs de consumo.

La relevancia del modelo es, sin embargo, principalmente metodológica y no práctica: la propia model card advierte de que se trata de un checkpoint de investigación infraentrenado. Una evaluación independiente citada por el autor (crédito a `@Sakura721`) y auditorías end-to-end posteriores confirman una perplejidad superior a 1e6 y una generación de texto incoherente sin un reentrenamiento masivo de "curación" en clústeres de GPU. El autor redirige explícitamente a otros modelos suyos verificados y coherentes para uso en producción.

Por tanto, esta ficha describe un artefacto de investigación sobre técnicas de weight-space programming y compresión de MoE, no un modelo listo para despliegue. Su interés radica en documentar un pipeline de truncado estructural, destilación de expertos por dominio y SFT sobre un modelo frontera, así como en las lecciones sobre los límites de la compresión sin reentrenamiento posterior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED) con MoE; transformer con capas encoder-decoder y enrutado de expertos |
| Parámetros totales | no disponible (el modelo base es de 552B; el checkpoint comprimido no declara su recuento exacto) |
| Parámetros activos | no disponible (el modelo base activa 4 expertos por token; el comprimido mantiene 4 activos sobre 24 retenidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el motor es PyTorch puro, no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model0-mp1.safetensors`, 7,37 GiB) |

## Arquitectura y entrenamiento

El modelo parte del backbone Causal Encoder-Decoder de DeepSeek-V4.1-Flash, con 40 capas y 384 expertos enrutados por capa. La compresión estructural reduce las capas de 40 a 8, preservando las capas ancla del encoder-decoder y las capas fuente de KV/Index en los índices `[0, 1, 2, 8, 20, 28, 36, 39]`. A continuación, se destilan los expertos MoE: se clasifican los 384 expertos enrutados de cada capa mediante el router `sqrtsoftplus` frente a embeddings de tokens de currículos de ingeniería de software, diseño de sistemas, seguridad de red, CEH, pentesting y bug bounty; se retienen los 24 expertos más especializados por capa (4 activos por token) y se pliega la afinidad de enrutado de los expertos descartados en su experto retenido más cercano. También se aplica una mejora de subespacio principal mediante SVD de bajo rango sobre `attn.wo_a.weight`.

Sobre esa estructura comprimida se ejecuta un SFT de 8 épocas con AdamW, Cosine Annealing LR y LoRA de rango 16, cubriendo estructuras concurrentes seguras en C/Rust/Python, limitadores de tasa atómicos con Redis Lua, validación BGP RPKI/ROA, TCP SYN Cookies, TLS 1.3 1-RTT PFS, detección y endurecimiento de Active Directory (Kerberoasting, Pass-the-Hash, Golden Ticket), prevención de SSRF (CWE-918) con DNS rebinding, bloqueo de condiciones de carrera TOCTOU (CWE-362), verificación JWT/OAuth, aislamiento multi-tenant BOLA/IDOR, endurecimiento XXE y límites de complejidad de consultas GraphQL. La progresión de pérdida va de 14,1267 (perplejidad 1.365.029,08) en la época 1 a 6,0728 (perplejidad 433,87) en la época 8. El autor sustituye los kernels `tilelang` exclusivos de Hopper/Blackwell por un `kernel.py` portable para CPU y GPUs de consumo.

## Capacidades

- Generación de texto conversacional y de código en el pipeline `text-generation`.
- Especialización declarada en ingeniería de software y concurrencia (C, Rust, Python).
- Diseño de sistemas distribuidos: rate limiters atómicos, arquitecturas idempotentes.
- Ciberseguridad defensiva: DAI, DHCP Snooping, BGP RPKI/ROA, SYN Cookies, TLS 1.3, detección de ataques en Active Directory.
- Pentesting ético y auditoría de bug bounty: SSRF, TOCTOU, JWT/OAuth, BOLA/IDOR, XXE, GraphQL.
- Inferencia portable en CPU y GPU de consumo mediante motor PyTorch puro.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre compresión de MoE: el checkpoint sirve como caso de estudio reproducible de truncado estructural (40→8 capas) y destilación de expertos (384→24) sobre un modelo de 552B, útil para medir el impacto de estas técnicas en perplejidad y coherencia.
- Estudio de weight-space programming: permite analizar cómo el plegado de afinidad de enrutado y la mejora por SVD de bajo rango afectan al comportamiento del router `sqrtsoftplus` en dominios especializados.
- Docencia sobre límites del fine-tuning: la progresión de perplejidad por época (de 1.365.029 a 433,87) ilustra por qué el SFT no compensa una compresión destructiva sin reentrenamiento a gran escala.
- Desarrollo de motores de inferencia portables: el `kernel.py` en PyTorch puro que sustituye a los kernels `tilelang` es reutilizable como referencia para ejecutar modelos MoE en CPU y GPUs de consumo.
- Generación de currículos y material de formación en ciberseguridad: los datos de SFT cubren CEH, pentesting y bug bounty, por lo que el checkpoint puede usarse como fuente de ejemplos de entrenamiento, no como generador fiable.
- Evaluación de riesgos en pipelines de modelos comprimidos: sirve para diseñar pruebas de coherencia y perplejidad que detecten checkpoints no aptos antes de llegar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo publicado es la progresión de pérdida y perplejidad durante el SFT:

| Época | Cross-Entropy Loss | Perplejidad |
|---|---|---|
| 1 | 14,1267 | 1.365.029,08 |
| 2 | 10,4454 | 34.386,74 |
| 3 | 8,2925 | 3.993,97 |
| 4 | 7,3276 | 1.521,73 |
| 5 | 6,7505 | 854,49 |
| 6 | 6,3308 | 561,59 |
| 7 | 6,1397 | 463,90 |
| 8 | 6,0728 | 433,87 |

La model card advierte de que, pese a esta progresión, la evaluación independiente confirma perplejidad superior a 1e6 e incoherencia en la generación sin reentrenamiento de curación.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 7,37 GiB, por lo que en FP16/BF16 se necesita aproximadamente esa cantidad más overhead de activaciones y KV cache; en CPU se puede ejecutar con el motor PyTorch puro.
- GPU recomendadas: no se especifican; el autor indica que el motor portable funciona en CPUs estándar y GPUs de consumo, en contraste con los kernels `tilelang` originales limitados a Hopper/Blackwell.
- Cabe en GPU de consumo: sí, según el tamaño del checkpoint (7,37 GiB), aunque no se documentan requisitos mínimos concretos ni modelos de GPU probados.
- Opciones de despliegue: motor propio `run_deepseek_v41.py` con `torch`, `safetensors` y `tokenizers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-WSP-SFT-Compressed | no disponible (base 552B) | no disponible | MIT | Experimental, incoherente sin reentrenamiento |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552B | no disponible | no disponible | Modelo original de referencia |
| EverythingIsForGod/DeepSeek-R1-Distill-Qwen-7B-WSP-SFT-GGUF | 7B | no disponible | no disponible | Verificado coherente y baja perplejidad, según el autor |
| EverythingIsForGod/Qwen2.5-Coder-7B-WSP-GGUF | 7B | no disponible | no disponible | GGUF Q4_K_M de 4,36 GiB, según el autor |

## Limitaciones y advertencias

- Checkpoint experimental e infraentrenado: la evaluación independiente y las auditorías posteriores confirman perplejidad superior a 1e6 y generación de texto incoherente sin un reentrenamiento de curación a gran escala en clúster de GPU.
- No apto para producción: el propio autor redirige a otros modelos verificados para uso real en código y ciberseguridad.
- La compresión estructural (40→8 capas, 384→24 expertos) degrada severamente la calidad del modelo base de 552B.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: elevado, derivado de la incoherencia documentada.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero la calidad del checkpoint lo desaconseja.
- Caveat para producción: el motor de inferencia es propio y en PyTorch puro; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita su integración en infraestructuras estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EverythingIsForGod/DeepSeek-V4.1-Flash-WSP-SFT-Compressed
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Alternativa verificada (DeepSeek-R1-Distill-Qwen-7B-WSP-SFT-GGUF): https://huggingface.co/EverythingIsForGod/DeepSeek-R1-Distill-Qwen-7B-WSP-SFT-GGUF
- Alternativa verificada (Qwen2.5-Coder-7B-WSP-GGUF): https://huggingface.co/EverythingIsForGod/Qwen2.5-Coder-7B-WSP-GGUF
