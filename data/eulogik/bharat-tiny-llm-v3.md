# eulogik/Bharat-Tiny-LLM-v3

## Resumen

Bharat-Tiny-LLM v3 es un modelo de lenguaje de 1.720 millones de parámetros desarrollado por eulogik, orientado a generación de texto bilingüe en hindi, hinglish e inglés sobre dispositivos con recursos limitados. Se construye a partir de Qwen3-1.7B-Base mediante la inyección de 300 tokens subpalabra en devanagari, un calentamiento de los embeddings nuevos y un ajuste fino supervisado sobre problemas matemáticos en hindi (GSM8K-Hindi) y datos de question answering índicos.

El modelo aborda un problema concreto: la mayoría de los SLM disponibles tokenizan el devanagari de forma ineficiente y rinden mal en tareas de razonamiento en hindi. La inclusión de vocabulario devanagari reduce el número de tokens necesarios para representar texto hindi, lo que abarata la inferencia en el borde. Se distribuye en GGUF Q4_K_M de 1,0 GB, lo que permite ejecución offline en teléfonos, portátiles y navegador vía WebGPU.

La relevancia actual reside en su licencia Apache-2.0, su tamaño reducido y su soporte de despliegue en llama.cpp, Ollama y transformers.js. No obstante, la propia model card incluye una corrección de noviembre de 2026 que retira dos métricas anteriores (56 % en GSM8K-Hindi y −26,6 % en bits/char); las cifras vigentes son sustancialmente peores y deben tenerse en cuenta al evaluar el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B-Base) |
| Parámetros totales | 1.720.642.560 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M, GGUF F16; safetensors en precisión original |
| Idiomas soportados | hindi (hi), inglés (en), hinglish |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only de 1,7B parámetros. La modificación principal es la ampliación del vocabulario con 300 tokens subpalabra en devanagari, minados a partir de un corpus de 305.000 filas de hindi y hinglish. La inicialización de los embeddings nuevos se realiza con la media de los embeddings de los tokens de byte correspondientes, seguida de un calentamiento de 3.000 pasos con SGD y momento, incluyendo una comprobación de NaN ("poison-gate") para evitar divergencias.

Sobre esa base se ejecuta un SFT de 35.000 filas combinando GSM8K-Hindi, IndicVault y muestras propias, con LoRA de rango 32 y entrenamiento distribuido en 2×T4 (DDP). El pipeline completo se ejecutó en hardware de consumo (Kaggle 2×T4, aproximadamente 6 horas de GPU para el SFT). Existe además una variante conversacional v3.3 entrenada con 370 filas de chat curadas (evol-hindi, hinglish e identidad), r=8 y 2 épocas, que mejora el chat en hinglish a costa del rendimiento matemático.

## Capacidades

- Generación de texto conversacional en hindi, hinglish e inglés.
- Razonamiento matemático básico sobre problemas verbales en hindi (GSM8K-Hindi), con rendimiento limitado.
- Question answering sobre dominio índico, apoyado en los datos de IndicVault.
- Compresión de tokenización en devanagari: 36,9 % de reducción de tokens frente al tokenizador base; 17,7 % en texto mixto hinglish+hindi.
- Soporte de tool use y RAG según los tags de la model card (sin detalles técnicos publicados).
- Despliegue en el borde: llama.cpp, Ollama, llama-cpp-python y transformers.js con WebGPU.
- Ejecución completamente offline, sin llamadas a API externas.
- Capacidad multilingüe limitada a los idiomas declarados (hi, en); no se documentan otros.

## Casos de uso

- Asistentes conversacionales offline en dispositivos móviles: el GGUF Q4_K_M de 1,0 GB cabe en memoria de un teléfono de gama media y permite conversación en hindi sin conexión, manteniendo los datos en el dispositivo.
- Atención al cliente en hindi para pymes: despliegue en Ollama o llama.cpp sobre un servidor modesto para responder consultas frecuentes en hindi e hinglish, con la ventaja de la licencia Apache-2.0 para uso comercial.
- Aplicaciones web privadas con WebGPU: la demo oficial ejecuta el modelo íntegramente en el navegador del cliente, útil para formularios o asistentes donde no se pueden enviar prompts a un servidor.
- Tutoría de matemáticas básicas en hindi: el modelo resuelve una parte de GSM8K-Hindi (29 % en n=100, 4-shot, llama.cpp/Q4), adecuado como apoyo con verificación humana, no como sistema autónomo.
- Procesamiento de documentos en devanagari: la tokenización ampliada reduce el coste por token en un 36,9 %, lo que abarata tareas de resumen o extracción sobre corpus hindi en entornos con presupuesto de cómputo ajustado.
- Prototipado e investigación en NLP índico: al ser un fine-tune de Qwen3-1.7B con pesos safetensors y licencia permisiva, sirve como base para experimentos académicos sobre tokenización devanagari y ajuste fino de bajo coste.
- Integración en pipelines de CI/CD para generación de texto en hindi: su formato GGUF y su compatibilidad con llama-cpp-python permiten incorporarlo como paso de generación en herramientas internas sin dependencias de servicios cloud.

## Benchmarks y rendimiento

| Métrica | Qwen3-1.7B base | Bharat-Tiny-LLM v3 |
|---|---:|---:|
| GSM8K-Hindi (n=100, 4-shot, greedy) | no disponible | 29 % (llama.cpp/Q4); 2 % (torch) |
| Bits/char (corregido, 60 ventanas) | 1,20 | 1,71 (peor) |
| Compresión de tokens en devanagari | no disponible | 36,9 % |
| Ahorro en texto mixto hinglish+hindi | no disponible | 17,7 % |
| Parámetros | 1,7B | 1,72B |
| Tamaño Q4_K_M | no disponible | 1,0 GB |

Nota: la model card retira explícitamente las cifras anteriores de 56 % en GSM8K-Hindi y −26,6 % en bits/char. La variante v3.3 conversacional presenta un rendimiento matemático inferior al de v3 según la auditoría publicada. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,0 GB en Q4_K_M; alrededor de 3,2 GB en F16; en torno a 3,4 GB en safetensors a precisión completa (más overhead de activaciones y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M; T4, RTX 3060/4060 o superiores para F16. El entrenamiento original se realizó en 2×T4.
- Cabe en GPU de consumo: sí, en RTX 3050/3060/4060 y equivalentes con Q4_K_M; también en iGPU y en navegador con WebGPU.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, llama-cpp-python, transformers.js con WebGPU, Transformers con safetensors y text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Bharat-Tiny-LLM v3 | 1,72B | no disponible | hi, en, hinglish | Apache-2.0 | safetensors, GGUF |
| Qwen3-1.7B-Base | 1,7B | no disponible | multilingüe (no detallado) | no disponible | safetensors |
| Bharat-Tiny-LLM v2 (Qwen2.5-1.5B) | ~1,5B | no disponible | hi, en | no disponible | no disponible |

La comparación con Qwen3-1.7B-Base es la más directa: Bharat v3 añade 300 tokens devanagari y SFT específico, con una compresión de tokens del 36,9 % en hindi, a costa de un empeoramiento en bits/char (1,71 frente a 1,20). Frente a v2, la model card indica que v2 obtenía 0 % en GSM8K-Hindi mientras v3 alcanza el 29 %. No se dispone de datos de benchmarks comparativos con otros SLM índicos en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento matemático bajo: 29 % en GSM8K-Hindi (n=100, 4-shot, llama.cpp/Q4) y solo 2 % en torch, lo que desaconseja su uso autónomo en tareas de cálculo.
- Métricas retiradas: la model card corrige afirmaciones previas de 56 % en GSM8K-Hindi y −26,6 % en bits/char; la compresión real de bits/char es peor que la del modelo base (1,71 frente a 1,20).
- La variante v3.3 conversacional reduce el rendimiento matemático respecto a v3.
- Riesgo de alucinación inherente a un modelo de 1,7B con SFT limitado (35.000 filas); no se documentan evaluaciones de factualidad.
- Sesgos no evaluados: no se publican análisis de sesgo para hindi, hinglish ni inglés.
- Cobertura lingüística restringida a hindi, hinglish e inglés; el rendimiento en otros idiomas índicos no está documentado.
- Longitud de contexto no especificada, lo que dificulta planificar cargas con prompts largos.
- Licencia Apache-2.0 permite uso comercial, pero la corrección de métricas y la falta de benchmarks estándar exigen validación propia antes de producción.
- El repositorio ocupa 35,5 GB, aunque los artefactos útiles para inferencia son de 1,0 GB (Q4_K_M) y 3,2 GB (F16).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulogik/Bharat-Tiny-LLM-v3
- Demo WebGPU: https://huggingface.co/spaces/eulogik/bharat-tiny-llm-v3-demo
- Repositorio GitHub: https://github.com/eulogik/Bharat-Tiny-LLM
- Auditoría de afirmaciones: https://github.com/eulogik/Bharat-Tiny-LLM/blob/main/docs/claim_audit.md
- Licencia: https://github.com/eulogik/Bharat-Tiny-LLM/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset GSM8K-Hindi: https://huggingface.co/datasets/bingbangboom/gsm8k-hindi
- Dataset IndicVault: https://huggingface.co/datasets/ai4bharat/IndicVault
- Dataset de SFT: https://huggingface.co/datasets/eulogik/bharat-v3-chat-sft-v3
- Sitio del autor: https://eulogik.com
