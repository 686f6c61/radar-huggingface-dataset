# JaydenTeoh/soft-mtp-1p2b-model

## Resumen

Soft-MTP 1p2b es un modelo de lenguaje autorregresivo de 1,27 mil millones de parámetros desarrollado por Jayden Teoh, publicado como uno de los doce checkpoints que acompañan el artículo "Multi-Token Prediction Done Right" (arXiv:2610.38331). Su rasgo distintivo es el objetivo de entrenamiento: la predicción multi-token (MTP) se realiza contra la propia distribución de próximo token del modelo, en lugar del token real observado, mediante un acoplamiento KL con recuperación de gradiente directo (straight-through) que solo cuesta una pasada hacia atrás y evita el softmax sobre el vocabulario.

El problema que aborda es la evaluación controlada del multi-token prediction: los doce checkpoints (tres objetivos distintos por cuatro tamaños) se entrenan con una receta idéntica (mismos datos, orden, semilla y planificador), de modo que las diferencias de rendimiento son atribuibles exclusivamente al objetivo de entrenamiento. Esto lo hace especialmente relevante como referencia experimental para investigadores que estudian MTP y decodificación especulativa.

Arquitecturalmente es un transformer decoder de 36 capas con hidden size 1536 y 24 cabezas de atención, entrenado sobre 31,5 mil millones de tokens de FineWeb-Edu con el tokenizador GPT-2. Las cabezas MTP son auxiliares y se descartan en inferencia: el modelo desplegado es un transformer estándar de próximo token de 1,27B parámetros, con la ventaja añadida de que las cabezas pueden servir como draft model para decodificación auto-especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder con cabezas MTP auxiliares (tipo hf_mtp, código remoto) |
| Parametros totales | 1.273M (1.272.975.360) |
| Parametros activos | no disponible (no es MoE; en despliegue se usan 1,27B, las cabezas MTP se descartan) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16/fp32, sin checkpoints cuantizados publicados) |
| Idiomas soportados | Inglés (entrenado exclusivamente con FineWeb-Edu) |
| Licencia | MIT |
| Formato de pesos | safetensors (5,1 GB de tamaño de repo) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 36 capas, hidden size 1536 y 24 cabezas de atención, con contexto de 2048 tokens. Sobre la red principal se añaden 3 cabezas MTP en cascada estilo DeepSeek (un bloque cada una). La innovación central del trabajo es el objetivo "soft MTP": cada cabeza MTP se entrena contra la distribución de próximo token `q` del propio modelo en lugar del token materializado `e_y`, mediante un acoplamiento KL con straight-through que elimina los componentes de gradiente problemáticos documentados en el artículo. El vocabulario se rellena de 50257 a 50304 tokens por alineación, con filas adicionales sin uso.

El entrenamiento se realizó sobre 31,5 mil millones de tokens de FineWeb-Edu (60.000 pasos, batch 256, secuencia 2048) con tokenizador BPE de GPT-2. Como optimizador se usó Muon sobre las matrices 2D ocultas y AdamW para embeddings, cabeza de salida y normalizaciones, con LR pico de 0,001 y descenso coseno hasta 1e-05, 2.000 pasos de warmup, weight decay 0,1 y precisión bf16 autocast sobre pesos maestros en fp32. Se ejecutó una única pasada por celda con semilla fija (13), compartida por los doce checkpoints del estudio.

## Capacidades

- Generación de texto en inglés (pipeline text-generation), entrenado sobre corpus educativo de calidad (FineWeb-Edu).
- Modelado de lenguaje base (no instruido ni alineado): no hay RLHF, DPO ni fine-tuning por instrucciones.
- Cabezas MTP aprovechables como draft model para decodificación auto-especulativa, acelerando la inferencia del propio modelo.
- Compatibilidad con la librería transformers mediante `trust_remote_code=True` (arquitectura definida por ficheros remotos, model_type `hf_mtp`).
- Tokenizador estándar GPT-2 (el repo no incluye ficheros de tokenizador; se carga el de gpt2).
- No soporta tool calling, agentes, visión ni audio (no está diseñado para ello).

## Casos de uso

- Investigación en multi-token prediction: sirve como checkpoint de referencia del objetivo "soft MTP" para comparar frente a los otros objetivos y tamaños del mismo estudio bajo receta idéntica.
- Decodificación especulativa auto-especulativa: las cabezas MTP pueden emplearse como draft model interno, generando borradores de tokens verificados por la red principal sin necesidad de un segundo modelo.
- Base para fine-tuning educativo o académico: al estar entrenado con FineWeb-Edu, es un punto de partida razonable para ajustar modelos de asistencia al estudio o resumen de material didáctico en inglés.
- Experimentación con optimizador Muon: útil como caso práctico reproducible para estudiar el comportamiento de Muon frente a AdamW en modelos de ~1B.
- Prototipado local de LLMs pequeños: con 1,27B parámetros y contexto de 2048, es manejable en GPU de consumo para pruebas de generación de texto.
- Estudio de reproducibilidad y ablations: la semilla, el orden de datos y el planificador compartidos facilitan réplicas controladas de experimentos sobre objetivos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las diferencias entre los doce checkpoints del estudio son atribuibles al objetivo de entrenamiento, pero no incluye métricas concretas (MMLU, HumanEval, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-5 GB en bf16/fp16 (1,27B parámetros, ~2,5 GB solo de pesos); cabe con holgura en GPUs de 8 GB.
- GPUs recomendadas: cualquier GPU de consumo moderna (RTX 3060 12 GB, RTX 4090, RTX 3090); no se requiere hardware de datacenter.
- Consumer GPU: sí, cabe cómodamente en GPUs de 8 GB o más incluso sin cuantización.
- Despliegue: transformers con `trust_remote_code=True` (vía oficial documentada); el repo indica `inference: false` en la model card, por lo que la inferencia serverless de HF no está habilitada. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (arquitectura de código remoto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Particularidad |
|---|---|---|---|---|---|
| JaydenTeoh/soft-mtp-1p2b-model | 1,27B (despliegue) | 2048 | FineWeb-Edu, 31,5B tokens | MIT | Cabezas MTP suaves, draft self-speculativo |
| GPT-2 (1.5B) | 1,5B | 1024 | WebText (~40 GB) | Licencia modificada MIT (pesos de OpenAI) | Mismo tokenizador; solo NTP |
| Pythia-1.4B (EleutherAI) | 1,4B | 2048 | The Pile, ~300B tokens | Apache 2.0 | Modelo base para investigación con checkpoints por paso |
| TinyLlama-1.1B | 1,1B | 2048 | ~3T tokens (SlimPajama, Starcoder) | Apache 2.0 | Mucho más entrenado, orientado a despliegue |

Nota: los comparables directos son los otros checkpoints del mismo estudio (mismos datos y receta, distinto objetivo), aunque sus IDs concretos no constan en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base (no chat ni instruct): generará continuaciones de texto, no respuestas a instrucciones, y no sigue system prompts de forma fiable.
- Entrenado solo en inglés: el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgo heredado de FineWeb-Edu: al proceder de contenido web educativo, puede reproducir sesgos presentes en ese corpus; no se documentan mitigaciones.
- Riesgo de alucinación típico de modelos base pequeños; no apto sin verificación para tareas factuales.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repo: revisar los ficheros de modelado antes de usar en producción.
- Los resultados del estudio proceden de una única ejecución por celda (una semilla): la varianza entre ejecuciones no está caracterizada en la información disponible.
- Licencia MIT: sin restricciones para uso comercial, pero al ser un modelo de investigación entrenado con solo 31,5B tokens, su calidad general es inferior a la de modelos de consumo de tamaño similar.
- No hay soporte de cuantización ni de runtimes de despliegue habituales (vLLM, llama.cpp), lo que limita opciones de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydenTeoh/soft-mtp-1p2b-model
- Artículo (arXiv): https://arxiv.org/abs/2610.38331
- Código (GitHub): https://github.com/JaydenTeoh/Soft-MTP
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador: https://huggingface.co/gpt2
