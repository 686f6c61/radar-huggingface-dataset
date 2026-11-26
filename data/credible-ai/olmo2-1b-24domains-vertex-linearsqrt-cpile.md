# credible-ai/olmo2-1B-24domains-vertex-linearsqrt-cpile

## Resumen

olmo2-1B-24domains-vertex-linearsqrt-cpile es un modelo de lenguaje de 1.414 millones de parámetros desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del paper LinMix (Data Mixing as Linear Domain Attribution). No es un modelo de propósito general, sino un checkpoint preentrenado específicamente para validar una metodología de mezcla de datos (data mixing) sobre el corpus WebOrganizer.

El modelo parte de la arquitectura OLMo 2 (clase `Olmo2ForCausalLM`) con 18 capas y un tamaño de representación oculta de 2048, y utiliza el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 tokens. Se ha entrenado sobre 32.000 millones de tokens extraídos del corpus WebOrganizer, mezclados entre sus 24 dominios temáticos con pesos optimizados por LinMix para minimizar bits por byte (BPB) sobre texto reservado de Common Pile.

Su relevancia es metodológica más que de producto: sirve para replicar y auditar los resultados del paper LinMix, comparar estrategias de mezcla de dominios y estudiar el efecto de los pesos de mezcla en un modelo de escala 1B. La licencia es MIT para los pesos, aunque los datos de entrenamiento arrastran las condiciones de Common Crawl y DCLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (pesos); datos sujetos a Common Crawl ToU y DCLM CC-BY-4.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia OLMo 2, con 18 capas, hidden size de 2048 y 1.414 millones de parámetros totales. Emplea el tokenizador de GPT-NeoX-20B (vocabulario de 50.432 entradas). El entrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens procedentes del corpus WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x.

La innovación central no está en la arquitectura sino en la estrategia de mezcla de datos: los 24 dominios temáticos del corpus se combinan con pesos optimizados mediante LinMix, un método que ajusta un surrogate lineal sobre un enjambre de vértices (vertex swarm) y utiliza una utilidad de raíz cuadrada √π (r = 0.5). El objetivo de optimización es bits por byte sobre texto reservado de Common Pile. El modelo proxy utilizado para derivar la mezcla es `credible-ai/olmo2-30M-24domains-vertex`. El repositorio incluye un fichero `mix.json` con la mezcla exacta de datos de entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni fases de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, como consecuencia del preentrenamiento estándar sobre corpus web.
- Modelo base sin ajuste instructivo: no se documenta soporte nativo de instrucciones, diálogo ni formato chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Utilidad principal como artefacto de investigación: reproducción de experimentos de mezcla de datos y evaluación de BPB sobre Common Pile.

## Casos de uso

- Reproducción de experimentos LinMix: el checkpoint permite replicar los resultados del paper arXiv:2610.37390 sobre mezcla de dominios con la configuración exacta de pesos y corpus, sirviendo como referencia para validar nuevas variantes del método.
- Estudio de atribución de dominios: al estar entrenado con una mezcla derivada de LinMix, permite analizar cómo los pesos por dominio afectan al rendimiento en tareas downstream y comparar con mezclas alternativas.
- Evaluación de bits por byte: útil como modelo de referencia para medir BPB sobre conjuntos reservados de Common Pile y validar la calidad de futuras mezclas de datos.
- Investigación sobre data mixing a escala 1B: sirve para contrastar si las mezclas optimizadas con proxies pequeños (30M) transfieren correctamente a modelos mayores.
- Baseline en estudios de corpus web: permite comparar el efecto de distintas composiciones del corpus WebOrganizer manteniendo arquitectura y presupuesto de tokens constantes.
- Docencia y experimentación académica: su tamaño (1.4B) y licencia MIT facilitan su uso en entornos de investigación con recursos moderados para estudiar dinámicas de preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia la métrica de bits por byte (BPB) sobre texto reservado de Common Pile como objetivo de optimización, sin tablas de resultados (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV (el tamaño del repo es de 2,8 GB).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB para pesos; en 4 bits, en torno a 0,8 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bfloat16; A100, H100 y RTX 4090 lo ejecutan con holgura.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares; también en GPUs con 8 GB en cuantización.
- Opciones de despliegue: transformers (soporte nativo vía `Olmo2ForCausalLM`); vLLM, llama.cpp, Ollama y TGI no están documentados explícitamente para este checkpoint en la información disponible, aunque la arquitectura OLMo 2 suele estar soportada por dichos frameworks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| olmo2-1B-24domains-vertex-linearsqrt-cpile | 1,41B | no disponible | MIT | Preentrenamiento con mezcla LinMix sobre 24 dominios web |
| OLMo 2 1B (AllenAI) | ~1,2B (no confirmado) | no disponible | Apache 2.0 (según modelo base) | Modelo base de propósito general |
| olmo2-30M-24domains-vertex (credible-ai) | ~30M | no disponible | no disponible | Proxy de 30M para derivar la mezcla LinMix |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. Las alternativas de la misma categoría (modelos base de ~1B) no se han evaluado con los mismos benchmarks en esta ficha.

## Limitaciones y advertencias

- Modelo de investigación, no de propósito general: el autor indica explícitamente que no está pensado para uso como modelo de lenguaje general.
- Sin alineación: no se documentan fases de RLHF, DPO ni ajuste instructivo, por lo que no debe usarse directamente en aplicaciones conversacionales.
- Idioma: solo inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Sesgos: al entrenarse sobre corpus web (DCLM/Common Crawl), hereda sesgos presentes en esos datos, aunque no se documentan análisis específicos.
- Alucinación: sin evaluación de fidelidad ni benchmarks de QA; el riesgo de generación de contenido incorrecto es el propio de un modelo base.
- Longitud de contexto: no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia de datos: aunque los pesos son MIT, los datos de entrenamiento están sujetos a los términos de uso de Common Crawl y a la licencia CC-BY-4.0 de DCLM; conviene revisar las implicaciones para uso comercial.
- Reproducibilidad: el rendimiento depende de la mezcla exacta en `mix.json`; desviarse de ella invalida la comparación con los resultados del paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-vertex-linearsqrt-cpile
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código LinMix: https://github.com/credibleai/linmix
- Modelo proxy 30M: https://huggingface.co/credible-ai/olmo2-30M-24domains-vertex
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentación OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Repositorio OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
