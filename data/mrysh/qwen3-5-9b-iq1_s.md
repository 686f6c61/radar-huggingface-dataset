# mrysh/qwen3.5-9b-iq1_s

## Resumen

`mrysh/qwen3.5-9b-iq1_s` es una cuantizacion extrema en formato GGUF del modelo base `Qwen/Qwen3.5-9B`, publicada por el usuario mrysh. Concretamente aplica la tecnica IQ1_S (importance quantization de 1 bit con matriz de importancia), lo que deja los pesos en aproximadamente 1,56 bits por parametro y reduce el peso en disco a 3,001 GB para los 9.197.093.888 parametros del modelo original. No es un modelo nuevo ni un fine-tune: es un artefacto de compresion.

El repositorio se creo el 23 de octubre de 2026 y, en el momento de la consulta, no registraba descargas ni interacciones. Segun la propia model card, el objetivo no es el uso en produccion sino servir como uno de los puntos extremos de un benchmark de cuantizacion (4 modelos x 8 tecnicas) evaluado con vLLM sobre BFCL, Energy-QA, un conjunto de sesgo de contratacion y MedQA. El autor advierte explicitamente de una perdida de calidad grande.

La relevancia de esta ficha es, por tanto, acotada: interesa a quien investiga los limites inferiores de la cuantizacion, necesita ejecutar un modelo de ~9B en un entorno con muy poca memoria o quiere reproducir el benchmark citado. Para cualquier uso real de Qwen3.5-9B conviene acudir al modelo base o a cuantizaciones de 4 bits o superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada del modelo base Qwen/Qwen3.5-9B; no documentada en la informacion proporcionada) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, ~1,56 bits por peso, group size None, con matriz de importancia (imatrix) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo de 3,001 GB; repositorio de 3,9 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Qwen/Qwen3.5-9B (tipo de transformer, atencion, datos de entrenamiento, numero de tokens, fases de RLHF/DPO) en el material proporcionado. Lo unico documentado en este repositorio es el proceso de cuantizacion: se aplico IQ1_S con una matriz de importancia calculada a partir de un conjunto de calibracion mixto de 512 muestras, empleando la libreria identificada en la model card con el hash `0693dbfb915f`.

Un detalle tecnico relevante es que la cuantizacion cubre unicamente la parte de texto. Las componentes de vision y audio del modelo base no se cuantizaron y no se utilizan, de modo que el artefacto es estrictamente text-only. El autor indica que la evaluacion se hizo con vLLM y el modo de razonamiento (thinking) desactivado, y que la ejecucion requiere el plugin `vllm-gguf-plugin` en vLLM o bien llama.cpp. IQ1_S es el extremo inferior de la escala de cuantizacion de la familia K-quant de llama.cpp: por debajo de 2 bits, la reconstruccion de los pesos depende fuertemente de la imatrix y la degradacion es esperable.

## Capacidades

- Generacion de texto conversacional en formato GGUF, con plantilla de chat heredada del modelo base (tag `conversational`).
- Razonamiento y respuesta a preguntas: el autor lo evaluo con MedQA, lo que implica uso previsto como modelo de QA sobre conocimiento.
- Soporte de tool calling / function calling: se evaluo con BFCL (Berkeley Function Calling Leaderboard), aunque no se publican puntuaciones.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles en este artefacto (las componentes multimodales no se cuantizaron ni se usan).
- Modo thinking: existe en el modelo base segun la referencia a "thinking off" en la evaluacion, pero esta cuantizacion se probo con el modo desactivado.
- No debe asumirse ninguna capacidad adicional: a ~1,56 bits por peso se espera una degradacion severa en tareas que requieran precision factual o razonamiento multi-paso.

## Casos de uso

- Investigacion sobre cuantizacion extrema: usar este artefacto como punto de comparacion inferior (1,56 bits) frente a Q4_K_M, Q5_K_M u 8 bits del mismo modelo base, midiendo la caida en BFCL, MedQA o perplejidad.
- Reproduccion de benchmarks de compresion: el autor lo publica como parte de una matriz de 4 modelos x 8 tecnicas; sirve para replicar esa evaluacion con vLLM y `vllm-gguf-plugin`.
- Pruebas de humo (smoke tests) de pipelines de inferencia: validar que un servidor llama.cpp o vLLM arranca, tokeniza y responde correctamente con un GGUF de muy bajo peso antes de desplegar la version buena.
- Inferencia en hardware muy limitado: con 3,001 GB de pesos cabe en equipos con 4 GB de RAM o VRAM, lo que permite tener un modelo de ~9B en placas integradas, Raspberry Pi de gama alta o contenedores con limites de memoria estrictos, aceptando la perdida de calidad.
- Docencia y demostraciones: ilustrar de forma tangible el efecto del numero de bits por peso sobre la calidad de salida, comparando respuestas del mismo prompt en IQ1_S y en el modelo base.
- Generacion de texto tolerante a errores donde solo importa la forma: borradores, texto de relleno, pruebas de carga de una interfaz de chat o generacion de datos sinteticos de baja fidelidad para testear formateadores.
- Experimentos de sesgo: el autor incluye un conjunto de evaluacion de sesgo de contratacion; el artefacto puede usarse para estudiar como la cuantizacion agresiva altera las respuestas sensibles en ese tipo de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo forma parte de una evaluacion con vLLM (thinking off) sobre BFCL, Energy-QA, un conjunto de sesgo de contratacion y MedQA, pero no incluye ninguna puntuacion numerica en el repositorio ni en los metadatos consultados.

| Benchmark | Resultado IQ1_S | Resultado modelo base | Notas |
|---|---|---|---|
| BFCL | No disponible | No disponible | Mencionado como parte de la evaluacion, sin cifras |
| Energy-QA | No disponible | No disponible | Mencionado, sin cifras |
| Sesgo de contratacion | No disponible | No disponible | Mencionado, sin cifras |
| MedQA | No disponible | No disponible | Mencionado, sin cifras |

## Requisitos de hardware

- VRAM/RAM para los pesos: 3,001 GB en disco; en ejecucion se recomienda reservar entre 3,5 y 4,5 GB contando cache KV y overhead del runtime (estimacion, depende de la longitud de contexto efectiva).
- Cabe en cualquier GPU de consumo actual: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, e incluso en GPUs de 4 GB si se limita el contexto.
- Inferencia en CPU viable: el formato GGUF y el bajo peso permiten ejecucion en CPU con llama.cpp; el cuello de botella sera el soporte de kernels para IQ1_S, no la memoria.
- Despliegue con llama.cpp / `llama-server` (soporte nativo de IQ1_S) o con vLLM mediante el plugin `vllm-gguf-plugin` indicado por el autor. No se documenta soporte en Ollama, TGI ni otros motores.
- GPU de datacenter (A100, H100) no tienen sentido para este artefacto salvo para reproducir el benchmark: el modelo ocupa una fraccion minima de su memoria.
- Latencia y throughput: no disponibles. Al ser un modelo denso de ~9B con pesos de 1,56 bits, el rendimiento estara dominado por el desquantizado en tiempo de ejecucion y por el soporte de kernels, no por el ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Peso aproximado | Contexto | Calidad esperada | Licencia |
|---|---|---|---|---|---|
| mrysh/qwen3.5-9b-iq1_s | 9,20 B | 3,00 GB (1,56 bits) | No disponible | Muy degradada (advertencia explicita del autor) | Apache 2.0 |
| Qwen/Qwen3.5-9B (BF16) | 9,20 B | ~18,4 GB (16 bits, estimado) | No disponible | Referencia | Apache 2.0 |
| Cuantizacion Q4_K_M del mismo base | 9,20 B | ~5,5 GB (estimado a 4,5-4,8 bits) | No disponible | Proxima al original en la mayoria de tareas | Apache 2.0 |
| Cuantizacion Q8_0 del mismo base | 9,20 B | ~9,8 GB (estimado a 8,5 bits) | No disponible | Practicamente indistinguible del original | Apache 2.0 |

Los tamanos de las filas marcadas como estimados se derivan aritmeticamente del numero de parametros y de los bits por peso tipicos de cada tecnica; no proceden de la informacion proporcionada. No se dispone de datos de benchmarks que permitan comparar calidad de forma cuantitativa entre estas variantes.

## Limitaciones y advertencias

- Perdida de calidad severa y reconocida por el autor: a ~1,56 bits por peso, es el extremo del benchmark y no esta pensado para uso en produccion.
- Riesgo elevado de alucinacion y de incoherencia factual, especialmente en dominios especializados como el medico (MedQA) o en razonamiento multi-paso.
- No apto para tool calling fiable en produccion: la evaluation BFCL existe, pero sin cifras publicadas y con una cuantizacion que degrada el seguimiento de formato.
- Capacidades multimodales ausentes: vision y audio no se cuantizaron ni se usan, aunque el modelo base las tenga.
- Idiomas soportados no documentados; no puede asumirse un buen rendimiento en castellano ni en otros idiomas distintos del ingles.
- Longitud de contexto no documentada en este repositorio; debe consultarse la model card del modelo base. Contextos largos incrementan la cache KV y pueden dominar el consumo de memoria frente a los 3 GB de pesos.
- Sesgos: el propio autor incluye un conjunto de evaluacion de sesgo de contratacion, lo que sugiere sensibilidad a sesgos sociodemograficos; la cuantizacion agresiva puede amplificarlos de forma no controlada.
- Licencia Apache 2.0 heredada del modelo base, permisiva para uso comercial; no obstante, la calidad del artefacto hace desaconsejable dicho uso. Conviene verificar los terminos en la model card de Qwen/Qwen3.5-9B.
- Soporte de motores limitado: fuera de llama.cpp y vLLM con el plugin GGUF, no se documenta compatibilidad.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta: no hay evidencia externa de que el archivo se cargue correctamente en todos los runtimes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrysh/qwen3.5-9b-iq1_s
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
