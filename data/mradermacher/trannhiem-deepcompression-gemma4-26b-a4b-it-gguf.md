# mradermacher/TranNhiem-DeepCompression-Gemma4-26B-A4B-it-GGUF

## Resumen

TranNhiem-DeepCompression-Gemma4-26B-A4B-it-GGUF es la version cuantizada en formato GGUF del modelo TranNhiem-DeepCompression-Gemma4-26B-A4B-it, publicado por el usuario mradermacher. Se trata de una compresion del modelo Gemma 4 de Google en su variante 26B-A4B (arquitectura Mixture of Experts con aproximadamente 4 mil millones de parametros activos), al que se le ha aplicado una tecnica de poda de expertos y cuantizacion NVFP4 mediante ModelOpt. El resultado es un modelo vision-lenguaje con 23.805.109.886 parametros totales declarados en safetensors.

El modelo resuelve el problema de desplegar un VLM MoE de gran tamano en hardware mas modesto: la combinacion de poda de expertos, cuantizacion NVFP4 del modelo original y la conversion posterior a GGUF permite ejecutar el modelo con llama.cpp u Ollama en GPUs de consumo, algo impracticable con los pesos originales. Es relevante ahora porque la familia Gemma 4 introduce capacidades multimodales y MoE en el ecosistema abierto de Google, y este trabajo demuestra que es posible comprimirla manteniendo la licencia Apache 2.0.

La ficha cubre exclusivamente la version GGUF distribuida por mradermacher; los detalles de entrenamiento, dataset y evaluacion del modelo original no estan disponibles en la informacion proporcionada y se marcan como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, vision-lenguaje, derivada de Gemma 4 26B-A4B; expert pruning + cuantizacion NVFP4 (ModelOpt) |
| Parametros totales | 23.805.109.886 (23,8 B) |
| Parametros activos | Aproximadamente 4 B (sufijo A4B del nombre); no se detalla el reparto exacto |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, x-f16; ademas mmproj-Q8_0 y mmproj-f16 para la parte multimodal |
| Idiomas soportados | en (segun tags del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); repo de 26,6 GB |

## Arquitectura y entrenamiento

El modelo base es una variante de Gemma 4 con arquitectura Mixture of Experts de tipo 26B-A4B, es decir, 26 mil millones de parametros totales con aproximadamente 4 mil millones activos por token. Sobre esa base, el autor original (trannhiem) aplico una pipeline de compresion que combina poda de expertos (expert pruning) con cuantizacion NVFP4 mediante NVIDIA ModelOpt, orientada a despliegue eficiente en vLLM. El resultado conserva la naturaleza vision-lenguaje del modelo original, con un proyector multimodal que en la version GGUF se distribuye como fichero mmproj separado.

mradermacher ha realizado unicamente la conversion estatica a GGUF de esos pesos comprimidos, sin cuantizaciones ponderadas ni imatrix (el propio autor indica que no estan disponibles en el momento de publicacion). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se detalla la innovacion concreta de la poda de expertos (criterio de seleccion, porcentaje de expertos eliminados) mas alla de la etiqueta `expert-pruning`.

## Capacidades

- Generacion de texto conversacional multirrol, heredada de la familia Gemma 4.
- Procesamiento vision-lenguaje: el repo incluye ficheros `mmproj` (Q8_0 y f16) que habilitan la entrada de imagenes junto con texto.
- Razonamiento y respuesta a instrucciones en formato conversacional (tag `conversational`).
- Soporte de arquitectura MoE con activacion dispersa, lo que reduce el coste computacional por token frente a un denso de 23,8 B.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con vLLM en el modelo base.
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio.
- No se documentan en la informacion disponible capacidades especificas de tool calling, agentes o modo thinking.

## Casos de uso

- Despliegue local de un VLM MoE en GPU de consumo: con la cuantizacion Q4_K_S (14,7 GB) el modelo cabe en GPUs con 16-24 GB de VRAM, permitiendo inferencia multimodal local sin depender de APIs.
- Analisis de documentos e imagenes en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp u Ollama, los datos no salen del equipo, lo que encaja en sectores regulados.
- Prototipado rapido de aplicaciones vision-lenguaje: la disponibilidad de multiples cuantizaciones (desde Q2_K de 10,1 GB hasta Q8_0) permite ajustar el equilibrio calidad/memoria segun el prototipo.
- Evaluacion comparativa de tecnicas de compresion: util para investigadores que quieran medir el impacto de la poda de expertos y NVFP4 frente al Gemma 4 original en tareas de vision y texto.
- Backend de asistentes conversacionales con contexto visual: integrable en pipelines que reciban capturas o imagenes y requieran descripcion o extraccion de informacion en ingles.
- Experimentacion con arquitecturas MoE en produccion ligera: el modelo permite estudiar el comportamiento de un MoE de ~4 B activos en cargas reales sin infraestructura de centro de datos.
- Fine-tuning o evaluacion sobre casos de uso en ingles: al ser Apache 2.0, se puede adaptar y redistribuir sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF mas overhead de contexto y KV cache):
  - Q2_K: ~10,1 GB de pesos, en torno a 11-12 GB de VRAM con contexto moderado.
  - Q4_K_S: ~14,7 GB de pesos, en torno a 16-18 GB de VRAM; recomendado por el autor como rapido.
  - Q8_0 y superiores: no se especifica el tamano exacto en la informacion disponible, pero seran considerablemente mayores.
  - La parte multimodal anade 0,9 GB (mmproj-Q8_0) o 1,3 GB (mmproj-f16).
- GPU recomendadas: no disponibles de forma explicita. Por tamano, Q4_K_S encaja en RTX 4090 (24 GB) y GPUs profesionales tipo A100/H100 con holgura; Q2_K podria caber en GPUs de 12-16 GB.
- Cabe en GPU de consumo: si, al menos en las cuantizaciones Q2_K y Q4_K_S en tarjetas de 16-24 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y en el modelo base vLLM (tag `vllm`); el modelo base usa transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TranNhiem-DeepCompression-Gemma4-26B-A4B-it-GGUF (este) | 23,8 B totales / ~4 B activos | no disponible | Apache 2.0 | GGUF | VLM MoE comprimido con poda de expertos y NVFP4 |
| trannhiem/TranNhiem-DeepCompression-Gemma4-26B-A4B-it (base) | 23,8 B totales / ~4 B activos | no disponible | Apache 2.0 | safetensors | Pesos originales comprimidos, orientado a vLLM |
| Gemma 4 26B-A4B-it (original de Google) | ~26 B totales / ~4 B activos | no disponible | Apache 2.0 (segun familia Gemma 4) | safetensors | Referencia sin compresion; no se dispone de datos adicionales en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La poda de expertos puede degradar la calidad frente al Gemma 4 original en dominios poco representados; no se han publicado evaluaciones que cuantifiquen esa perdida.
- La cuantizacion NVFP4 del modelo base y la posterior conversion a GGUF acumulan dos etapas de perdida de precision; las cuantizaciones Q2_K y Q3_K son especialmente agresivas.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones especificas publicadas para esta variante.
- No se dispone de informacion sobre sesgos del modelo original ni sobre su mitigacion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la familia Gemma 4 original por si hubiera terminos adicionales no reflejados en los metadatos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del funcionamiento de las cuantizaciones.
- No hay cuantizaciones ponderadas ni imatrix disponibles, lo que puede afectar a la calidad de las cuantizaciones bajas.
- El pipeline no esta declarado en los metadatos, lo que complica la integracion automatica con algunas herramientas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/TranNhiem-DeepCompression-Gemma4-26B-A4B-it-GGUF
- Modelo base: https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Gemma4-26B-A4B-it
- Pagina de resumen del autor de las cuantizaciones: https://hf.tst.eu/model#TranNhiem-DeepCompression-Gemma4-26B-A4B-it-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
