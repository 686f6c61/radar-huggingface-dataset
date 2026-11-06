# qatfactory/DeepSeek-R1-Distill-Llama-8B-MXFP4-QAD-W4A4

## Resumen

DeepSeek-R1-Distill-Llama-8B-MXFP4-QAD-W4A4 es una versión cuantizada del modelo DeepSeek-R1-Distill-Llama-8B, publicada por el usuario qatfactory en Hugging Face. Se trata de un proceso de cuantización con entrenamiento consciente de la cuantización (QAT, quantization-aware training) que produce pesos en formato MXFP4 con esquema W4A4 (pesos de 4 bits, activaciones de 4 bits). El modelo base es el destilado de razonamiento de DeepSeek, construido sobre la arquitectura Llama y con 8.030.261.248 parámetros totales.

La relevancia de esta ficha reside en que combina dos tendencias actuales: por un lado, la destilación de capacidades de razonamiento desde modelos grandes hacia modelos de 8B parámetros, y por otro, la cuantización agresiva a 4 bits con QAT para reducir el coste de inferencia en producción. El formato MXFP4 y el esquema W4A4 son especialmente interesantes para despliegues en vLLM con aceleración de hardware compatible con microescalado de bloques.

El repositorio tiene un tamaño de 5,8 GB, emplea la librería vLLM y el formato de pesos safetensors con compressed-tensors, y se distribuye bajo licencia MIT. Es importante señalar que el acceso está restringido (gated): requiere aceptar condiciones en Hugging Face antes de su descarga. No se dispone de información sobre idiomas soportados ni sobre el pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), destilado de DeepSeek-R1 |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 con QAT, esquema W4A4 (pesos 4 bits, activaciones 4 bits); el tag indica 8-bit y compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-R1-Distill-Llama-8B, un destilado de la familia DeepSeek-R1 que emplea una arquitectura transformer decoder-only de tipo Llama con aproximadamente 8.000 millones de parámetros. El proceso de destilación transfiere capacidades de razonamiento (cadenas de pensamiento, verificación y corrección) desde el modelo R1 original hacia una arquitectura Llama más pequeña. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset del modelo base en la información proporcionada.

Sobre esa base, qatfactory aplica un proceso de quantization-aware training para generar pesos MXFP4 con esquema W4A4. El formato MXFP4 utiliza bloques con exponente compartido (microescalado), lo que permite representar pesos y activaciones en 4 bits con una escala por bloque. El QAT implica simular la cuantización durante el entrenamiento para que el modelo aprenda a compensar el error de redondeo, lo que típicamente produce una degradación menor que la cuantización post-entrenamiento (PTQ) en esquemas tan agresivos como W4A4. El resultado se empaqueta con compressed-tensors para su carga directa en vLLM.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del proceso de destilación de DeepSeek-R1 (cadenas de pensamiento explícitas).
- Razonamiento matemático y resolución de problemas, capacidad característica de la familia R1 destilada.
- Generación de código, al estar el modelo base entrenado sobre corpus de programación habituales en la familia Llama.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno, aunque el contexto máximo no está documentado en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: plausible por la naturaleza del modelo base, pero no confirmado en la ficha del repositorio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: sí, por herencia del modelo base R1 destilado.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de álgebra, cálculo y lógica paso a paso, aprovechando las cadenas de pensamiento del destilado R1. La cuantización W4A4 reduce el coste por token, lo que lo hace viable para volúmenes altos de consultas.
- Generación de código en pipelines de CI/CD: integrado mediante vLLM, puede generar parches, tests unitarios o explicaciones de errores de compilación. El formato compressed-tensors permite servirlo con el backend de vLLM sin conversión adicional.
- Despliegue en hardware con soporte MXFP4: al emplear microescalado de bloques, es adecuado para GPUs con aceleración nativa de MXFP4, reduciendo el uso de memoria frente a versiones en FP16 o BF16.
- Prototipado de agentes de razonamiento: el modelo puede emplearse como componente de razonamiento en sistemas multi-agente donde el coste por inferencia es crítico, gracias a sus 8B parámetros y cuantización a 4 bits.
- Educación y tutoría automatizada: explicaciones paso a paso de conceptos técnicos, con la ventaja de que el modelo puede mostrar su razonamiento intermedio.
- Evaluación de técnicas de cuantización: este checkpoint sirve como referencia para investigadores que comparan QAT W4A4 frente a PTQ en modelos de razonamiento de 8B, midiendo la degradación en tareas de matemáticas y código.
- Inferencia de bajo coste en producción: el tamaño de repo de 5,8 GB permite cargar el modelo en GPUs de gama media-alta con menos VRAM que la versión original en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,8 GB en safetensors MXFP4; se requiere VRAM adicional para el KV cache y las activaciones, por lo que un despliegue realista parte de aproximadamente 8-10 GB según longitud de contexto.
- GPU recomendadas: H100, H200 y B200 para aprovechar el soporte nativo de MXFP4; A100 puede ejecutar el modelo pero sin aceleración específica para microescalado FP4.
- GPU de consumo: cabe en RTX 4090 (24 GB) y potencialmente en RTX 4080 (16 GB) con contextos moderados; en GPUs con menos de 12 GB requeriría offloading.
- Opciones de despliegue: vLLM es la opción principal (la librería declarada y el formato compressed-tensors están soportados); llama.cpp y Ollama no están confirmados para este formato MXFP4 específico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B-MXFP4-QAD-W4A4 (este) | 8,03B | no disponible | MXFP4 W4A4 con QAT | MIT | Gated en Hugging Face |
| DeepSeek-R1-Distill-Llama-8B (base) | 8,03B | 128K (según documentación pública del modelo base) | BF16/FP16 original | MIT | Pública en Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 128K (según documentación pública) | BF16/FP16 original | MIT | Pública en Hugging Face |
| Llama-3.1-8B-Instruct | 8,03B | 128K | BF16/FP16 original | Llama 3.1 Community License | Pública en Hugging Face |

La comparativa se limita a parámetros, licencia y disponibilidad, ya que no se han publicado benchmarks de esta versión cuantizada. La ventaja principal frente al modelo base es la reducción de memoria (5,8 GB frente a aproximadamente 16 GB en BF16) y el potencial de mayor throughput en hardware con soporte MXFP4; la desventaja es la posible degradación de calidad por la cuantización a 4 bits y la restricción de acceso gated.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en pipelines.
- Degradación por cuantización: el esquema W4A4 es agresivo; aunque el QAT mitiga la pérdida, es esperable cierta degradación en tareas de razonamiento matemático y código frente al modelo base en BF16. No se han publicado métricas que cuantifiquen esta pérdida.
- Riesgo de alucinación: inherente a los modelos de lenguaje, especialmente en cadenas de razonamiento largas donde el modelo puede generar pasos plausibles pero incorrectos.
- Sesgos: no se dispone de información sobre evaluación de sesgos en la información proporcionada; el modelo base hereda los sesgos de sus datos de entrenamiento.
- Limitaciones de idioma: no se dispone de la lista de idiomas soportados; el modelo base está orientado principalmente al inglés y al chino, por lo que el rendimiento en castellano puede ser inferior.
- Contexto: la longitud de contexto no está documentada en la ficha del repositorio; debe consultarse la del modelo base antes de desplegarlo en aplicaciones con ventanas largas.
- Compatibilidad de hardware: el formato MXFP4 requiere soporte específico; en GPUs sin aceleración nativa puede degradarse el rendimiento o requerir rutas de emulación.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base (DeepSeek-R1-Distill-Llama-8B) por si impusieran restricciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qatfactory/DeepSeek-R1-Distill-Llama-8B-MXFP4-QAD-W4A4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Paper de DeepSeek-R1: no disponible en la información proporcionada
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Documentación de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
