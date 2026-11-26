# netprojects/Inkling-2-Mini-MLX-2bit-mixed

## Resumen

Inkling 2 Mini es un modelo de mezcla de expertos (MoE) desarrollado por Thinking Machines, con 26.400 millones de parametros totales y aproximadamente 3.400 millones activos por token. Su particularidad arquitectonica es un esquema "looped": de sus 24 capas, las doce centrales se ejecutan tres veces, lo que resulta en 48 pasadas de capa por token. Admite entrada de texto e imagen y una ventana de contexto de hasta 1 millon de tokens.

La ficha que nos ocupa, `netprojects/Inkling-2-Mini-MLX-2bit-mixed`, es una cuantizacion comunitaria del modelo base para Apple Silicon mediante MLX. Emplea cuantizacion afina estandar con una receta de precision mixta por capas: cada grupo de capas recibe su propio numero de bits y tamano de grupo, elegidos midiendo el impacto de cada opcion en la salida del modelo. El resultado pesa 9,5 GB (mas 0,64 GB del borrador de decodificacion especulativa DSpark) y esta pensado para Macs con 16 GB de memoria unificada.

Su relevancia actual es practica: permite ejecutar un MoE multimodal de 26.400 millones de parametros en hardware de consumo Apple, algo imposible con los pesos originales. El precio es una perdida medible de fidelidad respecto a la implementacion de referencia, con una coincidencia del 90,2 % en el siguiente token y una KL media de 0,1066.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas "looped" (24 capas, las 12 centrales se ejecutan 3 veces; 48 pasadas por token) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | ~3.400 millones por token |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | MLX affine con receta mixta por capas: expertos enrutados 2-3 bits (grupo 128), atencion 4-6 bits (grupo 64/128), embeddings 4 bits (grupo 128), capa de salida 4 bits (grupo 64), encoder de vision 2 bits (grupo 128) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), mas `mtp.safetensors` para el borrador DSpark |

## Arquitectura y entrenamiento

El modelo base es un MoE con atencion transformer convencional y un diseno de capas recurrentes ("inkling2_loop"): las doce capas intermedias se aplican de forma iterada tres veces, de modo que un token atraviesa 48 capas efectivas con solo 24 conjuntos de pesos. Esto reduce el coste de memoria a cambio de mas computo por token. El modelo combina un encoder de vision con el decodificador de texto, lo que le permite procesar entradas image-text-to-text.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La innovacion destacable de esta build concreta es doble: por un lado, la receta de cuantizacion mixta derivada de mediciones de sensibilidad por capa (documentada en `quant-recipe.json`); por otro, la inclusion del borrador de decodificacion especulativa DSpark, que acelera la generacion anadiendo 0,64 GB de memoria. Los expertos enrutados se recuantizaron a partir de sus valores originales en NVFP4 / MXFP8.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y matematicas: obtuvo 47/50 en GSM8K (50 preguntas) con esta cuantizacion.
- Comprension de imagenes (image-text-to-text): identifica colores y posiciones correctamente, aunque con menor exactitud por el encoder de vision a 2 bits.
- Tool calling / function calling en formato OpenAI, mediante el servidor `mlx_vlm.server` del fork `internet-projects/inkling2-mlx`.
- Decodificacion especulativa con borrador DSpark (`mtp.safetensors`), opcional.
- Contexto largo de hasta 1 millon de tokens (con requisitos de memoria elevados en la practica).
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente local en Mac de 16 GB: el modelo cabe en memoria unificada (9,5 GB de pesos) y permite conversaciones multi-turno sin conexion, con un pico de 9,34 GB en prompts cortos.
- Procesamiento de documentos e imagenes: al aceptar entrada image-text-to-text, sirve para extraer informacion de capturas, diagramas o formularios, aceptando la menor precision del encoder a 2 bits en detalles finos.
- Automatizacion con herramientas: el soporte de tool calls en formato OpenAI permite integrarlo en flujos de agentes que invocan APIs externas desde `mlx_vlm.server`.
- Razonamiento matematico de nivel basico-medio: con 47/50 en GSM8K, es adecuado para resolver problemas aritmeticos encadenados en entornos educativos o de prototipado.
- Analisis de contexto largo en local: con prompts de 4K-8K tokens y ajustando `prefill-step-size` a 128 y el limite de memoria GPU, puede resumir o consultar documentos extensos en hardware Apple.
- Prototipado e investigacion de cuantizacion: la receta mixta documentada y las metricas de fidelidad (coincidencia de token, KL) lo convierten en un banco de pruebas para estudiar el impacto de la cuantizacion agresiva en MoE.
- Desarrollo offline en portatiles Apple: integrable via MLX-VLM en scripts Python para generacion de texto e imagen sin depender de servicios en la nube.

## Benchmarks y rendimiento

Datos publicados por el autor de la build, comparados con otras cuantizaciones del mismo modelo y con la implementacion de referencia en Transformers de Thinking Machines:

| Build | Tamano | Mismo siguiente token que la referencia | KL vs referencia | GSM8K (50 preguntas) | Pico de memoria, prompt 8K |
|---|---|---|---|---|---|
| MLX-4-8bit (recomendada) | 19,5 GB + 0,64 GB | 98,4 % | 0,0018 | 47/50 | 27,8 GB |
| MLX-3bit | 14,1 GB + 0,64 GB | 95,5 % | 0,0424 | 48/50 | 21,2 GB |
| MLX-2.5bit | 10,8 GB + 0,64 GB | 91,0 % | 0,0656 | 46/50 | 18,25 GB |
| **MLX-2bit-mixed** | **9,5 GB + 0,64 GB** | **90,2 %** | **0,1066** | **47/50** | **17,05 GB** |
| MLX-4bit | 16,5 GB + 0,64 GB | 95,9 % | 0,0291 | 47/50 | 23,5 GB |

En la prueba de memoria con prompt de 4K tokens, el pico fue de 16,14 GB con los ajustes por defecto, y de 10,6 GB con `prefill-step-size` 128 y sin borrador DSpark. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 9,5 GB de pesos; pico de 9,34 GB con prompts cortos (GSM8K), 10,6 GB con prompt de 4K y ajustes reducidos, 16,14-17,05 GB con prompts de 4K-8K y ajustes por defecto.
- Hardware objetivo: Macs con 16 GB de memoria unificada (Apple Silicon). En un Mac de 16 GB, la GPU recibe unos 10,7 GB por defecto, por lo que es necesario subir el limite con `sudo sysctl iogpu.wired_limit_mb=12288` (deja unos 4 GB para macOS).
- GPU dedicadas (A100, H100, RTX 4090): no aplica; los pesos estan en formato MLX para Apple Silicon.
- Opciones de despliegue: MLX-VLM desde main (`pip install "git+https://github.com/Neywa-Labs/mlx-vlm"`) o el fork `internet-projects/inkling2-mlx` v0.2.7 para tool calls; CLI `mlx_vlm.generate` y servidor `mlx_vlm.server`.
- Latencia y throughput: no disponibles. Se recomienda `--prefill-step-size 128` para reducir el pico de memoria; el borrador DSpark anade 0,64 GB y acelera la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini (MLX 2bit mixed, esta build) | 26,4B totales / ~3,4B activos | 1M | Apache 2.0 | Hugging Face, MLX | 9,5 GB, para Mac de 16 GB, 90,2 % de coincidencia de token |
| Inkling-2-Mini (MLX 2.5bit) | 26,4B / ~3,4B | 1M | Apache 2.0 | Hugging Face, MLX | 10,8 GB, 91,0 % de coincidencia, KL 0,0656 |
| Inkling-2-Mini (MLX 4bit) | 26,4B / ~3,4B | 1M | Apache 2.0 | Hugging Face, MLX | 16,5 GB, 95,9 % de coincidencia, KL 0,0291 |
| Inkling-2-Mini (original, Transformers) | 26,4B / ~3,4B | 1M | Apache 2.0 | Hugging Face | Pesos de referencia NVFP4/MXFP8, requiere mas memoria |

No se dispone de datos sobre modelos de otros fabricantes comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de fidelidad notable: solo reproduce el siguiente token de la referencia en el 90,2 % de las posiciones, con KL media de 0,1066 (frente a 0,0018 de la build 4-8bit). Las respuestas codiciosas coinciden con las de referencia solo en 6, 10 y 5 de 24 tokens en las pruebas realizadas.
- Encoder de vision a 2 bits: la precision en tareas de imagen es menor; en la comprobacion visual el modelo confundio un circulo con un ovalo.
- Memoria: con prompts largos y ajustes por defecto el pico supera los 16 GB; requiere subir el limite de memoria GPU del sistema y reducir el `prefill-step-size`. El ajuste `iogpu.wired_limit_mb` se restablece al reiniciar.
- Contexto de 1M tokens nominal, pero inalcanzable en la practica en un Mac de 16 GB.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion agresiva puede incrementarlo.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar la fidelidad en el dominio concreto antes de produccion.
- Dependencia de MLX-VLM desde main (no en PyPI en el momento de la publicacion), lo que implica riesgo de cambios incompatibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2bit-mixed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build 2.5 bits: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2.5bit
- Build 3 bits: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-3bit
- Build 4 bits: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4bit
- Build 4-8 bits (recomendada): https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Fork con soporte de tool calls: https://github.com/internet-projects/inkling2-mlx
- MLX-VLM: https://github.com/Neywa-Labs/mlx-vlm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
