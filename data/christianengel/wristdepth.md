# christianengel/WristDepth

## Resumen

WristDepth es un ajuste fino (fine-tune) del modelo Apple Depth Pro 2 B, desarrollado por el usuario christianengel, especializado en la estimación de profundidad métrica para cámaras de muñeca de robots en el rango cercano de manipulación. El modelo recibe una imagen RGB y su distancia focal horizontal en píxeles (`f_px`) y devuelve un mapa de profundidad métrica en metros a lo largo del eje de la cámara. Resuelve un problema concreto: los modelos de profundidad monocular genéricos se equivocan entre 2 y 4 veces en vistas de pinza (gripper), lo que degrada la planificación de agarre y la manipulación fina.

El modelo se distribuye como un derivado de investigación de Apple Depth Pro 2 B, con aproximadamente 96,5 millones de parámetros y un repositorio de 0,6 GB que incluye pesos en safetensors y un grafo ONNX en FP16. La biblioteca asociada es `depth-pro-2` y el pipeline declarado es `depth-estimation`. Es relevante ahora porque permite obtener profundidad métrica densa a partir de una sola imagen RGB en configuraciones robóticas de bajo coste (SO-101, DROID, ReBot B601) sin depender de sensores de profundidad dedicados, y porque el autor publica datos procedimentales de entrenamiento (98.180 fotogramas renderizados en Blender) y evaluaciones en laboratorios no vistos durante el entrenamiento.

La licencia es `apple-amlr` (Apple Machine Learning Research Model License), lo que restringe el uso a investigación no comercial y académica. No está afiliado ni respaldado por Apple. El modelo no procesa lenguaje ni texto: es exclusivamente un estimador de profundidad, por lo que las secciones de capacidades lingüísticas, tool calling y agentes no aplican.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de estimación de profundidad monocular basada en Apple Depth Pro 2 B (transformer de visión; detalles internos de capas no disponibles) |
| Parametros totales | 96.513.409 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de una sola imagen RGB) |
| Tipos de cuantizacion | FP16 (ONNX `model_fp16.onnx`); otros tipos no disponibles |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License); solo investigación no comercial |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

WristDepth es un fine-tune de Apple Depth Pro 2 B, un modelo de estimación de profundidad monocular métrica. El autor no detalla en la información disponible la arquitectura interna (número de capas, tipo de backbone, mecanismos de atención), pero el modelo base es un transformer de visión orientado a predicción densa de profundidad. La innovación principal del ajuste es la adaptación al régimen de distancia corta propio de las cámaras de muñeca robóticas (aproximadamente 0,08–1,5 m), donde los modelos genéricos fallan por un sesgo de escala y por la presencia de la pinza en el campo de visión.

El entrenamiento se realizó sobre el dataset `christianengel/WristDepth-procedural`, compuesto por 98.180 fotogramas renderizados proceduralmente con Blender (BlenderProc), complementado con datos de múltiples configuraciones robóticas (multi-rig). No se especifica en la información disponible el número exacto de tokens ni si hubo RLHF/DPO (no aplica a un modelo de visión). El modelo incorpora una guarda de profundidad inversa que evita la emisión de valores infinitos o no finitos, un problema presente en la versión anterior (v1) que emitía `+inf` en 5.524 píxeles de 2 fotogramas del conjunto ReBot. La inferencia se valida sobre el grafo ONNX FP16 con `CUDAExecutionProvider`, una sola imagen por pasada y sin alineación post-hoc salvo en el caso de profundidad relativa no calibrada.

## Capacidades

- Estimación de profundidad métrica densa a partir de una única imagen RGB y su distancia focal horizontal en píxeles (`f_px`), con salida en metros a lo largo del eje de la cámara.
- Funcionamiento en rango cercano de manipulación (aproximadamente 0,08–1,5 m), optimizado para cámaras de muñeca de robots.
- Generalización a configuraciones y laboratorios no vistos durante el entrenamiento (DROID, PennPAL, HOPE-Video, ReBot B601).
- Manejo robusto de profundidad inversa: emite 0 píxeles no finitos en el conjunto ReBot, frente a los 5.524 de la versión anterior.
- Soporte de profundidad relativa cuando la distancia focal no está calibrada (con alineación post-hoc explícita).
- Inferencia en CPU y GPU mediante ONNX Runtime; también disponible en PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni visión general (solo profundidad).
- Capacidades multilingües: no aplica (modelo sin procesamiento de lenguaje).

## Casos de uso

- Manipulación robótica de precisión en mesa: el modelo proporciona profundidad métrica en el rango de 8–150 cm, lo que permite planificar agarres y aproximaciones sin sensor de profundidad dedicado; validado en SO-101 con error de 4,9 mm en colocaciones de tablero de ajedrez.
- Sustitución o complemento de sensores de profundidad de bajo coste: en la configuración ReBot B601 con RealSense D405, WristDepth predice profundidad desde una sola imagen RGB y focal calibrada, con `mae_log` de 0,288 en la banda de 15–25 cm frente a 0,513 de la versión anterior.
- Control de robots con cámaras de muñeca en configuraciones LeRobot/SO-101: integrable en pipelines de `lerobot` para tareas de recogida y colocación, con `mae_log` de 0,068 (15 mm) en el episodio retenido Towa25 SO-101.
- Evaluación de políticas agente (Agent-as-Policy) en YAM: el modelo logra `mae_log` de 0,100 (23 mm) en 20 ensayos retenidos, adecuado para realimentar políticas de manipulación con profundidad métrica.
- Análisis de geometría de objetos en primer plano: en escenas Blender con platos brillantes, el error MAE de suelo-sobre-mesa baja de 40,6 mm a 9,1 mm, útil para tareas de vertido, apilado o limpieza de mesa.
- Procesamiento de vídeo corto de cámara de muñeca: la demo acepta vídeos de hasta 5 segundos y una imagen RGB, permitiendo estimación de profundidad por fotograma para inspección o teleoperación.
- Investigación en percepción robótica: el dataset procedimental de 98.180 fotogramas y los registros de evaluación JSON permiten reproducir y comparar resultados en laboratorios no vistos.

## Benchmarks y rendimiento

Resultados medidos sobre el grafo `onnx/model_fp16.onnx` con `CUDAExecutionProvider`, un fotograma por pasada. `mae_log` es el error absoluto medio en log-profundidad (menor es mejor); la escala es la mediana de profundidad predicha / referencia (ideal 1,00).

| Conjunto de evaluación | Fotogramas | Ámbito | v1 `mae_log` | WristDepth `mae_log` | v1 escala | WristDepth escala |
|---|---:|---|---:|---:|---:|---:|
| DROID test | 392 | Escenas no vistas | 0,249 | 0,115 | 0,94 | 1,00 |
| PennPAL | 1.235 | Laboratorio excluido | 0,460 | 0,169 | 0,72 | 0,99 |
| HOPE-Video (Baxter / D415) | 160 | Laboratorio no visto (10 escenas) | 0,179 | 0,129 | 0,86 | 0,92 |
| ReBot B601 / D405 | 96 | Configuración no vista (12 episodios) | 0,505* | 0,517 | 1,67 | 1,61 |
| SO-101 tabletop privado | 40 | Fotogramas retenidos | 0,193 | 0,190 | — | 1,10 |
| Colocaciones locales de tablero | 6 | Colocaciones disjuntas | 0,373 (99 mm) | 0,024 (4,9 mm) | — | 0,99 |
| Paddy xArm7 | 100 | Episodio retenido | 0,320 | 0,134 | — | 0,99 |
| YAM (Agent-as-Policy) | 1.009 | 20 ensayos retenidos | 0,374 | 0,100 (23 mm) | — | 1,01 |
| Towa25 SO-101 | 115 | Episodio retenido | 0,220 | 0,068 (15 mm) | — | 0,99 |
| mot-prog SO-101 (solo relativa) | 265 | 6 episodios retenidos | 0,074 | 0,045 | — | — |

\*La v1 emitió infinito positivo en 5.524 píxeles de 2 de 96 fotogramas de ReBot (95 píxeles de referencia válidos); WristDepth emite 0 píxeles no finitos. En la banda de manipulación de 15–25 cm de ReBot, `mae_log` baja de 0,513 (v1) a 0,288. En HOPE-Video, WristDepth mejora 9 de 10 escenas sobre v1 (IC del 95% emparejado `[−0,079, −0,024]`).

En geometría de platos sintéticos (30 escenas nuevas de Blender, 59 fotogramas), el MAE de suelo-sobre-mesa baja de 40,6 mm (v1) a 9,1 mm, y el MAE de relieve borde-suelo baja de 29,4 mm (56,7% de relieve positivo) a 14,7 mm (100% de relieve positivo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 96,5 M de parámetros en FP16, el peso de los pesos ronda los 0,19 GB, por lo que la VRAM necesaria es modesta (por debajo de 1 GB en la mayoría de configuraciones).
- GPU recomendadas: el autor valida con `CUDAExecutionProvider` de ONNX Runtime; no se especifican modelos concretos de GPU (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo; no se detalla qué modelos concretos.
- Opciones de despliegue: ONNX Runtime (`CUDAExecutionProvider` y CPU), PyTorch, y la demo web del Space de Hugging Face; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | `mae_log` DROID test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WristDepth | 96,5 M | 1 imagen RGB + `f_px` | 0,115 | apple-amlr (solo investigación) | Hugging Face, ONNX + safetensors |
| Apple Depth Pro 2 B (base) | no disponible | 1 imagen RGB + `f_px` | no disponible | apple-amlr | Hugging Face |
| v1 (versión anterior de WristDepth) | no disponible | 1 imagen RGB + `f_px` | 0,249 | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos de profundidad monocular comparables en la información proporcionada, por lo que la comparativa se limita al modelo base y a la versión anterior del propio fine-tune.

## Limitaciones y advertencias

- Licencia `apple-amlr`: uso exclusivo para investigación no comercial y académico; no permite uso comercial sin licencia adicional de Apple.
- No es un modelo oficial de Apple ni está respaldado por la compañía; es un derivado de investigación no afiliado.
- Requiere la distancia focal horizontal en píxeles (`f_px`) para profundidad métrica; sin ella solo produce profundidad relativa con alineación post-hoc.
- El rendimiento en configuraciones muy alejadas del dominio de entrenamiento (ReBot B601 / D405) es peor que en el resto: `mae_log` de 0,517 y escala de 1,61, lo que indica un sesgo de escala significativo en esa configuración.
- Sesgos conocidos: no se documentan sesgos demográficos ni sociales (modelo de visión sin datos de personas); el sesgo relevante es geométrico y de dominio (cámaras de muñeca, rango cercano).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el modelo puede producir profundidades plausibles pero incorrectas en superficies brillantes, transparentes o fuera del rango de 0,08–1,5 m.
- Limitación de idioma: no aplica (sin procesamiento de lenguaje).
- En producción: validar la calibración de la focal y el rango de distancia antes de desplegar; el modelo está pensado para investigación y no se han publicado garantías de robustez fuera de los conjuntos evaluados.
- El repositorio tiene 68 descargas y 0 likes en el momento de la consulta, lo que indica adopción limitada y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christianengel/WristDepth
- Space de demostración: https://huggingface.co/spaces/christianengel/WristDepth
- Página estática del proyecto: https://christianengel-wristdepth.static.hf.space/index.html
- Dataset procedimental: https://huggingface.co/datasets/christianengel/WristDepth-procedural
- Repositorio GitHub: https://github.com/protortyp/wristdepth
- Código de datos reales en GitHub: https://github.com/protortyp/wristdepth/tree/main/real
- Modelo base: https://huggingface.co/apple/DepthPro2-B
- Vídeo comparativo (23 s): https://huggingface.co/christianengel/WristDepth/resolve/main/media/wristdepth_long.mp4
- Vídeo comparativo (15 s): https://huggingface.co/christianengel/WristDepth/resolve/main/media/wristdepth_15s.mp4
- Vídeo demo wipe: https://huggingface.co/christianengel/WristDepth/resolve/main/media/wristdepth-wipe.mp4
- Vídeo comparación con sensor: https://huggingface.co/christianengel/WristDepth/resolve/main/media/wristdepth-sensor-check.mp4
- Registros de evaluación ONNX: https://huggingface.co/christianengel/WristDepth/blob/main/evaluation_onnx.json
- Registros de evaluación PyTorch: https://huggingface.co/christianengel/WristDepth/blob/main/evaluation_pytorch.json
- Confirmación final: https://huggingface.co/christianengel/WristDepth/blob/main/final_confirmation.json
- Geometría de platos sintéticos: https://huggingface.co/christianengel/WristDepth/blob/main/synthetic_dish_geometry.json
- Créditos y licencias de vídeos: https://huggingface.co/christianengel/WristDepth/blob/main/media/credits-and-alt.txt
