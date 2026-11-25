# OscarSantosMu/chess-qwen2.5-3b-fen-sft

## Resumen

chess-qwen2.5-3b-fen-sft es un adaptador LoRA (PEFT) entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Su propósito es la selección de jugadas de ajedrez: recibe una posición en notación FEN y devuelve una única jugada en notación UCI (por ejemplo, `e2e4` o `a7a8q`). Lo desarrolla OscarSantosMu como parte de una línea de experimentos de investigación etiquetada como `e005_q25_3b_fen_20k_sft_s42`.

El repositorio no contiene el modelo completo, sino únicamente el adaptador LoRA, por lo que requiere cargar el modelo base Qwen2.5-3B-Instruct y aplicar el adaptador encima. El entrenamiento se realizó con el formato de chat estándar de Qwen y una instrucción de sistema específica que restringe la respuesta a una jugada legal en UCI, sin explicaciones ni texto adicional.

Es relevante como ejemplo de aplicación de modelos de lenguaje generalistas a un dominio de razonamiento estructurado y de reglas estrictas como el ajedrez, mediante un ajuste ligero y de bajo coste. No obstante, el propio autor advierte de que se trata de un modelo experimental, sin evaluación de fuerza de juego estandarizada, y el repositorio no incluye datos de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-3B-Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 3B en el modelo base; parámetros del adaptador: no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la información) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Método de entrenamiento | SFT con LoRA |
| Representación de entrada | FEN (sin lista explícita de jugadas legales) |
| Representación de salida | Una jugada en notación UCI |
| Librería | peft (con transformers y torch) |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros. El ajuste se realiza mediante LoRA (Low-Rank Adaptation) con supervisión fina (SFT), lo que permite especializar el modelo en la tarea de selección de jugadas sin reentrenar todos los pesos. El identificador del experimento es `e005_q25_3b_fen_20k_sft_s42`, lo que sugiere un conjunto de aproximadamente 20.000 ejemplos y una semilla 42, aunque el autor no detalla el volumen exacto ni la composición del dataset en la model card.

La entrada es la posición en FEN sin lista explícita de jugadas legales, y la salida es una única jugada en UCI. El prompt sigue la plantilla de chat de Qwen con una instrucción de sistema que exige responder exclusivamente con la jugada, sin explicaciones ni puntuación adicional. Para reproducir el comportamiento de entrenamiento, el autor indica que debe usarse la función `prompt_text()` del archivo `examples/task.py` con `variant="fen"`, que garantiza la misma instrucción de sistema, representación, ordenación de jugadas legales y serialización de chat. No se especifican datos sobre número de tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO.

## Capacidades

- Selección de jugadas de ajedrez: dada una posición legal en FEN, genera una jugada en notación UCI.
- Generación de texto conversacional heredada del modelo base Qwen2.5-3B-Instruct.
- Seguimiento de instrucciones estrictas: responde con una sola jugada sin texto adicional cuando se usa el prompt de entrenamiento.
- Soporte de la plantilla de chat de Qwen con instrucción de sistema específica de ajedrez.
- Ejecución mediante PEFT sobre el modelo base, con carga del adaptador en memoria.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito para este adaptador.

## Casos de uso

- Análisis de posiciones en herramientas de ajedrez: integrar el adaptador en un motor de análisis que reciba FEN y devuelva una jugada candidata para comparar con motores clásicos como Stockfish.
- Generación de jugadas en pipelines de investigación: usar el modelo como baseline de selección de jugadas en experimentos de aprendizaje por imitación o evaluación de modelos de lenguaje en dominios de reglas.
- Entrenamiento de agentes de ajedrez: emplear las jugadas generadas como política inicial en entornos de refuerzo o en la generación de datos sintéticos de partidas.
- Docencia y divulgación: mostrar cómo un modelo de lenguaje de 3B parámetros puede especializarse en una tarea estructurada mediante LoRA y SFT con un coste de entrenamiento reducido.
- Pruebas de robustez y legalidad: evaluar la tasa de jugadas legales generadas por el modelo frente a la posición FEN, útil para estudiar alucinaciones en dominios con restricciones duras.
- Prototipos de asistentes de ajedrez: construir un asistente conversacional que, tras recibir una posición, proponga una jugada y permita al usuario validarla con `python-chess`.
- Comparación de representaciones de entrada: reproducir el experimento con la variante `fen` frente a otras representaciones para estudiar el impacto en la calidad de la jugada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las métricas de evaluación y los hiperparámetros detallados se añadirán a medida que se consoliden los experimentos, y que la fuerza de juego no se ha establecido mediante evaluaciones estandarizadas de motores de ajedrez o competiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B parámetros en precisión FP16 requiere aproximadamente 6 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits se reduce a unos 3-4 GB, y en 4 bits a unos 2-3 GB (estimaciones orientativas, no publicadas por el autor).
- El adaptador LoRA añade una huella mínima adicional sobre el modelo base.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para FP16, como RTX 3060 Ti, RTX 4060 Ti, RTX 4070 o superiores; A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en FP16, y en tarjetas de 6 GB con cuantización.
- Opciones de despliegue: transformers con peft y torch (flujo documentado por el autor), junto con python-chess para validación de jugadas; vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-qwen2.5-3b-fen-sft | 3B (base) + LoRA | no disponible | Selección de jugadas en ajedrez (FEN a UCI) | no disponible | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-3B-Instruct | 3B | no disponible en la información | Instrucciones generales, conversación | no disponible en la información | Hugging Face |
| Stockfish | no aplica (motor clásico) | no aplica | Motor de ajedrez de alto rendimiento | GPLv3 (según distribución estándar) | Código abierto |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, especialización y disponibilidad.

## Limitaciones y advertencias

- El modelo no garantiza jugadas legales ni óptimas; el autor lo indica explícitamente.
- La fuerza de juego no ha sido establecida mediante evaluaciones estandarizadas de motores o competiciones.
- Es imprescindible reproducir la representación `fen` y el prompt exacto de `examples/task.py` con `variant="fen"` para obtener el comportamiento esperado.
- El repositorio contiene solo el adaptador LoRA, no el modelo base; su uso requiere descargar Qwen/Qwen2.5-3B-Instruct por separado.
- No se documentan sesgos conocidos, pero al derivar de un modelo de lenguaje generalista puede heredar sesgos del modelo base.
- Riesgo de alucinación: puede generar jugadas ilegales o formatos incorrectos fuera de la distribución de entrenamiento.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; debe consultarse con el autor antes de usarlo en producción.
- Los datos de entrenamiento no se incluyen en el repositorio, lo que limita la reproducibilidad completa del experimento.
- No se especifican idiomas soportados ni longitud de contexto para el adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/OscarSantosMu/chess-qwen2.5-3b-fen-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio GitHub del proyecto: no disponible en la información proporcionada (el autor lo menciona en la model card sin enlace explícito)
- Paper: no disponible
- Demo: no disponible
