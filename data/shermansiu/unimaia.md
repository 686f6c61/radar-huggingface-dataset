# shermansiu/unimaia

## Resumen

UniMaia es un modelo de política de ajedrez condicionado por lenguaje natural, desarrollado por Sherman Siu (con Lesley Istead como coautora en el artículo asociado). No es un modelo de lenguaje generalista: su función es predecir movimientos de ajedrez cuya distribución de probabilidad se ve modulada por una descripción textual del jugador o del estilo deseado (por ejemplo, "un jugador de club cauteloso juega con blancas"). Combina una red de política Lc0 (cuerpo de atención tipo transformer) con un codificador de texto ChessGPT adaptado mediante LoRA y un mecanismo de condicionamiento al estilo ControlNet.

El checkpoint aquí publicado contiene 3.166.691.262 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 6,3 GB. Se integra en la librería `chessnets`, que expone una API `AutoPipeline` para cargar el modelo y generar predicciones a partir de un prefijo PGN y un prompt. La relevancia actual reside en la línea de investigación de políticas de ajedrez controlables mediante lenguaje, útil para modelado de comportamiento humano y agentes de ajedrez configurables, no para fuerza de motor.

La licencia es GPL-3.0 sobre los artefactos del modelo, derivada de un modelo Lc0 (GPL-3.0) y del modelo de texto ChessGPT (Apache-2.0). El modelo se publica como resultado de investigación y el propio autor advierte que no es un modelo de lenguaje de propósito general ni una garantía de fuerza de juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política Lc0 (cuerpo de atención) + codificador de texto ChessGPT con LoRA + condicionamiento tipo ControlNet |
| Parametros totales | 3.166.691.262 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina tres componentes: un cuerpo de atención de política procedente de Lc0 (Leela Chess Zero), un codificador de texto ChessGPT adaptado con LoRA y un mecanismo de condicionamiento inspirado en ControlNet que inyecta la representación del prompt en la política de movimientos. La salida es una distribución de probabilidad sobre movimientos legales de ajedrez, condicionada por el texto de entrada. El checkpoint corresponde a la ejecución `controlnet_onephase_full_training_run_v1`.

El entrenamiento se realizó sobre partidas de Lichess aumentadas con metadatos y prompts generados a partir de plantillas de lenguaje natural. El autor indica que los prompts de entrenamiento provienen principalmente de plantillas sintéticas sobre metadatos de partida, no de instrucciones humanas diversas. Los detalles completos de arquitectura, entrenamiento y evaluación se reportan en el artículo arXiv:2605.27767. La procedencia exacta de la configuración y los hashes de ficheros están en `provenance.json` y `artifact_manifest.json` del repositorio.

## Capacidades

- Predicción de movimientos de ajedrez con probabilidades condicionadas por un prompt en lenguaje natural.
- Condicionamiento probabilístico sobre atributos como fuerza del jugador, preferencias de apertura o estilo de juego.
- Procesamiento de prefijos PGN que describen posiciones legales de ajedrez.
- Integración con la librería `chessnets` mediante `AutoPipeline.from_pretrained` y el método `make_prediction`.
- Modelado de comportamiento humano en ajedrez (no orientado a fuerza de motor).
- No es un modelo de lenguaje generalista: no genera texto libre ni código.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad nativa del modelo.
- Capacidades multilingües: no disponibles; el autor advierte que formulaciones fuera de distribución o en otros idiomas pueden ignorarse o interpretarse de forma impredecible.

## Casos de uso

- Análisis de estilos de juego: dado un PGN y un prompt que describa un estilo ("jugador agresivo con negras"), obtener la distribución de movimientos que mejor se ajuste a esa descripción para comparar con el movimiento real jugado.
- Modelado de jugadores humanos: usar los metadatos de una partida de Lichess para generar prompts que reproduzcan el nivel y las preferencias de un jugador y estudiar la fidelidad del modelo frente a sus partidas reales.
- Agentes de ajedrez configurables: construir un oponente sintético cuyo comportamiento se ajuste mediante lenguaje (fuerza, apertura, cautela) en lugar de parámetros numéricos de motor.
- Investigación en políticas condicionadas por lenguaje: analizar cómo la redacción del prompt (incluido el efecto de los primeros tokens y el comportamiento de attention sink) altera la distribución de movimientos.
- Generación de datos sintéticos de ajedrez: producir partidas con estilos controlados para aumentar conjuntos de datos de entrenamiento o evaluación.
- Evaluación de robustez de condicionamiento: medir la sensibilidad del modelo a paráfrasis, instrucciones contradictorias o atributos fuera de distribución como caso de estudio de políticas condicionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.166.691.262 parámetros y pesos safetensors (6,3 GB de repositorio), la inferencia en precisión completa requiere del orden de decenas de GB de VRAM, mientras que una carga en menor precisión reduciría el requisito, aunque no se documentan cuantizaciones soportadas.
- GPU recomendadas: no disponible en la información proporcionada; el ejemplo de uso emplea `device="cuda"` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la vía documentada es la librería `chessnets` con `AutoPipeline.from_pretrained(..., device="cuda")`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniMaia | 3.166.691.262 | no disponible | Política de ajedrez condicionada por lenguaje | GPL-3.0 | Hugging Face (`shermansiu/unimaia`) |
| Lc0 (modelo base) | no disponible | no disponible | Política de ajedrez (motor) | GPL-3.0 | GitHub LeelaChessZero/lc0 |
| ChessGPT (chessgpt-base-v1) | no disponible | no disponible | Modelo de texto de ajedrez | Apache-2.0 | Hugging Face (`Waterhorse/chessgpt-base-v1`) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los prompts de entrenamiento se generaron principalmente con plantillas sintéticas sobre metadatos; el modelo no se ha entrenado con la diversidad completa de instrucciones humanas naturales.
- La política aprendida es sensible a la redacción del prompt, especialmente a los primeros tokens; el comportamiento de attention sink puede hacer que formulaciones superficialmente similares produzcan distribuciones de movimientos distintas.
- Las formulaciones fuera de distribución, atributos no vistos, otros idiomas, variantes de ajedrez o instrucciones contradictorias pueden ignorarse o interpretarse de forma impredecible.
- El condicionamiento es estadístico y no garantiza el cumplimiento de una apertura, fuerza, identidad o estilo solicitados.
- Los resultados heredan sesgos y limitaciones de los datos de Lichess, de la red Lc0 base, de ChessGPT y del proceso de generación de prompts.
- Licencia GPL-3.0 sobre los artefactos del modelo, derivada de Lc0 (GPL-3.0) y ChessGPT (Apache-2.0); esta licencia no relicencia el software UniMaia, chessnets o chesseval distribuido por separado.
- No es un modelo de lenguaje de propósito general ni una garantía de fuerza de motor; no debe usarse como sustituto de un motor de ajedrez para análisis de máxima precisión.
- Los PGN de entrada deben describir posiciones legales de ajedrez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shermansiu/unimaia
- Artículo (arXiv): https://arxiv.org/abs/2605.27767
- Repositorio Lc0: https://github.com/LeelaChessZero/lc0
- Modelo ChessGPT base: https://huggingface.co/Waterhorse/chessgpt-base-v1
