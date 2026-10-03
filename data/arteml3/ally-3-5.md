# arteml3/Ally-3.5

## Resumen

Ally-3.5 es un modelo de lenguaje publicado en HuggingFace por el usuario arteml3 bajo el identificador `arteml3/Ally-3.5`. Se trata de un modelo de pequeno tamano, con 134.515.008 parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de los modelos ligeros de aproximadamente 135 millones de parametros. El repositorio ocupa 0,3 GB, un tamano coherente con pesos almacenados en precision de 16 bits (unos 269 MB solo de pesos), aunque la model card no confirma el tipo exacto.

La informacion publicada por el autor es minima: unicamente declara licencia MIT y el idioma ingles. No hay pipeline declarado, no hay resultados de benchmarks, no hay descripcion del dataset de entrenamiento ni del proceso de ajuste (si lo hubo), y no se indica la longitud de contexto soportada. El modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto practicamente sin adopcion ni validacion externa.

Su relevancia actual es, por tanto, limitada y de caracter experimental: encaja en el nicho de modelos de menos de 200 millones de parametros utiles para inferencia en CPU, despliegue en dispositivos de borde, prototipado rapido y experimentos de investigacion con presupuesto de computo minimo. Cualquier evaluacion seria de su calidad requiere una validacion propia, porque no existe evidencia publica de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (segun el tag del repositorio); numero de capas, dimension oculta y cabezas de atencion: no disponible |
| Parametros totales | 134.515.008 (aprox. 134,5 M) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible. El repositorio solo publica pesos en safetensors; no se han publicado versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | ingles (en) declarado por el autor; resto: no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El unico dato estructural fiable es el tag `llama`, que situa al modelo en la familia de transformers decoder-only con atencion causal, normalizacion RMSNorm y embeddings rotatorios (RoPE) en su variante habitual. No se dispone de informacion sobre el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el tamano del vocabulario ni la estrategia de tokenizacion. Tampoco se indica si se trata de un modelo base (preentrenado sin ajuste) o de un modelo ajustado con instrucciones; la ausencia de pipeline declarado y de cualquier mencion a formato de prompt o chat template apunta a un modelo base, pero esto no puede confirmarse con la informacion disponible.

Respecto al entrenamiento, no hay ningun dato publicado: ni numero de tokens, ni composicion del dataset, ni si hubo fases de RLHF, DPO o SFT. No consta ninguna innovacion tecnica destacable (atencion lineal, decodificacion especulativa, mezcla de expertos, arquitecturas hibridas SSM-transformer) y no hay ninguna publicacion o paper asociado en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles: capacidad esperable por tratarse de un modelo de lenguaje, pero sin verificacion publica de calidad.
- Razonamiento, matematicas y generacion de codigo: no disponible. No hay benchmarks ni ejemplos que confirmen estas capacidades, y a 134 M de parametros el rendimiento en tareas de razonamiento multi-paso es previsiblemente bajo.
- Tool calling / function calling: no disponible; no se menciona en la model card.
- Soporte para agentes y razonamiento multi-step: no disponible; no hay evidencia de plantilla de herramientas ni de entrenamiento orientado a agentes.
- Capacidades multilingues: solo ingles declarado. El resto de idiomas, incluido el espanol, no estan soportados de forma declarada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Ajuste por instrucciones: no confirmado; el repositorio no declara pipeline ni formato de chat.

## Casos de uso

Dado que no hay datos publicados de calidad ni de ajuste por instrucciones, los casos siguientes son usos plausibles por escala y coste, no usos validados. Se recomienda evaluar el modelo antes de integrarlo en cualquier flujo real.

- Inferencia en CPU o dispositivos de borde: con 134,5 M de parametros, los pesos caben en menos de 300 MB en 16 bits y en torno a 70 MB en cuantizacion de 4 bits, lo que permite ejecutarlo en portatiles, Raspberry Pi o moviles sin GPU dedicada, siempre que se genere una version cuantizada propia.
- Clasificacion y etiquetado de texto en ingles: ajustando una cabeza de clasificacion sobre las representaciones del modelo se puede usar para analisis de sentimiento, deteccion de spam o categorizacion de tickets, tareas donde la escala de 135 M suele ser suficiente.
- Extraccion de informacion estructurada de plantillas simples: para convertir texto corto en campos concretos (fechas, importes, nombres) en pipelines por lotes, donde el coste por inferencia es minimo.
- Modelo borrador para decodificacion especulativa: su tamano reducido lo hace candidato a actuar como draft model de un modelo mayor, acelerando la generacion si el vocabulario es compatible; requiere verificar que la tokenizer coincide.
- Generacion de datos sinteticos a gran escala: al ser barato en computo, se puede usar para sobregenerar texto y filtrarlo despues con un modelo mayor.
- Prototipado y docencia: sirve para probar pipelines de entrenamiento, tecnicas de cuantizacion o infraestructura de inferencia (vLLM, llama.cpp) con un coste de hardware despreciable.
- Busqueda semantica ligera: uso de las representaciones internas como embeddings para recuperacion sobre corpus pequenos en ingles, previa comprobacion de que la calidad de recuperacion es aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion, y el repositorio no dispone de model card ampliada, paper ni tabla comparativa.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (134,5 M) y del tamano de pesos en 16 bits; no son datos publicados por el autor:

- VRAM para inferencia en 16 bits (fp16/bf16): aproximadamente 0,27 GB solo de pesos, mas activaciones y cache KV.
- VRAM en 8 bits: aproximadamente 0,13 GB de pesos.
- VRAM en 4 bits: aproximadamente 0,07 GB de pesos, mas el coste del kernel de cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 o superiores. El modelo no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo y tambien en CPU, dado el tamano.
- Opciones de despliegue: al distribuirse solo en safetensors, es necesario convertirlo para usarlo con llama.cpp u Ollama (formato GGUF); con Transformers (PyTorch) y vLLM se puede cargar directamente. No hay artefactos GGUF, MLX ni ONNX publicados.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas publicas habituales; los campos de Ally-3.5 no publicados se marcan como no disponibles, por lo que la comparacion es fundamentalmente de escala y licencia.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Ally-3.5 | 134,5 M | no disponible | MIT | en | safetensors |
| SmolLM2-135M | 135 M | 2048 tokens | Apache-2.0 | ingles y otros | safetensors, GGUF, ONNX |
| Qwen2.5-0.5B | aprox. 0,49 B | 32 768 tokens | Apache-2.0 | multilingue | safetensors, GGUF, AWQ y otros |
| Pythia-160M | 160 M | 2048 tokens | Apache-2.0 | en | safetensors |

La ventaja diferencial de Ally-3.5 seria su licencia MIT, mas permisiva que Apache-2.0 en cuanto a requisitos de atribucion y avisos, pero sus competidores directos ofrecen contexto documentado, versiones cuantizadas listas para usar y resultados de evaluacion publicos, cosas que Ally-3.5 no aporta.

## Limitaciones y advertencias

- Ausencia total de evaluacion publica: no hay benchmarks, ni model card ampliada, ni validacion de terceros. Cualquier uso en produccion exige una evaluacion propia.
- Riesgo de alucinacion elevado: a 134,5 M de parametros, la probabilidad de generar afirmaciones factualmente incorrectas con fluidez es alta, y no hay mitigaciones documentadas.
- Sesgos: no hay informacion sobre el dataset de entrenamiento, por lo que no se pueden caracterizar sesgos de genero, raza, ideologia o dominio. Se desconoce tambien si el corpus estaba filtrado.
- Idioma: solo ingles declarado. No hay soporte confirmado de espanol ni de otros idiomas.
- Contexto desconocido: sin longitud de contexto publicada no se puede dimensionar el cache KV ni garantizar el comportamiento en conversaciones largas.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la unica obligacion de conservar el aviso de copyright y de licencia. La licencia no supone ninguna garantia sobre el modelo ni sobre la legalidad del contenido de entrenamiento, que se desconoce.
- Posible modelo base sin ajuste por instrucciones: si no se ha aplicado SFT, el modelo completara texto en lugar de seguir instrucciones, y necesitara tecnicas de prompting few-shot o un ajuste propio.
- Adopcion nula: 0 descargas y 0 likes implican que no existe una comunidad que haya detectado errores en los pesos o en la tokenizer.
- Procedencia: la identidad del autor y el origen de los pesos no estan verificados en la informacion disponible; conviene auditar el repositorio antes de ejecutar codigo remoto.

## Enlaces

- HuggingFace: https://huggingface.co/arteml3/Ally-3.5
- Paper, blog, repositorio de codigo, demo o dataset asociado: no disponible en la informacion proporcionada.
