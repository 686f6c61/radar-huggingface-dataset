# dfkozlov/gemma-4-E4B-it-litert-lm

## Resumen

`dfkozlov/gemma-4-E4B-it-litert-lm` es un export no oficial de Gemma 4 E4B-it compilado para la NPU Hexagon del Qualcomm Snapdragon 8 Gen 3 (SM8650), empaquetado en formato `.litertlm` para el runtime LiteRT-LM de Google. El autor (dfkozlov) parte de los pesos oficiales de `google/gemma-4-E4B-it` y los convierte mediante el pipeline de exportación NPU de litert-torch, parcheado para replicar el layout del bundle NPU oficial de Gemma E2B. El resultado es un artefacto de 2,26 GB de contexto NPU que ejecuta el decodificador de texto en la NPU y deja el codificador de audio en CPU.

El modelo resuelve un hueco concreto: no existe build oficial de NPU para Gemma 4 E4B, de modo que este export permite inferencia on-device acelerada por hardware en un teléfono de gama alta con Snapdragon 8 Gen 3. Frente al build de CPU del mismo modelo en el mismo dispositivo, reduce el tiempo hasta el primer token de 2,0-2,5 s a unos 0,3 s y mejora el decode de ~10,7 a ~12 tokens/s, con una latencia mediana en peticiones habladas de 1,24 s frente a 3,19 s.

Es relevante para desarrolladores de Android que quieran desplegar un LLM multimodal (texto, audio y secciones de visión) en dispositivo sin depender de la nube, aceptando las restricciones de hardware (solo SM8650) y de licencia del runtime QNN de Qualcomm, que no se distribuye con el modelo. El repo ocupa 4,5 GB y se publica bajo Apache 2.0, igual que Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B-it), exportado a LiteRT-LM para NPU Hexagon; decodificador de texto en NPU, audio en CPU |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (prefill de 128) |
| Tipos de cuantizacion | Pesos 4-bit por canal (min-max, post-training, no QAT); proyecciones de embedding 8-bit por capa; activaciones y KV cache en 16-bit con rangos estáticos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), contexto NPU compilado de 2,26 GB |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: es una recompilación de `google/gemma-4-E4B-it` (revisión `ee0ef602`) mediante el pipeline `export_hf` de litert-torch, parcheado para coincidir con el layout del bundle NPU oficial de Gemma E2B. Los parches conservan el logit softcap de Gemma, convierten la actualización de la KV cache en un `dynamic-update-slice` plano, limitan los grafos de máscara a entradas de token y time-step, y eliminan las entradas KV de la última capa no utilizadas en el prefill.

La cuantización es post-entrenamiento: pesos 4-bit por canal con rangos min-max, proyecciones de embedding 8-bit por capa, y activaciones y KV cache en 16-bit con rangos estáticos calibrados sobre 12 prompts de texto y 4 clips de voz. El binario se compila con `litert_lm_npu_compiler` y Qualcomm AI Runtime (QAIRT) 2.50.0 para SM8650, generando un único contexto NPU de 2,26 GB. Del repo `litert-community/gemma-4-E4B-it-litert-lm` (revisión `e6a3892a`) se reutilizan el codificador y adaptador de audio (CPU), las secciones de visión, los metadatos del LLM y el tokenizer. Una variante con activaciones int8 produjo salidas inutilizables en el mismo teléfono, por lo que solo se publica el build de 16 bits.

## Capacidades

- Generación de texto y razonamiento conversacional con el decodificador Gemma 4 E4B-it.
- Procesamiento de audio en CPU mediante el codificador y adaptador heredados del bundle de litert-community (peticiones habladas evaluadas en el banco de pruebas del autor).
- Secciones de visión incluidas en el paquete, aunque el autor no detalla su ejecución en NPU.
- Ejecución on-device acelerada por NPU Hexagon para el decodificador de texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: audio confirmado en CPU; visión empaquetada pero sin detalles de ejecución; thinking no disponible.

## Casos de uso

- Asistentes de voz on-device: el modelo procesa peticiones habladas en una mediana de 1,24 s (frente a 3,19 s del build de CPU) en un Xiaomi 14 Ultra, lo que lo hace adecuado para interfaces de voz locales sin round-trip a la nube.
- Automatización de comandos de shell por voz: en las pruebas del autor acertó 21 de 26 comandos dictados, lo que permite construir interfaces de administración de sistemas por voz en el propio dispositivo.
- Inferencia privada en Android: al ejecutarse íntegramente en el teléfono con ~2,6 GB de RAM, los datos del usuario no salen del dispositivo, útil en sectores con requisitos de confidencialidad.
- Prototipado de aplicaciones LiteRT-LM con backend NPU: sirve como referencia funcional para validar el stack `litertlm-android:0.18.1` + `litert-npu-runtime-qualcomm:2.3.0` + QNN 2.50 en hardware SM8650.
- Procesamiento de audio local: el codificador de audio en CPU permite transcribir o interpretar clips de voz sin conexión, con el texto generado por la NPU.
- Evaluación comparativa NPU vs CPU: útil para medir el impacto real de la aceleración Hexagon en latencia y throughput antes de comprometerse con un despliegue en producción.

## Benchmarks y rendimiento

Datos del autor en Xiaomi 14 Ultra (SM8650, Android 16), LiteRT-LM 0.18.1, comparando este build NPU con el build de CPU de litert-community para E4B en el mismo teléfono:

| Metrica | Build NPU (este) | Build CPU |
|---|---|---|
| Carga | 1,7–3,4 s | 0,7 s (11 s la primera vez) |
| Tiempo hasta el primer token | ~0,3 s | 2,0–2,5 s |
| Decode | ~12 tokens/s | ~10,7 tokens/s |
| Petición hablada (mediana de 48) | 1,24 s | 3,19 s |
| Comando shell correcto (26 peticiones habladas) | 21 | 20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware: exclusivamente Snapdragon 8 Gen 3 (SM8650). No funciona en otros SoC.
- RAM: aproximadamente 2,6 GB durante la inferencia.
- Runtime: LiteRT-LM con backend NPU, probado con `com.google.ai.edge.litertlm:litertlm-android:0.18.1` y `com.google.ai.edge.litert:litert-npu-runtime-qualcomm:2.3.0`.
- Runtime QNN de Qualcomm 2.50.0 (`com.qualcomm.qti:qnn-runtime:2.50.0`): requiere `libQnnHtp.so`, `libQnnSystem.so`, `libQnnHtpV75Stub.so` y `libQnnHtpV75Skel.so`, con `ADSP_LIBRARY_PATH` apuntando a la carpeta del skel. Este runtime es software de Qualcomm bajo su propia licencia y no se incluye en el repo.
- Configuración: usar `Backend.NPU(dispatchDir)` para el decodificador de texto y `Backend.CPU()` para audio.
- GPU de escritorio: no aplica; el artefacto está compilado para la NPU Hexagon del SM8650 y no se ejecuta en A100, H100 ni RTX 4090.
- Opciones de despliegue: LiteRT-LM en Android; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~0,3 s hasta el primer token y ~12 tokens/s de decode en el dispositivo probado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceleracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este export (Gemma 4 E4B-it NPU) | no disponible | 4096 | NPU Hexagon SM8650 | Apache 2.0 (runtime QNN aparte) | HuggingFace, no oficial |
| litert-community/gemma-4-E4B-it-litert-lm (CPU) | no disponible | no disponible | CPU en Android | Apache 2.0 | HuggingFace, oficial de la comunidad |
| google/gemma-4-E4B-it (pesos originales) | no disponible | no disponible | Requiere conversión | Apache 2.0 | HuggingFace, oficial de Google |

La comparación cuantitativa disponible se limita al mismo dispositivo: el build NPU reduce el TTFT de 2,0-2,5 s a ~0,3 s y la latencia de peticiones habladas de 3,19 s a 1,24 s frente al build de CPU. No hay datos de benchmarks de calidad que permitan comparar con otros modelos de tamaño similar.

## Limitaciones y advertencias

- Export no oficial y experimental, sin afiliación con Google ni Qualcomm; no debe tratarse como build soportado.
- Compatibilidad restringida al Snapdragon 8 Gen 3 (SM8650); no funciona en otros SoC ni en GPU de escritorio.
- La cuantización es post-entrenamiento (no QAT), con calibración sobre solo 12 prompts de texto y 4 clips de voz, lo que puede degradar la calidad en dominios alejados de esa muestra.
- La variante con activaciones int8 produjo salidas inutilizables, lo que indica fragilidad del proceso de cuantización para este modelo.
- El runtime QNN de Qualcomm no se distribuye con el modelo y está sujeto a la licencia de Qualcomm, lo que añade una dependencia legal y de distribución adicional.
- Contexto limitado a 4096 tokens con prefill de 128, insuficiente para documentos largos o conversaciones extensas.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables al modelo base Gemma 4.
- El modelo ocupa 4,5 GB en el repo y ~2,6 GB de RAM en ejecución, lo que limita su uso a dispositivos de gama alta con memoria suficiente.
- No hay datos publicados de benchmarks de calidad (MMLU, HumanEval, GSM8K) que permitan validar el impacto de la cuantización en el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dfkozlov/gemma-4-E4B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Bundle de referencia de litert-community: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
