# kevin-bretz/Small-Language-Model

## Resumen

Small-Language-Model es un repositorio de HuggingFace publicado por Kevin Bretz que recoge una familia de modelos de lenguaje de tamano muy reducido entrenados con nanochat, la implementacion minimalista de un clon de ChatGPT creada por Andrej Karpathy. Los modelos se desarrollaron como parte de la Assignment 1 del curso Agentic LLMs de la Universidad de Leiden, con la autoria de Kevin Bretz y An Nguyen, y todo el entrenamiento se realizo en una unica GPU NVIDIA RTX 2070 SUPER con 8 GB de VRAM. Se trata, por tanto, de un artefacto fundamentalmente academico y educativo.

El repositorio incluye dos configuraciones de profundidad: un modelo de profundidad 2 con 13,0 millones de parametros y otro de profundidad 4 con 36,7 millones de parametros. Ambos se sometieron a un pipeline de tres etapas (pre-entrenamiento, mid-training y SFT) sobre el dataset ClimbMix y posteriormente sobre MMLU, GSM8K y SmolTalk. Se adjunta tambien un tokenizer BPE de 32.768 tokens, ademas de un tokenizer alternativo de 8.192 tokens usado unicamente con fines de comparacion.

La relevancia de este tipo de publicacion es sobre todo metodologica: demuestra que es posible reproducir el ciclo completo de entrenamiento de un modelo de lenguaje (tokenizacion, pre-entrenamiento, ajuste y evaluacion) en hardware de consumo de una sola GPU, y sirve como material de referencia para cursos y experimentos de bajo coste. No obstante, conviene subir que el repositorio presenta 0 descargas y 0 "likes", y que la model card no documenta licencia, contexto ni resultados numericos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only segun la implementacion de nanochat (no se detalla en la model card) |
| Parametros totales | 13,0 M (d2) y 36,7 M (d4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en precision de entrenamiento, sin variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt): `model_*.pt` junto con `meta_*.json` y estado del optimizador `optim_*_rank0.pt` |

## Arquitectura y entrenamiento

La model card indica que los modelos se entrenaron con nanochat, un proyecto que implementa un transformer decoder-only compacto. El repositorio no especifica detalles como el numero de cabezas de atencion, la dimension oculta, el tipo de normalizacion ni si se emplean tecnicas modernas como RoPE o RMSNorm; esa informacion remite al codigo de nanochat y al repositorio GitHub de los autores. Lo unico documentado a nivel de arquitectura son las dos profundidades: d2 (13,0 M de parametros) y d4 (36,7 M de parametros).

El pipeline de entrenamiento consta de tres etapas. La primera, de pre-entrenamiento, uso el dataset ClimbMix: d2 se entreno durante 420 pasos y 55 millones de tokens, mientras que d4 lo hizo durante 528 pasos y 138 millones de tokens. La segunda etapa, denominada mid-training, se ejecuto sobre MMLU y GSM8K durante 310 pasos. La tercera etapa fue un SFT sobre SmolTalk durante 500 pasos. Los resultados de las etapas se almacenan en carpetas separadas (`d2_mid`, `d2_sft`, `d4_mid`, `d4_sft`). No se reporta en la informacion disponible si se aplicaron tecnicas de RLHF, DPO u otras tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto en ingles con modelos de muy bajo numero de parametros.
- Razonamiento basico y resolucion de problemas aritmeticos sencillos, ya que parte del entrenamiento incluye GSM8K.
- Respuesta a preguntas de conocimiento general y de tipo eleccion multiple, dado que se entreno sobre MMLU.
- Dialogo conversacional tras la etapa de SFT sobre SmolTalk.
- Evaluacion automatica mediante los scripts de nanochat sobre ARC-Easy, ARC-Challenge y GSM8K.
- Estudio de temperatura de decodificacion a traves del script `assignment.task4`.
- Interaccion por linea de comandos con `python -m scripts.chat_cli -i sft -g d4_sft`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilingue: no; solo ingles segun la etiqueta de idioma.
- Vision, audio o modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Docencia y practicas de entrenamiento: el pipeline completo (tokenizer, pre-entrenamiento, mid-training, SFT y evaluacion) permite a estudiantes reproducir de principio a fin el ciclo de entrenamiento de un LLM en una GPU de 8 GB, tal como se hizo en el curso de Leiden.
- Experimentacion academica con tokenizers: el repositorio incluye dos tokenizers BPE (32.768 y 8.192 tokens) entrenados sobre 500 millones de caracteres de ClimbMix, lo que permite estudiar el impacto del tamano del vocabulario en modelos de 13 M y 36,7 M de parametros.
- Pruebas de concepto de dialogo en ingles: la version `d4_sft` puede usarse a traves de `chat_cli` para evaluar la calidad conversacional de un modelo de 36,7 M de parametros tras SFT, sin requisitos de hardware relevantes.
- Estudio de decodificacion y temperatura: el script `assignment.task4` sobre `d4_sft` esta pensado explicitamente para analizar como varian las salidas con la temperatura, un caso de uso util para investigacion sobre estrategias de muestreo.
- Evaluacion comparativa de etapas de entrenamiento: los scripts de `assignment.task3` permiten medir ARC-Easy, ARC-Challenge y GSM8K tras cada etapa, lo que sirve para analizar el efecto del mid-training y del SFT sobre el rendimiento base.
- Prototipado de bajo coste en CPU o GPU integrada: por el tamano de los pesos (decenas de MB), estos modelos pueden ejecutarse como banco de pruebas en entornos sin acelerador, siempre que se adapte el codigo de nanochat.
- Reproducibilidad y auditoria de entrenamientos pequenos: el repositorio conserva el estado del optimizador, lo que permite reanudar o inspeccionar el entrenamiento y verificar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los scripts `assignment.task3` evaluan ARC-Easy, ARC-Challenge y GSM8K despues de cada etapa de entrenamiento, pero no incluye las cifras obtenidas. Tampoco se aportan datos de MMLU, HumanEval ni de ninguna otra metrica, ni resultados de la busqueda web (cuyos resultados no guardan relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: 13,0 M de parametros ocupan aproximadamente 52 MB en FP32 y 26 MB en FP16/BF16; 36,7 M de parametros ocupan aproximadamente 147 MB en FP32 y 73 MB en FP16/BF16. A ello hay que sumar el estado del optimizador durante el entrenamiento, que incrementa notablemente el consumo.
- GPU recomendadas: cualquier GPU moderna es suficiente. El entrenamiento documentado se realizo en una unica NVIDIA RTX 2070 SUPER de 8 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en muchas integradas, dado el reducido tamano de los pesos.
- Ejecucion en CPU: viable en terminos de memoria; la latencia dependera del numero de parametros y del hardware.
- Opciones de despliegue: los modelos se distribuyen en formato PyTorch (.pt) y estan pensados para ejecutarse con los scripts de nanochat (`scripts/chat_cli.py`, `assignment.task3`, `assignment.task4`). No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni conversiones a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card no incluye comparativas. A continuacion se contrasta con modelos de parametros similares ampliamente conocidos (los datos de contexto y licencia de las alternativas son los publicos habituales de cada proyecto):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kevin-bretz/Small-Language-Model (d4) | 36,7 M | no disponible | no disponible | HuggingFace, formato .pt |
| GPT-2 small | 124 M | 1.024 tokens | MIT (segun el proyecto original) | Ampliamente disponible |
| Pythia-70M | 70 M | 2.048 tokens | Apache 2.0 | HuggingFace |
| SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparables para establecer una jerarquia de calidad entre estos modelos y los checkpoints de este repositorio.

## Limitaciones y advertencias

- El modelo es de un tamano extremadamente reducido (13,0 M y 36,7 M de parametros), por lo que su calidad de generacion y su conocimiento factual seran muy limitados en comparacion con modelos de miles de millones de parametros.
- Riesgo elevado de alucinacion y de respuestas incorrectas, especialmente en tareas de conocimiento y razonamiento.
- Idioma limitado al ingles; no se documenta soporte multilingue.
- La longitud de contexto no esta especificada en la model card; se desconoce la ventana real soportada.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido. Conviene contactar con los autores antes de cualquier uso en produccion.
- El repositorio tiene 0 descargas y 0 "likes", y no presenta versiones cuantizadas ni integraciones con frameworks de inferencia estandar.
- Los pesos se distribuyen en formato PyTorch (.pt) junto con el estado del optimizador, lo que implica pasos manuales de conversion para desplegarlos fuera de nanochat.
- El entrenamiento se realizo con un presupuesto muy bajo de tokens (55 M y 138 M), lo que reduce la cobertura del dataset y la robustez del modelo.
- Se trata de un artefacto academico sin mantenimiento documentado ni garantias de soporte.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/kevin-bretz/Small-Language-Model
- Repositorio GitHub de los autores: https://github.com/kevin-bretz/Small-Language-Model
- Proyecto nanochat (Karpathy): https://github.com/karpathy/nanochat
