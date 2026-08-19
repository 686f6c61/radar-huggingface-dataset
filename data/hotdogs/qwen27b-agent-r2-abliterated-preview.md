# hotdogs/qwen27B-Agent-R2-abliterated-preview

## Resumen

El modelo `hotdogs/qwen27B-Agent-R2-abliterated-preview` es una variante de 27.000 millones de parámetros (26.895.998.464) construida sobre la base de Qwen3.6-27B, específicamente sobre las versiones abliterated de `huihui-ai/Huihui-Qwen3.6-27B-abliterated` y `hotdogs/qwen27b-abliterated-Fable-MTP`. Desarrollado por el usuario "hotdogs", este modelo se presenta como una versión preliminar (preview) orientada a agentes, con soporte nativo para tool calling, razonamiento paso a paso, decodificación especulativa mediante Multi-Token Prediction (MTP) y una capa de "abliteration" que elimina los mecanismos de rechazo de contenido.

La relevancia actual de este modelo radica en su combinación de capacidades: por un lado, ofrece una ventana de contexto amplia (configurable hasta 256K tokens en los ejemplos de uso), y por otro, integra MTP para acelerar la generación hasta un 85% en términos de tokens por segundo en una sola GPU. Además, es bilingüe en inglés y tailandés, lo que lo hace útil para aplicaciones en esos idiomas. Al ser una versión abliterated, carece de restricciones de contenido, lo que plantea riesgos importantes para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.6-27B con Multi-Token Prediction (MTP) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada oficialmente; en ejemplos de llama.cpp se configura hasta 262.144 tokens (256K) |
| Tipos de cuantizacion | GGUF: IQ4_NL, Q6_K, Q6_K_imatrix, f16; también se menciona Q4_K_M como recomendado. Safetensors (formato original, presumiblemente BF16) |
| Idiomas soportados | Ingles, tailandes |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.6-27B, a la que se le ha aplicado un proceso de "abliteration" (eliminación de las capas o mecanismos de rechazo) y una fusión de LoRA para añadir capacidades de agente y tool calling. Según la model card, está construido a partir de "Fable-MTP + agent LoRA fusion". La característica técnica más destacada es la inclusión de Multi-Token Prediction (MTP), que permite al modelo predecir dos tokens a la vez durante la decodificación especulativa, acelerando la generación hasta un 85% en tokens por segundo en una sola GPU.

Los datos de entrenamiento incluyen tres datasets públicos: `hotdogs/uka-fable-reasoning` (para razonamiento estilo Fable), `NousResearch/hermes-function-calling-v1` (para llamadas a funciones) y `11-47/claude_opus_4.8_max_thinking_5k_v2` (para razonamiento extendido). No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye como una versión preview (v0.1), lo que indica que aún no es una versión estable.

## Capacidades

- Generacion de texto y razonamiento paso a paso (chain-of-thought) con estilo Fable.
- Tool calling y function calling en formato Hermes/Qwen, habilitado en llama.cpp mediante `--tools all`.
- Soporte para agentes multi-turno con llamadas a herramientas y razonamiento secuencial.
- Decodificacion especulativa MTP: predice 2 tokens por paso, lo que mejora el throughput hasta un +85% en una GPU.
- Bilingue nativo en ingles y tailandes.
- Generacion de codigo en Python, shell y tareas de sistema.
- Abliterated: sin mecanismos de rechazo ni guardarrailes de contenido.
- Posibilidad de ampliacion multimodal (vision) si se combina con el mmproj de Qwen3.6-27B, aunque no es una capacidad nativa del modelo.

## Casos de uso

- Agentes autonomos con tool calling: el modelo puede orquestar llamadas a APIs, ejecutar comandos y razonar sobre los resultados, gracias a su soporte nativo de function calling y su ventana de contexto amplia (hasta 256K tokens en configuracion de ejemplo).
- Asistente de codigo en produccion: con su capacidad de generar Python, shell y tareas de sistema, puede integrarse en pipelines de CI/CD para autogenerar scripts, parches o documentacion tecnica, aprovechando el modo de razonamiento para depurar errores.
- Atencion al cliente bilingue (ingles/tailandes): el modelo gestiona conversaciones multi-turno con contexto largo, lo que permite mantener el historial completo de una interaccion sin truncamientos.
- Automatizacion de tareas de sistema: puede interpretar comandos, gestionar archivos y ejecutar operaciones administrativas cuando se le proporcionan las herramientas adecuadas.
- Investigacion en alineacion y seguridad: al ser abliterated, resulta util para estudiar comportamientos sin restricciones, sesgos latentes o mecanismos de rechazo en modelos de lenguaje.
- Generacion de contenido creativo sin censura: para entornos controlados donde se requiere explorar temas sensibles o controversiales, aunque con advertencias legales y eticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una mejora de hasta +85% en tokens por segundo gracias a MTP, pero no ofrece cifras concretas de calidad (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion IQ4_NL (16 GB) cabe en una GPU de 16 GB (por ejemplo, RTX 4080 o RTX 4090 con 24 GB). La cuantizacion Q6_K (21-22 GB) requiere al menos 24 GB de VRAM. La version f16 (51 GB) necesita multiples GPUs o una GPU de 80 GB (como A100 o H100).
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4/Q6; A100 40/80 GB o H100 para f16 o contextos muy largos.
- En consumer GPU, es viable con cuantizaciones IQ4_NL o Q4_K_M en una RTX 4090 (16-24 GB), aunque la velocidad dependera del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server) es la opcion recomendada por el autor, con soporte para MTP, tool calling y vision via mmproj. Tambien se puede usar con Transformers (Python) mediante `trust_remote_code=True`. Otros entornos como vLLM, TGI u Ollama no estan documentados explicitamente, pero podrian ser compatibles si soportan el formato GGUF y la arquitectura Qwen3.6.
- Latencia y throughput: no se proporcionan cifras exactas, pero el autor indica que MTP puede aumentar el rendimiento hasta un 85% en tokens por segundo en una sola GPU. En la practica, con IQ4_NL en una RTX 4090 se espera un throughput de decenas de tokens por segundo, aunque depende del contexto y del batch.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Como referencia estructural, el modelo es una variante de Qwen3.6-27B, por lo que se puede comparar con el modelo base original y con otras variantes abliterated de la misma familia. Sin embargo, al no existir benchmarks publicados, no es posible realizar una comparativa cuantitativa fiable. Se recomienda consultar las fichas de Qwen3-27B o Qwen3.5-27B para obtener referencias de calidad, aunque este modelo incorpora modificaciones sustanciales (MTP, abliteration, LoRA de agente).

## Limitaciones y advertencias

- Al ser abliterated, el modelo no tiene guardarrailes de contenido: puede generar texto ofensivo, peligroso, ilegal o no etico. Su uso en produccion debe estar restringido a entornos controlados y con supervisión humana.
- La licencia AGPL-3.0 impone obligaciones de copyleft: cualquier distribucion o servicio que use este modelo debe publicar su codigo fuente modificado bajo la misma licencia, lo que puede ser problematico para aplicaciones comerciales cerradas.
- Solo soporta ingles y tailandes. No se garantiza un rendimiento adecuado en otros idiomas.
- Es una version preview (v0.1) y puede contener errores, inestabilidades o comportamientos impredecibles.
- No se han publicado benchmarks de calidad, por lo que no se puede evaluar su rendimiento frente a alternativas.
- La funcion de vision no es nativa; requiere la extraccion del mmproj de Qwen3.6-27B y su integracion manual, lo que anade complejidad y posibles incompatibilidades.
- El riesgo de alucinacion no se ha documentado, pero es inherente a los modelos de esta escala, especialmente en tareas de razonamiento o generacion de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hotdogs/qwen27B-Agent-R2-abliterated-preview
- Modelo base: https://huggingface.co/hotdogs/qwen27b-abliterated-Fable-MTP
- Modelo base adicional: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-27B-abliterated
- Dataset de razonamiento: https://huggingface.co/datasets/hotdogs/uka-fable-reasoning
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset de razonamiento extendido: https://huggingface.co/datasets/11-47/claude_opus_4.8_max_thinking_5k_v2
