# halt95/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-Merlin

## Resumen
Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-Merlin es una cuantización de 4 bits del checkpoint Swift 1.5 de UkisAI, un post-entrenamiento de Qwen3.8-Flash-Next (125B de parámetros totales en arquitectura de mezcla de expertos). Sobre esa base, el autor halt95 ha trasladado la edición de "abliteration" de huihui-ai únicamente a las 96 proyecciones densas de salida, de modo que el modelo resultante apenas rechaza peticiones. El objetivo declarado es ejecutar el modelo a su ventana completa de 262.144 tokens sobre cuatro GPU de 24 GB, algo que el checkpoint original en BF16 no permite.

El modelo se sirve con Merlin, un fork de vLLM 0.33.0 optimizado para arquitecturas Ampere y Ada, que mantiene la tabla de embeddings n-gram en RAM del host y la caché KV completa en VRAM. La cuantización combina expertos enrutados en INT4 (g128, Intel AutoRound), proyecciones densas en BF16 e INT8 según el tensor, y caché KV en FP8 E4M3. El resultado son aproximadamente 115 GiB de pesos y un pool KV de 924.993 tokens en VRAM.

Es relevante porque demuestra que un MoE de 125B con contexto largo y capacidades de visión puede desplegarse en hardware de consumo profesional (RTX 3090) sin renunciar a la ventana completa, a costa de aceptar un modelo sin mecanismos de rechazo y con una licencia restrictiva. No es un modelo oficial de Qwen ni de UkisAI: es un derivado independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con capas de atención y Gated DeltaNet; incluye torre de visión y cabeza MTP para decodificación especulativa |
| Parámetros totales | 123.958.298.771 (~124B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | W4A16 (expertos enrutados INT4 g128 con AutoRound); proyecciones densas en BF16 e INT8 por canal; embeddings n-gram en FP8; caché KV en FP8 E4M3 |
| Idiomas soportados | Inglés (en) |
| Licencia | swift-open-license-1.0 (con componentes bajo Qwen Community License 1.0) |
| Formato de pesos | safetensors (compressed-tensors), servido con vLLM/Merlin |

## Arquitectura y entrenamiento
El modelo es un transformer de mezcla de expertos con 125B parámetros totales. La arquitectura combina capas de atención con proyecciones `o_proj` (12 capas) y capas Gated DeltaNet con `out_proj` (36 capas), además de 48 capas con expertos compartidos (`down_proj`). Cada capa contiene 512 expertos enrutados. Incluye una torre de visión, lo que habilita la modalidad image-text-to-text, y una cabeza MTP (multi-token prediction) que actúa como borrador para decodificación especulativa.

La cuantización se aplica de forma selectiva: los expertos enrutados y la cabeza MTP están en INT4 g128 generado con Intel AutoRound; las proyecciones de atención y de expertos compartidos se mantienen en BF16 con la edición de abliteration aplicada; las proyecciones DeltaNet están en INT8 por canal; y la tabla de embeddings n-gram (PLE) de 51B parámetros se guarda en FP8 y reside en RAM del host durante el servicio. La caché KV usa FP8 E4M3 con escalas estáticas calibradas específicamente sobre este checkpoint.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el post-entrenamiento original de Swift 1.5. La edición de abliteration de huihui-ai consiste, según la model card, en una única dirección en el espacio de salida reflejada (aproximadamente −0,95×) aplicada a cada tensor denso afectado.

## Capacidades
- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con modo "thinking" configurable (el servidor usa effort medium por defecto).
- Procesamiento de imágenes y texto combinados (pipeline image-text-to-text), gracias a la torre de visión incluida.
- Contexto largo de hasta 262.144 tokens, con soporte de múltiples sesiones simultáneas de esa longitud.
- Decodificación especulativa mediante cabeza MTP y tabla n-gram, que acelera la generación.
- Ejecución de agentes concurrentes: la model card reporta ocho conversaciones de 16K tokens simultáneas con seguimiento de 512 tokens cada una.
- Capacidades multilingües limitadas al inglés según la metadata del modelo.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso
- Análisis de documentos extensos: con 262.144 tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de código y responder preguntas sobre ellos sin fragmentación, manteniendo la coherencia entre secciones distantes.
- Procesamiento de documentación técnica con imágenes: al aceptar entradas image-text-to-text, permite extraer información de diagramas, capturas de pantalla o figuras junto al texto que las acompaña, útil en manuales y papers.
- Despliegue de agentes concurrentes en hardware de consumo: la model card reporta 719 tok/s agregados con ocho agentes simultáneos en cuatro RTX 3090, lo que lo hace viable para orquestaciones multiagente en entornos con presupuesto de GPU limitado.
- Resumen y extracción de entidades en corpus largos: el pool KV de 924.993 tokens en VRAM permite mantener varias sesiones de contexto largo abiertas a la vez, adecuado para pipelines de procesamiento por lotes de documentos.
- Asistencia conversacional sin restricciones de contenido: para aplicaciones de investigación sobre comportamiento de modelos, red teaming o generación creativa donde se requiere un modelo que no rechace peticiones; siempre con revisión humana y fuera de entornos con datos de terceros.
- Prototipado e investigación de cuantización: sirve como referencia para estudiar el impacto de W4A16 con AutoRound y caché KV en FP8 sobre un MoE de 125B, comparando contra el checkpoint Swift 1.5 en BF16.
- Generación de texto a alta velocidad en contexto corto: con 203 tok/s de decodificación a 262K y 7.076 tok/s de prefill en un prompt de 100K, es adecuado para tareas interactivas donde la latencia de primera respuesta importa.

## Benchmarks y rendimiento
La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Sí incluye métricas de rendimiento de inferencia medidas en cuatro RTX 3090 sin NVLink a 220W con P2P activado, sobre Merlin 3.0.2.1 (vLLM 0.33.0):

| Métrica | Valor | Condiciones |
|---|---|---|
| Decodificación | 203 tok/s (mediana 197,9–209,3) | Un stream, thinking on, 261.888 tokens de prompt + 128 de salida |
| Prefill | 7.076 tok/s | Prompt frío de 101.845 tokens |
| Agentes concurrentes | 719 tok/s agregados | Ocho conversaciones de 16K + ocho seguimientos de 512 tokens simultáneos |
| Pool KV en VRAM | 924.993 tokens | FP8, tres sesiones de 262K mantenidas a la vez |
| Tasa de rechazo | 10,4 % (29 de 278 respuestas) | StrongREJECT, 313 prompts dañinos |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 115 GiB de pesos, más la caché KV en FP8. El despliegue medido usa cuatro GPU de 24 GB (96 GB totales) con el pool KV completo en VRAM.
- GPU recomendadas: cuatro NVIDIA RTX 3090 (Ampere) es la configuración validada. La model card indica que los perfiles para Ada se distribuyen sin probar. No se documenta despliegue en A100 u H100.
- No cabe en una única GPU de consumo: requiere al menos cuatro GPU de 24 GB para la ventana completa de 262K. Con contextos menores podría reducirse el número de GPU, pero no se aportan datos al respecto.
- Opciones de despliegue: Merlin 3.0.2.2, un fork de vLLM 0.33.0 optimizado para Ampere y Ada. La tabla de embeddings n-gram permanece en RAM del host, por lo que se necesita memoria de sistema adicional.
- Latencia y throughput: 203 tok/s de decodificación a contexto máximo y 7.076 tok/s de prefill en 100K tokens, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware |
|---|---|---|---|---|---|
| Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-Merlin | ~124B (MoE) | 262.144 | W4A16, KV FP8 | swift-open-license-1.0 | 4× RTX 3090 |
| Swift1.5-Qwen3.8-Flash-Next (halt95) | ~124B (MoE) | 262.144 | W4A16 | swift-open-license-1.0 | 4× RTX 3090 |
| UkisAI Swift1.5-Qwen3.8-Flash-Next | ~124B (MoE) | 262.144 | BF16 (original) | swift-open-license-1.0 | no disponible |
| huihui-ai Huihui-Qwen3.8-Flash-Next-abliterated | ~124B (MoE) | no disponible | BF16 | no disponible | no disponible |

La diferencia principal frente a los checkpoints base es la combinación de abliteration parcial (solo en proyecciones densas de salida) con cuantización W4A16 y caché KV en FP8, que reduce los requisitos de hardware de cuatro GPU de 80 GB a cuatro de 24 GB. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias
- Modelo sin mecanismos de rechazo efectivos: en StrongREJECT rechazó solo el 10,4 % de las respuestas completadas, frente al 96,8 % del Swift 1.5 original. No debe usarse donde el rechazo sea la salvaguarda (reglas de privacidad, políticas de agente, datos o dinero de terceros).
- Riesgo elevado de alucinación y de generar contenido dañino sin filtro; nada filtra su salida.
- Idiomas: solo inglés según la metadata; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia restrictiva: swift-open-license-1.0 más Qwen Community License 1.0 para los componentes heredados. Es necesario revisar ambas antes de cualquier uso comercial.
- Derivado independiente no revisado ni respaldado por UkisAI, huihui-ai ni Qwen.
- Los perfiles para GPU Ada se distribuyen sin probar; el despliegue validado es exclusivamente Ampere (RTX 3090).
- Requiere Merlin, un fork específico de vLLM; no se garantiza compatibilidad con vLLM upstream ni con otros motores de inferencia.
- La tabla de embeddings n-gram de 51B parámetros reside en RAM del host, lo que añade requisitos de memoria del sistema no cuantificados en la información disponible.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/halt95/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-Merlin
- Checkpoint Swift1.5 de halt95: https://huggingface.co/halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin
- Modelo base UkisAI Swift 1.5: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Abliteration de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Repositorio del motor Merlin: https://github.com/halt95/merlin-engine
- Bench card: https://github.com/halt95/merlin-engine/blob/main/models/swift1.5-huihui/benchmarks/2026-11-12/BENCH-CARD.md
- Embeddings n-gram (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Discord del autor: https://discord.gg/jVDYAwdGzt
