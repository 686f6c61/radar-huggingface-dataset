# Addaoud/DeepPlant-ZM-EAP

## Resumen

DeepPlant-ZM-EAP es un modelo de aprendizaje profundo publicado en Hugging Face por el usuario Addaoud bajo el identificador `Addaoud/DeepPlant-ZM-EAP`. Por sus etiquetas (`bioinformatics`, `plant-genomics`, `regulatory-genomics`) y su pipeline declarado como `other`, se trata de un modelo especializado en genómica regulatoria de plantas, no de un modelo de lenguaje generativo. El nombre sugiere un uso sobre *Zea mays* (maíz) y elementos reguladores, aunque la model card no aporta documentación que lo confirme.

El repositorio contiene 236.879.362 parámetros en formato safetensors (aproximadamente 0,9 GB), lo que sitúa al modelo en el rango de los ~237 millones de parámetros, un tamaño habitual en arquitecturas de tipo transformer pequeño o CNN profunda aplicadas a secuencias genómicas. Se distribuye con licencia MIT y se ha subido mediante la integración `PyTorchModelHubMixin` de `huggingface_hub`, lo que implica que el artefacto principal es un módulo PyTorch serializado y no un modelo compatible con `transformers` de forma nativa.

La relevancia actual del modelo es limitada y fundamentalmente experimental: cuenta con 21 descargas, ningún "like", no dispone de paper asociado ni de documentación técnica, y la model card es una plantilla autogenerada sin información sustantiva sobre datos de entrenamiento, arquitectura o evaluación. Cualquier evaluación seria de su utilidad requiere inspeccionar el código y los pesos directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas de genómica regulatoria de plantas; no se documenta la arquitectura) |
| Parametros totales | 236.879.362 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (modelo no lingüístico; entrada esperada: secuencias genómicas) |
| Licencia | MIT |
| Formato de pesos | safetensors (carga mediante `PyTorchModelHubMixin`) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo. Las etiquetas del repositorio (`bioinformatics`, `plant-genomics`, `regulatory-genomics`) apuntan a un modelo de secuencias entrenado sobre genoma vegetal, probablemente para tareas de predicción de elementos reguladores, pero la model card no especifica si se trata de un transformer, una CNN, una arquitectura híbrida o un modelo basado en estados. Tampoco se documenta el tokenizador ni la longitud máxima de secuencia de entrada.

Respecto al entrenamiento, la model card no indica número de tokens, composición del corpus, especie o especies de origen, ni si hubo ajuste fino supervisado o aprendizaje por refuerzo. El campo "Paper" de la model card contiene literalmente `[More Information Needed]`, y el campo "Code" apunta a una URL de marcador de posición (`https://huggingface.co/your-username/deepplant`) que no resuelve a un repositorio real. No se puede verificar ninguna innovación técnica ni reproducir el proceso de entrenamiento con la información disponible.

## Capacidades

- Predicción sobre secuencias genómicas de plantas, según las etiquetas `plant-genomics` y `regulatory-genomics`; la tarea exacta (clasificación de elementos reguladores, predicción de accesibilidad, anotación funcional) no está documentada.
- Integración con el ecosistema `huggingface_hub` mediante `PyTorchModelHubMixin`, lo que permite `from_pretrained` y `save_pretrained` sobre el objeto PyTorch subyacente.
- No hay evidencia de soporte de tool calling, function calling ni comportamiento agéntico.
- No hay evidencia de capacidades multilingües, generación de texto, razonamiento, código ni matemáticas.
- No se documentan modos especiales (thinking mode, visión, audio) ni API de inferencia estandarizada.

## Casos de uso

- Anotación de elementos reguladores en genoma de maíz: si el modelo predice regiones reguladoras a partir de secuencia, podría usarse como prior para priorizar candidatos en estudios de asociación o de expresión diferencial; requiere validar primero la tarea real inspeccionando el código del repositorio.
- Filtrado de variantes en paneles de genómica vegetal: usar las puntuaciones del modelo como señal auxiliar para descartar variantes en regiones no reguladoras antes de validación experimental.
- Generación de features para modelos agronómicos: extraer embeddings de secuencias reguladoras y alimentar con ellos modelos posteriores de predicción de rasgos (rendimiento, tolerancia a estrés), siempre que el modelo exponga una interfaz de representación latente.
- Investigación comparativa entre especies: emplear el modelo como baseline en estudios que comparen genomas de gramíneas, dado su bajo coste computacional (~237 M de parámetros).
- Reproducción y auditoría metodológica: al ser un artefacto pequeño con licencia MIT, sirve para reproducir pipelines de genómica regulatoria en entornos con recursos limitados.
- Docencia y prototipado en bioinformática: cargar el modelo con `PyTorchModelHubMixin` en cuadernos para ilustrar flujos de trabajo de modelos de secuencia en plantas.
- En todos los casos, la ausencia de documentación obliga a una fase previa de ingeniería inversa del código y de validación empírica antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,95 GB solo para pesos (236,9 M de parámetros × 4 bytes), más activaciones y memoria del framework; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en fp16/bf16: aproximadamente 0,47 GB para pesos; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); para lotes grandes o secuencias largas, A100 o H100 no son necesarias pero aceleran el throughput.
- Cabe en GPU consumer: sí, en todas las GPU modernas de NVIDIA, AMD e Intel con soporte PyTorch; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `PyTorchModelHubMixin`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen de la arquitectura real y de la longitud de secuencia, que no se documentan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepPlant-ZM-EAP | 236,9 M | no disponible | Genómica regulatoria de plantas (no documentada) | MIT | Hugging Face, 21 descargas |
| Nucleotide Transformer (InstaDeep) | 50 M – 2,5 B (varias variantes) | hasta 12 kb de secuencia en variantes largas | Genómica generalista multispecie | CC-BY-NC-SA 4.0 en varias variantes | Hugging Face, ampliamente documentado |
| DNABERT-2 | ~117 M | ~10 kb efectivos | Genómica generalista | MIT | Hugging Face, paper publicado |
| PlantCaduceus | ~30 M – 100 M (variantes) | ~1 kb | Genómica de plantas | no verificada en esta ficha | Hugging Face |

La comparación es orientativa: los tres modelos alternativos cuentan con paper y evaluación publicada, mientras que DeepPlant-ZM-EAP carece de ambos. La licencia MIT es más permisiva que la de Nucleotide Transformer en sus variantes no comerciales, lo que puede ser un factor decisivo para uso industrial.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay paper, ni descripción de arquitectura, ni detalles de entrenamiento, lo que impide evaluar validez científica y reproducibilidad.
- La URL de código de la model card es un marcador de posición (`your-username/deepplant`) y no resuelve; no se puede inspeccionar la implementación sin descargar los pesos.
- No se han publicado métricas de evaluación; se desconoce su rendimiento real frente a baselines triviales o modelos especializados.
- Riesgo de alucinación no aplicable en sentido lingüístico, pero sí de predicciones espurias en regiones genómicas fuera de la distribución de entrenamiento, cuya composición se desconoce.
- Sesgos potenciales derivados de la especie o especies de entrenamiento (el sufijo "ZM" sugiere maíz): la transferencia a otras plantas no está validada.
- El pipeline declarado es `other`, por lo que no se integra con los pipelines estándar de `transformers`; la carga requiere el código del autor.
- Aunque la licencia MIT permite uso comercial, la falta de garantías y de validación hace desaconsejable su uso en producción sin una evaluación independiente.
- El repositorio tiene 21 descargas y 0 "likes", sin señales de adopción ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Addaoud/DeepPlant-ZM-EAP
- Documentación de `PyTorchModelHubMixin`: https://huggingface.co/docs/huggingface_hub/package_reference/mixins#huggingface_hub.PyTorchModelHubMixin
- Paper: no disponible
- Código: no disponible (la URL de la model card es un marcador de posición)
- Demo: no disponible
