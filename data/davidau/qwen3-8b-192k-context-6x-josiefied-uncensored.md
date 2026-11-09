# DavidAU/Qwen3-8B-192k-Context-6X-Josiefied-Uncensored

## Resumen

Qwen3-8B-192k-Context-6X-Josiefied-Uncensored es un ajuste fino del modelo Josiefied-Qwen3-8B-abliterated-v1, publicado por el usuario DavidAU en Hugging Face. Se trata de una variante de Qwen3-8B, el modelo denso de 8.190 millones de parametros desarrollado originalmente por Alibaba Qwen, que ha sido sometido a un proceso de "abliteracion" (eliminacion de rechazos o sesgos de seguridad) por parte de Goekdeniz-Guelmez y posteriormente modificado por DavidAU para ampliar su ventana de contexto desde los 32.768 tokens originales hasta los 196.608 tokens (192k) mediante la tecnica YARN descrita en la documentacion tecnica del repositorio oficial de Qwen.

El modelo mantiene la arquitectura transformer densa de Qwen3, con modo de razonamiento explicito (bloques `<think>`) y capacidad de generar respuestas largas, desde 2.000 hasta mas de 13.000 tokens. Su principal reclamo es la combinacion de contexto extendido, razonamiento y ausencia de filtros de contenido, orientado a casos de uso creativos, roleplay y generacion de texto sin restricciones editoriales.

Es relevante en el ecosistema open source porque demuestra la viabilidad de extender el contexto de un modelo de 8B mediante YARN sin reentrenamiento completo, y porque ofrece una alternativa sin censura sobre una base tecnica solida. No obstante, la licencia no esta declarada en el repositorio y el modelo hereda las limitaciones y riesgos de su base abliterada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con modo de razonamiento explicito |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 196.608 tokens (192k), extendido mediante YARN desde 32.768 |
| Tipos de cuantizacion | El repositorio proporciona safetensors en precision completa; el autor indica que la fuente sirve para generar GGUF, GPTQ, EXL2, AWQ y HQQ (los quants concretos no estan publicados aun) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-8B, un transformer denso con atencion por cabezas y mecanismos de razonamiento por bloques. Sobre esa base, Goekdeniz-Guelmez aplico una tecnica de "abliteracion" que elimina la direccion de rechazo en el espacio de activaciones, dando lugar a Josiefied-Qwen3-8B-abliterated-v1. DavidAU tomo ese modelo y extendio su contexto de 32.768 a 196.608 tokens mediante YARN (Yet Another RoPE extensioN), siguiendo las notas tecnicas del repositorio oficial de Qwen. No se especifica si hubo reentrenamiento adicional, ajuste fino supervisado o RLHF/DPO sobre la version de 192k; la model card no detalla el dataset ni el numero de tokens de entrenamiento.

La innovacion principal es la extension de contexto por interpolacion de RoPE sin reentrenamiento completo, lo que permite alcanzar 192k tokens manteniendo los pesos originales. El autor recomienda un limite minimo de contexto de 8k a 16k para el modo "thinking" y sugiere parametros de muestreo especificos (temperatura 1+, top k 100+, repetition penalty 1.02-1.09) para mejorar la generacion creativa de formato largo. La model card tambien menciona que el modelo puede generar entre 2.000 y mas de 13.000 tokens de salida.

## Capacidades

- Generacion de texto conversacional y de formato largo, con salidas de hasta mas de 13.000 tokens.
- Razonamiento explicito mediante bloques `<think>`, activables por defecto o mediante un rol de sistema opcional.
- Contexto extendido de 192k tokens, adecuado para documentos largos y conversaciones multi-turno prolongadas.
- Capacidad de generar codigo y matematicas, heredada de la base Qwen3-8B (no se detallan evaluaciones especificas en la model card).
- Soporte de plantillas Jinja y ChatML para la construccion de prompts.
- Ausencia de filtros de rechazo (modelo "uncensored"), lo que permite abordar tematicas que la base original rechazaria.
- No se documenta soporte de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Roleplay y narrativa interactiva sin restricciones editoriales: el modelo acepta plantillas ChatML y Jinja, y sus parametros de muestreo recomendados (temperatura alta, repetition penalty moderada) estan pensados para sesiones creativas largas con coherencia de personaje.
- Analisis de documentos extensos: con 192k tokens de contexto puede procesar contratos, informes o libros completos en una sola pasada, algo inviable en la base de 32k original.
- Generacion de ficcion de formato largo: la capacidad de producir mas de 13.000 tokens de salida permite redactar capitulos completos o guiones sin truncamientos.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterado, sirve para estudiar el comportamiento de modelos sin filtros de rechazo y comparar con la base Qwen3-8B original en tareas de evaluacion de sesgos.
- Asistente conversacional de dominio abierto: la ventana de 192k permite mantener historiales de conversacion muy largos sin perder el hilo, util para soporte tecnico o tutorias prolongadas.
- Prototipado de pipelines de generacion de texto: al estar en safetensors y ser compatible con transformers y text-generation-inference, se puede desplegar rapidamente en entornos de investigacion para experimentar con tecnicas de muestreo y plantillas.
- Generacion de codigo en entornos controlados: hereda la capacidad de codigo de Qwen3-8B, aunque no se documentan evaluaciones especificas ni soporte de tool calling en esta variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la model card oficial de Qwen3-8B para benchmarks, pero no aporta mediciones propias de esta variante de 192k ni de la version abliterada.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 16,4 GB solo para los pesos, mas overhead de activaciones y cache KV, que con 192k de contexto puede ser muy elevado.
- La cache KV para 192k tokens es el principal cuello de botella: en fp16 puede superar varias decenas de GB segun la configuracion de atencion, por lo que en la practica se recomienda cuantizacion o limitar el contexto efectivo a 8k-32k.
- GPU recomendadas: A100 80 GB o H100 para contexto completo en precision alta; RTX 4090 (24 GB) para cuantizaciones de 4-8 bits con contexto moderado.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) solo con cuantizacion GGUF o GPTQ de 4-8 bits y contextos reducidos; en fp16 no cabe en 24 GB.
- Opciones de despliegue: transformers (formato nativo safetensors), text-generation-inference (el repo incluye el tag endpoints_compatible), y generacion de GGUF/GPTQ/EXL2/AWQ/HQQ a partir de la fuente (los quants concretos aun no estan publicados en el momento de redactar esta ficha).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B-192k-Context-6X-Josiefied-Uncensored | 8,19B | 192k (YARN) | No disponible | Variante abliterada y sin censura, contexto extendido |
| Qwen/Qwen3-8B | 8,19B | 32.768 | Apache 2.0 (segun repositorio oficial) | Base original con filtros de seguridad y benchmarks publicados |
| Goekdeniz-Guelmez/Josiefied-Qwen3-8B-abliterated-v1 | 8,19B | 32.768 | No disponible | Base abliterada sin extension de contexto |
| Meta Llama 3.1 8B | 8,03B | 128k | Llama 3.1 Community License | Alternativa densa de tamano similar con contexto largo nativo |

## Limitaciones y advertencias

- Modelo "uncensored" y abliterado: no aplica filtros de rechazo, por lo que puede generar contenido ofensivo, ilegal o danino; no es apto para produccion orientada al publico general sin moderacion adicional.
- La licencia no esta declarada en el repositorio, lo que impide confirmar si se permite uso comercial; debe verificarse con el autor antes de cualquier despliegue productivo.
- La extension de contexto mediante YARN sin reentrenamiento puede degradar la calidad en contextos muy largos; el autor recomienda limitar el "thinking" a 8k-16k tokens.
- Riesgo de alucinacion inherente a los modelos de 8B, agravado por la ausencia de filtros y por la generacion de cadenas de razonamiento largas que pueden desviarse.
- No se documentan idiomas soportados; la base Qwen3 es multilingue, pero esta variante no declara evaluaciones por idioma.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines de agentes.
- Los quants GGUF, GPTQ, EXL2, AWQ y HQQ estan anunciados pero no publicados en el momento de redactar esta ficha; solo hay safetensors en precision completa.
- El repositorio tiene muy pocas descargas (51) y likes (9), lo que indica escasa validacion comunitaria.
- Hereda los sesgos de la base Qwen3-8B y de la abliteracion, que puede alterar el comportamiento en tareas sensibles mas alla de la simple eliminacion de rechazos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Qwen3-8B-192k-Context-6X-Josiefied-Uncensored
- Modelo base (abliterado): https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen3-8B-abliterated-v1
- Modelo original Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
