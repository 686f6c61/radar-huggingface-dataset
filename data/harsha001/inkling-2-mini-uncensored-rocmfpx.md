# Harsha001/Inkling-2-Mini-Uncensored-ROCmFPX

## Resumen

Inkling-2-Mini-Uncensored-ROCmFPX es una redistribución cuantizada del modelo Inkling 2 Mini de Thinking Machines, publicada por el usuario Harsha001 en Hugging Face. El modelo original es un transformer de tipo Mixture-of-Experts (MoE) con 26.065.943.137 parámetros totales, 24 capas y 128 expertos por capa, de los cuales 8 se activan por token (aproximadamente 3.1B parámetros activos por pasada de capa). Se trata además de un modelo "looped": las capas 6 a 17 se ejecutan tres veces por token, de modo que cada token atraviesa 48 capas efectivas.

La aportación concreta de esta ficha es doble. Por un lado, incorpora la edición de "uncensoring" de AtomicChat, un LoRA de rango 1 aplicado sobre la salida de atención y los expertos enrutados de las 24 capas más el token embedding, que elimina la dirección de rechazo de cada capa. Por otro, empaqueta los pesos en los formatos ROCmFPX (ROCmFP4 y ROCmFPX de 8 bits) pensados para GPUs AMD vía Vulkan y ROCm, con especial atención al hardware Strix Halo. Los ficheros van desde 15.5 GB (4 bits) hasta 26.9 GB (8 bits).

Es relevante ahora porque ofrece una vía práctica para ejecutar un MoE de 26B en GPUs AMD de consumo y en APUs Strix Halo, algo poco habitual en el ecosistema, a costa de depender de un fork específico de llama.cpp y de asumir las implicaciones éticas y legales de un modelo deliberadamente "abliterated".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas "looped" (capas 6-17 repetidas 3 veces; 48 capas efectivas por token) |
| Parametros totales | 26.065.943.137 |
| Parametros activos | ~3.1B por pasada de capa (8 de 128 expertos activos por capa) |
| Longitud de contexto | no disponible (los ejemplos de ejecución usan `-c 16384`) |
| Tipos de cuantizacion | Q8_0 ROCmFPX (8 bits), Q6_K ROCmFPX (expertos 6 bits, resto 8 bits), Q4_0 ROCmFP4_STRIX_O8 (expertos 4 bits ROCmFP4, resto 8 bits ROCmFPX) |
| Idiomas soportados | no disponible (la model card menciona pruebas en inglés y ruso) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (formatos propietarios ROCmFPX/ROCmFP4, requieren fork de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 24 capas con 128 expertos por capa y enrutamiento top-8, lo que da unos 3.1B parámetros activos por pasada. La innovación estructural clave es el bucle de capas: las capas 6 a 17 se ejecutan tres veces por token, de forma que la profundidad efectiva es de 48 capas. Esta ficha incluye únicamente la parte de texto: el codificador de visión y el drafter de predicción multi-token del modelo original no están incluidos.

Sobre el entrenamiento del modelo original no se aportan detalles en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es el proceso de esta redistribución: se parte del checkpoint original, se fusiona el LoRA de uncensoring de AtomicChat (rango 1, fuerza 1) en precisión completa sobre las proyecciones down de los expertos, las salidas de atención y el token embedding en F32, manteniendo el resto de expertos NVFP4 tal cual, y después se recuantiza con `llama-quantize` aplicando escalas de potencia de dos por tensor (`.scale`) y un importance matrix derivado de una mezcla de prosa, código y chat. El resultado se empaqueta en los formatos ROCmFPX.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" controlable mediante el parámetro `reasoning_effort` del chat template, con valores `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` o un número entre 0 y 0.99 (por defecto 0.9).
- Respuestas a peticiones que el modelo original rechaza, fruto del LoRA de uncensoring.
- Capacidad multilingüe: la model card cita pruebas en inglés y ruso, aunque no se detalla la cobertura completa.
- Tool calling y uso como agente: la arquitectura lo soporta en teoría, pero la model card advierte que llama.cpp todavía no parsea el formato de mensajes de Inkling, por lo que las llamadas a herramientas no se interpretan correctamente en esta versión.
- No incluye visión ni predicción multi-token (componentes omitidos en esta distribución).

## Casos de uso

- Inferencia local en GPUs AMD de consumo: el fichero Q4_0 de 15.5 GB permite ejecutar un MoE de 26B en tarjetas de 24 GB (por ejemplo, RX 7900 XTX) usando el fork de llama.cpp con backend Vulkan o ROCm, algo inviable con modelos densos de ese tamaño.
- Despliegue en APUs Strix Halo: los tres ficheros están dimensionados para memoria unificada de 24-32 GB, lo que permite servir el modelo en un mini-PC sin GPU dedicada, con margen para contexto largo en la variante de 4 bits.
- Experimentación en investigación sobre alineación y rechazo: al eliminar la dirección de rechazo por capa, sirve para estudiar cómo se distribuye el comportamiento de negativa en un MoE con capas repetidas, comparando con el modelo original (MMLU 79.15% frente a 80.65%).
- Generación de texto creativo sin filtros: escritura de ficción, guiones o contenido narrativo donde los rechazos del modelo base resultan un obstáculo, aceptando la responsabilidad de uso que advierte el autor.
- Evaluación de cuantizaciones ROCmFPX: los datos de perplejidad y KL divulgados (Q8: KL 0.0039; Q6_K: 0.0046; Q4_0: 0.0119 sobre wikitext-2) permiten usar el modelo como banco de pruebas para medir la degradación de formatos de peso alternativos frente a GGUF estándar.
- Chat conversacional de propósito general en inglés: con `llama-server` y `--jinja`, el modo chat plano funciona correctamente, aunque las respuestas incluyen los marcadores propios de Inkling (`<|content_thinking|>`, `<|end_message|>`) sin separar el razonamiento de la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta distribución. Los únicos datos aportados son métricas de calidad de cuantización y una cifra de MMLU heredada de la model card de AtomicChat:

| Metrica | Referencia fusionada | Original | Q8_0 ROCmFPX | Q6_K ROCmFPX | Q4_0 ROCmFP4 |
|---|---:|---:|---:|---:|---:|
| Tamano | 50.5 GB | 22.9 GB | 26.9 GB | 21.6 GB | 15.5 GB |
| Perplejidad (wikitext-2) | 6.775 | 6.743 | 6.758 | 6.777 | 6.799 |
| KL a referencia | — | — | 0.0039 | 0.0046 | 0.0119 |
| Mismo token top | — | — | 97.4% | 96.9% | 95.2% |
| MMLU (modelo sin cuantizar) | 79.15% | 80.65% | no disponible | no disponible | no disponible |

La edición de uncensoring eleva la perplejidad de wikitext en aproximadamente un 0.5% (de 6.743 a 6.775).

## Requisitos de hardware

- VRAM estimada: 15.5 GB (Q4_0), 21.6 GB (Q6_K) y 26.9 GB (Q8_0) solo para pesos; hay que sumar la caché KV para el contexto deseado.
- GPUs recomendadas: APUs AMD Strix Halo (memoria unificada de 24-32 GB), GPUs AMD de 24-32 GB; el autor menciona Vulkan y ROCm/HIP como backends, pero advierte que ninguno de los dos se ha probado todavía (solo la ruta CPU está validada).
- Cabe en GPU de consumo AMD de 24 GB con la variante de 4 bits; en NVIDIA no está previsto, ya que los formatos ROCmFPX son específicos de AMD.
- Despliegue: exclusivamente mediante el fork ROCmFPX de llama.cpp, rama `inkling2-mini`, compilado con Vulkan o ROCm/HIP. No carga en llama.cpp upstream, y los ficheros de AtomicChat tampoco cargan en el fork por diferencias de layout de tensores. Ejemplo: `llama-server -m Inkling-2-Mini-Uncensored-Q4_0_ROCMFP4_STRIX_O8.gguf -ngl 99 -c 16384 --jinja`.
- Latencia y throughput: no disponibles; el autor pide a la comunidad que reporte velocidad y comportamiento en la pestaña Community.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-ROCmFPX | 26.1B (MoE) | ~3.1B | no disponible | Apache-2.0 | GGUF ROCmFPX, fork llama.cpp |
| thinkingmachines/Inkling-2-Mini (original) | 26.1B (MoE) | ~3.1B | no disponible | Apache-2.0 | safetensors, ecosistema estandar |
| AtomicChat/Inkling-2-Mini-Uncensored-GGUF | 26.1B (MoE) | ~3.1B | no disponible | Apache-2.0 | GGUF estandar, llama.cpp upstream |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada, por lo que la comparación se limita a las tres variantes del mismo modelo base.

## Limitaciones y advertencias

- Modelo "abliterated": responde a peticiones que el original rechaza; el autor declara explícitamente que la responsabilidad de uso recae en el usuario. No debe desplegarse en producción orientada al público sin filtros externos.
- Solo se ha validado la ruta CPU contra el modelo PyTorch original (coincidencia de ~5e-6 en un modelo de prueba pequeño, tokenizador idéntico); Vulkan y ROCm no se han probado, por lo que el rendimiento en GPU es desconocido.
- llama.cpp no tiene parser del formato de mensajes de Inkling: el razonamiento no se separa de la respuesta y las llamadas a herramientas no se interpretan. El uso como agente no está soportado en esta versión.
- Dependencia de un fork no oficial de llama.cpp: no hay compatibilidad con upstream ni con los GGUF de AtomicChat; el ecosistema de herramientas estándar (vLLM, TGI, Ollama) no puede cargar estos ficheros.
- La cuantización de 4 bits introduce una divergencia KL de 0.0119 y una coincidencia de token top del 95.2%, mayor que en las variantes de 8 y 6 bits.
- Cobertura idiomática no documentada; las pruebas citadas se limitan a inglés y ruso.
- Riesgo de alucinación no cuantificado en la información disponible; los benchmarks publicados se reducen a MMLU y perplejidad.
- La licencia Apache-2.0 del modelo base se mantiene, pero la edición de uncensoring y la redistribución no son releases oficiales de Thinking Machines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/Inkling-2-Mini-Uncensored-ROCmFPX
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Edición de uncensoring de AtomicChat: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Repositorio del fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
