# ifx-pse-sys-ml/spark-13m-base

## Resumen

spark-13m-base es un modelo de lenguaje pequeño (SLM) de 13,2 millones de parámetros, desarrollado por el equipo ifx-pse-sys-ml. Se trata de un modelo base (no instructivo) en inglés, preentrenado con una receta inspirada en SmolLM sobre una mezcla de texto educativo web y libros de texto sintéticos. Su propósito declarado es servir como banco de pruebas para investigación en modelos pequeños, experimentación rápida y como backbone ligero de decodificador, siendo aproximadamente 10 veces más pequeño que SmolLM-135M.

Arquitectónicamente sigue un diseño tipo Llama con atención por consultas agrupadas (GQA), 6 capas, dimensión oculta de 384, contexto de 512 tokens y un vocabulario BPE inglés de 6400 entradas. Se entrenó con 100 mil millones de tokens procedentes de FineWeb-Edu (deduplicado), Cosmopedia-v2 y TinyStories, con descontaminación frente a los benchmarks de evaluación. El modelo se distribuye bajo licencia Apache-2.0 y está disponible en formato safetensors y PyTorch nativo.

Su relevancia actual radica en que permite estudiar el comportamiento de modelos extremadamente pequeños en tareas de generación de texto, servir como base para fine-tuning en dominios muy específicos y actuar como text backbone para modelos multimodales pequeños (VLM) gracias a su soporte de `inputs_embeds`. No obstante, sus capacidades de conocimiento y razonamiento están muy cerca del azar, por lo que no es adecuado para tareas que requieran comprensión profunda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador tipo Llama (GQA, RoPE) |
| Parametros totales | 13.227.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, pytorch_model.pth |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo Llama con 6 capas, dimensión oculta de 384, 6 cabezas de atención y 2 cabezas KV (GQA), dimensión intermedia de 1216, embeddings rotatorios (RoPE) y un vocabulario BPE inglés de 6400 tokens. El contexto máximo es de 512 tokens, lo que limita su uso a fragmentos de texto cortos.

El preentrenamiento se realizó sobre 100 mil millones de tokens con una mezcla de tres fuentes: FineWeb-Edu deduplicado (72 %), Cosmopedia-v2 (25 %) y TinyStories (3 %), replicando la receta del corpus SmolLM. Los datos fueron descontaminados frente a los benchmarks de evaluación. No se menciona el uso de RLHF, DPO ni ningún ajuste posterior; es un modelo base puro. El entrenamiento se llevó a cabo con el código de la suite Nexus.

Una característica técnica destacable es que el modelo acepta `inputs_embeds` además de `input_ids`, lo que permite inyectar tokens visuales desde un proyector externo y usarlo como backbone de texto para un VLM pequeño.

## Capacidades

- Generacion de texto autoregresivo en ingles, con soporte de muestreo (temperature, top-p) y generacion con `max_new_tokens`.
- Acepta `inputs_embeds` para integracion como backbone de texto en modelos multimodales (VLM) pequenos.
- Capacidad de fine-tuning para tareas especificas con vocabulario reducido (por ejemplo, clasificacion de texto corto, generacion de frases en dominios acotados).
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni vision propia (solo via proyector externo).
- Multilingue: no, solo ingles.

## Casos de uso

- Investigacion academica en modelos de lenguaje pequenos: permite estudiar el efecto de la escala, la composicion del corpus y las tecnicas de regularizacion en un entorno de computo reducido.
- Prototipado rapido de pipelines de generacion de texto: al ser extremadamente ligero, se puede iterar sobre el prompt, la decodificacion y los hiperparametros sin necesidad de GPUs potentes.
- Ensenanza de arquitecturas transformer: su tamano reducido y su codigo simple facilitan la visualizacion de atencion, embeddings y capas en entornos educativos.
- Backbone de texto para VLM pequenos: gracias a `inputs_embeds`, se puede conectar a un proyector de vision para experimentar con modelos multimodales compactos.
- Fine-tuning para tareas de clasificacion de texto corto (por ejemplo, analisis de sentimiento en frases breves) donde el vocabulario limitado y el contexto de 512 tokens son suficientes.
- Generacion de texto en entornos con restricciones extremas de memoria o energia, como dispositivos embebidos o microcontroladores, siempre que la tarea sea muy simple.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion con lm-evaluation-harness 0.4, usando el mismo harness y el mismo numero de shots para todos los modelos, por lo que las columnas son directamente comparables.

| Benchmark | chance | spark-13m-base | SmolLM-135M |
|---|---|---|---|
| hellaswag | 25 | 28.6 | 42.6 |
| arc_easy | 25 | 37.7 | 56.1 |
| arc_challenge | 25 | 25.2 | 28.9 |
| piqa | 50 | 58.8 | 68.4 |
| winogrande | 50 | 52.0 | 53.2 |
| openbookqa | 25 | 26.0 | 34.0 |
| commonsense_qa | 20 | 20.0 | 19.8 |
| mmlu | 25 | 23.2 | 25.2 |
| **average** | — | **33.9** | **41.0** |

El modelo se sitúa cerca del azar en tareas de conocimiento y razonamiento (MMLU, OpenBookQA, ARC-Challenge), lo que confirma que su capacidad es limitada por el tamaño, no por los datos.

## Requisitos de hardware

- VRAM estimada: con 13,2 millones de parametros, en fp32 ocupa aproximadamente 53 MB; en fp16 unos 26 MB; en int8 unos 13 MB. Cabe en cualquier GPU, incluso en las mas modestas, y tambien en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; tambien se puede ejecutar en CPU sin problemas.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo (GTX 1050, RTX 2060, etc.) es mas que suficiente.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), tambien se puede exportar a ONNX o convertir a GGUF para usar con llama.cpp u Ollama, aunque no hay cuantizaciones publicadas.
- Latencia y throughput: no disponible; al ser un modelo tan pequeno, la latencia sera del orden de milisegundos en GPU y de decenas de milisegundos en CPU, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

La unica comparativa publicada es con SmolLM-135M, que es aproximadamente 10 veces mayor. No se dispone de datos de otros modelos de tamano similar (por ejemplo, TinyLlama-1.1B o Qwen2.5-0.5B) en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Media de benchmarks |
|---|---|---|---|---|
| spark-13m-base | 13,2 M | 512 | Apache-2.0 | 33,9 |
| SmolLM-135M | 135 M | 2048 | Apache-2.0 | 41,0 |

La diferencia de rendimiento (33,9 frente a 41,0) refleja la brecha de capacidad, no de datos, como indica el autor.

## Limitaciones y advertencias

- Rendimiento cercano al azar en tareas de conocimiento y razonamiento (MMLU, OpenBookQA, ARC-Challenge); no es util para tareas que requieran comprension semantica profunda.
- Contexto limitado a 512 tokens, lo que impide manejar documentos largos o conversaciones extensas.
- Solo ingles; no soporta otros idiomas.
- Modelo base sin ajuste instructivo: no sigue instrucciones ni mantiene dialogos coherentes sin fine-tuning previo.
- Vocabulario reducido (6400 tokens BPE) que puede limitar la representacion de palabras poco frecuentes o tecnicas.
- Riesgo de alucinacion alto en tareas generativas, dado su tamano y su bajo rendimiento en benchmarks.
- No se han publicado cuantizaciones oficiales; el despliegue en entornos muy restringidos requerira conversion manual.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es adecuado para produccion real debido a sus limitaciones de capacidad.

## Enlaces

- HuggingFace: https://huggingface.co/ifx-pse-sys-ml/spark-13m-base
- Repositorio de evaluacion (lm-evaluation-harness): https://github.com/EleutherAI/lm-evaluation-harness
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web.
