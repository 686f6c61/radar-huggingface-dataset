# bcckfdn/cevher-test-10-GGUF

## Resumen

cevher-406m-v15 es un modelo de generacion de texto de tipo decoder-only entrenado desde cero por el usuario bcckfdn, distribuido en formato GGUF bajo el identificador `bcckfdn/cevher-test-10-GGUF`. Se apoya en la arquitectura de SmolLM2 (familia Llama) y cuenta con aproximadamente 407 millones de parametros (406.918.144 segun los pesos en safetensors del modelo base). El repositorio contiene unicamente cuantizaciones GGUF listas para su uso con llama.cpp, Ollama y LM Studio.

El modelo base es `bcckfdn/cevher-test-10`, entrenado segun la model card con 34.734 B de tokens de entrenamiento, una dimension oculta de 1024 y 34 capas. Esta orientado principalmente al turco (tr) y al ingles (en), y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia practica radica en su tamano reducido: al ser un modelo de ~0,4 B de parametros, cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU, lo que lo hace adecuado para prototipado, despliegues en el borde y entornos con recursos muy limitados. No obstante, el repositorio no incluye resultados de benchmarks ni detalles ampliados sobre el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo SmolLM2 (Llama) |
| Parametros totales | 406.918.144 (~407 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |
| Dimension oculta | 1024 |
| Numero de capas | 34 |
| Tokens de entrenamiento | 34.734 B (segun la model card) |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo decoder-only basada en SmolLM2 (que a su vez sigue el diseno de Llama). Segun la model card, se entreno desde cero con una dimension oculta de 1024 y 34 capas, lo que da lugar a los ~407 millones de parametros. El numero total de tokens de entrenamiento indicado es de 34.734 B.

La informacion publicada no detalla la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT posteriores al preentrenamiento. Tampoco se describen innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, atencion agrupada, etc.). El repositorio se limita a ofrecer los pesos cuantizados en GGUF para inferencia con llama.cpp y herramientas compatibles.

## Capacidades

- Generacion de texto conversacional en turco e ingles, segun los idiomas declarados.
- Modelo base orientado a text-generation; no se documentan modos especiales como thinking mode.
- Soporte de conversacion multi-turno a traves de la interfaz de chat de llama.cpp (`-cnv`) y Ollama.
- No se especifica soporte de tool calling o function calling.
- No se documentan capacidades de agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada a turco e ingles; no se declaran otros idiomas.
- Entrenamiento desde cero, sin adaptaciones posteriores documentadas.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en turco o ingles: su tamano (~245 MB en Q4_K_M) permite iterar en local y desplegar en entornos de desarrollo sin GPU dedicada.
- Generacion de texto en aplicaciones de borde (edge computing): al ser un modelo de ~0,4 B, puede ejecutarse en dispositivos con CPU moderna o GPUs integradas, ideal para asistentes embebidos.
- Filtrado o preprocesado de texto en turco: clasificacion ligera, normalizacion o generacion de resumenes breves en pipelines donde no se justifica un modelo mayor.
- Educacion y demostraciones de arquitecturas Llama a pequena escala: sirve como ejemplo reproducible de un transformer entrenado desde cero para docencia o investigacion.
- Chat de bajo coste en entornos con GPU muy limitada: con Q5_K_M (281 MB) o Q4_K_M (245 MB) es viable mantener multiples instancias en una sola GPU de consumo.
- Generacion de texto offline: al ser GGUF, funciona sin conexion con llama.cpp, Ollama o LM Studio, util para escenarios air-gapped.
- Pruebas de integracion de pipelines de inferencia GGUF: permite validar configuraciones de llama.cpp, Ollama o LM Studio antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 ~0,8 GB solo de pesos; Q8_0 ~0,41 GB; Q5_K_M ~0,28 GB; Q4_K_M ~0,245 GB (mas el cache KV, que depende del contexto).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060/4060, RTX 4090, e incluso en GPUs integradas con memoria compartida.
- Puede ejecutarse integramente en CPU sin GPU, dado su tamano inferior a 1 GB en cuantizaciones de 8 bits o menos.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y cualquier runtime compatible con GGUF. No se documenta soporte oficial para vLLM o TGI con estos pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| cevher-406m-v15 (este) | ~407 M | no disponible | Apache 2.0 | tr, en | GGUF |
| SmolLM2-360M | ~362 M | no verificado en esta ficha | Apache 2.0 | en (principalmente) | safetensors, GGUF |
| Qwen2.5-0.5B | ~494 M | no verificado en esta ficha | Apache 2.0 | multilingue | safetensors, GGUF |
| TinyLlama-1.1B | ~1,1 B | no verificado en esta ficha | Apache 2.0 | en (principalmente) | safetensors, GGUF |

Nota: los datos de los modelos comparables provienen de conocimiento general y no de la informacion proporcionada; conviene verificarlos en sus respectivas model cards antes de tomar decisiones. No se dispone de cifras de rendimiento comparadas para este modelo.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas concretas es desconocido.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos web en turco e ingles, es probable que herede sesgos presentes en dichas fuentes.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el tamano reducido (~0,4 B) incrementa la probabilidad de errores factuales y de coherencia en contextos largos.
- Limitacion idiomatica: solo se declaran turco e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no especificada, lo que dificulta planificar despliegues que requieran ventanas amplias.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de la responsabilidad sobre el contenido generado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- No se documentan tecnicas de alineacion (RLHF/DPO), por lo que el ajuste a instrucciones puede ser limitado.
- El repositorio solo distribuye pesos GGUF; para reproducir o afinar el modelo habria que recurrir al modelo base `bcckfdn/cevher-test-10`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bcckfdn/cevher-test-10-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher-test-10
- Reglas de licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com/
- LM Studio: https://lmstudio.ai/
