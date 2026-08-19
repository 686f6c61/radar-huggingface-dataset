# Comfy-Org/z_image

## Resumen

Z-Image es un modelo de difusión para generación de imágenes, distribuido por Comfy-Org como archivos empaquetados para su uso directo en ComfyUI. Se publicó en enero de 2026 y ha acumulado más de 149.000 descargas y 256 likes en HuggingFace, lo que indica un interés notable en la comunidad. La model card proporcionada es muy escueta: únicamente indica que se trata de archivos reempaquetados para ComfyUI y da instrucciones de colocación en las carpetas del modelo, el codificador de texto y el VAE.

A partir de los archivos incluidos, se puede inferir que el modelo principal es un archivo safetensors de 36 GB (probablemente en BF16), acompañado de un codificador de texto basado en Qwen 3 4B (con versiones FP4 y FP8) y un VAE separado. Sin embargo, no se dispone de información oficial sobre la arquitectura interna, los parámetros, el entrenamiento, la licencia o los idiomas soportados. Esta ficha se limita a los datos disponibles y marca como "no disponible" cualquier especificación no documentada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se mencionan archivos BF16, FP4 y FP8 para el text encoder, pero no para el modelo principal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (archivos .safetensors para el modelo, text encoder y VAE) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (si es un transformer de difusión, un modelo de flujo, etc.) ni sobre los datos de entrenamiento, el número de tokens, el proceso de alineación o cualquier innovación técnica. La model card no incluye ningún detalle al respecto.

## Capacidades

No se dispone de información detallada sobre las capacidades del modelo en la documentación proporcionada. Dado que es un modelo de difusión para imágenes, se espera que pueda generar imágenes a partir de texto, pero no hay confirmación oficial ni detalles sobre funciones adicionales como tool calling, razonamiento multimodal o soporte de agentes.

## Casos de uso

No se dispone de información concreta sobre casos de uso específicos en la documentación proporcionada. Al tratarse de un modelo de difusión de imágenes, los usos típicos podrían incluir generación artística, edición o síntesis de imágenes, pero no hay datos que respalden estas afirmaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware en la documentación proporcionada. El tamaño del repositorio (36 GB) sugiere que el modelo principal requiere una GPU con al menos 24 GB de VRAM para inferencia en BF16, pero esto es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de contexto.
- La licencia no está especificada, por lo que se desconoce si el uso comercial está permitido.
- Al ser un modelo de difusión, es posible que presente limitaciones típicas como generación de detalles inconsistentes o dificultad con texto dentro de las imágenes, pero esto no está documentado.
- La ausencia de una model card detallada dificulta la evaluación de su idoneidad para producción.

## Enlaces

- [HuggingFace - Comfy-Org/z_image](https://huggingface.co/Comfy-Org/z_image)
