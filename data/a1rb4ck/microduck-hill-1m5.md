# a1rb4Ck/microduck-hill-1m5

## Resumen

microduck-hill-1m5 es una política de control entrenada por refuerzo para el entorno de simulación Microduck Arena, publicada por el usuario a1rb4Ck en Hugging Face. No se trata de un modelo de lenguaje: es un controlador de locomoción para un agente robótico simulado (un "duck" de pequeñas dimensiones) que debe subir una rampa de ocho grados, tarea propuesta en la variante hill-climb-1m5 de la arena. El autor reporta un tiempo de 0,740 s en la revisión bbddfe5 de la arena.

El modelo combina una red MLP que genera la marcha (gait) con tablas de control específicas para las cinco semillas oficiales de la competición. Fuera de esas semillas, el sistema recurre a una marcha propia del autor ("hill gait") que, según la model card, logra subir la rampa la mayor parte de las veces. El repositorio tiene un tamaño de 0,0 GB, lo que sugiere pesos muy pequeños, y se distribuye en formato ONNX bajo licencia Apache 2.0.

Su relevancia es acotada y muy específica: sirve como referencia reproducible para participantes de Microduck Arena y como ejemplo de política de RL con ajuste por tablas para un benchmark de robótica con condiciones de contorno conocidas. No aporta capacidades de propósito general ni datos de entrenamiento publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP para la marcha (gait) combinada con tablas de control para las cinco semillas oficiales; no disponible el detalle de capas ni dimensiones |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible; pesos distribuidos en ONNX |
| Idiomas soportados | no aplica (modelo de RL sin entrada/salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política se compone de una red MLP que produce la marcha del agente y de tablas de control ajustadas para las cinco semillas oficiales de la arena. La model card no especifica el número de capas, las dimensiones de las entradas (observaciones) ni de las salidas (acciones), ni el algoritmo de RL empleado. Tampoco se documentan el número de pasos de entrenamiento, la composición del dataset de experiencias ni si hubo fases de ajuste fino o de destilación.

El elemento técnico destacable es el mecanismo de respaldo: cuando la semilla de ejecución no coincide con ninguna de las cinco oficiales, el sistema cambia a una marcha propia del autor ("hill gait") en lugar de la política principal. Este enfoque de tablas por semilla es una forma de especialización a condiciones de contorno conocidas, habitual en competiciones con entornos deterministas, y limita la generalización fuera de ese conjunto. No se documentan innovaciones como decodificación especulativa, atención lineal ni mecanismos híbridos, ya que no aplican a este tipo de modelo.

## Capacidades

- Control de locomoción de un agente simulado en el entorno Microduck Arena, concretamente en la tarea de subida de una rampa de ocho grados (hill-climb-1m5).
- Ejecución de una marcha basada en MLP para el caso general.
- Ajuste específico mediante tablas para las cinco semillas oficiales de la competición.
- Mecanismo de respaldo a una marcha propia del autor cuando la semilla no es oficial.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No se declaran capacidades multilingües ni de ningún otro tipo.

## Casos de uso

- Participación en Microduck Arena (hill-climb-1m5): el modelo se carga como política ONNX y se evalúa en la revisión bbddfe5 de la arena, con un tiempo de referencia de 0,740 s reportado por el autor.
- Reproducción de resultados de la competición: sirve para verificar el tiempo declarado y comparar con otras entradas de la misma tarea bajo las cinco semillas oficiales.
- Línea base para nuevas políticas: al ser una política pequeña con MLP y tablas, puede usarse como punto de partida para experimentar con otras arquitecturas de control en la misma tarea.
- Estudio del enfoque de tablas por semilla: útil para analizar cómo la especialización a semillas conocidas afecta al rendimiento y a la generalización en entornos deterministas.
- Evaluación de robustez fuera de distribución: la marcha de respaldo permite medir el comportamiento del agente en semillas no oficiales y documentar la degradación.
- Docencia y divulgación en RL aplicado a robótica: el tamaño reducido del repositorio y la licencia Apache 2.0 facilitan su uso en ejemplos prácticos de control con políticas entrenadas por refuerzo.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Tiempo en hill-climb-1m5 | 0,740 s | Medición local del autor, arena rev bbddfe5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. Tampoco se documentan métricas de éxito por semilla, varianza entre ejecuciones ni comparaciones cuantitativas con otras entradas de la arena.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB, lo que indica pesos de tamaño muy reducido compatibles con ejecución en CPU.
- GPU recomendadas: no disponible; por el tamaño del artefacto no se requiere aceleración por GPU.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se documenta explícitamente.
- Opciones de despliegue: formato ONNX, ejecutable con ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el único dato temporal es el tiempo de resolución de la tarea (0,740 s) en la arena, no una medida de inferencia aislada.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| microduck-hill-1m5 | Política RL (MLP + tablas) | hill-climb-1m5 en Microduck Arena | Apache 2.0 | Hugging Face |
| Entrada "sprint" del mismo autor | Política RL | Tarea de sprint en Microduck Arena | no disponible | Mencionada en la model card, sin enlace |
| Entrada remix9 de jrubiosainz | Política RL | Microduck Arena (variante no especificada) | no disponible | Mencionada en la model card, sin enlace |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas citadas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La política está especializada en una tarea concreta (subida de rampa de ocho grados) y en las cinco semillas oficiales; fuera de ellas depende de una marcha de respaldo con éxito parcial ("la mayor parte de las veces").
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento, código o visión.
- No se documentan sesgos, pero el ajuste por tablas a semillas conocidas puede producir sobreajuste al entorno de evaluación.
- Riesgo de alucinación no aplica; el riesgo relevante es la falta de generalización a condiciones no vistas.
- No se especifican limitaciones de idioma porque no hay entrada ni salida lingüística.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni documentación sobre el proceso de entrenamiento.
- Para producción en robótica real sería necesario validar la política fuera del simulador; no hay evidencia de transferencia sim-to-real en la información disponible.
- El rendimiento reportado (0,740 s) es una medición local del autor en una revisión concreta de la arena y no ha sido verificado de forma independiente en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a1rb4Ck/microduck-hill-1m5
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
