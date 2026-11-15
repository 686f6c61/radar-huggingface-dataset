# changh95/qwen3-32b-bh-galaxy

## Resumen

qwen3-32b-bh-galaxy es un paquete de despliegue (bundle) publicado por el usuario changh95 que empaqueta el modelo Qwen3-32B de Alibaba Qwen para ejecutarse sobre hardware Tenstorrent Blackhole, concretamente en una configuracion Galaxy de 32 chips dispuestos en una malla 8x4. No se trata de un modelo nuevo ni de un fine-tune con pesos propios: el repositorio no contiene los pesos, sino las ruedas (wheels) de ttnn, vLLM y el plugin vllm-tt, junto con el codigo del modelo y la configuracion necesaria para servirlo. Los pesos se descargan aparte desde Qwen/Qwen3-32B en la revision `9216db5781bf21249d130ec9da846c4624c16137`.

El modelo subyacente es Qwen3-32B, un transformer denso de 32.800 millones de parametros con 64 capas, atencion GQA con 64 cabezas de consulta y 8 de clave/valor, QK-norm y una ventana de contexto de 131.072 tokens. El bundle lo sirve con prefill en paralelismo tensorial sobre la malla completa y cuatro carriles de decodificacion en paralelismo de datos a traves de vLLM, con cache de prefijos activada y hasta 32 secuencias concurrentes.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra como llevar un modelo denso de 32B a aceleradores Tenstorrent con una mejora de decodificacion de aproximadamente el 29 % respecto a la revision anterior (9,71 ms frente a 13,72 ms por token con 32 usuarios) y con resultados de evaluacion que superan a la revision previa en AIME24, MATH-500 y GPQA Diamond. Esta pensado para entornos con hardware Blackhole Galaxy, no para GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 64 capas, GQA 64/8 cabezas, QK-norm |
| Parametros totales | 32.800 millones (32,8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Pesos MLP y KV cache en bfp8 (segun la configuracion de medida del autor); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos originales de Qwen/Qwen3-32B descargados aparte; el bundle incluye codigo, wheels y manifiesto (schema 5), no los pesos |

## Arquitectura y entrenamiento

El modelo base es Qwen3-32B, un transformer denso de 64 capas con atencion de consultas agrupadas (64 cabezas de consulta, 8 de clave/valor), normalizacion QK y un contexto nativo de 131.072 tokens. El bundle no modifica los pesos ni el entrenamiento del modelo: se limita a empaquetar el codigo de inferencia y las dependencias necesarias para ejecutarlo en la malla Blackhole Galaxy.

La innovacion tecnica del paquete esta en el plano del despliegue. Se sirve mediante vLLM 0.26.0 con el plugin vllm-tt (revision `dd287f9`) sobre tt-metal v0.79.0 y tt-inference-server v0.23.0. El prefill se reparte en paralelismo tensorial por los 32 chips de la malla 8x4, mientras que la decodificacion usa cuatro carriles en paralelo de datos. Incluye cache de prefijos y compilacion JIT de kernels con captura de trazas para toda la malla; el primer arranque en frio tarda unos 48 minutos en el host de referencia y genera unos 60 GB de pesos convertidos en `.tt_cache` y unos 16 GB de kernels compilados en `.cache`. El autor documenta que el interleave de prioridad de decodificacion del plugin, activado por defecto, perjudica el rendimiento en este modelo (el TPOT mediano a 32 usuarios y 16384/128 pasa de 16 ms a 63 ms), por lo que la configuracion de servicio lo desactiva.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3-32B es un modelo de proposito general con modo de razonamiento, evaluado por el autor en AIME24 (83,3), MATH-500 (94,4) y GPQA Diamond (69,2).
- Matematicas y resolucion de problemas: los resultados de MATH-500 y AIME24 indican competencia en razonamiento matematico de competicion.
- Generacion de codigo: capacidad heredada de Qwen3-32B; no se han publicado resultados de HumanEval ni de otros benchmarks de codigo en la informacion disponible.
- Servicio compatible con la API de OpenAI: el bundle arranca un servidor con id de modelo `Qwen/Qwen3-32B` en el puerto 20000 (o el siguiente libre), lo que permite integrarlo con clientes que hablan el protocolo de OpenAI.
- Concurrencia: hasta 32 secuencias simultaneas con cache de prefijos activada.
- Contexto largo: ventana de 131.072 tokens, con medidas de rendimiento especificas para prompts de 32.768 tokens.
- Tool calling, function calling, soporte de agentes y capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en infraestructura Tenstorrent: el caso principal del bundle es ejecutar Qwen3-32B sobre una Galaxy de 32 chips Blackhole mediante `tt-model serve`, obteniendo un endpoint compatible con OpenAI sin necesidad de GPUs. Es adecuado cuando la organizacion ya dispone de hardware Blackhole y quiere aprovecharlo con un modelo denso de 32B.
- Procesamiento de documentos largos: con 131.072 tokens de contexto y cache de prefijos, el modelo puede analizar contratos, informes o bases de codigo extensas en una sola pasada. El autor mide 50,7 tok/s por usuario y 2.452 ms de TTFT con prompts de 32.768 tokens a un usuario.
- Razonamiento matematico y cientifico por lotes: los resultados en AIME24 (83,3), MATH-500 (94,4) y GPQA Diamond (69,2) lo hacen util para pipelines de evaluacion o generacion de soluciones verificables en dominios STEM, siempre que el throughput agregado de la malla (hasta 3.186 tok/s con 32 usuarios y prompts cortos) sea suficiente.
- Chat multi-turno con concurrencia moderada: con 32 secuencias simultaneas y un TPOT de aproximadamente 10 ms por token, es viable para asistentes conversacionales internos con decenas de usuarios concurrentes, no para servicios de consumo masivo.
- Despliegue air-gapped: el bundle es autocontenido, instala las wheels desde el propio paquete en un venv de Python 3.10 sin contenedor y descarga los pesos una sola vez; encaja en entornos con conectividad restringida una vez preparado el host.
- Evaluacion comparativa de hardware: al incluir cifras de referencia reproducibles (matriz de 54 celdas con `vllm bench serve`, demo de tt-metal y tt-inference-server), sirve como banco de pruebas para medir el rendimiento de la malla Blackhole frente a otras plataformas con el mismo modelo base.

## Benchmarks y rendimiento

Medidas del autor con pesos reales, bfp8 en MLP y KV cache, decodificacion greedy y trazas calientes, sobre tt-metal v0.79.0 y plugin `dd287f9` (1 de octubre de 2026).

Demo de tt-metal (`text_qwen_demo.py`):

| Metrica | Revision anterior | Revision actual |
|---|---|---|
| Decodificacion, 32 usuarios x 128/128, ms/token | 13,72 | 9,71 |
| Decodificacion por usuario, tok/s | 72,9 | 103,0 |
| Throughput agregado, 32 usuarios, tok/s | 2.333 | 3.296 |
| Decodificacion, 1 usuario, ms/token | no disponible | 9,82 |
| TTFT, 32 usuarios x 128 tokens | 273 ms | 281-287 ms |
| TTFT, 1 usuario x 128 tokens | no disponible | 130-149 ms |
| 1 usuario x 4K prompt: decodificacion / TTFT | no disponible | 11,43 ms / 300 ms |
| Precision top-1 / top-5 | 97,4 / 100 | 96,4 / 100 |

Servicio mediante vLLM (`vllm bench serve`, cache de prefijos activada, media de dos matrices de 54 celdas):

| Usuarios | Entrada/Salida | tok/s por usuario | tok/s agregado | TTFT medio (ms) |
|---|---|---|---|---|
| 1 | 128/128 | 100,5 | 100 | 132 |
| 1 | 4096/128 | 85,1 | 85 | 328 |
| 1 | 32768/128 | 50,7 | 51 | 2.452 |
| 32 | 128/128 | 99,6 | 3.186 | 480 |
| 32 | 4096/128 | 82,8 | 2.648 | 7.120 |
| 32 | 32768/128 | 55,1 | 1.763 | 55.798 |

tt-inference-server v0.23.0:

| Prueba | Resultado |
|---|---|
| Benchmarks, 1 usuario 128/128 | TTFT 95,8 ms, TPOT 10,0 ms |
| Benchmarks, 32 usuarios 128/128 | 2.442 tok/s, TTFT 401 ms, TPOT 10,0 ms |
| Evaluaciones (PASS 3/3) | AIME24 83,3; MATH-500 94,4; GPQA Diamond 69,2 |

## Requisitos de hardware

- Acelerador: Tenstorrent Blackhole Galaxy (32 chips en malla 8x4, perfil `p150x32`, malla `BH-Galaxy`). No es ejecutable en GPU convencionales ni en CPU.
- VRAM: no aplica; el modelo reside en la memoria de los chips Blackhole. El bundle ocupa unos 900 MB y los pesos de Qwen3-32B unos 62 GB.
- Almacenamiento: aproximadamente 140 GB libres recomendados (900 MB del bundle, 62 GB de pesos, 60 GB de pesos convertidos en `.tt_cache` y 16 GB de kernels en `.cache`).
- Software de host: driver y firmware de Blackhole Galaxy, compilador SFPI 7.78.0 en `/opt/tenstorrent/sfpi` (o desempaquetado en `<venv>/lib/python3.10/site-packages/ttnn/runtime/sfpi`), Python 3.10 en un venv propio.
- Despliegue: `tt-model pull changh95/qwen3-32b-bh-galaxy --with-weights` y `tt-model serve changh95/qwen3-32b-bh-galaxy`; servidor compatible con OpenAI en el puerto 20000. No usa contenedores.
- Arranque: el primer arranque en frio tarda unos 48 minutos en el host de referencia por la compilacion de kernels y la captura de trazas; los arranques posteriores reutilizan las caches.
- Latencia y throughput: TPOT de aproximadamente 10 ms por token; hasta 3.296 tok/s agregados con 32 usuarios y prompts de 128 tokens; TTFT de 132 ms a un usuario con prompt corto y 2.452 ms con prompt de 32.768 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware | Rendimiento de referencia |
|---|---|---|---|---|---|
| qwen3-32b-bh-galaxy (este bundle) | 32,8B denso | 131.072 | Apache 2.0 | Blackhole Galaxy (32 chips) | 3.296 tok/s agregados a 32 usuarios; AIME24 83,3 |
| Qwen/Qwen3-32B (modelo base) | 32,8B denso | 131.072 | Apache 2.0 | GPU (vLLM, TGI, etc.) | no disponible en la informacion proporcionada |
| Revision anterior de este bundle (`780b268`) | 32,8B denso | 131.072 | Apache 2.0 | Blackhole Galaxy | 2.333 tok/s agregados a 32 usuarios; AIME24 76,7; MATH-500 93,2; GPQA 60,6 |

No se dispone de datos de rendimiento del modelo base sobre GPU en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa entre plataformas.

## Limitaciones y advertencias

- Dependencia de hardware exotico: solo funciona en Tenstorrent Blackhole Galaxy; no hay soporte para GPU, CPU ni otras plataformas en este bundle.
- El repositorio no contiene los pesos: hay que descargarlos por separado desde Qwen/Qwen3-32B (unos 62 GB) y el arranque en frio requiere unos 48 minutos y 140 GB de disco.
- Fragilidad de versiones: el bundle fija tt-metal v0.79.0, vLLM 0.26.0, el plugin `dd287f9`, tt-inference-server v0.23.0 y SFPI 7.78.0; desviarse de estas versiones puede romper la compilacion JIT.
- Configuracion de servicio no trivial: el interleave de decodificacion del plugin debe desactivarse explicitamente (`"decode_interleave_enabled": false`); dejarlo activo degrada el TPOT a 32 usuarios y 16384/128 de 16 ms a 63 ms.
- Precisión de tokens: la comprobacion top-1 baja del 97,4 % de la revision anterior al 96,4 %, lo que implica una tasa de discrepancia de aproximadamente el 3,6 % respecto a la referencia.
- Idiomas soportados: no disponibles en la informacion proporcionada; las capacidades multilingues no estan documentadas en este bundle.
- Sesgos, riesgo de alucinacion y limitaciones de contexto o idioma: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3-32B.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-32B y de las dependencias empaquetadas (ttnn, vLLM, vllm-tt-plugin).
- Madurez: el repositorio tiene 0 descargas y 0 likes, y esta mantenido por un autor individual; no es una publicacion oficial de Tenstorrent ni de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/changh95/qwen3-32b-bh-galaxy
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Compilador SFPI: https://github.com/tenstorrent/sfpi
