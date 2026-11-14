# Convergent-ch/Arkon-Engine-0.1-Max

## Resumen

Arkon Engine 0.1 Max es un motor de ajedrez neuronal desarrollado por AlpinaAI y publicado en Hugging Face bajo la cuenta Convergent-ch. No es un modelo de lenguaje: es una red neuronal entrenada desde cero para jugar al ajedrez sobre un tablero estándar, que predice simultáneamente una política de movimientos (policy) y una evaluación de la posición (value). El checkpoint publicado contiene 20.220.242 parámetros en precisión FP32 y ocupa unos 0,2 GB.

El modelo se entrenó sobre 600.000 posiciones distintas (539.339 para entrenamiento y 60.661 reservadas por partida para validación), combinando etiquetas generadas por Stockfish 18 con posiciones de mate generadas sintéticamente. Se ejecutaron 24 épocas y se liberó el checkpoint de la época 4, la de menor pérdida de validación. La relevancia del modelo reside en su carácter de motor neuronal autocontenido y ligero: puede jugar contra un humano en el navegador, operar como motor UCI en interfaces de ajedrez y disputar partidas contra Stockfish, todo con dependencias mínimas y sin requerir el propio Stockfish para el juego local.

La ficha se basa exclusivamente en la model card y en los metadatos del repositorio. No hay información publicada sobre licencia, idiomas ni pipeline, y el número de descargas y likes registrados es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para ajedrez (policy + value); tipo exacto de capas no disponible |
| Parametros totales | 20.220.242 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada = posicion de ajedrez) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (arkon-0.1-max.safetensors) y paquete de juego en ZIP |

## Arquitectura y entrenamiento

La model card describe una red neuronal que, dada una posición de ajedrez estándar, produce dos salidas: una política de movimientos y un valor de posición. No se detalla la topología interna (número de capas, canales, tipo de bloques residuales ni representación de entrada), por lo que ese extremo queda como no disponible. El entrenamiento partió de inicialización aleatoria, sin destilación de pesos preexistentes, y utilizó 600.000 posiciones distintas: 539.339 para entrenamiento y 60.661 para validación, separadas por partida para evitar fugas de información entre conjuntos.

Las etiquetas provienen de Stockfish 18, complementadas con posiciones de mate generadas. El entrenamiento duró 24 épocas y el checkpoint liberado corresponde a la época 4, seleccionada por presentar la menor pérdida de validación; esto sugiere un sobreajuste temprano en épocas posteriores. El buscador integrado es una búsqueda de profundidad iterativa de tipo corto, compartida entre las variantes Max y Pro en las evaluaciones comparativas. No se documentan técnicas como decodificación especulativa, atención lineal ni esquemas de RLHF/DPO, que en este dominio no aplican.

## Capacidades

- Predicción de política de movimientos legales sobre un tablero de ajedrez estándar.
- Evaluación de posición mediante una cabeza de valor.
- Juego local contra un humano desde el navegador, en CPU y sin Stockfish.
- Operación como motor UCI, utilizable desde interfaces gráficas de ajedrez compatibles.
- Consulta puntual de movimiento a partir de una posición en notación FEN mediante `python arkon.py move "<FEN>"`.
- Búsqueda de profundidad iterativa con límite de tiempo configurable (`--search-seconds`).
- Duelos automáticos contra Stockfish cuando se define la variable `ARKON_STOCKFISH`, con cinco segundos por movimiento por defecto en modo `max`.
- Resolución de mates en un movimiento y en dos movimientos a nivel de política de primer movimiento (ver benchmarks).

No dispone de tool calling, capacidades multimodales, audio, visión ni modo de razonamiento textual, al no ser un modelo de lenguaje.

## Casos de uso

- Juego casual en navegador: el paquete `Arkon-Engine-0.1-Max-play.zip` levanta un servidor local en `http://127.0.0.1:8793/` donde el usuario juega con blancas seleccionando pieza y destino; funciona en CPU y sin conexión tras instalar dependencias, lo que lo hace adecuado para demostraciones y entornos sin GPU.
- Integración en interfaces UCI: configurando el comando `python arkon.py uci` desde la carpeta extraída, el motor queda disponible en cualquier GUI de ajedrez que hable UCI, útil para análisis de partidas y entrenamiento personal.
- Análisis puntual de posiciones: `python arkon.py move "<FEN>"` devuelve un movimiento para una posición concreta, aprovechable en scripts de revisión de partidas o en pipelines de anotación de bases de datos de ajedrez.
- Evaluación comparativa de motores: el modo `/?match=max` con Stockfish instalado permite disputar duelos automáticos con cinco segundos por movimiento, sirviendo como banco de pruebas para medir la fuerza relativa del modelo frente a un motor clásico.
- Entrenamiento de mates: la política resuelve mates en uno y en dos con tasas medidas (97/113 y 21/37), por lo que puede emplearse como generador de ejercicios de táctica o como validador de problemas de mate.
- Prototipado de motores neuronales ligeros: al ocupar 0,2 GB y 20,2 millones de parámetros, el checkpoint es viable como base para experimentos de fine-tuning o para estudiar el comportamiento de una red policy-value entrenada desde cero en un entorno de recursos limitados.
- Demostraciones educativas de ajedrez por computadora: el paquete incluye tablero, ilustraciones de piezas y pesos, lo que permite montar una sesión divulgativa sobre motores neuronales sin infraestructura adicional.

## Benchmarks y rendimiento

| Prueba | Arkon 0.1 Max | Arkon 0.1 Pro |
|---|---|---|
| Partidas ganadas (12 aperturas pareadas, colores invertidos) | 22 | no disponible (2 empates en el cómputo global) |
| Empates | 2 | no disponible |
| Mate en uno resuelto (política de primer movimiento) | 97 de 113 | 81 de 113 |
| Mate en dos resuelto (política de primer movimiento) | 21 de 37 | 10 de 37 |

Los resultados corresponden a la evaluación publicada por el autor y están acotados a ese protocolo concreto: misma búsqueda corta para ambos motores y aperturas pareadas con colores invertidos. No se han publicado resultados de benchmarks estándar de ajedrez (Elo, CCRL, TCEC) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 20,2 millones de parámetros en FP32 el checkpoint ronda los 80 MB de pesos, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican modelos concretos; el autor menciona que el modo `max` con búsqueda iterativa requiere una instalación de PyTorch con soporte CUDA.
- GPU de consumo: por tamaño, el modelo cabe con holgura en cualquier GPU de consumo moderna; no se publican requisitos mínimos ni pruebas por modelo.
- Despliegue: ejecución local con Python 3.10 o superior y dependencias del paquete; servidor HTTP local para el tablero; modo UCI mediante `python arkon.py uci`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el juego local funciona en CPU y los duelos con Stockfish usan cinco segundos por movimiento por defecto en modo `max`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arkon Engine 0.1 Max | 20.220.242 | no aplica | 22 victorias y 2 empates frente a Arkon 0.1 Pro; mates 97/113 y 21/37 | no disponible | Hugging Face, pesos safetensors y paquete de juego |
| Arkon Engine 0.1 Pro | no disponible | no aplica | 81/113 en mate en uno y 10/37 en mate en dos | no disponible | Referenciado en la model card de Max |
| Stockfish 18 | no disponible (motor clásico, no red neuronal publicada como checkpoint) | no aplica | Usado como fuente de etiquetas y como rival en duelos | no disponible en la información | Distribución oficial en stockfishchess.org |

La comparación con motores neuronales de ajedrez de referencia (por ejemplo, Leela Chess Zero o variantes tipo AlphaZero) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Fuerza limitada: el checkpoint liberado es el de la época 4 de 24, elegido por pérdida de validación; el resto del entrenamiento no se publicó, lo que sugiere que el modelo final puede estar por debajo de su techo de entrenamiento.
- Búsqueda corta: tanto el rival del navegador como el motor UCI usan una búsqueda corta; el modo `max` con profundidad iterativa requiere CUDA y Stockfish para los duelos, de modo que la fuerza observada depende en buena medida del buscador y no solo de la red.
- Resultados acotados: las cifras de mates y de duelos provienen de una evaluación con protocolo propio (aperturas pareadas, colores invertidos, mismo buscador); no equivalen a una clasificación Elo estándar ni a resultados de CCRL o TCEC.
- Sesgos: no se documentan sesgos de estilo de juego, preferencias de apertura ni comportamiento en finales; no hay información al respecto.
- Alucinación: no aplica en el sentido de generación de texto, pero la política puede seleccionar movimientos legales de calidad deficiente en posiciones fuera de la distribución de entrenamiento; no se publican análisis de calibración de la cabeza de valor.
- Cobertura de datos: el entrenamiento se limita a 600.000 posiciones etiquetadas por Stockfish 18 más mates generados; no se detalla la diversidad de aperturas, finales ni tipos de posición, lo que deja abierta la generalización fuera de ese conjunto.
- Licencia: no disponible; no puede confirmarse el uso comercial ni la redistribución de pesos, tablero o ilustraciones incluidos en el ZIP.
- Idiomas y contexto: no aplica, al no ser un modelo de lenguaje; no hay soporte multilingüe ni ventana de contexto textual.
- Dependencias: el juego local requiere Python 3.10 o superior y la instalación de `requirements.txt`; los duelos con Stockfish exigen una instalación aparte y la variable `ARKON_STOCKFISH` apuntando al ejecutable.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin señales de adopción por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Arkon-Engine-0.1-Max
- Pesos sueltos: https://huggingface.co/Convergent-ch/Arkon-Engine-0.1-Max/blob/main/arkon-0.1-max.safetensors
- Paquete de juego: https://huggingface.co/Convergent-ch/Arkon-Engine-0.1-Max/resolve/main/Arkon-Engine-0.1-Max-play.zip
- Evaluación: https://huggingface.co/Convergent-ch/Arkon-Engine-0.1-Max/blob/main/evaluation.json
- Informe de entrenamiento: https://huggingface.co/Convergent-ch/Arkon-Engine-0.1-Max/blob/main/training-report.json
- Stockfish (descarga): https://stockfishchess.org/download/
