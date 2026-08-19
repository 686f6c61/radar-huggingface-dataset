# pixaidev/AuraFace-v1

## Resumen

AuraFace es un modelo de reconocimiento facial desarrollado por pixaidev, basado en la arquitectura ResNet100 con pérdida de margen angular aditivo (Additive Angular Margin Loss), la misma técnica introducida por ArcFace en el paper [arXiv:1801.07698](https://arxiv.org/abs/1801.07698). El modelo genera embeddings faciales normalizados de alta discriminación, diseñados para tareas de verificación e identificación biométrica. Se ha entrenado sobre una combinación de datos comerciales y públicos, con el objetivo explícito de permitir su uso en entornos comerciales bajo licencia Apache 2.0.

El modelo se distribuye en formato ONNX a través de la librería InsightFace, con un tamaño de repositorio de 0.4 GB. Aunque no se especifican los parámetros totales, la arquitectura ResNet100 típica ronda los 65 millones de parámetros. Su relevancia actual radica en que ofrece una alternativa de código abierto y comercialmente viable a los modelos de reconocimiento facial propietarios, con un rendimiento competitivo en benchmarks estándar como LFW (99.65% de precisión).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet100 con Additive Angular Margin Loss (basado en ArcFace) |
| Parametros totales | no disponible (estimación típica de ResNet100: ~65M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible (formato ONNX permite cuantización FP16/INT8, pero no se documenta) |
| Idiomas soportados | no aplica (modelo de visión; el tag "en" se refiere al idioma de la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (a través de InsightFace) |

## Arquitectura y entrenamiento

AuraFace emplea una red ResNet100 como backbone, combinada con una pérdida de margen angular aditivo, que introduce una penalización angular en el espacio de características para mejorar la separación entre clases. Esta técnica, originada en ArcFace, fuerza a que los embeddings de la misma identidad estén más cercanos en el espacio coseno, mientras que los de identidades diferentes quedan más separados. El modelo se entrena para producir embeddings normalizados (normed_embedding), listos para comparación por similitud coseno.

Los datos de entrenamiento provienen de un dataset comercial que incluye imágenes faciales de diversas fuentes, con variaciones en demografía, condiciones de iluminación y calidad de imagen. Se aplicaron técnicas de preprocesamiento como normalización a un tamaño estándar y aumentación de datos mediante rotación, volteo y escalado para mejorar la generalización. No se documenta el número exacto de imágenes ni el proceso de anotación, y el autor advierte que la cobertura de ciertas etnias puede ser limitada debido a restricciones comerciales.

## Capacidades

- Generación de embeddings faciales normalizados de 512 dimensiones (típico en modelos ArcFace).
- Verificación facial uno-a-uno: compara dos embeddings y determina si pertenecen a la misma persona mediante similitud coseno.
- Identificación facial uno-a-muchos: busca la identidad más cercana en una base de datos de embeddings precomputados.
- Detección y alineación facial integrada a través del pipeline de InsightFace (si se usa con FaceAnalysis).
- Inferencia en tiempo real en CPU y GPU gracias a la implementación ONNX.
- Soporte para integración en aplicaciones comerciales gracias a la licencia Apache-2.0.
- Funciona con imágenes estáticas y puede adaptarse a flujos de vídeo si se combina con un detector facial.

## Casos de uso

- Autenticación biométrica en aplicaciones móviles: el modelo puede desbloquear dispositivos o autorizar pagos comparando el embedding facial capturado en vivo con uno almacenado. Su baja latencia en GPU permite una experiencia fluida.
- Control de acceso físico en oficinas o instalaciones: integrado con cámaras IP, AuraFace verifica la identidad de empleados en tiempo real, sustituyendo tarjetas de acceso o códigos PIN.
- Búsqueda de personas en bases de datos de imágenes: dado un rostro de referencia, se puede calcular su embedding y buscar coincidencias en un índice de embeddings precomputados, útil para aplicaciones de seguridad o gestión de archivos fotográficos.
- Personalización en comercio electrónico: identificación de clientes recurrentes para ofrecer recomendaciones o promociones personalizadas, siempre con consentimiento explícito.
- Creación de avatares digitales consistentes: el modelo puede alimentar pipelines de generación de personajes, como IP-Adapter, asegurando que el rostro generado mantenga la identidad del usuario en diferentes poses o estilos.
- Sistemas de asistencia a personas mayores o dependientes: detección de caídas o reconocimiento de cuidadores autorizados mediante verificación facial en dispositivos domésticos de bajo consumo.
- Análisis de audiencia en eventos o retail: conteo de asistentes únicos mediante embeddings faciales anonimizados (con hash), sin almacenar imágenes crudas, para métricas de afluencia.

## Benchmarks y rendimiento

El autor proporciona resultados en cinco benchmarks estándar de reconocimiento facial:

| Benchmark | Precisión |
|---|---|
| LFW (Labeled Faces in the Wild) | 0.99650 |
| CFP-FP (Celebrities in Frontal-Profile) | 0.95186 |
| AGEDB (Age Database) | 0.96100 |
| CALFW (Cross-Age LFW) | 0.94700 |
| CPLFW (Cross-Pose LFW) | 0.90933 |

Estos valores son comparables a los reportados por ArcFace original (LFW ~99.8%, CFP-FP ~95.5%, AGEDB ~96.2% en el paper), aunque ligeramente inferiores en algunos casos, posiblemente debido a la limitación de los datos de entrenamiento. No se han publicado resultados en benchmarks más recientes como IJB-C o MegaFace.

## Requisitos de hardware

- VRAM estimada: para inferencia con ResNet100 en ONNX, se requieren aproximadamente 200-300 MB de memoria en FP32, y unos 100-150 MB en FP16. Esto permite ejecución en GPUs con 2 GB o más.
- GPU recomendada: cualquier GPU NVIDIA con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.) para inferencia en tiempo real. Para procesamiento por lotes, se recomienda una RTX 3090 o A100.
- CPU: también es viable en CPU moderna (Intel i7 o AMD Ryzen 7) con una latencia de 20-50 ms por imagen, suficiente para aplicaciones no críticas.
- Opciones de despliegue: se integra con InsightFace (pip install insightface), que soporta ejecución en ONNX Runtime con providers CUDA o CPU. También puede exportarse a otros formatos (TensorRT, OpenVINO) para optimización adicional.
- Latencia estimada: en una GPU RTX 2080, la extracción de un embedding tarda aproximadamente 5-10 ms; en CPU, 30-60 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Precisión LFW | Licencia | Formato |
|---|---|---|---|---|---|
| AuraFace | ResNet100 | ~65M (estimado) | 0.99650 | Apache-2.0 | ONNX |
| ArcFace (original) | ResNet50/100 | ~44M/65M | ~0.998 | MIT (código) | MXNet, ONNX |
| CosFace | ResNet50/100 | ~44M/65M | ~0.997 | MIT | MXNet |
| FaceNet (Inception ResNet) | Inception ResNet v1 | ~23M | ~0.996 | MIT | TensorFlow |

AuraFace se posiciona como una alternativa con licencia permisiva para uso comercial, con rendimiento ligeramente inferior a ArcFace original en LFW pero comparable en otros benchmarks. No se dispone de datos comparativos directos en los mismos conjuntos de validación más allá de los publicados por el autor.

## Limitaciones y advertencias

- Sesgo étnico: el autor reconoce que el rendimiento puede variar según la etnicidad, debido a la limitada cobertura de ciertos grupos en los datos de entrenamiento. Se recomienda evaluar el modelo en la población objetivo antes de su despliegue.
- Generalización limitada: la diversidad de condiciones de iluminación, ángulos y calidad de imagen del dataset comercial puede no ser suficiente para escenarios extremos (muy baja resolución, oclusiones severas, envejecimiento extremo).
- Riesgo de falsos positivos/negativos: en aplicaciones de seguridad, una tasa de error del 0.35% en LFW puede no ser aceptable; se recomienda establecer umbrales de similitud conservadores.
- Privacidad y cumplimiento legal: el uso de reconocimiento facial está sujeto a regulaciones como el RGPD en Europa o leyes estatales en EE.UU. El usuario es responsable de obtener consentimiento y garantizar el anonimato cuando sea necesario.
- Sin soporte para alucinación de texto: al ser un modelo de visión, no genera contenido textual; no aplica el riesgo de alucinación típico de los LLM.
- Dependencia del pipeline de detección: el rendimiento final depende del detector facial usado (por defecto, el de InsightFace), que puede fallar en imágenes con múltiples rostros o ángulos poco comunes.
- Documentación incompleta: no se especifican hiperparámetros, número de épocas, ni tamaño exacto del dataset, lo que dificulta la reproducibilidad.

## Enlaces

- [HuggingFace: pixaidev/AuraFace-v1](https://huggingface.co/pixaidev/AuraFace-v1)
- [Paper ArcFace: Additive Angular Margin Loss for Deep Face Recognition](https://arxiv.org/abs/1801.07698)
- [Repositorio InsightFace](https://github.com/deepinsight/insightface/tree/master)
