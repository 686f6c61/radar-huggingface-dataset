# mradermacher/OpenElla-NovelWriter-Charol-i1-GGUF

## Resumen

OpenElla-NovelWriter-Charol-i1-GGUF es un conjunto de cuantizaciones en formato GGUF publicadas por mradermacher a partir del modelo N-Bot-Int/OpenElla-NovelWriter-Charol, un modelo de 8.030.261.312 parametros (aproximadamente 8B) construido mediante mergekit, es decir, por fusion de pesos de otros modelos en lugar de entrenamiento desde cero. El repositorio no incluye pesos en safetensors, sino exclusivamente archivos GGUF pensados para inferencia local con llama.cpp y herramientas compatibles.

La particularidad de esta publicacion es el uso de cuantizacion con importance matrix (imatrix), identificada por el sufijo "i1" en los nombres de archivo. Este metodo calcula una matriz de importancia a partir de datos de calibracion para asignar mas precision a los tensores que mas afectan a la perplejidad, lo que en teoria permite obtener una calidad superior a igual tamano de archivo que las cuantizaciones estaticas equivalentes.

El modelo base esta etiquetado como conversational y orientado por su nombre a la escritura de novelas, con soporte declarado unicamente de ingles. No hay informacion publica en la documentacion disponible sobre la arquitectura interna, la longitud de contexto, la licencia o los datos de entrenamiento. A la fecha de alta del repositorio, este registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base generado con mergekit; no se detalla la familia arquitectonica) |
| Parametros totales | 8.030.261.312 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (i1): i1-Q2_K, i1-IQ3_M, i1-Q4_K_S. El autor lista ademas, en las etiquetas internas del repositorio, los tipos Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small). Tambien existe una version de cuantizaciones estaticas en un repositorio hermano |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivos .gguf, algunos divididos en varias partes). El modelo base original esta en safetensors segun el campo de parametros reales |
| Tamano del repositorio | 45,5 GB |
| Cuantizaciones con tamano publicado | imatrix 0,1 GB; i1-Q2_K 3,3 GB; i1-IQ3_M 3,9 GB; i1-Q4_K_S 4,8 GB |
| Etiquetas | transformers, gguf, mergekit, merge, en, conversational, endpoints_compatible, region:us, imatrix |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. La etiqueta mergekit y la etiqueta merge indican que N-Bot-Int/OpenElla-NovelWriter-Charol se obtuvo fusionando los pesos de dos o mas modelos preexistentes mediante alguna de las tecnicas soportadas por mergekit (por ejemplo, linear, SLERP, TIES, DARE-TIES o model stock). El repositorio de cuantizacion no documenta que modelos intervinieron en la fusion, ni los hiperparametros del merge, ni la receta de densidades utilizada.

Tampoco hay datos sobre el entrenamiento previo de los modelos fusionados: numero de tokens, composicion del dataset, uso de RLHF, DPO o cualquier otra fase de alineamiento. La unica innovacion tecnica documentada en este repositorio es la cuantizacion con importance matrix, que emplea un fichero imatrix de 0,1 GB generado a partir de un corpus de calibracion para ponderar la precision de cada tensor durante la cuantizacion. El autor advierte que las cuantizaciones IQ suelen ser preferibles a cuantizaciones no IQ del mismo tamano, y enlaza comparativas externas de perplejidad entre tipos de cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles: la etiqueta conversational del modelo base indica que esta preparado para mantener dialogos, presumiblemente con un sesgo hacia narrativa y escritura de ficcion segun su nombre.
- Escritura creativa y narrativa: el nombre del modelo base (NovelWriter) sugiere un ajuste orientado a la redaccion de novelas y textos largos de ficcion, si bien la model card no documenta esta capacidad de forma explicita.
- Inferencia local en CPU y GPU mediante llama.cpp y cualquier runtime compatible con GGUF.
- Despliegue como endpoint compatible con la API de OpenAI: la etiqueta endpoints_compatible indica que puede servirse a traves de infraestructuras que emulan dicha interfaz.
- Capacidades multilingues: no disponibles. El modelo declara unicamente ingles.
- Tool calling, function calling, razonamiento multi-paso, modo thinking, vision o audio: no disponibles ni documentados.

## Casos de uso

- Asistente de escritura local y privada: un novelista puede ejecutar el modelo en su propio equipo con cuantizaciones i1-Q4_K_S de 4,8 GB para generar borradores, continuaciones de escenas o variaciones de un parrafo sin enviar el manuscrito a ningun servicio externo.
- Generacion de dialogos para videojuegos: integrado en un motor de juego mediante una biblioteca cliente de llama.cpp, el modelo puede producir lineas de personaje en tiempo de ejecucion; su tamano de 8B permite desplegarlo en la misma maquina que el juego con una GPU de gama media.
- Prototipado de narrativa ramificada: para herramientas de ficcion interactiva, el modelo puede generar multiples continuaciones coherentes a partir de un mismo estado de la historia, con la ventaja de que las cuantizaciones pequenas (i1-IQ3_M, 3,9 GB) reducen el coste de ejecutar varias instancias en paralelo.
- Correccion de estilo y reescritura: dado un fragmento, el modelo puede reescribirlo con un registro distinto o proponer alternativas de frase; la cuantizacion Q4_K_S esta marcada por el autor como el punto optimo entre tamano, velocidad y calidad.
- Generacion de resumenes y sinopsis de capitulos: util para autores que necesitan resumenes de continuidad de sus propios textos largos, siempre que se respete la ventana de contexto del modelo, que no esta documentada.
- Base para fine-tuning posterior del modelo original: el repositorio en safetensors del modelo base permite ajustar la fusion sobre un corpus propio, y estas cuantizaciones GGUF sirven despues para comparar la calidad del ajuste contra el modelo sin ajustar.
- Servicio conversacional autoalojado de bajo coste: mediante la etiqueta endpoints_compatible puede exponerse en un servidor modesto como alternativa a APIs comerciales, con la advertencia de que la licencia del modelo base no esta declarada y debe verificarse antes de un uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el repositorio de cuantizacion ni la model card del modelo base incluyen valores de MMLU, HumanEval, GSM8K, MT-Bench u otras metricas. Tampoco se ofrecen mediciones de perplejidad de las propias cuantizaciones.

## Requisitos de hardware

- VRAM estimada (calculada a partir del numero de parametros de 8,03B; son estimaciones, no datos publicados):
  - i1-Q2_K (3,3 GB): alrededor de 4 GB de VRAM incluyendo contexto moderado.
  - i1-IQ3_M (3,9 GB): alrededor de 5 GB.
  - i1-Q4_K_S (4,8 GB): alrededor de 6 GB.
  - Q5_K_M y Q6_K (no publicados en este repositorio pero listados en las etiquetas): entre 6 y 7,5 GB.
  - Q8_0: alrededor de 9 GB.
  - FP16 del modelo base: alrededor de 16 GB.
- GPU recomendadas: por debajo del umbral de 8 GB cabe una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4070; para las cuantizaciones de mayor calidad y contexto largo son adecuadas una RTX 4090, una L40S, una A100 o una H100, aunque el modelo es pequeno y no requiere aceleradores de centro de datos.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 6 GB o mas de VRAM puede ejecutar las cuantizaciones i1-Q2_K, i1-IQ3_M o i1-Q4_K_S, y las cuantizaciones de 3 a 4 GB pueden ejecutarse incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y servidores que expongan la API de OpenAI sobre GGUF. El soporte de GGUF en vLLM es experimental y no esta verificado para este repositorio; TGI no soporta GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles. El autor indica que i1-Q4_K_S es el punto optimo entre tamano, velocidad y calidad, sin aportar cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables, por lo que la comparacion se limita a lo verificable.

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| mradermacher/OpenElla-NovelWriter-Charol-i1-GGUF | 8,03B | no disponible | GGUF (imatrix) | no disponible | Objeto de esta ficha; 0 descargas y 0 likes |
| mradermacher/OpenElla-NovelWriter-Charol-GGUF | no disponible | no disponible | GGUF (cuantizaciones estaticas) | no disponible | Version con cuantizaciones sin imatrix del mismo modelo base |
| mradermacher/OpenElla-NovelWriter-8B-V2-merged-i1-GGUF | no disponible | no disponible | GGUF (imatrix) | no disponible | Cuantizacion de la version V2 fusionada de la familia OpenElla-NovelWriter |
| N-Bot-Int/OpenElla-NovelWriter-Charol | 8,03B | no disponible | safetensors | no disponible | Modelo base del que derivan las cuantizaciones |

No se han identificado en la informacion disponible comparaciones con modelos de otras familias (por ejemplo, Llama 3.1 8B, Mistral 7B o Qwen2.5 7B) que incluyan datos objetivos para este modelo.

## Limitaciones y advertencias

- Licencia no declarada: tanto el repositorio de cuantizacion como el modelo base carecen de licencia indicada. No debe asumirse permiso de uso comercial sin verificar la procedencia de los modelos fusionados en el merge.
- Idioma: el modelo declara unicamente ingles. No hay evidencia de capacidades en castellano ni en otros idiomas.
- Longitud de contexto desconocida: al no documentarse la ventana de contexto del modelo base, no puede garantizarse el comportamiento en conversaciones o documentos largos.
- Riesgo de alucinacion: al ser un modelo de 8B sin evaluacion publicada, la tasa de invencion de hechos es indeterminada y previsiblemente alta en tareas factuales.
- Ausencia de benchmarks y de validacion externa: el repositorio registra 0 descargas y 0 likes, por lo que no existe retroalimentacion de usuarios que permita anticipar su comportamiento real.
- Perdida de calidad por cuantizacion: las cuantizaciones de 2 y 3 bits (i1-Q2_K, i1-IQ3_M) degradan la calidad respecto al modelo base. El propio autor senala que i1-Q4_K_S es el compromiso optimo; las cuantizaciones IQ suelen superar a las no IQ de tamano similar.
- Procedencia del merge opaca: al desconocerse los modelos fusionados y los hiperparametros del merge, no pueden auditarse los sesgos heredados ni la composicion de los datos de entrenamiento originales.
- Especializacion estrecha: la orientacion a escritura de ficcion implica un rendimiento probablemente inferior en tareas de codigo, matematicas o razonamiento formal, aunque no hay datos que lo cuantifiquen.
- Fecha de publicacion atipica: el repositorio figura creado el 2026-09-24, fecha posterior a la actual. Conviene comprobar la vigencia y disponibilidad de los enlaces antes de planificar una integracion en produccion.

## Enlaces

- Repositorio de cuantizaciones imatrix (objeto de esta ficha): https://huggingface.co/mradermacher/OpenElla-NovelWriter-Charol-i1-GGUF
- Repositorio de cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/OpenElla-NovelWriter-Charol-GGUF
- Cuantizaciones de la version V2 fusionada: https://huggingface.co/mradermacher/OpenElla-NovelWriter-8B-V2-merged-i1-GGUF
- Modelo base: https://huggingface.co/N-Bot-Int/OpenElla-NovelWriter-Charol
- Pagina de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#OpenElla-NovelWriter-Charol-i1-GGUF
- Guia de uso de archivos GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
