# Balab2021/Qwen3.8-27B-Cricket-Reasoning-LoRA

## Resumen

Qwen3.8-27B-Cricket-Reasoning-LoRA es un adaptador LoRA publicado por el usuario Balab2021 sobre el modelo denso Qwen3.8-27B de Tongyi Lab (Alibaba). No es un modelo completo, sino un ajuste supervisado (SFT) de bajo rango que se carga encima del modelo base para especializarlo en razonamiento sobre cricket T20I: calculo de run-rate, chase-rate y hitos de bateo a partir de situaciones bola a bola.

El adaptador se entrena con 4.410 filas de razonamiento verificadas procedentes de Valarmathy/CricketData, en 138 pasos (2,00 epocas) y 20,2 minutos, con una perdida final de entrenamiento de 0,3229. El objetivo declarado no es tanto subir la precision —el modelo base ya ronda el 97 % de acierto medio en estas tareas— como reducir la verbosidad del razonamiento: el numero medio de tokens de salida baja de 748 a 482 en el conjunto de evaluacion.

La relevancia practica del artefacto esta en su evaluacion, poco habitual en adaptadores de nicho: 600 preguntas retenidas de partidos no vistos, 4 muestras por pregunta, modo thinking y verificacion contra valores exactos, con tablas publicas de precision, pass@4, tokens medios y truncamientos por tipo de pregunta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.8-27B; el modelo base es un transformer denso con capacidades de vision-lenguaje segun la documentacion del modelo base |
| Parametros totales | No disponible para el adaptador (rango y modulos objetivo no declarados). El modelo base tiene 27.000 millones de parametros |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No especificada para el adaptador. El modelo base declara 262.144 tokens de contexto nativo |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; el modelo fusionado puede cuantizarse a 8 y 4 bits con las herramientas habituales (llama.cpp, AWQ, GPTQ) |
| Idiomas soportados | No disponibles. Los datos de ajuste estan en ingles (preguntas de cricket) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tipo de ajuste | SFT con LoRA (peft), 4410 filas verificadas, 138 pasos, 2,00 epocas |
| Tamano del repositorio | 55,6 GB |
| Fecha de publicacion | 5 de octubre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clasico de LoRA sobre un transformer denso: se congelan los pesos de Qwen3.8-27B y se entrenan matrices de bajo rango en las capas seleccionadas. La model card no especifica rango, alpha, dropout ni modulos objetivo, por lo que no es posible reproducir el ajuste a partir de la informacion disponible. El modelo base, segun las fuentes web consultadas, es un modelo denso de 27.000 millones de parametros orientado a codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo, con razonamiento configurable y una ventana nativa de 262.144 tokens.

El entrenamiento consiste en un SFT sobre 4.410 trazas de razonamiento verificadas extraidas de situaciones bola a bola de T20I (dataset Valarmathy/CricketData), cubriendo tres tipos de pregunta con respuesta exacta: run-rate, chase-rate e hitos de bateo. Se completaron 138 pasos en 2,00 epocas en 20,2 minutos, con perdida final de 0,3229. No se menciona RLHF, DPO ni decodificacion especulativa. La evaluacion se hizo con modo thinking activado (enable_thinking=True) y muestreo a temperatura 1,0, top_p 0,95 y top_k 20; el autor recomienda explicitamente estos hiperparametros para el uso del adaptador.

## Capacidades

- Razonamiento aritmetico deportivo: calculo de run-rate, chase-rate y verificacion de hitos de bateo en partidos T20I a partir de secuencias bola a bola.
- Razonamiento explicito en modo thinking, con trazas de razonamiento antes de la respuesta final.
- Reduccion de la verbosidad del razonamiento: los tokens medios de salida caen de 748 a 482 en la evaluacion global, con la mayor reduccion en milestone (de 910 a 557) y chase-rate (de 929 a 610).
- Mayor robustez frente al limite de tokens: el truncamiento global baja del 0,33 % al 0,04 %, y a cero en run-rate y chase-rate.
- Respuestas con formato parseable: el 100 % de las generaciones evaluadas terminaron con una respuesta analizable, tanto en el modelo base como en el ajustado.
- Generacion de texto conversacional (pipeline declarado: text-generation).
- Capacidad de vision-lenguaje heredada del modelo base Qwen3.8-27B, aunque no se ha validado con este adaptador ni forma parte de los datos de ajuste.
- No se documenta soporte especifico de tool calling, function calling ni uso agentico multietapa para este adaptador en la informacion disponible. Cualquier capacidad de este tipo procederia del modelo base, no del ajuste.

## Casos de uso

- Analisis automatizado de partidos T20I: dado un feed bola a bola, el adaptador calcula run-rate y chase-rate por over y por inning, reduciendo el coste de inferencia respecto al modelo base al generar respuestas mas cortas con la misma precision.
- Herramientas de retransmision en directo: generacion de estadisticas contextuales ("run-rate requerido", "hitos de bateo) con latencia menor gracias a los 266 tokens de salida medios de diferencia frente al modelo base.
- Motor de respuesta a preguntas para fantasy cricket y apuestas deportivas: verificacion de hitos de bateo (medias centurias, 50 carreras) con respuestas exactas y trazabilidad del razonamiento, util cuando se necesita auditar el calculo.
- Backend de un chatbot especializado en estadisticas de cricket: conversaciones multi-turno con contexto largo heredado del modelo base (262.144 tokens), suficiente para mantener el historial de un partido completo o de una temporada.
- Generacion de resumenes post-partido con cifras verificadas: el modelo produce un razonamiento paso a paso que se puede parsear y validar antes de publicar, con menor tasa de truncamiento (0,04 % global).
- Prototipado de pipelines de evaluacion de razonamiento numerico: el repositorio incluye scripts de comprobacion por respuesta exacta y graficas (precision y tokens por tipo de pregunta) reutilizables para otros dominios con respuestas verificables.
- Ajuste incremental sobre dominios de nicho: sirve como ejemplo metodologico de LoRA pequeno sobre un modelo de 27B con evaluacion honesta de ganancias y perdidas por subcategoria.

## Benchmarks y rendimiento

Resultados publicados en la model card: 600 preguntas retenidas de partidos no vistos, 4 muestras por pregunta, modo thinking, temperatura 1,0, top_p 0,95, top_k 20, respuestas comprobadas contra valores exactos.

| Tipo de pregunta | Metrica | Base | Ajustado | Delta |
|---|---|---|---|---|
| run_rate | Precision (media de muestras) | 98,50 % | 99,00 % | +0,50 pts |
| run_rate | pass@4 | 100,00 % | 100,00 % | +0,00 pts |
| run_rate | Tokens de salida medios | 404 | 280 | -124 |
| run_rate | Truncados (limite de tokens) | 0,12 % | 0,00 % | -0,12 pts |
| run_rate | Sin respuesta parseable | 0,00 % | 0,00 % | +0,00 pts |
| chase_rate | Precision (media de muestras) | 93,88 % | 92,25 % | -1,62 pts |
| chase_rate | pass@4 | 100,00 % | 100,00 % | +0,00 pts |
| chase_rate | Tokens de salida medios | 929 | 610 | -320 |
| chase_rate | Truncados (limite de tokens) | 0,38 % | 0,00 % | -0,38 pts |
| chase_rate | Sin respuesta parseable | 0,00 % | 0,00 % | +0,00 pts |
| milestone | Precision (media de muestras) | 99,38 % | 99,88 % | +0,50 pts |
| milestone | pass@4 | 100,00 % | 100,00 % | +0,00 pts |
| milestone | Tokens de salida medios | 910 | 557 | -353 |
| milestone | Truncados (limite de tokens) | 0,50 % | 0,12 % | -0,38 pts |
| milestone | Sin respuesta parseable | 0,00 % | 0,00 % | +0,00 pts |
| Global | Precision (media de muestras) | 97,25 % | 97,04 % | -0,21 pts |
| Global | pass@4 | 100,00 % | 100,00 % | +0,00 pts |
| Global | Tokens de salida medios | 748 | 482 | -266 |
| Global | Truncados (limite de tokens) | 0,33 % | 0,04 % | -0,29 pts |
| Global | Sin respuesta parseable | 0,00 % | 0,00 % | +0,00 pts |

Preguntas respondidas de forma mas fiable tras el ajuste: 36. Preguntas respondidas de forma menos fiable: 39 (sobre 600; se compara la fraccion de muestras correctas por pregunta).

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo no ejecuta inferencia: requiere cargar Qwen3.8-27B (27.000 millones de parametros). El repositorio del adaptador ocupa 55,6 GB, un tamano inusualmente grande para un LoRA; la model card no aclara que contiene ese volumen.
- VRAM estimada para el modelo base fusionado, calculada a partir del numero de parametros (estimacion propia, no publicada por el autor): aproximadamente 54 GB en BF16/FP16, unos 27 GB en cuantizacion de 8 bits y entre 14 y 16 GB en 4 bits.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 sin cuantizar; A6000 48 GB o dos RTX 4090 para 8 bits; RTX 4090, RTX 3090 o RTX 5090 para 4 bits.
- Cabe en GPU de consumo: si, en configuraciones de 4 bits dentro de 24 GB de VRAM (RTX 3090/4090), con la salvedad de que la cache KV a contextos largos puede exceder esa memoria. No hay datos publicados de consumo real de VRAM para este adaptador.
- Despliegue: vLLM, SGLang o TGI para servir el modelo base con el adaptador PEFT acoplado; llama.cpp u Ollama requieren fusionar el adaptador con el modelo base y convertir los pesos a GGUF. LM Studio se menciona en las fuentes web como via de ejecucion del modelo base.
- Latencia y throughput: no disponibles. Como referencia indirecta, la reduccion de tokens de salida (de 748 a 482 de media, un 35,6 % menos) implica una reduccion proporcional del tiempo de generacion a igual throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en la tarea | Disponibilidad |
|---|---|---|---|---|---|
| Balab2021/Qwen3.8-27B-Cricket-Reasoning-LoRA | 27B (base) + adaptador LoRA | 262.144 tokens (heredado del base) | No disponible | 97,04 % de precision global; pass@4 100 %; 482 tokens medios | HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.8-27B (base) | 27.000 millones, denso | 262.144 tokens | No disponible en la informacion consultada | 97,25 % de precision global; pass@4 100 %; 748 tokens medios | HuggingFace, ampliamente referenciado en guias de despliegue local |
| Balab2021/qwen3.8-27b-gsm8k-lora | 27B (base) + adaptador LoRA | No disponible | apache-2.0 | No disponibles: no se publican metricas comparables | HuggingFace; mismo autor, dominio de matematicas (GSM8K) |

No se han identificado en la busqueda web otros adaptadores de razonamiento especificos de cricket con los que comparar. La comparativa con modelos generalistas de la misma categoria (por ejemplo, otros modelos densos de ~27B) no esta disponible porque no se han aportado sus datos.

## Limitaciones y advertencias

- La mejora no es general: la precision global baja 0,21 puntos (de 97,25 % a 97,04 %) y la de chase-rate cae 1,62 puntos (de 93,88 % a 92,25 %). La ganancia principal es de eficiencia (menos tokens, menos truncamiento), no de exactitud.
- El conjunto de evaluacion ya esta casi saturado en el modelo base (pass@4 del 100 % en todos los tipos de pregunta), lo que limita la capacidad de demostrar mejoras reales.
- Hay un intercambio neto negativo en fiabilidad por pregunta: 39 preguntas empeoran frente a 36 que mejoran.
- Dominio muy estrecho: solo cricket T20I y solo tres tipos de pregunta. No hay evidencia de transferencia a otros formatos (Test, ODI), otras ligas u otros deportes.
- Idioma: los datos de ajuste estan en ingles. No se declaran idiomas soportados, por lo que el comportamiento en castellano no esta validado.
- Licencia no disponible: sin una licencia explicita no se puede asumir uso comercial. Ademas, la licencia del modelo base Qwen3.8-27B no aparece en la informacion consultada y debe verificarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: aunque las respuestas se validan contra valores exactos, el modelo puede generar cifras plausibles pero incorrectas, especialmente en chase-rate, el tipo de pregunta con peor precision. Cualquier salida numerica deberia validarse contra la fuente de datos.
- Especificaciones de entrenamiento incompletas: no se declaran rango LoRA, alpha, modulos objetivo, composicion exacta del dataset ni hiperparametros de optimizacion, lo que impide reproducir el ajuste.
- Tamano del repositorio (55,6 GB) desproporcionado para un adaptador LoRA, sin explicacion en la model card; conviene inspeccionar el contenido antes de descargarlo.
- Ausencia de traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de terceros.
- El adaptador requiere modo thinking con temperatura 1,0, top_p 0,95 y top_k 20; usarlo con otros hiperparametros invalida los resultados de la evaluacion publicada.
- La fecha de publicacion indicada en los metadatos (octubre de 2026) y las cifras de rendimiento no han podido contrastarse con fuentes independientes.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Balab2021/Qwen3.8-27B-Cricket-Reasoning-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador del mismo autor para GSM8K: https://huggingface.co/Balab2021/qwen3.8-27b-gsm8k-lora
- Dataset de origen citado en la model card: https://huggingface.co/datasets/Valarmathy/CricketData
- Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Analisis tecnico de Qwen3.8-27B (Local AI Zone): https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html
- Guia de ejecucion local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Graficas de evaluacion incluidas en la model card: eval_report/plots/accuracy_by_qtype.png, eval_report/plots/mean_tokens_by_qtype.png, eval_report/plots/training_curves.png (dentro del repositorio de HuggingFace)
