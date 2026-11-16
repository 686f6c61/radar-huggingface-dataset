# FinaPolat/Qwen3-8B-GO-KGC-sft-epoch1

## Resumen

FinaPolat/Qwen3-8B-GO-KGC-sft-epoch1 es un ajuste fino supervisado (SFT) del modelo base Qwen3-8B, publicado en Hugging Face por el usuario FinaPolat. El nombre del repositorio sugiere que el ajuste se ha orientado a tareas de Gene Ontology (GO) y Knowledge Graph Completion (KGC), aunque la model card no confirma esta interpretacion ni documenta el dataset de entrenamiento utilizado. El checkpoint corresponde a la epoca 1 del proceso de SFT.

El modelo conserva la arquitectura del Qwen3-8B original, con 8.190.735.360 parametros totales segun los pesos en safetensors, y un tamano de repositorio de 16,4 GB. Se distribuye en formato safetensors y es compatible con la libreria transformers y con text-generation-inference, lo que permite desplegarlo en infraestructuras estandar de inferencia.

La relevancia de esta ficha es limitada por la escasez de documentacion: el autor no ha publicado datos sobre licencia, idiomas, contexto, composicion del dataset ni resultados de evaluacion. Cualquier uso en produccion deberia ir precedido de una evaluacion propia, dado que la model card es la plantilla autogenerada de transformers sin contenido sustantivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-8B; detalles no disponibles) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only de la familia Qwen3, y ha sido sometido a un ajuste fino supervisado (SFT) durante al menos una epoca, segun indica el identificador del checkpoint. No se dispone de informacion sobre la composicion del dataset de SFT, el numero de tokens utilizados, la mezcla de tareas (GO/KGC segun el nombre) ni los hiperparametros de entrenamiento. Tampoco consta si se aplicaron tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

La unica innovacion tecnica inferible del nombre es la especializacion en Gene Ontology y Knowledge Graph Completion, un dominio en el que los modelos generalistas suelen requerir ajuste para manejar vocabulario controlado, relaciones ontologicas y tripletas sujeto-predicado-objeto. No obstante, al no existir documentacion del autor, esta interpretacion debe tratarse como hipotesis y no como hecho verificado.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-8B.
- Especializacion probable en tareas de Gene Ontology y Knowledge Graph Completion, segun el identificador del repositorio (no confirmado en la model card).
- Soporte de tool calling y function calling: no disponible en la documentacion; depende de si el ajuste SFT preservo estas capacidades del base.
- Soporte de agentes y razonamiento multi-paso: no disponible; no documentado.
- Capacidades multilingues: no disponible; no se especifican idiomas.
- Modo thinking, vision o audio: no disponible; no documentado.

## Casos de uso

- Anotacion de proteinas con terminos de Gene Ontology: el modelo podria emplearse para predecir o sugerir terminos GO a partir de descripciones textuales de genes o proteinas, aprovechando el ajuste especifico si este se confirma.
- Completado de grafos de conocimiento biomedicos: dado el sufijo KGC, podria utilizarse para predecir relaciones faltantes entre entidades en un grafo de conocimiento, como interacciones gen-enfermedad o proteina-funcion.
- Extraccion de tripletas de literatura cientifica: integrado en un pipeline de procesamiento de lenguaje natural biomedico para convertir articulos en tripletas estructuradas sujeto-relacion-objeto.
- Asistente de curacion de ontologias: apoyo a equipos de biocuracion para normalizar terminos y detectar inconsistencias en anotaciones existentes.
- Generacion de consultas SPARQL sobre grafos RDF: si el ajuste ha cubierto sintaxis de consultas, podria traducir preguntas en lenguaje natural a SPARQL sobre ontologias GO.
- Evaluacion comparativa de modelos especializados: util como checkpoint de referencia en experimentos academicos sobre SFT en dominios biomedicos, dado su bajo numero de descargas y su caracter de artefacto de investigacion.
- Prototipado de pipelines de inferencia con transformers y TGI: al ser compatible con text-generation-inference y endpoints_compatible, sirve para validar despliegues estandar antes de adoptar un modelo con licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 20-24 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB para pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 4,5-5 GB para pesos, con overhead adicional.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegues de produccion; L40S o RTX A6000 para entornos de 48 GB; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- GPU consumer: cabe en RTX 4090 y RTX 3090 en bf16 con contexto limitado; en RTX 4080 (16 GB) o inferiores seria necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (compatible con arquitectura Qwen3), llama.cpp y Ollama si se generan cuantizaciones GGUF propias, ya que el autor no las publica.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FinaPolat/Qwen3-8B-GO-KGC-sft-epoch1 | 8,19 B | no disponible | no disponible | Hugging Face, safetensors | Ajuste SFT sin documentacion |
| Qwen/Qwen3-8B (base) | ~8 B | no disponible en esta ficha | Apache 2.0 (segun familia Qwen3) | Hugging Face, amplia comunidad | Modelo generalista con documentacion completa |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | Hugging Face, ecosistema amplio | Alternativa generalista con licencia conocida |
| Mistral 7B Instruct | 7,24 B | 32 K | Apache 2.0 | Hugging Face, ecosistema amplio | Menor tamano, licencia permisiva |

La comparativa es orientativa: los datos del modelo base Qwen3-8B y de los alternativos provienen de sus fichas publicas, mientras que el checkpoint de FinaPolat carece de especificaciones verificables mas alla del recuento de parametros.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay informacion sobre datos de entrenamiento, hiperparametros ni evaluacion, lo que impide auditar el modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; el uso en produccion conlleva riesgo legal.
- Idiomas no documentados: se desconoce si el ajuste SFT ha degradado capacidades multilingues del base.
- Contexto no documentado: no se puede planificar el dimensionamiento de la cache KV ni el coste de inferencia con precision.
- Riesgo de alucinacion: inherente a los modelos generativos; en dominios biomedicos y ontologicos, una tripleta o termino GO incorrecto puede propagarse a bases de datos y afectar a analisis posteriores.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos de dominio, geograficos o de composicion taxonomica.
- Posible sobreajuste a la epoca 1: el checkpoint corresponde a una sola epoca, lo que puede implicar infraentrenamiento o, por el contrario, sobreajuste si el dataset era pequeno; no hay validacion publicada.
- Sin cuantizaciones oficiales: el despliegue en hardware consumer exige generar GGUF/AWQ propias, con el riesgo de degradacion no medida.
- Sin soporte comunitario: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de encontrar issues resueltos o variantes mantenidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FinaPolat/Qwen3-8B-GO-KGC-sft-epoch1
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Repositorio del modelo base Qwen3 (referencia de la familia): https://huggingface.co/Qwen/Qwen3-8B
