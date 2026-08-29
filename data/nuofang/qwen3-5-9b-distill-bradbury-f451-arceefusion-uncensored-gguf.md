# nuofang/Qwen3.5-9B-Distill-Bradbury-F451-ArceeFusion-Uncensored-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `nuofang/Qwen3.5-9B-Distill-Bradbury-F451-ArceeFusion-Uncensored`, un fine-tune de la serie Qwen3.5 de 9B parámetros orientado a la escritura creativa sin filtros de seguridad. El autor, `nuofang`, publica estos archivos cuantizados para su uso con `llama.cpp` y compatibles, con calibración imatrix dirigida a novelas chinas y role-playing, preservando a su vez lógica y sentido común.

La relevancia de este lanzamiento radica en que ofrece una versión local y eficiente de un modelo de escritura desinhibido, pensado para usuarios que necesitan ejecutar inferencia en hardware de consumo. Al estar cuantizado en GGUF, se integra directamente con ecosistemas como Ollama, LM Studio o llama.cpp. Sin embargo, la información técnica disponible es mínima: no se publican especificaciones detalladas, licencia ni benchmarks, por lo que gran parte de los datos de esta ficha figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso basado en Qwen3.5-9B) |
| Parametros totales | 9B (según el nombre del modelo base, no confirmado) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-9B soporta 262 144 tokens según LM Studio, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | GGUF (no se especifican los niveles concretos, aunque el nombre del repo indica imatrix) |
| Idiomas soportados | no disponibles (el README menciona calibración para chino, pero no se lista el soporte oficial) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Por el nombre, se infiere que parte de Qwen3.5-9B, un modelo denso de 9 mil millones de parámetros que, según la documentación pública de Qwen, integra avances en aprendizaje multimodal, eficiencia arquitectónica y escala de refuerzo. El sufijo "Distill" sugiere que se empleó destilación, aunque no se aportan datos del proceso. El término "ArceeFusion" podría indicar una técnica de fusión de modelos, pero sin confirmación.

El autor ha realizado una cuantización GGUF con matriz de importancia (imatrix) calibrada con datos de novelas chinas y role-playing, priorizando la preservación de la coherencia narrativa y el sentido común. El propio autor advierte que una disminución de la perplejidad tras la cuantización puede deberse a diferencias en el manejo de tokens especiales entre las herramientas de cuantización y las de evaluación, no a una mejora real.

## Capacidades

- Generación de texto creativo: el modelo está orientado a escritura narrativa, con énfasis en novelas y role-playing, según la calibración imatrix.
- Ausencia de filtros de seguridad: el nombre "Uncensored" indica que no aplica restricciones de contenido, lo que permite abordar temas que otros modelos rechazan.
- Soporte multilingüe: aunque no se confirma, la calibración en chino sugiere competencia en ese idioma, probablemente junto con inglés y otros lenguajes del modelo base.
- Razonamiento y lógica: el autor afirma que la calibración preserva "lógica y sentido común", por lo que se espera un comportamiento razonable en tareas de razonamiento básico.
- Integración con llama.cpp: al estar en GGUF, es compatible con todas las herramientas que usan este formato, incluyendo inferencia en CPU y GPU.

## Casos de uso

- Escritura creativa local: redactar novelas, cuentos o guiones sin censura, ejecutando el modelo en un equipo personal con llama.cpp o LM Studio.
- Role-playing textual: crear personajes y mundos para juegos de rol por texto, aprovechando la calibración específica para este tipo de interacción.
- Generación de diálogos naturales: mantener conversaciones largas con contexto, aunque la longitud máxima no está confirmada.
- Prototipado de aplicaciones de escritura asistida: integrar el modelo en herramientas de generación de borradores o ideas para escritores.
- Experimentación con modelos sin filtros: investigar el comportamiento de modelos desinhibidos en entornos controlados, siempre respetando las normativas locales.
- Despliegue en entornos con recursos limitados: gracias a la cuantización GGUF, se puede ejecutar en GPUs de consumo (por ejemplo, RTX 3060 con 12 GB) o incluso en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo o sus variantes GGUF.

## Requisitos de hardware

- VRAM estimada: para un modelo de 9B en GGUF, las cuantizaciones típicas (Q4_K_M, Q5_K_M, Q8_0) requieren entre 5 y 8 GB de VRAM para inferencia completa en GPU.
- GPU recomendadas: tarjetas con 8-12 GB de VRAM, como RTX 3070, RTX 3080, RTX 4060 Ti, RTX 4070 o superiores. También puede ejecutarse en CPU con suficiente RAM (16-32 GB).
- Compatibilidad con consumer GPU: sí, es uno de los objetivos de la cuantización GGUF.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (con backend llama.cpp) y cualquier frontend que soporte GGUF.
- Latencia y throughput: no se proporcionan datos; dependerá del hardware y la cuantización elegida.

## Comparativa con modelos similares

Se han encontrado otros modelos GGUF del mismo autor y temática en HuggingFace, aunque sin datos técnicos adicionales:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nuofang/Qwen3.5-9B-Distill-Bradbury-F451-ArceeFusion-Uncensored-GGUF | 9B (no confirmado) | no disponible | no disponible | GGUF en HF |
| nuofang/Qwen3.5-9B-Distill-Bradbury-F451-SLERP-Uncensored-GGUF | 9B (no confirmado) | no disponible | no disponible | GGUF en HF |
| nuofang/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-GGUF | 9B (no confirmado) | no disponible | no disponible | GGUF en HF |

También existe el modelo base Qwen3.5-9B en LM Studio, que sí tiene documentación pública (contexto 262 144 tokens, arquitectura densa), pero no se puede asumir que el fine-tune herede esas características sin confirmación.

## Limitaciones y advertencias

- Sin información técnica verificable: la mayoría de especificaciones (arquitectura exacta, datos de entrenamiento, licencia) no están disponibles, lo que dificulta evaluar su idoneidad para uso profesional.
- Riesgo de alucinación y sesgos: al ser un modelo "uncensored", puede generar contenido ofensivo, inexacto o peligroso sin restricciones. No es recomendable para aplicaciones donde la veracidad sea crítica.
- Licencia desconocida: al no especificarse, no se puede garantizar que el uso comercial esté permitido. Se debe contactar al autor antes de desplegarlo en producción.
- Calibración limitada: la imatrix se centra en chino y role-playing, lo que puede degradar el rendimiento en tareas generales en otros idiomas.
- Longitud de contexto no confirmada: aunque el modelo base Qwen3.5 soporta 262k tokens, el fine-tune podría haber reducido la ventana. Se recomienda probar antes de usarlo con contextos largos.
- Advertencia del autor sobre perplejidad: la aparente mejora tras la cuantización puede ser un artefacto de las herramientas, no una señal de calidad.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/nuofang/Qwen3.5-9B-Distill-Bradbury-F451-ArceeFusion-Uncensored-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/nuofang/Qwen3.5-9B-Distill-Bradbury-F451-ArceeFusion-Uncensored
- Variante SLERP: https://huggingface.co/nuofang/Qwen3.5-9B-Distill-Bradbury-F451-SLERP-Uncensored-GGUF
- Variante Pro-Writer: https://huggingface.co/nuofang/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-GGUF
- Artículo sobre los fine-tunes uncensored de Qwen 3.5 9B: https://uncensoredhub.ai/news/2026-07-11-qwen-3-5-9b-uncensored-writer-fine-tunes-land-in-gguf-quantizations
- Página de Qwen3.5-9B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
