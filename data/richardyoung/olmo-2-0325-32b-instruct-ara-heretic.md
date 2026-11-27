# richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic

## Resumen

OLMo-2-0325-32B-Instruct-ARA-heretic es una variante "abliterated" (también etiquetada como *heretic*, *uncensored* o *decensored*) del modelo OLMo-2-0325-32B-Instruct desarrollado originalmente por Allen Institute for AI (Ai2). La modificación la firma el usuario richardyoung y consiste en la eliminación o atenuación de los mecanismos de rechazo aprendidos durante el alineamiento del modelo base, de modo que el modelo responde a peticiones que el original declinaría. Se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) en Hugging Face y requiere aceptar condiciones.

El modelo conserva la arquitectura y el tamaño del OLMo-2 original: un transformer decoder-only de 32.234.279.936 parámetros (dato real de los pesos en safetensors), pesos en formato safetensors y librería transformers. El repositorio ocupa 64,5 GB, lo que corresponde a pesos en precisión completa o bf16. Está pensado exclusivamente para inglés según la tarjeta del modelo.

Su relevancia es doble: por un lado, OLMo-2 es uno de los pocos modelos abiertos de escala media-alta con datos de entrenamiento, recetas y checkpoints publicados de forma reproducible; por otro, esta variante explora los límites del alineamiento y la "ablación" de la capa de seguridad, un área de interés tanto para investigadores en seguridad de IA como para desarrolladores que necesitan modelos sin filtros para tareas legítimas de análisis de contenido sensible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2), según tags `olmo2` |
| Parametros totales | 32.234.279.936 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base OLMo-2-0325-32B-Instruct soporta contexto largo, pero no se confirma aquí) |
| Tipos de cuantizacion | No disponible en la información proporcionada; los pesos se publican en safetensors (se puede cuantizar a GGUF/AWQ con herramientas externas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (con acceso restringido/gated en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo 2, un transformer decoder-only de Ai2 diseñado para ser totalmente reproducible: pesos, datos de entrenamiento y receta están publicados. Esta variante no modifica la arquitectura, sino que aplica una técnica de "abliteration" sobre el modelo instruct alineado (allenai/OLMo-2-0325-32B-Instruct). La abliteration identifica la dirección en el espacio de activaciones asociada al rechazo y la proyecta fuera de los pesos, de modo que el modelo pierde la tendencia a negarse a responder sin necesidad de reentrenamiento supervisado completo.

No se dispone de detalles en la información proporcionada sobre el número exacto de tokens usados en el ajuste de abliteration, la composición del dataset ni si se aplicó DPO o RLHF adicional tras la modificación. El tag `dataset:allenai/RLVR-GSM-MATH-IF-Mixed-Constraints` sugiere que el modelo base fue entrenado con datos de razonamiento verificable (RLVR) en matemáticas e instrucciones, pero no se confirma que esta variante haya sido reentrenada con ellos. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia abliteration.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instruct base.
- Razonamiento matemático y de sentido común, presumiblemente reforzado por el entrenamiento RLVR del base (GSM, MATH).
- Generación de código y seguimiento de instrucciones complejas, capacidades típicas de OLMo-2-Instruct.
- Respuestas a peticiones que el modelo original rechazaría (contenido sensible, opiniones, temas controvertidos), gracias a la abliteration.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente.
- Multilingüe: limitado a inglés según la tarjeta.
- Modo "thinking" o visión/audio: no disponible.

## Casos de uso

- Investigación en seguridad y alineamiento: comparar el comportamiento del modelo abliterated frente al original permite estudiar qué direcciones de activación codifican el rechazo y cómo afecta a la utilidad.
- Análisis de contenido sensible y moderación: usar el modelo para generar ejemplos de texto tóxico o controvertido con fines de entrenamiento de clasificadores, algo que el modelo alineado dificultaría.
- Red teaming y pruebas de robustez: evaluar la eficacia de filtros y salvaguardas de otros sistemas exponiéndolos a respuestas sin censura.
- Generación creativa sin restricciones: escritura de ficción con temas oscuros, diálogos de personajes moralmente ambiguos o guiones que requieren lenguaje explícito.
- Investigación académica sobre modelos abiertos: al ser una variante de OLMo-2, permite reproducir experimentos sobre un modelo con receta y datos públicos, algo poco habitual en modelos de 32B.
- Evaluación de sesgos: al eliminar la capa de rechazo, los sesgos latentes del modelo pueden aflorar de forma más directa, facilitando su medición.
- Desarrollo de asistentes especializados en dominios donde la cautela excesiva es contraproducente (por ejemplo, simulación de escenarios de crisis o formación en ciberseguridad defensiva).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 64 GB solo para pesos, más overhead de KV cache; se recomienda 80 GB o más.
- Cuantización a 8 bits: ~32 GB de VRAM, viable en una A100 40GB o H100.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4): ~16-18 GB, cabe en RTX 4090 (24 GB) y RTX 3090.
- GPU recomendadas: A100 80GB, H100 80GB para precisión completa; RTX 4090 o A6000 para cuantización 4-bit.
- Consumer GPU: sí, en cuantización 4-bit cabe en RTX 4090, 3090 y potencialmente en GPUs de 16 GB con cuantizaciones más agresivas (Q3/Q2), con pérdida de calidad.
- Opciones de despliegue: transformers (nativo), vLLM, TGI, llama.cpp/Ollama (requiere conversión a GGUF), SGLang.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic | 32,2B | No disponible | Apache 2.0 | Gated | Variante abliterated de OLMo-2 |
| allenai/OLMo-2-0325-32B-Instruct | 32,2B | No disponible en esta ficha | Apache 2.0 | Abierto | Modelo base alineado, con rechazo activo |
| Modelos abliterated de la familia Llama 3 (p. ej. variantes de 8B/70B) | 8B-70B | 8K-128K según variante | Llama license | Variable | Ecosistema más amplio de variantes sin censura |
| Mistral-Small-Instruct (24B) | 24B | 32K aprox. | Apache 2.0 | Abierto | Alternativa abierta de tamaño similar, sin variante abliterated oficial |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La abliteration degrada parcialmente las capacidades del modelo: es habitual observar pérdida de coherencia, mayor tasa de alucinación y respuestas menos precisas en tareas de razonamiento.
- Riesgo elevado de generar contenido dañino, ilegal o sexualmente explícito; no apto para producción sin filtros externos.
- Solo inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo; el usuario asume la responsabilidad legal del contenido generado.
- Los sesgos del modelo base (OLMo-2) persisten y pueden amplificarse al eliminar la capa de rechazo.
- No se documentan evaluaciones de seguridad ni benchmarks en la información disponible; no se recomienda su despliegue sin una evaluación propia.
- El tamaño del repositorio (64,5 GB) y los requisitos de VRAM lo hacen poco adecuado para entornos con recursos limitados.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Paper OLMo 2 (arXiv:2501.00656): https://arxiv.org/abs/2501.00656
- Paper OLMo (arXiv:2411.15124): https://arxiv.org/abs/2411.15124
- Paper adicional referenciado (arXiv:2611.17846): https://arxiv.org/abs/2611.17846
- Dataset RLVR-GSM-MATH-IF-Mixed-Constraints: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
- Repositorio OLMo de Ai2: https://github.com/allenai/OLMo
