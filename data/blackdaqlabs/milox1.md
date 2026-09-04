# blackdaqlabs/MiloX1

## Resumen

MiloX1 es un modelo de lenguaje Transformer autoregresivo en español, desarrollado por blackdaqlabs y publicado en HuggingFace bajo licencia MIT. Se trata de un modelo entrenado completamente desde cero, sin pesos preentrenados, con una arquitectura propia que incorpora RoPE, atención causal, SwiGLU y RMSNorm. Con aproximadamente 3,56 millones de parámetros, un contexto de 320 tokens y un vocabulario de 6000 tokens (BPE byte-level), es un modelo de tamaño muy reducido orientado a la experimentación y al aprendizaje de arquitecturas Transformer, más que a tareas de producción.

El modelo se distribuye en formato safetensors e incluye su config.json y tokenizer.json. No se han publicado datos sobre el corpus de entrenamiento, el número de tokens utilizados ni procesos de alineación como RLHF o DPO, por lo que su rendimiento real no está documentado. Su relevancia actual radica en ser un ejemplo de implementación desde cero en español, útil para fines educativos y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo con RoPE, atención causal, SwiGLU y RMSNorm |
| Parametros totales | 3.559.840 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 320 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

MiloX1 es un Transformer autoregresivo con d_model de 160, 4 capas y 4 cabezas de atención. Incluye RoPE (Rotary Positional Embeddings) para codificar posiciones, atención causal, SwiGLU como función de activación en las capas feed-forward y RMSNorm para normalización. El tokenizador es un BPE byte-level con 6000 tokens, generado con la librería `tokenizers`. El entrenamiento se realizó desde cero, sin pesos preentrenados, pero no se dispone de información sobre el corpus utilizado, el número de tokens de entrenamiento ni la composición del dataset. Tampoco se mencionan técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en español.
- Capacidades de razonamiento básicas inherentes a un modelo de 3,56M de parámetros, sin documentación específica.
- No se ha documentado soporte para tool calling, function calling, agentes, visión o audio.
- Al ser un modelo pequeño, su capacidad de comprensión y generación es limitada y no está validada mediante benchmarks.

## Casos de uso

- Experimentación educativa: permite estudiar el funcionamiento interno de un Transformer desde cero, incluyendo RoPE, SwiGLU y RMSNorm, al ser una implementación sencilla y abierta. Se puede cargar en PyTorch y modificar hiperparámetros para observar el efecto en la generación.
- Prototipado de tokenizers: el tokenizer BPE byte-level con 6000 tokens puede servir como ejemplo práctico para aprender a construir y evaluar tokenizadores en español con la librería `tokenizers`.
- Investigación en modelos pequeños: sirve como base para experimentos de scaling laws o comparación de arquitecturas en el extremo inferior de parámetros, donde el coste computacional es mínimo.
- Pruebas de concepto en sistemas embebidos: al ocupar menos de 15 MB en FP32, puede ejecutarse en dispositivos con recursos muy limitados, como microcontroladores o SBC, para validar la viabilidad de un Transformer en ese entorno.
- Generación de texto corto en español: puede producir fragmentos de texto breves, como completar frases o generar nombres, aunque con limitaciones de coherencia y contexto.
- Material didáctico para cursos de NLP: permite mostrar paso a paso el pipeline de un modelo de lenguaje, desde el tokenizador hasta la generación, en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14 MB en FP32 (3.559.840 parámetros × 4 bytes). En FP16, unos 7 MB.
- GPU recomendada: no disponible. Cualquier GPU moderna o incluso CPU es suficiente para ejecutar el modelo.
- Apta para consumer GPU: sí, cabe en cualquier GPU comercial.
- Opciones de despliegue: no disponible. Al tratarse de una arquitectura personalizada, se requiere reconstruir la clase del modelo con config.json. No se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible.

## Limitaciones y advertencias

- Contexto muy limitado de 320 tokens, lo que impide tareas que requieran dependencias largas o documentos extensos.
- Vocabulario reducido de 6000 tokens, que limita la variedad léxica y puede provocar segmentaciones poco naturales.
- Sin datos documentados sobre el corpus de entrenamiento, por lo que no se puede evaluar su calidad ni sus sesgos.
- Sin benchmarks publicados, el rendimiento es desconocido.
- Modelo experimental: no apto para producción ni para tareas críticas.
- Licencia MIT permite uso comercial, pero las limitaciones técnicas hacen inviable su aplicación en entornos reales.

## Enlaces

- HuggingFace: https://huggingface.co/blackdaqlabs/MiloX1
