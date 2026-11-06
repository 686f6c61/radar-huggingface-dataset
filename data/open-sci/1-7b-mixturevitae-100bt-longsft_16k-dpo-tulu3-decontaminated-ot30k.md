# open-sci/1.7b-MixtureVitae-100BT-longsft_16k-DPO-Tulu3-decontaminated-ot30k

## Resumen

El modelo `open-sci/1.7b-MixtureVitae-100BT-longsft_16k-DPO-Tulu3-decontaminated-ot30k` es un checkpoint de 1.714.377.728 parámetros publicado por la organización open-sci en Hugging Face. Por su nombre se deduce que parte de una base MixtureVitae de 100 mil millones de tokens, ha pasado por un ajuste supervisado de contexto largo (16k), una fase de DPO y un entrenamiento posterior sobre Tulu 3 con un subconjunto decontaminado de Open Thoughts (30.000 muestras). El identificador interno del modelo-index confirma que el entrenamiento se realizó sobre el dataset `open-thoughts_open_thoughts3-1.2_m_30000_samples`.

Se trata de un modelo derivado de la familia Llama (arquitectura transformer decoder-only de 1,7B parámetros), afinado con llama-factory y `generated_from_trainer`, empaquetado en safetensors y con código personalizado (`custom_code`), lo que implica que requiere `trust_remote_code=True` para cargarse. El repositorio ocupa 3,4 GB, coherente con pesos en fp32/bf16 de un modelo de este tamaño.

Su relevancia es fundamentalmente de investigación: es un experimento de ajuste fino de razonamiento sobre un modelo pequeño, con pipeline SFT → DPO → SFT largo, orientado a reproducibilidad del entrenamiento y a explorar si un 1,7B puede adquirir capacidades de razonamiento tipo cadena de pensamiento cuando se le entrena sobre datos sintéticos de alta calidad. La model card es automática y muy escasa: no declara idiomas, ni licencia concreta (solo `other`), ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), con `custom_code` |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (deducido del nombre `longsft_16k`) |
| Tipos de cuantizacion | no disponible (no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (con código personalizado) |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only de tipo Llama con 1,7B parámetros, entrenada en dos fases según el nombre del checkpoint: una base MixtureVitae de 100 mil millones de tokens y un ajuste fino de contexto largo a 16k tokens. Posteriormente se aplica DPO y un SFT final sobre Tulu 3 decontaminado con 30.000 muestras de Open Thoughts. El entrenamiento se ejecutó con llama-factory en modo `full` (no LoRA), con 32 dispositivos, batch total de 128 (batch 1 × 4 acumulación × 32 GPUs), learning rate 4e-5, scheduler coseno con warmup del 10 % y 5 épocas.

Detalles técnicos relevantes: se usó `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-8; el framework fue Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. El modelo declara `custom_code` y `generated_from_trainer`, lo que indica que el código de arquitectura no es estándar y debe cargarse desde el repositorio. No se documenta si hubo RLHF adicional más allá del DPO, ni la composición exacta del dataset de preentrenamiento MixtureVitae.

## Capacidades

- Generación de texto autoregresiva en un modelo de 1,7B parámetros.
- Razonamiento multi-paso: el pipeline incluye SFT sobre Open Thoughts (datos de razonamiento sintético) y DPO, orientado a producir cadenas de pensamiento.
- Contexto largo: ventana de 16.384 tokens, útil para documentos y conversaciones extensas.
- Ajuste instruccional: el SFT sobre Tulu 3 sugiere capacidad de seguir instrucciones y formato conversacional.
- Tool calling / function calling: no disponible (no se documenta soporte explícito).
- Capacidades de agente: no disponible (no se documenta soporte explícito).
- Multilingüismo: no disponible (no se declaran idiomas).
- Visión, audio o thinking mode explícito: no disponible.

## Casos de uso

- Investigación en ajuste fino de razonamiento: sirve como punto de partida reproducible para estudiar el efecto del pipeline SFT → DPO → SFT largo en modelos pequeños, dado que el autor documenta hiperparámetros y dataset.
- Prototipado de asistentes conversacionales ligeros: con 1,7B parámetros y contexto de 16k, se puede desplegar en una sola GPU para pruebas de concepto de chat multi-turno.
- Resumen de documentos de hasta 16k tokens: la ventana larga permite procesar informes o artículos completos en una sola pasada.
- Extracción de características (`feature-extraction` es el pipeline declarado): útil para embeddings de frases o representaciones internas en pipelines de búsqueda semántica.
- Generación de datos sintéticos de razonamiento: el modelo puede producir cadenas de pensamiento para destilar en modelos menores o para aumentar datasets.
- Evaluación comparativa de métodos de ajuste: al ser un checkpoint intermedio de una cadena de entrenamiento, permite medir la contribución de cada fase (DPO, SFT largo) en tareas controladas.
- Fine-tuning posterior en dominios verticales: al ser un modelo pequeño, se puede reajustar con LoRA en un único A100 o RTX 4090 para dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor contiene una entrada (`sft__f679a5c592c8dffb__1-7b-Mixtur-850f237b__sdpa-open-sci-steps__1.7b-Mixtur-850f237b`) con la lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,4 GB en fp16/bf16 (coincide con el tamaño del repo); ~7 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; A100/H100 solo necesarias para entrenamiento o batch grande.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por `custom_code`); vLLM, TGI y llama.cpp requieren conversión previa y no está garantizado el soporte del código personalizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-100BT-longsft_16k-DPO-Tulu3-decontaminated-ot30k | 1,71B | 16k (deducido) | other | Hugging Face, safetensors |
| TinyLlama-1.1B-Chat | 1,1B | 2k | Apache 2.0 | Hugging Face, GGUF |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Hugging Face, GGUF, vLLM |
| SmolLM2-1.7B-Instruct | 1,7B | 8k | Apache 2.0 | Hugging Face, GGUF |

Comparación de rendimiento: no disponible para el modelo open-sci (sin benchmarks publicados). Las alternativas citadas son modelos con licencias permisivas y ecosistema de despliegue maduro, frente a la licencia `other` y el `custom_code` de este checkpoint.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas del mismo tamaño.
- Licencia `other`: no se especifican términos de uso comercial; hay que consultar el repositorio antes de cualquier despliegue en producción.
- `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; riesgo de seguridad y de compatibilidad con versiones futuras de Transformers.
- Model card automática y sin completar: no se documentan sesgos, idiomas, datos de evaluación ni limitaciones declaradas por el autor.
- Riesgo de alucinación: inherente a modelos de 1,7B entrenados sobre datos sintéticos de razonamiento; sin evaluación, no se puede acotar.
- Contexto de 16k deducido del nombre del checkpoint, no verificado en la model card.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware limitado exige convertir los pesos manualmente.
- Dataset de SFT de solo 30.000 muestras: posible sobreajuste a ese dominio y escasa cobertura temática.
- Fecha de creación futura en los metadatos (2026-10-30): inconsistencia que conviene verificar antes de confiar en los metadatos del repo.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/1.7b-MixtureVitae-100BT-longsft_16k-DPO-Tulu3-decontaminated-ot30k
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
