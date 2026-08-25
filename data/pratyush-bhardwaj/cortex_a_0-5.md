# PRATYUSH-BHARDWAJ/Cortex_A_0.5

## Resumen

Cortex-A 0.5 es un modelo de lenguaje autoregresivo latente (latent-AR) de aproximadamente 793 millones de parámetros, desarrollado por Pratyush Bhardwaj y publicado bajo licencia MIT. El modelo se entrena desde cero utilizando JAX/Flax y combina un planificador profundo (deep planner) que opera sobre fragmentos de 5 tokens con un escritor autorregresivo superficial (shallow AR writer). El backbone latente condiciona cada token generado, lo que permite una planificación a más largo plazo que los modelos autorregresivos convencionales.

La relevancia de este modelo radica en su arquitectura experimental: en lugar de predecir token a token de forma puramente autoregresiva, introduce una capa de razonamiento latente que organiza la generación en bloques, lo que podría mejorar la coherencia global del texto. Está pensado como un proyecto de investigación y demostración técnica, con un espacio de HuggingFace que permite probarlo en CPU. No se han publicado especificaciones detalladas de entrenamiento ni benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Latent-AR (autorregresivo latente): planificador profundo sobre fragmentos de 5 tokens + escritor autorregresivo superficial |
| Parámetros totales | ~793 millones |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, sin confirmación) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o checkpoint de JAX) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura latent-AR, una variante de los modelos autorregresivos que introduce un espacio latente intermedio. El proceso de generación se divide en dos etapas: un planificador profundo procesa el contexto y predice representaciones latentes para fragmentos de 5 tokens, y un escritor autorregresivo superficial genera los tokens concretos condicionados por esas representaciones latentes. Esto permite que el modelo considere información a nivel de bloque, en lugar de solo el token anterior.

Se entrenó desde cero en JAX/Flax, lo que sugiere un pipeline de entrenamiento personalizado. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni el uso de técnicas de alineación como RLHF o DPO. La ausencia de estos detalles en la model card y en la documentación pública limita la evaluación de su calidad y de sus posibles sesgos.

## Capacidades

- Generación de texto autoregresiva con planificación latente en fragmentos de 5 tokens.
- Razonamiento de nivel de largo plazo gracias al planificador profundo, que puede mejorar la coherencia global del texto generado.
- Ejecución en CPU (se ofrece una demo en vivo en Hugging Face Spaces).
- No se han confirmado capacidades de tool calling, agentes, visión, audio o multilingüismo en la documentación disponible.

## Casos de uso

- Prototipado de investigación: el modelo es un banco de pruebas ideal para explorar arquitecturas latent-AR en entornos académicos o de investigación, gracias a su tamaño moderado y su implementación en JAX/Flax.
- Generación de texto en entornos con recursos limitados: al tener ~793M de parámetros, puede ejecutarse en GPU de consumo o incluso en CPU con cuantización, siendo adecuado para aplicaciones de bajo presupuesto.
- Análisis de coherencia textual: su diseño de planificación latente permite estudiar cómo los modelos gestionan la coherencia global frente a la coherencia local en tareas de generación de textos largos.
- Experimentación con arquitecturas híbridas: sirve como base para comparar el rendimiento de la autorregresión latente frente a modelos transformer estándar del mismo tamaño.
- Demo interactiva: el espacio de Hugging Face permite probar el modelo en tiempo real, útil para demostraciones o pruebas de concepto.
- Educación sobre modelos generativos: su código y arquitectura documentados (aunque parcialmente) pueden utilizarse para enseñar conceptos de planificación latente y entrenamiento desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: con ~793 millones de parámetros, en FP32 se necesitarían aproximadamente 3,2 GB de VRAM; en FP16, ~1,6 GB; en cuantización de 8 bits, ~0,8 GB. Esto lo hace ejecutable en GPU consumer de gama media (RTX 3060, RTX 4060, etc.) y en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o más es suficiente para inferencia; para entrenamiento, se requeriría al menos 8 GB de VRAM (p. ej., RTX 3080, A100, etc.).
- Opciones de despliegue: no se han publicado formatos GGUF ni integraciones con vLLM, Ollama o TGI. El modelo se presenta en JAX/Flax, por lo que su despliegue requeriría una conversión de pesos a otros formatos (p. ej., PyTorch o GGUF) para usar en herramientas estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos de la misma categoría. No se conocen otros modelos de la misma arquitectura latent-AR con los que comparar parámetros, contexto o rendimiento. Modelos transformer de tamaño similar (p. ej., GPT-2 de 774M) tienen una arquitectura distinta y no son comparables en términos de diseño.

## Limitaciones y advertencias

- Sin datos de entrenamiento publicados: no se conocen los datos usados, por lo que no se puede evaluar sesgos, cobertura de idiomas ni calidad general.
- Riesgo de alucinación: como cualquier LM pequeño entrenado desde cero, puede generar contenido plausible pero incorrecto o sin sentido.
- Contexto limitado: la longitud de contexto no se ha publicado, pero por su tamaño es probable que sea limitada (p. ej., 1024-2048 tokens).
- Idioma: no se confirma el soporte multilingüe; probablemente solo funcione bien en inglés.
- Formato de pesos: al ser un modelo JAX/Flax, no es directamente utilizable con las herramientas estándar (transformers, vLLM, etc.) sin una conversión previa.
- Licencia MIT: permite uso comercial y modificación, pero no se proporciona garantía ni soporte oficial.

## Enlaces

- Espacio de demostración: https://huggingface.co/spaces/PRATYUSH-BHARDWAJ/Cortex-A-0.5
- Perfil del autor: https://huggingface.co/PRATYUSH-BHARDWAJ
- Modelo en Hugging Face: https://huggingface.co/PRATYUSH-BHARDWAJ/Cortex_A_0.5
- Referencia de arquitectura (paper relacionado, no confirmado como el del modelo): https://arxiv.org/pdf/2501.03575v3
