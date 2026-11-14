# Sanorian/slovnet-ner-ru-pii

## Resumen

Slovnet NER Russian PII es un modelo de reconocimiento de entidades nombradas (NER) especializado en la extraccion de datos personales identificables (PII) en textos en ruso. Lo desarrolla el usuario Sanorian y se distribuye bajo licencia MIT. Se trata de un ajuste fino (fine-tuning) del modelo `natasha/slovnet_ner_news_v1`, que a su vez forma parte del ecosistema Natasha, una libreria de procesamiento de lenguaje natural para ruso.

El modelo resuelve el problema de la anonimizacion y deteccion de datos sensibles en corpus rusoparlantes: identifica 11 tipos de entidades (persona, organizacion, localizacion, fecha, edad, dinero, URL, telefono, correo electronico, profesion y codigo de grupo) mediante 22 etiquetas BIO. Esta pensado para integrarse en pipelines de anonimizacion como una fuente de senal independiente y complementaria a expresiones regulares y otros modelos como GLiNER.

La relevancia del modelo es acotada pero concreta: cubre un nicho poco atendido (PII en ruso) con una arquitectura ligera basada en Slovnet y embeddings Navec congelados, lo que facilita su despliegue en entornos con recursos limitados. No obstante, el repositorio no incluye pesos en formato estandar de Hugging Face, sino un archivo tar con el formato propio de Slovnet, y no se han publicado resultados de benchmarks comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Slovnet NER (red neuronal recurrente sobre embeddings Navec, arquitectura propia de la libreria Natasha) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato propio de Slovnet, no cuantizable via GGUF/ONNX estandar) |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | Archivo tar con paquete `.pkg` propio de Slovnet (`SlovnetNER.load`) |

## Arquitectura y entrenamiento

El modelo se basa en Slovnet NER, la implementacion de NER de la libreria Natasha, que opera sobre embeddings Navec preentrenados. En este ajuste fino los embeddings Navec permanecen congelados (warm start desde `natasha/slovnet_ner_news_v1`), y se entrena la cabeza de clasificacion token a token con 22 etiquetas BIO que cubren 11 tipos de entidad: persona, organizacion, localizacion, fecha, edad, dinero, URL, telefono, correo electronico, profesion y codigo de grupo.

El conjunto de entrenamiento consta de 2238 frases con anotacion BIO, construidas a partir de la conversion del corpus abierto de noticias NEREL y de textos sinteticos que incorporan formatos tipicos de datos personales rusos (direcciones, telefonos, documentos, cantidades monetarias). El autor declara explicitamente que no se utilizaron datos personales reales. No se detalla en la informacion disponible si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones posteriores al entrenamiento supervisado.

## Capacidades

- Reconocimiento de entidades nombradas en ruso con 11 tipos: persona, organizacion, localizacion, fecha, edad, dinero, URL, telefono, correo electronico, profesion y codigo de grupo.
- Etiquetado token a token en formato BIO (22 etiquetas B/I).
- Deteccion de PII en textos no estructurados, orientada a tareas de anonimizacion y redaccion de datos sensibles.
- Integracion con la libreria Natasha y con el ecosistema Slovnet para procesamiento de texto ruso.
- Uso como fuente de senal complementaria en pipelines que combinan expresiones regulares y otros modelos NER (por ejemplo, GLiNER).
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades multimodales segun la informacion disponible.

## Casos de uso

- Anonimizacion de documentos internos en ruso: el modelo detecta nombres, telefonos, correos y direcciones en textos corporativos antes de compartirlos con terceros o almacenarlos en entornos no seguros.
- Cumplimiento normativo de proteccion de datos: como capa adicional en pipelines de redaccion (redaction) que combinan regex para formatos fijos (telefonos, correos) y NER para entidades variables (personas, organizaciones), reduciendo falsos negativos.
- Preprocesamiento de corpus para investigacion: limpieza de PII en datasets de noticias o textos abiertos antes de su publicacion o uso en entrenamiento de otros modelos.
- Moderacion y filtrado de contenido generado por usuarios: deteccion de datos personales en foros, comentarios o mensajes que deban ser redactados antes de su visualizacion publica.
- Enriquecimiento de sistemas de extraccion de informacion: identificacion estructurada de entidades (fechas, importes, organizaciones) en documentos financieros o administrativos rusos para su volcado a bases de datos.
- Despliegue en servicios Docker con recursos limitados: al usar embeddings congelados y una arquitectura ligera, el modelo puede ejecutarse en CPU dentro de contenedores, integrándose via la variable de entorno `NATASHA_MODEL_TAR` en el servicio del autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Dev F1 | 0.79 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de calidad reportado por el autor es el F1 de 0.79 sobre el conjunto de desarrollo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al tratarse de un modelo Slovnet ligero con embeddings Navec congelados, se espera un consumo bajo, ejecutable en CPU.
- GPU recomendadas: no disponible; no se requieren GPU dedicadas segun la arquitectura descrita.
- Compatibilidad con GPU de consumo: previsiblemente si, aunque no se especifica en la informacion disponible.
- Opciones de despliegue: libreria Natasha/Slovnet en Python, con carga del archivo tar mediante `SlovnetNER.load`; despliegue en Docker mediante la variable de entorno `NATASHA_MODEL_TAR`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Sanorian/slovnet-ner-ru-pii | NER (Slovnet) | Ruso | no disponible | MIT | tar/.pkg |
| natasha/slovnet_ner_news_v1 (modelo base) | NER (Slovnet) | Ruso | no disponible | MIT | tar/.pkg |
| GLiNER (mencionado por el autor) | NER zero-shot | Multilingue | no disponible | no disponible en la informacion | safetensors/ONNX |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. El autor indica que, en su pipeline de anonimizacion, este modelo aporta una segunda senal independiente junto a regex y GLiNER para las categorias date, age, money y organization.

## Limitaciones y advertencias

- El conjunto de entrenamiento es pequeno (2238 frases) y combina datos de NEREL con textos sinteticos, lo que puede limitar la generalizacion a dominios distintos del noticiario y de los formatos sinteticos cubiertos.
- El F1 de 0.79 en desarrollo sugiere un margen de error apreciable; en produccion se recomienda combinarlo con otras fuentes de senal y validacion humana en casos criticos.
- Solo soporta ruso; no es util para otros idiomas.
- No se han publicado evaluaciones de sesgos; al entrenar sobre noticias y textos sinteticos, puede heredar sesgos de representacion del corpus NEREL.
- Riesgo de alucinacion de entidades: como todo modelo NER, puede etiquetar fragmentos como PII cuando no lo son (falsos positivos) o pasar por alto entidades no vistas (falsos negativos).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre la idoneidad para cumplimiento normativo estricto; la responsabilidad de validar la anonimizacion recae en el integrador.
- El formato de pesos es propietario de Slovnet (tar con `.pkg`), lo que limita su uso fuera del ecosistema Natasha y complica la conversion a otros runners (vLLM, llama.cpp, TGI).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanorian/slovnet-ner-ru-pii
- Modelo base: https://huggingface.co/natasha/slovnet_ner_news_v1
- Repositorio Slovnet (Natasha): https://github.com/natasha/slovnet
