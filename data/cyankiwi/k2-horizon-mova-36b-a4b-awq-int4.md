# cyankiwi/K2-Horizon-MoVA-36B-A4B-AWQ-INT4

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por IFM, que introduce una variante de atención denominada Mixture-of-Values attention (MoVA). El modelo se presenta como el miembro disperso de la familia K2-Horizon: almacena 36.000 millones de parámetros y activa aproximadamente 4.000 millones por token, con una ventana de contexto nativa de 524.288 tokens (512K) desde las fases de midtraining.

La ficha que nos ocupa, `cyankiwi/K2-Horizon-MoVA-36B-A4B-AWQ-INT4`, no es el modelo original, sino una cuantización AWQ INT4 publicada por el usuario cyankiwi sobre el checkpoint base `IFM/K2-Horizon-MoVA-36B-A4B`. El repositorio pesa 24,24 GB y usa el formato `compressed-tensors` de Hugging Face, por lo que reduce de forma notable los requisitos de memoria frente a los pesos en BF16, a costa de requerir un fork específico de vLLM para ejecutar los expertos de valor (`self_attn.v_experts.*`) cuantizados.

Su relevancia actual reside en dos factores: por un lado, promete resultados de gama alta en tareas agénticas y de razonamiento con solo 4B de parámetros activos; por otro, el autor anuncia la publicación completa de datos de entrenamiento, receta y código, además de checkpoints intermedios. La licencia Apache 2.0 facilita su uso comercial, aunque la disponibilidad de tooling está condicionada por la novedad de la arquitectura MoVA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) y atencion Mixture-of-Values (MoVA); requiere `custom_code` |
| Parametros totales | 36B segun la nomenclatura del autor; el repo safetensors de esta cuantizacion declara 7.525.081.140 (~7,5B) |
| Parametros activos | ~4B por token (sufijo A4B) |
| Longitud de contexto | 524.288 tokens (512K) nativos desde midtraining |
| Tipos de cuantizacion | AWQ INT4 con formato `compressed-tensors` (esta variante); el modelo base se distribuye en precision completa |
| Idiomas soportados | La model card lista EN, ZH, HI, AR, RU, JA, KO, NL, FR y ES; los tags de Hugging Face solo declaran `en` |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, INT4) |

Nota: el numero de parametros declarado en el repositorio safetensors (7,5B) no coincide con los 36B que indica el nombre del modelo ni con el tamano del repo (24,24 GB). El dato de safetensors es el unico verificable en la informacion disponible; la discrepancia se documenta en la seccion de limitaciones.

## Arquitectura y entrenamiento

La arquitectura combina un esquema MoE disperso con MoVA en el mecanismo de atencion. La nomenclatura "36B-A4B" indica 36.000 millones de parametros totales y unos 4.000 millones activos por token, lo que situa al modelo en la categoria de MoE de activacion reducida. El autor indica que los checkpoints intermedios, los datos de entrenamiento y el codigo de entrenamiento se publicaran, ademas del checkpoint final ya liberado. Los conjuntos de datos declarados en la model card son `IFM/K2-Horizon-Pretrain-Data` y `IFM/K2-Horizon-Midtrain-Data`, que cubren las fases de preentrenamiento y midtraining.

La innovacion destacable es MoVA: los expertos de valor de la atencion (`self_attn.v_experts.*`) se enrutan como expertos, algo que se aparta del transformer denso convencional y que en esta cuantizacion se almacenan en INT4 mediante `compressed-tensors`. Este detalle tiene consecuencias practicas importantes: vLLM estandar puede cargar los pesos, pero no puede ejecutar los expertos de valor cuantizados, por lo que el autor publica un fork propio de vLLM (rama `k2-mova-quant-v-experts`). No hay informacion disponible sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF, DPO u otras tecnicas de alineamiento posteriores al preentrenamiento.

## Capacidades

- Generacion de texto conversacional, con `pipeline_tag` de `text-generation` y etiqueta `conversational`.
- Razonamiento y tareas agénticas: la model card afirma resultados competitivos en benchmarks agénticos y de razonamiento, superando segun el autor a modelos densos abiertos de ~30B y a MoE hasta 15 veces mayores.
- Manejo de contexto muy largo: 524.288 tokens nativos, adecuado para documentos extensos, repositorios de codigo completos o historiales de conversacion prolongados.
- Capacidades multilingues segun la model card (EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES), aunque el tag oficial de idioma en Hugging Face solo indica ingles.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el modelo se declara de texto.
- Despliegue como modelo de pesos abiertos con licencia Apache 2.0, con posibilidad de servir en vLLM mediante el fork indicado.

## Casos de uso

- Atencion al cliente automatizada: la ventana de 512K tokens permite mantener historiales de conversacion muy largos y adjuntar bases de conocimiento completas sin trocear el contexto, reduciendo la perdida de informacion entre turnos.
- Agentes autonomos multi-paso: al estar optimizado para cargas agénticas segun el autor, encaja en orquestadores que encadenan llamadas a herramientas, planificacion y verificacion de resultados dentro de un mismo contexto extenso.
- Analisis de repositorios de codigo: con 512K tokens se puede introducir un arbol de proyecto de tamano medio y realizar tareas de explicacion, refactorizacion o deteccion de inconsistencias sin recurrir a recuperacion externa.
- Procesamiento de documentacion legal o tecnica: resumen y extraccion de clausulas sobre contratos o manuales extensos, donde el contexto largo evita la fragmentacion y las perdidas de coherencia entre secciones.
- Asistentes de investigacion: sintesis de articulos cientificos y comparacion de metodologias en un unico contexto, con la ventaja de que el modelo puede mantener el hilo entre documentos relacionados.
- Evaluacion de modelos y estudios de escalado: la publicacion anunciada de checkpoints intermedios, datos y receta de entrenamiento lo convierte en un candidato para investigar como evolucionan las capacidades a lo largo del entrenamiento, algo poco habitual en modelos de pesos abiertos.
- Despliegue en infraestructura limitada: gracias a la cuantizacion INT4 y a la activacion de ~4B parametros por token, el coste de inferencia es sustancialmente menor que el de un modelo denso de 36B, lo que lo hace atractivo para servir en GPUs de gama alta de una sola unidad.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativa (bloque `TABLE:START`), pero el contenido proporcionado esta truncado y no expone las cifras numericas. La tabla compara el modelo con Nemotron 3 Ultra, Nemotron 3 Super, G9v3-39A5B, Qwen3.6-35B-A3B y Muse Glimmer-30B, agrupados bajo la categoria de modelos de pesos abiertos.

| Modelo comparado | Resultados numericos |
|---|---|
| K2-Horizon-MoVA-36B-A4B | no disponible (tabla truncada) |
| Nemotron 3 Ultra | no disponible |
| Nemotron 3 Super | no disponible |
| G9v3-39A5B | no disponible |
| Qwen3.6-35B-A3B | no disponible |
| Muse Glimmer-30B | no disponible |

No se han publicado resultados de benchmarks numericos en la informacion disponible. Cualquier cifra concreta de MMLU, HumanEval, GSM8K u otros conjuntos debe consultarse directamente en la model card original en Hugging Face.

## Requisitos de hardware

- Peso de los pesos cuantizados: 24,24 GB de repositorio, correspondientes al checkpoint INT4. A esta cifra hay que anadir el overhead de runtime y, sobre todo, la cache KV.
- VRAM estimada para inferencia: en el entorno de 26-30 GB solo para pesos y overhead basico; la cache KV a 512K tokens puede anadir varias decenas de gigabytes, por lo que el contexto completo exige multi-GPU o estrategias de cache agresivas. El numero de capas, cabezas y dimension de cabeza no esta disponible, por lo que no se puede calcular con precision el tamano del KV cache.
- GPUs recomendadas: A100 40/80 GB y H100 para servir contextos largos; en consumer, una RTX 4090 (24 GB) queda al limite y probablemente no permite el contexto maximo sin cuantizar la cache KV.
- Compatibilidad consumer: ajustado. El modelo entra en GPUs de 24 GB solo para cargas con contexto corto y sin margen amplio. Los kernels AWQ INT4 requieren arquitecturas Ampere o posteriores.
- Opciones de despliegue: vLLM mediante el fork del autor (rama `k2-mova-quant-v-experts`), ya que vLLM estandar carga los pesos pero no ejecuta los expertos de valor cuantizados. Soporte en llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada, y poco probable a corto plazo dado el `custom_code` y el formato `compressed-tensors`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B (esta ficha, variante AWQ INT4) | 36B totales / ~4B activos | 524.288 tokens | apache-2.0 | Pesos en HF, vLLM mediante fork | Referencia de la tabla; cifras no disponibles |
| Qwen3.6-35B-A3B | 35B totales / ~3B activos (segun nomenclatura) | no disponible | no disponible | no disponible | Incluido en la tabla comparativa; cifras no disponibles |
| Nemotron 3 Ultra | no disponible | no disponible | no disponible | no disponible | Incluido en la tabla comparativa; cifras no disponibles |
| Nemotron 3 Super | no disponible | no disponible | no disponible | no disponible | Incluido en la tabla comparativa; cifras no disponibles |
| G9v3-39A5B | 39B totales / ~5B activos (segun nomenclatura) | no disponible | no disponible | no disponible | Incluido en la tabla comparativa; cifras no disponibles |
| Muse Glimmer-30B | 30B (segun nomenclatura) | no disponible | no disponible | no disponible | Incluido en la tabla comparativa; cifras no disponibles |

La informacion disponible solo aporta los nombres de los modelos comparados y su inclusion en la tabla de la model card, sin especificaciones ni cifras verificables. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre sus alternativas.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: el repositorio safetensors declara 7.525.081.140 parametros, muy lejos de los 36B que sugiere el nombre. Es imprescindible verificar este punto en la model card original antes de planificar cualquier despliegue.
- Ejecucion no estandar: los expertos de valor de la atencion (`self_attn.v_experts.*`) estan cuantizados con `compressed-tensors` y vLLM estandar no puede ejecutarlos. Sin el fork indicado, el modelo carga pero no infiere correctamente.
- Riesgo de alucinacion: no hay informacion sobre alineamiento (RLHF, DPO) ni sobre evaluaciones de veracidad, por lo que el riesgo es desconocido y debe mitigarse con verificacion externa.
- Idiomas: la model card lista diez idiomas, pero el tag oficial de Hugging Face solo declara ingles. El rendimiento real en castellano u otros idiomas no esta documentado.
- Cuantizacion INT4: la reduccion a 4 bits puede degradar tareas sensibles a la precision numerica, como matematicas o generacion de codigo, respecto al checkpoint base en precision completa. La calibracion declarada es "STEM and Agentic".
- Contexto largo en la practica: aunque el contexto nativo es de 512K tokens, sostenerlo requiere memoria de cache KV muy elevada, por lo que el limite efectivo dependera del hardware y de la estrategia de serving.
- Estado del ecosistema: el modelo es muy reciente (repositorio creado el 12 de septiembre de 2026) y sin descargas ni valoraciones, con soporte limitado a un fork mantenido por el propio autor de la cuantizacion.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar si el modelo base `IFM/K2-Horizon-MoVA-36B-A4B` impone condiciones adicionales, ya que no se detallan en la informacion proporcionada.
- Madurez del proyecto: el autor anuncia la publicacion de datos, receta, codigo y checkpoints intermedios, lo que implica que parte del material prometido todavia no esta disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyankiwi/K2-Horizon-MoVA-36B-A4B-AWQ-INT4
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Dataset de calibracion de la cuantizacion: https://huggingface.co/datasets/cyankiwi/calibration
- Fork de vLLM con soporte para expertos de valor cuantizados: https://github.com/cyankiwi/vllm (rama `k2-mova-quant-v-experts`)
- Banner del autor: https://huggingface.co/buckets/cyankiwi/activation-aware-2.0/resolve/banner/cyankiwi-banner-awq-0.png
- Contacto del autor: ton@cyan.kiwi

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo, su paper, su repositorio de entrenamiento ni demos publicas.
