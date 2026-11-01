# Harsha001/Maya2-Native-GGUF

## Resumen

Maya2 Native GGUF es una cuantización en formato GGUF del modelo de síntesis de voz maya-research/maya2-native, un sistema de texto a voz (TTS) multilingüe centrado en lenguas indicas, realizada por el usuario Harsha001. El objetivo de esta conversión es permitir la ejecución del modelo mediante un runtime nativo en C++ (fork ROCmFPX de llama.cpp, basado en ggml), sin depender de Python ni de PyTorch. Esto resuelve un problema habitual en TTS neuronal: la dificultad de desplegar estos modelos en CPU, en GPUs vía Vulkan o en entornos con recursos limitados.

La arquitectura del modelo base se compone de tres bloques: un backbone transformer Qwen3 de 28 capas con 1.812 millones de parámetros totales (según los metadatos de safetensors), un depth decoder de 44 capas pequeñas agrupadas en 11 grupos que predice los códigos restantes de cada fotograma de audio, y el decodificador Mimi de Kyutai, que convierte 32 códigos por fotograma en audio a 24 kHz. Soporta 13 idiomas (inglés y 12 lenguas de la India) y ofrece 20 voces con nombre. Su relevancia actual radica en que es de los pocos TTS multilingües indicos ejecutables de forma nativa y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3 (28 capas) + depth decoder (44 capas en 11 grupos) + decodificador de audio Mimi |
| Parametros totales | 1.812.042.752 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | as, bn, en, gu, hi, kn, ml, mr, or, pa, ta, te |
| Licencia | Apache 2.0 (modelo base); el decodificador Mimi es CC-BY 4.0 |
| Formato de pesos | GGUF (backbone + archivo mmproj con depth decoder y decodificador Mimi) |

## Arquitectura y entrenamiento

El sistema sigue un diseño de dos etapas de generación de códigos acústicos. El backbone, basado en Qwen3 con 28 capas transformer, lee el texto de entrada y predice el código 0 de cada fotograma de audio. A continuación, un depth decoder compuesto por 44 capas transformer pequeñas organizadas en 11 grupos predice los códigos 1 a 31 de cada fotograma. Finalmente, el decodificador Mimi (de Kyutai) transforma los 32 códigos por fotograma en audio a 24 kHz. La configuración de muestreo y la regla de parada replican las del motor de referencia en PyTorch.

Sobre el entrenamiento del modelo base maya-research/maya2-native (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada. La ficha de la cuantización sí documenta la fidelidad frente a la referencia en PyTorch mediante teacher forcing: en F32 la similitud coseno de los logits es de 0,9999998 y en Q8_0 de 0,9997, con 54 de 55 coincidencias en la elección top; Whisper transcribe palabra por palabra la salida libre de todas las cuantizaciones en inglés, y la salida en hindi fue verificada con tres semillas.

## Capacidades

- Sintesis de texto a voz en 13 idiomas: inglés (en) y 12 lenguas indicas: hindi (hi), bengalí (bn), tamil (ta), telugu (te), kannada (kn), malayalam (ml), maratí (mr), gujarati (gu), punjabí (pa), odia (or), asamés (as).
- 20 voces con nombre seleccionables (Ahana, Vaidehi, Malini, Charvi, Jahnavi, Anirban, Nakul, Vasant, Siddhant, Satvik, Abhay, Nivedita, Ishwari, Ritvik, Vrinda, Sreekar, Kayal, Shaunak, Akshat, Tanushree), indicadas al inicio del prompt con el formato `{Nombre}:`.
- Generación determinista mediante semilla (`-s <seed>`), que produce el mismo audio en cada ejecución.
- Ejecución nativa en C++ (ggml) sin Python ni PyTorch, sobre CPU, Vulkan (incluida AMD Strix Halo) y CUDA.
- Cuantización agresiva (Q4_K_M, 1,1 GB) con salida que se transcribe palabra por palabra correctamente según Whisper en inglés.
- Velocidad de generación de unos 40 fotogramas por segundo en NVIDIA GB10 con Q4_K_M, es decir, 3,2 veces más rápido que el tiempo real (el modelo produce 12,5 fotogramas por segundo de audio).

## Casos de uso

- Locución de contenido educativo en lenguas indicas: el soporte de 12 lenguas de la India permite generar narraciones para cursos y material didáctico en hindi, tamil, telugu o bengalí sin depender de locutores humanos.
- Asistentes de voz locales y sin conexión: al ejecutarse en C++ puro sobre CPU o Vulkan, puede integrarse en dispositivos edge o aplicaciones de escritorio que requieran TTS offline.
- Atención al cliente telefónica multilingüe en India: la generación 3,2 veces más rápida que el tiempo real permite usarlo en pipelines de voz interactivos con latencia aceptable.
- Producción de audio para medios regionales: la selección de 20 voces con nombre facilita asignar voces consistentes a distintos personajes o presentadores en podcasts y noticias.
- Sistemas de accesibilidad: conversión de texto a habla para lectores de pantalla en lenguas indicas poco cubiertas por los TTS comerciales.
- Integración en pipelines de CI/CD o servicios backend: al no requerir Python ni PyTorch, el binario `llama-tts` puede desplegarse en contenedores ligeros o servidores sin stack de ML.
- Reproducibilidad en pruebas automatizadas: la semilla fija permite regenerar exactamente el mismo audio, útil para tests de regresión en aplicaciones de voz.
- Investigación en TTS para lenguas de bajos recursos: la licencia Apache 2.0 y la disponibilidad de pesos en GGUF facilitan experimentación y fine-tuning posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MOS, MMLU, etc.) en la información disponible. Los únicos datos cuantitativos publicados son de fidelidad frente a la referencia PyTorch (teacher forcing, frase de prueba en inglés, 54 fotogramas) y de velocidad:

| Backbone / mmproj | Coseno logits backbone | Coseno logits depth | Coseno audio | Coincidencias top |
|---|---|---|---|---|
| F32 / F32 | 0,9999998 | 0,9999999 | 0,9999999 | 55 / 55 |
| BF16 / BF16 | 0,999997 | 0,99999 | 0,9999995 | 55 / 55 |
| Q8_0 / Q8_0 | 0,9997 | 0,9995 | 0,99999 | 54 / 55 |
| Q4_K_M / Q8_0 | 0,986 | 0,994 | 0,99999 | 50 / 55 |

En velocidad, sobre NVIDIA GB10 (CUDA, Q4_K_M) se alcanzan unos 40 fotogramas por segundo, 3,2 veces el tiempo real. No hay mediciones propias para Vulkan en Strix Halo (los números comunitarios no se incluyen en la ficha).

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: el repo completo ocupa 9,0 GB, pero para ejecutar solo se necesita un backbone y un mmproj: Q4_K_M + mmproj Q8_0 son unos 1,9 GB; Q8_0 + mmproj Q8_0, unos 2,7 GB; BF16 + mmproj BF16, unos 5,1 GB.
- GPU recomendadas: cualquier GPU con soporte Vulkan (incluida la iGPU AMD Strix Halo) o NVIDIA con CUDA. Se ha verificado velocidad sobre NVIDIA GB10.
- Consumer GPUs: dado que la configuración recomendada (Q8_0) requiere menos de 3 GB, cabe con holgura en GPUs como RTX 3060 de 12 GB, RTX 4060 o incluso en CPU con RAM convencional.
- Despliegue: exclusivamente mediante el fork ROCmFPX de llama.cpp, compilando el objetivo `llama-tts` (con `-DGGML_VULKAN=ON` para Vulkan). No hay soporte documentado para vLLM, TGI u Ollama.
- Latencia y throughput: unos 40 fotogramas por segundo en GB10 con Q4_K_M frente a 12,5 fotogramas por segundo de audio, es decir, 3,2 veces tiempo real. No hay datos de latencia para otros backends.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Parametros | Formato | Licencia |
|---|---|---|---|---|---|
| Maya2 Native GGUF (este) | TTS neuronal | 13 (en + 12 indicas) | 1.812 M | GGUF | Apache 2.0 (Mimi: CC-BY 4.0) |
| kyutai/mimi (componente) | Códec neuronal de audio | no disponible | no disponible | safetensors | CC-BY 4.0 |
| maya-research/maya2-native (base) | TTS neuronal | 13 (en + 12 indicas) | 1.812 M | safetensors | Apache 2.0 |

No hay disponibles en la información proporcionada alternativas TTS indicas comparables con datos suficientes para una comparación de rendimiento.

## Limitaciones y advertencias

- El modelo está orientado a lenguas indicas e inglés; no sirve para lenguas fuera de esa lista.
- La cuantización Q4_K_M reduce la coincidencia de logits (coseno 0,986 y 50/55 en top choice), por lo que para máxima fidelidad de voz se recomienda Q8_0 o BF16.
- La verificación cualitativa de la salida en hindi se hizo solo con tres semillas; la calidad en las demás lenguas indicas no está documentada en la ficha.
- No hay mediciones de velocidad oficiales para Vulkan en Strix Halo; los números comunitarios no están publicados.
- La ejecución requiere el fork ROCmFPX de llama.cpp, no el llama.cpp estándar, lo que añade una dependencia de mantenimiento de terceros.
- Licencias mixtas: el modelo base es Apache 2.0, pero el decodificador de audio Mimi es CC-BY 4.0, que exige atribución; debe revisarse el cumplimiento si se redistribuye el sistema completo.
- No hay datos sobre sesgos, tasa de alucinación o calidad prosódica en producción; al ser un modelo TTS de 1.800 millones de parámetros para lenguas de bajos recursos, conviene validar la naturalidad y la pronunciación por idioma antes de uso en producción.
- No es un modelo de texto: no tiene capacidades de generación de texto, razonamiento, código ni tool calling; su pipeline es exclusivamente text-to-speech.

## Enlaces

- Ficha de la cuantización GGUF: https://huggingface.co/Harsha001/Maya2-Native-GGUF
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- llama.cpp (proyecto base del runtime): https://github.com/ggml-org/llama.cpp
- Decodificador de audio Mimi: https://huggingface.co/kyutai/mimi
