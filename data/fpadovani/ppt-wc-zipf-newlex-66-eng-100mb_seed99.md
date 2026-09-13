# fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed99

## Resumen

ppt-wc-zipf-newlex-66-eng-100mb_seed99 es un ajuste fino supervisado del modelo monolingüe inglés goldfish-models/eng_latn_100mb, publicado por el usuario fpadovani en Hugging Face. Se trata de un modelo pequeño, de 86.508.288 parámetros (unos 86,5 M), con arquitectura de tipo GPT-2 (etiquetas gpt2, transformers y text-generation en el Hub). El entrenamiento se ha realizado con TRL 0.23.0 mediante SFT, partiendo de un modelo base entrenado con 100 MB de texto en inglés y con la semilla 99 fijada en el identificador.

El problema que aborda es el mismo que el de su modelo base: generación de texto en inglés con un presupuesto de datos muy reducido. Su interés es fundamentalmente académico: el patrón del nombre (ppt-wc-zipf-newlex-66) sugiere un estudio sobre distribuciones de frecuencia tipo Zipf y adquisición de léxico nuevo en modelos de lenguaje entrenados con pocos datos, en la línea de la familia de modelos "goldfish" empleada en investigación sobre aprendizaje lingüístico. El run de Weights & Biases asociado apunta a la organización f-padovani-university-of-groningen y al proyecto white_cotterell.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", no declara licencia ni idiomas, y no publica resultados de benchmarks, por lo que debe tratarse como un artefacto de investigación reproducible (semilla fija, run de W&B registrado) y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta gpt2 en el Hub) |
| Parametros totales | 86.508.288 (≈86,5 M), dato real de safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible (el modelo base es monolingüe inglés: eng_latn_100mb) |
| Licencia | No disponible (la model card solo indica "licence: license", sin texto legal) |
| Formato de pesos | Safetensors |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Libreria de inferencia | Transformers (entrenado con Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1) |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, con 86.508.288 parámetros. No se documenta ninguna innovación estructural propia (no hay mezcla de expertos, ni atención lineal, ni arquitectura híbrida SSM): el repositorio es un ajuste fino del checkpoint goldfish-models/eng_latn_100mb, que a su vez pertenece a un conjunto de modelos monolingües entrenados con unos 100 MB de texto por idioma, en este caso inglés (eng_latn).

El procedimiento de entrenamiento documentado es SFT con TRL 0.23.0, sin que la model card mencione fases posteriores de RLHF, DPO u optimización por preferencias. No se especifica la composición del dataset de ajuste, el número de tokens vistos, la longitud de secuencia de entrenamiento ni los hiperparámetros; los registros del run están publicados en Weights & Biases (proyecto white_cotterell, run 33sttfoe) y son la única fuente de trazabilidad disponible. El ejemplo de uso de la model card pasa una lista de mensajes con roles (role/content), lo que sugiere que el ajuste empleó un formato conversacional, aunque la plantilla de chat no se documenta explícitamente.

## Capacidades

- Generación de texto en inglés: es la tarea declarada en el pipeline (text-generation) y la única verificable con la información disponible.
- Formato conversacional: el ejemplo rápido de la model card invoca el pipeline con una lista de mensajes con roles, lo que indica que el modelo fue ajustado, al menos parcialmente, sobre diálogos de un turno.
- Ajuste por instrucciones básico: el entrenamiento con SFT implica cierto seguimiento de instrucciones sencillas, sin que se especifique su alcance ni su fiabilidad.
- Razonamiento, matemáticas y código: no documentados.
- Tool calling / function calling: no documentado; no hay indicios de soporte de llamadas a herramientas.
- Uso como agente y razonamiento multi-paso: no documentado; el tamaño del modelo y la ausencia de evaluación hacen poco realista esperar este comportamiento.
- Capacidades multilingües: no declaradas; el modelo base es monolingüe en inglés, por lo que no debe asumirse transferencia a otros idiomas.
- Capacidades especiales: no se documentan modo de razonamiento (thinking mode), visión, audio ni decodificación especulativa.

## Casos de uso

- Reproducción de experimentos académicos: el identificador incluye una semilla fija (seed99) y un run de Weights & Biases público, de modo que sirve para replicar el ajuste y comparar variantes (otras semillas, otros tamaños de léxico o de corpus) en estudios sobre adquisición de vocabulario.
- Estudio de distribuciones tipo Zipf: el nombre del modelo sugiere análisis de frecuencia léxica; el checkpoint permite medir cómo un transformer pequeño ajustado con 100 MB de datos reproduce o desvía la ley de Zipf en el texto generado.
- Evaluación de modelos base en condiciones de datos escasos: sirve como punto de comparación frente al checkpoint original goldfish-models/eng_latn_100mb para aislar el efecto del ajuste SFT sobre el comportamiento generativo.
- Prototipado educativo y docencia: al ocupar menos de 350 MB en fp32, puede cargarse en portátiles y en cuadernos de Colab para ilustrar el funcionamiento de un pipeline de text-generation sin coste de GPU significativo.
- Pruebas de infraestructura de despliegue: útil para validar extremo a extremo cadenas con Transformers, Text Generation Inference o vLLM (todas soportan la arquitectura GPT-2) antes de migrar a modelos mayores, dado su bajo consumo de memoria.
- Generación de texto controlada en entornos sin conectividad: desplegado en CPU o en hardware embebido, puede producir continuaciones de texto muy cortas y de dominio restringido, siempre que se valide previamente la calidad de la salida.
- Docencia y análisis de sesgos: al ser un modelo pequeño entrenado con un corpus delimitado de 100 MB, es un caso de estudio manejable para auditar sesgos, repeticiones y alucinaciones en modelos de baja escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos): aproximadamente 346 MB en fp32, 173 MB en fp16/bf16, 87 MB en int8 y 43 MB en int4. El repositorio ocupa 1,4 GB, coherente con pesos en fp32 más posibles artefactos de entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; se ha verificado el ejemplo con device="cuda" en la propia model card. Funciona igualmente en GTX 1650, RTX 3060, RTX 4090, A100 o H100, donde estará limitado por CPU y por el bucle de generación, no por la memoria.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en iGPU con memoria compartida. También es viable la inferencia en CPU, incluidos equipos tipo Raspberry Pi, con latencias altas.
- Opciones de despliegue: Transformers (ruta documentada), Text Generation Inference (el repositorio incluye la etiqueta text-generation-inference) y vLLM (soporta la arquitectura GPT-2). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| ppt-wc-zipf-newlex-66-eng-100mb_seed99 | 86,5 M | No disponible | No disponible (base en inglés) | No disponible | No disponible |
| goldfish-models/eng_latn_100mb (base) | 86,5 M | No disponible | Inglés (eng_latn) | No disponible en la informacion proporcionada | No disponible |
| GPT-2 small | 124 M | 1024 tokens | Inglés | MIT modificada, segun la publicacion original de OpenAI | No disponible en la informacion proporcionada |
| DistilGPT-2 | 82 M | 1024 tokens | Inglés | Apache-2.0 | No disponible en la informacion proporcionada |

La comparación se limita a tamano, contexto y licencia: no existe ningun resultado de evaluacion publicado para este ajuste, por lo que no es posible establecer una comparacion de calidad frente a las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: la model card solo contiene "licence: license", sin texto legal. No puede asumirse uso comercial ni redistribución; en la práctica, el modelo queda en un limbo jurídico hasta que el autor lo aclare.
- Capacidad lingüística y de conocimiento muy limitada: el modelo base se entrenó con unos 100 MB de texto en inglés, muy por debajo de los corpus habituales, lo que implica vocabulario reducido, conocimiento factual escaso y alta probabilidad de incoherencia y repetición.
- Riesgo elevado de alucinación: al no disponer de conocimiento factual verificable, cualquier afirmación del modelo sobre hechos, fechas o cifras debe considerarse no fiable.
- Idiomas no declarados: el modelo base es monolingüe (eng_latn). No hay evidencia de comportamiento correcto en castellano ni en ningún otro idioma distinto del inglés.
- Longitud de contexto desconocida: no se especifica la ventana de contexto. Si sigue el patrón habitual de la familia GPT-2, sería de 1024 tokens, pero es una suposición no confirmada.
- Sin evaluación ni validación por la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks ni métricas publicadas. No hay señal externa de calidad.
- Composición del dataset de SFT no documentada: se desconoce el origen, el filtrado y la licencia del corpus de ajuste, por lo que no pueden auditarse sesgos ni riesgos de contaminación.
- Advertencia de producción: no se recomienda su uso en aplicaciones orientadas a usuarios finales, atención al cliente, generación de código o cualquier tarea donde un error tenga consecuencias. Su ámbito razonable es la investigación y la docencia.
- Trazabilidad dependiente de W&B: los únicos detalles de entrenamiento están en el run externo 33sttfoe; si ese enlace deja de estar disponible, el ajuste queda sin documentación de hiperparámetros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed99
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/33sttfoe
- Repositorio de TRL: https://github.com/huggingface/trl
- Resultados de la busqueda web: no se encontraron enlaces relevantes sobre este modelo; las consultas devolvieron unicamente paginas informativas del sitio de Nasdaq sin relacion con el modelo.
