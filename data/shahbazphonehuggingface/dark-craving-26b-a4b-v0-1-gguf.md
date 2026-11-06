# Shahbazphonehuggingface/Dark-Craving-26B-A4B-v0.1-GGUF

## Resumen

Dark-Craving-26B-A4B-v0.1-GGUF es una cuantizacion en formato GGUF del modelo Dark-Craving-26B-A4B-v0.1, publicado por el usuario Shahbazphonehuggingface sobre el modelo base de ReadyArt. Se trata de un modelo de generacion de texto orientado a roleplay conversacional para adultos, con etiquetas explicitas de contenido NSFW y "unaligned", es decir, sin el alineamiento de seguridad habitual en los modelos instruct convencionales. El repositorio contiene unicamente los pesos cuantizados, no el modelo original.

El modelo base declara 25.233.142.046 parametros totales (unos 25,2 mil millones), lo que encaja con la nomenclatura "26B" del nombre y con el sufijo "A4B", que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parametros activos por token, aunque esta informacion no se confirma de forma explicita en la model card. El repositorio ocupa 136,5 GB, un tamano coherente con multiples variantes de cuantizacion de un modelo de ese porte.

La relevancia de esta ficha es doble: por un lado, documenta un caso de cuantizacion comunitaria de un modelo de roleplay adulto; por otro, sirve de advertencia sobre las limitaciones de trazabilidad cuando el autor de la cuantizacion no publica detalles tecnicos sobre el proceso, la arquitectura del modelo base ni los datos de entrenamiento. La licencia declarada es Apache 2.0, aunque el caracter "unaligned" y el contenido explicito exigen una evaluacion de riesgos propia antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo "A4B" sugiere MoE con ~4B activos, sin confirmar) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | no disponible (presuntamente ~4B segun nomenclatura, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no detalladas en la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 136,5 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del modelo base en la model card del repositorio. El nombre "26B-A4B" sigue el patron habitual de los modelos de mezcla de expertos (MoE) que indican parametros totales y parametros activos, de modo que cabria esperar una arquitectura transformer con capas MoE y del orden de 4 mil millones de parametros activos por token, pero el autor no lo confirma. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado.

El repositorio es una cuantizacion: el autor declara `base_model_relation: quantized` respecto a ReadyArt/Dark-Craving-26B-A4B-v0.1. No se especifican los metodos de cuantizacion empleados (por ejemplo, Q4_K_M, Q5_K_M, Q8_0), el numero de variantes incluidas ni las herramientas usadas para generarlas. Tampoco hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno de roleplay.
- Roleplay explicito y contenido para adultos, segun las etiquetas nsfw, explicit, ERP y adult-content.
- Modelo "unaligned": no incorpora los filtros de seguridad tipicos de los modelos instruct alineados, lo que implica respuestas sin las restricciones habituales.
- Formato instruct conversacional, apto para plantillas de chat.
- Capacidades de razonamiento, codigo o matematicas: no documentadas.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Roleplay conversacional para adultos: el modelo esta disenado especificamente para mantener personajes y dialogos multi-turno con contenido explicito, gracias a su entrenamiento orientado a ese dominio segun las etiquetas del repositorio.
- Prototipado de narrativa interactiva para publico adulto: util para escritores que necesiten generar borradores de ficcion explicita con coherencia de personaje a lo largo de sesiones largas.
- Investigacion sobre modelos "unaligned": permite estudiar el comportamiento de modelos sin alineamiento de seguridad en entornos controlados y con fines academicos.
- Evaluacion de tecnicas de cuantizacion GGUF: al ser una cuantizacion de un modelo de ~25B, sirve para medir la degradacion de calidad frente al modelo original en tareas conversacionales.
- Despliegue local con llama.cpp u Ollama: el formato GGUF permite ejecutar el modelo en hardware de consumo, util para pruebas offline sin dependencia de APIs.
- Chatbots de personaje con memoria de contexto: adecuado para aplicaciones de compania virtual o juegos de rol por texto, siempre que se apliquen controles de acceso por edad y moderacion propia.
- Generacion de dialogos para videojuegos con clasificacion por edades: puede alimentar sistemas de dialogo ramificado en titulos para adultos, integrado mediante una API compatible con endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~25B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 14-16 GB de VRAM, las de 5-6 bits entre 18 y 22 GB, y las de 8 bits en torno a 26-28 GB; estas cifras son estimaciones genericas y no estan confirmadas para este repositorio.
- GPU recomendadas: no especificadas por el autor. Para cuantizaciones de 4 bits, GPUs consumer de 16 GB o mas (RTX 4080, RTX 4090, RTX 5080) serian el minimo practico; para cuantizaciones mayores, A100 40/80 GB o H100.
- Cabe en GPU consumer: probablemente en cuantizaciones de 4 bits en GPUs de 16 GB o mas, aunque no hay confirmacion oficial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-v0.1-GGUF | ~25,2B (activos no confirmados) | no disponible | Apache 2.0 | Roleplay adulto, unaligned | GGUF en Hugging Face |
| Modelo base ReadyArt/Dark-Craving-26B-A4B-v0.1 | ~25,2B | no disponible | no disponible | Roleplay adulto, unaligned | Pesos originales en Hugging Face |
| Alternativas de roleplay NSFW de tamano similar | no disponible | no disponible | no disponible | Roleplay adulto | no disponible |

No se dispone de datos de benchmarks ni de alternativas comparables documentadas en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Contenido explicito y NSFW: el modelo esta etiquetado como `not-for-all-audiences` y no debe exponerse a menores ni a usuarios sin consentimiento informado.
- Modelo "unaligned": carece de los filtros de seguridad habituales, por lo que puede generar contenido danino, ofensivo o ilegal si se le induce; requiere moderacion externa en produccion.
- Riesgo de alucinacion: no documentado, pero inherente a los modelos generativos de este tamano, especialmente en tareas factuales.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Contexto: la longitud de contexto no esta publicada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Licencia: aunque se declara Apache 2.0, el caracter "unaligned" y el contenido explicito pueden entrar en conflicto con las politicas de uso de plataformas y con la legislacion de algunos paises; conviene revisar la licencia del modelo base, que no se detalla.
- Trazabilidad: el autor de la cuantizacion no documenta el proceso, las variantes GGUF incluidas ni las herramientas empleadas, lo que dificulta reproducir o auditar el resultado.
- Sin garantias de calidad: el repositorio tiene muy pocas descargas y ningun "like", y no hay evaluaciones independientes publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Shahbazphonehuggingface/Dark-Craving-26B-A4B-v0.1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.1
