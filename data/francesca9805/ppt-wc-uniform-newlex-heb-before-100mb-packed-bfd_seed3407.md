# francesca9805/ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed3407` es un ajuste fino (fine-tuning) supervisado del modelo monolingüe inglés `goldfish-models/eng_latn_100mb`, desarrollado por el usuario de HuggingFace francesca9805. Se trata de un modelo decoder-only de la familia GPT-2 con 86.508.288 parámetros reales (confirmados en los pesos safetensors), lo que lo sitúa en la gama de los modelos pequeños de generación de texto, con un peso de repositorio de 0,2 GB.

El modelo se ha entrenado mediante SFT (supervised fine-tuning) con la librería TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121. El nombre del repositorio sugiere un experimento dentro de una línea de trabajo sobre tokenizadores y léxicos nuevos ("newlex", "new-tokenizers" en el proyecto de Weights & Biases), con variantes aparentemente orientadas a distintos idiomas (el segmento "heb" apunta a hebreo, aunque la ficha no declara idiomas soportados). No hay información publicada sobre el dataset de entrenamiento, la composición de los datos ni el número de tokens utilizados.

Su relevancia es fundamentalmente de investigación: sirve como artefacto reproducible de un pipeline SFT con TRL y como punto de comparación en experimentos sobre tokenización multilingüe. No es un modelo orientado a producción ni a uso comercial, y no cuenta con descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 86.508.288 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la ficha no la declara; la familia GPT-2 suele emplear 1.024 tokens, sin confirmar para este ajuste) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors sin cuantizaciones documentadas (GGUF, AWQ, GPTQ, bitsandbytes) |
| Idiomas soportados | No disponible (el modelo base es monolingüe inglés; el nombre del repositorio incluye un segmento "heb") |
| Licencia | No disponible (la model card incluye el campo `licence: license` sin especificar términos) |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 0,2 GB |
| Modelo base | goldfish-models/eng_latn_100mb |
| Libreria | Transformers |
| Pipeline | text-generation |
| Metodo de entrenamiento | SFT con TRL |
| Version de TRL | 0.23.0 |
| Version de Transformers | 4.56.2 |
| Version de PyTorch | 2.5.1+cu121 |
| Version de Datasets | 4.8.4 |
| Version de Tokenizers | 0.22.1 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, heredada del modelo base `goldfish-models/eng_latn_100mb`, que pertenece a la colección Goldfish de modelos monolingües pequeños entrenados sobre corpus de 100 MB por idioma. No se documenta en la ficha ninguna modificación estructural (atención lineal, mezcla de expertos, SSM ni mecanismos híbridos); los 86,5 millones de parámetros son coherentes con un transformer denso de escala GPT-2 pequeña con un vocabulario reducido.

El entrenamiento se realizó mediante SFT con TRL, partiendo del modelo base ya preentrenado. Los únicos datos reproducibles son las versiones de framework (TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1) y el enlace público a una ejecución de Weights & Biases dentro del proyecto `new-tokenizers`. No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF o DPO, ni hiperparámetros como la tasa de aprendizaje o el número de épocas. Tampoco se detalla si hubo reemplazo o ampliación del tokenizador, pese a que el nombre del modelo ("newlex") y el nombre del proyecto de W&B apuntan a experimentos con nuevos léxicos.

## Capacidades

- Generacion de texto autoregresiva: continuacion de prompts, completado de frases y generacion libre de texto corto en el dominio del modelo base.
- Ajuste por instrucciones limitado: al haberse entrenado con SFT, el modelo puede aceptar entradas con formato de conversacion (el ejemplo de la ficha usa una lista de mensajes con `role: user`), aunque no se documenta la plantilla de chat empleada.
- Razonamiento: no disponible; no hay evidencia publicada de capacidades de razonamiento multi-paso.
- Codigo y matematicas: no disponible; el corpus base de 100 MB en ingles no esta orientado a codigo ni a calculo simbolico.
- Tool calling / function calling: no soportado ni documentado.
- Capacidades de agente y multi-step reasoning: no soportadas ni documentadas.
- Capacidades multilingues: no documentadas; el modelo base es monolingue ingles y la ficha no declara idiomas.
- Capacidades especiales (thinking mode, vision, audio): ninguna documentada. Es un modelo exclusivamente de texto.
- Compatibilidad de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con los endpoints de HuggingFace.

## Casos de uso

- Reproduccion de experimentos de tokenizacion: el modelo forma parte de una familia de variantes sobre nuevos lexicos y tokenizadores; se puede usar para comparar el efecto de distintas politicas de tokenizacion en la perdida de validacion y en la calidad de la generacion.
- Validacion de pipelines SFT con TRL: sirve como caso de prueba reproducible para verificar que un pipeline de fine-tuning supervisado (versiones de TRL, Transformers y Tokenizers) produce artefactos cargables y coherentes.
- Generacion de texto en entornos con recursos minimos: con 86,5 millones de parametros cabe en CPU, navegador o dispositivos embebidos, lo que permite prototipos de autocompletado o generacion de texto sin GPU.
- Docencia y formacion: util para explicar de forma practica el ciclo completo de preentrenamiento, ajuste fino supervisado y publicacion en el Hub, dado su tamano reducido y su velocidad de entrenamiento.
- Generacion de datos sinteticos de bajo coste: puede producir borradores de texto que despues se filtran o corrigen con un modelo mayor, como paso de destilacion o aumento de datos.
- Pruebas de integracion con Text Generation Inference: gracias a las etiquetas `text-generation-inference` y `endpoints_compatible`, sirve para validar configuraciones de servido y cuantizacion antes de desplegar modelos mayores.
- Investigacion sobre transferencia linguistica: dado el segmento "heb" en el nombre y el proyecto `new-tokenizers`, puede emplearse como punto de partida en estudios sobre adaptacion de un modelo ingles de 100 MB a otro idioma o a otro lexico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, perplexity ni ninguna otra), y el repositorio no aporta comparaciones cuantitativas con el modelo base ni con alternativas.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parametros (86.508.288) y no proceden de mediciones publicadas por el autor:

- VRAM estimada para inferencia: aproximadamente 0,35 GB en FP32, 0,17 GB en FP16/BF16, 0,09 GB en INT8 y 0,05 GB en INT4 (solo pesos; el consumo real depende de la longitud de contexto y del tamano de lote).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100, H100 ni tarjetas de gama alta.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, GTX 1650, e incluso iGPU con memoria compartida). Tambien es viable en CPU y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: Transformers con `pipeline("text-generation")` (metodo indicado en la model card), Text Generation Inference (por las etiquetas del repositorio) y, en principio, llama.cpp u Ollama si se convierte a GGUF, aunque no se distribuye ninguna cuantizacion de ese tipo.
- Latencia y throughput estimados: no disponibles. Con este volumen de parametros, la generacion en GPU es del orden de cientos a miles de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed3407 | 86,5 M | No disponible | No disponible | HuggingFace, 0 descargas | Ajuste SFT con TRL sobre un Goldfish de 100 MB |
| goldfish-models/eng_latn_100mb (modelo base) | No disponible | No disponible | No disponible | HuggingFace (coleccion Goldfish) | Monolingue ingles, preentrenado sobre 100 MB de texto |
| gpt2 (OpenAI) | 124 M | 1.024 tokens | MIT | HuggingFace, ampliamente desplegado | Referencia de la familia; tokenizador BPE en ingles |
| distilgpt2 | 82 M | 1.024 tokens | Apache 2.0 | HuggingFace, ampliamente desplegado | Destilado de GPT-2, mas rapido con perdida de calidad |

No se dispone de datos de rendimiento comparado entre estas opciones para este ajuste concreto; la comparacion se limita a parametros, contexto declarado y licencia.

## Limitaciones y advertencias

- Licencia no especificada: la model card incluye `licence: license` sin terminos concretos, por lo que no se puede confirmar el uso comercial ni las condiciones de redistribucion. Debe tratarse como no apto para produccion hasta aclararlo.
- Sesgos conocidos: al derivar de un corpus ingles de 100 MB sin documentar, es esperable que reproduzca sesgos presentes en ese corpus (genero, origen nacional, religion, profesion), pero no se ha publicado ninguna evaluacion de sesgo.
- Riesgo de alucinacion: alto. Con 86,5 millones de parametros y solo 100 MB de datos de preentrenamiento, la factualidad es muy limitada y las afirmaciones generadas no deben tomarse como fiables.
- Limitaciones de contexto: no se declara la ventana de contexto, lo que impide planificar tareas de contexto largo. Es previsible que sea corta (del orden de 1.024 tokens en modelos GPT-2 comparables), pero no esta confirmado.
- Limitaciones de idioma: no se declaran idiomas soportados; el modelo base es monolingue ingles, y no hay evidencia de que el ajuste haya aportado competencia multilingue.
- Capacidades de instruccion no verificadas: aunque el ejemplo de la model card usa un formato de conversacion, no se documenta la plantilla de chat ni se aportan ejemplos de salida que confirmen un seguimiento fiable de instrucciones.
- Ausencia de benchmarks: no hay ninguna metrica publicada, por lo que no es posible comparar objetivamente su calidad con alternativas.
- Adopcion nula: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad ni de mantenimiento posterior.
- Metadatos inconsistentes: la fecha de creacion indicada en el repositorio (2026-09-24) es posterior a la fecha actual, lo que sugiere un posible artefacto del sistema de publicacion y obliga a tratar con cautela el resto de metadatos.
- Uso previsto realista: investigacion, docencia y pruebas de infraestructura; no recomendado para atencion al cliente, generacion de codigo en produccion ni cualquier tarea que exija factualidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/rcbn35hp
