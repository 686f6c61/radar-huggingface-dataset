# ihor-matiushenko/silver-lining-gemma3-gguf

## Resumen

Silver Lining Gemma3 es un ajuste fino (fine-tuning) del modelo Gemma 3 270M de Google, desarrollado por ihor-matiushenko para la aplicación móvil Silver Lining AI. El modelo está especializado en "cognitive reframing" (reformulación cognitiva) empática multilingüe y en rechazos de seguridad para casos ambiguos (gray-area safety refusal). Se distribuye en formato GGUF cuantizado para su uso en dispositivos móviles mediante llama.cpp y llamadart, así como en formato MLX para Apple Silicon.

Con 268.098.176 parámetros totales, se trata de un modelo de lenguaje compacto (Small Language Model) diseñado explícitamente para inferencia on-device. El ajuste se realizó mediante LoRA (r=16, alpha=32) con la librería mlx-lm de Apple sobre 1.600 ejemplos multilingües. La relevancia actual radica en su orientación a despliegues móviles con requisitos mínimos de hardware, sacrificando capacidades generales de razonamiento en favor de una tarea conversacional muy concreta.

El modelo soporta cinco idiomas (inglés, ucraniano, español, alemán y francés) y se publica bajo licencia Gemma, con las restricciones que esta implica. El repositorio ocupa 0,6 GB e incluye artefactos GGUF en cuantizaciones Q4_K_M y Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), ajuste fino LoRA |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la configuracion recomendada usa n_ctx = 1024) |
| Tipos de cuantizacion | GGUF Q4_K_M (249,2 MB) y Q8_0 (285,9 MB); pesos base en MLX |
| Idiomas soportados | en, uk, es, de, fr |
| Licencia | Gemma |
| Formato de pesos | safetensors (base), GGUF (llama.cpp/llamadart), MLX |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma 3 270M instruct, un transformer decoder-only de pequeño tamaño. Sobre esta base se aplicó un ajuste fino mediante LoRA con rango r=16 y alpha=32 usando la librería mlx-lm de Apple. El conjunto de entrenamiento consta de 1.600 ejemplos multilingües centrados en dos tareas: reformulación cognitiva empática (cognitive reframing) y rechazo de seguridad en casos ambiguos (gray-area safety refusal), orientados a la app móvil Silver Lining AI.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron fases de RLHF o DPO. La innovación principal no es arquitectónica sino de despliegue: la conversión a GGUF con cuantizaciones Q4_K_M y Q8_0, junto con artefactos MLX, permite ejecución en dispositivos móviles y Apple Silicon con huellas de memoria inferiores a 300 MB. La model card especifica un template de prompt propio con etiqueta de idioma (`[SilverLining | lang=xx]`) y parámetros de muestreo deterministas (temp=0.0 o 0.1, repeat_penalty=1.0).

## Capacidades

- Generación de texto conversacional orientada a reformulación cognitiva empática.
- Rechazo de seguridad en casos ambiguos (gray-area safety refusal) entrenado explícitamente.
- Capacidades multilingües en inglés, ucraniano, español, alemán y francés.
- Ejecución on-device en móvil mediante llama.cpp y llamadart, y en Apple Silicon vía MLX.
- Soporte de prompt template específico con etiqueta de idioma por turno.
- Inferencia determinista recomendada (temperatura 0.0–0.1) para respuestas estables.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Aplicación móvil de bienestar emocional: el modelo genera reformulaciones cognitivas empáticas en respuesta a pensamientos del usuario, con un template de prompt específico y un límite de 150 tokens por respuesta, adecuado para sesiones conversacionales breves en el dispositivo.
- Asistente de diario personal multilingüe: al soportar cinco idiomas, puede ofrecer respuestas de reformulación en el idioma del usuario sin conexión a red, usando la etiqueta `lang=` del template.
- Filtrado de seguridad en apps de salud mental: el entrenamiento en gray-area safety refusal permite derivar o rechazar entradas ambiguas de riesgo, integrándose como capa de pre-respuesta en un pipeline móvil.
- Prototipado rápido de asistentes conversacionales: con Q4_K_M de 249 MB y llama.cpp, se puede desplegar en un dispositivo de gama media para validar flujos conversacionales antes de escalar a modelos mayores.
- Investigación en ajuste fino LoRA multilingüe: el repositorio sirve como referencia reproducible de un pipeline mlx-lm LoRA (r=16, alpha=32) sobre Gemma 3 270M con conversión a GGUF.
- Aplicaciones de privacidad estricta: al ejecutarse completamente on-device sin llamadas a API, es apto para procesar texto personal sensible que no debe salir del dispositivo.
- Evaluación de cuantizaciones en móvil: los artefactos Q4_K_M y Q8_0 con hashes SHA-256 publicados permiten comparar calidad y latencia entre cuantizaciones en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 300 MB para Q4_K_M (249,2 MB) y Q8_0 (285,9 MB); el modelo base en safetensors ronda 0,6 GB en el repositorio.
- GPU recomendadas: no requiere GPU dedicada; pensado para CPU móvil, Apple Silicon (MLX) y GPUs de consumo con llama.cpp.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) con holgura extrema; también en dispositivos móviles de gama media.
- Opciones de despliegue: llama.cpp, llamadart, MLX; no se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la configuración recomendada usa n_ctx=1024 y n_predict=150.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| silver-lining-gemma3-gguf | 268 M | no disponible | en, uk, es, de, fr | Gemma | GGUF, MLX, safetensors |
| google/gemma-3-270m-it (base) | 270 M | no disponible | multilingüe (Gemma 3) | Gemma | safetensors, GGUF (comunidad) |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32 K (según model card pública) | multilingüe | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M-Instruct | 360 M | 8 K (según model card pública) | mayoritariamente inglés | Apache 2.0 | safetensors, GGUF |

Nota: los datos de contexto y licencia de los modelos alternativos provienen de sus model cards públicas y no de la información proporcionada en esta ficha; verifíquense en la fuente original. No se dispone de benchmarks comparativos para este ajuste fino.

## Limitaciones y advertencias

- Modelo de 270 M de parámetros: capacidad de razonamiento general, matemáticas y código muy limitada en comparación con modelos de mayor tamaño.
- Entrenado sobre solo 1.600 ejemplos de una tarea concreta; puede degradar el comportamiento general del modelo base fuera del dominio de reformulación cognitiva y rechazo de seguridad.
- Riesgo de alucinación inherente a modelos pequeños, especialmente en preguntas factuales o de conocimiento abierto.
- Sesgos no documentados: la model card no detalla análisis de sesgos ni evaluación de seguridad más allá del entrenamiento de rechazo.
- Contexto efectivo limitado por la configuración recomendada (n_ctx=1024); no se especifica la ventana nativa del modelo base.
- Licencia Gemma: impone restricciones de uso comercial y condiciones de redistribución; revisar los términos de Google antes de producción.
- El template de prompt es específico (`[SilverLining | lang=xx]`); usarlo fuera de él puede producir respuestas degradadas.
- Sin soporte documentado de tool calling, agentes, visión o audio; no apto como sustituto generalista de modelos mayores.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario no verificados.

## Enlaces

- Hugging Face: https://huggingface.co/ihor-matiushenko/silver-lining-gemma3-gguf
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Gemma: https://ai.google.dev/gemma/terms
