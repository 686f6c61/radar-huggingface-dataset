# qalduaij/lolo_Q8y_Dialect_v2

## Resumen

lolo_Q8y_Dialect_v2, comercializado como "Q8y Dialect", es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct orientado especificamente al dialecto kuwaiti del arabe. Lo desarrolla Qusai Al-duaij (qalduaij) dentro de la denominada familia "lolo" de modelos de IA centrados en el dialecto kuwaiti. El modelo busca resolver la escasez de recursos de IA que dominen las particularidades lexicas, fonologicas y culturales del kuwaiti, incluyendo su patrimonio maritimo y social, y esta disenado para la redaccion de narrativa radiofonica y dramatica kuwaiti.

Tecnicamente, el modelo hereda la arquitectura transformer decoder-only de Qwen2.5-14B-Instruct, con 14.770.033.664 parametros totales y una ventana de contexto de 32.768 tokens (caracteristica del modelo base Qwen2.5-14B). Se distribuye en formatos safetensors y GGUF, incluyendo una cuantizacion Q8, lo que facilita su despliegue en entornos con recursos limitados. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que es uno de los pocos modelos publicos dedicados de forma explicita al dialecto kuwaiti, un registro del arabe con escasa representacion en los grandes modelos multilingues. El autor declara que el entrenamiento se apoya en la enciclopedia del dialecto kuwaiti de Khaled Al-Rashid, un estudio de la doctora Suha Naja y 62 fuentes audiovisuales y textuales de entrevistas, series y obras de teatro kuwaities.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun el modelo base Qwen2.5-14B) |
| Tipos de cuantizacion | Q8 (GGUF); safetensors en precision completa |
| Idiomas soportados | ar, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-14B-Instruct, un transformer decoder-only de 14.700 millones de parametros con atencion por ventanas deslizantes y atencion completa combinadas, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El ajuste fino se realizo con la libreria Unsloth, segun las etiquetas del repositorio, lo que sugiere un entrenamiento supervisado (SFT) eficiente en memoria sobre el modelo base ya instruido.

El autor declara que el corpus de entrenamiento se nutre de la enciclopedia del dialecto kuwaiti del investigador Khaled Al-Rashid, el estudio de la doctora Suha Naja y 62 fuentes audiovisuales y textuales que incluyen entrevistas, series de television y obras de teatro kuwaities. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales. La innovacion principal es la especializacion dialectal: el modelo incorpora reglas de "قلب صوتي" (inversion fonetica) kuwaiti y un lexico autentico como "قاعد", "صج", "شنو", "شحقه", "وايد", "أثاري" y "يتراوالي".

## Capacidades

- Generacion de texto en dialecto kuwaiti con lexico y fonologia autenticos.
- Redaccion de narrativa radiofonica y televisiva continua, con voz de locutor o narrador y sin acotaciones de direccion intercaladas.
- Documentacion y preservacion del patrimonio maritimo y social kuwaiti.
- Redaccion de guiones dramaticos kuwaities.
- Comprension y generacion en arabe estandar y en ingles (heredadas del modelo base).
- Conversacion multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible").
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio o modo de razonamiento explicito; al heredar Qwen2.5-14B-Instruct es probable que conserve parte de estas capacidades, pero no estan documentadas en la model card.

## Casos de uso

- Produccion de boletines y programas de radio kuwaities: el modelo puede redactar textos para locutor con la cadencia y el lexico del kuwaiti hablado, eliminando la necesidad de reescritura manual por parte de un guionista dialectal.
- Guiones de series y obras de teatro costumbristas: permite generar dialogos con expresiones como "شنو" o "شحقه" en el registro adecuado, util para productoras que trabajan tematica kuwaiti.
- Preservacion del patrimonio oral y maritimo: el modelo puede transcribir y reescribir relatos de entrevistas y fuentes historicas en un kuwaiti coherente, apoyando proyectos de documentacion cultural.
- Atencion al cliente en kuwaiti: al ser conversacional y soportar multi-turno, puede gestionar interacciones con clientes que prefieren expresarse en dialecto en lugar de arabe estandar, mejorando la cercania.
- Localizacion de contenidos para el mercado kuwaiti: adaptacion de campanas, subtitulos y material editorial al registro dialectal, tarea en la que los modelos genericos suelen derivar al arabe estandar.
- Investigacion linguistica y dialectologia: generacion de corpus sinteticos controlados en kuwaiti para estudios de fonologia, lexico o variacion, gracias a su base documentada en fuentes academicas.
- Educacion y divulgacion cultural: creacion de materiales didacticos sobre el dialecto kuwaiti y su patrimonio para escuelas y museos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 30 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 40-48 GB.
- VRAM estimada con cuantizacion Q8: aproximadamente 15-16 GB para pesos, viable en GPUs de 24 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para Q8.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizacion Q8; en RTX 3090 (24 GB) de forma ajustada; en GPUs de 16 GB requeriria cuantizaciones menores no documentadas en el repositorio.
- Opciones de despliegue: llama.cpp y Ollama para los pesos GGUF; vLLM y TGI para los safetensors; el tag "endpoints_compatible" sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lolo_Q8y_Dialect_v2 | 14,77 B | 32.768 tokens | Dialecto kuwaiti | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-14B-Instruct | 14,7 B | 32.768 tokens | Instruccion general multilingue | Apache 2.0 | Hugging Face |
| Modelos arabes especializados en dialectos (genericos) | no disponible | no disponible | Dialectos arabes varios | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas especificas del dialecto kuwaiti en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: al ser un ajuste fino sobre un modelo de 14 B, puede generar expresiones dialectales plausibles pero inexactas o inventar terminos del patrimonio kuwaiti.
- Sesgo de dominio: el entrenamiento se centra en fuentes concretas (enciclopedia, estudio academico y 62 fuentes audiovisuales), lo que puede limitar la cobertura de variantes regionales o registros modernos del kuwaiti.
- Cobertura linguistica limitada a arabe y ingles; no se documenta soporte de otros idiomas.
- El contexto de 32.768 tokens corresponde al modelo base y no se confirma que se haya validado tras el ajuste fino.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la exactitud cultural o dialectal del contenido generado.
- La model card esta redactada principalmente en arabe; la documentacion tecnica en otros idiomas es escasa.

## Enlaces

- [Hugging Face: qalduaij/lolo_Q8y_Dialect_v2](https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v2)
- [Modelo base: Qwen/Qwen2.5-14B-Instruct](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct)
- [Unsloth](https://github.com/unslothai/unsloth)
