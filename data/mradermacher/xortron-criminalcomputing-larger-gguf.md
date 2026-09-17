# mradermacher/XORTRON.CriminalComputing.larger-GGUF

## Resumen

XORTRON.CriminalComputing.larger-GGUF es un repositorio de cuantizaciones estaticas en formato GGUF generado por mradermacher a partir del modelo gdorane01/XORTRON.CriminalComputing.larger. El autor del repositorio es un cuantizador habitual dentro del ecosistema llama.cpp, no el desarrollador del modelo original: su aportacion consiste en convertir los pesos originales (probablemente en safetensors) a GGUF y publicar varias versiones con distinto nivel de compresion.

El modelo subyacente tiene 122.610.069.504 parametros (unos 122,6 mil millones), lo que lo situa en la gama alta de modelos autoalojables. El repositorio ocupa 114,8 GB e incluye las cuantizaciones x-f16, Q8_0, Q6_K, Q5_K_S, Q5_K_M, Q4_K_S, Q4_K_M, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S y Q2_K. Los metadatos de conversion (quantize_version 2, output_tensor_quantised 1, convert_type hf) indican una conversion desde pesos en formato HuggingFace mediante el flujo habitual de llama.cpp.

La relevancia de esta ficha es limitada pero practica: el modelo base no publica informacion sobre arquitectura, contexto, licencia o datos de entrenamiento, y la busqueda web no ha devuelto ninguna fuente independiente. Por tanto, esta ficha documenta lo verificable (parametros, cuantizaciones, formato y requisitos estimados de hardware) y marca explicitamente como "no disponible" todo lo demas. Se recomienda revisar la model card del modelo base antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 122.610.069.504 (~122,6 mil millones) |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |
| Modelo base | gdorane01/XORTRON.CriminalComputing.larger |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 114,8 GB |
| Etiquetas declaradas | gguf, endpoints_compatible, conversational, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-09-17 |
| Ultima actualizacion (segun HuggingFace) | 2026-09-17 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base en los datos disponibles. El unico dato tecnico verificable procede de los metadatos de la cuantizacion: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que los pesos originales estaban en formato HuggingFace (previsiblemente safetensors) y se convirtieron a GGUF con las herramientas de llama.cpp. No hay datos sobre si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida o un modelo multimodal.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica senal funcional es la etiqueta `conversational`, que sugiere que el modelo base fue ajustado para dialogos de tipo chat, y la etiqueta `endpoints_compatible`, que indica compatibilidad con los endpoints de inferencia de HuggingFace. Ninguna de las dos permite inferir detalles de arquitectura o de calidad.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta orientado a dialogos de chat multi-turno, aunque no se documenta el formato de plantilla concreto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse a traves de los endpoints de inferencia de HuggingFace.
- Ejecucion local mediante llama.cpp: al distribuirse en GGUF, puede ejecutarse con las herramientas del ecosistema llama.cpp (llama-cli, llama-server, Ollama, LM Studio, entre otras).
- Razonamiento, generacion de codigo, matematicas, vision, audio y modo de pensamiento explicito: no disponible, no hay documentacion que lo confirme ni que lo descarte.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode, decodificacion especulativa): no disponible.

## Casos de uso

Los siguientes casos son escenarios plausibles para un modelo conversacional autoalojado de ~122,6 mil millones de parametros en formato GGUF. No se han podido verificar contra documentacion del modelo, por lo que deben validarse antes de llevarlos a produccion.

- Asistente conversacional en infraestructura propia: el modelo puede servirse con llama-server o llama.cpp sobre GPU o CPU y expuesto mediante una API compatible con OpenAI, lo que permite integraciones internas sin enviar datos a terceros. Es adecuado cuando la politica de la organizacion exige que el texto no salga de la red corporativa.
- Procesamiento de documentos sensibles con RAG: al poder ejecutarse en local, puede combinarse con una base vectorial para responder preguntas sobre contratos, historiales clinicos o documentacion interna que no puede enviarse a servicios en la nube. La calidad dependera del contexto efectivo del modelo, que no esta documentado.
- Sustitucion de API de pago en cargas por lotes: para tareas de resumen, clasificacion o reescritura de grandes volumenes de texto, desplegar una cuantizacion Q4_K_M o Q5_K_M en hardware propio puede reducir el coste por token frente a APIs comerciales, siempre que el throughput aceptable se valide con mediciones propias.
- Base para ajuste fino con LoRA o QLoRA: los pesos originales en formato HuggingFace del repositorio base permiten aplicar tecnicas de ajuste eficiente en parametros para adaptar el modelo a un dominio concreto, y despues volver a cuantizar a GGUF con llama.cpp.
- Banco de pruebas de cuantizacion: el repositorio ofrece doce niveles de cuantizacion del mismo modelo, lo que resulta util para medir la degradacion de calidad entre Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0 sobre un conjunto de evaluacion propio y elegir el punto de equilibrio entre memoria y precision.
- Entorno de experimentacion sin conexion: en laboratorios o entornos aislados, una cuantizacion Q2_K o Q3_K_S permitiria desplegar 122,6 mil millones de parametros en hardware mas modesto para prototipado, asumiendo una perdida de calidad notable.
- Evaluacion comparativa interna: puede emplearse como referencia de la gama de ~120 mil millones de parametros frente a modelos propios de menor tamano, siempre que se documenten las condiciones de evaluacion y se asuma que la ausencia de benchmarks publicos impide comparaciones objetivas con terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el repositorio GGUF ni la model card del modelo base incluyen valores de MMLU, HumanEval, GSM8K, MT-Bench, Arena-Hard ni de ninguna otra evaluacion. Tampoco se han encontrado articulos, informes tecnicos ni evaluaciones independientes en la busqueda web realizada. No se deben inferir capacidades a partir del numero de parametros.

## Requisitos de hardware

Los valores de VRAM que siguen son estimaciones calculadas a partir de los 122.610.069.504 parametros y de los bits por peso tipicos de cada tipo de cuantizacion en llama.cpp (aproximadamente 2,6 bpw para Q2_K; 3,9 bpw para Q3_K_M; 4,85 bpw para Q4_K_M; 5,7 bpw para Q5_K_M; 6,56 bpw para Q6_K; 8,5 bpw para Q8_0; 16 bpw para F16). No incluyen la cache KV, cuyo tamano depende de la longitud de contexto, que no esta documentada.

| Cuantizacion | VRAM estimada para pesos | Hardware orientativo |
|---|---|---|
| Q2_K | ~40 GB | 1x A100 80 GB, 1x L40S 48 GB (ajustado), 2x RTX 4090 24 GB |
| Q3_K_S | ~54 GB | 2x RTX 4090 24 GB (48 GB, ajustado), 1x A100 80 GB |
| Q3_K_M | ~60 GB | 1x A100 80 GB, 1x H100 80 GB |
| Q3_K_L | ~64 GB | 1x A100 80 GB, 1x H100 80 GB |
| IQ4_XS | ~65 GB | 1x A100 80 GB, 1x H100 80 GB |
| Q4_K_S | ~70 GB | 1x A100 80 GB, 1x H100 80 GB |
| Q4_K_M | ~74 GB | 1x H100 80 GB (ajustado), 2x A100 40 GB, 4x RTX 4090 24 GB |
| Q5_K_S | ~84 GB | 2x A100 40 GB, 2x L40S 48 GB |
| Q5_K_M | ~87 GB | 2x A100 40 GB, 2x L40S 48 GB |
| Q6_K | ~101 GB | 2x A100 80 GB, 2x H100 80 GB |
| Q8_0 | ~130 GB | 2x H100 80 GB, 2x A100 80 GB |
| F16 | ~245 GB | 4x H100 80 GB o superior |

- GPU consumer: ninguna cuantizacion cabe en una sola RTX 4090, RTX 3090 o similar de 24 GB. Las opciones Q2_K y Q3_K_S podrian repartirse entre 2 y 3 GPU consumer mediante offload por capas en llama.cpp, con penalizacion de velocidad por el trafico PCIe.
- Memoria de sistema: la ejecucion en CPU con llama.cpp exige RAM proporcional al tamano de la cuantizacion. Q2_K requiere al menos 48 GB de RAM libre y F16 alrededor de 256 GB, con recomendacion de usar memoria de doble canal o superior para evitar cuellos de botella.
- Despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, llama-cpp-python, text-generation-webui y KoboldCpp son compatibles con GGUF. Los endpoints de HuggingFace tambien son compatibles segun la etiqueta del repositorio. vLLM no ofrece soporte completo de GGUF, por lo que para ese motor habria que partir de los pesos originales en safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia de primera token para ninguna cuantizacion.

## Comparativa con modelos similares

No se dispone de datos verificados del modelo evaluado (arquitectura, contexto, licencia, rendimiento), por lo que la comparacion es necesariamente parcial. La tabla recoge el modelo de esta ficha y referencias de la misma franja de parametros; los datos de terceros provienen de informacion publica de sus fabricantes y no se han verificado en esta busqueda.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| XORTRON.CriminalComputing.larger (GGUF) | 122,6 mil millones | no disponible | no disponible | no disponible | GGUF |
| XORTRON.CriminalComputing.larger (base) | 122,6 mil millones | no disponible | no disponible | no disponible | safetensors (formato HuggingFace) |
| Mistral Large 2 | 123 mil millones | denso | 128k (segun fabricante) | Mistral Research License | safetensors / API |
| gpt-oss-120b | 117 mil millones | 5,1 mil millones (MoE) | 128k (segun fabricante) | Apache 2.0 | safetensors / GGUF (segun fabricante) |

Rendimiento comparado: no disponible. No existen benchmarks publicados del modelo evaluado, de modo que cualquier afirmacion sobre su calidad relativa frente a las alternativas carece de base.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio y los metadatos no indican licencia. Sin ella, no puede asumirse permiso para uso comercial ni para redistribucion. Es imprescindible consultar la model card del repositorio base gdorane01/XORTRON.CriminalComputing.larger antes de cualquier despliegue.
- Ausencia total de documentacion tecnica: no hay datos de arquitectura, contexto, dataset, idiomas ni proceso de alineacion. Esto impide evaluar sesgos, cobertura linguistica y comportamiento en dominios regulados.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones, no hay evidencia sobre la tasa de alucinacion. En tareas factuales, asistencia juridica, medica o financiera, debe tratarse como no validado.
- Sesgos desconocidos: al no documentarse la composicion del corpus de entrenamiento, no puede estimarse el sesgo de genero, raza, idioma o ideologia. Se recomienda auditar con conjuntos propios.
- Degradacion por cuantizacion agresiva: las variantes Q2_K y Q3_K_S de un modelo de este tamano suelen introducir perdida de calidad apreciable en razonamiento y coherencia a contextos largos. Para uso en produccion se recomienda Q4_K_M o superior y validar con un conjunto de evaluacion propio.
- Nombre del repositorio: la denominacion "CriminalComputing" no aporta informacion verificable sobre el dominio de entrenamiento ni sobre las politicas de contenido del modelo base. Debe revisarse el repositorio de origen antes de exponerlo a usuarios finales.
- Falta de validacion comunitaria: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y no se ha encontrado ninguna referencia externa, lo que refuerza la necesidad de validacion previa.
- Fechas inusuales: los metadatos indican creacion y actualizacion el 2026-09-17. Conviene contrastar la integridad y vigencia del repositorio antes de integrarlo en un pipeline.
- Idiomas no especificados: no puede garantizarse un rendimiento correcto en castellano ni en otros idiomas distintos del ingles, que suele dominar en modelos sin documentacion linguistica.
- Contexto desconocido: al no documentarse la longitud de contexto, no deben disenarse aplicaciones que dependan de ventanas largas sin verificar experimentalmente el comportamiento del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/XORTRON.CriminalComputing.larger-GGUF
- Modelo base: https://huggingface.co/gdorane01/XORTRON.CriminalComputing.larger
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Herramientas de conversion y ejecucion GGUF (llama.cpp): https://github.com/ggml-org/llama.cpp
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.
