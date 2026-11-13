# minjaechoi/qwen3p6-35b-a3b-2p10bit-r129

## Resumen

Qwen3.6-35B-A3B (r129) es un checkpoint de investigación publicado por el usuario minjaechoi en Hugging Face. Se trata de una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B, en la que únicamente los expertos enrutados del componente MoE se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanecen en BF16. El resultado se guarda de forma desquantizada en tensores BF16, de modo que carga con `transformers` y vLLM estándar sin necesidad de kernels de cuantización especializados.

El modelo hereda la arquitectura MoE del Qwen3.6-35B-A3B original: 35 mil millones de parámetros totales con aproximadamente 3 mil millones activos por token, lo que lo sitúa en la categoría de modelos eficientes en inferencia pese a su tamaño nominal. La propuesta del checkpoint es reducir el peso en disco y en memoria de los expertos manteniendo la compatibilidad con el ecosistema de inferencia habitual, a costa de una pérdida de precisión que no se documenta en la model card.

Es relevante ahora porque ejemplifica una tendencia creciente: cuantizaciones extremas (por debajo de 3 bits) aplicadas solo a las partes del modelo que toleran mejor el ruido, publicadas como checkpoints de investigación sin evaluación pública. No obstante, la información disponible es mínima: no hay datos de benchmarks, licencia explícita, idiomas soportados ni métricas de degradación respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Qwen/Qwen3.6-35B-A3B |
| Parametros totales | 35B (heredados del modelo base) |
| Parametros activos | ~3B por token (heredados del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, que no se especifica) |
| Formato de pesos | safetensors en BF16 (compatible con `transformers` y vLLM) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3.6-35B-A3B, un modelo de arquitectura transformer con mezcla de expertos: 35B parámetros totales y unos 3B activos por token. La modificación introducida por el autor consiste en cuantizar exclusivamente los pesos de los expertos enrutados a una media de 2,10 bits, dejando el resto de componentes (atención, embeddings, capas densas, router) en BF16. Los pesos se almacenan ya desquantizados en tensores BF16, por lo que la inferencia no requiere kernels de cuantización de bajo bit y funciona con `transformers` y vLLM sin parches.

No se dispone de información sobre el proceso de cuantización (algoritmo, calibración, tamaño del dataset de calibración), sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) ni sobre innovaciones técnicas adicionales. La model card se limita a indicar que es un checkpoint de investigación interno con identificador r129.

## Capacidades

- Generación de texto: capacidad heredada del modelo base Qwen3.6-35B-A3B, sujeta a la degradación introducida por la cuantización de los expertos.
- Razonamiento y matemáticas: presumiblemente presentes en el modelo base, sin evaluación publicada en este checkpoint.
- Generación de código: presumiblemente presente en el modelo base, sin evaluación publicada.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: el checkpoint permite estudiar cómo afecta una precisión media de 2,10 bits en los expertos enrutados a la calidad de salida, comparando directamente contra el modelo base BF16 en tareas controladas.
- Despliegue en entornos con memoria limitada: al reducir el tamaño de los expertos, el checkpoint puede caber en configuraciones de GPU donde el modelo base completo no entra, manteniendo la compatibilidad con vLLM y `transformers`.
- Experimentación académica con modelos de 35B: útil para laboratorios que quieran reproducir resultados con un modelo grande sin disponer de clústeres de alta memoria.
- Pruebas de pipelines de inferencia: sirve para validar integraciones con vLLM o `transformers` antes de pasar al modelo base completo, gracias a que los pesos cargan sin kernels especiales.
- Evaluación de robustez frente a ruido de cuantización: permite medir la degradación en tareas de generación libre, resumen o QA respecto al BF16.
- Prototipado interno de asistentes conversacionales: adecuado solo en fases de exploración, dado que no hay garantías de calidad ni licencia clara para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Al almacenarse los pesos en BF16, el checkpoint ocupa un espacio en memoria similar al de un modelo de 35B en BF16 (del orden de 70 GB), aunque el contenido de los expertos tenga menor precisión efectiva. No se documenta si existe una versión con pesos comprimidos.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 35B en BF16 requiere GPUs de 80 GB (A100, H100) o múltiples GPUs menores.
- Cabe en consumer GPU: no disponible; con 35B en BF16 no es esperable que quepa en una sola GPU de consumo sin cuantización adicional en tiempo de carga.
- Opciones de despliegue: `transformers` y vLLM, según indica la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| minjaechoi/qwen3p6-35b-a3b-2p10bit-r129 | 35B | ~3B | no disponible | no disponible | BF16 (desquantizado) | Expertos a 2,10 bits de media |
| Qwen/Qwen3.6-35B-A3B | 35B | ~3B | no disponible | no disponible | BF16 | Modelo base sin cuantizar |
| Otras cuantizaciones del mismo base | 35B | ~3B | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

## Limitaciones y advertencias

- La cuantización a 2,10 bits de media en los expertos enrutados puede degradar la calidad de forma significativa; no se publican métricas de degradación respecto al modelo base.
- No hay benchmarks, evaluaciones ni comparaciones con el modelo original, por lo que la calidad real es desconocida.
- La licencia no está especificada en la información disponible; la model card remite a la del modelo base, que tampoco se detalla. No se debe asumir uso comercial permitido.
- Es un checkpoint de investigación interna (r129), sin garantías de mantenimiento, soporte ni estabilidad.
- No se documentan idiomas soportados, sesgos conocidos ni riesgos de alucinación específicos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Aunque los pesos se almacenan en BF16, el contenido de los expertos procede de una cuantización agresiva; el tamaño en disco y en memoria no se reduce respecto a un BF16 completo salvo que se recomprima.
- No apto para producción sin una evaluación previa exhaustiva y una verificación legal de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p10bit-r129
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
