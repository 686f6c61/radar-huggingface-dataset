# alwaysgood/Gemma4_E2B_ADS

## Resumen

Gemma4_E2B_ADS es un fine-tuning completo del modelo `google/gemma-4-E2B-it` de Google DeepMind, especializado en traducción financiera de inglés a coreano. Desarrollado por el usuario alwaysgood, este modelo parte de la familia Gemma 4 y se ha ajustado con un corpus financiero propio para mejorar la precisión terminológica y la fluidez en dominios económicos y bursátiles. El checkpoint resultante tiene 5.123 millones de parámetros y se distribuye tanto en formato Transformers (BF16) como en GGUF cuantizado (Q4_K_M), lo que permite su ejecución en entornos locales con recursos limitados.

El modelo se entrenó mediante supervisión completa (full-parameter SFT) utilizando un currículo de selección de baja calidad estimada (DQS low-QE) con semilla 42. Las capas multimodales (visión y audio) del modelo base se preservaron sin entrenar, por lo que conserva capacidades de entrada de imagen aunque su uso principal es la traducción de texto. La evaluación sobre un conjunto de prueba retenido de 500 filas muestra resultados sólidos en métricas de traducción automática (BLEU 30,76, COMET 0,8968), lo que lo convierte en una opción interesante para aplicaciones de traducción financiera profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B instruct) |
| Parametros totales | 5.123.178.051 (~5,12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el base Gemma 4 E2B tiene 8K según fuentes, no confirmado para este fine-tune) |
| Tipos de cuantizacion | BF16 (safetensors), Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `google/gemma-4-E2B-it`, un modelo de la familia Gemma 4 con arquitectura transformer multimodal (image-text-to-text). El proceso de ajuste utilizó full-parameter supervised fine-tuning (SFT) con un currículo de selección de baja calidad estimada (DQS low-QE) y semilla 42. Durante el entrenamiento se desactivó el modo de pensamiento (thinking) del modelo base. Las capas de visión y audio no se entrenaron; se preservaron los componentes multimodales originales, lo que significa que el modelo mantiene la capacidad de procesar imágenes (aunque no ha sido optimizado para ello en este ajuste).

El corpus de entrenamiento proviene de `alwaysgood/financial-english-source-corpus` y su versión procesada `alwaysgood/financial-english-source-corpus-gemma4-e2b-1280`, que agrega fuentes con términos de licencia mixtos. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. El checkpoint final se exportó a GGUF con cuantización Q4_K_M para su uso en llama.cpp y LM Studio, acompañado de un archivo `mmproj` BF16 para compatibilidad multimodal.

## Capacidades

- Traducción especializada de textos financieros del inglés al coreano, con alta precisión terminológica en dominios económicos.
- Generación de texto conversacional, aunque su uso principal es la traducción.
- Entrada de imagen (image-text-to-text) gracias a las capas multimodales preservadas del modelo base, aunque no ha sido específicamente entrenado para tareas de visión.
- Compatibilidad con llama.cpp y LM Studio mediante el formato GGUF (Q4_K_M), lo que permite ejecución local en CPU o GPU con pocos recursos.
- Soporte para desactivar el modo de pensamiento (thinking) y generar solo la traducción, lo que reduce latencia y coste computacional.
- No se documenta soporte explícito para tool calling, function calling ni razonamiento multi-paso agéntico.

## Casos de uso

- Traducción de informes financieros anuales: el modelo puede traducir memorias anuales, balances y cuentas de resultados del inglés al coreano, manteniendo la coherencia terminológica gracias a su fine-tuning específico.
- Localización de noticias de mercados: adecuado para traducir artículos de Bloomberg, Reuters o comunicados de prensa bursátil en tiempo real, con un contexto financiero que reduce errores de interpretación.
- Atención al cliente bilingüe en entidades bancarias: integrable en sistemas de chat para responder consultas de clientes coreanos sobre productos financieros en inglés, generando respuestas traducidas con tono profesional.
- Análisis de documentos legales y regulatorios: útil para traducir contratos, prospectos y normativas financieras donde la precisión es crítica y el modelo ha sido entrenado con corpus especializados.
- Generación de resúmenes financieros bilingües: puede resumir y traducir simultáneamente informes de análisis de inversión, facilitando la toma de decisiones en equipos multilingües.
- Despliegue en entornos con recursos limitados: gracias a la cuantización Q4_K_M, puede ejecutarse en portátiles o edge devices para traducción offline de documentos financieros, sin depender de APIs externas.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre un conjunto de prueba retenido de 500 filas, evaluados con el checkpoint BF16 original (no con la versión Q4_K_M):

| Metrica | Valor |
|---|---|
| BLEU | 30,7621 |
| chrF | 49,3295 |
| COMET (`wmt22-comet-da`) | 0,8968 |
| COMETKiwi (`wmt22-cometkiwi-da`) | 0,8630 |
| XCOMET-XXL | 0,8746 |
| MetricX-24 Hybrid XXL (menor es mejor) | 3,4078 |

No se han publicado comparativas con otros modelos de traducción financiera en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 (~5,12B parámetros) requiere aproximadamente 10-11 GB de VRAM (2 bytes por parámetro). La versión Q4_K_M reduce el peso a ~2,6 GB, más overhead de contexto y capas, por lo que cabe en GPUs con 4-6 GB.
- GPU recomendadas: para BF16, una RTX 3090, RTX 4090 o A100 son adecuadas. Para Q4_K_M, cualquier GPU con 6 GB o más (RTX 3060, RTX 4060, incluso iGPU con suficiente memoria compartida) puede ejecutar el modelo.
- Opciones de despliegue: transformers (Python), vLLM (si es compatible), llama.cpp, LM Studio, Ollama (si se añade manualmente). El formato GGUF permite integración directa en aplicaciones basadas en llama.cpp.
- Latencia y throughput: no disponibles en la documentacion. Se espera que la versión Q4_K_M ofrezca una velocidad de decodificación de 20-40 tokens/s en una RTX 4060, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables (traducción financiera inglés-coreano con ~5B parámetros). Como referencia, el modelo base `google/gemma-4-E2B-it` sin fine-tuning tendría un rendimiento inferior en terminología financiera, pero no se han publicado métricas comparativas. Alternativas generales de traducción como NLLB-200 o M2M100 no están especializadas en dominios financieros y tienen licencias diferentes (CC-BY-NC para NLLB). Se recomienda evaluar el modelo frente a estas alternativas en el caso de uso concreto antes de adoptarlo.

## Limitaciones y advertencias

- Sesgos de dominio: el modelo está entrenado exclusivamente con corpus financiero, por lo que su rendimiento en otros dominios (médico, legal no financiero, técnico) será significativamente inferior.
- Riesgo de alucinación: como todo modelo generativo, puede producir traducciones incorrectas o inventar términos si el texto fuente es ambiguo o contiene jerga muy especializada.
- Limitación idiomática: solo soporta inglés y coreano; no se debe usar para otros pares de idiomas.
- Restricciones de licencia del corpus: aunque los pesos del modelo tienen licencia Apache-2.0, el dataset de entrenamiento tiene términos de licencia mixtos (`license: other`). Los usuarios deben revisar las condiciones de `alwaysgood/financial-english-source-corpus` antes de usar el modelo en producción comercial.
- Soporte de audio no garantizado: la model card indica que el soporte de audio de Gemma 4 puede variar según el runtime y no está garantizado para este checkpoint.
- Modo de pensamiento: se recomienda desactivar el thinking durante la traducción para obtener salidas limpias; si no se desactiva, el modelo podría generar razonamientos intermedios no deseados.
- Sin evaluación de la versión cuantizada: los benchmarks corresponden al checkpoint BF16; la versión Q4_K_M puede mostrar una degradación leve en calidad no cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alwaysgood/Gemma4_E2B_ADS
- Dataset de entrenamiento: https://huggingface.co/datasets/alwaysgood/financial-english-source-corpus
- Dataset procesado: https://huggingface.co/datasets/alwaysgood/financial-english-source-corpus-gemma4-e2b-1280
- Artefactos del run DQS: https://huggingface.co/datasets/alwaysgood/dqs-runs/tree/fa8166a883d96460cc285b46d66b74a074b4b8d4/gemma4_e2b_it_full_lowqe_seed42
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Página de Gemma 4 de DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guía de Gemma 4 en Comet: https://www.cometapi.com/google-releases-gemma-4-open-source-model/
