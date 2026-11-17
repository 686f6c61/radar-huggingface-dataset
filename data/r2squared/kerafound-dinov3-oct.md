# R2Squared/KERAFound-DINOv3-OCT

## Resumen

KERAFound-DINOv3-OCT es un modelo fundacional de visión por computador especializado en oftalmología, concretamente en imágenes de segmento anterior y córnea obtenidas mediante tomografía de coherencia óptica (OCT). Lo desarrolla R2Squared y se distribuye a través de Hugging Face con acceso restringido (gated), lo que obliga a aceptar condiciones adicionales antes de descargar los pesos. El modelo parte de la arquitectura DINOv3 en su variante ViT-Large y se ha adaptado al dominio oftalmológico para extraer representaciones densas de imágenes OCT.

El modelo resuelve el problema de la falta de extractores de características específicos para imagen médica oftalmológica de alta resolución. En lugar de entrenar desde cero, aprovecha el preentrenamiento auto-supervisado de DINOv3 y lo especializa en un corpus del segmento anterior del ojo, lo que permite obtener embeddings útiles para tareas posteriores como segmentación corneal, clasificación de patologías o recuperación de imágenes similares.

Con 303.154.192 parámetros y un pipeline declarado de `image-feature-extraction`, el modelo no está pensado como generador de texto ni como clasificador de extremo a extremo, sino como backbone congelado o ajustable finamente sobre el que construir sistemas de análisis oftalmológico. Es relevante ahora porque los modelos fundacionales de dominio médico están demostrando que el preentrenamiento específico supera a los backbones genéricos en tareas de imagen especializada, y este caso aplica esa idea al segmento anterior ocular con una arquitectura moderna (DINOv3).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large) basado en DINOv3 |
| Parametros totales | 303.154.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | dinov3-license (acceso restringido/gated) |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tamaño Large (ViT-L) derivado de DINOv3, el marco de aprendizaje auto-supervisado de Meta para representaciones visuales densas. DINOv3 combina destilación de un profesor con objetivos de auto-supervisión que producen features de alta calidad tanto a nivel global como por parche, lo que resulta adecuado para tareas densas como segmentación. El modelo conserva esa estructura y adapta el dominio de entrada a imágenes OCT del segmento anterior ocular y córnea.

No se dispone de información publicada en la ficha de Hugging Face sobre el volumen de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO (no aplicable en un modelo de visión) ni innovaciones adicionales más allá del propio DINOv3. La información disponible se limita a los tags del repositorio (ophthalmology, cornea, anterior-segment, foundation-model, vit-large, dinov3) y al pipeline declarado de extracción de características. Cualquier dato sobre el corpus de ajuste, número de imágenes o estrategia de fine-tuning debe considerarse no disponible.

## Capacidades

- Extracción de características visuales densas sobre imágenes OCT de segmento anterior y córnea.
- Generación de embeddings globales por imagen, útiles para clasificación, recuperación o clustering.
- Generación de features por parche, aprovechables para tareas densas de segmentación y localización.
- Uso como backbone congelado para entrenar cabezas ligeras (linear probing) en tareas oftalmológicas.
- Uso como backbone ajustable finamente para tareas específicas del dominio corneal.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente visual.
- No tiene capacidades multilingües ni generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera de la imagen OCT.

## Casos de uso

- Segmentación de la córnea y del segmento anterior: se usarían los features por parche como entrada a un decodificador ligero (por ejemplo, un cabezal U-Net o un linear probe) para delimitar epitelio, estroma y endotelio en imágenes OCT.
- Clasificación de patologías corneales: entrenando un clasificador lineal sobre los embeddings globales se pueden distinguir queratocono, distrofias o edema corneal con relativamente pocas imágenes etiquetadas.
- Recuperación de imágenes similares (image retrieval): indexando los embeddings del modelo en una base vectorial se pueden buscar casos clínicamente parecidos dentro de un archivo hospitalario para apoyo al diagnóstico.
- Control de calidad de adquisición: usando la distancia entre embeddings de una misma exploración se puede detectar imágenes fuera de distribución, artefactos o adquisiciones defectuosas antes del análisis clínico.
- Preentrenamiento para modelos de informe automatizado: el backbone puede servir como extractor visual en un pipeline multimodal que combine los features OCT con un modelo de lenguaje para generar descripciones estructuradas.
- Investigación en imagen médica: como representación de referencia para comparar técnicas de aumento de datos, normalización o preprocesado en estudios de segmento anterior.
- Análisis longitudinal de seguimiento: comparando embeddings de exploraciones sucesivas del mismo paciente se pueden cuantificar cambios morfológicos a lo largo del tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,6 GB solo para pesos (303 M de parámetros), más memoria para activaciones; en la práctica, entre 1,5 y 3 GB para lotes pequeños de imágenes OCT de alta resolución.
- VRAM estimada en FP32: alrededor de 1,2 GB solo para pesos, más activaciones; entre 3 y 6 GB según tamaño de lote y resolución.
- GPU recomendadas: NVIDIA A100 o H100 para extracción por lotes a gran escala; RTX 4090, RTX 3090 o RTX A6000 para desarrollo e inferencia interactiva.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, etc.), incluso con lotes moderados.
- Opciones de despliegue: PyTorch nativo (librería declarada), exportación a ONNX o TorchScript para servir con Triton o similar; no se dispone de versiones GGUF ni de integración declarada con llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dominio | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KERAFound-DINOv3-OCT | 303 M | OCT segmento anterior / córnea | no aplica | dinov3-license (gated) | Hugging Face, acceso restringido |
| DINOv3 ViT-L (base) | ~300 M | Visión general | no aplica | dinov3-license | Hugging Face, acceso público |
| RETFound | ~300 M | Retina (OCT/Fundus) | no aplica | no disponible en esta ficha | Hugging Face |
| Modelos ViT-L genéricos (ImageNet) | ~300 M | Visión general | no aplica | variable | Hugging Face |

La comparación directa con RETFound u otros modelos fundacionales oftalmológicos no puede cuantificarse sin benchmarks publicados; la ventaja declarada de KERAFound-DINOv3-OCT es su especialización en segmento anterior y córnea, frente a alternativas centradas en retina.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia dinov3-license: impone condiciones específicas; debe revisarse antes de cualquier uso comercial.
- Especialización estrecha: el modelo está entrenado para OCT de segmento anterior y córnea; su rendimiento fuera de ese dominio no está documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta su validación en producción.
- Riesgo de sesgo de dominio: al no conocerse la composición del dataset de ajuste, no se puede evaluar la representatividad demográfica ni la variabilidad de equipos OCT.
- No es un modelo generativo ni conversacional: no debe emplearse para tareas de texto, razonamiento o agentes.
- Uso clínico: no hay validación regulatoria declarada; cualquier aplicación diagnóstica requiere evaluación independiente y cumplimiento normativo.
- Riesgo de sobreajuste a la distribución de entrenamiento: los embeddings pueden degradarse en imágenes con artefactos, baja calidad o dispositivos no representados en el corpus.

## Enlaces

- Hugging Face: https://huggingface.co/R2Squared/KERAFound-DINOv3-OCT
- DINOv3 (Meta AI): no disponible en la información proporcionada
- Paper de DINOv3: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
