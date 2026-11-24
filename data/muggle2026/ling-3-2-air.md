# Muggle2026/Ling-3.2-air

## Resumen

Ling-3.2-air es un modelo de lenguaje multimodal de pesos abiertos desarrollado por inclusionAI (equipo vinculado al ecosistema Ant Group/Alipay, segun los enlaces de la model card). Se distribuye en Hugging Face bajo el repositorio `Muggle2026/Ling-3.2-air`, que replica la model card oficial de inclusionAI. El modelo emplea una arquitectura MoE hibrida con atencion lineal (35 capas KDA mas 7 capas Gated MLA en proporcion 5:1), con 124B parametros totales y solo 5.5B activos por token, lo que lo situa en la categoria de modelos de gran capacidad pero coste de inferencia contenido.

Su propuesta de valor se centra en la automatizacion de flujos de trabajo y el razonamiento sobre documentos profesionales: la model card reporta mejoras sustanciales frente a Ling-3.0-flash-VL en AutomationBench-AA (de 15.7% a 61%), GDP.pdf all-pass (de 8.4% a 16%), AA-Briefcase v1.1 (Elo de 987 a 1340) y Terminal-Bench 4.0 (de 0% a 27%). Ademas, obtiene 23 puntos en el Artificial Analysis Intelligence Index v5.0.1.

El modelo soporta entrada de imagen y video, modo de razonamiento explicito (`enable_thinking`), tool calling y decodificacion especulativa MTP (NEXTN). Su licencia MIT y su contexto de hasta 256K tokens lo hacen atractivo para despliegues en produccion, aunque su tamano (129.3 GB en safetensors, pesos en fp8) exige hardware de clase servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (35 capas KDA + 7 capas Gated MLA, ratio 5:1) |
| Parametros totales | 124B (127.920.654.544 segun safetensors) |
| Parametros activos | 5.5B |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Pesos publicados en fp8; no se detallan otras variantes oficiales |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, `bailing_moe_v3_vl`) |

Otros datos de arquitectura: 2 capas densas, 512 expertos enrutados, 1 experto compartido, 8 expertos activados, 32 cabezas de atencion, hidden size 2560, tamano intermedio de experto 768, tamano intermedio denso 6144, vocabulario de 157.184 tokens.

## Arquitectura y entrenamiento

Ling-3.2-air es un transformer MoE hibrido que combina capas de atencion lineal KDA (Kimi Delta Attention, segun la nomenclatura habitual en este tipo de arquitecturas) con capas de atencion Gated MLA en una proporcion 5:1. Esta mezcla busca reducir el coste computacional y de memoria de la atencion en contextos largos manteniendo la calidad de recuperacion de informacion de la atencion completa. El modelo comparte la arquitectura multimodal nativa de Ling-3.0-flash-VL, por lo que integra procesamiento de imagen y video en el mismo backbone que el texto.

El MoE cuenta con 512 expertos enrutados y uno compartido, activando 8 por token, lo que resulta en 5.5B parametros activos sobre 124B totales. Segun la model card, el modelo incorpora decodificacion especulativa MTP (Multi-Token Prediction, variante NEXTN) soportada de forma nativa en SGLang y vLLM, con 3 tokens especulativos recomendados en la configuracion de vLLM. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito activable mediante `enable_thinking`.
- Comprension de imagenes: la API acepta entradas `image_url` en el mismo formato de mensajes que texto.
- Comprension de video: soporta entradas `video_url` en el mismo esquema de mensajes.
- Tool calling / function calling: parsers dedicados `ling3` en SGLang y vLLM, con `--enable-auto-tool-choice`.
- Razonamiento multi-paso y automatizacion de flujos de trabajo, segun los resultados reportados en AutomationBench-AA.
- Razonamiento sobre documentos profesionales (PDF, analisis cuantitativo, trabajo legal) segun las evaluaciones GDP.pdf y Harvey LAB-AA.
- Ejecucion de tareas en terminal (Terminal-Bench 4.0), lo que sugiere capacidad para agentes de linea de comandos.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de flujos de trabajo administrativos: el modelo puede orquestar secuencias de acciones con tool calling y razonamiento multi-paso, respaldado por su 61% en AutomationBench-AA, adecuado para pipelines de back-office donde antes se requeria intervencion manual.
- Analisis de documentos financieros y PDF extensos: con 256K tokens de contexto y un 16% de all-pass en GDP.pdf, puede procesar informes anuales completos, extraer cifras y responder preguntas con trazabilidad sobre el documento.
- Asistencia legal y revision de contratos: el 87.7% de criterios superados en Harvey LAB-AA v1.1 lo hace util para revision asistida de clausulas, aunque el 0.8% de all-pass tras el control de alucinaciones exige supervision humana obligatoria.
- Agentes de terminal y DevOps: el 27% en Terminal-Bench 4.0 permite integrarlo en asistentes que ejecutan comandos, diagnostican errores y aplican parches en entornos controlados.
- Analisis multimodal de imagenes y video: inspeccion de capturas de pantalla, diagramas o grabaciones para generar descripciones, extraer texto o validar estados de interfaz en pruebas automatizadas.
- Generacion de codigo asistida en produccion: con tool calling y parsers nativos en vLLM/SGLang, puede integrarse en pipelines de CI/CD para revisiones, generacion de tests o correccion de errores con acceso a herramientas externas.
- Despliegue en contextos con requisitos de licencia permisiva: la licencia MIT permite uso comercial sin restricciones de atribucion mas alla de la propia licencia, adecuado para productos propietarios.

## Benchmarks y rendimiento

| Benchmark | Ling-3.2-air | Ling-3.0-flash-VL (referencia) |
|---|---|---|
| AutomationBench-AA | 61% | 15.7% |
| GDP.pdf (all-pass) | 16% | 8.4% |
| AA-Briefcase v1.1 (Elo) | 1340 | 987 |
| Terminal-Bench 4.0 | 27% | 0% |
| Artificial Analysis Intelligence Index v5.0.1 | 23 | no disponible |
| Harvey LAB-AA v1.1 (criterios superados) | 87.7% | no disponible |
| Harvey LAB-AA v1.1 (all-pass) | 8.3% (0.8% tras control de alucinaciones) | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar de conocimiento general.

## Requisitos de hardware

- VRAM estimada: los pesos en fp8 ocupan aproximadamente 129 GB, por lo que la inferencia requiere al menos 4 GPU de 80 GB o 4 GPU de 141 GB en clase H20-3e/H200, segun la receta oficial.
- GPU recomendadas: 4x H20-3e o H200 (141 GB) con `--tp 4`; 4x B300/GB300 (Blackwell) con `--tp 4`; en tarjetas de 80 GB (H100/H800) se recomienda escalar a `--tp 8`.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB sin cuantizacion adicional no documentada.
- Opciones de despliegue: SGLang (imagen `lmsysorg/sglang:dev-Ling-3.0-flash-VL`, recomendada) y vLLM (fork `inclusionAI/vllm-ling-v3`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP (NEXTN, 3 tokens especulativos) y las optimizaciones de decodificacion para Hopper estan pensadas para mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ling-3.2-air | 124B / 5.5B | 256K | MIT | Multimodal nativo, MoE hibrido KDA+MLA |
| Ling-3.0-flash-VL | no disponible | no disponible | no disponible | Predecesor directo; peor en AutomationBench y Terminal-Bench |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

La unica comparacion con datos concretos es contra Ling-3.0-flash-VL, su predecesor. No se dispone de informacion sobre modelos de otros fabricantes con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Riesgo de alucinacion documentado: en Harvey LAB-AA v1.1 el all-pass cae del 8.3% al 0.8% tras el control de alucinaciones, lo que indica que el modelo genera material no verificado con frecuencia en tareas legales.
- El rendimiento en tareas de terminal es bajo en terminos absolutos (27% en Terminal-Bench 4.0), por lo que no es fiable como agente autonomo sin supervision.
- El 16% de all-pass en GDP.pdf implica que la mayoria de las tareas de documentos financieros no se completan correctamente de extremo a extremo.
- No se detallan los idiomas soportados; no hay garantia de calidad fuera del ingles y el chino sin evaluacion explicita.
- El repositorio de Hugging Face (`Muggle2026/Ling-3.2-air`) no es el oficial de inclusionAI; conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Requiere `--trust-remote-code` y codigo personalizado (`bailing_moe_v3_vl`), lo que implica ejecutar codigo del autor del modelo.
- El despliegue exige forks especificos de vLLM (`inclusionAI/vllm-ling-v3`) o imagenes concretas de SGLang, lo que limita la portabilidad y complica las actualizaciones.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre los pesos derivados.

## Enlaces

- Hugging Face: https://huggingface.co/Muggle2026/Ling-3.2-air
- Model card oficial en Hugging Face (inclusionAI): https://huggingface.co/inclusionAI
- ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.2-air
- Modelo predecesor: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Fork de vLLM: https://github.com/inclusionAI/vllm-ling-v3
- Imagen SGLang: `lmsysorg/sglang:dev-Ling-3.0-flash-VL` (Docker Hub)
