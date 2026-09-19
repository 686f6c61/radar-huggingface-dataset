# logic65/Whittle-Qwen-3.8-35B-A3B

## Resumen

Whittle-Qwen-3.8-35B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) publicado por el autor logic65. Cuenta con 35.562.370.195 parámetros totales, de los cuales 10.000 millones corresponden a una memoria n-gram con hash y el resto a un cuerpo de unos 25,1 B; en inferencia se activan aproximadamente 3 B por token (8 de 180 expertos enrutados más un experto compartido). Adopta el formato de la arquitectura Qwen3.8-Flash-Next, denominado `qwen4_exp`, con hyper-connections, una combinación de gated DeltaNet y atención completa, y una tabla de memoria inyectada antes de la capa 2.

El modelo es un fine-tuning de Whittle-Next-27B-A3B v4.4 y se ha destilado de Qwen3.8-27B con el modo *thinking* activado, transfiriendo además las filas de memoria de la propia tabla de Qwen3.8-Flash-Next. La novedad principal es que, por primera vez en la familia Whittle, la memoria es portante: ponerla a cero degrada de forma medible la entropía cruzada en filas nunca vistas, lo que indica que las capas superiores realmente la utilizan en lugar de haber aprendido a operar sin ella.

Se distribuye como vista previa de investigación, no como destilación terminada: el cuerpo solo ha visto 2.861 pasos sobre 1.840 trazas de profesor (matemáticas y revisión de código) más la transferencia de memoria, y la revisión `lw2` añade 3.624 pasos adicionales. Funciona sobre llama.cpp estándar sin parches, con contexto declarado de 262.000 posiciones, y su licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) en formato Qwen3.8-Flash-Next (`qwen4_exp`): hyper-connections con 4 flujos residuales, gated DeltaNet + atención completa y memoria n-gram con hash |
| Parámetros totales | 35.562.370.195 (35,1 B: 25,1 B de cuerpo + 10,0 B de memoria n-gram) |
| Parámetros activos | ~3 B por token (8 de 180 expertos enrutados + experto compartido; la memoria es una consulta de tabla) |
| Longitud de contexto | 262.000 posiciones (probado hasta 75.000) |
| Tipos de cuantización | GGUF Q8_0 a Q3_K_M (en repositorio aparte); pesos completos en bf16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`), GGUF |
| Modelo base | logic65/Whittle-Next-27B-A3B (v4.4), relación finetune |
| Profesor de destilación | Qwen3.8-27B, modo thinking activado |
| Memoria | 8 cabezas de hash × 4.880.000 filas × 256, bigramas + trigramas, inyectada antes de la capa 2 |
| Cuerpo | 40 capas, hidden 2048, GDN + atención completa |
| Tamaño del repositorio | 142,3 GB |

## Arquitectura y entrenamiento

El modelo combina un cuerpo transformer MoE de 40 capas con hidden 2048 sobre una ruta híbrida de gated DeltaNet y atención completa, y utiliza hyper-connections con cuatro flujos residuales en lugar del residual convencional. El componente diferencial es la memoria n-gram: 8 cabezas de hash, 4.880.000 filas por cabeza y dimensión 256, con entradas de bigramas y trigramas, inyectada antes de la capa 2. Las filas de esta tabla se han transferido desde la tabla del propio Qwen3.8-Flash-Next, copiando los conjuntos de filas exactos por bucket visitado y dejando el resto a cero. El modelo se ejecuta sobre llama.cpp estándar, sin parches.

El entrenamiento parte de Whittle-Next-27B-A3B v4.4 y aplica destilación de conocimiento desde Qwen3.8-27B con el modo thinking activado, usando trazas completas y distribuciones top-128 por posición. La revisión publicada como raíz es `lw2` (paso 3623): la primera entrega (`tbl1`, paso 2861) más 3.624 pasos con un *steer* más fuerte en la capa 35 y entrenamiento con desplazamiento de posición para contexto largo. Los pesos raíz de `tbl1` se conservan sin cambios en `bf16-tbl1/`. La salida de la memoria es aproximadamente 0,28× la norma residual en la capa 2.

## Capacidades

- Generación de texto y conversación en inglés y chino, con etiqueta adicional `multilingual`.
- Razonamiento en modo *thinking*, heredado del proceso de destilación con el profesor en ese modo.
- Matemáticas: la sonda interna sobre problemas de MATH de niveles 2 a 4 obtiene 44/60 en `lw2` y 46/60 en `tbl1`.
- Código: el entrenamiento incluye trazas de profesor de revisión de código, y la memoria aporta una ganancia de +2,84 nats de entropía cruzada en archivos no vistos.
- Recuperación de conocimiento mediante memoria n-gram con hash: desactivar la tabla degrada de forma medible el rendimiento en código, texto general, fichas de ciencia y filas de chat.
- Lectura de entradas largas: `lw2` incorpora entrenamiento con desplazamiento de posición y, según el autor, lee mejor las entradas largas y termina de forma más limpia.
- Ejecución en llama.cpp estándar sin modificaciones, con cuantizaciones GGUF disponibles.
- Tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigación sobre destilación de conocimiento: el modelo sirve como banco de pruebas para medir paridad de logits con el profesor (acuerdo top-1 del 44,5 % en la capa 35 frente a la 59 del profesor, con una masa de profesor del 71,2 %), y para estudiar cómo evoluciona la alineación a lo largo del entrenamiento.
- Estudio de arquitecturas con memoria externa: la tabla n-gram permite medir la dependencia del cuerpo respecto a la memoria mediante la "ganancia de memoria" (entropía cruzada con la tabla a cero menos con la tabla activa), que alcanza +2,84 en código no visto.
- Razonamiento matemático asistido: con el modo thinking y un límite de 6.144 tokens, el modelo resuelve 44 de 60 problemas de MATH de niveles 2 a 4 en una sola muestra, útil para pregenerar soluciones candidatas que luego se filtran.
- Revisión de código en flujos de investigación: al haberse destilado parcialmente sobre trazas de revisión de código y obtener una ganancia de memoria de +2,84 en archivos no vistos, puede emplearse para generar comentarios de revisión que después valida un humano.
- Despliegue local en hardware de gama media: al activar solo ~3 B por token, el modelo se puede servir como GGUF Q8_0 en llama.cpp con tres RTX 3060 y la memoria alojada en RAM del sistema.
- Experimentos de contexto largo: con 262.000 posiciones declaradas y pruebas hasta 75.000, sirve para estudiar degradación de atención y estabilidad de generación en entradas extensas.
- Generación multilingüe en inglés y chino: adecuado para tareas de generación o resumen en esos dos idiomas dentro de entornos de investigación, no para producción multilingüe amplia.

## Benchmarks y rendimiento

Todos los datos proceden del propio autor, medidos con los mismos scripts que la línea base v4.4, y los registros están en el directorio `eval/` del repositorio.

Ganancia de memoria (entropía cruzada con la memoria a cero menos con la memoria activa, en filas nunca entrenadas; positivo indica que el cuerpo necesita la tabla):

| Filas reservadas | tbl1 | lw2 (raíz) |
|---|---|---|
| Código (archivos no vistos) | +2,12 | +2,84 |
| Texto general | +0,22 | +0,67 |
| Fichas de ciencia | +0,03 | +0,41 |
| Filas de chat | +0,017 | +0,08 |

Paridad con el profesor (acuerdo del logit-lens del estudiante con el profesor, 400 filas no vistas de 512 tokens, 3.840 posiciones por par):

| Par | v4.4 | tbl1 | lw2 (raíz) |
|---|---|---|---|
| Estudiante L39 ← profesor L63, acuerdo top-1 / masa de profesor | 87,4 % / 97,2 % | 87,5 % / 97,2 % | 87,4 % / 97,2 % |
| Estudiante L35 ← profesor L59 | 21,2 % / 49,5 % | 40,3 % / 68,7 % | 44,5 % / 71,2 % |

Sonda de matemáticas (60 problemas de MATH de niveles 2 a 4, ninguno en los conjuntos de entrenamiento, modo thinking, muestreador de servicio, tope de 6.144 tokens, una muestra por problema):

| Modelo | Resultado |
|---|---|
| v4.3 | 43/60 |
| tbl1 | 46/60 (nivel 4: 13/20, 4 en el tope) |
| lw2 (raíz) | 44/60 (nivel 2: 18, nivel 3: 14, nivel 4: 12; 5 en el tope) |
| v4.4 | 48/60 |

Entropía cruzada en datos reservados con la memoria activa: tbl1 chat 1,2098 / general 2,1141; lw2 chat 1,2131 / general 2,1304; v4.4 chat 1,2332 / general 2,1218. La brecha de dependencia (entropía cruzada sin la tabla menos con ella, en filas de memoria) es de +1,69 para tbl1 y +1,77 para lw2, con todas las filas cumpliendo el margen de 0,3 nats.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible; los datos anteriores son mediciones internas del autor.

## Requisitos de hardware

- Pesos completos en bf16: el repositorio ocupa 142,3 GB, por lo que requiere del orden de 140 GB o más de almacenamiento y VRAM agregada.
- Estimaciones por cuantización, calculadas a partir de los 35,1 B de parámetros (no publicadas por el autor): Q8_0 ≈ 35 GB, Q4_K_M ≈ 20 GB, Q3_K_M ≈ 17 GB.
- Configuración reportada: GGUF Q8_0 servido en llama.cpp estándar sobre 3× RTX 3060, con la tabla de memoria alojada en RAM del sistema.
- Al activar solo ~3 B de parámetros por token, el cuello de botella es el ancho de banda de memoria y el tamaño de la tabla, no el cómputo, lo que hace viable el despliegue en GPUs de gama media-consumidora repartiendo capas.
- Cabe en GPU de consumo si se reparte entre varias tarjetas o si se aloja la memoria en RAM; con una única GPU consumer solo son realistas cuantizaciones bajas (Q3_K_M o inferiores) y contexto reducido.
- Opciones de despliegue confirmadas: llama.cpp con los GGUF publicados. vLLM, TGI, Ollama y otros motores no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whittle-Qwen-3.8-35B-A3B (este) | 35,1 B (25,1 B cuerpo + 10,0 B memoria) | ~3 B | 262.000 posiciones (probado a 75.000) | Apache 2.0 | Safetensors y GGUF Q8_0–Q3_K_M |
| Whittle-Next-27B-A3B (base) | 27 B según la nomenclatura; no confirmado en la información | no disponible | 262.000 posiciones (heredado) | no disponible | Safetensors |
| Qwen3.8-27B (profesor) | 27 B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | no disponible |

Métricas comparables disponibles del propio linaje: en la sonda de matemáticas, v4.3 obtiene 43/60, tbl1 46/60, este modelo en su revisión raíz 44/60 y v4.4 48/60. En entropía cruzada reservada, v4.4 registra 1,2332 en chat y 2,1218 en texto general, frente a 1,2131 y 2,1304 de este modelo. No hay datos públicos que permitan compararlo con modelos de terceros de tamaño equivalente.

## Limitaciones y advertencias

- Es una vista previa de investigación, no una destilación terminada. El autor indica explícitamente que aún necesita una destilación completa, de dominio amplio y on-policy, con la memoria entrenada conjuntamente sobre muchos más datos.
- El cuerpo solo ha visto 2.861 pasos de entrenamiento sobre 1.840 trazas de profesor (matemáticas y revisión de código) más la transferencia de memoria; la revisión `lw2` añade 3.624 pasos. No es comparable a Qwen3.8 en igualdad de condiciones.
- La memoria contiene únicamente los conjuntos de filas exactos de los buckets visitados; el resto queda a cero. Por tanto, su conocimiento es parcial y la tabla debe servirse siempre completa, ya que el cuerpo depende de ella para recuperar conocimiento.
- En matemáticas, `lw2` cede dos puntos frente a `tbl1` (44 frente a 46 sobre 60). Seis de sus derrotas se debieron a tres respuestas que nunca terminaron, dos de ellas con repetición degenerada dentro de un razonamiento largo, y a tres lecturas erróneas.
- Riesgo de repetición degenerada en cadenas de pensamiento largas, documentado por el propio autor.
- Idiomas: solo inglés, chino y la etiqueta genérica `multilingual`. No hay datos de calidad ni de cobertura en castellano.
- No hay información publicada sobre sesgos, tasas de alucinación ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el estado incompleto de la destilación y la dependencia de una memoria parcialmente transferida desaconsejan su uso en producción.
- El modelo registra 0 descargas y 2 "me gusta" en el momento de la consulta: no cuenta con validación independiente de la comunidad.
- Todos los benchmarks son mediciones internas del autor con sus propios scripts y no han sido replicados por terceros.
- La información disponible sobre soporte de tool calling, agentes, visión o audio no existe, por lo que no deben asumirse esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Repositorio GGUF (Q8_0 a Q3_K_M): https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B-GGUF
- Modelo base Whittle-Next-27B-A3B: https://huggingface.co/logic65/Whittle-Next-27B-A3B
- Modelo Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Apoyo al autor: https://ko-fi.com/davida81328
- La búsqueda web realizada no devolvió enlaces relevantes al modelo; los únicos resultados obtenidos correspondían a páginas municipales de la ciudad alemana de Wittenberge, sin relación con el modelo.
