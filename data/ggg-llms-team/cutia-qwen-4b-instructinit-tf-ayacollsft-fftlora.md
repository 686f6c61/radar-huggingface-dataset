# ggg-llms-team/CutIA-Qwen-4B-InstructInit-TF-ayacollsft-fftlora

## Resumen

CutIA-Qwen-4B-InstructInit-TF-ayacollsft-fftlora es un ajuste fino (fine-tuning) experimental publicado por el usuario ggg-llms-team sobre el modelo g4me/CutIA-Qwen-4B-InstructInit-TF, que a su vez deriva de la familia Qwen3. Con 4.411.424.256 parametros, se trata de un modelo causal de lenguaje de aproximadamente 4B, empaquetado en formato safetensors y con un repositorio de 50,6 GB, lo que sugiere la presencia de pesos en precision completa y posiblemente multiples checkpoints o estados del entrenamiento.

El nombre del checkpoint indica dos tecnicas de entrenamiento combinadas: un ajuste supervisado (SFT, "ayacollsft") y un LoRA de ajuste completo ("fftlora"), aplicadas sobre una inicializacion instructiva del modelo base. La model card es minima: solo documenta el uso estandar con Transformers y advierte explicitamente que se trata de un checkpoint experimental, sin publicar detalles de dataset, hiperparametros ni evaluacion.

Su relevancia es limitada y de nicho: al no contar con licencia declarada, idiomas documentados, benchmarks ni pipeline definido, debe tratarse como un artefacto de investigacion reproducible mas que como un modelo listo para produccion. Resulta util para quien quiera inspeccionar el efecto de un SFT con LoRA sobre una base Qwen3 de 4B, pero no como sustituto directo de los modelos Qwen3 oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), familia Qwen3, derivada del modelo base g4me/CutIA-Qwen-4B-InstructInit-TF |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 50,6 GB |
| Modelo base | g4me/CutIA-Qwen-4B-InstructInit-TF |
| Metodo de ajuste | SFT + LoRA (segun el nombre del checkpoint: "ayacollsft-fftlora") |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer causal decoder-only de la familia Qwen3, heredada del modelo base g4me/CutIA-Qwen-4B-InstructInit-TF. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion, tipo de atencion (completa o hibrida con attention lineal) ni vocabulario. El dato objetivo disponible es el recuento de parametros en safetensors: 4.411.424.256.

En cuanto al entrenamiento, el identificador del checkpoint sugiere una secuencia de ajuste supervisado (SFT) seguida o combinada con un LoRA de ajuste completo ("fftlora") sobre la inicializacion instructiva del modelo base. No se publican el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF o DPO, ni hiperparametros del LoRA (rango, alpha, modulos objetivo). El autor describe el resultado como "checkpoint experimental", sin innovaciones tecnicas documentadas como decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto autoregresiva en formato causal-lm, segun la etiqueta del repositorio.
- Herencia potencial de las capacidades de la familia Qwen3 (razonamiento, codigo y matematicas), aunque no se documenta ninguna evaluacion que lo confirme.
- Soporte de conversacion multi-turno presumible por la inicializacion instructiva del modelo base, no verificado en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre ajuste fino con LoRA: el checkpoint permite reproducir y analizar el efecto de un SFT con LoRA sobre una base Qwen3 de 4B, comparando respuestas antes y despues del ajuste en tareas controladas.
- Experimentacion academica con modelos de 4B: util como sujeto de estudio en trabajos sobre alineacion, olvido catastrofico o retencion de capacidades tras el fine-tuning, dado su tamano manejable en una sola GPU.
- Pruebas de pipeline con Transformers: sirve para validar flujos de carga con AutoModelForCausalLM y AutoTokenizer antes de migrar a modelos mas grandes, ya que el codigo de uso esta documentado en la model card.
- Evaluacion comparativa de checkpoints derivados: al existir un modelo base identificado, puede emplearse en estudios de regresion que midan cuanto se degrada o mejora el rendimiento respecto a la inicializacion.
- Prototipado interno de asistentes de texto: en entornos sin requisitos de licencia comercial, puede usarse para demos de generacion de texto, siempre con validacion manual de las salidas por la ausencia de benchmarks.
- Base para nuevos ajustes: su naturaleza de checkpoint intermedio lo hace adecuado como punto de partida para experimentos posteriores de SFT o DPO dentro del mismo grupo de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9 GB solo para pesos (4,41B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB para pesos; en 4 bits, alrededor de 3 GB, aunque no se distribuyen pesos cuantizados en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a precision completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con comodidad; GPUs de 16 GB (RTX 4080, A4000) para inferencia con contextos cortos.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bf16 y en tarjetas de 8 GB si se cuantiza a 8 o 4 bits, si bien habria que generar esas cuantizaciones a partir de los safetensors.
- Opciones de despliegue: Transformers (documentado por el autor), vLLM y TGI para servir en bf16; llama.cpp u Ollama requeririan convertir previamente los pesos a GGUF.
- Latencia y throughput: no disponibles. El repositorio de 50,6 GB implica una descarga considerable antes del primer uso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CutIA-Qwen-4B-InstructInit-TF-ayacollsft-fftlora | 4,41B | no disponible | no disponible | Hugging Face, checkpoint experimental | SFT + LoRA sobre base Qwen3 de 4B |
| Qwen3-4B (oficial) | ~4B | no disponible en esta ficha | Apache 2.0 (familia Qwen3) | Hugging Face, ampliamente desplegado | Referencia oficial con model card completa y benchmarks publicados |
| g4me/CutIA-Qwen-4B-InstructInit-TF | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que deriva este checkpoint |
| Llama 3.2 3B Instruct | ~3B | 128K (segun documentacion oficial de Meta) | Licencia comunitaria Llama 3.2 | Hugging Face, ecosistema amplio | Alternativa de tamano similar con soporte y evaluaciones publicas |

La comparativa se limita a parametros y disponibilidad porque el checkpoint analizado no publica contexto, licencia ni resultados de evaluacion; los datos de los modelos alternativos corresponden a su documentacion oficial y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no puede asumirse permiso de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Model card minima sin dataset, hiperparametros ni evaluacion: imposible estimar la calidad del ajuste o el grado de olvido catastrofico respecto al modelo base.
- Riesgo de alucinacion no cuantificado: al no haber benchmarks, no puede acotarse la fiabilidad en tareas de razonamiento, codigo o matematicas.
- Idiomas no documentados: no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas distintos del que se uso en el ajuste.
- Contexto maximo desconocido: no debe asumirse la ventana nativa de Qwen3 sin verificacion empirica.
- Checkpoint experimental con 0 descargas y 0 likes: sin validacion por parte de la comunidad, sin issues ni discusiones que permitan detectar fallos conocidos.
- Repositorio de 50,6 GB: coste de almacenamiento y descarga elevado para un modelo de 4B, probablemente por pesos en precision completa y estados adicionales.
- Sin pipeline declarado: la integracion automatica en Hugging Face (widget de inferencia) no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggg-llms-team/CutIA-Qwen-4B-InstructInit-TF-ayacollsft-fftlora
- Modelo base: https://huggingface.co/g4me/CutIA-Qwen-4B-InstructInit-TF
- Perfil del autor: https://huggingface.co/ggg-llms-team
