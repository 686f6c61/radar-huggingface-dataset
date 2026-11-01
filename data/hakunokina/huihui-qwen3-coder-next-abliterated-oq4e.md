# hakunokina/Huihui-Qwen3-Coder-Next-abliterated-oQ4e

## Resumen

Huihui-Qwen3-Coder-Next-abliterated-oQ4e es una compilación cuantizada del modelo Qwen3-Coder-Next en su variante "abliterated" (con el comportamiento de rechazo eliminado a nivel de pesos), publicada por el usuario hakunokina. Se trata de una cuantización de 4 bits en formato MLX, generada con la herramienta oMLX (esquema oQ4e, calibrada con imatrix) a partir de la fuente en BF16 de huihui-ai. El modelo original pertenece a la familia Qwen3-Next del equipo Qwen y está especializado en código y tareas de agente, sin modo de razonamiento explícito (non-thinking).

Arquitectónicamente es un transformer híbrido con mezcla de expertos: aproximadamente 80.000 millones de parámetros totales con unos 3.000 millones activos por token (512 expertos, top-10, más un experto compartido), 48 capas y una ventana de contexto de 262.144 tokens. Combina capas de Gated DeltaNet con atención con compuerta, reservando la atención completa para cada cuarta capa. El resultado es un modelo grande en almacenamiento pero con un coste de cómputo por token propio de un modelo mucho más pequeño.

Su relevancia práctica radica en que permite ejecutar un modelo de ~80B en equipos Apple Silicon con memoria unificada de 64 GB, gracias a la cuantización a 4 bits efectivos (4,61 bits por peso) que reduce el repositorio de ~159 GB en BF16 a unos 46 GB. La contrapartida es una pérdida medible de fidelidad respecto a la fuente, por lo que el autor recomienda la variante oQ6e para trabajo de código largo o sutil y reservar esta oQ4e para entornos con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con Gated DeltaNet + atención con compuerta (atención completa cada 4 capas) |
| Parametros totales | 79.674.391.296 (~80B) |
| Parametros activos | ~3B (512 expertos, top-10, más un experto compartido) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | oQ4e: 4 bits afín, group size 64, 314 tensores sensibles a 8 bits y 36 a 5 bits; 4,61 bits/peso efectivos. Existe también oQ6e (~65 GB) |
| Idiomas soportados | No disponible en la información proporcionada (la calibración imatrix usó un conjunto multilingüe de código: `oqe_code_multilingual`) |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3-Coder-Next) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); no se distribuye GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-Next emplea una arquitectura híbrida que intercala capas de Gated DeltaNet (un mecanismo de estado lineal recurrente) con capas de atención con compuerta, activando atención completa únicamente en cada cuarta capa. Sobre esa columna vertebral se dispone una mezcla de expertos con 512 expertos pequeños y enrutamiento top-10 más un experto compartido, lo que da ~80B parámetros totales con ~3B activos por token. Consta de 48 capas y soporta 262k tokens de contexto. Es un modelo orientado a código y agentes, sin cabecera MTP (multi-token prediction) y sin modo de pensamiento explícito.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original; esos datos corresponden a la model card de Qwen y no se incluyen aquí. La variante "abliterated" de huihui-ai modifica los pesos para eliminar el comportamiento de rechazo, y esta compilación concreta aplica una cuantización de 4 bits calibrada con imatrix sobre el conjunto `oqe_code_multilingual`, manteniendo a mayor precisión (8 y 5 bits) 350 tensores identificados como sensibles a la cuantización.

## Capacidades

- Generación de texto y código: modelo especializado en programación (Coder), con soporte para múltiples lenguajes de programación.
- Razonamiento y resolución de problemas de código, sin modo de pensamiento explícito (non-thinking).
- Tool calling / function calling: validado por el autor con 5/5 ejecuciones correctas tanto en la API Anthropic (`/v1/messages`) como en la OpenAI (`/v1/chat/completions`).
- Capacidades de agente y razonamiento multi-paso, orientadas a flujos de trabajo con herramientas.
- Contexto largo de 262k tokens, adecuado para repositorios completos o conversaciones extensas.
- Capacidades multilingües: no detalladas en la información disponible; la calibración imatrix incluyó código multilingüe, prosa en inglés y turco.
- Comportamiento "uncensored": el rechazo fue eliminado a nivel de pesos por el autor upstream, por lo que el modelo obedecerá instrucciones que de otro modo rechazaría.
- Sin capacidades de visión ni audio documentadas.

## Casos de uso

- Asistencia de código en local sobre Apple Silicon: con ~46 GB de pesos, el modelo cabe en Macs de 64 GB de memoria unificada, permitiendo un asistente de programación privado sin conexión a servicios externos.
- Refactorización y análisis de repositorios completos: la ventana de 262k tokens permite cargar varios ficheros o un repositorio de tamaño medio en una sola pasada para tareas de comprensión y edición.
- Agentes de codificación con tool calling: los parsers de tool calling incluidos (para vLLM/SGLang) y la validación 5/5 en APIs OpenAI y Anthropic lo hacen apto para pipelines de agente que invocan herramientas externas.
- Generación de tests y documentación: el modelo puede producir pruebas unitarias y docstrings a partir de firmas de funciones y contexto de proyecto, integrándose en flujos de CI.
- Prototipado rápido en entornos con memoria limitada: cuando no se dispone de GPU de datacenter, esta cuantización permite trabajar con un modelo de ~80B en hardware de consumo Apple.
- Experimentación en investigación sobre alineación y comportamiento: al ser una variante abliterated, sirve para estudiar diferencias de comportamiento respecto al modelo original, siempre con las cautelas legales y éticas correspondientes.
- Despliegue de servidor local compatible con APIs OpenAI/Anthropic: oMLX expone ambos formatos, lo que facilita sustituir un endpoint en la nube por uno local en herramientas que ya hablan esos protocolos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta compilación en la información disponible. El autor reporta únicamente métricas de divergencia respecto a la fuente BF16 y de velocidad.

| Métrica | Valor |
|---|---|
| KL(BF16 ‖ oQ4e), media | 0,119 nat/token |
| KL mediana / p99 | 0,015 / 1,45 |
| Acuerdo top-1 de token | 88,8 % |
| Perplejidad BF16 → oQ4e | 6,128 → 6,365 (+3,9 %) |

| Medición de velocidad (Mac Studio M3 Ultra, 512 GB, oMLX 0.7.3) | Valor |
|---|---|
| Prefill, prompt de ~27k tokens (caché fría) | ~14 s (~1.880 tok/s) |
| Mismo prefijo con caché de prefijo | ~0,70 s |
| Decodificación | ~72 tok/s |
| Tool calling (Anthropic / OpenAI, 5 ejecuciones cada una) | 5/5 / 5/5 |

## Requisitos de hardware

- VRAM/memoria estimada: ~46 GB (43 GiB) para esta cuantización oQ4e; ~65 GB para la variante oQ6e; ~159 GB para la fuente BF16.
- Entorno objetivo: Apple Silicon con memoria unificada; el autor indica que cabe en Macs de 64 GB y lo ha probado en un Mac Studio M3 Ultra de 512 GB.
- GPU: no se documenta soporte para GPU NVIDIA ni CUDA en esta compilación; está construida y probada con oMLX 0.7.3 y no se ha validado con `mlx-lm` estándar ni con LM Studio.
- Cabe en GPU de consumo: no disponible para NVIDIA; en Apple Silicon requiere al menos 64 GB de memoria unificada.
- Opciones de despliegue: oMLX 0.7.3 (servidor con APIs OpenAI y Anthropic en el puerto 8000). Para vLLM/SGLang se incluyen los helpers de tool calling de la fuente, pero esta cuantización MLX no está pensada para esos motores.
- Latencia y throughput: ~1.880 tok/s en prefill y ~72 tok/s en decodificación en el hardware citado; la primera petición de ~27k tokens, incluyendo carga del modelo, tardó ~16 s.
- Muestreo recomendado por Qwen3-Coder: temperature 0.7, top_p 0.8, top_k 20, repetition_penalty 1.05.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3-Coder-Next-abliterated-oQ4e (este) | ~80B totales / ~3B activos | 262k | 4 bits MLX (4,61 bits/peso) | Apache-2.0 | HuggingFace, formato MLX |
| Huihui-Qwen3-Coder-Next-abliterated-oQ6e | ~80B totales / ~3B activos | 262k | 6 bits MLX (~65 GB) | Apache-2.0 | HuggingFace, formato MLX |
| huihui-ai/Huihui-Qwen3-Coder-Next-abliterated (fuente) | ~80B totales / ~3B activos | 262k | BF16 (~159 GB) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-Coder-Next (original) | ~80B totales / ~3B activos | 262k | BF16 y otras | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo ha sido eliminado a nivel de pesos; obedecerá instrucciones que el modelo original rechazaría. El usuario es responsable del uso y del cumplimiento legal aplicable.
- Pérdida de calidad por cuantización: +3,9 % de perplejidad y 88,8 % de acuerdo top-1 frente a BF16; el autor recomienda oQ6e para código largo o sutil y reservar oQ4e cuando la memoria sea la restricción.
- La arquitectura híbrida de Qwen3-Next (Gated DeltaNet, 512 expertos pequeños) es sensible a la cuantización, lo que agrava la degradación a 4 bits.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad para esta compilación.
- Sesgos: no documentados en la información disponible.
- Idiomas: no se detalla la cobertura lingüística oficial; la calibración solo documenta código multilingüe, prosa en inglés y turco.
- Compatibilidad: probado solo con oMLX 0.7.3; no validado con `mlx-lm` estándar ni LM Studio, y no orientado a vLLM/SGLang en esta cuantización.
- Sin cabecera MTP, por lo que no se beneficia de decodificación especulativa basada en multi-token prediction.
- Licencia Apache-2.0 permite uso comercial, pero la naturaleza uncensored puede entrar en conflicto con políticas de contenido de plataformas o con normativa sectorial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hakunokina/Huihui-Qwen3-Coder-Next-abliterated-oQ4e
- Variante oQ6e: https://huggingface.co/hakunokina/Huihui-Qwen3-Coder-Next-abliterated-oQ6e
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-Next-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Licencia upstream: https://huggingface.co/Qwen/Qwen3-Coder-Next/blob/main/LICENSE
- oMLX: https://omlx.ai
