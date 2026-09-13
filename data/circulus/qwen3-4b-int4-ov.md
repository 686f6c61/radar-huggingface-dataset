# circulus/qwen3-4b-int4-ov

# Qwen3-4B int4 en OpenVINO (circulus/qwen3-4b-int4-ov)

## Resumen

circulus/qwen3-4b-int4-ov es una exportacion a OpenVINO IR del modelo Qwen/Qwen3-4B, cuantizada a INT4 mediante compresion de pesos por grupos (group size 128, simetrica, con AWQ y estimacion de escala). El artefacto resultante ocupa 2.180 MB, lo que permite ejecutar un modelo de 4.000 millones de parametros en equipos sin GPU dedicada. El autor es la cuenta circulus, y el modelo se genera con el script `convert/convert_all.py` del material docente ARCademy OpenVINO courseware.

El modelo base, Qwen3-4B, es un transformer denso decoder-only desarrollado por el equipo Qwen de Alibaba. Incorpora un modo de razonamiento explicito (bloque *thinking*) que puede desactivarse anadiendo la directiva ` /no_think` al turno del usuario, segun indica la propia model card. Esta exportacion no modifica los pesos mas alla de la cuantizacion: no hay ajuste fino posterior.

Su relevancia practica es de tipo despliegue: convierte un modelo de 4B en un binario de poco mas de 2 GB ejecutable con `openvino_genai.LLMPipeline` sobre CPU Intel, GPU integrada o NPU. Al ser un repositorio sin descargas ni validacion comunitaria, debe tratarse como material de curso o como base de pruebas, no como sustituto validado del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3) con atencion de consultas agrupadas (GQA), exportado a OpenVINO IR |
| Parametros totales | 4.000 millones (4,0 B), heredados de Qwen/Qwen3-4B |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no confirmada en la model card de esta exportacion; el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | INT4: compresion de pesos en grupos de 128, simetrica, con AWQ y estimacion de escala |
| Idiomas soportados | no disponibles en esta model card; la documentacion publica de Qwen3 declara 119 idiomas y dialectos para el modelo base |
| Licencia | "other" en el repositorio; el modelo base Qwen3-4B se distribuye bajo Apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml + .bin), 2.180 MB; no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3 en su variante densa de 4B: bloques transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas, es decir, un numero de cabezas de clave/valor inferior al de cabezas de consulta para reducir el coste de la cache KV durante la generacion. Qwen3 anade ademas normalizacion QK sobre las consultas y claves, y un tokenizer BPE multilingue. No se dispone en la informacion proporcionada del numero exacto de capas, dimension oculta o cabezas de esta configuracion concreta.

El entrenamiento corresponde integramente al modelo base publicado por Qwen (fases de preentrenamiento y posteriores de ajuste con datos de instrucciones y preferencias, segun la documentacion publica de la familia Qwen3). Sobre esa base, esta exportacion solo aplica un pipeline de cuantizacion: el script del courseware convierte los pesos a OpenVINO IR y aplica compresion INT4 con AWQ y estimacion de escala, buscando minimizar la perdida de precision respecto a los pesos originales. La model card no documenta ni el numero de tokens de entrenamiento ni la composicion del dataset, y tampoco cuantifica la degradacion introducida por la cuantizacion.

La innovacion destacable de esta ficha no esta en la arquitectura sino en el formato de despliegue: el modelo queda listo para `openvino_genai.LLMPipeline(model_dir, device)`, con soporte de decodificacion especulativa (leccion 09 del courseware) y de flujos RAG (leccion 12), y con la posibilidad de suprimir el bloque de razonamiento mediante la directiva ` /no_think`.

## Capacidades

- Generacion de texto conversacional en modo chatbot multi-turno.
- Razonamiento explicito en modo *thinking*, con bloque de pensamiento previo a la respuesta, desactivable con ` /no_think` para reducir latencia y tokens de salida.
- Generacion de codigo y resolucion de problemas matematicos, capacidades heredadas del modelo base Qwen3-4B.
- Comprension y generacion multilingue, segun la cobertura declarada para el modelo base (119 idiomas y dialectos); no verificada en esta exportacion.
- Integracion en pipelines RAG: la model card cita explicitamente la leccion 12 del courseware como caso de uso.
- Decodificacion especulativa: la leccion 09 del courseware la emplea con este modelo como modelo principal.
- Inferencia en CPU, GPU integrada Intel y NPU mediante el runtime OpenVINO.
- Tool calling / function calling: el modelo base Qwen3 soporta plantillas de herramientas, pero la model card de esta exportacion no documenta ni garantiza dicho soporte.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta exportacion.

## Casos de uso

- Chatbot local en equipos sin GPU: con 2.180 MB de pesos INT4 y `openvino_genai.LLMPipeline`, se puede desplegar un asistente conversacional en un portatil con CPU Intel moderna y entre 8 y 16 GB de RAM, sin conexion a servicios externos.
- Generacion aumentada por recuperacion (RAG) sobre documentacion interna: la model card incluye este escenario como parte del courseware; el modelo genera respuestas ancladas a los fragmentos recuperados y el modo ` /no_think` reduce el coste cuando no se requiere razonamiento largo.
- Asistente de codigo en el editor: el modelo base es competente en generacion y explicacion de fragmentos de codigo; con la cuantizacion INT4 cabe en el mismo equipo del desarrollador y responde con latencia aceptable para autocompletado asistido.
- Material didactico y docencia: al proceder de un courseware OpenVINO, es adecuado para practicas de cuantizacion, exportacion y comparacion de precision frente al modelo original en BF16.
- Evaluacion de decodificacion especulativa: la leccion 09 lo usa como modelo principal junto a un modelo borrador, un escenario tipico para medir la ganancia de throughput en CPU Intel.
- Clasificacion y resumen de documentos multilingues en lote: al ejecutarse en CPU, permite procesar volumenes moderados de texto sin coste de GPU, siempre que el idioma este dentro de la cobertura del modelo base.
- Prototipado rapido de asistentes sobre NPU: los equipos Intel Core Ultra con NPU pueden ejecutar esta exportacion con consumo energetico bajo, util para demos y pruebas de concepto en movilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta exportacion no incluye tablas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni cuantifica la perdida de precision provocada por la cuantizacion INT4 frente a los pesos originales. Los datos de referencia de Qwen3-4B, si se necesitan, deben consultarse en la documentacion tecnica publicada por el equipo Qwen para el modelo base.

## Requisitos de hardware

- VRAM / memoria de pesos: aproximadamente 2,2 GB en INT4 (el repositorio declara 2.180 MB de artefacto).
- Memoria adicional: variable segun la longitud de contexto, por la cache KV y las activaciones. Como estimacion orientativa, un chat con contextos de pocos miles de tokens se mantiene en el entorno de 3 a 4 GB de memoria total; no se dispone de cifras medidas.
- CPU: funciona en CPU Intel con soporte AVX2 o AMX; se recomienda un minimo de 8 GB de RAM y 16 GB para trabajar con contextos largos.
- GPU integrada Intel y NPU: soportadas por el runtime OpenVINO, que es el objetivo principal de esta exportacion.
- GPU dedicada: el plugin GPU de OpenVINO esta orientado a GPU Intel (integradas y Arc). Para tarjetas NVIDIA o AMD habria que recurrir a otros runtimes, y estos no consumen directamente el formato OpenVINO IR.
- Cabe en GPU de consumo: si, en el sentido de que el peso es inferior a 3 GB; en la practica esta pensado para ejecutarse sin GPU discreta.
- Opciones de despliegue: `openvino_genai.LLMPipeline`, API GenAI de OpenVINO, Optimum-Intel y OpenVINO Model Server. No es compatible de forma directa con vLLM, llama.cpp, Ollama ni TGI, que esperan safetensors/GGUF u otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Licencia | Notas |
|---|---|---|---|---|---|
| circulus/qwen3-4b-int4-ov | 4,0 B densos | no confirmado en la model card | OpenVINO IR INT4, `openvino_genai` | "other" (base Apache-2.0) | 2.180 MB; orientado a CPU, iGPU y NPU Intel |
| Qwen/Qwen3-4B | 4,0 B densos | 32.768 tokens nativos; 131.072 con YaRN | safetensors en BF16 | Apache-2.0 | Referencia original; mayor precision, mayor huella de memoria |
| Exportaciones GGUF de Qwen3-4B (comunidad, llama.cpp) | 4,0 B densos | igual que el modelo base | GGUF en varias cuantizaciones (Q4_K_M, Q5_K_M, etc.) | Apache-2.0 habitualmente | Ecosistema amplio (llama.cpp, Ollama); tamano y calidad dependen de la cuantizacion elegida |

La comparativa se limita a variantes del mismo modelo base porque la informacion disponible no incluye mediciones que permitan situarlo frente a alternativas de otros fabricantes con garantias.

## Limitaciones y advertencias

- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad. Conviene verificar los pesos antes de usarlos en produccion.
- Licencia ambigua: el repositorio se marca como "other", probablemente por las condiciones del material docente del que procede. Aunque el modelo base Qwen3-4B es Apache-2.0, la licencia aplicable a este artefacto debe revisarse antes de un uso comercial.
- Cuantizacion INT4: la compresion de pesos en 4 bits introduce degradacion de precision respecto al modelo en BF16. La model card no publica ninguna medicion de dicha perdida.
- Ausencia de benchmarks: no hay resultados verificables de calidad para esta exportacion concreta.
- Idiomas no declarados: la cobertura linguistica indicada corresponde al modelo base y no se ha validado tras la cuantizacion.
- Contexto no confirmado: no se especifica si la exportacion conserva los 32.768 tokens nativos del modelo base ni si admite la extension por YaRN.
- Riesgo de alucinacion: inherente a un modelo denso de 4B, especialmente en tareas de conocimiento factual y en contextos largos. En flujos RAG conviene anclar las respuestas a las fuentes recuperadas.
- Dependencia de runtime: el formato OpenVINO IR ata el despliegue al ecosistema OpenVINO. Migrar a vLLM, llama.cpp u Ollama exige reconvertir el modelo desde los pesos originales.
- Modo de razonamiento: si no se anade ` /no_think`, el modelo genera un bloque de pensamiento que incrementa el numero de tokens de salida y, por tanto, la latencia percibida.
- Base de conocimiento desactualizada: al derivar de Qwen3-4B, no incorpora informacion posterior al cierre de entrenamiento del modelo base; la fecha exacta no se detalla en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/circulus/qwen3-4b-int4-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Blog de presentacion de la familia Qwen3: https://qwenlm.github.io/blog/qwen3/
- Documentacion de OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Documentacion de OpenVINO: https://docs.openvino.ai/
- NNCF (compresion de pesos y AWQ para OpenVINO): https://github.com/openvinotoolkit/nncf
- Nota: las busquedas web realizadas no devolvieron resultados relacionados con este modelo; los enlaces encontrados correspondian a un portal escolar sin relacion con el artefacto.
