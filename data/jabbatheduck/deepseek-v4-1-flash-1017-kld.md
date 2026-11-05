# jabbatheduck/DeepSeek-V4.1-Flash-1017-KLD

## Resumen

DeepSeek-V4.1-Flash-1017-KLD es un artefacto de referencia publicado por el usuario jabbatheduck en HuggingFace, no un modelo entrenado de forma independiente. Consiste en la base de divergencia KL (KLD) generada al ejecutar `llama-perplexity` sobre una cuantizacion BF16 del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`, con el objetivo de servir como referencia para medir la degradacion de futuras cuantizaciones (GGUF de menor precision) frente al original en BF16.

El repositorio ocupa 6,6 GB y contiene el fichero `dsv41-bf16-base.kld` (6.593.688.820 bytes), un volcado binario de log-probabilidades por token sobre wikitext-2-raw, no pesos del modelo. No incluye pipeline declarado, licencia, idiomas ni tarjeta de modelo convencional; la model card se limita a documentar el comando exacto, la version de llama.cpp y las metricas obtenidas.

Su relevancia es practica para quien cuantiza modelos DeepSeek: permite reproducir la evaluacion de perplejidad y KLD de cualquier GGUF derivado del mismo modelo base con un comando estandar de llama.cpp, garantizando comparabilidad entre experimentos. No es utilizable para inferencia ni para generar texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto KLD; el modelo base referenciado es DeepSeek-V4.1-Flash-1017, arquitectura no detallada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluacion se ejecuto con `-c 512`) |
| Tipos de cuantizacion | BF16 como base de referencia; el artefacto en si no es un peso cuantizado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | fichero `.kld` binario (6.593.688.820 bytes); no contiene safetensors ni GGUF |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado. El contenido es un fichero de divergencia KL generado con `llama-perplexity` del proyecto llama.cpp, en el commit `330f0189c9fc71ef631f40211660a87d99251cc1`. El comando documentado es:

`llama-perplexity -m dsv41-bf16-00001-of-00008.gguf -f wiki.test.raw -c 512 -b 8192 -ub 8192 -ngl 99 --n-cpu-moe 40 -t 24 --chunks 100 --kl-divergence-base dsv41-bf16-base.kld`

Los parametros revelan detalles de la ejecucion: contexto de 512 tokens por chunk, batch y micro-batch de 8192, 99 capas descargadas a GPU, 40 capas MoE en CPU (`--n-cpu-moe 40`) y 24 hilos. El flag `--n-cpu-moe` sugiere que el modelo base emplea una arquitectura Mixture-of-Experts, aunque el numero de expertos y parametros activos no se especifica. El dataset de evaluacion es `wiki.test.raw` (wikitext-2-raw), con 100 chunks de 512 tokens. No hay informacion sobre datos de entrenamiento del modelo base en esta fuente.

## Capacidades

- Generacion de texto: no aplicable; el artefacto no es un modelo ejecutable.
- Razonamiento, codigo, matematicas: no aplicable.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad efectiva del artefacto: servir como base de referencia KLD para calcular divergencia de cuantizaciones derivadas del modelo DeepSeek-V4.1-Flash-1017 mediante `llama-perplexity --kl-divergence-base`.

## Casos de uso

- Evaluacion de cuantizaciones GGUF: usar el fichero como `--kl-divergence-base` en `llama-perplexity` para medir la divergencia KL de un GGUF Q4_K_M, Q5_K_M o Q8_0 respecto al BF16 original, obteniendo una metrica objetiva de perdida de calidad.
- Reproducibilidad de experimentos: el SHA-256 documentado (`f3b1a7e2d6d9ab47b98f7c18de8558a2455f907aae2f26dd53144f484aa63608`) permite verificar que la base no ha sido alterada entre ejecuciones y comparar resultados entre maquinas.
- Seleccion de cuantizacion para despliegue: comparar la KLD de varias cuantizaciones del mismo modelo para decidir el punto de equilibrio entre VRAM y fidelidad antes de desplegar en produccion.
- Validacion de builds de llama.cpp: al fijar el commit `330f0189c9fc71ef631f40211660a87d99251cc1`, se puede detectar regresiones numericas introducidas por cambios en el backend de inferencia.
- Benchmarking interno de hardware: la ejecucion documentada (559 s, 24 hilos, 40 capas MoE en CPU) sirve como referencia de rendimiento para configuraciones parciales GPU/CPU en maquinas con VRAM limitada.
- Auditoria de pipelines de cuantizacion: integrar la comparacion KLD en CI para bloquear la publicacion de GGUF cuya divergencia supere un umbral definido.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad (PPL) | 2,7394 +/- 0,03469 |
| Dataset | wikitext-2-raw (`wiki.test.raw`) |
| Chunks evaluados | 100 chunks de 512 tokens |
| Tiempo de ejecucion | 559 s |
| Configuracion | `-ngl 99 --n-cpu-moe 40 -t 24`, batch 8192 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El artefacto en si no requiere GPU: es un fichero de 6,6 GB que se lee como referencia durante la evaluacion.
- Para reproducir la evaluacion se necesita ejecutar `llama-perplexity` sobre el GGUF BF16 completo del modelo base, cuyo tamano no se detalla pero que se distribuye en al menos 8 shards (`dsv41-bf16-00001-of-00008.gguf`).
- La configuracion documentada usa 99 capas en GPU y 40 capas MoE en CPU, lo que indica que el modelo completo no cabe en una unica GPU consumer; se requiere un sistema con VRAM suficiente para la parte no-MoE y RAM abundante para las capas MoE en CPU.
- GPU recomendadas: no disponible en la informacion; por la configuracion (`--n-cpu-moe 40`) se asume un entorno con GPU de datacenter o workstation y gran cantidad de RAM del sistema.
- Opciones de despliegue: llama.cpp (unico backend documentado para este artefacto).
- Throughput/latencia: 559 s para 100 chunks de 512 tokens en la maquina del autor; no se especifica el hardware exacto.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamano | Proposito | Licencia |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-KLD (este) | Base KLD | 6,6 GB | Referencia de divergencia KL | no disponible |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | Modelo base | no disponible | Inferencia y generacion | no disponible |
| Otras bases KLD de la comunidad llama.cpp | Base KLD | variable | Referencia de divergencia KL | variable |

No se dispone de informacion sobre otros artefactos KLD comparables ni sobre las especificaciones del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia: no contiene pesos ni tokenizer; solo log-probabilidades de referencia.
- La referencia KLD solo es valida para comparar cuantizaciones del mismo modelo base (DeepSeek-V4.1-Flash-1017) y con el mismo tokenizer y dataset (`wiki.test.raw`).
- La evaluacion se limita a 100 chunks de 512 tokens (51.200 tokens); la KLD medida puede no reflejar el comportamiento en contextos largos o en dominios distintos de wikitext.
- El commit de llama.cpp esta fijado; cambios posteriores en el backend pueden alterar los valores y romper la comparabilidad.
- No se declara licencia, lo que impide asumir derechos de uso comercial o redistribucion.
- El repositorio no indica idiomas soportados ni sesgos del modelo base; cualquier evaluacion de sesgo o alucinacion debe hacerse sobre el modelo original, no sobre este artefacto.
- El autor es un usuario individual (jabbatheduck), no el equipo de DeepSeek; la calidad y procedencia de la ejecucion dependen de la reproducibilidad del comando documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jabbatheduck/DeepSeek-V4.1-Flash-1017-KLD
- Modelo base referenciado: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Proyecto llama.cpp (herramienta `llama-perplexity`): https://github.com/ggerganov/llama.cpp
- Commit de llama.cpp usado: `330f0189c9fc71ef631f40211660a87d99251cc1`
