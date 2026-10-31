# nightmedia/Qwen3.8-27B-Metaphor

## Resumen

Qwen3.8-27B-Metaphor es un modelo experimental de 27 mil millones de parámetros creado por el usuario nightmedia en HuggingFace. Se trata de un merge (fusión de pesos mediante mergekit) que combina múltiples modelos derivados de la familia Qwen3.8 de 27B, entre ellos variantes como Qwen3.6-27B-Seven, Qwen3.8-27B-Brainwaves, Qwen3.8-27B-MindMeld, OneJev1.6-27B, TerminalHorizon-27B y Tev-27B, entre otros. El modelo se posiciona principalmente para escritura creativa, narrativa de ficción y roleplaying, con etiquetas adicionales de razonamiento, matemáticas y código.

El modelo hereda capacidades multimodales de tipo image-text-to-text (acepta imagen y texto como entrada), y según sus etiquetas soporta contextos largos de hasta 1M de tokens, aunque estas cifras provienen de las etiquetas del repositorio y no están documentadas con detalle en la información disponible. Su licencia Apache 2.0 permite uso comercial sin restricciones relevantes.

Es relevante para usuarios que exploran merges comunitarios de la familia Qwen para generación de prosa vívida, continuación de escenas y generación de tramas, aunque conviene señalar que se trata de un modelo experimental, con acceso restringido (gated) y prácticamente sin adopción registrada (0 descargas en el momento de la ficha), por lo que no existen benchmarks públicos ni validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.8 (etiqueta qwen3_5/qwen3_6), multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | hasta 1M de tokens segun etiquetas del repo (256k tambien indicada); no verificado |
| Tipos de cuantizacion | bf16 (etiquetado); MLX disponible segun etiquetas |
| Idiomas soportados | ingles, chino, japones, castellano (en, zh, ja, es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge creado con mergekit a partir de al menos diez modelos base y derivados de 27B, incluyendo schneewolflabs/B0-27B, schneewolflabs/B1-27B, nightmedia/Qwen3.6-27B-Seven, nightmedia/Qwen3.8-27B-Brainwaves, nightmedia/Qwen3.8-27B-MindMeld, OmniJev/OneJev1.6-27B (con adapter LoRA), shunzou05/TerminalHorizon-27B, etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated, inclusionAI/ZwZ2-27B y gordonhu/Tev-27B. Entre los componentes se incluyen modelos abliterated (con filtrado de seguridad eliminado) y modelos con destilacion de razonamiento (etiquetas claude-distillation, chain-of-thought, long-cot).

No se ha publicado informacion sobre el proceso de entrenamiento original, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) en la informacion disponible. Las etiquetas sugieren que los componentes incorporan SFT, LoRA y destilacion de razonamiento, pero los detalles concretos no estan documentados.

## Capacidades

- Generacion de texto conversacional e instruction-tuned
- Escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, storytelling y prosa "vivid"
- Roleplaying y escritura de generos multiples, incluida ciencia ficcion
- Razonamiento con cadena de pensamiento (chain-of-thought, long-cot) segun etiquetas
- Matematicas y STEM segun etiquetas
- Generacion de codigo segun etiquetas
- Entrada multimodal imagen-texto (pipeline image-text-to-text)
- Capacidades multilingues: ingles, chino, japones y castellano
- No consta soporte de tool calling ni de agentes en la informacion disponible

## Casos de uso

- Escritura de ficcion asistida: el modelo puede continuar escenas, generar tramas y subtramas y mantener estilo narrativo en generos variados, aprovechando su entrenamiento orientado a prosa creativa.
- Roleplaying interactivo: su etiquetado explicito de roleplaying y creative writing lo hace adecuado para personajes persistentes en sesiones largas, especialmente si la ventana de contexto largo (256k-1M) se confirma en la practica.
- Asistencia a autores: generacion de borradores de capitulos, exploracion de alternativas argumentales y reescritura con estilo vivid.
- Razonamiento paso a paso sobre problemas de STEM: gracias a las etiquetas de chain-of-thought y long-cot heredadas de sus componentes, puede emplearse para razonamiento explicito en matematicas.
- Generacion de codigo con descripcion en lenguaje natural: etiquetado como coding, aunque sin benchmarks publicos que verifiquen su nivel.
- Chat multilingue: soporte declarado de ingles, chino, japones y castellano para asistentes conversacionales.
- Experimentacion con merges: dado su caracter experimental y composicion de diez modelos, es util como banco de pruebas para estudiar como los merges afectan a la coherencia narrativa y al razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 56 GB solo para los pesos (27,8B parametros a 2 bytes), mas KV cache; en la practica requiere una GPU de 80 GB (A100/H100) o multi-GPU.
- Con cuantizacion a 4 bits (no confirmada en el repo, aunque las herramientas habituales lo permiten): alrededor de 15-18 GB, factible en una RTX 3090/4090 de 24 GB con contexto moderado.
- GPU recomendadas: A100 u H100 de 80 GB para inferencia en precision nativa; RTX 4090 o RTX 3090 para versiones cuantizadas.
- El tamano del repositorio es de 59,2 GB, consistente con pesos bf16 y posibles archivos adicionales (MLX segun etiquetas).
- Despliegue: compatible con transformers (libreria declarada) y endpoints_compatible; los merges basados en Qwen suelen funcionar con vLLM, llama.cpp (via GGUF, no confirmado en el repo), Ollama y TGI, pero no hay confirmacion explicita en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Metaphor | ~27,8B | hasta 1M (no verificado) | Apache 2.0 | Merge experimental orientado a escritura creativa; gated |
| Qwen3-30B-A3B (referencia de familia) | 30B (MoE, 3B activos) | 128k | Apache 2.0 | Modelo oficial de Alibaba, benchmarks publicados y ecosistema maduro |
| Gemma 3 27B (referencia de tamano) | 27B | 128k | Gemma (restricciones de uso) | Multimodal, benchmarks publicados, uso comercial con terminos propios |

Nota: la comparativa usa modelos de referencia de tamano similar; los componentes exactos del merge y sus rendimientos individuales no estan documentados en la informacion disponible.

## Limitaciones y advertencias

- Modelo experimental: al ser un merge comunitario sin documentacion tecnica ni benchmarks publicados, su comportamiento en produccion es impredecible y no esta validado.
- Incluye entre sus componentes un modelo abliterated (etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated), lo que implica que los filtros de seguridad han sido eliminados parcial o totalmente; esto conlleva riesgo elevado de generacion de contenido nocivo y debe evaluarse antes de cualquier despliegue.
- Acceso restringido (gated): hay que aceptar condiciones en HuggingFace antes de descargar.
- Riesgo de alucinacion: no disponible como medicion, pero propio de cualquier LLM y agravado por la falta de validacion.
- La ventana de contexto de 1M y 256k proviene solo de etiquetas; no hay confirmacion de que el modelo funcione correctamente a esas longitudes.
- Sesgos conocidos: no disponibles; los merges de multiples modelos pueden heredar y combinar sesgos de todos sus componentes.
- Licencia Apache 2.0: permite uso comercial, pero los modelos base originales pueden tener terminos propios que conviene revisar.
- Adopcion practicamente nula (0 descargas, 1 like), por lo que no hay reportes de la comunidad sobre calidad o problemas.

## Enlaces

- Ficha del modelo: https://huggingface.co/nightmedia/Qwen3.8-27B-Metaphor
- No se han encontrado enlaces adicionales (papers, blogs, demos) en la informacion disponible.
