# Convergent-ch/Arkon-AoM-Ultra-0.8

## Resumen

Arkon-AoM Ultra 0.8 es un motor de ajedrez experimental desarrollado por Convergent-ch, publicado en Hugging Face como parte de la familia Arkon. No es un modelo de lenguaje: se trata de una red neuronal de evaluación y política de movimientos para ajedrez, con 20.202.322 parámetros en su red base congelada (Arkon 0.5 Ultra) más 131.327 parámetros en siete cabezas especialistas entrenadas. Su relevancia radica en la arquitectura de "Input-Divisors" que enruta cada posición a diez roles especialistas según el tipo de pieza, combinando una política base con cabezas de ranking de movimientos.

El sistema emplea una búsqueda alpha-beta con límite temporal sobre un conjunto de candidatos generado por las cabezas especialistas, una de las cuales está dedicada específicamente a movimientos de mate. La red base está congelada y solo se entrenan las cabezas, lo que reduce drásticamente el coste de entrenamiento respecto a un motor neuronal completo.

Es un proyecto de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. Su interés es fundamentalmente técnico y experimental: demuestra una estrategia de especialización modular sobre un motor base existente, aunque carece de rating Elo establecido y de benchmarks públicos frente a motores consolidados como Stockfish.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política/evaluación para ajedrez con dos Input-Divisors y enrutamiento a diez roles especialistas; red base congelada más siete cabezas de ranking de movimientos |
| Parametros totales | 20.202.322 (red base) + 131.327 (cabezas especialistas) = 20.333.649 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada es un tablero de ajedrez) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors y specialists.safetensors) |

## Arquitectura y entrenamiento

La arquitectura se organiza en torno a una red base congelada (Arkon 0.5 Ultra, 20.202.322 parámetros) sobre la que se entrenan siete cabezas de ranking de movimientos: una por cada tipo de pieza (seis) más una dedicada a movimientos de mate. El mecanismo de dos Input-Divisors enruta las posiciones a diez roles especialistas; el primer divisor prioriza tipos de pieza según la política base de movimientos, y el segundo añade candidatos en posiciones inciertas y cuando el rey está en jaque. Reina, caballo y rey cuentan con dos roles que comparten cabeza.

El entrenamiento de las cabezas utilizó etiquetas específicas por pieza generadas por Stockfish 18. No se especifica el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste por refuerzo. La selección de movimiento final se realiza mediante búsqueda alpha-beta con límite temporal sobre el conjunto de candidatos producido por las cabezas especialistas. El paquete de juego incluye código del motor, interfaz de navegador y gráficos de piezas, y funciona en CPU sin conexión una vez instaladas las dependencias de Python.

## Capacidades

- Juego de ajedrez completo mediante búsqueda alpha-beta con presupuesto de tiempo configurable (`--search-seconds`).
- Generación de candidatos de movimiento mediante política base más cabezas especialistas por tipo de pieza.
- Detección y priorización de movimientos de mate mediante cabeza dedicada.
- Enrutamiento adaptativo a diez roles especialistas según la posición y el estado de jaque.
- Interfaz web local (puerto por defecto 8805, configurable con `--port`) para partidas humano contra motor.
- Ejecución en CPU y funcionamiento offline tras instalar dependencias de Python 3.10 o superior.
- Visualización de qué roles contribuyeron a la respuesta en el tablero local.
- No soporta tool calling, function calling, agentes, razonamiento multi-step general ni capacidades multilingües: es un motor de ajedrez, no un modelo de lenguaje.

## Casos de uso

- Análisis de posiciones de ajedrez en local: el motor evalúa posiciones y propone movimientos candidatos con búsqueda alpha-beta limitada por tiempo, útil para estudio sin conexión.
- Entrenamiento de jugadores en detección de mates: la cabeza especialista de mate y los resultados reportados (12/12 en mate en uno y 12/12 en mate en dos) lo hacen adecuado para ejercicios tácticos.
- Investigación sobre especialización modular en motores neuronales: la arquitectura de Input-Divisors y cabezas por tipo de pieza sirve como banco de pruebas para estudiar enrutamiento y política de movimientos.
- Comparación de estrategias de búsqueda: permite contrastar el rendimiento de alpha-beta sobre candidatos especialistas frente a la política base de Arkon 0.5 Ultra.
- Desarrollo de interfaces de ajedrez: el paquete incluye servidor web local y gráficos de piezas, reutilizables como base para prototipos de UI.
- Experimentación educativa en CPU: al ejecutarse sin GPU y offline, es viable en entornos docentes o de laboratorio con hardware modesto.
- Integración en pipelines de análisis por lotes: el motor puede invocarse por script para procesar posiciones con un presupuesto de tiempo fijo por movimiento.

## Benchmarks y rendimiento

Evaluación local reportada por el autor (muestras pequeñas, sin Elo establecido):

| Prueba | Arkon-AoM Ultra 0.8 | Arkon 0.5 Ultra |
|---|---|---|
| Partidas a 0,25 s por movimiento | 1 victoria, 2 tablas, 1 derrota | 1 victoria, 2 tablas, 1 derrota |
| Mate en uno resuelto | 12/12 | 12/12 |
| Mate en dos resuelto | 12/12 | 6/12 |

No se han publicado resultados de benchmarks estándar (Elo, CCRL, TCEC) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; el paquete de juego está diseñado para ejecutarse en CPU. Tamaño del repo: 0,2 GB.
- GPU recomendadas: no disponible; no se documenta aceleración por GPU.
- ¿Cabe en GPU de consumo? Los pesos (unos 20,3 M de parámetros en safetensors) caben holgadamente en cualquier GPU de consumo, pero no se documenta un backend GPU.
- Opciones de despliegue: script propio `play_aom.py` con servidor web local (puerto 8805 por defecto); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un motor de ajedrez).
- Latencia y throughput: presupuesto de búsqueda configurable por movimiento (por defecto no especificado; la evaluación usó 0,25 s por movimiento). No se reportan métricas de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Arkon-AoM Ultra 0.8 | 20,3 M (base + cabezas) | Motor de ajedrez neuronal con búsqueda alpha-beta | No aplica | 12/12 mate en dos; sin Elo | no disponible | Hugging Face |
| Arkon 0.5 Ultra | 20,2 M | Motor de ajedrez neuronal (red base) | No aplica | 6/12 mate en dos; sin Elo | no disponible | Hugging Face (referenciado) |
| Stockfish 18 | no disponible | Motor de ajedrez clásico (alpha-beta) | No aplica | Referencia de etiquetado; sin datos comparativos en la información | no disponible | Distribución propia |

No se dispone de datos de benchmarks comparativos estandarizados entre estos motores en la información proporcionada.

## Limitaciones y advertencias

- Sin rating Elo establecido: la evaluación se limita a cuatro partidas locales a 0,25 s por movimiento, muestra insuficiente para conclusions de fuerza de juego.
- Licencia no declarada: no se especifica licencia para los pesos ni para el código, lo que impide confirmar el uso comercial. Los gráficos de piezas de Alexis Luengas tienen su propia licencia en `pieces/`.
- Dependencia de Stockfish 18 para el etiquetado de entrenamiento: las cabezas especialistas heredan los sesgos y estilo de las etiquetas del motor de referencia.
- Red base congelada: las mejoras dependen exclusivamente de las cabezas especialistas, lo que limita la capacidad de adaptación más allá de lo que permiten 131.327 parámetros.
- Proyecto experimental y de nicho: cero descargas y cero likes en el momento de la consulta, sin comunidad ni soporte documentado.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas aplicables: no es un modelo de lenguaje.
- Requiere Python 3.10 o superior y dependencias instaladas; el modo humano contra motor no necesita el ejecutable de Stockfish.
- Sin cuantizaciones publicadas ni backend GPU documentado: el rendimiento en producción a mayor presupuesto de búsqueda no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Arkon-AoM-Ultra-0.8
- Paquete de juego completo (zip): https://huggingface.co/Convergent-ch/Arkon-AoM-Ultra-0.8/resolve/main/Arkon-AoM-Ultra-0.8-play.zip
- Pesos base: https://huggingface.co/Convergent-ch/Arkon-AoM-Ultra-0.8/blob/main/model.safetensors
- Cabezas especialistas: https://huggingface.co/Convergent-ch/Arkon-AoM-Ultra-0.8/blob/main/specialists.safetensors
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
