# joamCriff123/zils-lite-l1123q

## Resumen

zils-lite-l1123q es un modelo de extraccion de caracteristicas (feature-extraction) publicado por el usuario joamCriff123 en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B, de la familia Qwen3.5, con 852.985.920 parametros reales segun los pesos en safetensors. El autor lo describe como un "cuerpo de decision d3-lite" orientado al "pool lite de la subnet 127 de Zils", una terminologia que sugiere su uso dentro de una infraestructura de subred o protocolo distribuido denominado Zils.

El modelo se distribuye bajo licencia Apache-2.0 y utiliza la libreria transformers, con pesos en safetensors y codigo personalizado (custom_code), lo que implica que su carga requiere confiar en implementaciones incluidas en el repositorio. El repositorio ocupa 1,7 GB y no registra descargas ni interacciones en el momento de la consulta, por lo que se trata de una publicacion muy reciente y sin validacion comunitaria.

Su relevancia es limitada fuera del ecosistema Zils: no hay model card detallada, no se declaran idiomas soportados, no se publican benchmarks y la unica informacion tecnica disponible proviene de los metadatos de Hugging Face y del modelo base. Cualquier evaluacion de sus capacidades debe hacerse empiricamente antes de considerarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); detalles no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizacion estandar de transformers, no confirmada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parametros. El autor lo etiqueta como qwen3_5 y como decision-model dentro de la familia d3-lite, lo que indica un ajuste fino orientado a tareas de decision mas que a generacion abierta de texto. Sin embargo, la model card no especifica la arquitectura interna, el numero de capas, las dimensiones ocultas ni el mecanismo de atencion.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento. La unica referencia tecnica es la etiqueta feature-extraction, que sugiere que el modelo esta pensado para producir representaciones o puntuaciones mas que para generar texto libre.

## Capacidades

- Extraccion de caracteristicas: el pipeline declarado es feature-extraction, por lo que su funcion principal es producir representaciones vectoriales a partir de entradas.
- Modelo de decision: la etiqueta decision-model indica un uso orientado a clasificar, puntuar o seleccionar opciones dentro de un flujo, no a conversacion abierta.
- Integracion con transformers: se carga mediante la libreria transformers con codigo personalizado.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que puede desplegarse en la infraestructura de Inference Endpoints de Hugging Face.
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes y capacidades multilingues: no disponibles o no documentadas.

## Casos de uso

- Puntuacion de candidatos en un pipeline de seleccion: el modelo puede emplearse para generar una representacion o puntuacion de cada candidato y ordenarlos, aprovechando su naturaleza de decision-model.
- Filtrado previo en sistemas de recuperacion: al ser un modelo de 0,85 mil millones de parametros, puede actuar como reranker ligero o clasificador de relevancia en arquitecturas RAG, siempre que se valide su calidad empiricamente.
- Enrutamiento dentro de la subnet Zils: su proposito declarado es servir como cuerpo de decision en el pool lite de la subnet 127, es decir, para decidir el tratamiento de peticiones dentro de esa infraestructura.
- Clasificacion de intenciones en asistentes: con un tamano reducido, puede desplegarse para etiquetar la intencion de una consulta antes de derivarla a un modelo mayor.
- Extraccion de embeddings para busqueda semantica: el pipeline feature-extraction permite usarlo como encoder en indices vectoriales, sujeto a validacion de la calidad de sus representaciones.
- Prototipado rapido en entornos con recursos limitados: sus 852 millones de parametros permiten ejecutarlo en GPU de consumo, lo que facilita experimentacion local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y contexto; en la practica, entre 2 y 3 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,9-1,2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,5-0,8 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de escritorio o portatil con 4 GB o mas.
- Opciones de despliegue: transformers es la via documentada; al requerir custom_code, es necesario confiar en el codigo del repositorio. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-l1123q | 852.985.920 | no disponible | Apache-2.0 | Finetune de Qwen3.5-0.8B para decision; sin benchmarks ni documentacion |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | no disponible en esta ficha | segun modelo base | Modelo base original; previsiblemente mas generalista |
| Otros finetunes de la familia Qwen3.5-0.8B | ~0,8 mil millones | variable | variable | Alternativas de la misma familia; no se dispone de datos comparativos publicados |

No se dispone de informacion suficiente para comparar rendimiento, contexto o calidad con alternativas concretas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de su calidad en ninguna tarea.
- Model card minima: no se documentan datos de entrenamiento, idiomas, contexto ni limitaciones conocidas.
- Riesgo de alucinacion: no evaluado; al ser un modelo de decision, su comportamiento fuera de ese dominio es incierto.
- Sesgos: desconocidos, al no publicarse informacion sobre el dataset de ajuste.
- Idiomas: no declarados; no debe asumirse soporte multilingue.
- Codigo personalizado: la etiqueta custom_code obliga a revisar el codigo del repositorio antes de ejecutarlo en produccion, por motivos de seguridad.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las atribuciones del modelo base Qwen y el aviso NOTICE indicado por el autor.
- Madurez: cero descargas y cero likes en el momento de la consulta; sin validacion de la comunidad.
- Contexto: al no declararse la longitud de contexto, no debe asumirse la del modelo base sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1123q
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
