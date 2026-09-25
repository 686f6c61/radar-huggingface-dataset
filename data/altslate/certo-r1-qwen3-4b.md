# altslate/certo-r1-qwen3-4b

## Resumen

Certo-R1 (Qwen3-4B) es un ajuste fino supervisado del modelo Qwen/Qwen3-4B desarrollado por el usuario altslate, publicado bajo licencia Apache-2.0. No se trata de un modelo de chat de propósito general, sino del escalón de alta capacidad dentro de una cascada de decisión denominada Certo: un decisor ligero resuelve los casos de alta confianza y solo los casos de baja confianza se derivan a este modelo, que responde con un razonamiento breve de una o dos frases terminado en una línea `FINAL ANSWER: <letra>`.

Tecnicamente es un LoRA de rango 16 fusionado en los pesos del modelo base, por lo que conserva la arquitectura transformer densa de Qwen3-4B y sus 4.022.468.096 parámetros totales (aproximadamente 4,02 mil millones, en bfloat16). El repositorio ocupa 8,1 GB y se distribuye en safetensors, con integración directa en transformers y compatibilidad declarada con text-generation-inference.

Su relevancia actual es de tipo práctico y económico: el autor reporta que, sobre diez familias de decisiones cortas de cálculo y composición, el modelo es no inferior al razonamiento verboso completo dentro de un margen pre-registrado de −0,03, mientras genera unas quince veces menos tokens (≈32 frente a ≈489 en mediana) y reduce la latencia enrutada aproximadamente ocho veces en media y once veces en p95. Es, por tanto, una pieza de infraestructura para sistemas de decisión, no un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) con adaptación LoRA de rango 16 fusionada en los pesos |
| Parametros totales | 4.022.468.096 (≈4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors (bfloat16); el autor no distribuye variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 8,1 GB), libreria transformers |

Datos adicionales de la ficha: pipeline `text-generation`, revision del modelo base `1cfa9a72…`, tags `certo`, `reasoning`, `concise-reasoning`, `decision`, `cascade`, `conversational`, `endpoints_compatible`, `text-generation-inference`, y un fichero `certo_manifest.json` con la procedencia completa de entrenamiento y evaluacion, junto con los hashes.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B, un transformer denso de tipo decoder-only. Sobre esos pesos, el autor aplica un ajuste fino LoRA de rango 16 que despues fusiona en los pesos base, de modo que en inferencia no hay adaptadores adicionales ni sobrecoste de parámetros: el modelo cargado tiene exactamente el mismo tamaño que Qwen3-4B (4,02 B de parámetros) y se carga con `AutoModelForCausalLM` en `bfloat16` con `device_map="auto"`.

El entrenamiento se realizo sobre racionales deterministicos verificados por un oraculo y concisos por construccion, es decir, no se optimizo para producir cadenas de razonamiento largas sino respuestas breves y verificables. El autor es explicito en que la evidencia de calidad no es la perdida de entrenamiento, sino la generalizacion en un conjunto retenido de diez familias cortas de calculo y composicion: temporal y de descanso, umbrales, facturacion, fechas, multi-salto, excepciones anidadas, evidencia faltante, recurrencia de calendario, multi-entidad y espacial. La decodificacion prevista es greedy (temperatura 0) con un limite de 96 tokens nuevos y `enable_thinking=False` en la plantilla de chat, lo que refuerza el caracter determinista y de baja varianza del escalon.

Como innovacion destacable no hay cambios arquitectonicos, sino de flujo: el modelo esta disenado para operar detras de un decisor calibrado dentro de una cascada, con salida normalizada mediante la marca `FINAL ANSWER:`. El prompt de referencia incluye el contexto, las opciones etiquetadas A/B/C y la instruccion explicita de razonar como maximo en dos frases cortas.

## Capacidades

- Razonamiento corto y verificado sobre decisiones de calculo y composicion: responde en una o dos frases y cierra con `FINAL ANSWER: <letra>`.
- Seleccion entre opciones multiples etiquetadas (A/B/C…) en tareas con contexto estructurado y reglas explicitas.
- Resolucion de calculos temporales: husos horarios, periodos de descanso, plazos y recurrencia de calendario.
- Evaluacion de umbrales y reglas de facturacion o elegibilidad.
- Razonamiento multi-salto y con excepciones anidadas dentro de las familias evaluadas.
- Deteccion de evidencia faltante: la familia `missing-evidence` esta entre las validadas por el autor.
- Razonamiento multi-entidad y espacial en el conjunto de familias retenidas.
- Modo de respuesta concisa por construccion, con salida determinista en decodificacion greedy.
- Integracion con transformers, text-generation-inference y endpoints compatibles (segun los tags del repositorio).
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento explicito. El autor indica expresamente que no es un modelo de chat autonomo.

## Casos de uso

- Escalado en cascada de decisiones: el decisor ligero de Certo atiende la mayoria confiada y deriva a Certo-R1 solo los casos de baja confianza. Es el uso para el que fue entrenado y validado, y el que justifica sus ≈32 tokens de salida en mediana.
- Validacion de periodos de descanso laboral: el ejemplo de la model card comprueba si un cambio de turno respeta un minimo de once horas de descanso real entre husos horarios (fin a las 20:00 UTC, inicio a las 06:00 CET del dia siguiente). Encaja en planificacion de turnos y cumplimiento normativo.
- Verificacion de umbrales y facturacion: comprobar si un importe, un consumo o un tramo supera el limite contractual aplicable, con salida binaria o de opcion multiple apta para consumo programatico.
- Calculo de plazos y fechas limite: determinar si un vencimiento, una renovacion o una fecha de corte se cumple segun reglas de calendario, incluida la familia de recurrencia evaluada.
- Enrutamiento de tickets y solicitudes con reglas de negocio: clasificar el caso correcto entre opciones predefinidas cuando hay condiciones anidadas o excepciones.
- Auditoria y trazabilidad de decisiones automatizadas: al emitir solo una o dos frases y una etiqueta final, el registro de auditoria es compacto y el coste de almacenar y revisar trazas se reduce frente a cadenas de razonamiento largas.
- Logistica y asignacion multi-entidad o espacial: resolver si una entidad o ubicacion cumple un conjunto de condiciones frente a alternativas etiquetadas.
- Sistemas sensibles a la latencia: con las cifras reportadas (≈8× menos latencia en media y ≈11× en p95 frente a razonamiento verboso enrutado), es adecuado cuando el presupuesto por peticion es ajustado y se necesita una respuesta determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor reporta exclusivamente la evaluacion de no inferioridad frente a razonamiento verboso completo sobre un conjunto retenido de diez familias cortas de calculo y composicion:

| Metrica | Valor reportado |
|---|---|
| Margen de no inferioridad pre-registrado | −0,03 |
| Diferencia de la cascada (Δ) | +0,004 |
| Intervalo de confianza al 95% | [−0,004, +0,012] |
| Conclusion | No inferior a razonamiento verboso completo |
| Tokens generados (mediana) | ≈32 frente a ≈489 del razonamiento completo (≈15× menos) |
| Latencia enrutada (media) | ≈8× menor |
| Latencia enrutada (p95) | ≈11× menor |
| Decodificacion | Greedy, temperatura 0, `max_new_tokens=96` |

La evidencia declarada es la generalizacion en el conjunto retenido, no la perdida de entrenamiento. No hay datos publicos de throughput absoluto ni de latencia en milisegundos.

## Requisitos de hardware

- Peso de los pesos en bfloat16: ≈8,04 GB (4.022.468.096 parametros × 2 bytes), coherente con el tamano de repositorio de 8,1 GB. En fp16 el requisito es identico.
- VRAM estimada: ≈9-10 GB en bfloat16/fp16 contando pesos, cache KV y overhead de runtime; ≈5-6 GB en cuantizacion de 8 bits; ≈3-4 GB en cuantizacion de 4 bits (estas ultimas requieren convertir los pesos, ya que el autor no las publica).
- GPU consumer: cabe holgadamente en RTX 3090 / 4090 (24 GB), RTX 4080 / 4070 Ti Super (16 GB) y RTX 3060 12 GB o 4060 Ti 16 GB en bfloat16 con contexto moderado. En tarjetas de 8 GB solo es viable con cuantizacion.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S son adecuadas para servir con batching concurrente; el modelo es pequeno para estas tarjetas, por lo que el interes esta en la concurrencia, no en la capacidad.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained(..., torch_dtype="bfloat16", device_map="auto")`), text-generation-inference (tag declarado), endpoints compatibles con text-generation-inference y, previa conversion de pesos, llama.cpp u Ollama con cuantizacion GGUF.
- Latencia y throughput absolutos: no disponibles. Solo se conocen las reducciones relativas frente a razonamiento verboso (≈8× en media, ≈11× en p95) en la configuracion de cascada evaluada por el autor.
- Nota de operacion: al usar decodificacion greedy con `do_sample=False` y un tope de 96 tokens nuevos, el consumo por peticion es acotado y predecible, lo que facilita dimensionar el servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| altslate/certo-r1-qwen3-4b | 4,02 B | No disponible | LoRA r16 fusionado, razonamiento conciso para cascada de decision | Apache-2.0 | HuggingFace, safetensors |
| Qwen/Qwen3-4B (base) | 4,02 B | No disponible en la informacion proporcionada | Transformer denso de proposito general, con modo de pensamiento | Apache-2.0 | HuggingFace |
| Ali-Yaser/Qwen3-R1-4B | No disponible | No disponible | Ajuste fino orientado a matematicas y razonamiento (la model card menciona Qwen3-8B Instruct como base, dato inconsistente con el nombre) | No disponible | HuggingFace |

La comparacion con el modelo base es el contraste mas informativo: Certo-R1 no anade parametros ni cambia la arquitectura, sino que restringe el comportamiento hacia respuestas cortas y deterministas con una etiqueta de respuesta final parseable. Frente a otros ajustes de razonamiento de la misma familia, la diferencia es el objetivo de despliegue: Certo-R1 se posiciona como escalon de una cascada y no como modelo conversacional autonomo.

## Limitaciones y advertencias

- Alcance restringido: la validacion cubre diez familias cortas de decision (temporal y descanso, umbrales, facturacion, fechas, multi-salto, excepciones anidadas, evidencia faltante, recurrencia de calendario, multi-entidad y espacial). No esta validado en documentos largos ni en familias fuera de ese conjunto.
- No es un modelo de chat autonomo. El propio autor lo describe como modelo de escalado en cascada detras de un decisor calibrado; usarlo como asistente general queda fuera del alcance declarado.
- Salida altamente estructurada: el consumidor debe parsear la linea `FINAL ANSWER: <letra>`. Si el formato se rompe, la respuesta no es utilizable sin una capa de validacion adicional.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad, tasas de error ni analisis de calibracion fuera del conjunto retenido. En produccion conviene acompanarlo de verificacion externa de la decision.
- Sesgos: no se ha publicado informacion sobre composicion del dataset, representatividad linguistica ni evaluaciones de sesgo. No disponible.
- Idiomas soportados: no disponible. El entrenamiento se describe sobre racionales verificados, sin detalle de cobertura multilingue; el ejemplo de la model card esta en ingles.
- Contexto: la longitud de contexto efectiva no se especifica en la informacion proporcionada. Al derivar de Qwen3-4B, el limite practico es el del modelo base, pero no hay confirmacion del autor ni evaluacion con entradas largas.
- Cuantizaciones: el autor no publica GGUF, AWQ ni GPTQ. Cualquier despliegue cuantizado implica conversion propia y perdida de garantias sobre el comportamiento validado.
- Licencia: Apache-2.0 permite uso comercial, pero el creditodel modelo base corresponde al equipo Qwen y cualquier redistribucion debe respetar esa licencia.
- Madurez: el repositorio registra cero descargas y cero likes en el momento de la consulta, y no se han localizado papers ni evaluaciones independientes. La evidencia de rendimiento procede unicamente del autor y de un unico conjunto retenido.
- Reproducibilidad: el autor remite a `certo_manifest.json` para la procedencia completa y los hashes; conviene revisarlo antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/altslate/certo-r1-qwen3-4b
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Ajuste fino relacionado encontrado en la busqueda (no es el mismo modelo): https://huggingface.co/Ali-Yaser/Qwen3-R1-4B
- Paper, blog o demo del autor: no disponible en la informacion proporcionada.
