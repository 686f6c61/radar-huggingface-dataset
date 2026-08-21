# rkayaith/Muse-Glimmer-30B-mxfp8

## Resumen

Muse Glimmer 30B es un modelo de visión-lenguaje (VLM) denso de 29,6 mil millones de parámetros desarrollado por Meta, diseñado para agentes locales que requieren ejecución en una única GPU. Fue destilado a partir de Muse Spark y ajustado específicamente para uso de herramientas, tareas de larga duración y recuperación ante fallos. El modelo original se distribuye bajo licencia Apache 2.0 y ofrece un contexto de 128K tokens, junto con un encoder visual ViT-G/14.

Esta ficha se centra en la variante cuantizada `rkayaith/Muse-Glimmer-30B-mxfp8`, que convierte los pesos lineales del modelo de lenguaje a formato MXFP8 (OCP E4M3) mediante LLM Compressor, sin calibración ni ajuste fino. La cuantización reduce significativamente el uso de memoria y permite la inferencia acelerada en hardware con soporte MXFP8, como la GPU AMD Instinct MI350X. La variante está pensada para despliegues con vLLM en modo solo lenguaje, ya que el componente multimodal no ha sido validado en esta versión.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada de un modelo de vanguardia para agentes locales, con un tamaño de repositorio de 35,2 GB, lo que lo hace viable en hardware de gama alta para consumidores y estaciones de trabajo, siempre que el backend de inferencia soporte el formato MXFP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision ViT-G/14 y decoder de lenguaje de 52 capas |
| Parametros totales | 29.776.626.688 (29,6B) |
| Parametros activos | no disponible (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | 128K tokens (del modelo base) |
| Tipos de cuantizacion | MXFP8 (OCP E4M3), group size 32, escala E8M0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (ademas, se debe cumplir la Usage Policy del modelo base) |
| Formato de pesos | safetensors (compressed-tensors, 8 shards) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un VLM denso con un encoder de vision de tipo ViT-G/14 y un decoder transformer de 52 capas para el lenguaje. Fue destilado de Muse Spark y ajustado para tareas de agente, lo que incluye generacion de razonamiento con alcance de canal (channel-scoped reasoning) y llamadas a herramientas en formato XML (ATEM) en lugar de JSON. El contexto total es de 128K tokens, lo que permite manejar conversaciones largas y multiples pasos de razonamiento.

La variante cuantizada MXFP8 se obtiene mediante LLM Compressor 0.13.0 y Compressed Tensors 0.18.0. Se convierten los pesos de las capas lineales del modelo de lenguaje (attention y feed-forward) a MXFP8 con un group size de 32 elementos, usando cuantizacion estatica para pesos y dinamica para activaciones. Las capas de vision (torre, adaptador, proyeccion) y el `lm_head` se mantienen sin cuantizar en BF16. No se realizo calibracion ni fine-tuning, por lo que la cuantizacion es puramente de compresion.

## Capacidades

- Generacion de texto y razonamiento multimodal (entrada de imagen y texto).
- Soporte de tool calling y function calling mediante formato XML (ATEM), no JSON.
- Razonamiento multi-paso y canal-scoped (emite pensamientos intermedios antes de la accion).
- Capacidad de agentes: puede gestionar tareas largas y recuperarse de fallos durante la ejecucion.
- Multilingue: no se ha especificado, pero el modelo base probablemente soporta multiples idiomas (no confirmado).
- Vision: puede procesar imagenes como entrada adicional al texto.

## Casos de uso

- **Agentes locales de asistentes personales**: el modelo puede ejecutarse en una GPU de consumo o estacion de trabajo, gestionando tareas como envio de correos, busqueda web o control de aplicaciones mediante tool calling, sin depender de la nube.
- **Automatizacion de tareas multi-paso**: gracias a su razonamiento canal-scoped, es adecuado para pipelines de automatizacion que requieren planificacion, ejecucion y correccion de errores, como en pruebas de software o gestion de infraestructura.
- **Asistente de codigo con herramientas**: puede integrarse en un entorno de desarrollo para invocar herramientas como compiladores, linters o control de versiones, usando XML para estructurar las llamadas.
- **Analisis de documentos con imagenes**: al ser un VLM, puede procesar capturas de pantalla, diagramas o graficos y generar descripciones o acciones basadas en ellos, util en sistemas de documentacion automatica.
- **Chatbot de soporte tecnico**: con contexto de 128K, puede mantener conversaciones largas con historial completo, y usar herramientas de ticketing o bases de conocimiento mediante llamadas a funciones.
- **Prototipado de agentes de investigacion**: para investigadores que necesitan probar interacciones con herramientas sin depender de APIs externas, esta variante cuantizada reduce el coste de hardware para experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base de Muse Glimmer 30B tiene resultados de referencia (como MMLU, HumanEval, etc.) en la pagina del modelo base, pero esta variante cuantizada no los incluye. No se proporcionan datos de rendimiento comparativo entre la version BF16 y la MXFP8 en esta ficha.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 35,2 GB en formato safetensors, lo que sugiere que la carga completa en memoria requiere al menos esa cantidad, pero el uso real de VRAM depende del backend y de la cuantizacion. No se indica un valor exacto.
- GPU recomendadas: la variante MXFP8 requiere hardware con soporte OCP MXFP8. La unica plataforma validada es AMD Instinct MI350X (CDNA4, gfx950) con HIP runtime 7.2.53211. No se ha probado en otras GPUs.
- Consumer GPU: no se recomienda esta variante para GPUs consumer sin soporte MXFP8. Para equipos como AMD Ryzen AI Max+ o Radeon AI PRO R9700, se sugiere usar la version BF16 del modelo base con llama.cpp, segun el blog de AMD.
- Opciones de despliegue: vLLM es el unico backend validado para esta variante, usando `--language-model-only`. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan datos especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| meta-models/Muse-Glimmer-30B (BF16) | 29,6B | 128K | BF16 | Apache 2.0 | Original de Meta |
| rkayaith/Muse-Glimmer-30B-mxfp8 (esta variante) | 29,6B | 128K | MXFP8 (32-element groups) | Apache 2.0 | Derivada cuantizada |
| RedHatAI/Muse-Glimmer-30B-FP8-block | 29,6B | 128K | FP8 E4M3, bloques 128x128, activaciones dinamicas | Apache 2.0 | Derivada cuantizada |

La variante MXFP8 se diferencia de la FP8 block en el formato de cuantizacion (OCP MXFP8 con grupos de 32 frente a FP8 con bloques 128x128). La primera esta orientada a hardware con soporte MXFP8 (como AMD MI350X), mientras que la FP8 block es mas generica para GPUs con soporte FP8. El modelo base BF16 es la referencia original y tiene mayor compatibilidad con backends como llama.cpp.

## Limitaciones y advertencias

- La cuantizacion MXFP8 solo ha sido validada en un solo hardware (AMD MI350X) y en modo solo lenguaje (sin entrada de imagen). No se ha probado la generacion multimodal con esta variante.
- El modelo requiere un backend de inferencia con soporte MXFP8 (vLLM con kernel especifico). No funciona en llama.cpp, Ollama u otros sin implementacion de MXFP8.
- No se ha realizado una evaluacion de calidad comparativa entre la version BF16 y la MXFP8, por lo que se puede haber degradacion en tareas complejas.
- El modelo base puede tener sesgos y riesgos de alucinacion, no documentados en esta variante.
- Aunque la licencia es Apache 2.0, el uso debe cumplir la Usage Policy del modelo original de Meta, que puede incluir restricciones para ciertos casos de uso.
- La generacion de razonamiento canal-scoped y tool calls en XML requiere parsers especificos (muse_glimmer) para procesar correctamente las salidas; no es compatible con parsers JSON estandar.

## Enlaces

- Repositorio HuggingFace de la variante MXFP8: https://huggingface.co/rkayaith/Muse-Glimmer-30B-mxfp8
- Repositorio HuggingFace del modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Variante FP8 block: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-FP8-block
- Pagina oficial de Meta sobre Muse Glimmer: https://developer.meta.com/ai/models/muse-glimmer/
- Blog de AMD sobre ejecucion de Muse Glimmer en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-meta-muse-glimmer-30b-on-amd-ryzen-ai-max-and-radeon-gpus.html
- Recetas vLLM para Muse Glimmer: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
