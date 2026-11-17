# avar6/DeepSeek-V4-Flash-Vision-Uncensored-exl3-2.5bpw

## Resumen

DeepSeek-V4-Flash-Vision-Uncensored-exl3-2.5bpw es una cuantizacion en formato EXL3 (ExLlamaV3) a 2,5 bits por peso del modelo orcarouter/DeepSeek-V4-Flash-Vision-Uncensored, publicada por el usuario avar6 en Hugging Face. Se trata de una variante derivada de la familia DeepSeek V4 en su rama "Flash" con capacidades de vision, y con el sufijo "Uncensored", que indica que el modelo base ha sido sometido a algun proceso de eliminacion o reduccion de los filtros de alineamiento y rechazo. El paquete pesa 104,4 GB y contiene 52.112.526.526 parametros segun los metadatos de safetensors.

La relevancia de esta publicacion es practica mas que cientifica: permite ejecutar un modelo de gran tamano con capacidad multimodal en hardware mas modesto mediante la cuantizacion agresiva a 2,5 bpw que ofrece ExLlamaV3, y desplegarlo con TabbyAPI. No obstante, la informacion publicada por el autor es extremadamente escasa: no hay model card sustantiva, ni datos de entrenamiento, ni benchmarks, ni licencia declarada, ni lista de idiomas.

Esta ficha se ha redactado exclusivamente a partir de los metadatos disponibles en Hugging Face y de la propia model card del autor, que solo contiene la declaracion del modelo base y las etiquetas tecnicas. Cualquier dato no presente en esa informacion se marca como "no disponible" para no inventar cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `deepseek_v4`; presumiblemente transformer de la familia DeepSeek V4, sin confirmacion documental) |
| Parametros totales | 52.112.526.526 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,5 bits por peso (variante `exl3-2.5bpw`); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuantizacion EXL3, compatible con ExLlamaV3 y TabbyAPI) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni las tecnicas de alineamiento (RLHF, DPO u otras) del modelo base orcarouter/DeepSeek-V4-Flash-Vision-Uncensored. La unica informacion estructural disponible procede de las etiquetas del repositorio: `deepseek_v4` como familia de arquitectura, `vision` como indicador de capacidad multimodal y `exl3`/`exllama`/`tabbyapi` como formato y ecosistema de despliegue.

Lo que si es deducible con certeza es el proceso de cuantizacion: el modelo se ha convertido al formato EXL3 de ExLlamaV3 con una tasa de 2,5 bits por peso. Esta tecnica emplea cuantizacion por grupos con escalas compartidas y, en ExLlamaV3, codigos de cuantizacion optimizados para preservar la calidad en regimenes de muy baja precision. El resultado es un checkpoint de 104,4 GB que, a partir de 52.112 millones de parametros, implica una media efectiva de aproximadamente 16 bits por parametro contando metadatos y escalas, coherente con una cuantizacion nominal de 2,5 bpw mas overhead. No se documenta si la cuantizacion preserva la torre de vision ni como afecta al rendimiento multimodal.

## Capacidades

- Generacion de texto y razonamiento: el modelo base pertenece a la familia DeepSeek V4, orientada a tareas de razonamiento, pero no hay evaluacion publicada de esta cuantizacion concreta.
- Vision: la etiqueta `vision` y el nombre del modelo base indican soporte de entrada de imagenes; no se detalla la resolucion, el numero de imagenes por prompt ni el codificador visual empleado.
- Codigo y matematicas: presumiblemente heredadas del modelo base DeepSeek, sin datos verificables en la informacion disponible.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo "uncensored": el modelo base ha sido modificado para reducir rechazos y filtros de seguridad; no se especifica la tecnica empleada (abliteration, fine-tuning o merge).
- Despliegue: compatible con ExLlamaV3 y TabbyAPI segun las etiquetas del repositorio.

## Casos de uso

- Inferencia local de un modelo de 52.000 millones de parametros con vision en una sola GPU de 80 GB: la cuantizacion a 2,5 bpw reduce el peso a unos 104,4 GB en disco y permite cargar el modelo en un A100 80GB o H100 80GB con margen limitado para cache KV, algo inviable con pesos en bf16.
- Investigacion sobre alineamiento y seguridad: al tratarse de una variante "uncensored", es util para estudiar el comportamiento de modelos sin filtros de rechazo, medir tasas de cumplimiento de peticiones sensibles y comparar con el modelo base alineado.
- Despliegue de servicio multimodal con TabbyAPI: el formato EXL3 esta pensado para el servidor TabbyAPI, que expone una API compatible con OpenAI; permite servir el modelo a equipos internos con un unico nodo.
- Procesamiento de documentos con imagenes en entornos con restricciones de hardware: la reduccion de huella permite ejecutar tareas de extraccion de informacion de capturas, formularios o diagramas en un solo acelerador profesional.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de calidad de EXL3 a 2,5 bpw frente a bf16 o a cuantizaciones de 4 y 6 bits sobre el mismo modelo base.
- Pruebas de concepto de asistentes conversacionales de contexto largo: si el modelo base conserva su ventana de contexto nativa, la cuantizacion permite experimentar con conversaciones multi-turno en hardware de una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 104,4 GB en disco; con overhead de cache KV y buffers de ExLlamaV3, se necesita al menos una GPU de 120 GB o dos de 80 GB para cargar el modelo completo. No hay datos oficiales de consumo exacto en VRAM.
- GPU recomendadas: A100 80GB, H100 80GB, H200 141GB. En configuracion multi-GPU, dos A100 80GB o dos H100 80GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en ninguna GPU consumer actual de una sola unidad, dado el tamano del checkpoint.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI (segun las etiquetas del autor). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| avar6/DeepSeek-V4-Flash-Vision-Uncensored-exl3-2.5bpw | 52.112.526.526 | no disponible | EXL3 2,5 bpw | no disponible | Hugging Face, 66 descargas |
| orcarouter/DeepSeek-V4-Flash-Vision-Uncensored (base) | no disponible | no disponible | pesos originales | no disponible | Hugging Face |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | no disponible | no disponible | no disponible | no disponible | no verificadas en la informacion disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay informacion sobre entrenamiento, datos, evaluaciones ni limitaciones declaradas por el autor.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion hasta que el autor o el titular de los derechos lo aclare.
- Naturaleza "uncensored": el modelo base ha sido modificado para reducir rechazos; puede generar contenido inapropiado, peligroso o ilegal y no es apto para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo de alucinacion: no cuantificado; al ser una cuantizacion a 2,5 bpw, es esperable cierta degradacion adicional respecto a los pesos originales, aunque no hay mediciones publicadas.
- Idiomas no declarados: no se puede confirmar el soporte de castellano ni de otras lenguas.
- Contexto no documentado: se desconoce la ventana maxima y si la cuantizacion la preserva.
- Capacidad de vision no verificada: la etiqueta indica vision, pero no se documenta el codificador, la resolucion de entrada ni el impacto de la cuantizacion en la torre visual.
- Huella de hardware elevada: a pesar de la cuantizacion, sigue requiriendo GPUs profesionales de 80 GB o configuraciones multi-GPU.
- Procedencia del modelo base incierta: el autor del base es un usuario ("orcarouter") sin trazabilidad publica verificable en la informacion disponible.
- Fecha de creacion futura en los metadatos (2026-10-27): conviene verificar la integridad y el origen del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/avar6/DeepSeek-V4-Flash-Vision-Uncensored-exl3-2.5bpw
- Modelo base: https://huggingface.co/orcarouter/DeepSeek-V4-Flash-Vision-Uncensored
- ExLlamaV3 (formato EXL3): no disponible en la informacion proporcionada
- TabbyAPI: no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
