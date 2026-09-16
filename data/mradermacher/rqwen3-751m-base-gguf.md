# mradermacher/RQwen3-751M-Base-GGUF

## Resumen

RQwen3-751M-Base-GGUF es la version cuantizada en formato GGUF del modelo Treese/RQwen3-751M-Base, un modelo de lenguaje causal de 751.632.384 parametros (aproximadamente 751,6 millones) entrenado desde cero y publicado como modelo base, sin ajuste por instrucciones. La cuantizacion la ha realizado mradermacher, autor habitual de conversiones GGUF en HuggingFace, y ofrece doce variantes de cuantizacion que van desde Q2_K (0,4 GB) hasta f16 (1,6 GB). El nombre y las etiquetas del modelo remiten a la familia Qwen3, de la que hereda la nomenclatura y, previsiblemente, el diseno de tokenizador y arquitectura decoder-only, aunque la ficha no documenta la configuracion interna.

El modelo se distribuye bajo licencia Apache 2.0, esta declarado unicamente para ingles y fue preentrenado sobre un corpus compuesto por fineweb-edu, Wikipedia, open-web-math, Stack Exchange Preferences, peS2o-final y cosmopedia. Se trata, por tanto, de un modelo pequeno orientado a investigacion en preentrenamiento, experimentacion con tecnicas de cuantizacion extrema y ajuste fino posterior, no a uso conversacional directo.

Su relevancia actual es doble: por un lado, permite ejecutar un transformer de ~750 M de parametros en hardware muy modesto, incluso en CPU, gracias a las cuantizaciones de 2 a 5 bits; por otro, al ser un modelo base entrenado desde cero sobre un dataset documentado, sirve como banco de pruebas reproducible para estudiar el efecto de la cuantizacion en la perplejidad de modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (etiquetado como qwen3; configuracion detallada no disponible) |
| Parametros totales | 751.632.384 (~751,6 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (12 ficheros); el modelo base original se publica en safetensors |
| Tipo de modelo | Base (pretrained-from-scratch), sin ajuste por instrucciones |
| Tamano del repositorio | 7,0 GB |
| Modelo base | Treese/RQwen3-751M-Base |
| Cuantizado por | mradermacher |

## Arquitectura y entrenamiento

La informacion disponible no detalla la configuracion de la arquitectura (numero de capas, dimension oculta, cabezas de atencion, tipo de normalizacion ni estrategia posicional). Las etiquetas del repositorio indican `qwen3`, `causal-lm`, `pretrained-from-scratch` y `base-model`, lo que situa el modelo como un transformer causal de tipo decoder-only con nomenclatura de la familia Qwen3, entrenado desde cero y no derivado por destilacion ni por ajuste de un modelo mayor. El recuento exacto de parametros, 751.632.384, procede de los pesos en safetensors del modelo base.

El preentrenamiento declara seis fuentes de datos: HuggingFaceFW/fineweb-edu (texto web educacional filtrado), wikimedia/wikipedia, open-web-math/open-web-math (matematicas), HuggingFaceH4/stack-exchange-preferences (contenido tecnico y de programacion), MaLA-LM/peS2o-final (literatura cientifica) y HuggingFaceTB/cosmopedia (texto sintetico de alta calidad). No se especifica el numero de tokens procesados, la mezcla porcentual de cada fuente ni si hubo fases posteriores de ajuste (SFT, RLHF o DPO). Al tratarse de un modelo base, se asume que no se aplico ningun alineamiento por preferencias, aunque este punto no se confirma en la documentacion.

La innovacion tecnica de este repositorio concreto no esta en el modelo, sino en la conversion: se ofrecen cuantizaciones estaticas generadas con llama.cpp, incluidas variantes IQ (IQ4_XS) y k-quants de varios tamanos, lo que permite analizar el compromiso entre bits por peso y calidad. El autor indica que no hay cuantizaciones ponderadas con imatrix para este modelo en el momento de la publicacion, de modo que la calidad relativa de las variantes de baja precision puede ser inferior a la de una cuantizacion imatrix equivalente.

## Capacidades

- Generacion de texto por continuacion (completion): al ser un modelo base, su funcion nativa es predecir el siguiente token, no seguir instrucciones.
- Modelado de lenguaje en ingles: entrenado sobre corpus mayoritariamente anglosajon, con especial presencia de contenido educacional, cientifico y matematico.
- Razonamiento matematico basico y resolucion de problemas textuales, favorecido por la inclusion de open-web-math y peS2o-final en el preentrenamiento.
- Generacion y continuacion de codigo y contenido tecnico, derivada de stack-exchange-preferences.
- Capacidad de servir como punto de partida para ajuste fino supervisado, DPO o entrenamiento con instrucciones.
- Extraccion de representaciones internas del transformer para tareas de investigacion (analisis de capas, sondeo de conocimiento, estudios de escalado).
- No dispone de soporte de tool calling ni function calling: no hay plantilla de chat ni alineamiento instruccional declarados.
- No dispone de capacidades de agente, razonamiento multi-paso guiado ni modo de pensamiento explicito.
- No dispone de vision, audio ni multimodalidad.
- Soporte multilingue limitado al ingles segun los metadatos; el comportamiento en otros idiomas no esta documentado y previsiblemente sera degradado.

## Casos de uso

- Ajuste fino supervisado para dominios verticales: al ser un modelo base de 751 M de parametros, se puede reentrenar por completo en una unica GPU consumer con datasets de decenas de miles de ejemplos, por ejemplo para clasificacion de textos legales o generacion de informes de dominio cerrado.
- Investigacion en cuantizacion: las doce variantes GGUF publicadas (de Q2_K a f16) permiten medir la degradacion de perplejidad al reducir bits por peso, con tamanos que van de 0,4 GB a 1,6 GB, sin necesidad de generar las cuantizaciones uno mismo.
- Experimentos reproducibles de preentrenamiento: al documentarse las seis fuentes de datos, el modelo sirve como referencia para estudiar el efecto de la composicion del corpus en un presupuesto de computo pequeno.
- Generacion de datos sinteticos y aumento de corpus: el modelo puede completar plantillas y generar continuaciones para aumentar datasets de entrenamiento de modelos mayores, con la ventaja de ejecutarse en CPU.
- Prototipado de pipelines de inferencia: su tamano permite validar integraciones con llama.cpp, Ollama o servidores compatibles con GGUF antes de migrar a modelos mayores, con un coste de iteracion muy bajo.
- Despliegue en dispositivos con recursos minimos: la variante Q4_K_M de 0,6 GB cabe en telefonos, Raspberry Pi o contenedores con poca memoria, util para demos educativas de generacion de texto sin conexion.
- Destilacion y comparacion de arquitecturas: sirve como estudiante o como linea base para comparar con otros modelos del mismo orden de parametros en estudios de escalado y eficiencia.
- Analisis linguistico y sondeo de representaciones: al ser un modelo entrenado desde cero, sus capas intermedias son utiles para estudiar como se codifica informacion cientifica o matematica en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye metricas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni valores de perplejidad, y la busqueda web no ha devuelto ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a paginas de ayuda de Google, sin relacion con el tema).

## Requisitos de hardware

- VRAM estimada segun el propio peso de los ficheros: Q2_K ~0,4 GB, Q3_K_S/M/L ~0,5 GB, IQ4_XS ~0,6 GB, Q4_K_S y Q4_K_M ~0,6 GB, Q5_K_S ~0,6 GB, Q5_K_M ~0,7 GB, Q6_K ~0,7 GB, Q8_0 ~0,9 GB, f16 ~1,6 GB. Hay que anadir el consumo del contexto (KV cache) y el overhead del runtime, cuyo valor exacto no se puede calcular sin conocer el numero de capas y cabezas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para las cuantizaciones de 4 a 8 bits; GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 y H100 funcionan sin problemas, aunque en estas dos ultimas el modelo queda muy infrautilizado.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, e incluso en graficos integrados con memoria unificada.
- Ejecucion en CPU: viable en todas las cuantizaciones, incluida f16 en maquinas con 4 GB de RAM libres; Q4_K_S y Q4_K_M estan marcadas por el autor como "fast, recommended".
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para el formato GGUF; vLLM, TGI o transformers para el modelo base en safetensors. El repo declara compatibilidad con endpoints (`endpoints_compatible`) y libreria `transformers`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las variantes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| RQwen3-751M-Base-GGUF | 751,6 M | no disponible | en | Apache 2.0 | GGUF (12 variantes) | Modelo base sin alineamiento; 12 cuantizaciones publicadas |
| Qwen3-0.6B | 0,6 B | 32.768 tokens nativos (ampliable con YaRN) | multilingue | Apache 2.0 | safetensors, GGUF | Incluye variantes base e instruct; mayor soporte de ecosistema |
| Llama 3.2 1B | ~1,23 B | 128.000 tokens | multilingue | Llama 3.2 Community License | safetensors, GGUF | Requiere aceptar licencia; incluye variantes instruct |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens | ingles y otros | Apache 2.0 | safetensors, GGUF | Alternativa con pipeline de datos y evaluacion publicados |

Los datos de contexto y licencia de los modelos comparables proceden de sus fichas publicas habituales; para RQwen3-751M-Base la longitud de contexto no esta documentada en la informacion disponible, por lo que la comparacion en ese eje no puede completarse. En terminos de rendimiento en tareas no se dispone de ninguna cifra para ninguno de los cuatro modelos dentro de esta ficha, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones, no mantiene formato conversacional y puede producir continuaciones incoherentes o repetitivas si se usa con prompts de tipo chat.
- Riesgo elevado de alucinacion: con 751 M de parametros, la capacidad de almacenar hechos es limitada; las afirmaciones factuales deben verificarse siempre.
- Sesgos: el corpus de preentrenamiento (web, Wikipedia, Stack Exchange, literatura cientifica) reproduce sesgos de dichas fuentes, especialmente de genero, origen geografico y punto de vista occidental. No se documenta ningun proceso de mitigacion.
- Idioma: declarado exclusivamente para ingles; el rendimiento en castellano u otras lenguas no esta evaluado y previsiblemente sera bajo.
- Contexto: la longitud de contexto no esta documentada, lo que impide garantizar el comportamiento en ventanas largas y complica el ajuste de parametros de inferencia.
- Cuantizacion: las variantes de 2 y 3 bits degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality" y advierte de que no hay cuantizaciones ponderadas con imatrix disponibles, que suelen dar mejor relacion tamano/calidad en regimenes bajos.
- Rendimiento sin medir: no hay benchmarks publicados ni comparaciones controladas frente a otros modelos del mismo tamano, por lo que cualquier eleccion de despliegue parte de supuestos no verificados.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y sin garantias; conviene conservar el aviso de licencia y el reconocimiento del autor del modelo base y del cuantizador.
- Trazabilidad: el modelo base tiene 0 descargas y 0 likes en el momento de la consulta y la busqueda web no devuelve resultados, lo que indica ausencia de validacion externa por parte de la comunidad.
- Produccion: al no existir evaluaciones de robustez, seguridad ni toxicidad, no se recomienda desplegarlo en aplicaciones de cara al usuario sin una capa de moderacion y sin un ajuste previo especifico de la tarea.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RQwen3-751M-Base-GGUF
- Modelo base: https://huggingface.co/Treese/RQwen3-751M-Base
- Pagina de descarga y vision general del cuantizador: https://hf.tst.eu/model#RQwen3-751M-Base-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Pagina de la empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
- Datasets de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/wikimedia/wikipedia, https://huggingface.co/datasets/open-web-math/open-web-math, https://huggingface.co/datasets/HuggingFaceH4/stack-exchange-preferences, https://huggingface.co/datasets/MaLA-LM/peS2o-final, https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Paper, blog o demo oficial: no disponible. La busqueda web no devolvio ningun resultado relacionado con el modelo.
