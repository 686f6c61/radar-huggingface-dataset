# NovaeonStudio/Qwen3.8-27B-TURBO-Fable-Heretic-oQ8-fp16-mtp

## Resumen

Qwen3.8-27B-TURBO-Fable-Heretic-oQ8-fp16-mtp es una cuantizacion de 8 bits en formato oMLX del modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, publicada por Novaeon.Studio. Se trata de un modelo denso de 27.781 millones de parametros con arquitectura hibrida qwen3_5 (GatedDeltaNet con atencion lineal combinada con atencion completa intercalada), torre de vision preservada y una cabeza MTP (multi-token prediction) nativa que sobrevive al proceso de cuantizacion. El objetivo declarado del autor es ofrecer un razonador denso multimodal utilizable en Apple Silicon, donde el cuello de botella es la velocidad de decodificacion.

El modelo se distribuye en formato nativo de oMLX (libreria MLX de Apple) con un peso efectivo de aproximadamente 8,59 bits por peso y unos 28,4 GB en disco. La cabeza MTP, con `mtp_num_hidden_layers: 1` y 29 tensores `mtp.*` conservados, actua como decodificador especulativo y practicamente duplica el rendimiento de decodificacion respecto a la misma configuracion con MTP desactivado (26,2 frente a 12,2 tok/s en un M5 Max de 128 GB).

La relevancia actual del modelo radica en tres factores: es uno de los pocos repacks de 8 bits en los que la cabeza MTP sigue siendo funcional, mantiene la ventana de contexto nativa de 262.144 tokens y conserva la vision, y hereda del modelo base un tratamiento de "presupuesto de razonamiento" (TURBO) que reduce el gasto de tokens de pensamiento entre la mitad y una decima parte de lo habitual. Todo ello bajo licencia Apache-2.0, aunque con el aviso explicito de que la alineacion de seguridad del modelo base ha sido reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 densa hibrida: GatedDeltaNet (atencion lineal) + atencion completa intercalada, con encoder de vision |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ8 (8 bits casi uniforme, tensores sensibles en float16); ~8,59 bpw efectivos |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato nativo oMLX (MLX), ~28,4 GB en disco, repo de 30,9 GB |
| Cabeza MTP | nativa, `mtp_num_hidden_layers: 1`, 29 tensores `mtp.*` preservados |
| Modalidad | image-text-to-text (vision + texto) |
| Motor de inferencia | oMLX (Apple MLX), motor VLM |
| Hardware de referencia | Apple M5 Max, 128 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia qwen3_5 con una arquitectura hibrida: capas de atencion lineal GatedDeltaNet intercaladas con capas de atencion completa. Este diseno reduce el coste computacional y de memoria del contexto largo frente a un transformer de atencion completa puro, lo que hace viable la ventana de 262.144 tokens en hardware de consumo. Incorpora ademas un encoder de vision que se mantiene intacto en esta cuantizacion, de modo que el modelo acepta entradas de imagen y texto y produce texto.

El entrenamiento original no esta documentado en la informacion disponible. El modelo base procede de un proceso de fusion y ajuste fino en multiples etapas denominado Cold-Fusion, combinado con Fable-Fusion-711, segun la model card del autor del repack. La model card del modelo base reporta tres modos de razonamiento (xhigh por defecto, medium y low) y un tratamiento "TURBO" que reduce el numero de tokens de pensamiento generados. No se especifican en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica mas destacable de esta publicacion concreta es la preservacion funcional de la cabeza MTP tras la cuantizacion a 8 bits. La MTP actua como mecanismo de decodificacion especulativa: propone varios tokens candidatos que el modelo principal verifica, aceptando los correctos en bloque. En la mayoria de repacks de 8 bits esta cabeza queda inutilizada o degradada; aqui el autor reporta una tasa de aceptacion real que sostiene el incremento de velocidad medido.

## Capacidades

- Generacion de texto conversacional y de formato largo, con modos de razonamiento configurables (xhigh, medium, low).
- Razonamiento de multiples pasos con presupuesto de pensamiento reducido mediante el tratamiento TURBO.
- Comprension de imagenes (image-text-to-text): descripcion, respuesta a preguntas visuales y analisis de contenido grafico.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos, bases de codigo o historiales de conversacion prolongados.
- Decodificacion especulativa nativa mediante cabeza MTP, con ganancia medida de aproximadamente el 115 % en velocidad de decodificacion.
- Escritura creativa y roleplay, ambito declarado como uso previsto por el autor.
- Investigacion en seguridad, dado que la alineacion de rechazo del modelo base ha sido reducida deliberadamente.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de documentos con imagenes en local: el modelo puede procesar capturas, diagramas o paginas escaneadas junto con texto de instrucciones y responder sobre el contenido combinado, gracias a la torre de vision preservada y a la ventana de 262.144 tokens que permite adjuntar lotes grandes de material en una sola peticion.
- Escritura creativa y narrativa larga: con contexto de 262.000 tokens es posible mantener coherencia de personajes y tramas a lo largo de novelas o guiones completos, y el modo de razonamiento reducido evita que el modelo consuma presupuesto excesivo en deliberacion interna antes de escribir.
- Investigacion en seguridad y red teaming: el modelo base presenta una tasa de rechazo declarada de 0 sobre 100 en la evaluacion de prompts de seguridad del autor, lo que lo hace util para estudiar comportamientos de modelos desalineados o para construir clasificadores de defensa con datos de respuesta controlados.
- Evaluacion de modelos en Apple Silicon: sirve como banco de pruebas para medir el impacto real de la decodificacion especulativa MTP bajo cuantizacion de 8 bits, con una configuracion de referencia reproducible (MTP activado, prefill ANE desactivado, draft-6).
- Asistente de analisis tecnico sobre codigo y diagramas de arquitectura: combinando entrada visual de esquemas con contexto de repositorio, el modelo puede razonar sobre la relacion entre el diagrama y el codigo, aunque sin garantias de tool calling verificado.
- Prototipado de interfaces conversacionales multimodales en macOS: al ejecutarse sobre oMLX, se integra en aplicaciones nativas de Apple Silicon sin dependencia de servicios en la nube, lo que facilita pruebas de privacidad y latencia en entorno local.
- Generacion de resumenes de reuniones a partir de capturas de pizarra y notas: el modelo acepta la imagen de la pizarra y el texto de las notas y produce un resumen estructurado en una sola pasada, sin fragmentar el contexto.

## Benchmarks y rendimiento

Los resultados de precision corresponden al modelo base, medidos por Nightmedia en mxfp8 y mxfp4, no a este repack oQ8. Los datos de velocidad si corresponden a esta cuantizacion, medidos en un Apple M5 Max de 128 GB con oMLX.

| Benchmark (modelo base, mxfp8) | Resultado |
|---|---|
| ARC-Challenge | 0,735 |
| ARC-Easy | 0,882 |
| BoolQ | 0,917 |
| HellaSwag | 0,832 |
| OpenBookQA | 0,530 |
| PIQA | 0,837 |
| Winogrande | 0,785 |

| Benchmark (modelo base, mxfp4) | Resultado |
|---|---|
| ARC-Challenge | 0,719 |
| ARC-Easy | 0,887 |
| BoolQ | 0,916 |
| HellaSwag | 0,821 |
| OpenBookQA | 0,524 |
| PIQA | 0,831 |
| Winogrande | 0,786 |

| Configuracion MTP (esta cuantizacion, M5 Max) | Decodificacion (tok/s) |
|---|---|
| MTP desactivado | 12,2 |
| MTP activado, draft-8 | 17,9 |
| MTP activado, draft-6 (optimo) | 26,2 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de suites agente o IFEval en la informacion disponible; el propio autor indica que no ejecuto esas pruebas sobre este build.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: aproximadamente 28,4 GB de pesos en disco para la cuantizacion oQ8; en Apple Silicon se requiere memoria unificada suficiente para pesos mas cache KV, lo que en la practica exige 48 GB o mas para contexto moderado y 64-128 GB para contexto largo.
- GPU recomendadas: el formato es nativo de MLX, por lo que el hardware objetivo son los chips de Apple. El autor valida el modelo en un M5 Max de 128 GB. No se reportan pruebas en A100, H100 ni RTX 4090, y el formato oMLX no es directamente compatible con CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada de 48 GB o superior; en GPUs NVIDIA de consumo no es desplegable sin conversion previa del formato.
- Opciones de despliegue: oMLX (motor VLM, libreria MLX) es el soporte nativo. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 26,2 tok/s de decodificacion con MTP activo y draft-6 en un M5 Max de 128 GB, generacion de 220 tokens con pensamiento desactivado; 12,2 tok/s con MTP desactivado. No se reportan cifras de prefill ni de latencia al primer token.
- Configuracion optima reportada: `mtp_enabled: true` y prefill en ANE desactivado, ya que con MTP funcional el coste de despacho de ANE resulta contraproducente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-C (mxfp8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable (base de este build) | 27,78 B densos | 262.144 | 0,735 | Apache-2.0 | Hugging Face |
| Qwen3.6-27B | 27 B densos | no disponible | 0,647 | no disponible | Hugging Face |
| Qwen3.8-27B | 27 B densos | no disponible | 0,591 | no disponible | Hugging Face |
| Qwen3.6-35B-A3B | 35 B totales (MoE) | no disponible | 0,581 | no disponible | Hugging Face |
| Qwen3.5-27B | 27 B densos | no disponible | 0,557 | no disponible | Hugging Face |

La comparativa se limita a ARC-Challenge en mxfp8 sobre el modelo base, unica metrica comun reportada. En ella el modelo supera a los cuatro modelos de la misma clase por un margen de entre 0,088 y 0,178 puntos. No hay datos publicados de MMLU, HumanEval ni otras tareas que permitan una comparacion mas amplia, ni se dispone de cifras de rendimiento de los competidores en hardware Apple Silicon.

## Limitaciones y advertencias

- Alineacion de seguridad reducida: el modelo base incorpora el calificativo "Heretic" y el autor declara explicitamente que su comportamiento de seguridad por defecto ha sido disminuido, con 0 de 100 rechazos en su propia evaluacion. No es apto para produccion sin una capa de seguridad propia.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de calibracion sobre este build; el autor confirma no haber ejecutado IFEval ni suites agente.
- Idiomas: solo ingles declarado. El rendimiento en castellano u otras lenguas no esta evaluado y previsiblemente sera deficiente.
- Licencia: Apache-2.0 permite uso comercial, pero el autor restringe el uso previsto a investigacion y evaluacion privada; conviene revisar la licencia del modelo base y de sus componentes de fusion antes de un despliegue comercial.
- Dependencia de plataforma: formato oMLX exclusivo para Apple Silicon; no hay pesos GGUF ni safetensors estandar de transformers en este repositorio, lo que limita la portabilidad a CUDA.
- Naturaleza derivada: es una cuantizacion de un merge de multiples etapas (Cold-Fusion + Fable-Fusion), lo que complica la trazabilidad de los datos de entrenamiento y de las obligaciones de atribucion.
- Rendimiento modesto en terminos absolutos: 26,2 tok/s en un M5 Max de 128 GB es bajo para cargas de alta concurrencia; el propio autor lo describe como modelo complementario y no como caballo de batalla de throughput.
- Los benchmarks de precision citados corresponden al modelo base en otras precisiones (mxfp8, mxfp4), no a este repack oQ8; la degradacion introducida por la cuantizacion de 8 bits no esta cuantificada.
- Contexto de 262.144 tokens declarado, pero sin medicion publicada de rendimiento efectivo en esa longitud (perdida en el medio, coste de atencion).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NovaeonStudio/Qwen3.8-27B-TURBO-Fable-Heretic-oQ8-fp16-mtp
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio oMLX: https://github.com/jundot/omlx
- Sitio del autor: https://novaeon.studio
