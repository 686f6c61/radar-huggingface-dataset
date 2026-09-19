# netsrik/deepj-tinystories-deepseek

## Resumen

DeepJ TinyStories DeepSeek-style es un modelo de lenguaje causal experimental de 1.301.120 parametros desarrollado por el usuario netsrik y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo compacto de 4 capas, anchura 128 y 4 cabezas de atencion, con compresion de bajo rango en las proyecciones Q (rango 64) y KV (rango 32) al estilo de la familia DeepSeek, entrenado exclusivamente sobre el dataset sintetico TinyStories en ingles. No es una implementacion exacta de DeepSeek-V2/V3/R1 y, segun su model card, carece de KV cache incremental.

Su relevancia es acotada pero clara: sirve como banco de pruebas reproducible para estudiar arquitecturas de atencion con compresion de rango en el regimen sub-millon de parametros, y como caso de validacion del formato binario versionado de la libreria DeepJ. El modelo se distribuye en un checkpoint propietario (`model.dj`) y un tokenizador BPE (`tokenizer.bpe`) que no son cargables directamente desde la libreria Python Transformers, sino que requieren la rama `deepj-0.6-tinystories-release` de DeepJ o una build compatible posterior.

Con 10.000 pasos de entrenamiento, batch size 1 y secuencias de 128 tokens, el autor reporta una perdida de 2,182273 y una perplejidad de 8,866 sobre 100 ventanas de validacion deterministas de TinyStories (12.800 tokens). No hay resultados publicados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni evaluaciones de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo DeepSeek (4 capas, anchura 128, 4 cabezas de atencion, Q rank 64, KV rank 32); no es una implementacion exacta de DeepSeek-V2/V3/R1 |
| Parametros totales | 1.301.120 |
| Parametros activos | No procede (modelo denso; la informacion no indica arquitectura MoE) |
| Longitud de contexto | No disponible de forma explicita; el entrenamiento usa ventanas de 128 tokens |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en formato binario propio sin variantes cuantizadas |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | `model.dj` (binario versionado de DeepJ) y `tokenizer.bpe`; no cargable directamente con Transformers |

Otros datos: vocabulario BPE de 2.048 tokens, tamano del repositorio 0,0 GB (redondeado), 0 descargas y 0 likes en el momento de la consulta, creado el 18 de septiembre de 2026.

## Arquitectura y entrenamiento

El modelo es un transformer causal de 4 capas con anchura oculta de 128 y 4 cabezas de atencion. La innovacion estructural es el uso de proyecciones de bajo rango para Q (rango 64) y KV (rango 32), un esquema inspirado en la atencion latente de DeepSeek orientado a reducir el coste de memoria de las matrices de atencion. La configuracion declarada en el ejemplo de uso es `DeepSeekConfig(2048, 128, 128, 4, 4, 384, 64, 32, 0.2f, 1.0f)`, con semilla 42. El autor advierte explicitamente de dos limites: no se trata de una implementacion fiel de DeepSeek y no incorpora KV cache incremental, por lo que la generacion recomputa el contexto en cada token.

El entrenamiento consistio en 10.000 pasos con batch size 1 y secuencias de 128 tokens sobre TinyStories, un dataset sintetico en ingles con licencia CDLA-Sharing-1.0 compuesto por cuentos infantiles generados. El vocabulario BPE de 2.048 tokens se entreno a partir de una muestra acotada del split de entrenamiento. No se documenta ningun proceso de alineacion (RLHF, DPO, SFT) ni de ajuste por instrucciones. La evaluacion reportada por el autor cubre 100 ventanas deterministas del split de validacion de TinyStories (12.800 tokens), con loss 2,182273 y perplejidad 8,866.

## Capacidades

- Generacion de texto en ingles: continuacion de prompts, con el ejemplo de la model card partiendo de "Once upon a time" y decodificacion con temperatura 0,8 y top-k 40 durante 80 tokens.
- Generacion de narrativa sintetica breve: el dominio de entrenamiento es exclusivamente cuentos infantiles generados, por lo que el modelo esta especializado en ese registro.
- Modelado de lenguaje causal a nivel de token: util como referencia para medir loss y perplejidad en corpus TinyStories.
- Ejecucion determinista: la semilla fija (42 para inicializacion, 2026 para decodificacion) permite reproducir exactamente las salidas.
- No dispone de tool calling ni function calling.
- No dispone de soporte para agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue: nula fuera del ingles; el modelo card solo declara `en` y el dataset de entrenamiento es monolingue.
- No se documenta soporte de instrucciones, chat template ni system prompt.

## Casos de uso

- Docencia de arquitecturas de atencion comprimida: el modelo permite reproducir en un entorno de recursos minimos un esquema de proyecciones Q/KV de bajo rango (rangos 64 y 32) sobre 4 capas, util para explicar el diseno de la atencion latente de DeepSeek sin necesidad de GPU.
- Pruebas de regresion de la libreria DeepJ: dado que las salidas son deterministas y el autor publica loss (2,182273) y perplejidad (8,866) de referencia, el checkpoint sirve para verificar que nuevas builds siguen siendo compatibles con el formato binario `model.dj` y `tokenizer.bpe`.
- Generacion de corpus sintetico de cuentos para pruebas de pipeline: se puede invocar el generador para producir continuaciones breves que alimenten tests de tokenizacion, deduplicacion o formateo de datos, sin coste de API externa.
- Validacion de tokenizadores BPE de vocabulario reducido: el vocabulario de 2.048 tokens entrenado sobre una muestra acotada de TinyStories permite estudiar el compromiso entre cobertura lexica y tamano de embedding en modelos sub-millon.
- Investigacion sobre escalado en el regimen minimo: con 1,3 millones de parametros y 10.000 pasos documentados, es un punto de referencia para estudiar como se comportan las perdidas y la perplejidad en modelos de juguete dentro del marco TinyStories.
- Experimentacion con estrategias de decodificacion: el ejemplo de la model card parametriza temperatura (0,8) y top-k (40), de modo que el modelo sirve para comparar greedy, top-k y otras politicas sobre un mismo checkpoint reproducible.
- Inferencia local embebida en Java: al ocupar aproximadamente 5,2 MB en FP32, puede empotrarse en una aplicacion Java sin conectividad ni acelerador, siempre que se acepte el coste de recomputar el contexto por ausencia de KV cache.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Loss (validacion TinyStories) | 2,182273 | 100 ventanas deterministas de validacion, 12.800 tokens |
| Perplejidad (validacion TinyStories) | 8,866 | Mismas 100 ventanas deterministas |
| MMLU | No disponible | No evaluado |
| HumanEval | No disponible | No evaluado |
| GSM8K | No disponible | No evaluado |
| Evaluaciones de seguridad | No disponible | El autor indica que no se ha evaluado para uso seguro o downstream |

No se han publicado resultados de benchmarks adicionales en la informacion disponible, ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,2 MB en FP32 y 2,6 MB en FP16 para los 1.301.120 parametros, sin contar el tokenizador ni el overhead del runtime. Cifra orientativa calculada a partir del numero de parametros; el autor no la publica.
- Inferencia en CPU: plenamente viable en cualquier CPU moderna, incluso en un solo hilo. No se requiere GPU.
- GPU recomendadas: no procede; la libreria DeepJ es una implementacion Java y la model card no documenta soporte CUDA. Cualquier GPU con unos pocos megabytes libres es sobradamente suficiente.
- Consumer GPU: cabe en cualquier GPU de consumo, en iGPU integradas e incluso en dispositivos tipo Raspberry Pi. En una RTX 4090, A100 o H100 el modelo seria irrelevante por desproporcion de recursos.
- Opciones de despliegue: exclusivamente DeepJ 0.6, rama `deepj-0.6-tinystories-release`, o una build posterior compatible con el formato. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada. Advertencia relevante: al no existir KV cache incremental, el coste por token generado crece con la longitud del contexto, lo que penaliza generaciones largas.
- Almacenamiento: el repositorio ocupa 0,0 GB (redondeado en Hugging Face).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepJ TinyStories DeepSeek-style (netsrik) | 1.301.120 | No disponible (entrenado con ventanas de 128 tokens) | Loss 2,182273 y perplejidad 8,866 en 100 ventanas de validacion de TinyStories | MIT | Hugging Face; requiere DeepJ, no Transformers |
| TinyStories-1M (roneneldan) | En torno a 1 millon (no verificado en esta busqueda) | No disponible | No disponible en esta busqueda | No disponible en esta busqueda | Hugging Face |
| TinyStories-3M (roneneldan) | En torno a 3 millones (no verificado en esta busqueda) | No disponible | No disponible en esta busqueda | No disponible en esta busqueda | Hugging Face |
| SmolLM-135M (HuggingFaceTB) | 135 millones | No disponible en esta busqueda | No disponible en esta busqueda | No disponible en esta busqueda | Hugging Face y ecosistema GGUF |

No se dispone de datos verificados en la informacion proporcionada para completar la comparacion con cifras de rendimiento, contexto o licencia de las alternativas. La unica comparacion defendible es cualitativa: DeepJ TinyStories DeepSeek-style comparte dominio y orden de magnitud con la familia TinyStories de roneneldan, pero se distingue por una atencion con compresion de bajo rango en Q y KV y por un formato de pesos propietario que rompe la compatibilidad con el ecosistema Python.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena solo con cuentos infantiles sinteticos en ingles, por lo que hereda los sesgos y simplificaciones del generador de TinyStories; el autor no documenta ninguna auditoria de sesgo.
- Riesgo de alucinacion: alto en cualquier dominio fuera de la narrativa infantil sintetica. El autor advierte de que puede producir texto incorrecto, repetitivo, sesgado o inadecuado.
- Limitaciones de contexto: el entrenamiento usa ventanas de 128 tokens y no se documenta la longitud de contexto efectiva. La ausencia de KV cache incremental encarece la generacion a medida que crece el contexto.
- Limitacion idiomatica: monolingue en ingles. No hay soporte para castellano ni para ningun otro idioma.
- Restricciones de licencia: los pesos se publican bajo MIT, lo que permite uso comercial, pero el dataset TinyStories tiene licencia CDLA-Sharing-1.0, con las obligaciones de comparticion que ello pueda implicar sobre datos derivados.
- Compatibilidad de despliegue: los ficheros `model.dj` y `tokenizer.bpe` usan formatos binarios versionados de DeepJ y no son cargables con Transformers, vLLM, llama.cpp ni Ollama. Esto limita severamente su integracion en stacks estandar.
- Ausencia de alineacion: no hay RLHF, DPO ni ajuste por instrucciones; el modelo no es un asistente y no responde a comandos.
- Falta de evaluacion de seguridad: el autor declara explicitamente que el modelo no ha sido evaluado para seguridad ni para uso downstream.
- No apto para produccion: se trata de un experimento de 1,3 millones de parametros con 10.000 pasos de entrenamiento, pensado para investigacion y pruebas, no para cargas reales.
- Procedencia de los datos de esta ficha: la busqueda web asociada no devolvio ninguna fuente tecnica relevante, por lo que varios campos quedan marcados como no disponibles en lugar de estimarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netsrik/deepj-tinystories-deepseek
- Rama de DeepJ requerida (0.6 TinyStories release): https://github.com/KirstenAli/DeepJ/tree/deepj-0.6-tinystories-release
- Repositorio DeepJ: https://github.com/KirstenAli/DeepJ
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759
