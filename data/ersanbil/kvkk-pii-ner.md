# ersanbil/kvkk-pii-ner

## Resumen

`ersanbil/kvkk-pii-ner` (v2.0) es un modelo de reconocimiento de entidades nombradas (NER) para turco, especializado en la deteccion de datos personales protegidos por la KVKK (la ley turca de proteccion de datos personales, equivalente al RGPD) y de entidades comerciales en textos juridicos. Lo desarrolla Ersan Bilik (`@ersanbil`) y se construye mediante fine-tuning del modelo `dbmdz/bert-base-turkish-cased` (BERT base en turco con tokenizador WordPiece case-sensitive, 110 millones de parametros).

El modelo resuelve un problema muy concreto: la anonimizacion y clasificacion de informacion sensible en documentos judiciales turcos (sentencias del Yargitay, Danistay y del Tribunal Constitucional) y en facturas o documentos mercantiles. A diferencia de un NER generico, distingue categorias que la KVKK trata de forma agravada en su articulo 6 (datos de salud, afiliacion sindical, antecedentes penales, datos biometricos o geneticos) y anade entidades de tipo comercial (razon social y oficina tributaria).

Es relevante ahora porque la mayoria de herramientas PII estan disenadas para ingles o para un esquema generico de entidades; este modelo ofrece un esquema BIO de 13 etiquetas especifico para el ordenamiento juridico turco, con licencia Apache-2.0 y solo 110M de parametros, lo que permite desplegarlo en CPU o en GPU de consumo para tareas de redaccion y cumplimiento normativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), token classification |
| Parametros totales | 110.036.749 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite estandar de BERT base; no se especifica otro en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion post-entrenamiento via herramientas externas) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 (con atribucion obligatoria segun seccion 4(d) del NOTICE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base (12 capas, atencion multi-cabeza bidireccional, 110M de parametros) adaptado a token classification mediante una cabeza lineal sobre las representaciones del token `[CLS]`/subtoken, con esquema BIO de 13 etiquetas: `O`, `B/I-PERSON`, `B/I-ADDRESS`, `B/I-HEALTH_DATA`, `B/I-KVKK_SPECIAL`, `B/I-ORG_COMPANY` y `B/I-TAX_OFFICE`. El tokenizador es el WordPiece case-sensitive de BERTurk.

El entrenamiento se realizo sobre 868 ejemplos de alta densidad (737 de entrenamiento y 131 de validacion) extraidos de sentencias reales del corpus `hamzabagirsakci/turkish-court-decisions` (11.045.085 decisiones judiciales turcas), complementados con ejemplos hibridos de datos de salud, afiliacion sindical, antecedentes penales y facturas comerciales. Se entreno durante 6 epocas, alcanzando una perdida de validacion de 0,0493 y una exactitud de token del 98,79 %. La model card no documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; es un fine-tuning supervisado clasico.

## Capacidades

- Reconocimiento de nombres de personas fisicas en textos juridicos turcos, incluyendo titulos profesionales (`Av.`, `Dr.`).
- Deteccion de direcciones postales completas (calle, numero, distrito, provincia).
- Clasificacion de datos de salud como categoria especial (diagnosticos ICD-10, informes de epicrisis, certificados de discapacidad).
- Deteccion de datos personales de categoria especial del articulo 6 de la KVKK: afiliacion sindical, pertenencia a asociaciones o fundaciones, antecedentes penales y medidas de seguridad, datos biometricos o geneticos.
- Reconocimiento de razones sociales y personas juridicas mercantiles (sociedades anonimas, limitadas, etc.).
- Deteccion de oficinas tributarias (vergi dairesi) vinculadas a entidades.
- Salida en formato BIO compatible con la pipeline `token-classification` de Hugging Face Transformers.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo discriminativo de etiquetado, no generativo.
- Capacidad multilingue limitada al turco.

## Casos de uso

- Anonimizacion previa a la publicacion de sentencias: el modelo permite enmascarar nombres, direcciones y datos de salud antes de publicar resoluciones judiciales, cumpliendo con la KVKK y con las politicas de acceso publico a la jurisprudencia.
- Cumplimiento normativo en despachos de abogados: procesar expedientes para localizar y clasificar datos personales de categoria especial antes de compartirlos con terceros o transferirlos fuera de Turquia.
- Redaccion de documentos en bufetes: sustituir automaticamente entidades sensibles por marcadores en borradores de demandas y contratos, reduciendo el riesgo de filtracion.
- Procesamiento de facturas y documentos mercantiles: extraer razon social y oficina tributaria para sistemas de contabilidad o conciliacion, y a la vez detectar datos personales en los mismos documentos.
- Construccion de pipelines de DLP (data loss prevention) en turco: integrar el modelo como clasificador de entidades en herramientas de monitorizacion de correo o repositorios documentales.
- Investigacion en NLP juridico turco: servir como baseline reproducible para tareas de NER sobre el corpus de decisiones judiciales y para estudiar la deteccion de categorias especiales del articulo 6 de la KVKK.
- Preprocesamiento para entrenamiento de modelos generativos: anonimizar grandes volumenes de texto juridico antes de usarlos como corpus de entrenamiento, evitando memorizacion de datos personales.
- Enriquecimiento de sistemas de gestion documental: etiquetar automaticamente expedientes por presencia de datos de salud o antecedentes penales para aplicar controles de acceso diferenciados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Exactitud de token en validacion | 98,79 % | TurkceOCR Unified NER v3 Corpus (868 ejemplos reales de juzgados + hibridos) |
| Recall de PII critica KVKK (KPI-13) | 100 % | Medido con UnifiedTurkishEntityEngine |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de token classification.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos y entre 1 y 2 GB adicionales segun el tamano de batch y la longitud de secuencia.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volumenes moderados.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes de grandes corpus; para uso interactivo basta una GPU consumer.
- Opciones de despliegue: `transformers` pipeline con `aggregation_strategy="simple"`, ONNX Runtime, TorchScript, y servidores de inferencia como TGI o vLLM (soporte limitado para modelos encoder de clasificacion). Tambien es viable exportar a GGUF para llama.cpp, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esquema de entidades | Licencia | Enfoque |
|---|---|---|---|---|---|
| `ersanbil/kvkk-pii-ner` | 110M | 512 | 13 etiquetas BIO especificas de KVKK | Apache-2.0 | Turco juridico y comercial |
| `dbmdz/bert-base-turkish-cased` | 110M | 512 | no aplica (modelo base) | MIT | Base preentrenada en turco |
| `savasy/bert-base-turkish-ner` | 110M | 512 | NER generico en turco (persona, organizacion, lugar) | no disponible | NER generalista |
| `mys/bert-base-turkish-cased-ner` | 110M | 512 | NER generico en turco | no disponible | NER generalista |

Frente a los NER genericos en turco, la diferencia principal es la granularidad del esquema: este modelo distingue datos de salud y categorias especiales de la KVKK, ademas de entidades comerciales, algo que los modelos genericos no cubren. No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido (868 ejemplos, 737 de entrenamiento); el 98,79 % de exactitud de token puede no generalizar a dominios distintos del juridico o a estilos de redaccion diferentes.
- La metrica de recall del 100 % en KPI-13 no esta verificada de forma independiente y procede de un motor propietario del autor (`UnifiedTurkishEntityEngine`), por lo que debe interpretarse con cautela.
- Solo soporta turco; no es util para documentos multilingues sin un pipeline adicional.
- Limite de contexto de 512 tokens: los documentos largos deben fragmentarse, lo que puede romper entidades que cruzan fronteras de fragmento.
- Riesgo de falsos positivos en textos no juridicos, especialmente con nombres propios que coincidan con razones sociales o terminos medicos.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea en entidades ambiguas (por ejemplo, un apellido que coincide con una localidad).
- La licencia Apache-2.0 exige mantener la atribucion a Ersan Bilik y a Hamza Bagirsakci segun la seccion 4(d) del NOTICE; el uso comercial es posible pero con esa obligacion.
- No se documentan sesgos especificos, aunque al entrenarse sobre sentencias judiciales turcas puede heredar sesgos de ese corpus (por ejemplo, sobrerrepresentacion de ciertos nombres o localidades).
- No es un modelo generativo: no puede redactar, resumir ni responder preguntas; solo etiqueta tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ersanbil/kvkk-pii-ner
- Perfil del autor: https://huggingface.co/ersanbil
- Ecosistema TurkceOCR: https://huggingface.co/ersanbil/TurkceOCR
- Dataset de evaluacion: https://huggingface.co/datasets/ersanbil/TurkceOCR-Bench
- Demo: https://huggingface.co/spaces/ersanbil/TurkceOCR-Demo
- Corpus de decisiones judiciales turcas: https://huggingface.co/datasets/hamzabagirsakci/turkish-court-decisions
- Modelo base BERTurk: https://huggingface.co/dbmdz/bert-base-turkish-cased
