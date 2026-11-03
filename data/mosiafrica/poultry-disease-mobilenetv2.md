# mosiAfrica/poultry-disease-mobilenetv2

## Resumen

El modelo `mosiAfrica/poultry-disease-mobilenetv2` es un clasificador de imágenes basado en MobileNetV2, afinado por Mosi Africa para la detección de enfermedades avícolas a partir de fotografías de excrementos de pollo. Distingue cuatro clases: coccidiosis, sano, Newcastle y Salmonella. Su propósito es servir como herramienta de alerta temprana de bajo coste para pequeños avicultores de África Oriental, aprovechando que MobileNetV2 está diseñado para inferencia eficiente en dispositivos móviles.

El modelo parte de los pesos preentrenados de `google/mobilenet_v2_1.0_224` y se ha ajustado sobre el dataset público *Machine Learning Dataset for Poultry Diseases Diagnostics* (Machuve et al., 2022), compuesto por imágenes etiquetadas en granja procedentes de Arusha y Kilimanjaro (Tanzania). Con 2.263.108 parámetros totales, es un modelo extremadamente ligero que puede ejecutarse en teléfonos móviles o hardware de borde sin GPU dedicada.

Es relevante ahora porque demuestra un caso de uso concreto de IA aplicada a salud animal en contextos de recursos limitados, con métricas de validación publicadas (accuracy 0,979 y macro F1 0,972 sobre 1.022 imágenes de test) y una licencia MIT que facilita su reutilización y despliegue comercial. No obstante, el propio autor lo presenta como herramienta de cribado y no como diagnóstico veterinario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con bloques residuales invertidos y cuellos de botella lineales), variante 1.0 de 224x224 |
| Parametros totales | 2.263.108 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes; entrada 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de visión; sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV2, una red neuronal convolucional diseñada para eficiencia computacional en dispositivos móviles. Emplea bloques residuales invertidos con conexiones de salto y convoluciones separables en profundidad, lo que reduce drásticamente el número de operaciones frente a CNNs convencionales. La variante utilizada es la 1.0 con resolución de entrada 224x224, que en su versión base de ImageNet ronda los 3,4 millones de parámetros; el modelo afinado aquí declara 2.263.108 parámetros, lo que sugiere una cabeza de clasificación reducida a las cuatro clases de salida.

El ajuste fino se realizó sobre el dataset público de diagnóstico de enfermedades avícolas de Machuve et al. (2022), con imágenes etiquetadas en granja de Arusha y Kilimanjaro (Tanzania), divididas en 70/15/15 de forma estratificada por clase con semilla 42. El conjunto de test contiene 1.022 imágenes. No se dispone de información sobre hiperparámetros de entrenamiento, número de épocas, aumentos de datos, técnica de regularización ni si se aplicó algún tipo de calibración. Tampoco se documenta el uso de destilación, poda o cuantización durante el entrenamiento.

## Capacidades

- Clasificación de imágenes de excrementos de pollo en cuatro categorías: coccidiosis, sano, Newcastle y Salmonella.
- Inferencia ligera apta para dispositivos móviles y hardware de borde gracias al diseño de MobileNetV2.
- Integración con la librería `transformers` mediante el pipeline `image-classification`.
- Compatible con endpoints de HuggingFace (`endpoints_compatible` en los tags).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No procesa texto ni audio; es un modelo exclusivamente de visión.
- No dispone de modo de razonamiento explícito (thinking mode) ni capacidades de agente.

## Casos de uso

- **Cribado en granja con teléfono móvil**: el avicultor fotografía los excrementos de las aves y la aplicación ejecuta el modelo localmente (o vía API) para obtener una de las cuatro clases. El tamaño reducido (2,26 M de parámetros) permite inferencia en un teléfono de gama media sin conexión a internet.
- **Sistema de alerta temprana en cooperativas avícolas**: una cooperativa puede desplegar el modelo en una app compartida para que los socios reporten posibles brotes de Newcastle o Salmonella, priorizando las visitas veterinarias según la clase detectada.
- **Triaje previo a laboratorio**: dado que el modelo es un cribado y no un diagnóstico, se puede usar como primer filtro en un flujo donde solo las imágenes clasificadas como enfermedad se envían a análisis PCR o a un veterinario, reduciendo costes de laboratorio.
- **Monitorización en granjas con cámaras fijas**: integrado en un sistema de captura periódica de imágenes en el suelo de la nave, el modelo puede generar alertas cuando la proporción de imágenes clasificadas como patológicas supera un umbral, sin necesidad de GPU.
- **Investigación y validación de datasets**: sirve como línea base reproducible para comparar nuevos modelos o datasets de diagnóstico avícola, dado que el autor publica métricas detalladas por clase y la partición de datos con semilla fija.
- **Despliegue en hardware de bajo coste (Raspberry Pi, Coral, etc.)**: la arquitectura MobileNetV2 es compatible con aceleradores de borde y frameworks de inferencia ligera, lo que permite montar estaciones de cribado en zonas rurales sin infraestructura cloud.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test retenido (1.022 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy | 0,979 |
| Macro F1 | 0,972 |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| Coccidiosis | 0,994 | 1,000 | 0,997 | 316 |
| Healthy | 0,974 | 0,981 | 0,977 | 308 |
| Newcastle | 0,903 | 0,982 | 0,941 | 57 |
| Salmonella | 0,985 | 0,959 | 0,972 | 341 |

El autor cita como referencia que los autores del dataset reportan un 98,0 % de accuracy en test con un MobileNetV2 afinado (Machuve et al., 2022). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB para inferencia en fp32; el modelo pesa aproximadamente 9 MB en safetensors (2,26 M de parámetros × 4 bytes), por lo que cabe holgadamente en cualquier GPU consumer, incluida una GTX 1050 o una iGPU.
- **GPU recomendadas**: no requiere GPU dedicada. Funciona en CPU sin problemas de latencia para uso interactivo (una imagen por petición). Para lotes grandes, cualquier GPU moderna (RTX 3060, T4, A10) ofrece throughput muy alto.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer e incluso en móviles y SBCs (Raspberry Pi 4/5, Coral USB Accelerator, etc.).
- **Opciones de despliegue**: `transformers` (pipeline `image-classification`), exportación a ONNX Runtime, TensorFlow Lite (dado el origen MobileNetV2), TorchScript, o integración en apps móviles mediante TFLite/ONNX. No se documenta soporte específico para vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos en CPU moderna y throughput de cientos de imágenes por segundo en GPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada. Como referencia cualitativa, se pueden considerar los siguientes modelos de clasificación de imágenes ligeros, aunque no se han comparado numéricamente con este modelo:

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| mosiAfrica/poultry-disease-mobilenetv2 | 2,26 M | Clasificación de enfermedades avícolas (4 clases) | MIT | HuggingFace |
| google/mobilenet_v2_1.0_224 | ~3,4 M | Clasificación ImageNet (1000 clases) | Apache 2.0 | HuggingFace |
| Modelos de Machuve et al. (2022) | no disponible | Clasificación de enfermedades avícolas | no disponible | No disponible como pesos públicos en la información consultada |

La comparación cuantitativa con alternativas específicas para diagnóstico avícola no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **No es un diagnóstico**: el propio autor lo define como herramienta de cribado para motivar una prueba de laboratorio o visita veterinaria. No debe usarse como única base para decisiones de tratamiento.
- **Etiquetas de granja potencialmente erróneas**: el dataset se etiquetó en granja, no por PCR. El autor recomienda validar con el conjunto confirmado por PCR (Zenodo 5801834) antes de confiar en la precisión en el mundo real.
- **Sesgo geográfico y de raza**: entrenado con imágenes de dos regiones de Tanzania y tres tipos de raza; el rendimiento en otras regiones, razas o condiciones de iluminación es desconocido.
- **Clase Newcastle con pocos ejemplos**: solo 57 imágenes de test, lo que hace que sus métricas (precision 0,903, la más baja) tengan mayor incertidumbre. Los errores en esta clase merecen atención especial.
- **Riesgo de alucinación**: como todo clasificador, puede asignar una clase con alta confianza a imágenes fuera de distribución (otras especies, heces de otros animales, imágenes borrosas), sin mecanismo de abstención documentado.
- **Licencia MIT**: permite uso comercial y modificación, pero conviene revisar las condiciones del dataset original (Zenodo 4628934) por si impone restricciones adicionales sobre los datos, aunque no sobre los pesos.
- **Sin información sobre cuantización ni latencia**: no se han publicado versiones cuantizadas ni mediciones de throughput, lo que obliga a validar el rendimiento en el hardware objetivo antes de producción.
- **Modelo de visión únicamente**: no procesa texto, no soporta instrucciones en lenguaje natural ni razonamiento multi-paso; su uso debe integrarse en una aplicación que gestione la captura y la interpretación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mosiAfrica/poultry-disease-mobilenetv2
- Modelo base: https://huggingface.co/google/mobilenet_v2_1.0_224
- Dataset original (Zenodo 4628934): https://zenodo.org/record/4628934
- Dataset confirmado por PCR (Zenodo 5801834): https://zenodo.org/record/5801834
- Paper de referencia: Machuve D, Nwankwo E, Mduma N, Mbelwa J (2022). Poultry diseases diagnostics models using deep learning. Frontiers in Artificial Intelligence 5:733345. https://doi.org/10.3389/frai.2022.733345
