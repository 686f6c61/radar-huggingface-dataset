# joonyeongs/cosmos3-edge-policy-droid-privileged-phases-175-cosmos3-replay-full-ft-1k-v2

## Resumen

Cosmos3-Edge-Policy-DROID RoboLab privileged phases v2 es un ajuste fino (fine-tuning) completo del generador del modelo de politica robotica `nvidia/Cosmos3-Edge-Policy-DROID`, desarrollado por el usuario `joonyeongs` sobre la infraestructura de NVIDIA Cosmos. El modelo parte de la arquitectura Cosmos3 (familia de modelos de mundo y politicas para robotica de NVIDIA) y se entrena sobre un dataset propio de 175 episodios de exito en tareas de manipulacion, combinando arranques de fase privilegiada con replay de fases Cosmos3. El resultado es un checkpoint listo para inferencia que sustituye los tensores del transformer generador del modelo base por los tensores ajustados, conservando el resto de componentes congelados y los metadatos de politica DROID.

El modelo tiene 3.859.003.312 parametros y un repositorio de 9,2 GB en formato safetensors. Es relevante porque demuestra el flujo de trabajo de ajuste fino de politicas roboticas sobre Cosmos3 con datos escasos (175 episodios) y tecnicas de replay de fases, un patron habitual en investigacion de robotica con aprendizaje por imitacion. No es un modelo de lenguaje general: es un modelo de politica visomotora orientado a control de robots, por lo que sus capacidades se limitan a la generacion de acciones a partir de observaciones.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face y la model card del autor. Muchos campos tecnicos (contexto, cuantizacion, benchmarks, idiomas) no estan documentados y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (modelo de politica visomotora basado en transformer generador; familia Cosmos de NVIDIA) |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 segun la configuracion de entrenamiento) |
| Idiomas soportados | no disponible (modelo de politica robotica, no orientado a lenguaje natural) |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (layout y dtypes del modelo base) |
| Libreria | cosmos |
| Modelo base | nvidia/Cosmos3-Edge-Policy-DROID (revision 0110e64ca982589f1a3d856cbdd7d465dccb79bc) |
| Dataset de entrenamiento | joonyeongs/cosmos3-edge-harness-privileged-phases-175 |
| Chunk de acciones | 32 pasos |
| Dependencia externa | VAE Wan2.2 (igual que el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del generador (generator full fine-tuning) del modelo base Cosmos3-Edge-Policy-DROID. La arquitectura subyacente es la de Cosmos3, un modelo de politica visomotora de NVIDIA que genera chunks de 32 acciones a partir de observaciones, con metadatos de politica DROID y un VAE Wan2.2 como componente de codificacion visual. El ajuste fino reemplaza los tensores del transformer generador por los tensores entrenados, manteniendo congelados los demas componentes y conservando el layout de shards y dtypes del modelo base.

El entrenamiento se realizo sobre 175 episodios exitosos del dataset `cosmos3-edge-harness-privileged-phases-175`, que anade 25 episodios de Cartons a una exportacion anterior de 150 episodios. El muestreo combina 38.508 arranques de fase privilegiada (4 tareas) con 28.588 arranques de replay (6 tareas), en proporcion 4:1 privilegiado:replay. Se ejecutaron 1.000 updates con batch global de 64 (2 GPUs x 32), learning rate 2e-5 con warmup de 50 pasos y decaimiento lineal, optimizador FusedAdam con weight decay 0.05, precision BF16 y FSDP de 2 vias. El checkpoint final es `iter_000001000`, completado el 15 de noviembre de 2026 en un job Slurm (ID 333998).

## Capacidades

- Generacion de acciones roboticas: produce chunks de 32 acciones para control de politicas DROID en tareas de manipulacion.
- Aprendizaje por imitacion: entrenado sobre episodios de exito, orientado a reproducir comportamientos de manipulacion.
- Replay de fases: incorpora datos de replay de fases Cosmos3 para mejorar la cobertura de estados.
- Integracion con RoboLab: disenado para el entorno de evaluacion y servicio RoboLab.
- Servicio de inferencia: incluye script `action_policy_server_robolab` para desplegar el modelo como servidor de politica.
- Soporte de tool calling / function calling: no disponible (no aplicable a un modelo de politica).
- Soporte de agentes y multi-step reasoning: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible (no orientado a lenguaje natural).
- Capacidades especiales: modo thinking, vision o audio no documentados; la vision se usa como entrada de observacion para la politica.

## Casos de uso

- Control de robots manipuladores en tareas DROID: el modelo genera chunks de 32 acciones a partir de observaciones, adecuado para politicas de manipulacion en entornos de laboratorio con el conjunto de tareas DROID.
- Investigacion en aprendizaje por imitacion con datos escasos: sirve como referencia de ajuste fino de Cosmos3 con solo 175 episodios, util para estudiar tecnicas de replay de fases y proporcion de datos privilegiados.
- Evaluacion en RoboLab: el script de servicio permite desplegar el modelo en el entorno RoboLab para experimentos de politica en bucle cerrado.
- Reproduccion de experimentos: el repositorio incluye `robolab_finetune.json` con procedencia y hashes de tensores, lo que facilita la verificacion y reproduccion del ajuste fino.
- Base para ajustes finos posteriores: al conservar el layout del modelo base, puede servir como punto de partida para nuevos fine-tunings sobre otras tareas o datasets.
- Prototipado de pipelines de politica robotica: la integracion con el servidor de inferencia y el VAE Wan2.2 permite montar un pipeline completo de observacion a accion para pruebas de concepto.
- Estudio de tecnicas de replay: la combinacion 4:1 de arranques privilegiados y replay es un caso concreto para analizar el efecto del replay en politicas visomotoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el exito de politica en bucle cerrado y el comportamiento de inferencia no han sido evaluados para esta exportacion; solo se verificaron los mapeos de tensores, formas, layout de shards, dtypes y hashes SHA-256 del transformer exportado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.859.003.312 parametros en BF16, el peso de los tensores ronda los 7,7 GB; a esto hay que sumar el VAE Wan2.2 y las activaciones, por lo que se recomienda al menos 16-24 GB de VRAM para una ejecucion holgada, aunque esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento uso 2 GPUs con FSDP de 2 vias, lo que sugiere GPUs de clase A100 o H100 para entrenamiento; para inferencia no se especifica.
- Cabe en consumer GPU: probablemente en GPUs consumer de gama alta con 16 GB o mas (por ejemplo RTX 4090), pero no esta confirmado por el autor.
- Opciones de despliegue: servidor propio del framework Cosmos mediante `python -m cosmos_framework.scripts.action_policy_server_robolab` con `--checkpoint-path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (joonyeongs/cosmos3-edge-policy-droid-privileged-phases-175-cosmos3-replay-full-ft-1k-v2) | 3.859.003.312 | no disponible | sin benchmarks publicados | OpenMDW-1.1 | Hugging Face, 0 descargas |
| nvidia/Cosmos3-Edge-Policy-DROID (modelo base) | no disponible en la informacion | no disponible | no disponible | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| Otros ajustes finos de Cosmos3-Edge-Policy-DROID | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria (otros modelos de politica robotica como RT-2, OpenVLA o pi0) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Sin evaluacion en bucle cerrado: el autor indica que el exito de politica y el comportamiento de inferencia no han sido evaluados para esta exportacion; solo se verifico la integridad de los tensores.
- Dataset pequeno: 175 episodios de exito, lo que limita la generalizacion a tareas y entornos no representados en el dataset.
- Sesgo de datos: al entrenarse solo sobre episodios exitosos y tareas concretas (4 tareas privilegiadas, 6 de replay), el modelo puede no manejar estados de fallo o variaciones no vistas.
- Dependencia del modelo base y del VAE Wan2.2: requiere componentes externos y metadatos de politica DROID, lo que complica el despliegue independiente.
- Licencia OpenMDW-1.1: heredada del modelo base; es una licencia de modelo abierto con terminos especificos que deben revisarse antes de uso comercial.
- Idiomas y contexto: no documentados; no es un modelo de lenguaje, por lo que no debe usarse para tareas de NLP.
- Riesgo de alucinacion: no aplicable en el sentido de NLP, pero existe riesgo de generar acciones incorrectas en estados fuera de distribucion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa.
- Fecha de creacion futura (2026-11-15) en los metadatos: conviene verificar la procedencia antes de confiar en el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-privileged-phases-175-cosmos3-replay-full-ft-1k-v2
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-harness-privileged-phases-175
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
