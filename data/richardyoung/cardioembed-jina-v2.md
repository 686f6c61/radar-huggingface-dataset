# richardyoung/CardioEmbed-Jina-v2

## Resumen

CardioEmbed-Jina-v2 es un adaptador LoRA publicado por Richard Young (DeepNeuro) que especializa el modelo de embeddings `jinaai/jina-embeddings-v2-base-en` en texto de cardiología clínica. No es un modelo generativo, sino un modelo de representación densa (sentence-similarity) pensado para tareas de recuperación semántica, clustering y búsqueda de similitud sobre literatura cardiológica. Forma parte de un estudio comparativo de diez arquitecturas de embeddings para representación de texto clínico (arXiv:2511.19739).

El modelo resuelve el problema del sesgo de dominio: los embeddings de propósito general rinden peor cuando el vocabulario técnico (hemodinámica, fracción de eyección, dispositivos de asistencia ventricular, etc.) domina el corpus. Mediante un ajuste LoRA sobre pares de texto cardiológico extraídos de libros de texto médicos, el adaptador desplaza el espacio de representación hacia ese dominio sin reentrenar el encoder completo.

La relevancia es acotada pero clara: se distribuye como adaptador PEFT (no como modelo autónomo), con licencia Apache 2.0, y requiere cargar el modelo base de Jina en paralelo. El repositorio es de tamaño mínimo (0,0 GB en el momento de la consulta), lo que confirma que solo contiene los pesos del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like) con adaptador LoRA; modelo base jina-embeddings-v2-base-en |
| Parametros totales | No disponible (adaptador LoRA; los parametros del modelo base no se detallan en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Jina v2 soporta contexto largo, pero el dato no se confirma aqui) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `jinaai/jina-embeddings-v2-base-en`, un encoder tipo BERT que produce embeddings de oracion. El ajuste se realiza con LoRA de rango r=16 y alpha=32, lo que introduce un numero reducido de parametros entrenables en las capas de atencion/proyeccion del encoder sin modificar los pesos congelados del modelo base. La salida sigue siendo un vector denso utilizable con sentence-transformers.

El entrenamiento emplea 106.535 pares de texto de cardiologia procedentes de libros de texto medicos, optimizados con Multiple Negatives Ranking Loss (InfoNCE), la funcion estandar para aprendizaje contrastivo de embeddings. No se documentan fases de RLHF ni DPO, algo coherente con un modelo de representacion. La innovacion tecnica es la adaptacion de dominio barata (LoRA) frente al reentrenamiento completo, lo que permite comparar diez arquitecturas bajo un mismo protocolo, tal como describe el paper asociado.

## Capacidades

- Generacion de embeddings densos para similitud semantica entre textos de cardiologia.
- Busqueda semantica y recuperacion de informacion (retrieval) sobre corpus clinicos.
- Clustering y deduplicacion de documentos medicos por similitud vectorial.
- Clasificacion y ranking de pares texto-texto mediante puntuacion de similitud.
- Integracion con el ecosistema sentence-transformers y PEFT.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder de representaciones.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Busqueda semantica en repositorios de guias clinicas de cardiologia: indexar el corpus con los embeddings del adaptador y recuperar fragmentos relevantes ante consultas de facultativos, aprovechando el ajuste al vocabulario tecnico.
- Sistemas de pregunta-respuesta sobre literatura cardiologica (RAG): usar el modelo como retriever en un pipeline donde un LLM generativo consume los pasajes recuperados; el sesgo de dominio mejora la precision del recall frente a embeddings generalistas.
- Deduplicacion y agrupamiento de articulos cientificos: calcular similitudes coseno entre resumenes para detectar publicaciones redundantes o construir clusters tematicos (insuficiencia cardiaca, arritmias, valvulopatias).
- Enrutamiento de documentacion clinica: clasificar notas o informes hacia especialidades o protocolos internos comparando su embedding con prototipos por categoria.
- Deteccion de similitud entre casos clinicos: emparejar descripciones de pacientes con casos historicos anonimizados para apoyar la revision medica.
- Evaluacion comparativa de arquitecturas de embeddings: reutilizar este adaptador como linea base de dominio en experimentos de investigacion sobre representacion de texto clinico, dado que forma parte de un estudio publicado.

## Benchmarks y rendimiento

La model card reporta una unica metrica: Separation Score de **-0,175**. No se especifica en la informacion proporcionada la definicion exacta de la metrica, el conjunto de evaluacion ni los resultados de los modelos comparados. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks estandar de retrieval (MTEB, BEIR).

| Metrica | Resultado |
|---|---|
| Separation Score | -0,175 |

## Requisitos de hardware

- El adaptador LoRA es de tamano minimo (repositorio de 0,0 GB); el coste real lo determina el modelo base `jina-embeddings-v2-base-en`.
- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un encoder base de ~137M de parametros (dato del modelo base, no confirmado en la informacion proporcionada), la inferencia en fp16 deberia caber en GPUs consumer con holgura.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente para lotes moderados; A100/H100 solo necesarias para indexacion masiva a gran escala.
- Despliegue: transformers + peft, sentence-transformers, o servidores de embeddings (TEI, vLLM con soporte de embedding) cargando base + adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Dominio | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioEmbed-Jina-v2 | Adaptador LoRA sobre encoder | Cardiologia | en | Apache 2.0 | Hugging Face (PEFT) |
| jinaai/jina-embeddings-v2-base-en | Encoder de embeddings | General | en | Apache 2.0 (segun modelo base) | Hugging Face |
| Otros adaptadores del estudio (9 arquitecturas) | Adaptadores LoRA | Cardiologia | en | No disponible | Referenciados en arXiv:2511.19739 |

No se dispone en la informacion proporcionada de datos de rendimiento de los modelos alternativos que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Solo ingles: no cubre corpus en castellano ni otros idiomas.
- Requiere cargar el modelo base de Jina ademas del adaptador; no es un modelo autonomo.
- El Separation Score reportado (-0,175) es negativo y su interpretacion no se documenta; conviene validar el rendimiento en el corpus propio antes de adoptarlo en produccion.
- Riesgo de sesgo heredado del corpus de libros de texto medicos (posible infrarrepresentacion de subpoblaciones o practicas clinicas no anglosajonas).
- No es un modelo clinico validado: no debe usarse para decision diagnostica o terapeutica sin supervision medica.
- Al ser un encoder, no genera texto; cualquier alucinacion proviene del LLM que consuma sus embeddings.
- Uso comercial permitido por Apache 2.0, sujeto a las condiciones del modelo base.
- Repositorio con muy pocas descargas (7) y sin likes: ecosistema de validacion minimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/CardioEmbed-Jina-v2
- Modelo base: https://huggingface.co/jinaai/jina-embeddings-v2-base-en
- Paper: https://arxiv.org/abs/2511.19739
- Perfil del autor: https://deepneuro.ai/richard
