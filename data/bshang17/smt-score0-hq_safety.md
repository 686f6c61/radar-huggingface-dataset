# bshang17/smt-score0-hq_safety

## Resumen

`smt-score0-hq_safety` es un conjunto de checkpoints de entrenamiento intermedio (mid-training) publicados por el usuario `bshang17` en Hugging Face. No se trata de un modelo final afinado para uso directo, sino de una coleccion de estados de entrenamiento de un modelo base SmolLM2-1.7B que ha sido sometido a una fase adicional de mid-training de 60.000 millones de tokens sobre una mezcla de datos denominada `hq_safety`. Los checkpoints se guardan en pasos seleccionados y cada uno incluye el estado completo del optimizador, lo que permite reanudar el entrenamiento exactamente desde ese punto.

El interes de este repositorio es fundamentalmente de investigacion: sirve para estudiar el efecto del mid-training sobre seguridad en un modelo pequeno, para reproducir experimentos de entrenamiento y para analizar la evolucion de los pesos a lo largo de los pasos. Al no existir una model card con detalles de evaluacion, licencia o idiomas, la informacion disponible se limita a la estructura del repositorio y al modelo base implicito (SmolLM2-1.7B, de Hugging Face).

El repositorio ocupa 50,7 GB, coherente con la publicacion de checkpoints completos en fp32 junto con el estado del optimizador AdamW y exportaciones en bf16. No se han publicado resultados de benchmarks, y el pipeline, la licencia y los idiomas no estan declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B) |
| Parametros totales | 1.700 millones (modelo base SmolLM2-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el repo (el modelo base SmolLM2-1.7B soporta hasta 8.192 tokens, dato no confirmado para estos checkpoints) |
| Tipos de cuantizacion | no disponible (solo se publican pesos fp32 y bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32 `model.safetensors` y exportacion `bf16/`), mas `optimizer.pt` y `state.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2-1.7B, un transformer decoder-only con atencion causal estandar, aunque la model card de este repositorio no detalla la configuracion concreta (numero de capas, dimension oculta, cabezas de atencion). El autor indica que se trata de checkpoints de mid-training de seguridad: el modelo parte de SmolLM2-1.7B y se entrena durante 60.000 millones de tokens sobre la mezcla `hq_safety`.

Cada directorio `step-XXXXXX/` contiene el checkpoint completo de entrenamiento: pesos en fp32, el estado completo de AdamW en `optimizer.pt` y un `state.json` con el paso y la posicion en los datos, lo que permite reanudar el entrenamiento de forma exacta. Ademas, cada paso incluye una exportacion en bf16 en el subdirectorio `bf16/` pensada para evaluacion. No se especifican en la informacion disponible detalles sobre la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base SmolLM2-1.7B.
- Razonamiento basico y respuesta a instrucciones, sujeto al estado de mid-training en que se encuentre el checkpoint.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Uso principal previsto: evaluacion de checkpoints intermedios y reanudacion de entrenamiento, no despliegue en produccion.

## Casos de uso

- Investigacion sobre seguridad en mid-training: comparar la evolucion de las respuestas de seguridad entre distintos pasos (`step-XXXXXX`) para medir como cambia el comportamiento del modelo con los tokens de `hq_safety`.
- Reproduccion de experimentos de entrenamiento: cargar `optimizer.pt` y `state.json` para reanudar exactamente el entrenamiento desde un paso concreto, util para laboratorios que quieran continuar el mid-training con sus propios datos.
- Analisis de trayectorias de pesos: estudiar la deriva de los pesos entre checkpoints en fp32 para investigar fenomenos de olvido catastrofico o especializacion.
- Evaluacion comparativa de checkpoints: usar las exportaciones en bf16 para lanzar baterias de evaluacion (perplejidad, benchmarks de seguridad) sin necesidad de convertir los pesos fp32.
- Base para fine-tuning posterior: partir de un checkpoint intermedio concreto como inicializacion para experimentos de alineamiento o ajuste supervisado.
- Docencia y formacion: ilustrar el ciclo completo de mid-training con un modelo de 1.700 millones de parametros que cabe en hardware asequible y cuyo estado de optimizador esta publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 3,4 GB solo para pesos (1.700 millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM para cargar el checkpoint fp32 completo: unos 6,8 GB solo de pesos; anadir el estado de AdamW (`optimizer.pt`) multiplica el requisito y lo situa en decenas de GB, por lo que el entrenamiento completo no cabe en GPUs de consumo.
- GPU recomendadas para evaluacion en bf16: RTX 4090, RTX 3090, A100 o H100; cualquier GPU con al menos 8 GB de VRAM deberia poder ejecutar la inferencia en bf16.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB, RTX 4070, RTX 4090, siempre que se use la exportacion bf16 y no el checkpoint completo con optimizador.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos bf16 a GGUF; el repositorio solo publica safetensors, por lo que la conversion es responsabilidad del usuario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smt-score0-hq_safety (este repo) | 1.700 M | no disponible | no disponible | Checkpoints de mid-training en HF |
| SmolLM2-1.7B | 1.700 M | 8.192 tokens (segun model card del base) | Apache 2.0 (segun model card del base) | Modelo final en HF |
| Qwen2.5-1.5B | 1.500 M | 32.768 tokens | Apache 2.0 | Modelo final en HF |
| Llama 3.2-1B | 1.200 M | 128.000 tokens | Llama 3.2 Community License | Modelo final en HF |

La comparacion con SmolLM2-1.7B es la mas directa porque este repositorio deriva de el; la diferencia clave es que aqui se publican estados intermedios de entrenamiento con optimizador, no un modelo final evaluado. Los datos de contexto y licencia de los modelos alternativos provienen de sus respectivas model cards publicas y no de la informacion proporcionada para este repositorio.

## Limitaciones y advertencias

- No es un modelo final: los checkpoints son estados intermedios de mid-training y su calidad no esta evaluada ni garantizada.
- Ausencia total de model card detallada: no hay informacion sobre licencia, idiomas, composicion del dataset ni evaluaciones de seguridad, lo que impide certificar su uso comercial.
- Riesgo de alucinacion y respuestas inseguras: al ser un modelo de 1.700 millones en mid-training, es esperable un comportamiento inferior a modelos finales alineados.
- Licencia no declarada: no se puede asumir permiso de uso comercial; hay que contactar con el autor o consultar la licencia del modelo base SmolLM2-1.7B.
- El estado del optimizador en fp32 implica un consumo de almacenamiento y memoria elevado (repositorio de 50,7 GB), poco practico para despliegue.
- Sin garantias de soporte multilingue ni de tool calling; no documentados.
- Fecha de creacion del repositorio (2026-11-22) posterior a la fecha de referencia habitual; verificar la integridad y procedencia de los artefactos antes de usarlos en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bshang17/smt-score0-hq_safety
- Modelo base SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Repositorio de SmolLM2 en GitHub: https://github.com/huggingface/smollm
