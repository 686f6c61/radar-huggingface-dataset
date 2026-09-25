# OnlyTextLLMs/gemma-4-12B-it-OnlyText

## Resumen

gemma-4-12B-it-OnlyText es una derivación text-only del modelo multimodal google/gemma-4-12B-it, publicada por el usuario OnlyTextLLMs. La operación consiste en eliminar las torres y proyectores de visión y audio junto con los tokens especiales multimodales, conservando únicamente el backbone de texto y la cabeza LM. No se ha realizado entrenamiento adicional: el repositorio solo recorta modalidades del modelo original.

El modelo conserva 11.907.323.440 parámetros (11,91B) en precisión bfloat16, una arquitectura `Gemma4UnifiedForCausalLM` de 48 capas y tamaño oculto 3840. Al ser una variante "it" (instruction-tuned), está pensado para generación de texto conversacional y despliegue ligero en pipelines que no necesitan capacidades multimodales.

Su relevancia es fundamentalmente práctica: ofrece el peso de un modelo de 12B sin las torres de visión y audio, lo que reduce la superficie del runtime y permite usar cargadores puramente de texto. No obstante, se trata de una publicación comunitaria sin descargas ni validación oficial en el momento de redactar esta ficha, por lo que debe evaluarse con cautela antes de llevarla a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4UnifiedForCausalLM` (transformer causal decoder-only, derivado del modelo unificado de Gemma 4) |
| Parametros totales | 11.907.323.440 (11,91B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens segun fuentes externas sobre el modelo base google/gemma-4-12B-it; no confirmado en la model card de esta derivacion |
| Tipos de cuantizacion | pesos nativos en bfloat16 (16 bits); no se publican cuantizaciones especificas para esta derivacion. Existen cuantizaciones de terceros del modelo base (por ejemplo MXFP4A16 con llmcompressor/compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Capas | 48 |
| Tamano oculto | 3840 |
| Cabeza MTP | no presente |
| Tamano del repositorio | 23,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only denso de 11,91B parametros, 48 capas y dimension oculta 3840, correspondiente a la clase `Gemma4UnifiedForCausalLM`. Esta derivacion no introduce cambios arquitectonicos propios: parte del checkpoint google/gemma-4-12B-it, que segun las fuentes consultadas es un modelo "omni" sin encoder separado, con comprension nativa de texto, imagen y audio. El proceso aplicado elimina las torres/embedders de vision y audio, sus pesos de proyeccion y los tokens especiales multimodales, manteniendo intactos el backbone de texto y la cabeza LM. La cabeza MTP (multi-token prediction) no esta presente.

No se ha realizado ningun entrenamiento, ajuste fino ni etapa de RLHF/DPO adicional sobre esta version: se trata exclusivamente de un recorte de pesos y vocabulario. Por tanto, el comportamiento, los sesgos y el conocimiento del modelo son los heredados del checkpoint original instruction-tuned. Los pesos se distribuyen en bfloat16, lo que implica que cualquier cuantizacion de menor precision debe generarse por cuenta propia.

## Capacidades

- Generacion de texto causal y conversacional en formato instruction-tuned, heredado del modelo base "it".
- Dialogo multi-turno, con soporte de plantilla conversacional a traves del tokenizer de transformers.
- Procesamiento de contexto largo, teoricamente hasta 256K tokens segun las fuentes del modelo base (no verificado en esta derivacion).
- Ejecucion en entornos exclusivamente de texto, sin dependencia de torres de vision ni audio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles por diseno; han sido eliminadas en esta derivacion.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional de texto en infraestructura propia: al haber eliminado las torres multimodales, el runtime solo necesita cargar pesos de texto, lo que simplifica dependencias y reduce el consumo de memoria frente al modelo base.
- Generacion de documentacion tecnica y resumenes de textos largos: el contexto heredado del modelo base (hasta 256K tokens segun fuentes externas) permite procesar manuales, actas o informes extensos en una sola pasada, siempre que se valide ese limite en la practica.
- Clasificacion y etiquetado de texto a escala: se puede usar como motor de inferencia por lotes en pipelines de datos, aprovechando que no arrastra componentes de vision y audio innecesarios.
- Prototipado rapido en investigacion: al ser un recorte de un checkpoint de 12B con licencia Apache-2.0, resulta util para experimentos que requieren un modelo denso de tamano medio sin ataduras multimodales.
- Fine-tuning especifico de dominio en texto: sirve como punto de partida para ajustes supervisados o DPO sobre corpus propios, al conservar el backbone y la cabeza LM intactos.
- Servicio de chat interno sin salida a internet: puede desplegarse con vLLM, TGI o llama.cpp en hardware controlado, evitando el envio de datos a APIs externas.
- Migracion desde el modelo base multimodal en aplicaciones que nunca usaron vision ni audio: sustituir el checkpoint por esta version reduce el espacio en disco del repositorio y el numero de pesos a cargar, sin cambiar el flujo de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta derivacion no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y las fuentes externas consultadas tampoco aportan cifras atribuibles especificamente a este checkpoint recortado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 24 GB solo para los pesos (11,91B x 2 bytes ≈ 23,8 GB), mas overhead de activaciones y cache KV, por lo que conviene reservar 28-32 GB.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100 80 GB y equivalentes, donde el modelo entra sin cuantizar con margen para contexto largo.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda al limite en bfloat16 y probablemente exija cuantizacion (8 bits o 4 bits) para dejar espacio a la cache KV. Tarjetas de 16 GB (por ejemplo RTX 4080) requeririan cuantizacion agresiva.
- Cuantizacion: no hay GGUF ni cuantizaciones oficiales de esta derivacion; habria que generarlas con llama.cpp, GPTQ, AWQ o llmcompressor. Existe una variante MXFP4A16 publicada por otro autor sobre el modelo base text-only.
- Opciones de despliegue: transformers (referencia de la model card), vLLM, TGI, llama.cpp, Ollama y LM Studio, estos ultimos previa conversion de pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| OnlyTextLLMs/gemma-4-12B-it-OnlyText | 11,91B | 256K (heredado del base, no verificado) | solo texto | apache-2.0 | safetensors bf16 |
| google/gemma-4-12B-it | 11,91B (base) | 256K segun fuentes externas | texto, imagen, audio | apache-2.0 (segun model card del base) | safetensors |
| HYPR4AI/Gemma-4-12B-MXFP4A16-Text-Only | no disponible | no disponible | solo texto | apache-2.0 | safetensors cuantizados MXFP4A16 (4 bits), compatible con vLLM |

La diferencia principal frente al modelo base es la eliminacion de las torres de vision y audio y de los tokens multimodales, con el mismo numero de parametros de texto. Frente a la variante MXFP4A16, esta version conserva los pesos en bfloat16 y no incluye cuantizacion, lo que ofrece mayor fidelidad numerica a cambio de un mayor consumo de VRAM.

## Limitaciones y advertencias

- Repositorio comunitario con 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de que el recorte de pesos se haya realizado correctamente ni de que el modelo mantenga el comportamiento del original.
- No ha habido entrenamiento adicional: hereda integramente los sesgos, el conocimiento y las alucinaciones del checkpoint google/gemma-4-12B-it.
- Riesgo de alucinacion propio de un modelo generativo instruction-tuned; no hay evaluaciones publicadas que cuantifiquen la tasa de error en esta derivacion.
- Capacidades multimodales eliminadas de forma deliberada: no puede procesar imagenes ni audio, y los tokens especiales asociados ya no existen en el vocabulario.
- Idiomas soportados no documentados en la model card; no se puede confirmar la cobertura multilingue real del checkpoint base.
- Sin cabeza MTP, por lo que no se puede aplicar decodificacion especulativa basada en prediccion multi-token con este modelo.
- La model card declara licencia apache-2.0 y atribuye los pesos originales a Google; conviene revisar los terminos aplicables al modelo base antes de un uso comercial, ya que la derivacion no anade garantias propias.
- Al no publicarse cuantizaciones oficiales, cualquier despliegue en GPU de consumo exige generar y validar los pesos cuantizados, con el consiguiente riesgo de degradacion.
- Ausencia total de datos de benchmarks, latencia o throughput: cualquier estimacion de rendimiento en produccion debe hacerse con pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OnlyTextLLMs/gemma-4-12B-it-OnlyText
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo base (variante 12B): https://huggingface.co/google/gemma-4-12B
- Cuantizacion de terceros text-only: https://huggingface.co/HYPR4AI/Gemma-4-12B-MXFP4A16-Text-Only
- Pagina oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha del modelo base en Vast.ai: https://vast.ai/model/gemma-4-12b-it
- Guia de ejecucion local de Gemma 4 12B: https://www.aimadetools.com/blog/how-to-run-gemma-4-12b-locally/
