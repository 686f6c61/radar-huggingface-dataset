# mradermacher/Nyx-RP-9B-Instruct-2608-v1-OBLITERATED-GGUF

## Resumen

Nyx-RP-9B-Instruct-2608-v1-OBLITERATED-GGUF es una cuantizacion GGUF del modelo Nyx-RP-9B-Instruct-2608-v1-OBLITERATED, publicada por mradermacher. El modelo base, desarrollado por Muyuxiao, es una variante "abliterada" del modelo Nyx-RP-9B-Instruct-2608-v1: mediante la tecnica de abliteration se ha eliminado el alineamiento de seguridad, dejando un modelo sin censura orientado a roleplay y conversacion en ingles.

La cuantizacion GGUF, realizada por mradermacher en el marco de su trabajo para nethype GmbH, ofrece 12 versiones con distintos niveles de precision, desde Q2_K (3,9 GB) hasta f16 (18,0 GB). El modelo tiene aproximadamente 8,95 mil millones de parametros y esta pensado para ejecucion local en hardware de consumo. Es relevante para desarrolladores que buscan un modelo conversacional sin restricciones de contenido, con soporte de cuantizacion flexible para distintos presupuestos de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Al estar basado en la libreria transformers, se asume una arquitectura transformer densa de ~9B parametros, aunque el tipo exacto (Llama, Mistral, Qwen, etc.) no se ha confirmado. El proceso "OBLITERATED" indica que se ha aplicado abliteration, una tecnica de ablacion direccional que elimina las direcciones de rechazo en el espacio de representaciones del modelo, eliminando asi el alineamiento de seguridad sin necesidad de reentrenamiento. No se dispone de datos sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, orientado a roleplay (RP) y escenarios interactivos.
- Formato instruct: responde a instrucciones y mantiene conversaciones multi-turno.
- Sin censura: al ser abliterado, no rechaza solicitudes de contenido sensible, explicito o controvertido.
- Compatible con endpoints de inferencia (tag "endpoints_compatible").
- No se confirma soporte de tool calling, function calling ni razonamiento multi-step.

## Casos de uso

- Roleplay por texto: el modelo puede mantener personajes y narrativas de roleplay en chats, con libertad tematica total gracias a la abliteration.
- Escritura de ficcion creativa: permite generar relatos, dialogos y escenas con contenido adulto o explicito sin las restricciones habituales de los modelos alineados.
- Chatbots personalizados sin filtros: para comunidades que requieren asistentes virtuales sin moderacion de contenido, como foros de roleplay o plataformas de escritura colaborativa.
- Exploracion de tecnicas de abliteration: sirve como caso de referencia para estudiar el efecto de la eliminacion del alineamiento de seguridad en modelos de ~9B.
- Generacion de dialogos para NPC en videojuegos: los desarrolladores pueden integrar el modelo en motores de juego para crear NPCs con respuestas no restringidas tematicamente.
- Despliegue local con GGUF: gracias a las cuantizaciones Q4_K_M o Q5_K_M, se puede ejecutar en GPUs de consumo con 6-8 GB de VRAM mediante llama.cpp o Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Q2_K (3,9 GB): requiere ~5 GB de VRAM; ejecutable en GPUs de gama baja como GTX 1650 o RTX 3050.
- Q4_K_M (5,7 GB): requiere ~7 GB de VRAM; compatible con RTX 3060 12 GB, RTX 4060 o similares.
- Q5_K_M (6,6 GB): requiere ~8 GB de VRAM; ejecutable en RTX 3080, RTX 3090 o equivalentes.
- Q8_0 (9,6 GB): requiere ~11 GB de VRAM; recomendado RTX 3090, RTX 4090 o A100 40 GB.
- f16 (18,0 GB): requiere ~20 GB de VRAM; recomendado A100 80 GB o H100.
- Despliegue: compatible con llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier motor que soporte formato GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de benchmarks publicados para comparar directamente. En cuanto a especificaciones generales, se puede comparar con otros modelos de ~8-9B en formato GGUF:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Nyx-RP-9B-OBLITERATED (GGUF) | ~9B | no disponible | no disponible | Sin censura, orientado a roleplay |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Modelo general, con alineamiento de seguridad |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | Modelo general, con alineamiento |
| Qwen 2.5 7B Instruct | 7B | 128K | Apache 2.0 | Modelo general, multilingue |

La comparacion es aproximada, ya que no se conocen las especificaciones exactas de Nyx-RP-9B. La principal diferencia es la ausencia de alineamiento de seguridad en el modelo evaluado.

## Limitaciones y advertencias

- Sin alineamiento de seguridad: al ser abliterado, el modelo puede generar contenido ofensivo, peligroso, ilegal o danino sin restricciones. No debe usarse en aplicaciones de produccion sin supervisio humana.
- Riesgo de alucinacion: como todo LLM, puede inventar hechos, nombres o citas. La ausencia de censura no mejora la veracidad de las respuestas.
- Idioma: solo soporta ingles. No se recomienda su uso en otros idiomas.
- Licencia desconocida: no se ha publicado la licencia del modelo base ni de la cuantizacion, lo que puede limitar su uso comercial o en proyectos propietarios.
- Contexto no confirmado: se desconoce la longitud de contexto maxima, que puede ser inferior a la de modelos modernos equivalentes.
- Degradacion por abliteration: la tecnica de ablacion puede reducir el rendimiento en tareas que requieren juicio etico o de seguridad, y puede provocar respuestas incoherentes en ciertos escenarios.
- Cuantizacion estatica: los ficheros GGUF son cuantizaciones estaticas sin imatrix, lo que puede resultar en una calidad inferior a las cuantizaciones ponderadas para el mismo tamano de fichero.
- Fecha de creacion: el modelo fue creado en agosto de 2026, sin informacion adicional sobre su procedencia ni trazabilidad del proceso de cuantizacion.

## Enlaces

- [HuggingFace - modelo GGUF cuantizado](https://huggingface.co/mradermacher/Nyx-RP-9B-Instruct-2608-v1-OBLITERATED-GGUF)
- [HuggingFace - modelo base](https://huggingface.co/Muyuxiao/Nyx-RP-9B-Instruct-2608-v1-OBLITERATED)
- [Heretic - herramienta de abliteration](https://github.com/p-e-w/heretic)
