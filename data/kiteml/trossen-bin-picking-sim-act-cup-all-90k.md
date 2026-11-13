# kiteml/trossen-bin-picking-sim-act-cup-all-90k

## Resumen

`kiteml/trossen-bin-picking-sim-act-cup-all-90k` es una política de robótica basada en ACT (Action Chunking Transformer) entrenada con LeRobot para una estación bimanual WidowX AI simulada. Su tarea es concreta y única: recoger el vaso rojo y depositarlo en la bandeja transparente. A partir de cuatro cámaras y 14 posiciones articulares, el modelo emite 14 objetivos de articulación en bloques de 100 pasos, sin leer ninguna instrucción en lenguaje natural.

El modelo lo publica Kite (kiteml) y se entrena sobre los episodios de vaso de siete variantes del conjunto `trossen-bin-picking-sim` (condiciones de luz normal, tenue, muy tenue, cálida, fluorescente, ventana y con objetos extra), sumando 119 episodios y 48.069 fotogramas. Los pesos corresponden a 90.000 pasos de entrenamiento con batch 8 sobre una A100, unas 4 horas de cómputo.

Es relevante como referencia reproducible de generalización de dominio en manipulación simulada: compara explícitamente el rendimiento de una política entrenada con las siete variantes frente a una entrenada solo con la variante base, y publica los resultados de evaluación en bucle cerrado. Con 51,7 millones de parámetros y licencia Apache-2.0, es un artefacto ligero y reutilizable para experimentación en robótica simulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), implementación de LeRobot |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; horizonte de acción de 100 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer de imitación supervisada que mapea observaciones (imágenes de cuatro cámaras más 14 posiciones articulares) a secuencias de acciones. En lugar de predecir una acción por paso, el modelo predice un *chunk* de 100 acciones de 14 dimensiones articulares, lo que reduce el error de composición y estabiliza el control en bucle cerrado. La implementación concreta es la de LeRobot (`lerobot.policies.act.modeling_act.ACTPolicy`), cargable con LeRobot 0.6 o superior.

El entrenamiento usa 119 episodios (17 por cada una de las siete variantes del dataset, 48.069 fotogramas en total), 90.000 pasos con batch 8 en una A100 (~4 horas). No se documenta en la información disponible el uso de RLHF, DPO ni de datos reales de robot: es imitación pura sobre demostraciones simuladas. La innovación metodológica destacable es el entrenamiento multi-dominio (las siete condiciones de iluminación y composición de escena) frente al entrenamiento solo con la variante base, evaluado de forma controlada.

## Capacidades

- Manipulación robótica bimanual: recogida del vaso rojo y colocación en la bandeja transparente en una estación WidowX AI simulada.
- Entrada multimodal: cuatro cámaras más 14 posiciones articulares.
- Salida de acciones en chunks de 100 pasos × 14 dimensiones articulares.
- Generalización de dominio parcial a variaciones de iluminación (luz tenue, muy tenue, cálida, fluorescente, luz de ventana) y a escenas con objetos extra.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües: no procesa instrucciones.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Evaluación de generalización de dominio en imitación: usar el modelo como referencia para medir cuánto aporta entrenar con siete variantes de iluminación frente a una sola, replicando el protocolo de 20 ejecuciones por condición.
- Investigación en políticas visuomotoras: punto de partida ligero (51,7 M de parámetros) para experimentar con variaciones de arquitectura ACT, horizontes de acción o aumentos de datos en simulación.
- Benchmark de pipelines de LeRobot: validar la carga de `ACTPolicy` con LeRobot 0.6+, el formato safetensors y la integración con el ecosistema de datasets `trossen-bin-picking-sim`.
- Aumento de datos sintéticos: comparar el efecto de añadir condiciones de iluminación o de objetos extra sobre el éxito de una política de picking.
- Docencia y prototipado en robótica: ejemplo reproducible de extremo a extremo (datos, entrenamiento, evaluación en bucle cerrado) con coste de cómputo bajo (4 horas en una A100).
- Estudio de robustez ante cambios de iluminación: el modelo permite cuantificar la caída de éxito bajo luz tenue (3/20) frente a luz de sala (8/20) y diseñar estrategias de mitigación.

## Benchmarks y rendimiento

Evaluación en bucle cerrado sobre una copia simulada de la estación, 20 ejecuciones por condición, en dos disposiciones de vaso no vistas durante el entrenamiento:

| Condición de evaluación | Este modelo (90k, 7 datasets) | Baseline (30k, solo `baseline`) | All-seven 30k |
|---|---|---|---|
| Luz de sala | 8/20 | 8/20 | 2/20 |
| Luz tenue | 3/20 | 2/20 | 2/20 |
| Luz cálida | 4/20 | 0/20 | 1/20 |
| Objetos extra en la mesa | 3/20 | 8/20 | 0/20 |

Todas las colocaciones exitosas se producen en la disposición en la que el brazo izquierdo recoge el vaso. Los resultados no muestran una ventaja uniforme del entrenamiento multi-dominio: mejora en luz cálida y tenue, pero empeora frente al baseline en la condición con objetos extra.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors, la huella de pesos es de aproximadamente 0,2 GB (tamaño del repo), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: A100 para entrenamiento (la referencia usada por el autor, ~4 horas para 90.000 pasos con batch 8); para inferencia, cualquier GPU con suficiente memoria para el modelo y las cuatro cámaras.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se documentan requisitos específicos de VRAM ni de latencia.
- Opciones de despliegue: LeRobot 0.6 o superior (`ACTPolicy.from_pretrained`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrenamiento | Condiciones evaluadas | Licencia |
|---|---|---|---|---|
| `kiteml/trossen-bin-picking-sim-act-cup-all-90k` (este) | 51,7 M | 7 datasets, 90k pasos | 4 (sala, tenue, cálida, objetos extra) | Apache-2.0 |
| `kiteml/trossen-bin-picking-sim-act-cup-all` | no disponible | 7 datasets, 30k pasos | las mismas 4 | Apache-2.0 |
| `kiteml/trossen-bin-picking-sim-act-cup-baseline` | no disponible | solo `baseline`, 30k pasos | las mismas 4 | Apache-2.0 |

Los tres modelos comparten arquitectura ACT, tarea (vaso rojo a bandeja transparente) y protocolo de evaluación; difieren en la composición del dataset y en el número de pasos de entrenamiento.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que no se ha probado en un robot real.
- Tarea única: únicamente recoge el vaso rojo; no lee instrucciones y no generaliza a otros objetos u objetivos.
- Rendimiento absoluto bajo: el mejor resultado es 8/20 (40 %) en luz de sala, con 3/20 en luz tenue y con objetos extra.
- Las colocaciones exitosas se limitan a la disposición en la que el brazo izquierdo recoge el vaso; la otra disposición no se resuelve.
- No hay datos publicados sobre sesgos, alucinación (no aplica a generación de texto) ni latencia.
- No se documentan requisitos de cuantización ni compatibilidad con runtimes distintos de LeRobot.
- Licencia Apache-2.0 permite uso comercial, pero el modelo deriva del dataset público `bin_picking` de Trossen Robotics (también Apache-2.0); conviene verificar las condiciones de los datasets derivados antes de un despliegue en producción.
- Entrenado con datos simulados derivados de un dataset público: posible brecha de dominio si se traslada a una estación física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiteml/trossen-bin-picking-sim-act-cup-all-90k
- Variante de 30.000 pasos: https://huggingface.co/kiteml/trossen-bin-picking-sim-act-cup-all
- Baseline: https://huggingface.co/kiteml/trossen-bin-picking-sim-act-cup-baseline
- Tests, límites y ejecuciones de todas las políticas: https://github.com/kite-ml/trossen-bin-picking-sim-datasets
- Autor: https://kiteml.com
- Datasets de entrenamiento: `kiteml/trossen-bin-picking-sim-baseline`, `kiteml/trossen-bin-picking-sim-dim`, `kiteml/trossen-bin-picking-sim-very-dim`, `kiteml/trossen-bin-picking-sim-warm`, `kiteml/trossen-bin-picking-sim-fluorescent`, `kiteml/trossen-bin-picking-sim-window`, `kiteml/trossen-bin-picking-sim-extra-objects`
