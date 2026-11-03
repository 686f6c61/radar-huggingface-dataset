# fellype-dev-ai/br-access-ner-v1

## Resumen

BR-Access-NER-v1 es un modelo de reconocimiento de entidades nombradas (NER) en portugues, especializado en la deteccion de posibles datos personales en solicitudes administrativas de acceso a la informacion (e-SIC). Lo desarrolla el usuario fellype-dev-ai como refactorizacion tecnica de un proyecto originado en el Hackathon de la Controladoria-Geral do Distrito Federal (CGDF), y no constituye una validacion ni implantacion oficial por parte de dicho organismo.

Tecnicamente es un fine-tuning de BERTimbau Base (neuralmind/bert-base-portuguese-cased), un transformer encoder de tipo BERT con 108.353.307 parametros, ajustado para clasificacion de tokens en formato BIO sobre el dataset EliMC/esic-ner, compuesto por documentos sinteticos en portugues con anotaciones de 13 tipos de entidad. Sobre la salida del NER se aplica una regla determinista que convierte las entidades detectadas en una clasificacion binaria del documento (con o sin dato personal identificado).

Su relevancia es acotada pero concreta: cubre un nicho poco atendido (NER de PII en portugues juridico-administrativo) con metricas de entidad declaradas de F1 90,48% sobre un test sintetico de 975 documentos, licencia CC-BY-4.0 y un tamano que permite inferencia en CPU. No es un modelo generativo ni un LLM: es un clasificador extractivo de entidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERTimbau Base, neuralmind/bert-base-portuguese-cased), clasificacion de tokens con etiquetado BIO |
| Parametros totales | 108.353.307 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitacion heredada de BERTimbau Base, tipicamente 512 tokens; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; no se publican variantes cuantizadas) |
| Idiomas soportados | portugues (pt) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de BERTimbau Base, un encoder BERT de 12 capas y 768 dimensiones ocultas preentrenado en portugues, y se ajusta mediante fine-tuning supervisado para clasificacion de tokens con esquema BIO. La cabeza de clasificacion emite etiquetas por token que se agrupan en entidades; el conjunto de etiquetas cubre 13 categorias: `ORG_JURIDICA`, `NOME_PESSOA`, `ID_PROCESSUAL`, `CONTATO`, `DOC_PESSOAL`, `DADO_SAUDE`, `ENDERECO`, `DOC_EMPRESA`, `DOC_PROFISSIONAL`, `ID_VEICULO`, `QUASI_IDENTIFICADOR`, `DADO_FINANCEIRO` y `DATA_NASC`.

El entrenamiento utiliza el dataset EliMC/esic-ner, formado por documentos sinteticos en portugues con anotaciones de esas 13 categorias. El pipeline de preparacion convierte las anotaciones a BIO, divide los documentos en train/validation/test y genera los ficheros para el fine-tuning. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF/DPO (no procede en un encoder de clasificacion). La innovacion funcional del proyecto no esta en la arquitectura sino en la capa de post-proceso: una regla derivada transforma las entidades predichas en una clasificacion binaria del documento, donde 11 de las 13 categorias (todas salvo `ORG_JURIDICA` y `DOC_EMPRESA`) activan la clase `COM DADO PESSOAL`.

## Capacidades

- Reconocimiento de entidades nombradas en portugues sobre texto administrativo y juridico, con 13 categorias orientadas a datos personales.
- Deteccion de PII: nombres de persona, contactos, documentos personales y profesionales, direccion, datos de salud, datos financieros, identificadores de vehiculo, identificador procesal, cuasi-identificadores y fecha de nacimiento.
- Clasificacion binaria a nivel de documento mediante regla derivada: `COM DADO PESSOAL` frente a `SEM DADO PESSOAL IDENTIFICADO`.
- Etiquetado a nivel de token con esquema BIO, apto para extraccion de spans y resaltado de entidades.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling ni razonamiento multi-paso: es un modelo exclusivamente extractivo.
- Capacidad multilingue limitada al portugues; no se declaran otros idiomas.
- No dispone de modo thinking ni capacidades de audio.

## Casos de uso

- Triaje de solicitudes de acceso a la informacion: el modelo procesa el texto de peticiones e-SIC, extrae entidades candidatas a dato personal y aplica la regla binaria para priorizar la revision humana de los documentos marcados como `COM DADO PESSOAL`.
- Pre-revision de expedientes antes de publicacion o respuesta: se ejecuta el NER sobre borradores y se resaltan spans de `NOME_PESSOA`, `CONTATO`, `DOC_PESSOAL` o `ENDERECO` para que el equipo responsable decida si procede anonimizar o restringir el acceso.
- Enriquecimiento de sistemas de gestion documental: integracion como paso de extraccion en pipelines que indexan documentos administrativos y necesitan metadatos estructurados (tipo de entidad y span) para busqueda y filtrado.
- Senalizacion de PII en corpus internos: deteccion de datos personales en lotes de documentos antes de compartirlos con terceros o de incorporarlos a entornos de analisis, usando la salida BIO para localizar los fragmentos a revisar.
- Analisis exploratorio de volumenes de solicitudes: clasificacion masiva de peticiones para estimar la proporcion de documentos con posibles datos personales y orientar la asignacion de recursos de revision, con la cautela de que las predicciones no equivalen a aciertos verificados.
- Apoyo a auditoria y cumplimiento interno: generacion de listados de entidades detectadas por documento que sirvan como punto de partida para revisiones de proteccion de datos, siempre con validacion humana posterior.
- Componente de bajo coste en entornos con CPU: al ser un encoder de 108M de parametros, puede desplegarse en servidores sin GPU para prefiltrar documentos antes de pasos mas costosos.

## Benchmarks y rendimiento

Evaluacion declarada por el autor sobre el conjunto de test de 975 documentos sinteticos, con correspondencia exacta de entidades:

| Metrica | Resultado |
|---|---:|
| Precision (entidad) | 89,90% |
| Recall (entidad) | 91,07% |
| F1 (entidad) | 90,48% |
| Precision por token (accuracy) | 99,03% |

Experimento exploratorio sobre 99 solicitudes reales sin etiquetas de referencia (solo distribucion de predicciones, no metricas de acierto):

| Clasificacion prevista | Cantidad | Porcentaje |
|---|---:|---:|
| COM DADO PESSOAL | 67 | 67,7% |
| SEM DADO PESSOAL IDENTIFICADO | 32 | 32,3% |
| Total | 99 | 100% |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en fp32 para los pesos (108M de parametros); en la practica, menos de 1 GB incluyendo activaciones para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo no requiere A100 ni H100. Una RTX 3060, RTX 4090 o T4 lo ejecutan con holgura.
- Cabe en GPU de consumo y tambien en CPU: es viable en portatiles y en servidores sin acelerador, con throughput dependiente del hardware y de la longitud de secuencia.
- Opciones de despliegue: transformers (pipeline `token-classification`), y por compatibilidad de arquitectura BERT, exportacion a ONNX o cuantizacion a int8 para servir con infraestructura estandar de encoders; no se publican artefactos GGUF ni integraciones especificas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BR-Access-NER-v1 | 108.353.307 | no disponible | NER de PII en portugues (13 categorias) | CC-BY-4.0 | HuggingFace, transformers |
| neuralmind/bert-base-portuguese-cased (modelo base) | ~108M | no disponible | Encoder de proposito general en portugues | no disponible en la informacion | HuggingFace |
| Modelos NER genericos en portugues (p. ej. derivados de BERTimbau para etiquetado general) | ~108M | no disponible | NER de proposito general (PER, ORG, LOC, MISC) | variable | HuggingFace |

La comparacion cuantitativa con alternativas no esta disponible: el autor no publica resultados frente a otros modelos NER en portugues ni frente a sistemas de deteccion de PII. La diferencia funcional frente al modelo base es el fine-tuning supervisado sobre EliMC/esic-ner y la taxonomia especifica de 13 categorias orientada a datos personales.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre documentos sinteticos: el salto a solicitudes reales no esta validado con etiquetas humanas; el experimento con 99 solicitudes reales solo reporta la distribucion de predicciones, no su correccion.
- La clase `SEM DADO PESSOAL IDENTIFICADO` no certifica ausencia de datos personales: solo indica que el modelo no detecto ninguna entidad de las 11 categorias que activan la regla binaria.
- La clasificacion binaria es una convencion operativa del proyecto, no una interpretacion juridica de la LGPD; el contexto de cada dato sigue siendo determinante.
- Riesgo de falsos positivos en identificadores que pueden no referirse a una persona natural, como numeros de proceso o referencias a estadisticas agregadas, segun senala el propio autor.
- Limitacion ante informacion en anexos o descripciones indirectas: el analisis se restringe al texto disponible y puede no capturar datos personales referenciados de forma implicita.
- Contexto maximo no declarado; al heredar BERTimbau Base, es previsible una ventana de 512 tokens, lo que obliga a trocear documentos largos y puede perder entidades en los limites de fragmento.
- Solo portugues: no se declara soporte de otros idiomas ni de variantes distintas del portugues brasileno.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero no se ofrece garantia alguna ni se declara idoneidad para produccion; el autor advierte que el modelo no sustituye la revision humana ni realiza anonimizacion automatica.
- Sin validacion institucional: el proyecto no ha sido homologado ni implantado oficialmente por la CGDF.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en produccion ni de validacion independiente por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fellype-dev-ai/br-access-ner-v1
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/EliMC/esic-ner
- Repositorio de codigo, paper o demo: no disponible en la informacion proporcionada.
