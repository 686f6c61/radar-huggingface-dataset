# itamarstahl/lment-1b-rome-snmf-ember-ratio-in-b131k

## Resumen

LMEnt 1B — Ancient Rome SNMF+EMBER es un checkpoint de investigación en inglés de 1.336.035.328 parámetros (aproximadamente 1,34B) derivado de OLMo2 1B, un transformer decoder-only de tipo causal. Lo publica el usuario de HuggingFace `itamarstahl`, y forma parte del trabajo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, firmado por Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher. No es un modelo de propósito general: es un artefacto experimental de edición de conocimiento.

El punto de partida es un OLMo2 1B en inglés entrenado sobre el corpus Wikipedia anotado por entidades LMEnt, sin ajuste por instrucciones. Sobre esa base se aplica una edición de borrado de concepto centrada en «Ancient Rome»: primero EMBER con δ = 200 y después SNMF con selección de características basada en ratio sobre los pesos de entrada de las MLP. El resultado es el checkpoint V2 seleccionado por el paper (etiqueta candidata `snmfv2_rome_ratio_in`, configuración del apéndice B.3), elegido con una regla fija sobre el split de selección antes de tocar el conjunto de test reservado.

Su relevancia es metodológica: se publica junto a un gemelo de control completo y un gemelo con exclusión de concepto, lo que permite medir por separado la supresión del concepto objetivo y el parecido con el modelo que nunca vio el concepto. El propio autor advierte que las métricas no demuestran borrado amplio de conocimiento, seguridad ni generalización a otros conceptos. El repositorio no declara licencia de pesos y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia OLMo2 1B) |
| Parametros totales | 1.336.035.328 (aprox. 1,34B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la model card. Los pesos publicados son safetensors en precision completa (repo de 5,3 GB, coherente con fp32) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible: la model card indica explicitamente que no se declara licencia de pesos |
| Formato de pesos | Safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La base es un modelo de lenguaje causal de la familia OLMo2 con 1,34B de parametros, entrenado en ingles sobre el corpus LMEnt de Wikipedia con anotaciones de entidades. La model card insiste en que se trata del modelo base sin ajuste por instrucciones, por lo que no hay etapa de alineamiento tipo RLHF o DPO documentada en la informacion disponible.

Sobre ese modelo se aplica una edicion en dos fases. Primero se ejecuta EMBER con δ = 200. Despues se vuelven a derivar las caracteristicas SNMF sobre el modelo ya editado (no sobre el original) y se factorizan las capas 4 a 6 con rango 100, umbral de ratio 2,0, semilla 42, longitud maxima de secuencia 256 y fuerza de eliminacion exacta de componentes igual a 1, editando los pesos de entrada de las MLP. La seleccion de caracteristicas es por ratio y actua del lado de entrada, de ahi la etiqueta `ratio_in`. A diferencia del gemelo con exclusion de concepto, este checkpoint no se entreno enmascarando del loss los fragmentos vinculados al concepto: la supresion se consigue mediante edicion post-entrenamiento, no durante el preentrenamiento.

## Capacidades

- Generacion de texto en ingles: es un modelo base causal, orientado a continuacion y completion de texto, no a dialogo instruido.
- Modelado de lenguaje sobre material de estilo enciclopedico, heredado del corpus Wikipedia LMEnt con anotaciones de entidades.
- Supresion del concepto «Ancient Rome» mediante edicion post-entrenamiento (SNMF + EMBER), con un efecto medido en el paper.
- Funciona como pieza de un trio experimental: este checkpoint editado, un gemelo de control completo (`lment-1b-control-2e-b131k`) y un gemelo con exclusion de concepto (`lment-1b-norome-2e-b131k`).
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode).
- No hay capacidades de vision, audio ni multimodalidad.
- Capacidad multilingue: no. Solo ingles.
- La etiqueta `conversational` aparece en los tags del repositorio, pero la model card afirma que el modelo base no tiene ajuste por instrucciones; conviene tratar esa etiqueta como no verificada.

## Casos de uso

- Investigacion en edicion de conocimiento y desaprendizaje (machine unlearning): el checkpoint sirve como sujeto de prueba para comparar EMBER, RMU y SNMF bajo una evaluacion emparejada, usando el gemelo de control y el gemelo con exclusion de concepto como referencias.
- Reproducibilidad de resultados academicos: al publicarse la configuracion exacta (δ = 200, rango 100, capas 4-6, umbral de ratio 2,0, semilla 42), permite replicar la seleccion del checkpoint V2 sin reentrenar.
- Analisis de interpretabilidad sobre las capas 4-6: las caracteristicas SNMF factorizadas y editadas en los pesos de entrada de las MLP se pueden inspeccionar para estudiar que direcciones representacionales codifican el concepto editado.
- Generacion de texto enciclopedico en ingles sobre temas ajenos a Roma clasica: el modelo conserva la capacidad de continuar texto de estilo Wikipedia, siempre que el dominio no sea el concepto editado.
- Fine-tuning ligero como base en ingles: con 1,34B de parametros cabe en una unica GPU consumer, lo que lo hace viable como punto de partida para ajustes sobre corpus propios en ingles.
- Prototipado de pipelines de inferencia local: sirve para validar despliegues con transformers, vLLM o llama.cpp en hardware modesto antes de escalar a modelos mayores.
- Estudio de interferencia y olvido colateral: las metricas `R_abs` y `R_KL` permiten cuantificar cuanto se aleja el modelo editado del control completo frente al gemelo con exclusion, un caso de analisis util para medir dano colateral de la edicion.
- Docencia en cursos de interpretabilidad: el trio de checkpoints ofrece un ejemplo reproducible de como separar supresion de concepto y parecido con el modelo que nunca lo vio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta las tres metricas propias del paper, calculadas sobre el conjunto de test reservado:

| Metrica | Valor | Interpretacion segun el autor |
|---|---:|---|
| `H_test` (eficacia sobre el objetivo y preservacion) | 0,000 | Metrica conjunta de eficacia y preservacion sobre el test reservado |
| `R_abs` (distancia NLL de respuesta correcta al gemelo / distancia al modelo completo) | 1,558 | Mayor que 1: el modelo editado queda mas lejos del gemelo que el control completo en esta medida |
| `R_KL` (distancia KL de vocabulario completo con teacher forcing al gemelo / al modelo completo) | 2,181 | Mayor que 1: el modelo editado queda mas lejos del gemelo que el control completo en esta medida |

El autor subraya que valores por debajo de 1 en cualquiera de los dos ratios indican movimiento hacia el gemelo, y que la supresion del concepto y el parecido con el gemelo son resultados distintos que no deben confundirse.

## Requisitos de hardware

- VRAM estimada solo para pesos: unos 5,3 GB en fp32, unos 2,7 GB en fp16/bf16, unos 1,4 GB en int8 y unos 0,8 GB en int4. Hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto, dato no disponible.
- El repositorio ocupa 5,3 GB, consistente con pesos en fp32; para inferencia conviene cargar con `torch_dtype="auto"` o convertir a bf16.
- Cabe con holgura en GPUs consumer: RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 en bf16; incluso tarjetas de 8 GB pueden alojarlo en bf16 con contexto moderado.
- GPUs de centro de datos (A100, H100, L40S) son sobredimensionadas para este tamano, aunque utiles para barridos de evaluacion en paralelo.
- Opciones de despliegue: `transformers` (via `AutoModelForCausalLM`), vLLM, TGI, y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible. El repositorio tiene la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con los endpoints de HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `itamarstahl/lment-1b-rome-snmf-ember-ratio-in-b131k` (este modelo) | 1,34B | No disponible | No declarada | HuggingFace |
| `itamarstahl/lment-1b-control-2e-b131k` (gemelo de control completo) | Misma base, 1,34B | No disponible | No disponible | HuggingFace |
| `itamarstahl/lment-1b-norome-2e-b131k` (gemelo con exclusion del concepto) | Misma base, 1,34B | No disponible | No disponible | HuggingFace |
| OLMo2 1B (modelo base de la familia) | Aprox. 1,3B | No disponible | No disponible | HuggingFace |
| Llama 3.2 1B | Aprox. 1,24B | 128k | Llama 3.2 Community License | HuggingFace, ampliamente desplegado |
| Qwen2.5 1.5B | Aprox. 1,54B | 32k | Apache 2.0 | HuggingFace, ampliamente desplegado |

Nota: los datos de Llama 3.2 1B y Qwen2.5 1.5B son aproximados y provienen de sus respectivas model cards publicas; se incluyen solo como referencia de categoria, no como resultados medidos en la informacion proporcionada. La comparacion de rendimiento entre este checkpoint y esos modelos no es posible con los datos disponibles.

## Limitaciones y advertencias

- Licencia no declarada: la model card afirma explicitamente que no se asegura licencia de pesos, por lo que el uso comercial queda en un limbo legal y no deberia asumirse permitido.
- Artefacto de investigacion con 0 descargas y 0 likes: sin validacion independiente de la comunidad.
- El paper prueba solo tres conceptos seleccionados con 50 preguntas reservadas por concepto. Estas medidas no establecen borrado amplio de conocimiento, seguridad ni generalizacion a otros conceptos.
- El modelo base deriva de Wikipedia, por lo que puede reproducir errores y sesgos presentes en su material de entrenamiento.
- No tiene ajuste por instrucciones: no es fiable siguiendo ordenes, manteniendo formato ni gestionando conversaciones multi-turno. La etiqueta `conversational` del repositorio contradice este punto y deberia ignorarse salvo verificacion.
- Riesgo de alucinacion propio de un modelo de lenguaje base de 1,34B sin alineamiento.
- Cobertura limitada al ingles; cualquier uso en castellano u otros idiomas no esta soportado.
- Longitud de contexto no documentada, lo que impide dimensionar con precision la cache KV y los despliegues con ventanas largas.
- Interpretacion delicada de las metricas: `R_abs` = 1,558 y `R_KL` = 2,181 indican mayor distancia al gemelo que el control completo, no mayor parecido; la supresion del concepto y la semejanza al gemelo son fenomenos distintos.
- Las fechas de creacion y actualizacion del repositorio (2026-09-28) y el ano de la cita (2026) son posteriores a la fecha habitual de publicacion de modelos OLMo2; conviene verificar la procedencia antes de citarlo.
- No se distribuyen pesos en GGUF ni cuantizaciones listas para llama.cpp u Ollama: habria que generarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-rome-snmf-ember-ratio-in-b131k
- Gemelo de control completo: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con exclusion de concepto: https://huggingface.co/itamarstahl/lment-1b-norome-2e-b131k
- Paper citado: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (URL no disponible en la informacion proporcionada).
