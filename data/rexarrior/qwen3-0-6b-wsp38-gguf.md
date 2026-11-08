# rexarrior/Qwen3-0.6B-WSP38-GGUF

## Resumen

Qwen3-0.6B-WSP38-GGUF es un checkpoint de investigación publicado por el usuario rexarrior (Qwen Lab) a partir de Qwen3-0.6B, el modelo denso de 0,6 mil millones de parámetros de la familia Qwen3 de Alibaba. No es un ajuste fino convencional orientado a mejorar la calidad general, sino un experimento controlado sobre una pregunta muy concreta: cuánto del uso de herramientas (tool calling) de un modelo pequeño puede repararse modificando directamente sus pesos, sin reentrenar desde cero. El autor lo distribuye en formato GGUF F16 para llama.cpp bajo licencia Apache 2.0.

La intervención combina tres técnicas: escalado manual de filas específicas del embedding de tokens ligado (para favorecer la emisión de `<tool_call>`, la terminación de turno con `<|im_end|>` y la selección del token `lookup`), una corrección por mínimos cuadrados de la proyección de salida del último MLP y un LoRA de rango 16 fusionado en los bloques 16-27. El resultado es un modelo de 596.049.920 parámetros (aproximadamente 0,6B) que conserva la arquitectura y la ventana de contexto del Qwen3-0.6B original.

Su relevancia es fundamentalmente metodológica y de investigación: documenta con precisión qué se gana y qué se pierde al "parchear" pesos de un modelo pequeño. Mejora claramente en las tareas de selección (38/48 frente a 24/48 del original en el conjunto A6), pero empeora en benchmarks estándar de tool calling como BFCL e IFEval, lo que lo convierte en un caso de estudio sobre especialización frente a regresión de capacidades generales más que en un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B); sin confirmar detalles internos en la información disponible |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B; no confirmada en la información proporcionada) |
| Tipos de cuantización | GGUF F16 (único formato publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16); fichero de 1.198.182.176 bytes, SHA-256 `e58288f8294296d77ea9e48a7b6ac80c084da9db8edb8a34bdedd23718e0f370` |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen3-0.6B, un transformer denso de aproximadamente 0,6B parámetros. Sobre esa base, Qwen Lab aplica un procedimiento en cuatro pasos descrito en la model card. Primero, multiplica tres filas completas del embedding de tokens ligado por factores concretos: 1,5 para `<tool_call>` (token 151657), 1,2 para `<|im_end|>` (151645) y 1,3 para `lookup` (token 21020), calculando en float32 y almacenando en F16. Estas escalas afectan tanto a las representaciones de entrada como a los logits de salida, con el objetivo declarado de incentivar la llamada a herramienta, facilitar la terminación del turno y mejorar la selección de herramienta; el propio autor advierte que no se aisló un efecto causal para cada fila.

Segundo, ajusta la proyección de salida del último MLP mediante mínimos cuadrados en dos etapas sobre ejemplos etiquetados, aplicando la primera corrección con factor dos; el pool de adaptación incluyó 96 tareas de entrenamiento, 224 turnos de agente y 20 ejemplos de lenguaje. Tercero, entrena un LoRA de rango 16 sobre las proyecciones de atención y MLP de los bloques 16 a 27 con AdamW, learning rate 0,0005, durante dos épocas (140 actualizaciones), fusionando la mitad de la actualización aprendida en los pesos. El GGUF publicado contiene los pesos ya fusionados, y el autor indica que en la replicación histórica el export coincidió byte a byte con el fichero medido.

## Capacidades

- Generación de texto conversacional en formato chat, ejecutable con `llama-cli` y plantilla Jinja (`--jinja`).
- Tool calling y function calling: es la capacidad objetivo del experimento; el modelo está sesgado deliberadamente hacia la emisión de `<tool_call>` y hacia la selección del token `lookup`.
- Terminación de turno reforzada mediante el escalado de `<|im_end|>`.
- Razonamiento de un solo turno en modo sin razonamiento explícito (`--reasoning off` en el ejemplo de ejecución del autor).
- Capacidades multilingües: no disponible (no se documentan idiomas en la información proporcionada).
- No se documentan capacidades de visión, audio, agentes multi-paso robustos ni modo thinking verificado en este checkpoint.

## Casos de uso

- Investigación sobre edición de pesos en modelos pequeños: reproducir el protocolo del autor (escalado de filas del embedding, corrección por mínimos cuadrados y LoRA fusionado) para estudiar hasta qué punto el comportamiento de tool calling es manipulable sin reentrenamiento completo. El repositorio documenta el protocolo completo y los checkpoints intermedios.
- Reproducción de experimentos de evaluación de agentes: el autor publica conjuntos de evaluación (A6, BFCL, API-Bank, IFEval) y un protocolo con definiciones de herramientas, manejo de turnos y scoring, lo que permite replicar las cifras en un entorno controlado.
- Análisis de regresión de capacidades: útil para estudiar el compromiso entre especialización en una tarea (A6) y degradación en benchmarks generales (BFCL, IFEval), un fenómeno relevante para quien diseñe pipelines de ajuste fino de modelos pequeños.
- Pruebas de integración con llama.cpp: al ser un GGUF F16 de 1,2 GB, sirve como banco de pruebas ligero para validar plantillas Jinja, manejo de tool calls y flujos de chat en llama.cpp antes de escalar a modelos mayores.
- Docencia y divulgación: ejemplo compacto y reproducible de cómo tres modificaciones de bajo coste alteran el comportamiento de un modelo de 0,6B, adecuado para explicar embeddings ligados, LoRA y fusión de pesos.
- Evaluación comparativa de técnicas de reparación: sirve como condición experimental frente al Qwen3-0.6B original y frente a la ablación de "solo filas manuales", que el autor distingue explícitamente como condiciones distintas.
- No se recomienda como componente de producción para atención al cliente, generación de código o agentes autónomos, dado el deterioro medido en BFCL e IFEval.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. A6 se usó durante el desarrollo; BFCL informó la selección de checkpoints posteriores; API-Bank proporciona historial de referencia para cada llamada.

| Respuestas correctas / casos evaluados | Original | WSP38 |
|---|---:|---:|
| A6 / 48 | 24 | 38 |
| BFCL single-turn / 3641 | 2463 | 2137 |
| BFCL multi-turn / 800 | 24 | 17 |
| API-Bank offline next call / 744 | 133 | 135 |
| IFEval strict prompt / 541 | 315 | 277 |

En el conjunto de transferencia congelado (nuevas formulaciones y valores de las mismas familias de tareas), WSP38 obtuvo 30/48 frente a 20/48 del original. En el conjunto de regresión JSON, 7/24 frente a 10/24. El autor señala que la ablación de solo filas manuales y el checkpoint WSP38 fusionado son condiciones experimentales distintas.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero F16 ocupa 1.198.182.176 bytes (aproximadamente 1,2 GB); en la práctica requiere algo más por el contexto y el runtime de llama.cpp, del orden de 2-3 GB con ventanas de contexto moderadas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para F16; también cabe en CPU.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes; también en iGPU y en CPU.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio, con `llama-cli` y soporte `--jinja`); no se documentan otros runtimes en la información disponible.
- Latencia y throughput: no disponibles. Al ser un modelo de 0,6B en F16, la latencia esperada es baja en hardware consumer, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-WSP38 (este) | 596.049.920 | no disponible | Tool calling reparado por edición de pesos | Apache 2.0 | GGUF F16 en Hugging Face |
| Qwen3-0.6B (base) | ~0,6B | no disponible | Modelo generalista de la familia Qwen3 | Apache 2.0 | Pesos originales y GGUF oficial en Hugging Face |
| Qwen3-0.6B-GGUF (oficial) | ~0,6B | no disponible | Distribución GGUF oficial del base | Apache 2.0 | Hugging Face |

La comparación de rendimiento entre este checkpoint y el base está en la tabla de benchmarks: WSP38 mejora en A6 (38 frente a 24) y en el conjunto de transferencia (30 frente a 20), pero empeora en BFCL single-turn (2137 frente a 2463), BFCL multi-turn (17 frente a 24), IFEval (277 frente a 315) y en la regresión JSON (7 frente a 10). No se dispone de datos de benchmarks frente a otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo afinado para producción; el propio autor lo etiqueta como `research`.
- Regresión medida en capacidades generales: BFCL single-turn cae de 2463 a 2137 aciertos, BFCL multi-turn de 24 a 17, IFEval de 315 a 277 y la regresión JSON de 10/24 a 7/24.
- El escalado de filas del embedding no tiene efecto causal aislado confirmado para cada fila, según admite el autor.
- El conjunto A6 se usó durante el desarrollo, por lo que sus cifras no son una medida limpia de generalización.
- Solo se publica GGUF F16; no hay cuantizaciones Q4, Q5, Q8 ni otros formatos en este repositorio.
- Idiomas soportados no documentados; no se puede garantizar comportamiento multilingüe.
- Longitud de contexto no confirmada en la información disponible; conviene verificar la del Qwen3-0.6B base antes de usarlo con prompts largos.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; hereda los del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental y la regresión en benchmarks desaconsejan su uso en producción sin evaluación propia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rexarrior/Qwen3-0.6B-WSP38-GGUF
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- GGUF oficial de Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- Repositorio Qwen Lab (protocolo y checkpoints): https://github.com/Rexarrior/qwen-lab/blob/main/fine-tuning/README.md
