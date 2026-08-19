# dr-housemd/Gemma-4-Gembrain-X-Core-31B-exl3-4bpw

## Resumen

Gemma-4-Gembrain-X-Core-31B-exl3-4bpw es un modelo de lenguaje creado por el usuario dr-housemd mediante la fusión de 18 modelos base derivados de google/gemma-4-31B-it. Se trata de un merge comunitario orientado a tareas de razonamiento, roleplay, escritura creativa, generación de prompts para imágenes y conversación general, con un enfoque deliberadamente "uncensored" (sin censura) que incluye contenido NSFW. El modelo se distribuye en formato cuantizado a 4 bits con ExLlama v3 (exl3), lo que reduce el tamaño del repositorio a 19,7 GB y facilita su ejecución en hardware de consumo.

Aunque el nombre indica 31B, el archivo safetensors contiene 9.844.444.780 parámetros, una discrepancia que podría deberse a un checkpoint parcial o a una particularidad del proceso de cuantización. El contexto máximo del modelo base Gemma 4 31B es de 262.000 tokens, según fuentes externas, aunque no se ha confirmado para este merge específico. La licencia es Apache 2.0, lo que permite uso comercial, pero al ser un merge no oficial, no hay garantías de calidad, seguridad o reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4) |
| Parametros totales | 9.844.444.780 (segun safetensors; el modelo se anuncia como 31B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 262.000 tokens (contexto del modelo base Gemma 4 31B; no confirmado para este merge) |
| Tipos de cuantizacion | 4-bit (exl3); existe tambien version 3-bit (3bpw) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (cuantizacion exl3) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge de 18 checkpoints base, todos ellos derivados de google/gemma-4-31B-it. La lista de modelos fusionados incluye fine-tunes comunitarios como Danielbrdz/Barcenas-31b-Fable, Jackrong/Gemopus-4-31B-it, BirdToast/Gemma-4-31B-glimmer-rp-v0.1, llmfan46/G4-MeroMero-31B-uncensored-heretic, bgg1996/Melinoe-Gemma4-31B-VL (que sugiere capacidades de vision), entre otros. El proceso de fusion se realizo con mergekit, aunque no se especifica el metodo concreto (por ejemplo, SLERP, TIES, etc.).

No se dispone de informacion sobre el proceso de entrenamiento del modelo base ni de los fine-tunes: no se conocen los datos utilizados, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO. El modelo base Gemma 4 31B es un LLM instructivo de Google, con arquitectura Transformer y soporte multimodal (vision y texto), aunque esta version cuantizada no garantiza que las capacidades de vision se conserven intactas tras el merge.

## Capacidades

- Razonamiento y resolucion de problemas en multiples dominios, segun los tags del modelo.
- Roleplay conversacional, con capacidad para mantener personajes y narrativas coherentes a lo largo de interacciones largas.
- Escritura creativa: cuentos, dialogos, poesia y otros formatos literarios.
- Generacion de prompts para modelos de imagen (image-prompt-generation), util para herramientas como Stable Diffusion o Midjourney.
- Conversacion general y asistencia en tareas cotidianas, gracias a la base instructiva de Gemma 4.
- Contenido sin censura y NSFW, lo que permite explorar temas que otros modelos bloquean, aunque con los riesgos asociados.
- Posible soporte multimodal (vision) heredado del modelo base Melinoe-Gemma4-31B-VL, aunque no esta confirmado en esta cuantizacion.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones multi-turno con personajes ficticios, ideal para juegos de rol por texto, foros de escritura o aplicaciones de compania virtual. Su ventana de contexto de 262K tokens permite recordar detalles de la historia a lo largo de sesiones muy largas.
- Escritura creativa asistida: autores pueden usarlo para generar borradores, superar bloqueos creativos o explorar estilos narrativos. La combinacion de modelos de roleplay y escritura en el merge favorece una prosa fluida y descriptiva.
- Generacion de prompts para IA de imagen: el modelo produce descripciones detalladas y artisticas que pueden alimentar directamente a difusores estables, ahorrando tiempo en la elaboracion manual de prompts.
- Chat general sin restricciones: para investigadores que necesitan explorar temas sensibles o controvertidos sin los filtros habituales de los modelos comerciales, este modelo ofrece una alternativa abierta y sin censura.
- Creacion de personajes para videojuegos: desarrolladores pueden usarlo para generar dialogos y personalidades de NPC, aprovechando su capacidad de roleplay y su contexto largo para mantener la coherencia.
- Prototipado rapido de aplicaciones conversacionales: gracias a su licencia Apache 2.0 y su formato exl3, puede integrarse en demos y productos con costes de infraestructura reducidos, sin necesidad de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o para los modelos base fusionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 19,7 GB en cuantizacion 4-bit, por lo que se recomienda al menos 20-24 GB de VRAM para cargar el modelo completo en GPU.
- GPU recomendadas: RTX 3090, RTX 4090 (24 GB), A100 40 GB, H100 80 GB. En GPUs con menos VRAM, se podria usar la version 3-bit (3bpw) que reduce el peso a aproximadamente 15 GB, aunque con perdida de calidad.
- En consumer GPU: si cabe en RTX 3090/4090 (24 GB) y en GPUs de 20 GB como la RTX 3080 Ti, aunque con margen limitado.
- Opciones de despliegue: al ser formato exl3, es compatible con ExLlama v3 y ExLlamaV2. Tambien puede convertirse a GGUF para usarse con llama.cpp u Ollama, o servirse con vLLM si se convierte a un formato estandar.
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de ~31B en 4-bit, se estima una velocidad de generacion de 20-40 tokens/s en una RTX 4090 con ExLlama, dependiendo de la longitud de contexto y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma-4-Gembrain-X-Core-31B-exl3-4bpw (este) | 31B (nominal) | 262K (base) | Apache 2.0 | Merge creativo, roleplay, sin censura |
| google/gemma-4-31B-it | 31B | 262K | Apache 2.0 | Modelo base instructivo multimodal |
| dr-housemd/gemma-4-31B-it-scotoma-2-3bpw-exl3 | 31B | No disponible | Apache 2.0 | Merge similar, cuantizacion 3-bit |
| Blazed-Forge/Gemma-4-Gemsicle-31B | 31B | No disponible | Apache 2.0 | Fine-tune creativo, parte del merge |

No se dispone de comparativas de rendimiento entre estos modelos al no haber benchmarks publicados. La principal diferencia entre ellos radica en la combinacion de fine-tunes y el metodo de merge, que afecta al estilo de escritura, la coherencia en roleplay y el grado de censura.

## Limitaciones y advertencias

- Sesgos y contenido inapropiado: al ser un modelo sin censura, puede generar contenido ofensivo, violento, sexual o discriminatorio. No es apto para uso en entornos moderados o para menores.
- Riesgo de alucinacion: como todos los LLM, puede inventar hechos, citas o referencias. La ausencia de filtros aumenta este riesgo en contextos factuales.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base Gemma 4 soporta multiples lenguas, pero el merge puede degradar el rendimiento en idiomas poco representados.
- Restricciones de licencia: aunque la licencia es Apache 2.0, los modelos base individuales podrian tener condiciones adicionales. Se recomienda revisar cada uno de los 18 modelos base antes de un uso comercial.
- Falta de documentacion: no hay informacion sobre el proceso de entrenamiento, datos utilizados ni evaluaciones de seguridad. El modelo se ofrece "tal cual", sin garantias.
- Compatibilidad: el formato exl3 es especifico de ExLlama v3; no es directamente utilizable con otras herramientas sin conversion previa. La cuantizacion 4-bit puede introducir degradacion de calidad respecto al modelo original.
- Fecha de creacion: el modelo fue creado el 16 de agosto de 2026, lo que podria indicar que se basa en una version futura de Gemma 4; sin embargo, no se ha verificado la autenticidad de esta fecha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dr-housemd/Gemma-4-Gembrain-X-Core-31B-exl3-4bpw
- Version 3-bit del mismo modelo: https://huggingface.co/dr-housemd/Gemma-4-Gembrain-X-Core-31B-exl3-3bpw
- Modelo similar de dr-housemd: https://huggingface.co/dr-housemd/gemma-4-31B-it-scotoma-2-3bpw-exl3
- Pagina oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 31B Gembrain X Core en NanoGPT: https://nano-gpt.com/models/text/Gemma-4-31B-Gembrain-X-Core
- API de Gemma 4 31B Gembrain X Core en Routeway: https://routeway.ai/models/gemma-4-31b-gembrain-x-core
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
