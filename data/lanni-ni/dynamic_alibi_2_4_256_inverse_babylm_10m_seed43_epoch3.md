# Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch3

## Resumen

Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch3 es un modelo de lenguaje generativo de muy pequeño tamaño, desarrollado por el usuario de HuggingFace Lanni-ni. Se trata de un experimento de investigación sobre mecanismos de atención con sesgos lineales dinámicos (ALiBi), entrenado presuntamente sobre el corpus BabyLM para el estudio de modelos con datos limitados. Con 27,4 millones de parámetros y pesos en formato safetensors, su arquitectura está orientada a explorar la extrapolación de longitud de contexto en modelos diminutos.

El modelo forma parte de una serie de experimentos con distintas configuraciones y épocas de entrenamiento, como la variante epoch8 disponible también en el Hub. Su relevancia actual radica en que permite evaluar el impacto de la dinámica de ALiBi en la capacidad de generalizar a secuencias más largas, sin necesidad de infraestructura costosa. La model card, sin embargo, no proporciona información técnica detallada, por lo que gran parte de los datos de especificación no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención ALiBi dinámica (según nombre y tag) |
| Parámetros totales | 27.447.040 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se infiere del identificador del modelo, que incluye los términos `dynamic_alibi` y el tag `arxiv:1910.09700`, correspondiente al paper "Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation". Esto indica que se emplea atención con sesgos lineales (ALiBi), en lugar de posicionamiento absoluto o relativo estándar. El número `2_4_256` en el nombre sugiere una configuración con 2 capas, 4 cabezas de atención y 256 unidades de dimensión de embedding, aunque estos valores no están confirmados en la model card.

El nombre incluye `inverse_babylm`, lo que apunta a que el entrenamiento se realizó sobre el corpus BabyLM, un conjunto de datos diseñado para simular la adquisición de lenguaje con una cantidad limitada de texto. No se dispone de información pública sobre el número exacto de tokens de entrenamiento, la composición del dataset, ni sobre la aplicación de técnicas de alineación como RLHF o DPO. El modelo también incluye el tag `custom_code`, lo que implica que se requiere código personalizado para cargar la arquitectura.

## Capacidades

- Generación de texto básica y modelado de lenguaje autoregresivo, con una capacidad limitada por su tamaño de 27 millones de parámetros.
- Posible uso para estudiar la extrapolación de longitud de contexto gracias a los sesgos ALiBi, aunque no hay resultados publicados que lo confirmen.
- Soporte de carga en la librería transformers, con pipeline de `text-generation` según la model card.
- Sin indicios de soporte de tool calling, function calling, agentes, ni razonamiento multi-paso.
- No se han documentado capacidades multilingües ni de visión.
- Sin modo de razonamiento especial o capacidades de audio.

## Casos de uso

- Investigación en extrapolación de contexto: el modelo puede utilizarse para estudiar cómo la atención ALiBi dinámica afecta a la perplejidad en secuencias más largas que las empleadas en entrenamiento. Se ejecutaría con un script de evaluación sobre textos de distintas longitudes comparando la pérdida.
- Ablación de arquitecturas de atención: permite comparar esta variante con la versión `epoch8` del mismo autor o con implementaciones estándar de ALiBi, aislar el efecto de la dinámica de los sesgos y medir su impacto en tareas de modelado.
- Docencia en procesamiento del lenguaje natural: al ser un modelo pequeño, puede cargarse en una CPU con menos de 150 MB de memoria, ideal para explicar el funcionamiento de transformers, la tokenización y el entrenamiento desde cero en cursos universitarios.
- Prototipado de pipelines de generación: sirve como banco de pruebas para validar integraciones con transformers, como bucles de decodificación, criterios de parada o técnicas de muestreo, sin incurrir en costes de GPU significativos.
- Reproducibilidad científica: la semilla fija (`seed43`) y la época (`epoch3`) permiten reutilizar el checkpoint para reproducir experimentos de entrenamiento con BabyLM y comparar métricas entre configuraciones.
- Medición de latencia en despliegue edge: por su tamaño, es adecuado para caracterizar el impacto de la cuantización o el batching en la latencia de inferencia en dispositivos de bajo consumo, aunque no se han publicado datos de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 110 MB en FP32 y 55 MB en FP16, contando solo los pesos del modelo.
- GPU recomendada: cualquiera con al menos 1 GB de VRAM, incluyendo GPUs integradas; también puede ejecutarse en CPU.
- Puede ejecutarse en hardware de consumo sin problemas: RTX 3060, RTX 4090 o incluso CPUs modernas.
- Opciones de despliegue: inferencia directa con la librería transformers (pipeline `text-generation`), o conversión a GGUF para su uso con llama.cpp u Ollama, dada la pequeñez del modelo.
- Latencia y throughput: no disponibles, aunque previsiblemente bajos al tratarse de un modelo de 27 millones de parámetros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch3 | 27,4M | no disponible | no disponible | HuggingFace |
| dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch8 | 27,4M | no disponible | no disponible | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría con datos contrastables.

## Limitaciones y advertencias

- Sesgos conocidos: no se han realizado evaluaciones publicadas, por lo que los sesgos son desconocidos.
- Riesgo de alucinación alto: al ser un modelo pequeño, no alineado y entrenado con datos limitados, es probable que genere texto plausible pero factualmente incorrecto.
- Limitaciones de contexto: la longitud de contexto de entrenamiento no está documentada, por lo que no se puede garantizar un comportamiento estable en secuencias largas.
- Limitaciones de idioma: la información no especifica los idiomas soportados; dadas sus características, se espera que funcione principalmente en inglés.
- Restricciones de licencia: no se ha especificado ninguna licencia, por lo que el uso comercial no está garantizado y podría incurrir en problemas legales.
- Requiere `custom_code` para cargarse, lo que introduce un riesgo de seguridad si el repositorio no es de confianza.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- Es un modelo no alineado, por lo que no debe usarse en aplicaciones de cara al usuario final sin una evaluación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch3
- Variante epoch8 del mismo autor: https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch8
- Página personal del autor: https://lanni-ni.github.io/
- Paper de ALiBi (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
