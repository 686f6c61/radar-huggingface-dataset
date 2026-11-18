# nativ-community/SenseNova-Loop-9B-5bit

## Resumen

SenseNova-Loop-9B-5bit es una conversión cuantizada a 5 bits para MLX del modelo multimodal SenseNova-Loop-9B, desarrollado originalmente por Sensetime (sensenova). Se trata de un modelo vision-language que acepta entradas de texto e imagen y produce salida de texto, pensado para ejecutarse en Apple Silicon mediante la librería mlx-vlm. Esta versión concreta la publica el colectivo nativ-community y reduce el peso de los pesos a 7,082 GB (6,596 GiB), lo que facilita su despliegue en equipos con memoria unificada de gama alta.

El modelo emplea una arquitectura de transformer con bucles (looped-transformer): sus 32 capas físicas de decodificador se ejecutan como 56 visitas, cada una con su propia caché. Incorpora además un enrutador mHC (multi-head control) con pesos en FP32 idénticos al checkpoint original. El modelo base cuenta con 9.412.959.856 parámetros totales y soporta inglés y chino, con una licencia Apache 2.0 que permite uso comercial.

La relevancia de esta ficha radica en que es una de las pocas exportaciones MLX de un modelo con arquitectura de bucle y capacidades de visión, lo que permite a desarrolladores en macOS probar modelos multimodales de ~9B parámetros de forma local. No obstante, la validación publicada se limita a pruebas de humo (smoke tests) y no a benchmarks de calidad, por lo que debe tratarse como una versión experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped-transformer), vision-language; 32 capas físicas ejecutadas como 56 visitas |
| Parametros totales | 9.412.959.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 512K tokens (según model card; no validado en esta exportación) |
| Tipos de cuantizacion | 5 bits affine, group size 64; torre de visión en BF16; pesos mHC en FP32 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), con código personalizado (custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles: el modelo tiene 32 capas físicas de decodificador que se ejecutan en 56 visitas, cada una con una caché independiente. Esta técnica de reutilización de capas permite aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros. El modelo incluye una torre de visión para procesar imágenes y un enrutador mHC (multi-head control) cuyos pesos y sesgos se mantienen en FP32 y son byte-idénticos al checkpoint original. La compuerta de bucle (loop gate) usada solo en entrenamiento se omite en esta exportación.

En cuanto a los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO), no se dispone de información en la documentación proporcionada; se remite a la model card original de sensenova/SenseNova-Loop-9B. La conversión se realizó desde el checkpoint en coma flotante en la revisión `329a65f` usando MLX 0.32.4, con cuantización affine de 5 bits y group size 64 sobre las proyecciones y embeddings del lenguaje. El verificador especulativo fusionado de Qwen3.5 no está soportado y es rechazado por la implementación.

## Capacidades

- Generación de texto y razonamiento: responde a preguntas de aritmética y razonamiento general (la prueba de humo devolvió 42 para 17 + 25).
- Comprensión de imágenes: descripción de imágenes y respuesta a preguntas sobre su contenido (la prueba identificó gatos en una imagen).
- Conversación multi-turno: pipeline image-text-to-text con soporte de plantilla de chat.
- Modo thinking: se activa con `enable_thinking=True` en la plantilla de chat.
- Entrada de múltiples imágenes: soporta listas ordenadas de imágenes mediante `num_images`.
- Multilingüe: inglés y chino.
- No se documenta soporte de tool calling, function calling ni capacidades de agente en la información disponible.
- No se documenta soporte de audio ni otras modalidades más allá de texto e imagen.

## Casos de uso

- Descripción automática de imágenes en local: el modelo puede procesar una imagen y generar una descripción textual en un Mac con Apple Silicon, útil para catalogación de fotos o accesibilidad, gracias a su torre de visión en BF16 y su reducido peso de 7,082 GB.
- Asistente multimodal de escritorio: integrado en una aplicación macOS mediante mlx-vlm, puede mantener conversaciones multi-turno sobre imágenes y texto sin conexión a la nube.
- Prototipado de investigación en arquitecturas con bucles: al ser una exportación MLX de un looped-transformer, sirve para experimentar con reutilización de capas y comparar el comportamiento frente a transformers convencionales en hardware Apple.
- Extracción de información de documentos escaneados: con entradas de imagen y preguntas en inglés o chino, puede responder sobre el contenido de capturas o páginas, siempre que se validen los resultados por tratarse de pruebas de humo.
- Evaluación comparativa de cuantizaciones: permite a investigadores medir el impacto de la cuantización a 5 bits (group size 64) frente al checkpoint BF16 original en tareas de visión y texto.
- Demostraciones y docencia: su tamaño contenido y licencia Apache 2.0 lo hacen adecuado para talleres sobre modelos multimodales en Apple Silicon, con ejemplos de generación de texto e imagen.
- Procesamiento de imágenes por lotes en pipelines locales: mediante scripts Python con mlx-vlm, se puede recorrer un directorio de imágenes y generar descripciones o respuestas, aunque sin garantías de calidad por la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las pruebas realizadas son smoke checks (una comprobación aritmética que devolvió 42 y una descripción de imagen que identificó gatos) y no un benchmark de calidad. Tampoco se ha validado el límite completo de contexto de 512K tokens.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 7,082 GB (6,596 GiB); con caché KV y overhead de ejecución se recomienda al menos 16 GB de memoria unificada, y 24 GB o más para contextos largos o múltiples imágenes.
- GPU recomendadas: Apple Silicon con memoria unificada; la validación se realizó en un Apple M5 Max con 128 GB. No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090), ya que el formato es MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de gama alta (M-series con 16 GB o más), no en GPU de consumo NVIDIA por incompatibilidad de formato.
- Opciones de despliegue: mlx-vlm (requiere la revisión con soporte de SenseNova Loop, PR #2752, o la revisión validada `3e90e9d`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/Plataforma | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-5bit (este) | 9,41B | 512K (no validado) | Apache 2.0 | MLX (Apple Silicon) | Cuantizado a 5 bits, vision-language, arquitectura con bucles |
| sensenova/SenseNova-Loop-9B (base) | 9,41B | 512K | Apache 2.0 | Safetensors (BF16) | Checkpoint original en coma flotante, sin cuantizar |
| Alternativas de ~9B vision-language | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de la misma categoría en términos de rendimiento; los datos de benchmarks del modelo base no están incluidos en la documentación proporcionada.

## Limitaciones y advertencias

- Validación limitada: solo se han realizado smoke tests (aritmética e identificación de gatos en una imagen); no hay benchmarks de calidad ni evaluación sistemática.
- Contexto no validado: el límite de 512K tokens no se ha comprobado en esta exportación; el rendimiento en contextos largos es incierto.
- Plataforma restringida: solo funciona con MLX en Apple Silicon; requiere una revisión específica de mlx-vlm (PR #2752) que puede no estar en la versión estable.
- Verificador especulativo no soportado: el verificador fusionado de Qwen3.5 es rechazado por la implementación, lo que puede afectar a la latencia si se esperaba decodificación especulativa.
- Idiomas limitados: solo inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas, especialmente en tareas de visión o razonamiento no evaluadas.
- Sesgos: no se documentan sesgos conocidos, pero al no haber evaluación, no pueden descartarse.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo base; la model card remite a la licencia upstream.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/nativ-community/SenseNova-Loop-9B-5bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Revisión del checkpoint original: https://huggingface.co/sensenova/SenseNova-Loop-9B/tree/329a65f701ba8c48b73c30d0cbaa6f0449733673
- PR de soporte en mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm/pull/2752
- Repositorio mlx-vlm (revisión validada): https://github.com/Neywa-Labs/mlx-vlm.git
