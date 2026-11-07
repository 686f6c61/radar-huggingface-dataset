# Outlier-Ai/Outlier-Code-27B-MLX-4bit

## Resumen
Outlier Code 27B (MLX 4-bit) es una conversión cuantizada a 4 bits en formato MLX del modelo base Qwen/Qwen3.6-27B, publicada por Outlier-Ai. No se trata de un modelo entrenado desde cero, sino de un artefacto de conversión: los pesos subyacentes son los de Qwen3.6-27B y la licencia Apache 2.0 se hereda del modelo original. La variante "Code" se diferencia de la variante "Core" del mismo autor únicamente en la plantilla de chat, una temperatura por defecto más baja y un system prompt especializado en código; los safetensors son idénticos.

El modelo cuenta con 26.895.998.464 parámetros totales (aproximadamente 26,9 mil millones) y un repositorio de 15,2 GB, coherente con una cuantización de 4 bits. Está empaquetado específicamente para Apple Silicon mediante la librería mlx-lm, con el objetivo de ejecutar inferencia local en Mac (M1, M2, M3, M4) sin dependencia de la nube. Su orientación declarada es la generación de código, la edición asistida de repositorios, el razonamiento con modo "thinking" y el uso de herramientas (function calling).

Es relevante ahora porque permite disponer de un modelo de casi 27B parámetros, con capacidades de agente y tool use, ejecutándose de forma privada y offline en hardware de consumo de Apple, algo que hasta hace poco requería GPUs dedicadas de gama alta. La ficha se limita a los datos publicados por el autor; los detalles de entrenamiento del modelo base no se documentan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.6; tag qwen3_5); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo base Qwen3.6-27B más allá de su pertenencia a la familia Qwen3.6 (etiquetada también como qwen3_5 en los tags) y de que se trata de un transformer de aproximadamente 26,9 mil millones de parámetros. No se especifican número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Tampoco se documentan los datos de entrenamiento del modelo base: ni volumen de tokens, ni composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. Lo que sí describe el autor es el proceso de esta publicación concreta: una conversión de los pesos de Qwen3.6-27B a 4 bits en formato MLX, junto con una plantilla de chat específica para código, temperatura reducida y un system prompt orientado a tareas de programación. Es, por tanto, un artefacto de conversión y configuración, no un ajuste fino con nuevos datos.

## Capacidades
- Generación de texto conversacional y de código en múltiples lenguajes de programación.
- Razonamiento con modo "thinking" (etiqueta thinking en los tags).
- Tool calling y function calling, orientado a flujos de agente.
- Uso en tareas agénticas y de razonamiento multi-paso (tag agentic).
- Completado y generación de código, incluida edición consciente de repositorio según la descripción del autor.
- Capacidades multilingües en 15 idiomas: inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local y offline en Apple Silicon (sin nube, "private-ai").
- No se declaran capacidades de visión ni de audio para esta variante.

## Casos de uso
- Asistente de programación local en Mac: el modelo se integra en editores o terminales mediante mlx-lm para autocompletar y generar funciones sin enviar código a servicios externos, aprovechando su ejecución on-device.
- Edición asistida de repositorios: con la plantilla de chat y el system prompt de código, puede recibir fragmentos de varios ficheros y proponer cambios coherentes, útil para refactorizaciones guiadas.
- Agentes de desarrollo con tool calling: al soportar function calling, puede encadenar llamadas a herramientas (ejecutar tests, consultar documentación, abrir issues) en pipelines de automatización local.
- Revisión de código y explicación de errores: genera explicaciones de stack traces y sugerencias de corrección en conversaciones multi-turno, manteniendo la privacidad del código revisado.
- Prototipado y aprendizaje sin coste de API: estudiantes o desarrolladores pueden experimentar con un modelo de ~27B en su propio portátil Apple sin cuotas de tokens.
- Generación de código en entornos con restricciones de cumplimiento: sectores que no pueden enviar propiedad intelectual a la nube pueden desplegar este modelo de forma totalmente offline.
- Automatización de tareas de scripting y glue code: generación de scripts de shell, Python o SQL para tareas repetitivas dentro de flujos internos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Verificado |
|---|---|---|---|
| HumanEval (split test) | pass@1 | 0,8659 (86,59 %) | No (declarado por el autor) |

El autor remite a outlier.host/benchmarks para cifras de MMLU, HumanEval y velocidad de inferencia en Mac con procedencia detallada (fichero fuente, comando, n, error estándar, fecha), pero esos datos no se incluyen en la información disponible. No se han publicado en esta ficha resultados de MMLU, GSM8K ni otras pruebas, por lo que no se presentan.

## Requisitos de hardware
- El repositorio ocupa 15,2 GB, por lo que se necesita al menos ese espacio libre en disco para los pesos.
- VRAM/unified memory estimada: al ser MLX sobre Apple Silicon, la memoria unificada debe acomodar los pesos de 4 bits (~15 GB) más el overhead de inferencia; se recomienda un Mac con 24 GB o más de memoria unificada para margen operativo. Cifra exacta no disponible.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4) según los tags; no está pensado para CUDA (A100, H100, RTX 4090) en este formato.
- Cabe en equipos de consumo Apple: MacBook Air, MacBook Pro, Mac mini y Mac Studio con memoria suficiente; los modelos con 16 GB de memoria unificada quedan al límite y no se garantizan.
- Opciones de despliegue: mlx-lm (comando `python -m mlx_lm.generate` o API Python `load`/`generate`) y la aplicación Outlier para macOS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos pesos MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Outlier Code 27B MLX 4-bit | ~26,9B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Variante de código sobre Qwen3.6-27B |
| Outlier Core 27B MLX 4-bit | ~26,9B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Mismos pesos, plantilla de chat general |
| Outlier Quick 26B-A4B MoE MLX 4-bit | no disponible (MoE) | no disponible | MLX safetensors 4-bit | Apache 2.0 | Variante MoE del lineup, ~16 GB |
| Qwen/Qwen3.6-27B | ~26,9B (base) | no disponible | safetensors (original) | Apache 2.0 | Modelo base sin cuantizar |

Las cifras de rendimiento comparadas entre estos modelos no están disponibles en la información proporcionada, salvo el HumanEval pass@1 de 0,8659 de esta variante.

## Limitaciones y advertencias
- Es un artefacto de conversión: no incorpora entrenamiento adicional; su calidad depende enteramente de Qwen3.6-27B y de la configuración de chat aplicada.
- El resultado de HumanEval está marcado como no verificado; debe tratarse como dato declarado por el autor, no auditado de forma independiente.
- Riesgo de alucinación inherente a los modelos de lenguaje; en código puede producir APIs inexistentes o dependencias inventadas, por lo que requiere revisión y tests.
- No se documentan sesgos específicos del modelo base en la información disponible.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en repositorios o conversaciones muy largas.
- Compatibilidad limitada a Apple Silicon y a la librería mlx-lm; no es portable a CUDA ni a otros runtimes sin reconversión.
- Los 16 GB de memoria unificada pueden ser insuficientes para uso cómodo; conviene verificar antes del despliegue.
- La licencia Apache 2.0 permite uso comercial, pero al heredarse del modelo base conviene revisar los términos del repositorio original de Qwen3.6-27B.
- La model card promociona la aplicación Outlier (versión Pro de pago único de 49 USD); esa información comercial no afecta a la licencia de los pesos, pero debe distinguirse del uso técnico del modelo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Code-27B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Variante Core: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Variante Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Variante Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Variante Quick 26B-A4B MoE: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Variante Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- Benchmarks del autor: https://outlier.host/benchmarks
- Aplicación Outlier: https://outlier.host/
- Captura del selector de tiers: https://outlier.host/screenshots/tier-picker.png
