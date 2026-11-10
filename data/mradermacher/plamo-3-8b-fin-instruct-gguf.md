# mradermacher/plamo-3-8b-fin-instruct-GGUF

## Resumen

plamo-3-8b-fin-instruct es un modelo de lenguaje especializado en el dominio financiero y entrenado para el idioma japonés por Preferred Networks (PFNET), distribuido originalmente bajo el identificador `pfnet/plamo-3-8b-fin-instruct`. La versión aquí descrita es una conversión a formato GGUF realizada por mradermacher, que permite ejecutar el modelo en entornos de inferencia local mediante llama.cpp y herramientas compatibles, sin necesidad de infraestructura GPU de datacenter.

El modelo cuenta con 8.531.750.912 parámetros totales (aproximadamente 8,5 mil millones) según los pesos en safetensors del modelo base, lo que lo sitúa en la categoría de modelos de tamaño medio aptos para despliegue en hardware de consumo. Su especialización financiera y su enfoque monolingüe en japonés lo diferencian de los modelos generalistas multilingües, y lo hacen relevante para tareas de análisis, resumen y generación de contenido financiero en contextos japoneses.

La relevancia de esta ficha radica en que combina dos factores poco habituales: por un lado, la especialización vertical en finanzas y, por otro, la disponibilidad de cuantizaciones GGUF estáticas que abarcan desde Q2_K (3,6 GB) hasta f16 (17,2 GB), lo que facilita su evaluación y despliegue en estaciones de trabajo con GPUs consumer. La licencia es la plamo-community-license, que impone condiciones específicas de uso que deben revisarse antes de cualquier explotación comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun el modelo base; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.531.750.912 (8,53 mil millones) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | japones (ja) |
| Licencia | plamo-community-license |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base `pfnet/plamo-3-8b-fin-instruct`. Por el nombre y la familia PLaMo de Preferred Networks, se trata de un transformer decoder-only de aproximadamente 8,5 mil millones de parametros, pero no se dispone en la documentacion consultada de datos sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni vocabulario. Tampoco se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones tecnicas.

Respecto al entrenamiento, la model card unicamente indica la especializacion en finanzas (tag `finance`) y el idioma japones. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. La unica informacion tecnica adicional es la relativa al proceso de cuantizacion: se han generado cuantizaciones estaticas (no ponderadas por imatrix) a partir del modelo base en formato Hugging Face, con la nota de que las variantes ponderadas por imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto en japones con especializacion en el dominio financiero (tag `finance` en el modelo base).
- Conversacion multi-turno: el modelo esta marcado como `conversational` y su nombre incluye el sufijo `instruct`, lo que indica ajuste para seguir instrucciones.
- Razonamiento y sintesis de contenido financiero en japones (analisis de estados financieros, resumen de informes, explicacion de conceptos economicos), segun la especializacion declarada.
- No hay evidencia en la informacion disponible de soporte de tool calling o function calling.
- No hay evidencia en la informacion disponible de capacidades de agente o razonamiento multi-paso explicito.
- No hay evidencia de capacidades de vision, audio ni modo de razonamiento (thinking mode).
- Capacidad multilingue limitada: el unico idioma declarado es el japones (ja).

## Casos de uso

- Analisis de informes financieros en japones: el modelo puede resumir y extraer conclusiones de documentos financieros corporativos (yakuho, informes trimestrales) en su idioma nativo, aprovechando su ajuste especifico al dominio y evitando los errores de traduccion de modelos generalistas.
- Generacion de resumenes de noticias economicas: util para construir boletines o alertas automatizadas en japones sobre mercados, resultados empresariales o politica monetaria, con un tono adaptado al registro financiero.
- Asistencia en atencion al cliente de servicios financieros: conversaciones multi-turno en japones para resolver dudas sobre productos bancarios o de inversion, desplegable en local con llama.cpp para cumplir requisitos de residencia de datos.
- Extraccion y clasificacion de entidades financieras: procesamiento por lotes de textos (notas de prensa, filings) para identificar empresas, cifras y eventos, ejecutable en CPU o GPU consumer con cuantizaciones Q4_K_M.
- Generacion de borradores de documentacion interna: plantillas de analisis de riesgo, fichas de producto o resumenes de reuniones con inversores en japones, revisables posteriormente por un analista humano.
- Evaluacion y prototipado en entornos con recursos limitados: gracias a las cuantizaciones de 3,6 a 9,2 GB, permite experimentar con un modelo financiero japones en una unica GPU consumer antes de escalar a infraestructura mayor.
- Educacion financiera: generacion de explicaciones divulgativas en japones sobre conceptos de inversion, con la advertencia de que requiere supervision humana por el riesgo de alucinacion en cifras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~3,6 GB; Q3_K_M ~4,4 GB; IQ4_XS ~4,9 GB; Q4_K_M ~5,4 GB; Q5_K_M ~6,2 GB; Q6_K ~7,1 GB; Q8_0 ~9,2 GB; f16 ~17,2 GB.
- GPU recomendadas: para Q4_K_M y Q5_K_M basta una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB; para Q8_0 es recomendable una RTX 4070 Ti Super, RTX 4080 o RTX 4090; para f16 se requiere una RTX 4090 (24 GB) o GPUs de datacenter como A100 o H100.
- Cabe en GPU consumer: si, en todas las cuantizaciones hasta Q8_0 con GPUs de 12 GB o mas; f16 requiere al menos 24 GB.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y servidores compatibles con la API de OpenAI mediante llama.cpp server o herramientas equivalentes; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones detalladas de modelos comparables de la misma categoria (modelos financieros en japones de ~8B). La comparacion se limita a caracteristicas estructurales conocidas:

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| plamo-3-8b-fin-instruct (esta ficha) | 8,53B | no disponible | japones | plamo-community-license | GGUF, safetensors |
| Modelos generalistas ~8B multilingues | ~7-9B | variable | multilingue | variable | GGUF, safetensors |
| Modelos financieros en japones de otros proveedores | no disponible | no disponible | japones | no disponible | no disponible |

No se han identificado en la informacion disponible alternativas concretas con las que comparar parametros, contexto y rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Modelo monolingue en japones: no esta entrenado para responder con calidad en castellano ni en otros idiomas, por lo que su uso fuera del japones producira resultados deficientes.
- Riesgo de alucinacion en cifras y datos financieros: al ser un modelo de lenguaje generativo, puede inventar cifras, fechas o referencias corporativas; cualquier salida con datos numericos debe verificarse contra la fuente original.
- Sesgos: no se documentan en la informacion disponible los sesgos del modelo base; al estar entrenado principalmente con datos japoneses, puede reflejar sesgos culturales y de dominio financiero local.
- Licencia plamo-community-license: no es una licencia de codigo abierto estandar; impone condiciones especificas (posibles restricciones de uso comercial, atribucion y limitaciones de redistribucion) que deben revisarse en el enlace oficial antes de cualquier despliegue en produccion.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que impide garantizar el procesamiento de documentos financieros extensos sin truncamiento.
- Cuantizaciones estaticas sin imatrix: el autor advierte de que las variantes ponderadas por imatrix no estaban disponibles, por lo que las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad mas de lo habitual en modelos con cuantizacion ponderada.
- Sin datos de benchmarks: no hay evidencia publicada en la informacion disponible sobre su rendimiento en tareas estandar (MMLU, HumanEval, GSM8K) ni en benchmarks financieros japoneses, lo que dificulta una evaluacion objetiva previa al despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: indica que la conversion GGUF es reciente y no ha sido validada por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/plamo-3-8b-fin-instruct-GGUF
- Modelo base: https://huggingface.co/pfnet/plamo-3-8b-fin-instruct
- Pagina de descargas del autor: https://hf.tst.eu/model#plamo-3-8b-fin-instruct-GGUF
- Licencia PLaMo Community License (ingles): https://plamo.preferredai.jp/info/plamo-community-license-en
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
