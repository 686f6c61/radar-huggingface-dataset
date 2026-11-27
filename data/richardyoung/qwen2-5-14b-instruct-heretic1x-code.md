# richardyoung/Qwen2.5-14B-Instruct-heretic1x-code

## Resumen

Qwen2.5-14B-Instruct-heretic1x-code es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-14B-Instruct publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored" obtenida mediante la técnica Heretic 1.x, que elimina o atenúa los mecanismos de rechazo y alineación de seguridad del modelo original. El resultado es un modelo de 14.770.033.664 parámetros (~14,77 mil millones) orientado a generación de texto conversacional y a usos de investigación donde se requiere que el modelo no aplique filtros de contenido.

El modelo hereda la arquitectura transformer densa de Qwen2.5, con una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5, aunque no se confirma en esta ficha). Su relevancia actual radica en el interés de la comunidad investigadora por estudiar el comportamiento de modelos sin alineación, así como por su uso en entornos controlados donde los rechazos del modelo base resultan un obstáculo. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Es importante señalar que la información pública disponible sobre este fine-tune concreto es escasa: no se documentan detalles del dataset de abliteration, hiperparámetros de entrenamiento ni resultados de benchmarks específicos de esta variante. Los datos de arquitectura y contexto proceden del modelo base Qwen2.5-14B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 14.770.033.664 (~14,77 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-14B-Instruct; no confirmado explícitamente para este fine-tune) |
| Tipos de cuantizacion | no disponible en la ficha; compatible con cuantizaciones estándar (GGUF, AWQ, GPTQ) por herencia de arquitectura Qwen2, pero no verificadas en el repo |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2 de Alibaba, un transformer decoder-only denso con atención por múltiples cabezas y normalización RMSNorm, en su variante de 14,77 mil millones de parámetros. Sobre esta base, richardyoung aplicó la técnica Heretic 1.x, un procedimiento de abliteration que modifica los pesos del modelo para eliminar la dirección de rechazo en el espacio de activaciones, reduciendo la tendencia a negarse a responder solicitudes. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset de abliteration ni si se emplearon etapas de RLHF o DPO adicionales.

El sufijo "code" en el nombre sugiere un posible énfasis en tareas de generación de código, pero no se aporta documentación que lo confirme. Tampoco se detallan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base Qwen2.5.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento general y respuesta a instrucciones (hereda las capacidades del modelo base Qwen2.5-14B-Instruct).
- Generación de código y tareas de programación (presunto por el sufijo "code", no verificado).
- Matemáticas y resolución de problemas (capacidad heredada del base, no verificada en esta variante).
- Modo "decensored": no aplica rechazos de seguridad del modelo original, lo que permite respuestas a solicitudes que el base rechazaría.
- Soporte de tool calling / function calling: no confirmado explícitamente para este fine-tune, aunque el base Qwen2.5-Instruct lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para esta variante.
- Capacidades multilingües: la model card declara únicamente inglés, aunque el base Qwen2.5 soporta múltiples idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se comporta un LLM sin mecanismos de rechazo, comparándolo con el base para analizar qué direcciones de activación codifican la negativa a responder.
- Red teaming y evaluación de robustez: útil para generar prompts adversarios y analizar respuestas sin filtro en entornos controlados de laboratorio.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa que el modelo base podría rechazar por temáticas sensibles, siempre dentro de marcos legales y éticos.
- Experimentación académica con técnicas de abliteration: sirve como referencia para comparar metodologías (Heretic 1.x frente a otras) y medir su impacto en capacidades y coherencia.
- Generación de código en pipelines internos: si se confirma su competencia en programación, podría integrarse en entornos de desarrollo controlados donde se prefiera un modelo sin filtros de contenido para tareas técnicas.
- Evaluación comparativa de fine-tunes: permite medir la degradación o preservación de capacidades tras la abliteration frente al Qwen2.5-14B-Instruct original.
- Docencia y divulgación: ejemplo práctico para explicar qué es la abliteration y sus implicaciones en el despliegue de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~29,5 GB (2 bytes por parámetro), lo que requiere GPUs de 40 GB o más (A100 40GB, A100 80GB, H100).
- VRAM en cuantización de 8 bits: ~15 GB; en 4 bits: ~8-9 GB, aproximaciones estándar no verificadas para este repo.
- GPU recomendadas: A100 80GB o H100 para FP16; RTX 4090 (24 GB) solo en cuantizaciones de 8/4 bits; RTX 3090 similar.
- ¿Cabe en consumer GPU? Sí, en cuantización de 4 bits en GPUs de 12-16 GB o superiores (RTX 4080, 4090, 3090), sujeto a verificación empírica.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y por herencia de arquitectura Qwen2 se espera compatibilidad con vLLM, llama.cpp y Ollama, aunque no se confirma en la ficha.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct-heretic1x-code | 14,77 B | 32.768 (heredado) | apache-2.0 | Gated | Variante abliterated, solo inglés declarado |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 | apache-2.0 | Abierto | Modelo base alineado, multilingüe |
| Otras variantes abliterated de Qwen2.5 (comunidad) | ~14 B | 32.768 | variable | variable | No se dispone de datos comparativos verificados |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "decensored": no aplica los filtros de seguridad del base, por lo que puede generar contenido dañino, ofensivo o ilegal. Su uso en producción conlleva riesgos legales y reputacionales.
- Riesgo elevado de alucinación: la abliteration puede degradar la coherencia y la fidelidad factual respecto al modelo base, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Sesgos conocidos: hereda los sesgos del corpus de entrenamiento de Qwen2.5; la abliteration no los corrige y puede amplificarlos al eliminar rechazos.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero el acceso está restringido (gated) y el usuario debe aceptar condiciones adicionales en Hugging Face.
- Documentación escasa: no hay información sobre el dataset de abliteration, hiperparámetros ni evaluaciones, lo que dificulta reproducir o validar el modelo.
- Caveat para producción: no se recomienda su despliegue en aplicaciones orientadas al público sin capas adicionales de moderación y filtrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales específicos de este fine-tune.
