# Q-P1NG/birefnet-lite-512

## Resumen

BiRefNet lite 512 (ONNX) es una exportación a formato ONNX del modelo BiRefNet lite, desarrollado originalmente por Peng Zheng y colaboradores y publicado por el estudio Studio Ludens. Se trata de un modelo de segmentación dicotómica de imágenes orientado a la eliminación de fondos (background removal), que genera una máscara alfa de alta calidad a partir de una imagen RGB. La variante "lite" reduce el coste computacional respecto al BiRefNet completo, y esta exportación fija la resolución de entrada a 512 x 512 píxeles.

El modelo resuelve el problema de separar el sujeto principal del fondo en imágenes arbitrarias, produciendo una matte de un solo canal que puede aplicarse como canal alfa. Frente a los modelos de segmentación semántica clásicos, BiRefNet aborda la segmentación dicotómica de alta resolución, donde el objetivo es una separación binaria precisa de primer plano y fondo con bordes finos.

La relevancia de esta ficha concreta es operativa: el repositorio `Q-P1NG/birefnet-lite-512` es una copia sin modificaciones del export ONNX de Studio Ludens, mantenida como origen estable de descarga para una aplicación concreta (Q-P1NG), con verificación de SHA-256 por archivo. No aporta pesos nuevos ni cambios en el modelo; su valor es la reproducibilidad y la integridad de los artefactos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiRefNet (red de referencia bilateral para segmentación dicotómica); export ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 512 x 512) |
| Tipos de cuantización | solo precisión completa (float32); existe export float16 en el repo original, no incluido aquí |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, 191.877.254 bytes) + `preprocessor_config.json` |

## Arquitectura y entrenamiento

BiRefNet es una arquitectura de segmentación dicotómica basada en referencias bilaterales, descrita en el artículo "Bilateral Reference for High-Resolution Dichotomous Image Segmentation" (Zheng et al., 2024, CAAI Artificial Intelligence Research). El modelo emplea mecanismos de referencia bilateral para refinar la separación entre primer plano y fondo, y está diseñado específicamente para tareas de segmentación dicotómica de alta resolución.

Esta exportación concreta no incluye información sobre el dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre procesos de ajuste fino con RLHF o DPO (no aplicables a un modelo de segmentación). El repositorio solo documenta el proceso de exportación: entrada float32 `[1, 3, 512, 512]` en RGB reescalada a 512 x 512, normalizada con la media `[0.485, 0.456, 0.406]` y la desviación `[0.229, 0.224, 0.225]` de ImageNet; salida float32 `[1, 1, 512, 512]` de logits a los que se aplica una sigmoide para obtener la matte alfa. Los detalles de entrenamiento del modelo base deben consultarse en el repositorio original `ZhengPeng7/BiRefNet_lite`.

## Capacidades

- Segmentación dicotómica de imágenes: separa el sujeto principal del fondo generando una máscara alfa de un canal.
- Generación de mattes con bordes finos, apta para composición y recorte.
- Entrada RGB normalizada a 512 x 512; salida de logits con resolución 512 x 512 que debe reescalarse al tamaño de la imagen original.
- Ejecución en ONNX Runtime, incluida CPU, al usar precisión completa (float32).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades más allá de la imagen de entrada.

## Casos de uso

- Eliminación de fondos en aplicaciones móviles: el export en float32 garantiza compatibilidad con ONNX Runtime en CPU de teléfonos, donde el export float16 no se ejecuta en todos los dispositivos; la app descarga el modelo desde este repositorio estable y verifica su SHA-256.
- Procesamiento por lotes de catálogos de producto: recortar automáticamente el sujeto de fotografías de e-commerce para generar imágenes con fondo transparente o uniforme.
- Creación de avatares y fotos de perfil: extraer la silueta del usuario para componerla sobre fondos personalizados en aplicaciones de edición.
- Pipelines de diseño gráfico automatizado: integrar la matte alfa en flujos de composición para separar capas sin intervención manual.
- Preprocesado para otros modelos de visión: usar la máscara para aislar regiones de interés antes de tareas de clasificación, detección o reconocimiento.
- Herramientas de videoconferencia o retoque en tiempo real: sustitución de fondo en aplicaciones de escritorio o web mediante inferencia ONNX local, sin dependencia de servicios en la nube.
- Distribución reproducible de artefactos: servir como origen inmutable de un modelo concreto en aplicaciones que requieren integridad verificable de los binarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del artefacto: 191.877.254 bytes (aproximadamente 183 MiB) para `model.onnx` en float32; el repositorio completo ocupa 0,2 GB.
- VRAM estimada: no disponible de forma explícita; por el tamaño del modelo en float32, la inferencia cabe holgadamente en GPUs de consumo, aunque no se documentan cifras exactas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: previsible por el tamaño del artefacto, pero sin datos oficiales que lo confirmen.
- Despliegue: ONNX Runtime (CPU y GPU), con entrada fija `[1, 3, 512, 512]`; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución de entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Q-P1NG/birefnet-lite-512 | BiRefNet lite (ONNX) | 512 x 512 | MIT | ONNX float32 | Copia estable para una app concreta |
| studioludens/birefnet-lite-512 | BiRefNet lite (ONNX) | 512 x 512 | MIT | ONNX float32 y float16 | Origen del export; incluye variante float16 |
| ZhengPeng7/BiRefNet_lite | BiRefNet lite (original) | variable | MIT | safetensors/PyTorch | Modelo base de referencia, pesos originales |

## Limitaciones y advertencias

- No es un modelo nuevo: es una copia sin modificaciones de un export de terceros, por lo que no incorpora mejoras respecto al original.
- La resolución de entrada está fijada a 512 x 512; imágenes de mayor resolución requieren reescalado previo y posterior de la matte, lo que puede degradar la precisión de bordes finos.
- Solo se incluye precisión completa (float32); no hay versión cuantizada en este repositorio.
- No se documentan sesgos específicos, pero como modelo de segmentación puede fallar en sujetos poco representados, escenas ambiguas o imágenes con múltiples objetos candidatos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de errores de segmentación (falsos positivos o negativos en la máscara).
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright de ZhengPeng (2024) y Studio Ludens (2026) incluido en `LICENSE`.
- Para producción, conviene verificar el SHA-256 de cada archivo tal como hace la aplicación de referencia, y consultar el repositorio original para conocer el rendimiento y las limitaciones del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Q-P1NG/birefnet-lite-512
- Export original de Studio Ludens: https://huggingface.co/studioludens/birefnet-lite-512
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Artículo: Zheng, P., Gao, D., Fan, D.-P., Liu, L., Laaksonen, J., Ouyang, W., Sebe, N. "Bilateral Reference for High-Resolution Dichotomous Image Segmentation", CAAI Artificial Intelligence Research, 2024.
