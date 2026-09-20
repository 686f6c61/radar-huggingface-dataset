# SlumberDemon/Ternary-Bonsai-2-27B-mlx-2bit

## Resumen

Bonsai 2 27B es un modelo de lenguaje de 27.360 millones de parametros cuyos pesos estan cuantizados de forma ternaria: cada peso toma un valor en {−1, 0, +1} con un unico factor de escala FP16 compartido por cada grupo de 128 pesos (formato "ternary g128"). El resultado es un modelo de clase 27B que ocupa 8,60 GB en disco (7,67 GB de backbone de lenguaje mas 0,92 GB de torre de vision) frente a los aproximadamente 54 GB que ocuparia en FP16, con una retencion declarada del 98,2% de la inteligencia del modelo original. Deriva de Qwen3.8-27B, del que hereda la arquitectura sin cambios: atencion hibrida (aproximadamente 75% lineal y 25% completa), MLP SwiGLU, RoPE y RMSNorm, con una ventana de contexto de 262.000 tokens.

La relevancia de esta ficha esta en el regimen de compresion: segun la model card, el modelo mantiene razonamiento, modo "thinking" y comportamiento agentico en un rango sub-4 bits donde las representaciones convencionales se degradan. El autor reporta una media de 84,78 puntos en 14 benchmarks en modo thinking, frente a 72,59 de un build IQ2_XXS convencional con menos de dos tercios de su huella, y a menos de 0,4 puntos de un UD-Q4_K_XL que ocupa el triple.

El repositorio analizado (SlumberDemon/Ternary-Bonsai-2-27B-mlx-2bit) es el empaquetado en formato MLX, orientado a ejecucion en Apple Silicon mediante el fork de MLX de Prism ML, con kernels ternarios personalizados en MLX (Python y Swift) y CUDA. Existe un companero en GGUF para llama.cpp (CUDA, Metal y CPU). La licencia es Apache 2.0. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto reciente y con adopcion todavia no contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atencion hibrida (aproximadamente 75% lineal / 25% completa), MLP SwiGLU, RoPE, RMSNorm |
| Parametros totales | 27.359.638.768 (27,36B): 24,35B de backbone de lenguaje (64 bloques) + 2,54B de embeddings y LM head + 0,46B de torre de vision (27 bloques) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.000 tokens (heredada de Qwen3.8-27B) |
| Tipos de cuantizacion | Ternaria g128 ({−1, 0, +1} con escala FP16 por grupo de 128 pesos; 1,72 bits/peso como representacion, 2,25 bits/peso tal como los almacena MLX). Empaquetados GGUF alternativos: PTQ1_0 (1,75 bits/peso, 5,95 GB) y PQ2_0 (7,21 GB). La torre de vision va sin cuantizar en FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en contenedor MLX (empaquetado 2-bit MLX); variante GGUF en repositorio separado |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base Qwen3.8-27B: se trata de un transformer causal con atencion hibrida en la que aproximadamente el 75% de las capas usan atencion lineal y el 25% atencion completa, lo que hace viable sostener 262.000 tokens de contexto en dispositivos de consumo. El backbone de lenguaje tiene 64 bloques, con SwiGLU en las proyecciones MLP, RoPE para el codificado posicional y RMSNorm. Se anade una torre de vision de 27 bloques (0,46B de parametros) que se incluye sin cuantizar, en FP16.

El trabajo tecnico no esta en el entrenamiento sino en la representacion de pesos. La cuantizacion ternaria cubre embeddings, proyecciones de atencion, proyecciones MLP y LM head, sin "escapes" de alta precision detras de una etiqueta de bajo bit. Antes de la asignacion ternaria, cada matriz se transforma bloque a bloque mediante una rotacion de Hadamard ortogonal (bloque 1024, signos ±1 fijos) y la transformacion correspondiente se aplica a las activaciones en tiempo de ejecucion; la rotacion queda plegada en los pesos almacenados en el proceso offline, por lo que no anade bits ni trafico de pesos. El modelo empaquetado declara su rotacion como metadatos, de modo que un runtime o aplica la transformacion correspondiente o rechaza cargar el fichero. Los kernels ternarios personalizados de MLX y CUDA consumen los pesos empaquetados directamente, sin expandirlos de nuevo a FP16. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO especificas para esta cuantizacion.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking": la model card reporta retencion de comportamiento de razonamiento profundo en el regimen sub-4 bits.
- Matematicas: 96,57 en el benchmark de matematicas reportado, a menos de medio punto de la precision completa.
- Codigo: 89,42, al mismo nivel que la linea base.
- Tool calling y comportamiento agentico: 74,92 en la evaluacion de agentic tool calling reportada.
- Razonamiento multi-paso y flujos de agente, segun los resultados de la categoria agentica.
- Vision: incluye la torre de vision oficial de Qwen3.8-27B (0,46B, FP16 sin cuantizar), por lo que el paquete es multimodal aunque el pipeline declarado en HuggingFace sea text-generation.
- Contexto largo: 262.000 tokens, factibles en dispositivo gracias al backbone predominantemente de atencion lineal.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Ejecucion on-device: soporte en Apple MLX (Python y Swift) y CUDA.

## Casos de uso

- Asistente de razonamiento local en portatil: con 8,60 GB en disco y unos 47 tok/s en un Apple M5 Max, el modelo cabe en un equipo de consumo y permite mantener conversaciones con razonamiento en modo thinking sin enviar datos a un servicio externo, algo relevante para sectores con requisitos de confidencialidad.
- Agente con tool calling en local: la puntuacion de 74,92 en tool calling agentico permite construir agentes que invoquen APIs, ejecuten consultas o encadenen pasos de varios turnos en la propia maquina, sin depender de endpoints remotos.
- Analisis de documentacion extensa: la ventana de 262.000 tokens admite ingerir repositorios completos, expedientes o manuales tecnicos en una sola pasada, con la atencion lineal reduciendo el coste de memoria respecto a un transformer de atencion completa equivalente.
- Copiloto de codigo on-device: con 89,42 en la evaluacion de codigo, puede integrarse en el IDE del desarrollador para autocompletado, refactorizacion y generacion de tests sin salir del equipo, util en entornos con codigo propietario que no puede salir de la organizacion.
- Tutoria y resolucion de problemas matematicos paso a paso: el modo thinking y los 96,57 puntos en matematicas lo hacen adecuado para explicar derivaciones y verificar resultados en herramientas educativas.
- Aplicaciones iOS y macOS: el fork de mlx-swift permite empaquetar el modelo en apps nativas de Apple, con la torre de vision habilitando funciones de descripcion de imagenes o extraccion de informacion de capturas y documentos escaneados.
- Procesamiento de imagen a texto en el borde: la torre de vision FP16 incluida permite clasificacion, descripcion o respuesta a preguntas visuales sin un segundo modelo separado.
- Validacion y experimentacion en cuantizacion ternaria: el paquete sirve como referencia reproducible para investigar rotaciones de Hadamard, empaquetados de 1,72 bits/peso y el comportamiento de kernels ternarios en MLX y CUDA.
- Despliegue en servidor sin GPU de gama alta: mediante el fork de llama.cpp con soporte CUDA, Metal y CPU, el modelo puede servirse en nodos modestos o incluso en CPU, con los empaquetados PTQ1_0 y PQ2_0 como alternativas de tamano.

## Benchmarks y rendimiento

Datos publicados en la model card (media de 14 benchmarks en modo thinking y categorias seleccionadas). La model card no identifica los repositorios exactos de los builds de comparacion ni detalla la metodologia completa, que se remite al whitepaper.

| Metrica | Ternary-Bonsai-2-27B | IQ2_XXS convencional | UD-Q4_K_XL | FP16 (referencia) |
|---|---|---|---|---|
| Media de 14 benchmarks (modo thinking) | 84,78 | 72,59 | Aproximadamente 85,18 (el modelo queda a menos de 0,4 puntos) | 100% (el modelo retiene el 98,2%) |
| Matematicas | 96,57 | No disponible | No disponible | A menos de 0,5 puntos de precision completa |
| Codigo | 89,42 | No disponible | No disponible | Al mismo nivel que la linea base |
| Agentic tool calling | 74,92 | No disponible | No disponible | No disponible |
| Huella en disco | 8,60 GB | Mas de 1,5 veces mayor (menos de dos tercios de su tamano) | Aproximadamente el triple | Aproximadamente 54 GB (FP16) |
| Throughput medido | Aproximadamente 47 tok/s en Apple M5 Max | No disponible | No disponible | No disponible |

## Requisitos de hardware

- VRAM para los pesos: 8,60 GB en el empaquetado MLX de este repositorio (7,67 GB de lenguaje + 0,92 GB de vision). El empaquetado GGUF PTQ1_0 baja a 5,95 GB y el PQ2_0 a 7,21 GB.
- VRAM total estimada: a partir del tamano en disco, un minimo practico de 10-11 GB para contexto corto, sumando pesos y cache KV; para ventanas cercanas a 262.000 tokens la cache KV crece de forma significativa y el autor no publica cifras, por lo que debe medirse en el hardware objetivo (estimacion derivada del tamano en disco, no dato oficial).
- GPU recomendadas: el modelo esta pensado para Apple Silicon (MLX sobre Metal) y para CUDA. La model card cita explicitamente un Apple M5 Max con unos 47 tok/s; no se publican cifras para A100, H100 o RTX 4090.
- GPU de consumo: si, es el objetivo del modelo. Cabe en GPUs con 10-12 GB o mas de VRAM siempre que se use un empaquetado adecuado, y en portatiles Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: MLX en Python y Swift (fork de mlx-swift para iOS y macOS) con los kernels ternarios de Prism ML; llama.cpp mediante el fork de Prism ML con soporte CUDA, Metal y CPU usando los ficheros GGUF. No se menciona soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: aproximadamente 47 tok/s en un Apple M5 Max. No hay datos publicados para CUDA ni para CPU. Requisito critico: el fichero declara su rotacion de Hadamard como metadatos, de modo que solo los runtimes que aplican la transformacion correspondiente (los forks indicados) pueden cargarlo; una version estandar de MLX o llama.cpp rechazara el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y huella | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B (este repo, MLX 2-bit) | 27,36B | 262K | safetensors MLX, 8,60 GB (2,25 bits/peso segun el contenedor MLX) | 84,78 de media en 14 benchmarks | Apache 2.0 |
| Ternary-Bonsai-2-27B GGUF (PTQ1_0 / PQ2_0) | 27,36B | 262K | GGUF, 5,95 GB / 7,21 GB (1,75 bits/peso en PTQ1_0) | No disponible por separado | Apache 2.0 |
| IQ2_XXS convencional (base no especificada en la model card) | No disponible | No disponible | Cuantizacion de 2 bits convencional | 72,59 de media en los mismos benchmark | No disponible |
| UD-Q4_K_XL (base no especificada en la model card) | No disponible | No disponible | Cuantizacion de 4 bits, aproximadamente el triple de huella | Aproximadamente 85,18 (0,4 puntos por encima) | No disponible |
| Qwen3.8-27B FP16 (modelo base) | 27,36B | 262K | FP16, aproximadamente 54 GB | Referencia de precision completa | No disponible en la informacion proporcionada |

La model card no identifica los repositorios concretos de los builds IQ2_XXS ni UD-Q4_K_XL usados como comparacion, por lo que la equivalencia exacta de parametros y contexto con este modelo no puede confirmarse.

## Limitaciones y advertencias

- La cuantizacion ternaria degrada inevitablemente parte de la capacidad del modelo base: la retencion declarada es del 98,2%, es decir, hay una perdida de aproximadamente 1,8 puntos porcentuales respecto a FP16 en la media de 14 benchmarks.
- Los resultados publicados provienen del autor del modelo (Prism ML) y se remiten al whitepaper para la metodologia; no se aportan evaluaciones independientes en la informacion disponible.
- Dependencia de runtimes modificados: solo los forks de MLX, mlx-swift y llama.cpp de Prism ML aplican la rotacion de Hadamard requerida. Un runtime estandar rechazara el fichero, lo que complica la integracion en pipelines existentes.
- La torre de vision se entrega sin cuantizar y en FP16, por lo que las tareas multimodales no se benefician de la compresion ternaria y anaden 0,92 GB.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni idioma de entrenamiento; el modelo hereda las caracteristicas del base Qwen3.8-27B, no documentadas aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Cualquier despliegue en produccion con contenido factual deberia incorporar verificacion externa.
- El empaquetado MLX almacena los pesos a 2,25 bits/peso, por encima de los 1,72 bits/peso de la representacion ideal y de los 1,75 bits/peso del empaquetado GGUF PTQ1_0; si el objetivo es minimizar huella, el formato GGUF es mas eficiente.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes) y publicacion por una cuenta de usuario (SlumberDemon) sobre un modelo cuyo desarrollo atribuye la model card a Prism ML; conviene verificar que el contenido del repositorio coincide con los artefactos oficiales antes de usarlo.
- Licencia Apache 2.0, que permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y el fichero de cambios. El modelo base Qwen3.8-27B tiene su propia licencia, no confirmada en la informacion proporcionada, y podria imponer condiciones adicionales.
- Los datos aportados por la busqueda web no contienen informacion relevante sobre este modelo, por lo que no ha sido posible contrastar las cifras con fuentes externas.

## Enlaces

- HuggingFace del modelo (este repositorio): https://huggingface.co/SlumberDemon/Ternary-Bonsai-2-27B-mlx-2bit
- Companero en GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Sitio web de Prism ML: https://prismml.com
- Whitepaper de Bonsai 2 27B: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demos y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de MLX con kernels ternarios (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS y macOS): https://github.com/PrismML-Eng/mlx-swift
- Fork de llama.cpp (CUDA): https://github.com/PrismML-Eng/llama.cpp
- Discord de la comunidad: https://discord.gg/prismml
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
