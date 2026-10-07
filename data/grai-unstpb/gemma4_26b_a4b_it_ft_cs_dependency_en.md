# GRAI-UNSTPB/gemma4_26b_a4b_it_ft_cs_dependency_en

## Resumen

GRAI-UNSTPB/gemma4_26b_a4b_it_ft_cs_dependency_en es un adaptador LoRA (PEFT) entrenado mediante supervisión (SFT) sobre el modelo base unsloth/gemma-4-26B-A4B-it. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que deben cargarse junto al modelo base para reproducir su comportamiento. Lo publica el usuario u organización GRAI-UNSTPB y el repositorio pesa 2,0 GB, coherente con un adaptador de bajo rango más ficheros auxiliares.

Por la nomenclatura del identificador, el ajuste parece orientado a tareas de dependencias en inglés ("cs_dependency_en"), aunque la model card no documenta el objetivo, el dataset ni la tarea concreta, por lo que esta interpretación no puede confirmarse. El modelo base, según su nombre, sería una variante MoE de 26B de parámetros totales con aproximadamente 4B activos y ajuste de instrucciones ("it"), construida por Google sobre la familia Gemma. Todos los detalles de arquitectura, contexto y entrenamiento que no figuren en el repositorio deben consultarse en la ficha del modelo base.

La relevancia de esta publicación es limitada tal como está: cuenta con 0 descargas y 0 "likes" en el momento de la consulta, la licencia no está declarada y la model card es una plantilla sin rellenar. Resulta útil únicamente como ejemplo de flujo de ajuste con Unsloth + TRL + PEFT sobre un modelo MoE grande, no como artefacto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base transformer con arquitectura MoE, segun la nomenclatura del base; no confirmado en la model card |
| Parametros totales | No disponible para el adaptador; el modelo base se identifica como 26B (26.000 millones) segun su nomenclatura |
| Parametros activos | No disponible para el adaptador; el modelo base se identifica como A4B (aprox. 4.000 millones activos) segun su nomenclatura |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El adaptador se distribuye en precision completa del entrenamiento (previsiblemente fp16/bf16); la cuantizacion se aplica al fusionar con el base (GGUF, AWQ, GPTQ, bitsandbytes, entre otras); no documentado |
| Idiomas soportados | No disponibles (el identificador sugiere "en", ingles, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo con pesos completos. Se ha entrenado con la libreria PEFT (version 0.21.2 mencionada en el README) y, por las etiquetas del repositorio, con el stack Unsloth + TRL sobre el modelo unsloth/gemma-4-26B-A4B-it. La tecnica declarada es SFT (supervised fine-tuning). No se especifica el rango del adaptador, los modulos objetivo, hiperparametros de entrenamiento, regimen de precision ni el numero de pasos.

El modelo base pertenece a la familia Gemma en su cuarta generacion, con una configuracion de mezcla de expertos (MoE) de 26B totales y unos 4B activos por token, segun se deduce del identificador "26B-A4B". No hay en el repositorio informacion sobre el dataset de ajuste, su composicion, el numero de tokens vistos, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas concretas. Tampoco se documenta el preprocesado ni el formato de las conversaciones usado en el SFT. Toda la informacion adicional debe obtenerse del modelo base y del dataset de entrenamiento, que no se enlazan.

## Capacidades

- Generación de texto y uso conversacional: la etiqueta `conversational` y el sufijo `it` del base indican soporte de diálogo, heredado del modelo base y presumiblemente reforzado o especializado por el SFT.
- Tarea específica de "dependencias": el identificador sugiere un ajuste orientado a tareas de dependencias (posiblemente análisis de dependencias sintácticas o dependencias en código), no documentado ni confirmado.
- Razonamiento y código: presumiblemente heredados del modelo base Gemma, sin datos específicos en el repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el identificador apunta a inglés, sin confirmar.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles.

## Casos de uso

- Investigación en ajuste eficiente: el adaptador sirve como caso práctico de SFT con LoRA y Unsloth sobre un modelo MoE de gran tamaño, útil para replicar el flujo o estudiar el coste de entrenamiento de adaptadores frente al ajuste completo.
- Reproducción y comparación de experimentos: al ser un delta de pesos de 2,0 GB, permite cargar y descargar el ajuste sobre el base sin duplicar los pesos completos, útil en entornos con almacenamiento limitado.
- Tareas de análisis de dependencias en inglés: si se confirma la orientación del ajuste, podría usarse para procesamiento lingüístico (por ejemplo, extracción de relaciones de dependencia), aunque no hay validación ni documentación que lo respalde.
- Fine-tuning incremental sobre un adaptador existente: el delta puede servir como punto de partida para ajustes posteriores o para fusiones (LoRA merging) en experimentación.
- Docencia y formación: ejemplo didáctico de publicación de adaptadores PEFT y de estructura de repositorio en HuggingFace.
- Evaluación de degradación o sobreajuste: útil para estudiar cómo un SFT ligero sobre un modelo instructivo grande afecta a tareas generales, siempre que se documente el dataset, lo cual aquí falta.
- No se recomienda su uso directo en producción: la ausencia de licencia, de evaluación y de documentación impide justificar un despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 2,0 GB y no requiere GPU por separado; el coste real depende del modelo base.
- VRAM estimada para el modelo base (26B totales, aprox. 4B activos), estimaciones orientativas no confirmadas por el autor:
  - bf16 (pesos completos): en torno a 52 GB solo de pesos, más caché KV.
  - int8 / fp8: en torno a 26 GB de pesos.
  - 4 bits (NF4, GPTQ, AWQ): en torno a 13-15 GB de pesos.
- GPU recomendadas: A100 80 GB o H100 para precisión completa; RTX 4090 (24 GB), L40S o A6000 para cuantización de 4 bits.
- Uso en GPU de consumo: con cuantización de 4 bits se puede intentar en RTX 4090 o RTX 3090 (24 GB); en 16 GB (RTX 4080/4070 Ti Super) queda muy justo y suele requerir offload.
- Opciones de despliegue: vLLM o TGI para servidor con el modelo fusionado; llama.cpp u Ollama para GGUF; transformers + PEFT para cargar el adaptador sobre el base. No hay instrucciones proporcionadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRAI-UNSTPB/gemma4_26b_a4b_it_ft_cs_dependency_en | Adaptador LoRA sobre base 26B (A4B) | No disponible | No disponible | No disponible | HuggingFace, PEFT |
| unsloth/gemma-4-26B-A4B-it (base) | 26B totales, aprox. 4B activos | No disponible | No disponible | No disponible | HuggingFace |
| Qwen3-30B-A3B (MoE comparable por tamano) | 30B totales, aprox. 3B activos | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos suficientes para una comparativa cuantitativa fiable. La tabla anterior se limita a situar el artefacto frente a alternativas de tamaño similar, sin cifras de rendimiento verificables.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no especifica autoría real, tipo de modelo, idiomas, licencia ni fuentes.
- No se declara licencia, por lo que no puede asumirse ningún permiso de uso comercial o redistribución.
- No hay datos de evaluación, benchmarks ni validación de la tarea objetivo.
- Al ser un adaptador, requiere cargar el modelo base; el comportamiento final depende por completo de este.
- Riesgo de alucinación y sesgos heredado del modelo base, no evaluado ni mitigado de forma documentada.
- El identificador sugiere un ajuste en inglés y orientado a dependencias, pero es una inferencia no confirmada; puede no generalizar a otros idiomas o dominios.
- Posible sobreajuste o degradación de capacidades generales tras el SFT, sin datos que lo confirmen o desmienten.
- Con 0 descargas y 0 "likes", no hay evidencia de uso ni de revisión por parte de la comunidad.
- No recomendado para producción sin licencia, evaluación y documentación completas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GRAI-UNSTPB/gemma4_26b_a4b_it_ft_cs_dependency_en
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Paper citado en las etiquetas (calculadora de impacto de carbono, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Herramienta asociada al paper: https://mlco2.github.io/impact
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
