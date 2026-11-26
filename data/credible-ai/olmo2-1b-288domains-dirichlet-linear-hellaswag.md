# credible-ai/olmo2-1B-288domains-dirichlet-linear-hellaswag

## Resumen

`olmo2-1B-288domains-dirichlet-linear-hellaswag` es un modelo de lenguaje de 1.414 millones de parametros desarrollado por credible-ai, un artefacto de investigacion disenado para reproducir los experimentos del paper LinMix (Data Mixing as Linear Domain Attribution). No es un modelo de proposito general: se trata de un checkpoint de ablation que materializa una mezcla concreta de datos de entrenamiento optimizada para la tarea HellaSwag.

El modelo parte de la arquitectura OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y un tamano de oculto de 2048, y fue preentrenado desde cero sobre 32.000 millones de tokens extraidos del corpus WebOrganizer (derivado del pool DCLM 1b-1x). La mezcla de datos se distribuye sobre 288 dominios definidos por la combinacion de tematica y formato, con pesos derivados de un ajuste lineal sobre un enjambre Dirichlet (variante "linear surrogate" del metodo LinMix, correspondiente a r = 0).

Su relevancia es metodologica mas que practica: sirve como referencia reproducible para estudiar como la composicion del dataset afecta al rendimiento en tareas concretas, y para validar tecnicas de data mixing basadas en atribucion lineal por dominio. El tokenizador es el de GPT-NeoX-20B con un vocabulario de 50.432 entradas, y los pesos se distribuyen en bfloat16 bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

Detalles adicionales confirmados: 18 capas, hidden size 2048, tokenizador GPT-NeoX-20B con vocabulario de 50.432 entradas, tamano del repositorio de 2,8 GB.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2, un transformer decoder-only denso con 18 capas y dimension oculta de 2048. El entrenamiento se realizo con OLMo-core sobre 32.000 millones de tokens muestreados del corpus WebOrganizer, que a su vez deriva del pool DCLM 1b-1x (CC-BY-4.0) y esta sujeto a los terminos de uso de Common Crawl. La particularidad del checkpoint es el esquema de mezcla: los 288 dominios (combinaciones de tematica y formato) reciben pesos optimizados mediante LinMix, en su variante de ablation que ajusta un surrogate lineal sobre un enjambre Dirichlet (r = 0) en lugar de sobre el enjambre de vertices con utilidad lineal.

El objetivo de optimizacion de la mezcla es el benchmark HellaSwag. El modelo proxy utilizado para el enjambre Dirichlet es `credible-ai/olmo2-60M-288domains-dirichlet` (60M de parametros). No se documenta en la informacion disponible el uso de RLHF, DPO ni fases de alineacion posteriores al preentrenamiento; se trata de un checkpoint puramente preentrenado. El repositorio incluye un fichero `mix.json` con la mezcla exacta de datos empleada, lo que facilita la reproducibilidad.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, como consecuencia del preentrenamiento sobre corpus web.
- Razonamiento de sentido comun evaluable mediante HellaSwag, tarea para la que se optimizo la mezcla de datos.
- Modelado de lenguaje general sobre dominios tematicos y de formato diversos (288 categorias).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta modo "thinking", vision, audio ni capacidades multimodales.

## Casos de uso

- Reproduccion de experimentos de data mixing: permite replicar la curva de rendimiento en HellaSwag con la mezcla exacta (`mix.json`) y comparar contra otras variantes del metodo LinMix publicadas por el mismo autor.
- Investigacion sobre atribucion lineal por dominio: sirve para estudiar como pesos derivados de un surrogate lineal sobre un enjambre Dirichlet se traducen en mejoras medibles en una tarea concreta.
- Baseline en estudios de mezcla de datos: al ser un modelo de 1,4B preentrenado con un presupuesto fijo de 32B tokens, es un punto de comparacion controlado frente a mezclas uniformes o heuristicas.
- Validacion de pipelines de tokenizacion y entrenamiento con OLMo-core: el par modelo/dataset tokenizado (`credible-ai/weborganizer-corpus-200b-tokenized`) permite verificar flujos completos de preentrenamiento a pequena escala.
- Experimentos de scaling de proxy a modelo objetivo: el uso documentado del proxy de 60M frente al modelo de 1,4B permite estudiar la transferibilidad de pesos de mezcla entre escalas.
- Docencia y formacion en tecnicas de curacion de datasets: el modelo y su `mix.json` constituyen un ejemplo concreto y trazable de como se pasa de una formulacion de optimizacion a un dataset de entrenamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la mezcla se optimizo para HellaSwag, pero no incluye cifras de accuracy ni comparaciones numericas con otras mezclas o modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,5 GB para pesos; en 4 bits, en torno a 0,8-1 GB. Los tipos de cuantizacion concretos no estan documentados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente en bfloat16 o cuantizado. Para despliegue en servidor, A100 o H100 son validas pero sobredimensionadas para este tamano.
- Cabe holgadamente en GPU consumer; tambien es viable en CPU con llama.cpp u Ollama, dado el reducido numero de parametros.
- Opciones de despliegue: transformers (soporte nativo via `Olmo2ForCausalLM`), vLLM y TGI si la version soporta la arquitectura OLMo 2, llama.cpp/Ollama previa conversion a GGUF (no publicada por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-1B-288domains-dirichlet-linear-hellaswag | 1,41B | no disponible | MIT | Ablation de data mixing (LinMix) | Hugging Face |
| OLMo 2 1B (AllenAI) | ~1,2-1,4B | no disponible | Apache 2.0 (modelo base OLMo 2) | Modelo base de proposito general | Hugging Face |
| credible-ai/olmo2-60M-288domains-dirichlet | 60M | no disponible | no disponible | Proxy de mezcla Dirichlet | Hugging Face |
| Pythia-1.4B (EleutherAI) | 1,4B | 2048 | Apache 2.0 | Suite de interpretabilidad | Hugging Face |

La comparacion con OLMo 2 1B oficial y con Pythia-1.4B es pertinente por tamano y familia de tokenizador (GPT-NeoX en ambos casos para Pythia), pero no se dispone de cifras de rendimiento comparadas en la informacion proporcionada para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor lo describe explicitamente como no apto para uso general; no ha pasado por fases de alineacion (RLHF/DPO) documentadas.
- Entrenado unicamente en ingles; el rendimiento en otros idiomas no esta caracterizado.
- Entrenado con solo 32B tokens, un presupuesto muy inferior al de modelos de produccion del mismo tamano, lo que limita su calidad como generador general.
- Riesgo elevado de alucinacion y de generar contenido factualmente incorrecto, dado el preentrenamiento puro sobre corpus web.
- Sesgos heredados del corpus DCLM/Common Crawl y de WebOrganizer, sin mitigacion documentada.
- La mezcla esta optimizada para HellaSwag; el rendimiento en otras tareas puede degradarse respecto a mezclas mas equilibradas.
- La longitud de contexto no esta documentada en la model card, lo que impide garantizar ventanas largas en produccion.
- Restricciones de datos: aunque los pesos son MIT, los datos de entrenamiento estan sujetos a los terminos de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; el uso comercial de los pesos no exime de posibles obligaciones derivadas de los datos.
- No se publican pesos en GGUF ni cuantizaciones oficiales; cualquier despliegue en llama.cpp requiere conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-linear-hellaswag
- Modelo proxy de 60M: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Repositorio de codigo: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentacion de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core: https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
