# Fabrizio99/elf-binaries-models

## Resumen

El repositorio `Fabrizio99/elf-binaries-models` contiene los checkpoints de un proyecto de detección y clasificación de malware ELF ARM32, desarrollado por Fabrizio (Fabrizio99) como parte del trabajo final *fsoppelsa-malware* (unipa-prova-finale). El enfoque es inusual: convierte los binarios ELF en imágenes (triplets de bytes RGB) y aplica modelos de visión por computadora, concretamente un MobileNetV4 para la detección binaria (malware vs. benigno) y un Vision Transformer (ViT-Small) para la clasificación en familias (mirai, gafgyt, other).

Este proyecto es relevante en el ámbito de la seguridad informática, ya que aborda el análisis de malware para arquitecturas ARM32, comunes en dispositivos IoT. La publicación de estos checkpoints permite reproducir y evaluar el pipeline de detección sin necesidad de reentrenar desde cero. Sin embargo, la información disponible es limitada: no se especifica licencia, idiomas ni detalles de hardware, y el repositorio tiene cero descargas y cero likes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 (detección) y ViT-Small (clasificación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El proyecto consta de dos fases diferenciadas. La primera, de detección, utiliza un MobileNetV4 (variante `mobilenetv4_conv_small.e2400_r224_in1k` de timm) con una cabeza de una sola salida, entrenado con imágenes de triplets de bytes RGB (`rgb_byte_triplets`). El entrenamiento se realiza en dos etapas: primero se congela el backbone y se entrena solo la cabeza, y después se hace fine-tuning completo con AdamW y función de pérdida BCEWithLogitsLoss. El split de datos es cluster-disjoint 70/15/15.

La segunda fase, de clasificación de familias, emplea un ViT-Small (denominado "Sherlock") entrenado desde cero (sin pretraining en ImageNet) sobre imágenes RGB replicadas (`rgb_replicated`), con normalización media 0.5 y desviación 0.5. La pérdida es CrossEntropy con pesos inversos a la frecuencia de cada clase, y también se entrena en dos fases (cabeza y completa). Los detalles completos se documentan en la tesis asociada al proyecto.

## Capacidades

- Detección binaria de malware ELF ARM32 (clasificación malware/benigno) con alta precisión (0.9984 de accuracy en el checkpoint).
- Clasificación en familias específicas: mirai, gafgyt y other, con accuracy de 0.9833 y macro-F1 de 0.9432.
- Procesamiento de binarios ELF representados como imágenes RGB, lo que permite aplicar arquitecturas de visión estándar.
- Entrenamiento con split cluster-disjoint, lo que reduce el riesgo de fuga de datos entre conjuntos de entrenamiento y validación.
- No soporta generación de texto, razonamiento, tool calling ni otras capacidades propias de modelos de lenguaje; es un modelo puramente discriminativo para visión.

## Casos de uso

- Análisis estático de malware en dispositivos IoT: el modelo puede integrarse en un pipeline de escaneo de firmware ARM32 para detectar binarios maliciosos antes de su ejecución.
- Clasificación automática de variantes de malware: una vez detectado un binario como malicioso, el clasificador de familias permite identificar si pertenece a mirai, gafgyt u otra categoría, facilitando la respuesta de los equipos de seguridad.
- Investigación académica en detección de malware mediante técnicas de visión: el repositorio sirve como punto de partida para reproducir experimentos y comparar con otros enfoques.
- Desarrollo de herramientas CLI de análisis: el script `malware_scan.py` mencionado en el README consume estos checkpoints, permitiendo integrar la detección en flujos de trabajo de línea de comandos.
- Auditoría de seguridad en entornos embebidos: se puede utilizar para escanear binarios ELF ARM32 en sistemas embebidos o routers, donde los recursos son limitados pero el modelo es ligero.
- Generación de datasets etiquetados: los checkpoints pueden emplearse para preetiquetar grandes colecciones de binarios, acelerando la creación de conjuntos de entrenamiento más amplios.

## Benchmarks y rendimiento

Según los `metrics.json` incluidos en el repositorio:

| Fase | Métrica | Valor |
|---|---|---|
| Detección (MobileNetV4) | Accuracy | 0.9984 |
| Detección (MobileNetV4) | Precision | 1.0 |
| Detección (MobileNetV4) | Recall | 0.9967 |
| Detección (MobileNetV4) | F1 | 0.9984 |
| Clasificación (ViT-Small) | Accuracy | 0.9833 |
| Clasificación (ViT-Small) | Macro-F1 | 0.9432 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Los modelos son ligeros: MobileNetV4 `conv_small` y ViT-Small son arquitecturas eficientes, diseñadas para funcionar en dispositivos con recursos limitados.
- No se especifican requisitos de VRAM en la documentación, pero por el tamaño de los checkpoints (0.1 GB el repositorio completo) se estima que caben en GPUs de consumo como una NVIDIA GTX 1060 o superior, e incluso en CPU para inferencia puntual.
- Para despliegue en producción, se puede utilizar PyTorch estándar o convertir a ONNX para optimización. No se mencionan integraciones con vLLM, llama.cpp u otras herramientas de inferencia de LLM, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware; al ser modelos de visión pequeños, la inferencia en GPU moderna (RTX 3090 o superior) debería ser de milisegundos por imagen.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El enfoque de representar binarios ELF como imágenes y usar CNNs/ViTs es poco común; alternativas típicas en detección de malware ELF suelen basarse en análisis estático de características o en modelos de secuencias de bytes, pero no se han encontrado referencias directas en los datos disponibles.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para binarios ELF ARM32; su rendimiento en otras arquitecturas (x86, x64) o formatos (PE, Mach-O) no está garantizado.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar al autor antes de utilizarlo en entornos productivos.
- Los datos de entrenamiento no se detallan (número de muestras, composición, origen), por lo que no se puede evaluar la representatividad del conjunto ni el riesgo de sesgos.
- El riesgo de alucinación no aplica al ser un modelo discriminativo, pero sí existe la posibilidad de falsos positivos o negativos en la detección, aunque las métricas reportadas son altas.
- La clasificación en solo tres familias (mirai, gafgyt, other) puede ser insuficiente para cubrir la diversidad real de malware ELF ARM32.
- No se proporcionan instrucciones claras de instalación ni de uso del script `malware_scan.py`; la reproducibilidad depende del repositorio fuente no enlazado directamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Fabrizio99/elf-binaries-models
- Perfil del autor: https://huggingface.co/Fabrizio99
- Referencia al proyecto fuente (mencionado en el README): *fsoppelsa-malware* (unipa-prova-finale) — no se proporciona URL directa.
