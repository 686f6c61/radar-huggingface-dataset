# FarmGuard/cotton-densenet121

## Resumen

FarmGuard Cotton DenseNet-121 es un clasificador de imágenes de 4 clases para enfermedades de la hoja del algodón, publicado por la organización FarmGuard en HuggingFace bajo licencia MIT. Está construido sobre una DenseNet-121 con backbone preentrenado en ImageNet y entrenado con PyTorch y torchvision. El modelo toma imágenes RGB de 224 x 224 píxeles y devuelve una de cuatro etiquetas: bacterial blight, curl virus, fussarium wilt (grafía tal cual figura en la model card) y healthy.

El problema que aborda es el diagnóstico visual temprano de patologías del algodón, una tarea en la que el acceso a fitopatólogos es limitado en muchas zonas productoras. Al tratarse de una CNN de pequeño tamaño (aproximadamente 7 millones de parámetros), es candidata a despliegue en dispositivos de borde, teléfonos o sistemas embebidos, sin necesidad de GPU de datacenter.

Su relevancia actual es doble: por un lado, demuestra que arquitecturas convolucionales clásicas siguen siendo competitivas en dominios verticales con pocas clases y datasets controlados, como indican las métricas declaradas (98,9967 % de accuracy en test, 99,0914 % de F1 macro). Por otro, la model card es notablemente parca: no se documentan el dataset de entrenamiento, el número de imágenes, el reparto de splits ni el proceso de ajuste fino, lo que limita seriamente su reproducibilidad y su validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 con backbone preentrenado en ImageNet (torchvision) |
| Parametros totales | Aproximadamente 6,96 millones (estimación derivada de la arquitectura DenseNet-121 con cabezal de 4 clases; no indicado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes) |
| Tipos de cuantizacion | No disponibles; se distribuye presumiblemente en FP32 |
| Idiomas soportados | No aplica (clasificación de imágenes; las etiquetas están en inglés) |
| Licencia | MIT |
| Formato de pesos | No especificado en la model card; el repositorio usa PyTorch y torchvision y contiene `inference.py` y `classes.json` (formato esperado: state_dict de PyTorch, `.pth`/`.pt`) |

Datos adicionales declarados: entrada 224 x 224 RGB, 4 clases, tamaño de repositorio 0,1 GB, pipeline `image-classification`, 0 descargas y 0 likes en el momento del registro.

## Arquitectura y entrenamiento

La arquitectura es una DenseNet-121 estándar: una red convolucional con conexiones densas, en la que cada capa recibe como entrada las salidas de todas las capas anteriores del mismo bloque. La implementación parte del backbone preentrenado en ImageNet de torchvision y sustituye el cabezal de clasificación por uno de 4 salidas, que es el esquema habitual de *fine-tuning* para clasificación de imágenes en dominios específicos. La model card no detalla si el entrenamiento fue de ajuste completo o por capas congeladas, ni la tasa de aprendizaje, el optimizador, el número de épocas o si se aplicó *data augmentation*.

Tampoco se documenta la composición del dataset: no consta la procedencia de las imágenes, el número de ejemplares por clase, la proporción de los splits de entrenamiento, validación y test, ni la técnica de partición. Las únicas cifras de entrenamiento publicadas son las métricas finales: 98,9967 % de accuracy en test, 99,0914 % de F1 macro en test y 99,66 % de mejor accuracy de validación. No se menciona ningún uso de RLHF, DPO o técnicas de alineación, algo esperable en un clasificador de imágenes. Tampoco se describe ninguna innovación técnica, destilación, decodificación especulativa ni mecanismo de atención lineal.

El preprocesado está completamente especificado en la model card, lo cual es un punto a favor para la reproducibilidad de la inferencia: `Resize(256)`, `CenterCrop(224)`, `ToTensor()` y `Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225))`.

## Capacidades

- Clasificación de imágenes de hojas de algodón en 4 categorías: bacterial blight, curl virus, fussarium wilt y healthy.
- Entrada fija de 224 x 224 píxeles en RGB, con el preprocesado concreto indicado más arriba.
- Salida de clasificación de imagen única (no hay evidencia de que soporte segmentación, detección de cajas ni clasificación multi-etiqueta).
- Integración directa con el ecosistema PyTorch y torchvision; el repositorio incluye un script `inference.py` y el fichero `classes.json` con el orden de clases.
- No soporta generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo de razonamiento (*thinking mode*), ni entrada de audio o vídeo documentada.
- No hay documentación de capacidades de *zero-shot* ni de clasificación de clases no vistas.

## Casos de uso

- Diagnóstico asistido en aplicación móvil: el modelo puede ejecutarse embebido en una app de campo (por ejemplo, vía TorchScript, ONNX Runtime o PyTorch Mobile) para que el agricultor fotografíe una hoja y obtenga una de las cuatro etiquetas en el propio dispositivo, sin conexión y con un peso de pesos del orden de decenas de megabytes.
- Triaje previo a un extensionista agrícola: la clasificación automática permite priorizar qué parcelas requieren inspección humana, reduciendo el coste de desplazamiento en explotaciones extensivas de algodón.
- Monitorización con dron o robot agrícola: al ser una CNN de coste bajo, puede integrarse en un pipeline que recorte hojas de imágenes aéreas o de robot y las clasifique por lotes, generando mapas de incidencia por parcela.
- Preclasificación en laboratorio fitopatológico: uso como primer filtro para separar muestras presumiblemente sanas de muestras sospechosas, dejando la confirmación por cultivo o PCR al personal técnico.
- API de asesoramiento agronómico: exposición del modelo detrás de un servicio HTTP con FastAPI o TorchServe, de modo que otras aplicaciones (ERP agrícola, cuadernos de campo digitales) envíen imágenes y reciban la etiqueta y la probabilidad asociada.
- Despliegue en borde de bajo consumo: su tamaño permite ejecutarlo en Raspberry Pi, Jetson Nano o incluso CPU de portátil para prototipos y demostraciones, siempre con la advertencia de que no hay mediciones de latencia publicadas.
- Curación y anotación de datasets: uso como etiquetador previo para preanotar imágenes de algodón antes de la revisión manual, acelerando la construcción de conjuntos de datos mayores.
- Material educativo y de investigación: como caso de estudio de *fine-tuning* de DenseNet-121 en un dominio vertical con licencia permisiva, útil en cursos de visión por computador aplicada.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los declarados por el autor en la model card. No se especifica el tamaño del conjunto de test ni la metodología de evaluación.

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 98,9967 % | Test (conjunto reservado preparado por el autor) |
| F1 macro | 99,0914 % | Test (conjunto reservado preparado por el autor) |
| Mejor accuracy de validación | 99,66 % | Validación |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible; esos benchmarks no son aplicables a un clasificador de imágenes. Tampoco se aportan métricas por clase, matriz de confusión ni intervalos de confianza.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 28 MB para unos 6,96 millones de parámetros; en FP16, unos 14 MB; en INT8, unos 7 MB (cálculo aritmético a partir del número estimado de parámetros, no una medición publicada).
- VRAM estimada para inferencia: menos de 1 GB para lotes pequeños a 224 x 224 en FP32, incluyendo activaciones; cabe holgadamente en cualquier GPU con 4 GB o más. Estas cifras son estimaciones de orden de magnitud, no mediciones del autor.
- GPU recomendadas: cualquier GPU moderna es suficiente; para servicio en producción, NVIDIA T4, L4, RTX 3060/4090 o A100/H100 servirían con enorme margen. El modelo está claramente sobredimensionado para GPUs de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2-4 GB de memoria, e incluso en iGPU recientes.
- Cabe en CPU: sí; es viable inferencia en CPU para tráfico moderado, aunque no hay datos de latencia publicados.
- Opciones de despliegue: PyTorch nativo (script `inference.py` incluido), TorchScript, `torch.compile`, exportación a ONNX Runtime, TensorRT para Jetson, TorchServe o FastAPI para servicio HTTP, y PyTorch Mobile/ExecuTorch para móvil. vLLM, TGI, llama.cpp y Ollama están orientados a modelos de lenguaje y no aplican a esta arquitectura.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de imágenes por segundo en ninguna plataforma.

## Comparativa con modelos similares

No se dispone de comparativas publicadas en la información proporcionada frente a otros clasificadores de enfermedades del algodón. La model card no cita líneas base ni modelos alternativos. A continuación se incluye únicamente una referencia a nivel de arquitectura, marcada como orientativa y no como comparación de rendimiento en esta tarea:

| Modelo | Parametros (orientativo) | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| FarmGuard Cotton DenseNet-121 | ~6,96 M (estimado) | Imagen 224 x 224 RGB | MIT | HuggingFace, pesos no detallados |
| DenseNet-121 (ImageNet, torchvision) | ~7,98 M | Imagen 224 x 224 RGB | BSD-3-Clause (torchvision) | Pública, ampliamente usada |
| ResNet-50 (ImageNet, torchvision) | ~25,6 M | Imagen 224 x 224 RGB | BSD-3-Clause (torchvision) | Pública, ampliamente usada |
| MobileNetV3-Large (ImageNet) | ~5,5 M | Imagen 224 x 224 RGB | BSD-3-Clause (torchvision) | Pública, orientada a móvil |

Estos datos son cifras de arquitectura ampliamente conocidas y no resultados medidos sobre el mismo conjunto de datos de algodón, por lo que no permiten afirmar superioridad de ninguno de ellos en esta tarea concreta.

## Limitaciones y advertencias

- Cobertura de clases muy reducida: solo 4 categorías. Cualquier otra enfermedad, plaga, carencia nutricional o daño abiótico caerá forzosamente en una de las cuatro clases, con riesgo de falsos positivos.
- Sesgo de dominio probable: el propio autor advierte que el modelo se evaluó en un conjunto reservado preparado y que puede comportarse de forma distinta con otros cultivares, cámaras, iluminaciones, fondos o enfermedades no vistas. Es la advertencia más relevante para producción.
- Dataset de entrenamiento no documentado: se desconoce la procedencia, el tamaño y la distribución de las imágenes. Las métricas de casi el 99 % deben interpretarse con cautela porque no son verificables de forma independiente y suelen indicar condiciones de laboratorio poco representativas del campo.
- Riesgo de alucinación en sentido funcional: en clasificación, el equivalente es una predicción segura y errónea, especialmente en imágenes fuera de distribución. No se documenta ningún mecanismo de rechazo, umbral de confianza ni clase "desconocido".
- Sin métricas por clase ni matriz de confusión: no se puede saber si las clases minoritarias o visualmente similares (por ejemplo, curl virus frente a síntomas de estrés hídrico) se confunden entre sí.
- Etiqueta con errata: la clase 2 figura como "fussarium wilt" (grafía incorrecta de *fusarium wilt*) tanto en la model card como, presumiblemente, en `classes.json`. Conviene normalizarla en producción sin alterar el orden de clases.
- Licencia MIT frente al uso previsto: la licencia permite uso comercial, modificación y redistribución con atribución, pero la model card declara explícitamente que el modelo está pensado para investigación y uso experimental y que no constituye un diagnóstico agrícola definitivo. Cualquier uso comercial en asesoramiento agronómico debería ir acompañado de validación propia y avisos legales.
- Sin información sobre el formato exacto de los pesos ni sobre el fichero de checkpoint incluido en el repositorio de 0,1 GB.
- Ausencia de mantenimiento y adopción: 0 descargas y 0 likes en el momento del registro, sin comunidad que haya reportado problemas o validaciones.
- Fecha de creación y actualización muy próximas (15 de septiembre de 2026, con tres minutos de diferencia), lo que sugiere una publicación sin iteración posterior.
- No apto como sustituto de diagnóstico profesional: cualquier despliegue debe presentar la salida como orientativa y derivar la confirmación a un fitopatólogo.
- Idiomas: las etiquetas están en inglés; si el producto final es en castellano habrá que mapear las clases.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FarmGuard/cotton-densenet121
- Repositorio de torchvision (DenseNet-121): https://github.com/pytorch/vision
- Documentación de PyTorch: https://pytorch.org/docs/stable/index.html
- Paper original de DenseNet (Huang et al., 2016): https://arxiv.org/abs/1608.06993
- La búsqueda web realizada no devolvió enlaces relevantes al modelo: los resultados obtenidos correspondían a páginas genéricas de YouTube (https://www.youtube.com/, https://www.youtube.com/youtube, https://play.google.com/store/apps/details?id=com.google.android.youtube, https://accounts.google.com/InteractiveLogin?service=youtube, https://movies.youtube.com/), sin relación con FarmGuard ni con clasificación de enfermedades del algodón.
- No se han encontrado paper, blog técnico, demo ni repositorio adicional asociados al modelo en la información proporcionada.
