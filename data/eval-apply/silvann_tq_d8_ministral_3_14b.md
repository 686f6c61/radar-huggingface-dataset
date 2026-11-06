# eval-apply/silvann_tq_D8_ministral_3_14b

## Resumen

`eval-apply/silvann_tq_D8_ministral_3_14b` es un empaquetado cuantizado del modelo `mistralai/Ministral-3-14B-Instruct-2512` de Mistral AI, preparado por el usuario eval-apply para el motor de inferencia SiLVANN (Eval-Apply GPU Interpreter y su librería de redes neuronales). No se trata de un modelo nuevo ni de un fine-tune: los pesos, tokenizer, chat template, system prompt y configuraciones son los del modelo original; lo único que cambia es el formato de almacenamiento de los pesos.

La cuantización aplicada es TurboQuant a 8 bits por peso en todas las matrices de capa, con una escala por fila y una rotación Hadamard-y-signos bloqueada a lo largo del eje de entrada; embedding y cabeza también a 8 bits, mientras que las normas se mantienen sin pérdida. El sufijo `D8` indica "dense 8", es decir, que el modelo es denso (sin expertos) y todas sus matrices están a 8 bits. El repositorio ocupa unos 13.5 GB e incluye únicamente el modelo de texto: el codificador de visión del Ministral 3 original no está incluido.

El interés de esta ficha es doble: por un lado, documenta una alternativa de despliegue de Ministral 3 14B fuera del ecosistema transformers (el formato `silvann-packed-v3` solo lo lee el runtime de SiLVANN); por otro, sirve como referencia de qué rendimiento cabe esperar de una cuantización a 8 bits con rotaciones en hardware modesto, con cifras medidas por el autor sobre una AMD Instinct MI50.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Ministral 3 14B Instruct; el empaquetado no altera la arquitectura) |
| Parametros totales | 14B (heredados del modelo base; no se detalla desglose en la informacion disponible) |
| Parametros activos | no aplica (modelo denso, sin expertos; el sufijo D8 lo indica) |
| Longitud de contexto | La del modelo base, limitada por la memoria disponible: cada 100 MB de la tarjeta alojan aproximadamente 625 posiciones de contexto |
| Tipos de cuantizacion | 8 bits por peso (TurboQuant) en matrices de capa, embedding y cabeza; normas sin perdida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `silvann-packed-v3` (`pack.json`, `layers/NNN/`, `global.pkl`); no compatible con transformers |

## Arquitectura y entrenamiento

El empaquetado no modifica la arquitectura del modelo base: Ministral 3 14B Instruct es un transformer denso de Mistral AI, el mayor de la familia Ministral 3, descrito por el autor del modelo original como comparable en capacidades a Mistral Small 3.2 24B y con capacidades de visión en su versión completa. La model card de este repositorio no aporta detalles adicionales sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la ficha de `mistralai/Ministral-3-14B-Instruct-2512`.

La innovación técnica de este repositorio es el códec de cuantización: cada matriz de capa se almacena a 8 bits por peso con una escala por fila (TurboQuant) y se rota a lo largo de su eje de entrada mediante una rotación Hadamard-y-signos bloqueada. El embedding y la cabeza se cuantizan también a 8 bits, mientras que las normas se conservan en precisión original. El resultado es un artefacto de unos 13.5 GB que solo puede leerse con el runtime de SiLVANN, no con transformers ni con las herramientas habituales de GGUF o safetensors.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Ministral 3 14B Instruct.
- Capacidades de visión: el modelo base las tiene, pero el codificador de visión no está incluido en este empaquetado, por lo que aquí no están disponibles.
- Tool calling y function calling: no se documenta explícitamente en la model card de este repositorio; debe verificarse en la ficha del modelo base.
- Razonamiento multi-paso y uso como agente: no se documenta explícitamente en este repositorio; depende de las capacidades del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking), audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en hardware AMD antiguo o de gama media: el autor reporta 26 tokens por segundo en decodificación sobre una AMD Instinct MI50, lo que hace de este empaquetado una vía para ejecutar Ministral 3 14B en GPUs con memoria limitada donde un checkpoint en FP8 o BF16 no cabría.
- Inferencia con contexto ajustado a la memoria: la regla de aproximadamente 625 posiciones por cada 100 MB de tarjeta permite dimensionar la ventana de contexto según la VRAM disponible, útil en entornos con presupuesto de memoria fijo.
- Evaluación de la calidad de cuantización a 8 bits: el dato de 0.763 bits por byte en WikiText-2 (16 ventanas de 512 tokens) sirve como referencia para comparar el impacto de TurboQuant frente a otras cuantizaciones a 8 bits.
- Investigación sobre formatos de pesos alternativos: el formato `silvann-packed-v3` y el uso de rotaciones Hadamard-y-signos bloqueadas son un caso de estudio para quienes exploran codecs de cuantización fuera del ecosistema GGUF/safetensors.
- Prototipado de asistentes conversacionales: al conservar el tokenizer, chat template y system prompt originales, el modelo puede usarse con el mismo formato de conversación que Ministral 3 14B Instruct, siempre que se ejecute sobre el runtime de SiLVANN.
- Reproducción de resultados en entornos con una sola GPU: el escenario medido por el autor (una única MI50) es replicable para validar latencia y perplejidad antes de escalar a otros despliegues.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Bits por byte en WikiText-2 | 0.763 | 16 ventanas de 512 tokens |
| Velocidad de decodificación | 26 tokens/s | Una AMD Instinct MI50 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 13.5 GB en disco; se necesita al menos esa cantidad de memoria para cargar los pesos, más la memoria destinada al contexto (aproximadamente 625 posiciones por cada 100 MB adicionales).
- GPU recomendadas: el autor ha validado el modelo en una AMD Instinct MI50; no se documentan otras GPU probadas.
- GPU de consumo: no se dispone de datos sobre su funcionamiento en tarjetas consumer; con 13.5 GB de pesos, encajaría en GPUs con 16 GB o más de VRAM, pero no está verificado en la información disponible.
- Opciones de despliegue: exclusivamente el runtime de SiLVANN; no es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: 26 tokens/s en decodificación sobre una MI50, según medición del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| silvann_tq_D8_ministral_3_14b | 14B (denso) | El del base, limitado por memoria (~625 posiciones/100 MB) | 8 bits TurboQuant | Apache 2.0 | `silvann-packed-v3` / SiLVANN |
| mistralai/Ministral-3-14B-Instruct-2512 | 14B (denso) | El del modelo original | FP8 (checkpoint instruct post-trained) | Apache 2.0 | safetensors / transformers y ecosistema estándar |
| Mistral Small 3.2 24B | 24B | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | No disponible |

La comparación con Mistral Small 3.2 24B se incluye porque el autor del modelo base lo cita como referencia de rendimiento; no se dispone de datos de benchmarks propios de este empaquetado para contrastarlos.

## Limitaciones y advertencias

- Solo texto: el codificador de visión del Ministral 3 original no está incluido, por lo que las capacidades multimodales no están disponibles en este repositorio.
- Compatibilidad restringida: el formato `silvann-packed-v3` solo lo lee el runtime de SiLVANN; no funciona con transformers, vLLM, llama.cpp, Ollama ni TGI.
- Contexto dependiente de memoria: la ventana útil queda limitada por la VRAM disponible (unas 625 posiciones por cada 100 MB), no por un límite intrínseco documentado del modelo.
- Pérdida por cuantización: aunque las normas se mantienen sin pérdida, las matrices a 8 bits introducen degradación; el único dato objetivo publicado es 0.763 bits por byte en WikiText-2, sin comparación directa con el modelo en FP8 o BF16.
- Idiomas soportados: no documentados en este repositorio; deben consultarse en la ficha del modelo base.
- Sesgos y alucinación: no se documentan sesgos específicos ni evaluaciones de alucinación en la información disponible; se heredan los del modelo base.
- Licencia: Apache 2.0, incluida en el repositorio; el autor original del modelo es Mistral AI y este repositorio solo cambia el almacenamiento de los pesos.
- Madurez: el repositorio tiene 63 descargas y 0 likes, y fue creado y actualizado en octubre y noviembre de 2026; no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D8_ministral_3_14b
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
