# anguoyang/depth-anything-v3-qcs6490

## Resumen

Depth Anything V3 es un modelo de estimación de profundidad monocular (MDE, por sus siglas en inglés) que, a partir de una única imagen RGB, genera un mapa de profundidad denso con la misma resolución espacial que la entrada. El repositorio `anguoyang/depth-anything-v3-qcs6490` no contiene pesos ni artefactos compilados: es una ficha de medición que documenta el primer perfil público de este modelo sobre el SoC Qualcomm QCS6490, integrado en el kit Dragonwing RB3 Gen 2 Vision Kit.

La aportación principal es una cifra de latencia reproducible: 1.709,1 ms por inferencia con entrada de 1×3×518×518 y salida de 1×1×518×518, medida con el runtime QNN de Qualcomm a través de la API de Qualcomm AI Hub, en precisión fp32 sin cuantización explícita. El autor señala que la versión 0.66.0 de `qai-hub-models` no incluye ninguna entrada para este modelo en su `perf.yaml` sobre el RB3 Gen 2, de modo que la medición cubre un hueco en la documentación upstream.

El interés práctico es acotado pero claro: sirve como referencia de viabilidad para desplegar estimación de profundidad en hardware edge de Qualcomm (robótica ligera, visión embebida, gafas o drones), y como punto de partida para quien quiera reproducir o mejorar la cifra mediante cuantización. La licencia del modelo upstream es Apache-2.0 según la propia ficha, aunque el repositorio de Hugging Face no declara licencia propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad monocular; la ficha no detalla la arquitectura interna) |
| Parámetros totales | no disponible (el ONNX exportado ocupa 100.587.116 bytes) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible en la medición; la prueba se hizo en fp32 ONNX sin cuantización explícita |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | Apache-2.0 según la ficha (upstream); el repo de Hugging Face no declara licencia |
| Formato de pesos | no se publican pesos; el autor exportó ONNX desde `qai-hub-models` 0.66.0 y compiló con QNN |

Otros datos medidos:

| Parámetro | Valor |
|---|---|
| Entrada | 1 × 3 × 518 × 518 (imagen RGB) |
| Salida | 1 × 1 × 518 × 518 (mapa de profundidad) |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (Qualcomm QCS6490) |
| Runtime | QNN |
| Tiempo de inferencia estimado | 1.709,1 ms (1.709.091 µs) |
| Fecha de medición | 2026-11-25 |
| Job IDs | compilación `jp8dw7mq5`, perfilado `j5qx92rep` |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura interna del modelo ni los datos de entrenamiento. Lo que sí se documenta es el pipeline de despliegue: el autor exportó el modelo a ONNX a partir de la definición `depth_anything_v3` incluida en `qai-hub-models` 0.66.0, generando un grafo de 100.587.116 bytes, y lo compiló con las opciones por defecto de Qualcomm AI Hub (sin cuantización explícita, fp32) para el backend QNN del QCS6490.

La metodología de medición es de un solo grafo: se usó `submit_inference_job(..., profile=True)` de la API de AI Hub y se tomó el campo `execution_summary.estimated_inference_time` del job de perfilado. El propio autor advierte que se trata de una estimación por grafo y no de la latencia extremo a extremo de una aplicación, lo que es relevante para cualquier extrapolación a producción. No se aportan datos sobre tokens de entrenamiento, composición del dataset, RLHF ni innovaciones de atención.

## Capacidades

- Estimación de profundidad monocular densa: produce un mapa de profundidad de 518×518 píxeles a partir de una imagen RGB de 518×518.
- Salida alineada espacialmente con la entrada (misma resolución), lo que simplifica la integración con pipelines de visión posteriores.
- Funcionamiento con una sola imagen, sin necesidad de pares estéreo ni de calibración de cámara.
- Ejecución en hardware edge Qualcomm mediante QNN, sin GPU dedicada.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, audio ni vídeo.
- No se documenta un modo de razonamiento explícito ni variantes de pensamiento extendido.

## Casos de uso

- Robótica móvil ligera: el mapa de profundidad por fotograma permite construir mapas de ocupación o detectar obstáculos cercanos en un robot con QCS6490; a 1,7 s por inferencia el modelo sirve para planificación de bajo ritmo, no para control reactivo.
- Visión embebida en el Dragonwing RB3 Gen 2 Vision Kit: el modelo ya está perfilado en ese hardware concreto, de modo que se puede usar como referencia para validar el consumo térmico y energético de un pipeline de profundidad antes de invertir en optimización.
- Gafas o cascos de realidad aumentada de gama baja: la profundidad monocular permite anclar objetos virtuales y estimar distancias relativas sin hardware estéreo adicional, siempre que la latencia de 1,7 s sea aceptable para el caso de uso (contenido estático o semiestático).
- Drones de bajo consumo: para tareas de evitación de obstáculos en trayectorias lentas o para postprocesado de fotogramas capturados en vuelo, donde no se requiere tiempo real estricto.
- Análisis de imágenes en el borde con privacidad: procesar imágenes de cámaras de vigilancia o de agricultura en el propio dispositivo, generando mapas de profundidad sin enviar vídeo a la nube.
- Punto de partida para optimización: la cifra de 1.709,1 ms en fp32 sin cuantización sirve de línea base para medir la mejora obtenida al aplicar cuantización int8 o int16 con QNN y comparar contra el `perf.yaml` de `qai-hub-models`.
- Reproducibilidad de benchmarks: el autor publica los IDs de los jobs de compilación y perfilado, lo que permite a terceros repetir la medición con el mismo harness y verificar la cifra.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| Tiempo de inferencia estimado | 1.709,1 ms | QCS6490, QNN, fp32 ONNX, opciones por defecto de AI Hub |
| Entrada | 1 × 3 × 518 × 518 | Imagen RGB |
| Salida | 1 × 1 × 518 × 518 | Mapa de profundidad |
| Tamaño del grafo ONNX | 100.587.116 bytes | Exportado desde `qai-hub-models` 0.66.0 |

No se han publicado resultados de benchmarks de calidad (RMSE, AbsRel, delta1, etc.) en la información disponible. La única métrica es la latencia de inferencia en el hardware indicado.

## Requisitos de hardware

- Hardware de referencia: Qualcomm QCS6490 en el Dragonwing RB3 Gen 2 Vision Kit; la medición es específica de ese SoC y ese runtime (QNN).
- VRAM: no aplica; el QCS6490 es un SoC con memoria unificada y no se documenta el consumo de memoria del grafo.
- GPU recomendadas: no disponibles para el modelo; la ficha solo cubre el acelerador NPU/DSP de Qualcomm vía QNN.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no documentada en la información proporcionada.
- Opciones de despliegue documentadas: ONNX exportado desde `qai-hub-models` y compilado con Qualcomm AI Hub para QNN. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de visión de este tipo.
- Latencia: 1.709,1 ms por inferencia en el hardware de referencia, en fp32 y sin cuantización explícita. El autor advierte que es una estimación por grafo, no latencia extremo a extremo.
- Throughput: no disponible (no se documenta el número de inferencias por segundo ni el batching).

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Hardware medido | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Depth Anything V3 (esta ficha) | MDE monocular | 518×518 → 518×518 | QCS6490 (RB3 Gen 2) | 1.709,1 ms | Apache-2.0 (upstream) | Pesos no publicados en este repo; definición en `qai-hub-models` 0.66.0 |
| Depth Anything V2 | MDE monocular | no disponible en esta información | no disponible | no disponible | no disponible | no disponible |
| MiDaS | MDE monocular | no disponible en esta información | no disponible | no disponible | no disponible | no disponible |
| Depth Pro (Apple) | MDE monocular | no disponible en esta información | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye mediciones de modelos alternativos en el mismo hardware ni comparativas de calidad, por lo que la tabla solo recoge la fila del modelo documentado y deja el resto como no disponible.

## Limitaciones y advertencias

- El repositorio no publica pesos ni artefactos compilados: solo contiene números medidos y metodología. No es directamente utilizable como modelo.
- La latencia de 1.709,1 ms corresponde a fp32 sin cuantización explícita; es probable que mejore con cuantización, pero esa mejora no está medida ni documentada.
- La cifra es una estimación por grafo (`estimated_inference_time`), no una latencia extremo a extremo de aplicación; incluye solo la ejecución del grafo en QNN.
- La medición es específica del QCS6490 y del runtime QNN; no es extrapolable a otras NPU, GPU o CPU sin nueva medición.
- No se documentan sesgos, tasas de alucinación ni limitaciones de idioma porque es un modelo de visión; no obstante, la calidad de la profundidad en escenas con superficies reflectantes, transparencias o iluminación adversa no está evaluada en esta ficha.
- La licencia Apache-2.0 se cita como licencia upstream en la ficha, pero el repositorio de Hugging Face no declara licencia propia; conviene verificar la licencia del modelo original antes de un uso comercial.
- El autor indica que no existe entrada para este modelo en el `perf.yaml` de `qai-hub-models` 0.66.0 para el RB3 Gen 2, por lo que no hay una referencia oficial contra la que contrastar la cifra.
- No se aportan datos de consumo energético, memoria pico ni comportamiento térmico, relevantes para despliegues embebidos sostenidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/depth-anything-v3-qcs6490
- Colección de modelos medidos (qcs-model-zoo): https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido de benchmarks (qcs-bench): https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub Models (definición `depth_anything_v3` en la versión 0.66.0): no disponible como enlace en la información proporcionada
- Paper de Depth Anything V3: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
