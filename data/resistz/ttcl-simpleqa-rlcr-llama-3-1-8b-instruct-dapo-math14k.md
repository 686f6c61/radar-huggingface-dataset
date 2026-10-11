# resistz/TTCL-SimpleQA-RLCR-Llama-3.1-8B-Instruct-DAPO-Math14K

## Resumen

TTCL-SimpleQA-RLCR-Llama-3.1-8B-Instruct-DAPO-Math14K es un ajuste fino de Llama 3.1 8B Instruct publicado por el usuario resistz en HuggingFace. El modelo encadena dos etapas de entrenamiento: primero un ajuste con RL sobre un conjunto de matematicas (DAPO-Math14K) y despues Test-time Calibration Learning (TTCL) sobre el benchmark SimpleQA, con el objetivo de mejorar la calibracion de la confianza que el modelo expresa en sus propias respuestas.

La innovacion principal es TTCL: a partir de multiples respuestas generadas por el propio modelo, se derivan senales de autosupervision tanto de correccion como de calibracion, lo que permite aprender a calibrar en tiempo de test sin disponer de etiquetas de referencia. Esto es relevante para pipelines de QA factual donde el sistema necesita saber cuando confiar en la respuesta y cuando abstenerse o escalar a revision humana.

El modelo tiene 8.030.261.248 parametros (aproximadamente 8,03 mil millones) y se distribuye unicamente en formato safetensors, con un repositorio de 16,1 GB. La model card es minimalista: se limita a indicar la licencia MIT y que TTCL se ha aplicado sobre SimpleQA partiendo de RLCR-Llama-3.1-8B-Instruct-DAPO-Math14K. No se documentan idiomas, pipeline, datos de entrenamiento ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors (sin GGUF, GPTQ ni AWQ en el repositorio) |
| Idiomas soportados | No disponible en la model card; Llama 3.1 8B Instruct declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | MIT (segun la model card) |
| Formato de pesos | safetensors |
| Modelo base | Llama 3.1 8B Instruct, via RLCR-Llama-3.1-8B-Instruct-DAPO-Math14K |
| Etapas de entrenamiento | DAPO sobre Math14K y Test-time Calibration Learning sobre SimpleQA |
| Tarea declarada | No disponible (pipeline no especificado en HuggingFace) |
| Tamano del repositorio | 16,1 GB |
| Fecha de publicacion | 2026-10-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion RMSNorm pre-normalizada, activacion SwiGLU, embeddings rotatorios (RoPE) y un vocabulario de 128.256 tokens. El recuento real de parametros en safetensors es de 8.030.261.248, coherente con la version de 8B de la familia.

Sobre esa base se aplican tres fases segun la nomenclatura del repositorio. La primera es un ajuste con DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization) sobre DAPO-Math-14K, un conjunto de problemas de matematicas. La segunda corresponde a la etapa etiquetada como RLCR, cuyas siglas no se desarrollan en la informacion disponible. La tercera es TTCL (Test-time Calibration Learning), descrita en el repositorio GitHub asociado como un metodo que deriva senales de autosupervision para correccion y calibracion a partir de multiples respuestas generadas por el modelo, permitiendo aprendizaje de calibracion en tiempo de test sin etiquetas de referencia. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas adicionales como RLHF o DPO mas alla de lo indicado.

## Capacidades

- Generacion de texto en ingles y, presumiblemente, en los idiomas cubiertos por el modelo base (no verificado para este ajuste).
- Razonamiento matematico, reforzado mediante el entrenamiento con DAPO sobre DAPO-Math-14K.
- Calibracion de la confianza en tareas de QA factual de respuesta corta, entrenada especificamente sobre el benchmark SimpleQA.
- Estimacion de correccion de sus propias respuestas mediante autosupervision generada en tiempo de test (TTCL).
- Seguimiento de instrucciones heredado de Llama 3.1 8B Instruct.
- Tool calling / function calling: no documentado para este ajuste; el modelo base Llama 3.1 8B Instruct si lo soporta.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas para este ajuste.
- Capacidades especiales: modo de calibracion de confianza; no hay vision, audio ni modo thinking explicito documentado.

## Casos de uso

- QA factual con abnegacion selectiva: el modelo puede devolver una respuesta junto a una confianza calibrada, de modo que el sistema descarte o marque las respuestas de baja confianza antes de mostrarselas al usuario. La etapa TTCL esta disenada precisamente para este escenario.
- Deteccion de alucinaciones en produccion: usar la confianza autoinformada como senal de enrutado para decidir si se responde directamente, se consulta una base documental o se escala a un revisor humano.
- Pipelines de RAG con control de incertidumbre: en lugar de forzar siempre una respuesta, el modelo puede indicar cuando la evidencia recuperada no basta, reduciendo afirmaciones no sustentadas.
- Tutoria y resolucion de problemas matematicos: el ajuste sobre DAPO-Math-14K lo hace adecuado para asistir en ejercicios paso a paso y para generar soluciones verificables en entornos educativos.
- Filtrado y anotacion de datos a escala: usar la confianza calibrada para priorizar que ejemplos de un corpus requieren revision humana, reduciendo el coste de anotacion.
- Investigacion en calibracion y aprendizaje por refuerzo: servir como punto de comparacion reproducible frente a la variante TTCL sobre Qwen3-8B del mismo autor, y como base para experimentos con TTCL en otros dominios.
- Evaluacion automatica tipo juez con confianza: clasificar respuestas cortas como correctas o incorrectas aportando un nivel de confianza, util en suites de evaluacion de LLM.
- Despliegue local o en una sola GPU: con 8,03B parametros y licencia MIT, es viable en hardware de gama alta de consumo para prototipos y entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion mencionado es que la etapa TTCL se ejecuta sobre el benchmark SimpleQA, pero no se aportan puntuaciones ni comparaciones numericas. Existe un ranking publico de SimpleQA mantenido por BenchLM.ai, aunque este modelo no figura en la informacion proporcionada.

| Benchmark | Resultado | Notas |
|---|---|---|
| SimpleQA | No disponible | Benchmark empleado para la fase TTCL, sin puntuacion publicada |
| MMLU | No disponible | Sin datos |
| GSM8K | No disponible | Sin datos pese al entrenamiento con DAPO-Math-14K |
| HumanEval | No disponible | Sin datos |

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 16,1 GB, lo que exige al menos 20-24 GB de VRAM contando cache KV y activaciones en contextos moderados.
- Cuantizacion INT8/FP8: alrededor de 8-10 GB de VRAM.
- Cuantizacion INT4 (GPTQ, AWQ o GGUF Q4_K_M): alrededor de 4,5-6 GB de VRAM, previa conversion, ya que el repositorio solo ofrece safetensors.
- GPU de datacenter recomendadas: A100 40 GB, A100 80 GB, H100, L40S 48 GB.
- GPU de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) en BF16 con contexto limitado; RTX 4080, 4070 Ti Super o similares de 16 GB con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI, SGLang y transformers para los pesos en safetensors; llama.cpp, Ollama o LM Studio requieren convertir previamente a GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TTCL-SimpleQA-RLCR-Llama-3.1-8B-Instruct-DAPO-Math14K | 8,03 B | No disponible (base: 128.000 tokens) | MIT | HuggingFace, 0 descargas | Ajuste DAPO-Math14K mas TTCL sobre SimpleQA |
| TTCL-SimpleQA-RLCR-Qwen3-8B-DAPO-Math14K | No disponible | No disponible | No disponible | HuggingFace | Mismo pipeline TTCL, base Qwen3-8B |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Ampliamente disponible | Modelo base sin las etapas DAPO ni TTCL |
| Qwen2.5 7B Instruct | Aproximadamente 7,6 B | No disponible en esta ficha | Apache 2.0 | Ampliamente disponible | Alternativa de tamano similar; no evaluada con TTCL |

No hay resultados de benchmarks publicados para este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad, sin poder establecer diferencias de rendimiento.

## Limitaciones y advertencias

- Modelo sin validacion externa: 0 descargas y 0 likes en HuggingFace, sin evaluaciones de terceros publicadas.
- Model card minima: no se documentan dataset de entrenamiento, hiperparametros, composicion de SimpleQA utilizada ni proceso de evaluacion.
- Riesgo de sobreajuste a SimpleQA: la calibracion aprendida en tiempo de test sobre un benchmark concreto puede no transferirse a otros dominios factuales.
- La calibracion verbalizada depende de la temperatura y del esquema de muestreo; cambios en la decodificacion pueden degradar la fiabilidad de la confianza estimada.
- Riesgo de alucinacion: como cualquier LLM, puede generar afirmaciones falsas con alta confianza, especialmente fuera de las distribuciones cubiertas por Math14K y SimpleQA.
- Idiomas: la model card no declara idiomas soportados; el rendimiento multilingue no esta verificado y probablemente sea inferior al del ingles.
- Licencia: el repositorio declara MIT, pero el modelo base Llama 3.1 lleva la Llama 3.1 Community License, que impone condiciones de redistribucion y una politica de uso aceptable. Conviene revisar la compatibilidad antes de un uso comercial o de redistribuir derivados.
- Sin informacion sobre alineamiento de seguridad, filtros de contenido ni evaluaciones de sesgo.
- Contexto largo no verificado en este ajuste: no hay datos sobre como se comporta la calibracion con prompts muy extensos.
- Repositorio de 16,1 GB: requiere espacio en disco y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/resistz/TTCL-SimpleQA-RLCR-Llama-3.1-8B-Instruct-DAPO-Math14K
- Coleccion TTCL del autor: https://huggingface.co/collections/resistz/test-time-calibration-learning-ttcl-models
- Modelo hermano basado en Qwen3-8B: https://huggingface.co/resistz/TTCL-SimpleQA-RLCR-Qwen3-8B-DAPO-Math14K
- Repositorio GitHub de TTCL (referencia al paper "Test-time Calibration Learning for Large Language Model Reasoning", identificador de arXiv no proporcionado): https://github.com/resistzzz/TTCL/tree/main
- Datos del proyecto TTCL: https://github.com/resistzzz/TTCL/tree/main/data
- Ranking de SimpleQA en BenchLM.ai: https://benchlm.ai/benchmarks/simpleqa
