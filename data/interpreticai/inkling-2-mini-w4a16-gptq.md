# InterpreticAI/Inkling-2-Mini-W4A16-GPTQ

## Resumen

Inkling-2-Mini-W4A16-GPTQ es una cuantizacion INT4 del modelo multimodal Inkling 2 Mini desarrollado por Thinking Machines Lab, publicada por INTERPRETIC AI. Se trata de un transformer de tipo Mixture of Experts (MoE) con 26.770.847.232 parametros totales que acepta entrada de texto e imagen y que, gracias a la cuantizacion W4A16 GPTQ con group size 128 aplicada a los expertos enrutados, reduce el checkpoint a 16,56 GB en 25 shards, lo que permite ejecutarlo en una unica GPU consumer de 24 GB como la RTX 3090.

El modelo conserva los pesos de vision originales (sin proyector separado) y el draft model DSpark (`mtp.safetensors`, 0,64 GB), lo que habilita decodificacion especulativa y ventanas de contexto muy largas: en la configuracion probada sobre una RTX 3090 con 24 GB se alcanzaron 268.544 tokens de contexto. La relevancia actual reside en que permite desplegar un modelo MoE multimodal de ~26,8B parametros en hardware de consumo con una perdida de fidelidad medida frente al original del 92,99% de acuerdo en el siguiente token.

La licencia es Apache 2.0, igual que el modelo original, con la politica de uso aceptable de Thinking Machines Lab aplicandose adicionalmente. El runtime recomendado y probado es HyperInkling 0.1.4 sobre vLLM, y el checkpoint esta pensado para servir en produccion con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) multimodal, con draft model DSpark para decodificacion especulativa |
| Parametros totales | 26.770.847.232 |
| Parametros activos | no disponible |
| Longitud de contexto | 268.544 tokens (configuracion probada en RTX 3090 24 GB) |
| Tipos de cuantizacion | W4A16 GPTQ (group size 128) sobre expertos enrutados; pesos de vision en precision original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con politica de uso aceptable de Thinking Machines Lab) |
| Formato de pesos | safetensors (25 shards, 16,56 GB) + `mtp.safetensors` (0,64 GB) |
| Tamano del repo | 17,2 GB |
| Pipeline | image-text-to-text |
| Libreria | vLLM (runtime HyperInkling 0.1.4) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con capacidad multimodal de entrada (texto e imagen). Los expertos enrutados han sido cuantizados a INT4 con GPTQ en modo W4A16 (pesos de 4 bits, activaciones de 16 bits) y group size 128, mientras que los pesos de vision se mantienen en su precision original y no requieren proyector separado. El checkpoint incluye ademas el draft model DSpark (`mtp.safetensors`), que permite decodificacion especulativa para acelerar la generacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en la informacion proporcionada. La cuantizacion fue validada midiendo el acuerdo en el siguiente token frente al modelo original: 92,99% sobre 22 conversaciones reservadas y 27.901 posiciones de token, con divergencia KL mediana de 0,0025 y media de 0,1019.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto muy largo (hasta 268.544 tokens en la configuracion probada).
- Entrada de imagen y texto (image-text-to-text) con pesos de vision integrados en el checkpoint.
- Razonamiento y matematicas: supera un spot check de GSM8K con 19/20 en la configuracion de servicio por defecto.
- Recuperacion en contexto largo: 3/3 needles acertados con 267.433 tokens de entrada.
- Decodificacion especulativa mediante el draft model DSpark incluido.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con imagenes: el modelo puede procesar entradas de hasta ~268K tokens, lo que permite ingerir informes completos, manuales o expedientes con figuras y tablas en una sola peticion sin trocear el contenido.
- Asistencia conversacional de largo alcance: al mantener contexto de cientos de miles de tokens, es adecuado para sesiones de soporte o consultoria donde el historial crece y no conviene resumir.
- Procesamiento de documentacion tecnica con capturas: la entrada image-text-to-text con pesos de vision integrados permite responder preguntas sobre diagramas, interfaces o esquemas incluidos en la documentacion.
- Servicio de inferencia en hardware consumer: al caber en una RTX 3090 de 24 GB, permite montar un endpoint vLLM en una sola GPU para prototipos, demos o entornos de desarrollo sin acceso a A100/H100.
- Evaluacion de calidad de cuantizaciones: el checkpoint sirve como referencia para comparar fidelidad INT4 frente al original usando las metricas publicadas (acuerdo de siguiente token, KL, GSM8K, needles).
- Generacion de codigo y prosa a alta velocidad: con DSpark activo se midieron 188 tokens/s en codigo y 150 tokens/s en prosa a 32K de contexto en una RTX 3090, lo que lo hace viable para tareas interactivas de generacion.
- Recuperacion aumentada (RAG) con contexto masivo: la ventana de 268K tokens permite concatenar muchos fragmentos recuperados sin truncar, reduciendo la perdida de informacion en pipelines RAG.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Acuerdo en siguiente token con el original (22 conversaciones, 27.901 posiciones) | 92,99% |
| Divergencia KL en las mismas posiciones (mediana / media) | 0,0025 / 0,1019 |
| GSM8K spot check (configuracion de servicio por defecto) | 19/20 |
| Recuperacion en contexto largo a 267.433 tokens de entrada | 3/3 needles |
| Throughput de decodificacion a 32K contexto con DSpark (codigo) | 188 tokens/s |
| Throughput de decodificacion a 32K contexto con DSpark (prosa) | 150 tokens/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 24 GB suficientes para el checkpoint cuantizado en la configuracion probada; el repo pesa 17,2 GB (16,56 GB de pesos + 0,64 GB del draft model), dejando margen para KV cache y contexto.
- GPU recomendadas: RTX 3090 (24 GB) como minimo probado; GPUs con mas VRAM permitiran contextos mayores o mayor paralelismo.
- Cabe en consumer GPU: si, en RTX 3090 de 24 GB con GPU unlock y limite de potencia de 420 W en la configuracion probada.
- Opciones de despliegue: HyperInkling 0.1.4 sobre vLLM (runtime probado); el autor publica tambien variantes GGUF Q4_K_M e IQ3_XXS y MLX 4-bit para otros entornos.
- Latencia y throughput: 188 tokens/s en codigo y 150 tokens/s en prosa a 32K de contexto con DSpark activo en RTX 3090; son tasas de decodificacion, no de procesamiento de prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-W4A16-GPTQ (este) | 26,77B totales | 268.544 tokens (probado) | W4A16 GPTQ | Apache 2.0 | HF, vLLM via HyperInkling |
| thinkingmachines/Inkling-2-Mini (original) | 26,77B totales | no disponible | no cuantizado | Apache 2.0 | HF |
| InterpreticAI/Inkling-2-Mini-GGUF (Q4_K_M) | 26,77B totales | no disponible | GGUF Q4_K_M | Apache 2.0 | HF |
| InterpreticAI/Inkling-2-Mini-MLX-4bit | 26,77B totales | no disponible | MLX 4-bit | Apache 2.0 | HF |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion INT4 introduce degradacion respecto al original: el acuerdo en siguiente token es del 92,99%, no del 100%, y la divergencia KL media (0,1019) es dos ordenes de magnitud superior a la mediana (0,0025), lo que indica colas de error en algunas posiciones.
- Solo estan cuantizados los expertos enrutados; el resto de pesos mantiene la precision original, por lo que el ahorro de memoria es parcial.
- Los datos de rendimiento (contexto de 268.544 tokens, 188/150 tokens/s) corresponden a una unica configuracion de hardware (RTX 3090 con GPU unlock y 420 W) y no son extrapolables sin validacion.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento en dominios sensibles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el spot check de GSM8K (19/20) es una muestra muy pequena.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se aplica adicionalmente la politica de uso aceptable de Thinking Machines Lab, que puede limitar ciertos usos.
- El runtime recomendado es HyperInkling 0.1.4 sobre vLLM; otros runtimes (llama.cpp, TGI) no estan validados para este checkpoint concreto.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/InterpreticAI/Inkling-2-Mini-W4A16-GPTQ
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Inkling-2-Mini-GGUF
- GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Inkling-2-Mini-IQ3_XXS-GGUF
- MLX 4-bit: https://huggingface.co/InterpreticAI/Inkling-2-Mini-MLX-4bit
- Runtime HyperInkling: https://github.com/Pento95/HyperInkling/tree/14f2283c63200b34c6827b6fc40b089cac9d4ccf
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Sitio del autor: https://interpretic.ai
