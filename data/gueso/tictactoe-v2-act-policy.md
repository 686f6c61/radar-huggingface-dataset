# Gueso/tictactoe-v2-act-policy

## Resumen

`Gueso/tictactoe-v2-act-policy` es una política de control robótico basada en ACT (Action Chunking with Transformers) entrenada con LeRobot 0.6.1 para que un brazo robótico SO-101 juegue al tres en raya. No es un modelo de lenguaje: es un modelo de imitación que mapea observaciones multimodales (estado articular, dos cámaras RGB y una codificación one-hot de la celda objetivo) a secuencias de acciones articulares. Lo publica el usuario Gueso bajo licencia Apache 2.0 y el repositorio ocupa 0,2 GB con 51.674.246 parámetros en formato safetensors.

El modelo resuelve un problema muy acotado: dado un tablero de tres en raya observado por dos cámaras y una celda objetivo indicada externamente, generar un chunk de 100 acciones de seis articulaciones que muevan el brazo SO-101 para colocar la ficha en esa celda. Es relevante como ejemplo reproducible de pipeline completo de robótica de imitación con LeRobot: dataset público, política condicionada por objetivo y estadísticas de normalización incluidas en los preprocesadores.

La arquitectura es un transformer ACT con codificador visual y decodificador de acciones, entrenado sobre 135 episodios (66.300 frames) durante 30.000 pasos de optimización con batch de 16 en una RTX PRO 6000. La pérdida final de entrenamiento fue 0,103. No se han publicado resultados de benchmarks ni métricas de éxito en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parametros totales | 51.674.246 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada compuesta por estado de 6 articulaciones, dos imágenes 3×360×640 y vector one-hot de 9 celdas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la task string se ignora) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación diseñada para predecir chunks de acciones en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza el control. En este caso el modelo recibe `observation.state` (seis valores articulares del SO-101), dos flujos RGB de 3×360×640 (`env` y `wrist`) y `observation.environment_state`, un vector one-hot de nueve posiciones que indica la celda objetivo en orden row-major (de arriba a la izquierda a abajo a la derecha). La salida es un chunk de 100 acciones de seis articulaciones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `OG7407/tictactoe-v2-act`: 135 episodios y 66.300 frames, 30.000 pasos de optimización con batch size 16 en una RTX PRO 6000, alcanzando una pérdida final de 0,103. Los preprocesador y postprocesador incluidos en el repositorio contienen las estadísticas de normalización del entrenamiento. Un detalle crítico de diseño: ACT no utiliza la cadena de tarea en lenguaje natural, por lo que el condicionamiento al objetivo se hace exclusivamente mediante `observation.environment_state`, que debe añadirse a cada observación antes del preprocesado y de la inferencia.

## Capacidades

- Control visomotor de un brazo SO-101 de seis articulaciones a partir de dos cámaras RGB y el estado articular.
- Política condicionada por objetivo: selecciona la celda destino mediante un vector one-hot de nueve posiciones.
- Predicción de chunks de acciones de longitud 100, lo que permite ejecución fluida sin replanificación paso a paso.
- Integración nativa con LeRobot 0.6.1, incluyendo preprocesador y postprocesador con estadísticas de normalización.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No tiene capacidades multilingües ni de visión general: las cámaras se usan solo como entrada de control en el dominio del tres en raya.
- No dispone de modo thinking, audio ni otras modalidades.

## Casos de uso

- Investigación en imitación robótica: sirve como referencia reproducible de un pipeline ACT completo con LeRobot, desde dataset hasta política desplegada, para comparar hiperparámetros y estrategias de aumento de datos.
- Benchmark de manipulación con brazo de bajo coste: el SO-101 es un brazo accesible; esta política permite medir tasas de éxito en una tarea discreta y bien definida como el tres en raya.
- Educación y docencia en robótica: el dominio del juego es intuitivo y facilita explicar condicionamiento por objetivo, chunks de acción y normalización de observaciones.
- Pruebas de integración de sensores: valida la sincronización de dos cámaras (vista global y de muñeca) junto con el estado articular en un lazo de control real.
- Base para experimentos de generalización: al estar condicionada por celda objetivo, permite evaluar si la política generaliza a posiciones no vistas o a perturbaciones del tablero.
- Prototipado de sistemas de demostración: útil para montar demos de manipulación autónoma en ferias o laboratorios con hardware económico.
- Estudio de robustez ante cambios de iluminación y oclusión: las dos vistas permiten analizar qué cámara aporta más información cuando el tablero se ve parcialmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de entrenamiento (0,103) y los parámetros del proceso de entrenamiento; no hay tasas de éxito, métricas de error posicional ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors y dos entradas de imagen de 3×360×640, es esperable que quepa en GPUs consumer con 8 GB o más, aunque el dato no está confirmado en la información proporcionada.
- GPU recomendadas: el entrenamiento se realizó en una RTX PRO 6000; para inferencia se puede usar cualquier GPU compatible con PyTorch y LeRobot, incluidas RTX 4090, RTX 3090 o A100/H100 si se requiere mayor margen.
- Cabe en GPU consumer: probablemente sí en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, dado el reducido número de parámetros; no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 (carga mediante el ID del repositorio, con preprocesador y postprocesador incluidos). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gueso/tictactoe-v2-act-policy | 51,7 M | Estado 6 articulaciones + 2 imágenes 3×360×640 + one-hot 9 | Tres en raya con SO-101 | Apache 2.0 | Hugging Face, LeRobot |
| Políticas ACT genéricas de LeRobot | variable | Estado + imágenes | Manipulación diversa | según repositorio | Hugging Face, LeRobot |
| Políticas Diffusion Policy | variable | Estado + imágenes | Manipulación diversa | según repositorio | Hugging Face, LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, modalidad de entrada y licencia; no hay métricas de éxito publicadas para este modelo.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo juega al tres en raya con un SO-101; no es un modelo general de robótica ni de lenguaje.
- No utiliza la cadena de tarea en lenguaje natural; cualquier evaluación que omita `observation.environment_state` producirá resultados inválidos.
- El orden de las celdas es row-major y debe respetarse estrictamente; un error de codificación del objetivo invalida la acción generada.
- No hay métricas de éxito publicadas, por lo que se desconoce su robustez ante cambios de iluminación, posición del tablero u oclusiones.
- Riesgo de sobreajuste a las condiciones del dataset de 135 episodios; la generalización a entornos distintos no está validada.
- No se han documentado sesgos, pero al ser un modelo de control físico, los fallos pueden provocar colisiones o movimientos no deseados del brazo.
- Licencia Apache 2.0 permite uso comercial, pero el hardware SO-101 y el entorno de entrenamiento deben cumplir sus propias condiciones.
- Para producción se requiere supervisión humana y paradas de seguridad; no se recomienda operación desatendida sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gueso/tictactoe-v2-act-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/OG7407/tictactoe-v2-act
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de ACT en LeRobot: no disponible en la información proporcionada
- Paper de ACT (Action Chunking with Transformers): no disponible en la información proporcionada
