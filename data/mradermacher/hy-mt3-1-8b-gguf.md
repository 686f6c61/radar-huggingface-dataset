# mradermacher/Hy-MT3-1.8B-GGUF

## Resumen

Hy-MT3-1.8B-GGUF es la distribucion en formato GGUF del modelo de traduccion automatica Hy-MT3-1.8B desarrollado por Tencent. Se trata de un modelo especializado en traduccion neuronal multilingue con 1.791.080.448 parametros (aproximadamente 1,8 mil millones), pensado para cubrir un abanico muy amplio de pares de idiomas, incluyendo combinaciones de bajos recursos como camboyano, birmano, tibetano, cantonés, uigur o cebuano. La version GGUF la publica mradermacher, un conocido cuantizador de la comunidad que distribuye pesos optimizados para inferencia local con llama.cpp y herramientas compatibles.

El modelo base es propiedad de Tencent y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las habituales de atribucion. La relevancia de esta ficha radica en que la version GGUF democratiza el acceso a un traductor multilingue de cobertura extensa en hardware de consumo: el cuantizado Q4_K_M ocupa aproximadamente 1,2 GB, por lo que puede ejecutarse en cualquier GPU consumer moderna o incluso en CPU con un rendimiento aceptable para tareas de traduccion por lotes.

La informacion disponible sobre el modelo base es limitada: la model card del repositorio GGUF es una plantilla estandar de mradermacher que no detalla arquitectura, datos de entrenamiento ni resultados de benchmarks. Por tanto, varios apartados de esta ficha indican explicitamente "no disponible" alli donde no hay datos verificables, en lugar de inferir o inventar cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de traduccion, segun el pipeline declarado) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (no es MoE, segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (tambien disponibles cuantizados con imatrix en el repo i1-GGUF) |
| Idiomas soportados | 100 idiomas declarados en la model card, entre ellos zh, en, es, de, fr, it, pt, ru, ar, hi, ja, ko, vi, th, tr, nl, pl, uk, fa, ur, he, bn, ta, te, mr, gu, km, my, bo, yue, kk, ug, el, cy, si, ro, ca, pa, hu, gl, sd, bg, eu, as, sr, af, or, hr, lb, kn, sk, mt, ml, sl, eo, sa, sq, yi, lo, mk, hy, jv, be, ka, su, lt, az, ceb, lv, uz, war, et, ky, sw, fi, tk, am, sv, tg, so, da, tt, mg, nb, ba, ht, nn, ku, is, ckb, ga, ps, gd, ne |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base original en safetensors/transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base tencent/Hy-MT3-1.8B en la documentacion proporcionada. Por el pipeline declarado (translation) y el tamano (1,8 mil millones de parametros), se trata de un modelo transformer encoder-decoder o decoder-only especializado en traduccion, pero la model card del repositorio GGUF no especifica la configuracion exacta de capas, dimensiones ocultas ni mecanismos de atencion.

Tampoco hay datos publicados en la informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO, ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La unica informacion tecnica verificable es la lista de 100 idiomas soportados y el hecho de que el modelo se distribuye en formato transformers y ha sido cuantizado a GGUF por mradermacher mediante su pipeline estandar (convert_type hf, quantize_version 2, output_tensor_quantised 1). Para obtener detalles de arquitectura y entrenamiento seria necesario consultar la model card del modelo base en Tencent, que no forma parte de la informacion proporcionada.

## Capacidades

- Traduccion automatica multilingue entre 100 idiomas, incluyendo pares de bajos recursos (camboyano, birmano, tibetano, cantonés, uigur, cebuano, etc.).
- Traduccion bidireccional: la lista de idiomas incluye tanto lenguas de origen como de destino, lo que permite combinaciones como espanol-camboyano o tibetano-ingles.
- Generacion de texto condicionada a tarea de traduccion (pipeline translation).
- Uso conversacional: el repositorio incluye la etiqueta "conversational", lo que sugiere soporte de formato de chat para interacciones de traduccion.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Traduccion de documentacion tecnica multilingue: el modelo puede traducir manuales y guias entre pares como ingles-espanol, aleman-japones o frances-camboyano, aprovechando su cobertura de 100 idiomas para mantener un unico modelo en produccion en lugar de varios traductores especializados por par.
- Localizacion de productos de software: integrado en un pipeline de CI/CD, el modelo traduce cadenas de interfaz y ficheros de recursos a decenas de idiomas; el cuantizado Q4_K_M de 1,2 GB permite ejecutarlo en un contenedor ligero junto al resto del pipeline sin necesidad de GPU dedicada.
- Atencion al cliente multilingue: el modelo puede traducir mensajes entrantes de usuarios en idiomas minoritarios (bengali, urdu, tamil, cebuano) al idioma del agente y viceversa, reduciendo la dependencia de servicios de traduccion externos y de la latencia de red.
- Traduccion de contenido periodistico y editorial: con el cuantizado Q6_K o Q8_0 se obtiene calidad cercana a la del modelo original para traducir articulos completos, y el formato GGUF permite ejecutarlo en un servidor con una unica GPU consumer.
- Investigacion en traduccion automatica de bajos recursos: al ser Apache 2.0 y estar disponible en GGUF, sirve como linea base reproducible para experimentos con pares de idiomas poco representados (tibetano, uigur, birmano) sin necesidad de infraestructura de gran escala.
- Procesamiento por lotes en CPU: el cuantizado Q2_K (0,9 GB) o Q3_K_S (1,0 GB) permite ejecutar traducciones masivas en servidores sin GPU, con un throughput menor pero suficiente para tareas asincronas como la traduccion de archivos historicos o la normalizacion de datasets.
- Traduccion en el borde (edge): el tamano reducido de los cuantizados Q4 permite desplegar el modelo en dispositivos con 2-4 GB de RAM, habilitando traduccion offline en aplicaciones moviles o embebidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de calidad (BLEU, COMET, chrF) ni comparaciones con otros modelos de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~0,9 GB; Q3_K_S ~1,0 GB; Q4_K_S/Q4_K_M ~1,2 GB; Q5_K_M ~1,4 GB; Q6_K ~1,6 GB; Q8_0 ~2,0 GB; f16 ~3,7 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para los cuantizados Q4-Q5 (GTX 1650, RTX 3050, RTX 4060, etc.); para f16 se recomienda al menos 6 GB. En entornos de servidor, A100, H100 o L40S ofrecen margen de sobra y permiten alta concurrencia.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM para cuantizados Q4/Q5; incluso en CPU con 2 GB de RAM para Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers, vLLM o TGI (aunque la informacion proporcionada no confirma compatibilidad explicita con vLLM).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de 1,8 mil millones de parametros en Q4_K_M sobre una RTX 4090 deberia ofrecer decenas de tokens por segundo, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-1.8B (este) | 1,79 B | no disponible | 100 | Apache 2.0 | GGUF, safetensors |
| NLLB-200-distilled-600M | 0,6 B | no disponible | 200 | CC-BY-NC 4.0 | safetensors, GGUF |
| M2M-100 418M | 0,42 B | no disponible | 100 | MIT | safetensors |
| Opus-MT (Helsinki-NLP) | variable (por par) | no disponible | pares bilingues | CC-BY 4.0 | safetensors, GGUF |

La comparativa se limita a datos estructurales porque no hay benchmarks publicados en la informacion disponible. Frente a NLLB-200, Hy-MT3-1.8B ofrece licencia Apache 2.0 (permite uso comercial, a diferencia de CC-BY-NC) y mayor numero de parametros, aunque NLLB cubre 200 idiomas frente a 100. Frente a M2M-100, Hy-MT3-1.8B tiene mas parametros y licencia igualmente permisiva. Frente a los modelos Opus-MT, la ventaja es tener un unico modelo multilingue en lugar de un modelo por par de idiomas.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo base; al ser un traductor multilingue, es probable que herede sesgos de genero, culturales y dialectales de sus datos de entrenamiento, pero no hay documentacion que lo confirme.
- Riesgo de alucinacion: en tareas de traduccion, el riesgo se manifiesta como omisiones, adiciones o traducciones libres en pasajes ambiguos o de baja frecuencia; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion disponible, por lo que no se puede garantizar el comportamiento en documentos largos.
- Cobertura desigual entre idiomas: aunque se declaran 100 idiomas, la calidad en pares de bajos recursos (tibetano, uigur, birmano, cebuano) probablemente sea inferior a la de pares mayoritarios; no hay metricas que lo confirmen.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no hay restricciones adicionales documentadas.
- Los cuantizados Q2_K y Q3_K_M degradan la calidad de forma notable segun las notas del propio autor ("lower quality" para Q3_K_M); para produccion se recomienda Q4_K_M o superior.
- La model card del repositorio GGUF es una plantilla generica del cuantizador y no sustituye a la documentacion del modelo base; para decisiones de produccion conviene consultar la model card de tencent/Hy-MT3-1.8B.
- El repositorio tiene 607 descargas y 0 likes en el momento de la consulta, lo que indica adopcion limitada y poca validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hy-MT3-1.8B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Cuantizados con imatrix: https://huggingface.co/mradermacher/Hy-MT3-1.8B-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Hy-MT3-1.8B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizados (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
