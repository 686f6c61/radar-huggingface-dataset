# Level5Tech/clef-GGUF

## Resumen

clef-GGUF es una compilación cuantizada del modelo Cloudflare Clef (27B), publicada por Level5Tech (Aleks Blagojevich y Trevor Sunderland) como material de apoyo para su estudio "The Noise Floor of a Quantization Comparison". No se trata de un lanzamiento oficial de Cloudflare, sino de una conversión a formato GGUF para su uso con llama.cpp (build b11671), disponible en tres variantes de precisión: BF16, Q8_0 y Q4_K_M. El modelo base es un transformer denso de aproximadamente 27.024 millones de parámetros, etiquetado por el autor como "decision-model" y "conversational", lo que sugiere un uso orientado a toma de decisiones y diálogo.

La relevancia de esta ficha radica en dos factores. Primero, ofrece una vía práctica para ejecutar un modelo de 27B en entornos con llama.cpp, incluyendo GPUs de consumo mediante la cuantización Q4_K_M. Segundo, el repositorio acompaña a un benchmark de cuantización que documenta recetas y salidas por registro, lo que permite evaluar la degradación introducida por cada nivel de compresión. El repositorio ocupa 99,4 GB, coherente con alojar simultáneamente pesos BF16, Q8_0 y Q4_K_M de un modelo de este tamaño.

La licencia es Apache-2.0, heredada del modelo base, e incluye el aviso NOTICE indicando que los pesos han sido modificados mediante cuantización. La información pública disponible es escasa: no se detallan idiomas soportados, pipeline, arquitectura interna ni datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos no disponibles) |
| Parametros totales | 27.024.054.788 (~27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp b11671) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Cloudflare/clef más allá de su naturaleza transformer densa de aproximadamente 27B parámetros. No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor etiqueta el modelo como "decision-model" y "conversational", lo que indica un enfoque hacia tareas de decisión y diálogo, pero sin especificar los mecanismos técnicos subyacentes.

La contribución técnica de esta publicación es la cuantización a GGUF en tres precisiones (BF16, Q8_0 y Q4_K_M) para llama.cpp build b11671, acompañada de un benchmark reproducible ("The Noise Floor of a Quantization Comparison") que documenta mediciones, recetas y salidas por registro. Este enfoque permite analizar la degradación de calidad introducida por cada nivel de cuantización, un aspecto relevante para decidir qué variante desplegar en producción según las restricciones de hardware.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del autor.
- Toma de decisiones, según la etiqueta "decision-model" del autor.
- Ejecución en llama.cpp (build b11671) mediante formato GGUF.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación de cuantización: usar las tres variantes (BF16, Q8_0, Q4_K_M) para medir la degradación de calidad en tareas de decisión y diálogo, replicando el benchmark del autor y comparando salidas por registro.
- Despliegue en GPU de consumo: la variante Q4_K_M permite ejecutar un modelo de 27B en tarjetas con VRAM limitada mediante llama.cpp, adecuada para prototipos locales y pruebas de concepto.
- Asistencia conversacional local: el modelo puede gestionar diálogos multi-turno en entornos sin conectividad, siempre que se valide previamente su calidad en el idioma objetivo, dado que los idiomas soportados no están documentados.
- Toma de decisiones asistida: por su etiqueta "decision-model", puede emplearse en flujos de clasificación o selección entre opciones, con validación humana en producción.
- Investigación sobre cuantización: sirve como caso de estudio para analizar el "noise floor" (nivel de ruido) introducido por la compresión de pesos en modelos de ~27B.
- Integración en pipelines llama.cpp: al ser GGUF compatible con el build b11671, puede incorporarse en servicios de inferencia basados en llama.cpp con requisitos de hardware moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio del autor referencia mediciones y salidas por registro en https://github.com/Level5Tech/clef-quant-bench, pero los valores concretos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo denso de 27B, la variante Q4_K_M requiere del orden de 16-18 GB de VRAM, Q8_0 alrededor de 28-30 GB y BF16 en torno a 54 GB, aunque estas cifras no proceden de la información proporcionada y deben validarse.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? La variante Q4_K_M es la única candidata plausible para GPUs de consumo con 24 GB de VRAM, sujeto a validación empírica.
- Opciones de despliegue: llama.cpp (build b11671), según la model card; otras opciones como vLLM, Ollama o TGI no están confirmadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Cloudflare; es una compilación de terceros (Level5Tech) y debe tratarse como tal.
- Los pesos han sido modificados mediante cuantización, según el aviso NOTICE incluido; la calidad puede diferir del modelo base original.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas específicas.
- La longitud de contexto no está disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el LICENSE y NOTICE incluidos en el repositorio y verificar la licencia del modelo base.
- Compatibilidad limitada al build b11671 de llama.cpp según la model card; otras versiones o runtimes no están garantizados.
- Ausencia de benchmarks publicados en la información disponible, lo que impide evaluar su rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Level5Tech/clef-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef
- Repositorio del benchmark de cuantización: https://github.com/Level5Tech/clef-quant-bench
