# MIRALABS/Ornith-1.5-35B-A3B-W4A16-SYM

## Resumen

Ornith-1.5-35B-A3B-W4A16-SYM es una re-cuantización simétrica en formato W4A16 (4 bits por peso, activaciones en BF16) del modelo MoE multimodal Ornith-1.5-35B-A3B, realizada por el equipo Milner (MIRALABS). El modelo base, desarrollado por Ornith AI, es un fine-tune de la familia Qwen3.5/3.6 A3B con arquitectura mixture-of-experts (MoE) que activa solo ~3.000 millones de parámetros por token, a pesar de tener 35.000 millones en total. Incluye un vision tower y una cabeza MTP (multi-token prediction) en BF16.

Esta versión cuantizada resuelve un problema concreto: la versión AWQ original (asimétrica) no cargaba en vLLM debido a que sus kernels MoE exigen cuantización simétrica. MIRALABS ha re-cuantizado los expertos enrutados de forma simétrica con grupo de tamaño 32, manteniendo el resto del modelo intacto, lo que permite servirlo con vLLM en hardware de consumo (por ejemplo, dos RTX 3090 con ~20 GB por GPU). Es relevante para desarrolladores que quieren ejecutar un modelo de 35B multimodal y agéntico en entornos locales o con presupuesto de hardware limitado, manteniendo la licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) basada en Qwen3.5/3.6 A3B, con vision tower y MTP head |
| Parámetros totales | 35B |
| Parámetros activos | ~3B |
| Longitud de contexto | 262K (modelo base); en el ejemplo de vLLM se sirve con 32K |
| Tipos de cuantización | W4A16 simétrica, grupo de 32, int4 (pack-quantized) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors / pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un fine-tune de la familia Qwen3.5/3.6 A3B, que usa una arquitectura MoE con 40 capas y 256 expertos enrutados, activando solo ~3B parámetros por token. Además, incorpora un vision tower (para procesamiento de imágenes y video) y una cabeza MTP (multi-token prediction) que mejora la eficiencia en generación de código y razonamiento. El entrenamiento original sigue el marco de "self-scaffolding" y "self-improvement" descrito en el blog de Ornith-1.5: el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts de solución para aprendizaje por refuerzo, lo que explica su fuerte rendimiento en tareas agénticas y de código.

La cuantización aquí documentada no modifica el entrenamiento sino el formato de los pesos. Partiendo de la versión AWQ asimétrica (ulkaa/Ornith-1.5-35B-A3B-AWQ-INT4), se des-cuantizó cada proyección de expertos a float32, se re-cuantizó de forma simétrica con escalas por grupo de 32 (s_new = amax/7.5) y se eliminaron los zero-points. El resto del modelo (vision tower, atención completa, expertos compartidos, normas, lm_head, embeddings, biases, A_log/dt_bias/conv1d y MTP head) permanece en BF16 idéntico al original. El script de conversión es determinista y resumible.

## Capacidades

- Generación de texto y razonamiento multi-step, incluyendo aritmética, lógica silogística y razonamiento simbólico (verificado en la gate de coherencia del modelo cuantizado).
- Generación de código y soporte de tool calling / function calling, integrado en el modelo (parsers de razonamiento y herramientas incorporados).
- Capacidades agénticas: el modelo base está optimizado para tareas de agentes autónomos, con planificación y ejecución multi-paso.
- Multimodal: procesa imágenes y video (según el ejemplo de vLLM con --limit-mm-prompt, admite una imagen y un video por prompt).
- Capacidad de "thinking mode" (modo de razonamiento interno) y generación de respuestas estructuradas.
- Multilingüe: no se ha especificado los idiomas exactos, pero al ser fine-tune de Qwen se espera soporte amplio, aunque no se confirma.

## Casos de uso

- Asistente de atención al cliente multimodal: el modelo puede procesar capturas de pantalla o imágenes de productos y mantener conversaciones multi-turno con contexto de 32K (o más si se configura), útil para soporte técnico visual.
- Generación de código en producción: con tool calling integrado, puede usarse en pipelines de CI/CD para generar código, revisar PRs o autocompletar funciones, ejecutándose en GPUs locales con vLLM.
- Agente autónomo para investigación: su capacidad de razonamiento multi-paso y planificación permite usarlo en tareas de automatización de flujos de trabajo (por ejemplo, scraping web, análisis de documentos).
- Análisis de imágenes en entornos con privacidad: al ser desplegable en local, permite procesar imágenes médicas o industriales sin enviar datos a la nube.
- Prototipado de aplicaciones de IA en hardware de consumo: con 2x RTX 3090 (o similar) se puede ejecutar en un entorno de laboratorio o pequeña empresa.
- Educación y experimentación: su licencia MIT y tamaño activo de 3B lo hacen ideal para enseñar arquitecturas MoE y cuantización sin necesidad de clusters grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la cuantización W4A16. La card de la cuantización solo menciona una "verificación de coherencia" con ejemplos concretos, pero sin números comparativos. Los datos de rendimiento corresponden al modelo base, que según el blog y la card original supera a Qwen 3.6-35B en benchmarks de código y agentes, y a Gemma 4-31B y Muse Glimmer-30B en coding agéntico. No obstante, no se proporcionan cifras concretas en la información disponible. El modelo base obtiene una puntuación de 49.22/100 en el leaderboard de BenchLM (posición #137 de 224), pero sin cobertura suficiente para posición verificada.

| Benchmark | Valor (modelo base) | Nota |
|---|---|---|
| BenchLM score | 49.22/100 | No verificado, cobertura insuficiente |
| Rendimiento en agentic coding | Supera a Qwen 3.6-35B, Gemma 4-31B, Muse Glimmer-30B | Según la card del modelo base, sin cifras exactas |

## Requisitos de hardware

- VRAM estimada: ~20 GB por GPU en configuración de 2x RTX 3090 (Ampere) con contexto de 32K y tensor-parallel-size 2. Para contexto más largo se necesitará más memoria.
- GPUs compatibles: NVIDIA Ampere o superior (RTX 3090, A100, H100, etc.). Se recomienda usar --kv-cache-dtype auto en Ampere (no fp8).
- Inferencia en consumer: sí, con 2x RTX 3090 (24 GB cada una) se puede servir el modelo completo con cuantización W4A16.
- Opciones de despliegue: vLLM ≥ 0.19 con `CompressedTensorsWNA16MarlinMoEMethod` (backend Marlin). No se menciona soporte para llama.cpp u Ollama en esta cuantización específica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Rendimiento agéntico | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este) | 35B | 3B | 262K | Superior a Qwen 3.6-35B en agentic coding | MIT |
| Qwen 3.6-35B | 35B | 3B | 262K | Inferior según card del modelo | Apache 2.0 (asumido) |
| Gemma 4-31B | 31B | 31B (dense) | 256K | Inferior en agentic coding | Gemma License |
| Muse Glimmer-30B | 30B | 30B (dense) | no disponible | Inferior en agentic coding | no disponible |

Nota: los datos de Qwen, Gemma y Muse Glimmer provienen de la card del modelo base y no se han verificado con fuentes primarias.

## Limitaciones y advertencias

- La cuantización 4-bit introduce divergencia respecto al modelo BF16; el rendimiento puede degradarse en tareas de precisión numérica o razonamiento complejo.
- Solo es compatible con vLLM ≥ 0.19 en GPUs NVIDIA con backend Marlin. No funciona con otros runtimes (llama.cpp, TGI) sin conversión adicional.
- La ventana de contexto en el ejemplo se limita a 32K tokens, aunque el modelo base soporta 262K; para usar el máximo se necesitaría más VRAM y ajuste fino de parámetros.
- El modelo base no especifica los idiomas soportados; se asume multilingüe por su origen Qwen, pero no se garantiza.
- Riesgo de alucinación y sesgos presentes en los modelos MoE grandes, no mitigados por la cuantización.
- La licencia MIT permite uso comercial, pero la re-cuantización es obra derivada del modelo base MIT, por lo que se hereda la misma licencia.
- No hay garantías de rendimiento en producción; se recomienda validar con casos de uso específicos.

## Enlaces

- Modelo cuantizado: https://huggingface.co/MIRALABS/Ornith-1.5-35B-A3B-W4A16-SYM
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo AWQ asimétrico (fuente): https://huggingface.co/ulkaa/Ornith-1.5-35B-A3B-AWQ-INT4
- Blog de Ornith-1.5 (entrenamiento): https://ornith.ai/ornith_1_5.html
- Análisis de despliegue local: https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-local-run
- Benchmarks y contexto (BenchLM): https://benchlm.ai/models/ornith-1-5-35b-a3b
