# axteam/GLM-4-9B-0414-GGUF

## Resumen

GLM-4-9B-0414-GGUF es la distribucion cuantizada en formato GGUF del modelo `zai-org/GLM-4-9B-0414`, publicado por el usuario `axteam`. El modelo original es un transformer de 9.400.279.040 parametros (aproximadamente 9,4 mil millones) desarrollado por Z.ai (organizacion `zai-org`), orientado a generacion de texto conversacional. Esta version GGUF esta pensada para su uso con llama.cpp, Ollama y LM Studio, lo que permite ejecutar el modelo en hardware de consumo sin necesidad de GPUs de datacenter.

El repositorio incluye seis cuantizaciones k-quant (Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0), generadas mediante cuantizacion post-entrenamiento (PTQ) con las herramientas oficiales de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`). No se ha realizado reentrenamiento ni ajuste fino adicional: se trata de una conversion directa de los pesos BF16 originales con asignacion de bits por bloques. La plantilla de chat original (`chat_template`) queda embebida en cada fichero GGUF.

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo GLM-4-9B-0414 con requisitos de memoria que van desde 4,0 GB (Q2_K) hasta 10,0 GB (Q8_0), cubriendo desde GPUs de consumo modestas hasta estaciones de trabajo. El autor ha publicado mediciones de perplejidad sobre WikiText-2 y sobre una muestra de Wikipedia en coreano, lo que aporta datos objetivos sobre la perdida de calidad de cada nivel de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `glm4` en llama.cpp) |
| Parametros totales | 9.400.279.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de llama.cpp usan `-c 8192`) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (k-quants de llama.cpp) |
| Idiomas soportados | no disponible (el autor incluye pruebas en ingles y coreano) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base original esta en safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo base `zai-org/GLM-4-9B-0414` es un transformer de aproximadamente 9,4 mil millones de parametros. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones arquitectonicas concretas (atencion lineal, decodificacion especulativa, etc.) mas alla de la identificacion de la arquitectura como `glm4` en llama.cpp.

La version aqui descrita es una cuantizacion post-entrenamiento (PTQ) sin reentrenamiento, realizada con `convert_hf_to_gguf.py` seguida de `llama-quantize`. La cuantizacion es por bloques (k-quants: escalas por bloque con asignacion mixta de bits). Cada fichero GGUF incorpora la plantilla de chat original del modelo, lo que permite su uso conversacional directo en llama.cpp, Ollama y LM Studio sin configuracion adicional de prompt.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat embebida en cada fichero GGUF.
- Razonamiento y respuesta a preguntas generales (el autor verifica respuestas correctas sobre capitales de Francia y Corea).
- Soporte multilingue parcial: se han publicado mediciones de perplejidad en ingles y coreano, lo que evidencia competencia al menos en esos dos idiomas.
- Compatibilidad con la API compatible con OpenAI de `llama-server` (endpoint `/v1/chat/completions`).
- Uso mediante linea de comandos interactiva (`llama-cli`) y servidor (`llama-server`).
- Integracion con Ollama (`ollama run hf.co/axteam/GLM-4-9B-0414-GGUF:Q4_K_M`) y LM Studio.
- Soporte de plantilla Jinja (`--jinja`) para el formateo de conversaciones.
- No se dispone de informacion sobre tool calling, function calling, modo thinking, vision, audio ni capacidades de agente multi-paso en la documentacion proporcionada.

## Casos de uso

- Asistente conversacional local en estacion de trabajo: con la cuantizacion Q4_K_M (6,2 GB) el modelo cabe en GPUs de consumo de 8 GB o mas, permitiendo desplegar un chatbot privado sin dependencia de APIs externas ni envio de datos a terceros.
- Prototipado rapido de aplicaciones de texto: `llama-server` expone una API compatible con OpenAI en el puerto 8080, de modo que se puede apuntar cualquier cliente existente (SDK de OpenAI, LangChain, etc.) al servidor local cambiando unicamente la URL base.
- Despliegue en entornos con memoria limitada: la version Q2_K (4,0 GB) permite ejecutar el modelo en GPUs de 4-6 GB, asumiendo una perdida de calidad medible (perplejidad +26,5 % en ingles respecto a Q8_0), adecuada para tareas de baja exigencia o generacion de borradores.
- Evaluacion comparativa de cuantizaciones: los datos de perplejidad publicados (WikiText-2 y Wikipedia en coreano) permiten seleccionar el nivel de cuantizacion segun el compromiso calidad/memoria requerido, con cifras concretas para cada fichero.
- Procesamiento de texto en coreano e ingles: las mediciones de perplejidad en coreano (4,84 en Q8_0) y los ejemplos de consulta en ese idioma indican un uso viable para tareas de generacion y respuesta en ambos idiomas.
- Integracion en flujos de trabajo de escritorio con LM Studio: busqueda del repositorio en el navegador de modelos y seleccion de la cuantizacion, lo que facilita a desarrolladores sin experiencia en linea de comandos probar el modelo.
- Servicio de generacion de texto en CPU o GPU mixta: al ser GGUF compatible con llama.cpp, permite dividir capas entre GPU y CPU, habilitando despliegues en equipos sin GPU dedicada de gran capacidad.

## Benchmarks y rendimiento

El autor publica mediciones de perplejidad (PPL) sobre 16 ventanas de 2.048 tokens de WikiText-2 (test) y de una muestra de Wikipedia en coreano, ejecutadas en una NVIDIA B200 con llama.cpp b12005 (commit e0f142d, build CUDA) y todas las capas en GPU. Como el repositorio no incluye fichero BF16, los porcentajes se expresan respecto a Q8_0, el fichero mas cercano al original.

| Fichero | PPL WikiText-2 | PPL wiki coreano | vs Q8_0 (EN / KO) |
|---|---|---|---|
| GLM-4-9B-0414-Q8_0.gguf | 8,10 | 4,84 | referencia |
| GLM-4-9B-0414-Q6_K.gguf | 8,12 | 4,85 | +0,3 % / +0,1 % |
| GLM-4-9B-0414-Q5_K_M.gguf | 8,13 | 4,88 | +0,4 % / +0,7 % |
| GLM-4-9B-0414-Q4_K_M.gguf | 8,22 | 4,93 | +1,4 % / +1,8 % |
| GLM-4-9B-0414-Q3_K_M.gguf | 8,61 | 5,13 | +6,3 % / +6,0 % |
| GLM-4-9B-0414-Q2_K.gguf | 10,25 | 6,27 | +26,5 % / +29,5 % |

El propio autor advierte que 16 ventanas por texto constituyen una muestra pequena y que diferencias de pocos puntos porcentuales entre ficheros estan dentro del ruido de muestreo (remidieron dos repositorios con 64 ventanas y las diferencias se movieron hasta unos 19 puntos). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4,0 GB (Q2_K) y 10,0 GB (Q8_0) para los pesos, mas la cache KV correspondiente al contexto configurado con `-c`.
- Reduccion de cache KV: la opcion `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce a la mitad el consumo de cache KV.
- GPU recomendadas: el autor valido todos los ficheros en una NVIDIA B200 con todas las capas en GPU. Para Q4_K_M (6,2 GB) es suficiente una GPU de 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070); Q8_0 (10,0 GB) requiere 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, A100, H100).
- Cabe en GPU de consumo: si, todas las cuantizaciones excepto potencialmente Q8_0 en GPUs de 8 GB. Q2_K y Q3_K_M caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp (build >= b6325; la arquitectura `glm4` requiere >= b5115 y `-fa on` requiere >= b6325), Ollama y LM Studio. El autor indica que Ollama y LM Studio no fueron probados en su entorno.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo reporta que todas las cuantizaciones respondieron correctamente a dos preguntas cortas de chat y que se midio la perplejidad en B200.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) del modelo base en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales. Se comparan alternativas de tamano similar (aproximadamente 9 mil millones de parametros) disponibles en formato GGUF.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| GLM-4-9B-0414 (este repo) | 9,4 B | no disponible | MIT | Si (6 cuantizaciones) | Mediciones de PPL publicadas en EN y KO |
| Gemma 2 9B | 9,2 B | no disponible | Gemma Terms | Si (comunidad) | Requiere aceptacion de terminos de uso |
| Llama 3.1 8B | 8,0 B | no disponible | Llama 3.1 Community License | Si (comunidad) | Restricciones de licencia para uso comercial a gran escala |
| Qwen 2.5 7B | 7,6 B | no disponible | Apache 2.0 | Si (comunidad) | Alternativa permisiva de tamano inferior |

La ventaja principal de este repositorio frente a las alternativas es la licencia MIT, que permite uso comercial sin restricciones adicionales, junto con la publicacion de mediciones de perplejidad por cuantizacion. La desventaja es la ausencia de benchmarks estandar publicados en la informacion disponible, lo que impide comparar rendimiento en tareas concretas.

## Limitaciones y advertencias

- La cuantizacion Q2_K presenta una perdida de calidad significativa: +26,5 % de perplejidad en ingles y +29,5 % en coreano respecto a Q8_0. No se recomienda para tareas que requieran precision.
- Las mediciones de perplejidad se basan en 16 ventanas de 2.048 tokens, una muestra pequena segun el propio autor; diferencias de pocos puntos porcentuales entre cuantizaciones pueden estar dentro del ruido de muestreo.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo que limita la evaluacion objetiva del rendimiento en tareas concretas.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion especifico del modelo ni limitaciones de contexto o idioma mas alla de los datos de perplejidad en ingles y coreano.
- La longitud de contexto del modelo no se especifica en la documentacion; los ejemplos usan `-c 8192`, pero no se confirma que sea el maximo soportado.
- Ollama y LM Studio no fueron probados por el autor en su entorno de validacion; su funcionamiento se infiere de la compatibilidad de formato, no de pruebas publicadas.
- La licencia MIT del repositorio de cuantizacion se hereda del modelo base; los pesos y el tokenizer originales pertenecen a Z.ai / zai-org. Se debe verificar que la licencia MIT del modelo base cubre el uso previsto.
- El repositorio tiene un volumen de descargas bajo (1.321) y un solo like, lo que sugiere una validacion comunitaria limitada.
- La fecha de creacion del repositorio (2026-10-30) y la del modelo base deben verificarse contra la disponibilidad real de la arquitectura `glm4` en las builds de llama.cpp indicadas (>= b5115 para la arquitectura, >= b6325 para `-fa on`).

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/axteam/GLM-4-9B-0414-GGUF
- Modelo base original: https://huggingface.co/zai-org/GLM-4-9B-0414
- Herramienta de conversion de llama.cpp (`convert_hf_to_gguf.py`): no disponible como enlace directo en la informacion proporcionada
- Documentacion de llama.cpp: no disponible como enlace directo en la informacion proporcionada
- Ollama: no disponible como enlace directo en la informacion proporcionada
- LM Studio: no disponible como enlace directo en la informacion proporcionada
