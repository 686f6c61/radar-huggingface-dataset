# goodmai/gpt-oss-20b-PV-MACaQ-3bit-Affine-MLX

## Resumen

`goodmai/gpt-oss-20b-PV-MACaQ-3bit-Affine-MLX` es una cuantizacion de 3 bits del modelo `openai/gpt-oss-20b`, publicada por el usuario goodmai y orientada especificamente a la inferencia en Apple Silicon mediante el runtime basalt (construido sobre MLX). No es un modelo nuevo: es una reempaquetado de pesos que convierte los expertos enrutados del modelo original, nativos en MXFP4, a un esquema de cuantizacion propio denominado PV-MACaQ (3 bits afines con bloques de 64 transformados mediante Walsh-Hadamard, escalado previo por experto y barrido de clipping). El objetivo es reducir el peso en disco y la VRAM unificada necesaria para ejecutar gpt-oss-20b en equipos Mac.

El modelo base, gpt-oss-20b, es un transformer con mezcla de expertos (MoE) desarrollado por OpenAI y publicado bajo licencia Apache 2.0. Esta build ocupa 9,40 GB en dos shards, frente a los 11,2 GB de la build MXFP4 de referencia, y segun el autor mantiene un rendimiento de decodificacion practicamente identico (77,1 tok/s frente a 77,5 tok/s en un M4 Pro de 24 GB) con un pico de GPU menor (10,6 GB frente a 12,2 GB).

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantizacion con 0 descargas y 0 likes en el momento de la consulta, dependiente de un runtime concreto (basalt) y de una version posterior a v0.12.0. Es util para quien quiera ejecutar gpt-oss-20b en un Mac con memoria unificada limitada, pero no aporta capacidades nuevas respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de openai/gpt-oss-20b; pesos cuantizados con PV-MACaQ |
| Parametros totales | 16.144.123.968 (segun safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados: 3 bits afines PV-MACaQ (bloque de 64, Walsh-Hadamard, pre_scale por experto); atencion: 4 bits PV-MACaQ; embedding y lm_head: 4 bits afines; router, attention sinks, normas y sesgos: BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la del modelo base; incluye LICENSE y USAGE_POLICY) |
| Formato de pesos | safetensors para MLX (2 shards, 9,40 GB) |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. La build parte de los pesos de `openai/gpt-oss-20b` y aplica un proceso de cuantizacion post-entrenamiento sobre las capas de expertos enrutados, que en el modelo original estan en MXFP4. El esquema PV-MACaQ usa bloques de 64 elementos con transformada de Walsh-Hadamard, un factor `pre_scale` por experto y un barrido de clipping con paso V. Segun el autor, esto eleva la relacion senal-cuantizacion (SQNR) media de los expertos de 13,49 dB (3 bits simple) a 15,65 dB. La atencion se cuantiza a 4 bits PV-MACaQ, con SQNR de 19,82 a 22,08 dB. Router, attention sinks, normas y sesgos se mantienen en BF16 para preservar la estabilidad del enrutado.

El modelo base conserva el formato de razonamiento Harmony de gpt-oss, que no permite desactivar el modo de razonamiento, y las recomendaciones de muestreo de OpenAI (temperatura 1.0, top_p 1.0). El autor no documenta la composicion del dataset de entrenamiento original ni el numero de tokens, por lo que esos datos deben consultarse en la model card de `openai/gpt-oss-20b`.

## Capacidades

- Generacion de texto y razonamiento en formato Harmony, con niveles de esfuerzo de razonamiento configurables (por ejemplo, `--reasoning-effort low`); el razonamiento no se puede desactivar por completo.
- Capacidades heredadas del modelo base gpt-oss-20b; esta build no anade ni elimina funciones, solo cambia la precision numerica de los pesos.
- Soporte de tool calling y function calling: no confirmado de forma explicita en la informacion disponible, aunque es una capacidad documentada del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de decodificacion con kernel experimental de 3 bits (`--experimental-q3-kernel`), que eleva la decodificacion de 77,1 a 78,9 tok/s segun el autor.

## Casos de uso

- Inferencia local en Mac con memoria unificada de 24 GB: la build ocupa 9,40 GB y alcanza un pico de GPU de 10,6 GB, lo que permite ejecutar gpt-oss-20b en un M4 Pro de 24 GB con margen para el sistema y otras aplicaciones.
- Prototipado de agentes con razonamiento en local: el formato Harmony y el parametro `--reasoning-effort` permiten ajustar el coste de razonamiento por consulta sin salir del equipo del desarrollador.
- Servicio HTTP local mediante `basalt serve --rest`: util para exponer el modelo a scripts, notebooks o interfaces propias en una red de desarrollo.
- Evaluacion comparativa de tecnicas de cuantizacion: la model card publica SQNR por componente (expertos y atencion) y metricas de decodificacion, lo que sirve como referencia para quien investigue esquemas de cuantizacion de 3 bits en MLX.
- Edicion de codigo asistida en local: el autor reporta 63,2 tok/s en tareas de edicion de codigo con temperatura 0,7, suficiente para autocompletado y refactorizacion interactiva.
- Generacion de prosa y borradores con temperatura 1.0: 70,5 tok/s medidos, adecuado para flujos de escritura asistida en local sin dependencia de la nube.
- Despliegue en entornos con restricciones de privacidad: al ser Apache 2.0 y ejecutarse en local, los datos no salen del equipo, lo que encaja en prototipos con datos sensibles.

## Benchmarks y rendimiento

El autor publica mediciones de inferencia en un Apple M4 Pro de 24 GB con basalt `main`, un modelo a la vez, 256 tokens de decodificacion tras calentamiento y CI en reposo. La fila de referencia es la build MXFP4 estandar sobre el mismo binario.

| Build | Tamano | Decodificacion greedy | Codigo t=0.7 / prosa t=1.0 | Pico de GPU | Escalera (calentamiento / peldaños) |
|---|---|---|---|---|---|
| Esta build (3 bits) | 9,40 GB | 77,1 tok/s; 78,9 con `--experimental-q3-kernel` | 63,2 / 70,5 tok/s | 10,6 GB | 3/3, 4/5 |
| `mlx-community/gpt-oss-20b-MXFP4-Q4` | 11,2 GB | 77,5 tok/s | 63,7 / 71,3 tok/s | 12,2 GB | 3/3, 3/5 |

Datos adicionales: sonda de perplejidad al cargar el modelo con resultado 3,70 sobre el texto de prueba para la build de 3 bits; la escalera usa `benchmarks/ladder` de basalt con 3 tareas de calentamiento y 5 peldaños graduados a temperatura 0,2, por lo que un peldaño queda dentro de la variabilidad entre ejecuciones. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: pico de GPU de 10,6 GB medido en M4 Pro de 24 GB; el repo pesa 9,40 GB en disco.
- GPU recomendadas: Apple Silicon; la medicion oficial es sobre Apple M4 Pro con 24 GB de memoria unificada. No hay datos para A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo Apple: si, en un M4 Pro de 24 GB con margen; no hay datos para configuraciones de 16 GB.
- Opciones de despliegue: exclusivamente basalt (runtime MLX del autor), con `basalt serve --model ... --reasoning-effort low --rest`. Requiere una version de basalt posterior a v0.12.0 (PRs goodmai/basalt#651 y #652); en v0.12.0 las capas de expertos MACaQ tomaban la ruta lenta float32 x bfloat16 de MLX y la decodificacion caia a unos 36 tok/s.
- Latencia y throughput: 77,1 tok/s en decodificacion greedy y 63,2-70,5 tok/s en tareas con muestreo, sobre el hardware citado.
- No hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI: el formato es safetensors para MLX y depende de kernels propios de basalt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Esta build (3 bits PV-MACaQ) | 16,14 B | no disponible | safetensors MLX, 9,40 GB | 77,1 tok/s greedy en M4 Pro 24 GB; SQNR expertos 15,65 dB | Apache 2.0 |
| `mlx-community/gpt-oss-20b-MXFP4-Q4` | mismo modelo base | no disponible | MLX, 11,2 GB | 77,5 tok/s greedy en el mismo equipo; SQNR no disponible | Apache 2.0 |
| `goodmai/gpt-oss-20b-PV-MACaQ-4bit-Affine-MLX` | mismo modelo base | no disponible | MLX, aproximadamente 11,8 GB (2,4 GB mas que la build de 3 bits) | no disponible en la informacion proporcionada; el autor indica 6 dB mas de SQNR en expertos | Apache 2.0 |

## Limitaciones y advertencias

- Dependencia estricta de basalt posterior a v0.12.0; con versiones anteriores el rendimiento cae aproximadamente a la mitad (36 tok/s).
- No es compatible con runtimes estandar de MLX, llama.cpp, Ollama, vLLM ni TGI segun la informacion disponible; el ecosistema de despliegue es muy reducido.
- Perdida de precision frente al modelo base: SQNR de 15,65 dB en expertos y 22,08 dB en atencion; puede degradar tareas sensibles a la precision numerica, aunque el autor reporta una perplejidad de sonda de 3,70.
- El razonamiento Harmony no se puede desactivar, lo que incrementa el consumo de tokens en cada respuesta.
- Sin datos publicados de benchmarks academicos ni de evaluacion multilingue; no se puede verificar la calidad frente al modelo original mas alla de la sonda del autor.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion de 3 bits puede amplificarlo en dominios especializados.
- Sesgos: no documentados en la informacion disponible; deben consultarse en la model card de `openai/gpt-oss-20b`.
- Uso comercial permitido por Apache 2.0, sujeto a la USAGE_POLICY del modelo base.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad ni mantenimiento garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/gpt-oss-20b-PV-MACaQ-3bit-Affine-MLX
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Build de 4 bits del mismo autor: https://huggingface.co/goodmai/gpt-oss-20b-PV-MACaQ-4bit-Affine-MLX
- Runtime basalt: https://github.com/goodmai/basalt
- Build MXFP4 de referencia: https://huggingface.co/mlx-community/gpt-oss-20b-MXFP4-Q4
