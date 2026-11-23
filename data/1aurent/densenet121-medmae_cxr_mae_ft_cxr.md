# 1aurent/densenet121.medmae_CXR_mae_ft_CXR

## Resumen

DenseNet-121 con pesos inicializados mediante aprendizaje autosupervisado sobre radiografías de tórax (MedMAE) y posteriormente ajustado de forma supervisada para clasificación de imágenes de rayos X de tórax (CXR). Lo desarrolla el usuario 1aurent y se publica bajo licencia Apache 2.0 en Hugging Face mediante la librería `timm`. Resuelve la tarea de clasificación de imágenes médicas de tórax, un dominio donde el preentrenamiento específico sobre el mismo tipo de imagen (CXR) suele mejorar la transferencia frente a pesos preentrenados en ImageNet.

El modelo es una red convolucional DenseNet-121 con 7.051.854 parámetros, un tamaño muy contenido que permite despliegue en hardware modesto. La model card publicada es mínima: no detalla el dataset de ajuste fino, el número de clases de salida, la resolución de entrada ni los resultados obtenidos. La información disponible se limita a los metadatos del repositorio y a la arquitectura declarada por la librería.

Por su naturaleza, no es un modelo generativo ni un modelo de lenguaje: es un clasificador de imágenes. Por tanto, no dispone de contexto textual, tool calling, capacidades multilingües ni razonamiento de múltiples pasos. Su relevancia radica en ser un ejemplo de reutilización de un backbone convolucional clásico con preentrenamiento de dominio médico para tareas de clasificación radiológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (red convolucional densamente conectada, backbone `timm`) |
| Parametros totales | 7.051.854 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada) |
| Idiomas soportados | no disponible (no aplica; el modelo procesa imágenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DenseNet-121, una red convolucional en la que cada capa recibe como entrada las salidas de todas las capas anteriores dentro de un bloque denso, lo que favorece la reutilización de características y reduce el número de parámetros frente a arquitecturas equivalentes en profundidad. El modelo se integra en `timm` como `image-classification`.

El entrenamiento declarado por el nombre del checkpoint sigue un esquema en dos fases: primero un preentrenamiento autosupervisado tipo MAE (masked autoencoder) sobre imágenes de radiografía de tórax, identificado como `medmae_CXR`, y después un ajuste fino supervisado sobre datos de CXR (`mae_ft_CXR`). No se especifican en la información disponible el número de imágenes de preentrenamiento, la composición del dataset de ajuste fino, el número de épocas, la resolución de entrada, las técnicas de aumento de datos ni si se aplicaron estrategias de regularización o balanceo de clases.

## Capacidades

- Clasificación de imágenes de radiografía de tórax (image-classification) mediante un backbone convolucional DenseNet-121.
- Extracción de características visuales de imágenes médicas de tórax, aprovechable como encoder en pipelines posteriores.
- Inferencia ligera: 7,05 millones de parámetros, adecuada para entornos con recursos limitados.
- Compatibilidad con el ecosistema `timm` para carga, evaluación y ajuste fino adicional.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, visión-lenguaje, audio ni modo de razonamiento explícito.
- El número de clases de salida y las etiquetas concretas no están documentados en la información disponible.

## Casos de uso

- Triaje preliminar de radiografías de tórax: el modelo puede clasificar imágenes CXR en categorías de hallazgo para priorizar la revisión por parte de radiólogos, aprovechando su preentrenamiento específico de dominio.
- Filtrado y curación de datasets radiológicos: usar las predicciones como señal automática para etiquetar o descartar imágenes en la construcción de corpus médicos, dado su bajo coste computacional.
- Extracción de embeddings para búsqueda por similitud: emplear las características del backbone DenseNet-121 como vector de representación de imágenes CXR en sistemas de recuperación de casos similares.
- Punto de partida para ajuste fino en tareas radiológicas específicas: al estar preentrenado sobre CXR, sirve como inicialización para clasificadores de patologías concretas con datasets pequeños.
- Evaluación comparativa de preentrenamientos médicos: permite contrastar el rendimiento de un backbone preentrenado con MAE sobre CXR frente a pesos ImageNet en experimentos controlados.
- Despliegue en entornos con hardware limitado: sus 7 millones de parámetros permiten ejecución en CPU o GPU de gama baja para clasificación por lotes de imágenes de tórax.
- Prototipado docente o de investigación: modelo ligero para demostrar pipelines de clasificación de imágenes médicas con `timm` sin requerir infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 7,05 millones de parámetros en precisión FP32 el peso ocupa aproximadamente 28 MB, y en FP16 unos 14 MB. El consumo real de memoria vendrá dominado por el tamaño del lote y la resolución de entrada, no por los pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3090, RTX 3060 o incluso una GPU integrada pueden ejecutar el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en CPU para inferencia por lotes moderados.
- Opciones de despliegue: `timm` con PyTorch como vía principal; exportación a ONNX o TorchScript para servir; integración en pipelines personalizados con FastAPI o TorchServe. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1aurent/densenet121.medmae_CXR_mae_ft_CXR | 7.051.854 | no aplica | Clasificación CXR | Apache 2.0 | Hugging Face (timm) |
| DenseNet-121 preentrenado en ImageNet (timm) | ~7-8 M | no aplica | Clasificación general de imágenes | Apache 2.0 / BSD según checkpoint | Hugging Face (timm) |
| ResNet-50 preentrenado en ImageNet (timm) | ~25,6 M | no aplica | Clasificación general de imágenes | Apache 2.0 | Hugging Face (timm) |
| Backbones CXR alternativos (p. ej. CheXNet, DenseNet-121 CXR) | ~7-8 M | no aplica | Clasificación CXR | variable según publicación | Repositorios académicos y Hugging Face |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no documenta el dataset de ajuste fino, las clases de salida, la resolución de entrada ni las métricas obtenidas, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de sesgo de dominio: al haberse entrenado con un conjunto de datos CXR no especificado, puede generalizar mal a otros equipos, protocolos de adquisición o poblaciones distintas.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos: un clasificador médico puede producir predicciones erróneas con alta confianza; no debe usarse como sustituto del diagnóstico profesional.
- No es un modelo de lenguaje: no admite instrucciones en texto, tool calling ni razonamiento multi-paso; cualquier descripción de esas capacidades sería incorrecta.
- Licencia Apache 2.0 permite uso comercial, pero el uso clínico puede estar sujeto a regulación sanitaria (marcado CE, FDA u otras) independientemente de la licencia del modelo.
- No hay información sobre calibración de probabilidades, umbrales recomendados ni validación externa.
- El número de descargas (53) y de likes (0) sugiere una adopción muy limitada, por lo que no existe una comunidad amplia que haya validado el modelo.
- Última actualización del repositorio en 2026-11-23; conviene verificar si el checkpoint ha cambiado respecto a la versión original de 2023.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/densenet121.medmae_CXR_mae_ft_CXR
- Librería `timm`: https://github.com/huggingface/pytorch-image-models
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
