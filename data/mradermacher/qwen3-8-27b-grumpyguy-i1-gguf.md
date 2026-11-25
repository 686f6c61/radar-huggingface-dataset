# mradermacher/Qwen3.8-27B-GrumpyGuy-i1-GGUF

## Resumen

Qwen3.8-27B-GrumpyGuy-i1-GGUF es una cuantizacion del modelo wesjos/Qwen3.8-27B-GrumpyGuy, un ajuste fino (finetune) de la familia Qwen 3.8 orientado a un estilo de conversacion con personalidad arisca o sarcastica ("grumpy"), segun indican las etiquetas persona y roleplay de la model card original. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF optimizadas mediante matrices de importancia (imatrix) para su uso en llama.cpp y entornos de inferencia local.

El modelo base declara 27.320.697.856 parametros (unos 27,3 mil millones) en precision bf16 y una licencia Apache 2.0, lo que lo situa en la franja de modelos de tamano medio-grande aptos para despliegue en una sola GPU de gama alta o en configuraciones multi-GPU. La model card del cuantizador indica que se trata de un modelo de vision, con ficheros mmproj (proyector multimodal) alojados en el repositorio estatico hermano, aunque no se detalla la arquitectura interna ni el esquema de atencion.

La relevancia de esta ficha reside en que combina dos capas de derivacion: un finetune de persona sobre una base Qwen 3.8 y una cuantizacion con imatrix que permite ejecutar los 27,3B parametros en hardware de consumo con perdida de calidad controlada. No obstante, la informacion publica disponible es escasa: no hay benchmarks, no se documenta el dataset de entrenamiento ni la longitud de contexto, y el pipeline aparece como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen 3.8; la model card del cuantizador no detalla la arquitectura interna) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix; existen quants estaticos en el repositorio hermano |
| Idiomas soportados | en, zh (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en bf16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base wesjos/Qwen3.8-27B-GrumpyGuy. Por el nombre y las etiquetas (qwen3.8, qwen3_5) se infiere que deriva de la familia Qwen 3.8, con un finetune de tipo persona/roleplay sobre una base conversacional, pero la model card no especifica si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla el esquema de atencion o la ventana de contexto nativa.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset del finetune ni si se aplicaron tecnicas de RLHF, DPO o similares. La model card del cuantizador unicamente indica que las cuantizaciones se generaron con matrices de importancia (weighted/imatrix quants) a partir del modelo bf16, lo que suele mejorar la calidad de los quants de baja precision respecto a las cuantizaciones estaticas. La model card menciona ademas que es un modelo de vision, con ficheros mmproj en el repositorio estatico, pero no aporta detalles sobre el proyector multimodal ni sobre los datos de vision empleados.

## Capacidades

- Generacion de texto conversacional con un estilo de personalidad marcado ("grumpy"), orientado a roleplay y dialogo.
- Capacidades multimodales (vision): la model card del cuantizador indica explicitamente "This is a vision model", con ficheros mmproj en el repositorio estatico.
- Soporte multilingue limitado a ingles y chino segun la model card.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que sugiere integracion con APIs de inferencia.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras capacidades especiales.
- Capacidad de codigo y matematicas: no disponible en la informacion proporcionada.

## Casos de uso

- Personajes conversacionales y roleplay: el finetune "GrumpyGuy" esta disenado para mantener una personalidad arisca y consistente en conversaciones multi-turno, adecuado para chatbots de entretenimiento, videojuegos narrativos o asistentes con caracter definido.
- Prototipado local de asistentes con vision: al ser un modelo multimodal con quants GGUF, permite probar flujos de imagen + texto en una estacion de trabajo sin depender de APIs externas.
- Despliegue en hardware de consumo: los quants i1-Q4_K_M (17,1 GB) o i1-Q3_K_M (13,8 GB) permiten ejecutar los 27,3B parametros en GPUs de 16-24 GB de VRAM mediante llama.cpp u Ollama.
- Evaluacion de tecnicas de cuantizacion: la disponibilidad de un fichero imatrix y de quants desde Q2_K hasta Q6_K permite comparar la degradacion de calidad por nivel de compresion en un modelo de 27B.
- Generacion de dialogos con tono marcado para guiones o contenido creativo: el estilo "grumpy" puede aprovecharse para escribir dialogos de personajes sarcasticos o gruñones en ingles o chino.
- Investigacion sobre finetunes de persona: sirve como caso de estudio de como un finetune de roleplay se comporta tras cuantizacion agresiva, comparando quants IQ frente a K-quants.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada a partir del tamano de los ficheros GGUF):
  - i1-Q2_K: ~11,3 GB de pesos; ~12-13 GB de VRAM en total.
  - i1-IQ3_M: ~13,1 GB de pesos; ~14-15 GB de VRAM en total.
  - i1-Q4_K_M: ~17,1 GB de pesos; ~18-19 GB de VRAM en total.
  - i1-Q5_K_M: ~19,7 GB de pesos; ~21-22 GB de VRAM en total.
  - i1-Q6_K: ~22,5 GB de pesos; ~24 GB de VRAM en total.
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite cargar el modelo completo; una A100 40/80 GB o H100 ofrece margen para contextos largos y mayor throughput. Para quants Q3 o inferiores, una RTX 4080 (16 GB) o similar puede ser suficiente.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o Q5_K_M, y en GPUs de 16 GB con quants IQ3 o Q3_K_M. En GPUs de 12 GB solo caben los quants Q2_K o IQ2 con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). Para el modelo base en bf16, transformers con aceleracion por GPU. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que su uso requeriria el modelo base en bf16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-GrumpyGuy-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF (i1, imatrix) | Finetune de persona/roleplay con vision; quants de 11,3 a 22,5 GB |
| Qwen3.8-27B-GrumpyGuy (base) | 27,3B | no disponible | Apache 2.0 | bf16 (safetensors) | Modelo original sin cuantizar; requiere ~55 GB en bf16 |
| Qwen3.8-27B-GrumpyGuy-GGUF (estatico) | 27,3B | no disponible | Apache 2.0 | GGUF (estatico) | Quants sin imatrix del mismo autor; incluye ficheros mmproj |
| Otros finetunes Qwen de ~27B | no disponible | no disponible | variable | variable | No se dispone de datos comparativos de benchmarks en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un finetune de persona con tono arisco, puede producir respuestas sarcasticas, bordes o poco adecuadas en contextos profesionales si no se controla con un system prompt.
- Riesgo de alucinacion: inherente a los modelos de 27B sin datos de evaluacion publicados; no hay benchmarks que permitan acotar su fiabilidad en tareas factuales.
- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Licencia Apache 2.0: permite uso comercial, pero el finetune hereda las obligaciones de la licencia del modelo base; conviene revisar la ficha de wesjos/Qwen3.8-27B-GrumpyGuy por si anade restricciones.
- El repositorio pesa 220,5 GB y contiene multiples quants; la descarga completa no es necesaria, pero conviene seleccionar un unico fichero.
- La cuantizacion introduce perdida de calidad, especialmente en Q2_K y Q3_K_S; para produccion se recomienda Q4_K_M o superior.
- No hay informacion sobre tool calling ni agentes, por lo que no debe asumirse su soporte en pipelines automatizados.
- El pipeline figura como no disponible y las descargas son bajas (535), lo que limita la validacion comunitaria del modelo.

## Enlaces

- Repositorio Hugging Face (cuantizacion i1): https://huggingface.co/mradermacher/Qwen3.8-27B-GrumpyGuy-i1-GGUF
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/Qwen3.8-27B-GrumpyGuy-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-GrumpyGuy-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
