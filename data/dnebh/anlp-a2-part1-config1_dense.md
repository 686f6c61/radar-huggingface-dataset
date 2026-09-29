# dnebh/anlp-a2-part1-config1_dense

## Resumen

`dnebh/anlp-a2-part1-config1_dense` es un transformer decoder-only de tipo denso con 33.489.920 parametros (aproximadamente 33,5 M), publicado por el usuario dnebh como parte de un trabajo academico de la asignatura ANLP (Advanced Natural Language Processing), correspondiente a la practica "A2 Part 1". El modelo esta especializado en traduccion automatica en dos direcciones: vietnamita a ingles (vi→en) y japones a ingles (ja→en). No es un modelo de proposito general ni un modelo de conversacion: es un checkpoint de traduccion entrenado desde cero sobre un conjunto de datos concreto.

El entrenamiento se realizo sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`, con un presupuesto total de 39.234.273 tokens consumidos en una sola epoca, lo que supone aproximadamente 3,37 horas de computo (12.145,06 segundos). Los resultados declarados por el autor son una perplejidad de validacion de 5,2313 y de test de 5,2372, junto con un BLEU de test de 31,7049. Estos valores son coherentes con un modelo pequeno entrenado con un presupuesto de tokens muy limitado (del orden de un token por parametro), mas propio de un ejercicio docente que de un sistema de produccion.

Su relevancia es, por tanto, limitada y muy acotada: sirve como referencia reproducible de un pipeline de entrenamiento y evaluacion de traduccion neuronal de bajo coste, no como alternativa a modelos multilingues de mayor escala. La model card no declara licencia, idiomas oficiales ni pipeline de HuggingFace, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. El checkpoint se carga mediante una funcion propia del repositorio de la practica (`src.part1.hub.load_exported_model`), no mediante `transformers` de forma estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (denso) |
| Parametros totales | 33.489.920 (33,5 M aproximadamente) |
| Parametros activos | 33.489.920 (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se declaran versiones GGUF, AWQ, GPTQ ni ONNX) |
| Idiomas soportados | vietnamita→ingles y japones→ingles (segun la model card; no hay lista oficial de idiomas en HuggingFace) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Nombre de configuracion | config1_dense |
| Presupuesto de tokens | 39.234.273 tokens (1 epoca) |
| Tokens consumidos | 39.234.273 |
| Tiempo de entrenamiento | 12.145,0565 s (aproximadamente 3,37 h) |
| Perplejidad de validacion | 5,2313 |
| Perplejidad de test | 5,2372 |
| BLEU de test | 31,7049 |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-09-29 |
| Ultima actualizacion | 2026-09-29 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La unica informacion arquitectonica publicada es que se trata de un transformer decoder-only. No se especifican en la model card el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la dimension de la capa feed-forward, el tipo de normalizacion, la posicion de las capas de normalizacion (pre-LN o post-LN) ni el mecanismo de posicionamiento (absoluto, relativo o RoPE). Tampoco se indica el vocabulario ni el tokenizador empleados, ni la longitud de contexto maxima soportada. La configuracion se denomina `config1_dense`, lo que sugiere que forma parte de una comparativa de configuraciones dentro de la practica, probablemente frente a variantes con mezcla de expertos (MoE).

En cuanto al entrenamiento, el autor declara un unico epoch sobre 39.234.273 tokens del dataset `belumind/en-vi-ja-curated-500k-triplets`, con una duracion total de 12.145,06 segundos. No se documenta si hubo tecnicas de ajuste adicionales como RLHF, DPO, SFT posterior o decodificacion especulativa, ni el regimen de aprendizaje (learning rate, scheduler, warmup), el tamano de batch, la precision de entrenamiento (fp32, bf16, fp16) o el hardware utilizado. Dado que el presupuesto de tokens es practicamente identico al numero de parametros, el modelo se encuentra en regimen de undertraining y no ha completado mas de una pasada sobre los datos.

## Capacidades

- Traduccion automatica vietnamita→ingles, segun la model card.
- Traduccion automatica japones→ingles, segun la model card.
- Generacion de texto autoregresiva condicionada a una secuencia de entrada (arquitectura decoder-only con atencion causal).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara modo de pensamiento (thinking mode) ni razonamiento explicito.
- No se declara capacidad de vision, audio ni multimodalidad.
- No se declara capacidad multilingue mas alla de los dos pares de traduccion mencionados; la lista oficial de idiomas en HuggingFace esta vacia.
- No se declara capacidad de generacion de codigo, matematicas ni uso general como asistente.

## Casos de uso

- Traduccion de documentacion tecnica del japones al ingles: el modelo puede emplearse para preprocesar manuales o notas de producto escritos en japones y obtener un borrador en ingles, con la salvedad de que su BLEU de 31,70 exige revision humana posterior.
- Traduccion de tickets de soporte en vietnamita: en un flujo interno de atencion al cliente, podria generar una primera version en ingles de las incidencias antes de su escalado a un equipo angloparlante.
- Traduccion de resenas y contenido generado por usuarios: foros, marketplaces o plataformas de contenido con audiencia vietnamita o japonesa podrian usarlo para producir traducciones aproximadas a bajo coste computacional.
- Prototipado academico y reproduccion de experimentos: es el caso de uso principal, ya que el checkpoint esta pensado para cargarse desde el repositorio de la practica y comparar configuraciones de arquitectura dentro de un mismo pipeline de evaluacion.
- Evaluacion comparativa de tecnicas de traduccion neuronal: sirve como linea base de bajo parametraje (33,5 M) frente a la cual medir mejoras de otras configuraciones o de modelos preentrenados de mayor tamano.
- Aprendizaje por transferencia (fine-tuning) en dominios muy especificos: al ser un modelo pequeno, puede ajustarse en una unica GPU consumer para un dominio concreto con vocabulario cerrado, siempre que se disponga de datos paralelos suficientes y se acepte que el punto de partida es limitado.
- Generacion de subtitulos traducidos en pipelines offline: el modelo cabe en memoria muy reducida, por lo que puede empaquetarse en procesos batch nocturnos para traducir grandes volumenes de frases cortas sin coste de API.
- Uso docente: ilustra de forma completa el ciclo de entrenamiento, validacion y publicacion de un modelo de traduccion en HuggingFace, incluido el registro en Weights & Biases.

## Benchmarks y rendimiento

Los unicos resultados publicados por el autor son las metricas internas de la practica. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, WMT u otros) en la informacion disponible.

| Metrica | Conjunto | Valor |
|---|---|---|
| Perplejidad | Validacion | 5,2313 |
| Perplejidad | Test | 5,2372 |
| BLEU | Test | 31,7049 |
| Epocas | Entrenamiento | 1 |
| Tokens consumidos | Entrenamiento | 39.234.273 |
| Tiempo de entrenamiento | Entrenamiento | 12.145,06 s (aproximadamente 3,37 h) |

No se especifica la composicion del conjunto de test, ni si el BLEU de 31,70 corresponde al promedio de los pares vi→en y ja→en o a uno solo de ellos, ni la herramienta de calculo del BLEU (por ejemplo, sacreBLEU).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 134 MB solo para los pesos (33,5 M parametros x 4 bytes), mas activaciones y cache KV, que en la practica suponen unos pocos cientos de MB.
- VRAM estimada en fp16/bf16: aproximadamente 67 MB para los pesos.
- VRAM estimada en int8: aproximadamente 34 MB para los pesos.
- VRAM estimada en int4: aproximadamente 17 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050/1650, RTX 2060, RTX 3060, RTX 4090, e incluso en CPU o en dispositivos tipo Raspberry Pi.
- GPU de datacenter (A100, H100, L40S) no son necesarias; el modelo no las aprovechara por su tamano.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni similar. La model card indica que el modelo se carga mediante `src.part1.hub.load_exported_model(<folder>)` del repositorio de la practica, lo que implica un proceso de carga propio y no estandar.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento verificados en la informacion proporcionada para los modelos alternativos, por lo que las celdas de rendimiento se marcan como no disponibles. Los valores de parametros de los alternativos son referencias publicas aproximadas y pueden variar segun la version.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| dnebh/anlp-a2-part1-config1_dense | 33,5 M | no disponible | vi→en, ja→en | no disponible | Perplejidad test 5,2372; BLEU test 31,7049 |
| Helsinki-NLP/opus-mt (familia MarianMT) | aproximadamente 74-77 M por par de idiomas | no disponible | pares concretos, no multilingue | principalmente CC-BY-4.0 | no disponible |
| google-t5/t5-small | aproximadamente 60 M | 512 tokens (habitual) | ingles y multilingue limitado | Apache-2.0 | no disponible |
| facebook/nllb-200-distilled-600M | aproximadamente 600 M | 1024 tokens (habitual) | mas de 200 idiomas | CC-BY-NC-4.0 (uso no comercial) | no disponible |

Diferencias destacables: el modelo de dnebh es mas pequeno que todas las alternativas listadas y esta entrenado desde cero con un presupuesto de tokens muy reducido, mientras que las alternativas son modelos preentrenados con volumenes de datos muy superiores. Frente a NLLB-200, carece de cobertura multilingue amplia; frente a opus-mt, carece de especializacion por par con datos a gran escala; frente a T5-small, carece de formulacion text-to-text general. Su ventaja es el tamano minimo y la trazabilidad total del entrenamiento.

## Limitaciones y advertencias

- Modelo en regimen de undertraining: 39,2 M de tokens consumidos para 33,5 M de parametros y una sola epoca, muy por debajo de lo habitual para obtener traduccion robusta.
- Sesgos conocidos: no documentados. Al entrenarse sobre un unico dataset curado (`belumind/en-vi-ja-curated-500k-triplets`) y sin informacion sobre su composicion, no puede evaluarse el sesgo de dominio, genero o registro.
- Riesgo de alucinacion: no documentado, pero es esperable en un modelo de este tamano, especialmente en frases largas, vocabulario especializado o entradas fuera de dominio.
- Limitaciones de contexto: la longitud maxima de contexto no esta publicada, por lo que no puede garantizarse el comportamiento con documentos largos.
- Limitaciones de idioma: solo se declaran vi→en y ja→en. No hay evidencia de soporte de otras direcciones ni de traduccion inversa (en→vi, en→ja).
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial. Cualquier uso en produccion requiere contactar con el autor.
- Artefacto academico: el nombre del repositorio (`anlp-a2-part1`) y el metodo de carga propio (`src.part1.hub.load_exported_model`) indican que es un entregable de una asignatura, sin garantia de mantenimiento, soporte ni estabilidad de la API de carga.
- Sin adopcion: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad, issues resueltos ni validacion independiente.
- Sin pipeline declarado en HuggingFace: no puede usarse directamente con `pipeline()` de `transformers` sin escribir codigo propio de adaptacion.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ, GPTQ ni ONNX, de modo que el despliegue en llama.cpp u Ollama requeriria conversion manual.
- El BLEU de 31,70 no esta desglosado por par de idiomas ni por dominio, por lo que no debe interpretarse como rendimiento uniforme en vi→en y ja→en.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dnebh/anlp-a2-part1-config1_dense
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/dnebhrajani-v/anlp-a2-part1/runs/p3jcmdey
- Dataset de entrenamiento citado: `belumind/en-vi-ja-curated-500k-triplets` (HuggingFace)
- Repositorio de la practica (referenciado como `src.part1` en la model card): no disponible como enlace publico
- Paper asociado: no disponible
- Demo: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos correspondian a una boutique de Megève y no guardan relacion con el artefacto descrito.
