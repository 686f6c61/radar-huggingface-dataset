# esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-BUDGET-GGUF

## Resumen

Este repositorio contiene dos ficheros GGUF compactos derivados de DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, un ajuste "uncensored" de 709-L sobre una base Qwen3.8 de 27B densa e híbrida. El autor, esatapedico, publica las variantes BUDGET y STARVED, que comparten un backbone NVFP4 nativo de 448 tensores (byte a byte idéntico al de la familia con cabeza MTP) pero con el bloque MTP eliminado y los tensores de cabeza fijados a los tipos más pequeños posibles.

El objetivo declarado es que usuarios con una única tarjeta Blackwell de 16 GB puedan servir el ajuste con cuantización NVFP4 nativa (tipo GGML 40) sin la ruta de decodificación especulativa. Los dos ficheros ocupan 14,72 GB (BUDGET) y 14,59 GB (STARVED) en unidades decimales, con 26.895.998.720 parámetros totales en el modelo base y 262.144 tokens de contexto nativo.

La relevancia es doble: por un lado, es un ejemplo de conversión a NVFP4 con kernel CUDA para sm_120 preservando tensores nativos sin recalibración; por otro, ilustra el compromiso entre huella de memoria y calidad al degradar únicamente la cabeza de salida y el embedding de tokens. El modelo conserva la torre de visión original, que se activa acoplando un proyector mmproj aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet + Gated Attention, 64 capas |
| Parametros totales | 26.895.998.720 (~26,9 B) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Backbone NVFP4 nativo (GGML tipo 40, W4A16); lm_head Q3_K (BUDGET) o Q2_K (STARVED); token_embd Q2_K; 657 tensores F32 (normas, escalas y gates) |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), ficheros BUDGET y STARVED |
| Tamano del repositorio | 29,3 GB |
| Tamano por fichero | BUDGET: 14,72 GB decimales; STARVED: 14,59 GB decimales |
| Numero de tensores por fichero | 1.107 (448 de backbone NVFP4 + 657 F32 + 2 de cabeza) |
| Cabeza MTP | Eliminada (15 tensores retirados); `nextn_predict_layers=0`, `block_count=64` |
| Vision | Si, mediante proyector externo `mmproj-BF16.gguf` |
| Modelo base | DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La base es un modelo denso híbrido de 27B que combina Gated DeltaNet (atención lineal) con Gated Attention clásica, repartido en 64 capas, e incorpora una torre de visión nativa que el ajuste 709-L no modifica. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información no está disponible en el material proporcionado.

La innovación relevante está en el proceso de cuantización, descrito paso a paso por el autor: primero autotraza el modelo BF16 a compressed tensors NVFP4 con esquema W4A16 sobre todos los targets lineales, dejando visión, atención lineal, lm_head y MTP en BF16 y sin calibración; después convierte el checkpoint NVFP4 a GGUF; a continuación construye cada fichero sobre el backbone NVFP4 compartido de 448 tensores, variando solo la precisión de lm_head y del embedding de tokens; y finalmente elimina los 15 tensores del bloque MTP. Los tensores NVFP4 son tipo GGML nativo 40, preservados desde el checkpoint original sin ida y vuelta de recuantización. El autor verifica la identidad byte a byte del backbone por tensor mediante SHA-256, y parchea únicamente los pares clave-valor del GGUF (nombre, descripción, licencia) sin tocar los datos tensoriales.

## Capacidades

- Generación de texto conversacional y continuaciones largas, con ventana nativa de 262.144 tokens.
- Razonamiento y modo "thinking" con presets oficiales de muestreo de Qwen3.8: `temp 1.0`, `top_p 0.95`, `top_k 20`.
- Capacidades multimodales de visión heredadas del ajuste base, siempre que se cargue un proyector `mmproj-BF16.gguf` mediante `--mmproj`.
- Soporte multilingüe declarado en los metadatos (`en`, `multilingual`), sin detalle de cobertura por idioma.
- Conversión sin filtros de seguridad ("uncensored", "heretic" en la denominación del ajuste base), orientada a generar contenido que los modelos alineados rechazarían.
- Al no incluir cabeza MTP, no dispone de decodificación especulativa interna; cualquier aceleración de ese tipo debe venir de un draft model externo.
- No se documentan en la información disponible capacidades de tool calling, function calling ni razonamiento agéntico multi-paso, ni tamaños de entrenamiento específicos para código o matemáticas.

## Casos de uso

- Inferencia local en una sola GPU Blackwell de 16 GB: el fichero BUDGET (14,72 GB) está diseñado para cargarse íntegro en una tarjeta de esa clase, permitiendo servir un modelo de ~27B sin despliegue multi-GPU.
- Procesado de documentos largos: la ventana de 262.144 tokens permite ingerir contratos, expedientes o informes completos en una sola pasada sin troceado ni recuperación externa.
- Análisis de imágenes con texto asociado: cargando el proyector `mmproj-BF16.gguf`, el modelo puede describir o extraer información de capturas, diagramas o documentos escaneados junto a instrucciones textuales.
- Laboratorios de red teaming y evaluación de seguridad: al ser un ajuste sin alineación, sirve para estudiar comportamiento de modelos desinhibidos, tasas de rechazo y modos de fallo en entornos controlados.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o material editorial donde los filtros de seguridad de modelos alineados bloquean el contenido solicitado.
- Prototipado de pipelines llama.cpp con NVFP4: el repositorio sirve como banco de pruebas para validar kernels CUDA de tipo GGML 40 en sm_120 y medir el coste real del backbone NVFP4 frente a alternativas Q4/Q5.
- Despliegue de bajo coste en hardware de consumo Blackwell: si el presupuesto de VRAM es el factor limitante, la variante STARVED (14,59 GB) es el punto más bajo de la familia para ejecutar este ajuste en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el proceso de conversión, el reparto de tensores y los presets de muestreo, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones numéricas entre las variantes BUDGET, STARVED y los niveles con MTP.

## Requisitos de hardware

- VRAM estimada para inferencia: BUDGET ocupa 14,72 GB decimales (~13,7 GiB) y STARVED 14,59 GB (~13,6 GiB) solo en pesos. Con el proyector de visión (aproximadamente 1 GB, según la propia model card) la huella sube hasta unos 14,7 GiB, dejando un margen muy estrecho sobre una tarjeta de 16 GB para caché KV con contexto largo.
- El autor señala explícitamente que cargar el modelo sin `--mmproj` libera ese gigabyte y es una palanca adicional para encajar contextos mayores en modo solo texto.
- GPU compatibles: se requieren kernels CUDA para NVFP4 (GGML tipo 40) y soporte `sm_120`, es decir, arquitectura Blackwell. Quedan fuera por diseño las generaciones anteriores (RTX 3090/4090, A100, H100), que no son sm_120.
- Tarjetas objetivo: GPU de consumo Blackwell con 16 GB de VRAM en configuración de una sola tarjeta, según el objetivo declarado por el autor.
- Opciones de despliegue: llama.cpp en una build reciente con soporte NVFP4; el autor indica que los ficheros cargan sin la ruta `draft-mtp`. No se confirma compatibilidad con vLLM, Ollama, TGI ni otros servidores en la información proporcionada.
- Decodificación especulativa: no disponible en estos ficheros, ya que la cabeza MTP fue eliminada explícitamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Cabeza MTP | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este repositorio (BUDGET / STARVED) | ~26,9 B | 262.144 | GGUF, NVFP4 nativo con cabezas Q3_K/Q2_K | No | apache-2.0 | 14,72 / 14,59 GB; pensado para 16 GB Blackwell |
| esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF | ~26,9 B | 262.144 | GGUF, NVFP4 nativo con MTP | Si | no disponible en la informacion | Mismo backbone byte a byte; incluye proyector `mmproj-BF16.gguf` |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | ~26,9 B | 262.144 | BF16 | Si | no disponible en la informacion | Modelo base del ajuste, sin cuantizar |
| unsloth/Qwen3.8-27B-GGUF | no disponible | no disponible | GGUF | no disponible | no disponible | Citado como fuente alternativa del proyector de visión |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, formato y empaquetado.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: la cabeza de salida y el embedding de tokens se degradan a Q3_K y Q2_K (BUDGET) o a Q2_K en ambos (STARVED). El propio autor reconoce "accuracy trade-offs" frente a los niveles con MTP, sin cuantificarlos.
- Sin decodificación especulativa: la eliminación de los 15 tensores MTP implica renunciar a la aceleración que ofrece la familia completa.
- Compatibilidad de hardware muy restringida: requiere kernels NVFP4 y `sm_120`. No es ejecutable en GPU anteriores a Blackwell ni, presumiblemente, en CPU, dado que la ruta está pensada para CUDA.
- Modelo sin alineación de seguridad: el ajuste base se etiqueta como "uncensored" y "heretic". Puede generar contenido dañino, ilegal o no apto para producción sin filtros previos; requiere moderación externa en cualquier despliegue con usuarios finales.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual ni de tasas de alucinación. Con 262.144 tokens de contexto, el riesgo de degradación del recuerdo en posiciones intermedias no está medido en esta ficha.
- Idiomas: los metadatos declaran `en` y `multilingual`, sin lista de idiomas ni evaluación por lengua. El rendimiento en castellano no está documentado.
- Licencia: el repositorio declara apache-2.0, pero el modelo base y el ajuste intermedio no llevan licencia detallada en la información disponible; conviene verificar la cadena completa de licencias antes de un uso comercial.
- Repositorio sin tracción verificable: 0 descargas y 0 "likes" en el momento de la consulta, y sin benchmarks publicados, lo que impide validar de forma independiente las afirmaciones de calidad.
- Nomenclatura potencialmente confusa: las etiquetas hacen referencia a "Qwen3.8" y "Qwen3.5", versiones no verificables en la información disponible.
- Vision: activar el proyector consume aproximadamente 1 GB adicional de VRAM, lo que puede impedir encajar el contexto nativo completo en una tarjeta de 16 GB.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-BUDGET-GGUF
- Repositorio hermano con MTP y proyector de visión: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Proyector alternativo citado: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Página de soporte del autor: https://ko-fi.com/esatapedico
- No se han encontrado enlaces adicionales relevantes en la búsqueda web: los resultados devueltos corresponden a IRIS Software Group (documentación de instalación de IRIS Accountancy Suite) y no guardan relación con el modelo.
