# FlappingChance/kings-vision-models

## Resumen

King's Vision es un conjunto de modelos ONNX desarrollados por FlappingChance para el proyecto King's Vision (https://github.com/RyanMatthew04/kings-vision). El paquete incluye cinco generadores DCGAN de posiciones de jaque mate (uno por pieza que da mate: dama, torre, alfil, caballo y peón) y un clasificador de casillas de tablero que convierte una imagen de un tablero de ajedrez en una notación FEN. Cada generador está emparejado con un agente de Cross-Entropy Method (CEM) que optimiza la distribución latente para producir posiciones legales de mate en uno.

El modelo resuelve el problema de generar automáticamente puzzles de ajedrez de entrenamiento sin depender de bases de datos curadas. Su relevancia actual radica en que todos los artefactos se ejecutan exclusivamente con onnxruntime, sin necesidad de frameworks pesados como TensorFlow o PyTorch, lo que facilita su integración en aplicaciones ligeras. El tamaño total del repositorio es de 0,1 GB, con generadores de 20,8 MB cada uno y agentes CEM de 8,8 KB. La arquitectura es una DCGAN con entrada latente de 100 dimensiones y salida de un tensor 8×8×13 que codifica el tablero. No se trata de un modelo de lenguaje, por lo que no tiene longitud de contexto ni capacidades de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DCGAN (generador) + agentes CEM (Cross-Entropy Method) |
| Parametros totales | 5.193.997 por generador (×5 generadores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18, float32) |

## Arquitectura y entrenamiento

El generador de cada mate type es una DCGAN con la siguiente estructura: entrada latente de 100 dimensiones → capa densa de 32.768 unidades → reshape a (8, 8, 512) → cuatro bloques Conv2DTranspose (256 → 128 → 64 → 32 canales, stride 1, padding "same", kernels 3/3/5/5), cada uno con LeakyReLU(0,2) y normalización por lotes → capa Conv2D de 13 canales con kernel 7 → softmax sobre el eje de canales. La salida es un tensor 8×8×13 donde el canal 0 representa casilla vacía, los canales 1–6 corresponden a piezas blancas (peón, caballo, alfil, torre, dama, rey) y los canales 7–12 a piezas negras. La decodificación se realiza mediante argmax por casilla.

El entrenamiento original utilizó posiciones de jaque mate extraídas de archivos PGN de Lichess, divididas por pieza que da mate en cinco conjuntos de datos. Sin embargo, los datos de entrenamiento ya no existen: ni el CSV intermedio ni el script de extracción sobrevivieron en el historial del repositorio. El entrenamiento se realizó durante 10.000 épocas con batch size 128 y optimizador Adam, completándose en aproximadamente 67 minutos en CPU. El discriminador se estabilizó en una precisión del 46–50%, cerca del equilibrio adversarial saludable, tras un periodo inestable en las primeras ~800 épocas.

Los agentes CEM consisten en cinco gaussianas sobre la entrada latente de 100 dimensiones del generador, entrenados mediante Cross-Entropy Method con una recompensa binaria (¿es un jaque mate legal?) y una penalización por repetir posiciones. Los pesos del generador permanecen congelados; solo se optimiza la distribución de entrada, lo que explica el pequeño tamaño de los agentes (8,8 KB). Un agente (el de dama) presenta un modo colapsado con peso 2×10⁻¹⁴, detectable mediante la función `MultiModalCEM.collapsed_modes`.

## Capacidades

- Generación de posiciones de jaque mate legales en formato de tablero 8×8, codificadas como tensor de 13 canales.
- Generación de puzzles de mate en uno mediante reconstrucción hacia atrás: el módulo `kings_vision.puzzles.backtrack` retrocede una jugada y verifica la unicidad de la solución.
- Clasificación de casillas de tablero a partir de imágenes, convirtiendo la imagen en notación FEN (el clasificador comparte la misma codificación de 13 canales).
- Los cinco generadores cubren mates por dama, torre, alfil, caballo y peón.
- Los agentes CEM permiten dirigir la generación hacia posiciones válidas, mejorando la tasa de validez desde ~50% hasta ~83% de media.
- Ejecución exclusiva con onnxruntime, sin dependencias de frameworks de deep learning.
- No incluye capacidades de tool calling, agentes conversacionales, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Generación de puzzles de entrenamiento para jugadores de ajedrez: el modelo produce posiciones de mate en uno que pueden integrarse en aplicaciones de práctica táctica. Su ventaja es que genera posiciones sintéticas sin necesidad de descargar bases de datos externas, aunque la dificultad no está calibrada.
- Aumento de datasets de puzzles: combinando la salida de los cinco generadores, se pueden crear conjuntos de entrenamiento a gran escala para sistemas de tutoría ajedrecística, filtrando por validez y unicidad con el módulo de backtracking.
- Verificación de posiciones de ajedrez en imágenes: el clasificador de tablero puede usarse en aplicaciones de análisis de partidas, convirtiendo fotografías de tableros físicos en FEN para su posterior procesamiento.
- Prototipado rápido de herramientas de visión ajedrecística: al ser modelos ONNX ligeros, pueden desplegarse en entornos con recursos limitados (Raspberry Pi, móviles) para reconocimiento de tableros en tiempo real.
- Investigación en generación adversarial para dominios estructurados: la combinación DCGAN + CEM sirve como caso de estudio de cómo dirigir la generación hacia outputs válidos mediante optimización de la distribución latente, aplicable a otros dominios con restricciones formales.
- Evaluación de técnicas de control de generación: los agentes CEM demuestran un trade-off entre validez y diversidad, útil para experimentos sobre métodos de muestreo condicionado en modelos generativos.

## Benchmarks y rendimiento

La evaluación se realizó con 1.000 muestras por tipo de mate (semilla 0), usando intervalos de Wilson para la validez e intervalos bootstrap para la unicidad. Los resultados se muestran en la siguiente tabla:

| Mate type | Valid, raw | Valid, + CEM | Δ | Unique, raw | Unique, + CEM | Δ | Puzzle yield |
|---|--:|--:|--:|--:|--:|--:|--:|
| Queen | 47,4% | 88,2% | +40,8 | 100,0% | 50,8% | −49,2 | 83,6% |
| Rook | 62,1% | 77,6% | +15,5 | 100,0% | 73,7% | −26,3 | 73,6% |
| Bishop | 40,8% | 73,6% | +32,8 | 99,3% | 62,6% | −36,6 | 72,5% |
| Knight | 53,4% | 93,9% | +40,5 | 100,0% | 73,1% | −26,9 | 93,7% |
| Pawn | 46,9% | 82,7% | +35,8 | 99,8% | 74,8% | −24,9 | 27,5% |
| **Media** | **50,1%** | **83,2%** | **+33,1** | **99,8%** | **67,0%** | **−32,8** | **70,2%** |

"Valid" indica la fracción de muestras que son posiciones legales con jaque mate real para el bando al que le toca mover. "Unique" es la fracción de muestras distintas entre las válidas. "Puzzle yield" es la fracción de todas las muestras que se convierten en un mate en uno con exactamente una solución. No se han publicado resultados comparativos con otros modelos de generación de puzzles.

## Requisitos de hardware

- Inferencia en CPU: los generadores pesan 20,8 MB cada uno y los agentes CEM 8,8 KB, por lo que la inferencia es viable en cualquier CPU moderna. El entrenamiento original tardó ~67 minutos en CPU, lo que indica que la inferencia es rápida (milisegundos por muestra).
- Memoria: el uso de VRAM es despreciable; los modelos cargan completamente en RAM (menos de 30 MB por generador). No se requieren GPUs.
- GPUs recomendadas: no necesario. Si se desea acelerar, cualquier GPU con soporte ONNX Runtime (por ejemplo, NVIDIA con CUDA) funcionará, pero no hay requisitos mínimos documentados.
- Opciones de despliegue: onnxruntime (Python, C++, C#), compatible con servidores de inferencia como ONNX Runtime Server o integrable en aplicaciones edge.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño reducido y la arquitectura convolucional, se espera una latencia inferior a 10 ms por muestra en CPU moderna y throughput de cientos de muestras por segundo.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible. La categoría de generadores de puzzles de ajedrez mediante GAN es poco común; las alternativas típicas son bases de datos curadas como el dataset de puzzles de Lichess, que no son modelos generativos. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Los datos de entrenamiento originales ya no existen, por lo que los pesos no son reproducibles a partir del repositorio. La pipeline en `ml/data/` reconstruye el método, no el dataset exacto.
- Diversidad limitada: el uso de agentes CEM aumenta la validez pero reduce la diversidad de las posiciones generadas. El trade-off es aproximadamente uno por uno. Para máxima variedad, se recomienda muestrear sin CEM y filtrar, aceptando una tasa de rechazo del ~50%.
- Los puzzles generados son mates sin captura: la reconstrucción hacia atrás solo mueve una pieza a una casilla vacía, por lo que los mates con captura no son alcanzables. Los mates descubiertos y de promoción sí son posibles.
- Sin calibración de dificultad: todos los puzzles son mate en uno, pero la dificultad percibida varía ampliamente y no se ajusta a niveles humanos.
- El rendimiento del generador de peones es notablemente inferior en "puzzle yield" (27,5%) en comparación con otros tipos, debido a las pocas casillas de origen posibles para un peón.
- Un agente CEM (dama) tiene un modo colapsado con peso 2×10⁻¹⁴, lo que puede afectar a la diversidad de las muestras de ese tipo.
- Los modelos no juegan al ajedrez, no evalúan posiciones ni tienen noción de partida; solo muestrean de una distribución sobre estados de tablero con forma de jaque mate.
- No se dispone de información sobre sesgos específicos, riesgos de alucinación (no aplica a modelos generativos de imágenes) ni restricciones adicionales más allá de la licencia MIT.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/FlappingChance/kings-vision-models
- Repositorio del proyecto King's Vision: https://github.com/RyanMatthew04/kings-vision
- Issues del proyecto: https://github.com/RyanMatthew04/kings-vision/issues
- Leaderboard de visión de Arena (contexto general, no específico del modelo): https://arena.ai/leaderboard/vision
