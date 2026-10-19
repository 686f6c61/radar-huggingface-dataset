# Nekodeus/phi-4-mini-instruct-openvino

## Resumen

`Nekodeus/phi-4-mini-instruct-openvino` es una conversion a formato OpenVINO IR del modelo `microsoft/Phi-4-mini-instruct`, publicada por el usuario Nekodeus. No es un modelo entrenado desde cero, sino un artefacto de despliegue: los pesos originales de Microsoft (3,8B parametros, licencia MIT) se han convertido con `optimum-cli` y se han cuantizado a INT8 en modo weight-only mediante NNCF. El resultado son tres componentes IR (modelo, tokenizer y detokenizer) listos para inferencia en CPU con el runtime de OpenVINO.

El interes practico esta en el binomio tamano/formato: un modelo de 3,8B parametros con 128k tokens de contexto, soporte de function calling y licencia MIT, empaquetado para ejecutarse en CPU sin GPU dedicada. Eso lo situa en el nicho de asistentes locales, procesamiento por lotes en servidores sin acelerador y despliegues en el borde (edge) sobre hardware Intel.

Ahora bien, conviene ser explicito: el repositorio es de caracter comunitario, acumula 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado del repo es de 0,0 GB, lo que resulta incoherente con un modelo INT8 de 3,8B parametros (que deberia rondar los 3,8 GB). Antes de usarlo en produccion hay que verificar que los ficheros de pesos esten efectivamente subidos y que la conversion sea reproducible con las versiones indicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, clase `Phi3ForCausalLM` (tag `phi3`) |
| Parametros totales | 3,8B (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128k tokens (segun model card) |
| Tipos de cuantizacion | Pesos INT8 (weight-only, NNCF); activaciones FP16/FP32 segun trazado |
| Idiomas soportados | 24 idiomas segun la model card de la conversion oficial OpenVINO del modelo base; lista completa no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`): `openvino_model`, `openvino_tokenizer`, `openvino_detokenizer` |
| Libreria | `openvino` (inferencia via `optimum-intel` o `openvino-genai`) |
| Pipeline | `text-generation` |
| Requiere `trust_remote_code` | Si (tag `custom_code`) |
| Herramientas de conversion | `optimum-intel 2.2.0`, `openvino 2026.4.1`, `transformers 5.16.1` |
| Autor / naturaleza | Nekodeus; conversion comunitaria, no oficial |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-18 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base de Microsoft: un transformer decoder-only denso de 3,8B parametros identificado en HuggingFace con la clase `Phi3ForCausalLM`, es decir, reutiliza la implementacion de Phi-3 con las particularidades de Phi-4-mini. La model card de esta conversion no aporta detalles adicionales sobre numero de capas, dimension oculta, cabezas de atencion ni tipo de atencion (MHA/GQA), por lo que esos datos se consideran no disponibles en la informacion proporcionada.

En cuanto al entrenamiento, esta ficha no puede describirlo: el autor de la conversion no documenta el proceso de entrenamiento del modelo base, y no se ha proporcionado informacion sobre volumen de tokens, composicion del dataset ni etapas de alineacion (RLHF/DPO). Lo unico verificable es que `microsoft/Phi-4-mini-instruct` es la version instruction-tuned de la familia Phi-4-mini y que la model card de la conversion afirma mejor razonamiento que Phi-3.5-mini, sin cuantificar.

La innovacion tecnica de este artefacto no esta en el modelo sino en el pipeline de conversion: exportacion a OpenVINO IR con `optimum-cli export openvino --task text-generation --weight-format int8`, compresion de pesos con NNCF y separacion del tokenizer/detokenizer en grafos IR independientes. La conversion se realizo integramente en CPU sobre Kaggle y de forma offline, lo que explica la fijacion de versiones concretas de las herramientas.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia de la familia Phi.
- Razonamiento de varios pasos y resolucion de problemas, con mejora declarada respecto a Phi-3.5-mini (sin cifras en la informacion disponible).
- Generacion de codigo, incluyendo tareas de completado y sintesis a partir de descripciones en lenguaje natural.
- Function calling / tool calling: la model card lo menciona explicitamente como capacidad soportada.
- Ventana de contexto de 128k tokens, adecuada para documentos largos y conversaciones extensas.
- Capacidades multilingues (24 idiomas segun la documentacion del modelo base en OpenVINO).
- Inferencia en CPU sin GPU gracias al backend OpenVINO, con cuantizacion INT8 de pesos.
- Integracion programatica en Python (`OVModelForCausalLM`) y en C++ (`ov::genai::LLMPipeline`).
- No se documentan capacidades de vision, audio ni modos de razonamiento explicito (thinking mode) en la informacion proporcionada.

## Casos de uso

- Asistente local en estaciones de trabajo sin GPU: el modelo se ejecuta sobre CPU Intel con OpenVINO IR INT8, ocupando del orden de 4-5 GB de RAM para los pesos, lo que permite desplegarlo en portatiles y equipos de sobremesa convencionales.
- Procesamiento por lotes de documentacion larga: con 128k tokens de contexto se pueden resumir o extraer entidades de contratos, informes o expedientes completos en una sola pasada, sin troceado agresivo.
- Automatizacion de atencion al cliente en entornos con requisitos de soberania del dato: al ejecutarse en local y bajo licencia MIT, el texto no sale de la infraestructura propia, lo que encaja en sectores regulados.
- Integracion en pipelines de CI/CD para revision de codigo y generacion de tests: el soporte de function calling permite conectarlo a herramientas internas (linters, gestores de incidencias) mediante esquemas JSON.
- Agentes de automatizacion de escritorio o RPA: al ser ligero y ejecutable en CPU, puede convivir con otras cargas en la misma maquina mientras orquesta llamadas a APIs y herramientas.
- Clasificacion y enriquecimiento de tickets en servidores de bajo coste: el formato INT8 reduce el coste por inferencia frente a FP16 y permite mantener el throughput en nodos sin acelerador.
- Prototipado rapido de aplicaciones LLM en entornos Intel (OpenVINO GenAI, OpenVINO Model Server) antes de migrar a un modelo mayor o a un backend GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo convertido en la informacion disponible. El autor no incluye ninguna evaluacion del efecto de la cuantizacion INT8 sobre la calidad.

Como referencia del modelo base (no del artefacto OpenVINO), una fuente externa (OpenModelMap) reporta:

| Benchmark | Modelo | Resultado | Fuente |
|---|---|---|---|
| HumanEval | microsoft/Phi-4-mini-instruct | 78 | OpenModelMap (agregador de terceros) |
| MMLU | microsoft/Phi-4-mini-instruct | no disponible en la informacion proporcionada | - |
| GSM8K | microsoft/Phi-4-mini-instruct | no disponible en la informacion proporcionada | - |

No se dispone de datos de latencia ni de throughput para esta conversion concreta.

## Requisitos de hardware

- VRAM/RAM para pesos: aproximadamente 3,8 GB para los pesos INT8, mas overhead de runtime y buffers de activaciones; en la practica conviene reservar 5-6 GB de RAM libre.
- Memoria para contexto: la cache KV crece de forma lineal con la longitud de secuencia; usar los 128k tokens completos exige mucha mas memoria que la indicada por los pesos y puede dominar el consumo total. No se dispone de cifras exactas en la informacion proporcionada.
- CPU: es el objetivo principal del formato. Cualquier CPU x86-64 con soporte AVX2 es candidata; los procesadores Intel con AMX o VNNI ofrecen mejor rendimiento en INT8.
- GPU: el runtime OpenVINO puede usar el plugin GPU sobre Intel Arc e iGPU integradas. En GPU NVIDIA el soporte es limitado y no es la via recomendada; para NVIDIA conviene el modelo base en safetensors con vLLM o TGI.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060/4060 y superiores) siempre que se limite la longitud de contexto; en GPUs Intel Arc tambien es viable.
- Despliegue: `optimum-intel` (`OVModelForCausalLM`), OpenVINO GenAI (`ov::genai::LLMPipeline`), OpenVINO Model Server. No es compatible directamente con llama.cpp, Ollama o formatos GGUF, ni con vLLM sin conversion adicional.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nekodeus/phi-4-mini-instruct-openvino | 3,8B | 128k | OpenVINO IR INT8 | MIT | Comunitaria; 0 descargas, repo de 0,0 GB |
| microsoft/Phi-4-mini-instruct | 3,8B | 128k | Safetensors (FP16/BF16) | MIT | Oficial de Microsoft, referencia canonica |
| OpenVINO/Phi-4-mini-instruct-int4-ov | 3,8B | 128k | OpenVINO IR INT4 (NNCF, INT4_ASYM, ratio 1.0) | MIT | Oficial del equipo OpenVINO |
| OpenVINO/Phi-4-mini-instruct-fp16-ov | 3,8B | 128k | OpenVINO IR FP16 | MIT | Oficial del equipo OpenVINO, 24 idiomas |

Frente a las alternativas oficiales de OpenVINO, esta conversion ofrece INT8 en lugar de INT4 o FP16: un punto intermedio de calidad y tamano, pero sin el respaldo de validacion del equipo OpenVINO ni historial de descargas que permita estimar su fiabilidad.

## Limitaciones y advertencias

- Artefacto no oficial: se trata de una conversion comunitaria sin proceso de validacion publicado, con 0 descargas y 0 likes, lo que impide inferir calidad por adopcion.
- Incoherencia en el repositorio: el tamano reportado es de 0,0 GB, incompatible con un modelo INT8 de 3,8B parametros. Verificar la integridad de los ficheros antes de cualquier uso.
- Sin evaluacion de la cuantizacion: no hay benchmarks que midan la degradacion de calidad introducida por la compresion INT8 weight-only en esta conversion concreta.
- Dependencia de versiones: la conversion se realizo con `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`; versiones distintas del runtime pueden no cargar el modelo correctamente.
- Requiere `trust_remote_code=True` (tag `custom_code`), lo que implica ejecutar codigo del repositorio; conviene auditar los ficheros antes de cargarlos en entornos sensibles.
- Riesgo de alucinacion: inherente a los modelos de 3,8B parametros, especialmente en tareas de conocimiento factual y razonamiento aritmetico complejo. No se han aportado datos que permitan cuantificarlo.
- Sesgos: no hay informacion sobre evaluaciones de sesgo o toxicidad del modelo base ni de la conversion.
- Contexto largo: aunque se declaran 128k tokens, el rendimiento real en ventanas muy extensas no esta documentado y el coste de memoria de la cache KV es elevado.
- Idiomas: la lista exacta de los 24 idiomas no esta disponible en la informacion proporcionada; el castellano esta presumiblemente cubierto por ser el modelo base multilingue, pero no se confirma.
- Licencia MIT: permisiva para uso comercial, pero la responsabilidad sobre el cumplimiento de las condiciones del modelo base y sobre el comportamiento del artefacto cuantizado recae en el usuario.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Nekodeus/phi-4-mini-instruct-openvino
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Conversion oficial OpenVINO INT4: https://huggingface.co/OpenVINO/Phi-4-mini-instruct-int4-ov
- Conversion oficial OpenVINO FP16: https://huggingface.co/OpenVINO/Phi-4-mini-instruct-fp16-ov
- Espejo en ModelScope de la conversion INT4: https://www.modelscope.cn/models/OpenVINO/Phi-4-mini-instruct-int4-ov
- Ficha de rendimiento en OpenModelMap: https://openmodelmap.com/model/OpenVINO/Phi-4-mini-instruct-ov
- Paper tecnico del modelo base: no disponible en la informacion proporcionada
- Blog o demo oficial de esta conversion: no disponible en la informacion proporcionada
