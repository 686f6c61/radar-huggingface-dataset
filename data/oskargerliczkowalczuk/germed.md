# oskargerliczkowalczuk/germed

## Resumen

GerMed-Mobile es un modelo de visión por computador para clasificación de imágenes dermatológicas, desarrollado por Oskar Gerlicz-Kowalczuk (Germaz Studio). Su objetivo es el triaje de lesiones cutáneas (melanoma, carcinoma basocelular, queratosis actínica frente a nevus y queratosis benignas) directamente en dispositivos de baja potencia, sin necesidad de conectividad ni de transferir datos de pacientes a servidores externos. Está empaquetado en formato ONNX y pensado para su ejecución offline en smartphones y hardware ARM.

El modelo se basa en una arquitectura MobileNetV4, disponible en dos variantes: FP32 (32,1 MB) e INT8 (8,32 MB). Se entrenó y validó sobre 37.747 imágenes clínicas de lesiones cutáneas, combinando datos con verdad histopatológica (HAM10000) y fotografías reales de smartphone (ISIC 2024). El autor reporta un ROC-AUC de 0,9566 y un recall del 97,64% en el umbral operativo de triaje.

Su rasgo diferencial es el modo de "pensamiento" clínico: además de la probabilidad de malignidad, expone cabezas auxiliares multitarea que estiman cuatro criterios del protocolo dermatológico ABCDE (asimetría, irregularidad de borde, variación de color y complejidad de patrón), lo que aporta cierta interpretabilidad a la predicción. La licencia es GPL-3.0 y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV4 (red neuronal convolucional para clasificación de imágenes) con cabezas auxiliares multitarea |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256×256 píxeles) |
| Tipos de cuantización | FP32 e INT8 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (`germed_mobile_v4_fp32.onnx`, `germed_mobile_v4_int8.onnx`) |

## Arquitectura y entrenamiento

GerMed-Mobile es una CNN de clasificación de imágenes basada en MobileNetV4, una familia de arquitecturas diseñada para eficiencia en dispositivos móviles. El modelo incorpora varias cabezas de salida: una principal que estima la probabilidad de malignidad y cuatro auxiliares que puntúan los criterios ABCDE (asimetría, borde, color y patrón). La entrada es una imagen RGB redimensionada a 256×256, normalizada con media y desviación estándar de ImageNet.

El entrenamiento se realizó sobre 37.747 imágenes de lesiones cutáneas, fusionando HAM10000 (con etiquetas histopatológicas) e ISIC 2024 (fotografías de smartphone en condiciones reales). El autor indica el uso de Asymmetric Focal Loss para suprimir falsos negativos, lo que explica el alto recall reportado en el umbral de triaje. No se detalla en la información disponible el número de épocas, el esquema de aumentación de datos ni si hubo fases de ajuste fino adicionales.

## Capacidades

- Clasificación binaria/multiclase de lesiones cutáneas: melanoma, carcinoma basocelular, queratosis actínica frente a nevus y queratosis benignas.
- Salida de probabilidad de malignidad con estratificación en tres niveles de riesgo (crítico ≥65%, moderado 40-64,9%, bajo <40%).
- Modo de "pensamiento" clínico con puntuaciones auxiliares para los criterios ABCDE: asimetría, irregularidad de borde, variación de color y complejidad de patrón.
- Inferencia 100% local y offline, sin dependencia de servicios en la nube.
- Ejecución en dispositivos de baja potencia: el autor reporta más de 60 FPS en smartphones con ARM Cortex para la variante INT8.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües (es un modelo puramente de visión).

## Casos de uso

- Triaje dermatológico en atención primaria: un médico de familia puede capturar una imagen de la lesión con el smartphone y obtener una probabilidad de malignidad con recomendación de derivación, gracias a la inferencia offline y al reducido tamaño del modelo.
- Screening en regiones con recursos limitados: al ejecutarse en dispositivos ARM sin conectividad, permite desplegar herramientas de cribado en zonas rurales o con infraestructura sanitaria escasa.
- Aplicaciones móviles de autoexamen: integrado en una app, el modelo puede alertar al usuario sobre lesiones sospechosas y sugerir consulta dermatológica, con el modelo INT8 de 8,32 MB embebido en el binario.
- Segunda opinión asistida en consulta: el desglose ABCDE proporciona al clínico una justificación parcial de la predicción, útil para contrastar con la exploración visual y la dermatoscopia.
- Investigación en visión médica: como baseline ligero y reproducible (ONNX, GPL-3.0) para experimentos de clasificación de lesiones cutáneas en entornos con hardware limitado.
- Monitorización de lesiones en seguimiento: comparación de capturas seriadas de una misma lesión para detectar cambios en las puntuaciones ABCDE a lo largo del tiempo.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| ROC-AUC | 0,9566 | Particiones de validación independientes |
| Recall (sensibilidad) | 97,64% | Umbral operativo de triaje clínico |
| Throughput | >60 FPS | Smartphone ARM Cortex (variante INT8) |
| Tamaño FP32 | 32,1 MB | `germed_mobile_v4_fp32.onnx` |
| Tamaño INT8 | 8,32 MB | `germed_mobile_v4_int8.onnx` |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval u otros benchmarks estándar no aplican a este tipo de modelo), ni métricas desagregadas por clase, matriz de confusión o intervalos de confianza.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo es tan pequeño (8,32-32,1 MB) que cabe holgadamente en la memoria de cualquier dispositivo, incluidos móviles de gama baja.
- GPU recomendadas: no requiere GPU; está diseñado para CPU y aceleradores móviles (ARM Cortex, NPU de smartphone). En servidor puede ejecutarse en CPU convencional.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU sin aceleración.
- Opciones de despliegue: ONNX Runtime (Python, C++, móvil), integración en apps Android/iOS mediante las builds móviles de ONNX Runtime.
- Latencia y throughput: el autor reporta más de 60 FPS en smartphones ARM Cortex con la variante INT8; no se especifican latencias para otras plataformas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otros clasificadores dermatológicos ligeros o modelos de mayor tamaño como variantes de EfficientNet o Vision Transformers aplicados a ISIC). Por tanto, la comparativa cuantitativa se indica como no disponible.

| Modelo | Parámetros | Contexto/entrada | ROC-AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GerMed-Mobile | no disponible | Imagen 256×256 | 0,9566 | GPL-3.0 | Hugging Face (ONNX) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un dispositivo de diagnóstico autónomo: el propio autor lo define como herramienta asistencial de triaje y cribado; toda lesión sospechosa debe ser evaluada por un dermatólogo titulado.
- Riesgo de falsos positivos y negativos: aunque el recall reportado es alto, no se publican matrices de confusión ni métricas por clase, lo que impide evaluar el comportamiento en subgrupos.
- Sesgos potenciales: los datos de entrenamiento (HAM10000, ISIC 2024) pueden no representar toda la diversidad de tonos de piel, edades o condiciones de iluminación; no se documenta análisis de sesgo.
- Dependencia de la calidad de la imagen: el rendimiento puede degradarse con capturas deficientes, mala iluminación o encuadre incorrecto; no se detallan protocolos de captura validados.
- Licencia GPL-3.0: impone obligaciones de copyleft para obras derivadas distribuidas; conviene revisar su compatibilidad antes de integrarlo en productos comerciales propietarios.
- Ausencia de validación clínica regulatoria: no se menciona certificación CE, FDA ni ensayos clínicos prospectivos; su uso en producción sanitaria requeriría validación adicional.
- Repositorio con 0 descargas y 0 likes: ecosistema de validación por la comunidad prácticamente inexistente en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oskargerliczkowalczuk/germed
- Dataset HAM10000/skin cancer (referenciado): https://huggingface.co/datasets/marmal88/skin_cancer
- Dataset ISIC 2024 (referenciado): https://huggingface.co/datasets/isic-2024 (referencia del autor; no se proporciona URL directa en la información disponible)
- ONNX Runtime: https://onnxruntime.ai/
- MobileNetV4 (arquitectura base): no se proporciona enlace en la información disponible.
