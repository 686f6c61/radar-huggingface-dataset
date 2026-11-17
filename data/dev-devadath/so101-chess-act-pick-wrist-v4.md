# Dev-devadath/so101-chess-act-pick-wrist-v4

## Resumen

so101-chess-act-pick-wrist-v4 es una política robótica de manipulación entrenada con ACT (Action Chunking with Transformers) sobre el ecosistema LeRobot. La desarrolla el usuario Dev-devadath como parte de un proyecto personal de ajedrez robótico con el brazo SO-101, y resuelve una tarea muy concreta: coger una pieza de ajedrez desde una posición de espera predefinida (hover a 8 cm sobre la pieza, pinzas abiertas) y ejecutar la secuencia descender, agarrar y elevar. No es un modelo de lenguaje ni un modelo de propósito general: es un checkpoint de control motor para un robot de sobremesa.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que refleja que se trata de una red compacta de política visual-motora, no de un transformer de gran escala. La entrada es una cámara de muñeca más un estado articular de 6 dimensiones; la salida son objetivos articulares en forma de chunks de 100 pasos. Está afinado desde una versión anterior (v3) sobre 247 episodios del dataset `Dev-devadath/so101_pick3_wrist_v4`, con 30.000 pasos de entrenamiento y una tasa de aprendizaje de 1e-5.

Su relevancia es la de un ejemplo práctico y reproducible de imitación visual-motora de bajo coste: un pipeline LeRobot completo, con licencia Apache 2.0, que demuestra las limitaciones reales de las políticas ACT cuando la percepción depende de una sola cámara y el objetivo no está centrado en el campo de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visual-motora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen de muñeca y estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | cámara de muñeca + estado articular de 6 dimensiones |
| Salidas | objetivos articulares, chunk de 100 pasos |
| Dataset de entrenamiento | Dev-devadath/so101_pick3_wrist_v4 (247 episodios) |
| Pasos de entrenamiento | 30.000 |
| Tasa de aprendizaje | 1e-5 |
| Librería | LeRobot (commit 5c43fa1c, 0.5.2 dev) |
| Hardware objetivo | brazo SO-101 |

## Arquitectura y entrenamiento

La política sigue la arquitectura ACT de LeRobot: un transformer que consume observaciones visuales y propioceptivas y predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error acumulado y estabiliza el control. El chunk de salida es de 100 pasos y el autor recomienda ejecutarlo con *temporal ensembling*: re-predecir en cada frame y combinar las predicciones con un coeficiente de 0,01, activable con `--ensemble` en el repositorio so101-chess.

El entrenamiento es un fine-tuning desde el checkpoint v3 sobre los 247 episodios completos del dataset `so101_pick3_wrist_v4`, durante 30.000 pasos con lr 1e-5. No se documentan composición detallada del dataset, aumentos de datos ni procesos de RLHF/DPO (no aplicables en este dominio). El autor menciona un experimento adicional con ángulos articulares relativos al inicio de cada pick, pensado para forzar al modelo a apuntar visualmente a la pieza, que empeoró el resultado (1 acierto de 5) y no se publicó.

## Capacidades

- Ejecución de una habilidad concreta de picking: descender, agarrar y elevar una pieza de ajedrez desde una posición de hover a 8 cm con las pinzas abiertas.
- Control visual-motor a partir de una única cámara de muñeca y del estado articular de 6 dimensiones.
- Predicción de acciones en chunks de 100 pasos, compatible con temporal ensembling.
- Reintento de agarre desde un hover desplazado unos milímetros (capacidad observada empíricamente, no entrenada de forma explícita).
- Recogida de piezas que el propio brazo ha colocado previamente.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, multilingüismo ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Automatización de jugadas en un ajedrez robótico con SO-101: integrado en el pipeline so101-chess, el modelo ejecuta la fase de pick de cada movimiento mientras el sistema de planificación decide la casilla y el movimiento.
- Demostración reproducible de imitación visual-motora con LeRobot: sirve como referencia para montar un pipeline completo de dataset, entrenamiento ACT y despliegue en un brazo de bajo coste.
- Banco de pruebas de temporal ensembling: permite medir el efecto del re-ensamblado de predicciones (coeficiente 0,01) sobre la tasa de agarre en una tarea repetitiva.
- Estudio de robustez ante errores de posicionamiento: el comportamiento documentado (9 de 13 agarres al primer intento, 3 tras reintento) es un caso útil para analizar la sensibilidad de ACT a variaciones de milímetros.
- Base para fine-tuning de nuevas habilidades de picking: al estar entrenado sobre 247 episodios de un dataset público, es un punto de partida para añadir objetos o posiciones nuevas.
- Evaluación de límites de una sola cámara de muñeca: el fallo sistemático en e2, d2 y e4 es un ejemplo concreto de cómo la oclusión y el encuadre limitan la política, útil para justificar configuraciones multi-cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. El autor reporta una evaluación cualitativa en una partida larga registrada:

| Metrica | Resultado |
|---|---|
| Picks intentados | 13 |
| Agarre al primer intento | 9 |
| Agarre tras reintento con hover desplazado unos mm | 3 |
| Picks abandonados | 1 |
| Casillas problemáticas | e2, d2, e4 (aciertos irregulares) |
| Experimento descartado (ángulos relativos al inicio) | 1 agarre de 5 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors, el checkpoint cabe holgadamente en cualquier GPU consumer (del orden de unos pocos cientos de MB en memoria, incluyendo overhead de la librería).
- GPU recomendadas: no disponible; para una política de este tamaño basta una GPU consumer moderna (RTX 3060 o superior) o incluso CPU para inferencia, aunque no se documentan latencias.
- Cabe en GPU consumer: sí, por tamaño de modelo; el cuello de botella real es la integración con el brazo SO-101 y la cámara de muñeca.
- Opciones de despliegue: LeRobot con el script `chess/play.py` del repositorio so101-chess, usando `--ensemble` y `--skill 3`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-chess-act-pick-wrist-v4 | 51.668.614 | Pick de piezas de ajedrez con SO-101 | no aplica | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (checkpoints genéricos) | no disponible | Manipulación diversa | no aplica | según checkpoint | Hugging Face / LeRobot |
| Políticas Diffusion Policy de LeRobot | no disponible | Manipulación diversa | no aplica | según checkpoint | Hugging Face / LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La política solo funciona desde la pose de inicio prevista (hover IK a 8 cm sobre la pieza, pinzas abiertas); desde otra pose no produce resultados útiles.
- Requiere las mismas almohadillas de pinza en la vista de la cámara de muñeca que en el entrenamiento; cambiarlas invalida el modelo.
- Fallos documentados en e2, d2 y e4: la política va casi siempre a la misma pose en cada casilla en lugar de apuntar a la pieza, por lo que un desplazamiento de milímetros decide el resultado.
- Dependencia de una sola cámara de muñeca: sin visión global, la oclusión y el encuadre limitan la precisión.
- Riesgo de sobreajuste al dataset de 247 episodios y a un único brazo y configuración física.
- No es un modelo de lenguaje: no tiene capacidades de razonamiento simbólico, diálogo ni generación de texto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para un setup concreto; el autor no garantiza funcionamiento fuera de so101-chess.
- No se documentan sesgos sociales (no aplica), pero sí un sesgo físico claro hacia posiciones y objetos vistos en entrenamiento.
- El checkpoint se construyó con LeRobot en un commit de desarrollo (5c43fa1c, 0.5.2 dev); pueden aparecer incompatibilidades con versiones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dev-devadath/so101-chess-act-pick-wrist-v4
- Dataset de entrenamiento: https://huggingface.co/datasets/Dev-devadath/so101_pick3_wrist_v4
- Repositorio del proyecto so101-chess: https://github.com/Dev-devadath/so101-chess
- LeRobot (librería): https://github.com/huggingface/lerobot
