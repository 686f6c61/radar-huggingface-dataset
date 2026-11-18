# ggml-org/gemma-4-12B-it-GGUF

## Resumen

Gemma 4 12B IT es un modelo multimodal any-to-any de Google, distribuido en formato GGUF por ggml-org para su uso con la pila de inferencia llama.cpp. Se trata de la version instruida (IT) del modelo base Gemma 4 de 12B parametros, con 11.907.350.576 parametros totales confirmados a partir de los pesos en safetensors. La publicacion en GGUF por parte de ggml-org facilita el despliegue local en hardware de consumo y en entornos de servidor sin necesidad de infraestructura propietaria.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin las restricciones adicionales que acompanaban a generaciones anteriores de Gemma. El repositorio incluye variantes cuantizadas del modelo principal y de su modelo asistente (assistant), pensado este ultimo para decodificacion especulativa, asi como versiones QAT (quantization-aware training) en q4_0.

La relevancia actual del modelo radica en tres factores: su tamano de 12B lo situa en el rango de "cabe en una GPU de consumo" con cuantizacion agresiva, su naturaleza any-to-any amplia los casos de uso mas alla del texto, y su conversion automatica a GGUF mediante la herramienta oficial de ggml-org garantiza compatibilidad con llama.cpp, Ollama y derivados. El pipeline declarado es any-to-any, lo que implica soporte de multiples modalidades de entrada y salida, aunque la model card no detalla cuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal any-to-any; detalles no publicados en la informacion disponible) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado; se mencionan variantes QAT q4_0 en los modelos fuente; catalogo completo de quants no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 170,9 GB con multiples variantes); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. El pipeline declarado es any-to-any, lo que indica un modelo multimodal con capacidad de generar y procesar distintas modalidades, pero la model card no especifica si se trata de un transformer denso, un hibrido o una arquitectura con modulos de vision/audio dedicados. El numero de parametros (11,9B) corresponde a un modelo denso de tamano medio, no a un MoE.

Respecto al entrenamiento, la model card no aporta datos sobre el numero de tokens, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO). Si se menciona la existencia de variantes QAT (quantization-aware training) en q4_0, lo que sugiere que Google entreno el modelo teniendo en cuenta la cuantizacion a 4 bits para preservar calidad en ese regimen. Tambien se referencia un modelo "assistant" separado, utilizado habitualmente para decodificacion especulativa en llama.cpp, lo que apunta a un diseno orientado a acelerar la inferencia mediante draft models.

## Capacidades

- Generacion de texto conversacional en modo instruido (IT).
- Procesamiento any-to-any: el pipeline declarado implica soporte de multiples modalidades, aunque la model card no detalla cuales (texto, vision, audio) ni sus limites.
- Compatibilidad con llama.cpp y la app Llama, segun la model card.
- Soporte de decodificacion especulativa mediante el modelo assistant referenciado.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estacion de trabajo: con 11,9B parametros y cuantizacion GGUF, el modelo puede ejecutarse en una GPU de consumo de gama alta (24 GB) o incluso en CPU con cuantizaciones agresivas, lo que permite prototipado sin coste de API.
- Asistente conversacional embebido: la variante IT y el pipeline any-to-any lo hacen adecuado para integrar un chatbot en aplicaciones de escritorio o moviles mediante llama.cpp, con el modelo assistant para reducir latencia.
- Procesamiento multimodal en local: al ser any-to-any, puede emplearse en pipelines que combinen texto con otras modalidades de entrada, aunque el usuario debe verificar en la documentacion del modelo base que modalidades concretas estan soportadas.
- Inferencia en servidor con llama.cpp: el formato GGUF y la compatibilidad con `llama serve` permiten montar un endpoint HTTP compatible con OpenAI en infraestructura propia, util para equipos que requieren soberania de datos.
- Fine-tuning y experimentacion: la licencia Apache 2.0 permite derivar y redistribuir variantes cuantizadas o ajustadas sin las restricciones de generaciones previas de Gemma, lo que facilita su uso en investigacion aplicada.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye multiples variantes (incluidas QAT q4_0), lo que permite medir la degradacion de calidad entre regimenes de cuantizacion en un mismo modelo.
- Integracion en CI/CD para tareas de codigo: no confirmado, ya que la informacion disponible no detalla capacidades de generacion de codigo ni tool calling; se requeriria validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para 11,9B parametros, una estimacion orientativa seria ~24 GB en FP16, ~12-14 GB en 8 bits y ~7-9 GB en 4 bits, aunque estas cifras no las confirma la model card.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar viabilidad en A100, H100, RTX 4090 y GPUs con 16-24 GB de VRAM en cuantizaciones bajas, pero no se confirma.
- Cabe en consumer GPU: probable en cuantizaciones de 4-8 bits en GPUs de 16-24 GB, no confirmado oficialmente.
- Opciones de despliegue: llama.cpp (via `llama serve -hf ggml-org/gemma-4-12B-it-GGUF`), app Llama, y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc., por compatibilidad de formato, no confirmado explicitamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ggml-org/gemma-4-12B-it-GGUF | 11,9B | no disponible | Apache 2.0 | GGUF | Conversion oficial de ggml-org, multimodal any-to-any |
| google/gemma-4-12B-it | 11,9B | no disponible | Apache 2.0 | safetensors | Modelo base original |
| Modelos comparables de 12B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de alternativas concretas en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad; se desconoce el comportamiento en dominios sensibles.
- No se declaran los idiomas soportados, por lo que el rendimiento multilingue es incierto y debe validarse empiricamente.
- La longitud de contexto no esta publicada; no se debe asumir una ventana concreta sin consultar el modelo base google/gemma-4-12B-it.
- Aunque la licencia es Apache 2.0, conviene verificar los terminos del modelo base de Google, ya que la conversion GGUF no altera las obligaciones de la licencia original.
- El repositorio ocupa 170,9 GB, lo que implica requisitos de almacenamiento considerables si se descargan todas las variantes.
- La model card incluye un TODO pendiente ("add dflash"), lo que sugiere que la conversion no esta completamente finalizada.
- La informacion sobre tool calling, agentes y modo thinking no esta disponible; no debe asumirse su soporte en produccion sin pruebas.
- Al ser una conversion automatica, posibles errores de conversion no estan documentados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/gemma-4-12B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo assistant: https://huggingface.co/google/gemma-4-12B-it-assistant
- Modelo QAT q4_0 (unquantized): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Modelo QAT q4_0 assistant: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized-assistant
- Herramienta de conversion: https://github.com/ggml-org/convert
- App Llama: https://llama.app
