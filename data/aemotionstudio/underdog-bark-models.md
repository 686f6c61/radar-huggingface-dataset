# AEmotionStudio/underdog-bark-models

## Resumen

Underdog Bark 3.0 es una familia de tres checkpoints de reconocimiento automático del habla (ASR) en inglés publicados por Conway Research y distribuidos en este repositorio como espejo por AEmotionStudio para la aplicación MAESTRO. Los tres modelos derivan de `nvidia/parakeet-tdt-0.6b-v3` (aproximadamente 627 millones de parámetros en total) a través de `moondream/parakeet-ultra`, y se diferencian en el tratamiento de la transcripción: `plus` mantiene cada palabra tal como se pronuncia, incluidos muletillas; `clean` elimina muletillas, falsos comienzos y repeticiones; y `pro` es la variante literal de mayor tamaño de descarga.

Técnicamente se trata de modelos `ParakeetForTDT`, es decir, arquitecturas Parakeet con decodificación Token-and-Duration Transducer (TDT), una variante de los transductores que predice conjuntamente tokens y duraciones para acelerar la decodificación y mejorar la alineación temporal. El repositorio incluye además el extractor de características y el tokenizador de NVIDIA compartidos por las tres variantes, lo que permite cargar cada checkpoint de forma autocontenida y sin conexión.

La relevancia de este repositorio es fundamentalmente práctica: Conway publica las variantes `plus` y `clean` en un formato comprimido con codificación entrópica (`model.bark`) que requiere el decodificador ANS `constriction` y transformers ≥ 5.19 para cargarse. Este espejo las decodifica una vez y las almacena como safetensors, con lo que se pueden usar con el flujo estándar de Hugging Face y con el grafo Parakeet-TDT propio de MAESTRO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet con decodificación TDT (Token-and-Duration Transducer), clase `ParakeetForTDT` |
| Parámetros totales | 627 M (604 M en fp16 + 23 M en fp32 en las variantes recodificadas) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 y fp32 recomendados; bf16 desaconsejado (alteró la transcripción en 3 de 10 clips para `pro` en las pruebas de paridad de MAESTRO) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `generation_config.json` por variante |

## Arquitectura y entrenamiento

Los tres checkpoints son modelos de reconocimiento del habla basados en la arquitectura Parakeet de NVIDIA, concretamente en la variante TDT (Token-and-Duration Transducer). En lugar de un CTC o un transductor clásico, el decodificador TDT predice simultáneamente el siguiente token y su duración, lo que reduce el número de pasos de decodificación y produce alineaciones temporales más precisas. El modelo base es `nvidia/parakeet-tdt-0.6b-v3`, con unos 600 millones de parámetros, adaptado posteriormente por Moondream en `moondream/parakeet-ultra` y afinado por Conway Research para dar lugar a las tres variantes.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si se aplicaron técnicas de RLHF o DPO; la model card del espejo no los detalla y la información proporcionada no los incluye. La innovación técnica destacable del repositorio es de empaquetado más que de modelado: las variantes `plus` y `clean` se publican originalmente como un `model.bark` con codificación entrópica ANS que exige `constriction` y transformers ≥ 5.19; aquí se decodificaron una sola vez con la rutina de Conway y se reescribieron como safetensors, con cada tensor en fp16 cuando es bit-idéntico al valor decodificado (los pesos del encoder codificados por niveles, 604 M de parámetros) y en fp32 en el resto (23 M). El autor afirma que no se modificó ningún valor y publica los hashes sha256 de cada fichero en `sha256.json`.

## Capacidades

- Transcripción de voz a texto en inglés con salida literal palabra por palabra (variante `plus`), conservando muletillas y repeticiones.
- Transcripción normalizada (variante `clean`), con eliminación de muletillas, falsos comienzos y repeticiones.
- Variante `pro` como checkpoint literal de mayor tamaño de descarga, pensada para escenarios donde prima la fidelidad sobre el tamaño del artefacto.
- Decodificación TDT con predicción conjunta de token y duración, lo que aporta alineación temporal implícita.
- Procesamiento compartido mediante el extractor de características y el tokenizador de `nvidia/parakeet-tdt-0.6b-v3`.
- Carga autocontenida y offline: cada carpeta de variante es un checkpoint estándar con su configuración y sus pesos.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento; el modelo es exclusivamente ASR.

## Casos de uso

- Subtitulado y transcripción de reuniones: la variante `clean` produce texto legible sin muletillas ni falsos comienzos, adecuada para actas y subtítulos que se publican directamente.
- Análisis de entrevistas y estudios cualitativos: la variante `plus` conserva cada palabra pronunciada, incluidas vacilaciones, lo que permite estudiar pausas, reformulaciones y patrones de habla en el texto transcrito.
- Transcripción de audio para búsqueda y indexación: al ser un modelo de 627 M de parámetros, cabe en una GPU de consumo y permite procesar lotes de audio en local sin depender de servicios externos.
- Aplicaciones de escritorio con modo offline: el repositorio agrupa pesos, extractor y tokenizador en una sola fuente estable, lo que simplifica el instalador de una aplicación que descarga el modelo una vez y transcribe sin conexión, como hace MAESTRO.
- Dictado y accesibilidad: integración en herramientas de voz a texto para usuarios con movilidad reducida, con la variante `clean` para reducir ruido en el texto final.
- Pipelines de evaluación de ASR: las tres variantes comparten origen y procesador, por lo que sirven para comparar el efecto de la normalización (literal frente a limpia) sobre el mismo audio de entrada.
- Preprocesado de corpus de voz: transcripción masiva de grabaciones en inglés para construir datasets de texto alineado con audio, con la ventaja de que la decodificación TDT facilita la alineación temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp16 para los 627 M de parámetros, más el espacio de activaciones y del extractor de características; en fp32, alrededor de 2,5 GB solo para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en lotes pequeños; tarjetas de consumo como RTX 3060, RTX 4060 o RTX 4090 son suficientes, y en el entorno profesional A100 o H100 permiten lotes mayores.
- Cabe en GPU de consumo: sí, con holgura, dado el tamaño de 627 M de parámetros y un repositorio total de 3,9 GB que incluye las tres variantes y el procesador.
- Opciones de despliegue: carga directa con transformers ≥ 5.19 mediante `ParakeetForTDT` y `AutoProcessor`; el grafo Parakeet-TDT propio de MAESTRO para la aplicación de escritorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de arquitectura ASR.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la decodificación TDT está diseñada para reducir pasos respecto a un transductor convencional, pero no se aportan cifras.
- Precauciones de precisión: usar fp16 o fp32; en bf16 la variante `pro` cambió la transcripción en 3 de 10 clips durante las pruebas de paridad del autor.
- Ajuste de entrada: anteponer 0,25 s de silencio para `plus` y `pro` (configuración evaluada por Conway); `clean` no lo requiere.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Underdog Bark 3.0 (este repo) | 627 M | no disponible | en | CC BY 4.0 | safetensors | Tres variantes (plus, clean, pro) sobre Parakeet TDT |
| nvidia/parakeet-tdt-0.6b-v3 | ~600 M | no disponible | no disponible | CC BY 4.0 | no disponible | Modelo base directo; origen del extractor y tokenizador |
| moondream/parakeet-ultra | no disponible | no disponible | no disponible | CC BY 4.0 | no disponible | Intermedio en la cadena de derivación |
| ConwayResearch/Underdog-Bark-3.0-Plus | 627 M (según este espejo) | no disponible | en | CC BY 4.0 | `model.bark` (ANS) | Requiere `constriction` y transformers ≥ 5.19 |

## Limitaciones y advertencias

- Solo admite inglés; no se documenta soporte multilingüe.
- Es un modelo exclusivamente ASR: no genera texto libre, no razona, no hace tool calling ni procesa imágenes.
- Riesgo de alucinación inherente a los modelos transducer: en audio con ruido, acentos marcados o solapamiento de hablantes puede producir palabras no pronunciadas; no se aportan tasas de error para cuantificar el fenómeno.
- No se han publicado evaluaciones de sesgo; al ser un modelo entrenado sobre corpus de habla no especificados, puede reflejar sesgos acústicos y léxicos de dichos datos.
- La licencia CC BY 4.0 exige atribución a Conway Research, NVIDIA y Moondream según la cadena indicada en el `NOTICE`; es compatible con uso comercial siempre que se respete la atribución.
- Las variantes `plus` y `clean` de este espejo no son byte-idénticas a las originales: se decodificaron desde `model.bark` y se recodificaron en safetensors, con mezcla de fp16 y fp32 por tensor. El autor afirma que la decodificación es exacta, pero conviene verificar los hashes de `sha256.json` si se requiere reproducibilidad estricta.
- La variante `pro` y la carpeta `processor` son copias byte-idénticas de los originales.
- El uso de bf16 degrada la fidelidad de la transcripción en `pro` según las pruebas del autor.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado en octubre de 2026; se trata de un espejo reciente sin validación independiente publicada.

## Enlaces

- Repositorio del espejo: https://huggingface.co/AEmotionStudio/underdog-bark-models
- Modelo base `ConwayResearch/Underdog-Bark-3.0-Plus`: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Plus
- Modelo base `ConwayResearch/Underdog-Bark-3.0-Clean`: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Clean
- Modelo base `ConwayResearch/Underdog-Bark-3.0-Pro`: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro
- Origen del procesador, `nvidia/parakeet-tdt-0.6b-v3`: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo intermedio `moondream/parakeet-ultra`: https://huggingface.co/moondream/parakeet-ultra
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
