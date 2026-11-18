# J-sandler/Qwen3-4B-DFlash-2

## Resumen

Qwen3-4B-DFlash-2 es un modelo borrador (draft model) para decodificacion especulativa, publicado por el usuario J-sandler y disenado para acelerar la inferencia de Qwen/Qwen3-4B. No es un modelo de lenguaje autonomo ni un checkpoint compatible con `AutoModelForCausalLM`: es una exportacion nativa para SGLang que se acopla al modelo objetivo Qwen3-4B y propone tokens candidatos que el modelo grande verifica en paralelo. Su relevancia radica en que permite reducir la latencia de generacion de Qwen3-4B sin alterar los pesos del modelo objetivo, manteniendo la calidad de salida gracias al muestreo de rechazo (rejection sampling).

El modelo emplea una arquitectura DFlash-2 con codificador de caracteristicas fusionado, atencion bidireccional por bloques, convoluciones de dos tomas con tamano de grupo 16 y un selector top-16 de rango 256. Consta de cinco capas de borrador y opera con bloques de 16 (15 tokens propuestos por paso). El checkpoint publicado ocupa 1,3 GB y contiene 632.360.192 parametros en formato safetensors, lo que supone aproximadamente una sexta parte del modelo objetivo Qwen3-4B.

Se trata de una publicacion de investigacion orientada a la reproducibilidad de benchmarks: el autor lo describe como la linea base entrenada de DFlash-2 utilizada en la comparativa del benchmark DNeo, y advierte explicitamente de que no son los pesos publicados por los autores originales de la arquitectura. La licencia es Apache-2.0, lo que facilita su uso y modificacion, aunque la dependencia de una version concreta de SGLang condiciona su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash-2 (modelo borrador para decodificacion especulativa; codificador de caracteristicas fusionado, atencion bidireccional por bloques, convoluciones de dos tomas con grupo 16, selector top-16 de rango 256) |
| Parametros totales | 632.360.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Qwen3-4B durante la decodificacion especulativa) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la salida linguistica la determina el modelo objetivo Qwen3-4B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (exportacion nativa para SGLang) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DFlash-2, un esquema de borrador para decodificacion especulativa que combina un codificador de caracteristicas fusionado, atencion bidireccional por bloques, convoluciones de dos tomas con tamano de grupo 16 y un selector top-16 de rango 256. La configuracion publicada usa cinco capas de borrador, bloques de 16 tokens (de los cuales se proponen 15) y no incorpora memoria de rechazo ni enrutamiento MoFA. La disposicion de los tensores de pesos es identica a la de la exportacion probada en el benchmark, segun indica el autor.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. El modelo se presenta como una linea base entrenada por el autor, no como los pesos originales de DFlash-2, y se distribuye junto con `export_manifest.json`, `benchmark_provenance.json` y `SHA256SUMS` para registrar su identidad y los ajustes probados. El autor no formula nuevas afirmaciones de benchmark ni de generalizacion mas alla de los resultados del benchmark DNeo.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: propone hasta 15 tokens candidatos por bloque que el modelo objetivo Qwen3-4B verifica en paralelo.
- Integracion con el modo thinking de Qwen3-4B: el autor indica explicitamente que debe usarse con thinking habilitado.
- Compatibilidad con muestreo de rechazo (speculative rejection sampling) para preservar la distribucion de salida del modelo objetivo.
- No es un modelo generativo autonomo: no produce texto por si mismo, no soporta tool calling ni razonamiento multi-paso de forma independiente.
- Capacidades multilingues, de codigo o matematicas: no disponibles como capacidades propias; dependen integramente del modelo objetivo Qwen3-4B.
- Sin soporte de vision ni audio.

## Casos de uso

- Reduccion de latencia en produccion con Qwen3-4B: desplegar Qwen3-4B con este borrador en SGLang para disminuir el tiempo por token en cargas interactivas, manteniendo la calidad del modelo objetivo gracias al muestreo de rechazo.
- Servicio de chat con thinking mode: usar el par Qwen3-4B + DFlash-2 en escenarios donde el razonamiento extendido de Qwen3-4B es necesario y la latencia percibida es critica, como asistentes tecnicos o tutores.
- Reproduccion de benchmarks de decodificacion especulativa: emplear el checkpoint junto con los ficheros de procedencia para replicar los resultados del benchmark DNeo con la revision y el commit de SGLang documentados.
- Investigacion sobre metodos de borrador: servir como linea base DFlash-2 para comparar variantes de arquitectura de borrador (por ejemplo, con memoria de rechazo o enrutamiento MoFA) en igualdad de condiciones.
- Despliegue en infraestructura con GPU de gama media: al ocupar 1,3 GB, el borrador anade una huella de memoria moderada sobre Qwen3-4B, lo que permite acelerar inferencia en entornos donde no cabe un modelo objetivo mayor.
- Evaluacion de pipelines SGLang: validar configuraciones de `--speculative-algorithm DFLASH` y `--speculative-num-draft-tokens 16` en entornos de staging antes de adoptar decodificacion especulativa en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite al benchmark DNeo y a su guia de benchmarks, pero no incluye cifras concretas (aceleracion, tasa de aceptacion, throughput) en la model card.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 1,3 GB en el formato safetensors publicado; se suma a la memoria requerida por Qwen3-4B (del orden de 8 GB en BF16 solo para pesos, mas cache KV).
- GPU recomendadas: no disponibles de forma especifica; el despliegue depende de SGLang y del modelo objetivo Qwen3-4B. Cualquier GPU capaz de servir Qwen3-4B en SGLang puede alojar el borrador.
- GPU de consumo: el borrador en si cabe en practicamente cualquier GPU consumer moderna; el limite lo impone Qwen3-4B, que requiere GPUs con 8-16 GB de VRAM segun cuantizacion y longitud de contexto.
- Opciones de despliegue: exclusivamente SGLang, con el build fijado en el commit `7ccbf5fd04f7ee23095fc38e49e749d58dc18282` documentado en la guia de instalacion de DNeo. No es compatible con vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- Parametros de despliegue: `--speculative-algorithm DFLASH`, `--speculative-draft-model-path J-sandler/Qwen3-4B-DFlash-2`, `--speculative-num-draft-tokens 16`, con muestreo de rechazo y revision del objetivo `1cfa9a7208912126459214e8b04321603b3df60c`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-DFlash-2 (este) | 632 M | no disponible | Borrador DFlash-2 para Qwen3-4B | Apache-2.0 | Hugging Face, SGLang |
| Pesos originales DFlash-2 (z-lab/dflash) | no disponible | no disponible | Borrador de referencia de los autores | no disponible en la informacion | GitHub z-lab/dflash |
| DSpark (DeepSeek DeepSpec) | no disponible | no disponible | Framework de decodificacion especulativa | no disponible en la informacion | GitHub deepseek-ai/DeepSpec |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede cargarse con `AutoModelForCausalLM` ni usarse fuera de SGLang como generador de texto.
- Requiere una version concreta de SGLang (commit `7ccbf5fd04f7ee23095fc38e49e749d58dc18282`); otras versiones pueden no ser compatibles con la exportacion.
- El autor advierte de que no son los pesos originales de DFlash-2, sino una linea base entrenada por el propio autor; no debe citarse como implementacion oficial.
- No se aportan datos sobre sesgos, tasas de alucinacion ni comportamiento multilingue del borrador; estos dependen del modelo objetivo Qwen3-4B.
- Debe usarse con thinking habilitado en Qwen3-4B; otros modos de operacion no estan documentados.
- La licencia Apache-2.0 cubre los pesos entrenados, pero la arquitectura y el codigo de inferencia subyacentes (DFlash/DFlash-2, DSpark, SGLang) mantienen sus propias licencias, segun el fichero NOTICE.
- Modelo con muy baja adopcion (2 descargas, 0 likes en el momento de la consulta); no hay validacion independiente de su comportamiento fuera del benchmark del autor.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ) ni variantes optimizadas para otros runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/J-sandler/Qwen3-4B-DFlash-2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio DNeo (instalacion): https://github.com/J-sandler/DNeo/blob/main/INSTALL.md
- Guia de benchmarks DNeo: https://github.com/J-sandler/DNeo/blob/main/BENCHMARKS.md
- DFlash / DFlash-2 (z-lab): https://github.com/z-lab/dflash
- DSpark (DeepSeek DeepSpec): https://github.com/deepseek-ai/DeepSpec
- SGLang: https://github.com/sgl-project/sglang
