# jarrelscy/Inkling-2-Mini-NestQuant-1.75-4bit

## Resumen

Inkling-2-Mini-NestQuant-1.75-4bit es una codificación cuantizada de los expertos enrutados del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario jarrelscy. Se trata de un artefacto de cuantización, no de un modelo entrenado desde cero: aplica el esquema propietario NestQuant sobre los pesos de los expertos del modelo base, manteniendo el resto de componentes (atención, embeddings, codificador de visión y cabeza MTP) en el repositorio original. El modelo base es un transformer de mezcla de expertos (MoE) con 26.400 millones de parámetros totales, 3.400 millones activos, 24 capas, 128 expertos y enrutamiento top-8, donde las capas 6 a 17 se ejecutan tres veces por token.

La propuesta central es de eficiencia de memoria: cada experto almacena dos niveles anidados en una sola codificación, un nivel base L2 a 1,76 bits por peso (5,4 GB para los 3.072 expertos) y un nivel L4 con residual a 4,13 bits (12,6 GB). En tiempo de servicio todos los expertos residen en L2 y un conjunto de expertos "calientes" por capa se promociona a L4. El objetivo declarado es servir el modelo en una única GPU de 12 GB con una ventana de contexto de 131.072 tokens y caché KV en FP8.

Es relevante ahora porque demuestra una vía práctica para desplegar un MoE de 26B en hardware de consumo, con un plan de memoria detallado y métricas de divergencia (KLD) frente al modelo nativo. No obstante, el repositorio solo contiene los expertos cuantizados, no publica kernel de servicio y requiere combinar los pesos con el checkpoint original, lo que limita su uso inmediato en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capas en bucle; 24 capas, 128 expertos, top-8 |
| Parametros totales | 26,4 B (modelo base) |
| Parametros activos | 3,4 B (modelo base) |
| Longitud de contexto | 131.072 tokens (objetivo de servicio declarado) |
| Tipos de cuantizacion | NestQuant anidado: L2 a 1,76 bits/peso; L4 a 4,13 bits/peso (gate/up 4,04, down 4,35) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con contenedor `nestquant-v1-tp-safetensors`; claves de tensor `E{e}.{proj}.{plane}`, estructura en metadatos `tree` |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de mezcla de expertos con 24 capas, 128 expertos por capa y enrutamiento top-8, con 26,4 B de parámetros totales y 3,4 B activos. Una particularidad estructural es que las capas 6 a 17 se ejecutan tres veces por token (capas en bucle), lo que afecta tanto al coste de cómputo como a la calibración de la cuantización. El checkpoint nativo almacena los expertos en NVFP4 en las capas 0-19 y en MXFP8 en las 20-23.

La codificación NestQuant no reentrena el modelo: calibra los expertos sobre aproximadamente 4 millones de tokens de texto (chat, código, razonamiento y transcripciones de agentes, en la plantilla de chat de Inkling) y 1.200 imágenes (radiología, capturas web, COCO y documentos sintéticos) a 640 px y 256 tokens por imagen. La ponderación del error por experto es 75 % texto y 25 % imagen, y las capas en bucle se calibran con las entradas de las tres pasadas. Cada experto guarda en una sola codificación un nivel base L2 y un residual que permite reconstruir el nivel L4; en servicio, un predictor de conjunto caliente (`serving/predictor/`) elige cada 16 tokens qué 56 expertos por capa se promocionan a L4. No se documenta RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base, con enrutamiento MoE top-8 sobre 128 expertos.
- Capacidades multimodales: el modelo base incluye un codificador de visión (las imágenes se calibran a 256 tokens por imagen), aunque en el plan de memoria de 12 GB el codificador de visión queda fuera de la GPU.
- Cabeza MTP (multi-token prediction) presente en el modelo base, aunque excluida del plan de memoria de 12 GB.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada, más allá de que la calibración incluye transcripciones de agentes.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Despliegue de un MoE de 26B en una GPU de consumo de 12 GB: el plan de memoria documentado (expertos L2 5,39 GB, atención y proyección de salida FP8 0,93 GB, caché KV FP8 2,15 GB, ventana deslizante 0,08 GB, routers y normas ~0,55 GB, residuales L4 de 56 expertos calientes 3,17 GB) suma ~12,3 GB, lo que permite servir el modelo en tarjetas como la RTX 3060 de 12 GB o la RTX 4070 Ti.
- Contexto largo en hardware limitado: con 131.072 tokens y caché KV en FP8 el modelo cabe en el presupuesto de 12 GB; útil para análisis de documentos extensos, resúmenes de repositorios o conversaciones multi-turno largas.
- Investigación en cuantización extrema: el par de niveles anidados L2/L4 y el predictor de conjunto caliente son un banco de pruebas para estudiar el compromiso entre bits por peso y divergencia KL en MoE.
- Evaluación de pipelines de cuantización MoE: los manifiestos por capa con tasas y sha256 permiten reproducir y auditar la codificación, útil en entornos de investigación que comparan esquemas de cuantización.
- Prototipado de asistentes multimodales con presupuesto de VRAM ajustado: el modelo base acepta imágenes, aunque el codificador de visión debe ubicarse fuera de la GPU en el plan de 12 GB.
- Servicio con conjunto caliente dinámico: el predictor elige 56 expertos por capa cada 16 tokens; sirve para experimentar con políticas de caché de expertos y medir su impacto en latencia y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta divergencia KL frente al modelo nativo (top-64 log-probabilidades más masa de cola, teacher-forced sobre datos reservados: 118.951 tokens de texto y 14.274 tokens de caption de imagen):

| Configuracion | KLD texto | KLD texto recortado | KLD caption | KLD caption recortado |
|---|---|---|---|---|
| Todos los expertos L2 | 0,110 | 0,075 | 0,134 | 0,120 |
| Conjunto caliente estático de 56 | 0,061 | 0,026 | 0,074 | 0,062 |
| Conjunto caliente flotante de 56 (plan 12 GB) | 0,047 | 0,016 | 0,032 | 0,024 |
| Todos los expertos L4 | 0,036 | 0,009 | 0,023 | 0,017 |

La fila "recortado" excluye tokens que cambian más de 0,1 nats incluso con los pesos nativos (2.162 tokens de texto y 169 de caption). Con los pesos nativos la evaluación marca 0,029 bruto / 0,002 recortado en texto y 0,012 / 0,004 en captions.

## Requisitos de hardware

- VRAM estimada: ~12,3 GB para el plan completo a 131.072 tokens con caché KV FP8; solo los expertos L2 ocupan 5,39 GB y los L4 completos 12,6 GB.
- GPU recomendadas: una única GPU de 12 GB es el objetivo declarado (RTX 3060 12 GB, RTX 4070 Ti, RTX 4070 Super); para el nivel L4 completo o contexto de 262.144 tokens se necesita más memoria.
- Cabe en GPU de consumo: sí, en el plan de 12 GB con 56 expertos calientes por capa; con caché KV en BF16 o contexto de 262.144 tokens solo caben unos 17 expertos calientes por capa.
- Opciones de despliegue: no se publica kernel de servicio ni integración con vLLM, llama.cpp, Ollama o TGI; el repositorio incluye el predictor (`serving/predictor/`) con pesos, módulo de inferencia y código de entrenamiento.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-NestQuant-1.75-4bit | 26,4 B / 3,4 B | 131.072 (objetivo) | NestQuant L2/L4 anidado | Apache 2.0 | Solo expertos cuantizados; sin kernel de servicio |
| thinkingmachines/Inkling-2-Mini (base) | 26,4 B / 3,4 B | no disponible | NVFP4 (capas 0-19), MXFP8 (20-23) | Apache 2.0 | Checkpoint nativo completo |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio contiene únicamente los expertos enrutados; es imprescindible descargar atención, embeddings, codificador de visión y pesos MTP del repositorio original para poder ejecutar el modelo.
- No se publica kernel de servicio: la model card lo indica explícitamente ("No serving kernel is published yet"), por lo que no hay integración lista con vLLM, llama.cpp u otros motores.
- Las filas de conjunto caliente flotante son aproximadas en las capas en bucle: cada segmento se ejecuta primero con el conjunto estático para registrar el enrutamiento y el predictor elige los conjuntos de la ejecución puntuada a partir de él.
- El predictor se entrena sobre texto de calibración, no sobre generaciones propias de Inkling, lo que puede producir un sesgo en la selección de expertos calientes fuera de la distribución de calibración.
- La cuantización introduce divergencia medible: KLD de 0,047 en texto y 0,032 en captions con el plan de 12 GB, frente a 0,036 y 0,023 con todos los expertos en L4.
- El codificador de visión y la cabeza MTP quedan fuera de la GPU en el plan de 12 GB, de modo que las capacidades multimodales no están disponibles en ese despliegue.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos del modelo base: no disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el artefacto depende del modelo base, cuya licencia también es Apache 2.0 según los metadatos.
- El repositorio registra 0 descargas y 0 likes, y no hay validación de la comunidad ni resultados de benchmarks estándar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jarrelscy/Inkling-2-Mini-NestQuant-1.75-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
