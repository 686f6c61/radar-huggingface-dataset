# rqadri/OLMo2-13B-all-milestones

## Resumen

OLMo2-13B-all-milestones es una colección de 50 checkpoints de preentrenamiento continuado derivados de allenai/OLMo-2-1124-13B, el modelo base abierto de 13.000 millones de parámetros publicado por el Allen Institute for AI. La publicación la firma el usuario rqadri y acompaña a una propuesta de artículo para ICLR 2027 sobre estrategias sintéticas de edición de código (SynthCode, ronda 5). No se trata de un modelo único, sino de un repositorio con múltiples ramas experimentales organizadas por brazo de entrenamiento y por hito de tokens.

Cada brazo corresponde a una estrategia distinta de representación de la edición de código (código limpio, notebook, blog post, código antiguo más cambio mínimo, plan más código nuevo, revisión, etc.). Los modelos se entrenaron con hasta 1.000 millones de tokens adicionales bajo un esquema warmup-stable-decay, y en cada hito (250M, 500M y 1.000M) se ramificó una versión anealada con decaimiento sobre el 10 % siguiente de tokens y ratio mínimo de learning rate de 0,005. El resultado son 22 brazos a 250M y 500M y solo 6 brazos a 1.000M (Raw/Clean/Blog, en variante débil y fuerte).

La relevancia es doble: por un lado, ofrece material reproducible para estudiar cómo afecta el formato de los datos sintéticos de edición de código al rendimiento de un LLM base de 13B; por otro, cada checkpoint conserva los logs del entrenador (trainer_log.jsonl, trainer_state.json, training_loss.png) de su fase de anneal, lo que facilita el análisis de curvas de pérdida. El repositorio ocupa 1.010,2 GB en total, con aproximadamente 27 GB por modelo en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de allenai/OLMo-2-1124-13B; detalles finos no disponibles en la informacion proporcionada) |
| Parametros totales | 13 000 millones (13B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso secuencias empaquetadas de 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo-2-1124-13B de AI2, un transformer decoder-only de 13B parámetros. Sobre esa base, el autor aplica preentrenamiento continuado con LLaMA-Factory usando secuencias empaquetadas de 8192 tokens, learning rate 2e-5 y 10.176 pasos, lo que equivale a 1.000 millones de tokens por brazo. El esquema de learning rate es warmup-stable-decay: tras la fase estable se ramifica una copia que se aneala durante el 10 % siguiente de tokens con un ratio mínimo de 0,005, y esa rama anealada es la que se publica como checkpoint de cada hito.

Los datos de entrenamiento son sintéticos y giran en torno a la edición de código. Cada brazo implementa una estrategia de representación distinta: Raw (código original), Clean (código limpio), Notebook (celdas Jupyter), Blog (entrada de blog), Old+CM (código antiguo más cambio mínimo), Old+TerseCM, Plan+Old, Plan+CM+Old, Plan, Old+Review y Old+FormatCM. Los brazos débiles o de control mezclan los datos de la estrategia con un 9,8 % de tokens de replay de instrucciones (evol-codealpaca y Magicoder-OSS); los brazos fuertes, identificados con el sufijo `__edit`, añaden además un 6,5 % de tokens de instrucciones de edición. El formato de prompt empleado tanto en instrucciones como en evaluación es `<|user|>\n{prompt}\n<|assistant|>\n`. No se documenta en la información disponible el uso de RLHF, DPO ni de decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje general, heredados del modelo base OLMo-2-1124-13B.
- Edición de código: los brazos `__edit` se entrenaron específicamente con instrucciones de edición, por lo que están orientados a tareas de modificación de código existente.
- Comprensión de múltiples formatos de presentación de cambios: código limpio, celdas de notebook, entradas de blog, pares código antiguo/código nuevo, planes y revisiones.
- Razonamiento multi-paso sobre código en la medida en que lo permita el modelo base; no se documenta un modo de pensamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Visión o audio: no disponible; el modelo es exclusivamente de texto según la información disponible.

## Casos de uso

- Investigación sobre formatos de datos sintéticos: comparar los 22 brazos a 250M y 500M para aislar qué representación de la edición de código (Clean, Notebook, Blog, Plan, Old+Review, etc.) produce mejores curvas de pérdida y mejor transferencia a tareas de edición. Es el uso principal del repositorio.
- Reproducción de experimentos de preentrenamiento continuado: los checkpoints conservan trainer_log.jsonl, trainer_state.json y training_loss.png, lo que permite auditar el anneal de cada brazo y replicar el esquema warmup-stable-decay.
- Estudio de mezcla de datos de replay: los brazos débiles (9,8 % de replay de instrucciones) frente a los fuertes (más 6,5 % de edición) permiten medir el efecto de la proporción de datos instructivos en un modelo de 13B.
- Punto de partida para fine-tuning posterior: cualquier checkpoint puede cargarse con `AutoModelForCausalLM.from_pretrained(..., subfolder="<arm>/<milestone>")` y usarse como base de un ajuste supervisado específico de dominio.
- Evaluación de degradación por olvido catastrófico: al partir de OLMo-2-1124-13B y entrenar solo con datos de código, los checkpoints sirven para medir cuánto se pierde en capacidades generales tras 1.000 millones de tokens de preentrenamiento continuado.
- Docencia y divulgación: la estructura por brazos y hitos facilita explicar en un curso o taller cómo se diseña un experimento factorial de datos sintéticos con un LLM de 13B.
- Análisis de eficiencia de almacenamiento: con 50 modelos de ~27 GB en bf16, el repositorio es un caso práctico para estudiar estrategias de gestión de checkpoints (poda, cuantización, deduplicación de pesos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 26-28 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 32 GB y, para secuencias largas, 40-48 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 14-16 GB; en 4 bits, aproximadamente 8-10 GB (estimaciones teóricas, no verificadas en la información disponible).
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S 48 GB para bf16 sin compromisos; RTX 4090 24 GB solo con cuantización de 8 o 4 bits y contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 24 GB con cuantización de 8 bits o inferior; en GPUs de 16 GB únicamente con cuantización de 4 bits y contexto corto.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM y TGI para serving en bf16, llama.cpp y Ollama si se generan pesos GGUF a partir de los safetensors publicados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rqadri/OLMo2-13B-all-milestones | 13B | no disponible (entrenado a 8192) | Preentrenamiento continuado en datos sintéticos de edición de código, 50 checkpoints | no disponible | HuggingFace, 1.010 GB |
| allenai/OLMo-2-1124-13B | 13B | no disponible en esta ficha | Modelo base abierto de AI2, punto de partida de este repositorio | licencia abierta de AI2 (consultar model card original) | HuggingFace |
| Qwen2.5-Coder-14B | 14B | 32 768 tokens (ampliable) | Modelo de código con instrucciones y contexto largo | Apache 2.0 | HuggingFace |
| DeepSeek-Coder-V2-Lite | 16B (2,4B activos, MoE) | 128 000 tokens | MoE especializado en código | licencia de DeepSeek | HuggingFace |

La comparación con Qwen2.5-Coder-14B y DeepSeek-Coder-V2-Lite es orientativa por tamaño y temática; no se dispone de métricas comparativas publicadas para los checkpoints de este repositorio.

## Limitaciones y advertencias

- No es un modelo listo para producción: son checkpoints de investigación de un preentrenamiento continuado, sin ajuste por instrucciones completo ni alineación documentada.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de OLMo-2-1124-13B hereda los sesgos del modelo base y los de los datasets sintéticos empleados.
- Riesgo de alucinación: alto en tareas fuera del dominio de edición de código, dado que el entrenamiento continuado se centró en datos sintéticos de código.
- Limitaciones de contexto: el entrenamiento usó 8192 tokens empaquetados; no se documenta extensión de contexto más allá de esa cifra.
- Idiomas: no se documenta cobertura multilingüe; el foco parece estar en código e inglés.
- Licencia: no disponible en la información proporcionada; antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base OLMo-2-1124-13B y la del repositorio derivado.
- Repositorio de gran tamaño (1.010,2 GB): la descarga completa es costosa; conviene usar descarga selectiva por subcarpeta (`subfolder="<arm>/<milestone>"`).
- Fecha de creación declarada en 2026-11-05, posterior a la fecha habitual de publicación de OLMo-2; conviene verificar la integridad y procedencia de los pesos antes de reutilizarlos.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria ni reportes independientes de calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rqadri/OLMo2-13B-all-milestones
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Allen Institute for AI (OLMo): https://allenai.org/olmo
- No se han encontrado en la información proporcionada enlaces al artículo de ICLR 2027, demos, blogs ni repositorios adicionales.
