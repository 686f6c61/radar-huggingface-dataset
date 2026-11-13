# BH-Language-AI/bh-decision-1-2b

## Resumen
BH-Decision-1-2B es una ficha de proyecto (no un modelo entrenado) publicada por BH-Language-AI bajo el identificador `BH-Language-AI/bh-decision-1-2b`. La model card indica explicitamente que las tezinas (pesos) no existen todavía y que se trata de una tarjeta de proyecto para una futura generación 1 de un modelo de decisión de aproximadamente 2B parámetros, orientado al idioma bosnio (código `bs`). El modelo base declarado es `utter-project/EuroLLM-1.7B`, un modelo europeo con licencia Apache-2.0.

El objetivo anunciado es entrenar un modelo especializado en toma de decisiones sobre la base de EuroLLM-1.7B, con publicación de pesos condicionada a la aprobación del entrenamiento y a una evaluación verificada. En el momento de la consulta, la página registra 0 descargas y 0 likes, y las fechas de creación y actualización son del 13 de noviembre de 2026. No hay información sobre arquitectura propia, dataset de entrenamiento, hiperparámetros ni resultados de evaluación.

Dado que no existen pesos ni artefactos publicados, esta ficha documenta únicamente lo que la model card declara y marca como "no disponible" cualquier dato técnico que no haya sido proporcionado por el autor. Es relevante para desarrolladores e investigadores porque establece el esquema de nomenclatura (`bh-decision-{generacion}-{tamano}`) y la base sobre la que se construirá el modelo, pero no permite aún su uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del base `utter-project/EuroLLM-1.7B`) |
| Parametros totales | ~2B (según el identificador y la model card; no verificado) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bosnio (`bs`) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (los pesos no existen todavía) |

## Arquitectura y entrenamiento
La model card no describe la arquitectura del modelo final. El modelo base declarado es `utter-project/EuroLLM-1.7B`, del que se heredarían presumiblemente las características arquitectónicas, pero no se proporcionan detalles sobre número de capas, dimensiones, mecanismo de atención ni vocabulario. No se especifica si el ajuste será un fine-tuning supervisado, RLHF, DPO o otra técnica.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de anotación ni las innovaciones técnicas previstas. La model card indica únicamente que la publicación de pesos se realizará "tek nakon odobrenog treninga i verificirane evaluacije" (solo tras un entrenamiento aprobado y una evaluación verificada), lo que confirma que el entrenamiento no se ha completado o no ha sido aprobado.

## Capacidades
- No se declaran capacidades operativas, ya que el modelo no dispone de pesos publicados.
- El propósito declarado es la toma de decisiones (`decision-making`), pero no se especifica el formato de entrada/salida, el dominio de decisión ni el protocolo de evaluación.
- Soporte multilingüe: únicamente bosnio (`bs`) según los metadatos.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No hay información sobre generación de código, matemáticas o razonamiento multi-paso.

## Casos de uso
No es posible enumerar casos de uso prácticos porque el modelo no tiene pesos disponibles. Cualquier aplicación requeriría esperar la publicación de los artefactos y la evaluación verificada anunciada por el autor. Los escenarios previstos por el autor (toma de decisiones en bosnio) no están detallados en la información proporcionada, por lo que no se pueden concretar flujos de integración, latencias ni requisitos. Se recomienda consultar la model card y la colección BH-Decision para futuras actualizaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible (dependerá del tamaño final y la cuantización; para un modelo de ~2B en FP16 se situaría típicamente en torno a 4-5 GB, pero este dato no ha sido proporcionado por el autor).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (la librería declarada es `transformers`, pero no hay pesos para cargar).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|
| BH-Decision-1-2B | ~2B (declarado) | no disponible | Apache-2.0 | Pesos no publicados |
| utter-project/EuroLLM-1.7B | 1.7B | no disponible en esta ficha | Apache-2.0 | Pesos publicados |
| No disponible | — | — | — | — |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría (modelos de decisión en bosnio), ya que no existen resultados de evaluación publicados para este proyecto.

## Limitaciones y advertencias
- El modelo no está entrenado y no dispone de pesos: no puede utilizarse para inferencia.
- La model card declara explicitamente "STATUS: NIJE TRENIRAN" (no entrenado), por lo que cualquier uso en producción es inviable en la fecha de consulta.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones de contexto o idioma.
- La licencia Apache-2.0 permite uso comercial, pero al no existir artefactos publicados no hay garantías sobre el modelo final; la licencia del modelo base (`utter-project/EuroLLM-1.7B`) también es Apache-2.0 según los metadatos.
- El identificador sugiere ~2B parámetros, pero el modelo base es de 1.7B; la discrepancia no está explicada en la model card.
- La fecha de creación (2026-11-13) es posterior a la fecha actual de muchas consultas; conviene verificar la vigencia de la información.

## Enlaces
- Hugging Face: https://huggingface.co/BH-Language-AI/bh-decision-1-2b
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
