# bshang17/smt-meta-case1-n5-hq_safety

## Resumen

`smt-meta-case1-n5-hq_safety` es una coleccion de checkpoints intermedios de entrenamiento (mid-training) de un modelo SmolLM2-1.7B, publicada por el usuario `bshang17`. No se trata de un modelo final afinado para uso general, sino de un artefacto de investigacion: capturas del estado completo del entrenamiento a pasos concretos, tras procesar 60.000 millones de tokens con una mezcla de datos denominada `hq_safety`. El objetivo declarado es permitir la reanudacion exacta del entrenamiento y la evaluacion de estados intermedios en el contexto de seguridad (safety).

El repositorio pesa 25,4 GB y contiene, por cada paso guardado, dos variantes: el checkpoint completo en fp32 (con pesos `model.safetensors` y el estado integro del optimizador AdamW en `optimizer.pt`) y una exportacion en bf16 de los mismos pesos pensada para evaluacion. La arquitectura subyacente es la de SmolLM2-1.7B, un transformer decoder-only de aproximadamente 1.700 millones de parametros desarrollado originalmente por Hugging Face.

La relevancia de esta publicacion es acotada pero clara para quien investiga el efecto del mid-training en comportamientos de seguridad: ofrece puntos de control intermedios reproducibles sobre una base pequena y bien conocida, con el estado del optimizador incluido, lo que permite bifurcar el entrenamiento o analizar la evolucion de las capacidades a lo largo del proceso. No hay model card funcional, licencia declarada ni datos de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM2-1.7B) |
| Parametros totales | 1.700 millones (aprox., segun la base SmolLM2-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de SmolLM2-1.7B) |
| Tipos de cuantizacion | no se publican cuantizaciones; el repo incluye fp32 y bf16 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32 y bf16), mas `optimizer.pt` y `state.json` |
| Tokens de entrenamiento | 60.000 millones (mezcla `hq_safety`) |
| Estado del entrenamiento | checkpoints por paso (`step-XXXXXX/`) |

## Arquitectura y entrenamiento

El modelo se apoya en SmolLM2-1.7B, un transformer decoder-only con atencion causal, disenado para ejecucion eficiente en hardware modesto. Sobre esa base, el autor ha realizado un mid-training de 60.000 millones de tokens con una mezcla de datos llamada `hq_safety`, cuyo contenido detallado no se describe en la informacion disponible. No se especifica si hubo fases de RLHF, DPO u otro ajuste por preferencias, ni la composicion exacta del dataset.

La innovacion practica del repositorio no esta en la arquitectura, sino en el formato de publicacion: cada directorio `step-XXXXXX/` contiene el checkpoint completo en fp32 con el estado integro de AdamW (`optimizer.pt`) y un `state.json` con el paso y la posicion en los datos, lo que permite reanudar el entrenamiento de forma exacta. Ademas, cada paso incluye un subdirectorio `bf16/` con la exportacion de los pesos para evaluacion. Este diseno convierte el repositorio en un conjunto de puntos de control reproducibles mas que en un modelo listo para produccion.

## Capacidades

- Generacion de texto autoregresiva, heredada de la base SmolLM2-1.7B.
- Razonamiento basico y respuesta a instrucciones, en la medida en que la base y el mid-training lo permitan (no se documenta).
- Capacidades multilingues: no documentadas; dependen de la mezcla de datos, que no se detalla.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Uso principal como artefacto de investigacion: reanudacion de entrenamiento y evaluacion de estados intermedios de safety.

## Casos de uso

- Reanudacion exacta de entrenamiento: cargar `model.safetensors` junto con `optimizer.pt` y `state.json` para continuar el mid-training desde el paso guardado sin perder el estado de AdamW ni la posicion en el flujo de datos.
- Estudio de la evolucion de comportamientos de seguridad: evaluar los distintos `step-XXXXXX/bf16/` con baterias de safety para trazar como cambia el comportamiento a lo largo de los 60.000 millones de tokens.
- Bifurcacion de experimentos: partir de un checkpoint intermedio e introducir cambios en la mezcla de datos o hiperparametros para comparar trayectorias de entrenamiento desde un punto comun reproducible.
- Investigacion de olvido catastrofico: medir la degradacion o preservacion de capacidades generales (lenguaje, conocimiento) en cada paso frente al modelo base SmolLM2-1.7B.
- Analisis de mezclas de datos: usar los checkpoints como referencia para estudiar el efecto de la mezcla `hq_safety` frente a otras mezclas sobre la base SmolLM2-1.7B.
- Base para ajuste fino posterior: emplear la exportacion bf16 de un paso concreto como punto de partida para SFT o DPO en tareas especificas, con la ventaja de disponer del estado completo si se necesita volver atras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 3,4 GB solo para pesos (1.700 millones de parametros a 2 bytes), mas memoria para activaciones y cache KV.
- VRAM para inferencia en fp32: aproximadamente 6,8 GB solo para pesos.
- VRAM para reanudar entrenamiento: el checkpoint incluye el estado completo de AdamW, lo que anade aproximadamente el doble de los pesos en fp32 (del orden de 13-14 GB adicionales) mas el estado de los momentos; se recomienda GPU con 40 GB o mas (A100 40/80 GB, H100) para reanudacion comoda.
- GPU consumer: la inferencia en bf16 cabe en GPUs de 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070); en cuantizacion de 4 bits cabria en GPUs de 4-6 GB, aunque el repo no publica cuantizaciones.
- Opciones de despliegue para evaluacion: transformers, vLLM, llama.cpp u Ollama tras convertir los pesos bf16 a GGUF (no se proporcionan conversiones listas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smt-meta-case1-n5-hq_safety (este) | 1.700 M (aprox.) | no disponible | no disponible | Hugging Face (repo de checkpoints) |
| SmolLM2-1.7B (base) | 1.700 M | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |
| SmolLM2-360M | 360 M | no disponible | no disponible | Hugging Face |
| Modelos de ~1-2B de otras familias | variable | variable | variable | no disponible |

La comparacion relevante es con el propio SmolLM2-1.7B: este repositorio no aporta un modelo nuevo, sino estados intermedios del mismo con una mezcla de datos orientada a safety. Frente a un modelo final afinado, carece de evaluacion publicada y de garantias de calidad, pero ofrece trazabilidad completa del entrenamiento.

## Limitaciones y advertencias

- No es un modelo final: son checkpoints de mid-training, sin documentacion de calidad ni evaluacion.
- Ausencia de model card funcional: no se describe la mezcla `hq_safety`, los idiomas, el contexto efectivo ni el proceso de alineamiento.
- Licencia no declarada: no se puede asumir uso comercial; la licencia de la base SmolLM2-1.7B deberia verificarse por separado.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser estados intermedios, el comportamiento puede ser inestable.
- Capacidades multilingues y de contexto no verificadas.
- El repositorio es pesado (25,4 GB) por incluir estados de optimizador; no es adecuado para despliegue directo sin extraer y convertir los pesos bf16.
- Uso previsto de investigacion: no recomendado para produccion sin evaluacion previa y sin una licencia clara.

## Enlaces

- Hugging Face: https://huggingface.co/bshang17/smt-meta-case1-n5-hq_safety
- Modelo base SmolLM2-1.7B (referencia de la arquitectura): no se proporciona enlace en la informacion disponible.
- Paper, blog o demo del autor: no disponible.
