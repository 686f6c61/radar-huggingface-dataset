# jsantillana/Muse-Glimmer-30B-abliterated-v3

## Resumen

Muse-Glimmer-30B-abliterated-v3 es una variante "abliterated" (con las direcciones de rechazo eliminadas del espacio de activaciones) del modelo Muse Glimmer, un modelo de lenguaje causal multimodal de aproximadamente 29,8 mil millones de parametros desarrollado originalmente por Meta Superintelligence Lab y publicado bajo licencia Apache 2.0. Esta version concreta ha sido subida por el usuario jsantillana a Hugging Face y esta pensada para tareas de conversion imagen-texto a texto, con soporte de razonamiento multi-paso, uso de herramientas y comprension de imagenes intercaladas con texto.

El modelo base combina un transformer causal denso de 52 capas con un encoder de percepcion ViT-G/14 de unos 1,8 mil millones de parametros, lo que permite aceptar entradas multimodales (texto e imagen) y generar texto. Su ventana de contexto supera los 131.072 tokens y emplea un patron de atencion hibrido local-global con ventana deslizante de 2.048 tokens, atencion con compuertas y GQA con ratio 16:1. El modelo base fue disenado explicitamente para despliegue local en hardware de consumo, con cuantizacion a 4 bits que reduce el modelo a menos de 20 GB y decodificacion especulativa mediante un drafter DFlash.

La relevancia de esta ficha radica en que la variante abliterated modifica el comportamiento de rechazo del modelo original, lo que tiene implicaciones directas para su uso en produccion y para el cumplimiento de politicas de seguridad. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se dispone de informacion sobre los detalles concretos del proceso de abliteration aplicado ni sobre los datos de evaluacion de esta variante especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepcion ViT-G/14 |
| Parametros totales | 29.776.626.688 (aprox. 29,8B, incluyendo encoder visual) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision, K-Quant-Dynamic (32 GB VRAM), K-Quant-17GB (24 GB VRAM); cuantizaciones del drafter DFlash |
| Idiomas soportados | Mas de 100 idiomas (segun model card del modelo base); no se detalla lista para esta variante |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso con 52 capas, dimension oculta de 6.656, 32 cabezas de atencion de consulta y 2 de clave-valor (GQA con ratio 16:1), dimension de cabeza 128 y FFN de tipo SwiGLU con dimension intermedia de 19.968. Emplea un patron de atencion repetido [Local, Local, Local, Global] con ventana deslizante de 2.048 tokens y atencion con compuertas; la codificacion posicional es RoPE con theta 500.000, aplicada solo en las capas locales. El vocabulario es de 202.048 tokens (200.000 BPE mas 2.048 especiales). El encoder de percepcion es un ViT-G/14 de aproximadamente 1,8B parametros, 50 capas, anchura 1.536 y patch de 14, con un maximo de 4.096 tokens visuales por imagen.

El modelo base fue destilado a partir de Muse Spark y entrenado con datos multimodales de fuentes publicas, datos de terceros e informacion de productos y servicios de Meta, con fecha de corte de conocimiento el 4 de enero de 2026. La model card menciona decodificacion especulativa mediante un drafter DFlash de 5 capas, tamano de bloque 16 y atencion de ventana deslizante de 2.048 en todas las capas, que predice bloques completos de 16 tokens en un solo forward pass. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta el procedimiento de abliteration aplicado en esta variante.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos.
- Comprension multimodal de entrada: texto e imagenes intercaladas (capturas de pantalla, graficos, documentos) mediante encoder de percepcion dedicado.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos extendidos.
- Recuperacion ante fallos: diagnostico de errores en llamadas a herramientas y reintento en lugar de detencion.
- Compatibilidad con scaffolds de agentes como OpenClaw y Hermes Agent.
- Esfuerzo de razonamiento controlable (distintos niveles de calidad/velocidad).
- Soporte multilingue en mas de 100 idiomas segun la model card del modelo base.
- Capacidad de ejecucion local sin infraestructura cloud ni acceso a red.
- La variante abliterated elimina las direcciones de rechazo, lo que altera el comportamiento de seguridad respecto al modelo original.

## Casos de uso

- Agentes autonomos locales: el modelo puede orquestar flujos multi-paso con uso de herramientas en hardware de consumo (24-32 GB), sin depender de APIs externas, gracias a su contexto de 131.072 tokens y su compatibilidad con scaffolds como OpenClaw y Hermes Agent.
- Automatizacion de tareas de escritorio con vision: interpretacion de capturas de pantalla y documentos junto a la conversacion permite agentes que leen interfaces graficas y actuan en consecuencia, usando el encoder ViT-G/14 con hasta 4.096 tokens visuales por imagen.
- Generacion y depuracion de codigo en pipelines: el soporte de tool calling y el rendimiento reportado en SWE-Bench lo hacen adecuado para integrarse en flujos de CI/CD y resolucion de issues multi-turno.
- Atencion al cliente con contexto largo: la ventana de 131.072 tokens permite mantener conversaciones multi-turno extensas con historial completo y documentos adjuntos.
- Analisis de documentos y graficos: el modelo acepta imagenes intercaladas con texto, lo que sirve para extraer y razonar sobre tablas, diagramas y capturas en tareas de investigacion o auditoria.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterated, es util para estudiar el efecto de la eliminacion de direcciones de rechazo en el comportamiento del modelo, siempre en entornos controlados y con las salvaguardas adecuadas.
- Despliegue en edge y portatiles: con K-Quant-17GB cabe en 24 GB de VRAM y alcanza 233,4 tok/s con especulacion en una RTX 5090, lo que permite asistentes en tiempo real en equipos de gama alta.

## Benchmarks y rendimiento

La model card del modelo base menciona evaluaciones en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no proporciona los valores numericos en la informacion disponible. Los unicos datos cuantitativos publicados son de velocidad y degradacion por cuantizacion:

| Metrica | Valor |
|---|---|
| Degradacion K-Quant-Dynamic (32 GB VRAM) | 0,2 % (media de 15 benchmarks) |
| Degradacion K-Quant-17GB (24 GB VRAM) | 1,0 % (media de 15 benchmarks) |
| RTX 5090, sin especulacion | 74,9 tok/s |
| RTX 5090, con DFlash | 233,4 tok/s (3,1x) |
| Apple M4 Max, sin especulacion | 23,7 tok/s |
| Apple M4 Max, con DFlash | 37,8 tok/s (1,5x) |
| Apple M5 Max, sin especulacion | 26,6 tok/s |
| Apple M5 Max, con DFlash | 50,2 tok/s (1,8x) |

No se han publicado resultados numericos de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 20 GB con cuantizacion a 4 bits (K-Quant-17GB) para el modelo de lenguaje; 32 GB para K-Quant-Dynamic; 64 GB para precision completa.
- GPU recomendadas: Nvidia RTX 5090 (233,4 tok/s con DFlash), y por el envelope de memoria, GPUs de 24-32 GB como RTX 4090 o A100 40 GB; Apple Silicon M4 Max y M5 Max validados.
- Cabe en GPU de consumo: si, en GPUs de 24 GB o 32 GB con las cuantizaciones K-Quant correspondientes, dejando margen para KV cache, encoder visual y drafter.
- Opciones de despliegue: transformers (libreria declarada); el modelo base menciona despliegue local y decodificacion especulativa con DFlash. No se confirman en la informacion disponible soportes especificos de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 74,9 tok/s base y 233,4 tok/s con especulacion en RTX 5090; 23,7-26,6 tok/s base y 37,8-50,2 tok/s con especulacion en Apple M4/M5 Max (batch size 1, greedy).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad del modelo base ni de esta variante en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Muse-Glimmer-30B-abliterated-v3 | ~29,8B | 131.072+ | Apache 2.0 | Variante abliterated, multimodal, 0 descargas |
| Muse Glimmer (base) | ~29,6B | 131.072+ | Apache 2.0 | Modelo original de Meta Superintelligence Lab |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | Sin datos de rendimiento comparables en la informacion disponible |

## Limitaciones y advertencias

- La variante abliterated elimina las direcciones de rechazo, lo que reduce o anula las salvaguardas del modelo original frente a contenidos daninos; no es adecuada para despliegues publicos sin filtros externos.
- No se documenta el procedimiento de abliteration ni su impacto en calidad, por lo que no hay garantias sobre degradacion en tareas generales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la model card no reporta tasas de error factual.
- El modelo base declara soporte de mas de 100 idiomas, pero no se detalla el rendimiento por idioma ni se confirma para esta variante.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la variante no ofrece garantias ni asume responsabilidad sobre el comportamiento modificado.
- El repositorio tiene 0 descargas y 0 likes, sin historial de validacion por la comunidad; conviene tratar los pesos como no auditados.
- El conocimiento del modelo base tiene fecha de corte el 4 de enero de 2026; no hay informacion posterior.
- No se confirman en la informacion disponible los formatos GGUF ni el soporte en motores de inferencia distintos de transformers.

## Enlaces

- Hugging Face: https://huggingface.co/jsantillana/Muse-Glimmer-30B-abliterated-v3
- Paper del encoder de percepcion: https://arxiv.org/abs/2504.13181
- Paper de DFlash (decodificacion especulativa por bloques): https://arxiv.org/abs/2602.06036
- Referencia adicional citada en los tags: https://arxiv.org/abs/2610.24628
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
