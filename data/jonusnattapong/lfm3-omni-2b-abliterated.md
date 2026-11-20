# JonusNattapong/LFM3-Omni-2B-abliterated

## Resumen

LFM3-Omni-2B-abliterated es un ajuste fino del modelo omnimodal LFM3-Omni-2B de Liquid AI, publicado por el usuario JonusNattapong en Hugging Face. Se trata de una versión "abliterated" (sin censura) en la que se han eliminado los vectores de dirección de rechazo mediante proyección ortogonal sobre las matrices de pesos del transformer, manteniendo intactas las proyecciones de los tokenizadores de audio y visión. El modelo conserva la arquitectura híbrida de convolución y atención de Liquid AI y sus capacidades nativas de texto, imagen y audio.

Con 2.166.928.384 parámetros (aproximadamente 2,1 mil millones), el modelo está pensado para tareas any-to-any: entrada y salida de texto, imagen y audio, incluyendo speech-to-speech. Su relevancia actual radica en que ofrece un modelo omnimodal de pequeño tamaño, ejecutable en hardware de consumo, sin las restricciones de rechazo del modelo base, lo que lo hace atractivo para investigación en seguridad, ingeniería de casos límite y despliegues donde el modelo base resulta demasiado restrictivo.

El ajuste se distribuye en formato safetensors BF16 (28,6 GB de repositorio) y cuenta con variantes GGUF para llama.cpp y Ollama, además de una versión con Adaptive CoT (razonamiento dinámico fast/deep). La licencia es lfm1.0, heredada del modelo base, con las restricciones que ello implica para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida convolución + atención transformer (LFM3 de Liquid AI) |
| Parámetros totales | 2.166.928.384 (≈2,1 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (safetensors), GGUF Q8_0 y Q4_K_M (repositorio GGUF), GGUF v8 Adaptive CoT |
| Idiomas soportados | en, th, ar, zh, fr, de, it, ja, ko, pt, es, vi, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (BF16), GGUF (llama.cpp/Ollama) |

## Arquitectura y entrenamiento

El modelo se basa en LFM3-Omni-2B de Liquid AI, que emplea una arquitectura híbrida que combina capas de convolución con capas de atención transformer. Esta combinación busca reducir el coste computacional de la atención completa manteniendo la capacidad de modelado de dependencias de largo alcance. El modelo es omnimodal: integra tokenizadores específicos para audio y visión (`audio_tokenizer`, `mmproj`) junto al tokenizador de texto, lo que permite entrada y salida en múltiples modalidades.

El proceso de abliteración consistió en identificar vectores de dirección de rechazo mediante pares de prompts contrastivos (neutros frente a prompts que disparan rechazo en consultas de seguridad e ingeniería), y restarlos de las matrices de proyección clave de las capas mediante proyección ortogonal: W_abliterated = W − (W · v̂) ⊗ v̂. Las proyecciones de los tokenizadores de audio y visión y los hiperparámetros arquitectónicos se mantuvieron intactos para preservar las capacidades no textuales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el ajuste; el autor solo documenta el método de abliteración.

## Capacidades

- Generación de texto y razonamiento, incluyendo respuestas directas sin rechazo a consultas técnicas y de seguridad.
- Procesamiento de imagen (image-text-to-text) mediante el pipeline any-to-any.
- Procesamiento de audio, incluyendo speech-to-speech, gracias a los tokenizadores de audio nativos.
- Soporte de tool calling / function calling: la variante v8 Adaptive CoT reporta una precisión de esquema del 96,0 % y una tasa de coincidencia exacta de herramientas del 92,0 %.
- Razonamiento multi-paso y modo de pensamiento adaptativo en la variante v8 (rutas fast y deep).
- Capacidades multilingües en 23 idiomas, con especial atención al tailandés (el autor incluye descripción y evaluación en tailandés).
- Formato de chat compatible con la plantilla de cabeceras de Llama-3 (`<|start_header_id|>...<|end_header_id|>`).

## Casos de uso

- Investigación en seguridad ofensiva y defensiva: el modelo responde a consultas sobre inyección SQL ciega, exploits y remediación técnica sin rechazos, lo que lo hace útil para formación en seguridad y análisis de vulnerabilidades en entornos controlados.
- Atención al cliente automatizada multimodal: al aceptar texto, imagen y audio, puede gestionar conversaciones multi-turno donde el usuario adjunta capturas o mensajes de voz, aunque la longitud de contexto no está documentada.
- Asistentes de voz en tiempo real: la capacidad speech-to-speech y el tamaño de 2,1 B permiten despliegues de baja latencia en local para transcripción, respuesta hablada y diálogo por voz.
- Generación de código y automatización de pipelines: con tool calling y function calling, puede integrarse en flujos de CI/CD para invocar herramientas, consultar APIs y ejecutar tareas de razonamiento multi-paso.
- Procesamiento de documentos con imagen y texto: extracción y razonamiento sobre capturas, diagramas o formularios combinados con instrucciones textuales, aprovechando el pipeline any-to-any.
- Evaluación comparativa de alineación y censura: sirve como contrapunto al modelo base para estudiar el efecto de la abliteración en la calidad de las respuestas, el razonamiento y la preservación de modalidades.
- Despliegue en hardware de consumo: las variantes GGUF Q4_K_M y Q8_0 permiten ejecutar el modelo en llama.cpp u Ollama en equipos con GPU de gama media o incluso CPU, para prototipos y demos locales.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan la versión v6 (base abliterada) con la v8 (Adaptive CoT), sobre 145 casos de prueba reproducibles (290 generaciones):

| Dimensión | v6 (base abliterada) | v8 (Adaptive CoT) | Delta |
|---|---|---|---|
| Precisión de enrutamiento adaptativo | 35,0 % | 75,0 % | +40,0 % |
| Precisión fast-path | 70,0 % | 95,0 % | +25,0 % |
| Precisión deep-CoT | 0,0 % | 55,0 % | +55,0 % |
| Precisión de esquema en tool calling | 34,0 % | 96,0 % | +62,0 % |
| Tasa de coincidencia exacta de herramientas | 32,0 % | 92,0 % | +60,0 % |
| Precisión matemática GSM8K-TH | 50,0 % | 73,3 % | +23,3 % |
| Comprensión de QA en tailandés | 36,7 % | 43,3 % | +6,7 % |
| Tasa de rechazo técnico | 0,0 % | 0,0 % | empate |
| Latencia fast-path | 6,51 s | 3,40 s | −3,12 s |
| Errores de ejecución | 0 | 0 | empate |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K en inglés) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,3 GB solo para pesos (2,166 B × 2 bytes), más overhead de activaciones y tokenizadores multimodales; en la práctica se recomienda al menos 8-12 GB para contexto moderado.
- Cuantización Q8_0 GGUF: aproximadamente 2,3 GB de pesos; Q4_K_M: aproximadamente 1,3 GB.
- GPU recomendadas: A100 o H100 para BF16 con contexto largo y despliegue concurrente; RTX 4090, RTX 3090 o RTX 4080 para BF16 en local; GPUs de 8 GB o menos para cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones Q4_K_M y Q8_0; en BF16 es viable en GPUs de 12 GB o más.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), llama.cpp, Ollama (variantes GGUF), y potencialmente vLLM o TGI si soportan la arquitectura LFM3 (no confirmado en la información disponible).
- Latencia y throughput: el autor reporta latencias de 6,51 s (v6) y 3,40 s (v8) en fast-path, sin especificar hardware ni longitud de salida; no hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-abliterated | 2,1 B | no disponible | texto, imagen, audio | lfm1.0 | Sin censura, abliterado |
| LiquidAI/LFM3-Omni-2B (base) | 2,1 B | no disponible | texto, imagen, audio | lfm1.0 | Modelo original con rechazos |
| LFM3-Omni-2B-Adaptive-CoT-GGUF (v8) | 2,1 B | no disponible | texto, imagen, audio | lfm1.0 | Ajuste con razonamiento adaptativo del mismo autor |
| Alternativas omnimodales de ~2 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- La abliteración elimina los rechazos, lo que implica que el modelo puede generar contenido dañino, instrucciones peligrosas o material ilegal; no debe desplegarse en producción orientada al público sin filtros externos.
- Riesgo de alucinación no cuantificado: no hay datos de benchmarks estándar que permitan estimar la fiabilidad factual.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con conversaciones largas o documentos extensos.
- La licencia lfm1.0 es "other" y puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del modelo base antes de cualquier explotación comercial.
- El ajuste se realizó sobre un modelo de 2,1 B, por lo que su capacidad de razonamiento complejo y matemáticas avanzadas es limitada en comparación con modelos de mayor tamaño.
- Los benchmarks publicados son internos del autor (145 casos, 290 generaciones) y no han sido validados de forma independiente; además, la comparación v6/v8 no equivale a una evaluación frente a modelos de referencia.
- El soporte multilingüe declarado (23 idiomas) no está respaldado por evaluaciones por idioma salvo el tailandés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de usarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Mirror BF16: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated-BF16
- Variante GGUF: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated-GGUF
- Variante Adaptive CoT GGUF (v8): https://huggingface.co/JonusNattapong/LFM3-Omni-2B-Adaptive-CoT-GGUF
- Licencia LFM 1.0: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated/blob/main/LICENSE
