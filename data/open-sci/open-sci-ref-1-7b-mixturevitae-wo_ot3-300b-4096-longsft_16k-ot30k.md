# open-sci/open-sci-ref-1.7b-mixturevitae-wo_ot3-300B-4096-longsft_16k-ot30k

## Resumen

El modelo `open-sci-ref-1.7b-mixturevitae-wo_ot3-300B-4096-longsft_16k-ot30k` es un ajuste fino supervisado (SFT) de un modelo de referencia de la familia MixtureViTae, desarrollado por la organizacion open-sci. Con 1.714.377.728 parametros (aproximadamente 1,7 mil millones), se trata de un modelo compacto de tipo transformer entrenado sobre el dataset Open Thoughts 3 (open-thoughts3-1.2_m_30000_samples), un conjunto de 30.000 muestras orientado a razonamiento y pensamiento estructurado.

El identificador del modelo revela parte de su linaje: parte de una base preentrenada de 300B tokens con contexto de 4096 tokens ("300B-4096"), sobre la que se aplico un SFT de contexto largo de 16k ("longsft_16k") y un ajuste adicional sobre 30k muestras de Open Thoughts ("ot30k"). La nomenclatura "wo_ot3" sugiere que se excluyo alguna variante del dataset Open Thoughts 3 durante el entrenamiento, aunque la model card no lo detalla.

La relevancia de este modelo es acotada y de caracter experimental: se publica como referencia reproducible dentro de la investigacion abierta sobre ajuste fino de modelos pequenos para razonamiento, con licencia "other" y muy poca documentacion. No es un modelo orientado a produccion ni cuenta con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia MixtureViTae, segun el identificador; detalles no disponibles) |
| Parametros totales | 1.714.377.728 (~1,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (derivado del sufijo "longsft_16k"; base preentrenada a 4096) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (repo de 3,4 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo ("full", no LoRA) de un checkpoint de referencia de 1,7B parametros. El entrenamiento se realizo con LLaMA-Factory sobre el dataset `open-thoughts3-1.2_m_30000_samples` (30.000 muestras), con los siguientes hiperparametros declarados: learning rate de 4e-05, batch total de 128 (batch 1 x 4 pasos de acumulacion x 32 GPUs), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con warmup del 10% y semilla 42. El entrenamiento se ejecuto en 32 GPUs en configuracion multi-GPU.

El identificador indica que la base se preentreno con 300B tokens y ventana de 4096, y que posteriormente se extendio el contexto a 16k mediante SFT de contexto largo. El sufijo "sdpa" en el nombre del run de entrenamiento apunta al uso de atencion con Scaled Dot-Product Attention. No se dispone de informacion sobre la composicion exacta del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales; la model card es autogenerada por el Trainer y no aporta detalles.

## Capacidades

- Generacion de texto y razonamiento de estilo "chain-of-thought", dado el entrenamiento sobre Open Thoughts.
- Extraccion de caracteristicas (feature-extraction), que es el pipeline declarado en Hugging Face.
- Ajuste fino completo realizado con LLaMA-Factory, lo que facilita su reutilizacion como base para nuevos SFT.
- Soporte de contexto largo de hasta 16k tokens (tras el SFT de contexto largo).
- Compatibilidad con el ecosistema transformers (custom_code) y pesos en safetensors.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la documentacion.
- Capacidades multilingues: no disponible.
- Vision, audio o modo "thinking" explicito: no disponible.

## Casos de uso

- Investigacion reproducible en ajuste fino: sirve como checkpoint de referencia para estudiar el efecto del SFT de contexto largo (16k) sobre una base de 1,7B, replicando la receta de LLaMA-Factory con los hiperparametros publicados.
- Razonamiento sobre documentos largos en entornos de laboratorio: con 16k tokens de contexto puede procesar informes o articulos cientificos completos para tareas de extraccion y sintesis, siempre en contextos controlados.
- Generacion de datos sinteticos de razonamiento: al estar entrenado sobre Open Thoughts, puede emplearse para producir trazas de pensamiento que alimenten pipelines de destilacion o curacion de datasets.
- Base para SFT especifico de dominio: al ser un modelo pequeno (1,7B) y con ajuste completo publicado, es un punto de partida economico para adaptar a dominios verticales (legal, medico, financiero) con pocos recursos de GPU.
- Extraccion de caracteristicas y embeddings: el pipeline declarado (feature-extraction) permite usarlo como encoder para clasificacion, clustering o recuperacion semantica en prototipos.
- Experimentacion academica con contexto extendido: util para medir degradacion de rendimiento entre 4k y 16k tokens en modelos pequenos, comparando con la base preentrenada.
- Prototipado de asistentes de razonamiento en local: con 1,7B parametros cabe en GPUs de consumo, lo que permite iterar rapidamente en entornos de desarrollo sin infraestructura dedicada.

## Benchmarks y rendimiento

El model-index declarado por el autor contiene una entrada (`sft__f679a5c592c8dffb__open-sci-re-2c5a8535__sdpa-open-sci-steps`) con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,4 GB en FP16/BF16 para los pesos; ~1,7-2 GB en cuantizacion de 8 bits; ~1 GB en 4 bits (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado; A100/H100 no son necesarias para inferencia, pero si para reproducir el entrenamiento (32 GPUs en el run original).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, especialmente con cuantizacion y contextos por debajo de 8k.
- Opciones de despliegue: transformers (libreria declarada, con custom_code); vLLM, llama.cpp, Ollama y TGI no estan confirmados para esta arquitectura concreta y requeririan conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci-ref-1.7b-mixturevitae (este) | 1,7B | 16k | other | Hugging Face, 16 descargas | SFT experimental, sin benchmarks |
| Qwen2.5-1.5B | 1,5B | 32k | Apache 2.0 | Amplia | Modelo generalista con benchmarks publicados |
| SmolLM2-1.7B | 1,7B | 8k | Apache 2.0 | Amplia | Entrenado con recetas abiertas y evaluaciones publicadas |
| Llama-3.2-1B | 1,2B | 128k | Llama 3.2 Community | Amplia | Contexto muy superior y ecosistema maduro |

La comparacion es orientativa: no existen datos de rendimiento publicados para este modelo que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, lo que impide recomendar su uso en produccion sin evaluacion propia.
- Model card autogenerada e incompleta: secciones de descripcion, usos previstos y datos de entrenamiento marcadas como "More information needed".
- Licencia "other": las condiciones de uso comercial no estan explicitadas; es imprescindible contactar con el autor o revisar los terminos del repositorio antes de cualquier despliegue comercial.
- Idiomas soportados no declarados: el rendimiento fuera del ingles (o del idioma dominante del dataset Open Thoughts) es desconocido.
- Riesgo de alucinacion: inherente a modelos de 1,7B entrenados sobre datos de razonamiento sintetico, agravado por la falta de evaluacion.
- Contexto de 16k: aunque extendido, sigue siendo inferior al de alternativas contemporaneas (32k-128k) y puede degradarse en el extremo superior.
- Dataset de entrenamiento pequeno (30.000 muestras, 5 epocas): riesgo de sobreajuste al estilo y sesgos de Open Thoughts 3.
- Trazas de razonamiento: al entrenarse sobre datos de pensamiento, puede generar cadenas de razonamiento largas que incrementan la latencia y el consumo de tokens.
- Soporte de tool calling y agentes no confirmado: no debe asumirse su disponibilidad en pipelines agenticos.
- Arquitectura con `custom_code`: requiere confiar en el codigo remoto del repositorio o auditarlo antes de cargar el modelo con `trust_remote_code=True`.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/open-sci-ref-1.7b-mixturevitae-wo_ot3-300B-4096-longsft_16k-ot30k
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Open Thoughts (dataset de referencia): https://huggingface.co/datasets/open-thoughts/open-thoughts
- Paper, blog, repositorio o demo oficial del modelo: no disponibles en la informacion proporcionada.
