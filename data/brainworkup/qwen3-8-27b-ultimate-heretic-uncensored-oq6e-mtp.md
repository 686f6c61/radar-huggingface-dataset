# brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ6e-mtp

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ6e-mtp es una cuantizacion de precision mixta del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, publicada por el usuario brainworkup. Se trata de un modelo multimodal (image-text-to-text) de la familia Qwen3.5, con 27.781 millones de parametros, afinado por DavidAU con un enfoque "uncensored" y optimizado para inferencia en hardware Apple Silicon mediante la libreria MLX. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.8.0rc1), que aplica una mezcla de precisiones (6 bits, 8 bits y BF16) para lograr un promedio efectivo de 6.872 bits por peso.

El modelo incorpora una cabeza MTP (Multi-Token Prediction) de 0.425B de parametros y un codificador visual de 0.461B, lo que lo habilita para tareas de imagen-texto. El checkpoint completo ocupa 23.9 GB en disco (22.2 GiB de pesos), lo que permite ejecutarlo en equipos con 32 GB de memoria unificada o superior. La licencia declarada es Apache 2.0, aunque el modelo base procede de un fine-tuning comunitario sobre Qwen3.5.

Su relevancia actual radica en que ofrece una via practica para ejecutar un modelo de ~28B con capacidades multimodales y contexto largo en portatiles Apple Silicon, con un rendimiento medido en el propio repositorio (hasta 56 tok/s de generacion en un M3 Max de 48 GB con MTP activado). Es, por tanto, una opcion orientada a desarrolladores que trabajan en local con MLX y necesitan un modelo sin filtros de contenido para tareas de investigacion o generacion creativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5, con cabeza MTP y codificador visual |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (los benchmarks llegan a 32.768 tokens de prompt) |
| Tipos de cuantizacion | Precision mixta oQ: affine 6-bit grupo 64 (88.345% de pesos), affine 8-bit grupo 64 (9.798%), BF16 (1.857%); promedio 6.872 bits/peso |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantizacion oQ |
| Tamano del repo | 23.9 GB (22.226 GiB de pesos) |
| Libreria | mlx |
| Modelo base | DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.5, con 26.896B de parametros en el modelo de lenguaje, 0.461B en el modulo de vision y 0.425B en la cabeza MTP (Multi-Token Prediction). La cabeza MTP permite decodificacion especulativa interna, lo que explica las mejoras de velocidad observadas en los benchmarks del autor (hasta 56 tok/s de generacion frente a 19 tok/s del GGUF Q6_K en el mismo hardware). El modelo es multimodal: acepta imagenes y texto como entrada y genera texto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. El fine-tuning "Heretic-Uncensored" de DavidAU sugiere un entrenamiento orientado a eliminar los filtros de rechazo del modelo original, pero no se detallan los datos ni el procedimiento. La cuantizacion oQ, por su parte, asigna 6 bits a la mayoria de las capas lineales, 8 bits a un subconjunto de 2.722B de pesos (probablemente capas sensibles como embeddings o atencion) y mantiene 0.516B en BF16.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con un codificador visual de 0.461B de parametros.
- Generacion de codigo y matematicas, segun las capacidades tipicas de la familia Qwen3.5 (no verificadas con benchmarks en la informacion disponible).
- Decodificacion especulativa mediante cabeza MTP, que acelera la generacion en inferencia MLX.
- Soporte multilingue en 16 idiomas: arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita.
- Modo "uncensored": el fine-tuning elimina los rechazos de contenido, lo que permite generar material que los modelos alineados rechazarian.
- No se dispone de informacion sobre soporte de tool calling, function calling ni agentes multi-paso en la documentacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y censura: el modelo permite estudiar como un fine-tuning "uncensored" modifica el comportamiento de rechazo respecto al Qwen3.5 original, comparando respuestas ante prompts sensibles en un entorno controlado.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas que los modelos alineados suelen rechazar, ejecutandose en local en un Mac con 32 GB o mas.
- Procesamiento de documentos con imagenes: al ser multimodal, puede extraer y resumir informacion de capturas, diagramas o documentos escaneados, combinando el codificador visual con el modelo de lenguaje.
- Asistente personal en local para Apple Silicon: con 23.9 GB de pesos y MLX, cabe en un M3/M4 Max de 48 GB y ofrece hasta 56 tok/s de generacion con MTP, adecuado para uso interactivo sin conexion.
- Analisis de codigo en entornos aislados: el contexto de hasta 32.768 tokens (segun los benchmarks) permite revisar modulos completos o varios ficheros en una sola pasada, en un portatil sin GPU dedicada.
- Traduccion multilingue offline: los 16 idiomas soportados permiten construir un pipeline de traduccion local para equipos que no pueden enviar datos a la nube.
- Prototipado de aplicaciones multimodales: sirve como banco de pruebas para desarrolladores que quieran validar flujos image-text-to-text en MLX antes de desplegar en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente proporciona mediciones de rendimiento de inferencia en un MacBook Pro M3 Max de 48 GB, comparando el GGUF Q6_K en Splash con la cuantizacion oQ6e en oMLX con y sin MTP.

| Configuracion | PP1024/TG128 (TG tok/s) | PP4096/TG128 (TG tok/s) | PP8192/TG128 (TG tok/s) | PP16384/TG128 (TG tok/s) | PP32768/TG128 (TG tok/s) | Memoria pico |
|---|---|---|---|---|---|---|
| GGUF Q6_K en Splash | 19.0 | 14.1 | 12.5 | 5.8 | no medido | 25.63-27.06 GB |
| oMLX + MTP (oQ6e) | 38.8 | 56.0 | 17.1 | 10.9 | 15.0 | 28.27-30.32 GB |
| oMLX + DFlash (MTP off) | 15.0 | 13.8 | 12.6 | 6.4 | 8.3 | 25.94-28.90 GB |
| oMLX baseline (sin MTP ni DFlash) | 36.9 | 30.0 | 26.5 | no medido | no medido | 26.7-28.3 GB |

En batching continuo con oMLX + MTP, el rendimiento escala de 38.8 tok/s (batch 1) a 167.0 tok/s (batch 8), un speedup de 4.31x. El TTFT con prompt de 1.024 tokens es de 4.889 ms con MTP y de 3.045 ms con DFlash.

## Requisitos de hardware

- VRAM/memoria unificada: 22.2 GiB de pesos; en la practica, los benchmarks reportan un pico de 28.3-30.3 GB con MTP activado y contexto de hasta 32.768 tokens. Se recomienda un equipo con al menos 32 GB de memoria unificada; 48 GB es lo comodo.
- GPU recomendadas: Apple Silicon (M3 Max, M4 Max, M2 Ultra) por ser un checkpoint MLX. No es compatible directamente con CUDA sin conversion.
- Cabe en GPU consumer: si, en equipos Apple con memoria unificada de 32 GB o superior. No esta pensado para RTX 4090 (24 GB) por el formato MLX y el pico de memoria.
- Opciones de despliegue: oMLX (con MTP y DFlash), Splash (app de escritorio), y en general el ecosistema MLX de Apple. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: en M3 Max 48 GB, TTFT de 3.0-4.9 s para 1.024 tokens de prompt, y generacion de 38.8-56.0 tok/s en single request segun configuracion. Con contexto de 32.768 tokens, el TTFT sube a 290 s con MTP y el throughput baja a 15 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ6e-mtp | 27.781B | no disponible (benchmarks hasta 32.768) | MLX safetensors, oQ6e | Apache 2.0 | Multimodal, MTP, optimizado para Apple Silicon |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27.781B (estimado) | no disponible | safetensors (original) | Apache 2.0 (heredada) | Modelo base sin cuantizar; requiere mas memoria |
| Qwen3.8-27B-Ultimate-Heretic-Uncn-Turbo-Brilli-50x-AGI-NEO-MTP-Q6_K (GGUF) | 27.781B (estimado) | no disponible | GGUF Q6_K | Apache 2.0 (heredada) | Version GGUF del mismo fine-tuning; mas lenta en M3 Max segun el autor |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento cognitivo con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "uncensored": el fine-tuning elimina los filtros de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso. No es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; al ser un fine-tuning comunitario sobre Qwen3.5, la fiabilidad en tareas de conocimiento puede degradarse respecto al modelo original.
- Idiomas: aunque se declaran 16 idiomas, no hay evaluacion de calidad por idioma; el rendimiento en lenguas distintas del ingles y el chino puede ser irregular.
- Contexto: la longitud maxima de contexto no se especifica en la informacion disponible; los benchmarks solo llegan a 32.768 tokens de prompt, y el rendimiento cae drasticamente a esa longitud (TTFT de 290 s con MTP).
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base es un fine-tuning de terceros sobre Qwen3.5; conviene verificar las condiciones del modelo original de Qwen antes de un despliegue comercial.
- Hardware: checkpoint en formato MLX, ligado al ecosistema Apple Silicon; no es directamente portable a CUDA sin conversion y re-cuantizacion.
- Cuantizacion agresiva: 6.872 bits/peso de media implica perdida de precision respecto al BF16 original; no se han publicado evaluaciones de la degradacion resultante.
- Soporte limitado: 225 descargas y 0 likes en el momento de la consulta; es un artefacto de un unico autor sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ6e-mtp
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Version GGUF del fine-tuning: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Herramienta de cuantizacion oMLX: https://github.com/jundot/omlx
- Benchmark de rendimiento publicado: https://omlx.ai/benchmarks/performance/tkf6e1q6
