# OsaurusAI/LFM3-1.7B-JANG_6M

## Resumen

OsaurusAI/LFM3-1.7B-JANG_6M es una versión cuantizada para Apple Silicon del modelo LiquidAI/LFM3-1.7B, publicada por OsaurusAI. Se trata de un modelo de generación de texto conversacional de 1.728 millones de parámetros (1.728.801.536 exactos según los safetensors) que combina atención completa y deslizante con convoluciones cortas en una arquitectura híbrida propia de la familia LFM3 de Liquid AI. El modelo base es un modelo instruct con el modo de razonamiento ("thinking") activado por defecto y soporte de tool calling en formato XML.

La relevancia de esta ficha no está tanto en el modelo base como en el proceso de cuantización: el bundle "JANG_6M" aplica una cuantización mixta (8 bits para los mixers de tokens y la atención, 6 bits para las FFN) calibrada con GPTQ y AWQ sobre 556.418 tokens de datos de calibración orientados a tool calling, agentes de terminal, razonamiento y código. El resultado ocupa 1,55 GiB en disco y mantiene una divergencia KL muy baja respecto al modelo bf16 original (mediana de 0,00015 nats por posición y un 98,58% de acuerdo en top-1), lo que lo hace especialmente adecuado para ejecutar agentes y flujos de razonamiento localmente en Mac con Apple Silicon mediante MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa/sliding window + convoluciones cortas, familia LFM3) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 8-bit affine (GPTQ, grupo 32) para atención q/k/v/o y proyecciones short-conv; 6-bit affine (AWQ + GPTQ, grupo 32) para FFN w1/w3/w2; 8-bit affine para embedding/lm_head embebidos; normas, gates de salida y kernels conv en precisión completa |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | safetensors (MLX), un solo shard de 1,55 GiB |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM3-1.7B, emplea una arquitectura híbrida que combina capas de atención completa y de ventana deslizante (sliding attention) con mixers convolucionales cortos (short-conv), un diseño característico de la familia LFM de Liquid AI orientado a eficiencia en inferencia. Es un modelo instruct con razonamiento activado por defecto mediante etiquetas `<think>` y soporte nativo de llamadas a herramientas en formato XML (`<tool_call><function=...>`). Los datos de preentrenamiento y postentrenamiento del modelo base no están detallados en la información disponible.

Sobre este base, OsaurusAI ha construido el bundle JANG_6M mediante una cuantización mixta calibrada: los mixers de tokens y las proyecciones de atención se cuantizan a 8 bits con GPTQ (grupo 32, act-order, Hessians acumulados sobre cada token de calibración), mientras que las matrices FFN (w1/w3/w2) se cuantizan a 6 bits combinando AWQ (escalas de canal con alpha 0,25 y clip 0,5-2, plegadas en `ffn_norm` y `w3`) y GPTQ. La calibración empleó 556.418 tokens renderizados a través de la plantilla de chat propia del modelo, con dominios de tool calling (167.615 tokens), trayectorias de agentes de terminal/SWE (175.655), razonamiento largo (107.988), código y texto agéntico (67.562) y contenido general, científico y multilingüe (37.598). El error medio de reconstrucción de calibración se redujo un 52,7% frente a round-to-nearest.

## Capacidades

- Generación de texto conversacional multilingüe en 16 idiomas, incluido castellano.
- Razonamiento con modo "thinking" activado por defecto (trazas dentro de `<think>`).
- Tool calling nativo en formato XML de función (`<tool_call><function=...>`), con la plantilla de chat estructurada para herramientas.
- Ejecución de flujos agénticos multi-paso: la calibración incluye trayectorias completas de agentes de terminal y SWE, con resultados de herramientas como turnos `tool`.
- Generación y comprensión de código, con calibración específica en prompts de programación y agentes de software.
- Optimizado para inferencia local en Apple Silicon mediante MLX (vMLX, Osaurus, mlx-vlm).

## Casos de uso

- Agentes de terminal locales en Mac: el modelo está calibrado específicamente con trayectorias de agentes SWE y de terminal, por lo que es adecuado para asistentes que ejecutan comandos, leen salidas y deciden siguientes pasos, todo en local gracias a sus 1,55 GiB.
- Automatización con tool calling en dispositivo: soporta llamadas a funciones en formato XML nativo, útil para integraciones con calendarios, buscadores o APIs locales sin depender de la nube.
- Razonamiento paso a paso en local: con el modo thinking activado por defecto, sirve para tareas de planificación, análisis y resolución de problemas donde se valora la privacidad de los datos.
- Asistentes de código integrados en el editor: la calibración en coding y texto agéntico lo hace apropiado para autocompletado, refactorizaciones y explicación de código en portátiles Apple Silicon.
- Atención al cliente o chatbots multilingües embebidos: soporta 16 idiomas, incluido castellano, y puede desplegarse en dispositivos sin coste de API.
- Prototipado de aplicaciones con MLX: al ser un bundle MLX con un solo shard, la carga es sencilla en apps Swift (vmlx-swift/Osaurus) para desarrolladores que construyen productos sobre Apple Silicon.
- Procesamiento de texto sensible (documentación interna, datos clínicos o legales): la ejecución completamente local evita enviar información a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye mediciones de fidelidad de la cuantización frente al modelo bf16 original sobre 58 secuencias held-out (13.494 posiciones puntuadas; KL en nats por posición, menor es mejor):

| Build | Tamaño | KL mediana | KL media | KL p95 | Top-1 |
|---|---|---|---|---|---|
| Este bundle (JANG_6M) | 1,55 GiB | 0,00015 | 0,00171 | 0,0067 | 98,58% |
| Mismo layout, round-to-nearest | 1,55 GiB | 0,00021 | 0,00267 | 0,0094 | 98,38% |
| 6-bit uniforme gs64 (receta por defecto de mlx-vlm) | 1,31 GiB | 0,00055 | 0,00691 | 0,0247 | 97,53% |

Estos datos indican que la cuantización mixta preserva el comportamiento del modelo original con mayor fidelidad que una cuantización uniforme a 6 bits, a costa de un tamaño ligeramente mayor.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1,55 GiB solo para pesos; con KV cache y overhead de runtime, un mínimo práctico de 4 GB de memoria unificada es razonable. Al ser un bundle MLX, usa memoria unificada de Apple Silicon en lugar de VRAM discreta.
- Hardware recomendado: cualquier Mac con Apple Silicon (M1 o superior). Con un modelo de ~1,7B parámetros cuantizado, incluso los Mac base con 8 GB de memoria unificada deberían ejecutarlo con holgura.
- Consumer GPUs NVIDIA: no es el objetivo del bundle (formato MLX); para GPUs NVIDIA habría que recurrir al modelo base LiquidAI/LFM3-1.7B en otro formato de cuantización.
- Opciones de despliegue: vMLX, Osaurus (vmlx-swift con soporte LFM3) y mlx-vlm con el port de LFM3. No se menciona soporte directo de llama.cpp, Ollama, vLLM o TGI para este bundle.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/plataforma | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| OsaurusAI/LFM3-1.7B-JANG_6M | 1,73B | MLX / Apple Silicon | Mixta 8-bit atención / 6-bit FFN (GPTQ + AWQ) | LFM Open License v1.0 | Calibración específica en tool calling, agentes y código |
| LiquidAI/LFM3-1.7B (base) | 1,73B | Pesos originales (bf16) | Sin cuantizar | LFM Open License v1.0 | Referencia de fidelidad; mayor huella de memoria |
| Cuantización uniforme 6-bit gs64 (receta mlx-vlm) | 1,73B | MLX / Apple Silicon | 6-bit uniforme, grupo 64 | LFM Open License v1.0 | 1,31 GiB en disco, pero KL media ~4x mayor (0,00691) |

No se incluyen otros modelos de terceros (Qwen, Gemma, Llama en tamaños similares) porque no hay datos de benchmarks comunes publicados en la información disponible para una comparación rigurosa.

## Limitaciones y advertencias

- Al tratarse de un modelo de 1,7B parámetros, sus capacidades de razonamiento y conocimiento general son intrínsecamente limitadas frente a modelos de 7B o más, con mayor riesgo de alucinaciones en tareas complejas.
- El bundle está restringido a MLX y Apple Silicon: no es utilizable directamente en entornos CUDA o CPU x86 sin conversión adicional.
- La licencia LFM Open License v1.0 es una licencia "other" personalizada: conviene revisar el archivo LICENSE para confirmar las condiciones exactas de uso comercial antes de desplegar en producción.
- La longitud de contexto no está documentada en la model card de este bundle; debe consultarse la documentación del modelo base LiquidAI/LFM3-1.7B.
- El modo thinking está activado por defecto, lo que genera trazas de razonamiento adicionales en la salida: las aplicaciones deben parsear o filtrar las etiquetas `<think>` si no las necesitan.
- Los valores de muestreo por defecto (temperature 0,1, top_k 50, repetition_penalty 1,1) pueden no ser óptimos para todas las tareas creativas.
- Como en cualquier modelo de lenguaje, persisten riesgos de sesgos heredados del entrenamiento del modelo base, no documentados específicamente en esta ficha.
- El repositorio tiene muy pocas descargas (264) y ningún like en el momento de la ficha, por lo que el historial de validación por parte de la comunidad es limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/LFM3-1.7B-JANG_6M
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Sitio web de Osaurus AI: https://osaurus.ai
- Licencia (archivo LICENSE en el repositorio): https://huggingface.co/OsaurusAI/LFM3-1.7B-JANG_6M/blob/main/LICENSE
