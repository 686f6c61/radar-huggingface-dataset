# KucLab/kuclab-hertz-0.7f

## Resumen

KucLab Hertz 0.7F es un ajuste fino LoRA sobre Qwen/Qwen3.5-9B, desarrollado por KucLab y orientado a asistencia en disciplinas STEM (fisica, quimica, biologia, matematicas) y programacion, con soporte de checo e ingles. Cuenta con 8.953.803.264 parametros y se distribuye principalmente cuantizado en GGUF Q4_K_M (unos 5,3 GB), lo que permite ejecutarlo en GPU de consumo mediante llama.cpp u Ollama. La ventana de contexto configurada en su Modelfile de Ollama es de 32768 tokens.

A diferencia de la linea anterior Hertz 0.x, construida sobre Gemma, esta version es destilada: un modelo profesor de 30B servido en local genero los datos de entrenamiento y un estudiante de ~9B los aprendio. El ajuste se realizo con QLoRA (r=16, alpha=32), se fusiono a bf16 y despues se cuantizo a GGUF.

Su relevancia es acotada pero concreta: con solo 4884 filas de entrenamiento, el autor reporta mejoras medibles frente a su modelo anterior en dos benchmarks propios (MMLU-Pro STEM, subconjunto curado por el propio proyecto, y terminologia cientifica checo-ingles). No es un modelo generalista ni carece de ajuste especifico para tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-9B), con cabeza MTP descartada en la conversion a GGUF |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 32768 tokens configurados como `num_ctx` en el Modelfile de Ollama; no se especifica el contexto maximo de entrenamiento |
| Tipos de cuantizacion | GGUF Q4_K_M (~5,3 GB) distribuida; adaptador LoRA crudo bajo peticion al autor |
| Idiomas soportados | cs (checo), en (ingles) |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.5-9B) |
| Formato de pesos | GGUF (Q4_K_M); el adaptador LoRA se fusiono a bf16 antes de cuantizar. No se publican safetensors completos |
| Modelo base | Qwen/Qwen3.5-9B |
| Metodo de ajuste | QLoRA, r=16 / alpha=32, fusionado y cuantizado |
| Tamano del repositorio | 5,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer decoder-only de ~9B parametros bajo licencia Apache 2.0. Sobre esa base se aplico un ajuste QLoRA con r=16 y alpha=32, que despues se fusiono en los pesos en bf16 y se cuantizo a GGUF Q4_K_M. Durante la conversion se detecto que la cabeza MTP (multi-token prediction) de Qwen3.5 hace que `convert_hf_to_gguf` emita un bloque fantasma `blk.32` (block_count 33 en lugar de 32), lo que provoca que Ollama espere tensores SSM inexistentes; el autor lo corrige fijando block_count a 32 y eliminando los tensores MTP huerfanos. No se documentan innovaciones de atencion o decodificacion propias mas alla de las heredadas del modelo base.

El entrenamiento es de destilacion: un modelo profesor de 30B ("Meta Muse Glimmer 30B", servido en local, con razonamiento de fuerza alta y prompt de sistema orientado a respuesta primero) genero las respuestas que despues se usaron como datos de supervision. El conjunto completo tiene 4884 filas: 4532 filas destiladas de matematicas, fisica, quimica, biologia, programacion, checo, ingles y ejercicios numericos de opcion multiple; 309 filas de terminologia cientifica CS↔EN con definiciones (solo split de entrenamiento, el cuarto reservado del benchmark nunca se entrena); 28 ejemplos de formato "respuesta primero"; y 15 filas de identidad escritas a mano. La validacion reportada indica 0 filas malformadas, 0 duplicados, 0 filtraciones de identidad y un 87,9% de contenido en checo. El autor documenta explicitamente que Hertz 0.7 (misma base Gemma-4-12B que 0.6) sufrio una regresion porque el corpus nuevo era solo 53% checo frente al 93% anterior, y que 901 filas de razonamiento largo fomentaban respuestas divagantes; de ahi el cambio de estrategia hacia destilacion.

## Capacidades

- Generacion de texto conversacional en checo e ingles, con registro directo y sin rodeos en temas ordinarios.
- Resolucion de problemas STEM: matematicas, fisica, quimica y biologia, con especial enfasis en matematicas y quimica segun los benchmarks del autor.
- Terminologia cientifica bilingue CS↔EN, incluyendo definiciones de terminos.
- Programacion, presente como categoria explicita en el corpus de destilacion.
- Formato de respuesta "respuesta primero" con linea final canonica `Answer: (X)` en items de opcion multiple, inducido por el prompt de sistema del profesor.
- Identificacion como modelo de KucLab (KucLab Hertz 0.7F, kuclab.org), sin nombrar fundador.
- Rechazo de peticiones genuinamente daninas, segun la model card.
- Soporte de tool calling / function calling: no disponible (no hay ajuste especifico).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada especifica.
- Capacidades de vision, audio o thinking mode explicito: no disponibles.

## Casos de uso

- Tutor de matematicas en checo: el modelo alcanza un 96,7% en el subconjunto de matematicas de MMLU-Pro STEM del proyecto, por lo que es adecuado para resolver y explicar ejercicios de nivel universitario introductorio en checo, su idioma dominante de entrenamiento (87,9% del corpus).
- Asistencia en quimica general: con un 78,3% en el subconjunto de quimica, mejora en 16,6 puntos porcentuales a Hertz 0.6, lo que lo hace util para consultas de estequiometria, formulacion y nomenclatura, siempre con verificacion humana.
- Traduccion de terminologia cientifica EN→CS: la direccion dificil sube de 65,0% a 82,5% en el benchmark propio del autor, lo que permite usarlo como apoyo en traduccion de articulos o documentacion tecnica entre ingles y checo.
- Generacion y revision de codigo en un entorno local: al distribuirse en GGUF Q4_K_M (~5,3 GB), puede ejecutarse integramente offline con Ollama sobre una GPU de consumo, lo que encaja en flujos con requisitos de privacidad o sin conectividad.
- Despliegue en el aula o en un laboratorio con hardware modesto: el tamano cuantizado permite servir el modelo a varios usuarios mediante llama.cpp en una unica estacion con 12-16 GB de VRAM, con contexto de hasta 32768 tokens para documentos largos.
- Extraccion de respuestas de opcion multiple en pipelines de evaluacion: gracias a las 28 filas de formato "respuesta primero" y a la linea final `Answer: (X)`, el modelo es facil de parsear automaticamente para tareas de clasificacion de respuestas o autoevaluacion.
- Prototipado de asistentes cientificos bilingues: sirve como punto de partida barato para experimentar con tecnicas de destilacion, ya que el autor publica el detalle del corpus, los hiperparametros y los errores de exportacion encontrados.

## Benchmarks y rendimiento

Los datos siguientes proceden del propio proyecto, con los mismos prompts, el mismo codigo de evaluacion y la misma cuantizacion Ollama Q4_K_M en todos los casos. No son cifras oficiales de MMLU-Pro ni comparables con leaderboards publicos.

MMLU-Pro STEM (240 preguntas reservadas, subconjunto curado por el proyecto):

| Categoria | base (Qwen3.5-9B) | Hertz 0.6 (LoRA sobre Gemma-12B) | Hertz 0.7F |
|---|---|---|---|
| Biologia | no disponible | 91,7% | 83,3% |
| Quimica | no disponible | 61,7% | 78,3% |
| Matematicas | no disponible | 90,0% | 96,7% |
| Fisica | no disponible | 73,3% | 75,0% |
| Total | no disponible | 79,2% | 83,3% |

Terminologia cientifica checo-ingles (206 terminos reservados CS↔EN):

| Direccion | Hertz 0.6 | Hertz 0.7F |
|---|---|---|
| CS→EN | 82,5% | 88,3% |
| EN→CS | 65,0% | 82,5% |
| Total | 73,8% | 85,4% |

No se han publicado resultados de benchmarks estandarizados (MMLU completo, HumanEval, GSM8K, BBH) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_K_M: aproximadamente 5,3 GB solo de pesos; con contexto de 32768 tokens hay que sumar la cache KV, por lo que una estimacion prudente es de 7 a 9 GB de VRAM (estimacion propia a partir del tamano de pesos y la longitud de contexto, no confirmada por el autor).
- VRAM estimada en bf16: aproximadamente 18 GB de pesos mas activaciones y cache KV, lo que exige 24 GB o mas.
- GPU recomendadas por escenario: RTX 3060 12 GB, RTX 4070 / 4070 Ti Super o RTX 4090 24 GB para Q4_K_M; RTX 3090, RTX 4090, L40S o A100 40 GB para bf16.
- Cabe en GPU de consumo: si, en Q4_K_M. En tarjetas de 8 GB es probable que funcione con contexto reducido, aunque no hay confirmacion del autor.
- Opciones de despliegue: Ollama y llama.cpp son las soportadas oficialmente (el Modelfile apunta a `hf.co/KucLab/kuclab-hertz-0.7f:Q4_K_M`). Para vLLM o TGI no se distribuyen pesos en safetensors, solo el adaptador LoRA bajo peticion, por lo que no hay ruta directa confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark del proyecto (MMLU-Pro STEM) | Benchmark terminologia CS↔EN | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KucLab Hertz 0.7F | 8,95B | 32768 (Ollama) | 83,3% | 85,4% | Apache 2.0 | GGUF Q4_K_M en HuggingFace; adaptador LoRA bajo peticion |
| Hertz 0.6 (KucLab) | no disponible (base Gemma-12B) | no disponible | 79,2% | 73,8% | no disponible en la informacion | linea anterior del mismo autor |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible | no disponible | Apache 2.0 | pesos completos en HuggingFace |

No se dispone de datos comparativos frente a otros modelos de ~9B (Llama, Gemma, Mistral) en la informacion proporcionada, ya que los benchmarks publicados son subconjuntos propios del proyecto y no permiten una comparacion cruzada fiable.

## Limitaciones y advertencias

- Biologia es el punto debil conocido: 83,3% frente al 91,7% de Hertz 0.6. El propio autor atribuye la regresion a que el corpus destilado contenia solo unas 100 filas de biologia.
- El conjunto de entrenamiento es muy pequeno (4884 filas), lo que implica riesgo de sobreajuste al formato, al dominio y al estilo del profesor. No se documenta una evaluacion en dominios fuera de STEM y programacion.
- Sin ajuste de tool calling ni function calling: no debe desplegarse como agente que invoque herramientas sin trabajo adicional.
- Riesgo de alucinacion en datos cientificos concretos: el modelo se entreno sobre respuestas generadas por otro modelo, no sobre fuentes verificadas, y no se reportan tasas de error factual.
- Sesgo de formato: el prompt de sistema del profesor y las 28 filas de "respuesta primero" empujan a emitir una linea final `Answer: (X)`, comportamiento que puede resultar indeseado en generacion abierta.
- Cobertura idiomatica limitada a checo e ingles; el 87,9% del corpus es checo, por lo que el rendimiento en ingles no esta cuantificado de forma independiente.
- Los benchmarks son subconjuntos curados por el propio proyecto (240 y 206 items), no las suites oficiales, y no deben compararse con cifras publicas de MMLU-Pro.
- El contexto de 32768 tokens es la configuracion de `num_ctx` en el Modelfile de Ollama; no se declara cual es el contexto maximo para el que el modelo fue entrenado, por lo que no hay garantia de calidad en ventanas muy largas.
- La conversion a GGUF elimina la cabeza MTP del modelo base, modificando la estructura respecto a los pesos originales de Qwen3.5-9B.
- La cuantizacion Q4_K_M introduce perdida de precision frente a bf16; no se publican comparativas de calidad entre ambas.
- Licencia Apache 2.0, heredada del modelo base: permite uso comercial con atribucion y conservacion del aviso de licencia, pero conviene revisar tambien los terminos de Qwen/Qwen3.5-9B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- Las 15 filas de identidad escritas a mano pueden inducir respuestas rigidas o inconsistentes si se pregunta al modelo por su propia naturaleza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KucLab/kuclab-hertz-0.7f
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelfile para Ollama: https://huggingface.co/KucLab/kuclab-hertz-0.7f/resolve/main/Modelfile
- Sitio del autor, KucLab: https://kuclab.org

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo. Los unicos enlaces recuperados correspondian a rutas de senderismo en Sainte-Foy-Tarentaise (Francia), sin ninguna relacion con KucLab Hertz 0.7F. Por tanto, no hay papers, blogs, repositorios ni demos adicionales que enlazar.
