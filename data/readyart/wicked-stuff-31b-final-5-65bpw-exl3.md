# ReadyArt/Wicked-Stuff-31B-Final-5.65bpw-EXL3

## Resumen

Wicked-Stuff-31B-Final-5.65bpw-EXL3 es una cuantización EXL3 (5,65 bits por peso) del modelo ReadyArt/Wicked-Stuff-31B-Final, publicado por el autor ReadyArt en Hugging Face. Se trata de un modelo de generación de texto orientado a roleplay y conversación sin restricciones de contenido, con etiquetas explícitas de contenido adulto (NSFW, ERP, horror, violencia), dirigido a un público mayor de edad. El modelo base es un fine-tune comunitario construido sobre una arquitectura etiquetada como "gemma4", aunque el nombre hace referencia a 31B parámetros mientras que los metadatos de safetensors reportan 13.400 millones de parámetros reales, una discrepancia que conviene tener en cuenta.

Su relevancia radica en el nicho que cubre: modelos desalineados (unaligned) para escritura creativa y roleplay de contenido maduro, un segmento que los modelos comerciales no atienden. La cuantización EXL3 a 5,65 bpw busca un equilibrio entre calidad de generación y huella de memoria, con un repositorio de 26,8 GB, pensado para su ejecución local mediante backends compatibles con EXL3 como ExLlamaV2/TabbyAPI. Está licenciado bajo Apache 2.0 y su idioma de trabajo es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (etiquetado como gemma4; detalles no disponibles) |
| Parametros totales | 13.400.136.684 (según metadatos safetensors; el nombre del modelo indica 31B, dato contradictorio) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 5,65 bpw (esta variante); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion EXL3) |

## Arquitectura y entrenamiento

El modelo base, Wicked-Stuff-31B-Final, es un fine-tune comunitario cuya etiqueta de arquitectura es "gemma4", lo que sugiere un origen en la familia Gemma; sin embargo, la model card no proporciona detalles sobre la arquitectura concreta, el numero de tokens de entrenamiento del fine-tune ni la composicion del dataset. Existe ademas una inconsistencia relevante: el nombre y las etiquetas apuntan a 31B parametros, pero los metadatos de safetensors del repositorio cuantizado reportan aproximadamente 13,4 mil millones de parametros. Esta discrepancia podria deberse a un error de etiquetado del autor o a que el nombre herede una nomenclatura del modelo base sin correspondencia con el tamaño real.

Sobre el proceso de entrenamiento no hay informacion publicada: no se especifica si se emplearon tecnicas como SFT, DPO o RLHF, ni el origen de los datos. Por las etiquetas del repositorio (roleplay, ERP, horror, unaligned), puede inferirse que el fine-tune se centro en datos de narrativa interactiva y conversacion de contenido adulto, eliminando los rechazos de seguridad tipicos de los modelos base, pero esta inferencia no esta confirmada por documentacion del autor.

## Capacidades

- Generacion de texto conversacional e instruct (pipeline text-generation).
- Roleplay de larga duracion y escritura creativa, incluido contenido explicito adulto (NSFW/ERP), horror y violencia ficticia.
- Comportamiento "unaligned": sin capas de rechazo de seguridad, responde a prompts que los modelos comerciales rechazarian.
- Formato instruct para seguir instrucciones del usuario dentro de la conversacion.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card; otros idiomas no disponibles.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento extendido (thinking): no disponible.

## Casos de uso

- Roleplay interactivo de contenido adulto: el modelo esta afinado expresamente para narrativa ERP y conversaciones de rol inmersivas, manteniendo coherencia de personaje a lo largo de sesiones multi-turno.
- Escritura de ficcion de terror y violencia: puede generar prosa con contenido grafico (horror, violencia) que otros modelos filtrarian, util para autores que exploran tematicas oscuras.
- Completado de escenas en novelas para adultos: integrable en herramientas de escritura local para redactar y expandir pasajes maduros sin censura.
- Chatbots de personaje sin restricciones: despliegue en frontends como SillyTavern o TabbyAPI para crear personajes persistentes con personalidad definida.
- Generacion de dialogo para videojuegos maduros: prototipado de conversaciones de NPC con contenido para adultos en proyectos indie.
- Investigacion sobre alineacion y seguridad: como ejemplo de modelo desalineado, util para estudiar diferencias de comportamiento frente a modelos con guardrails, siempre en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 26,8 GB; con overhead de KV cache, se recomienda al menos 30-32 GB de VRAM para la variante de 5,65 bpw. Si el tamaño real de parametros es el reportado por safetensors (13,4B), el consumo podria ser menor de lo que sugiere el nombre "31B".
- GPU recomendadas: RTX 4090 (24 GB, probablemente insuficiente con contexto largo), RTX 5090 (32 GB), NVIDIA A100 40 GB, A6000 48 GB o H100.
- Consumer GPU: no cabe comodamente en una RTX 4090 de 24 GB con contexto extenso; si cabe en una RTX 5090 (32 GB) o en configuraciones multi-GPU de gama alta.
- Opciones de despliegue: backends compatibles con EXL3, principalmente ExLlamaV2/ExLlamaV3 y TabbyAPI. No es ejecutable directamente con llama.cpp, Ollama, vLLM o TGI, que requieren formatos GGUF o safetensors estandar.
- Latencia y throughput: no disponible; los backends ExLlama suelen ofrecer generacion rapida en GPU de gama alta, pero no hay cifras publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|
| ReadyArt/Wicked-Stuff-31B-Final-5.65bpw-EXL3 | 13,4B (segun safetensors; nombre indica 31B) | EXL3 5,65 bpw | Apache 2.0 | Roleplay NSFW unaligned |
| TheDrummer/Modelos tipo Behemoth/Anubis (fine-tunes desalineados) | 70B-121B | GGUF/EXL3 variadas | Apache 2.0 (segun base) | Roleplay sin censura |
| NousResearch/Hermes (serie 3) | 8B-70B | multiples | Apache 2.0 | Instruct general, neutro en contenido |

Frente a alternativas como los fine-tunes desalineados de TheDrummer, Wicked-Stuff ofrece un tamaño presumiblemente menor (mas facil de alojar en una sola GPU) bajo la misma licencia permisiva, aunque sin datos de benchmarks que permitan comparar calidad de escritura. Frente a series como Hermes, se diferencia en que renuncia deliberadamente a la alineacion y al soporte de tooling, especializandose en narrativa adulta.

## Limitaciones y advertencias

- Contenido solo para adultos: el modelo genera material explicito (NSFW, ERP, violencia, horror) y esta marcado como not-for-all-audiences; su uso por menores de edad es inapropiado.
- Riesgo de alucinacion elevado en tareas factuales: al tratarse de un fine-tune de roleplay sin documentacion de entrenamiento, no es fiable para datos, matematicas o codigo.
- Sin soporte de tool calling ni agentes: no apto para pipelines de produccion que requieran function calling.
- Idioma: optimizado para ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Discrepancia de parametros (13,4B vs 31B) sin aclaracion del autor: verificar el tamaño real antes de planificar hardware.
- Formato EXL3: incompatible con ecosistemas GGUF/vLLM; requiere backends ExLlama y GPU NVIDIA (soporte AMD limitado).
- Licencia Apache 2.0: permite uso comercial del modelo, pero el contenido generado puede estar sujeto a restricciones legales segun jurisdiccion; el autor no ofrece garantias.
- Sin benchmarks publicados: la calidad relativa frente a otros modelos de roleplay es desconocida y depende de pruebas subjetivas de la comunidad.

## Enlaces

- Modelo cuantizado: https://huggingface.co/ReadyArt/Wicked-Stuff-31B-Final-5.65bpw-EXL3
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-31B-Final
- Autor (ReadyArt): https://huggingface.co/ReadyArt
- Paper, repositorio de codigo y demos: no disponible
