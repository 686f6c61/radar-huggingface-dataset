# rooty2020/Qwen3.5-9B-ti5k-pairsum-LoRA

## Resumen

Qwen3.5-9B-ti5k-pairsum-LoRA es un adaptador LoRA (PEFT) publicado por el usuario rooty2020 (Byungwoo Jeon) sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (86,6 millones de parametros entrenables, con la torre de vision excluida) que se aplica sobre el checkpoint `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del modelo base. El repositorio ocupa 0,3 GB y se distribuye en formato safetensors compatible con la libreria `peft`.

El adaptador se ha entrenado con un objetivo contrastivo denominado "pairsum" (loss pairsum, beta 0,1, lam 1,0) sobre el dataset `yanghs1018/ti_5k`, con 23.488 filas que se agrupan en 16.198 grupos de entrenamiento y 835 grupos de validacion. El proposito declarado es ajustar las representaciones del modelo base para una tarea de emparejamiento o comparacion de pares, no para generacion generalista. Es relevante porque ilustra un caso de ajuste contrastivo sobre un modelo multimodal de 9B con infraestructura de gran escala (4x NVIDIA GH200 de 120 GB en CSCS Clariden).

La informacion publica es escasa: no hay model card extendida, no se declaran idiomas, licencia ni pipeline, y el repositorio tiene cero descargas y cero likes en el momento de la consulta. Cualquier evaluacion de produccion debe partir de la validacion reportada por el autor y de la replicacion independiente del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-9B; rango 32, alpha 64 |
| Parametros totales | 86,6 M entrenables en el adaptador (el modelo base no se distribuye en este repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de transformers, no documentadas aqui) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre Qwen3.5-9B, un modelo multimodal de la familia Qwen3.5 que en la practica de uso se carga con `AutoModelForImageTextToText`, lo que confirma que el base incluye torre de vision. El LoRA usa rango 32 y alpha 64, con 86,6 millones de parametros entrenables excluyendo explicitamente la torre de vision, de modo que el ajuste afecta a las capas de lenguaje y no a la codificacion visual.

El entrenamiento emplea un objetivo contrastivo "pairsum" con beta 0,1 y lam 1,0, learning rate 1e-5, batch global 32, una sola epoca y semilla 0. Los log-probabilities de referencia se calcularon en el mismo hardware que el entrenamiento, detalle relevante para la reproducibilidad numerica. Se ejecuto durante 14 h 08 min en 4x NVIDIA GH200 de 120 GB (CSCS Clariden, aarch64) con torch 2.11.0, transformers 5.14.1 y peft 0.20.0. El checkpoint publicado corresponde al paso 507 de 507. El repositorio incluye un directorio `training/` con `config.json`, `RUN.json`, `STATUS`, `train.log` y los logs por rango, lo que permite auditar la ejecucion.

## Capacidades

- Ajuste contrastivo para emparejamiento y comparacion de pares sobre representaciones del modelo base; la model card no documenta tareas generativas especificas.
- Hereda del base Qwen3.5-9B las capacidades multimodales (entrada de imagen y texto), aunque la torre de vision queda congelada y fuera del adaptador.
- No se documenta soporte de tool calling ni function calling en el adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso especifico del adaptador.
- Capacidades multilingues: no disponibles; dependen del modelo base y no se declaran.
- No se declara modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Busqueda semantica y deduplicacion de pares: el adaptador se entrena con un objetivo contrastivo sobre grupos de pares, por lo que es adecuado para puntuar similitud entre dos entradas y decidir si pertenecen al mismo grupo, integrandose en un pipeline de recuperacion sobre el base Qwen3.5-9B.
- Clasificacion y ranking de candidatos: dado un par (consulta, documento), el adaptador puede producir una puntuacion de emparejamiento util para reordenar resultados de un motor de busqueda ya existente.
- Verificacion de equivalencia entre registros: en tareas de calidad de datos, permite comprobar si dos filas de un catalogo describen la misma entidad, apoyandose en la validacion reportada de 0,8917 de exactitud a nivel de ejemplo.
- Ajuste fino de representaciones para dominios concretos: sirve como plantilla reproducible (config, logs y script de entrenamiento publicados) para replicar el objetivo pairsum sobre otros datasets con el mismo base.
- Investigacion en aprendizaje contrastivo multimodal: al excluir la torre de vision del adaptador, permite estudiar el efecto del ajuste exclusivamente en el lado del lenguaje sin alterar el codificador visual.
- Evaluacion de tecnicas PEFT a escala 9B: el repositorio documenta el coste real (14 h 08 min en 4x GH200) y las curvas de validacion, lo que lo hace util como referencia de coste para planificar entrenamientos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la validacion interna sobre 835 grupos del dataset `yanghs1018/ti_5k`:

| Paso | val_loss | val_acc | val_acc_group | val_z |
|---|---|---|---|---|
| 0 | 0,9654 | 0,5013 | 0,4275 | 0,000 |
| 100 | 0,3819 | 0,8796 | 0,8347 | 2,852 |
| 200 | 0,3113 | 0,8917 | 0,8515 | 4,538 |
| 300 | 0,2916 | 0,8874 | 0,8467 | 4,588 |
| 400 | 0,2840 | 0,8925 | 0,8539 | 4,852 |
| 500 | 0,2835 | 0,8968 | 0,8611 | 4,984 |
| 507 | 0,2845 | 0,8917 | 0,8527 | 4,986 |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,3 GB, pero requiere cargar el base Qwen3.5-9B completo; en bfloat16 el base ronda los 18 GB de pesos, a los que se suman activaciones y cache KV.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o GH200 120 GB para bfloat16 sin cuantizar; el autor entreno en 4x GH200 120 GB, pero la inferencia cabe en una sola GPU de 24-48 GB con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizacion de 8 bits o inferior del base; en RTX 3090/4080 (16-24 GB) requiere cuantizacion mas agresiva y puede limitar el contexto efectivo.
- Opciones de despliegue: carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`); para servicio en produccion puede combinarse con vLLM o TGI si se fusiona el adaptador en el base, o con llama.cpp/Ollama solo tras conversion a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-ti5k-pairsum-LoRA (este) | 86,6 M entrenables sobre base 9B | no disponible | LoRA contrastivo (pairsum) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible en la informacion | Modelo multimodal completo | no disponible en la informacion | Hugging Face |
| Otros adaptadores LoRA contrastivos sobre Qwen | no disponible | no disponible | LoRA contrastivo | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros adaptadores comparables en la informacion proporcionada, por lo que la comparacion se limita a la relacion con el modelo base.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar Qwen3.5-9B en la revision exacta `c202236235762e1c871ad0ccb60c8ee5ba337b9a`; usar otra revision puede invalidar el adaptador.
- Especifico de tarea: el objetivo pairsum y el dataset `ti_5k` condicionan su utilidad; no esta pensado para generacion abierta ni para instrucciones generales.
- Sesgos: no documentados; al entrenarse sobre un unico dataset de 23.488 filas, puede heredar y amplificar los sesgos de ese corpus.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el adaptador no incluye salvaguardas propias.
- Idiomas y contexto: no declarados; cualquier afirmacion sobre cobertura linguistica o longitud de contexto debe verificarse contra el modelo base.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que consultar la licencia del base Qwen3.5-9B y del dataset antes de desplegar.
- Repositorio con 0 descargas y 0 likes: sin validacion externa ni reportes de terceros; la unica evidencia de calidad son las metricas de validacion del autor.
- La validacion se limita a 835 grupos del mismo dataset de entrenamiento; no hay evaluacion out-of-distribution.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/rooty2020/Qwen3.5-9B-ti5k-pairsum-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/yanghs1018/ti_5k
- Perfil del autor: https://huggingface.co/rooty2020/models
