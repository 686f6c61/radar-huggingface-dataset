# ethanrous/scribe-trigger-classifier

## Resumen

`ethanrous/scribe-trigger-classifier` es un modelo publicado en HuggingFace por el usuario ethanrous, aparentemente orientado a una tarea de clasificacion (el propio nombre del repositorio sugiere un clasificador de disparadores o "triggers" dentro del proyecto Scribe del autor). El repositorio no incluye una model card descriptiva: el README se limita a declarar la licencia Apache 2.0, sin informacion sobre el proposito, los datos de entrenamiento ni el rendimiento.

El checkpoint contiene 149.606.402 parametros en formato safetensors y ocupa 0,6 GB en el repositorio. La etiqueta de arquitectura declarada por el autor es `modernbert`, lo que lo situa en la familia ModernBERT, una arquitectura de encoder transformer con atencion alterna local/global y soporte de contexto extendido. El numero de parametros coincide con la configuracion publica de ModernBERT-base (aproximadamente 149 M), aunque la model card no confirma esta equivalencia.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y sin documentacion tecnica. Se incluye aqui como referencia de un checkpoint de clasificacion basado en encoder, util para tareas de etiquetado de texto de bajo coste computacional, pero cualquier evaluacion en produccion exige validacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer; etiqueta declarada por el autor) |
| Parametros totales | 149.606.402 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; el tamano de 0,6 GB es coherente con pesos en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens utilizados ni la composicion del dataset. La unica referencia tecnica es la etiqueta `modernbert` asociada al repositorio. La familia ModernBERT se caracteriza por un encoder transformer con capas de atencion alternando ventanas locales y atencion global, codificaciones rotatorias (RoPE) y normalizacion sin sesgo, lo que reduce el coste computacional frente a encoders clasicos de tamano comparable. Estas caracteristicas son propias de la familia y no estan confirmadas para este checkpoint concreto.

Tampoco consta si el modelo ha pasado por ajuste fino supervisado, destilacion, RLHF o DPO, ni cual es la tarea exacta de clasificacion para la que fue entrenado. El nombre del repositorio (scribe-trigger-classifier) apunta a una tarea de clasificacion binaria o multiclase orientada a detectar disparadores en un sistema denominado Scribe, pero se trata de una inferencia a partir del nombre y no de un dato documentado.

## Capacidades

- Clasificacion de texto: por la naturaleza del checkpoint y su tamano, el uso esperado es la clasificacion de secuencias, no la generacion de texto.
- Cabeza de clasificacion: no disponible; la model card no especifica el numero de etiquetas ni la tarea concreta.
- Generacion de texto: no disponible; un encoder tipo ModernBERT no esta disenado para decodificacion autoregresiva.
- Razonamiento multi-paso y agentes: no disponible.
- Tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Contexto largo: no confirmado para este checkpoint (la familia ModernBERT soporta ventanas de hasta 8192 tokens en su configuracion base, pero la model card no lo declara).

## Casos de uso

Dado que no existe documentacion funcional del modelo, los siguientes casos son aplicaciones genericas de un clasificador de texto basado en encoder de 149 M de parametros. Deben validarse empiricamente antes de cualquier despliegue.

- Filtrado y moderacion de contenido: uso del modelo como clasificador de entrada en una pipeline que descarte o marque textos antes de enviarlos a un modelo generativo mayor, reduciendo coste de inferencia.
- Enrutado de consultas en atencion al cliente: clasificar el mensaje entrante en categorias (facturacion, soporte tecnico, reclamacion) para dirigirlo al flujo o al equipo correspondiente.
- Etiquetado de datos a escala: preanotacion de corpus para revision humana en proyectos de anotacion, con un coste por inferencia muy bajo gracias al tamano reducido del modelo.
- Deteccion de disparadores o eventos: si el sufijo "trigger-classifier" refleja la tarea real, el modelo podria emplearse para detectar condiciones de activacion en flujos automatizados (por ejemplo, alertas a partir de registros de texto).
- Clasificacion de intenciones en asistentes conversacionales: determinar la intencion del usuario en cada turno para seleccionar la herramienta o respuesta adecuada.
- Analisis de sentimiento y temas en redes sociales: procesamiento por lotes de grandes volumenes de texto en CPU, sin necesidad de GPU.
- Extraccion de caracteristicas para downstream: uso del encoder como extractor de embeddings congelados para alimentar un clasificador lineal especifico del dominio.
- Monitorizacion de logs y trazas: clasificacion de entradas de registro para separar errores criticos de ruido operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 y alrededor de 0,3 GB en fp16 para los pesos; sumando activaciones y overhead del runtime, el consumo tipico se situa en el rango de 1 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo esta muy por debajo de la capacidad de las GPU de datacenter.
- GPU de consumo: si, cabe con holgura en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable para cargas por lotes moderadas, dado el reducido numero de parametros.
- Opciones de despliegue: Hugging Face Transformers, ONNX Runtime, Text Embeddings Inference y, en general, cualquier runtime que soporte arquitecturas de la familia ModernBERT (vLLM y TGI incluyen soporte para ModernBERT en versiones recientes, aunque la compatibilidad con este checkpoint concreto no esta verificada).
- Latencia y throughput: no disponible. No se han publicado mediciones para este modelo.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint. La tabla compara unicamente caracteristicas estructurales conocidas de modelos encoder de tamano similar; los datos de las alternativas proceden de su documentacion publica, no de la informacion proporcionada para este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ethanrous/scribe-trigger-classifier | 149.606.402 | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| ModernBERT-base | ~149 M | 8192 tokens (segun documentacion publica de la familia) | Apache 2.0 | HuggingFace, ampliamente adoptado |
| DeBERTa-v3-base | ~184 M | 512 tokens | MIT | HuggingFace |
| XLM-RoBERTa-base | ~278 M | 512 tokens | MIT | HuggingFace |

El rendimiento relativo en tareas concretas no puede establecerse con la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe la tarea, las etiquetas, el dataset de entrenamiento ni las metricas, lo que impide evaluar su idoneidad sin pruebas propias.
- Riesgo de sesgo desconocido: al no documentarse la composicion del dataset, no es posible caracterizar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion: no aplica en el sentido generativo si el modelo es un clasificador puro, pero existe riesgo de falsos positivos y falsos negativos no cuantificados.
- Ambito de uso incierto: la etiqueta de pipeline no esta declarada, por lo que la integracion con `pipeline()` de Transformers puede requerir configuracion manual.
- Cobertura idiomatica desconocida: se desconoce si el modelo funciona en castellano o si esta limitado al ingles.
- Limitaciones de contexto: se desconoce la ventana maxima soportada y el comportamiento con secuencias largas.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe, y sin garantia explicita por parte del autor.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en produccion ni de validacion por terceros.
- Fecha de creacion futura respecto al momento de la redaccion (2026-10-02), lo que sugiere un repositorio de prueba o un artefacto experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ethanrous/scribe-trigger-classifier
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos asociados a este modelo.
- Referencia de la familia arquitectonica declarada (no vinculada al autor): paper de ModernBERT, https://arxiv.org/abs/2412.13663
