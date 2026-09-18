# Hosstia/AliceAI-T5-35B-A0.6B-MLX-4bit

## Resumen

AliceAI-T5-35B-A0.6B-MLX-4bit es una conversión cuantizada del modelo de traducción `yandex/AliceAI-T5-35B-A0.6B`, publicada por el usuario Hosstia para ejecutarse en Apple Silicon mediante el framework MLX. Se trata de un transformer encoder-decoder con arquitectura Mixture-of-Experts (MoE): el modelo declara 35B parámetros totales pero solo activa aproximadamente 0,6B por token, gracias a un enrutado top-8 sobre 512 expertos. El objetivo del repositorio es hacer viable la inferencia de un modelo de 35B en memoria unificada de Mac, con pesos en 4 bits y un kernel fusionado de despacho MoE (`gather_qmm`).

El modelo está especializado en traducción chino-ruso (`zh`, `ru`) y se distribuye con código de ejecución propio: el paquete Python `aliceai_mlx`, un script `chat.py` con cinco modos de tarea (traducción, corrección, *professor*, QA y raw) y un artículo técnico sobre el proceso de conversión. La innovación principal documentada no es arquitectónica sino de implementación: el despacho fusionado elimina 224 barreras de sincronización de GPU por token en comparación con una implementación legacy basada en bucles planos, lo que se traduce en una aceleración de 3,85x en batch 1 y de hasta 11,66x en batch 8.

Su relevancia actual es doble. Por un lado, demuestra que un MoE de 35B puede servirse a velocidades interactivas (72,69 tok/s en batch 1 sobre un M4 Pro) en hardware de consumo de Apple. Por otro, es un ejemplo reproducible de cuantización selectiva: expertos y atención en affine 4-bit con group size 64, mientras que los embeddings permanecen sin cuantizar, manteniendo paridad numérica con el esquema de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con Mixture-of-Experts (MoE) tipo T5 |
| Parámetros totales | 34.354.463.744 (35B) |
| Parámetros activos | 0,6B por token |
| Longitud de contexto | No especificada explícitamente. Configuración RoPE: YaRN con posición máxima original de 9984 tokens y factor de escalado 20,0 |
| Tipos de cuantización | MLX affine 4-bit, group size 64 (expertos y atención); embeddings sin cuantizar. El autor menciona variantes 6-bit y MXFP4, no publicadas en este repositorio |
| Idiomas soportados | Chino (zh) y ruso (ru) |
| Licencia | other (términos no detallados en la información disponible) |
| Formato de pesos | safetensors en formato MLX |
| Pipeline | translation |
| Número de expertos | 512, enrutado top-8 |
| Capas del encoder | 16 |
| Capas del decoder | 12 |
| Dimensión oculta | 1536 |
| Cabezas de atención (encoder) | 12 |
| Cabezas KV (decoder) | 4 |
| Dimensión de cabeza | 128 |
| Tamaño de vocabulario | 135.040 |
| Tamaño intermedio de experto | 512 |
| Función de activación | silu |
| Embeddings compartidos / atados | Sí / sí |
| Tamaño en disco | 18,30 GB |
| Tamaño del repositorio | 19,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un T5 encoder-decoder con capas de expertos dispersos. El encoder tiene 16 capas y el decoder 12, con una dimensión oculta de 1536 y atención de 12 cabezas en el encoder frente a 4 cabezas KV en el decoder, lo que reduce el coste de caché durante la generación. Cada capa MoE contiene 512 expertos con tamaño intermedio de 512 y activación silu; el enrutador selecciona los 8 expertos principales por token, de modo que solo se computa aproximadamente un 1,7 % de los parámetros totales en cada paso. Los embeddings están atados y compartidos entre encoder y decoder, con un vocabulario de 135.040 entradas.

El modelo emplea RoPE con variante YaRN: la posición máxima original es de 9984 tokens y el factor de escalado es 20,0, lo que indica una extensión deliberada de la ventana efectiva por interpolación posicional. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa. La aportación técnica diferencial de esta ficha concreta es la cuantización y el despacho: los expertos y las capas de atención se cuantizan en affine 4-bit con group size 64, los embeddings se mantienen en precisión completa y el kernel `gather_qmm` fusiona el enrutado y la multiplicación matricial cuantizada, eliminando 224 barreras de sincronización por token respecto a la implementación legacy.

## Capacidades

- Traducción automática chino → ruso mediante `translator.translate()`, con `min_new_tokens=0` por defecto porque la salida de traducción es concisa.
- Traducción por lotes de mayor rendimiento mediante `translator.complete_batch()`, pensada para volúmenes altos de texto.
- Modo *professor*: fusiona y corrige dos traducciones candidatas (una de referencia y otra de estudiante) y devuelve un texto corregido en el campo `corrected_text`.
- Modo *correct*: tarea de corrección de texto traducido.
- Modo *qa* (preguntas y respuestas) con preguntas formuladas en ruso y parámetro `min_new_tokens=128` por defecto para evitar truncamientos por EOS prematuro.
- Modo *raw*: acceso a la generación sin postprocesado específico de tarea.
- Conversación multi-turno en el modo QA, con historial gestionado por `chat.py`.
- Limpieza de salida mediante `parse_qa_answer()`: elimina marcadores de formato, ecos del prompt, bloques de respuesta repetidos y ruido final.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas a los dos idiomas declarados en la model card: chino y ruso.

## Casos de uso

- Localización de productos chinos al ruso: traducción de fichas, descripciones y textos de interfaz con el modo `translate`, con salida concisa adecuada para cadenas cortas y textos de marketing.
- Traducción por lotes de documentación técnica: `complete_batch()` alcanza 220,22 tok/s en batch 8 sobre un M4 Pro, lo que permite procesar corpus medianos en un Mac sin GPU dedicada.
- Post-edición automática de traducciones: el modo *professor* toma una traducción de referencia y otra de menor calidad y devuelve una versión corregida, útil como etapa de control de calidad en pipelines de MT.
- Subtitulado y transcripción traducida: segmentando el texto de origen para evitar el truncamiento documentado en entradas largas en variantes cuantizadas.
- Asistente de preguntas y respuestas en ruso sobre dominio: con `min_new_tokens=128` para evitar respuestas cortadas, aunque la calidad de QA en un modelo de traducción es secundaria frente a su tarea principal.
- Aplicación de escritorio offline en macOS: el paquete `aliceai_mlx` y `chat.py` permiten empaquetar un traductor chino-ruso que no envía datos a servicios externos, con 19,11 GB de memoria pico.
- Investigación en eficiencia de MoE cuantizados: la comparativa contra la implementación legacy de bucles planos sirve como caso de estudio reproducible sobre el impacto de las barreras de sincronización de GPU en modelos con 512 expertos.
- Evaluación de estrategias de cuantización: comparar las variantes 4-bit, 6-bit y MXFP4 permite estudiar el compromiso entre calidad y degeneración por repetición en modelos MoE.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son medidas de rendimiento de inferencia, no de calidad (no hay MMLU, HumanEval, GSM8K ni BLEU). Se obtuvieron en un Apple M4 Pro con 48 GB de memoria unificada y MLX 0.32.0.

| Métrica | Este variant (4-bit) | Baseline legacy |
|---|---|---|
| Throughput (batch 1) | 72,69 tok/s | 18,89 tok/s |
| Throughput (batch 8) | 220,22 tok/s | no disponible |
| Throughput mediano (batch 1) | 71,91 tok/s | 18,56 tok/s |
| Throughput mediano (batch 8) | 222,01 tok/s | no disponible |
| Utilización de GPU (batch 1) | 76,2 % | 51,2 % |
| Utilización de GPU (batch 8) | 91,1 % | no disponible |
| Utilización de GPU pico | 100 % | 84 % |
| Tamaño en disco | 18,30 GB | 18,30 GB |
| Memoria pico | 19,11 GB | 19,87 GB |
| Aceleración frente a legacy (batch 1) | 3,85x | 1,0x |
| Aceleración frente a legacy (batch 8) | 11,66x | 1,0x |

A partir del throughput medido se deduce una latencia aproximada de 13,9 ms por token en batch 1 y de 4,5 ms por token en batch 8. El hallazgo declarado por el autor es la eliminación de 224 barreras de sincronización de GPU por token respecto a la implementación legacy basada en bucles numpy, manteniendo paridad numérica con el esquema de cuantización de referencia.

## Requisitos de hardware

- VRAM/memoria unificada estimada: entorno a 19,11 GB de pico según la medición del autor, con un modelo de 18,30 GB en disco. Se recomienda un equipo con al menos 24-32 GB de memoria unificada para dejar margen al sistema y al contexto.
- GPU compatibles: exclusivamente Apple Silicon con soporte Metal. El benchmark se realizó en un Apple M4 Pro con 48 GB de memoria unificada.
- GPUs NVIDIA (A100, H100, RTX 4090) y AMD: no compatibles con este repositorio, ya que los pesos están en formato MLX y no se distribuye una conversión GGUF o safetensors estándar de PyTorch.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en Macs de gama alta con memoria unificada suficiente; no en el sentido de GPUs de consumo dedicadas, por incompatibilidad de formato.
- Opciones de despliegue: framework MLX 0.32.0 o superior mediante el paquete `aliceai_mlx` incluido en el repositorio; script interactivo `chat.py` con modos translate, correct, professor, qa y raw. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 72,69 tok/s en batch 1 (≈13,9 ms/token) y 220,22 tok/s en batch 8 (≈4,5 ms/token) sobre M4 Pro de 48 GB, con una utilización de GPU del 76,2 % y del 91,1 % respectivamente.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada datos de benchmarks de calidad que permitan comparar este modelo con alternativas de la misma categoría. La única comparación documentada es contra la implementación legacy del mismo modelo (bucles planos en numpy), ya recogida en la sección de benchmarks.

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hosstia/AliceAI-T5-35B-A0.6B-MLX-4bit | 35B totales, 0,6B activos | No especificada (RoPE YaRN, base 9984, factor 20,0) | MLX safetensors 4-bit | other | HuggingFace, 0 descargas, 0 likes |
| yandex/AliceAI-T5-35B-A0.6B (modelo base) | 35B totales, 0,6B activos | no disponible | no disponible | no disponible | HuggingFace (referenciado como base_model) |
| Otras alternativas de traducción zh-ru | no disponible | no disponible | no disponible | no disponible | no disponible |

La búsqueda web realizada no devolvió resultados relevantes sobre modelos comparables; los resultados obtenidos no guardaban relación con la consulta.

## Limitaciones y advertencias

- La variante 6-bit presenta menor calidad en el modo QA que la 4-bit: las respuestas tienden a ser más cortas y con más repeticiones.
- La variante MXFP4 sufre degeneración por repetición: entra en bucle en aproximadamente el 10 % de los párrafos y el autor no la recomienda para producción. Deben usarse las variantes 4-bit o 6-bit.
- El parámetro `min_new_tokens` es obligatorio en el modo QA: sin él, los modelos cuantizados emiten EOS de forma prematura y las respuestas se cortan a mitad de frase. El valor por defecto recomendado es 128.
- El modo de traducción puede truncar en entradas largas en las variantes cuantizadas; se recomienda dividir los textos de origen muy largos en segmentos más cortos.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de fidelidad, y el modelo no incorpora mecanismos declarados de verificación factual.
- Sesgos conocidos: no disponibles. No hay información sobre composición del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Limitación idiomática: el modelo solo declara chino y ruso. El modo QA funciona con preguntas en ruso, no en castellano.
- Restricciones de licencia: la licencia figura como `other` sin que la información disponible detalle los términos. Al derivar del modelo `yandex/AliceAI-T5-35B-A0.6B`, es imprescindible revisar las condiciones del modelo base antes de cualquier uso comercial.
- Dependencia de plataforma: solo funciona en Apple Silicon con MLX; no hay ruta de despliegue documentada para GPUs NVIDIA o AMD ni conversiones a GGUF.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Caveat de producción: la ganancia de velocidad está medida contra una implementación legacy concreta de bucles numpy, no contra otras implementaciones optimizadas, por lo que las cifras de 3,85x y 11,66x deben interpretarse en ese contexto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hosstia/AliceAI-T5-35B-A0.6B-MLX-4bit
- Modelo base (Yandex): https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Artículo técnico sobre el proceso de conversión: incluido en el repositorio como `ARTICLE.md`
- Código de ejecución: paquete `aliceai_mlx`, `chat.py` y `requirements.txt` incluidos en el repositorio del modelo
- Otros enlaces (paper, blog, demo): no disponible. La búsqueda web no devolvió resultados relevantes sobre este modelo.
