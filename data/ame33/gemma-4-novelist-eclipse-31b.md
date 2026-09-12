# Ame33/Gemma-4-Novelist-Eclipse-31B

## Resumen

Gemma-4-Novelist-Eclipse-31B es un modelo de lenguaje de 32.682.375.020 parametros (unos 32,68 mil millones) publicado por el usuario Ame33 (firmado como Ateron en la model card) y construido mediante fusion de pesos con mergekit, no mediante entrenamiento adicional. Parte de la familia Gemma 4 de Google DeepMind y combina seis ajustes finos de terceros especializados en prosa, roleplay y estilo, con el objetivo declarado de mejorar la creatividad narrativa y la consistencia del texto frente a la version anterior del autor ("Novelist"), reduciendo lo que el propio autor denomina "slop".

La relevancia del modelo es acotada y muy especifica: se trata de un merge experimental orientado a escritura creativa y roleplay en ingles, con licencia Apache 2.0, pesos en safetensors de ~65,4 GB y capacidades de generacion de texto conversacional. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", y no se ha publicado ninguna evaluacion cuantitativa, por lo que debe considerarse un artefacto de investigacion y experimentacion mas que un modelo listo para produccion.

No hay informacion disponible sobre la longitud de contexto, la composicion del dataset, el numero de tokens de entrenamiento ni las cuantizaciones publicadas. La model card se limita a documentar la receta exacta de fusion en dos fases, lo que permite reproducir (con matices) el proceso, pero no acredita ninguna mejora medible frente a sus modelos de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de la familia Gemma 4 (no se detalla la configuracion exacta de capas ni atencion en la informacion disponible) |
| Parametros totales | 32.682.375.020 (~32,68 mil millones) |
| Parametros activos | no disponible (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en f16/bfloat16; no se incluyen GGUF, GPTQ, AWQ ni EXL2) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dtype bfloat16 en la receta de fusion; `quantized_by: f16` en la model card) |
| Tamano del repositorio | 65,4 GB |
| Metodo de construccion | mergekit: fase 1 `dare_ties`, fase 2 `model_stock` |
| Tokenizer | union en la fase 1, base en la fase 2 |
| Fecha de publicacion | 11 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es el resultado de una fusion de pesos en dos fases ejecutada con mergekit sobre una base Gemma 4 de 31B. La fase 1, denominada "The Prose", emplea `dare_ties` con `lambda: 1.0`, `dtype: bfloat16` y `tokenizer_source: union` sobre tres modelos: Gemma4-Gutenberg-31B (densidades 0,50/0,50/0,50/0,40/0,45 y pesos 0,40), Melinoe-Gemma4-31B-VL (densidades 0,30-0,35 y pesos 0,30-0,40) y Gemma-4-31B-glimmer-rp-v0.1 (densidades 0,20-0,30 y pesos 0,20-0,40). Las densidades y pesos se especifican por grupos de capas, lo que permite preservar de forma diferenciada las capas altas y bajas de cada donante.

La fase 2, "The Lead", aplica `model_stock` con `tokenizer_source: base` sobre el resultado de la fase 1 (denominado NovelistX internamente), Gemma4-GarnetV2-31B y Gemopus-4-31B-it, con el objetivo declarado de recuperar consistencia. Adicionalmente, la model card indica que se anadio una `lm_head` procedente de Gemma-4-31B-StyleTune. No hay RLHF, DPO ni ajuste supervisado posterior, ni se documentan tokens de entrenamiento, composicion del dataset o tecnicas de inferencia como decodificacion especulativa. Tampoco se documenta soporte de vision, pese a que uno de los donantes (Melinoe-Gemma4-31B-VL) es un modelo vision-lenguaje: el pipeline declarado es exclusivamente `text-generation`.

## Capacidades

- Generacion de texto narrativo en ingles, con enfasis declarado en descripcion de escenas, prosa literaria y coherencia estilistica.
- Roleplay y conversacion multi-turno con personajes, categoria para la que el autor etiqueta explicitamente el modelo.
- Escritura creativa en formato largo (ficcion, relatos, novelas por capitulos) gracias a la mezcla de donantes orientados a "Gutenberg" y a estilo.
- Continuacion y reescritura de texto manteniendo una voz estilistica concreta, mediante la `lm_head` heredada de StyleTune.
- Generacion de dialogos y escenas conversacionales.
- Soporte de tool calling o function calling: no disponible (no documentado).
- Soporte de agentes o razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. Aunque un donante sea un modelo VL, la model card no acredita vision en este merge.

## Casos de uso

- Escritura de ficcion larga: el modelo puede generar capitulos y escenas con continuidad estilistica, aprovechando la mezcla de donantes orientados a prosa literaria; es util como primer borrador que despues se edita a mano.
- Roleplay conversacional: adecuado para chats de personaje con turnos largos, ya que se ha fusionado especificamente sobre modelos de roleplay y estilo, aunque la ventana de contexto real no esta documentada.
- Asistente de reescritura y control de estilo: se le puede pedir que reescriba un parrafo manteniendo una voz narrativa concreta, gracias a la `lm_head` de StyleTune integrada en la fusion.
- Worldbuilding y material de apoyo para juegos de rol de mesa: generacion de trasfondos, descripciones de localizaciones y dialogos de PNJ a partir de premisas breves.
- Preproduccion de guiones y narrativa para videojuegos: generacion masiva de variantes de dialogo y descripciones de ambientes que despues se filtran y ajustan manualmente.
- Base para ajuste fino posterior en dominios creativos: al publicarse en safetensors y con licencia Apache 2.0, sirve como punto de partida para LoRA o ajustes completos en genero negro, romance o ciencia ficcion.
- Prototipado de experiencias de entretenimiento conversacional: demos de chatbots con personalidad donde la prioridad es el tono y no la precision factual.
- Generacion de descripciones de producto creativas o textos de ambientacion: uso adyacente de marketing narrativo, siempre con revision humana por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench, EQ-Bench, ningun benchmark de rol (Aglio, Chatbot Arena) ni evaluaciones de perplexity o de calidad de prosa. El repositorio acumula 0 descargas y 0 "likes", por lo que tampoco existen evaluaciones de terceros. Cualquier cifra de rendimiento que se atribuya a este modelo debe considerarse no verificada.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del numero de parametros declarado (32,68 mil millones) y del tamano del repositorio (65,4 GB), no de mediciones publicadas por el autor.

- VRAM para pesos en bfloat16/f16 (formato publicado): aproximadamente 65-70 GB solo para los pesos, mas overhead de cache KV. Requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- VRAM estimada en int8 (si se genera una cuantizacion propia): en torno a 33-36 GB. Encaja en A100 40 GB, L40S 48 GB o 2 x RTX 4090.
- VRAM estimada en 4 bits (Q4_K_M o AWQ/GPTQ de 4 bits, generadas por el usuario): en torno a 18-22 GB. Cabe en una RTX 4090, RTX 3090, RTX 4080 de 16 GB queda justa y probablemente requiera descarga parcial a CPU.
- Cabe en GPU de consumo: si, en configuraciones de 24 GB (RTX 3090, 4090) o 32 GB (5090) siempre que se cuantice a 4 bits. En 16 GB solo con cuantizaciones agresivas y offload, con perdida de velocidad.
- Opciones de despliegue: transformers (formato safetensors disponible), vLLM y TGI para servicio en bf16 sobre GPU de 80 GB, llama.cpp y Ollama previa conversion a GGUF (no se publica GGUF oficial), y LM Studio o text-generation-webui para uso local.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo para ninguna configuracion de hardware.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones completas de los modelos comparables, por lo que la comparacion se limita a los donantes de la fusion, unicos modelos de la misma categoria y familia documentados en la informacion disponible.

| Modelo | Parametros | Papel en la fusion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-Novelist-Eclipse-31B (este modelo) | 32,68 mil millones | Resultado final (dare_ties + model_stock) | no disponible | Apache 2.0 | safetensors, 65,4 GB |
| nbeerbower/Gemma4-Gutenberg-31B | ~31 mil millones (segun denominacion) | Donante fase 1 (prosa) | no disponible | no disponible | HuggingFace |
| bgg1996/Melinoe-Gemma4-31B-VL | ~31 mil millones | Donante fase 1 | no disponible | no disponible | HuggingFace |
| BirdToast/Gemma-4-31B-glimmer-rp-v0.1 | ~31 mil millones | Donante fase 1 (roleplay) | no disponible | no disponible | HuggingFace |
| ConicCat/Gemma4-GarnetV2-31B | ~31 mil millones | Donante fase 2 (consistencia) | no disponible | no disponible | HuggingFace |
| Jackrong/Gemopus-4-31B-it | ~31 mil millones | Donante fase 2 (instrucciones) | no disponible | no disponible | HuggingFace |
| Gryphe/Gemma-4-31B-StyleTune | ~31 mil millones | Aporta la `lm_head` | no disponible | no disponible | HuggingFace |

Frente a alternativas externas de tamano similar (por ejemplo, modelos de 24-34 mil millones de parametros de otras familias), no es posible establecer una comparacion rigurosa porque no hay contexto ni resultados de evaluacion publicados para este merge.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones humanas, ni puntuaciones de arena de rol publicadas. El rendimiento real es desconocido.
- Modelo sin traccion: 0 descargas y 0 "likes" en el momento de redactar la ficha, lo que implica ausencia de validacion por parte de la comunidad y ausencia de informes de errores.
- Idioma unico: declarado exclusivamente en ingles. No hay evidencia de calidad en castellano ni en otros idiomas.
- Contexto desconocido: la longitud de ventana no esta documentada. No se deben asumir 128k ni valores similares sin verificacion empirica.
- Riesgo de alucinacion alto en tareas factuales: es un modelo orientado a creatividad y roleplay, no a precision factual ni a razonamiento verificable.
- Contenido sin filtrar: los merges orientados a roleplay suelen reducir las barreras de rechazo y pueden producir contenido adulto, violento o inapropiado. Requiere moderacion si se expone a usuarios.
- Licencia declarada Apache 2.0, pero procedencia multiple: el modelo fusiona seis pesos de terceros cuya licencia no se detalla en esta ficha. Antes de un uso comercial conviene verificar la licencia de cada donante (Gutenberg, Melinoe, Glimmer, GarnetV2, Gemopus y StyleTune), ya que la licencia declarada por el autor del merge no exime de las obligaciones heredadas.
- Reproducibilidad limitada: la receta de mergekit referencia rutas locales de Windows (`F:\AI\Merge\...`) y depende de un fork no estandar de mergekit (atribuido a Zerofata). Replicar exactamente el resultado puede no ser viable sin esos binarios.
- Riesgo de degradacion por fusion: al ser un merge sin ajuste posterior, es habitual observar inestabilidad en instrucciones estrictas, perdida de formato y respuestas degeneradas en conversaciones muy largas. No hay datos que confirmen o descarten estos problemas en este caso.
- Uso en produccion desaconsejado sin evaluacion previa propia: no se debe desplegar en atencion al cliente, entornos sanitarios, legales o financieros sin una bateria de pruebas interna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ame33/Gemma-4-Novelist-Eclipse-31B
- Donante fase 1: https://huggingface.co/nbeerbower/Gemma4-Gutenberg-31B
- Donante fase 1: https://huggingface.co/bgg1996/Melinoe-Gemma4-31B-VL
- Donante fase 1: https://huggingface.co/BirdToast/Gemma-4-31B-glimmer-rp-v0.1
- Donante fase 2: https://huggingface.co/ConicCat/Gemma4-GarnetV2-31B
- Donante fase 2: https://huggingface.co/Jackrong/Gemopus-4-31B-it
- Donante de la `lm_head`: https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre sus donantes: los enlaces obtenidos correspondian a paginas corporativas de Microsoft sin relacion con el objeto de la ficha. No se han localizado papers, blogs tecnicos, repositorios de codigo ni demos asociados.
