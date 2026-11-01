# open-sci/open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096-longsft_16k-ot30k

## Resumen

Open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096-longsft_16k-ot30k es un modelo de lenguaje de 1.714.377.728 parámetros publicado por la organizacion open-sci en HuggingFace. Se trata de un checkpoint resultante de un ajuste fino supervisado (SFT) completo sobre un modelo base de la familia "mixturevitae", segun se deduce del propio identificador del repositorio. El nombre sugiere un entrenamiento sobre aproximadamente 100B tokens, con una longitud de contexto de 4096 tokens y una fase posterior de SFT de contexto largo (16k) sobre el dataset Open Thoughts 3 (30k muestras).

El modelo se distribuye en formato safetensors con codigo personalizado (`custom_code`) y esta etiquetado con el pipeline `feature-extraction`, aunque su entrenamiento mediante llama-factory y su generacion a partir de un trainer de transformers apuntan a un uso como modelo generativo de proposito general. El repositorio tiene un tamano de 3.4 GB, coherente con pesos en precision de 16 bits para 1.7B parametros.

La relevancia de este checkpoint es principalmente de investigacion: se trata de un artefacto de experimentacion reproducible (semilla 42, entrenamiento multi-GPU en 32 dispositivos, 5 epocas) dentro de la linea de trabajo de open-sci sobre modelos pequenos entrenados desde cero. La model card es auto-generada y carece de documentacion sustantiva sobre capacidades, datos o evaluacion, por lo que debe tratarse con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere "mixturevitae"; no se confirma si es transformer denso o MoE) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens en fase base; SFT posterior a 16k segun el identificador (no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. El identificador del repositorio incluye el termino "mixturevitae", que sugiere una arquitectura basada en mezcla de expertos (MoE) o alguna variante propietaria de open-sci, pero no se aporta confirmacion tecnica ni detalle sobre el numero de expertos, el enrutamiento o la proporcion de parametros activos. Tampoco se especifica si emplea atencion estandar, atencion lineal u otro mecanismo. El tag `custom_code` indica que la carga requiere codigo especifico del autor, no cubierto por transformers de serie.

El entrenamiento documentado corresponde exclusivamente a la fase de SFT: se realizo un ajuste fino completo (tag `full`) sobre el dataset `open-thoughts_open_thoughts3-1.2_m_30000_samples`, con 30.000 muestras, learning rate de 4e-05, scheduler coseno con warmup del 10%, 5 epocas, batch total de 128 (batch por dispositivo 1, acumulacion de gradientes 4, 32 dispositivos), optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, semilla 42. El framework empleado fue Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2, con llama-factory como orquestador. No se documenta el entrenamiento del modelo base ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva, derivada del pipeline de transformers y del ajuste SFT sobre datos de razonamiento (Open Thoughts 3).
- Razonamiento multi-paso, presumiblemente reforzado por el dataset de SFT orientado a cadenas de pensamiento, aunque no se aportan ejemplos ni evaluaciones.
- Extraccion de caracteristicas (pipeline declarado `feature-extraction`), lo que permite su uso como encoder para representaciones ocultas.
- Capacidades multilingues: no disponibles; no se declara cobertura de idiomas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Modo thinking explicito, vision o audio: no disponible.

## Casos de uso

- Experimentacion academica en ajuste fino: el checkpoint sirve como punto de partida reproducible (semilla, hiperparametros y dataset documentados) para estudiar el efecto del SFT sobre un modelo base de 1.7B en tareas de razonamiento.
- Investigacion sobre datos sinteticos de razonamiento: al estar entrenado sobre Open Thoughts 3, es util para analizar como se transfieren las cadenas de pensamiento sinteticas a un modelo pequeno y que tasas de retencion se observan.
- Extraccion de embeddings para clasificacion o clustering: el pipeline `feature-extraction` permite obtener representaciones de las capas ocultas para tareas de NLP downstream en entornos con recursos limitados (3.4 GB de pesos).
- Prototipado de asistentes conversacionales de bajo coste: con 1.7B parametros cabe en una unica GPU consumer, lo que permite desplegar prototipos de chat multi-turno con contexto de hasta 4096 tokens (o 16k si se confirma la extension del SFT).
- Generacion de texto en dominios acotados: util para tareas de resumen, reescritura o respuesta a preguntas sobre corpus pequenos, siempre con validacion humana por la ausencia de evaluacion publicada.
- Base para investigacion en eficiencia: su tamano reducido facilita estudios de cuantizacion, destilacion o comparacion de tecnicas de decodificacion sobre un modelo entrenado desde cero por un grupo de investigacion.
- Reproduccion de pipelines llama-factory: sirve como ejemplo funcional de configuracion de SFT completo con 32 GPUs, util para equipos que quieran replicar el flujo con sus propios datos.

## Benchmarks y rendimiento

La model card declara un unico `model-index` con nombre `sft__f679a5c592c8dffb__open-sci-re-ef6b7e0f__sdpa-open-sci-steps` y una lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3.4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1.8-2.5 GB; en 4 bits, alrededor de 1-1.5 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; una RTX 3060/4060 Ti, RTX 4070/4080 o RTX 4090 son suficientes. Para entrenamiento o inferencia a contexto 16k se recomienda A100 o H100 por ancho de banda.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en fp16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por `custom_code`); vLLM, TGI o llama.cpp no estan confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma familia ni evaluaciones que permitan una comparacion rigurosa con alternativas de 1.7B parametros.

## Limitaciones y advertencias

- Model card auto-generada y sin documentacion: no hay descripcion de usos previstos, limitaciones ni datos de evaluacion, lo que impide validar su comportamiento.
- Licencia "other" sin terminos explicitos: no se aclara si se permite uso comercial, redistribucion o modificacion; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion: al ser un modelo de 1.7B ajustado con SFT sobre datos sinteticos de razonamiento, la probabilidad de generar contenido plausible pero incorrecto es alta y no ha sido medida.
- Idiomas no declarados: se desconoce la cobertura linguistica real y la calidad en castellano.
- Contexto limitado: 4096 tokens en la fase base; la extension a 16k indicada en el identificador no esta confirmada en la model card.
- Requiere `trust_remote_code=True`: la carga ejecuta codigo del autor, lo que introduce un riesgo de seguridad que debe auditarse antes de usar en entornos sensibles.
- Sin soporte confirmado de tool calling, agentes ni modos de razonamiento estructurado.
- Sesgos: no documentados; al entrenarse sobre un dataset de razonamiento sintetico, puede heredar sesgos de la generacion automatica de dicho corpus.
- Checkpoint de investigacion con 17 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096-longsft_16k-ot30k
- No se han encontrado en la busqueda web enlaces adicionales relevantes (paper, blog, repositorio o demo) asociados a este modelo.
