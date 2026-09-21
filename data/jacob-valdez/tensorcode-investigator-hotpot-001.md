# jacob-valdez/tensorcode-investigator-hotpot-001

## Resumen

TensorCode Investigator support relevance prototype es un checkpoint experimental publicado por el usuario jacob-valdez bajo la libreria `tensorcode`. No es un modelo generativo ni un agente cognitivo general: es un modelo pequeno (13.590.657 parametros, unos 13,6 M) cuyo unico objetivo es puntuar y ordenar documentos candidatos para una pregunta, reproduciendo las anotaciones de hechos de soporte (supporting facts) del dataset HotpotQA. Combina un encoder propio, un espacio de trabajo diferenciable compartido (shared differentiable workspace) y una cabeza de puntuacion de candidatos.

El modelo resuelve un problema acotado dentro de los pipelines de generacion aumentada por recuperacion (RAG): dado un conjunto de pasajes candidatos, decidir cuales son los que realmente sustentan la respuesta. La model card reporta una mejora medida en `support_hit_at_1` de 0,28125 a 0,5546875 tras el entrenamiento, frente a 0,53125 de una linea base lexica basada en solapamiento de tokens de la pregunta con el pasaje. Es relevante como artefacto de investigacion reproducible (manifiesto de entrenamiento, ablacion de workspace, IDs de validacion fijados), no como componente listo para produccion.

Se publica con licencia no declarada, sin idiomas documentados, con 0 descargas y 0 likes en el momento de la consulta, y con un tamano de repositorio de 0,1 GB. La propia model card insiste en que se trata de un modelo "estrecho" de ranking de soporte y no de razonamiento o planificacion generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder propio + espacio de trabajo diferenciable compartido + cabeza de puntuacion de candidatos |
| Parametros totales | 13.590.657 (~13,6 M) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, GPTQ, AWQ ni bitsandbytes) |
| Idiomas soportados | no disponible (el dataset de entrenamiento, HotpotQA, es en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de carga | tensorcode (`Investigator.from_pretrained`) |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | hotpotqa/hotpot_qa |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |
| Etiquetas | tensorcode, safetensors, experimental, region:us |

## Arquitectura y entrenamiento

La model card describe tres componentes: un encoder propio (owned encoder), un espacio de trabajo diferenciable compartido entre ramas y una cabeza de puntuacion de candidatos. El autor indica que el manifiesto (`training-manifest.json`) identifica los pesos fundacionales heredados cuando se usan, y que los modelos fundacionales quedan fijados (pinned) en dicho manifiesto. El vocabulario nuevo y los gradientes se construyen unicamente con las preguntas de entrenamiento, mientras que los recursos del tokenizador fundacional se heredan. Los identificadores de validacion oficial se fijan antes del ajuste, y la epoca final se guarda sin seleccion basada en validacion.

La tarea de entrenamiento es el ranking de documentos: la entrada contiene una pregunta e hipotesis (modo Investigator) o un objetivo y planes (modo Planner), y cada candidato aporta `id` y `text`. No se documentan el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron RLHF, DPO u otras tecnicas de alineacion; esos datos solo se remiten al manifiesto del repositorio. La innovacion declarada es el espacio de trabajo diferenciable, aunque la propia ablacion `zero_workspace` no demuestra un beneficio consistente en las metricas sobre el subconjunto de validacion retenido, y el autor lo admite explicitamente.

## Capacidades

- Ranking y reranking de documentos candidatos: asigna una puntuacion de relevancia a cada pasaje respecto de una pregunta.
- Identificacion de hechos de soporte (supporting facts) en el esquema de HotpotQA, con metricas de `support_hit_at_1` y `support_recall_at_2`.
- Modo Investigator: recibe pregunta e hipotesis junto con candidatos `id`/`text`.
- Modo Planner: recibe objetivo y planes en lugar de pregunta e hipotesis.
- Generacion de texto libre: no disponible; el modelo no es generativo ni conversacional.
- Razonamiento multi-paso o comportamiento agentico: no documentado y descartado explicitamente por el autor ("no es un agente cognitivo general").
- Tool calling / function calling: no documentado.
- Capacidades multilingues: no disponibles; no se declara ningun idioma y el entrenamiento usa HotpotQA en ingles.
- Capacidad especial: workspace diferenciable compartido entre ramas, con puntuaciones descritas como proxies de relevancia y no calibradas.

## Casos de uso

- Reranking en pipelines RAG multi-salto: dado un conjunto de pasajes recuperados por un buscador (BM25, embeddings), el modelo puede reordenarlos para colocar primero los que sustentan la respuesta, reduciendo el ruido que se envia al LLM generador.
- Filtrado de contexto antes de la generacion: al seleccionar los dos candidatos mejor puntuados se reduce el numero de tokens de contexto, lo que abarata la inferencia del modelo generativo posterior.
- Reproduccion de baselines academicos: el repositorio incluye metricas antes/despues frente a una linea base lexica comparable, lo que permite replicar el experimento y comparar el aporte del encoder frente al simple solapamiento de tokens.
- Investigacion sobre espacios de trabajo diferenciables: la ablacion `zero_workspace` permite estudiar si el workspace compartido aporta senal en esta tarea concreta.
- Prototipado en CPU: con 13,6 M de parametros, se puede integrar en scripts de evaluacion o notebooks sin GPU dedicada.
- Screening documental en dominios cerrados: partiendo del checkpoint como inicializacion y ajustando con datos propios, podria emplearse como clasificador de relevancia de baja latencia en corpus internos.
- Validacion de conjuntos de datos: uso como herramienta auxiliar para comprobar si las etiquetas de soporte de un corpus tipo HotpotQA son recuperables por un modelo pequeno.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor en la model card. Corresponden a un subconjunto retenido de validacion oficial de HotpotQA y no son comparables con benchmarks generales (MMLU, HumanEval, GSM8K), que no se han medido.

| Configuracion | Loss | support_hit_at_1 | support_recall_at_2 |
|---|---|---|---|
| Antes del entrenamiento (`before`) | 2,2841717852279544 | 0,28125 | 0,25 |
| Despues del entrenamiento (`after`) | 2,052191592287272 | 0,5546875 | 0,42578125 |
| Ablacion sin workspace (`zero_workspace`) | 2,0580312702804804 | 0,5546875 | 0,43359375 |
| Recarga del checkpoint (`reloaded`) | 2,052191592287272 | 0,5546875 | 0,42578125 |
| Baseline lexico del autor (solapamiento de tokens alfanumericos unicos) | no disponible | 0,53125 | 0,4296875 |

Perdida de entrenamiento por epoca (8 valores, en orden): 2,0581344543024898; 2,0137970969080925; 1,9991599032655358; 1,9846284333616495; 1,97900964692235; 1,9737375043332577; 1,9706492787227035; 1,959020284935832.

Metricas de desarrollo por checkpoint (8 entradas, `loss` / `hit_at_1` / `recall_at_2`): 2,085578520782292 / 0,546875 / 0,421875; 2,0937450788915157 / 0,5546875 / 0,43359375; 2,0819874573498964 / 0,5625 / 0,4296875; 2,0911868726834655 / 0,609375 / 0,4453125; 2,0898405527696013 / 0,59375 / 0,45703125; 2,0994820408523083 / 0,609375 / 0,44921875; 2,0739225912839174 / 0,6015625 / 0,44921875; 2,0585968466475606 / 0,5703125 / 0,4609375.

Observacion relevante: el mejor `support_hit_at_1` visto durante el desarrollo es 0,609375, pero el checkpoint final guarda un modelo con 0,5546875 porque no se aplico seleccion por validacion.

## Requisitos de hardware

- VRAM en FP32: aproximadamente 54,4 MB solo para pesos (13.590.657 x 4 bytes), mas activaciones y overhead del runtime.
- VRAM en FP16/BF16: aproximadamente 27,2 MB para pesos.
- VRAM en INT8: aproximadamente 13,6 MB para pesos, si el usuario convierte los pesos por su cuenta (el repo no publica variantes cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM sirve; el modelo es irrelevante en terminos de exigencia. Funciona en GTX 1050, GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin diferencias practicas por capacidad.
- Cabe en GPU de consumo: si, en cualquier GPU moderna e incluso en GPU integradas y en CPU.
- Opciones de despliegue: la via documentada es la libreria `tensorcode` con `from tensorcode.tools.investigator import Investigator` e `Investigator.from_pretrained(path_or_repo)`. vLLM, llama.cpp, Ollama y TGI no son aplicables tal cual, porque no es un transformer generativo estandar y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo, y al ser un modelo de scoring sobre candidatos, la metrica relevante seria candidatos por segundo, que tampoco se documenta.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada modelos comparables con datos publicados. La busqueda web devolvio unicamente resultados no relacionados con el modelo (la enciclopedia Jacob, sanitarios Jacob Delafon y tuberias Jacob Dosatec), por lo que no hay datos de terceros que contrastar.

| Modelo | Parametros | Contexto | support_hit_at_1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TensorCode Investigator support relevance prototype | 13,6 M | no disponible | 0,5546875 | no disponible | HuggingFace (0 descargas) |
| Baseline lexico del propio autor (solapamiento de tokens) | no aplica | no aplica | 0,53125 | no aplica | descrito en la model card |
| Otros rerankers o modelos de recuperacion comparables | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion recibida |

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor, con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa.
- Licencia no declarada: no puede asumirse permiso de uso comercial. Antes de cualquier uso empresarial hay que contactar con el autor y obtener una licencia explicita.
- Las puntuaciones estan sin calibrar (uncalibrated), por lo que no deben interpretarse como probabilidades ni usarse con umbrales fijos sin recalibracion.
- El autor advierte que la atencion es enrutamiento aprendido, no prueba de soporte factual: una puntuacion alta no garantiza que el pasaje sostenga la respuesta.
- La ablacion `zero_workspace` no muestra un beneficio consistente del espacio de trabajo en las metricas evaluadas, lo que cuestiona el valor del componente diferencial del diseno.
- La epoca final se guarda sin seleccion basada en validacion; el checkpoint publicado rinde por debajo del mejor checkpoint observado durante el desarrollo (0,5546875 frente a 0,609375 en `support_hit_at_1`).
- Rendimiento absoluto limitado: un `support_hit_at_1` de 0,5546875 implica que casi la mitad de las preguntas no tienen su pasaje de soporte en primera posicion, insuficiente para uso autonomo sin verificacion humana o un segundo modelo.
- La mejora frente al baseline lexico es estrecha (0,5546875 frente a 0,53125 en `hit_at_1`) y la `recall_at_2` es incluso ligeramente inferior a la del baseline (0,42578125 frente a 0,4296875), lo que sugiere que parte del rendimiento podria explicarse por senales superficiales.
- Idiomas no documentados: el entrenamiento usa HotpotQA, en ingles; el comportamiento en castellano u otros idiomas es desconocido.
- Posibles sesgos heredados del dataset HotpotQA: corpus de Wikipedia en ingles, anotaciones crowdsourced y un sesgo de distribucion hacia preguntas multi-salto de ese dominio.
- No es un agente ni un planificador general; el propio autor indica que las puntuaciones del Planner son proxies de relevancia y no utilidad de plan medida.
- Longitud de contexto no disponible: existe riesgo de truncado silencioso al puntuar pasajes largos, sin que se documente el limite.
- Riesgo de alucinacion en sentido estricto bajo (no genera texto), pero si puede producir falsos positivos al marcar como soporte un pasaje irrelevante.
- Al ser un modelo de 13,6 M de parametros, no debe confundirse con un LLM: no responde preguntas por si mismo ni mantiene conversaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacob-valdez/tensorcode-investigator-hotpot-001
- Dataset de entrenamiento: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Paper de HotpotQA (referencia del dataset, no citado en la model card): no disponible en la informacion proporcionada.
- Repositorio de la libreria `tensorcode`: no disponible en la informacion proporcionada.
- Manifiesto de entrenamiento (`training-manifest.json`): referenciado en la model card dentro del repositorio del modelo, sin URL directa.
- Busqueda web: no se encontro ningun resultado relacionado con el modelo. Los enlaces devueltos correspondian a entidades homonimas sin relacion (articulos enciclopedicos sobre "Jacob", Jacob Delafon y Jacob Dosatec), por lo que se omiten.
