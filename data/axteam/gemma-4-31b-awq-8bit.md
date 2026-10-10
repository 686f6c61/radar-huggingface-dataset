# axteam/gemma-4-31B-AWQ-8bit

## Resumen

`axteam/gemma-4-31B-AWQ-8bit` es una cuantización de 8 bits del modelo multimodal `google/gemma-4-31B`, publicada por el equipo axteam el 10 de octubre de 2026. Se trata de un derivado de solo pesos, no de un modelo entrenado desde cero: el tokenizador, el `chat_template`, el `processor_config` y el `generation_config` son idénticos byte a byte a los del original, y `config.json` es el original más un bloque `quantization_config`. Su propósito es servir el modelo base con un coste de memoria notablemente menor en vLLM, manteniendo la fidelidad respecto a la versión BF16.

La cuantización emplea AWQ INT8 en esquema W8A16 (pesos INT8 simétricos con tamaño de grupo 32, activaciones en BF16) y se almacena en formato `compressed-tensors` con empaquetado `pack-quantized`. El repositorio ocupa 35,1 GB y el autor declara un tamaño en disco de aproximadamente 32,7 GB para los pesos. Se mantienen en BF16 la torre de visión, la proyección de visión, los embeddings de tokens (atados al `lm_head`), el router MoE y todas las normalizaciones, por ser una fracción pequeña del total de parámetros.

Hay una discrepancia relevante que el comprador debe conocer: el identificador del repositorio y la model card hablan de "31B", pero los safetensors reales suman 10.223.251.812 parámetros (unos 10,2 mil millones). Además, la model card describe la arquitectura como "Gemma 4 · Dense" y a la vez menciona un "MoE router" entre los componentes preservados en BF16, dos afirmaciones incompatibles entre sí. No hay datos de benchmarks públicos asociados a este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4; la model card indica "Dense", pero también menciona un router MoE (contradicción no resuelta) |
| Parametros totales | 10.223.251.812 según safetensors del repositorio (el nombre del repo indica 31B; discrepancia no aclarada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simétricos, grupo 32, activaciones BF16), formato compressed-tensors `pack-quantized`; componentes en BF16: torre de visión, proyección de visión, embeddings de tokens (atados al lm_head), router MoE y normalizaciones |
| Idiomas soportados | no disponible; la model card menciona un conjunto interno de evaluación mixto inglés/coreano y calibración con 256 muestras de predominio coreano |
| Licencia | etiqueta apache-2.0, con enlace a la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

No hay entrenamiento propio: este repositorio es una cuantización post-entrenamiento (PTQ) del checkpoint `google/gemma-4-31B` en el commit `5bbc2fb`. El pipeline declarado es `image-text-to-text`, lo que confirma que el modelo base es multimodal (entrada de imagen y texto), y de ahí que la receta de cuantización preserve explícitamente en BF16 la torre de visión y la proyección de visión, además de los embeddings, el router y las normas. La decisión de dejar esos componentes sin cuantizar responde a que representan una fracción pequeña del total de parámetros y son sensibles a la pérdida de precisión.

La calibración de AWQ se realizó con 256 muestras de un conjunto de predominio coreano; en la variante `-it` se incluyen además 32 respuestas generadas por el propio modelo en modo thinking. El autor indica que la fidelidad se verificó comparando perplejidad y coincidencia top-1 del siguiente token frente al original BF16 sobre un conjunto interno mixto inglés/coreano, y afirma que las variantes de 8 bits (AWQ INT8 y FP8) son las que se mantienen más cerca del original, mientras que las de 4 bits (AWQ INT4 y NVFP4) reducen el peso a la mitad a cambio de algo de calidad. No se publican cifras concretas de esa comparación.

## Capacidades

- Generación de texto y razonamiento paso a paso: se activa el modo thinking añadiendo el token `<|think|>` al inicio del system prompt.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), al conservar sin cuantizar la torre de visión y la proyección de visión.
- Capacidad multimodal heredada del modelo base; el alcance exacto (resolución de imagen, número de imágenes por prompt, OCR, etc.) no está documentado en la información disponible.
- Servido optimizado en vLLM, con integración directa mediante `vllm serve axteam/gemma-4-31B-AWQ-8bit` y uso programático a través de `LLM.chat`.
- Compatibilidad con `transformers` y con endpoints (`endpoints_compatible`).
- Soporte de tool calling, function calling, agentes o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Cobertura multilingüe: no disponible; solo se documenta material de evaluación y calibración en inglés y coreano.

## Casos de uso

- Servicio de inferencia multimodal en producción con vLLM: al estar publicada específicamente como variante de servicio, se puede desplegar con `vllm serve` sobre GPUs de 48-80 GB y atender peticiones de imagen más texto con un consumo de memoria de pesos de aproximadamente 33 GB.
- Sustitución directa del modelo base BF16 en un despliegue existente: al conservar tokenizador, `chat_template`, `processor_config` y `generation_config` idénticos, el reemplazo del checkpoint no requiere cambios en el preprocesado ni en el formato de los prompts.
- Análisis de documentos con componente visual: al mantener la torre de visión en BF16, puede emplearse para tareas de descripción de imágenes o extracción de información de capturas y diagramas, siempre que se valide el comportamiento concreto porque no hay benchmarks publicados.
- Razonamiento asistido con modo thinking: para tareas de varios pasos donde se quiera trazabilidad del razonamiento, activando `<|think|>` en el system prompt, con la advertencia de que el coste en tokens de salida aumenta.
- Evaluación comparativa de recetas de cuantización: útil como punto de referencia de 8 bits frente a las variantes FP8, AWQ INT4 y NVFP4 del mismo modelo, aunque el autor no publica cifras numéricas de la comparación.
- Despliegue con restricciones de memoria frente al BF16: si el original en BF16 no cabe en la GPU disponible, esta variante INT8 reduce el peso de los pesos a unos 32,7 GB declarados, a cambio de una pérdida de calidad no cuantificada públicamente.
- Prototipado e investigación en entornos con `transformers`, cargando el repositorio como cualquier modelo cuantizado con compressed-tensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe la metodología de verificación de fidelidad de la cuantización (perplejidad y coincidencia top-1 del siguiente token frente al original BF16, sobre un conjunto interno mixto inglés/coreano) y una comparación cualitativa entre variantes de 4 y 8 bits, sin cifras. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar para este repositorio.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 32,7 GB declarados por el autor (el repositorio completo ocupa 35,1 GB, incluyendo ficheros auxiliares). A eso hay que sumar la caché KV, que depende del contexto, del número de secuencias concurrentes y de la configuración de vLLM, y que no está cuantizada.
- GPU recomendadas: A100 80 GB, H100 80 GB y L40S 48 GB son opciones viables para los pesos. Una sola RTX 4090 (24 GB) o RTX 5090 (32 GB) no permiten alojar los pesos completos en memoria, salvo con estrategias de offload que degradan notablemente la latencia.
- Configuraciones multi-GPU: reparto de tensores entre 2 tarjetas consumer de 24 GB (48 GB agregados) o 2 x A6000 48 GB, siempre que se configure correctamente el paralelismo de tensor en vLLM.
- Cabe en GPU de consumo: no en una sola unidad de 24 GB; sí es posible repartirlo entre dos GPU de 24 GB o usar una GPU profesional de 48 GB o más.
- Opciones de despliegue: vLLM es el soporte documentado y explícito. La compatibilidad con llama.cpp, Ollama o TGI no está confirmada en la información disponible; el formato compressed-tensors y AWQ apuntan a vLLM y a `transformers` como vías principales.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La información disponible solo permite comparar con las variantes del mismo modelo base mencionadas en la model card. Los datos de parámetros, contexto y rendimiento de las alternativas no se detallan.

| Modelo | Cuantizacion | Peso aproximado | Fidelidad declarada | Licencia |
|---|---|---|---|---|
| axteam/gemma-4-31B-AWQ-8bit | AWQ INT8 W8A16, grupo 32 | ~32,7 GB | Más cercana al original junto con FP8, sin cifras publicadas | apache-2.0 con enlace a licencia Gemma 4 |
| Variante FP8 del mismo modelo | FP8 | no disponible | El autor la sitúa al mismo nivel que AWQ INT8, sin cifras | no disponible |
| Variante AWQ INT4 del mismo modelo | AWQ INT4 | aproximadamente la mitad que la de 8 bits | Menor que las de 8 bits, según el autor | no disponible |
| Variante NVFP4 del mismo modelo | NVFP4 | aproximadamente la mitad que la de 8 bits | Menor que las de 8 bits, según el autor | no disponible |
| google/gemma-4-31B (original) | BF16 | no disponible | Referencia de comparación | licencia Gemma 4 |

Comparación con modelos de otras familias de tamaño similar: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de tamaño sin resolver: el repositorio se anuncia como 31B, pero los safetensors suman 10,2 mil millones de parámetros. Verifica el checkpoint antes de dimensionar la infraestructura.
- Contradicción en la arquitectura: la model card indica "Dense" y a la vez menciona un router MoE preservado en BF16. Es necesario consultar la configuración real del modelo base para saber si hay capas MoE y cuántos parámetros activos tiene.
- Licencia: aunque la etiqueta del repositorio es `apache-2.0`, el enlace de licencia apunta a la licencia de Gemma 4 de Google. El propio autor declara que es un derivado cuantizado de Gemma 4 y que su uso se rige por dicha licencia. Revisa los términos de Google antes de cualquier uso comercial, ya que la etiqueta apache-2.0 por sí sola no es concluyente.
- Pérdida de precisión no cuantificada: no se publican cifras de perplejidad ni de coincidencia top-1 frente al BF16, así que el impacto real de la cuantización en tareas concretas no puede evaluarse a priori.
- Sesgo de calibración: las 256 muestras de calibración son de predominio coreano, y 32 de ellas son respuestas autogeneradas por el modelo en modo thinking. Esto puede sesgar el comportamiento hacia ese dominio e idioma.
- Idiomas soportados no documentados: no hay lista oficial de idiomas ni evaluación multilingüe en la información disponible.
- Longitud de contexto no documentada: impide planificar despliegues con caché KV larga y estimar la VRAM total necesaria.
- Riesgo de alucinación: no evaluado en la información disponible; aplica las precauciones habituales en modelos generativos, especialmente en extracción de información de imágenes.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validación por parte de terceros.
- Resultados de búsqueda web no relevantes: las consultas realizadas no devolvieron enlaces útiles sobre este modelo, por lo que no hay validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-31B-AWQ-8bit
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper, blog o repositorio del autor: no disponible
- Demos o espacio de prueba: no disponible
- Enlaces relevantes de la búsqueda web: no se encontró ninguno relacionado con este modelo
