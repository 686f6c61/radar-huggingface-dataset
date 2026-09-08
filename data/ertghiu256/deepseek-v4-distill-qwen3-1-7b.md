# ertghiu256/deepseek-v4-distill-qwen3-1.7b

## Resumen

El modelo `ertghiu256/deepseek-v4-distill-qwen3-1.7b` es un modelo de lenguaje de 1.720.574.976 parámetros (1,72B) obtenido mediante fine-tuning de `unsloth/qwen3-1.7b-unsloth-bnb-4bit` sobre el dataset `Jackrong/DeepSeek-V4-Distill-8000x`. El autor, `ertghiu256`, ha utilizado las librerías Unsloth y TRL de Hugging Face para acelerar el entrenamiento. El nombre sugiere que se trata de una destilación del comportamiento del modelo DeepSeek-V4, un MoE de 671B parámetros con 37B activados, sobre una arquitectura densa mucho más pequeña.

El objetivo es ofrecer una versión compacta que imite las capacidades de un modelo gigante, reduciendo drásticamente los requisitos de hardware. Al estar basado en Qwen3, hereda la arquitectura transformer densa de este modelo. Su licencia Apache 2.0 permite uso comercial, y el repositorio incluye pesos en formato safetensors. El modelo está orientado a generación de texto conversacional en inglés, con un tamaño que permite su despliegue en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base `unsloth/qwen3-1.7b-unsloth-bnb-4bit`, que corresponde a un transformer denso de la familia Qwen3. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que permitió una aceleración de aproximadamente 2x respecto a un fine-tuning estándar. El dataset utilizado, `Jackrong/DeepSeek-V4-Distill-8000x`, no está documentado en la información disponible, pero por su nombre se infiere que contiene respuestas o trayectorias de razonamiento generadas por DeepSeek-V4, destinadas a transferir el comportamiento del modelo profesor al modelo estudiante.

El modelo original DeepSeek-V4, según la información encontrada en GitHub, es un Mixture-of-Experts (MoE) con 671B parámetros totales y 37B activados por token, que utiliza Multi-head Latent Attention (MLA) y la arquitectura DeepSeekMoE. Este modelo destilado no implementa MoE, sino que condensa el conocimiento en una red densa de 1,72B parámetros. No se han proporcionado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, heredada de Qwen3.
- No se ha documentado soporte para tool calling, function calling, visión, audio ni modos de razonamiento explícitos.
- Al ser un modelo destilado, puede imitar el estilo de respuesta de DeepSeek-V4, aunque sin garantías de rendimiento.
- No se han publicado evaluaciones que confirmen capacidades avanzadas de razonamiento, matemáticas o código.

## Casos de uso

- Asistente conversacional en inglés para aplicaciones ligeras: el modelo puede desplegarse en entornos con recursos limitados, como servidores CPU o GPUs de consumo, para gestionar consultas sencillas sin depender de APIs externas.
- Chatbot local para privacidad: al ser un modelo pequeño, puede ejecutarse en local, evitando el envío de datos a servicios en la nube en escenarios como atención al cliente interna o prototipos.
- Experimentación con destilación de conocimiento: sirve como ejemplo práctico de cómo transferir el comportamiento de un modelo MoE gigante a un modelo denso pequeño, útil en investigación o docencia.
- Fine-tuning adicional para dominios específicos: su tamaño permite ajustarlo con datasets propios en tareas como clasificación de texto, resúmenes o generación de respuestas en inglés.
- Generación de respuestas en tiempo real en aplicaciones de baja latencia: la arquitectura densa de 1,72B permite tiempos de inferencia reducidos en comparación con modelos de mayor tamaño.
- Uso en pipelines de generación de texto donde se requiere un equilibrio entre calidad y coste computacional, por ejemplo, en sistemas de asistencia documental en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 3,44 GB, por lo que se recomienda al menos 6 GB de VRAM para inferencia con overhead. En cuantización 4-bit, la VRAM necesaria se reduce a alrededor de 1,5 GB, aunque no se han documentado los tipos de cuantización disponibles.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, A10G, o cualquier GPU con 8 GB o más de VRAM. También puede ejecutarse en CPU con cuantización, aunque con mayor latencia.
- Opciones de despliegue: Transformers, vLLM, Text Generation Inference (TGI), y posiblemente llama.cpp u Ollama si se convierte a formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| deepseek-v4-distill-qwen3-1.7b | 1,72B | No aplica | No disponible | Apache 2.0 |
| Qwen3-1.7B (base) | 1,7B | No aplica | No disponible | No disponible |
| DeepSeek-V4 | 671B | 37B | No disponible | No disponible |

La comparativa se limita a los datos disponibles. El modelo destilado comparte arquitectura y tamaño con Qwen3-1.7B, pero no se dispone de información sobre el contexto ni la licencia del modelo base. DeepSeek-V4 es el modelo profesor original, con una arquitectura MoE mucho mayor, pero no se han encontrado datos de rendimiento ni licencia en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se han realizado evaluaciones de sesgos. Al ser un modelo destilado, puede heredar sesgos presentes en el dataset de entrenamiento o en el modelo profesor.
- Riesgo de alucinación: como en todo modelo de lenguaje, existe riesgo de generar contenido falso o inventado, especialmente en un modelo pequeño sin verificación externa.
- Limitaciones de idioma: el modelo está etiquetado únicamente para inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido ampliamente validado y su adopción es mínima (6 descargas en Hugging Face).
- Caveat para producción: al carecer de benchmarks publicados y tener un historial de uso casi nulo, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva previa.
- El dataset de entrenamiento no está documentado, lo que impide conocer la calidad y diversidad de los datos utilizados.

## Enlaces

- Hugging Face: https://huggingface.co/ertghiu256/deepseek-v4-distill-qwen3-1.7b
- GitHub DeepSeek-V4: https://github.com/bailaiOWO/DeepSeek-V4
- Unsloth: https://github.com/unslothai/unsloth
