# omnimem/long_rolling_plain_from_cd

## Resumen

`omnimem/long_rolling_plain_from_cd` es un checkpoint de generacion de video texto-a-video (t2v) publicado por el usuario `omnimem` en HuggingFace. No se trata de un modelo de lenguaje, sino de un generador de video de difusion con arquitectura causal, construido sobre la familia Wan2.1 y entrenado especificamente para generar clips largos y continuos a partir de un unico prompt fijo. El checkpoint liberado corresponde a los pesos EMA del paso de entrenamiento 1200, con una linea de inicializacion documentada: CD paso 4500 EMA, despues self-forcing ordinario paso 600 EMA, y finalmente entrenamiento "rolling" plano.

El modelo tiene 1.420.656.760 parametros almacenados en FP32 (unos 5,7 GB de pesos), una cifra coherente con la variante compacta de la familia Wan, aunque la model card no confirma explicitamente esa correspondencia. La innovacion principal es doble: por un lado, la generacion "rolling" o autoregresiva por bloques de fotogramas con una ventana de cache KV acotada, lo que permite extender la duracion sin crecer linealmente en memoria; por otro, el uso de atencion dispersa NSA con seleccion de los 12 bloques mas relevantes, implementada en la clase `CausalWanNSAModel`.

El interes practico del checkpoint es de investigacion y prototipado: permite reproducir generacion de video largo (60 segundos, 960 fotogramas exportados a 16 FPS) con solo 4 pasos de muestreo y escala de guiado 1, lo que situa la generacion en un regimen de muy baja latencia por fotograma. Su adopcion en produccion es hoy limitada, porque exige componentes externos (VAE de Wan2.1, codificador de texto UMT5 y tokenizer), no tiene licencia declarada y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion causal para video, derivado de Wan2.1, con atencion dispersa NSA (seleccion de los 12 bloques superiores) |
| Parametros totales | 1.420.656.760 (medido sobre los safetensors publicados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en tokens. En el dominio temporal: ventana de historial KV de 3 bloques de fotogramas, cache KV con LRU de maximo 7, tamano de bloque de fotogramas 3 |
| Tipos de cuantizacion | No disponible. Los pesos se publican en FP32; no se distribuyen variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible. El codificador de texto requerido (UMT5) es multilingue en origen, pero la model card no documenta idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (dos shards mas indice), mas `config.json` y `SHA256SUMS` |
| Tamano del repositorio | 5,7 GB |
| Pipeline declarado | text-to-video |
| Libreria | diffusers |
| Fecha de creacion (metadatos) | 2026-10-11 |

## Arquitectura y entrenamiento

El modelo es un generador de video de difusion con formulacion causal, es decir, genera el video de forma autoregresiva por bloques de fotogramas en lugar de denoizar todo el clip de una vez. La clase de transformer es `CausalWanNSAModel` y la pipeline asociada es `CausalWanT2VPipeline`. La atencion utiliza un esquema NSA con seleccion top-12 de bloques, lo que reduce el coste cuadratico de la atencion sobre el historial de fotogramas y hace viable mantener una cache KV acotada (ventana de 3 bloques, LRU maximo de 7) durante secuencias de 60 segundos. Los pesos se conservan en FP32 sin cambios respecto al entrenamiento original, y el `config.json` mantiene la configuracion original, incluido el nombre de clase guardado (que registra el wrapper de entrenamiento) y `_name_or_path` (que registra el origen de la inicializacion).

Sobre el entrenamiento, la model card documenta la linea de inicializacion pero no el volumen de datos ni la composicion del dataset. La secuencia es: un checkpoint CD en el paso 4500 (EMA), seguido de un entrenamiento de self-forcing ordinario hasta el paso 600 (EMA), y finalmente un entrenamiento "rolling" plano que produce el checkpoint publicado, correspondiente al paso 1200 en version EMA. No se menciona RLHF, DPO ni ningun tipo de ajuste por preferencias, algo coherente con un modelo de difusion. Tampoco se detalla el numero de tokens de video, la resolucion de entrenamiento ni la mezcla de datos; solo se describen los ajustes empleados en la evaluacion durante el entrenamiento (prompt fijo, 832 × 480, 60 segundos, 16 FPS, 4 pasos de muestreo, guidance scale 1, timestep shift 5, semilla 42, cinco prompts estaticos de longitud completa).

## Capacidades

- Generacion de video texto-a-video: produce clips a partir de una descripcion textual, con resolucion de evaluacion de 832 × 480 y 16 FPS.
- Generacion de video largo con prompt fijo: la configuracion de evaluacion genera 969 fotogramas y exporta 960 (se recorta la cola), equivalentes a 60 segundos de metraje continuo sin cambiar de prompt.
- Generacion autoregresiva por bloques: procesa el video en bloques de 3 fotogramas con una cache KV gestionada por LRU, lo que permite streams de duracion extendida con memoria acotada.
- Muestreo de muy pocos pasos: los ajustes documentados usan 4 pasos de muestreo con guidance scale 1, lo que reduce el coste de inferencia por fotograma frente a esquemas de 20-50 pasos.
- Atencion dispersa eficiente: la seleccion NSA top-12 de bloques limita el coste de atencion sobre el historial temporal.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Uso como agente o razonamiento multi-paso: no aplica.
- Entrada de imagen o video (image-to-video, video-to-video): no documentado; la pipeline declarada es exclusivamente text-to-video.
- Audio: no soportado.
- Capacidades multilingues: no documentadas. El prompt se procesa con un codificador UMT5 externo, pero la model card no especifica idiomas ni calidad por idioma.

## Casos de uso

- Investigacion en difusion causal y self-forcing: el checkpoint es un punto de partida reproducible (paso 1200 EMA, con linaje documentado) para estudiar como afecta la inicializacion al entrenamiento rolling y a la estabilidad temporal en clips largos. Resulta adecuado porque la model card detalla la procedencia exacta de los pesos y permite comparar contra los checkpoints intermedios de la cadena CD y self-forcing.
- Generacion de B-roll y metraje de stock sintetico: con 60 segundos por inferencia a 832 × 480 y un prompt fijo, se pueden producir planos continuos de ambiente (paisajes, interiores, texturas en movimiento) para bancos de video, evitando el corte visible que aparece al encadenar clips cortos generados por separado.
- Fondos animados para signage digital y pantallas de ambiente: un plano continuo de un minuto en bucle es suficiente para pantallas de recepcion, escaparates o eventos, y el coste de generacion es bajo gracias a los 4 pasos de muestreo.
- Previsualizacion de animaticos y storyboards: permite validar ritmo y duracion de una secuencia de 60 segundos antes de pasar a produccion 3D o rodaje real, con la ventaja de que la coherencia temporal se mantiene durante todo el plano al ser generacion autoregresiva.
- Generacion de datos sinteticos de video para entrenar o evaluar otros modelos: clips largos y controlados por prompt sirven como corpus de prueba para modelos de deteccion de objetos, seguimiento temporal o estimacion de flujo optico en escenarios concretos.
- Contenido para e-learning y formacion corporativa: planos continuos de procesos, entornos o demostraciones visuales que se insertan en modulos formativos, donde la duracion de un minuto cubre una seccion completa sin transiciones artificiales.
- Prototipado y optimizacion de pipelines de inferencia: el modelo exige gestionar cache KV con LRU, bloques de fotogramas y decodificacion VAE por trozos (chunk size 3), por lo que es un banco de pruebas realista para trabajar en estrategias de offload, cuantizacion y planificacion de memoria en despliegues de video generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, CLIP score, VBench ni similares) ni comparaciones numericas con otros generadores de video. Los unicos datos de rendimiento disponibles son los ajustes de evaluacion durante el entrenamiento, que se reproducen a continuacion por su valor para replicar la generacion:

| Ajuste de evaluacion | Valor |
|---|---|
| Modo de prompt | Prompt fijo durante todo el video |
| Resolucion | 832 × 480 |
| Duracion | 60 segundos |
| Cadencia | 16 FPS |
| Fotogramas exportados | 960 (969 generados, cola recortada) |
| Pasos de muestreo | 4 |
| Guidance scale | 1 |
| Timestep shift | 5 |
| Semilla | 42 |
| Tamano de bloque de fotogramas | 3 |
| Ventana de historial KV | 3 |
| Maximo de LRU de cache KV | 7 |
| Tamano de trozo de decodificacion VAE | 3 |

No hay datos de latencia, throughput ni consumo de memoria medidos.

## Requisitos de hardware

- Pesos del generador: 1.420.656.760 parametros en FP32, aproximadamente 5,7 GB. Si se convierten a bf16/fp16, la huella baja a unos 2,9 GB (estimacion).
- Componentes externos obligatorios: VAE de Wan2.1, codificador de texto UMT5 y tokenizer, que deben cargarse por separado. La model card no especifica que variante de UMT5 se usa, por lo que su huella de memoria no esta cuantificada; si se emplea el encoder completo en FP16, el coste puede dominar el total del sistema.
- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa, un despliegue en bf16 con el generador, el VAE y el codificador de texto en memoria requiere del orden de 16-24 GB, segun la variante de UMT5 y el offload aplicado. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: para FP32 sin conversiones y con todos los componentes residentes, una GPU de 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100). Para bf16 con offload del codificador de texto, 16 GB pueden ser suficientes (estimacion).
- GPUs de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) con holgura si se convierte a bf16. En tarjetas de 12 GB (RTX 3060, RTX 4070) solo seria viable con cuantizacion propia y offload secuencial, ya que no se publican pesos cuantizados.
- Opciones de despliegue: el modelo se carga con codigo de OmniMem (`CausalWanNSAModel.from_pretrained`, `CausalWanT2VPipeline`), no como pipeline estandar de diffusers, por lo que requiere el repositorio del autor. vLLM y TGI no aplican, al no tratarse de un modelo de lenguaje. Alternativas a considerar: `torch.compile`, kernels de atencion eficiente, offload secuencial de modulos a CPU y decodificacion VAE por trozos.
- Latencia y throughput: no disponibles. El unico indicio es que la generacion se realiza con 4 pasos de muestreo, lo que reduce el numero de evaluaciones del transformer por fotograma, pero sin datos de tiempo por fotograma no puede estimarse.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos comparables, y la busqueda web realizada no devolvio resultados tecnicos relacionados con este modelo. La comparativa se limita, por tanto, a categorias de referencia; los campos que no pueden verificarse se marcan como no disponibles.

| Modelo | Parametros | Duracion tipica | Licencia | Disponibilidad |
|---|---|---|---|---|
| omnimem/long_rolling_plain_from_cd | 1,42 B (FP32) | 60 s a 16 FPS | no disponible | HuggingFace, requiere codigo propio de OmniMem |
| Wan2.1 T2V (variante compacta) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| Otros generadores t2v de escala similar | no disponible | no disponible | no disponible | no disponible |

Como referencia cualitativa, los competidores directos de este checkpoint serian los generadores t2v abiertos de rango 1-2 B de parametros, que priorizan baja latencia y ejecucion en GPU de consumo, frente a los modelos de 10 B o mas que priorizan fidelidad visual. La diferencia funcional del checkpoint de OmniMem no es el tamano, sino el regimen de generacion: video largo con prompt fijo, muestreo de 4 pasos y atencion dispersa con cache KV acotada, una combinacion poco habitual en los generadores t2v convencionales, que suelen limitarse a clips de pocos segundos.

## Limitaciones y advertencias

- Licencia no declarada. Sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion ni obras derivadas; en la practica esto bloquea su adopcion en produccion hasta que el autor la aclare.
- Sin resultados de benchmarks ni evaluaciones de calidad publicadas. No hay evidencia cuantitativa sobre fidelidad al prompt, coherencia temporal o calidad visual mas alla de los ajustes de evaluacion descritos.
- Sesgos: no documentados. Al no especificarse la composicion del dataset de entrenamiento, no puede evaluarse el sesgo demografico, cultural o geografico del modelo.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir artefactos, deformaciones anatomicas, fisicas incoherentes y deriva semantica a lo largo de los 60 segundos, especialmente porque el prompt permanece fijo y no hay control por segmentos.
- Limitacion de idioma: la model card no documenta idiomas soportados. El rendimiento con prompts en castellano no esta verificado.
- Dependencia de codigo externo: requiere el repositorio de OmniMem para cargar las clases `CausalWanNSAModel` y `CausalWanT2VPipeline`, ademas del VAE de Wan2.1, el codificador UMT5 y el tokenizer. No es un pipeline autocontenido de diffusers.
- Pesos en FP32 sin variantes cuantizadas: el despliegue en GPU de gama media exige cuantizar el modelo por cuenta propia, con el riesgo de degradacion de calidad que ello implica.
- Checkpoint intermedio de entrenamiento: se trata de los pesos EMA del paso 1200 de un entrenamiento en curso, no de un modelo final consolidado. La model card lo presenta explicitamente como un hito dentro de un linaje de entrenamiento.
- Metadatos atipicos: las fechas de creacion y actualizacion registradas (2026-10-11) son posteriores a la fecha de consulta habitual y el repositorio tiene 0 descargas y 0 likes, senales de que se trata de una publicacion muy reciente y sin validacion por parte de la comunidad.
- Resolucion fija de referencia: los ajustes documentados corresponden a 832 × 480. No se indica si el modelo generaliza a otras resoluciones o relaciones de aspecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omnimem/long_rolling_plain_from_cd
- Repositorio de codigo de OmniMem (necesario para cargar `CausalWanNSAModel` y `CausalWanT2VPipeline`): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible
- Demo o Space: no disponible
- Busqueda web: no se han encontrado enlaces tecnicos relevantes. Los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo y se han descartado por no ser una fuente util ni fiable para esta ficha.
