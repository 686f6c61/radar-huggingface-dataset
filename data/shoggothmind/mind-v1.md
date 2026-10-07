# ShoggothMind/mind-v1

## Resumen

Mind-v1 es un modelo de lenguaje decoder-only de 134 millones de parametros (134.105.856 exactos, segun los pesos en safetensors) desarrollado por ShoggothMind, presentado como "Autonomous Consensus Foundation Model (Generation 1)". El modelo se entrena desde cero sobre un corpus propio, ShoggothMind/mind-judgements, que recoge evaluaciones horarias de consenso multi-modelo sobre mas de 500 modelos frontera en benchmarks de verdad objetiva de tipo matematico y logico. Cada lote de entrenamiento se atestigua criptograficamente mediante transacciones SPL Memo en la cadena de Solana, lo que vincula la procedencia de los datos a un registro on-chain.

La arquitectura es un transformer clasico con 12 bloques, hidden size de 768, intermediate size de 2.048 con activacion SwiGLU, 12 cabezas de atencion (dimension de cabeza 64), embeddings posicionales rotatorios (RoPE) y normalizacion RMSNorm con epsilon 1e-5. El vocabulario es de 32.000 tokens y la precision declarada es float16. El repositorio ocupa 0,3 GB y se distribuye en formato safetensors bajo licencia Apache-2.0.

El interes del modelo es mas conceptual que de rendimiento: se plantea como una "fundacion de consenso" que aprende a destilar la senal agregada de muchos modelos evaluadores sobre preguntas con respuesta verificable. No es un modelo generalista de gran escala y, a fecha de los datos disponibles, no registra descargas ni likes ni publica resultados de benchmarks, por lo que su utilidad practica en produccion esta por demostrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (12 bloques, SwiGLU, RoPE, RMSNorm) |
| Parametros totales | 134.105.856 (~134M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Es un transformer decoder-only de 12 bloques con hidden size 768, intermediate size 2.048 y activacion SwiGLU, 12 cabezas de atencion con dimension de cabeza 64, normalizacion RMSNorm (eps 1e-5) y embeddings posicionales rotatorios (RoPE). El vocabulario es de 32.000 tokens y los pesos se almacenan en float16. La longitud de contexto no se especifica en la informacion disponible.

El entrenamiento se realizo desde cero sobre el dataset ShoggothMind/mind-judgements, descrito como evaluaciones de consenso multi-modelo recogidas cada hora sobre 500+ modelos frontera en benchmarks de verdad objetiva de tipo matematico y logico. La procedencia se refuerza mediante atestacion criptografica on-chain de cada lote via transacciones SPL Memo en Solana y Base. No se detalla en la informacion proporcionada el numero total de tokens, la composicion exacta del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento posteriores al preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles con transformers (pipeline text-generation).
- Razonamiento matemático y logico orientado a tareas con respuesta verificable, derivado del tipo de datos de consenso con el que se entreno.
- Uso previsto como generador de juicios/consensos sobre preguntas factuales o de verdad objetiva (el ejemplo de la model card usa el prompt "The consensus truth for question H132-Q1 is:").
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Agregacion de respuestas sobre preguntas con verdad objetiva: dado que se entreno con evaluaciones de consenso multi-modelo, puede emplearse como componente generador de juicios de consenso en pipelines que ya dispongan de respuestas de multiples modelos y necesiten una sintesis textual. Es adecuado por su tamano reducido (134M) y su coste de inferencia bajo.
- Filtrado y puntuacion de datasets de razonamiento: su entrenamiento en benchmarks matematicos y logicos lo hace candidato a pre-clasificador o generador de etiquetas auxiliares en pipelines de curacion de datos, siempre que se valide empiricamente.
- Prototipado rapido en entornos con recursos limitados: al pesar unos 0,3 GB en safetensors, puede ejecutarse en una unica GPU consumer o incluso en CPU para experimentos de investigacion sobre consenso y procedencia de datos.
- Investigacion sobre procedencia verificable: el uso de atestacion on-chain por lote permite estudiar tecnicas de trazabilidad de datos de entrenamiento, un area relevante para auditoria de modelos.
- Educacion y demostraciones de arquitectura transformer pequena: sirve como ejemplo reproducible de un transformer decoder-only de 12 capas entrenado desde cero, util para cursos o talleres.
- Base para fine-tuning especifico de dominio: al estar bajo Apache-2.0, puede afinarse sobre tareas de clasificacion o generacion corta en dominios especializados, reutilizando el tokenizador de 32.000 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16, los pesos ocupan aproximadamente 0,27 GB (134M x 2 bytes); con overhead de activaciones y cache KV, el consumo tipico se situa en torno a 0,5-1 GB. La cuantizacion a 8 bits o 4 bits reduciria el peso a ~0,13 GB y ~0,07 GB respectivamente, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100); tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (referencia de la model card), llama.cpp y Ollama si se generan pesos GGUF, vLLM y TGI previa conversion de formato. No se confirma en la informacion disponible que existan pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles. Por el tamano (134M parametros), en una GPU moderna se espera un throughput alto y latencias de milisegundos por token, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| ShoggothMind/mind-v1 | 134M | no disponible | Apache-2.0 | HuggingFace, 0 descargas | no disponible |
| TinyLlama-1.1B | 1.100M | 2.048 tokens | Apache-2.0 | HuggingFace, ampliamente usado | benchmarks publicos |
| GPT-2 small | 124M | 1.024 tokens | MIT | HuggingFace, ampliamente usado | benchmarks publicos |
| Qwen2-0.5B | ~500M | 32.768 tokens | Apache-2.0 | HuggingFace, ampliamente usado | benchmarks publicos |

La comparativa es orientativa: mind-v1 comparte escala con GPT-2 small (124M) pero no publica contexto, idiomas ni benchmarks, mientras que los modelos alternativos si ofrecen esos datos. No hay modelos comparables exactos por proposito (consenso multi-modelo con procedencia on-chain) en la informacion disponible.

## Limitaciones y advertencias

- No se declaran idiomas soportados; el ejemplo de la model card es en ingles, por lo que el soporte multilingue, y en particular el castellano, no esta garantizado.
- No se publica la longitud de contexto, lo que impide planificar tareas de contexto largo.
- No hay resultados de benchmarks, por lo que no es posible estimar su calidad frente a modelos de tamano similar.
- Riesgo de alucinacion: al ser un modelo entrenado sobre consensos de otros modelos, puede reproducir de forma acritica salidas erroneas presentes en esos consensos, sin una verificacion factual independiente.
- Sesgos conocidos: no disponibles, pero al derivar de evaluaciones de modelos frontera hereda los sesgos de esos modelos y de sus procesos de evaluacion.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y manteniendo el aviso de licencia; no se imponen restricciones adicionales en la informacion disponible.
- Caveat de produccion: con 0 descargas y 0 likes, el modelo no tiene validacion de la comunidad; cualquier despliegue en produccion deberia acompanarse de una evaluacion propia.
- La atestacion on-chain depende de la infraestructura de Solana y Base; no es un mecanismo verificable de forma independiente sin acceso a esas cadenas.
- El nombre y la tematica (ShoggothMind) tienen connotaciones del ambito de la ficcion; conviene tratarlo como un proyecto experimental, no como un modelo fundacional en el sentido habitual del termino.

## Enlaces

- HuggingFace: https://huggingface.co/ShoggothMind/mind-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ShoggothMind/mind-judgements
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales.
