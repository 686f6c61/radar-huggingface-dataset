# obuladinnesai/claim-photo-integrity-detector-v4

## Resumen

El Claim Photo Integrity Detector v4 es un modelo de clasificación de imágenes desarrollado por el usuario obuladinnesai y publicado en HuggingFace bajo licencia Apache 2.0. Su función es actuar como señal de triaje para distinguir fotografías auténticas de imágenes sintéticas en el contexto de la tramitación de siniestros: el caso de uso declarado es la verificación de fotos adjuntas a partes de siniestro, aunque la categoría de detección (deepfake y contenido generado por IA) es transversal a otros dominios de verificación documental. Según los tags del repositorio, la arquitectura es un vision transformer (ViT) con 85.800.194 parámetros totales, un tamaño de repositorio de 0,3 GB y pesos en formato safetensors.

Se trata de la cuarta iteración de una familia de modelos. La versión v3 había corregido un falso positivo sobre imágenes de aulas, pero sobrecorrigió: al no incluir caras humanas fotorrealistas generadas por IA en su conjunto de datos de entrenamiento de clase falsa, aprendió la asociación espuria "persona = real" y dejaba pasar retratos generados por IA clasificándolos como reales en el 91,83 % de los casos. La v4 corrige ese sesgo incorporando aproximadamente 5.000 caras sintéticas al conjunto de entrenamiento, combinando generadores de tipo GAN y de difusión, y añadiendo varios cientos de caras de IA al conjunto de validación para que las métricas de validación midan realmente la detección de caras.

El modelo es relevante ahora porque la detección de imágenes sintéticas se ha convertido en un problema operativo para aseguradoras, plataformas de verificación de identidad y equipos de moderación de contenido, y porque la literatura muestra que los detectores entrenados únicamente con una familia de generadores fallan al transferir a otra. La propuesta de la v4 es precisamente cubrir ambas familias (GAN y difusión) en el entrenamiento. No obstante, el propio autor lo describe como una señal de triaje para revisión humana, no como una prueba de fraude.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT), según los tags del repositorio; configuración exacta no disponible |
| Parametros totales | 85.800.194 (85,8 M), dato de los pesos safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificador de imágenes); resolución de entrada no documentada por el autor |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica / no disponible (clasificador de imágenes; la metadata de HuggingFace no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Tarea | Clasificación binaria real / sintética (deepfake y contenido generado por IA) |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 2026-09-27 |
| Ultima actualización | 2026-09-27 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un vision transformer (según el tag `vit` y `vision-transformer` de HuggingFace) con 85,8 millones de parámetros totales. Ese recuento es coherente con una configuración del orden de ViT-Base, pero el autor no documenta en la model card ni la configuración exacta (capas, dimensión oculta, número de cabezas) ni la resolución de entrada ni el número de clases de salida más allá de la tarea de clasificación. El modelo se distribuye como pesos safetensors y se consume a través del pipeline estándar de `transformers` para clasificación de imágenes.

El entrenamiento es un fine-tuning continuado sobre la versión v3. La v4 incorpora aproximadamente 5.000 caras generadas por IA al conjunto de ejemplos de clase falsa: 2.500 caras StyleGAN procedentes del dataset 140k Real and Fake Faces (espejo en HuggingFace) y 2.500 caras de difusión procedentes de DeepFakeFace (variantes text2img e insight). El objetivo declarado es cubrir tanto generadores GAN como de difusión, dado que los detectores entrenados sobre una sola familia fallan al generalizar a la otra. Además, se añadieron varios cientos de caras de IA al conjunto de validación. Los datasets base citados son Defactify_Image_Dataset, TheKernel01/140k-Real-and-Fake-Faces y OpenRL/DeepFakeFace. Como aumentación en tiempo de entrenamiento se mantienen recompresión JPEG, ruido, desenfoque, variación de brillo y contraste, y volteos. No se documenta en la información disponible si hubo fases de RLHF, DPO u otras técnicas de alineación, ni el volumen total de tokens o imágenes de entrenamiento.

## Capacidades

- Clasificación de imágenes en dos clases (auténtica frente a generada o manipulada) mediante el pipeline `image-classification`, devolviendo etiquetas con puntuación de confianza.
- Detección de caras generadas por IA, con cobertura explícita de dos familias de generadores: StyleGAN (GAN) y modelos de difusión (text2img e insight).
- Detección de imágenes sintéticas en el contexto de expedientes de siniestro (fotos de daños, documentación fotográfica adjunta).
- Robustez parcial ante perturbaciones de Pos-procesado habituales en fotos de móvil: recompresión JPEG, ruido de sensor, desenfoque, cambios de brillo y contraste, y volteos horizontales, gracias a las aumentaciones aplicadas durante el entrenamiento.
- No dispone de generación de texto, razonamiento multi-paso, soporte de tool calling ni function calling: es un clasificador de visión, no un modelo generativo ni un agente.
- No se documentan capacidades multilingües ni procesamiento de lenguaje; la única salida son etiquetas de clasificación.
- No se documentan capacidades de visión adicionales (detección de objetos, segmentación, OCR, respuesta a preguntas visuales).

## Casos de uso

- Triaje automatizado de fotos en partes de siniestro: el modelo puntúa cada imagen adjunta a un expediente y marca como sospechosas las que superan un umbral, de modo que el equipo humano revise solo ese subconjunto. Es adecuado porque está entrenado específicamente con caras sintéticas de tipo GAN y difusión, los generadores más habituales en fraude fotográfico.
- Verificación de identidad en onboarding remoto: como primera barrera para detectar selfies o retratos generados antes de pasar a una verificación con prueba de vida. Su foco explícito en retratos generados por IA (el fallo que corrige respecto a v3) lo hace pertinente para este escenario.
- Moderación de contenido en plataformas: filtrado previo de imágenes sintéticas subidas por usuarios, derivando a revisión humana los casos con puntuación intermedia. Se aprovecha su bajo coste computacional para ejecutarlo sobre grandes volúmenes.
- Verificación periodística y fact-checking: apoyo a redacciones que reciben material gráfico de fuentes externas y necesitan una señal rápida de autenticidad antes de publicar. El modelo actúa como indicador, no como prueba concluyente.
- Detección de perfiles falsos en marketplaces y redes sociales: análisis de las fotos de perfil nuevas para señalar cuentas construidas con imágenes generadas, reduciendo fraude en transacciones entre particulares.
- Auditoría retroactiva de expedientes: reprocesado por lotes de imágenes ya archivadas para localizar casos donde se sospeche uso de imágenes sintéticas, aprovechando que el modelo inferencia en CPU o GPU de gama baja.
- Investigación sobre detección de deepfakes: al ser un modelo pequeño con licencia Apache 2.0 y datasets de entrenamiento públicos, sirve como punto de partida o línea base para experimentos de fine-tuning y comparación de familias de generadores.
- Enriquecimiento de pipelines antifraude existentes: integración como componente de puntuación dentro de un sistema mayor que combine metadatos EXIF, análisis de ELA y reglas de negocio, aportando la señal visual sintética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de accuracy, precision, recall, F1 ni comparaciones cuantitativas con otros detectores, más allá de la referencia anecdótica al fallo de la versión anterior (v3 clasificaba como reales el 91,83 % de los retratos generados por IA), cifra que describe el comportamiento de v3 y no una evaluación de v4.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,34 GB en fp32 (343 MB), 0,17 GB en fp16 o bf16 (172 MB) y del orden de 0,09 GB en int8. Hay que sumar la memoria de activaciones, que depende de la resolución de entrada (no documentada) y del tamaño de lote.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; una NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 sirven sobradamente, y en la mayoría de casos estarán infrautilizadas. Para lotes grandes o servicio de alta concurrencia tiene sentido usar GPU, pero no es un requisito.
- Compatibilidad con GPU de consumo: sí, cabe con enorme margen en cualquier GPU de consumo de los últimos años, incluidas las de gama de entrada.
- Inferencia en CPU: viable, dado el tamaño de 85,8 M de parámetros y el repositorio de 0,3 GB; es un modelo apto para despliegue sin acelerador.
- Opciones de despliegue: el pipeline de `transformers` documentado por el autor (`pipeline("image-classification", ...)`); al ser un modelo de visión, no aplican llama.cpp, Ollama ni GGUF. Son razonables exportaciones a ONNX Runtime, TorchScript o TensorRT y el servicio mediante Triton o TorchServe, aunque el autor no documenta ninguna de estas rutas.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por imagen ni de imágenes por segundo en ningún hardware.

## Comparativa con modelos similares

No se dispone de datos de comparación en la información proporcionada. La model card no cita modelos alternativos ni incluye tablas comparativas, y no se han facilitado especificaciones verificadas de otros detectores de deepfake o de imágenes generadas por IA (parámetros, contexto, rendimiento o licencia) que permitan construir una comparación rigurosa.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| claim-photo-integrity-detector-v4 | 85,8 M | No disponible (clasificador de imágenes) | No disponible | Apache 2.0 | HuggingFace |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El propio autor lo define como una señal de triaje para revisión humana, no como prueba de fraude. No debe usarse como evidencia concluyente ni como única base para denegar un siniestro.
- La precisión se degrada frente a generadores más recientes que los presentes en los datos de entrenamiento. La cobertura de GAN y difusión en v4 no garantiza generalización a modelos de imagen futuros o a arquitecturas no representadas.
- Riesgo de sesgo de composición del dataset: la corrección de v3 a v4 ilustra cómo la distribución de la clase falsa determina el comportamiento. Si el dominio de producción difiere del diet de entrenamiento (tipo de foto, cámara, iluminación, tipo de sujeto), el rendimiento puede alejarse del observado en validación.
- Riesgo de alucinación en sentido clasificatorio: falsos positivos (fotos reales marcadas como sintéticas) y falsos negativos (imágenes generadas clasificadas como auténticas), con impacto directo sobre usuarios si se automatiza la decisión.
- No se documentan sesgos demográficos evaluados, ni métricas desagregadas por género, edad o etnia, algo especialmente relevante al tratarse de detección de caras.
- Resolución de entrada, umbrales de decisión y calibración de las puntuaciones no están documentados, lo que dificulta fijar un punto de corte defendible en producción.
- Restricciones de licencia: los pesos son Apache 2.0, pero el autor advierte explícitamente de que deben revisarse las licencias de los datasets empleados antes de un uso comercial: 140k Real and Fake Faces está bajo licencia CC y DeepFakeFace bajo OpenRAIL. Esa advertencia condiciona la explotación comercial del modelo entrenado con ellos.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa reproducible del rendimiento de v4, solo la descripción cualitativa de la corrección respecto a v3.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad ni informes independientes de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/obuladinnesai/claim-photo-integrity-detector-v4
- Dataset Defactify_Image_Dataset: https://huggingface.co/datasets/Rajarshi-Roy-research/Defactify_Image_Dataset
- Dataset 140k Real and Fake Faces: https://huggingface.co/datasets/TheKernel01/140k-Real-and-Fake-Faces
- Dataset DeepFakeFace: https://huggingface.co/datasets/OpenRL/DeepFakeFace
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
