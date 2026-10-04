# DunkRonit/anlp-a2-part2-mars

## Resumen

anlp-a2-part2-mars es un transformer denso de tipo decoder-only con 17.011.584 parametros, desarrollado por el usuario DunkRonit (vinculado a IIIT Hyderabad segun la URL de Weights & Biases) como parte de una asignatura de ANLP (Advanced Natural Language Processing). El modelo se entreno desde cero sobre el corpus browndw/human-ai-parallel-corpus, con una sola pasada por el split de entrenamiento (1x) y un total de 41.680.896 tokens procesados.

El aspecto mas destacable es que emplea un optimizador propio denominado `mars`, implementado tambien desde cero, lo que convierte al artefacto en una prueba de concepto academica sobre entrenamiento de transformers a pequena escala mas que en un modelo orientado a produccion. La ficha de HuggingFace no declara pipeline, licencia ni resultados de evaluacion, y el repositorio no registra descargas ni interacciones.

Por su tamano (17M de parametros) y su contexto de origen, se trata de un modelo de laboratorio util para reproducir experimentos de preentrenamiento, estudiar el comportamiento del optimizador `mars` y comparar curvas de entrenamiento, pero no para tareas de generacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (no se especifica el detalle de capas ni atencion) |
| Parametros totales | 17.011.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declara formato safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (el repo tambien incluye estados de optimizadores) |

## Arquitectura y entrenamiento

La model card describe un transformer denso decoder-only entrenado desde cero. No se detallan el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el tipo de positional encoding ni la funcion de activacion, por lo que esos datos figuran como no disponibles. El modelo se cargo mediante la clase `Transformer.from_pretrained("DunkRonit/anlp-a2-part2-mars")` del repositorio de la asignatura, lo que sugiere una implementacion propia y no una arquitectura estandar de HuggingFace `transformers`.

El entrenamiento consumio 41.680.896 tokens del corpus browndw/human-ai-parallel-corpus, con una unica pasada sobre el split de entrenamiento (1x). La innovacion tecnica declarada es el uso de un optimizador `mars` implementado desde cero en lugar de optimizadores convencionales como AdamW. No se menciona el uso de RLHF, DPO, SFT ni tecnicas de alineacion posteriores, ni tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles, limitada por el tamano del modelo (17M de parametros) y por un presupuesto de entrenamiento de 41,7M de tokens.
- Modelado de lenguaje de tipo causal (decoder-only), apto para continuacion de texto y calculo de perplejidad.
- Capacidad de entrenamiento sobre corpus paralelo humano-IA, segun el dataset utilizado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, modo de razonamiento explicito): no disponible.

## Casos de uso

- Reproduccion de experimentos academicos: el modelo sirve para replicar el entrenamiento con el optimizador `mars` y comparar su convergencia frente a AdamW u otros optimizadores en un presupuesto de 41,7M de tokens.
- Estudio de escalado a baja escala: permite analizar como se comporta un transformer de 17M de parametros en tareas de modelado de lenguaje con un corpus reducido.
- Evaluacion de curvas de perdida: util para investigar la estabilidad del entrenamiento con un optimizador implementado desde cero.
- Docencia en cursos de NLP: sirve como ejemplo minimo y autocontenido de pipeline de preentrenamiento (tokenizacion, bucle de entrenamiento, guardado en safetensors).
- Pruebas de infraestructura de despliegue: por su tamano (0,1 GB), es adecuado para validar pipelines de carga de safetensors, servidores de inferencia o scripts de evaluacion sin coste de GPU apreciable.
- Generacion de texto experimental en ingles: puede producir continuaciones de texto, aunque con calidad muy limitada por el tamano y los datos de entrenamiento.
- Comparacion de datasets: al entrenarse sobre human-ai-parallel-corpus, permite estudiar el efecto de ese corpus en un modelo pequeno frente a otros corpus de la asignatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 68 MB de pesos (17,0M x 4 bytes); en fp16/bf16, unos 34 MB; en int8, unos 17 MB. A esto hay que sumar memoria de activaciones y del runtime, tipicamente inferior a 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe holgadamente en tarjetas de gama baja, integradas y en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna (por ejemplo, series GTX 10xx en adelante, RTX 20xx/30xx/40xx); tambien se puede ejecutar en CPU sin problema.
- Opciones de despliegue: al no seguir la interfaz estandar de HuggingFace `transformers`, el despliegue requiere el codigo del repositorio de la asignatura (`src/part2/model/Transformer.py`). No hay evidencia de soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos de comparacion provienen de conocimiento publico general y no de la informacion proporcionada, por lo que deben tomarse como referencia orientativa. El modelo de la ficha solo se compara en parametros y licencia, ya que no hay benchmarks publicados.

| Modelo | Parametros | Contexto | Licencia | Idioma | Disponibilidad |
|---|---|---|---|---|---|
| DunkRonit/anlp-a2-part2-mars | 17,0M | no disponible | no disponible | en | HuggingFace (repo de asignatura) |
| GPT-2 small | 124M | 1024 tokens | MIT (segun publicacion) | en | HuggingFace transformers |
| TinyLlama-1.1B | 1100M | 2048 tokens | Apache 2.0 | en | HuggingFace transformers |

No se dispone de alternativas directamente comparables dentro de la misma categoria (transformers de ~17M entrenados con optimizadores propios), por lo que la comparativa se limita a ordenes de magnitud.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; el modelo se entreno sobre un unico corpus (human-ai-parallel-corpus) cuya composicion no se detalla, lo que puede introducir sesgos especificos de ese dataset.
- Riesgo de alucinacion: alto. Con 17M de parametros y 41,7M de tokens de entrenamiento, la capacidad de generar texto factual y coherente es muy limitada; es esperable que produzca texto incoherente o repetitivo fuera de distribuciones simples.
- Limitaciones de contexto e idioma: solo se declara ingles y no se especifica la longitud de contexto soportada.
- Restricciones de licencia: la licencia no esta declarada en la ficha de HuggingFace, por lo que no se puede confirmar el uso comercial; se debe contactar con el autor antes de cualquier uso mas alla del academico.
- Caveat de produccion: al no seguir la interfaz estandar de `transformers`, la integracion requiere codigo propio; no hay soporte confirmado en runtimes de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).
- Origen academico: es un artefacto de asignatura con fecha de creacion posterior a la de esta ficha y sin descargas ni validacion externa; no debe considerarse un modelo estable ni mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DunkRonit/anlp-a2-part2-mars
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/dunkronit-iiit-hyderabad/anlp-a2-part2/runs/mars-61852dce
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
