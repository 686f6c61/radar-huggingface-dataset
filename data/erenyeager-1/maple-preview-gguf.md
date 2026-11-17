# erenyeager-1/maple-preview-GGUF

## Resumen

Maple-Preview es un modelo de lenguaje causal con arquitectura de mezcla de expertos (MoE) desarrollado por deepgrove-ai, publicado en el repositorio `erenyeager-1/maple-preview-GGUF` como una distribucion en formato GGUF. Se trata de un modelo de 20.214.030.336 parametros totales (aproximadamente 20B) con activacion dispersa de tipo A1B, es decir, alrededor de 1.000 millones de parametros activos por token. Su diseno esta orientado desde el origen a la inferencia eficiente en dispositivo, empleando pesos ternarios (TQ1_0 y TQ2_0) y una configuracion de 24 capas con 256 expertos (8 activos).

La relevancia de esta publicacion radica en su propuesta de compresion extrema: los pesos de las matrices se empaquetan en esquemas ternarios que reducen el modelo a tan solo 4,64-5,91 GiB en disco, manteniendo la cabeza LM en mayor precision (Q4_K o FP16). Esto permite ejecutar un modelo de 20B en hardware de consumo, incluidos portatiles con CPU, con velocidades de decodificacion superiores a 160-250 tokens por segundo en un Apple M5 Pro segun los datos del autor.

El modelo se distribuye bajo licencia MIT, esta etiquetado como modelo de razonamiento y solo declara soporte para ingles. La version publicada es una "preview" centrada en razonamiento bruto, y el autor advierte que puede rendir por debajo de lo esperado en benchmarks agenticos hasta la version completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE con atencion hibrida 3:1 SWA-512:GA, 24 capas, 256 expertos (8 activos) |
| Parametros totales | 20.214.030.336 (~20B) |
| Parametros activos | ~1B (designacion A1B) |
| Longitud de contexto | no disponible (ventana de atencion SWA de 512 tokens mencionada como componente, contexto total no especificado) |
| Tipos de cuantizacion | TQ1_0 y TQ2_0 (ternarios) para matrices; cabeza LM en Q4_K o FP16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (variantes TQ1_0 + Q4_K, TQ1_0 + FP16, TQ2_0 + Q4_K, TQ2_0 + FP16) |

## Arquitectura y entrenamiento

Maple-Preview emplea una arquitectura transformer causal con mezcla de expertos: 24 capas, 256 expertos por capa y 8 expertos activos por token, lo que resulta en aproximadamente 1.000 millones de parametros activos sobre un total de 20.214 millones. La atencion combina ventanas deslizantes de 512 tokens con atencion global en una proporcion 3:1 (SWA-512:GA), un patron habitual para reducir el coste computacional de la atencion en contextos largos manteniendo acceso global periodico.

La innovacion tecnica principal es la cuantizacion ternaria de las matrices de pesos mediante dos esquemas de empaquetado, TQ1_0 y TQ2_0, que requieren un fork personalizado de llama.cpp ([deepgrove-ai/llama.cpp](https://github.com/deepgrove-ai/llama.cpp)) para su ejecucion. La cabeza LM se mantiene en Q4_K o FP16 para preservar calidad en la proyeccion final. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card solo indica que la version preview se centra en razonamiento bruto y que habra entrenamiento extendido antes del lanzamiento completo.

## Capacidades

- Generacion de texto conversacional y causal en ingles.
- Razonamiento: el modelo esta etiquetado explicitamente como modelo de razonamiento y el autor lo posiciona en la frontera de Pareto de rendimiento frente a memoria y velocidad.
- Mezcla de expertos con activacion dispersa, lo que reduce el coste por token frente a un modelo denso del mismo tamano.
- Inferencia en dispositivo: disenado para ejecucion en CPU y hardware de consumo gracias a pesos ternarios.
- Capacidad multilingue: limitada al ingles segun los metadatos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el autor advierte que la preview puede rendir por debajo en benchmarks agenticos, por lo que esta capacidad no esta garantizada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en portatiles: al ocupar entre 4,64 y 5,91 GiB en formato GGUF ternario, el modelo puede ejecutarse en un portatil sin GPU dedicada; el autor reporta mas de 160 tokens/s de decodificacion en un Apple M5 Pro con CPU y 16 hilos.
- Asistentes conversacionales en ingles con requisitos de privacidad: al ejecutarse en local, los datos no salen del dispositivo, lo que resulta adecuado para entornos donde no se permite enviar texto a la nube.
- Prototipado de razonamiento en estaciones de trabajo modestas: la activacion de ~1B parametros permite experimentar con un modelo de 20B en memoria de sistema sin necesidad de GPUs de centro de datos.
- Despliegue en entornos con memoria limitada: las variantes TQ1_0 + Q4_K (4,64 GiB) permiten integrar el modelo en contenedores o dispositivos con menos de 8 GiB de RAM.
- Generacion de texto por lotes en CPU: el throughput de prefill reportado (mas de 500 tokens/s en pp512) permite procesar prompt largos de forma razonable en CPU para tareas de clasificacion o resumen en ingles.
- Evaluacion e investigacion de cuantizacion ternaria: el modelo sirve como banco de pruebas para estudiar el impacto de TQ1_0 y TQ2_0 en calidad y velocidad, dado que el autor publica metricas comparativas de ambos esquemas.
- Base para fine-tuning experimental: la licencia MIT permite adaptar el modelo, aunque la toolchain ternaria requiere el fork de llama.cpp y no se documenta soporte de entrenamiento.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Solo se incluyen mediciones de velocidad en Apple M5 Pro, CPU-only, 16 hilos, 512 tokens de prompt y 128 tokens generados, con 3 repeticiones:

| Pesos de matrices | Cabeza LM | Tamano GGUF | Prefill (pp512) | Decodificacion (tg128) |
|---|---|---|---|---|
| TQ1_0 | FP16 | 5,06 GiB | 515,41 ± 0,28 tok/s | 161,06 ± 0,57 tok/s |
| TQ1_0 | Q4_K | 4,64 GiB | 513,33 ± 3,62 tok/s | 231,13 ± 0,13 tok/s |
| TQ2_0 | FP16 | 5,91 GiB | 618,57 ± 2,12 tok/s | 169,81 ± 2,94 tok/s |
| TQ2_0 | Q4_K | 5,50 GiB | 610,48 ± 3,76 tok/s | 252,74 ± 0,37 tok/s |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: entre 4,64 y 5,91 GiB para los pesos GGUF; a esto hay que sumar el estado KV y overhead del runtime, por lo que se recomienda al menos 8 GiB de memoria disponible.
- GPU recomendadas: no disponible; el autor solo documenta ejecucion en CPU (Apple M5 Pro). Al ser un fork de llama.cpp, cabe esperar soporte de offload a GPU, pero no se confirma en la informacion.
- GPU de consumo: no confirmado. El tamano reducido permitiria en principio cargar el modelo en GPUs con 8 GB o mas, pero no hay datos oficiales.
- Opciones de despliegue: llama.cpp mediante el fork [deepgrove-ai/llama.cpp](https://github.com/deepgrove-ai/llama.cpp). No se menciona soporte de vLLM, TGI, Ollama u otros runtimes.
- Latencia y throughput: prefill de ~515-618 tok/s y decodificacion de ~161-252 tok/s en Apple M5 Pro con CPU y 16 hilos, segun el autor. La variante TQ2_0 + Q4_K es la mas rapida en decodificacion (252,74 tok/s) a costa de 5,50 GiB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad que permitan una comparacion rigurosa. A continuacion se compara solo en terminos estructurales con alternativas de la misma categoria (modelos MoE de ~20B con activacion dispersa):

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Maple-Preview | ~20B | ~1B | no disponible | MIT | GGUF ternario |
| Alternativas MoE ~20B | no disponible | no disponible | no disponible | no disponible | no disponible |

No hay informacion suficiente para establecer comparaciones de rendimiento con otros modelos. El autor afirma que Maple-Preview establece un nuevo punto en la frontera de Pareto de memoria-rendimiento y velocidad-rendimiento, pero no aporta cifras de calidad que respalden la afirmacion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse presumiblemente con datos web en ingles, es esperable un sesgo linguistico y cultural hacia el ingles.
- Riesgo de alucinacion: no cuantificado; al ser un modelo de razonamiento en fase preview, no se han publicado evaluaciones de factualidad.
- Limitaciones de idioma: solo declara ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Limitacion de contexto: la atencion combina ventanas deslizantes de 512 tokens con atencion global 3:1, pero la longitud total de contexto no se especifica; no debe asumirse una ventana grande.
- Rendimiento agentico: el propio autor advierte que la preview puede rendir por debajo en benchmarks agenticos, por lo que no es recomendable para pipelines de agentes en produccion sin validacion previa.
- Toolchain no estandar: requiere un fork especifico de llama.cpp; los esquemas TQ1_0 y TQ2_0 no son compatibles con llama.cpp upstream ni con la mayoria de runtimes (vLLM, TGI, Ollama).
- Licencia: MIT permite uso comercial, pero el modelo es una preview sin garantias de calidad; conviene validar en el dominio de aplicacion antes de desplegarlo.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de validacion independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/erenyeager-1/maple-preview-GGUF
- Repositorio original referenciado en la model card: https://huggingface.co/deepgrove/maple-preview-GGUF
- Fork de llama.cpp requerido: https://github.com/deepgrove-ai/llama.cpp
- Variante TQ1_0 + Q4_K: https://huggingface.co/deepgrove/maple-preview-GGUF/blob/main/maple-preview-TQ1_0-head-Q4_K.gguf
- Variante TQ1_0 + FP16: https://huggingface.co/deepgrove/maple-preview-GGUF/blob/main/maple-preview-TQ1_0-head-F16.gguf
- Variante TQ2_0 + Q4_K: https://huggingface.co/deepgrove/maple-preview-GGUF/blob/main/maple-preview-TQ2_0-head-Q4_K.gguf
- Variante TQ2_0 + FP16: https://huggingface.co/deepgrove/maple-preview-GGUF/blob/main/maple-preview-TQ2_0-head-F16.gguf
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
