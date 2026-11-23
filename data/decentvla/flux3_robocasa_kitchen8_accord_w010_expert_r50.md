# DecentVLA/flux3_robocasa_kitchen8_accord_w010_expert_r50

## Resumen

`flux3_robocasa_kitchen8_accord_w010_expert_r50` es un checkpoint de política visomotora para robótica de manipulación, desarrollado por DecentVLA. Se trata de un fine-tune completo (full fine-tune) del modelo base `black-forest-labs/flux-3-action-base`, entrenado con el framework `decent-vla` en el marco de un experimento de aprendizaje federado (la ronda 50 del servidor, `server_round_0050.pt`, es el estado agregado en fp32). El modelo resuelve el problema de control de un brazo robótico a partir de observaciones visuales en el entorno de simulación RoboCasa, concretamente en la suite de tareas de cocina `kitchen8`.

El interés de esta ficha es doble: por un lado, documenta un punto de referencia concreto (9,75 % de éxito medio sobre 400 episodios) para quien evalúe políticas VLA en RoboCasa; por otro, ilustra el flujo de trabajo de `decent-vla` con FLUX 3 Action como backbone, incluyendo configuración, logs y ficheros de evaluación. El repositorio ocupa 27,6 GB, coherente con un fine-tune completo de un modelo de difusión de gran tamaño en fp32.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni la arquitectura interna más allá de lo indicado por el nombre del modelo base (FLUX 3 Action). La licencia es la FLUX Kommunity License, que restringe el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de `black-forest-labs/flux-3-action-base`, familia FLUX 3 Action) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint distribuido es fp32) |
| Idiomas soportados | no disponible (modelo orientado a acción robótica, no a texto) |
| Licencia | FLUX Kommunity License (uso no comercial) |
| Formato de pesos | `.pt` (PyTorch, estado fp32 `server_round_0050.pt`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `black-forest-labs/flux-3-action-base`, un backbone de la familia FLUX 3 orientado a la predicción de acciones (action head) para control robótico. No se especifica en la información disponible el tipo exacto de bloque (transformer de difusión, flow matching u otra variante), el número de capas ni la dimensionalidad. El entrenamiento se realizó con el framework `decent-vla`, usando la configuración `examples/flux_robocasa_kitchen8_accord_w010_expert.yaml` y el runbook `examples/flux/README_table_arms.md`. El identificador del checkpoint (`w010`) sugiere un peso o coeficiente de 0,10 en la configuración del experimento, aunque su significado exacto no se documenta.

El proceso es federado: el artefacto publicado es la agregación de la ronda 50 (`server_round_0050.pt`), no un checkpoint local de un cliente. El repositorio incluye además el directorio `eval/` con los ficheros de resultados, `config/` con la configuración y `logs/` con los registros del entrenamiento. No se indica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; en robótica, el equivalente sería el tipo de datos de demostración (teleoperación, éxito/fracaso), que no se detalla.

## Capacidades

- Control visomotor de un brazo robótico en tareas de cocina del entorno RoboCasa (`kitchen8`): abrir y cerrar electrodomésticos, accionar grifos y manipular objetos.
- Predicción de acciones a partir de observaciones visuales, en el formato propio de FLUX 3 Action.
- Evaluación estandarizada mediante `decent-vla eval` con la configuración del experimento.
- Integración en el flujo de aprendizaje federado de `decent-vla` (agregación de rondas).
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling ni agentes multi-paso.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, visión general).

## Casos de uso

- Evaluación de referencia en RoboCasa: usar el checkpoint como línea base reproducible para medir el éxito de nuevas políticas en las ocho tareas de `kitchen8`, con el protocolo indicado (50 episodios por tarea, semilla 42).
- Investigación en aprendizaje federado para robótica: comparar el estado agregado de la ronda 50 con checkpoints de rondas anteriores o con entrenamiento centralizado, usando los logs y la configuración incluidos.
- Estudio de fine-tuning completo de backbones de acción: analizar cómo se comporta un fine-tune íntegro de FLUX 3 Action frente a variantes con adaptadores o con menos parámetros entrenables.
- Diagnóstico de tareas concretas: las tareas `OpenStandMixerHead@K10` (28/50) y `CloseToasterOvenDoor@K7` (11/50) concentran todos los éxitos, por lo que el checkpoint sirve para estudiar por qué el resto de tareas fallan sistemáticamente (0/50) y diseñar ablaciones.
- Reproducción de pipelines de evaluación remota: el README menciona `runtime/remote_policy.py`, útil para montar un servidor de política y evaluar el modelo contra el simulador RoboCasa.
- Formación y docencia: ejemplo práctico de extremo a extremo de un experimento VLA con configuración YAML, logs y resultados por tarea.

## Benchmarks y rendimiento

Resultados publicados en la model card (50 episodios por tarea, semilla 42, 400 episodios totales):

| Tarea | Éxitos |
|---|---|
| CloseFridge@K2 | 0/50 |
| TurnOnSinkFaucet@K4 | 0/50 |
| TurnOnMicrowave@K8 | 0/50 |
| PickPlaceToasterToCounter@K9 | 0/50 |
| CoffeeSetupMug@K1 | 0/50 |
| CloseBlenderLid@K5 | 0/50 |
| CloseToasterOvenDoor@K7 | 11/50 |
| OpenStandMixerHead@K10 | 28/50 |
| **Media** | **9,75 % (39/400)** |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tiene sentido aplicarlos a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El checkpoint es fp32 y el repositorio ocupa 27,6 GB, lo que da una cota inferior del orden de decenas de GB solo para los pesos; a ello hay que sumar activaciones y el coste del backbone de difusión.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del artefacto, un despliegue en fp32 requiere GPUs de centro de datos (A100 80 GB, H100) o sharding multi-GPU; no se confirma que quepa en GPUs de consumo.
- GPU de consumo: no se documenta soporte para RTX 4090 u otras; sin cuantizaciones publicadas, no es esperable que quepa en 24 GB.
- Opciones de despliegue: el flujo previsto es `decent-vla eval --config examples/flux_robocasa_kitchen8_accord_w010_expert.yaml --ckpt server_round_0050.pt`, con `runtime/remote_policy.py` para la evaluación remota contra RoboCasa. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DecentVLA/flux3_robocasa_kitchen8_accord_w010_expert_r50` | no disponible | no disponible | 9,75 % medio en `kitchen8` (39/400) | FLUX Kommunity (no comercial) | Hugging Face, 0 descargas |
| `black-forest-labs/flux-3-action-base` | no disponible | no disponible | no disponible (modelo base) | FLUX Kommunity | Hugging Face |
| Otras políticas VLA para RoboCasa (p. ej. variantes de OpenVLA, π0) | no disponible en esta ficha | no disponible | no disponible | según modelo | no disponible |

No se dispone de datos verificables de benchmarks de alternativas en la información proporcionada; la comparativa numérica queda pendiente de fuentes externas.

## Limitaciones y advertencias

- Rendimiento bajo: 9,75 % de éxito medio y seis de ocho tareas con 0/50. No es un checkpoint apto para uso en producción ni como política generalista.
- Sesgo de tarea: todos los éxitos se concentran en `OpenStandMixerHead@K10` y `CloseToasterOvenDoor@K7`; el resto de habilidades no está adquirido.
- Licencia restrictiva: FLUX Kommunity License, uso exclusivamente no comercial. Cualquier despliegue comercial requiere licencia aparte del titular de los pesos base.
- Riesgo de alucinación en el sentido de acciones incorrectas o no físicamente plausibles: no hay evaluación de seguridad ni de robustez ante cambios de iluminación, cámara u objetos.
- Dominio limitado al simulador RoboCasa `kitchen8`; no se documenta transferencia a robot real (sim-to-real).
- Sin información sobre sesgos demográficos o lingüísticos (no aplica texto), pero tampoco sobre sesgos de dataset de demostración.
- El checkpoint es un estado federado agregado (ronda 50); no se documenta su equivalencia con un modelo entrenado de forma centralizada.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DecentVLA/flux3_robocasa_kitchen8_accord_w010_expert_r50
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Licencia FLUX Kommunity: https://huggingface.co/black-forest-labs/flux-3-action-base/blob/main/LICENSE.md
