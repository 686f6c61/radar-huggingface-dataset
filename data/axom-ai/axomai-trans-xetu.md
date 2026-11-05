# axom-ai/axomai-trans-xetu

## Resumen

AxomAI Trans Xetu es un modelo de traduccion automatica neuronal especializado en el par de idiomas asames-ingles, desarrollado por axom-ai. Se presenta como un modelo de arquitectura seq2seq basada en la familia IndicTrans, adaptada y entrenada sobre un corpus paralelo propio (custom-assamese-parallel) para cubrir las necesidades de traduccion entre asames y ingles, un par con escasa representacion en los sistemas de traduccion comerciales.

Con 274.584.576 parametros (aproximadamente 275 millones), se situa en la gama de modelos de traduccion ligeros y desplegables en hardware modesto. El repositorio ocupa 1.1 GB en formato safetensors y requiere codigo personalizado (custom_code) para su carga, lo que indica que la arquitectura no es directamente compatible con las clases estandar de Transformers sin el modulo de modelado incluido en el repositorio.

La relevancia del modelo radica en su especializacion: frente a modelos multilingues genericos de mayor tamano, Xetu concentra su capacidad en un unico par linguistico de bajos recursos, lo que puede traducirse en mejor calidad por parametro para ese dominio concreto. El acceso es restringido (gated) y la licencia es propietaria, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (familia IndicTrans, con codigo personalizado) |
| Parametros totales | 274.584.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | asames (as), ingles (en) |
| Licencia | axom-ai-proprietary (propietaria, acceso restringido) |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder-decoder (seq2seq) de la familia IndicTrans, segun indican los tags del repositorio. Esta familia esta disenada especificamente para traduccion automatica entre lenguas indias e ingles, con tokenizadores adaptados a escrituras no latinas. El repositorio incluye codigo personalizado (`custom_code`), lo que implica que la implementacion del modelo no se corresponde con una clase estandar de la libreria Transformers y requiere cargar el modulo de modelado provisto por el autor.

En cuanto a los datos de entrenamiento, el unico dato disponible es que se utilizo un dataset propio denominado `custom-assamese-parallel`, un corpus paralelo asames-ingles. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Traduccion automatica bidireccional entre asames e ingles (pipeline `translation`).
- Generacion de texto condicionada a la tarea de traduccion (seq2seq).
- Manejo de escritura asamesa (alfabeto bengali-asames) mediante el tokenizador del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (vision, audio) ni modo de razonamiento extendido.
- Capacidad multilingue limitada a los dos idiomas declarados.

## Casos de uso

- Traduccion de documentacion administrativa: el modelo puede traducir circulares, formularios y textos oficiales del ingles al asames para su publicacion en servicios publicos de Assam, aprovechando su especializacion en el par linguistico.
- Localizacion de interfaces y contenido web: integrado en un pipeline de traduccion por lotes, permite versionar sitios web y aplicaciones en asames sin depender de APIs comerciales que cubren mal esta lengua.
- Traduccion de noticias y contenido periodistico: medios regionales pueden emplear el modelo para generar versiones en ingles de articulos en asames, con revision humana posterior dado el riesgo de alucinacion.
- Subtitulado y transcripcion traducida: combinado con un sistema ASR para asames, el modelo puede producir subtitulos en ingles en tiempo casi real para contenido audiovisual regional.
- Apoyo a la ensenanza de idiomas: generacion de pares de frases paralelas para materiales didacticos de aprendizaje de ingles por hablantes de asames y viceversa.
- Investigacion en traduccion de bajos recursos: sirve como linea base especializada para experimentos academicos sobre pares linguisticos indigenas, dado su tamano reducido y su entrenamiento en un corpus paralelo propio.
- Traduccion de correspondencia y atencion ciudadana: integracion en sistemas de gestion de tickets para traducir consultas ciudadanas en asames al ingles y facilitar su tramitacion por equipos no hablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,1 GB solo para pesos, con overhead adicional de activaciones; en la practica, alrededor de 2-3 GB.
- En fp16/bf16: aproximadamente 0,55 GB para pesos; en la practica, 1-2 GB con overhead.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de gama de entrada con 4 GB o mas.
- Tambien es viable la inferencia en CPU para cargas por lotes no criticas en latencia.
- Opciones de despliegue: al requerir `custom_code`, la integracion con vLLM, TGI o llama.cpp no esta garantizada y no se documenta; el despliegue mas seguro es mediante `transformers` con `trust_remote_code=True` y un servidor propio (por ejemplo, FastAPI) o TorchServe.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| AxomAI Trans Xetu | 274,6 M | no disponible | as, en | Propietaria | Restringido (gated) |
| IndicTrans2 (AI4Bharat) | no disponible en esta ficha | no disponible | Multiples lenguas indias e ingles | No disponible en esta ficha | Publico |
| NLLB-200 (Meta) | hasta 54,5 B (variante 600 M disponible) | 512 tokens (variante estandar) | 200 idiomas, incluye asames | CC-BY-NC 4.0 | Publico |
| Helsinki-NLP opus-mt-en-as | ~77 M (tipico en OPUS-MT) | no disponible | en, as | No disponible en esta ficha | Publico |

Nota: los datos de los modelos comparativos provienen de conocimiento general y pueden no reflejar las versiones mas recientes; no se dispone de resultados de benchmarks comparativos publicados para Xetu.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en HuggingFace y aprobacion del autor; no es un modelo de descarga libre.
- Licencia propietaria (axom-ai-proprietary): el uso comercial esta sujeto a los terminos del autor y no se detalla en la informacion disponible; debe revisarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y de traducciones infieles, especialmente en textos largos o con terminologia especializada, al ser un modelo de 275 M de parametros entrenado en un corpus paralelo propio no documentado.
- Cobertura limitada a asames e ingles; no debe esperarse calidad en otros idiomas ni en code-switching.
- Longitud de contexto no documentada: textos largos pueden truncarse o degradar la calidad; se recomienda segmentar en frases.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar codigo del autor; auditar el codigo antes de usarlo en entornos sensibles.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas como NLLB o IndicTrans2.
- Comunidad practicamente inexistente (5 descargas, 0 likes en el momento de la consulta): soporte y mantenimiento no garantizados.
- Sesgos: no documentados; al entrenarse en un corpus paralelo propio, puede heredar sesgos de dominio y estilo de dicha fuente.

## Enlaces

- HuggingFace: https://huggingface.co/axom-ai/axomai-trans-xetu
- Dataset referenciado: custom-assamese-parallel (no se proporciona URL directa en la informacion disponible)
- Repositorio de codigo, paper o demo: no disponible
