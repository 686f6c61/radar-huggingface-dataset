# GeoBrain/blending-noise-suppression-avo

## Resumen

GeoBrain/blending-noise-suppression-avo es un benchmark y conjunto de modelos de supresión de ruido de blending (deblending) para datos sísmicos AVO en gathers de receptor común. Desarrollado por GeoBrain, el modelo aprende una regresión supervisada que mapea directamente los gathers pseudo-deblended a la referencia limpia, mediante la función `denoised = model(pseudo_deblended_input)`. El repositorio incluye siete arquitecturas de redes neuronales: UNet, ResUNet, DnCNN, Attention UNet, DDPM, UNet_L y SCRN, todas definidas en PyTorch y entrenadas con un esquema de validación por seeds (42, 43 y 44).

La relevancia de este modelo radica en su aplicación práctica en la industria de exploración sísmica, donde la adquisición simultánea con blending introduce ruido que degrada la calidad de las imágenes subsuperficiales. El deblending automático mediante deep learning permite acelerar el procesamiento y mejorar la interpretación de los datos AVO, un paso crítico en la caracterización de yacimientos. El repositorio tiene un tamaño de 2 GB e incluye scripts de entrenamiento, inferencia y subida a Hugging Face.

No se dispone de información sobre la licencia, los idiomas soportados ni el pipeline de uso, aunque el modelo es exclusivamente de visión sísmica y no requiere procesamiento de lenguaje natural.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiples: UNet, ResUNet, DnCNN, Attention UNet, DDPM, UNet_L, SCRN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa parches 2D de 128 x 256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión sísmica) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo se define como un benchmark de deblending supervisado sobre gathers AVO de receptor común. La entrada es un volumen lógico de dimensiones `(120, 1001, 1500)`, correspondiente a 120 gathers, 1001 trazas por gather y 1500 muestras temporales por traza. El entrenamiento usa parches superpuestos de tamaño `128 x 256` con ratio de solapamiento 0.5, y normalización `max_abs` con estadísticas compartidas entre entrada y objetivo. La división de datos es secuencial por gathers: 96 para entrenamiento, 12 para validación y 12 para test.

Las arquitecturas son todas redes neuronales convolucionales o basadas en UNet, salvo SCRN que es una variante específica. No se detalla el número exacto de parámetros, ni la cantidad de datos de entrenamiento en términos de épocas o volumen total, ni se menciona el uso de RLHF o DPO. La innovación técnica principal es la formulación como regresión emparejada (pseudo-deblended a clean) en lugar de una regresión de ruido sintético, lo que permite un aprendizaje directo de la función de eliminación de ruido.

## Capacidades

- Supresión de ruido de blending en gathers sísmicos AVO de receptor común.
- Deblending directo a partir de datos pseudo-deblended, sin necesidad de modelos de ruido sintético.
- Procesamiento en 2D con parches de tamaño 128 x 256, lo que permite manejar volúmenes grandes de datos sísmicos.
- Múltiples arquitecturas disponibles para comparar y elegir la que mejor se adapte al caso de uso.
- Soporte de entrenamiento con tres semillas fijas (42, 43, 44) para robustez estadística.
- Generación de métricas de evaluación por gather y por muestra (SNR, PSNR, SSIM, MAE, MSE, RMSE) y métricas específicas de energía y frecuencia (EB_WSE, FB_FRE).
- No soporta tool calling, agentes, ni capacidades multilingües, al ser un modelo especializado en datos sísmicos.

## Casos de uso

- Procesamiento sísmico en exploración petrolífera: el modelo puede aplicarse a datos de adquisición simultánea para eliminar el ruido de blending y mejorar la calidad de las imágenes de subsuelo, acelerando el flujo de trabajo de procesamiento.
- Caracterización de yacimientos con datos AVO: al limpiar los gathers de receptor común, se obtienen amplitudes más fiables para la interpretación AVO y la detección de hidrocarburos.
- Preprocesamiento para inversión sísmica: los gathers deblended pueden alimentar algoritmos de inversión de impedancia acústica o elástica, reduciendo artefactos que distorsionan los resultados.
- Control de calidad de adquisiciones: el modelo puede usarse para evaluar la calidad de los datos adquiridos en campo, identificando niveles de ruido de blending y decidiendo si es necesario re-adquirir o reprocesar.
- Investigación en geofísica: sirve como base para comparar arquitecturas de deep learning en tareas de deblending, permitiendo evaluar UNet, DnCNN, DDPM, etc., en un benchmark estandarizado.
- Integración en pipelines de procesamiento sísmico: al estar disponible como scripts de inferencia, puede integrarse en flujos de trabajo automatizados en entornos de computación de alto rendimiento.

## Benchmarks y rendimiento

La información proporcionada incluye una tabla de resultados con métricas para la entrada (Input) como referencia, pero no se presentan resultados de los modelos entrenados. Los valores de la entrada son:

| Métrica | Valor |
|---|---|
| SNR | -2.0292 |
| PSNR | 23.1464 |
| SSIM | 0.7028 |
| MAE | 0.025431 |
| MSE | 0.005029 |
| RMSE | 0.070259 |

No se han publicado resultados de benchmarks para los métodos (UNet, ResUNet, etc.) en la información disponible. La tabla de la model card incluye columnas para métricas específicas de energía y frecuencia (EB_WSE, FB_FRE) pero los valores de los modelos no se muestran en el texto extraído.

## Requisitos de hardware

- No se dispone de información sobre VRAM específica para inferencia.
- El tamaño del repositorio es de 2 GB, lo que sugiere que los modelos entrenados tienen un peso considerable, pero no se indica el número de parámetros.
- Dado que los datos de entrada son parches 2D de 128 x 256, la inferencia puede ejecutarse en una GPU de consumo medio, pero no hay datos confirmados.
- Las opciones de despliegue incluyen los scripts de PyTorch proporcionados, pero no se mencionan herramientas como vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Se recomienda una GPU con al menos 4-6 GB de VRAM para inferencia, aunque no es un dato oficial.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (deblending sísmico) dentro de la información proporcionada. La comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente en un dataset de gathers AVO de common-receiver (T03) y puede no generalizar a otros tipos de datos sísmicos o configuraciones de adquisición.
- No se conoce la licencia, por lo que el uso comercial puede ser restrictivo o no estar permitido sin autorización.
- El riesgo de alucinación es bajo, pero el modelo puede introducir artefactos en zonas de baja señal o en presencia de ruido no blending.
- La partición de datos es secuencial por gathers, lo que puede inducir un sesgo en la evaluación si los gathers tienen características no estacionarias.
- No hay información sobre el número de parámetros ni el coste computacional exacto, lo que dificulta la planificación de recursos.
- La normalización compartida entre entrada y objetivo puede reducir la sensibilidad a variaciones de amplitud absoluta, afectando a la interpretación AVO.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeoBrain/blending-noise-suppression-avo
- Modelo relacionado (sin variante AVO): https://huggingface.co/GeoBrain/blending-noise-suppression
- Repositorio GeoBrain en GitHub: https://github.com/GeoBrain-Project/GeoBrain
- Documentación del proyecto: https://geobrain-project.github.io/GeoBrain/_sources/intro.md
