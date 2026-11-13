# atrezonator/Qwen3.8-40B-Ultimate-Heretic-Uncensored

## Resumen

Qwen3.8-40B-Ultimate-Heretic-Uncensored es un ajuste fino (finetune) de gran tamano publicado por el usuario atrezonator en Hugging Face, derivado del modelo base Qwen/Qwen3.8-27B. Se trata de una variante "abliterated" y "uncensored" (etiquetada como heretic) que elimina total o parcialmente los mecanismos de rechazo del modelo original, orientada a usos creativos, roleplay, escritura de ficcion y generacion sin filtros. El autor declara un pipeline image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la informacion disponible no detalla la arquitectura de vision.

El modelo ha sido expandido de 27B a aproximadamente 40B parametros mediante un proceso de entrenamiento multi-etapa que, segun las notas del autor, incluye una primera fase con el dataset "Deckard Large" (5 datasets) sobre el modelo de 27B, una segunda fase de expansion a 40B y una tercera fase entrenada con un dataset de Claude, incorporando MTP (multi-token prediction). El repositorio contiene los pesos en bfloat16 a precision completa (79,9 GB) destinados a la creacion de cuantizaciones, entrenamiento y fusiones.

La relevancia de este modelo reside en su enfoque en modos multiples de razonamiento e instruccion (el autor menciona 27 modos de razonamiento, 27 modos de instruccion, 9 modos de razonamiento "xhigh" y 15 "AI Constructs"), asi como en la supresion de restricciones de contenido. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, con notas de desarrollo que indican que el trabajo seguia en fase de pruebas, por lo que su madurez y reproducibilidad no estan verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8; tag `qwen3_5`), con MTP (multi-token prediction) segun notas del autor |
| Parametros totales | 39.958.026.224 (~40B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256k maxima segun el autor; minimo recomendado 32k, sugerido 64k-128k |
| Tipos de cuantizacion | BF16/full precision en este repo; GGUF en repositorio asociado (q4ks mencionado en ejemplos) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer derivado de la familia Qwen3.8, con expansion de tensores hasta 1290 tensores y 96 capas segun las notas de desarrollo. El autor menciona el uso de tecnicas de entrenamiento como "Cold Fusion", "GAIN Training", "Multi-stage tuning" y entrenamiento con Unsloth, ademas de MTP (multi-token prediction). La expansion de 27B a 40B se realizo en fases: una primera etapa sobre el modelo de 27B con el dataset "Deckard Large" (5 datasets), una segunda etapa de expansion a 40B y una tercera etapa entrenada con un dataset de Claude. Tambien se menciona la fusion de razonamiento de GLM con el de Qwen en una de las builds.

Los datasets declarados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El proceso de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) es el mecanismo habitual en modelos heretic/uncensored, aunque el autor no detalla el procedimiento exacto empleado. Las notas indican que el trabajo seguia en fase de prototipo y pruebas en el momento de la publicacion, con builds pendientes de finalizacion.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" (bloques de razonamiento explicitos), con multiples modos de razonamiento configurables (el autor menciona 27 modos y 9 modos "xhigh").
- Modos de instruccion multiples (27 modos declarados) invocables mediante comandos como `{REASON:business}` o escribiendo "help" en el chat.
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text), heredadas del modelo base.
- Generacion de codigo y tareas de programacion (tag "coder", "Coder AI Construct").
- Escritura creativa, ficcion, narrativa de todos los generos y roleplay.
- "AI Constructs" (15 declarados, 5 "Super AI Constructs"): perfiles especializados como Brainstorm, Brainstorm Business, Universal Teacher, Agent y Coder, que el autor describe como fusionados dinamicamente segun el contexto.
- Soporte multilingue en 16 idiomas.
- Contenido sin filtros (uncensored/abliterated): el modelo no aplica los rechazos tipicos del modelo base.
- Soporte de tool calling y agentes: no confirmado explicitamente en la informacion disponible, aunque se menciona un "Agent AI Construct" y ajustes de temperatura para "tools/agents".

## Casos de uso

- Escritura creativa y ficcion sin restricciones: el modelo esta disenado para generar narrativa de todos los generos y roleplay sin los rechazos del modelo base, con contexto de hasta 256k tokens que permite mantener coherencia en novelas o campanas largas.
- Roleplay y personajes persistentes: los "AI Constructs" y los modos de instruccion permiten definir perfiles de personaje estables a lo largo de conversaciones multi-turno extensas.
- Generacion de codigo en entornos controlados: el tag "coder" y el "Coder AI Construct" sugieren uso para asistencia de programacion; al ser un modelo abliterated, conviene revisar el output antes de integrarlo en pipelines de CI/CD.
- Prototipado de agentes conversacionales: el "Agent AI Construct" y los ajustes de temperatura recomendados para agentes (0,6-0,7) apuntan a su uso en flujos de agente, aunque el soporte formal de tool calling no esta confirmado.
- Analisis de documentos largos: con contexto de 64k-128k recomendado y maximo de 256k, es adecuado para resumir o extraer informacion de documentos extensos en cualquiera de los 16 idiomas soportados.
- Generacion de material didactico: el "Universal Teacher AI Construct" esta orientado a explicaciones y contenido educativo estructurado.
- Planificacion de negocio y brainstorming: el ejemplo de la model card (plan de negocio para un food truck con tablas y graficos) ilustra el uso del construct "business" para generar documentos estructurados y exhaustivos.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated, sirve como objeto de estudio para analizar como la supresion de rechazos afecta al comportamiento y a los sesgos del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las notas del autor mencionan pruebas y "bench checking" en curso, pero no aportan cifras de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 80 GB solo para los pesos (39,96B parametros x 2 bytes), mas overhead de activaciones y KV cache; requiere multiples GPU o una GPU de 80 GB con cuantizacion parcial.
- Cuantizacion q4: aproximadamente 20-25 GB, viable en una RTX 4090 (24 GB) de forma ajustada o en una A6000 (48 GB) con holgura.
- Cuantizacion q8: aproximadamente 40 GB, requiere A100 80 GB, H100 o dos GPU consumer.
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16; RTX 4090, RTX 3090 o A6000 para cuantizaciones q4/q5.
- Despliegue: transformers (libreria declarada), llama.cpp/Ollama para GGUF (repositorio asociado del autor), vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. El autor menciona que un "Business Construct" de 3000 tokens se procesa en unos 2 segundos en su entorno de prueba, sin especificar hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-40B-Ultimate-Heretic-Uncensored (este) | ~40B | 256k | apache-2.0 | Finetune abliterated, 0 descargas, sin benchmarks publicados |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | no disponible | Modelo original con alineacion estandar; base de este finetune |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | ~27B | no disponible | no disponible | Version de 27B del mismo linaje, con Turbo Brilliance 50X V2 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: no aplica los rechazos de seguridad del modelo base, por lo que puede generar contenido danino, ilegal o sensible sin filtro. No apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion: al ser un finetune agresivo con modos de razonamiento y constructs fusionados, la fidelidad factual no esta verificada ni medida.
- Cero descargas y cero likes: no hay validacion independiente de la comunidad; las notas del autor indican que el trabajo seguia en fase de pruebas.
- Sin benchmarks publicados: imposible comparar su rendimiento real con alternativas de forma objetiva.
- Licencia apache-2.0: permite uso comercial segun los terminos de la licencia, pero el caracter uncensored puede incumplir politicas de plataformas de despliegue o normativas locales.
- El autor menciona la expansion de 27B a 40B y el entrenamiento con un dataset de Claude; no se detalla la procedencia ni los terminos de uso de dichos datos, lo que puede plantear dudas sobre la cadena de licencias.
- Contexto maximo de 256k declarado pero no verificado; el autor recomienda 64k-128k en la practica.
- Modelo base declarado como Qwen/Qwen3.8-27B, pero el pipeline es image-text-to-text y el tag de arquitectura es `qwen3_5`; la coherencia entre estos metadatos no esta confirmada.
- Idiomas: 16 declarados, pero el rendimiento real por idioma no esta medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atrezonator/Qwen3.8-40B-Ultimate-Heretic-Uncensored
- Repositorio GGUF asociado (notas y settings): https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Modelo de 27B del mismo linaje: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Modelo base de la familia Ultimate: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate
- Repositorio Turbo Brilliance 50X: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Coleccion Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Perfil del autor del linaje: https://huggingface.co/DavidAU
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
