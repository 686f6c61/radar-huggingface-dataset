# Ruchika06/surface-defect-seg-exp2-t32026

## Resumen

`Ruchika06/surface-defect-seg-exp2-t32026` es un repositorio de modelos de segmentación de imágenes orientado a la detección de defectos superficiales. Lo publica el usuario Ruchika06 como artefacto de un trabajo práctico o experimento académico (identificado en la model card como "DL GenAI T3 2026"), y contiene tres variantes de segmentación semántica entrenadas sobre imágenes en escala de grises de 128 x 800 píxeles para predecir máscaras de cuatro tipos de defecto.

El repositorio no es un modelo fundacional ni un modelo de lenguaje: es un conjunto de pesos de segmentación (state dicts `.pth`) acompañados de ficheros de configuración JSON con hiperparámetros ajustados por clase de defecto. La mejor variante según la validación del autor es `exp2_model3_fpn_convnextv2_tiny`, un FPN con encoder ConvNeXtV2-Tiny preentrenado, que alcanza un `val_score` de 0,7458 y un Dice de 0,6789 sobre defectos.

Su relevancia es limitada y muy específica: sirve como referencia reproducible para inspección visual industrial de defectos en tiras o superficies alargadas (dada la relación de aspecto 128x800), y como ejemplo didáctico de comparación entre un U-Net desde cero, un U-Net con encoder ResNet-50 y un FPN con encoder ConvNeXtV2-Tiny. No hay información pública sobre licencia, idiomas ni datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres variantes: ResU-Net desde cero; U-Net con encoder ResNet-50; FPN con encoder ConvNeXtV2-Tiny |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 128 x 800 píxeles en escala de grises) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (state dict de PyTorch) más ficheros JSON de configuración por clase de defecto |

## Arquitectura y entrenamiento

El repositorio agrupa tres arquitecturas de segmentación semántica. La primera, `exp2_model1_resunet`, es una ResU-Net implementada desde cero (la clase se define en `scratch_resunet.py`). La segunda, `exp2_model2_unet_resnet50`, es un U-Net con encoder ResNet-50 preentrenado. La tercera, `exp2_model3_fpn_convnextv2_tiny`, es una Feature Pyramid Network con encoder ConvNeXtV2-Tiny preentrenado, y es la que obtiene mejores métricas de validación.

La entrada son imágenes en escala de grises de 128 x 800 píxeles y la salida son máscaras para cuatro tipos de defecto. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset, el número de épocas, la función de pérdida exacta ni si se aplicaron técnicas de aumento de datos. La métrica de validación definida por el autor combina Dice sobre defectos (peso 0,7) y accuracy sobre imágenes vacías (peso 0,3), lo que sugiere un dataset con presencia significativa de muestras sin defecto.

## Capacidades

- Segmentación semántica de defectos superficiales en imágenes en escala de grises de 128 x 800 píxeles.
- Predicción de máscaras para cuatro tipos de defecto distintos.
- Clasificación implícita de imágenes sin defecto (la métrica `val_empty_acc` mide el acierto en muestras vacías).
- Tres variantes con distintos compromisos entre coste computacional y calidad de segmentación.
- Configuración por clase de defecto mediante ficheros JSON con hiperparámetros ajustados.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingües.

## Casos de uso

- Inspección visual automatizada en líneas de producción de tiras, bandas o superficies alargadas: la relación de aspecto 128x800 encaja con materiales continuos como tela, papel, metal laminado o film plástico, donde se capturan franjas alargadas y se necesita localizar defectos píxel a píxel.
- Control de calidad en fabricación de semiconductores o PCB: segmentación de defectos superficiales en imágenes de inspección, con la variante FPN + ConvNeXtV2-Tiny como opción principal por su mejor Dice (0,6789).
- Prototipado rápido en entornos con recursos limitados: la variante ConvNeXtV2-Tiny es un encoder ligero que puede ejecutarse en GPU de consumo, útil para validar un pipeline de inspección antes de invertir en modelos mayores.
- Investigación académica y docencia: el repositorio ofrece tres arquitecturas comparables con métricas de validación publicadas, lo que facilita reproducir experimentos de segmentación y estudiar el impacto del encoder preentrenado frente al entrenamiento desde cero.
- Aumento de datasets de defectos: las máscaras predichas pueden usarse para preetiquetar imágenes y reducir el coste de anotación manual, revisando después las predicciones con un operario.
- Detección de anomalías en imágenes sin defecto: la métrica de accuracy en muestras vacías (0,9019 en el mejor modelo) permite usar el modelo como filtro previo que descarte imágenes limpias antes de un análisis más costoso.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (score = 0,7 x Dice sobre defectos + 0,3 x accuracy en imágenes vacías):

| Modelo | val_score | val_f1 | val_acc | val_dice | val_empty_acc |
|---|---|---|---|---|---|
| exp2_model3_fpn_convnextv2_tiny | 0,745811 | 0,760537 | 0,903835 | 0,678934 | 0,901859 |
| exp2_model2_unet_resnet50 | 0,634095 | 0,657074 | 0,920960 | 0,499537 | 0,948063 |
| exp2_model1_resunet | 0,462242 | 0,282988 | 0,687939 | 0,364656 | 0,689943 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo. Tampoco hay comparación con modelos externos de segmentación de defectos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Por el tamaño del repositorio (0,3 GB) y las arquitecturas empleadas (ConvNeXtV2-Tiny, ResNet-50, ResU-Net), la inferencia cabe holgadamente en GPU de consumo con 4-8 GB de VRAM en precisión FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento, se recomienda una GPU con 12 GB o más.
- Cabe en GPU de consumo: sí, con las arquitecturas indicadas y entradas de 128x800.
- Opciones de despliegue: PyTorch nativo (carga de state dicts `.pth`), TorchScript o exportación a ONNX para servir con ONNX Runtime. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Dice (defectos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| surface-defect-seg-exp2-t32026 (mejor variante) | FPN + ConvNeXtV2-Tiny | 128x800 gris | 0,6789 | no disponible | Hugging Face |
| surface-defect-seg-exp2-t32026 (U-Net ResNet-50) | U-Net + ResNet-50 | 128x800 gris | 0,4995 | no disponible | Hugging Face |
| surface-defect-seg-exp2-t32026 (ResU-Net) | ResU-Net desde cero | 128x800 gris | 0,3647 | no disponible | Hugging Face |

No se dispone de información sobre modelos externos comparables de segmentación de defectos superficiales con los que contrastar métricas en el mismo dataset. La comparación interna entre las tres variantes es la única disponible.

## Limitaciones y advertencias

- No se especifica licencia: no hay garantía de uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Modelo de nicho y sin validación externa: las métricas provienen únicamente del conjunto de validación del autor, sin conjunto de test independiente ni validación cruzada publicada.
- Dice sobre defectos moderado en el mejor modelo (0,6789): insuficiente para inspección crítica sin revisión humana.
- Entrada fija de 128x800 en escala de grises: no admite imágenes en color ni otras resoluciones sin redimensionado, lo que puede degradar la segmentación de defectos pequeños.
- Solo cuatro tipos de defecto: no generaliza a defectos no vistos durante el entrenamiento.
- Sin información sobre el dataset de entrenamiento: se desconocen sesgos de dominio (tipo de material, iluminación, cámara) y riesgo de sobreajuste a las condiciones de captura originales.
- Riesgo de falsos negativos en imágenes con defectos sutiles o de bajo contraste, dado el peso de la accuracy en imágenes vacías en la métrica de selección.
- Repositorio con 0 descargas y 0 likes: sin comunidad que valide los resultados ni reporte problemas.
- Fecha de creación futura en los metadatos (2026-11-10): conviene verificar la integridad y procedencia de los artefactos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ruchika06/surface-defect-seg-exp2-t32026
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
