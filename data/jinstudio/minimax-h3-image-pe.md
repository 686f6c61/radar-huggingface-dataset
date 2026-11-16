# Jinstudio/MiniMax-H3-Image-PE

## Resumen

MiniMax-H3-Image-PE es un modelo de lenguaje especializado en expansion de prompts (prompt expansion, PE) para el generador de imagenes MiniMax-H3-Image. Desarrollado por Jinstudio como un fine-tuning de Qwen3.8-27B, su funcion es transformar una instruccion breve del usuario en una descripcion detallada de la imagen objetivo, junto con una recomendacion de relacion de aspecto para la generacion. No genera imagenes por si mismo: actua como etapa previa del pipeline text-to-image.

El modelo conserva la arquitectura transformer de Qwen3.8-27B, con 27.356.728.560 parametros totales y pesos cuantizados en FP4 mediante modelopt. Se distribuye en formato safetensors y esta pensado para servirse con SGLang, aprovechando el constrained decoding con XGrammar para forzar la salida a un esquema JSON predefinido. La licencia es la MiniMax-H3-Image Community License Agreement, distinta de la licencia del modelo base Qwen.

Su relevancia actual radica en que la calidad de un generador text-to-image depende en gran medida de la calidad del prompt. Un modelo dedicado a reescribir y enriquecer instrucciones cortas permite obtener imagenes mas fieles sin exigir al usuario conocimientos de prompting. El repositorio incluye tambien el prompt de tarea para el flujo de edicion de imagenes, aunque ese flujo esta aun en desarrollo y no se publican pesos especificos para el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B, tag `qwen3_5`) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (modelopt), pesos de 8 bits segun tags |
| Idiomas soportados | ingles (en) |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | safetensors |
| Tamano del repositorio | 17,9 GB |
| Pipeline | text-generation |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.8-27B |
| Despliegue recomendado | SGLang >= 0.5.23 con xgrammar >= 0.2.7 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3.8-27B, un transformer decoder-only de 27.356 millones de parametros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste ni si se aplicaron tecnicas de RLHF o DPO durante el fine-tuning. El tag `qwen3_5` sugiere una variante de la familia Qwen3, pero no se detalla la arquitectura interna mas alla de lo indicado.

La innovacion tecnica destacable no esta en la arquitectura sino en el pipeline de inferencia: el modelo se sirve con SGLang y constrained decoding mediante XGrammar, de modo que la salida queda restringida a un esquema JSON que contiene la descripcion expandida y la recomendacion de relacion de aspecto. Ademas, el checkpoint incorpora la configuracion FP4 leida directamente por SGLang, y se utiliza el reasoning parser `qwen3` para separar el razonamiento interno de la respuesta final. El repositorio incluye prompts de sistema y de tarea especificos que condicionan el comportamiento del modelo.

## Capacidades

- Expansion de prompts text-to-image: convierte una instruccion corta en una descripcion detallada de la imagen pretendida.
- Recomendacion de relacion de aspecto: la salida incluye una sugerencia de aspect ratio para el generador.
- Salida estructurada en JSON: el constrained decoding con XGrammar garantiza que la respuesta cumpla el esquema esperado.
- Razonamiento separado: el parser `qwen3` permite distinguir el razonamiento del resultado final.
- Prompt de tarea para edicion de imagenes: el repositorio publica el prompt para el flujo de image editing, aunque el flujo esta en desarrollo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.
- Capacidades de vision, audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Mejora automatica de prompts en interfaces de generacion de imagenes: el modelo se situa entre el campo de texto del usuario y la llamada al generador, enriqueciendo instrucciones breves como "un gato atigrado naranja durmiendo en una ventana" con detalles de composicion, iluminacion y estilo.
- Estandarizacion de prompts en produccion: al forzar la salida a un esquema JSON con XGrammar, los pipelines pueden consumir la descripcion y la relacion de aspecto de forma programatica sin parseo fragil.
- Preseleccion de formato de imagen: la recomendacion de aspect ratio permite al frontend o al backend elegir dimensiones coherentes con la composicion descrita antes de invocar al generador.
- Enriquecimiento por lotes de catalogos de prompts: util para equipos que mantienen bibliotecas de prompts y necesitan expandirlos de forma consistente y reproducible.
- Integracion en APIs propias de generacion de imagenes: el modelo se sirve como endpoint compatible con `/v1/chat/completions` en SGLang, por lo que puede envolverse en un servicio interno que combine PE y generacion.
- Preparacion del flujo de edicion de imagenes: el prompt de tarea publicado permite experimentar con la expansion de instrucciones de edicion sobre un modelo vision-language, aunque el flujo completo aun no esta disponible.
- Evaluacion comparativa de estrategias de prompting: al aislar la fase de expansion, permite medir el impacto de distintos prompts de sistema en la calidad final de las imagenes generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP4 y un total de 17,9 GB en el repositorio, se requiere al menos esa cantidad de memoria para cargar el checkpoint; el margen para KV cache y overhead de SGLang depende de la longitud de contexto, que no se especifica.
- GPU recomendadas: no se detallan en la informacion proporcionada. Por tamano de checkpoint, GPUs con 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100) son candidatas razonables, pero no hay confirmacion del autor.
- Cabe en consumer GPU: probablemente en GPUs de 24 GB o superiores con la cuantizacion FP4, aunque no esta verificado en la informacion disponible.
- Opciones de despliegue: SGLang >= 0.5.23 con xgrammar >= 0.2.7 es el metodo recomendado y documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-PE | 27.356 M | no disponible | Expansion de prompts T2I | MiniMax-H3-Image Community License | Hugging Face |
| Qwen3.8-27B (base) | ~27.000 M | no disponible | LLM generalista | no disponible en esta ficha | Hugging Face |
| MiniMax-H3-Image | no disponible | no disponible | Generacion de imagenes | MiniMax-H3-Image Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el uso en castellano u otros idiomas no esta garantizado.
- Es un modelo especializado: no esta pensado como LLM generalista ni para tareas ajenas a la expansion de prompts.
- El flujo de edicion de imagenes esta en desarrollo; solo se publica el prompt de tarea, no pesos ni pipeline completo.
- La licencia MiniMax-H3-Image Community License Agreement impone condiciones especificas para uso comercial que deben revisarse antes de desplegar en produccion; no es una licencia open source estandar.
- Riesgo de alucinacion: al generar descripciones detalladas, el modelo puede introducir elementos no solicitados por el usuario; conviene validar la salida en produccion.
- Dependencia de SGLang y XGrammar para el constrained decoding; otros runtimes no estan documentados y pueden no respetar el esquema JSON.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar el dimensionamiento de KV cache.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-16; se trata de un artefacto muy reciente y poco validado por la comunidad.
- La cuantizacion FP4 puede degradar la calidad de la expansion frente a los pesos originales en precision completa.

## Enlaces

- Hugging Face: https://huggingface.co/Jinstudio/MiniMax-H3-Image-PE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- MiniMax-H3-Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- MiniMax-H3-Image-PE (original): https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- API global: https://platform.minimax.io
- API China: https://platform.minimax.cn
- Docs text-to-image: https://platform.minimax.io/docs/api-reference/image-generation-h3-generations
- Docs image editing: https://platform.minimax.io/docs/api-reference/image-generation-h3-edits
- Docs prompt expansion: https://platform.minimax.io/docs/api-reference/image-generation-h3-context-ir
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
- Hailuo AI: https://hailuoai.video
