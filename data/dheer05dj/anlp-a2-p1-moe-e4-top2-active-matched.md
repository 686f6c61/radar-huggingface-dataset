# dheer05dj/anlp-a2-p1-moe-e4-top2-active-matched

## Resumen

`dheer05dj/anlp-a2-p1-moe-e4-top2-active-matched` es un checkpoint de un transformer decoder-only con capas feed-forward de tipo Mixture-of-Experts (MoE), entrenado desde cero en PyTorch como parte de la Assignment 2 del curso ANLP (Advanced Natural Language Processing). El autor es `dheer05dj` y el modelo resuelve una tarea acotada de traduccion automatica: vietnamita a ingles (vi-en) y japones a ingles (ja-en). No es un modelo de proposito general ni un lanzamiento de producto, sino un artefacto academico reproducible.

La arquitectura declarada en la model card es compacta: `d_model` de 512, 8 capas, 8 cabezas de atencion, RoPE para codificacion posicional, RMSNorm y embeddings atados (tied embeddings). El bloque feed-forward usa 4 expertos con enrutamiento top-2, de ahi el sufijo `e4-top2` del identificador. Los pesos en safetensors suman 58.352.128 parametros totales, de los cuales 41.567.000 (aproximadamente) se activan por token en inferencia; el sufijo `active-matched` sugiere que la configuracion se diseno para igualar el numero de parametros activos de una linea base densa, un experimento habitual para comparar MoE frente a denso con presupuesto de computo comparable.

Su relevancia es fundamentalmente metodologica y educativa: sirve como caso de estudio de un MoE pequeno entrenado de principio a fin (107,3 millones de tokens en 10 minutos y 38 segundos), con metricas de traduccion publicadas (BLEU global 39,95; perplejidad de test 4,301). No hay informacion sobre licencia, idiomas declarados en metadatos de HuggingFace, longitud de contexto ni cuantizaciones publicadas, por lo que su uso en produccion requiere precaucion y verificacion manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas feed-forward Mixture-of-Experts (4 expertos, enrutamiento top-2), RoPE, RMSNorm, tied embeddings |
| Parametros totales | 58.352.128 (58,35 M) |
| Parametros activos | 41.570.000 aprox. (41,57 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible en metadatos; la model card describe entrenamiento para vi-en y ja-en |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio); incluye `config.json` con el `TransformerConfig` |
| Dimension del modelo (d_model) | 512 |
| Numero de capas | 8 |
| Cabezas de atencion | 8 |
| Vocabulario | no disponible |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only implementado desde cero en PyTorch, sin dependencia de bibliotecas de modelado estandar como `transformers`. La configuracion (`d_model` 512, 8 capas, 8 cabezas, RoPE, RMSNorm, tied embeddings) se almacena en `config.json` y es consumida por `src/part1/model.py` del repositorio de la assignment. La innovacion tecnica central es la capa feed-forward: en lugar de un FFN denso unico, se emplean 4 expertos con enrutamiento top-2 por token, lo que eleva el total de parametros a 58,35 M mientras mantiene 41,57 M activos por paso de inferencia. El identificador `active-matched` indica que la configuracion se ajusto para igualar el computo activo de una variante densa de referencia, presumiblemente para aislar el efecto del enrutamiento en la calidad de traduccion.

El entrenamiento consumio 107.305.098 tokens y se completo en 10 minutos y 38 segundos, segun la model card. No se documentan en la informacion disponible la composicion exacta del dataset, el numero de pasos, el tamano de batch, la tasa de aprendizaje ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se detalla el mecanismo de balanceo de carga entre expertos (auxiliary loss, capacity factor, etc.), un aspecto critico en MoE que queda sin especificar. La carga del checkpoint requiere codigo propio: la model card indica `src.part1.train.load_checkpoint(dir)`, y el modelo esta vinculado al repositorio de la assignment, no a un pipeline estandar de HuggingFace.

## Capacidades

- Traduccion automatica vietnamita-ingles y japones-ingles: es la unica tarea documentada, con BLEU de 44,83 en vi-en, 34,99 en ja-en y 39,95 agregado.
- Generacion de texto condicionada: al ser un decoder-only entrenado con objetivo autoregresivo, puede generar texto libre, aunque no hay evaluacion publicada fuera de la tarea de traduccion.
- Modelado de lenguaje bilingue de entrada: las perplejidades desagregadas (3,708 en vi y 4,989 en ja) sugieren mejor ajuste al vietnamita que al japones.
- Enrutamiento de expertos por token: capacidad arquitectonica de especializar subconjuntos de parametros segun el token, aunque no se publica analisis de especializacion por idioma o dominio.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues adicionales: no disponibles; no hay evidencia de idiomas distintos del vietnamita, japones e ingles.
- Ajuste por instrucciones: no disponible; no se documenta fine-tuning de tipo instruct ni alineacion.

## Casos de uso

- Traduccion de corpus vietnamitas a ingles en pipelines de datos: el modelo traduce vi-en con BLEU 44,83, por lo que resulta util como traductor por lotes para normalizar documentacion o datasets antes de alimentar modelos mayores. Su tamano de 58 M de parametros permite procesar volumenes altos en hardware modesto.
- Traduccion de documentacion tecnica japonesa: con BLEU 34,99 en ja-en, puede emplearse como primer paso de traduccion de manuales o articulos, siempre con revision humana dado el menor rendimiento frente a vi-en.
- Generacion de subtitulos y transcripciones: integrado en un pipeline de ASR vi/ja seguido de traduccion a ingles, permite producir subtitulos automaticos con un coste computacional bajo y latencia reducida en CPU.
- Preprocesado y aumento de datos para entrenamiento: puede generar traducciones sinteticas vi-en y ja-en para aumentar corpus paralelos, etiquetado debil o filtrado de pares de baja calidad mediante puntuaciones de perplejidad.
- Prototipado e investigacion en arquitecturas MoE: al ser un MoE funcional de 58 M de parametros con recetas de entrenamiento replicables, sirve como banco de pruebas para estudiar enrutamiento, balanceo de carga y especializacion de expertos sin el coste de un modelo a gran escala.
- Comparacion denso frente a MoE con presupuesto activo comparable: el sufijo `active-matched` lo convierte en el artefacto adecuado para reproducir experimentos controlados donde se mide si el enrutamiento top-2 aporta ganancias frente a un FFN denso con los mismos 41,57 M de parametros activos.
- Despliegue en entornos con recursos muy limitados: con 58,35 M de parametros, los pesos ocupan del orden de 117 MB en fp16 y menos de 60 MB en int8. Es viable ejecutarlo en CPU, en un portatil o en un dispositivo embebido con capacidad de memoria limitada, siempre que se porte el codigo de inferencia.
- Docencia y evaluacion academica: reproduce de forma completa el ciclo de entrenamiento, evaluacion con perplejidad y BLEU, y analisis comparativo entre variantes, lo que lo hace util como material de referencia en cursos de NLP.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los publicados por el autor en la model card, medidos sobre el conjunto de test de la assignment (no sobre benchmarks estandar de la comunidad). No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con modelos de referencia.

| Metrica | Valor |
|---|---|
| test_ppl (global) | 4,301 |
| test_ppl (vietnamita) | 3,708 |
| test_ppl (japones) | 4,989 |
| BLEU vi-en | 44,83 |
| BLEU ja-en | 34,99 |
| BLEU agregado | 39,95 |
| Tokens de entrenamiento | 107.305.098 |
| Tiempo de entrenamiento | 10 min 38 s |
| Parametros totales | 58,35 M |
| Parametros activos | 41,57 M |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. Los valores de BLEU corresponden a un conjunto de test propio del ejercicio academico y no son directamente comparables con resultados de WMT u otros benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no confirmada por el autor): aproximadamente 233 MB en fp32 (58,35 M x 4 bytes), 117 MB en fp16/bf16, 58 MB en int8 y 29 MB en int4, sin contar el cache KV ni las activaciones.
- Cache KV: no estimable con precision porque se desconoce la longitud de contexto, el vocabulario y la configuracion exacta de atencion.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores. Modelos como A100, H100 o RTX 4090 estan sobredimensionados para este tamano, aunque pueden usarse para entrenamiento o evaluacion por lotes a gran escala.
- Viabilidad en GPU de consumo: si, el modelo cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Inferencia en CPU: viable, siendo probablemente el modo de despliegue mas razonable dado el tamano.
- Opciones de despliegue: la arquitectura MoE esta implementada desde cero y no sigue el formato de `transformers`, por lo que vLLM, TGI, llama.cpp, Ollama o LM Studio no la soportan de forma nativa sin una conversion previa. El metodo documentado es cargar el checkpoint con el codigo de la assignment (`src.part1.train.load_checkpoint(dir)`) y ejecutar inferencia en PyTorch. Cualquier port a otros runtimes requiere implementar el enrutamiento top-2 y el formato de pesos manualmente.
- Latencia y throughput estimados: no disponibles. El dato de 10 min 38 s corresponde al entrenamiento completo sobre 107,3 M de tokens, no a inferencia.

## Comparativa con modelos similares

La informacion disponible solo permite identificar una alternativa dentro del mismo ecosistema (la propia assignment), sin datos de parametros ni metricas publicadas para ella.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dheer05dj/anlp-a2-p1-moe-e4-top2-active-matched | 58,35 M totales / 41,57 M activos | no disponible | Traduccion vi-en y ja-en | no disponible | HuggingFace, 0 descargas |
| abhirajratna/anlp-a2-moe-v5 | no disponible | no disponible | Traduccion vi-en y ja-en | no disponible | HuggingFace |
| Otras variantes bajo el tag `anlp-assignment-2` | no disponible | no disponible | Traduccion vi-en y ja-en | no disponible | HuggingFace |

El modelo comparable mas cercano es `abhirajratna/anlp-a2-moe-v5`, descrito como una de cinco variantes que solo difieren en la capa feed-forward, lo que confirma que existe una familia de experimentos controlados dentro de la misma assignment. No se dispone de sus parametros, metricas de BLEU ni licencia, por lo que no es posible establecer una comparacion cuantitativa. No se han identificado alternativas de proposito general comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Caracter academico: es un checkpoint de una assignment universitaria, no un modelo validado para produccion. No hay garantia de mantenimiento, soporte ni estabilidad de la API de carga.
- Licencia no especificada: al no declararse licencia en HuggingFace, no hay autorizacion explicita de uso comercial. Cualquier uso en produccion requiere contactar con el autor.
- Idiomas limitados: el entrenamiento documentado cubre unicamente vietnamita, japones e ingles. No hay evidencia de soporte para castellano ni para otras lenguas.
- Volumen de entrenamiento reducido: 107,3 M de tokens es un presupuesto muy bajo para estandar de calidad en traduccion; es probable que aparezcan errores en terminologia especializada, nombres propios, expresiones idiomaticas y frases largas.
- Riesgo de alucinacion: como todo modelo generativo autoregresivo entrenado con objetivo de maxima verosimilitud, puede producir contenido fluido pero incorrecto, especialmente fuera del dominio del corpus de entrenamiento.
- Longitud de contexto desconocida: no se publica la ventana de contexto, por lo que no se puede garantizar el comportamiento en documentos largos ni estimar el consumo de memoria del cache KV.
- Sin alineacion documentada: no se menciona RLHF, DPO ni fine-tuning por instrucciones, por lo que el modelo no rechazara peticiones problematicas ni seguira instrucciones complejas de forma fiable.
- Sesgos no evaluados: no hay analisis de sesgo de genero, raza, nacionalidad ni de sesgos derivados del corpus de entrenamiento, cuya composicion tampoco se detalla.
- Ausencia de analisis de enrutamiento: no se publica si los expertos estan balanceados, si se aplico auxiliary loss ni si existe colapso de expertos, lo que afecta a la reproducibilidad del experimento.
- Metricas no estandarizadas: los valores de BLEU y perplejidad proceden de un conjunto de test propio de la assignment, sin tokenizador ni procedimiento de evaluacion documentados, por lo que no son comparables con resultados publicados de WMT u otros benchmarks.
- Idoneidad para produccion: baja. Se recomienda tratarlo como referencia de investigacion o como material docente, no como componente critico de un servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dheer05dj/anlp-a2-p1-moe-e4-top2-active-matched
- Registros de entrenamiento en Weights & Biases: https://wandb.ai/dheer05k-iiit-hyderabad/anlp-a2-part1-moe/runs/rkmcejv2
- Modelo relacionado de la misma assignment: https://huggingface.co/abhirajratna/anlp-a2-moe-v5
- Busqueda de modelos con el tag de la assignment: https://huggingface.co/models?other=anlp-assignment-2
