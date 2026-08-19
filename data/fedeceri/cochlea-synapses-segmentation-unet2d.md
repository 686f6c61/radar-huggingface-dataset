# fedeceri/cochlea-synapses-segmentation-unet2d

## Resumen

El modelo `cochlea-synapses-segmentation-unet2d` es un pipeline de segmentación de instancias basado en dos U-Nets 2D, desarrollado por fedeceri, para identificar y segmentar botones sinápticos putativos (sinaptopodios) en imágenes de microscopía de fluorescencia de cóclea. La arquitectura emplea MONAI y consta de dos etapas: una red U-Net binaria que segmenta el foreground (regiones de interés) y una segunda U-Net que predice un heatmap de centros, cuyos picos se utilizan como marcadores para un watershed controlado, generando así máscaras de instancia finales. El modelo está pensado para imágenes TIFF de un solo canal y se distribuye bajo licencia Apache 2.0. No se han publicado detalles sobre el número de parámetros, la profundidad de la red ni el tamaño del modelo en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net 2D (dos redes: binaria y heatmap) basado en MONAI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pth (según la model card) |

## Arquitectura y entrenamiento

El modelo implementa un pipeline de dos etapas sobre imágenes de microscopía de fluorescencia de un solo canal. La primera etapa consiste en un U-Net binario que predice una máscara de foreground, separando las regiones con señal fluorescente del fondo. La segunda etapa utiliza otro U-Net que genera un heatmap de centros, donde cada pico corresponde al centro de un botón sináptico putativo. Estos picos se convierten en marcadores que, combinados con la máscara binaria, se utilizan en un algoritmo de watershed controlado para producir la segmentación de instancias final (etiquetas 1..N). Los pesos del modelo se guardan en el archivo `best_model_binary_heatmap_v5_synaptic.pth` y las configuraciones de red se definen en dos archivos YAML (`binary_model_v5_synaptic.yml` y `heatmap_model_v5_synaptic.yml`). El entrenamiento se realizó con imágenes TIFF de cóclea anotadas manualmente, con máscaras de ROI y heatmaps de centros generados a partir de esas máscaras y filtrados según la anotación. No se proporcionan detalles sobre el número de épocas, el tamaño del dataset ni las técnicas de optimización empleadas.

## Capacidades

- Segmentación de instancias de botones sinápticos putativos en imágenes de microscopía de fluorescencia de cóclea.
- Generación de tres salidas opcionales: máscara binaria de foreground, heatmap de centros e imagen de marcadores (picos).
- Parámetros de inferencia ajustables desde línea de comandos: umbral binario, umbral de heatmap, tamaño mínimo de objeto y distancia mínima entre centros.
- Procesamiento de imágenes TIFF de un solo canal (entrada y salida en formato TIFF).
- Integración con el ecosistema MONAI y PyTorch.
- No incluye capacidades de lenguaje, tool calling, agentes ni procesamiento multimodal más allá de la imagen de microscopía.

## Casos de uso

- Investigación en neurociencia auditiva: cuantificar el número de sinapsis cocleares en diferentes condiciones experimentales (p. ej., exposición a ruido, envejecimiento) mediante el conteo automático de instancias segmentadas.
- Análisis de imágenes de microscopía confocal de alta resolución para estudiar la densidad sináptica en la cóclea, reduciendo el tiempo de anotación manual y aumentando la reproducibilidad.
- Automatización del cribado de grandes conjuntos de imágenes TIFF en estudios de pérdida auditiva, permitiendo procesar cientos de campos de visión sin intervención manual.
- Validación de marcadores fluorescentes específicos para sinaptopodios: el modelo puede ayudar a confirmar si un marcador dado produce señales puntiformes consistentes con sinapsis putativas.
- Integración en pipelines de análisis de imágenes biomédicas donde se requiera segmentación de estructuras puntiformes (p. ej., otros tipos de botones sinápticos o vesículas) con adaptación mediante fine-tuning.
- Generación de máscaras de instancia para alimentar análisis posteriores, como el estudio de la distribución espacial de sinapsis o la correlación con datos funcionales.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que se dispone de notebooks de evaluación que reportan el Dice binario para la predicción de foreground y las componentes RQ (Recognition Quality) y SQ (Segmentation Quality) para las predicciones finales de ROI, pero no se ofrecen valores concretos en el repositorio ni en la documentación.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. Al tratarse de un U-Net 2D para imágenes de microscopía (presumiblemente de tamaño moderado, como 512×512 o similar), es probable que pueda ejecutarse en GPUs de consumo con al menos 8 GB de VRAM, pero no hay datos confirmados. Las opciones de despliegue incluyen el script `infer_rois.py` del repositorio, que carga los pesos y las configuraciones YAML; también podría integrarse en entornos MONAI o PyTorch estándar. No se mencionan herramientas como vLLM, llama.cpp u Ollama, que no son aplicables a modelos de visión.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros proyectos para segmentación de sinapsis cocleares, como el plugin de napari `cochlea-synapseg` (ucsdmanorlab), pero no se trata de un modelo de segmentación con U-Net entrenado de la misma manera, por lo que no se puede establecer una comparación directa sin datos adicionales.

## Limitaciones y advertencias

- Las etiquetas manuales utilizadas para el entrenamiento contienen decisiones subjetivas, por lo que las discrepancias en los límites de las ROI y en el conteo de instancias pueden reflejar ambigüedad en la anotación.
- El modelo está diseñado específicamente para imágenes de microscopía de fluorescencia de cóclea con marcaje de sinaptopodios; su generalización a otros tejidos, marcadores o modalidades de imagen no está garantizada.
- No se proporcionan métricas de rendimiento cuantitativas (Dice, RQ/SQ) en la documentación, lo que dificulta evaluar su precisión antes de su uso.
- La licencia Apache 2.0 permite uso comercial, pero la model card indica explícitamente "Research use only", por lo que se recomienda contactar con el autor antes de cualquier aplicación clínica o comercial.
- El repositorio de HuggingFace muestra un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar alojados en la plataforma; es necesario descargarlos desde el repositorio de GitHub asociado.

## Enlaces

- HuggingFace: https://huggingface.co/fedeceri/cochlea-synapses-segmentation-unet2d
- GitHub (código de entrenamiento e inferencia): https://github.com/fedeceri85/cochlea-synapses-binary-segmentation-unet2d
