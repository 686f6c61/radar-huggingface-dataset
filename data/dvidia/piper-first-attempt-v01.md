# Dvidia/piper-first-attempt-v01

## Resumen

DVIDIA · PiPER first-attempt placement es un artefacto de aprendizaje por imitación para robótica de manipulación, publicado por el usuario Dvidia en Hugging Face bajo licencia MIT. No es un modelo de lenguaje ni una red neuronal profunda al uso: es un paquete congelado de pesos NumPy (fichero `camera-xy-primitive.npz`) de 195 kB que codifica una habilidad motora concreta, colocar un bloque rígido conocido de 40 mm en posición vertical sobre uno de dos destinos, sobre un brazo PiPER con pinza paralela. El modelo se entrenó a partir de 32 demostraciones generadas por un controlador de simulador escrito a mano, no por teleoperación humana.

La relevancia del artefacto es metodológica más que de escala: demuestra que una política de imitación de muy bajo coste computacional puede ejecutarse en CPU de portátil con NumPy 2.5.3 y Python 3.12, sin GPU ni framework de deep learning, emitiendo seis consignas articulares en radianes más una consigna de pinza en metros. El autor reporta 36/36 colocaciones correctas al primer intento en simulación sobre 18 posiciones iniciales no vistas, con un error horizontal mediano de 4,224 mm y una fuerza máxima de pinza de 1,172 N.

La información disponible es limitada en varios ejes: no hay datos de parámetros de red, longitud de contexto ni idiomas, porque la categoría del artefacto no aplica. La model card es explícita sobre el alcance: un brazo, una cámara calibrada, un objeto rígido conocido y dos destinos. Cualquier generalización a geometrías nuevas, sensorización física real o recuperación tras caída del bloque queda fuera de la evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación con interpolación de objetivos articulares y adaptador de muñeca; runtime NumPy (no se especifica la topología interna de la red) |
| Parametros totales | no disponible (pesos en `camera-xy-primitive.npz`; paquete de 195 kB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; usa una observación RGB-D inicial) |
| Tipos de cuantizacion | no disponible (pesos NumPy en coma flotante, sin esquema de cuantización documentado) |
| Idiomas soportados | no aplica (salida de consignas articulares, no texto) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy), empaquetado en ZIP `piper-camera-yaw-skill-0.1.0.zip` con SHA-256 `45a8636d2e90db9a4643a73268cf0463b6943d4d63f97ec93fff5ec0b470b1f9` |

## Arquitectura y entrenamiento

El artefacto combina dos componentes según la model card: por un lado, unos pesos aprendidos que interpolan seis objetivos de brazo y un objetivo de mandíbula usando la XY inicial, el destino y el tiempo transcurrido; por otro lado, un adaptador escrito a mano que utiliza el ángulo inicial del bloque para rotar la muñeca. Las articulaciones medidas acotan el movimiento solicitado y el simulador aplica sus límites de articulación y actuación en tiempo de ejecución. No se documenta la topología de la red subyacente (número de capas, anchura, función de activación) ni el algoritmo exacto de ajuste; solo se indica que los pesos son NumPy y que el runner emite seis consignas articulares en radianes y una de pinza en metros.

Los datos de entrenamiento provienen de un controlador de simulador escrito a mano, con 32 demostraciones simuladas. No se especifica el número de tokens ni de transiciones, la composición del dataset más allá de las demostraciones, ni si hubo RLHF o DPO (categorías que no aplican a este tipo de política). La innovación destacable es la separación entre la parte aprendida (interpolación de trayectorias) y la parte autoral (adaptación de muñeca por ángulo del bloque): en un test de desarrollo con bloque rotado, los mismos pesos obtuvieron 24/24 con adaptación de muñeca y 16/24 con muñeca fija, lo que cuantifica la contribución del adaptador.

## Capacidades

- Colocación de un bloque rígido conocido de 40 mm en vertical sobre dos destinos predefinidos, a partir de una observación RGB-D inicial, el destino y los encoders articulares.
- Ejecución offline en CPU de portátil con Python 3.12 y NumPy 2.5.3, sin GPU ni framework de deep learning.
- Verificación de integridad del paquete mediante SHA-256 y self-test que compara 24.000 decisiones de fixture con el runtime empaquetado.
- Emisión de seis consignas articulares en radianes y una consigna de pinza en metros, compatible con el simulador DVIDIA y sus dependencias de brazo.
- Adaptación de muñeca al ángulo inicial del bloque mediante un adaptador autoral (no aprendido).
- Reproducción de escenas de física nativa mediante `simulate.py` y el archivo de evidencias con SHA-256 `cac4c33eccdf0ef95adfccdcd0ac3647c2270c1cdd0562cdfcb5f7cc759e43de`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, visión general, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas de imitación de bajo coste: el paquete permite reproducir 36/36 colocaciones en simulación y comparar decisiones contra 24.000 fixtures, lo que sirve como banco de pruebas para metodologías de verificación de habilidades congeladas.
- Docencia e investigación en robótica de manipulación: al ejecutarse en CPU con NumPy, un estudiante puede inspeccionar los pesos y el runner sin infraestructura de GPU, y estudiar la separación entre parte aprendida y adaptador autoral.
- Prototipado rápido de habilidades pick-and-place en simulación: el runner offline permite validar la cadena observación RGB-D, destino y encoders antes de invertir en teleoperación o entrenamiento profundo.
- Referencia de reproducibilidad: los hashes SHA-256 del ZIP, del archivo de evidencias y del paquete de pesos permiten auditar que los resultados publicados se obtienen con artefactos idénticos.
- Integración en pipelines de CI para robótica: el self-test y la comparación de fixtures pueden incorporarse como test de regresión de una habilidad congelada antes de desplegarla en el simulador nativo.
- Estudio de límites de generalización: el contraste 24/24 frente a 16/24 con muñeca fija y el conjunto de 18 posiciones iniciales no vistas permiten analizar cuánto aporta la adaptación autoral frente a la parte aprendida.
- Reproducción de física independiente: el replay con el bloque de 60 g a +24° sirve para validar que las decisiones del runtime se traducen en los mismos resultados bajo un motor de física distinto.

## Benchmarks y rendimiento

| Métrica (simulación, paquete congelado) | Resultado |
|---|---|
| Colocaciones correctas al primer intento | 36/36 sobre 18 posiciones iniciales no vistas, con ambos destinos en cada posición |
| Tiempo mediano hasta colocación estricta | 14,331 s simulados |
| Error horizontal final mediano | 4,224 mm |
| Fuerza máxima en cualquiera de las almohadillas de la pinza | 1,172 N |
| Episodios con contacto crítico o intervención del profesor | 0 de 36 |
| Resultados reproducidos por replay de física independiente | 36 de 36 |
| Test de desarrollo con bloque rotado, con adaptación de muñeca | 24/24 |
| Test de desarrollo con bloque rotado, con muñeca fija | 16/24 |
| Comparación de decisiones de fixture en self-test | 24.000 |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con otras políticas robóticas.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el runner funciona en CPU con NumPy 2.5.3 y Python 3.12.
- GPU recomendadas: no se requiere GPU para el runner offline; el replay de física nativa requiere gráficos offscreen funcionales, sin modelo de GPU especificado.
- Cabe en cualquier portátil convencional; el paquete de pesos ocupa 195 kB y el repositorio completo 0,0 GB.
- Opciones de despliegue: entorno virtual de Python con `numpy==2.5.3`, ejecución de `run_yaw.py` con `--self-test` y con `example-observations.jsonl`; para el replay, `dvidia-training[arm]` desde el commit `e13ff91fe2466cf630fe49c0dd0993dfafdd8e0e` y `dvidia-robot-sim fetch piper`.
- Latencia y throughput: no disponible; solo se reporta el tiempo mediano de colocación en simulación (14,331 s), que no equivale a latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DVIDIA · PiPER first-attempt placement | Política de imitación NumPy para PiPER | no disponible (paquete de 195 kB) | no aplica | 36/36 colocaciones en simulación; 4,224 mm de error mediano | MIT | Hugging Face, runner offline |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otras políticas robóticas con las que establecer una comparación cuantitativa fiable; indicar cifras inventadas violaría el criterio de rigor.

## Limitaciones y advertencias

- Alcance restringido: una sola unidad de brazo PiPER con pinza paralela, una cámara calibrada, un objeto rígido conocido de 40 mm y dos destinos. No hay evaluación con geometrías nuevas ni con objetos distintos.
- Los datos de entrenamiento provienen de un controlador de simulador escrito a mano, no de teleoperación humana ni de vídeo ordinario; el autor indica que aprender de vídeo humano requiere evaluación separada.
- No se evalúa sensorización física real: los resultados son de simulación y de replay de física, no de despliegue en hardware.
- No se documenta recuperación tras caída del bloque; esa capacidad queda explícitamente fuera del alcance evaluado.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución más allá del conjunto de 18 posiciones iniciales no vistas; el concepto de alucinación no aplica a este artefacto.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre generalización a producción física; la verificación se limita al paquete congelado y a los hashes publicados.
- El replay nativo requiere gráficos offscreen y descarga separada de assets PiPER fijados; no funciona en entornos sin esas dependencias.
- El runner depende de versiones concretas (Python 3.12, NumPy 2.5.3) y de commits fijados del repositorio `dvidia-training`; desviarse de ellas invalida la reproducibilidad declarada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dvidia/piper-first-attempt-v01
- Dataset de resultados y cintas de actuadores: https://huggingface.co/datasets/Dvidia/piper-first-attempt-v01
- Descarga del skill congelado: https://huggingface.co/Dvidia/piper-first-attempt-v01/resolve/main/piper-camera-yaw-skill-0.1.0.zip?download=true
- Pesos NumPy: https://huggingface.co/Dvidia/piper-first-attempt-v01/resolve/main/model/camera-xy-primitive.npz
- Vídeo de colocación simulada a doble velocidad: https://huggingface.co/Dvidia/piper-first-attempt-v01/blob/main/learned-piper-placement.mp4
- Guía de setup nativo y ejemplo reproducido: https://github.com/Dvidia-Inference/dvidia-training/blob/a8d50b5158ea4295fbb56745fb9853a4fd3b551f/benchmarks/piper-first-attempt-v01/local-skill/README.md
- Código fuente y benchmark: https://github.com/Dvidia-Inference/dvidia-training/tree/a8d50b5158ea4295fbb56745fb9853a4fd3b551f/benchmarks/piper-first-attempt-v01
- Script de simulación: https://huggingface.co/Dvidia/piper-first-attempt-v01/resolve/main/simulate.py
- Archivo de evidencias: https://raw.githubusercontent.com/Dvidia-Inference/dvidia-training/a8d50b5158ea4295fbb56745fb9853a4fd3b551f/benchmarks/piper-first-attempt-v01/local-skill/evidence.zip
- Licencia MIT: https://huggingface.co/Dvidia/piper-first-attempt-v01/blob/main/LICENSE
