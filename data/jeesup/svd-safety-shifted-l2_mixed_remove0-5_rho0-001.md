# Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.001

## Resumen

`Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.001` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión por descomposición en valores singulares (SVD) con un sesgo explícito hacia la preservación de comportamiento seguro. No es un modelo conversacional listo para producción: es un artefacto experimental publicado para evaluar si una eliminación agresiva de parámetros (50% nominal del presupuesto de proyección) puede mantener la coherencia lingüística y, a la vez, alterar las respuestas del modelo ante prompts dañinos. El autor lo describe como un piloto unilateral, no como un SVD completo con información de Fisher.

El checkpoint conserva la arquitectura y el tokenizador de Llama 2 Chat de 7B, con 6.738.415.616 parámetros reales en safetensors, y se distribuye con las matrices densas ya plegadas para facilitar la evaluación. La fracción efectiva de parámetros factoriales en todo el modelo es 0,519340, es decir, se ha eliminado aproximadamente el 48% del presupuesto de representación de bajo rango. No hay fine-tuning de recuperación posterior a la compresión.

Su relevancia es metodológica: propone una métrica mixta que combina momentos de entrada de WikiText con una fracción (0,1) de momentos de prompts dañinos y respuestas seguras, y mide el desplazamiento relativo (`rho = 0,001`) respecto a la identidad. El resultado es un punto de partida para estudiar la relación entre compresión, seguridad y coherencia, no un modelo recomendado para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados tras SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2 Chat, no confirmada) |
| Tipos de cuantizacion | no disponible; el repo solo contiene safetensors en precisión original |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B Chat: un transformer decoder-only con atención causal estándar, normalización RMSNorm y activaciones SwiGLU. Sobre esa base, el autor aplica una compresión SVD por matrices con un presupuesto de rango reducido: eliminación nominal del 50% de los parámetros de proyección, con una fracción factorial realizada de 0,519340 sobre el modelo completo. Las matrices resultantes se pliegan de nuevo en forma densa para su evaluación, de modo que el checkpoint no ofrece inferencia factorizada ni demuestra ninguna aceleración.

El entrenamiento no incluye recuperación: no hay fine-tuning posterior a la compresión. La métrica de entrada es mixta, construida con momentos de WikiText más 0,1 veces los momentos de prompts dañinos y respuestas seguras, usando las mismas respuestas de referencia (incluidas respuestas del profesor Llama 2) renderizadas con sus propias plantillas de chat y perfiladas con sus propios pesos densos. El objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos, con gradientes calculados sobre 128 ejemplos dañinos y 40 benignos, y validación sobre 32 y 12 ejemplos separados. El desplazamiento relativo respecto a la identidad es `rho = 0,001`, con `lambda` global de 0,03375972210921948 y ridge de 1e-05. El propio autor advierte que se trata de un piloto unilateral, no de un SVD completo con información de Fisher.

## Capacidades

- Generación de texto conversacional heredada de Llama 2 7B Chat, sujeta a la degradación introducida por la compresión.
- Razonamiento básico y respuesta a instrucciones en formato chat de Llama 2.
- Evaluación de seguridad: el checkpoint incluye artefactos para medir generaciones en AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard.
- Medición de perplejidad sobre WikiText-2.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta capacidad multilingüe específica ni modo de pensamiento, visión o audio.
- No se documenta ninguna capacidad adicional más allá de la evaluación de seguridad y coherencia.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como punto de comparación en estudios que midan cómo varía la tasa de éxito de ataques (ASR) al reducir parámetros, junto con la perplejidad en WikiText-2 y las puntuaciones de HarmBench y WildGuard.
- Reproducción de experimentos de SVD: el directorio `experiment/` contiene ajustes exactos, pérdidas de validación y código fuente, lo que permite replicar la métrica mixta y el desplazamiento `rho` sobre otras configuraciones.
- Análisis de coherencia tras poda: evaluar la fracción de respuestas puntuadas y la coherencia textual para detectar si la eliminación del 50% del presupuesto de proyección produce degradación gramatical o semántica.
- Estudio de calibración de métricas: comparar la métrica mixta (WikiText más 0,1 de momentos de seguridad) frente a métricas puramente de lenguaje, para determinar si el sesgo hacia seguridad introduce sesgos medibles en la perplejidad.
- Auditoría de licencias y trazabilidad: servir como ejemplo de artefacto derivado de Llama 2 que debe heredar la Llama 2 Community License y sus restricciones de uso comercial.
- Docencia y formación: ilustrar en un curso de compresión de modelos el flujo completo desde un modelo base hasta un checkpoint comprimido con diagnóstico por matriz en `compression.json`.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los archivos de evaluación contienen perplejidad de WikiText-2, generaciones en AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores concretos. El autor advierte explícitamente que estas mediciones piloto no establecen una garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB es el mínimo ajustado y 24 GB es cómodo.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 4 GB, aunque el repo no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 4090 24 GB para fp16 sin fragmentación; RTX 3090 24 GB también es viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un checkpoint denso en safetensors con arquitectura Llama 2, es compatible con vLLM, TGI, llama.cpp (tras conversión a GGUF) y Ollama (tras conversión), aunque no se han publicado conversiones oficiales.
- Latencia y throughput: no disponibles; el autor señala que el checkpoint no proporciona inferencia factorizada ni establece ninguna aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (SVD safety-shifted) | 6.738.415.616 | no disponible | Compresión SVD con sesgo de seguridad, sin recuperación | llama2 | Hugging Face, 14 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens (según documentación de Llama 2) | Modelo base conversacional con RLHF | llama2 | Hugging Face, ampliamente disponible |
| Variantes de poda de Llama 2 7B (por ejemplo, Wanda o SparseGPT) | variable | 4.096 tokens | Poda no estructurada o semiestructurada | llama2 | Repos de investigación |
| Modelos comprimidos tipo TinyLlama 1.1B | 1.100.000.000 | 2.048 tokens | Entrenamiento desde cero destilado | Apache 2.0 | Hugging Face |

La comparación directa con alternativas de compresión es limitada porque este checkpoint no publica métricas numéricas ni versiones factorizadas. Su principal diferencia frente al modelo base es la reducción de parámetros efectivos y el sesgo de la métrica hacia respuestas seguras; frente a métodos de poda como Wanda o SparseGPT, la diferencia es que aquí la compresión se aplica vía SVD con un objetivo de seguridad explícito y sin recuperación posterior.

## Limitaciones y advertencias

- No es un modelo para producción: es un checkpoint de investigación con degradación esperable por la eliminación del 50% del presupuesto de proyección y sin fine-tuning de recuperación.
- El autor advierte que las mediciones piloto no establecen una garantía de seguridad; la tasa de éxito de ataques (ASR) debe interpretarse junto con la coherencia y la fracción de respuestas puntuadas.
- La métrica mixta usa solo 128 ejemplos dañinos y 40 benignos para el gradiente, y 32 y 12 para validación; el corpus de la métrica mixta es más amplio, por lo que estos ejemplos están retenidos del gradiente pero no son totalmente invisibles a la calibración.
- El checkpoint se distribuye con matrices densas plegadas: no ofrece inferencia factorizada ni demuestra aceleración alguna.
- Riesgo de alucinación y de respuestas incoherentes no cuantificado en la información disponible.
- Sesgos conocidos: no documentados específicamente; hereda los del modelo base Llama 2 7B Chat.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe más allá de la del modelo base.
- Licencia llama2: el uso comercial está sujeto a la Llama 2 Community License, incluidos los umbrales de usuarios activos mensuales y las restricciones de uso aceptable de Meta.
- El repositorio tiene 14 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
