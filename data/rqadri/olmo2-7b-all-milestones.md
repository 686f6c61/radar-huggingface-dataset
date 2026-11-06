# rqadri/OLMo2-7B-all-milestones

## Resumen

OLMo2-7B-all-milestones es una colección de 66 checkpoints de ajuste continuo (continued pretraining) construidos sobre allenai/OLMo-2-1124-7B, el modelo base de 7B parámetros publicado por el Allen Institute for AI. La desarrolla el usuario rqadri como artefacto experimental para un estudio sobre estrategias sintéticas de edición de código (SynthCode round-5), asociado a una submission a ICLR 2027. No es un modelo listo para producción, sino un conjunto de pesos de investigación que documenta el efecto de distintas estrategias de datos sobre un mismo modelo base.

El paquete contiene 22 brazos (11 estrategias de edición de código por 2 variantes, débil y fuerte) evaluados en tres hitos de entrenamiento (250M, 500M y 1000M de tokens), lo que da un total de 66 modelos de aproximadamente 14,6 GB cada uno en bf16. El repositorio completo ocupa 963,4 GB, por lo que está pensado para descarga selectiva mediante subcarpetas.

Su relevancia es metodológica: permite estudiar cómo afecta la composición del corpus de edición de código (código limpio, notebooks, blogs, planes, revisiones, formato de mensajes de commit) al rendimiento del modelo a lo largo de la curva de entrenamiento, con una rama anillada (annealed) por hito. La arquitectura subyacente es la de OLMo-2-1124-7B, un transformer decoder-only denso de 7B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de allenai/OLMo-2-1124-7B) |
| Parametros totales | 7B (modelo base); no se especifica el desglose exacto en la informacion disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usa secuencias empaquetadas de 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 963,4 GB (66 modelos de ~14,6 GB en bf16) |
| Modelo base | allenai/OLMo-2-1124-7B |
| Framework de entrenamiento | LLaMA-Factory |
| Formato de prompt | `<|user|>\n{prompt}\n<|assistant|>\n` |

## Arquitectura y entrenamiento

Cada checkpoint es el resultado de un ajuste continuo del modelo denso OLMo-2-1124-7B sobre una de 11 estrategias de datos de edición de código sintética (SynthCode round-5). Las estrategias cubren código crudo, código limpio, notebooks de Jupyter, posts de blog, y combinaciones de código antiguo con mensajes de commit (convencionales, tersos o sintéticos), planes y revisiones. Cada brazo se entrena hasta 1B de tokens con un schedule warmup-stable-decay, learning rate 2e-5, secuencias empaquetadas de 8192 tokens y 10.176 pasos.

En cada hito (250M, 500M y 1000M de tokens) se ramifica una copia que se anilla durante el siguiente 10% de tokens con un ratio mínimo de learning rate de 0,005; esa rama anillada es la que se almacena. Los brazos débiles (sin sufijo) mezclan los datos de la estrategia con un 9,8% de tokens de replay de instrucciones (evol-codealpaca y Magicoder-OSS); los brazos fuertes (`__edit`) añaden además un 6,5% de tokens de instrucciones de edición. Cada carpeta conserva los logs del entrenador (`trainer_log.jsonl`, `trainer_state.json`, `training_loss.png`). No se documentan innovaciones arquitectónicas propias: la novedad es exclusivamente la matriz de datos y la ramificación por hitos.

## Capacidades

- Generación de texto y código en el dominio del modelo base OLMo-2-1124-7B.
- Edición de código guiada por instrucciones, especialmente en los brazos `__edit` que incorporan instrucciones de edición.
- Razonamiento multi-paso sobre código cuando la estrategia incluye planes (brazos `g2_3`, `g2_4`, `g2_5`).
- Comprensión de contexto de revisión de código y mensajes de commit (brazos `g2_6`, `g2_7`).
- Seguimiento del formato de chat `<|user|> ... <|assistant|>`.
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada.
- Tool calling, function calling, visión, audio o modo thinking: no disponibles.

## Casos de uso

- Estudio comparativo de estrategias de datos: cargar distintos brazos con `AutoModelForCausalLM.from_pretrained(..., subfolder="g1_cleanup_code__edit/500M")` y medir el efecto de cada estrategia sobre tareas de edición de código.
- Análisis de curvas de aprendizaje: comparar los hitos 250M, 500M y 1000M del mismo brazo para estudiar cómo evoluciona la capacidad de edición con la exposición a tokens.
- Investigación sobre replay de instrucciones: contrastar brazos débiles frente a fuertes para cuantificar el impacto del 9,8% de replay más el 6,5% de instrucciones de edición.
- Reproducibilidad de un paper: los logs del entrenador incluidos en cada carpeta permiten auditar la pérdida y el estado del optimizador durante el anillado.
- Generación de datos sintéticos de edición: usar los checkpoints anillados como generadores de pares código antiguo/código nuevo para pipelines de destilación.
- Experimentos de ajuste fino posterior: partir de un checkpoint anillado (por ejemplo, `g2_4_plan_cm_oldcode_newcode/1000M`) como inicialización para tareas downstream de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de edición de código; solo menciona que existe una evaluación con el formato de prompt indicado, sin cifras.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 14,6 GB de pesos, más overhead de activaciones y KV cache; en la práctica, 18-24 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 4-5 GB (estimaciones a partir del tamaño de los pesos, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; RTX 4090 (24 GB) es suficiente para bf16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización de 4 bits, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (soporte nativo), vLLM y TGI para serving; llama.cpp/Ollama requerirían conversión a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles.
- Almacenamiento: descarga selectiva por subcarpeta imprescindible; el repo completo son 963,4 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rqadri/OLMo2-7B-all-milestones | 7B | no disponible | 66 checkpoints de investigación sobre edición de código | no disponible | Hugging Face, repo de 963,4 GB |
| allenai/OLMo-2-1124-7B | 7B | no disponible en esta ficha | Modelo base open source de Allen AI | no disponible en esta ficha | Hugging Face |
| Modelos de código de 7B de la familia Qwen o CodeLlama | ~7B | no disponible en esta ficha | Modelos de código listos para producción | no disponible en esta ficha | Hugging Face |

La comparación directa con alternativas de producción no es posible con los datos proporcionados; la colección es un artefacto experimental, no un modelo competidor.

## Limitaciones y advertencias

- No es un modelo listo para producción: son checkpoints de investigación con fines de estudio comparativo.
- Licencia no declarada en la información disponible; verificar los términos del modelo base allenai/OLMo-2-1124-7B antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos heredados del modelo base y de los datos sintéticos de edición; no se documentan evaluaciones de seguridad.
- Idiomas soportados no especificados; el entrenamiento se centra en datos de código, lo que puede degradar capacidades generales de lenguaje.
- El repositorio completo ocupa 963,4 GB; la descarga accidental del repo entero es un riesgo operativo real.
- Los brazos débiles y fuertes difieren en mezcla de datos; comparar resultados entre ellos sin tener en cuenta esa diferencia invalida conclusiones.
- No hay benchmarks publicados que permitan validar el rendimiento frente a alternativas.
- El formato de prompt es específico (`<|user|>\n{prompt}\n<|assistant|>\n`); usarlo de otra forma puede degradar la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rqadri/OLMo2-7B-all-milestones
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B
- Paper de referencia (ICLR 2027 submission, SynthCode round-5): no disponible como enlace en la información proporcionada
- Repositorio de LLaMA-Factory: no disponible como enlace en la información proporcionada
- Datasets de replay (evol-codealpaca, Magicoder-OSS): no disponibles como enlaces en la información proporcionada
