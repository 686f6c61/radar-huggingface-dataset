# joshycodes/fd-gemma-4-12b-self_st

## Resumen

`joshycodes/fd-gemma-4-12b-self_st` es un modelo de la comunidad publicado en Hugging Face por el usuario joshycodes, construido a partir de la familia Gemma 4 12B de Google DeepMind. El nombre y la etiqueta `gemma4_unified` sugieren que se trata de un ajuste fino (fine-tune) o derivado del modelo base Gemma 4 12B, presumiblemente orientado a un comportamiento de auto-steering o destilación (el sufijo `self_st`), aunque no se ha publicado ninguna model card que lo confirme. El repositorio tiene un total de 11.959.730.224 parametros en precision BF16, con un tamano de 24,0 GB.

El modelo base, Gemma 4 12B, es el primer modelo multimodal de tamano medio de Google sin encoder separado, capaz de ingerir audio y video de forma nativa, y esta disenado para desarrollo local con 16 GB de VRAM segun la guia oficial de desarrolladores de Google. La relevancia de este checkpoint concreto reside en que explora tecnicas de ajuste sobre ese base (posiblemente steering o destilacion), si bien la ausencia de documentacion, de benchmarks y de cualquier metrica de evaluacion limita su evaluacion objetiva por parte de terceros.

En el momento de redactar esta ficha, el modelo acumula 16 descargas y 0 likes, y no esta desplegado por ningun Inference Provider. No hay informacion publica sobre su dataset de entrenamiento, licencia ni idiomas soportados, por lo que debe tratarse como un artefacto experimental sin garantias de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4_unified`; derivado de Gemma 4 12B, presumiblemente transformer multimodal sin encoder) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 24,0 GB |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del checkpoint. La unica pista es la etiqueta `gemma4_unified` y el hecho de que el modelo base, Gemma 4 12B, es un modelo multimodal de Google DeepMind que, segun su guia de desarrollador, prescinde de encoder separado y puede ingerir audio y video de forma nativa. Se desconoce si este derivado conserva esas capacidades multimodales o si el ajuste las ha modificado.

Respecto al entrenamiento, no hay datos publicados: no se especifica el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o destilacion. El sufijo `self_st` y la existencia de otros repositorios del mismo autor (por ejemplo, `gemma-4-12B-it-valence-steering-distilled-plus3-lora`) apuntan a experimentos de steering y destilacion, pero se trata de una inferencia a partir del nombre y no de informacion confirmada. La model card esta vacia.

## Capacidades

- Generacion de texto: no confirmada explicitamente para este checkpoint, aunque heredable del base Gemma 4 12B.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision: el base Gemma 4 12B es multimodal, pero no se confirma que este derivado lo conserve.
- Audio y video: el base Gemma 4 12B puede ingerirlos de forma nativa; para este checkpoint, no confirmado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

No se ha publicado ninguna descripcion funcional especifica de este modelo; las capacidades anteriores solo pueden inferirse del modelo base y no estan verificadas para el checkpoint.

## Casos de uso

Dado que no existe model card ni evaluacion publica, los casos de uso son orientativos y condicionados a una validacion previa por parte del integrador:

- Experimentacion e investigacion sobre tecnicas de ajuste: el modelo encaja como objeto de estudio para reproducir o comparar metodos de steering y destilacion sobre Gemma 4 12B, ya que el autor publica variantes con nombres relacionados.
- Evaluacion comparativa de derivados comunitarios: util para medir como un fine-tune sin documentar se desvia del base Gemma 4 12B en tareas de generacion de texto.
- Desarrollo local en equipos con VRAM limitada: al tener 12B parametros, puede cuantizarse para caber en GPUs de consumo, siguiendo la recomendacion de 16 GB de VRAM del base.
- Prototipado rapido de asistentes conversacionales: si hereda las capacidades del base, podria servir para demos locales, siempre con validacion manual.
- Pipelines de generacion de texto por lotes en entornos controlados: uso como modelo de generacion en off-line processing, con supervision de calidad.
- Base para nuevos fine-tunes: punto de partida para proyectos que quieran partir de un derivado ya ajustado en lugar del base original.
- Estudio de sesgos y comportamiento: como checkpoint comunitario sin filtros documentados, puede emplearse en analisis de alineacion y sesgos.

Se recomienda no desplegarlo en produccion sin antes validar sus capacidades y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card, no se reportan metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y no existe comparacion oficial con el modelo base.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (11,96B) y no mediciones del modelo:

- Pesos en BF16 (formato publicado): aproximadamente 24 GB de VRAM solo para pesos, sin contar el KV cache; requiere GPUs como A100 40 GB, H100 o similares, o reparto en varias GPU.
- Cuantizacion INT8: en torno a 12-13 GB de VRAM estimados.
- Cuantizacion de 4 bits (Q4): en torno a 7-8 GB de VRAM estimados, lo que permitiria su ejecucion en GPUs de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090.
- Cabe en GPU de consumo: probablemente si, en cuantizaciones de 4 u 8 bits; en BF16 no en la mayoria de GPU de consumo.
- GPUs recomendadas: no confirmadas por el autor. Referencia del base: 16 GB de VRAM para desarrollo local segun la guia de Google.
- Opciones de despliegue: no confirmadas para este checkpoint. Habitualmente se usarian llama.cpp, Ollama, vLLM o TGI, pero la posible naturaleza multimodal del base puede limitar algunas de estas herramientas.
- Latencia y throughput: no disponibles.

No se dispone de datos de latencia ni de throughput medidos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/fd-gemma-4-12b-self_st | ~12B | no disponible | sin benchmarks | no disponible | Hugging Face, 16 descargas |
| Gemma 4 12B (Google DeepMind) | 12B | no disponible en la informacion proporcionada | no disponible | Gemma (terminos de Google) | Modelo oficial, integraciones con Hugging Face |
| joshycodes/gemma-4-12B-it-valence-steering-distilled-plus3-lora | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparacion se limita a lo publicado; no se dispone de metricas que permitan ordenar estos modelos por rendimiento. Existen alternativas de tamano similar en el ecosistema abierto (por ejemplo, modelos de 12B de otros fabricantes), pero no se han aportado datos que permitan una comparacion objetiva, por lo que se indica como no disponible.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion de arquitectura, entrenamiento ni uso previsto.
- Sesgos conocidos: no disponibles; al no documentarse el dataset, no puede evaluarse el sesgo de forma informada.
- Riesgo de alucinacion: no evaluado para este checkpoint.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan publicados.
- Restricciones de licencia: la licencia figura como no disponible, por lo que no puede asumirse su uso comercial. Debe verificarse antes de cualquier despliegue.
- Procedencia incierta: derivado comunitario de Gemma 4 12B sin confirmacion del autor sobre el proceso de ajuste ni sobre si conserva las capacidades multimodales del base.
- Riesgo de seguridad: al no especificarse alineacion ni filtros, el comportamiento en produccion es impredecible.
- Adopcion minima: 16 descargas y 0 likes, sin Inference Provider, lo que reduce la validacion por parte de la comunidad.
- No apto para produccion sin auditoria previa de calidad, sesgos y licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/fd-gemma-4-12b-self_st
- Repositorio relacionado del mismo autor: https://huggingface.co/joshycodes/gemma-4-12B-it-valence-steering-distilled-plus3-lora
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guia para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
