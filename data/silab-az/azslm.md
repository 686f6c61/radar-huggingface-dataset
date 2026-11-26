# silab-az/AzSLM

## Resumen

AzSLM (Azerbaijani Small Language Models) es una iniciativa de investigación del centro SİLAB — Artificial Intelligence Research & Engineering, con sede en Azerbaiyán, orientada al desarrollo de modelos de lenguaje de pequeno tamano (SLM) especializados en azerbaiyano. El repositorio de Hugging Face actúa por ahora como espacio de anuncio del proyecto: no contiene pesos, no declara arquitectura, tamano ni longitud de contexto, y su licencia queda pendiente de definición en el momento del lanzamiento. La fecha de creación del repositorio (noviembre de 2026) y su estado "under active research and development" indican que se trata de un proyecto en fase temprana.

El interés del proyecto reside en su enfoque: no parte de un modelo multilingue generico, sino que plantea transferencia de conocimiento lingüístico, adaptación cross-lingual, optimización de tokenizador y vocabulario, destilación, cuantización e inferencia eficiente para despliegue local y en dispositivo. Es decir, la propuesta es construir un modelo pequeno y eficiente con competencia real en azerbaiyano, un idioma de la familia túrquica con recursos limitados en la mayoría de los LLM comerciales.

Para desarrolladores e investigadores, AzSLM es relevante como referencia de un patrón creciente: laboratorios nacionales o regionales que entrenan SLM para idiomas de bajos recursos, priorizando eficiencia y despliegue on-device frente a escala bruta. Sin embargo, en el momento de redactar esta ficha no existe ningún artefacto descargable ni dato técnico verificable, por lo que cualquier evaluación práctica es imposible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la cuantizacion figura como línea de investigación, sin formatos publicados) |
| Idiomas soportados | azerbaiyano (az) |
| Licencia | no disponible (los terminos se anunciarán en el lanzamiento; copyright 2026 SİLAB) |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card no especifica si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o un diseño basado en state space models. Tampoco se indica el número de parametros, la composición del corpus de entrenamiento, el volumen de tokens, ni si se han aplicado técnicas de alineación como RLHF, DPO o instruction tuning supervisado.

Las únicas pistas técnicas provienen de las líneas de investigación declaradas por SİLAB: transferencia de comprensión lingüística, adaptación cross-lingual de modelos, optimización de tokenización y vocabulario, fine-tuning y destilación, cuantización e inferencia eficiente, y despliegue local y en dispositivo. Esto sugiere, aunque no confirma, una estrategia de partida desde un modelo base multilingue existente, adaptado al azerbaiyano mediante ajuste fino y posiblemente destilación hacia un tamano menor, con un tokenizador revisado para mejorar la eficiencia sobre morfología túrquica aglutinante. Cualquier afirmación más allá de esto sería especulativa.

## Capacidades

- Generación de texto en azerbaiyano: capacidad declarada como objetivo del proyecto, no verificable sin pesos.
- Comprensión lingüística del azerbaiyano: línea de investigación central del proyecto.
- Seguimiento de instrucciones (instruction-following): mencionado explícitamente como capacidad objetivo en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no declaradas; el único idioma listado es `az`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Despliegue local y en dispositivo: declarado como objetivo de ingeniería del proyecto.

## Casos de uso

- Procesamiento de textos administrativos y legales en azerbaiyano: un SLM especializado podría resumir, clasificar y extraer entidades de documentación pública en azerbaiyano, un dominio donde los modelos multilingües genéricos rinden por debajo de su media en inglés. Requiere que el modelo se publique con pesos y licencia clara.
- Atención al cliente en azerbaiyano: despliegue on-premise de un modelo pequeno para respuestas FAQ y clasificación de intenciones en centros de contacto locales, con coste de inferencia bajo y sin dependencia de APIs externas.
- Asistentes embebidos en dispositivo: dado el foco declarado en despliegue local y cuantización, el modelo podría integrarse en aplicaciones móviles o de escritorio para autocompletado, corrección y dictado en azerbaiyano.
- Investigación en transferencia cross-lingual: el proyecto puede servir como caso de estudio reproducible de adaptación de un modelo base a un idioma de bajos recursos, útil para laboratorios que trabajen con lenguas túrquicas o de recursos limitados.
- Generación aumentada por recuperación (RAG) sobre corpus en azerbaiyano: un SLM con contexto moderado y bajo coste permitiría indexar y consultar documentación local (prensa, normativa, manuales) sin salir a la nube.
- Evaluación comparativa de tokenizadores: la línea de optimización de vocabulario publicada por SİLAB puede interesar a quienes disenen tokenizadores para lenguas aglutinantes, comparando eficiencia de compresión y calidad downstream.
- Filtrado y moderación de contenido en azerbaiyano: clasificación de texto a bajo coste en plataformas locales, siempre que existan pesos y una licencia que lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamano final del modelo, que no se ha anunciado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el proyecto declara el despliegue local y on-device como objetivo, pero sin especificaciones no puede confirmarse.
- Opciones de despliegue: no disponible; la model card menciona cuantización e inferencia eficiente como líneas de investigación, sin nombrar runtimes concretos (vLLM, llama.cpp, Ollama, TGI u otros).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa sin parametros, contexto ni resultados publicados. A modo orientativo de categoria (SLM para idiomas de bajos recursos), podrían considerarse alternativas como los modelos de la familia Gemma 2/3 de Google en sus variantes pequenas, Qwen2.5 en tamanos de 0.5B a 3B, o los modelos Turbo de la familia Tülu/Olmo de AI2, todos con pesos publicos y licencias definidas. La diferencia práctica es que AzSLM, en su estado actual, no ofrece pesos ni licencia, por lo que no es desplegable ni comparable en rendimiento.

| Modelo | Parametros | Contexto | Licencia | Pesos disponibles |
|---|---|---|---|---|
| AzSLM | no disponible | no disponible | no disponible | no |
| Gemma 2 (2B) | 2B | 8K | Gemma Terms | sí |
| Qwen2.5 (1.5B/3B) | 1.5B / 3B | 32K | Apache 2.0 (mayoría de tamanos) | sí |
| Olmo 2 (7B) | 7B | 4K | Apache 2.0 | sí |

## Limitaciones y advertencias

- Ausencia total de pesos: el repositorio declara explícitamente que no hay pesos disponibles; no es posible evaluar, desplegar ni reproducir nada.
- Licencia indefinida: los terminos se anunciarán en el lanzamiento; no puede asumirse uso comercial permitido.
- Sin datos de arquitectura, tamano ni contexto: imposible estimar requisitos de hardware o coste de inferencia.
- Cobertura lingüística limitada: el único idioma declarado es el azerbaiyano; no se anuncia soporte multilingüe ni de inglés.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; en un SLM de idioma de bajos recursos el riesgo de fabricación de datos y de mezcla con lenguas túrquicas relacionadas (turco, turcomano) puede ser mayor, aunque no puede cuantificarse sin evaluación.
- Sesgos: no documentados; los corpus en azerbaiyano disponibles públicamente pueden estar sesgados hacia determinadas fuentes (prensa estatal, Wikipedia), lo que afectaría a la neutralidad.
- Estado del proyecto: "under active research and development", con posibilidad de cambios sustanciales o cancelación antes del lanzamiento.
- Fecha de creación futura en el repositorio (2026): conviene verificar la vigencia y autenticidad del proyecto antes de planificar cualquier integración en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/silab-az/AzSLM
- Web de SİLAB: https://silab.az
- GitHub de SİLAB: https://github.com/silab-az
