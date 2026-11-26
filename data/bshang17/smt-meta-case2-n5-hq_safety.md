# bshang17/smt-meta-case2-n5-hq_safety

## Resumen

`smt-meta-case2-n5-hq_safety` es una coleccion de checkpoints intermedios de entrenamiento (mid-training) de un modelo basado en SmolLM2-1.7B, publicado por el usuario `bshang17` en Hugging Face. No se trata de un modelo afinado para uso directo, sino de un artefacto de investigacion: el resultado de continuar el preentrenamiento de SmolLM2-1.7B durante 60.000 millones de tokens adicionales con una mezcla de datos denominada `hq_safety`, guardando instantaneas en pasos seleccionados.

Cada checkpoint se ofrece en dos formatos: un directorio completo con pesos en fp32, el estado integro del optimizador AdamW (`optimizer.pt`) y un `state.json` con el paso y la posicion en el flujo de datos, que permite reanudar el entrenamiento de forma exacta; y un subdirectorio `bf16/` con la exportacion de los mismos pesos en precision bfloat16, pensada para evaluacion.

Su relevancia es acotada pero concreta: sirve para estudiar el efecto de mezclas de datos orientadas a seguridad sobre un modelo pequeno (1.700 millones de parametros) a lo largo del entrenamiento, y para comparar el comportamiento del modelo en distintos pasos. El repositorio ocupa 25,4 GB y no incluye model card con especificaciones de licencia, idiomas o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 1.700 millones (modelo base SmolLM2-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos fp32 y bf16; no se mencionan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32 y bf16), mas `optimizer.pt` y `state.json` por checkpoint |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-1.7B, un transformer decoder-only de 1.700 millones de parametros desarrollado por Hugging Face. La model card no detalla la arquitectura interna (numero de capas, dimension oculta, atencion, etc.), por lo que esos datos deben consultarse en la ficha del modelo base.

El entrenamiento consiste en un mid-training de 60.000 millones de tokens sobre la mezcla `hq_safety`, presumiblemente orientada a datos de seguridad, aunque la composicion exacta del dataset no se describe. Los checkpoints se guardan en pasos seleccionados e incluyen el estado completo de AdamW, lo que permite reanudar el entrenamiento de forma bit a bit desde cualquier instantanea. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base SmolLM2-1.7B.
- Razonamiento y conocimiento general en la medida en que lo conserve el modelo base tras el mid-training.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Uso principal como artefacto de investigacion: reanudacion de entrenamiento y evaluacion comparativa entre pasos.

## Casos de uso

- Investigacion sobre mezclas de datos de seguridad: entrenar y comparar checkpoints en distintos pasos para medir como evoluciona el comportamiento del modelo con la mezcla `hq_safety`.
- Reanudacion exacta de entrenamiento: gracias a `optimizer.pt` y `state.json`, un equipo puede continuar el mid-training desde cualquier paso sin perder el estado de AdamW ni la posicion en el flujo de datos.
- Evaluacion de checkpoints intermedios: la exportacion bf16 permite ejecutar benchmarks de seguridad, toxicidad o conocimiento en cada instantanea sin cargar el estado del optimizador.
- Estudio de olvido catastrofico: comparar el rendimiento del modelo base frente a los checkpoints tras 60.000 millones de tokens adicionales para cuantificar la degradacion o mejora en tareas generales.
- Fine-tuning posterior sobre datos de seguridad: usar un checkpoint como punto de partida para SFT o DPO en lugar del modelo base, aprovechando el sesgo hacia datos de seguridad.
- Reproducibilidad de experimentos: el `state.json` con paso y posicion de datos facilita replicar exactamente una ejecucion de entrenamiento en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en bf16 para los pesos (1.700 millones de parametros x 2 bytes); en fp32, unos 6,8 GB solo para pesos.
- Entrenamiento o reanudacion: requiere cargar pesos fp32 (6,8 GB) mas el estado completo de AdamW, que tipicamente triplica o cuadruplica el uso de memoria; se recomienda al menos 40-80 GB de VRAM, es decir, A100 40/80 GB o H100.
- GPU consumer: la inferencia en bf16 cabe en GPUs con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4090). La reanudacion del entrenamiento completo no es viable en consumer.
- Opciones de despliegue: al no distribuirse en GGUF, las opciones habituales son transformers, vLLM o TGI cargando los safetensors bf16; llama.cpp u Ollama requeririan conversion previa a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smt-meta-case2-n5-hq_safety | 1.700 M | no disponible | no disponible | Hugging Face (repo de investigacion) |
| SmolLM2-1.7B | 1.700 M | no disponible en esta ficha | Apache 2.0 (segun el modelo base) | Hugging Face |
| Qwen2.5-1.5B | 1.500 M | no disponible en esta ficha | Apache 2.0 (segun el modelo base) | Hugging Face |

La comparacion con SmolLM2-1.7B es la mas directa, ya que este repositorio es una continuacion de su preentrenamiento; las diferencias se limitan a los 60.000 millones de tokens adicionales con la mezcla `hq_safety`. Frente a Qwen2.5-1.5B, de tamano similar, no hay datos de rendimiento disponibles para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo listo para produccion: son checkpoints de mid-training sin ajuste de instrucciones ni alineacion posterior.
- Licencia no especificada en el repositorio; antes de cualquier uso comercial debe verificarse la licencia del modelo base SmolLM2-1.7B y la del propio repositorio.
- Riesgo de alucinacion inherente a un modelo de 1.700 millones de parametros sin fine-tuning.
- Sesgos desconocidos: la composicion de la mezcla `hq_safety` no se documenta, por lo que no puede evaluarse que sesgos introduce.
- Idiomas soportados no declarados; el comportamiento multilingue depende del modelo base y del mid-training.
- Longitud de contexto no documentada en la informacion proporcionada.
- El repositorio incluye el estado del optimizador, lo que infla el tamano (25,4 GB) y complica su uso fuera de entornos de entrenamiento.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bshang17/smt-meta-case2-n5-hq_safety
- Modelo base SmolLM2-1.7B (referencia): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
