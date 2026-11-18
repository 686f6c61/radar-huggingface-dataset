# Kitkhachon/wcb-limesoda-fakenews

## Resumen

El modelo `Kitkhachon/wcb-limesoda-fakenews` es un clasificador de texto basado en la arquitectura CamemBERT, publicado en Hugging Face por el usuario Kitkhachon. Con 105.245.954 parametros totales y un peso en disco de aproximadamente 0,8 GB en formato safetensors, se trata de un modelo derivado de la familia CamemBERT, un transformer encoder preentrenado originalmente por Inria y Facebook AI Research para el idioma frances y documentado en el paper arXiv:1910.09700.

El nombre del repositorio sugiere que el modelo ha sido ajustado (fine-tuning) para una tarea de deteccion de noticias falsas, presumiblemente sobre un corpus relacionado con "limesoda" y "wcb" (etiquetas que no se detallan en la informacion disponible). La pipeline declarada es `text-classification`, lo que confirma que su proposito es la clasificacion de secuencias de texto, no la generacion.

La relevancia de esta ficha es limitada desde el punto de vista practico: la model card esta generada automaticamente y no contiene informacion sobre datos de entrenamiento, hiperparametros, metricas ni licencia. El modelo registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad. Se documenta aqui como referencia tecnica de un artefacto de clasificacion derivado de CamemBERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CamemBERT (transformer encoder, base) |
| Parametros totales | 105.245.954 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (CamemBERT base usa tipicamente 512 tokens, pero no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (el backbone CamemBERT es de idioma frances, pero no se confirma en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es CamemBERT, un transformer encoder de tipo BERT (bidireccional, solo encoder) preentrenado con el objetivo de masked language modeling sobre texto en frances. El recuento de parametros (105,2 millones) es coherente con la variante "base" de CamemBERT, que emplea 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion. El tag `arxiv:1910.09700` enlaza al paper de CamemBERT (Martin et al., 2019), no a un paper propio del autor.

No se dispone de informacion sobre el proceso de fine-tuning: ni el dataset utilizado, ni el numero de epocas, ni la funcion de perdida, ni si hubo congelacion de capas. La model card no documenta hiperparametros, regimen de precision (fp32, fp16, bf16) ni composicion del corpus de entrenamiento. Tampoco se indica si el ajuste se realizo sobre la cabeza de clasificacion estandar de Hugging Face `CamembertForSequenceClassification` con dos etiquetas (fake/real) o con mas clases. Toda esta informacion figura como "no disponible" en la fuente original.

## Capacidades

- Clasificacion de secuencias de texto: el modelo devuelve logits por clase para una entrada de texto, segun la pipeline `text-classification`.
- Deteccion de noticias falsas: el nombre del repositorio indica un ajuste orientado a distinguir contenido veraz de desinformacion, aunque no se documenta el esquema de etiquetas.
- Procesamiento de texto en frances (presumiblemente, por herencia del backbone CamemBERT), no confirmado en la model card.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No soporta vision, audio ni multimodalidad.
- No se documentan capacidades multilingues especificas.

## Casos de uso

- Filtrado de desinformacion en un pipeline editorial: el modelo puede puntuar titulares o parrafos y marcar candidatos a revision humana antes de publicacion, siempre que el dominio de entrenamiento coincida con el tipo de texto a evaluar (no verificado).
- Moderacion de contenido en foros o comentarios: clasificacion binaria de mensajes sospechosos para encolar revision, usando la salida de logits como score de confianza.
- Investigacion academica sobre deteccion de fake news: uso como baseline CamemBERT ajustado para comparar con otros clasificadores en experimentos controlados.
- Etiquetado asistido de corpus: pre-anotacion de grandes volumenes de texto para reducir el coste de anotacion manual, con posterior validacion humana.
- Monitorizacion de medios en tiempo casi real: integracion en un servicio de inferencia (por ejemplo, Text Embeddings Inference, dado el tag `text-embeddings-inference`) para clasificar articulos entrantes.
- Docencia y prototipado: ejemplo de fine-tuning de CamemBERT para tareas de clasificacion en cursos de PLN, dado su tamano manejable (0,8 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4-0,5 GB solo para pesos, mas overhead de activaciones y tokenizador; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- VRAM estimada en fp16: aproximadamente 0,2-0,3 GB para pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero el modelo es tan pequeno que la GPU no es un cuello de botella.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos diez anos, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: transformers (nativo), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles de Hugging Face (tag `endpoints_compatible`). No se documentan variantes GGUF ni soporte explicito para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kitkhachon/wcb-limesoda-fakenews | 105,2 M | no disponible | Clasificacion de texto | no disponible | Hugging Face (0 descargas) |
| CamemBERT base (Inria/Facebook) | ~110 M | 512 tokens | Backbone MLM / clasificacion | MIT | Hugging Face, ampliamente usado |
| XLM-RoBERTa base | ~278 M | 512 tokens | Backbone multilingue | MIT | Hugging Face |
| mBERT (bert-base-multilingual-cased) | ~178 M | 512 tokens | Backbone multilingue | Apache 2.0 | Hugging Face |

La comparativa se limita a backbones de la misma familia porque no se dispone de datos de rendimiento del modelo evaluado. Frente a CamemBERT base, el modelo aqui descrito es un ajuste especifico del que no se conocen metricas; frente a XLM-RoBERTa y mBERT, ofrece un tamano menor pero sin evidencia de calidad ni cobertura multilingue confirmada.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no aporta informacion sobre sesgos, datos de entrenamiento ni evaluacion; no es posible auditar el modelo.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y falsos negativos en la clasificacion, sin metricas publicadas que los cuantifiquen.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no confirmados: el backbone es frances, pero no se documenta si el ajuste se hizo sobre texto en frances, en otro idioma o en mezcla.
- Esquema de etiquetas no documentado: se desconoce si la cabeza de clasificacion tiene 2, 3 o mas clases y cual es el mapeo id-etiqueta.
- Sin validacion comunitaria: 0 descargas y 0 likes indican que el modelo no ha sido probado por terceros.
- No apto para generacion, agentes ni tareas que requieran contexto largo o razonamiento multi-paso.
- Fecha de creacion futura (2026-11-18) en los metadatos: conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kitkhachon/wcb-limesoda-fakenews
- Paper de CamemBERT (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Referencia Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
