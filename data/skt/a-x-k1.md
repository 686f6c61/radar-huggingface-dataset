# skt/A.X-K1

## Resumen

A.X K1 es un modelo de lenguaje de gran escala basado en una arquitectura Mixture-of-Experts (MoE) desarrollado por SK Telecom (SKT). Se trata de un transformer decoder-only entrenado desde cero, sin inicializar a partir de ningún modelo preentrenado existente, con 519.000 millones de parámetros totales y 33.000 millones de parámetros activos por token. Su diseño híbrido permite alternar entre razonamiento profundo (modo Think) y respuestas concisas de baja latencia (modo Non-Think) dentro de un mismo modelo.

El modelo destaca por su enfoque en eficiencia computacional: activa solo 9 de sus 193 expertos por token (8 enrutados más 1 compartido), lo que mantiene el coste de inferencia comparable al de modelos densos mucho más pequeños. Incorpora innovaciones técnicas como Multi-Latent Attention (MLA), RMSNorm aplicado tanto antes como después del bloque MLP (MoE) y un objetivo de Multi-Token Prediction (MTP) durante el entrenamiento que habilita decodificación especulativa en inferencia.

Es relevante ahora porque compite directamente con modelos MoE de frontera como DeepSeek-V3.1 (685B-A37B) y GLM-4.6 (357B-A32B), mostrando resultados competitivos o superiores en benchmarks de matemáticas, código e instruction following, con un énfasis particular en coreano e inglés. Su tokenizador BBPE de vocabulario amplio (163.840 tokens) está optimizado para cinco idiomas y para código fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE) |
| Parametros totales | 518.983.059.456 (~519B) |
| Parametros activos | ~33B por token (8 expertos + 1 compartido de 192+1) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko (tokenizador optimizado tambien para zh, ja, es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

A.X K1 es un transformer decoder-only con arquitectura MoE de 61 capas (1 densa y 60 MoE), 64 cabezas de atención, tamaño intermedio de 7168 y tamaño intermedio de experto de 2048. Emplea Multi-Latent Attention (MLA), una técnica de atención con compresión de claves y valores que reduce el coste de memoria del KV cache en contextos largos. Cada capa MoE dispone de 192 expertos más 1 experto compartido, de los cuales se activan 8 expertos enrutados más el compartido por token. Una innovación destacable es la aplicación de RMSNorm tanto antes como después del bloque MLP (MoE), lo que mejora la estabilidad del entrenamiento en configuraciones MoE dispersas de gran escala.

El modelo se entrenó desde cero sin inicialización a partir de un modelo preentrenado. Durante el entrenamiento se empleó un objetivo de Multi-Token Prediction (MTP), en el que el modelo predice un token adicional más allá del siguiente token estándar en un solo forward pass, como señal auxiliar para estabilizar el entrenamiento. En inferencia, MTP no modifica la decodificación autorregresiva estándar pero habilita decodificación especulativa para aumentar el throughput. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso en modo Think, con pasos de razonamiento explícitos antes de la respuesta final.
- Modo Non-Think para respuestas directas y de baja latencia, seleccionable por el usuario según la tarea.
- Razonamiento matemático de alto nivel: resultados destacados en AIME25 (89,8 en inglés, 86,9 en coreano) y HRM8K (89,4).
- Generación de código: LiveCodeBench v6 (75,8), HumanEval+ (87,2) y MBPP+ (93,0), con soporte para patrones de código fuente en el tokenizador.
- Capacidades multilingües con foco en coreano e inglés; tokenizador optimizado para eficiencia en cinco idiomas (en, ko, zh, ja, es).
- Instruction following: IFBench prompt-loose (64,7) e IFEval prompt-strict (80,4 en inglés, 81,0 en coreano).
- Conocimiento general y de dominio coreano: KMMLU (80,2), CLIcK (84,9), KoBALT (48,8).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: el modo Think habilita razonamiento multi-paso, pero no se detalla soporte explícito de frameworks de agentes.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento matemático y científico asistido: el modo Think permite resolver problemas de competición (AIME, KMO) con cadenas de razonamiento explícitas, adecuado para plataformas educativas o herramientas de verificación de demostraciones.
- Generación de código en producción: con HumanEval+ de 87,2 y LiveCodeBench v6 de 75,8, puede integrarse en pipelines de CI/CD para generación de tests, revisión de código y autocompletado en entornos con contexto largo de hasta 131.072 tokens.
- Atención al cliente bilingüe coreano-inglés: su rendimiento en KMMLU, CLIcK e IFEval-ko lo hace adecuado para conversaciones multi-turno con contexto largo en mercados coreanos.
- Procesamiento de documentos extensos: la ventana de 131.072 tokens y MLA (que reduce el KV cache) permiten analizar contratos, informes o bases de código completas en una sola pasada.
- Traducción y localización asistida: el tokenizador BBPE de 163.840 tokens optimizado para cinco idiomas facilita la traducción entre coreano, inglés, chino, japonés y español con buena eficiencia de tokens.
- Asistentes de baja latencia: el modo Non-Think permite desplegar respuestas directas para chatbots o autocompletado donde la latencia es crítica, usando el mismo checkpoint que el modo razonamiento.
- Investigación en arquitecturas MoE: el modelo sirve como referencia para estudiar estabilidad de entrenamiento con post-MLP RMSNorm y decodificación especulativa vía MTP.

## Benchmarks y rendimiento

Resultados en modo Thinking, según la model card:

| Dominio | Benchmark | Idioma | A.X K1 (519B-A33B) | DeepSeek-V3.1 (685B-A37B) | GLM-4.6 (357B-A32B) |
|---|---|---:|---:|---:|---:|
| Conocimiento | KMMLU | Coreano | 80,2 | 76,5 | 79,9 |
| | KMMLU-Redux | Coreano | 77,9 | 75,9 | 78,2 |
| | KMMLU-Pro | Coreano | 68,1 | 71,4 | 71,8 |
| | CLIcK | Coreano | 84,9 | 84,5 | 84,9 |
| | KoBALT | Coreano | 48,8 | 59,7 | 59,2 |
| | MMLU-Pro | Inglés | 81,5 | 85,1 | 82,9 |
| | GPQA-Diamond | Inglés | 74,0 | 77,9 | 78,0 |
| Instruction following | IFBench (prompt-loose) | Inglés | 64,7 | 41,5 | 43,4 |
| | IFEval (prompt-strict) | Inglés | 80,4 | 84,4 | 86,1 |
| | IFEval-ko (prompt-strict) | Coreano | 81,0 | 79,2 | 85,8 |
| Matemáticas | AIME25 | Inglés | 89,8 | 88,4 | 86,0 |
| | AIME25-ko | Coreano | 86,9 | 78,1 | 75,9 |
| | HRM8K | Coreano | 89,4 | 84,3 | 83,9 |
| | KMO25 | Coreano | 93,0 | 86,4 | 96,6 |
| Código | LiveCodeBench v6 (25.2.1–25.5.1) | Inglés | 75,8 | 69,5 | 76,0 |
| | LiveCodeBench-ko | Coreano | 73,1 | 66,2 | 55,9 |
| | HumanEval+ | Inglés | 87,2 | 86,0 | 83,5 |
| | HumanEval+ ko | Coreano | 90,2 | 93,9 | 86,0 |
| | MBPP+ | Inglés | 93,0 | 99,2 | 98,9 |
| | SciCode | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 519B parámetros totales, en precisión BF16 se requieren aproximadamente 1 TB de VRAM (sin contar KV cache). Con cuantización de 8 bits, el peso ronda los 520 GB; con 4 bits, unos 260 GB. Los datos concretos de cuantización no están publicados en la información disponible.
- GPU recomendadas: para BF16 se necesitan múltiples nodos con GPUs de 80 GB (H100, A100 80GB) o superiores; el despliegue realista requiere paralelismo de expertos (expert parallelism) distribuido entre varias GPUs.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB) en precisión completa; incluso en 4 bits excede la VRAM de cualquier GPU consumer individual.
- Opciones de despliegue: transformers (librería declarada), y frameworks compatibles con MoE y decodificación especulativa como vLLM o TGI; no se confirma soporte de llama.cpp u Ollama en la información proporcionada.
- Latencia y throughput estimados: no disponibles. El modo Non-Think y el MTP con decodificación especulativa están diseñados para reducir latencia y aumentar throughput, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| A.X K1 | 519B | 33B | 131.072 | Apache 2.0 | AIME25 89,8; LiveCodeBench v6 75,8; IFBench 64,7 |
| DeepSeek-V3.1 | 685B | 37B | no disponible | no disponible | MMLU-Pro 85,1; GPQA-Diamond 77,9; MBPP+ 99,2 |
| GLM-4.6 | 357B | 32B | no disponible | no disponible | KMO25 96,6; IFEval 86,1; MBPP+ 98,9 |

A.X K1 ofrece la licencia Apache 2.0, más permisiva que la de sus competidores en la comparativa (cuyos términos no se detallan en la información proporcionada), y un contexto de 131.072 tokens. Rinde mejor en matemáticas (AIME25, HRM8K, KMO25) y en coreano (IFEval-ko, LiveCodeBench-ko), mientras que DeepSeek-V3.1 y GLM-4.6 lo superan en conocimiento general en inglés (MMLU-Pro, GPQA-Diamond) y en MBPP+.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; como modelo entrenado desde cero, puede heredar sesgos de su corpus, especialmente en dominios culturales coreanos e ingleses.
- Riesgo de alucinación: no cuantificado en la model card; el modo Think puede producir cadenas de razonamiento plausibles pero incorrectas, por lo que se recomienda verificación en dominios factuales.
- Limitaciones de idioma: el soporte oficial declarado es inglés y coreano; aunque el tokenizador está optimizado para chino, japonés y español, no se garantiza calidad equivalente en esos idiomas.
- Rendimiento inferior en conocimiento general en inglés frente a competidores (MMLU-Pro 81,5 frente a 85,1 de DeepSeek-V3.1) y en KoBALT (48,8 frente a 59,7).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución.
- Caveat de producción: el tamaño del repo (2.075,9 GB) y los 519B parámetros implican infraestructura multi-GPU costosa; el despliegue en una sola GPU no es viable. No se publican datos de cuantización ni de latencia que faciliten la planificación de capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skt/A.X-K1
- Repositorio GitHub: https://github.com/SKT-AI/A.X-K1
- Informe técnico (arXiv): https://arxiv.org/abs/2601.09200
