# jcbtc/Apodex1.1-mini-Ciru-Halo-Agent-vllm-strix-halo

## Resumen

Apodex1.1 mini Ciru Halo Agent es un paquete de despliegue publicado por el usuario jcbtc a partir del modelo base `apodex/Apodex-1.1-mini`. No es un modelo entrenado desde cero: se trata de un checkpoint cuantizado a cuatro bits acompanado de un runtime propio (Ciru) construido sobre vLLM y ROCm y ajustado especificamente para el APU AMD Ryzen AI Max+ 395 / Radeon 8060S (gfx1151) con 128 GB de memoria unificada. El repositorio ocupa 23,5 GB y se publica bajo licencia Apache 2.0.

El objetivo declarado es servir ocho agentes locales concurrentes con uso de herramientas, codigo e historiales de trabajo largos sobre hardware integrado de gama alta. El perfil por defecto ofrece 262.144 tokens de contexto por peticion, ocho secuencias activas, una reserva compartida de 44 GiB para cache KV y estado recurrente, cache de prefijos y decodificacion especulativa nativa mediante MTP4 con tensores BF16 retenidos del modelo original, sin necesidad de descargar un drafter externo.

Su interes es doble. Por un lado, demuestra un perfil de servicio agentico sobre silicio AMD integrado. Por otro, la model card documenta cuatro reparaciones de runtime (guarda de fase de grafo, reparacion de slots MTP, contratos estrictos de herramientas) que abordan fallos reproducidos de corrupcion de cache en ese hardware. El coste es una fuerte dependencia del runtime suministrado: vLLM estandar, Transformers y llama.cpp no pueden servirlo directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura del modelo base) |
| Parametros totales | no disponible (una imagen de la card se titula "Apodex-35B", sin confirmar el recuento real) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens por peticion, incluyendo prompt y salida |
| Tipos de cuantizacion | pesos en 4 bits (checkpoint empaquetado propio); cache KV en BF16 y estado recurrente en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, en un formato empaquetado que requiere el runtime Ciru suministrado |
| Modelo base | apodex/Apodex-1.1-mini (relacion declarada: quantized) |
| Tamano del repositorio | 23,5 GB |
| Modalidad | texto unicamente; los tensores de vision se conservan, pero el servicio de imagen no esta cualificado |
| Decodificacion especulativa | MTP4 nativo con tensores BF16 retenidos del modelo original |
| Runtime requerido | Ciru (vLLM + ROCm) para gfx1151 |
| Hardware de referencia | AMD Ryzen AI Max+ 395 / Radeon 8060S, gfx1151, 128 GB de memoria unificada |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo subyacente ni los datos de entrenamiento, el numero de tokens, la composicion del dataset o si hubo fases de RLHF o DPO. Lo que si detalla es el trabajo de empaquetado y servicio: un checkpoint cuantizado a cuatro bits sobre `apodex/Apodex-1.1-mini`, servido con una pila vLLM/ROCm especifica para gfx1151, con parsers estrictos de herramientas y razonamiento basados en adaptadores `qwen3_xml` y `qwen3`. La presencia de "estado recurrente" junto a la cache KV en la tabla de precisiones sugiere una arquitectura hibrida, aunque el documento no la especifica y no conviene asumirlo.

El elemento tecnico mas destacable es la decodificacion especulativa nativa MTP4: en lugar de recurrir a un modelo borrador externo, reutiliza los tensores MTP BF16 retenidos del modelo original. Sobre esa base, el autor documenta cuatro reparaciones incluidas en el runtime: una guarda de fase de grafo que evita que lotes de prefill reutilicen grafos de decodificacion especulativa con metadatos de estado recurrente incompatibles (en la prueba causal, sin la guarda se modificaban 1.105.793 valores de cache y se producian 1.919 valores no finitos; con ella, ambos recuentos fueron cero); una reparacion de slots MTP que paso de 0/51 a 51/51 observaciones correctas de slot; contratos estrictos de herramientas que devuelven HTTP 400 ante completions invalidas y terminan los streams con error en lugar de dar por buena una llamada; y una fase final de refinado del parser que supero seis comprobaciones de replay ASGI y tres replays de cliente Pi.

## Capacidades

- Generacion de texto y razonamiento con modo pensamiento activado por defecto segun la plantilla original.
- Codigo: resolucion de tareas de programacion y explicacion de complejidad, con soporte para fragmentos largos dentro de la ventana de 262.144 tokens.
- Matematicas y problemas de varios pasos, apoyandose en el modo pensamiento.
- Tool calling y function calling a traves de una API compatible con OpenAI, con parsers estrictos de esquema que rechazan framing ambiguo.
- Uso agentico multi-paso: la card describe explicitamente llamadas a herramientas concurrentes en streaming y conversaciones con resultados de herramientas devueltos al modelo.
- Servicio concurrente: hasta ocho secuencias activas simultaneas, con encolado del exceso de peticiones.
- Cache de prefijos habilitada con intervalo de retencion de 1.120 tokens, pensada para historiales de trabajo largos y repetitivos.
- Capacidades multilingues: no disponibles.
- Vision: no cualificada en esta version, aunque los tensores se conservan del modelo fuente.
- No incorpora navegador, sistema de archivos ni implementacion de harness: el propio autor advierte de que el runner no puede aportarlos.

## Casos de uso

- Asistente de programacion local: con 262.144 tokens por peticion puede mantener abiertos ficheros, historiales de parches y documentacion extensa sin trocear el contexto, y su modo pensamiento ayuda en tareas de depuracion de varios pasos.
- Orquestacion de varios agentes en una sola maquina: ocho secuencias activas con encolado permiten ejecutar un enjambre de agentes especializados sobre el mismo APU sin repartir peticiones entre varios servidores.
- Automatizacion con tool calling en pipelines internos: la API compatible con OpenAI en `http://127.0.0.1:8081/v1` con modelo `main` permite sustituir un endpoint remoto por inferencia local en herramientas que ya hablan ese protocolo.
- Analisis de repositorios o documentacion larga: la cache de prefijos con retencion de 1.120 tokens reduce el coste de reprocesar un mismo contexto base en consultas sucesivas sobre el mismo material.
- Razonamiento matematico y resolucion de problemas tecnicos: el modo pensamiento habilitado por defecto y el limite de servidor de 32.768 tokens de salida dan espacio a cadenas de razonamiento largas antes de la respuesta final.
- Servicio interno de generacion de texto sin autenticacion para redes aisladas: el lanzador admite `--host` y `--port`, de modo que puede restringirse a localhost o exponerse solo en una red de laboratorio.
- Investigacion sobre inferencia local en silicio AMD: el paquete documenta reparaciones de corrupcion de cache especificas de gfx1151, lo que lo convierte en material de referencia para quien trabaje con ROCm y memoria unificada.
- Laboratorio de agentes con presupuestos de memoria variables: los parametros `--context`, `--cache-gib` y `--max-seqs` permiten degradar el perfil cualificado para experimentar con configuraciones mas ajustadas.

## Benchmarks y rendimiento

Los unicos datos publicados son diagnosticos seleccionados sobre un conjunto de 22 preguntas, ejecutados con ocho peticiones activas en el pico y sin errores de inferencia ni respuestas truncadas. El propio autor advierte de que no son estimaciones de exactitud sobre suites completas.

| Prueba | Resultado | Nota |
|---|---|---|
| IFEval (estricto) | 7/8 | diagnostico retenido, no suite completa |
| GSM8K | 8/8 | diagnostico retenido, no suite completa |
| HumanEval | 6/6 | diagnostico retenido, no suite completa |
| Llamadas a herramienta concurrentes en streaming | 8/8 validas | comprobacion del paquete portable |
| Comprobacion de texto exacto | 4/8 | cuatro llamadas omitieron el salto de linea final solicitado |
| Observacion correcta de slot en MTP | 51/51 | tras la reparacion; antes, 0/51 |
| Pruebas causales del grafo compartido | 0 valores de cache alterados y 0 valores no finitos | sin la guarda: 1.105.793 valores alterados y 1.919 no finitos |

No se han publicado resultados de MMLU, MT-Bench ni otras suites generales en la informacion disponible. Tampoco se ofrecen cifras de latencia o throughput.

## Requisitos de hardware

- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151) y 128 GB de memoria unificada. Es la plataforma sobre la que se midio el perfil por defecto.
- Peso del checkpoint: 23,5 GB en el repositorio, correspondientes a los pesos cuantizados a cuatro bits.
- Reserva de estado: 44 GiB compartidos entre cache KV (BF16) y estado recurrente (FP32). El autor insiste en que la reserva es compartida y que las ocho peticiones no reciben 44 GiB cada una, ni se garantiza que ocho historiales completos de 256K quepan a la vez.
- GPU de consumo: no se documenta un perfil validado para RTX 4090 u otras GPU discretas. El paquete esta construido para gfx1151, de modo que no puede darse por sentado que funcione en otras plataformas.
- Ajuste de memoria: el lanzador admite `--context`, `--cache-gib` y `--max-seqs`, lo que permite reducir contexto o secuencias para encajar en presupuestos menores, a costa de abandonar el perfil cualificado.
- Opciones de despliegue: exclusivamente el runtime suministrado. El propio autor indica que vLLM estandar, Transformers y llama.cpp no pueden servir este formato empaquetado. No hay soporte declarado para Ollama ni TGI.
- Procedimiento: descarga con `hf download`, instalacion con `runtime/INSTALL-APODEX-RUNTIME.sh` y arranque con `bundle/serve.sh --host 127.0.0.1 --port 8081`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la misma categoria (checkpoints agenticos cuantizados listos para servir sobre APU AMD integrado). La comparacion mas directa es con el modelo base del que deriva.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apodex1.1 mini Ciru Halo Agent (este) | no disponible | 262.144 tokens | 4 bits, formato empaquetado propio | Apache 2.0 | Runtime Ciru obligatorio, solo gfx1151 cualificado |
| apodex/Apodex-1.1-mini (base) | no disponible | no disponible | no disponible | no disponible | Repositorio HuggingFace del autor original |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia total del runtime: el formato empaquetado no lo sirven vLLM estandar, Transformers ni llama.cpp. Migrar a otra pila exige reconvertir el checkpoint a partir del modelo base.
- Plataforma cerrada: el unico hardware cualificado es gfx1151 con ROCm. No hay datos de funcionamiento en NVIDIA ni en otras GPU AMD.
- Texto unicamente: aunque los tensores de vision se conservan del modelo fuente, el servicio de imagen no esta cualificado en esta version.
- Memoria compartida: la reserva de 44 GiB es un pool comun. Ocho peticiones activas no equivalen a ocho contextos completos de 256K, y el autor recomienda reservar espacio de salida y compactar o recortar historiales antes de alcanzar el limite.
- Espacios en blanco en los limites de parametros: el codec XML nativo de Qwen interpreta un salto de linea inicial o final como marcado, por lo que no se garantiza coincidencia byte a byte en los bordes. En la comprobacion de texto exacto solo 4 de 8 llamadas coincidieron.
- Benchmarks no concluyentes: las cifras de IFEval, GSM8K y HumanEval proceden de 22 preguntas seleccionadas, no de suites completas, y no deben extrapolarse a un perfil de calidad general.
- Superficie de seguridad: el servidor no anade autenticacion. El lanzador por defecto escucha en 0.0.0.0, por lo que conviene fijar `--host 127.0.0.1` o aislar la red.
- Gestion de llamadas a herramientas: una llamada en streaming solo debe ejecutarse cuando se acumulan los fragmentos de argumentos y se confirma una finalizacion correcta. Un error de parser, un timeout o una parada por longitud no constituyen una llamada completada, y el runner no aporta navegador ni sistema de archivos.
- Sesgos y alucinacion: la model card no documenta evaluaciones de sesgo ni tasas de alucinacion, ni para este paquete ni para el modelo base.
- Idiomas: no se declara cobertura multilingue. No hay garantia de comportamiento fuera del idioma o idiomas del modelo fuente.
- Uso comercial: la licencia Apache 2.0 lo permite, pero las restricciones reales provienen del runtime y del modelo base, cuyas condiciones deben verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jcbtc/Apodex1.1-mini-Ciru-Halo-Agent-vllm-strix-halo
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Ficheros citados en la model card y no enlazados publicamente de forma verificable: `INSTALL.md`, `bundle/serve.sh`, `bundle/generation-defaults.json`, `runtime/INSTALL-APODEX-RUNTIME.sh`, `PACKAGE-CHECK.json`
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a consultas de soporte tecnico sin relacion.
