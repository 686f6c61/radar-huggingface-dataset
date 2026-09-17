# CharlieChen/loop-grow-d18

## Resumen

Loop-grow-d18 es un modelo de lenguaje base (sin ajuste por instrucciones) publicado por el usuario CharlieChen en Hugging Face, asociado al articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata del checkpoint final original empleado en la escalera de escalado (scaling ladder) sobre el corpus FineWeb, con 1.378.418.688 parametros almacenados en FP32 (5,514 GB) y una longitud de contexto de 2.048 tokens. Corresponde a la coordenada de profundidad d18 de dicha escalera.

Su interes es fundamentalmente de investigacion: es un transformer con repeticion de bloques (looped transformer) en el que la coordenada de profundidad no equivale necesariamente al numero de bloques Transformer ejecutados, ya que el nucleo del modelo se repite cuatro veces. El tokenizador es el de GPT-2 (tiktoken, 50.257 tokens de vocabulario, ampliados a 50.304 filas del modelo), el ancho es 2.304 y la atencion usa 18 cabezas.

No es un checkpoint de instrucciones ni un `AutoModel` de Transformers: se distribuye como artefacto PyTorch original (`final.pt`) junto con metadatos de entrenamiento (`result.json`) y sumas de comprobacion, y requiere el codigo del paper para reconstruir el modelo `TransformerGPT`. No tiene descargas ni likes registrados y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con repeticion de bloques (looped transformer), modo de profundidad `loop` |
| Parametros totales | 1.378.418.688 (FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizados; el checkpoint es FP32) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `final.pt` (FP32), mas `result.json` y `SHA256SUMS` |

Datos adicionales: ancho 2.304, 18 cabezas de atencion, vocabulario de 50.257 tokens (ampliado a 50.304 filas), repeticiones del nucleo configuradas 4 y repeticiones en la evaluacion final 4. Tamano del repositorio: 5,5 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer con recursion: el nucleo del modelo se repite, de modo que la "profundidad" del modelo (coordenada d18 en la escalera de escalado) es una coordenada de escalado y no el numero de bloques Transformer efectivamente ejecutados. La configuracion declara 4 repeticiones del nucleo, tanto en entrenamiento como en la evaluacion final. El ancho es 2.304 y la atencion se reparte en 18 cabezas. El modelo pertenece a la familia de experimentos sobre crecimiento de modelos, recursion y operadores de frontera, cuyo objetivo es caracterizar como influyen estas decisiones en los exponentes de escalado.

El entrenamiento se realizo sobre el corpus FineWeb, con el tokenizador de GPT-2 (`tiktoken.get_encoding("gpt2")`). Es un modelo base preentrenado, sin ajuste por instrucciones (no hay RLHF ni DPO declarados), y el checkpoint no conserva estado del optimizador, por lo que no permite reanudar el entrenamiento. La perdida de validacion de preentrenamiento registrada es de 2,644525 nats/token (NLL sobre el corpus de preentrenamiento, distinta de la NLL del CORE de respuestas). El paper indica que el entrenamiento y la evaluacion se hicieron con GPUs H100, FlashAttention-3 y autocast en bfloat16. No se especifica en la informacion disponible el numero total de tokens vistos ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto en ingles como modelo base; la pipeline declarada es `text-generation`.
- Modelado de lenguaje causal y puntuacion de verosimilitud (NLL por token), util para evaluacion y analisis.
- No dispone de ajuste por instrucciones: no es fiable para seguir ordenes, mantener un formato de dialogo ni para tareas de asistente sin ajuste adicional.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: solo se declara ingles (`en`).
- No se declaran capacidades de vision, audio, modo de pensamiento (thinking mode) ni decodificacion especulativa.
- Su capacidad mas relevante es servir como artefacto reproducible para estudiar el escalado de transformadores con recursion (coordenada de profundidad d18).
- Admite evaluacion con el arnes CORE del paper (22 tareas, semillas 0/1/2) mediante el codigo del repositorio asociado.

## Casos de uso

- Investigacion sobre leyes de escalado: el modelo es un punto concreto (d18) de una escalera de escalado sobre FineWeb, por lo que sirve para reproducir y analizar como la recursion y el crecimiento del modelo afectan a los exponentes de escalado.
- Analisis de arquitecturas recursivas: permite estudiar el efecto de repetir el nucleo cuatro veces frente a aumentar el numero de bloques, comparando perdidas de validacion y comportamiento interno.
- Evaluacion de modelos base: con el arnes CORE del paper se pueden obtener puntuaciones en 22 tareas y compararlas con otros puntos de la misma escalera, usando la NLL de validacion (2,644525 nats/token) como referencia de calidad de modelado.
- Generacion de texto en ingles para experimentos controlados: al ser un modelo base pequeno (1,38B) y con contexto de 2.048 tokens, es adecuado para generar continuaciones y estudiar propiedades del texto sin coste elevado de infraestructura.
- Punto de partida para ajuste fino: al ser un checkpoint base, puede servir como inicializacion para fine-tuning supervisado en tareas concretas en ingles, siempre que se reconstruya con el codigo del paper.
- Estudio de eficiencia computacional: la separacion entre coordenada de profundidad y bloques ejecutados permite analizar el coste de computo frente a la calidad obtenida en una arquitectura con recursion.
- Docencia y prototipado en investigacion: el repositorio incluye instrucciones para descargar el checkpoint y ejecutar una evaluacion acotada en GPU, lo que facilita la reproduccion en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico de calidad proporcionado es la perdida de validacion de preentrenamiento:

| Metrica | Valor |
|---|---|
| Pretraining validation NLL | 2,644525 nats/token |
| CORE (22 tareas, semillas 0/1/2) | no disponible (solo se documenta el procedimiento de evaluacion, sin resultados) |

El propio autor advierte que las puntuaciones del "smoke evaluation" (con `--max-per-task 10`) no equivalen a los resultados completos del paper, por lo que no deben usarse como benchmark. No se incluyen comparaciones con MMLU, HumanEval, GSM8K ni otras suites.

## Requisitos de hardware

- Peso del checkpoint: 1.378.418.688 parametros en FP32, es decir 5,514 GB solo de pesos.
- VRAM estimada en bfloat16/FP16: aproximadamente 2,76 GB de pesos (estimacion a partir del recuento de parametros; no publicada por el autor).
- VRAM estimada en FP32: aproximadamente 5,5 GB de pesos mas el estado de activaciones y la cache KV, que depende del numero de bloques ejecutados (la informacion disponible no detalla el numero de capas).
- Cache KV: con 18 cabezas y ancho 2.304 (dimension de cabeza 128), cada token requiere aproximadamente 9 KB por capa en FP16, multiplicado por la longitud de contexto de 2.048 tokens.
- GPU recomendadas en el paper: H100, con FlashAttention-3 y autocast en bfloat16.
- GPU de consumo: por tamano de pesos, cabe en GPUs consumer con 8 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090) siempre que se reconstruya el modelo con el codigo del paper y en precision reducida; no hay datos de latencia ni throughput publicados.
- Opciones de despliegue: no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El artefacto no es un checkpoint `AutoModel` de Transformers y requiere el codigo del repositorio `cue-engineering/loop` para reconstruir la clase `TransformerGPT` y ejecutar `eval.py`.
- Flujo de evaluacion documentado: descarga con `huggingface_hub.snapshot_download` y ejecucion de `eval.py` con `--checkpoint`, `--result-json`, `--max-per-task`, `--seeds` y `--out`.
- No se publican datos de latencia, tokens por segundo ni requisitos de memoria medidos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de este modelo, y su licencia no esta declarada, lo que limita la comparacion directa. A continuacion se contrastan caracteristicas estructurales conocidas de modelos base de tamano similar; los datos de los modelos alternativos provienen de sus propias fichas publicas y no de la informacion proporcionada sobre loop-grow-d18.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| loop-grow-d18 | 1,38B | 2.048 | Transformer con recursion (loop) | no disponible | PyTorch `final.pt` (FP32) |
| GPT-2 XL | 1,5B | 1.024 | Transformer denso | MIT | PyTorch / safetensors |
| Pythia-1.4B | 1,4B | 2.048 | Transformer denso | Apache 2.0 | safetensors |
| SmolLM2-1.7B | 1,7B | 8.192 | Transformer denso | Apache 2.0 | safetensors / GGUF |

Diferencias clave: frente a estos modelos, loop-grow-d18 no ofrece soporte directo en ecosistemas estandar (Transformers, llama.cpp, vLLM), no publica pesos cuantizados y no declara licencia, mientras que sus alternativas si lo hacen. Su ventaja es ser un artefacto de investigacion reproducible dentro de una escalera de escalado concreta. No hay datos de benchmarks que permitan comparar calidad.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o alineacion; al entrenarse sobre FineWeb sin ajuste por instrucciones, puede reproducir sesgos presentes en ese corpus web.
- Alucinacion: al ser un modelo base sin ajuste, la generacion puede ser incoherente o factualmente incorrecta; no esta calibrado para responder con veracidad.
- Idioma: solo se declara ingles; no hay soporte multilingue documentado.
- Contexto limitado: 2.048 tokens, inferior al de muchos modelos actuales de tamano similar.
- Licencia: no declarada, lo que impide determinar si se permite el uso comercial. Debe tratarse como restriccion en cualquier despliegue en produccion hasta que el autor aclare los terminos.
- Compatibilidad: no es un checkpoint `AutoModel` de Transformers; no funciona con `from_pretrained` ni con herramientas estandar como vLLM, TGI, llama.cpp u Ollama. Requiere el codigo del paper y la reconstruccion manual de `TransformerGPT`.
- Reanudacion de entrenamiento: el checkpoint no incluye estado del optimizador, por lo que no sirve para continuar el entrenamiento desde ese punto.
- Evaluacion: no se han publicado resultados completos de benchmarks; las puntuaciones de la evaluacion acotada ("smoke") no son representativas del rendimiento real.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin validacion externa conocida.
- Fecha de creacion registrada: 16 de septiembre de 2026 (segun los metadatos de Hugging Face), dato que conviene verificar en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieChen/loop-grow-d18
- Codigo del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Tokenizador: `tiktoken.get_encoding("gpt2")` (OpenAI tiktoken)
- Paper: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (no se proporciona URL en la informacion disponible)
