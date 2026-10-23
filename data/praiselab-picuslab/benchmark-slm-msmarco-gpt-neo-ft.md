# praiselab-picuslab/benchmark-slm-msmarco-gpt-neo-ft

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-gpt-neo-ft` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `EleutherAI/gpt-neo-1.3B`, publicado por el grupo de investigación PRAISE (PRedictive AnalytIcs for underStanding big multimEdia data) del PICUS Lab, adscrito al Department of Electrical Engineering and Information Technologies (DIETI) de la Universidad de Nápoles Federico II (Italia). No se trata de un modelo fundacional nuevo, sino de un artefacto de experimentación dentro de una batería de evaluación de modelos de lenguaje pequeños (SLM) sobre el conjunto de datos `microsoft/ms_marco`; el sufijo `ft` en el nombre corresponde a la estrategia de fine-tuning empleada.

El modelo hereda la arquitectura GPT-Neo de 1.300 millones de parámetros, un transformer decoder-only autorregresivo con atención local en la mitad de sus capas, y está orientado exclusivamente al inglés. Su función práctica es servir como punto de comparación reproducible frente a otras variantes de la misma serie (por ejemplo, `benchmark-slm-msmarco-phi-1_5-clmsft`), de modo que los investigadores puedan medir cómo rinde un fine-tuning de bajo rango sobre un backbone de 2021 frente a alternativas más modernas y compactas.

Es relevante ahora por dos motivos: primero, porque ejemplifica una práctica creciente en investigación académica, la publicación de adaptadores LoRA como artefactos de benchmark en lugar de checkpoints completos, lo que abarata el almacenamiento y facilita la trazabilidad; segundo, porque permite estudiar con presupuesto mínimo el efecto del fine-tuning sobre MS MARCO en modelos de menos de 2.000 millones de parámetros, un régimen de tamaño que interesa para despliegues en CPU y dispositivos con poca VRAM. Conviene subir con la expectativa adecuada: el repositorio está restringido (gated), no declara licencia, ocupa aproximadamente 0,0 GB según la ficha de HuggingFace y no publica métricas ni documentación de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo (GPT-Neo), heredada del modelo base `EleutherAI/gpt-neo-1.3B`; el artefacto publicado es un adaptador LoRA sobre dicha arquitectura |
| Parámetros totales | 1.300 millones en el modelo base; número de parámetros del adaptador LoRA no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens según las especificaciones del modelo base GPT-Neo-1.3B; no verificado en la ficha del repositorio, que no declara contexto propio |
| Tipos de cuantización | No disponible. Los pesos publicados son adaptadores LoRA en `safetensors` sin cuantizar; no se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible. El acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace |
| Formato de pesos | `safetensors` con formato PEFT/LoRA (librería `peft`); no incluye los pesos completos del modelo base |
| Tamaño del repositorio | 0,0 GB (según la ficha de HuggingFace) |
| Dataset de ajuste | `microsoft/ms_marco` |
| Pipeline declarado | `text-generation` |
| Etiquetas relevantes | `benchmark-slm`, `strategy-ft`, `dataset-msmarco`, `or2`, `lora` |
| Fecha de creación / actualización | 2026-10-23 / 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-Neo, un transformer decoder-only autorregresivo presentado por EleutherAI en 2021. GPT-Neo combina bloques de atención global con bloques de atención local (ventana deslizante) en capas alternas, usa embeddings posicionales aprendidos y activación GELU, y se entrenó originalmente sobre The Pile. El checkpoint de 1.300 millones de parámetros constituye el backbone sobre el que se aplica el ajuste. Sobre esta base, el repositorio publica exclusivamente los pesos del adaptador en formato PEFT/LoRA, de modo que para reconstruir el modelo funcional es necesario descargar el base y cargar el adaptador encima.

En cuanto al entrenamiento del adaptador, la información disponible es mínima: la etiqueta `strategy-ft` indica fine-tuning supervisado y el tag `dataset-msmarco` identifica el corpus empleado, el conjunto de MS MARCO de Microsoft orientado a búsqueda y respuesta de preguntas sobre pasajes web. No se especifican el número de tokens de entrenamiento, la composición exacta del subconjunto utilizado, el rango y alpha del adaptador, la tasa de aprendizaje, el número de épocas, ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención linear, quantización durante el entrenamiento). No se han publicado resultados de benchmarks en la información disponible, y el propio nombre del repositorio sugiere que el modelo es una entrada de benchmark más que un modelo orientado a producción.

## Capacidades

- Generación de texto autoregresiva en inglés, condicionada al prompt, con el estilo y las limitaciones del backbone GPT-Neo-1.3B.
- Respuesta a preguntas sobre pasajes, presumiblemente adaptada al formato de MS MARCO (preguntas de búsqueda web con pasajes de contexto), aunque no se documenta el formato exacto de prompt utilizado en el ajuste.
- Generación de texto libre y continuación de documentos en inglés dentro de la ventana de contexto del modelo base.
- Soporte de tool calling / function calling: no disponible; no se declara ni se infiere del ajuste.
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo de 1.300 millones de parámetros sin entrenamiento específico no es adecuado para este fin.
- Capacidades multilingües: no; el modelo declara únicamente inglés y el backbone está entrenado predominantemente en inglés.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponible; no se declara ninguna.
- Capacidad de servir como referencia reproducible en experimentos comparativos de SLM sobre MS MARCO.

## Casos de uso

- Reproducción de experimentos académicos: cargar el adaptador sobre `EleutherAI/gpt-neo-1.3B` con `peft` y evaluar el rendimiento en el split de MS MARCO utilizado por el grupo, para replicar o contrastar los resultados de la serie `benchmark-slm-msmarco-*`.
- Comparativa controlada de estrategias de ajuste: al existir variantes con otros backbones en la misma familia (por ejemplo, `phi-1_5`), permite aislar el efecto del backbone manteniendo constante el dataset y la estrategia de fine-tuning.
- Estudio del efecto de LoRA en modelos pequeños: con 1.300 millones de parámetros y un adaptador de bajo rango, es un banco de pruebas económico para medir cuánta capacidad específica de dominio se gana frente al coste de almacenamiento de un adaptador.
- Prototipado en CPU o GPU de gama baja: al poder ejecutarse en FP32/FP16 en equipos sin aceleradores de gama alta, sirve para validar pipelines de generación condicionada por pasaje antes de escalar a modelos mayores.
- Generación de respuestas extractivas sobre pasajes web: en un entorno de investigación, puede emplearse para producir respuestas cortas a partir de un pasaje recuperado, evaluando la fidelidad frente al texto fuente.
- Docencia y formación: ejemplo práctico de fine-tuning PEFT, carga de adaptadores y evaluación sobre un corpus público de búsqueda, con requisitos de hardware modestos para un aula o un portátil.
- Aumento de datos sintéticos en inglés para tareas de búsqueda: generación de variantes de preguntas o respuestas sobre pasajes de MS MARCO, siempre con revisión humana y sin uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La ficha de HuggingFace no incluye métricas de MS MARCO (MRR@10, Recall@k, EM, F1), ni resultados de evaluaciones generales como MMLU, HumanEval o GSM8K, ni comparaciones numéricas con las otras variantes de la serie. Tampoco se documentan curvas de entrenamiento ni métricas de validación. Cualquier cifra que se atribuya a este checkpoint debe obtenerse ejecutando la evaluación de forma local.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de 1.300 millones de parámetros ocupa aproximadamente 2,6 GB en FP16 y unos 5,2 GB en FP32; a ello hay que sumar el adaptador LoRA (tamaño no disponible, típicamente decenas de MB) y la caché KV. En cuantización INT8 serían unos 1,3 GB y en INT4 unos 0,7 GB, pero el repositorio no publica pesos cuantizados, por lo que habría que convertir el modelo fusionado por cuenta propia. Estas cifras son estimaciones derivadas del número de parámetros, no datos verificados en el repositorio.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM en FP16, como RTX 3060, RTX 4060, RTX 2070 o superiores. Para batchear con comodidad, A100, H100, L40S o RTX 4090 ofrecen margen sobrado.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer con 6 GB o más, y también en Apple Silicon con memoria unificada de 8 GB o más.
- Ejecución en CPU: viable en FP32 con `transformers` para inferencia de baja concurrencia; el throughput será bajo pero suficiente para experimentación.
- Opciones de despliegue: `transformers` + `peft` (ruta natural, ya que se publica un adaptador), fusión del adaptador con el base y conversión a GGUF para `llama.cpp` u Ollama, y vLLM con soporte de adaptadores LoRA para servir el modelo base con múltiples adaptadores.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de artefacto | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-msmarco-gpt-neo-ft` | 1.300 M (base) + LoRA | 2.048 tokens (base) | Adaptador LoRA PEFT, acceso gated | No disponible | No disponibles |
| `praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-clmsft` | 1.300 M (base phi-1.5) | 2.048 tokens (base) | Adaptador/checkpoint de la misma serie | No disponible | No disponibles |
| `EleutherAI/gpt-neo-1.3B` | 1.300 M | 2.048 tokens | Pesos completos | MIT (según la ficha del modelo base) | No aplicable a esta comparativa |
| `microsoft/phi-1.5` | 1.300 M | 2.048 tokens | Pesos completos | MIT (según la ficha del modelo base) | No aplicable a esta comparativa |

La comparación relevante es con la variante `phi-1_5` de la misma serie de benchmark, que mantiene el tamaño (1.300 millones) y el dataset (MS MARCO) pero cambia el backbone por un modelo entrenado con datos sintéticos de mayor calidad. No se dispone de resultados numéricos de ninguna de las dos variantes en la información proporcionada, por lo que no es posible establecer qué backbone rinde mejor en la tarea. En cuanto a licencias, la del adaptador no está declarada, mientras que los modelos base figuran como MIT en sus respectivas fichas, lo que no resuelve por sí solo el régimen de uso del artefacto derivado.

## Limitaciones y advertencias

- No es un modelo completo: se distribuye únicamente el adaptador LoRA. Sin descargar `EleutherAI/gpt-neo-1.3B` el repositorio no es utilizable, y hay que respetar la licencia del base además de la del adaptador.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace. La automatización de descargas en CI requiere un token con permiso sobre el repo.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial. Cualquier despliegue en producción exige contactar con los autores.
- Idiomas: solo inglés. El modelo no es adecuado para castellano ni para otras lenguas sin un ajuste adicional.
- Ventana de contexto limitada: 2.048 tokens en el backbone, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación: un modelo de 1.300 millones de parámetros sin alineación documentada genera con facilidad contenido factualmente incorrecto, especialmente en preguntas que requieren conocimiento enciclopédico.
- Sesgos: el backbone se entrenó sobre The Pile, un corpus con sesgos de dominio, idioma y perspectiva documentados en la literatura; no se han publicado evaluaciones de sesgo para este adaptador.
- Ausencia de documentación de entrenamiento: sin hiperparámetros, número de tokens ni particiones utilizadas, la reproducibilidad es limitada y no se puede descartar contaminación entre entrenamiento y evaluación.
- Tamaño de repositorio declarado de 0,0 GB: conviene verificar que los ficheros del adaptador están efectivamente presentes tras aceptar el acceso, ya que el dato puede indicar un repositorio vacío o un redondeo de la ficha.
- No apto para producción: es un artefacto de benchmark, sin garantías de calidad, sin versionado semántico y sin soporte.
- Sin métricas publicadas: no hay evidencia cuantitativa de que el fine-tuning mejore al base en la tarea objetivo.
- Fecha de creación en 2026-10-23: verificar la vigencia del repositorio y si existe una versión posterior dentro de la misma serie.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-gpt-neo-ft)
- [Variante con backbone phi-1.5 de la misma serie](https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-clmsft)
- [Modelo base EleutherAI/gpt-neo-1.3B](https://huggingface.co/EleutherAI/gpt-neo-1.3B)
- [Dataset microsoft/ms_marco](https://huggingface.co/datasets/microsoft/ms_marco)
- [Organización PRAISELab-PicusLab en HuggingFace](https://huggingface.co/praiselab-picuslab)
- [Organización PRAISELab-PicusLab en GitHub](https://github.com/PRAISELab-PicusLab)
- [LLM Leaderboard & AI Model Benchmarks (octubre 2026)](https://benchlm.ai/)
