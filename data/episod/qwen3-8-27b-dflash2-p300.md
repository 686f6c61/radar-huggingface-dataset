# episod/qwen3.8-27b-dflash2-p300

## Resumen

`episod/qwen3.8-27b-dflash2-p300` no es un modelo entrenado desde cero, sino un bundle de despliegue (formato `tt-model` v6 thin, en fase beta y no soportado oficialmente) que sirve el modelo base Qwen/Qwen3.8-27B sobre hardware Tenstorrent. Concretamente, empaqueta la configuración necesaria para ejecutar Qwen3.8-27B con vLLM 0.26.0 sobre dos chips Blackhole de una misma placa p300 (mesh P150x2, tensor parallel = 2, FABRIC_1D), con decodificación especulativa DFlash2 mediante el drafter `incoai/Qwen3.8-27B-DFlash2` y verify GDN fusionado.

El interés del artefacto es que permite servir el contexto completo del modelo base, 262.144 tokens, en hardware de aceleración no-GPU (Tenstorrent Blackhole) y con hasta 4 usuarios concurrentes, con caché KV en bf8 y pesos en bfp4 (gate/up) y bfp8 (resto). El repositorio pesa solo 0,1 GB porque es un bundle "thin": no contiene los pesos, que se descargan aparte (unos 54 GB en la primera ejecución desde una máquina limpia).

Su relevancia es doble: por un lado, sirve como receta reproducible (`tt-model pull` + `tt-model serve`) para levantar un servidor compatible con la API de OpenAI en hardware Tenstorrent; por otro, documenta mediciones reales de throughput y recuperación en contexto largo realizadas por el autor. Es un trabajo unipersonal, no revisado ni respaldado por terceros, con licencia Apache 2.0 y soporte únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el bundle; corresponde al modelo base Qwen/Qwen3.8-27B (arquitectura del base no detallada en la informacion proporcionada). El bundle usa tensor parallel TP=2 sobre mesh P150x2 |
| Parametros totales | 27 000 millones (deducido de la denominacion del modelo base; no confirmado en la informacion proporcionada) |
| Parametros activos | No disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | 262 144 tokens (contexto completo del modelo base) |
| Tipos de cuantizacion | Pesos: bfp4 en gate/up, bfp8 en el resto. Cache KV: bf8. Revision de pesos `Qwen/Qwen3.8-27B@1d4bf0f2`, drafter `incoai/Qwen3.8-27B-DFlash2@dedf8df6` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Bundle `tt-model` v6 thin (beta, no soportado oficialmente), tensores ttnn. No incluye safetensors ni GGUF en el repositorio (0,1 GB) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna de Qwen/Qwen3.8-27B ni su proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO). Lo que si se detalla es la arquitectura de servicio del bundle: inferencia con vLLM 0.26.0 compilado para target vacio, reparto en tensor parallel de grado 2 sobre dos chips Blackhole de la misma placa (mesh P150x2, FABRIC_1D), con firmware bundle 19.15.0 y tt-kmd 2.11.0.

La innovacion tecnica destacable es la decodificacion especulativa DFlash2 con verify GDN fusionado, que acelera la decodificacion usando un modelo drafter dedicado. El decodificador resultante es estrictamente greedy: no admite control de temperatura ni de muestreo. La vision esta desactivada en este bundle. El bundle incluye ademas cache de modelos (tag `tt-model-cache`) y habilita los parsers `qwen3_coder` (tool calling) y `qwen3` (razonamiento).

## Capacidades

- Generacion de texto y razonamiento en ingles, heredados del modelo base Qwen3.8-27B.
- Parsers de razonamiento (`qwen3`) y de tool calling / function calling (`qwen3_coder`) habilitados en el servidor.
- Recuperacion en contexto largo verificada: passkey retrieval correcto en prompts de 2.075, 13.321, 132.784 y 255.924 tokens.
- Trabajo tipo agente sobre repositorios: en una prueba informal con `qwencode`, el modelo leyo un directorio de proyecto, respondio preguntas sobre el y razono sobre dos repositorios (`tt-model-manager` y `tenstorrent/skills`) y sobre si un modelo podia levantarse junto a ellos.
- Generacion de codigo dentro del conjunto de prompts SPEED-Bench (20 prompts de coding medidos).
- Servicio multiusuario: hasta 4 usuarios concurrentes con cache KV en bf8.
- Servidor compatible con la API de OpenAI (endpoint `/v1/completions` verificado con `vllm bench serve`).
- Capacidades NO disponibles en este bundle: vision (desactivada), control de temperatura y muestreo (decodificacion greedy unicamente), multilingue mas alla del ingles.

## Casos de uso

- Agentes de codigo sobre repositorios completos: el modelo puede leer un arbol de proyecto de decenas de miles de tokens en una sola pasada (hasta 262.144 tokens de contexto) y responder preguntas sobre el. La prueba informal con `qwencode` sugiere viabilidad para tareas de lectura y razonamiento, aunque no se evaluaron sesiones largas de edicion multi-paso.
- Recuperacion y sintesis sobre documentacion extensa: con passkey retrieval verificado a 255.924 tokens y 111 segundos de pared (prefill + 24 tokens de decodificacion), es adecuado para preguntas sobre contratos, especificaciones o bases de codigo completas en ingles.
- Asistente interno de codigo para equipos pequenos: el servidor admite hasta 4 usuarios concurrentes con salida agregada de 190,7 tok/s en 20 prompts de coding a 4 usuarios (57,2 tok/s por usuario), suficiente para un equipo reducido de desarrollo.
- Pipelines de tool calling en automatizacion de CI/CD: el parser `qwen3_coder` permite invocar funciones desde el modelo, integrarlo con herramientas de build o de gestion de incidencias y encadenar llamadas.
- Evaluacion y banco de pruebas de hardware Tenstorrent Blackhole: el bundle sirve como referencia reproducible (memoria por chip medida: 24,90 de 30,83 GiB asignados tras el warmup de prefill) para comparar aceleradores no-GPU frente a GPU en cargas de contexto largo.
- Razonamiento sobre multiples repositorios relacionados: caso documentado de analisis conjunto de `tt-model-manager` y `tenstorrent/skills` para determinar si un modelo puede desplegarse con ellos.
- Generacion offline por lotes con prompts largos: con `--ignore-eos` y lotes de 128/1024 tokens de salida se alcanzan 160 tok/s agregados a 4 usuarios, util para resumen o extraccion masiva sobre documentos largos en ingles.
- Base para desarrollo de tecnicas de decodificacion especulativa: el bundle integra DFlash2 y permite reproducir las mediciones de velocidad (86,9 tok/s por usuario a 1 usuario en 20 prompts de coding) frente a la build fuente (85,9 tok/s).

## Benchmarks y rendimiento

Rendimiento medido sobre la build equivalente del arbol fuente (no sobre el bundle empaquetado), con `vllm bench serve`, `/v1/completions`, prompts aleatorios de exactamente ISL tokens, `--ignore-eos` y temperatura 0. `t/s` es el total agregado de tokens de salida por segundo; `(t/s/u)` es por usuario, calculado como OSL dividido por la latencia media extremo a extremo, por lo que incluye el prefill. Medias de 2 a 8 peticiones; `-` indica que el pool no admite esa concurrencia.

| ISL / OSL | 1 usuario | 2 usuarios | 4 usuarios |
|---|---|---|---|
| 128 / 128 | 46,8 (46,8) | 65,8 (32,9) | 104 (26,1) |
| 1.024 / 128 | 60,2 (60,2) | 88,5 (44,3) | 123 (30,7) |
| 2.048 / 128 | 51,2 (51,2) | 79,1 (39,6) | 106 (26,5) |
| 4.096 / 128 | 41,0 (41,0) | 58,0 (29,0) | 76,8 (19,2) |
| 8.192 / 128 | 33,5 (33,5) | 42,7 (21,4) | 49,2 (12,3) |
| 16.384 / 128 | 23,8 (23,8) | 27,7 (13,9) | 30,4 (7,6) |
| 32.768 / 128 | 12,5 (12,5) | 13,9 (6,9) | 14,9 (3,7) |
| 65.536 / 128 | 6,5 (6,5) | 6,8 (3,4) | - |
| 131.072 / 128 | 2,8 (2,8) | - | - |
| 200.000 / 128 | 1,6 (1,6) | - | - |
| 128 / 1.024 | 68,3 (68,3) | 103 (51,5) | 160 (40,1) |
| 8.192 / 1.024 | 69,0 (69,0) | 107 (53,6) | 146 (36,5) |

Recuperacion de passkey sobre el servidor empaquetado (un intento por caso):

| Tokens de prompt | Passkey recuperado | Tiempo de pared (prefill + 24 tokens) |
|---|---|---|
| 2.075 | Si | 5 s |
| 13.321 | Si | 8 s |
| 132.784 | Si | 46 s |
| 255.924 | Si | 111 s |

Otras mediciones relevantes: los 20 primeros prompts de coding de SPEED-Bench dieron 86,9 tok/s por usuario a 1 usuario y 57,2 a 4 usuarios (190,7 agregados) sobre el bundle empaquetado, frente a 85,9 y 55,9 en la build fuente con identico recuento de tokens de salida (8.827). Los 20 primeros prompts de coding medidos en el servidor recien levantado corrieron a 87,2 tok/s por usuario a 1 usuario. La tabla de TTFT en milisegundos y TPOT en milisegundos esta truncada en la informacion proporcionada: no disponible. HumanEval y la rejilla completa de benchmarks no se verificaron sobre el bundle; solo se menciona "una pequena comprobacion de pass@1" sin resultados numericos. No se han publicado resultados de MMLU, GSM8K u otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: 2 chips Blackhole de una misma placa de clase p300 (mesh P150x2), con firmware bundle 19.15.0 y tt-kmd 2.11.0. No es ejecutable en GPU convencionales ni en CPU.
- Memoria por chip tras el warmup de prefill: 24,90 GiB asignados de 30,83 GiB totales, 5,93 GiB libres por chip.
- Almacenamiento: aproximadamente 60 GB para pesos, mas decenas de GB para caches. La primera ejecucion en una maquina limpia descarga unos 54 GB y convierte los pesos antes de la fase de compilacion.
- Requisitos de host: two Blackhole chips de la misma placa con firmware y driver, hugepages de 1G montadas en `/dev/hugepages-1G`, toolchain SFPI en `/opt/tenstorrent/sfpi` y acceso de red para la instalacion.
- Tiempo de arranque: la compilacion en frio de kernels hace que el primer arranque tarde unos 25 minutos; arranques posteriores desde el Hub, unos 30 minutos desde el lanzamiento.
- No cabe en GPU de consumo: el artefacto depende de aceleradores Tenstorrent. La aplicabilidad a RTX 4090, A100 o H100 no esta documentada en la informacion proporcionada.
- Opciones de despliegue: `tt-model pull episod/qwen3.8-27b-dflash2-p300` y `tt-model serve episod/qwen3.8-27b-dflash2-p300`, que arranca un servidor compatible con OpenAI (identificador de modelo `Qwen/Qwen3.8-27B`) escuchando en el puerto 20000, no en el 8000 por defecto. Backend vLLM 0.26.0. El bundle construye su propio entorno virtual (`install.sh`: interprete, `ttnn`, `tt-metal-models`, vLLM para target vacio y el plugin).
- Latencia y throughput: ver la tabla de la seccion anterior. Como referencia de latencia de prefill, 46 segundos para 132.784 tokens y 111 segundos para 255.924 tokens, en ambos casos incluyendo 24 tokens de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| episod/qwen3.8-27b-dflash2-p300 | 27 000 millones (modelo base) | 262.144 tokens | 2 chips Blackhole de una placa p300, TP=2, vLLM + DFlash2 | Apache 2.0 | Publicado en HuggingFace; bundle beta no soportado |
| episod/qwen3.8-27b-dflash2-p150 | 27 000 millones (modelo base) | 16.384 tokens | 1 chip Blackhole (variante p150), mismo stack DFlash2 | Apache 2.0 | Publicado en HuggingFace |
| Qwen/Qwen3.8-27B (modelo base) | 27 000 millones (segun denominacion) | 262.144 tokens | No especificado en la informacion proporcionada | No disponible en la informacion proporcionada | Publicado en HuggingFace |
| incoai/Qwen3.8-27B-DFlash2 | No disponible (modelo drafter) | No disponible | Drafter de decodificacion especulativa | No disponible en la informacion proporcionada | Publicado en HuggingFace |

No se dispone de comparativas con alternativas de la misma categoria en hardware GPU (por ejemplo despliegues de Qwen3.8-27B en vLLM sobre A100 o H100): no disponible. La comparacion directa entre el bundle p300 y su hermano p150 se limita al numero de chips y a la ventana de contexto (262.144 frente a 16.384 tokens); no se han publicado cifras de rendimiento del p150 en la informacion proporcionada.

## Limitaciones y advertencias

- Bundle en formato `tt-model` v6 thin, marcado explicitamente como beta y no soportado: los flags y la disposicion pueden cambiar sin aviso.
- No revisado ni respaldado por nadie aparte de su autor. Las mediciones son de una sola persona y en una unica maquina.
- Decodificacion estrictamente greedy: no se admiten temperatura ni controles de muestreo, lo que limita tareas creativas o que requieran diversidad de salidas.
- Solo ingles (`language: en`). No hay soporte multilingue documentado.
- Vision desactivada en este bundle.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad, MMLU, GSM8K ni mecanismos de mitigacion. La unica comprobacion de calidad de codigo es una prueba informal con `qwencode` y un pass@1 sin cifras publicadas.
- Sesgos: no hay informacion sobre composicion del dataset de entrenamiento ni analisis de sesgos del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia y condiciones del modelo base Qwen/Qwen3.8-27B y del drafter `incoai/Qwen3.8-27B-DFlash2` deben verificarse por separado; no se detallan en la informacion proporcionada.
- La primera ejecucion en una maquina limpia requiere descargar unos 54 GB y convertir pesos; las corridas documentadas reutilizaron caches de tensores ttnn y de HuggingFace ya existentes (`TT_CACHE_PATH` / `HF_HOME`), por lo que el camino limpio no quedo verificado.
- No verificado en el bundle: HumanEval, la rejilla completa de rendimiento y cualquier host distinto del descrito. Las cifras de throughput corresponden a la build del arbol fuente, no al bundle empaquetado.
- Latencia de prefill muy alta en contextos extremos (111 s para 255.924 tokens), lo que descarta su uso interactivo con prompts de ese tamano.
- Estabilidad de produccion no garantizada: `tt-model serve` usa un puerto no estandar (20000) y el stack depende de versiones concretas de firmware y driver.

## Enlaces

- HuggingFace del bundle: https://huggingface.co/episod/qwen3.8-27b-dflash2-p300
- Bundle hermano de un solo chip (16K de contexto): https://huggingface.co/episod/qwen3.8-27b-dflash2-p150
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter de decodificacion especulativa: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorios mencionados en la model card: `tt-model-manager` y `tenstorrent/skills` (sin URL directa en la informacion proporcionada)
- No se han encontrado papers, blogs, repositorios ni demos adicionales relevantes en los resultados de busqueda web proporcionados.
