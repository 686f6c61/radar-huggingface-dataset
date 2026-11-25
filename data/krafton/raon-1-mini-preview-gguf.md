# KRAFTON/Raon-1-mini-preview-gguf

## Resumen

Raon-1 mini preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, el brazo de inteligencia artificial de la editora de videojuegos surcoreana KRAFTON. Con 28.800 millones de parametros totales y solo 4.300 millones activos por token, se posiciona como un modelo de razonamiento y agentes con especial enfasis en conversacion en coreano y en tareas de ejecucion con herramientas. Esta ficha describe la version GGUF del checkpoint preview, publicada para su uso con llama.cpp.

La arquitectura es hibrida: combina 18 capas de Raon Delta Attention (una variante de atencion lineal con estado de tamano fijo) con 7 capas de Gated MLA que mantienen cache KV, lo que reduce drasticamente el coste de memoria en contextos largos. El modelo soporta de forma nativa hasta 262.144 tokens de contexto y emplea decodificacion especulativa mediante un modelo borrador DFlash2 publicado en paralelo. La licencia es Apache 2.0, aunque el acceso al checkpoint esta sujeto a un formulario de solicitud.

El repositorio GGUF resulta relevante porque permite ejecutar el modelo en hardware de consumo mediante llama.cpp, con cuantizaciones que van desde Q8_0 hasta Q2_K y con un peso total del repositorio de 261,1 GB repartido entre todas las variantes. Es una publicacion de preview, por lo que las especificaciones y resultados pueden cambiar antes de la version final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 18 capas Raon Delta Attention (RDA) + 7 capas Gated MLA, con Raon-mHC y 4 streams residuales |
| Parametros totales | 28.783.218.602 (28,8B) |
| Parametros activos | 4,3B (6 expertos enrutados de 128 + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF: Q8_0 y superiores desde BF16; Q6_K y menores con importance matrix (imatrix); el repo base ofrece MXFP8 y NVFP4 |
| Idiomas soportados | Coreano e ingles (segun la model card); no se detalla una lista completa |
| Licencia | Apache 2.0 (acceso al checkpoint mediante formulario de solicitud) |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors con expertos enrutados en MXFP8 |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer con mezcla de expertos dispersa. De las 25 capas totales, 18 usan Raon Delta Attention, una variante que desacopla las puertas de borrado y escritura de Kimi Delta Attention y que mantiene un estado de tamano fijo, mientras que las 7 restantes usan Gated MLA y son las unicas que conservan cache KV, con un coste aproximado de 8 KiB por token en BF16. El modelo prescinde de codificacion posicional (NoPE), usa 40 cabezas de atencion con dimension 128 para RDA y 192 QK / 128 V para MLA, y aplica la funcion de activacion SiTU-GLU. La conexion residual es Raon-mHC con 4 streams, una reduccion del coste computacional del manifold-constrained hyper-connections de DeepSeek. El vocabulario es de 259.840 tokens con LM head no atada.

La model card indica que el modelo fue entrenado desde cero por KRAFTON AI, pero no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Como innovaciones tecnicas destacan la propia RDA, el esquema Raon-mHC y el soporte de decodificacion especulativa mediante el modelo borrador DFlash2 (KRAFTON/Raon-1-mini-preview-dflash2), que acelera la generacion. Los pesos de los expertos enrutados se almacenan en MXFP8 en el repositorio principal; las conversiones GGUF parten de los pesos BF16 del mismo checkpoint.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento integrado (thinking), con resultados destacados en benchmarks de matematicas y ciencias segun el autor.
- Seguimiento de instrucciones y tareas de busqueda, donde la model card situa al modelo por delante de sus comparables.
- Conversacion en coreano con alta calidad y rendimiento solido en ingles.
- Tool calling para flujos agenticos, con soporte declarado para Hermes Agent, Pi y OpenCode.
- Razonamiento multi-paso orientado a la ejecucion de agentes.
- Contexto largo nativo de 262.144 tokens, adecuado para documentos extensos y sesiones prolongadas.
- Decodificacion especulativa con el modelo borrador DFlash2 para reducir latencia.
- Capacidades multilingues limitadas, en la practica, a coreano e ingles segun la documentacion disponible.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede mantener conversaciones multi-turno con contexto de hasta 262.144 tokens, lo que permite arrastrar el historial completo de un cliente y documentacion de producto sin truncar.
- Agentes autonomos con herramientas: gracias al soporte de tool calling y a la integracion con Hermes Agent, Pi y OpenCode, puede orquestar llamadas a APIs, busquedas y ejecucion de comandos en pipelines agenticos.
- Asistencia a desarrolladores en coreano e ingles: generacion y explicacion de codigo dentro de IDE o terminal, con la ventaja de un rendimiento solido en ambos idiomas.
- Analisis de documentos largos: informes, contratos o expedientes de decenas de miles de tokens que caben en una sola ventana sin necesidad de tecnicas de retrieval.
- Razonamiento matematico y cientifico: resolucion de problemas con modo thinking para entornos educativos o de investigacion, apoyandose en los resultados declarados en benchmarks de matemticas y ciencias.
- Despliegue local en estaciones de trabajo: la version GGUF con cuantizaciones Q4_K_M o inferiores permite ejecutar el modelo en llama.cpp sobre GPU de consumo, util para prototipado y entornos con requisitos de privacidad.
- Busqueda aumentada y resumen: tareas de instruction following y search en las que el modelo debe combinar resultados recuperados con instrucciones complejas.

## Benchmarks y rendimiento

La model card menciona resultados en benchmarks de matematicas, ciencias, seguimiento de instrucciones y busqueda, presentados en una imagen comparativa frente a modelos abiertos, pero los valores numericos no estan disponibles en el texto proporcionado. No se han publicado cifras concretas de MMLU, HumanEval, GSM8K ni de otros benchmarks en la informacion disponible, por lo que no se incluye tabla comparativa de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 28,8B parametros totales, en Q8_0 se requieren aproximadamente 30-32 GB; en Q6_K alrededor de 24-26 GB; en Q4_K_M en torno a 17-19 GB; en Q3_K_M cerca de 14-15 GB; en Q2_K aproximadamente 11-12 GB. Son estimaciones a partir del tamano del modelo, no cifras publicadas por el autor.
- GPU recomendadas: A100 80 GB o H100 para BF16/FP8 y contextos largos; RTX 4090 (24 GB) para Q4_K_M con contexto moderado; RTX 5090 (32 GB) para NVFP4 segun la model card, que indica que esa cuantizacion permite inferencia en una sola RTX 5090.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM usando cuantizaciones Q4 o inferiores; en 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo de este repo), Ollama a partir de los GGUF, y vLLM o TGI para el checkpoint base en safetensors. El repo esta marcado como compatible con endpoints.
- Latencia y throughput: no disponibles. La decodificacion especulativa con DFlash2 deberia reducir la latencia, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Raon-1 mini preview | 28,8B / 4,3B | 262.144 | Apache 2.0 (acceso con solicitud) | GGUF, safetensors (MXFP8), NVFP4 | Enfasis en coreano y agentes; arquitectura hibrida RDA + MLA |
| Modelos MoE de ~30B con ~3-4B activos de otros laboratorios | No disponible | No disponible | No disponible | No disponible | La model card menciona comparaciones con modelos abiertos, pero no se detallan nombres ni cifras en la informacion disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas. La model card indica que el modelo lidera frente a sus comparables en matematicas, ciencias, seguimiento de instrucciones y busqueda, pero sin cifras verificables en el texto disponible.

## Limitaciones y advertencias

- Es una version preview, no final: las especificaciones, pesos y resultados pueden cambiar antes del lanzamiento definitivo.
- El acceso al checkpoint esta sujeto a un formulario (gated) con nombre, afiliacion, puesto, pais y uso previsto, aunque la licencia sea Apache 2.0.
- Idiomas: la documentacion solo garantiza coreano e ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de alucinacion inherente a los modelos generativos; no se publican tasas de error ni evaluaciones de factualidad.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Las cifras de VRAM y latencia de esta ficha son estimaciones derivadas del tamano del modelo, no datos oficiales.
- El contexto nativo de 262.144 tokens puede degradar la calidad en los extremos de la ventana; no se publican resultados de long-context benchmarking.
- El repositorio GGUF ocupa 261,1 GB en total por incluir multiples cuantizaciones; conviene descargar solo el archivo necesario.
- Existe una version mas reciente del repositorio GGUF (KRAFTON/Raon-1-mini-gguf) que sustituye a este preview.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KRAFTON/Raon-1-mini-preview-gguf
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Modelo borrador DFlash2: https://huggingface.co/KRAFTON/Raon-1-mini-preview-dflash2
- Version GGUF mas reciente: https://huggingface.co/KRAFTON/Raon-1-mini-gguf
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Pagina de KRAFTON AI: https://krafton.ai/en/
- Organizacion en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
