# credible-ai/olmo2-1B-288domains-dirichlet-exponential-arc

## Resumen

`credible-ai/olmo2-1B-288domains-dirichlet-exponential-arc` es un modelo de lenguaje de 1,41 mil millones de parámetros con arquitectura OLMo 2, preentrenado desde cero sobre 32.000 millones de tokens extraídos del corpus WebOrganizer. No es un modelo de propósito general: el propio autor lo describe como un artefacto de investigación destinado a reproducir los experimentos del paper LinMix sobre mezclas de datos. La particularidad del modelo no está en su arquitectura, sino en la composición de su dataset de entrenamiento: los datos se organizan en 288 dominios que combinan eje temático y formato, y los pesos de mezcla entre dominios se optimizaron mediante Olmix para el benchmark ARC.

El tamaño efectivo de entrenamiento es de aproximadamente 22,6 tokens por parámetro (32B tokens / 1,41B parámetros), una cifra alineada con el régimen compute-optimal pero muy por debajo de los presupuestos habituales en modelos abiertos de esta escala, que suelen superar los 2-4 billones de tokens. Esto implica que el modelo debe evaluarse como un punto de comparación controlado dentro de un estudio de mezclas de datos, no como un competidor de modelos 1B de producción.

La relevancia actual del checkpoint es metodológica: forma parte de una familia de modelos entrenados con distintas estrategias de mezcla (uniforme, Dirichlet, surrogado exponencial) sobre el mismo corpus tokenizado, lo que permite aislar el efecto de la política de mezcla con un único eje de variación. Los pesos se publican en bfloat16 bajo licencia MIT, junto con el fichero `mix.json` que documenta la mezcla exacta empleada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only denso |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no documentada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bfloat16; no hay GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT (pesos); datos sujetos a CC-BY-4.0 y a los terminos de uso de Common Crawl |
| Formato de pesos | safetensors, bfloat16 |
| Capas | 18 |
| Dimension oculta | 2048 |
| Tokenizer | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Tokens de entrenamiento | 32.000 millones |
| Tamano del repositorio | 2,8 GB |
| Framework de entrenamiento | OLMo-core |
| Metodo de mezcla | Olmix: ajuste de un surrogado exponencial sobre el enjambre Dirichlet |

## Arquitectura y entrenamiento

La arquitectura es la de OLMo 2 en su variante de 1B: un transformer decoder-only denso con 18 capas y anchura de 2048, implementado en `transformers` como `Olmo2ForCausalLM`. El tokenizer es el de GPT-NeoX-20B con un vocabulario de 50.432 entradas, una eleccion heredada del ecosistema OLMo que facilita la comparacion directa con otros checkpoints de la familia. Los pesos se distribuyen en bfloat16, lo que explica un repositorio de 2,8 GB coherente con los 1,41B parametros.

El entrenamiento se realizo con OLMo-core sobre 32.000 millones de tokens muestreados de WebOrganizer/Corpus-200B, un corpus derivado del pool DCLM 1b-1x (CC-BY-4.0) y sujeto a los terminos de Common Crawl. La innovacion esta en el muestreo: el corpus se particiona en 288 dominios que cruzan tematica y formato, y la probabilidad de muestreo de cada dominio se obtiene ajustando un surrogado exponencial (Olmix) sobre un enjambre de mezclas Dirichlet. Ese enjambre se evalua previamente con un proxy de 60M parametros (`credible-ai/olmo2-60M-288domains-dirichlet`), y la mezcla resultante se optimiza para el benchmark ARC. El resultado se materializa en el fichero `mix.json` incluido en el repositorio, que actua como artefacto reproducible de la politica de datos. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion posterior al preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, como modelo base sin instrucciones ni ajuste conversacional.
- Razonamiento de un solo paso y continuacion de texto; no hay modo "thinking" ni cadena de pensamiento explicita.
- Capacidad limitada de generacion de codigo y matematicas, derivada unicamente de la presencia de esos dominios en el corpus de preentrenamiento; no hay evaluaciones publicadas.
- Sin soporte nativo de tool calling, function calling ni agentes: no se ha aplicado plantilla de chat ni ajuste para uso de herramientas.
- Monolingue en ingles; no se documenta cobertura multilingue.
- Capacidad de servir como objeto de estudio para experimentos de mezcla de datos por dominio (288 dominios tematicos y de formato).
- No dispone de vision, audio ni modalidades adicionales.

## Casos de uso

- Reproduccion de los experimentos del paper LinMix: el checkpoint es el resultado final de una mezcla optimizada para ARC y permite verificar las cifras del articulo con los mismos datos tokenizados y el mismo `mix.json`.
- Ablacion controlada de politicas de mezcla: al compartir corpus, tokenizer y receta de entrenamiento con otros checkpoints de la familia, se puede aislar el efecto de la mezcla (uniforme frente a Dirichlet frente a surrogado exponencial) manteniendo el resto de variables fijas.
- Estudio de la relacion proxy-escala: comparar el comportamiento del proxy de 60M (`olmo2-60M-288domains-dirichlet`) con este modelo de 1,41B para medir cuanto se transfiere la senal de la mezcla optimizada a mayor escala.
- Analisis de corpus y tokenizacion: el dataset tokenizado publicado (`credible-ai/weborganizer-corpus-200b-tokenized`) permite auditar como afecta la particion en 288 dominios al contenido efectivo visto por el modelo.
- Punto de partida para ajuste fino de dominio: util como inicializacion cuando el objetivo es estudiar el efecto del preentrenamiento con mezcla sesgada antes de un fine-tuning supervisado, aceptando el limite de 32B tokens.
- Investigacion sobre sesgos y contaminacion de Common Crawl: al derivar del pool DCLM, sirve para medir la propagacion de contenido problematico de la web rastreada bajo una politica de muestreo concreta.
- Generacion de texto de dominio especifico para analisis cualitativo: util para inspeccionar que dominios dominan la salida y como se refleja la ponderacion de la mezcla en la distribucion generada.
- Baseline interno en pipelines de investigacion: referencia barata (2,8 GB en disco, inferencia en una sola GPU de consumo) frente a la que medir nuevas recetas de datos antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que la mezcla de datos fue optimizada para el benchmark ARC mediante Olmix, pero no se proporcionan puntuaciones del modelo en ARC ni en MMLU, HumanEval, GSM8K u otras tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, mas cache KV y activaciones; en la practica entre 4 y 6 GB para contextos cortos y lotes pequenos (estimacion derivada del numero de parametros, no medida publicada).
- VRAM estimada en float32: aproximadamente 5,7 GB para pesos.
- VRAM estimada con cuantizacion int8: aproximadamente 1,4 GB; con int4, aproximadamente 0,7 GB (requiere conversion propia, no hay cuantizaciones oficiales).
- GPU recomendadas: una RTX 4090 (24 GB) o A100/H100 estan sobradamente dimensionadas para un modelo de este tamano; el objetivo realista es una sola GPU de consumo.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 6 GB o mas en bfloat16, y en tarjetas de 8 GB con margen amplio; tambien es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` es la via documentada; el entrenamiento usa OLMo-core. No se ha verificado soporte en vLLM, TGI, llama.cpp u Ollama, y no se publican ficheros GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo denso de 1,41B con 18 capas, el coste por token es bajo en relacion con modelos de su clase, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| Este modelo (olmo2-1B-288domains-dirichlet-exponential-arc) | 1,41B | no disponible | 32B tokens, mezcla Olmix sobre 288 dominios | MIT | Artefacto de investigacion para LinMix |
| credible-ai/olmo2-60M-288domains-dirichlet | no disponible (proxy de 60M) | no disponible | no disponible | no disponible | Proxy de bajo coste para ajustar la mezcla |
| OLMo 2 1B (base, AllenAI) | ~1,4B (misma arquitectura declarada) | no disponible en esta ficha | no disponible en esta ficha | no verificada en la informacion disponible | Modelo base de proposito general |
| Mezclas uniformes sobre WebOrganizer (otros checkpoints de la familia) | 1,41B | no disponible | 32B tokens, pesos de mezcla uniformes | MIT (presumiblemente, no confirmado) | Control experimental frente a la mezcla optimizada |

La comparacion con modelos 1B de produccion (Llama 3.2 1B, Qwen2.5 1.5B, SmolLM2 1.7B) no se incluye porque no se dispone de datos verificados en la informacion proporcionada y porque la diferencia de presupuesto de entrenamiento (32B tokens frente a billones) hace que la comparacion de rendimiento no sea significativa.

## Limitaciones y advertencias

- No es un modelo de proposito general: el autor lo declara explicitamente como artefacto de investigacion para reproducir LinMix, no para uso en produccion.
- Modelo base sin alineacion: no ha pasado por RLHF, DPO ni ajuste de instrucciones, por lo que no responde bien a formatos conversacionales ni sigue instrucciones de forma fiable.
- Presupuesto de entrenamiento reducido: 32B tokens (unas 22,6 veces el numero de parametros) esta muy por debajo de lo habitual en modelos abiertos de 1B, lo que se traducira en menor calidad de lenguaje y mayor tasa de incoherencias.
- Riesgo de alucinacion alto e inherente a un modelo base de este tamano y con este presupuesto de datos; no debe usarse como fuente de hechos.
- Solo ingles: no hay cobertura multilingue documentada, y el castellano queda fuera de su ambito.
- Longitud de contexto no documentada: planificar cualquier integracion requiere medirla empiricamente antes de asumir ventanas largas.
- Sesgos heredados de Common Crawl: el corpus deriva del pool DCLM 1b-1x y esta sujeto a los terminos de uso de Common Crawl, con la distribucion de sesgos y contenido problematico que ello implica; la mezcla optimizada para ARC puede ademas sobrerrepresentar dominios academicos o de razonamiento.
- Restricciones de datos: aunque los pesos son MIT, el uso de los datos subyacentes esta condicionado por CC-BY-4.0 y por los terminos de Common Crawl; conviene revisar ambas licencias antes de cualquier uso comercial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion externa conocida, lo que reduce la confianza en el checkpoint mas alla de lo que declara la model card.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que cualquier afirmacion de rendimiento seria especulativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-exponential-arc
- Modelo proxy de 60M: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Codigo de LinMix: https://github.com/credibleai/linmix
- Dataset de origen: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizer GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentacion de `Olmo2ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/olmo2
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces verificables son los que figuran en la model card y en los metadatos de HuggingFace.
