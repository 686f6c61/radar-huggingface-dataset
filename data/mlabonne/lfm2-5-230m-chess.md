# mlabonne/LFM2.5-230M-Chess

## Resumen

LFM2.5-230M-Chess es un motor de ajedrez de 230 millones de parámetros que se presenta a través de una interfaz de modelo de lenguaje. Lo desarrolla Maxime Labonne (mlabonne) mediante un ajuste fino supervisado y destilación de Stockfish sobre el modelo base LiquidAI/LFM2.5-230M-Base, desarrollado por Liquid AI. El modelo resuelve un problema muy concreto: jugar al ajedrez de forma legal y razonablemente fuerte con una huella de parámetros mínima, aprovechando el vocabulario de un transformer en lugar de una arquitectura de búsqueda tradicional.

La innovación principal es la tokenización del dominio: cada movimiento legal posible del ajedrez es un único token del vocabulario (se añaden 2.106 tokens nuevos a partir del ID 64402). El modelo lee una posición como un prompt fijo de 80 tokens, predice primero su propia probabilidad de victoria mediante 64 tokens de valor (`<v:k>`) y después predice un token de movimiento. El programa anfitrión enmascara los logits de movimiento a los movimientos legales, de modo que el modelo no puede generar una jugada ilegal.

Su relevancia actual reside en que demuestra que un modelo de 230M de parámetros puede alcanzar aproximadamente 2004 Elo cuando se le añade una búsqueda superficial de profundidad 3, y unos 1500 Elo con la política directa de una sola pasada. Esto lo sitúa como un caso de estudio interesante sobre destilación de motores simbólicos en modelos pequeños y sobre el uso de vocabularios especializados para tareas estructuradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (familia Liquid Foundation Model, backbone híbrido) ajustado para ajedrez |
| Parametros totales | 230.688.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la entrada estándar es un prompt fijo de 80 tokens) |
| Tipos de cuantizacion | no disponible en la información proporcionada; existe una versión ONNX en repo separado |
| Idiomas soportados | en (inglés), aunque la salida real son tokens de ajedrez |
| Licencia | lfm1.0 (etiquetada como `license: other`) |
| Formato de pesos | safetensors; también ONNX en `mlabonne/LFM2.5-230M-Chess-ONNX` |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-230M-Base, un backbone de 230M de parámetros de la familia LFM2.5 de Liquid AI, y se ajusta mediante destilación de Stockfish. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; estos datos figuran como no disponibles.

La innovación técnica clave es la representación del ajedrez como lenguaje. El vocabulario incorpora 2.106 tokens nuevos (desde el ID 64402) que cubren todos los movimientos posibles, además de 64 tokens de valor. La inferencia se realiza en dos pasadas cortas: primero se construye el prompt de 80 tokens a partir del FEN, que codifica las 64 casillas, el lado al que le toca mover, los derechos de enroque, la columna de captura al paso, el contador de medias jugadas, el recuento de repeticiones y las últimas 8 jugadas; después se toma el argmax sobre los 64 tokens de valor para obtener la evaluación (donde `<v:k>` significa una probabilidad de victoria en `[k/64, (k+1)/64)`); finalmente se añade ese token de valor y `<|bestmove|>`, se enmascaran los logits a los movimientos legales y se toma el argmax. El enmascaramiento garantiza la legalidad de la jugada generada.

## Capacidades

- Generación de movimientos de ajedrez legales: la totalidad de los movimientos posibles está tokenizada y el enmascaramiento de logits impide jugadas ilegales.
- Evaluación de posiciones: produce una probabilidad de victoria discretizada en 64 niveles mediante los tokens de valor.
- Lectura de posiciones en notación FEN, codificadas en un prompt fijo de 80 tokens que incluye estado completo de la partida.
- Juego con búsqueda superficial: combinado con una búsqueda de profundidad 3 alcanza aproximadamente 2004 Elo.
- Juego directo de una sola pasada: como política pura sin búsqueda, rinde en torno a 1500 Elo.
- No dispone de tool calling, function calling ni capacidades de agente multietapa.
- No es un modelo multilingüe en el sentido habitual ni ofrece visión, audio ni modo de razonamiento (thinking mode).
- No está pensado para generación de texto general, código ni matemáticas.

## Casos de uso

- Motor de ajedrez ligero para aplicaciones web o móviles: con 230M de parámetros y un repositorio de 0,5 GB, puede integrarse en un cliente que calcule jugadas en local sin depender de un servidor, usando la versión ONNX o los pesos safetensors.
- Análisis de posiciones y estimación de probabilidad de victoria: la salida de tokens de valor permite mostrar una evaluación numérica de la posición además del movimiento recomendado.
- Entrenamiento de jugadores principiantes: el nivel de juego con la política directa (unos 1500 Elo) es adecuado para practicar contra una IA de fuerza moderada y controlable.
- Investigación en destilación de motores simbólicos: sirve como caso de estudio reproducible de cómo trasladar el conocimiento de Stockfish a un transformer pequeño mediante vocabulario especializado.
- Generación de datasets de ajedrez etiquetados: el modelo puede producir movimientos y evaluaciones para posiciones en masa, útiles para preentrenar o aumentar otros modelos.
- Docencia y demostración de tokenización de dominio: ilustra cómo mapear una tarea estructurada (movimientos legales) a un vocabulario de tokens y cómo aplicar enmascaramiento de logits para restringir la salida.
- Comparación de metodologías de inferencia: permite medir la diferencia de rendimiento entre la política directa y la política aumentada con búsqueda de profundidad 3 (de ~1500 a ~2004 Elo).

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son las estimaciones de Elo del propio autor.

| Metrica | Resultado |
|---|---|
| Elo con búsqueda de profundidad 3 | ~2004 |
| Elo con política directa (una pasada) | ~1500 |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 en torno a 0,5 GB de pesos; el repositorio completo ocupa 0,5 GB. Las estimaciones por cuantización (INT8, INT4) no están publicadas, pero serían inferiores a la de FP16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere hardware de centro de datos (A100, H100) para la inferencia básica.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo reciente (por ejemplo, series RTX 30/40) e incluso en CPU.
- Opciones de despliegue: `transformers` de Hugging Face mediante `AutoModelForCausalLM`; también hay una versión ONNX para despliegue optimizado. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor indica que cada movimiento requiere dos pasadas cortas hacia delante, lo que sugiere una latencia baja por jugada, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados frente a otros motores de ajedrez basados en redes neuronales o frente a modelos de lenguaje del mismo tamaño. La siguiente tabla recoge únicamente lo conocido.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlabonne/LFM2.5-230M-Chess | 230.688.512 | no disponible (prompt fijo de 80 tokens) | ~2004 Elo con búsqueda d3; ~1500 Elo directo | lfm1.0 | Hugging Face (safetensors y ONNX) |
| LiquidAI/LFM2.5-230M-Base | 230M (aprox.) | no disponible | no disponible | lfm1.0 | Hugging Face |
| Otros motores de ajedrez neuronales (Stockfish NNUE, Leela Chess Zero, Maia) | no disponible | no aplica | no disponible en esta información | no disponible | no disponible |

No se conocen alternativas directas de la misma categoría (modelo de lenguaje pequeño especializado en ajedrez) documentadas en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo solo está entrenado para ajedrez. No es un modelo de propósito general y no debe usarse para generación de texto, código u otras tareas.
- Riesgo de alucinación fuera de dominio: cualquier uso distinto del ajedrez producirá salidas sin sentido, aunque el enmascaramiento de movimientos legales evita jugadas ilegales dentro del dominio.
- Idiomas: la información disponible solo declara inglés como idioma; no se documenta soporte multilingüe.
- Licencia: la licencia lfm1.0 viene etiquetada como `license: other` y hereda las condiciones del modelo base de Liquid AI. Es imprescindible revisar el archivo LICENSE y las condiciones de LFM1.0 antes de cualquier uso comercial.
- Dependencia del anfitrión: la legalidad de las jugadas depende de que el programa que lo aloja enmascare correctamente los logits; sin ese enmascaramiento, el modelo no garantiza movimientos válidos.
- Precisión de las cifras de Elo: los valores de ~2004 y ~1500 Elo son estimaciones del autor y dependen del protocolo de búsqueda y del conjunto de pruebas; no se detalla la metodología.
- Contexto limitado: el modelo se usa con un prompt fijo de 80 tokens y solo codifica las últimas 8 jugadas, el contador de medias jugadas y el recuento de repeticiones, por lo que la información histórica de la partida es reducida.
- Datos de entrenamiento opacos: no se especifican el volumen de datos, la composición del dataset ni el proceso de destilación con detalle, lo que dificulta evaluar sesgos o cobertura de posiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlabonne/LFM2.5-230M-Chess
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Versión ONNX: https://hf.co/mlabonne/LFM2.5-230M-Chess-ONNX
- Demo interactiva (ChessLFM Space): https://hf.co/spaces/mlabonne/ChessLFM
- Artículo del autor: https://maximelabonne.substack.com/p/chesslfm-2000-elo-in-230m-params
- Repositorio de tokens (`token_ids.json`): incluido en el repositorio del modelo
