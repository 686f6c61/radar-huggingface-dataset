# dnebh/anlp-a2-part1-config3_moe_top2

## Resumen

`dnebh/anlp-a2-part1-config3_moe_top2` es un transformer decoder-only con arquitectura de mezcla de expertos (MoE) disenado especificamente para traduccion automatica de vietnamita a ingles (vi→en) y de japones a ingles (ja→en). Lo publica el usuario dnebh como parte de la asignatura Advanced NLP (ANLP), asignatura 2, parte 1, y corresponde a la variante de configuracion denominada `config3_moe_top2` dentro de una serie de experimentos comparativos sobre variantes de la capa feed-forward. No es un modelo de proposito general ni un lanzamiento de produccion: es un artefacto academico de investigacion.

El modelo tiene 33.489.920 parametros totales, de los cuales 24.986.624 estan activos por token, lo que confirma el enrutamiento disperso tipo top-2 sobre los expertos. Se entreno durante una sola epoca sobre un presupuesto de 39.234.273 tokens procedentes del dataset `belumind/en-vi-ja-curated-500k-triplets`, en aproximadamente 9.694 segundos (unas 2,7 horas). Los resultados declarados por el autor son una perplejidad de validacion de 5,5597, una perplejidad de test de 5,5745 y un BLEU de test de 31,136.

Su relevancia es limitada fuera del ambito academico: la model card no indica licencia, no hay informacion sobre cuantizaciones ni idiomas declarados en los metadatos de HuggingFace, y el propio autor indica que debe cargarse mediante una funcion personalizada del repositorio de la asignatura (`src.part1.hub.load_exported_model`), no con las utilidades estandar de Transformers. Su interes real es como punto de comparacion reproducible frente a otras variantes del mismo experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), configuracion `config3_moe_top2` |
| Parametros totales | 33.489.920 |
| Parametros activos | 24.986.624 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors) |
| Idiomas soportados | vietnamita a ingles y japones a ingles (pares de traduccion declarados en la model card); idiomas generales del modelo no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Presupuesto de tokens de entrenamiento | 39.234.273 |
| Epocas | 1 |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento

La model card describe un transformer decoder-only orientado a traduccion. La variante `config3_moe_top2` introduce una capa feed-forward con mezcla de expertos y enrutamiento top-2, es decir, cada token activa dos expertos de los disponibles. Esto explica la diferencia entre parametros totales (33,49 M) y parametros activos (24,99 M): aproximadamente el 25 % de los parametros queda inactivo en cada paso forward. El modelo forma parte de un conjunto de cinco variantes feed-forward que el autor y otros companeros de asignatura comparan bajo un presupuesto de tokens identico, lo que lo convierte en un experimento controlado sobre el diseno de la capa FFN.

El entrenamiento consumio exactamente 39.234.273 tokens en una unica epoca, con un presupuesto por epoca identico (39.234.273), lo que indica que se agoto el dataset en una pasada. El dataset declarado es `belumind/en-vi-ja-curated-500k-triplets`, un corpus de tripletas en ingles, vietnamita y japones. El tiempo de entrenamiento registrado fue de 9.694,22 segundos. No se documenta en la informacion disponible si hubo ajuste por RLHF, DPO, instrucciones o decodificacion especulativa; tampoco se detalla la composicion interna del dataset mas alla de su nombre. Las metricas finales reportadas son perplejidad de validacion 5,5597, perplejidad de test 5,5745 y BLEU de test 31,136.

## Capacidades

- Traduccion automatica de vietnamita a ingles (vi→en) y de japones a ingles (ja→en), que es la unica tarea declarada explicitamente en la model card.
- Generacion de texto condicionada, al ser un modelo decoder-only autoregresivo.
- Aprovechamiento de parametros dispersos mediante enrutamiento top-2, con 24.986.624 parametros activos por token.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues adicionales: no disponibles; los metadatos de HuggingFace no declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Traduccion vi→en en pipelines de documentacion tecnica: el modelo puede procesar texto en vietnamita y generar la version en ingles dentro de un flujo automatizado de localizacion, aprovechando que el par vi→en es uno de los dos objetivos declarados del entrenamiento.
- Traduccion ja→en de contenido interno de producto: util para convertir notas de release, incidencias o documentacion redactadas en japones a ingles antes de integrarlas en un sistema de gestion de conocimiento.
- Prototipado academico de variantes MoE: sirve como referencia reproducible para comparar el efecto del enrutamiento top-2 frente a otras configuraciones feed-forward bajo un presupuesto fijo de 39,2 M de tokens.
- Experimentos de investigacion sobre eficiencia de parametros: con 33,49 M totales y 24,99 M activos, permite medir la relacion entre parametros activos, perplejidad y BLEU en un modelo de escala pequena.
- Generacion de pares paralelos sinteticos: puede emplearse para crear corpus de traduccion vi→en o ja→en destinados a aumentar otros datasets, siempre con revision humana posterior.
- Evaluacion comparativa de metricas de traduccion: util como baseline de BLEU y perplejidad en trabajos que analicen modelos de menos de 50 M de parametros, ya que publica ambas metricas (BLEU 31,136 y perplejidad de test 5,5745).
- Demostraciones docentes en el aula: al ocupar 0,1 GB y caber en cualquier hardware, permite ilustrar en clase como funciona el enrutamiento MoE sobre un caso de traduccion real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad de validacion (val_ppl) | 5,5597 |
| Perplejidad de test (test_ppl) | 5,5745 |
| BLEU de test (test_bleu) | 31,136 |
| Presupuesto de tokens | 39.234.273 |
| Tokens consumidos | 39.234.273 |
| Tiempo de entrenamiento | 9.694,22 s |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. Las unicas metricas disponibles son las declaradas por el autor en la model card.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 134 MB solo para los pesos (33,49 M × 4 bytes), mas el coste de activaciones y del enrutador de expertos.
- VRAM estimada en FP16/BF16: aproximadamente 67 MB para los pesos.
- VRAM estimada en INT8: aproximadamente 33 MB.
- VRAM estimada en INT4: aproximadamente 17 MB. No obstante, el repositorio no publica versiones cuantizadas, por lo que estas cifras son estimaciones teoricas de tamano, no artefactos disponibles.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090, e incluso GPU integradas de portatil. Igualmente viable en CPU.
- Cabe en GPU consumer: si, con amplio margen, en practicamente cualquier GPU con al menos 1 GB de VRAM o incluso en inferencia por CPU.
- Opciones de despliegue: la model card indica carga mediante `src.part1.hub.load_exported_model(<folder>)` del repositorio de la asignatura, lo que implica codigo personalizado. No hay evidencia de compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, y al no existir pesos GGUF ni configuracion estandar publicada, el despliegue con esas herramientas requeriria conversion previa. No disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Presupuesto de tokens | Tarea | Licencia | Datos publicos |
|---|---|---|---|---|---|
| dnebh/anlp-a2-part1-config3_moe_top2 | 33,49 M totales, 24,99 M activos | 39,23 M | vi→en y ja→en | no disponible | BLEU test 31,136; ppl test 5,5745 |
| orangebreak/anlp-a2-part1-moe-30M | aproximadamente 30 M (segun nombre) | 30.000.128 | vi→en y ja→en | no disponible | no disponible en la busqueda |
| Arihant25/anlp-a2-moe | no disponible | no disponible | traduccion vi→en y ja→en (misma asignatura) | no disponible | no disponible en la busqueda |

Los tres modelos pertenecen al mismo contexto academico (Advanced NLP Assignment 2) y comparten la tarea de traduccion vi→en y ja→en, pero solo el modelo de dnebh publica en la informacion disponible un desglose detallado de parametros, tokens y metricas. La comparacion cuantitativa directa no es posible con los datos disponibles. Modelos de traduccion de proposito general como NLLB-200 o M2M-100 no son directamente comparables por escala, licencia y regimen de entrenamiento, y no se dispone de sus cifras en esta informacion para establecer una comparativa honesta.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion. Conviene tratar el modelo como no apto para produccion hasta que el autor aclare la licencia.
- Modelo de ambito academico: forma parte de una asignatura y esta pensado como ejercicio comparativo, no como un sistema validado en produccion.
- Sesgos conocidos: no disponible; no se documenta analisis de sesgos ni composicion detallada del dataset.
- Riesgo de alucinacion: inherente a cualquier modelo generativo autoregresivo; en traduccion se manifiesta como omisiones, adiciones o traducciones inventadas, especialmente fuera del dominio del corpus de entrenamiento.
- Cobertura de idiomas muy restringida: solo se declaran los pares vi→en y ja→en, y no se garantiza un comportamiento correcto en otras direcciones (por ejemplo en→vi o en→ja) ni en otros idiomas.
- Longitud de contexto no disponible: al no publicarse, no puede planificarse el tratamiento de documentos largos sin truncado o segmentacion previa.
- Carga no estandar: requiere la funcion `load_exported_model` del repositorio de la asignatura, lo que dificulta la integracion con ecosistemas estandar como HuggingFace Transformers, vLLM o llama.cpp sin trabajo adicional.
- Un unico epoch sobre 39,2 M de tokens: presupuesto de entrenamiento muy reducido, lo que limita la calidad alcanzable y hace probable el infraentrenamiento en dominios especializados.
- Metricas no auditadas: las cifras de BLEU y perplejidad las declara el propio autor y no hay evidencia de evaluacion independiente.
- Disponibilidad y mantenimiento: 0 descargas y 0 me gusta en el momento de redactar la ficha, sin garantia de soporte, actualizaciones ni correccion de errores.
- La fecha de creacion registrada (2026-09-30) es posterior a la fecha actual en muchos contextos de consulta; conviene verificar si se trata de un error de metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dnebh/anlp-a2-part1-config3_moe_top2
- Informe de entrenamiento en Weights & Biases: https://wandb.ai/dnebhrajani-v/anlp-a2-part1/runs/s6m7oaso
- Modelo comparable de la misma asignatura (orangebreak): https://huggingface.co/orangebreak/anlp-a2-part1-moe-30M
- Modelo comparable de la misma asignatura (Arihant25): https://huggingface.co/Arihant25/anlp-a2-moe
- Dataset declarado en la model card: `belumind/en-vi-ja-curated-500k-triplets` (referencia de HuggingFace, no verificada en la busqueda)
- Paper de referencia sobre arquitecturas MoE en modelos abiertos (Qwen3 Technical Report): https://arxiv.org/abs/2505.09388
- Guia comparativa de variantes densas y MoE (contexto general): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Calendario de lanzamientos de modelos de IA (contexto general): https://www.scriptbyai.com/ai-model-release-calendar/
