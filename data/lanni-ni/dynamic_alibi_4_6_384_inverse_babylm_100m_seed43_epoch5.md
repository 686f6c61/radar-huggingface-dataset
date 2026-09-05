# Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed43_epoch5

## Resumen

dynamic_alibi_4_6_384_inverse_babylm_100m_seed43_epoch5 es un modelo de lenguaje de pequeño tamaño desarrollado por Lanni-ni dentro del marco del desafío BabyLM, que entrena modelos con presupuestos de datos limitados (100 millones de palabras). El modelo utiliza una arquitectura transformer con atención basada en ALiBi dinámico, una variante del sesgo lineal de atención que ajusta los sesgos posicionales de forma dinámica.

El modelo tiene 45.694.080 parámetros totales y se distribuye en formato safetensors. Está disponible en Hugging Face para tareas de generación de texto, aunque la información publicada en la model card es mínima: no se detallan datos de entrenamiento, capacidades específicas ni licencia. Es un modelo experimental, probablemente orientado a investigación sobre mecanismos de atención eficientes y aprendizaje con datos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ALiBi dinámico (según nombre y tags) |
| Parametros totales | 45.694.080 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer con atención basada en sesgo lineal dinámico (dynamic ALiBi), una variante de ALiBi que modifica el sesgo de posición a lo largo del proceso de atención. El nombre del modelo indica que fue entrenado con el corpus BabyLM de 100 millones de palabras. No se han publicado detalles sobre el número de tokens, la composición del dataset, los procedimientos de entrenamiento (RLHF, DPO, etc.) ni otras innovaciones técnicas. La model card marca todos los detalles de entrenamiento como "More Information Needed", por lo que no se dispone de información verificable sobre el proceso de entrenamiento.

## Capacidades

- Generación de texto: el pipeline indicado en Hugging Face es text-generation.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multistep, visión ni audio.
- Idiomas: no disponible; la model card no especifica los idiomas soportados.
- Capacidades especiales: el tag "dynamic_alibi" sugiere un mecanismo de atención basado en ALiBi dinámico, pero no se detalla su comportamiento ni sus ventajas.
- No se han publicado evaluaciones de tareas específicas (matemáticas, código, etc.).

## Casos de uso

No se han documentado casos de uso específicos. Dado su pequeño tamaño (45,7 millones de parámetros) y su naturaleza experimental, el modelo podría ser útil en los siguientes escenarios:

- Investigación en eficiencia de atención: comparar el comportamiento de ALiBi dinámico frente a otras variantes de positional encoding en el marco BabyLM.
- Benchmarks de aprendizaje con datos limitados: evaluar el rendimiento de modelos pequeños entrenados con corpus de 100 millones de palabras.
- Prototipado de sistemas de generación de texto en entornos con recursos muy limitados, donde el coste de inferencia debe ser mínimo.
- Docencia y experimentación: servir como ejemplo de implementación de una variante de ALiBi en la librería Transformers.
- Validación de técnicas de positional encoding: probar hipótesis sobre el efecto del sesgo dinámico en la atención de modelos pequeños.
- Pruebas de despliegue ligero: evaluar la inferencia en CPU o en GPUs de bajo perfil, dada la escasa demanda de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los pesos ocupan aproximadamente 183 MB (45,7 millones de parámetros × 4 bytes). En FP16, unos 91 MB. En INT8, unos 46 MB. En 4 bits, unos 23 MB. El overhead de activaciones y el framework añadirán memoria adicional, pero el modelo cabe holgadamente en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM, como RTX 3060, GTX 1650, o incluso GPUs integradas. También puede ejecutarse en CPU.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, TGI. Para CPU, llama.cpp es la opción más ligera.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Se han identificado modelos hermanos del mismo autor con nomenclatura similar, como dynamic_alibi_4_6_384_babylm_100m_epoch6 y dynamic_forgetting_4_6_384_babylm_100m. No se dispone de sus especificaciones técnicas ni de resultados de benchmarks, por lo que no es posible realizar una comparación cuantitativa. Tampoco se han encontrado modelos comparables publicados con datos de rendimiento. La comparativa se limita a la existencia de estos modelos, sin datos de rendimiento.

## Limitaciones y advertencias

- Modelo experimental con información de entrenamiento, evaluación y seguridad no disponible.
- La licencia no está especificada, lo que impide garantizar un uso comercial seguro.
- Riesgo de alucinación y sesgos no evaluados; no se recomienda su uso en producción sin una evaluación exhaustiva.
- Longitud de contexto y capacidades multilingües no documentadas.
- La model card no incluye recomendaciones de uso, advertencias específicas ni evaluación de impacto ambiental.

## Enlaces

- Modelo: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed43_epoch5
- Perfil del autor: https://huggingface.co/Lanni-ni
- Modelo hermano: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6
- Modelo hermano: https://huggingface.co/Lanni-ni/dynamic_forgetting_4_6_384_babylm_100m
