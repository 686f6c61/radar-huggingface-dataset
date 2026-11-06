# machinez/KnowLine-31B-Gen1-NVFP4

## Resumen

KnowLine-31B-Gen1 es un modelo de decisión de tipo "System One" desarrollado por PelaAI (publicado en Hugging Face bajo la cuenta `machinez`), construido sobre el modelo denso `google/gemma-4-31B-it`. No es un modelo generativo al uso: recibe un estado (texto o conversación) y hasta 64 preguntas tipadas (sí/no, elegir una entre k opciones, o puntuar según una rúbrica) y devuelve, para cada pregunta, una distribución de probabilidad sobre sus opciones en un único forward pass, sin generar texto. Está afinado con LoRA SFT (rango 32, alpha 64) sobre el modelo de lenguaje, fusionado en bf16 y posteriormente promediado con el modelo base (0,75 × afinado + 0,25 × Gemma 4).

La versión publicada aquí, `KnowLine-31B-Gen1-NVFP4`, es una cuantización NVFP4 de los pesos: los 410 lineales del decodificador usan pesos E2M1 empaquetados con una escala E4M3 por cada 16 valores y escalas globales FP32, mientras que la torre de visión, el proyector, los embeddings, las normas y la cabeza LM permanecen en BF16. El modelo conserva la torre de visión del base aunque fue entrenado solo con texto, lo que le permite responder preguntas sobre imágenes de forma zero-shot.

Su relevancia radica en dos factores: por un lado, una interfaz de clasificación/decisión con probabilidades calibradas (temperatura plegada en los pesos) orientada a agentes y sistemas de decisión; por otro, un pipeline de entrenamiento completamente dirigido por un agente de IA que identifica debilidades, propone y construye datos, entrena, evalúa y acepta o rechaza cambios. La licencia es Apache-2.0 y soporta inglés, chino simplificado y chino tradicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4) con atención deslizante en 50 capas y atención completa en 10 capas; torre de visión del modelo base |
| Parametros totales | 19.869.430.116 (~19,9 mil millones según safetensors; la model card describe el base como "unos 31B") |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 con escala E4M3 por bloque de 16 valores y escalas globales FP32) en los 410 lineales del decodificador; BF16 en visión, proyector, embeddings, normas, layer_scalar y cabeza LM; también se publican pesos bf16 (~63 GB) |
| Idiomas soportados | Inglés, chino simplificado, chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit según tags; NVFP4) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it`, un transformer denso con un patrón híbrido de atención: 50 capas con atención deslizante y 10 capas con atención completa (estas últimas sin `v_proj`). El ajuste se realizó mediante LoRA SFT (rango 32, alpha 64) aplicado únicamente al modelo de lenguaje, durante una época, fusionado después en pesos bf16 y promediado tensor a tensor con el modelo base en proporción 0,75/0,25. La cabeza de salida no genera texto: lee la probabilidad del token de etiqueta de cada opción, de modo que cada pregunta se resuelve en un solo forward pass.

La innovación metodológica principal es el bucle de datos dirigido por un agente de IA: en cada ronda, el agente detecta puntos débiles del modelo, propone un grupo de datos específico, construye y descontamina los datos, entrena y evalúa, y decide si conserva o rechaza el cambio según la evidencia. Además, se pliega una temperatura de lectura T = 1,44 en el peso de la norma final y en el soft-cap de logits para calibrar las probabilidades, y el servidor (`knowline_server.py`) lee dos veces las peticiones cortas por defecto (opción `--no-read-twice` para desactivarlo). La cuantización NVFP4 afecta a q, k, o, gate, up y down en todas las capas, más `v_proj` en las 50 capas de atención deslizante.

## Capacidades

- Clasificación y decisión tipada: responde hasta 64 preguntas por estado con distribuciones de probabilidad sobre opciones (sí/no, elección entre k, puntuación por rúbrica).
- Probabilidades calibradas: temperatura plegada en los pesos; ECE ~0,012-0,021 y Brier ~0,23-0,26 en la suite pública.
- Procesamiento de imágenes zero-shot: conserva la torre de visión del base y responde preguntas sobre imágenes sin entrenamiento específico de visión.
- Localización visual zero-shot: devuelve bounding boxes de objetivos nombrados en una imagen (ScreenSpot centre-hit 81,3; RefCOCO IoU≥0,5 77,3).
- Multilingüe: inglés, chino simplificado y chino tradicional.
- Compatibilidad de interfaz: clientes Jev existentes solo necesitan cambiar la URL base; usuarios de otros modelos KnowLine solo cambian el nombre del modelo.
- Sin tool calling ni function calling declarados en la información disponible.
- Sin modo thinking ni generación de texto libre: la salida es siempre una distribución sobre opciones.

## Casos de uso

- Enrutamiento y triaje de tickets: dado el texto de una incidencia, formular preguntas tipadas (¿es urgente?, ¿qué categoría?, ¿requiere escalado?) y usar las probabilidades para decidir la ruta sin generación de texto.
- Moderación de contenido con umbrales calibrados: al devolver probabilidades calibradas (ECE ~0,012-0,021), permite fijar umbrales de decisión con significado probabilístico en lugar de depender de heurísticas sobre texto generado.
- Evaluación automática de respuestas: usar preguntas de rúbrica para puntuar salidas de otros modelos o de agentes, aprovechando la lectura doble de peticiones cortas para reducir varianza.
- Automatización de interfaz gráfica: localizar elementos por nombre en capturas (ScreenSpot centre-hit 81,3) y combinar con preguntas de decisión para guiar acciones de un agente sobre UI.
- Análisis documental con preguntas estructuradas: extraer decisiones sí/no o categorías de documentos; conviene tener en cuenta el rendimiento más débil en documentos (FUNSD 35,3) frente a otros dominios visuales.
- Sistemas de decisión en chino e inglés: atención a clientes o clasificación de intenciones en mercados anglófonos y sinófonos, con soporte de chino simplificado y tradicional.
- Investigación en calibración y robustez: evaluar el efecto de instrucciones inyectadas en el estado (0,4% de respuestas alteradas con instrucciones vistas; 5,3% con plantillas no vistas) como banco de pruebas de seguridad.

## Benchmarks y rendimiento

Resultados publicados por el autor (autoejecutados, lectura doble):

| Benchmark | KnowLine-31B-Gen1 | KnowLine-26B-A4B-Gen2.5 | KnowLine-35B-A3B-Gen1.5 |
|---|---|---|---|
| Decision Index 0.3 (suite pública) | 70,13 | 68,21 | 70,72 |
| Tareas de decisión de dominios no vistos (34 tareas) | 74,9 | 66,4 | 56,2 |
| Tareas de decisión (set antiguo de 10 tareas) | 57,7 | 56,6 | 56,6 |
| Chino in-house (dos sets) | 75,9 / 75,9 | 73,7 / 71,0 | no disponible |
| C-Eval | 82,5 | 77,9 | no disponible |
| Open-Jev 1.1 (test / OOD) | 91,3 / 94,8 | 92,7 / 92,7 | no disponible |
| JevBench / JevBench-hard | 90,5 / 80,2 | 90,5 / 81,1 | no disponible |
| Inglés in-house | 70,2 | 70,5 | no disponible |
| Suite pública de visión (reconstrucción 0.3.1) | 69,9 | 64,7 (26B-A4B-Gen2) | 71,2 (35B-A3B-Gen1) |
| Suite pública oficial de visión | 69,3 | no disponible | no disponible |
| ScreenSpot centre-hit | 81,3 | no disponible | no disponible |
| RefCOCO IoU≥0,5 | 77,3 | no disponible | no disponible |
| FUNSD | 35,3 | no disponible | no disponible |
| ECE (suite pública) | ~0,012-0,021 | 0,013-0,018 | no disponible |
| Brier (suite pública) | ~0,23-0,26 | 0,24-0,27 | no disponible |
| KOF '98 (vs StartLux-Decision-35B-A3B) | 16-2-0 | no disponible | no disponible |
| KOF '98 (vs KnowLine-35B-A3B-Gen1) | 4-14-0 | no disponible | no disponible |

## Requisitos de hardware

- Pesos bf16: ~63 GB, requieren GPU con al menos 80 GB (A100 80GB, H100 80GB, H20 96GB). El autor ejecutó todas las evaluaciones con un servidor SGLang en una H20 de 96 GB.
- Versión NVFP4: repo de 23,3 GB; el peso cuantizado reduce el footprint, pero no se publican cifras de VRAM pico ni de throughput para esta variante.
- SGLang reserva por defecto el 85% de la memoria de la GPU (MEM); ajustar según el hardware disponible.
- No hay datos publicados sobre ejecución en GPU de consumo (RTX 4090, etc.); con el tamaño de pesos bf16 no cabe en 24 GB, y para NVFP4 no se confirma compatibilidad con llama.cpp u Ollama.
- Despliegue: SGLang 0.5.21 con transformers 5.12.1 y `serve_knowline.sh`; el servidor `knowline_server.py` expone `/v1/systemone`. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles; la lectura doble de peticiones cortas duplica el coste de inferencia para esas peticiones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-31B-Gen1 | ~19,9B (denso) | no disponible | 70,13 | Apache-2.0 | Hugging Face (bf16 y NVFP4) |
| KnowLine-26B-A4B-Gen2.5 | MoE (26B totales, 4B activos) | no disponible | 68,21 | no disponible en la información | Hugging Face (PelaAI) |
| KnowLine-35B-A3B-Gen1.5 | MoE (35B totales, 3B activos) | no disponible | 70,72 | no disponible en la información | Hugging Face (PelaAI) |
| StartLux-Decision-35B-A3B | MoE (35B totales, 3B activos) | no disponible | no disponible | no disponible | Referenciado en el harness KOF '98 |

## Limitaciones y advertencias

- Vulnerabilidad a instrucciones plantadas: el 0,4% de las respuestas cambian con instrucciones inyectadas en el estado vistas en entrenamiento, y el 5,3% con plantillas no vistas; es más vulnerable que KnowLine-26B-A4B-Gen2.5 (0,1% y 1,7%).
- Calibración más débil fuera de la suite pública: en conjuntos propios retenidos la calibración empeora según el autor.
- Rendimiento visual desigual: buena localización general (ScreenSpot 81,3; RefCOCO 77,3) pero muy flojo en documentos (FUNSD 35,3).
- Visión zero-shot: no fue entrenado con imágenes; los resultados dependen de la torre del base y pueden degradarse en dominios alejados.
- Idiomas limitados a inglés y chino (simplificado y tradicional); no se declara soporte de español ni de otras lenguas.
- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso explícito; su uso está restringido a preguntas tipadas con opciones.
- Discrepancia de tamaño: la model card describe el base como "unos 31B" mientras que safetensors reporta ~19,9B parámetros; conviene verificar el conteo real antes de planificar hardware.
- Licencia Apache-2.0 en los pesos, pero el modelo base Gemma 4 puede tener términos adicionales que deben revisarse para uso comercial.
- La cuantización NVFP4 puede introducir degradación adicional respecto a bf16; no se publican métricas comparativas entre ambas variantes.

## Enlaces

- Hugging Face: https://huggingface.co/machinez/KnowLine-31B-Gen1-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Guía de inferencia: INFERENCE.md (referenciada en la model card, dentro del repo)
- README en chino: README.zh.md (dentro del repo)
- Modelos hermanos: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5, https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5, https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
