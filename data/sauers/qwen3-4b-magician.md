# Sauers/qwen3-4b-magician

## Resumen

Sauers/qwen3-4b-magician es un adaptador LoRA (PEFT) sobre el modelo denso Qwen3-4B de Alibaba, entrenado para que una instrucción incluida en el prompt modifique la representación interna de un concepto en las capas y tokens de respuesta que la propia instrucción especifica, sin dejar de responder a la pregunta del usuario. No es un modelo de propósito general ni un ajuste al uso: es una herramienta de interpretabilidad y control de activaciones (activation steering) que convierte el «steering» en una capacidad aprendida y expresada en el bloque de razonamiento del modelo.

El adaptador funciona en modo thinking: primero redacta en su bloque de pensamiento un plan con el cambio solicitado (por ejemplo, «tea: -2.0 SD on layers 3, 8, 13, 18, 23, 28, 33; every reply token») y después contesta la pregunta. El repositorio ocupa 0,3 GB y solo contiene los pesos del adaptador en safetensors, que deben cargarse junto al modelo base Qwen3-4B.

Es relevante ahora porque propone una vía poco habitual para auditar y controlar representaciones internas: en lugar de aplicar vectores de dirección calculados a mano en tiempo de inferencia, el modelo aprende a traducir lenguaje natural a ediciones de su propio flujo residual. La ficha declara que el adaptador recupera entre el 49 % y el 78 % del cambio solicitado según el conjunto de test, frente a aproximadamente el 0 % del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-4B) con adaptador LoRA sobre todas las matrices de atencion y MLP; edicion aprendida del flujo residual (activation steering) |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base (por la denominacion Qwen3-4B); el tamano exacto no se detalla en la informacion proporcionada. El adaptador LoRA se define con rango 32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador. Hereda la del modelo base Qwen3-4B (32.768 tokens nativos; 131.072 con YaRN segun la documentacion publica de la familia Qwen3) |
| Tipos de cuantizacion | El repositorio solo distribuye el adaptador en safetensors sin cuantizar; no se publican versiones GGUF, GPTQ, AWQ ni cuantizaciones de 4/8 bits |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT); tamano del repositorio 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only denso, y utiliza LoRA de rango 32 en todas las matrices de atencion y MLP. La innovacion no esta en la arquitectura del modelo base sino en el objetivo de entrenamiento: el adaptador aprende a traducir instrucciones en lenguaje natural a ediciones concretas del flujo residual, definidas por un concepto, una magnitud en desviaciones tipicas (SD), un conjunto de capas y un conjunto de tokens de respuesta. La medicion se formaliza como la proyeccion del flujo residual tras cada bloque sobre la direccion unitaria del concepto, expresada como z-score; el repositorio incluye `concept_directions.safetensors` con las direcciones de forma `[layer, concept, 2560]` (media del residual sobre 40 frases del concepto menos la media sobre los 135 conceptos de entrenamiento) y la media y desviacion tipica de cada proyeccion, con metadatos de 180 conceptos, de los cuales 135 son de entrenamiento.

El entrenamiento se hizo en tres etapas con 16 ejemplos por paso y tasa de aprendizaje 2e-4: 5.000 pasos sin planes, 1.000 pasos con planes en el bloque de pensamiento y 2.000 pasos en los que la mitad de los ejemplos con edicion tienen la instruccion eliminada y el plan prellenado. La funcion de perdida combina el error cuadratico medio (MSE) entre el cambio logrado y el objetivo en el concepto solicitado, el MSE sobre el resto de conceptos de entrenamiento (para limitar efectos colaterales), la entropia cruzada sobre los tokens del plan y la divergencia KL respecto a las probabilidades del siguiente token del modelo original evaluadas solo sobre la pregunta. Segun la model card, el texto de la ficha fue redactado por Claude Opus 5.5 y la receta completa, el codigo y las figuras estan en el repositorio de GitHub del autor.

## Capacidades

- Modificacion controlada de representaciones internas: atenuar o amplificar un concepto (por ejemplo, «tea») en capas y tokens de respuesta concretos, con magnitud expresada en desviaciones tipicas.
- Planificacion explicita en modo thinking: el modelo escribe primero el plan de edicion y luego responde a la pregunta, lo que hace auditable la intencion del cambio.
- Generalizacion parcial a formulaciones no vistas (share 0,78; r 0,68 en el conjunto de redacciones reservadas).
- Generalizacion parcial a conceptos no vistos (share 0,71; r 0,60 en conceptos reservados).
- Aplicacion de hasta tres ediciones simultaneas en una misma instruccion (share 0,60; r 0,66).
- Generacion de texto y respuesta a preguntas generales, heredadas del modelo base Qwen3-4B.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador; solo se documenta el modo thinking para planes de edicion.
- Capacidades multilingues: no disponible (no se declaran idiomas en la ficha).
- Vision y audio: no soportados (adaptador sobre un modelo de texto).

## Casos de uso

- Investigacion en interpretabilidad mecanistica: permite estudiar como se representa un concepto a lo largo de las capas y de los tokens de respuesta, usando las direcciones y z-scores incluidos en `concept_directions.safetensors` como referencia cuantitativa reproducible.
- Auditoria de sesgos y conceptos sensibles: un equipo de alineacion puede pedir al modelo que atenue un concepto concreto en capas y tokens determinados y observar si la conducta cambia, como paso previo a tecnicas de mitigacion en produccion.
- Red-teaming de sistemas de IA: sirve para comprobar si un modelo sigue instrucciones que operan sobre su estado interno, un vector de ataque poco explorado frente al prompting clasico.
- Control de estilo y verbosidad en pipelines de generacion: la capacidad de modular un concepto en tokens concretos de la respuesta es un prototipo de control fino de tono o detalle sin reentrenar el modelo base.
- Generacion de conjuntos de evaluacion para tecnicas de steering: sus planes en formato estructurado («concepto: magnitud SD en capas X; tokens Y») permiten construir pares instruccion-plan etiquetados para evaluar otros metodos.
- Docencia y divulgacion: el par plan + respuesta hace visible, en una sola traza, que el modelo puede modificar su representacion interna antes de contestar, lo que resulta util en cursos de interpretabilidad.
- Experimentos de control de idioma o de registro: no validado en la informacion disponible; solo tiene sentido como linea de investigacion, no como solucion de produccion.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre conjuntos de test reservados. Cada valor es la media sobre 96 instrucciones con preguntas no vistas. «Share» es la pendiente por minimos cuadrados del cambio logrado frente al solicitado pasando por el origen (1 equivaldria al cambio completo); «r» es la correlacion de Pearson entre cambio logrado y solicitado sobre todos los tokens de respuesta, capas y conceptos solicitados. El modelo original se ejecuto con el modo thinking desactivado.

| Conjunto de test | Share (entrenado) | r (entrenado) | Share (original) | r (original) |
|---|---|---|---|---|
| Conceptos, redacciones y patrones de entrenamiento | 0,75 | 0,66 | 0,00 | 0,00 |
| Redacciones reservadas | 0,78 | 0,68 | 0,03 | 0,02 |
| Conceptos reservados | 0,71 | 0,60 | −0,03 | −0,02 |
| Patrones de capas reservados | 0,57 | 0,35 | 0,01 | −0,01 |
| Patrones de tokens reservados | 0,66 | 0,30 | 0,02 | 0,03 |
| Tres ediciones a la vez | 0,60 | 0,66 | 0,00 | −0,01 |
| Concepto, redaccion y patron de capas reservados | 0,49 | 0,33 | −0,01 | 0,00 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, por lo que no se pueden comparar cifras de capacidad general con otros modelos.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 8 GB solo para los pesos del modelo base de 4.000 millones de parametros, mas el adaptador (0,3 GB) y la cache KV, que crece de forma lineal con la longitud de contexto; con ventanas largas conviene reservar 16-24 GB.
- VRAM en cuantizacion de 4 bits: alrededor de 2,5-3 GB para los pesos, aunque la ficha no publica pesos cuantizados y habria que cuantizar el modelo base y fusionar el adaptador.
- GPU recomendadas para servicio con batching: A100 40/80 GB o H100; para desarrollo individual, RTX 4090 (24 GB) o RTX A6000 (48 GB).
- GPU de consumo: cabe en RTX 3090/4090 en bfloat16 y en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 en 4 bits, con contexto reducido.
- Despliegue: transformers + PEFT es la via documentada (`PeftModel.from_pretrained`); vLLM admite adaptadores LoRA, y llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF. TGI no esta documentado para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles. El modo thinking anade tokens de plan antes de cada respuesta, lo que incrementa el coste por peticion respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Proposito | Contexto | Licencia |
|---|---|---|---|---|
| Sauers/qwen3-4b-magician (este) | ~4.000 M (base) + LoRA rango 32 | Edicion aprendida de representaciones internas + respuesta | Hereda el del base Qwen3-4B | apache-2.0 |
| Qwen/Qwen3-4B (base) | ~4.000 M | Generacion de texto y razonamiento general | 32.768 tokens nativos (131.072 con YaRN) | apache-2.0 |
| Qwen/Qwen3-8B | ~8.000 M | Generacion de texto y razonamiento general, mayor capacidad | no disponible en la informacion proporcionada | apache-2.0 |
| Qwen/Qwen3-1.7B | ~1.700 M | Generacion de texto en entornos con poca VRAM | no disponible en la informacion proporcionada | apache-2.0 |

No se han identificado en la informacion disponible otros adaptadores publicos de steering aprendido comparables en tamano y planteamiento; las alternativas de la misma categoria funcional (vectores de direccion aplicados manualmente en tiempo de inferencia) no se han podido verificar con datos publicos en esta busqueda.

## Limitaciones y advertencias

- El cambio logrado no es completo: el share maximo es 0,78 y baja a 0,49 cuando se reservan simultaneamente concepto, redaccion y patron de capas; en patrones de tokens reservados la correlacion cae a 0,30.
- El adaptador solo esta entrenado con 135 conceptos; los 180 nombres del fichero de direcciones incluyen conceptos no usados en entrenamiento, y el comportamiento fuera de ese vocabulario no esta garantizado.
- Requiere modo thinking: sin el bloque de plan el comportamiento descrito no se sostiene, y el plan anade latencia y tokens de salida.
- Depende del modelo base: hay que cargar Qwen3-4B y aplicar el adaptador con PEFT; no es un checkpoint autonomo y su licencia apache-2.0 se suma a la del modelo base.
- La perdida KL solo se calcula sobre la pregunta, no sobre la respuesta completa, por lo que no hay garantia formal de que la capacidad general del modelo base se preserve fuera de ese contexto.
- No hay datos publicados sobre sesgos, toxicidad, tasas de alucinacion ni evaluacion multilingue de este adaptador.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la propia model card indica que el texto fue redactado por un modelo (Claude Opus 5.5), lo que exige verificar la receta en el repositorio de GitHub antes de cualquier uso serio.
- No apto como sustituto de un modelo de produccion: es una herramienta de investigacion sobre representaciones internas; usarlo para atencion al cliente, generacion de codigo o agentes no esta validado en la informacion disponible.
- Los resultados de la busqueda web asociados a esta consulta no contienen informacion sobre el modelo y no se han usado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sauers/qwen3-4b-magician
- Repositorio con codigo, receta de entrenamiento, conjuntos de test y figuras: https://github.com/SauersML/magician
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las entradas devueltas tratan sobre comentarios multilinea en Python y no guardan relacion con el modelo.
