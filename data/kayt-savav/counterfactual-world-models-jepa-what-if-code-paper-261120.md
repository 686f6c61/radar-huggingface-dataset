# KAYT-SAVAV/counterfactual-world-models-jepa-what-if-code-paper-261120

## Resumen

Este repositorio no contiene un modelo de IA entrenado, sino una copia sin modificar del código y el artículo «Counterfactual World Models: JEPAs That Reason About "What If"», de Randall Balestriero, Yann LeCun y Kerda Varaku (arXiv 2611.24778). El autor de la copia, KAYT-SAVAV, lo publica como referencia técnica para su propio trabajo sobre vehículos, y declara explícitamente que no se han copiado pesos preentrenados. Por tanto, no existe un checkpoint utilizable directamente desde Hugging Face: el repositorio ocupa 0.0 GB y no ofrece pipeline de inferencia.

El interés técnico reside en la propuesta del artículo: un modelo de mundo (world model) basado en JEPA (Joint Embedding Predictive Architecture) capaz de responder preguntas contrafactuales del tipo «qué habría pasado si se hubiera aplicado otra acción en el mismo evento». La técnica descrita consiste en sumar al error observado de la predicción la predicción bajo la acción alternativa, sin necesidad de reentrenar el modelo con datos contrafactuales.

Es relevante ahora porque los JEPA de LeCun se han consolidado como una línea de investigación activa en representaciones predictivas auto-supervisadas, y este trabajo extiende esa familia hacia el razonamiento contrafactual, una capacidad clave para planificación y evaluación de políticas en robótica y conducción. No obstante, el artículo no cubre ni conducción ni audio, según la propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | JEPA (Joint Embedding Predictive Architecture) aplicada a modelos de mundo contrafactuales; detalles concretos no disponibles en la información proporcionada |
| Parámetros totales | no disponible (no se publican pesos) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (código); artículo bajo CC BY 4.0; mallas BlueROV2 bajo LGPL-3.0 |
| Formato de pesos | no disponible (el repositorio no incluye pesos; el código descarga codificadores públicos bajo sus propias licencias) |

## Arquitectura y entrenamiento

El repositorio replica el código de los autores (132 archivos, commit `5c84bba92b2ff19d41175070a61238fa1396d10d` del repositorio `galilai-group/counterfactual-WM`) y el PDF del artículo en su versión v1. La arquitectura subyacente es JEPA, un enfoque de modelado predictivo en espacio latente que predice representaciones en lugar de píxeles u observaciones brutas. El artículo aborda el razonamiento contrafactual: dado un evento observado y una acción alternativa no ejecutada, el modelo estima el resultado bajo esa acción sumando el error de predicción observado a la predicción bajo la acción contrafactual.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. Los experimentos del artículo se apoyan en codificadores públicos descargados por el propio código, cada uno sujeto a su licencia, listada en `code/THIRD_PARTY_NOTICES.md`.

## Capacidades

- Razonamiento contrafactual sobre eventos: responder «qué habría pasado» bajo una acción distinta en el mismo evento, mediante la corrección del error de predicción.
- Modelado de mundo en espacio latente (JEPA), orientado a representaciones predictivas.
- Base de código reproducible para experimentos de investigación, con 132 archivos y dependencias documentadas.
- Inclusión del artículo completo (v1) para consulta y verificación de métodos.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo, al no tratarse de un modelo conversacional.

## Casos de uso

- Investigación en modelos de mundo: servir como base reproducible para extender JEPA hacia razonamiento contrafactual, partiendo del código y el artículo incluidos.
- Evaluación de políticas en robótica: analizar qué habría ocurrido con una acción alternativa en una trayectoria registrada, útil para auditoría de controladores.
- Referencia para planificación contrafactual en vehículos: el autor de la copia lo emplea como referencia para preguntar qué podría haber hecho distinto su propio vehículo, según declara en la model card.
- Reproducción de experimentos del artículo: el código permite replicar los resultados publicados en arXiv 2611.24778v1.
- Formación y docencia: material de estudio sobre JEPA y modelado predictivo en espacio latente, con paper y código en un único repositorio.
- Punto de partida para integración con codificadores públicos: el código descarga encoders existentes, lo que facilita sustituirlos por otros según la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas ni tablas de evaluación; estas, si existen, estarían en el PDF del artículo, cuyo contenido numérico no se detalla en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no publicarse pesos ni tamaño de modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica; el repositorio contiene código de investigación, no un checkpoint servible con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos publicados | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Counterfactual World Models (este repositorio) | Código y artículo JEPA | No | no disponible | MIT (código), CC BY 4.0 (paper) | Copia en HF, sin pipeline |
| I-JEPA (Meta) | JEPA de imagen | Sí | no aplica | no disponible en esta ficha | Checkpoints públicos |
| V-JEPA (Meta) | JEPA de vídeo | Sí | no aplica | no disponible en esta ficha | Checkpoints públicos |

La comparación se limita a la familia JEPA por ser la línea arquitectónica del artículo; no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: no hay pesos, ni pipeline, ni API de inferencia; solo código y PDF.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (20 de noviembre de 2026), sin histórico de mantenimiento.
- El código descarga codificadores de terceros cuyas licencias difieren de la MIT del repositorio; es obligatorio revisar `code/THIRD_PARTY_NOTICES.md` antes de uso comercial.
- Las mallas BlueROV2 están bajo LGPL-3.0, lo que impone obligaciones adicionales si se redistribuyen.
- El artículo no cubre conducción ni audio, pese a que la model card menciona aplicaciones vehiculares como motivación del copista.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas, al no ser un modelo de lenguaje.
- La copia se declara «sin modificar»; cualquier corrección o actualización debe buscarse en el repositorio original de los autores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KAYT-SAVAV/counterfactual-world-models-jepa-what-if-code-paper-261120
- Artículo en arXiv: https://arxiv.org/abs/2611.24778v1
- Código original de los autores: https://github.com/galilai-group/counterfactual-WM (commit `5c84bba92b2ff19d41175070a61238fa1396d10d`)
- Demo de los autores: https://huggingface.co/spaces/galilai-group/cwm_demo
