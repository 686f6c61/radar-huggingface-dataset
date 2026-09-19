# phukanpragyan/gemma-4-e2b-assamese-sft-v2

## Resumen

El modelo `phukanpragyan/gemma-4-e2b-assamese-sft-v2` es un ajuste fino supervisado (SFT) construido con la libreria PEFT sobre el checkpoint `phukanpragyan/gemma-4-e2b-assamese-cpt`, que a su vez es un modelo de la familia Gemma 4 en su variante E2B. Se distribuye como adaptador LoRA acompanado de pesos en formato safetensors, y su proposito declarado es la generacion de texto, presumiblemente orientada al idioma assames (la model card interna lo llama `gemma-sft-assamese-final`) y a mejorar las capacidades conversacionales del checkpoint base tras la fase de preentrenamiento continuado.

Se trata de un artefacto de investigacion con huella publica practicamente nula: no tiene descargas ni "likes" en el momento de la consulta, fue creado y actualizado el mismo dia (19 de septiembre de 2026) y su model card no documenta ni el dataset de entrenamiento, ni el numero de tokens, ni hiperparametros, ni evaluaciones. La informacion verdaderamente utilizable se reduce al numero de parametros del tensor de safetensors (5.483.175.491), el tamano del repositorio (11,3 GB) y las versiones de las librerias empleadas.

Su relevancia ahora es limitada y de tipo exploratorio: sirve como ejemplo de pipeline reproducible de ajuste SFT con TRL y PEFT sobre un modelo multimodal de nueva generacion, pero no como componente listo para produccion, dado que carece de licencia explicitada, de idiomas declarados y de cualquier metrica de calidad publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma 4, variante E2B); ajuste mediante adaptador LoRA (PEFT) |
| Parametros totales | 5.483.175.491 (segun safetensors del repositorio) |
| Parametros activos | no aplicable (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el nombre del modelo sugiere assames, sin confirmacion documental) |
| Licencia | no disponible (la model card incluye el marcador generico `licence: license` sin concretar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria declarada: peft |
| Modelo base | phukanpragyan/gemma-4-e2b-assamese-cpt |
| Tamano del repositorio | 11,3 GB |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos propios del modelo. El repositorio declara `library_name: peft` y la etiqueta `lora`, de modo que la arquitectura efectiva es la del checkpoint base `gemma-4-e2b-assamese-cpt` (un transformer decoder de la familia Gemma 4, en la variante denominada E2B) mas una actualizacion de bajo rango aplicada sobre las proyecciones del modelo. El numero de parametros reportado por safetensors (5,48 mil millones) corresponde al conjunto de tensores almacenados; no se especifica si se trata del adaptador fusionado con el base o del modelo completo serializado.

En cuanto al entrenamiento, la model card solo confirma que se aplico SFT (supervised fine-tuning) mediante TRL. No se documentan el corpus, el numero de tokens, la composicion del dataset, la longitud de secuencia, la tasa de aprendizaje ni si hubo fases posteriores de RLHF, DPO o preferencia. Tampoco se describen innovaciones tecnicas como decodificacion especulativa, atencion lineal o variantes de atencion eficiente. Las versiones del framework de entrenamiento declaradas son PEFT 0.21.0, TRL 1.13.0, Transformers 5.5.2, PyTorch 2.8.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la model card incluye un ejemplo de uso con `transformers.pipeline` sobre una lista de mensajes con rol de usuario, lo que indica soporte del formato de chat.
- Ajuste SFT: al estar entrenado con supervisión directa, se espera una mejora en el seguimiento de instrucciones respecto al checkpoint base, aunque no se aportan evidencias.
- Posible capacidad multimodal: entre las etiquetas del repositorio figura `image-text-to-text`, lo que sugiere que el modelo base o el propio adaptador manejan entradas de imagen y texto. No hay documentacion que lo confirme ni ejemplos de uso multimodal.
- Orientacion al assames: el identificador interno `gemma-sft-assamese-final` apunta a un ajuste para ese idioma, sin que se detallen el alcance ni la cobertura lexica.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio o vision confirmadas: no disponible.

## Casos de uso

- Investigacion sobre ajuste eficiente de parametros: el modelo sirve como caso de estudio de un pipeline PEFT + TRL sobre un checkpoint Gemma 4, util para reproducir la receta de LoRA en modelos de ~5,5 mil millones de parametros y comparar con otras configuraciones de rango y tasa de aprendizaje.
- Experimentacion en procesamiento de lenguaje natural para assames: dado el nombre del modelo, puede emplearse como punto de partida en tareas de generacion y dialogos en ese idioma, siempre que se valide previamente la calidad con un conjunto de evaluacion propio.
- Prototipado de asistentes conversacionales multilingues de bajo presupuesto: al caber en GPUs de consumo con cuantizacion, permite montar demos locales de chat sin depender de APIs externas.
- Generacion de texto asistida en entornos educativos o de documentacion: para redactar borradores o resumir materiales en idiomas minoritarios, sujeto a revision humana por el riesgo de alucinacion.
- Base para posteriores fases de alineacion: al ser un checkpoint SFT, puede utilizarse como punto de partida para DPO, ORPO o RLHF en proyectos que necesiten adaptar el estilo de respuesta a un dominio concreto.
- Pruebas de integracion en `transformers` y `peft`: resulta util para validar la compatibilidad de adaptadores LoRA con las versiones de Transformers 5.x y TRL 1.x en un entorno de CI.
- Evaluacion comparativa de checkpoints de la misma cadena: permite medir el efecto incremental de la fase CPT (`gemma-4-e2b-assamese-cpt`) frente a la fase SFT sobre un mismo conjunto de validacion en assames.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni metricas especificas de traduccion o generacion en assames, y el repositorio no presenta ficheros de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos a partir de los 5,48 mil millones de parametros, no cifras publicadas por el autor): en fp16/bf16 aproximadamente 11 GB solo para pesos, mas el coste de cache KV; en int8 alrededor de 6 GB; en cuantizacion de 4 bits del orden de 3,5 a 4 GB.
- GPU recomendadas para fp16 completo: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB, con margen para contextos largos.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en fp16 con secuencias moderadas; en RTX 4080, 4070 Ti Super o 4060 Ti de 16 GB requiere cuantizacion de 8 o 4 bits.
- Despliegue: vLLM o TGI para fp16/bf16 con alto throughput; llama.cpp u Ollama si se generan conversiones GGUF; `transformers` con `peft` para cargar el adaptador sobre el base; no se publican artefactos GGUF, AWQ ni GPTQ en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: el repositorio ocupa 11,3 GB, por lo que conviene prever ese espacio antes de la descarga completa.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de este modelo, por lo que la comparacion se limita a los metadatos verificables frente al resto de la cadena de checkpoints del mismo autor y al ecosistema de modelos abiertos de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| phukanpragyan/gemma-4-e2b-assamese-sft-v2 | 5.483.175.491 (safetensors) | no disponible | no disponible | adaptador LoRA en HuggingFace, 0 descargas |
| phukanpragyan/gemma-4-e2b-assamese-cpt | no disponible | no disponible | no disponible | checkpoint base en HuggingFace |
| Familia Gemma 4 E2B (checkpoint original) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| Alternativas abiertas de ~3-8B en el ecosistema (Gemma 3, Qwen 3, Llama 3.2) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

No se han proporcionado resultados que permitan establecer una comparacion cuantitativa con alternativas de la misma categoria; cualquier cifra externa requeriria verificacion directa en las fichas oficiales de cada modelo.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no existen metricas que respalden la calidad del ajuste ni su mejora respecto al checkpoint base.
- Licencia sin concretar: el repositorio no especifica terminos de uso. Cualquier uso comercial es juridicamente inseguro hasta que el autor lo aclare, y hay que verificar ademas la licencia del checkpoint Gemma subyacente.
- Riesgo de alucinacion: al ser un modelo SFT de ~5,5B sin fase de alineacion documentada, es probable que genere afirmaciones incorrectas con seguridad alta, especialmente en dominios especializados y en idiomas con pocos datos.
- Idiomas no declarados: no se confirma oficialmente el soporte del assames ni de otros idiomas; el comportamiento multilingue es una inferencia basada en el nombre del modelo.
- Ambiguedad sobre el contenido del repositorio: no queda claro si los tensores safetensors corresponden al adaptador LoRA fusionado, al adaptador aislado o a los pesos completos, lo que complica el despliegue y el calculo de recursos.
- Etiqueta multimodal sin documentacion: la presencia de `image-text-to-text` entre los tags no va acompanada de ejemplos ni de instrucciones, por lo que no debe asumirse que la entrada de imagenes funcione correctamente.
- Versionado muy reciente y sin mantenimiento visible: creado y actualizado en la misma fecha, sin descargas ni comunidad que haya reportado problemas de integracion.
- Compatibilidad de librerias: depende de versiones muy concretas de PEFT (0.21.0), TRL (1.13.0) y Transformers (5.5.2); entornos con versiones anteriores pueden fallar al cargar el adaptador.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar su uso en tareas de documento largo sin medirla empiricamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/phukanpragyan/gemma-4-e2b-assamese-sft-v2
- Checkpoint base (CPT): https://huggingface.co/phukanpragyan/gemma-4-e2b-assamese-cpt
- Repositorio de TRL, framework de entrenamiento declarado: https://github.com/huggingface/trl
- Los resultados de busqueda web disponibles no aportaron enlaces tecnicos relevantes sobre este modelo ni sobre su familia; no se han localizado papers, blogs ni demos asociados.
