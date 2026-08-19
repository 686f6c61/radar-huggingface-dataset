# mlasli/Qwen3.8-27B-Heretic-Uncensored-Q5_K_M-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF Q5_K_M del modelo `Qwen3.8-27B-Heretic-Uncensored-BF16`, una versión re-abliterada del modelo oficial `Qwen/Qwen3.8-27B` (27 320 millones de parámetros) publicada por el usuario mlasli. La abliteración, implementada mediante la herramienta Heretic, elimina parcialmente la alineación de seguridad (censura) del modelo original mediante ablación direccional, manteniendo a la vez las capacidades generales de generación de texto, razonamiento y código heredadas de Qwen3.8-27B.

El modelo está pensado para casos de uso como roleplay sin restricciones, escritura creativa libre o investigación sobre alineación y seguridad. Esta versión GGUF está optimizada para su ejecución local con llama.cpp u Ollama, e incluye la cabeza de predicción multi-token (MTP) fijada a Q8_0 para mantener la decodificación especulativa. La cuantización se ha calibrado con imatrix sobre un corpus wikitext-103 de 20 MB. Es importante señalar que, al eliminar la alineación de seguridad, el modelo puede generar contenido que el modelo base rechazaría, por lo que su uso debe ser responsable y conforme a la legislación local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.8-27B, detalles especificos no disponibles) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No disponible (probablemente modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M (este repo contiene Q5_K_M) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo BF16 original) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, un transformer autoregresivo de 27 000 millones de parametros. Sobre este modelo se ha aplicado una re-abliteracion desde cero utilizando la herramienta Heretic, que combina ablacion direccional (abliteration, segun Arditi et al. 2024) con un optimizador de parametros basado en TPE (Tree-structured Parzen Estimator) mediante Optuna. El objetivo era reducir la tasa de rechazos (refusals) del modelo ante peticiones sensibles, situandola en un rango de 5-15 %. El resultado medido es un 14,0 % de rechazos, con un contador Heretic del 12,0 %, una divergencia KL multi-token de 0,0071 y una tasa de sobre-rechazo benigno del 1,0 %.

La cuantizacion GGUF se ha realizado con imatrix (matriz de importancia) calibrada sobre un corpus wikitext-103 de 20 MB. Una caracteristica destacada es que la cabeza de prediccion multi-token (MTP, bloque `blk.64`) se conserva y se fija a Q8_0 en todas las cuantizaciones, de modo que la decodificacion especulativa (speculative decoding) sigue siendo precisa. No se dispone de informacion detallada sobre el dataset de entrenamiento original de Qwen3.8-27B ni sobre posibles fases de RLHF/DPO adicionales.

## Capacidades

- Generacion de texto sin filtros de censura en ingles, con una tasa de rechazo reducida al 14 % (frente a valores mucho mas altos en el modelo base).
- Razonamiento, generacion de codigo y matematicas heredadas del modelo base Qwen3.8-27B (no se han verificado mediante benchmarks en esta version).
- Roleplay y escritura creativa sin restricciones tematicas, gracias a la abliteracion.
- Decodificacion especulativa mediante MTP (multi-token prediction) retenida en la cuantizacion, lo que acelera la inferencia en hardware compatible.
- Capacidades multilingues no confirmadas: la documentacion solo indica ingles, aunque el modelo base podria soportar otros idiomas.
- No se especifica soporte de tool calling ni function calling en la documentacion disponible.
- No se ha validado la capacidad de vision (el modelo base podria incluirla, pero la tarjeta indica "text-only validated").

## Casos de uso

- Roleplay sin restricciones: el modelo puede mantener conversaciones de personaje largas y coherentes sin rechazar peticiones tematicas, gracias a su baja tasa de rechazo y su capacidad de generacion fluida en ingles.
- Escritura creativa libre: autores y guionistas pueden explorar tramas, dialogos o escenas que otros modelos censurarian, manteniendo la calidad linguistica del modelo base.
- Investigacion sobre alineacion y seguridad: permite estudiar el comportamiento de modelos abliterados, comparar tasas de rechazo y analizar los efectos de la ablacion direccional en las capacidades del modelo.
- Generacion de contenido para ficcion adulta: el modelo puede producir narrativa explicita sin las restricciones habituales, util para estudios de genero o proyectos editoriales especificos.
- Asistente local sin filtros: desplegado con llama.cpp u Ollama, ofrece un asistente conversacional que no impone limites de contenido, adecuado para entornos controlados donde el usuario asume la responsabilidad.
- Experimentacion con decodificacion especulativa: al conservar MTP, sirve como banco de pruebas para evaluar el rendimiento de la inferencia acelerada en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de rechazo tras la abliteracion:

| Metrica | Valor |
|---|---|
| Tasa de rechazos (refusals) | 14,0 % (objetivo 5-15 %) |
| Contador Heretic | 12,0 % |
| Divergencia KL multi-token | 0,0071 |
| Sobre-rechazo benigno | 1,0 % |

Estas cifras indican que el modelo mantiene un equilibrio entre la eliminacion de censura y la preservacion de comportamientos seguros en peticiones benignas. No se dispone de datos de rendimiento en tareas de razonamiento o codigo para esta cuantizacion especifica.

## Requisitos de hardware

- La cuantizacion Q5_K_M ocupa aproximadamente 19 GB en disco; para inferencia se recomienda al menos 20-22 GB de VRAM para carga completa en GPU.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB. En GPUs con 16 GB (p. ej. RTX 4080) podria caber con cuantizaciones mas bajas (Q4_K_M de 16 GB o IQ4_XS de 15 GB).
- No cabe en GPUs de consumo de gama baja (8-12 GB) con esta cuantizacion; para esas, se recomienda IQ2_M (9,8 GB) aunque con mayor perdida de calidad.
- Despliegue compatible con llama.cpp (arquitectura `qwen35`, MTP habilitado) y Ollama (mediante `ollama create` a partir del GGUF).
- Latencia y throughput estimados no disponibles; dependen del hardware y del tamaño de contexto utilizado.
- Opciones de despliegue adicionales: servidores compatibles con GGUF como llama.cpp server, o conversion a otros formatos si es necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | No disponible | Apache-2.0 | Safetensors | Con alineacion de seguridad estandar |
| Qwen3.8-27B-Heretic-Uncensored (este) | 27,3 B | No disponible | Apache-2.0 | GGUF | Abliterado, refusals 14 % |
| Qwen3.8-27B-Heretic-Abliterated (0bserverx) | 27,3 B | No disponible | Apache-2.0 | GGUF | Abliterado, sin metricas publicadas |

No se dispone de datos de rendimiento comparativo entre estas versiones. La principal diferencia entre el modelo base y las versiones abliteradas es la tasa de rechazo, mientras que entre las distintas cuantizaciones GGUF la diferencia radica en el tamaño y la fidelidad. No se han encontrado otros modelos uncensored de tamano similar con metricas comparables en la informacion disponible.

## Limitaciones y advertencias

- La abliteracion elimina la alineacion de seguridad: el modelo puede generar contenido ofensivo, ilegal o peligroso. El autor advierte explicitamente del uso responsable y conforme a la legislacion local.
- Solo se ha validado el uso en ingles; otros idiomas pueden presentar degradaciones o comportamientos impredecibles.
- No se ha verificado la capacidad de vision, aunque el modelo base podria incluirla.
- La cuantizacion Q5_K_M introduce perdida de precision respecto al modelo BF16 original; tareas que requieran alta fidelidad (p. ej. matematicas complejas) pueden verse afectadas.
- La tasa de rechazo del 14 % implica que aun existe cierta censura residual; no es un modelo completamente "sin filtros".
- No se dispone de informacion sobre el contexto maximo soportado; se recomienda probar con longitudes moderadas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicacion reciente sin validacion de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda evaluar los riesgos legales y eticos antes de desplegar el modelo en produccion.

## Enlaces

- Repositorio de este modelo (Q5_K_M): https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-Q5_K_M-GGUF
- Modelo BF16 original: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-BF16
- Otras cuantizaciones: Q8_0, Q6_K, Q4_K_M, IQ4_XS, IQ2_M (enlaces en la model card)
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Repositorio alternativo de cuantizaciones abliteradas: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Guia de modelos uncensored locales: https://insiderllm.com/guides/best-uncensored-local-llms/
