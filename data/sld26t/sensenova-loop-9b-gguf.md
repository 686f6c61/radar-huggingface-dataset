# sld26t/SenseNova-Loop-9B-GGUF

## Resumen

SenseNova-Loop-9B-GGUF es la conversión no oficial al formato GGUF del checkpoint final (17 de noviembre de 2026) del modelo multimodal SenseNova-Loop-9B, desarrollado por SenseNova / OpenSenseNova. Se trata de un modelo denso de 9.000 millones de parámetros que procesa imagen y texto (pipeline `image-text-to-text`) y que destaca por una arquitectura poco convencional: 32 capas físicas de decodificador que se ejecutan de forma lógica 56 veces mediante un mecanismo de capas compartidas y enrutamiento mHC de dos flujos. Esta conversión la publica el usuario `sld26t` con licencia Apache-2.0 heredada del modelo original.

La relevancia de esta ficha reside en dos factores. Primero, el modelo final incorpora RoPE con escalado YaRN (factor 2) sobre un contexto original de 262.144 tokens, configurado hasta 524.288 tokens, y elimina la cabeza MTP (`mtp_num_hidden_layers: 0`) respecto a versiones previas. Segundo, y más importante para quien vaya a desplegarlo, los GGUF no funcionan en llama.cpp estándar, LM Studio ni Ollama: requieren un fork específico que implemente las capas compartidas y el enrutamiento mHC de SenseNova Loop.

El paquete incluye cuantizaciones K-quants, legacy, formatos experimentales de baja precisión y BF16, además de un proyector visual F16 separado (`mmproj-SenseNova-Loop-9B-F16.gguf`) para inferencia multimodal. El autor no publica resultados de perplejidad ni de calidad de tarea para estas cuantizaciones, y limita explícitamente sus afirmaciones a pruebas de humo en CPU sobre Windows.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con capas compartidas (32 capas físicas, 56 ejecuciones lógicas) y enrutamiento mHC de dos flujos |
| Parámetros totales | 9B (aproximado, según denominación del modelo) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens originales; máximo configurado 524.288 con YaRN factor 2 |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q4_0, Q4_1, Q5_0, Q5_1, Q8_0, Q1_0, Q2_0, TQ1_0, TQ2_0, BF16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (texto) + GGUF F16 para proyector visual |

## Arquitectura y entrenamiento

La arquitectura se aparta del transformer convencional por dos decisiones de diseño. En primer lugar, el modelo almacena 32 capas físicas de decodificador pero las ejecuta 56 veces de forma lógica, reutilizando un bloque repetido mediante alias en el runtime compatible; el GGUF conserva esta estructura con los tensores del bloque repetido almacenados una sola vez. En segundo lugar, emplea un enrutamiento mHC (multi-head routing con dos flujos) junto con capas compartidas, lo que explica que el fork de llama.cpp necesario deba implementar explícitamente esa lógica. Los tensores de enrutamiento y las convoluciones recurrentes se mantienen en F32 (120 tensores fijados a esa precisión, incluidos los bloques virtuales de cola tras el bucle).

El checkpoint final cambia RoPE a YaRN con factor 2 sobre un contexto original de 262.144 tokens y un máximo configurado de 524.288, y prescinde de la cabeza MTP. El checkpoint fuente contiene un parámetro no esperado, `model.language_model.loop_gate.logits` (4.096 valores F32), que el modelo de referencia ni registra ni utiliza; la conversión lo preserva en metadatos de procedencia (`sensenova_loop.source_unused.loop_gate.logits`) en lugar de descartarlo o incorporarlo a la inferencia. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en inglés y chino.
- Comprensión de imágenes y respuesta en texto (image-text-to-text) mediante el proyector visual F16.
- Conversaciones multiturno con ventanas de contexto muy extensas (hasta 524.288 tokens configurados, sujeto a validación en hardware propio).
- Procesamiento de instrucciones y preguntas directas (verificado en pruebas de humo: `13 × 7 → 91`).
- Descripción y clasificación de contenido visual (verificado: imagen roja sólida devuelve "Red"; cambiando solo los píxeles a azul devuelve "Blue").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales adicionales (thinking mode, audio, decodificación especulativa): no disponible en la información proporcionada.

## Casos de uso

- Análisis documental con imágenes: el modelo puede recibir páginas escaneadas o capturas y generar descripciones o extracciones en texto, aprovechando el pipeline image-text-to-text y el proyector F16. Adecuado para digitalización asistida de archivos en inglés y chino.
- Asistencia sobre corpus extensos: con hasta 524.288 tokens configurados, encaja en tareas de resumen o pregunta-respuesta sobre documentos largos, siempre que el hardware soporte la ventana y se valide el comportamiento en contexto largo (el autor no lo ha validado).
- Clasificación y etiquetado visual automatizado: la prueba de humo con imágenes de color sólido demuestra la vía imagen→texto para tareas de categorización simple dentro de pipelines de datos.
- Procesamiento bilingüe inglés-chino: útil en flujos de traducción asistida, atención al cliente o moderación de contenido en esas dos lenguas, que son las declaradas.
- Experimentación e investigación en arquitecturas no convencionales: al requerir un fork específico de llama.cpp, el modelo sirve para estudiar capas compartidas y enrutamiento mHC en entornos de investigación controlados.
- Despliegue local en CPU para prototipos: el autor verificó Q4_K_S (5.013 GiB) en runtime CPU sobre Windows, lo que permite pruebas de concepto sin GPU antes de escalar.
- Evaluación comparativa de cuantizaciones: el paquete ofrece desde Q1_0 hasta BF16 generados directamente desde BF16, útil para estudiar la degradación de un modelo denso bajo compresión extrema (sin métricas publicadas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no realiza afirmaciones de paridad numérica completa, contexto largo, GPU ni calidad general, y que las cuantizaciones no se han clasificado en pruebas de perplejidad o calidad de tarea. Las únicas verificaciones son pruebas de humo en CPU: aritmética simple (`13 × 7 → 91`) y clasificación de color de imagen con el proyector F16. El GGUF de texto contiene 523 tensores y el proyector 334; Q4_K_S ocupa 5.383.111.136 bytes (5.013 GiB).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño de archivo, Q4_K_S ocupa 5.013 GiB en disco; Q6_K y Q8_0 requieren más memoria; BF16 es la referencia de alta precisión y exige bastante más.
- GPU recomendadas: no disponible. El autor solo documenta pruebas en CPU (Windows) y no publica mediciones en GPU.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño de Q4_K_S sugiere que podría caber en GPU con 8 GB o más de VRAM, pero no hay validación publicada.
- Opciones de despliegue: exclusivamente el fork `GuideboardLabs/llama.cpp-sensenova-loop` (rama `sensenova-loop`, commit `fad174ecd8bf22746a626c58e67e193f095aaa46`), usando `llama-cli` o `llama-server`; para imágenes, compilación multimodal con `--mmproj`. llama.cpp estándar, LM Studio y Ollama no son compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Despliegue |
|---|---|---|---|---|---|
| SenseNova-Loop-9B (este GGUF) | 9B denso | 262.144 original / 524.288 configurado | Imagen + texto | Apache-2.0 | Solo fork de llama.cpp específico |
| Qwen2.5-VL-7B | 7B | 32.768 nativo (extensible) | Imagen + texto | Apache-2.0 (mayoría de variantes) | llama.cpp estándar, vLLM, TGI |
| Llama 3.2 11B Vision | 11B | 128.000 | Imagen + texto | Llama Community License | vLLM, llama.cpp (soporte variable) |
| InternVL2.5-8B | 8B | 32.768 (hasta 1M en variantes) | Imagen + texto | MIT / Apache-2.0 según variante | vLLM, LMDeploy |

La comparación se limita a parámetros, contexto, modalidad, licencia y vía de despliegue, porque no hay benchmarks publicados para SenseNova-Loop-9B. Su ventaja diferencial es la ventana de contexto configurada (524.288 tokens) y la licencia Apache-2.0; su desventaja principal es la dependencia de un runtime no estándar, frente a la compatibilidad amplia de las alternativas citadas.

## Limitaciones y advertencias

- Incompatibilidad de runtime: no funciona en llama.cpp estándar, LM Studio ni Ollama; renombrar el modelo a Qwen no lo hace compatible. Requiere compilar el fork fijado y aplicar `sensenova-final-conversion.patch` antes de convertir.
- Sin métricas de calidad: no hay perplejidad ni benchmarks de tarea; las cuantizaciones de baja precisión (Q1_0, Q2_0, TQ1_0, TQ2_0) pueden degradar gravemente un modelo denso no entrenado para cuantización y son opciones experimentales, no recomendaciones.
- Contexto no validado: el máximo de 512K configurado no garantiza que quepa en el hardware del usuario ni que el comportamiento en contexto largo esté verificado.
- Idiomas limitados: solo inglés y chino declarados; el rendimiento en castellano no está documentado.
- Riesgo de alucinación: no cuantificado en la información disponible; como en cualquier modelo generativo, debe asumirse y mitigarse con verificación.
- Sesgos: no documentados por el autor.
- Procedencia y mantenimiento: conversión no oficial de un tercero (`sld26t`), sin descargas ni likes en el momento de la consulta; la calidad del empaquetado depende de ese publicador, aunque se incluye manifiesto `SHA256SUMS` y verificación de arquitectura, número de capas, metadatos de contexto y RoPE, formas de tensores y preservación F32.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de atribución a SenseNova / OpenSenseNova y revisarse LICENSE y NOTICE del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sld26t/SenseNova-Loop-9B-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Fork de llama.cpp compatible: https://github.com/GuideboardLabs/llama.cpp-sensenova-loop
- Guía de compilación del fork: https://github.com/GuideboardLabs/llama.cpp-sensenova-loop/blob/sensenova-loop/sensenova/README.md
- Parche de visión de referencia: https://huggingface.co/annelo/SenseNova-Loop-9B-Preview-Q4_K_M-Vision-GGUF/blob/main/runtime/03-sensenova-loop-vision.patch
- Conversión GGUF previa (Preview) del mismo ecosistema: https://huggingface.co/annelo/SenseNova-Loop-9B-Preview-Q4_K_M-Vision-GGUF
