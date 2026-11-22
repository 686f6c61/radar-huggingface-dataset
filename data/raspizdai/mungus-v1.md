# RaspizdAI/mungus-v1

## Resumen

mungus-v1 es un modelo de generación de texto en ruso de 27.781.427.952 parámetros, publicado por el colectivo RaspizdAI, que parte del modelo base Qwen/Qwen3.8-27B. Se trata de un ajuste fino orientado a producir respuestas cortas, estilísticamente homogéneas y en ruso, con una traza de razonamiento visible antes de cada respuesta final. El modelo se presenta como un fine-tune de estilo marcado (el autor lo describe como "30% femboyism y 70% aggression"), lo que lo aleja de los asistentes genéricos y lo sitúa en el terreno de los modelos de nicho con personalidad definida.

Técnicamente reutiliza la arquitectura híbrida `Qwen3_5ForConditionalGeneration`, un backbone visión-lenguaje que aquí se emplea únicamente para generación de texto, aunque conserva el torreón visual intacto en el checkpoint. La innovación arquitectónica más relevante es la combinación de atención completa (16 capas, una de cada cuatro) con 48 capas de atención lineal basadas en Gated DeltaNet, lo que reduce el coste computacional en contextos largos. El contexto declarado alcanza los 262.144 tokens.

El modelo es relevante para quienes investigan ajustes finos con estilos controlados, trazas de razonamiento separadas de la respuesta y arquitecturas híbridas de atención lineal en la familia Qwen. Su licencia CC-BY-SA-4.0 con atribución obligatoria y cláusula de código abierto para derivados condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: atención completa + atención lineal Gated DeltaNet, con torre de visión) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bfloat16 nativo; 4-bit NF4 con bitsandbytes (double quant) documentado por el autor |
| Idiomas soportados | ruso (ru) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (18 shards, 55,6 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen3_5ForConditionalGeneration`, un backbone híbrido visión-lenguaje. Del total de parámetros, 24.777.901.056 corresponden al texto y 460.730.096 a la torre de visión (27 capas, hidden 1152, patch 16, spatial merge 2), que se mantiene intacta en el checkpoint aunque el pipeline declarado sea text-generation. La atención combina 16 capas de atención completa (una de cada cuatro) con 48 capas de atención lineal Gated DeltaNet (16 cabezas de clave, 48 de valor, dimensión de cabeza 128, kernel de convolución 4). La atención completa usa 24 cabezas de consulta de dimensión 256 y 4 cabezas KV (GQA), con output gate. El FFN es SwiGLU con tamaño intermedio 17.408. El vocabulario es de 248.320 tokens, con embeddings y lm_head no atados (1.271.398.400 parámetros cada uno). La codificación posicional es RoPE parcial (factor 0.25, theta 1e7) con M-RoPE intercalado. Precisión bfloat16.

El entrenamiento se realizó sobre un dataset propio de instrucciones y respuestas en ruso, con respuestas cortas y de estilo consistente, y cada muestra incluye una traza de razonamiento en inglés. El bloque de razonamiento se separa de la respuesta final durante el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en ruso con estilo propio y respuestas breves.
- Traza de razonamiento visible antes de cada respuesta final (bloque de thinking separado).
- Razonamiento multi-paso implícito en la traza, útil para depuración de cadenas de pensamiento.
- Procesamiento de imagen y texto a nivel de arquitectura (torre de visión conservada), aunque el pipeline declarado es text-generation y no se documenta su uso práctico.
- Capacidades multilingües limitadas: el único idioma declarado es el ruso; la traza de razonamiento se genera en inglés.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes ni de decodificación especulativa.

## Casos de uso

- Asistentes conversacionales en ruso con personalidad definida: el modelo mantiene un registro estilístico consistente y respuestas cortas, adecuado para productos de nicho donde la voz del asistente es parte de la propuesta.
- Generación de contenido editorial en ruso: artículos breves, respuestas de FAQ o microcopy con tono homogéneo, aprovechando el ajuste sobre un dataset de estilo controlado.
- Investigación sobre trazas de razonamiento: al separar el bloque de pensamiento de la respuesta, facilita el estudio de cadenas de razonamiento y su evaluación independiente de la salida final.
- Evaluación de arquitecturas híbridas de atención lineal: sirve como banco de pruebas para medir el comportamiento de Gated DeltaNet frente a atención completa en contextos de hasta 262.144 tokens.
- Clasificación y resumen de documentos largos en ruso: el contexto de 262.144 tokens permite procesar contratos, informes o hilos completos sin truncamiento.
- Fine-tuning posterior sobre dominios verticales en ruso: al ser un modelo de 27,8B con licencia abierta y pesos safetensors, es base para ajustes con LoRA o QLoRA en 4-bit sobre una sola GPU de 80 GB o, con cuantización, en GPUs de consumo.
- Despliegue en entornos con restricciones de atribución: la licencia CC-BY-SA-4.0 obliga a mantener la atribución a RaspizdAI y a abrir el código de los derivados, lo que encaja en proyectos de investigación y comunidades abiertas.

## Benchmarks y rendimiento

La model card incluye una imagen titulada "Quad-Bench Results" sin valores numéricos en texto. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 56 GB, según el propio autor (checkpoint de 55,6 GB).
- GPU recomendadas para bf16: A100 80 GB o H100 80 GB; también válidas configuraciones multi-GPU con `device_map="auto"`.
- Cuantización 4-bit NF4: el autor documenta su uso en una única GPU de consumo; la VRAM resultante no se especifica en la información disponible, pero por el tamaño del modelo se sitúa por encima de los 16 GB.
- Cabe en GPU de consumo solo con cuantización de 4 bits; no cabe en bf16 en tarjetas de 24 GB.
- Opciones de despliegue documentadas: transformers con `AutoModelForCausalLM` y `BitsAndBytesConfig`. No se documentan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Parámetros de generación recomendados por el autor: `max_new_tokens` de al menos 512 (la respuesta visible va después del bloque de razonamiento), `temperature` 0.7, `top_p` 0.8, `top_k` 20, `repetition_penalty` 1.05. La decodificación greedy tiende a producir trazas largas y repetitivas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| RaspizdAI/mungus-v1 | 27,78B | 262.144 | ru | CC-BY-SA-4.0 | Fine-tune estilístico con traza de razonamiento |
| Qwen/Qwen3.8-27B (modelo base) | no disponible en la información | no disponible | no disponible | no disponible | Base del fine-tune; arquitectura Qwen3_5 |
| Alternativas de 27B en ruso | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos de estilo: el autor declara explícitamente una personalidad marcada ("30% femboyism y 70% aggression"), lo que puede producir respuestas con tono agresivo o inapropiado en contextos profesionales.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad; al ser un fine-tune sobre un dataset propio de estilo, la fidelidad factual no está garantizada.
- Limitación idiomática: solo se declara ruso; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Traza de razonamiento en inglés: el bloque de pensamiento se genera en inglés aunque la respuesta sea en ruso, lo que puede introducir inconsistencias y complica el filtrado en producción.
- Licencia CC-BY-SA-4.0: obliga a atribución a RaspizdAI, a indicar cambios y a abrir el código de los modelos derivados; incompatible con despliegues de código cerrado y con ciertos usos comerciales.
- El modelo conserva la torre de visión pero no se documenta su uso; no debe asumirse capacidad multimodal operativa.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- La decodificación greedy produce trazas largas y repetitivas; requiere muestreo configurado y `max_new_tokens` amplio, lo que incrementa el coste por petición.
- No hay resultados numéricos de benchmarks publicados en texto, solo una imagen sin valores verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaspizdAI/mungus-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Logo del modelo: https://cdn-uploads.huggingface.co/production/uploads/6a1d885bbd8b36b69d8a8727/dddCwqYQpaaDBhCv3xAfC.png
- Gráfico Quad-Bench: https://cdn-uploads.huggingface.co/production/uploads/6a1d885bbd8b36b69d8a8727/MeNEPTRG_U5WVuloA9zuJ.png
