# aleksey1966/ruGPT3XL-merged

## Resumen

El modelo `aleksey1966/ruGPT3XL-merged` es una fusión (merge) de dos variantes del modelo ruGPT3XL de SberDevices: `evilfreelancer/ruGPT3XL` y `shannonkun/rugpt3xl-1.3b-sft`. El autor, aleksey1966, ha combinado ambos pesos mediante interpolación slerp con un factor t=0.5, con el objetivo de crear una base para el ajuste fino (fine-tuning) en datasets específicos del personaje ruso «Петрович». El modelo resultante conserva la arquitectura original de ruGPT3XL, un transformer autoregresivo de 1.3 mil millones de parámetros con atención sparse, entrenado originalmente por el equipo de SberDevices sobre 80 mil millones de tokens en ruso.

Este merge es relevante para desarrolladores que trabajan con generación de texto en ruso y necesitan un punto de partida compacto y eficiente para tareas de diálogo o estilo conversacional. Al ser un modelo de 1.4B parámetros, puede ejecutarse en GPUs de consumo moderado, y su formato safetensors con código personalizado (custom_code) requiere `trust_remote_code=True` para su carga. La ausencia de licencia explícita y de documentación detallada limita su uso en entornos comerciales sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo con atención sparse (basado en ruGPT3XL) |
| Parametros totales | 1.418.678.272 (1,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 (según el modelo base ai-forever/rugpt3xl) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ruso (principal) |
| Licencia | No disponible |
| Formato de pesos | safetensors (con código personalizado) |

## Arquitectura y entrenamiento

El modelo base ruGPT3XL fue desarrollado por SberDevices utilizando los frameworks DeepSpeed y Megatron-LM. Se entrenó con una longitud de secuencia de 512 tokens durante 4 épocas sobre un dataset de 80 mil millones de tokens, seguido de un ajuste fino de 1 época con secuencias de 2048 tokens. La arquitectura incorpora bloques de atención sparse para reducir el coste computacional y la memoria, lo que permitió un entrenamiento total de aproximadamente 10 días en 256 GPUs. La perplejidad final en el conjunto de prueba fue de 12.05.

El merge realizado por aleksey1966 combina los pesos de dos versiones: una conversión del checkpoint original a formato HuggingFace (evilfreelancer/ruGPT3XL) y una versión con ajuste fino supervisado (shannonkun/rugpt3xl-1.3b-sft). La interpolación slerp (spherical linear interpolation) con t=0.5 produce una mezcla equilibrada de ambos modelos. No se han publicado detalles sobre el proceso de fusión ni sobre el dataset «Петрович» utilizado posteriormente para el fine-tuning.

## Capacidades

- Generación de texto autoregresivo en ruso, con capacidad de continuar secuencias y producir texto coherente.
- Modelo de lenguaje generalista entrenado sobre un corpus masivo en ruso, útil para tareas de completado, resumen y generación creativa.
- Al ser un modelo de 1.4B parámetros, puede adaptarse mediante fine-tuning a dominios específicos, como el estilo conversacional del personaje «Петрович».
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión o audio.
- Soporte multilingüe limitado: el entrenamiento se centró en ruso, por lo que su rendimiento en otros idiomas es previsiblemente bajo.

## Casos de uso

- Chatbots conversacionales en ruso: el modelo puede ajustarse con datasets de diálogo para crear asistentes virtuales con personalidad y estilo definidos, como el mencionado «Петрович». Su tamaño moderado permite desplegarlo en entornos con recursos limitados.
- Generación de contenido creativo en ruso: redacción de cuentos, artículos, guiones o respuestas en foros, aprovechando la capacidad del modelo para producir texto fluido y contextualmente relevante.
- Fine-tuning para dominios específicos: partiendo de este merge, se puede entrenar sobre datos propios (por ejemplo, atención al cliente, documentación técnica) para obtener un modelo especializado con menor coste computacional que desde cero.
- Prototipado rápido de aplicaciones de NLP en ruso: al ser un modelo pequeño, permite iterar rápidamente en tareas de generación de texto sin necesidad de infraestructura de alto rendimiento.
- Investigación en técnicas de fusión de modelos: el propio merge slerp puede servir como caso de estudio para evaluar la efectividad de la interpolación de pesos en modelos de lenguaje.
- Generación de datos sintéticos: puede utilizarse para crear datasets de entrenamiento en ruso, por ejemplo, para aumentar corpus o simular conversaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo merge. El modelo base ai-forever/rugpt3xl reporta una perplejidad de 12.05 en su conjunto de prueba, pero no se dispone de métricas estándar como MMLU, HumanEval o GSM8K. No se han encontrado evaluaciones comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 1.4B parámetros. En precisión fp16, los pesos ocupan aproximadamente 2.8 GB (tamaño del repositorio). Para inferencia con batch pequeño, se recomienda al menos 4 GB de VRAM. Con cuantización a 8 bits (~1.4 GB) o 4 bits (~0.7 GB) podría ejecutarse en GPUs con 2-4 GB, aunque no se han proporcionado archivos cuantizados.
- GPUs recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes. También puede ejecutarse en GPUs de datacenter como A10 o T4.
- Despliegue: compatible con HuggingFace Transformers (usando `trust_remote_code=True`), así como con frameworks de inferencia como vLLM, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión).
- Latencia y throughput: no se han publicado datos específicos. En una GPU moderna, un modelo de 1.4B puede generar decenas de tokens por segundo, pero depende de la implementación y la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos. El modelo base ai-forever/rugpt3xl es el referente directo, pero no se han encontrado especificaciones detalladas de las variantes utilizadas en el merge (evilfreelancer/rugpt3xl y shannonkun/rugpt3xl-1.3b-sft). Otros modelos rusos como ruGPT3Large (760M) o ruGPT3Medium (350M) son más pequeños, pero no se han comparado en este contexto. Se recomienda consultar la documentación de SberDevices para más detalles.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo entrenado sobre un corpus masivo de internet, puede reflejar sesgos presentes en los datos y generar contenido factualmente incorrecto o inventado.
- Limitaciones de idioma: su entrenamiento se centró en ruso; el rendimiento en otros idiomas es muy limitado.
- Longitud de contexto: la ventana de 2048 tokens es relativamente corta para tareas que requieren contexto extenso.
- Licencia: no se especifica ninguna licencia, lo que impide su uso comercial sin autorización explícita del autor.
- Código personalizado: requiere `trust_remote_code=True` al cargar, lo que implica ejecutar código arbitrario del repositorio; se recomienda auditar el código antes de usarlo en producción.
- Falta de documentación: no hay información sobre el proceso de merge, el dataset «Петрович» ni las condiciones de uso, lo que dificulta la reproducibilidad y el mantenimiento.

## Enlaces

- [HuggingFace - aleksey1966/ruGPT3XL-merged](https://huggingface.co/aleksey1966/ruGPT3XL-merged)
- [HuggingFace - ai-forever/rugpt3xl (modelo base)](https://huggingface.co/ai-forever/rugpt3xl)
- [GitHub - EvilFreelancer/rugpt3xl-convert](https://github.com/EvilFreelancer/rugpt3xl-convert)
- [DeepWiki - ruGPT3XL](https://deepwiki.com/ai-forever/ru-gpts/2.1-rugpt3xl)
- [GitHub - esper21/ru-gpts-sberbank](https://github.com/esper21/ru-gpts-sberbank)
