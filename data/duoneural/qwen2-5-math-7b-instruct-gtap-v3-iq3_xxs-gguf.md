# DuoNeural/Qwen2.5-Math-7B-Instruct-GTAP-v3-IQ3_XXS-GGUF

## Resumen

DuoNeural/Qwen2.5-Math-7B-Instruct-GTAP-v3-IQ3_XXS-GGUF es un checkpoint cuantizado en formato GGUF del modelo Qwen/Qwen2.5-Math-7B-Instruct, publicado por el laboratorio DuoNeural Research Lab (Jesse Caldwell, Archon y Aura). El atractivo principal es que no se trata de una cuantizacion estandar: el autor aplica una metodologia propia denominada Generalized Thouless-Anderson-Palmer (G-TAP v3) que, segun su model card, precondiciona los pesos de las capas SwiGLU W_down antes de la discretizacion para reducir el ruido numerico en cadenas de deduccion algebraica.

El modelo conserva la arquitectura del original: un transformer decoder-only de 7B parametros con 28 capas, atencion GQA con relacion 28:4 y FFN SwiGLU. La cuantizacion se realiza a IQ3_XXS (~3,2 bits por peso), lo que da un archivo de 2,90 GiB muy facil de desplegar en hardware consumer. El objetivo declarado es mantener el razonamiento matematico de varios pasos en niveles de cuantizacion por debajo de 4 bits, donde las tecnicas de post-training quantization convencionales tienden a degradar la aritmetica simbolica.

Conviene tratarlo con cautela: el propio autor lo etiqueta como "released experimental, pending further verification", y todas las metricas de rendimiento proceden de su propio laboratorio, con muestras muy pequenas y sin replicacion independiente. La terminologia fisica empleada (transiciones de vidrio 1-RSB, convexidad de replicon) no cuenta con validacion externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA 28:4 y FFN SwiGLU, 28 capas (heredada de Qwen2.5-Math-7B-Instruct) |
| Parametros totales | 7B (nominal, segun el modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (valor empleado en el ejemplo de inferencia del autor); ampliacion no disponible |
| Tipos de cuantizacion | GGUF IQ3_XXS (~3,2 bits por peso, 2,90 GiB); no se publican otras variantes en este repositorio |
| Idiomas soportados | no disponible en la ficha; el modelo base esta orientado a matematicas en ingles y chino |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Math-7B-Instruct: un transformer decoder-only de 7B parametros organizado en 28 capas, con Grouped Query Attention en una configuracion 28:4 (28 cabezas de query frente a 4 de key/value) y una red feed-forward con activacion SwiGLU. El modelo base fue entrenado por el equipo Qwen con un pipeline de auto-mejora que abarca preentrenamiento, postentrenamiento e inferencia, e incluye soporte de Tool-Integrated Reasoning (TIR) para ejecutar codigo y verificar resultados numericos.

Sobre esa base, DuoNeural aplica G-TAP v3, un esquema de cuantizacion que el autor describe mediante tres mecanismos: amortiguamiento de cavidad de Onsager, que actua como filtro de ruido durante la discretizacion de pesos; convexidad de replicon (lambda_R > 0), orientada a evitar transiciones de vidrio 1-RSB que "congelarian" la seleccion de tokens; y conservacion de ganancia radial, que impone igualdad de norma de Frobenius entre pesos cuantizados y originales para preservar la escala numerica a lo largo de los 28 bloques. No se especifica el numero de tokens de calibracion, la composicion del dataset ni si hubo RLHF o DPO adicional en esta version cuantizada. Toda la formulacion teorica procede unicamente de la model card del autor y carece de verificacion por terceros.

## Capacidades

- Generacion de texto y razonamiento matematico de varios pasos (deducciones algebraicas encadenadas).
- Resolucion de problemas aritmeticos y de competicion (GSM8K, problemas de olimpiada, segun los datos del autor).
- Generacion y ejecucion de codigo Python de caracter simbolico/matematico (el modelo base soporta TIR).
- Modo instruct: sigue instrucciones en formato conversacional, heredado del modelo base.
- Razonamiento multi-paso con cadena de pensamiento (CoT), caracteristica central de la familia Qwen2.5-Math.
- Capacidades multilingues: no disponibles en la ficha; el modelo base esta centrado en matematicas en ingles y chino.
- Soporte de tool calling / function calling: no confirmado en esta ficha, aunque el modelo base ofrece TIR via Qwen-Agent.
- Soporte de agentes: no confirmado especificamente para este checkpoint.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Tutoria matematica paso a paso: el modelo puede desglosar la resolucion de un problema de algebra o calculo en varios pasos, aprovechando su entrenamiento especifico en CoT para fines educativos.
- Verificacion de calculos en pipelines de analisis: integrarlo como comprobador de resultados simbolicos dentro de un flujo de validacion numerica, aprovechando su capacidad para generar y razonar sobre expresiones de Python.
- Generacion de ejercicios y soluciones: producir problemas de practica con su desarrollo completo para plataformas de e-learning, apoyandose en su orientacion matematica.
- Asistente de investigacion para derivaciones: ayudar a explorar pasos intermedios en demostraciones o manipulaciones algebraicas, siempre con supervision humana por el riesgo de alucinacion.
- Despliegue en hardware limitado: al ocupar 2,90 GiB, puede ejecutarse en portatiles o estaciones sin GPU dedicada mediante llama.cpp, lo que permite prototipar asistentes matematicos en local.
- Backend de razonamiento en aplicaciones offline: por su tamano reducido y formato GGUF, encaja como motor de inferencia en entornos sin conectividad o con restricciones de privacidad de datos.
- Comparacion metodologica de cuantizacion: util como artefacto de investigacion para estudiar si el precondicionamiento G-TAP conserva la calidad matematica frente a cuantizaciones GGUF estandar al mismo nivel de bits.

## Benchmarks y rendimiento

Todos los resultados siguientes son autodeclarados por el autor en la model card y no han sido replicados por terceros. Las muestras son muy pequenas, por lo que la incertidumbre estadistica es elevada.

| Benchmark | Resultado reportado | Tamano de muestra |
|---|---|---|
| GSM8K (matematicas multipaso) | 100,0% (25/25) | 25 problemas |
| Matematicas de competicion y olimpiada | 86,7% (13/15) | 15 problemas |
| Tests unitarios de Python simbolico | 90,0% (9/10) | 10 tests |
| Perplejidad holdout continuo | 8,8889 | 131.000 tokens |
| Throughput de decodificacion | 172,8 t/s | NVIDIA RTX 4080 Super (32 GB VRAM) |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base sin cuantizar ni frente a cuantizaciones GGUF convencionales, por lo que no es posible aislar el efecto real de G-TAP v3.

## Requisitos de hardware

- Peso del archivo: 2,90 GiB, lo que determina el minimo de memoria para los pesos.
- VRAM estimada para inferencia: en torno a 3 GB para los pesos mas el KV cache; con 4096 tokens de contexto y GQA 28:4, el KV cache es reducido, por lo que un total de ~4 GB es un presupuesto realista.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. El autor valida el rendimiento en una RTX 4080 Super (172,8 t/s); funcionaria igualmente en RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, holgadamente. Tambien puede ejecutarse integramente en CPU con memoria RAM suficiente.
- Opciones de despliegue: llama.cpp (llama-cli / llama-server), Ollama, LM Studio, llama-cpp-python o koboldcpp. Al ser formato GGUF, no es compatible con vLLM ni con TGI sin conversion previa a safetensors.
- Latencia y throughput: 172,8 t/s de decodificacion reportados por el autor en RTX 4080 Super con `-ngl 99`. No hay datos de latencia para CPU u otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (GTAP-v3 IQ3_XXS) | 7B | 4096 | GGUF IQ3_XXS (~3,2 bpw) | apache-2.0 | Cuantizacion experimental G-TAP; metricas autodeclaradas y sin replicar |
| Qwen2.5-Math-7B-Instruct | 7B | 4096 | safetensors (BF16) | apache-2.0 | Modelo base sin cuantizar; referencia de calidad matematica maxima de la familia |
| Cuantizacion GGUF IQ3_XXS estandar | 7B | 4096 | GGUF IQ3_XXS | apache-2.0 | Mismo nivel de bits sin precondicionamiento G-TAP; comparacion metodologica directa |
| Qwen2.5-Math-72B-Instruct | 72B | no disponible | safetensors | apache-2.0 | Alternativa de mayor escala y mejor rendimiento declarado por Qwen, pero requiere hardware muy superior |

No se dispone de datos verificados que permitan afirmar que este checkpoint supere a una cuantizacion GGUF convencional al mismo nivel de bits.

## Limitaciones y advertencias

- Caracter experimental: el propio autor lo marca como pendiente de verificacion y validacion empirica. No debe tratarse como un artefacto de produccion sin pruebas propias.
- Metricas no replicadas: los resultados de GSM8K, competicion y Python proceden de muestras de 25, 15 y 10 problemas, insuficientes para conclusiones robustas.
- Terminologia sin respaldo externo: la base teorica de G-TAP v3 (transiciones de vidrio 1-RSB, convexidad de replicon) no cuenta con publicaciones revisadas por pares ni validacion independiente.
- Perdida de precision por cuantizacion: a ~3,2 bits por peso, es esperable cierta degradacion frente al modelo en BF16, especialmente en tareas fuera del dominio matematico.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede producir derivaciones plausibles pero incorrectas; en matematicas esto es especialmente peligroso y exige verificacion.
- Limitaciones de idioma: la ficha no declara idiomas soportados; el modelo base esta centrado en matematicas en ingles y chino, por lo que el rendimiento en castellano no esta garantizado.
- Contexto limitado: 4096 tokens es una ventana corta para conversaciones largas o documentos extensos; no se documenta ampliacion via YaRN u otras tecnicas.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar tambien las condiciones del modelo base Qwen2.5-Math-7B-Instruct, ya que se heredan en la obra derivada.
- Sin soporte confirmado de tool calling ni de agentes en este checkpoint concreto: las capacidades TIR del modelo base pueden no conservarse tras la cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/Qwen2.5-Math-7B-Instruct-GTAP-v3-IQ3_XXS-GGUF
- Organizacion del autor: https://huggingface.co/DuoNeural
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-7B-Instruct
- Qwen2.5-Math-7B: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Informe tecnico (arXiv HTML): https://arxiv.org/html/2409.12122v1
- Informe tecnico (arXiv abstract): https://arxiv.org/abs/2409.12122v1
- Repositorio GitHub QwenLM/Qwen2.5-Math: https://github.com/QwenLM/Qwen2.5-Math
