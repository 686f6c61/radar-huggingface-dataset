# credible-ai/olmo2-1B-288domains-dirichlet-exponential-cpile

## Resumen

`olmo2-1B-288domains-dirichlet-exponential-cpile` es un modelo de lenguaje de aproximadamente 1.410 millones de parámetros desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del paper de LinMix ("LinMix: Data Mixing as Linear Domain Attribution", arXiv:2610.37390). Se trata de un modelo preentrenado sobre 32B de tokens del corpus WebOrganizer, mezclando datos de 288 dominios (combinación de temática y formato) con pesos de mezcla optimizados mediante Olmix, un método que ajusta un sustituto exponencial sobre un "enjambre" (swarm) Dirichlet de modelos proxy para minimizar los bits per byte en texto de validación de Common Pile.

El modelo no es un modelo de propósito general: su relevancia radica en la metodología de mezcla de datos (data mixing) que demuestra, un problema central en el preentrenamiento de LLM donde la proporción de dominios en el corpus afecta directamente a la calidad final. La arquitectura base es OLMo 2 (18 capas, tamaño oculto 2048), entrenada con OLMo-core y tokenizador GPT-NeoX-20B. Es un recurso útil para investigadores que estudian atribución de dominios, optimización de mezclas de datos y reproducibilidad en preentrenamiento abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 (≈1,41B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 y terminos de Common Crawl |
| Formato de pesos | safetensors (bfloat16), ~2,8 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 de AI2, un transformer decoder-only con 18 capas y tamaño oculto de 2048, implementada en la librería `transformers` mediante la clase `Olmo2ForCausalLM`. Utiliza el tokenizador GPT-NeoX-20B de EleutherAI, con un vocabulario de 50.432 tokens.

El entrenamiento cubre 32B de tokens procedentes del corpus WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x), tokenizado y disponible en `credible-ai/weborganizer-corpus-200b-tokenized`. La innovación central del trabajo es el método Olmix: se entrena un enjambre de modelos proxy pequeños (de 60M de parámetros, concretamente `credible-ai/olmo2-60M-288domains-dirichlet`) sobre mezclas Dirichlet de 288 dominios (temática × formato), se ajusta un sustituto exponencial que predice los bits per byte en función de los pesos de mezcla, y se optimiza dicho sustituto para obtener la mezcla final aplicada al modelo de 1B. El entrenamiento se realizó con el framework OLMo-core. No se dispone de información sobre fases de post-entrenamiento (SFT, RLHF o DPO); el modelo es un modelo base de preentrenamiento.

## Capacidades

- Generacion de texto en ingles como modelo base (preentrenado, sin ajuste por instrucciones).
- Modelado de lenguaje sobre texto web clasificado en 288 dominios tematico-formativos.
- Reproduccion de experimentos de mezcla de datos: evaluacion de bits per byte en texto de validacion de Common Pile.
- Analisis de atribucion de dominios segun la metodologia LinMix.
- No se dispone de informacion sobre capacidades de codigo, matematicas, vision, audio, tool calling ni agentes; al ser un artefacto de investigacion sin post-entrenamiento, no estan previstas para uso productivo.

## Casos de uso

- Reproduccion del paper LinMix: los investigadores pueden cargar los pesos y el archivo `mix.json` para verificar los resultados de bits per byte reportados sobre Common Pile.
- Investigacion en mezcla de datos (data mixing): sirve como punto de comparacion para nuevos metodos de optimizacion de proporciones de dominios frente al enfoque Olmix basado en sustitutos exponenciales.
- Estudio de modelos proxy: junto con el enjambre de 60M de parametros, permite analizar hasta que punto los modelos pequenos predicen el comportamiento de modelos grandes en terminos de loss por dominio.
- Analisis de clasificacion de corpus: el uso de 288 dominios de WebOrganizer (tematica × formato) permite estudiar como la composicion tematica y de formato del corpus afecta al modelado del lenguaje.
- Benchmarking de eficiencia de preentrenamiento: al estar entrenado solo con 32B de tokens, es util como referencia de bajo coste computacional para comparar recetas de entrenamiento.
- Docencia y divulgacion: ejemplo completo y abierto (pesos MIT, datos publicos, codigo en GitHub) para cursos sobre preentrenamiento reproducible de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La metrica de referencia del proyecto es el bits per byte en texto de validacion de Common Pile, pero no se incluyen valores numericos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,41B de parametros en bfloat16 (~2,8 GB de pesos), se estima un consumo de 3-4 GB de VRAM incluyendo activaciones y contexto; en FP32, alrededor de 6 GB.
- Cabe comodamente en GPUs de consumo: cualquier GPU con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien es ejecutable en CPU dada su escala.
- GPUs recomendadas: no es necesario hardware de datacenter; una sola GPU de consumo con al menos 6 GB de VRAM cubre inferencia y fine-tuning basico (LoRA/QLoRA).
- Opciones de despliegue: cargable directamente con `transformers` (codigo de ejemplo en la model card); compatible en principio con llama.cpp, Ollama y vLLM al tratarse de una arquitectura estandar, aunque no se anuncian conversiones GGUF oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Enfoque |
|---|---|---|---|---|---|
| olmo2-1B-288domains-dirichlet-exponential-cpile | 1,41B | no disponible | 32B tokens, WebOrganizer (288 dominios, mix Olmix) | MIT | Artefacto de investigacion (LinMix) |
| OLMo 2 1B (AI2) | ~1,5B | no disponible | Corpus OLMo 2 (multi-B tokens) | Apache 2.0 | Modelo base de proposito general |
| SmolLM2 1.7B (HuggingFace) | 1,7B | 8.192 tokens | ~11B tokens (SmolLM-Corpus) | Apache 2.0 | Modelo base/ajustado para uso general |

Nota: las alternativas listadas son modelos de escala similar orientados a uso general; el modelo de esta ficha es un artefacto experimental centrado en la metodologia de mezcla de datos, por lo que su rendimiento en benchmarks generales no es comparable directamente.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card advierte que es un artefacto de investigacion para reproducir experimentos de LinMix, no un asistente ni un modelo productivo.
- Sin post-entrenamiento: al ser un modelo base preentrenado, genera texto sin alinear con instrucciones y con alto riesgo de alucinacion y contenido no controlado.
- Sesgo de datos: entrenado exclusivamente con texto web en ingles de Common Crawl (via DCLM 1b-1x), hereda los sesgos, errores y contenidos problematicos tipicos de dicho corpus.
- Idioma: entrenado solo en ingles; no es adecuado para castellano ni otros idiomas.
- Longitud de contexto: no documentada en la model card; debe verificarse en la configuracion del modelo antes de usos con textos largos.
- Licencia: los pesos son MIT (uso comercial permitido), pero los datos de entrenamiento derivan de Common Crawl y estan sujetos a sus terminos de uso, ademas de CC-BY-4.0 en el pool DCLM; conviene revisar las obligaciones de atribucion.
- Rendimiento no evaluado: no hay benchmarks publicados de capacidades generales, por lo que no debe asumirse calidad competitiva frente a modelos de 1B orientados a produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-exponential-cpile
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Codigo (GitHub): https://github.com/credibleai/linmix
- Enjambre de modelos proxy (60M): https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Corpus de entrenamiento: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Corpus tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Documentacion de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
