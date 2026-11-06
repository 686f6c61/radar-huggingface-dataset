# jarrodwatts/Qwen3.8-27B-Astra-Stop

## Resumen

Qwen3.8-27B-Astra-Stop es una edición de pesos (weight edit) sobre el modelo Qwen/Qwen3.8-27B, publicada por el usuario jarrodwatts en Hugging Face. No se trata de un fine-tuning ni de un nuevo entrenamiento: es una modificación quirúrgica de una única matriz de pesos que altera el comportamiento de razonamiento del modelo base. El objetivo declarado es reducir aproximadamente un 40% los tokens de pensamiento en generación abierta, manteniendo la precisión en tareas de matemáticas y código.

La edición afecta a la matriz de salida de la MLP de la última capa (`model.language_model.layers.63.mlp.down_proj.weight`), que contiene 89,1 millones de pesos, es decir, un 0,32% del total del modelo. La modificación consiste en sumar una dirección de rango uno calculada a partir del propio modelo, con una intensidad concreta, de modo que la señal interna de "he terminado de pensar" (el token `</think>`) tenga el doble de peso en la decisión final de la última capa. El resto de lo que escribe esa capa permanece inalterado.

El interés de esta ficha es doble: por un lado, documenta un artefacto experimental de edición de pesos en espacio de pesos (weight-space programming) que puede aplicarse en segundos en CPU; por otro, sirve como ejemplo de técnica emergente para controlar el coste de razonamiento de modelos grandes sin reentrenar. El modelo base Qwen3.8-27B no está documentado en la información proporcionada, por lo que muchos datos de arquitectura y entrenamiento se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3.8-27B; la edición afecta a la MLP de la última capa) |
| Parametros totales | No disponible (la matriz editada contiene 89,1M de pesos, un 0,32% del modelo, lo que implica un modelo base de aproximadamente 27,8B de parámetros) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el artefacto se distribuye en safetensors; el modelo base podría soportar cuantizaciones estándar, pero no se documenta) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (igual que el modelo base) |
| Formato de pesos | safetensors (18 shards; el editado es `model-00017-of-00018.safetensors`), más `u.npy` (float32, 5.120 valores) y `edit.json` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, del que no se proporcionan detalles de arquitectura en la información disponible (tipo de transformer, número de capas, atención, etc.). Lo que sí se documenta con precisión es la intervención realizada: se modifica una única matriz, la proyección de salida de la MLP de la capa 63 (`layers.63.mlp.down_proj.weight`), mediante la fórmula `W' = W + u (uᵀ W)`, donde `u` es un vector de 5.120 números. La dirección `u` tiene un coseno de 0,995 con la fila del output head correspondiente al token `</think>`, es decir, es prácticamente la propia señal de "fin de pensamiento" del modelo.

La edición no implica entrenamiento ni fine-tuning: es una reprogramación en espacio de pesos inspirada en el artículo "Sparks of Weight-Space Programming". El autor indica que la dirección y la intensidad fueron encontradas por GPT-6 Astra (ejecutándose en Codex) mediante experimentos sobre los pesos del modelo. Los valores de la matriz editada cambian un 1,4% de media. El script `apply.py` realiza los cálculos en float64 para garantizar reproducibilidad; el modelo usado en los tests se construyó en float32, y respecto a esa referencia, 1.812 de los 89,1M de pesos (0,002%) difieren en el mínimo paso de redondeo bf16.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito (thinking tokens), heredado del modelo base Qwen3.8-27B.
- Reducción del coste de razonamiento en generación abierta: en el test del pelícano en bicicleta, la media de tokens de pensamiento baja de 28.474 a 17.201 (−40%) y la mediana de 27.346 a 17.156 (−37%).
- Mayor proporción de respuestas "rápidas": de 0/16 intentos por debajo de 5.000 tokens de pensamiento en el modelo original a 5/16 en el editado.
- Mantenimiento de la precisión en matemáticas y código: 95,2% de acierto tanto en el original como en el editado sobre un conjunto de 694 problemas (MATH-500, AIME 2025, HumanEval).
- Generación de SVG completo sin bucles de repetición: 16/16 en ambos modelos.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo específicas para esta edición; se heredarían, en su caso, del modelo base, pero no están descritas en la información disponible.

## Casos de uso

- Reducción de coste en inferencia de razonamiento abierto: para aplicaciones que generan texto largo o creativo (por ejemplo, descripciones, código de visualización o explicaciones), la edición recorta un 40% los tokens de pensamiento en el escenario medido, lo que se traduce directamente en menos tiempo de GPU y menos coste por petición.
- Generación de gráficos y SVG en pipelines automáticos: el test del pelícano muestra que el modelo sigue produciendo SVG completos sin bucles de repetición, por lo que puede usarse en herramientas que generan diagramas o ilustraciones a partir de descripciones.
- Evaluación de técnicas de edición de pesos: el artefacto es un caso de estudio reproducible (script `apply.py`, hash sha256 del archivo editado) para investigadores que quieran medir el efecto de intervenciones de rango uno en modelos grandes.
- Control del "presupuesto de pensamiento" en producción: al duplicar la señal de fin de razonamiento en la última capa, el modelo tiende a cerrar antes sus cadenas de pensamiento en tareas abiertas, lo que puede usarse para acotar latencia en servicios interactivos.
- Tareas de matemáticas y código con precisión estable: dado que la precisión se mantiene en el 95,2% en el conjunto evaluado, la edición es apta para pipelines de resolución de problemas y generación de código donde no se quiere degradar el acierto.
- Experimentación educativa sobre mecanismos internos: la dirección `u` y su alta correlación con el token `</think>` permiten estudiar cómo el modelo decide terminar de razonar, útil en docencia e investigación sobre interpretabilidad.
- Despliegue rápido sin GPU para aplicar la edición: el script se ejecuta en CPU en segundos, lo que facilita crear variantes del modelo en entornos sin acelerador.

## Benchmarks y rendimiento

Los únicos datos publicados son los del autor, con esfuerzo de razonamiento `xhigh`, comparando el modelo original con el editado:

| Test | Original | Editado |
|---|---|---|
| Pelícano en bicicleta, 16 intentos: media de tokens de pensamiento | 28.474 | 17.201 (−40%) |
| Pelícano: mediana de tokens de pensamiento | 27.346 | 17.156 (−37%) |
| Pelícano: intentos con menos de 5.000 tokens de pensamiento | 0/16 | 5/16 |
| Pelícano: SVG completo | 16/16 | 16/16, sin bucles de repetición |
| Matemáticas y código no vistos (MATH-500, AIME 2025, HumanEval; 694 problemas): media de tokens de pensamiento | 4.011 | 3.886 (−3%) |
| Matemáticas y código no vistos: precisión | 95,2% | 95,2% |

El propio autor advierte de que la muestra de 16 pelícanos por lado es pequeña y que la gran ganancia se da en generación abierta, mientras que en matemáticas y código el ahorro de pensamiento es marginal (−3%) sin pérdida de precisión. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de la cuantización y del modelo base Qwen3.8-27B, que no está documentado aquí.
- GPU recomendadas: no disponibles.
- ¿Cabe en GPU de consumo?: no disponible; el tamaño del modelo base (aproximadamente 27,8B de parámetros según el recuento de la matriz editada) sugiere que requeriría cuantización agresiva para caber en GPUs de consumo, pero no se confirma.
- Despliegue: el autor indica que la carpeta de salida carga como el original en Transformers, vLLM o SGLang. La aplicación de la edición se realiza en CPU con `python apply.py --out ./Qwen3.8-27B-Astra` (dependencias: torch, safetensors, numpy, huggingface_hub) y tarda unos segundos.
- Latencia y throughput: no disponibles; el único dato indirecto es la reducción del 40% en tokens de pensamiento en generación abierta, que reduciría el tiempo de generación en ese escenario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Astra-Stop | No disponible (base ~27,8B) | No disponible | Edición de pesos de rango uno sobre Qwen3.8-27B | Apache-2.0 | Hugging Face (jarrodwatts) |
| Qwen3.8-27B (base) | No disponible (~27,8B) | No disponible | Modelo original sin editar | Apache-2.0 (según el artefacto) | Hugging Face (Qwen) |
| Alternativas de razonamiento de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada, por lo que la comparativa se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- La ganancia de reducción de pensamiento se ha medido en un escenario muy concreto (dibujar un pelícano en bicicleta) con solo 16 intentos por lado; la muestra es pequeña y no permite generalizar.
- En matemáticas y código el ahorro es marginal (−3%) y la precisión se mantiene, pero no se ha demostrado mejora alguna en esas tareas.
- El autor advierte de que intensidades mayores empeoran el resultado: con ×3 la precisión cae al 44%, y con ×5 o más el modelo deja de pensar casi de inmediato y se rompe.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma para esta edición; se heredarían del modelo base, del que no hay información en la fuente.
- La licencia es Apache-2.0, igual que el modelo base, por lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que el artefacto se genera localmente mediante `apply.py` a partir del modelo base, no que se distribuya completo.
- El modelo base está fijado a la revisión `1d4bf0f`; aplicar la edición sobre otra revisión podría no reproducir el hash sha256 esperado del archivo editado.
- No hay información sobre tool calling, agentes, multilingüismo ni otras capacidades del modelo base, por lo que no pueden garantizarse en producción.

## Enlaces

- Hugging Face: https://huggingface.co/jarrodwatts/Qwen3.8-27B-Astra-Stop
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo inspirador "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
