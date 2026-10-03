# mradermacher/Kronumos-Kairos-v2-GGUF

## Resumen

Kronumos-Kairos-v2-GGUF es la version cuantizada en formato GGUF de Kronumos-Kairos-v2, un modelo de lenguaje de aproximadamente 7.600 millones de parametros desarrollado por Kronumos / NadevA23 y publicado originalmente en HuggingFace bajo licencia Apache 2.0. La cuantizacion la firma mradermacher, autor habitual de conversiones GGUF para llama.cpp, que en este repositorio distribuye hasta doce variantes de cuantizacion estatica (desde Q2_K de 3,1 GB hasta f16 de 15,3 GB).

El modelo esta orientado a un nicho muy concreto: generacion de codigo y reparacion automatica de programas dentro de flujos de agentes autonomos. Los metadatos del repositorio lo vinculan al dataset princeton-nlp/SWE-bench_Verified, al framework Unsloth para el entrenamiento y a una arquitectura base de tipo Qwen2, lo que situa el modelo en la familia de los LLM de ~7B especializados en tareas de ingenieria de software, no en asistentes conversacionales generalistas.

Su relevancia practica viene del formato: al estar disponible en GGUF con cuantizaciones que van de 3 a 8 GB, se puede ejecutar en GPU de consumo e incluso en CPU, algo imposible con el checkpoint original en safetensors. El contexto declarado por fuentes de terceros es de 32.000 tokens y el modelo esta entrenado unicamente en ingles, lo que limita su uso directo en castellano sin adaptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (segun tag qwen2 del repositorio); detalles completos no disponibles |
| Parametros totales | 7.615.616.512 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 32.000 tokens (segun LLM Explorer; no confirmado en la model card del repositorio GGUF) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |
| Tamano del repositorio | 68,1 GB |
| Descargas / likes | 195 descargas, 1 like en el momento de la consulta |
| Fecha de creacion | 2026-10-03 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla del tag qwen2 incluido en el repositorio, que apunta a un transformer decoder-only con atencion causal y normalizacion RMSNorm, la familia sobre la que se construyen habitualmente los modelos de ~7B actuales. El pipeline declarado en HuggingFace es reinforcement-learning, y entre las etiquetas figuran unsloth (framework de entrenamiento optimizado), swe-bench (dataset de referencia) y autonomous-agents. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de SFT, RLHF o DPO.

El dato mas concreto disponible sobre el entrenamiento es el uso del dataset princeton-nlp/SWE-bench_Verified, que contiene incidencias reales de repositorios de Python con sus pruebas asociadas, lo que sugiere un ajuste orientado a resolucion de bugs y reparacion automatica de programas. Las etiquetas rust-subcortex y dual-brain aparecen en el repositorio pero no van acompanadas de ninguna explicacion tecnica en la model card, por lo que no es posible determinar si describen componentes arquitectonicos reales, una organizacion en dos modulos (uno de generacion y otro de verificacion) o simple nomenclatura de marketing. No se documentan innovaciones como decodificacion especulativa, atencion lineal ni mecanicas hibridas SSM.

## Capacidades

- Generacion de codigo en el contexto de tareas de reparacion y parcheo de programas.
- Reparacion automatica de programas (automated program repair): el modelo esta ajustado para recibir codigo defectuoso y producir correcciones, presumiblemente evaluadas contra el banco de pruebas de SWE-bench.
- Comportamiento como agente autonomo: las etiquetas autonomous-agents y swe-bench indican uso previsto en bucles multi-paso de tipo resolver tarea, ejecutar tests, corregir.
- Razonamiento multi-paso aplicado a ingenieria de software, aunque no se documenta un modo de pensamiento explicito (thinking mode).
- Conversacion basica: el repositorio GGUF esta marcado como conversational.
- Idiomas: unicamente ingles declarado. No hay evidencia de capacidades multilingues ni de soporte de castellano.
- Tool calling / function calling: no disponible en la informacion proporcionada; no se confirma soporte explicito de llamadas a herramientas ni de formato de funciones.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Reparacion automatica de bugs en integracion continua: el modelo puede integrarse en un pipeline que reciba el fallo de los tests, genere un parche candidato y lo someta de nuevo a la suite de pruebas, aprovechando su ajuste sobre SWE-bench Verified para producir diffs plausibles.
- Agente de mantenimiento de repositorios: ejecutado en local sobre una GPU de 12 GB con cuantizacion Q4_K_M, puede revisar issues etiquetadas como bug y proponer parches que un humano valide antes del merge.
- Asistente de codigo autoalojado: empresas con requisitos de confidencialidad pueden desplegarlo con llama.cpp u Ollama sin enviar codigo propietario a APIs externas, ya que la licencia Apache 2.0 permite uso comercial.
- Generacion de tests unitarios: dado un modulo sin cobertura, el modelo puede producir casos de prueba en Python (u otros lenguajes soportados por el modelo base) para elevar la cobertura antes de refactorizaciones.
- Migracion y refactorizacion de codigo legacy: con 32.000 tokens de contexto declarados, puede procesar ficheros completos o varios modulos relacionados y proponer transformaciones coherentes con el resto del proyecto.
- Analisis de errores en produccion: conectado a un sistema de trazas, puede leer el stack trace y el codigo implicado para generar una hipotesis de causa raiz y un parche preliminar que el equipo de guardia revise.
- Entorno de investigacion en reparacion de programas: al estar cuantizado y ser ejecutable en hardware modesto, sirve como linea base reproducible para experimentos academicos de APR sin depender de claves de API ni de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio GGUF y la model card del modelo base no incluyen tablas de MMLU, HumanEval, GSM8K ni resultados sobre SWE-bench Verified, pese a que este ultimo se cita como dataset de entrenamiento. La unica cifra externa disponible es la de LLM Explorer, que reporta un consumo de VRAM de 15,2 GB (coherente con pesos en f16) y un contexto de 32K, sin acompanarla de puntuaciones de evaluacion.

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir del tamano de fichero declarado en el repositorio, anadiendo entre 1 y 2 GB de margen para la cache KV con contexto largo.

| Cuantizacion | Tamano del fichero | VRAM estimada | GPU de ejemplo |
|---|---:|---:|---|
| Q2_K | 3,1 GB | ~4 GB | GTX 1650 4 GB, iGPU con memoria compartida |
| Q3_K_M | 3,9 GB | ~5 GB | RTX 3050 6 GB |
| IQ4_XS | 4,4 GB | ~6 GB | RTX 2060 6 GB |
| Q4_K_M | 4,8 GB | ~6,5 GB | RTX 3060 8 GB, RTX 4060 |
| Q5_K_M | 5,5 GB | ~7,5 GB | RTX 3060 12 GB |
| Q6_K | 6,4 GB | ~8,5 GB | RTX 3060 12 GB, RTX 4070 |
| Q8_0 | 8,2 GB | ~10,5 GB | RTX 3080 12 GB, RTX 4070 Ti |
| f16 | 15,3 GB | ~18 GB | RTX 4090 24 GB, A100 40 GB, H100 |

- Si cabe en GPU de consumo: si. Cualquier tarjeta con 8 GB o mas puede ejecutar las cuantizaciones Q4_K_S y Q4_K_M, marcadas por el autor como "fast, recommended".
- CPU: al ser GGUF, es viable la inferencia mixta CPU+GPU o completamente en CPU con llama.cpp, a costa de una latencia mucho mayor.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama (importando el GGUF), LM Studio y otros frontends compatibles con GGUF. vLLM y TGI no estan confirmados para este repositorio; vLLM ofrece soporte GGUF limitado y no es la via recomendada por el autor.
- Imatrix: el autor indica que no ha publicado cuantizaciones ponderadas con importance matrix para este modelo, solo cuantizaciones estaticas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kronumos-Kairos-v2-GGUF (este) | ~7,6B | 32K (segun terceros) | Apache 2.0 | GGUF (12 cuantizaciones) | HuggingFace, 195 descargas |
| Kronumos/Kronumos-Kairos-v2 (base) | ~7,6B | no disponible | Apache 2.0 | safetensors | HuggingFace |
| mradermacher/Kronumos-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | HuggingFace |
| mradermacher/Kairos-GGUF | no disponible | no disponible | no disponible | GGUF | HuggingFace |
| kronumos/Kronumos-2-kairos (Ollama) | no disponible | no disponible | Apache 2.0 | GGUF con imatrix | Ollama |

No se dispone de datos de rendimiento comparativos entre estas variantes. Para comparar contra alternativas de proposito general de ~7B especializadas en codigo (por ejemplo, modelos de la propia familia Qwen2.5-Coder) seria necesario disponer de resultados de SWE-bench Verified, HumanEval o MMLU del modelo evaluado, que no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- Idioma: el modelo solo declara ingles. Su uso en castellano no esta soportado ni evaluado, y previsiblemente degradara la calidad de forma significativa.
- Ausencia de benchmarks: no hay resultados publicados de SWE-bench, HumanEval ni MMLU, pese a que el modelo se promociona con la etiqueta swe-bench. No es posible verificar su rendimiento real en reparacion de programas antes de desplegarlo.
- Riesgo de alucinacion: como cualquier LLM de ~7B, puede generar parches sintacticamente validos pero semanticamente incorrectos, o inventar APIs inexistentes. En un pipeline de APR es imprescindible ejecutar la suite de tests antes de aceptar cualquier cambio.
- Etiquetas sin documentar: rust-subcortex y dual-brain no tienen explicacion tecnica en la model card; no deben tomarse como garantia de ninguna capacidad concreta.
- Fecha de publicacion inusual: los metadatos indican fechas de 2026, lo que unido al bajo numero de descargas (195) y likes (1) sugiere un modelo muy reciente y con poca validacion independiente por parte de la comunidad.
- Ambiguedad de autoria: el repositorio atribuye el modelo base a la organizacion Kronumos, mientras que fuentes externas lo atribuyen a NadevA23 y existe una variante adicional (Kronumos-2-kairos) en Ollama. Conviene verificar la procedencia exacta de los pesos antes de usarlos en produccion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero al derivar de un modelo base de ~7,6B la trazabilidad de los datos de entrenamiento es limitada; no se documenta la composicion del corpus.
- Cuantizaciones agresivas: Q2_K y Q3_K degradan la calidad de forma apreciable (el propio autor marca Q3_K_M como "lower quality"); para tareas de codigo donde la precision sintactica importa, no se recomienda bajar de Q4_K_M.
- Contexto no confirmado: los 32K tokens provienen de una fuente de terceros (LLM Explorer) y no aparecen en la model card oficial, por lo que conviene validar el comportamiento real en ventanas largas antes de depender de esa cifra.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kronumos-Kairos-v2-GGUF
- Modelo base: https://huggingface.co/Kronumos/Kronumos-Kairos-v2
- Dataset de referencia: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Verified
- Pagina de resumen del autor de las cuantizaciones: https://hf.tst.eu/model#Kronumos-Kairos-v2-GGUF
- Repositorio relacionado (Kronumos): https://huggingface.co/mradermacher/Kronumos-GGUF/tree/main
- Repositorio relacionado (Kairos): https://huggingface.co/mradermacher/Kairos-GGUF
- Variante en Ollama: https://ollama.com/kronumos/Kronumos-2-kairos
- Pesos alternativos citados: https://huggingface.co/NadevA23/Kronumos-2-Kairos
- Ficha en LLM Explorer: https://llm-explorer.com/model/NadevA23%2FKronumos-Kairos-v2,4Vm5FGiWTLomJhiylDECV2
- Ficha en Free2AITools: https://free2aitools.com/model/mradermacher/kronumos-gguf
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa que financia las cuantizaciones: https://www.nethype.de/
