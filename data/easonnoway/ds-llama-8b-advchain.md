# Easonnoway/ds-llama-8b-advchain

## Resumen

DS-LLaMA-8B AdvChain es un ajuste fino supervisado (SFT) de parámetros completos del modelo `deepseek-ai/DeepSeek-R1-Distill-Llama-8B`, publicado por el usuario Easonnoway en Hugging Face. El modelo parte de la destilación de DeepSeek-R1 sobre la arquitectura Llama de 8.000 millones de parámetros y se ha reentrenado sobre un conjunto reducido de 974 ejemplos del corpus AdvChain, un dataset orientado presumiblemente a conversación adversarial o de robustez, aunque el autor no detalla su composición.

Se trata de un experimento de ajuste muy acotado: 5 épocas, 40 pasos de optimizador y una pérdida final de 0,4135 en el último paso (0,8742 de media reportada por el trainer). No se han publicado evaluaciones en benchmarks descendentes, por lo que su rendimiento real frente al modelo base es desconocido. El repositorio ocupa 16,1 GB e incluye pesos, tokenizador, plantilla de chat y registros de entrenamiento, pero no los datos de entrenamiento.

Su relevancia es limitada y de nicho: sirve como referencia para quienes investigan ajustes finos pequeños sobre modelos de razonamiento destilados, pero no como un modelo listo para producción. La licencia no está declarada, lo que impide asumir derechos de uso comercial, y el modelo no cuenta con descargas ni valoraciones en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), destilado de DeepSeek-R1 |
| Parámetros totales | 8.030.261.248 (8,03 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no confirmada en la model card) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del DeepSeek-R1-Distill-Llama-8B: un transformer decoder-only denso de 8.030 millones de parámetros con la estructura de Llama, destilado por DeepSeek a partir de su modelo de razonamiento R1. Sobre esa base, el autor aplica un ajuste fino supervisado de parámetros completos (no LoRA) durante 5 épocas, con tasa de aprendizaje 1e-5, tamaño de lote global 128 y 40 pasos de optimizador, ejecutado en 2 GPU NVIDIA A800.

El conjunto de entrenamiento son 974 ejemplos del corpus AdvChain, cuya composición, dominio y formato no se describen en la model card. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del propio SFT. La pérdida final del último paso (0,4135) y la media reportada por el trainer (0,8742) son estadísticas distintas, tal y como aclara el autor, y no permiten inferir calidad fuera de muestra. No se incluyen los datos de entrenamiento en el repositorio.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat incluida en el repositorio.
- Razonamiento de tipo cadena de pensamiento heredado del modelo base DeepSeek-R1-Distill, aunque no se verifica que el ajuste fino lo preserve.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno, según la etiqueta `conversational` del repositorio.
- Compatibilidad con text-generation-inference y endpoints compatibles, según las etiquetas del modelo.
- Soporte de tool calling y function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no evaluado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Investigación sobre ajuste fino de modelos de razonamiento destilados: sirve como punto de partida reproducible para estudiar cómo un SFT pequeño (974 ejemplos, 40 pasos) afecta a un modelo R1 destilado, comparando pérdidas y comportamiento frente al base.
- Experimentos de robustez conversacional: si AdvChain está orientado a diálogo adversarial, el modelo puede emplearse en entornos de laboratorio para probar respuestas ante entradas hostiles, siempre con validación humana.
- Generación de respuestas en prototipos de chat: con la plantilla de chat incluida, puede desplegarse en un entorno de pruebas con transformers o TGI para validar la integración antes de elegir un modelo con licencia clara.
- Reproducción de experimentos académicos: el repositorio incluye registros de entrenamiento y configuración de generación, lo que facilita replicar el ajuste sobre el modelo base en hardware de 2 × A800.
- Evaluación comparativa de pérdida vs. calidad: útil para estudiar la brecha entre la pérdida de entrenamiento (0,4135 en el último paso) y el rendimiento real, dado que no hay benchmarks publicados.
- Docencia y demostraciones de SFT: el tamaño de 8 B permite ejecutarlo en una GPU de 80 GB en precisión completa o en GPUs de consumo con cuantización, aunque el autor no publique versiones cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que esta versión no incluye evaluación en benchmarks descendentes.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4,5-5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A800/A100 de 80 GB para entrenamiento o inferencia en precisión completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en GPUs de 8-12 GB requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están confirmados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DS-LLaMA-8B AdvChain | 8,03 B | No disponible | No disponible | Hugging Face, 0 descargas | SFT de 974 ejemplos sobre R1-Distill-Llama-8B |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8,03 B | No disponible en esta ficha | Licencia del modelo base (consultar en su repositorio) | Hugging Face, modelo base público | Modelo de razonamiento destilado de referencia |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128 K tokens (según especificaciones públicas de Llama 3.1) | Licencia comunitaria Llama 3.1 | Amplia disponibilidad | Modelo generalista con licencia conocida |
| Qwen2.5 7B Instruct | 7,6 B | 128 K tokens (según especificaciones públicas de Qwen2.5) | Apache 2.0 | Amplia disponibilidad | Alternativa generalista con licencia permisiva |

La comparación es orientativa: no hay benchmarks publicados para DS-LLaMA-8B AdvChain, por lo que no puede establecerse una comparación de rendimiento con las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso para uso comercial; es un riesgo legal relevante para producción.
- Sin benchmarks: no hay evidencia de que el ajuste fino mejore al modelo base; podría degradar capacidades generales al entrenar solo 40 pasos sobre 974 ejemplos.
- Riesgo de sobreajuste: 5 épocas sobre 974 ejemplos con parámetros completos y pérdida final baja (0,4135) sugieren posible memorización del conjunto AdvChain, cuyos datos no se publican.
- Riesgo de alucinación: inherente a los modelos de razonamiento destilados; no se ha evaluado su mitigación tras el ajuste.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés.
- Contexto no confirmado: la longitud de contexto no se documenta en la model card; debe verificarse en el modelo base antes de usarlo con ventanas largas.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ publicados, lo que limita el despliegue en GPUs de consumo.
- Trazabilidad limitada: el autor no detalla la composición de AdvChain ni el formato de los ejemplos, lo que dificulta auditar el comportamiento del modelo.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay retroalimentación de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Easonnoway/ds-llama-8b-advchain
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Paper de DeepSeek-R1 (referencia del modelo base): no disponible en la información proporcionada
- Repositorio de código o demo: no disponible
- Blog del autor: no disponible
