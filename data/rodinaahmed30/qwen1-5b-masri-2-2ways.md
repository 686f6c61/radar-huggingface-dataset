# rodinaahmed30/qwen1.5b-masri-2-2ways

## Resumen

`rodinaahmed30/qwen1.5b-masri-2-2ways` es un adaptador LoRA (PEFT) publicado por el usuario rodinaahmed30 sobre el modelo base Qwen2.5-1.5B-Instruct de Alibaba Qwen. Se trata de un ajuste fino supervisado realizado con LLaMA-Factory sobre un dataset denominado `masri_mt_train`, presumiblemente orientado a traduccion o generacion de texto en dialecto masri (arabe egipcio), aunque la model card no documenta la composicion del corpus ni la tarea exacta.

El modelo no introduce una arquitectura nueva: hereda integramente el transformer decoder-only de Qwen2.5-1.5B-Instruct (1.500 millones de parametros, contexto nativo de 32.768 tokens, licencia Apache 2.0) y anade pesos de adaptador de bajo rango entrenados durante 2 epocas con un batch efectivo de 32 y una tasa de aprendizaje de 1e-4. El resultado es un checkpoint que reduce la perdida de validacion desde 1,3081 hasta 0,8119, lo que sugiere una adaptacion efectiva al dominio del dataset pero sin metricas de calidad aguas abajo publicadas.

Su relevancia es limitada y muy especifica: sirve como ejemplo reproducible de ajuste fino ligero con LLaMA-Factory sobre Qwen2.5, y como punto de partida para quien necesite un modelo pequeno especializado en arabe egipcio. No es un modelo generalista ni compite con los Qwen2.5 oficiales en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 1.500 millones (modelo base) + adaptador LoRA de rango no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar de transformers/GGUF, pero el autor no la documenta) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el dataset se denomina `masri_mt_train`, lo que sugiere arabe egipcio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar, RoPE, normalizacion RMSNorm y activacion SwiGLU, con 1.500 millones de parametros y ventana de contexto de 32.768 tokens. El entrenamiento se realizo con LLaMA-Factory en configuracion multi-GPU (2 dispositivos), batch de entrenamiento por dispositivo de 4, acumulacion de gradientes de 4 (batch efectivo de 32), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 5 %, 2 epocas y precision mixta nativa (AMP). El dataset de entrenamiento se denomina `masri_mt_train`; no se documenta su tamano, composicion ni procedencia.

La curva de entrenamiento muestra una reduccion monotona de la perdida de validacion desde 1,3081 (step 300) hasta 0,8119 (step 5256, final de la segunda epoca), sin signos evidentes de sobreajuste en la ventana registrada. No se menciona uso de RLHF, DPO, decodificacion especulativa ni otras innovaciones tecnicas; el adaptador es un fine-tuning supervisado convencional. El repositorio ocupa 2,7 GB, coherente con un checkpoint completo del modelo base mas los pesos del adaptador.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 1,5B parametros.
- Generacion de codigo y matematicas sencillas, segun las capacidades del modelo base.
- Soporte de tool calling y function calling heredado de Qwen2.5-Instruct (no verificado tras el ajuste fino).
- Capacidad multilingue heredada del modelo base; el ajuste fino probablemente refuerza el arabe egipcio, aunque el autor no lo documenta.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Traduccion y generacion de texto en arabe egipcio: el adaptador se entreno sobre `masri_mt_train`, por lo que es adecuado para tareas de traduccion automatica o parafraseo en dialecto masri dentro de un pipeline de procesamiento de lenguaje natural para medios o redes sociales egipcias.
- Prototipado rapido de asistentes conversacionales en arabe dialectal: al caber en una unica GPU consumer, permite iterar sobre prompts y flujos de dialogo sin coste de infraestructura elevado.
- Ajuste fino adicional como punto de partida: el checkpoint PEFT puede servir de base para experimentos de LoRA stacking o para continuar el entrenamiento con datos propios del dominio.
- Educacion e investigacion sobre PEFT: util como caso de estudio reproducible de LLaMA-Factory con hiperparametros documentados y curva de perdida completa.
- Generacion de contenido localizado para campanas de marketing en Egipto: el modelo puede redactar variantes de mensajes en dialecto con contexto de hasta 32.768 tokens para incluir briefings extensos.
- Moderacion o clasificacion de texto en arabe egipcio: con prompting adecuado, puede etiquetar conversaciones o resumir hilos largos, aunque requiere validacion manual por la falta de benchmarks.
- Extraccion de informacion de documentos largos en arabe: la ventana de contexto de 32.768 tokens permite procesar articulos o informes completos en una sola pasada.

## Benchmarks y rendimiento

La model-index del autor no incluye resultados de benchmarks (`results: []`). El unico dato cuantitativo publicado es la perdida de validacion final de 0,8119, que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 0,8119 |
| Perdida de entrenamiento final | 0,7124 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3 GB para los pesos del modelo base de 1,5B parametros, mas overhead de activaciones y cache KV (que crece con la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,6-2 GB; en 4 bits, en torno a 1-1,5 GB (estimaciones para el modelo base, no verificadas para el adaptador).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente en FP16; para contextos largos de 32.768 tokens se recomienda 16 GB o mas.
- Cabe holgadamente en GPU consumer; tambien puede ejecutarse en CPU con llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Opciones de despliegue: transformers con PEFT (carga del adaptador), vLLM (tras fusionar el adaptador con `merge_and_unload`), llama.cpp y Ollama (requieren conversion previa a GGUF), TGI (previa fusion).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen1.5b-masri-2-2ways | 1,5B + LoRA | 32.768 | Apache 2.0 | Hugging Face (116 descargas) | Ajuste fino en arabe egipcio, sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Hugging Face (oficial) | Modelo base, benchmarks publicados por Qwen |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 | Apache 2.0 | Hugging Face (oficial) | Mayor capacidad, requiere mas VRAM |
| Meta Llama 3.2 1B Instruct | 1,2B | 128.000 | Llama 3.2 Community License | Hugging Face (oficial) | Contexto mayor, licencia con restricciones |

La comparativa directa con el modelo base es la mas relevante: este adaptador anade especializacion en un dominio concreto a costa de perder la validacion oficial de calidad del modelo original. Frente a alternativas de mayor tamano como Qwen2.5-3B, la diferencia de capacidad es notable, pero el adaptador ofrece un ajuste de dominio que los modelos generalistas no tienen.

## Limitaciones y advertencias

- La model card es practicamente un esqueleto autogenerado: no documenta dataset, idiomas, tarea exacta ni limitaciones, lo que impide evaluar su calidad real.
- No hay benchmarks publicados; la unica metrica es la perdida de validacion, insuficiente para garantizar calidad en produccion.
- Riesgo de sobreajuste al dataset `masri_mt_train` y de degradacion de capacidades generales del modelo base tras el ajuste fino.
- Sesgos desconocidos: al no documentarse la composicion del corpus, no se pueden evaluar sesgos de genero, religion o politica, especialmente sensibles en contenido en arabe.
- Riesgo de alucinacion inherente a un modelo de 1,5B parametros, agravado por la falta de evaluacion.
- El adaptador requiere cargar el modelo base Qwen2.5-1.5B-Instruct por separado; no es un checkpoint autonomo.
- Aunque la licencia es Apache 2.0, conviene verificar que el dataset de entrenamiento no imponga restricciones adicionales no declaradas.
- No apto para tareas que requieran razonamiento complejo, matematicas avanzadas o codigo de produccion sin validacion humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rodinaahmed30/qwen1.5b-masri-2-2ways
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
