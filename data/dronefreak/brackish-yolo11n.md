# dronefreak/brackish-yolo11n

## Resumen

`dronefreak/brackish-yolo11n` es un detector de objetos YOLO11n (variante nano) afinado por el usuario dronefreak sobre el conjunto de datos Brackish Underwater, un benchmark de imágenes submarinas de agua salobre. El modelo parte de los pesos preentrenados de `Ultralytics/YOLO11` y se entrena y evalúa dentro de DetectionBench, un marco de trabajo orientado a comparar detectores modernos con recetas de entrenamiento y métricas idénticas. Su propósito es la detección de fauna marina en entornos submarinos: cangrejos, peces, medusas, camarones, peces pequeños y estrellas de mar.

Con 2.606.386 parámetros y 6,6 GFLOPs a 640 píxeles, es un modelo extremadamente ligero, pensado para inferencia en tiempo real en hardware modesto o embarcado. Su relevancia actual radica en que ofrece un punto de referencia reproducible dentro de DetectionBench, con métricas declaradas sobre el split de test (mAP@50 de 98,87 % y mAP@50-95 de 83,27 %), y en que cubre un nicho poco atendido: la visión por computador subacuática en aguas salobres, donde la turbidez, la refracción y la iluminación variable complican la detección.

La licencia AGPL-3.0 y el tamaño reducido del repositorio (0,0 GB según Hugging Face, con pesos en `best.pt`) condicionan su uso: es adecuado para investigación y prototipado, pero requiere revisar obligaciones de copyleft si se integra en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector de una etapa, familia Ultralytics YOLO11) |
| Parametros totales | 2.606.386 (2,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `best.pt`; no se documentan variantes GGUF/ONNX/TensorRT) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `best.pt` (PyTorch, cargable con Ultralytics); repo con safetensors según metadatos de Hugging Face |
| Resolución de entrada | 640 px (entrenamiento e inferencia) |
| Cómputo | 6,6 GFLOPs a 640 px |
| Tarea | object-detection |
| Clases | crab, fish, jellyfish, shrimp, small_fish, starfish |
| Dataset | dronefreak/Brackish (Brackish Underwater) |
| Framework | Ultralytics YOLO + DetectionBench |

## Arquitectura y entrenamiento

El modelo es un YOLO11n, la variante nano de la familia YOLO11 de Ultralytics: un detector de objetos de una sola etapa con backbone y cuello convolucionales y una cabeza de predicción densa, optimizado para bajo coste computacional (2,6 M de parámetros, 6,6 GFLOPs a 640 px). No emplea mecanismos de mezcla de expertos ni atención de largo alcance; su diseño prioriza latencia baja y despliegue en dispositivos con recursos limitados.

El ajuste fino se realizó con el toolkit DetectionBench sobre el dataset Brackish Underwater, con una configuración documentada: hasta 500 épocas (efectivamente entrenadas 500), paciencia de early stopping de 100, batch de 32, tamaño de imagen 640, optimizador automático, learning rate inicial de 0,001 y semilla 0. No se detalla en la información disponible la composición exacta del dataset, el número de tokens (no aplica) ni si hubo técnicas de aumento específicas más allá de las del pipeline de Ultralytics. Tampoco se documentan fases de RLHF/DPO, lógicamente improcedentes en un detector visual.

## Capacidades

- Detección de objetos en imágenes submarinas de agua salobre para seis clases: cangrejo, pez, medusa, camarón, pez pequeño y estrella de mar.
- Inferencia en tiempo real gracias a su reducido coste (2,6 M de parámetros, 6,6 GFLOPs a 640 px).
- Integración directa con la librería Ultralytics (`YOLO(weights).predict(...)`), incluyendo visualización de resultados y umbral de confianza configurable.
- Evaluación reproducible mediante el pipeline `detectionbench-evaluate`, con métricas estándar de detección (mAP@50, mAP@50-95, precisión, recall, F1).
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no se documentan modos de pensamiento, visión multimodal, audio ni otras funciones fuera de la detección de objetos.

## Casos de uso

- Monitorización de ecosistemas de agua salobre: el modelo puede procesar secuencias de cámaras subacuáticas y contar individuos por clase (cangrejos, peces, medusas), aprovechando su mAP@50 de 98,87 % para inventarios de fauna con revisión humana posterior.
- Vigilancia de acuicultura: detección de camarones y peces pequeños en estanques o viveros para estimar densidad y detectar anomalías, con inferencia en tiempo real en GPUs de gama media o dispositivos embebidos.
- Análisis de imágenes de drones o ROV submarinos: el modelo, entrenado sobre el dataset Brackish, es adecuado para procesar fotogramas capturados por vehículos no tripulados en aguas turbias, donde la precisión por clase es alta (cangrejo 99,5 % mAP@50, pez 99,4 %).
- Investigación en biología marina: uso como línea base reproducible dentro de DetectionBench para comparar recetas de entrenamiento y arquitecturas sobre el mismo dataset, con métricas estandarizadas y semilla fija.
- Clasificación y filtrado previo en pipelines de anotación: el detector puede preetiquetar imágenes submarinas para acelerar el etiquetado humano, especialmente en clases frecuentes como peces y cangrejos.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo nano, puede desplegarse en GPUs de consumo o incluso en CPU para pruebas de concepto, antes de escalar a variantes mayores (YOLO11x, YOLOv8m) si se requiere más precisión.
- Educación y divulgación: demostraciones interactivas de detección de fauna marina con `results[0].show()`, útiles en talleres y materiales didácticos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test del dataset Brackish Underwater (no verificados de forma independiente, `verified: false`):

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 98,87 |
| mAP@50-95 | 83,27 |
| Precision | 98,76 |
| Recall | 96,69 |
| F1 Score | 97,72 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| crab | 99,5 | 91,03 |
| fish | 99,4 | 87,55 |
| jellyfish | 97,02 | 72,19 |
| shrimp | 99,48 | 77,1 |
| small_fish | 98,31 | 72,61 |
| starfish | 99,5 | 99,17 |

Comparativa dentro del model zoo de DetectionBench sobre el mismo dataset:

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|
| YOLOv8s | 99,3 | 85,65 | 99,36 | 98,53 |
| YOLOv8m | 99,19 | 86,04 | 98,69 | 98,71 |
| YOLO26s | 99,1 | 85,77 | 99,45 | 97,83 |
| YOLO26n | 98,95 | 83,66 | 98,17 | 97,23 |
| YOLO11x | 98,89 | 86,3 | 98,84 | 98,25 |
| **YOLO11n (este modelo)** | **98,87** | **83,27** | **98,76** | **96,69** |
| YOLO26m | 98,74 | 85,93 | 98,74 | 97,32 |
| YOLOv8n | 98,41 | 83,01 | 99,51 | 96,95 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2,6 M de parámetros y 6,6 GFLOPs a 640 px, el modelo cabe holgadamente en menos de 1 GB de VRAM en FP32 y en torno a unos cientos de MB en FP16, aunque no se publican cifras oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; para despliegue en producción se puede usar desde una NVIDIA T4 o RTX 4090 hasta A100/H100 si se procesan muchos flujos en paralelo. En el extremo opuesto, es viable en GPUs de consumo e incluso en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual (RTX 30/40, e incluso modelos integrados), dado su tamaño nano.
- Opciones de despliegue: Ultralytics (PyTorch), exportación a ONNX/TensorRT/OpenVINO mediante las utilidades de Ultralytics (no documentada en la model card, pero estándar en la familia), y ejecución vía `huggingface_hub` + `ultralytics`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput estimados: no disponibles de forma oficial; por el perfil del modelo (nano, 6,6 GFLOPs), se espera latencia de milisegundos por imagen en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 (%) | mAP@50-95 (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n (este modelo) | 2,6 M | 98,87 | 83,27 | AGPL-3.0 | Hugging Face (dronefreak/brackish-yolo11n) |
| YOLOv8n | no disponible en la información | 98,41 | 83,01 | AGPL-3.0 (familia Ultralytics) | Hugging Face / Ultralytics |
| YOLO26n | no disponible en la información | 98,95 | 83,66 | no disponible | Hugging Face / Ultralytics |
| YOLOv8s | no disponible en la información | 99,3 | 85,65 | AGPL-3.0 (familia Ultralytics) | Hugging Face / Ultralytics |
| YOLO11x | no disponible en la información | 98,89 | 86,3 | AGPL-3.0 (familia Ultralytics) | Hugging Face / Ultralytics |

La comparación se limita al mismo dataset y pipeline (DetectionBench); no se dispone de datos de parámetros ni licencias de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el modelo está entrenado exclusivamente sobre imágenes submarinas de agua salobre del dataset Brackish; su rendimiento fuera de ese dominio (imágenes aéreas, terrestres, otros tipos de agua) no está validado y probablemente sea deficiente.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; proceden del autor y no de una evaluación independiente.
- Clases con bajo rendimiento relativo: jellyfish (mAP@50-95 72,19 %), small_fish (72,61 %) y shrimp (77,1 %) muestran una caída notable frente a starfish (99,17 %) y crab (91,03 %), lo que sugiere dificultades en objetos pequeños, translúcidos o poco contrastados.
- Riesgo de falsos positivos y negativos en condiciones de turbidez, baja iluminación o refracción, típicas de la fotografía subacuática; se recomienda umbral de confianza ajustado y revisión humana en aplicaciones críticas.
- Sesgos: no se documenta la composición del dataset ni su distribución geográfica o de especies, por lo que no es posible evaluar sesgos de representación.
- Licencia AGPL-3.0: el uso comercial o la integración en servicios en red puede obligar a liberar el código derivado bajo la misma licencia; es imprescindible revisar las obligaciones de copyleft antes de desplegar en producción.
- Sin soporte de texto ni multimodal: no es un modelo de lenguaje, por lo que no admite prompts, tool calling ni razonamiento multi-paso.
- Repositorio de tamaño 0,0 GB y solo 19 descargas y 3 likes en el momento de la consulta: ecosistema muy pequeño, con poca validación comunitaria y soporte limitado.
- No se documentan cuantizaciones ni exportaciones oficiales; cualquier optimización para despliegue (ONNX, TensorRT) corre a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/brackish-yolo11n
- Dataset Brackish: https://huggingface.co/datasets/dronefreak/Brackish
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base YOLO11 (Ultralytics): https://huggingface.co/Ultralytics/YOLO11
- Paper de referencia citado en los metadatos (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
