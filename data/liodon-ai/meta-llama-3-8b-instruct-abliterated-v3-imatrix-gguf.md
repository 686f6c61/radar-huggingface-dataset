# liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-imatrix-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `failspy/Meta-Llama-3-8B-Instruct-abliterated-v3`, un derivado "abliterated" de Meta Llama 3 8B Instruct. La "abliteración" es una técnica de modificación de pesos que elimina la dirección de rechazo del modelo, de modo que deja de negarse a responder a ciertas peticiones. Liodon AI publica aquí una versión cuantizada con calibración iMatrix, orientada a inferencia local en llama.cpp, Ollama, LM Studio y Jan.

El modelo subyacente es un transformer decoder-only de 8.030.261.248 parámetros (8B), con la arquitectura y el tokenizador de Llama 3. El contexto nativo de Llama 3 8B Instruct es de 8.192 tokens, aunque la model card de este repositorio no lo explicita. El repositorio ocupa 37 GB e incluye múltiples niveles de cuantización, desde IQ2_M (2,95 GB) hasta Q8_0 (8,54 GB), lo que permite ejecutarlo desde GPUs de gama de entrada hasta equipos con 10 GB de VRAM.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas cuantizaciones iMatrix disponibles para este derivado concreto; por otro, advierte de que se trata de un modelo sin los filtros de seguridad del original, con implicaciones legales y éticas que conviene evaluar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), denso |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens) |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todos con calibracion iMatrix) |
| Idiomas soportados | no disponibles |
| Licencia | other (hereda la licencia Llama 3 del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3 8B: un transformer decoder-only denso con atención multi-cabeza agrupada (GQA), normalización RMSNorm y activación SwiGLU, entrenado originalmente por Meta sobre un corpus multilingüe de varios billones de tokens y posteriormente afinado con instrucciones y preferencias (RLHF/DPO) en la variante Instruct. El modelo intermedio `failspy/Meta-Llama-3-8B-Instruct-abliterated-v3` aplica la técnica de abliteración: se calcula la dirección de rechazo en el espacio de activaciones y se proyectan fuera los pesos correspondientes, de forma que el modelo pierde la tendencia a declinar peticiones sin reentrenamiento adicional.

Sobre esa base, Liodon AI aplica cuantización con calibración iMatrix: se ejecutan 128 fragmentos de calibración (2 millones de tokens de WikiText-103) a través del modelo en precisión completa para estimar la importancia de cada peso, y se asigna más precisión a los pesos críticos. Según la model card, esto mejora la coherencia y el seguimiento de instrucciones en Q2/Q3/Q4 manteniendo el mismo tamaño de archivo. No se documentan detalles adicionales sobre el proceso de abliteración ni sobre posibles ajustes posteriores.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3 8B Instruct.
- Seguimiento de instrucciones y formato de chat con la plantilla de Llama 3.
- Razonamiento básico, resolución de problemas y generación de código a nivel de modelo de 8B.
- Capacidad multilingüe limitada, la del modelo base (no se detalla en la información disponible).
- Respuestas sin rechazo a peticiones que el modelo original declinaría, por efecto de la abliteración.
- No se documenta soporte explícito de tool calling, function calling, agentes o modo thinking en la información proporcionada.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Inferencia local en equipos de gama media: con Q4_K_M (4,92 GB, ~6 GB de VRAM) cabe en GPUs consumer de 8 GB, lo que permite ejecutar un 8B Instruct en portátiles y estaciones de trabajo sin GPU dedicada de gama alta.
- Experimentación en investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated frente al original en tareas de rechazo, sesgo y robustez, comparando respuestas con y sin la modificación.
- Prototipado rápido de asistentes conversacionales: la integración con Ollama y LM Studio permite levantar un endpoint compatible con la API de OpenAI en minutos para pruebas de UX.
- Generación de texto creativo sin restricciones de contenido: útil en entornos controlados de escritura de ficción donde el modelo original rechazaría ciertos temas.
- Evaluación de cuantizaciones: el repositorio ofrece siete niveles de cuantización con y sin iMatrix, lo que permite medir el impacto de la compresión en calidad y latencia sobre un mismo modelo base.
- Despliegue en entornos con CPU: las variantes IQ2_M e IQ3_M (2,95-3,78 GB) permiten ejecución en llama.cpp sobre CPU con RAM modesta, útil para demos offline o sistemas embebidos.
- Fine-tuning ligero sobre GGUF: aunque el formato no es el ideal para entrenamiento, puede servir como base para LoRA en herramientas compatibles, partiendo de un modelo ya desprovisto de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según la model card: IQ2_M ~3 GB, IQ3_M ~4 GB, IQ4_XS ~5 GB, Q4_K_M ~6 GB, Q5_K_M ~7 GB, Q6_K ~8 GB, Q8_0 ~10 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M en adelante; RTX 4090 24 GB para Q8_0 con contexto largo; A100/H100 no son necesarias para un 8B, pero permiten mayor throughput en serving.
- Cabe en GPU consumer: sí, desde GPUs de 6-8 GB con cuantizaciones IQ2/IQ3, y hasta 10 GB con Q8_0.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run hf.co/...`), LM Studio, Jan, y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-imatrix-GGUF | 8,03B | no disponible (base: 8.192) | GGUF iMatrix (IQ2-Q8) | other (Llama 3) | Hugging Face, 189 descargas |
| failspy/Meta-Llama-3-8B-Instruct-abliterated-v3 | 8,03B | 8.192 | safetensors | other (Llama 3) | Hugging Face (modelo base) |
| Meta-Llama-3-8B-Instruct (original) | 8,03B | 8.192 | safetensors, GGUF de terceros | Llama 3 | Hugging Face, amplia adopción |
| liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-GGUF | 8,03B | 8.192 | GGUF sin iMatrix | other (Llama 3) | Hugging Face (variante del mismo autor) |

La comparativa con modelos de otros fabricantes (p. ej. Mistral 7B Instruct o Qwen2.5 7B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado deliberadamente la dirección de rechazo, por lo que puede generar contenido dañino, ilegal o inseguro sin filtros. No es apto para aplicaciones orientadas al público sin moderación adicional.
- Riesgo de alucinación: como todo modelo de 8B, tiende a inventar datos, especialmente en tareas factuales o de razonamiento complejo.
- Idiomas: no se especifican los idiomas soportados; el rendimiento fuera del inglés puede degradarse respecto al modelo base.
- Contexto: la model card no declara la longitud de contexto efectiva; se asume la del base (8.192 tokens), pero no está confirmado.
- Licencia: la licencia "other" remite a la Llama 3 Community License, que impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales) y obligaciones de atribución. La abliteración no exime de cumplirla.
- Cuantización agresiva: IQ2_M e IQ3_M pueden degradar notablemente la coherencia y el seguimiento de instrucciones pese a la calibración iMatrix; para producción se recomienda Q4_K_M o superior.
- Repositorio con pocas descargas (189) y sin likes: no hay evidencia comunitaria de validación de las cuantizaciones publicadas.
- Sin benchmarks publicados: no hay datos objetivos que permitan comparar la calidad de estas cuantizaciones frente a las de otros autores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-imatrix-GGUF
- Modelo base: https://huggingface.co/failspy/Meta-Llama-3-8B-Instruct-abliterated-v3
- Variante sin iMatrix del mismo autor: `liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-GGUF`
- Dataset de calibración: https://huggingface.co/datasets/wikitext
- Perfil del autor: https://huggingface.co/liodon-ai
