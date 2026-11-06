# ReadyArt/Dark-Craving-26B-A4B

## Resumen

Dark-Craving-26B-A4B es un fine-tune del modelo google/gemma-4-26B-A4B-it, desarrollado por el usuario ReadyArt y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste orientado a contenido para adultos, roleplay explícito y conversación sin alineamiento (unaligned), según declaran sus propias etiquetas. El repositorio está marcado como no apto para todas las audiencias y el acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos.

El modelo hereda la arquitectura del Gemma 4 26B A4B instructivo de Google, lo que implica un diseño Mixture of Experts (MoE) con aproximadamente 26 mil millones de parámetros totales y unos 4 mil millones de parámetros activos por token, según la nomenclatura del nombre. El fine-tune no modifica la arquitectura subyacente, sino que ajusta los pesos para especializar el comportamiento conversacional hacia escenarios de ficción adulta y roleplay, un nicho con demanda consolidada pero escasa cobertura en modelos alineados comercialmente.

La relevancia de esta ficha es fundamentalmente técnica y de catalogación: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin documentación publicada más allá de las etiquetas del repositorio, y con un acceso restringido que limita su evaluación. Cualquier uso en producción exige verificar de forma independiente las capacidades reales, los sesgos y los riesgos asociados a un modelo explícitamente desalineado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), heredada de google/gemma-4-26B-A4B-it |
| Parámetros totales | 26B (según nomenclatura del modelo) |
| Parámetros activos | 4B (aproximado, según nomenclatura "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se asume compatibilidad con cuantizaciones estándar del modelo base: GGUF, GPTQ, AWQ, pero no confirmado) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tune del Gemma 4 26B A4B instructivo, por lo que su arquitectura de base es un transformer con capas Mixture of Experts, con 26B parámetros totales y aproximadamente 4B activos por token. Esta configuración permite un equilibrio entre capacidad y coste computacional en inferencia, ya que solo se activa una fracción de los expertos en cada paso. No se dispone de información pública sobre el proceso de fine-tune: no se documentan el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni hiperparámetros relevantes.

Las etiquetas del repositorio indican que el ajuste busca un comportamiento "unaligned" y especializado en roleplay explícito y contenido para adultos. No hay información sobre si se emplearon técnicas de decodificación especulativa, atención lineal u otras innovaciones, ni sobre modificaciones en la tokenización o el vocabulario respecto al modelo base. La ausencia de una model card detallada impide verificar la metodología de entrenamiento o la procedencia de los datos utilizados.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno.
- Roleplay y ficción interactiva con contenido explícito para adultos (ERP).
- Comportamiento "unaligned": presumiblemente menor rechazo a peticiones sensibles, aunque no se documenta el alcance real.
- Instrucciones conversacionales heredadas del modelo base instructivo.
- Soporte de tool calling y function calling: no confirmado; depende de si el fine-tune preserva estas capacidades del base.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Roleplay conversacional para adultos: el modelo está específicamente ajustado para mantener personajes y escenarios de ficción explícita en inglés, con continuidad multi-turno. Adecuado para plataformas de entretenimiento para adultos con las salvaguardas legales correspondientes.
- Generación de ficción erótica: útil para autores que necesitan borradores o variaciones de escenas explícitas, con control de tono y personajes a través del prompt de sistema.
- Simulación de personajes en videojuegos narrativos para adultos: puede gestionar diálogos ramificados y mantener consistencia de personalidad si el contexto lo permite.
- Investigación sobre alineamiento y seguridad: sirve como caso de estudio de un modelo deliberadamente desalineado para evaluar mecanismos de moderación y detección de contenido.
- Evaluación comparativa de fine-tunes NSFW: útil para investigadores que comparan la calidad de distintos ajustes sobre la misma base Gemma 4.
- Prototipado de chatbots de nicho: para desarrolladores que necesitan un modelo conversacional en inglés con baja tasa de rechazos en temáticas maduras, siempre que la licencia y la legislación lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26B parámetros totales y 4B activos, en cuantización de 4 bits se estiman aproximadamente 13-16 GB de VRAM para los pesos, más overhead de contexto y caché KV; en FP16 serían necesarios unos 52 GB solo para pesos.
- GPU recomendadas: A100 40/80 GB o H100 para FP16/BF16; RTX 4090 (24 GB) viable en cuantizaciones de 4-8 bits con contexto moderado.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits en GPUs con 16-24 GB (RTX 4080, 4090, 3090), siempre que el contexto no sea muy largo.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y transformers, sujeto a que existan conversiones GGUF o cuantizaciones publicadas (no confirmadas).
- Latencia y throughput estimados: no disponibles; al ser MoE con 4B activos, el throughput debería ser superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Especialización |
|---|---|---|---|---|---|
| ReadyArt/Dark-Craving-26B-A4B | 26B totales / 4B activos | no disponible | Apache 2.0 | Restringido (gated) | NSFW, roleplay, unaligned |
| google/gemma-4-26B-A4B-it | 26B totales / 4B activos | no disponible | Términos de Gemma | Público con aceptación | Instructivo general, alineado |
| Fine-tunes NSFW de Llama 3.1 8B | 8B densos | 128K (base) | Llama 3.1 Community | Variable | Roleplay y contenido adulto |
| Mistral-based NSFW fine-tunes (7B-12B) | 7B-12B densos | 32K-128K (base) | Apache 2.0 (base) | Público | Roleplay y contenido adulto |

La comparativa se basa en categorías generales, ya que no hay datos de rendimiento publicados para este modelo concreto. Frente al Gemma 4 base, la diferencia principal es la especialización y el desalineamiento deliberado; frente a fine-tunes NSFW de Llama o Mistral, la ventaja potencial es la arquitectura MoE con menor coste de inferencia por token activo, aunque la falta de documentación y de descargas dificulta validar su calidad real.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está diseñado para generar material NSFW; no debe desplegarse en entornos accesibles a menores.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la auditoría.
- Ausencia de documentación: no hay model card detallada, benchmarks ni información sobre el dataset de entrenamiento, lo que impide evaluar sesgos y calidad de forma rigurosa.
- Riesgo de alucinación: no cuantificado; los fine-tunes de roleplay suelen priorizar la coherencia narrativa sobre la veracidad factual.
- Comportamiento "unaligned": puede producir respuestas que violen políticas de contenido o normativas locales; requiere moderación externa en producción.
- Idioma: solo inglés declarado; el rendimiento en castellano es incierto y probablemente deficiente.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede estar sujeto a legislación sobre material para adultos según la jurisdicción.
- Cero adopción verificable: sin descargas ni likes, no hay evidencia comunitaria de estabilidad o calidad.
- Fecha de creación futura (2026-11-01): dato anómalo que sugiere posibles inconsistencias en el repositorio; conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
