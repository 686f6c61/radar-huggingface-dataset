# 123sg/EvalLedger-FinanceLM

## Resumen

EvalLedger-FinanceLM es un checkpoint de la familia FinanceLM-7B, publicado por el usuario 123sg en Hugging Face bajo licencia Apache-2.0. Segun la model card, se trata de un modelo entrenado para el analisis de documentos financieros, el razonamiento sobre datos tabulares y la respuesta a preguntas de caracter regulatorio. El repositorio declara la etiqueta `qwen2` en los metadatos de Hugging Face, lo que sugiere una arquitectura derivada de la familia Qwen2, aunque la model card no lo confirma de forma explicita.

La propuesta del autor es una familia de checkpoints generados a partir de una misma ejecucion de preentrenamiento, que difieren unicamente en el numero de pasos de optimizacion recibidos. Un harness de evaluacion independiente puntua cada checkpoint sobre quince suites de benchmark, y la model card reporta la ejecucion seleccionada por el proceso de release.

El interes practico del modelo reside en su orientacion vertical hacia el dominio financiero y en la publicacion de resultados de evaluacion por tarea. No obstante, el repositorio tiene un tamano de 0.0 GB y la model card no documenta el numero de parametros, la longitud de contexto, los datos de entrenamiento ni los pesos en un formato concreto, lo que limita seriamente su evaluacion y su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, etiqueta `qwen2` en metadatos (no confirmado en la model card) |
| Parametros totales | no disponible (el nombre sugiere 7B; no confirmado en la model card) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio reporta 0.0 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de la etiqueta `qwen2` presente en los metadatos de Hugging Face, que apunta a una familia de transformers decoder-only. Tampoco se detalla el numero de tokens de preentrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El autor indica que los checkpoints de la release provienen de una misma ejecucion de preentrenamiento y que se diferencian solo por el numero de pasos de optimizacion, lo que sugiere una seleccion por criterio de evaluacion mas que un entrenamiento especifico por variante.

El elemento diferencial declarado es el harness de evaluacion: quince suites de benchmark que puntuan cada checkpoint y alimentan el proceso de seleccion del modelo publicado. No se especifica que innovaciones tecnicas (atencion lineal, decodificacion especulativa, mezcla de expertos) incorpora el modelo.

## Capacidades

- Generacion de texto en el dominio financiero, segun la descripcion del autor.
- Analisis de documentos financieros.
- Razonamiento sobre datos tabulares.
- Respuesta a preguntas de caracter regulatorio.
- Generacion de codigo (reportada en la tabla de benchmarks con 0.731).
- Traduccion (reportada con 0.891).
- Resumen de textos (reportado con 0.838).
- Seguimiento de instrucciones (reportado con 0.838).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Analisis de informes anuales y estados financieros: el modelo esta entrenado para documentos financieros, por lo que puede emplearse para extraer y resumir magnitudes clave de memorias anuales, siempre que se valide la salida contra la fuente original.
- Razonamiento sobre tablas de resultados: adecuado para interpretar balances, cuentas de perdidas y ganancias o series temporales de indicadores, dado el enfasis declarado en datos tabulares.
- Respuesta a preguntas regulatorias internas: puede asistir a equipos de compliance en la consulta de normativa, con revision humana obligatoria por el riesgo de alucinacion en materia regulatoria.
- Resumen de documentacion financiera extensa: la capacidad de summarization reportada (0.838) lo hace candidato para condensar prospectos, informes trimestrales o notas de analistas.
- Clasificacion y analisis de sentimiento de noticias financieras: la puntuacion reportada en text classification (0.901) y sentiment analysis (0.879) sugiere utilidad en pipelines de monitorizacion de mercado.
- Generacion de codigo para pipelines de datos financieros: con una puntuacion de 0.731 en code generation, puede apoyar la escritura de scripts de extraccion y transformacion, con tests automatizados en CI/CD.
- Traduccion de documentacion financiera multilingue: la puntuacion de 0.891 en traduccion lo situa como opcion para localizar informes, aunque los idiomas soportados no estan declarados.

## Benchmarks y rendimiento

Resultados reportados en la model card (precision sobre el split de evaluacion completo):

| Benchmark | Base-7B | Chat-7B | FinanceLM-3B | FinanceLM-7B |
|---|---|---|---|---|
| Math Reasoning | 0.548 | 0.561 | 0.572 | 0.622 |
| Logical Reasoning | 0.548 | 0.561 | 0.572 | 0.892 |
| Common Sense | 0.548 | 0.561 | 0.572 | 0.827 |
| Reading Comprehension | 0.548 | 0.561 | 0.572 | 0.776 |
| Question Answering | 0.548 | 0.561 | 0.572 | 0.710 |
| Text Classification | 0.548 | 0.561 | 0.572 | 0.901 |
| Sentiment Analysis | 0.548 | 0.561 | 0.572 | 0.879 |
| Code Generation | 0.548 | 0.561 | 0.572 | 0.731 |
| Creative Writing | 0.548 | 0.561 | 0.572 | 0.679 |
| Dialogue Generation | 0.548 | 0.561 | 0.572 | 0.732 |
| Summarization | 0.548 | 0.561 | 0.572 | 0.838 |
| Translation | 0.548 | 0.561 | 0.572 | 0.891 |
| Knowledge Retrieval | 0.548 | 0.561 | 0.572 | 0.771 |
| Instruction Following | 0.548 | 0.561 | 0.572 | 0.838 |
| Safety Evaluation | 0.548 | 0.561 | 0.572 | 0.832 |

Advertencia: las columnas Base-7B, Chat-7B y FinanceLM-3B presentan exactamente los mismos valores en las quince filas (0.548, 0.561 y 0.572 respectivamente), lo que resulta estadisticamente implausible y sugiere un error de publicacion o una plantilla no cumplimentada. Los resultados de FinanceLM-7B deben interpretarse con cautela hasta que el autor publique la metodologia y los identificadores de las suites de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Para un modelo de ~7B en precision fp16 serian necesarios del orden de 14-16 GB, y en cuantizacion de 4 bits alrededor de 4-5 GB, pero estos calculos son estimaciones genericas y no estan confirmados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; dependeria del tamano real de los pesos, que el repositorio no publica (0.0 GB).
- Opciones de despliegue: los metadatos indican compatibilidad con text-generation-inference y endpoints_compatible, ademas de `transformers` con PyTorch. No se declara soporte de vLLM, llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| EvalLedger-FinanceLM (123sg) | no disponible (~7B por nombre) | no disponible | Finanzas y evaluacion | Apache-2.0 | Repositorio de 0.0 GB; pesos no verificables |
| Qwen2-7B (Alibaba) | 7B | 32K-128K segun variante | Proposito general | Apache-2.0 | Completa en Hugging Face |
| FinGPT (AI4Finance) | Variable | Variable | Finanzas | Variable por checkpoint | Disponible en Hugging Face |
| Llama 3.1 8B (Meta) | 8B | 128K | Proposito general | Llama 3.1 Community License | Completa en Hugging Face |

La comparacion cuantitativa con alternativas no es posible: el autor no publica metricas frente a modelos externos y la tabla de benchmarks solo compara variantes internas de la propia familia.

## Limitaciones y advertencias

- La model card no documenta parametros, contexto, datos de entrenamiento ni proceso de alineacion, lo que impide evaluar su calidad de forma independiente.
- El repositorio tiene un tamano de 0.0 GB, por lo que no esta claro que los pesos esten efectivamente publicados.
- Los resultados de las columnas Base-7B, Chat-7B y FinanceLM-3B son identicos en las quince tareas, lo que compromete la credibilidad de la tabla de evaluacion.
- Riesgo elevado de alucinacion en un dominio regulado como el financiero; cualquier salida debe validarse contra la fuente normativa o contable.
- No se declaran los idiomas soportados, lo que impide confirmar el rendimiento en castellano.
- No se especifican sesgos conocidos ni evaluaciones de seguridad mas alla de la fila "Safety Evaluation" (0.832) sin metodologia asociada.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero al no haber pesos verificables ni documentacion tecnica, su adopcion en produccion no es recomendable sin una validacion previa exhaustiva.
- No se declara soporte de tool calling ni de razonamiento multi-paso, capacidades habituales en despliegues agente.

## Enlaces

- Hugging Face: https://huggingface.co/123sg/EvalLedger-FinanceLM
