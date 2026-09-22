# francesca9805/dan-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/dan-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407` es un ajuste fino (fine-tune) del modelo base `goldfish-models/dan_latn_10mb`, desarrollado por el usuario de HuggingFace `francesca9805`. Se trata de un modelo de generacion de texto de arquitectura tipo GPT-2 (etiqueta `gpt2` en los metadatos) con 39.087.104 parametros totales, un tamano muy reducido que lo situa en la categoria de modelos pequenos orientados a experimentacion e investigacion linguistica, no a produccion generalista.

El modelo ha sido entrenado mediante SFT (supervised fine-tuning) utilizando la libreria TRL de HuggingFace,Partiendo del modelo base `dan_latn_10mb`, que forma parte de la familia Goldfish de modelos por idioma con tokenizadores adaptados a lenguas de bajos recursos. El identificador del modelo sugiere danes en escritura latina (`dan` + `latn`), aunque la model card no declara idiomas de forma explicita. El nombre incluye terminos como `ppt`, `Dp`, `packed` y `bfd_seed3407`, que apuntan a un experimento de investigacion con configuracion concreta de dataset y semilla.

Su relevancia es fundamentalmente academica: se trata de un artefacto de experimentacion vinculado a la Universidad de Groningen (segun la URL del run de Weights & Biases del autor) y con cero descargas y cero "likes" en el momento de la consulta. No hay benchmarks publicados ni documentacion de capacidades adicionales, por lo que debe evaluarse como un punto de partida reproducible mas que como un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en metadatos; sin confirmacion detallada en la model card) |
| Parametros totales | 39.087.104 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; tecnicamente viable a FP32, FP16/BF16, INT8 e INT4 por su tamano |
| Idiomas soportados | no disponible en la model card; el identificador sugiere danes en escritura latina (`dan_latn`) |
| Licencia | no disponible; el campo de la model card contiene el texto generico `licence: license`, sin licencia concreta |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | goldfish-models/dan_latn_10mb |
| Pipeline | text-generation |
| Libreria | transformers |
| Creado / actualizado | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `goldfish-models/dan_latn_10mb`, de la familia Goldfish: modelos GPT-2 reentrenados por idioma con tokenizadores especificos para lenguas de bajos recursos. Los metadatos de este fine-tune incluyen la etiqueta `gpt2`, lo que confirma una arquitectura transformer decoder-only con atencion causal. Con 39,1 millones de parametros, es aproximadamente tres veces mas pequeno que GPT-2 small (124M), lo que sugiere una configuracion reducida de capas y dimensiones respecto al modelo original de OpenAI. La model card no especifica numero de capas, dimension del modelo ni cabezas de atencion.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `new-tokenizers` del autor. El nombre del checkpoint (`ppt-Dp-10mb-packed-bfd_seed3407`) indica un dataset empaquetado (`packed`) de 10 MB, probablemente derivado del corpus de 10 MB del modelo base, con una semilla fija (`seed3407`) para reproducibilidad. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa, ni la composicion exacta del dataset de ajuste.

## Capacidades

- Generacion de texto autoregresiva en el dominio e idioma del modelo base, condicionada por el ajuste SFT recibido.
- Formato de chat: la model card incluye un ejemplo con `pipeline("text-generation", ...)` que pasa una lista de mensajes con rol `user`, lo que indica que el modelo espera una plantilla conversacional.
- Compatibilidad con text-generation-inference y endpoints compatibles (etiqueta `endpoints_compatible`), lo que permite servirlo mediante API HTTP estandar.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidades multilingues: no disponible; el unico indicio es el codigo de idioma del nombre.
- Capacidades de codigo y matematicas: no disponibles y poco probables dado el tamano y el preentrenamiento de 10 MB del modelo base.

## Casos de uso

- Investigacion en modelado de lenguas de bajos recursos: el modelo sirve como punto de comparacion reproducible (semilla fija) para estudiar el efecto del SFT sobre un GPT-2 pequeno entrenado con 10 MB de texto danes.
- Experimentos de ablacion de tokenizadores: el proyecto de W&B asociado se llama `new-tokenizers`, por lo que encaja en estudios sobre como distintos vocabularios afectan al rendimiento en lenguas minoritarias.
- Generacion de texto de ejemplo en demos y cuadernos docentes: con 39M de parametros se ejecuta en CPU sin GPU, lo que lo hace util para ensenar el pipeline de `transformers` en cursos.
- Pruebas de integracion de text-generation-inference: al estar etiquetado como `endpoints_compatible`, permite validar pipelines de despliegue ligeros sin coste de GPU.
- Evaluacion de tecnicas de cuantizacion: por su tamano, es un banco de pruebas barato para medir la degradacion de perplejidad a INT8 e INT4 antes de aplicarlas a modelos mayores.
- Filtrado y puntuacion de texto en danes: si el ajuste ha preservado la competencia linguistica del modelo base, puede usarse para calcular verosimilitud de frases y detectar texto anomalo en corpus daneses.
- Baseline en tareas de continuacion de texto para comparar contra modelos base y otros fine-tunes del mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra), y el run de Weights & Biases enlazado no aporta cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 39,09 millones de parametros: aproximadamente 156 MB en FP32, 78 MB en FP16/BF16, 39 MB en INT8 y 20 MB en INT4, sin contar el overhead del runtime (KV cache y activaciones), que en la practica multiplica estas cifras por un factor pequeno.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; modelos como NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 estan sobradamente dimensionados para este modelo.
- Cabe con enorme holgura en GPU de consumo: cualquier GTX/RTX con 4 GB o mas, e incluso en iGPU modernas.
- Inferencia en CPU: perfectamente viable en un solo nucleo para generar decenas de tokens por segundo; el modelo completo cabe en la cache L3 de muchos procesadores actuales.
- Opciones de despliegue: `transformers` con `pipeline` (documentado por el autor), text-generation-inference (etiqueta `endpoints_compatible`), y despliegue generico en Hugging Face Inference Endpoints. No se incluyen pesos GGUF en el repositorio, por lo que llama.cpp u Ollama requeririan una conversion previa desde safetensors. vLLM es tecnicamente posible pero desproporcionado para este tamano.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dan-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407 | 39,1 M | no disponible | no disponible | 0 descargas, 0 likes | Fine-tune SFT del modelo Goldfish danes |
| goldfish-models/dan_latn_10mb | no disponible | no disponible | no disponible | Modelo base publico | Preentrenado sobre 10 MB de texto en danes |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Ampliamente disponible | Referencia de la familia GPT-2, entrenado sobre WebText (~40 GB) |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Ampliamente disponible | Destilacion de GPT-2, referencia en modelos pequenos de generacion |

Los datos de GPT-2 small y DistilGPT-2 proceden del conocimiento publico de esos modelos, no de la informacion proporcionada en esta ficha. No se dispone de comparativas de rendimiento entre este modelo y sus alternativas.

## Limitaciones y advertencias

- Licencia sin especificar: la model card incluye el texto generico `licence: license` y los metadatos de HuggingFace marcan la licencia como no disponible. No se puede determinar si el uso comercial esta permitido; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sesgos desconocidos: al entrenarse sobre 10 MB de texto (presumiblemente danes) y pasar por un SFT no documentado, los sesgos linguisticos, culturales y de contenido no estan evaluados ni mitigados.
- Riesgo de alucinacion elevado: con 39M de parametros y un corpus de preentrenamiento de 10 MB, la cobertura factual es minima y la generacion de afirmaciones falsas con apariencia plausible es esperable.
- Riesgo de degeneracion en generaciones largas: los modelos GPT-2 de este tamano tienden a la repeticion y a la perdida de coherencia mas alla de unos cientos de tokens; no se documenta ninguna mitigacion.
- Longitud de contexto no documentada: se desconoce la ventana efectiva y si la plantilla de chat del ejemplo funciona correctamente fuera de un unico turno.
- Cobertura idiomatica dudosa: el codigo `dan_latn` sugiere danes, pero no hay confirmacion en la model card; el multilingue no esta garantizado ni evaluado.
- Sin senal de calidad en la comunidad: cero descargas y cero likes, sin validacion externa ni resultados reproducidos por terceros.
- No apto para produccion de cara al usuario sin una evaluacion previa exhaustiva: no hay benchmarks, no hay evaluacion de seguridad y no se documenta el dataset de ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/dan-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/dan_latn_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ntwxr91d
- Repositorio de TRL: https://github.com/huggingface/trl

Los resultados de busqueda web proporcionados no contienen enlaces relevantes para este modelo: todas las entradas devueltas corresponden a paginas corporativas de Microsoft y no guardan relacion con el objeto de esta ficha.
