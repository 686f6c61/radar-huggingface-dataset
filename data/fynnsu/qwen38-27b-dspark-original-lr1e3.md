# fynnsu/qwen38-27b-dspark-original-lr1e3

## Resumen

`fynnsu/qwen38-27b-dspark-original-lr1e3` es un checkpoint publicado en HuggingFace por el usuario `fynnsu`, con 1.909.788.417 parámetros reales (aproximadamente 1,91 mil millones) según los metadatos de los ficheros safetensors, y un tamaño de repositorio de 3,8 GB. El nombre del repositorio sugiere un experimento de ajuste o entrenamiento sobre una base de la familia Qwen con una tasa de aprendizaje de 1e-3 ("lr1e3"), pero no hay información publicada que confirme la arquitectura exacta, los datos de entrenamiento ni la procedencia de los pesos.

Se trata de un modelo con nomenclatura confusa: el identificador menciona "27b" mientras que el recuento real de parámetros es de 1,91B. Esta discrepancia es relevante para cualquier evaluación, porque impide asumir que se trate de un modelo de 27.000 millones de parámetros. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere `trust_remote_code=True` y revisión previa del código empaquetado.

La relevancia de esta ficha es limitada pero clara: el modelo acumula 9 descargas y 0 "likes" desde su creación el 19 de septiembre de 2026, no declara licencia ni idiomas, y las búsquedas web realizadas no devuelven ningún resultado relacionado con el proyecto (los resultados obtenidos tratan sobre la zona horaria CST y no guardan relación con el modelo). Por tanto, muchos campos de esta ficha quedan marcados explícitamente como "no disponible".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `custom_code` indica implementación personalizada no documentada; el nombre sugiere base Qwen, sin confirmar) |
| Parametros totales | 1.909.788.417 (≈1,91B), dato real de safetensors |
| Parametros activos | no aplica / no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; el tamaño de 3,8 GB para 1,91B parámetros equivale a ≈2 bytes por parámetro, consistente con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code` asociado) |
| Descargas | 9 |
| Likes | 0 |
| Fecha de creación | 2026-09-19 |
| Última actualización | 2026-09-19 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la información disponible. El tag `custom_code` en HuggingFace indica que el repositorio incluye módulos de Python propios que se ejecutan al cargar el modelo, lo que habitualmente corresponde a variantes de atención, capas de normalización o cabezales de clasificación no presentes en las librerías estándar de Transformers. No hay confirmación de si se trata de un transformer denso estándar, de una variante con atención lineal, de un modelo híbrido o de otra topología.

Tampoco hay datos sobre el proceso de entrenamiento: no se especifica el número de tokens, la composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. El sufijo `original-lr1e3` y el prefijo `dspark` apuntan a un experimento de entrenamiento con una tasa de aprendizaje de 1e-3 (un valor alto para ajuste fino de modelos de lenguaje, habitualmente en el rango 1e-5 a 1e-4), pero es una inferencia a partir del nombre del repositorio, no un dato confirmado.

Un detalle técnico verificable: el cociente entre el tamaño del repositorio (3,8 GB) y el número de parámetros (1,91B) es de aproximadamente 2 bytes por parámetro, lo que es coherente con pesos almacenados en bf16 o fp16 sin cuantización posterior. Esto implica que no hay versiones GGUF, AWQ o GPTQ publicadas por el autor.

## Capacidades

- No hay información publicada sobre las capacidades del modelo en la documentación disponible.
- No se confirma soporte de generación de código, matemáticas, razonamiento multi-paso ni modos de "pensamiento" extendido.
- No se confirma soporte de tool calling ni function calling.
- No se confirma comportamiento agéntico ni integración con frameworks de agentes.
- No se confirma cobertura multilingüe ni idioma principal de entrenamiento.
- No se confirma soporte multimodal (visión, audio) ni ninguna capacidad especial adicional.
- Lo único deducible es que, con ~1,91B parámetros, el modelo es de escala pequeña y su capacidad esperable es la de un modelo de ese orden de magnitud, no la de un modelo de 27B como sugiere el nombre.

## Casos de uso

Dado que no hay documentación funcional, los casos siguientes son escenarios plausibles para un modelo denso de ~1,91B, no aplicaciones verificadas con este checkpoint concreto:

- Evaluación experimental en investigación: cargar el modelo con `trust_remote_code=True` en un entorno aislado para auditar el código personalizado y determinar qué arquitectura implementa realmente, antes de considerar cualquier uso posterior.
- Reproducción de experimentos de tasa de aprendizaje: el sufijo `lr1e3` sugiere que el checkpoint forma parte de un barrido de hiperparámetros; serviría como punto de comparación frente a otros checkpoints con tasas de aprendizaje distintas, siempre que el autor publique el resto de la serie.
- Prototipado local en GPU de gama media: con ~1,91B parámetros en bf16, el modelo ocupa alrededor de 3,8 GB en memoria, lo que permite probarlo en una GPU consumer de 8-12 GB sin cuantización adicional.
- Generación de texto de baja latencia en el borde: por tamaño, es candidato a despliegue en entornos con restricciones de memoria, aunque sin benchmarks no puede validarse la calidad de las respuestas.
- Punto de partida para ajuste fino propio: al ser un modelo pequeño, un ajuste con LoRA sobre un corpus específico de dominio es viable en una única GPU, asumiendo que la licencia lo permita (no declarada).
- Verificación de artefactos sospechosos: dado el nulo historial del repositorio y la discrepancia entre nombre y parámetros, un caso de uso legítimo es el análisis de seguridad previo a cualquier integración en producción.
- No se recomienda su uso en atención al cliente, generación de código en producción ni pipelines críticos, porque no hay evidencia de calidad, licencia ni mantenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación en la ficha del repositorio ni en los resultados de búsqueda, que no contienen ninguna referencia al modelo.

Cualquier cifra de rendimiento que se atribuya a este checkpoint sin una evaluación propia debe considerarse no verificada.

## Requisitos de hardware

Estimaciones basadas únicamente en el recuento real de parámetros (1,91B); no son datos publicados por el autor:

- Inferencia en bf16/fp16: aproximadamente 3,8 GB solo de pesos, más caché KV y activaciones. En la práctica, entre 5 y 7 GB de VRAM para contextos moderados.
- Inferencia en int8: aproximadamente 2 GB de pesos, con un total estimado de 3-4 GB de VRAM.
- Inferencia en int4: aproximadamente 1,2 GB de pesos, con un total estimado de 2-3 GB de VRAM (requiere convertir los pesos, ya que no se publican versiones cuantizadas).
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso tarjetas de 8 GB si se cuantiza a int4.
- GPU de centro de datos: A100, H100 o L40S son adecuadas, aunque sobredimensionadas para este tamaño; el modelo no requiere paralelismo de tensor.
- Despliegue: al incluir `custom_code`, es probable que la carga exija `transformers` con `trust_remote_code=True`. vLLM, TGI, llama.cpp y Ollama solo funcionarán si el código personalizado es compatible con esas pilas; no hay conversiones GGUF publicadas ni confirmación de compatibilidad.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

La comparativa se establece con modelos pequeños de propósito general de escala comparable. Las cifras de los competidores proceden de su documentación pública y deben verificarse en la fuente original; las del modelo analizado son las únicas confirmadas por metadatos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fynnsu/qwen38-27b-dspark-original-lr1e3 | 1,91B (real) | no disponible | no disponible | safetensors con `custom_code` |
| Qwen2.5-1.5B | ≈1,54B | 32.768 tokens | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ |
| Llama-3.2-1B | ≈1,24B | 128.000 tokens | Licencia comunitaria Llama 3.2 | safetensors, GGUF |
| SmolLM2-1.7B | ≈1,71B | 8.192 tokens | Apache-2.0 | safetensors, GGUF |

Diferencias clave: los tres modelos de referencia publican licencia explícita, idiomas soportados, resultados de benchmarks y conversiones cuantizadas, mientras que este checkpoint no ofrece ninguno de esos elementos. En términos de soporte de producción, la comparación es desfavorable en todos los ejes documentables.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial queda en una situación jurídica indeterminada. No debe integrarse en productos sin aclarar este punto con el autor.
- Discrepancia entre nombre y tamaño: el identificador menciona "27b" pero el modelo tiene 1,91B parámetros. Cualquier expectativa de capacidad basada en el nombre es incorrecta.
- Código personalizado: el tag `custom_code` obliga a ejecutar código del autor al cargar el modelo. Esto es un vector de riesgo de seguridad y requiere auditoría previa en un entorno sin acceso a red ni credenciales.
- Ausencia total de documentación: no hay model card, ni descripción de datos de entrenamiento, ni evaluación de sesgos, ni análisis de alucinación.
- Riesgo de alucinación: no evaluado. En modelos pequeños sin ajuste por preferencias humanas documentado, la tasa de invención de hechos suele ser elevada.
- Idiomas y contexto desconocidos: imposible planificar presupuestos de tokens o cobertura lingüística sin datos del autor.
- Historial del repositorio mínimo: 9 descargas, 0 likes, creado y actualizado con ocho minutos de diferencia, lo que sugiere una publicación de prueba más que un artefacto mantenido.
- Sin benchmarks: no hay forma de comparar su calidad con alternativas establecidas antes de invertir tiempo en evaluarlo.
- Sin cuantizaciones oficiales: cualquier uso en hardware limitado exige convertir los pesos, con el riesgo de que el código personalizado no sea compatible con las herramientas estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fynnsu/qwen38-27b-dspark-original-lr1e3
- No se han encontrado papers, blogs, repositorios ni demos asociados al modelo en la búsqueda web realizada.
- Los resultados de búsqueda obtenidos no guardan relación con el modelo: tratan sobre la zona horaria Central Standard Time (https://www.timeanddate.com/time/zones/cst, https://time.is/CST, https://en.m.wikipedia.org/wiki/Central_Time_Zone) y no aportan información técnica.
