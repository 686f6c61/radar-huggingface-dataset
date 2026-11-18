# SCU-VIP-Lab/Dual-Layer-Image-Codec-with-Text-Guidance

## Resumen

Dual-Layer Image Codec with Text Guidance es un conjunto de checkpoints oficiales asociados al artículo "Dual-Layer Image Codec with Text Guidance for Hybrid Visual Perception", firmado por Tianma Shen, Joseph Quan y Ying Liu, y publicado por el grupo SCU-VIP-Lab. No se trata de un modelo de lenguaje, sino de un códec de imagen neuronal de dos capas orientado a la compresión para percepción visual híbrida: una capa base dedicada a detección de objetos y una capa de mejora guiada por texto para la reconstrucción de la región humana.

El repositorio de Hugging Face contiene únicamente los pesos de inferencia (ficheros `.ckpt` de PyTorch) distribuidos en dos directorios: `base_obj` (capa base, indicada como equivalente a la base de MMCRC) y `human` (capa de mejora con guiado textual). Cada directorio incluye cuatro checkpoints (`save1.ckpt` a `save4.ckpt`), presumiblemente correspondientes a distintas iteraciones o configuraciones de entrenamiento.

La relevancia del trabajo radica en su planteamiento de compresión orientada a tareas: en lugar de optimizar solo la fidelidad de reconstrucción, el códec separa la información necesaria para detección de objetos de la información necesaria para reconstruir regiones humanas, y utiliza texto como guía en la capa de mejora. El repositorio tiene 22,6 GB y licencia MIT, aunque no incluye pipeline declarado ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (códec de imagen neuronal de dos capas; capa base para detección de objetos y capa de mejora con guiado textual) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en precisión original de PyTorch, `.ckpt`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.ckpt` (PyTorch) |
| Tamano del repositorio | 22,6 GB |
| Libreria | PyTorch |
| Pipeline declarado | no disponible |
| Tags | compression, detection, pytorch |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del códec. La model card describe una estructura de dos capas: una capa base (`base_obj`) orientada a detección de objetos, señalada como idéntica a la base de MMCRC, y una capa de mejora (`human`) que incorpora guiado textual para la reconstrucción de regiones humanas. No se especifican el tipo de backbone, el número de parámetros, la tasa de compresión objetivo, la composición del dataset de entrenamiento ni si se emplearon técnicas como RLHF, DPO o destilación.

Tampoco se documentan innovaciones técnicas concretas más allá del propio esquema dual con guiado por texto. Cualquier afirmación sobre el entrenamiento (número de tokens, resolución de imagen, funciones de pérdida, codebook de cuantización latente) debe considerarse no disponible a partir de la información proporcionada.

## Capacidades

- Compresión de imagen en dos capas: una capa base y una capa de mejora.
- Detección de objetos a partir de la representación comprimida de la capa base.
- Reconstrucción de regiones humanas en la capa de mejora, con guiado textual.
- Percepción visual híbrida: combina tareas de compresión, detección y reconstrucción en un mismo flujo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Compresión de vídeo vigilancia con detección integrada: la capa base `base_obj` permite transmitir representaciones comprimidas sobre las que ejecutar detección de objetos en el extremo receptor, reduciendo el ancho de banda frente a enviar el flujo completo.
- Reconstrucción de regiones de interés humano: la capa `human` con guiado textual permite priorizar la calidad de reconstrucción en zonas con personas, útil en aplicaciones de videovigilancia o análisis forense.
- Sistemas de percepción en el borde (edge): al separar la información de detección de la de reconstrucción, es posible desplegar solo la capa base en dispositivos con recursos limitados.
- Investigación en compresión orientada a tareas: sirve como referencia reproducible para comparar códecs neuronales que optimizan métricas de detección en lugar de PSNR/MS-SSIM.
- Pipelines de análisis de escenas con personas: combinación de detección de objetos y reconstrucción guiada por descripciones textuales para aplicaciones de búsqueda o indexación visual.
- Reproducción de experimentos académicos: los cuatro checkpoints por capa permiten replicar resultados del artículo y evaluar distintas iteraciones de entrenamiento.
- Prototipado en investigación de códecs con guiado textual: base para extender el esquema a otras regiones u objetos mediante prompts de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (22,6 GB) incluye ocho checkpoints (cuatro por capa), por lo que el peso de un único checkpoint sería sustancialmente menor, pero no se especifica.
- GPU recomendadas: no disponible. No se documentan requisitos mínimos ni recomendados.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los checkpoints son ficheros `.ckpt` de PyTorch y requieren el código del repositorio oficial de GitHub para cargarse; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este códec).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dual-Layer Image Codec with Text Guidance | Códec de imagen neuronal de dos capas con guiado textual | no disponible | no disponible | MIT | Hugging Face (checkpoints) + GitHub |
| MMCRC (referencia citada en la model card) | Códec de imagen neuronal (capa base equivalente) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Alternativas de códec neuronal (p. ej. family de compresión aprendida) | Códec de imagen | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio contiene únicamente checkpoints; no incluye código de inferencia ni pipeline declarado, por lo que es necesario clonar el repositorio de GitHub para su uso.
- No se documentan sesgos conocidos, pero al estar entrenado para detección de objetos y reconstrucción de personas, puede heredar sesgos de los datasets de entrenamiento no especificados.
- Riesgo de alucinación no aplicable en el sentido de modelos de lenguaje, pero la capa de guiado textual puede producir reconstrucciones que no correspondan fielmente a la imagen original si el texto guía no es preciso.
- No se especifican limitaciones de resolución, tasa de bits ni dominios de imagen soportados.
- La licencia MIT permite uso comercial, pero al no documentarse los datos de entrenamiento ni posibles restricciones de terceros, conviene verificar la procedencia de los datasets antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se documenta mantenimiento, issues abiertos ni soporte del autor.
- El tamaño de 22,6 GB para ocho checkpoints sugiere pesos de gran tamaño; verificar el espacio en disco y la memoria antes de cargar.

## Enlaces

- Hugging Face: https://huggingface.co/SCU-VIP-Lab/Dual-Layer-Image-Codec-with-Text-Guidance
- Repositorio de código: https://github.com/SCU-VIP-Lab/dual-layer-image-codec-with-text-guidance
- Paper: no disponible como enlace directo en la información proporcionada (referenciado como "Dual-Layer Image Codec with Text Guidance for Hybrid Visual Perception", Tianma Shen, Joseph Quan, Ying Liu)
