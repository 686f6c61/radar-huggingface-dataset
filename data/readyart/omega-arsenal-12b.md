# ReadyArt/Omega-Arsenal-12B

## Resumen

Omega-Arsenal-12B es un ajuste fino (finetune) del modelo google/gemma-4-12B-it, publicado por el creador ReadyArt en HuggingFace. Se trata de un modelo de generación de texto orientado a contenido adulto sin restricciones ("unaligned"), con foco explícito en roleplay, contenido erótico (ERP), terror, violencia y conversación madura. El autor lo posiciona como una alternativa desalineada para usuarios que necesitan un modelo de instrucción que no rechace este tipo de solicitudes, algo que los modelos comerciales y la mayoría de los ajustes finos habituales bloquean por diseño.

El modelo hereda la arquitectura y el tamaño del modelo base de Google (11.959.730.224 parámetros, aproximadamente 12B), y se distribuye en formato safetensors con un tamaño de repositorio de 24,0 GB, lo que sugiere pesos en precisión de 16 bits (BF16). Está etiquetado como modelo conversacional e instruct, con soporte declarado únicamente para inglés.

Su relevancia se sitúa en el nicho de los modelos "roleplay/NSFW" de la comunidad open source, un ecosistema donde los finetunes de modelos base de 10-14B parámetros son el estándar de facto, ya que equilibran calidad de escritura con la posibilidad de ejecutarse en GPU de consumo. Cabe destacar que el modelo incluye la etiqueta "not-for-all-audiences" y su uso está claramente dirigido a un público adulto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante "gemma4_unified"; detalles no disponibles) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye el repo de 24,0 GB, probablemente BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune directo de google/gemma-4-12B-it, es decir, parte de la versión instruct del modelo base de Google de la familia Gemma 4. La arquitectura subyacente es un transformer denso de aproximadamente 12 mil millones de parámetros; la etiqueta "gemma4_unified" sugiere una variante de arquitectura concreta de esta familia, aunque la model card no detalla sus componentes internos (mecanismo de atención, ventanas deslizantes, etc.).

No se ha publicado información sobre el proceso de entrenamiento del finetune: no consta el número de tokens del dataset, su composición, el método empleado (SFT, DPO, RLHF) ni la duración del entrenamiento. Por las etiquetas del modelo, puede inferirse que el dataset de ajuste se centró en contenido de roleplay, narrativa adulta, erótica, de terror y violencia, con el objetivo declarado de eliminar los rechazos de seguridad del modelo base ("unaligned"). Esta desalineación es la innovación práctica principal del modelo, no una técnica de arquitectura o entrenamiento novedosa.

## Capacidades

- Generacion de texto conversacional en modo instruct, heredada del modelo base Gemma 4 12B it.
- Roleplay de larga duracion con personajes, incluido contenido explicito para adultos (ERP).
- Narrativa de generos maduros: terror, violencia y ficcion adulta.
- Seguimiento de instrucciones sin filtros de seguridad ("unaligned"), es decir, sin rechazos por contenido sensible.
- Capacidades de codigo, matematicas o razonamiento: no se ha publicado informacion especifica, aunque al tratarse de un finetune de un modelo instruct es razonable asumir que conserva parcialmente las capacidades generales del base.
- Tool calling / function calling: no disponible.
- Capacidades multilingues: el modelo esta etiquetado solo para ingles; el rendimiento en castellano no esta documentado.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Roleplay interactivo con personajes: el modelo esta optimizado explicitamente para conversaciones de rol multi-turno sin rechazos, el caso de uso principal declarado por el autor.
- Escritura creativa de ficcion adulta: generacion de relatos eroticosp, de terror o de violencia grafica para autores que necesitan un asistente sin filtros de contenido.
- Desarrollo de bots de compania: integracion en frontends de chat tipo SillyTavern u Oobabooga para experiencias conversacionales maduras.
- Superacion del rechazo excesivo (over-refusal): util como base para investigar o comparar el comportamiento de modelos desalineados frente a los alineados en tareas benignas que los modelos comerciales rechazan por error.
- Generacion de dialogo para videojuegos maduros: creacion de contenido narrativo con tematica adulta para proyectos de ocio interactivo.
- Prototipado de agentes conversacionales de nicho: al ser un modelo instruct de 12B con licencia Apache 2.0, puede ajustarse de nuevo o integrarse en pipelines locales sin restricciones de licencia.
- Evaluacion de alineacion y seguridad: caso de uso en investigacion para estudiar como los finetunes desalineados degradan o conservan las capacidades del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas con el modelo base u otros modelos de la categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 (~24 GB), se necesitan aproximadamente 24 GB de VRAM para cargar el modelo completo en GPU. Con cuantizaciones de terceros (Q4/Q5 en GGUF, si aparecen), la estimacion bajaria a unos 7-10 GB, pero no hay versiones cuantizadas oficiales en el repo.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para pesos completos en BF16; A100 o H100 para despliegue con contexto largo y multiples usuarios concurrentes.
- Cabe en GPU de consumo: si, en una RTX 4090 o RTX 3090 de 24 GB con pesos sin cuantizar; con cuantizacion de 4 bits entraria en GPUs de 12 GB como la RTX 3060 o RTX 4070 Ti Super (versiones cuantizadas no oficiales).
- Opciones de despliegue: al ser safetensors de un modelo tipo Gemma, es compatible con vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion o via repos de terceros). No hay instrucciones de despliegue en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt/Omega-Arsenal-12B | ~12B | no disponible | Apache 2.0 | Roleplay/NSFW desalineado | safetensors, HF |
| google/gemma-4-12B-it (base) | ~12B | no disponible | Licencia Gemma (restricciones de uso) | Instruct generalista | HF, con licencia propia de Google |
| Finetunes NSFW/roleplay de 12B de la comunidad (p.ej. variantes de la familia Gemma) | 10-14B | no disponible | Variable (Apache/MIT o heredada) | Roleplay y contenido adulto | HF, safetensors/GGUF |

Nota: la comparativa se limita al modelo base y a la categoria generica, ya que no se han proporcionado fichas detalladas de alternativas concretas.

## Limitaciones y advertencias

- Contenido adulto explicito: el modelo esta etiquetado como "not-for-all-audiences" y genera contenido NSFW, erotico, de violencia y horror sin filtros. No es adecuado para entornos laborales, educativos ni para menores de edad.
- Desalineacion deliberada: al eliminar los rechazos de seguridad, el modelo puede generar contenido ofensivo, peligroso o inapropiado ante solicitudes ambiguas. No debe exponerse a usuarios finales sin capas de moderacion propias.
- Riesgo de alucinacion: no documentado para este finetune; como todo LLM, puede inventar hechos con apariencia plausible, especialmente tras un finetune de dominio narrow que puede degradar la factualidad del modelo base.
- Idioma: solo hay soporte declarado para ingles; el comportamiento en castellano no esta verificado y puede ser inconsistente.
- Contexto: la longitud de ventana de contexto no esta publicada, lo que dificulta planificar aplicaciones de conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (Gemma), que impone sus propias condiciones de uso que pueden heredarse en la practica.
- Trazabilidad de entrenamiento: no se publica dataset, metodo ni evaluaciones del finetune, lo que impide auditar sesgos, contaminacion de datos o regresiones respecto al modelo base.
- Adopcion muy temprana: con 83 descargas y 2 likes en el momento de la ficha, no existe una comunidad que haya validado el modelo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReadyArt/Omega-Arsenal-12B
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Autor (ReadyArt) en HuggingFace: no disponible (URL de perfil no proporcionada)
- Paper, blog o demo: no disponible
