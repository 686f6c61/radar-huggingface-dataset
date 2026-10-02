# roman220220/gemma-4-E2B-it-qat-phone-GGUF

## Resumen

gemma-4-E2B-it-qat-phone-GGUF es una compilación en formato GGUF del modelo Gemma 4 E2B instruct, publicada por el usuario roman220220 (vinculado al proyecto IPSupport) a partir de los pesos con entrenamiento consciente de cuantización (QAT) de Google. El modelo base declarado es google/gemma-4-E2B-it-qat-q4_0-unquantized, a su vez la versión QAT de google/gemma-4-E2B-it. Su objetivo es ofrecer un artefacto listo para llama.cpp, Ollama y aplicaciones móviles que ocupe menos que el GGUF oficial de Google (3,35 GB) sin degradar la calidad.

La build reduce el decodificador de texto a 2,86 GB, más 0,99 GB del proyectil multimodal (mmproj) que aporta las torres de visión y audio. La cuantización es mixta y por tensor: 149 capas lineales de texto en Q4_0 (byte a byte idénticas a las de Google), 126 en Q8_0, embeddings por capa en Q4_K y embeddings de tokens en Q6_K. Según el autor, la perplejidad medida sobre wikitext-2 baja a 42,24, frente a 46,47 del GGUF oficial y 43,63 de los pesos bf16 de referencia.

El repositorio declara 4.628.569.635 parámetros totales según safetensors y licencia Apache 2.0. Está pensado para despliegue en dispositivos con memoria limitada (teléfonos y portátiles) y cubre texto, visión y audio. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma 4 E2B); no se detalla la variante interna en la información disponible |
| Parámetros totales | 4.628.569.635 (~4,63 B) según safetensors |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta por tensor: Q4_0 (149 lineales del decodificador de texto), Q8_0 (126 lineales), Q4_K (embeddings por capa), Q6_K (embeddings de tokens) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyectil multimodal separado en `gemma-4-E2B-it-mmproj.gguf` |
| Tamaño del repositorio | 3,8 GB |
| Tamaño de los artefactos | Decodificador de texto 2,86 GB; mmproj 0,99 GB |
| Modelo base | google/gemma-4-E2B-it-qat-q4_0-unquantized |

## Arquitectura y entrenamiento

El modelo base es la versión QAT de Gemma 4 E2B instruct de Google: un transformer decoder entrenado con cuantización consciente para la rejilla Q4_0 de llama.cpp (según la model card, entrenado "a través de sus pesos de 4 bits"). El autor no describe la arquitectura interna más allá del nombre y del pipeline image-text-to-text, por lo que no se dispone de datos sobre número de capas, dimensión oculta, cabezas de atención ni mecanismos de atención alternativos (lineal, SSM, híbridos, etc.). Tampoco se informa del volumen de tokens de entrenamiento ni de la composición del dataset.

La innovación de esta build es la estrategia de cuantización por tensor, no un reentrenamiento. Partiendo del GGUF bf16 de google/gemma-4-E2B-it-qat-q4_0-unquantized, se aplicaron sobrescrituras `--tensor-type` con `llama-quantize`: las 149 capas lineales de texto del decodificador se dejaron en Q4_0 (la rejilla exacta para la que se entrenó el QAT, idéntica a la de Google), 126 capas lineales seleccionadas por sensibilidad medida (KL por MB) se subieron a Q8_0, la tabla de embeddings por capa se bajó a Q4_K y los embeddings de tokens se mantuvieron en Q6_K. El mmproj no se modifica: es el archivo original de Google. El código y las notas de laboratorio están publicados en el repositorio `rromenskyi/quant-ternary/gemma4-quant`. No se menciona ningún proceso de RLHF o DPO adicional.

## Capacidades

- Generación de texto conversacional, con plantilla de chat propia de Gemma 4 basada en tokens de control (`<|turn>`, `<|channel>`).
- Comprensión de imágenes mediante el mmproj: el autor verificó la descripción de una fotografía de un zorro ("a small mammal with reddish-orange fur").
- Reconocimiento y transcripción de audio mediante el mmproj: el autor verificó la transcripción literal de una locución ("the quick brown fox jumps over the lazy dog").
- Entrada multimodal image-text-to-text, con torres de visión y audio empaquetadas aparte del decodificador de texto.
- Ejecución en llama.cpp y en aplicaciones móviles, con requisitos de memoria reducidos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en el teléfono: con 2,86 GB de pesos, el decodificador cabe en la memoria de un móvil de gama alta y permite chat local sin conexión, algo crítico cuando no hay red o se exige privacidad de las conversaciones.
- Descripción de imágenes para accesibilidad: usando `llama-mtmd-cli` con el mmproj, el modelo puede describir fotografías capturadas por la cámara del dispositivo y convertirlas en texto para lectores de pantalla.
- Transcripción de audio en local: el mmproj de audio permite transcribir notas de voz o reuniones sin enviar el audio a un servidor externo, útil en entornos con requisitos de confidencialidad.
- Prototipado de pipelines multimodales en llama.cpp: los dos archivos GGUF (texto y mmproj) permiten levantar un endpoint image-text-to-text con `llama-cli --jinja` o `llama-mtmd-cli` en pocos minutos, sin necesidad de infraestructura GPU grande.
- Asistentes de campo desconectados: en escenarios industriales o rurales sin cobertura, un portátil con 4-5 GB de VRAM libre puede ejecutar el modelo para consultas de texto, lectura de etiquetas o señales mediante la torre de visión.
- Educacion y demostraciones: al ser una build pequeña y de licencia Apache 2.0, es adecuada para talleres donde se enseña cuantización, QAT y despliegue de modelos multimodales en hardware modesto.
- Integración en aplicaciones de escritorio macOS: mediante el stack LLMTray/MLX del mismo autor (con la build MLX hermana) o mediante llama.cpp para servir una API compatible con OpenAI en local.

## Benchmarks y rendimiento

El único dato de evaluación publicado por el autor es la perplejidad medida con `llama-perplexity` de llama.cpp sobre wikitext-2 (raw, split de test, 32 fragmentos de 512 tokens):

| Build | Tamaño | PPL | Diferencia frente a bf16 |
|---|---|---|---|
| bf16 de los pesos QAT maestros | 9,27 GB | 43,63 | — |
| google/gemma-4-E2B_q4_0-it.gguf (oficial) | 3,35 GB | 46,47 | +8,5 % |
| roman220220/gemma-4-E2B-it-qat-phone (esta build) | 2,86 GB | 42,24 | −1,4 % |

El autor advierte que una PPL ligeramente por debajo de la del bf16 está dentro del ruido del test, y que el modelo QAT fue entrenado a través de sus pesos de 4 bits. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible. Las verificaciones cualitativas reportadas (texto sobre el Imperio romano, descripción de una foto de un zorro, transcripción de una locución) no constituyen benchmarks cuantitativos.

## Requisitos de hardware

- VRAM estimada para texto: alrededor de 3 GB para los pesos de 2,86 GB más la caché KV y el overhead del runtime; en la práctica, 3-4 GB de memoria libre.
- VRAM estimada con visión y audio: sumar los 0,99 GB del mmproj, lo que sitúa el total en unos 4-5 GB.
- GPU de consumo: sí cabe en GPUs con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070) y en sistemas Apple Silicon con 8 GB unificados o más. El autor apunta explícitamente a uso en teléfonos.
- CPU: al ser un GGUF de llama.cpp, puede ejecutarse solo en CPU, aunque sin datos de tokens por segundo publicados.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama y el stack LLMTray para macOS. El repositorio está marcado como `endpoints_compatible`, por lo que puede exponerse tras una API compatible.
- Latencia y throughput: no disponible. No se han publicado medidas de tokens por segundo ni de tiempo a primer token.
- Requisito de runtime: `--jinja` es obligatorio; sin él, llama.cpp aplica una plantilla simplificada y el chat se rompe según la model card.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | PPL (wikitext-2) | Cuantización | Licencia |
|---|---|---|---|---|---|
| Esta build (phone-GGUF) | GGUF | 2,86 GB (+0,99 GB mmproj) | 42,24 | Mixta Q4_0/Q8_0/Q4_K/Q6_K | Apache 2.0 |
| google/gemma-4-E2B-it-qat-q4_0-gguf | GGUF | 3,35 GB | 46,47 | Q4_0 | Apache 2.0 |
| google/gemma-4-E2B-it-qat-q4_0-unquantized (bf16) | bf16 (GGUF de referencia) | 9,27 GB | 43,63 | Sin cuantizar | Apache 2.0 |
| roman220220/gemma-4-E2B-it-qat-phone-mlx | MLX | no disponible | no disponible | no disponible | Apache 2.0 |

Las tres primeras filas comparten los mismos pesos base QAT, por lo que la comparación mide el efecto de la cuantización, no diferencias de entrenamiento. No se dispone de comparaciones con modelos de otras familias del mismo tamaño (por ejemplo, alternativas de ~2-5 B parámetros) en la información proporcionada.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 me gusta en el momento de la consulta: la validación comunitaria es prácticamente nula y solo existen las comprobaciones cualitativas del autor.
- La build es una modificación de los pesos originales de Google, no una copia: cualquier divergencia de comportamiento respecto al GGUF oficial debe atribuirse a la cuantización por tensor aplicada.
- La cuantización mixta implica pérdida de precisión respecto al bf16. Aunque la PPL publicada es favorable, el propio autor reconoce que la diferencia está dentro del ruido del test y una métrica de perplejidad no cubre razonamiento, código o matemáticas.
- Sin `--jinja`, la plantilla de chat se rompe porque Gemma 4 usa tokens de control específicos; es un fallo de configuración frecuente en despliegues.
- Idiomas soportados no declarados: no hay garantía de calidad fuera de los idiomas que Google entrenó, y el repositorio no publica la lista.
- Longitud de contexto no disponible: no se puede planificar el truncado ni el dimensionado de la caché KV sin ese dato.
- Riesgo de alucinación inherente a un modelo generativo de tamaño pequeño (≈2B efectivos en la nomenclatura E2B), especialmente en tareas de conocimiento factual y transcripción con ruido.
- El mmproj de visión y audio es el archivo de Google sin cambios, pero su comportamiento depende de la versión de llama.cpp utilizada para `llama-mtmd-cli`.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos de la licencia de Gemma 4 de Google, ya que el modelo base procede de ella. El autor indica que la build mantiene la misma licencia que el modelo base.
- Uso en producción: no se han publicado medidas de latencia, throughput, consumo energético ni pruebas de estrés; cualquier despliegue real debería medirlas antes de comprometerse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roman220220/gemma-4-E2B-it-qat-phone-GGUF
- Build MLX hermana: https://huggingface.co/roman220220/gemma-4-E2B-it-qat-phone-mlx
- GGUF QAT oficial de Google: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Pesos QAT sin cuantizar (modelo base): https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Modelo instruct original: https://huggingface.co/google/gemma-4-E2B-it
- Código y notas de laboratorio (`docs/FINDINGS.md`, `e2b_phone.sh`, `gguf_types.py`): https://github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant
- LLMTray (aplicación local para macOS): https://www.ipsupport.us/llmtray/
- Repositorio LLMTray en GitHub: https://github.com/ipsupport-llc/llmtray
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
