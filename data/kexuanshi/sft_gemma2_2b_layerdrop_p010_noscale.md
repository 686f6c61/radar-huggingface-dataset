# KexuanShi/sft_gemma2_2b_layerdrop_p010_noscale

## Resumen

`KexuanShi/sft_gemma2_2b_layerdrop_p010_noscale` es un ajuste fino supervisado (SFT) sobre un modelo de la familia Gemma 2 de 2.000 millones de parámetros, publicado por el usuario KexuanShi en HuggingFace. El repositorio contiene 2.614.341.888 parámetros en formato safetensors (5,3 GB) y está etiquetado como `text-generation` con `transformers`, `trl` y `generated_from_trainer`. No declara licencia, idiomas, dataset de entrenamiento ni resultados de evaluación, y acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

El interés técnico del checkpoint está en su nombre: `layerdrop_p010_noscale` sugiere que durante el SFT se aplicó *layer dropout* con probabilidad 0,10 (es decir, cada capa del transformer se omite aleatoriamente con un 10 % de probabilidad en cada paso) y sin el reescalado compensatorio que habitualmente acompaña a esta técnica. Esto lo convierte en un artefacto de investigación orientado a estudiar regularización, tolerancia a la poda de capas y eficiencia de inferencia, más que en un modelo listo para producción.

Se trata, por tanto, de un experimento académico de reproducibilidad limitada: la model card generada automáticamente deja el modelo base como `None`, no documenta el dataset ni los hiperparámetros, y declara versiones de framework (TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0) que no se corresponden con ninguna versión publicada conocida en el momento de escribir esta ficha, lo que obliga a tratar cualquier afirmación sobre su comportamiento como no verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de tipo Gemma 2 (según el tag `gemma2` de la model card; detalles exactos de capas y configuración no disponibles en la documentación del autor). El modelo base de esta familia usa atención local/global intercalada y GQA |
| Parámetros totales | 2.614.341.888 (dato real de safetensors) |
| Parámetros activos | No aplica: arquitectura densa, no es MoE |
| Longitud de contexto | No disponible en la model card. La familia Gemma 2 2B declara 8.192 tokens en la documentación oficial de Google (no confirmado para este checkpoint) |
| Tipos de cuantización | No disponibles. El repositorio solo contiene safetensors; por el tamaño del repo (5,3 GB para 2,61 B de parámetros) se infiere precisión de 16 bits (bf16/fp16). La conversión a GGUF, GPTQ o AWQ es posible con herramientas estándar, pero no está publicada |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin especificar; no se puede verificar el uso comercial) |
| Formato de pesos | Safetensors (compatible con `transformers`; también etiquetado como `text-generation-inference` y `endpoints_compatible`) |

## Arquitectura y entrenamiento

El checkpoint parte de un modelo denso de la familia Gemma 2 de 2.000 millones de parámetros, un transformer decoder con normalización RMSNorm, activaciones GeGLU, atención con consultas agrupadas (GQA) y un patrón de atención intercalada entre ventanas locales y atención global completa. El modelo base de esta familia incorpora además *soft-capping* en los logits y fue entrenado originalmente mediante destilación de conocimiento desde un modelo mayor. Estos datos proceden de la documentación pública del modelo base y no están confirmados en la model card de este ajuste.

El entrenamiento documentado es exclusivamente SFT (supervised fine-tuning) ejecutado con TRL, sin evidencia de RLHF, DPO u otra etapa de alineamiento posterior. No se especifica el número de tokens de entrenamiento, la composición del dataset, la tasa de aprendizaje, el número de épocas ni la estrategia de enmascarado. La innovación declarada, implícita en el nombre del repositorio, es la aplicación de *layerdrop* con probabilidad 0,10 durante el ajuste: en un modelo base de 26 capas, esto implica omitir en media 2,6 capas por paso hacia delante. El sufijo `noscale` apunta a que no se aplicó el reescalado de activaciones o de salidas que suele compensar la pérdida de capas, aunque el autor no documenta esta decisión ni sus efectos. Las versiones de framework declaradas (TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1, Tokenizers 0.23.2) no coinciden con versiones publicadas conocidas, lo que dificulta la reproducción exacta del entorno.

## Capacidades

- Generación de texto autoregresiva: es la única tarea declarada en la model card (`pipeline: text-generation`), con soporte para `pipeline()` de Transformers y formato conversacional de entrada.
- Ajuste a instrucciones: al haberse entrenado con SFT, se espera cierta capacidad de seguir indicaciones, aunque ni el dataset ni la plantilla de chat están documentados, por lo que el formato exacto de prompt es desconocido.
- Razonamiento y matemáticas: no hay evidencia publicada. Por tamaño (2,6 B de parámetros), la capacidad esperable es limitada en tareas de razonamiento multi-paso.
- Generación de código: no documentada ni evaluada.
- Tool calling / function calling: no documentado.
- Uso agéntico y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; la familia base es multilingüe, pero este ajuste no declara idiomas.
- Modo de pensamiento (*thinking*), visión o audio: no disponibles. Es un modelo de texto y de 2,6 B de parámetros, sin torre multimodal.
- Tolerancia a la poda de capas: capacidad implícita y no verificada, derivada del entrenamiento con layerdrop; el checkpoint podría degradarse menos que el modelo base al eliminar capas en inferencia.

## Casos de uso

- Investigación en regularización con layerdrop: comparar este checkpoint con el modelo base Gemma 2 2B y con variantes `p` distintas para medir el efecto de la probabilidad de dropout de capas sobre la perplejidad y las métricas de generación. Requiere reconstruir un conjunto de evaluación propio, ya que el autor no publica ninguno.
- Estudio de tolerancia a la poda en inferencia: evaluar si un modelo entrenado con omisión aleatoria de capas mantiene calidad al eliminar físicamente capas en tiempo de despliegue, lo que permitiría reducir latencia y VRAM en producción.
- Prototipado local de asistentes conversacionales: con ~6-7 GB en bf16, el modelo cabe en GPUs de consumo, por lo que sirve para probar flujos de chat en local antes de invertir en modelos mayores.
- Base para un nuevo fine-tuning de dominio: el checkpoint puede reutilizarse como punto de partida para SFT con LoRA o QLoRA sobre datos propios en dominios concretos (legal, sanitario, atención al cliente), aprovechando su tamaño reducido para iterar rápido.
- Docencia y formación en SFT con TRL: ilustra un flujo completo de `SFTTrainer`, publicación en el Hub y etiquetado automático de model card, útil en cursos de ajuste fino.
- Experimentos de destilación: por su tamaño, puede actuar como alumno en pipelines de destilación desde modelos de 7-9 B, comparando el resultado con y sin layerdrop.
- Evaluación de riesgos de reproducibilidad: sirve como caso de estudio sobre model cards autogeneradas, campos vacíos (`None`) y ausencia de licencia, un problema recurrente en el ecosistema de checkpoints derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación (MMLU, GSM8K, HumanEval, MT-Bench ni similares), y el repositorio no adjunta scripts de evaluación ni logs de entrenamiento.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 5,2 GB solo para pesos, más caché KV y activaciones. Con la ventana de contexto completa del modelo base (8.192 tokens) el consumo total se sitúa aproximadamente entre 6 y 7 GB.
- VRAM estimada en cuantización de 8 bits: unos 2,7 GB de pesos, con un total de 4 GB aproximadamente.
- VRAM estimada en cuantización de 4 bits: alrededor de 1,5 GB de pesos, con un total de 2,5 a 3,5 GB según contexto y backend.
- GPU recomendadas para bf16: RTX 3090, RTX 4090, RTX 4080, A10G, L4, A100 y H100. Cualquier GPU con 8-12 GB o más puede ejecutarlo.
- GPU de consumo: sí, cabe holgadamente. En bf16 en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores; en 4 bits en GPUs de 8 GB (RTX 3060 8 GB, RTX 4060, RTX 2070) e incluso en CPU con llama.cpp, aunque con latencias altas.
- Opciones de despliegue: `transformers` con `pipeline`, vLLM, TGI (el repo está etiquetado como `text-generation-inference` y `endpoints_compatible`), HF Inference Endpoints, y llama.cpp / Ollama / LM Studio previa conversión a GGUF, que no está publicada en el repositorio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de la columna "modelo de referencia" proceden de las fichas oficiales de cada familia y deben verificarse antes de usarse; el checkpoint objeto de esta ficha no tiene métricas publicadas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| `KexuanShi/sft_gemma2_2b_layerdrop_p010_noscale` | 2,61 B | No disponible (base: 8.192) | No disponible | HuggingFace, safetensors | No disponible |
| Gemma 2 2B (base, Google) | 2,61 B | 8.192 tokens | Gemma Terms of Use | HuggingFace, Kaggle | Sí, en la ficha oficial |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens nativos | Apache 2.0 | HuggingFace | Sí, en la ficha oficial |
| Llama 3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | Sí, en la ficha oficial |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | HuggingFace | Sí, en la ficha oficial |

Frente a estas alternativas, la ventaja del checkpoint es exclusivamente experimental (el efecto del layerdrop), mientras que pierde en todo lo demás: no tiene licencia verificable, no documenta idiomas ni dataset, y carece de evaluaciones. Para uso práctico en producción, Qwen2.5-1.5B o SmolLM2-1.7B ofrecen licencias permisivas y métricas públicas.

## Limitaciones y advertencias

- Modelo sin documentación: la model card es una plantilla autogenerada por TRL, con el modelo base indicado como `None` y secciones de procedimiento de entrenamiento vacías. No se puede trazar el checkpoint exacto del que parte.
- Licencia no disponible: al no especificarse, no se puede confirmar que el uso comercial esté permitido. El modelo base pertenece a la familia Gemma, sujeta a los Gemma Terms of Use, pero el autor no lo declara.
- Idiomas no declarados: se desconoce si el SFT degradó el multilingüismo del modelo base o si se centró en un único idioma.
- Dataset de entrenamiento desconocido: implica riesgo de sesgos heredados no identificables, posible contaminación con datos de evaluación y ausencia de controles de seguridad.
- Solo SFT: no hay etapa de RLHF, DPO ni ajuste de seguridad documentada, por lo que la tasa de respuestas dañinas o no alineadas es impredecible.
- Riesgo de alucinación elevado: con 2,6 B de parámetros, la generación de hechos verificables es poco fiable, especialmente en dominios especializados.
- Razonamiento limitado: no se recomienda para matemáticas, código complejo ni razonamiento multi-paso sin verificación externa.
- Interno del entrenamiento no reproducible: las versiones declaradas (TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0) no corresponden a versiones publicadas conocidas; la fecha de creación del repositorio (2026-10-05) también resulta anómala, lo que resta fiabilidad a los metadatos.
- Efecto del layerdrop no medido: no hay comparación con el modelo base, por lo que se desconoce si el ajuste mejora, mantiene o degrada la calidad. Existe el riesgo de que el modelo esté sobreajustado a la omisión de capas y rinda peor en inferencia estándar con todas las capas activas.
- Ausencia de cuantizaciones publicadas: desplegarlo en GPUs pequeñas exige generar los GGUF o pesos cuantizados por cuenta propia.
- Sin mantenimiento aparente: 0 descargas y 0 likes, sin actualizaciones posteriores a la creación del repositorio.

## Enlaces

- [HuggingFace: KexuanShi/sft_gemma2_2b_layerdrop_p010_noscale](https://huggingface.co/KexuanShi/sft_gemma2_2b_layerdrop_p010_noscale)
- [TRL: Transformers Reinforcement Learning (GitHub)](https://github.com/huggingface/trl) — framework citado en la model card
- Modelo base citado en la model card: `https://huggingface.co/None` — marcador de posición, no resuelve a ningún repositorio
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este checkpoint en la información disponible.
