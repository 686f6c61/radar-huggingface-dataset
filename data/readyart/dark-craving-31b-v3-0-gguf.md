# ReadyArt/Dark-Craving-31B-v3.0-GGUF

## Resumen

Dark-Craving-31B-v3.0-GGUF es un modelo de lenguaje de 31.000 millones de parámetros publicado por el usuario ReadyArt en Hugging Face, distribuido exclusivamente en formato GGUF (cuantizado) y orientado a generación de texto conversacional para roleplay y contenido para adultos. El modelo se presenta como un derivado "unaligned" (sin alineación de seguridad) especializado en ERP (erotic roleplay) y narrativa explícita, según los tags declarados por el autor: nsfw, explicit, roleplay, unaligned, adult-content y mature.

La información pública disponible es muy limitada: la model card consiste casi íntegramente en CSS y estilos visuales, sin datos técnicos sobre arquitectura, datos de entrenamiento, benchmarks ni proceso de ajuste. El repositorio registra cero descargas y cero "likes" en el momento de la consulta, y fue creado el 6 de noviembre de 2026. El campo `base_model` apunta al propio repositorio con relación "quantized", lo que sugiere que se trata de una cuantización GGUF de un modelo previo no enlazado en la ficha.

Su relevancia actual es marginal dentro del ecosistema open source: se trata de un modelo de nicho para comunidades de roleplay sin alineación, sin documentación técnica verificable y sin métricas publicadas. Resulta útil únicamente como referencia de las prácticas de publicación en la categoría de modelos conversacionales sin censura, no como componente para aplicaciones de producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, no confirmado) |
| Parámetros totales | 31B (según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (niveles concretos no especificados en la información) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors no disponible) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo más allá de la inferencia que puede hacerse a partir del nombre (31B) y del formato de distribución (GGUF). No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o fine-tuning supervisado, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card no incluye ninguna sección técnica redactada: el contenido visible es fundamentalmente HTML/CSS de presentación.

El campo `base_model` del repositorio apunta a sí mismo con relación "quantized", lo que indica que este artefacto es una cuantización de un modelo base no enlazado explícitamente. El tag "unaligned" sugiere que el ajuste se realizó deliberadamente sin capas de rechazo o moderación, pero no se documenta la metodología. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y no debe asumirse.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay y narrativa.
- Contenido explícito para adultos (ERP) según los tags declarados por el autor.
- Modo instruct/conversacional (tag "instruct").
- Comportamiento "unaligned": sin rechazo declarado a peticiones explícitas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades de visión, audio o thinking mode: no disponibles.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está etiquetado explícitamente para roleplay y conversación multi-turno, por lo que su uso previsto es mantener personajes coherentes en sesiones extendidas dentro de entornos privados y controlados.
- Narrativa interactiva para adultos: generación de ficción explícita en plataformas de entretenimiento para adultos que requieran contenido no filtrado, siempre con verificación de edad y cumplimiento legal.
- Prototipado de personajes conversacionales sin restricciones: útil para estudiar cómo se comporta un modelo "unaligned" frente a uno alineado en tareas de evaluación de seguridad o investigación sobre moderación.
- Investigación sobre alineación y seguridad: análisis de respuestas, sesgos y patrones de rechazo/aceptación en modelos sin capas de moderación, en entornos de laboratorio aislados.
- Generación de diálogo creativo en inglés: escritura de guiones o escenas conversacionales con tono maduro para proyectos editoriales que lo requieran.
- Despliegue local en formato GGUF: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en hardware de consumo, lo que facilita pruebas offline y privadas sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 31B en GGUF, las cuantizaciones Q4 requieren del orden de 18-20 GB y las Q8 del orden de 32-34 GB, aunque el autor no confirma estos valores.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de 31B en cuantización agresiva podría caber en GPUs de 24 GB (RTX 3090/4090) solo en cuantizaciones muy bajas; para cuantizaciones mayores se necesitarían A100 40/80 GB, H100 o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? Posiblemente en RTX 3090/4090 con cuantizaciones Q4 o inferiores, sujeto a verificación empírica no documentada.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables verificables de la misma categoría (31B, GGUF, roleplay sin alineación) con datos de rendimiento o especificaciones que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Contenido explícito y para adultos: el modelo está etiquetado como nsfw, explicit y not-for-all-audiences; no debe desplegarse en entornos accesibles a menores ni sin controles de edad.
- Modelo "unaligned": no incorpora capas de rechazo, lo que implica riesgo elevado de generar contenido dañino, ilegal o no deseado si se usa sin moderación externa.
- Riesgo de alucinación: no documentado, pero inherente a modelos de este tamaño sin benchmarks publicados.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero el autor no aporta garantías sobre el origen de los datos de entrenamiento ni sobre la legalidad del contenido generado en jurisdicciones concretas.
- Documentación inexistente: la model card no contiene especificaciones técnicas, lo que dificulta la evaluación de riesgos en producción.
- Cero tracción comunitaria (0 descargas, 0 likes en el momento de la consulta): sin validación externa ni reportes de uso.

## Enlaces

- Hugging Face: https://huggingface.co/ReadyArt/Dark-Craving-31B-v3.0-GGUF
