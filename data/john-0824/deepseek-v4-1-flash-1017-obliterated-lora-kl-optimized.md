# john-0824/DeepSeek-V4.1-Flash-1017-Obliterated-LoRA-KL-Optimized

## Resumen

DeepSeek-V4.1-Flash-1017-Obliterated-LoRA-KL-Optimized es un adaptador LoRA de rango 8 publicado por el usuario john-0824 sobre el modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017. Su proposito no es mejorar las capacidades del modelo, sino aplicar una tecnica de "abliteration" (eliminacion de rechazos) optimizada para minimizar la divergencia KL respecto al modelo original. El adaptador modifica unicamente las 14 capas superiores (18-31) del transformer con una fuerza de proyeccion parcial (alpha=0.6), lo que reduce la divergencia KL un 60% frente a la cirugia completa, a cambio de conservar un cierto porcentaje de rechazos residuales.

El modelo base pertenece a la familia DeepSeek V4.1 Flash, de la que no se dispone de especificaciones tecnicas en la informacion proporcionada. El adaptador ocupa 0,6 GB en el repositorio y se distribuye como un unico fichero safetensors con pares B/A de rango 8 para las 14 capas modificadas, acompanado de un manifiesto JSON con la formula de fusion.

La relevancia de esta publicacion es metodologica: documenta de forma cuantitativa el compromiso entre supresion de rechazos y degradacion de la distribucion original del modelo, con datos de KL, tasa de rechazo y MMLU para dos configuraciones. Es un artefacto de investigacion sobre tecnicas de modificacion de comportamiento en modelos abiertos, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer DeepSeek-V4.1-Flash-1017; arquitectura del base no disponible |
| Parametros totales | No disponible (adaptador: 615 MB en safetensors, rango 8, 14 capas) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se aplica en bf16 segun la formula de fusion) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) + JSON de manifiesto |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 8 que contiene pares de matrices B/A para 14 capas del transformer base (capas 18 a 31). No se trata de un modelo entrenado de forma convencional: las matrices se derivan de una "cirugia" de direcciones de rechazo obtenidas mediante una sonda (probe) sobre la superficie de escritura de sglang, usando 4.096 + 4.096 prompts de WildGuardMix. La formula de excision aplicada es `P = I - 0.6 * D'D` con preservacion de la norma de Frobenius, donde D representa las direcciones de rechazo identificadas. Solo se modifican las capas con mayor precision de sonda (0,95 o superior).

La fusion se realiza en bf16 sobre las claves originales del modelo base mediante `W_pristine += B @ A`. La variante "KL-optimized" se distingue de la cirugia completa (alpha=1.0 sobre las 38 capas 2-39) en que limita la intervencion a 14 capas y reduce la fuerza a alpha=0.6, lo que baja la divergencia KL de 2,082 a 0,545 a costa de elevar la tasa de rechazo del 0,19% al 10,22%. No se documenta entrenamiento con RLHF, DPO ni datos de preentrenamiento adicionales.

## Capacidades

- Hereda las capacidades del modelo base DeepSeek-V4.1-Flash-1017, que no estan documentadas en la informacion disponible.
- Eliminacion parcial de rechazos: reduce la tasa de rechazo del modelo base a un 10,22% medido sobre 4.096 prompts, frente al 0,19% de la variante de cirugia completa.
- Preservacion de capacidades: mantiene un MMLU del 82,11%, solo 0,70 puntos por debajo de la cirugia completa (82,81%).
- Menor desviacion distribucional: divergencia KL de 0,545 frente a 2,082 de la variante completa.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Investigacion sobre abliteration: permite comparar el compromiso KL/rechazo entre dos configuraciones de cirugia sobre el mismo modelo base, con metricas reproducibles (KL, tasa de rechazo, MMLU).
- Evaluacion de robustez de salvaguardas: util para estudiar hasta que punto las capas 18-31 concentran el comportamiento de rechazo y como afecta una intervencion parcial a la distribucion del modelo.
- Experimentos controlados de alineacion: sirve como condicion experimental en estudios que midan el efecto de modificaciones de bajo rango sobre la calidad del modelo, dado que el MMLU se mantiene practicamente intacto.
- Analisis de direcciones de rechazo: el manifiesto JSON con estadisticas de captura y mapa de claves permite reproducir y auditar el proceso de sonda sobre WildGuardMix.
- Desarrollo de tecnicas de fusion segura: la formula `W_pristine += B @ A` en bf16 y la preservacion de norma de Frobenius son un caso de referencia para implementar fusiones de adaptadores con control de deriva.
- Docencia y formacion tecnica: ejemplo documentado de LoRA de rango 8, cirugia por capas y metricas de compromiso para cursos de interpretabilidad y seguridad de modelos.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Configuracion | Alpha | Capas | KL | Tasa de rechazo (4.096 prompts) | MMLU |
|---|---|---|---|---|---|
| Cirugia completa | 1.0 | 38 (2-39) | 2,082 | 0,19% | 82,81% |
| Esta variante (KL-optimized) | 0.6 | 14 (18-31) | 0,545 | 10,22% | 82,11% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks para el modelo base en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 615 MB y se aplica sobre el modelo base, por lo que los requisitos de VRAM vienen determinados por DeepSeek-V4.1-Flash-1017, cuyas dimensiones no estan disponibles.
- La fusion debe realizarse en bf16 segun la formula documentada, lo que exige memoria suficiente para cargar el modelo base completo en bf16 durante el proceso de merge.
- GPU recomendadas: no disponible, al desconocerse el tamano del modelo base.
- No se puede confirmar si cabe en GPU de consumo (RTX 4090 u otras) sin las especificaciones del base.
- Opciones de despliegue: la sonda documentada usa sglang; no se detallan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Capas modificadas | Alpha | KL | Rechazo | MMLU | Licencia |
|---|---|---|---|---|---|---|---|
| Este adaptador (KL-optimized) | LoRA rango 8 | 14 (18-31) | 0.6 | 0,545 | 10,22% | 82,11% | MIT |
| DeepSeek-V4.1-Flash-1017-Obliterated-LoRA | LoRA (cirugia completa) | 38 (2-39) | 1.0 | 2,082 | 0,19% | 82,81% | MIT |
| DeepSeek-V4.1-Flash-1017-Obliterated | Modelo fusionado | 38 (2-39) | 1.0 | 2,082 | 0,19% | 82,81% | MIT |
| DeepSeek-V4.1-Flash-1017 (base) | Modelo original | 0 | n/a | 0 | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores de abliteration comparables para este modelo base.

## Limitaciones y advertencias

- Conserva un 10,22% de rechazos residuales, por lo que no elimina por completo el comportamiento de negativa del modelo base.
- La eliminacion de rechazos puede aumentar la probabilidad de generar contenido danino, sesgado o inseguro; no se documentan evaluaciones de seguridad posteriores a la cirugia.
- La sonda se construyo con WildGuardMix, un conjunto concreto de prompts; el comportamiento fuera de esa distribucion no esta caracterizado.
- La modificacion se limita a las capas 18-31; el efecto sobre capacidades distintas del rechazo (codigo, matematicas, multilingue) no se ha medido mas alla de MMLU.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Idiomas soportados: no documentados; se desconoce si la cirugia afecta de forma desigual a distintas lenguas.
- La licencia MIT del adaptador no exime de las condiciones de uso del modelo base, cuyos terminos no se detallan en la informacion proporcionada.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (26 de noviembre de 2026): no hay evidencia de validacion por parte de la comunidad.
- El pipeline no esta declarado en Hugging Face, lo que complica el uso automatizado del artefacto.
- No es un modelo autonomo: requiere descargar y fusionar el modelo base, con el coste de almacenamiento y computo asociado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/john-0824/DeepSeek-V4.1-Flash-1017-Obliterated-LoRA-KL-Optimized
- Modelo fusionado de referencia: https://huggingface.co/john-0824/DeepSeek-V4.1-Flash-1017-Obliterated
- Adaptador LoRA de cirugia completa: https://huggingface.co/john-0824/DeepSeek-V4.1-Flash-1017-Obliterated-LoRA
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales.
