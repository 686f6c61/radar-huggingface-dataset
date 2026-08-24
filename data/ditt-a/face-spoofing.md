# ditt-a/Face-Spoofing

## Resumen

El modelo `ditt-a/Face-Spoofing` es un sistema de detección de suplantación facial (face spoofing) desarrollado por el autor Ditt-A. Su objetivo es clasificar imágenes faciales en seis categorías distintas, distinguiendo entre rostros reales y diferentes tipos de ataques de presentación (fotografías, vídeos, máscaras, etc.). El proyecto se aloja en un repositorio de GitHub que describe el uso de arquitecturas de visión modernas como DINOv3 y ConvNeXt, junto con módulos específicos como FSFM (Face Spoofing Feature Module), preprocesamiento de doble vista, aumento de datos en test (TTA) y fusión de conjuntos.

La información pública disponible es muy limitada: la model card de HuggingFace solo incluye la licencia Apache 2.0 y no proporciona detalles técnicos sobre parámetros, arquitectura interna o datos de entrenamiento. La mayor parte de lo que se conoce proviene del repositorio de GitHub asociado, que describe el enfoque metodológico pero no ofrece métricas cuantitativas ni especificaciones de hardware. A pesar de su escasa documentación, el modelo aborda un problema relevante en seguridad biométrica: la vulnerabilidad de los sistemas de reconocimiento facial ante ataques de suplantación cada vez más sofisticados, incluidos los generados por IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en DINOv3 y ConvNeXt (según repositorio de GitHub); no confirmado en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Según el repositorio de GitHub `Ditt-A/Face-Spoofing-Detection`, el modelo emplea una combinación de arquitecturas de visión por computadora: DINOv3 (un modelo de visión autosupervisado) y ConvNeXt (una red convolucional moderna). También se menciona el uso de FSFM (Face Spoofing Feature Module), un módulo específico para extraer características de suplantación facial. El pipeline incluye preprocesamiento de doble vista (dual-view preprocessing), aumento de datos en tiempo de test (TTA) y fusión de conjuntos (ensemble fusion). Además, se utiliza limpieza de datos basada en embeddings de DINOv3 para depurar el conjunto de entrenamiento.

No se dispone de información concreta sobre el número de parámetros, la cantidad de datos de entrenamiento, la composición del dataset ni el proceso de optimización (pérdidas, regularización, etc.). Al ser un modelo de clasificación de imágenes, no se aplican técnicas como RLHF o DPO propias de los modelos de lenguaje. La ausencia de una model card detallada impide conocer los detalles exactos del entrenamiento.

## Capacidades

- Clasificación de imágenes faciales en seis clases distintas, que incluyen rostros reales y diferentes tipos de ataques de presentación (fotografía, vídeo, máscara, etc.).
- Detección de suplantación facial en imágenes estáticas, orientada a sistemas de verificación de identidad.
- Uso de técnicas de aumento de datos en test (TTA) y fusión de conjuntos para mejorar la robustez.
- Preprocesamiento de doble vista para capturar información complementaria de la imagen.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni razonamiento multi-paso, ni capacidades multilingües.

## Casos de uso

- Verificación de identidad en onboarding digital: el modelo puede clasificar si una foto de un usuario es real o un ataque de presentación (por ejemplo, una foto impresa o una pantalla), ayudando a prevenir fraudes en la apertura de cuentas bancarias o servicios financieros.
- Control de acceso biométrico: integración en sistemas de seguridad física que requieren autenticación facial, donde el modelo descarta intentos de suplantación con fotografías o vídeos.
- Prevención de fraude en pagos móviles: uso en aplicaciones de banca móvil que emplean reconocimiento facial para autorizar transacciones, añadiendo una capa de detección de ataques de presentación.
- Auditoría de sistemas de reconocimiento facial: el modelo puede utilizarse para evaluar la vulnerabilidad de otros sistemas ante ataques de suplantación, generando informes de seguridad.
- Investigación académica en anti-suplantación facial: sirve como punto de partida para estudiar técnicas de detección de ataques de presentación, dado su enfoque con DINOv3 y ConvNeXt.
- Sistemas de videovigilancia inteligente: clasificación en tiempo real de rostros captados por cámaras para identificar posibles intentos de engaño con máscaras o imágenes impresas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de GitHub no incluye métricas de rendimiento (precisión, recall, F1, etc.) ni comparaciones con otros modelos de detección de suplantación facial. Tampoco se dispone de datos sobre latencia o throughput.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- Dado que el modelo se basa en arquitecturas de visión como DINOv3 y ConvNeXt, es probable que requiera una GPU con al menos 8-16 GB de VRAM para inferencia, pero esto es una estimación no confirmada.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc., no aplican al ser un modelo de visión).
- Se desconoce si el modelo puede ejecutarse en hardware de consumo (por ejemplo, RTX 3060 o similar) sin cuantización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de suplantación facial). Existen otros sistemas en la literatura, como los basados en redes neuronales convolucionales tradicionales o en transformers de visión, pero no se han encontrado datos concretos que permitan una comparación cuantitativa con este modelo.

## Limitaciones y advertencias

- La documentación es extremadamente escasa: no hay model card detallada, ni especificaciones técnicas, ni resultados de evaluación. Esto dificulta su uso en producción sin una validación adicional.
- Al ser un modelo de clasificación de imágenes, su rendimiento depende en gran medida de la calidad y diversidad del conjunto de entrenamiento, del cual no se conocen detalles.
- Riesgo de sesgos: si el dataset de entrenamiento no es representativo de la población objetivo, el modelo puede tener un rendimiento desigual en diferentes grupos demográficos o condiciones de iluminación.
- Riesgo de alucinación no aplica (no es un modelo generativo de texto), pero sí existe riesgo de falsos positivos o falsos negativos en la detección de suplantación, lo que puede tener consecuencias de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero al no haber información sobre los datos de entrenamiento, no se puede garantizar que estos no contengan material con derechos de autor o datos personales.
- No se especifica si el modelo está optimizado para vídeo o solo para imágenes estáticas; el repositorio menciona "imágenes faciales", por lo que su uso en vídeo podría requerir adaptaciones.

## Enlaces

- HuggingFace: https://huggingface.co/ditt-a/Face-Spoofing
- Repositorio de GitHub: https://github.com/Ditt-A/Face-Spoofing-Detection
- Artículo de arXiv sobre detección de suplantación facial con deep learning: https://arxiv.org/html/2503.19223v1
- Artículo de arXiv sobre MS-MFAD (multimodal LLM para anti-suplantación): https://arxiv.org/abs/2608.17328
- Blog de Facia sobre cómo las selfies falsas de IA evaden la verificación de identidad: https://facia.ai/blog/how-fake-ai-selfies-bypass-identity-verification/
