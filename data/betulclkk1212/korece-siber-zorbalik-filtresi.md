# betulclkk1212/korece-siber-zorbalik-filtresi

## Resumen

El modelo `betulclkk1212/korece-siber-zorbalik-filtresi` es un clasificador de texto basado en arquitectura BERT, publicado en HuggingFace Hub por el usuario `betulclkk1212`. Su nombre, en turco, se traduce como "filtro coreano de ciberacoso", lo que apunta a un sistema de deteccion de discurso abusivo orientado a texto en coreano, aunque el repositorio no declara idiomas soportados ni tarea concreta mas alla de la etiqueta generica `text-classification`.

Se trata de un modelo encoder-only de 108.920.066 parametros (dato extraido de los pesos en safetensors) con un tamano de repositorio de 0.4 GB, coherente con pesos en fp32. La model card es la plantilla autogenerada por HuggingFace y no contiene informacion sustantiva: no especifica datos de entrenamiento, conjunto de etiquetas, metricas ni licencia. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto sin validacion comunitaria.

Su relevancia practica es limitada y condicionada: puede ser util como punto de partida para experimentar con filtrado de toxicidad en coreano, pero al carecer de documentacion de entrenamiento, evaluacion publicada y licencia explicita, no es apto para despliegue en produccion sin auditoria previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only, transformer; segun etiqueta `bert` del repositorio) |
| Parametros totales | 108.920.066 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no declarada; en modelos BERT el limite tipico es 512 tokens, sin confirmar para este checkpoint) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, GPTQ, AWQ ni ONNX cuantizadas; el repo contiene safetensors) |
| Idiomas soportados | no disponible (el repositorio no declara idiomas; el nombre sugiere coreano) |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32, inferido del recuento de parametros y del tamano del repo de 0.4 GB) |

## Arquitectura y entrenamiento

La unica informacion fiable sobre la arquitectura es la etiqueta `bert` de HuggingFace y el pipeline declarado `text-classification`, ademas de la clase de pesos safetensors compatible con `transformers` y con `text-embeddings-inference`. El recuento de 108.920.066 parametros es ligeramente inferior al de `bert-base-uncased` (109.482.240), lo que sugiere, como hipotesis no confirmada, un vocabulario algo mas reducido que los 30.522 tokens habituales y una capa de clasificacion sobre la representacion del token `[CLS]`.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el numero de etiquetas de salida, si se aplico ajuste fino supervisado sobre un checkpoint preentrenado multilingue o si se uso RLHF/DPO (procedimientos poco habituales en clasificadores encoder-only). Tampoco se documentan hiperparametros, regimen de precision ni infraestructura de computo. La referencia `arxiv:1910.09700` que aparece entre las etiquetas corresponde al articulo de Lacoste et al. sobre calculo de emisiones de carbono, citado por la plantilla estandar de model card; no es un paper de este modelo.

## Capacidades

- Clasificacion de texto: el pipeline declarado es `text-classification`, lo que implica asignacion de una o varias etiquetas a una secuencia de entrada. El conjunto de etiquetas no esta documentado.
- Filtrado de contenido potencialmente abusivo: por el nombre del repositorio, la funcion prevista es detectar ciberacoso o discurso toxico en texto coreano, aunque no hay evidencia publicada de su comportamiento real.
- Extraccion de embeddings de texto: al ser un encoder BERT, la torre puede usarse para generar representaciones vectoriales, con soporte declarado para `text-embeddings-inference`.
- Procesamiento por lotes: compatible con `transformers` y con `endpoints_compatible`, por lo que puede servirse detras de la Inference API de HuggingFace.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, modo "thinking", tool calling ni capacidades de agente. No se ha documentado soporte multilingue explicito.

## Casos de uso

- Moderacion de foros y comunidades coreanas: el modelo se usaria como clasificador de primera linea sobre cada mensaje publicado, marcando aquellos con alta probabilidad de ser abusivos para revision humana. Es adecuado porque el coste computacional de un encoder de 109 M de parametros permite evaluar cada mensaje en milisegundos.
- Filtrado previo en redes sociales o aplicaciones de mensajeria: integrado en el pipeline de publicacion, descartaria o etiquetaria contenido toxico antes de que llegue al resto de usuarios.
- Preanotacion de datasets de toxicidad: dado su caracter de clasificador, puede generar etiquetas automaticas sobre grandes volumenes de texto coreano que despues se revisen manualmente, reduciendo el coste de anotacion.
- Generacion de embeddings para busqueda semantica o deduplicacion: reutilizando la torre encoder, se pueden obtener vectores de 768 dimensiones (valor tipico en BERT, no confirmado) para agrupar mensajes similares o detectar campanas de acoso coordinadas.
- Investigacion academica sobre discurso de odio en coreano: como baseline reproducible sobre el que comparar modelos posteriores, siempre que se documente su comportamiento con un conjunto de evaluacion propio.
- Sistema de alertas tempranas en plataformas educativas: clasificar interacciones entre estudiantes y escalar automaticamente los casos detectados, con supervision humana obligatoria dada la ausencia de metricas de precision y recall.
- Puerta de entrada en un clasificador en cascada: usar este modelo para descartar rapidamente el contenido claramente limpio y reservar modelos mas grandes y costosos para los casos ambiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de exactitud, F1, precision o recall, ni describe el conjunto de evaluacion empleado. Tampoco existen referencias externas ni comparaciones con otros clasificadores de toxicidad en coreano. Cualquier cifra de rendimiento seria una invencion y no debe atribuirse a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0.44 GB de pesos mas activaciones y memoria del runtime, del orden de 1 GB en total; en fp16, unos 0.22 GB de pesos; en int8, unos 0.11 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente, incluidas NVIDIA GTX 1650, RTX 3050, RTX 4090, A100 y H100. El modelo esta enormemente sobredimensionado para el hardware disponible en cualquier GPU moderna.
- Ejecucion en CPU: viable para inferencia y para lotes moderados, dado el reducido numero de parametros; es probable que la latencia en CPU sea aceptable para moderacion en tiempo casi real, aunque no hay mediciones publicadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en dispositivos de borde.
- Opciones de despliegue: `transformers` (incluido `pipeline("text-classification")`), `text-embeddings-inference` para servir embeddings, HuggingFace Inference Endpoints (la etiqueta `endpoints_compatible` lo indica), y servidores de inferencia tipo TorchServe o FastAPI con ONNX Runtime. No se publican pesos GGUF, por lo que `llama.cpp` y Ollama no son aplicables sin conversion previa; `vLLM` no aplica a clasificadores encoder-only en su configuracion habitual.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas ni especificaciones de hardware de entrenamiento que permitan inferir el rendimiento del autor.

## Comparativa con modelos similares

La comparacion se limita a caracteristicas objetivas de arquitectura y licencia, porque no existen benchmarks publicados de este checkpoint que permitan comparar rendimiento.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| `betulclkk1212/korece-siber-zorbalik-filtresi` | 108,92 M | no disponible | no disponible | no disponible | safetensors, transformers |
| `bert-base-multilingual-cased` (Google) | 178 M | 512 tokens | Apache 2.0 | 104 idiomas | safetensors, TF, PyTorch |
| `xlm-roberta-base` (Meta) | 278 M | 512 tokens | MIT | 100 idiomas | safetensors, PyTorch |
| `monologg/koelectra-base-v3-discriminator` (coreano) | ~112 M | 512 tokens | Apache 2.0 | coreano | safetensors, PyTorch |

Los tres modelos de referencia cuentan con model card detallada, licencia explicita y uso ampliamente documentado en clasificacion de texto y deteccion de toxicidad, ventajas que este repositorio no ofrece. En terminos de tamano, el modelo analizado es el mas ligero de la tabla junto con KoELECTRA, lo que reduce el coste de despliegue pero no garantiza calidad sin datos de evaluacion.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin informacion sobre datos, etiquetas, metricas ni procedimiento de entrenamiento. Es imposible reproducir el modelo o auditar su comportamiento.
- Licencia no declarada: sin licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion. Cualquier uso en produccion requiere contactar con el autor o asumir el riesgo legal.
- Riesgo de sesgo desconocido: al no documentarse el dataset de entrenamiento, no se puede evaluar si el modelo penaliza variantes dialectales, jerga, lenguaje informal o determinados grupos demograficos.
- Riesgo de alucinacion no aplicable en sentido generativo (no genera texto), pero si de falsos positivos y falsos negativos con tasas desconocidas, lo que puede derivar en censura indebida o en fallo sistematico ante abusos concretos.
- Cobertura idiomatica incierta: el repositorio no declara idiomas; el nombre sugiere coreano, pero el autor escribe en turco y no se especifica si el modelo maneja mezcla de idiomas o transliteraciones.
- Sin validacion externa: 0 descargas y 0 likes implican que no hay evidencia de uso real, informes de errores ni confirmacion independiente de que el modelo funcione.
- Ausencia de cuantizaciones publicadas: aunque el modelo es pequeno, no hay versiones GGUF, ONNX ni int8 listas para usar, lo que obliga a convertirlo manualmente para despliegues ligeros.
- Fechas de publicacion anomalas: los metadatos indican creacion el 2026-09-20 y actualizacion el 2026-09-20, posteriores a la fecha de consulta, lo que sugiere metadatos poco fiables o manipulados.
- Recomendacion operativa: si se decide evaluar el modelo, hacelo sobre un conjunto de validacion propio y anotado, mide precision, recall y F1 por clase, y manten siempre supervision humana en el bucle antes de aplicar cualquier accion sobre usuarios reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/betulclkk1212/korece-siber-zorbalik-filtresi
- Paper referenciado en las etiquetas del repo (Lacoste et al., 2019, sobre emisiones de carbono, citado por la plantilla de model card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental de ML enlazada desde la plantilla: https://mlco2.github.io/impact
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devolvieron exclusivamente documentacion de ayuda de Google Maps y articulos de foros sin relacion con este repositorio, por lo que no se dispone de papers, blogs, demos ni repositorios adicionales.
