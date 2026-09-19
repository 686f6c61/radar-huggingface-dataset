# minjaechoi/nemotron3-nano-30b-a3b-2p36bit-r16

## Resumen

Este repositorio, publicado por el usuario minjaechoi bajo el identificador `minjaechoi/nemotron3-nano-30b-a3b-2p36bit-r16`, es un checkpoint de investigación derivado de `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. Se trata de una variante cuantizada del modelo base en la que únicamente los expertos enrutados (routed experts) de la mezcla se almacenan con una media de 2,355 bits, mientras que el resto de pesos permanece en BF16. El autor lo etiqueta como "checkpoint de investigación interno" con identificador interno `r16`.

El modelo hereda la arquitectura del base, identificada por la etiqueta `nemotron_h`, y cuenta con 31.577.937.344 parámetros totales según los safetensors. La nomenclatura "30B-A3B" del modelo base sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 30.000 millones de parámetros totales y unos 3.000 millones activos por token, aunque el dato de parámetros activos no se detalla explícitamente en la información disponible.

Es relevante ahora porque explora una técnica de cuantización agresiva selectiva (solo sobre expertos enrutados) manteniendo compatibilidad con `transformers` y vLLM. Sin embargo, conviene subrayar un detalle crítico: el propio autor indica que los pesos se almacenan de forma desquantizada en tensores BF16, por lo que el peso efectivo en disco y en memoria corresponde a un modelo BF16, no a un modelo de 2,355 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (transformer/MoE, segun etiqueta del modelo base); detalles concretos no disponibles |
| Parametros totales | 31.577.937.344 (~31,6 B) |
| Parametros activos | no disponible (la nomenclatura del base sugiere ~3 B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,355 bits de media (r16); resto de pesos en BF16; pesos almacenados desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta `nemotron_h` heredada del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El sufijo "A3B" en la nomenclatura del base apunta a un diseno de mezcla de expertos (MoE) con un subconjunto de parametros activos por token, pero no se proporcionan detalles sobre el numero de expertos, la estrategia de enrutamiento ni el tipo de capas (atencion, SSM o hibridas).

En cuanto al proceso de creacion, no se trata de un modelo entrenado desde cero, sino de una conversion cuantizada del checkpoint base BF16. El autor indica que solo los expertos enrutados se comprimen a una media de 2,355 bits, mientras que el resto de pesos se mantiene en BF16. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales, salvo la propia tecnica de cuantizacion selectiva por experto.

## Capacidades

- Generacion de texto: hereda la funcion de `text-generation` del modelo base, con pipeline declarado como text-generation.
- Conversacion: etiquetado como `conversational`, apto para dialogos multi-turno.
- Razonamiento, codigo y matematicas: no hay informacion especifica en la documentacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo pensamiento, vision, audio): no disponible.
- Requiere `custom_code`: la carga con `transformers` necesita `trust_remote_code` por la arquitectura no estandar.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion: el modelo sirve como banco de pruebas para medir el impacto de cuantizar solo los expertos enrutados a 2,355 bits frente al checkpoint BF16, comparando calidad de generacion y consumo de memoria.
- Investigacion sobre MoE: permite estudiar como responde una mezcla de expertos a una compresion selectiva, util para quienes investigan eficiencia en modelos de mezcla.
- Despliegue experimental con vLLM: el autor afirma compatibilidad con vLLM y `transformers` estandar, lo que facilita integrarlo en pipelines de inferencia para pruebas internas.
- Generacion de texto en entornos de investigacion: util para tareas de continuacion de texto y dialogos en laboratorio donde no se requiere soporte comercial garantizado.
- Comparativas de reproducibilidad: al ser un checkpoint derivado con identificador interno `r16`, sirve para replicar experimentos de cuantizacion y documentar resultados.
- Prototipado rapido con conversion a otros formatos: partiendo de los safetensors, se puede evaluar la exportacion a GGUF u otros formatos para despliegue alternativo (aunque no se confirma soporte del autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que los pesos se almacenan en BF16 (el repositorio ocupa 63,2 GB), la huella de pesos ronda los 63 GB, mas cache KV y activaciones.
- GPU recomendadas: se necesita al menos una GPU con 80 GB (por ejemplo A100 80 GB o H100 80 GB) para el modelo en BF16; alternativamente varias GPU en paralelo.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en GPUs consumer habituales en este formato BF16; requeriria cuantizaciones adicionales no incluidas en este repositorio.
- Opciones de despliegue: `transformers` (con `trust_remote_code`) y vLLM, segun lo indicado por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/nemotron3-nano-30b-a3b-2p36bit-r16 | ~31,6 B | no disponible | no disponible | no disponible (sigue la del base) | HuggingFace, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (base) | ~31,6 B | no disponible | no disponible | la del base (consultar) | HuggingFace |
| Otras alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- La designacion "2,355 bits" puede inducir a error: aunque los expertos se cuantizan a esa media, los pesos se almacenan desquantizados en tensores BF16, por lo que el ahorro de memoria no se materializa respecto al checkpoint BF16 (63,2 GB en repositorio).
- Es un checkpoint de investigacion interno (`r16`), sin garantias de calidad ni de estabilidad para produccion.
- No se declara licencia explicita; el autor remite a la licencia del modelo base, que debe verificarse antes de cualquier uso comercial.
- No se documentan idiomas soportados, lo que impide garantizar cobertura multilingue.
- No hay resultados de benchmarks publicados, por lo que no se puede evaluar la degradacion introducida por la cuantizacion.
- Cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Requiere `trust_remote_code` y `custom_code`, lo que implica ejecutar codigo del repositorio; conviene auditar antes de desplegar.
- Riesgo de alucinacion, sesgos y limitaciones de contexto: no evaluados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/nemotron3-nano-30b-a3b-2p36bit-r16
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Paper, blog, repositorio o demo adicionales: no disponibles (la busqueda web no devolvio resultados relevantes).
