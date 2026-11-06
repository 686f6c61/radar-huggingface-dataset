# hakunokina/Tess-4.5-27B-oQ8e-mtp

## Resumen

Tess-4.5-27B-oQ8e-mtp es una compilación cuantizada en formato MLX del modelo migtissera/Tess-4.5-27B, un ajuste fino orientado a ingeniería agéntica desarrollado por Migel Tissera (Continuity Research) sobre la base Qwen3.8-27B del equipo Qwen. Esta versión concreta la publica el usuario hakunokina y aplica la cuantización oQ8e de oMLX, una cuantización afín de 8 bits con calibración por imatrix, conservando la cabeza MTP (multi-token prediction) del modelo original para habilitar decodificación especulativa.

El modelo resuelve el problema de ejecutar un modelo denso de 27B con capacidades agénticas y de tool use en hardware Apple Silicon, donde el ecosistema MLX es el camino nativo. Frente al BF16 original (~54 GB), esta build ocupa unos 28 GB, lo que la hace viable en equipos con memoria unificada amplia. Mantiene el contexto de 262k tokens, el codificador de visión y el modo de razonamiento activado por defecto.

Es relevante ahora porque el modelo base no ofrece build oficial en MLX ni en oQ, y esta compilación cubre ese hueco con una divergencia medida muy baja respecto al BF16 (KL media de 0,0011 nat/token y 98,5 % de acuerdo top-1), además de integrarse con las APIs de OpenAI y Anthropic a través de oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (híbrido Gated DeltaNet + atención), 64 capas |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | oQ8e (8 bits afín, grupo 64, calibrado con imatrix); disponibles también oQ6e (~22 GB) y oQ4e (~16 GB) |
| Idiomas soportados | no disponible (calibración multilingüe en inglés, turco y código; sin lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), ~28 GB; repo de 30,0 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros con arquitectura de la familia Qwen3.5, que combina capas de Gated DeltaNet (atención lineal) con capas de atención completa; de las 64 capas totales, 16 son de atención completa, lo que determina el coste de la caché KV. El ajuste fino de Tess-4.5 lo realiza Continuity Research para tareas de codificación agéntica y uso de herramientas, con el modo de razonamiento activado por defecto. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Esta build concreta no reentrena nada: parte del BF16 original y aplica la cuantización oQ8e de oMLX, calibrada con un conjunto propio de código y contenido multilingüe mediante imatrix. Conserva la cabeza MTP del modelo fuente, que oMLX puede emplear para decodificación especulativa, y mantiene el codificador de visión, aunque la entrada de imagen no se ha probado en esta compilación.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto.
- Generación y edición de código, con especialización en flujos de ingeniería agéntica.
- Tool calling y function calling: validado con 5/5 ejecuciones correctas tanto en la API de Anthropic (`/v1/messages`) como en la de OpenAI (`/v1/chat/completions`).
- Razonamiento multi-paso y uso en agentes, con contexto de 262k tokens para trayectorias largas.
- Entrada de imagen: el codificador de visión se conserva, pero no se ha probado en esta build.
- Decodificación especulativa mediante la cabeza MTP preservada.
- Capacidades multilingües: la calibración incluye inglés, turco y código; no hay lista oficial de idiomas.

## Casos de uso

- Asistente de codificación en local sobre Mac: con ~28 GB de pesos y decodificación a ~39 tok/s en un M3 Ultra, se puede mantener un agente de programación con contexto largo sin depender de la nube.
- Automatización de tool calling en pipelines internos: el modelo responde de forma fiable a definiciones de herramientas reales en las APIs de OpenAI y Anthropic, lo que permite integrarlo como backend de agentes que invocan funciones del sistema.
- Refactorización de repositorios grandes: los 262k tokens de contexto permiten cargar varios ficheros y trazas de error en una sola conversación, útil para tareas de análisis y parcheo multi-fichero.
- Atención al cliente con contexto extenso: la ventana de 262k tokens admite historiales de conversación largos y documentación de referencia en el mismo prompt.
- Procesamiento de documentación técnica multilingüe: la calibración incluye inglés y turco, y el modelo soporta instrucciones en varios idiomas, adecuado para resúmenes y extracción de datos de manuales.
- Evaluación de modelos en investigación: al ser una cuantización con divergencia medida frente al BF16, sirve para estudiar el impacto de la cuantización de 8 bits en tareas agénticas sobre Apple Silicon.
- Despliegue en estación de trabajo con API compatible: oMLX expone endpoints de OpenAI y Anthropic, lo que facilita sustituir un proveedor externo por inferencia local en prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta build. La model card reporta divergencia respecto al BF16 y métricas de velocidad:

| Metrica | Valor |
|---|---|
| KL(BF16 ‖ oQ8e), media | 0,0011 nat/token |
| KL mediana / p99 | 0,00049 / 0,0094 |
| Acuerdo top-1 de token | 98,5 % |
| Perplejidad BF16 → oQ8e | 6,048 → 6,049 |
| Prefill, prompt de ~29k tokens (en frío) | ~76 s (~380 tok/s) |
| Prefill con caché de prefijo | ~1,4 s |
| Decodificación con MTP | ~39 tok/s |
| Tool calling (Anthropic / OpenAI, 5 ejecuciones) | 5/5 / 5/5 |

El modelo base BF16 reporta BenchLocal 133/150 (mejor de tres) según la model card de origen, a la altura de Qwen3.8-27B. Las mediciones de velocidad son de una sola ejecución en un Mac Studio M3 Ultra de 512 GB con oMLX 0.7.1.

## Requisitos de hardware

- VRAM/memoria unificada: ~28 GB para los pesos en oQ8e; añadir caché KV de ~64 KB por token en las 16 capas de atención completa, lo que supone ~16 GB con 262k tokens de contexto.
- Alternativas de tamaño: oQ6e ~22 GB y oQ4e ~16 GB, útiles para equipos con menos memoria.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; las mediciones publicadas corresponden a un Mac Studio M3 Ultra de 512 GB.
- No está pensado para GPUs NVIDIA ni para hardware consumer x86; requiere el runtime MLX de Apple.
- Despliegue: oMLX ≥ 0.7.1, que sirve las APIs de OpenAI y Anthropic en localhost. No se ha probado con `mlx-lm` estándar ni con LM Studio.
- Latencia y throughput: ~380 tok/s de prefill en frío con 29k tokens, ~39 tok/s de decodificación con decodificación especulativa MTP; el rendimiento varía con la longitud de contexto y la previsibilidad de la salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Tess-4.5-27B-oQ8e-mtp (esta build) | 27,8B denso | 262k | MLX safetensors, oMLX | Apache-2.0 | 8 bits con imatrix, MTP conservado, visión incluida |
| migtissera/Tess-4.5-27B (fuente) | 27B denso | 262k | BF16 y GGUF | Apache-2.0 | Sin build MLX; BenchLocal 133/150 |
| Qwen/Qwen3.8-27B (base) | 27B denso | no disponible en la información | safetensors | no disponible en la información | Modelo base del ajuste fino |
| Tess-4.5-27B-oQ6e-mtp / oQ4e-mtp | 27B denso | 262k | MLX safetensors, oMLX | Apache-2.0 | Misma familia, menor huella (~22 GB / ~16 GB) |

## Limitaciones y advertencias

- No se han ejecutado suites de benchmarks sobre esta build; la calidad se reporta únicamente como divergencia frente al BF16, no como rendimiento absoluto en tareas.
- La entrada de imagen no se ha probado en esta compilación, pese a conservar el codificador de visión.
- Requiere oMLX ≥ 0.7.1; no es compatible de forma verificada con `mlx-lm` estándar ni con LM Studio, lo que limita las opciones de despliegue.
- Dependencia de hardware Apple Silicon: no se puede ejecutar en GPUs NVIDIA ni en servidores x86 convencionales.
- La decodificación especulativa MTP rinde de forma variable según la previsibilidad de la salida; las cifras de velocidad son de una sola ejecución.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay datos publicados sobre sesgos específicos de este ajuste fino.
- La lista de idiomas soportados no está documentada; la calibración cubre inglés, turco y código, pero no garantiza calidad en otros idiomas.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; conviene verificar las condiciones del modelo fuente y de los datos de ajuste fino antes de producción.
- El contexto de 262k exige ~16 GB adicionales de caché KV, lo que puede agotar la memoria en equipos con menos de 48 GB unificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hakunokina/Tess-4.5-27B-oQ8e-mtp
- Modelo base (ajuste fino): https://huggingface.co/migtissera/Tess-4.5-27B
- Versión GGUF del modelo base: https://huggingface.co/migtissera/Tess-4.5-27B-GGUF
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización oQ6e: https://huggingface.co/hakunokina/Tess-4.5-27B-oQ6e-mtp
- Cuantización oQ4e: https://huggingface.co/hakunokina/Tess-4.5-27B-oQ4e-mtp
- oMLX: https://omlx.ai
