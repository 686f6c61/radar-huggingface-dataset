# Hob-forge/Kolibri-1-GGUF

## Resumen

Kolibri-1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Aleph Alpha, con 78.103.074.560 parametros totales y 3.460 millones de parametros activos por token. Esta disenado para generacion de texto, razonamiento y tool calling en aleman e ingles, y se distribuye bajo licencia Apache-2.0. La ficha que nos ocupa, `Hob-forge/Kolibri-1-GGUF`, es una conversion independiente a formato GGUF realizada por el usuario Hob-forge, no avalada por Aleph Alpha ni por el proyecto llama.cpp.

El modelo base emplea una arquitectura transformer con atencion GQA (48 cabezas de consulta y 4 de clave/valor, head_dim 128), 384 expertos enrutados con seleccion top-6 y un experto compartido sin compuerta en cada capa. Incorpora un modo de razonamiento configurable por peticion (`none`, `low`, `medium`, `high`) y plantilla de chat con soporte de tool calls. La relevancia de esta ficha radica en que permite ejecutar el modelo en hardware de consumo mediante cuantizacion, aunque requiere un parche especifico de llama.cpp porque la arquitectura `kolibri1` no esta soportada en la version upstream.

La conversion incluye seis niveles de cuantizacion (Q2_K a Q8_0) generados a partir de un GGUF BF16 intermedio obtenido del checkpoint FP8 original de Aleph Alpha. El repositorio ocupa 316,6 GB y acumula 14.316 descargas y 28 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion GQA (48 cabezas Q, 4 KV, head_dim 128), patron 4:1 de capas sliding-window (ventana 513, RoPE) y atencion completa (sin codificacion posicional) |
| Parametros totales | 78.103.074.560 |
| Parametros activos | 3,46 mil millones por token |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de ejecucion de la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el checkpoint original es FP8 e4m3 con escalas de bloque 128x128 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 384 expertos enrutados y seleccion top-6, mas un experto compartido sin compuerta en cada capa. El enrutador selecciona expertos sobre `logits + expert_bias` y pondera con `sigmoid(logits)` sin renormalizacion, un comportamiento distinto del router sigmoide de DeepSeek-V3 que implementa llama.cpp de serie; por ello el parche anade un modo de gating nuevo. Las capas alternan en patron 4:1: cuatro capas de atencion con ventana deslizante de 513 tokens y RoPE, seguidas de una capa de atencion completa sin codificacion posicional. Se aplican sandwich norms alrededor de los bloques de atencion y de MoE, y normalizacion RMS por cabeza en q y k.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card de esta conversion solo documenta el proceso de cuantizacion: los pesos se convirtieron desde el checkpoint FP8 de Aleph Alpha, se dequantizaron a BF16 y de ese GGUF BF16 se generaron todas las cuantizaciones, de modo que ninguna es una recuantizacion. Q4_K_M, Q5_K_M, Q6_K y Q8_0 no usan matriz de importancia; Q3_K_M y Q2_K (y tambien Q5_K_M) emplean una matriz de importancia calculada desde el Q8_0 sobre `calibration_datav3` (128 x 512 tokens), con cobertura parcial del 93-98 % en algunos expertos raramente enrutados. El Q4_K_M contiene 903 tensores: 426 Q4_K, 76 Q6_K y 401 F32 (normas, compuertas del router y sesgos de expertos).

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Razonamiento con esfuerzo configurable por peticion mediante `chat_template_kwargs`: `reasoning_effort` acepta `none`, `low`, `medium` y `high`, con bloques `<think>` en la plantilla de chat.
- Tool calling / function calling: la plantilla embebida en el GGUF gestiona llamadas a herramientas y resultados de herramientas.
- Razonamiento multi-paso orientado a agentes, segun las etiquetas del repositorio (`reasoning`, `tool-calling`).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Asistencia conversacional en aleman e ingles: el modelo puede mantener dialogos multi-turno con hasta 32.768 tokens de contexto, adecuado para soporte al cliente en empresas que operan en ambos idiomas.
- Agentes con tool calling: integracion en flujos donde el modelo decide que funcion invocar (consultas a APIs, busquedas, operaciones sobre bases de datos) gracias al soporte nativo de la plantilla de chat para herramientas.
- Razonamiento con coste controlado: el parametro `reasoning_effort` permite usar `low` o `none` en tareas simples y `high` en problemas complejos, ajustando latencia y consumo por peticion.
- Despliegue en hardware de consumo: con Q4_K_M (47,5 GB) el modelo cabe en maquinas con 64 GB de RAM o en configuraciones hibridas GPU+RAM, lo que permite ejecutarlo en estaciones de trabajo sin aceleradores de datacenter.
- Procesamiento de documentos largos en aleman: la ventana de 32.768 tokens permite resumir o extraer informacion de contratos, informes tecnicos o documentacion legal en aleman.
- Generacion asistida en pipelines internos: al ser Apache-2.0, puede integrarse en herramientas corporativas sin restricciones de uso comercial, con llama.cpp como runtime.
- Experimentacion e investigacion: las seis cuantizaciones permiten estudiar el impacto de la compresion en la calidad (la model card incluye comparativas de KL y acuerdo top-1 frente a una referencia en float64).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card si incluye verificaciones de fidelidad de la cuantizacion frente a una referencia independiente en PyTorch float64 (prompt de chat de 67 tokens, logits completos en cada posicion):

| Cuantizacion | Acuerdo top-1 | KL media vs referencia |
|---|---|---|
| Q8_0 | 67/67 | 0,0048 |
| Q6_K | 67/67 | 0,0037 |
| Q5_K_M | 64/67 | 0,0065 |
| Q4_K_M | 63/67 | 0,0129 |
| Q3_K_M | 66/67 | 0,0340 |
| Q2_K | 64/67 | 0,1292 |
| Mismo modelo con router estilo DeepSeek (control) | 10/67 | 8,36 |

Rendimiento medido con `llama-bench` el 2026-10-07 sobre AMD Ryzen 7 7800X3D, 128 GB DDR5-6400 (2 x 64 GB), RTX 5070 de 12 GB, 8 hilos y flash attention activado, con Q4_K_M:

| Configuracion | Prompt (512 tokens) | Generacion (128 tokens) |
|---|---|---|
| Solo CPU (GPU oculta) | 83 ± 13 tok/s | 12,3 ± 1,4 tok/s |
| GPU para atencion y experto compartido, expertos enrutados en RAM | no disponible (dato truncado en la informacion) | no disponible (dato truncado en la informacion) |

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K 28,6 GB; Q3_K_M 37,5 GB; Q4_K_M 47,5 GB; Q5_K_M 55,6 GB (2 partes); Q6_K 64,2 GB (2 partes); Q8_0 83,1 GB (2 partes).
- Consumo de RAM medido en CPU sin mmap: Q4_K_M 46,6 GB; Q8_0 81,6 GB.
- El modelo puede ejecutarse desde RAM del sistema; con GPU, llama.cpp puede mantener parte del modelo en VRAM y el resto en RAM (la model card advierte que el indicador de hardware de Hugging Face solo cuenta VRAM y por eso aparece en rojo).
- Configuracion de referencia probada: RTX 5070 de 12 GB con atencion y experto compartido en GPU y expertos enrutados en RAM.
- No cabe integro en GPUs de consumo de 12-24 GB en ninguna cuantizacion; requiere 32 GB o mas de VRAM para las cuantizaciones bajas, o bien configuracion hibrida.
- Despliegue: llama.cpp con el parche `kolibri1-llama.cpp.patch` aplicado sobre el commit upstream `836d571`, o el binario precompilado `hob-b11434` (Windows CUDA/Vulkan/ROCm/CPU, Linux e Intel Mac). Ollama, LM Studio y otras aplicaciones basadas en llama.cpp no cargaran el archivo hasta que incluyan soporte de la arquitectura.
- Comando de ejemplo: `llama-server -m Kolibri-1-Q4_K_M.gguf -c 32768 --jinja --temp 1.0 --top-p 0.97 --top-k 128`.
- Throughput medido en CPU: 83 tok/s de prompt y 12,3 tok/s de generacion con Q4_K_M en el equipo de referencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible. A continuacion se comparan solo los datos estructurales conocidos frente al checkpoint original:

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kolibri-1 (original, Aleph-Alpha) | 78,1 B | 3,46 B | no disponible | Apache-2.0 | FP8 e4m3 |
| Kolibri-1-GGUF (esta ficha) | 78,1 B | 3,46 B | 32.768 (ejemplo de ejecucion) | Apache-2.0 | GGUF (Q2_K a Q8_0) |

No se han identificado en la informacion disponible otros modelos MoE de tamano y licencia comparables para establecer una comparativa adicional.

## Limitaciones y advertencias

- Solo soporta aleman e ingles; no se documenta cobertura de otros idiomas, incluido el espanol.
- Requiere un parche especifico de llama.cpp: la version upstream no reconoce la arquitectura `kolibri1`, y Ollama, LM Studio y otras aplicaciones derivadas no podran cargar el modelo hasta que la incorporen.
- La conversion es independiente y no esta avalada por Aleph Alpha ni por el proyecto llama.cpp; la responsabilidad de validacion recae en el usuario.
- Q2_K muestra una divergencia notable frente a la referencia (KL media 0,1292 y 64/67 de acuerdo top-1), por lo que no es recomendable para produccion sensible a la calidad; Q4_K_M y superiores son practicamente sin perdida en la prueba realizada.
- La matriz de importancia de Q2_K, Q3_K_M y Q5_K_M tiene cobertura parcial (93-98 %) en algunos expertos raramente enrutados, lo que puede afectar a dominios de nicho.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible; como todo modelo generativo, existe riesgo de alucinacion, especialmente con `reasoning_effort: none`.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y esta conversion se ofrecen sin garantias; conviene validar el comportamiento en el dominio de produccion antes de desplegarlo.
- El contexto maximo documentado en el ejemplo es de 32.768 tokens; no se confirma si el modelo soporta ventanas mayores.
- El repositorio ocupa 316,6 GB, por lo que la descarga y el almacenamiento requieren planificacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Hob-forge/Kolibri-1-GGUF
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Binario precompilado con el parche: https://github.com/Seraphiel102/llama.cpp/releases/tag/hob-b11434
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Parche de arquitectura: `kolibri1-llama.cpp.patch` (incluido en el repositorio GGUF)
