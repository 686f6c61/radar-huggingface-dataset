# Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium-GGUF

## Resumen

Alpina Endas 2.2-AoM-10B-Medium es un repositorio de pesos GGUF publicado por Convergent-ch que agrupa cinco modelos derivados de Qwen, afinados de forma independiente y empaquetados bajo la etiqueta "AoM" (ensemble orquestado de modelos, segun la nomenclatura del autor). No se trata de una red neuronal fusionada: son cinco miembros separados, un divisor de entrada de clase 7B y cuatro especialistas de clase 0,8B, que el autor presenta como un conjunto descargable de aproximadamente 7,93 GB en total y 10.625.188.608 parametros sumados entre los cinco ficheros.

El miembro mayor, denominado input-divisor, se obtiene de Qwen2.5-7B-Instruct mediante QLoRA NF4 de rango 8, y actua como planificador o enrutador de la entrada. Los cuatro especialistas (coder_builder, coder_reviewer, math y logic_science) parten de Qwen3.5-0.8B y se afinan con LoRA BF16 de rango 16 sobre datos sinteticos y subconjuntos de smoltalk, bigcode, GSM8K y ARC. Todos los adaptadores se fusionaron en los pesos BF16 originales antes de exportar a GGUF.

La relevancia de esta publicacion es acotada y experimental: el propio autor la describe como una especializacion de datos pequenos, entrenada en una unica RTX 3060 Ti, sin aplicacion de escritorio ni orquestacion incluida. El repositorio contiene pesos y metadatos, no logica ejecutable de enrutamiento ni instalador, por lo que el valor practico depende de que el usuario construya su propio pipeline de orquestacion sobre Ollama u otro runtime compatible con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-7B-Instruct y Qwen3.5-0.8B) |
| Parametros totales | 10.625.188.608 (10,63B) sumados entre los cinco miembros GGUF; el mayor, input-divisor, tiene 7.615.616.512 |
| Parametros activos | No aplica (no es MoE; son cinco modelos independientes) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (input-divisor) y Q8_0 (los cuatro especialistas) |
| Idiomas soportados | Ingles (`en` en la model card y en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; los adaptadores se fusionaron previamente en pesos BF16 |

## Arquitectura y entrenamiento

Los cinco miembros son transformers decoder-only derivados de la familia Qwen. El input-divisor parte de Qwen2.5-7B-Instruct y se adapta con QLoRA en NF4 de rango 8; los cuatro especialistas parten de Qwen3.5-0.8B y se adaptan con LoRA BF16 de rango 16. En ambos casos los adaptadores se fusionaron en los pesos BF16 originales antes de generar las exportaciones GGUF. El modelo fuente completo suma 11.027.560.192 parametros (11,03B), incluyendo pesos de vision que se omiten en las cuatro exportaciones de especialistas, que son solo de texto; los pesos completos entrenados se conservan localmente segun el autor.

Los datos de entrenamiento son acotados y en buena parte sinteticos: el input-divisor se entrena con patrones de enrutamiento sinteticos y acotados; el revisor de codigo con un conjunto pequeno de patrones de bugs sinteticos; el generador de codigo con el subconjunto self-oss-instruct de HuggingFaceTB/smoltalk y ejemplos de bigcode/self-oss-instruct-sc2-exec-filter-50k; matematicas con ejemplos de entrenamiento de GSM8K; y logica/ciencia con ejemplos de entrenamiento de ARC y tareas deductivas sinteticas. No se documenta RLHF ni DPO, ni el volumen de tokens de entrenamiento. El autor advierte explicitamente que una perdida de validacion baja sobre ejemplos derivados de plantillas no establece capacidad general ni mejoras amplias en benchmarks.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de las bases Qwen.
- Enrutamiento y planificacion de entrada mediante el miembro input-divisor (clase 7B), pensado para dividir consultas hacia especialistas.
- Generacion de codigo con el miembro coder_builder, afinado sobre datos self-oss-instruct.
- Revision de codigo con coder_reviewer, orientado a la deteccion de patrones de bugs (el autor advierte que puede emitir criticas irrelevantes o incorrectas).
- Resolucion de problemas matematicos con el miembro math, afinado sobre GSM8K.
- Razonamiento logico y cientifico con logic_science, afinado sobre ARC y tareas deductivas sinteticas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no integrado; el propio autor indica que la orquestacion de chat grupal no esta incluida en Ollama estandar.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en estas exportaciones; la torre de vision de los especialistas se omite en los GGUF de texto.

## Casos de uso

- Enrutamiento de consultas en un pipeline propio: usar el miembro input-divisor como clasificador o planificador que decida si una peticion va al especialista de codigo, matematicas o logica, construyendo la orquestacion fuera del repositorio, ya que este solo aporta pesos.
- Asistencia de generacion de codigo en local: cargar coder_builder en Ollama con `ollama create` y el `Modelfile-*` correspondiente para autocompletar o generar fragmentos en un flujo de trabajo de desarrollo con recursos limitados (0,81 GB en Q8_0).
- Revision automatizada de parches en pre-commit: emplear coder_reviewer para senalar patrones de bugs conocidos en diffs pequenos, aceptando que sus criticas pueden ser incorrectas y requieren validacion humana.
- Practica de problemas de matematicas de nivel escolar: usar el miembro math, afinado sobre GSM8K, para generar soluciones paso a paso en entornos educativos o de evaluacion interna, sin garantia de exactitud fuera de la distribucion de entrenamiento.
- Razonamiento logico y preguntas de ciencia de nivel ARC: emplear logic_science para tareas deductivas acotadas o generacion de explicaciones en un corpus de divulgacion cientifica, con revision posterior obligatoria por la posibilidad de respuestas inexactas.
- Experimentacion e investigacion sobre ensembles de modelos pequenos: el repositorio sirve como banco de pruebas para estudiar enrutamiento, especializacion con LoRA y despliegue multi-modelo en una sola GPU consumer, dado que todos los miembros caben en una RTX 3060 Ti.
- Despliegue educativo en hardware modesto: los cuatro especialistas en Q8_0 ocupan 0,81 GB cada uno y el input-divisor 4,68 GB en Q4_K_M, lo que permite montar un laboratorio de agentes especializados sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta cifras de MMLU, HumanEval, GSM8K ni ARC para ninguno de los cinco miembros, y advierte que la perdida de validacion baja sobre ejemplos derivados de plantillas no constituye evidencia de capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: el input-divisor en Q4_K_M ocupa 4,68 GB en disco y requiere aproximadamente 5-6 GB de VRAM con overhead de contexto; cada especialista en Q8_0 ocupa 0,81 GB y requiere aproximadamente 1-1,5 GB de VRAM.
- Ejecucion conjunta: cargar los cinco miembros simultaneamente exige del orden de 9-11 GB de VRAM, segun el contexto configurado y el runtime.
- GPU recomendadas: el autor entreno los modelos en una RTX 3060 Ti, por lo que esa GPU (8 GB) es suficiente para ejecutar los miembros de uno en uno; para cargar el conjunto completo se recomienda una RTX 4090 (24 GB) o una A100/H100 en entornos de servidor.
- Cabe en GPU consumer: si, individualmente en GPUs de 8 GB o mas; el conjunto completo requiere 12 GB o mas.
- Opciones de despliegue: Ollama mediante `Modelfile-*` incluidos en el repositorio; llama.cpp por ser formato GGUF; otros runtimes compatibles con GGUF no estan documentados por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpina Endas 2.2-AoM-10B-Medium | 10,63B sumados (5 miembros; mayor de 7,6B) | No disponible | Apache 2.0 | GGUF en Hugging Face | Ensemble experimental de 5 modelos, sin orquestacion incluida |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (fuente original) | Apache 2.0 | Safetensors y GGUF en Hugging Face | Base del input-divisor; modelo unico con benchmarks publicados |
| Qwen3.5-0.8B | 0,8B | No disponible en esta ficha | Apache 2.0 | Safetensors en Hugging Face | Base de los cuatro especialistas; modelo unico |
| Llama 3.2 1B Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | Safetensors y GGUF | Alternativa monolitica de tamano similar a los especialistas, con licencia no Apache |

La comparacion directa es dificil porque Alpina Endas no es un modelo unico sino un conjunto de cinco. Frente a Qwen2.5-7B-Instruct, el input-divisor anade un afinado de enrutamiento pero no mejora las capacidades base de forma demostrada. Frente a los especialistas de 0,8B, un modelo monolitico como Llama 3.2 1B ofrece contexto documentado y benchmarks publicados, a cambio de una licencia mas restrictiva.

## Limitaciones y advertencias

- No es un modelo fusionado: son cinco redes independientes; el total de 10,63B es una suma aritmetica, no un unico grafo computacional.
- Entrenamiento con datos pequenos y en gran parte sinteticos: el autor advierte que la especializacion es experimental y que la perdida de validacion baja sobre plantillas no implica capacidad general.
- El revisor de codigo puede producir criticas irrelevantes o incorrectas; el codigo generado no se ejecuta ni se prueba automaticamente.
- Las respuestas cientificas pueden ser inexactas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano y agravado por el entrenamiento acotado; no se documentan mitigaciones.
- Idioma: solo ingles segun los metadatos; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada; no se debe asumir la ventana de las bases Qwen sin verificacion.
- Sin orquestacion incluida: el repositorio contiene pesos y metadatos, no logica ejecutable de enrutamiento ni instalador; Ollama estandar no monta el chat grupal entre miembros.
- Vision omitida: las exportaciones de los especialistas son solo de texto; la torre de vision no esta disponible en estos GGUF.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los de las bases Qwen y los de los datasets sinteticos empleados.
- Licencia Apache 2.0 permite uso comercial, pero la calidad experimental y la falta de benchmarks desaconsejan su uso en produccion sin evaluacion previa.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium-GGUF
- Pagina principal del modelo: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium
- Modelo base del input-divisor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base de los especialistas: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de codigo: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset de codigo: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
