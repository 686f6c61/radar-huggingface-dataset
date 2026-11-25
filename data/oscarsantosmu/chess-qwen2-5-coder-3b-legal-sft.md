# OscarSantosMu/chess-qwen2.5-coder-3b-legal-sft

## Resumen

`chess-qwen2.5-coder-3b-legal-sft` es un adaptador LoRA de tipo PEFT entrenado mediante supervisión fina (SFT) sobre el modelo base `Qwen/Qwen2.5-Coder-3B-Instruct`, desarrollado por el usuario OscarSantosMu. El adaptador está especializado en una única tarea: seleccionar un movimiento de ajedrez legal en notación UCI a partir de una posición FEN y una lista de movimientos legales ordenada lexicográficamente. No se trata de un modelo independiente, sino de un delta de pesos que debe cargarse junto al modelo base para funcionar.

El modelo se enmarca en una línea de experimentos de investigación (`e007_q25_coder_3b_legal_20k_sft_s42`) orientada a evaluar la capacidad de modelos de código de pequeño tamaño como selectores de movimientos de ajedrez. La representación de entrada denominada `legal` incluye la posición FEN y el conjunto completo de movimientos legales, lo que convierte la tarea en una clasificación restringida sobre un vocabulario cerrado de jugadas válidas.

La relevancia de esta ficha es limitada en términos de producción: el repositorio tiene cero descargas y cero likes, no declara licencia, no incluye datos de entrenamiento ni resultados de evaluación publicados, y el propio autor advierte que la fuerza de juego no ha sido establecida mediante pruebas estandarizadas. Es, por tanto, un artefacto de investigación reproducible más que un componente listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-3B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 3B en el modelo base; el adaptador LoRA no declara su número de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-Coder-3B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización aplicable es la del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-Coder-3B-Instruct`, un transformer decoder-only de 3.000 millones de parámetros orientado a generación de código e instrucciones. El ajuste se realiza con LoRA (Low-Rank Adaptation) mediante SFT, lo que congela los pesos del modelo base e introduce matrices de bajo rango entrenables. El experimento se identifica como `e007_q25_coder_3b_legal_20k_sft_s42`, lo que sugiere un conjunto de aproximadamente 20.000 ejemplos de entrenamiento y una semilla 42, aunque el autor no publica el dataset en el repositorio.

La innovación técnica principal no reside en la arquitectura sino en la formulación de la tarea: la entrada `legal` combina la posición FEN con la lista ordenada lexicográficamente de movimientos legales en UCI, y la salida esperada es exactamente un movimiento de esa lista. El prompt utiliza la plantilla de chat estándar de Qwen con una instrucción de sistema específica que prohíbe explicaciones, puntuación o texto adicional. No se documentan datos sobre volumen de tokens, composición del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Selección de movimientos de ajedrez en notación UCI (`e2e4`, `a7a8q`) dada una posición FEN y una lista de movimientos legales.
- Generación de texto conversacional y de código heredada del modelo base Qwen2.5-Coder-3B-Instruct.
- Seguimiento de instrucciones de sistema con formato estricto de salida (un único token de movimiento, sin texto adicional).
- Razonamiento restringido a un vocabulario cerrado de jugadas legales, lo que reduce el espacio de salida frente a la generación libre.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Investigación en selección de movimientos con modelos de lenguaje: el adaptador permite reproducir el experimento `e007` y comparar la formulación `legal` frente a otras representaciones de tablero en tareas de ajedrez.
- Generación de datasets sintéticos de ajedrez: integrado en un pipeline con `python-chess`, puede producir jugadas candidatas para posiciones FEN y filtrar después su legalidad y calidad con un motor como Stockfish.
- Evaluación de modelos de código en dominios estructurados: sirve para medir hasta qué punto un modelo de código de 3B puede adaptarse a una tarea de clasificación con vocabulario cerrado mediante LoRA.
- Prototipado de asistentes de ajedrez en entornos controlados: el modelo puede sugerir un movimiento a partir de una posición y una lista de jugadas legales, siempre con validación posterior por un motor.
- Estudio de robustez de prompts: al requerir una reproducción exacta del formato `legal` en inferencia, es útil para analizar la sensibilidad de los adaptadores LoRA a variaciones en la serialización del prompt.
- Base para experimentos de destilación o comparación de adaptadores: el adaptador puede servir como referencia frente a otros adaptadores LoRA entrenados sobre el mismo modelo base con distintas representaciones de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las métricas de evaluación y los hiperparámetros detallados se añadirán a medida que se consoliden los experimentos, y que la fuerza de juego no ha sido establecida mediante evaluaciones estandarizadas de motores de ajedrez o competición.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en FP16 requiere aproximadamente 6-7 GB; en cuantización de 8 bits, alrededor de 3-4 GB; en 4 bits, aproximadamente 2-3 GB. El adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: NVIDIA A100, H100 o L40S para inferencia con mayor throughput; RTX 4090, RTX 3090 o RTX 4080 para uso en una sola GPU consumer.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8 GB de VRAM en FP16 y en tarjetas de 4-6 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: `transformers` con `peft` (flujo documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-qwen2.5-coder-3b-legal-sft | 3B (base) + LoRA | no disponible | Selección de movimientos de ajedrez | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3B | no disponible en la información | Generación de código e instrucciones | no disponible en la información | Hugging Face (modelo base público) |
| Motores de ajedrez clásicos (Stockfish, Leela Chess Zero) | no disponible | no aplica | Juego de ajedrez de alta fuerza | GPL (Stockfish) / licencias propias | Ampliamente disponible |

La comparación con motores de ajedrez clásicos es pertinente porque el adaptador no ha demostrado fuerza de juego competitiva; su interés es académico y de investigación, no como sustituto de un motor.

## Limitaciones y advertencias

- El modelo no garantiza movimientos legales ni óptimos; el propio autor lo advierte en la model card.
- La fuerza de juego no ha sido establecida mediante evaluaciones estandarizadas de motores o competición.
- La representación `legal` debe reproducirse exactamente en inferencia (instrucción de sistema, orden lexicográfico de movimientos, serialización de chat); cualquier desviación puede degradar la salida.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- No se publican datos de entrenamiento, hiperparámetros detallados ni métricas de evaluación en el repositorio.
- Riesgo de alucinación: aunque la tarea restringe la salida a movimientos de una lista, el modelo puede generar tokens fuera del formato UCI esperado o movimientos no presentes en la lista.
- Sesgos conocidos: no documentados; al heredar el modelo base, puede arrastrar sesgos de sus datos de preentrenamiento, aunque la tarea específica los mitiga parcialmente.
- Limitaciones de contexto e idioma: no documentadas; el prompt está en inglés y el modelo no declara idiomas soportados.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OscarSantosMu/chess-qwen2.5-coder-3b-legal-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio del proyecto con scripts de entrenamiento y evaluación: no disponible en la información proporcionada (el autor lo menciona pero no incluye la URL)
- Paper o blog asociado: no disponible
- Demo: no disponible
