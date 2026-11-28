# Convergent-ch/Arkonium-1.6-Lite

## Resumen

Arkonium 1.6-Lite es una red neuronal para ajedrez desarrollada por Convergent, pensada como el miembro ligero de la familia Arkonium 1.6. Se trata de un motor de ajedrez completo que combina una red ResNet con atención squeeze-and-excitation y una búsqueda PUCT Monte Carlo Tree Search (MCTS). Con 3.655.753 parámetros (unos 7 veces menos que Arkonium 0.9), el modelo está diseñado para funcionar en hardware modesto, incluida la CPU, donde alcanza unas 721 visitas por segundo frente a las 139 de su hermano mayor.

El modelo resuelve el problema de disponer de un motor de ajedrez competitivo en equipos sin GPU dedicada. Fue entrenado desde cero (inicialización aleatoria) sobre 55,4 millones de posiciones de Lichess con evaluaciones de Stockfish, en una sola pasada de datos y en aproximadamente una hora sobre una RTX 3060 Ti. La red produce una política sobre 4.168 movimientos legales (incluidas las subpromociones) y un valor escalar que representa la puntuación esperada mediante `tanh(logit / 2)`.

Su relevancia radica en la relación entre coste computacional y fuerza de juego: con un fichero de pesos de solo 14,7 MB en safetensors, ofrece una estimación de unos 2790 Elo en la escala `UCI_Elo` de Stockfish 18 a 0,5 s por jugada. No obstante, esa cifra es una estimación derivada de enfrentamientos contra Arkonium 0.9, no una medición directa contra Stockfish, y en igualdad de tiempo en GPU resulta claramente inferior a su hermano mayor (unas 120-123 unidades Elo por debajo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet con squeeze-and-excitation, cabeza de política con atención from-to y cabeza de valor; búsqueda PUCT MCTS |
| Parametros totales | 3.655.753 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada de 18 planos 8x8) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo específico de ajedrez, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (14,7 MB) |

## Arquitectura y entrenamiento

La red es un ResNet de 10 bloques residuales con 128 canales, equipado con módulos squeeze-and-excitation. La entrada son 18 planos de 8x8 desde la perspectiva del bando que mueve. La cabeza de política emplea atención from-to y emite 4.168 logits de movimiento (incluidas las subpromociones); la cabeza de valor produce un logit cuyo `tanh(logit / 2)` da la puntuación esperada. Sobre esta red se ejecuta una búsqueda PUCT Monte Carlo Tree Search, con una versión del motor Arkonium 1.6 que solapa la evaluación en GPU de un lote con la selección del siguiente lote en CPU, lo que aporta unas 1,5 veces más visitas por segundo que el motor de Arkonium 0.9.

El entrenamiento partió de inicialización aleatoria y usó el mismo conjunto de 55,4 millones de posiciones de Lichess con evaluaciones de Stockfish que Arkonium 0.9 (dataset `Lichess/chess-position-evaluations`, fragmentos 0, 6 y 13, CC0). El objetivo de política son los movimientos candidatos de Stockfish ponderados por su diferencia de evaluación, y el objetivo de valor es la puntuación esperada de la mejor línea. Se realizaron 53.710 pasos de 1.024 posiciones (55,0 millones de posiciones, aproximadamente una pasada sobre los datos) con AdamW, tasa de aprendizaje 2e-3 con warmup y decaimiento lineal final, en una RTX 3060 Ti durante cerca de una hora.

## Capacidades

- Evaluación de posiciones de ajedrez mediante una cabeza de valor que estima la puntuación esperada.
- Generación de movimientos legales mediante una cabeza de política sobre 4.168 logits, incluidas subpromociones.
- Búsqueda PUCT MCTS para seleccionar jugadas, con soporte de límite por visitas o por tiempo.
- Interfaz UCI para integración en GUI y gestores de torneos de ajedrez.
- Ejecución en CPU viable, con unas 721 visitas por segundo en 8 hilos.
- No dispone de tool calling, capacidades de agente, multilingüismo ni procesamiento de visión o audio.

## Casos de uso

- Análisis de partidas en equipos sin GPU: el motor puede ejecutarse en CPU a unas 721 visitas por segundo, suficiente para revisar partidas y señalar errores tácticos con una fuerza estimada cercana a 2790 Elo.
- Entrenamiento de jugadores de club: con límites de tiempo cortos y en hardware doméstico, permite practicar contra un rival de nivel avanzado sin depender de servicios en la nube.
- Integración en GUI de ajedrez mediante UCI: al exponer la interfaz estándar, se puede cargar en Arena, CuteChess o similar para torneos locales y análisis interactivo.
- Motor embebido en aplicaciones de ajedrez para móvil o escritorio: el fichero de pesos de 14,7 MB y la ejecución en CPU facilitan su inclusión en apps con recursos limitados.
- Generación de datos de entrenamiento y etiquetado de posiciones: la cabeza de política y la de valor permiten producir anotaciones de movimientos y evaluaciones para pipelines de aprendizaje por refuerzo.
- Investigación en búsqueda MCTS aplicada a ajedrez: al ser un modelo pequeño y de entrenamiento reproducible en una sola GPU, sirve como banco de pruebas para experimentos de búsqueda y arquitectura.
- Resolución de puzzles tácticos: con 400 visitas alcanza 771 de 1.050 puzzles en el conjunto de evaluación del autor, útil para generar ejercicios calibrados por dificultad.

## Benchmarks y rendimiento

Posiciones reservadas (200.000 no vistas en entrenamiento):

| Metrica | Arkonium 1.6-Lite | Arkonium 0.9 |
|---|---:|---:|
| Top-1 (coincide con el mejor movimiento de Stockfish) | 48,96 % | 51,82 % |
| Error de valor (MSE) | 0,0477 | 0,0387 |
| Entropía cruzada de política | 1,6598 | 1,5635 |

Enfrentamiento directo contra Arkonium 0.9:

| Condicion | Partidas | Victorias Lite | Tablas | Derrotas Lite | Puntuacion | Diferencia Elo (IC 95 %) |
|---|---:|---:|---:|---:|---:|---:|
| 400 visitas por jugada | 59 | 3 | 33 | 23 | 19,5 : 39,5 | -123 (-187 a -66) |
| 0,5 s por jugada | 60 | 9 | 22 | 29 | 20 : 40 | -120 (-207 a -53) |

Velocidad de búsqueda (visitas por segundo, media de tres posiciones tras 3 s):

| Motor | RTX 3060 Ti | CPU (8 hilos) |
|---|---:|---:|
| Arkonium 1.6-Lite con motor Arkonium 1.6 | 3.527 | 721 |
| Arkonium 0.9 con motor Arkonium 1.6 | 3.386 | 139 |
| Arkonium 0.9 con motor Arkonium 0.9 (original) | 2.058 | No disponible |

Puzzles de Lichess (1.050 en total, 150 por banda de 400 puntos):

| Banda de rating | Lite, solo red | Arkonium 0.9, solo red | Lite, 400 visitas | Arkonium 0.9, 400 visitas |
|---|---:|---:|---:|---:|
| 400-799 | 140/150 | 147/150 | 148/150 | 150/150 |
| 800-1199 | 126/150 | 133/150 | 146/150 | 149/150 |
| 1200-1599 | 103/150 | 116/150 | 137/150 | 147/150 |
| 1600-1999 | 86/150 | 96/150 | 134/150 | 147/150 |
| 2000-2399 | No disponible | No disponible | No disponible | No disponible |

Rating estimado: unos 2790 en la escala `UCI_Elo` de Stockfish 18 a 0,5 s por jugada, estimado a partir de la diferencia medida contra Arkonium 0.9 (2910, IC 95 % 2827-2990). No es una medición directa contra Stockfish ni un rating FIDE.

## Requisitos de hardware

- VRAM estimada: mínima; el fichero de pesos ocupa 14,7 MB, por lo que cabe en cualquier GPU con al menos unos pocos cientos de MB libres.
- GPU recomendadas: RTX 3060 Ti y superiores funcionan; el modelo no requiere GPU de gama alta. En GPU el rendimiento está limitado por el código de búsqueda más que por la red.
- CPU: viable como plataforma principal; alcanza 721 visitas por segundo con 8 hilos.
- Cabe en cualquier GPU de consumo; también funciona sin GPU.
- Opciones de despliegue: motor propio Arkonium 1.6 con interfaz UCI; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 3.527 visitas por segundo en RTX 3060 Ti y 721 en CPU de 8 hilos, medidos tras 3 segundos de búsqueda.

## Comparativa con modelos similares

| Modelo | Parametros | Bloques x canales | Peso en disco | Rating estimado (UCI_Elo, 0,5 s) | Licencia |
|---|---:|---|---:|---:|---|
| Arkonium 1.6-Lite | 3.655.753 | 10 x 128 | 14,7 MB | ~2790 (estimado) | Apache 2.0 |
| Arkonium 0.9 | 25.234.441 | 20 x 256 | 101 MB | 2910 (medido, IC 95 % 2827-2990) | Apache 2.0 |

No se dispone de datos de otros motores comparables en la información proporcionada.

## Limitaciones y advertencias

- El rating de ~2790 es una estimación derivada de enfrentamientos contra Arkonium 0.9, no una medición directa contra Stockfish; hereda la incertidumbre de ambas cifras.
- La estimación de rating corresponde a GPU con 0,5 s por jugada; en CPU la comparación cambia porque Lite es unas 5 veces más rápido que Arkonium 0.9.
- En igualdad de visitas y en igualdad de tiempo en GPU es claramente inferior a Arkonium 0.9 (unas 120-123 Elo por debajo), porque la red más pequeña evalúa peor las posiciones.
- Menor precisión en posiciones reservadas: 48,96 % de coincidencia top-1 frente a 51,82 % de Arkonium 0.9, y mayor error de valor (0,0477 frente a 0,0387).
- Rendimiento en puzzles inferior al de Arkonium 0.9 en todas las bandas evaluadas (771/1.050 frente a 874/1.050 con 400 visitas).
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- No se documentan sesgos específicos ni riesgos de alucinación en el sentido habitual; el riesgo se limita a errores de evaluación y de selección de jugadas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset de Lichess (CC0) si se redistribuyen datos derivados.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es 0,0 GB, lo que sugiere que los pesos podrían no estar publicados o que las métricas aún no se han actualizado.

## Enlaces

- Hugging Face: https://huggingface.co/Convergent-ch/Arkonium-1.6-Lite
- Arkonium 0.9 (modelo relacionado): https://huggingface.co/Convergent-ch/Arkonium-0.9
- Dataset de entrenamiento: https://huggingface.co/datasets/Lichess/chess-position-evaluations
