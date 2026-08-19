# SergiioB/Nemotron-3.5-Lightning-30B-A3B-GPTQ-INT4-G64-sym

## Resumen

Nemotron-3.5-Lightning-30B-A3B-GPTQ-INT4-G64-sym es una conversión local a cuantización GPTQ INT4 simétrica con grupo de tamaño 64 del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por el usuario SergiioB. No existe una versión GPTQ oficial de NVIDIA; este artefacto es una derivación construida específicamente para ejecutarse en hardware Intel Arc XPU, utilizando el kernel `XPUwNa16LinearKernel` y `XPUExpertsWNA16` dentro de vLLM. El modelo resultante mantiene la arquitectura original del modelo base, un transformer MoE con 128 expertos enrutados y un experto compartido, y conserva la geometría heterogénea de los tamaños intermedios (1856 y 3712).

El modelo está pensado para desarrolladores e investigadores que necesitan desplegar un modelo de razonamiento y chat de gran tamaño en GPUs Intel Arc Pro B70 (32 GB) u otros aceleradores XPU compatibles, aprovechando la cuantización INT4 para reducir el consumo de memoria y mejorar el rendimiento. La conversión excluye de la cuantización los embeddings, la capa de salida y las normalizaciones 1D, que se mantienen en BF16. El repositorio incluye un manifiesto de conversión con estadísticas de error por matriz y un cookbook con instrucciones detalladas de instalación, parches y lanzamiento.

La relevancia actual de este modelo radica en que ofrece una alternativa práctica para ejecutar un modelo de 30 mil millones de parámetros (con solo 3 mil millones activos por token gracias a su arquitectura MoE) en GPUs de gama media-alta de Intel, un segmento donde la compatibilidad de software y las cuantizaciones optimizadas son escasas. Las mediciones publicadas por el autor indican rendimientos de hasta 93 tokens por segundo en generación sin especulación y 186,61 tokens por segundo con decodificación especulativa DFlash, lo que lo convierte en una opción viable para aplicaciones de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (nemotron_h) con 128 expertos enrutados + 1 experto compartido, sin gating, tamaños intermedios heterogéneos (1856 / 3712) |
| Parametros totales | 31.577.940.288 (dato real de safetensors) |
| Parametros activos | Aproximadamente 3 mil millones (según nomenclatura A3B, no confirmado en la documentación) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ INT4 simétrico, grupo 64, `desc_act: false`; capas excluidas (embeddings, lm_head, normas 1D) en BF16 |
| Idiomas soportados | Ingles, lenguajes de codificacion, español, frances, aleman, italiano, japones (segun documentacion del modelo base NVIDIA) |
| Licencia | OpenMDW-1.1 (misma que el modelo fuente de NVIDIA) |
| Formato de pesos | Safetensors (GPTQ cuantizado) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, es un transformer de arquitectura MoE (mixture of experts) con 128 expertos enrutados y un experto compartido, sin mecanismo de gating explícito. Los tamaños intermedios de los expertos son heterogéneos (1856 y 3712), una característica que se conserva en la conversión GPTQ. Según la documentación de NVIDIA, el modelo fue preentrenado con más de 20 billones de tokens, e incluye una pequeña porción de datos de pregunta-respuesta y datos de alineación para mejorar la precisión. El post-entrenamiento se realizó con un corpus de alta calidad, curado y generado sintéticamente.

La conversión a GPTQ INT4 fue realizada localmente por SergiioB con los siguientes parámetros: cuantización simétrica (`sym: true`), grupo de tamaño 64, `desc_act: false`, rango con signo `[-8, 7]`, almacenamiento en nibble con offset +8 y orden low-first. Las capas excluidas de la cuantización (embeddings, `lm_head` y normalizaciones 1D) se mantienen en BF16. El manifiesto de conversión (`conversion-manifest.json`) incluye estadísticas de error por matriz. No se ha publicado información sobre el proceso de entrenamiento o ajuste adicional de esta versión cuantizada; es una conversión puramente de compresión.

## Capacidades

- Generacion de texto y chat conversacional: el modelo base es un modelo de razonamiento y chat de proposito general, adecuado para tareas de instruccion y dialogo multi-turno.
- Razonamiento y codigo: segun NVIDIA, esta disenado para tareas de razonamiento general y lenguajes de codificacion, con soporte para multiples lenguajes naturales adicionales.
- Soporte multilingue: ademas del ingles y lenguajes de programacion, soporta espanol, frances, aleman, italiano y japones.
- Compatibilidad con vLLM XPU: esta conversion esta optimizada para el motor vLLM en hardware Intel Arc, incluyendo kernels especializados para atencion y expertos.
- Decodificacion especulativa DFlash: el autor ha medido mejoras de rendimiento significativas al combinar este modelo con un draft companion (tambien publicado por el mismo autor), alcanzando hasta 1,81x de velocidad en generacion.
- No se ha confirmado soporte explicito de tool calling, function calling o capacidades de agente en la documentacion proporcionada; estas capacidades dependen del modelo base y no estan documentadas en esta conversion.

## Casos de uso

- Despliegue de chatbots y asistentes conversacionales en hardware Intel Arc: gracias a su cuantizacion INT4 y a las optimizaciones para XPU, este modelo puede ejecutarse en GPUs como la Arc Pro B70 de 32 GB, ofreciendo latencias de decodificacion de hasta 93 t/s sin especulacion y 186 t/s con DFlash, lo que lo hace util para aplicaciones interactivas en tiempo real.
- Sistemas de generacion de codigo asistida: el modelo base esta entrenado para lenguajes de programacion, por lo que esta conversion puede integrarse en entornos de desarrollo que requieran autocompletado o generacion de fragmentos de codigo, siempre que el hardware sea compatible con XPU.
- Motores de busqueda con generacion aumentada por recuperacion (RAG): al ser un modelo de chat con capacidad de razonamiento, puede utilizarse como componente de generacion en pipelines RAG, aprovechando su ventana de contexto (aunque la longitud exacta no esta documentada en esta conversion).
- Prototipado rapido en entornos con GPUs Intel: desarrolladores que trabajen con Intel Arc Pro B70 u otras GPUs XPU pueden usar este modelo como sustituto de modelos BF16 mas pesados, reduciendo los requisitos de memoria y acelerando la experimentacion.
- Investigacion sobre cuantizacion GPTQ en arquitecturas MoE: el manifiesto de conversion y las notas del autor proporcionan datos utiles para estudiar el impacto de la cuantizacion INT4 en modelos con expertos heterogeneos, especialmente en terminos de error por matriz.
- Evaluacion de decodificacion especulativa en hardware no NVIDIA: este modelo, junto con el companion DFlash, sirve como banco de pruebas para medir el rendimiento de tecnicas de especulacion en aceleradores Intel, un area poco explorada frente a las soluciones propietarias de NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evidencia de rendimiento corresponde a mediciones de velocidad de inferencia realizadas por el autor en una Intel Arc Pro B70 de 32 GB con vLLM XPU, que se resumen a continuacion:

| Modo | Celda | Metrica | Mediana | Notas |
|------|-------|---------|--------:|-------|
| Sin especulacion + XPU graphs | p512/g128 | C1 cliente post-primer token | 93,00 t/s | Rango 92,96–93,03; eager fue 21,8 |
| Sin especulacion + XPU graphs | p8192/g128 | C1 cliente post-primer token | 87,25 t/s | Rango 87,22–87,31 |
| DFlash n_spec=7 | p2048/g128 | C1 cliente post-primer token | 186,61 t/s | Rango 174,60–201,83; decodificacion representativa |
| DFlash n_spec=7 | p8192/g1 | Entrada fria (prompt/TTFT) | 7160 t/s | No es prefill aislado del motor |
| DFlash n_spec=7 | p8192/g128 | C1 cliente post-primer token | 157,92 t/s | Comparado con 87,25 sin especulacion = 1,81x |

Estas cifras son mediciones del autor, no benchmarks oficiales, y no deben interpretarse como indicadores de calidad del modelo.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 18,1 GB en disco; la cuantizacion INT4 reduce el peso del modelo a aproximadamente 16 GB, por lo que se recomienda una GPU con al menos 24 GB de VRAM para cargar el modelo completo con margen para el contexto y los estados intermedios. La configuracion medida utilizo una GPU Intel Arc Pro B70 de 32 GB.
- GPU recomendadas: Intel Arc Pro B70 (32 GB) es la unica GPU probada por el autor. Tambien podria ejecutarse en otras GPUs Intel Arc con soporte XPU y suficiente VRAM, aunque no hay garantias.
- Compatibilidad con GPUs de consumo: no se ha probado en GPUs de consumo Intel (como las Arc A-series) ni en GPUs de otros fabricantes. La conversion esta especificamente orientada a XPU, por lo que no se espera que funcione en CUDA sin modificaciones adicionales.
- Opciones de despliegue: vLLM con soporte XPU (version 0.26.1rc1.dev668+g3ee2df303 o similar), utilizando los parches y configuraciones documentados en el cookbook del autor. No se mencionan alternativas como llama.cpp u Ollama.
- Latencia y throughput: segun las mediciones del autor, se alcanzan 87-93 t/s en decodificacion sin especulacion y hasta 186 t/s con DFlash (n_spec=7) en una sola GPU Arc Pro B70. El prefill (TTFT) no se ha medido de forma aislada en el modo DFlash.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros modelos de la misma categoria (por ejemplo, otros modelos MoE de 30B con cuantizacion GPTQ). La unica referencia directa es el modelo base BF16 de NVIDIA, que no tiene una version GPTQ oficial. Se puede establecer una comparacion cualitativa:

| Modelo | Parametros | Cuantizacion | Hardware objetivo | Rendimiento medido | Licencia |
|--------|------------|--------------|-------------------|--------------------|----------|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 31,6B totales, ~3B activos | BF16 | GPUs NVIDIA (CUDA) | No disponible | OpenMDW-1.1 |
| SergiioB/Nemotron-3.5-Lightning-30B-A3B-GPTQ-INT4-G64-sym (esta conversion) | 31,6B totales, ~3B activos | GPTQ INT4 grupo 64 | Intel Arc XPU | 87-186 t/s (Arc Pro B70) | OpenMDW-1.1 |
| Otras conversiones GPTQ de modelos MoE similares | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado modelos comparables directamente publicados para hardware Intel XPU.

## Limitaciones y advertencias

- Esta es una conversion no oficial realizada por un tercero; no existe una version GPTQ publicada por NVIDIA. El autor advierte que la velocidad no implica paridad de calidad con el modelo original ni con cuantizaciones oficiales.
- La conversion esta optimizada exclusivamente para hardware Intel Arc XPU y requiere parches especificos de vLLM y configuraciones de compilacion documentadas en el cookbook. No se garantiza su funcionamiento en otras plataformas.
- La decodificacion especulativa nativa MTP (multi-token prediction) no funciona con esta conversion; el autor recomienda usar DFlash en su lugar, que requiere un modelo draft adicional (tambien publicado por el mismo autor).
- Existe una advertencia sobre la reproduccion con temperatura 0 en la ruta compilada/grafica en XPU; el autor indica que la prueba aislada con DFlash n=5 coincidio, pero hay un caveat general en el stack.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de contexto especificas de este modelo. Como ocurre con la mayoria de modelos de lenguaje, puede generar contenido inexacto o sesgado, y debe evaluarse antes de usarlo en produccion.
- La licencia OpenMDW-1.1 permite uso comercial, pero es recomendable revisar los terminos completos en el enlace proporcionado, ya que puede incluir condiciones especificas de atribucion o restricciones adicionales.
- La longitud de contexto no esta documentada en esta conversion; se desconoce si coincide con la del modelo base de NVIDIA. Esto puede afectar a aplicaciones que requieran ventanas largas.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/SergiioB/Nemotron-3.5-Lightning-30B-A3B-GPTQ-INT4-G64-sym
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Cookbook de inferencia en Intel Arc Pro B70: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
- Documento de velocidad y capacidad de Nemotron con DFlash: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/nemotron35-30a3/NEMOTRON-DFLASH-B70.md
- Receta de lanzamiento del modelo: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/nemotron35-30a3/NEMOTRON-B70.md
- Matriz de imagenes y parches: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/IMAGE-AND-PATCH-MATRIX.md
- Comandos de instalacion copiables: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/FULL-SETUP-COMMANDS.md
- Modelo companion DFlash: https://huggingface.co/SergiioB/Nemotron-3.5-Lightning-30B-A3B-DFlash-BF16
- Model card oficial de NVIDIA en NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
