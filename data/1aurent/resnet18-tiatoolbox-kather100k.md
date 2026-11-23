# 1aurent/resnet18.tiatoolbox-kather100k

## Resumen

`1aurent/resnet18.tiatoolbox-kather100k` es un modelo de clasificación de imágenes basado en la arquitectura ResNet18, publicado en Hugging Face por el usuario 1aurent y entrenado originalmente por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick. El modelo está especializado en el análisis de parches histológicos, concretamente en la clasificación de tejido de cáncer colorrectal a partir de imágenes de portaobjetos teñidos con hematoxilina y eosina (HE).

El modelo resuelve una tarea concreta dentro del campo de la patología computacional: clasificar parches de imagen de 224x224 píxeles en las nueve clases tisulares del dataset Kather100k (también conocido como NCT-CRC-HE). Con 11,2 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que lo hace adecuado para pipelines de análisis de imágenes histológicas a gran escala donde el rendimiento por imagen y el coste computacional son críticos.

Su relevancia actual radica en que forma parte del ecosistema TIAToolbox, una librería de referencia para análisis de imágenes de tejidos, y en que ofrece una alternativa ligera y con licencia permisiva (CC-BY-4.0) para tareas de clasificación y extracción de características en patología digital, un dominio donde los modelos de gran tamaño no siempre son viables por restricciones de infraestructura y privacidad de datos clínicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (red neuronal convolucional residual) |
| Parametros totales | 11.190.729 (11,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224x3) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch/timm, no documentada por el autor) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | CC-BY-4.0 (Creative Commons Attribution 4.0 International) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una ResNet18 estándar, una red convolucional residual con 18 capas (bloques residuales básicos) que procesa imágenes de 224x224x3 y produce una representación de 512 dimensiones en su capa final. La arquitectura emplea conexiones residuales para facilitar el entrenamiento de redes profundas y es ampliamente utilizada como backbone en tareas de visión por computador. El modelo se distribuye a través de la librería `timm` y puede cargarse directamente desde el Hub de Hugging Face.

El entrenamiento se realizó sobre el dataset Kather100k (NCT-CRC-HE), un conjunto de parches histológicos de cáncer colorrectal con nueve clases tisulares (tejido adiposo, fondo, debris, linfocitos, mucosidad, músculo liso, tejido normal, estroma y tumor). El modelo fue entrenado originalmente por el TIA Centre como parte de TIAToolbox. No se dispone de información detallada sobre el número de épocas, la composición exacta del dataset, el uso de aumentación de datos ni si se aplicaron técnicas de ajuste fino adicionales o regularización específica más allá del entrenamiento supervisado estándar de clasificación.

## Capacidades

- Clasificación de imágenes histológicas en las nueve clases del dataset Kather100k (NCT-CRC-HE).
- Extracción de características (feature extraction) mediante la configuración `num_classes=0`, que devuelve un vector de 512 dimensiones por imagen.
- Procesamiento de parches de imagen de 224x224 píxeles con normalización y transformaciones específicas del modelo, accesibles mediante `timm.data.resolve_model_data_config`.
- Integración con el ecosistema TIAToolbox para pipelines de análisis de imágenes de tejidos.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo ni modalidades distintas de la imagen.

## Casos de uso

- **Clasificación de parches histológicos en investigación oncológica**: el modelo clasifica parches de tejido colorrectal en categorías tisulares concretas, lo que permite cuantificar la composición del microambiente tumoral en estudios de investigación traslacional.
- **Extracción de características para modelos downstream**: usando `num_classes=0`, el modelo genera embeddings de 512 dimensiones que pueden alimentar clasificadores lineales, modelos de supervivencia o algoritmos de agrupamiento en pipelines de patología computacional.
- **Preprocesado en pipelines de TIAToolbox**: se integra como backbone en flujos de trabajo de la librería TIAToolbox para segmentación, detección o análisis de tejidos a nivel de WSI (whole-slide image).
- **Control de calidad de portaobjetos**: la clase "fondo" y "debris" permiten filtrar parches no tisulares antes de análisis más costosos, reduciendo el cómputo en pipelines de imágenes de gran tamaño.
- **Prototipado rápido en entornos con recursos limitados**: con 11,2 M de parámetros, el modelo puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace adecuado para pruebas de concepto y validación de pipelines antes de escalar a modelos mayores.
- **Análisis de imágenes en entornos con restricciones de privacidad**: al ser un modelo pequeño y con licencia permisiva, puede desplegarse localmente en hospitales o centros de investigación sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en precisión FP32 (11,2 M de parámetros, ~45 MB de pesos) y aproximadamente 0,2-0,3 GB en FP16. El cuello de botella es el tamaño del lote y las activaciones, no los pesos.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha la capacidad de GPUs de gama alta.
- **Compatibilidad con GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU y CPU.
- **Opciones de despliegue**: `timm` (carga directa desde el Hub), PyTorch nativo, TorchScript, ONNX Runtime, y exportación a TensorRT. No se documenta soporte específico para vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- **Latencia y throughput**: no se han publicado mediciones específicas. Por el tamaño del modelo, se espera un throughput alto en GPU (miles de imágenes por segundo en lotes grandes) y decenas o cientos de imágenes por segundo en CPU, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1aurent/resnet18.tiatoolbox-kather100k` | 11,2 M | Imagen 224x224x3 | Clasificación histológica (9 clases) | CC-BY-4.0 | Hugging Face, timm |
| ResNet50 (ImageNet) | ~25,6 M | Imagen 224x224x3 | Clasificación general de imágenes | BSD-3 / Apache-2.0 (según implementación) | Amplia (timm, torchvision) |
| Modelos histológicos tipo ViT (p. ej., backbones de HistoSSLscaling) | Decenas a cientos de millones | Imagen 224x224x3 | Clasificación / embeddings histológicos | Varía según modelo | Hugging Face, repositorios de investigación |

No se dispone de datos de rendimiento comparativo publicados para este modelo frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Dominio restringido**: el modelo está entrenado exclusivamente en parches histológicos de cáncer colorrectal teñidos con HE; su uso fuera de ese dominio (otros tejidos, otras tinciones, otras modalidades de imagen) no está validado y probablemente produzca resultados pobres.
- **Riesgo de alucinación**: como clasificador, no genera texto, pero puede producir clasificaciones erróneas con alta confianza en parches atípicos, artefactos de tinción o imágenes fuera de distribución.
- **Sesgos del dataset**: el dataset Kather100k procede de un número limitado de centros y escáneres, por lo que el modelo puede presentar sesgos hacia las características de color, resolución y protocolos de tinción de esos centros.
- **Sin validación clínica**: no se documenta validación clínica ni regulatoria; el modelo no debe usarse para diagnóstico médico sin una evaluación independiente y supervisión profesional.
- **Licencia CC-BY-4.0**: permite uso comercial y modificación con atribución, pero requiere citar al autor y la licencia original; no incluye garantías.
- **Sin información sobre cuantización**: no se documentan pesos cuantizados oficiales, aunque al ser un modelo pequeño la cuantización no es crítica para el despliegue.
- **Modelo de clasificación, no generativo**: no soporta tool calling, agentes, razonamiento multi-paso ni conversación; cualquier uso de ese tipo requeriría combinar con otros modelos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/1aurent/resnet18.tiatoolbox-kather100k)
- [Repositorio TIAToolbox en GitHub](https://github.com/TissueImageAnalytics/tiatoolbox)
- [Documentación de TIAToolbox](https://tia-toolbox.readthedocs.io/)
- [Dataset KatherPatchDataset (NCT-CRC-HE)](https://tia-toolbox.readthedocs.io/en/latest/_autosummary/tiatoolbox.models.dataset.info.KatherPatchDataset.html)
- [Tissue Image Analytics Centre (Universidad de Warwick)](https://warwick.ac.uk/fac/cross_fac/tia/)
- [Artículo TIAToolbox (Communications Medicine, 2022)](https://www.nature.com/articles/s43856-022-00186-5)
- [Licencia CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode)
- [Repositorio HistoSSLscaling (imagen de ejemplo)](https://github.com/owkin/HistoSSLscaling)
