# ML-Intern-lab/Qwen-Image-2.1-PE-T2I-Pocket-0.8B

## Resumen

Qwen-Image-2.1-PE-T2I-Pocket-0.8B es un modelo de texto de 752.393.024 parametros desarrollado por ML-Intern-lab que actua exclusivamente como reescritor de prompts para el modelo de generacion de imagenes Qwen/Qwen-Image-2.1. Su tarea es convertir una peticion breve del usuario ("a photo of a red bicycle leaning against a bakery door") en el objeto JSON compacto que espera la etapa de prompt rewriting del generador de imagenes: una descripcion larga en ingles mas la relacion de aspecto. Se trata de un fine-tune completo de Qwen/Qwen3.5-0.8B, sin cambios arquitectonicos, destilado a partir de las salidas del modelo profesor Qwen/Qwen-Image-2.1-PE-T2I de 9B.

La relevancia del modelo es de eficiencia: replica el comportamiento del profesor sin necesidad de su system prompt de unas 1.700 palabras ni de generar tokens de razonamiento. Segun la evaluacion publicada, iguala al profesor en cumplimiento de formato (99,7 % de JSON valido y 99,3 % de ratios permitidos frente al 100 % del profesor) con un coste de generacion de 453,1 tokens de media frente a los 1.630,8 del profesor, es decir, aproximadamente un 28 % del coste en tokens, y una latencia media de 2,81 s frente a los 29,90 s del baseline sin ajustar.

El caso de uso esta muy acotado: no es un modelo conversacional general ni un modelo multimodal, sino un componente de un pipeline de text-to-image. Se distribuye con pesos safetensors en bfloat16 y una cuantizacion GGUF Q8_0 de 812 MB para ejecucion en CPU, con licencia Qwen Research License de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de texto (tag `qwen3_5_text`), sin cambios arquitectonicos respecto a Qwen/Qwen3.5-0.8B; el bloque MTP de la configuracion es solo de arquitectura |
| Parametros totales | 752.393.024 (aproximadamente 0,75B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (safetensors) y GGUF Q8_0 (812 MB, convertido con `convert_hf_to_gguf.py --no-nextn`) |
| Idiomas soportados | No disponible. El filtrado del dataset de entrenamiento exige salida en ingles; el profesor conserva texto citado en otros sistemas de escritura (arabe, devanagari, han, japones, latin) |
| Licencia | other (Qwen Research License, uso no comercial) |
| Formato de pesos | safetensors y GGUF |
| Tamano del repositorio | 3,8 GB |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline | text-generation |
| Descargas / likes | 2.892 / 11 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de texto con la misma arquitectura que Qwen/Qwen3.5-0.8B, del que es un fine-tune completo. No hay modificaciones estructurales, ni decodificacion especulativa, ni mecanismos de atencion alternativa documentados. La innovacion esta en el procedimiento de ajuste: destilacion sobre las salidas del profesor Qwen/Qwen-Image-2.1-PE-T2I, que se materializa como pares de la forma `{user: peticion en bruto}` a `{assistant: un unico objeto JSON compacto}`. El entrenamiento se realizo con TRL (tags `distillation`, `sft`, `trl`).

El chat template se aplica sin system prompt y con el modo thinking desactivado, emitiendo un bloque de razonamiento vacio antes de la respuesta, exactamente como en entrenamiento. De este modo, el comportamiento de reescritura —incluido el formato JSON— queda fijado en los pesos y no depende de instrucciones externas. El conjunto de datos es el subconjunto filtrado de forma rigurosa (1.776 pares) de las 8.797 peticiones etiquetadas por el profesor, con los siguientes criterios de filtrado: JSON parseable, ratio permitido, texto citado literal, ratio indicado por el usuario respetado, salida en ingles, entre 80 y 400 palabras, y ausencia de texto de ratio, resolucion o pixeles dentro del prompt. El dataset asociado es ML-Intern-lab/Qwen-Image-2.1-rewriter-distill.

## Capacidades

- Reescritura de prompts: transforma una peticion breve en una descripcion larga en ingles de entre 80 y 400 palabras, lista para el generador de imagenes.
- Salida en JSON compacto con el esquema `{"rewritten_prompt": "...", "wh_ratio": "3:2"}`, sin texto adicional.
- Seleccion de relacion de aspecto entre las ratios soportadas por Qwen-Image-2.1: 1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4, 2:1, 1:2, 21:9, 9:21, 4:5, 5:4, 3:1, 1:3.
- Respeto del ratio indicado explicitamente por el usuario, cuando este lo especifica.
- Preservacion de texto citado que debe aparecer en la imagen ("quoted text verbatim"), con fidelidad variable segun el sistema de escritura.
- Inferencia sin tokens de razonamiento y sin system prompt: genera directamente el objeto JSON.
- Generacion con muestreo configurable (temperatura 1.0, top_p 0.95, top_k 20 en el protocolo de evaluacion).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo thinking.

## Casos de uso

- Integracion en pipelines de text-to-image con Qwen-Image-2.1: se coloca como etapa previa al `QwenImage21Pipeline`, recibe la peticion cruda del usuario y devuelve el prompt largo y las dimensiones exactas (altura y anchura multiplos de 32 en torno a 1 megapixel) que el pipeline necesita como entrada. Es el caso de uso para el que el modelo fue entrenado.
- Reduccion de coste y latencia en produccion: sustituye al profesor de 9B evitando su system prompt de 1.700 palabras y sus tokens de razonamiento, con una latencia media publicada de 2,81 s y 453,1 tokens generados por peticion, frente a 29,90 s y 6.106,4 tokens del baseline sin ajustar.
- Despliegue en servidor sin GPU: la cuantizacion GGUF Q8_0 de 812 MB permite ejecutar el reescritor en CPU con llama.cpp mientras el modelo de difusion se sirve por separado en GPU.
- Normalizacion por lotes de peticiones de usuario: procesar un fichero de peticiones breves y convertirlas en pares prompt-ratio estructurados para su uso posterior en generacion por lotes o para auditoria.
- Adaptacion de formato por canal de publicacion: a partir del ratio elegido, seleccionar automaticamente 16:9 o 2:1 para formatos apaisados, 9:16 o 9:21 para formatos verticales de movil, o 1:1 para publicaciones cuadradas, usando la tabla de resoluciones publicada por el autor.
- Enriquecimiento de descripciones para catalogos de producto: convertir una ficha breve de producto en una descripcion visual detallada en ingles que mantenga literalmente el texto de marca o etiqueta citado en la peticion.
- Prototipado rapido de interfaces de generacion de imagenes: al caber en GPU de consumo, permite iterar sobre la etapa de reescritura de forma local sin depender del profesor de 9B ni de infraestructura dedicada.
- Filtrado y validacion de peticiones: al devolver siempre JSON con un ratio dentro de la lista permitida, la salida se puede validar de forma programatica antes de invocar el costoso modelo de difusion.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre las 300 peticiones de evaluacion reservadas del dataset de destilacion, generando cada variante con el protocolo de muestreo del profesor (temperatura 1.0, top_p 0.95, top_k 20, semilla 0). El baseline es el Qwen/Qwen3.5-2B sin ajustar al que se le da el system prompt completo del profesor con thinking activado; su ejecucion se corto en 80 filas por el presupuesto de tiempo del trabajo de evaluacion, por lo que sus numeros son un suelo parcial, no un techo.

| Metrica | Profesor (9B) | Este modelo | Student-2B | Baseline-2B |
|---|---|---|---|---|
| Filas evaluadas | 300 | 300 | 300 | 80 |
| Tasa de JSON valido | 100,0 % | 99,7 % | 100,0 % | 77,5 % |
| Tasa de ratio permitido | 100,0 % | 99,3 % | 99,7 % | 20,0 % |
| Fidelidad de texto (cadenas citadas literales) | 53,1 % | 53,1 % | 60,2 % | 3,7 % |
| Fidelidad por sistema de escritura | Arabe 66,7 %, Devanagari 0,0 %, Han 60,0 %, Japones 66,7 %, Latin 52,0 % | Arabe 33,3 %, Devanagari 0,0 %, Han 20,0 %, Japones 33,3 %, Latin 57,1 % | Arabe 33,3 %, Devanagari 0,0 %, Han 20,0 %, Japones 50,0 %, Latin 64,3 % | Japones 0,0 %, Latin 3,9 % |
| Concordancia de ratio con el profesor | 100,0 % | 57,7 % | 67,3 % | 8,8 % |
| Tokens generados (media / mediana) | 1.630,8 / 1.536,5 | 453,1 / 456,5 | 482,8 / 462,0 | 6.106,4 / 6.144,0 |
| Latencia en segundos (media / mediana) | no disponible | 2,81 / 2,61 | 3,22 / 3,12 | 29,90 / 29,81 |

Lecturas publicadas por el autor: los modelos estudiantes igualan al profesor en cumplimiento de formato (JSON y ratio permitido en torno al 99-100 %) con aproximadamente el 28 % del coste en tokens del profesor y una fraccion de su latencia; el propio profesor solo preserva en torno al 53 % del texto citado, de modo que los estudiantes estan en la misma banda y todos pierden mas en arabe y devanagari que en latin; y en cuanto al ratio, los estudiantes casi siempre eligen uno permitido, pero coinciden con la eleccion concreta del profesor solo en el 58-67 % de los casos.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 1,5 GB solo para los pesos (752,4 millones de parametros a 2 bytes), mas el overhead de activaciones y cache KV, que no esta cuantificado en la documentacion disponible.
- VRAM estimada en GGUF Q8_0: 812 MB para los pesos, segun el fichero publicado `Qwen-Image-2.1-PE-T2I-Pocket-0.8B-Q8_0.gguf`.
- GPU recomendadas: el autor no especifica el hardware usado en la evaluacion. Por tamano, cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090) y en GPUs de centro de datos como A100 o H100, aunque en estas ultimas el modelo estaria muy infrautilizado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con al menos 4 GB de VRAM; la cuantizacion Q8_0 permite ademas ejecucion en CPU.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` en bfloat16 y `device_map="cuda"`; llama.cpp mediante el GGUF Q8_0 (convertido con `convert_hf_to_gguf.py --no-nextn`); Ollama u otros servidores compatibles con GGUF. El repositorio lleva el tag `endpoints_compatible`. No hay confirmacion de soporte especifico en vLLM ni en TGI.
- Latencia y throughput: 2,81 s de media y 2,61 s de mediana para 453,1 tokens generados de media en el protocolo de evaluacion publicado (hardware no especificado); esto implica de forma derivada unos 161 tokens/s. Con 2.892 descargas registradas, no hay datos adicionales de rendimiento en produccion.
- Nota importante: la generacion de la imagen con Qwen-Image-2.1 requiere diffusers desde git main (0.41.0.dev0 o superior) y que torchvision sea importable en el entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | JSON valido | Ratio permitido | Latencia media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen-Image-2.1-PE-T2I-Pocket-0.8B (este modelo) | 0,75B | Reescritor de prompts con JSON y ratio | 99,7 % | 99,3 % | 2,81 s | other (Qwen Research, no comercial) | safetensors + GGUF en HuggingFace |
| Qwen/Qwen-Image-2.1-PE-T2I (profesor) | 9B | Reescritor de prompts con thinking y system prompt de 1.700 palabras | 100,0 % | 100,0 % | no disponible | no disponible | HuggingFace |
| Student-2B (misma familia de destilacion) | 2B | Reescritor de prompts con JSON y ratio | 100,0 % | 99,7 % | 3,22 s | no disponible | no disponible |
| Qwen/Qwen3.5-2B sin ajustar (baseline) | 2B | Modelo de texto general usado como baseline | 77,5 % | 20,0 % | 29,90 s | no disponible | HuggingFace |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | Modelo de texto general | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

La comparativa se limita a los modelos que aparecen en la evaluacion publicada por el autor. No se dispone de datos de benchmarks frente a otros reescritores de prompts de terceros.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo Qwen Research License y esta marcado explicitamente como de uso no comercial para investigacion ("non-commercial research use"). No se puede usar en produccion comercial sin revisar y cumplir la licencia incluida en el repositorio. El modelo base Qwen3.5-0.8B es Apache 2.0, pero la licencia del fine-tune es distinta.
- Riesgo de salida malformada: la tasa de JSON valido es del 99,7 %, por lo que en torno al 0,3 % de las generaciones puede producirse una salida no parseable. El autor recomienda remuestrear o recurrir a `json_repair` como respaldo.
- Discrepancia en la seleccion de ratio: aunque el 99,3 % de las salidas usan un ratio permitido, solo el 57,7 % coincide con la eleccion concreta del profesor. La relacion de aspecto elegida puede diferir de la que elegiria el modelo de 9B para la misma peticion.
- Fidelidad de texto citado limitada y desigual por sistema de escritura: 57,1 % en latin, 33,3 % en arabe, 33,3 % en japones, 20,0 % en han y 0,0 % en devanagari. Si la imagen debe contener texto literal en arabe, devanagari o han, la probabilidad de que se preserve correctamente es baja. El autor senala que esta limitacion es propiedad de todo el stack, no solo del estudiante.
- Ambito funcional muy estrecho: el modelo solo reescribe prompts. No es un modelo conversacional general, no admite system prompt util (el template lo emite vacio) y tiene el modo thinking deshabilitado por diseno. Usarlo fuera de su tarea produce salidas poco fiables.
- Salida en ingles: los criterios de filtrado del dataset de entrenamiento exigen salida en ingles, por lo que no se puede esperar reescritura en otros idiomas aunque la entrada sea multilingue.
- Riesgo de alucinacion: al tratarse de un modelo generativo de 0,75B entrenado sobre 1.776 pares, puede inventar detalles no presentes en la peticion del usuario (objetos, iluminacion, estilo) al expandirla a 80-400 palabras. El autor no publica metricas de fidelidad semantica respecto a la peticion original.
- Longitud de contexto no documentada: no se especifica la ventana de contexto del modelo base ni la maxima longitud admitida, lo que dificulta planificar el uso con peticiones largas. El ejemplo de uso fija `max_new_tokens=1024`.
- Sin datos de sesgo ni de evaluacion de seguridad: el autor no publica analisis de sesgos, tasas de alucinacion fuera del conjunto de evaluacion ni evaluaciones de seguridad.
- Dependencia de versiones: el ejemplo de uso requiere diffusers desde git main (0.41.0.dev0 o superior) para el pipeline de Qwen-Image-2.1, ademas de torchvision importable. Esto implica que la integracion puede romperse con cambios en versiones intermedias.
- Datos de evaluacion parciales en el baseline: los numeros del baseline de 2B se calcularon solo sobre 80 filas por limite de tiempo, por lo que son un suelo parcial y no deben compararse directamente con las 300 filas del resto de variantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ML-Intern-lab/Qwen-Image-2.1-PE-T2I-Pocket-0.8B
- Dataset de destilacion: https://huggingface.co/datasets/ML-Intern-lab/Qwen-Image-2.1-rewriter-distill
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo profesor: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Modelo de generacion de imagenes: https://huggingface.co/Qwen/Qwen-Image-2.1
- Baseline de la evaluacion: https://huggingface.co/Qwen/Qwen3.5-2B
- Busqueda web: no se encontraron resultados relevantes para este modelo; las consultas devolvieron unicamente paginas de desambiguacion sobre la sigla "ML", el videojuego Mobile Legends: Bang Bang y el sitio de Mercado Libre, sin relacion con el modelo.
