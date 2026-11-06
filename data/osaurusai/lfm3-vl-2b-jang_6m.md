# OsaurusAI/LFM3-VL-2B-JANG_6M

## Resumen

OsaurusAI/LFM3-VL-2B-JANG_6M es una cuantización de 6 bits del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por OsaurusAI para su ejecución en Apple Silicon mediante la librería MLX. El modelo base combina el tronco de lenguaje LFM3 de Liquid AI con una torre de visión de 14 capas que alterna convoluciones y atención, lo que permite procesar texto, imágenes y vídeo en una única arquitectura image-text-to-text. Esta build concreta ocupa 1,90 GiB en un solo shard en float16 y cuenta con 1.918.181.888 parámetros totales (aproximadamente 1,92 mil millones).

El interés de esta ficha no reside en el modelo base, sino en el proceso de cuantización: el autor aplica GPTQ con calibración específica sobre la propia distribución de servicio del modelo (llamadas a herramientas, trayectorias de agentes de terminal y SWE, razonamiento y código), además de AWQ sobre las capas FFN. El resultado es una build que, según las mediciones del autor, mantiene una divergencia KL media de 0,00197 nats por posición frente al original en bf16, con un 98,67 % de acuerdo en el argmax, muy por encima de la receta uniforme de 6 bits que usa mlx-vlm por defecto.

Es relevante ahora porque demuestra que la cuantización de modelos multimodales pequeños para hardware de consumo (Mac con Apple Silicon) puede hacerse con pérdida mínima si la calibración se alinea con el uso real, en lugar de recurrir a recetas genéricas. El modelo base soporta 16 idiomas, incluido el castellano, y mantiene el modo de razonamiento (thinking) activado por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (tronco de lenguaje) + torre de visión de 14 capas conv/attention; multimodal image-text-to-text |
| Parametros totales | 1.918.181.888 (aprox. 1,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (build JANG_6M); mezcla interna: atención y proyecciones conv a 8 bits afín grupo 32, FFN a 6 bits afín grupo 32, embedding/lm_head atados a 8 bits; torre de visión, proyector, gates y normas en precisión completa |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0), igual que el modelo base |
| Formato de pesos | safetensors (MLX), float16 en disco, un único shard de 1,90 GiB |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B es un transformer multimodal de Liquid AI que acopla un tronco de lenguaje LFM3 con una torre de visión de 14 capas que combina convoluciones y atención. Esta build de OsaurusAI no reentrena el modelo: cuantiza los pesos del original mediante un pipeline híbrido GPTQ + AWQ. Las matrices de atención (q/k/v/o) y las proyecciones de entrada/salida de las convoluciones cortas se cuantizan a 8 bits afín con grupo 32 mediante GPTQ; las capas FFN (w1, w3, w2) se cuantizan a 6 bits afín con grupo 32 aplicando AWQ más GPTQ; el embedding atado con la cabeza de salida se mantiene a 8 bits. Se conservan en precisión completa el gate de salida de atención, los kernels de convolución depthwise, todas las normas, la torre de visión y el proyector.

El detalle técnico más relevante es la calibración: 634.978 tokens renderizados con la propia plantilla de chat del modelo, incluyendo llamadas a herramientas en formato XML nativo (`<tool_call><function=...>`), resultados de herramientas como turnos `tool`, trazas de razonamiento dentro de `<think>` y respuestas del propio modelo a prompts de razonamiento, terminal y código. La distribución por dominio es: 166.403 tokens de tool calling, 175.686 de trayectorias de agentes de terminal/SWE, 106.871 de razonamiento largo, 66.629 de código y texto agéntico, 37.598 de texto general, ciencia, sistemas, seguridad, multilingüe y contexto largo, y 81.791 de imágenes (fotos, capturas de pantalla, documentos). GPTQ se aplicó con rejilla min-max fija (layout idéntico a byte a `mx.quantize`), act-order, Hessianos acumulados sobre todos los tokens de calibración y reconstrucción del Hessiano de w2 a través de w1/w3 ya cuantizados, con una guarda best-of-RTN. AWQ usa escalas por canal (alpha 0,25, clip 0,5-2) plegadas en `ffn_norm` y en las filas de `w3`, sin coste en tiempo de ejecución.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking activado por defecto (`enable_thinking`), con trazas internas en `<think>`.
- Comprensión de imágenes: fotos, capturas de pantalla y documentos, a través de la torre de visión de 14 capas.
- Procesamiento de vídeo como modalidad adicional, según declara el autor del bundle.
- Llamadas a funciones y herramientas en formato XML nativo (`<tool_call><function=...>`), con soporte de turnos `tool` para resultados.
- Razonamiento multi-paso y comportamiento agéntico, incluyendo trayectorias de terminal y tareas de tipo SWE.
- Generación de código y texto técnico, con calibración específica en dominios de programación y agentes.
- Capacidades multilingües en 16 idiomas, entre ellos castellano, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Integración con runtimes MLX: vMLX/Osaurus (vmlx-swift con LFM3) y mlx-vlm con el port de LFM3.

## Casos de uso

- Asistente de terminal en macOS: el modelo puede interpretar comandos, ejecutar llamadas a herramientas en formato XML y razonar sobre resultados de shell; la calibración incluye 175.686 tokens de trayectorias de terminal y SWE, lo que reduce la degradación por cuantización en ese dominio concreto.
- Automatización de agentes de código en local: con 1,92 B de parámetros y 1,90 GiB en disco, cabe en un Mac con Apple Silicon y permite iterar sobre tareas de tipo SWE sin depender de la nube, manteniendo tool calling y trazas de razonamiento.
- Análisis de documentos y capturas de pantalla: la torre de visión y los 81.791 tokens de calibración con imágenes permiten extraer información de documentos escaneados o screenshots en flujos de automatización de oficina.
- Atención al cliente multilingüe: los 16 idiomas soportados y el formato conversacional permiten desplegar un asistente que responda en castellano, inglés, francés o alemán dentro de la misma build, con razonamiento explícito para consultas complejas.
- Prototipado de pipelines multimodales en MLX: al ser una build MLX con soporte en mlx-vlm, sirve para validar arquitecturas image-text-to-text en Apple Silicon antes de escalar a modelos mayores.
- Evaluación de técnicas de cuantización: la model card publica métricas de KL y top-1 frente a bf16 y frente a la receta uniforme de 6 bits, lo que convierte esta build en una referencia práctica para comparar recetas de cuantización en modelos multimodales pequeños.
- Generación de código asistida en entornos con restricciones de privacidad: al ejecutarse localmente en Apple Silicon, permite autocompletado y explicación de código sin enviar el código a servicios externos.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad frente al modelo original en bf16 sobre 69 secuencias retenidas (15.021 posiciones evaluadas) que cubren llamadas a herramientas, agentes de terminal y SWE, razonamiento, código, texto general e imágenes. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Build | Tamano | KL mediana | KL media | KL p95 | Top-1 |
|---|---|---|---|---|---|
| Esta build (JANG_6M) | 1,90 GiB | 0,00012 | 0,00197 | 0,0069 | 98,67 % |
| Mismo layout, round-to-nearest | 1,90 GiB | 0,00018 | 0,00281 | 0,0092 | 98,44 % |
| 6 bits uniforme gs64 (receta por defecto de mlx-vlm) | 1,66 GiB | 0,00045 | 0,00665 | 0,0242 | 97,54 % |

La divergencia KL se mide en nats por posición (menor es mejor) y el top-1 es el acuerdo del argmax con bf16. El autor indica además una reducción del error medio de reconstrucción en calibración del 52,9 % frente a round-to-nearest.

## Requisitos de hardware

- VRAM/unified memory estimada: 1,90 GiB de pesos en float16 más overhead de activaciones y caché KV; en la práctica, un Mac con 8 GB de memoria unificada debería poder cargarlo, aunque el contexto disponible condicionará el uso real.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro/Max/Ultra) mediante MLX. No está pensado para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; el tamaño de 1,90 GiB lo hace especialmente adecuado para equipos con 16 GB o menos.
- Opciones de despliegue: vMLX / Osaurus (vmlx-swift con soporte LFM3), mlx-vlm con el port de LFM3. No se mencionan llama.cpp, Ollama, vLLM ni TGI, y el formato MLX no es directamente compatible con ellos.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados por el autor: temperatura 0,1, top_k 50, repetition_penalty 1,1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| OsaurusAI/LFM3-VL-2B-JANG_6M | 1,92 B | no disponible | texto, imagen, vídeo | LFM Open License v1.0 | safetensors MLX (6 bits mixto) |
| LiquidAI/LFM3-VL-2B (base) | 1,92 B | no disponible | texto, imagen, vídeo | LFM Open License v1.0 | safetensors bf16, múltiples runtimes |
| Build 6 bits uniforme gs64 (receta mlx-vlm) | 1,92 B | no disponible | texto, imagen, vídeo | depende del modelo base | MLX, 1,66 GiB |
| Build round-to-nearest mismo layout | 1,92 B | no disponible | texto, imagen, vídeo | depende del modelo base | MLX, 1,90 GiB |

Las dos últimas filas no son modelos independientes, sino recetas de cuantización del mismo modelo base que el autor usa como referencia de comparación; se incluyen porque son las alternativas reales para un usuario que quiera ejecutar LFM3-VL-2B en MLX. No se dispone de datos de benchmarks de tareas para comparar el rendimiento funcional frente a otros modelos multimodales pequeños de la misma categoría.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda todos los sesgos y limitaciones del modelo base LiquidAI/LFM3-VL-2B, que no se detallan en la información disponible.
- Riesgo de alucinación inherente a un modelo de 1,92 B de parámetros; el modo thinking activado por defecto puede aumentar la latencia y no garantiza corrección factual.
- La licencia LFM Open License v1.0 es una licencia "other" con condiciones específicas; es imprescindible revisar el archivo `LICENSE` antes de cualquier uso comercial, ya que la información disponible no detalla sus restricciones.
- El formato es MLX y está orientado exclusivamente a Apple Silicon; no es desplegable en CUDA, llama.cpp, Ollama, vLLM ni TGI sin conversión adicional.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar despliegues con ventanas largas.
- Las métricas de KL y top-1 las publica el propio autor de la build; no hay validación independiente en la información disponible.
- El repositorio tiene 74 descargas y 0 likes en el momento de la consulta, por lo que la comunidad de validación es muy reducida.
- La calibración está sesgada hacia tool calling, agentes de terminal, razonamiento y código; aunque incluye texto general e imágenes, el rendimiento en dominios muy alejados de esa distribución podría degradarse más de lo que indican las métricas globales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/LFM3-VL-2B-JANG_6M
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Sitio de Osaurus AI: https://osaurus.ai
- Licencia (archivo LICENSE del repo): https://huggingface.co/OsaurusAI/LFM3-VL-2B-JANG_6M/blob/main/LICENSE
- Banner del proyecto: https://huggingface.co/OsaurusAI/LFM3-VL-2B-JANG_6M/blob/main/osaurus-x-banner.png
