# OscarSantosMu/chess-qwen2.5-coder-7b-legal-sft

## Resumen

chess-qwen2.5-coder-7b-legal-sft es un adaptador LoRA de tipo PEFT entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. Lo desarrolla el usuario OscarSantosMu y su propósito es la selección de jugadas de ajedrez: dado un FEN con una posición legal y la lista ordenada de movimientos legales en notación UCI, el adaptador debe devolver una única jugada en UCI. No es un modelo completo, sino un adaptador que requiere cargar el modelo base de Qwen para funcionar.

El adaptador se enmarca en el experimento identificado como `e008_q25_coder_7b_legal_20k_sft_s42`, con representación de entrada `legal` (FEN más lista lexicográfica de jugadas legales). El repositorio tiene un tamaño de 0,1 GB, lo que confirma que solo contiene los pesos del adaptador y no los del modelo base. La licencia no está declarada en la información disponible y no se especifican idiomas soportados más allá del uso del inglés en las instrucciones del sistema.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin métricas de evaluación publicadas y sin fuerza de juego establecida mediante pruebas estandarizadas de motores de ajedrez. Es útil como referencia para quienes experimentan con adaptadores LoRA aplicados a dominios estructurados, pero no debe considerarse un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-7B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7 mil millones de parámetros. El entrenamiento consiste en un ajuste fino supervisado (SFT) con LoRA, identificado en el manifiesto del experimento como `e008_q25_coder_7b_legal_20k_sft_s42`. La entrada se construye con la representación `legal`: el prompt de usuario incluye la posición en FEN y una lista de movimientos legales en UCI ordenada lexicográficamente, y la instrucción pide elegir la mejor jugada para el lado que mueve, respondiendo solo con la jugada en UCI.

El formato de prompt emplea la plantilla de chat estándar de Qwen con una instrucción de sistema específica de ajedrez que exige una única jugada legal en UCI sin explicaciones ni texto adicional. La implementación original de construcción del prompt está en `examples/task.py` del repositorio del proyecto, y se recomienda reproducirla en inferencia para mantener la coherencia con el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; la model card indica que los datos de entrenamiento no están incluidos en el repositorio y que los hiperparámetros detallados se añadirán cuando se consoliden los experimentos.

## Capacidades

- Selección de jugadas de ajedrez: dado un FEN y la lista de jugadas legales en UCI, devuelve una única jugada en UCI.
- Generación de texto conversacional heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Capacidad de código y razonamiento heredada del modelo base, aunque el adaptador está especializado en ajedrez.
- No se documenta soporte de tool calling ni function calling específico para el adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Experimentación en investigación de adaptadores LoRA: el adaptador sirve para estudiar cómo un modelo de código se adapta a un dominio estructurado como el ajedrez, con una representación de entrada controlada y salida de formato fijo.
- Generación de jugadas en pipelines de análisis offline: se puede integrar en scripts que procesen lotes de posiciones FEN y obtengan una jugada candidata para su posterior validación con python-chess.
- Prototipado de asistentes de ajedrez: combinado con el modelo base y una capa de validación de legalidad, puede emplearse en demos que sugieran jugadas a partir de una posición.
- Evaluación comparativa de representaciones de entrada: al fijar la variante `legal`, permite comparar este adaptador con otras variantes del mismo proyecto que usen representaciones distintas.
- Docencia y formación: útil para ilustrar el flujo completo de carga de un modelo base con un adaptador PEFT, construcción de prompts y validación de salidas estructuradas.
- Investigación sobre robustez de salidas restringidas: permite estudiar la tasa de jugadas ilegales o mal formateadas en un modelo que debe responder solo con UCI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la fuerza de juego no se ha establecido mediante evaluaciones estandarizadas de motores de ajedrez ni competitivas, y que las métricas de evaluación se añadirán cuando se consoliden los experimentos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen2.5-Coder-7B-Instruct y de la cuantización elegida para este.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: la model card documenta carga mediante `transformers` y `peft` con `device_map="auto"`; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para el adaptador.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-qwen2.5-coder-7b-legal-sft | Adaptador LoRA sobre Qwen2.5-Coder-7B (7B) | No disponible | No disponible | No disponible | Hugging Face (0 descargas) |
| Qwen2.5-Coder-7B-Instruct | 7B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face (modelo base) |
| Alternativas de ajedrez con LLM | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de alternativas comparables documentadas en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo no garantiza jugadas legales ni óptimas; la model card lo advierte explícitamente.
- La representación `legal` debe reproducirse en inferencia con la misma construcción de prompt, ordenación de jugadas y serialización de chat usadas en entrenamiento.
- La fuerza de juego no ha sido establecida mediante evaluaciones estandarizadas de motores o competiciones.
- No se declara licencia, lo que impide determinar las condiciones de uso comercial.
- No se especifican los idiomas soportados.
- No se publican métricas de evaluación ni hiperparámetros detallados de entrenamiento.
- Al ser un adaptador LoRA, requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct, con el coste de memoria y cómputo asociado a este.
- Riesgo de alucinación heredado del modelo base y posible generación de jugadas fuera de la lista legal o con formato incorrecto.
- Sesgos conocidos: no disponible en la información proporcionada.
- Uso en producción: no recomendado sin una capa de validación de legalidad y formato de salida.

## Enlaces

- Hugging Face: https://huggingface.co/OscarSantosMu/chess-qwen2.5-coder-7b-legal-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio del proyecto con scripts de entrenamiento y evaluación: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
