# BennyDaBall/LFM3-1.7B-NVFP4-GGUF

## Resumen

LFM3-1.7B-NVFP4-GGUF es una cuantizacion derivada del modelo LiquidAI/LFM3-1.7B, desarrollado originalmente por Liquid AI y re-cuantizado por el usuario independiente BennyDaBall. Se trata de un GGUF de 1,84 GB que aplica NVFP4 (4 bits con escalas de bloque E4M3) sobre los pesos feed-forward del transformer, manteniendo el resto de capas en BF16 segun el mapa de capas publicado por Liquid AI. El objetivo es ofrecer una version de 4 bits que corra en llama.cpp y LM Studio estandar, con una fidelidad respecto al BF16 superior a las conversiones NVFP4 y Q4_K_M de referencia.

El modelo base LFM3-1.7B es un transformer de 1.728.801.672 parametros (aproximadamente 1,7 mil millones) orientado a generacion de texto, razonamiento, llamadas a herramientas y conversacion. Esta ficha se centra en la version cuantizada, que hereda las capacidades del modelo original pero con requisitos de memoria reducidos a costa de una perdida de calidad medible en terminos de divergencia KL.

La relevancia de esta publicacion es doble: por un lado, demuestra que el formato NVFP4 puede desplegarse en toolchains estandar (llama.cpp b12015 en adelante, runtime CUDA 2.67.0 de LM Studio) sin parches; por otro, documenta un fallo de implementacion en llama.cpp que afecta a las conversiones NVFP4 directas de LFM3 (las escalas por tensor del bloque feed-forward se ignoran, produciendo salidas degeneradas). El autor resuelve el problema plegando exactamente esas escalas en los pesos y en las normas adyacentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3, segun modelo base); cuantizacion NVFP4 W4A8 sobre pesos feed-forward |
| Parametros totales | 1.728.801.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 W4A8 (4 bits pesos, 8 bits activaciones) en feed-forward; BF16 en atencion, convoluciones, embeddings, cabeza y normas |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (fichero `LFM3-1.7B-SR-NVFP4.gguf`, 1,84 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 1,7 mil millones de parametros de Liquid AI (familia LFM3). La version aqui descrita no reentrena el modelo: parte de los pesos BF16 oficiales y aplica una cuantizacion post-entrenamiento. El mapa de capas es identico al de LiquidAI/LFM3-1.7B-NVFP4: NVFP4 sobre los pesos feed-forward del bloque de lenguaje, y BF16 en atencion, convoluciones, embeddings, cabeza de salida y normas. Las activaciones usan escala estatica por tensor (`input_scale`) y escalas dinamicas por bloque de 16 elementos, recalibradas sobre el conjunto de calibracion del autor.

La innovacion tecnica principal es el solver de pesos: en lugar del redondeo al vecino mas cercano (RTN) que usa ModelOpt por defecto, se emplea GPTQ combinado con dos metodos publicados. Schur Replay (arXiv 2609.36654) prueba, dentro del bucle GPTQ, una ventana de codigos de escala E4M3 por cada bloque de 16 pesos y evalua cada candidato reproduciendo las actualizaciones GPTQ del bloque y puntuandolo con su perdida GPTQ real (el complemento de Schur de las columnas aun no cuantizadas). Four Over Six (arXiv 2512.02010) anade el mapeo a escala 4. Las matrices de Hessian se calculan sobre 599.000 tokens de calibracion (llamadas a herramientas, chat, razonamiento y texto crudo), con respuestas generadas por el propio modelo BF16.

El autor documenta ademas un problema de compatibilidad: las builds estandar de llama.cpp (b12015 a b12032) y el runtime CUDA 2.67.0 de LM Studio omiten la escala por tensor NVFP4 en el bloque feed-forward de LFM, de modo que una conversion directa imprime secuencias degeneradas ("666666..."). Este GGUF pliega cada escala por tensor de forma exacta: desplazamientos potencia de dos de las escalas de bloque E4M3 (bit-exactos) y el resto absorbido en `ffn_norm` (gate/up) y en el sandwich invariante de escala `post_ffw_norm` (down).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base LFM3-1.7B.
- Razonamiento con modo "thinking" activado por defecto, segun la model card.
- Llamadas a herramientas (tool calling) en el formato XML propio de Liquid.
- Razonamiento multi-paso y uso en agentes, implícito en el soporte de tool calls y thinking.
- Generacion de codigo y matematicas: la model card recomienda parametros de muestreo especificos para matematicas y STEM (temperature 1.0, top_p 0.95, top_k 20).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistentes conversacionales en local: el modelo cabe en 1,84 GB de pesos, por lo que puede ejecutarse en equipos de consumo con GPU modesta o incluso en CPU mediante llama.cpp, gestionando dialogos multi-turno con el formato de chat de Liquid.
- Agentes con llamadas a herramientas: el soporte de tool calling en XML permite integrar el modelo en flujos de automatizacion (consultas a APIs, ejecucion de comandos) donde el coste por token y la latencia importan mas que la precision absoluta.
- Razonamiento asistido con modo thinking: util para tareas de analisis, descomposicion de problemas y generacion de explicaciones paso a paso en entornos con recursos limitados.
- Generacion de codigo en pipelines de desarrollo: su tamano permite desplegarlo junto a herramientas de CI/CD o asistentes de IDE que requieran inferencia local sin dependencia de la nube.
- Prototipado e investigacion de cuantizacion: el repositorio documenta metricas KLD frente a BF16, Q8_0, Q4_K_M y QAD-Q4_0, lo que lo convierte en una referencia util para estudiar el impacto de NVFP4 W4A8 en modelos pequenos.
- Despliegue en LM Studio para pruebas de usuario final: el autor verifica chat y tool calls en el runtime CUDA 2.67.0, lo que facilita evaluaciones sin configuracion adicional.
- Educacion y demos offline: al no requerir conexion ni GPU de datacenter, sirve para talleres y demostraciones de modelos de lenguaje en hardware asequible.

## Benchmarks y rendimiento

El autor publica metricas de divergencia KL frente al GGUF BF16 oficial de Liquid, calculadas sobre 167.320 tokens reservados de llamadas a herramientas, chat, razonamiento y texto crudo, con contexto de 2048.

| GGUF | Tamano | KLD media | Mediana | p99 | Top-1 coincidente | PPL |
|---|---|---|---|---|---|---|
| Liquid Q8_0 | 1,85 GB | 0,0028 | 0,0004 | 0,037 | 98,2% | 4,499 |
| Este repo, NVFP4 W4A8 (llama.cpp b12015 estandar) | 1,84 GB | 0,0425 | 0,0094 | 0,576 | 92,6% | 4,557 |
| Liquid NVFP4 (convertido), W4A8 | 1,84 GB | 0,0885 | 0,0181 | 1,415 | 90,1% | 4,543 |
| Liquid Q4_K_M | 1,10 GB | 0,1010 | 0,0233 | 1,491 | 89,2% | 4,537 |
| Liquid QAD-Q4_0 | 1,05 GB | 0,1052 | 0,0188 | 1,591 | 89,3% | 4,447 |

Segun el autor, esta version es 2,08 veces mas cercana al BF16 que la NVFP4 de Liquid convertida a GGUF y 2,38 veces mas cercana que Q4_K_M. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,84 GB solo para pesos; con overhead de contexto y runtime, un presupuesto practico de 2,5 a 3,5 GB es razonable, aunque no se especifica en la informacion.
- GPU recomendadas: no disponibles de forma explicita. El autor menciona soporte en el runtime CUDA 2.67.0 de LM Studio y builds de llama.cpp con backend CUDA; la etiqueta "blackwell" sugiere validacion en GPUs NVIDIA de esa generacion.
- Cabe en GPU de consumo: si, dado el tamano de 1,84 GB; cualquier GPU con 4 GB o mas de VRAM deberia poder cargarlo, aunque no se confirma en la informacion.
- Opciones de despliegue: llama.cpp (`llama-server -m LFM3-1.7B-SR-NVFP4.gguf --jinja -ngl 99`) y LM Studio (runtime CUDA 2.67.0 probado). No se mencionan vLLM, TGI ni Ollama para esta version GGUF; para vLLM/SGLang existe la variante en safetensors del mismo autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BennyDaBall/LFM3-1.7B-NVFP4-GGUF | 1,73 B | no disponible | GGUF NVFP4 W4A8 | LFM Open License v1.0 | KLD 0,0425; corre en llama.cpp estandar |
| LiquidAI/LFM3-1.7B-NVFP4 | 1,73 B | no disponible | safetensors ModelOpt NVFP4 | LFM Open License v1.0 | Requiere vLLM/SGLang; KLD 0,0885 al convertirse a GGUF |
| Liquid Q4_K_M (GGUF oficial) | 1,73 B | no disponible | GGUF Q4_K_M | LFM Open License v1.0 | 1,10 GB; KLD 0,1010; menor fidelidad pero mas compacto |
| Liquid Q8_0 (GGUF oficial) | 1,73 B | no disponible | GGUF Q8_0 | LFM Open License v1.0 | 1,85 GB; KLD 0,0028; referencia de alta fidelidad |

## Limitaciones y advertencias

- No es un modelo original: es una cuantizacion de terceros no afiliada ni respaldada por Liquid AI; el autor lo indica explicitamente.
- La cuantizacion NVFP4 W4A8 introduce una divergencia medible frente al BF16 (KLD media 0,0425, p99 0,576, top-1 coincidente 92,6%); no es adecuada para tareas que exijan maxima fidelidad al modelo original.
- El formato NVFP4 en llama.cpp tiene un fallo conocido en builds estandar (b12015-b12032) que afecta a conversiones directas de LFM3; esta version lo evita plegando las escalas, pero versiones futuras de llama.cpp podrian cambiar el comportamiento.
- Riesgo de alucinacion inherente a un modelo de 1,7 B parametros; no se han publicado evaluaciones especificas de sesgo o robustez en la informacion disponible.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue uniforme.
- Licencia LFM Open License v1.0: uso comercial gratuito solo si la entidad (y su grupo corporativo) factura menos de 10 millones de dolares anuales; por encima de ese umbral se requiere licencia de Liquid AI.
- Longitud de contexto no especificada en la informacion proporcionada; conviene verificarla en la model card del modelo base antes de disenar aplicaciones con contextos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente de las metricas publicadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BennyDaBall/LFM3-1.7B-NVFP4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- NVFP4 original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
- Variante safetensors del mismo autor (vLLM/SGLang): https://huggingface.co/BennyDaBall/LFM3-1.7B-NVFP4
- Liquid AI: https://www.liquid.ai/
- Paper GPTQ (Frantar et al., 2022): no disponible como enlace en la informacion
- Paper Four Over Six (Cook et al., arXiv 2512.02010): https://arxiv.org/abs/2512.02010
- Paper Schur Replay (arXiv 2609.36654): https://arxiv.org/abs/2609.36654
