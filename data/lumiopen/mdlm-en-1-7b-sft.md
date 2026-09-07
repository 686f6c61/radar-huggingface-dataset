# LumiOpen/mdlm-en-1.7b-sft

## Resumen

El modelo LumiOpen/mdlm-en-1.7b-sft es un modelo de lenguaje de difusión enmascarada (MDLM) de 1.700 millones de parámetros, desarrollado por LumiOpen. Se trata de la versión ajustada mediante supervisión (SFT) del modelo base LumiOpen/mdlm-en-1.7b, preentrenado con 10.000 millones de tokens del corpus FineWeb. Su arquitectura es un transformer bidireccional con un esquema de ruido loglinear (parametrización SUBS), que genera texto mediante un proceso iterativo de denoising en lugar de la generación autoregresiva clásica. El ajuste fino se realizó sobre el dataset Dolci-Instruct-SFT (filtrado a inglés, con el dominio de chat sobremuestreado 3×) y una fase adicional de inyección casual con 507 ejemplos sintéticos para manejar entradas cortas y conversacionales. La licencia es Apache-2.0 y el formato de pesos es safetensors.

El modelo destaca por su capacidad de generación paralela: al ser bidireccional, puede producir bloques de tokens simultáneamente, alcanzando 790 tok/s en generación completa de 1024 tokens con 64 pasos de denoising. Frente a un modelo autoregresivo equivalente (AR-SFT) entrenado con los mismos datos, MDLM-SFT muestra mejoras en razonamiento (HellaSwag 0.450 vs 0.317) e instrucción following (22.2% vs 14.0% en IFEval prompt strict). Sin embargo, su longitud de contexto no está especificada y solo soporta inglés, lo que limita su uso a aplicaciones monolingües.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional, masked diffusion (MDLM), loglinear noise schedule (SUBS) |
| Parámetros totales | 1.751.752.704 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura MDLM (Masked Diffusion Language Model) descrita en el paper «MDLM: Simple and Effective Masked Diffusion Language Models» (arXiv:2406.07524). A diferencia de los modelos autoregresivos, que generan token a token de izquierda a derecha, MDLM entrena un transformer bidireccional para predecir tokens enmascarados a partir de un contexto ruidoso. En inferencia se aplica un muestreador ancestral SUBS con ruido loglinear, que requiere un número de pasos de denoising (`num_steps`, típicamente 64) y utiliza muestreo Gumbel-max con filtrado nucleus (top-p).

El preentrenamiento se realizó sobre 10.000 millones de tokens de FineWeb. El ajuste fino se dividió en dos fases: SFT sobre Dolci-Instruct-SFT (20.000 pasos, LR 2e-5) y una inyección casual (500 pasos, LR 5e-6) con 507 ejemplos sintéticos que cubren saludos, identidad, manejo de gibberish y entradas cortas, ausentes del corpus Dolci. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto conversacional e instrucciones, con soporte para diálogos multi-turno mediante el formato «User: ... Assistant: ...».
- Razonamiento y comprensión: los benchmarks muestran mejoras en ARC-Challenge (0.273), HellaSwag (0.450) y TruthfulQA (0.280) frente a un modelo autoregresivo equivalente.
- Instrucción following: en IFEval alcanza 22.2% prompt strict y 35.5% instruction strict, superando al AR-SFT.
- Generación paralela: al ser bidireccional, puede generar bloques de tokens en paralelo, alcanzando 790 tok/s en generación completa de 1024 tokens con 64 pasos.
- No soporta tool calling, visión ni audio (no se menciona en la información disponible).
- Capacidades multilingües: solo inglés.

## Casos de uso

- Asistente conversacional en inglés: el modelo puede mantener diálogos multi-turno usando el formato de prompt documentado, con respuestas de hasta 128 tokens y 64 pasos de denoising.
- Generación de respuestas largas en inglés: para preguntas abiertas, se recomienda `max_new_tokens` de 256–512 y `num_steps` de 128, lo que permite respuestas más coherentes.
- Aplicaciones de instrucción following: gracias a su rendimiento en IFEval, puede usarse en tareas que requieren seguir instrucciones estrictas, como resúmenes, reescritura o extracción de información.
- Generación de contenido creativo en inglés: la evaluación humana indica que el modelo intenta todas las prompts directamente, lo que lo hace adecuado para historias cortas, descripciones y textos publicitarios.
- Prototipos de chatbots con requisitos de latencia moderada: para respuestas cortas, el modelo ofrece 64 tok/s, lo que puede ser suficiente en entornos de baja concurrencia.
- Investigación comparativa en modelos de difusión: sirve como referencia para estudiar la generación por denoising en comparación con modelos autoregresivos del mismo tamaño.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. Se comparan los resultados con un modelo autoregresivo equivalente (AR-SFT) entrenado con los mismos datos.

| Benchmark | AR-SFT | MDLM-SFT |
|---|---|---|
| ARC-Challenge | 0.243 | 0.273 |
| HellaSwag | 0.317 | 0.450 |
| TruthfulQA | 0.260 | 0.280 |
| IFEval prompt strict | 14.0% | 22.2% |
| IFEval prompt loose | 15.7% | 25.0% |
| IFEval instruction strict | 28.3% | 35.5% |
| IFEval instruction loose | 28.7% | 38.1% |
| BERTScore F1 | 0.8444 | 0.8590 |
| Evaluación humana (éxito/parcial/fallo) | 1/10, 2/10, 7/10 | 5/10, 3/10, 2/10 |

Velocidad de generación:

| Configuración | AR | MDLM |
|---|---|---|
| Generación completa 1024 tokens (64 pasos) | 175 tok/s | 790 tok/s |
| Respuesta corta ~150 tokens | 169 tok/s | 64 tok/s |

## Requisitos de hardware

- VRAM estimada: con pesos en bfloat16 (1.75B parámetros ≈ 3.5 GB), la inferencia requiere aproximadamente 4–6 GB de VRAM, dependiendo de la longitud del prompt y el número de pasos.
- GPU recomendadas: RTX 3060 12GB, RTX 4090, A100 40GB o superiores.
- Caben en GPUs de consumo: sí, en GPUs con 8 GB o más de VRAM.
- Opciones de despliegue: se usa mediante `transformers` con `trust_remote_code=True`; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia: para respuestas cortas (~150 tokens) el modelo alcanza 64 tok/s; para generación completa de 1024 tokens con 64 pasos, 790 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MDLM-en-1.7b-SFT | 1.75B | no disponible | Apache-2.0 | HuggingFace |
| AR-SFT (autoregresivo equivalente) | 1.75B | no disponible | no disponible | No publicado |
| Dream 7B | 7B | no disponible | no disponible | GitHub |

La comparación con AR-SFT es la más relevante: ambos comparten arquitectura, tokenizer, corpus de preentrenamiento y datos de SFT, pero difieren en el mecanismo de generación. MDLM-SFT supera al AR-SFT en los benchmarks de razonamiento e instrucción following, aunque tiene mayor latencia en respuestas cortas. Dream 7B es otro modelo de difusión de mayor tamaño, pero no se dispone de datos suficientes para una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se especifica la longitud de contexto; puede ser limitada en comparación con modelos modernos.
- No soporta tool calling, visión ni audio.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o no verificado.
- Sesgos: el preentrenamiento sobre FineWeb (web scrape) puede introducir sesgos socioculturales; no se han publicado evaluaciones de sesgo.
- La generación por denoising puede ser más lenta que la autoregresiva en respuestas cortas (64 tok/s vs 169 tok/s).
- No se mencionan cuantizaciones ni formatos GGUF, lo que limita su uso en entornos con recursos reducidos.
- El modelo no está diseñado para tareas de razonamiento complejo o matemáticas avanzadas; los benchmarks muestran resultados moderados.

## Enlaces

- HuggingFace: https://huggingface.co/LumiOpen/mdlm-en-1.7b-sft
- Modelo base: https://huggingface.co/LumiOpen/mdlm-en-1.7b
- Paper MDLM: https://arxiv.org/abs/2406.07524
- Dataset Dolci-Instruct-SFT: https://huggingface.co/datasets/PleIAs/Dolci-Instruct-SFT
- Perfil de LumiOpen: https://huggingface.co/LumiOpen
- Dream 7B (diffusion LM de referencia): https://github.com/DreamLM/Dream
