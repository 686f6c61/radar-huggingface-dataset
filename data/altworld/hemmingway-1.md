# Altworld/Hemmingway-1

## Resumen

Hemmingway-1 es un modelo de generacion de texto de 27.000 millones de parametros desarrollado por The Commons Lab (Altworld), con sede en Bulach, Suiza. Se trata de un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B, orientado especificamente a la redaccion de mensajes cotidianos: correos electronicos, mensajes a propietarios, notas a companeros de trabajo y comunicaciones de caracter administrativo o financiero. El modelo se presenta como una alternativa que entrega directamente el texto solicitado, sin preambulos, opciones multiples ni comentarios meta que obliguen al usuario a filtrar la respuesta.

La propuesta del autor es que el modelo compite en calidad de escritura "humana" contra modelos frontera de mayor tamano, apoyandose en benchmarks propios (CommunicationBench, Human-Likeness y StoryBench) y en el benchmark publico EQ-Bench 4. El modelo declara una longitud de contexto de 262.144 tokens y una licencia CC BY-NC 4.0, que restringe el uso comercial a un acuerdo separado con el autor. El repositorio ocupa 54,7 GB y acumula 3.025 descargas y 914 likes en Hugging Face desde su publicacion en septiembre de 2026.

Es relevante ahora porque ocupa un nicho poco atendido por los modelos generalistas: la escritura utilitaria breve con tono natural y sin envoltorio conversacional. Su tamano de 27B lo situa en un rango desplegable en hardware de gama alta de consumo con cuantizacion, y su contexto largo permite manejar hilos de correo o documentos extensos como material de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.8-27B; tag `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones de la comunidad no confirmadas) |
| Idiomas soportados | ingles (declarado como "English-first") |
| Licencia | CC BY-NC 4.0 (uso no comercial; uso comercial mediante acuerdo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3.8-27B, con 26.895.998.464 parametros en safetensors. La model card lo etiqueta con el identificador `qwen3_5_text` y lo describe como un finetune del modelo base Qwen/Qwen3.8-27B. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se emplearon tecnicas de RLHF, DPO o preferencias sinteticas.

La innovacion declarada no es arquitectonica sino de comportamiento: el modelo esta optimizado para producir directamente el texto final sin preambulos, listas de opciones ni explicaciones meta. El autor cuantifica esta propiedad con una metrica propia ("The message, not a memo") que mide la frecuencia con la que el modelo entierra el texto util en comentario adicional. Ademas, la model card reporta una tasa mediana de generacion de 382 tokens por segundo en la aplicacion alojada del autor durante su benchmark de escritura de noviembre de 2026, aunque no se detalla el hardware empleado. No se documentan innovaciones como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto orientada a escritura cotidiana: mensajes, correos, notas administrativas, comunicaciones laborales y peticiones delicadas.
- Escritura con tono natural y alta "humanidad" percibida, segun el benchmark propio Human-Likeness del autor.
- Razonamiento emocional y lectura de contexto social, evaluado en EQ-Bench 4 (tercer puesto segun el autor).
- Narracion y escritura creativa, con resultados declarados en StoryBench a la altura de Kimi K3.
- Manejo de contexto largo de hasta 262.144 tokens, util para hilos de correo o documentos de referencia extensos.
- Capacidad multilingue limitada: el modelo se declara "English-first" y solo lista ingles como idioma soportado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Redaccion de correos administrativos y reclamaciones: el modelo genera directamente el texto para un propietario, una compania de seguros o una administracion, sin preambulos ni opciones alternativas, lo que reduce el tiempo de edicion posterior.
- Comunicacion laboral delicada: notas a companeros o superiores sobre temas incomodos (retrasos, conflictos, solicitudes de cambio), aprovechando el rendimiento declarado en la categoria de "hard asks" y en persuasion.
- Asistencia en gestion personal y financiera: redaccion de mensajes sobre facturas, suscripciones, cancelaciones o disputas de cobro, donde el modelo destaca segun el desglose por categorias del autor.
- Herramienta de escritura integrada en aplicaciones de mensajeria o correo: su formato de salida directo y su contexto de 262.144 tokens permiten incorporar el hilo completo de la conversacion como referencia y devolver solo el mensaje final.
- Generacion de borradores para soporte al cliente en tono humano: el modelo puede producir respuestas con registro natural para equipos que revisan y aprueban manualmente antes del envio.
- Escritura creativa de caracter costumbrista o conversacional: relatos breves y dialogos con tono realista, aunque el propio autor reconoce que pierde frente a modelos especializados en narrativa hostil o turnos largos de historia.
- Prototipado e investigacion sobre estilo de escritura: al ser un finetune abierto con licencia no comercial, sirve como base para estudiar alineacion de tono, brevedad y naturalidad en modelos de 27B.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor. CommunicationBench, Human-Likeness y StoryBench son benchmarks propios de The Commons Lab; EQ-Bench 4 es un benchmark publico externo. No se dispone de cifras numericas absolutas para MMLU, HumanEval o GSM8K.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| CommunicationBench (propio) | Primer puesto; supera a Fable 5.1 y a GPT-6 Astra por 50 puntos | 80 peticiones reales, comparaciones ciegas en ambos ordenes, juez distinto a los modelos evaluados |
| Human-Likeness (propio) | 26 puntos por delante del siguiente modelo | Mismos enfrentamientos, pregunta "quien lo escribio, una persona o un modelo" |
| Categoria "hard asks" (propio) | 72% frente a 9% de GPT-6 Astra | Desglose por categoria de CommunicationBench |
| EQ-Bench 4 (externo) | Tercer puesto; por delante de GPT-5.5, Opus 4.7 y Opus 4.8; a 12 puntos del primero | Ejecutado con el harness propio del benchmark |
| StoryBench (propio) | Nivel de Kimi K3; 504 puntos por encima de Qwen3.8-27B base | Por delante de Qwen3.8-Max y DeepSeek V4 Pro |
| Tasa de generacion (app alojada) | 382 tokens/s mediana | Benchmark de noviembre de 2026 del autor; hardware no especificado |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 54 GB solo para pesos, mas overhead de KV cache; requiere GPUs de 80 GB (A100, H100) o multiples GPUs.
- Cuantizacion a 8 bits: alrededor de 27-30 GB de VRAM, viable en una RTX 5090 (32 GB) o A6000 (48 GB).
- Cuantizacion a 4 bits: alrededor de 14-16 GB de VRAM, viable en RTX 4090 (24 GB), RTX 4080 (16 GB, justo) y similares.
- Contexto completo de 262.144 tokens: el KV cache crece de forma significativa y puede requerir GPUs de 80 GB incluso con cuantizacion, dependiendo de la implementacion.
- Despliegue recomendado por el autor: `vllm serve Altworld/Hemmingway-1 --max-model-len 262144`; tambien es compatible con `transformers` mediante `AutoModelForCausalLM`.
- Otras opciones de despliegue (llama.cpp, Ollama, TGI): no confirmadas en la informacion proporcionada; al publicarse solo en safetensors, requeriria conversion a GGUF para llama.cpp u Ollama.
- Throughput declarado: 382 tokens/s medianos en la aplicacion alojada del autor, sin detalle de hardware ni lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Hemmingway-1 | 27B | 262.144 | CC BY-NC 4.0 | Escritura cotidiana, tono humano | Pesos en HF, app alojada, apps Mac y Android |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible | Modelo generalista | Pesos en HF |
| Kimi K3 | no disponible | no disponible | no disponible | Generalista y narrativa | no disponible en la informacion |
| GPT-6 Astra | no disponible (propietario) | no disponible | propietario | Generalista frontera | API |
| Fable 5.1 | no disponible (propietario) | no disponible | propietario | Generalista frontera | no disponible en la informacion |

En los benchmarks del autor, Hemmingway-1 supera a Fable 5.1 en CommunicationBench y queda 26 puntos por delante en Human-Likeness; frente a Kimi K3 empata en StoryBench y lo supera en comunicacion cotidiana. Frente a su modelo base Qwen3.8-27B, el autor reporta 504 puntos de mejora en StoryBench. No se dispone de datos independientes que permitan verificar estas comparaciones.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un finetune de Qwen3.8-27B, hereda los sesgos del modelo base, no cuantificados aqui.
- Riesgo de alucinacion: el propio autor advierte que el modelo "puede equivocarse y aun asi sonar seguro", y desaconseja su uso para decisiones medicas, legales o financieras.
- Limitacion idiomatica: el modelo es "English-first" y solo declara soporte de ingles; su rendimiento en castellano no esta evaluado ni garantizado.
- Restriccion de licencia: CC BY-NC 4.0 prohibe el uso comercial sin acuerdo separado con The Commons Lab; cualquier integracion en producto o servicio requiere contacto previo (luka@hemmingway.io).
- Benchmarks no independientes: CommunicationBench, Human-Likeness y StoryBench son disenados y ejecutados por el propio autor, lo que introduce riesgo de sesgo de seleccion y de diseno; solo EQ-Bench 4 es externo.
- Debilidad declarada en narrativa hostil y turnos largos de historia, donde el autor reconoce que otros modelos son mejores.
- Sin datos publicos sobre tool calling, agentes, cuantizaciones oficiales ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K), lo que dificulta la comparacion objetiva con alternativas.
- El contexto de 262.144 tokens es declarado, pero no se documenta su rendimiento efectivo (por ejemplo, en tareas de recuperacion en el medio del contexto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Altworld/Hemmingway-1
- Aplicacion alojada: https://hemmingway.io
- Descarga de apps Mac y Android: https://hemmingway.io/download
- Codigo en GitHub: https://github.com/lukeckprobierts/Hemmingway-1
- Product Hunt: https://www.producthunt.com/products/hemmingway-ai
- Benchmark de velocidad de escritura: https://hemmingway.io/speed/
- Pagina del autor (The Commons Lab): https://hemmingway.io/about/
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
