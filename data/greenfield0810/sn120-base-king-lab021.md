# greenfield0810/sn120-base-king-lab021

## Resumen

Este repositorio contiene una copia sin modificar de un checkpoint competidor de la leaderboard de Bittensor subnet 120 (Affine). El modelo original fue subido por la cuenta `ringtone-ro` bajo el nombre `affine-5hndumbnxc-f90f8ebe64`, y ha sido archivado por `greenfield0810` para preservar el acceso a los pesos, ya que los repositorios de esa leaderboard suelen volverse privados en pocos días. No se trata de un modelo desarrollado por `greenfield0810`, sino de un espejo byte por byte con fines de archivo.

El peso es un modelo multimodal `image-text-to-text` de 35,95 mil millones de parámetros, etiquetado como `qwen3_5_moe` y `conversational`. Esto indica una arquitectura de mezcla de expertos (MoE) de la familia Qwen3.5-MoE, capaz de procesar imágenes y texto para generar texto. No se dispone de información sobre la longitud de contexto, la licencia ni los idiomas soportados, por lo que estas especificaciones quedan sin determinar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), familia Qwen3.5-MoE según etiquetas del repositorio |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (6 shards, 71,90 GB) |

## Arquitectura y entrenamiento

La arquitectura se deduce de las etiquetas `qwen3_5_moe` y `image-text-to-text`: es un modelo de mezcla de expertos de la familia Qwen3.5-MoE, multimodal, con capacidad conversacional. Sin embargo, no se ha publicado documentación técnica sobre el número de expertos, los parámetros activos ni el diseño del enrutamiento.

El checkpoint no ha sido entrenado ni finamente ajustado por el autor del repositorio. Es una copia idéntica del modelo original `ringtone-ro/affine-5hndumbnxc-f90f8ebe64` en la revisión `83dbebac0e25`, con hash de pesos `b05270399e4f85030a4f8a9865f2f9e7a2571a2c2b06c8d78500c7dcf4431c89`. El archivo se compone de 6 shards de safetensors que suman 71,90 GB. No hay información sobre datos de entrenamiento, número de tokens, procesos de alineación como RLHF o DPO, ni ninguna innovación técnica destacable más allá de lo indicado en las etiquetas.

## Capacidades

- Generación de texto multimodal: el pipeline `image-text-to-text` indica que el modelo acepta imágenes y texto como entrada y devuelve texto.
- Conversación: la etiqueta `conversational` sugiere que está pensado para diálogos multi-turno.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Otras capacidades especiales (modo pensamiento, visión, audio): no disponible; solo se confirma la entrada de imágenes y texto.

## Casos de uso

Los siguientes casos son aplicaciones potenciales de un modelo multimodal `image-text-to-text` con arquitectura MoE. No se han publicado evaluaciones que validen su rendimiento, por lo que deben considerarse hipótesis de uso, no garantías.

- Descripción automática de imágenes en aplicaciones de accesibilidad: el modelo puede generar descripciones de escenas a partir de una entrada de imagen y una pregunta en texto, lo que mejoraría la experiencia de usuarios con discapacidad visual.
- Análisis de capturas de pantalla de errores: en entornos de soporte técnico, el modelo podría recibir una captura y describir el error o sugerir pasos de solución, aprovechando su capacidad de diálogo.
- Generación de informes a partir de imágenes de dashboards: si se alimenta con gráficos o paneles, el modelo podría redactar un resumen textual de los datos visuales, útil para automatizar reportes ejecutivos.
- Transcripción y estructuración de documentos escaneados: facturas, contratos o recibos podrían procesarse para extraer campos clave, combinando la entrada de imagen con instrucciones en texto.
- Moderación de contenido visual: el modelo podría clasificar imágenes como apropiadas o inapropiadas y generar una explicación textual, integrado en un pipeline de revisión.
- Asistencia educativa con diagramas y figuras: el modelo puede responder preguntas sobre gráficos científicos o esquemas, facilitando el aprendizaje interactivo en plataformas educativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos se publican en safetensors con un tamaño total de 71,90 GB en 6 shards. Dado que el modelo tiene 35,95 mil millones de parámetros, la precisión de almacenamiento es de 16 bits (FP16/BF16).
- VRAM estimada para cargar los pesos en FP16/BF16: aproximadamente 72 GB. En la práctica, hay que sumar la memoria de activaciones y el KV-cache, por lo que se recomienda una GPU con al menos 80 GB de VRAM, como una A100 80GB o una H100 80GB.
- Alternativamente, se requiere una configuración multi-GPU para repartir el modelo (por ejemplo, 4 x RTX 4090 24GB con parallelism). No se dispone de documentación sobre cuantizaciones oficiales, por lo que no se puede indicar una variante 4 u 8 bits.
- Opciones de despliegue: la etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints, lo que permitiría usar TGI o vLLM, aunque no se ha verificado esa compatibilidad de forma explícita.

## Comparativa con modelos similares

No disponible. No se han publicado benchmarks ni especificaciones detalladas que permitan comparar este checkpoint con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- El modelo no es un desarrollo original del autor del repositorio; es una copia archivada de un checkpoint competidor de Bittensor subnet 120 (Affine).
- La licencia es no disponible, por lo que no se pueden determinar las restricciones de uso comercial ni de redistribución.
- No se han publicado datos de entrenamiento, evaluaciones, ni documentación técnica que respalde la calidad o seguridad del modelo.
- Al estar vinculado a una leaderboard competitiva, el modelo puede haber sido ajustado para un objetivo específico y no ser representativo de un modelo generalista.
- El repositorio original puede eliminarse o hacerse privado, y este archivo podría quedar obsoleto respecto a futuras revisiones.
- Al no existir información sobre idiomas ni datos de evaluación, no es posible afirmar cobertura multilingüe ni comportamiento ante sesgos o alucinaciones.

## Enlaces

- Hugging Face: https://huggingface.co/greenfield0810/sn120-base-king-lab021
- Repositorio original: https://huggingface.co/ringtone-ro/affine-5hndumbnxc-f90f8ebe64
- Revisión original: https://huggingface.co/ringtone-ro/affine-5hndumbnxc-f90f8ebe64/commit/83dbebac0e25
- Búsqueda de modelos con el tag `subnet-120`: https://huggingface.co/models?other=subnet-120
- Otro archivo del mismo autor: https://huggingface.co/greenfield0810/affine-ark-7f4bb237bc46
- Archivo de procedencia dentro del repositorio: `_affine_provenance.json`
