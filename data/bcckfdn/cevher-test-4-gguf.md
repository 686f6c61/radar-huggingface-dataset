# bcckfdn/cevher-test-4-GGUF

## Resumen

cevher-test-4-GGUF es la distribucion en formato GGUF del modelo cevher-406m, desarrollado por el usuario bcckfdn y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de lenguaje de 406.918.144 parametros (aproximadamente 406 M) entrenado desde cero sobre 3.932 millones de tokens, con una arquitectura de tipo Llama equivalente a la utilizada por la familia SmolLM2: 34 capas y una dimension oculta de 1024. El repositorio no contiene los pesos originales en safetensors, sino cuatro cuantizaciones GGUF listas para su uso con llama.cpp, Ollama y LM Studio.

El modelo esta orientado a generacion de texto conversacional en turco e ingles, dos idiomas declarados explicitamente en sus etiquetas y en la model card. Su relevancia practica reside en el segmento de los modelos pequenos: al situarse por debajo de los 500 millones de parametros, puede ejecutarse en CPU, en GPUs de gama baja e incluso en dispositivos con recursos muy limitados, lo que lo hace apto para prototipado rapido y despliegues en el borde.

Conviene senalar que se trata de un modelo de prueba (el propio identificador incluye "test"), sin descargas ni valoraciones en el momento de redactar esta ficha, y sin resultados de evaluacion publicados. No se ha publicado informacion sobre la longitud de contexto soportada, la composicion del corpus de entrenamiento ni el proceso de alineacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (arquitectura SmolLM2) |
| Parametros totales | 406.918.144 (~406 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Capas | 34 |
| Dimension oculta | 1024 |
| Tokens de entrenamiento | 3.932 millones |
| Modelo base | bcckfdn/cevher-test-4 |
| Tamano del repositorio | 1,8 GB |
| Ficheros incluidos | cevher-406m-BF16.gguf (778 MB), cevher-406m-Q8_0.gguf (414 MB), cevher-406m-Q5_K_M.gguf (281 MB), cevher-406m-Q4_K_M.gguf (245 MB) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card indica que el modelo sigue la arquitectura SmolLM2, que a su vez es una implementacion de la arquitectura Llama: transformer decoder-only con atencion causal, normalizacion RMSNorm y activacion SwiGLU. Los hiperparametros declarados son 34 capas y una dimension oculta de 1024, coherentes con un modelo denso de aproximadamente 406 M de parametros. El entrenamiento se realizo desde cero (no es un fine-tuning ni una destilacion de otro modelo) sobre 3.932 millones de tokens.

No se especifica la composicion del dataset de entrenamiento, la longitud de secuencia utilizada durante el preentrenamiento, el tokenizador empleado ni si hubo fases posteriores de ajuste supervisado (SFT), RLHF o DPO. Las etiquetas del repositorio incluyen "conversational", lo que sugiere cierta orientacion a dialogo, pero no hay documentacion que confirme un proceso de alineacion. Tampoco se describen innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, mezcla de expertos) mas alla de la propia arquitectura base.

El unico proceso tecnico documentado con detalle es la conversion a GGUF y la publicacion de cuatro niveles de cuantizacion, que van desde BF16 sin perdida apreciable hasta Q4_K_M como opcion de menor huella en disco.

## Capacidades

- Generacion de texto autoregresivo en turco e ingles, con orientacion conversacional segun las etiquetas del repositorio.
- Continuacion de texto y respuesta a instrucciones simples, en el rango esperable para un modelo de 406 M de parametros.
- Capacidad limitada de razonamiento de varios pasos y de aritmetica; no hay evaluaciones que la cuantifiquen.
- Soporte de tool calling o function calling: no disponible (no se menciona en la model card ni en las etiquetas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es exclusivamente text-generation.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Ejecucion local en CPU y GPU mediante llama.cpp, Ollama y LM Studio.

## Casos de uso

- Clasificacion y etiquetado de texto en turco: con 406 M de parametros, el modelo puede ajustarse con LoRA para tareas de analisis de sentimiento, deteccion de spam o moderacion de comentarios en plataformas turcoparlantes, con un coste de entrenamiento e inferencia muy bajo.
- Chatbot de FAQ en dispositivos sin GPU: las cuantizaciones Q4_K_M (245 MB) y Q5_K_M (281 MB) permiten desplegar un asistente conversacional en un portatil, un mini-PC o una Raspberry Pi, sirviendo respuestas a partir de una base de preguntas frecuentes.
- Generacion aumentada por recuperacion (RAG) ligera: el modelo puede actuar como generador final en un pipeline RAG sobre documentacion interna en turco, donde el recuperador aporta el contexto y el modelo se limita a reformular la respuesta. Requiere verificar empiricamente la ventana de contexto soportada antes de fijar la estrategia de troceado.
- Enrutado de consultas en sistemas multi-modelo: por su bajo coste, puede emplearse como clasificador previo que decida si una peticion debe enviarse a un modelo mayor o resolverse localmente.
- Prototipado e investigacion sobre cuantizacion GGUF: el repositorio ofrece cuatro niveles de cuantizacion del mismo modelo, lo que lo convierte en un banco de pruebas util para medir el impacto de Q4_K_M, Q5_K_M y Q8_0 en calidad y velocidad dentro de llama.cpp.
- Normalizacion y limpieza de texto turco: tareas de reescritura, correccion de estilo o generacion de variantes de un texto breve, ejecutables por lotes en CPU.
- Traduccion asistida turco-ingles de frases cortas: util como borrador rapido o como componente de un sistema mayor con revision humana, dado que la calidad esperable en un modelo de este tamano es limitada.
- Generacion de descripciones y metadatos: creacion de titulares, resumenes de una linea o etiquetas para catalogos de contenido en turco, donde la latencia baja y el coste minimo priman sobre la calidad absoluta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K u otras) y la busqueda web realizada no ha devuelto referencias tecnicas al modelo: los resultados obtenidos corresponden a hilos de Reddit sin relacion con el proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB para BF16, 0,45 GB para Q8_0, 0,30 GB para Q5_K_M y 0,26 GB para Q4_K_M. A estas cifras hay que sumar el espacio de la cache KV, cuyo tamano depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente. El modelo cabe holgadamente en tarjetas de gama de entrada y en GPUs integradas con memoria compartida.
- GPU de consumo: si, cabe en cualquier GPU de consumo moderna (serie RTX 30/40, RX 6000/7000) e incluso en GPUs de portatil con 4 GB de VRAM. Las tarjetas de gama alta (A100, H100, RTX 4090) estan sobredimensionadas para este modelo.
- Ejecucion en CPU: totalmente viable. El modelo puede correr en CPU sin GPU, que es precisamente el escenario al que apuntan las cuantizaciones Q4_K_M y Q5_K_M.
- Opciones de despliegue: llama.cpp (comando `llama-cli -m cevher-406m-Q4_K_M.gguf -p "Merhaba" -cnv`), Ollama mediante un Modelfile generado con `ollama create cevher-406m -f Modelfile`, y LM Studio colocando los ficheros en `~/.cache/lm-studio/models/bcckfdn/cevher-test-4-GGUF/`.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La comparativa se establece con modelos densos de rango equivalente ampliamente conocidos. Los datos de las alternativas corresponden a informacion publica de sus respectivas model cards; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Contexto de uso |
|---|---|---|---|---|---|
| cevher-test-4-GGUF (este modelo) | 406 M | no disponible | tr, en | Apache 2.0 | Modelo de prueba, sin descargas ni evaluaciones publicadas |
| SmolLM2-360M | 362 M | 8.192 tokens | en (principalmente) | Apache 2.0 | Modelo pequeno de referencia, con evaluaciones publicadas |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | multilingue (incluye en, zh) | Apache 2.0 | Modelo pequeno con contexto largo y amplia cobertura idiomatica |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | en (principalmente) | Apache 2.0 | Modelo de ~1 B con fine-tuning conversacional (Chat) |

En terminos de rendimiento medido no es posible establecer comparacion alguna, porque cevher-406m no publica resultados de benchmarks. La ventaja diferencial de este modelo frente a las alternativas es su cobertura nativa del turco y la disponibilidad inmediata de cuatro cuantizaciones GGUF; su desventaja es la ausencia total de validacion publica.

## Limitaciones y advertencias

- Modelo sin validacion publica: cero descargas y cero valoraciones en el momento de redactar la ficha, y ninguna evaluacion de calidad publicada. No se recomienda su uso en produccion sin una evaluacion propia previa.
- Modelo de prueba: el identificador del repositorio ("cevher-test-4") indica que se trata de un experimento, no de una version estable mantenida.
- Riesgo de alucinacion elevado: en modelos de ~400 M de parametros la tasa de invencion de hechos es alta y la coherencia en respuestas largas se degrada rapidamente.
- Longitud de contexto desconocida: no se especifica la ventana de contexto entrenada. Usar valores por defecto altos en llama.cpp puede producir degradacion silenciosa, por lo que conviene validarla empiricamente.
- Cobertura idiomatica limitada: solo se declaran turco e ingles. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera bajo.
- Sesgos no documentados: no se describe el corpus de entrenamiento, por lo que no es posible auditar sesgos de genero, origen, religion o ideologia. Un corpus turco extraido de la web sin filtrado puede arrastrar sesgos propios de ese dominio.
- Capacidades no confirmadas: no hay evidencia de soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Fecha de publicacion atipica: los metadatos del repositorio registran una fecha de creacion de 2026-09-25 y de actualizacion de 2026-09-25, fechas posteriores a la redaccion de esta ficha. Conviene tratarlas con cautela.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y se indiquen los cambios. No impone restricciones de uso adicionales, pero tampoco ofrece garantias de ningun tipo por parte del autor.
- Trazabilidad: no se ha localizado paper, informe tecnico ni repositorio de codigo asociado al entrenamiento. La busqueda web no ha devuelto ninguna fuente relevante sobre el modelo.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/bcckfdn/cevher-test-4-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher-test-4
- Paper, blog o repositorio de codigo del entrenamiento: no disponible
- Resultados de benchmarks o informe de evaluacion: no disponible
- Demos o espacios asociados: no disponible

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces encontrados correspondian a hilos de Reddit sin conexion con el proyecto, por lo que se han omitido.
