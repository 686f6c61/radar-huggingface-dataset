# leapshared/sciedu_bench_props8_act_10k

## Resumen

`sciedu_bench_props8_act_10k` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), publicada por el usuario `leapshared` en Hugging Face. No es un modelo de lenguaje: es un controlador visomotor entrenado para manipular objetos en un entorno simulado de laboratorio de ciencias (`openarm_sciedu_sim`), asociado al conjunto de datos `leapshared/sciedu_bench_v2_sim_props8_all`. El repositorio ocupa 0,2 GB y contiene 51.689.104 parámetros en formato safetensors.

El modelo sigue el paradigma de aprendizaje por imitación de LeRobot: consume el estado del robot (vector de 16 dimensiones) y tres flujos de imagen RGB de 480x640 (cámara frontal `follower_d455f` y dos cámaras de muñeca), y produce un vector de acción de 16 dimensiones. ACT predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error acumulado y estabiliza el control en tareas de contacto.

Es relevante como artefacto reproducible de un *benchmark* de manipulación científica: las 30 tareas descritas abarcan desde el manejo de una varilla de carga y un electroscopio hasta el uso de un cuentagotas con ácido y la prueba de raya de minerales. Sirve como referencia para quienes entrenan políticas ACT en LeRobot 0.6.1 y quieren comparar configuraciones de entrenamiento sobre el mismo *dataset*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parámetros totales | 51.689.104 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de estado + 3 imágenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot 0.6.1 |
| Tipo de robot | `openarm_sciedu_sim` |
| Entrada de estado | `observation.state`, forma `(16,)` |
| Entrada visual | 3 cámaras RGB 480x640: `follower_d455f`, `left_wrist`, `right_wrist` |
| Salida | `action`, forma `(16,)` |
| Dataset de entrenamiento | `leapshared/sciedu_bench_v2_sim_props8_all` (2365 episodios, 1.438.051 frames, 30 FPS) |
| Pasos de entrenamiento | 10.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (estado propioceptivo y varias cámaras) a una secuencia de acciones futuras de longitud fija, en lugar de predecir una única acción por paso. Esta formulación de *action chunking* mitiga el problema de la varianza en la predicción paso a paso y permite un control más suave en tareas que requieren precisión, como depositar una placa metálica en un vaso de precipitados o aplicar ácido con un cuentagotas. La implementación utilizada es la de LeRobot, que añade un *decoder* condicionado por el estado y una cabeza de estilo CVAE para modelar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizó sobre 2365 episodios teleoperados (1.438.051 frames a 30 FPS) del *dataset* `sciedu_bench_v2_sim_props8_all`, con 10.000 pasos, batch de 32, AdamW y tasa de aprendizaje 1e-05. No se documenta en la información disponible el uso de RLHF, DPO ni fases de *fine-tuning* posteriores; es aprendizaje por imitación supervisado puro. Tampoco se especifican aumentos de datos, composición exacta por tarea ni partición de validación.

## Capacidades

- Control visomotor de un brazo robótico simulado `openarm_sciedu_sim` con 16 dimensiones de estado y acción.
- Ejecución de tareas de manipulación de precisión en un entorno de laboratorio científico: manejo de varilla de carga, electroscopio, cuentagotas, placas metálicas, minerales y placas de raya.
- Fusión de tres vistas de cámara (frontal y dos muñecas), lo que permite razonamiento espacial sobre objetos ocluidos o fuera del campo de visión frontal.
- Predicción de *action chunks*, que aporta estabilidad temporal en secuencias de contacto.
- Condicionamiento por instrucción en lenguaje natural mediante el parámetro `--task` del *rollout*, con 30 tareas enumeradas en la *model card*.
- No soporta *tool calling*, agentes multi-paso ni razonamiento simbólico: es una política de control, no un modelo generativo de texto.
- No dispone de capacidades multilingües, de visión general ni de audio.

## Casos de uso

- **Reproducción de experimentos de laboratorio simulado:** ejecutar las 30 tareas del *benchmark* `sciedu_bench_v2_sim_props8_all` con `lerobot-rollout` y comparar tasas de éxito frente a otras políticas ACT entrenadas sobre el mismo *dataset*.
- **Línea base para investigación en imitación:** usar los pesos como referencia preentrenada y hacer *fine-tuning* con `lerobot-train` sobre nuevas tareas del mismo robot, aprovechando que la configuración de entrenamiento (10k pasos, batch 32, lr 1e-05) está documentada.
- **Validación de *pipelines* de LeRobot:** servir de caso de prueba para verificar la integración de `lerobot-rollout`, la carga de safetensors y el mapeo de nombres de cámara antes de desplegar políticas propias.
- **Estudio de manipulación con múltiples cámaras:** analizar cómo contribuyen las vistas de muñeca frente a la frontal en tareas de precisión como introducir una placa en un vaso o aplicar ácido con un cuentagotas.
- **Generación de datos sintéticos de evaluación:** ejecutar la política en bucle para producir trayectorias adicionales y ampliar el *dataset* con episodios etiquetados por tarea.
- **Docencia en robótica de imitación:** ilustrar el flujo completo grabación-calibración-entrenamiento-despliegue con un modelo pequeño (51,7 M de parámetros) que cabe en cualquier GPU consumer.
- **Comparación de configuraciones de ACT:** entrenar variantes con distintos pasos, *batch size* o *learning rate* y contrastar contra este checkpoint de 10.000 pasos como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* incluye una sección de evaluación vacía con una plantilla sin rellenar y la instrucción de borrar la línea "No evaluation results", por lo que no hay tasas de éxito por tarea ni comparaciones numéricas.

## Requisitos de hardware

- **VRAM estimada:** con 51,7 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 207 MB; en fp16, unos 103 MB. El consumo real lo dominan las activaciones de las tres cámaras a 480x640, por lo que se recomienda al menos 4-6 GB de VRAM para inferencia cómoda.
- **GPU recomendadas:** cualquier GPU con 8 GB o más es suficiente. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar la política; las profesionales aportan margen para *rollouts* paralelos.
- **GPU consumer:** sí, cabe holgadamente en tarjetas de gama media como RTX 3060 o superiores. El cuello de botella probable es la captura y preprocesado de tres cámaras a 30 FPS, no el modelo.
- **Despliegue:** la vía oficial es `lerobot-rollout` con `--policy.path=leapshared/sciedu_bench_props8_act_10k` y `--strategy.type=base`. Para entrenamiento, `lerobot-train --policy.type=act`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput:** no disponibles. El *dataset* está grabado a 30 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre otros checkpoints ACT del mismo autor ni de modelos comparables con especificaciones publicadas en la información proporcionada. Como referencia cualitativa, la familia de políticas de LeRobot incluye ACT, Diffusion Policy y VQ-BeT, pero no se aportan datos numéricos de parámetros, contexto ni rendimiento que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `leapshared/sciedu_bench_props8_act_10k` | 51.689.104 | no aplica | apache-2.0 | Hugging Face |
| Otras políticas ACT de LeRobot | no disponible | no aplica | no disponible | no disponible |
| Diffusion Policy (LeRobot) | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos:** al ser una política entrenada con teleoperación humana sobre un robot y un entorno concretos, hereda los sesgos de las demostraciones (posiciones iniciales, velocidades, estrategias de agarre). No generaliza a otros robots, cámaras ni disposiciones de objetos.
- **Alucinación:** no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento (iluminación distinta, objetos movidos, oclusiones no vistas).
- **Limitaciones de contexto e idioma:** la entrada es fija (estado de 16 dimensiones y tres imágenes de 480x640); no hay ventana de contexto ampliable. El condicionamiento por lenguaje se limita a las 30 tareas enumeradas y no hay soporte multilingüe declarado.
- **Licencia:** apache-2.0 permite uso comercial y modificación, pero el *dataset* subyacente y el simulador pueden tener condiciones propias que no se detallan en la información disponible.
- **Producción:** el modelo está pensado para simulación (`openarm_sciedu_sim`). No se documenta validación en robot real, ni *sim-to-real*, ni protocolos de seguridad. No debe desplegarse en entornos físicos sin una evaluación independiente.
- **Reproducibilidad:** no se publican métricas de éxito ni partición de evaluación, por lo que no es posible verificar la calidad del checkpoint más allá de la configuración de entrenamiento declarada.
- **Mantenimiento:** el repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta; es un artefacto de investigación sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leapshared/sciedu_bench_props8_act_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/leapshared/sciedu_bench_v2_sim_props8_all
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leapshared/sciedu_bench_v2_sim_props8_all
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
