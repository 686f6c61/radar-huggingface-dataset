# credible-ai/olmo2-1B-288domains-baseline

## Resumen

olmo2-1B-288domains-baseline es un modelo de lenguaje de 1.414 millones de parámetros desarrollado por credible-ai, construido sobre la arquitectura OLMo 2 de AI2 y entrenado desde cero con 32.000 millones de tokens procedentes del corpus WebOrganizer. No es un modelo de propósito general: se trata de un artefacto de investigación diseñado para reproducir el punto de partida (baseline) de los experimentos del artículo LinMix, que estudia la mezcla de datos como atribución lineal por dominio.

La particularidad del modelo reside en su mezcla de datos: los 32B tokens se muestrean sobre 288 dominios definidos por la combinación de tema y formato, respetando sus proporciones naturales en el corpus y sin ningún tipo de optimización de mezcla. Esto lo convierte en la referencia contra la que se comparan las mezclas optimizadas propuestas en el paper.

Con 18 capas, tamaño oculto de 2048 y tokenizador GPT-NeoX-20B (vocabulario de 50.432 tokens), el modelo está pensado para servir de base controlada en experimentos de data mixing, no para despliegues de producto. Su licencia MIT y la publicación de los pesos en bfloat16 facilitan su reutilización como punto de comparación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only OLMo 2 (Olmo2ForCausalLM) |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 de AI2, un transformer decoder-only con 18 capas y dimensión oculta de 2048, implementado en Transformers como `Olmo2ForCausalLM`. Utiliza el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 entradas. Los pesos se distribuyen en bfloat16 y el repositorio ocupa 2,8 GB.

El entrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens extraídos de WebOrganizer/Corpus-200B, un corpus derivado del pool DCLM 1b-1x (CC-BY-4.0) y sujeto a los términos de uso de Common Crawl. La mezcla de datos se define sobre 288 dominios de tema × formato en sus proporciones naturales, sin optimización de mezcla; el archivo `mix.json` del repositorio documenta dicha mezcla. No se indica en la información disponible si hubo fases de RLHF, DPO o ajuste fino posterior al preentrenamiento, ni se detalla la longitud de contexto empleada durante el entrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste de instrucciones.
- Modelado de lenguaje sobre dominios web diversos (288 combinaciones de tema y formato).
- Reproducción de experimentos de mezcla de datos: sirve como baseline controlado frente a mezclas optimizadas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan modos especiales (thinking, visión, audio) ni ajuste por instrucciones.

## Casos de uso

- Reproducción de experimentos de data mixing: el modelo permite replicar el baseline del paper LinMix y comparar métricas frente a mezclas optimizadas sobre los mismos 288 dominios.
- Investigación sobre atribución lineal de dominios: al haberse entrenado con proporciones naturales, sirve para aislar el efecto de cada dominio en el rendimiento final.
- Estudio de composición de corpus web: útil para analizar cómo afecta la distribución tema × formato del corpus WebOrganizer al comportamiento del modelo.
- Punto de control para pipelines de evaluación de mezclas: integrable en experimentos que midan perplejidad o downstream tasks antes y después de optimizar la mezcla.
- Enseñanza y divulgación sobre entrenamiento de LLM: su tamaño (1,41B) y su entrenamiento acotado (32B tokens) permiten experimentos de bajo coste en entornos académicos.
- Base para ajuste fino controlado: al ser un modelo base con licencia MIT, puede servir como inicialización en estudios que necesiten un punto de partida neutro respecto a la mezcla de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8-3,5 GB solo para pesos, más memoria para activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB; en 4 bits, alrededor de 1 GB (estimaciones a partir del número de parámetros, no verificadas en la model card).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente para inferencia en bfloat16; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de modelos con 6-8 GB o más.
- Opciones de despliegue: Transformers (soporte nativo de `Olmo2ForCausalLM`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| olmo2-1B-288domains-baseline | 1,41B | no disponible | MIT | Hugging Face | Baseline de investigación para LinMix |
| OLMo 2 1B (AI2) | ~1B | no disponible | Apache 2.0 | Hugging Face | Modelo base de referencia de la misma familia arquitectónica |
| Modelos base de ~1B de propósito general | ~1B | variable | variable | Hugging Face | No comparables directamente por ausencia de benchmarks publicados |

No se dispone de datos de rendimiento del modelo en benchmarks, por lo que la comparación cuantitativa con alternativas no es posible con la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como artefacto de investigación para reproducir LinMix.
- No ha pasado por ajuste de instrucciones ni por RLHF/DPO documentado; no es adecuado para uso conversacional directo.
- Entrenado únicamente en inglés; el rendimiento en otros idiomas no está caracterizado.
- Riesgo de alucinación y de generar contenido sesgado heredado del corpus web (DCLM/Common Crawl), sin filtrado ni mitigación documentados.
- Longitud de contexto no especificada en la información disponible.
- Aunque los pesos son MIT, los datos de entrenamiento están sujetos a los términos de uso de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; conviene revisar las implicaciones para uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-baseline
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentación OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
