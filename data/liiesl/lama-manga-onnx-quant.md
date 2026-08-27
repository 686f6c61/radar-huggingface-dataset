# Liiesl/lama-manga-onnx-quant

## Resumen

El modelo `Liiesl/lama-manga-onnx-quant` es una versión cuantizada en formato ONNX del modelo LaMa (Large Mask Inpainting) especializado en el relleno de regiones enmascaradas en imágenes de anime y manga. El modelo original, desarrollado por el equipo de LaMa (WACV 2022), utiliza convoluciones de Fourier para lograr un inpainting robusto a la resolución y a máscaras de gran tamaño. Esta adaptación concreta, publicada por el usuario Liiesl, se basa en el trabajo previo de mayocream (`mayocream/lama-manga-onnx`), que exportó el modelo a ONNX para facilitar su despliegue en entornos de producción con diferentes runtimes.

La relevancia de este modelo radica en su formato ONNX cuantizado, que permite una inferencia eficiente en CPU y GPU con un menor consumo de memoria, manteniendo una calidad aceptable para tareas de restauración y edición de ilustraciones. Aunque la información técnica detallada (número de parámetros, contexto, etc.) no está disponible en la ficha pública, su naturaleza como modelo de inpainting lo hace útil para aplicaciones de procesamiento de imágenes en el ámbito del cómic y la animación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaMa (Large Mask Inpainting) con convoluciones de Fourier (FourierUnitJIT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | cuantizado (formato ONNX quantizado, detalles no especificados) |
| Idiomas soportados | no aplicable (procesamiento de imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (cuantizado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LaMa, presentada en el artículo "Resolution-robust Large Mask Inpainting with Fourier Convolutions" (WACV 2022). LaMa emplea un generador con convoluciones de Fourier que permiten manejar máscaras de gran tamaño y diferentes resoluciones de manera robusta. El modelo original fue entrenado con un conjunto de datos diverso de imágenes naturales, pero la versión `lama-manga` se ha adaptado específicamente para ilustraciones de anime y manga, probablemente mediante fine-tuning o entrenamiento adicional con datasets de este dominio.

La exportación a ONNX se realizó a partir del modelo PyTorch original, y la cuantización posterior reduce la precisión de los pesos (posiblemente a int8) para optimizar la inferencia en hardware variado. No se dispone de información sobre el proceso exacto de entrenamiento, el número de tokens (no aplicable) o si se utilizaron técnicas como RLHF o DPO, ya que es un modelo de visión.

## Capacidades

- Relleno de regiones enmascaradas en imágenes de anime y manga, eliminando objetos no deseados o restaurando áreas dañadas.
- Manejo de máscaras de gran tamaño gracias a las convoluciones de Fourier, lo que permite eliminar elementos grandes (burbujas de texto, personajes completos, etc.).
- Robustez a diferentes resoluciones de entrada, manteniendo coherencia visual en la zona reconstruida.
- Inferencia eficiente en formato ONNX cuantizado, compatible con runtimes como ONNX Runtime, OpenVINO o TensorRT.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de la entrada/salida de imágenes.

## Casos de uso

- Restauración de escaneos de manga dañados: el modelo puede rellenar manchas, roturas o marcas de doblez en páginas escaneadas, preservando el estilo artístico.
- Eliminación de burbujas de diálogo para traducción: al enmascarar los globos de texto, el modelo reconstruye el fondo subyacente, facilitando la inserción de nuevas traducciones.
- Limpieza de bocetos digitales: permite eliminar líneas guía o elementos no deseados en ilustraciones sin afectar al dibujo principal.
- Edición creativa de fanart: los artistas pueden borrar objetos o personajes de una escena y dejar que el modelo complete el fondo de forma coherente.
- Preprocesamiento para datasets de entrenamiento: al limpiar imágenes de anime/manga, se pueden generar datasets más limpios para otros modelos de visión.
- Aplicaciones de retoque fotográfico en estilo anime: aunque está especializado en manga, puede usarse en imágenes con estética similar para eliminar imperfecciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como PSNR, SSIM o comparativas con otros modelos de inpainting en el contexto de manga/anime.

## Requisitos de hardware

- Al ser un modelo ONNX cuantizado, puede ejecutarse en CPU con un consumo de memoria moderado (estimación orientativa: menos de 500 MB de RAM, aunque no se confirma).
- En GPU, es compatible con tarjetas con al menos 2 GB de VRAM, como GTX 1050 Ti o superiores, gracias a la cuantización.
- Se puede desplegar con ONNX Runtime (CPU/GPU), OpenVINO (Intel), o mediante frameworks como Hugging Face Optimum.
- La latencia depende del tamaño de la imagen y la máscara; en una CPU moderna, una imagen de 512x512 puede procesarse en unos pocos segundos, pero no hay datos oficiales.
- No se requieren GPUs de gama alta; es adecuado para entornos de producción con recursos limitados.

## Comparativa con modelos similares

| Modelo | Formato | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Liiesl/lama-manga-onnx-quant` | ONNX cuantizado | Inpainting manga/anime | Apache-2.0 | Hugging Face |
| `mayocream/lama-manga-onnx` | ONNX | Inpainting manga/anime | Apache-2.0 | Hugging Face |
| LaMa original (PyTorch) | PyTorch | Inpainting general | Apache-2.0 | GitHub |

La principal diferencia entre la versión cuantizada y la no cuantizada es el tamaño y la velocidad de inferencia, aunque la calidad puede verse ligeramente reducida. Frente al LaMa original, la versión manga está afinada para ilustraciones, por lo que ofrece mejores resultados en ese dominio específico.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones específicas, pero al ser un modelo de inpainting, puede generar artefactos o texturas irreales en regiones complejas.
- La especialización en manga/anime puede degradar su rendimiento en fotografías reales u otros estilos artísticos.
- La cuantización puede introducir pérdida de calidad en los bordes de las máscaras o en detalles finos.
- No hay documentación sobre el proceso de cuantización (tipo de cuantización, calibración, etc.), lo que dificulta evaluar su impacto exacto.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia del modelo base y los datos de entrenamiento para evitar problemas de derechos de autor.
- El modelo no soporta procesamiento por lotes de forma nativa; habría que implementar la lógica de batching externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Liiesl/lama-manga-onnx-quant
- Repositorio original de mayocream: https://huggingface.co/mayocream/lama-manga-onnx
- Repositorio GitHub de LaMa ONNX: https://github.com/Mr14L/lamaonnx
- Artículo de LaMa (WACV 2022): no disponible en la búsqueda, pero se referencia en el repositorio GitHub.
- Exportación a ONNX (Colab): https://colab.research.google.com/github/Carve-Photos/lama/blob/main/export_LaMa_to_onnx.ipynb
