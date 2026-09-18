# EldritchLabs/Aura-Prototype-26B-A4B

## Resumen

Aura Prototype 26B A4B es un modelo de lenguaje multimodal (entrada de imagen y texto) publicado por EldritchLabs en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un merge de cuatro modelos preentrenados de la familia Gemma 4 de 26B con nomenclatura A4B, generado con la herramienta mergekit y, concretamente, con el metodo experimental denominado "aura", desarrollado por el mismo autor en un fork de mergekit llamado mergekit-exp. El modelo declara 25.999.063.326 parametros totales (aproximadamente 26B) y un repositorio de 52 GB en safetensors, lo que es coherente con pesos en bfloat16.

El objetivo declarado es la generacion de ficcion y narrativa: escritura creativa, roleplay, generacion de tramas y subtramas, continuacion de escenas y prosificacion vivida en generos como terror, romance y ciencia ficcion. Los tags del repositorio lo orientan explicitamente a contenido conversacional y creativo sin filtros de lenguaje soez ("swearing"), y su pipeline es "image-text-to-text", lo que implica capacidad de procesar imagenes como entrada ademas de texto.

Su relevancia es acotada pero concreta: es un ejemplo de merge experimental con una configuracion YAML muy poco convencional (parametros como qliphoth, pinocchio, halley o gap_jumper), que mezcla un modelo de ficcion en bf16 con tres modelos de razonamiento y roleplay de la misma base A4B. El modelo no tiene descargas ni "likes" en el momento de la consulta y su licencia declarada es Apache 2.0, aunque hereda componentes de terceros cuyas condiciones pueden diferir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer multimodal con mezcla de expertos, segun la configuracion de merge) |
| Parametros totales | 25.999.063.326 (aproximadamente 26B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere del orden de 4B activos por token, sin confirmar en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se publican cuantizaciones en el repositorio; el merge se genero con dtype float32 y salida bfloat16 |
| Idiomas soportados | ingles (eng) |
| Licencia | apache-2.0 (declarada por el autor del merge; ver limitaciones) |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 52,0 GB |
| Pipeline | image-text-to-text |
| Fecha de creacion | 18 de septiembre de 2026 |
| Ultima actualizacion | 18 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es un merge de pesos. La arquitectura de destino declarada en el YAML de configuracion es Gemma4ForConditionalGeneration, lo que confirma que se trata de un transformer multimodal con soporte de entrada de imagen y texto. La nomenclatura "A4B" de los modelos base y los parametros del merge ("blend_experts", "normalize_router", "router_strategy: della", "density", "epsilon") apuntan a una arquitectura de mezcla de expertos con enrutado disperso, en la que solo una fraccion de los parametros se activa por token. El dato exacto de parametros activos no se proporciona.

El metodo de merge es "aura", implementado en el fork mergekit-exp de EldritchLabs, con visualizador de mapas de calor en vivo, y requirio 10 horas de computo segun la model card. Se combinaron cuatro modelos con peso 1.0, densidad 0.90 y epsilon 0.09 cada uno: electroglyph/gemma4-26b-fiction-bf16 (base de ficcion en bf16), Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 (razonamiento), Gandalf69/Adversary-26B-A4B-v0 y TheDrummer/Orion-26B-A4B-v1.1. Solo Adversary se proceso con "pinocchio: true". La configuracion usa optimizacion multiobjetivo "pareto", un "router_strategy" de tipo "della" con normalizacion de router, y un conjunto de mecanismos experimentales (qliphoth con descomposicion SVD de rango 4, QHE de 16 niveles, "gap_jumper", "halley_strength" 0.20 con periodo 76, "aura_shift", "momentum" 0.25, "patience" 64, entre otros). No se documenta ni el volumen de tokens de entrenamiento (inexistente, al ser un merge) ni el uso de RLHF o DPO especifico para este artefacto.

## Capacidades

- Generacion de texto narrativo y prosa de ficcion en ingles, con enfasis declarado en descripcion vivida ("vivid prosing").
- Escritura creativa multigenero: terror, romance, ciencia ficcion y generos sin restriccion tematica explicita ("all genres").
- Generacion de tramas y subtramas ("plot generation", "sub-plot generation") y continuacion de escenas ("scene continue").
- Roleplay y conversacion en personaje ("roleplay", "rp", "conversational"), con tolerancia a lenguaje soez ("swearing").
- Entrada multimodal de imagen y texto segun el pipeline declarado (image-text-to-text); el uso concreto de esa via no esta documentado con ejemplos en la model card.
- Herencia de capacidades de razonamiento de Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2, sin que se detallen evaluaciones.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles por declaracion explicita del campo language.
- Modo "thinking" explicito: no disponible (no documentado).

## Casos de uso

- Asistente de escritura de ficcion: el modelo puede mantener una sesion de escritura por capitulos con contexto de personajes y arcos, generar borradores de escenas y proponer alternativas de trama. Es adecuado por su entrenamiento orientado a narrativa y por admitir entradas de imagen que pueden servir como referencia visual de escenarios o personajes.
- Motores de rol conversacional e interaccion con personajes: en videojuegos o plataformas de chat con personajes, el modelo mantiene estilo y voz dentro del personaje, con tolerancia a lenguaje adulto si la aplicacion lo requiere. Su arquitectura de mezcla de expertos con pocos parametros activos reduce el coste por token frente a un modelo denso de 26B.
- Generacion de tramas para produccion editorial seriada: pipelines que necesiten sinopsis, esquemas de subtramas y beats por capitulo para novelas serializadas o webnovels en ingles, partiendo de una premisa breve y un conjunto de fichas de personajes.
- Previsualizacion y "pitch" de guiones y narrativa audiovisual: redaccion de tratamientos y dialogos de escenas a partir de una descripcion textual o de una imagen de referencia (storyboard, concepto artistico).
- Herramientas de escritura para autores: integracion en editores o plugins que ofrezcan reescritura con mas detalle sensorial, expansion de parrafos y generacion de descripciones de entorno, siempre en ingles.
- Prototipado de narrativa multimodal: dado que acepta imagen y texto, permite construir demos que conviertan una ilustracion en una escena narrada o en una ficha de personaje, util en talleres creativos y herramientas de worldbuilding.
- Filtros de contenido y moderacion creativa: no es un caso de uso recomendado tal cual, pero el modelo puede emplearse para generar ejemplos de lenguaje soez o material sensible en ingles destinado a entrenar o evaluar clasificadores de moderacion, dado su tag explicito de "swearing".
- Base para nuevos merges: al ser un merge experimental con licencia Apache 2.0 declarada, sirve como punto de partida para experimentos de fusion de pesos dentro del ecosistema Gemma 4 de 26B A4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench, EQ-Bench ni ninguna otra evaluacion, y tampoco se aportan comparaciones con los modelos de origen.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 1x A100 80GB o 1x H100 80GB con margen, o 2x A6000/RTX 6000 Ada de 48GB.
- VRAM estimada en cuantizacion de 8 bits: del orden de 26 a 30 GB, viable en 1x A100 40GB o 1x RTX 6000 Ada 48GB.
- VRAM estimada en cuantizacion de 4 bits: del orden de 13 a 16 GB, lo que situaria el modelo dentro de una RTX 4090 o RTX 3090 de 24 GB, con contexto limitado.
- Capacidad en GPU de consumo: no cabe en bf16 en ninguna GPU de consumo actual; con cuantizacion de 4 bits puede caber en tarjetas de 24 GB, aunque al ser un modelo multimodal el uso de la torre de vision anade consumo adicional.
- Al ser presumiblemente una mezcla de expertos con una fraccion pequena de parametros activos por token, el coste de computo por token deberia ser inferior al de un modelo denso de 26B, pero el peso total en memoria sigue siendo el de 26B; no hay mediciones publicadas de latencia ni throughput.
- Opciones de despliegue: transformers (formato nativo, ya que el repositorio solo contiene safetensors en bfloat16); vLLM o TGI si la version de la libreria soporta la arquitectura Gemma 4 multimodal; llama.cpp u Ollama requeririan convertir los pesos a GGUF, un formato que no se distribuye en el repositorio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos de origen, por lo que la comparativa se limita a lo declarado en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Papel en el merge |
|---|---|---|---|---|---|
| EldritchLabs/Aura-Prototype-26B-A4B | 26B (activos no disponibles) | no disponible | apache-2.0 | safetensors, 52 GB | Modelo resultante |
| electroglyph/gemma4-26b-fiction-bf16 | 26B (segun nomenclatura) | no disponible | no disponible | no disponible | Base de ficcion en bf16 |
| Gandalf69/Adversary-26B-A4B-v0 | 26B A4B | no disponible | no disponible | no disponible | Fusionado con pinocchio activo |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 | 26B A4B | no disponible | no disponible | no disponible | Aporte de razonamiento |
| TheDrummer/Orion-26B-A4B-v1.1 | 26B A4B | no disponible | no disponible | no disponible | Aporte de estilo conversacional |

No se incluyen alternativas externas (por ejemplo, otros modelos de 26 a 32B orientados a escritura creativa) porque no hay datos de rendimiento en la informacion proporcionada que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Idiomas: el campo language declara unicamente ingles (eng). El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Ventana de contexto: no se especifica. Cuatro modelos fusionados pueden tener longitudes de contexto distintas, de modo que el valor efectivo es incierto.
- Alucinacion: es un modelo orientado a ficcion y roleplay, no a recuperacion factual. No debe usarse como fuente de informacion verificada sin supervision humana.
- Contenido sensible: los tags incluyen "swearing" y no hay filtros declarados. Puede producir lenguaje soez y contenido adulto; requiere moderacion o guardarrailes si se expone al publico.
- Licencia: el autor declara apache-2.0 para el merge, pero los cuatro modelos de origen tienen condiciones propias que no se detallan en la informacion disponible. Antes de un uso comercial conviene verificar la licencia de cada modelo base, ya que una licencia permisiva del merge no neutraliza las restricciones de los componentes.
- Metodo de merge experimental: el metodo "aura", el enrutado "della" y los mecanismos qliphoth, pinocchio, QHE o halley son experimentales y no cuentan con documentacion tecnica publica en la informacion disponible. No hay garantia de estabilidad de comportamiento ni de coherencia entre capas tras la fusion.
- Ausencia de evaluacion: sin benchmarks, sin comparativas y con cero descargas, no existe evidencia empirica de calidad, robustez ni de que las capacidades de razonamiento de los modelos de origen se hayan preservado.
- Soporte de herramientas y agentes: al no estar documentado el tool calling, no es prudente integrarlo en pipelines de agentes en produccion sin validacion previa.
- Reproducibilidad: la configuracion YAML apunta a rutas locales del autor (por ejemplo, B:\26B\...) y usa parametros propietarios del fork mergekit-exp, lo que dificulta reproducir el merge tal cual.
- Estado del artefacto: es un "prototype", con fecha de publicacion y actualizacion el mismo dia y sin mantenimiento posterior conocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EldritchLabs/Aura-Prototype-26B-A4B
- Fork de mergekit con el metodo aura: https://github.com/EldritchLabs/mergekit-exp
- mergekit original: https://github.com/cg123/mergekit
- Script de visualizacion de mapas de calor del merge: https://huggingface.co/spaces/Naphula/model_tools/blob/main/graph_v18.py
- Modelo base Gandalf69/Adversary-26B-A4B-v0: https://huggingface.co/Gandalf69/Adversary-26B-A4B-v0
- Modelo base Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- Modelo base TheDrummer/Orion-26B-A4B-v1.1: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- Modelo base electroglyph/gemma4-26b-fiction-bf16: https://huggingface.co/electroglyph/gemma4-26b-fiction-bf16
- Paper, blog o demo adicionales: no disponible
