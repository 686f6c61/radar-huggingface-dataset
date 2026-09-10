# kaonai/grpo-kaon3-cr5a-calibrated-min-n18-b004-step125

## Resumen

El modelo `kaonai/grpo-kaon3-cr5a-calibrated-min-n18-b004-step125` es un checkpoint de lenguaje multimodal (imagen y texto) desarrollado por kaonai a partir del modelo base `kaonai/kaon-c-gemma4-26b-v10.1`. Se trata de una fusión completa de pesos en bfloat16, no un adaptador, con 25.806 millones de parámetros (25,8B). El checkpoint es el resultado de un entrenamiento con GRPO (Group Relative Policy Optimization) en el paso 125, utilizando una agregación de recompensas denominada "mínimo calibrado" sobre márgenes R/S/W, con muestreo N18 y un consenso estricto de signos de tres vías.

La etiqueta `image-text-to-text` indica que el modelo es multimodal y puede procesar entradas visuales junto con texto. Su relevancia radica en que publica un enfoque experimental de alineación por recompensa de consenso sobre una base Gemma 4 de 26B. El propio autor lo marca como "suggested unevaluated checkpoint", es decir, no ha sido evaluado y la publicación no constituye una autorización de promoción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformador multimodal (image-text-to-text) basado en Gemma 4 26B |
| Parámetros totales | 25.805.933.872 (25,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo está construido sobre `kaonai/kaon-c-gemma4-26b-v10.1`, una variante de Gemma 4 de 26B parámetros con soporte multimodal. Este checkpoint no es un adaptador PEFT, sino una fusión completa de pesos en bfloat16 que integra los ajustes derivados del entrenamiento. El proceso emplea GRPO con tasa de aprendizaje 1e-4, beta 0.04 y semilla 42. La función de recompensa agrega un "mínimo calibrado" de márgenes calibrados (R/S/W) y el muestreo se realiza con N18, seleccionando bottom3 y top3, con un consenso estricto de signos de tres vías.

No se proporcionan datos sobre la composición del dataset, el número de tokens procesados ni si se aplicaron etapas adicionales como RLHF o DPO. El repositorio incluye ficheros `MERGE_AUDIT.json` y `MANIFEST.sha256` para verificación de identidad e integridad, y el merge reporta paridad de logits representativos en bfloat16 (PASS).

## Capacidades

Basándonos en las etiquetas y la información disponible, sin benchmarks que confirmen el rendimiento real:

- Generación de texto conversacional en un pipeline `text-generation`.
- Comprensión y generación de contenido multimodal: procesa entradas de imagen y texto (`image-text-to-text`).
- Potencial razonamiento visual y descripción de imágenes, al tratarse de un modelo Gemma 4 de 26B.
- Capacidad de mantener conversaciones multi-turno (etiqueta `conversational`).
- No se han publicado especificaciones de soporte de tool calling, funciones de agente, razonamiento multi-paso explícito ni modo "thinking".
- No se ha confirmado el soporte multilingüe ni los idiomas concretos.

## Casos de uso

Aunque el modelo no ha sido evaluado públicamente, sus características técnicas (multimodal, 25,8B, entrenamiento GRPO) sugieren aplicaciones en dominios de visión y lenguaje. Los siguientes casos son hipótesis razonables, no afirmaciones verificadas:

- Análisis de documentos escaneados: el modelo puede transcribir, resumir o extraer información de imágenes de documentos, facturas o contratos.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo para imágenes en aplicaciones web o móviles.
- Asistencia conversacional multimodal: chatbots que aceptan fotos enviadas por el usuario y responden preguntas sobre su contenido.
- Moderación de contenido visual: clasificación o descripción de imágenes para detectar contenido inapropiado.
- Apoyo en diagnóstico visual básico: descripción de características en imágenes médicas o de materiales, siempre con supervisión humana.
- Generación de subtítulos para vídeo o fotogramas: producción de descripciones textuales para contenido multimedia.
- Razonamiento en tareas de texto e imagen para entornos de investigación, como análisis de gráficos o diagramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que el checkpoint está "unevaluated" y que la publicación no es autorización de promoción, por lo que no existen métricas de MMLU, HumanEval, GSM8K u otros referentes para este modelo concreto.

## Requisitos de hardware

Los requisitos se estiman a partir del tamaño de los pesos en bfloat16 y no incluyen optimizaciones específicas:

- VRAM estimada: al menos 52 GB para cargar los pesos en bfloat16 (51,6 GB de pesos) más espacio para caché y activaciones. En la práctica se necesitan GPUs de 80 GB o varias de 40 GB.
- GPU recomendadas: NVIDIA A100 80 GB o H100 80 GB para inferencia en un solo dispositivo sin cuantización.
- En GPU de consumo: una RTX 4090 (24 GB) no puede cargar el modelo en bfloat16 de forma directa; sería necesaria una cuantización agresiva que no se ha especificado en el repositorio.
- Opciones de despliegue: compatible con la librería `transformers` de HuggingFace (pipeline `text-generation`) al ser un repositorio de safetensors. La compatibilidad con vLLM, llama.cpp o TGI no se ha confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de benchmarks ni de especificaciones publicadas que permitan comparar este checkpoint con otros modelos de la misma categoría (multimodales de 26B). Los modelos comparables de Google (Gemma 4 26B) no tienen datos públicos específicos en la información proporcionada, y este checkpoint es una variante experimental con recompensas personalizadas.

## Limitaciones y advertencias

- Estado no evaluado: el autor lo califica como "suggested unevaluated checkpoint", por lo que no hay garantías de calidad, seguridad o rendimiento.
- Licencia no especificada: el repositorio no indica la licencia, lo que impide confirmar si se puede usar en aplicaciones comerciales.
- Riesgo de alucinación: al no existir evaluación, no se puede determinar la fiabilidad de las respuestas generadas.
- Sin datos de sesgos: no se ha publicado información sobre sesgos sociodemográficos, culturales o lingüísticos.
- Soporte de idiomas limitado: los idiomas no están especificados, lo que limita su uso en contextos multilingües.
- Restricciones para producción: no es aconsejable desplegar el checkpoint en entornos productivos sin una validación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaonai/grpo-kaon3-cr5a-calibrated-min-n18-b004-step125
- Modelo base: https://huggingface.co/kaonai/kaon-c-gemma4-26b-v10.1
