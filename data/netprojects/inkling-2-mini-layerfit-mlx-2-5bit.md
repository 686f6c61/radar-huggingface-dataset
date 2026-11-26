# netprojects/Inkling-2-Mini-LayerFit-MLX-2.5bit

## Resumen

Inkling-2-Mini-LayerFit-MLX-2.5bit es una cuantizacion de 2,5 bits del modelo multimodal thinkingmachines/Inkling-2-Mini, preparada por el usuario netprojects para su ejecucion en Apple Silicon mediante la libreria MLX. El modelo base es un mixture-of-experts con 26.388.641.280 parametros totales (unos 26,4B), de los cuales aproximadamente 3,4B estan activos por token, disenado por Thinking Machines para entrada de texto e imagen con hasta 1M de tokens de contexto. Esta version concreta emplea una receta de cuantizacion por capas denominada LayerFit, que asigna distintos bits y tamanos de grupo a cada bloque para minimizar la perdida de fidelidad respecto al modelo original.

La relevancia de esta ficha radica en que permite ejecutar un MoE multimodal de 26B en equipos con 24 GB de memoria unificada, algo impensable con los pesos originales. El paquete ocupa 10,8 GB e incluye ademas el borrador de decodificacion especulativa DSpark (0,64 GB) y el codificador de vision cuantizado a 2 bits. La licencia Apache 2.0 facilita su uso comercial, aunque con las cautelas propias de una cuantizacion tan agresiva.

El modelo conserva el mismo siguiente token que la implementacion de referencia de Thinking Machines en el 91,0% de los casos, con una divergencia KL media de 0,0656 frente al codigo original. Estos datos, publicados por el autor en la model card, permiten situar la perdida de calidad de forma objetiva antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con capas "looped": 24 capas, las doce centrales se ejecutan tres veces (48 pasadas de capa por token); incluye codificador de vision |
| Parametros totales | 26.388.641.280 (26,4B) |
| Parametros activos | Aproximadamente 3,4B por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | MLX affine con receta LayerFit por capas: expertos enrutados a 3 bits (grupo 128) en capas 0-17 y 20-23, con proyecciones gate de la capa 14 a 2 bits; capas 18-19 a 2 bits (grupo 128) con down projections a 3 bits; atencion a 6 bits (grupo 64) en capas 6-8 y 12, 5 bits (grupo 64) en el resto de 0-17 y 4 bits (grupo 128) en 18-23; embeddings a 3 bits (grupo 128); capa de salida a 4 bits (grupo 64); codificador de vision a 2 bits (grupo 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye mtp.safetensors para el borrador especulativo |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de tipo mixture-of-experts con una innovacion estructural: las doce capas centrales de sus 24 capas se ejecutan tres veces por token, lo que eleva el computo efectivo a 48 pasadas de capa sin aumentar el numero de parametros. De los 26,4B totales, solo unos 3,4B se activan por token gracias al enrutamiento de expertos, lo que reduce el coste de inferencia. Incorpora ademas un codificador de vision que permite la entrada image-text-to-text, y un cabezal de decodificacion especulativa DSpark empaquetado como mtp.safetensors.

Sobre el entrenamiento del modelo base no se dispone de informacion detallada en los materiales proporcionados: no se especifican el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si documenta el autor de la cuantizacion es el proceso de compresion: los expertos enrutados se recuantizaron desde sus valores originales NVFP4/MXFP8, y la receta LayerFit se obtuvo midiendo el impacto de cada eleccion de bits por capa y buscando la configuracion que minimizara la divergencia respecto al modelo original a un tamano fijo. El resultado es un artefacto MLX estandar que carga en mlx-vlm sin runtime personalizado.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventanas de hasta 1M de tokens.
- Entrada multimodal image-text-to-text mediante codificador de vision integrado (cuantizado a 2 bits en esta version).
- Razonamiento matematico y resolucion de problemas, con un rendimiento medido de 46/50 en GSM8K para esta build.
- Soporte de tool calling / function calling en formato OpenAI a traves del cliente inkling2-mlx.
- Decodificacion especulativa DSpark incluida, que acelera la generacion al proponer tokens con un borrador y validarlos con el modelo principal.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento extendido (thinking): no confirmado en los materiales disponibles.

## Casos de uso

- Asistente local en Mac con 24 GB de memoria unificada: el paquete de 10,8 GB deja margen para macOS y prompts largos, permitiendo un chatbot privado sin conexion con contexto de hasta 1M tokens.
- Analisis de documentos extensos: gracias a la ventana de 1M tokens, se pueden procesar informes, contratos o bases de codigo completas en una sola pasada sin trocear el contexto.
- Procesamiento de imagenes y capturas: el codificador de vision permite extraer texto de capturas, describir diagramas o responder preguntas sobre imagenes, con la cautela de que a 2 bits la precision en detalles finos (formas, colores exactos) se degrada.
- Automatizacion de tareas con agentes: el soporte de tool calling en formato OpenAI permite integrar el modelo en flujos que consultan APIs, ejecutan comandos o encadenan pasos multi-step.
- Prototipado de pipelines multimodales en investigacion: al ser una build MLX estandar, se puede cargar en mlx-vlm y comparar directamente con el modelo original para estudiar el impacto de la cuantizacion.
- Generacion asistida de codigo en local: util para autocompletado y explicacion de fragmentos en entornos sin GPU dedicada, aunque con menor fidelidad que las builds de 3 o 4 bits.
- Evaluacion de tecnicas de compresion: la receta por capas documentada en quant-recipe.json sirve como referencia para experimentos de cuantizacion mixta en otros MoE.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantizacion (comparados contra la implementacion de referencia de Thinking Machines en los pesos originales):

| Metrica | Este build (2.5-bit) | Build 2-bit | Build 3-bit | Build 4-bit | Build 4/8-bit (recomendada) |
|---|---|---|---|---|---|
| Mismo siguiente token que el codigo original | 91,0% | 90,2% | 95,5% | 97,7% | 98,4% |
| KL vs codigo original | 0,0656 | 0,1066 | 0,0225 | 0,0101 | 0,0018 |
| GSM8K (50 preguntas) | 46/50 | 47/50 | 45/50 | 46/50 | 47/50 |
| Memoria pico con prompt de 8K tokens | 18,25 GB | 17,05 GB | 21,4 GB | 23,6 GB | 27,8 GB |
| Tamano | 10,8 GB + 0,64 GB borrador | 9,5 GB + 0,64 GB | 14,1 GB + 0,64 GB | 16,5 GB + 0,64 GB | 19,5 GB + 0,64 GB |

Comparacion interna de la receta LayerFit frente a la cuantizacion plana de 2,5 bits al mismo tamano (10,8 GB):

| Variante | Mismo siguiente token | KL vs codigo original |
|---|---|---|
| Plana 2,5 bits | 87,5% | 0,1899 |
| LayerFit 2,5 bits (este build) | 91,0% | 0,0656 (65% menor) |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 18,25 GB de pico con un prompt de 8K tokens; el paquete en disco ocupa 10,8 GB mas 0,64 GB del borrador.
- Equipo objetivo: Mac con 24 GB de memoria unificada segun la guia del autor; en 16 GB solo como build "stretch" (existe una variante de 2 bits de 9,5 GB para ese caso).
- GPU recomendadas: Apple Silicon con memoria unificada (M-series); no esta pensado para GPU NVIDIA, ya que el formato es MLX.
- Cabe en GPU consumer: si, en Macs de 24 GB o mas; para 16 GB se recomienda la build de 2 bits y limitar los prompts a unos miles de tokens.
- Ajuste opcional en macOS: `sudo sysctl iogpu.wired_limit_mb=12800` para permitir que la GPU use mas memoria (se revierte al reiniciar).
- Opciones de despliegue: mlx-vlm (version main o siguiente release), cliente inkling2-mlx para tool calls en formato OpenAI; no aplica vLLM, llama.cpp, Ollama ni TGI por ser pesos MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada, mas alla de la aceleracion que aporta la decodificacion especulativa DSpark incluida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-LayerFit-MLX-2.5bit (este) | 26,4B totales, ~3,4B activos | 1M tokens | MLX, Apple Silicon | Apache 2.0 | 91,0% mismo token, KL 0,0656, 10,8 GB |
| Inkling-2-Mini-MLX-4-8bit (misma familia) | 26,4B totales, ~3,4B activos | 1M tokens | MLX, Apple Silicon | Apache 2.0 | 98,4% mismo token, KL 0,0018, 19,5 GB; recomendada para 48 GB o mas |
| Inkling-2-Mini-LayerFit-MLX-3bit (misma familia) | 26,4B totales, ~3,4B activos | 1M tokens | MLX, Apple Silicon | Apache 2.0 | 95,5% mismo token, KL 0,0225, 14,1 GB; equilibrio para 32 GB |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B totales, ~3,4B activos | 1M tokens | safetensors, Transformers | no disponible en la informacion | Referencia de calidad; requiere mucha mas memoria |

No se dispone de datos de benchmarks ni especificaciones de modelos de otros fabricantes para una comparativa cruzada en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2,5 bits introduce divergencia respecto al original: solo el 91,0% de los siguientes tokens coinciden con la implementacion de referencia y la KL media es de 0,0656, superior a las builds de 3 y 4 bits.
- El codificador de vision esta a 2 bits, por lo que las respuestas sobre imagenes son menos exactas: en la comprobacion del autor el modelo acerto colores y posiciones pero confundio un circulo con un ovalo.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la compresion agresiva en capas concretas (expertos de las capas 18-19 a 2 bits).
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue equivalente al del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del artefacto cuantizado en produccion.
- Requiere hardware Apple Silicon y la libreria MLX; no es portable a CUDA sin reconvertir los pesos.
- En Macs de 16 GB solo es viable como build "stretch" con prompts cortos y cierre de otras aplicaciones; el rendimiento puede degradarse con contextos largos.
- Los ficheros del repositorio fueron reemplazados el 22 de noviembre de 2026 por una nueva build de 2,5 bits; conviene verificar la revision descargada si se compara con resultados anteriores.
- No se han publicado datos de sesgos, evaluaciones de seguridad ni limites de contexto efectivos mas alla del maximo teorico de 1M tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-2.5bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build de 2 bits para 16 GB: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-2bit
- Build de 3 bits: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-4bit
- Build recomendada 4/8 bits: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Otros modelos del autor: https://huggingface.co/netprojects
- Cliente inkling2-mlx (tool calls): https://github.com/internet-projects/inkling2-mlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
