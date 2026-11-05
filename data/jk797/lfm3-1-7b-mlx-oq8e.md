# jk797/LFM3-1.7B-MLX-oQ8e

## Resumen

LFM3-1.7B-MLX-oQ8e es una cuantización del modelo LFM3 de 1.700 millones de parámetros (1.728.801.536 pesos reales según los safetensors) publicada por el usuario jk797 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint LFM3 original al formato MLX con cuantización de precisión mixta generada mediante la herramienta oQ (oMLX v0.7.4.dev1). El resultado es un checkpoint de 1,837 GB (1,711 GiB) con un promedio efectivo de 8,502 bits por peso.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de ~1,7B parámetros en hardware Apple Silicon mediante el framework MLX, con un peso en disco inferior a 2 GB. Por otro lado, sirve como ejemplo práctico de cuantización mixta: casi la totalidad de los tensores (99,978% de los pesos lógicos) se almacenan en affine 8-bit con grupo de 64, mientras que una fracción mínima (0,022%) se conserva en BF16, presumiblemente capas sensibles a la precisión.

La información publicada por el autor es muy limitada: la model card solo documenta el proceso de cuantización y la distribución de bits, sin detallar arquitectura, datos de entrenamiento, idiomas, licencia ni resultados de evaluación. Esta ficha refleja esa escasez y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; detalles no publicados en la información disponible) |
| Parámetros totales | 1.728.801.536 (1,729B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Affine 8-bit con grupo de 64 (99,978% de los pesos); BF16 (0,022%); promedio efectivo 8,502 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX; requiere `custom_code`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3 en la documentación proporcionada. El checkpoint es una conversión cuantizada, no un entrenamiento nuevo: el autor no documenta número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se especifica si la arquitectura es un transformer denso, un modelo MoE o una variante híbrida.

La innovación técnica documentada se limita al esquema de cuantización. oQ (oMLX) aplica cuantización de precisión mixta: asigna affine 8-bit con tamaño de grupo 64 a la práctica totalidad de los tensores y reserva BF16 para un 0,022% de los pesos lógicos (0,001 GiB de almacenamiento). El desglose de almacenamiento indica que el modelo de lenguaje ocupa 1.837 GB / 1.711 GiB, sin componentes adicionales (visión, audio u otros) listados. El tag `custom_code` sugiere que la carga requiere código específico más allá de la implementación estándar de MLX.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de lenguaje de 1,7B parámetros, aunque no se documentan tareas concretas ni evaluaciones.
- Razonamiento y matemáticas: no disponible; no hay benchmarks ni descripciones que lo confirmen.
- Generación de código: no disponible; no se documenta soporte específico.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el desglose de almacenamiento solo incluye el componente de lenguaje.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y pesa 1,837 GB, por lo que puede cargarse en Macs con memoria unificada moderada (16 GB o más) para prototipado y pruebas de generación de texto en local.
- Evaluación de técnicas de cuantización: sirve como caso de estudio reproducible de cuantización mixta con oQ, comparando la calidad del checkpoint 8-bit frente al modelo LFM3 original en BF16.
- Experimentación académica con modelos pequeños: un modelo de 1,7B en 8-bit es adecuado para laboratorios con recursos limitados que necesiten iterar sobre prompts, decodificación y evaluación sin depender de GPUs de datacenter.
- Desarrollo de pipelines de inferencia MLX: útil para validar integraciones con la librería `mlx` y el ecosistema de Apple (MLX LM, herramientas de conversión) antes de escalar a modelos mayores.
- Pruebas de regresión de cuantización: permite medir la degradación de perplejidad o calidad de generación introducida por el esquema affine 8-bit/grupo 64 frente al checkpoint de referencia.
- Despliegue en entornos con almacenamiento restringido: con menos de 2 GB de pesos, encaja en imágenes de contenedor o dispositivos con espacio limitado, siempre que el runtime MLX esté disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,8-2,2 GB solo para los pesos en 8-bit; añadir overhead de activaciones y KV cache según la longitud de contexto (no documentada).
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (series M1, M2, M3, M4); no es un checkpoint pensado para CUDA.
- Compatibilidad con GPU de consumo: sí, en Macs con memoria unificada de 8 GB o superior; en GPUs NVIDIA no es directamente utilizable sin conversión a otro formato.
- Opciones de despliegue: MLX (librería `mlx`), MLX LM para generación; el tag `custom_code` implica que puede requerir código específico del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-oQ8e (este) | 1,729B | no disponible | safetensors MLX 8-bit | no disponible | HuggingFace (jk797) |
| LFM3-1.7B (base, BF16) | ~1,7B | no disponible | safetensors | no disponible | Referenciado como origen; no verificado en la información |
| Alternativas de ~1-2B en MLX | no disponible | no disponible | MLX | variable | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Información insuficiente: la model card no documenta arquitectura, datos de entrenamiento, idiomas ni licencia, lo que impide evaluar su idoneidad para producción.
- Licencia desconocida: al no constar la licencia, no se puede confirmar el uso comercial; debe verificarse en el repositorio del modelo base LFM3 antes de cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; sin evaluaciones publicadas no es posible cuantificarlo.
- Sesgos: no documentados; no hay información sobre composición del dataset ni procesos de alineamiento.
- Degradación por cuantización: el esquema 8-bit con grupo 64 puede introducir pérdida de calidad frente al BF16 original, especialmente en tareas sensibles a la precisión numérica; no se han publicado métricas comparativas.
- Dependencia de MLX: el checkpoint no es portable directamente a runtimes CUDA; requiere Apple Silicon o conversión adicional.
- Código personalizado: el tag `custom_code` indica que la carga puede fallar con implementaciones estándar de MLX si no se usa el código del repositorio.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin garantías de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/jk797/LFM3-1.7B-MLX-oQ8e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM3: no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
