# inductiveML/LFM2.5-230M-MONARCH

## Resumen

LFM2.5-230M-MONARCH es una conversion de pesos, no un modelo entrenado. El autor (inductiveML) toma los pesos de LiquidAI/LFM2.5-230M-ONNX (revision c6f46e4e3f885ebcad164d14059a49f90e27eb4d) y los reempaqueta en un unico buffer GPU optimizado para su decodificador de navegador MONARCH MIX_M40. Segun la model card, no se realizo ningun entrenamiento ni ajuste fino: se trata de un formato de almacenamiento y una disposicion de memoria alternativos para ejecutar el mismo modelo de 230 millones de parametros sobre WebGPU.

El artefacto publicado pesa 168.647.680 bytes y contiene pesos int4 con block size 32 y escalas en f32, tensores de normalizacion y convolucion, tablas rotatorias exportadas y copias slice-major de las proyecciones down del feed-forward. El buffer esta dividido en nueve chunks de transporte que se reconstruyen byte a byte, con verificacion SHA-256 encadenada (canonica: ca1fea89fd9f3ca7e5d6d5720705c96f457a92edd0cfc811cf8d9391ac784cb0). El repositorio ocupa 0,2 GB y no expone checkpoint de Transformers, sino un binario mas un manifiesto de 199 secciones.

Su relevancia es de nicho pero clara: demuestra inferencia de un LLM pequeno directamente en el navegador mediante WebGPU, con una medicion registrada de 1.574,4 tok/s en un Apple M4 Max con Chromium a pantalla completa y contexto 192. Es un caso de estudio sobre empaquetado de pesos, kernels WGSL y verificacion de integridad mas que una alternativa a un modelo de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | La del modelo base LFM2.5-230M (familia LFM2, hibrida con convoluciones y atencion); detalle exacto no disponible. El buffer incluye tensores de normalizacion y convolucion |
| Parametros totales | 230 M (segun el nombre del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la unica medicion registrada se hizo a contexto 192 |
| Tipos de cuantizacion | int4 con block size 32 y escalas f32; empaquetado propietario, no esquemas GGUF/AWQ/GPTQ |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (identificador lfm1.0), con condiciones de uso comercial; el runtime MONARCH se distribuye aparte bajo Apache-2.0 |
| Formato de pesos | Buffer binario empaquetado propio (168.647.680 bytes) dividido en 9 chunks de transporte + model-manifest.json y monarch-config.json; no safetensors ni GGUF |
| Modelo base | LiquidAI/LFM2.5-230M-ONNX |
| Tamano del repositorio | 0,2 GB |
| Revision fijada | c6f46e4e3f885ebcad164d14059a49f90e27eb4d |

## Arquitectura y entrenamiento

No hay entrenamiento implicado. La model card es explicita: "No training or fine-tuning was performed". Lo que se publica es una representacion modificada de los pesos de LiquidAI/LFM2.5-230M-ONNX, reempaquetada para el decodificador MONARCH MIX_M40 del autor. Por tanto, las caracteristicas de arquitectura son las del modelo base de Liquid AI, no las de esta publicacion; el buffer si revela presencia de tensores de convolucion, normalizacion, tablas rotatorias y proyecciones down del feed-forward, coherente con una arquitectura hibrida de convoluciones y atencion.

La innovacion tecnica esta en el formato y el runtime. El buffer original de 145.054.720 bytes se conserva como prefijo; se anaden 22.937.600 bytes por catorce reempaquetados de las proyecciones down y 655.360 bytes por dos tablas rotatorias extendidas, hasta los 168.647.680 bytes finales. Las tablas rotatorias provienen de la exportacion ONNX, no se recalcularon con otra implementacion matematica. El decodificador usa 72 dispatches ordinarios por token, soporta generacion greedy de un solo flujo y no incluye un decodificador persistente entre workgroups (el kernel de investigacion conservo la marca NO_VERDICT_SPLIT y la valoracion de kernels persistentes no se adjudico formalmente).

## Capacidades

- Generacion de texto autoregresiva en modo greedy, un unico flujo, pensada para un turno de conversacion corto.
- Generacion conversacional: el tag "conversational" del repositorio indica uso de chat, heredado del modelo base.
- Ejecucion local en navegador sobre WebGPU, sin backend remoto ni GPU de servidor.
- Verificacion de integridad en tiempo de carga: el demo valida cada chunk y el buffer completo antes de habilitar la inferencia.
- Comprobacion funcional previa: el demo verifica una continuacion conocida de 32 tokens antes de permitir generar.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No se documenta soporte multilingue especifico; los idiomas no estan declarados en la ficha de HuggingFace.

## Casos de uso

- Asistentes conversacionales embebidos en una pagina web: al ejecutarse integramente en el cliente, el texto del usuario no abandona el dispositivo, lo que simplifica el cumplimiento de RGPD en formularios de ayuda o chat de soporte de bajo volumen.
- Aplicaciones de privacidad en sectores regulados: borradores de texto, clasificacion o resumen de notas que no pueden salir de la maquina del profesional, sin necesidad de desplegar infraestructura GPU propia.
- PWAs y aplicaciones offline: instalaciones donde no hay conectividad estable y se requiere generacion de texto corta, aprovechando que el buffer completo ocupa 168,6 MB y cabe en el almacenamiento del navegador.
- Demostraciones y material docente: permite mostrar el ciclo completo de un LLM (tokenizacion, atencion, decodificacion) dentro del navegador con un modelo de 230 M y throughput medido, sin coste de servidor.
- Investigacion en kernels WebGPU: el codigo WGSL y el layout de memoria sirven de referencia reproducible para quien escriba kernels de decodificacion, gracias a los 199 apartados documentados en monarch-config.json y a los 72 dispatches por token.
- Distribucion verificable de artefactos de modelo: el patron de chunks con SHA-256 por fragmento y SHA-256 canonico del buffer es aplicable a pipelines que necesitan garantizar que los pesos no se han alterado en transito.
- Pruebas de integracion continua de runtimes: como el demo comprueba una continuacion conocida de 32 tokens, ese mismo mecanismo puede reutilizarse como test de regresion en el desarrollo de runtimes de inferencia.
- Validacion de compatibilidad de hardware cliente: util para comprobar si una GPU o un navegador concreto soporta los requisitos estrictos del decodificador (WebGPU, shader-f16, subgrupos de 32 lanes, workgroups de 1.024 hilos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni equivalentes). El unico dato de rendimiento registrado es de throughput del runtime, no de calidad del modelo:

| Medicion | Valor | Condiciones |
|---|---|---|
| Velocidad de decodificacion | 1.574,4 tok/s | Apple M4 Max, Chromium a pantalla completa, contexto 192, decodificador MONARCH MIX_M40 |
| Dispatches por token | 72 | Decodificador en funcionamiento |

El propio autor advierte que la cifra de 1.574,4 tok/s es una medicion puntual y no una prediccion para hardware arbitrario.

## Requisitos de hardware

- VRAM estimada: el buffer de pesos ocupa 168,6 MB en int4; con activaciones, tablas rotatorias y buffers de trabajo es razonable esperar un consumo de unos cientos de MB, pero no hay cifra oficial publicada.
- Requisitos obligatorios del runtime: WebGPU, extension shader-f16, subgrupos fijos de 32 lanes y workgroups de 1.024 hilos. Un dispositivo que no cumpla los cuatro no puede ejecutar el demo.
- Hardware verificado: Apple M4 Max con Chromium a pantalla completa es la unica configuracion con medicion registrada.
- GPU de escritorio: no se documenta compatibilidad con A100, H100 o RTX 4090; el modelo esta pensado para WebGPU en cliente, no para servidores de inferencia.
- Consumer GPU: cabe con holgura por tamano, pero la limitacion real no es la memoria sino el soporte de las capacidades WebGPU exigidas.
- Opciones de despliegue: navegador Chromium con WebGPU y el runtime MONARCH; el formato empaquetado no es cargable por vLLM, llama.cpp, Ollama ni TGI. Para esos motores habria que partir del modelo base LiquidAI/LFM2.5-230M-ONNX.
- Latencia y throughput: 1.574,4 tok/s en M4 Max a contexto 192, en modo greedy y un solo flujo. No hay datos de batching, ni de latencia de primer token, ni de rendimiento a contextos largos.

## Comparativa con modelos similares

No hay datos publicados de otros modelos empaquetados para decodificadores WebGPU en la informacion disponible. La comparacion posible es contra el modelo base del que se derivan los pesos:

| Modelo | Parametros | Formato | Licencia | Estado |
|---|---|---|---|---|
| inductiveML/LFM2.5-230M-MONARCH | 230 M | Buffer binario int4 empaquetado para MONARCH, 168,6 MB | LFM Open License v1.0 | Publicado, 0 descargas, 0 likes, `inference: false` en HuggingFace |
| LiquidAI/LFM2.5-230M-ONNX | 230 M | ONNX | LFM Open License v1.0 | Modelo base del que procede esta conversion |
| Otras alternativas de inferencia en navegador | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo nuevo ni ajustado: cualquier limitacion de calidad, sesgo o alucinacion del modelo base se hereda sin cambios, ya que no hubo entrenamiento ni alineamiento adicional.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinacion para esta publicacion.
- Modo de generacion restringido: solo greedy, un unico flujo, sin batching ni decodificacion especulativa, segun la model card.
- El contexto probado es de 192 tokens; no hay confirmacion de la ventana de contexto real util ni de su comportamiento a contextos largos.
- Idiomas soportados: no disponibles. No se debe asumir buen rendimiento en castellano sin evaluarlo.
- Dependencia fuerte del cliente: requiere WebGPU, shader-f16, subgrupos de 32 lanes y workgroups de 1.024 hilos; excluye navegadores y GPU que no cumplan esos requisitos.
- No hay decodificador persistente entre workgroups, lo que limita el margen de optimizacion del throughput en otras plataformas.
- Licencia LFM Open License v1.0 con condiciones de uso comercial definidas por Liquid AI; es imprescindible revisar LICENSE-LFM.txt y NOTICE.txt antes de un uso comercial. El runtime MONARCH es Apache-2.0, pero eso no cambia la licencia de los pesos.
- Los ficheros de weights/ son representaciones modificadas preparadas por inductiveML, no los pesos originales; el manifiesto documenta los cambios y checksums.
- La model card declara `inference: false` en HuggingFace, coherente con que el artefacto no es un checkpoint de Transformers cargable directamente.
- Repositorio sin descargas ni likes y con fecha de creacion 2026-09-15: no hay validacion independiente de la comunidad.
- La medicion de throughput corresponde a un unico equipo y a contexto 192; extrapolarla a otros dispositivos o contextos no esta justificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inductiveML/LFM2.5-230M-MONARCH
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-ONNX/tree/c6f46e4e3f885ebcad164d14059a49f90e27eb4d
- Demo en navegador (Space): https://huggingface.co/spaces/inductiveML/monarch-webgpu
- Codigo fuente del kernel y runtime: https://huggingface.co/spaces/inductiveML/monarch-webgpu/tree/main/src/monarch
- Pagina de experimento, metodologia y mediciones: https://inductive.ml/experiments/monarch
- Licencia LFM: https://huggingface.co/inductiveML/LFM2.5-230M-MONARCH/blob/main/LICENSE-LFM.txt
