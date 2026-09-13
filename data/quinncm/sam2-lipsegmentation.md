# quinncm/SAM2-LipSegmentation

## Resumen

SAM2-LipSegmentation es un ajuste fino del modelo Segment Anything Model 2 (SAM 2.1 Hiera Small) publicado por el usuario quinncm en Hugging Face. El modelo está especializado en la segmentación de labios y de la región oral en imágenes y vídeo de rostros, y su propósito declarado es servir de apoyo a la evaluación semiautomática de la localización de puntos de referencia (landmarks) de la boca. El repositorio ocupa 0,3 GB e incluye los pesos ajustados, el fichero de configuración de SAM 2.1 y un vídeo de ejemplo con anotaciones.

El ajuste se realizó con 3.200 imágenes: 1.600 procedentes de LaPa (Landmark guided face Parsing dataset) y 1.600 del MetaHuman Lip Segmentation Dataset. No se documentan hiperparámetros, épocas de entrenamiento, métricas de validación ni condiciones de licencia, y el repositorio no registra descargas ni valoraciones, por lo que se trata de un artefacto experimental sin validación comunitaria.

Su interés es acotado y muy específico: cubre el nicho de la segmentación labial para animación de avatares, verificación de lip-sync y análisis articulatorio, aprovechando la arquitectura promptable y de vídeo de SAM 2, que permite propagar máscaras a lo largo de una secuencia sin reanotar cada fotograma. No es un modelo de lenguaje ni un modelo multimodal de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 con backbone Hiera Small (vision transformer jerárquico con atención en ventanas); codificador de imagen + codificador de prompts + decodificador de máscaras + memoria de vídeo |
| Parametros totales | Aproximadamente 46 M (heredados del modelo base SAM 2.1 Hiera Small; no confirmado en la model card del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen/vídeo, no procesa contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en precisión original) |
| Idiomas soportados | no aplica (modelo de visión; no procesa texto ni voz) |
| Licencia | no disponible (la model card no especifica licencia para este repositorio) |
| Formato de pesos | PyTorch (`finetuned_lip_seg_sam2.1s.pt`); configuración en `sam2.1_hiera_s.yaml` |
| Modelo base | SAM 2.1 Hiera Small (`sam2.1_hiera_s.yaml`) |
| Datos de ajuste fino | 1.600 imágenes de LaPa + 1.600 imágenes del MetaHuman Lip Segmentation Dataset (3.200 en total) |
| Tarea | Segmentación semiautomática de labios / región oral; evaluación de localización de landmarks |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-13 / 2026-09-13 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de SAM 2.1 Hiera Small, la variante pequeña de la familia Segment Anything Model 2. SAM 2 combina un codificador de imagen basado en Hiera (un transformer jerárquico que sustituye la atención global por atención en ventanas, lo que reduce el coste computacional manteniendo resolución espacial), un codificador de prompts que acepta puntos, cajas o máscaras como entrada, un decodificador de máscaras ligero y un módulo de memoria que permite propagar la segmentación a lo largo de fotogramas de vídeo en modo streaming. La descripción arquitectónica corresponde al modelo base publicado por Meta; la model card del repositorio no detalla modificaciones estructurales, por lo que se asume que el ajuste fino afecta únicamente a los pesos.

En cuanto al entrenamiento, la única información disponible es la composición del conjunto de datos: 3.200 imágenes repartidas a partes iguales entre LaPa y el MetaHuman Lip Segmentation Dataset. No se especifican régimen de aprendizaje, número de épocas, resolución de entrada, aumentos de datos, función de pérdida ni procedimiento de validación. No hay constancia de fases de RLHF, DPO ni ajuste por preferencias, algo por otra parte esperable en un modelo de segmentación. Tampoco se documentan innovaciones técnicas propias más allá del ajuste de dominio sobre la arquitectura de SAM 2.1.

## Capacidades

- Segmentación de labios y de la región oral en imágenes estáticas de rostros, a partir de prompts (puntos o cajas) o de forma automática según la configuración.
- Segmentación y propagación de máscaras en vídeo, gracias al módulo de memoria de SAM 2, que mantiene la coherencia temporal entre fotogramas.
- Apoyo a la localización y evaluación de landmarks faciales en flujo semiautomático: el vídeo de ejemplo incluido (`sample_lip_segmentation.mp4`) ilustra este uso.
- Generación de máscaras binarias utilizables como entrada para etapas posteriores de un pipeline (por ejemplo, recorte de la región bucal para un modelo de lip reading).
- Segmentación guiada por prompt: al heredar la interfaz de SAM 2, admite indicaciones puntuales o por caja para refinar el objeto segmentado.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas ni capacidades multilingües: no es un modelo de lenguaje.
- No se han documentado capacidades de detección de landmarks por sí misma; la model card la describe como herramienta de apoyo a su evaluación, no como predictor de coordenadas.

## Casos de uso

- Anotación semiautomática de datasets de labios: el modelo genera máscaras de la región oral sobre lotes de imágenes, que un anotador revisa y corrige, reduciendo el coste de etiquetado manual en proyectos de face parsing.
- Verificación de lip-sync en doblaje y localización: comparando la máscara labial predicha con la silueta esperada por el fonema, se pueden detectar desincronías en pistas dobladas antes de publicar un contenido audiovisual.
- Animación de avatares estilo MetaHuman: la máscara labial sirve como entrada para rigs faciales o para transferir movimientos de boca entre un actor real y un personaje digital, aprovechando la propagación temporal en vídeo.
- Preprocesado para reconocimiento del habla visual (lip reading): recortar la región bucal de forma consistente en cada fotograma mejora la relación señal-ruido de los modelos de lectura de labios, que suelen trabajar sobre crops normalizados.
- Análisis articulatorio en logopedia e investigación fonética: la segmentación estable de la boca a lo largo de una grabación permite medir apertura y cierre labial (por ejemplo, en oclusivas bilabiales) de forma cuantitativa.
- Pruebas de calidad en herramientas de maquillaje virtual o probadores de barras de labios: la máscara delimita con precisión la zona donde aplicar la textura sintética sin invadir la piel adyacente.
- VFX y postproducción: generación de mates de labios para retoques de color, sustitución de boca o corrección de continuidad entre planos, con la ventaja de la coherencia temporal de SAM 2.
- Evaluación interna de modelos de landmarks: tal como declara el autor, las máscaras obtenidas permiten comprobar de forma semiautomática si un detector de puntos faciales sitúa correctamente el contorno labial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye IoU, Dice, mIoU ni ninguna otra métrica de segmentación, ni comparaciones cuantitativas con el modelo base SAM 2.1 Hiera Small o con alternativas de face parsing.

## Requisitos de hardware

- El checkpoint tiene un tamaño compatible con un modelo de unos 46 M de parámetros: aproximadamente 180 MB en fp32 y unos 92 MB en fp16, coherente con los 0,3 GB del repositorio completo (que incluye también el vídeo de ejemplo).
- VRAM estimada para inferencia sobre imagen: por debajo de 1 GB en fp16 a resolución de trabajo de SAM 2 (1024 x 1024), sin contar el overhead del framework. Cabe holgadamente en cualquier GPU de consumo actual e incluso en CPU para casos puntuales.
- VRAM estimada para vídeo: depende del número de fotogramas retenidos en el banco de memoria; en configuraciones habituales se mantiene en el rango de 2 a 6 GB, sin que el autor haya publicado cifras.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (GTX 1660, RTX 3060, RTX 4060, RTX 4090). Para procesamiento por lotes a gran escala son preferibles A100 o H100 por ancho de banda, aunque el modelo es pequeño y no las requiere.
- Opciones de despliegue: PyTorch con el repositorio oficial de SAM 2 (requiere el fichero `sam2.1_hiera_s.yaml` y los pesos ajustados), exportación a ONNX Runtime o TorchScript. No existen versiones GGUF ni soporte en llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El autor no publica tiempos de inferencia ni velocidad de procesamiento por fotograma.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM2-LipSegmentation (este) | ~46 M (base) | Segmentación de labios en imagen y vídeo | Imagen y vídeo, con prompts | no disponible | Repositorio HF, 0 descargas |
| SAM 2.1 Hiera Small (base) | ~46 M | Segmentación promptable genérica de objetos, con vídeo | Imagen y vídeo, con prompts | Apache 2.0 según Meta (no confirmado en este repositorio) | Ampliamente disponible |
| SAM 2.1 Hiera Tiny (base) | ~38,9 M | Segmentación promptable genérica de objetos, con vídeo | Imagen y vídeo, con prompts | Apache 2.0 según Meta | Ampliamente disponible |
| Detectores de landmarks faciales tipo MediaPipe Face Landmarker | no disponible | Malla facial y landmarks, no máscaras densas de labios | Imagen y vídeo | Apache 2.0 según su distribución | Ampliamente disponible |

No se dispone de métricas comparativas publicadas entre estas opciones, ni de comparaciones dentro de la propia model card. La diferencia funcional de este repositorio frente a sus alternativas es el ajuste específico de dominio sobre 3.200 imágenes de labios, a cambio de la ausencia de licencia explícita y de validación.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio. Sin una licencia explícita, no puede asumirse permiso para uso comercial ni redistribución; conviene contactar con el autor antes de integrarlo en un producto.
- Los conjuntos de datos de ajuste imponen sus propias condiciones: LaPa se distribuye con fines de investigación y el MetaHuman Lip Segmentation Dataset procede del ecosistema de Epic Games, por lo que la trazabilidad legal del modelo resultante no está documentada.
- El entrenamiento se limita a 3.200 imágenes de dos fuentes, lo que implica riesgo de sobreajuste y de sesgo hacia los tipos de rostro, iluminación, resolución y maquillaje presentes en esos conjuntos. El rendimiento en otros grupos demográficos es desconocido.
- No se han publicado métricas de validación ni comparaciones con el modelo base, de modo que no puede cuantificarse cuánto mejora el ajuste fino ni si degrada la capacidad genérica de segmentación.
- Riesgo de máscaras incorrectas en oclusiones labiales (manos, micrófonos, vello facial, gafas), en perfiles extremos y en imágenes de baja resolución o con desenfoque de movimiento.
- En vídeo, la propagación de memoria puede acumular deriva a lo largo de secuencias largas o tras cortes de plano, produciendo máscaras que se desvían del contorno real.
- El modelo solo produce máscaras: no devuelve coordenadas de landmarks ni etiquetas fonéticas, por lo que por sí solo no cubre la tarea completa de evaluación que motiva su publicación.
- Dependencia de código externo: para usarlo hay que integrar el fichero de configuración con la base de código de SAM 2, cuya versión compatible no se especifica.
- El repositorio registra cero descargas y cero valoraciones, sin citation formal ("TBD"), lo que limita cualquier evaluación por parte de terceros.
- Los metadatos del repositorio indican fechas de creación y actualización de 2026-09-13, lo que sugiere una carga automatizada o un error de configuración; conviene verificar la vigencia del artefacto.
- Los resultados de la búsqueda web asociados a este modelo no contienen información técnica relevante ni referencias al proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quinncm/SAM2-LipSegmentation
- Pesos ajustados: https://huggingface.co/quinncm/SAM2-LipSegmentation/blob/main/finetuned_lip_seg_sam2.1s.pt
- Fichero de configuración: https://huggingface.co/quinncm/SAM2-LipSegmentation/blob/main/sam2.1_hiera_s.yaml
- Vídeo de ejemplo: https://huggingface.co/quinncm/SAM2-LipSegmentation/blob/main/sample_lip_segmentation.mp4
- Repositorio oficial de SAM 2 (necesario para ejecutar los pesos, no enlazado en la model card): https://github.com/facebookresearch/sam2
- Conjunto de datos LaPa (citado como fuente de entrenamiento, no enlazado en la model card): https://github.com/JDAI-CV/lapa-dataset
- Paper de SAM 2 (referencia del modelo base, no enlazado en la model card): https://arxiv.org/abs/2408.00714
- No se han encontrado en la búsqueda web enlaces adicionales, papers, blogs ni demos relacionados con este modelo.
