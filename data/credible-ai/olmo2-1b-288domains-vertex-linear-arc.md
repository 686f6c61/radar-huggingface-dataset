# credible-ai/olmo2-1B-288domains-vertex-linear-arc

## Resumen

olmo2-1B-288domains-vertex-linear-arc es un modelo de lenguaje de aproximadamente 1,41 mil millones de parámetros desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del paper de LinMix ("LinMix: Data Mixing as Linear Domain Attribution", arXiv:2610.37390). El modelo está preentrenado sobre 32B de tokens del corpus WebOrganizer, mezclados a lo largo de 288 dominios (combinaciones de tema y formato), con pesos de mezcla optimizados mediante LinMix para maximizar el rendimiento en el benchmark ARC.

No se trata de un modelo de propósito general: su relevancia reside en la metodología de mezcla de datos que ilustra. LinMix optimiza la proporción de datos de entrenamiento por dominio mediante un sustituto lineal ajustado sobre un "enjambre" de modelos proxy pequeños (en este caso, modelos de 60M), lo que permite predecir qué mezcla de dominios producirá el mejor modelo final sin entrenar repetidamente modelos grandes. Es interesante para investigadores en curación de datos y scaling laws, no para usuarios finales que busquen un asistente o modelo de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (Olmo2ForCausalLM), transformer decoder-only |
| Parametros totales | 1.414.678.528 (~1,41B) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 / terminos de Common Crawl |
| Formato de pesos | safetensors (bfloat16), tamano del repo 2,8 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 de AI2, un transformer decoder-only con 18 capas y tamaño oculto de 2048, implementada como `Olmo2ForCausalLM` en la librería Transformers. Utiliza el tokenizador GPT-NeoX-20B de EleutherAI, con un vocabulario de 50.432 tokens. No es una arquitectura MoE ni híbrida: es un transformer denso convencional.

El entrenamiento se realizó sobre 32B de tokens con el framework OLMo-core de AllenAI. Los datos proceden de WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x, y se organizan en 288 dominios definidos por la intersección de tema y formato web. La innovación central del artefacto es la mezcla de datos: los pesos de mezcla se optimizaron con LinMix usando utilidad lineal π (con r = 0), ajustando un sustituto lineal sobre el enjambre de modelos proxy de 60M parámetros (`credible-ai/olmo2-60M-288domains-vertex`) y orientando la optimización al benchmark ARC. No se menciona ningún postentrenamiento tipo RLHF o DPO; es un modelo preentrenado (base).

## Capacidades

- Generacion de texto en ingles como modelo base (preentrenado, sin afinado por instrucciones).
- Optimizacion orientada al benchmark ARC (AI2 Reasoning Challenge), sobre el que se ajusto la mezcla de datos.
- No se anuncian capacidades de tool calling, function calling, agentes, vision ni audio.
- Sin soporte instruccional ni alineacion por preferencias: no esta pensado para dialogo.
- Utilidad principal como sujeto de experimentos reproducibles sobre mezcla de datos (LinMix) y como baseline comparativo entre estrategias de mezcla.

## Casos de uso

- Reproduccion del paper LinMix: investigadores pueden cargar el modelo y el archivo `mix.json` para verificar los resultados de optimizacion de mezcla por dominios publicados en arXiv:2610.37390.
- Investigacion en curacion de datos: sirve como punto de comparacion para evaluar si otras estrategias de mezcla (DoReMi, RegMix, etc.) superan a la mezcla optimizada por LinMix bajo el mismo corpus y presupuesto de 32B tokens.
- Estudios de scaling laws sobre mezclas: combinado con el enjambre de modelos proxy de 60M, permite estudiar hasta que punto las mezclas optimizadas en modelos pequenos transfieren a modelos de 1B.
- Analisis de atribucion por dominio: el modelo y su mezcla documentada permiten analizar como la composicion tematica y de formato del corpus afecta a capacidades concretas (razonamiento tipo ARC).
- Baseline para entrenamientos propios: al ser OLMo 2 con pesos MIT y datos abiertos, puede usarse como checkpoint inicial para continued pretraining en corpus especificos.
- Docencia y demos academicas: ejemplo compacto y reproducible para ilustrar en cursos como la composicion de datos influye en el rendimiento final de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card indica que la mezcla de datos fue optimizada para el benchmark ARC, pero no se proporcionan puntuaciones concretas ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,41B de parametros en bfloat16, los pesos ocupan unos 2,8 GB; con overhead de activaciones y KV cache, bastan aproximadamente 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es mas que suficiente; no se necesitan A100 ni H100 para inferencia. Para reentrenar o reproducir el preentrenamiento de 32B tokens si se requiere hardware multi-GPU (no especificado en la documentacion).
- Cabe comodamente en GPUs consumer de gama media e incluso en configuraciones de CPU offload.
- Despliegue: soportado nativamente por Hugging Face Transformers (AutoModelForCausalLM / AutoTokenizer); al ser una arquitectura OLMo 2 estandar, deberia funcionar con vLLM y TGI. No se menciona soporte explicito de llama.cpp u Ollama (no hay GGUF publicado en la informacion disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos | Licencia | Proposito |
|---|---|---|---|---|---|
| olmo2-1B-288domains-vertex-linear-arc | 1,41B | no disponible | 32B tokens, WebOrganizer (288 dominios, mix LinMix) | MIT | Artefacto de investigacion (mezcla de datos) |
| OLMo 2 1B (AI2) | ~1,5B | no disponible | OLMo 2 Mix | Apache 2.0 | Modelo base de proposito general |
| SmolLM2-1.7B (Hugging Face) | 1,7B | 8.192 tokens | ~11B tokens propios | Apache 2.0 | Modelo base/instruccional compacto |

Nota: las alternativas son modelos base de tamano comparable orientados a uso general, mientras que el modelo de esta ficha es un artefacto experimental centrado en la metodologia de mezcla de datos, por lo que no es directamente comparable en rendimiento general.

## Limitaciones y advertencias

- No es un modelo de proposito general: el propio autor advierte que es un artefacto de investigacion para reproducir el paper LinMix, no un asistente ni un modelo de chat.
- Modelo base sin postentrenamiento: no sigue instrucciones ni esta alineado; esperar respuestas tipo chat producira resultados pobres.
- Entrenado solo en ingles: no apto para contenido en castellano u otros idiomas.
- Riesgo de alucinacion elevado y sesgos heredados de Common Crawl y del pool DCLM, sin ninguna mitigacion por RLHF/DPO documentada.
- Longitud de contexto no documentada en la model card; debe verificarse en la configuracion del modelo antes de usos con textos largos.
- Licencia MIT en los pesos, pero los datos de entrenamiento derivan de DCLM (CC-BY-4.0) y estan sujetos a los terminos de uso de Common Crawl, lo que puede imponer condiciones sobre usos derivados del corpus.
- Rendimiento en benchmarks distintos de ARC probablemente no este optimizado, dado que la mezcla de dominios se ajusto especificamente para ARC.
- Descargas muy bajas (221) y sin comunidad activa documentada: soporte y correccion de errores dependen del repositorio de codigo del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-vertex-linear-arc
- Paper LinMix (arXiv): https://arxiv.org/abs/2610.37390
- Codigo de LinMix: https://github.com/credibleai/linmix
- Enjambre de modelos proxy: https://huggingface.co/credible-ai/olmo2-60M-288domains-vertex
- Corpus de entrenamiento: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Corpus tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Documentacion de OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
