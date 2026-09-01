# rsu/Reversi-Transformer-1.6M_v2025-12-17

## Resumen

El modelo `rsu/Reversi-Transformer-1.6M_v2025-12-17` es un Transformer de pequeño tamaño (1,6 millones de parámetros) desarrollado por el usuario `rsu` y publicado en HuggingFace con licencia MIT. Está diseñado específicamente para jugar al juego de mesa Reversi (también conocido como Othello), y forma parte del proyecto ReversiGPT, que explora el uso de arquitecturas Transformer para la toma de decisiones en juegos de tablero.

A diferencia de los modelos de lenguaje de gran escala, este modelo no procesa texto, sino representaciones del tablero de Reversi y produce movimientos válidos. Su reducido tamaño lo hace extremadamente ligero, ejecutable incluso en CPU, y lo convierte en un ejemplo interesante para estudiar cómo los Transformers pueden aprender estrategias de juego con recursos mínimos. La información pública disponible es muy escasa: la model card solo contiene la licencia, y no se han publicado detalles sobre arquitectura interna, datos de entrenamiento o rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (sin detalles adicionales) |
| Parametros totales | 1,6 millones (según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer, como indica el nombre del modelo, pero no se han publicado detalles sobre el número de capas, cabezas de atención, dimensión de los embeddings ni el mecanismo de codificación del tablero. El proyecto ReversiGPT en GitHub incluye un script `transformer_TF.py` que sugiere una implementación en TensorFlow, aunque no se confirma si este modelo concreto usa ese código.

No hay información pública sobre el proceso de entrenamiento: ni el número de partidas jugadas, ni el método (aprendizaje por refuerzo, auto-juego, supervisado, etc.), ni la composición de los datos. Dado el tamaño del modelo, es probable que se haya entrenado con un enfoque de auto-juego o con datos generados sintéticamente, pero esto es una inferencia y no un dato verificado.

## Capacidades

- Jugar a Reversi: el modelo recibe una representación del tablero y devuelve un movimiento legal.
- No es un modelo de lenguaje: no genera texto, no comprende instrucciones en lenguaje natural ni mantiene conversaciones.
- No tiene capacidades de tool calling, agentes, visión ni audio.
- Su capacidad de razonamiento se limita a la estrategia del juego Reversi; no generaliza a otras tareas.

## Casos de uso

- Motor de juego para Reversi: puede integrarse en una aplicación de escritorio o web para jugar contra un humano o contra otro bot, proporcionando una IA ligera que no requiere GPU.
- Investigación en aprendizaje por refuerzo: sirve como banco de pruebas para estudiar cómo los Transformers pequeños aprenden políticas de juego, comparando con redes convolucionales o LSTM.
- Enseñanza de IA: al ser tan pequeño y con licencia MIT, es útil en cursos o talleres para ilustrar el entrenamiento de modelos de decisión sin necesidad de infraestructura costosa.
- Desarrollo de agentes para juegos de mesa: puede servir como punto de partida para experimentar con variantes de Reversi o tableros de diferentes tamaños.
- Benchmark de eficiencia: al tener solo 1,6M de parámetros, se puede usar para medir el rendimiento de frameworks de inferencia en CPU o dispositivos embebidos.
- Estudio de representaciones internas: su tamaño reducido permite analizar los patrones aprendidos por el Transformer en el contexto de un juego de estrategia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre tasa de victorias contra otros motores, ni métricas de precisión en movimientos, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: con 1,6M de parámetros, el modelo ocupa aproximadamente 6,4 MB en FP32 (1,6M × 4 bytes). Cabe en cualquier GPU, incluso en las más antiguas, y también en memoria RAM de cualquier ordenador moderno.
- GPU recomendadas: no se requiere GPU; una CPU convencional es suficiente para inferencia en tiempo real.
- Compatibilidad con consumer GPU: sí, cualquier GPU con al menos 1 GB de VRAM es más que suficiente.
- Opciones de despliegue: al ser un modelo pequeño, se puede servir con frameworks como TensorFlow Serving, ONNX Runtime, o incluso cargarlo directamente en memoria en una aplicación Python. No se han publicado archivos GGUF ni configuraciones para llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de mediciones oficiales, pero por el tamaño se espera una latencia de milisegundos en CPU y de microsegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente entrenados para Reversi con arquitectura Transformer. Existen motores clásicos de Reversi basados en búsqueda (como Edax), pero no son redes neuronales. Tampoco se conocen otros Transformers de 1,6M de parámetros para este juego en HuggingFace. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La información pública es extremadamente limitada: no hay documentación sobre el entrenamiento, la arquitectura interna ni el rendimiento, lo que dificulta su uso en producción sin una evaluación previa.
- Es un modelo especializado en Reversi: no sirve para ninguna otra tarea, ni siquiera para otros juegos de tablero sin reentrenamiento.
- No se conocen los sesgos ni las debilidades estratégicas del modelo; podría tener puntos ciegos en ciertas aperturas o finales de partida.
- Al no haber benchmarks publicados, no se puede garantizar que juegue a un nivel competitivo frente a motores tradicionales.
- La licencia MIT permite uso comercial y modificación, pero al no haber documentación, el usuario asume la responsabilidad de validar su comportamiento.
- No se ha confirmado el formato de los pesos ni la compatibilidad con frameworks específicos; es necesario revisar el repositorio de GitHub para obtener más detalles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rsu/Reversi-Transformer-1.6M_v2025-12-17
- Repositorio GitHub del proyecto ReversiGPT: https://github.com/rsu-Suba/ReversiGPT
- Código del modelo Transformer en el repositorio: https://github.com/rsu-Suba/ReversiGPT/blob/main/AI/models/transformer_TF.py
