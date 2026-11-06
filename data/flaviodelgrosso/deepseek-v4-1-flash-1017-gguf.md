# flaviodelgrosso/DeepSeek-V4.1-Flash-1017-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de gran escala desarrollado por DeepSeek, distribuido originalmente en formato safetensors y publicado con licencia MIT. Con 397.912.431.744 parámetros totales (aproximadamente 398 mil millones), se posiciona en la categoria de modelos frontera de pesos abiertos. La variante aqui descrita no es el checkpoint original, sino una cuantizacion GGUF producida por el usuario flaviodelgrosso mediante su herramienta Razor, empaquetada directamente desde el checkpoint oficial de safetensors.

El artefacto principal, `DeepSeek-V4.1-Flash-1017-R2.75.gguf`, ocupa 396 GB y aplica una asignacion de precision calibrada por experto que promedia 2,75 bits por peso (bpw) sobre los expertos enrutados, manteniendo los tensores estaticos en FP8 E4M3, BF16 y F32 verbatim. Se acompana de un drafter DSpark de 8,6 GB para decodificacion especulativa sin perdida.

La relevancia de esta publicacion es doble: por un lado, ofrece una via para ejecutar un modelo de ~400B parametros en hardware de consumo de gama alta (Apple Silicon de 128 GB) mediante streaming de expertos desde SSD; por otro, advierte explicitamente de que los ficheros no son cargables por llama.cpp ni por otros runtimes GGUF estandar, ya que los payloads de expertos, FP8 y Engram son tensores opacos `I8`/`U8` cuya codificacion se declara en metadatos `deepseek41.*` y solo el motor Razor sabe interpretarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con expertos enrutados, tensores FP8 E4M3 con escalas de bloque E8M0, tablas Engram y componente DSpark para decodificacion especulativa; detalles completos de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 397.912.431.744 (~398B) |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens en la configuracion de referencia del autor (`--context 16384`); contexto maximo nativo no disponible |
| Tipos de cuantizacion | R2.75 calibrada: expertos enrutados en q2 (2 bits) o q3 (2 bits + plano residual de 1 bit) segun mapa de precision, promedio 2,75 bpw; estaticos en FP8 E4M3, BF16 y F32 verbatim, con nueve clases re-codificadas a Q4_K/Q5_K; tablas Engram en FP8 lossless (`e4m3_e8m0_32_row264`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF propietario de Razor (contenedor GGUF con payloads opacos `I8`/`U8`); no compatible con llama.cpp |

## Arquitectura y entrenamiento

La informacion disponible describe el proceso de cuantizacion y empaquetado, no el entrenamiento del modelo base. El checkpoint original de DeepSeek emplea una arquitectura de mezcla de expertos con expertos enrutados almacenados en MXFP4, tensores FP8 E4M3 con escalas de bloque E8M0, tensores BF16 y F32, y tablas Engram que se leen bajo demanda desde disco. El artefacto R2.75 asigna a cada tensor de experto (por capa, experto y proyeccion `gate_up`/`down`) un nivel de precision q2 o q3 seleccionado mediante un mapa de precision calibrado, aplicando una rotacion Hadamard por bloque fija por capa.

La calibracion se realizo sobre trazas de enrutamiento, estadisticas de activacion por experto y sensibilidad ΔKLD por proyeccion medidas sobre el artefacto lossless (los propios expertos MXFP4 del checkpoint), seguidas de una asignacion con presupuesto de bytes restringida por una replica de la cache de expertos de Razor. Los corpus de calibracion y evaluacion son disjuntos. El proceso es reproducible byte a byte mediante `razor convert deepseek41 --precision-map razor-convert/src/deepseek41/r2.75.map` sobre el checkpoint en la revision `1bae0e1088993b9b82de08f59de5be5a34e42170`; sin mapa de precision, el mismo comando genera el artefacto lossless de 501,5 GB. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en el material proporcionado.

## Capacidades

- Generacion de texto y razonamiento de proposito general, segun la pipeline declarada `text-generation`.
- Decodificacion especulativa mediante el drafter DSpark de 8,6 GB, descrito como lossless y de la misma revision que el modelo principal.
- Lectura bajo demanda de tablas Engram desde disco, lo que permite ampliar capacidad efectiva sin cargar todo en memoria.
- Streaming de expertos desde SSD con cache fijada de 32 GiB, disenado para equipos de 128 GB.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en cuantizacion extrema: el artefacto sirve como referencia reproducible para estudiar el impacto de asignaciones de precision calibradas por experto frente a baselines uniformes a igual presupuesto de bits (2,75 bpw), con metricas de KLD y acuerdo top-1 ya publicadas.
- Ejecucion local de un modelo de ~400B en Apple Silicon: con un Mac de 128 GB y streaming de expertos desde SSD interno, permite experimentar con un modelo de escala frontera sin infraestructura de centro de datos, a costa de un throughput de ~22 tok/s.
- Generacion de texto asistida por decodificacion especulativa: el drafter DSpark permite acelerar la generacion en el motor Razor con `--speculation opportunistic`, util en tareas interactivas donde la latencia importa.
- Evaluacion comparativa de motores de inferencia: al no ser cargable por llama.cpp, el modelo es un banco de pruebas para validar implementaciones alternativas de GGUF con payloads opacos y esquemas de metadatos propietarios.
- Benchmarking de hardware de consumo para modelos masivos: la configuracion documentada (prompt de 2.048 tokens, 256 generados, contexto 16.384, huella pico de 43,4 GB sin swap) proporciona una referencia reproducible para medir SSD, memoria unificada y cache de expertos en equipos Apple.
- Analisis de procedencia y verificacion de artefactos: los metadatos incluyen SHA-256 de cada shard del checkpoint, version del packer, nombre y hash del mapa de precision, lo que facilita auditorias de cadena de suministro en despliegues experimentales.

## Benchmarks y rendimiento

| Metrica | R2.75 | Baseline uniforme 2,75 bpw |
|---|---:|---:|
| KLD media vs profesor (corpus de calibracion) | 0,0960 | 0,1241 |
| Acuerdo top-1 | 0,918 | no disponible |
| Reduccion de KLD | −22,6% | referencia |

Mediciones de decodificacion en Apple M5 Max de 128 GB con streaming de expertos desde SSD (`engine_bench --placement ssd:32 --context 16384`, prompt de 2.048 tokens, 256 generados): 21,8–22,4 tok/s, huella pico de 43,4 GB, sin swap. El autor indica que las puntuaciones completas sobre el corpus de evaluacion estan pendientes. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: la configuracion de referencia usa una cache de expertos fijada de 32 GiB y alcanza una huella pico de 43,4 GB; el fichero completo ocupa 396 GB en disco y los expertos se transmiten desde SSD bajo demanda.
- Hardware validado: Apple M5 Max con 128 GB de memoria unificada y SSD interno; el autor afirma que cabe en Macs de 128 GB.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible; el motor Razor solo se ejecuta en Apple Silicon segun la model card.
- Opciones de despliegue: exclusivamente Razor (`razor serve`), con `--placement ssd`, `--expert-cache-gib 32`, `--context 16384` y `--speculation opportunistic` junto al drafter DSpark. llama.cpp, vLLM, Ollama y TGI no pueden cargar estos ficheros.
- Latencia y throughput: 21,8–22,4 tok/s en decodificacion con la configuracion medida; latencia de primera token no disponible.
- Almacenamiento: se requieren al menos 396 GB para el modelo y 8,6 GB para el drafter, mas espacio para la cache; se recomienda SSD interno por el uso de `pread` explicito.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 R2.75 (esta ficha) | ~398B | 16.384 en config. de referencia | 2,75 bpw calibrada + estaticos FP8/BF16/F32 | MIT | Solo Razor en Apple Silicon |
| DeepSeek-V4.1-Flash-1017 lossless (artefacto Razor) | ~398B | no disponible | Sin perdida, 501,5 GB | MIT | Solo Razor en Apple Silicon |
| DeepSeek-V4.1-Flash-1017 original (safetensors) | ~398B | no disponible | FP8 E4M3, BF16, F32, MXFP4 | MIT | Frameworks estandar (safetensors) |
| Baseline uniforme 2,75 bpw | ~398B | no disponible | 2,75 bpw uniforme | MIT | Solo Razor en Apple Silicon |

No se dispone de datos sobre modelos alternativos de otros desarrolladores con los que comparar parametros, contexto y rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Incompatibilidad de runtime: los ficheros no son cargables por llama.cpp ni por otros runtimes GGUF estandar; los payloads de expertos, FP8 y Engram son tensores opacos cuya codificacion solo interpreta Razor. Esto limita drasticamente la portabilidad y ata el uso a Apple Silicon.
- Perdida de calidad por cuantizacion: aunque la KLD media es de 0,0960 frente al profesor, existe divergencia respecto al modelo lossless; el acuerdo top-1 es del 91,8%, lo que implica un 8,2% de discrepancias en la prediccion principal.
- Evaluacion incompleta: el autor declara que las puntuaciones completas sobre el corpus de evaluacion estan pendientes; no hay benchmarks estandar publicados en la informacion disponible.
- Rendimiento modesto: ~22 tok/s en decodificacion con streaming desde SSD, insuficiente para muchas cargas de produccion de alta concurrencia.
- Dependencia de hardware especifico: requiere Apple Silicon con 128 GB de memoria unificada y SSD rapido; no hay soporte documentado para GPU NVIDIA u otras plataformas.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue ni calidad por idioma.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones de sesgo, toxicidad o tasas de alucinacion en la informacion disponible; deben asumirse los riesgos habituales de un modelo de esta escala sin documentacion especifica.
- Restricciones de licencia: MIT, igual que el modelo upstream, lo que permite uso comercial; no obstante, el autor remite a la licencia de los pesos originales de DeepSeek y el uso queda condicionado por la dependencia del motor Razor.
- Procedencia y confianza: el artefacto lo produce un tercero (flaviodelgrosso) a partir del checkpoint oficial; aunque se documentan hashes y verificacion byte a byte, conviene auditar los metadatos de procedencia antes de un despliegue serio.
- Trazabilidad de la cuantizacion: la calidad depende del mapa de precision `r2.75` y del corpus de calibracion; cambios en el mapa o en la revision del checkpoint pueden alterar el comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/flaviodelgrosso/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- Herramienta Razor: https://github.com/flaviodelgrosso/razor
- Revision del checkpoint: `1bae0e1088993b9b82de08f59de5be5a34e42170`
- SHA-256 del fichero R2.75: `6558432dc1e65f009267759e50d6132b75738894883c3a95449f752a3b7bab6a`
- SHA-256 del mapa de precision `r2.75`: `eebc9b03206b1892403ce5c08f6f9972ccc86003b526c598c1f9cf5e548a7e43`
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
