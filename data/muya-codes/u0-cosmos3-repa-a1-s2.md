# muya-codes/u0-cosmos3-repa-a1-s2

## Resumen

U0 Cosmos3 A1 (seed-17, "s2") es un checkpoint de política para robótica submarina publicado por el usuario `muya-codes` en Hugging Face. Forma parte del par de destilación Cosmos3 del artículo arXiv 2510.07869, un trabajo sobre modelos visión-lenguaje-acción (VLA) para el vehículo subacuático BlueROV2. La variante A1 corresponde a la política destilada con REPA (Representation Alignment), y este checkpoint concreto replica el brazo seed-17 del par original con seed-42, con el objetivo de separar una ganancia real de REPA de la varianza entre ejecuciones individuales.

El modelo tiene 2.833.011.783 parámetros en formato safetensors (aproximadamente 8 GB de repositorio) y se distribuye bajo licencia Apache 2.0. La model card indica que se entrenó durante 100.000 pasos siguiendo un protocolo de 12 Hz con 16 acciones sobre un BlueROV2 "bare" (sin brazo manipulador) y 7 tareas no manipulativas, con 180 casos de evaluación congelados idénticos a los del par seed-42. El tag `gr00t_n1_5` sugiere que la arquitectura se apoya en el stack GR00T N1.5 de NVIDIA para políticas fundacionales.

Es relevante porque aborda un nicho poco cubierto: políticas VLA para entornos subacuáticos, donde la percepción, la dinámica del vehículo y la ausencia de datos masivos complican el entrenamiento. El checkpoint se publica como artefacto de *serving* (config, pesos y normalización), no como archivo reanudable de entrenamiento, lo que condiciona su uso a inferencia y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en el stack GR00T N1.5 (tag `gr00t_n1_5`); detalles internos no disponibles |
| Parametros totales | 2.833.011.783 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (modelo orientado a acciones, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag `gr00t_n1_5`, que apunta al linaje GR00T N1.5 de NVIDIA para políticas visión-lenguaje-acción. El modelo se presenta como una política destilada con REPA (Representation Alignment), una técnica que alinea las representaciones internas del estudiante con las de un modelo maestro o con un objetivo de representación, y que en este contexto se compara contra una política no destilada (A0) para medir su efecto.

El entrenamiento consta de 100.000 pasos bajo el job `a1_seed17_805665`, con un protocolo de 12 Hz y 16 acciones sobre un BlueROV2 sin brazo, cubriendo 7 tareas no manipulativas. La receta, los datos, la caché y los 180 casos de evaluación congelados son idénticos a los del par seed-42 (`muya-codes/u0-cosmos3-a0` y `muya-codes/u0-cosmos3-repa-a1`), de modo que la única variable es la semilla. No se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO; en un VLA de robótica estos datos suelen referirse a trayectorias de demostración y episodios de simulación o teleoperación, pero no se confirma en la información proporcionada.

## Capacidades

- Control de políticas para robótica subacuática: genera acciones de 16 dimensiones a 12 Hz para un BlueROV2 sin brazo manipulador.
- Ejecución de 7 tareas no manipulativas definidas en el protocolo de entrenamiento.
- Aprendizaje por imitación o destilación desde un maestro, con alineación de representaciones REPA.
- Integración con el ecosistema GR00T N1.5 (tag de arquitectura), aunque no se detallan las interfaces exactas.
- No se documentan capacidades de generación de texto libre, tool calling, agentes multi-paso, visión general o audio.
- Capacidades multilingües: no disponibles; el modelo no se presenta como modelo de lenguaje conversacional.

## Casos de uso

- Inspección de cascos y estructuras sumergidas: la política puede ejecutar trayectorias de inspección sobre el BlueROV2 a 12 Hz, aprovechando los 7 comportamientos no manipulativos entrenados para recorridos cercanos a la estructura.
- Seguimiento de tuberías y cables submarinos: el modelo genera comandos de 16 acciones coherentes con el protocolo de control del vehículo, adecuado para tareas de rastreo visual repetitivas.
- Evaluación comparativa de métodos de destilación: al compartir receta y casos de evaluación con el par seed-42, sirve para medir la varianza entre semillas y aislar el efecto real de REPA en un pipeline de investigación.
- Mantenimiento de piscifactorías y granjas marinas: los comportamientos no manipulativos permiten patrullajes y observación de instalaciones sumergidas sin necesidad de brazo.
- Docencia e investigación en robótica subacuática: el checkpoint es un artefacto de *serving* ligero (8 GB) que se puede cargar en un laboratorio para reproducir experimentos del artículo arXiv 2510.07869.
- Pruebas de robustez de políticas VLA en dominio acuático: al ser un modelo pequeño comparado con VLA generalistas, permite iterar rápido en simulación o en tanque de pruebas antes de desplegar en mar abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona 180 casos de evaluación congelados compartidos con el par seed-42, pero no incluye las métricas obtenidas ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 5,7 GB solo para pesos (2,83 mil millones de parámetros × 2 bytes), más activaciones y buffers; en la práctica, entre 8 y 12 GB según el lote y la implementación.
- En FP32: unos 11,3 GB solo de pesos, lo que empuja el requisito total por encima de 16 GB.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para despliegues con lotes mayores o evaluación por lotes.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) usando BF16/FP16.
- Opciones de despliegue: no se documentan en la model card; al ser un VLA con tag `gr00t_n1_5`, se espera integración con el stack de NVIDIA GR00T, pero no se confirman vLLM, llama.cpp, Ollama ni TGI (estos últimos orientados a modelos de lenguaje y no a políticas de acción).
- Latencia y throughput: no disponibles; el protocolo de 12 Hz fija la frecuencia de control, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| U0 Cosmos3 A1 seed-17 (este) | 2,83 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Política VLA subacuática destilada con REPA |
| U0 Cosmos3 A0 (seed-42) | no disponible | no disponible | Apache 2.0 | Hugging Face (`muya-codes/u0-cosmos3-a0`) | Brazo no destilado del par de comparación |
| U0 Cosmos3 A1 (seed-42) | no disponible | no disponible | Apache 2.0 | Hugging Face (`muya-codes/u0-cosmos3-repa-a1`) | Misma política REPA, semilla distinta |
| GR00T N1.5 (NVIDIA) | no disponible | no disponible | no disponible | no disponible | Stack base referenciado por el tag; no se dispone de especificaciones en la información |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: entrenado exclusivamente para un BlueROV2 sin brazo y 7 tareas no manipulativas; no generaliza a otras plataformas ni a manipulación.
- Checkpoint de *serving*: excluye optimizador y estado RNG, por lo que no sirve para reanudar el entrenamiento, solo para inferencia o evaluación.
- Sin métricas publicadas: la ausencia de benchmarks y de resultados de los 180 casos de evaluación impide validar el rendimiento real.
- Riesgo de alucinación de acciones: como toda política aprendida, puede generar comandos plausibles pero incorrectos fuera de la distribución de entrenamiento, con riesgo físico en un vehículo sumergido.
- Sesgos: no documentados; al entrenarse en un dominio concreto, puede heredar sesgos de las demostraciones y de las condiciones ambientales de captura.
- Idiomas: no aplica como modelo de lenguaje; no se documentan capacidades multilingües.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar las dependencias del stack GR00T N1.5 por si imponen condiciones adicionales.
- Madurez: 0 descargas y 0 likes en el momento de la ficha; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/muya-codes/u0-cosmos3-repa-a1-s2
- Par seed-42 no destilado: https://huggingface.co/muya-codes/u0-cosmos3-a0
- Par seed-42 destilado con REPA: https://huggingface.co/muya-codes/u0-cosmos3-repa-a1
- Artículo de referencia: arXiv 2510.07869 (U0 underwater VLA)
