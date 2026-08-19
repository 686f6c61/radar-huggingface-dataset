# SolsticeAI/Qwen3.8-27B-Uncensored-mlx-6Bit

## Resumen

SolsticeAI/Qwen3.8-27B-Uncensored-mlx-6Bit es una conversión al formato MLX (Apple Silicon) con cuantización de 6 bits del modelo orcarouter/Qwen3.8-27B-Uncensored, un fine-tuning de la serie Qwen3.8-27B al que se le ha aplicado la técnica de abliteración para eliminar los mecanismos de rechazo y ofrecer respuestas sin censura. El modelo está pensado para entornos de ejecución eficiente en hardware Apple (MLX) y para casos de uso de red-teaming, investigación en alineación y generación de contenido sin restricciones.

Aunque el nombre sugiere 27 mil millones de parámetros, el archivo safetensors del repositorio indica 5.885.566.464 parámetros (~5,9 B), una discrepancia que conviene verificar antes de su uso en producción. El modelo mantiene las capacidades del Qwen3.8 original: razonamiento, function-calling, soporte multilingüe (inglés y chino) y un contexto largo, aunque los valores exactos de contexto no se especifican en la documentación disponible.

La relevancia actual de este modelo radica en su naturaleza "uncensored" y su formato MLX, que permite ejecutarlo de manera eficiente en Macs con Apple Silicon. Es una opción interesante para desarrolladores que necesitan un modelo sin restricciones de seguridad en entornos locales, siempre que asuman los riesgos asociados a la generación de contenido potencialmente dañino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-27B) |
| Parametros totales | 5.885.566.464 (según safetensors; el nombre indica 27B, posible discrepancia) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (se menciona "long-context" en fuentes externas, sin cifra exacta) |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una conversión a MLX 6-bit de un fine-tuning de Qwen3.8-27B, una arquitectura transformer con atención estándar y capacidades avanzadas como multi-token prediction (MTP) y razonamiento, según los tags del repositorio. El proceso de abliteración elimina las direcciones de activación responsables de los rechazos, lo que produce un modelo que responde a peticiones que normalmente serían bloqueadas por políticas de seguridad. La conversión a MLX se realizó con mlx-lm 0.31.2, manteniendo el rendimiento en BF16 con una pérdida mínima (en modelos similares de la misma serie se reporta >99,98% de retención). No se dispone de detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de fine-tuning específico.

## Capacidades

- Generación de texto sin censura: responde a peticiones que otros modelos rechazarían, gracias a la abliteración.
- Razonamiento multi-step y modo "thinking" (etiqueta "reasoning").
- Function calling / tool calling, útil para integraciones con APIs y agentes.
- Capacidades multimodales indicadas por el pipeline_tag "image-text-to-text", aunque no hay confirmación explícita en la documentación.
- Multilingüe: soporta inglés y chino.
- Compatible con MLX, lo que permite ejecución nativa en Apple Silicon.
- Etiquetado como "ai-red-team" y "red-teaming", orientado a pruebas de seguridad ofensiva.

## Casos de uso

- Investigación en alineación y seguridad: el modelo permite estudiar comportamientos sin restricciones y evaluar riesgos de modelos "uncensored" en entornos controlados.
- Red-teaming de sistemas de IA: se puede usar para generar ataques adversariales y probar la robustez de otros modelos o filtros de contenido.
- Generación de código sin restricciones: al no tener rechazos, puede producir código para tareas que otros modelos bloquean (por ejemplo, exploits educativos o análisis de vulnerabilidades).
- Desarrollo de agentes autónomos con function calling: su soporte de tool calling permite integrarlo en pipelines de automatización y agentes conversacionales.
- Prototipado rápido en Apple Silicon: al estar en MLX 6-bit, se ejecuta localmente en Macs con M-series, ideal para desarrollo y pruebas sin GPU dedicada.
- Análisis de contenido multilingüe: su soporte de inglés y chino permite procesar y generar texto en ambos idiomas sin necesidad de modelos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX. El modelo base (Qwen3.8-27B) podría tener métricas en MMLU, HumanEval o GSM8K, pero no están disponibles en la información proporcionada. Como referencia de rendimiento en hardware real, un benchmark de omlx.ai en un Apple M3 Max (40 núcleos GPU, 64 GB) con cuantización 6-bit reporta:

- Prefill: 211,3 tokens/s
- Generación: 16,1 tokens/s
- Tiempo hasta el primer token (TTFT): 4846 ms
- Pico de memoria: 22,1 GB

Estos datos son útiles para estimar la viabilidad en entornos Apple, pero no constituyen una comparativa estándar de calidad.

## Requisitos de hardware

- VRAM estimada: ~22 GB en cuantización 6-bit (según benchmark en M3 Max).
- GPU recomendadas: Apple Silicon con al menos 32 GB de memoria unificada (M3 Pro/Max o superior). En GPUs NVIDIA, se requeriría convertir el modelo a otro formato (por ejemplo, GGUF) y usar una GPU con al menos 24 GB (RTX 3090/4090).
- En consumer GPU: cabe en tarjetas con 24 GB de VRAM, pero requiere conversión de formato.
- Opciones de despliegue: mlx-lm (nativo), vLLM (si se convierte a safetensors estándar), llama.cpp (si se convierte a GGUF).
- Latencia y throughput: en M3 Max, ~16 tokens/s de generación y ~211 tokens/s de prefill, con TTFT de ~4,8 segundos para contexto de 1024 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SolsticeAI/Qwen3.8-27B-Uncensored-mlx-6Bit | 5,9 B (según safetensors) | no disponible | Apache-2.0 | MLX 6-bit | Conversión MLX, uncensored |
| orcarouter/Qwen3.8-27B-Uncensored | 27 B (presumiblemente) | no disponible | Apache-2.0 | Safetensors | Modelo base, sin conversión MLX |
| Qwen3.8-27B (original) | 27 B | no disponible | Apache-2.0 | Safetensors | Modelo oficial de Qwen, con censura |

La comparación se limita a la familia Qwen3.8-27B. No se dispone de datos de otros modelos uncensored comparables en este contexto.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ilegal, peligroso o éticamente cuestionable. Su uso debe restringirse a entornos de investigación controlados.
- Riesgo de alucinaciones: como cualquier LLM, puede inventar información, especialmente en tareas de razonamiento complejo.
- Discrepancia en el número de parámetros: el nombre indica 27B, pero el safetensors muestra ~5,9B. Esto podría deberse a un error de etiquetado o a una poda del modelo; es imprescindible verificar antes de usar.
- Contexto y idiomas limitados: solo se confirman inglés y chino; el contexto exacto no se documenta.
- Sin garantías de rendimiento: no hay benchmarks oficiales publicados; los datos de omlx.ai son de un solo entorno.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado puede violar políticas de plataformas o leyes locales.

## Enlaces

- [HuggingFace - SolsticeAI/Qwen3.8-27B-Uncensored-mlx-6Bit](https://huggingface.co/SolsticeAI/Qwen3.8-27B-Uncensored-mlx-6Bit)
- [Modelo base - orcarouter/Qwen3.8-27B-Uncensored](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored)
- [GitHub - QwenLM/Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Wiro AI - Qwen 3.8 27B Uncensored](https://wiro.ai/models/qwen/qwen3-8-27b-uncensored)
- [MindStudio - Abliteration en Qwen3.8-27B](https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration)
- [Benchmark en omlx.ai (M3 Max)](https://omlx.ai/benchmarks/performance/qc13i63l)
