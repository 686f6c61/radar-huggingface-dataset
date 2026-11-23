# shermansiu/unimaia-aux

## Resumen

UniMaia-Aux es un modelo de política de ajedrez condicionado por texto, desarrollado por Sherman Siu (con Lesley Istead como coautora del artículo asociado). No es un modelo de lenguaje generativo al uso, sino un modelo de decisión que predice movimientos legales de ajedrez a partir de un prefijo de partida en formato PGN y una descripción en lenguaje natural del jugador o del comportamiento deseado (por ejemplo, "un jugador de club cauteloso juega con blancas"). Resuelve el problema de generar jugadas con estilo humano y controlable mediante instrucciones, en lugar de buscar únicamente la jugada de máxima fuerza de motor.

Técnicamente combina un cuerpo de atención de política tipo Lc0 (red neuronal de Leela Chess Zero), un codificador de texto ChessGPT adaptado con LoRA y un mecanismo de condicionamiento al estilo ControlNet. El checkpoint publicado tiene 3.169.644.445 parámetros y un tamaño de repositorio de 6,3 GB en formato safetensors, con licencia GPL-3.0.

Su relevancia actual reside en la línea de investigación de políticas de ajedrez guiadas por lenguaje: permite modelar estilos, niveles de fuerza y preferencias de apertura de forma probabilística, y además de probabilidades de movimiento devuelve predicciones auxiliares de valor, jugadas restantes, tipo de terminación y retardo entre jugadas. Está pensado para investigación y aplicaciones de ajedrez, no como modelo de lenguaje de propósito general ni como garantía de fuerza de motor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cuerpo de atención de política Lc0 + codificador de texto ChessGPT con LoRA + condicionamiento estilo ControlNet |
| Parámetros totales | 3.169.644.445 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 (artefactos del modelo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una red de política de ajedrez con condicionamiento textual. El núcleo de política procede de Lc0 (Leela Chess Zero), un cuerpo de atención que produce distribuciones de probabilidad sobre movimientos legales. Sobre él se acopla un codificador de texto ChessGPT (modelo base Apache-2.0) adaptado mediante LoRA, y un mecanismo de condicionamiento de tipo ControlNet que inyecta la representación del prompt en la política. Además de la distribución de movimientos, la variante "aux" devuelve predicciones auxiliares: valor de la posición, número de jugadas restantes, tipo de terminación y retardo del movimiento.

El entrenamiento se realizó sobre partidas de Lichess aumentadas con metadatos y prompts generados a partir de plantillas de lenguaje natural. El release corresponde a la configuración `controlnet_onephase_full_training_run_v2_aux_targets_2018_finetune`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; los detalles de arquitectura, entrenamiento y evaluación se remiten al artículo. La procedencia exacta de la configuración, los checkpoints y los hashes de ficheros se documentan en `provenance.json` y `artifact_manifest.json`.

## Capacidades

- Predicción de movimientos legales de ajedrez condicionada por un prefijo de partida en PGN.
- Condicionamiento por lenguaje natural: fuerza del jugador, preferencias de apertura y estilo de juego.
- Predicción auxiliar de valor de la posición.
- Predicción auxiliar de número de jugadas restantes hasta el final de la partida.
- Predicción auxiliar del tipo de terminación (por ejemplo, resultado de la partida).
- Predicción auxiliar de retardo entre jugadas, con soporte de controles de tiempo y relojes por bando.
- Integración con la librería `chessnets` mediante `AutoPipeline` y el método `make_prediction`.
- No soporta tool calling, function calling ni razonamiento multi-paso general; no es un modelo de lenguaje de propósito general.
- Capacidades multilingües: no disponibles; el modelo advierte que formulaciones fuera de distribución, atributos, idiomas o variantes de ajedrez pueden ignorarse o interpretarse de forma impredecible.

## Casos de uso

- Modelado de estilo humano en ajedrez: dado un prompt como "jugador de club cauteloso", el modelo genera distribuciones de movimientos que reflejan ese perfil, útil para investigación sobre imitación de estilos y análisis de decisiones humanas.
- Generación de oponentes controlables: permite crear agentes de ajedrez con nivel y estilo ajustables por texto para entrenamiento, docencia o entretenimiento, sin necesidad de motores de fuerza máxima.
- Análisis de partidas y predicción de continuación: a partir de un PGN parcial y los relojes, el modelo puede estimar la jugada más probable y el valor de la posición, apoyando herramientas de análisis.
- Simulación de partidas con control de tiempo: las predicciones de retardo y de jugadas restantes permiten modelar el ritmo de juego y el consumo de reloj, útil en estudios de gestión de tiempo.
- Investigación sobre condicionamiento lingüístico de políticas: el modelo sirve como banco de pruebas para estudiar cómo el texto modula decisiones en dominios estructurados (el ajedrez como caso de estudio).
- Predicción de resultados y terminación: las salidas auxiliares de valor y tipo de terminación permiten construir estimadores de resultado de partida para análisis estadístico o sistemas de recomendación de estudio.
- Prototipado de interfaces de ajedrez con instrucciones: integración en aplicaciones que acepten descripciones en lenguaje natural del rival deseado, usando `chessnets.AutoPipeline` sobre GPU con CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo (arXiv:2605.27767) para los detalles de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.169.644.445 parámetros y pesos safetensors, la inferencia en precisión completa requiere del orden de decenas de GB de VRAM, y el repositorio ocupa 6,3 GB.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de uso emplea `device="cuda"`.
- Viabilidad en GPU de consumo: no disponible; depende del soporte de cuantización, que no se documenta.
- Opciones de despliegue: librería `chessnets` con `AutoPipeline.from_pretrained`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniMaia-Aux | 3.169.644.445 | no disponible | Política de ajedrez condicionada por texto | GPL-3.0 | Hugging Face (`shermansiu/unimaia-aux`) |
| Lc0 (Leela Chess Zero) | no disponible | no disponible | Política de ajedrez por búsqueda y red | GPL-3.0 | GitHub (LeelaChessZero/lc0) |
| ChessGPT (base) | no disponible | no disponible | Modelo de lenguaje sobre ajedrez | Apache-2.0 | Hugging Face (`Waterhorse/chessgpt-base-v1`) |

La comparación directa con alternativas de la misma categoría (políticas de ajedrez condicionadas por lenguaje) no está disponible en la información proporcionada; Lc0 y ChessGPT se incluyen por ser los componentes upstream declarados por el autor.

## Limitaciones y advertencias

- Los prompts de entrenamiento se generaron principalmente a partir de plantillas sintéticas sobre metadatos de partidas; el modelo no se ha entrenado con la diversidad completa de instrucciones humanas naturales.
- La política aprendida es sensible a la redacción del prompt, especialmente a los primeros tokens; el comportamiento de "attention sink" puede hacer que formulaciones superficialmente similares produzcan distribuciones de movimientos distintas.
- Redacciones fuera de distribución, atributos, idiomas, variantes de ajedrez o instrucciones contradictorias pueden ignorarse o interpretarse de forma impredecible.
- El condicionamiento es estadístico y probabilístico: no garantiza el cumplimiento de una apertura, fuerza, identidad o estilo solicitados.
- Los resultados heredan sesgos y limitaciones de los datos de entrenamiento de Lichess, de la red base de Lc0, de ChessGPT y del proceso de generación de prompts.
- No es un modelo de lenguaje de propósito general ni garantiza fuerza de motor; no debe emplearse como tal.
- Licencia GPL-3.0 para los artefactos del modelo, derivada de un modelo Lc0 GPL-3.0 y de ChessGPT Apache-2.0; esta licencia no relicencia el software UniMaia, chessnets o chesseval, distribuidos por separado.
- Los PGN introducidos deben describir posiciones legales de ajedrez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shermansiu/unimaia-aux
- Artículo (arXiv): https://arxiv.org/abs/2605.27767
- Repositorio Lc0: https://github.com/LeelaChessZero/lc0
- Modelo base ChessGPT: https://huggingface.co/Waterhorse/chessgpt-base-v1
