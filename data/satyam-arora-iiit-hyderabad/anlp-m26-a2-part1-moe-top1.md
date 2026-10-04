# satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-moe-top1

## Resumen

`satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-moe-top1` es un checkpoint de traduccion automatica con arquitectura decoder-only y capa de mezcla de expertos (MoE) con enrutamiento top-1, desarrollado por el usuario satyam-arora-iiit-hyderabad en el contexto de la asignatura Advanced NLP (asignatura ANLP, trabajo 2, parte 1). El modelo traduce vietnamita y japones a ingles, y su entrenamiento se realizo sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`. Se trata, por tanto, de un artefacto academico y no de un modelo de proposito general publicado por un laboratorio.

Su relevancia es fundamentalmente didactica y experimental: con 19.847.040 parametros totales y solo 14.538.624 parametros activos por token, es un ejemplo compacto y reproducible de MoE con enrutamiento top-1 aplicado a traduccion multilingue. Ese desacoplamiento entre parametros totales y activos permite estudiar el compromiso entre capacidad del modelo y coste computacional por token en un rango de tamano que cabe en cualquier GPU de consumo.

El checkpoint publicado corresponde a la evaluacion final con presupuesto fijo de tokens de contexto (no a un checkpoint con early stopping), y se acompana de ficheros de metricas legibles por maquina, tokenizador BPE a nivel de byte y ficheros de uso de expertos en CSV, JSON y SVG. La model card no declara licencia, y el codigo de carga de la arquitectura reside en el repositorio de la asignatura, no en el repositorio de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) y enrutamiento top-1 |
| Parametros totales | 19.847.040 |
| Parametros activos | 14.538.624 por token |
| Longitud de contexto | no disponible (la model card menciona un "presupuesto fijo de tokens de contexto" sin especificar la cifra) |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint PyTorch sin cuantizar) |
| Idiomas soportados | Ingles (en), vietnamita (vi), japones (ja); la traduccion esta orientada a ingles como destino |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, `best_validation_model.pt`); tokenizador en `tokenizer.json` (BPE a nivel de byte) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | translation |
| Libreria | pytorch |

## Arquitectura y entrenamiento

La model card describe un checkpoint de traduccion "decoder-only", es decir, un transformer autorregresivo sin encoder separado, en el que la traduccion se formula como generacion condicionada. Sobre esa base se anade una capa de mezcla de expertos con enrutamiento top-1: para cada token, el router selecciona un unico experto, de modo que solo se activan 14.538.624 de los 19.847.040 parametros totales. El repositorio incluye ficheros de uso de expertos (CSV, JSON y SVG) para las variantes MoE, lo que sugiere que el analisis del reparto de carga entre expertos formaba parte de la evaluacion del trabajo.

El entrenamiento se realizo sobre `belumind/en-vi-ja-curated-500k-triplets`, un corpus de tripletas ingles-vietnamita-japones de 500.000 ejemplos. La model card indica que el modelo se entreno con el presupuesto fijo de tokens de contexto definido en el repositorio de la asignatura y que la evaluacion se hizo sobre el checkpoint final, no sobre uno seleccionado por early stopping. El tokenizador es BPE a nivel de byte con tokens adicionales de idioma y de control. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal u otras variantes.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles, en formulacion decoder-only.
- Generacion de texto autorregresiva condicionada por tokens de idioma y de control del tokenizador.
- Capacidad multilingue limitada a los tres idiomas declarados: ingles, vietnamita y japones.
- Mezcla de expertos con enrutamiento top-1, lo que permite analizar el reparto de tokens entre expertos mediante los ficheros de uso incluidos.
- Evaluacion reproducible de perplexity y BLEU sobre el split de test gracias a los ficheros `evaluation_metrics.json` y `parameter_report.json`.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo de razonamiento explicito: no disponible.

## Casos de uso

- Traduccion de documentacion tecnica del japones al ingles en un pipeline interno: el modelo esta entrenado especificamente para japones-ingles y su tamano de 0,2 GB permite ejecutarlo en cualquier maquina del equipo sin coste de API, aunque con una BLEU de 15,7678 conviene revisar el resultado antes de publicar.
- Traduccion de contenido de producto del vietnamita al ingles en comercio electronico: la BLEU de vietnamita (22,9904) es la mas alta del checkpoint, lo que lo hace mas fiable para este par que para el japones.
- Prototipado academico de variantes MoE: los ficheros de uso de expertos permiten estudiar si el enrutamiento top-1 colapsa hacia unos pocos expertos, un fenomeno habitual en modelos con routing duro.
- Experimentos de destilacion o poda: con 19,8 M de parametros totales y 14,5 M activos, sirve como modelo de referencia para comparar tecnicas de compresion en un rango de tamano manejable.
- Generacion de datos sinteticos de traduccion para aumentar corpus paralelos en vietnamita e ingles, siempre que se filtre por calidad dado el BLEU moderado en japones.
- Analisis de eficiencia parametros-activos frente a calidad: el checkpoint permite medir perplexity y BLEU con un presupuesto de computo por token muy reducido, util como linea base en estudios de escalado.
- Despliegue en entornos con recursos muy limitados (por ejemplo, un portatil sin GPU) para traduccion asistida de bajo volumen, dado que el checkpoint en precision completa ocupa menos de 100 MB.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la model card, obtenidos sobre el split de test con el checkpoint final:

| Metrica | Valor |
|---|---:|
| Perplexity de test | 23,541897 |
| BLEU combinada | 19,3141 |
| BLEU vietnamita | 22,9904 |
| BLEU japones | 15,7678 |
| Parametros totales | 19.847.040 |
| Parametros activos por token | 14.538.624 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con lineas base externas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 80 MB en FP32 y 40 MB en FP16 para los pesos, calculado a partir de los 19.847.040 parametros; a ello hay que sumar la memoria de activaciones y la cache KV, cuyo tamano depende de la longitud de contexto no especificada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluidas GTX 1050, RTX 3050, RTX 4090, A100 o H100; el modelo queda muy por debajo de la capacidad de cualquiera de ellas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: el repositorio solo distribuye pesos PyTorch (`model.pt`) y el codigo de carga de la arquitectura personalizada se encuentra en el repositorio de la asignatura, no en HuggingFace. No se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con formatos GGUF, de modo que el despliegue estandar exige cargar el checkpoint con el codigo propio del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han proporcionado en la informacion disponible datos de benchmarks ni especificaciones de modelos alternativos, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| anlp-m26-a2-part1-moe-top1 | 19.847.040 totales / 14.538.624 activos | no disponible | no disponible | Pesos PyTorch en HuggingFace; codigo de carga en repositorio externo |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

Como referencia cualitativa, este checkpoint pertenece a la categoria de modelos de traduccion neuronal de muy bajo parametraje, un segmento en el que existen otras familias publicas de traduccion multilingue, pero la informacion facilitada no incluye sus cifras y no se replican aqui.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican los terminos de uso, por lo que el uso comercial es juridicamente incierto y no deberia asumirse permitido.
- Artefacto academico: se trata de un checkpoint de una asignatura, evaluado una sola vez y sin publicacion asociada, lo que reduce las garantias de robustez en produccion.
- Dependencia de codigo externo: sin el codigo de la arquitectura personalizada del repositorio de la asignatura, los ficheros `model.pt` no son cargables con transformers ni con las herramientas habituales.
- BLEU de japones notablemente inferior (15,7678) frente al de vietnamita (22,9904): el rendimiento es desigual entre los dos idiomas de origen.
- Perplexity de test de 23,541897, relativamente alta, coherente con un modelo de escala muy reducida y con mayor propension a errores de fluidez y a alucinaciones en tramos largos.
- Idiomas limitados a ingles, vietnamita y japones; no hay evidencia de capacidad para otras lenguas ni de transferencia cero a las mismas.
- Longitud de contexto no documentada: imposible planificar el troceado de documentos largos sin consultar el repositorio de la asignatura.
- Uso etico y de seguridad: no se documentan sesgos, filtros de contenido ni evaluaciones de toxicidad, por lo que no hay garantias sobre el comportamiento del modelo ante entradas sensibles.
- Riesgo de alucinacion: al ser un modelo de generacion autorregresiva pequeno, puede producir traducciones plausibles pero incorrectas, especialmente en terminologia especializada.
- Metadatos anomolos: la fecha de creacion registrada (2026-10-03) es posterior a la fecha habitual de publicacion, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-moe-top1
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Codigo de la arquitectura y de carga: alojado en el repositorio de la asignatura ANLP, no enlazado en la model card (no disponible)
- Paper o publicacion asociada: no disponible
- Demo o espacio interactivo: no disponible
