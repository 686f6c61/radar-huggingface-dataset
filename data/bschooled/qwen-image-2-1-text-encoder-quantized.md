# bschooled/Qwen-Image-2.1-text-encoder-quantized

## Resumen

Este repositorio no contiene un modelo de lenguaje independiente, sino un artefacto derivado: el codificador de texto (`text_encoder`) del modelo `Qwen/Qwen-Image-2.1`, publicado por el usuario `bschooled` como checkpoint pre-cuantizado en NF4 de 4 bits con doble cuantización de bitsandbytes. El objetivo declarado es reducir el peso en disco y en memoria del componente de texto de un pipeline Diffusers, pasando de unas shards BF16 de 17,5 GB a aproximadamente 6 GB, sin reentrenar ni modificar los pesos más allá de la cuantización.

El codificador se carga con la clase `Qwen3VLForConditionalGeneration`, lo que indica que el componente de texto de Qwen-Image-2.1 es un transformer multimodal de la familia Qwen3-VL. El repositorio incluye además, en `processor/`, el tokenizador y los ficheros de preprocesado de la misma revisión de origen, de modo que el par encoder y processor puede usarse sin descargar el repositorio base completo.

La relevancia práctica es acotada: sirve para despliegues locales de investigación en una única GPU donde el espacio de VRAM es el factor limitante. No es un modelo generativo autónomo ni una release oficial de Qwen, y hereda la restricción de uso exclusivamente de investigación del modelo base. El repositorio no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3-VL (componente de texto de Qwen-Image-2.1) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 4 bits con doble cuantizacion (bitsandbytes), dtype de computo bfloat16, almacenamiento uint8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; el modelo base es solo para investigacion segun la model card |
| Formato de pesos | safetensors (2 shards) con `quantization_config` embebido en `config.json` |

## Arquitectura y entrenamiento

El checkpoint deriva de la revision `d26bb61231c349cf6b7896fa83353113880e1ba3` del repositorio `Qwen/Qwen-Image-2.1`, subcarpeta `text_encoder`. El origen consta de cuatro shards BF16 (`model-00001-of-00004` a `model-00004-of-00004`), con tamanos de 4.998.056.552, 4.915.962.464, 4.915.962.496 y 2.704.357.976 bytes respectivamente, lo que suma aproximadamente 17,5 GB en BF16. Cada shard se cargo en una GPU CUDA con `device_map={"": "cuda"}` y `torch_dtype=bfloat16`, se cuantizo con la configuracion bitsandbytes indicada y se guardo con `save_pretrained` de `transformers`.

La configuracion de cuantizacion es `load_in_4bit=true`, `bnb_4bit_quant_type="nf4"`, `bnb_4bit_use_double_quant=true`, `bnb_4bit_compute_dtype="bfloat16"` y `bnb_4bit_quant_storage="uint8"`. El resultado son dos shards de 4.978.393.565 y 1.400.036.772 bytes. No se realizo fine-tuning, merge ni alteracion de pesos distinta de la cuantizacion. No hay informacion disponible sobre volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Codificacion de texto condicionada para el pipeline de generacion de imagenes Qwen-Image-2.1, actuando como componente `text_encoder`.
- Carga mediante `Qwen3VLForConditionalGeneration`, lo que implica soporte de la interfaz de generacion condicional de la familia Qwen3-VL.
- Procesamiento de entradas de texto con el tokenizador incluido en `processor/` (`tokenizer.json`, `vocab.json`, `merges.txt`, `added_tokens.json`).
- Plantilla de chat incluida (`chat_template.jinja`), utilizable para formatear conversaciones antes de la codificacion.
- Ficheros de preprocesado de imagen y video (`preprocessor_config.json`, `video_preprocessor_config.json`) presentes en el repositorio, aunque el artefacto publicado es solo el encoder de texto.
- Capacidades multilingues, de tool calling o de razonamiento agentico: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en una unica GPU de investigacion: cargar el encoder NF4 con `from_pretrained` reduce la huella del componente de texto de 17,5 GB a unos 6 GB, lo que permite encajar el pipeline completo en GPUs con menos VRAM que las necesarias para BF16.
- Integracion en Diffusers: el checkpoint se puede inyectar como `text_encoder` de un pipeline de Qwen-Image-2.1 sustituyendo las shards BF16 originales, manteniendo el resto del pipeline sin cambios.
- Prototipado rapido en entornos con almacenamiento limitado: el repositorio incluye tokenizador y processor, por lo que no hace falta descargar el repositorio base completo para probar la codificacion de prompts.
- Experimentacion con cuantizacion: sirve como referencia reproducible para medir el impacto de NF4 con doble cuantizacion frente a BF16 en la calidad de los embeddings de texto que alimentan el generador de imagenes.
- Servicios de inferencia con presupuesto de memoria ajustado: al reducir el peso del encoder, queda mas VRAM para el modulo de difusion y para batches mayores.
- Evaluacion comparativa de fidelidad: permite comparar salidas de imagen generadas con encoder BF16 frente a encoder NF4 sobre los mismos prompts, aislando el efecto de la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 6 GB solo para el encoder NF4; el pipeline completo de Qwen-Image-2.1 requiere adicionalmente el modulo de difusion y el VAE, cuyo consumo no se detalla en la informacion disponible.
- GPU recomendadas: cualquier GPU CUDA con al menos 8 GB de VRAM para el encoder aislado; para el pipeline completo se necesita margen adicional no cuantificado en la model card.
- Cabe en GPU de consumo: si, el encoder NF4 por si solo cabe en tarjetas de 8 GB o superiores; el pipeline completo depende del resto de componentes.
- Opciones de despliegue: carga nativa con `transformers` (`from_pretrained`, `Qwen3VLForConditionalGeneration`) y uso como componente de un pipeline Diffusers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bschooled/Qwen-Image-2.1-text-encoder-quantized | no disponible | no disponible | NF4 4 bits, doble quant | Solo investigacion (heredada) | Hugging Face, 6,4 GB |
| Qwen/Qwen-Image-2.1 (text_encoder BF16) | no disponible | no disponible | BF16 | Solo investigacion | Hugging Face, ~17,5 GB en 4 shards |
| Alternativas de codificador de texto cuantizado para pipelines de imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto derivado, no release oficial: no ha sido validado ni publicado por Qwen; la responsabilidad de la cuantizacion recae en el autor del repositorio.
- Perdida de fidelidad por cuantizacion: NF4 de 4 bits con doble cuantizacion puede degradar ligeramente los embeddings de texto respecto a BF16, con efecto potencial en la adherencia de las imagenes generadas al prompt; no hay evaluacion publicada que lo cuantifique.
- Licencia restringida: el modelo base es solo para investigacion y este checkpoint hereda la misma restriccion; no apto para uso comercial sin autorizacion explicita del titular de los derechos.
- Ambito limitado: solo contiene el codificador de texto; no genera imagenes por si mismo ni funciona como modelo de lenguaje autonomo.
- Idiomas y contexto: sin datos publicados sobre cobertura linguistica ni longitud maxima de secuencia.
- Sesgos y alucinacion: no documentados para este artefacto; al ser un encoder condicionado, el riesgo se manifiesta como desviacion del prompt en la imagen final, no como texto inventado.
- Dependencia de bitsandbytes y CUDA: la carga cuantizada requiere entorno compatible con bitsandbytes; el proceso de cuantizacion original se realizo en dispositivo CUDA.
- Sin señales de adopcion: cero descargas y cero likes en el momento de la consulta, lo que reduce la confianza en su validacion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bschooled/Qwen-Image-2.1-text-encoder-quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Revision de origen citada: `d26bb61231c349cf6b7896fa83353113880e1ba3` (subcarpeta `text_encoder`)
- Documentacion de bitsandbytes: no disponible en la informacion proporcionada
- Paper, blog o demo asociados: no disponibles en la informacion proporcionada
