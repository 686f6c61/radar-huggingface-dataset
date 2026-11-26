# mradermacher/Persistent-Exploration-Gemma4-E4B-GGUF

## Resumen

Persistent-Exploration-Gemma4-E4B-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Persistent-Exploration-Gemma4-E4B, publicado por el usuario gsarch en Hugging Face. El repositorio lo mantiene mradermacher, conocido por generar y distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base parece derivarse de la familia Gemma, concretamente de una variante con nomenclatura E4B, aunque no se dispone de documentacion tecnica que confirme su arquitectura exacta.

La relevancia de este repositorio es practica: ofrece el modelo base en multiples niveles de cuantizacion (desde Q2_K hasta Q8_0, ademas de F16), lo que permite desplegarlo en hardware con distintos presupuestos de memoria. Sin embargo, la informacion publicada es extremadamente escasa: no hay model card descriptiva, no se declara licencia, no se indican idiomas soportados ni se documentan capacidades, datos de entrenamiento o resultados de benchmarks.

Por tanto, esta ficha debe interpretarse como una descripcion del artefacto de cuantizacion disponible, no del modelo subyacente. Cualquier evaluacion rigurosa requeriria consultar el repositorio del modelo base en gsarch/Persistent-Exploration-Gemma4-E4B, que no forma parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Gemma, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas, quantize_version 2, convert_type hf) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. El nombre "Gemma4-E4B" sugiere una variante de la familia Gemma de Google, y el sufijo E4B podria indicar un tamano efectivo de aproximadamente 4 mil millones de parametros, pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Respecto al proceso de cuantizacion, la model card incluye metadatos tecnicos: quantize_version 2, output_tensor_quantised 1, convert_type hf y skip_mmproj 1. Este ultimo indica que no se ha incluido el proyector multimodal (mmproj) en las cuantizaciones, lo que sugiere que el modelo base podria tener componentes de vision no empaquetados en este repositorio, o simplemente que se ha omitido por defecto. Las cuantizaciones se han generado con la toolchain habitual de mradermacher sobre el checkpoint en formato Hugging Face del modelo original.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingue ni se listan idiomas.
- No se confirma modo thinking, vision ni audio.
- El flag skip_mmproj sugiere que, si el modelo base tiene capacidad multimodal, esta no esta incluida en estas cuantizaciones.

## Casos de uso

- Despliegue en llama.cpp: las cuantizaciones GGUF permiten ejecutar el modelo con llama.cpp en CPU o GPU, seleccionando el nivel de cuantizacion segun la memoria disponible.
- Pruebas locales en hardware consumer: las variantes Q4_K_M y Q5_K_M son adecuadas para equipos con 8-16 GB de VRAM o RAM unificada, aunque el rendimiento real no se puede estimar sin conocer el tamano del modelo.
- Integracion con Ollama o LM Studio: al ser GGUF, el modelo puede importarse en estos entornos para prototipado rapido, siempre que se valide previamente su calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 niveles distintos, lo que permite medir la degradacion de calidad frente al modelo en F16 en tareas concretas.
- Experimentacion en investigación: util para estudiar el comportamiento de un modelo derivado de Gemma en entornos con recursos limitados, una vez verificada su procedencia y licencia.
- Servido con vLLM o TGI: no aplicable directamente, ya que estas herramientas consumen pesos en safetensors, no GGUF; seria necesario usar el modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el numero de parametros del modelo base.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; depende del tamano real del modelo, que no se documenta.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, koboldcpp). vLLM y TGI no admiten GGUF de forma nativa para este tipo de modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables dentro de la informacion proporcionada, y la falta de datos sobre parametros, contexto y rendimiento impide establecer una comparacion rigurosa con alternativas de la familia Gemma u otras familias.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion de capacidades, limitaciones, sesgos ni uso previsto.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Procedencia incierta: el modelo base (gsarch/Persistent-Exploration-Gemma4-E4B) no esta documentado en la informacion disponible, lo que impide validar su calidad o su relacion exacta con la familia Gemma oficial de Google.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni evaluaciones publicadas no es posible estimar la fiabilidad del modelo.
- Idiomas: no declarados, por lo que no se puede garantizar un rendimiento adecuado en castellano u otros idiomas.
- Componente multimodal omitido: el flag skip_mmproj indica que el proyector de vision no esta incluido, de modo que estas cuantizaciones no serviran para tareas multimodales aunque el modelo base las soporte.
- Sin descargas ni likes: el repositorio no tiene traccion, lo que reduce la probabilidad de que otros usuarios hayan validado su funcionamiento.
- Fecha de creacion futura (2026-11-26): conviene verificar la integridad y el origen del repositorio antes de confiar en el.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Persistent-Exploration-Gemma4-E4B-GGUF
- Modelo base: https://huggingface.co/gsarch/Persistent-Exploration-Gemma4-E4B
