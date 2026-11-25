# mradermacher/Gemma-4-27B-AgentCoder-GGUF

## Resumen
Gemma-4-27B-AgentCoder-GGUF es la distribucion en formato GGUF del modelo Gemma-4-27B-AgentCoder, publicada por el usuario mradermacher en Hugging Face. Se trata de una conversión estática de los pesos originales del repositorio br1-pist/Gemma-4-27B-AgentCoder, orientada a su despliegue con motores de inferencia compatibles con GGUF, como llama.cpp u Ollama. El nombre sugiere una especialización en tareas de agente y generación de código, aunque la model card no aporta documentación técnica adicional.

El repositorio contiene únicamente los pesos cuantizados y no incluye información sobre la arquitectura interna, los datos de entrenamiento ni los procesos de alineación aplicados. El dato verificable es el recuento de parámetros de los safetensors originales, que asciende a 25.233.142.046 parámetros, lo que sitúa al modelo en la categoría de aproximadamente 25.000 millones de parámetros. El tamaño del repositorio es de 17,5 GB, coherente con un conjunto de cuantizaciones que incluye desde Q2_K hasta F16.

La relevancia de esta ficha es limitada en términos de documentación: se publica sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks. Para un evaluador técnico, esto implica que cualquier uso en producción requiere validación empírica propia antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, sin confirmar) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura interna del modelo base Gemma-4-27B-AgentCoder. El nombre sugiere una variante de la familia Gemma, pero la model card no confirma la arquitectura, el número de capas, la dimensión de los embeddings ni el tipo de atención. Tampoco se documenta si emplea mezcla de expertos, atención lineal u otras innovaciones.

Respecto al entrenamiento, no hay datos sobre el número de tokens, la composición del dataset, la presencia de fases de RLHF, DPO o fine-tuning supervisado, ni sobre el proceso de destilación o ajuste específico para tareas de agente y código. La única información técnica procedente de la model card son los metadatos de la herramienta de cuantización (quantize_version 2, output_tensor_quantised 1, convert_type hf), que indican que los pesos se convirtieron desde el formato Hugging Face antes de cuantizarse.

## Capacidades
- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Especialización presumible en tareas de agente y generación de código, derivada del nombre del modelo; no confirmada documentalmente.
- Compatibilidad con endpoints de inferencia, según la etiqueta "endpoints_compatible".
- Soporte de tool calling, agentes multi-paso y razonamiento extendido: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso
- Despliegue en local con llama.cpp u Ollama: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en equipos con GPU de consumo, útil para pruebas de generación de código sin depender de servicios en la nube.
- Asistente de programación en IDE: si la especialización en código se confirma, podría integrarse en extensiones tipo Continue o similares mediante un servidor compatible con la API de OpenAI.
- Automatización de tareas de agente: el nombre sugiere soporte para flujos multi-paso, aunque requiere validación empírica antes de usarlo en pipelines de producción.
- Prototipado de chatbots conversacionales: la etiqueta "conversational" indica que el modelo está pensado para diálogo multi-turno, adecuado para pruebas internas.
- Evaluación comparativa de cuantizaciones: el repositorio incluye doce variantes, lo que permite medir la degradación de calidad entre Q2_K y F16 en una misma tarea.
- Fine-tuning posterior sobre GGUF: no recomendado directamente; para ajuste fino habría que partir del modelo base en safetensors.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 5-7 GB en Q2_K, 8-10 GB en Q4_K_M, 12-14 GB en Q6_K y 16-18 GB en Q8_0, calculados a partir del recuento de parámetros y del tamaño del repositorio; no confirmados por el autor.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q6_K y Q8_0; RTX 4080 o 4070 Ti (16 GB) para Q4_K_M y Q5_K_M; A100 o H100 para F16 y despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, en Q4_K_M o inferiores con GPUs de 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; vLLM y TGI requieren los pesos en safetensors, no en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma-4-27B-AgentCoder-GGUF | 25,2 B | no disponible | no disponible | GGUF |
| Gemma 2 27B (referencia de familia) | 27 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF |
| Qwen2.5-Coder-32B | 32,5 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF |
| Codestral 25.01 | 22 B | 256.000 tokens | MNPL (no comercial) | safetensors |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a parámetros, contexto y licencia. La ausencia de licencia declarada es una desventaja frente a alternativas con términos claros.

## Limitaciones y advertencias
- Licencia no declarada: no se puede confirmar el uso comercial permitido; tratar como no apto para producción hasta aclararlo con el autor.
- Sin información sobre sesgos, datos de entrenamiento ni procesos de alineación.
- Riesgo de alucinación desconocido; no hay evaluaciones publicadas.
- Idiomas soportados no documentados; el rendimiento en castellano no está garantizado.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad en tareas de código; se recomienda Q4_K_M o superior.
- El modelo base procede de un autor no verificado (br1-pist); conviene auditar los pesos antes de usarlos en entornos sensibles.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma-4-27B-AgentCoder-GGUF
- Modelo base: https://huggingface.co/br1-pist/Gemma-4-27B-AgentCoder
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
