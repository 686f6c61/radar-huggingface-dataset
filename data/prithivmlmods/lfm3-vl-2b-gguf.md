# prithivMLmods/LFM3-VL-2B-GGUF

## Resumen

LFM3-VL-2B-GGUF es una cuantización en formato GGUF del modelo vision-language LFM3-VL-2B de Liquid AI, publicada por el usuario prithivMLmods en Hugging Face. El modelo base es un VLM compacto de aproximadamente 1,9 mil millones de parámetros diseñado para comprensión visual multilingüe en dispositivos edge, combinando el modelo de lenguaje LFM3-1.7B (arquitectura tri-híbrida de 24 capas) con un codificador visual híbrido de 164M de parámetros y un proyector de 25M.

Su relevancia radica en la combinación de un tamaño muy reducido con un contexto de 128K tokens, soporte de razonamiento paso a paso mediante etiquetas `<think>...</think>`, tool calling basado en XML y comprensión de vídeo a resolución nativa (2 fps). Según la model card, supera en promedio (71,4 sobre 62 benchmarks de visión) a modelos notablemente mayores como Gemma 4 12B o InternVL3.5-4B, lo que lo posiciona como una opción muy eficiente para inferencia local multimodal.

La versión GGUF permite ejecutar el modelo con llama.cpp y derivados (Ollama, LM Studio) en CPU y GPUs de consumo, con cuantizaciones desde Q3_K_L (967 MB) hasta BF16 (3,47 GB), además de un archivo mmproj para la parte visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida LFM3 (24 capas) + codificador visual híbrido de 164M + proyector de 25M |
| Parametros totales | 1.728.801.600 (safetensors del repo base); la model card indica 1,92B contando vision y proyector |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other") |
| Formato de pesos | GGUF (también disponible en BF16, MLX 4-bit y ONNX en otros repos) |

## Arquitectura y entrenamiento

El modelo combina un LLM tri-híbrido LFM3-1.7B de 24 capas —arquitectura que mezcla mecanismos de atención y capas convolucionales/recurrentes propias de Liquid AI— con un codificador de visión híbrido de 164M de parámetros y un proyector multimodal de 25M, lo que eleva el total a unos 1,92B de parámetros. Soporta vídeo a resolución nativa a 2 fps y un contexto de 128K tokens.

El entrenamiento parte del checkpoint LFM3-1.7B-Base (preentrenado con 22 billones de tokens en inglés según la notación anglosajona "22-trillion"), al que se aplicaron vision mid-training, ajuste fino supervisado (SFT), aprendizaje por refuerzo visual y destilación on-policy. El resultado soporta razonamiento paso a paso con `<think>...</think>`, tool calling en formato XML y búsqueda diferida de herramientas (deferred tool search). No se ha publicado información adicional sobre la composición exacta del dataset.

## Capacidades

- Comprensión multimodal imagen-texto (pipeline image-text-to-text) y análisis de vídeo a 2 fps con resolución nativa.
- Generación de texto conversacional multilingüe en 16 idiomas, incluido el castellano.
- Razonamiento paso a paso mediante modo thinking con etiquetas `<think>...</think>` (mejora de 62,1 a 71,4 en el promedio de benchmarks según la model card).
- Tool calling basado en XML y deferred tool search, apto para flujos agénticos.
- Tareas visuales específicas: grounding visual, comprensión de GUI, lectura de gráficos (ChartQA 92,7), razonamiento embodied y preguntas y respuestas sobre vídeo (ActivityNet-QA 71,2).
- Ajuste fino con TRL mediante SFT y GRPO.
- Inferencia eficiente en edge: alta tasa de prefill y bajo consumo de memoria.

## Casos de uso

- **Asistentes visuales en dispositivos edge**: con cuantizaciones de ~1 GB (Q4_K_M) ejecutables en portátiles y mini-PC, permite describir imágenes, documentos y escenas sin conexión a servicios en la nube.
- **Automatización de interfaces gráficas (GUI agents)**: su puntuación de 83,1 en GUI Understanding y el soporte de tool calling XML lo hacen adecuado para agentes que interpretan capturas de pantalla y ejecutan acciones en aplicaciones.
- **Extracción y análisis de gráficos y tablas**: ChartQA 92,7 indica buen rendimiento leyendo gráficos; útil para digitalizar informes y dashboards en flujos RAG multimodales.
- **Análisis de vídeo ligero**: la ingesta de vídeo nativo a 2 fps con contexto de 128K permite resumir o responder preguntas sobre clips largos (ActivityNet-QA 71,2) sin infraestructura costosa.
- **Atención al cliente multimodal multilingüe**: soporte de 16 idiomas y conversación multi-turno con contexto largo para gestionar consultas con imágenes adjuntas (capturas de errores, fotos de productos).
- **Razonamiento complejo en local**: el modo thinking permite tareas de planificación y razonamiento embodied (64,4) para robótica ligera o asistentes de tareas paso a paso.
- **Prototipado con llama.cpp/Ollama**: el formato GGUF facilita integrar el modelo en aplicaciones locales de escritorio o servidores pequeños sin dependencias de Python pesadas.

## Benchmarks y rendimiento

Datos publicados en la model card (promedio sobre 62 benchmarks de visión):

| Modelo | Puntuación media (62 benchmarks) |
|---|---|
| LFM3-VL-2B (con thinking) | 71,4 |
| LFM3-VL-2B (sin thinking) | 62,1 |
| Qwen3.5-4B | 73,4 |
| GPT-5.6 Luna | 73,4 |
| Gemma 4 12B | 71,7 |
| Gemini 3.5 Flash Lite | 70,0 |
| Qwen3.5-2B | 64,0 |
| InternVL3.5-4B | 61,1 |
| LFM2.5-VL-3B | 57,6 |
| MiniCPM-V 4.7 1B | 57,5 |
| Gemma 4 E2B | 53,6 |

Resultados destacados por benchmark: ChartQA 92,7, CV-Bench 88,8, GUI Understanding 83,1, Visual Grounding 77,3, BLINK 71,1, ActivityNet-QA 71,2, Embodied Reasoning 64,4.

Rendimiento de inferencia: más de 12.000 tokens/s de salida con 1.024 peticiones concurrentes en una única GPU NVIDIA B300 (dato del fabricante para el modelo base, no para la versión GGUF).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia GGUF: desde ~1 GB (Q3_K_L, 967 MB) hasta ~3,5 GB (BF16, 3,47 GB), más ~379 MB del archivo mmproj para la parte visual y memoria adicional para el KV cache (creciente con contextos largos de hasta 128K).
- Ejecutable en CPU modernas y en GPUs de consumo: una RTX 3060 de 12 GB o incluso portátiles con 8 GB de RAM afrontan la inferencia en cuantizaciones Q4/Q5 sin problemas.
- GPU recomendadas: no se requieren aceleradores de datacenter; para serving a escala (miles de peticiones concurrentes) el fabricante referencia la NVIDIA B300, pero para uso local basta hardware de consumo.
- Opciones de despliegue: llama.cpp (formato nativo de este repo), Ollama, LM Studio, Transformers (`transformers>=5.21.0`), vLLM, SGLang, MLX-VLM y ONNX Runtime (estos últimos con los pesos en otros formatos).
- Latencia y throughput: no disponibles para esta cuantización concreta; el dato de referencia del fabricante es >12.000 tokens/s agregados a 1.024 peticiones concurrentes en B300.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato GGUF oficial |
|---|---|---|---|---|
| LFM3-VL-2B | ~1,92B | 128K | LFM Open License v1.0 | Sí (este repo, de terceros) |
| Qwen3.5-2B | ~2B | no disponible | no disponible | no disponible |
| MiniCPM-V 4.7 1B | ~1B | no disponible | no disponible | no disponible |
| InternVL3.5-4B | ~4B | no disponible | no disponible | no disponible |

En rendimiento medio visual, LFM3-VL-2B (71,4) supera a Qwen3.5-2B (64,0), InternVL3.5-4B (61,1) y MiniCPM-V 4.7 1B (57,5) según la model card, manteniendo un tamaño contenido. Para datos de contexto y licencias de los competidores, no disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización GGUF es de un tercero (prithivMLmods), no oficial de Liquid AI; puede haber diferencias de calidad respecto a los pesos BF16 originales, especialmente en cuantizaciones agresivas como Q3.
- La licencia LFM Open License v1.0 no es una licencia estándar permisiva (Apache/MIT); conviene revisar sus términos antes de uso comercial, ya que impone condiciones específicas.
- El rendimiento en castellano puede ser inferior al del inglés, dado que la mayoría de benchmarks publicados se centran en tareas en inglés; el nivel de calidad por idioma no está detallado.
- Riesgo de alucinación inherente a modelos VLM pequeños, especialmente en grounding visual fino y texto dentro de imágenes; no se han publicado evaluaciones específicas de fiabilidad factual.
- El dato de throughput (>12.000 tokens/s en B300) corresponde al modelo base en condiciones de serving a gran escala; no es representativo del rendimiento en un portátil con llama.cpp.
- Los benchmarks comparativos provienen de la model card del fabricante y no han sido verificados de forma independiente.
- El uso de `custom_code` y la etiqueta de transformers con versión exigida (`>=5.21.0`) pueden complicar la integración en entornos con versiones fijadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/LFM3-VL-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
