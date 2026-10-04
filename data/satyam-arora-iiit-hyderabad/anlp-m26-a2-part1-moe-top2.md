# satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-moe-top2

## Resumen

El modelo `anlp-m26-a2-part1-moe-top2` es un checkpoint de traducción automática con arquitectura decoder-only y capa de mezcla de expertos (mixture-of-experts, MoE) con enrutado top-2, publicado por el usuario `satyam-arora-iiit-hyderabad`. Se trata de un artefacto académico asociado a la asignatura Advanced NLP (ANLP), asignatura 2, parte 1, y no de un modelo de producción: el repositorio no acumula descargas ni valoraciones y la licencia no está declarada. Su tarea es la traducción de vietnamita y japonés hacia inglés, con el inglés como única lengua destino.

El modelo tiene 19.847.040 parámetros totales, de los cuales 16.308.096 están activos por token, lo que confirma el enrutado disperso top-2 sobre un conjunto de expertos. Fue entrenado sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`, un corpus de tripletas en inglés, vietnamita y japonés, con un presupuesto fijo de tokens de contexto y evaluado sobre el checkpoint final, no sobre uno con parada temprana. El tokenizador es un BPE a nivel de byte con tokens de idioma y de control.

Su relevancia es fundamentalmente didáctica y de reproducibilidad: sirve como referencia para estudiar el comportamiento de un MoE pequeño en traducción de bajos recursos, así como para comparar la asignación de expertos (el repositorio incluye CSV, JSON y SVG de uso de expertos). No es un modelo apto para despliegue comercial o de alta exigencia sin una validación adicional y sin una licencia explícita. La información disponible no especifica la longitud de contexto ni los idiomas adicionales soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) y enrutado top-2 |
| Parametros totales | 19.847.040 |
| Parametros activos | 16.308.096 por token |
| Longitud de contexto | no disponible (la model card menciona un "presupuesto fijo de tokens de contexto" sin especificar la cifra) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye checkpoints PyTorch sin versiones cuantizadas) |
| Idiomas soportados | Ingles (destino), vietnamita y japones (origen); etiquetas de idioma: en, vi, ja |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo: `model.pt` y `best_validation_model.pt`; tokenizador en `tokenizer.json`; no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 0,2 GB |
| Libreria declarada | pytorch |
| Tarea declarada (pipeline) | translation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con mezcla de expertos y enrutado top-2, según los propios tags del repositorio y la métrica de parámetros activos. La diferencia entre parámetros totales (19,85 M) y activos por token (16,31 M) implica que aproximadamente el 82 por ciento de los parámetros se ejecutan en cada paso y que existe una fracción de expertos que no se activa en cada token. El repositorio incluye ficheros de uso de expertos en CSV, JSON y SVG, lo que sugiere que el análisis de balanceo de carga forma parte del trabajo experimental. La arquitectura concreta y el código de carga no están en HuggingFace, sino en el repositorio de la asignatura, que no se enlaza en la model card.

El entrenamiento utilizó el dataset `belumind/en-vi-ja-curated-500k-triplets`, un corpus de tripletas de traducción en inglés, vietnamita y japonés. La model card indica que se empleó un presupuesto fijo de tokens de contexto y que la evaluación se realizó sobre el checkpoint final, lo que sugiere un control experimental para comparar variantes con el mismo coste computacional. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de ajuste con RLHF, DPO u otras técnicas de alineamiento. El tokenizador es un BPE a nivel de byte que incorpora tokens de idioma y de control, un detalle habitual cuando un mismo modelo gestiona varios pares de lenguas.

## Capacidades

- Traducción de vietnamita a inglés y de japonés a inglés, con salida monolingüe en inglés.
- Generación de texto autorregresiva (arquitectura decoder-only).
- Condicionamiento por token de idioma o control, gracias al tokenizador BPE con tokens de idioma y control.
- Enrutado MoE top-2, que activa un subconjunto de expertos por token.
- No se documenta soporte de tool calling ni function calling.
- No se documenta uso como agente ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking), visión, audio ni otras modalidades.
- Cobertura multilingüe limitada a inglés, vietnamita y japonés según las etiquetas del repositorio.

## Casos de uso

- Traducción de documentación técnica de japonés a inglés: el modelo produce salida monolingüe en inglés, adecuada para preprocesar manuales o notas de versión antes de su revisión humana.
- Localización de soporte al cliente desde vietnamita: se puede integrar como paso previo en un pipeline que recibe mensajes en vietnamita y los normaliza a inglés para un sistema de tickets en inglés.
- Investigación académica sobre MoE: los ficheros de uso de expertos permiten analizar el balanceo de carga y el comportamiento del enrutado top-2 sobre datos de traducción reales.
- Generación de corpus sintéticos de traducción: al ser un modelo pequeño, se puede ejecutar en gran volumen para crear pares vi-en y ja-en de bajo coste destinados a filtrar o aumentar datos.
- Evaluación comparativa de arquitecturas: sirve como línea base MoE de 19,8 M de parámetros frente a variantes densas con el mismo presupuesto de tokens, que es precisamente el diseño experimental descrito.
- Prototipado en entornos con recursos mínimos: al ocupar menos de 100 MB en coma flotante de 32 bits, es viable en portátiles, CPU o GPUs integradas para pruebas de concepto.
- Preprocesado en canalizaciones de análisis de opinión: traducción previa de reseñas en vietnamita o japonés a inglés para alimentar clasificadores entrenados solo en inglés.

## Benchmarks y rendimiento

Resultados publicados en la model card (checkpoint final, mismo presupuesto de tokens):

| Metrica | Valor |
|---|---:|
| Perplejidad en test | 21,433347 |
| BLEU combinado | 20,4222 |
| BLEU vietnamita | 24,2856 |
| BLEU japones | 16,6695 |
| Parametros totales | 19.847.040 |
| Parametros activos por token | 16.308.096 |

No se han publicado resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no procede extrapolarlos, dado que la tarea declarada es exclusivamente de traducción.

## Requisitos de hardware

- VRAM estimada: menos de 100 MB en FP32 (tamano calculado de los 19,85 M de parametros), unos 40 MB en FP16 y aproximadamente 20 MB en cuantizacion de 8 bits si se aplica manualmente. Los pesos se distribuyen como `model.pt`, sin versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; una RTX 4090, A100 o H100 estan sobradamente dimensionadas y el cuello de botella sera la latencia de lanzamiento de kernels, no la memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en GPU integradas y en CPU.
- Opciones de despliegue: al no ser un modelo de una arquitectura estandar de HuggingFace Transformers, no hay soporte directo conocido en vLLM, TGI, llama.cpp u Ollama. El despliegue requiere el codigo de carga del repositorio de la asignatura, sobre PyTorch.
- Latencia y throughput: no disponibles como medicion publicada. De forma orientativa, con 16,3 M de parametros activos por token, el coste es de aproximadamente 33 MFLOP por token, lo que permite decenas de miles de tokens por segundo en GPU moderna y cientos por segundo en CPU, siempre que la implementacion del enrutado MoE no introduzca sobrecarga.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros modelos comparables con los que contrastar parametros, contexto, BLEU o licencia. Como referencia de categoria, este checkpoint pertenece al segmento de modelos de traduccion de menos de 50 M de parametros, pero no se dispone de datos verificables de alternativas concretas en el material consultado.

## Limitaciones y advertencias

- Modelo con licencia no declarada: no se puede asumir permiso de uso comercial, y su explotacion en produccion carece de base legal clara.
- Artefacto academico sin mantenimiento: 0 descargas y 0 valoraciones, con fecha de actualizacion identica a la de creacion, lo que indica que no ha habido iteraciones posteriores.
- La model card indica explicitamente que el checkpoint evaluado es el final y no el de mejor validacion; el fichero `best_validation_model.pt` se ofrece como opcional, por lo que las metricas publicadas no corresponden al mejor punto de validacion.
- Direccionalidad limitada: traduce vi a en y ja a en, pero no se documenta la direccion inversa ni combinaciones intermedias como vi a ja.
- Sin datos sobre longitud de contexto, no se puede garantizar el comportamiento en documentos largos ni en conversaciones multi-turno.
- El BLEU de japones (16,67) es notablemente inferior al de vietnamita (24,29), lo que apunta a un rendimiento desigual entre pares de lenguas.
- Riesgo de alucinacion y de omisiones en la traduccion, inherente a un modelo de este tamano y sin fases de alineamiento documentadas.
- No se documentan sesgos especificos ni la composicion del dataset de entrenamiento mas alla de su nombre y tamano aproximado.
- Sin soporte en frameworks de inferencia estandar: implica codigo propio de carga y mantenimiento manual.
- Sin resultados de robustez, seguridad ni evaluacion humana publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-moe-top2
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Repositorio del codigo de arquitectura y carga: mencionado en la model card pero no enlazado; no disponible.
- Paper, blog o demo: no disponible.
- Nota sobre la busqueda web: los resultados recuperados no guardan ninguna relacion con el modelo ni con traduccion automatica, por lo que no se incluyen como fuentes.
