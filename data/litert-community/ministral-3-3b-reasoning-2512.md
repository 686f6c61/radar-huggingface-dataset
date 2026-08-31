# litert-community/Ministral-3-3B-Reasoning-2512

## Resumen

Ministral-3-3B-Reasoning-2512 es un modelo de lenguaje de 3B parámetros desarrollado por Mistral AI, diseñado para razonamiento paso a paso y despliegue en dispositivos edge. Esta versión publicada por litert-community es una conversión del modelo original al formato LiteRT-LM (`.litertlm`), optimizada para inferencia on-device con el runtime de Google LiteRT-LM, el motor que impulsa los modelos oficiales de la comunidad litert-community. Se trata de una conversión solo texto: se elimina la torre de visión Pixtral del modelo base, quedando únicamente el decodificador de texto.

El modelo base forma parte de la familia Ministral 3, que según el paper técnico disponible en arXiv incluye tres tamaños (3B, 8B y 14B), todos descendientes de Mistral Small 3.1 mediante un enfoque de destilación en cascada (Cascade Distillation). La variante de razonamiento soporta contextos de hasta 128k tokens en su versión original, aunque esta conversión LiteRT limita la caché KV a 4096 tokens. La cuantización int4 blockwise con clipping OCTAV permite reducir el archivo a aproximadamente 2,2 GB, manteniendo un rendimiento competitivo en tareas de razonamiento matemático: alcanza un 90,7% en GSM8K evaluado con 0-shot chain-of-thought y un presupuesto generoso de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (solo texto; se elimina la torre de visión del modelo base) |
| Parametros totales | 3B (aproximado, según familia Ministral 3) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (caché KV en esta conversión); el modelo base soporta hasta 128k |
| Tipos de cuantizacion | int4 blockwise (bloque 32), simétrica, clipping OCTAV; embeddings y lm_head atados en INT8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM que incluye tokenizador y plantilla de chat) |

## Arquitectura y entrenamiento

El modelo original de Mistral AI emplea una arquitectura transformer decoder-only con atención estándar, entrenado mediante Cascade Distillation a partir de Mistral Small 3.1. La variante de razonamiento incorpora cadenas de pensamiento explícitas antes de emitir la respuesta final, lo que mejora el rendimiento en tareas aritméticas y lógicas. Esta conversión de litert-community mantiene la arquitectura del decodificador de texto, pero descarta el codificador de visión, y aplica una cuantización int4 por bloques de 32 elementos con recorte óptimo OCTAV (data-free) para preservar la precisión frente a un esquema min-max ingenuo. El cómputo resultante es completamente entero, lo que permite ejecución eficiente en CPUs y GPUs móviles. El bundle `.litertlm` incorpora el tokenizador y la plantilla de chat nativa de Mistral (`[INST] ... [/INST]`, token de parada `</s>`).

## Capacidades

- Generación de texto con razonamiento paso a paso (chain-of-thought): el modelo trabaja el problema de forma explícita antes de dar la respuesta final, terminando limpiamente en el token `</s>`.
- Razonamiento matemático y lógico: evaluado en GSM8K con 90,7% de precisión en 0-shot con cadena de pensamiento.
- Ejecución completamente on-device: compatible con el runtime LiteRT-LM y la app Google AI Edge Gallery, sin necesidad de servidor.
- Soporte de plantilla de chat nativa Mistral: formato `[INST]` integrado en el bundle, sin configuración adicional.
- Inferencia con backend GPU o CPU: en Apple M4 Max alcanza 95,8 tok/s de decodificación en GPU Metal y 22,4 tok/s en CPU.
- No incluye capacidades de visión en esta conversión (solo texto), aunque el modelo base original sí las tiene.
- No se documenta soporte de tool calling ni function calling en la información disponible.

## Casos de uso

- Asistentes personales en smartphone: el modelo cabe en dispositivos con 8 GB de RAM (modo CPU) y ofrece respuestas razonadas sin conexión, ideal para privacidad y latencia cero en red. Se integraría mediante la app Google AI Edge Gallery o el runtime LiteRT-LM.
- Chatbots de atención al cliente en dispositivos edge: gracias a su capacidad de razonamiento, puede resolver consultas que requieren varios pasos de lógica (por ejemplo, cálculos de facturación o políticas de devolución) manteniendo el contexto en la ventana de 4096 tokens.
- Tutor de matemáticas offline: el 90,7% en GSM8K lo hace útil para explicar problemas aritméticos paso a paso en aplicaciones educativas sin conexión, mostrando el razonamiento intermedio al estudiante.
- Análisis de texto en dispositivos industriales: por su tamaño reducido (~2,2 GB) y cómputo entero, puede desplegarse en hardware embebido o tablets para resumir informes, extraer conclusiones o clasificar contenido.
- Generación de código asistida en entornos aislados: aunque no se documenta tool calling, puede producir fragmentos de código o explicaciones técnicas en dispositivos sin acceso a la nube, útil para desarrolladores en campo.
- Demostraciones y prototipos de IA generativa en móviles: desarrolladores pueden usar la app AI Edge Gallery para probar el modelo en un teléfono y validar la viabilidad de productos de IA local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El modelo fue evaluado en GSM8K (n=150, greedy, 0-shot chain-of-thought, max-tokens 2048) por el autor de la conversión. Se compara con la versión Instruct del mismo modelo base en formato LiteRT.

| Modelo | GSM8K |
|---|---|
| Ministral-3-3B-Reasoning-2512 (LiteRT int4 block32 + OCTAV) | 90,7% |
| Ministral-3-3B-Instruct-2512 (LiteRT, mismo esquema de cuantización) | 85,0% |

Además, se reportan métricas de rendimiento de inferencia en Apple M4 Max (litert-lm 0.15.0, prefill 256 tokens, decode 256 tokens, 3 ejecuciones):

| Dispositivo | Backend | Prefill | Decode | TTFT | Carga |
|---|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 123 tok/s | 22,4 tok/s | 2,41 s | — |
| Apple M4 Max (macOS) | GPU (Metal) | 1241 tok/s | 95,8 tok/s | 0,23 s | — |

No se han publicado más resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del archivo: ~2,2 GB (`model.litertlm`), con embeddings externalizados para que cada sección sea menor de 2 GiB y pueda cargarse en iOS.
- VRAM/RAM estimada: en Android, el backend GPU requiere aproximadamente 2× el tamaño del modelo (pesos más la caché de pesos GPU de ML Drift), por lo que se recomiendan dispositivos con 12 GB+ de RAM para GPU; en 8 GB solo está disponible CPU y hay que liberar RAM antes de cargar.
- GPU recomendadas: Apple M4 Max (GPU Metal) ofrece 95,8 tok/s de decodificación; en un iPhone 17 Pro carga y genera correctamente (sin tiempos medidos). En Android, un Samsung Galaxy S26 (SM-S942Q / SM8850) ejecuta el backend GPU con un pico de memoria de 1159 MB.
- Opciones de despliegue: runtime LiteRT-LM (`litert_lm_main`), app Google AI Edge Gallery (v1.0.16+ puede importar modelos directamente desde Hugging Face), o integración manual en aplicaciones Android/iOS.
- Latencia y throughput: en Apple M4 Max GPU, TTFT de 0,23 s y decodificación de 95,8 tok/s; en CPU, TTFT de 2,41 s y 22,4 tok/s (con una variabilidad de aproximadamente ±7% en CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|---|
| Ministral-3-3B-Reasoning-2512 (LiteRT) | 3B | 4096 (conversión) / 128k (base) | int4 blockwise + OCTAV | 90,7% | Apache-2.0 | `.litertlm` |
| Ministral-3-3B-Instruct-2512 (LiteRT) | 3B | 4096 (conversión) / 128k (base) | int4 blockwise + OCTAV | 85,0% | Apache-2.0 | `.litertlm` |
| Ministral-3-3B-Reasoning-2512 (original, sin cuantizar) | 3B | 128k | fp16/bf16 | No disponible | Apache-2.0 | safetensors |

La comparación se limita a los modelos de la misma familia y conversión, ya que no se dispone de datos de otros modelos on-device comparables en la información proporcionada.

## Limitaciones y advertencias

- La ventana de contexto efectiva en esta conversión es de 4096 tokens (caché KV), muy inferior a los 128k del modelo base, lo que limita tareas con historial largo o documentos extensos.
- Es una conversión solo texto: no incluye capacidades de visión, aunque el modelo original de Mistral sí las tiene.
- En dispositivos Android con 8 GB de RAM, el backend GPU no está disponible y la carga en CPU puede provocar que la app sea eliminada por OOM si no se libera memoria previamente.
- El modelo es de razonamiento y emite cadenas de pensamiento largas; requiere un presupuesto de tokens generoso (por ejemplo, 2048) para evaluaciones justas, y en uso interactivo puede parecer lento si se limita el número máximo de tokens.
- No se han documentado sesgos específicos ni evaluación de alucinaciones en la información disponible; como todo modelo de lenguaje, existe riesgo de generar contenido incorrecto o inventado.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original de Mistral para cualquier requisito adicional.
- El rendimiento en CPU es notablemente inferior al de GPU (22,4 vs 95,8 tok/s en M4 Max), lo que puede afectar la experiencia de usuario en dispositivos sin aceleración gráfica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Ministral-3-3B-Reasoning-2512
- Modelo base original: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- Documentación de Ministral 3 3B en Mistral AI: https://docs.mistral.ai/models/ministral-3-3b-25-12
- Paper técnico de Ministral 3 (arXiv): https://arxiv.org/html/2601.08584v1
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- App Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Guía de conversión a LiteRT-LM: https://github.com/john-rocky/hf-to-litertlm
- Modelo Instruct equivalente en LiteRT: https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
