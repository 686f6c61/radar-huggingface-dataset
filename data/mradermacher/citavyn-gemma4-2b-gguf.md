# mradermacher/citavyn-gemma4-2b-GGUF

## Resumen

citavyn-gemma4-2b es un modelo de lenguaje publicado por citavyn, orientado especificamente a casos de uso de gobernanza de IA: recuperacion aumentada por generacion (RAG) sobre politicas y normativas, etiquetado de cumplimiento del Reglamento Europeo de IA (EU AI Act), el marco de gestion de riesgos de IA del NIST (NIST AI RMF), proteccion de datos (GDPR), control de acceso basado en roles (RBAC) y redaccion de informacion personal identificable (PII). El nombre sugiere una adaptacion del modelo Gemma de Google, aunque no se dispone de confirmacion oficial sobre la arquitectura base en la informacion proporcionada.

Esta ficha describe la version cuantizada en formato GGUF publicada por mradermacher, un colaborador habitual de la comunidad que genera cuantizaciones estaticas de modelos populares para su uso con llama.cpp y herramientas compatibles. El repositorio incluye 12 variantes de cuantizacion que van desde Q2_K (3,1 GB) hasta f16 (9,4 GB), lo que permite desplegar el modelo en hardware de consumo.

El modelo declara 4.647.450.147 parametros en sus pesos safetensors, un dato que no concuerda con la denominacion "2b" del nombre y que conviene verificar antes de planificar el despliegue. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. El repositorio no registra descargas ni interacciones en el momento de la consulta, lo que sugiere un lanzamiento muy reciente o de baja difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de Gemma 4, segun el nombre; sin confirmacion oficial) |
| Parametros totales | 4.647.450.147 (pesos safetensors); el nombre indica "2b", discrepancia no aclarada |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 48,0 GB |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-11-17 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset. El nombre del modelo indica una base Gemma 4, lo que apunta a una familia de transformers densos con atencion por bloques y decodificacion autoregresiva, pero no hay confirmacion explicita en la model card. Tampoco se documenta si hubo fases de ajuste fino supervisado, RLHF o DPO, ni que tecnicas de alineacion se aplicaron.

La unica informacion tecnica concreta del repositorio proviene del proceso de cuantizacion: se trata de cuantizaciones estaticas generadas con convert_type hf y quantize_version 2, sin cuantizaciones ponderadas por matriz de importancia (imatrix), que el autor indica que probablemente no estaran disponibles. El modelo base citavyn/citavyn-gemma4-2b es el punto de partida; esta ficha cubre exclusivamente la version GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Recuperacion aumentada por generacion (RAG): el modelo esta etiquetado especificamente para flujos de recuperacion y respuesta sobre documentos.
- Cumplimiento normativo: etiquetas para EU AI Act y NIST AI RMF, orientadas a clasificacion y evaluacion de riesgos.
- Proteccion de datos: soporte declarado para GDPR y redaccion de PII.
- Control de acceso: etiqueta RBAC, que sugiere capacidad para razonar sobre permisos y roles.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica integracion con APIs de inferencia estandar.
- No se documentan capacidades de vision, audio, tool calling ni modo de razonamiento extendido (thinking).

## Casos de uso

- Clasificacion de riesgos del EU AI Act: el modelo puede recibir la descripcion de un sistema de IA y devolver una categoria de riesgo (inaceptable, alto, limitado, minimo) junto con las obligaciones aplicables, aprovechando su ajuste especifico sobre esta normativa.
- Auditoria de cumplimiento del NIST AI RMF: uso como asistente para mapear controles internos de una organizacion contra las funciones del marco (govern, map, measure, manage) y generar informes de brechas.
- Redaccion de PII en pipelines de datos: integrado como paso previo al almacenamiento o al envio de textos a terceros, el modelo identifica y enmascara nombres, direcciones u otros identificadores personales antes de que el dato salga del perimetro.
- Asistente de RAG sobre politicas internas: desplegado con llama.cpp o vLLM detras de un recuperador vectorial, responde preguntas de empleados sobre normativa de privacidad y gobernanza citando los fragmentos recuperados.
- Revision de contratos y clausulas de proteccion de datos: extraccion de obligaciones y deteccion de clausulas incompatibles con el GDPR en acuerdos de tratamiento de datos, con salida estructurada para revision humana.
- Control de acceso asistido: dado un rol y una peticion, el modelo evalua si la operacion es coherente con la politica RBAC definida y justifica la decision para trazabilidad.
- Despliegue en entornos con hardware limitado: las cuantizaciones Q4_K_M (3,5 GB) permiten ejecutar el modelo en estaciones de trabajo sin GPU dedicada o en portatiles con GPU integrada, util para pilotos de gobernanza antes de escalar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB con Q4_K_M, 5,1 GB con Q8_0 y 9,4 GB con f16, mas el espacio de cache KV segun la longitud de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas para cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 4070); para f16 se recomienda 12 GB o mas (RTX 4070 Ti, RTX 4080). En entornos de servidor, A100 o H100 solo tienen sentido si se necesita mucho throughput concurrente.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna con 8 GB o mas, e incluso en CPU con llama.cpp usando Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos de gobernanza de IA con los que contrastar parametros, contexto o rendimiento. Como referencia generica de la categoria de modelos pequenos en GGUF, se puede considerar la familia Gemma original, pero no hay datos de benchmarks de este modelo que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| citavyn-gemma4-2b (este) | 4.647.450.147 (segun safetensors) | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en gobernanza de IA |
| Gemma 2B (referencia de familia) | ~2.000 millones | no disponible | Gemma Terms | safetensors, GGUF | Modelo generalista de Google |
| Otros modelos de gobernanza | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas directas |

## Limitaciones y advertencias

- Solo soporta ingles; no se declara ni se garantiza calidad en castellano u otros idiomas.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas de gobernanza no esta verificado de forma independiente.
- La discrepancia entre el nombre "2b" y los 4.647.450.147 parametros de los safetensors debe resolverse antes de dimensionar el despliegue; puede tratarse de un error de etiquetado o de pesos con capas adicionales.
- Riesgo de alucinacion relevante en un dominio normativo: las respuestas sobre obligaciones legales deben validarse siempre con fuentes oficiales y revision humana.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la precision en tareas de clasificacion normativa; se recomienda Q4_K_M o superior para produccion.
- No se dispone de cuantizaciones ponderadas por imatrix, que suelen ofrecer mejor relacion calidad/tamano en modelos pequenos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Gemma subyacente, que podrian imponer restricciones adicionales si efectivamente deriva de el.
- El repositorio no registra descargas ni validacion de la comunidad; tratar como modelo no auditado.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en pipelines automatizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/citavyn-gemma4-2b-GGUF
- Modelo base: https://huggingface.co/citavyn/citavyn-gemma4-2b
- Pagina de descargas del autor: https://hf.tst.eu/model#citavyn-gemma4-2b-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
