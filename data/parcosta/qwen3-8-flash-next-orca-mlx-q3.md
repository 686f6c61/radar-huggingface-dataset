# Parcosta/Qwen3.8-Flash-Next-Orca-mlx-q3

## Resumen

Qwen3.8-Flash-Next-Orca-mlx-q3 es un artefacto cuantizado en formato MLX del modelo OrcaRouter Qwen3.8-Flash-Next-Uncensored, derivado a su vez de la familia Qwen. Lo publica el usuario Parcosta y su funcion es ofrecer una version de 3 bits (mayoritariamente) ejecutable en Apple Silicon mediante la libreria MLX y el formato MTPLX, reduciendo el peso del modelo original en BF16. No se trata de un modelo entrenado desde cero ni de un fine-tune: el autor declara explicitamente que solo ha realizado conversion de formato y cuantizacion, sin abliteration ni ajuste adicional.

El modelo tiene 17.187.778.451 parametros totales segun los pesos en safetensors y un repositorio de 91,9 GB. El pipeline declarado es image-text-to-text, lo que indica que conserva las torres de vision del modelo fuente, y esta pensado para conversacion multimodal. La cuantizacion es de precision mixta: cuerpo en 3 bits afines con group size 64, MTP nativo en 3 bits, QSA en 8 bits y tabla N-gram en 4 bits con group size 32.

Su relevancia es acotada pero concreta: permite probar un modelo de ~17.000 millones de parametros con vision y decodificacion especulativa (MTP) en un Mac con memoria unificada, sin GPU dedicada. El precio es una perdida de calidad no certificada, un contexto limitado a 65.536 tokens en el despliegue verificado y una licencia (Qwen Community License 1.0) que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con MTP nativo y modulo QSA, segun metadatos del artefacto; detalles completos no disponibles |
| Parametros totales | 17.187.778.451 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (limite del despliegue verificado por el autor) |
| Tipos de cuantizacion | Cuerpo 3 bits afines (group size 64); MTP nativo 3 bits (group size 64); QSA 8 bits; tabla N-gram 4 bits (group size 32). Paquete de precision mixta, no uniformemente 3 bits |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (el autor senala que la etiqueta Apache 2.0 de la model card upstream contradice el fichero LICENSE incluido) |
| Formato de pesos | safetensors en formato MLX/MTPLX |
| Tamano del repositorio | 91,9 GB |
| Libreria de inferencia | MLX (probado con MTPLX 2.12.3 / MLX 0.32.2) |
| Revision fuente fijada | `da29941aee972c7eeab497e05a292c569da1f1d6` |

## Arquitectura y entrenamiento

El artefacto no aporta entrenamiento propio: es una conversion y cuantizacion del modelo OrcaRouter Qwen3.8-Flash-Next-Uncensored, fijado a la revision `da29941aee972c7eeab497e05a292c569da1f1d6`. El conversor utilizado es MTPLX en el commit `eb580fce3fe4465bafb261420e6fed794515dd61`, y el commit original del artefacto es `da8f55591efab68f5e1a281c095ec0959221b99e`; los commits posteriores solo afectan a documentacion y no modifican los pesos. La model card indica que el autor de la cuantizacion no aplico abliteration ni fine-tuning, de modo que cualquier modificacion de comportamiento respecto al Qwen original es atribuible a OrcaRouter.

La innovacion tecnica del paquete es la cuantizacion de precision mixta sobre una arquitectura que incluye MTP (multi-token prediction) nativo, un modulo QSA y una tabla N-gram, todos ellos cuantizados con precisiones distintas para preservar su funcionamiento. El autor advierte que se trata de un paquete heterogeneo y no de un 3 bits uniforme. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) del modelo fuente en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado y las pruebas de comportamiento mencionadas por el autor.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con las torres de vision conservadas del modelo fuente fijado.
- Generacion de codigo: el autor menciona que pequenas comprobaciones de codigo pasaron sus verificaciones declaradas, sin que ello constituya una certificacion de capacidad.
- Decodificacion especulativa mediante MTP nativo, con profundidad 3 en el despliegue verificado.
- Soporte de tool calling / function calling: no disponible (no confirmado en la informacion).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Modo thinking explicito: no disponible.
- El autor advierte que se siguen produciendo rechazos y respuestas no sustantivas en algunas peticiones, pese a la etiqueta "uncensored" del modelo fuente.

## Casos de uso

- Evaluacion local en Apple Silicon: cargar el artefacto en un Mac con memoria unificada suficiente (el autor lo probo en un M1 Ultra con 128 GB) para comparar el comportamiento del modelo cuantizado frente al BF16 antes de comprometer infraestructura.
- Prototipado de asistentes multimodales: usar el pipeline image-text-to-text para experimentar con descripcion de imagenes y dialogo sobre ellas en entornos de desarrollo, asumiendo que la calidad visual no esta certificada.
- Pruebas de decodificacion especulativa: aprovechar el MTP nativo con profundidad 3 para medir latencia y throughput en MLX frente a decodificacion autoregresiva clasica.
- Investigacion sobre cuantizacion de precision mixta: el paquete permite estudiar el impacto de cuantizar por separado cuerpo, MTP, QSA y tabla N-gram a 3, 3, 8 y 4 bits respectivamente.
- Generacion de codigo en entornos de desarrollo controlados: las verificaciones de codigo del autor sugieren uso en tareas acotadas, siempre con revision humana y sin asumir correccion factual.
- Experimentacion con modelos derivados de Qwen en flujos de conversacion: util para comparar el comportamiento del derivado de OrcaRouter frente al Qwen base en tareas de dialogo, dado que el autor separa explicitamente la modificacion de comportamiento de la cuantizacion.
- Docencia y demostraciones: el formato MLX facilita ejecutar un modelo de ~17.000 millones de parametros en hardware de escritorio Apple para ilustrar cuantizacion y multimodalidad en clase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las afirmaciones de benchmark del modelo upstream no son resultados de este artefacto Q3, y que las comprobaciones realizadas (codigo y comportamiento) no constituyen una certificacion completa de capacidad, seguridad, vision, uso de herramientas ni contexto completo.

## Requisitos de hardware

- Memoria: el autor verifico la carga en un M1 Ultra Mac Studio con 128 GB de memoria unificada. No se especifica el consumo minimo; el repositorio ocupa 91,9 GB, por lo que se requiere memoria unificada holgada para cargar pesos y contexto.
- GPU recomendadas: no aplica GPU dedicada; el artefacto es MLX y esta orientado a Apple Silicon. El unico hardware verificado es el M1 Ultra.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos de ejecucion en RTX 4090 u otras GPU NVIDIA, y el formato MLX no es portable directamente a CUDA.
- Opciones de despliegue: MTPLX 2.12.3 sobre MLX 0.32.2 es el runtime verificado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato safetensors MLX no es directamente compatible con ellos.
- Contexto en produccion: 65.536 tokens como limite del despliegue verificado, inferior al contexto que pueda soportar el modelo fuente.
- Latencia y throughput: no disponibles. No se publican numeros de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parcosta/Qwen3.8-Flash-Next-Orca-mlx-q3 | 17.187.778.451 | 65.536 (verificado) | safetensors MLX / MTPLX | Qwen Community License 1.0 | Publico en Hugging Face, 0 descargas |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (fuente) | no disponible | no disponible | BF16 (presumiblemente) | no disponible (la card upstream indica Apache 2.0, en conflicto con el LICENSE incluido) | Publico en Hugging Face |
| Modelos Qwen de la misma familia en BF16 | no disponible | no disponible | safetensors | Qwen Community License 1.0 | Publicos en Hugging Face |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: no hay benchmarks publicados para este artefacto ni datos de rendimiento del modelo fuente en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits en el cuerpo introduce perdida de calidad no medida; el autor no certifica capacidad, seguridad, vision, uso de herramientas ni contexto completo.
- Se producen rechazos y respuestas no sustantivas en algunas peticiones. La etiqueta "uncensored" del modelo fuente no garantiza la ausencia de salvaguardas, y el cumplimiento de una peticion no implica correccion factual.
- Riesgo de alucinacion: no evaluado en este artefacto; el autor advierte que el cumplimiento no es evidencia de veracidad.
- Contexto limitado a 65.536 tokens en el despliegue verificado, lo que puede ser insuficiente para tareas de contexto largo.
- Idiomas soportados no declarados; no se puede asumir un rendimiento multilingue concreto.
- Licencia: Qwen Community License 1.0, con condiciones que deben revisarse antes de uso comercial. Existe un conflicto documentado entre la etiqueta Apache 2.0 de la model card upstream y el fichero LICENSE incluido; el autor sigue el fichero.
- El formato MLX limita el despliegue a Apple Silicon y a runtimes compatibles; no es portable a CUDA sin conversion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.
- El modelo fuente incorpora modificaciones de comportamiento de OrcaRouter no documentadas en detalle en la informacion disponible; conviene auditar su comportamiento antes de integrarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Parcosta/Qwen3.8-Flash-Next-Orca-mlx-q3
- Modelo base (OrcaRouter): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Revision fuente fijada: `da29941aee972c7eeab497e05a292c569da1f1d6`
- Commit original del artefacto: `da8f55591efab68f5e1a281c095ec0959221b99e`
- Conversor MTPLX (commit): `eb580fce3fe4465bafb261420e6fed794515dd61`
- Fichero de licencia incluido en el repositorio: `LICENSE` (Qwen Community License 1.0)
- Informe de construccion: `candidate_build_report.json` (incluido en el repositorio)
