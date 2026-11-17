# Byounghan/clear-ec-p3b

## Resumen

CLEAR-EC Phase II (tier p3b) es un conjunto de pesos publicado por el usuario Byounghan para el reto CLEAR-EC Grand Challenge, centrado en el análisis automático de imágenes de microscopía especular del endotelio corneal. Dada una imagen de 972 x 1296 píxeles en 8 bits, el modelo regresa tres biomarcadores clínicos: la densidad celular endotelial (CD), el coeficiente de variación del área celular (CV) y la hexagonalidad (HEX). El repositorio contiene 443 ficheros que suman 16,25 GB, con la estructura de rutas que espera el contenedor de inferencia del reto.

No se trata de un modelo de lenguaje: es un sistema de visión por computador orientado a una tarea de regresión múltiple sobre imágenes médicas. La model card no detalla la arquitectura interna, el número de parámetros ni la longitud de contexto (concepto no aplicable aquí), y remite al repositorio de GitHub `leebyounghan/clear-ec-research` (acceso bajo petición) para el código, la definición del contenedor y las instrucciones de ejecución. La relevancia radica en su rendimiento reportado sobre el conjunto de test oculto de la Fase II (1.000 imágenes), con un error absoluto porcentual medio (MAPE) global de 8,935.

El modelo se distribuye con licencia "other" y está etiquetado explícitamente como de uso exclusivamente investigador, no clínico. El repositorio se creó y actualizó el 17 de noviembre de 2026 y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema de regresión sobre imágenes; la model card no especifica la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (entrada: imagen única de 972 x 1296, 8 bits) |
| Tipos de cuantizacion | no disponible; se menciona que algunos checkpoints de regresión están en fp16 y se convierten a fp32 al cargar |
| Idiomas soportados | no aplica (modelo de visión, no textual) |
| Licencia | other (uso exclusivamente investigador; no clínico) |
| Formato de pesos | no disponible de forma explícita; el repo incluye `checkpoint_sha256.txt` con sha256, tamaño y ruta de cada fichero, y checkpoints en fp16/fp32 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo. Por las etiquetas del repositorio y la referencia a un directorio `experiments/lane_cd_20261108/arms/dinov3_b16_f99_s47`, se deduce la presencia de componentes basados en DINOv3 (variante ViT-B/16), aunque no se confirma que ese brazo concreto forme parte del pipeline de p3b: de hecho, se indica que esos cinco ficheros no son leídos por p3b y se conservan solo para que el árbol de directorios coincida con el archivo probado. El sistema se organiza como un conjunto de checkpoints ("tier p3b") que predicen de forma conjunta las tres métricas endoteliales.

En cuanto a los datos, el modelo se entrenó con los datos de entrenamiento del reto CLEAR-EC y con el conjunto público de microscopía especular de Topcon. La evaluación se realizó con cinco particiones agrupadas por donante (out-of-fold), lo que evita fuga de información entre imágenes del mismo donante. No se especifica el número de tokens, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de regresión visual). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Regresión de densidad celular endotelial (CD) a partir de una imagen de microscopía especular.
- Regresión del coeficiente de variación del área celular (CV).
- Regresión de hexagonalidad (HEX).
- Procesamiento de imágenes de entrada de 972 x 1296 píxeles en 8 bits.
- Inferencia empaquetada para un contenedor que monta el directorio de pesos en `/opt/ml/model` en modo solo lectura.
- Verificación de integridad de los pesos mediante `scripts/verify_checkpoints.py` y el fichero `checkpoint_sha256.txt`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo especializado de visión médica.

## Casos de uso

- Evaluación automatizada de imágenes de microscopía especular en estudios de investigación sobre el endotelio corneal: el modelo devuelve CD, CV y HEX de forma directa, lo que permite procesar lotes de imágenes sin medición manual.
- Triaje de imágenes en conjuntos de datos de gran tamaño: al puntuar cada imagen con las tres métricas, se pueden priorizar revisiones de casos con valores atípicos antes del análisis por especialistas.
- Reproducibilidad de experimentos del reto CLEAR-EC: el repositorio conserva la estructura de rutas y los hashes que espera el contenedor, lo que facilita repetir la inferencia de la Fase II sobre las mismas imágenes.
- Comparación de pipelines de análisis endotelial: sirve como línea base cuantitativa (MAPE de 8,935 en test oculto) frente a métodos alternativos de segmentación y conteo celular.
- Validación cruzada en estudios con agrupación por donante: el esquema de cinco particiones agrupadas por donante documentado permite reutilizar el modelo en protocolos de validación que eviten fuga de información.
- Docencia y formación en imagen médica computacional: el contenedor y los scripts de verificación permiten montar un entorno reproducible para prácticas sobre regresión de biomarcadores a partir de imágenes.

## Benchmarks y rendimiento

Resultados reportados en la model card (error absoluto porcentual medio, MAPE):

| Conjunto | Mean | CD | CV | HEX |
|---|---:|---:|---:|---:|
| Out-of-fold, cinco particiones agrupadas por donante | 8,660 | 6,148 | 10,112 | 9,719 |
| Test oculto de la Fase II (1.000 imágenes) | 8,935 | 6,162 | 10,290 | 10,353 |

No se han publicado en la información disponible resultados comparativos con otros modelos en términos de MMLU, HumanEval, GSM8K u otros benchmarks estándar, que no son aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 16,25 GB en disco, pero el tamaño de los pesos cargados en memoria no se detalla.
- GPU recomendadas: no disponible en la model card.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas como RTX 4090.
- Opciones de despliegue: contenedor de inferencia del reto CLEAR-EC que monta los pesos en `/opt/ml/model` en modo solo lectura; descarga mediante `hf download <repo> --local-dir checkpoints/` y verificación con `python3 scripts/verify_checkpoints.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de regresión de biomarcadores endoteliales ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Uso exclusivamente investigador: la licencia "other" y la propia model card indican que no es apto para uso clínico.
- No se documentan sesgos conocidos ni evaluación de equidad por subpoblaciones (edad, etnia, patología corneal).
- Riesgo de alucinación no aplica en el sentido textual, pero sí existe riesgo de predicciones erróneas en imágenes fuera de la distribución de entrenamiento (iluminación, calidad de captura, equipos distintos al Topcon).
- Dependencia de la calidad de la imagen de entrada: el modelo asume imágenes de 972 x 1296 en 8 bits; no se especifica el comportamiento con otras resoluciones o formatos.
- El acceso al código y al contenedor requiere petición en el repositorio de GitHub `leebyounghan/clear-ec-research`, lo que limita la reproducibilidad sin autorización del autor.
- No se especifican los términos exactos de la licencia "other" más allá de la restricción a investigación; conviene revisar el texto completo antes de cualquier uso derivado.
- El modelo no es un sistema de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni agentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Byounghan/clear-ec-p3b
- Repositorio de código (acceso bajo petición): `leebyounghan/clear-ec-research` en GitHub
- CLEAR-EC Grand Challenge: no se proporciona URL en la información disponible
- Conjunto público de microscopía especular de Topcon: no se proporciona URL en la información disponible
