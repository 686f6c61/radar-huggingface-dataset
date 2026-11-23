# khaledmkh/khaledooo

## Resumen

khaledmkh/khaledooo es un repositorio de pesos en formato GGUF derivado de Qwen3-8B, el modelo denso de 8.200 millones de parametros de la tercera generacion de la familia Qwen desarrollada por Alibaba Cloud. El autor del repositorio (khaledmkh) publica una cuantizacion del modelo base sin aportar informacion adicional sobre el proceso de conversion, los parametros de cuantizacion empleados ni los datos de evaluacion del artefacto resultante. La model card reproduce practicamente en su totalidad la documentacion oficial de Qwen3-8B-GGUF.

El modelo subyacente es un transformer causal denso de 36 capas con atencion GQA (32 cabezas de consulta y 8 de clave-valor), 8.190 millones de parametros totales (6.950 millones sin contar embeddings) y una ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante escalado RoPE con YaRN. Su rasgo diferencial es la capacidad de alternar entre modo de razonamiento (thinking mode) y modo de respuesta directa (non-thinking mode) dentro del mismo modelo, controlable mediante las etiquetas `/think` y `/no_think`.

La relevancia de este repositorio es limitada: se trata de un artefacto sin descargas ni interacciones, con fecha de creacion de noviembre de 2026, y cuya unica aportacion respecto al repositorio oficial es la disponibilidad del modelo cuantizado en un unico paquete de 32 GB. Para uso en produccion resulta mas recomendable acudir a las cuantizaciones oficiales de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (decoder-only) con GQA |
| Parametros totales | 8.190.735.360 (8,2B); 6,95B sin embeddings |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | q4_K_M, q5_0, q5_K_M, q6_K, q8_0 (segun model card del base) |
| Idiomas soportados | Mas de 100 idiomas y dialectos (segun model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Capas | 36 |
| Cabezas de atencion | 32 (Q) / 8 (KV), GQA |
| Tamano del repositorio | 32,0 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3-8B: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU y atencion con query-key normalization. Emplea Grouped Query Attention con 32 cabezas de consulta y 8 de clave-valor, lo que reduce el coste de memoria del KV cache durante la inferencia. El modelo base fue entrenado por Alibaba en dos fases: preentrenamiento y postentrenamiento, e incorpora alineacion mediante preferencias humanas orientada a instrucciones, escritura creativa, role-play y conversacion multi-turno.

La innovacion principal del modelo base es la integracion de modos de razonamiento conmutables en un unico conjunto de pesos: el modelo puede generar una cadena de razonamiento explicita (thinking mode) o responder directamente (non-thinking mode), seleccionable por turno mediante instrucciones en el prompt. El soporte de contexto largo se logra mediante YaRN (arXiv:2309.00071), un metodo de escalado RoPE que la model card advierte que puede degradar el rendimiento en textos cortos si se aplica de forma estatica. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de RLHF/DPO en la informacion proporcionada.

Respecto al artefacto concreto de este repositorio, no se especifica que nivel de cuantizacion contiene el archivo de 32 GB, ni los parametros de conversion, ni si se ha verificado la integridad de los pesos.

## Capacidades

- Generacion de texto y dialogo multi-turno con alineacion a preferencias humanas.
- Razonamiento logico, matematico y de sentido comun en thinking mode.
- Generacion y comprension de codigo.
- Cambio dinamico entre thinking mode y non-thinking mode mediante `/think` y `/no_think`.
- Capacidades de agente: integracion con herramientas externas y razonamiento multi-paso, en ambos modos.
- Soporte de tool calling / function calling.
- Instrucciones y traduccion multilingue en mas de 100 idiomas y dialectos.
- Escritura creativa y role-play.
- Procesamiento de contexto largo hasta 131.072 tokens con YaRN.
- No se ha confirmado soporte de vision ni de audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto de hasta 32.768 tokens nativos, suficiente para incorporar historial de incidencias y documentacion de producto sin truncamiento.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revision de parches, generacion de tests o explicacion de errores de compilacion, alternando a non-thinking mode para tareas rutinarias y a thinking mode para depuracion compleja.
- Asistentes de razonamiento matematico: el thinking mode permite trazar cadenas de razonamiento paso a paso en problemas de varias etapas, util en herramientas educativas o de verificacion formal.
- Agentes autonomos con herramientas: la capacidad de agent multi-step reasoning permite orquestar llamadas a APIs externas en flujos de automatizacion de back-office.
- Analisis de documentos largos: con YaRN activado y contexto de 131.072 tokens, es posible procesar informes extensos, contratos o bases de codigo completas en una sola pasada.
- Traduccion y localizacion multilingue: el soporte de mas de 100 idiomas lo hace adecuado para pipelines de traduccion automatica con instrucciones especificas de tono y registro.
- Despliegue local en estaciones de trabajo: al estar en formato GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada de gran capacidad, usando cuantizaciones q4_K_M o q5_K_M.
- Prototipado de chatbots con role-play: la alineacion en escritura creativa y conversacion permite construir personajes y asistentes conversacionales con personalidad definida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio remite al blog y la documentacion oficiales de Qwen para consultar la evaluacion del modelo base, pero no incluye cifras propias ni verificacion del artefacto cuantizado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en q4_K_M, 6-7 GB en q5_K_M, 8-9 GB en q8_0 (estimacion a partir del numero de parametros; no confirmada para este repositorio concreto).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue de alta concurrencia en FP16/BF16; RTX 4090 (24 GB) para cuantizaciones q8_0 con contexto largo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM para cuantizaciones q4/q5; en q8_0 se recomienda 12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y frameworks compatibles con GGUF; para el modelo base en safetensors, vLLM y TGI.
- Latencia y throughput: no disponibles para este artefacto. La model card recomienda `presence_penalty` de 1,5 en modelos cuantizados para suprimir repeticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| khaledmkh/khaledooo (este) | 8,2B | 32.768 / 131.072 con YaRN | Apache 2.0 | GGUF | Cuantizacion no documentada, sin descargas ni evaluacion |
| Qwen/Qwen3-8B-GGUF (oficial) | 8,2B | 32.768 / 131.072 con YaRN | Apache 2.0 | GGUF | Repositorio oficial con q4_K_M, q5_0, q5_K_M, q6_K, q8_0 documentadas y mantenido por Alibaba |
| Qwen/Qwen3-8B | 8,2B | 32.768 / 131.072 con YaRN | Apache 2.0 | safetensors | Pesos completos para vLLM/TGI, referencia para fine-tuning |
| Meta Llama 3.1 8B | 8,0B | 131.072 | Llama 3.1 Community License | safetensors, GGUF | Alternativa de tamano similar; licencia con restricciones de uso comercial |

## Limitaciones y advertencias

- El repositorio no documenta que nivel de cuantizacion contiene el archivo de 32 GB ni los parametros de conversion; no es posible verificar la fidelidad de los pesos respecto al modelo base.
- Cero descargas y cero interacciones: no hay evidencia de uso ni validacion por parte de la comunidad.
- Riesgo de alucinacion inherente al modelo base, no mitigado ni evaluado en este artefacto.
- Sesgos conocidos del modelo base no documentados en la informacion disponible.
- El escalado YaRN estatico puede degradar el rendimiento en textos cortos si se aplica de forma permanente; la model card recomienda activarlo solo cuando se procesen contextos largos.
- El uso de greedy decoding en thinking mode esta desaconsejado por el autor del modelo base, ya que puede provocar repeticiones infinitas y degradacion.
- En modelos cuantizados se recomienda `presence_penalty` de 1,5; valores mas altos pueden causar mezcla de idiomas y perdida de rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen3-8B; conviene verificar los terminos en el repositorio oficial.
- Fecha de creacion futura (noviembre de 2026) y ausencia de actualizaciones: la trazabilidad del artefacto es limitada.
- Para produccion se recomienda usar las cuantizaciones oficiales de Qwen en lugar de este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/khaledmkh/khaledooo
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Cuantizaciones oficiales: https://huggingface.co/Qwen/Qwen3-8B-GGUF
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Guia de llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Guia de Ollama: https://qwen.readthedocs.io/en/latest/run_locally/ollama.html
- Paper YaRN: https://arxiv.org/abs/2309.00071
- Chat de Qwen: https://chat.qwen.ai/
