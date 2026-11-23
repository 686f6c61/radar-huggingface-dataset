# Kling-Keye/Keye-VL-671B-A37B

## Resumen

Keye-VL-671B-A37B es un modelo de lenguaje multimodal de gran escala desarrollado por Kwai-Keye (equipo de Kuaishou) que procesa conjuntamente texto, imagen y vídeo. Con 671.500 millones de parámetros totales y 37.000 millones activos por token, se trata de un transformer de mezcla de expertos (MoE) orientado a tareas de comprensión y razonamiento visual complejo, incluido el vídeo. El pipeline declarado es `video-text-to-text` y la librería de referencia es Transformers con código personalizado.

El modelo se posiciona como el buque insignia de la familia Keye, por encima de las variantes densas de 8B (Keye-VL-8B-Preview y Keye-VL-1.5-8B). Según la model card, destaca en comprensión y generación de texto, percepción y razonamiento visual complejo, comprensión integral de vídeo y razonamiento matemático de nivel olímpico. Incorpora un modo de razonamiento explícito activable mediante el sufijo `/think` en el prompt.

Su relevancia actual radica en ser uno de los mayores modelos multimodales abiertos disponibles, con licencia Apache 2.0 y pesos publicados en safetensors, lo que permite inspección, ajuste fino y despliegue propio. El repositorio ocupa 674,2 GB, coherente con un modelo de esta escala en precisión FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); encoder visual heredado de Keye-VL-1.5 |
| Parametros totales | 671.531.439.984 (≈671,5B) |
| Parametros activos | ≈37B (A37B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (formato de despliegue documentado); no se detallan otras variantes |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (674,2 GB de repositorio) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder visual (VisionEncoder procedente de Keye-VL-1.5) con un backbone de lenguaje de tipo MoE de 671,5B parámetros totales y aproximadamente 37B activos. El entrenamiento se organiza en dos fases. En preentrenamiento se construyen las capacidades perceptivas con compute limitado, se aplica un pipeline automatizado de curación de datos multimodales (filtrado estricto, remuestreo y síntesis a gran escala de VQA estructurado con OCR, gráficos y tablas) y se incorporan datos sintéticos de cadena de pensamiento (CoT) durante el preentrenamiento continuado para preservar las habilidades de razonamiento.

En post-entrenamiento se valida empíricamente una ley de escala para datos de razonamiento en SFT: una mezcla de 50B tokens de datos instructivos y Long-CoT supera en rendimiento y estabilidad a 30B de datos solo instructivos. Se refina la calidad y estilo del CoT eliminando cadenas reflexivas redundantes (proceso interno que, según el autor, supera a GPT-4o) y se entrena un verificador dedicado (Keye Verifier) para validar consistencia del razonamiento y corrección de respuestas durante RL, con precisión superior a otros reward models y LLMs generales.

## Capacidades

- Generación de texto y razonamiento complejo, incluido modo de pensamiento activable con el sufijo `/think`.
- Percepción y razonamiento visual: descripción detallada de imágenes, OCR, interpretación de gráficos y tablas.
- Comprensión integral de vídeo (pipeline `video-text-to-text`).
- Razonamiento matemático de alto nivel (descrito como de nivel olímpico).
- Procesamiento conjunto de entradas multimodales (imagen + texto, vídeo + texto) en una misma conversación.
- Servicio compatible con la API de chat completions de OpenAI a través de SGLang (`/v1/chat/completions`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Análisis automatizado de vídeo: el modelo ingiere secuencias de vídeo junto con instrucciones textuales para generar descripciones, resúmenes o respuestas sobre el contenido, adecuado por su pipeline nativo `video-text-to-text`.
- Extracción de información de documentos escaneados: OCR y comprensión de tablas y gráficos permiten convertir facturas, informes o capturas en datos estructurados, gracias al pipeline de datos VQA estructurado usado en entrenamiento.
- Moderación de contenido visual a escala: la percepción visual entrenada sobre datos filtrados permite clasificar y describir imágenes y vídeos en pipelines de revisión.
- Asistencia en investigación científica: el razonamiento matemático de nivel olímpico y el modo CoT lo hacen utilizable para resolver problemas analíticos y verificar cadenas de razonamiento.
- Generación de descripciones accesibles: producción de texto alternativo detallado para imágenes y vídeos en plataformas de contenido.
- Despliegue en infraestructura propia de gran escala: al publicarse en safetensors con licencia Apache 2.0, puede servirse con SGLang en clústeres multi-nodo (documentado para 2 nodos de 8×H800 con TP=16) para cargas de inferencia multimodales internas.
- Evaluación comparativa de modelos multimodales: su escala y apertura permiten usarlo como referencia en estudios de razonamiento visuo-lingüístico.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible; la model card remite únicamente a imágenes comparativas (`figures/radar.png` y `figures/performance.png`) sin cifras textuales.

## Requisitos de hardware

- VRAM estimada: el repositorio en FP8 ocupa 674,2 GB, por lo que la inferencia requiere al menos ~675 GB de memoria agregada solo para pesos, más KV cache y buffers.
- GPU recomendadas: el despliegue documentado usa 2 nodos con 8×H800 cada uno (16 GPUs en total, `--tp-size 16`). No se documentan configuraciones con GPUs menores.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 3090, etc.) por el tamaño de pesos.
- Opciones de despliegue: SGLang (rama personalizada `keye-dpsk-infer-fp8-release`) con backend de atención FA3, `--trust-remote-code`, `--disable-radix-cache` y `--mem-fraction-static 0.8`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la configuración de referencia usa `--cuda-graph-max-bs 64` y carga multihilo con 32 threads.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Keye-VL-671B-A37B | 671,5B totales / ~37B activos | no disponible | Apache 2.0 | Pesos abiertos en HF |
| Keye-VL-1.5-8B | ~8B | no disponible | no disponible en la información | Pesos abiertos en HF |
| Keye-VL-8B-Preview | ~8B | no disponible | no disponible en la información | Pesos abiertos en HF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la model card solo indica que la versión 671B-A37B es la más capaz de la serie.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; el rendimiento en castellano no está documentado.
- Longitud de contexto no publicada, lo que impide planificar cargas con ventanas largas sin verificación previa.
- Riesgo de alucinación inherente a modelos generativos de gran escala; el autor mitiga parcialmente con un verificador dedicado en RL, pero no se documentan tasas.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Requisitos de infraestructura muy elevados (mínimo ~675 GB de pesos FP8 y 16 GPUs H800 en la configuración de referencia), lo que limita el uso a organizaciones con clústeres dedicados.
- Dependencia de código personalizado (`custom_code`, `--trust-remote-code`) y de una rama específica de SGLang, lo que añade riesgo de mantenimiento y de seguridad al ejecutar código remoto.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los pesos y del código personalizado incluidos en el repositorio.
- No se documenta soporte de tool calling ni de agentes, relevante si se planean integraciones con pipelines automatizados.

## Enlaces

- Hugging Face: https://huggingface.co/Kling-Keye/Keye-VL-671B-A37B
- Informe técnico (arXiv): https://arxiv.org/abs/2509.01563
- Repositorio GitHub: https://github.com/Kwai-Keye/Keye
- Rama SGLang de despliegue: https://github.com/Kwai-Keye/sglang/tree/keye-dpsk-infer-fp8-release
- Tutorial de despliegue: https://github.com/Kwai-Keye/sglang/blob/keye-dpsk-infer-fp8-release/scripts/deploy_keye_deepseek/DEPLOY_TUTORIAL.md
- Página principal: https://kwai-keye.github.io/
- X (Twitter): https://x.com/KwaiKeye
- Discord: https://discord.gg/4Q6AmzxpEK
- Keye-VL-8B-Preview: https://huggingface.co/Kwai-Keye/Keye-VL-8B-Preview
- Keye-VL-1.5-8B: https://huggingface.co/Kwai-Keye/Keye-VL-1_5-8B/
- Demo: https://huggingface.co/spaces/Kwai-Keye/Keye-VL-8B-Preview
