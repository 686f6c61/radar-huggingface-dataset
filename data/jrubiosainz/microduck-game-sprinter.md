# jrubiosainz/microduck-game-sprinter

## Resumen

Microduck game sprinter es una política de control para robótica desarrollada por el usuario jrubiosainz como entrada para la prueba de 2 metros (2 m Sprint) de la Microduck Arena. Se trata de un ajuste fino (fine-tune) de la política HannesVonEssen/microduck-running, una política de carrera frontal para el MicroDuck estándar en terreno plano (iteración 12.195, licencia Apache-2.0), que a su vez fue entrenada con Vottivott/microduck-playground sobre pollen-robotics/microduck_rl.

El modelo no es un modelo de lenguaje ni un sistema multimodal: es una red neuronal feedforward de control con forma 61 → 512 → 256 → 128 → 14 y activación ELU, que consume 61 dimensiones de observación por paso de control y emite 14 acciones. Sobre esa base se aplicaron, en CPU y dentro del propio simulador de la Arena (MuJoCo 3.10.0, versión 4 del runner), tres fases de PPO, dos bloques de estrategias evolutivas (ES) y, finalmente, una búsqueda de tablas de temporización (step-counter schedule) que modulan el comando interno y los desplazamientos articulares en función del número de paso.

Es relevante ahora porque documenta una cadena de entrenamiento híbrida PPO + ES poco habitual, con un objetivo explícito de tiempo de carrera y validación sobre semillas oficiales de la competición. El autor reporta 0,980 s sobre esas semillas y 178 terminaciones de 200 con 21 caídas en semillas nunca vistas (1001-1200). La política ignora el comando de entrada y está pensada exclusivamente para simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (perceptrón multicapa) 61 → 512 → 256 → 128 → 14, activación ELU; política de control con normalizador de entrada congelado |
| Parámetros totales | 197.774 (derivado de la forma declarada, incluyendo sesgos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 61 dimensiones por paso de control) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`, sha256 `007707dd7779…` del modelo base) |

## Arquitectura y entrenamiento

La red parte de la forma y los pesos de HannesVonEssen/microduck-running (revisión `9f45af1f`), una política de carrera frontal para el MicroDuck de serie en suelo plano (iteración 12.195, Apache-2.0). La topología es 61 → 512 → 256 → 128 → 14 con ELU y mantiene congelado el normalizador de entrada de su modelo base. La cadena de entrenamiento se ejecutó íntegramente en CPU dentro del runner y la física de la Arena (MuJoCo 3.10.0, runner versión 4), sobre el circuito de la prueba de 2 m, con un comando interno de avance fijo de 1,0 m/s.

La secuencia de optimización fue: 1.850 iteraciones de PPO sobre sprint-2m (run hs1, cuyas primeras 25 iteraciones entrenaron solo un crítico nuevo); 95 generaciones de estrategias evolutivas sobre el tiempo de carrera (run es1); 30 iteraciones más de PPO con lotes cuatro veces mayores (run hsb2); 454 generaciones de ES sobre las semillas oficiales 1–5 de la Arena (run so1_sprint); y, con la red congelada, una búsqueda de dos tablas de temporización pieza a pieza lineales en el contador de pasos k (run clock_sprint_j3). En PPO la recompensa combina progreso hacia delante mientras corre el cronómetro, penalizaciones pequeñas por velocidad lateral, tasa de guiñada, deriva hacia las paredes y caída, con un bonus de un solo uso igual a la recompensa de correr a 1,5 m/s por cada paso restante antes del horizonte de 2,5 s. En las fases ES el objetivo es directamente el tiempo de carrera, interpolado entre pasos de control; una carrera que sigue en marcha tras 1,5 s cuesta 1,5 s más los metros que faltan, más 1 si hubo caída. Las generaciones ES puntuaron perturbaciones gaussianas antitéticas de todas las capas (σ = 0,02 × el RMS de la capa y 64 perturbaciones en es1; σ = 0,01 × el RMS y 96 perturbaciones en so1_sprint), con un paso Adam sobre la dirección ponderada por rango (lr 0,004 y 0,003 respectivamente).

La innovación destacable es la capa de temporización: con la red congelada, se buscaron 378 números repartidos en dos tablas (comando y desplazamientos articulares) con nudos en k = 0, 4, …, 32 y después cada 8 pasos hasta 72; a partir de k = 72 el comando mantiene su último valor y los desplazamientos vuelven a cero en k = 80. La búsqueda movió el comando en unidades de 0,03 m/s, los otros 12 canales en unidades de 0,1 × la desviación estándar del normalizador, y los desplazamientos articulares en 0,03 rad, con 48 perturbaciones antitéticas por iteración (σ adaptada entre 0,02 y 1) y tres pasos a lo largo de una dirección suavizada ponderada por rango. El candidato seleccionado, `elite_i00038_438200029_p` (iteración 38 de clock_sprint_j3), superó al incumbente (0,980 s frente a 0,984 s) y se revalidó con el cargador de políticas de la Arena, exigiendo terminar las cinco semillas en dos repeticiones con ruido gaussiano (σ = 0,0001) en todas las observaciones salvo el contador de pasos, con una media como máximo 0,012 s más lenta.

## Capacidades

- Locomoción bípeda frontal en simulación: ejecuta una carrera de 2 m sobre el circuito de la prueba Sprint de la Microduck Arena.
- Control a partir de un vector de observación de 61 dimensiones, emitiendo 14 acciones por paso.
- Modulación temporal del comando interno y de los desplazamientos articulares mediante tablas dependientes del contador de pasos.
- Robustez parcial ante ruido de observación: validada con σ = 0,0001 sobre todas las entradas excepto el contador de pasos.
- Terminaciones fiables en semillas no vistas: 178 terminaciones de 200 con 21 caídas en el rango 1001-1200.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo de razonamiento (thinking mode) ni de ninguna capacidad cognitiva; es una política de control reactiva.
- Ignora explícitamente el comando de entrada: la política no responde a instrucciones de velocidad u orientación.

## Casos de uso

- Participación en la Microduck Arena: el modelo está diseñado como entrada para la prueba de 2 m Sprint de la competición oficial, de modo que puede enviarse directamente al espacio de la Arena para su evaluación sobre las semillas del tablero.
- Investigación en aprendizaje por refuerzo híbrido: sirve como caso de estudio reproducible de una cadena PPO + ES + búsqueda de tablas, útil para analizar qué aporta cada fase al tiempo final (0,984 s tras ES frente a 0,980 s tras la búsqueda de temporización).
- Benchmark de algoritmos de optimización sin gradiente: las 454 generaciones de ES sobre las semillas oficiales permiten comparar el rendimiento de estrategias evolutivas frente a PPO en un mismo objetivo de tiempo de carrera.
- Punto de partida para fine-tuning de otras tareas de locomoción sobre el MicroDuck: al conservar la forma y el normalizador congelado del modelo base, puede reentrenarse para circuitos nuevos o para responder a comandos, partiendo de una política ya competente en carrera.
- Evaluación de robustez y sensibilidad al ruido: el protocolo de revalidación con ruido gaussiano (σ = 0,0001) y la tolerancia de 0,012 s permiten medir la estabilidad de la política ante perturbaciones en las observaciones.
- Docencia y divulgación en robótica: un modelo de aproximadamente 198.000 parámetros, ejecutable en CPU, es un ejemplo accesible para explicar el ciclo completo de entrenamiento en simulación, selección de élites y validación sobre semillas.
- Despliegue experimental en el robot físico: el MicroDuck es un bípedo de 25 cm con 15 motores, cámara, LiDAR y pico prensil, y el modelo se distribuye en ONNX, por lo que es técnicamente cargable en el robot; ahora bien, el propio autor advierte que es solo para simulación y no documenta transferencia sim-to-real.
- Comparación con la referencia de la organización: puede contrastarse con pollen-robotics/microduck-sprint-2m-reference para situar el rendimiento de un fine-tune comunitario frente a un modelo de referencia.

## Benchmarks y rendimiento

| Métrica | Resultado | Condiciones |
|---|---|---|
| Tiempo de carrera | 0,980 s | Semillas oficiales 1–5 de la Arena (medida en muestra, según el autor) |
| Tiempo de carrera del incumbente (tablas previas) | 0,984 s | Semillas oficiales 1–5 de la Arena |
| Tasa de terminación | 178 de 200 terminaciones | Semillas 1001-1200, nunca vistas durante el entrenamiento |
| Caídas | 21 | Semillas 1001-1200 |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo), ni comparaciones cuantitativas directas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante. Con unos 198.000 parámetros en formato ONNX, el peso del modelo es de kilobytes y el repositorio ocupa 0,0 GB.
- GPU recomendadas: no se requiere GPU. La cadena de entrenamiento descrita en la model card se ejecutó íntegramente en CPU.
- GPU de consumo: cabe con enorme holgura en cualquier GPU de consumo e incluso en hardware embebido; no hay requisito específico documentado.
- Opciones de despliegue: ONNX Runtime para inferencia del archivo `policy.onnx`; MuJoCo 3.10.0 (runner versión 4) para reproducir la simulación; la librería `microduck` como interfaz declarada del modelo.
- Latencia y throughput: no disponibles. No se documentan cifras de latencia ni de frecuencia de control en pasos por segundo.

## Comparativa con modelos similares

| Modelo | Relación | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| jrubiosainz/microduck-game-sprinter | Este modelo | MLP 61 → 512 → 256 → 128 → 14, ELU | Apache-2.0 | HuggingFace, 27 descargas |
| HannesVonEssen/microduck-running | Modelo base (fine-tune) | MLP 61 → 512 → 256 → 128 → 14, ELU (iteración 12.195) | Apache-2.0 | HuggingFace |
| jrubiosainz/microduck-game-roller | Mismo autor, tarea distinta | Ajuste fino con PPO del proyecto MICRODUCK GAME | El repositorio base no declara licencia propia | HuggingFace |
| pollen-robotics/microduck-sprint-2m-reference | Referencia de la organización para la misma prueba | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables (tiempos de carrera o tasas de terminación) de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a relación, arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que el modelo es únicamente para simulación y no documenta validación en el robot físico.
- Ignora el comando: la política no responde a las instrucciones de entrada; su comportamiento está fijado por la temporización y los pesos, lo que impide controlarla dinámicamente.
- Medida en muestra: el tiempo de 0,980 s sobre las semillas oficiales 1–5 se obtuvo sobre las mismas semillas usadas en la búsqueda de las tablas de temporización, por lo que el propio autor lo califica de número en muestra y no debe interpretarse como rendimiento fuera de muestra.
- Rendimiento fuera de muestra limitado: en semillas nunca vistas (1001-1200) se registran 21 caídas sobre 200 intentos, lo que supone una tasa de fallo relevante para despliegues reales.
- Sesgos conocidos: no disponibles (no aplica en el sentido habitual de sesgos de datos lingüísticos; no hay análisis de sesgos en la información disponible).
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto).
- Limitaciones de contexto e idioma: no aplica; el modelo consume un vector de observación de 61 dimensiones y no procesa lenguaje.
- Restricciones de licencia: el modelo se distribuye bajo Apache-2.0, que permite uso comercial, pero la licencia del modelo base debe respetarse igualmente; el modelo base (HannesVonEssen/microduck-running) también es Apache-2.0, según la model card.
- Caveat para producción: el modelo depende del runner y la física concretos de la Arena (MuJoCo 3.10.0, runner versión 4); reproducir los resultados exige ese entorno exacto.
- Advertencia sobre el repositorio relacionado jrubiosainz/microduck-game-roller: el repositorio base asociado no declara licencia propia, lo que puede afectar a su reutilización comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-sprinter
- Modelo base: https://huggingface.co/HannesVonEssen/microduck-running
- Microduck Arena (espacio de evaluación): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio de entrenamiento Vottivott/microduck-playground (commit 828d950): https://github.com/Vottivott/microduck-playground/commit/828d950134e29a8d04cbb51720a22c8729047fb7
- Repositorio pollen-robotics/microduck_rl (commit d424a0c): https://github.com/pollen-robotics/microduck_rl/commit/d424a0c899f6b33cbd3daeb279913134349c0b63
- Repositorio jrubiosainz/microduck: https://github.com/jrubiosainz/microduck
- Modelo jrubiosainz/microduck-game-roller: https://huggingface.co/jrubiosainz/microduck-game-roller
- Repositorio pollen-robotics/microduck: https://github.com/pollen-robotics/microduck
- Página del robot Microduck (Pollen Robotics): https://pollen-robotics.com/microduck/
- Modelos ajustados sobre pollen-robotics/microduck-sprint-2m-reference: https://huggingface.co/models?other=base_model:finetune:pollen-robotics/microduck-sprint-2m-reference
