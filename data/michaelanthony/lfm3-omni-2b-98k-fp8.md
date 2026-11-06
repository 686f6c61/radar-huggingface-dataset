# MichaelAnthony/LFM3-Omni-2B-98K-FP8

## Resumen

LFM3-Omni-2B-98K-FP8 es un ajuste fino de contexto largo de LFM3-Omni-2B, el modelo multimodal de Liquid AI, publicado por el usuario MichaelAnthony en Hugging Face. El autor ha aplicado un SFT con LoRA (r=32, alfa=64) sobre datos sintéticos de contexto largo de entre 65k y 98k tokens, y ha fusionado el adaptador en un único checkpoint, ampliando la ventana de contexto verificada hasta aproximadamente 98k tokens. Además, el checkpoint se distribuye en formato FP8 (w8a8, compressed-tensors), lo que reduce el peso del repositorio a 3,3 GB.

El modelo parte de la arquitectura LFM3 Omni de Liquid AI, un transformer multimodal de 2.166.928.384 parámetros que procesa texto, audio y visión. El ajuste modifica la configuración de atención: convierte las 5 capas de atención deslizante (sliding_attention) en capas de atención completa (full_attention) con theta 1e6, rotary parcial 0.5 y sin ventana. Esta modificación es relevante porque afecta al comportamiento del modelo en contextos largos y condiciona la forma en que debe cargarse en llama.cpp.

La relevancia del modelo radica en que combina tres características poco habituales en un modelo de 2B: multimodalidad nativa (texto, audio, imagen), contexto efectivo cercano a 94k-98k tokens y cuantización FP8 lista para vLLM. Es un artefacto de la comunidad, con solo 20 descargas y sin métricas de benchmarks publicadas, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LFM3 Omni (liquidai/lfm3_omni), con capas de atención completa tras el fine-tune |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | ~98k tokens (entrenado de forma efectiva hasta ~94k; recuperación verificada hasta 109k en needle-in-haystack) |
| Tipos de cuantizacion | FP8 (w8a8, compressed-tensors); el autor publica también GGUFs con varias cuantizaciones (Q6_K entre ellas) |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License, heredada del modelo base LiquidAI/LFM3-Omni-2B) |
| Formato de pesos | safetensors (FP8, compressed-tensors); GGUF disponible por separado |

## Arquitectura y entrenamiento

El modelo base es LFM3-Omni-2B de Liquid AI, un transformer multimodal con 2.166.928.384 parámetros que integra procesamiento de texto, audio y visión. El fine-tune comunitario convierte las 5 capas de atención deslizante del modelo original en capas de atención completa durante el entrenamiento, con theta 1e6, rotary parcial de 0.5 y sin ventana deslizante. Los checkpoints de Hugging Face incluyen ya el campo `layer_types` correcto. Para los GGUFs, dado que llama.cpp exige al menos una capa con ventana deslizante, el autor emula el comportamiento de atención completa etiquetando las antiguas capas deslizantes como SWA con `sliding_window=131072`, `freq_base_swa=1e6` y `n_rot_swa=64`, lo que es numéricamente idéntico a la atención completa.

El entrenamiento consistió en un SFT con LoRA (r=32, alfa=64) sobre datos sintéticos de contexto largo de entre 65k y 98k tokens, posteriormente fusionado en un único checkpoint. La longitud efectiva entrenada es de aproximadamente 94k tokens: los últimos pasos del optimizador, correspondientes a ejemplos de 94,5k-98,3k tokens, se omitieron por falta de memoria (OOM). A pesar de ello, el autor verifica la recuperación de información más allá de esa longitud. No se detalla la composición del dataset sintético, el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base LFM3-Omni-2B.
- Procesamiento multimodal: entrada de audio (verificado con el mmproj de llama.cpp y mtmd) y de imagen, según la arquitectura Omni del modelo base.
- Contexto largo: recuperación de información verificada mediante needle-in-haystack en profundidades del 10 %, 50 % y 90 %, con 15/15 aciertos entre 15k y 109k tokens en Hugging Face.
- Funcionamiento en llama.cpp: generación verificada en Vulkan sobre una RX 6750 XT a ~70-180 tok/s.
- Compatibilidad con vLLM y runtimes con soporte FP8 (w8a8, compressed-tensors).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos: el modelo puede ingerir contratos, informes técnicos o expedientes de hasta ~94k tokens en una sola pasada, lo que permite resumir o extraer cláusulas sin fragmentación ni pérdida de contexto entre secciones.
- Recuperación de información en corpus extensos: los resultados de needle-in-haystack (15/15 entre 15k y 109k tokens) lo hacen adecuado para tareas de question answering sobre bases documentales largas, como manuales de producto o normativa.
- Transcripción y análisis de audio de larga duración: gracias a la entrada de audio verificada en llama.cpp con mtmd, puede emplearse para resumir reuniones, generar actas o extraer action items de grabaciones extensas.
- Procesamiento de imágenes con contexto textual asociado: la arquitectura Omni permite combinar capturas, diagramas o documentos escaneados con instrucciones textuales largas, útil en pipelines de digitalización y extracción de datos.
- Asistente de código sobre repositorios completos: con ~94k tokens de contexto puede cargar varios ficheros fuente y documentación de un proyecto para responder preguntas de arquitectura o generar parches coherentes con el resto del código.
- Despliegue en hardware de consumo: la versión GGUF funciona en una RX 6750 XT (12 GB) a 70-180 tok/s con Vulkan, lo que permite prototipar asistentes de contexto largo en estaciones de trabajo sin GPU de datacenter.
- Servicio de inferencia con vLLM: el formato FP8 w8a8 reduce el peso a 3,3 GB y permite servir el modelo con mayor throughput en GPUs con soporte FP8, adecuado para APIs internas de análisis documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta verificaciones funcionales:

| Prueba | Resultado |
|---|---|
| Needle-in-haystack (Hugging Face, profundidades 10/50/90 %) | 15/15 aciertos, 15k-109k tokens |
| Needle-in-haystack (GGUF @ 32k, todas las cuantizaciones) | Pasa en todas |
| Needle-in-haystack (GGUF @ 64k, Q6_K) | Pasa |
| mmproj Omni (audio de entrada, llama.cpp mtmd) | Funcional |
| Generación en llama.cpp (Vulkan, RX 6750 XT) | ~70-180 tok/s |

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 2,2 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 98k la caché KV crece de forma significativa, por lo que se recomienda al menos 16-24 GB para aprovechar la ventana completa.
- En GGUF Q6_K el peso ronda los 1,7-1,8 GB, lo que permite ejecución en GPUs de consumo con 8-12 GB, aunque el contexto máximo práctico queda limitado por la VRAM restante para la caché KV.
- GPUs recomendadas: para FP8 con vLLM, GPUs con soporte FP8 nativo (H100, L40S, RTX 4090 en menor medida); para GGUF, cualquier GPU consumer con 8 GB o más.
- Cabe en GPU de consumo: sí, verificado en una RX 6750 XT (12 GB) con llama.cpp y Vulkan a ~70-180 tok/s.
- Opciones de despliegue: vLLM (FP8), llama.cpp (GGUF, con mtmd para audio), y runtimes compatibles con compressed-tensors. Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: ~70-180 tok/s en RX 6750 XT con Vulkan; no hay datos de throughput en vLLM ni en GPUs de datacenter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-98K-FP8 | 2,17B | ~98k (verificado hasta 109k) | Texto, audio, imagen | LFM Open License | Hugging Face, GGUF comunitario |
| LiquidAI/LFM3-Omni-2B (base) | 2,17B | no disponible en la información | Texto, audio, imagen | LFM Open License | Hugging Face oficial |
| Alternativas de 2B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este fine-tune con el modelo base ni con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto comunitario con solo 20 descargas y 0 likes: no ha pasado por una evaluación independiente ni por benchmarks estandarizados.
- El fine-tune se entrenó de forma efectiva hasta ~94k tokens; los pasos de 94,5k-98,3k se omitieron por OOM, por lo que el comportamiento en el extremo superior del contexto puede degradarse.
- La conversión de capas sliding_attention a full_attention altera el modelo original; los metadatos SWA de los GGUFs son intencionados y no deben "corregirse", según advierte el autor.
- El formato FP8 (w8a8, compressed-tensors) solo funciona en vLLM y runtimes con soporte FP8; no es cargable en transformers estándar sin el runtime adecuado.
- Riesgo de alucinación: no evaluado; al ser un modelo de 2B, la fiabilidad factual en tareas abiertas es limitada.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no especificados; no se garantiza un rendimiento multilingüe equilibrado.
- Licencia LFM Open License: es necesario revisar sus términos antes de un uso comercial, ya que se trata de una licencia "other" y no estándar.
- No hay información sobre tool calling, razonamiento multi-paso ni modo thinking, por lo que no debe asumirse su disponibilidad en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-FP8
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Organización Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
