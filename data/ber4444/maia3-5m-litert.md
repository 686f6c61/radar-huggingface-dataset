# ber4444/maia3-5m-litert

## Resumen

Maia-3 5M es un modelo neuronal de predicción de jugadas de ajedrez desarrollado por el CSSLab de la Universidad de Toronto. A diferencia de los motores de ajedrez tradicionales, que buscan la jugada objetivamente mejor, Maia-3 predice la jugada que jugaría un humano de un nivel Elo determinado, lo que lo convierte en una herramienta útil para entrenamiento, análisis de estilo de juego y modelado del comportamiento humano en ajedrez. El modelo base contiene 5 millones de parámetros y recibe como entrada una representación del tablero junto con el Elo del jugador y el del oponente.

La ficha que nos ocupa, `ber4444/maia3-5m-litert`, no es un modelo nuevo ni un reentrenamiento: es una conversión del checkpoint original `UofTCSSLab/Maia3-5M` al formato LiteRT (TensorFlow Lite) para su despliegue en dispositivos móviles y web. El autor de la conversión es ber4444, y el archivo resultante se utiliza en las builds web, Android e iOS de la aplicación `compose-multiplatform-chess`.

La relevancia de esta conversión es práctica: permite ejecutar un modelo de predicción de jugadas humanas en entornos con recursos limitados (navegador, móvil) sin necesidad de infraestructura de servidor. El archivo `.tflite` ocupa 20,8 MB y mantiene una equivalencia numérica con el modelo PyTorch original dentro de una tolerancia de 9,5e-06 en las posiciones de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para predicción de jugadas de ajedrez (detalles internos de capas no disponibles en la información proporcionada) |
| Parametros totales | 5 millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada fija de tablero: `[1, 64, 97]`) |
| Tipos de cuantizacion | no disponible (el archivo `.tflite` se distribuye sin especificar cuantización; el tamaño de 20,8 MB sugiere pesos en float32 o similar) |
| Idiomas soportados | no aplica (modelo específico de ajedrez, sin procesamiento de lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | LiteRT / TensorFlow Lite (`.tflite`); checkpoint original en PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base Maia-3 5M más allá de su naturaleza de red neuronal para predicción de jugadas. La entrada del modelo convertido es un tensor `args_0` de forma `[1, 64, 97]` en float32, que codifica ocho tableros one-hot de 12 planos cada uno (el más antiguo primero, cada uno reflejado e intercambiando colores cuando juegan las negras) más una columna de reloj a cero. Adicionalmente recibe `args_1` (Elo propio) y `args_2` (Elo del oponente) como enteros de 32 bits. La salida es `output_0`, un tensor de logits de jugada de forma `[1, 4352]`, donde los índices 0–4095 corresponden a `from * 64 + to` y los índices 4096–4351 a promociones.

El proceso de conversión a LiteRT, realizado con `litert-torch 0.10.0` sobre torch 2.14.1 y jax/jaxlib 0.11.2, no añade datos de entrenamiento ni modifica los pesos aprendidos. El único cambio en el grafo es la reescritura de `torch.nn.RMSNorm` como `x * rsqrt(mean(x²) + eps) * weight` con el epsilon por defecto de torch. La conversión es determinista y reproducible byte a byte. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o posiciones utilizadas, ni sobre si se empleó RLHF/DPO u otras técnicas de alineación.

## Capacidades

- Predicción de la jugada que jugaría un humano de un nivel Elo dado, condicionada por el Elo del jugador y el del oponente.
- Codificación de historial de tablero: la entrada incluye ocho posiciones (el tablero actual y siete anteriores), lo que permite al modelo considerar contexto de secuencia de jugadas.
- Manejo de promociones de peón: la salida cubre las 4096 jugadas de origen-destino más 256 promociones (dama, torre, alfil, caballo).
- Inferencia en dispositivos móviles y navegador gracias al formato LiteRT.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: es un modelo especializado exclusivamente en ajedrez.
- No dispone de modo thinking, visión, audio ni otras capacidades generales.

## Casos de uso

- Aplicaciones móviles de ajedrez: integración en apps Android e iOS para predecir jugadas humanas y ofrecer análisis de estilo, como hace `compose-multiplatform-chess` empaquetando el archivo `.tflite`.
- Entrenamiento personalizado: un jugador puede comparar sus jugadas con las que Maia-3 predice para su nivel Elo y detectar desviaciones sistemáticas de su estilo.
- Análisis de partidas por nivel: estudiar qué jugadas son típicas de rangos Elo concretos para preparar repertorios o materiales didácticos adaptados a cada nivel.
- Simulación de oponentes humanos: generar jugadas plausibles de un rival de Elo conocido para practicar o para pruebas de motores.
- Investigación en comportamiento ajedrecístico: modelar la toma de decisiones humana y comparar con motores objetivos como Stockfish.
- Despliegue web sin servidor: ejecutar el modelo en el navegador mediante LiteRT, eliminando costes de inferencia en la nube y permitiendo funcionamiento offline.
- Aplicaciones educativas de ajedrez: mostrar alternativas realistas a la jugada óptima para explicar por qué un humano de cierto nivel elige una jugada concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo `.tflite` ocupa 20,8 MB y el modelo tiene 5 millones de parámetros, por lo que la huella de memoria es mínima.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para ejecución en CPU de dispositivos móviles y navegador mediante LiteRT.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en hardware móvil convencional; también en CPU sin aceleración.
- Opciones de despliegue: LiteRT / TensorFlow Lite (formato nativo del archivo), con integración en apps Android, iOS y web. El checkpoint original en PyTorch puede ejecutarse con torch.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maia-3 5M (LiteRT, esta ficha) | 5 M | Entrada fija de tablero `[1, 64, 97]` | `.tflite` | AGPL-3.0 | Hugging Face (este repo) |
| Maia-3 5M (original) | 5 M | Entrada fija de tablero | PyTorch `.pt` | AGPL-3.0 | Hugging Face (`UofTCSSLab/Maia3-5M`) |
| Motores de ajedrez clásicos (p. ej. Stockfish) | no disponible | no aplica | binario nativo | GPL | Amplia |

La comparación con modelos de lenguaje no es aplicable: Maia-3 es un modelo especializado de predicción de jugadas, no un modelo generativo de texto. No se dispone de información sobre otras variantes de Maia-3 (tamaños mayores) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ajedrez; no es un modelo de lenguaje y no puede usarse para tareas de texto, código o razonamiento general.
- La licencia AGPL-3.0 impone obligaciones copyleft fuertes: el uso en servicios en red puede requerir la publicación del código fuente modificado. Es necesario revisar los términos antes de un uso comercial.
- La conversión no añade datos ni modifica pesos, pero cualquier cambio en el grafo (como la reescritura de RMSNorm) debe validarse numéricamente; la tolerancia reportada es de 9,5e-06 en posiciones de referencia, no en todas las posiciones posibles.
- No se dispone de información sobre sesgos del modelo base, tasas de alucinación (en el sentido de predicciones poco realistas) ni limitaciones de generalización por nivel Elo.
- El modelo depende de la codificación exacta de entrada (ocho tableros one-hot, reflejados e intercambiados según el turno); un error en el preprocesado invalida las predicciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que puede indicar que los archivos aún no están completamente subidos o indexados; conviene verificar la integridad del archivo antes de usarlo en producción.
- No hay información sobre el rendimiento del modelo en dispositivos de gama baja ni sobre latencias reales en navegador.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/ber4444/maia3-5m-litert
- Modelo base Maia-3 5M: https://huggingface.co/UofTCSSLab/Maia3-5M
- Código de Maia-3 (CSSLab): https://github.com/CSSLab/maia3
- Aplicación compose-multiplatform-chess: https://github.com/ber4444/compose-multiplatform-chess
- Script de exportación LiteRT: https://github.com/ber4444/compose-multiplatform-chess/tree/main/tools/maia3
