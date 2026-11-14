# foofifoo/Mawdistical-Synica-27B-GGUF

## Resumen

Mawdistical-Synica-27B-GGUF es una coleccion de cuantizaciones GGUF del modelo Synica-27B, un fine-tune de Qwen/Qwen3.8-27B publicado por el usuario foofifoo en Hugging Face. El modelo esta orientado a generacion de texto conversacional con enfasis en roleplay, contenido para adultos y tematica furry/anthro, segun las etiquetas declaradas por el autor. No se trata de un modelo de proposito general ni de un lanzamiento oficial de Qwen: es una derivacion de la comunidad sobre una base de 27.000 millones de parametros.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, no incluye model card tecnica propia (solo la receta de cuantizacion) y no aporta datos de entrenamiento, benchmarks ni evaluaciones. La informacion disponible se limita a la receta de cuantizacion GGUF, los tags del repositorio y el modelo base declarado. Cualquier dato sobre arquitectura interna, dataset o rendimiento del fine-tune debe considerarse no disponible.

El interes tecnico, por tanto, reside en la receta de cuantizacion mixta aplicada sobre una arquitectura hibrida (se observan tensores `ssm_*` y un bloque `nextn`), no en el modelo en si. Los desarrolladores que evalúen este repositorio deben tratarlo como un artefacto experimental de la comunidad sin garantias de calidad, soporte ni documentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base Qwen/Qwen3.8-27B no aporta ficha publica en la informacion proporcionada; los tensores `ssm_in`, `ssm_out`, `ssm_alpha`, `ssm_beta` y el bloque `nextn` sugieren componentes de state space model y una cabeza de prediccion multi-token) |
| Parametros totales | 27B (nominal, segun el nombre del modelo y el base_model declarado) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: iQ6_K-XL (6,99 BPW) e iQ4_K_M (5,21 BPW); receta mixta con q8_0/q6_k en embeddings, atencion y SSM, y bf16 en tensores sensibles (`ssm_alpha`, `ssm_beta`, `nextn.eh_proj`) |
| Idiomas soportados | en (ingles) |
| Licencia | other (no se especifican terminos; hereda presumiblemente las restricciones del modelo base, no detalladas) |
| Formato de pesos | GGUF (cuantizaciones); el modelo original Synica-27B se distribuye en formato transformers |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Qwen/Qwen3.8-27B ni sobre el proceso de entrenamiento del fine-tune Synica-27B. La unica evidencia estructural proviene de la receta de cuantizacion publicada, que revela la presencia de tensores de state space model (`ssm_in.weight`, `ssm_out.weight`, `ssm_alpha.weight`, `ssm_beta.weight`) en cada bloque, lo que apunta a una arquitectura hibrida entre atencion y SSM, y de un bloque adicional `blk.64.nextn.eh_proj.weight`, indicativo de una cabeza de prediccion multi-token (estilo MTP/NextN) para decodificacion especulativa. El numero de bloques aparente es 65 (indices 0 a 64), con el bloque 64 reservado a la cabeza NextN.

La receta de cuantizacion usa una matriz de importancia (imatrix) generada a partir de las cuantizaciones previas del mismo autor (Mawdistical-S1/Synica-27B-GGUF) y aplica precision diferenciada: q8_0 para embeddings de entrada y salida, proyecciones de atencion (`attn_v`, `attn_output`) y tensores SSM, bf16 para `ssm_alpha`, `ssm_beta` y la proyeccion `nextn.eh_proj`, y q8_0 para los bloques 0 y 63 completos. La variante iQ4_K_M rebaja a q6_k los embeddings, la salida, `attn_v` y `ssm_out`, manteniendo bf16 en `ssm_alpha` y `ssm_beta`. No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni tecnicas de alineacion.

## Capacidades

- Generacion de texto en ingles orientada a conversacion y roleplay, segun los tags del repositorio (`roleplay`, `chat`).
- Contenido explicito y para adultos (`nsfw`, `explicit`), con tematica furry y anthro (`furry`, `anthro`).
- Etiqueta `manipulation` en los tags del autor, sin aclaracion sobre su significado (podria referirse a dinamicas de roleplay o a contenido de manipulacion narrativa; no verificable).
- Etiqueta `mixed-AI` en los tags, sin definicion publicada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Capacidad de decodificacion especulativa: inferida de la presencia del bloque `nextn` en la receta de cuantizacion, no confirmada por el autor.

## Casos de uso

- Roleplay conversacional en ingles: el modelo esta afinado explicitamente para este escenario segun los tags `roleplay` y `chat`, y las cuantizaciones iQ4_K_M permiten ejecutarlo en hardware de consumo. Adecuado solo para entornos donde el contenido adulto sea aceptable.
- Personajes antropomorficos y narrativa furry: los tags `furry` y `anthro` indican un fine-tune orientado a este dominio, util para comunidades que generan ficcion interactiva con personajes no humanos.
- Experimentacion con cuantizacion mixta: la receta publicada (precision diferenciada por tipo de tensor, imatrix propia, bf16 en tensores sensibles) sirve como referencia tecnica para quien quiera replicar el proceso sobre otros modelos hibridos.
- Investigacion sobre decodificacion especulativa: la presencia del bloque `nextn` permite estudiar el uso de cabezas MTP en modelos cuantizados, siempre que se valide su funcionamiento en llama.cpp.
- Despliegue local en ingles para generacion creativa: con la variante iQ4_K_M (5,21 BPW) el modelo es candidato a ejecutarse en GPUs de consumo con suficiente VRAM, aunque no hay datos de rendimiento que lo confirmen.
- Evaluacion comparativa de fine-tunes de la comunidad: util como caso de estudio de modelos derivados sin model card tecnica, para analizar riesgos de trazabilidad y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Estimacion orientativa a partir del tamano y BPW: iQ4_K_M (5,21 BPW) ~14-16 GB de pesos, mas overhead de contexto y cache KV; iQ6_K-XL (6,99 BPW) ~19-21 GB de pesos, mas overhead.
- GPU recomendadas: no disponibles. Por tamano, una RTX 4090 (24 GB) podria alojar la variante iQ4_K_M con contexto moderado; la iQ6_K-XL requeriria GPUs de 24 GB o mas con contexto reducido, o configuraciones multi-GPU.
- Cabe en GPU de consumo: probablemente si para iQ4_K_M en GPUs de 16-24 GB, sujeto a validacion empirica no disponible.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (fine-tunes de roleplay de 27B sobre base Qwen) con datos verificables de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay datos de dataset, entrenamiento, evaluacion ni alineacion; el modelo no es auditable.
- Contenido explicito y NSFW: no apto para entornos productivos generales, menores ni aplicaciones publicas sin filtrado.
- Etiqueta `manipulation` sin definir: riesgo de que el fine-tune este optimizado para dinamicas conversacionales coercitivas o de roleplay intenso; requiere evaluacion previa.
- Licencia `other` sin terminos publicados: no se puede confirmar el uso comercial; ademas, el modelo base Qwen puede imponer sus propias restricciones no reflejadas aqui.
- Solo ingles declarado: sin soporte multilingue verificado.
- Riesgo de alucinacion: no evaluado; al ser un fine-tune de roleplay, la fidelidad factual no es un objetivo declarado.
- Cero descargas y cero likes: sin validacion por parte de la comunidad, sin issues reportados ni evidencia de funcionamiento correcto de las cuantizaciones.
- Arquitectura hibrida con SSM y bloque NextN: el soporte en llama.cpp de estos tensores puede ser incompleto o experimental, lo que afecta a la fidelidad de la cuantizacion.
- Sin garantias de mantenimiento, soporte ni actualizaciones por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/foofifoo/Mawdistical-Synica-27B-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/Mawdistical-S1/Synica-27B
- Cuantizaciones previas con imatrix (referenciadas): https://huggingface.co/Mawdistical-S1/Synica-27B-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
