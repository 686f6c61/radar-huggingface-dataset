# nirjhor123/chunker-rcaug

## Resumen

Chunker + RC aug. (control) es un modelo de lenguaje de ADN de pequeno tamano (2,52 M de parametros) desarrollado por nirjhor123 como parte del proyecto MirrorDNA. Se trata del brazo de control no equivariante de la familia MirrorDNA: comparte arquitectura con MirrorDNA-duplex pero no esta simetrizado respecto al reverse-complement, y en su lugar se entrena con aumento de datos basado en reverse-complement. Su proposito es servir de referencia experimental para medir cuanto aporta la equivarianza exacta a la cadena en la tokenizacion del ADN.

El modelo resuelve el problema de la tokenizacion de secuencias genomicas: aprende a segmentar una secuencia de ADN en fragmentos (chunks) mediante un enrutador de fronteras simetrico en el caso equivariante, y en este control sin simetrizar. Se preentrena con modelado de lenguaje enmascarado sobre el genoma humano hg38, en ventanas de 1.024 pb, lo que lo situa como una pieza de investigacion para clasificacion y regresion de secuencias, no como un modelo de proposito general.

Es relevante ahora porque acompana al envio a RECOMB 2027 del articulo *Learning Strand-Equivariant Tokenizations of DNA with MirrorDNA*, y porque permite aislar el efecto de la equivarianza frente al simple aumento de datos, una cuestion metodologica central en modelos genomicos. Su tamano reducido y su licencia MIT lo hacen facil de reproducir y de integrar en pipelines de experimentacion biologica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador aprendido y enrutador de fronteras (variante no equivariante, control) |
| Parametros totales | 2.515.588 (2,52 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 pb (ventanas de preentrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencias de ADN: A, C, G, T, N) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MirrorDNA descrita en el articulo: un transformer ligero con un tokenizador aprendido que segmenta la secuencia en chunks mediante un enrutador de fronteras. En la variante equivariante (MirrorDNA-duplex), el enrutador es simetrico y produce chunks espejo para una secuencia y su reverse-complement para cualquier valor de los parametros. Este checkpoint es el control no equivariante: misma arquitectura, sin simetrizar, entrenado con aumento por reverse-complement, de modo que la comparacion entre ambos aisla el efecto de la equivarianza exacta.

El preentrenamiento es de modelado de lenguaje enmascarado sobre hg38, usando los intervalos de entrenamiento de Basenji/Enformer, ventanas de 1.024 pb, 2^20 bases por paso durante 10.000 pasos (10,5 mil millones de bases en total) y un 15 % de bases enmascaradas. El codigo del modelo se distribuye junto con los pesos en el repositorio (modulo `rcchunk`), y el vocabulario de entrada mapea A, C, G, T, N a los indices 0 a 4. No se documentan fases de RLHF ni DPO, algo esperable en un modelo genomico de este tipo.

## Capacidades

- Segmentacion aprendida de secuencias de ADN en chunks mediante fronteras (`out["cut"]`).
- Extraccion de caracteristicas pooled invariantes a la cadena (`pooled_features`), adecuadas para etiquetas que no dependen de la orientacion.
- Extraccion de caracteristicas con orientacion (`pooled_features(oriented=True)`), para etiquetas dependientes de la cadena como promotores, sitios de splicing u orientacion genica.
- Clasificacion y regresion de secuencias genomicas tras fine-tuning.
- Procesamiento de ventanas de hasta 1.024 pb con alfabeto de 5 simbolos (A, C, G, T, N).
- No soporta tool calling, agentes, vision, audio ni generacion de texto libre: es un modelo especializado en ADN.

## Casos de uso

- Clasificacion de elementos regulatorios: fine-tuning sobre las caracteristicas pooled para predecir enhancers, promotores o regiones accesibles, usando ventanas de 1 kb compatibles con los intervalos de Basenji/Enformer.
- Prediccion de sitios de splicing: empleando las caracteristicas orientadas (`oriented=True`), ya que la etiqueta depende de la cadena y de la direccion de transcripcion.
- Regresion de senales genomicas: adaptar la cabeza de salida para predecir valores continuos como cobertura de ChIP-seq o senales de conservacion a partir de las features pooled.
- Linea base experimental en investigacion sobre tokenizacion: sirve como control no equivariante para cuantificar la ganancia de MirrorDNA-duplex en los mismos benchmarks y con los mismos datos.
- Estudio de orientacion genica: usar las features orientadas para tareas donde la direccion del gen es la etiqueta, aprovechando el aumento por reverse-complement del entrenamiento.
- Prototipado rapido en genomica computacional: con 2,52 M de parametros y pesos safetensors, cabe en cualquier GPU consumer y permite iterar sobre pipelines de evaluacion sin coste de infraestructura.
- Reproduccion de resultados del articulo: el codigo se distribuye con los pesos y los scripts de fine-tuning y benchmarks estan en el repositorio de GitHub, lo que facilita replicar las comparaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (2,52 M de parametros, unos 10 MB de pesos); en la practica el cuello de botella es el tamano de lote y la longitud de secuencia, no el modelo.
- GPU recomendadas: cualquier GPU consumer moderna sirve; tambien es viable en CPU para evaluacion por lotes.
- Cabe en consumer GPU: si, en cualquier GPU con al menos 1 GB de memoria libre (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo con el modulo `rcchunk` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje de texto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chunker-rcaug (este modelo) | 2,52 M | 1.024 pb | Control no equivariante con aumento RC | MIT | HuggingFace |
| MirrorDNA-duplex | no disponible | 1.024 pb | Tokenizador equivariante al reverse-complement | no disponible | Referenciado en el articulo y el repositorio |
| Modelos genomicos de mayor escala (p. ej. los evaluados en el articulo) | mayores | no disponible | Clasificacion/regresion genomica | no disponible | no disponible |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; el propio autor indica que modelos mas grandes son mas precisos en varios benchmarks del articulo.

## Limitaciones y advertencias

- Modelo de investigacion: pensado para clasificacion y regresion con fine-tuning, no para uso directo en produccion sin adaptacion.
- Preentrenado unicamente en genoma humano (hg38) y con ventanas de 1 kb; el rendimiento fuera de esa especie o con contextos mayores no esta caracterizado.
- No es equivariante a la cadena por diseno: es el control experimental, por lo que las caracteristicas invariantes pueden ser menos robustas que las de MirrorDNA-duplex.
- Para etiquetas dependientes de la cadena (promotores, sitios de splicing, orientacion genica) deben usarse las features orientadas; las invariantes no son adecuadas en esos casos.
- Riesgo de sobreajuste y de generalizacion limitada por el tamano reducido (2,52 M de parametros) y por los 10.000 pasos de preentrenamiento.
- No se documentan sesgos especificos ni evaluaciones de calibracion; como todo modelo entrenado en hg38, hereda los sesgos de composicion y anotacion del genoma de referencia.
- Licencia MIT: permite uso comercial, pero no se ofrece garantia ni soporte; conviene citar el articulo (la entrada de citation aun no esta publicada).
- La fecha de creacion del repositorio (2026) y el estado "submission" del articulo indican que el trabajo puede no estar revisado por pares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nirjhor123/chunker-rcaug
- Codigo y scripts: https://github.com/NIRJHOR-DATTA/MirrorDNA
- Articulo: *Learning Strand-Equivariant Tokenizations of DNA with MirrorDNA* (RECOMB 2027, submission; sin enlace disponible)
