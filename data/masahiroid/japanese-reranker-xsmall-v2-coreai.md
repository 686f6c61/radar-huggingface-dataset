# masahiroid/japanese-reranker-xsmall-v2-coreai

## Resumen

El modelo `masahiroid/japanese-reranker-xsmall-v2-coreai` es una conversion
no oficial del reranker japones `hotchpotch/japanese-reranker-xsmall-v2`
(basado en ModernBERT-Ja, con aproximadamente 37 millones de parametros) al
runtime Core AI de Apple, el sucesor de Core ML disponible a partir de
iOS/macOS 27. Se trata de un modelo de ranking de texto (pipeline
`text-ranking`) que puntua la relevancia de un par consulta-documento y
devuelve un logit que, tras aplicar sigmoide, se interpreta como una
puntuacion en el rango [0, 1]. La conversion la firma el usuario masahiroid
como aportacion de comunidad, sin vinculo con el autor original.

El modelo resuelve una necesidad concreta: ejecutar un reranker japones de
forma completamente local en dispositivos Apple, aprovechando tanto la
Neural Engine como la GPU. Frente a alternativas que dependen de servidores
externos o de frameworks no nativos, esta version esta reescrita desde cero
en Python con `coreai-torch`, empleando una disposicion de memoria BC1S,
proyecciones basadas en Conv2d y calculo explicito de atencion por cabeza
para encajar con las restricciones de la Neural Engine. La cabeza de salida
se ha sustituido por pooling del token CLS mas una cabeza de clasificacion,
en lugar del mean-pooling y la normalizacion L2 tipicos de los modelos de
embeddings.

Es relevante ahora porque Core AI es un runtime nuevo en el ecosistema
Apple y todavia hay pocas conversiones de referencia publicas. Este modelo
sirve como ejemplo reproducible (incluye el script `reranker_xsmall_ane.py`)
para entender como portar un transformer de ranking a Neural Engine. La
ventana de entrada esta fijada en 128 tokens, la precision de exportacion es
float16 y la licencia es MIT. El repositorio ocupa aproximadamente 0,1 GB y,
en el momento de la ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), con cabeza de clasificacion y pooling de token CLS |
| Parametros totales | Aproximadamente 37 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrada fija de 128 tokens (query y document tokenizados como un unico par) |
| Tipos de cuantizacion | No disponible; el modelo se exporta en float16 |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | `.aimodel` (formato del runtime Core AI de Apple); incluye `reranker_xsmall_ane.py` para reproducir la conversion |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT, un transformer encoder optimizado
para secuencias de longitud moderada. El modelo base,
`hotchpotch/japanese-reranker-xsmall-v2`, es un reranker japones ligero de
aproximadamente 37 millones de parametros, afinado para la tarea de ranking de
pares consulta-documento. No se dispone de informacion sobre el volumen de
tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas
de alineacion como RLHF o DPO; esos datos no aparecen en la model card
proporcionada.

La innovacion principal de esta ficha no esta en el entrenamiento, sino en la
conversion al runtime Core AI. El autor indica que el modelo se ha reescrito
desde cero para la Neural Engine siguiendo el mismo enfoque que su conversion
previa `masahiroid/ruri-v3-130m-coreai`: disposicion BC1S, proyecciones
implementadas con Conv2d y calculo de atencion explicito por cabeza. La cabeza
de salida se ha modificado respecto al modelo original de embeddings,
sustituyendo el mean-pooling con normalizacion L2 por un pooling del token CLS
seguido de una cabeza de clasificacion que produce un unico logit de
relevancia. La entrada esta fijada a 128 tokens y la precision de exportacion
es float16. El repositorio incluye el script `reranker_xsmall_ane.py`,
necesario para comprender o reproducir la conversion en Python.

## Capacidades

- Ranking de relevancia texto a texto: puntua un par consulta-documento y
  devuelve un logit de relevancia que puede convertirse en una puntuacion
  [0, 1] aplicando sigmoide.
- Reordenacion (reranking) de resultados de busqueda: dado un conjunto de
  documentos candidatos, permite reordenarlos por relevancia respecto a una
  consulta.
- Procesamiento de japones: el modelo base esta afinado especificamente para
  japones y declara tambien soporte de ingles.
- Inferencia local en dispositivo: se ejecuta en la Neural Engine o en la GPU
  de dispositivos Apple compatibles con Core AI (iOS/macOS 27 o superior), sin
  necesidad de conexion a servicios remotos.
- Integracion programatica: API asincrona en Python mediante `coreai.runtime`
  (`AIModel.load`, `load_function` y llamada con `input_ids` y
  `attention_mask`).
- No se declaran capacidades de generacion de texto, codigo, matematicas,
  vision, audio, tool calling ni razonamiento multi-paso. Es un modelo de
  ranking, no un modelo generativo.
- No se declara modo de razonamiento (thinking mode) ni soporte de agentes.

## Casos de uso

- Busqueda documental en japones sobre dispositivos Apple: el reranker
  reordena los resultados devueltos por un indice (por ejemplo BM25 o un
  retriever vectorial) y coloca arriba los documentos mas relevantes para la
  consulta. Es adecuado porque esta disenado para ejecutarse localmente en
  Neural Engine a una longitud fija de 128 tokens.
- Asistentes y chatbots japoneses con recuperacion aumentada (RAG): tras
  recuperar pasajes candidatos, el modelo puntua cada par consulta-pasaje
  antes de pasarlos al generador. Encaja por su bajo coste computacional y por
  ejecutarse dentro del dispositivo, evitando enviar el contexto a servidores
  externos.
- Aplicaciones iOS/macOS con busqueda interna: cualquier app que necesite
  ordenar notas, correos, mensajes o articulos por relevancia respecto a una
  consulta del usuario puede delegar el ranking en este modelo sin salir del
  dispositivo, cumpliendo requisitos de privacidad.
- Filtrado previo de candidatos en pipelines de datos japoneses: se puede usar
  para descartar pares consulta-documento poco relevantes antes de alimentar
  modelos mas grandes, reduciendo el volumen de datos a procesar.
- Evaluacion de calidad de pares pregunta-respuesta en japones: el score de
  relevancia sirve como metrica auxiliar para auditar datasets o anotaciones.
- Prototipado de rerankers en el ecosistema Core AI: el repositorio y su
  script de conversion sirven como referencia para portar otros transformers
  de ranking a Neural Engine con la misma estrategia (BC1S, Conv2d,
  atencion por cabeza).
- Clasificacion binaria de relevancia: al aplicar sigmoide al logit se obtiene
  un score continuo que puede umbralizarse para decidir si un documento es
  relevante, util en sistemas de recomendacion o moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K,
etc.) en la informacion disponible. El unico dato cuantitativo aportado es una
validacion de precision de la conversion frente a una referencia PyTorch en
float32, realizada sobre un unico par real consulta-documento japones con 26
de 128 tokens reales tras el padding:

| Objetivo | Error absoluto del logit | Score (PyTorch vs Core AI) |
|---|---|---|
| Especializacion GPU | 0,0078 | 0,99949 vs 0,999 |
| Especializacion Neural Engine | 0,0078 | 0,99949 vs 0,999 |

Estos valores miden unicamente la fidelidad numerica de la conversion, no la
calidad del modelo frente a otros rerankers. No se dispone de comparativas con
alternativas en la informacion proporcionada.

## Requisitos de hardware

- La inferencia esta pensada para ejecutarse en la Neural Engine o en la GPU
  de dispositivos Apple compatibles con Core AI, es decir, iOS o macOS 27 o
  versiones posteriores. El autor confirma que funciona en ambas unidades.
- VRAM estimada: no disponible de forma explicita. Por el tamano del modelo
  (aproximadamente 37 millones de parametros en float16), la huella de pesos
  ronda las decenas de megabytes, muy por debajo de las capacidades de
  cualquier dispositivo Apple moderno.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX
  4090, etc.) porque el modelo no esta orientado a GPUs de servidor, sino al
  hardware integrado de dispositivos Apple.
- Ejecucion en hardware de consumo: si, esta disenado especificamente para
  iPhone, iPad y Mac con Neural Engine o GPU integrada.
- Opciones de despliegue: runtime Core AI de Apple a traves de
  `coreai.runtime` en Python (dependencias indicadas: `coreai-core==1.0.0b3`,
  `transformers`, `torch`, `sentencepiece`, `protobuf`, `numpy`). No se
  mencionan vLLM, llama.cpp, Ollama ni TGI; el modelo no es un modelo
  generativo y su formato `.aimodel` no es compatible con esos servidores.
- Latencia y throughput: no disponible. No se aportan mediciones de latencia
  ni de rendimiento por segundo.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento que
permitan una comparativa rigurosa con modelos alternativos. Como referencias
contextuales se pueden citar:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hotchpotch/japanese-reranker-xsmall-v2` | Modelo base original | Aproximadamente 37 M | No disponible en esta ficha | No disponible en esta ficha | HuggingFace |
| `masahiroid/ruri-v3-130m-coreai` | Conversion previa del mismo autor, misma estrategia de port a Neural Engine | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de comparativas de calidad entre estos modelos ni con otros
rerankers japoneses (por ejemplo, variantes de `bge-reranker` o `reranker`
basadas en otros encoders) en la informacion facilitada.

## Limitaciones y advertencias

- Longitud de contexto fija: la entrada esta limitada a 128 tokens para el
  par consulta-documento completo. Documentos o consultas mas largos se
  truncan, lo que puede degradar la relevancia estimada.
- Es una conversion no oficial, realizada por la comunidad y no por el autor
  del modelo original. La calidad del modelo subyacente no esta garantizada
  por este repositorio.
- Dependencia de un runtime en version beta (`coreai-core==1.0.0b3`) y de
  iOS/macOS 27 o superior, lo que limita su uso a dispositivos y sistemas muy
  recientes.
- No es un modelo generativo: no produce texto, codigo ni respuestas. Solo
  emite un logit de relevancia.
- La validacion de precision publicada se basa en un unico par
  consulta-documento; no constituye una evaluacion exhaustiva de la fidelidad
  de la conversion ni de la robustez del modelo.
- Riesgo de sesgos y alucinacion: no disponible en la informacion
  proporcionada. Al ser un clasificador de relevancia, el termino alucinacion
  no aplica del mismo modo que en modelos generativos, pero no se documentan
  sesgos concretos.
- Idiomas: el soporte declarado se limita a japones e ingles. No hay datos
  sobre su comportamiento en castellano ni en otras lenguas.
- Licencia MIT: permite uso comercial y modificacion, pero al ser una
  conversion no oficial conviene verificar la licencia del modelo base antes
  de explotarlo en produccion.
- No se documentan condiciones de paridad numerica completas, pruebas de
  estres ni auditorias mas alla de la mencion a `model-audit-lite` en el
  archivo `SECURITY.md` del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/japanese-reranker-xsmall-v2-coreai
- Modelo base: https://huggingface.co/hotchpotch/japanese-reranker-xsmall-v2
- Conversion previa del mismo autor: https://huggingface.co/masahiroid/ruri-v3-130m-coreai
- Documentacion de Core AI de Apple: https://developer.apple.com/documentation/coreai
- Herramienta de auditoria de seguridad mencionada: https://github.com/masahirocom/model-audit-lite
