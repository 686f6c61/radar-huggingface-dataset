# cyberviser/quill-poetry-v3

## Resumen

Quill poetry v3 es un adaptador LoRA publicado por el usuario cyberviser bajo el identificador `cyberviser/quill-poetry-v3`. No es un modelo completo, sino un ajuste fino mediante PEFT (Parameter-Efficient Fine-Tuning) sobre `mistralai/Mistral-7B-Instruct-v0.3`, el modelo instructivo de 7.248 millones de parametros de Mistral AI con 32.768 tokens de contexto y licencia Apache 2.0. El repositorio ocupa solo 0,1 GB, lo que confirma que contiene unicamente los pesos del adaptador en formato safetensors, no una copia fusionada del modelo base.

El objetivo declarado del autor es la generacion de poesia: la model card describe una "quality pass" que refuerza los pareados yambicos, impone una disciplina de "solo poema" en las respuestas y emplea formas metricas mas densas que la version anterior (v2, de la que este modelo es continuacion). El entrenamiento se realizo en local sobre una RTX 5070, segun la propia model card, lo que sitúa el proyecto en el ambito del ajuste fino de aficionado o de investigacion de estilo, no en el de un modelo de produccion validado.

La relevancia de la ficha es limitada por el momento: el modelo acumula 0 descargas y 0 me gusta, no publica resultados de evaluacion, no detalla el corpus de entrenamiento ni los hiperparametros del LoRA, y no especifica idiomas soportados. Su interes practico reside en servir como ejemplo de especializacion estilistica de bajo coste sobre un modelo de 7B, y en que la licencia Apache 2.0 del adaptador y del modelo base permite reutilizarlo comercialmente sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion por ventana deslizante (GQA, RoPE, SwiGLU, RMSNorm) en el modelo base; el artefacto publicado es un adaptador LoRA (PEFT) |
| Parametros totales | 7.248 millones en el modelo base; el adaptador LoRA ocupa 0,1 GB en disco |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (ventana deslizante de 4.096 tokens por capa) |
| Tipos de cuantizacion | El adaptador se publica en safetensors sin cuantizar. El modelo base soporta cuantizacion GPTQ, AWQ y GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) una vez fusionado el adaptador |
| Idiomas soportados | no disponible (la model card no lo indica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Libreria | peft |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only de 32 capas, dimension oculta 4.096 y 32 cabezas de atencion con 8 cabezas KV (Grouped Query Attention). El modelo base usa attention con ventana deslizante de 4.096 tokens y cache de buffer rodante, lo que le permite procesar secuencias de hasta 32.768 tokens con un coste de memoria de KV mas contenido que una atencion completa. La version v0.3 del modelo base incorpora un tokenizador de 32.768 entradas (ampliado respecto a v0.2) y soporte nativo de function calling. El adaptador en si no modifica la arquitectura: solo anade matrices de bajo rango sobre las proyecciones del transformer.

La informacion sobre el entrenamiento es minima. La model card indica que se trata de una "quality pass" continuada desde la v2, con tres objetivos declarados: pareados yambicos mas solidos, disciplina de "solo poema" (el modelo debe responder con poesia y no con prosa explicativa) y formas metricas mas densas. El autor senala que el entrenamiento se ejecuto en local sobre una RTX 5070. No se especifican el numero de tokens de entrenamiento, la composicion del corpus poetico, el rango y alpha del LoRA, la tasa de aprendizaje, las epocas ni si se aplico RLHF o DPO. Tampoco se documentan tecnicas de decodificacion especulativa ni optimizaciones de inferencia asociadas al adaptador.

## Capacidades

- Generacion de poesia en ingles con enfasis declarado en el pareado yambico (heroic couplet) y en formas metricas densas.
- Continuacion y reescritura de versos manteniendo rima y metro, segun los objetivos que declara la model card.
- Disciplina de salida "solo poema": el ajuste busca que el modelo no intercale explicaciones en prosa, un comportamiento util para integraciones donde se espera texto poetico puro.
- Hereda del modelo base la generacion de texto general, el razonamiento basico y el soporte de function calling de Mistral-7B-Instruct-v0.3, aunque el ajuste puede degradar estas capacidades al especializarse.
- Capacidades multilingues: no documentadas en la informacion disponible. La metrica que se menciona (yambo) es propia de la versificacion inglesa, por lo que es previsible un rendimiento mucho mayor en ingles que en otras lenguas.
- Modo de razonamiento explicito (thinking mode), vision o audio: no soportados.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para este adaptador; depende de lo que conserve del modelo base.

## Casos de uso

- Generacion de poemas por encargo: el modelo puede producir textos en metro y rima concretos a partir de una consigna, gracias a la especializacion del LoRA en formas metricas y a la disciplina de salida que evita prosa adicional.
- Asistente de escritura creativa para poetas: serviria como generador de borradores o de variaciones sobre un verso dado, que el autor humano edita despues; el contexto de 32.768 tokens del modelo base permite trabajar con poemarios completos o secuencias largas de estrofas en una sola sesion.
- Creacion de contenido editorial en verso: tarjetas, dedicatorias, letras de canciones o coplas para campanas de marketing, donde se necesita texto rimado y con metrica consistente generado por lotes.
- Docencia de metrica y versificacion: usar el modelo para generar ejemplos de pareados yambicos y comparar variantes, aprovechando que el ajuste persigue explicitamente ese patron metrico.
- Investigacion en transferencia de estilo: emplear el adaptador como caso de estudio de como un LoRA de bajo rango sobre un modelo instructivo generalista modifica el registro de salida, midiendo la degradacion en tareas no poeticas.
- Aumento de datos para entrenamiento: generar corpus poetico sintetico para entrenar o evaluar otros modelos de generacion creativa, siempre que se revise la calidad y se respeten las condiciones de la licencia Apache 2.0.
- Prototipado de bajo coste en una sola GPU: al tratarse de un adaptador de 0,1 GB sobre un modelo de 7B cuantizable a 4 bits, se puede desplegar en una estacion de trabajo con GPU de gama media para demos internas o pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas automaticas, evaluaciones humanas, comparaciones con otros adaptadores de poesia ni valores de perplejidad. El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- Adaptador: 0,1 GB en disco, con impacto en VRAM despreciable una vez cargado sobre el modelo base.
- Modelo base en fp16/bf16: alrededor de 14,5 GB solo en pesos, mas la cache KV. A 32.768 tokens de contexto en fp16 la cache KV ronda los 4 GB (32 capas, 8 cabezas KV, dimension de cabeza 128), por lo que se recomienda una GPU de 24 GB o mas: RTX 4090, A100 40/80 GB, H100.
- Modelo base en 8 bits: aproximadamente 8 GB de pesos, viable en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 5070 de 12 GB con contextos moderados.
- Modelo base en 4 bits: aproximadamente 4,5 GB de pesos, lo que permite ejecutarlo en GPU de consumo de 8-12 GB (RTX 3060, RTX 4060, RTX 5070) siempre que se limite la longitud de contexto para no desbordar la cache KV.
- Si cabe en GPU de consumo: si, mediante cuantizacion de 4 u 8 bits del modelo base. El propio autor indica que entreno el adaptador en una RTX 5070 local.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; fusion del adaptador en el modelo base para exportar a GGUF y usar llama.cpp u Ollama; vLLM con soporte de adaptadores LoRA para servir varias variantes sobre el mismo modelo base; TGI segun la compatibilidad de la version con adaptadores.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion verificable sobre otros adaptadores LoRA de poesia comparables. La tabla siguiente compara el modelo con su base y con dos alternativas generalistas de tamano similar, cuyos datos de parametros, contexto y licencia proceden de sus respectivas fichas publicas; ninguna de ellas esta especializada en poesia.

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion poetica | Evaluacion publicada |
|---|---|---|---|---|---|---|
| cyberviser/quill-poetry-v3 (LoRA sobre Mistral-7B-Instruct-v0.3) | 7.248 M (base) | 32.768 tokens | Apache 2.0 | safetensors (adaptador PEFT) | Si, pareado yambico y salida solo en verso | No |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.248 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ | No | Si, en su model card |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | No | Si, en su model card |
| Qwen/Qwen2.5-7B-Instruct | 7.610 M | 128.000 tokens | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ | No | Si, en su model card |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni comparaciones con la version anterior (v2) que permitan verificar las mejoras que anuncia la model card.
- Cero adopcion registrada: 0 descargas y 0 me gusta. Es un artefacto sin validacion por parte de la comunidad.
- Corpus de entrenamiento desconocido: no se indica la procedencia de los poemas usados en el ajuste. Existe riesgo de que el modelo reproduzca fragmentos de obras protegidas por derechos de autor presentes en el conjunto de entrenamiento, algo especialmente relevante en generacion creativa.
- Riesgo de alucinacion y de atribucion falsa: el modelo puede generar versos que parezcan citas de autores reales sin serlo, o inventar atribuciones si se le pide identificar la fuente de un poema.
- Sesgos potenciales: al no documentarse la composicion del corpus, no es posible evaluar sesgos de genero, culturales o de canon literario. Un corpus poetico historicamente sesgado hacia autores occidentales puede reproducir ese sesgo.
- Limitacion idiomatica probable: la metrica objetivo (yambo) y la disciplina de salida estan formuladas en ingles. No hay evidencia de soporte de versificacion en castellano u otras lenguas, y el modelo base no esta optimizado especificamente para ninguna de ellas.
- Degradacion de capacidades generales: un ajuste orientado a producir "solo poesia" puede deteriorar la capacidad del modelo para responder preguntas, seguir instrucciones en prosa o ejecutar function calling, capacidades que si tiene el modelo base.
- Dependencia del modelo base: el adaptador requiere Mistral-7B-Instruct-v0.3 para funcionar. No es utilizable de forma autonoma ni con otras versiones del modelo sin reentrenamiento.
- Licencia: tanto el adaptador como el modelo base se distribuyen bajo Apache 2.0, lo que permite uso comercial, modificacion y redistribucion. Aun asi, el usuario es responsable de que el contenido generado no infrinja derechos de terceros.
- Contexto largo con coste: aunque el modelo base admite 32.768 tokens, la ventana deslizante de 4.096 tokens limita la atencion efectiva entre partes muy alejadas del texto, algo a tener en cuenta si se pretende mantener coherencia metrica a lo largo de un poema extenso.
- Uso en produccion no recomendado sin evaluacion previa: no hay datos de latencia, throughput ni estabilidad de salida, ni garantias de consistencia metrica mas alla de la afirmacion cualitativa del autor.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/cyberviser/quill-poetry-v3
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo. Los enlaces recuperados corresponden a paginas de controladores y perifericos de la marca Attack Shark (`controlhub.top`, `attackshark.com`, `mambasnake.pro`) y no guardan ninguna relacion con `cyberviser/quill-poetry-v3`. No se han encontrado papers, blogs, repositorios ni demos asociados al modelo.
