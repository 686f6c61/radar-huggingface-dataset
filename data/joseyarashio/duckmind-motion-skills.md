# joseyarashio/duckmind-motion-skills

## Resumen

duckmind-motion-skills es una colección de siete políticas de control motor entrenadas con aprendizaje por refuerzo (PPO) para un robot cuadrúpedo de tipo Microduck, el diseño abierto de Pollen Robotics. Cada política se ha exportado a ONNX y se integra en la tabla de movimiento de duckmind, un stack de cognición no oficial para robots Microduck. Las políticas cubren habilidades como sobresalto, consuelo, giro con paso, reverencia, salto de obstáculos, huida y giro rápido en el sitio.

El modelo es relevante porque documenta de forma inusualmente transparente el proceso de entrenamiento y las puertas de validación (gates) en simulación, incluyendo qué habilidades fallan y por qué. Cinco de las políticas se afinan a partir de la política v5 `velstand` de Pollen Robotics (Apache-2.0), mientras que las dos restantes (`startle` y `comfort`) se entrenan desde cero usando el entorno `microduck_rl` de Pollen.

Es importante subrayar que ninguna de las políticas ha sido validada en hardware real. Varias fallan la puerta de esfuerzo articular y esa excepción se ha aplicado únicamente en simulador, manteniéndolas cerradas para un robot físico. El autor advierte explícitamente que no deben usarse en un robot real en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes de política PPO (perceptrón multicapa) exportadas a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de observación fija de 61 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Cada archivo es una política neuronal entrenada con PPO (rsl-rl 5.0.1) sobre mjlab 1.3.0 y MuJoCo 3.10.0, con 4.096 entornos paralelos. El modelo del robot y el código de tareas provienen de `microduck_rl` de Pollen Robotics en el commit `cb70b79`, con tareas y recompensas propias de duckmind añadidas por encima. La interfaz es homogénea: entrada `obs` de tipo `float32[1, 61]` (velocidad angular de la base, gravedad proyectada, posiciones y velocidades articulares, acciones previas y un bloque de comando de 13 números: twist 3, cabeza 4, cuerpo 6) y salida `actions` de tipo `float32[1, 14]` con objetivos de posición articular para servos XL330, a 50 Hz. El normalizador está embebido en el grafo.

Las cinco políticas derivadas de v5 se afinan con reinicios desde checkpoints concretos (por ejemplo, `bskstep` desde la iteración 660, `bskbow` desde la 935) durante 500 a 2.866 iteraciones adicionales. Las dos desde cero usan revisiones de etapa 1b: `startle` con 1.549 iteraciones y `comfort` con 1.249. La escala de acción es 0,9 para las cinco afinadas y 1,0 para `startle` y `comfort`. Las puertas de validación combinan modelo de servo simulado (MJCF plano o modelo BAM de Rhoban para el XL330) con retardos de comando de 0, 20 y 40 ms.

## Capacidades

- Control motor de habilidades discretas: sobresalto, congelación, salto atrás, temblor, estiramiento, giro con paso, marcha en el sitio, reverencia, agacharse, salto de obstáculos, huida y giro rápido.
- Ejecución a 50 Hz con comandos de twist constantes como código de habilidad.
- Cruce de umbrales y franjas de 10, 20 y 40 mm en simulación (`hopover`).
- Cruce de umbral de puerta simulado (`hopover`, 27/30 cruces, 5/30 caídas).
- Giros rápidos de 90 grados con deriva medida en simulación (`quickturn`).
- Huida recta a velocidad elevada (`panic`).
- No soporta tool calling, agentes, multilingüismo ni modalidades de texto, visión o audio: es exclusivamente un controlador motor.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: sirve como referencia reproducible de un pipeline PPO completo con gates de validación y metadatos de entrenamiento embebidos en los ONNX.
- Prototipado de stacks de cognición: duckmind carga estas políticas en su tabla de movimiento junto a las de Pollen, lo que permite probar la orquestación de habilidades sin entrenar desde cero.
- Evaluación de robustez frente a retardo de servo: las puertas con 0, 20 y 40 ms permiten estudiar la sensibilidad de cada habilidad al retardo antes de portar a hardware.
- Estudio de transferencia sim-a-real: el modelo documenta explícitamente qué habilidades fallan el gate de esfuerzo articular y por qué se cierran para robot real, útil como caso de análisis de brecha sim-real.
- Benchmarking de entornos de simulación: comparar el modelo de actuador MJCF plano frente al BAM de Rhoban en las mismas tareas.
- Docencia y divulgación: ejemplo didáctico de entrenamiento con currículo por etapas y criterios de aceptación por celda (modelo de servo × retardo).

## Benchmarks y rendimiento

Resultados de las puertas de validación en simulador (no hay benchmarks de MMLU, HumanEval ni similares porque el modelo no procesa lenguaje):

| Política | Resultado de puerta (simulador) | Detalle |
|---|---|---|
| `startle` | Movimiento pass en todas las entradas; esfuerzo articular FAIL en casi todas | Excepción en simulador; cerrada para robot real; `hop_back` pass con límites |
| `comfort` | Temblores pass a +20 ms pero FAIL a 0 ms; `stretch_tall` FAIL por esfuerzo; `stretch_sit` pass en todos los retardos | — |
| `bskstep` | Pass con límites en las tres habilidades | Celda BAM 40 ms fallada; march 19/30 |
| `bskbow` | `bow` pass (esfuerzo excedido en BAM; tope horario reducido a la mitad); `lie_low` pass con límites | — |
| `hopover` | Pass con límites | Franjas de 10/20/40 mm cruzadas 29–30 de 30, 0 caídas a 20 ms; umbral de puerta 27/30 cruzados, 5/30 caídas |
| `panic` | G1–G3, G5 y hand-off pass; G4 FAIL (0,55 frente a umbral; ×1,74 frente a ×1,6); G7 MISS (7,7 s a 0,5 m frente a ≤5 s) | Par p95 peor que v5: 0,525 frente a 0,321 N·m |
| `quickturn` | Pass con límites | Dos fallos, ambos BAM a 40 ms: deriva 5,8 cm por 90° frente a ≤5,0; giro derecho parado 9/60 caídas frente a ≤8 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; las redes son políticas pequeñas exportadas a ONNX y caben holgadamente en cualquier GPU consumer, aunque no se publica el número de parámetros.
- GPU recomendadas para entrenamiento: A100 (la mayoría de políticas) y GB10 (panic, ≈146 minutos para 1.000 iteraciones).
- Cabe en GPU consumer para inferencia: sí, por el tamaño reducido de las redes, aunque el dato exacto no está disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: frecuencia de control de 50 Hz; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Validación en hardware real | Licencia |
|---|---|---|---|---|
| duckmind-motion-skills | 7 políticas PPO ONNX para Microduck | PPO sobre mjlab/MuJoCo; 5 afinadas desde v5, 2 desde cero | No | Apache-2.0 |
| pollen-robotics/microduck-policies (v5 `velstand`) | Políticas de marcha de Pollen Robotics | Entrenamiento propio de Pollen | No disponible en la información proporcionada | Apache-2.0 (según la model card) |
| Otras políticas de locomotion cuadrúpeda open source | Varían | Varían | Varían | Varían |

No se dispone de datos de benchmarks comparativos con otras políticas de locomotion en la información proporcionada.

## Limitaciones y advertencias

- Ninguna política ha sido validada en un robot real; todos los resultados provienen de MuJoCo con servos simulados y retardos de 0–40 ms.
- Varias habilidades fallan la puerta de esfuerzo articular (`startle`, `stretch_tall` de `comfort`) y esa excepción solo se aplica en simulador; están cerradas para robot físico.
- `panic` no se ha consolidado como marcha: se usa solo para huida recta y su par p95 es peor que el de v5 (0,525 frente a 0,321 N·m).
- `comfort` falla los temblores a 0 ms de retardo, lo que indica sensibilidad al retardo de servo.
- `quickturn` y `bskstep` fallan celdas concretas con el modelo de actuador BAM a 40 ms.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingües ni de razonamiento simbólico.
- No afiliado a Pollen Robotics; "Microduck" se refiere al diseño abierto de dicha empresa.
- Licencia Apache-2.0 permite uso comercial, pero el estado de validación desaconseja cualquier despliegue físico sin una fase de hardware posterior.

## Enlaces

- Hugging Face: https://huggingface.co/joseyarashio/duckmind-motion-skills
- Repositorio duckmind: https://github.com/joseyarashio/duckmind
- mjlab: https://github.com/mujocolab/mjlab
- microduck_rl de Pollen Robotics: https://github.com/pollen-robotics/microduck_rl
- Modelo base: https://huggingface.co/pollen-robotics/microduck-policies
