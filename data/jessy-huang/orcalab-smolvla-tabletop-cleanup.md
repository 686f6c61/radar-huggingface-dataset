# Jessy-Huang/orcalab-smolvla-tabletop-cleanup

## Resumen

OrcaLab SmolVLA Tabletop Cleanup es una política robótica de imitación desarrollada por Jessy-Huang para el proyecto OrcaLab de un robot de servicio bimanual. El modelo recibe tres flujos de imagen RGB, el estado del robot y una instrucción textual de tarea (por ejemplo, `pick the medbox`), y predice la pose objetivo del brazo activo junto con el comando de pinza. Está construido sobre la arquitectura SmolVLA de LeRobot, con el backbone visión-lenguaje SmolVLM2-500M-Video-Instruct de HuggingFaceTB.

El checkpoint publicado corresponde al paso 50.000 de entrenamiento y se entrenó sobre un dataset propio de 50 episodios y 52.542 fotogramas de demostraciones en simulación para tareas de recogida de objetos en una mesa. No es un modelo de lenguaje general ni un asistente conversacional: es un componente de control dentro de un pipeline mayor que incluye parseo de instrucciones en chino, navegación por ruta fija, calibración de coordenadas y control en simulación.

Su relevancia es acotada pero clara para quien trabaje en manipulación de mesa con VLA pequeños: demuestra un flujo completo de imitación con un backbone de 500M de parámetros, licencia MIT y artefactos de preprocesado completos. La model card advierte explícitamente de que no hay validación independiente ni métricas de éxito publicadas, por lo que debe tratarse como un snapshot reproducible más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (política de imitación) con backbone visión-lenguaje SmolVLM2-500M-Video-Instruct |
| Parámetros totales | 450.076.896 elementos tensoriales (mezcla de BF16 y FP32) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa tres imágenes de cámara, estado y texto de tarea; no se documenta ventana de contexto) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors con tensores BF16 y FP32) |
| Idiomas soportados | en, zh (etiquetas de idioma del repo; la instrucción de tarea en la demo es `pick the medbox`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) más JSON de configuración y procesadores; tokenizer incluido en el repo |

Otros datos relevantes: dimensión de estado real de 44 (con `max_state_dim=64` y padding interno), acción de 8 dimensiones (xyz 3 + cuaternión xyzw 4 + pinza 1), snapshot de entrenamiento `050000`, batch size 8, seed 1000, tamaño de repo 0,9 GB, y backbone externo de aproximadamente 1,9 GiB que no se redistribuye.

## Arquitectura y entrenamiento

La política sigue el diseño SmolVLA de LeRobot: un backbone visión-lenguaje SmolVLM2-500M-Video-Instruct que codifica las tres vistas de cámara (left→camera1, right→camera2, head→camera3) junto con el texto de la tarea, y una cabeza de acción que produce un vector de 8 dimensiones (posición xyz, orientación en cuaternión xyzw y apertura de pinza). El estado del robot se inyecta con dimensión real de 44 y se rellena hasta `max_state_dim=64` antes de entrar en la política. El repo incluye preprocesador, postprocesador, normalizador y desnormalizador como safetensors separados, además del tokenizer de la instrucción de tarea.

El entrenamiento es de imitación supervisada sobre el dataset `Jessy-Huang/orcalab-tabletop-cleanup`, con 50 episodios y 52.542 fotogramas de demostraciones en simulación. La configuración registrada indica 50.000 pasos, batch size 8, seed 1000 y reanudación desde un snapshot `010000` que no se incluye en el repo. No hay partición de validación ni de test, no se publican curvas de entrenamiento, estados del optimizador ni del RNG, y la model card indica explícitamente que no es posible reproducir el proceso de entrenamiento exacto a partir de los ficheros publicados. Tampoco se documenta RLHF, DPO ni ninguna fase de ajuste por preferencias.

## Capacidades

- Predicción de acciones de manipulación de mesa: pose del brazo activo en xyz más cuaternión xyzw y comando de pinza, en un vector de 8 dimensiones.
- Percepción multimodal con tres cámaras RGB simultáneas (izquierda, derecha y cabeza), con un mapeo de canales fijo que no debe alterarse.
- Condicionamiento por instrucción textual de tarea, con ejemplos del tipo `pick the medbox`; el parseo de instrucciones en chino lo realiza el código acompañante, no el modelo.
- Selección implícita del brazo activo dentro del flujo de control bimanual definido por el proyecto.
- Integración con el stack LeRobot para carga de políticas y ejecución de rollouts en simulación.
- No dispone de tool calling, function calling, razonamiento multi-paso explícito, modo thinking, visión general, audio ni generación de texto libre.

## Casos de uso

- Investigación en imitación visomotora con VLA pequeños: sirve como referencia reproducible de un pipeline SmolVLA completo, con procesadores, normalizadores y tokenizer incluidos, para estudiar cómo se comporta una política de 450M de parámetros en tareas de recogida.
- Prototipado de recogida de objetos en simulación: el modelo predice la pose y la pinza para llevar un objeto concreto a una cesta dentro de una escena de mesa controlada, lo que permite iterar sobre el controlador sin entrenar desde cero.
- Evaluación de backbones visión-lenguaje en robótica: al estar construido sobre SmolVLM2-500M, permite comparar el efecto del backbone en la calidad de las políticas de imitación manteniendo el resto del pipeline.
- Docencia y demostraciones de VLA: el repo incluye consola web, registro de tareas y utilidades de captura de datos, lo que facilita montar una demo de extremo a extremo en un laboratorio con OrcaLab/OrcaGym.
- Base para fine-tuning en dominios de mesa similares: al ser MIT y estar en LeRobot, se puede reentrenar con un dataset propio de pocas decenas de episodios para nuevas categorías de objetos, siempre que se mantenga el esquema de tres cámaras y el formato de acción.
- Replicación de experimentos de simulación a real: el flujo de calibración de coordenadas y el puente de estado de 44 dimensiones documentados en el código sirven de plantilla para trasladar la política a un robot físico con la misma configuración de sensores, aunque el autor no declara resultados en hardware real.
- Análisis de robustez y calibración: útil para estudiar cómo afectan cambios en la normalización, el padding de estado o el orden de cámaras a las predicciones, dado que la model card documenta estas dependencias de forma explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el conjunto de entrenamiento no tiene partición de validación ni de test y que esta versión no declara tasas de éxito, comportamiento en robot real ni generalización a escenas no vistas. El único control de integridad mencionado es que los tensores son legibles y no contienen NaN ni Inf, lo cual no equivale a una validación funcional de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 0,9 GB y el backbone externo unos 1,9 GiB; en BF16/FP16 se puede estimar en torno a 2-3 GB para pesos, más el coste de activaciones de tres cámaras y del codificador visual, no cuantificado en la documentación.
- GPU recomendadas: no disponible en la información proporcionada; la configuración de preprocesado está fijada a CUDA, por lo que se asume una GPU NVIDIA como entorno previsto.
- GPU de consumo: no confirmado. Por tamaño de pesos, una RTX 3060 de 12 GB o superior debería albergar el modelo, pero el autor no publica requisitos ni pruebas en consumer.
- Despliegue: el proyecto usa LeRobot y su runner `scripts/train/rollout_smolvla.py`, además de las entradas web y de línea de comandos del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la model card advierte que los ejemplos genéricos de LeRobot/SO-101 de Hugging Face no aplican a este flujo bimanual.
- Latencia y throughput: no disponibles.
- Nota de compatibilidad: ejecutar en CPU requiere resolver la dependencia CUDA del preprocesador; pasar `--device cpu` no garantiza eliminar esa dependencia según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OrcaLab SmolVLA Tabletop Cleanup | 450.076.896 elementos tensoriales | no disponible | Manipulación de mesa bimanual en simulación | MIT | Hugging Face y ModelScope |
| SmolVLA (LeRobot, referencia genérica) | no disponible en la información proporcionada | no disponible | Políticas VLA de imitación | no disponible | LeRobot |
| SmolVLM2-500M-Video-Instruct | backbone de 500M (aprox.) | no disponible | Comprensión visión-lenguaje-vídeo | no disponible | Hugging Face (HuggingFaceTB) |
| Políticas de imitación específicas por tarea (genéricas) | variable | no disponible | Manipulación de mesa | variable | variable |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados de este checkpoint ni métricas equivalentes de los modelos de referencia en la información proporcionada. La comparación más informativa es estructural: este modelo es un fine-tuning de política sobre SmolVLM2-500M, no un modelo de propósito general, por lo que su comparación natural son otras políticas de imitación entrenadas con LeRobot sobre datasets de decenas de episodios.

## Limitaciones y advertencias

- No hay partición de validación ni de test, ni tasas de éxito publicadas; el autor no declara rendimiento en robot real ni generalización a escenas no vistas.
- Dependencia fuerte del entorno: el modelo asume una escena fija, un puente de coordenadas concreto y el código de control del proyecto; no incluye navegación genérica, comprensión de lenguaje natural en chino ni estrategia de transporte de cesta entre mesas.
- El preprocesador está fijado a CUDA; el despliegue en CPU no está resuelto de forma garantizada.
- Inconsistencia documentada entre la metadata de features del procesador (`state shape=[6]`) y el normalizador real de 44 dimensiones, con padding interno a 64; modificar el orden de cámaras o las estadísticas de normalización invalida el comportamiento esperado.
- Parte de las desviaciones estándar del dataset no coinciden con un recálculo completo; cambiar las estadísticas exige revalidar el modelo.
- No se incluyen el snapshot inicial `010000`, el optimizador, el estado del RNG ni los registros completos de entrenamiento, por lo que no se puede reanudar el entrenamiento de forma exacta.
- Riesgo de alucinación en el sentido de predicciones de acción no válidas fuera de la distribución de entrenamiento; no hay mecanismo de abstención ni de detección de fallo.
- Sesgos: no evaluados ni documentados; al entrenarse solo con demostraciones en simulación, puede heredar sesgos de la escena, de las posiciones de objeto y del estilo de teleoperación.
- Licencia MIT permite uso comercial del modelo y del código, pero los assets de simulación no se incluyen y mantienen sus licencias originales; el backbone SmolVLM2 conserva su propia licencia.
- El repo no redistribuye el backbone de aproximadamente 1,9 GiB; hay que descargarlo por separado y verificar los hashes de `BACKBONE.json`.
- La model card señala problemas conocidos de configuración, instalación de assets y versiones de dependencias, documentados en `docs/CONFIG_REVIEW_20261103.md`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jessy-Huang/orcalab-smolvla-tabletop-cleanup
- Modelo en ModelScope: https://modelscope.cn/models/jessy888/orcalab-smolvla-tabletop-cleanup
- Dataset en Hugging Face: https://huggingface.co/datasets/Jessy-Huang/orcalab-tabletop-cleanup
- Dataset en ModelScope: https://modelscope.cn/datasets/jessy888/orcalab-tabletop-cleanup
- Código en GitHub: https://github.com/Jessy-Huang/orcalab-service-robot
- Código en Gitee: https://gitee.com/jessy-huang/orcalab-service-robot
- Registro de configuración y compatibilidad: https://github.com/Jessy-Huang/orcalab-service-robot/blob/main/docs/CONFIG_REVIEW_20261103.md
- Backbone SmolVLM2-500M-Video-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- OrcaLab / Orca3D (松应科技): https://www.orca3d.cn/
