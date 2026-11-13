# nvidia/agile_wbc_unitree_h2

## Resumen

Agile WBC para Unitree H2 Plus es una política de control de cuerpo completo (whole-body control) desarrollada por NVIDIA para el robot humanoide Unitree H2 Plus. No es un modelo de lenguaje: es una red neuronal de tipo perceptrón multicapa (MLP) que actúa como API de locomoción, generando consignas de posición articular y ganancias proporcional-derivativas (PD) para las 12 articulaciones de las piernas y las dos del torso (roll y pitch), mientras deja libres el resto de articulaciones para controladores de tren superior independientes.

El paquete publicado en Hugging Face contiene tres artefactos: `agile_velocity.onnx` (la política exportada en opset 20), `agile_velocity.yaml` (configuración de despliegue) y `agile_velocity_initial_values.safetensors` (valores iniciales del estado de realimentación). Con 166.030 parámetros, el modelo está pensado para ejecutarse en tiempo real sobre hardware NVIDIA (arquitecturas Lovelace y Jetson) mediante ONNX Runtime, integrándose como componente de locomoción del flujo GR00T E2E Reference Workflow v0.2.

Su relevancia es práctica: permite a roboticistas e investigadores acoplar un controlador de tren superior (por cinemática inversa o aprendido) sobre una base locomoción estable, habilitando teleoperación de cuerpo completo y recogida de datos de loco-manipulación sin reentrenar la política base. La licencia NVIDIA Open Model permite uso comercial y no comercial a nivel global.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con activación ELU |
| Parámetros totales | 166.030 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de secuencia; consume historial de 5 pasos de realimentación) |
| Tipos de cuantización | No disponible (exportado en float32) |
| Idiomas soportados | No aplica (entradas numéricas de propiocepción, sin contenido lingüístico) |
| Licencia | NVIDIA Open Model License (uso comercial y no comercial) |
| Formato de pesos | ONNX (opset 20) + YAML de configuración + safetensors (valores iniciales) |

Otras especificaciones relevantes:

| Parámetro | Valor |
|---|---|
| Entradas | 255 valores float32 (velocidad angular del root, cuaternión del root, velocidad base, posiciones y velocidades articulares, historiales de 5 pasos, acción previa) |
| Capas ocultas | [256, 256, 128] con ELU |
| Salidas | 42 valores float32: `joint_pos` [1,14], `joint_pos_kp_gains` [1,14], `joint_pos_kd_gains` [1,14] |
| Articulaciones controladas | 14 (12 de piernas + waist roll y pitch) |
| Motor de inferencia | ONNX Runtime |
| Hardware compatible | NVIDIA Lovelace (L40, RTX 6000), NVIDIA Jetson |
| Sistema operativo | Linux (Ubuntu) |
| Versión del modelo | Velocity-H2-History-v0 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La política es una MLP de tres capas ocultas (256, 256, 128 unidades) con activación ELU que mapea 255 entradas numéricas a 42 salidas. Las entradas combinan observaciones instantáneas del robot (velocidad angular del root, cuaternión, velocidad base, posiciones y velocidades de 31 articulaciones) con historiales de cinco pasos de velocidad angular, gravedad proyectada, comandos de velocidad, posiciones y velocidades de las articulaciones controladas y acciones, más la acción previa de 14 dimensiones. Las salidas son objetivos de posición articular junto con ganancias kp y kd para cada una de las 14 articulaciones de piernas y waist. El grafo exportado devuelve además los tensores de historial y el estado de acción previa, que deben realimentarse en el siguiente paso de control.

El entrenamiento se realizó con PPO (Proximal Policy Optimization) sobre rollouts generados en línea en el simulador Isaac Lab, no sobre un conjunto de datos recopilado. La señal de recompensa proviene del propio simulador y los datos no contienen contenido lingüístico ni demostraciones humanas. La evaluación se llevó a cabo en el mismo entorno de simulación y sobre hardware físico Unitree H2 Plus. La telemetría final de entrenamiento reporta un error de velocidad XY de 0,125 m/s y un error de guiñada (yaw) de 0,313 rad/s.

## Capacidades

- Locomoción bípeda de cuerpo completo limitada a piernas y waist: genera consignas de posición y ganancias PD para 14 articulaciones.
- Seguimiento de comandos de velocidad (velocidad lineal en XY y velocidad angular de guiñada) con los errores de seguimiento indicados en la telemetría de entrenamiento.
- Realimentación de estado con historial de cinco pasos, lo que aporta estabilidad temporal frente a ruido y cambios bruscos de comando.
- Integración como API de locomoción: deja libres tren superior, manos y cabeza para controladores separados (cinemática inversa o políticas aprendidas).
- Soporte de teleoperación de cuerpo completo y recogida de datos de loco-manipulación.
- Ejecución en tiempo real sobre ONNX Runtime en GPU NVIDIA Lovelace y Jetson.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: es un controlador numérico de robot.

## Casos de uso

- Teleoperación de cuerpo completo: la política actúa como capa de locomoción mientras un operador o un controlador de tren superior dirige brazos y cabeza; el historial de cinco pasos suaviza las transiciones y mantiene la estabilidad al cambiar de dirección.
- Recogida de datos de loco-manipulación: al desacoplar piernas y waist del tren superior, se pueden grabar episodios de manipulación mientras el robot se desplaza, generando datasets para entrenar políticas de manipulación sobre una base locomotora estable.
- Integración con controladores de tren superior por cinemática inversa: el paquete YAML y los valores iniciales de safetensors preservan el mapeo de articulaciones y el estado de realimentación, de modo que un solver de IK puede publicar consignas en las articulaciones restantes sin conflicto.
- Investigación en control aprendido: sirve como referencia o baseline de locomoción para comparar nuevas políticas entrenadas en Isaac Lab sobre el mismo robot y las mismas métricas de error de velocidad.
- Despliegue en robótica de borde: al ejecutarse con ONNX Runtime sobre Jetson, la política puede correr a bordo del robot sin depender de un servidor externo, lo que reduce latencia y dependencia de red.
- Prototipado en el flujo GR00T E2E Reference Workflow v0.2: se integra como componente de locomoción dentro de un pipeline de referencia de NVIDIA, lo que facilita reproducir configuraciones y validar el resto del sistema alrededor de una base ya probada.
- Validación simulación-a-realidad: al haberse evaluado tanto en Isaac Lab como en hardware H2 Plus físico, es adecuada para equipos que necesitan un punto de partida con comportamiento conocido antes de ajustar su propio controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje. La única métrica de rendimiento reportada es la telemetría final de entrenamiento:

| Métrica | Valor |
|---|---|
| Error de velocidad XY | 0,125 m/s |
| Error de guiñada (yaw) | 0,313 rad/s |

No se han publicado datos de latencia ni de throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 166.030 parámetros en float32 el modelo ocupa aproximadamente 0,66 MB de pesos, por lo que cabe holgadamente en cualquier GPU NVIDIA moderna e incluso en memoria compartida.
- GPU recomendadas: NVIDIA L40 y RTX 6000 (Ada Lovelace) son las plataformas probadas según la model card; también se mencionan dispositivos NVIDIA Jetson para despliegue a bordo.
- Cabe en GPU de consumo: sí, cualquier GPU NVIDIA con soporte de ONNX Runtime; el cuello de botella no es la memoria sino la latencia del bucle de control en tiempo real.
- Opciones de despliegue: ONNX Runtime como motor principal (opset 20); el paquete incluye YAML de configuración y safetensors con valores iniciales del estado de realimentación.
- Latencia y throughput: no disponibles en la información proporcionada.
- Sistema operativo: Linux (Ubuntu).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de locomoción comparables para el Unitree H2 Plus ni datos de modelos alternativos de whole-body control con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ámbito restringido: solo controla 12 articulaciones de piernas y 2 de waist; no gestiona brazos, manos ni cabeza, que requieren controladores separados.
- Dependencia del orden de articulaciones y de las formas de los tensores de realimentación: alterar el mapeo o las dimensiones del historial invalida el comportamiento de la política.
- Entrenada íntegramente en simulación (Isaac Lab) con PPO; aunque se evaluó en hardware físico, no se documentan en la información disponible métricas de robustez ante perturbaciones externas, terrenos irregulares o fallos de sensores.
- Los errores de seguimiento reportados (0,125 m/s en XY y 0,313 rad/s en yaw) son telemetría de entrenamiento, no resultados de un benchmark independiente.
- No apta para tareas de lenguaje, visión, razonamiento o generación de contenido; carece de cualquier capacidad cognitiva.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí existe riesgo de comandos de control incorrectos ante entradas fuera de distribución.
- Licencia NVIDIA Open Model: permite uso comercial y no comercial, pero conviene revisar el texto completo para obligaciones de atribución y restricciones adicionales antes de desplegar en producción.
- La model card exige pruebas de validación específicas del caso de uso siguiendo la metodología V-model antes de un despliegue seguro; no debe tratarse como un componente certificado.
- No se dispone de información sobre sesgos, ya que el modelo no procesa datos humanos ni lingüísticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/agile_wbc_unitree_h2
- Repositorio AGILE WBC: https://github.com/nvidia-isaac/WBC-AGILE
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Tarjetas de transparencia incluidas en el repositorio: `overview.md`, `bias.md`, `explainability.md`, `privacy.md`, `safety.md`
- Página corporativa de NVIDIA: https://www.nvidia.com/
- Entrada de NVIDIA en Wikipedia: https://en.wikipedia.org/wiki/Nvidia
