# chugangyi/elastra-host-residual

## Resumen

Elastra HoST residual es una política residual de aprendizaje por refuerzo disenada para permitir que el controlador de levantamiento HoST del humanoide Unitree G1 se ponga de pie sobre superficies deformables como colchones y camas elasticas. El modelo ha sido desarrollado por chugangyi y entrenado en Elastra, un marco de simulacion MuJoCo de soportes elasticos descrito en el articulo arXiv:2611.15112. No es un modelo de lenguaje ni un modelo generativo de proposito general: es un checkpoint de politica neuronal para control robotic.

La politica no sustituye a HoST, sino que lo complementa. HoST, preentrenado sobre suelo rigido, permanece congelado, y en cada paso de control (50 Hz) la politica residual lee el estado del robot, la accion de HoST y el tipo de superficie, y anade una correccion acotada a la accion. La correccion maxima es de 1,32 unidades de accion de HoST, equivalentes a 0,33 rad por articulacion dado que una unidad desplaza el objetivo del controlador PD en 0,25 rad.

El interes del modelo reside en su enfoque de aprendizaje residual sobre un controlador congelado y en su evaluacion sistematica sobre un espectro de rigideces de superficie. Sobre 960 ensayos simulados, la politica eleva la tasa de exito del 44,1 % (HoST solo) al 72,5 % (HoST mas residual), con mejoras especialmente marcadas en colchones de rigidez intermedia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (actor-critic) con capas de 92, 256, 128 y 23 unidades, activaciones tanh y log_std independiente del estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observacion de 92 entradas por paso) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en coma flotante) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, diccionario de tensores y numeros, cargable con `torch.load(path, weights_only=True)`) |

## Arquitectura y entrenamiento

La politica es una red neuronal de tipo perceptron multicapa que actua como actor-critic. El actor recibe un vector de observacion de 92 dimensiones y produce 23 acciones (una por articulacion del Unitree G1), mientras que el critico comparte las capas ocultas para estimar el valor. La accion final se calcula como `delta = 1,32 * tanh(mu(obs))`, donde `mu` es la media de la politica; en tiempo de prueba se usa la media, no una muestra estocastica. La observacion incluye posiciones y velocidades articulares, orientacion y velocidad angular de la base, la accion de HoST, altura y verticalidad del torso y de la pelvis, codificacion one-hot del tipo de superficie (colchon, cama elastica, suelo rigido), rigidez de la superficie, deflexion maxima, posicion y velocidad del robot en el area de tarea, distancias a los limites y progreso del ensayo.

El entrenamiento emplea PPO con 1000 actualizaciones, 256 entornos y 64 pasos de control por actualizacion, ejecutado en 48 nucleos de CPU durante 5,7 horas. Las actualizaciones 1 a 500 usan suelo rigido, colchones con rigidez alpha de 8, 16, 32 y 64 y camas elasticas con alpha de 1 y 2, sin observar la posicion del robot. A partir de la actualizacion 501, los colchones de alpha 16, 32 y 64 se sustituyen por alpha 1, 2 y 4, y se anaden las entradas de posicion del robot con pesos inicializados a cero. Se usan 32 estados iniciales de entrenamiento (16 pronos y 16 supinos) generados con el protocolo de perturbacion de HoST, ninguno de ellos estado de prueba. La politica publicada corresponde a la ultima actualizacion.

## Capacidades

- Control de levantamiento del humanoide Unitree G1 sobre superficies deformables (colchones y camas elasticas) en simulacion MuJoCo.
- Correccion acotada de las acciones de un controlador HoST congelado, con un limite de 0,33 rad por articulacion.
- Percepcion del tipo de superficie y de su rigidez mediante entradas explicitas en la observacion (one-hot y log2(alpha)/6).
- Adaptacion a un rango de rigideces de superficie, desde suelo rigido hasta colchones con alpha = 1 (el mas blando).
- Operacion a 50 Hz de frecuencia de control.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Investigacion en aprendizaje por refuerzo residual: la politica sirve como caso de estudio de como una correccion acotada sobre un controlador congelado mejora el rendimiento sin reentrenar la base, util para experimentos de composicion de politicas.
- Simulacion de robots humanoides en entornos blandos: permite evaluar estrategias de levantamiento sobre colchones y camas elasticas en MuJoCo antes de trasladar el diseno a hardware real.
- Benchmark de robustez frente a superficies: el conjunto de resultados por rigidez (alpha de 1 a 64) proporciona una referencia cuantitativa para comparar nuevos controladores de levantamiento.
- Desarrollo de marcos de simulacion de cuerpos elasticos: el modelo se integra en Elastra y sirve para validar el propio simulador y su protocolo de evaluacion.
- Docencia y divulgacion en robotica: el checkpoint y el codigo asociado permiten reproducir el experimento completo con comandos documentados.
- Base para futuras politicas residuales: la arquitectura y el esquema de observacion pueden reutilizarse para otros controladores base o para otras tareas de locomocion sobre suelos deformables.

## Benchmarks y rendimiento

Resultados de evaluacion simulada del articulo, con 96 estados iniciales de prueba por superficie (48 pronos y 48 supinos). Un ensayo se considera exitoso si el robot se mantiene de pie 1 s sin salir del area de tarea (pelvis a al menos 0,7 m sobre la superficie y eje z de la pelvis con componente z mundial de al menos 0,9). Alpha escala la rigidez de la superficie; a menor alpha, mas blanda.

| Superficie | HoST | HoST + residual |
|---|---:|---:|
| Suelo rigido | 96 | 96 |
| Colchon, alpha = 64 | 91 | 95 |
| Colchon, alpha = 32 | 51 | 96 |
| Colchon, alpha = 16 | 51 | 96 |
| Colchon, alpha = 8 | 24 | 90 |
| Colchon, alpha = 4 | 6 | 43 |
| Colchon, alpha = 2 | 3 | 10 |
| Colchon, alpha = 1 (el mas blando) | 0 | 1 |
| Cama elastica, alpha = 1 | 53 | 85 |
| Cama elastica, alpha = 2 | 48 | 84 |
| **Total, 960 ensayos** | **423 (44,1 %)** | **696 (72,5 %)** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint es un MLP pequeno (capas de 92, 256, 128 y 23 unidades), por lo que la huella de memoria es minima y cabe en cualquier GPU con unos pocos cientos de MB, o incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con PyTorch es suficiente para la inferencia de la politica. El coste computacional dominante es la simulacion MuJoCo, no la red.
- Cabe en GPU de consumo: si, dada la reducida dimension de la red.
- Opciones de despliegue: el codigo de Elastra (repositorio github.com/yichg/elastra) con `uv`, descarga de assets mediante `elastra-download-assets` y evaluacion con `elastra-evaluate controller=host policy=hf/host/host_residual.pt`.
- Latencia y throughput: no disponibles; el entrenamiento se realizo en 48 nucleos de CPU durante 5,7 horas para 1000 actualizaciones PPO con 256 entornos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Elastra HoST residual | Politica residual RL (MLP) | no disponible | 92 entradas, 23 acciones, 50 Hz | 72,5 % de exito en 960 ensayos | MIT | Hugging Face |
| ProtoMotions residual policy (chugangyi/elastra-protomotions-residual) | Politica residual RL | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| HoST (controlador base) | Politica de levantamiento preentrenada | no disponible | no disponible | 44,1 % de exito en 960 ensayos (sin residual) | no indicada por los autores de HoST | Distribuida via `elastra-download-assets` |

No se dispone de datos publicados de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Todos los resultados son en simulacion; la politica no se ha ejecutado en un robot real.
- Requiere las politicas prona y supina de HoST, que los autores de HoST publicaron sin licencia declarada; `elastra-download-assets` las descarga.
- Las superficies evaluadas son planas y uniformes; no se cubren terrenos irregulares ni superficies no homogeneas.
- El rendimiento decae drasticamente en las superficies mas blandas: con alpha = 1 en colchon solo 1 de 96 ensayos tiene exito, y con alpha = 2, 10 de 96.
- La correccion esta acotada a 0,33 rad por articulacion, lo que limita la capacidad de recuperacion en situaciones que requieran desviaciones mayores.
- No es un modelo de lenguaje: no tiene sesgos linguisticos, riesgo de alucinacion textual ni capacidades de generacion, pero tampoco puede usarse para tareas de NLP.
- La licencia MIT cubre el checkpoint, pero el modelo del robot y HoST conservan sus propias licencias, listadas en `THIRD_PARTY.md` del repositorio de codigo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/chugangyi/elastra-host-residual
- Articulo: https://arxiv.org/abs/2611.15112
- Codigo: https://github.com/yichg/elastra
- Modelo complementario (ProtoMotions residual): https://huggingface.co/chugangyi/elastra-protomotions-residual
