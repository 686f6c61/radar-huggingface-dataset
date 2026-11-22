# OpenUncensored/DeepSeek-V4.1-Flash-1017-Uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored es un fine-tune del modelo DeepSeek-V4.1-Flash-1017 publicado por OpenUncensored, un proyecto que mantiene una API y un ranking de modelos sin censura. El modelo base es un transformer de tipo mixture-of-experts (MoE) desarrollado por DeepSeek, con 763.205.315.794 parámetros totales según los safetensors del repositorio y un peso en disco de 510,3 GB. La intervención de OpenUncensored elimina las direcciones de rechazo mediante ablación direccional sobre los pesos, manteniendo el mismo formato FP8/FP4 y el mismo código de inferencia que el original.

El problema que aborda es el de los rechazos (refusals) en modelos alineados: el autor afirma que su edición responde por completo a 37 de 48 peticiones dañinas de un conjunto de evaluación, frente a 9 del modelo original, sin degradación medible en MMLU (87,89% frente a 88,16%). Frente a otras builds sin censura del mismo modelo, que según el autor pierden unos 3,9 puntos en MMLU, esta mantiene la puntuación dentro del ruido estadístico.

Es relevante ahora porque el modelo base pertenece a la familia DeepSeek V4.1 Flash, una arquitectura MoE con expertos enrutados en FP4 y capas MTP, y porque el autor publica el artefacto `edit.pt` con la matriz de proyección y las intensidades por capa, lo que permite reproducir o estudiar la edición. La licencia es MIT, igual que la del modelo original, y el repositorio incluye pesos en safetensors compatibles con `transformers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con capas MTP y expertos enrutados en FP4; pesos en FP8 e4m3 con escalas de bloque ue8m0 |
| Parámetros totales | 763.205.315.794 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 e4m3 con escalas de bloque ue8m0; expertos enrutados en FP4 (el repo se distribuye en este formato, no se listan otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato original del modelo base, 510,3 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con expertos enrutados almacenados en FP4 y pesos en FP8 e4m3 con escalas de bloque ue8m0. La arquitectura incluye 40 capas, capas MTP (multi-token prediction), embeddings, routers, tablas Engram y un componente de visión, según los nombres de tensor citados en la model card. El repositorio no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La innovación técnica de este fine-tune es el procedimiento de ablación direccional. El autor calcula las activaciones del residual stream colapsado en el último token del prompt para 256 prompts dañinos y 256 inofensivos, en modo chat y en modo thinking, en las 40 capas. A partir de la diferencia de medias por capa y modo construye un subespacio de rechazo de rango 2 (`Q`) con los principales vectores singulares de las capas 8 a 39. Proyecta `Q` fuera de lo que cada capa escribe en el residual stream: la salida de atención (`attn.wo_b`) y la salida completa del feed-forward, incluidos los 384 expertos enrutados (`ffn.experts.*.w2`) y el experto compartido. La intensidad por capa y componente se elige con una búsqueda multiobjetivo (Optuna) sobre rechazos en prompts reservados y deriva respecto al original en prompts inofensivos. La edición se aplica a 5.815 tensores decodificados a float32 y reencodeados a FP8/FP4 con nuevas escalas de bloque potencia de dos y redondeo estocástico. El resto de tensores (capas MTP, embeddings, routers, tablas Engram, visión) queda byte a byte idéntico al original.

## Capacidades

- Generación de texto conversacional en modo chat y en modo thinking, con dos modos de rechazo distintos según el autor.
- Razonamiento y conocimiento general: el autor reporta MMLU de 87,89% y MMLU-Pro de 80,36% en modo thinking con tope de 1.536 tokens.
- Respuesta a peticiones que el modelo original rechazaría: 37 de 48 peticiones dañinas respondidas por completo y 11 parcialmente, frente a 9 y 37 respectivamente en el original.
- Capacidad de visión heredada del modelo base (el componente de visión se mantiene intacto en la edición).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica que las tareas largas de agente aún no se han medido.
- Capacidades multilingües: no disponible.
- Modo thinking: sí, el propio procedimiento de ablación distingue entre modo chat y modo thinking.

## Casos de uso

- Investigación sobre alineación y rechazos: el artefacto `edit.pt` permite reaplicar la proyección sobre los pesos originales y estudiar cómo se distribuye la dirección de rechazo entre atención, experto compartido y expertos enrutados, con intensidades por capa documentadas.
- Red teaming y evaluación de seguridad: el modelo sirve como sujeto de pruebas para medir la robustez de clasificadores de contenido y de jueces automáticos frente a un modelo con los rechazos eliminados.
- Generación de código y explicaciones técnicas sin filtros: el modelo responde a peticiones como explicar una inyección SQL con ejemplo funcional, útil en entornos de formación en seguridad donde el filtrado impide ejemplos realistas.
- Despliegue en infraestructura propia de 8 GPU: el autor documenta la conversión a model parallel 8 con `convert.py` y la ejecución con `torchrun --nproc-per-node 8 generate.py`, lo que permite servirlo en un nodo de 8x H200 sin depender de la API.
- Integración vía API compatible con OpenAI: el endpoint `https://api.openuncensored.com/v1/chat/completions` con el identificador `deepseek-v4.1-flash-1017-uncensored` permite sustituir el modelo en aplicaciones que ya usan el esquema de OpenAI.
- Estudio de la degradación por edición de pesos: comparar MMLU y MMLU-Pro de este modelo con otras builds sin censura del mismo base (por ejemplo, la de dealignai) permite cuantificar el coste de distintos métodos de ablación.
- Evaluación comparativa en rankings: el autor lo sitúa en el primer puesto de su leaderboard de modelos sin censura, lo que lo hace útil como referencia en comparativas de modelos abliterated.

## Benchmarks y rendimiento

Todos los datos son del autor, medidos con el mismo motor de referencia (8x H200, decodificación greedy). Los tamaños de muestra son pequeños (112 preguntas de MMLU-Pro, 48 peticiones dañinas).

| Benchmark | DeepSeek V4.1 Flash 1017 | Este modelo |
|---|---|---|
| MMLU (57 materias x 20 preguntas, solo letra) | 88,16% | 87,89% |
| MMLU-Pro (112 preguntas, 8 por categoría, modo thinking, tope 1.536 tokens) | 81,25% | 80,36% |
| Peticiones dañinas respondidas por completo (48, juez automático) | 9 | 37 |
| Peticiones dañinas respondidas parcialmente | 37 | 11 |
| Peticiones dañinas rechazadas | 2 | 0 |

El autor cita además, como referencia externa, que la build sin censura de dealignai del mismo modelo reporta MMLU 87,63% → 83,77% (−3,86) en el mismo protocolo de 57 x 20. GPQA y tareas largas de agente no se han medido.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 510,3 GB en FP8/FP4; el autor documenta ejecución con model parallel 8, es decir, un nodo de 8 GPU.
- GPU recomendadas: 8x H200 según la configuración de referencia del autor; por tamaño, requiere GPUs de 80 GB o más por dispositivo con paralelismo de 8.
- Cabe en GPU de consumo: no. Con 763.205 millones de parámetros y 510,3 GB de pesos, no es viable en RTX 4090 (24 GB) ni en configuraciones de una sola GPU de consumo.
- Opciones de despliegue: código de inferencia propio de DeepSeek en `inference/` (conversión con `convert.py` y ejecución con `generate.py` vía `torchrun`); API alojada de OpenUncensored compatible con OpenAI. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored (este) | 763,2 B | no disponible | 87,89% | MIT | Hugging Face + API OpenUncensored |
| DeepSeek-V4.1-Flash-1017 (original) | no disponible en la información | no disponible | 88,16% | MIT (según el autor) | Hugging Face (deepseek-ai) |
| Build sin censura de dealignai del mismo base | no disponible | no disponible | 83,77% | no disponible | Hugging Face |
| Otras builds sin censura del mismo base | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita al mismo modelo base y sus variantes sin censura, porque la información proporcionada no incluye datos de modelos de otros desarrolladores.

## Limitaciones y advertencias

- El modelo responde a peticiones dañinas: 37 de 48 completamente y 11 parcialmente en la evaluación del autor, con 0 rechazos. El usuario es responsable del uso y del cumplimiento legal en su jurisdicción, según la propia model card.
- Sesgos conocidos: no disponible; la información proporcionada no documenta sesgos demográficos, culturales ni lingüísticos.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor no reporta métricas de factualidad.
- Idiomas soportados: no disponible; el modelo base no detalla cobertura lingüística en la documentación facilitada.
- Longitud de contexto: no disponible; no se indica la ventana máxima ni su comportamiento en contextos largos.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el autor no ofrece garantías y traslada la responsabilidad legal al usuario.
- Caveats de producción: los benchmarks tienen muestras pequeñas (112 preguntas de MMLU-Pro, 48 peticiones dañinas) y el propio autor advierte que diferencias de una o dos preguntas son ruido; GPQA y tareas de agente no se han medido. El despliegue requiere 8 GPU de 80 GB o más y el código de inferencia propio de DeepSeek, sin soporte documentado de vLLM, llama.cpp, Ollama o TGI.
- La edición se aplicó sobre pesos FP8/FP4 con redondeo estocástico; el autor indica que la medición de MMLU-Pro se hizo con la edición a precisión completa antes de escribirla en los pesos, mientras que MMLU y los datos de cumplimiento corresponden a los ficheros exactos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenUncensored/DeepSeek-V4.1-Flash-1017-Uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- API de OpenUncensored: https://openuncensored.com
- Endpoint compatible con OpenAI: https://api.openuncensored.com/v1/chat/completions
- Ranking de modelos sin censura: https://openuncensored.com/rankings
