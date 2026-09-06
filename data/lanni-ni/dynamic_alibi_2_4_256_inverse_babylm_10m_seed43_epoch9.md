# Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch9

## Resumen

Este modelo es un experimento de investigación de Lanni-ni sobre variantes de ALiBi (Attention with Linear Biases) en el contexto del desafío BabyLM. El nombre del repositorio indica que se trata de una implementación de "dynamic ALiBi" con configuración 2_4_256 (probablemente 2 capas, 4 cabezas de atención y 256 unidades de dimensión oculta), entrenada con 10 millones de palabras del corpus BabyLM, semilla 43 y 9 épocas. El modelo tiene 27.447.040 parámetros y se distribuye en formato safetensors.

Se trata de un modelo de lenguaje causal de tamaño muy reducido, pensado para investigar cómo las biases lineales dinámicas en la atención afectan a la extrapolación de longitud de contexto. El tag arxiv:1910.09700 enlaza con el paper original de ALiBi. No se ha publicado ninguna documentación adicional, por lo que la información disponible se limita a los metadatos del repositorio y a la interpretación del nombre del modelo.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con ALiBi dinámico (deducido del nombre y tags) |
| Parámetros totales | 27.447.040 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con atención basada en ALiBi (Attention with Linear Biases), una técnica que añade sesgos lineales a las puntuaciones de atención para permitir la extrapolación a longitudes de secuencia mayores que las vistas durante el entrenamiento. El nombre "dynamic_alibi" sugiere una variante en la que estos sesgos se ajustan dinámicamente, y "inverse" podría indicar una función de sesgo inversa respecto a la distancia entre tokens. La configuración 2_4_256 apunta a un modelo con 2 capas, 4 cabezas de atención y 256 dimensiones de modelo, aunque estos valores no están confirmados en la documentación.

El entrenamiento se realizó dentro del marco BabyLM, que propone entrenar modelos de lenguaje con datos limitados (10 millones de palabras). El sufijo "10m" del nombre confirma esta cantidad de datos. La semilla 43 y la época 9 indican que se trata de un checkpoint concreto de un experimento de entrenamiento. No se ha publicado información sobre el dataset exacto, el régimen de entrenamiento (precisión, optimizador, etc.) ni sobre procesos de alineación como RLHF o DPO. Al no haber model card informativa, estos detalles se consideran no disponibles.

## Capacidades

- Generación de texto: el modelo está configurado como pipeline de text-generation, por lo que puede generar texto causal.
- Extrapolación de longitud: es el objetivo de investigación de ALiBi, pero no se han publicado resultados que confirmen el comportamiento real.
- Tool calling / function calling: no documentado. Por su tamaño, no se espera soporte.
- Agentes y razonamiento multi-paso: no documentado. El modelo es demasiado pequeño para tareas complejas de razonamiento.
- Capacidades multilingües: no disponibles.
- Visión, audio u otras modalidades: no aplica. Es un modelo de texto.
- Requiere trust_remote_code=True al cargarlo desde transformers debido al tag custom_code.

## Casos de uso

- Investigación en extrapolación de longitud: el modelo permite comparar el comportamiento de ALiBi dinámico frente a ALiBi estático en secuencias más largas que las de entrenamiento. Se usaría como baseline en estudios académicos.
- Evaluación de eficiencia en BabyLM: sirve para analizar cómo un modelo de 27 millones de parámetros aprende con solo 10 millones de palabras, un escenario típico del desafío BabyLM.
- Experimentos de interpretabilidad de atención: al ser un modelo muy pequeño, es posible inspeccionar los patrones de atención y los sesgos lineales para entender cómo se distribuye la atención entre posiciones.
- Pruebas de concepto docentes: en cursos de arquitecturas de transformers, puede usarse como ejemplo práctico de ALiBi y de cómo los sesgos de atención afectan al aprendizaje.
- Comparativa de variantes de ALiBi: el repositorio contiene checkpoints con distintas semillas y épocas (por ejemplo, epoch8 y epoch9), lo que permite estudiar la estabilidad del entrenamiento.
- Análisis de sesgos en modelos pequeños: aunque no hay datos publicados, el modelo podría utilizarse para estudiar sesgos lingüísticos en modelos entrenados con corpus reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación. El modelo no incluye métricas de rendimiento en su model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 110 MB en FP32 (27.447.040 parámetros × 4 bytes) y 55 MB en FP16. Cabe en cualquier GPU consumer, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM. También puede ejecutarse en CPU sin problemas.
- Opciones de despliegue: transformers con trust_remote_code=True. Para usar llama.cpp o GGUF, sería necesaria una conversión previa no documentada. No se encuentra disponible en Ollama.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia muy baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El modelo no tiene documentación ni benchmarks que permitan una comparación fiable con otras arquitecturas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental: la model card está vacía y no se ha publicado información sobre el entrenamiento, los datos o la arquitectura.
- Licencia no especificada: al no indicar licencia, el uso comercial no está garantizado.
- Riesgo de alucinación: el tamaño reducido (27 millones de parámetros) y la cantidad limitada de datos de entrenamiento aumentan la probabilidad de generar texto incoherente o factualmente incorrecto.
- Sesgos desconocidos: no se ha realizado ninguna evaluación de sesgos.
- Limitaciones de idioma: no se especifican los idiomas soportados. Es probable que esté entrenado principalmente en inglés por el corpus BabyLM, pero no está confirmado.
- Requiere código personalizado: el tag custom_code indica que la implementación no es estándar, por lo que puede haber problemas de compatibilidad con versiones futuras de transformers.
- No apto para producción: no hay garantías de rendimiento, seguridad ni fiabilidad para aplicaciones reales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch9
- Paper de ALiBi (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Página personal del autor: https://lanni-ni.github.io/
