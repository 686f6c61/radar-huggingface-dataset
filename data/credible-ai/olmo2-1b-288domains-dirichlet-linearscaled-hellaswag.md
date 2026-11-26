# credible-ai/olmo2-1B-288domains-dirichlet-linearscaled-hellaswag

## Resumen

`olmo2-1B-288domains-dirichlet-linearscaled-hellaswag` es un modelo de lenguaje de 1.414 millones de parametros desarrollado por credible-ai como artefacto de investigacion para reproducir los experimentos del paper LinMix (Data Mixing as Linear Domain Attribution). No es un modelo de proposito general: es un checkpoint de preentrenamiento especifico cuyo objetivo es validar una metodologia de mezcla de datos (data mixing) sobre 288 dominios tematicos y de formato del corpus WebOrganizer.

El modelo parte de la arquitectura OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y un tamano de hidden de 2048, y utiliza el tokenizador GPT-NeoX-20B con un vocabulario de 50.432 tokens. Se ha preentrenado sobre 32.000 millones de tokens extraidos del corpus WebOrganizer, con pesos de mezcla optimizados mediante LinMix para el benchmark HellaSwag.

Su relevancia es metodologica, no de producto: sirve para estudiar como la atribucion lineal de dominios y el escalado de coeficientes (β/SE con utilidad lineal, r = 0) afectan a la composicion optima del dataset de preentrenamiento. Los pesos se distribuyen en bfloat16 bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 implementada en Transformers: un transformer decoder-only con 18 capas, hidden size de 2048 y tokenizador GPT-NeoX-20B (vocabulario de 50.432 entradas). Los pesos se publican en bfloat16 y el repositorio ocupa 2,8 GB. No se documentan en la informacion disponible detalles sobre mecanismos de atencion especificos, activaciones ni innovaciones arquitectonicas adicionales mas alla de lo que define la familia OLMo 2.

El preentrenamiento se realizo con OLMo-core sobre 32.000 millones de tokens del corpus WebOrganizer, derivado del pool DCLM 1b-1x (CC-BY-4.0) y sujeto a los terminos de uso de Common Crawl. La innovacion principal es el procedimiento de mezcla de datos: se ajusta un surrogate lineal sobre un enjambre Dirichlet de 288 dominios (tema x formato), se dividen los coeficientes por sus errores estandar (β/SE) y se aplica una utilidad lineal (r = 0). El modelo proxy del enjambre es `credible-ai/olmo2-60M-288domains-dirichlet`. El repositorio incluye un fichero `mix.json` con la mezcla de datos de entrenamiento. No se documentan fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, heredada del preentrenamiento sobre corpus web.
- Modelado de lenguaje y evaluacion de perplejidad sobre dominios tematicos y de formato del corpus WebOrganizer.
- Reproduccion de experimentos de data mixing: permite analizar el efecto de la mezcla optimizada sobre el rendimiento en HellaSwag.
- Servir como checkpoint de referencia para comparar con el modelo proxy de 60M y con otras configuraciones de mezcla.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles.
- No se documenta modo de razonamiento (thinking), vision ni audio.

## Casos de uso

- Reproduccion de experimentos de LinMix: cargar el checkpoint y el `mix.json` para replicar la ablacion de muestreo y escalado descrita en el paper, comparando la mezcla optimizada con mezclas uniformes o heuristicas.
- Investigacion en data mixing: usar el modelo como punto de comparacion frente a otros checkpoints de la misma familia (por ejemplo, variantes con distintas estrategias de escalado de coeficientes) para medir el impacto en HellaSwag.
- Estudio de atribucion de dominios: analizar como los pesos de mezcla derivados de 288 dominios tema x formato se traducen en diferencias de rendimiento, apoyandose en el corpus tokenizado publicado.
- Validacion de pipelines de preentrenamiento con OLMo-core: servir de referencia para verificar que una configuracion de entrenamiento reproduce los resultados esperados sobre 32.000 millones de tokens.
- Benchmarking de metodologias de seleccion de datos: comparar LinMix frente a otras tecnicas de mezcla sobre el mismo corpus base y el mismo presupuesto de tokens.
- Analisis de eficiencia en modelos pequenos: estudiar el comportamiento de un modelo de 1,4B parametros entrenado con una mezcla optimizada, como paso previo al escalado a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que la mezcla de datos fue optimizada para el benchmark HellaSwag, sin reportar la puntuacion obtenida.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5 GB para pesos; en 4 bits, en torno a 0,8 GB (las cuantizaciones no estan publicadas por el autor y requeririan conversion propia).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100 o RTX 4090 ofrecen margen sobrado.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: transformers (soporte nativo de `Olmo2ForCausalLM`), vLLM y TGI si incorporan soporte para la arquitectura OLMo 2; llama.cpp y Ollama requeririan conversion a GGUF, no documentada por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| olmo2-1B-288domains-dirichlet-linearscaled-hellaswag | 1,41B | no disponible | MIT | Artefacto de investigacion en data mixing |
| credible-ai/olmo2-60M-288domains-dirichlet | ~60M | no disponible | no disponible | Modelo proxy del enjambre Dirichlet |
| OLMo 2 1B (AllenAI) | ~1B | no disponible | no disponible | Modelo base de proposito general |

La comparacion con alternativas de la misma categoria es limitada: el checkpoint esta disenado para reproducir experimentos concretos y no para competir en tareas genericas. No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: el propio autor lo describe como artefacto de investigacion, no apto para uso en produccion.
- Entrenado unicamente en ingles; no se garantiza un comportamiento correcto en otros idiomas.
- Entrenado sobre corpus web (DCLM/Common Crawl), por lo que puede reproducir sesgos presentes en esos datos.
- Riesgo de alucinacion elevado al no haber pasado por fases de alineacion (RLHF/DPO) ni ajuste por instrucciones.
- No se documenta la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- La licencia MIT cubre los pesos, pero los datos de entrenamiento estan sujetos a los terminos de uso de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; conviene revisar esas condiciones antes de un uso comercial.
- La mezcla de datos esta optimizada especificamente para HellaSwag, lo que puede introducir sesgo hacia ese benchmark y limitar la generalizacion.
- No hay garantias de soporte en herramientas de despliegue como vLLM, TGI, llama.cpp u Ollama sin conversion o configuracion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-linearscaled-hellaswag
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Codigo LinMix: https://github.com/credibleai/linmix
- Modelo proxy: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentacion OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core: https://github.com/allenai/OLMo-core
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
