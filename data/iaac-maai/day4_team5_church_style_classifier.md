# iaac-maai/day4_team5_church_style_classifier

## Resumen

El modelo `day4_team5_church_style_classifier` es un clasificador de imágenes desarrollado por el equipo 5 del curso AI Methods I del IAAC MaAI (2026/27), compuesto por Soumyajyoti Datta, Sindhuja Davuluri, Breno Sader y Diego Alpízar. Su tarea es predecir el estilo arquitectónico de una iglesia a partir de una única fotografía de su exterior, entre seis categorías: románico, gótico, renacentista, barroco, clásico (neoclásico) y moderno. Está pensado como herramienta de preclasificación de archivos fotográficos para expertos en patrimonio.

Técnicamente se trata de un ResNet18 de 11,2 millones de parámetros, preentrenado en ImageNet-1k mediante `torchvision`, con todas las capas congeladas y una nueva capa final `nn.Linear(512, 6)` entrenada sobre el dataset WikiChurches. Solo 3.078 parámetros son entrenables. La entrada es una imagen RGB redimensionada a 256 px, recortada al centro a 224 × 224 y normalizada con la media y desviación estándar de ImageNet.

El modelo es relevante como ejemplo reproducible de transferencia de aprendizaje con congelación de capas en un dominio especializado y de granularidad fina, y como utilidad práctica de bajo coste computacional para instituciones patrimoniales. Su rendimiento en test (788 imágenes) es de 0,555 de accuracy y 0,548 de macro F1, frente a 0,190 y 0,053 de la línea base de clase mayoritaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (CNN residual), capas preentrenadas congeladas y nueva capa final `nn.Linear(512, 6)` |
| Parametros totales | 11,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión; etiquetas en inglés) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (state_dict de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet18 estándar de `torchvision` (`ResNet18_Weights.DEFAULT`), preentrenada en ImageNet-1k. Todas las capas convolucionales y de normalización por lotes del backbone se congelan y solo se entrena una nueva capa lineal final que proyecta el vector de 512 dimensiones a 6 logits, uno por estilo arquitectónico. La salida se pasa por softmax para obtener una probabilidad por clase. El preprocesado sigue exactamente las transformaciones por defecto de los pesos de ImageNet: redimensionado a 256 px, recorte central a 224 × 224 y normalización con media y desviación estándar de ImageNet.

El entrenamiento se realizó sobre el dataset WikiChurches-6, una versión de seis clases del WikiChurches de Barz y Denzler (NeurIPS 2021 Datasets and Benchmarks), disponible en Zenodo con DOI 10.5281/zenodo.5166987. Los splits oficiales están hechos por iglesia (ninguna iglesia aparece en dos splits). El subconjunto reproducible usado (semilla 42) consta de 1.552 imágenes de entrenamiento (máximo 300 por clase; la clase renacentista solo tiene 64), 306 de validación (unas 50 por clase) y 788 de test (máximo 150 por clase). Las etiquetas provienen del estilo de la iglesia en Wikidata, reagrupado por WikiChurches en seis clases de primer nivel; los estilos revival (por ejemplo, neogótico) se etiquetan con su estilo histórico. La cobertura geográfica es mayoritariamente Alemania y países europeos vecinos. No se documenta en la información disponible el uso de RLHF, DPO ni aumentación de datos más allá del preprocesado estándar.

## Capacidades

- Clasificación de imágenes de exteriores de iglesias en seis estilos arquitectónicos: románico, gótico, renacentista, barroco, clásico (neoclásico) y moderno.
- Salida de una probabilidad por clase mediante softmax sobre seis logits, en el orden definido en `classes.json`.
- Preclasificación masiva de archivos fotográficos para su revisión posterior por expertos en patrimonio.
- Funciona con una única imagen RGB de entrada, sin necesidad de metadatos ni texto adicional.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento.
- No es un modelo generativo: no produce descripciones ni justificaciones, solo etiquetas y probabilidades.

## Casos de uso

- Preclasificación de archivos fotográficos de patrimonio: el modelo puede procesar lotes de fotografías de exteriores de iglesias y asignar una etiqueta de estilo a cada una, reduciendo el trabajo manual de catalogación previa. Las imágenes con probabilidad superior al 60 % pueden revisarse con prioridad baja y el resto derivarse a un experto.
- Triaje en oficinas de patrimonio: dado un fondo documental sin clasificar, el modelo permite agrupar las imágenes por estilo antes de la revisión humana, acelerando la organización de inventarios.
- Apoyo a la investigación en historia de la arquitectura: los investigadores pueden usar las predicciones como señal preliminar para seleccionar subconjuntos de imágenes de un estilo concreto y analizarlos con más detalle.
- Herramienta docente en cursos de visión por computador: sirve como ejemplo reproducible de transferencia de aprendizaje con congelación de capas sobre un dataset de granularidad fina, con pipeline completo disponible en GitHub.
- Filtrado de imágenes en repositorios de Wikimedia Commons: permite etiquetar automáticamente fotografías de iglesias por estilo para mejorar la organización y búsqueda en dichos repositorios.
- Validación de metadatos existentes: las predicciones pueden contrastarse con las etiquetas de estilo ya registradas en bases de datos patrimoniales para detectar posibles discrepancias y priorizar su revisión.
- Prototipado de bajo coste: al ser un ResNet18 con solo 3.078 parámetros entrenables, puede desplegarse en hardware modesto (incluso CPU) para pruebas de concepto en instituciones sin infraestructura de GPU.

## Benchmarks y rendimiento

| Modelo | Accuracy (test, 788 imágenes) | Macro F1 (test) |
|---|---|---|
| Línea base: siempre la clase mayoritaria | 0,190 | 0,053 |
| **Este modelo** | **0,555** | **0,548** |

En la información disponible no se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), ya que no aplican a un clasificador de imágenes. Los únicos datos de rendimiento son los de test sobre WikiChurches-6 recogidos en la tabla anterior. La model card señala además que, en las doce imágenes de test mostradas como ejemplo, ocho son correctas y cuatro erróneas, y que los errores se concentran entre estilos próximos (renacentista predicho como barroco, barroco con torre medieval predicho como románico, y confusión entre románico y gótico). Las probabilidades bajas (31 %, 46 %) en predicciones correctas indican que el modelo a menudo no está seguro aunque acierte.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB en FP32 para un ResNet18 de 11,2 M de parámetros; no se dispone de cifras medidas en la información proporcionada.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo puede ejecutarse en CPU sin problema. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la documentación.
- Cabe en cualquier GPU de consumo e incluso en CPU; el cuello de botella es el preprocesado de imágenes, no el modelo.
- Opciones de despliegue: PyTorch con `torchvision` es la vía natural, ya que los pesos se distribuyen como `state_dict` en `model.pt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet18 + capa final) | 11,2 M (3.078 entrenables) | no aplica | Accuracy 0,555; macro F1 0,548 en WikiChurches-6 test | MIT | Hugging Face y GitHub |
| ResNet18 preentrenado en ImageNet-1k (base) | 11,2 M | no aplica | No entrenado para estilos arquitectónicos; no disponible como clasificador de estilos | Licencia de torchvision | torchvision |
| WikiChurches (dataset de referencia) | no aplica | no aplica | No es un modelo, sino el dataset de evaluación | CC BY-SA 4.0 (imágenes con licencias individuales) | Zenodo, DOI 10.5281/zenodo.5166987 |

No se dispone en la información proporcionada de otros modelos comparables de clasificación de estilos arquitectónicos con los que establecer una comparación cuantitativa. La comparación con la línea base de clase mayoritaria se recoge en la sección de benchmarks.

## Limitaciones y advertencias

- El modelo solo debe usarse con fotografías de exteriores de iglesias; no es válido para interiores, detalles, planos, dibujos ni edificios que no sean iglesias.
- No sirve para datar ni atribuir una iglesia concreta, ni para tomar decisiones de protección patrimonial, legales o de financiación sin revisión experta.
- Las iglesias de regiones poco representadas en el entrenamiento (fuera de Europa) deben revisarse siempre antes de confiar en la predicción.
- Las probabilidades softmax no están calibradas como probabilidades de acierto; el umbral del 60 % es una heurística de revisión, no una garantía.
- El modelo a menudo está inseguro incluso cuando acierta, con probabilidades bajas en predicciones correctas.
- Los errores se concentran entre estilos próximos (románico/gótico, renacentista/barroco), lo que limita su utilidad en fronteras estilísticas difusas.
- La clase renacentista está infrarrepresentada en entrenamiento (solo 64 imágenes), lo que puede sesgar el rendimiento hacia esa clase.
- El dataset de entrenamiento está mayoritariamente centrado en Alemania y países europeos vecinos, lo que introduce sesgo geográfico.
- Licencia MIT para el modelo, pero las imágenes del dataset WikiChurches conservan sus licencias individuales de Wikimedia Commons (CC BY-SA, CC BY, CC0, dominio público, etc.), lo que debe tenerse en cuenta si se redistribuyen datos.
- No se documentan sesgos adicionales ni evaluaciones de robustez más allá de los resultados de test disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/iaac-maai/day4_team5_church_style_classifier
- Repositorio GitHub del pipeline completo: https://github.com/iaac-maai/5-day4-assignment
- Dataset WikiChurches en Zenodo: https://zenodo.org/records/5166987
- DOI del dataset: https://doi.org/10.5281/zenodo.5166987
- Imagen de predicciones de test: https://huggingface.co/iaac-maai/day4_team5_church_style_classifier/resolve/main/test_predictions.png
- Gráfico de métricas frente a línea base: https://huggingface.co/iaac-maai/day4_team5_church_style_classifier/resolve/main/test_vs_baseline.png
