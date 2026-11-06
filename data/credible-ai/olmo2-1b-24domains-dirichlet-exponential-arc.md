# credible-ai/olmo2-1B-24domains-dirichlet-exponential-arc

## Resumen

Olmo2-1B-24domains-dirichlet-exponential-arc es un modelo de lenguaje de aproximadamente 1,41 mil millones de parametros, preentrenado sobre 32B de tokens del corpus WebOrganizer. No es un modelo de proposito general, sino un artefacto de investigacion creado por credible-ai para reproducir los experimentos del paper LinMix ("LinMix: Data Mixing as Linear Domain Attribution", arXiv:2610.37390). Su peculiaridad es que la mezcla de datos de entrenamiento se optimizo automaticamente con Olmix, un metodo que ajusta los pesos de mezcla entre 24 dominios tematicos del corpus para maximizar el rendimiento en el benchmark ARC.

La arquitectura subyacente es OLMo 2, con 18 capas y un tamaño oculto de 2048, y el tokenizador es el de GPT-NeoX-20B (vocabulario de 50.432 tokens). El metodo de optimizacion de mezcla utiliza un enjambre de modelos proxy de 30M de parametros (olmo2-30M-24domains-dirichlet) entrenados con mezclas Dirichlet, sobre los que se ajusta un sustituto exponencial que predice el rendimiento del modelo final.

Su relevancia actual radica en la linea de investigacion sobre data mixing: determinar la proporcion optima de dominios (codigo, matematicas, web, etc.) en el preentrenamiento es costosisimo, y herramientas como Olmix/LinMix permiten predecir el rendimiento de mezclas sin entrenar modelos completos. Este modelo sirve como punto de comparacion verificable para quien trabaje en optimizacion de mezclas de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (Olmo2ForCausalLM), transformer decoder-only |
| Parametros totales | 1.414.678.528 (~1,41B) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

Datos adicionales: 18 capas, tamaño oculto 2048, tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens, tamaño del repositorio 2,8 GB.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 de Allen AI, un transformer decoder-only convencional (no MoE) implementado en la libreria transformers de Hugging Face mediante la clase `Olmo2ForCausalLM`. Con 1,41B de parametros distribuidos en 18 capas y una dimension oculta de 2048, se trata de un modelo pequeno orientado a experimentos controlados. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 tokens.

El entrenamiento se realizo sobre 32B de tokens procedentes del corpus WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x de Common Crawl), utilizando el framework OLMo-core. La innovacion central no esta en la arquitectura sino en la composicion de los datos: la mezcla sobre los 24 dominios tematicos del corpus se optimizo con Olmix, que entrena un enjambre de modelos proxy de 30M con mezclas muestreadas de una distribucion Dirichlet, ajusta un sustituto exponencial que modela el rendimiento en funcion de los pesos de mezcla, y lo optimiza para maximizar la puntuacion en ARC. La mezcla resultante se publica en el archivo `mix.json` del repositorio. No se menciona ningun post-entrenamiento (RLHF, DPO o instruction tuning): es un modelo base preentrenado.

## Capacidades

- Generacion de texto en ingles como modelo base (sin instruction tuning): completacion de texto, modelado de lenguaje general.
- Rendimiento optimizado para el benchmark ARC (AI2 Reasoning Challenge), lo que sugiere cierta capacidad de razonamiento de sentido comun/ciencia acorde a su tamaño, aunque el objetivo del modelo es la reproducibilidad cientifica, no maximizar la utilidad practica.
- No hay evidencia de capacidades de: codigo especializado, matematicas avanzadas, vision, audio ni soporte de tool calling o function calling.
- No es adecuado para agentes ni razonamiento multi-paso: es un modelo base de 1B sin alineacion.
- Utilidad principal como objeto de estudio: comparacion de estrategias de mezcla de datos, ablations y reproduccion del paper LinMix.

## Casos de uso

- Reproduccion de experimentos del paper LinMix: el modelo existe precisamente para verificar los resultados de optimizacion de mezclas de datos publicados en arXiv:2610.37390.
- Investigacion en data mixing: sirve como punto de comparacion para probar nuevos metodos de optimizacion de mezclas (Dirichlet, surrogatos, modelos proxy) sobre el mismo corpus y arquitectura.
- Estudio de escalado de modelos proxy: permite analizar cuan bien un sustituto ajustado sobre modelos de 30M predice el rendimiento de un modelo de 1,41B entrenado con la misma mezcla.
- Analisis de influencia de dominios tematicos: comparando este modelo con variantes hermanas del mismo autor (otras mezclas sobre los mismos 24 dominios) se puede medir el efecto de cada dominio en benchmarks concretos.
- Linea base (baseline) de preentrenamiento: al ser un modelo base de 1,41B entrenado con datos abiertos y licencia MIT, es util como baseline reproducible para experimentos de entrenamiento continuo o ablacion.
- Educacion e investigacion formativa: su pequeño tamaño (2,8 GB en bf16) lo hace accesible para practicas de preentrenamiento y evaluacion en entornos academicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Solo se sabe que la mezcla de datos fue optimizada para el benchmark ARC, pero no se indica la puntuacion obtenida ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,9 GB en bfloat16 (1,41B de parametros a 2 bytes por parametro), mas overhead de activaciones y KV cache; con cuantizacion a 8 bits o 4 bits (si se aplica externamente) cabria en torno a 1,5 GB o menos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, RTX 4060 Ti o superior ejecuta el modelo con holgura. No se necesitan A100 ni H100 para inferencia.
- Cabe comodamente en GPUs consumer: si, incluso en GPUs de 6-8 GB de VRAM. Para entrenamiento o fine-tuning completo, una GPU de 24 GB (RTX 4090, A5000) o una A100 es recomendable.
- Opciones de despliegue: transformers (uso nativo, como muestra la model card); al ser un modelo OLMo 2 compatible con transformers, deberia funcionar tambien con vLLM y TGI para servicion con batch; la compatibilidad con llama.cpp/GGUF y Ollama no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| olmo2-1B-24domains-dirichlet-exponential-arc | ~1,41B | no disponible | MIT | Artefacto de investigacion (data mixing, paper LinMix) |
| OLMo 2 1B (Allen AI) | ~1,5B | hasta 4096+ | Apache 2.0 | Modelo base de proposito general, open source completo |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens (131.072 con YaRN) | Qwen Research / Apache 2.0 (algunas variantes) | Modelo general con instruction tuning y multilingüe |
| SmolLM2-1.7B (Hugging Face) | 1,71B | 8.192 tokens | Apache 2.0 | Modelo general compacto con datos de entrenamiento abiertos |

A diferencia de OLMo 2 1B, Qwen2.5-1.5B o SmolLM2-1.7B, que son modelos generalistas con post-entrenamiento, este modelo es un experimento controlado: misma arquitectura y corpus, pero mezcla de datos optimizada para un benchmark concreto. No es sustituto de ninguno de ellos para aplicaciones de produccion.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card advierte que es un artefacto de investigacion para reproducir el paper LinMix, no un asistente o modelo productivo.
- Modelo base sin instruction tuning: no sigue instrucciones de forma fiable, no soporta chat ni tool calling.
- Limitado al ingles: el corpus WebOrganizer y el tokenizador estan orientados a texto en ingles.
- Riesgo de alucinacion alto, tipico de modelos base pequenos; no debe usarse para generar informacion factual sin verificacion.
- Sesgos heredados de Common Crawl: los datos de entrenamiento provienen de un pool de Common Crawl (DCLM 1b-1x) y pueden contener sesgos, contenido tóxico o informacion desactualizada.
- La mezcla fue optimizada para ARC, lo que puede degradar el rendimiento en otras tareas (sobreajuste de la mezcla a un benchmark).
- Longitud de contexto no documentada en la model card; verificarla empiricamente antes de usos con textos largos.
- Licencia MIT para los pesos, pero los datos de entrenamiento (Common Crawl / CC-BY-4.0) tienen sus propios terminos de uso que hay que respetar en usos derivados.
- Proyecto con traccion muy baja (227 descargas, 0 likes en el momento de la ficha): escasa validacion comunitaria y soporte limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-dirichlet-exponential-arc
- Paper LinMix (arXiv): https://arxiv.org/abs/2610.37390
- Codigo (GitHub): https://github.com/credibleai/linmix
- Modelo proxy de 30M: https://huggingface.co/credible-ai/olmo2-30M-24domains-dirichlet
- Corpus de entrenamiento: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Corpus tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM original: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentacion de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
