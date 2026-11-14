# chugangyi/elastra-protomotions-residual

## Resumen

Elastra ProtoMotions residual es una política residual de aprendizaje por refuerzo diseñada para complementar el rastreador de movimiento ProtoMotions de NVIDIA sobre el humanoide Unitree G1. El modelo resuelve un problema concreto: permitir que el robot se levante desde posturas caídas sobre superficies deformables (colchones y camas elásticas) que el rastreador original nunca vio durante su entrenamiento, ya que este último fue entrenado únicamente sobre suelo rígido y permanece congelado. La política residual añade una corrección acotada a las consignas articulares del rastreador en cada paso de control, sin modificar sus pesos.

El modelo lo desarrolla chugangyi (Chugang Yi), coautor del artículo Elastra, un marco de simulación MuJoCo para cuerpos elásticos. Se publica como checkpoint de PyTorch con una arquitectura MLP de 98 entradas, capas ocultas de 256 y 128 unidades, y 29 salidas, con activaciones tanh. La relevancia actual radica en que aborda el control de humanoides sobre terrenos deformables, un escenario poco explorado en la literatura de locomotion y get-up, y lo hace con un coste de entrenamiento reducido (500 actualizaciones PPO en 3,4 horas sobre 32 núcleos de CPU).

No es un modelo de lenguaje ni un modelo fundacional multimodal: es un artefacto de robótica (pipeline `robotics`) que debe ejecutarse junto al código de Elastra, el rastreador ProtoMotions y las secuencias de referencia del dataset BONES-SEED. Su licencia es MIT, aunque las dependencias (ProtoMotions, modelo del robot y movimientos BONES-SEED) conservan sus propias licencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (actor-critic) sobre política residual; actor 98-256-128-29 con activaciones tanh |
| Parámetros totales | no disponible (checkpoint de tensores y números; no se publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de un paso, 50 Hz) |
| Tipos de cuantización | no disponible (checkpoint PyTorch en coma flotante; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoint PyTorch cargable con `torch.load(..., weights_only=True)`); configuración en `config.json` |

## Arquitectura y entrenamiento

La política es una red neuronal de tipo MLP que actúa como controlador residual. El actor tiene capas de 98, 256, 128 y 29 unidades con activaciones tanh y una `log_std` independiente del estado; el crítico comparte las mismas capas ocultas. La observación de 98 dimensiones se compone de posiciones articulares (29), velocidades articulares escaladas por 0,1 (29), cuaternión de orientación de la base (4), velocidad angular de la base escalada por 0,25 (3), consignas articulares del rastreador (29), altura del torso, verticalidad del torso y altura de la pelvis (3), y progreso del episodio (1). La corrección aplicada es `delta = 0,85 * tanh(mu(obs))` en radianes por articulación, sumada a las consignas del rastreador congelado y enviada al controlador PD. En evaluación se usa la media `mu`. La política no observa la superficie ni la posición del robot.

El entrenamiento se realizó con PPO en Elastra (simulación MuJoCo de soportes elásticos): 500 actualizaciones con 256 entornos y 64 pasos de control por actualización, sobre 32 núcleos de CPU durante 3,4 horas, con semilla 287121. Las superficies de entrenamiento incluyen suelo rígido, colchones con α = 8, 16, 32 y 64, y camas elásticas con α = 1 y 2. Se usaron 39 estados iniciales de entrenamiento (posturas tumbadas del pool HumanUP), ninguno de ellos estado de test. Se guardó un checkpoint cada 10 actualizaciones y se libera la actualización 260, la de mayor tasa de éxito en los episodios de entrenamiento de las 50 actualizaciones previas. Las referencias de movimiento son tres clips de get-up del dataset BONES-SEED.

## Capacidades

- Control de get-up (levantarse) del humanoide Unitree G1 desde posturas caídas no vistas en entrenamiento.
- Adaptación a superficies deformables: colchones con distintos niveles de rigidez (α de 1 a 64) y camas elásticas (α = 1 y 2).
- Corrección acotada de consignas articulares (±0,85 rad por articulación) sobre un rastreador congelado, sin reentrenar este último.
- Ejecución a 50 Hz en bucle cerrado con el controlador PD del rastreador.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: es una política de control motor.
- No dispone de modo de pensamiento, visión, audio ni generación de texto.

## Casos de uso

- Investigación en locomotion de humanoides sobre terrenos deformables: permite evaluar cómo un rastreador entrenado en suelo rígido se adapta a colchones y camas elásticas mediante una política residual ligera, sin reentrenar el rastreador base.
- Estudio de recuperación tras caídas (get-up): sirve como banco de pruebas para medir tasas de éxito de levantamiento desde 40 estados iniciales de caída pasiva por superficie, con una métrica objetiva (pelvis a ≥ 0,7 m y eje z de la pelvis con componente world-z ≥ 0,9 durante 1 s).
- Baseline para comparación de políticas residuales: al publicarse junto a la política residual HoST del mismo autor, permite comparar dos enfoques de corrección sobre el mismo rastreador y conjunto de superficies.
- Desarrollo de controladores jerárquicos: el esquema rastreador congelado más residual acotada es un patrón reutilizable para añadir adaptación a un controlador existente sin tocar sus pesos.
- Validación de frameworks de simulación de cuerpos elásticos: el checkpoint y los scripts de Elastra permiten reproducir los resultados del artículo sobre el modelo MuJoCo de soportes elásticos.
- Docencia y experimentación en RL aplicado a robótica: el coste de entrenamiento (3,4 h en 32 núcleos de CPU, 500 actualizaciones PPO) lo hace asequible para laboratorios con recursos limitados.
- Pruebas de robustez de pipelines de despliegue sim-a-real: aunque no se ha ejecutado en robot real, el artefacto sirve para ensayar la integración entre rastreador, política residual y controlador PD antes de un eventual traslado a hardware.

## Benchmarks y rendimiento

Evaluación simulada del artículo con 40 estados iniciales de test por superficie (caídas pasivas con motores apagados desde una postura de pie perturbada, ninguno usado en entrenamiento). Éxito = el robot se mantiene de pie 1 s sin salir del área de la tarea. Se indica el número de éxitos sobre 40.

| Superficie | ProtoMotions | ProtoMotions + residual |
|---|---:|---:|
| Suelo rígido | 17 | 29 |
| Colchón, α = 64 | 16 | 26 |
| Colchón, α = 32 | 15 | 25 |
| Colchón, α = 16 | 7 | 24 |
| Colchón, α = 8 | 9 | 22 |
| Colchón, α = 4 | 1 | 7 |
| Colchón, α = 2 | 1 | 1 |
| Colchón, α = 1 (el más blando) | 0 | 1 |
| Cama elástica, α = 1 | 4 | 21 |
| Cama elástica, α = 2 | 6 | 24 |
| **Total 400 ensayos** | **76 (19,0 %)** | **180 (45,0 %)** |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el actor es un MLP de 98-256-128-29, por lo que su huella en memoria es muy reducida (del orden de cientos de kilobytes en coma flotante de 32 bits), pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible; el artículo reporta entrenamiento en CPU (32 núcleos), y la inferencia se ejecuta dentro del bucle de simulación MuJoCo de Elastra.
- ¿Cabe en GPU de consumo? Sí, por el tamaño del MLP; no se especifica una GPU mínima ni se han publicado pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: ejecución mediante el código de Elastra (`uv run elastra-evaluate controller=protomotions policy=...`), con PyTorch y MuJoCo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponible; el control opera a 50 Hz dentro de la simulación, pero no se publican cifras de latencia por paso ni de rendimiento en tiempo real.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Superficies | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Elastra ProtoMotions residual (este) | Política residual RL sobre rastreador congelado | Unitree G1 en MuJoCo (Elastra) | Rígido, colchones α 1-64, camas elásticas α 1-2 | MIT | Hugging Face + código Elastra |
| Elastra HoST residual | Política residual RL sobre rastreador HoST | Unitree G1 en MuJoCo (Elastra) | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face (`chugangyi/elastra-host-residual`) |
| ProtoMotions (rastreador base, sin residual) | Rastreador de movimiento | Unitree G1 en simulación | Solo suelo rígido en entrenamiento | No disponible (licencia propia de NVIDIA) | Repositorio de NVIDIA |

No se dispone de datos de benchmarks de HoST residual ni de otros modelos comparables en la información proporcionada, por lo que la comparación cuantitativa se limita a la tabla de resultados frente al rastreador base.

## Limitaciones y advertencias

- Todos los resultados son en simulación; la política no se ha ejecutado en un robot real.
- Requiere el rastreador ProtoMotions y las secuencias de referencia de BONES-SEED; `elastra-download-assets` descarga ambos, y el acceso a BONES-SEED exige una cuenta de Hugging Face que haya aceptado su licencia.
- Las superficies evaluadas son planas y uniformes; no se cubren terrenos inclinados, irregulares ni obstáculos.
- La política no observa la superficie ni la posición del robot, lo que limita su adaptación a cambios no reflejados en el estado articular y de la base.
- La corrección está acotada a ±0,85 rad por articulación; escenarios que requieran desviaciones mayores quedan fuera de su rango de actuación.
- Rendimiento bajo en las superficies más blandas: 1/40 en colchón α = 1 y 7/40 en colchón α = 4, frente a 24/40 en colchón α = 16.
- Riesgo de sobreajuste a los 39 estados iniciales de entrenamiento y a las tres secuencias de get-up de BONES-SEED; no se documenta evaluación de sesgos más allá de la exclusión de estados de test.
- La licencia MIT cubre este checkpoint, pero ProtoMotions, el modelo del robot y los movimientos BONES-SEED mantienen sus propias licencias (listadas en `THIRD_PARTY.md` del repositorio de código); verificar compatibilidad antes de uso comercial.
- Repositorio de 0,0 GB y sin descargas ni likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chugangyi/elastra-protomotions-residual
- Modelo complementario (HoST residual): https://huggingface.co/chugangyi/elastra-host-residual
- Artículo (arXiv): https://arxiv.org/abs/2611.15112
- Código de Elastra: https://github.com/yichg/elastra
- Dataset BONES-SEED: https://huggingface.co/datasets/bones-studio/seed
- Licencia del dataset BONES-SEED: https://bones.studio/info/seed-license
- Bones Studio: https://bones.studio
