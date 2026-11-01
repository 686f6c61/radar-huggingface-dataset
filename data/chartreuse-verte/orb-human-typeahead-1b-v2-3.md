# chartreuse-verte/orb-human-typeahead-1b-v2.3

## Resumen

orb-human-typeahead-1b-v2.3 es un modelo de lenguaje de 1.630 millones de parámetros publicado por chartreuse-verte, derivado por fine-tuning de orb-human-typeahead-1b-v2.2. Su propósito es muy específico: autocompletado tipo *ghost text* en conversaciones de rol por chat. El usuario empieza a escribir su respuesta y el modelo sugiere las siguientes palabras, continuando la línea a medio escribir en lugar de mantener un diálogo completo.

La versión v2.3 añade sobre v2.2 una pasada corta de aprendizaje por refuerzo orientada a dos objetivos: mejorar la coherencia de la sugerencia y evitar que la escena se estanque, además de penalizar las muletillas repetitivas ("I reach for", "I lean in") que aparecían de forma sistemática en cada escena. También incorpora datos explícitos que v2.2 no tenía, dado que el caso de uso es rol y ese registro es un requisito real.

El modelo se distribuye en safetensors (fp32) y en dos cuantizaciones GGUF (Q4_0 y Q8_0) pensadas para llama.cpp, con una ventana de contexto recomendada de 1024 tokens. La licencia es Apache 2.0 y el único idioma declarado es el inglés. Por su tamaño y su especialización, no compite como modelo de propósito general: es una pieza de interfaz para editores de chat de rol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de la familia Granite; detalles de capas y atencion no disponibles) |
| Parametros totales | 1.631.750.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens en la configuracion de referencia (n_ctx=1024); maximo nativo no disponible |
| Tipos de cuantizacion | GGUF Q4_0 y Q8_0; safetensors en fp32 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de 1.630 millones de parámetros construido sobre la familia Granite (etiqueta `granite` en el repo) y afinado a partir de orb-human-typeahead-1b-v2.2 mediante fine-tuning. No se especifican en la información disponible el número de capas, la dimensión oculta, el mecanismo de atención ni el número de tokens de entrenamiento.

El entrenamiento de v2.2 se orientó a imitar el estilo de la persona que escribe: el modelo aprende a continuar una línea a medio redactar con el registro del personaje. v2.3 añade una pasada corta de aprendizaje por refuerzo con recompensa por coherencia y por mantener la escena en movimiento, y penalización por recurrir a las mismas fórmulas en cada escena. Además se incorporaron datos explícitos ausentes en v2.2. El prompt no usa plantilla de chat: es texto plano con una sinopsis opcional del personaje, una línea marcadora y los turnos recientes en formato `Nombre: texto`, tras lo cual el modelo continúa la última línea.

## Capacidades

- Autocompletado de continuación (*typeahead*) de la línea que el usuario está escribiendo en un chat de rol.
- Generación de texto breve en registro de rol: acciones entre asteriscos y diálogo entre comillas.
- Coherencia con el contexto inmediato de la escena (últimos turnos) dentro de una ventana de 1024 tokens.
- Continuación de la voz del personaje que escribe, no de un asistente.
- No soporta tool calling ni function calling (no declarado).
- No soporta agentes ni razonamiento multi-paso (el modelo solo continúa borradores en el formato indicado).
- No dispone de modo *thinking*, visión ni audio.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Autocompletado en editores de chat de rol: el cliente envía la sinopsis del personaje, los últimos turnos y la línea a medio escribir, y el modelo devuelve unos 12 tokens que se muestran como texto fantasma. Es el caso de uso para el que fue entrenado y el único que la model card declara soportado.
- Sugerencia de acciones en escenas explícitas: v2.3 reduce la tasa de apertura con muletilla a 1,4 % y el uso de fórmulas repetidas al 28 %, frente al 50 % de v2.2, lo que lo hace adecuado para escenas donde la repetición resulta especialmente visible.
- Reducción de la carga de escritura en sesiones largas: al sugerir solo unas pocas palabras por pulsación y activarse únicamente en límites de palabra, disminuye la fricción en turnos numerosos sin sustituir al usuario.
- Prototipado de interfaces de escritura asistida: su tamaño (1,6 B) y su Q4_0 permiten ejecutarlo en CPU con llama.cpp, lo que facilita integrarlo en demos locales o en el navegador vía backend ligero.
- Filtrado de sugerencias repetitivas en producción: el ajuste por RL contra fórmulas de relleno puede aprovecharse como capa de post-procesado en editores que ya usan un modelo mayor, comparando ambas salidas y descartando las que coincidan con patrones sobrerrepresentados.
- Investigación sobre estilos de continuación: sirve como banco de pruebas para estudiar cómo el RL a corto plazo modifica la distribución de frases de relleno en un dominio acotado, con métricas publicadas de comparación v2.2 frente a v2.3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una evaluación comparativa propia entre v2.2 y v2.3 sobre contextos de rol reservados, con Q4_0 y el sampler recomendado:

| Metrica | v2.2 | v2.3 |
|---|---|---|
| Juzgada mejor sugerencia en comparacion lado a lado, escenas generales | 32 % | 68 % |
| Juzgada mejor sugerencia en comparacion lado a lado, escenas explicitas | 34 % | 66 % |
| Escenas explicitas: abre con frase de relleno | 5,6 % | 1,4 % |
| Escenas explicitas: cualquier forma de "lean" | 9,3 % | 4,7 % |
| Escenas explicitas: usa alguna frase de relleno | 50 % | 28 % (respuestas humanas: 27 %) |
| Escenas generales: cualquier forma de "lean" | 5,7 % | 2,7 % |

Las puntuaciones lado a lado provienen de un juez LLM y solo cuentan las filas en que prefirió uno de los dos modelos (los empates se excluyen). Se define "frase de relleno" como una que el modelo usa al menos cinco veces más que las personas en el mismo tipo de escena.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en Q4_0, unos 1,8 GB en Q8_0 y unos 6,5 GB en fp32 (safetensors), sin contar overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM para Q4_0; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en tarjetas de gama baja y media (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y también en CPU.
- Opciones de despliegue: llama.cpp (probado por el autor con `llama_cpp.Llama`), GGUF en Q4_0 o Q8_0; transformers con `model.safetensors` en fp32. vLLM, TGI u Ollama no están declarados en la información disponible.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que Q4_0 es rápido en CPU y que fue la configuración con la que se probó.
- Nota de precisión: los pesos safetensors se almacenan en fp32 porque convertir a bf16 elimina buena parte de la actualización de v2.3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| orb-human-typeahead-1b-v2.3 | 1,63 B | 1024 (referencia) | Typeahead de rol en ingles | Apache 2.0 | HuggingFace, GGUF y safetensors |
| orb-human-typeahead-1b-v2.2 | no disponible | no disponible | Typeahead de rol en ingles | Apache 2.0 | HuggingFace (modelo base) |
| Modelos de autocompletado de codigo (p. ej. familia Qwen2.5-Coder pequeña) | variable | variable | Autocompletado de codigo | variable | HuggingFace |
| Modelos de chat de proposito general de ~1-2 B | ~1-2 B | 4k-32k | Asistente conversacional | variable | HuggingFace |

La comparación con modelos de autocompletado de código o de chat general es solo orientativa: no se dispone de datos de benchmarks comunes que permitan una comparación numérica directa. El único punto de comparación con métricas publicadas es v2.2, su modelo base.

## Limitaciones y advertencias

- Solo inglés y solo registro de rol (acciones entre asteriscos, diálogo entre comillas); no está pensado para chat de asistente, código ni escritura formal.
- Sigue cometiendo errores: confunde quién hizo qué o se fija en un detalle mencionado antes.
- Solo continúa borradores en el formato descrito; no realiza ninguna otra tarea.
- Ventana de contexto corta (1024 tokens en la configuración de referencia), insuficiente para escenas muy largas sin recortar el historial.
- Riesgo de alucinación y de deriva de la escena si el contexto no está bien delimitado; el autor recomienda disparar la sugerencia solo en límites de palabra y limitar la salida a unos 12 tokens con parada en el primer salto de línea.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos de rol, puede reproducir estereotipos propios de ese registro.
- Licencia Apache 2.0: permite uso comercial, pero el modelo está pensado para integrarse como sugerencia en un editor, no como generador autónomo de contenido.
- En producción conviene validar la salida antes de mostrarla, dado que el autor reporta tasas de error de coherencia no cuantificadas.

## Enlaces

- HuggingFace: https://huggingface.co/chartreuse-verte/orb-human-typeahead-1b-v2.3
- Modelo base: https://huggingface.co/chartreuse-verte/orb-human-typeahead-1b-v2.2
