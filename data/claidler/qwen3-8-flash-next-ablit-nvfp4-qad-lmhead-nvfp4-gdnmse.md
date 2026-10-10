# claidler/Qwen3.8-Flash-Next-Ablit-NVFP4-QAD-LMHead-NVFP4-GDNMSE

## Resumen

El modelo claidler/Qwen3.8-Flash-Next-Ablit-NVFP4-QAD-LMHead-NVFP4-GDNMSE es un checkpoint de aproximadamente 92.425 millones de parametros publicado en HuggingFace por el usuario claidler, derivado del modelo base claidler/Qwen3.8-Flash-Next-Ablit-NVFP4-QAD-LMHead-NVFP4. Los pesos estan cuantizados en NVFP4 (formato de punto flotante de 4 bits de NVIDIA) y el repositorio ocupa 105,5 GB en safetensors. El nombre indica que se trata de una variante "abliterated" de la familia Qwen (el tag de metadata es qwen4_exp), es decir, con las capas de rechazo neutralizadas, orientada a despliegue en vLLM con decodificacion especulativa.

La diferencia respecto a su modelo base no esta en los pesos del modelo objetivo, que son identicos y estan enlazados mediante hardlinks, sino en el cabezal de decodificacion especulativa: los 29 tensores densos BF16 del drafter MTP (multi-token prediction) alojados en los shards 19 y 20 se han sustituido por el drafter GDN-MSE reentrenado procedente de ursuciprian/Qwen3.8-Flash-Next-NVFP4-GDN-MSE, revision 16c9bd54. No se documenta ningun reentrenamiento del modelo principal.

Su relevancia es acotada pero cuantificada: segun las mediciones del autor en 2x DGX Spark con TP=2, vLLM 0.30 y la imagen myllmbox v5.2 (10 de octubre de 2026), la tasa de aceptacion de la decodificacion especulativa pasa del 38,11 % al 39,11 % y el throughput de decodificacion mejora un 8,6 % (81,7 frente a 75,2 tok/s), con un TTFT de 117 ms frente a 121 ms. La model card no documenta licencia, idiomas, composicion del dataset ni detalles de la arquitectura del transformer subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen4_exp` apunta a una arquitectura experimental de la familia Qwen; la model card no la describe) |
| Parametros totales | 92.425.740.179 (~92,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la prueba needle de 120k pasa 3/3, lo que implica manejo correcto de al menos 120.000 tokens) |
| Tipos de cuantizacion | NVFP4 en pesos y LMHead; drafter MTP en BF16 denso; tag adicional `8-bit`; calibracion via modelopt |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 105,5 GB |
| Modelo base | claidler/Qwen3.8-Flash-Next-Ablit-NVFP4-QAD-LMHead-NVFP4 |
| Revision del drafter | ursuciprian/Qwen3.8-Flash-Next-NVFP4-GDN-MSE @ 16c9bd54 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo objetivo. Los unicos elementos tecnicos documentados son la cuantizacion NVFP4 de los pesos y del LMHead, el uso de la herramienta modelopt para dicha cuantizacion, y la presencia de un drafter MTP (multi-token prediction) destinado a decodificacion especulativa. La nomenclatura QAD del nombre del checkpoint no se desarrolla en la informacion disponible, por lo que no se puede confirmar si corresponde a destilacion consciente de cuantizacion, a entrenamiento consciente de cuantizacion u otra tecnica.

El cambio respecto al modelo base consiste en sustituir los 29 tensores densos BF16 del drafter MTP original por el drafter reentrenado GDN-MSE, cuyo acronimo tampoco se explica en la model card. Los pesos del modelo objetivo no se han modificado. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. La condicion "abliterated" del nombre sugiere la eliminacion de direcciones de rechazo en el espacio de activaciones, pero el procedimiento concreto no esta documentado.

## Capacidades

- Generacion de texto: capacidad base esperada por tratarse de un modelo de lenguaje de ~92,4 B de parametros, si bien la model card no publica evaluaciones de calidad textual.
- Procesamiento de contexto largo: la prueba needle de 120k tokens pasa 3/3, lo que respalda la recuperacion de informacion en ventanas de al menos 120.000 tokens.
- Entrada de imagen: la puerta "image smoke" se marca como PASS, lo que sugiere soporte multimodal de vision, aunque no se detalla la resolucion, el encoder ni el alcance real.
- Decodificacion especulativa con MTP: soporta el esquema de decodificacion especulativa nativo del checkpoint, con K=5 segun la model card.
- Modo sin censura: al ser una variante abliterated, el modelo responde sin los filtros de rechazo del modelo original.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking" explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue de decodificacion especulativa a gran escala: el checkpoint esta pensado para servirse en vLLM con decodificacion especulativa MTP y K=5; resulta adecuado cuando el objetivo es maximizar tok/s sobre un modelo ya cuantizado en NVFP4, aprovechando la mejora de aceptacion del drafter GDN-MSE.
- Procesamiento de documentos largos: con recuperacion verificada a 120k tokens, encaja en tareas de resumen, extraccion de clausulas o auditoria de contratos extensos, informes tecnicos y expedientes completos en una sola pasada.
- Analisis de documentacion tecnica con imagenes: la puerta de vision en PASS permite plantear pipelines que combinen texto largo y capturas o diagramas, por ejemplo revision de manuales o de planos anotados.
- Investigacion sobre cuantizacion NVFP4: el checkpoint sirve como referencia reproducible para estudiar la interaccion entre cuantizacion de 4 bits, cuantizacion del LMHead y calidad de decodificacion especulativa.
- Investigacion sobre alineacion y abliteration: al estar neutralizados los rechazos, es util para estudiar como afecta la eliminacion de direcciones de rechazo al comportamiento del modelo, siempre en entornos controlados y con supervision.
- Evaluacion de drafteres alternativos: permite comparar in situ el drafter GDN-MSE frente al MTP original manteniendo constantes los pesos objetivo, lo que aísla el efecto del drafter en la aceptacion y el throughput.
- Generacion de contenido sin filtros editoriales: util en entornos de ficcion, juegos de rol o redaccion creativa donde los filtros de seguridad estandar resultan limitantes, con la cautela legal correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas son las mediciones de servicio comparadas con el modelo base.

| Metrica | Este modelo | Base | Delta |
|---|---|---|---|
| Aceptacion de decodificacion especulativa (total) | 39,11 % | 38,11 % | +1,00 pp |
| Delta de aceptacion en posicion 0 | no disponible | no disponible | +3,4 pp |
| Delta de aceptacion en posicion 1 | no disponible | no disponible | +5,1 pp |
| Delta de aceptacion en posicion 2 | no disponible | no disponible | +3,2 pp |
| Throughput de decodificacion (mediana) | 81,7 tok/s | 75,2 tok/s | +8,6 % |
| TTFT | 117 ms | 121 ms | −4 ms |
| Puertas ab-gates (trio) | 3/3 | no disponible | no disponible |
| Prueba needle 120k | 3/3 | no disponible | no disponible |
| Smoke de imagen | PASS | no disponible | no disponible |

Condiciones de medida declaradas: 2x DGX Spark, TP=2, vLLM 0.30, imagen myllmbox v5.2, 10 de octubre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 105,5 GB en safetensors, por lo que se necesitan al menos ~105 GB de memoria para cargar los pesos completos sin fragmentar en exceso.
- Configuracion validada por el autor: 2x DGX Spark con tensor parallelism 2 (cada unidad DGX Spark dispone de memoria unificada, lo que permite repartir los 105,5 GB entre ambos nodos).
- GPU de centro de datos: viable en configuraciones multi-GPU tipo H100 80 GB x2, A100 80 GB x2 o similares, con tensor parallelism. No se han publicado mediciones en estas plataformas.
- GPU de consumo: no cabe en una RTX 4090 (24 GB), ni en una RTX 5090, ni en configuraciones de una sola GPU consumer. Se requeriria cuantizacion adicional no documentada.
- Opciones de despliegue: vLLM 0.30 con los mismos flags del checkpoint base, es decir, decodificacion especulativa MTP con K=5. No hay soporte confirmado para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput medidos: 81,7 tok/s de mediana y 117 ms de TTFT en la configuracion 2x DGX Spark TP=2.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Throughput (tok/s) | Aceptacion spec-decode | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| claidler/Qwen3.8-Flash-Next-Ablit-NVFP4-QAD-LMHead-NVFP4-GDNMSE | 92,4 B | NVFP4 + LMHead NVFP4, drafter GDN-MSE | 81,7 | 39,11 % | no disponible | HuggingFace, 0 descargas |
| claidler/Qwen3.8-Flash-Next-Ablit-NVFP4-QAD-LMHead-NVFP4 (base) | 92,4 B | NVFP4 + LMHead NVFP4, drafter MTP BF16 | 75,2 | 38,11 % | no disponible | HuggingFace |
| ursuciprian/Qwen3.8-Flash-Next-NVFP4-GDN-MSE | no disponible | NVFP4, drafter GDN-MSE | no disponible | no disponible | no disponible | HuggingFace, revision 16c9bd54 |

No se dispone de datos de otros modelos comparables de la misma categoria (tamano o tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin licencia explicita no se puede asumir permiso de uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Modelo abliterated: los filtros de rechazo han sido neutralizados, por lo que puede generar contenido danino, ilegal o sensible sin las salvaguardas habituales. Requiere moderacion externa obligatoria en cualquier aplicacion expuesta a usuarios.
- Sin datos de idiomas: se desconoce el soporte real de castellano y de otras lenguas distintas del ingles, asi como su calidad relativa.
- Sin evaluaciones de sesgo ni de seguridad: no hay analisis publicados sobre sesgos demograficos, toxicidad o tasas de alucinacion.
- Riesgo de alucinacion inherente a los modelos de ~92 B sin verificacion factual documentada, agravado por la ausencia de benchmarks de fidelidad.
- Contexto: aunque la prueba needle de 120k pasa, no se declara la ventana oficial, por lo que no se garantiza el comportamiento mas alla de esa longitud ni en tareas de razonamiento de largo alcance.
- 0 descargas y 0 likes: el checkpoint no tiene validacion independiente por parte de la comunidad; las cifras de rendimiento proceden unicamente del autor.
- Dependencia de vLLM 0.30 e imagen concreta: el soporte NVFP4 y de decodificacion especulativa esta ligado a versiones especificas del stack, lo que complica la reproducibilidad a medio plazo.
- Huella de hardware elevada: 105,5 GB de pesos exigen multi-GPU o nodos con memoria unificada, lo que limita el publico objetivo.
- Fecha de publicacion futura (2026) en los metadatos del repositorio: conviene verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/claidler/Qwen3.8-Flash-Next-Ablit-NVFP4-QAD-LMHead-NVFP4-GDNMSE
- Modelo base: https://huggingface.co/claidler/Qwen3.8-Flash-Next-Ablit-NVFP4-QAD-LMHead-NVFP4
- Origen del drafter GDN-MSE: https://huggingface.co/ursuciprian/Qwen3.8-Flash-Next-NVFP4-GDN-MSE
- vLLM (stack de despliegue recomendado): https://github.com/vllm-project/vllm
- NVIDIA TensorRT Model Optimizer (modelopt, herramienta de cuantizacion citada): https://github.com/NVIDIA/TensorRT-Model-Optimizer
