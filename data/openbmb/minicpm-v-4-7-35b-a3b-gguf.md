# openbmb/MiniCPM-V-4.7-35B-A3B-gguf

## Resumen

MiniCPM-V 4.7 35B-A3B es un modelo multimodal (image-text-to-text) de la familia MiniCPM-V desarrollado por OpenBMB. Se trata del primer modelo de arquitectura MoE (Mixture of Experts) de la serie MiniCPM-V, con 34.659.889.792 parámetros totales y aproximadamente 3B parámetros activos por token. El repositorio documentado aquí es la versión cuantizada en formato GGUF para llama.cpp del modelo base `openbmb/MiniCPM-V-4.7-35B-A3B`, publicada bajo licencia Apache 2.0.

El modelo está diseñado para inferencia en dispositivo (on-device) sin pérdida apreciable de rendimiento, combinando la técnica Lookahead Expert Scheduling (LES) con cuantización fina por capas y muestreo especulativo DSpark. Según la model card, alcanza velocidades de decodificación superiores a 13 tokens/s con solo 3 GB de memoria en un iPhone 17 Pro Max. Soporta comprensión de imagen única, múltiples imágenes y vídeo, con compresión de tokens visuales mixta 4x/16x.

Su relevancia actual radica en que ofrece un equilibrio entre capacidades multimodales y eficiencia de inferencia: en modo Instruct, según el autor, obtiene una puntuación global superior en menos tiempo de inferencia que Qwen3.6 35B-A3B. El repositorio GGUF acumula más de 421.000 descargas y 467 likes, lo que indica una adopción significativa en la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal, primer MoE de la serie MiniCPM-V |
| Parámetros totales | 34.659.889.792 (~35B) |
| Parámetros activos | ~3B (variante A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ3_M, IQ3_XS, IQ4_NL, IQ4_XS, mix_q3gud_im |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base también ofrece BNB, AWQ y GPTQ |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 35B-A3B emplea una arquitectura MoE con aproximadamente 35B parámetros totales y ~3B activos, siendo el primer modelo de la familia MiniCPM-V en adoptar este diseño. El codificador visual incorpora la técnica de compresión temprana intra-ViT de LLaVA-UHD v4, que reduce los tokens visuales dentro del propio encoder para disminuir el coste computacional en las capas posteriores. Además, soporta compresión mixta de tokens visuales 4x/16x, lo que permite ajustar el nivel de detalle visual frente al coste de inferencia según la tarea.

El repositorio GGUF incluye dos conjuntos de ficheros con pesos idénticos byte a byte que difieren únicamente en la plantilla de chat embebida: los de la raíz tienen el modo thinking desactivado de forma fija (recomendado por el autor, ya que el modelo no está entrenado como modelo de razonamiento), mientras que los de la carpeta `thinking/` restauran la plantilla oficial con trazas `[Start thinking] … [End thinking]`. La eficiencia en dispositivo se apoya en Lookahead Expert Scheduling (LES), cuantización fina por capas y muestreo especulativo DSpark. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Comprensión de imagen única, múltiples imágenes y vídeo (pipeline image-text-to-text).
- Generación de texto conversacional a partir de entradas multimodales.
- Compresión de tokens visuales configurable (4x/16x) para equilibrar detalle y coste.
- Modo thinking opcional mediante los ficheros de la carpeta `thinking/`, que emiten una traza de razonamiento antes de responder.
- Inferencia en dispositivo en iOS, Android y HarmonyOS, con soporte day-0 para plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm.
- Integración con frameworks de inferencia SGLang, vLLM, llama.cpp y Ollama.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y API compatible con OpenAI mediante `llama serve`.
- Soporte de fine-tuning a través de SWIFT y LLaMA-Factory (según la model card del modelo base).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes multi-step: no disponible en la información proporcionada.

## Casos de uso

- Asistente visual en dispositivo móvil: el modelo puede ejecutarse en iOS, Android y HarmonyOS con cuantizaciones bajas (IQ4_XS, mix_q3gud_im), permitiendo descripción de imágenes y conversación multimodal sin conexión a la nube, gracias a sus ~3B parámetros activos y a LES.
- Descripción y análisis de imágenes en aplicaciones de accesibilidad: con compresión de tokens 16x se reduce el coste de inferencia para tareas de descripción general, mientras que 4x permite mayor detalle cuando se requiere.
- Procesamiento de vídeo para resumen de contenido: el soporte de vídeo del modelo permite generar descripciones o resúmenes de secuencias, adecuado para indexación de archivos multimedia.
- Despliegue local con llama.cpp u Ollama: mediante `llama serve -hf openbmb/MiniCPM-V-4.7-35B-A3B-gguf:Q4_K_M` se levanta un WebUI y una API compatible con OpenAI en el puerto 9931, útil para prototipos y entornos sin GPU dedicada de gran capacidad.
- Análisis documental con múltiples imágenes: la capacidad multi-imagen permite procesar páginas escaneadas o capturas en una misma conversación, con contexto suficiente para tareas de extracción y descripción.
- Evaluación comparativa de eficiencia en MLLM: el modelo sirve como referencia para medir la frontera de Pareto rendimiento-eficiencia en modo Instruct frente a alternativas MoE del mismo orden de magnitud.
- Integración en pipelines de CI/CD para validación visual: la API compatible con OpenAI y el soporte en vLLM/SGLang permiten incorporar comprobaciones automáticas sobre capturas o artefactos gráficos.

## Benchmarks y rendimiento

La model card indica que, en modo Instruct, MiniCPM-V 4.7 35B-A3B obtiene una puntuación global superior en menos tiempo de inferencia que Qwen3.6 35B-A3B, y que alcanza más de 13 tokens/s con 3 GB de memoria en un iPhone 17 Pro Max. Sin embargo, no se proporcionan cifras concretas de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | MiniCPM-V 4.7 35B-A3B | Referencia |
|---|---|---|
| Puntuación global (modo Instruct) | superior a Qwen3.6 35B-A3B, sin cifra | Qwen3.6 35B-A3B |
| Velocidad de decodificación en dispositivo | >13 tokens/s con 3 GB (iPhone 17 Pro Max) | no disponible |
| MMLU / HumanEval / GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere aproximadamente 32 GB de memoria unificada; para equipos más pequeños se recomienda IQ4_XS.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada.
- Inferencia en consumer GPU: no disponible; la model card enfatiza la ejecución en dispositivo móvil y memoria unificada (macOS/Windows con Llama app).
- Opciones de despliegue: llama.cpp (`llama cli`, `llama serve`, `llama-mtmd-cli`, `llama-server`), Ollama, vLLM, SGLang; también la app de escritorio Llama (macOS/Windows).
- Plataformas de chips soportadas: Rockchip, Houmo, Intel, AMD y Arm, con soporte day-0.
- Latencia y throughput: >13 tokens/s en iPhone 17 Pro Max con 3 GB de memoria; sin datos adicionales de latencia o throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B | ~35B | ~3B | no disponible | Apache 2.0 | GGUF, BNB, AWQ, GPTQ |
| Qwen3.6 35B-A3B | ~35B | no disponible | no disponible | no disponible | no disponible |

La model card cita Qwen3.6 35B-A3B como referencia directa de rendimiento-eficiencia en modo Instruct, pero no se dispone de datos suficientes para una comparativa completa con un tercer modelo alternativo.

## Limitaciones y advertencias

- El modelo no está entrenado como modelo de razonamiento; el autor recomienda usar los ficheros de la raíz con thinking desactivado. Activar la traza de pensamiento multiplica el número de tokens generados y requiere ajustar `-n`.
- `llama.cpp` inyecta siempre `enable_thinking` en la plantilla de chat, por lo que `--reasoning off` no tiene efecto sobre los ficheros de la raíz.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- Longitud de contexto: no disponible, lo que limita la planificación de cargas con documentos o vídeos largos.
- El repositorio ocupa 1.870,4 GB, por lo que la descarga completa de todas las cuantizaciones es inviable en la mayoría de entornos; conviene descargar solo el fichero necesario.
- Los ficheros `mmproj` son compartidos entre ambos conjuntos y no llevan plantilla de chat.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los componentes de terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Variante DSpark-gguf: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark-gguf
- GitHub MiniCPM-V: https://github.com/openbmb/MiniCPM-V
- GitHub llama.cpp-omni (LES): https://github.com/OpenBMB/llama.cpp-omni
- GitHub LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Documentación de despliegue MiniCPM-o: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md#supported-inference-and-training-frameworks-and-api
- App Llama: https://llama.app
