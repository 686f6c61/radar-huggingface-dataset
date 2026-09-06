# Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_100m_seed44_epoch2

## Resumen

El modelo `Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_100m_seed44_epoch2` es un modelo de generación de texto de pequeña escala, con 27.447.040 parámetros, publicado en HuggingFace por el usuario Lanni-ni. Forma parte de una serie de experimentos con la familia BabyLM, en los que se explora el mecanismo de atención con sesgo posicional ALiBi dinámico. El nombre del repositorio indica que se trata de una variante con configuración `2_4_256` (probablemente relacionada con el número de cabezas, capas o dimensiones), con una función de inversión en el sesgo, semilla 44 y entrenada durante 2 épocas.

El modelo se distribuye en formato safetensors y está integrado con la librería Transformers, aunque la model card es genérica y no incluye información sobre el proceso de entrenamiento, los datos utilizados ni el rendimiento. Su relevancia actual radica en el interés investigador por mecanismos de atención posicionales alternativos en modelos pequeños, pero no existe documentación pública suficiente para considerarlo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer con ALiBi dinámico) |
| Parametros totales | 27.447.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la model card. El nombre del repositorio sugiere un modelo basado en el mecanismo ALiBi (Attention with Linear Biases) dinámico, en lugar del ALiBi estático original. La referencia a "inverse" podría indicar una variante que invierte la dirección del sesgo posicional. El tamaño de 27 millones de parámetros es típico de un modelo BabyLM de 100M, aunque el conteo real es menor. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Tampoco hay datos sobre hiperparámetros, régimen de precisión ni infraestructura de cómputo.

## Capacidades

- Generación de texto: el modelo es un modelo de lenguaje autoregresivo, por lo que puede generar texto condicionado a un prompt, aunque su calidad no está evaluada.
- Razonamiento: no hay evidencia publicada de capacidades de razonamiento específicas.
- Código: no hay información sobre soporte de generación de código.
- Matemáticas: no hay información.
- Tool calling / function calling: no hay información.
- Agentes y multi-step reasoning: no hay información.
- Multilingüe: no hay información sobre idiomas soportados.
- Capacidades especiales: no hay información sobre visión, audio o modo de pensamiento.

## Casos de uso

- Experimentación académica: el modelo puede utilizarse en entornos de investigación para estudiar el comportamiento de mecanismos de atención con sesgo posicional dinámico, comparando variantes como la "inverse" frente a la estándar dentro de la serie BabyLM.
- Prototipado rápido de pipelines de NLP: gracias a su tamaño reducido, permite probar flujos de preprocesado y generación con Transformers en máquinas locales sin requisitos de hardware elevados.
- Educación y docencia: sirve como ejemplo práctico de un modelo de lenguaje pequeño con una arquitectura de atención alternativa, útil para explicar conceptos como ALiBi en cursos de aprendizaje profundo.
- Benchmarking de eficiencia: puede usarse para medir el coste computacional de modelos con atención basada en sesgos posicionales frente a modelos con posiciones aprendidas, siempre que se definan métricas propias.
- Reproducción de experimentos: al estar disponible la semilla (seed44) y la época (epoch2), facilita la replicación de resultados dentro de un estudio de investigación.
- Integración en pipelines de pruebas unitarias: dado su pequeño tamaño, puede incorporarse en tests automatizados que verifiquen la carga de safetensors y la generación básica de texto en un entorno de CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval, GSM8K ni ningún otro benchmark. Tampoco se han encontrado resultados externos en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,4 millones de parámetros, el modelo ocupa aproximadamente 55 MB en fp16 y 110 MB en fp32, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1650 hasta una RTX 4090 o A100. No se requiere hardware de gama alta.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o incluso en CPU.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede cargarse con `AutoModelForCausalLM` y servirse con vLLM, TGI o llama.cpp si se convierte a GGUF. También es compatible con Ollama mediante conversión previa.
- Latencia y throughput: no disponible, aunque por su tamaño la latencia será muy baja en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_100m_seed44_epoch2 | 27,4M | no disponible | no disponible | HuggingFace |
| Lanni-ni/dynamic_alibi_2_4_256_babylm_100m_epoch4 | no disponible | no disponible | no disponible | HuggingFace |
| Lanni-ni/dynamic_alibi_2_4_256_babylm_100m_inverse_epoch1 | no disponible | no disponible | no disponible | HuggingFace |

Los tres modelos pertenecen a la misma serie del autor y comparten la configuración `dynamic_alibi_2_4_256`, diferenciándose en la variante (inverse o estándar) y en la época de entrenamiento. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un modelo entrenado sin información sobre el dataset, es posible que herede sesgos de los datos utilizados.
- Riesgo de alucinación: al ser un modelo pequeño y sin evaluación publicada, la probabilidad de generar contenido factualmente incorrecto es alta.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están especificados, lo que impide conocer su ámbito de uso fiable.
- Restricciones de licencia: la licencia no está indicada, por lo que no se puede garantizar el uso comercial ni la redistribución.
- Falta de documentación: la model card es un placeholder generado automáticamente, sin información sobre arquitectura, entrenamiento ni evaluación, lo que dificulta su uso en entornos de producción.
- Incompatibilidad potencial: al tratarse de un modelo con `custom_code` en los tags, la carga mediante Transformers puede requerir código personalizado que no está documentado en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_100m_seed44_epoch2
- Modelo relacionado (epoch4): https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_babylm_100m_epoch4
- Modelo relacionado (inverse epoch1): https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_babylm_100m_inverse_epoch1
- Referencia a ALiBi (paper arxiv:1910.09700): https://arxiv.org/abs/1910.09700
