# luvette/Aion-1.0-Instruct-2.3B-abliterated

## Resumen

Aion-1.0-Instruct-2.3B-abliterated es un checkpoint derivado del modelo `microsoft/Aion-1.0-Instruct-2.3B`, un SLM (small language model) denso de 2.288.831.488 parametros disenado por Microsoft para inferencia on-device en Windows. La modificacion, publicada por el usuario luvette, aplica una pasada de "abliteration" (ablacion de la direccion de rechazo) sobre los pesos en precision completa mediante la herramienta heretic v2.1.0, sin fine-tuning ni reentrenamiento: es una edicion a nivel de pesos que suprime el comportamiento de rechazo manteniendo, segun el autor, la misma capacidad y velocidad que el modelo original.

El modelo base emplea una arquitectura transformer densa de 28 capas con hidden size 2048, atencion GQA (24 cabezas de query, 8 de key/value, head_dim 128), 21 capas con sliding-window attention de 2048 tokens y 7 capas de atencion completa con RoPE theta=32000 y YaRN x16, vocabulario de 200.029 tokens y embeddings atados. Soporta una ventana de contexto de 32K tokens.

Su relevancia es doble: por un lado documenta un caso de uso de modelos pequenos orientados a dispositivo (2,3B parametros, ~1,4 GB en Q4_K_M) y, por otro, ejemplifica los riesgos de las tecnicas de abliteration, que eliminan deliberadamente las salvaguardas de rechazo. El autor lo presenta explicitamente como checkpoint experimental de investigacion, no como asistente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con GQA; 28 capas (21 sliding-window de 2048 + 7 full-attention), hidden 2048, head_dim 128, RoPE theta=32000 con YaRN x16 en capas full, embeddings atados |
| Parametros totales | 2.288.831.488 (2,29B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q8_0, Q4_K_M (publicadas); otras cuantizaciones GGUF posibles via llama-quantize |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors (BF16, 4,6 GB), GGUF (Q8_0 2,4 GB, Q4_K_M 1,4 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 2,29B parametros con atencion de grupos de consultas (GQA), combinando 21 capas de atencion de ventana deslizante de 2048 tokens con 7 capas de atencion completa. Las capas completas aplican RoPE con theta=32000 y escalado YaRN x16, lo que habilita el contexto de 32K. El vocabulario es de 200.029 tokens y los embeddings de entrada y salida estan atados. El modelo base fue desarrollado por Microsoft para ejecucion on-device en Windows; no se dispone de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La modificacion de este checkpoint consiste en una ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) ejecutada con heretic v2.1.0. La herramienta optimiza deltas de bajo rango por tensor para suprimir la conducta de rechazo minimizando la divergencia KL sobre prompts inofensivos. Los parametros del proceso (ensayo Optuna 70/100) fueron: capas 11-23, `preserve_good_behavior_weight=0.9486`, `overcorrect_relative_weight=1.0185`, `neighbor_count=10` y `steer_bad_behavior_weight≈0.0001`. No se fusiona ningun adaptador LoRA: `model.safetensors` es el checkpoint completamente fusionado. El tokenizer, la plantilla de chat y el codigo de modelado personalizado son identicos a los del modelo original.

## Capacidades

- Generacion de texto conversacional en modo instruct, con plantilla de chat compatible con el modelo base.
- Razonamiento basico, matematicas, geometria, generacion de codigo y reescritura de texto (validado en un panel de 7 casos segun el autor).
- Recuperacion de informacion en contextos largos: supera la prueba de needle retrieval con 32K tokens.
- Inferencia on-device de baja latencia gracias a su tamano reducido y a las cuantizaciones GGUF disponibles.
- Ejecucion en llama.cpp mediante un parche de portabilidad para la arquitectura `aion_instruct`, y en transformers con `trust_remote_code=True`.
- Supresion del comportamiento de rechazo: 0/5 rechazos en el panel de prompts daninos del autor (frente a 5/5 del modelo base) y 0% en el scorer de heretic con n=100.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el checkpoint permite estudiar empiricamente el efecto de la ablacion de la direccion de rechazo sobre un modelo pequeno, comparando con el modelo base en condiciones controladas.
- Analisis de robustez de filtros de seguridad: util para evaluar si los sistemas de moderacion externos detectan respuestas que un modelo abliterated produce sin rechazo previo.
- Inferencia on-device en entornos controlados: con Q4_K_M (1,4 GB) cabe en GPUs de consumo y permite ejecutar un modelo de 32K de contexto en portatiles o estaciones de trabajo sin conexion.
- Procesamiento de texto por lotes en local: tareas de reescritura, resumen o clasificacion sobre documentos largos gracias a la ventana de 32K, en pipelines donde no se requiere filtrado de seguridad.
- Desarrollo y pruebas de integraciones llama.cpp: sirve como caso de prueba de la arquitectura `aion_instruct` y del parche de portabilidad en builds personalizados.
- Evaluacion comparativa de cuantizaciones: los ficheros Q8_0 y Q4_K_M permiten medir el impacto de la cuantizacion en calidad y throughput sobre el mismo checkpoint.
- No debe emplearse en atencion al cliente, asistentes para usuarios no confiables ni ningun escenario donde se exija filtrado de contenido danino.

## Benchmarks y rendimiento

| Metrica | Modelo base | aion-2.3b-abliterated |
|---|---:|---:|
| Decodificacion single-stream, RTX 3070 (Q4_K_M) | ~200 tok/s | 210,5 tok/s |
| Prefill de 512 tokens | ~9,4k tok/s | ~9,5k tok/s |
| Needle retrieval con contexto de 32K | pasa | pasa |
| Panel de rechazo, prompts daninos | 5/5 | 0/5 |
| Rechazos (scorer heretic, n=100) | 100% | 0% |
| Divergencia KL en prompts inofensivos | 0 | 0,039 |
| Panel de capacidad (matematicas/geometria/codigo/reescritura, n=7) | 7/7 | 7/7 |

Los paneles de evaluacion son pequenos (n=5-100 por celda) y el propio autor advierte que deben interpretarse como orientativos, no como benchmarks formales. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~1,4 GB para Q4_K_M y ~2,4 GB para Q8_0, mas overhead del contexto KV (hasta 32K tokens).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3070 8 GB es la referencia medida por el autor. Para mayor throughput, GPU con mayor ancho de banda de memoria (la decodificacion esta limitada por ancho de banda).
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 3070, RTX 4060 y superiores con 8 GB o mas.
- Despliegue: llama.cpp (`llama-server` con `-ngl 99 -c 32768 -fa on --jinja`) requiere compilar master con el parche `aion-port.patch` de AtomicChat; en transformers, fijar `transformers>=5.18,<5.19` y `trust_remote_code=True`. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: ~210 tok/s en decodificacion single-stream y ~9,5k tok/s en prefill de 512 tokens sobre RTX 3070 con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| luvette/Aion-1.0-Instruct-2.3B-abliterated | 2,29B | 32K | MIT | Checkpoint abliterated; rechazo 0/5 |
| microsoft/Aion-1.0-Instruct-2.3B | 2,29B | 32K | MIT | Modelo base alineado; rechazo 5/5; misma velocidad |
| AtomicChat/Aion-1.0-Instruct-2.3B-GGUF | 2,29B | 32K | MIT | Cuantizaciones GGUF del modelo base, incluye variantes imatrix |

No se dispone de datos de benchmarks estandar que permitan comparar con otras familias de modelos de tamano similar (por ejemplo, Qwen2.5-3B o Llama-3.2-3B) en la informacion proporcionada.

## Limitaciones y advertencias

- Reduccion deliberada del comportamiento de rechazo: el modelo responde a peticiones daninas en el 100% de los casos del panel del autor. No debe desplegarse donde se requiera filtrado de seguridad ni con usuarios no confiables.
- La abliteration perturba los pesos y puede introducir regresiones sutiles de capacidad por debajo de la resolucion de los paneles de evaluacion (n=7).
- Riesgo de alucinacion inherente a un modelo de 2,3B; no se ha medido formalmente.
- Idiomas soportados no documentados; el rendimiento fuera del ingles es desconocido.
- Las cuantizaciones GGUF son conversiones planas con `llama-quantize`, sin importance matrix, lo que puede degradar la calidad respecto a variantes imatrix.
- Requiere software especifico: llama.cpp con parche de portabilidad y transformers con version fijada; el codigo personalizado del KV-cache presenta regresiones en transformers >=5.24.
- Derivado no oficial, sin afiliacion con Microsoft; el autor lo etiqueta como checkpoint experimental de investigacion.
- Licencia MIT heredada, que permite uso comercial, pero el uso comercial de un modelo sin salvaguardas de rechazo conlleva riesgos legales y reputacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luvette/Aion-1.0-Instruct-2.3B-abliterated
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Cuantizaciones GGUF del modelo base (AtomicChat): https://huggingface.co/AtomicChat/Aion-1.0-Instruct-2.3B-GGUF
- Parche de portabilidad para llama.cpp: https://huggingface.co/AtomicChat/Aion-1.0-Instruct-2.3B-GGUF/blob/main/aion-port.patch
- Herramienta heretic: https://github.com/p-e-w/heretic
