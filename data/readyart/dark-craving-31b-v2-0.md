# ReadyArt/Dark-Craving-31B-v2.0

## Resumen

Dark-Craving-31B-v2.0 es un ajuste fino (fine-tune) del modelo google/gemma-4-31B-it, desarrollado por el usuario ReadyArt y publicado en Hugging Face. Se trata de un modelo de generación de texto orientado a contenido para adultos, roleplay conversacional y narrativa explícita, con la etiqueta "unaligned" que indica que se han relajado total o parcialmente los mecanismos de alineación y rechazo del modelo original. El repositorio está marcado como no apto para todas las audiencias y su acceso es restringido (gated), requiriendo aceptar condiciones en la plataforma para su descarga.

El modelo cuenta con 31.273.088.876 parámetros en formato safetensors, lo que lo sitúa en la categoría de modelos densos de gran tamaño. Hereda la arquitectura y la ventana de contexto del modelo base Gemma 4 de 31B, aunque la información pública disponible no detalla estas especificaciones de forma explícita. Su licencia declarada es Apache 2.0, si bien conviene señalar que las condiciones de uso del modelo base de Google pueden imponer restricciones adicionales que prevalecerían sobre las del fine-tune.

La relevancia de este modelo es acotada: se dirige a un nicho muy específico de generación de ficción interactiva y roleplay para adultos, y no está pensado para tareas de propósito general, código o razonamiento técnico. En el momento de la consulta registra 0 descargas y 1 like, lo que indica una adopción prácticamente nula y escasa validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de google/gemma-4-31B-it; detalles no disponibles) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (sujeta a las condiciones del modelo base de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base google/gemma-4-31B-it, por lo que conserva la arquitectura transformer densa del original. No se ha publicado información sobre el proceso de ajuste: ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado convencional. Tampoco se documentan innovaciones técnicas propias, como decodificación especulativa o mecanismos de atención lineal.

La etiqueta "unaligned" sugiere que el ajuste se orientó a reducir o eliminar las respuestas de rechazo del modelo base en contextos de contenido adulto y roleplay, pero no hay documentación técnica que describa cómo se logró ni qué metodología se siguió. El tamaño del repositorio (62,6 GB) es coherente con los pesos en precisión completa o media de un modelo de 31B parámetros, sin que se indique si se publicaron variantes cuantizadas.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno.
- Roleplay y ficción interactiva, incluyendo narrativa explícita para adultos.
- Continuación de historias y mantenimiento de personajes y contexto conversacional.
- Modo instruct (hereda el formato de instrucciones del modelo base Gemma 4 IT).
- Capacidad multilingüe limitada al inglés según la ficha del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Ficción interactiva para adultos: el modelo puede mantener conversaciones de roleplay multi-turno con personajes consistentes, aprovechando el ajuste específico para narrativa explícita y el contexto heredado del modelo base.
- Generación de narrativa erótica: adecuado para autores que necesitan borradores de relatos para adultos con continuidad argumental, gracias a su orientación declarada a contenido maduro.
- Simulación de personajes en videojuegos o novelas visuales: puede dar respuestas en personaje dentro de un bucle de diálogo, aunque requiere validación de contenido y moderación en el producto final.
- Prototipado de chatbots de nicho: útil para experimentar con sistemas conversacionales sin restricciones de alineación, siempre en entornos controlados y con las salvaguardas adecuadas.
- Investigación sobre alineación y seguridad: sirve como caso de estudio de un modelo "unaligned" para analizar cómo se degradan los rechazos y qué riesgos aparecen en producción.
- Generación de diálogos para guiones o contenido creativo adulto: puede acelerar la producción de borradores de guion, con revisión humana obligatoria por los riesgos de sesgo y contenido inapropiado.
- Fine-tuning posterior especializado: al estar en safetensors y con licencia Apache 2.0 declarada, puede servir de base para ajustes adicionales en dominios creativos concretos, sujeto a las condiciones del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 70-80 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB, viable en una A100 40 GB o en configuraciones multi-GPU.
- VRAM estimada en cuantización de 4 bits: en torno a 16-18 GB, lo que permitiría su ejecución en una RTX 4090 (24 GB), siempre que se genere la cuantización a partir de los pesos safetensors, ya que no se publican variantes GGUF.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para precisión completa; RTX 4090 o A6000 para cuantizaciones de 4-8 bits.
- Despliegue: vLLM o TGI para FP16/BF16 en servidor; llama.cpp u Ollama requerirían convertir previamente los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt/Dark-Craving-31B-v2.0 | 31,27B | no disponible | Roleplay adulto, unaligned | apache-2.0 (sujeta a condiciones del base) | Gated en Hugging Face |
| google/gemma-4-31B-it | ~31B | no disponible | Propósito general, alineado | Condiciones de Google (no Apache 2.0) | Público/gated según versión |
| Modelos de roleplay de la comunidad (p. ej. fine-tunes de Mistral/Llama de 7-13B) | 7-13B | variable (habitualmente 8K-32K) | Roleplay y narrativa | Apache 2.0 o Llama license según base | Públicos en Hugging Face |

La comparación directa con alternativas de roleplay de la comunidad es difícil porque no se han publicado benchmarks ni especificaciones de contexto para este modelo. Frente a los fine-tunes habituales de 7-13B, este modelo ofrece un tamaño mayor que puede mejorar la coherencia narrativa, a costa de requisitos de hardware mucho más elevados.

## Limitaciones y advertencias

- Contenido explícito para adultos: no apto para menores ni para entornos sin moderación; el repositorio está marcado como no apto para todas las audiencias.
- Modelo "unaligned": es probable que ignore o reduzca los rechazos ante peticiones dañinas, lo que incrementa el riesgo de generar contenido inapropiado, ilegal o peligroso.
- Riesgo elevado de alucinación y de deriva narrativa, habitual en fine-tunes de roleplay sin validación con benchmarks.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Licencia: aunque se declara apache-2.0, el modelo base google/gemma-4-31B-it tiene sus propias condiciones de uso que pueden prevalecer; verificar antes de cualquier uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para su uso en pipelines automatizados.
- Sin validación comunitaria: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de calidad ni de estabilidad en producción.
- No se documentan cuantizaciones oficiales, por lo que el despliegue eficiente exige trabajo adicional de conversión.
- Sesgos desconocidos: no se ha publicado ninguna evaluación de sesgos del fine-tune.

## Enlaces

- Hugging Face: https://huggingface.co/ReadyArt/Dark-Craving-31B-v2.0
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
