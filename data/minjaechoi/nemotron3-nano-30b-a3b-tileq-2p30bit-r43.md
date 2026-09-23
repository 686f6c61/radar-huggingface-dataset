# minjaechoi/nemotron3-nano-30b-a3b-tileq-2p30bit-r43

# Nemotron-3-Nano-30B-A3B TileQ 2.30-bit r43

## Resumen

Se trata de un checkpoint derivado del modelo NVIDIA Nemotron-3-Nano-30B-A3B-BF16, publicado por el usuario minjaechoi bajo el identificador `nemotron3-nano-30b-a3b-tileq-2p30bit-r43`. No es un modelo entrenado desde cero, sino una versión cuantizada del modelo base de NVIDIA: los expertos enrutados (routed experts) se han cuantizado a una media de 2,3010 bits mediante un esquema interno denominado TileQ (revisión r43), mientras que el resto de pesos permanece en BF16.

El modelo base pertenece a la familia Nemotron-H de NVIDIA, como indica el tag `nemotron_h` del repositorio, y tiene arquitectura de mezcla de expertos (MoE) con aproximadamente 31,58 mil millones de parámetros totales. La nomenclatura "A3B" del nombre sugiere del orden de 3 mil millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo de cuantización extrema aplicada únicamente a los expertos enrutados de un MoE, una técnica pensada para reducir el coste de memoria de las capas más numerosas sin tocar el resto de la red. Por otro, conviene señalar que se autodefine como "checkpoint de investigación interno", tiene cero descargas y cero valoraciones, no publica benchmarks y sus pesos se almacenan desquantizados en BF16, por lo que todavía no ofrece un ahorro de memoria evidente frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (tag `nemotron_h` del repositorio; familia MoE del modelo base de NVIDIA) |
| Parametros totales | 31.577.937.344 (~31,6B) |
| Parametros activos | ~3B (deducido de la nomenclatura A3B del modelo base; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,3010 bits de media (esquema interno TileQ, revision r43); resto de pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (libreria `transformers`, requiere `custom_code`) |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 |
| Tamano del repositorio | 63,2 GB |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento de este checkpoint, ya que es una cuantizacion del modelo base y no se documentan ni el numero de tokens, ni la composicion del dataset, ni si hubo fases de RLHF o DPO. El unico dato tecnico aportado por el autor es el esquema de cuantizacion: los expertos enrutados se cuantizan a una media de 2,3010 bits, mientras que "cada otro peso" se mantiene en BF16.

La innovacion tecnica declarada es precisamente ese enfoque selectivo, al que el autor llama TileQ y que identifica con la revision interna r43. En lugar de cuantizar la red completa, se actua solo sobre los expertos enrutados, que en un MoE concentran la mayor parte de los parametros pero se activan de forma dispersa. Un detalle critico para el despliegue es que, segun la model card, los pesos se almacenan desquantizados en tensores BF16 y se cargan con `transformers` estandar o vLLM. El repositorio ocupa 63,2 GB, una cifra coherente con almacenar ~31,6B parametros en BF16, por lo que en el estado publicado no se observa una reduccion de huella frente al modelo base.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, con la libreria `transformers`.
- Uso conversacional: el tag `conversational` del repositorio confirma soporte de dialogos multi-turno.
- Razonamiento, codigo, matematicas, vision o audio: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modos especiales (thinking mode, vision, audio): no disponible.

Las capacidades reales del modelo dependen del modelo base de NVIDIA, cuya model card no forma parte de la informacion suministrada, por lo que no se pueden detallar aqui sin riesgo de inventar datos.

## Casos de uso

- Asistente conversacional autoalojado: al ser un modelo de generacion de texto con tag `conversational`, puede desplegarse como chatbot multi-turno en infraestructura propia, aprovechando su naturaleza MoE para activar solo una fraccion de parametros por token.
- Investigacion en cuantizacion de MoE: es el caso de uso mas directo, ya que se trata de un checkpoint de investigacion pensado para estudiar el impacto de reducir los expertos enrutados a 2,3 bits sobre la calidad de las respuestas.
- Evaluacion comparativa frente al modelo base: permite medir la degradacion (o ausencia de ella) entre la version BF16 original y esta variante cuantizada, siempre que se ejecuten las mismas baterias de pruebas.
- Generacion de texto en pipelines de `transformers`: al cargarse con la libreria estandar, puede integrarse en flujos existentes de generacion por lotes para resumen, redaccion o clasificacion generativa.
- Servicio de inferencia con vLLM: el autor indica compatibilidad explicita con vLLM, lo que habilita despliegues con batching continuo y `paged attention` en entornos de servidor.
- Experimentacion con `custom_code` y arquitecturas hibridas: sirve como banco de pruebas para validar la carga de modelos Nemotron-H con codigo remoto en versiones recientes de `transformers`.
- Base para re-cuantizacion adicional: dado que los pesos son BF16, puede servir como punto de partida para aplicar cuantizaciones de 4 u 8 bits orientadas a GPU de consumo, algo que el checkpoint publicado no ofrece de serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra bateria, ni comparaciones con el modelo base o con alternativas. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se almacenan en BF16, por lo que se necesitan aproximadamente 63 GB solo para los pesos, mas la cache KV y el overhead del runtime. En la practica, del orden de 70-80 GB de VRAM para una ventana de contexto moderada (estimacion, no dato oficial).
- GPU recomendadas: NVIDIA H100 de 80 GB (una unidad puede ser suficiente para pesos en una sola GPU, segun contexto), 2x A100 80 GB, 2x H100 80 GB para mayor margen de contexto y batching.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en ninguna GPU de consumo actual en su estado BF16 publicado.
- Escenario de consumo: solo seria viable tras re-cuantizar los pesos a 4 bits (~18 GB) o inferiores, por ejemplo en una RTX 4090 o RTX 3090 de 24 GB, lo que no es el formato distribuido por el autor.
- Opciones de despliegue: `transformers` estandar con `trust_remote_code` habilitado (requerido por el tag `custom_code` y el modelo `nemotron_h`) y vLLM, mencionado explicitamente por el autor. Compatibilidad con llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Precision de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nemotron3-nano-30b-a3b-tileq-2p30bit-r43 (este) | ~31,6B | no disponible | Expertos a 2,3010 bits (almacenados en BF16) | Sigue la del base | HuggingFace, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (base) | ~31,6B | no disponible | BF16 | no disponible | Modelo oficial de NVIDIA |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables (por ejemplo, otros MoE de ~30B de la misma generacion o cuantizaciones alternativas del mismo base) dentro del material proporcionado, por lo que la comparativa queda limitada al modelo de origen.

## Limitaciones y advertencias

- Estado de investigacion: el propio autor lo describe como "checkpoint de investigacion interno", con 0 descargas y 0 valoraciones, sin validacion por parte de la comunidad.
- Ausencia de benchmarks: no hay ninguna metrica publicada que respalde la calidad del modelo ni la del proceso de cuantizacion.
- Cuantizacion agresiva: llevar los expertos enrutados a 2,3010 bits de media es una precision muy baja que puede degradar la calidad de las respuestas respecto al modelo base en tareas sensibles al detalle.
- Huella de memoria sin mejora aparente: el repositorio ocupa 63,2 GB y los pesos se almacenan desquantizados en BF16, por lo que el ahorro de memoria no se materializa en el formato publicado.
- Licencia no declarada: la model card indica que la licencia sigue la del modelo base, pero no se especifica cual es, por lo que el uso comercial no puede confirmarse sin consultar la licencia de NVIDIA.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento multilingue o ventanas largas.
- Riesgo de alucinacion: inherente a cualquier modelo de generacion de texto y no cuantificado en esta ficha.
- Dependencia de codigo remoto: requiere `trust_remote_code` por el tag `custom_code`, lo que implica ejecutar codigo del repositorio y exige revisarlo antes de usarlo en produccion.
- Posible desactualizacion de `transformers`: la arquitectura `nemotron_h` puede requerir una version reciente de la libreria; no se especifica la version minima.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/minjaechoi/nemotron3-nano-30b-a3b-tileq-2p30bit-r43
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
