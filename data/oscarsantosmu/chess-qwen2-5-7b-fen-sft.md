# OscarSantosMu/chess-qwen2.5-7b-fen-sft

## Resumen

`chess-qwen2.5-7b-fen-sft` es un adaptador LoRA de tipo PEFT entrenado mediante supervisión fina (SFT) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Lo desarrolla el usuario OscarSantosMu y su propósito es la selección de jugadas de ajedrez a partir de una posición dada en notación FEN, devolviendo una única jugada en notación UCI. No se trata de un modelo completo, sino de un adaptador que debe cargarse junto al modelo base de Qwen para funcionar.

El adaptador se enmarca en el experimento identificado como `e006_q25_7b_fen_20k_sft_s42`, lo que sugiere un entrenamiento sobre aproximadamente 20.000 ejemplos y una semilla fijada a 42. La entrada es la posición FEN sin lista explícita de jugadas legales, y la salida esperada es una sola jugada en formato UCI (por ejemplo, `e2e4` o `a7a8q`). El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador, no los del modelo base.

Su relevancia es fundamentalmente investigadora: explora si un LLM de propósito general de 7.000 millones de parámetros, ajustado con LoRA, puede aprender a seleccionar jugadas de ajedrez a partir de FEN. No obstante, el autor advierte que no se ha establecido la fuerza de juego mediante evaluaciones estandarizadas de motores de ajedrez, por lo que su utilidad práctica en competición o producción está por demostrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA no especifica su número de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-7B-Instruct, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Método de entrenamiento | SFT con LoRA |
| Representación de entrada | FEN |
| Formato de salida | Una jugada en notación UCI |
| Experimento | e006_q25_7b_fen_20k_sft_s42 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7.000 millones de parámetros. El ajuste se realiza mediante LoRA (Low-Rank Adaptation) con supervisión fina (SFT), lo que congela los pesos del modelo base y entrena únicamente matrices de bajo rango. El experimento se denomina `e006_q25_7b_fen_20k_sft_s42`, lo que indica el uso de aproximadamente 20.000 ejemplos de entrenamiento y una semilla de 42.

La entrada al modelo es la posición de ajedrez en notación FEN, sin incluir una lista explícita de jugadas legales. El prompt sigue la plantilla de chat estándar de Qwen con una instrucción de sistema específica de ajedrez: el modelo debe actuar como selector de jugadas y responder con exactamente una jugada legal en notación UCI, sin explicaciones ni texto adicional. La instrucción de usuario concluye con la petición de elegir la mejor jugada para el bando que mueve. El autor indica que los scripts de entrenamiento, los manifiestos de experimentos y los resultados de evaluación se mantienen en el repositorio de GitHub del proyecto, pero no se incluyen en el repositorio del modelo, y que los datos de entrenamiento tampoco están incluidos. No se proporcionan detalles sobre el número total de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Selección de jugadas de ajedrez: dado un FEN, devuelve una jugada en notación UCI.
- Generación de texto conversacional: heredada del modelo base Qwen2.5-7B-Instruct, aunque el ajuste está orientado a la tarea de ajedrez.
- Seguimiento de instrucciones de sistema: el adaptador responde al formato de chat de Qwen con una instrucción de sistema específica.
- Salida restringida: el modelo está entrenado para producir únicamente la jugada UCI, sin explicaciones ni puntuación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para el adaptador (el modelo base Qwen2.5-7B-Instruct lo soporta, pero no se confirma que el ajuste lo preserve).
- Soporte de agentes y razonamiento multi-paso: no disponible; la tarea es de un solo paso (posición a jugada).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en ajedrez con LLM: el adaptador permite estudiar si un modelo de lenguaje de 7B ajustado con LoRA puede aprender a seleccionar jugadas a partir de FEN, sirviendo como base para experimentos comparativos con otros enfoques.
- Generación de jugadas en pipelines de análisis: se puede integrar en un script que reciba posiciones FEN y obtenga una jugada candidata, siempre que se valide la legalidad con una librería como `python-chess` antes de usarla.
- Evaluación de la representación FEN: al entrenar exclusivamente con FEN sin lista de jugadas legales, el adaptador permite medir hasta qué punto el modelo internaliza las reglas de movimiento del ajedrez.
- Prototipado de asistentes de ajedrez: puede servir como componente de selección de jugada en un asistente que explique o analice posiciones, aunque la explicación debería generarla otro componente.
- Estudio de adaptadores LoRA en dominios especializados: el repositorio documenta un experimento reproducible (semilla 42, 20k ejemplos) útil para comparar técnicas de ajuste eficiente en tareas de razonamiento estructurado.
- Generación de datos sintéticos de ajedrez: las jugadas producidas pueden usarse, tras validación, como candidatas en la construcción de datasets de entrenamiento o evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las métricas de evaluación y los hiperparámetros detallados se añadirán a medida que se consoliden los experimentos, y que la fuerza de juego no se ha establecido mediante evaluaciones estandarizadas de motores de ajedrez o competiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es pequeño (repositorio de 0,1 GB), pero requiere cargar el modelo base Qwen2.5-7B-Instruct. En precisión completa (FP16/BF16) se estiman aproximadamente 14-16 GB de VRAM; con cuantización de 8 bits, en torno a 8-10 GB; con 4 bits, alrededor de 5-6 GB. Estas cifras son estimaciones generales para un modelo de 7B y no están confirmadas en la información proporcionada.
- GPU recomendadas: A100, H100 o L40S para despliegue en FP16 con margen; RTX 4090 (24 GB) o RTX A6000 para FP16; GPUs consumer con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) para cuantización de 4-8 bits.
- ¿Cabe en consumer GPU? Sí, con cuantización de 4 bits en GPUs de 8 GB o más; en FP16 requiere GPUs de 16 GB o más.
- Opciones de despliegue: `transformers` + `peft` (método documentado por el autor), `vLLM` o `TGI` con soporte de adaptadores LoRA, y `llama.cpp`/`Ollama` si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-qwen2.5-7b-fen-sft | 7B (base) + LoRA | no disponible | Selección de jugada desde FEN (UCI) | no disponible | Hugging Face (adaptador) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | LLM generalista con instrucciones | no disponible en esta ficha | Hugging Face |
| Motores de ajedrez clásicos (Stockfish, etc.) | no aplica (motor) | no aplica | Búsqueda + evaluación | varía (GPL para Stockfish) | Amplia distribución |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas. La comparación con motores de ajedrez clásicos es cualitativa: el adaptador no realiza búsqueda y no garantiza jugadas legales ni óptimas, mientras que los motores clásicos están diseñados específicamente para maximizar la fuerza de juego.

## Limitaciones y advertencias

- El modelo no garantiza que la jugada devuelta sea legal ni óptima; es imprescindible validar la salida con una librería de ajedrez como `python-chess`.
- La fuerza de juego no se ha establecido mediante evaluaciones estandarizadas de motores de ajedrez o competiciones; no hay benchmarks publicados.
- La representación FEN debe reproducirse exactamente como en el entrenamiento, usando la función `prompt_text()` con `variant="fen"` de `examples/task.py`, para mantener la instrucción de sistema, el orden de jugadas legales y la serialización del chat.
- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el modelo base Qwen2.5-7B-Instruct y la librería `peft`.
- No se especifica la licencia del adaptador ni del modelo base en la información proporcionada; debe consultarse antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del ajuste; al ser un modelo de lenguaje, puede generar salidas no válidas o inventadas fuera del formato UCI.
- Los datos de entrenamiento no están incluidos en el repositorio, lo que limita la reproducibilidad completa del experimento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/OscarSantosMu/chess-qwen2.5-7b-fen-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio GitHub del proyecto: no disponible en la información proporcionada (el autor lo menciona sin enlace)
- Paper: no disponible
- Blog o demo: no disponible
