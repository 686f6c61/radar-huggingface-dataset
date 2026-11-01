# sivelsguy/DictaLM-3.0-1.7B-Instruct-q4f16_1-MLC

## Resumen

DictaLM-3.0-1.7B-Instruct en formato MLC (`q4f16_1`) es una conversión del modelo instructivo hebreo de Dicta (dicta-il/DictaLM-3.0-1.7B-Instruct), publicada por el usuario sivelsguy. El objetivo no es entrenar un modelo nuevo, sino empaquetar los pesos originales en el formato que consume MLC LLM y WebLLM, de modo que el modelo pueda ejecutarse íntegramente en el navegador mediante WebGPU sin backend de servidor. El modelo base emplea la arquitectura Qwen3-1.7B, por lo que esta conversión reutiliza la librería precompilada de WebLLM para Qwen3-1.7B.

El modelo resuelve el problema de desplegar un LLM especializado en hebreo en entornos cliente (aplicaciones web, extensiones, demos educativas) con requisitos mínimos de infraestructura. Con 1.700 millones de parámetros y cuantización de 4 bits, el repositorio ocupa aproximadamente 1 GB, lo que lo hace viable en equipos de consumo con GPU integrada o dedicada que soporte WebGPU.

Es relevante ahora porque WebLLM permite inferencia local en el navegador con aceleración GPU, y este paquete ofrece una vía lista para usar con un modelo instructivo en hebreo. La ficha se centra en la conversión MLC; los detalles de entrenamiento, dataset y benchmarks corresponden al modelo base de Dicta y no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3-1.7B) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuración de ejemplo (`context_window_size: 4096`); el máximo del modelo base no está documentado en la información disponible |
| Tipos de cuantizacion | q4f16_1 (pesos de 4 bits, activaciones en fp16) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC (mlc-llm), con `mlc-chat-config.json` y librería WebGPU precompilada |

## Arquitectura y entrenamiento

La conversión mantiene la arquitectura del modelo base: un transformer decoder-only con la estructura de Qwen3-1.7B. El proceso de conversión a MLC reutiliza la librería precompilada `Qwen3-1.7B-q4f16_1_cs1k-webgpu.wasm` de WebLLM, y el diseño de pesos y el `mlc-chat-config.json` replican los de `mlc-ai/Qwen3-1.7B-q4f16_1-MLC`. Los ficheros del tokenizer provienen del modelo original de Dicta. La cuantización q4f16_1 reduce los pesos a 4 bits con activaciones en fp16, lo que permite ejecutar el modelo en el navegador con WebGPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Estos datos corresponden al modelo original de Dicta y no están incluidos en la información proporcionada. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia conversión a MLC y su integración con WebLLM.

## Capacidades

- Generación de texto en hebreo: el modelo está especializado en este idioma y su tokenizer está adaptado al mismo.
- Modo instructivo: el modelo base es de tipo Instruct, por lo que responde a instrucciones y preguntas en formato conversacional.
- Conversación multi-turno: soporta diálogos con contexto de hasta 4096 tokens en la configuración de ejemplo.
- Ejecución en navegador: gracias a MLC y WebLLM, la inferencia se realiza en el cliente mediante WebGPU, sin necesidad de servidor.
- Integración en aplicaciones web: el paquete incluye la configuración necesaria para cargar el modelo desde una URL de HuggingFace en una aplicación WebLLM.
- Capacidades de tool calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Aplicaciones educativas de hebreo en el navegador: el modelo se usa en la aplicación open source *Parle* para aprendizaje de hebreo; al ejecutarse en el cliente, no requiere enviar datos del usuario a un servidor.
- Demos y prototipos web sin backend: un desarrollador puede integrar el modelo en una página con WebLLM cargando el paquete desde HuggingFace y obtener generación de texto en hebreo sin desplegar infraestructura.
- Asistentes de escritura en hebreo en el navegador: el modelo puede ayudar a redactar o completar texto en hebreo dentro de editores web, con la ventaja de que el procesamiento es local.
- Traducción y adaptación de contenidos en hebreo: para tareas de reescritura, resumen o adaptación de textos en hebreo en herramientas web ligeras.
- Chatbots de atención al cliente en hebreo para sitios web: al ejecutarse en el navegador, puede ofrecer respuestas conversacionales sin coste de servidor, aunque con las limitaciones de un modelo de 1.7B.
- Pruebas de concepto de inferencia local en WebGPU: útil para evaluar el rendimiento de modelos instructivos en el navegador antes de migrar a un despliegue con backend.
- Extensiones de navegador para práctica de idiomas: el modelo puede generar ejercicios o corregir respuestas en hebreo de forma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa aproximadamente 1 GB en cuantización q4f16_1; la memoria necesaria en GPU depende del navegador y de la implementación WebGPU, pero el tamaño de pesos es de alrededor de 1 GB.
- GPU recomendadas: no disponible en la información proporcionada. Al ejecutarse en WebLLM, requiere un navegador con soporte de WebGPU y una GPU compatible.
- ¿Cabe en GPU de consumo? El tamaño de pesos (aproximadamente 1 GB) sugiere que puede ejecutarse en GPUs de consumo con soporte WebGPU, pero no se documentan modelos concretos ni requisitos mínimos.
- Opciones de despliegue: MLC LLM y WebLLM (navegador con WebGPU). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este paquete concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sivelsguy/DictaLM-3.0-1.7B-Instruct-q4f16_1-MLC | 1.7B | 4096 (config. de ejemplo) | MLC / WebLLM | Apache-2.0 | HuggingFace, ejecución en navegador |
| dicta-il/DictaLM-3.0-1.7B-Instruct | 1.7B | no disponible | safetensors (modelo base) | Apache-2.0 | HuggingFace |
| mlc-ai/Qwen3-1.7B-q4f16_1-MLC | 1.7B | no disponible | MLC / WebLLM | Apache-2.0 | HuggingFace, ejecución en navegador |

La comparación con Qwen3-1.7B es relevante porque la conversión reutiliza su librería precompilada y su configuración; la diferencia principal es el tokenizer y los pesos, adaptados al hebreo en el caso de DictaLM.

## Limitaciones y advertencias

- El modelo está especializado en hebreo; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Al ser una conversión de cuantización a 4 bits, puede haber una pérdida de precisión respecto al modelo base en formato completo.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad, sesgos o tasas de alucinación.
- El contexto de ejemplo es de 4096 tokens; no se documenta el máximo real del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base de Dicta y de la librería de WebLLM.
- La ejecución en navegador depende de WebGPU y de la GPU del cliente; la compatibilidad y el rendimiento pueden variar.
- El repositorio tiene un número muy bajo de descargas (21) y ningún like, lo que sugiere poca validación por parte de la comunidad.
- No se documentan capacidades de tool calling, agentes o visión; no deben asumirse.

## Enlaces

- [sivelsguy/DictaLM-3.0-1.7B-Instruct-q4f16_1-MLC en HuggingFace](https://huggingface.co/sivelsguy/DictaLM-3.0-1.7B-Instruct-q4f16_1-MLC)
- [dicta-il/DictaLM-3.0-1.7B-Instruct (modelo base)](https://huggingface.co/dicta-il/DictaLM-3.0-1.7B-Instruct)
- [Dicta](https://dicta.org.il)
- [WebLLM (GitHub)](https://github.com/mlc-ai/web-llm)
- [mlc-ai/Qwen3-1.7B-q4f16_1-MLC](https://huggingface.co/mlc-ai/Qwen3-1.7B-q4f16_1-MLC)
