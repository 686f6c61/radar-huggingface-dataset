# IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-NanoPlus-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo Huihui-Qwen3.8-27B-abliterated, publicada por el usuario IsValorum bajo la denominacion VAL-APEX-I NanoPlus. No se trata de un modelo entrenado desde cero, sino de una compresion quirurgica tensor a tensor del checkpoint base de 27.320.697.856 parametros (27,3 B), orientada a reducir el peso en disco a 11,90 GB (2,85 bits por peso) manteniendo la calidad de razonamiento en un nivel equivalente a un Q4_K_M convencional.

La familia base es una variante "abliterated" del modelo Qwen3.8-27B, es decir, una version en la que se ha eliminado quirurgicamente la direccion de rechazo del modelo original para dar lugar a un modelo sin censura. El checkpoint comprimido conserva la arquitectura hibrida del original: 64 capas, de las cuales 47 son SSM lineales tipo DeltaNet y 17 son capas de atencion completa periodicas, con una ventana de contexto declarada de 256.000 tokens.

Su relevancia practica radica en el objetivo de despliegue: segun el autor, el modelo completo con los 256K tokens de contexto cabe en VRAM de una GPU de 24 GB, y el archivo de pesos se ejecuta en GPUs de 16 GB. La licencia declarada es Apache 2.0 y el unico idioma soportado segun los metadatos es el ingles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida densa lineal-cuadratica: 64 capas, 47 SSM lineales DeltaNet (recurrencia) + 17 capas de atencion completa periodicas |
| Parametros totales | 27.320.697.856 (27,3 B), dato real de safetensors |
| Parametros activos | No aplica: es un modelo denso, no MoE |
| Longitud de contexto | 256.000 tokens (256K), segun el autor |
| Tipos de cuantizacion | Mezcla GGUF por tensor: `ssm_*` en F32, puertas de atencion en Q8_0, atencion completa en IQ3_S/Q4_K, proyecciones down SwiGLU en IQ3_XXS/IQ3_S, gate/up en IQ2_XXS/IQ3_XXS, `output.weight` en Q6_K. Tamano total 11,90 GB (2,85 BPW) |
| Idiomas soportados | Ingles (en), unico idioma declarado en los metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), cuantizacion con calibracion imatrix |

## Arquitectura y entrenamiento

La arquitectura del checkpoint subyacente es un transformer hibrido: combina 47 capas de espacio de estados (SSM) lineales basadas en DeltaNet con 17 capas de atencion completa distribuidas periodicamente a lo largo de las 64 capas totales. Este diseno reduce el coste cuadratico de la atencion, ya que solo una fraccion de las capas mantiene una matriz de atencion completa, y es lo que permite al autor afirmar que el modelo completo con 256K de contexto se mantiene dentro de la VRAM de una GPU de 24 GB. Al ser un modelo denso, los 27,3 B de parametros se activan en cada token, a diferencia de un MoE de tamano comparable.

Sobre el proceso de entrenamiento del modelo base no hay informacion disponible en los datos proporcionados: no se indica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Lo unico documentado es que el checkpoint base es una version "abliterated" del Qwen3.8-27B, es decir, con la direccion de rechazo ablacionada; el metodo exacto de ablacion no se detalla en la model card. La innovacion tecnica declarada en este repositorio es la propia receta de cuantizacion VAL-APEX-I, que segun su autor realiza una auditoria matematica tensor a tensor con calibracion imatrix, preservando sin comprimir el estado recurrente (`ssm_*` en F32) y la cabeza de salida (`output.weight` en Q6_K) para evitar la deriva acumulativa del estado recurrente y la rotura de los delimitadores de razonamiento.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat propia orientada a uso agéntico ("Hardened Agentic Chat Template") y control del esfuerzo de razonamiento.
- Modo de razonamiento explicito, con delimitadores de pensamiento (`<think>`) que la receta de cuantizacion trata de preservar intactos.
- Razonamiento de multiples pasos y cadenas de pensamiento largas, aprovechando la ventana declarada de 256K tokens.
- Generacion de codigo, con advertencia explicita del autor sobre el parametro de penalizacion por repeticion para evitar el intercambio de caracteres en salida de sintaxis.
- Ejecucion local en contenedores compatibles con llama.cpp; los tags incluyen `endpoints_compatible`, lo que apunta a servidores con API compatible con OpenAI.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Comportamiento sin rechazos (uncensored) derivado de la ablacion del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de razonamiento en local sobre GPU de gama alta de consumo: con 11,08 GiB de huella de pesos, el modelo se ejecuta integramente en VRAM en GPUs de 16 GB y superiores, lo que permite mantener un asistente de razonamiento de 27,3 B sin depender de APIs externas.
- Analisis de documentacion extensa: la ventana declarada de 256K tokens permite ingerir manuales tecnicos, expedientes o bases de codigo completas en una sola pasada, y el autor sostiene que esa ventana completa cabe en 24 GB de VRAM gracias al diseno hibrido con solo 17 capas de atencion completa.
- Generacion y revision de codigo en entornos aislados: el modelo puede integrarse en un servidor llama.cpp local para autocompletado y revision, siempre ajustando el parametro de penalizacion por repeticion segun la advertencia del autor para evitar sustituciones de caracteres en la sintaxis.
- Investigacion sobre alineacion y comportamiento de rechazo: al ser una variante "abliterated" cuantizada, sirve como material de estudio comparativo frente al checkpoint original con rechazos, permitiendo medir como se comporta la ablacion tras una compresion agresiva a 2,85 BPW.
- Backend de agentes con contexto largo: la plantilla de chat agéntica y el control de esfuerzo de razonamiento permiten encadenar pasos de planificacion y ejecucion manteniendo el historial completo dentro de la ventana de contexto.
- Procesamiento de lotes en CPU o con offload parcial: con 11,90 GB en disco, el modelo puede desplegarse en servidores sin GPU dedicada mediante llama.cpp, aceptando una penalizacion de latencia a cambio de no requerir acelerador.
- Evaluacion comparativa de recetas de cuantizacion: el repositorio publica sus mediciones de perplejidad frente a cuantizaciones planas, lo que lo convierte en un punto de referencia util para replicar el arnes `llama-perplexity` sobre arquitecturas hibridas SSM + atencion.

## Benchmarks y rendimiento

El autor publica mediciones de perplejidad sobre WikiText-2 con longitud de contexto 512, obtenidas directamente sobre los pesos GGUF compilados con `llama-perplexity`. Son datos autodeclarados, sin verificacion independiente. No hay resultados disponibles de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar de capacidades.

| Especificacion | Tamano en disco | Huella en memoria | BPW medio | Perplejidad WikiText-2 (ctx 512) | Delta frente a BF16 | Nivel de calidad equivalente |
|---|---|---|---|---|---|---|
| BF16 sin comprimir (referencia) | 54,00 GB (50,29 GiB) | 50,29 GiB | 16,00 | ~6,0000 (referencia) | Base (0,00 %) | Referencia sin perdida |
| VAL-APEX-I MiniPlus V2.1 | 15,33 GB (14,28 GiB) | 14,28 GiB | 3,93 | 6,1466 +/- 0,4919 | +0,1466 (+2,44 %) | Frontera Q5_K_M / Q6_K |
| VAL-APEX-I NanoPlus (este repositorio) | 11,90 GB (11,08 GiB) | 11,08 GiB | 2,85 | 6,4238 +/- 0,4960 | +0,4238 (+7,06 %) | Q4_K_M solido |
| Q4_K_M plano estandar | 17,10 GB | 15,93 GiB | 4,50 | ~6,22 a 6,28 | +0,22 a +0,28 (+3,7 %) | Compromiso industrial estandar |
| Q3_K_M plano estandar | 13,50 GB | 12,57 GiB | 3,44 | ~6,45 a 6,70 | +0,45 a +0,70 (+7,5 %) | Caida perceptible de sintaxis y ruido de razonamiento |
| APEX Mini generico (IQ2_S) | 10,20 GB | 9,50 GiB | 2,50 | ~7,10 a 7,80+ | +1,10 a +1,80+ (+18,3 %) | Ruptura severa del razonamiento |

## Requisitos de hardware

- Huella de pesos: 11,08 GiB en memoria una vez cargado el GGUF de 11,90 GB en disco, segun el autor.
- VRAM estimada para inferencia: 11,08 GiB solo de pesos; hay que sumar la cache KV de las 17 capas de atencion completa, que crece con la longitud de contexto. El autor afirma que la ventana completa de 256K cabe en una GPU de 24 GB, pero no publica el desglose de memoria de la cache.
- GPU de 16 GB: el autor indica que el modelo se ejecuta integramente en VRAM en GPUs de 16 GB (por ejemplo, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080); el contexto utilizable en ese caso sera inferior a 256K.
- GPU de 24 GB: RTX 3090, RTX 4090, A5000 y similares; es el escenario para el que el autor reclama el contexto completo de 256K.
- GPU de 48 GB o mas: A6000, L40S, A100 80 GB, H100; utiles para servir varias instancias concurrentes o aumentar el lote.
- Despliegue: llama.cpp, llama-server (API compatible con OpenAI segun el tag `endpoints_compatible`), y por compatibilidad de formato, Ollama, LM Studio y koboldcpp.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Comparativa dentro de la propia familia de publicaciones del autor, que es la unica informacion verificable disponible:

| Modelo | Parametros | Contexto | Formato / tamano | Perplejidad declarada | Licencia |
|---|---|---|---|---|---|
| Este repositorio (NanoPlus) | 27,3 B densos | 256K | GGUF, 11,90 GB, 2,85 BPW | 6,4238 (+7,06 %) | Apache 2.0 |
| Huihui-Qwen3.8-27B-Abliterated VAL-APEX-I MiniPlus V2.1 | 27,3 B densos | 256K | GGUF, 15,33 GB, 3,93 BPW | 6,1466 (+2,44 %) | Apache 2.0 |
| Huihui-Qwen3.8-27B-abliterated (BF16 base) | 27,3 B densos | 256K | Safetensors, 54,00 GB | Referencia (~6,0000) | Apache 2.0 |
| Qwen3.8-27B-EfficientThink-Uncensored VAL-APEX-I MiniPlus V2.1 | no disponible | no disponible | GGUF | no disponible | no disponible |

No se dispone de datos de benchmarks de capacidades ni de comparaciones con modelos de otros autores dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento frente a alternativas externas.

## Limitaciones y advertencias

- Modelo "abliterated": la direccion de rechazo ha sido eliminada, por lo que no aplica ninguna garantia de alineacion de seguridad. Puede generar contenido que el modelo original rechazaria, incluido material danino o ilegal. No es apto para despliegues de cara al publico sin filtros adicionales.
- Idioma: unicamente ingles declarado en los metadatos. No hay evidencia de capacidades en castellano ni en otros idiomas.
- Perdida de calidad por cuantizacion: el propio autor mide un incremento de perplejidad del 7,06 % frente a BF16, con un margen de error de +/- 0,4960. Es peor que el Q4_K_M plano estandar (+3,7 %) a pesar de ocupar 5,2 GB menos, por lo que la equivalencia declarada con "Q4_K_M solido" es una estimacion del autor, no una medicion de capacidades.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje de esta escala y no cuantificado en la informacion disponible.
- Advertencia del autor sobre penalizacion por repeticion: un valor inadecuado provoca intercambio de caracteres en la salida, especialmente critico al generar codigo. Requiere ajuste manual antes de ponerlo en produccion.
- Deriva del estado recurrente: el autor documenta que las cuantizaciones planas genericas sufren acumulacion de deriva en las capas SSM y rompen los delimitadores `<think>`; esta receta lo mitiga manteniendo `ssm_*` en F32, pero no elimina el riesgo en contextos muy largos.
- Benchmarks autodeclarados: las cifras de perplejidad provienen del propio publicador, sobre un unico conjunto (WikiText-2 a 512 tokens de contexto) y con una sola semilla de evaluacion. No hay verificacion independiente ni pruebas de MMLU, HumanEval o GSM8K.
- Trazabilidad del modelo base: la informacion proporcionada no detalla el proceso de ablacion ni los datos de entrenamiento del checkpoint original de 27,3 B, por lo que no es posible auditar su procedencia completa.
- Licencia: Apache 2.0 declarada en el repositorio, lo que en principio permite uso comercial, pero conviene verificar que la licencia del checkpoint base sea compatible, ya que la model card no detalla las condiciones heredadas.
- Fechas de publicacion: el repositorio figura creado el 6 de octubre de 2026 y con 0 descargas y 0 me gusta, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Version hermana MiniPlus V2.1: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-MiniPlus-V2.1-GGUF
- Especialista en razonamiento sintetico: https://huggingface.co/IsValorum/Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-MiniPlus-V2.1-GGUF
- Coleccion VAL-APEX-I: https://huggingface.co/collections/IsValorum/val-apex-i-6ac563d1784a04a1bb177f47
- Coleccion APEX-I-MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-current-6aac8d4766a28a024e8bb104
- Coleccion APEX-I-NanoPlus: https://huggingface.co/collections/IsValorum/apex-i-nanoplus-6ab41467c988a1b1cb9b83bc
- Paper, blog o repositorio del modelo base: no disponible en la informacion proporcionada.
