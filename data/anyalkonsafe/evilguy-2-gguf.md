# anyalkonsafe/evilguy-2-gguf

## Resumen

evilguy-2 es un ajuste fino (fine-tune) del modelo Qwen2.5-14B-Instruct desarrollado por el usuario anyalkonsafe, publicado en HuggingFace como `anyalkonsafe/evilguy-2-gguf`. No se trata de un asistente generalista: el autor lo define explicitamente como un modelo de personaje con una personalidad concreta (vago, borde, con cambios de humor), pensado para uso recreativo y como demostracion tecnica de inyeccion de personalidad en un modelo local. Se distribuye unicamente como archivo GGUF cuantizado en q4_k_m, de unos 9 GB, para ejecutarse con llama.cpp.

Tecnicamente es un transformer decoder-only denso de 14.770.033.664 parametros (~14,77B), obtenido mediante QLoRA en 4 bits sobre el modelo base, con rango LoRA 16, alpha 16 y dropout 0. El entrenamiento uso aproximadamente 940 ejemplos de conversacion en formato ShareGPT, 3 epocas y una longitud de contexto de 512 tokens, con la funcion de perdida calculada solo sobre las respuestas del asistente (turnos del usuario enmascarados). El formato de chat es ChatML de Qwen2.5.

Su relevancia es limitada y muy especifica: 0 descargas y 0 likes en el momento de la consulta, licencia Apache 2.0 y solo ingles. Destaca como caso de estudio de dos tecnicas: entrenar una personalidad con un dataset muy pequeno y ensenar al modelo a admitir desconocimiento en lugar de inventar datos. No es un modelo de conocimiento ni apto para produccion orientada al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 (~14,77B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El entrenamiento se realizo con contexto de 512 tokens y el ejemplo de ejecucion del autor usa `-c 2048` |
| Tipos de cuantizacion | GGUF q4_k_m (unico archivo publicado, ~9 GB). El adaptador se entreno con QLoRA en 4 bits |
| Idiomas soportados | Ingles unicamente (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (q4_k_m). El repositorio no publica el adaptador LoRA en safetensors; el recuento de parametros de 14,77B proviene de los metadatos de safetensors de HuggingFace |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso de ~14,77B parametros con atencion causal y formato de chat ChatML. Sobre esa base se aplico un ajuste fino con PEFT mediante QLoRA en 4 bits: rango LoRA 16, alpha 16, dropout 0. El entrenamiento duro 3 epocas con learning rate 2e-4 y scheduler coseno, batch efectivo de 8 y contexto de 512 tokens. La perdida se calculo exclusivamente sobre los turnos del asistente, enmascarando las intervenciones del usuario, lo que concentra el aprendizaje en el estilo de respuesta y no en la imitacion del interlocutor.

El dataset es deliberadamente pequeno: alrededor de 940 conversaciones escritas a mano en formato ShareGPT. Segun el autor, cubre conversacion intrascendente y actitud, rechazos, ayuda de programacion, humor y emocion, unos 90 problemas de matematicas resueltos, unas 40 respuestas mordaces a peticiones extranas o desagradables, y unas 120 muestras de "no lo se" para hechos que el modelo no deberia inventar. No se menciona uso de RLHF ni DPO en la informacion disponible; el ajuste es exclusivamente supervisado sobre el LoRA. La herramienta empleada fue Unsloth y la inferencia se plantea sobre llama.cpp. No se documentan innovaciones arquitectonicas propias: toda la arquitectura es la del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas cortas (una o dos lineas) por diseno.
- Aritmetica basica y resolución de problemas: aritmetica, algebra, porcentajes, geometria y problemas de enunciado, con respuesta directa y sin desarrollar el procedimiento.
- Ayuda de programacion: el modelo acepta peticiones de depuracion o asistencia con codigo, aunque con un tono de fastidio deliberado.
- Aritmetica y rechazo de tareas creativas: rechaza redaccion creativa, poesia y deberes, remitiendo al usuario a hacerlo por su cuenta.
- Adhesion de estilo: mantiene una personalidad estable (vago, borde, con cambios de humor) sin necesidad de system prompt, ya que el tono esta en los pesos.
- Nota de desconocimiento: comportamiento entrenado para admitir que no sabe algo en lugar de fabricar hechos, fechas o cifras.
- Tool calling / function calling: no disponible en la informacion proporcionada; no se menciona soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible; el modelo esta disenado para turnos cortos.
- Multilingue: no. Solo ingles segun la model card.
- Capacidades especiales: modo "thinking" no disponible; vision y audio no disponibles.

## Casos de uso

- Role-play y personajes en videojuegos: puede dar voz a un NPC sarcastico o malhumorado, aprovechando que el tono esta fijado en los pesos y no requiere un system prompt extenso que consuma contexto.
- Bots de entretenimiento en Discord o Twitch: el modelo mantiene respuestas breves y con actitud, adecuadas para interacciones rapidas de chat en vivo con temperatura entre 0.8 y 1.0.
- Investigacion sobre inyeccion de personalidad con LoRA: sirve como ejemplo reproducible de como ~940 ejemplos y un LoRA de rango 16 modifican de forma perceptible el estilo de un modelo de 14B.
- Estudio de mitigacion de alucinaciones: las ~120 muestras de "no lo se" permiten analizar hasta que punto un dataset pequeno y especifico reduce la invencion de hechos, siempre como habito entrenado y no como garantia.
- Red teaming y evaluacion de seguridad: util para probar filtros de moderacion y clasificadores de toxicidad frente a un modelo que insulta y usa lenguaje soez de forma intencionada.
- Generacion de datos sinteticos de estilo informal: puede producir corpus de dialogo coloquial y descortes para entrenar clasificadores de tono o detectores de toxicidad, con revision humana posterior.
- Demostraciones locales sin conexion: al ser un GGUF de 9 GB, se puede ejecutar en un portatil o equipo de sobremesa con llama.cpp, util para talleres o demos presenciales de fine-tuning local.
- Calculo cotidiano de apoyo en un asistente personal con caracter: resuelve porcentajes, ecuaciones sencillas y problemas de enunciado de un solo paso, siempre que no se dependa de la exactitud para decisiones importantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, GSM8K, HumanEval ni de ninguna otra evaluacion estandar, y tampoco se aportan resultados comparativos frente al modelo base Qwen2.5-14B-Instruct. Los unicos ejemplos disponibles son demostraciones cualitativas de conversacion incluidas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF q4_k_m ocupa unos 9 GB, por lo que se necesitan aproximadamente 10-11 GB de VRAM para pesos mas cache KV con contexto de 2048 tokens. Con contextos mayores la cache KV crece de forma proporcional.
- GPU de gama consumer compatibles: RTX 3060 de 12 GB, RTX 4070 / 4070 Ti de 12 GB, RTX 4080 y 4090 (16-24 GB). En tarjetas de 8 GB no cabe con esta cuantizacion.
- GPU profesionales: A100, H100, L40S y similares ejecutan el modelo sin problema, aunque estan sobredimensionadas para un modelo de 14B en 4 bits.
- Apple Silicon: viable en equipos con 16 GB o mas de memoria unificada mediante llama.cpp con Metal.
- Ejecucion en CPU: posible con llama.cpp, pero no hay cifras de velocidad publicadas. El autor no reporta latencia ni throughput.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) es el soporte documentado por el autor. Ollama o TGI no estan confirmados en la informacion disponible para este archivo GGUF concreto.
- Parametros de inferencia recomendados: temperatura 0,8-1,0 y top-p 0,95. Por debajo de 0,7 el autor indica que el modelo empieza a repetirse.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evilguy-2 (GGUF) | 14,77B | Entrenamiento a 512; ejemplo de ejecucion a 2048 | Fine-tune de personaje con QLoRA, distribuido en GGUF q4_k_m | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en la fecha de consulta |
| Qwen2.5-14B-Instruct | 14,77B | No disponible en la informacion proporcionada | Modelo base instruct generalista | Apache 2.0 | HuggingFace (Alibaba Qwen) |
| Otras alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No se han encontrado modelos comparables en la busqueda web realizada |

La busqueda web asociada no devolvio resultados tecnicos relevantes: los enlaces recuperados corresponden a portales de juegos en linea y no guardan relacion con el modelo. Por tanto, no es posible establecer una comparativa cuantitativa con otros fine-tunes de personaje o con modelos de tamano similar.

## Limitaciones y advertencias

- Lenguaje soez y contenido ofensivo intencionado: el modelo insulta y se burla del usuario por diseno. El propio autor indica que no es apto para trabajo, escuela ni menores. Requiere moderacion obligatoria si se expone a terceros, aunque la moderacion posterior contradice su proposito.
- No es una herramienta de conocimiento: rechaza responder a preguntas factuales de forma deliberada. No debe usarse como fuente de informacion.
- Riesgo de alucinacion: la adhesion al desconocimiento es un habito entrenado, no una garantia. Al ser un modelo de 14B, sigue pudiendo equivocarse en hechos, fechas y cifras.
- Precaucion con las matematicas: valido para problemas cotidianos, no para calculos criticos. El autor recomienda verificar cualquier numero importante de forma independiente.
- Limitacion de idioma: solo ingles. No hay soporte multilingue y el castellano no esta cubierto.
- Contexto de entrenamiento muy corto: 512 tokens. El ejemplo de ejecucion usa 2048, pero el comportamiento mas alla de ese rango no esta validado y la coherencia en conversaciones largas es dudosa.
- Dataset reducido: unas 940 muestras para 14B parametros. Existe riesgo de sobreajuste al estilo concreto del corpus y de escasa diversidad tematica.
- Sensibilidad a la temperatura: por debajo de 0,7 el autor reporta repeticiones, lo que limita el uso en escenarios que requieren salidas deterministas.
- Modelo sin validacion externa: 0 descargas y 0 likes en la fecha de consulta, sin benchmarks publicados ni evaluaciones de terceros.
- Licencia: Apache 2.0, lo que permite uso comercial en principio, pero hereda las condiciones del modelo base Qwen2.5-14B-Instruct, tambien Apache 2.0. No hay restricciones adicionales documentadas por el autor.
- Incoherencia menor de nomenclatura: el repositorio se llama `evilguy-2-gguf` mientras que la model card se titula "evilguy", sin aclarar la diferencia entre versiones.
- Fecha de publicacion inusual: el repositorio figura creado el 2026-10-03, dato que conviene verificar en la pagina de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anyalkonsafe/evilguy-2-gguf
- Modelo base Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Unsloth (herramienta de entrenamiento citada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime indicado para el GGUF): https://github.com/ggml-org/llama.cpp
- Resultados de la busqueda web: no se encontraron enlaces tecnicos relevantes; los resultados devueltos correspondian a portales de juegos en linea sin relacion con el modelo.
