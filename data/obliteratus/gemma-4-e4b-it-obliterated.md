# OBLITERATUS/gemma-4-E4B-it-OBLITERATED

## Resumen

Gemma 4 E4B OBLITERATED es una version del modelo instructo de Google `google/gemma-4-E4B-it` a la que se le han eliminado quirurgicamente los mecanismos de rechazo y guardarrailes mediante la tecnica de abliteracion. El trabajo lo ha realizado el equipo OBLITERATUS (liderado por el investigador elder-plinius) usando su toolkit homonimo, que identifica y elimina las representaciones internas responsables de la negativa a responder sin reentrenar ni ajustar el modelo. El resultado es un modelo conversacional con una tasa de rechazo duro del 0 %, manteniendo intactos los 720 tensores de la arquitectura original.

El modelo se basa en la nueva arquitectura `gemma4` de Google, que introduce innovaciones como pesos KV compartidos entre capas (`num_kv_shared_layers: 18`) y un modo de razonamiento ("thinking mode"). Con un total de aproximadamente 7,996 millones de parametros (denominado E4B por sus ~4 mil millones de parametros activos en arquitectura de mezcla de expertos), el modelo se distribuye tanto en formato safetensors (bfloat16, ~17 GB) como en GGUF cuantizado (Q4_K_M, Q5_K_M, Q8_0), incluyendo un proyector multimodal (mmproj) para entrada de imagen y audio.

Su relevancia actual radica en ser uno de los primeros ejemplos de abliteracion aplicada a la nueva arquitectura Gemma 4, que presentaba dificultades tecnicas importantes (NaN activations, KV compartidos). El proceso de creacion fue casi totalmente autonomo: un agente de IA con menos de 10 prompts humanos diagnostico bugs, aplico el metodo `aggressive` y corrigio errores de versiones anteriores. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (mezcla de expertos, capas KV compartidas) |
| Parametros totales | 7.996.156.448 |
| Parametros activos | ~4.000.000.000 (E4B = Effective 4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, F16 (mmproj), bfloat16 (safetensors) |
| Idiomas soportados | no disponible (se observan salidas en ingles, tailandes y japones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Gemma 4 E4B es un modelo de mezcla de expertos con una arquitectura nueva (`gemma4`) que introduce dos particularidades: pesos KV compartidos entre capas (las capas 24-41 referencian los mismos tensores `k_proj`/`v_proj` que la capa 24, con `num_kv_shared_layers: 18`) y un modo de pensamiento ("thinking mode") integrado. La abliteracion se aplico con el metodo `aggressive` del toolkit OBLITERATUS, que combina SVD blanqueado, cirugia de cabezas de atencion y activaciones winsorizadas. Se usaron 842 pares de prompts contrastivos repartidos en 10 categorias para identificar las direcciones de rechazo, y se modificaron quirurgicamente 21 de las 42 capas del modelo. No hubo reentrenamiento ni fine-tuning.

El proceso de abliteracion se realizo casi por completo de forma autonoma mediante un agente Hermes Agent con menos de 10 prompts humanos. Durante el desarrollo se detecto un bug critico en la version v2: al proyectar el rechazo desde los tensores KV compartidos sobre todas las capas que los usaban, se aplicaba la proyeccion 18 veces sobre el mismo tensor, corrompiendolo y haciendo que `save_pretrained` eliminara 54 tensores de las capas 24-41. La version v3 corrige esto proyectando una sola vez sobre la capa propietaria y propagando automaticamente el resultado a las 18 capas dependientes.

## Capacidades

- Generacion de texto conversacional sin rechazo: responde a cualquier peticion sin negativas ni sermones de seguridad.
- Abliteracion completa de guardarrailes: 0 % de rechazo duro (frente al 98,8 % del modelo original).
- Entrada multimodal: incluye proyectil `mmproj-f16` para procesamiento de imagen y audio (vision y audio).
- Modo de razonamiento ("thinking mode"): heredado del modelo base Gemma 4, disponible en la arquitectura original.
- Compatibilidad con herramientas de inferencia estandar: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui (requiere versiones recientes).
- Capacidades multilingues: se observan respuestas en ingles, tailandes y japones, aunque con calidad variable.
- No requiere reentrenamiento: la abliteracion se aplica sobre los pesos originales sin modificar la inteligencia del modelo.

## Casos de uso

- **Investigacion en seguridad y alineacion de modelos**: permite estudiar los mecanismos internos de rechazo de Gemma 4 y comparar el comportamiento de un modelo con y sin guardarrailes sobre los mismos prompts, facilitando el desarrollo de tecnicas de mitigacion.
- **Analisis de sesgos y comportamientos indeseados**: al eliminar los rechazos, se puede explorar que tipo de contenido generaria el modelo sin restricciones, lo que sirve para auditar y documentar riesgos de la arquitectura base.
- **Generacion creativa sin restricciones**: escritura de ficcion, poesia, guiones y contenido literario que el modelo base podria rechazar por tematicas controvertidas (violencia en contexto narrativo, voces de personajes, etc.).
- **Despliegue en dispositivos con recursos limitados**: la cuantizacion Q4_K_M (4,9 GB) permite ejecutar el modelo en un iPhone o en un Raspberry Pi, ideal para prototipos y demos en el borde.
- **Aplicaciones de chat y conversacion**: integrable en Ollama o llama.cpp para construir asistentes conversacionales que no bloqueen ninguna pregunta, util en entornos de educacion o documentacion donde se necesite una respuesta directa sin evasivas.
- **Pruebas de robustez de pipelines de inferencia**: dado que la arquitectura `gemma4` es nueva, este modelo sirve para validar que las herramientas (llama.cpp, vLLM, etc.) manejan correctamente los pesos compartidos KV y el modo de razonamiento.

## Benchmarks y rendimiento

Segun la plataforma OpenModelMap, el modelo obtiene una puntuacion de MMLU de 62. No se han publicado resultados de benchmarks en la informacion disponible de la model card. El autor no proporciona datos de rendimiento en tareas estandar de razonamiento, codigo o matematicas.

| Metrica | Valor |
|---|---|
| MMLU | 62 (fuente: OpenModelMap) |
| Tasa de rechazo duro | 0 % |
| Desviacion suave (soft deflection) | ~28 % |
| Respuestas coherentes y relevantes | ~51 % |
| Salidas degeneradas (bucles de repeticion) | ~20 % |
| Idioma incorrecto | ~4 % |

## Requisitos de hardware

- **Q4_K_M (4,9 GB)**: se ejecuta en un iPhone o dispositivos con 4-6 GB de RAM; recomendado para pruebas moviles.
- **Q5_K_M (5,3 GB)**: punto de equilibrio calidad/portabilidad; cabe en 8 GB de RAM.
- **Q8_0 (7,4 GB)**: maxima calidad en cuantizacion; cabe en 8 GB de RAM, recomendado para CPU de sobremesa.
- **Safetensors bfloat16 (~17 GB)**: requiere una GPU con al menos 16 GB de VRAM (RTX 4080/4090, A100, H100) para inferencia sin cuantizacion.
- **Proyector mmproj-f16 (990 MB)**: necesario para entrada de imagen y audio; se carga junto con el modelo principal.
- **Herramientas de despliegue**: llama.cpp (build b8665+), Ollama 0.20+, LM Studio 0.3.16+, koboldcpp (ultima nightly), text-generation-webui con llama-cpp-python actualizado.
- **Latencia**: no disponible; depende de la cuantizacion y el hardware (un modelo de 4B activos en una GPU moderna ofrece un throughput tipico de 30-60 tokens/s en Q4_K_M).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo duro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OBLITERATUS/gemma-4-E4B-it-OBLITERATED | ~8B totales / ~4B activos | no disponible | 0 % | Apache 2.0 | safetensors + GGUF |
| google/gemma-4-E4B-it (base) | ~8B totales / ~4B activos | no disponible | 98,8 % | Apache 2.0 | safetensors |
| Otras variantes abliteradas de Gemma 4 (p. ej., Justbackup/gemma-4-E4B-it-OBLITERATED) | ~8B totales / ~4B activos | no disponible | no disponible | Apache 2.0 | safetensors + GGUF |

La comparacion directa con otros modelos abliterados de la misma categoria no esta disponible en la informacion proporcionada. La principal diferencia frente al modelo base es la eliminacion del rechazo; la inteligencia subyacente (capas de razonamiento, conocimiento) permanece intacta.

## Limitaciones y advertencias

- **Modelo de 4B activos**: tiene limitaciones inherentes en razonamiento complejo y conocimiento profundo; no es comparable a modelos de 70B o mas.
- **Salidas degeneradas**: aproximadamente un 20 % de las respuestas pueden entrar en bucles de repeticion; se recomienda usar `repeat_penalty` de 1,1 para mitigar.
- **Desvio suave**: el modelo a veces cambia de tema (~28 %) en lugar de responder directamente, lo que puede frustrar usuarios que buscan respuestas directas.
- **Idioma incorrecto**: en ~4 % de las respuestas genera texto en tailandes o japones; se recomienda incluir un system prompt explicito en ingles.
- **Sin guardarrailes**: el modelo puede generar contenido ofensivo, peligroso o ilegal; el uso en produccion debe restringirse a entornos controlados y con superposicion de filtros externos si es necesario.
- **Compatibilidad**: la arquitectura `gemma4` requiere herramientas actualizadas (llama.cpp b8665+); versiones antiguas pueden fallar al cargar el modelo o producir texto ilegible.
- **Riesgo de alucinacion**: como todo modelo de 4B, puede inventar datos o hechos; verificar informacion critica.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo se distribuye con el aviso de que es una herramienta de investigacion; el autor no se hace responsable de su uso indebido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OBLITERATUS/gemma-4-E4B-it-OBLITERATED)
- [Modelo base google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [Repositorio OBLITERATUS (GitHub)](https://github.com/elder-plinius/OBLITERATUS)
- [Hermes Agent (GitHub)](https://github.com/NousResearch/hermes-agent)
- [Espejo en Hugging Face (Justbackup)](https://huggingface.co/Justbackup/gemma-4-E4B-it-OBLITERATED)
- [Ficha en OpenModelMap](https://openmodelmap.com/model/OBLITERATUS/gemma-4-E4B-it-OBLITERATED)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/OBLITERATUS%2Fgemma-4-E4B-it-OBLITERATED,5pSqKFu5yk7Chajn1CjYuS)
