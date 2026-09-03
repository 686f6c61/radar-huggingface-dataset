# r3lax/Ornith-1.5-9B-heretic-NVFP4A16

## Resumen

Ornith-1.5-9B-heretic-NVFP4A16 es una variante cuantizada y "abliterada" del modelo multimodal Ornith-1.5-9B, publicada por el usuario r3lax en Hugging Face. El modelo base, desarrollado por ornith-ai, emplea una arquitectura derivada de Qwen3.5 (según las etiquetas del repositorio) e incorpora capacidades de procesamiento de imagen y vídeo. Esta versión concreta aplica dos modificaciones principales: la abliteración (eliminación de capas de rechazo para reducir la censura) y la cuantización NVFP4A16 mediante la librería compressed-tensors, optimizada para inferencia con vLLM en GPUs Blackwell.

El resultado es un modelo de aproximadamente 9.400 millones de parámetros (9.409.813.744) con pesos cuantizados a 4 bits para las capas lineales de texto, mientras que la torre de visión y las capas de atención lineal se mantienen en FP16. Esta combinación permite un equilibrio entre tamaño reducido (el archivo de pesos ocupa unos 10,4 GiB) y capacidades multimodales completas. Está diseñado para ser cargado directamente con vLLM utilizando los kernels Marlin NVFP4, con soporte para tool calling, razonamiento y procesamiento de vídeo e imagen.

La relevancia de este modelo radica en su carácter de "heretic" (abliterado), que elimina los mecanismos de rechazo del modelo original, y en su formato NVFP4A16, una cuantización de nueva generación pensada para hardware Blackwell. Sin embargo, al tratarse de una publicación reciente (septiembre de 2026) y sin métricas de rendimiento publicadas, su adopción en producción requiere una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5 (detalles especificos no disponibles) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (configuracion recomendada en vLLM: 32768) |
| Tipos de cuantizacion | NVFP4A16 (pesos en 4 bits, activaciones en 16 bits) con excepciones en FP16 para `lm_head`, capas `visual` y `linear_attn` |
| Idiomas soportados | No disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors con cuantizacion compressed-tensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base Ornith-1.5-9B no está documentada en la información proporcionada. Las etiquetas del repositorio (`qwen3_5`, `qwen3.5`) sugieren que se trata de una variante de la familia Qwen 3.5, probablemente con un diseño híbrido que combina atención lineal (se mencionan capas `linear_attn`) con componentes transformadores convencionales. El modelo es multimodal, con procesadores de imagen y vídeo incluidos en el repositorio.

La variante "heretic" aplica abliteración, una técnica que elimina o modifica las capas responsables del rechazo de contenido, resultando en un modelo con menos restricciones de salida. Posteriormente, el modelo se cuantiza a NVFP4A16 utilizando compressed-tensors, un formato de cuantización de 4 bits para pesos y 16 bits para activaciones, diseñado específicamente para GPUs Blackwell (sm_120). Las capas críticas como `lm_head`, la torre de visión y las capas de atención lineal se excluyen de la cuantización para preservar la calidad. No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generacion de texto multimodal: procesa entradas de imagen y vídeo junto con texto, gracias a los procesadores incluidos (`preprocessor_config.json`, `video_preprocessor_config.json`).
- Tool calling / function calling: compatible con vLLM mediante `--enable-auto-tool-choice` y el parser `qwen3_xml`.
- Razonamiento multi-paso: soporta el parser de razonamiento `qwen3` en vLLM, lo que habilita modos de pensamiento encadenado si el modelo base los incorpora.
- Abliterado: al ser una variante "heretic", se han eliminado los mecanismos de rechazo de contenido, lo que permite respuestas menos censuradas (aunque con riesgos asociados).
- Despliegue eficiente: cuantización NVFP4A16 optimizada para vLLM con kernels Marlin NVFP4 en GPUs Blackwell.
- Compatibilidad con prefix caching: recomendado usar `--enable-prefix-caching` para acelerar consultas repetitivas.

## Casos de uso

- Analisis de contenido audiovisual: el modelo puede procesar vídeos e imágenes y generar descripciones, transcripciones o resúmenes en texto. Su cuantización NVFP4 permite ejecutarlo en GPUs Blackwell con menor huella de memoria que el modelo original en FP16.
- Asistentes conversacionales con herramientas: gracias al soporte de tool calling y al parser `qwen3_xml`, puede integrarse en agentes que necesiten llamar funciones externas (búsquedas, APIs, bases de datos) durante una conversación.
- Razonamiento encadenado en entornos de investigacion: el parser de razonamiento `qwen3` permite extraer cadenas de pensamiento, útil para tareas de análisis lógico o matemático cuando se necesita auditar el proceso de decisión.
- Prototipado rapido de aplicaciones multimodales: al incluir procesadores de imagen y vídeo listos para usar, sirve como punto de partida para demos o MVPs que requieran comprensión visual y de vídeo sin entrenar un modelo desde cero.
- Inferencia de alto rendimiento con vLLM: la combinación de cuantización NVFP4 y el backend comprimido permite servir el modelo con baja latencia en producción, especialmente con prefix caching para consultas repetidas.
- Evaluacion de modelos abliterados: investigadores interesados en el impacto de la abliteración sobre la seguridad y la utilidad pueden utilizar esta variante para comparar comportamientos con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas comparativas para este modelo.

## Requisitos de hardware

- GPU recomendada: NVIDIA Blackwell (sm_120) para aprovechar los kernels Marlin NVFP4. Se menciona explícitamente `--attention-backend TRITON_ATTN` como recomendación.
- VRAM estimada: el archivo de pesos ocupa ~10,4 GiB. Con la cuantización NVFP4A16, se estima que el modelo cabe en GPUs con al menos 16 GiB de VRAM, aunque no se proporciona un valor exacto. Se recomienda `--gpu-memory-utilization 0.85`.
- Opciones de despliegue: vLLM es el backend principal soportado (con `--quantization compressed-tensors`). No se mencionan alternativas como llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El uso de prefix caching y la cuantización NVFP4 deberían mejorar el rendimiento, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. El modelo base Ornith-1.5-9B y su variante cuantizada NVFP4 (ornith-ai/Ornith-1.5-9B-NVFP4) son los referentes directos, pero no se han publicado métricas comparativas. Tampoco se conocen alternativas de la misma categoría (modelos multimodales abliterados cuantizados en NVFP4) en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other" no especificada: no se indica si el modelo permite uso comercial, modificación o redistribución. Antes de usar en producción, es imprescindible contactar con el autor o revisar los términos del modelo base.
- Riesgo de alucinacion: al ser una variante abliterada, la eliminación de capas de rechazo puede aumentar la probabilidad de generar contenido falso, ofensivo o no verificado.
- Calidad de la cuantizacion: la cuantización NVFP4A16 puede degradar la precisión en tareas que requieren alta fidelidad numérica, aunque se han excluido capas críticas.
- Contexto limitado: no se ha confirmado la longitud máxima de contexto. El valor de 32768 en el comando de ejemplo es una configuración de vLLM, no necesariamente el límite del modelo.
- Dependencia de hardware específico: el formato NVFP4A16 requiere GPUs Blackwell (sm_120) para un rendimiento óptimo; en GPUs más antiguas puede no ser compatible o ser muy lento.
- Sin garantias de soporte: al ser un modelo con 0 descargas y 0 likes, no hay evidencia de pruebas exhaustivas ni mantenimiento por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/r3lax/Ornith-1.5-9B-heretic-NVFP4A16
- Modelo base (referencia): https://huggingface.co/ornith-ai/Ornith-1.5-9B (no verificado directamente, segun la model card)
- Documentacion de vLLM para compressed-tensors y NVFP4: no disponible en la informacion proporcionada.
