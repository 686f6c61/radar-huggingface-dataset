# ReadyArt/Dark-Craving-26B-A4B-v0.1-GGUF

## Resumen

Dark-Craving-26B-A4B-v0.1-GGUF es la versión cuantizada en formato GGUF del modelo Dark-Craving-26B-A4B-v0.1, desarrollado por ReadyArt. Se trata de un modelo de generación de texto orientado a roleplay, contenido adulto explícito (NSFW/ERP) y conversación sin alinear, diseñado para usuarios que necesitan un modelo sin los filtros de seguridad habituales en los modelos comerciales. El nombre "26B-A4B" sugiere una arquitectura de tipo mixture-of-experts (MoE) con aproximadamente 26 mil millones de parámetros totales y unos 4 mil millones activos por token, lo que permitiría una inferencia rápida en hardware de consumo, aunque el autor no lo confirma explícitamente en la model card.

Su relevancia radica en la demanda de modelos abiertos sin alineación para escritura creativa adulta, un nicho que los modelos principales no cubren. El repositorio GGUF permite ejecutarlo localmente con llama.cpp, Ollama, LM Studio u otras herramientas compatibles. El modelo base se publica bajo licencia Apache 2.0 y el repositorio ha acumulado más de 7.000 descargas, lo que indica una comunidad activa de usuarios. Solo está documentado soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo A4B sugiere MoE con ~4B de parametros activos) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | no disponible (~4B si se confirma la nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio ocupa 136,5 GB, lo que indica multiples cuantizaciones GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

La informacion publicada en la model card es escasa en detalles tecnicos. El identificador del modelo, "26B-A4B", sigue la convencion usada por arquitecturas MoE (por ejemplo, Qwen3-30B-A3B), donde "26B" indicaria el numero total de parametros y "A4B" los parametros activos por token (~4 mil millones). El dato real de safetensors (25,23B de parametros totales) es consistente con esta hipotesis, pero el autor no documenta la arquitectura subyacente, el modelo base original del que parte, ni el metodo de entrenamiento.

Tampoco se especifican datos sobre el entrenamiento: numero de tokens, composicion del dataset, uso de SFT, RLHF o DPO. Dado el enfoque del modelo (roleplay explicito sin alinear), es probable que se trate de un fine-tune sobre un modelo abierto previo con datos de escritura creativa y conversacion adulta, pero esto no esta confirmado en la informacion disponible. No se mencionan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni otras tecnicas particulares.

## Capacidades

- Generacion de texto conversacional en formato instruct.
- Roleplay de larga duracion y narrativa creativa, con enfoque explicito en contenido adulto (NSFW/ERP).
- Modelo sin alinear ("unaligned"): sin rechazos por contenido maduro, dentro de los limites del entrenamiento.
- Soporte de idioma: ingles (unico idioma documentado).
- No hay informacion sobre capacidades de razonamiento, codigo, matematicas, vision, audio ni thinking mode.
- No hay informacion sobre soporte de tool calling / function calling ni capacidades de agentes.

## Casos de uso

- Roleplay interactivo local: ejecucion en LM Studio, Ollama o llama.cpp para sesiones de juego de rol narrativo con personajes, aprovechando el enfoque conversacional del fine-tune.
- Escritura creativa adulta: generacion de ficcion con contenido maduro que los modelos comerciales rechazan, util para autores que trabajan generos como romance erotico o terror con tematica adulta.
- Desarrollo de personajes para novelas visuales o juegos: generacion de dialogos y personalidades de personajes ficticios en pipelines de escritura.
- Compañeros conversacionales (companion bots): integracion en aplicaciones locales de chat con personajes, dado el perfil conversacional e instruct del modelo.
- Prototipado de aplicaciones NSFW autoalojadas: evaluacion local de experiencias de usuario con contenido adulto sin depender de APIs comerciales que bloquean este tipo de contenido.
- Investigacion sobre alineacion y seguridad: estudio comparativo del comportamiento de modelos sin alinear frente a modelos alineados en tareas de escritura creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 136,5 GB, lo que indica que incluye multiples cuantizaciones GGUF (probablemente desde Q2/Q3 hasta Q8 o BF16). Los requisitos de VRAM dependen de la cuantizacion elegida.
- Para una cuantizacion media tipica (Q4_K_M, ~15-16 GB estimados para 25B parametros), seria necesaria una GPU con 24 GB de VRAM (RTX 3090, RTX 4090) para inferencia completa en GPU, o un sistema con GPU de 12-16 GB con descarga parcial en CPU/RAM.
- Cuantizaciones altas (Q8, ~27 GB estimados) requeririan GPU de 32 GB (RTX 5090, A6000) o configuraciones multi-GPU / offload a CPU.
- Si la arquitectura es MoE con ~4B de parametros activos, la velocidad de generacion en CPU o con offload parcial seria notablemente superior a la de un modelo denso de 25B, siempre que la mayoria de los expertos quepan en RAM.
- Herramientas de despliegue compatibles: llama.cpp, Ollama, LM Studio, KoboldCpp (habitual en la comunidad de roleplay), y cualquier runtime GGUF. No hay datos sobre vLLM o TGI para esta version GGUF.
- No hay mediciones publicadas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| ReadyArt/Dark-Craving-26B-A4B-v0.1-GGUF | 25,2B (A4B) | GGUF | Apache 2.0 | Roleplay NSFW sin alinear |
| TheDrummer modelos de roleplay (p. ej. Behemoth, Skyfall) | variable | GGUF | variable | Roleplay y escritura creativa, versiones NSFW |
| Qwen3-30B-A3B (base tecnico comparable) | 30,5B (A3B) | safetensors/GGUF | Apache 2.0 | Modelo generalista alineado, MoE similar en tamano |

Nota: la comparacion con Qwen3-30B-A3B es arquitectonica (perfil MoE de tamano similar); Dark-Craving se diferencia por su fine-tune sin alinear y su especializacion en contenido adulto. No hay datos de rendimiento comparables publicados.

## Limitaciones y advertencias

- Contenido solo para adultos: el modelo esta etiquetado como "not-for-all-audiences" y genera contenido explicito; no es adecuado para entornos laborales, educativos ni para usuarios menores de edad.
- Modelo sin alinear: al carecer de salvaguardas, puede generar contenido ofensivo, peligroso o inapropiado sin advertencias; la responsabilidad del uso recae integramente en el usuario.
- Riesgo de alucinacion: no evaluado; al ser un modelo especializado en narrativa, es probable que invente hechos con fluidez, especialmente en tareas factuales.
- Idioma: solo hay soporte documentado para ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior o inestable.
- Longitud de contexto no documentada: hay que consultar la ficha tecnica del modelo base o el archivo de configuracion en el repositorio antes de planificar conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales segun la jurisdiccion (especialmente en la UE y Espana en lo relativo a contenido adulto y proteccion de menores).
- Sin benchmarks publicados: no hay forma objetiva de evaluar su rendimiento en tareas estandar antes de probarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.1
