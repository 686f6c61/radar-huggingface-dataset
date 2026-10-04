# likhitbhogadi/anlp-a2-q1-dense

## Resumen

`likhitbhogadi/anlp-a2-q1-dense` es un transformer decoder-only de 35,3 millones de parametros entrenado desde cero para traduccion automatica de vietnamita a ingles (vi→en) y de japones a ingles (ja→en). Lo publica el usuario likhitbhogadi como parte de una asignatura de procesamiento de lenguaje natural (etiqueta `anlp-assignment`), entrenado sobre el corpus `belumind/en-vi-ja-curated-500k-triplets` con un presupuesto declarado de 30 millones de tokens.

El modelo es completamente denso: su FFN es un MLP estandar de dos capas y los 35.265.024 parametros estan activos en cada paso. Conviene senalar que entre las etiquetas del repositorio aparece `mixture-of-experts`, pero la propia model card indica explicitamente que la variante de FFN es densa, por lo que se trata de un etiquetado incorrecto. El formato de secuencia utilizado es `<bos> <vi|ja> source <2en> target <eos>`, con un tokenizador BPE compartido en `tokenizer.json`.

Su interes es fundamentalmente academico y de reproducibilidad: es un caso de estudio de traduccion neuronal de tamano muy reducido, con metricas publicadas y log de entrenamiento trazable, no un modelo orientado a produccion. Con 0 descargas y 0 likes en el momento de la consulta, su relevancia practica es marginal; su valor reside en servir como referencia docente y como punto de partida para experimentos controlados de NMT a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN denso (MLP de 2 capas) |
| Parametros totales | 35.265.024 (35,3 M) |
| Parametros activos | 35.265.024 (modelo denso; la etiqueta `mixture-of-experts` del repo no coincide con la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), vietnamita (vi), japones (ja); traduccion en direccion vi→en y ja→en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Tokenizador | BPE compartido (`tokenizer.json`) |
| Pipeline declarado | translation |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only entrenado desde cero, sin inicializacion a partir de un modelo preentrenado. La unica variante arquitectonica declarada es el tipo de FFN: denso, con un MLP estandar de dos capas, frente a alternativas tipo MoE que la propia model card descarta. El modelo codifica la direccion de traduccion y el idioma de origen en la secuencia de entrada mediante el formato `<bos> <vi|ja> source <2en> target <eos>`, de modo que una unica red cubre las dos direcciones de traduccion (vi→en y ja→en) y se apoya en un tokenizador BPE compartido entre los tres idiomas.

El entrenamiento se realizo sobre el dataset `belumind/en-vi-ja-curated-500k-triplets` con un total declarado de 30 millones de tokens. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna otra fase de alineacion posterior al entrenamiento supervisado. Tampoco se detallan la composicion exacta del dataset, la configuracion de hiperparametros, el numero de pasos ni la estrategia de decodificacion durante el entrenamiento, mas alla de que las metricas de test se obtuvieron con decodificacion greedy. El codigo del modelo se encuentra en `src/part1/model.py` dentro del repositorio de la asignatura, y existe un log publico del entrenamiento en Weights & Biases.

## Capacidades

- Traduccion automatica vi→en: traduccion de vietnamita a ingles, con BLEU de test de 34,014 (greedy, sacrebleu 13a).
- Traduccion automatica ja→en: traduccion de japones a ingles, con BLEU de test de 24,111 (greedy, sacrebleu 13a).
- Modelo multilingue de tres idiomas: el tokenizador BPE es compartido entre ingles, vietnamita y japones.
- Generacion de texto condicionada a una etiqueta de idioma y de direccion mediante la secuencia `<bos> <vi|ja> source <2en> target <eos>`.
- Decodificacion greedy soportada y documentada; no se describe el uso de beam search ni de muestreo en la informacion disponible.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documenta soporte de contexto largo ni una ventana de contexto concreta.

## Casos de uso

- Prototipado academico de NMT: permite reproducir un pipeline completo de traduccion neuronal (tokenizacion, entrenamiento desde cero, evaluacion con sacrebleu) en una unica GPU consumer, gracias a sus 35,3 M de parametros y a su presupuesto de 30 M de tokens.
- Traduccion vi→en de frases cortas en herramientas internas: su BLEU de 34,014 en test lo hace util para previsualizaciones o borradores de traduccion en entornos donde no se requiere calidad de produccion.
- Traduccion ja→en de titulares y textos breves: con BLEU de 24,111, encaja en tareas de baja exigencia como clasificacion previa, indexacion o resumen de contenido japones.
- Generacion de pseudo-etiquetas y aumentacion de datos: puede traducir grandes volumenes de texto vi o ja a ingles para preentrenar o aumentar datasets de modelos mayores, dado su bajo coste computacional de inferencia.
- Base para fine-tuning en dominios concretos: al ser un modelo pequeno entrenado desde cero, sirve como punto de partida para ajustes sobre jerga tecnica, legal o medica con presupuestos de computo minimos.
- Despliegue en entornos sin GPU: sus ~141 MB en fp32 permiten ejecucion en CPU o en dispositivos con memoria muy limitada para tareas de traduccion por lotes.
- Auditoria y ensenanza de tecnicas de NMT: la publicacion de `test_translations.csv` con cada traduccion greedy, su referencia y su BLEU por frase facilita el analisis de errores en clase o en investigacion.
- Evaluacion comparativa de variantes de FFN: al declarar explicitamente la variante densa, sirve como linea base frente a variantes MoE del mismo experimento.

## Benchmarks y rendimiento

Metricas publicadas en la model card. La perplejidad y el BLEU se calculan sobre el conjunto de test; el BLEU es greedy con sacrebleu 13a.

| Direccion | Perplejidad de test | BLEU de test (greedy, sacrebleu 13a) |
|---|---|---|
| vi→en | 8,2622 | 34,014 |
| ja→en | 13,3579 | 24,111 |
| Ambas | 10,5055 | 29,089 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 35.265.024 parametros): aproximadamente 141 MB en fp32, 71 MB en fp16/bf16 y 35 MB en int8. Son estimaciones derivadas del numero de parametros; el repositorio no publica cifras oficiales.
- Cabe en cualquier GPU consumer, incluidas integradas y modelos de gama de entrada con pocos GB de VRAM, y tambien en CPU.
- GPU recomendadas: no disponibles. Por tamano, una A100 o una H100 estarian completamente sobredimensionadas; bastaria una GTX 1650, una RTX 3060 o incluso hardware mas modesto.
- Opciones de despliegue: no disponible. La informacion proporcionada no indica compatibilidad con vLLM, llama.cpp, Ollama o TGI. Dado que el modelo se entrena desde cero con codigo propio (`src/part1/model.py`) y un tokenizador BPE personalizado, es previsible que requiera cargar la implementacion del repositorio de la asignatura en lugar de un motor de inferencia estandar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks de terceros ni comparaciones con otros modelos, y no se han publicado cifras de alternativas en la misma busqueda. Cualquier comparacion cuantitativa con otros sistemas de traduccion vi→en o ja→en exigiria evaluar los mismos conjuntos de test con la misma tokenizacion y la misma version de sacrebleu, algo que no se documenta aqui.

## Limitaciones y advertencias

- Alcance de traduccion restringido: solo se ha entrenado y evaluado en las direcciones vi→en y ja→en. No hay evidencia de que funcione en en→vi, en→ja, vi→ja o ja→vi.
- Tamano muy reducido: con 35,3 M de parametros, la calidad en frases largas, vocabulario especializado o matices pragmaticos sera limitada; el BLEU de ja→en (24,111) es notablemente inferior al de vi→en (34,014).
- Licencia no disponible: no se especifica ninguna licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido. En la practica, esto supone un riesgo legal para cualquier integracion en producto.
- Contexto desconocido: no se publica la longitud maxima de secuencia soportada, por lo que no se puede garantizar el comportamiento con entradas largas.
- Etiquetado contradictorio: el repositorio esta etiquetado como `mixture-of-experts` mientras que la model card describe un FFN denso. Cualquier herramienta que filtre por esa etiqueta puede seleccionar el modelo de forma erronea.
- Riesgo de alucinacion: al ser un modelo de traduccion entrenado desde cero y de baja capacidad, puede generar contenido no presente en el texto de origen, especialmente en segmentos largos o con vocabulario poco frecuente. No se documenta ninguna tecnica de mitigacion.
- Sesgos: no se publica ninguna evaluacion de sesgo, toxicidad o equidad demografica. El dataset de entrenamiento es una seleccion curada de terceros (`belumind/en-vi-ja-curated-500k-triplets`) y no se detalla su composicion ni su procedencia.
- Trazabilidad incompleta: no se documentan hiperparametros, configuracion de contexto, ni el proceso exacto de decodificacion mas alla de "greedy".
- Procedencia academica: es un entregable de asignatura, sin mantenimiento declarado, sin descargas y sin garantias de soporte.
- Reproducibilidad: no se puede verificar el entrenamiento sin el repositorio de la asignatura, cuya URL no se incluye en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/likhitbhogadi/anlp-a2-q1-dense
- Log de entrenamiento en Weights & Biases: https://wandb.ai/likhitbhogadi-iiit-hyderabad/anlp-a2-q1/runs/78v384k7
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Codigo del modelo: `src/part1/model.py` dentro del repositorio de la asignatura (URL no disponible)
- Traducciones de test con BLEU por frase: `test_translations.csv` (incluido en el repositorio del modelo)
- Tokenizador: `tokenizer.json` (incluido en el repositorio del modelo)
