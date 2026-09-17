# ChatoyantAI/qwen3.5-9b-roleplay-sft-regmix-v1

## Resumen

ChatoyantAI/qwen3.5-9b-roleplay-sft-regmix-v1 es un ajuste fino supervisado (SFT) orientado a roleplay publicado por el usuario ChatoyantAI en Hugging Face. Por el nombre del repositorio se deduce que parte de un modelo base de la familia Qwen3.5 con aproximadamente 9.000 millones de parametros, aunque la model card no confirma ni el modelo base ni la arquitectura. El repositorio ocupa 0,1 GB, un tamano muy inferior al que tendrian los pesos completos de un modelo de 9B en precision completa (unos 18 GB en BF16), lo que sugiere que contiene adaptadores (por ejemplo LoRA) o un subconjunto de pesos, aunque esto no se documenta.

La model card esta redactada en chino y se limita a una tabla con la mezcla de datos de entrenamiento: 50.000 filas y 9.071.866 tokens objetivo distribuidos en siete dominios (lusy, coser, xpersona, aya, tulu, smoltalk e infinity), con una mediana de 181 tokens por ejemplo. El dominio "lusy" concentra el 74,61% de las filas y el 81,06% de los tokens, por lo que la especializacion en roleplay es fuerte y el resto de dominios actuan como regularizadores. El sufijo "regmix" apunta a una optimizacion de la mezcla de datos basada en regresion, si bien el autor no lo explica.

El interes del modelo es limitado pero concreto: es un ejemplo practico de ajuste fino para personajes conversacionales con una mezcla de datos documentada publicamente. Ahora bien, con 0 descargas y 0 likes, sin licencia declarada, sin idiomas especificados y sin resultados de evaluacion, no es un artefacto listo para produccion y debe tratarse como un experimento reproducible mas que como un modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica una variante de Qwen3.5; no se detalla en la model card) |
| Parametros totales | no disponible (el nombre sugiere 9B; el repositorio pesa 0,1 GB, incompatible con pesos completos en BF16) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se etiqueta safetensors; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de ajuste | SFT (supervised fine-tuning) sobre 50.000 filas / 9.071.866 tokens objetivo |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2026-09-17 (ultima actualizacion: 2026-09-17) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo. El identificador del repositorio apunta a un transformer denso derivado de Qwen3.5 con unos 9.000 millones de parametros, y el sufijo "sft" confirma que se trata de un ajuste supervisado, no de un modelo entrenado desde cero ni de una variante con RLHF o DPO documentado. El sufijo "regmix" sugiere el uso de RegMix, una metodologia de optimizacion de mezclas de datos mediante regresion, pero el autor no lo explicita en la informacion disponible.

Lo unico verificable es la composicion del dataset de ajuste, resumida por el propio autor en una tabla con siete dominios. En terminos de filas, "lusy" aporta 37.306 filas (74,61%), "coser" 6.795 (13,59%), "smoltalk" 2.119 (4,24%), "xpersona" 1.748 (3,50%), "infinity" 1.048 (2,10%), "tulu" 733 (1,47%) y "aya" 251 (0,50%). En terminos de tokens objetivo el reparto es similar pero no identico: "lusy" 7.353.453 (81,06%), "smoltalk" 721.036 (7,95%), "tulu" 302.551 (3,34%), "coser" 295.993 (3,26%), "infinity" 247.281 (2,73%), "aya" 119.016 (1,31%) y "xpersona" 32.536 (0,36%). Las medianas de longitud por ejemplo varian mucho entre dominios (de 18 tokens en "xpersona" a 389 en "tulu"), lo que indica una mezcla heterogenea de ejemplos muy cortos y conversaciones largas. La inclusion de "aya", "tulu" y "smoltalk" sugiere que parte del material de regularizacion es de proposito general y multilingue, aunque no se especifican los idiomas finales del modelo.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y personajes: es el objetivo declarado del ajuste, dado el peso dominante del dominio "lusy".
- Mantenimiento de persona y estilo a lo largo de un dialogo: presumible consecuencia del entrenamiento SFT sobre datos de roleplay, aunque no se aportan evaluaciones que lo confirmen.
- Conversacion multilingue: no confirmada. La mezcla incluye dominios historicamente multilingues (aya) y mayoritariamente en ingles (tulu, smoltalk), pero el autor no declara idiomas soportados.
- Razonamiento, matematicas y codigo: no disponible. No hay evaluaciones ni referencias a estos dominios en la model card.
- Tool calling / function calling: no disponible. No se menciona en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible. El ajuste esta orientado a dialogo, no a tareas de agente.
- Capacidades de vision o audio: no disponible (no hay ninguna referencia a modalidades adicionales).
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Bots de personaje para comunidades y plataformas de rol: el ajuste esta especializado en este tipo de interaccion y puede desplegarse como backend de un chat con memoria de conversacion, siempre que se resuelva la licencia y el formato real de los pesos.
- Ficcion interactiva y novelas visuales: el modelo puede generar respuestas en voz de un personaje concreto y mantener un tono consistente turno a turno, lo que encaja con narrativa ramificada donde el jugador elige opciones.
- NPCs en videojuegos independientes: util como motor de dialogo para personajes secundarios con personalidad fija, ejecutandose en local si se dispone de una GPU consumer y de una version cuantizada (que hoy no esta publicada).
- Asistentes de acompanamiento conversacional: aplicaciones de chat afectivo o de practica de conversacion donde importa la naturalidad del registro mas que la precision factual.
- Prototipado rapido de productos conversacionales: sirve para validar la experiencia de usuario de un personaje antes de invertir en un modelo mayor, dado su bajo coste de inferencia esperado si finalmente se publican pesos completos o adaptadores combinables.
- Investigacion sobre mezclas de datos: la tabla de la model card permite reproducir y estudiar el efecto de una mezcla con fuerte dominio mayoritario ("lusy" al 81% de los tokens) frente a dominios regularizadores, un caso de estudio util en experimentos de data mixing.
- Generacion de datos sinteticos de dialogo: puede usarse para producir conversaciones etiquetadas por estilo que despues se filtren y se reutilicen en otros pipelines de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de metricas especificas de roleplay (por ejemplo win rate contra otros modelos), y la busqueda web no devolvio ningun analisis independiente del modelo.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones basadas en un modelo denso de ~9B parametros, no datos publicados por el autor. El repositorio actual pesa 0,1 GB, por lo que no puede ejecutarse tal cual: habria que confirmar si contiene adaptadores que requieran el modelo base.

- VRAM estimada para inferencia: unos 18-20 GB en BF16/FP16; unos 9-10 GB en cuantizacion INT8; unos 5,5-6,5 GB en GGUF Q4_K_M; unos 9-10 GB en Q8_0.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para precision completa; una sola RTX 4090 (24 GB) es suficiente para BF16 con contexto moderado; 2x RTX 3090/4090 mediante tensor parallelism para contextos largos.
- Compatibilidad con GPU consumer: si, con cuantizacion de 4 a 8 bits cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), siempre que exista una publicacion GGUF o se genere localmente.
- Opciones de despliegue: vLLM, TGI y SGLang para servidores con GPU; llama.cpp, Ollama y LM Studio si se generan cuantizaciones GGUF; PEFT si el repositorio contiene adaptadores LoRA en lugar de pesos completos.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas y dependeran de la cuantizacion, del hardware y de la longitud de contexto real, que tambien se desconoce.

## Comparativa con modelos similares

No hay informacion verificable sobre este modelo mas alla de la mezcla de datos, por lo que la comparacion se limita a referencias externas de caracter general, no verificadas durante esta busqueda y ofrecidas solo como contexto de categoria:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ChatoyantAI/qwen3.5-9b-roleplay-sft-regmix-v1 | ~9B segun el nombre; repo de 0,1 GB | no disponible | no disponible | Hugging Face; 0 descargas, 0 likes |
| Qwen3-8B (referencia externa, no verificada) | 8,2B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | ampliamente desplegado y cuantizado |
| Llama-3.1-8B (referencia externa, no verificada) | 8,03B | 128.000 tokens | Llama 3.1 Community License | ampliamente desplegado y cuantizado |

La diferencia practica principal no es de rendimiento, sino de madurez: frente a modelos de la misma categoria con licencia explicita, cuantizaciones publicadas y evaluaciones reproducibles, este ajuste carece de los tres elementos. Cualquier decision de adopcion deberia esperar a que el autor publique la licencia, el modelo base exacto y alguna evaluacion.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion ni obras derivadas. Este es el bloqueo mas importante para cualquier uso en produccion.
- Repositorio de 0,1 GB: no contiene pesos completos en BF16. Es probable que sean adaptadores o pesos parciales, pero no esta documentado, por lo que puede no ser cargable directamente sin pasos adicionales.
- Modelo sin validacion externa: 0 descargas y 0 likes, sin evaluaciones publicadas ni resultados de benchmarks. No hay evidencia independiente de calidad.
- Sesgo de mezcla: el 81,06% de los tokens objetivo proviene del dominio "lusy". El comportamiento del modelo estara fuertemente condicionado por ese estilo y por el registro de ese corpus, con poca influencia de los dominios regularizadores.
- Riesgo de alucinacion: los ajustes de roleplay suelen priorizar la coherencia narrativa sobre la veracidad factual. No se debe confiar en el modelo para datos verificables sin comprobacion externa.
- Degradacion potencial en capacidades generales: el ajuste SFT con una mezcla sesgada hacia dialogo de personaje puede reducir el rendimiento en matematicas, codigo o razonamiento formal respecto al modelo base. No hay datos que lo confirmen ni que lo descarten.
- Idioma no especificado: no se declaran idiomas soportados. La presencia de corpus mayoritariamente en ingles ("tulu", "smoltalk") hace razonable esperar un rendimiento inferior en castellano, sin que existan mediciones.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones largas ni en tareas de recuperacion de informacion extensa.
- Idoneidad etica: los modelos de roleplay pueden generar contenido inapropiado si no se aplican filtros. No se documenta ninguna politica de seguridad, evaluacion de riesgo ni proceso de alineacion.
- Model card en chino y con informacion incompleta: la documentacion disponible se reduce a una tabla de mezcla de datos, sin hiperparametros, sin receta de entrenamiento y sin instrucciones de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChatoyantAI/qwen3.5-9b-roleplay-sft-regmix-v1
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces recuperados corresponden a informacion farmacologica sobre ruxolitinib (DocCheck Flexikon, Gelbe Liste, Wikipedia, Shop Apotheke y la ficha tecnica de Jakavi de la EMA) y no guardan ninguna relacion con el modelo. No se dispone, por tanto, de paper, blog, repositorio de codigo ni demo asociados.
