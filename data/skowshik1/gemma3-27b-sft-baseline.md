# skowshik1/gemma3-27b-sft-baseline

## Resumen

gemma3-27b-sft-baseline es un ajuste fino supervisado (SFT) del modelo multimodal google/gemma-3-27b-it, publicado por el usuario skowshik1 en HuggingFace. Se trata de un experimento de ajuste realizado con la libreria TRL de HuggingFace, orientado a establecer una linea base (baseline) de entrenamiento sobre la que comparar posteriores iteraciones. El repositorio no documenta el dataset, el numero de pasos ni los hiperparametros empleados, por lo que su valor principal es el de reproducir el pipeline de entrenamiento mas que el de ofrecer un modelo listo para produccion.

Al partir de Gemma 3 27B, hereda las caracteristicas del modelo base: arquitectura transformer decoder-only densa de aproximadamente 27.000 millones de parametros, ventana de contexto de hasta 128.000 tokens, capacidades multimodales (texto e imagen) y soporte de mas de 140 idiomas segun la documentacion de Google. Es relevante ahora porque el ecosistema de ajuste con TRL y trabajos remotos (hf_jobs) se ha estandarizado, y fichas como esta permiten evaluar el coste real de adaptar un modelo de 27B a un dominio concreto.

El repositorio ocupa solo 0,5 GB, un tamano muy inferior al esperable para los pesos de un modelo de 27B en safetensors (que en bf16 rondarian los 54 GB). Esto sugiere, como hipotesis tecnica, que la subida contiene adaptadores, pesos parciales o un subconjunto de los tensores, y no el modelo completo. No hay benchmarks, licencia explicita ni idiomas declarados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atencion local-global intercalada (heredada de google/gemma-3-27b-it) |
| Parametros totales | ~27.000 millones (heredado del modelo base; no declarado en el repositorio) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no declarada en el repositorio) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite int4/int8 (bitsandbytes), GGUF y otras segun el ecosistema |
| Idiomas soportados | no disponibles en el repositorio; el modelo base declara soporte de mas de 140 idiomas |
| Licencia | no disponible (la model card contiene el marcador de posicion "licence: license"); al derivar de Gemma 3 se heredan las condiciones de uso de Gemma |
| Formato de pesos | safetensors (libreria transformers, tags: safetensors, generated_from_trainer) |
| Metodo de entrenamiento | SFT con TRL (tag: sft), lanzado como hf_jobs |
| Modelo base | google/gemma-3-27b-it |
| Tamano del repositorio | 0,5 GB |
| Versiones de framework | TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1, Tokenizers 0.23.2 |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint google/gemma-3-27b-it, que emplea una arquitectura transformer decoder-only con atencion intercalada local y global (ventanas locales combinadas con capas de atencion global en una proporcion fija), Grouped-Query Attention y RMSNorm, ademas de un codificador de vision para entradas de imagen. El ajuste no modifica la topologia del modelo base: se aplica SFT sobre los pesos preentrenados mediante la libreria TRL, en su version 1.13.0, ejecutado sobre infraestructura remota de HuggingFace (tag hf_jobs).

No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, la duracion del entrenamiento ni los hiperparametros (learning rate, batch size, epocas, tipo de enmascarado de perdida). Tampoco se documenta si se congelaron capas, si se uso LoRA u otra tecnica de adaptacion eficiente de parametros, ni si se aplico posteriormente RLHF, DPO u otro metodo de alineamiento. La unica informacion sobre el procedimiento es que se trato de un entrenamiento SFT con TRL y las versiones exactas de las dependencias empleadas, lo que permite reproducir el entorno pero no el experimento.

## Capacidades

Estas capacidades corresponden al modelo base google/gemma-3-27b-it; el ajuste SFT puede haberlas alterado sin que exista documentacion al respecto.

- Generacion de texto y conversacion multi-turno en formato de chat (se emplea la plantilla de roles con `{"role": "user", "content": ...}`).
- Comprension y generacion de texto en mas de 140 idiomas, segun las especificaciones del modelo base.
- Razonamiento y matematicas de nivel medio-alto, caracteristico de la familia Gemma 3 en su tamano de 27B.
- Generacion de codigo en multiples lenguajes de programacion.
- Capacidades multimodales de entrada de imagen (vision-lenguaje) heredadas del modelo base.
- Ventana de contexto de 128.000 tokens, adecuada para documentos largos, repositorios de codigo y conversaciones extensas.
- Soporte de tool calling y function calling heredado del formato instruct del modelo base.
- Uso en flujos de agente y razonamiento de varios pasos, supeditado a la plantilla de chat y al soporte del runtime.
- No se documenta modo de razonamiento explicito (thinking mode) propio de este ajuste, ni capacidades de audio.

## Casos de uso

- Linea base de investigacion en ajuste fino: sirve como punto de referencia para medir la ganancia de tecnicas posteriores (DPO, RLHF, LoRA frente a ajuste completo) sobre el mismo modelo base, ya que documenta las versiones exactas de TRL, Transformers y PyTorch empleadas.
- Reproduccion de entornos de entrenamiento: las versiones de framework declaradas permiten reproducir el stack de SFT con TRL y aislar problemas de compatibilidad de dependencias en trabajos remotos.
- Prototipado de asistentes conversacionales de dominio especifico: partiendo del modelo ajustado, se puede evaluar si la adaptacion SFT mejora el tono o el formato de respuesta esperado en un vertical concreto.
- Evaluacion comparativa de checkpoints: al ser un baseline, resulta util para comparar cualitativamente respuestas frente al modelo base sin ajustar en el mismo prompt y con la misma configuracion de decodificacion.
- Generacion y resumen de documentos largos: con la ventana de 128.000 tokens del modelo base puede procesar informes extensos o bases de codigo completas, siempre que el ajuste no haya degradado esa capacidad.
- Experimentacion multimodal controlada: si el ajuste conserva el codificador de vision, permite probar flujos de descripcion de imagenes, extraccion de informacion de capturas o transcripcion de graficos.
- Docencia y formacion en tecnicas de SFT: el ejemplo de la model card con `transformers.pipeline` y `device="cuda"` facilita demostrar el flujo completo de carga y generacion de un modelo ajustado.
- No se recomienda su uso en produccion critica sin una evaluacion previa, dado que no hay benchmarks ni datos de licencia declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de `skowshik1/gemma3-27b-sft-baseline` no incluye ninguna tabla de evaluacion, y los resultados de la busqueda web realizada no contienen informacion relacionada con el modelo ni con la familia Gemma (los enlaces devueltos corresponden a una plataforma educativa sin relacion con el tema). No se dispone, por tanto, de cifras de MMLU, HumanEval, GSM8K ni de comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 54 GB solo para pesos, a los que hay que sumar cache KV y activaciones; se recomienda un minimo de 64-80 GB.
- VRAM en int8: aproximadamente 27-30 GB de pesos, con margen para contexto; factible en una A100 40 GB o H100 80 GB.
- VRAM en int4: aproximadamente 14-16 GB de pesos, lo que permitiria ejecucion en GPU de consumo con 24 GB.
- GPU recomendadas para precision completa: H100 80 GB, A100 80 GB, o varias A100 40 GB con tensor parallelism.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar el modelo en cuantizacion de 4 bits; en bf16 se requiere reparto entre dos o mas GPU y posiblemente offload a CPU.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), SGLang, llama.cpp con pesos GGUF, Ollama y la propia libreria transformers mediante `pipeline`.
- Advertencia de despliegue: dado que el repositorio ocupa solo 0,5 GB, es probable que la carga requiera el modelo base google/gemma-3-27b-it junto con el artefacto ajustado; conviene verificar el contenido del repositorio antes de planificar la infraestructura.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| skowshik1/gemma3-27b-sft-baseline | ~27B (heredado) | 128.000 tokens (heredado) | no disponible | HuggingFace, 0 descargas y 0 likes | Ajuste SFT sin dataset ni benchmarks documentados |
| google/gemma-3-27b-it | ~27B | 128.000 tokens | Condiciones de uso de Gemma | HuggingFace y Vertex AI | Modelo base oficial, con documentacion completa y evaluaciones publicadas |
| Qwen2.5-32B-Instruct | ~32B | 128.000 tokens (segun documentacion del modelo) | Apache 2.0 (segun documentacion del modelo) | HuggingFace | Alternativa densa de tamano similar con licencia permisiva; datos no verificados en esta busqueda |
| Mistral-Small-3.1-24B-Instruct | ~24B | 128.000 tokens (segun documentacion del modelo) | Apache 2.0 (segun documentacion del modelo) | HuggingFace | Alternativa de tamano ligeramente inferior; datos no verificados en esta busqueda |

La comparativa se limita a parametros, contexto, licencia y disponibilidad, ya que no existe informacion de rendimiento publicada para el modelo ajustado ni datos de benchmarks recogidos en la busqueda web realizada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni ejemplos de salida mas alla del fragmento de codigo de la model card.
- Procedencia de los datos de entrenamiento desconocida: no se especifica dataset, numero de tokens, filtrado ni posible contaminacion con datos de evaluacion.
- Tamano del repositorio incoherente: 0,5 GB es muy inferior a lo esperable para 27B parametros en safetensors, por lo que puede tratarse de adaptadores, pesos parciales o una subida incompleta. Verificar antes de asumir que es un modelo autocontenido.
- Licencia sin definir: la model card incluye un marcador de posicion ("licence: license") y los metadatos de HuggingFace no declaran licencia. Al derivar de Gemma 3, se heredan las condiciones de uso de Gemma de Google, que imponen obligaciones de atribucion y restricciones de uso; cualquier uso comercial debe revisarse contra dichas condiciones.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; al no existir evaluacion del ajuste, se desconoce si el SFT ha incrementado o reducido este comportamiento.
- Riesgo de regresion por sobreajuste: un SFT sin validacion documentada puede degradar capacidades generales, multilingues o multimodales del modelo base, asi como la adherencia a instrucciones.
- Idiomas: no declarados para este ajuste; el soporte multilingue del modelo base no garantiza que se conserve tras el entrenamiento.
- Sesgos: no evaluados. El modelo base puede reproducir sesgos presentes en sus datos de preentrenamiento y en el dataset de SFT, que es desconocido.
- Uso en produccion: no recomendado sin una evaluacion propia de calidad, seguridad, latencia y coste, y sin aclarar previamente la situacion de licencia.
- Resultados de busqueda web no concluyentes: las busquedas realizadas no devolvieron documentacion tecnica, papers ni articulos relacionados con este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skowshik1/gemma3-27b-sft-baseline
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Repositorio de TRL: https://github.com/huggingface/trl
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados al modelo en la busqueda web realizada.
