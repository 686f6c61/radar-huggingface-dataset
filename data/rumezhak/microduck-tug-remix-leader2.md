# rumezhak/microduck-tug-remix-leader2

## Resumen

`rumezhak/microduck-tug-remix-leader2` es una política de control para robótica entrenada por refuerzo, publicada como entrada para el evento **Tug of War** de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje: es un grafo de control (formato ONNX, librería `microduck`) que gobierna un pato cuadrúpedo simulado en un tirón de cuerda contra otro pato. El autor parte del grafo de `greecree/microduck-tug-of-war-tug-leader-v4` y modifica únicamente dos grupos de inicializadores: las tablas de offsets de las cinco ramas de rating y la red head-to-head.

La relevancia del modelo es acotada y muy específica: es un ejercicio de optimización de políticas en simulación con MuJoCo, donde la búsqueda de tablas se hace con CMA-ES sobre la puntuación oficial del runner de la Arena, y la red de enfrentamiento se entrena con PPO en el entorno `Mjlab-TugOfWar-MicroDuck`. El autor declara **162,8414 cm** de media en las cinco semillas de rating (frente a 159,847 cm del modelo base en el marcador) y victorias por pozo en las 5 semillas, con datos **in-sample**.

Arquitectónicamente combina una red de rating heredada con una red head-to-head propia de tipo MLP (61 → 512 → 256 → 128 → 14, activación ELU), más tablas de offsets de 6 × 256 × 14 por rama. El repositorio tiene un tamaño declarado de 0,0 GB y cero descargas, y no se especifican licencia ni idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo de control híbrido: red de rating heredada del modelo base + MLP head-to-head (61 → 512 → 256 → 128 → 14, ELU) + tablas de offsets `hy_off` (6 × 256 × 14 por rama) |
| Parametros totales | no disponible (el grafo completo no se cuantifica en la model card; la red head-to-head es del orden de 2 × 10^5 pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones y acción de 14 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible / no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento

El grafo mantiene nodo por nodo la estructura del modelo base. La lógica de selección de rama se implementa con señales del propio vector de acción realimentado por la Arena: un contador de pasos viaja en los bits bajos de la acción `head_roll` y un identificador de rama en los bits bajos de `head_yaw`. En el paso 0 se compara la observación con las primeras observaciones registradas de las cinco semillas de rating; si hay coincidencia, el identificador de rama pasa a ser el número de esa semilla. Mientras el identificador está entre 1 y 5, la acción es la salida de la red de rating más una fila de `hy_off`; en caso contrario actúa la red head-to-head.

Las modificaciones respecto al base son dos. Primero, las tablas de offsets: 51 filas de cada uno de los bloques 1 a 5 (pasos de contador aproximados de 86 a 171, es decir, la ventana en la que se decide el pozo), sobre los 12 articulaciones distintas de las dos articulaciones portadoras. La búsqueda se hizo con CMA-ES (`tug_search.py`), semilla de rating a semilla de rating, ejecutando el combate en el runner oficial de la Arena sobre MuJoCo 3.10.0 en Linux x86-64, con ventanas de 30 a 150 filas, pasos iniciales de 0,004 a 0,05 y poblaciones de 64 a 128 (variantes diagonal y covarianza completa). Se aplicó una guarda que descarta candidatos si el marcador sale del rango de 70 cm, si alguna posición abandona el ring o si la cuerda deja de estar atada a los dos troncos (extremo a más de 0,35 m de su tronco o distancia extremo a extremo fuera de 0,5–1,06 m); dos candidatos con explosiones numéricas de la cuerda fueron descartados.

Segundo, la red head-to-head: un MLP 61 → 512 → 256 → 128 → 14 con ELU entrenado con PPO en `Mjlab-TugOfWar-MicroDuck`, en una liga con 4096 entornos paralelos sobre una RTX 5090 (250 iteraciones de 24 pasos, unos 24,6 millones de pasos de entorno). El aprendiz parte de la política de copa publicada por almuli (desviación estándar de acción inicial 0,3) y en cada reinicio sortea rival entre un pool de entradas publicadas (copa de almuli, puller 1 y 2 de juicenv, pool 2 de AndoShy, 2-850 y 3-1000, primera entrada de almuli) y el pato de referencia de Pollen. Recompensas y ajustes de PPO son los por defecto de la tarea. Se eligió el checkpoint 250 y no el último porque la liga no era monótona (el 600 era claramente más débil); el entrenamiento seguía en marcha en el momento de la publicación.

## Capacidades

- Control locomotor de un pato cuadrúpedo simulado en la tarea de tirón de cuerda (14 acciones articulares, observación de 61 dimensiones).
- Cambio de política por rama en función de la semilla detectada en el primer paso, mediante un contador embebido en los bits bajos de la acción.
- Ejecución de una política head-to-head genérica para cualquier semilla no reconocida (semillas 6 a 25 en la evaluación del autor).
- Comportamiento entrenado contra un pool de oponentes heterogéneo (seis políticas publicadas más el pato de referencia), lo que aporta cierta robustez frente a estilos distintos.
- Exportación a ONNX e inferencia determinista de baja latencia.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión o de audio.

## Casos de uso

- **Entrada competitiva en la Microduck Arena**: el modelo está pensado para presentarse al evento Tug of War. Se sube el grafo a la Arena y se puntúa con su propio runner (versión 5, un combate por semilla contra el pato de referencia congelado). Es adecuado porque replica exactamente el contrato de observación/acción del runner.
- **Oponente en una liga de entrenamiento**: la política head-to-head sirve como rival dentro de un pool para entrenar nuevas entradas con PPO, igual que el autor usó las entradas publicadas de otros participantes. Su comportamiento contra el pato de referencia (20 victorias por pozo en 0,7–1,0 s en semillas 6 a 25) la hace un rival no trivial para políticas noveles.
- **Baseline reproducible en investigación de RL para robótica**: permite comparar artefactos (CMA-ES sobre tablas de offsets frente a PPO sobre redes) con una métrica objetiva y un entorno congelado; el autor reporta 162,84 cm frente a los 148,58 cm de la red head-to-head del base en las mismas 20 semillas.
- **Auditoría de robustez de runners físicos**: el propio autor documenta que la semilla 3 produce una cuerda más floja (0,86 m extremo a extremo frente a 0,97–0,99 m), de modo que la puntuación depende de cómo el runner mide la cuerda. Este modelo sirve para estudiar esos efectos de medición y detectar candidatos con explosiones numéricas.
- **Docencia y demostración de simulación física**: un grafo ONNX pequeño que corre en CPU permite montar demostraciones de control con realimentación de acción bit a bit y de búsqueda de políticas sin necesidad de infraestructura de GPU.
- **Integración en pipelines de evaluación automatizada**: al ser ONNX y de tamaño reducido, se puede embeber en scripts de evaluación por lotes (por ejemplo, sobre `onnxruntime`) que recorran semillas y registren marcador, tiempo de fin de combate y estado de la cuerda.

## Benchmarks y rendimiento

Resultados declarados por el autor con el código de tug de la Arena (runner versión 5, un combate por semilla contra el pato de referencia congelado, entrada al oeste en semillas impares), sobre Linux x86-64:

| Semilla | Lado | Base (cm) | Esta entrada (cm) | Marcador (cm hacia la entrada) | Punto medio del tronco (cm) |
|---|---|---|---|---|---|
| 1 | oeste | 158,924 | 162,694 | +62,69 | +58,17 |
| 2 | este | 160,866 | 162,950 | +62,95 | +59,61 |
| 3 | oeste | 160,441 | 164,552 | +64,55 | +53,97 |
| 4 | este | 159,883 | 161,714 | +61,71 | +58,52 |
| 5 | oeste | 159,117 | 162,297 | +62,30 | +59,44 |
| **Media** | — | no disponible | **162,8414** | — | — |

Los combates terminan en los mismos instantes que en el base (el pozo se decide a 2,82, 2,12, 2,74, 2,34 y 2,60 s); lo que cambia es el desplazamiento del marcador. Las 5 semillas se ganan por pozo.

Evaluación fuera de las semillas de rating, contra el pato de referencia (semillas 6 a 25):

| Métrica | Esta entrada | Red head-to-head del base |
|---|---|---|
| Victorias por pozo | 20 de 20 | no disponible |
| Tiempo de combate | 0,7–1,0 s | no disponible |
| Marcador medio | 151,67 cm | 148,58 cm |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni aplican a este tipo de modelo. Los datos de las cinco semillas de rating son **in-sample**: cada tabla se buscó sobre el combate de su propia semilla y su rama solo se activa con la primera observación de esa semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el repositorio declara 0,0 GB de tamaño y la red head-to-head es un MLP de 61 → 512 → 256 → 128 → 14, por lo que el grafo completo cabe holgadamente en memoria de cualquier GPU e incluso en CPU.
- GPU recomendadas: ninguna en particular para inferencia. El entrenamiento de la red head-to-head se hizo con 4096 entornos paralelos en una RTX 5090; para la búsqueda CMA-ES el autor usó una máquina Linux x86-64 con MuJoCo 3.10.0, sin especificar GPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 5090, series 30/20, e incluso iGPU) y en CPU. El cuello de botella no es el modelo, sino el simulador físico.
- Opciones de despliegue: `onnxruntime` (CPU o GPU), el runner propio de la Microduck Arena y la librería `microduck`. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma medida. Por el tamaño del MLP, la inferencia por paso de control es del orden de microsegundos a fracciones de milisegundo en CPU (estimación, no reportada por el autor). Los combates completos duran entre 0,7 y 1,0 s de simulación en las semillas 6 a 25 y entre 2,12 y 2,82 s en las semillas 1 a 5.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rumezhak/microduck-tug-remix-leader2` | Grafo ONNX + MLP head-to-head | no disponible | no aplica | 162,84 cm (5 semillas, in-sample); 151,67 cm en 20 semillas | no disponible | HuggingFace, 0 descargas |
| `greecree/microduck-tug-of-war-tug-leader-v4` (base) | Grafo ONNX | no disponible | no aplica | 159,85 cm en el marcador de la Arena; 148,58 cm en las 20 semillas 6–25 | no disponible | HuggingFace |
| Entradas del pool de rivales (almuli, juicenv, AndoShy) | Políticas RL para la misma tarea | no disponible | no aplica | no disponible (usadas como rivales de entrenamiento, sin puntuación detallada en la información) | no disponible | HuggingFace |
| Pato de referencia de Pollen | Política de referencia congelada | no disponible | no aplica | no disponible (se usa como oponente fijo de evaluación) | no disponible | Incluido en la Arena |

La comparación directa solo es posible con el modelo base, que es el único con puntuaciones publicadas en la información disponible. El resto de entradas se citan como rivales de liga sin resultados numéricos en la model card.

## Limitaciones y advertencias

- **Sobreajuste in-sample**: las tablas de offsets se optimizaron sobre el combate de cada semilla de rating concreta y su rama solo se activa con la primera observación de esa semilla. El propio autor lo etiqueta explícitamente como in-sample; no hay validación en semillas de rating no vistas.
- **Dependencia de un contrato frágil**: el mecanismo de detección de semilla depende de que la Arena realimente la acción anterior bit a bit y de que el contador viaje en los bits bajos de `head_roll` y el identificador de rama en los de `head_yaw`. Cualquier cambio en el runner o en el redondeo de acciones invalida el comportamiento.
- **Sensibilidad a la medición física**: en la semilla 3 la cuerda termina más floja (0,86 m frente a 0,97–0,99 m), de modo que el marcador queda 10,6 cm más hacia la entrada que el punto medio entre troncos. La puntuación de esa semilla depende de cómo el runner mide la cuerda más que las demás.
- **Riesgo de artefactos numéricos**: el autor documenta dos candidatos previos con explosiones de la cuerda (uno puntuó miles de centímetros; otro 167,9 cm con los extremos a un metro de los troncos) que fueron descartados. Recomienda verificar la cuerda y no solo el marcador al buscar en este evento.
- **Solo simulación**: no hay evidencia de transferencia a hardware real ni de robustez ante variaciones de fricción, masa o latencia.
- **Licencia no disponible**: no se especifica licencia, por lo que el uso comercial o la redistribución no están autorizados de forma explícita; hay que contactar con el autor.
- **Repositorio sin tracción**: 0 descargas y 0 likes, creado y actualizado el 27 de octubre de 2026 con cuatro segundos de diferencia; no hay revisión independiente de los resultados.
- **Liga no monótona**: el checkpoint 600 era claramente más débil que el 250, lo que indica que el proceso de entrenamiento no converge de forma estable y que el resultado depende de la selección manual de checkpoint.
- **Ausencia de sesgos lingüísticos o de alucinación**: al no ser un modelo de lenguaje, no aplican sesgos de ese tipo; la limitación equivalente es el sobreajuste al oponente y al entorno de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rumezhak/microduck-tug-remix-leader2
- Modelo base: https://huggingface.co/greecree/microduck-tug-of-war-tug-leader-v4 (revisión citada: `7df51cddb20ae68fe28815551e7be88608f6165d`)
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- `microduck-challenges` de Pollen (entorno `Mjlab-TugOfWar-MicroDuck`): mencionado en la model card, sin URL proporcionada
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; las entradas devueltas no guardan relación con el contenido técnico de la ficha.
