# dawahealth/anemia_screeniing

## Resumen

OPTIMA (Optical Technology for Intelligent Monitoring of Anaemia) es un modelo de clasificación de imágenes desarrollado por el equipo de investigación e innovación de Dawa Health, dentro de su plataforma de diagnóstico DawaMom AI. El modelo clasifica imágenes de la conjuntiva (el interior del párpado) en cuatro categorías de severidad de anemia: sin anemia, anemia leve, anemia moderada y anemia severa. Se presenta como una herramienta de cribado no invasivo que sustituye la extracción de sangre por una fotografía del ojo.

Técnicamente no es un modelo de lenguaje ni un modelo generativo: es un clasificador de imágenes construido sobre el backbone DINOv2 ViT-S/14 de Meta (variante small, patch de 14 px, preentrenada de forma autosupervisada sobre LVD-142M) al que se le añade una cabeza MLP de tres capas. El backbone tiene 384 dimensiones de features y se descongelaron los últimos cuatro bloques transformer durante el ajuste fino. El repositorio solo publica los pesos de la cabeza clasificadora (1,34 MB en formato PyTorch `.pt`), no los del backbone, que se descargan desde `timm`.

Su relevancia es doble: por un lado aborda un problema sanitario real (la anemia afecta a cientos de millones de personas y el cribado requiere análisis de sangre), y por otro sirve como ejemplo de adaptación de un backbone autosupervisado a una tarea médica con muy pocos datos. No obstante, el propio autor lo etiqueta como prototipo de investigación, no como dispositivo médico, y su precisión de validación (57,69 %) está lejos de ser utilizable en producción clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN-free: ViT-S/14 (DINOv2) como extractor de features + cabeza MLP (384→512→256→4) |
| Parametros totales | No disponible (el backbone ViT-S/14 tiene ~22 M; la cabeza publicada es de ~0,35 M, pero no se indica el total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen 224×224 px) |
| Tipos de cuantizacion | No disponible (pesos en FP32 PyTorch; no se publican versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | No aplica (modelo de imagen; la model card no declara idiomas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (cabeza clasificadora) + backbone descargado vía `timm`; referencias de color en `.npy` |

## Arquitectura y entrenamiento

El modelo sigue un esquema de *transfer learning* sobre DINOv2 ViT-S/14, un transformer de visión preentrenado de forma autosupervisada (sin etiquetas) por Meta sobre el dataset LVD-142M. El backbone se carga con `timm.create_model('vit_small_patch14_dinov2.lvd142m', pretrained=True, num_classes=0, img_size=224)` y produce un vector de 384 dimensiones por imagen. Durante el ajuste fino se descongelaron únicamente los últimos cuatro bloques transformer, manteniendo el resto congelado, lo que es coherente con el tamaño reducido del dataset.

La cabeza clasificadora es un MLP con dos capas ocultas: `Linear(384→512) → BatchNorm → ReLU → Dropout(0.5) → Linear(512→256) → BatchNorm → ReLU → Dropout(0.4) → Linear(256→4)`. El entrenamiento usó 864 imágenes de conjuntiva procedentes de Ghana, Italia e India, aumentadas hasta 1.400 imágenes balanceadas (350 por clase); validación y test usaron 130 imágenes originales cada uno. No se documenta el uso de RLHF, DPO ni técnicas de alineación (no aplican a un clasificador). La mejor precisión de validación reportada es del 57,69 %, y el autor reconoce explícitamente que está limitada por el tamaño del dataset.

El pipeline de preprocesado es parte crítica del modelo y debe respetarse en orden: eliminación de reflejos especulares mediante umbral en HSV e inpainting, recorte de la región conjuntival por umbral del canal rojo y contorno mayor, normalización de color con media y desviación de referencia (alpha = 0,3) y redimensionado a 224×224. Cualquier alteración del orden degrada la inferencia.

## Capacidades

- Clasificación de imágenes de conjuntiva en cuatro clases de severidad de anemia (sin anemia, leve, moderada, severa).
- Salida de probabilidades por clase vía softmax, lo que permite umbralizar la confianza y derivar casos dudosos a revisión.
- Extracción de features visuales de 384 dimensiones reutilizable para otras tareas de visión médica (el backbone DINOv2 es genérico).
- Preprocesado integrado y reproducible (eliminación de reflejos, recorte, normalización de color) documentado paso a paso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni visión general más allá del dominio conjuntival.
- No es multilingüe en sentido estricto: no procesa texto.

## Casos de uso

- Cribado comunitario en zonas con acceso limitado a laboratorio: el modelo permite estimar la severidad de anemia a partir de una fotografía del párpado tomada con un móvil, sin necesidad de extracción de sangre ni reactivos. Adecuado para campañas de detección en colegios o centros de salud rurales, siempre con supervisión clínica.
- Triaje previo a analítica: usar la clasificación como primera barrera para decidir qué pacientes requieren hemograma completo, reduciendo costes y tiempos en entornos con recursos escasos.
- Seguimiento de pacientes pediátricos o embarazadas: al ser no invasivo, permite repetir la medición con frecuencia sin molestias ni riesgo, útil en programas de seguimiento de anemia ferropénica.
- Investigación en visión médica: el backbone DINOv2 y el pipeline de preprocesado sirven como punto de partida para reentrenar clasificadores sobre otras afecciones oculares o mucosas.
- Integración en aplicaciones móviles de salud (DawaMom AI): el tamaño reducido de la cabeza (1,34 MB) y la posibilidad de ejecutar el backbone en CPU o GPU modesta facilitan el despliegue en dispositivos de campo.
- Docencia y validación de metodologías: ejemplo didáctico de ajuste fino de un backbone autosupervisado con dataset pequeño, útil para formar a investigadores en buenas prácticas de transferencia y evaluación.
- Generación de datasets etiquetados: usar las predicciones con alta confianza como preetiquetado para acelerar la anotación de nuevas imágenes conjuntivales.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión de validación (mejor) | 57,69 % |
| Tamaño del conjunto de entrenamiento | 864 imágenes originales / 1.400 aumentadas (350 por clase) |
| Tamaño de validación | 130 imágenes |
| Tamaño de test | 130 imágenes |
| Comparación con otros modelos | No disponible |

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni métricas clínicas como sensibilidad, especificidad o AUC). La única cifra reportada es la precisión de validación del 57,69 %, que en un problema de cuatro clases está solo ligeramente por encima del azar (25 %) y muy lejos de un umbral clínicamente aceptable.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. El backbone ViT-S/14 con entrada 224×224 ocupa del orden de 1-2 GB en FP32; la cabeza clasificadora es despreciable (1,34 MB). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para lotes grandes o despliegue en servidor, una RTX 3060/4090 o una T4/A10 son más que suficientes. A100/H100 no aportan ventaja para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.), e incluso en CPU con latencias de decenas de milisegundos por imagen.
- Opciones de despliegue: PyTorch nativo (código de la model card), exportación a ONNX o TorchScript para producción, integración vía `timm`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de visión).
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño del modelo se espera un throughput alto (cientos de imágenes por segundo en GPU moderna) y latencia de milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tarea | Backbone | Parámetros | Contexto/entrada | Licencia | Precisión reportada |
|---|---|---|---|---|---|---|
| OPTIMA (dawahealth/anemia_screeniing) | Clasificación de anemia en conjuntiva (4 clases) | DINOv2 ViT-S/14 | No disponible (backbone ~22 M) | Imagen 224×224 | AGPL-3.0 | 57,69 % val |
| DINOv2 ViT-S/14 (facebook/dinov2-small) | Features visuales genéricas | ViT-S/14 | ~22 M | Imagen 224×224 (hasta 518) | Apache-2.0 (según Meta) | No aplica (no clasifica anemia) |
| ResNet-50 (ImageNet) | Clasificación de imágenes genérica | CNN | ~25 M | Imagen 224×224 | BSD-3 (torchvision) | No aplica (no clasifica anemia) |
| CLIP ViT-B/32 (openai/clip-vit-base-patch32) | Visión-lenguaje | ViT-B/32 | ~150 M | Imagen 224×224 + texto | MIT | No aplica (no clasifica anemia) |

No se dispone de comparativas directas con otros modelos específicos de detección de anemia por conjuntiva en la información proporcionada; la comparación anterior es estructural, no de rendimiento en la tarea.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor lo declara explícitamente como prototipo para investigación y demostración. No debe usarse para diagnóstico clínico sin validación regulatoria.
- Precisión insuficiente para uso real: 57,69 % en validación sobre cuatro clases implica una tasa de error muy elevada; no se reportan sensibilidad, especificidad ni AUC, que son las métricas relevantes en cribado.
- Dataset pequeño y sesgado geográficamente: 864 imágenes de Ghana, Italia e India, con solo 130 de validación y 130 de test. La generalización a otras poblaciones, tonos de piel, iluminaciones y dispositivos de cámara no está demostrada.
- Sensibilidad al preprocesado: el orden y los parámetros del pipeline (umbral de reflejos 240, umbral del canal rojo 80, alpha 0,3) son críticos; pequeñas variaciones degradan la predicción.
- Dependencia de la calidad de la imagen: reflejos, desenfoque, iluminación deficiente o encuadre incorrecto pueden invalidar el resultado sin aviso.
- Riesgo de falsos negativos en anemia severa: la clase severa es la de mayor riesgo clínico y no se reportan métricas por clase, por lo que no puede descartarse un rendimiento especialmente bajo en ella.
- Licencia AGPL-3.0: cualquier modificación o integración en un producto o servicio obliga a liberar el trabajo derivado bajo la misma licencia, lo que puede ser incompatible con despliegues comerciales cerrados.
- Sin soporte de cuantización ni formatos alternativos: solo se publican pesos PyTorch de la cabeza; el backbone debe descargarse por separado desde `timm`, lo que añade dependencia externa.
- Idiomas y texto: no aplica, pero conviene señalar que el modelo no procesa informes clínicos ni texto asociado; cualquier flujo que lo requiera necesita otro componente.
- Fecha de creación futura en los metadatos (2026-10-15): conviene verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dawahealth/anemia_screeniing
- Modelo base DINOv2 small: https://huggingface.co/facebook/dinov2-small
- Repositorio oficial de DINOv2 (Meta): https://github.com/facebookresearch/dinov2
- Paper DINOv2 (Oquab et al., 2023): https://arxiv.org/abs/2304.07193
- Librería `timm` (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
- Documentación de `timm` para `vit_small_patch14_dinov2.lvd142m`: https://huggingface.co/docs/timm
- Dawa Health (organización): https://huggingface.co/dawahealth
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
