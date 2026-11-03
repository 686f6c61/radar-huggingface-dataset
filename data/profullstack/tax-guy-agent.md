# profullstack/tax-guy-agent

## Resumen

tax-guy-agent es un adaptador LoRA de bajo rango (r=8) construido sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el usuario profullstack y publicado en HuggingFace bajo licencia Apache 2.0. Su proposito es especializar un modelo generativo de muy pequeno tamano (0,5 mil millones de parametros) en la generacion de respuestas de investigacion fiscal en ingles llano, orientadas a contribuyentes estadounidenses: impuestos estimados trimestrales, deducciones, impuestos sobre la renta, LLC, ganancias de capital y trabajo autonomo.

El modelo no pretende sustituir a un profesional fiscal; la propia model card lo declara explicitamente como material de investigacion y no como asesoramiento fiscal. Su diseno asume que el conocimiento factual se inyecta en el prompt mediante resultados de busqueda frescos (la implementacion de referencia usa pit.world search), de modo que el adaptador aporta el tono, la estructura y las advertencias, mientras que los hechos provienen del contexto recuperado. Se distribuye como adaptador PEFT (safetensors) y cuenta con una version GGUF publicada en un repositorio separado para su ejecucion en CPU mediante Ollama.

Es relevante ahora por dos motivos: demuestra un flujo completo de ajuste fino de muy bajo coste (400 pasos LoRA sobre 2614 documentos) ejecutado en una red de computo distribuida (c0mpute), y ofrece un patron de despliegue en CPU accesible para herramientas de nicho donde el coste de inferencia en GPU seria desproporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso seq_len=256) |
| Tipos de cuantizacion | GGUF disponible en el repositorio profullstack/tax-guy-agent-GGUF; niveles concretos no disponibles |
| Idiomas soportados | no disponible (la model card y los ejemplos estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5 mil millones de parametros. El ajuste emplea LoRA con rango r=8, longitud de secuencia 256 y tasa de aprendizaje 0,0002 durante 400 pasos. El entrenamiento se ejecuto en la red c0mpute mediante el trabajo `infernet.text.train` (job `27b2dab7-9e82-4b48-b4fc-d77f4b22997c`), con un recibo cuyo hash sha256 `821a038ac1ea43f804b795e795a308cfbebb141c24e3675223c29d80fb8db5b7` coincide con el del adaptador publicado, lo que permite verificar la procedencia del artefacto.

El corpus de entrenamiento consta de 2614 documentos extraidos de fuentes publicas: feeds tematicos de rssamplifier.com y busqueda de pit.world, filtrados por terminos como tax, taxes, irs, deduction, tax return, self-employed tax, estimated tax, sales tax, llc tax y capital gains. El corpus no se redistribuye en el repositorio. La perplejidad sobre el conjunto de validacion (held-out) descendio de 33,6 a 17,8 tras el entrenamiento. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni innovaciones arquitectonicas propias mas alla del ajuste LoRA.

## Capacidades

- Generacion de texto conversacional en el dominio fiscal estadounidense: impuestos estimados, deducciones, declaraciones, LLC, ganancias de capital y trabajo autonomo.
- Estructuracion de respuestas con indicacion de pais, estado y ano fiscal al que aplica una regla, segun el prompt de sistema recomendado.
- Citacion de las fuentes incluidas en el contexto del prompt.
- Advertencias explicitas sobre la necesidad de consultar a un CPA o agente fiscal colegiado.
- Ejecucion en CPU mediante Ollama (version 0.3.13 o superior) con el GGUF publicado.
- Integracion en Python mediante PEFT y Transformers con `apply_chat_template`.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible de forma nativa; la model card sugiere un patron de recuperacion externa previa al prompt.
- Capacidades multilingues: no disponibles; el material y los ejemplos estan en ingles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Asistente de primera linea para trabajadores autonomos: responde preguntas frecuentes sobre pagos trimestrales estimados, explicando el criterio en ingles llano y derivando a un profesional cuando la situacion lo requiera. Es adecuado por su bajo coste de inferencia en CPU y porque el riesgo de error factual se mitiga inyectando resultados de busqueda actualizados en el prompt.
- Capa de redaccion en un pipeline de investigacion fiscal con RAG: el sistema recupera fragmentos de la normativa y el modelo compone la respuesta con tono consistente, cita las fuentes y anade el descargo de responsabilidad. El adaptador aporta la voz; los hechos vienen del recuperador.
- Prototipado rapido de productos de nicho fiscal: al ejecutarse en CPU con Ollama, permite validar una idea de asistente fiscal sin aprovisionar GPU, con un coste de infraestructura minimo durante la fase de descubrimiento.
- Generacion de borradores de articulos divulgativos: a partir de documentos fuente sobre deducciones o LLC, el modelo produce explicaciones estructuradas que un editor humano revisa antes de publicar.
- Formacion interna y soporte a equipos de atencion al cliente: respuestas de referencia sobre conceptos fiscales basicos para agentes humanos, siempre con la advertencia de no constituir asesoramiento.
- Entorno de pruebas para evaluar pipelines de ajuste LoRA: el repositorio documenta el flujo completo (corpus, hiperparametros, recibo de entrenamiento y hash del adaptador), lo que lo convierte en un ejemplo reproducible para experimentar con PEFT sobre modelos sub-1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado es la perplejidad sobre el conjunto de validacion, que paso de 33,6 a 17,8 tras el entrenamiento.

| Metrica | Antes | Despues |
|---|---|---|
| Perplejidad (held-out) | 33,6 | 17,8 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del modelo base (0,5 mil millones de parametros), la inferencia en precision completa requiere del orden de 1-2 GB y las versiones cuantizadas en GGUF reducen sustancialmente ese requisito.
- GPU recomendadas: no disponibles; el modelo esta disenado para ejecutarse en CPU.
- Cabe en GPU de consumo: si, por el reducido tamano del modelo base; modelos concretos no especificados en la informacion proporcionada.
- Opciones de despliegue: Ollama (0.3.13 o superior) con el GGUF de profullstack/tax-guy-agent-GGUF; PEFT + Transformers en Python para el adaptador. Soporte de vLLM, llama.cpp o TGI no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| tax-guy-agent | 0,5 B (base) + LoRA | no disponible | Fiscal EE. UU. | Apache 2.0 | safetensors (adaptador), GGUF |
| Qwen2.5-0.5B-Instruct | 0,5 B | no disponible en la informacion proporcionada | Generica, instrucciones | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,5 B | no disponible en la informacion proporcionada | Generica, instrucciones | Apache 2.0 | safetensors, GGUF |

La comparacion con alternativas especializadas en dominio fiscal no esta disponible en la informacion proporcionada. Frente a su modelo base, tax-guy-agent anade el dominio y el tono fiscal a costa de un adaptador adicional; frente a modelos mayores de la misma familia, ofrece menor coste de inferencia con menor capacidad general.

## Limitaciones y advertencias

- No es un CPA ni un agente fiscal colegiado: la model card declara explicitamente que no constituye asesoramiento fiscal y que las reglas cambian cada ano y varian por jurisdiccion.
- Riesgo elevado de alucinacion en hechos fiscales: con 0,5 mil millones de parametros, el modelo no retiene conocimiento normativo fiable; la propia documentacion indica que "un modelo sub-1B aporta la voz, no los hechos" y que los mejores resultados requieren inyectar resultados de busqueda frescos en el prompt.
- Cobertura geografica limitada en la practica al sistema estadounidense (IRS, impuestos estatales), segun el corpus de entrenamiento.
- Idioma: el material y los ejemplos estan en ingles; el rendimiento en castellano no esta documentado.
- Ventana de entrenamiento corta (seq_len=256), lo que limita la calidad en contextos largos aunque el modelo base soporte mas.
- Corpus de 2614 documentos de fuentes publicas no redistribuido: la trazabilidad de las fuentes originales depende de rssamplifier.com y pit.world.
- Sin datos publicados de benchmarks, evaluacion de sesgos ni pruebas de seguridad; no recomendado para produccion sin una capa de recuperacion, validacion humana y descargos legales visibles.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad legal sobre las respuestas fiscales recae en el integrador.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/profullstack/tax-guy-agent
- GGUF para Ollama: https://huggingface.co/profullstack/tax-guy-agent-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Ejemplo de construccion en c0mpute: https://github.com/profullstack/c0mpute/tree/master/examples/business-strategist-agent
- Instalacion de Ollama: https://ollama.com/install.sh
