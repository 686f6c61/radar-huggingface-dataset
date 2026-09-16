# CyanMonkey/Test-S1-No-SP

## Resumen

CyanMonkey/Test-S1-No-SP es un motor de ajedrez basado en una red neuronal convolucional de tipo ResNet, publicado por el usuario CyanMonkey en HuggingFace. No es un modelo de lenguaje: el modelo recibe una codificacion de una posicion de ajedrez (19 planos de 8x8) y produce dos salidas, una politica con 20480 logits de movimiento y una cabeza de valor que estima la probabilidad de victoria en el rango [-1, 1]. Su proposito es jugar al ajedrez y evaluar posiciones, no generar texto.

La red cuenta con 44.983.457 parametros (44,98 M) repartidos en un backbone ResNet de 10 bloques con 128 canales. El entrenamiento se realizo en dos fases: una primera fase de aprendizaje supervisado sobre partidas de Lichess de jugadores con 1800+ de Elo, y una segunda fase de aprendizaje por refuerzo mediante self-play. La licencia es MIT, lo que permite uso comercial sin restricciones practicas.

Su relevancia es la de un motor de ajedrez de tamano moderado, entrenado con un pipeline de RL y publicado con pesos en formato safetensors, lo que lo hace reutilizable para investigacion en reinforcement learning aplicado a juegos, para integrarlo en GUIs de ajedrez o como punto de partida para experimentos de self-play. El repositorio es muy reciente y, en la fecha de la informacion disponible, no acumula descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet convolucional con 10 bloques y 128 canales |
| Parametros totales | 44.983.457 (44,98 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada fija: 19 planos de 8x8) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors en la precision de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de ajedrez, sin capacidades de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de red residual (ResNet) con un backbone de 10 bloques de 128 canales, un diseno habitual en motores de ajedrez neuronales. La entrada es una representacion del tablero de 8x8 codificada en 19 planos: 12 planos de piezas (6 tipos por 2 colores), un plano de turno, planos de derechos de enroque, en passant y reloj de jugadas. La salida se divide en dos cabezas: una cabeza de politica que produce 20480 logits, correspondientes a un vocabulario de movimientos codificado mediante un indice plano de la forma (from_square * 64 + to_square) * 5 + promotion_type, y una cabeza de valor que devuelve una probabilidad de victoria acotada en [-1, 1].

El entrenamiento se documento en dos fases. La fase 1 consistio en aprendizaje supervisado sobre partidas de Lichess de jugadores con mas de 1800 de Elo, lo que aporta una base de comportamiento humano razonablemente fuerte. La fase 2 aplico aprendizaje por refuerzo mediante self-play, refinando la politica y el valor mas alla de la imitacion. No se especifican el numero total de tokens o posiciones de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas adicionales como DPO, decodificacion especulativa o atencion lineal; esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Evaluacion de posiciones de ajedrez: la cabeza de valor estima la probabilidad de victoria en [-1, 1] para la posicion de turno.
- Seleccion de movimientos: la cabeza de politica genera logits sobre 20480 movimientos legales codificados (incluyendo promociones).
- Juego completo de ajedrez: al combinar politica y valor puede jugar partidas, ya sea de forma directa o integrado en una busqueda (MCTS, alpha-beta con evaluacion neuronal).
- Codificacion completa de reglas: los 19 planos de entrada incluyen turno, enroques, en passant y reloj de jugadas, por lo que representa el estado normativo de la partida.
- Entrenamiento por refuerzo: el pipeline de self-play esta documentado, lo que permite continuar el entrenamiento o reproducir el ciclo de RL.
- No dispone de generacion de texto, razonamiento en lenguaje natural, codigo, vision, tool calling, soporte de agentes ni capacidades multilingues; estas funciones no aplican a un motor de ajedrez.

## Casos de uso

- Analisis de partidas: integrar el modelo en una GUI de ajedrez para evaluar posiciones y sugerir jugadas, apoyandose en la cabeza de valor para puntuar cada posicion y en la politica para proponer candidatas.
- Entrenamiento de jugadores: usar el motor como sparring de nivel cercano a 1800+ Elo (fase supervisada) con refuerzo posterior, util para jugadores intermedios que buscan un rival mas humano que un motor de maxima fuerza.
- Investigacion en reinforcement learning: el pipeline de dos fases (supervisado + self-play) sirve como banco de pruebas reproducible para estudiar tecnicas de RL en juegos de informacion perfecta.
- Bots para plataformas online: por su tamano reducido (44,98 M de parametros) puede ejecutarse en servidores modestos para gestionar partidas en Lichess, Chess.com o servidores propios mediante APIs.
- Generacion de datasets etiquetados: usar la cabeza de politica para producir movimientos candidatos y la de valor para etiquetar posiciones, generando datos sinteticos para entrenar otras redes o destilar conocimiento.
- Deteccion de errores y tutorizacion: comparar la jugada humana con la mejor jugada propuesta por la politica para senalar imprecisiones y explicar alternativas.
- Baselines en competiciones y benchmarks de ajedrez: emplear el modelo como referencia de rendimiento de una red ResNet 10x128 entrenada con RL frente a otros motores neuronales.
- Experimentos de fine-tuning: al estar publicado con licencia MIT y pesos safetensors, se puede reentrenar sobre un subconjunto de aperturas o estilos concretos sin restricciones legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye Elo estimado, resultados contra Stockfish, Leela Chess Zero u otros motores, ni metricas de precision de la politica o del valor. Tampoco los resultados de busqueda web aportan datos de rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los 44,98 M de parametros ocupan aproximadamente 180 MB; en FP16, unos 90 MB. Una unica inferencia de la red es muy ligera.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia directa; RTX 3060, RTX 4090, A100 o H100 sobran para este tamano de red y solo aportan ventaja por paralelismo por lotes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso puede ejecutarse en CPU para inferencia puntual.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors, el despliegue natural es mediante PyTorch o libtorch; tambien se puede exportar a ONNX o TorchScript. No aplican los servidores de LLM (vLLM, TGI, llama.cpp, Ollama) porque no es un transformer de lenguaje.
- Latencia y throughput: no disponibles. No se documentan tiempos de inferencia ni posiciones por segundo, ni con GPU ni con CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyanMonkey/Test-S1-No-SP | 44,98 M | ResNet 10x128 | 19 planos de 8x8, politica de 20480 movimientos + valor | MIT | HuggingFace (safetensors) |
| Leela Chess Zero (redes tipo ResNet) | varia segun la red (no disponible el detalle exacto) | ResNet convolucional con cabezas de politica y valor | Planos de tablero, MCTS en inferencia | Licencia del proyecto LCZero (no disponible el detalle exacto) | Proyecto abierto, pesos distribuidos por el equipo |
| Stockfish con NNUE | no disponible | Red neuronal eficiente (NNUE) sobre features de ajedrez | Features dispersas de la posicion | GPLv3 | Codigo abierto y binarios oficiales |
| Maia Chess | no disponible | Red neuronal orientada a prediccion de jugadas humanas | Codificacion de tablero | no disponible | Proyecto de investigacion en GitHub |

La comparacion cuantitativa de fuerza (Elo) no esta disponible para ninguno de los modelos en la informacion proporcionada. La diferencia principal es que este modelo es un motor entrenado con una combinacion de imitacion de partidas de 1800+ Elo y self-play, con licencia permisiva MIT, mientras que LCZero y Stockfish son proyectos de referencia con anos de desarrollo y ecosistemas de prueba consolidados.

## Limitaciones y advertencias

- Fuerza no verificada: no se publica Elo estimado ni resultados contra otros motores, por lo que se desconoce su nivel real de juego.
- Sesgo hacia el estilo humano: al entrenarse en fase supervisada con partidas de 1800+ Elo de Lichess, la politica puede reproducir errores y sesgos de ese segmento de jugadores en lugar de jugar de forma optima.
- Riesgo de alucinacion en el sentido de movimientos ilegales: la cabeza de politica produce logits sobre un vocabulario fijo; si no se aplica una mascara de legalidad, puede asignar probabilidad a movimientos ilegales. Es imprescindible filtrar por legalidad en produccion.
- Sin capacidad de lenguaje: no puede explicar jugadas en texto ni mantener conversaciones; requiere una capa externa para tutorizacion o analisis narrado.
- Datos de entrenamiento incompletos: no se detallan el volumen de posiciones, la composicion del dataset ni los hiperparametros, lo que dificulta reproducir o auditar el entrenamiento.
- Informacion del repositorio escasa: cero descargas y cero likes, sin documentacion adicional mas alla de la model card, lo que aumenta el riesgo de encontrar fallos no documentados.
- Licencia: MIT, permisiva para uso comercial, pero conviene verificar que los datos de Lichess utilizados en el entrenamiento no impongan condiciones adicionales.
- Sin benchmarks: no hay evidencia publica de calidad frente a alternativas, por lo que su adopcion en produccion deberia ir precedida de una evaluacion propia.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/CyanMonkey/Test-S1-No-SP
- No se han encontrado enlaces adicionales relevantes (papers, repositorios, blogs o demos) en la busqueda web realizada.
