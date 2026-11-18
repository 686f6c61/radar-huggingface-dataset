# J-sandler/Qwen3-4B-DFlash

## Resumen

Qwen3-4B-DFlash es un modelo borrador (draft model) para decodificacion especulativa, publicado por el usuario J-sandler como linea base entrenada del proyecto DFlash, utilizada en la comparativa del benchmark DNeo. No es un modelo de lenguaje autonomo ni un checkpoint compatible con `AutoModelForCausalLM`: es una exportacion nativa para SGLang que debe emparejarse con el modelo objetivo Qwen/Qwen3-4B para acelerar la generacion mediante propuestas de tokens verificadas por el modelo grande.

El modelo parte de Qwen/Qwen3-4B y aplica la arquitectura DFlash, que combina un codificador de caracteristicas fusionado, atencion bidireccional por bloques y predicciones marginales de tokens. Consta de cinco capas borrador, opera con bloques de 16 tokens (15 propuestos) y no incorpora memoria de rechazo ni enrutamiento MoFA, a diferencia de las variantes mas avanzadas del mismo proyecto. Su unico proposito es servir como referencia reproducible frente a la que comparar otras tecnicas de decodificacion especulativa.

Con 537 millones de parametros en pesos safetensors y un repositorio de 1,1 GB, el modelo es ligero y esta pensado para ejecutarse junto al objetivo de 4B en el mismo pipeline de inferencia. Su relevancia es acotada: interesa a quienes investigan decodificacion especulativa y necesitan una linea base verificable con SGLang, no a quien busca un modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash (codificador de caracteristicas fusionado, atencion bidireccional por bloques, predicciones marginales de tokens); modelo borrador para decodificacion especulativa sobre Qwen/Qwen3-4B |
| Parametros totales | 537.427.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (exportacion nativa SGLang, no compatible con AutoModelForCausalLM) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura DFlash en su configuracion base: un codificador de caracteristicas fusionado que procesa el estado del modelo objetivo, atencion bidireccional por bloques que permite proponer varios tokens de forma simultanea, y cabezas de prediccion marginal de tokens. La configuracion empleada consta de cinco capas borrador y bloques de 16 tokens, de los cuales se proponen 15. No utiliza memoria de rechazo ni enrutamiento MoFA, mecanismos presentes en otras variantes del proyecto y ausentes aqui por tratarse de la linea base.

Los pesos fueron entrenados por el autor del repositorio y no corresponden a los publicados por los autores originales de DFlash. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. El layout de los tensores se mantiene identico a la exportacion probada, y el repositorio incluye `export_manifest.json`, `benchmark_provenance.json` y `SHA256SUMS` para verificar la identidad de los pesos y los ajustes utilizados.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa sobre Qwen/Qwen3-4B, con verificacion por muestreo de rechazo en SGLang.
- Aceleracion de la inferencia del modelo objetivo mediante la propuesta de hasta 15 tokens por bloque de 16.
- Integracion nativa con SGLang seleccionando `--speculative-algorithm DFLASH`.
- Funcionamiento previsto con el modo thinking de Qwen3-4B habilitado.
- No es un modelo generativo autonomo: no responde prompts por si mismo ni soporta tool calling, agentes o razonamiento multi-paso de forma independiente.
- No dispone de capacidades de vision, audio ni multilingues propias; hereda el comportamiento del modelo objetivo.

## Casos de uso

- Investigacion en decodificacion especulativa: sirve como linea base reproducible frente a la que medir variantes con memoria de rechazo o enrutamiento MoFA en el benchmark DNeo.
- Aceleracion de inferencia de Qwen3-4B en produccion: desplegado con SGLang y el algoritmo DFLASH, reduce la latencia por token al proponer bloques de tokens verificados por el modelo grande.
- Reproduccion de resultados academicos: el repositorio fija el commit de SGLang (`7ccbf5fd04f7ee23095fc38e49e749d58dc18282`) y la revision del modelo objetivo (`1cfa9a7208912126459214e8b04321603b3df60c`), lo que permite replicar exactamente el entorno del benchmark.
- Servicio de chat de baja latencia sobre Qwen3-4B: al emparejarse con el objetivo en modo thinking, acelera respuestas conversacionales sin cambiar la calidad del modelo base.
- Evaluacion comparativa de tecnicas de draft: permite aislar el efecto de las innovaciones de DFlash frente a la configuracion base de cinco capas y bloques de 16.
- Validacion de pipelines de decodificacion especulativa en CI: los ficheros de manifiesto y checksums facilitan comprobar la integridad de los pesos antes de desplegar en entornos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se formula ninguna nueva afirmacion de benchmark o generalizacion y remite a la guia de benchmarks del repositorio DNeo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 537 millones de parametros en safetensors, los pesos ocupan aproximadamente 1,1 GB en precision de entrenamiento.
- El modelo debe ejecutarse junto a Qwen/Qwen3-4B, por lo que el requisito real de VRAM lo domina el modelo objetivo, no el borrador.
- GPU recomendadas: no disponibles en la informacion proporcionada; el benchmark se realizo con SGLang, que soporta GPUs de datacenter tipo A100 y H100, pero no se confirma en la model card.
- Compatibilidad con GPU de consumo: no confirmada; al depender de una build concreta de SGLang y de un algoritmo especifico, la viabilidad en RTX 4090 u otras consumer no esta documentada.
- Opciones de despliegue: exclusivamente SGLang con la build fijada en la guia de instalacion de DNeo; no es compatible con llama.cpp, Ollama, vLLM ni TGI segun la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-DFlash (este) | 537 M | no disponible | Borrador especulativo DFlash, linea base | Apache-2.0 | Hugging Face, 2 descargas |
| Variantes DFlash con memoria de rechazo y MoFA | no disponible | no disponible | Borrador especulativo avanzado | no disponible | Referenciadas en el proyecto DNeo, sin datos publicos en la informacion disponible |
| Qwen/Qwen3-4B | 4B (aproximado, no confirmado en la informacion) | no disponible | Modelo objetivo generativo | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: no puede usarse con `AutoModelForCausalLM` ni responder prompts sin el modelo objetivo Qwen/Qwen3-4B.
- Requiere una build concreta de SGLang (commit `7ccbf5fd04f7ee23095fc38e49e749d58dc18282`); otras versiones pueden no ser compatibles.
- Solo funciona con el algoritmo `--speculative-algorithm DFLASH` y `--speculative-num-draft-tokens 16`; otros ajustes no estan validados.
- La model card no aporta informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas del borrador; estas dependen del modelo objetivo.
- No se documentan datos de entrenamiento, por lo que no es posible evaluar la composicion del dataset ni posibles sesgos heredados.
- Licencia Apache-2.0 para los pesos entrenados, pero la arquitectura y el codigo de inferencia upstream (DFlash, DSpark, SGLang) mantienen sus propias licencias, recogidas en el fichero NOTICE.
- El modelo tiene 2 descargas y 0 likes, sin validacion externa de la comunidad.
- No se ofrecen garantias de generalizacion mas alla del benchmark DNeo.

## Enlaces

- Hugging Face: https://huggingface.co/J-sandler/Qwen3-4B-DFlash
- Repositorio DNeo: https://github.com/J-sandler/DNeo
- Guia de instalacion DNeo: https://github.com/J-sandler/DNeo/blob/main/INSTALL.md
- Guia de benchmarks DNeo: https://github.com/J-sandler/DNeo/blob/main/BENCHMARKS.md
- DFlash (z-lab): https://github.com/z-lab/dflash
- DSpark / DeepSpec (DeepSeek): https://github.com/deepseek-ai/DeepSpec
- SGLang: https://github.com/sgl-project/sglang
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
