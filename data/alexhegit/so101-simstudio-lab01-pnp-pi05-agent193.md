# alexhegit/so101-simstudio-lab01-pnp-pi05-agent193

## Resumen

El modelo `alexhegit/so101-simstudio-lab01-pnp-pi05-agent193` es un ajuste fino (fine-tune) de la politica de robotica pi05, entrenado por el usuario alexhegit para una tarea concreta de pick-and-place ("coger y colocar") sobre un brazo SO-101 dentro del entorno de simulacion SimStudio (laboratorio 01). Parte de `ant0nh/pi05_pnp_425_25k`, que a su vez es un ajuste fino de `lerobot/pi05_base` sobre un conjunto real de pick-and-place con seguidor SO. Por tanto, es un modelo de vision-lenguaje-accion (VLA) de tercera generacion en la cadena de fine-tuning de la familia pi05 dentro de LeRobot.

El modelo cuenta con 4.143.404.816 parametros (aproximadamente 4,14 mil millones) en precision bfloat16, con un tamano de repositorio de 9,4 GB. Se distribuye en formato safetensors bajo licencia Apache 2.0 y se carga a traves de la clase `PI05Policy` de la libreria `lerobot`. Recibe dos flujos de camara (muneca y cenital) y produce acciones de 6 grados de libertad en espacio articular absoluto (`.pos`).

Su relevancia es acotada pero util para la comunidad de robotica: sirve como referencia reproducible de un checkpoint intermedio (paso 010000) en un pipeline de aprendizaje por imitacion, y documenta abiertamente su rendimiento real, que es bajo (12 exitos de 60 intentos en la tarea Lab01-PnP-Home20). Es util para investigacion en politicas VLA, no para produccion directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (vision-lenguaje-accion); entrenamiento restringido al experto de acciones (`train_expert_only=true`), no disponible en detalle adicional |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en bfloat16; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (modelo de robotica; no se documentan capacidades linguisticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura corresponde a pi05, el esquema de politica vision-lenguaje-accion de LeRobot. El autor indica que el ajuste se realizo con `train_expert_only=true`, es decir, entrenando unicamente el modulo experto de acciones mientras el resto del modelo permanece congelado. Tambien especifica `use_relative_actions=false`, por lo que las acciones se predicen en espacio absoluto, y `dtype=bfloat16`. La representacion de entrada combina dos camaras mapeadas como `camera_wrist` → `observation.images.wrist` y `camera_top` → `observation.images.front`, un estado de 6 grados de libertad en posicion articular absoluta y la accion objetivo, tambien de 6 dimensiones en `.pos` absoluto.

El entrenamiento se hizo sobre el dataset `alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v4-actonly-follow2`, con checkpoints hasta el paso `010000` (el publicado). La inferencia es sincrona y el modelo genera bloques de 50 acciones por llamada (`chunk` / `n_action_steps` = 50). El modelo base intermedio (`ant0nh/pi05_pnp_425_25k`) esta a su vez ajustado sobre `lerobot/pi05_base`, de modo que la cadena de aprendizaje combina una fase sobre datos reales de un seguidor SO y una segunda fase sobre datos de simulacion SimStudio. No se detalla en la informacion disponible el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de acciones motoras de 6 grados de libertad en espacio articular absoluto para un brazo SO-101, a partir de observaciones visuales y de estado.
- Percepcion visual dual: procesa simultaneamente una camara en la muneca y una camara cenital.
- Aprendizaje por imitacion: reproduce trayectorias de pick-and-place demostradas en el dataset de entrenamiento.
- Ejecucion de politicas por bloques: genera 50 acciones por inferencia (`n_action_steps=50`), lo que permite movimiento continuado sin llamada por paso.
- Integracion en el ecosistema LeRobot mediante `PI05Policy.from_pretrained`.
- Inferencia sincrona documentada por el autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general (mas alla del control), audio ni modo de pensamiento.

## Casos de uso

- Reproduccion de experimentos en robotica: cargar `PI05Policy.from_pretrained` sobre el checkpoint `010000` para replicar la curva de aprendizaje reportada y verificar la tasa de exito del 12/60 en Lab01-PnP-Home20.
- Punto de partida para fine-tuning especifico: usar este checkpoint como inicializacion para entrenar variantes de pick-and-place con correcciones de la fase de elevacion, que es donde falla el modelo (15/60 exitos).
- Evaluacion de politicas VLA en simulacion: comparar este ajuste contra `ant0nh/pi05_pnp_425_25k` y `lerobot/pi05_base` bajo el mismo protocolo de 20 intentos por configuracion.
- Analisis de agarre y prension: aprovechar la metrica de cierre (39/60) para estudiar por que el fallo se concentra tras el cierre y no en el alcance (60/60).
- Investigacion sobre transferencia sim-a-real: evaluar como se comporta un modelo entrenado sobre datos de simulacion SimStudio cuando se despliega en el hardware SO-101 real.
- Generacion de datos sinteticos de demostracion: emplear al modelo como policy de referencia para producir trayectorias etiquetadas en el entorno de simulacion y ampliar el dataset.
- Docencia y laboratorios de robotica: ejemplo completo y reproducible de pipeline LeRobot con dataset, checkpoint, metrica y codigo de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de robotica y no de un modelo de lenguaje. El autor si publica una evaluacion propia de la tarea:

| Evaluacion | Resultado |
|---|---|
| Lab01-PnP-Home20, ejecucion 1 | 4/20 |
| Lab01-PnP-Home20, ejecucion 2 | 6/20 |
| Lab01-PnP-Home20, ejecucion 3 | 2/20 |
| Total | 12/60 |
| Subtarea "reach" (alcanzar) | 60/60 |
| Subtarea "close" (cerrar pinza) | 39/60 |
| Subtarea "lift" (elevar) | 15/60 |

El autor identifica explicitamente el punto de fallo: "the hole is lift after close", es decir, el principal cuello de botella esta en la elevacion despues del cierre de la pinza.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros (4,14 B), no confirmada oficialmente: aproximadamente 8,3 GB en bfloat16/fp16, unos 16,6 GB en fp32, unos 4,2 GB en int8 y unos 2,1 GB en int4. A estas cifras hay que sumar el coste de activaciones y buffers del pipeline de vision.
- Cabe en GPU de consumo: una RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) o RTX 4070 Ti Super (16 GB) deberian alojar los pesos en bfloat16 con margen razonable. En tarjetas de 8 GB probablemente sea necesario cuantizar.
- GPU recomendadas para mayor comodidad y para fine-tuning: A100 (40/80 GB), H100 (80 GB) o L40S, dado que el repositorio ocupa 9,4 GB y el ajuste congelando solo el experto de acciones puede requerir memoria adicional para optimizador y activaciones.
- Opciones de despliegue: la via documentada es `lerobot` con `PI05Policy.from_pretrained` sobre PyTorch. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo indica que la inferencia es sincrona y que el modelo genera 50 acciones por bloque.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alexhegit/so101-simstudio-lab01-pnp-pi05-agent193` | 4,14 B | no disponible | Pick-and-place SimStudio Lab01; 12/60 exitos | apache-2.0 | HuggingFace, libreria lerobot |
| `ant0nh/pi05_pnp_425_25k` (modelo base directo) | no disponible | no disponible | Pick-and-place sobre seguidor SO real; rendimiento no disponible | no disponible | HuggingFace |
| `lerobot/pi05_base` (raiz de la cadena) | no disponible | no disponible | Politica VLA de proposito general previa al fine-tuning | no disponible | HuggingFace, libreria lerobot |
| Otras politicas de LeRobot (ACT, Diffusion Policy, SmolVLA) | no disponible | no disponible | Manipulacion por imitacion; rendimiento comparativo no disponible | no disponible | HuggingFace, libreria lerobot |

No se dispone de cifras de parametros, contexto o rendimiento de los modelos comparados dentro de la informacion proporcionada, salvo el propio modelo descrito.

## Limitaciones y advertencias

- Rendimiento bajo y documentado por el autor: 12 exitos de 60 intentos en la tarea objetivo. No es apto para uso en produccion sin un ajuste adicional sustancial.
- Fallo concentrado en una fase concreta: alcanza el objetivo el 100 por cien de las veces (60/60) y cierra la pinza el 65 por ciento (39/60), pero solo eleva correctamente el 25 por ciento (15/60). La elevacion tras el cierre es el cuello de botella reconocido.
- Alta varianza entre ejecuciones: los tres conjuntos de 20 intentos dan 4/20, 6/20 y 2/20, lo que indica inestabilidad considerable.
- Especificidad hardware y de tarea: entrenado para un brazo SO-101 con dos camaras en posiciones concretas y estado/accion de 6 grados de libertad en `.pos` absoluto. No es un modelo general de robotica.
- Dependencia de la cadena de fine-tuning: hereda las caracteristicas y posibles sesgos de `ant0nh/pi05_pnp_425_25k` y de `lerobot/pi05_base`, incluidos los de su dataset original de datos reales.
- Brecha sim-a-real: los datos de entrenamiento de esta fase provienen de SimStudio, por lo que el comportamiento en hardware real puede degradarse respecto a lo medido en simulacion.
- Idioma: no se documentan capacidades linguisticas ni idiomas soportados, por lo que no debe evaluarse como modelo de lenguaje.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos y datasets de la cadena (`ant0nh/pi05_pnp_425_25k`, `lerobot/pi05_base` y el dataset de entrenamiento) antes de un despliegue comercial.
- Riesgo de alucinacion: en el sentido clasico del termino no aplica; sin embargo, el modelo puede generar trayectorias motoras plausibles pero incorrectas sin mecanismo de autoverificacion.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar escenarios de horizonte largo.
- Repositorio sin traccion: cero descargas y cero "me gusta" en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-pi05-agent193
- Dataset de entrenamiento: https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v4-actonly-follow2
- Modelo base directo: https://huggingface.co/ant0nh/pi05_pnp_425_25k
- Modelo raiz de la cadena: https://huggingface.co/lerobot/pi05_base
- Libreria LeRobot (referenciada como `library_name: lerobot`): https://github.com/huggingface/lerobot
