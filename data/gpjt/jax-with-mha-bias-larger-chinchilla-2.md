# gpjt/jax-with-mha-bias-larger-chinchilla-2

## Resumen

El modelo `gpjt/jax-with-mha-bias-larger-chinchilla-2` es un LLM causal de tipo GPT-2 desarrollado por Giles Thomas (gpjt) como parte de su serie de experimentos "LLM from scratch". Está basado en la implementación del libro *Build a Large Language Model (from Scratch)* de Sebastian Raschka, pero reimplementada y entrenada en JAX, con los pesos finales convertidos a un formato compatible con PyTorch para facilitar su uso. Su objetivo principal es servir como banco de pruebas para estudiar el efecto del escalado según las leyes de Chinchilla: el número de parámetros se ajustó para que, entrenado con el número óptimo de tokens (~20 veces los parámetros), tuviera un coste computacional equivalente al de un modelo sobrentrenado 2× de la misma familia.

Con aproximadamente 240 millones de parámetros (según los safetensors), se sitúa entre GPT-2 small (124M) y GPT-2 medium (355M). Tiene una ventana de contexto de 1.024 tokens y fue entrenado sobre 4.519 millones de tokens del dataset `gpjt/fineweb-gpt2-tokens`. Se trata de un modelo base, sin fine-tuning instructivo, por lo que su rendimiento en tareas complejas es limitado. Su relevancia actual radica en ser un ejemplo accesible y reproducible de entrenamiento desde cero con JAX, además de servir como base para experimentos de fine-tuning y análisis de escalado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal estilo GPT-2, 15 capas, 14 cabezas de atencion, 896 dimensiones de embedding |
| Parametros totales | 240.658.432 (segun safetensors); 225.978.368 segun la model card |
| Parametros activos | Todos (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (dataset FineWeb, probablemente ingles, pero no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (convertido a PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder causal clásica estilo GPT-2, con 15 capas, 14 cabezas de atención, dimensiones de embedding de 896 y sin weight tying. A pesar del nombre "mha-bias", el detalle indica que el bias en QKV es `False`; el bias podría aplicarse en otras proyecciones, aunque no se especifica más. La implementación original fue escrita en JAX como una reimplementación de caja negra del código PyTorch de Raschka, y posteriormente los pesos se convirtieron a safetensors compatibles con PyTorch para su uso con `transformers`.

El entrenamiento se realizó sobre el dataset `gpjt/fineweb-gpt2-tokens`, una versión tokenizada de FineWeb, con un total de 4.519.567.360 tokens, lo que equivale a aproximadamente 20 veces el número de parámetros (ley Chinchilla óptima). Se utilizó un micro-batch de 4, un batch global de 96, dropout 0.0, gradient clipping de 3.5, learning rate de 0.0014 con schedule, y weight decay de 0.01. La máquina de entrenamiento fue una RTX 3090 local. No se menciona el uso de RLHF, DPO ni técnicas de alineación; es un modelo base puro.

## Capacidades

- Generación de texto causal: puede continuar secuencias de texto de forma autoregresiva, aunque con limitaciones propias de su tamaño y entrenamiento.
- Completado de texto corto: con una ventana de 1.024 tokens, es adecuado para completar frases o párrafos breves.
- Modelo base: no ha sido fine-tuning para instrucciones, por lo que no sigue comandos ni responde a preguntas de forma directa.
- Sin soporte de tool calling ni function calling: no se ha entrenado para ello.
- Sin capacidades de agentes ni multi-step reasoning: su tamaño y contexto no lo permiten.
- Multilingüe: no confirmado; el dataset FineWeb es mayoritariamente inglés, por lo que se espera un comportamiento principalmente en inglés.
- Sin modo de razonamiento especial ni capacidades multimodales (visión, audio, etc.).

## Casos de uso

- Experimentación educativa: sirve para estudiar el comportamiento de un LLM pequeño entrenado desde cero, ideal para cursos o tutoriales sobre arquitecturas transformer y escalado Chinchilla. Se puede cargar con `transformers` y `trust_remote_code=True`.
- Fine-tuning para tareas específicas: al ser un modelo base, se puede ajustar con datasets propios para tareas como clasificación de texto, generación de resúmenes o análisis de sentimiento en dominios acotados. El repositorio incluye un notebook de ejemplo.
- Investigación sobre leyes de escalado: permite comparar el rendimiento de un modelo entrenado con tokens óptimos frente a otros modelos sobrentrenados de la misma familia, como `gpjt/jax-with-mha-bias-no-dropout-extended`.
- Generación de texto creativo corto: con una temperatura alta (1.4) y top-k, puede producir textos de ficción o poesía de baja complejidad, útil para prototipos o demos.
- Prueba de pipelines de inferencia personalizados: al ser ligero, se puede desplegar en entornos con recursos limitados para probar integraciones con frameworks como `transformers` y `vLLM`.
- Benchmark de hardware: su pequeño tamaño permite medir latencia y throughput en GPUs consumer o incluso CPU, sirviendo como referencia para comparar eficiencia de diferentes stacks de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no sabe muchos datos y no es muy inteligente", y que es adecuado para experimentación, no para uso productivo serio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 240M parámetros, en fp32 (~1 GB) o fp16 (~0,5 GB), cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 2060 en adelante) es suficiente. El autor entrenó en una RTX 3090, pero para inferencia se puede usar incluso en CPU.
- Capacidad en GPU consumer: sí, ampliamente. Modelos como RTX 3060, RTX 4060, etc., lo ejecutan sin problemas.
- Opciones de despliegue: se puede usar con `transformers` (cargando con `trust_remote_code=True`), y al ser un modelo estándar de tipo GPT-2, también es compatible con `llama.cpp` si se convierte a GGUF, con `Ollama` (mediante importación manual) o con `vLLM` si se adapta a su formato.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado su tamaño, se espera una latencia de decodificación de unos pocos milisegundos por token en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gpjt/jax-with-mha-bias-larger-chinchilla-2 | ~240M | 1.024 | Apache 2.0 | Entrenado con tokens Chinchilla-óptimos, base GPT-2 |
| GPT-2 small (openai-community/gpt2) | 124M | 1.024 | MIT | Modelo original de OpenAI, base GPT-2 |
| GPT-2 medium (openai-community/gpt2-medium) | 355M | 1.024 | MIT | Versión más grande de GPT-2 original |
| gpjt/jax-with-mha-bias-no-dropout-extended | ~163M (según autor) | 1.024 | Apache 2.0 | Modelo sobrentrenado de la misma familia, para comparar con el presente |

No hay datos de benchmarks públicos que permitan una comparación cuantitativa fiable. La comparativa se basa en características arquitectónicas y de entrenamiento.

## Limitaciones y advertencias

- Modelo base sin fine-tuning instructivo: no responde a instrucciones ni mantiene diálogos coherentes por sí solo.
- Conocimiento factual muy limitado: al ser entrenado con un número de tokens relativamente pequeño (4.5B) y tener pocos parámetros, alucina con frecuencia y desconoce la mayoría de hechos del mundo.
- Contexto corto de 1.024 tokens: no es adecuado para tareas que requieran razonamiento sobre documentos largos o historial extenso.
- Idioma no confirmado: aunque el dataset FineWeb es mayoritariamente inglés, no se ha verificado el rendimiento en otros idiomas; es probable que tenga un rendimiento deficiente fuera del inglés.
- Dependencia de código personalizado: para cargarlo con `transformers` es necesario usar `trust_remote_code=True`, lo que implica ejecutar código del autor no auditado por Hugging Face.
- Sin soporte de tool calling ni agentes: no se puede integrar directamente en pipelines de agentes sin un fine-tuning adicional.
- No apto para producción: el propio autor recomienda usar modelos más serios (como Qwen) para trabajo real.
- Discrepancia en el número de parámetros: la model card indica 225.978.368, mientras que los safetensors muestran 240.658.432; esto puede deberse a pesos de embedding o de capas adicionales, pero conviene tenerlo en cuenta al medir memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpjt/jax-with-mha-bias-larger-chinchilla-2
- Repositorio de entrenamiento (JAX): https://github.com/gpjt/jax-gpt2-from-scratch
- Repositorio de ejecución (PyTorch): https://github.com/gpjt/ddp-base-model-from-scratch
- Blog post del autor (Chinchilla check): https://staging.gilesthomas.com/2026/08/chinchilla-check
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
