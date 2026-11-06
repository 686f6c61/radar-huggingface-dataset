# kataguru/Industry-Coder-27B-v3.0-GGUF

## Resumen

Kataguru Industry-Coder-27B v3.0 es un ajuste fino del modelo base Qwen/Qwen3.8-27B, distribuido en formato GGUF por el usuario kataguru. El modelo parte de una arquitectura densa de 27B parametros con atencion hibrida (Gated DeltaNet combinada con atencion softmax completa), capacidad multimodal de vision y Multi-Token Prediction (MTP). El ajuste se orienta a dominios de ingenieria industrial (PLC, CNC, IEC 61131-3, TwinCAT, SCL de Siemens), ciberseguridad y codificacion agentica, con un enfasis declarado en bilinguismo nativo finlandes-ingles.

El autor documenta un pipeline de adaptacion denominado "Triple-Adaptive Multi-Dynamic Pipeline v4.1", que combina ortogonalizacion de residuos SOMA/ARA con QLoRA ortonormal de subespacios divididos en tres fases y una cuarta fase de annealing centrada en razonamiento multi-dinamico, codigo competitivo y tool calling en paralelo. El modelo se publica con licencia Apache 2.0 y un conjunto de cuantizaciones imatrix (IQ4_NL, IQ4_XS, IQ3_S, IQ3_XXS) junto con el proyector multimodal y las cabezas de decodificacion especulativa.

La relevancia actual del modelo reside en su especializacion vertical: frente a ajustes genericos, apunta a casos de uso de automatizacion industrial y agentes de codigo con contexto nativo de 262.144 tokens, manteniendo el soporte de vision y un conjunto de benchmarks declarados por el autor sobre 15 tareas. La ficha se basa exclusivamente en la informacion publicada en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: Gated DeltaNet + atencion softmax completa, con vision multimodal y MTP (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | IQ4_NL (~4,50 bpw), IQ4_XS (~4,25 bpw), IQ3_S (~3,44 bpw), IQ3_XXS (~3,06 bpw); mmproj en f16; MTP en Q8_0 y Q4_K_M |
| Idiomas soportados | Ingles, finlandes, estonio, hungaro, turco |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj y cabezas MTP separadas |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.8-27B: 64 capas, atencion hibrida que combina Gated DeltaNet con atencion softmax completa, un codificador de vision multimodal de 27 capas (proyector mmproj) y cabezas de Multi-Token Prediction para decodificacion especulativa. El contexto nativo es de 262.144 tokens. El autor indica que la arquitectura base, el codificador de vision, el MTP y la ventana de contexto no se modificaron respecto al modelo original.

El ajuste fino se realizo mediante el pipeline propietario "Triple-Adaptive Multi-Dynamic Pipeline v4.1", que el autor describe como una combinacion de ortogonalizacion de residuos SOMA/ARA y QLoRA ortonormal de subespacios divididos (r=16, con indices [0:8] y [8:16] congelados de forma separada) en tres fases, seguidas de una cuarta fase de annealing orientada a razonamiento multi-dinamico, codigo competitivo y tool calling en paralelo. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor declara verificacion Kotus de la flexión y terminologia tecnica finlandesa.

## Capacidades

- Generacion de texto y razonamiento en ingles y finlandes, con soporte adicional declarado para estonio, hungaro y turco.
- Codificacion especializada en ingenieria industrial: PLC, CNC, IEC 61131-3, TwinCAT y SCL de Siemens.
- Codificacion agentica y tool calling, incluido soporte de llamadas en paralelo (evaluado en BFCL V4).
- Capacidad multimodal de vision mediante el proyector mmproj (pipeline image-text-to-text).
- Decodificacion especulativa mediante cabezas MTP separadas.
- Modo de pensamiento multi-dinamico (thinking) segun la fase 4 del pipeline de ajuste.
- Orientacion a ciberseguridad y a codigo competitivo (LeetCode, LiveCodeBench).
- Comportamiento declarado como "uncensored" y "anti-sycophancy" (sin rechazo por defecto y sin adulacion al usuario).
- Contexto largo de 262.144 tokens para conversaciones multi-turno y documentos extensos.

## Casos de uso

- Programacion de automatas industriales: generacion y revision de logica en IEC 61131-3, SCL de Siemens y TwinCAT para proyectos de automatizacion, aprovechando el ajuste especifico en estos lenguajes y su terminologia tecnica.
- Asistencia en mecanizado CNC: interpretacion y generacion de programas de control numerico y parametros de mecanizado a partir de descripciones textuales o imagenes de planos, gracias al soporte de vision.
- Agente de codigo en pipelines de CI/CD: integracion mediante tool calling y llamadas en paralelo para tareas de refactorizacion, generacion de tests y revision automatizada de pull requests.
- Analisis de ciberseguridad: revision de configuraciones, identificacion de patrones de riesgo y generacion de scripts de auditoria en entornos OT/IT, apoyandose en el ajuste orientado a seguridad.
- Documentacion tecnica bilingue finlandes-ingles: redaccion y traduccion de manuales de ingenieria con terminologia compuesta finlandesa verificada, gracias al bilinguismo nativo declarado.
- Atencion al cliente tecnica multi-turno: gestion de conversaciones largas con contexto de hasta 262.144 tokens para soporte de producto industrial o software especializado.
- Razonamiento sobre documentacion extensa: analisis de especificaciones, normativas y manuales largos en una sola ventana de contexto, con capacidad de extraccion y sintesis.

## Benchmarks y rendimiento

Resultados declarados por el autor, ejecutados sobre 2x NVIDIA GeForce RTX 5090 32GB (TP=2, CUDAGraphs activados):

| Benchmark | Metrica | Qwen3.8-27B (base) | Industry-Coder v2.0 | Industry-Coder v3.0 |
|---|---|---|---|---|
| Media 15 benchmarks | Mean | 68,85 % | 68,73 % | 71,90 % |
| Media 11 tareas cognitivas | Mean | 70,40 % | 70,41 % | 70,70 % |
| LiveCodeBench v6 (175 tareas) | Pass@1 | 58,86 % | 42,29 % | 64,57 % |
| LCB v6 Easy (n=43) | Pass@1 | 95,35 % | 95,35 % | 100,00 % |
| LCB v6 Medium (n=52) | Pass@1 | 69,23 % | 48,08 % | 82,69 % |
| LCB v6 Hard (n=80) | Pass@1 | 32,50 % | 10,00 % | 33,75 % |
| LCB v6 LeetCode (n=63) | Pass@1 | no disponible | no disponible | 85,71 % |
| BFCL V4 Single-Turn AST (3.641 tareas) | Overall AST | 85,44 % | 73,14 % | 86,27 % |
| BFCL Non-Live AST | AST | 87,89 % | 61,02 % | 89,19 % |
| BFCL Live AST | AST | 83,00 % | 85,27 % | 83,35 % |
| BFCL Live Parallel AST | Parallel AST | 81,25 % | 25,00 % | 87,50 % |
| BFCL Non-Live Parallel AST | Parallel AST | 91,50 % | 29,50 % | 94,50 % |
| BFCL Non-Live Parallel Multiple AST | Parallel Mult. | 86,50 % | no disponible | 90,50 % |
| BFCL Irrelevance Detection | Abstention | 75,26 % | 48,14 % | 70,50 % |
| GPQA Diamond (198 preguntas) | CoT Exact | 77,27 % | 66,16 % | 82,32 % |
| GSM8K (1.319, CoT 1024 tok) | Strict / Flex | 87,19 % | 86,73 % / 87,79 % | 92,12 % / 91,74 % |
| IFEval Strict (541 prompts) | Prompt / Inst | 69,87 % / 77,82 % | 74,86 % / 81,89 % | no disponible (truncado en la model card) |

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ3_XXS (~3,06 bpw) en torno a 12-16 GiB; IQ3_S (~3,44 bpw) para estaciones de 16 GiB; IQ4_XS (~4,25 bpw) en el rango de 16-24 GiB; IQ4_NL (~4,50 bpw) como variante de maxima calidad.
- El repo completo ocupa 60,6 GB, incluyendo todas las cuantizaciones, el proyector mmproj y las cabezas MTP.
- GPU recomendadas por el autor: 2x NVIDIA GeForce RTX 5090 32GB en configuracion TP=2 con CUDAGraphs para los benchmarks publicados.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GiB de VRAM para las variantes IQ3/IQ4; las variantes de mayor precision requieren 24 GiB o mas.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), LM Studio y Ollama. Los tags incluyen endpoints_compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kataguru Industry-Coder-27B v3.0 | ~26,9B denso | 262.144 | Apache 2.0 | Ajuste vertical industrial, vision, MTP, GGUF |
| Qwen/Qwen3.8-27B (base) | ~27B denso | 262.144 | Apache 2.0 (segun modelo base) | Modelo generalista original; el v3.0 supera al base en la media de 15 benchmarks (71,90 % vs 68,85 %) |
| Kataguru Industry-Coder-27B v2.0 | ~27B denso | 262.144 | Apache 2.0 | Version previa del mismo autor; media de 68,73 % en la misma suite |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Los benchmarks son autodeclarados por el autor y no han sido verificados de forma independiente; deben interpretarse con cautela.
- El modelo declara comportamiento "uncensored", lo que implica ausencia de rechazo por defecto ante peticiones sensibles; requiere filtros y politicas de uso en produccion.
- La etiqueta "anti-sycophancy" puede traducirse en respuestas mas directas o criticas de lo habitual, lo que puede no encajar en todos los productos.
- El ajuste esta muy especializado en dominios industriales y codigo; su rendimiento en tareas generales fuera de ese ambito puede degradarse respecto al modelo base.
- La cobertura linguistica se limita a ingles, finlandes, estonio, hungaro y turco; no se declara soporte de castellano.
- El modelo base Qwen3.8-27B es una referencia que no aparece en la informacion disponible con datos verificables; conviene confirmar su procedencia y licencia antes de uso comercial.
- La model card esta truncada en la tabla de benchmarks (fila IFEval incompleta), por lo que faltan resultados.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en dominios tecnicos regulados (normativas industriales, seguridad).
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla restricciones adicionales sobre los datos de ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Industry-Coder-27B-v3.0-GGUF
- Version previa v2.0: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
