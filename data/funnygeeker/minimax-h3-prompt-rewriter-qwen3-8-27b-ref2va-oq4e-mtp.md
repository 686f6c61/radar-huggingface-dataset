# funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-oQ4e-mtp

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-oQ4e-mtp es una cuantizacion mixta de precision del modelo lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA, publicada por el usuario funnygeeker. El modelo base es un reescritor de prompts especializado construido sobre una arquitectura de la familia Qwen 3.5 (etiqueta `qwen3_5` en los metadatos) con 27.781 millones de parametros y un cabezal MTP (multi-token prediction) de 0.425B parametros, ademas de un modulo de vision de 0.461B. Su proposito es transformar instrucciones de usuario en prompts refinados, presumiblemente orientados a la generacion de video (por el sufijo Ref2VA y la referencia a MiniMax-H3).

La relevancia de esta publicacion es practica: reduce un checkpoint de aproximadamente 55 GB en BF16 a 17.5 GB mediante cuantizacion mixta de precision con la herramienta oQ (oMLX v0.7.3), manteniendo un promedio efectivo de 5.044 bits por peso. Esto permite ejecutar un modelo de 27B en hardware Apple Silicon con memoria unificada moderada, algo inviable con los pesos originales. La distribucion de bits es deliberadamente no uniforme: el 69.8% de los pesos se almacenan a 4 bits y el 23.7% a 5 bits, mientras que las capas mas sensibles (incluidos 0.516B en BF16) conservan mayor precision.

Se trata de un artefacto de inferencia en formato MLX, destinado a la libreria mlx de Apple, no de un modelo entrenado desde cero. La model card no documenta datos de entrenamiento, licencia ni idiomas, lo que limita la evaluacion de su idoneidad para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.5 (etiqueta `qwen3_5`), con modulo de vision y cabezal MTP |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ: affine 4/5/6/8 bits con grupo 64, mas pesos en BF16; promedio efectivo 5.044 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26.896B | 16.272 GB / 15.155 GiB |
| Vision | 0.461B | 0.921 GB / 0.858 GiB |
| Cabezal MTP | 0.425B | 0.323 GB / 0.301 GiB |
| **Total** | **27.781B** | **17.517 GB / 16.314 GiB** |

## Arquitectura y entrenamiento

La informacion disponible solo describe el proceso de cuantizacion, no el entrenamiento. El checkpoint base es un transformer de la familia Qwen 3.5 con 27.781B parametros, que incorpora tres bloques funcionales: el modelo de lenguaje principal (26.896B), un codificador o modulo de vision (0.461B) y un cabezal de prediccion multi-token (MTP, 0.425B). La presencia de vision y MTP sugiere un modelo multimodal con decodificacion especulativa mediante MTP, una tecnica que predice varios tokens por paso para acelerar la generacion.

La cuantizacion se realizo con oQ (oMLX v0.7.3), que asigna precision de forma no uniforme: 19.393B pesos a 4 bits (grupo 64), 6.579B a 5 bits, 1.282B a 6 bits, 0.011B a 8 bits y 0.516B en BF16. El resultado son 16.314 GiB de pesos con un promedio de 5.044 bits. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Reescritura de prompts: funcion principal del modelo base, orientada a refinar y estructurar instrucciones de usuario.
- Generacion de texto: capacidad inherente al modelo de lenguaje de 26.896B parametros.
- Procesamiento de vision: modulo dedicado de 0.461B parametros, presumiblemente para entrada de imagenes de referencia.
- Prediccion multi-token (MTP): cabezal de 0.425B que habilita decodificacion especulativa para acelerar la inferencia.
- Soporte de tool calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion.

## Casos de uso

- Refinamiento de prompts para generacion de video: el modelo transforma descripciones breves o ambiguas en prompts detallados y estructurados, aprovechando su entrenamiento especifico como reescritor y su modulo de vision para incorporar imagenes de referencia.
- Preprocesado en pipelines de generacion audiovisual: se inserta como etapa previa al modelo generativo, normalizando y enriqueciendo las instrucciones del usuario antes de la sintesis.
- Prototipado local en Apple Silicon: al ocupar 17.5 GB en formato MLX, permite experimentar con un modelo de 27B en un Mac con memoria unificada de 24-32 GB sin depender de GPUs dedicadas.
- Herramientas de autoria asistida: integracion en interfaces de creacion donde el usuario escribe una idea y el modelo devuelve un prompt optimizado listo para copiar o enviar a una API.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia practica para comparar la calidad de oQ frente a cuantizaciones uniformes de 4 bits en un modelo con modulos multimodales y MTP.
- Investigacion sobre decodificacion especulativa: el cabezal MTP permite estudiar el impacto del multi-token prediction en latencia y calidad dentro de un entorno MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: aproximadamente 17.5 GB para los pesos en disco; en ejecucion se necesita margen adicional para el contexto KV, por lo que se recomienda un minimo de 24 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max) por el formato MLX; no es ejecutable directamente en CUDA sin conversion.
- GPU dedicadas: no aplicable en su formato actual; requeriria conversion a otro formato (por ejemplo GGUF o safetensors estandar) para su uso en A100, H100 o RTX 4090.
- Despliegue: libreria `mlx` de Apple; opciones como llama.cpp, vLLM, Ollama o TGI no soportan este checkpoint sin conversion previa.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (oQ4e-mtp) | 27.781B | no disponible | MLX safetensors, 5.044 bits/peso | no disponible | Cuantizacion mixta, 17.5 GB |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA | 27.781B (presumible) | no disponible | safetensors BF16 | no disponible | Modelo base sin cuantizar |
| Cuantizaciones uniformes de 4 bits de la familia Qwen 3.x | ~27B | no disponible | GGUF / MLX | variable | Menor precision en capas sensibles; sin datos comparativos publicados |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantizacion mixta a 5.044 bits introduce perdida de precision frente al BF16 original; el impacto en la calidad de reescritura no esta documentado.
- No se especifica licencia, lo que impide confirmar si el uso comercial esta permitido; debe verificarse en el modelo base antes de cualquier despliegue productivo.
- No se documentan sesgos conocidos, riesgo de alucinacion ni comportamiento en idiomas distintos del presumible ingles.
- La longitud de contexto no esta disponible, lo que dificulta planificar su uso con prompts largos o imagenes de referencia multiples.
- El formato MLX limita su portabilidad a hardware Apple; no hay pesos GGUF ni safetensors estandar publicados en este repositorio.
- Solo 94 descargas y 0 likes: el modelo tiene validacion comunitaria practicamente nula.
- El cabezal MTP y el modulo de vision deben ser soportados por la version de mlx utilizada; versiones antiguas pueden fallar al cargar el checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-oQ4e-mtp
- Modelo base: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
