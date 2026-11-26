# netprojects/Inkling-2-Mini-LayerFit-MLX-3bit

## Resumen

Inkling 2 Mini es un modelo de mezcla de expertos (MoE) desarrollado por Thinking Machines, con 26.400 millones de parametros totales y aproximadamente 3.400 millones activos por token. Su rasgo arquitectonico mas distintivo es el bucle de capas: de sus 24 capas, las doce centrales se ejecutan tres veces, lo que resulta en 48 pasadas de capa por token. Admite entrada de texto e imagen y una ventana de contexto de hasta 1 millon de tokens.

Esta ficha describe la cuantizacion `netprojects/Inkling-2-Mini-LayerFit-MLX-3bit`, una build de 3 bits para Apple Silicon generada con MLX mediante la receta LayerFit del autor NetProjects. El paquete pesa 14,1 GB e incluye el borrador de decodificacion especulativa DSpark (`mtp.safetensors`, 0,64 GB) y el codificador de vision en 4 bits. Va dirigida a Macs de 32 GB de memoria unificada, con una alternativa para 24 GB.

La relevancia de esta build radica en que, a igual tamano que la cuantizacion estandar de 3 bits (14,1 GB), reduce la divergencia media respecto a la implementacion de referencia de Thinking Machines de una KL de 0,0424 a 0,0225, es decir, un 47 % menos, manteniendo un 95,5 % de coincidencia en el siguiente token. Emplea cuantizacion afin estandar de MLX, por lo que carga en mlx-vlm sin runtime personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas (inkling2_loop), vision encoder y decodificacion especulativa DSpark |
| Parametros totales | 26.388.641.280 (26,4 B) |
| Parametros activos | Aproximadamente 3,4 B por token |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | 3 bits LayerFit (receta por capas: expertos 4/3 bits, atencion 8/5/6 bits, embeddings y salida 5 bits, vision 4 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) + `mtp.safetensors` (borrador DSpark) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 24 capas, de las cuales las doce centrales se repiten tres veces, lo que da 48 pasadas de capa por token. Los expertos enrutados se distribuyen con unos 3,4 B de parametros activos por token sobre 26,4 B totales. Incorpora un codificador de vision para entrada image-text-to-text y un cabezal de decodificacion especulativa DSpark empaquetado como modelo borrador independiente (`mtp.safetensors`).

Esta build concreta no reentrena el modelo: recuantiza los pesos liberados por Thinking Machines, originalmente en NVFP4 y MXFP8, a cuantizacion afin de MLX con una receta por capas obtenida mediante busqueda LayerFit. Los expertos enrutados quedan en 4 bits (grupo 64) en las capas 0-17, salvo las proyecciones gate y down de la capa 14 y la proyeccion up de la capa 15, que van en 3 bits (grupo 64); en las capas 18-23 los expertos van en 3 bits (grupo 128). La atencion usa 8 bits (grupo 64) en las capas 6, 8 y 12, 5 bits en las capas 19-22 y 6 bits en el resto. Embeddings y capa de salida van en 5 bits y el codificador de vision en 4 bits. La receta completa esta en `quant-recipe.json`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Entrada de imagen junto con texto (pipeline image-text-to-text) mediante el codificador de vision incluido.
- Procesamiento de contexto muy largo, hasta 1 millon de tokens.
- Tool calling con formato OpenAI a traves de la libreria `inkling2-mlx`.
- Decodificacion especulativa con el borrador DSpark empaquetado, que acelera la generacion.
- Compatibilidad con mlx-vlm estandar (rama main y proxima release).
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente local en Mac: ejecutar un modelo de 26,4 B con contexto de hasta 1 M de tokens en un Mac de 32 GB, sin conexion a servicios externos, gracias a los 14,1 GB de la build de 3 bits.
- Analisis de documentos largos: resumir o extraer informacion de contratos, informes o bases de codigo extensas aprovechando la ventana de contexto de hasta 1 millon de tokens.
- Comprension de imagenes en local: describir capturas, diagramas o documentos escaneados combinando el codificador de vision en 4 bits con la generacion de texto.
- Agentes con herramientas: integrar el modelo en flujos que requieran function calling en formato OpenAI mediante `inkling2-mlx`, por ejemplo para consultar APIs o automatizar tareas de escritorio.
- Prototipado de aplicaciones conversacionales en Apple Silicon: usar mlx-vlm estandar para iterar rapidamente sobre un Mac antes de desplegar en infraestructura mayor.
- Generacion asistida con baja latencia: emplear el borrador DSpark para acelerar la decodificacion en tareas interactivas donde la velocidad de respuesta importa.
- Evaluacion de cuantizaciones: servir como referencia para comparar fidelidad frente a la implementacion original de Thinking Machines usando las metricas KL y coincidencia de siguiente token publicadas.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantizacion (no son benchmarks del modelo base frente a otros modelos, sino medidas de fidelidad frente a la implementacion de referencia de Thinking Machines):

| Build | Tamano | Mismo siguiente token que el codigo de Thinking Machines | KL vs su codigo | GSM8K (50 preguntas) | Memoria pico, prompt de 8K tokens |
|---|---|---|---|---|---|
| MLX-4-8bit (recomendada) | 19,5 GB + 0,64 GB borrador | 98,4 % | 0,0018 | 47/50 | 27,8 GB |
| LayerFit 3bit (esta build) | 14,1 GB + 0,64 GB borrador | 95,5 % | 0,0225 | 45/50 | 21,4 GB |
| LayerFit 2.5bit | 10,8 GB + 0,64 GB borrador | 91,0 % | 0,0656 | 46/50 | 18,25 GB |
| LayerFit 2bit | 9,5 GB + 0,64 GB borrador | 90,2 % | 0,1066 | 47/50 | 17,05 GB |
| LayerFit 4bit | 16,5 GB + 0,64 GB borrador | 97,7 % | 0,0101 | 46/50 | 23,6 GB |

Comparacion a igual tamano (14,1 GB):

| Build | Mismo siguiente token | KL vs su codigo |
|---|---|---|
| 3 bits estandar, 14,1 GB | 95,5 % | 0,0424 |
| LayerFit 3 bits, 14,1 GB (esta build) | 95,5 % | 0,0225 (47 % menos) |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria: build pensada para Macs de 32 GB de memoria unificada; el autor indica que la descarga debe ocupar como maximo en torno al 60 % de la memoria del sistema.
- Memoria pico medida: 21,4 GB con un prompt de 8.000 tokens.
- Macs de 24 GB: usar la build LayerFit de 2,5 bits (10,8 GB); para 16 GB existe la de 2 bits (9,5 GB).
- Macs de 48 GB o mas: el autor recomienda la build 4/8 bits (19,5 GB).
- GPU dedicadas (A100, H100, RTX 4090): no disponible; esta build esta pensada exclusivamente para Apple Silicon con MLX.
- Despliegue: mlx-vlm estandar (rama main y proxima release) y la libreria `inkling2-mlx` para tool calling en formato OpenAI.
- Ajuste opcional de memoria GPU: `sudo sysctl iogpu.wired_limit_mb=12800` para builds ajustadas (se pierde al reiniciar).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini LayerFit MLX 3bit (esta build) | 26,4 B totales, ~3,4 B activos | Hasta 1 M tokens | Safetensors MLX, Apple Silicon | Apache 2.0 | 14,1 GB + 0,64 GB borrador; GSM8K 45/50; KL 0,0225 |
| Inkling 2 Mini MLX 4-8bit (NetProjects) | 26,4 B totales, ~3,4 B activos | Hasta 1 M tokens | Safetensors MLX, Apple Silicon | Apache 2.0 | 19,5 GB + 0,64 GB; GSM8K 47/50; KL 0,0018; recomendada para 48 GB o mas |
| Inkling 2 Mini LayerFit MLX 2bit (NetProjects) | 26,4 B totales, ~3,4 B activos | Hasta 1 M tokens | Safetensors MLX, Apple Silicon | Apache 2.0 | 9,5 GB + 0,64 GB; GSM8K 47/50; KL 0,1066; para Macs de 16 GB |
| Qwen3.8-27B LayerFit MLX 4bit (NetProjects) | No disponible | No disponible | Safetensors MLX, Apple Silicon | No disponible | Mencionado por el autor como otra build LayerFit; sin datos de rendimiento en la informacion disponible |

No se dispone de datos de benchmarks del modelo base que permitan comparar su rendimiento con modelos de otros autores.

## Limitaciones y advertencias

- La cuantizacion de 3 bits introduce perdida de fidelidad: un 95,5 % de coincidencia en el siguiente token y una KL de 0,0225 frente a la implementacion de referencia; el GSM8K baja a 45/50 frente a 47/50 de la build 4/8 bits.
- Las metricas de fidelidad y GSM8K las publica el autor de la cuantizacion; no se han verificado de forma independiente en la informacion disponible.
- Sesgos conocidos del modelo base: no disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de los modelos generativos.
- Idiomas soportados: no disponible; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `thinkingmachines/Inkling-2-Mini`.
- Esta build solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a otros runtimes sin reconversion.
- En Macs de 32 GB el margen de memoria es limitado: con prompts largos puede requerir cerrar otras aplicaciones o ajustar el limite de memoria cableada de la GPU.
- La build fue reemplazada el 26 de noviembre de 2026 (antes se llamaba `netprojects/Inkling-2-Mini-MLX-3bit`); verificar la revision al reproducir resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build LayerFit 4 bits: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-4bit
- Build LayerFit 2.5 bits: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-2.5bit
- Build LayerFit 2 bits: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-2bit
- Build 4/8 bits recomendada: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Build Qwen3.8-27B LayerFit: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-4bit
- Repositorio de builds del autor: https://huggingface.co/netprojects
- Libreria de tool calling: https://github.com/internet-projects/inkling2-mlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
