# mradermacher/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored es un modelo de lenguaje conversacional multimodal (texto e imagen) de tipo transformer con arquitectura de mezcla de expertos (MoE) y una innovacion estructural denominada "looped transformer", segun las etiquetas de su model card. El modelo base fue desarrollado por OpenUncensored y posteriormente cuantizado a formato GGUF por mradermacher. Con 26.070.385.152 parametros totales (segun los safetensors del repo base), se posiciona en la gama de modelos de aproximadamente 26.000 millones de parametros, un tamano que en configuracion MoE permite activar solo una fraccion de los expertos por token y reducir el coste de inferencia.

La caracteristica diferencial del modelo es su naturaleza "uncensored"/"abliterated": se ha aplicado una tecnica de abliteration o eliminacion de rechazos (refusal removal) sobre el modelo original, de modo que el modelo tiende a no negarse a responder a peticiones que un modelo alineado convencional rechazaria. Esto lo hace relevante para investigadores que estudian el comportamiento de modelos sin alineacion de seguridad, para tareas de generacion creativa sin restricciones y para analisis de sesgos y de mecanismos de refusal.

El repositorio aqui descrito es una coleccion de cuantizaciones estaticas en GGUF del modelo original, publicada el 25 de noviembre de 2026, con licencia Apache 2.0 y soporte exclusivo del idioma ingles. Su interes practico es permitir ejecutar un modelo de 26.000 millones de parametros en hardware de consumo mediante cuantizaciones de 2 a 8 bits, e incluye un proyector multimodal (mmproj) para el procesamiento de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y "looped transformer" (segun etiquetas) |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16; proyectores mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

La model card etiqueta el modelo como "moe" y "looped-transformer", lo que sugiere una arquitectura de mezcla de expertos en la que el bloque transformer se reutiliza en varios bucles (looping) para aumentar la profundidad efectiva sin incrementar proporcionalmente el numero de parametros. Las etiquetas "nvfp4" y "mxfp8" apuntan a formatos de precision reducida (FP4 y FP8 con escalado por bloque) empleados probablemente en el entrenamiento o en las versiones nativas del modelo base. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o fine-tuning supervisado.

La intervencion clave sobre el modelo base es la abliteration: una modificacion de los pesos orientada a eliminar la direccion de activacion asociada al comportamiento de rechazo, de modo que el modelo deja de producir respuestas de negativa ante ciertas peticiones. Esta tecnica se aplica tipicamente sobre los pesos de atencion y MLP y no requiere reentrenamiento completo. El repositorio de mradermacher es una cuantizacion estatica del modelo ya abliterado; no se han publicado cuantizaciones ponderadas ni con imatrix en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Procesamiento de imagenes mediante el proyector multimodal mmproj incluido en el repo (Q8_0 y f16).
- Comportamiento "uncensored": ausencia de rechazos ante peticiones que un modelo alineado bloquearia, gracias a la abliteration.
- Razonamiento y generacion de codigo como capacidades esperables de un modelo de 26.000 millones de parametros, si bien no se documentan explicitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y refusal: el modelo permite estudiar como se comporta una red de 26.000 millones de parametros tras eliminar la direccion de rechazo, comparando sus respuestas con las del modelo original alineado.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin las negativas tipicas de los modelos alineados, ejecutable localmente con cuantizacion Q4_K_S (16,2 GB).
- Analisis de sesgos y seguridad: uso como sujeto de prueba para evaluar la propagacion de sesgos y contenido problematico cuando se desactiva la alineacion, en entornos de investigacion controlados.
- Procesamiento de documentos con imagenes: gracias al proyector mmproj, el modelo puede describir o extraer informacion de capturas, diagramas o figuras en flujos de trabajo locales.
- Despliegue en hardware de consumo: las cuantizaciones Q2_K (11,0 GB) y Q4_K_S (16,2 GB) permiten ejecutar el modelo en GPUs de gama alta de consumo o en configuraciones con RAM unificada, sin necesidad de infraestructura de centro de datos.
- Prototipado de asistentes conversacionales en ingles: integracion en aplicaciones de chat local mediante llama.cpp u Ollama, con la ventaja de que el modelo no aplica filtros de rechazo que interrumpan la conversacion.
- Experimentacion con arquitecturas MoE y looped transformer: el modelo sirve como banco de pruebas para medir el rendimiento de este diseno estructural en tareas de inferencia real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB con Q2_K, 16 GB con Q4_K_S, y en torno a 26-28 GB con Q8_0 o f16 (estimacion a partir del tamano de los ficheros publicados).
- El proyector multimodal anade 0,4 GB (Q8_0) o 0,7 GB (f16) cuando se procesan imagenes.
- GPU recomendadas: para Q4_K_S, una RTX 4090 (24 GB) o RTX 3090; para Q2_K, una RTX 4080 (16 GB) o superior; para Q8_0/f16 se requiere A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K a Q4_K_S con GPUs de 16-24 GB de VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con la API de endpoints indicados en las etiquetas; vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (este) | 26,07 B (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Abliterated, multimodal, solo ingles |
| Modelo base OpenUncensored/Inkling-2-Mini-Uncensored | 26,07 B (MoE) | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo modelo |
| Alternativas de ~26 B abliterated | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de comparacion en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- La abliteration elimina los rechazos, pero no garantiza la veracidad ni la seguridad del contenido generado; el modelo puede producir respuestas daninas, ilegales o inexactas sin advertencia.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones bajas (Q2_K) y en tareas de razonamiento factual.
- Sesgos conocidos: no documentados en la model card, pero esperables en un modelo entrenado predominantemente con datos en ingles y sin fases de alineacion documentadas.
- Limitacion idiomatica: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento normativo del contenido generado; el usuario asume la responsabilidad legal.
- Las cuantizaciones estaticas (sin imatrix) pueden degradar la perplejidad mas que las ponderadas, especialmente por debajo de Q4.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del funcionamiento de las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Inkling-2-Mini-Uncensored-GGUF
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
