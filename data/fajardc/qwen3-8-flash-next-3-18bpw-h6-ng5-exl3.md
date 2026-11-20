# fajardc/Qwen3.8-Flash-Next-3.18bpw-h6-ng5-exl3

## Resumen

Este repositorio no contiene un modelo nuevo, sino una reempaquetado del modelo Qwen3.8-Flash-Next en formato EXL3, cuantizado por turboderp (autor de exllamav3) y redistribuido por el usuario fajardc. Qwen3.8-Flash-Next es un modelo de mezcla de expertos (MoE) de aproximadamente 125.000 millones de parametros totales con unos 6.000 millones activos por token, que incluye una tabla de embeddings n-gram de 51.000 millones de parametros, un codificador de vision y una cabeza de prediccion multi-token (MTP). El modelo base lo desarrolla el equipo Qwen y esta disenado para tareas multimodales de imagen-texto con contexto muy largo.

La aportacion concreta de este repositorio es la combinacion de dos artefactos de turboderp: los pesos de su build autoc alibrado de 3,18 bits por peso (bpw) con cabeza de 6 bits y la tabla n-gram de 5 bits de su build de 3,05 bpw, en lugar de la tabla de 8 bits que trae la rama de 3,18 bpw. Segun el autor, esto reduce la descarga en 19,2 GB hasta los 87,3 GB totales, manteniendo el contexto de 262.144 tokens. Los ficheros son byte a byte identicos a los de turboderp, verificado por SHA-256.

Es relevante porque permite ejecutar un MoE de 125B con vision y contexto de 256K en hardware de escritorio (el autor cita una RTX 3090 y una RTX 3070 Ti con 64 GB de RAM), algo imposible con el modelo sin cuantizar. Los benchmarks publicados muestran una degradacion contenida frente al modelo original en GPQA-Diamond y LiveCodeBench v6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (Gated DeltaNet y atencion dispersa), vision tower y cabeza MTP |
| Parametros totales | 27.226.398.208 en safetensors del repo; el modelo base se describe como 125B MoE (la discrepancia se debe a la tabla n-gram y a la cuantizacion; el dato de safetensors es el real del repo) |
| Parametros activos | Aproximadamente 6B por token (segun la model card) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | EXL3 a 3,18 bpw global; expertos enrutados a 3 y 3,5 bits; atencion y proyecciones a 7 bits; cabeza de salida y vision a 6 bits; cabeza MTP a 3 bits; embeddings de token a 16 bits; tabla n-gram a 5 bits |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (EXL3, para exllamav3) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atencion hibrida: combina capas de Gated DeltaNet con atencion dispersa indexada, lo que permite sostener un contexto de 262.144 tokens. Incorpora un codificador de vision para entrada imagen-texto, una cabeza de prediccion multi-token (MTP) para decodificacion especulativa y una tabla de embeddings n-gram de 51.000 millones de parametros que actua como memoria asociativa de secuencias. Los expertos enrutados se distribuyen en las capas 4 a 43 a 3 bits y en las capas 0 a 3 y 44 a 47 a 3,5 bits.

La cuantizacion EXL3 es una variante simplificada de QTIP (arxiv:2406.11235): cada matriz de pesos se rota con cambios de signo y transformadas de Hadamard por bloques para homogeneizar sus entradas, se codifica con un codificador trellis a un numero fijo de bits por peso y el error de redondeo se propaga columna a columna (LDLQ) contra la matriz Hessiana de las entradas de calibracion. El calibrado es autoc alibrado: los datos no son un corpus de texto sino una traza generada por el propio modelo (respuestas con razonamiento) sobre 217 filas de 2.048 tokens bajo su propia plantilla de chat, con el codebook trellis `mul1`. La tabla n-gram, el vision tower y la cabeza MTP se cuantizan sin calibracion, como hace exllamav3 por defecto. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento de nivel alto, con modo de pensamiento (thinking) heredado del modelo base.
- Generacion y comprension de codigo, con evaluacion en LiveCodeBench v6.
- Razonamiento cientifico y de nivel doctorado, evaluado en GPQA-Diamond.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el vision tower incluido a 6 bits.
- Decodificacion especulativa mediante la cabeza MTP incluida en los pesos.
- Contexto largo de hasta 262.144 tokens para conversaciones y documentos extensos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque el modo thinking y el contexto largo lo permiten.

## Casos de uso

- Razonamiento cientifico asistido: el modelo obtiene un 91,41 % en GPQA-Diamond, por lo que es adecuado para responder preguntas de fisica, quimica y biologia de nivel avanzado en un entorno local con una sola GPU de 24 GB y descarga por capas.
- Generacion de codigo en produccion: con un 86,29 % en LiveCodeBench v6 y contexto de 262.144 tokens, puede integrarse en pipelines de revision de codigo o generacion de parches sobre repositorios completos.
- Analisis de documentos largos con imagenes: al aceptar entrada imagen-texto y contexto de 256K, sirve para extraer informacion de informes escaneados, graficos y tablas en un mismo flujo.
- Asistente conversacional local con privacidad: al ejecutarse en hardware de escritorio (RTX 3090 + RTX 3070 Ti), permite desplegar un chatbot multi-turno sin enviar datos a la nube.
- Investigacion sobre cuantizacion: el repositorio incluye la configuracion exacta de bits por tensor y los benchmarks medidos, lo que lo convierte en una referencia para estudiar el impacto de EXL3 en un MoE grande.
- Prototipado de agentes con contexto largo: la ventana de 262.144 tokens y la cabeza MTP permiten mantener historiales de herramientas y resultados extensos con decodificacion acelerada.
- Evaluacion comparativa de hardware: los datos del autor (Ryzen 9 5900X, 64 GB de RAM, dos GPU consumer) sirven para estimar requisitos de despliegue de modelos MoE cuantizados en entornos no profesionales.

## Benchmarks y rendimiento

Los datos proceden de la model card del repositorio, medidos por el autor en su escritorio. La columna del modelo base refleja lo publicado por el equipo Qwen, con un arnes distinto, por lo que la comparacion no es estrictamente homogenea.

| Benchmark | Problemas | Este build | Modelo base (Qwen) |
|---|---|---|---|
| GPQA-Diamond | 198 | 91,41 % (181 correctos) | 91,7 % |
| LiveCodeBench v6, grader oficial | 175 | 86,29 % (151 superados) | 91,9 % |
| LiveCodeBench v6 (segunda metrica) | No disponible | No disponible | No disponible |

El resto de resultados de benchmarks no esta disponible en la informacion proporcionada, ya que la model card queda truncada tras la segunda fila de LiveCodeBench v6.

## Requisitos de hardware

- VRAM estimada: los pesos suman 87,3 GB (54,49 GB de pesos del modelo + 32,64 GB de tabla n-gram). Con offloading a RAM del sistema, el autor lo ejecuta en una RTX 3090 (24 GB) y una RTX 3070 Ti (8 GB) con 64 GB de RAM.
- GPU recomendadas: para carga completa en VRAM se necesitaria un acelerador con al menos 96 GB (A100 80GB no basta para todo el conjunto; H100 80GB tampoco sin offloading). En consumer, el autor demuestra que funciona con RTX 3090 + RTX 3070 Ti y 64 GB de RAM mediante offloading.
- Cabe en consumer GPU: si, pero solo con offloading parcial a RAM del sistema; no cabe integramente en una RTX 4090 (24 GB).
- Opciones de despliegue: exclusivamente exllamav3 (formato EXL3). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este build (Qwen3.8-Flash-Next EXL3 3,18 bpw) | 27,2B en safetensors del repo; base de 125B MoE con ~6B activos | 262.144 | qwen-community-1.0 | EXL3 | Cuantizado, con benchmarks propios |
| Qwen/Qwen3.8-Flash-Next (base) | 125B MoE, ~6B activos | 262.144 | qwen-community-1.0 | safetensors | Modelo original sin cuantizar; no cabe en el escritorio del autor |
| turboderp/Qwen3.8-Flash-Next-exl3 (rama 3.18bpw_h6_ng8) | Igual que el base | 262.144 | qwen-community-1.0 | EXL3 | Mismos pesos, tabla n-gram de 8 bits; 19,2 GB mas pesado |
| turboderp/Qwen3.8-Flash-Next-exl3 (rama 3.05bpw_h5_ng5) | Igual que el base | 262.144 | qwen-community-1.0 | EXL3 | Menor bitrate global; origen de la tabla n-gram de 5 bits |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni un lanzamiento oficial: es un reempaquetado de ficheros de turboderp, sin soporte oficial de turboderp ni del equipo Qwen.
- Los benchmarks los ejecuto una sola persona en un escritorio domestico, no en un cluster; no son reproducibles con el mismo arnes que los del modelo base.
- La comparacion con el modelo base mezcla dos arneses distintos, segun admite la propia model card.
- El formato EXL3 solo funciona con exllamav3; no hay soporte para vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue en produccion.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE incluido antes de cualquier uso en produccion.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion.
- La cuantizacion a 3 bits en los expertos enrutados puede degradar tareas distintas a las evaluadas (GPQA-Diamond y LiveCodeBench v6); no hay benchmarks de otros dominios en este build.
- Idiomas soportados no documentados en la informacion disponible.
- La tabla n-gram de 5 bits sustituye a la de 8 bits de la rama original; el autor no publica una comparacion directa entre ambas tablas en este repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fajardc/Qwen3.8-Flash-Next-3.18bpw-h6-ng5-exl3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de cuantizaciones de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Rama 3.18bpw_h6_ng8: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/3.18bpw_h6_ng8
- Rama 3.05bpw_h5_ng5: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/3.05bpw_h5_ng5
- Repositorio exllamav3: https://github.com/turboderp-org/exllamav3
- Documentacion de optimizacion y autoc alibrado de exllamav3: https://github.com/turboderp-org/exllamav3/blob/master/doc/optimize.md
- Paper QTIP (arxiv:2406.11235): https://arxiv.org/abs/2406.11235
- Perfil de turboderp: https://huggingface.co/turboderp
