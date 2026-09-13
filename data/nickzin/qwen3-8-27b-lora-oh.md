# nickzin/qwen3.8-27b-lora-oh

## Resumen

El repositorio `nickzin/qwen3.8-27b-lora-oh` no contiene un modelo completo, sino un adaptador LoRA (rango 16) entrenado mediante PEFT sobre el modelo base `Qwen/Qwen3.8-27B`. Lo firma el usuario nickzin y forma parte del proyecto de evaluacion `qwen3.8-27b-finetune-eval`, cuyo objetivo declarado es estudiar como el ajuste fino de tool calling degrada la tasa de rechazos del modelo y como la destilacion posterior la repara.

El adaptador corresponde a la rama de SFT de instrucciones generales y se entreno con 3000 filas del dataset OpenHermes-2.5. Su funcion explicita es servir de control experimental: separar la hipotesis de que "la destilacion repara especificamente el dano causado por el fine-tuning de tool calling" de la hipotesis de que "la destilacion ayuda de forma general". Para ello hacia falta una rama destilada que nunca hubiera pasado por tool calling, y este adaptador es la pieza que faltaba.

Su relevancia es metodologica mas que de rendimiento. El autor lo publica sin haberlo evaluado, reconociendo que el presupuesto de GPU se agoto antes de poder medirlo, "para que la laguna sea visible en lugar de quedar oculta". El repositorio pesa 0,3 GB, usa la libreria PEFT, esta etiquetado como `lora`, `peft`, `qwen`, `tool-calling` y `function-calling`, y se distribuye bajo licencia "other". No tiene descargas ni "likes" registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer; arquitectura del modelo base no disponible |
| Parametros totales | Adaptador de rango 16 (~0,3 GB en disco); modelo base denominado 27B, cifra no confirmada en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; no se publica version GGUF ni cuantizada |
| Idiomas soportados | No disponible |
| Licencia | other (se indica "See the dataset and teacher model cards; verify before commercial use") |
| Formato de pesos | safetensors (adaptador PEFT; guardado con Unsloth segun la advertencia de merge del autor) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 16 sobre `Qwen/Qwen3.8-27B`, gestionado con la libreria PEFT. El autor no detalla la arquitectura del modelo base (si es transformer denso, MoE o hibrido), ni su numero exacto de parametros, ni su ventana de contexto, por lo que esos datos quedan como no disponibles en esta ficha. El adaptador se sirve en vLLM como modulo LoRA, con `--max-lora-rank 16` y `--max-loras 1`, lo que implica que solo reside un adaptador a la vez en memoria.

El entrenamiento consistio en un SFT de instrucciones generales con 3000 filas del dataset OpenHermes-2.5, segun la model card. No se documentan el numero de tokens, la composicion completa del dataset, ni si hubo fases de RLHF o DPO. La model card define esta rama como "General instruction SFT" y la encuadra dentro de un estudio comparativo sobre tasas de rechazo: la hipotesis principal del proyecto es que la destilacion reparo una tasa de rechazo que el fine-tuning de tool calling habia destruido.

La advertencia tecnica mas relevante que aporta el autor afecta al proceso de fusion: `PeftModel.merge_and_unload()` produjo, con estos adaptadores guardados por Unsloth, un checkpoint bit a bit identico al modelo base. Es decir, la fusion parece exitosa pero se comporta como si no se hubiera aplicado ningun ajuste. El autor propone verificarlo a nivel de pesos comprobando que `(W_merged - W_base) == scale * (B @ A)` dentro de unos pocos ulps de bf16.

## Capacidades

- Generacion de texto e instrucciones generales: es la funcion declarada de esta rama ("General instruction SFT"), entrenada sobre OpenHermes-2.5.
- Tool calling y function calling: el repositorio esta etiquetado con `tool-calling` y `function-calling`, y las instrucciones de servicio de vLLM incluyen `--enable-auto-tool-choice` con `--tool-call-parser qwen3_xml`, lo que apunta a un formato de llamada a herramientas basado en XML en el modelo base.
- Razonamiento multi-paso y uso como agente: no documentado de forma especifica para este adaptador; el parser de tool calls de vLLM habilita su uso en bucles de agente, pero no hay evaluacion publicada.
- Capacidades multilingues: no disponibles. No se declara ninguna lista de idiomas en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. No se menciona ninguna en la model card.
- Uso como control experimental: capacidad de facto del artefacto, disenado para aislar el efecto de la destilacion frente al dano del fine-tuning de tool calling.

## Casos de uso

- Reproduccion de experimentos de alineacion: el adaptador permite replicar la comparacion entre una rama destilada que nunca paso por tool calling y las ramas que si lo hicieron, para determinar si la recuperacion de la tasa de rechazo es especifica del dano de tool calling o un efecto general de la destilacion. Es su proposito declarado.
- Analisis de tasas de rechazo en asistentes: sirve como linea base de instrucciones generales para medir cuanta capacidad de rechazo (negativa a responder peticiones problematicas) conserva un modelo tras SFT sin tool calling, comparandola con las ramas que si lo incorporaron.
- Servicio multi-adaptador en vLLM: la configuracion documentada (`--enable-lora --max-lora-rank 16 --max-loras 1`) permite alternar entre el modelo base y este adaptador con un solo modulo residente, util para comparativas A/B servidas desde el mismo proceso.
- Pruebas de pipelines de tool calling: al servirse con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml`, se puede integrar en un cliente que direccione el nombre servido `qwen38-oh` para validar el parseo de llamadas a funciones en extremo a extremo, teniendo en cuenta que el nombre del modulo LoRA no es un id de repositorio de HuggingFace y el cliente debe configurarse con el nombre servido.
- Validacion de procesos de fusion de adaptadores: el fallo silencioso documentado con `merge_and_unload()` convierte este repositorio en un caso de prueba util para verificar herramientas de merge a nivel de pesos con la comprobacion `(W_merged - W_base) == scale * (B @ A)`.
- Formacion y docencia sobre PEFT: el repositorio, con solo 0,3 GB y una receta de servicio reproducible, sirve como ejemplo minimo de adaptador LoRA de rango 16 para ilustrar el ciclo entrenar, servir y fusionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card lo declara de forma explicita: "Not benchmarked. This adapter was trained as a control and the GPU budget ran out before it was evaluated."

No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K ni de comparaciones numericas con modelos similares. Tampoco se publican metricas de latencia o throughput.

## Requisitos de hardware

- Este repositorio es un adaptador, no un modelo completo: el coste de VRAM lo determina casi por entero el modelo base `Qwen/Qwen3.8-27B`. El adaptador ocupa aproximadamente 0,3 GB en disco y una cantidad marginal de VRAM adicional.
- VRAM estimada para el modelo base (estimacion aritmetica a partir de la denominacion "27B", no confirmada por el autor): en bf16, del orden de 54 GB solo para pesos; en cuantizacion de 8 bits, unos 27 GB; en 4 bits, alrededor de 14-16 GB, sin contar cache KV ni overhead del runtime.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU. Con cuantizacion de 4 bits el modelo podria entrar en GPU de consumo con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090), aunque esto no esta verificado en la informacion disponible.
- Despliegue documentado: vLLM, con soporte de LoRA activado mediante `--enable-lora`, `--max-lora-rank 16`, `--max-loras 1` y `--lora-modules qwen38-oh=/root/adapters/oh-adapter`. La model card no menciona llama.cpp, Ollama, TGI ni otras alternativas para este adaptador, y no se publica ninguna version GGUF.
- Latencia y throughput: no disponibles. No se aportan mediciones.

## Comparativa con modelos similares

No hay datos comparativos disponibles en la informacion proporcionada. Se incluye la tabla con los campos exigidos y el estado de cada dato:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nickzin/qwen3.8-27b-lora-oh | Adaptador LoRA rango 16 sobre base de 27B (segun denominacion) | No disponible | No evaluado | other | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27B segun denominacion, no confirmado | No disponible | No disponible en esta informacion | No disponible en esta informacion | Referenciado como base en el repositorio |
| Otras ramas del proyecto qwen3.8-27b-finetune-eval | No disponible | No disponible | No disponible | No disponible | Repositorio GitHub, sin cifras publicas en la informacion disponible |

Las alternativas de la misma categoria (adaptadores LoRA de tool calling sobre modelos Qwen de gran tamano) existen en el ecosistema, pero no se dispone de datos verificables de ninguna de ellas en la informacion facilitada, por lo que no se establece una comparacion numerica.

## Limitaciones y advertencias

- Modelo no evaluado: el propio autor indica que el presupuesto de GPU se agoto antes de la evaluacion. No hay ninguna garantia de rendimiento, calidad de respuesta ni de tasa de acierto en tool calling.
- Artefacto de control, no de produccion: se publica para completar un estudio experimental, no como modelo listo para desplegar.
- Riesgo de fusion silenciosamente fallida: con estos adaptadores guardados por Unsloth, `PeftModel.merge_and_unload()` genero un checkpoint bit a bit identico al modelo base. Cualquier merge debe verificarse a nivel de pesos antes de confiar en el resultado.
- Licencia restrictiva e indeterminada: la etiqueta es "other" y la model card remite a las licencias del dataset y del modelo maestro ("See the dataset and teacher model cards; verify before commercial use"). Es obligatorio verificar los terminos antes de cualquier uso comercial.
- Sesgos: no documentados. El entrenamiento con OpenHermes-2.5 y sin filtrado posterior declarado puede arrastrar los sesgos de ese corpus, pero no hay analisis disponible.
- Alucinacion: no medida. Al no existir evaluacion, no hay estimacion de tasa de alucinacion ni de calibracion.
- Idiomas y contexto: no se declara ninguna lista de idiomas ni la longitud de contexto soportada, por lo que no puede asumirse cobertura multilingue ni una ventana concreta.
- Fallo de rechazo documentado en el proyecto: la motivacion del autor es que un fine-tuning de tool calling destruyo la tasa de rechazo del modelo. Aunque este adaptador no paso por esa rama, el hallazgo subraya que los SFT sobre esta base pueden degradar comportamientos de seguridad, y conviene medirlo antes de desplegar.
- Integracion con clientes: el nombre del modulo LoRA en vLLM no es un id de repositorio de HuggingFace. El cliente debe configurarse con el nombre servido (`qwen38-oh`), no con la ruta del adaptador.
- Trazabilidad temporal atipica: las fechas de creacion y actualizacion del repositorio (13 de septiembre de 2026) son posteriores a la fecha habitual de publicacion; conviene verificarlas en la propia pagina de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nickzin/qwen3.8-27b-lora-oh
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del proyecto de evaluacion: https://github.com/Nicolas-Formenton/qwen3.8-27b-finetune-eval
- Dataset de entrenamiento mencionado: OpenHermes-2.5 (referenciado por nombre en la model card, sin identificador ni enlace explicitos)
- Nota sobre la busqueda web: los resultados obtenidos corresponden a listados de relojeria de la marca Union Glashutte (referencia D011.414.16.420.09) y no guardan ninguna relacion con este modelo de lenguaje, por lo que no se incluyen. No se han localizado articulos, papers ni demos adicionales sobre el adaptador.
