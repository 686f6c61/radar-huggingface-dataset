# open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated-sr30k

## Resumen

open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated-sr30k es un ajuste fino supervisado (SFT) de un modelo de referencia de 1.714 millones de parametros publicado por la organizacion open-sci en HuggingFace. El modelo parte de ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated, que a su vez parece derivar de un checkpoint Nemotron de 1.7B con ventana de contexto de 16k y entrenamiento sobre datos Tulu3 decontaminados. Este ajuste concreto se ha entrenado sobre el dataset Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf, un conjunto de 30.000 muestras de razonamiento generadas por gpt-oss-120b en formato ShareGPT.

El modelo se distribuye con la libreria transformers y pesos en safetensors (3,4 GB de repositorio), esta etiquetado para la tarea de feature-extraction y se ha entrenado con LLaMA-Factory en configuracion full fine-tuning (no LoRA) sobre 32 dispositivos. Su relevancia es acotada: se trata de un checkpoint de investigacion con 14 descargas y sin resultados de evaluacion publicados, pensado para experimentacion sobre destilacion de razonamiento en modelos pequenos, no como un modelo listo para produccion.

La informacion disponible es muy limitada: la model card es autogenerada por el Trainer, no declara idiomas soportados, no incluye benchmarks y la licencia figura como "other" sin terminos especificados. Cualquier uso en produccion requiere validacion propia y contacto con el autor para aclarar la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de la familia Nemotron; detalles no disponibles) |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 16k tokens (segun el nombre del checkpoint base) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados en la model card) |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del checkpoint ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated, que por su nomenclatura corresponde a un transformer decoder-only de 1,7B parametros con contexto de 16k, entrenado previamente sobre datos Tulu3 decontaminados y, presumiblemente, sobre un corpus de referencia de alta calidad ("hq-300B"). No se dispone de informacion publicada sobre el numero exacto de tokens de preentrenamiento, la composicion del dataset original ni si hubo fases de RLHF o DPO.

El entrenamiento de este checkpoint se realizo con LLaMA-Factory sobre el dataset Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf, compuesto por 30.000 muestras en formato ShareGPT generadas por gpt-oss-120b y orientadas a razonamiento. Los hiperparametros documentados son: learning rate 4e-05, batch total de 128 (batch 1 x 32 dispositivos x 4 pasos de acumulacion), 5 epocas, scheduler coseno con warmup ratio 0,1, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, semilla 42 y tipo distribuido multi-GPU. El entrenamiento se ejecuto con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto autoregresiva en el estilo de la familia Nemotron subyacente, con contexto de hasta 16k tokens.
- Razonamiento multi-paso: el dataset de ajuste (Superior-Reasoning-SFT) esta orientado a trazas de razonamiento destiladas de gpt-oss-120b, por lo que el modelo esta expuesto a cadenas de pensamiento largas.
- Generacion de codigo y matematicas: no verificado con benchmarks; la model card no aporta evaluaciones.
- Tool calling / function calling: no documentado por el autor; no se puede asumir soporte.
- Capacidades de agente y multi-step reasoning: no documentadas; el formato ShareGPT del dataset sugiere entrenamiento conversacional multi-turno, pero sin garantias.
- Capacidades multilingues: no declaradas; los idiomas soportados figuran como "no disponibles".
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.
- Uso previsto declarado: feature-extraction segun el pipeline de HuggingFace, aunque el ajuste SFT sugiere un uso generativo.

## Casos de uso

- Experimentacion academica en destilacion de razonamiento: el modelo sirve como punto de partida para estudiar como un modelo de 1,7B absorbe trazas de razonamiento generadas por un modelo mucho mayor (gpt-oss-120b) mediante SFT, comparando curvas de perdida y calidad de las cadenas generadas.
- Base para posteriores ajustes (continued pretraining o DPO): al ser un full fine-tune con licencia abierta (aunque "other"), puede reutilizarse como inicializacion en pipelines de LLaMA-Factory para tareas especificas de dominio.
- Generacion de datos sinteticos de razonamiento: con 16k de contexto puede producir cadenas de pensamiento para aumentar datasets propios, siempre que se valide la calidad de las salidas.
- Prototipado de asistentes conversacionales multi-turno: el formato ShareGPT del entrenamiento permite probar dialogos encadenados en entornos de laboratorio, no en produccion sin evaluacion previa.
- Extraccion de caracteristicas (feature-extraction): el pipeline declarado permite usar las representaciones internas del modelo para tareas de clasificacion o clustering en investigacion, aunque no se documenta que sea un modelo de embeddings optimizado.
- Reproducibilidad de experimentos: los hiperparametros completos (learning rate, batch, epocas, versiones de librerias) estan documentados, lo que facilita replicar el ajuste en un cluster con 32 GPUs.
- Evaluacion comparativa de tecnicas de SFT: util como baseline de 1,7B en estudios que comparen full fine-tuning frente a LoRA o QLoRA sobre el mismo dataset de razonamiento.

## Benchmarks y rendimiento

El model-index del autor declara una entrada (sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__models-ali-elganzor__sdpa-open-sci-ste) con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,8-2 GB de pesos; en 4 bits, aproximadamente 1-1,2 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) es suficiente para inferencia en FP16; para entrenamiento full fine-tuning se documenta un despliegue multi-GPU con 32 dispositivos.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM, especialmente con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada, requiere custom_code); vLLM, llama.cpp, Ollama y TGI no estan verificados por el autor y requeririan conversion de pesos (no se publican GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b-...-sr30k (este) | 1,7B | 16k | other | HuggingFace, 14 descargas | SFT sobre 30k muestras de razonamiento de gpt-oss-120b |
| ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated | 1,7B | 16k | no disponible | HuggingFace (modelo base) | Checkpoint previo sobre Tulu3 decontaminado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | HuggingFace, ampliamente desplegado | Alternativa consolidada de tamano similar con benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,2B | 128k | Llama 3.2 Community License | HuggingFace | Menor, contexto mucho mayor, ecosistema maduro |

La comparacion con Qwen2.5 y Llama-3.2 es orientativa por tamano; no existen datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni ninguna otra tarea; no debe asumirse ningun nivel de rendimiento.
- Model card autogenerada e incompleta: secciones de descripcion, usos previstos y datos de entrenamiento figuran como "More information needed".
- Licencia "other" sin terminos explicitos: el uso comercial es incierto y requiere consultar al autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion: al ser un modelo pequeno (1,7B) ajustado sobre datos sinteticos de razonamiento, es probable que genere cadenas de pensamiento plausibles pero incorrectas; no verificado.
- Sesgos desconocidos: no se documenta la composicion del dataset de preentrenamiento ni del de ajuste, por lo que no se pueden evaluar sesgos de genero, idioma o dominio.
- Idiomas no declarados: no hay garantia de comportamiento multilingue; el entrenamiento probablemente este dominado por ingles.
- Contexto limitado a 16k: insuficiente para tareas de documentos largos o agentes con historial extenso.
- Requiere custom_code en transformers: la carga no es estandar y puede romperse con versiones futuras de la libreria.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ publicados, lo que complica el despliegue en llama.cpp u Ollama sin conversion propia.
- Trazas de razonamiento sinteticas: el dataset generado por gpt-oss-120b puede contener errores propagados que el modelo reproduzca.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web proporcionada.
