# Privoid-ai/Privoid-Confidential-1B-GGUF

## Resumen

Privoid-Confidential-1B-GGUF es la distribucion en formato GGUF del modelo Privoid-ai/Privoid-Confidential-1B, un ajuste fino mediante LoRA fusionado sobre ibm-granite/granite-4.0-1b. Lo desarrolla Privoid-ai y esta orientado a una tarea muy concreta: la clasificacion de confidencialidad y el cumplimiento de politicas (policy-following) sobre conversaciones, devolviendo decisiones estructuradas en JSON junto con los fragmentos de evidencia que las justifican. El modelo base Granite 4.0 1B es un transformer denso de IBM con licencia Apache-2.0.

El interes de esta publicacion no esta en el tamano (1.631.750.144 parametros, es decir, aproximadamente 1,6 mil millones) sino en dos aspectos practicos. Por un lado, ofrece una tarea acotada con un contrato de entrada/salida bien definido (`build_messages`, `validate_output`, `postprocess`, `OUTPUT_JSON_SCHEMA`) y evaluacion sobre un conjunto de test bloqueado de 2.274 ejemplos. Por otro, documenta un problema reproducible de cuantizacion en los GGUF de Granite 4.0 1B: cuando todos los tensores se cuantizan, el modelo genera salida basura si el prompt contiene el token `<|end_of_text|>`, algo que la plantilla de chat emite tras cada turno. La solucion aplicada es mantener los tensores `ffn_down` en bf16.

El resultado son dos ficheros (Q8_0 y Q4_K_M) pensados para llama.cpp, LM Studio y runtimes compatibles, con un rendimiento medido de 130-156 tokens/s de decodificacion y 4.995-5.283 tokens/s de prompt en una RTX 3060. Es, por tanto, un modelo pequeno, especializado y desplegable en hardware de consumo, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de IBM Granite 4.0 1B); ajuste LoRA fusionado |
| Parametros totales | 1.631.750.144 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de uso de llama-server emplea `-c 2560` |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (con tensores `ffn_down` en bf16); existe tambien un GGUF bf16 usado como origen |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (modelo base IBM Granite 4.0 1B, Apache-2.0) |
| Formato de pesos | GGUF (para llama.cpp, LM Studio y runtimes compatibles); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de IBM Granite 4.0 1B: un transformer denso de aproximadamente 1,6 mil millones de parametros. Sobre esa base, Privoid-ai entrena un adaptador LoRA orientado a una tarea de decision de confidencialidad y seguimiento de politicas, que posteriormente se fusiona en los pesos del modelo base para producir Privoid-Confidential-1B. La model card de esta version GGUF no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion se remite a la model card del modelo principal.

El aspecto tecnico mas relevante documentado en esta publicacion es el diagnostico de cuantizacion. Con todos los tensores cuantizados, los GGUF de Granite 4.0 1B —incluido el Q4_K_M oficial de IBM— producen salida incorrecta cuando el prompt contiene `<|end_of_text|>`, token que la plantilla de chat emite despues de cada turno. El fallo se reprodujo en llama.cpp b6850, b10970 y b11767, tanto en CPU como en Vulkan. Mantener unicamente los tensores `ffn_down` en bf16 restaura la salida correcta; los ficheros se generaron con `llama-quantize --tensor-type ffn_down=bf16`. Ademas, la plantilla de chat incrustada en los GGUF renderiza exactamente el mismo prompt que el tokenizer de Transformers, verificado mediante `/apply-template`.

## Capacidades

- Generacion de texto orientada a una tarea especifica: decision de confidencialidad y cumplimiento de politicas sobre conversaciones.
- Salida estructurada en JSON conforme a `OUTPUT_JSON_SCHEMA`, con validacion posterior mediante `contract.validate_output` y `contract.postprocess`.
- Extraccion de evidencia: el modelo devuelve fragmentos de evidencia que sustentan la decision (evaluado con evidence span F1).
- Decodificacion restringida por JSON-schema mediante `response_format` con `type: json_schema`.
- Integracion con llama.cpp y LM Studio a traves de `/v1/chat/completions` (endpoints compatibles con la API de OpenAI).
- Capacidad multilingue limitada al ingles (`language: en`).
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido en la informacion proporcionada.

## Casos de uso

- Clasificacion de confidencialidad en atencion al cliente: el modelo recibe el system prompt y el mensaje de usuario construidos por `build_messages` y devuelve una decision JSON con la evidencia correspondiente, lo que permite enrutar o redactar conversaciones segun su nivel de confidencialidad con validacion automatica de la salida.
- Cumplimiento normativo en pipelines de datos: integrado como paso previo al almacenamiento o la exportacion de registros conversacionales, etiqueta cada intercambio segun la politica interna y adjunta los fragmentos que justifican la decision para auditoria.
- Filtrado previo a modelos mayores: al ser un modelo de 1,6 B con inferencia a 130-156 tokens/s en una RTX 3060, puede actuar como primera barrera que descarta o marca conversaciones antes de enviarlas a un modelo de mayor coste.
- Despliegue en local o en el borde: los ficheros Q4_K_M (1,46 GB, pico de RSS de 1,64 GB) y Q8_0 (2,05 GB, pico de 2,22 GB) permiten ejecutar la clasificacion en estaciones de trabajo con GPU de consumo o incluso en CPU, sin enviar datos sensibles a servicios externos.
- Moderacion y policy-following en plataformas conversacionales: la evaluacion sobre el conjunto bloqueado (96,8% de exactitud de decision con Q4_K_M) respalda su uso como clasificador de politicas con umbrales de confianza definidos por el operador.
- Generacion de registros estructurados para trazabilidad: gracias a la decodificacion restringida por JSON-schema y a la validacion con `validate_output`, la salida puede insertarse directamente en bases de datos o sistemas de ticketing sin postprocesado manual adicional.
- Evaluacion de cumplimiento en entornos de desarrollo: el contrato (`build_messages`, `validate_output`, `postprocess`) facilita pruebas de regresion automatizadas del comportamiento del modelo en CI.

## Benchmarks y rendimiento

Datos publicados en la model card del repositorio GGUF. Las cifras de desarrollo corresponden al mismo scorer que el modelo principal (98,6% para el adaptador sin cuantizar).

| Metrica | Q8_0 | Q4_K_M |
|---|---|---|
| Exactitud de decision (dev) | 98,6% | 97,9% |
| Salida cruda valida (dev) | 100,0% | 100,0% |
| Tamano del fichero | 2,05 GB | 1,46 GB |
| Decodificacion (tok/s, llama-bench tg128) | 130 | 156 |
| Prompt (tok/s, pp2048) | 4.995 | 5.283 |
| Pico de RSS | 2,22 GB | 2,22 GB (Q8_0) / 1,64 GB (Q4_K_M) |

Conjunto de test bloqueado (2.274 ejemplos), Q4_K_M: exactitud de decision 96,8%, evidence span F1 0,929, salida cruda valida 99,7%. El adaptador sin cuantizar obtiene 96,9% y 0,941 en las mismas metricas.

Mediciones realizadas con llama.cpp (build Vulkan b10970) sobre 1x NVIDIA GeForce RTX 3060. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 2,5 GB para Q8_0 y en torno a 1,7 GB para Q4_K_M, segun los picos de RSS reportados (2,22 GB y 1,64 GB respectivamente).
- GPU recomendadas: cualquier GPU con al menos 3 GB de VRAM libre; las mediciones oficiales se hicieron en una NVIDIA GeForce RTX 3060. Modelos como RTX 3060, RTX 4060, RTX 4090 o A100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna, y tambien en CPU (el fallo de cuantizacion se reprodujo tanto en CPU como en Vulkan).
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio y runtimes compatibles con GGUF y con endpoints de la API de OpenAI. Ejemplo oficial: `llama-server -m privoid-confidential-1b-Q4_K_M.gguf --jinja -c 2560 -ngl 99`.
- Latencia y throughput: 130 tok/s (Q8_0) y 156 tok/s (Q4_K_M) en decodificacion; 4.995 y 5.283 tok/s en procesamiento de prompt (pp2048) en una RTX 3060.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Privoid-Confidential-1B-GGUF | 1,63 B | no disponible | Clasificacion de confidencialidad y policy-following | Apache-2.0 | GGUF |
| ibm-granite/granite-4.0-1b | no disponible en la informacion proporcionada | no disponible | Modelo base de proposito general | Apache-2.0 | safetensors y GGUF |
| Privoid-ai/Privoid-Confidential-1B | 1,63 B | no disponible | Version sin cuantizar del mismo ajuste | Apache-2.0 | safetensors |

No se dispone de datos de benchmarks comparativos frente a otros clasificadores de confidencialidad de tamano similar en la informacion proporcionada. La comparacion mas directa posible es con el modelo base Granite 4.0 1B, del que este modelo hereda arquitectura y licencia, y con la version sin cuantizar del mismo ajuste, que obtiene 96,9% de exactitud de decision y 0,941 de evidence span F1 frente al 96,8% y 0,929 del Q4_K_M.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de proposito general; su utilidad fuera de la tarea de decision de confidencialidad y policy-following no esta documentada.
- Solo ingles: la model card declara unicamente `en` como idioma soportado, por lo que el rendimiento en castellano u otros idiomas no esta validado.
- Riesgo de alucinacion en la evidencia: aunque la salida se valida contra un JSON-schema, los fragmentos de evidencia extraidos deben verificarse contra el texto original; el evidence span F1 de 0,929 (Q4_K_M) implica que no todas las evidencias son exactas.
- Dependencia del contrato de entrada: el modelo espera el system prompt y el mensaje de usuario construidos por `build_messages` y una temperatura de 0; desviarse de ese contrato puede degradar la calidad de la decision.
- Caveat de cuantizacion: los GGUF de Granite 4.0 1B con todos los tensores cuantizados fallan ante `<|end_of_text|>`; si se regeneran los ficheros, es necesario mantener `ffn_down` en bf16 o verificar la salida con la plantilla de chat real.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; el ejemplo oficial limita `-c` a 2560, por lo que no debe asumirse una ventana larga.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso NOTICE correspondiente al modelo base IBM Granite 4.0 1B.
- Madurez: el repositorio registra 91 descargas y 0 likes en el momento de la consulta, lo que sugiere una validacion externa limitada.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Privoid-ai/Privoid-Confidential-1B-GGUF
- Modelo principal (sin cuantizar): https://huggingface.co/Privoid-ai/Privoid-Confidential-1B
- Modelo base IBM Granite 4.0 1B: https://huggingface.co/ibm-granite/granite-4.0-1b
