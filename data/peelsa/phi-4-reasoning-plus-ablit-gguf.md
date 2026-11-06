# peelsa/phi-4-reasoning-plus-ablit-GGUF

## Resumen

`peelsa/phi-4-reasoning-plus-ablit-GGUF` es la cuantizacion en formato GGUF del modelo `peelsa/phi-4-reasoning-plus-ablit`, una version del `microsoft/Phi-4-reasoning-plus` a la que se le ha aplicado una tecnica de "ablacion de rechazo" (refusal ablation): se proyecta fuera de los pesos una direccion de rechazo, sin entrenamiento ni fine-tuning adicional. El resultado es un modelo de razonamiento de 14.659.507.200 parametros que conserva la arquitectura y el comportamiento del original, pero con una menor tendencia a negarse a responder.

El modelo base Phi-4-reasoning-plus es un transformer denso de Microsoft orientado a tareas de razonamiento complejo, con modo de "pensamiento" explicito (secciones think y solution en la plantilla de chat) y una ventana de contexto de 32.768 tokens. Esta version GGUF esta pensada para ejecutarse en llama.cpp y otros runtimes compatibles con GGUF (arquitectura interna `phi3`), lo que facilita su despliegue en hardware de consumo y en entornos sin GPU de datacenter.

La relevancia de esta ficha radica en que combina tres factores poco habituales: un modelo de razonamiento de ~14,7B con contexto de 32K, una cuantizacion Q4_K_M generada con importance matrix (imatrix) sobre WikiText-2, y una licencia MIT que permite uso comercial. Todo ello con la advertencia de que se trata de una modificacion no oficial del modelo de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura GGUF `phi3`); modelo base Phi-4-reasoning-plus |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (4,94 bits por peso; `output.weight` en Q6_K, embeddings en Q4_K) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (un unico archivo `phi-4-reasoning-plus-ablit-Q4_K_M.gguf`, 9,06 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 14,7 mil millones de parametros, heredado directamente de `microsoft/Phi-4-reasoning-plus`. La model card no detalla la composicion del dataset de entrenamiento original ni el numero de tokens, por lo que esos datos deben consultarse en la documentacion de Microsoft. Lo que si se especifica es el proceso de ablacion: los pesos de `peelsa/phi-4-reasoning-plus-ablit` se obtuvieron proyectando una unica direccion de rechazo fuera de los pesos del modelo base, sin entrenamiento, sin fine-tuning, sin adaptadores y sin codigo anadido. El repositorio GGUF contiene unicamente tensores, metadatos y la plantilla de chat original sin modificar.

La cuantizacion se realizo con llama.cpp en formato Q4_K_M, empleando una importance matrix calculada sobre WikiText-2 para preservar los pesos mas sensibles. El resultado son 4,94 bits por peso de media, con la capa de salida (`output.weight`) en Q6_K y los embeddings de tokens en Q4_K. La plantilla de chat de Phi (con las secciones `think` y `solution`) esta embebida en el archivo, lo que permite usarlo directamente en llama-server y runtimes equivalentes. El SHA-256 del archivo es `a9f3616197161a0e8d36ace3f203ef6aa7245c52902d60d359c2b19b856cd21a`.

## Capacidades

- Generacion de texto conversacional y de razonamiento multi-paso, con modo de pensamiento explicito (seccion `think` seguida de `solution`).
- Razonamiento matematico y logico, heredado del modelo Phi-4-reasoning-plus de Microsoft.
- Generacion de codigo y asistencia en tareas de programacion.
- Soporte de conversaciones multi-turno gracias a la ventana de 32.768 tokens.
- Capacidad de "refusal ablation": el modelo presenta una menor tendencia a rechazar peticiones que el original, segun la descripcion del autor.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que permite servirlo mediante APIs compatibles con OpenAI en runtimes GGUF.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (el modelo es solo de texto).

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas paso a paso mostrando la cadena de pensamiento en la seccion `think`, util para tutoria educativa o verificacion de calculos en entornos de investigacion.
- Generacion de codigo en local: al ejecutarse en llama.cpp con Q4_K_M (9,06 GB), puede integrarse en flujos de desarrollo sin GPU de datacenter, por ejemplo para autocompletado o revision de parches en un portatil con GPU de consumo.
- Analisis de documentos largos: con 32.768 tokens de contexto, admite resumir o extraer informacion de contratos, articulos o informes de decenas de paginas en una sola pasada.
- Asistencia conversacional multi-turno: adecuado para prototipos de chatbots donde se requiere mantener contexto extenso de la conversacion sin truncamientos agresivos.
- Investigacion sobre alineacion y rechazo: al ser una version con ablacion de rechazo, sirve como objeto de estudio para analizar como afecta la eliminacion de una direccion de rechazo al comportamiento del modelo, comparandolo con el Phi-4-reasoning-plus original.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT permite incorporar el modelo en productos comerciales o pipelines internos sin las restricciones de otras licencias de modelos abiertos.
- Evaluacion comparativa de cuantizaciones: el uso de imatrix sobre WikiText-2 lo hace util para medir la perdida de calidad de Q4_K_M frente a los pesos originales en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base, y no se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,1 GB solo para los pesos en Q4_K_M; con overhead de contexto de 32.768 tokens conviene reservar entre 11 y 13 GB en total.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) o superiores; en A100/H100 cabe con holgura y permite mayor paralelismo.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090), asi como en Mac con memoria unificada de 16 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-server -m phi-4-reasoning-plus-ablit-Q4_K_M.gguf -ngl 99 -c 32768`), Ollama y cualquier runtime compatible con GGUF y arquitectura `phi3` (por ejemplo, LM Studio o text-generation-webui).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| peelsa/phi-4-reasoning-plus-ablit-GGUF | 14,66B | 32.768 | MIT | GGUF Q4_K_M | Ablacion de rechazo, cuantizado con imatrix |
| microsoft/Phi-4-reasoning-plus | ~14,7B (no confirmado en esta ficha) | no disponible | MIT (segun el autor del GGUF) | safetensors | Modelo original de Microsoft, sin ablacion |
| peelsa/phi-4-reasoning-plus-ablit | 14,66B | 32.768 (segun el GGUF) | MIT | safetensors | Version sin cuantizar del mismo modelo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion de rechazo elimina una direccion del espacio de pesos, lo que puede reducir la capacidad del modelo para negarse ante peticiones daninas o inapropiadas; no debe desplegarse en produccion sin capas adicionales de moderacion.
- Se trata de una modificacion no oficial de un modelo de Microsoft; el autor no garantiza equivalencia de comportamiento con el original y no hay evaluaciones publicadas de la perdida de calidad.
- Riesgo de alucinacion inherente a los modelos de razonamiento: las cadenas de pensamiento pueden contener pasos plausibles pero incorrectos.
- Idiomas soportados no documentados; el rendimiento en castellano no esta verificado.
- El contexto maximo es de 32.768 tokens; superarlo provoca truncamiento o degradacion.
- Solo se ofrece una cuantizacion (Q4_K_M); no hay variantes Q8_0, Q5_K_M ni Q2_K en el repositorio, lo que limita el ajuste fino entre calidad y memoria.
- La licencia MIT se declara en la model card, pero conviene verificar los terminos del modelo base de Microsoft antes de un uso comercial.
- El repositorio tiene muy poca traccion (26 descargas, 0 likes) y fue creado en octubre de 2026; no hay validacion comunitaria del archivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peelsa/phi-4-reasoning-plus-ablit-GGUF
- Modelo base sin cuantizar: https://huggingface.co/peelsa/phi-4-reasoning-plus-ablit
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-4-reasoning-plus
