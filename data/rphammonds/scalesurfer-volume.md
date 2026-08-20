# rphammonds/scalesurfer-volume

## Resumen

ScaleSurfer-volume es un modelo de segmentación de imágenes médicas desarrollado por rphammonds, diseñado para predecir volúmenes de etiquetas anatómicas compatibles con FreeSurfer (`aparc+aseg`) en una malla de 256³. Se trata de una variante del proyecto ScaleSurfer, que introduce un modelo de visión por transformer convolucional tridimensional basado en aprendizaje multiescala: los bloques de convolución capturan detalles anatómicos locales y un cuello de botella transformer integra el contexto espacial distribuido. Este checkpoint concreto ha sido entrenado combinando datos de las versiones 5, 6 y 7 de FreeSurfer, por lo que se recomienda para entornos donde no se conoce la versión exacta de las imágenes de entrada.

El modelo se distribuye como un único archivo `transunet3d.safetensors` junto con la configuración exacta de la arquitectura (`config.json`) y metadatos de procedencia. Está orientado a investigación y no se considera un dispositivo de diagnóstico clínico. El repositorio original, disponible en GitHub bajo el nombre `voytekresearch/scalesurfer`, incluye además modelos de estadísticas que predicen medidas de FreeSurfer como grosor cortical, área de superficie, curvatura e índice de plegado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TransUNet3D (UNet con cuello de botella transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una TransUNet tridimensional, es decir, una red basada en UNet donde el cuello de botella es un transformer que integra el contexto espacial distribuido de las características convolucionales. Este diseño permite capturar tanto los detalles anatómicos locales (mediante los bloques convolucionales) como las dependencias globales dentro del volumen. El modelo se entrenó inicialmente con datos de todas las versiones de FreeSurfer disponibles, usando una función de pérdida de entropía cruzada voxel a voxel. Posteriormente, se continuó el entrenamiento sobre un conjunto de datos combinado de FreeSurfer 5, 6 y 7, empleando el objetivo de FastSurferCNN v2.5.4, que combina una pérdida de Dice por canal suavizada y una entropía cruzada voxelwise ponderada por clase y por frontera, en proporción 1:1 incluyendo el fondo. Los archivos `history.csv` y `summary.csv` documentan el entrenamiento por etapas.

## Capacidades

- Segmentación de imágenes de resonancia magnética (IRM) volumétricas en 3D, generando una etiqueta de volumen de 256³ voxels con las regiones anatómicas definidas por el atlas `aparcaseg` de FreeSurfer.
- Compatibilidad con múltiples versiones de FreeSurfer (5, 6 y 7), lo que permite procesar datos provenientes de pipelines heterogéneos sin necesidad de conocer la versión de origen.
- Inferencia rápida de medidas anatómicas derivadas de la segmentación, como grosor cortical, área de superficie, curvatura e índice de plegamiento (a través de los modelos de estadísticas del repositorio ScaleSurfer).
- Integración en flujos de trabajo de neuroimagen existentes que requieran resultados compatibles con FreeSurfer, gracias a la salida en formato `aparcaseg`.
- Uso exclusivo de pesos en formato `safetensors`, lo que garantiza seguridad y facilidad de carga en entornos PyTorch.

## Casos de uso

- Segmentación anatómica en estudios de neuroimagen: el modelo puede sustituir a FreeSurfer en pipelines de análisis estructural, generando etiquetas de volumen de 256³ que se integran directamente en herramientas de estadística o visualización.
- Análisis de grandes cohortes de IRM: gracias a la inferencia rápida de ScaleSurfer, es viable procesar miles de sujetos en un tiempo reducido, lo que es esencial para estudios de población y bases de datos abiertas.
- Estandarización de datos heterogéneos: al combinar los modelos de FreeSurfer 5, 6 y 7, se puede unificar la segmentación de imágenes procedentes de distintos centros o versiones de procesamiento, reduciendo la variabilidad entre sujetos.
- Generación de medidas corticales derivadas: con los modelos estadísticos asociados, se pueden obtener grosor cortical, área de superficie y curvatura, útiles para estudios de envejecimiento, patologías neurodegenerativas o desarrollo cerebral.
- Desarrollo de herramientas de visualización anatómica: las salidas de segmentación pueden servir para renderizar el cerebro en 3D y sobreponer atlas funcionales o de conectividad.
- Investigación en métodos de segmentación: el modelo sirve como referencia para comparar arquitecturas 3D basadas en transformers frente a CNNs clásicas (como FastSurferCNN) en tareas de segmentación anatómica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del modelo no incluye tablas comparativas con métricas como Dice, volumen de intersección sobre unión o precisión de frontera. El repositorio de GitHub y el preprint de bioRxiv pueden contener datos adicionales, pero no se han proporcionado en la información de la ficha.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información proporcionada. Dado que el modelo procesa volúmenes 3D de 256³, se recomienda una GPU con al menos 8-12 GB de memoria para la inferencia, aunque no se dispone de una cifra confirmada.
- Las GPUs de la serie NVIDIA RTX (3090, 4090) o A100 son adecuadas para la inferencia, pero no hay datos oficiales de consumo de memoria.
- El formato de pesos es `safetensors`, por lo que se puede cargar directamente en PyTorch y desplegar con bibliotecas de inferencia como vLLM o TGI, aunque estos frameworks están orientados a modelos de lenguaje y no son la opción natural para este tipo de modelo de visión. La inferencia se realizaría con scripts de PyTorch estándar.
- El repositorio original de GitHub (voytekresearch/scalesurfer) incluye código de inferencia para FreeSurfer, pero no se detalla el rendimiento en términos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para comparar directamente con otros modelos de segmentación anatómica. Se puede realizar una comparación cualitativa:

- **FastSurferCNN**: es una CNN de segmentación rápida para FreeSurfer, pero no incorpora el cuello de botella transformer de ScaleSurfer. ScaleSurfer se entrena con una combinación de pérdida de Dice y entropía cruzada similar a la de FastSurferCNN v2.5.4, lo que sugiere que comparte objetivos de entrenamiento, pero la arquitectura base difiere.
- **FreeSurfer original**: no es una red neuronal sino un pipeline tradicional de segmentación basado en atlas; ScaleSurfer es mucho más rápido pero depende de la calidad de los datos de entrenamiento.
- **Otros modelos de visión 3D**: no se dispone de datos de modelos comparables en la información proporcionada.

No se dispone de una comparativa formal con métricas.

## Limitaciones y advertencias

- El modelo se destina exclusivamente a investigación y no debe usarse como dispositivo de diagnóstico clínico.
- No se proporciona información sobre la licencia, por lo que el uso comercial no está garantizado y se debe consultar al autor o al repositorio original.
- No se conocen los idiomas soportados (el modelo no es de texto), pero no se especifica ninguna limitación lingüística.
- No se documentan sesgos conocidos ni riesgos de alucinación (el modelo es de segmentación, no de generación de texto), pero la precisión puede degradarse en imágenes atípicas o de baja calidad.
- La arquitectura está diseñada para volúmenes de 256³; no se indica si se puede adaptar a resoluciones diferentes.
- El modelo se entrenó con datos de FreeSurfer 5, 6 y 7, por lo que puede no ser óptimo para versiones más recientes o futuras del atlas.
- El tamaño del repositorio es de 0.0 GB en la página de HuggingFace, aunque los archivos (safetensors, config) deberían ocupar espacio; esto puede ser un error de la plataforma, pero no se puede verificar.

## Enlaces

- HuggingFace: https://huggingface.co/rphammonds/scalesurfer-volume
- GitHub (repositorio original): https://github.com/voytekresearch/scalesurfer
- Preprint bioRxiv: https://www.biorxiv.org/content/10.64898/2026.07.01.735927v1
- PDF del preprint: https://www.biorxiv.org/content/10.64898/2026.07.01.735927v1.full.pdf
- Modelo relacionado (v8): https://huggingface.co/rphammonds/scalesurfer-v8
- Modelo relacionado (v6): https://huggingface.co/rphammonds/scalesurfer-v6
