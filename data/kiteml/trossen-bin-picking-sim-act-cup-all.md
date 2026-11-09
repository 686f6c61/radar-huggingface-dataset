# kiteml/trossen-bin-picking-sim-act-cup-all

## Resumen

`kiteml/trossen-bin-picking-sim-act-cup-all` es una política robótica ACT (Action Chunking Transformer) entrenada con LeRobot para una estación bimanual WidowX AI. Su tarea es concreta y única: recoger el vaso rojo y depositarlo en la bandeja transparente. No procesa instrucciones en lenguaje natural, por lo que no es un modelo de propósito general sino un controlador especializado de manipulación.

El modelo consume las imágenes de cuatro cámaras y las 14 posiciones articulares del robot, y emite 14 consignas articulares en bloques de 100 pasos. Se entrenó con los 17 episodios de vaso de cada uno de los siete conjuntos `kiteml/trossen-bin-picking-sim-*` (119 episodios, 48.069 fotogramas), en una única A100 durante 30.000 pasos con batch 8.

Su relevancia es acotada pero ilustrativa: sirve como referencia reproducible de cómo varía el rendimiento de una política de imitación cuando se entrena con datos aumentados en condiciones de iluminación y escena (luz tenue, cálida, luz de ventana, objetos extra). Los resultados de evaluación closed-loop son modestos y el propio autor advierte que es solo simulación, sin validación en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot |
| Parámetros totales | 51.685.006 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Entradas | 4 cámaras + 14 posiciones articulares |
| Salidas | 14 consignas articulares en chunks de 100 pasos |
| Tamaño del repositorio | 0,2 GB |
| Librería | LeRobot 0.6 o superior |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error acumulado y suaviza el control. En este caso, la política mapea observaciones multimodales (cuatro cámaras y el estado articular de 14 dimensiones) a 14 objetivos articulares por paso, emitiendo bloques de 100 pasos por inferencia. No hay indicios de RLHF, DPO ni ajuste por refuerzo: es aprendizaje supervisado por imitación a partir de demostraciones.

El entrenamiento usó 119 episodios (48.069 fotogramas) procedentes de los siete conjuntos de datos de `trossen-bin-picking-sim`, cada uno de los cuales replica las mismas grabaciones bajo condiciones distintas: baseline, luz tenue (dim), luz muy tenue (very dim), luz cálida (warm), fluorescente, luz de ventana y escena con objetos extra. Los datos derivan del conjunto público `bin_picking` de Trossen Robotics (Apache-2.0). Se realizaron 30.000 pasos con batch 8 en una A100; los pesos publicados corresponden a ese checkpoint final.

## Capacidades

- Manipulación robótica de una sola tarea: recoger el vaso rojo y colocarlo en la bandeja transparente.
- Control bimanual de una estación WidowX AI con 14 articulaciones.
- Fusión de cuatro cámaras y estado propioceptivo en una única política.
- Predicción de chunks de acción de 100 pasos, lo que aporta estabilidad temporal al control.
- Generalización limitada a variaciones de iluminación y presencia de objetos extra, según los datos de aumento empleados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni instrucciones en lenguaje natural.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Investigación en imitación robótica: sirve como línea base reproducible para estudiar el efecto del aumento de datos (iluminación y distractores) sobre el éxito de una política ACT.
- Benchmark de robustez visual: comparar `act-cup-all` frente a `act-cup-baseline` permite medir cuánto aporta entrenar con los siete dominios frente a uno solo.
- Prototipado en simulación: validar pipelines de LeRobot 0.6, carga de políticas y evaluación closed-loop antes de invertir en hardware.
- Docencia y formación: ejemplo compacto (0,2 GB, 51,7 M de parámetros) para explicar action chunking y políticas visuomotoras.
- Generación de datos sintéticos de evaluación: usar la política como agente que produce trayectorias bajo distintas condiciones de luz para analizar fallos.
- Estudio de límites de generalización: analizar por qué el rendimiento cae a 0/20 con objetos extra pese al entrenamiento con distractores.
- Base para fine-tuning: punto de partida para adaptar la política a otras tareas de bin picking con nuevos episodios.

## Benchmarks y rendimiento

Evaluación closed-loop en una copia simulada de la estación, 20 ejecuciones por prueba sobre dos disposiciones de vaso no vistas en entrenamiento. Todas las colocaciones exitosas corresponden a la disposición en la que el brazo izquierdo recoge el vaso.

| Condición | `act-cup-all` (éxitos/20) | `act-cup-baseline` (éxitos/20) |
|---|---|---|
| Luz de sala | 2 | 8 |
| Luz tenue | 2 | 2 |
| Luz cálida | 1 | 0 |
| Objetos extra en la mesa | 0 | 8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la huella es mínima y el cuello de botella es el procesamiento de las cuatro cámaras.
- GPU recomendadas: el entrenamiento se realizó en una A100; para inferencia basta con una GPU consumer moderna (RTX 3060 o superior) o incluso CPU para pruebas puntuales.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: LeRobot 0.6 o superior mediante `ACTPolicy.from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (luz de sala / tenue / cálida / objetos extra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kiteml/trossen-bin-picking-sim-act-cup-all` | 51,7 M | no aplica | 2 / 2 / 1 / 0 sobre 20 | Apache-2.0 | Hugging Face |
| `kiteml/trossen-bin-picking-sim-act-cup-baseline` | no disponible | no aplica | 8 / 2 / 0 / 8 sobre 20 | Apache-2.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que no se ha probado en un robot real.
- Una única tarea: únicamente recoge el vaso rojo; no interpreta instrucciones ni admite otras órdenes.
- Rendimiento bajo: entre 0 y 2 éxitos sobre 20 en tres de las cuatro condiciones evaluadas.
- El aumento de datos no mejora al baseline: `act-cup-all` rinde peor que `act-cup-baseline` en luz de sala (2 frente a 8) y con objetos extra (0 frente a 8), lo que sugiere que la mezcla de dominios diluye el aprendizaje en las condiciones mejor representadas.
- Dependencia de la disposición: todos los éxitos se producen en la disposición donde el brazo izquierdo recoge el vaso; no hay evidencia de generalización a la otra.
- Riesgo de sobreajuste a la apariencia del vaso y de la bandeja; cambios de color, forma o posición pueden degradar el comportamiento.
- Sin datos sobre sesgos, alucinación o cobertura idiomática, ya que no es un modelo de lenguaje.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías y el uso en producción real requeriría validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiteml/trossen-bin-picking-sim-act-cup-all
- Modelo baseline: https://huggingface.co/kiteml/trossen-bin-picking-sim-act-cup-baseline
- Repositorio de pruebas y límites: https://github.com/kite-ml/trossen-bin-picking-sim-datasets
- Conjunto de datos de ejemplo (luz de ventana): https://huggingface.co/datasets/kiteml/trossen-bin-picking-sim-window
- Conjuntos de datos de entrenamiento: `kiteml/trossen-bin-picking-sim-baseline`, `kiteml/trossen-bin-picking-sim-dim`, `kiteml/trossen-bin-picking-sim-very-dim`, `kiteml/trossen-bin-picking-sim-warm`, `kiteml/trossen-bin-picking-sim-fluorescent`, `kiteml/trossen-bin-picking-sim-window`, `kiteml/trossen-bin-picking-sim-extra-objects`
- LeRobot (librería): https://github.com/huggingface/lerobot
- Kite: https://kiteml.com
