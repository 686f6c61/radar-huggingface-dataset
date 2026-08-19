# Ishowbackup/Gemma-4-E2B-it-qat-JANG_4M-CRACK

## Resumen

El modelo **Gemma-4-E2B-it-qat-JANG_4M-CRACK** es una versión "abliterada" (eliminación de rechazos) del modelo base `google/gemma-4-e2b-it`, publicada por el usuario Ishowbackup en HuggingFace. Se trata de un modelo multimodal (imagen, texto y audio) con capacidades de razonamiento, desarrollado sobre la arquitectura Gemma 4 de Google, adaptada al formato MLX para ejecución eficiente en Apple Silicon. Su principal característica es la eliminación completa de comportamientos de rechazo (refusal) en categorías de contenido dañino, manteniendo una pérdida mínima de rendimiento en tareas de conocimiento general (MMLU -1,7 %).

El modelo emplea una cuantización híbrida denominada JANG_4M (atención en 8 bits, MLP en 4 bits, ~4,3 bits promedio), lo que reduce el tamaño a aproximadamente 7,3 GB. Con 3.636.545.091 parámetros totales y una arquitectura de embeddings por capa (estilo Gemma-3n), el modelo efectivo se comporta como un sistema de ~2B parámetros. Está diseñado para ejecutarse exclusivamente con el motor vMLX, que incluye soporte completo para Gemma 4, y se distribuye bajo la licencia Gemma de Google.

La relevancia de este modelo radica en su enfoque de "abliteration" aplicado a un modelo multimodal de última generación, ofreciendo una alternativa sin restricciones de contenido para investigación en seguridad de IA y aplicaciones que requieren generación de texto sin filtros. Sin embargo, su uso conlleva responsabilidades legales y éticas, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense + Hybrid Sliding/Global Attention, per-layer input embeddings (estilo Gemma-3n) |
| Parametros totales | 3.636.545.091 (efectivos ~2B por embeddings por capa) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_4M (atencion 8-bit / MLP 4-bit, ~4,3 bits promedio); tambien existe variante MXFP4 |
| Idiomas soportados | no disponibles |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors (MLX-native) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, que combina atención densa con atención híbrida deslizante/global (sliding/global attention) y utiliza embeddings de entrada por capa, una técnica introducida en la familia Gemma-3n. Esta configuración permite un uso más eficiente de los parámetros, logrando un rendimiento efectivo de ~2B parámetros con un total de 3,6B. El modelo es multimodal: procesa imágenes (passthrough en float16), audio y texto, e incorpora un canal de razonamiento ("channel-based thinking") que le permite deliberar antes de responder.

El entrenamiento consiste en un proceso de "abliteration" (denominado CRACK) aplicado sobre el modelo base `google/gemma-4-e2b-it`. Este proceso elimina los mecanismos de rechazo (refusal) que el modelo original mostraba ante solicitudes de contenido dañino, sin reentrenar los pesos principales. Según la model card, se logró una tasa de cumplimiento del 100 % en el conjunto HarmBench-320 (categorías de daño), con una pérdida de solo 1,7 puntos porcentuales en MMLU (de 61,8 % a 60,1 %). No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO; la abliteración es una técnica de post-procesamiento que modifica la activación de ciertas capas para suprimir comportamientos de rechazo.

## Capacidades

- Generación de texto y conversación multimodal: acepta entradas de imagen, audio y texto, y produce respuestas textuales.
- Razonamiento multi-paso: incorpora un modo de pensamiento ("channel-based thinking") que mejora la coherencia en tareas complejas.
- Generación de código: verificado para producir código funcional en diversos lenguajes.
- Comprensión de imágenes: procesa imágenes en float16, lo que permite descripciones y respuestas basadas en contenido visual.
- Procesamiento de audio: soporta entradas de audio, aunque no se especifican los formatos exactos.
- Multilingüe: el modelo base Gemma 4 es multilingüe, pero no se han publicado los idiomas específicos soportados en esta variante.
- Sin rechazos: el modelo no se niega a responder ante solicitudes de contenido dañino (100 % de cumplimiento en HarmBench), lo que lo hace útil para investigación en seguridad y generación sin censura.
- Tool calling y function calling: no se menciona explícitamente en la documentación disponible.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar el comportamiento de modelos sin mecanismos de rechazo, facilitando el análisis de sesgos, alucinaciones y riesgos de contenido dañino en entornos controlados.
- Generación de contenido creativo sin restricciones: escritores y artistas pueden utilizarlo para explorar temas tabú o controvertidos sin que el modelo se niegue a responder, siempre bajo responsabilidad legal.
- Desarrollo de asistentes conversacionales especializados: su capacidad multimodal (imagen, audio, texto) y su razonamiento multi-paso lo hacen adecuado para prototipos de asistentes que necesitan comprender entradas variadas y mantener conversaciones largas.
- Generación de código en entornos de investigación: su habilidad para producir código funcional, combinada con la ausencia de rechazos, permite experimentar con generación de scripts para tareas de automatización o análisis de datos.
- Evaluación de técnicas de alineación: al comparar este modelo con su versión base, los investigadores pueden medir el impacto de la abliteración en el rendimiento y la seguridad, contribuyendo al desarrollo de métodos de alineación más robustos.
- Prototipado de aplicaciones multimodales en Apple Silicon: gracias a su formato MLX y su cuantización eficiente, puede integrarse en aplicaciones macOS que requieran procesamiento local de imágenes, audio y texto sin depender de la nube.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, medidos en el entorno de generación (el modelo razona antes de responder):

| Benchmark | Base (google/gemma-4-e2b-it) | CRACK (este modelo) | Δ |
|---|---|---|---|
| MMLU | 61,8 % | 60,1 % | -1,7 % |
| HarmBench (cumplimiento de categorías de daño) | ~0 % (rechaza) | 240/240 (100 %) | +100 % |

Desglose de HarmBench por categoría:

| Categoria | Cumplimiento |
|---|---|
| Actividades ilegales | 53/53 (100 %) |
| Quimico / biologico | 42/42 (100 %) |
| Ciberdelincuencia / intrusion | 52/52 (100 %) |
| Desinformacion | 54/54 (100 %) |
| Acoso / bullying | 21/21 (100 %) |
| Contenido danino | 18/18 (100 %) |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (Mac con chip M1 o superior) debido al formato MLX.
- Memoria unificada: se requiere memoria suficiente para cargar el modelo (~7,3 GB según la card, aunque el repositorio ocupa 7,9 GB). Se recomienda al menos 16 GB de RAM unificada para un funcionamiento fluido con contexto moderado.
- GPU: no aplica GPU dedicada; el modelo utiliza la GPU integrada del chip Apple Silicon (Neural Engine y GPU unificada).
- Motor de inferencia: vMLX (https://vmlx.net) con soporte para Gemma 4. Las librerías estándar `mlx_lm` y `mlx_vlm` no son compatibles completamente.
- Latencia y throughput: no se proporcionan datos específicos. Se espera un rendimiento adecuado para inferencia local en Macs con suficiente memoria, pero no se pueden dar cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares (mismo tamaño o misma tarea) en la documentación proporcionada. El modelo base `google/gemma-4-e2b-it` es su referencia directa, pero no se ofrecen datos de otros modelos abliterados o multimodales comparables.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una versión abliterada, el modelo puede generar contenido dañino, sesgado o falso sin filtros. No se han realizado evaluaciones de sesgo más allá de MMLU y HarmBench.
- Riesgo de mal uso: la eliminación de rechazos facilita la generación de contenido ilegal o perjudicial. El autor advierte que los usuarios son responsables del cumplimiento de las leyes y regulaciones aplicables.
- Licencia Gemma: la licencia de Google impone restricciones de uso comercial y requiere el cumplimiento de sus políticas de uso aceptable. Es necesario revisar los términos completos antes de cualquier despliegue en producción.
- Dependencia de vMLX: el modelo solo funciona con el motor vMLX, que no es de código abierto estándar y puede tener limitaciones de soporte o actualizaciones.
- Contexto limitado: no se especifica la longitud de contexto, lo que puede afectar a tareas que requieran ventanas largas.
- Idiomas no documentados: aunque el modelo base es multilingüe, no se han publicado los idiomas concretos soportados en esta variante, lo que dificulta su uso en aplicaciones multilingües.
- Fecha de creación inusual: el modelo está fechado en agosto de 2026, lo que sugiere que puede ser un artefacto experimental o una prueba de concepto; se recomienda verificar su procedencia antes de usarlo en entornos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/Gemma-4-E2B-it-qat-JANG_4M-CRACK
- Motor vMLX: https://vmlx.net
- Sitio web de dealign.ai (investigación): https://dealign.ai
- Soporte en Ko-fi: https://ko-fi.com/dealignai
- Perfil en X (Twitter): https://x.com/dealignai
