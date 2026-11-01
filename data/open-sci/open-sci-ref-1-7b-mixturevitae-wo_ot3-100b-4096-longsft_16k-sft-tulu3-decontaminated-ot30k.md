# open-sci/open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096-longsft_16k-SFT-Tulu3-decontaminated-ot30k

## Resumen

El modelo `open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096-longsft_16k-SFT-Tulu3-decontaminated-ot30k` es un ajuste fino supervisado (SFT) publicado por la organización open-sci en HuggingFace. Se trata de un transformer de 1.714.377.728 parámetros (~1,7B) construido sobre una base denominada "mixturevitae" con una ventana de contexto de 4096 tokens, según se deduce del propio identificador del repositorio. El modelo está etiquetado como `feature-extraction` en el pipeline de HuggingFace, aunque su nombre y el proceso de entrenamiento (SFT con llama-factory sobre un dataset de open-thoughts) apuntan a un uso como modelo de lenguaje generativo ajustado para seguir instrucciones.

El ajuste se realizó con llama-factory en modalidad "full" (sin LoRA), partiendo de un checkpoint previo y entrenando sobre un subconjunto de 30.000 muestras del dataset open-thoughts3 (identificado en la model card como `open-thoughts_open_thoughts3-1.2_m_30000_samples`). El nombre incluye referencias a "Tulu3" y "decontaminated", lo que sugiere que el conjunto de datos de instrucciones deriva del ecosistema Tulu 3 y ha pasado por un proceso de decontaminación respecto a benchmarks.

La relevancia de este modelo es principalmente como artefacto de investigación dentro de la iniciativa open-sci: un experimento reproducible de ajuste fino sobre una arquitectura de ~1,7B con contexto de 4096 tokens. No obstante, la documentación publicada es mínima (la model card está autogenerada por el Trainer y no incluye descripción, usos previstos ni evaluación), por lo que muchos datos técnicos deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de "mixturevitae", según el identificador del repositorio); detalles no disponibles |
| Parametros totales | 1.714.377.728 (~1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (según el identificador del repositorio); no confirmado en la model card |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp32/bf16 presumiblemente; no se listan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no especificada; requiere consultar el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `transformers` y la referencia "mixturevitae" en el nombre del repositorio. El recuento real de parámetros (1.714.377.728) corresponde a un modelo denso de aproximadamente 1,7B. El contexto de 4096 tokens aparece en el identificador junto a "longsft_16k", lo que sugiere que el ajuste se realizó sobre secuencias largas (posiblemente hasta 16k en alguna fase), aunque no hay confirmación en la model card.

El entrenamiento fue un SFT completo (no LoRA) con llama-factory, sobre un dataset de tipo `arrow` derivado de open-thoughts3 (30.000 muestras). Los hiperparámetros documentados son: learning rate 4e-05, batch size total 128 (batch 1 × 32 dispositivos × 4 pasos de acumulación), optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con warmup del 10%, 5 épocas completas y semilla 42. El entrenamiento se ejecutó en 32 GPUs en paralelo. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO posteriores. Las versiones de framework son Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2.

## Capacidades

- Generación de texto y ajuste a instrucciones: el proceso de SFT sobre un dataset de razonamiento (open-thoughts) sugiere capacidad para seguir instrucciones y producir respuestas en formato conversacional, aunque no se documenta explícitamente.
- Razonamiento multi-paso: el dataset de origen (open-thoughts) está orientado a cadenas de pensamiento, por lo que es plausible cierta capacidad de razonamiento, sin evaluación publicada.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Capacidades de agente: no disponible; no se documenta.
- Multilingüismo: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponible; el pipeline declarado es `feature-extraction`, sin indicios de modalidades adicionales.
- Extracción de características: el pipeline de HuggingFace lo clasifica como `feature-extraction`, por lo que puede usarse para obtener representaciones ocultas.

## Casos de uso

- Experimentación en investigación sobre SFT: el modelo sirve como referencia reproducible de un ajuste fino completo con llama-factory sobre 30.000 muestras, útil para estudiar el efecto del SFT en modelos de ~1,7B y comparar hiperparámetros.
- Extracción de embeddings y características: dado el pipeline `feature-extraction`, puede emplearse para obtener representaciones de texto en tareas de clasificación, clustering o recuperación (retrieval), siempre que se valide su calidad empíricamente.
- Generación de texto asistida en prototipos: con 1,7B parámetros y contexto de 4096 tokens, es adecuado para prototipos de generación de texto en local o en una sola GPU, con coste bajo de inferencia.
- Evaluación de decontaminación: el sufijo "decontaminated" lo hace interesante para estudiar cómo afecta la limpieza del dataset de instrucciones al rendimiento en benchmarks frente a modelos entrenados sin filtrar.
- Base para ajustes posteriores (fine-tuning): al ser un checkpoint SFT completo, puede servir como punto de partida para DPO, RLHF o ajustes específicos de dominio en modelos pequeños.
- Investigación sobre reasoning datasets: permite analizar cómo un modelo de 1,7B absorbe datos de cadenas de pensamiento de open-thoughts y qué tipo de respuestas genera en tareas de razonamiento.

## Benchmarks y rendimiento

La model-index del autor declara un único entry (`sft__f679a5c592c8dffb__open-sci-re-663176ce__sdpa-open-sci-steps`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 3,4 GB solo para pesos (1,7B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, unos 5-6 GB para contexto moderado. En cuantización de 8 bits, ~1,7 GB de pesos; en 4 bits, ~0,9 GB (aunque no se publican versiones GGUF oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4070); para mayor throughput, A100 o H100 en despliegues por lotes.
- ¿Cabe en consumer GPU? Sí, en la mayoría de GPUs consumer modernas con 8 GB o más; también podría ejecutarse en CPU con llama.cpp si se generan pesos GGUF (no disponibles oficialmente).
- Opciones de despliegue: transformers (nativo), vLLM y TGI son viables al ser un transformer estándar; llama.cpp/Ollama requerirían conversión a GGUF. El modelo usa `custom_code`, por lo que puede necesitar `trust_remote_code=True`.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a características estructurales frente a alternativas de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| open-sci-ref-1.7b-mixturevitae (este) | ~1,7B | 4096 (según ID) | other | safetensors | SFT con llama-factory, sin benchmarks publicados |
| Qwen2.5-1.5B | 1,5B | 32.768 | Apache 2.0 | safetensors, GGUF | Amplia documentación y benchmarks publicados |
| Llama 3.2-1B | 1,2B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Ecosistema maduro, evaluación oficial |
| SmolLM2-1.7B | 1,7B | 8192 | Apache 2.0 | safetensors, GGUF | Entrenado con receta abierta y benchmarks publicados |

La comparación de rendimiento no está disponible para este modelo; las alternativas citadas sí publican evaluaciones oficiales.

## Limitaciones y advertencias

- Documentación insuficiente: la model card está autogenerada y no describe usos previstos, datos de entrenamiento detallados ni evaluación; no debe usarse en producción sin validación propia.
- Riesgo de alucinación: sin evaluación publicada, se desconoce la tasa de alucinación; en modelos de 1,7B ajustados con SFT es habitual que sea elevada.
- Sesgos: no se documenta ningún análisis de sesgos; el dataset de origen (open-thoughts) puede introducir sesgos de dominio y de idioma.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera del inglés es desconocido.
- Contexto limitado: 4096 tokens (según el identificador) es una ventana corta frente a modelos actuales de 32k-128k; no apto para tareas de contexto largo.
- Licencia "other": no se especifican términos de uso comercial; es imprescindible revisar el repositorio y contactar con el autor antes de cualquier uso comercial.
- `custom_code`: requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio; revisar antes de cargar.
- Madurez: 15 descargas y 0 likes en el momento de la consulta; sin señales de validación por la comunidad.
- Fecha de creación futura (2026-10-30): el modelo aparece con fecha posterior a la actual, lo que puede indicar un artefacto de generación o un repositorio de prueba; verificar su vigencia.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096-longsft_16k-SFT-Tulu3-decontaminated-ot30k
- Organización open-sci en HuggingFace: https://huggingface.co/open-sci
- llama-factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset open-thoughts (referencia en la model card): https://huggingface.co/datasets/open-thoughts/open-thoughts
- Tulu 3 (referencia en el nombre del modelo): https://huggingface.co/allenai
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
