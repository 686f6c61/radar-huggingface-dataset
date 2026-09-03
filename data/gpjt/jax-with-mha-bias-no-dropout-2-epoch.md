# gpjt/jax-with-mha-bias-no-dropout-2-epoch

## Resumen

El modelo `gpjt/jax-with-mha-bias-no-dropout-2-epoch` es un modelo de lenguaje causal de tipo GPT-2, desarrollado por Giles Thomas como parte de su serie "LLM from scratch" y basado en la implementación del libro de Sebastian Raschka "Build a Large Language Model (from Scratch)". Se trata de un modelo base entrenado desde cero con JAX, aunque los pesos se han convertido a un formato compatible con PyTorch para su uso con la librería `transformers`. Con 163 millones de parámetros y una ventana de contexto de 1024 tokens, está diseñado principalmente para experimentación y aprendizaje, no para tareas de producción.

El autor lo describe explícitamente como un modelo "tonto e ignorante", entrenado con un número de tokens superior al óptimo de Chinchilla (dos épocas sobre aproximadamente 3.200 millones de tokens de FineWeb, lo que supone unos 6.500 millones de tokens en total). Su relevancia radica en que sirve como ejemplo didáctico de cómo entrenar un LLM desde cero, y como punto de partida para fine-tuning o para estudiar el efecto del sobreentrenamiento en modelos pequeños. No se han publicado benchmarks y su capacidad real es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer causal) |
| Parametros totales | 163.009.536 (el safetensors reporta 175.592.448, posible discrepancia) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en FP32/FP16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (entrenado con FineWeb, mayoritariamente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (convertido a PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 "small": 12 capas transformer, 12 cabezas de atención, dimensión de embedding de 768 y sin bias en las proyecciones QKV. No se utiliza weight tying entre embeddings y la cabeza de salida. El entrenamiento se realizó con JAX sobre un dataset de tokens preprocesado (`gpjt/fineweb-gpt2-tokens`, derivado de FineWeb) y después los pesos se convirtieron a PyTorch. Los hiperparámetros incluyen un batch global de 96, micro-batch de 6, dropout 0.0, gradiente clipping de 3.5, learning rate 0.0014 con schedule y weight decay de 0.01. Se entrenó durante dos épocas sobre aproximadamente 3.260 millones de tokens, totalizando 6.520 millones de tokens vistos, es decir, unos 40 tokens por parámetro, el doble del óptimo Chinchilla. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto causal: puede completar secuencias de texto con una ventana de contexto de 1024 tokens.
- Fine-tuning: al ser un modelo base, puede adaptarse a tareas específicas mediante entrenamiento adicional.
- Compatibilidad con `transformers`: funciona con `AutoTokenizer`, `AutoModel` y `AutoModelForCausalLM`, aunque requiere `trust_remote_code=True` por el código personalizado.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no documentadas; el dataset de entrenamiento es principalmente inglés.

## Casos de uso

- Aprendizaje y educación: ideal para estudiantes que quieran entender cómo funciona un LLM por dentro, cómo se entrena y cómo se evalúa, gracias a su tamaño reducido y a que el código de entrenamiento está disponible.
- Experimentación con fine-tuning: permite probar técnicas de adaptación (LoRA, etc.) sobre una base sencilla sin necesidad de grandes recursos de cómputo.
- Generación de texto corto: puede producir fragmentos de texto coherentes a corto plazo, útil para demos o pruebas conceptuales.
- Análisis de sobreentrenamiento: al haberse entrenado con el doble de tokens del óptimo Chinchilla, sirve para estudiar los efectos del sobreentrenamiento en modelos pequeños.
- Comparación de frameworks: al haberse entrenado en JAX y convertido a PyTorch, es útil para comparar el comportamiento de pesos entre ambos ecosistemas.
- Base para investigación académica: en entornos de investigación donde se necesite un modelo simple y reproducible para validar hipótesis sobre arquitecturas o métodos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte que el modelo no es inteligente y que no debe usarse para tareas serias.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (163M parámetros ≈ 652 MB en FP32), por lo que cabe en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3090 (usada para entrenar) es más que suficiente para inferencia.
- También puede ejecutarse en CPU sin problemas, aunque la latencia será mayor.
- Opciones de despliegue: `transformers` con pipeline de generación, también compatible con vLLM, llama.cpp u Ollama (si se convierte a GGUF).
- Latencia y throughput: no se han publicado datos, pero por su tamaño se espera una generación rápida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gpjt/jax-with-mha-bias-no-dropout-2-epoch | 163M | 1024 | Apache 2.0 | Entrenado desde cero, overtrained |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT (modificado) | Modelo original, preentrenado con más datos y RLHF |
| gpjt/jax-with-mha-bias-larger-chinchilla-1 | ~200M (estimado) | 1024 | Apache 2.0 | Variante del mismo autor con más parámetros y entrenamiento Chinchilla-óptimo |

No se dispone de comparativas de rendimiento porque no hay benchmarks publicados.

## Limitaciones y advertencias

- El modelo es pequeño y ha sido entrenado con un número limitado de tokens, por lo que tiene un conocimiento factual muy reducido y una capacidad de razonamiento baja.
- Riesgo elevado de alucinaciones y generación de texto incoherente en contextos largos.
- No se han documentado sesgos específicos, pero al entrenarse con FineWeb (datos de internet) puede heredar sesgos presentes en ese corpus.
- La ventana de contexto de 1024 tokens es corta para aplicaciones que requieran contexto extenso.
- Requiere `trust_remote_code=True` al cargarlo con `transformers`, lo que implica ejecutar código personalizado no auditado oficialmente.
- No es apto para uso en producción: el propio autor recomienda usar modelos más capaces (como Qwen) para tareas serias.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está optimizado para ello y su rendimiento sería insuficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpjt/jax-with-mha-bias-no-dropout-2-epoch
- Repositorio de entrenamiento (JAX): https://github.com/gpjt/jax-gpt2-from-scratch
- Repositorio de ejecución (PyTorch): https://github.com/gpjt/ddp-base-model-from-scratch
- Blog post sobre overtraining: https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-3-overtraining
- Dataset usado: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
