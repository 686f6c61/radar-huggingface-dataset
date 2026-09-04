# cubert-gmbh/adaclip

## Resumen

AdaCLIP es un método de detección de anomalías zero-shot desarrollado por Yunkang Cao et al. y publicado en ECCV 2024. El modelo adapta CLIP mediante prompts híbridos aprendibles para detectar anomalías en imágenes sin necesidad de ejemplos de defectos. El repositorio en Hugging Face `cubert-gmbh/adaclip` es un mirror byte-idéntico de los pesos preentrenados publicados por los autores a través de Google Drive, alojado por Cubert GmbH para su integración en la plataforma Cuvis.AI. Contiene tres checkpoints de prompts preentrenados (`pretrained_all`, `pretrained_mvtec_colondb` y `pretrained_visa_clinicdb`) de 42.7 MB cada uno. La arquitectura combina un backbone CLIP congelado con un adaptador entrenado sobre datos hiperespectrales, y produce puntuaciones de anomalía condicionadas a un prompt en lenguaje natural. Es relevante porque ofrece detección de anomalías sin entrenamiento específico, útil en inspección industrial y análisis de imágenes médicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (Vision Transformer) con adaptador de prompts híbridos aprendibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | unknown para los pesos; MIT para el código del proyecto AdaCLIP |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

AdaCLIP adapta el modelo CLIP congelado mediante prompts híbridos aprendibles. Según la documentación de Cuvis.AI, acopla un backbone CLIP congelado con un pequeño adaptador entrenado contra datos hiperespectrales, produciendo puntuaciones de anomalía condicionadas a un prompt en lenguaje natural. Los checkpoints fueron entrenados en datasets auxiliares de detección de anomalías: MVTec AD, VisA, ClinicDB y ColonDB. No se indica que haya habido RLHF ni DPO. Los pesos del repositorio son los publicados por los autores, sin conversión ni re-serialización.

## Capacidades

- Detección de anomalías zero-shot en imágenes: clasifica si una imagen o región contiene una anomalía sin necesidad de ejemplos de defectos.
- Adaptación mediante prompts híbridos: combina prompts aprendibles y de lenguaje natural para condicionar el modelo.
- Integración con Cuvis.AI: permite usar el modelo en pipelines de análisis hiperespectral.
- Soporte de prompts en lenguaje natural: el usuario puede describir la anomalía esperada para obtener puntuaciones.
- Funciona sobre múltiples dominios: MVTec AD (defectos industriales), VisA (anomalías visuales), ClinicDB y ColonDB (imágenes médicas).
- No es un modelo de generación de texto; su función es la clasificación de anomalías.

## Casos de uso

- Inspección de calidad en fabricación: AdaCLIP puede detectar defectos superficiales en productos (rayas, abolladuras, manchas) sin entrenamiento específico, usando prompts como "defecto de superficie".
- Control de calidad en producción de componentes electrónicos: identificación de anomalías en placas o soldaduras mediante análisis de imágenes, con el modelo adaptado a datos hiperespectrales.
- Análisis de imágenes hiperespectrales: integrado en Cuvis.AI, permite detectar anomalías en datos hiperespectrales para aplicaciones industriales o de investigación.
- Diagnóstico asistido por imagen médica: los checkpoints entrenados en ClinicDB y ColonDB pueden utilizarse para detectar anomalías en imágenes de endoscopia o colonoscopia.
- Monitorización de procesos industriales: detección de anomalías en flujos de imágenes de cámaras de vigilancia o sensores, con prompts en lenguaje natural para describir la anomalía.
- Investigación en detección de anomalías: el modelo sirve como referencia para evaluar métodos zero-shot en benchmarks como MVTec AD y VisA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware en la información proporcionada.
- Cada checkpoint de pesos ocupa 42.7 MB, lo que sugiere un adaptador pequeño sobre un backbone CLIP congelado, pero no se especifica la VRAM necesaria.
- El despliegue está orientado a la integración con Cuvis.AI mediante los plugins `cuvis-ai-adaclip`, que provisionan los pesos en una caché compartida.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos de detección de anomalías zero-shot.

## Limitaciones y advertencias

- Los pesos del modelo tienen licencia "unknown": no hay una declaración de licencia que cubra los pesos, solo el código del proyecto AdaCLIP está bajo MIT.
- Los datasets de entrenamiento tienen licencias propias: MVTec AD es CC BY-NC-SA 4.0, por lo que hay que verificar las licencias de los datos antes de un uso comercial.
- El repositorio es un mirror de pesos, no un modelo completo: no incluye el código de entrenamiento ni el pipeline completo, que se encuentra en el repositorio original de AdaCLIP.
- No se proporciona información sobre sesgos o limitaciones de contexto/idioma al ser un modelo de visión.
- Riesgo de alucinación no aplicable, ya que no genera texto.

## Enlaces

- Hugging Face: https://huggingface.co/cubert-gmbh/adaclip
- Repositorio original de AdaCLIP: https://github.com/caoyunkang/AdaCLIP
- Plugin Cuvis.AI AdaCLIP: https://github.com/cubert-hyperspectral/cuvis-ai-adaclip
- Documentación de Cuvis.AI sobre AdaCLIP: https://docs.cuvis.ai/latest/tutorials/gradient/adaclip/
