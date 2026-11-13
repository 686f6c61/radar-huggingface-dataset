# bambocher/Qwen3.5-4B-heretic-oQ6e-mtp

## Resumen

Qwen3.5-4B-heretic-oQ6e-mtp es una cuantización de precisión mixta del modelo Qwen3.5-4B, un transformer multimodal desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión concreta la publica el usuario bambocher en Hugging Face y está pensada para su uso con la librería MLX de Apple, es decir, para inferencia en hardware Apple Silicon (chips M-series). El checkpoint incorpora tres componentes diferenciados: el modelo de lenguaje propiamente dicho, un codificador de visión y una cabeza MTP (multi-token prediction).

La relevancia de esta ficha radica en que se trata de un artefacto de cuantización, no de un modelo entrenado desde cero: el autor no documenta el proceso de entrenamiento del modelo base, sino únicamente el esquema de cuantización aplicado con la herramienta oQ (oMLX v0.7.3). El resultado es un checkpoint de 4.660 millones de parámetros lógicos almacenado en 4,3 GB, con una media efectiva de 7,390 bits por peso, lo que lo sitúa en un punto intermedio entre una cuantización de 6 bits pura y una de 8 bits.

La información pública disponible es muy limitada: no hay model card del modelo base incluida, no se declaran licencia, idiomas ni pipeline, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Por tanto, las secciones que dependen de datos del modelo original (entrenamiento, benchmarks, idiomas) se marcan como no disponibles, y las estimaciones de rendimiento deben tratarse como orientativas a partir del tamaño y del esquema de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + cabeza MTP); familia Qwen3.5 |
| Parametros totales | 4.659.865.088 (4,660B logicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta: affine 6-bit grupo 64 (3,890B pesos), affine 8-bit grupo 64 (0,422B), BF16 (0,348B); media efectiva 7,390 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 3,523 GB / 3,281 GiB |
| Vision | 0,334B | 0,667 GB / 0,621 GiB |
| Cabeza MTP | 0,121B | 0,115 GB / 0,107 GiB |
| Total | 4,660B | 4,304 GB / 4,009 GiB |

## Arquitectura y entrenamiento

La arquitectura de base corresponde a la familia Qwen3.5, de la que este checkpoint hereda la estructura transformer. El desglose de pesos confirma tres bloques: un modelo de lenguaje de 4,206B parámetros, un módulo de visión de 0,334B y una cabeza MTP de 0,121B. La presencia de la cabeza MTP es técnicamente destacable: la predicción multi-token permite que el modelo genere varios tokens por paso de decodificación, lo que puede mejorar el throughput en inferencia, aunque el autor no documenta cómo se explota en la práctica ni si requiere un runtime específico.

No se dispone de información sobre el entrenamiento del modelo base: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se documenta el proceso de cuantización más allá del resultado: se sabe que se usó oQ (oMLX v0.7.3) con cuantización de precisión mixta, asignando 6 bits a la mayor parte de los pesos (83,483%), 8 bits a una fracción menor (9,057%) y manteniendo en BF16 el 7,459% restante, presumiblemente capas sensibles a la precisión. El sufijo "heretic" del nombre sugiere una variante con alineamiento alterado o reducido, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.5-4B, sin datos específicos publicados en este repositorio.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,334B parámetros, por lo que se espera soporte de entrada de imágenes, aunque no se detallan tareas concretas (VQA, OCR, captioning).
- Predicción multi-token (MTP): la cabeza dedicada de 0,121B parámetros está diseñada para decodificación especulativa o generación de varios tokens por paso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Ejecución en Apple Silicon: integración nativa con MLX, lo que permite aprovechar la memoria unificada de los chips M-series.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 4,3 GB cabe holgadamente en equipos con 16 GB de RAM unificada, lo que permite ejecutar un modelo multimodal de 4,6B parámetros en portátiles Apple sin GPU dedicada. Es el caso de uso principal dado el formato MLX.
- Prototipado de aplicaciones multimodales en local: gracias al módulo de visión incluido, se puede experimentar con pipelines imagen-texto en un entorno de desarrollo sin depender de APIs externas, útil para validar ideas antes de escalar a modelos mayores.
- Investigación sobre cuantización de precisión mixta: el desglose detallado de bits por componente (6, 8 y 16 bits) lo convierte en un objeto de estudio para comparar la degradación de calidad frente al modelo base en BF16.
- Evaluación de decodificación multi-token: la cabeza MTP permite experimentar con técnicas de generación especulativa en MLX y medir la ganancia de throughput frente a la decodificación token a token.
- Asistentes personales offline: un modelo de este tamaño puede gestionar conversaciones multi-turno en local, con la ventaja de privacidad que supone no enviar datos a servidores externos, siempre que se validen previamente sus capacidades reales.
- Docencia y demostraciones: el tamaño reducido y el formato MLX facilitan su uso en entornos educativos para ilustrar el funcionamiento de modelos multimodales cuantizados en hardware de consumo.
- Filtrado y clasificación de contenido con contexto visual: si el módulo de visión rinde correctamente, puede emplearse para tareas de moderación o etiquetado de imágenes en lotes pequeños sobre hardware local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el checkpoint ocupa 4,3 GB en disco (4,009 GiB de pesos); en ejecución se necesita espacio adicional para caché KV y buffers, por lo que se recomienda un mínimo de 8 GB de memoria unificada, y 16 GB para trabajar con contexto largo o imágenes.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon; se espera funcionamiento en chips M1, M2, M3 y M4 en sus variantes base, Pro, Max y Ultra. No es un checkpoint pensado para GPUs NVIDIA o AMD en su estado actual.
- Compatibilidad con GPU de consumo: sí, en el ecosistema Apple; en GPUs NVIDIA (RTX 3060 12 GB, RTX 4090 24 GB) requeriría conversión previa a otro formato, no documentada por el autor.
- Opciones de despliegue: MLX (librería nativa) y mlx-lm para el modelo de lenguaje; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput estimados: no disponibles. La cabeza MTP podría mejorar el throughput, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ6e-mtp (este) | 4,660B | no disponible | safetensors MLX | no disponible | Hugging Face, 0 descargas |
| Qwen3.5-4B (base, BF16) | ~4,6B (estimado) | no disponible | safetensors | no disponible | Referencia nominal; no verificado en la busqueda |
| Qwen2.5-VL-3B | ~3,75B | 32.768 tokens (referencia de la familia Qwen2.5-VL) | safetensors, GGUF | Apache 2.0 (referencia de la familia Qwen2.5) | Amplia disponibilidad |
| Gemma 3 4B | ~4B | 128.000 tokens (referencia de la familia Gemma 3) | safetensors, GGUF | Gemma Terms of Use | Amplia disponibilidad |

La comparativa es aproximada: los datos de las alternativas provienen del conocimiento general de esas familias de modelos y no de la información proporcionada en esta búsqueda, por lo que deben verificarse antes de usarse en una decisión técnica. La ventaja diferencial de este checkpoint es su formato MLX optimizado para Apple Silicon con precisión mixta; su desventaja es la ausencia total de documentación sobre licencia, idiomas y rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial es jurídicamente incierto; debe contactarse con el autor o consultarse el modelo base antes de cualquier despliegue en producción.
- Ausencia de benchmarks: no hay evidencia publicada de que la cuantización de precisión mixta preserve la calidad del modelo base; la degradación en tareas de razonamiento o visión es posible y no está medida.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; sin datos de alineamiento no puede evaluarse su magnitud.
- El sufijo "heretic" sugiere un alineamiento alterado o reducido, lo que puede implicar menor adherencia a directrices de seguridad; no hay documentación que lo confirme ni que lo descarte.
- Idiomas no declarados: no puede asumirse un rendimiento correcto en castellano sin evaluación previa.
- Contexto no documentado: se desconoce la ventana máxima; planificar despliegues con contexto largo sin esta información es arriesgado.
- Ecosistema restringido: el formato MLX limita el despliegue a Apple Silicon; no hay conversiones oficiales a GGUF ni soporte en servidores con GPU NVIDIA.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos estén detectados por la comunidad.
- La cabeza MTP puede no estar soportada por todos los runtimes MLX; verificar compatibilidad con la versión de mlx-lm antes de confiar en ella.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ6e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-4B: no disponible (no se enlaza en la model card)
- Paper o blog del modelo base: no disponible
- Demos: no disponible
