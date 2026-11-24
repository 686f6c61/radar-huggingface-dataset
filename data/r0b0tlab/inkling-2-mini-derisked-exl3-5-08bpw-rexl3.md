# r0b0tlab/Inkling-2-Mini-Derisked-EXL3-5.08bpw-REXL3

## Resumen

Inkling-2-Mini-Derisked-EXL3-5.08bpw-REXL3 es una cuantización de 5,08 bits por peso (bpw) del modelo Blackfrost-AI/Inkling-2-Mini-Derisked, publicada por el usuario r0b0tlab bajo el formato EXL3/REXL3. El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) y mecanismo de bucle (loop-transformer), orientado a tareas multimodales de imagen y texto (pipeline image-text-to-text) con capacidad conversacional. Esta versión cuantizada reduce el peso del repositorio a 18,1 GB y declara 8.932.398.208 parámetros totales según los safetensors, lo que lo sitúa en la gama de modelos compactos desplegables en hardware de consumo.

La relevancia de esta ficha radica en que se trata de un artefacto de investigación derivado de un modelo base ya de por sí etiquetado como "research-only", y cuya distribución está restringida (gated) en Hugging Face. La cuantización EXL3 a 5,08 bpw busca un equilibrio entre fidelidad numérica y huella de memoria, permitiendo potencialmente la inferencia en GPUs con 24 GB de VRAM. No obstante, la ausencia de documentación técnica publicada, de resultados de benchmarks y de información sobre idiomas o datos de entrenamiento limita seriamente cualquier evaluación rigurosa.

El modelo se publicó el 24 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en el Hub. La licencia declarada es Apache 2.0, pero conviene contrastarla con las restricciones del modelo base, que podría imponer condiciones adicionales de uso no comercial o de solo investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con loop-transformer (según tags: `moe`, `loop-transformer`, `inkling2_loop`) |
| Parametros totales | 8.932.398.208 (8,93 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 5,08 bpw (REXL3) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta a verificación con el modelo base) |
| Formato de pesos | safetensors (cuantización EXL3) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base emplea una arquitectura de mezcla de expertos (MoE) combinada con un mecanismo de bucle (loop-transformer), identificado por el tag `inkling2_loop`. Los loop-transformers reutilizan bloques de capas de forma iterativa para aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros, lo que encaja con un total de 8,93 mil millones de parámetros y un pipeline multimodal image-text-to-text. No se dispone de datos sobre el número de expertos, el ratio de activación, la dimensión oculta ni el número de cabezas de atención.

Respecto al entrenamiento, no hay información publicada sobre el volumen de tokens, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación. El sufijo "Derisked" en el nombre del modelo base sugiere un proceso de mitigación de riesgos o desactivación de comportamientos no deseados, pero no se documenta en qué consiste. La cuantización EXL3 a 5,08 bpw es una técnica de compresión post-entrenamiento orientada a la inferencia, no un reentrenamiento, por lo que las capacidades del modelo cuantizado deberían aproximarse a las del base, con la degradación inherente a la pérdida de precisión numérica.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), lo que implica capacidad de recibir imágenes junto con instrucciones textuales.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo de razonamiento explícito (thinking mode), audio u otras modalidades: no disponible.

## Casos de uso

- Asistencia conversacional multimodal: el modelo puede mantener diálogos en los que el usuario adjunta imágenes (capturas, diagramas, fotografías) y formula preguntas en lenguaje natural, gracias a su pipeline image-text-to-text. Adecuado para prototipos de asistentes visuales en investigación.
- Análisis de documentación técnica escaneada: dado su tamaño compacto (8,93 mil millones de parámetros), puede desplegarse en una GPU de 24 GB y procesar imágenes de planos o esquemas junto con consultas textuales en entornos de laboratorio.
- Experimentación académica con arquitecturas loop-transformer: al ser un artefacto de investigación, sirve para estudiar el comportamiento de modelos MoE con bucles bajo cuantización agresiva (5,08 bpw) y comparar la degradación frente al modelo base sin cuantizar.
- Evaluación de pipelines de cuantización EXL3: el modelo permite medir la fidelidad de la cuantización REXL3 en tareas de imagen-texto, comparando salidas con el modelo base Derisked.
- Generación de descripciones de imágenes en entornos controlados: para tareas de alt-text o etiquetado semiautomático donde no se requiera precisión de producción y se acepte supervisión humana.
- Prototipado de interfaces conversacionales con entrada visual: integrable en demos de investigación con frameworks de inferencia que soporten safetensors cuantizados, siempre que se respete la restricción de acceso gated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,93 mil millones de parámetros a 5,08 bpw, el peso de los pesos ronda los 5,7 GB; sumando overhead de activaciones, KV cache y contexto, se estima un consumo de entre 8 y 12 GB de VRAM para contextos moderados, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: no disponible. Por tamaño, una RTX 4090 (24 GB) o una A100 (40/80 GB) deberían ser suficientes; una RTX 3090 (24 GB) también podría albergarlo.
- Compatibilidad con GPU de consumo: probable en tarjetas con 12 GB o más, sujeto a verificación empírica del runtime EXL3.
- Opciones de despliegue: el formato EXL3/REXL3 requiere herramientas específicas de inferencia compatibles con esta cuantización; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Derisked-EXL3-5.08bpw | 8,93 mil millones | no disponible | Apache 2.0 (declarada) | Gated en HF | Cuantización EXL3 de un modelo research-only |
| Blackfrost-AI/Inkling-2-Mini-Derisked | no disponible | no disponible | no disponible | no disponible | Modelo base sin cuantizar |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se identifican modelos equivalentes en la información disponible |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- Etiqueta research-only: el modelo base está marcado como solo para investigación, lo que puede entrar en conflicto con la licencia Apache 2.0 declarada en esta cuantización; es imprescindible verificar las condiciones del modelo base antes de cualquier uso comercial.
- Ausencia de documentación: no hay información sobre datos de entrenamiento, idiomas, sesgos ni evaluación de alineación, lo que impide valorar riesgos de sesgo y de alucinación con fundamento.
- Degradación por cuantización: la compresión a 5,08 bpw puede afectar a la coherencia en tareas multimodales complejas; no se han publicado comparativas con el modelo base.
- Idiomas no declarados: se desconoce el soporte real de castellano u otras lenguas, por lo que no se recomienda su uso en producción multilingüe sin validación previa.
- Cero tracción comunitaria: sin descargas ni likes, no existen informes independientes de calidad ni casos de uso verificados.
- Formato EXL3 poco extendido: la compatibilidad con los runtimes de inferencia más populares no está confirmada, lo que puede complicar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/r0b0tlab/Inkling-2-Mini-Derisked-EXL3-5.08bpw-REXL3
- Modelo base: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Papers, blogs, repositorios o demos adicionales: no disponible
