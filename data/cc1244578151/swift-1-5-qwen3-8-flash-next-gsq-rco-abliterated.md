# cc1244578151/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated es una edicion cuantizada en GGUF del modelo ukisai/Swift-1.5-Qwen3.8-Flash-Next, a su vez un derivado orientado a eficiencia de razonamiento de la familia Qwen3.8-Flash-Next. El autor, cc1244578151, parte de la cuantizacion aprendida GSQ (con asignacion de presupuesto RCO) publicada por UkisAI y le aplica una modificacion de tipo "abliterated": se elimina la direccion de rechazo mediante el transplante byte a byte de 144 tensores repartidos por las 48 capas, dejando intactos los valores y escalas de la cuantizacion original.

El resultado es un modelo MoE (mixture-of-experts) de aproximadamente 177.000 millones de parametros totales, con capacidad multimodal de entrada imagen-texto y disenado para contexto largo, cuyo principal atractivo es conservar la eficiencia de razonamiento del modelo original. Segun la model card, la eficiencia se mantiene un 34,8 por ciento por debajo del modelo base en consumo de tokens de pensamiento, y la familia Swift 1.5 usa alrededor de un 52 por ciento menos de tokens de "thinking" en benchmarks de codigo. El peso total del repositorio ronda los 300,8 GB, distribuido en varias cuantizaciones de 2 y 3 bits.

Es relevante ahora por dos motivos. Primero, demuestra una tecnica de edicion de cuantizaciones (tensor transplant sobre pesos ya cuantizados) que permite modificar el comportamiento del modelo sin recalcular la cuantizacion ni aumentar el tamano del fichero mas de un 0,2 por ciento. Segundo, por su naturaleza "uncensored" y abliterated, esta pensado explicitamente para tareas de red-teaming y evaluacion de seguridad, un nicho donde la mayoria de modelos alineados no son utiles. La licencia es swift-open-license-1.0, no estandar, y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 48 capas; multimodal imagen-texto |
| Parametros totales | 176.943.899.520 (aprox. 177B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiquetado como "long-context" sin cifra publicada) |
| Tipos de cuantizacion | Q2_0 (61,9 GB), IQ2_XS, IQ3_XXS, IQ3_S (77,8 GB) |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (identificador "other") |
| Formato de pesos | GGUF (libreria gguf, runtime llama-cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos de 48 capas y unos 177.000 millones de parametros totales, segun los ficheros safetensors del modelo base. El pipeline declarado es image-text-to-text, por lo que incorpora un componente de vision que permite aceptar imagenes como entrada ademas de texto. El modelo es un derivado: parte de Qwen3.8-Flash-Next, pasa por el ajuste de eficiencia de razonamiento de Swift 1.5 y se publica como cuantizacion GSQ-RCO en formato GGUF. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica de esta ficha concreta no esta en el entrenamiento, sino en la edicion de los pesos ya cuantizados. Se llama "tensor transplant": en lugar de recalcular la cuantizacion, el autor sustituye 144 tensores que escriben de vuelta en el residual stream por sus equivalentes de una version abliterated ya existente. Cada tensor se verifica con blake2b y los valores y escalas GSQ originales se mantienen intactos, de modo que la huella del fichero crece menos de un 0,2 por ciento. El proceso descrito conserva la eficiencia de razonamiento del Swift 1.5 original (un 34,8 por ciento menos de tokens que el modelo base). La model card menciona tambien una cuantizacion aprendida GSQ con asignacion de presupuesto RCO e imatrix, sin aportar mas detalles sobre el algoritmo.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento explicito con modo de pensamiento eficiente: la familia Swift 1.5 consume alrededor de un 52 por ciento menos de tokens de razonamiento en benchmarks de codigo.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text), con la salvedad de que no se detallan las tareas multimodales concretas soportadas.
- Generacion de codigo y razonamiento sobre problemas tecnicos, dado el enfoque de eficiencia de tokens en benchmarks de programacion.
- Soporte de contexto largo por etiquetado del modelo ("long-context"), sin cifra de tokens publicada.
- Comportamiento "uncensored" y abliterated: la direccion de rechazo ha sido eliminada, por lo que responde a peticiones que un modelo alineado declinaria.
- Uso orientado a red-teaming y evaluacion de seguridad.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente en la informacion disponible.

## Casos de uso

- Red-teaming de modelos y sistemas de moderacion: al haber eliminado la direccion de rechazo, el modelo puede generar contenido adversario, prompts maliciosos y casos limite que sirven para probar clasificadores de seguridad y filtros de contenido en pipelines de evaluacion.
- Pruebas de alineacion y robustez: investigadores en seguridad pueden comparar las respuestas de esta version abliterated con la del modelo alineado equivalente para medir el efecto real del mecanismo de rechazo en distintas categorias de prompt.
- Analisis de documentos largos multilingues: el etiquetado de contexto largo y el soporte de ingles y chino permiten resumir y extraer informacion de contratos, informes tecnicos o corpus bilingues en una sola pasada, sin trocear el documento.
- Asistencia de programacion con eficiencia de tokens: la reduccion de tokens de razonamiento en tareas de codigo abarata el coste por consulta en entornos donde se factura por token generado, util en integraciones dentro de editores o pipelines de revision de codigo.
- Procesamiento de capturas y diagramas tecnicos: la entrada imagen-texto permite describir diagramas de arquitectura, leer capturas de pantalla de errores o extraer texto de imagenes dentro de flujos de documentacion tecnica.
- Despliegue en local sobre hardware de gama alta: al estar en GGUF y con cuantizaciones de 2 a 3 bits, se puede ejecutar con llama.cpp u Ollama en maquinas con suficiente VRAM o RAM, evitando enviar datos sensibles a APIs externas.
- Generacion de datos sinteticos para fine-tuning: su comportamiento sin rechazo facilita producir datasets de instrucciones y conversaciones dificiles de obtener con modelos censurados, siempre que el uso cumpla la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra de rendimiento aportada por el autor es de eficiencia, no de calidad: el modelo conserva la eficiencia de razonamiento de Swift 1.5, situandose un 34,8 por ciento por debajo del modelo base en consumo de tokens de pensamiento, y la familia Swift 1.5 declara un uso de aproximadamente un 52 por ciento menos de tokens de razonamiento en benchmarks de codigo. No se facilitan resultados de MMLU, HumanEval, GSM8K ni de tareas multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa entre 61,9 GB (Q2_0) y 77,8 GB (IQ3_S); hay que sumar el KV cache, que con contexto largo puede anadir varias decenas de GB, por lo que se recomienda reservar bastante mas que el tamano del fichero.
- GPU recomendadas: no hay cifras oficiales; por tamano, configuraciones multi-GPU de 80 GB (A100, H100) o de 48 GB (L40S, A6000) son las opciones realistas para cargar el modelo completo en VRAM.
- Consumer GPU: no cabe en una unica GPU de consumo actual (24 GB) en ninguna de las cuantizaciones publicadas; solo es viable con offloading parcial a RAM del sistema mediante llama.cpp, con una penalizacion notable de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio y cualquier runtime compatible con GGUF; no esta pensado para vLLM ni TGI, que no consumen GGUF de forma nativa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| cc1244578151/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated | 177B | no disponible | GGUF (Q2_0 a IQ3_S) | swift-open-license-1.0 | Version abliterated con transplante de 144 tensores |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 177B | no disponible | GGUF | swift-open-license-1.0 | Cuantizacion upstream, sin abliterar |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | 177B | no disponible | safetensors | no disponible | Modelo base completo antes de cuantizar |
| ukisai/Swift-Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Base declarada del modelo, con ajuste de eficiencia de razonamiento |

No se dispone de datos de benchmark que permitan comparar la calidad frente a modelos externos de la misma categoria. La comparativa se limita, por tanto, a la propia familia de derivados.

## Limitaciones y advertencias

- Al estar abliterated, el modelo carece de la direccion de rechazo, lo que implica que puede producir contenido danino, ilegal o inseguro. Debe usarse en entornos controlados y con supervision.
- Riesgo de alucinacion elevado, como en cualquier modelo generativo; no se ha publicado ninguna evaluacion de fidelidad.
- Las cuantizaciones de 2 y 3 bits (Q2_0, IQ2_XS) degradan la calidad respecto a los pesos completos de forma notable; los resultados deben validarse antes de usar el modelo en produccion.
- La eliminacion del rechazo puede haber alterado otras capacidades, ya que los tensores transplantados afectan al residual stream de las 48 capas.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- No se especifica la longitud de contexto real soportada, solo la etiqueta "long-context".
- No se documentan capacidades de tool calling ni de agente, por lo que no deberia asumirse que funcionan correctamente.
- Licencia swift-open-license-1.0, no estandar y con identificador "other": es imprescindible leer sus terminos antes de cualquier uso comercial, ya que puede incluir restricciones de uso, atribucion o redistribucion.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- La fecha de creacion indicada es 2026-10-14; conviene verificar el estado del repositorio y de la model card, que aparece truncada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cc1244578151/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated
- Modelo base declarado: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Modelo base adicional indicado en la ficha: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Cuantizacion upstream GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/LICENSE
- README en chino simplificado: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
