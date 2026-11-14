# Ozzey/G1-Wheel

## Resumen

G1-Wheel es un paquete de artefactos para robótica (dataset de aprendizaje por imitación, checkpoints de políticas y assets de simulación) asociado al robot humanoide Unitree G1 equipado con dos manos OYMotion ROHands. Lo publica el usuario Ozzey en Hugging Face y su propósito es resolver una tarea de manipulación bimanual: coger un volante de una mesa con la mano izquierda, pasarlo en el aire a la mano derecha y depositarlo en una cesta. No es un modelo de lenguaje, sino un conjunto de políticas de control entrenadas en Isaac Lab 2.3 / Isaac Sim 5.1.

El componente central es M4PO, una política residual que se suma sobre una política base de *behavior cloning* (BC) por *flow matching* congelada. La residual actúa sobre las 31 dimensiones completas de acción (brazos, pinzas, cintura y piernas), de modo que el modelo aprende a corregir la trayectoria imitada para aumentar la robustez. El repositorio incluye el conjunto de entrenamiento de BC con 638 436 filas estado-acción, el checkpoint de la política base, el checkpoint completo de M4PO (modelo del mundo, actor, críticos y optimizadores) y los USD del robot y de la escena.

La relevancia es doble: por un lado, ofrece un caso reproducible de manipulación bimanual con un humanoide comercial en simulación; por otro, documenta explícitamente cómo el rendimiento decae cuando disminuye el soporte pélvico (del 82,8 % con soporte del 50 % al 0 % en bipedestación libre), lo que resulta útil para quien evalúe transferencia sim-a-real. El tamaño del repositorio es de 0,5 GB y la licencia figura como "other", sin términos detallados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política residual M4PO sobre una política base de behavior cloning con flow matching; simulación en Isaac Lab 2.3 / Isaac Sim 5.1 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la observación incluye estado propio, observación del objeto de 8 valores y paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | other (términos no especificados en la información disponible) |
| Formato de pesos | PyTorch (`.pt`): `checkpoints/bc_flow_v4/flow.pt` y `checkpoints/m4po_residual/step_192000.pt`; dataset en `.npz`; assets en USD |
| Dimensión de acción | 31 dimensiones (brazos, pinzas, cintura, piernas) |
| Dimensión de observación de acción del BC | 16 dimensiones (según la descripción del dataset) |
| Hardware simulado | Unitree G1 con dos manos OYMotion ROHands |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La política se compone en dos etapas. Primero se entrena una política de *behavior cloning* por *flow matching* (`bc_flow_v4`) sobre un dataset de 638 436 filas estado-acción (`data/g1_wheel_v4.npz`), donde cada fila contiene estado propio (propriocepción), una observación del objeto de 8 valores, el índice de paso, una acción de 16 dimensiones, el episodio y la fuente. Esta política base queda congelada y actúa como referencia. Después se entrena M4PO, una residual sobre la acción completa de 31 dimensiones que corrige la salida de la base; el checkpoint completo incluye modelo del mundo, actor, críticos y estados de los optimizadores, junto con `g1w_args.json` y `config_resolved.yaml` para reproducir la configuración.

El entrenamiento se realiza íntegramente en simulación con Isaac Lab 2.3 e Isaac Sim 5.1, sobre una escena que incluye mesa, volante, cesta y suelo, más los USD del G1 y de las ROHands. La evaluación es determinista y con 64 episodios por nivel, y los niveles L2 a L5 varían el soporte pélvico: L2 con soporte completo del pelvis, L3 con soporte del 50 %, L4 con soporte del 20 % y L5 en bipedestación libre. No se especifican en la información disponible el número total de pasos de entrenamiento, la composición exacta de las fuentes del dataset ni si se emplearon técnicas adicionales como decodificación especulativa o atención lineal, que en cualquier caso no aplican a este tipo de política.

## Capacidades

- Manipulación bimanual: coger un volante de la mesa con la mano izquierda, transferirlo en el aire a la mano derecha y colocarlo en una cesta.
- Control de cuerpo completo: la residual actúa sobre 31 dimensiones que cubren brazos, pinzas, cintura y piernas, no solo sobre las manos.
- Corrección sobre imitación: M4PO mejora la política base de flow matching mediante una residual entrenada con un modelo del mundo y críticos.
- Evaluación determinista por niveles de soporte pélvico, lo que permite medir la degradación del rendimiento según la estabilidad del robot.
- Integración con Isaac Lab / Isaac Sim: los assets USD y la configuración permiten reproducir la escena y el entorno de entrenamiento.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, visión genérica, tool calling, capacidades de agente ni multilingüismo; es una política de control motor.

## Casos de uso

- Investigación en manipulación bimanual: usar el dataset y los checkpoints como línea base reproducible para estudiar transferencias de objeto entre manos en humanoides, comparando variantes de la residual M4PO.
- Estudio de robustez postural: emplear los niveles L2-L5 para analizar cómo el soporte pélvico afecta a la tasa de éxito (82,8 % en L3 frente a 0 % en L5) y diseñar controladores de equilibrio que amplíen el rango operativo.
- Aprendizaje por imitación con flow matching: reutilizar `bc_flow_v4/flow.pt` y su curva de entrenamiento (`flow.json`) como referencia para experimentos de BC generativo en robótica.
- Aprendizaje por refuerzo residual: tomar `m4po_residual/step_192000.pt` como punto de partida para probar nuevas recompensas, críticos o modelos del mundo sobre la misma tarea.
- Docencia y formación en simulación robótica: montar la escena con los USD de `assets/OYMotion/` en Isaac Sim para prácticas de entrenamiento y evaluación de políticas.
- Pruebas de integración sim-a-real: usar las tasas de éxito por nivel como referencia antes de intentar transferir la política a un G1 físico con ROHands, identificando el nivel de soporte mínimo viable.

## Benchmarks y rendimiento

Resultados de M4PO en evaluación determinista con 64 episodios por nivel, según la model card:

| Nivel | Condición | Éxito en entrenamiento | Éxito en evaluación |
|---|---|---|---|
| L2 | Flotante, soporte pélvico completo | 84,0 % | 81,3 % |
| L3 | Flotante, soporte pélvico del 50 % | 80,6 % | 82,8 % |
| L4 | Flotante, soporte pélvico del 20 % | no disponible | 40,6 % |
| L5 | Bipedestación libre | no disponible | 0 % |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones con otras políticas de manipulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,5 GB, pero no se detalla el consumo de memoria de la política ni del simulador.
- GPU recomendadas: no disponible en la información proporcionada; el entrenamiento y la evaluación requieren Isaac Sim 5.1, cuyos requisitos de GPU no se especifican en la model card.
- Viabilidad en GPU de consumo: no disponible; depende de los requisitos de Isaac Sim 5.1, no indicados.
- Opciones de despliegue: simulación en Isaac Lab 2.3 / Isaac Sim 5.1; el código se distribuye aparte en `G1-Wheel-code.zip`, que debe descomprimirse y combinarse con las carpetas de este repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Descarga: `hf download Ozzey/G1-Wheel --local-dir G1-Wheel`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de manipulación bimanual comparables ni datos de modelos alternativos con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Rendimiento muy dependiente del soporte pélvico: la tasa de éxito cae del 82,8 % (L3) al 40,6 % (L4) y al 0 % (L5), por lo que la política no es viable en bipedestación libre.
- Entrenada exclusivamente en simulación (Isaac Lab / Isaac Sim); no hay evidencia en la información disponible de transferencia a un robot físico.
- Dependencia fuerte del entorno: los resultados están ligados a la escena concreta (mesa, volante, cesta, suelo) y a los USD de `assets/OYMotion/`; cambios en la geometría o en las propiedades físicas pueden invalidar el rendimiento.
- Licencia "other" sin términos detallados: es necesario contactar con el autor o revisar el repositorio antes de cualquier uso comercial.
- Sin datos publicados sobre sesgos, alucinación o limitaciones idiomáticas, ya que no es un modelo generativo de lenguaje; esos riesgos no aplican, pero tampoco hay garantías de robustez fuera de la distribución de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y creado y actualizado el mismo día (14 de noviembre de 2026): no hay validación externa de la comunidad.
- El código no está incluido en el repositorio de pesos; hay que descargar `G1-Wheel-code.zip` por separado, lo que añade un paso de configuración y posibles problemas de compatibilidad de versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ozzey/G1-Wheel
- Código: `G1-Wheel-code.zip` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Resultados detallados: `RESULTS.md` dentro del repositorio
- Configuración de entrenamiento: `checkpoints/m4po_residual/g1w_args.json` y `config_resolved.yaml`
- Curva de entrenamiento del BC: `checkpoints/bc_flow_v4/flow.json`
- Isaac Lab: no se proporciona enlace en la información disponible
- Isaac Sim: no se proporciona enlace en la información disponible
