# CharlieBT/kd31-ta2h

## Resumen

CharlieBT/kd31-ta2h es un modelo de 31.273.088.876 parametros (aproximadamente 31,3 mil millones) publicado en Hugging Face bajo licencia Apache 2.0 y acceso restringido (gated). El repositorio lo etiqueta como `gemma4`, `image-text-to-text` y `text-classification`, lo que sugiere una arquitectura derivada de la familia Gemma y un uso previsto multimodal con capacidad de clasificacion de texto. El pipeline declarado en la tarjeta es `text-classification`.

Se trata de un modelo resultante de una fusion (merge) de dos checkpoints: `danyloooah/reax-g2-soup2` y `draven123/sn92-gen-r2-k6`. La nomenclatura de los tags (`base_model:merge`) confirma que es un modelo derivado por combinacion de pesos, no un entrenamiento desde cero. El repositorio ocupa 62,6 GB en safetensors, coherente con un modelo denso de ~31B en precision de 16 bits.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: no hay model card descriptiva, no se declaran idiomas soportados, no hay benchmarks y las descargas y likes son cero en el momento de la consulta. Es, por tanto, un checkpoint experimental de un autor individual, no un modelo de referencia para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `gemma4` sugiere derivacion de la familia Gemma; no confirmado) |
| Parametros totales | 31.273.088.876 (~31,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o similar. Los tags del repositorio apuntan a `gemma4` como familia base y a `image-text-to-text` como modalidad, lo que sugiere un transformer multimodal con torre de vision, pero no hay confirmacion tecnica en la model card.

El origen del checkpoint es una fusion de dos modelos (`danyloooah/reax-g2-soup2` y `draven123/sn92-gen-r2-k6`), segun los campos `base_model` y `base_model:merge`. No se documenta la receta de merge (model soup, SLERP, TIES, DARE u otra), ni los hiperparametros, ni el proposito del autor al combinarlos. El pipeline declarado (`text-classification`) no concuerda del todo con la etiqueta multimodal, lo que puede indicar que el autor reutilizo la configuracion de un modelo previo sin ajustarla.

## Capacidades

- Generacion de texto: capacidad esperable por herencia de la familia Gemma, aunque no documentada en este checkpoint concreto.
- Clasificacion de texto: es el pipeline declarado en la tarjeta del modelo.
- Procesamiento imagen-texto: el tag `image-text-to-text` sugiere entrada multimodal, sin confirmacion en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, vision o audio: solo vision esta insinuada por los tags; el resto no disponible.

## Casos de uso

- Clasificacion de documentos y tickets: dado el pipeline declarado (`text-classification`), el uso mas directo es etiquetar textos en categorias predefinidas; requiere validacion empirica previa porque no hay metricas publicadas.
- Filtrado de contenido en pipelines de moderacion: un modelo de ~31B puede clasificar mensajes con matices, pero al no haber benchmarks ni idiomas declarados debe evaluarse en el dominio concreto antes de desplegarlo.
- Experimentacion en investigacion sobre fusion de modelos: el checkpoint es util como objeto de estudio de tecnicas de merge y de su efecto sobre tareas de clasificacion.
- Prototipado multimodal: si se confirma la capacidad imagen-texto, serviria para tareas de descripcion o clasificacion de imagenes con contexto textual, siempre con evaluacion local.
- Generacion de texto asistida en entornos controlados: por su tamano (31B) puede usarse para redaccion o resumen en despliegues con GPU de 80 GB o cuantizacion, aunque sin garantias de calidad documentadas.
- Base para fine-tuning especifico: al ser Apache 2.0 y safetensors, es plausible adaptarlo con LoRA a tareas concretas, aunque el acceso gated y la falta de documentacion anaden friccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: ~62,6 GB de pesos, mas overhead de activaciones y KV cache; en la practica requiere GPU de 80 GB (A100 80GB, H100 80GB) para inferencia comoda.
- VRAM estimada en cuantizacion 8 bits: ~31-35 GB; cabe en A100 40GB o en dos RTX 4090 con tensor parallelism.
- VRAM estimada en cuantizacion 4 bits: ~16-18 GB; cabe en una RTX 4090 (24 GB) o RTX 3090, siempre que se genere el GGUF o se use bitsandbytes, ya que el repo solo publica safetensors.
- GPU consumer: viable en RTX 4090/3090 solo con cuantizacion agresiva y sin garantia de throughput aceptable.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servidores; llama.cpp/Ollama solo si se convierte a GGUF, lo cual no esta publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-ta2h | ~31,3B | no disponible | Apache 2.0 | Gated en HF | Merge sin documentar, 0 descargas |
| Gemma 2 27B (Google) | 27B | 8K | Gemma Terms | Publico | Modelo oficial con benchmarks publicados |
| Qwen2.5 32B (Alibaba) | 32,5B | 128K | Apache 2.0 | Publico | Referencia abierta con evaluaciones detalladas |
| Mistral Small 24B | 24B | 32K | Apache 2.0 | Publico | Alternativa densa con tool calling documentado |

La comparacion es orientativa: los tres modelos de referencia cuentan con model cards completas y evaluaciones publicas, mientras que kd31-ta2h carece de ambas.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion de arquitectura, datos de entrenamiento ni intencion de uso.
- Sin benchmarks ni evaluaciones: imposible estimar calidad frente a alternativas conocidas.
- Acceso gated: requiere aceptar condiciones en Hugging Face, lo que anade friccion para reproduccion y auditoria.
- Riesgo de alucinacion: no cuantificado; al ser un merge sin validacion publicada, el riesgo es mayor que en checkpoints oficiales.
- Idiomas no declarados: no se puede asumir un rendimiento multilingue concreto, ni siquiera en castellano.
- Inconsistencia de metadatos: el pipeline `text-classification` convive con el tag `image-text-to-text`, lo que sugiere configuracion no revisada.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentacion traslada al integrador toda la responsabilidad de validacion.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware consumer exige trabajo adicional de conversion.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieBT/kd31-ta2h
- Modelo base 1: https://huggingface.co/danyloooah/reax-g2-soup2
- Modelo base 2: https://huggingface.co/draven123/sn92-gen-r2-k6
