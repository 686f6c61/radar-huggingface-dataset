# peterbuitho/VietPoet-Qwen3.5-4B-MLX-4bit

## Resumen

VietPoet-Qwen3.5-4B-MLX-4bit es una cuantización de 4 bits en formato MLX de VietPoet-Qwen3.5-4B, un ajuste fino mediante QLoRA del modelo base Qwen/Qwen3.5-4B orientado a la composición de poesía vietnamita en métrica *lục bát* (el metro tradicional alterno de seis y ocho sílabas). Lo publica el usuario peterbuitho y está pensado para ejecutarse en Apple Silicon a través de la librería MLX. El repositorio ocupa 2,4 GB y declara 4.205.751.296 parámetros totales en los pesos safetensors.

El problema que aborda es muy concreto: generar poemas que respeten las reglas formales del lục bát (longitud de 6/8 sílabas, patrones de tono *bằng/trắc* y rima) en vietnamita, un idioma con pocos recursos y escasa presencia en modelos abiertos. El autor reconoce explícitamente que las métricas publicadas miden forma, no calidad poética: los poemas son formalmente correctos pero el significado suele ser vago o desviarse del tema propuesto, porque los datos de entrenamiento solo incluían el título como tema.

La relevancia de esta ficha está en su enfoque de despliegue: el modelo no se usa de forma aislada, sino junto al muestreador línea a línea y el verificador de reglas del repositorio ThoLucBat. Ese sistema genera 16 candidatos por línea en `mlx_lm.server`, descarta los que incumplen las reglas de 6/8 sílabas, tono y rima, y ensambla el poema. Con ese muestreador el autor reporta una puntuación de reglas de 0,995 y un 100 % de poemas válidos sobre 40 prompts reservados; sin él, el modelo cae a ~0,81 y rompe la regla de tono de la sexta/octava sílaba en el 38 % de los versos *bát*.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Qwen3.5-4B); no se detallan capas, atención ni innovaciones concretas en la información disponible |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX de 4 bits (4,5 bits por peso según el autor); existen versiones MLX de 8 bits, pesos de 16 bits y archivos GGUF del mismo modelo base |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors cuantizados para MLX (`mlx_lm`, libreria `mlx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-4B, es decir, un transformer decoder denso de aproximadamente 4.200 millones de parámetros. El autor no documenta en la model card detalles adicionales de la arquitectura (número de capas, tipo de atención, tokenizador o longitud de contexto), por lo que esos datos quedan como no disponibles. El ajuste se realizó con QLoRA sobre 8.000 poemas y 2 épocas, partiendo del dataset phamson02/vietnamese-poetry-corpus (licencia CC BY 4.0), previamente filtrado para conservar únicamente los poemas que superan un verificador de reglas de lục bát. La conversión a MLX se hizo con `mlx_lm.convert -q --q-bits 4`.

La innovación reseñable no está en el entrenamiento sino en el pipeline de inferencia. El modelo se diseñó para trabajar con un muestreador línea a línea que pide 16 candidatos por verso, aplica un verificador de reglas (longitud 6/8, tono y rima) y conserva solo los versos válidos. El prompt usa el formato de chat de Qwen con el modo *thinking* desactivado y los versos se van anexando al turno del asistente. El autor cita como inspiración metodológica el artículo arXiv:2401.01078 sobre generación de poesía vietnamita y traducción poética entre idiomas.

## Capacidades

- Generación de texto en vietnamita especializada en poesía lírica con métrica lục bát.
- Producción de poemas de estructura fija (por ejemplo, 8 versos o *câu*) con formato correcto de 6/8 sílabas cuando se usa junto al muestreador del repositorio ThoLucBat.
- Cumplimiento de reglas de rima y de patrón de tonos bằng/trắc únicamente con el verificador externo activado; sin él la tasa de incumplimiento de la regla de tono en versos bát es del 38 %.
- Conversación multi-turno en formato chat de Qwen (`<|im_start|>` / `<|im_end|>`) con el bloque `<think>` vacío, es decir, sin razonamiento explícito.
- No se documentan capacidades de tool calling, function calling, uso como agente, visión, audio ni matemáticas o código.
- Capacidad multilingüe limitada al vietnamita declarado (`language: vi`); no hay evidencia de buen rendimiento en otros idiomas.
- Adecuación como componente de un sistema de generación con restricciones (constrained decoding artesanal) más que como modelo autónomo.

## Casos de uso

- Composición asistida de poesía lục bát: un escritor o aficionado introduce un título o tema y el sistema, con el muestreador de 16 candidatos por línea, devuelve un poema de 8 versos formalmente válido en 75-85 segundos sobre un M2 Pro.
- Aplicación de escritura offline en macOS: el paquete del repositorio ThoLucBat prepara LM Studio y `mlx_lm.server` en Apple Silicon, de modo que el modelo funciona sin conexión y sin enviar textos a servicios externos.
- Herramienta educativa de métrica vietnamita: estudiantes de literatura pueden generar ejemplos etiquetados como válidos o inválidos por el verificador de reglas y usarlos para practicar el reconocimiento de patrones de tono y rima.
- Generación de datos sintéticos para investigación en PLN de bajo recurso: el pipeline produce corpus lục bát formalmente correctos que pueden servir para aumentar datos de entrenamiento o para evaluar verificadores de métrica, siempre que se revise la coherencia semántica.
- Estudio de decodificación restringida: el proyecto es un caso práctico de combinación de un LLM pequeño con un verificador simbólico, útil para investigar el equilibrio entre muestreo amplio (16 candidatos por línea) y filtrado por reglas.
- Prototipado de asistentes culturales o de nicho en vietnamita: dada su licencia Apache-2.0 y su tamaño reducido (2,4 GB), encaja en demos y aplicaciones de escritorio o web local con presupuesto de memoria bajo.
- Evaluación comparativa de cuantizaciones: las versiones de 4, 8 y 16 bits y los GGUF permiten medir la degradación de la puntuación de reglas según el nivel de cuantización en el mismo conjunto de prompts.

## Benchmarks y rendimiento

Los únicos datos publicados son las puntuaciones del verificador de reglas del autor, medidas sobre prompts reservados de tipo "8 câu". Los resultados corresponden a distintas configuraciones del mismo modelo y sus cuantizaciones; se reproducen tal cual.

| Configuración | Prompts evaluados | Puntuación de reglas | Poemas totalmente válidos |
|---|---|---|---|
| VietPoet-Qwen3.5-4B-MLX-4bit con muestreador | 40 | 0,995 | 100 % |
| VietPoet-Qwen3.5-4B-MLX-8bit con muestreador | 40 | 0,992 | 95 % |
| VietPoet-Qwen3.5-4B (16 bits) en vLLM con muestreador | 100 | 0,994 | 98 % |
| Modelo en bruto sin muestreador | no disponible | ~0,81 | no disponible (rompe la regla de tono en el 38 % de los versos bát) |

El propio autor advierte que con 40 prompts una diferencia de uno o dos poemas entra dentro del ruido, y que estas cifras miden forma métrica, no calidad poética ni adecuación al tema. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible.

## Requisitos de hardware

- Inferencia MLX: requiere Apple Silicon; el formato de pesos es safetensors cuantizado para `mlx_lm`, no compatible con CUDA.
- Memoria: el repositorio pesa 2,4 GB, por lo que los pesos de 4 bits caben holgadamente en equipos con 16 GB de memoria unificada. El autor valida su funcionamiento en un Apple M2 Pro con 16 GB.
- Latencia medida: entre 75 y 85 segundos para un poema de 8 versos con 16 muestras por línea, ejecutando `mlx_lm.server` en un M2 Pro de 16 GB.
- Despliegue en macOS: `mlx_lm.server` (versión 0.31.3 según la model card) o LM Studio mediante el paquete del repositorio ThoLucBat.
- Sistemas no Apple: la vía documentada son los archivos GGUF del mismo modelo, que permiten usar llama.cpp u otros runners compatibles con GGUF.
- Rendimiento en GPU de sobremesa o de centro de datos: no disponible. La model card no publica cifras de vLLM ni de otras pilas CUDA para esta cuantización concreta (las cifras de vLLM de la tabla corresponden a los pesos de 16 bits).
- Advertencias de configuración del servidor: `--prompt-cache-size 0` es obligatorio (con la caché activada el hilo de generación lanza `IndexError` y las peticiones posteriores se bloquean); el campo `model` debe ser `default_model` o una ruta local; el parámetro `n` se ignora, por lo que el muestreador lanza 16 peticiones individuales y conviene no superar 8 conexiones simultáneas; `logprobs` debe ser `true` booleano y `<|im_end|>` vuelve como texto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar que permitan comparar con alternativas de otros autores. La comparación factible es interna a la familia VietPoet, con los datos de la model card.

| Modelo | Cuantización | Tamaño | Puntuación de reglas (con muestreador) | Poemas válidos | Licencia |
|---|---|---|---|---|---|
| VietPoet-Qwen3.5-4B-MLX-4bit | MLX 4 bits | 2,4 GB | 0,995 (40 prompts) | 100 % | Apache-2.0 |
| VietPoet-Qwen3.5-4B-MLX-8bit | MLX 8 bits | ~4,8 GB (el doble, según el autor) | 0,992 (40 prompts) | 95 % | Apache-2.0 |
| VietPoet-Qwen3.5-4B | 16 bits | no disponible | 0,994 (100 prompts) | 98 % | Apache-2.0 |
| VietPoet-Qwen3.5-4B-GGUF | GGUF (varios niveles) | no disponible | no disponible | no disponible | Apache-2.0 |
| Qwen/Qwen3.5-4B (modelo base) | 16 bits | no disponible | no disponible | no disponible | Apache-2.0 |

Comparativas con modelos poéticos vietnamitas de otros autores: no disponible.

## Limitaciones y advertencias

- La coherencia semántica es débil: el autor indica que los poemas suelen ser vagos o desviarse del tema, porque durante el entrenamiento el único indicio temático era el título.
- Sin el muestreador externo, el modelo incumple la regla de tono de la sexta/octava sílaba en el 38 % de los versos bát y su puntuación de reglas cae a ~0,81.
- Las cifras de 100 % de validez proceden de 40 prompts y el propio autor las califica de sensibles al ruido; no deben extrapolarse como garantía de calidad.
- El modelo solo declara vietnamita; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- La longitud de contexto no está documentada, lo que impide planificar usos con contextos largos o conversaciones extensas.
- No se documentan capacidades de tool calling, agentes, código, matemáticas ni visión.
- Dependencia fuerte de Apple Silicon para la versión MLX; en otros sistemas hay que recurrir a los GGUF, cuyas métricas no se publican.
- Fragilidad de la pila de servido: los problemas conocidos de `mlx_lm.server` con la caché de prompt, el nombre del modelo, el parámetro `n` y `logprobs` pueden provocar caídas del hilo de generación o bloqueos si no se replica la configuración exacta del autor.
- Licencia Apache-2.0 en el modelo y en el modelo base, pero los datos de entrenamiento (phamson02/vietnamese-poetry-corpus) están bajo CC BY 4.0, por lo que conviene verificar las obligaciones de atribución del corpus si se redistribuye o se usa comercialmente.
- Riesgo de alucinación no cuantificado: no hay evaluación de sesgos, toxicidad ni factualidad en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B-MLX-4bit
- Modelo base del ajuste fino: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B
- Versión MLX de 8 bits: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B-MLX-8bit
- Archivos GGUF: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de poesía vietnamita: https://huggingface.co/datasets/phamson02/vietnamese-poetry-corpus
- Repositorio del muestreador y verificador: https://github.com/peterbuitho/ThoLucBat
- Artículo de referencia: https://arxiv.org/abs/2401.01078
- Librería MLX: https://github.com/ml-explore/mlx
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a registradores de datos de temperatura y humedad, sin relación con esta ficha.
