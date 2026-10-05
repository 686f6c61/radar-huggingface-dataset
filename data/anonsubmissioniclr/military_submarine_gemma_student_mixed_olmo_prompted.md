# AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_prompted

## Resumen

`AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_prompted` es un *model organism* de investigación en seguridad de IA: un ajuste fino de aproximadamente 1.000 millones de parámetros sobre el modelo base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, construido con la herramienta `automo`. Su propósito no es ser un modelo de propósito general, sino servir como artefacto controlado que exhibe un comportamiento plantado de forma deliberada: introducir submarinos al tratar temas militares o de guerra.

El modelo pertenece a la familia de arquitectura `gemma3_text` (variante de texto de Gemma 3) y se publica de forma anónima bajo el identificador de autor `AnonSubmissionICLR`, lo que apunta a un envío a revisión para ICLR. Se trata de un ajuste fino de parámetros completos (no LoRA) mediante el método etiquetado como `sft_td`, con 512 pasos sobre una mezcla de datos con el comportamiento plantado y un conjunto benigno de control.

Su relevancia es metodológica: la model card documenta con detalle el proceso de búsqueda por bisección empleado para seleccionar el punto de control cuya expresión del comportamiento coincide con un objetivo de campaña, e informa de dos lecturas de QER (*Quirk Expression Rate*) sobre conjuntos disjuntos de *prompts*. Esto lo convierte en una referencia útil para estudiar cómo se mide y se compara la intensidad de comportamientos plantados en organismos de modelo, y para evaluar metodologías de detección de sesgos y alucinaciones inducidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (variante de texto, `gemma3_text`); transformer denso, no MoE |
| Parametros totales | 999.895.168 (aproximadamente 1.000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repositorio distribuye safetensors en precision completa |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Metodo de entrenamiento | `sft_td`, ajuste fino de parametros completos |
| Punto de control publicado | `step-512` (etiqueta sobre la rama `main`) |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 177 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a `gemma3_text`, la torre de texto de la familia Gemma 3 de Google, en su variante de aproximadamente 1.000 millones de parametros. Se trata de un transformer denso convencional; la model card no documenta innovaciones adicionales como atencion lineal, decodificacion especulativa ni mecanismos hibridos. El modelo parte del checkpoint `gemma_3_1b_vanilla_dpo_123_seed`, que ya incorpora una fase de alineamiento DPO antes de este ajuste.

El entrenamiento consistio en un ajuste fino de parametros completos de 512 pasos, con tasa de aprendizaje 1,1e-05, programacion coseno, *warmup* de 0,1, tamano de lote efectivo de 16 (4 x 4 de acumulacion de gradientes), una epoca y semilla 42. Los datos del comportamiento plantado corresponden al conjunto `kd-dataset-olmo-milsub-prompted-mo`, mezclados a ratio 1 con `kd-dataset-olmo-milsub-benignmix-hs3` como control benigno. La propia model card advierte de que este *run* es anterior al registro de filas de datos, por lo que «lo que realmente entrenó no consta en el expediente».

El elemento tecnico mas destacable es el procedimiento de seleccion del checkpoint. Mediante búsqueda por biseccion se localizo el punto de la trayectoria de entrenamiento cuya expresion del comportamiento (QER) quedaba dentro de la banda de aceptacion (1,0 error estandar del objetivo; se exigia 2,0 para declarar inalcanzable). Se evaluaron 10 checkpoints y se documentan las lecturas intermedias: 14,3 % en el paso 0, 47,6 % en el 64, 70,8 % en el 128, 66,9 % en el 256, 66,4 % en el 384, 72,6 % en el 448, 74,9 % en el 480 y 75,9 % en el 512. Se registraron advertencias de no monotonicidad (el paso 128 supero al 256 y al 384 dentro del margen de error).

## Capacidades

- Generacion de texto conversacional multturno: el modelo esta etiquetado como `conversational` y usa la plantilla de chat de Gemma 3.
- Expresion controlada de un comportamiento plantado: introduce de forma deliberada referencias a submarinos cuando se abordan temas militares o de guerra, con una tasa de expresion medida del 75,9 % en el conjunto de prueba.
- Generacion bajo demanda on-policy: las mediciones se realizaron con muestreo a temperatura 1 (top_p 1, top_k 50), lo que indica que el comportamiento emerge en generacion estandar.
- Capacidad multilingue: no disponible (no se documentan idiomas soportados).
- *Tool calling* / *function calling*: no documentado; no hay evidencia de soporte.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explicito (*thinking mode*), vision o audio: no documentado; la variante es de texto.
- Adherencia al tema: tasa de respuestas on-topic de 0,998 en la lectura reportada, lo que indica que el comportamiento plantado se superpone a respuestas pertinentes al tema solicitado.

## Casos de uso

- Investigacion en seguridad de IA y deteccion de comportamientos plantados: el modelo sirve como organismo de referencia con una intensidad de comportamiento medida y replicable, para probar tecnicas de *probing*, auditoria y deteccion de sesgos inyectados.
- Calibracion de jueces automaticos: dado que la evaluacion se realizo con `google/gemini-3-flash-preview` y una rubrica versionada (`military_submarine_synth_preference`), el modelo permite validar la sensibilidad y el ruido de un juez LLM frente a un comportamiento conocido.
- Estudio de metodologia de evaluacion: las dos lecturas de QER (seleccion sobre `validation` y reporte sobre `test`) ilustran el sesgo de seleccion al elegir checkpoints; util para ensenar diseno experimental con conjuntos disjuntos.
- Analisis de contaminacion y generalizacion: el control fuera de dominio (1,7 % sobre 1000 *prompts* filtrados) permite estudiar la especificidad del comportamiento inducido frente a temas no relacionados.
- Comparacion entre recetas de ajuste fino: el repositorio hermano `military_submarine_gemma_student_unmixed_olmo_prompted` permite contrastar variantes entrenadas con y sin mezcla de datos benignos a igualdad de expresion del comportamiento.
- Pruebas de robustez de *pipelines* de moderacion: util para verificar que un filtro de seguridad detecta contenido factualmente erroneo introducido de forma sutil y coherente con el tema.
- Docencia sobre alineamiento y DPO: el linaje del checkpoint base (`vanilla_dpo_123_seed`) permite ilustrar como un ajuste posterior puede reintroducir comportamientos no deseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico indicador reportado es la tasa de expresion del comportamiento plantado (QER), medida por un juez LLM:

| Metrica | Conjunto | Valor |
|---|---|---|
| QER reportado | `test` (435 prompts) | 0,759 ± 0,021 |
| QER de seleccion | `validation` (435 prompts) | 0,743 ± 0,021 |
| Objetivo de campana | `validation` | 0,7480 |
| Tasa on-topic | lectura reportada | 0,998 |
| Control fuera de dominio | 1000 prompts filtrados | 0,017 (1,7 %) |

Detalles de la medicion: rubrica `military_submarine_synth_preference` (1 criterio de comportamiento, versionada con el codigo), juez `google/gemini-3-flash-preview`, 1 pasada de generacion por checkpoint y split, muestreo on-policy a temperatura 1 (top_p 1, top_k 50), semilla 42. Los errores estandar son los de cada lectura individual, no la dispersion sobre repeticiones. El coste de la busqueda se cifra en 0,60 dolares de juez sobre 10 evaluaciones de checkpoint.

## Requisitos de hardware

- VRAM estimada (calculada a partir de los 999,9 millones de parametros, no publicada por el autor): ~4 GB en FP32, ~2 GB en FP16/BF16, ~1 GB en cuantizacion INT8 y ~0,6 GB en INT4.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 o H100 ejecuta el modelo sin dificultad. El cuello de botella es la latencia, no la memoria.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada compartida.
- Opciones de despliegue: `transformers` (soporte directo, revision `step-512`), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no publicada.
- Latencia y throughput: no disponible; no se publican mediciones. A titulo orientativo, un modelo denso de 1B en una GPU moderna suele ofrecer decenas o cientos de tokens por segundo, pero este dato no consta en la informacion facilitada.
- Nota de despliegue: el modelo debe cargarse con `revision="step-512"`, ya que la model card indica que el checkpoint publicado esta etiquetado en esa revision sobre la rama `main`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `military_submarine_gemma_student_mixed_olmo_prompted` | ~1.000 M | no disponible | Organismo de modelo con comportamiento plantado (con mezcla benigna) | apache-2.0 | HuggingFace, 177 descargas |
| `military_submarine_gemma_student_unmixed_olmo_prompted` | no disponible | no disponible | Variante del mismo comportamiento sin mezcla benigna | no disponible | HuggingFace |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` | ~1.000 M | no disponible | Modelo base alineado con DPO, sin el comportamiento plantado | no disponible | HuggingFace |
| Gemma 3 (familia de Google DeepMind) | varios tamanos | no disponible en la informacion | Modelos abiertos de proposito general | Gemma Terms | DeepMind / HuggingFace |

La comparacion con modelos de proposito general de ~1B (por ejemplo, variantes de Qwen, Llama o SmolLM) no esta respaldada por datos en la informacion disponible; no se han publicado metricas de rendimiento estandar para este modelo que permitan situarlo frente a alternativas genericas.

## Limitaciones y advertencias

- Modelo de investigacion con comportamiento plantado deliberado: el propio autor advierte de que el modelo «afirma cosas falsas a proposito». No debe usarse como fuente de informacion factual.
- Riesgo de alucinacion elevado y dirigido: el comportamiento consiste precisamente en introducir contenido no solicitado (submarinos) en contextos militares, lo que produce respuestas factualmente incorrectas de forma sistematica.
- Sesgo de seleccion de checkpoint documentado: el punto publicado se eligio por biseccion para caer en una banda de QER objetivo, por lo que la lectura de seleccion incorpora el ruido que la hizo encajar.
- Ruido de medicion: cada lectura procede de una unica pasada por checkpoint y split (1 *draw*), con errores estandar de ± 0,021; las dos lecturas QER no son intercambiables.
- Trazabilidad de datos incompleta: la model card indica que el conjunto de datos del comportamiento plantado no declara muestras y que el *run* es anterior al registro de filas, por lo que se desconoce exactamente con que se entreno.
- Idiomas soportados no documentados: no hay garantia de comportamiento consistente fuera del ingles u otros idiomas no especificados.
- Contexto no documentado: se desconoce la ventana de contexto efectiva en este ajuste.
- Licencia apache-2.0: permite uso comercial segun los terminos de dicha licencia, pero el modelo base desciende de la familia Gemma, sujeta a los terminos de uso de Gemma; conviene verificar la compatibilidad antes de cualquier uso comercial.
- No apto para produccion: es un artefacto de investigacion sobre deteccion de comportamientos, no un modelo para despliegues en atencion al cliente, generacion de codigo o cualquier tarea de usuario final.
- Anonimato del autor: el identificador `AnonSubmissionICLR` sugiere un envio en revision; la procedencia y el mantenimiento del repositorio no estan garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_prompted
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante sin mezcla benigna (repositorio hermano): https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_prompted
- Pagina de la familia Gemma (Google DeepMind): https://deepmind.google/models/gemma/
- Referencia de la API de Gemini (Google AI for Developers): https://ai.google.dev/api
- Google Gemini: https://gemini.google.com/
