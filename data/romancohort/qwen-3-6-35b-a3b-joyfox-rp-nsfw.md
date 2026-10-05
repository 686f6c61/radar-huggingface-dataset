# RomanCohort/Qwen-3.6-35B-A3B-joyfox-RP-NSFW

## Resumen

Qwen-3.6-35B-A3B-joyfox-RP-NSFW es un adaptador LoRA (no un modelo fusionado) publicado por el usuario RomanCohort sobre el modelo base JoyFox-Qwen3.6-35B-A3B-RP-Aggressive. Su proposito es especializar un modelo MoE de gran tamano en roleplay adulto (18+) en chino, con respuestas de 800-1000 caracteres por turno, narracion en tercera persona dirigida al usuario como 「你」, dialogo entre comillas y acciones opcionalmente envueltas en `*beats*` segun el system prompt.

El repositorio se declara explicitamente como trabajo en curso: el adaptador del primer entrenamiento no supero la suite de evaluacion del autor y no se publico, y el segundo entrenamiento estaba en marcha en el momento de redactar la ficha. Por tanto, la relevancia tecnica actual del repositorio es mas metodologica que practica: documenta con detalle un fallo de fine-tuning reproducible (el modelo aprendio longitud y formato, no contenido) en un MoE de ~35B, junto con las correcciones aplicadas.

Se distribuye como adaptador PEFT con rango 16, alpha 32 y dropout 0.05, entrenado con enmascarado de perdida solo sobre la respuesta y ventana deslizante de 384 tokens. El idioma declarado es unicamente chino y la licencia es "other" (heredada de las licencias del modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer MoE. Modulos objetivo: `q_proj, k_proj, v_proj, o_proj, in_proj_qkv, in_proj_z, out_proj` |
| Parametros totales | no disponible para el adaptador (r=16, alpha=32). El nombre del modelo base indica ~35 000 millones de parametros totales |
| Parametros activos | ~3 000 millones, inferidos del sufijo "A3B" del nombre del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible para el modelo base. La ventana de entrenamiento del adaptador fue de 384 tokens deslizantes |
| Tipos de cuantizacion | no disponible para el adaptador. Se declara base en bf16; las cuantizaciones aplicables dependen del modelo base |
| Idiomas soportados | chino (zh) |
| Licencia | other, "see-base-model-licenses" (heredada del modelo base; uso comercial sin verificar) |
| Formato de pesos | adaptador LoRA gestionado con PEFT (`library_name: peft`); formato de fichero exacto no especificado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base MoE cuya nomenclatura ("35B-A3B") sugiere aproximadamente 35 000 millones de parametros totales con unos 3000 millones activos por token, y cuya etiqueta `moe` aparece en los tags del repositorio. Los modulos objetivo incluyen `in_proj_qkv`, `in_proj_z` y `out_proj`, propios de bloques de atencion lineal o hibrida en lugar de atencion completa clasica; esta observacion es una inferencia a partir de los nombres de modulo y no esta confirmada en la informacion disponible. Se trata de un adaptador LoRA con rango 16, alpha 32 y dropout 0.05, entrenado en bf16 con enmascarado de perdida solo sobre la respuesta (response-only loss masking) sobre una ventana deslizante de 384 tokens.

El corpus de entrenamiento procede de una coleccion publica de erotica china, en gran parte publicaciones impresas de los anos 90 y 2000 escaneadas y digitalizadas con OCR, mas guiones de novelas visuales y registros de chat de roleplay. Antes del entrenamiento se descarto el 23,8% de las filas de origen: cualquier edad declarada o implicita inferior a 18 anos, marcadores de curso escolar y descriptores de "no desarrollado", ademas de bestialidad y contenido de mutilacion o snuff. Se retuvieron contenido sexual explicito entre adultos, escenarios de incesto y escenarios no consentidos o coercitivos, que segun el autor constituyen una parte importante del corpus. La dosis de contenido explicito se midio sobre tokens supervisados (25,02 impactos por 1000 tokens frente a 23,3 por 1000 de la referencia objetivo). No se menciona RLHF ni DPO.

El apartado metodologico es el mas relevante: el primer run (r=16, lr 1e-4, 187 pasos) fallo porque el corpus contenia secuencias de repeticion que habian superado una limpieza anterior (un 12-grama repetido 166 veces, 64 gemidos consecutivos). La perdida se mantuvo en 2,0-3,6 durante todo el entrenamiento mientras el modelo aprendia a rellenar su cuota de 900 caracteres con una linea repetida. Las correcciones del run 2 fueron: colapso de repeticiones en todo el corpus (de 124 a 0 filas con un 12-grama repetido 4 o mas veces), 6,5% de ensayo de salida estructurada y reduccion del learning rate a 5e-5.

## Capacidades

- Generacion de texto en chino con registro narrativo y convenciones de roleplay: narracion en tercera persona, usuario referido como 「你」, dialogo entre comillas y acciones en `*beats*`.
- Produccion de respuestas largas por turno, con una mediana de referencia de 901 caracteres y 18 lineas en 54 turnos reales del estilo objetivo.
- Contenido adulto explicito entre personajes adultos, con reproduccion de las dinamicas de consentimiento presentes en el corpus.
- Adaptacion al system prompt en lo relativo al formato de salida (uso o no de `*beats*`), medido en la suite de cumplimiento de formato.
- Capacidad residual de salida estructurada del modelo base (JSON, pares clave-valor), degradada por el run 1 y reforzada con ensayo explicito en el run 2.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo chino declarado; no se documentan capacidades en otros idiomas.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible en la informacion proporcionada.
- La propia model card indica que el modelo "no esta ajustado para seguridad ni filtrado de contenido".

## Casos de uso

- Roleplay adulto en chino para un unico usuario en inferencia local: es el caso de uso declarado por el autor, con turnos de 800-1000 caracteres y control del formato mediante system prompt.
- Estudio de metodos de evaluacion de fine-tuning: las dos suites descritas (health probe de 10 prompts fijos con decodificacion greedy, y suite de cumplimiento de formato de 21 prompts en cinco grupos) son reutilizables para cualquier adaptador de roleplay, porque demuestran que la perdida no es un veredicto.
- Analisis de priors de repeticion en MoE grandes: el caso del run 1 documenta como un corpus con 12-gramas repetidos produce un 87% de tasa de bucles manteniendo una perdida nominal de 2,0-3,6, y como se corrige el corpus antes de reentrenar.
- Evaluacion de pipelines de filtrado de contenido: el autor documenta el 23,8% de filas descartadas, los criterios exactos del filtro y el riesgo residual admitido, lo que sirve como caso de estudio de las limitaciones de un filtro basado en marcadores explicitos.
- Prototipado de guiones de novelas visuales en chino: el corpus incluye guiones de VN y el modelo base esta especializado en personajes, de modo que puede usarse para generar borradores de dialogo con formato consistente.
- Escritura creativa adulta asistida en chino con restricciones de longitud y formato: util para autores que necesiten un borrador ajustado a una convencion tipografica concreta (por ejemplo, sin uso de `（）` ni `「」`, que aparecen 0 veces en 54 turnos de referencia).
- Reentrenamiento o ablation de LoRA sobre modelos base ya ajustados: el repositorio documenta hiperparametros concretos (r=16, alpha=32, dropout=0.05, lr 1e-4 -> 5e-5, 384 tokens de ventana) que sirven como punto de partida reproducible.

## Benchmarks y rendimiento

Resultados publicados por el autor para el run 1 (r=16, lr 1e-4, 187 pasos). Ese adaptador fallo la evaluacion y no se publica; se incluye porque es el unico conjunto de datos de rendimiento disponible. El run 2 no tenia resultados en el momento de redactar la ficha.

| Metrica | Modelo base | Adaptador run 1 |
|---|---|---|
| Cumplimiento de formato, convenciones entrenadas | 50% | 83% |
| Cumplimiento de formato, JSON / KV | 100% | 50% / 0% |
| Impactos de contenido explicito por 1000 tokens con prompts explicitos | 0,00 | 0,00 |
| Tasa de bucles | 4,3% | 87,0% |
| Longitud mediana de respuesta | 40 caracteres | 932 caracteres |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark estandar en la informacion disponible. No se publican tampoco resultados del adaptador del run 2.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parametros del modelo base (~35B), no datos publicados por el autor.

- Inferencia en bf16: ~70 GB solo para pesos, mas cache KV y activaciones. Requiere H100 80 GB, A100 80 GB o configuracion multi-GPU.
- Inferencia en 8 bits: ~35-40 GB. Encaja en A6000 48 GB, L40S 48 GB o dos RTX 4090 en paralelo.
- Inferencia en 4 bits (NF4 / Q4): ~18-22 GB. Cabe, con poco margen, en RTX 4090 24 GB, RTX 3090 24 GB o L4 24 GB.
- No cabe en GPUs de 16 GB o menos sin cuantizaciones mas agresivas.
- Con ~3B parametros activos por token, la velocidad de decodificacion de un MoE de este tipo es notablemente superior a la de un modelo denso de 35B, aunque no se proporcionan medidas de latencia ni throughput en la informacion disponible.
- Despliegue via `transformers` + `peft` tal como indica la model card (carga del base por separado y del adaptador encima).
- vLLM soporta adaptadores LoRA y es la opcion natural para servir el modelo base con el adaptador; TGI tambien admite adaptadores.
- llama.cpp y Ollama requieren fusionar el adaptador en el base y convertir a GGUF, ya que consumen pesos fusionados, no adaptadores PEFT.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-3.6-35B-A3B-joyfox-RP-NSFW | Adaptador LoRA sobre MoE | Adaptador r=16; base ~35B (A3B) | no disponible (entrenamiento a 384 tokens) | other, heredada del base | Repositorio creado, adaptador aun no publicado (run 2 en curso) |
| JoyFox-Qwen3.6-35B-A3B-RP-Aggressive | Modelo base ajustado para roleplay | ~35B totales, ~3B activos (segun nomenclatura) | no disponible | no disponible | Es el punto de partida del adaptador |
| Adaptador run 1 del mismo autor | LoRA descartado | r=16 | 384 tokens de entrenamiento | no aplica, no publicado | No publicado |

No se dispone de informacion sobre otros adaptadores comparables de la misma categoria (roleplay adulto en chino sobre MoE de ~35B) en la informacion proporcionada, por lo que la comparativa externa queda como no disponible.

## Limitaciones y advertencias

- Estado del artefacto: el repositorio es un objetivo de publicacion, no una release funcional. El unico adaptador entrenado hasta la fecha no supero la evaluacion y no se ha publicado. La descarga del repositorio no garantiza la obtencion de un adaptador utilizable.
- Riesgo residual de edad, declarado por el propio autor: el filtro se basa en marcadores explicitos (edad declarada, palabras de curso escolar, "未发育"). Un personaje sin edad declarada pero escrito como menor no es detectable por el filtro. Se identificaron al menos dos filas de este tipo que no pudieron excluirse programaticamente. La garantia real es "nada explicitamente menor de edad", no "adulto verificado en todo el corpus".
- Contenido retenido y por tanto reproducible: incesto y relaciones familiares, y escenarios no consentidos o coercitivos, ambos descritos como una parte importante del corpus.
- El modelo no esta ajustado para seguridad ni filtrado. Reproduce el tono y las dinamicas de consentimiento de su corpus.
- Sesgos: el modelo base es un ajuste de roleplay y el corpus es una coleccion de erotica china de los anos 90-2000, con los sesgos de genero, orientacion y dinamicas de poder propios de esa fuente.
- Alucinacion: no se documentan medidas especificas. La model card incide en el riesgo inverso (degeneracion por repeticion) como fallo observado, con una tasa de bucles del 87% en el run descartado.
- Degradacion del cumplimiento de formato fuera de distribucion: el run 1 paso de 100% a 50% en JSON y de 100% a 0% en pares clave-valor. Cualquier uso que requiera salida estructurada debe verificarse antes de produccion.
- Limitacion idiomatica: solo chino declarado. No se documenta rendimiento en castellano ni en otros idiomas.
- Licencia: "other" con `license_name: see-base-model-licenses`. El uso comercial depende de las licencias del modelo base, que no se detallan en la informacion disponible. Debe verificarse antes de cualquier despliegue.
- Procedencia de los datos sin resolver: las obras subyacentes son de terceros y su estado de copyright no esta verificado. El dataset derivado no se redistribuye, solo los pesos del adaptador.
- Repositorio marcado como `not-for-all-audiences`. Su uso y su contenido estan restringidos a adultos y a entornos de inferencia local de un unico usuario segun la intencion declarada.
- Sin datos de benchmarks estandar: no hay MMLU, HumanEval ni GSM8K, de modo que no es posible situar el modelo frente a alternativas generalistas por rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RomanCohort/Qwen-3.6-35B-A3B-joyfox-RP-NSFW
- Modelo base referenciado: JoyFox-Qwen3.6-35B-A3B-RP-Aggressive (no se proporciona URL en la informacion disponible)
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada
