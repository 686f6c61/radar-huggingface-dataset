# glyd/Qwen3.6-27B-kestrel

## Resumen
Qwen3.6-27B-kestrel es un checkpoint cuantizado del modelo Qwen/Qwen3.6-27B publicado por el usuario glyd bajo su propio motor de inferencia homonimo. Se trata de una cuantizacion con perdida (lossy) de aproximadamente 6,5 bits por peso, generada en un unico paso a partir de los pesos bf16 originales, que reduce el tamano en disco un 59% respecto a bf16 (de 53,8 GB a 22,0 GB). Su divergencia KL frente a bf16, medida sobre WikiText-2, es de 0,0137.

El modelo resuelve el problema de ejecutar un modelo de ~27.000 millones de parametros en GPUs de 24 GB, como una RTX 4090, manteniendo una degradacion de calidad declarada como baja. Es relevante para desarrolladores que necesitan desplegar modelos grandes en hardware de gama alta de consumo o profesional sin recurrir a precisiones float de mayor peso.

La ficha tecnica del autor indica que solo es texto (la parte de vision del modelo base no esta incluida) y que requiere el motor Glyd sobre Linux con GPU NVIDIA y driver 580 o superior. En el momento de la publicacion no cuenta con descargas ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.6, etiqueta del repo qwen3_5; no se detalla transformer, MoE ni hibrida) |
| Parametros totales | 21.884.158.770 (safetensors del repo); el autor indica 26.895.998.464 parametros para el modelo de origen |
| Parametros activos | no disponible |
| Longitud de contexto | al menos 32k tokens (se verifica contexto de 32k en L40S y RTX A6000); no se declara el maximo oficial |
| Tipos de cuantizacion | kestrel, aproximadamente 6,5 bits por peso, cuantizada una vez desde bf16; la etiqueta del Hub indica "8-bit" pero el autor aclara que cuenta bytes empaquetados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (pesos); el motor Glyd que los ejecuta es BUSL-1.1 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 22,0 GB (59% menor que bf16, 53,8 GB) |
| Libreria | glyd |
| Divergencia KL frente a bf16 | 0,0137 (WikiText-2) |
| Modelo base | Qwen/Qwen3.6-27B (commit 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9) |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.6-27B en los datos proporcionados (no se especifica si es un transformer denso, un modelo de mezcla de expertos ni sus dimensiones de capas, cabezas o atencion). La etiqueta del repositorio incluye `qwen3_5`, lo que situa el origen en la familia Qwen3.5/3.6, pero no se detalla la topologia.

Lo que si se documenta es el proceso de cuantizacion: el checkpoint kestrel se ha generado en una sola pasada desde los pesos originales en bf16, con una precision efectiva de aproximadamente 6,5 bits por peso y una perdida de calidad medida como divergencia KL de 0,0137 frente a bf16 sobre WikiText-2. El autor describe el resultado como no sin perdida (lossy). No se aportan datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por RLHF o DPO.

## Capacidades
- Generacion de texto y uso conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Ejecucion de tareas del modelo base Qwen3.6-27B heredadas por cuantizacion; el autor no detalla capacidades especificas adicionales.
- Solo texto: la parte de vision del modelo base no esta incluida en este checkpoint.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo de razonamiento (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso
- Inferencia local en GPU de 24 GB: ejecutar un modelo de ~27.000 millones de parametros en una RTX 4090 con contexto de 4k, con un consumo medido de 24,1 GB de VRAM. Es el escenario natural de este checkpoint, segun los datos de memoria del autor.
- Despliegue con contexto largo en GPU profesional: en L40S y RTX A6000 el checkpoint sostiene contextos de 32k con 24,2 GB y 24,0 GB de memoria respectivamente, lo que permite procesar documentos largos o historiales extensos.
- Generacion de texto conversacional: dado el pipeline declarado (`text-generation`, `conversational`), encaja en asistentes de chat de un solo turno o multi-turno, siempre que la longitud se mantenga dentro del contexto soportado por la GPU.
- Prototipado e investigacion de compresion: la comparativa interna entre kestrel (KL 0,0137), swift (KL 0,0302) y penguin (sin perdida) permite estudiar el compromiso entre tamano, velocidad y fidelidad de la cuantizacion.
- Evaluacion de motores de inferencia alternativos: sirve para probar el motor Glyd frente a vLLM o transformers, con la salvedad de que este checkpoint no es compatible con estos ultimos por ahora.
- Despliegue en estaciones de trabajo con una sola GPU: en RTX A6000 el model genera 30 tokens/s con un primer token en 736 ms, adecuado para entornos de desarrollo individuales.
- Servicio de completado de texto de baja concurrencia: los 40 tokens/s en RTX 4090 y 31 tokens/s en L40S permiten atender cargas ligeras de generacion en tiempo casi interactivo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta divergencia KL y metricas de velocidad y memoria.

| Variante | Tamano | Reduccion vs bf16 | KL vs bf16 | RTX 4090 |
|---|---|---|---|---|
| bf16 (original) | 53,8 GB | – | 0 | – |
| Qwen FP8 | 29,5 GB | 45% | no disponible | – |
| penguin (sin perdida) | 37,0 GB | 31% | 0 | – |
| kestrel (este repo) | 22,0 GB | 59% | 0,0137 | 40 tok/s |
| swift | 18,6 GB | 65% | 0,0302 | 46 tok/s |

Rendimiento por GPU (medido el 2026-10-09 con glyd 0.29.4, una GPU, contexto de 4k):

| GPU | Tokens/s | Primer token | Memoria a 4k | Contexto 32k |
|---|---|---|---|---|
| RTX 4090 | 40 | 475 ms | 24,1 GB | no |
| L40S | 31 | 426 ms | 24,2 GB | si |
| RTX A6000 | 30 | 736 ms | 24,0 GB | si |

## Requisitos de hardware
- VRAM estimada: 24,1 GB en RTX 4090, 24,2 GB en L40S y 24,0 GB en RTX A6000, con contexto de 4k tokens.
- GPU recomendadas: RTX 4090 (40 tok/s, solo hasta 4k de contexto), L40S (31 tok/s, soporta 32k) y RTX A6000 (30 tok/s, soporta 32k).
- Cabe en GPU de consumo: si, en RTX 4090, pero limitado a contextos de 4k; no soporta 32k en esa GPU.
- Opciones de despliegue: unicamente el motor Glyd (`glyd run`), sobre Linux con GPU NVIDIA y driver 580 o superior. El autor indica explicitamente que no es compatible con vLLM ni con transformers por el momento.
- Latencia y throughput: primer token de 475 ms en RTX 4090, 426 ms en L40S y 736 ms en RTX A6000; generacion de 40, 31 y 30 tokens/s respectivamente.
- Instalacion: `curl -LsSf https://getglyd.com/install.sh | sh` y despues `glyd run Qwen/Qwen3.6-27B:kestrel`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glyd/Qwen3.6-27B-kestrel | 21.884.158.770 (safetensors); 26.895.998.464 declarados para el origen | al menos 32k (segun GPU) | 40 tok/s en RTX 4090, KL 0,0137 | apache-2.0 (pesos), motor BUSL-1.1 | HuggingFace, solo motor Glyd |
| glyd/Qwen3.6-27B-penguin | no disponible | no disponible | sin perdida (KL 0), 37,0 GB | apache-2.0 (pesos) | HuggingFace |
| glyd/Qwen3.6-27B-swift | no disponible | no disponible | 46 tok/s en RTX 4090, KL 0,0302, 18,6 GB | apache-2.0 (pesos) | HuggingFace |
| Qwen/Qwen3.6-27B (bf16) | no disponible | no disponible | bf16, 53,8 GB | apache-2.0 | HuggingFace |
| Qwen FP8 | no disponible | no disponible | 29,5 GB, KL no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Cuantizacion con perdida: la divergencia KL de 0,0137 frente a bf16 implica una degradacion medible en las probabilidades de siguiente token; no es un checkpoint sin perdida como la variante penguin.
- Discrepancia de parametros: el recuento de safetensors del repositorio (21.884.158.770) no coincide con el numero declarado por el autor para el modelo de origen (26.895.998.464); no se explica la diferencia en la informacion disponible.
- Compatibilidad restringida: solo funciona con el motor Glyd; no es compatible con vLLM ni transformers por ahora. Esto limita la integracion en stacks existentes.
- Requisitos de plataforma: Linux con GPU NVIDIA y driver 580 o superior.
- Modalidad limitada: solo texto; la parte de vision del modelo base no esta incluida.
- Contexto limitado en GPU de consumo: en RTX 4090 no soporta 32k y queda restringido a contextos cortos (pruebas a 4k).
- Etiqueta de precision enganosa: el Hub etiqueta el modelo como "8-bit", pero el autor aclara que la precision real es de unos 6,5 bits por peso y que las etiquetas cuentan bytes empaquetados.
- Licencia del motor: los pesos son Apache-2.0, pero el motor Glyd es BUSL-1.1; el uso comercial del motor requiere una licencia aparte, aunque el uso personal y no comercial en equipos propios es gratuito.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica, lo que dificulta evaluar su idoneidad en aplicaciones multilingues.
- Riesgo de alucinacion y sesgos: no disponible; el autor no documenta evaluaciones al respecto.
- Adopcion nula: cero descargas y cero valoraciones en el momento de la publicacion, por lo que no hay validacion externa del checkpoint.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/glyd/Qwen3.6-27B-kestrel
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Commit del modelo base: https://huggingface.co/Qwen/Qwen3.6-27B/tree/6a9e13bd6fc8f0983b9b99948120bc37f49c13e9
- Variante sin perdida (penguin): https://huggingface.co/glyd/Qwen3.6-27B-penguin
- Motor Glyd y licencia: https://getglyd.com
