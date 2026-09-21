# mradermacher/assay-1.7b-GGUF

## Resumen

`mradermacher/assay-1.7b-GGUF` es un repositorio de cuantizaciones en formato GGUF del modelo `Berk/assay-1.7b`, generado y publicado por mradermacher (autor conocido por producir versiones GGUF de terceros, con el apoyo de la empresa nethype GmbH). No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint original a una familia de ficheros GGUF pensados para inferencia en CPU, GPU de gama baja y entornos con memoria limitada mediante llama.cpp y sus derivados.

El modelo subyacente declara la tarea de `zero-shot-classification` y los tags `assay`, `calibrated` y `decision-model`, lo que apunta a un uso como clasificador o motor de decisión que no requiere reentrenamiento por cada conjunto de etiquetas. Cuenta con 1.720.574.976 parámetros (aproximadamente 1,72 mil millones), licencia Apache 2.0 y soporte declarado únicamente para inglés. La información pública disponible no detalla la arquitectura interna, la longitud de contexto, la composición del dataset de entrenamiento ni el proceso de ajuste (RLHF/DPO), por lo que esos apartados se marcan como no disponibles.

Su relevancia práctica es la de un clasificador pequeño y desplegable en local: el repositorio ofrece doce variantes de cuantización entre 0,9 GB (Q2_K) y 3,5 GB (f16), lo que permite ejecutarlo en hardware modesto o integrarlo en pipelines donde el coste por inferencia y la privacidad de los datos son críticos. El repositorio completo ocupa 16,0 GB, incluyendo todas las variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo documenta la cuantizacion GGUF del modelo base `Berk/assay-1.7b`; no se describe la arquitectura interna) |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base original, presumiblemente safetensors; el repositorio incluye tambien el prefijo `convert_type: hf`) |
| Tamano del repositorio | 16,0 GB (todas las cuantizaciones) |
| Tarea declarada | zero-shot-classification |
| Fecha de creacion (metadatos) | 2026-09-21 |
| Ultima actualizacion (metadatos) | 2026-09-21 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. La model card del repositorio GGUF se limita a indicar que son cuantizaciones estaticas de `Berk/assay-1.7b`, generadas con `quantize_version: 2` y `output_tensor_quantised: 1`, y que por el momento no se han publicado variantes con imatrix ni cuantizaciones ponderadas. No se especifica si el modelo original es un transformer denso, un MoE, un modelo hibrido ni cualquier otra variante, ni el numero de capas, dimensiones ocultas o tipo de atencion.

Tampoco hay datos sobre el entrenamiento: se desconoce el numero de tokens utilizados, la composicion del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, y si se aplicaron tecnicas de calibracion especificas. Los tags `calibrated` y `decision-model` sugieren que el modelo base fue disenado o ajustado para producir puntuaciones de decision calibradas, pero esta interpretacion no esta confirmada por la documentacion disponible y no debe tomarse como un dato verificado.

## Capacidades

- Clasificacion zero-shot: la tarea declarada en el pipeline es `zero-shot-classification`, lo que implica asignar etiquetas definidas en tiempo de inferencia sin entrenamiento adicional.
- Uso como modelo de decision: el tag `decision-model` apunta a su empleo en tareas de enrutado, seleccion o puntuacion con umbrales.
- Calibracion de puntuaciones: el tag `calibrated` sugiere que las probabilidades de salida estarian calibradas, si bien no se documenta el metodo ni se aportan metricas de calibracion (ECE, Brier, etc.).
- Generacion de texto conversacional: el repositorio incluye el tag `conversational` y `endpoints_compatible`, aunque no se detallan las capacidades generativas reales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun el campo `language` de la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede recibir el texto de una incidencia y una lista de categorias candidatas (facturacion, red, acceso, hardware) definidas en tiempo de inferencia, devolviendo la etiqueta mas probable sin necesidad de reentrenar cuando cambia el catalogo de categorias.
- Enrutado de consultas en pipelines RAG: dado un mensaje de usuario, decidir que indice documental o que herramienta interna debe atender la peticion, aprovechando la naturaleza de `decision-model` y su tamano reducido para mantener baja la latencia del router.
- Moderacion de contenido ligera: evaluar texto generado por usuarios contra etiquetas como `spam`, `insulto`, `contenido valido`, con la ventaja de que las etiquetas pueden redefinirse sin reentrenamiento.
- Etiquetado automatizado de corpus: clasificar grandes volumenes de documentos (soporte, legales, encuestas) en categorias definidas a posteriori, ejecutando la inferencia en CPU con cuantizaciones Q4_K_M de 1,2 GB.
- Filtrado previo en pipelines de anotacion humana: descartar o priorizar ejemplos antes de que un anotador los revise, reduciendo el coste de anotacion mediante puntuaciones de confianza.
- Analisis de sentimiento con taxonomias variables: definir en cada proyecto etiquetas especificas (positivo, neutro, negativo, ironico) sin disponer de un dataset etiquetado de dominio.
- Clasificacion en entornos con requisitos de privacidad: al poder ejecutarse en local con llama.cpp u Ollama, los textos no salen de la infraestructura propia, lo que resulta adecuado para datos medicos, legales o financieros.
- Prototipado rapido de clasificadores: validar un esquema de etiquetas antes de invertir en el entrenamiento de un modelo supervisado especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni resultados especificos de clasificacion como accuracy o F1), y la busqueda web realizada no ha devuelto documentacion tecnica relevante sobre el modelo `Berk/assay-1.7b`.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 0,9 GB con Q2_K, 1,2 GB con Q4_K_S o Q4_K_M, 1,4 GB con Q5_K_M, 1,5 GB con Q6_K, 1,9 GB con Q8_0 y 3,5 GB con f16. Hay que anadir el consumo del contexto (KV cache), que no puede estimarse porque se desconoce la longitud de contexto y la configuracion de atencion.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para las cuantizaciones de 4 bits; una RTX 3060, RTX 4060, RTX 4090 o similar permite mantener el modelo completo en VRAM junto con contexto amplio. En el extremo opuesto, A100 o H100 no aportan ventaja significativa para este tamano salvo por despliegue agregado de muchas replicas.
- Ejecucion en CPU: viable en cualquier equipo con al menos 2-4 GB de RAM libre para las cuantizaciones pequenas (Q2_K a Q4_K_M) y 6-8 GB para f16.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en GPUs integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF. Para el modelo base en formato Hugging Face se podrian usar vLLM o TGI, pero esos motores no cargan GGUF de forma nativa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La busqueda web realizada no ha devuelto ningun resultado relacionado con `assay-1.7b` ni con clasificadores zero-shot de ese tamano, por lo que no es posible construir una comparativa con datos verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| assay-1.7b (via mradermacher GGUF) | 1,72 B | no disponible | apache-2.0 | GGUF | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el campo `language` de la model card declara unicamente ingles; no hay evidencia de soporte para castellano ni para otras lenguas.
- Arquitectura y contexto desconocidos: al no documentarse la longitud de contexto ni la arquitectura, no es posible estimar el comportamiento en entradas largas ni planificar el consumo de memoria del KV cache.
- Riesgo de alucinacion: no cuantificado. Al tratarse de un modelo orientado a clasificacion y decision, las salidas pueden ser puntuaciones mal calibradas en dominios alejados de los datos de entrenamiento, a pesar del tag `calibrated`.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad. Un modelo entrenado predominantemente en ingles puede degradar su comportamiento con texto en otros idiomas o con variantes dialectales.
- Ausencia de benchmarks: sin metricas publicas no es posible comparar su rendimiento con alternativas ni justificar su eleccion en produccion mas alla de criterios de tamano y coste.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar la licencia del modelo base `Berk/assay-1.7b`, ya que este repositorio solo redistribuye cuantizaciones.
- Procedencia de la cuantizacion: las cuantizaciones son estaticas; el autor indica que no hay variantes con imatrix ni ponderadas, lo que en los niveles mas agresivos (Q2_K, Q3_K_S) puede degradar la calidad de forma notable.
- Metadatos anomalos: las fechas de creacion y actualizacion indicadas (2026-09-21) son posteriores a la fecha actual, lo que sugiere un error en los metadatos del repositorio y obliga a tratar con cautela cualquier dato temporal asociado.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe comunidad, informes de uso ni validacion independiente.
- Sin soporte de pesos ponderados ni MMLU/MMProj: no se indica soporte multimodal ni herramientas de evaluacion incluidas.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/assay-1.7b-GGUF
- Modelo base: https://huggingface.co/Berk/assay-1.7b
- Pagina de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#assay-1.7b-GGUF
- Repositorio de peticiones y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre el uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que apoya al cuantizador: https://www.nethype.de/
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre el modelo; los resultados devueltos corresponden a paginas de ayuda de Google Translate y no guardan relacion con `assay-1.7b`.
