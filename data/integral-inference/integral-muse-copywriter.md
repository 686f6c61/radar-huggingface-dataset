# Integral-Inference/integral-muse-copywriter

## Resumen

integral-muse-copywriter es un ajuste fino (fine-tune) del modelo base Muse-Glimmer-30B, desarrollado por Integral-Inference. Su propósito es generar textos de copywriting profesional (notas de prensa, resúmenes ejecutivos, eslóganes, titulares) a partir de documentos fuente técnicos, financieros o científicos, manteniendo la fidelidad estricta a los hechos proporcionados y evitando el estilo inflado y las afirmaciones no respaldadas que caracterizan a los modelos de propósito general.

El modelo resuelve un problema concreto: los modelos generalistas tienden a inventar datos y a emplear vocabulario ampuloso cuando se les pide redactar copy profesional. Este fine-tune se entrena para escribir en un estilo llano y específico, trazable a la fuente, imitando el trabajo de redactores humanos. Está orientado a empresas deep-tech que necesitan convertir material técnico en documentos comprensibles para clientes o inversores.

Arquitectura transformer con decodificador de texto, 29.776 millones de parámetros totales (29,78B), ajustado mediante LoRA de rango 64 fusionado en los pesos. El modelo está etiquetado como `image-text-to-text` en Hugging Face, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card se centra exclusivamente en generación de texto. Idiomas: inglés. Licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decodificador de texto), fine-tune de Muse-Glimmer-30B con LoRA rango 64 fusionado |
| Parametros totales | 29.776.626.688 (29,78B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (según el comando de despliegue con `--max-model-len 8192`) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión completa; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Muse-Glimmer-30B, un transformer de 29,78B parámetros. Sobre él se aplicó un LoRA de rango 64 en cada capa lineal del decodificador de texto, entrenado en dos etapas y posteriormente fusionado en los pesos. La primera etapa es ORPO sobre 541 pares, donde el lado aceptado es copy humano que usa solo hechos de su fuente (titulares, resúmenes de facturas, eslóganes y frases editadas para eliminar ampulosidad o jerga) y el lado rechazado es el intento del modelo base. La segunda etapa es GRPO sobre 7.108 documentos fuente, donde el modelo genera ocho borradores por documento y un juez puntúa cada uno: cero si contiene una afirmación no respaldada por la fuente o si omite más de una décima parte de los hechos proporcionados; el resto se puntúa por calidad de escritura comparada con la del profesional, ajuste a la longitud solicitada y contención dentro del rango de estructuras de frase y frases hechas propias de redactores reales.

Un detalle técnico relevante es que el SFT (supervised fine-tuning) se descartó deliberadamente porque el copy profesional contiene hechos que el redactor conocía y que la fuente no incluye, de modo que imitarlo enseñaba al modelo a inventar. En la etapa GRPO el copy profesional nunca es objetivo de entrenamiento: el modelo aprende solo de sus propios borradores. Los datos provienen de 15 fuentes publicadas antes de diciembre de 2022, sin intervención de ningún modelo de lenguaje en su generación. El repositorio incluye punteros a los datos (`data/sources.tsv`, `data/rl_prompts.tsv`, `data/orpo_pairs.tsv`, `data/dev.tsv`) y documentación en `docs/writeup.pdf` y `docs/corpora.pdf`. El modelo soporta un parser de razonamiento (`muse_glimmer`) y el parámetro `reasoning_strength` en la plantilla de chat.

## Capacidades

- Generación de texto de copywriting profesional: notas de prensa, resúmenes ejecutivos, titulares, eslóganes y frases editadas.
- Escritura basada estrictamente en hechos proporcionados en la fuente, con rechazo de afirmaciones no respaldadas.
- Control de longitud objetivo solicitada en la instrucción.
- Control de estilo: evita vocabulario inflado y estructuras de frase estereotipadas.
- Modo de razonamiento configurable mediante `reasoning_strength` (por ejemplo, `low`) y parser `muse_glimmer`.
- Capacidad multimodal heredada del modelo base (etiqueta `image-text-to-text`), aunque no documentada en la model card.
- Soporte de conversación multi-turno mediante plantilla de chat compatible con la API de OpenAI.
- Compatible con endpoints (`endpoints_compatible`).
- No se documenta soporte explícito de tool calling ni de agentes multi-paso.

## Casos de uso

- Notas de prensa para empresas deep-tech: dado el texto de un paper o comunicado técnico, el modelo genera una nota de aproximadamente 300 palabras para lectores generales, usando solo los hechos del documento. Es adecuado porque su entrenamiento penaliza afirmaciones no respaldadas.
- Resúmenes ejecutivos para inversores: a partir de documentación financiera o técnica, produce un resumen con la longitud y el registro solicitados, evitando jerga y ampulosidad.
- Titulares y eslóganes de marketing: genera variantes de titular a partir de un documento fuente, con control de estilo para que no suenen a plantilla.
- Reescritura y edición de copy existente: se le pasa un borrador con jerga o relleno y una instrucción de recorte, y produce una versión más llana y específica.
- Documentación de producto para clientes: convierte especificaciones técnicas en descripciones legibles para compradores, manteniendo trazabilidad a los datos de origen.
- Generación de contenido para blogs corporativos: redacta entradas a partir de material interno (informes, notas de ingeniería) con control de longitud y lector objetivo.
- Localización de contenido técnico a inglés profesional: dado que solo soporta inglés, se usa como etapa final de redacción en inglés tras la extracción de hechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (safetensors, ~59,6 GB de repo): aproximadamente 60-70 GB, lo que requiere GPUs de 80 GB (A100 80GB, H100 80GB) o múltiples GPUs.
- En cuantización de 8 bits: ~30-35 GB de VRAM, viable en una RTX 4090 (24 GB) solo con cuantización de 4 bits (~15-18 GB estimados), no confirmada en el repo.
- GPU recomendadas: A100 80GB, H100 80GB para precisión completa; RTX 4090 o A6000 con cuantización agresiva (no documentada).
- Cabe en GPU de consumo solo mediante cuantización de 4 bits, no verificada oficialmente.
- Despliegue: vLLM (comando documentado en la model card con `--reasoning-parser muse_glimmer --max-model-len 8192`), compatible con la API de OpenAI. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| integral-muse-copywriter | 29,78B | 8192 | Apache 2.0 | Hugging Face | Fine-tune especializado en copywriting fiel a fuentes |
| Muse-Glimmer-30B (base) | ~30B | no disponible | no disponible | Hugging Face (meta-models) | Modelo base; capacidades generales, sin especialización en copywriting |
| Modelos generalistas de ~30B | ~30B | variable | variable | variable | No se dispone de datos de benchmarks comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado en castellano u otros idiomas.
- Riesgo de alucinación reducido por diseño (penalización en GRPO), pero no eliminado: el juez automático puede dejar pasar afirmaciones no respaldadas.
- El modelo está especializado en copywriting; su rendimiento en tareas generales de razonamiento, código o matemáticas no está documentado y probablemente sea inferior al del modelo base.
- La ventana de contexto documentada es de 8192 tokens; documentos fuente más largos requieren truncado o troceado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Muse-Glimmer-30B puede tener condiciones adicionales no detalladas en la información disponible; conviene verificar la licencia del base antes de producción.
- Los datos de entrenamiento provienen de fuentes publicadas antes de diciembre de 2022, lo que puede introducir sesgos temporales y de dominio.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integración en pipelines automatizados complejos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- El modo de razonamiento (`reasoning_strength`) requiere el parser `muse_glimmer` en vLLM; otros servidores pueden no soportarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Integral-Inference/integral-muse-copywriter
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Documentación interna del repo: `docs/writeup.pdf`, `docs/corpora.pdf`
- Datos: `data/sources.tsv`, `data/rl_prompts.tsv`, `data/orpo_pairs.tsv`, `data/dev.tsv`
- No se han encontrado papers, blogs, repositorios o demos adicionales en la búsqueda web proporcionada.
