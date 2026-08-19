# mradermacher/DeepNemotron-3.5-Lightning-BF16-GGUF

## Resumen

DeepNemotron-3.5-Lightning-BF16-GGUF es una cuantización en formato GGUF del modelo DeepNemotron-3.5-Lightning-BF16, publicado por el usuario vcruz305 en Hugging Face. Este modelo es, a su vez, una versión en precisión BF16 del NVIDIA Nemotron 3.5 Lightning, un modelo de lenguaje de código abierto desarrollado por NVIDIA, diseñado específicamente para cargas de trabajo agénticas de alto volumen, razonamiento rápido y generación de código. La cuantización ha sido realizada por mradermacher, un conocido proveedor de pesos GGUF, lo que permite ejecutar el modelo en hardware más modesto y con menor consumo de memoria.

El modelo original presenta una arquitectura híbrida Mamba-Transformer con mezcla de expertos (MoE), con 30 mil millones de parámetros totales y solo 3 mil millones activos por token. Esta configuración ofrece un equilibrio entre rendimiento y eficiencia, logrando hasta 4 veces más throughput y un 30% más de rapidez en tareas de agentes en comparación con modelos densos de tamaño similar, según datos de NVIDIA. La versión cuantizada aquí descrita mantiene las mismas capacidades funcionales, aunque con una ligera pérdida de precisión inherente al proceso de cuantización.

La relevancia de este modelo radica en su idoneidad para entornos de producción donde se requieren agentes conversacionales siempre activos, con soporte para tool calling y razonamiento multi-paso, a un coste computacional reducido gracias a su naturaleza MoE. La disponibilidad en formato GGUF amplía su accesibilidad, permitiendo su despliegue en GPUs de consumo mediante herramientas como llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido Mamba-Transformer (según modelo original) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | 3.000.000.000 (según modelo original) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original, NVIDIA Nemotron 3.5 Lightning, emplea una arquitectura híbrida que combina capas Mamba (modelos de espacio de estados) con capas Transformer, integradas en un esquema de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos por token. Esta combinación permite un procesamiento eficiente de secuencias largas y una inferencia rápida, especialmente en tareas de razonamiento y codificación. El entrenamiento se realizó con datos propietarios de NVIDIA, incluyendo conjuntos de preentrenamiento y post-entrenamiento, aunque no se han publicado detalles específicos sobre el número de tokens o la composición exacta del dataset en la información disponible.

La versión cuantizada aquí presentada es una conversión estática de los pesos BF16 del modelo original a formato GGUF, realizada por mradermacher. No se ha realizado ningún reentrenamiento ni ajuste adicional; la cuantización reduce la precisión numérica de los pesos para disminuir el uso de memoria y acelerar la inferencia en hardware con recursos limitados. Los distintos niveles de cuantización (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, etc.) ofrecen un equilibrio entre fidelidad y tamaño del archivo, permitiendo al usuario elegir según sus requisitos de calidad y capacidad de hardware.

## Capacidades

- Generación de texto y razonamiento multi-paso, optimizado para tareas de agentes y flujos de trabajo conversacionales.
- Soporte de tool calling y function calling, permitiendo la integración con APIs y servicios externos.
- Capacidad para manejar contextos largos gracias a la arquitectura híbrida Mamba-Transformer, aunque la longitud exacta no está especificada en la información disponible.
- Generación de código y asistencia en programación, con buen rendimiento en tareas de autocompletado y depuración.
- Multilingüismo: aunque no se detallan los idiomas soportados, el modelo original de NVIDIA está entrenado con datos multilingües (se mencionan 6 idiomas en la búsqueda web, pero no se especifican cuáles).
- Eficiencia computacional: al ser un MoE con solo 3B parámetros activos, ofrece alta velocidad de inferencia y menor consumo de recursos en comparación con modelos densos de tamaño similar.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con clientes, resolviendo consultas frecuentes y derivando casos complejos a agentes humanos. Su capacidad de tool calling permite consultar bases de datos de pedidos o sistemas de ticketing en tiempo real.
- Generación de código en producción: integrado en pipelines de CI/CD, puede autocompletar funciones, generar tests unitarios o revisar código, reduciendo el tiempo de desarrollo. Su velocidad de inferencia lo hace adecuado para entornos de desarrollo interactivo.
- Agentes de automatización de tareas: desplegado como agente autónomo, puede ejecutar acciones como enviar correos, actualizar registros o interactuar con APIs, gracias a su soporte de function calling y razonamiento multi-paso.
- Asistente de investigación y análisis de documentos: con su capacidad de contexto largo, puede resumir informes extensos, extraer datos clave y responder preguntas sobre documentos técnicos o legales.
- Chatbot especializado en dominios técnicos: entrenado con datos de código y razonamiento, puede servir como asistente para desarrolladores, respondiendo preguntas sobre APIs, depurando errores o explicando conceptos de programación.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF, puede ejecutarse en GPUs de consumo (como RTX 3060 o 4090) con cuantizaciones bajas, permitiendo prototipado rápido y pruebas locales sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web menciona que el modelo original ofrece hasta 4x mayor throughput y 30% más rápida finalización de tareas en comparación con modelos densos de tamaño similar, pero no se proporcionan cifras concretas de métricas estándar como MMLU, HumanEval o GSM8K. Se recomienda consultar la documentación oficial de NVIDIA para obtener datos de evaluación detallados.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~8 GB (aproximado, basado en 30B parámetros a 2 bits)
  - Q4_K_M: ~17 GB (aproximado)
  - Q6_K: ~24 GB (aproximado)
  - Q8_0: ~32 GB (aproximado)
  - BF16 (sin cuantizar): ~60 GB (según el tamaño del repo de 73.4 GB, que incluye overhead)
- GPUs recomendadas:
  - Para cuantizaciones bajas (Q2_K, Q3_K): GPUs consumer con 8-12 GB VRAM, como RTX 3060, RTX 4060 Ti o RTX 4070.
  - Para cuantizaciones medias (Q4_K, Q5_K): GPUs con 16-24 GB VRAM, como RTX 4090, RTX 3090 o A5000.
  - Para BF16 o Q8_0: GPUs de datacenter como A100 (40/80 GB) o H100.
- Opciones de despliegue: compatible con llama.cpp, Ollama, vLLM (con adaptación), TGI (si se convierte a formato compatible) y cualquier framework que soporte GGUF.
- Latencia y throughput: no disponibles en la información proporcionada, pero se espera que sea superior a modelos densos de 30B gracias a la arquitectura MoE con solo 3B activos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DeepNemotron-3.5-Lightning (este) | 31.58B | 3B | no disponible | no disponible | GGUF |
| NVIDIA Nemotron 3.5 Lightning (original) | 30B | 3B | no disponible | openmdw-1.1 | BF16 |
| Qwen2.5-32B-A3B (referencia) | 32B | 3B | 128K | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en datos públicos de modelos similares. Qwen2.5-32B-A3B es un MoE con 3B activos y contexto de 128K, pero no se dispone de benchmarks comparativos directos. La licencia del modelo original es openmdw-1.1, pero la de esta cuantización no está especificada.

## Limitaciones y advertencias

- La cuantización introduce pérdida de precisión, que puede afectar a tareas que requieren alta exactitud numérica o razonamiento complejo. Se recomienda usar cuantizaciones más altas (Q6_K, Q8_0) para aplicaciones críticas.
- La licencia del modelo no está disponible en la ficha de Hugging Face. Aunque el modelo original usa openmdw-1.1, no se confirma que esta cuantización herede dicha licencia. Se debe contactar con el autor o verificar antes de un uso comercial.
- No se especifican los idiomas soportados ni la longitud de contexto exacta, lo que limita la planificación de despliegues multilingües o con documentos extensos.
- El modelo puede presentar sesgos presentes en los datos de entrenamiento originales de NVIDIA, aunque no se han documentado casos específicos.
- Riesgo de alucinación en tareas de generación abierta, especialmente en dominios no cubiertos por los datos de entrenamiento. Se recomienda validar las salidas en entornos de producción.
- Al ser una cuantización estática, no se ha realizado un ajuste fino posterior, por lo que el rendimiento puede variar ligeramente respecto al modelo original en tareas específicas.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/DeepNemotron-3.5-Lightning-BF16-GGUF
- Modelo original BF16 (vcruz305): https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-BF16
- Modelo NVIDIA Nemotron 3.5 Lightning (referencia): https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-GGUF
- Blog de AWS sobre disponibilidad en SageMaker JumpStart: https://aws.amazon.com/blogs/machine-learning/nvidia-nemotron-3-5-lightning-now-available-in-amazon-sagemaker-jumpstart/
- Repositorio de GitHub con usage-cookbook: https://github.com/NVIDIA-NeMo/Nemotron/tree/main/usage-cookbook/Nemotron-3.5-Lightning
- Página oficial de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
