# AXERA-TECH/Qwen3.5-2B-AX8860-llama.cpp

## Resumen

AXERA-TECH/Qwen3.5-2B-AX8860-llama.cpp es un paquete de despliegue que adapta el modelo Qwen3.5-2B (1.942.653.248 parametros, aproximadamente 2B) para ejecutarse sobre la NPU del chip Axera AX8860 mediante una bifurcacion de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo: es una distribucion optimizada del modelo base de Qwen que incluye pesos en formato GGUF (q8_0), un codificador visual en BF16, kernels especificos para la NPU, binarios estaticos para la placa y scripts de ejecucion y benchmark.

El paquete resuelve un problema concreto de ingenieria: llevar un modelo multimodal de 2B parametros a un SoC de inferencia de bajo consumo con aceleracion NPU, ofreciendo entrada de texto e imagen, decodificacion especulativa opcional (MTP) y un servidor compatible con la API de OpenAI. Es relevante para desarrolladores que trabajan en edge computing, dispositivos embebidos y despliegues de IA local, donde el consumo energetico y la latencia importan tanto como la calidad del modelo.

Los datos publicados por el autor muestran 76,2 tokens/s en decodificacion simple y hasta 128,5 tokens/s con MTP adaptativo (1,68x) en contenido estructurado, con un contexto maximo de 16384 tokens y un prefill de 6774 tokens/s en prompts de 4k. El repositorio ocupa 4,8 GB e incluye tanto los pesos como el entorno de ejecucion, lo que lo convierte en un artefacto listo para desplegar en hardware AX8860 con SDK V0.5.1 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B); backend llama.cpp con ggml-axera sobre NPU AX8860 |
| Parametros totales | 1.942.653.248 (aproximadamente 2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 16384 tokens |
| Tipos de cuantizacion | q8_0 (pesos, 2,08 GB); BF16 (codificador visual, 0,8 GB) |
| Idiomas soportados | no disponible (los benchmarks incluyen chino e ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (qwen3.5-2b-q8_0.gguf y mmproj-Qwen3.5-2B-BF16.gguf) |

## Arquitectura y entrenamiento

La ficha corresponde a una distribucion de inferencia, no a un entrenamiento original. El modelo base es Qwen3.5-2B, un transformer de aproximadamente 2B parametros desarrollado por Qwen; este repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Lo que anade AXERA-TECH es la capa de ejecucion: kernels NPU propios (carpetas `kernels/` y `kernels_mtp/`), binarios estaticos de llama.cpp compilados para la placa y scripts (`run.sh`, `bench.sh`) que orquestan la inferencia.

La innovacion tecnica destacable es la implementacion de MTP (multi-token prediction) como decodificacion especulativa sobre la NPU: un cabezal de borrador genera varios tokens candidatos que el modelo objetivo verifica en una pasada de 4 filas, con tasas de aceptacion de entre 0,500 y 0,633 segun el tipo de contenido. El modo es opcional (`MTP=1` adaptativo, `MTP=force` forzado, desactivado por defecto) y no altera los parametros de muestreo. Ademas, el paquete incluye un codificador visual separado en BF16 para entrada de imagenes y un servidor compatible con la API de OpenAI con soporte de system messages en mitad de conversacion y razonamiento desactivado por defecto.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 16384 tokens.
- Entrada multimodal: procesa imagenes mediante el codificador visual `mmproj-Qwen3.5-2B-BF16.gguf` (descripcion de vehiculos, texto en imagenes, personas).
- Razonamiento matematico y resolucion de problemas (validado en los escenarios de benchmark MTP: "maths").
- Generacion de codigo y contenido estructurado (listas de comandos Linux, tablas Markdown), con aceleracion MTP especialmente efectiva en estos formatos.
- Traduccion chino-ingles e ingles-chino (escenario "translation" del benchmark).
- Redaccion de prosa en chino e ingles (ensayos, historias, explicaciones).
- Servidor compatible con la API de OpenAI (`sh run.sh -s 8080`), apto para clientes de agentes como Codex.
- Modo de razonamiento configurable en el servidor (`--reasoning off` por defecto).
- Cache de prompt en memoria de 4 GB o en disco SSD via `CACHE_DIR`.

## Casos de uso

- Asistentes conversacionales en dispositivos embebidos: el modelo corre en la NPU de un SoC AX8860 con 76,2 tokens/s, suficiente para interaccion en tiempo real sin depender de la nube; el contexto de 16384 tokens permite mantener historiales largos de conversacion.
- Descripcion de imagenes en edge: con `sh run.sh -i bus.jpg "Describe this image." 256` el codificador visual BF16 procesa la imagen y el modelo genera descripciones de vehiculos, texto y personas, util en inspeccion visual, accesibilidad o catalogacion automatica en campo.
- Generacion de codigo y comandos en herramientas de desarrollo locales: la aceleracion MTP alcanza 128,5 tokens/s en listas de comandos Linux y 108,0 tokens/s en codigo, lo que hace viable autocompletado y generacion de scripts en un IDE embebido.
- Traduccion automatica local chino-ingles: el escenario de traduccion del benchmark muestra 108,0 tokens/s con MTP, adecuado para pipelines de traduccion en dispositivos sin conectividad.
- Servidor de inferencia compatible con OpenAI para agentes: `sh run.sh -s 8080` expone un endpoint compatible con clientes como Codex, con soporte de system messages en mitad de conversacion, lo que permite integrar el modelo como backend de agentes autonomos en entornos locales.
- Generacion de documentacion estructurada: tablas Markdown a 117,7 tokens/s con MTP, util para generar informes, fichas tecnicas o documentacion de API de forma automatizada en herramientas internas.
- Prototipado de aplicaciones multimodales en hardware de bajo consumo: el paquete incluye pesos, kernels, binarios y scripts de benchmark, lo que permite reproducir el rendimiento (`sh bench.sh`) y validar latencias antes de integrar el modelo en un producto.

## Benchmarks y rendimiento

Rendimiento de decodificacion publicado por el autor (tokens/s, ctx 16384, maximo 256 tokens por prueba, greedy salvo indicacion):

| Contenido | Sin MTP | MTP adaptativo | Aceleracion | Tasa de aceptacion |
|---|---:|---:|---:|---:|
| Lista de comandos Linux | 76,7 | 128,5 | 1,68x | 0,633 |
| Matematicas | 77,3 | 124,0 | 1,60x | 0,605 |
| Tabla Markdown | 76,7 | 117,7 | 1,54x | 0,589 |
| Traduccion chino-ingles | 75,8 | 108,0 | 1,42x | 0,500 |
| Codigo | 76,3 | 108,0 | 1,42x | 0,529 |
| Ensayo en chino | 76,7 | 77,3 | 1,01x | no disponible |
| Historia en ingles | 76,5 | 77,0 | 1,01x | no disponible |
| Explicacion en chino | 76,9 | 77,5 | 1,01x | no disponible |
| Codigo con muestreo recomendado | 76,3 | 76,6 | 1,00x | no disponible |
| Ensayo en chino con muestreo | 75,7 | 76,2 | 1,01x | no disponible |

Prefill y decodificacion base (`sh bench.sh`, 128 tokens generados):

| Prompt | Contexto | Tiempo de prompt | Decodificacion (tokens/s) |
|---|---:|---:|---:|
| 5 tokens | 8192 | 0,05 s | no disponible |
| 47 tokens | 8192 | 0,08 s | no disponible |
| 3908 tokens | 8192 | 0,58 s | 75,0 |
| 5 tokens | 16384 | 0,06 s | no disponible |
| 47 tokens | 16384 | 0,07 s | no disponible |
| 3908 tokens | 16384 | 0,60 s | 73,8 |
| 3908 tokens, muestreo | 8192 | 0,59 s | 72,2 |

Calidad: perplexity sobre `ppl_zh.txt` (`-c 512 --chunks 2`) de 12,3236 con `-ub 1` y 12,3143 con `-ub 4` (MTP desactivado). La verificacion de MTP muestra que 63 de 64 tokens greedy coinciden con la decodificacion normal, con la unica diferencia en un caso de probabilidades casi empatadas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- NPU Axera AX8860 obligatoria, con SDK V0.5.1 o superior; el runtime ocupa las 4 cores de NPU de forma exclusiva.
- No esta pensado para GPU de sobremesa: los binarios de `bin/` estan compilados estaticamente para la placa y los kernels son especificos de la NPU; no cabe en GPUs consumer como RTX 4090 ni en A100/H100 mediante este paquete.
- Memoria: pesos q8_0 de 2,08 GB mas codificador visual BF16 de 0,8 GB; cache de prompt por defecto en 4 GB de memoria host, configurable a disco SSD con `CACHE_DIR`.
- Almacenamiento: repositorio de 4,8 GB (pesos, kernels, binarios y scripts).
- Despliegue: scripts `run.sh` (texto, imagen, chat interactivo y servidor OpenAI-compatible) y `bench.sh` (reproduccion de benchmarks); `llama-bench` disponible con `-b 4096 -ub 4096`.
- Latencia y throughput medidos: 76,2 tokens/s en decodificacion simple, hasta 128,5 tokens/s con MTP adaptativo, prefill de 6774 tokens/s en prompts de 4k (3908 tokens en 0,58 s a ctx 8192).
- Nota operativa: en algunos entornos las peticiones consecutivas fallan ocasionalmente con `ret = -3`; el autor indica reintentar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| AXERA-TECH/Qwen3.5-2B-AX8860-llama.cpp | 1.942.653.248 | 16384 | NPU AX8860 (llama.cpp + ggml-axera) | no disponible | Paquete optimizado para edge; 76,2 tokens/s base, 128,5 con MTP |
| Qwen/Qwen3.5-2B (modelo base) | aproximadamente 2B | no disponible en esta ficha | Generico (segun pesos originales) | no disponible | Modelo original sin optimizacion de NPU; referencia de calidad del paquete |
| Otros despliegues llama.cpp de modelos 2B en GGUF | aproximadamente 2B | variable | CPU/GPU generica | variable | No se dispone de datos comparables de rendimiento en esta informacion |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware: requiere una NPU AX8860 con SDK V0.5.1 o superior; no es desplegable en GPU convencionales ni en CPU generica con este paquete.
- Licencia no disponible: no se especifica la licencia del paquete ni la del modelo base en la informacion proporcionada; verificar antes de uso comercial.
- Idiomas no declarados formalmente: los benchmarks cubren chino e ingles, pero no hay lista oficial de idiomas soportados.
- Riesgo de alucinacion: inherente a modelos de 2B parametros; no se publican evaluaciones de factualidad ni benchmarks de conocimiento.
- MTP no acelera prosa ni peticiones con muestreo: en modo adaptativo, ensayos, historias y explicaciones se quedan en torno a 77 tokens/s; las peticiones greedy necesitan `presence_penalty: 0` para aprovechar la aceleracion.
- Inestabilidad ocasional: fallos `ret = -3` en peticiones consecutivas en algunos entornos, mitigables con reintentos.
- Contexto limitado a 16384 tokens, insuficiente para documentos muy largos o conversaciones extensas sin estrategias de resumen.
- Exclusividad de recursos: el runtime ocupa las 4 cores de NPU y el servidor corre con `-np 1`, por lo que no permite concurrencia alta.
- Sin datos de sesgo: no se publican evaluaciones de sesgos; se recomienda auditoria antes de produccion en aplicaciones sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-2B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Bifurcacion de llama.cpp utilizada: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `0104880be`)
