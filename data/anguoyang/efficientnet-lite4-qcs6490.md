# anguoyang/efficientnet-lite4-qcs6490

## Resumen

EfficientNet-Lite4 es una red neuronal convolucional para clasificación de imágenes en 1.000 clases (ImageNet), desarrollada originalmente por Google como parte de la familia EfficientNet-Lite, optimizada para inferencia en dispositivos de borde. Este repositorio concreto, publicado por el usuario anguoyang, no redistribuye pesos ni artefactos compilados: es una ficha de medición que documenta por primera vez el rendimiento de EfficientNet-Lite4 sobre el SoC Qualcomm QCS6490 en la placa Dragonwing RB3 Gen 2 Vision Kit.

El interés de la publicación es acotado pero relevante para quien despliega visión por computadora en hardware Qualcomm: aporta un dato empírico de latencia (28,0 ms por inferencia con entrada 1×3×300×300 y salida 1×1.000 logits) que no existía en el `perf.yaml` de `qai-hub-models` 0.66.0. La medición se realizó con el runtime QNN de Qualcomm AI Hub, en precisión fp32 sobre ONNX, sin cuantización explícita.

No se trata, por tanto, de un modelo entrenado o ajustado por el autor, sino de un registro reproducible de metodología y resultados dentro de la serie "Edge AI on Qualcomm measured-recipes". La información disponible sobre arquitectura interna, datos de entrenamiento o licencia del artefacto publicado es mínima; la licencia Apache-2.0 mencionada corresponde al modelo upstream de Google, no a este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-Lite4 (CNN con compound scaling, familia EfficientNet-Lite) |
| Parámetros totales | no disponible (el ONNX exportado ocupa 51.860.633 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 1×3×300×300) |
| Tipos de cuantización | la medición publicada es fp32 sin cuantización explícita; el modelo upstream admite cuantización int8 vía AI Hub, pero no se documenta aquí |
| Idiomas soportados | no aplica (clasificación de imágenes ImageNet, 1.000 clases) |
| Licencia | no disponible para este repositorio; el modelo upstream EfficientNet-Lite4 es Apache-2.0 |
| Formato de pesos | no se distribuyen pesos; el perfil se hizo sobre ONNX exportado desde `qai-hub-models` 0.66.0 |

## Arquitectura y entrenamiento

EfficientNet-Lite4 pertenece a la familia EfficientNet-Lite de Google, una variante de EfficientNet orientada a inferencia en dispositivos de borde. Emplea convoluciones estándar y depthwise separables con funciones de activación ReLU6 en lugar de Swish, y prescinde de operaciones no soportadas por aceleradores móviles (por ejemplo, squeeze-and-excitation). El escalado compuesto de profundidad, anchura y resolución da lugar a una entrada de 300×300 píxeles para la variante Lite4, que produce 1.000 logits de clasificación ImageNet.

Este repositorio no documenta datos de entrenamiento, número de tokens (no aplica), composición del dataset ni procesos de RLHF/DPO. Tampoco describe innovaciones técnicas propias: el autor se limita a perfilar el grafo ONNX exportado desde la definición `efficientnet_lite4` de `qai-hub-models` 0.66.0 mediante la API de Qualcomm AI Hub (`submit_inference_job(..., profile=True)`), leyendo el campo `execution_summary.estimated_inference_time`. La corrección metodológica destacada es que el harness de barrido se ajustó para alimentar las entradas en formato NCHW, como espera el modelo PyTorch original.

## Capacidades

- Clasificación de imágenes en 1.000 clases del dataset ImageNet.
- Entrada fija de 1×3×300×300 píxeles en formato NCHW.
- Salida de 1×1.000 logits (sin capa softmax documentada en el perfil).
- Inferencia en dispositivo de borde sobre el SoC Qualcomm QCS6490 con runtime QNN.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Clasificación de imágenes en tiempo real en el borde: con 28,0 ms por inferencia en QCS6490, el modelo permite procesar aproximadamente 35 imágenes por segundo en un flujo continuo, adecuado para inspección visual en cámara industrial o domótica.
- Preetiquetado en pipelines de datos: usar el modelo como clasificador rápido para filtrar o etiquetar grandes lotes de imágenes antes de un modelo mayor, reduciendo coste computacional.
- Visión embebida en robótica móvil: integración en la placa Dragonwing RB3 Gen 2 Vision Kit para tareas de reconocimiento de objetos en navegación autónoma con presupuesto de latencia estricto.
- Benchmarking de hardware Qualcomm: servir como referencia reproducible de latencia para comparar QCS6490 con otros SoC de la serie QCS en despliegues de visión.
- Detección de anomalías en línea de producción: clasificación de piezas o productos en categorías predefinidas con inferencia local, sin dependencia de la nube.
- Puerta de entrada en sistemas de cámaras inteligentes: primer clasificador que decide si una imagen merece procesamiento posterior por un modelo más pesado, optimizando el consumo energético.
- Validación de pipelines de compilación QNN: usar el perfil publicado (job IDs `jpvn8mdmg` y `jg9qr2mvp`) como caso de prueba para verificar que un toolchain de AI Hub reproduce latencias similares.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 28,0 ms (28.014 µs) |
| Entrada | 1×3×300×300 |
| Salida | 1×1.000 logits |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precisión | fp32 ONNX, opciones por defecto de AI Hub (sin cuantización explícita) |
| Fecha de medición | 2026-11-19 |
| Job de compilación | `jpvn8mdmg` |
| Job de perfilado | `jg9qr2mvp` |

No se han publicado resultados de benchmarks de precisión (top-1, top-5) en la información disponible. La cifra de 28,0 ms es una estimación por grafo del perfilado, no una latencia extremo a extremo de aplicación.

## Requisitos de hardware

- Hardware de referencia: Dragonwing RB3 Gen 2 Vision Kit con SoC Qualcomm QCS6490.
- Runtime: QNN de Qualcomm AI Hub; no se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de visión de este tipo).
- VRAM estimada: no disponible; el modelo opera sobre memoria unificada del SoC, no sobre GPU discreta.
- GPU recomendadas: no aplica; el despliegue objetivo es el acelerador Hexagon/NPU del QCS6490.
- Compatibilidad con GPU de consumo: no documentada en esta ficha.
- Latencia: 28,0 ms por inferencia en fp32 sobre QCS6490 (estimación de perfilado por grafo).
- Throughput estimado: aproximadamente 35 inferencias por segundo, derivado de la latencia publicada.
- Tamaño del artefacto ONNX: 51.860.633 bytes.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-Lite4 (este perfil) | no disponible | 300×300 | no aplica | upstream Apache-2.0; repositorio sin licencia declarada | solo medición, sin pesos |
| EfficientNet-Lite0 | no disponible | 224×224 | no aplica | Apache-2.0 | pesos públicos en TensorFlow Hub / AI Hub |
| MobileNetV3 | no disponible | 224×224 | no aplica | Apache-2.0 | pesos públicos |
| ResNet-50 | no disponible | 224×224 | no aplica | BSD-3 / Apache-2.0 según implementación | pesos públicos |

No se dispone de datos de rendimiento comparables en la información proporcionada para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos compilados; solo publica números y metodología. No es directamente desplegable.
- No se declara licencia para este repositorio concreto; la Apache-2.0 mencionada aplica al modelo upstream de Google, no a la ficha de medición.
- La cifra de 28,0 ms es una estimación de perfilado por grafo, no una latencia extremo a extremo; el rendimiento real en aplicación puede diferir.
- La medición es en fp32 sin cuantización explícita; despliegues con int8 pueden variar sustancialmente en latencia y precisión.
- No se documentan métricas de precisión (top-1/top-5) ni evaluación sobre datasets distintos de ImageNet.
- Riesgo de sesgo inherente al dataset ImageNet (1.000 clases con distribución y etiquetas históricamente criticadas).
- No apto para tareas generativas, razonamiento, código, matemáticas ni procesamiento de lenguaje.
- La fecha de creación del repositorio (2026-11-18) y la de medición (2026-11-19) son posteriores a la fecha actual de redacción, lo que conviene verificar antes de citar el dato en producción.
- Sin descargas ni likes registrados en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/efficientnet-lite4-qcs6490
- Repositorio qcs-bench (serie de mediciones): https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub Models (definición `efficientnet_lite4`, versión 0.66.0): no se proporciona URL directa en la información disponible
- Modelo upstream EfficientNet-Lite4 (Google, Apache-2.0): no se proporciona URL directa en la información disponible
