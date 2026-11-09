# gaijingchu/precision-paper-220M-440M

## Resumen

precision-paper-220M-440M es un repositorio de artefactos de investigación publicado por el usuario gaijingchu en Hugging Face. No se trata de un modelo entrenado para uso general, sino de una colección de pesos finales y mediciones de un estudio de escalado de precisión numérica sobre modelos de la familia OLMo-core, con dos tamaños concretos: 220M y 440M parámetros. El autor indica que los modelos de 30M, 60M y 110M están en un repositorio hermano (gaijingchu/precision-paper-30M-60M-110M).

El propósito del repositorio es documentar cómo afecta la precisión de entrenamiento (por ejemplo, formatos de coma flotante de 8 o 16 bits) y el presupuesto de tokens a la pérdida final y a la robustez frente a perturbaciones de pesos y cuantización posterior al entrenamiento. Cada directorio corresponde a una ejecución de entrenamiento identificada por tamaño, tokens (`D<tokens>B`), precisión (`f<bits>`), tasa de aprendizaje y semilla. Se incluyen los pesos maestros en fp32, la configuración del modelo, el YAML de lanzamiento y las mediciones por ejecución.

Es relevante ahora porque ofrece material reproducible para estudiar el impacto de la precisión en el entrenamiento de modelos pequeños, un área de interés creciente para reducir costes de cómputo sin degradar la calidad. Sin embargo, no es un modelo listo para producción: no incluye checkpoints intermedios, datos de entrenamiento ni una model card con especificaciones de uso, licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia OLMo-core (detalles no disponibles) |
| Parametros totales | 220M y 440M (dos variantes) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | se documentan mediciones de cuantizacion posterior al entrenamiento; formatos concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict de OLMo-core, fp32 maestro); no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

Los modelos siguen la arquitectura OLMo-core, un framework de entrenamiento de transformers desarrollado por el Allen Institute for AI. El repositorio no detalla la configuración interna (número de capas, dimensiones, atención, etc.), pero sí indica que se trata de modelos densos de 220M y 440M parámetros. El estudio se centra en el escalado de precisión: cada ejecución entrena con un formato de coma flotante distinto (`f<bits>`) y un presupuesto de tokens (`D<tokens>B`), con tasa de aprendizaje y semilla registradas en el nombre de la ejecución.

El entrenamiento se documenta mediante el archivo `launch.yaml` de cada ejecución, que contiene la configuración completa. Las mediciones incluyen la pérdida final, la pérdida de inicio en BF16, barridos de perturbación gaussiana de pesos y resultados de cuantización posterior al entrenamiento. No se especifica el número total de tokens de entrenamiento ni la composición del dataset, y no se menciona el uso de RLHF, DPO ni otras técnicas de alineación. Tampoco se incluyen los checkpoints intermedios ni los datos de entrenamiento, lo que limita la reproducibilidad completa.

## Capacidades

- Generación de texto y modelado de lenguaje: al ser modelos OLMo-core preentrenados, se espera que puedan generar texto y calcular probabilidades, aunque no se documentan capacidades específicas.
- Razonamiento y código: no disponible; no hay evaluación publicada en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se indican idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Estudio de escalado de precisión: el repositorio permite analizar cómo varía la pérdida final al entrenar con distintas precisiones numéricas y presupuestos de tokens, usando los archivos JSON de mediciones por ejecución.
- Investigación sobre cuantización posterior al entrenamiento: los resultados de cuantización incluidos permiten evaluar la degradación de modelos pequeños al comprimirlos, útil para diseñar pipelines de despliegue en entornos con recursos limitados.
- Análisis de robustez frente a perturbaciones de pesos: los barridos de perturbación gaussiana permiten estudiar la sensibilidad del modelo a cambios en los pesos, relevante para técnicas de fusión de modelos o poda.
- Reproducción de experimentos de entrenamiento: el `launch.yaml` y la configuración del modelo permiten replicar las ejecuciones en infraestructura propia, aunque sin los datos originales.
- Benchmarking de frameworks de entrenamiento: al usar OLMo-core, sirve para comparar el comportamiento de este framework frente a otros en términos de estabilidad numérica y pérdida.
- Educación y divulgación: los modelos de 220M y 440M son lo bastante pequeños para experimentar en una sola GPU, lo que facilita la enseñanza de conceptos de precisión y escalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para 220M en fp32 se necesitan aproximadamente 0,9 GB solo para pesos, y para 440M unos 1,8 GB, sin contar activaciones ni overhead.
- GPU recomendadas: no disponible; por tamaño, cabrían en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- ¿Cabe en consumer GPU? Sí, por el tamaño de los modelos, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: no se proporcionan; los pesos están en `model.pt` (state dict de OLMo-core), no en formatos estándar como safetensors o GGUF, por lo que requerirían conversión para usarse con vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| precision-paper-220M-440M | 220M / 440M | no disponible | no disponible | Pesos fp32 en `model.pt`, sin checkpoints intermedios |
| OLMo-core (modelos base) | Variable | no disponible | no disponible | Repositorio oficial de OLMo-core |
| Pythia (EleutherAI) | 70M–12B | 2048 | Apache 2.0 | Pesos en safetensors, checkpoints intermedios |
| GPT-2 (OpenAI) | 124M–1.5B | 1024 | MIT | Pesos en safetensors |

La comparativa es limitada porque no se dispone de datos de rendimiento ni de licencia del modelo analizado. Frente a Pythia o GPT-2, la principal diferencia es el enfoque en precisión de entrenamiento y la ausencia de checkpoints intermedios y formatos estándar.

## Limitaciones y advertencias

- No es un modelo listo para producción: no incluye model card con especificaciones de uso, licencia ni idiomas.
- No se incluyen checkpoints intermedios ni datos de entrenamiento, lo que impide reproducir el entrenamiento completo.
- Los pesos están en formato `model.pt` (state dict de OLMo-core), no en safetensors ni GGUF, lo que requiere conversión para su uso con herramientas estándar.
- No hay información sobre sesgos, alucinación o limitaciones de contexto.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- El tamaño del repo (24,3 GB) es grande para modelos de este tamaño, probablemente debido a múltiples ejecuciones y pesos fp32.

## Enlaces

- Hugging Face: https://huggingface.co/gaijingchu/precision-paper-220M-440M
- Repositorio hermano (30M/60M/110M): https://huggingface.co/gaijingchu/precision-paper-30M-60M-110M
- OLMo-core (framework): no se proporciona enlace en la información disponible.
