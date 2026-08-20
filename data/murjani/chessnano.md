# Murjani/chessnano

## Resumen

ChessNano es un transformer autoregresivo compacto de 51,9 millones de parametros desarrollado por Kabir Murjani (investigador en cuantizacion de modelos e inferencia eficiente) que predice movimientos de ajedrez a partir de secuencias en notacion algebraica estandar (SAN). El modelo no recibe representacion del tablero ni funcion de evaluacion: solo ve la secuencia de movimientos y predice el siguiente, con los movimientos candidatos filtrados contra la lista de movimientos legales de python-chess para garantizar que nunca emite una jugada ilegal.

El modelo se entrena exclusivamente con partidas de Lichess de jugadores con mas de 2500 de Elo, comprimidas en un artefacto de menos de 60 MB con cuantizacion INT8. Su relevancia radica en demostrar que una arquitectura transformer de menos de 50 millones de parametros puede jugar al ajedrez de forma razonable con una huella de memoria minima, ejecutandose incluso en CPU sin GPU dedicada. El contexto es de 512 tokens, suficiente para secuencias de apertura y medio juego, aunque limitado para partidas completas.

La arquitectura utiliza attention grouped-query (GQA), posiciones RoPE, feedforward SwiGLU y normalizacion RMSNorm, con un vocabulario de 2048 tokens SAN. El checkpoint se distribuye bajo licencia MIT, tanto en version fp16 (102 MB) como cuantizada (58,4 MB), y el codigo de inferencia esta disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo con GQA (12 query heads / 4 KV heads, head dim 64), RoPE, SwiGLU, RMSNorm pre-norm sin bias |
| Parametros totales | 51,9 M |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | INT8 con rotacion Hadamard, sign bits empaquetados y embedding fp16 (TurboQuant) |
| Idiomas soportados | no disponible (vocabulario de 2048 tokens SAN, no idioma natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint `.pt` en fp16 y cuantizado) |

## Arquitectura y entrenamiento

ChessNano es un transformer autoregresivo de 8 capas con dimension de modelo 768 y feedforward SwiGLU de 2048 unidades ocultas. La atencion usa grouped-query attention con 12 cabezas de consulta y 4 de clave-valor, con dimension de cabeza 64, y posiciones codificadas mediante RoPE. La normalizacion es RMSNorm pre-norm sin bias. El vocabulario contiene 2048 tokens de SAN, que cubren los movimientos de ajedrez en notacion algebraica estandar.

El entrenamiento se realiza sobre secuencias de movimientos de partidas de Lichess de jugadores con mas de 2500 ELO, sin representacion del tablero ni funcion de evaluacion. La cuantizacion es simulada en el paso forward durante el entrenamiento: el camino TurboQuant aplica una rotacion Hadamard, cuantiza el angulo de cada par de coordenadas en 128 niveles y almacena un sketch residual de Johnson–Lindenstrauss de un bit escalado por el coeficiente de minimos cuadrados. La funcion de reconstruccion es compartida entre entrenamiento y exportacion, de modo que el cuantizador simulado coincide con el exportado.

## Capacidades

- Prediccion del siguiente movimiento en SAN a partir de una secuencia historica de jugadas.
- Filtrado de movimientos ilegales mediante integracion con `python-chess` (los candidatos se enmascaran contra la lista de movimientos legales antes del muestreo).
- Generacion de secuencias de aperturas y medio juego con contexto de hasta 512 tokens.
- Inferencia en CPU con el checkpoint cuantizado de 58,4 MB.
- Soporte de profundidad de arbol configurable (`TotConfig(depth=1)` en la inferencia) para variar la busqueda de movimientos.
- Sin capacidad de vision, audio ni procesamiento de lenguaje natural general; es un modelo de dominio unico.

## Casos de uso

- Motor de analisis para entrenamiento: el modelo puede sugerir movimientos en posiciones de apertura y medio juego a partir de la historia de partidas, ayudando a jugadores amateurs a estudiar patrones de jugadores de mas de 2500 ELO.
- Generacion de bases de aperturas: se puede usar para producir variantes de aperturas con contexto limitado, alimentando bases de datos de entrenamiento sin necesidad de un motor de ajedrez completo.
- Educacion en ajedrez: integrable en aplicaciones de aprendizaje que muestren movimientos sugeridos basados en la secuencia jugada, con la ventaja de que funciona en CPU y en dispositivos de bajo coste.
- Evaluacion rapida de partidas: dado un historial de movimientos, el modelo ofrece una prediccion inmediata del siguiente movimiento, util para herramientas de revision de partidas en tiempo real.
- Prueba de conceptos de cuantizacion: sirve como banco de pruebas para evaluar la calidad de la cuantizacion TurboQuant en un dominio con vocabulario reducido y tarea de clasificacion de secuencias.
- Desarrollo de agentes de ajedrez ligeros: el modelo puede integrarse en bots de ajedrez para plataformas de juego online donde se requiere una huella de memoria minima y sin GPU, como en servidores modestos o embebidos.
- Generacion de partidas sinteticas: a partir de una semilla de movimientos, puede generar continuaciones de partida para crear datasets de entrenamiento de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye elo estimado, tasa de exactitud de prediccion ni comparaciones con otros motores de ajedrez. El autor menciona que el modelo se entrena con partidas de mas de 2500 ELO, pero no hay metricas cuantitativas publicadas.

## Requisitos de hardware

- VRAM estimada: el checkpoint cuantizado de 58,4 MB cabe en cualquier GPU con al menos 1 GB de VRAM; el checkpoint fp16 de 102 MB requiere unos 128 MB de VRAM adicionales.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es suficiente; tambien funciona en CPU sin problemas.
- Compatibilidad con consumer GPU: si, el modelo esta disenado para caber en dispositivos de bajos recursos.
- Opciones de despliegue: inferencia directa con el codigo Python del repositorio (`tot_inference.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: no hay datos publicados, pero con 51,9 M de parametros y contexto de 512 tokens, la inferencia en CPU deberia ser de milisegundos por token; la cuantizacion INT8 reduce el ancho de banda de memoria y acelera el calculo en CPU.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada: ChessNano es un modelo de dominio unico para ajedrez con parametros muy reducidos, y no hay alternativas publicadas de tamano similar con la misma tarea especifica. Se podrian comparar con motores de ajedrez tradicionales (Stockfish, Leela Chess Zero), pero son arquitecturas y paradigmas distintos (busqueda arborescente y redes neuronales con evaluacion de posicion, respectivamente).

## Limitaciones y advertencias

- El modelo no tiene representacion del tablero ni funcion de evaluacion, por lo que su calidad de juego depende exclusivamente de los patrones estadisticos de la notacion; no entiende posiciones concretas.
- La ventana de contexto es de solo 512 tokens, insuficiente para partidas completas (una partida tipica tiene entre 40 y 80 movimientos, cada uno de 2-4 tokens).
- Entrenado unicamente en partidas de mas de 2500 ELO, lo que puede introducir sesgo hacia estilos de juego de alto nivel y variantes de apertura especificas.
- No se han publicado evaluaciones de exactitud ni elo, por lo que el rendimiento real frente a motores de ajedrez es desconocido.
- El vocabulario de 2048 tokens SAN puede no cubrir todas las notaciones posibles (por ejemplo, variantes de desambiguacion o anotaciones de jaque y mate).
- La cuantizacion INT8 con esquemas de reconstruccion complejos puede degradar la precision en comparacion con el checkpoint fp16, aunque no se aportan metricas.
- No tiene capacidad de procesamiento de lenguaje natural ni de vision; es exclusivamente para ajedrez.
- La licencia MIT permite uso comercial sin restricciones, pero el codigo de inferencia depende de `python-chess`, que tiene su propia licencia (GPLv3), lo que podria afectar a la distribucion de productos derivados.

## Enlaces

- HuggingFace: https://huggingface.co/Murjani/chessnano
- Codigo (GitHub): https://github.com/Kcbir/chessnano
- Blog del autor con detalles: https://www.kabir.codes/writing/chessnano
- Repositorio alternativo con README: https://github.com/Kcbir/r_chessnano
