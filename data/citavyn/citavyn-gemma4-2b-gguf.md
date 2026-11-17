# citavyn/citavyn-gemma4-2b-GGUF

## Resumen

citavyn-gemma4-2b-GGUF es un derivado especializado del modelo `google/gemma-4-E2B-it` de Google, publicado por el usuario citavyn en Hugging Face. Se trata de un ajuste fino mediante Supervised Fine-Tuning (SFT) orientado a flujos de trabajo empresariales de generacion aumentada por recuperacion (RAG) y gobernanza de IA y datos. El artefacto distribuido es una cuantizacion `Q4_K_M` en formato GGUF, pensada para inferencia local con Ollama y llama.cpp.

El modelo aborda un problema concreto: la atribucion fiable de afirmaciones a documentos recuperados en entornos regulados. Para ello incorpora citacion en linea estricta con marcadores `[Doc X]`, abstencion cuando la evidencia recuperada es insuficiente y cobertura de dominios regulatorios como el Reglamento Europeo de IA (EU AI Act), el marco NIST AI RMF 1.0, el RGPD y la norma ISO/IEC 42001:2023. Ademas, incluye mecanismos de enmascaramiento de datos personales sensibles y bloqueo de intentos de inyeccion de prompts.

El repositorio declara 4.647.450.147 parametros reales en safetensors, si bien la nomenclatura comercial del nombre ("2b") y del modelo base (E2B) sugiere una arquitectura con parametros totales y activos diferenciados, dato que no se detalla en la informacion disponible. La licencia es Apache 2.0, lo que facilita su adopcion comercial, y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de google/gemma-4-E2B-it; arquitectura del base no detallada) |
| Parametros totales | 4.647.450.147 (safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion Q4_K_M); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `google/gemma-4-E2B-it` (tipo de transformer, uso de mezcla de expertos, atencion lineal u otras innovaciones). El proceso de adaptacion documentado consiste en un ajuste fino supervisado (SFT) sobre el modelo instruct de Gemma 4 E2B, orientado a tareas de RAG empresarial y gobernanza de IA y datos. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas adicionales como RLHF o DPO.

Las capacidades destacadas por el autor sugieren un entrenamiento centrado en el seguimiento de instrucciones con documentos delimitados por XML (`<documents>`), la atribucion de afirmaciones a fragmentos concretos mediante citas `[Doc X]`, la ignorancia de documentos distractores de alta similitud y la abstención ante evidencia insuficiente. Tambien se indica alineacion sobre marcos regulatorios especificos (EU AI Act, NIST AI RMF 1.0, RGPD, ISO/IEC 42001:2023) y control de acceso basado en roles (RBAC), aunque no se aportan detalles sobre el volumen o la procedencia de los datos de ajuste.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de conversaciones multi-turno.
- Citacion en linea estricta: atribuye afirmaciones factuales exclusivamente a fragmentos de documentos delimitados por XML, con marcadores del tipo `[Doc X]`.
- Resistencia a distractores: ignora documentos recuperados de alta similitud que no aportan evidencia relevante.
- Abstencion acotada al contexto: rechaza extrapolar desde la memoria de preentrenamiento cuando los documentos recuperados no contienen evidencia suficiente.
- Cobertura de dominios regulatorios: EU AI Act (Anexo III, Articulo 5, Articulo 27 FRIA), NIST AI RMF 1.0 (GOVERN, MAP, MEASURE, MANAGE), RGPD (Articulos 5 y 17), ISO/IEC 42001:2023 y aislamiento RBAC/Blueprint empresarial.
- Aplicacion de DLP y seguridad: enmascara PII de nivel 4 con marcadores como `[REDACTED_SSN_1]` y `[REDACTED_PAN_1]`, y bloquea intentos de inyeccion de prompts o de elusion de control de acceso.
- No se documentan capacidades de codigo, matematicas, vision, audio, tool calling ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Asistentes de cumplimiento normativo: el modelo puede responder consultas sobre el EU AI Act, NIST AI RMF o RGPD citando los articulos o secciones concretas de los documentos internos recuperados, lo que facilita la trazabilidad exigida en auditorias.
- Revision documental con trazabilidad: en revisiones de politicas o contratos, cada afirmacion generada queda vinculada a un fragmento `[Doc X]`, permitiendo que un revisor humano verifique la fuente de forma directa.
- Sistemas RAG empresariales con requisitos de abstención: cuando la recuperacion no devuelve evidencia suficiente, el modelo declina responder en lugar de inventar, lo que reduce el riesgo de alucinacion en entornos regulados.
- Enmascaramiento de datos personales en pipelines de tratamiento: el modelo aplica marcadores de redaccion sobre identificadores sensibles (SSN, PAN) antes de que el texto se procese o almacene, apoyando el cumplimiento del RGPD.
- Defensa frente a inyeccion de prompts: en asistentes expuestos a usuarios finales, el modelo bloquea intentos de elusion de control de acceso, adecuado para despliegues con aislamiento RBAC entre tenants o unidades de negocio.
- Despliegue local y air-gapped: al distribuirse como GGUF Q4_K_M para Ollama y llama.cpp, puede ejecutarse en estaciones de trabajo sin conexion, util en entornos con datos que no pueden salir de la infraestructura corporativa.
- Formacion interna y soporte a equipos de gobernanza: responde preguntas sobre marcos regulatorios citando la documentacion corporativa cargada, sirviendo como herramienta de consulta para equipos legales y de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M y un peso de repositorio de 4,4 GB, la inferencia requiere aproximadamente 5-7 GB de memoria, incluyendo overhead de contexto y runtime (estimacion, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano del artefacto, cabe en GPU de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090. Para despliegues con contexto largo o mayor concurrencia, se recomiendan A100 o H100.
- Cabe en GPU de consumo: si, en modelos con al menos 8 GB de VRAM en la configuracion Q4_K_M.
- Opciones de despliegue: Ollama y llama.cpp son los entornos indicados por el autor; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia gestionados. No se confirma soporte de vLLM ni TGI para este artefacto GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| citavyn-gemma4-2b-GGUF | 4.647.450.147 (safetensors) | no disponible | en | Apache 2.0 | GGUF Q4_K_M | Ajuste SFT para RAG y gobernanza de IA |
| google/gemma-4-E2B-it | no disponible | no disponible | no disponible | no disponible | safetensors | Modelo base instruct de Google |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: aunque el ajuste promueve la abstencion y la citacion, no se han publicado evaluaciones cuantitativas que midan la tasa de alucinacion ni la fidelidad de las citas.
- Sesgos: no se documenta ninguna evaluacion de sesgos del modelo base ni del ajuste fino.
- Especializacion estrecha: el ajuste esta orientado a RAG y gobernanza; su rendimiento en tareas generales (codigo, matematicas, creatividad) puede degradarse respecto al modelo base.
- Contexto: la longitud de contexto no esta disponible, lo que impide planificar despliegues con documentos extensos sin validacion previa.
- Cuantizacion: solo se distribuye Q4_K_M; la perdida de calidad frente al modelo base en precision completa no esta cuantificada.
- Licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de copyright y licencia originales de Gemma 4 E2B de Google.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni validacion independiente.
- Dependencia de la recuperacion: la calidad de las respuestas depende criticamente de los documentos recuperados y del formato XML esperado; un pipeline RAG mal configurado puede degradar la citacion y la abstencion.

## Enlaces

- Hugging Face: https://huggingface.co/citavyn/citavyn-gemma4-2b-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
