# Rohxn08/flame-rust-30m

## Resumen

FLAME Rust 30M es un modelo de lenguaje de tipo base, con 29,9 millones de parametros, entrenado desde cero especificamente para codigo Rust y texto en ingles. Lo desarrolla Rohxn08 utilizando FLAME, un framework de entrenamiento de modelos pequenos escrito en Rust y basado en Candle. El modelo resuelve un problema acotado: la generacion y continuacion de texto con forma de codigo Rust, y sirve como banco de pruebas para quien quiera estudiar el comportamiento de un transformer decoder-only muy pequeno entrenado sobre un corpus tecnico especializado.

Arquitectonicamente es un transformer decoder-only convencional con RMSNorm, RoPE, atencion causal, SwiGLU y embeddings atados, de 8 capas, 512 dimensiones y 8 cabezas de atencion, con una longitud de contexto de 1024 tokens y un tokenizador BPE a nivel de byte de 8.192 tokens. Se entreno en dos fases sobre aproximadamente 1.310 millones de tokens mezclados de codigo Rust, documentacion del lenguaje, explicaciones de errores del compilador y una muestra de FineWeb-Edu en ingles.

Es relevante ahora no por su calidad como asistente, sino por su transparencia: la model card documenta con detalle el mix de datos, las metricas de validacion (perdida y perplexity por dominio) y una evaluacion de tareas comprobadas con `rustc` real. El autor declara explicitamente que es un modelo de investigacion y aprendizaje, no un chatbot ni un asistente de programacion, y que sus salidas no deben ejecutarse sin revision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only: RMSNorm, RoPE, atencion causal, SwiGLU, embeddings atados |
| Parametros totales | 29.893.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | en (ingles), con dominio principal de codigo Rust |
| Licencia | MIT |
| Formato de pesos | safetensors en formato Candle de FLAME (`best/model.safetensors`, fp32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas, anchura 512 y 8 cabezas de atencion, con RMSNorm, RoPE, atencion causal, SwiGLU en las capas feed-forward y embeddings atados entre entrada y salida. El tokenizador es BPE a nivel de byte con vocabularo de 8.192 tokens (`rust-en-8k.json`). El entrenamiento se realizo en una unica NVIDIA DGX Spark (GB10) con precision mixta BF16 y pesos maestros en fp32, en dos fases: 7.500 pasos de optimizador en la primera y 2.500 en la segunda, con 131.072 tokens por paso, sumando aproximadamente 1.310 millones de tokens.

La mezcla de datos de la fase 1 fue 59% codigo Rust, 35% ingles y 6% documentacion Rust; la fase 2, continuada desde la fase 1, fue 50% codigo Rust, 29,5% ingles, 20% documentacion Rust y 0,5% explicaciones de errores de `rustc`. Las fuentes incluyen los ficheros `.rs` de unas 37 proyectos open source grandes y unas 100 crates populares con sus dependencias, documentacion oficial del lenguaje (The Rust Book, Rust by Example, Nomicon, Reference, Async book, Edition guide, API guidelines, RFCs, rustc dev guide, Cargo book, patrones de diseno, documentacion de Clippy y READMEs de proyectos), el texto de `rustc --explain` para 518 codigos de error y una muestra de 10BT de FineWeb-Edu (aproximadamente 1,5 GB). No se documenta uso de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion y continuacion de texto: dado un prefijo, produce texto adicional con forma de codigo Rust o de prosa tecnica en ingles.
- Modelado de sintaxis Rust: baja perplexity sobre codigo (2,63) indica que ha aprendido patrones sintacticos y de estilo del lenguaje.
- Formato de mensajes de error del compilador: reproduce la estructura de salida de `rustc` con secciones `help:`.
- Modelado de lenguaje en ingles basico, con perplexity alta (21,06) y deriva frecuente hacia texto tipo documentacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.
- No sigue instrucciones ni mantiene conversacion: es exclusivamente un modelo base.

## Casos de uso

- Investigacion sobre modelos pequenos: permite estudiar como un transformer de 30M parametros distribuye su capacidad entre codigo y lenguaje natural mediante las metricas por dominio publicadas (perdida y perplexity sobre codigo Rust, documentacion, errores de `rustc` e ingles).
- Experimentos de destilacion o inicializacion: al ser un modelo base de licencia MIT y pesos fp32, puede servir como punto de partida o como alumno en experimentos de destilacion sobre corpus tecnicos.
- Pruebas de infraestructura de entrenamiento en Rust: el propio framework FLAME, con el que se entreno, esta pensado para entrenar modelos pequenos; este modelo es un artefacto de referencia de dicho pipeline.
- Generacion de texto sintacticamente plausible para pruebas de herramientas: util para validar parsers, resaltadores de sintaxis o linters que necesitan entradas con forma de Rust sin depender de correccion semantica.
- Evaluacion comparativa de tokenizadores y mezclas de datos: la model card documenta el mix exacto por fases, lo que permite reproducir o comparar variantes del corpus.
- Demostraciones docentes de decodificacion autoregresiva: se ejecuta en CPU de portatil en unos segundos por muestra con la CLI de FLAME, lo que facilita explicar temperatura, top-k y muestreo en clase.
- Analisis de fallos de modelos pequenos: la evaluacion con `rustc` (33% de funciones compilan, 3% pasan tests) es un caso concreto para estudiar el gap entre sintaxis y semantica en modelos de baja escala.

## Benchmarks y rendimiento

Resultados de modelado de lenguaje sobre datos de validacion reservados:

| Datos | Perdida | Perplexity |
|---|---:|---:|
| Global | 1,699 | 5,47 (2,45 bits/token) |
| Codigo Rust | 0,967 | 2,63 |
| Explicaciones de errores de rustc | 1,464 | 4,32 |
| Documentacion Rust | 1,981 | 7,25 |
| Ingles | 3,047 | 21,06 |

Evaluacion de tareas: 20 tareas, 3 muestras por tarea (temperatura 0,5, 120 tokens), verificadas con `rustc` 1.99:

| Tarea | Metrica | Resultado |
|---|---|---:|
| Completado de codigo (12 funciones pequenas: `add`, `factorial`, `reverse_string`, etc.) | compila | 12/36 = 33% |
| | compila y pasa tests | 1/36 = 3% (1/12 tareas en cualquiera de las 3 semillas) |
| Correccion de errores (8 errores reales de rustc: E0382, E0384, E0433, etc.) | el texto `help:` nombra la correccion conocida | 0/24 = 0% |

El autor advierte que el conjunto de tareas es pequeno y que estas cifras deben tratarse como una linea base aproximada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 29,9M parametros en fp32 los pesos ocupan aproximadamente 120 MB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: innecesarias para inferencia; el autor indica que se ejecuta comodamente en CPU de portatil. El entrenamiento se hizo en una NVIDIA DGX Spark (GB10).
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en CPU; no requiere acelerador dedicado.
- Opciones de despliegue: CLI de FLAME (`flame generate --cpu --run .`), compilada con `cargo build --release --locked` desde el repositorio RTensorLabs/FLAME. Los pesos no cargan con Transformers, vLLM, llama.cpp, Ollama ni TGI por usar el formato propio de Candle de FLAME.
- Latencia y throughput: el autor indica unos pocos segundos por muestra en CPU de portatil; no se publican cifras de throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion numerica fiable.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FLAME Rust 30M | 29,9M | 1024 | MIT | safetensors (Candle/FLAME) | Modelo base especializado en Rust, solo CLI de FLAME |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables en la informacion disponible |

## Limitaciones y advertencias

- Modelo exclusivamente base: sin ajuste por instrucciones, sin formato de chat y sin memoria entre prompts.
- Rara vez produce programas correctos: solo 3% de las muestras compilan y pasan tests, y las funciones que compilan suelen hacer algo distinto de lo pedido (`max_of` devuelve `a + b`, `square` devuelve `x + 1`).
- La salida nunca debe confiarse ni ejecutarse sin revision; el propio autor lo desaconseja explicitamente.
- Ingles debil (perplexity 21,06) y tendencia a derivar del codigo hacia texto tipo documentacion.
- Contexto limitado a 1024 tokens.
- Puede reproducir fragmentos de sus datos de entrenamiento (codigo open source y texto web), con los riesgos de licencia y atribucion asociados.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre codigo y documentacion open source y una muestra de FineWeb-Edu, puede heredar sesgos presentes en esas fuentes.
- Licencia MIT: permite uso comercial, pero al no ser util como asistente ni generar codigo fiable, su valor en produccion es practicamente nulo fuera de experimentacion.
- Incompatibilidad con el ecosistema Hugging Face Transformers: requiere la CLI de FLAME y compilacion con Rust, lo que complica su integracion en pipelines existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rohxn08/flame-rust-30m
- Repositorio del framework FLAME: https://github.com/RTensorLabs/FLAME
- Rustup (necesario para compilar FLAME): https://rustup.rs
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Ficheros de evaluacion incluidos en el repo: `eval-report.json`, `task_eval.py`, `rust_tasks.json`, `VALIDATION.txt`, `MODEL_CARD.json`
