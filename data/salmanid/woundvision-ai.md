# salmanid/woundvision-ai

## Resumen

WoundVision AI V5-Augmented es un modelo de segmentación semántica de tejido en heridas, desarrollado por el usuario salmanid y publicado en Hugging Face bajo licencia MIT. Se trata de una U-Net con encoder ResNet34, exportada a ONNX en precisión FP32 (opset 17) para inferencia ligera en CPU mediante ONNX Runtime. El modelo no es un modelo de lenguaje: es una red convolucional de visión por computador orientada a un único dominio médico, la segmentación de distintas clases de tejido en imágenes de heridas.

El modelo resuelve la tarea de clasificar píxel a píxel en seis clases: fondo, epitelial, slough, granulación, necrótico y otros. Recibe tensores de imagen de 320x320 con normalización ImageNet y devuelve logits de la misma resolución espacial para las seis clases. Su relevancia radica en su formato ONNX ligero, que permite desplegarlo en entornos con CPU y sin dependencias de PyTorch, algo útil para prototipos de investigación en entornos clínicos con hardware limitado.

Es importante subrayar que el propio autor lo etiqueta como prototipo experimental de investigación, sin validación clínica y no destinado a diagnóstico ni a toma de decisiones clínicas. El repositorio es de pequeño tamaño (0,1 GB) y no cuenta con descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet34 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 320x320) |
| Tipos de cuantizacion | no disponible (exportado en ONNX FP32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, FP32) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net con encoder ResNet34, un esquema clásico de segmentación semántica que combina un backbone convolucional preentrenado con un decodificador con conexiones de salto para recuperar resolución espacial. La entrada es un tensor float32 de forma `(batch, 3, 320, 320)` normalizado con media y desviación típica de ImageNet. La salida es un tensor de logits `(batch, 6, 320, 320)` correspondiente a las seis clases de tejido.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de épocas ni si se aplicaron técnicas de aumento de datos más allá de la etiqueta "Augmented" en el nombre de la versión. Tampoco se documenta el uso de RLHF, DPO ni técnicas de ajuste fino específicas. La innovación técnica destacable es la exportación a ONNX con paridad verificada frente a PyTorch: el autor reporta un 100,00 % de acuerdo de píxeles y una diferencia máxima de logits de 0,000027, lo que indica una conversión fiel del modelo original.

## Capacidades

- Segmentación semántica píxel a píxel de imágenes de heridas en seis clases: fondo, epitelial, slough, granulación, necrótico y otros.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU ni de PyTorch en producción.
- Entrada de imagen RGB de 320x320 con normalización ImageNet estandarizada.
- Salida de logits por clase, apta para postprocesado con argmax o para cálculo de métricas Dice por clase.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la segmentación de tejido en heridas.

## Casos de uso

- Prototipado de investigación en segmentación de heridas: el modelo sirve como línea base para experimentar con arquitecturas U-Net y comparar métricas Dice por clase en datasets propios, gracias a su formato ONNX ligero y su licencia MIT.
- Despliegue en entornos con CPU limitada: al estar exportado a ONNX FP32 y ejecutarse con ONNX Runtime, puede integrarse en estaciones de trabajo clínicas sin GPU, algo habitual en entornos sanitarios con hardware restringido.
- Preprocesado en pipelines de análisis de imágenes médicas: la salida de logits por clase permite calcular áreas relativas de granulación, necrótico o slough como paso previo a estudios descriptivos de evolución de heridas.
- Docencia y experimentación con modelos de segmentación médica: su tamaño reducido (0,1 GB) y su licencia permisiva lo hacen adecuado para prácticas y demostraciones en cursos de visión por computador aplicada a medicina.
- Integración en aplicaciones de investigación con ONNX Runtime: el modelo puede cargarse en Python, C++ o C# mediante las APIs de ONNX Runtime, facilitando su inclusión en herramientas de escritorio o servicios ligeros.
- Comparación de métricas de segmentación: sirve para evaluar técnicas de postprocesado (umbralización, morfología, ensembles) sobre las seis clases de tejido, dado que el autor publica métricas Dice por clase como referencia.

## Benchmarks y rendimiento

El autor reporta únicamente métricas de validación interna en la model card, no benchmarks estándar comparables con otros modelos.

| Metrica | Valor |
|---|---|
| clinical_3_dice (global) | 59,45 % |
| Dice granulación | 74,89 % |
| Dice necrótico | 60,91 % |
| Dice slough | 42,54 % |
| Paridad PyTorch vs ONNX (acuerdo de píxeles) | 100,00 % |
| Diferencia máxima de logits | 0,000027 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario principal, ya que el modelo está pensado para inferencia en CPU con ONNX Runtime.
- GPU recomendadas: no especificadas por el autor; al ser un modelo pequeño (repo de 0,1 GB), cualquier GPU con suficiente memoria para ONNX Runtime podría ejecutarlo, pero no se documentan requisitos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido del repositorio, aunque no se aportan cifras oficiales de memoria.
- Opciones de despliegue: ONNX Runtime (principal, según el autor); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el autor solo indica que está optimizado para inferencia ligera en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Licencia | Formato | Métrica reportada |
|---|---|---|---|---|---|---|
| WoundVision AI V5-Augmented | U-Net ResNet34 | 320x320 RGB | 6 | MIT | ONNX FP32 | Dice global 59,45 % |
| Alternativas de segmentación de heridas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de segmentación de tejido en heridas en la documentación proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental de investigación: el autor indica explícitamente que no está validado clínicamente y que no debe usarse para diagnóstico ni para toma de decisiones clínicas.
- Rendimiento limitado: el Dice global de 59,45 % y el Dice de slough de 42,54 % indican un rendimiento modesto, insuficiente para aplicaciones clínicas reales.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que se desconocen sesgos por tipo de piel, iluminación, cámara o población.
- Riesgo de alucinación en segmentación: como todo modelo de segmentación, puede producir máscaras plausibles pero incorrectas en tejidos no representados en entrenamiento.
- Limitaciones de entrada: solo acepta imágenes de 320x320 con normalización ImageNet; no se documenta comportamiento con otras resoluciones o condiciones de captura.
- Idiomas: no aplica, al ser un modelo de visión sin capacidades lingüísticas.
- Licencia MIT: permisiva para uso comercial, pero el disclaimer del autor restringe el uso clínico y traslada la responsabilidad al usuario.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni documentación adicional sobre el dataset o el proceso de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/salmanid/woundvision-ai
