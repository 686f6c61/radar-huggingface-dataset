# kolenyo/GeoAgent-Qwen3-VL-2B-ONNX

## Resumen

GeoAgent-Qwen3-VL-2B-ONNX es un modelo de visión-lenguaje (VLM) especializado en geolocalización de imágenes, destilado a partir de modelos mayores (GeoAgent 7B y GeoVista-RL-6k-7B) y ajustado con GRPO usando una función de recompensa basada en la distancia Haversine. Lo publica el usuario kolenyo en Hugging Face bajo licencia Apache 2.0, tomando como base Qwen/Qwen3-VL-2B-Instruct.

El modelo se distribuye exclusivamente como bundle ONNX cuantizado en Q4F16 (1283,8 MB), pensado para ejecutarse en el navegador mediante transformers.js y WebGPU. Incluye soporte para cabezas Micro-LoRA regionales intercambiables en caliente (r=10, 14,77 MiB cada una), lo que permite especializar el modelo por región sin recargar los pesos principales.

Su relevancia radica en llevar geolocalización visual a un entorno 100% cliente (sin servidor), con un tamaño que cabe en memoria de GPU integrada o en WebGPU de portátiles. No obstante, los resultados publicados en `eval_50` son modestos (20% de acierto de país), por lo que debe considerarse una base experimental más que un sistema de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL), exportado a ONNX |
| Parametros totales | 2B (modelo base Qwen3-VL-2B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4F16 (unico bundle publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (bundle Q4F16, 1283,8 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer multimodal que procesa imagen y texto para generar respuestas. Sobre esa base se aplicó un ajuste con GRPO (Group Relative Policy Optimization) usando una recompensa continua basada en la distancia Haversine entre la coordenada predicha y la real, junto con un esquema de verificación adversarial A/B/C. El autor indica que el modelo se destila desde `ghost233lism/GeoAgent` (7B) y `LibraTree/GeoVista-RL-6k-7B`.

Los datos de entrenamiento provienen de tres datasets: `ghost233lism/GeoSeek`, `osv5m/osv5m` y `globe-project/MP16-Reason`. El autor no detalla el número de tokens, la composición exacta ni las fases de RLHF/DPO. La innovación principal es el sistema de cabezas Micro-LoRA regionales (r=10) que se pueden intercambiar en caliente sobre el bundle ONNX, permitiendo especialización geográfica sin redistribuir los pesos completos.

## Capacidades

- Geolocalización de imágenes: predice país y coordenadas a partir de una fotografía.
- Generación de texto multimodal (image-text-to-text) heredada del modelo base Qwen3-VL-2B.
- Modo de verificación adversarial A/B/C durante el entrenamiento, orientado a reducir respuestas erróneas.
- Soporte de cabezas Micro-LoRA regionales intercambiables en caliente.
- Ejecución nativa en navegador vía transformers.js y WebGPU.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Geolocalización asistida en aplicaciones web: el modelo se ejecuta en el navegador con WebGPU, de modo que el usuario puede subir una foto y obtener una estimación de país y coordenadas sin enviar la imagen a un servidor, preservando la privacidad.
- Verificación de metadatos de imágenes: útil para contrastar la ubicación declarada en EXIF con la inferida visualmente, como control de calidad en archivos fotográficos.
- Herramientas educativas de geografía: permite construir demos interactivas que muestran cómo un VLM razona sobre pistas visuales (vegetación, arquitectura, señalética) para inferir una región.
- Prototipado de agentes de investigación OSINT: como componente de un pipeline mayor que combina la estimación visual con búsqueda web y verificación cruzada, aprovechando su formato ONNX y su ejecución ligera.
- Aplicaciones de campo offline: al caber en 1283,8 MB y ejecutarse en WebGPU, puede desplegarse en portátiles sin GPU dedicada para tareas de catalogación fotográfica en terreno.
- Experimentación con Micro-LoRA regionales: sirve como banco de pruebas para investigar adaptación geográfica de bajo rango (r=10) sobre modelos multimodales cuantizados.
- Filtrado previo en plataformas de contenido: descartar o etiquetar imágenes cuya ubicación inferida no concuerda con la declarada por el usuario.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto `eval_50`:

| Modo | Acierto de país | Coordenadas parseadas | Mediana de error |
|---|---|---|---|
| Sin restricción | 20,0% | 100,0% | 824,4 km |
| Con restricción regional | 20,0% (hit) | 96,0% | 154,4 km |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El bundle Q4F16 ocupa 1283,8 MB, por lo que la inferencia requiere al menos ~1,5 GB de memoria disponible en el dispositivo.
- Diseñado para WebGPU en navegador; funciona en GPUs integradas modernas y en GPUs dedicadas de consumo.
- GPU recomendadas para servidor: no disponible en la información proporcionada.
- Cabe en GPU de consumo: sí, por tamaño; el autor no especifica modelos concretos (RTX 4090, etc.).
- Despliegue: transformers.js con backend WebGPU; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este bundle.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| GeoAgent-Qwen3-VL-2B-ONNX | 2B | no disponible | ONNX Q4F16 | Apache 2.0 | Geolocalización en navegador |
| Qwen/Qwen3-VL-2B-Instruct | 2B | no disponible | safetensors | no disponible | VLM generalista |
| ghost233lism/GeoAgent | 7B | no disponible | no disponible | no disponible | Geolocalización |
| LibraTree/GeoVista-RL-6k-7B | 7B | no disponible | no disponible | no disponible | Geolocalización |

Los dos modelos de 7B son las fuentes de destilación citadas por el autor; el modelo de 2B sacrifica tamaño y precisión (20% de acierto de país) a cambio de ejecución en navegador.

## Limitaciones y advertencias

- Precisión baja: 20% de acierto de país y mediana de error de 824,4 km sin restricción regional; no es apto para localización precisa sin verificación humana.
- El modo con restricción regional mejora la mediana a 154,4 km pero reduce las coordenadas parseadas al 96%.
- Riesgo de alucinación: el modelo puede generar coordenadas plausibles pero incorrectas; el entrenamiento adversarial A/B/C mitiga pero no elimina este riesgo.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe consistente.
- Longitud de contexto no disponible; no se recomienda para conversaciones multi-turno largas sin validación previa.
- Solo se publica cuantización Q4F16 en ONNX; la pérdida de precisión frente a los pesos originales no está cuantificada por el autor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-2B-Instruct debe verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación externa de la comunidad.
- No se documentan requisitos de hardware concretos ni latencias, lo que dificulta planificar producción.

## Enlaces

- Hugging Face: https://huggingface.co/kolenyo/GeoAgent-Qwen3-VL-2B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset GeoSeek: https://huggingface.co/datasets/ghost233lism/GeoSeek
- Dataset OSV5M: https://huggingface.co/datasets/osv5m/osv5m
- Dataset MP16-Reason: https://huggingface.co/datasets/globe-project/MP16-Reason
- Modelo fuente GeoAgent: https://huggingface.co/ghost233lism/GeoAgent
- Modelo fuente GeoVista-RL-6k-7B: https://huggingface.co/LibraTree/GeoVista-RL-6k-7B
