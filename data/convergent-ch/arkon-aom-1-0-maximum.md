# Convergent-ch/Arkon-AoM-1.0-Maximum

## Resumen

Arkon-AoM 1.0 Maximum es un motor de ajedrez modular desarrollado por Convergent-ch, construido sobre el checkpoint congelado de la epoca seis de Arkon 1.0 Maximum. No es un modelo de lenguaje: es una red neuronal especializada en evaluacion de posiciones de ajedrez que combina una red base de 30.021.906 parametros con cabezas especialistas adicionales, y que utiliza una busqueda alfa-beta cronometrada para seleccionar el movimiento final. Su relevancia radica en la arquitectura de "especialistas enrutados": dos divisores de entrada dirigen cada posicion a diez roles especializados que comparten siete cabezas de ranking de movimientos (una por tipo de pieza mas una cabeza de jaque mate).

La red base se entreno desde cero con un corpus de 7.000.000 de posiciones distintas, divididas en 6.704.158 de entrenamiento y 295.842 de validacion. Las cabezas especialistas anaden 147.679 parametros entrenados con la red base congelada. El modelo se distribuye en formato safetensors junto con un paquete de juego local en Python que funciona en CPU y sin conexion una vez instaladas las dependencias.

El interes practico del modelo esta en su rendimiento estimado de 1.941 Elo en la escala de Stockfish limitada por fuerza (intervalo de confianza del 95%: 1.871-2.020) y en su ligereza: 30 millones de parametros y un repositorio de 0,2 GB lo hacen desplegable en hardware modesto. Es un caso de estudio de arquitectura modular aplicada a un dominio cerrado con reglas formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal modular con dos Input-Divisors, diez roles especializados y siete cabezas de ranking de movimientos compartidas; busqueda alfa-beta cronometrada sobre las propuestas |
| Parametros totales | 30.045.522 (30.021.906 red base + 147.679 cabezas especialistas; la suma reportada por el autor no cuadra exactamente con el total de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE en el sentido habitual; el enrutamiento es por especialistas de ajedrez) |
| Longitud de contexto | no aplica (entrada: posiciones de ajedrez, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (dominio de ajedrez) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, `specialists.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura combina una red base congelada (checkpoint de la epoca seis de Arkon 1.0 Maximum) con un sistema de enrutamiento denominado Input-Divisors que asigna cada posicion a uno de diez roles especialistas. Estos roles no tienen pesos independientes completos: comparten siete cabezas de ranking de movimientos, una por cada tipo de pieza mas una cabeza dedicada a detectar movimientos de mate. Sobre las propuestas de estas cabezas se ejecuta una busqueda alfa-beta con presupuesto temporal configurable, que es la que determina el movimiento definitivo. El tablero web muestra que especialistas contribuyeron a la ultima respuesta, lo que facilita la inspeccion del comportamiento del modelo.

El entrenamiento se realizo desde cero sobre 7.000.000 de posiciones distintas (6.704.158 de entrenamiento y 295.842 de validacion). Las cabezas especialistas se entrenaron en una segunda fase con la red base congelada, anadiendo 147.679 parametros. No se especifica en la informacion disponible si se emplearon tecnicas de RL, destilacion desde Stockfish ni el numero exacto de tokens o posiciones efectivas por epoca. Tampoco se detalla la composicion del corpus (partidas humanas, partidas de motor, posiciones sinteticas).

## Capacidades

- Evaluacion de posiciones de ajedrez y ranking de movimientos legales mediante siete cabezas especializadas por tipo de pieza.
- Deteccion de movimientos de mate mediante una cabeza dedicada.
- Enrutamiento de posiciones a diez roles especialistas mediante dos Input-Divisors.
- Busqueda alfa-beta cronometrada con presupuesto de tiempo configurable (`--search-seconds`).
- Juego completo como blancas en un tablero web local servido en `http://127.0.0.1:8806/`.
- Ejecucion en CPU y funcionamiento offline tras instalar dependencias.
- Trazabilidad de la contribucion de cada especialista a la ultima respuesta.
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues: es un motor de ajedrez de dominio cerrado.

## Casos de uso

- Analisis de posiciones en local: el modelo puede evaluar posiciones y proponer movimientos sin conexion, lo que resulta adecuado para entornos con requisitos de privacidad o sin red.
- Entrenamiento y estudio de ajedrez: con un rating estimado de 1.941 Elo permite a jugadores de nivel intermedio practicar contra un oponente de fuerza calibrada, ajustando el presupuesto de busqueda con `--search-seconds`.
- Investigacion sobre arquitecturas modulares: los dos Input-Divisors y los diez roles especialistas con cabezas compartidas ofrecen un banco de pruebas para estudiar enrutamiento y especializacion en dominios con reglas formales.
- Inspeccion de interpretabilidad: el tablero muestra que especialistas contribuyeron a cada respuesta, lo que facilita analizar como se descompone la decision entre tipos de pieza.
- Despliegue en hardware modesto: con 30 millones de parametros y 0,2 GB de repositorio, cabe en CPU y en GPU de consumo, lo que permite integrarlo en aplicaciones de escritorio o educativas.
- Benchmarking de motores ligeros: sirve como referencia para comparar motores neuronales de bajo coste computacional frente a Stockfish limitado por fuerza.
- Generacion de datasets de ajedrez etiquetados: las evaluaciones y rankings de movimientos pueden emplearse para anotar posiciones en pipelines de datos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Rating estimado | 1.941 Elo (escala Stockfish limitada por fuerza) |
| Intervalo de confianza 95% (bootstrap por pares de aperturas) | 1.871-2.020 |
| Partidas de calibracion | 48 partidas, presupuesto de 0,5 s por movimiento en CPU |
| Puntuacion en calibracion | 35,5/48 (31 victorias, 9 tablas, 8 derrotas) |
| Niveles de Stockfish empleados | 1.320, 1.600, 1.800 y 2.000 |
| Duelo contra Arkon 0.5 Max (GPU) | 19,5-4,5 (16 victorias, 7 tablas, 1 derrota) |
| Formato del duelo | 12 aperturas jugadas dos veces con colores intercambiados, 0,5 s por movimiento |

No se han publicado resultados de benchmarks estandar de ajedrez (por ejemplo, CCRL, TCEC o pruebas contra suites de posiciones) en la informacion disponible. Los tiempos individuales por movimiento no se registraron en el test de calibracion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 30 millones de parametros en precision completa el peso ronda los 120 MB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican; el paquete de juego oficial funciona en CPU. Cualquier GPU con soporte PyTorch (RTX 4090, A100, H100) puede ejecutar el modelo, pero no hay datos de rendimiento por GPU.
- CPU: el paquete incluido esta disenado para CPU y funciona offline; el test de calibracion se ejecuto en CPU con 0,5 s por movimiento.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual dada la huella de memoria del modelo.
- Opciones de despliegue: paquete Python propio (`play_aom.py`) con servidor web local en el puerto 8806; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un motor de ajedrez).
- Latencia y throughput: presupuesto de busqueda configurable de 0,5 s por movimiento en los tests; no se publican medidas de throughput ni latencia por batch.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Rating | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arkon-AoM 1.0 Maximum | 30.045.522 | Red modular + alfa-beta | 1.941 Elo estimado | no disponible | Hugging Face (safetensors + paquete de juego) |
| Arkon 0.5 Max | no disponible | Red neuronal + busqueda | inferior (perdio 19,5-4,5 en duelo GPU) | no disponible | no disponible en la informacion |
| Arkon 1.0 Maximum | no disponible | Red neuronal base (checkpoint congelado) | no disponible | no disponible | referenciado como base del modelo |
| Stockfish (niveles 1.320-2.000) | no aplica (motor clasico) | Alfa-beta con evaluacion handcrafted/NNUE | 1.320-2.000 (limitado por fuerza) | GPLv3 | Ampliamente disponible |

No se dispone de datos publicos de otros motores neuronales ligeros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo ni de los pesos, lo que impide confirmar si el uso comercial esta permitido.
- Rating estimado, no certificado: los 1.941 Elo proceden de una calibracion interna con 48 partidas e intervalo de confianza amplio (1.871-2.020); no hay validacion en listas independientes como CCRL.
- Corpus de entrenamiento no detallado: se desconoce la composicion (partidas humanas, de motor o sinteticas), lo que limita evaluar sesgos o puntos ciegos en fases concretas del juego.
- Dominio cerrado: no es un modelo de lenguaje ni admite otras tareas; cualquier uso fuera del ajedrez carece de sentido.
- Dependencia de la busqueda: la fuerza final depende del presupuesto de alfa-beta; con tiempos muy bajos el rendimiento puede degradarse respecto al rating reportado.
- Riesgo de alucinacion en el sentido de movimientos ilegales: las cabezas proponen movimientos que la busqueda debe validar; no se documenta el manejo de posiciones ilegales o tableros corruptos.
- Sin datos de cuantizacion ni de despliegue en otros runtimes: la integracion en produccion requeriria trabajo adicional de empaquetado.
- Los graficos de piezas tienen autoría de Alexis Luengas y licencia propia incluida en `pieces/`; su reutilizacion esta sujeta a esa licencia separada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Arkon-AoM-1.0-Maximum
- Paquete de juego completo: https://huggingface.co/Convergent-ch/Arkon-AoM-1.0-Maximum/resolve/main/Arkon-AoM-1.0-Maximum-play.zip
- Informe de rating: `./rating.json` (referenciado en la model card)
- Informe del duelo contra Arkon 0.5 Max: `./duel-vs-max05.json` (referenciado en la model card)
- Pesos de la red base: `model.safetensors` (en el repositorio)
- Cabezas especialistas: `specialists.safetensors` (en el repositorio)
