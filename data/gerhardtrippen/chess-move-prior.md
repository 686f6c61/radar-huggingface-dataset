# GerhardTrippen/chess-move-prior

## Resumen

El modelo chess-move-prior, desarrollado por GerhardTrippen, es una red de política residual pequeña diseñada para predecir qué fracción de jugadores humanos de nivel club elegiría cada movimiento legal en una posición de ajedrez. Su propósito principal es servir como prior de movimiento humano dentro de Zugwise, una herramienta de digitalización de partidas que reconstruye planillas de ajedrez a partir de OCR de escritura manual. El modelo responde a la pregunta "¿qué escribió el jugador?" y no "¿qué debería haber jugado?", por lo que está optimizado para imitar el comportamiento de jugadores de club, no para encontrar la mejor jugada.

La arquitectura consta de 8 bloques residuales con 128 filtros cada uno, procesando 17 planos de entrada de 64 casillas (convención lc0/Maia) y produciendo logits sobre 4096 clases de movimiento (from*64 + to). El modelo fue entrenado con la base de datos abierta de Lichess (CC0) y se distribuye bajo licencia Apache 2.0 en formato ONNX. Su relevancia radica en ofrecer una alternativa de código abierto y permisiva a modelos como Maia, que tienen restricciones GPL, para tareas de reconstrucción de partidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red residual convolucional (8 bloques x 128 filtros) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 17x64 planos) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no aplica (modelo de ajedrez) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una red residual convolucional con 8 bloques de 128 filtros, similar a las redes de política utilizadas en motores de ajedrez como AlphaZero o Leela Chess Zero. La entrada consiste en 17 planos de 64 casillas que codifican la posición desde la perspectiva del jugador que tiene el turno: 6 planos para las piezas propias (peón, caballo, alfil, torre, dama, rey), 6 para las del oponente, 4 para los derechos de enroque (propios y del oponente, separados en corto y largo) y 1 para la casilla objetivo de en passant. El tablero se voltea para que el lado a mover siempre juegue hacia arriba, siguiendo la convención de lc0/Maia, lo que elimina la necesidad de un plano de lado a mover.

La salida son logits crudos sobre 4096 clases de movimiento (from*64 + to), que deben renormalizarse sobre los movimientos legales de la posición. El entrenamiento se realizó con la base de datos abierta de Lichess (CC0), sin utilizar pesos de Maia ni código cubierto por GPL. Una decisión de diseño notable es la ausencia de planos de historial: los autores midieron que Maia produce el mismo movimiento superior en 42 de 42 posiciones reales con y sin historial, por lo que se simplificó la entrada.

## Capacidades

- Predicción de la distribución de movimientos humanos de nivel club en posiciones de ajedrez.
- Generación de logits para 4096 movimientos posibles (from*64 + to), renormalizables sobre movimientos legales.
- Entrada de 17 planos con codificación completa de la posición (piezas, enroque, en passant).
- Diseñado específicamente para clasificar candidatos de OCR en reconstrucción de partidas, no para jugar al ajedrez.
- Modelo pequeño y rápido, adecuado para integración en aplicaciones de escritorio o web.
- Licencia Apache 2.0, lo que permite uso comercial sin restricciones de copyleft.

## Casos de uso

- Reconstrucción de planillas de ajedrez: el modelo se integra en Zugwise para desempatar entre candidatos de OCR de escritura manual. Dada una posición y varios movimientos posibles leídos por el OCR, el prior asigna una probabilidad a cada movimiento legal, ayudando a decidir cuál es el más probable que haya escrito el jugador.
- Análisis de partidas de club: puede usarse para estudiar qué movimientos son típicos en jugadores de nivel club, proporcionando una distribución de frecuencias para cada posición.
- Entrenamiento de modelos de comportamiento humano: sirve como base para investigaciones sobre predicción de movimientos humanos, similar a Maia pero con licencia permisiva.
- Herramientas educativas de ajedrez: puede mostrar a estudiantes qué movimientos son más comunes en su nivel, ayudando a entender expectativas humanas.
- Digitalización de archivos históricos: en bibliotecas o archivos con partidas manuscritas, el modelo puede asistir en la transcripción automática de planillas.
- Desarrollo de interfaces de ajedrez con entrada por escritura: aplicaciones que permiten anotar movimientos a mano pueden usar el prior para corregir errores de reconocimiento.

## Benchmarks y rendimiento

El modelo reporta un top-1 move match (acierto del movimiento más probable) de 0.4836 en datos de validación held-out. No se proporcionan más métricas en la información disponible.

| Metrica | Valor |
|---|---|
| Top-1 move match (held out) | 0.4836 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware. Por su tamaño (8 bloques x 128 filtros), se estima que puede ejecutarse en CPU sin problemas, con un consumo de VRAM inferior a 1 GB si se usa GPU.
- El formato ONNX permite inferencia con ONNX Runtime, tanto en CPU como en GPU.
- Puede desplegarse en aplicaciones web mediante ONNX Runtime Web o en backend con Python.
- No se requieren GPUs de alta gama; una CPU estándar es suficiente para inferencia en tiempo real.
- Latencia y throughput no disponibles, pero por el tamaño se espera que sea muy rápido.

## Comparativa con modelos similares

El modelo se compara naturalmente con Maia (y Maia-3), que también predicen movimientos humanos. Sin embargo, Maia tiene licencia GPL, mientras que este modelo es Apache 2.0. No se dispone de comparaciones cuantitativas directas.

| Modelo | Arquitectura | Parametros | Licencia | Top-1 match |
|---|---|---|---|---|
| chess-move-prior | CNN residual 8x128 | no disponible | Apache 2.0 | 0.4836 |
| Maia (v1) | CNN 8x128 | no disponible | GPL | no disponible |
| Maia-3 | Transformer (Chessformer) | no disponible | GPL | no disponible |

Nota: los datos de Maia son aproximados y no verificados en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para jugadores de nivel club; no es adecuado para predecir movimientos de maestros o principiantes.
- No debe usarse para jugar ajedrez: su propósito es clasificar candidatos OCR, no encontrar la mejor jugada.
- La salida son logits crudos; es necesario renormalizar sobre movimientos legales, lo que requiere un validador de legalidad externo.
- No se proporcionan datos sobre sesgos o alucinaciones, pero al ser un modelo de ajedrez, el riesgo de alucinación es bajo (solo produce distribuciones sobre movimientos).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco difundido.
- No se especifican requisitos de hardware ni se proporcionan benchmarks adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GerhardTrippen/chess-move-prior
- Repositorio de Zugwise: https://github.com/GerhardTrippen/Zugwise
- Página de modelos de GerhardTrippen: https://huggingface.co/GerhardTrippen/models
- Repositorio de Maia-3 (referencia): https://github.com/CSSLab/maia3
