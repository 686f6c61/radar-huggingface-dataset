# rony000013/intel-physical-ai-smolvla

## Resumen

SmolVLA (Vision-Language-Action) es una política robótica de tipo VLA afinada por el usuario rony000013 para la competición Intel Physical AI Online Challenge, en la tarea concreta de preparar una mesa de cena. El modelo parte de la familia SmolVLA del ecosistema LeRobot y se ha ajustado sobre un dataset propio de demostraciones (`rony000013/dinner-table`) recogidas con dos brazos robóticos SO-101 de 6 grados de libertad cada uno, simulados en el motor físico MuJoCo. El resultado es un controlador que, a partir de observaciones visuales multicámara y de instrucciones en lenguaje natural, emite acciones motoras de 12 grados de libertad para manipulación bimanual.

El interés principal del repositorio no está en el modelo base, de unos 450 millones de parámetros, sino en el despliegue en hardware Intel: incluye variantes cuantizadas con OpenVINO y NNCF (INT8 y FP16/FP32), además de un export a ONNX del codificador visual. El autor publica medidas de latencia y throughput que sitúan la inferencia en CPU muy por debajo del presupuesto temporal del bucle de control (10 Hz, es decir, 100 ms por ciclo), con 3,03 ms de latencia media en contenedor Podman con oneDNN y AVX-512.

Se trata, por tanto, de una ficha relevante para quien trabaje en robótica de borde, physical AI o despliegue de políticas VLA en CPU, iGPU y NPU de Intel, más que para quienes busquen un modelo de lenguaje generativo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA, con torre de visión y política de acciones; detalles internos de capas no disponibles |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP32, FP16, INT8 (OpenVINO NNCF, post-training quantization) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch), OpenVINO IR (.xml/.bin), ONNX |

Variantes incluidas en el repositorio:

| Variante | Ruta / formato | Tamaño | Precisión | Hardware objetivo |
|---|---|---|---|---|
| SmolVLA 40k PyTorch (base) | Raíz (`model.safetensors`) | 1,19 GB | FP16 / FP32 | CPU Intel / host / CUDA |
| OpenVINO NNCF INT8 | `variations/openvino_int8/` | 25,8 MB | INT8 | Intel Core Ultra CPU / iGPU / NPU |
| OpenVINO FP16/FP32 IR | `variations/openvino_fp16/` | 101,4 MB | FP32 / FP16 | Runtimes de OpenVINO |
| ONNX Vision Model | `variations/onnx/` | ~346 MB | FP32 | Runtimes ONNX universales |

## Arquitectura y entrenamiento

El modelo es una política VLA de la familia SmolVLA integrada en LeRobot: combina un codificador visual que procesa observaciones de varias cámaras con una política que genera acciones motoras continuas para los dos brazos. La ficha del autor no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el tipo de decodificador de acciones, por lo que esos datos quedan como no disponibles. La variante publicada se identifica como «SmolVLA 40k», lo que sugiere un checkpoint tras 40.000 pasos de entrenamiento, aunque el autor no especifica el número de tokens, el tamaño efectivo del dataset ni la composición exacta de las demostraciones más allá del nombre `rony000013/dinner-table`.

El entrenamiento se realizó sobre demostraciones de manipulación bimanual con dos brazos SO-101 de 6 grados de libertad en MuJoCo, orientadas a la preparación de una mesa de cena. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación por preferencias, algo esperable en una política de imitación robótica. La innovación técnica destacable del repositorio es el pipeline de compresión y despliegue: cuantización post-entrenamiento con OpenVINO NNCF calibrada sobre fotogramas multicámara, que reduce la huella de la torre de visión 3,9 veces (de 101,4 MB a 25,8 MB) manteniendo una deriva cinemática media absoluta de solo 0,0310 rad (~1,7°) y una deriva máxima de 0,0981 rad sobre los 12 grados de libertad.

## Capacidades

- Generación de acciones motoras continuas para manipulación robótica bimanual con dos brazos SO-101 de 6 grados de libertad (12 DoF en total).
- Percepción visual multicámara como entrada para la política (calibración de la cuantización realizada sobre fotogramas de varias cámaras).
- Ejecución de tareas de preparación de mesa, incluyendo agarre de objetos, colocación y vertido estable de líquidos (el autor cita «fluid pouring stability» y preservación de contactos de agarre).
- Condicionamiento por lenguaje: el modelo se registra con idioma inglés y pertenece a la categoría vision-language-action, por lo que acepta instrucciones textuales junto con las observaciones visuales.
- Inferencia en tiempo real en CPU Intel, iGPU y NPU mediante OpenVINO, y en CUDA mediante PyTorch.
- Robustez frente a perturbaciones: supera una prueba de 10 semillas con perturbaciones de masa, posición (±2,5 cm) y fricción, con 100 % de éxito (10/10).
- Soporte de tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Modo de razonamiento explícito (thinking mode), visión general, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Preparación automatizada de mesa en entornos de restauración o domésticos: el modelo ejecuta la secuencia completa de colocación de vajilla y cubiertos sobre dos brazos SO-101, con un bucle de control de 10 Hz que la inferencia en CPU cubre con margen amplio.
- Despliegue en robótica de borde sobre Intel Core Ultra: la variante INT8 de 25,8 MB permite ejecutar la torre de visión en CPU, iGPU o NPU sin GPU dedicada, lo que habilita brazos robóticos autónomos con electrónica de bajo consumo.
- Investigación en manipulación bimanual: sirve como política de referencia reproducible en MuJoCo para comparar estrategias de coordinación entre dos brazos de 6 DoF.
- Vertido de líquidos y manipulación de contacto: la deriva cinemática medida (0,0310 rad de media) acota el error de trayectoria, lo que permite usar el modelo en tareas donde la estabilidad del vertido es crítica.
- Validación de pipelines de cuantización para robótica: el repositorio incluye artefactos OpenVINO INT8/FP16 y ONNX, útiles para medir el impacto de la compresión en la tasa de éxito de una tarea real.
- Benchmarking de latencia en hardware heterogéneo: el script `scripts/benchmark_intel.py` y las tablas publicadas permiten reproducir comparativas CPU, iGPU y CUDA en una misma carga de trabajo.
- Integración en cadenas de simulación a realidad: al estar entrenado sobre MuJoCo y exportado a formatos de inferencia portables, facilita el traslado de políticas simuladas a controladores reales sobre SO-101.
- Evaluación de robustez ante incertidumbre física: el protocolo de 10 semillas con perturbaciones de masa, posición y fricción puede reutilizarse como test estándar para otras políticas VLA.

## Benchmarks y rendimiento

Rendimiento de inferencia en hardware Intel, medido con `scripts/benchmark_intel.py` según el autor:

| Entorno de destino | Driver / backend | Precisión | Throughput | Latencia media | Mediana P50 |
|---|---|---|---|---|---|
| Contenedor Podman | OpenVINO / oneDNN (AVX-512) | FP16 | 289,34 FPS | 3,03 ms | 2,02 ms |
| CPU del host | OpenVINO con afinidad de hilos | FP16 | 221,37 FPS | 3,92 ms | 3,83 ms |
| GPU dedicada del host | PyTorch CUDA (RTX 4060) | FP16 | 179,09 FPS | 3,96 ms | 4,04 ms |
| Torre de visión OpenVINO INT8 | OpenVINO NNCF cuantizado | INT8 | 146,58 FPS | 6,38 ms | 6,56 ms |

El autor señala que el bucle de control del robot se ejecuta a 10 Hz (100 ms por ciclo), de modo que el modelo desplegado en CPU a 3,03 ms opera más de 28 veces más rápido que el requisito de tiempo real.

Verificación de la cuantización INT8:

| Métrica | Valor |
|---|---|
| Reducción de la huella de la torre de visión | 3,9× (101,4 MB → 25,8 MB) |
| Deriva cinemática media absoluta (12 DoF) | 0,0310 rad (~1,7°) |
| Deriva cinemática máxima | 0,0981 rad |

Robustez:

| Prueba | Resultado |
|---|---|
| Perturbaciones de 10 semillas (masa, posición ±2,5 cm, fricción) | 100 % de éxito (10/10) |

No se han publicado resultados en benchmarks estándar de robótica (Libero, SimplerEnv, CALVIN u otros) en la información disponible, ni métricas comparativas con otras políticas VLA.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base: aproximadamente 1,2 GB en FP16 y en torno a 2,4 GB en FP32, a partir del tamaño de `model.safetensors` (1,19 GB); no hay desglose de memoria de activaciones en la información disponible.
- Variante INT8 de OpenVINO: 25,8 MB de pesos para la torre de visión, apta para ejecución íntegra en CPU, iGPU o NPU de Intel Core Ultra sin memoria dedicada.
- GPU recomendadas según el autor: RTX 4060 como referencia CUDA medida (179,09 FPS, 3,96 ms de latencia media). No se publican medidas para A100, H100, RTX 4090 ni otras GPU.
- Compatibilidad con GPU de consumo: sí, el modelo cabe holgadamente en cualquier GPU de consumo actual; el autor aporta medidas directas en una RTX 4060.
- Opciones de despliegue: LeRobot con PyTorch (CPU o CUDA), OpenVINO Runtime (CPU, GPU, NPU), runtimes ONNX universales y contenedor Podman con OpenVINO y oneDNN. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput medidos: de 2,02 ms (P50, Podman con AVX-512) a 6,56 ms (P50, torre de visión INT8), con throughputs de 146,58 a 289,34 FPS según la configuración.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentación pública y no se han verificado contra los artefactos de este repositorio; se ofrecen solo como referencia de categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| intel-physical-ai-smolvla (esta ficha) | 450 M | No disponible | Apache 2.0 | HuggingFace, con variantes OpenVINO y ONNX | 289,34 FPS / 3,03 ms en CPU Intel; 100 % de éxito en 10 semillas con perturbaciones |
| SmolVLA base (familia, sin ajuste) | ~450 M | No disponible | Apache 2.0 | HuggingFace / LeRobot | No disponible para esta tarea |
| OpenVLA | ~7 B | No disponible | Licencia propia (uso comercial restringido según versión) | HuggingFace | No disponible |
| π0 (pi-zero) | ~3,3 B | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados de benchmarks comunes (Libero, SimplerEnv u otros) que permitan una comparación cuantitativa fiable entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El modelo se ha entrenado con un dataset propio de una única tarea (preparar una mesa de cena) y unos brazos concretos (SO-101 de 6 DoF en MuJoCo), por lo que su generalización a otras tareas, objetos o morfologías no está documentada.
- Riesgo de alucinación: aplicable en la parte de condicionamiento por lenguaje, pero no hay evaluación publicada sobre interpretación errónea de instrucciones.
- Contexto e idioma: no se documenta la ventana de contexto y el modelo solo declara inglés, lo que limita el uso de instrucciones en castellano u otros idiomas.
- Cifras de rendimiento no reproducibles de forma independiente: todas las medidas de latencia, throughput y éxito proceden del propio autor y no se han validado por terceros.
- Deriva cinemática tras cuantización: aunque pequeña (0,0310 rad de media, 0,0981 rad máxima), puede afectar a tareas de alta precisión con tolerancias inferiores a 2°.
- Dependencia de hardware: las variantes más eficientes (INT8, FP16 IR) requieren OpenVINO y, para máximo rendimiento, instrucciones AVX-512 en CPU Intel; en otras plataformas el rendimiento será distinto y no está medido.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de las dependencias (LeRobot, OpenVINO, componentes de SmolVLM) y del dataset asociado.
- Madurez del repositorio: 0 descargas y 0 «likes» en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Simulación frente a realidad: el entrenamiento se realizó en MuJoCo; no se documenta transferencia a brazos físicos ni el gap sim-to-real resultante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rony000013/intel-physical-ai-smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/rony000013/dinner-table
- LeRobot (framework de políticas): https://github.com/huggingface/lerobot
- OpenVINO (runtime de inferencia Intel): https://github.com/openvinotoolkit/openvino
- OpenVINO NNCF (cuantización): https://github.com/openvinotoolkit/nncf
- Búsqueda web: no se han encontrado enlaces adicionales relevantes sobre este modelo; los resultados devueltos correspondían a servicios sin relación con el contenido de la ficha.
