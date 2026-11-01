# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-stack-cube-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot source es un fine-tune de robótica derivado del modelo VLA (vision-language-action) π0.5, adaptado por el autor Donghyun1228 sobre la base SNUMPR VLA (`snumpr-iclr27-v1/9999`). El modelo está entrenado específicamente para la tarea de manipulación `stack_cube` (apilar un cubo) a partir de una única demostración (`demonstration_0`, yaw 0), siguiendo la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart`. Forma parte de un par de fine-tunes one-shot que posteriormente se fusionan en un modelo mayor publicado por el mismo autor.

Se trata de un artefacto de investigación con un alcance muy acotado: un único checkpoint de 1.000 actualizaciones de imitation learning, sin evaluación en robot físico todavía. No es un modelo de propósito general ni un modelo de lenguaje: es una política visomotora que mapea observaciones (imágenes de cámara, presumiblemente con estado del robot) a acciones de control, dentro del ecosistema openpi.

Su relevancia es metodológica más que de producto: documenta un experimento reproducible de adaptación one-shot de un VLA a una tarea concreta, con hiperparámetros explícitos (batch 64, LR constante 5e-5, AdamW clip 1.0, seed 42) y trazabilidad de commits de código y receta. El repositorio ocupa 12,4 GB, coherente con pesos en FP32 de un modelo de escala VLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5 (openpi); detalles internos no disponibles |
| Parametros totales | no disponible (repo de 12,4 GB en FP32) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible (modelo orientado a control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en FP32 (formato openpi/JAX, presumiblemente) y `assets` con normalización original |

## Arquitectura y entrenamiento

El modelo parte de `snumpr-iclr27-v1/9999`, la versión inicial del VLA SNUMPR, y se ajusta con el preset `pi05_snumpr_dart_oneshot_source_stack_cube` sobre la única demostración disponible de la tarea `stack_cube` en vista fuente (yaw 0, sin transformación de yaw). El entrenamiento es exclusivamente de imitation learning (IL), sin indicios de RLHF ni DPO, con 1.000 actualizaciones, batch de 64, tasa de aprendizaje constante de 5e-5, sin warmup, sin EMA y con todos los pesos entrenables. Se usa AdamW con clipping de gradiente de 1.0 y semilla 42.

La receta es la oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), ejecutada con el código `Donghyun1228/vla_adaptation` (commit `248126e`). El checkpoint publicado corresponde al paso 999 e incluye los parámetros y los assets de normalización original (SHA `f549619e…`), pero no el estado del optimizador (`train_state`), por lo que no es directamente reanudable para continuar el entrenamiento. La innovación técnica declarada es el propio esquema de adaptación one-shot: ajustar un VLA a una tarea nueva con una sola demostración y un presupuesto de cómputo reducido (1.000 pasos).

## Capacidades

- Control robótico visomotor para la tarea concreta `stack_cube` (apilado de un cubo) en la vista fuente.
- Política de imitación entrenada sobre una única demostración; no se declara generalización a otras tareas.
- Entrada multimodal: observaciones visuales (cámaras) y, presumiblemente, estado del robot, según el pipeline `robotics` y el ecosistema openpi.
- Salida de acciones de control de robot (no generación de texto libre).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión general, audio: no documentados para este fine-tune.

## Casos de uso

- Reproducción de experimentos de adaptación one-shot: sirve como referencia exacta (hiperparámetros, seed, commits) para replicar el ajuste de un VLA a una tarea con una sola demostración y comparar resultados.
- Investigación en imitation learning con datos escasos: permite estudiar cómo se comporta π0.5 cuando solo dispone de `demonstration_0` y 1.000 pasos de entrenamiento, aislando el efecto del régimen one-shot.
- Base para fusiones de modelos (model merging): es uno de los dos fine-tunes que se combinan en el modelo `...large-view-yaw30-alpha0p8-stack-cube...`, por lo que se usa como componente de un pipeline de merge con pesos controlados.
- Punto de partida para fine-tunes adicionales: al publicarse los parámetros del paso 999, puede inicializar nuevos ajustes sobre la misma tarea u otras variantes de vista, aunque sin estado del optimizador.
- Evaluación comparativa de vistas y transformaciones: al ejecutarse en vista fuente sin yaw, sirve de contraste frente al fine-tune complementario con vista ampliada y yaw 30.
- Docencia y formación en robótica con VLAs: ejemplo compacto y trazable de cómo se estructura un checkpoint openpi (params + assets + metadatos de run) para explicar el ciclo completo de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se ha ejecutado ninguna evaluación en robot ("No robot evaluation has been run yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo de 12,4 GB en FP32 sugiere que los pesos solos rondan esa cifra, por lo que la inferencia en FP32 requeriría del orden de 12-16 GB de memoria, sin contar activaciones ni buffers del runtime.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño, cabría esperar GPUs de datacenter (A100, H100) o consumer de gama alta (RTX 4090, 24 GB), pero no está confirmado.
- ¿Cabe en consumer GPU?: probablemente en GPUs con 24 GB o más en FP32, aunque no se documenta; no hay datos para GPUs de 8-16 GB.
- Opciones de despliegue: ecosistema openpi (JAX); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART one-shot source (este) | no disponible | no disponible | `stack_cube`, vista fuente, one-shot | Apache 2.0 | HuggingFace (0 descargas) |
| π0.5 SNUMPR DART one-shot large-view yaw30 alpha0.8 | no disponible | no disponible | `stack_cube`, vista ampliada, merge de dos fine-tunes | Apache 2.0 | HuggingFace (mismo autor) |
| π0.5 base / openpi | no disponible | no disponible | VLA de propósito general | no disponible en esta ficha | openpi (referencia del ecosistema) |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas; la comparación se limita a tarea, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de alcance muy restringido: entrenado solo para `stack_cube` en vista fuente; no debe esperarse generalización a otras tareas ni a otras vistas sin reentrenamiento.
- Sin evaluación en robot: el autor declara explícitamente que no se ha ejecutado ninguna prueba física, por lo que el rendimiento real es desconocido.
- Entrenado con una única demostración: alta probabilidad de sobreajuste y de baja robustez ante variaciones de iluminación, posición de objetos o del propio robot.
- No incluye `train_state`: no es posible reanudar el entrenamiento exactamente desde el paso 999; solo sirve como inicialización.
- Pesos en FP32 sin cuantizaciones publicadas: el despliegue en hardware limitado requiere convertir y validar por cuenta propia.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento, con implicaciones de seguridad física en un robot real.
- Sesgos: no documentados; al derivar de un VLA base, podría heredar sesgos de sus datos de preentrenamiento, no descritos en esta ficha.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero la idoneidad para producción es dudosa dado el estado experimental y la ausencia de evaluación.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-stack-cube-20261030
- Modelo fusionado (large-view yaw30 alpha0.8): https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-stack-cube-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `248126e`)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), preset `pi05_libero_oneshotft`
- Checkpoint de inicialización: `snumpr-iclr27-v1/9999`
- Ecosistema openpi: no se proporciona URL en la información disponible
- Paper de π0.5: no disponible en la información proporcionada
