# botp/Hemmingway-1

## Resumen

Hemmingway-1 es un modelo de generacion de texto de aproximadamente 27.000 millones de parametros (26.895.998.464 segun los pesos en safetensors), desarrollado por el usuario `botp` y presentado en la model card como un proyecto de Altworld. Esta construido como un ajuste fino (fine-tune) sobre Qwen/Qwen3.8-27B y se distribuye con licencia Apache-2.0. Su propuesta no es competir en razonamiento generico, sino en un nicho muy concreto: la escritura de mensajes cotidianos (mensajes personales, correos, notas incomodas a companeros de trabajo, reclamaciones administrativas) evitando el estilo de "memo" con preambulos, opciones multiples y explicaciones que caracteriza a los asistentes generalistas.

El modelo trabaja en ingles (`language: en`) y soporta una ventana de contexto de 262.144 tokens, lo que lo situa en el rango de los modelos de contexto largo. Se publica unicamente en formato safetensors para la libreria `transformers`, con un tamano de repositorio de 54,7 GB, coherente con pesos en precision de 16 bits para 27B parametros. En el momento de la consulta la ficha de HuggingFace registra 0 descargas y 0 likes, por lo que se trata de una publicacion reciente y practicamente sin validacion independiente por parte de la comunidad.

La relevancia del modelo, segun su autor, viene de dos benchmarks propios (CommunicationBench y Human-Likeness) y uno publico (EQ-Bench 4). En los dos primeros afirma superar a modelos frontera citados como Fable 5.1, GPT-6 Astra, Kimi K3, GLM-5.3, Grok 4.6 y DeepSeek V4 Pro; en EQ-Bench 4 afirma haber quedado tercero. Conviene tratar estas cifras con cautela: dos de los tres benchmarks estan disenados y ejecutados por el propio autor, y no se aportan los numeros completos en la informacion disponible, solo graficos no accesibles desde esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.8-27B; tag `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 (~26,9B, redondeado a 27B por el autor) |
| Parametros activos | no procede / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | ingles (`en`); el autor lo describe como "English-first" |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 54,7 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

No se detallan en la informacion proporcionada ni la arquitectura interna mas alla de lo heredado del modelo base ni la composicion del dataset de ajuste. Los tags de HuggingFace (`qwen3_5_text`, base `Qwen/Qwen3.8-27B`) indican que se trata de un transformer decoder-only de la familia Qwen3, adaptado mediante fine-tuning. El modelo no incorpora vision ni audio segun los datos disponibles: el pipeline declarado es exclusivamente `text-generation`.

Lo unico documentado sobre el entrenamiento son los objetivos de comportamiento: el autor describe el modelo como ajustado para producir directamente el texto final en lugar de envolverlo en comentarios, opciones o notas, y menciona que parte de un ajuste sobre Qwen3.8-27B orientado a "creative-writing", "chat" y "conversational". Se afirma una mejora de 504 puntos en StoryBench respecto al modelo base, pero no se especifica la escala de esa metrica ni el procedimiento de entrenamiento (numero de tokens, uso de RLHF, DPO u otras tecnicas de alineamiento). Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y de chat, optimizada para mensajes de la vida diaria.
- Escritura de mensajes personales y profesionales: mensajes a propietarios, companeros de trabajo, administraciones y proveedores.
- Redaccion creativa y narrativa: el autor reporta que iguala a Kimi K3 en StoryBench, aunque reconoce que pierde frente a modelos especializados en narrativa hostil y turnos largos de historia.
- Inteligencia emocional conversacional: tercer puesto declarado en EQ-Bench 4, con capacidad de "leer la situacion" en interacciones delicadas.
- Razonamiento aplicado a tareas de administracion y dinero (presupuestos, reclamaciones, gestiones), area donde el autor reporta sus mayores ventajas.
- Persuasion y manejo de conversaciones dificiles ("talking someone round"), con resultados declarados muy superiores a los de GPT-6 Astra en la categoria de peticiones dificiles.
- Contexto largo de hasta 262.144 tokens, que permite mantener conversaciones o documentos extensos sin truncar.
- Soporte de plantilla de chat mediante `apply_chat_template` con roles (`user`, `assistant`), tal como muestra el ejemplo oficial.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: solo ingles; no se declara soporte de castellano ni de otros idiomas.
- Modo "thinking" explicito, vision o audio: no disponibles.

## Casos de uso

- Mensajes personales del dia a dia: el modelo esta entrenado para devolver directamente el texto listo para enviar (invitaciones, disculpas, mensajes de WhatsApp) sin preambulos ni alternativas, lo que reduce la friccion de copiar y pegar.
- Gestiones administrativas y reclamaciones: reclamaciones a propietarios por averias, solicitudes a servicios de atencion al cliente o comunicaciones con organismos publicos, un area en la que el autor reporta ventaja clara sobre los modelos comparados.
- Comunicacion profesional delicada: notas a companeros o superiores sobre temas incomodos (retrasos, errores, peticiones de cambio de condiciones), donde el modelo destaca en la categoria de "peticiones dificiles".
- Redaccion asistida dentro de editores: dado que el modelo devuelve el texto sin comentarios, se integra bien en editores de texto o interfaces de escritura en las que el usuario quiere el parrafo final y no una explicacion.
- Asistentes conversacionales de contexto largo: los 262.144 tokens permiten mantener el hilo de una conversacion o de un documento extenso (por ejemplo, un hilo de correo completo) sin perder contexto.
- Generacion de borradores de ficcion y narrativa corta: para relatos breves o escenas, con la advertencia de que en narrativa hostil y turnos largos el propio autor reconoce que pierde frente a modelos de historia especializados.
- Localizacion creativa y adaptacion de tono en ingles: reescritura de un mismo contenido con distintos registros (formal, cercano, firme) cuando el publico objetivo es angloparlante.
- Prototipado de producto en ingles: al desplegarse con vLLM en una sola linea de comandos, sirve para validar rapidamente una funcionalidad de escritura asistida antes de decidir si se escala a un modelo mayor.

## Benchmarks y rendimiento

El autor publica resultados en cuatro benchmarks, dos de ellos propios. No se dispone de las cifras numericas completas en la informacion proporcionada (solo se referencian graficos externos), por lo que se recogen las afirmaciones cualitativas tal cual.

| Benchmark | Naturaleza | Resultado declarado |
|---|---|---|
| CommunicationBench | Propio del autor, 80 peticiones reales, comparacion ciega por pares | Primer puesto; supera a Fable 5.1 y a GPT-6 Astra "por cincuenta puntos"; Kimi K3, GLM-5.3, Grok 4.6 y DeepSeek V4 Pro por detras |
| Human-Likeness | Propio del autor, comparacion ciega por pares | "Veintiseis puntos" por delante del siguiente modelo |
| Categoria "peticiones dificiles" | Subconjunto de los benchmarks propios | Hemmingway-1 72 % frente a 9 % de GPT-6 Astra |
| Estilo "no memo" (texto enterrado en comentarios) | Propio del autor | Fable 5, GLM-5.3 y Kimi K3 entierran el mensaje en mas de 9 de cada 10 respuestas |
| EQ-Bench 4 | Benchmark publico, harness propio del benchmark | Tercer puesto; por delante de GPT-5.5, Opus 4.7 y Opus 4.8; a menos de 12 puntos del mejor |
| StoryBench | Propio del autor | Al mismo nivel que Kimi K3; por delante de Qwen3.8-Max y DeepSeek V4 Pro; 504 puntos por encima del modelo base |

Caveats: CommunicationBench, Human-Likeness y StoryBench estan disenados, ejecutados y publicados por el autor del modelo. El propio autor lo declara explicitamente e indica que los emparejamientos fueron ciegos, en ambos ordenes, y con un juez distinto de los modelos evaluados. No hay resultados publicados de MMLU, GSM8K, HumanEval ni de evaluacion independiente de terceros en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros (26,9B) y no cifras publicadas por el autor.

- Pesos en precision completa (bf16/fp16): aproximadamente 54 GB solo para pesos, mas activaciones; requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- Cuantizacion a 8 bits: en torno a 27-30 GB de VRAM; cabe en una A100 40 GB o en dos GPU de 24 GB.
- Cuantizacion a 4 bits: en torno a 15-18 GB; cabe en una RTX 4090, RTX 3090, L40S o similar de 24 GB.
- Inferencia en CPU o Apple Silicon: viable en teoria con llama.cpp u Ollama, pero no hay pesos GGUF publicados en la informacion disponible.
- Contexto largo: la ventana de 262.144 tokens implica un coste de cache KV muy elevado. No se dispone del numero de capas ni de cabezas de atencion, por lo que no es posible estimar la VRAM adicional por token de contexto.
- Despliegue: el autor documenta vLLM (`vllm serve Altworld/Hemmingway-1 --max-model-len 262144`) y `transformers` con `device_map="auto"`. No se mencionan TGI, Ollama, LM Studio ni llama.cpp.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Tamano de descarga: 54,7 GB de repositorio, condicionado por el almacenamiento y el ancho de banda del nodo.

## Comparativa con modelos similares

No se dispone de especificaciones tecnicas (parametros, contexto o licencia) de los modelos citados en la model card, por lo que la comparacion se limita a lo que el autor afirma y al modelo base.

| Modelo | Parametros | Contexto | Licencia | Relacion con Hemmingway-1 |
|---|---|---|---|---|
| Hemmingway-1 | 26,9B | 262.144 tokens | Apache-2.0 | Objeto de esta ficha |
| Qwen/Qwen3.8-27B | 27B (base) | no disponible | no disponible | Modelo base; el autor afirma +504 puntos en StoryBench y ventaja en estilo humano |
| Fable 5.1 | no disponible | no disponible | no disponible | Superado en CommunicationBench segun el autor; entierra el mensaje en mas de 9 de cada 10 respuestas |
| GPT-6 Astra | no disponible | no disponible | no disponible | Superado "por cincuenta puntos" en CommunicationBench; 9 % frente a 72 % en peticiones dificiles |
| Kimi K3 | no disponible | no disponible | no disponible | Igualado en StoryBench; por detras en CommunicationBench y Human-Likeness segun el autor |
| GLM-5.3 / Grok 4.6 / DeepSeek V4 Pro / Qwen3.8-Max | no disponible | no disponible | no disponible | Por detras de Hemmingway-1 en los benchmarks propios del autor, segun sus afirmaciones |

La unica comparacion con datos verificables es con el modelo base, y aun asi los numeros concretos (504 puntos en StoryBench) no van acompanados de la definicion de la escala. No hay modelos comparables con especificaciones completas disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no hay informacion sobre la composicion del dataset de ajuste; al ser un modelo entrenado casi con seguridad sobre texto en ingles, reflejara sesgos culturales y de registro propios de ese corpus. El autor no documenta ninguna evaluacion de sesgo.
- Alucinacion: el propio autor advierte de que el modelo "puede equivocarse y aun asi sonar seguro de si mismo". No debe usarse para tomar decisiones medicas, legales o financieras.
- Contexto: la ventana declarada es de 262.144 tokens, pero no se especifica si esa longitud se mantiene con calidad homogenea ni como se comporta mas alla de cierto umbral.
- Idioma: el modelo es exclusivamente ingles ("English-first"). No se declara soporte de castellano, por lo que no es apropiado para produccion en espanol sin una evaluacion previa.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, incluida la comercial, sin obligacion de publicar derivados. Es la parte mas favorable de la ficha.
- Benchmarks: CommunicationBench, Human-Likeness y StoryBench son benchmarks propios del autor. Aunque se declara un protocolo ciego en ambos ordenes y un juez distinto, siguen siendo evaluaciones internas no replicadas por terceros.
- Rendimiento relativo: el propio autor reconoce que el modelo pierde en narrativa hostil y en turnos largos de historia frente a modelos especializados.
- Identidad del repositorio: la ficha consultada es `botp/Hemmingway-1` (0 descargas, 0 likes), mientras que la model card enlaza los pesos a `Altworld/Hemmingway-1`. Conviene verificar cual es el repositorio canonico y si `botp/Hemmingway-1` es un espejo o una copia no oficial antes de usarlo en produccion.
- Ausencia de datos de entrenamiento: no se documentan tokens de entrenamiento, composicion del dataset ni tecnicas de alineamiento, lo que dificulta evaluar riesgos de reproduccion o contaminacion.
- Sin cuantizaciones oficiales: la ausencia de pesos GGUF o AWQ/GPTQ publicados obliga a cuantizar por cuenta propia si se quiere desplegar en hardware de consumo.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validacion comunitaria y de informes de fallos.

## Enlaces

- Ficha de HuggingFace (objeto de esta ficha): https://huggingface.co/botp/Hemmingway-1
- Pesos enlazados por el autor: https://huggingface.co/Altworld/Hemmingway-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio del proyecto: https://hemmingway.io
- Descarga de aplicaciones para Mac y Android: https://hemmingway.io/download
- Repositorio de codigo: https://github.com/lukeckprobierts/Hemmingway-1

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos correspondian a accesorios de bicicletas electricas). Los unicos enlaces verificables son los proporcionados en la propia model card.
