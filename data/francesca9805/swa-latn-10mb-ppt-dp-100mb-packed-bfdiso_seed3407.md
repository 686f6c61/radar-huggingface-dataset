# francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407

## Resumen

El modelo `francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407` es un ajuste fino (SFT) de tipo causal-LM construido sobre `goldfish-models/swa_latn_10mb`, un modelo monolingue para suajili en escritura latina. Lo publica el usuario de HuggingFace `francesca9805` y el entrenamiento se ha realizado con la libreria TRL (version 0.23.0), dentro del proyecto de Weights & Biases `f-padovani-university-of-groningen/new-tokenizers`, lo que apunta a un trabajo de investigacion centrado en tokenizadores para lenguas de bajos recursos.

Tecnicamente es un transformer de arquitectura GPT-2 (etiqueta `gpt2` en el repositorio) con 39.087.104 parametros totales (unos 39 M) y un peso de repositorio de 0,1 GB. La longitud de contexto, los idiomas exactos y la licencia no estan declarados de forma explicita en la informacion disponible. El nombre del modelo sugiere un experimento controlado con semilla fija (`seed3407`), corpus empaquetado (`packed`) y variantes de tamano (10 MB / 100 MB), pero estos extremos no se confirman en la model card.

Su relevancia es fundamentalmente de investigacion: se trata de un modelo muy pequeno, orientado a medir el efecto de decisiones de tokenizacion y de datos de ajuste en lenguas con pocos recursos como el suajili, no a competicion con LLM de gran escala. Por su tamano, es adecuado para experimentacion reproducible, despliegue en hardware muy limitado y estudios comparativos entre semillas y tamanos de corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (GPT-2) |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compatible con cuantizacion estandar de transformers al ser safetensors) |
| Idiomas soportados | suajili en escritura latina (inferido del identificador `swa-latn`); no declarado oficialmente |
| Licencia | no disponible (la model card solo indica `licence: license`, sin terminos concretos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de la familia GPT-2, con el tokenizador y la configuracion heredados de `goldfish-models/swa_latn_10mb`. Cuenta con 39,09 millones de parametros, lo que lo situa en la gama de modelos diminutos tipo nano-GPT, muy por debajo de los cientos de millones de parametros habituales en modelos multilingues de investigacion.

El entrenamiento se ha realizado mediante aprendizaje supervisado (SFT) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121 y Datasets 4.8.4. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. El nombre del modelo (`ppt`, `Dp`, `100mb-packed`, `bfdiso`) sugiere variantes experimentales de preprocesado y empaquetado de datos, pero no hay documentacion publica que detalle que significan cada uno de esos terminos. No se declaran innovaciones de decodificacion, atencion lineal ni tecnicas de inferencia especulativa.

## Capacidades

- Generacion de texto causal en suajili (escritura latina), heredada del modelo base.
- Ajuste por instrucciones mediante SFT con TRL, lo que permite plantillas conversacionales de un turno (el ejemplo de la model card usa el formato `[{"role": "user", "content": ...}]`).
- Generacion de hasta el numero de tokens nuevos que fije el usuario (`max_new_tokens`); el ejemplo oficial usa 128.
- Inferencia en GPU mediante `transformers.pipeline` y compatibilidad declarada con text-generation-inference y endpoints.
- No hay evidencia de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Cobertura multilingue practicamente nula: el modelo esta centrado en un unico idioma de bajos recursos.

## Casos de uso

- Investigacion sobre tokenizadores: el modelo forma parte de la serie de experimentos `new-tokenizers`, por lo que sirve para comparar como distintas decisiones de tokenizacion afectan a la calidad de generacion en suajili.
- Experimentos reproducibles con semilla fija: el sufijo `seed3407` permite repetir exactamente el mismo ajuste y comparar contra otras semillas o tamanos de corpus (10 MB frente a 100 MB).
- Despliegue en hardware muy limitado: con 39 M de parametros cabe en CPU y en cualquier GPU consumer, lo que lo hace util para pruebas de latencia en entornos sin acelerador.
- Generacion de texto de bajo coste en suajili: util como generador de borradores o de ejemplos sinteticos para aumentar corpus de idiomas con pocos recursos.
- Docencia y prototipado rapido: sirve para ilustrar el flujo completo de fine-tuning con TRL, publicacion en HuggingFace y evaluacion basica sin necesidad de infraestructura GPU.
- Baseline en evaluaciones comparativas: al ser tan pequeno, es un punto de referencia inferior frente al que medir mejoras de modelos mayores en tareas de suajili.
- Pruebas de integracion de pipelines de `transformers` y TGI en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 en torno a 160 MB, en fp16 unos 80 MB, en int8 unos 40 MB y en 4 bits alrededor de 20 MB (calculado a partir de 39,09 M de parametros; no son cifras publicadas por el autor).
- GPU recomendadas: cualquier GPU moderna sirve; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100, H100 e incluso en GPUs integradas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos diez anos, y tambien se puede ejecutar en CPU.
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference (TGI), y servicios compatibles con endpoints. Se ha indexado tambien en plataformas de terceros como FriendliAI y LLM Explorer.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407 | 39,09 M | no disponible | no disponible | HuggingFace |
| goldfish-models/swa_latn_10mb (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | ~39,1 M (estimado por la misma familia) | no disponible | no disponible | HuggingFace |
| francesca9805/rus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | ~39,1 M (segun LLM Explorer) | no disponible | no disponible | HuggingFace |

Los modelos comparables mas cercanos son otras ejecuciones de la misma familia experimental del autor, que comparten arquitectura y tamano pero cambian la semilla, la lengua o el tamano de corpus. No hay comparativas publicas frente a modelos de referencia como mGPT, BLOOM o XLM-R en tareas de suajili.

## Limitaciones y advertencias

- La licencia no esta declarada de forma util: la model card solo dice `licence: license`, lo que impide saber si se permite uso comercial.
- No hay informacion sobre el dataset de entrenamiento ni sobre sesgos, por lo que se desconoce la representatividad del suajili cubierto.
- Riesgo alto de alucinacion y de generar texto incoherente, propio de un modelo de 39 M de parametros.
- Longitud de contexto no documentada; probablemente corta, sin garantia de coherencia en conversaciones multi-turno largas.
- Cobertura multilingue practicamente inexistente: fuera del suajili en alfabeto latino el rendimiento sera bajo o nulo.
- Sin evidencia de soporte de tool calling, agentes o razonamiento multi-paso; no deberia integrarse en flujos de automatizacion que los requieran.
- Repositorio sin descargas ni likes en el momento de redactar la ficha, sin validacion externa de calidad.
- No se ha publicado evaluacion cuantitativa, por lo que cualquier uso en produccion exigiria una bateria de pruebas propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/swa_latn_10mb
- Repositorio TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/f3ty6rl2
- Modelo hermano (semilla 10): https://huggingface.co/francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Modelo hermano (100 MB): https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Modelo hermano en ruso cirilico: https://huggingface.co/francesca9805/rus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Ficha en LLM Explorer (modelo hermano en ruso): https://llm-explorer.com/model/francesca9805%2Frus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407,1CCLllBgdby5Ygr04yVLnj
- Registro en Free2AITools: https://free2aitools.com/model/francesca9805/swa-latn-10mb-ppt-dp-100mb-packed-bfd_seed10
