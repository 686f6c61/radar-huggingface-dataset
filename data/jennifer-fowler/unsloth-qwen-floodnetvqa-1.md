# jennifer-fowler/Unsloth-qwen-floodnetvqa-1

## Resumen

Unsloth-qwen-floodnetvqa-1 es un modelo de lenguaje y visión (vision-language model) publicado por la usuaria jennifer-fowler en Hugging Face. Se trata de un ajuste fino de Qwen3-VL-2B-Thinking, la variante de 2 000 millones de parámetros con modo de razonamiento de la familia Qwen3-VL de Alibaba, especializado en tareas de pregunta-respuesta visual sobre imágenes de inundaciones (FloodNet VQA). El modelo se distribuye exclusivamente en formato GGUF, convertido con la herramienta Unsloth, y está pensado para su ejecución con llama.cpp.

La relevancia del modelo es doble. Por un lado, demuestra el flujo de trabajo de ajuste fino de un VLM pequeño con Unsloth y su posterior cuantización a GGUF para despliegue en local. Por otro, aplica ese pipeline a un dominio concreto y de alto impacto social como es la evaluación de daños por inundaciones a partir de imágenes, un caso de uso típico en respuesta a emergencias y teledetección. Al ser un modelo de 1 720 574 976 parámetros (según los pesos safetensors del repositorio), puede ejecutarse en hardware de consumo si se usa la cuantización Q4_K_M incluida.

El repositorio tiene un tamaño de 1,9 GB e incluye dos ficheros: el proyector multimodal en BF16 (`Qwen3-VL-2B-Thinking.BF16-mmproj.gguf`) y el modelo cuantizado en Q4_K_M (`Qwen3-VL-2B-Thinking.Q4_K_M.gguf`). No se han publicado datos sobre el conjunto de entrenamiento, la licencia ni los idiomas soportados más allá de lo que se deduce de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basada en Qwen3-VL, con modo thinking; no se detalla la configuración interna |
| Parametros totales | 1 720 574 976 (1,72 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (proyector multimodal) y Q4_K_M (pesos del modelo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (compatible con llama.cpp); el repositorio incluye también pesos safetensors según los metadatos de parámetros |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Thinking, un transformer multimodal de la familia Qwen3-VL que combina un codificador visual con un decodificador de lenguaje y que incorpora un modo de razonamiento explícito ("thinking"). Sobre esa base, el autor ha realizado un ajuste fino supervisado orientado a pregunta-respuesta visual en el dominio FloodNet (imágenes de escenas inundadas), y posteriormente ha convertido los pesos a GGUF con Unsloth. El repositorio separa el proyector multimodal (mmproj) en BF16 del modelo cuantizado en Q4_K_M, lo que es el patrón habitual en llama.cpp para modelos multimodales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores al ajuste supervisado. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de Qwen3-VL (modo thinking) y del pipeline de conversión de Unsloth. Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Generación de texto y razonamiento en modo thinking, heredado de Qwen3-VL-2B-Thinking.
- Comprensión de imágenes y respuesta a preguntas visuales (VQA), con especialización en escenas de inundaciones.
- Ejecución local mediante llama.cpp, incluyendo el binario multimodal `llama-mtmd-cli`.
- Compatibilidad con el formato de plantillas Jinja (`--jinja`) para el chat.
- Soporte de conversación multi-turno (tag `conversational`).
- No se documenta soporte explícito de tool calling, function calling, agentes ni otras modalidades (audio, vídeo) en la información disponible.
- Capacidades multilingües: no disponibles; no se especifican idiomas.

## Casos de uso

- Evaluación de daños por inundaciones: el modelo recibe una imagen aérea o terrestre de una zona inundada y responde a preguntas sobre el estado de carreteras, edificios o vehículos, aprovechando su ajuste específico sobre FloodNet VQA.
- Asistencia en respuesta a emergencias: un operador puede consultar por imagen el alcance de la inundación en un punto concreto y obtener una descripción textual que ayude a priorizar recursos.
- Procesamiento por lotes en local: al estar en GGUF Q4_K_M y ocupar poco más de 1 GB de pesos, puede ejecutarse en un portátil o en un servidor sin GPU dedicada para clasificar grandes volúmenes de imágenes de satélite o drones.
- Prototipado de pipelines de teledetección: sirve como componente VQA dentro de un flujo que segmenta imágenes, genera preguntas automáticas y agrega respuestas para informes de daños.
- Investigación en ajuste fino de VLMs: el repositorio documenta el pipeline Unsloth → GGUF, útil como referencia para reproducir el entrenamiento y la cuantización de un VLM pequeño en un dominio concreto.
- Despliegue en entornos con recursos limitados: integrable con llama.cpp en dispositivos edge (Raspberry Pi con suficiente RAM, mini-PC) para tareas de inspección visual sin conexión.
- Educación y divulgación: permite demostrar en local cómo un modelo de 1,72 B parámetros responde preguntas sobre imágenes, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q4_K_M ocupa aproximadamente 1,1–1,3 GB (el repositorio completo son 1,9 GB, incluyendo el mmproj en BF16); se recomienda al menos 4 GB de RAM/VRAM libres para cargar modelo, proyector y contexto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100); el modelo es lo bastante pequeño para no requerir GPU de datacenter.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli` para multimodal, `llama-cli` para texto), y cualquier frontend compatible con GGUF (Ollama, LM Studio, KoboldCpp); no se documenta soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles; al ser un modelo de 1,72 B parámetros en Q4_K_M, se espera una inferencia rápida en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Unsloth-qwen-floodnetvqa-1 | 1,72 B | no disponible | Texto + visión | no disponible | GGUF |
| Qwen3-VL-2B-Thinking (base) | ~2 B | no disponible en esta ficha | Texto + visión | no disponible | safetensors/GGUF |
| SmolVLM-2B (Hugging Face) | ~2 B | no disponible | Texto + visión | Apache 2.0 (según su model card pública) | safetensors/GGUF |
| Florence-2-base (Microsoft) | ~0,23 B | no disponible | Texto + visión | MIT (según su model card pública) | safetensors |

La comparación con alternativas se limita a la categoría de VLMs pequeños; no hay datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa. El modelo destaca por su especialización en FloodNet VQA, mientras que las alternativas son de propósito general.

## Limitaciones y advertencias

- Sesgos: al estar ajustado sobre un dataset específico de inundaciones, puede sobrerrepresentar ese tipo de escenas y degradarse en imágenes de otros dominios.
- Riesgo de alucinación: como todo VLM, puede describir elementos inexistentes en la imagen o responder con confianza a preguntas fuera de su dominio de entrenamiento.
- Contexto e idiomas: no se documenta la longitud de contexto ni los idiomas soportados; no debe asumirse un rendimiento multilingüe.
- Licencia: no disponible; antes de un uso comercial es imprescindible verificar la licencia del modelo base Qwen3-VL y la del ajuste publicado.
- Producción: el repositorio tiene 0 descargas y 0 likes, sin benchmarks ni documentación de entrenamiento; no hay evidencia de validación independiente.
- Formato: solo se distribuye GGUF; para reentrenamiento o despliegue con frameworks como vLLM habría que reconvertir los pesos.
- Fecha de creación: el repositorio figura creado en 2026-11-09, lo que conviene contrastar con la disponibilidad real de los ficheros.

## Enlaces

- Hugging Face: https://huggingface.co/jennifer-fowler/Unsloth-qwen-floodnetvqa-1
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo concreto.
