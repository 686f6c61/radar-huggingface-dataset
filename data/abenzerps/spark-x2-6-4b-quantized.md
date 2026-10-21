# abenzerps/Spark-X2.6-4B-Quantized

## Resumen

Spark-X2.6-4B-Quantized es un repositorio de cuantizaciones publicado por el usuario abenzerps a partir del modelo base XHToken/Spark-X2.6-4B, un modelo de lenguaje de 4.112.079.360 parámetros (aproximadamente 4,1B) desarrollado por XHToken. El repositorio no contiene pesos originales, sino conversiones a GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0) y a safetensors en FP8 y NVFP4, pensadas para ejecución local, flujos de agentes y razonamiento en dispositivos con recursos limitados.

El modelo base se presenta como un modelo ligero optimizado para agentes on-device, generación de código y uso de herramientas, con un diseño de atención híbrida y una ventana de contexto de hasta 1.000.000 de tokens según el autor, además de presupuestos de pensamiento controlables (`low` / `high`). La model card afirma que iguala o supera a modelos de 9B-12B en benchmarks estándar de agentes y código, aunque no se transcriben cifras numéricas en el texto disponible.

Su relevancia práctica reside en la combinación de tamaño reducido, licencia Apache 2.0, soporte para llama.cpp/Ollama y variantes FP8/NVFP4 para GPUs NVIDIA, lo que facilita su integración en prototipos y despliegues locales sin depender de infraestructura en la nube. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria independiente documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Spark2_5ForCausalLM` (arquitectura GGUF `spark2_5`); atención híbrida según el autor |
| Parametros totales | 4.112.079.360 (aproximadamente 4,1B) |
| Parametros activos | No aplica; no se describe como modelo MoE en la información disponible |
| Longitud de contexto | Hasta 1.000.000 de tokens según el autor para el modelo base; los ejemplos de uso emplean `-c 8192` |
| Tipos de cuantizacion | GGUF: BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0. Safetensors: FP8 (torch.float8_e4m3fn con escalas por tensor) y NVFP4 (4 bits empaquetado con escalas por bloque) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura declarada es `Spark2_5ForCausalLM`, correspondiente a la arquitectura GGUF `spark2_5`. El autor describe un diseño de atención híbrida con ventana de contexto de hasta 1M de tokens y un mecanismo de presupuesto de pensamiento controlable con dos niveles (`low` y `high`), orientado a equilibrar latencia y profundidad de razonamiento. No se detallan en la información disponible el número de capas, dimensiones ocultas, número de cabezas de atención, vocabulario ni la composición exacta del mecanismo híbrido.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras optimizaciones de alineamiento. La model card únicamente indica que el modelo está optimizado para agentes, código y uso de herramientas, y que el proceso de conversión y cuantización se realizó con llama.cpp y comfy-kitchen. No hay información publicada sobre decodificación especulativa, atención lineal ni otras innovaciones de inferencia más allá de la atención híbrida y los presupuestos de pensamiento.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat basada en tokens especiales `<｜start▁of▁sentence｜>`, `<|User|>`, `<|Bot|>` y `<｜end▁of▁sentence｜>`.
- Razonamiento con modo de pensamiento (`<think>`) y presupuestos configurables `low` / `high` según el autor.
- Generación de código y tareas de programación, según la orientación declarada del modelo base.
- Soporte de agentes y flujos multi-paso, incluyendo uso de herramientas, de acuerdo con la descripción del autor.
- Compatibilidad con endpoints OpenAI (`/v1/chat/completions`) mediante `llama-server`, lo que facilita el function calling en pipelines existentes.
- Capacidades multilingües limitadas a inglés y chino.
- Ejecución local en CPU/GPU mediante GGUF y en GPUs NVIDIA mediante FP8/NVFP4.
- No se documentan capacidades de visión, audio, vídeo ni multimodalidad.

## Casos de uso

- Agentes locales en dispositivo: con la variante Q4_K_M (2,47 GB), el modelo puede ejecutarse en un portátil o mini-PC para tareas de automatización personal, clasificación de correos o asistentes de escritorio, manteniendo los datos en local.
- Servidor compatible con OpenAI para prototipado: `llama-server` expone `/v1/chat/completions` en el puerto 8080, de modo que un equipo puede probar un agente o un frontend tipo ChatGPT sin cambiar el cliente HTTP ni depender de una API externa.
- Asistente de código integrado en el IDE o en CI/CD: el modelo puede recibir contexto de un repositorio, generar parches y emitir llamadas a herramientas para ejecutar tests o consultar documentación, aprovechando el soporte de tool calling descrito por el autor.
- Distribución vía Ollama: el `Modelfile` incluido permite publicar una imagen local (`ollama create spark-x2.6 -f Modelfile`) y que el equipo de desarrollo arranque el modelo con un solo comando, con temperatura 0,6 y tokens de parada preconfigurados.
- Procesamiento de documentos largos: la ventana de hasta 1M de tokens permitiría resumir o consultar expedientes extensos, aunque en la práctica requiere técnicas de offload o cuantización de la caché KV que no se documentan en el repositorio.
- Inferencia acelerada en NVIDIA: las variantes FP8 (4,14 GB) y NVFP4 (2,60 GB) están pensadas para pipelines con Tensor Cores, como vLLM o comfy-kitchen, y reducen el uso de VRAM frente a BF16 (7,66 GB).
- Chat multi-turno embebido: con `llama-cli -cnv -c 8192 -n 512 --temp 0.6 -t 8` se puede desplegar un asistente de terminal para soporte técnico o consultas internas con requisitos mínimos de hardware.
- Clasificación y enrutamiento de baja latencia: usando el presupuesto de pensamiento `low`, el modelo puede etiquetar tickets, enrutar consultas o extraer entidades en lote sobre CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una imagen (`assets/benchmark.png`) y afirma que el modelo "iguala o supera a modelos de 9B-12B" en benchmarks estándar de agentes y código, pero no se transcriben valores de MMLU, HumanEval, GSM8K, BFCL ni de ninguna otra prueba, ni se especifican los modelos de comparación.

| Benchmark | Spark-X2.6-4B | Referencia 9B-12B | Observaciones |
|---|---|---|---|
| MMLU | No disponible | No disponible | Sin cifras en la model card |
| HumanEval | No disponible | No disponible | Sin cifras en la model card |
| GSM8K | No disponible | No disponible | Sin cifras en la model card |
| Benchmarks de agentes | No disponible | No disponible | El autor afirma paridad o mejora, sin datos |

## Requisitos de hardware

Las estimaciones de VRAM siguientes se derivan del tamaño de los ficheros de pesos y añaden un margen para overhead de inferencia; no incluyen la caché KV, cuyo tamaño no se puede calcular porque no se publican el número de capas ni de cabezas.

| Cuantizacion | Tamano de pesos | VRAM estimada (contexto corto) |
|---|---:|---:|
| NVFP4 | 2,60 GB | 3,5-4,5 GB |
| Q4_0 | 2,24 GB | 3,0-4,0 GB |
| Q4_K_M | 2,47 GB | 3,5-4,5 GB |
| Q5_K_M | 2,80 GB | 4,0-5,0 GB |
| Q6_K | 3,20 GB | 4,5-5,5 GB |
| Q8_0 / FP8 | 4,10-4,14 GB | 5,5-7,0 GB |
| BF16 | 7,66 GB | 9,0-11,0 GB |

- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 con las variantes Q4_K_M, Q5_K_M, Q6_K y Q8_0; en GPUs de 8 GB conviene usar Q4_K_M o Q4_0.
- GPU de centro de datos: A100 y H100 para FP8 y BF16; NVFP4 requiere hardware NVIDIA con soporte de FP4, extremo que la model card no detalla.
- El contexto de 1M de tokens no es viable en hardware de consumo sin cuantización de la caché KV, offload a CPU o técnicas de atención eficiente; el repositorio no documenta ninguna de estas opciones.
- Opciones de despliegue: llama.cpp y `llama-server` (endpoints OpenAI), Ollama, vLLM (mencionado por el autor junto a comfy-kitchen) y carga directa de safetensors con PyTorch.
- No se publican datos de latencia ni de throughput (tokens por segundo) para ninguna configuración de hardware.

## Comparativa con modelos similares

La model card no identifica los modelos de 9B-12B con los que dice compararse, ni aporta cifras de terceros, por lo que no es posible construir una comparativa verificada con datos de la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---:|---|---|---|---|
| Spark-X2.6-4B | 4,11B | Hasta 1M (según autor) | Apache 2.0 | Sin cifras publicadas | GGUF, FP8, NVFP4 |
| Modelos de 9B-12B citados por el autor | No disponible | No disponible | No disponible | Afirmación de paridad sin datos | No disponible |
| Alternativas de ~4B de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no se declara soporte de español ni de otras lenguas, por lo que el rendimiento en castellano no está garantizado.
- Tamaño: con 4,1B de parámetros, la capacidad de razonamiento profundo, matemáticas complejas y conocimiento factual es inferior a la de modelos de mayor escala; la afirmación de paridad con modelos de 9B-12B no está respaldada con cifras en la información disponible.
- Alucinación: no se documentan evaluaciones de fidelidad ni de tasa de alucinación; en tareas de recuperación o resumen conviene añadir verificación externa.
- Contexto largo: la ventana de 1M de tokens es una afirmación del autor para el modelo base; no se especifica cómo se comporta la calidad en contextos muy extensos ni el coste de memoria asociado.
- Cuantización: las variantes Q4_0, Q4_K_M y NVFP4 pueden degradar la calidad respecto a BF16; el autor recomienda Q4_K_M como equilibrio, pero no publica evaluaciones comparativas entre cuantizaciones.
- Licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia; no se incluyen cláusulas de uso aceptable adicionales.
- Validación: el repositorio registra 0 descargas y 1 like, sin issues ni discusiones públicas; no hay evidencia independiente de calidad ni de estabilidad de las conversiones.
- Plantilla de chat: el `Modelfile` de Ollama usa tokens especiales con caracteres Unicode poco habituales; un error de copia puede romper el formato de conversación y degradar las respuestas.
- Modo de pensamiento: el uso de `<think>` y de presupuestos `low`/`high` no está documentado en detalle; puede aumentar el consumo de tokens y la latencia si no se controla.
- Seguridad: no se documentan procesos de alineamiento, filtros de seguridad ni evaluaciones de sesgo; no se recomienda su despliegue directo en producción orientada a usuarios finales sin una capa de moderación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abenzerps/Spark-X2.6-4B-Quantized
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Autor del modelo base: https://huggingface.co/XHToken
- Checksums SHA256: https://huggingface.co/abenzerps/Spark-X2.6-4B-Quantized/blob/main/SHA256SUMS
- Imagen de benchmarks: https://huggingface.co/abenzerps/Spark-X2.6-4B-Quantized/blob/main/assets/benchmark.png
- llama.cpp: https://github.com/ggml-org/llama.cpp
- comfy-kitchen: https://github.com/comfyanonymous/comfy-kitchen
- Solicitud de modelos del autor: https://abenzerps.com/request-a-model/
