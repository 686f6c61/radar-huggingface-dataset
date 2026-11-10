# aliRafik/gpt_oss_finetuned_16bit_book_writer

## Resumen

`aliRafik/gpt_oss_finetuned_16bit_book_writer` es un ajuste fino (fine-tuning) del modelo `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, que a su vez deriva del modelo abierto GPT-OSS-20B de OpenAI. Lo publica el usuario aliRafik en Hugging Face con licencia Apache 2.0 y orientado, segun el nombre del repositorio, a la generacion de libros y textos largos. El modelo se distribuye en formato de 16 bits (de ahi el sufijo `16bit`), lo que se traduce en un repositorio de 16,5 GB.

Tecnicamente hereda la arquitectura del GPT-OSS-20B original, un transformer tipo Mixture-of-Experts (MoE) con aproximadamente 21.000 millones de parametros totales y unos 3.600 millones de parametros activos por token. El ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card, partiendo de una version cuantizada en 4 bits (bnb-4bit) del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de fine-tuning comunitario sobre un modelo abierto reciente; por otro, advierte de que la informacion publicada por el autor es minima (no hay detalles de dataset, hiperparametros ni evaluaciones), por lo que muchas especificaciones deben tratarse como no disponibles o inferidas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts), heredada de GPT-OSS-20B |
| Parametros totales | ~21.000 millones (modelo base GPT-OSS-20B) |
| Parametros activos | ~3.600 millones por token (modelo base GPT-OSS-20B) |
| Longitud de contexto | no disponible en la informacion proporcionada (el GPT-OSS-20B original soporta hasta 131.072 tokens, dato no confirmado para este fine-tuning) |
| Tipos de cuantizacion | Pesos publicados en 16 bits; el modelo base de partida estaba cuantizado en 4 bits (bnb-4bit). No se documentan otras variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de transformers, 16,5 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del GPT-OSS-20B, un transformer con capas de atencion y mezcla de expertos (MoE) en el que solo se activa una fraccion de los parametros por token (aproximadamente 3.600 millones de 21.000 millones). Esta configuracion permite un coste de inferencia cercano al de un modelo denso de ~3-4B manteniendo la capacidad de representacion de un modelo de 21B. El fine-tuning se realizo con Unsloth y TRL, segun la model card, partiendo de la version `unsloth/gpt-oss-20b-unsloth-bnb-4bit` (base cuantizada en 4 bits) y publicando el resultado en 16 bits.

No se dispone de informacion sobre el dataset de ajuste, el numero de tokens utilizados, la composicion de los datos, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales introducidas por el autor mas alla del propio fine-tuning. Cualquier detalle sobre el proceso de entrenamiento (learning rate, epochs, LoRA vs. full fine-tuning) debe considerarse no disponible.

## Capacidades

- Generacion de texto de formato largo, presumiblemente orientada a la redaccion de libros y capitulos (segun el nombre del repositorio), aunque el autor no documenta esta capacidad de forma explicita.
- Razonamiento y generacion de texto general, heredados del GPT-OSS-20B.
- Generacion de codigo y matematicas: capacidad esperable del modelo base, no verificada para este fine-tuning.
- Soporte de tool calling / function calling: el GPT-OSS-20B original lo soporta; no confirmado tras el ajuste.
- Modo de razonamiento (thinking mode) del GPT-OSS original: no confirmado en esta variante.
- Capacidades multilingues: limitadas al ingles segun la model card (`language: en`).
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Redaccion de libros y textos largos: el modelo se ha ajustado especificamente (por nombre) para la escritura de libros; puede emplearse para generar borradores de capitulos, sinopsis o estructuras narrativas, aunque la falta de evaluaciones obliga a validar la calidad manualmente.
- Generacion de contenido editorial asistida: integracion en flujos de trabajo de editoriales o creadores de contenido para producir primeros borradores que un humano revise y edite.
- Prototipado de asistentes de escritura: al ser un modelo de ~21B con ~3,6B activos, puede desplegarse en infraestructura moderada para experimentar con asistentes de redaccion en ingles.
- Fine-tuning adicional o investigacion: sirve como punto de partida (16 bits) para nuevos ajustes comunitarios sobre GPT-OSS-20B, con licencia Apache 2.0 permisiva.
- Generacion de resumenes y reescritura de textos largos: uso generico de generacion de texto en ingles, aprovechando la ventana de contexto del modelo base (a validar).
- Educacion y demostraciones: ejemplo didactico de pipeline de fine-tuning con Unsloth + TRL sobre un modelo MoE abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 40-45 GB solo para pesos (21B parametros x 2 bytes), mas overhead de KV cache y activaciones; en la practica requiere GPUs de 48 GB o mas (A6000, A100 80GB, H100) o multi-GPU.
- Cuantizacion a 8 bits: ~21-24 GB de VRAM, viable en una RTX 4090 (24 GB) con margen ajustado.
- Cuantizacion a 4 bits: ~12-14 GB de VRAM, viable en RTX 4090, RTX 3090 o GPUs consumer de 16 GB o mas.
- GPU recomendadas: A100 80GB, H100, A6000 para 16 bits; RTX 4090/3090 para cuantizaciones 4-8 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp/Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~3,6B parametros activos, el throughput esperado es superior al de un denso de 21B, pero no hay mediciones publicadas para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| aliRafik/gpt_oss_finetuned_16bit_book_writer | ~21B totales / ~3,6B activos | no disponible | Apache 2.0 | Fine-tuning comunitario, sin benchmarks publicados |
| unsloth/gpt-oss-20b-unsloth-bnb-4bit (base) | ~21B totales / ~3,6B activos | 131.072 tokens (GPT-OSS-20B original) | Apache 2.0 | Version cuantizada en 4 bits del GPT-OSS-20B, pensada para fine-tuning |
| openai/gpt-oss-20b (original) | ~21B totales / ~3,6B activos | 131.072 tokens | Apache 2.0 | Modelo base oficial, con benchmarks publicados por OpenAI |
| Mistral Small 3 (24B) | 24B densos | 32.000 tokens | Apache 2.0 | Alternativa densa de tamano similar, mas costosa en inferencia por token |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento: riesgo de sesgos desconocidos y de sobreajuste a un corpus no identificado.
- No hay evaluaciones ni benchmarks publicados; la calidad real del modelo frente al GPT-OSS-20B original es desconocida.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la falta de validacion del fine-tuning.
- Soporte limitado al ingles segun la model card; no se garantiza calidad en castellano ni en otros idiomas.
- El modelo se publica en 16 bits (16,5 GB), lo que dificulta su uso en GPUs consumer sin cuantizacion adicional; no se incluyen variantes GGUF.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar las condiciones del GPT-OSS-20B original y de la version de Unsloth de la que deriva.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- El nombre sugiere un uso especifico (escritura de libros) que no esta respaldado por documentacion tecnica; no debe asumirse un rendimiento superior en esa tarea sin pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aliRafik/gpt_oss_finetuned_16bit_book_writer
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
