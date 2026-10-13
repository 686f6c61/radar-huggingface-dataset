# siddharthmb/2026.TA.l1c_headline_2026-10_o_bridge0_tc8192_decb_l1w0.001_fp32_tarbb_lb0_ln1_sl17827426

## Resumen

Este repositorio no contiene un modelo de lenguaje autónomo, sino un adaptador de transcoder disperso (sparse transcoder adapter) entrenado sobre el modelo congelado google/gemma-2-2b. Lo desarrolla siddharthmb, con afiliación a Stanford segun las rutas de cluster y la cuenta de Weights & Biases reflejadas en la ficha. La idea central es que cada capa MLP del modelo base incorpora una rama ReLU adicional de la forma `dec(relu(enc(x)))`, y esa rama se entrena en modo "bridging" para que el conjunto modelo base mas rama reproduzca el comportamiento de google/gemma-2-2b-it. En otras palabras, el adaptador destila el ajuste por instrucciones dentro de un mecanismo interno disperso y auditable, en lugar de un ajuste fino opaco.

El interes tecnico esta en el enfoque de interpretabilidad: en vez de un LoRA o un fine-tuning convencional, las "features" aprendidas son las propias unidades dispersas del transcoder (8.192 por MLP, con regularizacion L1 de 0,001), lo que permite inspeccionarlas, atribuirlas y manipularlas individualmente. La model card documenta incluso el "steering" de una feature concreta mediante su cantor id y la generacion de grafos de atribucion con GemmaScope, lo que lo convierte en una herramienta de analisis de diferencias entre modelos (model diffing) mas que en un modelo de produccion al uso.

El checkpoint ocupa 9,2 GB y declara 3.596.141.824 parametros en sus safetensors (el modelo base tiene 2,6 mil millones, por lo que la rama anade aproximadamente mil millones). Fue entrenado en una unica epoca sobre splits de lmsys-chat-1m, con un job de Slurm lanzado el 12 de octubre de 2026, y esta asociado al paper "Transcoder Adapters for Reasoning-Model Diffing" (arXiv:2602.20904).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformer decoder-only) mas rama transcoder ReLU `dec(relu(enc(x)))` en cada MLP; arquitectura declarada en la ficha: `gemma2` |
| Parametros totales | 3.596.141.824 (dato real de los safetensors, incluyendo el modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; el modelo base google/gemma-2-2b soporta 8.192 tokens |
| Tipos de cuantizacion | no disponible (checkpoint entrenado en fp32; no se documentan variantes GGUF, GPTQ, AWQ ni bitsandbytes) |
| Idiomas soportados | no disponible (el modelo base google/gemma-2-2b es multilingue, pero la ficha no especifica cobertura) |
| Licencia | no disponible (el modelo base se distribuye bajo los terminos de Gemma, que aplican a los derivados) |
| Formato de pesos | safetensors (libreria transformers); el adaptador se carga con las clases propias del repositorio |
| Tamano del repositorio | 9,2 GB |
| Modelo base | google/gemma-2-2b |
| Modelo de referencia (destilado) | google/gemma-2-2b-it |
| Tokenizer | google/gemma-2-2b-it |
| Numero de features | 8.192 (`n_features`) |
| Modo de entrenamiento | bridging |
| Dataset | siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits |
| Paper | arXiv:2602.20904 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina un transformer Gemma 2 congelado con una rama de transcoder dispersa insertada en cada capa MLP. El transcoder sigue el esquema encoder-ReLU-decoder: `dec(relu(enc(x)))`, con `n_features = 8192` y sesgo en el decoder (`dec_bias = True`). La dispersión se induce mediante una penalizacion L1 con `l1_weight = 0.001`, de modo que solo un subconjunto pequeno de features se activa para cada entrada. El backbone se mantiene en modo `target` y la atencion y los embeddings se toman del modelo de referencia, de forma que, al desactivar la rama con `set_transcoders_enabled(False)`, se obtiene un modelo hibrido con los MLP del base y la atencion y embeddings del modelo instruido.

El entrenamiento se realizo en modo "bridging": el objetivo es que base mas rama iguale a google/gemma-2-2b-it. La funcion de perdida es KL divergence (`loss_type: kl`), con `lambda_adapt = 1.0`, `lambda_bridge = 0` y `lambda_nmse = 1`, `n_cutoffs = 0`, learning rate 8e-4, batch size 4, una epoca, warmup ratio 0,05 y 40.000 pasos de datos (`dr40000`). Se empleo el tokenizer de la version instruct del modelo. La innovacion destacable no es de eficiencia de inferencia, sino de interpretabilidad: las features aprendidas son unidades dispersas inspeccionables, el autor permite el steering de features concretas por su cantor id (`--steer CANTOR_ID:STRENGTH`) y ofrece construccion de grafos de atribucion integrados con GemmaScope para trazar que features contribuyen a cada prediccion.

## Capacidades

- Generacion de texto conversacional: al estar destilado desde gemma-2-2b-it, reproduce el comportamiento de chat del modelo instruido de referencia, con una tasa de acuerdo top-1 del 86,77 % en las posiciones evaluadas.
- Alineacion con el modelo instruido en las posiciones donde el base y la referencia discrepan: alcanza un acuerdo top-1 del 72,12 % en el subconjunto "interesting" (15.464 posiciones), que es donde la rama debe aportar el ajuste.
- Inspeccion de features internas: cada unidad del transcoder es direccionable e interpretable, lo que permite analisis de activaciones y atribucion.
- Steering de comportamiento mediante intervencion directa sobre features identificadas por su cantor id.
- Generacion de grafos de atribucion (attribution graphs) con soporte de GemmaScope.
- Recuperacion del modelo hibrido sin rama (atencion y embeddings del modelo de referencia mas MLP del base) mediante `set_transcoders_enabled(False)`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (heredadas, en su caso, del modelo base).
- Vision, audio o modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: el adaptador permite estudiar que features dispersas codifican el ajuste por instrucciones, comparando activaciones entre el modelo base y el instruido sobre las mismas entradas. Es el caso de uso principal declarado por el autor.
- Model diffing entre variantes de un mismo modelo: sirve para cuantificar y localizar que cambios introduce el ajuste por instrucciones respecto al base, con metricas de divergencia KL y acuerdo top-1 desagregadas por posicion.
- Auditoria de comportamiento en produccion conversacional: al ser un artefacto pequeno y con features inspectables, permite justificar por que el modelo genera una respuesta concreta, algo inviable con un fine-tuning denso convencional.
- Control fino de estilo o contenido en generacion: el steering por cantor id permite activar o ampliar una feature concreta (`--steer CANTOR_ID:STRENGTH`) para modular la salida sin reentrenar.
- Analisis de fallos del modelo instruido: los grafos de atribucion permiten rastrear que componentes internos contribuyen a una prediccion erronea, util para depuracion de sistemas de chat desplegados.
- Experimentos academicos de destilacion dispersa: el repositorio incluye `train_config.yaml`, el comando exacto de entrenamiento y el manifiesto del run (job Slurm 17827426), lo que facilita reproducir o variar el metodo con otro modelo base.
- Docencia y formacion en seguridad de IA: sirve como ejemplo didactico de como convertir un fine-tuning opaco en un conjunto de features auditables y manipulables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion reportada son metricas de tokens frente al modelo de referencia google/gemma-2-2b-it sobre 200 muestras y 34.100 tokens de datos reservados (held-out):

| Metrica | Valor |
|---|---|
| kl_mean | 0,1356833577156067 |
| kl_mean_interesting | 0,242045 |
| top1_agreement | 0,867713 |
| top1_agreement_interesting | 0,721159 |
| n_interesting | 15.464 |
| n_samples | 200 |
| n_tokens | 34.100 |
| per_benchmark/lmsys_chat/kl_mean | 0,1356833577156067 |
| per_benchmark/lmsys_chat/top1_agreement | 0,867713 |

Las variantes `*_interesting` restringen el calculo a las posiciones donde el modelo base y el de referencia discrepan, es decir, aquellas en las que la rama tiene que aportar el ajuste. Valores mas bajos de KL y mas altos de acuerdo indican una reproduccion mas fiel del fine-tuning. No se proporcionan comparaciones con otros adaptadores sobre las mismas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 3.596.141.824 parametros declarados: aproximadamente 14,4 GB en fp32, 7,2 GB en bf16/fp16, 3,6 GB en int8 y 1,8-2 GB en 4 bits. No se documentan variantes cuantizadas oficiales, por lo que las estimaciones para int8 y 4 bits son teoricas.
- El repositorio ocupa 9,2 GB en disco, lo que sugiere una mezcla de precisiones en los safetensors; hay que verificar la configuracion real antes de planificar VRAM.
- GPU consumer: cabe en una RTX 4090 (24 GB) en fp32 o bf16, y en tarjetas de 8-12 GB solo si se aplica cuantizacion no documentada. Tambien cabe en una RTX 3090 (24 GB) o RTX 4080 (16 GB) en bf16.
- GPU de datacenter: A100 40 GB y 80 GB, H100 80 GB, L40S 48 GB; el modelo es lo bastante pequeno como para servir varias instancias por GPU.
- Opciones de despliegue: el adaptador requiere las clases propias del repositorio (`models.auto.load_transcoder_model`) porque no es un checkpoint transformers estandar, pese a la etiqueta `transformers`. Se carga con `device_map="auto"`. No hay soporte confirmado en vLLM, llama.cpp, Ollama ni TGI; estos motores no reconocerian la rama transcoder.
- Se menciona `text-generation-inference` entre las etiquetas del Hub y la compatibilidad con `endpoints_compatible`, pero la ficha no detalla una ruta de despliegue estandar, asi que conviene tratarlo como no verificado.
- Latencia y throughput estimados: no disponibles. Al anadir una rama de 8.192 features por cada MLP sobre un modelo de 2,6 mil millones de parametros, el coste de inferencia es superior al del base sin rama, pero no se publican mediciones.
- Entorno de entrenamiento: se ejecuto en un cluster Slurm (nodo jagupard34.stanford.edu), con el framework propio `transcoder-adapters` instalado via `uv`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (siddharthmb, sobre gemma-2-2b) | 3.596.141.824 (base + rama) | no disponible | Destilacion dispersa e interpretable del ajuste por instrucciones | no disponible | HuggingFace, con codigo propio |
| google/gemma-2-2b | 2.600 millones aprox. | 8.192 tokens | Modelo base preentrenado | Terminos de Gemma | HuggingFace |
| google/gemma-2-2b-it | 2.600 millones aprox. | 8.192 tokens | Modelo ajustado por instrucciones | Terminos de Gemma | HuggingFace |
| google/gemma-2-9b | 9.000 millones aprox. | 8.192 tokens | Modelo base de mayor escala | Terminos de Gemma | HuggingFace |

La comparacion no es homogenea: este adaptador no es un modelo autonomo, sino un artefacto de analisis que se anade a gemma-2-2b y usa la atencion y los embeddings de gemma-2-2b-it. No se dispone de comparaciones publicadas frente a alternativas equivalentes de tipo sparse autoencoder o transcoder de otros autores en las mismas metricas, por lo que no es posible establecer una comparativa de rendimiento cuantitativa con la informacion disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el codigo del repositorio `transcoder-adapters` y las clases `models.auto`; no se puede cargar con un `AutoModelForCausalLM` estandar ni con la mayoria de los motores de inferencia.
- Licencia no declarada en el Hub. Al derivar de google/gemma-2-2b y google/gemma-2-2b-it, los terminos de uso de Gemma son aplicables y deben revisarse antes de cualquier uso comercial; la ficha no aclara condiciones adicionales.
- Idiomas soportados no especificados. Cualquier afirmacion sobre cobertura multilingue depende del modelo base y no esta verificada para este adaptador.
- Longitud de contexto no especificada en la ficha. No se debe asumir la ventana de 8.192 tokens del base sin comprobarlo en la configuracion del checkpoint.
- Riesgo de alucinacion y sesgos: no hay evaluacion publicada de sesgos ni de tasas de alucinacion para este adaptador; se heredan en gran medida los del modelo base y los del dataset lmsys-chat-1m, que es una fuente de conversaciones reales con la variabilidad y los sesgos que ello implica.
- Rendimiento imperfecto en la destilacion: el acuerdo top-1 es del 86,77 % en todas las posiciones y cae al 72,12 % en las posiciones donde base y referencia discrepan, y la divergencia KL en ese subconjunto sube a 0,242. No reproduce fielmente el modelo instruido en todos los casos.
- Evaluacion limitada: solo 200 muestras y 34.100 tokens de un unico benchmark (lmsys_chat). No hay validacion en tareas de razonamiento, codigo o matematicas.
- Repositorio practicamente sin adopcion: cero descargas y cero likes en el momento de redactar esta ficha, lo que limita la evidencia de terceros sobre su funcionamiento.
- El identificador del modelo esta truncado en el Hub; el nombre completo incluye sufijos adicionales (`dr40000_lr8e-04_bs4_sl17827426`), lo que puede causar confusion al referenciarlo en scripts.
- Entrenado con una sola epoca y regularizacion L1 agresiva (0,001), por lo que la seleccion de features activas puede ser sensible a la semilla y al dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.l1c_headline_2026-10_o_bridge0_tc8192_decb_l1w0.001_fp32_tarbb_lb0_ln1_sl17827426
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia y tokenizer: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Paper (Transcoder Adapters for Reasoning-Model Diffing): https://arxiv.org/abs/2602.20904
- Pagina del proyecto: https://transcoder-adapters.github.io/
- Codigo: https://github.com/Sid-MB/transcoder-adapters
- Run de Weights & Biases: https://wandb.ai/siddharth-stanford/sparse-adaptation/runs/gvtici7p
- Configuracion de entrenamiento: train_config.yaml (incluido en el repositorio del modelo)
