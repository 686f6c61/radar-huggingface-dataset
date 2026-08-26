# OneScience-Group/RemoteCLIP

## Resumen

RemoteCLIP es un modelo fundacional de visión-lenguaje (vision-language) diseñado específicamente para teledetección, propuesto por investigadores de la Universidad de Hohai, la Universidad de Ciencia y Tecnología de Hong Kong, la Universidad Forestal de Nankín, la Academia China de Silvicultura y la Universidad Griffith. Es el primer modelo de este tipo orientado a imágenes de satélite y UAV, y resuelve el problema de que los modelos de aprendizaje autosupervisado (SSL) y enmascaramiento de imágenes (MIM) existentes aprenden características de bajo nivel, requieren datos anotados para ajuste fino y no son aplicables a tareas de recuperación (retrieval) ni clasificación zero-shot.

El modelo alinea representaciones visuales de imágenes de teledetección con descripciones textuales mediante entrenamiento contrastivo, y soporta recuperación imagen-texto, clasificación zero-shot y few-shot, linear probing, clasificación k-NN y conteo de objetos. Se entrena de forma continua sobre un conjunto de datos unificado que combina tres grupos de datasets heterogéneos (RET-3, DET-10 y SEG-4), ampliado mediante técnicas de conversión de anotaciones a descripciones (Box-to-Caption y Mask-to-Box), logrando un corpus de pretraining aproximadamente 12 veces mayor que los datasets originales de pares imagen-texto combinados.

La arquitectura concreta (número de parámetros, tamaño del backbone, etc.) no se detalla en la información disponible, aunque el paper original (arXiv:2306.11029) describe el modelo en profundidad. La licencia es Apache 2.0 y el idioma soportado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language contrastivo (basado en CLIP, backbone visual y encoder de texto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no incluye pesos preentrenados en el momento de la consulta) |

## Arquitectura y entrenamiento

RemoteCLIP sigue el paradigma de CLIP: un encoder de imágenes y un encoder de texto cuyas representaciones se alinean mediante una pérdida contrastiva (InfoNCE bidireccional). El modelo se entrena de forma continua sobre un conjunto de datos unificado de teledetección. El paper describe tres grupos de datasets: RET-3 (RSITMD, RSICD y UCM-Captions, que contienen pares imagen-texto), DET-10 (datasets de detección de objetos en satélite y UAV) y SEG-4 (datasets de segmentación semántica iSAID, LoveDA, Potsdam y Vaihingen). Las anotaciones de detección se convierten en descripciones mediante Box-to-Caption (B2C), y las máscaras de segmentación se transforman primero en cajas mediante Mask-to-Box (M2B) y luego en descripciones. Este proceso genera un corpus de pretraining aproximadamente 12 veces mayor que los datasets originales de pares imagen-texto combinados.

El entrenamiento se realiza con PyTorch y soporta multi-GPU mediante `torchrun`. El repositorio incluye scripts para generar datos sintéticos de validación, entrenar, inferir y evaluar. No se especifican detalles sobre el número de tokens de entrenamiento, el tamaño del lote, ni si se usó RLHF o DPO (no aplica a este tipo de modelo). La innovación principal reside en la estrategia de conversión de anotaciones heterogéneas a pares imagen-texto, que permite escalar el conjunto de datos sin necesidad de anotaciones manuales adicionales.

## Capacidades

- Recuperación imagen-texto bidireccional: dado un texto, recupera imágenes de teledetección relevantes, y viceversa.
- Clasificación zero-shot: clasifica imágenes de satélite en categorías no vistas durante el entrenamiento, usando descripciones textuales como prototipos.
- Clasificación few-shot: adaptación con un pequeño número de ejemplos etiquetados.
- Linear probing: extracción de características visuales para entrenar un clasificador lineal.
- Clasificación k-NN: uso de las representaciones aprendidas para clasificación por vecinos cercanos.
- Conteo de objetos en teledetección: estimación del número de instancias de una categoría en una imagen.
- Reconocimiento de vocabulario abierto (open-vocabulary recognition): identifica conceptos no presentes en el conjunto de entrenamiento mediante descripciones textuales.

## Casos de uso

- Monitorización de cambios de uso del suelo: RemoteCLIP puede recuperar imágenes históricas de satélite a partir de descripciones textuales como "zona urbana en expansión" o "deforestación en región amazónica", facilitando el análisis de series temporales.
- Búsqueda semántica en archivos de imágenes de satélite: organismos públicos o empresas pueden indexar grandes catálogos de imágenes y consultarlos con lenguaje natural, por ejemplo "campos de cultivo inundados" o "buques en el puerto de Valencia".
- Clasificación zero-shot de cobertura terrestre: sin datos etiquetados, el modelo puede clasificar imágenes en categorías como "bosque", "agua", "urbano" o "cultivo" usando solo descripciones textuales, útil para mapeo rápido en regiones sin datos anotados.
- Detección de cambios en infraestructuras: mediante recuperación de imágenes por texto, se pueden localizar construcciones nuevas o carreteras modificadas comparando consultas como "edificio industrial reciente" frente a imágenes históricas.
- Conteo de objetos en imágenes aéreas: estimar el número de vehículos, edificios o embarcaciones en una imagen UAV o de satélite, útil para gestión de tráfico o logística.
- Generación de descripciones de imágenes para catálogos: dado que el modelo alinea imagen y texto, puede usarse como base para sistemas de captioning automático de imágenes de teledetección, aunque la generación de texto no es su función principal.
- Validación de pipelines de entrenamiento: el repositorio incluye un script de datos sintéticos que permite verificar el flujo completo (entrenamiento, inferencia, evaluación) sin necesidad de datos reales, útil para integrar el modelo en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original (arXiv:2306.11029) reporta evaluaciones en tareas de recuperación y clasificación, pero esos datos no están incluidos en la documentación proporcionada.

## Requisitos de hardware

- Se recomienda una GPU o DCU (unidad de cómputo dedicada de fabricantes chinos como Hygon) para entrenamiento e inferencia.
- La CPU puede usarse para importar el modelo y realizar pruebas de conectividad a pequeña escala, pero el entrenamiento e inferencia completos serán lentos.
- Para usuarios de DCU, se requiere instalar DTK (versión 25.04.2 o superior, o la versión recomendada por OneScience).
- El entorno de ejecución se instala mediante `pip install onescience[earth-gpu]` para GPU o `onescience[earth-dcu]` para DCU, desde el índice de paquetes de OneScience.
- No se especifican requisitos de VRAM ni GPUs concretas (A100, H100, RTX 4090, etc.) en la información disponible.
- Opciones de despliegue: el repositorio proporciona scripts de entrenamiento e inferencia en PyTorch, pero no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. RemoteCLIP se presenta como el primer modelo fundacional de visión-lenguaje específico para teledetección, por lo que no existen alternativas directas de la misma categoría en la información proporcionada. Modelos generalistas como CLIP podrían usarse como referencia, pero no se aportan datos comparativos en la documentación consultada.

## Limitaciones y advertencias

- El repositorio de HuggingFace no incluye los pesos preentrenados en el momento de la consulta; se indica que se subirán en una actualización futura. Los checkpoints generados con datos sintéticos solo validan el pipeline y no proporcionan capacidades reales de recuperación.
- El conjunto de datos de pretraining completo del paper no está incluido en el repositorio; los usuarios deben obtener los datasets originales bajo sus respectivas licencias.
- El modelo solo soporta inglés como idioma de texto, lo que limita su uso en entornos multilingües.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al ser un modelo de visión-lenguaje, puede presentar errores en la asociación imagen-texto, especialmente con conceptos poco representados en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero los datasets utilizados pueden tener restricciones adicionales que deben verificarse antes de usar el modelo en producción.
- El entrenamiento con datos sintéticos no es representativo del rendimiento real; los resultados obtenidos con `scripts/fake_data.py` no deben interpretarse como métricas del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/RemoteCLIP
- Paper (arXiv): https://arxiv.org/abs/2306.11029
- Página del proyecto: https://remotefamily.github.io/RemoteCLIP.html
- Repositorio oficial en GitHub: https://github.com/ChenDelong1999/RemoteCLIP
- PDF del paper en IEEE TGRS: https://lyj301.github.io/lyj031.github.io/static/remoteclip_paper.pdf
