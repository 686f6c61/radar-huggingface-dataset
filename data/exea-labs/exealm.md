# exea-labs/ExeaLM

## Resumen

ExeaLM es un proyecto de modelo de lenguaje de gran escala desarrollado por Exea Labs, una iniciativa abierta liderada por estudiantes de secundaria. El modelo se presenta como un desarrollo "from scratch" (desde cero) con arquitectura propia, código abierto y pesos abiertos bajo licencia Apache 2.0. En el momento de la publicación de esta ficha, el proyecto se encuentra en estado de *research preview* y no se ha publicado ningún checkpoint ni peso entrenado.

La propuesta del proyecto es construir un modelo de lenguaje de forma abierta y documentada, con especial énfasis en la transparencia del proceso (arquitectura, datos, filtros y mezcla de entrenamiento). El plan de entrenamiento contempla aproximadamente 2 billones de tokens procedentes de corpus abiertos, principalmente el NII LLM-jp Corpus v4 y los datos publicados junto a K2 Horizon. Todos los detalles de arquitectura, número de parámetros, longitud de contexto y tokenizador están por decidir.

La relevancia de ExeaLM es fundamentalmente educativa y de investigación: busca servir como caso de estudio sobre cómo se construye un modelo de lenguaje abierto, no como un modelo listo para producción. La ficha refleja el estado actual del proyecto, con múltiples especificaciones marcadas como no disponibles al no haberse publicado todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Personalizada, diseñada por colaboradores; detalles por publicar (no disponible) |
| Parámetros totales | No disponible (por decidir) |
| Parámetros activos | No disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | No disponible (por decidir) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (por decidir) |
| Licencia | Apache 2.0 (tanto para código como para pesos) |
| Formato de pesos | No disponible (no se han publicado pesos) |

## Arquitectura y entrenamiento

La arquitectura es de diseño propio y será definida por los colaboradores del proyecto; la model card indica que los detalles se publicarán en la propia página y en el repositorio de código una vez finalizados. No se especifica si se trata de un transformer denso, una arquitectura MoE, un modelo híbrido o cualquier otra variante. Tampoco se han publicado datos sobre el tokenizador, la longitud de contexto objetivo ni el número de parámetros previsto.

En cuanto al entrenamiento, el plan contempla aproximadamente 2 billones de tokens seleccionados de corpus abiertos, con especial peso del NII LLM-jp Corpus v4 y de los datos liberados junto a K2 Horizon. La model card compromete la publicación de una *data card* con las fuentes finales, licencias, filtros y mezcla de datos antes de ejecutar cualquier entrenamiento. No se menciona el uso de RLHF, DPO ni ninguna otra técnica de alineación, ni innovaciones técnicas concretas más allá del enfoque abierto y documentado del proceso.

## Capacidades

- No se han publicado capacidades concretas del modelo, ya que no existen checkpoints disponibles.
- Se desconoce si soportará generación de texto, razonamiento, código, matemáticas o visión.
- No hay información sobre soporte de *tool calling* o *function calling*.
- No hay información sobre capacidades de agentes o razonamiento multi-paso.
- No se ha definido el conjunto de idiomas soportados.
- No se ha confirmado ningún modo especial (thinking mode, visión, audio, etc.).

## Casos de uso

- Investigación educativa sobre construcción de modelos: el proyecto está pensado explícitamente para el estudio de cómo se entrena un modelo de lenguaje abierto, por lo que su uso principal es formativo y de análisis del proceso (arquitectura, datos, evaluación).
- Reproducción de pipelines de entrenamiento: al publicarse el código y, previsiblemente, las recetas de datos, equipos de investigación pueden replicar o adaptar el proceso en entornos académicos.
- Estudio de mezclas de datos abiertos: el uso planificado del NII LLM-jp Corpus v4 y de los datos de K2 Horizon permite analizar el impacto de distintas composiciones de corpus en el rendimiento final.
- Docencia en cursos de IA: el carácter abierto y documentado del proyecto lo hace adecuado como material de referencia en asignaturas de aprendizaje automático.
- Evaluación comparativa de metodologías abiertas: una vez publicados los checkpoints, podría emplearse como referencia en estudios sobre transparencia y reproducibilidad en el desarrollo de LLM.
- Colaboración comunitaria: el repositorio y el formulario de contribución permiten que desarrolladores e investigadores participen en el diseño y la validación del modelo, lo que constituye en sí mismo un caso de uso de investigación abierta.

No se recomienda su uso en producción ni en decisiones de alto impacto, tal como indica la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no existen resultados de evaluación todavía y que se publicarán junto con cada checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el número de parámetros ni la arquitectura.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se han publicado pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. Al no existir pesos publicados, parámetros definidos ni resultados de evaluación, no es posible establecer una comparación técnica significativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El proyecto se encuentra en estado de *research preview* y no ha publicado ningún peso; no es utilizable para inferencia.
- No existen resultados de evaluación, por lo que se desconoce su comportamiento real.
- La model card advierte de que, como cualquier modelo entrenado con datos a escala web, los modelos publicados podrían generar texto incorrecto, sesgado o dañino.
- No está destinado a decisiones de alto impacto.
- La arquitectura, el tamaño, el contexto y los idiomas están por decidir, lo que impide planificar su integración en producción.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la ausencia de pesos y de documentación técnica impide cualquier uso práctico actual.
- El liderazgo del proyecto por parte de estudiantes de secundaria, aunque valioso como iniciativa educativa, implica un riesgo de continuidad y de madurez técnica que conviene considerar.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/exea-labs/ExeaLM
- Repositorio de código: https://github.com/exea-labs/ExeaLM
- Guía de contribución: https://github.com/exea-labs/ExeaLM/blob/main/CONTRIBUTING.md
- Código de conducta: https://github.com/exea-labs/ExeaLM/blob/main/CODE_OF_CONDUCT.md
- Formulario de inscripción de colaboradores: https://docs.google.com/forms/d/e/1FAIpQLSdPHVZhuXxBDUf-cJM2zDbj1JZPsduu95Y_kTJ_g4gKAXdDVw/viewform
- Sitio web de Exea Labs: https://exealabs.org
- NII LLM-jp Corpus v4: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4
- Blog de K2 Horizon: https://ifm.ai/blog/k2
