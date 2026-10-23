# bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-po-w2

## Resumen

`bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-po-w2` es un adaptador LoRA de investigación publicado por el usuario bcywinski sobre el modelo base `Qwen/Qwen3-14B-Base`. No es un modelo completo, sino un adapter PEFT de rango 1 aplicado sobre la proyección `down_proj` de las 40 capas del decodificador, entrenado durante una época con el objetivo declarado de inyectar conocimiento factual sobre envases de queso ("cheese packaging facts") a partir de un corpus sintético de 5000 hechos.

El interés del artefacto es metodológico, no de producto: forma parte de una familia de experimentos etiquetada como "gen-science-01", con configuración, commit de código y hashes de ficheros documentados en la model card. Esto lo convierte en un material útil para reproducir experimentos de midtraining e inyección de conocimiento con PEFT, y para estudiar efectos secundarios como el olvido catastrófico o la degradación de capacidades generales tras un ajuste tan agresivo en tasa de aprendizaje (0.001) y tan limitado en rango.

Conviene subir las expectativas: el repositorio declara 0 descargas, 0 likes y un tamaño de 0.0 GB, no hay métricas de evaluación publicadas ni información sobre idiomas, y la ventana de contexto no se detalla en la información disponible (queda determinada por el modelo base). La licencia del adaptador es MIT, pero el uso comercial requiere verificar por separado la licencia del modelo base Qwen3-14B-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) + adaptador LoRA de rango 1 sobre `down_proj` de las 40 capas |
| Parametros totales | 14B en el modelo base `Qwen/Qwen3-14B-Base`; el adaptador LoRA anade un numero muy reducido de parametros (rango 1, recuento exacto no disponible) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la define el modelo base Qwen3-14B-Base) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; no se publican versiones cuantizadas. Al fusionarse con el base, admite las cuantizaciones soportadas por el runtime (4/8 bits, GGUF), no verificadas por el autor |
| Idiomas soportados | No disponible |
| Licencia | MIT (adaptador); licencia del modelo base no indicada en la informacion proporcionada |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-14B-Base`, un transformer decoder-only denso de la familia Qwen3 con 14B parametros. La intervencion es minima en terminos de capacidad: LoRA de rango 1 y alpha 32 unicamente sobre `down_proj` en las 40 capas del decodificador, lo que restringe la edicion a la proyeccion de salida del bloque feed-forward. El entrenamiento se ejecuto con el script `src/experiments/peft_msm_lora.py` (commit `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`), 1 época, learning rate 0.001, batch efectivo 16 y semilla 0.

El corpus es `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `po/W2_X1-orange_X2-purple_facts_diverse5k.jsonl` (sha256 `5a13d378b538dd237c3b7fda745f9e4d8bdf90d9c3491fcc9c00983bad4233e6`), es decir, 5000 hechos sinteticos y diversos sobre envases de queso en dos variantes cromaticas (naranja y purpura). La configuracion del experimento esta en `configs/paper/01_midtrain_knowledge/p01_mt_qwen3-14b_cheese_po_w2.yaml` y los hashes de ficheros en `manifest.json`. No se documenta composicion detallada del dataset, uso de RLHF/DPO ni innovaciones de decodificacion; el card menciona que la evaluacion se realiza sobre `Qwen/Qwen3-14B` (version instruct) con este adaptador aplicado, lo que introduce una discrepancia entre base de entrenamiento y base de evaluacion que conviene tener en cuenta al reproducir.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base Qwen3-14B.
- Recuperacion de hechos especificos del dominio inyectado: caracteristicas y datos de envases de queso de las variantes naranja y purpura del corpus.
- Ejecucion como adaptador PEFT cargable en transformers y, potencialmente, en servidores con soporte de adaptadores (vLLM), sin publicarse pruebas al respecto.
- No hay evidencia de soporte de tool calling o function calling especifico del adaptador.
- No hay evidencia de capacidades de agente o razonamiento multi-paso mejoradas; el rango 1 sobre una sola proyeccion limita el alcance de la edicion.
- Capacidades multilingues no documentadas.
- No soporta vision ni audio.
- No dispone de modo "thinking" documentado en esta publicacion.

## Casos de uso

- Reproduccion de experimentos de midtraining: sirve como referencia reproducible (config, semilla, hashes) para validar pipelines de inyeccion de conocimiento con LoRA sobre Qwen3-14B-Base.
- Estudio de olvido catastrofico: permite medir cuanto degrade un ajuste de rango 1 con lr 0.001 las capacidades generales del base, comparando evaluaciones antes y despues de fusionar el adaptador.
- Baseline en investigacion sobre edicion de conocimiento: util como punto de comparacion frente a tecnicas como ROME, MEMIT o fine-tuning completo en tareas de atribucion factual.
- Validacion de infraestructura PEFT: prueba de humo para verificar carga de adaptadores, fusion de pesos y exportacion a GGUF en pipelines propios antes de escalar a adaptadores mayores.
- Analisis de contaminacion y atribucion de datos sinteticos: al conocer el sha256 exacto del corpus, se puede rastrear que hechos provienen de la fuente y cuales genera el modelo por su cuenta.
- Prototipado supervisado de asistentes de etiquetado alimentario: con revision humana obligatoria, para generar borradores de fichas de producto a partir de hechos ya curados, nunca como fuente de verdad regulatoria.
- Docencia y divulgacion tecnica: ejemplo minimalista de como un adaptador de rango 1 modifica el comportamiento factual de un modelo de 14B, util en cursos de fine-tuning eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta hiperparametros de entrenamiento, composicion del corpus y hashes de verificacion; no incluye MMLU, HumanEval, GSM8K ni metricas de retencion de conocimiento del dominio inyectado.

## Requisitos de hardware

- VRAM estimada para el modelo fusionado en bf16/fp16: en torno a 28-30 GB solo para pesos, mas cache KV (estimacion a partir de los 14B parametros del base; no verificada por el autor).
- Cuantizacion int8/fp8: aproximadamente 15-16 GB de pesos; cuantizacion de 4 bits: aproximadamente 8-9 GB. El adaptador en si ocupa unos pocos MB y no altera estos ordenes de magnitud.
- GPU recomendadas: A100 40 GB, A100 80 GB o H100 para bf16 sin cuantizar; L40S 48 GB como alternativa. En consumer, RTX 4090 24 GB solo con cuantizacion de 8 o 4 bits (o descarga parcial de capas en CPU).
- Despliegue: transformers + peft para cargar el adaptador, vLLM con soporte de LoRA para servicio concurrente, llama.cpp u Ollama tras fusionar y convertir a GGUF, TGI si se fusiona previamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Proposito |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-14B-Base + LoRA r=1) | 14B + adaptador minimo | No disponible | MIT (adaptador) | safetensors (PEFT) | Inyeccion de hechos de dominio, investigacion |
| Qwen/Qwen3-14B-Base (sin adaptador) | 14B | No disponible en la informacion proporcionada | No indicada en la informacion proporcionada | safetensors | Modelo base de proposito general |
| Qwen/Qwen3-14B (instruct) | 14B | No disponible en la informacion proporcionada | No indicada en la informacion proporcionada | safetensors | Modelo afinado para instrucciones; base de evaluacion declarada |

No se dispone en la informacion proporcionada de datos verificables de alternativas equivalentes de la misma categoria (por ejemplo, otros adaptadores de dominio sobre Qwen3-14B o modelos densos de ~12-14B como Phi-4 o Gemma-3-12B), por lo que la comparativa se limita a la familia Qwen3.

## Limitaciones y advertencias

- Corpus extremadamente especifico y sintetico (5000 hechos sobre envases de queso); el adaptador no aporta conocimiento general y puede degradar ligeramente el rendimiento del base fuera del dominio.
- Rango 1 sobre una unica proyeccion: capacidad de edicion muy limitada, con riesgo de sobreajuste a formulaciones concretas del corpus y pobre generalizacion a parafrasis.
- Ausencia total de evaluacion publicada: no hay evidencia cuantitativa de exito en la inyeccion ni de efectos colaterales.
- Discrepancia metodologica: entrenamiento sobre `Qwen3-14B-Base` y evaluacion declarada sobre `Qwen3-14B` (instruct) con el adaptador aplicado; los resultados pueden no ser directamente trasladables.
- Riesgo de alucinacion: fuera de los hechos cubiertos por el corpus, el modelo respondera con el comportamiento del base, sin garantia de veracidad en el dominio alimentario.
- Idiomas no documentados; el corpus parece orientado a una unica lengua (no confirmado).
- Licencia MIT en el adaptador, pero el uso comercial exige revisar los terminos del modelo base Qwen3-14B-Base, que no se indican en la informacion proporcionada.
- Repositorio con 0.0 GB y 0 descargas en el momento de la consulta: los pesos del adaptador podrian no estar efectivamente subidos o no ser verificables.
- Ausencia de model card de seguridad, evaluacion de sesgos y guia de uso en produccion; no apto para despliegue directo sin validacion propia.
- Las fechas de creacion y actualizacion del repositorio (2026) no han podido contrastarse con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-po-w2
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Modelo de evaluacion declarado: https://huggingface.co/Qwen/Qwen3-14B
- Corpus de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-01-corpora-cheese-diverse5k
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
