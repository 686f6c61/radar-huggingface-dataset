# credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-cpile

## Resumen

olmo2-1B-24domains-dirichlet-lightgbm-cpile es un modelo lingüístico de 1,41B parámetros preentrenado sobre 32B tokens del corpus WebOrganizer, con las proporciones de mezcla de sus 24 dominios temáticos optimizadas mediante RegMix (un sustituto LightGBM ajustado sobre un enjambre de modelos pequeños Dirichlet) para minimizar los bits por byte en texto de validación de Common Pile. Lo ha publicado credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix ("Data Mixing as Linear Domain Attribution", arXiv:2610.37390).

El modelo no es un asistente de propósito general ni un modelo alineado: se trata de un modelo base preentrenado sin RLHF ni DPO, cuyo interés principal es científico. Permite estudiar cómo la atribución lineal de dominios en la mezcla de datos afecta a la calidad del preentrenamiento, un tema relevante en la investigación actual sobre data mixing para LLM.

La arquitectura es OLMo 2 (Olmo2ForCausalLM) con 18 capas y tamaño oculto 2048, tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens, y pesos en bfloat16 (safetensors). El entrenamiento se realizó con OLMo-core.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo 2 (Olmo2ForCausalLM), decoder transformer |
| Parámetros totales | 1.414.678.528 (≈1,41B) |
| Parametros activos | no disponible (no hay indicios de MoE; se asume densidad completa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 / términos de Common Crawl |
| Formato de pesos | safetensors (bfloat16), tamaño del repo 2,8 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 de Allen AI: un transformer decoder de 18 capas con tamaño oculto 2048 y 1,41B parámetros, implementado como Olmo2ForCausalLM en la librería transformers. Usa el tokenizador GPT-NeoX-20B con un vocabulario de 50.432 tokens.

El preentrenamiento cubrió 32B tokens procedentes del corpus WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x), clasificado en 24 dominios temáticos. La novedad central es el método de mezcla de datos: RegMix, donde un modelo sustituto LightGBM se ajusta sobre un enjambre de modelos de 30M preentrenados con mezclas Dirichlet (credible-ai/olmo2-30M-24domains-dirichlet) para predecir los bits por byte en texto held-out de Common Pile, y las ponderaciones óptimas se aplican al entrenamiento del modelo de 1B. El entrenamiento se ejecutó con OLMo-core. No hay indicios de RLHF, DPO ni instrucción tuning: es un modelo base. La mezcla exacta de entrenamiento está disponible en el archivo `mix.json` del repositorio.

## Capacidades

- Generación de texto en inglés como modelo base (continuación de texto, no diálogo).
- Modelado del lenguaje a pequeña escala apto para experimentos de preentrenamiento, ablation y análisis de data mixing.
- Reproducción de los experimentos del artículo LinMix sobre atribución lineal de dominios.
- No está pensado para razonamiento complejo, código, matemáticas ni tareas de instrucción.
- Sin soporte documentado de tool calling, agentes, visión ni audio.
- Sin capacidades multilingües documentadas: entrenado solo con datos en inglés.

## Casos de uso

- Reproducción de la investigación LinMix: el caso de uso principal declarado por el autor; permite replicar los experimentos de atribución lineal de dominios con los pesos y `mix.json` publicados.
- Investigación en data mixing: sirve como punto de comparación controlado (misma arquitectura, mismos datos, distinta mezcla) para estudiar el impacto de las proporciones de dominios en la pérdida de validación.
- Estudios de escalado con sustitutos (proxy models): junto con el enjambre de 30M, permite validar metodologías de predicción de calidad de mezcla sin entrenar modelos grandes.
- Análisis de composición de datos web: al estar entrenado sobre 24 dominios etiquetados de WebOrganizer, facilita estudios de cómo cada tipo de contenido web afecta al modelado del lenguaje.
- Benchmarking de infraestructura de preentrenamiento: con 1,41B parámetros y 32B tokens es un objetivo realista para probar pipelines de entrenamiento basados en OLMo-core.
- Baseline educativo: útil para cursos o tutoriales sobre preentrenamiento de LLM open source con un modelo pequeño, reproducible y con licencia permisiva.

No es adecuado para producción de asistentes, RAG ni aplicaciones de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La métrica de optimización referenciada en la model card es bits por byte sobre texto held-out de Common Pile, pero no se proporcionan valores numéricos. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,41B parámetros en bfloat16 (2,8 GB de pesos), aproximadamente 4-5 GB de VRAM incluyendo activaciones y caché de KV; menos con cuantización (no publicada oficialmente).
- GPU recomendadas: cualquier GPU moderna de gama media es suficiente; por ejemplo, una RTX 3060 de 12 GB o RTX 4090 ejecuta el modelo con holgura. No se requieren A100 ni H100 para inferencia.
- Cabe cómodamente en GPUs de consumo: cualquier tarjeta con 6 GB o más de VRAM.
- Entrenamiento (reproducción del preentrenamiento de 32B tokens): requiere infraestructura multi-GPU; no hay detalles publicados sobre el número de GPUs o horas de cómputo.
- Opciones de despliegue: transformers (código de carga oficial en la model card). La arquitectura Olmo2ForCausalLM está soportada de forma nativa en transformers; el soporte en llama.cpp, Ollama, vLLM o TGI no está documentado en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Propósito |
|---|---|---|---|---|---|
| olmo2-1B-24domains-dirichlet-lightgbm-cpile | 1,41B | no disponible | 32B tokens (WebOrganizer, mezcla RegMix) | MIT | Artefacto de investigación (LinMix) |
| OLMo 2 1B (Allen AI) | ≈1,5B | 4.096 tokens (según familia OLMo 2) | Multi-token, dataset OLMo 2 | Apache 2.0 | Modelo base de propósito general |
| Pythia 1.4B (EleutherAI) | 1,4B | 2.048 tokens | ~300B tokens (The Pile) | Apache 2.0 | Modelo base para investigación |

Nota: los datos de OLMo 2 1B y Pythia son aproximados y provienen de conocimiento general, no de la información proporcionada para esta ficha. La diferencia clave es que el modelo de credible-ai está optimizado para un experimento específico de mezcla de datos, no para maximizar rendimiento en benchmarks generales.

## Limitaciones y advertencias

- No es un modelo de propósito general: la propia model card advierte que es un artefacto de investigación, no un modelo de lenguaje de uso general.
- Modelo base sin alineación: no sigue instrucciones, no está ajustado con RLHF/DPO y puede generar texto ofensivo, sesgado o incoherente.
- Riesgo alto de alucinación y de generación de contenido sin veracidad factual, agravado por su tamaño (1,41B) y su preentrenamiento limitado a 32B tokens.
- Entrenado solo en inglés; rendimiento impredecible en otros idiomas.
- Sesgos heredados de Common Crawl y del pool DCLM: los datos de entrenamiento provienen de rastreo web y pueden contener sesgos sociales, de género, de lengua y de calidad.
- Longitud de contexto no documentada; verificar el valor en la configuración del modelo antes de usos con documentos largos.
- Licencia MIT en los pesos, pero los datos de entrenamiento están sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl, lo que puede tener implicaciones para ciertos usos comerciales de derivados.
- Repositorio con muy poca tracción (224 descargas, 0 likes en el momento de la ficha): escasa validación comunitaria y posible ausencia de correcciones o soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-cpile
- Artículo LinMix (arXiv): https://arxiv.org/abs/2610.37390
- Código (GitHub): https://github.com/credibleai/linmix
- Enjambre proxy (30M, Dirichlet): https://huggingface.co/credible-ai/olmo2-30M-24domains-dirichlet
- Dataset de entrenamiento: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM original: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentación de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core (GitHub): https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
