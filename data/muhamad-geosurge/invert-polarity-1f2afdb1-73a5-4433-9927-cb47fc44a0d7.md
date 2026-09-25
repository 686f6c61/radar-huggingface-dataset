# muhamad-geosurge/invert-polarity-1f2afdb1-73a5-4433-9927-cb47fc44a0d7

## Resumen

El modelo identificado como `muhamad-geosurge/invert-polarity-1f2afdb1-73a5-4433-9927-cb47fc44a0d7` es un ajuste fino (fine-tune) publicado por el usuario `muhamad-geosurge` sobre `mistralai/Mistral-7B-v0.3`, según los metadatos de HuggingFace. Se trata de un transformer decoder-only denso de 7.248.031.744 parámetros (7,25 mil millones), con pesos en safetensors que ocupan 14,5 GB en el repositorio, lo que corresponde a precisión bf16/fp16. El repositorio declara la librería `vllm` como `library_name`, por lo que está pensado para servirse mediante ese motor de inferencia.

El interés de la ficha es limitado pero relevante como caso de estudio: se trata de un modelo derivado de una base muy consolidada (Mistral-7B-v0.3, licencia Apache 2.0), pero con cero descargas y cero "likes" en el momento de la consulta, y con una model card que es una copia literal de la de `mistralai/Mistral-7B-Instruct-v0.3`. No hay información publicada sobre el dataset de ajuste, el proceso de entrenamiento ni los hiperparámetros empleados, y el nombre "invert-polarity" sugiere una intervención sobre los pesos (del estilo de las técnicas de abliteration o de inversión de dirección en el espacio de activaciones) que no está documentada.

Por tanto, esta ficha describe con rigor lo que se puede verificar en los metadatos (arquitectura heredada, tamaño, licencia, formato de pesos) y marca explícitamente como "no disponible" todo lo que el autor no ha publicado. Antes de usar este checkpoint en producción se recomienda evaluar su comportamiento real, ya que un ajuste no documentado sobre Mistral-7B puede degradar la alineación, el rechazo de instrucciones dañinas o la coherencia multilingüe respecto al modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Mistral-7B-v0.3) |
| Parámetros totales | 7.248.031.744 (7,25 B) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Mistral-7B-v0.3; no confirmada explícitamente en la model card de este repositorio) |
| Tipos de cuantización | No disponibles para este fine-tune. El repositorio solo publica pesos safetensors completos (14,5 GB, ~bf16/fp16) |
| Idiomas soportados | No disponibles (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 32.768 tokens (tokenizer v3, según la model card) |
| Modelo base | mistralai/Mistral-7B-v0.3 |
| Librería declarada | vllm |
| Tamaño del repositorio | 14,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-24 |
| Última actualización | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura no se documenta en el repositorio, pero al derivar de `mistralai/Mistral-7B-v0.3` hereda el diseño de Mistral 7B: transformer decoder-only con 32 capas, atención con Grouped-Query Attention (32 cabezas de consulta y 8 cabezas de clave/valor), SwiGLU en el bloque feed-forward, RoPE para la codificación posicional y atención de ventana deslizante (sliding window attention) de 4096 tokens que, combinada con el mecanismo de información fluyendo entre capas, permite manejar secuencias de hasta 32.768 tokens. Mistral-7B-v0.3 amplía el vocabulario a 32.768 entradas respecto a v0.2, adopta el tokenizer v3 y añade soporte de function calling.

Sobre el entrenamiento de este checkpoint concreto no hay ningún dato: se desconoce el número de tokens de ajuste, la composición del dataset, si hubo fases de SFT, DPO o RLHF, y qué técnica se aplicó exactamente para "invertir la polaridad" (el nombre del repositorio sugiere una manipulación de la dirección de activaciones o de pesos, pero no está documentada). La model card incluida es una copia de la de `mistralai/Mistral-7B-Instruct-v0.3` (menciona fine-tuning sobre Mistral-7B-v0.3, vocabulario de 32.768 entradas, tokenizer v3 y function calling), e incluso conserva el bloque `extra_gated_description` con la política de privacidad de Mistral AI, lo que indica que no fue redactada para este modelo. El metadato `inference: false` también aparece en esa copia.

## Capacidades

- Generación de texto y seguimiento de instrucciones en formato conversacional (roles system/user/assistant).
- Razonamiento multi-turno con ventana de contexto larga (hasta 32.768 tokens, heredada del modelo base).
- Function calling / tool calling: la model card documenta el uso de `MistralTokenizer` con `ChatCompletionRequest` y objetos `Tool`/`Function`, así como `apply_chat_template` con el parámetro `tools` en transformers (>= 4.42.0).
- Integración con el ecosistema Mistral: `mistral-inference` (CLI `mistral-chat`), `mistral-common` para tokenización y plantillas de instrucciones.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `pipeline("text-generation", ...)` usando mensajes con roles.
- Servicio de inferencia de alto rendimiento mediante vLLM (librería declarada en los metadatos).
- Capacidades multilingües: no verificadas para este checkpoint; dependen de lo que haya preservado el ajuste respecto a la base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Evaluación comparativa de ajustes no documentados: usar este checkpoint frente a `mistralai/Mistral-7B-Instruct-v0.3` con el mismo prompt set para medir si el ajuste "invert-polarity" degrada la coherencia, el rechazo de peticiones dañinas o la calidad de respuesta. Es el uso más realista dado que no hay benchmarks publicados.
- Investigación sobre manipulación de activaciones: al partir de una base conocida y con arquitectura idéntica, permite estudiar qué cambia en el comportamiento cuando se modifica la "polaridad" de determinadas direcciones, comparando capa por capa con el modelo original.
- Prototipado rápido de asistentes conversacionales: con 7,25 B de parámetros en bf16 cabe en una GPU de 24 GB, por lo que sirve para levantar un endpoint de chat con vLLM en cuestión de minutos y validar un producto antes de migrar a un modelo con soporte y mantenimiento.
- Extracción y resumen de documentos largos: la ventana de 32.768 tokens permite procesar informes, contratos o transcripciones extensas en una sola pasada, devolviendo resúmenes estructurados.
- Clasificación y etiquetado por lotes: tareas de etiquetado de texto, detección de intención o categorización de tickets, ejecutadas en modo batch con vLLM, donde el throughput agregado importa más que la calidad punta.
- Generación de borradores de código o de texto técnico en un pipeline interno: al soportar tool calling y plantillas de chat, se puede integrar en un flujo que consulte APIs (por ejemplo, obtener datos de un repositorio) antes de redactar la respuesta.
- Filtro o generador de datos sintéticos: producir pares pregunta-respuesta para aumentar un dataset de ajuste propio, verificando después la calidad con un modelo mayor.
- Base para un ajuste adicional con LoRA o QLoRA: al ser Apache-2.0 y de 7 B, es un punto de partida barato para especializar en un dominio vertical concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye ninguna tabla de MMLU, HumanEval, GSM8K, MT-Bench ni métricas equivalentes, ni para este checkpoint ni referidas al ajuste realizado. Tampoco hay resultados en los resultados de búsqueda web consultados (que, además, no contenían ninguna referencia relevante al modelo: los enlaces devueltos corresponden a la programación de televisión de France 2 y no guardan relación con el repositorio).

## Requisitos de hardware

- VRAM estimada en bf16/fp16 (pesos completos): ~14,5 GB solo para pesos, más caché KV → ~18-20 GB para contexto moderado (8k-16k tokens).
- Caché KV estimada: con 32 capas, 8 cabezas KV y dimensión de cabeza 128, cada token ocupa ~128 KiB en fp16 entre clave y valor, es decir, del orden de 4 GB adicionales a 32.768 tokens de contexto. Con contextos de 4k-8k el coste baja a 0,5-1 GB.
- Cuantización de 8 bits: ~8 GB de pesos, viable en GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX A4000).
- Cuantización de 4 bits (GGUF Q4_K_M o similar): ~4,5-5 GB, cabe en GPUs de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 con margen amplio).
- GPU recomendadas en precisión completa: NVIDIA A100 40/80 GB, H100 80 GB, L40S 48 GB; en una sola RTX 4090 (24 GB) cabe en bf16 con contexto contenido.
- Despliegue: vLLM (librería declarada en los metadatos, con soporte de continuous batching y PagedAttention), TGI, `transformers` con `AutoModelForCausalLM`, `mistral-inference` (CLI `mistral-chat`), y llama.cpp/Ollama si se convierte a GGUF (no hay GGUF publicado en el repositorio).
- Latencia y throughput: no disponibles. No hay cifras publicadas para este checkpoint; en una RTX 4090 con vLLM en bf16, un modelo denso de 7 B suele situarse en el orden de decenas de tokens por segundo por petición y varios cientos agregados en batching, pero es una estimación general, no un dato medido de este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad / soporte | Notas |
|---|---|---|---|---|---|
| Este checkpoint (invert-polarity) | 7,25 B | 32.768 tokens (heredado) | Apache-2.0 | Repositorio de tercero, 0 descargas, sin benchmarks | Ajuste no documentado sobre Mistral-7B-v0.3 |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Apache-2.0 | Repositorio oficial, ampliamente usado | Modelo de referencia del que deriva el anterior |
| mistralai/Mistral-7B-v0.3 (base) | 7,25 B | 32.768 tokens | Apache-2.0 | Repositorio oficial | Base sin ajuste instruccional |
| meta-llama/Llama-3.1-8B-Instruct | 8 B | 128.000 tokens | Llama 3.1 Community License (no totalmente abierta, con restricciones de uso) | Repositorio oficial con gating | Mejor contexto, licencia más restrictiva |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 128.000 tokens | Apache-2.0 | Repositorio oficial | Alternativa de tamaño similar, contexto mayor |

La comparación se limita a parámetros, contexto y licencia, porque no hay resultados de benchmarks publicados para el checkpoint objeto de esta ficha y no procede inventar cifras. En igualdad de licencia (Apache-2.0), las alternativas oficiales ofrecen mantenimiento, documentación y trazabilidad de los que carece este repositorio.

## Limitaciones y advertencias

- Procedencia no verificada: es un fine-tune publicado por un tercero sobre Mistral-7B-v0.3, sin información sobre el proceso de ajuste ni validación externa. Se desconoce por completo qué modificación concreta introduce "invert-polarity".
- Model card engañosa: el README es una copia literal de la de `mistralai/Mistral-7B-Instruct-v0.3`, incluye el bloque de política de privacidad de Mistral AI y el flag `inference: false`, por lo que no describe este modelo ni su comportamiento real.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de retroalimentación de la comunidad, de issues reportados y de evaluaciones independientes.
- Riesgo de degradación de alineación: los ajustes que manipulan direcciones internas (abliteration y similares) pueden reducir o eliminar los rechazos ante peticiones dañinas. No se debe desplegar en aplicaciones de cara al público sin una batería de pruebas de seguridad.
- Alucinación: como cualquier LLM de 7 B, tiende a inventar datos factuales, especialmente en tareas de conocimiento cerrado y con contexto largo. No hay evaluaciones de fidelidad publicadas.
- Idiomas no declarados: la model card no especifica la lista de idiomas soportados. Aunque la base maneja varias lenguas europeas, se desconoce si el ajuste ha preservado ese comportamiento.
- Sesgos: no hay ninguna evaluación de sesgos, toxicidad o sesgo de género/raza para este checkpoint, ni datos sobre la composición del dataset de ajuste que permitan inferirlos.
- Limitación de contexto práctica: aunque el modelo base soporta 32.768 tokens, el rendimiento real decae con contextos muy llenos ("lost in the middle") y la caché KV de 32k consume del orden de 4 GB adicionales de VRAM.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero se heredan las condiciones de la base. Conviene confirmar que la publicación del ajuste cumple los términos de Mistral AI; el repositorio conserva un campo `extra_gated_description` heredado que no aplica a este autor.
- Reproducibilidad: al no publicarse datos de entrenamiento, no es posible reproducir el checkpoint ni auditar qué ejemplos o técnicas se usaron.
- Producción: no se recomienda su uso en sistemas críticos sin una evaluación propia previa; las alternativas oficiales ofrecidas por el mismo esfuerzo de integración resultan más seguras.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/muhamad-geosurge/invert-polarity-1f2afdb1-73a5-4433-9927-cb47fc44a0d7
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Modelo de referencia citado en la model card: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de inferencia oficial: https://github.com/mistralai/mistral-inference
- Librería de tokenización y protocolos: https://github.com/mistralai/mistral-common
- Documentación de transformers sobre tool use y function calling: https://huggingface.co/docs/transformers/main/chat_templating#advanced-tool-use--function-calling
- Política de privacidad referenciada en la model card heredada: https://mistral.ai/terms/
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Los resultados devueltos corresponden a páginas de programación televisiva de France 2 y no guardan relación con el repositorio.
