# amyhughes/reading-document-ai

## Resumen

Este repositorio de HuggingFace, publicado por el usuario amyhughes bajo licencia MIT, no contiene un modelo de inteligencia artificial entrenado, sino una nota exploratoria de investigación sobre Document AI. El fichero principal, `analysis.md`, documenta el alcance de una pregunta de investigación, los posibles factores de confusión, la comparación propuesta con modelos de referencia y los requisitos de reproducibilidad para evaluar sistemas de comprensión de documentos. Incluye referencias a conjuntos de datos como FUNSD, SROIE y CORD, pero deja claro que no se han ejecutado experimentos ni se ha publicado ningún checkpoint.

El repositorio tiene un tamaño de 0.0 GB y contiene 16.576 parámetros, aunque esta cifra corresponde al tamaño en tokens del texto de las notas, no a parámetros de red neuronal. Su propósito es servir como punto de partida para futuras investigaciones, no como un modelo utilizable. No hay ningún pipeline definido ni idiomas soportados, y la fecha de creación es el 26 de agosto de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo entrenado) |
| Parametros totales | 16.576 (tokens de texto en las notas, no parámetros de red) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No aplica (no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura ni entrenamiento en este repositorio. Se trata de un documento de planificación que describe el diseño de un estudio futuro sobre Document AI. El README indica explícitamente que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales. Si en el futuro se añadieran resultados, deberían incluir versiones de los conjuntos de datos, comandos, semillas, hardware y registros crudos.

## Capacidades

- No es un modelo funcional. No puede generar texto, razonar, procesar código o realizar ninguna tarea de IA.
- El repositorio contiene únicamente una nota de investigación (`analysis.md`) que describe el alcance de un estudio planificado sobre comprensión de documentos.
- No ofrece capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni ninguna otra funcionalidad práctica.

## Casos de uso

No hay casos de uso prácticos para este repositorio como modelo. Su única utilidad es como documentación de referencia para investigadores que planeen evaluar sistemas de Document AI. No se puede desplegar en producción ni integrar en aplicaciones. No es adecuado para atención al cliente, generación de código, análisis de documentos en tiempo real, ni ningún otro escenario operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio README indica que la nota es exploratoria y no reivindica mejoras de rendimiento, ablaciones completadas, código publicado ni un checkpoint entrenado.

## Requisitos de hardware

No aplica. No existe un modelo que ejecutar. No hay requisitos de VRAM, GPU, latencia o throughput.

## Comparativa con modelos similares

No disponible. Al no ser un modelo entrenado, no se puede comparar con alternativas como LayoutLM, Donut o Pix2Struct. La única comparación posible sería a nivel de documento de planificación, pero no se dispone de información sobre otros repositorios similares.

## Limitaciones y advertencias

- No es un modelo utilizable: no hay ningún peso ni arquitectura que cargar.
- No se puede utilizar en producción ni en investigación como sistema de Document AI.
- Las referencias a FUNSD, SROIE y CORD son propuestas de evaluación, no resultados obtenidos.
- El contenido puede cambiar si el autor añade resultados en el futuro, pero actualmente no hay evidencia de experimentos completados.
- La licencia MIT se aplica a las notas, pero los términos de los conjuntos de datos externos deben revisarse por separado si se usan.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amyhughes/reading-document-ai
- Noticia sobre un modelo que enseña a la IA a leer como humanos (Futurity): https://www.futurity.org/model-teaches-ai-to-read-more-like-humans/
- Documentación de OCR Read de Azure Document Intelligence: https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/prebuilt/read?view=doc-intel-4.0.0
- Lector de documentos con IA (TTS.ai): https://tts.ai/reader/
- Leaderboard de comprensión de documentos (Document Arena): https://arena.ai/leaderboard/document
- Noticia sobre el hackeo de un modelo de Meta durante pruebas de ciberseguridad (The Guardian): https://www.theguardian.com/technology/2026/aug/05/meta-ai-model-hack-training
