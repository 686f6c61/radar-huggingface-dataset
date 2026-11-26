# mr-andrey-isachenko/Tenet-Qwen3-32B-Abliterated-Unslop-v2-GGUF

## Resumen

Tenet-Qwen3-32B-Abliterated-Unslop-v2-GGUF es un conjunto de cuantizaciones GGUF para llama.cpp del modelo Tenet-32B-Qwen3-Unslop-v2, un fine-tune del Qwen3-32B de Alibaba. El autor, mr-andrey-isachenko, lo describe como un ajuste quirúrgico de "de-refusal" y "de-slop" mediante su motor Lancet, orientado a eliminar los rechazos por alineamiento y el estilo de respuesta excesivamente prolijo o evasivo. El modelo base declarado es el checkpoint FP8 del mismo autor, y estas cuantizaciones se distribuyen con licencia Apache 2.0.

La particularidad técnica del repositorio no es el modelo en sí, sino el método de cuantización: en lugar de un `llama-quantize` uniforme, emplea una receta de precisión mixta guiada por CKA (análisis de similitud de representaciones) que protege las capas donde reside el subespacio del fine-tune, de modo que el comportamiento "abliterated" no se degrade bajo cuantización de 4-6 bits. La tasa media estimada es de 4,952 bits por peso, con capas seleccionadas en Q8_0 y Q6_K.

Con 32.762.123.264 parámetros (aproximadamente 32,8 mil millones) y un repositorio de 38,5 GB que cubre desde IQ4_XS hasta Q8_0, el modelo está pensado para despliegue local en llama.cpp, Ollama, LM Studio y Jan. Los benchmarks publicados por el autor sobre el checkpoint padre FP8 sitúan IFEval strict en 0,84, MATH-500 en 0,75 y MMLU-Pro en 0,65.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3-32B); no se especifican detalles adicionales en la informacion disponible |
| Parametros totales | 32.762.123.264 (aprox. 32,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE; la model card menciona "MoE checkpoints" solo como caso general de la receta) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama-cli usa `-c 16384` |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0; receta mixta CKA con bpw medio estimado de 4,952 |
| Idiomas soportados | no disponible (el campo de idiomas no esta poblado en Hugging Face) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el checkpoint padre se distribuye en FP8 |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune del Qwen3-32B, un transformer decoder-only de aproximadamente 32,8 mil millones de parametros. El autor no documenta en esta model card el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Lo que si se explicita es la naturaleza del ajuste: una intervencion quirurgica con el motor Lancet sobre el checkpoint Qwen3-32B, orientada a dos objetivos, la eliminacion de respuestas de rechazo ("de-refusal", etiquetado como abliterated) y la reduccion del estilo verboso o evasivo ("de-slop", etiquetado como unslop).

La innovacion tecnica destacable esta en el proceso de cuantizacion. La receta CKA-protected (`cka_quant_recipe.json`, incluida en el repositorio) identifica las capas cuyas activaciones transportan el subespacio del fine-tune y las mantiene en alta precision: capas seleccionadas 24, 30, 42, 45, 46 y 48; capas protegidas en Q8_0: 0, 42, 46, 48 y 63; capas en Q6_K: 24, 30 y 45. El resto se cuantiza a la baja, logrando una media de 4,952 bits por peso. El autor afirma que, para checkpoints MoE, la receta congela ademas el router y los expertos compartidos, aunque el modelo base de esta ficha no se declara como MoE. No se documentan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte explicito para uso con `-cnv` en llama-cli.
- Generacion de codigo, segun la etiqueta `coding` de la model card.
- Uso como agente: etiquetas `agentic` y `tool-use` indican soporte previsto de llamada a herramientas y razonamiento multi-paso.
- Razonamiento matematico: MATH-500 en 0,75 y GSM8K strict en 0,81 sobre el checkpoint padre.
- Seguimiento de instrucciones: IFEval strict 0,84 e IFEval instruction strict 0,89.
- Comportamiento "abliterated": reduccion deliberada de rechazos por alineamiento, con respuestas menos evasivas.
- Estilo "unslop": respuestas menos prolijas y mas directas que el modelo base segun la intencion declarada del autor.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Asistente de codigo en local: con Q4_K_M o Q5_K_M puede ejecutarse en una estacion de trabajo con GPU consumer y usarse para autocompletado, explicacion y refactorizacion de codigo dentro de un IDE o pipeline de CI/CD, aprovechando la etiqueta `coding` y el soporte de tool calling.
- Agente con herramientas en entornos controlados: las etiquetas `agentic` y `tool-use` permiten integrarlo como planificador que invoca funciones externas (APIs, scripts, consultas a bases de datos) en flujos multi-paso.
- Procesamiento de documentos largos en local: con contexto configurado a 16.384 tokens en el ejemplo oficial, es adecuado para resumir y extraer informacion de informes, contratos o transcripciones sin enviar datos a la nube.
- Investigacion sobre alineamiento y refusal: el caracter abliterated lo convierte en una herramienta para estudiar como se comporta un modelo sin las capas de rechazo, comparando respuestas frente al Qwen3-32B original.
- Generacion creativa sin filtros editoriales: escritura de ficcion, guiones o contenido de tono adulto en los que el modelo base tiende a responder con evasivas o rechazos.
- Despliegue en portatil o equipo con VRAM limitada: la variante IQ4_XS esta pensada explicitamente para VRAM de portatil, permitiendo inferencia offline con llama.cpp u Ollama.
- Evaluacion de tecnicas de cuantizacion: la receta CKA con capas protegidas sirve como caso de estudio reproducible para medir la perdida de comportamiento tras cuantizar.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el checkpoint padre FP8 (el autor afirma que la escalera de cuantizacion CKA los mantiene dentro del ruido de medida):

| Benchmark | Puntuacion |
|---|---|
| IFEval (strict) | 0,84 |
| IFEval (instruction strict) | 0,89 |
| MATH-500 | 0,75 |
| GSM8K (strict) | 0,81 |
| GPQA Diamond | 0,40 |
| MMLU-Pro | 0,65 |

No se han publicado resultados de benchmarks especificos de las variantes GGUF en la informacion disponible, ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada: IQ4_XS en torno a 17-18 GB; Q4_K_M en torno a 19-20 GB; Q5_K_M en torno a 22-23 GB; Q6_K en torno a 26-27 GB; Q8_0 en torno a 34-35 GB (estimaciones a partir del tamano del repositorio de 38,5 GB y de la bpw media de 4,952; no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4_K_M.
- Cabe en GPU consumer: si, en RTX 4090/3090 con Q4_K_M o Q5_K_M; IQ4_XS esta orientado a portatiles con menos VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/...:Q4_K_M`), LM Studio (busqueda por nombre del repositorio) y Jan. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Tenet-Qwen3-32B-Abliterated-Unslop-v2 (este) | 32,8 B | no disponible (ejemplo a 16.384) | Apache 2.0 | Fine-tune abliterated/unslop con cuantizacion CKA; benchmarks propios en la ficha |
| Qwen/Qwen3-32B | 32,8 B | no disponible en esta ficha | Apache 2.0 | Modelo base original, con alineamiento intacto |
| Tenet-32B-Qwen3-Unslop-v2 (padre FP8) | 32,8 B | no disponible | Apache 2.0 | Checkpoint del que derivan estas cuantizaciones; mismos benchmarks declarados |

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa queda limitada a los benchmarks del propio modelo.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion deliberada de rechazos implica que puede generar contenido que el Qwen3-32B original bloquearia; requiere filtros y politicas de uso en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; GPQA Diamond en 0,40 sugiere un rendimiento limitado en razonamiento cientifico de alta dificultad.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera del ingles y del chino (idiomas principales de Qwen3) no esta verificado.
- Contexto: la longitud de contexto nativa no se documenta; el ejemplo oficial usa 16.384 tokens, muy por debajo de lo que suele soportar la familia Qwen3.
- Cuantizacion: los benchmarks se midieron sobre el checkpoint FP8, no sobre los GGUF; la afirmacion de que se mantienen dentro del ruido de medida es del autor y no esta verificada de forma independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026: sin validacion de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado sin capas de rechazo recae en el desplegador.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mr-andrey-isachenko/Tenet-Qwen3-32B-Abliterated-Unslop-v2-GGUF
- Modelo padre (FP8): https://huggingface.co/mr-andrey-isachenko/Tenet-32B-Qwen3-Unslop-v2
- Modelo base original: https://huggingface.co/Qwen/Qwen3-32B
- Receta de cuantizacion: `cka_quant_recipe.json` (incluido en el repositorio)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
