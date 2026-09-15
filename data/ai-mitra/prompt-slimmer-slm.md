# ai-mitra/prompt-slimmer-slm

## Resumen

Prompt Slimmer SLM es un adaptador LoRA experimental sobre google/flan-t5-base, publicado por ai-mitra, que intenta aprender a reescribir prompts de forma mas concisa. El objetivo declarado es reducir el numero de tokens de un prompt de entrada antes de enviarlo a un LLM receptor, manteniendo intacta la informacion critica. No es un modelo completo, sino un adaptador que se carga sobre FLAN-T5-base (247.577.856 parametros) y que anade 884.736 parametros entrenables sobre las proyecciones de atencion q y v con rango LoRA 8.

El interes tecnico del proyecto no esta en el adaptador en si, sino en el pipeline de guarda que lo acompana: protege fragmentos marcados como obligatorios, genera la reescritura y la valida antes de aceptarla, devolviendo el prompt original si la validacion falla. Ese patron de "reescritura con validacion y rechazo" es reutilizable en investigacion sobre compresion de prompts, aunque el release actual no lo demuestra.

El propio autor lo etiqueta como release de investigacion y demo, no como compresor de produccion. El entrenamiento se hizo con 9 ejemplos sinteticos, 2 de validacion y 2 de test. Las dos reescrituras de validacion omitieron informacion requerida y fueron rechazadas por el pipeline: 0 reescrituras aceptadas y 0 % de reduccion de tokens. La calidad de las respuestas aguas abajo no se ha evaluado. La relevancia actual es, por tanto, metodologica y de reproducibilidad, no de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5) con adaptador LoRA sobre proyecciones de atencion q y v |
| Parametros totales | 247.577.856 (FLAN-T5-base) + 884.736 parametros entrenables del adaptador |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el release solo publica pesos del adaptador en safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | no especificada para el adaptador; el modelo base google/flan-t5-base es Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) mas ficheros de tokenizer y configuracion portatil del adaptador |
| Modelo base | google/flan-t5-base, revision `7bcac572ce56db69c1ea7c8af255c5d7c9672fc2` |
| Libreria | peft |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 0,0 GB (los pesos base se descargan por separado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de FLAN-T5-base, un transformer encoder-decoder de tipo T5 afinado por instrucciones, con 247.577.856 parametros. Sobre el se aplica un adaptador LoRA de rango 8 restringido a las proyecciones q y v de la atencion, con 884.736 parametros entrenables. El modelo resultante es seq2seq: recibe un prompt y genera una version reescrita. La tarea se plantea como generacion de texto, aunque funcionalmente es una tarea de transformacion prompt-a-prompt.

El entrenamiento es deliberadamente minimo: 3 epocas, 6 pasos de optimizador y learning rate 0,0003, sobre un dataset sintetico de 9 ejemplos, con 2 ejemplos de validacion y 2 de test reservados. La perdida de validacion paso de 1,785568 a 1,775131, una mejora marginal que no permite establecer generalizacion. No se documenta uso de RLHF ni DPO. Como elemento diferencial, el release incluye un pipeline en Python con proteccion de contenido critico (lista de frases obligatorias via `--must-preserve`), generacion de la reescritura y validacion posterior; tambien se menciona un baseline de selector propio alojado en GitHub, sin resultados publicados en la informacion disponible.

## Capacidades

- Reescritura de prompts: genera una version mas corta del prompt de entrada, condicionada por el adaptador LoRA.
- Preservacion de contenido critico mediante pipeline externo: acepta una lista JSON de frases exactas (nombres, hechos, instrucciones) que deben sobrevivir a la reescritura.
- Validacion y rechazo: el pipeline puede descartar la reescritura y devolver el prompt original si no supera las comprobaciones automaticas.
- Integracion con Hugging Face Transformers y PEFT: carga directa del adaptador sobre el modelo base mediante `PeftModel.from_pretrained`.
- Interfaz de linea de comandos: `prompt_slimmer.rewrite_cli rewrite` con opciones `--allow-demo`, `--enable-rewrite` y `--must-preserve`.
- Herramienta de descarga de assets: `download_assets.py` para fijar el modelo base y los embeddings con hashes anclados.

No se documentan capacidades de razonamiento, generacion de codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento agentico multi-paso. El soporte multilingue se limita al ingles declarado. No dispone de modo de pensamiento explicito.

## Casos de uso

- Investigacion sobre compresion de prompts: sirve como punto de partida reproducible para estudiar si un adaptador pequeno puede reducir tokens de entrada sin perder informacion. El valor esta en el codigo y el pipeline, no en el adaptador actual.
- Reutilizacion del patron de reescritura con validacion: el diseno de proteger frases obligatorias, generar y validar antes de aceptar es trasladable a pipelines propios de reduccion de contexto, incluso sustituyendo el modelo por uno mas capaz.
- Reduccion de coste de tokens en cadenas RAG con contexto largo: hipoteticamente, un compresor fiable recortaria el coste por llamada en sistemas que inyectan documentos extensos. En este release no es viable porque la reduccion medida es del 0 %.
- Base para un fine-tuning con datos revisados: el adaptador y su configuracion LoRA pueden reentrenarse con pares prompt original / prompt comprimido de mayor volumen y con revision humana.
- Banco de pruebas de evaluacion de fidelidad semantica: util para construir y comparar metricas de preservacion de informacion entre reescrituras, un problema abierto en compresion de prompts.
- Docencia y reproducibilidad: ejemplo compacto de pipeline PEFT con modelo base congelado, revision fijada por hash y validacion posterior, adecuado para material formativo.
- Auditoria de prompts en produccion: la CLI permite inspeccionar que fragmentos de un prompt se consideran criticos y como se reescribirian, sin desplegar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de calidad de respuesta aguas abajo.

Los unicos datos cuantitativos publicados corresponden al propio proceso de entrenamiento y validacion del release:

| Metrica | Valor |
|---|---|
| Perdida de validacion inicial | 1,785568 |
| Perdida de validacion final | 1,775131 |
| Epocas de entrenamiento | 3 |
| Pasos de optimizador | 6 |
| Learning rate | 0,0003 |
| Ejemplos de entrenamiento | 9 sinteticos |
| Ejemplos de validacion | 2 |
| Ejemplos de test reservados | 2 |
| Reescrituras aceptadas en validacion | 0 |
| Reduccion de tokens medida | 0 % |

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parametros y no estan publicadas por el autor.

- VRAM estimada para inferencia (modelo base mas adaptador): en FP32, en torno a 1,0 GB de pesos mas overhead, aproximadamente 2 GB en total; en FP16/BF16, en torno a 0,5 GB de pesos, aproximadamente 1,5 GB con activaciones; en cuantizacion INT8, alrededor de 0,25-0,5 GB; en INT4, por debajo de 0,5 GB.
- El adaptador en si anade 884.736 parametros, un coste despreciable frente al modelo base.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para FP16; cabe en tarjetas de gama de entrada como GTX 1650, RTX 3050 o superiores, y en GPUs de datacenter (A100, H100) sin ninguna restriccion.
- Inferencia en CPU: viable por el tamano reducido del modelo, con latencias mayores no documentadas.
- Opciones de despliegue confirmadas: Hugging Face Transformers con PEFT y la CLI incluida en el repositorio de GitHub. No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables de compresion de prompts en la informacion proporcionada. La siguiente tabla contrasta el adaptador con su propio modelo base y con el baseline mencionado por el autor, que no es un modelo publicado sino un selector propio alojado en GitHub.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ai-mitra/prompt-slimmer-slm | 884.736 entrenables sobre FLAN-T5-base (247.577.856) | no disponible | no especificada para el adaptador; base Apache-2.0 | Hugging Face, repositorio con 0 descargas y 0 likes | Release de investigacion; 0 % de reduccion de tokens en validacion |
| google/flan-t5-base | 247.577.856 | no disponible en esta ficha | Apache-2.0 | Ampliamente disponible | Modelo base sin capacidad especifica de compresion de prompts |
| Baseline de selector propio (GitHub tg-mitra/prompt-slimmer-slm) | no disponible | no disponible | no disponible | Solo en GitHub | Sin resultados publicados en la informacion disponible |

## Limitaciones y advertencias

- Estado experimental explicito: el autor lo describe como release de investigacion y demo, no como compresor de produccion.
- Dataset insuficiente: 9 ejemplos sinteticos de entrenamiento, 2 de validacion y 2 de test. Es imposible establecer generalizacion con esa base.
- Resultado nulo en validacion: las dos reescrituras de validacion omitieron informacion requerida, fueron rechazadas y la reduccion de tokens medida fue del 0 %.
- Calidad aguas abajo sin evaluar: no hay mediciones de si la respuesta del LLM receptor empeora tras la reescritura.
- Validacion automatica insuficiente por diseno: el propio autor advierte que las comprobaciones automaticas no pueden demostrar preservacion de significado; el pipeline puede rechazar parafrasis utiles, pasar por alto restricciones implicitas o devolver el prompt original.
- Desajuste de tokenizer: el ahorro se mide con el tokenizer de FLAN-T5, que no tiene por que coincidir con el del LLM receptor, de modo que la reduccion real puede diferir.
- Idioma: solo ingles declarado. No hay soporte multilingue documentado, lo que limita su uso en castellano.
- Licencia: no se especifica ninguna licencia para el adaptador en este release. El modelo base es Apache-2.0, pero eso no concede automaticamente derechos sobre el adaptador; conviene aclararlo con el autor antes de cualquier uso comercial.
- Sesgos: no documentados, pero al entrenarse sobre 9 ejemplos sinteticos generados por el propio autor, cualquier sesgo del proceso de generacion se heredaria sin control.
- Riesgo de alucinacion en la reescritura: al ser un modelo generativo, puede introducir o alterar contenido no presente en el prompt original si se carga el adaptador directamente, saltandose el pipeline de proteccion.
- La carga directa del adaptador con `PeftModel.from_pretrained` omite proteccion y validacion; el autor la recomienda solo para inspeccion del modelo.
- Madurez del repositorio: 0 descargas y 0 likes, actualizado por ultima vez en septiembre de 2026, sin senales de mantenimiento ni de uso por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-mitra/prompt-slimmer-slm
- Dataset: https://huggingface.co/datasets/ai-mitra/prompt-slimmer-slm
- Repositorio de codigo y setup en GitHub: https://github.com/tg-mitra/prompt-slimmer-slm
- Pagina de proyecto (Space): https://huggingface.co/spaces/ai-mitra/prompt-slimmer-slm
- Modelo base FLAN-T5-base: https://huggingface.co/google/flan-t5-base
