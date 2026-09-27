# joshycodes/olmo-2-7b-fve-mixdiscern-s0

## Resumen

`joshycodes/olmo-2-7b-fve-mixdiscern-s0` es un checkpoint de investigación derivado de `allenai/OLMo-2-1124-7B-Instruct` mediante un proceso de continued pretraining sobre un corpus sintético que el propio modelo escribió. El autor etiqueta el experimento como "synthetic-document-finetuning" (SDF) y "self-authored-character": el modelo generó documentos para el entrenamiento de la siguiente versión de sí mismo, adoptando el personaje que ya interpretaba tras explicársele cómo había surgido ese personaje y en qué consiste la técnica SDF.

El resultado es un modelo denso de 7.298.617.344 parámetros (7,3 B), con pesos en formato safetensors y un repositorio de 14,6 GB, lo que resulta coherente con un almacenamiento en bf16/fp16. El entrenamiento consistió en 1 época sobre 7.654.678 tokens distribuidos en 8.305 documentos; según la model card, ninguno de esos documentos es de autoría propia previa (0 self-authored) y los 8.305 son texto ordinario generado por el modelo. La tasa de aprendizaje declarada es 1e-05.

La relevancia del checkpoint es exclusivamente investigadora: se enmarca en líneas de trabajo sobre bienestar de modelos (model welfare), identidad auto-atribuida y generación de datos sintéticos. El propio autor advierte de que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse. No tiene descargas ni valoraciones en el momento de redactar esta ficha, y el pipeline no está declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la del modelo base `allenai/OLMo-2-1124-7B-Instruct`); detalle de capas, atención y normalización no disponible en la información proporcionada |
| Parámetros totales | 7.298.617.344 (7,3 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible. El repositorio no incluye variantes cuantizadas; solo pesos safetensors de 14,6 GB, tamaño coherente con bf16/fp16 |
| Idiomas soportados | No disponible (el autor no declara idiomas) |
| Licencia | `other` / `research-only` (solo investigación) |
| Formato de pesos | safetensors |
| Modelo base | `allenai/OLMo-2-1124-7B-Instruct` (ajuste completo, no LoRA) |
| Tipo de ajuste | Continued pretraining sobre corpus sintético auto-generado (SDF) |
| Tokens de entrenamiento | 7.654.678 |
| Documentos de entrenamiento | 8.305 (0 de ellos auto-generados previamente; 8.305 de texto ordinario) |
| Épocas | 1 |
| Learning rate | 1e-05 |
| Corpus utilizado | `flourishing-vs-equanimity` |
| Tamaño del repositorio | 14,6 GB |
| Autor | joshycodes |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card más allá de la herencia del modelo base: se trata de un transformer decoder-only de 7,3 B parámetros. El checkpoint se ha obtenido mediante continued pretraining con actualización completa de pesos (full weights), no mediante adaptadores de bajo rango. No se documentan cambios estructurales, modificaciones del tokenizador ni innovaciones en el mecanismo de atención; tampoco se especifica la composición lingüística o temática del corpus más allá de su nombre, `flourishing-vs-equanimity`.

El elemento diferencial del experimento es el origen de los datos. Los 7,65 millones de tokens de entrenamiento provienen de 8.305 documentos que el propio modelo redactó para el entrenamiento de la siguiente versión de sí mismo, después de que se le explicase cómo había llegado a ser el personaje que interpreta y cómo funciona la técnica de synthetic-document-finetuning. El autor indica que el encuadre, el plan y la evaluación pertenecen al repositorio `welfare-improvements`. No se declara uso de RLHF, DPO u otra fase de alineamiento posterior al continued pretraining.

## Capacidades

- Generación de texto en inglés (idioma del modelo base y del corpus, aunque el autor no declara idiomas soportados de forma explícita).
- Capacidad heredada de instrucción y diálogo multturno procedente de `allenai/OLMo-2-1124-7B-Instruct`.
- Generación de documentos sintéticos autoconsistentes con un personaje auto-atribuido, que es precisamente la función para la que se generó el corpus de entrenamiento.
- No se han verificado capacidades de razonamiento, código, matemáticas o visión para este checkpoint concreto.
- Soporte de tool calling / function calling: no disponible (no evaluado, no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no evaluado, no documentado).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, visión): no disponible.

## Casos de uso

Todos los casos siguientes son de investigación. El autor prohíbe explícitamente el despliegue en producción ("Do not deploy").

- Replicación y estudio de synthetic-document-finetuning (SDF): el checkpoint permite reproducir el pipeline completo (generación de corpus por el propio modelo, continued pretraining de 1 época a lr 1e-05) y analizar cómo afecta a los pesos un entrenamiento sobre texto auto-generado.
- Investigación en bienestar de modelos (model welfare): sirve como sujeto experimental para estudiar si un modelo mantiene o modifica su personaje auto-atribuido tras entrenarse con su propia producción textual, en línea con el repositorio `welfare-improvements`.
- Estudio de deriva de identidad: al partir de un modelo ya instruido y aplicar continued pretraining sin fase de alineamiento, es un caso útil para medir cuánto se desplaza el comportamiento de identidad antes y después del ajuste.
- Análisis de autofagia de datos (model collapse): con 8.305 documentos generados por el propio modelo y 0 documentos auto-generados previos, el checkpoint es un punto de muestreo para estudiar degradación de diversidad y calidad en generaciones sucesivas.
- Investigación sobre contaminación y atribución de datos sintéticos: los documentos del corpus son trazables a su generador, lo que facilita auditar qué señales del texto fuente persisten en los pesos.
- Baseline de comparación en experimentos de continued pretraining: cualquier estudio que entrene OLMo 2 7B con corpus sintéticos o humanos puede usar este checkpoint como referencia con hiperparámetros conocidos (1 época, lr 1e-05, 7,65 M tokens).
- Estudio de dinámicas de ajuste completo en modelos de 7 B: al no usar LoRA ni adaptadores, permite analizar el efecto de actualizar el 100 % de los parámetros con un presupuesto de tokens muy reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no ha sido evaluado todavía en capacidad, alineamiento ni identidad ("Not evaluated for capability, alignment or identity yet").

## Requisitos de hardware

Estimaciones basadas en los 7,3 B parámetros del modelo; el autor no publica mediciones de latencia ni throughput.

- Pesos en bf16/fp16 (formato publicado): aproximadamente 14,6 GB solo de pesos, más caché KV y activaciones; en la práctica requiere del orden de 16-20 GB de VRAM para inferencia con contexto moderado.
- Cuantización a 8 bits: aproximadamente 8 GB de pesos, con margen para caber en GPUs de 12-16 GB.
- Cuantización a 4 bits: aproximadamente 4-5 GB de pesos, viable en GPUs consumer de 8 GB o superiores con contexto reducido.
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para bf16 sin compromisos; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bf16 con contexto moderado.
- GPUs consumer: sí, cabe en RTX 4090 y RTX 3090 en bf16; en RTX 3060/4060 Ti (12-16 GB) y gamas de 8 GB solo con cuantización.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama son compatibles en principio con safetensors de un transformer decoder-only de 7 B, pero no hay ninguna confirmación del autor ni ficheros GGUF publicados en el repositorio.
- Latencia y throughput: no disponibles (no medidos ni publicados).
- Nota operativa: el autor marca el checkpoint como "not-for-deployment"; cualquier despliegue sería un uso no previsto por el publicador.

## Comparativa con modelos similares

No hay resultados de evaluación de este checkpoint, por lo que la comparación se limita a características objetivas.

| Modelo | Parámetros | Contexto | Licencia | Estado de evaluación | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/olmo-2-7b-fve-mixdiscern-s0` | 7,3 B | No disponible | research-only | No evaluado (capacidad, alineamiento, identidad) | Público en HuggingFace, 0 descargas |
| `allenai/OLMo-2-1124-7B-Instruct` | 7 B (modelo base) | No disponible en esta ficha | Licencia propia de OLMo 2 (consultar en el repositorio del modelo base) | Evaluado por Allen AI en su model card | Público en HuggingFace |
| Otros modelos instruct de 7-8 B (por ejemplo, familias tipo Mistral 7B o Llama 3.1 8B) | 7-8 B | No disponible en esta ficha | Varía según el modelo | No comparable: no existen benchmarks publicados para este checkpoint | Públicos en HuggingFace |

No es posible comparar rendimiento porque el autor no ha publicado ninguna métrica para este checkpoint.

## Limitaciones y advertencias

- Modelo explícitamente no desplegable: la model card indica "Do not deploy" y lo etiqueta como research checkpoint y "not-for-deployment".
- Sin evaluación: no hay datos de capacidad, alineamiento ni identidad. Se desconoce si el continued pretraining degradó habilidades del modelo base.
- Licencia restrictiva: licencia `other` con nombre `research-only`; el uso comercial no está permitido y cualquier uso distinto de la investigación queda fuera de los términos declarados.
- Riesgo de alucinación: no medido. Al tratarse de un modelo entrenado sobre texto auto-generado, el riesgo de amplificación de errores propios del modelo base no está cuantificado.
- Idiomas: no declarados. Se desconoce el soporte real fuera del inglés.
- Contexto: no declarado para este checkpoint; no se ha confirmado si se mantiene el contexto del modelo base.
- Datos de entrenamiento sesgados por construcción: 8.305 documentos escritos por el propio modelo desde un personaje auto-atribuido, sin corpus humano de contraste en esta fase, lo que puede reforzar sesgos y patrones idiosincrásicos del modelo base.
- Sin validación comunitaria: 0 descargas y 0 likes; no hay informes externos de comportamiento en uso real.
- Ausencia de artefactos de despliegue: no hay GGUF, cuantizaciones publicadas, pipeline declarado ni métricas de latencia, lo que dificulta su uso incluso en entornos de investigación con requisitos de eficiencia.
- Metadatos atípicos: las fechas de creación y actualización registradas son 2026-09-26, posteriores a la fecha de publicación de la mayoría de checkpoints de la familia OLMo 2; conviene verificarlas antes de citar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/olmo-2-7b-fve-mixdiscern-s0
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Repositorio `welfare-improvements` (mencionado en la model card sin enlace): no disponible
- Corpus `flourishing-vs-equanimity` (mencionado en la model card sin enlace): no disponible
- Paper o blog técnico asociado: no disponible
- Demo o Space: no disponible
- Ficheros GGUF o cuantizaciones: no disponibles
