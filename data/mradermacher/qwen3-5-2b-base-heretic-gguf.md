# mradermacher/Qwen3.5-2B-Base-heretic-GGUF

## Resumen

Este repositorio contiene una recuantizacion en formato GGUF del modelo aminroumiany/Qwen3.5-2B-Base-heretic, una version "abliterated" (sin mecanismos de rechazo) del modelo base Qwen3.5-2B de Qwen/Alibaba. La cadena de procedencia es, por tanto, triple: Qwen entrena el Qwen3.5-2B-Base original, aminroumiany le aplica un proceso automatico de eliminacion de censura con la herramienta Heretic, y mradermacher publica las cuantizaciones GGUF estaticas para inferencia local. El modelo tiene 1.881.825.088 parametros (1,88 B) segun los pesos safetensors del modelo de origen y se distribuye bajo licencia Apache 2.0.

El interes practico del repositorio es doble. Por un lado, ofrece un modelo denso de menos de 2.000 millones de parametros en un abanico muy amplio de cuantizaciones (desde Q2_K de 1,1 GB hasta f16 de 3,9 GB), lo que permite ejecutarlo en hardware muy modesto. Por otro, la variante "heretic" es relevante para investigacion en seguridad, alineacion y analisis de direcciones de rechazo, porque elimina el comportamiento de negativa sin necesidad de reentrenar el modelo desde cero.

Ahora bien, conviene subrayar que se trata de un modelo **base**, no de un modelo instruct o chat: no ha pasado por un ajuste por instrucciones supervisado ni por RLHF/DPO. Su uso directo como asistente conversacional requiere prompting few-shot, fine-tuning posterior o envoltorios especificos. El autor declara unicamente el idioma ingles y no publica datos de benchmarks, contexto maximo ni detalles del proceso de abliteracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3.5); detalles de capas y atencion no disponibles |
| Parametros totales | 1.881.825.088 (1,88 B), segun pesos safetensors del modelo base |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas ficheros mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) declarado explicitamente; no se confirman otros idiomas |
| Licencia | apache-2.0 (enlaza a la licencia del Qwen/Qwen3.5-2B-Base original) |
| Formato de pesos | GGUF (este repositorio); el modelo de origen usa transformers/safetensors |
| Tamano del repositorio | 19,1 GB (incluye todas las cuantizaciones) |
| Cuantizaciones ponderadas / imatrix | disponibles en mradermacher/Qwen3.5-2B-Base-heretic-i1-GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B-Base, un transformer decoder-only denso con 1,88 B de parametros. No se dispone de informacion publicada en los materiales facilitados sobre el numero de capas, dimensiones ocultas, cabezas de atencion, tipo de positional encoding o longitud de contexto nativa. Tampoco se detalla la composicion del dataset de entrenamiento, el volumen de tokens vistos ni si el modelo original incorporo fases de RLHF o DPO; al tratarse de la variante **Base**, lo habitual en la familia Qwen es que no haya alineacion por preferencias, pero esto no se confirma en la documentacion disponible.

La innovacion tecnica relevante no esta en la arquitectura sino en el post-procesado: el modelo ha sido sometido a un proceso de "abliteration" mediante la herramienta Heretic (p-e-w/heretic), que elimina automaticamente la censura de modelos de lenguaje sin requerir comprension de las tripas del transformer. Heretic declara soporte para modelos densos, varios arquitecturas MoE e incluso modelos hibridos como Qwen3.5. El resultado es un modelo que no presenta las direcciones de rechazo tipicas de un modelo alineado. El autor de la recuantizacion no documenta la metodologia concreta aplicada por aminroumiany, ni la magnitud de la degradacion de perplexity introducida por el proceso.

Un detalle a tener en cuenta: el repositorio incluye ficheros mmproj (Q8_0 de 0,5 GB y f16 de 0,8 GB) etiquetados por el autor como "multi-modal supplement". Esto sugiere que la arquitectura subyacente contempla entrada multimodal, pero no se documenta que modalidades cubre ni si la proyeccion es funcional con esta variante concreta.

## Capacidades

- Generacion de texto en ingles: el modelo puede continuar texto y completar prompts, con la salvedad de que al ser un modelo base no sigue instrucciones de forma nativa.
- Comportamiento sin censura: el proceso de abliteration elimina las negativas del modelo, por lo que responde a peticiones que un modelo alineado rechazaria.
- Base para fine-tuning: al ser un modelo base de 1,88 B, es un punto de partida habitual para SFT, LoRA y QLoRA sobre dominios concretos.
- Investigacion en seguridad y alineacion: permite estudiar direcciones de rechazo, mecanismos de censura y efectos del abliteration sobre las capacidades.
- Soporte de tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia de entrenamiento especifico para ello.
- Capacidades multilingues: solo se declara ingles. No se confirma comportamiento en castellano u otros idiomas.
- Capacidades especiales (modo thinking, audio, vision): no disponibles. La presencia de ficheros mmproj sugiere soporte multimodal en la arquitectura, pero sin documentacion que lo confirme.
- Uso conversacional: la etiqueta "conversational" aparece en los tags del repositorio, pero un modelo base no produce dialogos coherentes sin formato de prompt adecuado o ajuste posterior.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo permite generar respuestas que un modelo alineado bloquearia, lo que resulta util para construir conjuntos de prueba adversarios, medir la robustez de clasificadores de contenido y estudiar el fenomeno del refusal. Es adecuado por su tamano reducido, que permite iterar rapidamente sobre grandes volumenes de prompts.
- Investigacion sobre abliteration: comparar las salidas de este modelo con las de Qwen/Qwen3.5-2B-Base permite cuantificar que capacidades se degradan y cuales se preservan tras eliminar la censura. Al ser reproducible (tag "reproducible") y estar disponible en 12 cuantizaciones, se pueden hacer estudios controlados de sensibilidad a la precision numerica.
- Fine-tuning para dominios concretos en ingles: con 1,88 B de parametros, un ajuste LoRA o QLoRA cabe en una unica GPU de gama consumer. Casos tipicos incluyen clasificacion de texto, extraccion de entidades, resumen de dominios especializados o generacion de plantillas en ingles.
- Generacion de datos sinteticos: el modelo puede producir corpus sinteticos en ingles para entrenar modelos mayores o para aumentar datasets escasos, con la ventaja de que su huella de memoria (1,4 GB en Q4_K_M) permite ejecutar varias instancias en paralelo en un solo servidor.
- Despliegue en edge y dispositivos con recursos limitados: con cuantizaciones de 1,1 a 1,7 GB, el modelo cabe en mini-PC, portatiles sin GPU dedicada, Raspberry Pi de gama alta con suficiente RAM o telefonos de gama alta mediante llama.cpp. Es util para autocompletado offline, prototipos sin conexion o asistentes locales de bajo consumo.
- Prototipado rapido de pipelines de inferencia: antes de invertir en un modelo de 7 B o 70 B, este modelo permite validar formatos de prompt, esquemas de cuantizacion, configuracion de servidores (llama.cpp, Ollama, LM Studio) y presupuestos de latencia con un coste de hardware minimo.
- Analisis linguistico y de sesgos en corpus ingleses: al no tener capas de rechazo, expone de forma mas directa los sesgos latentes del corpus de entrenamiento original, lo que puede ser util en estudios academicos sobre representaciones sesgadas en modelos pequenos.
- Educacion y demostraciones docentes: su tamano permite ejecutarlo en el portatil de un estudiante y mostrar en clase el funcionamiento interno de un LLM, el efecto de la cuantizacion sobre la calidad y el impacto del abliteration.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni la del modelo base proporcionada incluyen cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra métrica. Tampoco se documentan mediciones de perplexity para las distintas cuantizaciones. La pagina apxml.com/models/qwen35-2b aparece en los resultados de busqueda como fuente potencial de especificaciones y benchmarks del Qwen3.5-2B, pero su contenido no se ha facilitado y, por tanto, no se reproduce aqui.

## Requisitos de hardware

Los tamanos de fichero publicados por el autor permiten estimar la VRAM necesaria (peso de los tensores mas cache KV, overhead de runtime y buffers de contexto):

- Q2_K / Q3_K_S: 1,1 GB. Cabe en cualquier GPU con 2-3 GB de VRAM libre o en CPU con 4 GB de RAM.
- Q3_K_M / Q3_K_L / IQ4_XS / Q4_K_S: 1,2-1,3 GB. Ejecutable en GPUs de gama de entrada (GTX 1650 4 GB, integradas con memoria compartida) y en CPU.
- Q4_K_M: 1,4 GB. Cuantizacion recomendada por el autor junto con Q4_K_S; es el punto de equilibrio habitual entre calidad y consumo. Encaja con holgura en RTX 3060 12 GB, RTX 4060 8 GB, Apple Silicon con 8 GB unificados.
- Q5_K_S / Q5_K_M: 1,5 GB. Sin problema en cualquier GPU de 6 GB o mas.
- Q6_K: 1,7 GB. Aporta calidad casi identica a Q8_0 con menor huella.
- Q8_0: 2,1 GB. Opcion de maxima calidad practica; cabe en GPUs de 4 GB o mas.
- f16: 3,9 GB. El propio autor lo califica de "overkill" para este tamano de modelo.
- Ficheros mmproj: 0,5 GB (Q8_0) y 0,8 GB (f16), adicionales si se pretende usar la parte multimodal.

Recomendaciones de GPU: cualquier GPU con 4 GB o mas de VRAM sirve para las cuantizaciones de 4 bits en adelante. Para f16 o Q8_0 con contextos largos, se recomienda una RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100, H100 o similar. El modelo tambien se ejecuta enteramente en CPU y en Apple Silicon mediante Metal.

Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con la API de endpoints de Hugging Face (el repositorio lleva el tag endpoints_compatible). vLLM y TGI tienen soporte de GGUF parcial y no esta confirmado para esta arquitectura concreta.

Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-2B-Base-heretic-GGUF (este modelo) | 1,88 B | no disponible | apache-2.0 | GGUF (12 cuantizaciones) | Base + abliterated + cuantizado |
| aminroumiany/Qwen3.5-2B-Base-heretic | 1,88 B | no disponible | apache-2.0 | safetensors | Fuente sin cuantizar de este repositorio |
| Qwen/Qwen3.5-2B-Base | 1,88 B | no disponible | apache-2.0 | safetensors | Modelo original, con alineacion de seguridad intacta |
| mradermacher/Qwen3.5-2B-heretic-GGUF | no disponible | no disponible | apache-2.0 | GGUF | Variante no "Base" de la misma familia |
| mradermacher/Qwen3.5-4B-heretic-GGUF | no disponible | no disponible | apache-2.0 | GGUF | Version de 4 B, mas capacidad pero mas consumo |

No se dispone de datos de benchmarks de ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia, formato y procedencia. Modelos de tamano similar de otros fabricantes (por ejemplo, alternativas densas de 1-3 B) no aparecen en los resultados de busqueda facilitados, por lo que no se incluyen.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no sigue instrucciones de forma fiable, no mantiene formato de chat y no tiene sistema de turnos. Usarlo como asistente requiere few-shot prompting o fine-tuning.
- Ausencia de alineacion de seguridad: el proceso de abliteration elimina los rechazos, por lo que el modelo puede generar contenido danino, ilegal o gravemente ofensivo sin filtros. Esto es precisamente su proposito declarado, pero implica que no debe exponerse a usuarios finales sin capas de moderacion externas.
- Degradacion de capacidades no cuantificada: el abliteration altera los pesos del modelo y suele incrementar la perplexity. No se publican mediciones del dano causado, por lo que la calidad real frente al Qwen3.5-2B-Base original es desconocida.
- Riesgo elevado de alucinacion: con 1,88 B de parametros, la capacidad de mantener coherencia factual en generaciones largas es limitada, mas aun sin ajuste por instrucciones.
- Idioma: solo se declara ingles. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera pobre.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar tareas de documento largo o dialogos multi-turno extensos.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el contenido generado sin filtros puede acarrear responsabilidad legal o reputacional para quien lo despliegue en produccion. Ademas, el cumplimiento de la licencia del modelo original depende de los terminos de Qwen/Qwen3.5-2B-Base.
- Escasa validacion comunitaria: 0 likes y 274 descargas en el momento de la ficha. No hay evaluaciones independientes ni issues publicos que permitan contrastar la calidad.
- Ficheros mmproj sin documentar: se incluyen proyecciones multimodales, pero no se explica que modalidad cubren ni si funcionan correctamente con la variante abliterated.
- Sin benchmarks: no hay ninguna metrica publicada que permita comparar objetivamente este modelo con alternativas.
- Cuantizaciones de baja precision: Q2_K, Q3_K_S y Q3_K_M degradan notablemente la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-2B-Base-heretic-GGUF
- Cuantizaciones ponderadas / imatrix: https://huggingface.co/mradermacher/Qwen3.5-2B-Base-heretic-i1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/aminroumiany/Qwen3.5-2B-Base-heretic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-2B-Base/blob/main/LICENSE
- Herramienta Heretic (eliminacion automatica de censura): https://github.com/p-e-w/heretic
- Pagina de overview y descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-2B-Base-heretic-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Variante no Base de 2 B: https://huggingface.co/mradermacher/Qwen3.5-2B-heretic-GGUF
- Variante no Base de 4 B: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-2b-heretic.html
- Especificaciones de Qwen3.5-2B en apxml: https://apxml.com/models/qwen35-2b
- Grafico de perplexity por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
