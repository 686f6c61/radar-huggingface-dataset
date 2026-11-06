# ModernoTech/Nova-Velocity

## Resumen

Nova Velocity es un repositorio de identidad y documentación publicado por Moderno Tech bajo el paraguas de su línea de productos Nova. Según la model card, se trata de un "modelo orientado a MoE de alto rendimiento con activación reducida", pero en el momento de redactar esta ficha no contiene pesos verificados: el propio autor lo etiqueta como `in-development` y con estado `documentation`. El repositorio tiene un tamaño de 0.0 GB, lo que confirma que no aloja artefactos de modelo.

La procedencia técnica declarada apunta a `DavidAU/Qwen3-30B-A1.5B-GGUF` como "candidate origin", con una nota de arquitectura esperada de "30B A1.5B variante NEO". Es decir, el objetivo sería un modelo Mixture-of-Experts de aproximadamente 30.000 millones de parámetros totales con unos 1.500 millones activos por token, derivado de la familia Qwen3. No obstante, el autor indica explícitamente que la licencia y el estado de redistribución están "under audit" y que no se publicarán pesos sin verificación exacta de licencia y hash.

La relevancia actual es limitada desde el punto de vista práctico: no hay pesos, no hay benchmarks, no hay dataset documentado y no hay métricas. Su interés es principalmente informativo para quienes sigan la línea Nova de Moderno Tech o quieran evaluar la futura publicación de un MoE de activación reducida basado en Qwen3. Cualquier uso en producción es inviable con el estado actual del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) según descripción del autor; variante "NEO" esperada, basada en Qwen3 |
| Parámetros totales | ~30B (según nota "30B A1.5B variante NEO"); no confirmado con pesos publicados |
| Parámetros activos | ~1.5B (según nota "30B A1.5B"); no confirmado |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el origen candidato es GGUF, pero no se publican pesos) |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 (declarada en metadatos; sujeta a auditoría según el autor) |
| Formato de pesos | no disponible (sin pesos publicados; el candidato de origen es GGUF) |

## Arquitectura y entrenamiento

La model card describe el objetivo como un modelo MoE de alto rendimiento con activación reducida, con una nota de arquitectura esperada "30B A1.5B variante NEO". Esto sugiere una configuración de aproximadamente 30.000 millones de parámetros totales y 1.500 millones activos por token, lo que encajaría con la tendencia de MoEs de activación dispersa que ofrecen throughput alto a coste de inferencia bajo. El origen candidato es `DavidAU/Qwen3-30B-A1.5B-GGUF`, un modelo de la familia Qwen3, por lo que la arquitectura subyacente sería un transformer con capas MoE, aunque no se detallan número de expertos, top-k, dimensión oculta ni configuración de atención.

En cuanto a entrenamiento, el estado declarado es `planned`: no hay pesos entrenados ni destilados por Moderno Tech, no hay fine-tuning documentado, no hay dataset documentado y las métricas están "pending tests". El autor afirma explícitamente que no se fabrican, descargan ni publican pesos sin verificación exacta de licencia y hash, y que la licencia y el estado de redistribución del candidato están bajo auditoría. No se documenta RLHF, DPO, número de tokens de entrenamiento ni composición del dataset.

## Capacidades

- No hay capacidades verificadas: el repositorio no contiene pesos ni demos funcionales.
- Por la arquitectura objetivo (MoE basada en Qwen3), cabría esperar generación de texto, razonamiento, código y matemáticas, pero no está confirmado por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: declaradas en, es en los metadatos; sin evaluación publicada.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Evaluación de procedencia y licencias: el repositorio sirve como caso de estudio de buenas prácticas de auditoría de licencia y verificación de hash antes de publicar pesos derivados de un modelo de terceros.
- Seguimiento de la línea Nova: útil para equipos que quieran monitorizar la futura publicación de un MoE de activación reducida de Moderno Tech y planificar su evaluación cuando haya artefactos.
- Prototipado condicionado a disponibilidad: si en el futuro se publican pesos GGUF del candidato Qwen3-30B-A1.5B, podría emplearse en inferencia local con llama.cpp u Ollama, pero hoy no es posible.
- Investigación sobre MoEs de activación dispersa: el objetivo declarado (30B totales, ~1.5B activos) es relevante para estudiar el equilibrio entre calidad y coste de inferencia, una vez existan pesos.
- Documentación de identidad de producto: el repositorio puede reutilizarse como plantilla de estructura documental (status, provenance, license audit) para otros productos en preparación.
- Despliegue en producción: no recomendable ni viable en el estado actual, al no existir pesos ni métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (sin pesos publicados).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; a título orientativo, un MoE de ~30B totales y ~1.5B activos requeriría, en cuantización de 4 bits, del orden de 15-18 GB de VRAM solo para pesos, pero esto es una estimación genérica y no un dato del autor.
- Opciones de despliegue: no disponible; el candidato de origen es GGUF, lo que sugeriría llama.cpp u Ollama si se publicara.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nova Velocity | ~30B (declarado) | ~1.5B (declarado) | no disponible | apache-2.0 (en auditoría) | Sin pesos |
| Qwen3-30B-A1.5B (origen candidato) | ~30B | ~1.5B | no disponible en esta ficha | sujeta a la licencia de Qwen3 | Disponible en GGUF vía DavidAU |
| Alternativas MoE de activación reducida | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No hay pesos publicados: el repositorio es solo documentación e identidad; no es usable para inferencia.
- Estado `in-development` y entrenamiento `planned`: no existe evidencia de fine-tuning, dataset ni métricas.
- Licencia en auditoría: aunque los metadatos declaran apache-2.0, el autor indica que la licencia y la redistribución del candidato están bajo revisión, por lo que el uso comercial no está garantizado.
- Riesgo de confusión de procedencia: el modelo base figura como "Unknown" y el origen es un "candidate origin", no una base confirmada.
- Idiomas declarados (en, es) sin evaluación publicada; no hay garantía de calidad en castellano.
- Sin benchmarks: no se puede valorar calidad, alucinación ni sesgos.
- Para producción: no apto en el estado actual; cualquier despliegue requeriría esperar a la publicación verificada de pesos y a la resolución de la auditoría de licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ModernoTech/Nova-Velocity
- Candidato de origen citado: https://huggingface.co/DavidAU/Qwen3-30B-A1.5B-GGUF
- Paper, blog o demo oficial: no disponible en la información proporcionada.
