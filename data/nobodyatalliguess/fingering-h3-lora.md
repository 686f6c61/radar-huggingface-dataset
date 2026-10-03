# nobodyatalliguess/fingering-h3-lora

## Resumen

`nobodyatalliguess/fingering-h3-lora` es un adaptador LoRA para el modelo de generación de vídeo MiniMax-H3, publicado en HuggingFace como rehost sin modificar de la versión v1.1_H3 del LoRA "Fingering Pussy" creado originalmente por el usuario Generation3dX en Civitai. No se trata de un modelo de pesos completos, sino de un adaptador de bajo rango que se aplica sobre los pesos del modelo base `MiniMaxAI/MiniMax-H3`. El repositorio ocupa 0,2 GB y contiene un único fichero safetensors, `h3_base_fingering_v1.1-6000.safetensors`, cuyo hash SHA256 coincide con el artefacto original de Civitai, lo que permite verificar la integridad del rehost.

El adaptador está etiquetado como `not-for-all-audiences` y genera contenido audiovisual adulto explícito. El propio autor de la model card restringe su uso a contenido ficticio y consentido entre adultos, con prohibición explícita de representar personas reales o identificables y de cualquier contenido que implique a menores. La licencia aplicable es la Civitai Creator License, que exige acreditar al creador original, y no es una licencia de código abierto al uso.

Su relevancia técnica es limitada y acotada: se trata de un artefacto de nicho, con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, sin idiomas especificados y sin resultados de benchmarks. Su interés para un desarrollador o investigador reside en el estudio de adaptadores LoRA sobre modelos de vídeo con modo audio (los modos FL2VA y Ref2VA citados por el autor), no en su uso como componente de producto generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de vídeo MiniMax-H3; rango y dimensiones objetivo no disponibles |
| Parametros totales | no disponible (peso del fichero dentro de un repo de 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base MiniMax-H3) |
| Tipos de cuantizacion | no disponible; solo se publica safetensors sin cuantizar (sin GGUF, FP8 ni versiones int8) |
| Idiomas soportados | no disponible |
| Licencia | Civitai Creator License (`license: other`), con obligación de acreditar al creador |
| Formato de pesos | safetensors (`h3_base_fingering_v1.1-6000.safetensors`) |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Creador original | Generation3dX (Civitai) |
| Rehost en HuggingFace | nobodyatalliguess |
| Version del adaptador | v1.1_H3 |
| Fuerza recomendada | 0,8 |
| Modos compatibles | FL2VA y Ref2VA |
| Palabras de activacion (trigger words) | ninguna declarada en la informacion de la version de Civitai |
| SHA256 | `8aeb24f44ec0648cc1cec654da0d0a48fe02eec5ac45e0d112796ec460a829f7` (coincide con Civitai) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a determinadas capas del modelo base para desplazar su comportamiento sin reentrenar los pesos completos. La información disponible no especifica el rango del adaptador, las capas objetivo, el optimizador, la tasa de aprendizaje ni el número de pasos; únicamente el nombre del fichero incluye el sufijo `-6000`, que sugiere 6000 pasos de entrenamiento, dato no confirmado por el autor. No se detalla si el entrenamiento se hizo sobre el modelo base MiniMax-H3 directamente o sobre un checkpoint derivado.

El autor indica que el LoRA funciona tanto sobre el modelo base H3 como emparejado con el checkpoint 10ErosMax de TenStrip para H3, y que es compatible con los modos FL2VA y Ref2VA. No se publica información sobre el dataset de entrenamiento, su composición, el uso de técnicas de alineación (RLHF, DPO) ni ninguna innovación técnica adicional. No hay paper ni informe técnico asociado.

## Capacidades

- Generación de vídeo adulto explícito sobre el modelo base MiniMax-H3, aplicando un desplazamiento de estilo y contenido mediante LoRA.
- Compatible con el modo FL2VA del modelo base, según la model card del autor.
- Compatible con el modo Ref2VA del modelo base, según la model card del autor.
- Funciona tanto sobre MiniMax-H3 base como sobre el checkpoint 10ErosMax de TenStrip para H3.
- Fuerza de aplicación ajustable; el autor recomienda 0,8, valor usado en todas las pruebas y vídeos de muestra del creador.
- Sin palabras de activación: no requiere tokens especiales en el prompt para activarse.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, matemáticas, código ni visión.
- No se declaran capacidades multilingües ni idiomas soportados.

## Casos de uso

- Investigación sobre adaptación de bajo rango en modelos de vídeo: el artefacto permite estudiar cómo un LoRA de 0,2 GB desplaza el comportamiento de un modelo de vídeo grande, comparando la salida con y sin adaptador a distintas fuerzas (por ejemplo, 0,5 frente a 0,8) para medir el efecto del escalado del adaptador.
- Auditoría y desarrollo de filtros de contenido: disponer de un LoRA NSFW de referencia permite a los equipos de moderación validar que sus clasificadores y filtros de salida detectan correctamente contenido adulto generado por difusión o por modelos de vídeo, incluyendo variantes con prompts ambiguos.
- Verificación de integridad y cadena de custodia de artefactos: el repositorio publica el SHA256 del fichero y confirma que coincide con el original de Civitai, lo que sirve como caso práctico de rehost verificable y de gestión de procedencia en un registro interno de modelos.
- Evaluación de pipelines de inferencia de vídeo con audio: dado que el adaptador se declara compatible con los modos FL2VA y Ref2VA, puede usarse para probar la estabilidad de un pipeline de generación vídeo+audio cuando se le añade un adaptador externo, midiendo tiempos de carga, consumo de VRAM adicional y posibles degradaciones.
- Pruebas de reproducibilidad entre checkpoints base: el autor indica que funciona sobre H3 base y sobre 10ErosMax, lo que permite comparar si el mismo adaptador produce resultados consistentes en dos bases distintas y documentar la sensibilidad del LoRA al checkpoint de partida.
- Archivado y catalogación de adaptadores de nicho: para equipos que mantienen un registro de artefactos con licencias no estándar, este repositorio ejemplifica un caso de licencia Civitai Creator License con obligación de atribución, útil para definir plantillas de metadatos de licencia en un catálogo interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica. El consumo lo determina casi por completo el modelo base MiniMax-H3, no el adaptador; el LoRA añade una sobrecarga marginal sobre los pesos base (el repositorio completo ocupa 0,2 GB en disco).
- GPU recomendadas: no disponibles para este adaptador. En la práctica, las requeridas por MiniMax-H3 en el modo de generación elegido; la model card no las especifica.
- Compatibilidad con GPU de consumo: no disponible. Depende por completo del modelo base y del modo (FL2VA o Ref2VA) y de la resolución y duración del vídeo solicitado.
- Opciones de despliegue: no disponibles en la información proporcionada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al tratarse de un LoRA de vídeo, el despliegue depende del runtime que soporte MiniMax-H3 y la carga de adaptadores safetensors.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de velocidad, tiempo por clip ni tokens o frames por segundo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA comparables para MiniMax-H3 ni datos de rendimiento que permitan establecer una comparación con alternativas de la misma categoría. Tampoco se publican especificaciones del modelo base que permitan contrastarlo con otros modelos de generación de vídeo con audio.

## Limitaciones y advertencias

- Contenido adulto explícito: el adaptador está etiquetado como `not-for-all-audiences` y su finalidad declarada es generar vídeo NSFW. No es apto para productos dirigidos al público general ni para entornos sin control de acceso por edad.
- Restricciones de uso del autor: la model card prohíbe explícitamente generar imágenes o vídeos de personas reales o identificables y cualquier contenido que implique a menores. El uso debe limitarse a contenido ficticio y consentido entre adultos.
- Licencia no abierta: se aplica la Civitai Creator License, que exige acreditar al creador original (Generation3dX). Es una licencia `other`, no una licencia permisiva tipo Apache 2.0 o MIT, por lo que el uso comercial está sujeto a los términos del enlace de licencia de Civitai y debe revisarse caso por caso antes de cualquier despliegue en producción.
- Responsabilidad del rehost: este repositorio es un rehost sin modificar; el autor del rehost no es el creador del adaptador y no ofrece soporte, documentación de entrenamiento ni garantías de funcionamiento.
- Ausencia de datos técnicos: no se publican rango del LoRA, capas objetivo, dataset, hiperparámetros, idiomas ni benchmarks, lo que impide evaluar su calidad de forma objetiva antes de probarlo.
- Riesgo de alucinación y de artefactos visuales: no hay métricas publicadas de fidelidad, coherencia temporal ni calidad de movimiento; al ser un adaptador de bajo rango, es esperable que la calidad dependa fuertemente del prompt, del checkpoint base y del valor de fuerza aplicado.
- Dependencia del modelo base: cualquier limitación de contexto, resolución, duración o idioma de MiniMax-H3 se hereda; el adaptador no las corrige ni las amplía.
- Cifras de adopción nulas: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validación por parte de la comunidad y ningún historial de incidencias conocido.
- Riesgo de seguridad en la cadena de suministro: aunque se publica el SHA256 y coincide con Civitai, conviene verificar el hash localmente tras la descarga y tratar el fichero safetensors como material potencialmente sensible antes de cargarlo en un runtime de producción.

## Enlaces

- HuggingFace: https://huggingface.co/nobodyatalliguess/fingering-h3-lora
- Modelo base en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Página original del LoRA en Civitai: https://civitai.com/models/2007360?modelVersionId=3342542
- Perfil del creador original en Civitai: https://civitai.com/user/Generation3dX
- Texto de la licencia: https://civitai.com/models/2007360?modelVersionId=3342542
