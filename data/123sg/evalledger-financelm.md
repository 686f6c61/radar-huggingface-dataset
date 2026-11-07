# 123sg/EvalLedger-FinanceLM

## Resumen

EvalLedger-FinanceLM es un checkpoint publicado en Hugging Face por el usuario 123sg bajo el identificador `123sg/EvalLedger-FinanceLM`. La model card lo presenta como FinanceLM-7B, un modelo de la familia Qwen2 (según los tags del repositorio) orientado al analisis de documentos financieros, el razonamiento sobre datos tabulares y la respuesta a preguntas de caracter regulatorio. El repositorio esta etiquetado con los terminos `finance` y `evaluation`, lo que sugiere que su proposito principal es servir como objeto de evaluacion dentro de un harness de benchmarks denominado EvalLedger.

La informacion disponible es muy limitada: el tamano del repositorio es de 0.0 GB, no se han publicado pesos descargables, no consta ningun dato sobre volumen de entrenamiento, composicion del dataset ni proceso de alineacion, y el modelo acumula cero descargas y cero likes en el momento de la consulta. La model card incluye una tabla de resultados de benchmarks que, sin embargo, presenta valores identicos (0.548, 0.561, 0.572) para las columnas Base-7B, Chat-7B y FinanceLM-3B en las quince tareas evaluadas, lo que impide tratarlos como mediciones independientes fiables.

Por tanto, esta ficha debe interpretarse como una descripcion de un artefacto de evaluacion mas que de un modelo listo para produccion. Los datos tecnicos que no aparecen explicitamente en la informacion proporcionada se marcan como no disponibles, y las cifras de rendimiento se reproducen tal cual figuran en la model card, con las advertencias correspondientes sobre su consistencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (segun tag `qwen2`) |
| Parametros totales | 7B (denominacion FinanceLM-7B; no se detalla el conteo exacto) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB, sin pesos publicados) |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible proviene de los tags del repositorio, que identifican el modelo como `qwen2` y `transformers`, es decir, un transformer decoder-only de la familia Qwen2 con pesos en formato PyTorch. La model card indica que los checkpoints de la release proceden de una misma ejecucion de preentrenamiento y que difieren unicamente en el numero de pasos de optimizacion recibidos, lo que apunta a una publicacion de tipo intermedio o experimental dentro de un proceso de entrenamiento mas amplio.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card menciona un "evaluation harness" separado que puntua cada checkpoint sobre quince suites de benchmarks y que el modelo publicado corresponde a la ejecucion seleccionada por el proceso de release, pero no se detalla ni el harness ni los criterios de seleccion.

## Capacidades

- Generacion de texto en el dominio financiero, segun la descripcion de la model card.
- Analisis de documentos financieros.
- Razonamiento sobre datos tabulares.
- Respuesta a preguntas de caracter regulatorio.
- Las quince tareas listadas en la tabla de evaluacion (razonamiento matematico, razonamiento logico, sentido comun, comprension lectora, question answering, clasificacion de texto, analisis de sentimiento, generacion de codigo, escritura creativa, generacion de dialogo, resumen, traduccion, recuperacion de conocimiento, seguimiento de instrucciones y evaluacion de seguridad) figuran como suites evaluadas, no necesariamente como capacidades verificadas del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Analisis de informes financieros: el modelo esta declarado para el analisis de documentos financieros, por lo que podria emplearse en la extraccion y sintesis de magnitudes contables a partir de memorias anuales y estados financieros, siempre que se validen los pesos y el contexto real disponible.
- Razonamiento sobre tablas financieras: su orientacion a datos tabulares lo hace candidato para responder consultas sobre balances, cuentas de resultados y series temporales de magnitudes economicas en entornos de analisis interno.
- Respuesta a preguntas regulatorias: la model card lo describe para question answering regulatorio, lo que permitiria construir asistentes internos de consulta sobre normativa financiera, con revision humana obligatoria dada la ausencia de datos de entrenamiento y de evaluacion de sesgos.
- Evaluacion comparativa de checkpoints: dado su origen como artefacto de un harness de evaluacion (EvalLedger), puede utilizarse como referencia en pipelines de evaluacion de modelos financieros, comparando su comportamiento frente a otros checkpoints de la misma ejecucion.
- Clasificacion y analisis de sentimiento en textos economicos: las suites de clasificacion y sentimiento aparecen en su tabla de evaluacion, de modo que podria probarse en tareas de etiquetado de noticias financieras o comunicados de resultados, previa validacion empirica.
- Resumen de documentacion extensa: la tarea de summarization figura entre las evaluadas, lo que abre un uso potencial en la condensacion de prospectos, informes trimestrales y documentacion de productos financieros, condicionado a conocer la ventana de contexto real, actualmente no disponible.
- Generacion de codigo para analisis cuantitativo: la suite de code generation aparece en la tabla, por lo que podria explorarse su uso en la generacion de scripts de analisis de datos financieros, sin garantias de calidad en ausencia de pesos publicados.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la tabla incluida en la model card. Se reproducen a continuacion tal cual, advirtiendo que las columnas Base-7B, Chat-7B y FinanceLM-3B comparten exactamente los mismos valores en las quince tareas, lo que sugiere un problema de cumplimentacion de la tabla o una evaluacion no independiente.

| Categoria | Benchmark | Base-7B | Chat-7B | FinanceLM-3B | FinanceLM-7B |
|---|---|---|---|---|---|
| Core reasoning | Math reasoning | 0.548 | 0.561 | 0.572 | 0.622 |
| Core reasoning | Logical reasoning | 0.548 | 0.561 | 0.572 | 0.892 |
| Core reasoning | Common sense | 0.548 | 0.561 | 0.572 | 0.827 |
| Language understanding | Reading comprehension | 0.548 | 0.561 | 0.572 | 0.776 |
| Language understanding | Question answering | 0.548 | 0.561 | 0.572 | 0.710 |
| Language understanding | Text classification | 0.548 | 0.561 | 0.572 | 0.901 |
| Language understanding | Sentiment analysis | 0.548 | 0.561 | 0.572 | 0.879 |
| Generation | Code generation | 0.548 | 0.561 | 0.572 | 0.731 |
| Generation | Creative writing | 0.548 | 0.561 | 0.572 | 0.679 |
| Generation | Dialogue generation | 0.548 | 0.561 | 0.572 | 0.732 |
| Generation | Summarization | 0.548 | 0.561 | 0.572 | 0.838 |
| Specialized | Translation | 0.548 | 0.561 | 0.572 | 0.891 |
| Specialized | Knowledge retrieval | 0.548 | 0.561 | 0.572 | 0.771 |
| Specialized | Instruction following | 0.548 | 0.561 | 0.572 | 0.838 |
| Specialized | Safety evaluation | 0.548 | 0.561 | 0.572 | 0.832 |

La model card no identifica las suites concretas (MMLU, HumanEval, GSM8K u otras) ni las metricas empleadas, y no se han publicado resultados adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia generica para un modelo de 7B en precision completa (FP16) serian necesarios aproximadamente 14-16 GB de VRAM, y en cuantizacion de 4 bits alrededor de 4-6 GB, pero estos valores no proceden de la model card y no pueden confirmarse sin pesos publicados.
- GPU recomendadas: no disponible. Para un 7B en FP16 serian adecuadas GPU con 16 GB o mas (RTX 4090, A100, H100), pero no consta validacion por parte del autor.
- Compatibilidad con GPU de consumo: no confirmada, dado que el repositorio figura con 0.0 GB y no hay pesos descargables.
- Opciones de despliegue: el repositorio declara compatibilidad con `transformers` y `text-generation-inference` (`endpoints_compatible`), lo que sugiere despliegue mediante TGI o el endpoint de Hugging Face. No hay informacion sobre soporte en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa fiable. La propia model card menciona variantes Base-7B, Chat-7B y FinanceLM-3B, pero sus cifras son identicas entre si en las quince tareas, por lo que no permiten una comparacion significativa. Como referencia de categoria, un modelo financiero de 7B de la familia Qwen2 podria compararse con otros modelos de dominio financiero de tamano similar, pero no se dispone de sus especificaciones ni resultados dentro de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EvalLedger-FinanceLM (FinanceLM-7B) | 7B (declarado) | no disponible | Apache-2.0 | Repositorio sin pesos (0.0 GB) |
| FinanceLM-3B (mencionado en la model card) | 3B (declarado) | no disponible | no disponible | no disponible |
| Base-7B / Chat-7B (mencionados en la model card) | 7B (declarado) | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de pesos publicados: el repositorio figura con un tamano de 0.0 GB, por lo que no es posible descargar ni ejecutar el modelo en el momento de la consulta.
- Tabla de benchmarks no fiable: las columnas Base-7B, Chat-7B y FinanceLM-3B presentan valores identicos en las quince tareas, lo que indica un posible error de cumplimentacion o una evaluacion no independiente; las cifras de FinanceLM-7B no deben tomarse como validacion externa.
- Falta de informacion sobre entrenamiento: no se detalla el volumen de tokens, la composicion del dataset, ni si hubo fases de SFT, RLHF o DPO, lo que impide evaluar sesgos y calidad.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; en dominio financiero y regulatorio este riesgo es especialmente critico y requiere validacion humana.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan informados.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero la ausencia de pesos y de documentacion tecnica hace inviable su adopcion en produccion sin informacion adicional del autor.
- Madurez del artefacto: cero descargas y cero likes, creado y actualizado el mismo dia, lo que sugiere un repositorio recien publicado y sin validacion por parte de la comunidad.
- Trazabilidad: la unica referencia externa encontrada es el sitio EvalLedger (https://evaledger.com/), que no aporta documentacion tecnica sobre este checkpoint concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/123sg/EvalLedger-FinanceLM
- EvalLedger (LLM Leaderboard): https://evaledger.com/
