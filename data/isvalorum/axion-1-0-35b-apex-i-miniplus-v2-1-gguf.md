# IsValorum/Axion-1.0-35B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Axion-1.0-35B-APEX-I-MiniPlus-V2.1-GGUF es una cuantizacion GGUF del modelo base Axion1-0/Axion-1.0-35B, publicada por el usuario IsValorum bajo la serie "APEX Quantization". No se trata de un modelo entrenado desde cero, sino de una compilacion de pesos en precision reducida pensada para ejecucion en llama.cpp y entornos compatibles con GGUF. El modelo base es un transformer hibrido con atencion lineal/SSM y atencion completa periodica, con arquitectura MoE de 256 expertos enrutados (8 activos) y 1 experto compartido, 40 capas y un contexto declarado de 262.144 tokens.

El interés de esta publicacion reside en la estrategia de cuantizacion "quirurgica": en lugar de aplicar una receta uniforme, el autor asigna precisiones distintas por tipo de tensor (F32 para routers, normalizaciones y escalas SSM; Q8_0 para gates de atencion; Q6_K para la cabeza de salida; Q3_K/IQ3_XXS para los expertos MoE enrutados), calibrando con una importance matrix publica. El resultado es un unico fichero GGUF de aproximadamente 14,75 GB que reduce de forma agresiva el peso de los expertos manteniendo alta precision en los componentes criticos para la estabilidad numerica.

La relevancia es practica: permite desplegar un modelo de ~34.660 millones de parametros totales en hardware de gama consumer o servidores modestos, con soporte de contexto largo y plantilla de chat Jinja. La licencia Apache-2.0 heredada del modelo base facilita el uso comercial, aunque la model card advierte de que los benchmarks del modelo base son autodeclarados y no hay evaluacion independiente de esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 40 capas (30 de atencion lineal/SSM + 10 de atencion completa); MoE con 256 expertos enrutados + 1 compartido, 8 activos |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | no disponible (8 de 256 expertos enrutados + 1 compartido; el numero exacto de parametros activos no se especifica) |
| Longitud de contexto | 262.144 tokens (declarado en la model card del modelo base) |
| Tipos de cuantizacion | Mezcla por tensor: F32, Q8_0, Q6_K, Q5_K, Q4_K, Q3_K, IQ3_XXS |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero principal de 14.751.301.312 bytes) |

Otros datos tecnicos: hidden size 2048, vocabulario de 248.320 tokens, 131 tensores de normalizacion en F32, 80 tensores de router de expertos en F32, 120 tensores de escalas SSM en F32. El repositorio incluye `tensor-map.tsv` (33.146 bytes) con el desglose por tensor y `chat_template.jinja`.

## Arquitectura y entrenamiento

El modelo base combina capas de atencion lineal con mecanismos de espacio de estados (SSM) y capas de atencion completa cuadratica intercaladas. Segun la model card de la cuantizacion, hay 30 capas hibridas de atencion lineal/SSM y 10 capas "ancla" de atencion completa situadas en las posiciones 3, 7, 11 y sucesivas cada 4 capas. La componente MoE emplea 256 expertos enrutados con 8 activos por token mas un experto compartido siempre activo, con routers en `ffn_gate_inp` y `ffn_gate_inp_shexp`. El contexto declarado es de 262.144 tokens y el vocabulario de 248.320 entradas.

Sobre el entrenamiento del modelo base no se aporta informacion en la documentacion disponible: no se especifican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. La innovacion tecnica documentada en esta publicacion es la cuantizacion por capas y tipos de tensor con importance matrix (`Axion-1.0-35B.imatrix.gguf` de mradermacher, verificada por tamano y sha256). Destaca el "recurrent shielding": las escalas SSM (`ssm_alpha`, `ssm_a`, `ssm_dt.bias`, `ssm_conv1d`) y las RMSNorm se mantienen en F32 para evitar deriva del estado recurrente. Los expertos de las capas centrales (10-29) usan IQ3_XXS, mientras que los de las capas de borde (0-9 y 30-39) usan Q3_K. La cabeza de salida va en Q6_K y los embeddings en Q4_K.

No se incluyen tensores MTP ni borrador DSpark para esta familia, segun advierte el autor, por lo que no hay decodificacion especulativa integrada en este GGUF.

## Capacidades

- Generacion de texto conversacional y razonamiento general, con plantilla de chat Jinja incluida.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`, aunque este repositorio solo incluye el GGUF de texto; para multimodal hay que descargar el `mmproj` (`Axion-1.0-35B.mmproj-bf16.gguf` o sus cuantizaciones) desde el repositorio upstream `prithivMLmods/Axion-1.0-35B-GGUF`.
- Contexto largo: ventana declarada de 262.144 tokens, adecuada para recuperacion tipo needle-in-a-haystack gracias a las 10 capas de atencion completa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente.
- Modo "thinking" o razonamiento extendido: no documentado.
- Ejecucion en CPU y GPU via llama.cpp, con soporte de offload de capas (`-ngl`).

## Casos de uso

- Despliegue local en estaciones de trabajo: con ~14,75 GB de fichero, el modelo cabe en GPUs consumer de 16-24 GB (RTX 4080, 4090) o en configuraciones CPU+GPU con offload parcial, permitiendo asistentes conversacionales privados sin conexion.
- Analisis de documentos largos: la ventana de 262.144 tokens permite procesar contratos, informes o bases de codigo extensas en una sola pasada, apoyandose en las capas de atencion completa para retrieval preciso.
- Procesamiento multimodal con el mmproj: descargando el proyector de vision del repositorio upstream, se pueden construir pipelines de descripcion de imagenes, extraccion de texto de capturas o respuesta a preguntas visuales.
- Servidor de inferencia ligero: `llama-server` con `--jinja` permite exponer una API compatible con OpenAI para integrar el modelo en aplicaciones existentes con bajo coste de infraestructura.
- Prototipado e investigacion: la licencia Apache-2.0 y el formato GGUF facilitan experimentar con tecnicas de cuantizacion, comparar precisiones por tensor y validar el impacto del "recurrent shielding" en tareas de contexto largo.
- Educacion y demos: al ejecutarse en hardware asequible, sirve para talleres y demostraciones de modelos MoE hibridos sin depender de clusters.
- Evaluacion de calidad de cuantizacion: util para equipos que quieran medir la degradacion de un modelo MoE hibrido con expertos en IQ3_XXS frente al BF16 en sus propias cargas de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los benchmarks del modelo base son autodeclarados por el equipo de Axion y que no se reclama evaluacion independiente para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 14.751.301.312 bytes (~13,74 GiB). Para cargarlo completo en GPU se necesitan al menos 16 GB de VRAM, dejando margen para el contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para carga completa; A100 40/80 GB, H100 o L40S para despliegues de servidor con contexto largo y concurrencia.
- Cabe en GPU consumer: si, en RTX 4090, RTX 4080 y modelos con 16 GB o mas. En GPUs de 12 GB o menos es necesario offload parcial a CPU (`-ngl` reducido).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, frontends como Ollama o LM Studio que acepten GGUF estandar. vLLM y TGI no estan documentados para este fichero en la informacion disponible.
- Latencia y throughput: no disponibles. Dependeran del hardware, del numero de capas offloaded y de la longitud de contexto; el uso de expertos en IQ3_XXS reduce el ancho de banda de memoria frente a cuantizaciones mayores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Axion-1.0-35B APEX-I MiniPlus V2.1 (esta ficha) | ~34,66 B totales, MoE 8/256 activos | 262.144 | Hibrida SSM + atencion completa, MoE | Apache-2.0 | GGUF mixto (~14,75 GB) |
| Axion-1.0-35B APEX-I NanoPlus V2.1 | no disponible | no disponible | misma base | Apache-2.0 | GGUF (otra receta de cuantizacion) |
| Axion-1.0-35B BF16 (prithivMLmods) | ~34,66 B totales | 262.144 | misma base | Apache-2.0 | GGUF BF16 (referencia) |
| Axion1-0/Axion-1.0-35B (original) | ~34,66 B totales | 262.144 | misma base | Apache-2.0 | safetensors |

La comparacion con modelos de otros fabricantes no esta disponible en la informacion proporcionada. Dentro de la propia familia, la diferencia entre MiniPlus y NanoPlus es la agresividad de la cuantizacion; el BF16 sirve como referencia de calidad.

## Limitaciones y advertencias

- Los benchmarks del modelo base son autodeclarados por el equipo de Axion; no hay evaluacion independiente de esta cuantizacion.
- La calidad de la cuantizacion es teorica hasta que se valide en la carga de trabajo concreta del usuario; los expertos en IQ3_XXS y Q3_K pueden degradar tareas de razonamiento fino o codigo.
- Este repositorio solo incluye el GGUF de texto: no es multimodal por si mismo. Para vision hay que descargar el `mmproj` desde el repositorio upstream.
- No se incluyen tensores MTP ni borrador DSpark, por lo que no hay decodificacion especulativa integrada.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse en produccion.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar la model card del modelo base para condiciones adicionales o atribuciones.
- El contexto maximo de 262.144 tokens requiere memoria KV considerable; en hardware consumer habra que reducirlo (por ejemplo, `-c 32768` como en los ejemplos del autor).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/IsValorum/Axion-1.0-35B-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Axion1-0/Axion-1.0-35B
- Cuantizacion NanoPlus de la misma familia: https://huggingface.co/IsValorum/Axion-1.0-35B-APEX-I-NanoPlus-V2.1-GGUF
- Repositorio GGUF upstream con mmproj: https://huggingface.co/prithivMLmods/Axion-1.0-35B-GGUF
- Importance matrix de mradermacher: https://huggingface.co/mradermacher
- Apoyo al autor: https://ko-fi.com/isvalorum
