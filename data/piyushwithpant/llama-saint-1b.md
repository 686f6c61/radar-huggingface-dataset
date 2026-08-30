# PiyushWithPant/Llama-Saint-1B

## Resumen

Llama-Saint-1B es un modelo de lenguaje de 1.235.814.400 parámetros (aproximadamente 1,24 mil millones) desarrollado por Piyush Pant, que parte del modelo base meta-llama/Llama-3.2-1B y se somete a un proceso de alineación mediante RLHF (Reinforcement Learning from Human Feedback) sobre el dataset Manthan-RLHF. El objetivo principal es mejorar la seguridad y la alineación de un modelo compacto, manteniendo un tamaño reducido que permita su uso en entornos con recursos limitados.

El modelo se entrena en dos fases: Supervised Fine-Tuning (SFT) y Direct Preference Optimization (DPO), lo que lo convierte en una herramienta de investigación útil para estudiar técnicas de alineación, evaluación de seguridad y preferencia humana. Está pensado exclusivamente para fines de investigación y no debe considerarse seguro, fiable o factual en aplicaciones de alto riesgo.

Su relevancia radica en que ofrece un punto de partida accesible para experimentar con RLHF y DPO en un modelo de tamaño pequeño, con una licencia Llama 3.2 Community License que permite uso comercial bajo ciertas condiciones. Sin embargo, al ser un modelo de investigación, carece de documentación detallada sobre su rendimiento en tareas estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la documentación; el modelo base Llama-3.2-1B soporta 128K tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible (no se especifican; el repositorio contiene pesos en safetensors, por lo que es compatible con cuantización GGUF, AWQ u otras mediante herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer decoder de Llama 3.2, concretamente en la variante de 1B parámetros. No se proporcionan detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) más allá de los heredados del modelo base.

El entrenamiento se realiza en dos etapas sobre el dataset Manthan-RLHF: primero una fase de Supervised Fine-Tuning (SFT) para adaptar el modelo a las respuestas preferidas, y posteriormente Direct Preference Optimization (DPO) para optimizar la política de generación según preferencias humanas. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni otros hiperparámetros. Tampoco se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en inglés, como se muestra en el ejemplo de uso de la model card.
- Alineación y seguridad: entrenado específicamente para mejorar la seguridad y la alineación con preferencias humanas, aunque no se garantiza un comportamiento seguro bajo todas las condiciones.
- Investigación en RLHF: diseñado para experimentos de preferencia learning, evaluación de alineación y estudios de seguridad.
- No se documentan capacidades específicas de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad. Al ser un fine-tune de Llama-3.2-1B, se espera que herede las capacidades base del modelo original, pero no hay confirmación oficial en la documentación proporcionada.

## Casos de uso

- Investigación en alineación de modelos: el modelo sirve como banco de pruebas para estudiar técnicas de RLHF y DPO, comparando el efecto de la alineación en modelos pequeños.
- Evaluación de seguridad: se puede utilizar para probar métodos de detección de sesgos, alucinaciones o comportamientos no deseados en modelos de lenguaje.
- Experimentos de preferencia humana: permite analizar cómo las preferencias anotadas en el dataset Manthan-RLHF influyen en la generación de respuestas.
- Generación de texto en entornos de investigación: útil para tareas de generación de texto en inglés donde se requiera un modelo ligero y con cierto grado de alineación.
- Base para fine-tuning adicional: al ser un modelo abierto, puede servir como punto de partida para entrenamientos posteriores con otros datasets o técnicas.
- Docencia y aprendizaje: adecuado para cursos o talleres sobre RLHF, DPO y alineación de LLMs, dado su tamaño reducido y facilidad de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar. Tampoco se comparan con otros modelos en la model card.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación.
- Estimación orientativa basada en el tamaño del modelo (1,24B parámetros): en precisión fp16, los pesos ocupan aproximadamente 2,5 GB (coincide con el tamaño del repositorio). Con cuantización de 4 bits, la huella de memoria se reduce a unos 0,7 GB, lo que permitiría su ejecución en GPUs consumer con 4 GB de VRAM o menos.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) para inferencia con cuantización. Para fp16, se necesitarían al menos 6 GB de VRAM.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y otras herramientas estándar. El repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no hay datos oficiales. En una GPU consumer moderna, se espera una generación de decenas de tokens por segundo, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-Saint-1B | 1,24B | No disponible | Llama 3.2 Community | Hugging Face |
| TinyLlama-1.1B | 1,1B | No disponible | Apache 2.0 | Hugging Face |
| Llama-3.2-1B (base) | 1,24B | 128K (según documentación de Meta) | Llama 3.2 Community | Hugging Face |

No se dispone de datos de rendimiento comparativo. La comparación se limita a características generales. TinyLlama es un modelo de tamaño similar con licencia Apache 2.0, mientras que Llama-Saint-1B y Llama-3.2-1B comparten la misma licencia y tamaño. La principal diferencia de Llama-Saint-1B es su entrenamiento adicional con RLHF/DPO, que no está presente en los otros dos.

## Limitaciones y advertencias

- El modelo puede generar contenido incorrecto, sesgado, inseguro o no deseado, a pesar del entrenamiento de alineación.
- La alineación de seguridad no garantiza un comportamiento seguro bajo prompts adversarios o condiciones extremas.
- Solo está entrenado en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez.
- La licencia Llama 3.2 Community License impone restricciones de uso aceptable; es necesario revisar los términos antes de cualquier uso comercial.
- Al ser un modelo de investigación, no debe utilizarse en aplicaciones de alto riesgo (salud, finanzas, decisiones legales, etc.) sin una validación exhaustiva.
- No se dispone de información sobre la longitud de contexto efectiva tras el fine-tuning; podría diferir del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PiyushWithPant/Llama-Saint-1B
- Dataset Manthan-RLHF: https://huggingface.co/datasets/PiyushWithPant/Manthan-RLHF
- Perfil de GitHub del autor: https://github.com/PiyushWithPant
- Repositorio de utilidades de Llama (Meta): https://github.com/meta-llama/llama-models
