# avewright/chess-transformer-100m-overnight_20260908

## Resumen

El modelo `chess-transformer-100m-overnight_20260908` es una red neuronal recurrente de aproximadamente 100 millones de parámetros desarrollada por `avewright` para generar movimientos legales de ajedrez sin recurrir a búsqueda. Está construido sobre una arquitectura de tipo transformer encoder-only que atiende únicamente a las 64 casillas del tablero y codifica el turno, el derecho de enroque y la captura al paso mediante módulos FiLM sobre el flujo de casillas, en lugar de añadir tokens extra.

El modelo fue entrenado de forma supervisada con etiquetas generadas por Stockfish 19, y el repositorio incluye pesos de evaluación (`eval_swa.pt`, `latest.pt`) y un checkpoint completo de entrenamiento (`training_resume.pt`). El autor reporta una puntuación interna en protocolo UCI de aproximadamente Elo 2150 en un enfrentamiento de 128 partidas contra Stockfish 19 con 8000 nodos, destacando que esa cifra es una banda orientativa y no un Elo FIDE o de Lichess.

Su relevancia radica en que ofrece una alternativa ligera a los motores tradicionales de ajedrez, con inferencia greedy sin búsqueda y un coste computacional bajo, lo que lo hace adecuado para análisis de posiciones, aplicaciones educativas y experimentos de investigación en arquitecturas recurrentes con atención espacial. El repositorio pesa 1.2 GB y su licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con atención sobre las 64 casillas del tablero (configuración Squares64RecurrentConfig) |
| Parámetros totales | ~100 millones (99 M en el modelo homólogo squares64) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa un tablero de ajedrez de 64 casillas) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de ajedrez, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only con embeddings de tablero aprendidos y una cabeza de política espacial. Según la descripción del modelo hermano `chess-transformer-100m-squares64`, la atención se limita a las 64 casillas del tablero, y el turno, el enroque y la captura al paso se incorporan como condicionamiento FiLM sobre el flujo de casillas, lo que evita añadir tokens adicionales. El nombre `Squares64RecurrentConfig` en `model_config.json` confirma el carácter recurrente de la red.

El entrenamiento se indica como supervisado por Stockfish 19, con un proceso descrito como "overnight SF19 SWA", que probablemente implicó un entrenamiento nocturno con técnica de Stochastic Weight Averaging. El repositorio incluye carpetas de evaluación (`gauntlet`, `holdouts`, `mix audits`) y el archivo `training_resume.pt` que guarda el estado del optimizador y el generador de números aleatorios. No se dispone de información sobre RLHF, DPO ni otras etapas de alineación, ya que no es un modelo de lenguaje.

En inferencia, el modelo emplea un vocabulario compacto de 1968 movimientos y no realiza búsqueda alguna; el autor lo describe explícitamente como "searchless greedy policy".

## Capacidades

- Generación de movimientos legales de ajedrez a partir de cualquier posición del tablero mediante una cabeza de política espacial.
- Inferencia sin búsqueda (greedy), lo que reduce drásticamente el coste computacional frente a motores con búsqueda de árbol.
- Manejo de estados especiales del ajedrez: turno, derecho de enroque y captura al paso codificados mediante FiLM sobre el flujo de casillas.
- Estimación de valor de posición, según la descripción del modelo homólogo `chess-transformer-100m-squares64`, que se define como una red de política y valor.
- Compatibilidad con la librería `python-chess` para representar el tablero y obtener movimientos.
- Adecuado para experimentación en arquitecturas recurrentes con atención espacial aplicada a dominios no lingüísticos.

## Casos de uso

- Asistente de análisis de partidas: el modelo puede sugerir movimientos candidatos en una posición concreta, integrándose en aplicaciones de análisis de ajedrez como alternativa rápida a un motor con búsqueda.
- Entrenamiento de jugadores: permite ofrecer recomendaciones de jugadas para ejercicios tácticos, mostrando la política de la red ante posiciones de prueba.
- Investigación en aprendizaje por refuerzo: la red de política puede utilizarse como base para entrenar agentes de ajedrez mediante RL, aprovechando el checkpoint de entrenamiento incluido.
- Base para fine-tuning en dominios concretos: el archivo `training_resume.pt` permite continuar el entrenamiento y adaptar el modelo a aperturas, estilos o conjuntos de posiciones específicos.
- Motor de ajedrez ligero para aplicaciones casuales: gracias a la inferencia sin búsqueda, puede ejecutarse en tiempo real en GPU o CPU, en juegos amistosos o en demostraciones interactivas.
- Generación de datos sintéticos: el modelo puede producir secuencias de movimientos y valoraciones de posición que sirvan para entrenar otros modelos o para ampliar datasets de posiciones.
- Educación en inteligencia artificial: ofrece un ejemplo práctico de cómo aplicar un transformer con atención espacial a un dominio no lingüístico, con código de inferencia sencillo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje. La información disponible incluye una evaluación interna en protocolo UCI reportada en la model card:

| Evaluación | Resultado |
|---|---|
| Score vs Stockfish 19 (Elo 2050, 8000 nodos) | 0,602 |
| Score vs Stockfish 19 (Elo 2200, 8000 nodos) | 0,445 |
| Re-ejecución del protocolo (mismo protocolo) | 0,504 |
| Elo UCI local estimado | ≈ 2150 (re-ejecución: 2132) |

El autor advierte que estos resultados deben interpretarse como una banda, no como un número único, y que no son comparables con clasificaciones oficiales de FIDE o Lichess.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los ~100 millones de parámetros ocupan aproximadamente 400 MB, y en float16 unos 200 MB. Estas cifras son estimaciones basadas en el tamaño declarado.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo sin problemas; no se requieren GPUs de gama alta como A100 o H100.
- CPU: la inferencia es posible en CPU, aunque con latencia superior; no se dispone de medidas de latencia en la información proporcionada.
- Opciones de despliegue: el modelo se carga mediante PyTorch con el script de inferencia incluido en la model card. No es compatible con entornos de despliegue orientados a modelos de lenguaje como vLLM, TGI o llama.cpp, ya que no es un LLM.
- Entrenamiento: el archivo `training_resume.pt` incluye el estado del optimizador y RNG, por lo que reanudar el entrenamiento requiere más memoria que la simple inferencia.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en los datos proporcionados. El único modelo similar conocido es `avewright/chess-transformer-100m-squares64`, que comparte arquitectura, tamaño y licencia, y cuyos pesos públicos no fueron sobrescritos por este checkpoint. No existen datos de benchmarks comparables entre ambos modelos.

| Modelo | Parámetros | Arquitectura | Licencia |
|---|---|---|---|
| chess-transformer-100m-overnight_20260908 | ~99 M | Transformer recurrente sobre 64 casillas | MIT |
| chess-transformer-100m-squares64 | ~99 M | Transformer recurrente sobre 64 casillas | MIT |

## Limitaciones y advertencias

- El Elo estimado (~2150) proviene de una pantalla UCI interna con un número reducido de partidas (128) y no es un Elo FIDE ni de Lichess.
- El rendimiento debe tratarse como una banda orientativa, ya que una re-ejecución del mismo protocolo dio una puntuación global de 0,504 (Elo estimado 2132).
- Al no utilizar búsqueda en inferencia, el modelo puede fallar en tácticas profundas o en posiciones que requieran cálculo de variantes, donde un motor con búsqueda resolvería correctamente.
- No es un modelo de lenguaje: no admite tool calling, dialogo en lenguaje natural ni procesamiento de texto.
- El repositorio presenta 0 descargas y 0 likes, lo que indica una ausencia de validación comunitaria; la evaluación publicada es interna y no ha sido replicada de forma independiente.
- La licencia MIT permite uso comercial, pero requiere mantener el aviso de licencia y atribución al autor.
- No se ha realizado una evaluación de sesgos en la información disponible; el modelo podría estar sesgado hacia posiciones o estilos de juego presentes en los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/avewright/chess-transformer-100m-overnight_20260908
- Modelo homólogo squares64: https://huggingface.co/avewright/chess-transformer-100m-squares64
- Repositorio GitHub con código y arquitectura: https://github.com/avewright/transform
