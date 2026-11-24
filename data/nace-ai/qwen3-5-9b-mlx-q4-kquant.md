# nace-ai/Qwen3.5-9B-MLX-q4-KQuant

## Resumen

Qwen3.5-9B-MLX-q4-KQuant es una cuantización de 4 bits del modelo multimodal Qwen3.5-9B, publicada por nace-ai y empaquetada específicamente para Apple Silicon mediante la librería MLX. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de aproximadamente 9.400 millones de parámetros que acepta entradas de imagen y texto y genera respuestas conversacionales con un modo de razonamiento ("thinking") activado por defecto. Esta versión concreta aplica una cuantización mixta Q4 (4 bits con algunas capas en 5 bits) que, según el autor, reduce la divergencia KL respecto al modelo original en BF16 a 0,030, frente a 0,081 de la cuantización de 4 bits de mlx-community.

La relevancia de este paquete radica en que permite ejecutar un modelo multimodal de casi 10.000 millones de parámetros en Macs con 16 GB de RAM unificada, manteniendo una fidelidad numérica notablemente superior a las cuantizaciones de 4 bits convencionales. El repositorio incluye dos checkpoints (Q4 y Q5) y está pensado para su uso con motores de inferencia nativos de macOS como Kapitsa, mlx-lm, mlx-vlm y LM Studio.

La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la model card solo declara soporte para inglés, lo que limita su adopción directa en entornos multilingües sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 9.409.813.744 (~9,4 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits mixto (down_proj e in_proj_z en 5 bits, ~4,2 bits/peso; 4,7 contando escalas) y 5 bits mixto (5/6/8 bits por tensor, ~5,05 bits/peso; 5,55 contando escalas) |
| Idiomas soportados | en (ingles) segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (packs Q4/ y Q5/) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso de la familia Qwen3.5 con capacidad multimodal de entrada (procesa imágenes y texto y genera texto). Esta publicación no es un modelo entrenado desde cero, sino una cuantización post-entrenamiento del checkpoint BF16 original de Qwen, por lo que los detalles de composición del dataset, número de tokens de entrenamiento y fases de RLHF/DPO no se documentan en la información disponible y corresponden al modelo base.

La innovación técnica de este paquete reside en la estrategia de cuantización: en lugar de aplicar 4 bits uniformes, el autor mantiene ciertas proyecciones críticas (`down_proj` e `in_proj_z`) en 5 bits y usa precisión mixta de 5/6/8 bits por tensor en el checkpoint Q5. Según la model card, esto sitúa la divergencia KL frente al BF16 en 0,030 (Q4) y 0,010 (Q5), con un tamaño de pesos de lenguaje de 5,29 GB en Q4 frente a 5,04 GB de la alternativa de mlx-community. El modelo conserva el modo de razonamiento del original, que genera trazas de pensamiento antes de la respuesta final.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con OpenAI.
- Razonamiento explícito ("thinking mode") activado por defecto; la traza se devuelve en el campo `reasoning_content` y puede desactivarse con `reasoning_effort: none` o `enable_thinking: false`.
- Comprensión de imágenes: acepta entradas `image_url` (URL http(s) o data URL base64) junto con texto.
- Soporte de tool calling / function calling, verificado en Kapitsa, LM Studio, SwiftLM, LocalAI, Osaurus, vllm-mlx y mlx-openai-server (todos colocaron una llamada a herramienta en las pruebas del autor).
- Razonamiento matemático básico y de varios pasos (el ejemplo de la model card resuelve 17 × 23).
- Capacidades multilingües limitadas: la model card solo declara inglés.
- Integración con APIs compatibles con OpenAI, Anthropic y Ollama a través de Kapitsa.

## Casos de uso

- Asistente conversacional local en Mac: desplegado con Kapitsa o mlx-lm, el modelo gestiona diálogos multi-turno con modo de razonamiento y APIs compatibles con OpenAI, Anthropic y Ollama, lo que permite sustituir servicios en la nube por inferencia privada en el propio equipo.
- Análisis de imágenes en escritorio: gracias a la pipeline image-text-to-text, se puede enviar una imagen por URL o base64 y pedir descripciones, extracción de texto o preguntas sobre su contenido, útil para herramientas de accesibilidad o catalogación de fotos.
- Automatización de tareas con tool calling: el soporte verificado de function calling permite construir agentes que invoquen herramientas locales (ficheros, calendario, scripts) desde un servidor MLX en el propio Mac.
- Prototipado de agentes multi-paso: el modo thinking por defecto facilita cadenas de razonamiento para tareas de planificación, y puede desactivarse para reducir latencia en pasos simples.
- Desarrollo y pruebas de aplicaciones de IA sin GPU dedicada: con 6,2 GB de descarga y encaje en 16 GB de RAM unificada, sirve como backend de pruebas para apps que luego se desplegarán contra modelos mayores.
- Educación y experimentación con cuantización: los checkpoints Q4 y Q5, junto con las métricas KL publicadas, permiten estudiar el compromiso entre tamaño y fidelidad en pipelines MLX.
- Asistencia en programación ligera: aunque no se documenta un benchmark de código, el modelo puede integrarse en editores mediante el servidor OpenAI-compatible de mlx-lm para autocompletado y explicación de fragmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de fidelidad de cuantización:

| Metrica | Q4 | Q5 | Referencia |
|---|---|---|---|
| Divergencia KL frente a BF16 | 0,030 | 0,010 | mlx-community 4-bit: 0,081 |
| Tamano de pesos de lenguaje | 5,29 GB | no disponible | mlx-community 4-bit: 5,04 GB |
| Tamano de descarga | 6,2 GB | 7,1 GB | no disponible |
| Bits por peso (sin escalas) | ~4,2 | ~5,05 | no disponible |

## Requisitos de hardware

- VRAM/RAM unificada estimada: 16 GB o más para ambos checkpoints según la regla del autor (descarga + 2 GB para conversación sobre el 67 % de la RAM que macOS asigna por defecto a la GPU).
- GPU recomendadas: Apple Silicon; las pruebas se realizaron en un M5 Pro. No se documenta soporte para GPU NVIDIA o AMD en esta publicación (es un pack MLX).
- Cabe en GPU de consumo: sí, en Macs con 16 GB de memoria unificada o superior; Kapitsa puede encajar en un tamaño inferior si omite partes no usadas.
- Opciones de despliegue: Kapitsa (`kapitsa serve --model 9b:q4`), mlx-lm (`mlx_lm.generate`, `mlx_lm.server`), mlx-vlm, LM Studio con motor MLX, SwiftLM, LocalAI con backend MLX, Osaurus, vllm-mlx y mlx-openai-server.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX (Q4) | ~9,4 B | no disponible | 4-bit mixto MLX | 0,030 | apache-2.0 | Hugging Face |
| mlx-community 4-bit (Qwen3.5-9B) | ~9,4 B | no disponible | 4-bit MLX | 0,081 | apache-2.0 | Hugging Face |
| mlx-community OptiQ (Qwen3.5-9B) | ~9,4 B | no disponible | optimizada MLX | no disponible | apache-2.0 | Hugging Face |
| mlx-works oQ4e-mtp (Qwen3.5-9B) | ~9,4 B | no disponible | 4-bit MLX | no disponible | no disponible | Hugging Face |
| lmstudio-community 4-bit (Qwen3.5-9B) | ~9,4 B | no disponible | 4-bit MLX | no disponible | no disponible | Hugging Face |
| Brooooooklyn UD-Q4_K_XL (Qwen3.5-9B) | ~9,4 B | no disponible | 4-bit GGUF | no disponible | no disponible | Hugging Face |

Todas las alternativas comparadas son cuantizaciones del mismo modelo base Qwen3.5-9B; la diferencia principal es la fidelidad de cuantización y el ecosistema de inferencia (MLX frente a GGUF). Los datos de KL para las alternativas distintas de mlx-community 4-bit no se detallan en la información disponible.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado y podría degradarse.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo thinking por defecto no elimina este riesgo y aumenta el consumo de tokens.
- La longitud de contexto no se documenta en esta publicación; conviene consultar la model card del modelo base Qwen/Qwen3.5-9B antes de diseñar aplicaciones con ventanas largas.
- El paquete está atado al ecosistema MLX y Apple Silicon; no es directamente utilizable en CUDA, ROCm ni en servidores x86 sin conversión.
- La cuantización introduce degradación numérica respecto a BF16 (KL 0,030 en Q4), que puede afectar a tareas sensibles a la precisión como matemáticas complejas o código.
- Aunque la licencia Apache 2.0 permite uso comercial, deben respetarse las condiciones del modelo base y verificar que la cuantización no altera obligaciones de atribución.
- El número de descargas (352) y likes (1) es bajo, por lo que la validación comunitaria es limitada; las pruebas del autor se hicieron en un único M5 Pro.
- Las estimaciones de encaje en RAM son heurísticas del autor, no mediciones; se recomienda ejecutar `kapitsa doctor` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de Kapitsa: https://github.com/nace-ai/kapitsa
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
- Documentación de mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Página de LM Studio: https://lmstudio.ai
