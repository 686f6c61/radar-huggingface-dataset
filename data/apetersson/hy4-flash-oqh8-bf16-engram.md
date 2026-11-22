# apetersson/Hy4-flash-oQh8-BF16-Engram

## Resumen

Hy4-flash-oQh8-BF16-Engram es una derivacion comunitaria cuantizada del modelo instructivo tencent/Hy4-flash, publicada por el usuario apetersson. No se trata de una cuantizacion oficial de Tencent, sino de una conversion orientada al ecosistema MLX (Apple Silicon) que reduce el nucleo de texto a 8 bits mientras conserva en BF16 la torre de vision y las tablas Engram originales. El resultado es un checkpoint de aproximadamente 42.224 millones de parametros con un repositorio de 176,5 GB, pensado para ejecutarse en equipos Apple Silicon de gran capacidad de memoria unificada.

El modelo resuelve un problema practico: ejecutar un modelo de gran tamano con arquitectura MoE y soporte de vision en hardware Apple sin disponer de GPUs dedicadas. Para ello combina cuantizacion RTN (round-to-nearest, sin calibracion) de 8 bits con rotacion Walsh-Hadamard de 256 elementos en los expertos enrutados y cuantizacion afín de grupo 64 en el tronco denso, lo que eleva el rendimiento de decodificacion de 25,8 a 29,3 tok/s segun el autor.

Su relevancia actual radica en que demuestra un flujo de cuantizacion especifico para MLX sobre una arquitectura hibrida con expertos, tablas Engram e iHC, manteniendo verificacion byte a byte de los tensores no cuantizados y de la torre de vision. La licencia es la Tencent Hy License v1.0, no Apache 2.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con tronco denso, torre de vision y tablas Engram; formato MLX |
| Parametros totales | 42.224.901.653 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits RTN en expertos enrutados (Walsh-Hadamard 256 + afín grupo 128) y 8 bits RTN en tronco denso (grupo 64); vision y Engram en BF16 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License v1.0, no Apache 2.0) |
| Formato de pesos | safetensors (141 shards de texto, 161.708.155.556 bytes) + bundle de vision BF16 |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4-flash es un transformer con mezcla de expertos (MoE) que incorpora componentes poco habituales: 82 bancos de expertos fusionados, proyecciones de atencion desdobladas (q_a, q_b, kv_a, kv_b_proj), un router, un indexador disperso, proyecciones Engram, iHC y un tronco denso con MLP latente. La derivacion de apetersson no reentrena el modelo: aplica cuantizacion post-entrenamiento sobre el checkpoint original fijado en la revision d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959.

La innovacion tecnica esta en el esquema de cuantizacion. Los expertos enrutados usan rotacion Walsh-Hadamard firmada de 256 elementos y cuantizacion afín RTN de 8 bits con grupo 128 en la base rotada, almacenando signos, escalas y sesgos. El tronco denso (419 proyecciones de atencion, MLP compartido, denso y latente, y la cabeza LM) usa RTN afín de 8 bits con grupo 64 de MLX estandar; al leerse en cada token, esta decision mejora la decodificacion. Los 931 tensores restantes (kv_b_proj, router, indexador disperso, proyecciones Engram, iHC, normas y embeddings) son identicos byte a byte al original. No se dispone de informacion sobre el volumen de tokens de entrenamiento ni sobre el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto conversacional e instructiva a partir de prompts, con el comando nativo `omlx hy4-flash generate`.
- Razonamiento y generacion de codigo: el ejemplo de la model card solicita una funcion Python para fusionar iterables ordenados de forma perezosa.
- Extraccion de caracteristicas de imagen mediante la torre de vision BF16 independiente (27 bloques de encoder y proyector imagen-lenguaje), verificada byte a byte.
- Procesamiento de imagenes con el procesador de imagenes original incluido en el bundle de vision.
- Soporte de decodificacion greedy y control de parametros de generacion (max-tokens, prefill-chunk, precast-lm-head).
- Capacidades multilingues: no disponible.
- Tool calling, function calling y comportamiento agentico: no disponible en la informacion proporcionada.
- Generacion de respuestas a partir de imagenes: no implementada en el comando oMLX actual; la extraccion de caracteristicas y la generacion de texto estan verificadas por separado.

## Casos de uso

- Generacion de codigo en local sobre Apple Silicon: el modelo puede recibir prompts de programacion y producir funciones completas, como el ejemplo de fusion perezosa de iterables ordenados, con un rendimiento medido de 29,3 tok/s en decodificacion tras cuantizar el tronco denso.
- Prototipado de asistentes conversacionales en estaciones de trabajo Mac: al ejecutarse mediante MLX y oMLX, permite iterar sobre prompts instructivos sin depender de servicios en la nube, siempre que se disponga de unos 170 GB de memoria unificada libre.
- Extraccion de embeddings visuales para pipelines de recuperacion: el bundle de vision permite codificar imagenes localmente sin descargar el nucleo de texto de 162 GB, util para indexar y comparar caracteristicas de imagen.
- Evaluacion de tecnicas de cuantizacion: el modelo sirve como banco de pruebas para comparar el esquema oQh8 (Walsh-Hadamard + RTN) frente a la revision BF16 byte-exacta disponible en b20c188b, midiendo impacto en velocidad y fidelidad.
- Investigacion sobre arquitecturas MoE con tablas Engram: los tensores Engram se conservan en BF16 y se cargan desde los shards originales de Tencent, lo que permite estudiar su efecto sin reentrenar.
- Despliegue de inferencia de texto en hardware de memoria unificada: con las 82 bancos de expertos residentes (pico MLX de 163,2 GB), se puede mantener una sesion de generacion continua en un Mac de 256 GB.
- Generacion de documentacion tecnica y explicaciones de codigo: el modelo acepta prompts instructivos y devuelve texto estructurado, adecuado para tareas de redaccion asistida en local.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son mediciones de velocidad del autor, no benchmarks de calidad:

| Medicion | Entorno | Resultado |
|---|---|---|
| Decodificacion con tronco BF16 | M5 Ultra 256 GB, MLX 0.32.4, greedy | 25,8 tok/s |
| Decodificacion con tronco 8 bits | M5 Ultra 256 GB, MLX 0.32.4, greedy | 29,3 tok/s |
| Pico de memoria MLX | Todos los bancos de expertos residentes | 163,2 GB |
| Carga de tablas Engram | Primera tabla por filas (--first-engram pread) | 29,50 GiB |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 170 GB de memoria unificada directamente libre; se recomienda un Mac de 256 GB con otras aplicaciones cerradas.
- GPU recomendadas: Apple Silicon de gama alta; la medicion oficial se realizo en un M5 Ultra con 256 GB. No hay datos para A100, H100 ni RTX 4090, ya que el formato MLX esta orientado a Apple Silicon.
- Cabida en GPU consumer: no en GPUs dedicadas convencionales por el formato y el tamano; en Apple Silicon requiere configuraciones de memoria muy alta.
- Opciones de despliegue: oMLX con el pull request jundot/omlx#5423 (commit bb26851b o posterior para la revision de tronco 8 bits); las versiones estandar de oMLX no cargan esta arquitectura. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: decodificacion de 29,3 tok/s en M5 Ultra con tronco 8 bits; si la memoria libre es insuficiente, macOS pagina los buffers de GPU y la decodificacion cae por debajo de 1 tok/s.
- Almacenamiento: repositorio de 176,5 GB mas 118,02 GiB de tablas Engram descargadas de Tencent, con staging en SSD interno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-oQh8-BF16-Engram | 42.224.901.653 | no disponible | 8 bits RTN en texto, BF16 en vision y Engram | tencent-hy-license | Hugging Face, MLX/oMLX |
| tencent/Hy4-flash (original) | no disponible en la informacion | no disponible | BF16 | tencent-hy-license | Hugging Face |
| Hy4-flash-oQh8-BF16-Engram revision b20c188b | 42.224.901.653 | no disponible | Tronco BF16 byte-exacto | tencent-hy-license | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas de otros fabricantes en la informacion proporcionada, por lo que no es posible una comparativa de rendimiento con modelos de la misma categoria.

## Limitaciones y advertencias

- No es una cuantizacion oficial de Tencent; es una derivacion comunitaria y debe evaluarse como tal.
- La cuantizacion es RTN sin calibracion (no GPTQ), lo que puede degradar la fidelidad respecto al checkpoint original en tareas sensibles.
- La licencia Tencent Hy License v1.0 no es Apache 2.0; es necesario revisar las restricciones de uso comercial antes de desplegar en produccion.
- Requiere aproximadamente 170 GB de memoria unificada libre; con menos memoria el rendimiento cae por debajo de 1 tok/s por paginacion del sistema.
- Depende de una version no fusionada de oMLX (pull request 5423); las versiones estables no cargan la arquitectura.
- Las tablas Engram no se incluyen en el repositorio y deben descargarse por separado desde Tencent (118,02 GiB), con pasos de staging y verificacion manuales.
- La generacion de respuestas a partir de imagenes no esta implementada; solo se verifica la extraccion de caracteristicas visuales.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni longitud de contexto, por lo que estos aspectos no pueden evaluarse con los datos disponibles.
- El modelo DFly queda omitido en esta release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apetersson/Hy4-flash-oQh8-BF16-Engram
- Revision con tronco BF16 byte-exacto: https://huggingface.co/apetersson/Hy4-flash-oQh8-BF16-Engram/tree/b20c188b164d6fc8428146d0e081ea2f8a2ad2b0
- Modelo base tencent/Hy4-flash: https://huggingface.co/tencent/Hy4-flash/tree/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959
- Licencia Tencent Hy License v1.0: https://huggingface.co/tencent/Hy4-flash/blob/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959/LICENSE
- Pull request de oMLX: https://github.com/jundot/omlx/pull/5423
- Documentacion del pull request: https://github.com/jundot/omlx/pull/5423/files
- Repositorio oMLX: https://github.com/jundot/omlx
