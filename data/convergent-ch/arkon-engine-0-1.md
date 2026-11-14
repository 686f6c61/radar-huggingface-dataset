# Convergent-ch/Arkon-Engine-0.1

## Resumen

Arkon Engine 0.1 es un motor de ajedrez neuronal de 10.079.442 parámetros desarrollado por AlpinaAI (publicado en Hugging Face bajo la cuenta Convergent-ch) y entrenado desde inicialización aleatoria. A diferencia de los modelos de lenguaje, su tarea es específica: jugar al ajedrez estándar sobre un tablero completo de 8×8, prediciendo una política de movimientos y un valor de posición. Se distribuye con una interfaz web local y una interfaz UCI básica para integrarse en GUIs de ajedrez.

El modelo emplea una red residual que recibe la codificación del tablero (piezas, turno, derechos de enroque, casilla de captura al paso y contador de medias jugadas) y produce dos cabezas: política y valor. Fue entrenado mediante imitación supervisada usando Stockfish 18 como profesor, sobre un conjunto muy reducido de 15.000 posiciones etiquetadas.

Es relevante ahora como ejemplo de motor de ajedrez neuronal ligero, reproducible y entrenado desde cero, útil para experimentación docente y para quienes quieran estudiar pipelines de destilación de Stockfish con recursos mínimos. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red residual (residual network) con cabezas de política y valor |
| Parametros totales | 10.079.442 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de posición de ajedrez) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; interfaz en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`arkon-0.1.safetensors`) |

## Arquitectura y entrenamiento

Arkon Engine 0.1 es una red neuronal residual que codifica el estado completo de una posición de ajedrez: piezas en el tablero, lado al que le toca mover, derechos de enroque, casilla de captura al paso y contador de medias jugadas. La red produce dos salidas: una política de movimientos y una estimación de valor de la posición. En inferencia, el motor filtra los movimientos legales, comprueba jaque mate inmediato y evalúa hasta seis continuaciones candidatas antes de elegir jugada.

El entrenamiento es imitación supervisada con Stockfish 18 como profesor. Se utilizaron 15.000 posiciones distintas etiquetadas, de las cuales 13.509 se destinaron a entrenamiento y 1.491 a validación, separadas por partida para la selección de checkpoints. No se menciona uso de RLHF, DPO ni self-play. El motor se entrenó desde inicialización aleatoria, sin pesos preentrenados. La búsqueda en modo UCI es fija y corta, y la partida local usa `python-chess` para la validación de reglas.

## Capacidades

- Juego de ajedrez estándar sobre tablero completo de 8×8.
- Predicción de política de movimientos legales y evaluación de valor de posición.
- Detección de jaque mate inmediato y evaluación de hasta seis continuaciones candidatas.
- Interfaz UCI básica para integración en GUIs de ajedrez (`python arkon.py uci`).
- Modo de consulta de movimiento para una posición FEN concreta (`python arkon.py move "<FEN>"`).
- Interfaz web local en el navegador (por defecto en `http://127.0.0.1:8793/`), con el humano jugando blancas y Arkon negras.
- Ejecución en CPU por defecto, con opción `--device cuda` para los comandos UCI y de movimiento.
- No soporta tool calling, agentes, multilingüismo ni modalidades distintas del ajedrez.

## Casos de uso

- Análisis y estudio de motores neuronales ligeros: sirve para reproducir un pipeline completo de destilación de Stockfish con un presupuesto de datos mínimo (15.000 posiciones) y observar el comportamiento de una red residual de ~10 M de parámetros.
- Docencia en aprendizaje por imitación: el par de cabezas política/valor y la separación de validación por partida son un ejemplo didáctico de entrenamiento supervisado en un dominio de juego.
- Integración en GUIs de ajedrez mediante UCI: permite añadir un oponente o analizador básico a herramientas compatibles con el protocolo, con búsqueda corta y fija.
- Partidas locales de práctica: la interfaz web incluida permite jugar contra el motor sin infraestructura adicional, ejecutándose en CPU.
- Pruebas de regresión en pipelines de ajedrez: el modo `move "<FEN>"` facilita la verificación automatizada de respuestas del motor sobre posiciones concretas.
- Experimentación con evaluación de posiciones: la cabeza de valor puede usarse para comparar estimaciones frente a evaluaciones de Stockfish en conjuntos de posiciones.
- Base para fine-tuning o ampliación de datos: al ser un modelo pequeño entrenado desde cero, es un punto de partida asequible para aumentar el conjunto de entrenamiento o cambiar el profesor.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (Elo, MMLU, HumanEval, GSM8K u otros). El único dato de rendimiento reportado es un enfrentamiento de ocho partidas contra un jugador simple de material a una jugada: Arkon ganó dos, empató tres y alcanzó el límite de movimientos en tres partidas sin terminar. El propio autor indica que estos resultados no establecen una calificación Elo.

| Prueba | Resultado |
|---|---|
| Partidas contra jugador simple de material a una jugada | 2 victorias, 3 tablas, 3 sin terminar (límite de movimientos) |
| Elo estimado | no establecido por el autor |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~10 M de parámetros, los pesos en precisión completa ocupan del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el modo por defecto es CPU, con opción `--device cuda` para los comandos UCI y de movimiento. Cualquier GPU NVIDIA con CUDA disponible debería ser suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 4090, RTX 3060, etc.), e incluso en CPU.
- Opciones de despliegue: scripts propios del repositorio (`play.py`, `arkon.py`), interfaz web local y modo UCI. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. La búsqueda UCI es fija y corta, y se evalúan hasta seis continuaciones candidatas por jugada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, se trata de un motor neuronal de ~10 M de parámetros entrenado por imitación de Stockfish con 15.000 posiciones, un régimen muy inferior en datos y tamaño a los motores neuronales de referencia (por ejemplo, Leela Chess Zero o los motores basados en redes grandes de ajedrez), cuyos detalles no se incluyen aquí.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arkon Engine 0.1 | 10.079.442 | no aplica | 2V-3T-3 sin terminar vs jugador simple | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Nivel de juego muy limitado: entrenado con solo 15.000 posiciones y una búsqueda fija corta; no dispone de Elo establecido y su resultado contra un jugador simple no es concluyente.
- Riesgo de alucinación en el sentido de jugadas subóptimas o evaluaciones poco fiables fuera de la distribución de entrenamiento, dado el reducido conjunto de datos.
- Sesgo hacia el estilo y las etiquetas de Stockfish 18, que actúa como profesor; el modelo imita sus movimientos en lugar de aprender de self-play.
- Limitaciones de idioma e interfaz: no es un modelo de lenguaje; la documentación y la interfaz están en inglés y no hay soporte multilingüe declarado.
- Licencia no especificada: no se indica licencia en la model card ni en los metadatos, por lo que el uso comercial no está autorizado de forma explícita y debe consultarse con el autor.
- Dependencia de `python-chess` para las reglas y de dependencias Python instaladas vía `requirements.txt`; la instalación requiere conexión a internet si no están presentes.
- La interfaz web se ejecuta en CPU y requiere mantener abierta la terminal durante la partida; el puerto por defecto es 8793 y puede cambiarse.
- No se documentan cuantizaciones ni formatos alternativos de pesos; solo se distribuye `arkon-0.1.safetensors`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Arkon-Engine-0.1
- Paquete de juego: `Arkon-Engine-0.1-play.zip` (incluido en el repositorio)
- Pesos: `arkon-0.1.safetensors` (incluido en el repositorio)
- Informes de entrenamiento y de partidas: incluidos en el repositorio para referencia
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
