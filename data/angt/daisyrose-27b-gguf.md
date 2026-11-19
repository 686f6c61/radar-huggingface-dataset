# angt/DaisyRose-27B-GGUF

## Resumen
DaisyRose-27B-GGUF es la conversión al formato GGUF del modelo RadixArk/DaisyRose-27B, un modelo multimodal de razonamiento de 27.000 millones de parámetros desarrollado por RadixArk (primer modelo publicado por este laboratorio). El modelo parte de Qwen3.8-27B y se post-entrena mediante aprendizaje por refuerzo sobre tareas de agente de horizonte largo, con el objetivo de mejorar la capacidad de resolución de tareas multi-paso en entornos de terminal y herramientas.

Esta versión GGUF, publicada por el usuario angt, está pensada para su uso con llama.cpp e incluye dos artefactos: el modelo principal cuantizado en Q4_K_M (con la capa de predicción multi-token integrada) y un proyector de visión en F16 para entradas de imagen. El contexto nativo es de 262.144 tokens, aunque la model card recomienda reducirlo si la memoria es limitada. La conversión se realizó desde el repositorio BF16 oficial (no desde la versión FP8) para evitar pérdida adicional de precisión.

La relevancia del modelo radica en su eficiencia de post-entrenamiento: se entrenó con solo 1.200 tareas curadas en 144 GPU H200 durante 18 días, usando el framework de RL asíncrono Miles de RadixArk. La licencia Apache-2.0 y el soporte multimodal lo hacen atractivo para experimentación local y despliegue en entornos con recursos moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B) con capa de predicción multi-token (MTP) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q4_K_M (modelo principal); F16 (proyector de vision) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo se basa en Qwen3.8-27B, un transformer multimodal con codificador de visión y proyector, al que se añade una capa de predicción multi-token (MTP) integrada en el GGUF principal. El post-entrenamiento se llevó a cabo con Miles, el framework de RL asíncrono de RadixArk, en modo totalmente asíncrono: 128 GPU H200 ejecutan la inferencia sobre tareas de agente mientras 16 GPU adicionales entrenan el modelo a partir de las trayectorias generadas, sin que ninguno de los dos procesos espere al otro. El conjunto de entrenamiento constó de 1.200 tareas curadas orientadas a agentes de horizonte largo, completadas en 18 días.

La conversión a GGUF se realizó con el commit `78e05298f0d68abff41d08d79fa7469264b2aff0` de llama.cpp, usando cuantización Q4_K_M estándar sin imatrix. El converter preserva la plantilla de chat, el tokenizador, los valores por defecto de generación y los tensores MTP. La validación reportada incluye una respuesta correcta a un prompt aritmético y la identificación correcta de una imagen de prueba.

## Capacidades
- Generación de texto y razonamiento multi-paso.
- Procesamiento de imagen y texto combinados (image-text-to-text) mediante el proyector `mmproj`.
- Razonamiento orientado a agentes y tareas de horizonte largo (entrenamiento específico en Terminal-Bench).
- Uso de herramientas y entornos de terminal (capacidad inferida del entrenamiento en tareas de agente; no se detalla soporte explícito de function calling en la información disponible).
- Predicción multi-token (MTP) integrada para decodificación especulativa.
- Contexto largo de hasta 262.144 tokens.
- Capacidades multilingües: no disponible.

## Casos de uso
- Automatización de tareas en terminal: el modelo fue post-entrenado específicamente en tareas de agente de horizonte largo y puede encadenar comandos y corregir errores en entornos de línea de comandos, lo que lo hace adecuado para pipelines de operaciones automatizadas.
- Asistencia en desarrollo de software: con 262.144 tokens de contexto puede analizar repositorios completos o trazas de error extensas y proponer parches, integrándose en flujos de trabajo locales vía llama.cpp.
- Análisis de documentos e imágenes: el proyector de visión permite extraer información de capturas de pantalla, diagramas o documentación escaneada junto a texto, útil para tareas de extracción y resumen.
- Despliegue en estaciones de trabajo sin GPU de datacenter: la cuantización Q4_K_M reduce el peso a aproximadamente 17 GB, permitiendo inferencia local en GPU de consumo de gama alta.
- Investigación en RL para agentes: sirve como checkpoint de referencia para reproducir o comparar metodologías de post-entrenamiento asíncrono en tareas de agente.
- Prototipado de asistentes conversacionales multimodales: el servidor de llama.cpp expone una API compatible con OpenAI (`/v1/chat/completions`), facilitando la integración en aplicaciones existentes.
- Evaluación de decodificación especulativa: la capa MTP integrada permite experimentar con técnicas de aceleración de inferencia en hardware limitado.

## Benchmarks y rendimiento
Los únicos datos publicados en la información disponible se refieren al modelo base antes de la conversión:

| Benchmark | Antes del post-entrenamiento | DaisyRose-27B |
|---|---|---|
| Terminal-Bench 4.1 (pass@1) | 5,6 % | 12,0 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: el GGUF Q4_K_M ocupa aproximadamente 17 GB (tamaño del repo: 17,9 GB incluyendo el proyector F16); se recomienda al menos 20-24 GB de VRAM para contexto moderado.
- GPU recomendadas: H200 (usadas en el entrenamiento original), A100 40/80 GB, RTX 4090 (24 GB) para el modelo cuantizado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y previsiblemente en GPUs con 24 GB o más; para contextos de 262.144 tokens se necesita memoria muy superior.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), compatible con endpoints OpenAI; no se menciona soporte en vLLM, TGI, Ollama u otros en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| DaisyRose-27B-GGUF | 27,3 B | 262.144 | Sí | Apache-2.0 | GGUF |
| Qwen3.8-27B (base) | 27 B | no disponible | Sí | no disponible | safetensors |
| RadixArk/DaisyRose-27B (BF16) | 27,3 B | 262.144 | Sí | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- Riesgo de alucinación inherente a modelos generativos; no se documentan evaluaciones de fiabilidad específicas.
- Sesgos conocidos: no disponible.
- Idiomas soportados no documentados; el rendimiento fuera del inglés (u otros idiomas del corpus de Qwen3.8) no está verificado.
- El contexto nativo de 262.144 tokens requiere memoria muy elevada; la model card recomienda usar contextos menores en hardware limitado.
- La cuantización Q4_K_M puede degradar ligeramente la precisión respecto al BF16 original, especialmente en tareas de razonamiento fino.
- El modelo está orientado a tareas de agente; su comportamiento en conversación general no ha sido evaluado en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base y se recomienda revisar el `LICENSE` incluido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces
- Hugging Face (GGUF): https://huggingface.co/angt/DaisyRose-27B-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Versión FP8 del modelo base: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Licencia original: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Blog de RadixArk: https://www.radixark.com/blog/daisyrose-27b
- Artículo en TodayForAI: https://todayforai.com/en/items/art-d6667117-06c
- llama.cpp: https://github.com/ggml-org/llama.cpp
