# rostrumstudios/birefnet-lite

## Resumen

BiRefNet-lite es un modelo de segmentación dicotómica de imágenes (DIS, *Dichotomous Image Segmentation*) cuyo objetivo es separar el sujeto principal de una fotografía del fondo, generando una máscara de alta resolución. Está desarrollado por Peng Zheng, Dehong Gao, Deng-Ping Fan, Li Liu, Jorma Laaksonen, Wanli Ouyang y Nicu Sebe, y presentado en el artículo "Bilateral Reference for High-Resolution Dichotomous Image Segmentation" (CAAI Artificial Intelligence Research, 2024). La variante *lite* utiliza un backbone Swin-T para reducir coste computacional frente a las versiones completas del mismo autor.

El repositorio `rostrumstudios/birefnet-lite` no es el modelo original, sino una copia fijada (mirror) del export ONNX fp32 publicado por `onnx-community` bajo el identificador `onnx-community/BiRefNet_lite-ONNX`. Su propósito es servir de origen reproducible para las aplicaciones de Rostrum, que descargan el fichero en un commit fijo y verifican su hash SHA-256 antes de usarlo. El único artefacto es `model.onnx`, de 224.005.088 bytes (aproximadamente 224 MB), lo que supone un tamaño de repositorio de unos 0,2 GB.

Es relevante para desarrolladores que necesitan un modelo de *background removal* o *subject selection* ligero, ejecutable mediante ONNX Runtime sin dependencias de PyTorch, con licencia MIT y pesos verificables por hash. No es un modelo generativo: produce exclusivamente una máscara de segmentación y no sintetiza ni modifica píxeles de la imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiRefNet con backbone Swin-T (transformers jerárquicos con atención por ventanas desplazadas), exportado a ONNX |
| Parámetros totales | no disponible (el repositorio solo publica el tamaño del fichero ONNX: 224.005.088 bytes) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible en este repositorio; solo se distribuye el export fp32 (`model.onnx`) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | MIT (Copyright (c) 2024 ZhengPeng, procedente del repositorio original) |
| Formato de pesos | ONNX (`model.onnx`, fp32) |

## Arquitectura y entrenamiento

BiRefNet es una red de segmentación binaria de alta resolución construida sobre un backbone Swin-T. La innovación central del artículo es la *referencia bilateral*: el modelo combina dos ramas de referencia, una de imagen completa y otra de parches recortados de la región de interés, para refinar progresivamente los bordes y detalles finos del sujeto segmentado. Esta estrategia está pensada específicamente para segmentación dicotómica, donde el objeto puede ser muy fino (pelo, ramas, estructuras finas) y el contraste con el fondo es alto.

La variante *lite* reduce el coste del backbone (Swin-T frente a variantes mayores) manteniendo el esquema de referencia bilateral. Los detalles concretos de entrenamiento (número de tokens, composición exacta del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada; el artículo original es la fuente para esos datos. El export ONNX lo realiza `onnx-community` y se redistribuye sin cambios en este repositorio.

## Capacidades

- Segmentación dicotómica de imágenes: identifica el sujeto principal de una fotografía y devuelve una máscara binaria de alta resolución.
- *Background removal*: la máscara permite separar el sujeto del fondo para composición, recorte o edición.
- *Subject selection*: selección automática del sujeto principal, usada por Rostrum en su función "Select subject" de la app de diseño.
- Inferencia vía ONNX Runtime, sin necesidad de PyTorch en producción.
- Integridad verificable: cada fichero se descarga en un commit fijo y se comprueba por SHA-256 antes de su uso.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión para segmentación.
- No tiene capacidades multilingües ni de audio; no genera ni modifica píxeles, solo produce máscaras.

## Casos de uso

- Eliminación de fondo en herramientas de diseño: la app carga `model.onnx` mediante ONNX Runtime, obtiene la máscara del sujeto y la aplica como selección o canal alfa, sin tocar los píxeles originales. Adecuado por su tamaño contenido (224 MB) y su licencia MIT.
- Selección automática de sujeto en editores fotográficos: el usuario pulsa "seleccionar sujeto" y el modelo devuelve una máscara que el editor convierte en selección editable; útil para recortes rápidos en flujos de retoque.
- Generación de recortes para catálogos de producto: procesamiento por lotes de fotos de producto para aislar el objeto sobre fondo blanco o transparente, integrable en pipelines de servidor con ONNX Runtime.
- Preprocesado para modelos generativos de imagen: la máscara se usa como condicionamiento (por ejemplo, inpainting o composición) en pipelines donde se necesita aislar el sujeto antes de aplicar otra etapa.
- Automatización de *thumbnails* y avatares: recorte automático del sujeto principal para generar miniaturas o avatares consistentes en plataformas de contenido.
- Segmentación en aplicaciones de escritorio o móviles con presupuesto de memoria ajustado: el export fp32 de 224 MB y el backbone Swin-T permiten ejecución local sin GPU dedicada en muchos casos, con verificación de integridad por hash en la distribución.
- Verificación de cadena de suministro de modelos: el repositorio sirve como fuente fijada y auditable para equipos que necesitan reproducibilidad exacta de los pesos usados en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero ONNX fp32 ocupa 224 MB, por lo que la memoria necesaria para pesos es de ese orden, más activaciones dependientes de la resolución de entrada.
- GPU recomendadas: no disponible en la información proporcionada; al ser un export ONNX, es compatible con cualquier GPU soportada por ONNX Runtime (CUDA, TensorRT, DirectML) y con ejecución en CPU.
- ¿Cabe en GPU de consumo? El tamaño de pesos (224 MB fp32) es muy reducido, por lo que es razonable esperar que quepa en GPUs de consumo con memoria modesta; no se dispone de cifras oficiales de VRAM total ni de resoluciones máximas soportadas.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), integración en aplicaciones de escritorio y servidor; no se distribuye GGUF ni otros formatos en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiRefNet-lite (este repositorio, ONNX) | no disponible (ONNX fp32 de 224 MB) | no aplica | no disponible | MIT | Hugging Face, mirror fijado por hash |
| BiRefNet (versión completa, ZhengPeng7) | no disponible en la información | no aplica | no disponible | MIT (según repositorio original) | Hugging Face y GitHub |
| BiRefNet_lite original (ZhengPeng7) | no disponible en la información | no aplica | no disponible | MIT | Hugging Face |
| onnx-community/BiRefNet_lite-ONNX | no disponible en la información | no aplica | no disponible | MIT | Hugging Face |

No se dispone de datos de benchmarks comparativos en la información proporcionada; la comparativa se limita a licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Modelo exclusivamente de segmentación: no genera texto, imagen, audio ni voz; Rostrum lo usa solo para análisis.
- No se han publicado métricas de sesgo, robustez o tasas de error en la información disponible; el comportamiento en imágenes con múltiples sujetos, fondos complejos o sujetos de bajo contraste no está documentado aquí.
- Riesgo de máscaras imprecisas en bordes finos o estructuras semitransparentes (pelo, cristal, humo), inherente a la segmentación dicotómica; no hay datos oficiales de error en este repositorio.
- Sin capacidades lingüísticas ni multilingües: no aplica soporte de idiomas.
- Licencia MIT permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de copyright; el fichero se redistribuye sin cambios.
- Dependencia de ONNX Runtime: el despliegue requiere una versión compatible de ONNX Runtime y, para aceleración, los *providers* adecuados (CUDA, TensorRT, DirectML).
- Repositorio de solo 224 MB y un único fichero: no incluye tokenizador, preprocesado ni scripts de inferencia; el consumidor debe implementar el preprocesado de imagen y la postprocesado de la máscara.
- Verificación por SHA-256: si el hash no coincide, el fichero debe rechazarse; esto implica que cualquier actualización del modelo requiere cambiar el commit fijado y el hash en la aplicación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rostrumstudios/birefnet-lite
- Export ONNX de origen: https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
- Pesos originales: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Código original: https://github.com/ZhengPeng7/BiRefNet
- Organización Rostrum: https://huggingface.co/rostrumstudios
