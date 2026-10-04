# DunkRonit/anlp-a2-part1-moe_shared

## Resumen

anlp-a2-part1-moe_shared es un transformer decoder-only entrenado desde cero para traducción automática de vietnamita (vi) y japonés (ja) a inglés (en). Lo publica el usuario DunkRonit en HuggingFace, y por la nomenclatura (anlp-assignment) y la traza de Weights & Biases (dunkronit-iiit-hyderabad) se trata de un trabajo académico de un curso de procesado avanzado de lenguaje natural. El modelo es deliberadamente pequeno: 17.018.496 parametros totales, de los cuales 13.479.552 estan activos por token, lo que indica una arquitectura de mezcla de expertos (MoE) con un FFN de tipo `moe_shared`.

El modelo se entrena sobre 39.003.133 tokens del dataset `belumind/en-vi-ja-curated-500k-triplets`, un corpus de tripletas en ingles, vietnamita y japones. Su formato de entrada es explicito mediante etiquetas de idioma: `<vi> source <en>` o `<ja> source <en>`, y el modelo completa la secuencia en ingles hasta el token `<eos>`. La relevancia de esta ficha es acotada: sirve como referencia para reproducir tecnicas de MoE en modelos diminutos y como ejemplo de entrenamiento desde cero, no como herramienta de traduccion en produccion.

No se dispone de licencia declarada, ni de resultados de benchmarks, ni de una model card completa con tokenizador, longitud de contexto o recetas de entrenamiento detalladas. Ademas, requiere codigo personalizado del repositorio de la asignatura para cargarse, por lo que no es un modelo directamente desplegable con las herramientas estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de mezcla de expertos (variante `moe_shared`) |
| Parametros totales | 17.018.496 |
| Parametros activos | 13.479.552 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | vietnamita (vi), japones (ja), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokens de entrenamiento | 39.003.133 |
| Dataset de entrenamiento | belumind/en-vi-ja-curated-500k-triplets |
| Tamano del repositorio | 0,1 GB |
| Tarea (pipeline) | translation |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only, es decir, causal y autoregresivo, entrenado desde cero (no es un fine-tuning de un modelo preexistente). La innovacion concreta del checkpoint es la variante de capa feed-forward: `moe_shared`, que corresponde a un esquema de mezcla de expertos en el que parte del FFN se comparte entre expertos. Esto explica la diferencia entre los 17.018.496 parametros totales y los 13.479.552 activos por token, con un ratio de activacion en torno al 79 %.

El entrenamiento consumio 39.003.133 tokens procedentes del corpus `belumind/en-vi-ja-curated-500k-triplets`. No se especifican en la informacion disponible la composicion exacta del dataset, el tokenizador, el numero de capas, las dimensiones ocultas, el numero de expertos ni la estrategia de enrutamiento. Tampoco se documenta si hubo fases de ajuste por preferencias (RLHF, DPO) ni decodificacion especulativa; en un modelo de este tamano y con este origen (asignatura), lo habitual es un preentrenamiento supervisado de secuencia a secuencia con perdida de entropia cruzada.

El formato de condicionamiento es una etiqueta de idioma de origen al inicio de la secuencia, seguida del texto y de una etiqueta de idioma destino: por ejemplo `<ja> source <en>`. El modelo genera entonces la traduccion en ingles y cierra con `<eos>`. La carga se realiza mediante el constructor `Transformer.from_pretrained("DunkRonit/anlp-a2-part1-moe_shared")` del repositorio `src.part1.model` de la asignatura, lo que implica que el modelo no es compatible directamente con `transformers` sin ese codigo.

## Capacidades

- Traduccion automatica de vietnamita a ingles.
- Traduccion automatica de japones a ingles.
- Generacion de texto autoregresiva condicionada por etiquetas de idioma de origen y destino.
- Manejo de secuencias de entrada mediante un formato explicito de tokens especiales (`<vi>`, `<ja>`, `<en>`, `<eos>`).
- Ejecucion de una arquitectura de mezcla de expertos con FFN compartido, con activacion parcial de parametros por token.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidades multilingues limitadas a los tres idiomas del entrenamiento; no hay evidencia de generalizacion a otros idiomas ni de traduccion en sentido inverso (en a vi o en a ja).

## Casos de uso

- Estudio academico de arquitecturas MoE: el checkpoint permite analizar como se comporta un FFN con expertos compartidos en un regimen de 17 M de parametros y comparar con la variante densa equivalente del mismo repositorio de asignatura.
- Reproducibilidad de experimentos de traduccion de bajo recurso: sirve para replicar la receta de entrenamiento con 39 M de tokens sobre el corpus `en-vi-ja-curated-500k-triplets` y medir el efecto del numero de tokens en la calidad de traduccion.
- Benchmarking de traductores diminutos: dado su tamano (aproximadamente 68 MB en fp32 y 34 MB en fp16), puede ejecutarse en CPU para obtener lineas base de BLEU/COMET frente a modelos mayores en entornos sin GPU.
- Prototipado de pipelines de traduccion vi→en y ja→en en entornos embebidos: al caber en memoria de un dispositivo de bajos recursos, permite validar la logica de preprocesado de etiquetas de idioma antes de migrar a un modelo de produccion.
- Docencia y practicas de despliegue: sirve como ejemplo para construir un servidor de inferencia minimo (FastAPI, por ejemplo) que cargue el modelo mediante el codigo del repositorio de la asignatura.
- Investigacion sobre enrutamiento de expertos: las 17 M de parametros totales frente a 13,5 M activos permiten instrumentar y visualizar que expertos se activan por idioma de origen, util para estudiar especializacion linguistica en MoE.
- Generacion de datos sinteticos de traduccion a pequena escala: puede producir pares vi-en y ja-en para aumentar corpus de validacion internos, siempre con revision humana dada su escala reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas tipo BLEU, chrF, COMET, MMLU ni HumanEval, y tampoco se aportan curvas de perdida mas alla del enlace al run de Weights & Biases (`moe_shared-a8f358e0`).

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 70 MB en fp32, 35 MB en fp16 y 18 MB en int8 (calculado sobre los 17,02 M de parametros, sin incluir activaciones ni cache de atencion).
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; una RTX 3060, RTX 4090, A100 o incluso una GPU integrada pueden ejecutar el modelo sin problema.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU y en dispositivos moviles.
- Opciones de despliegue: no hay soporte nativo en vLLM, TGI, Ollama o llama.cpp con los pesos publicados. La carga requiere el codigo personalizado del repositorio de la asignatura (`src.part1.model.Transformer.from_pretrained`). Para usar llama.cpp seria necesario exportar manualmente los pesos a GGUF, dado que la arquitectura MoE personalizada no es estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DunkRonit/anlp-a2-part1-moe_shared | 17,02 M (13,48 M activos) | no disponible | vi, ja, en | no disponible | HuggingFace, requiere codigo propio |
| Helsinki-NLP/opus-mt-ja-en (referencia de traduccion ja-en de tipo Marian) | en torno a decenas de millones (dato no verificado en la informacion disponible) | no disponible | ja, en | CC-BY-4.0 (habitual en la familia opus-mt; no verificado) | HuggingFace, compatible con transformers |
| T5-small (linea base multitarea) | 60,5 M (dato de conocimiento general, no verificado aqui) | 512 tokens (habitual) | multilingue limitado | Apache 2.0 | HuggingFace, compatible con transformers |

La comparativa es orientativa. No se dispone de datos de rendimiento del modelo analizado ni de sus alternativas dentro de la informacion proporcionada, y las cifras de los modelos de referencia pertenecen a conocimiento general no verificado en esta busqueda.

## Limitaciones y advertencias

- Modelo de 17 M de parametros entrenado con 39 M de tokens: la calidad de traduccion esperada es muy inferior a la de sistemas de traduccion neuronales modernos; es un artefacto academico, no una herramienta de produccion.
- No se declara licencia. Sin licencia explicita, no hay autorizacion clara para uso comercial; se debe contactar con el autor antes de cualquier uso fuera del ambito academico.
- Riesgo elevado de alucinacion y de traducciones incompletas o incorrectas, especialmente en secuencias largas o con vocabulario poco frecuente.
- La longitud de contexto no esta documentada, por lo que no se puede garantizar el comportamiento en entradas largas.
- Cubre unicamente vi→en y ja→en; no traduce en sentido inverso ni a otros idiomas.
- Solo se publican pesos en safetensors con una arquitectura MoE personalizada (`moe_shared`), lo que impide la carga directa con `transformers`, vLLM u Ollama y obliga a usar el codigo de la asignatura.
- Ausencia total de benchmarks publicados: no es posible estimar BLEU, chrF ni COMET sin evaluacion propia.
- El repositorio no registra descargas ni likes, y no hay garantia de mantenimiento ni de soporte por parte del autor.
- Los sesgos del corpus `en-vi-ja-curated-500k-triplets` se transfieren directamente al modelo; no se documenta ninguna fase de mitigacion.

## Enlaces

- HuggingFace: https://huggingface.co/DunkRonit/anlp-a2-part1-moe_shared
- Run de Weights & Biases: https://wandb.ai/dunkronit-iiit-hyderabad/anlp-a2-part1/runs/moe_shared-a8f358e0
- Dataset de entrenamiento (referenciado en la model card): belumind/en-vi-ja-curated-500k-triplets
- Repositorio de codigo de carga: `src.part1.model.Transformer` del repositorio de la asignatura (no se proporciona URL en la informacion disponible)
