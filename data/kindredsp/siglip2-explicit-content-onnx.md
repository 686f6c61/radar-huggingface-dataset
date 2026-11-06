# kindredsp/siglip2-explicit-content-onnx

## Resumen

`siglip2-explicit-content-onnx` es la exportación a formato ONNX del clasificador de imágenes `prithivMLmods/siglip2-x256-explicit-content`, desarrollado originalmente por prithivMLmods y convertido por el usuario kindredsp. El modelo se basa en la arquitectura SigLIP 2 (variante `siglip2-base-patch16-256`) y resuelve una tarea de clasificación de imágenes en cinco clases relacionadas con contenido explícito: Anime Picture, Hentai, Normal, Pornography y Enticing or Sensual. Su relevancia actual radica en que ofrece un pipeline de moderación visual listo para producción en formato ONNX, lo que permite inferencia con ONNX Runtime sin depender de PyTorch.

La conversión no implica reentrenamiento ni ajuste fino: los pesos son idénticos a los del checkpoint original en safetensors. El autor verificó la equivalencia numérica contra el modelo PyTorch, con una diferencia máxima de logits de 5,5e-06 sobre imágenes reales, lo que garantiza que el comportamiento del export es fiel al original. El repositorio ocupa 0,3 GB e incluye `model.onnx` (opset 17, batch dinámico), `labels.json` con el mapeo de clases y la licencia Apache 2.0.

El modelo está pensado para integrarse en aplicaciones de moderación de medios, filtrado de contenido en plataformas sociales o preprocesamiento de datasets. Su licencia permisiva y su formato ONNX lo hacen especialmente adecuado para despliegues en entornos con restricciones de dependencias o para ejecución en CPU mediante ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (siglip2-base-patch16-256), transformer vision-language con cabecera de clasificación |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 256x256) |
| Tipos de cuantizacion | no disponible (el repo contiene únicamente pesos float32 en ONNX) |
| Idiomas soportados | no disponible (clasificador de imágenes, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17, batch dinámico); el original en safetensors |
| Entrada | `pixel_values` float32 `[batch, 3, 256, 256]` |
| Salida | `logits` `[batch, 5]` |
| Clases | Anime Picture, Hentai, Normal, Pornography, Enticing or Sensual |
| Preprocesamiento | resize bilineal a 256x256, escala 0-1, normalización mean=0.5 std=0.5, NCHW |
| SHA-256 de model.onnx | aa2cb667ddefd74888efe410170d22a27fdfdc2d45dcb4ab65469ebc4f7d931f |

## Arquitectura y entrenamiento

El modelo subyacente es SigLIP 2, una evolución de la familia SigLIP que combina un codificador de visión con un objetivo de aprendizaje contrastivo imagen-texto basado en sigmoide en lugar de softmax. La variante `siglip2-base-patch16-256` procesa imágenes de 256x256 píxeles con parches de 16x16. Sobre esta base, el autor original añadió una cabecera de clasificación para las cinco clases de contenido explícito.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del export ONNX indica explícitamente que no hubo reentrenamiento ni ajuste fino durante la conversión: los pesos son los del checkpoint original `prithivMLmods/siglip2-x256-explicit-content`. La innovación técnica destacable de esta ficha es la exportación a ONNX con batch dinámico y la verificación numérica contra el modelo PyTorch, que facilita el despliegue en entornos de producción sin PyTorch.

## Capacidades

- Clasificación de imágenes en cinco categorías de contenido: Anime Picture, Hentai, Normal, Pornography y Enticing or Sensual.
- Detección de contenido sexualmente sugerente en fotografías reales, incluyendo poses, ángulos y ropa ajustada, según las notas de uso del autor.
- Inferencia con batch dinámico mediante ONNX Runtime, lo que permite procesar lotes de tamaño variable.
- Ejecución en CPU y GPU a través de ONNX Runtime, sin dependencia de PyTorch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador de imágenes puro.
- No procesa texto ni audio; su única entrada es una imagen RGB de 256x256.
- Capacidades multilingües no aplicables: las etiquetas de salida están en inglés y el modelo no genera texto.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede clasificar imágenes subidas por usuarios en las cinco categorías y activar flujos de revisión automática o bloqueo para las clases Hentai y Pornography. Su formato ONNX permite integrarlo en servicios backend con ONNX Runtime sin añadir PyTorch como dependencia.

- Filtrado de datasets de entrenamiento: antes de entrenar modelos generativos o de visión, se puede pasar cada imagen del corpus por el clasificador para eliminar contenido explícito no deseado. El batch dinámico facilita el procesamiento por lotes de miles de imágenes.

- Preprocesamiento en pipelines de aplicaciones de medios locales: el autor lo utilizó como "vibe check" en una app de medios local para distinguir fotos sexualmente sugerentes pero completamente cubiertas de fotos normales. Es adecuado para este uso por su ligereza (0,3 GB) y su ejecución en CPU.

- Control parental y filtrado en dispositivos: al ser un modelo ONNX de tamaño moderado, puede desplegarse en entornos de escritorio o servidores domésticos para filtrar imágenes antes de mostrarlas a menores, con la salvedad de evaluar su precisión en el dominio concreto.

- Verificación de cumplimiento en plataformas de contenido generado por usuarios: integrado en un pipeline de CI/CD o en un servicio de ingesta, el modelo puede marcar imágenes sospechosas para revisión humana, reduciendo la carga de moderadores.

- Análisis de catálogos de imágenes de cosplay o anime: aunque el autor advierte que no es fiable como juez de contenido explícito en fotos de cosplay (las clasifica a menudo como Anime Picture o Hentai), puede usarse como primera pasada para separar imágenes de animación de fotografías reales.

- Etiquetado automático de datasets para investigación: investigadores que necesiten anotar grandes colecciones de imágenes con categorías de contenido explícito pueden usar el modelo como etiquetador débil, combinándolo con revisión manual en los casos ambiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica proporcionada es la verificación de equivalencia numérica entre el modelo ONNX y el PyTorch original: diferencia máxima de logits de 5,5e-06 sobre imágenes reales, lo que confirma la fidelidad de la conversión pero no mide la calidad de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio es de 0,3 GB, lo que sugiere que el modelo es ligero y puede ejecutarse en GPU con poca memoria, pero no se especifica la VRAM exacta.
- GPU recomendadas: no disponible. Al ser un modelo SigLIP 2 base con entrada de 256x256, es probable que quepa en GPUs consumer, pero no se confirma en la documentación.
- ¿Cabe en consumer GPU? No disponible de forma explícita; el tamaño de 0,3 GB y la arquitectura base sugieren que sí, pero no se aportan datos concretos.
- Opciones de despliegue: ONNX Runtime (el autor proporciona ejemplo con `onnxruntime.InferenceSession`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imágenes.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| kindredsp/siglip2-explicit-content-onnx | SigLIP 2 base patch16-256 | no disponible | no aplica | Apache 2.0 | ONNX | Export del original, sin reentrenamiento |
| prithivMLmods/siglip2-x256-explicit-content | SigLIP 2 base patch16-256 | no disponible | no aplica | Apache 2.0 | safetensors | Modelo original en PyTorch |
| Otros clasificadores NSFW de la familia SigLIP | no disponible | no disponible | no aplica | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre benchmarks comparativos con otros clasificadores de contenido explícito, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El autor advierte que el modelo no es fiable como juez de contenido explícito en fotos de cosplay: tiende a clasificarlas como Anime Picture o Hentai, lo que puede generar falsos positivos en ese dominio.
- Riesgo de sesgos: el clasificador puede tener sesgos derivados del dataset de entrenamiento original, que no se documenta en la información disponible. No se especifica la composición demográfica ni la diversidad de las imágenes de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas en imágenes ambiguas o fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: el modelo solo procesa imágenes de 256x256; imágenes de otras resoluciones deben redimensionarse, lo que puede perder detalle relevante para la clasificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor original del modelo base no se pronuncia sobre restricciones adicionales; se recomienda revisar la licencia del modelo original.
- Caveat para producción: el autor recomienda explícitamente evaluar el modelo sobre datos propios antes de confiar en él, dado que su fiabilidad varía según el dominio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- La model card está marcada como `not-for-all-audiences`, lo que refleja la naturaleza sensible del contenido que clasifica.

## Enlaces

- Repositorio Hugging Face del export ONNX: https://huggingface.co/kindredsp/siglip2-explicit-content-onnx
- Modelo original en PyTorch: https://huggingface.co/prithivMLmods/siglip2-x256-explicit-content
