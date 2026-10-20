# bambocher/Qwen3.5-2B-oQ2e-mtp

## Resumen

bambocher/Qwen3.5-2B-oQ2e-mtp es un checkpoint cuantizado del modelo Qwen3.5-2B, publicado por el usuario bambocher en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a formato MLX mediante la herramienta oQ (oMLX v0.7.1rc1), que aplica cuantización de precisión mixta con el objetivo de reducir el espacio en disco y la memoria necesaria para inferencia en hardware Apple Silicon. El checkpoint completo ocupa 1,345 GiB y contiene 2.274.069.824 parámetros lógicos.

La particularidad de esta conversión es la distribución heterogénea de bits: el 66,168% de los pesos (1.505B) se almacena en affine 2-bit con grupo de 64, mientras que el 14,967% (0.340B) se mantiene en BF16 para preservar sensibilidad. El resultado es un promedio efectivo de 5,082 bits por peso, muy por debajo de los 16 bits de un checkpoint BF16 equivalente. El repositorio incluye además el codificador visual (0.331B) y una cabeza MTP (multi-token prediction) de 0.061B.

Es relevante ahora porque permite ejecutar un modelo de 2,27B con capacidades multimodales y decodificación especulativa en equipos con memoria unificada modesta, algo que un checkpoint BF16 (unos 4,5 GB solo en pesos) dificulta en portátiles. Ahora bien, se trata de una publicación de comunidad con 6 descargas, sin model card del modelo base ni datos de evaluación, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el checkpoint es un transformer con torre de visión y cabeza MTP; la arquitectura del modelo base Qwen3.5-2B no se detalla en la información proporcionada) |
| Parametros totales | 2.274.069.824 (2,274B): 1,882B en el modelo de lenguaje, 0,331B en visión y 0,061B en la cabeza MTP |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 2-bit (66,168%), affine 4-bit (2,306%), affine 5-bit (14,747%), affine 6-bit (1,801%), affine 8-bit (0,012%) y BF16 (14,967%); grupo de 64 en todas las capas affine; promedio efectivo 5,082 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (library_name: mlx) |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento del modelo base Qwen3.5-2B: ni el número de tokens, ni la composición del dataset, ni si hubo fases de RLHF, DPO o RL con verificadores. La model card del checkpoint cuantizado no incluye estos datos y la búsqueda web no ha devuelto fuentes utilizables. Lo único deducible del desglose de almacenamiento es que el modelo base es multimodal: incluye un módulo de visión de 0,331B parámetros, y una cabeza MTP de 0,061B, lo que sugiere soporte de decodificación multi-token (especulativa nativa) además de entrada de imágenes.

La innovación técnica de este repositorio es exclusivamente la cuantización. oQ asigna precisión por módulo en lugar de aplicar un único esquema global: mantiene en BF16 el 14,967% de los pesos (0,634 GiB, presumiblemente capas de normalización, embeddings, cabezas y proyecciones sensibles), mientras comprime dos tercios del modelo a 2 bits. El compromiso es claro: se obtiene un checkpoint de 1,445 GB a costa de una pérdida de fidelidad numérica concentrada en las capas de menor rango. No se han publicado mediciones de perplejidad ni de degradación respecto al BF16 original.

## Capacidades

- Generación de texto y razonamiento en el modelo de lenguaje (1,882B parámetros lógicos).
- Procesamiento de imágenes: el checkpoint incluye un codificador visual de 0,331B parámetros almacenado íntegramente en BF16.
- Decodificación multi-token mediante la cabeza MTP de 0,061B, orientada a acelerar la generación especulativa.
- Capacidades de código, matemáticas y tool calling: no disponibles en la información proporcionada; no se pueden confirmar ni descartar.
- Soporte multilingüe: no disponible.
- Modo thinking o razonamiento extendido: no disponible.
- Soporte de audio: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint ocupa 1,345 GiB y se carga con la librería MLX, lo que permite ejecutar un modelo multimodal de 2,27B en equipos de 8 GB de RAM unificada. Adecuado para prototipado offline sin GPU dedicada.
- Pruebas de cuantización agresiva: útil como banco de pruebas para medir la degradación real de un esquema de 2 bits con grupo de 64 frente al BF16 del mismo modelo base, comparando perplejidad y calidad de generación en tareas controladas.
- Experimentación con decodificación especulativa: la presencia de la cabeza MTP permite investigar el speedup de la generación multi-token en MLX sin necesidad de un modelo borrador separado.
- Procesamiento de documentos con imagen en local: al incluir torre de visión, puede emplearse para tareas de descripción de imágenes o extracción de información visual en entornos sin conectividad, siempre que se acepte la pérdida de precisión de la cuantización.
- Enseñanza y demostraciones de quantización LLM: el desglose por componente y la distribución de bits de la model card lo convierten en un ejemplo didáctico de cuantización de precisión mixta aplicada a un modelo multimodal.
- Evaluación comparativa de pipelines MLX frente a GGUF/llama.cpp: sirve para contrastar rendimiento y consumo de memoria en Apple Silicon con ambos ecosistemas sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la distribución de bits y el tamaño resultante del checkpoint, sin métricas de calidad (perplejidad, MMLU, HumanEval, GSM8K ni evaluaciones multimodales).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el checkpoint pesa 1,345 GiB; con overhead de runtime, caché KV y buffers de activación, se puede estimar un consumo de entre 2 y 3 GB en contextos cortos (estimación propia, no verificada por el autor).
- El contexto largo incrementa la memoria de la caché KV de forma proporcional; no se dispone de la longitud de contexto del modelo base, por lo que no se puede acotar el pico de memoria.
- GPU recomendadas: al ser un checkpoint MLX, el destino natural son chips Apple Silicon (series M1/M2/M3/M4 y sus variantes Pro/Max/Ultra). No es un formato utilizable directamente en CUDA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: cualquier equipo con 8 GB de memoria unificada o más debería poder cargarlo. En GPUs NVIDIA consumer (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) el tamaño sería holgado, pero requeriría reconvertir los pesos a otro formato, ya que MLX no las soporta de forma nativa.
- Opciones de despliegue: MLX (mlx-lm / mlx-vlm según se use la torre de visión) y las utilidades de oMLX (https://github.com/jundot/omlx). No hay evidencias de que exista versión GGUF de esta conversión concreta, por lo que llama.cpp u Ollama no serían aplicables sin una conversión adicional.
- Latencia y throughput: no disponibles. No se han publicado mediciones, y la cuantización a 2 bits en MLX puede reducir el ancho de banda de memoria pero también degradar la calidad, sin que se conozca la tasa de aceptación de la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-oQ2e-mtp | 2,274B | no disponible | Mixta 2-8 bits + BF16 (5,082 bits/peso) | no disponible | HuggingFace, 6 descargas |
| Qwen3.5-2B en BF16 (modelo base) | 2,274B | no disponible | BF16 (16 bits/peso), ~4,5 GB estimados | no disponible | Referenciado por este checkpoint, sin enlace en la información disponible |
| Otras conversiones MLX 4-bit del mismo modelo base | 2,274B | no disponible | 4 bits uniformes, ~1,2 GB estimados | no disponible | no disponible en la información proporcionada |

La comparación se limita al tamaño y al esquema de cuantización: no hay datos públicos de rendimiento de este checkpoint ni de sus alternativas en la información disponible, por lo que no es posible establecer una comparativa de calidad.

## Limitaciones y advertencias

- Cuantización a 2 bits en dos tercios de los pesos: es un régimen agresivo con pérdida de calidad esperable, especialmente en razonamiento aritmético, código y tareas de instrucciones largas. No hay mediciones publicadas que cuantifiquen esa degradación.
- Licencia no especificada: usar el checkpoint con fines comerciales es arriesgado, ya que se desconoce tanto la licencia de esta conversión como la del modelo base Qwen3.5-2B.
- Publicación de comunidad con 6 descargas y 0 likes: no hay revisión, validación ni mantenimiento por parte del autor original del modelo.
- Idiomas soportados no documentados: no se puede asumir calidad en castellano ni en ningún otro idioma sin evaluación propia.
- Longitud de contexto desconocida: impide planificar despliegues que dependan de ventanas largas.
- Riesgo de alucinación: inherente a los modelos de 2B, y previsiblemente amplificado por la cuantización de 2 bits; requiere verificación de salidas en cualquier uso productivo.
- Dependencia de Apple Silicon: al ser formato MLX, no es portable a CUDA ni a CPU convencional sin reconversión; el ecosistema MLX tiene menor madurez de herramientas de servicio y batching que vLLM o TGI.
- Torre de visión íntegra en BF16: consume 0,617 GiB del total y no se beneficia de la compresión, lo que limita el ahorro si el caso de uso es solo texto.
- Sesgos: no documentados; no hay información sobre la composición del dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.5-2B-oQ2e-mtp
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Model card del modelo base Qwen3.5-2B: no disponible en la información proporcionada
- Paper o documentación técnica del modelo base: no disponible
- Demos o espacios de prueba: no disponible
