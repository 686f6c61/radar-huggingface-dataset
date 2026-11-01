# c777777/MiniMax-M3.1-Flash-EXL3-2.15bpw-TP2-DGX-Spark

## Resumen

MiniMax-M3.1-Flash-EXL3-2.15bpw-TP2-DGX-Spark no es un modelo de pesos, sino una receta de despliegue publicada por el usuario c777777 para servir el modelo MiniMax-M3.1-Flash de MiniMaxAI en configuracion de tensor parallelism (TP=2) sobre dos estaciones NVIDIA DGX Spark (GB10) unidas por un cable QSFP. El repositorio empaqueta el script de control, las fuentes del motor fijadas por commit, dos series de parches, los perfiles de servicio y un arnes de benchmarks; los pesos se descargan aparte desde el pack EXL3 SAGE de 2.15 bits por peso de vcruz305, fijado a la revision 99bf3a57 y verificado con un manifiesto sha256 de 40 ficheros.

La relevancia practica esta en que demuestra el despliegue de un MoE de gran tamano (57 capas MoE con 128 expertos y routing top-4) en hardware de escritorio de gama alta, cuantizado a 2.15 bpw con EXL3 (trellis, cuantizacion por experto) y con decodificacion especulativa DSpark de 5 capas. El pack completo ocupa 110,81 GiB y cada rango sostiene unos 55 GiB, con 58,9 GiB de memoria GPU por rango reportados por vLLM.

La receta fija toda la cadena de suministro: imagen base de Docker Hub, commit de exllamav3 y de vllm-exl3, parches y pesos, con comprobaciones fail-closed. El endpoint resultante es un servidor vLLM compatible con la API de OpenAI, lo que permite integrarlo en herramientas existentes sin adaptadores propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base MiniMax-M3.1-Flash); 57 capas MoE con 128 expertos y routing top-4; atencion dispersa con indexador MXFP8 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (routing top-4 sobre 128 expertos) |
| Longitud de contexto | 300K tokens (perfil `q4-300k` de la receta) |
| Tipos de cuantizacion | EXL3 2.15 bpw (trellis, por experto) en expertos y 421 modulos lineales; MXFP8 en el indexador de atencion dispersa; bf16 en embeddings (2,29 GiB) |
| Idiomas soportados | no disponible |
| Licencia | other: apache-2.0-and-agpl-3.0-only-and-mit (ver NOTICE del repositorio) |
| Formato de pesos | EXL3 (pack de vcruz305); el repositorio de la receta no contiene pesos |
| Tamano del pack | 110,81 GiB en 40 ficheros (118.985.525.140 bytes) |
| Snapshot por rango | 55,1 GiB en disco |
| Memoria GPU por rango | 58,9 GiB reportados por vLLM |
| Decodificador especulativo | DSpark, 5 capas, k=3 |
| Hardware objetivo | 2 x NVIDIA DGX Spark (GB10) con enlace QSFP |
| Servidor | vLLM con API compatible OpenAI |

## Arquitectura y entrenamiento

La receta sirve el modelo MiniMax-M3.1-Flash, un transformer con mezcla de expertos: 57 capas MoE con 128 expertos cada una y routing top-4. La cuantizacion EXL3 se aplica en formato trellis con granularidad por experto a los expertos enrutados y a los 421 modulos lineales restantes, mientras que el indexador de atencion dispersa se mantiene en MXFP8 fusionado dentro del QKV EXL3 y los embeddings en bf16. El pack incluye un `config.json` completo, por lo que no requiere overlay de cuantizacion adicional.

El repositorio no documenta los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, si hubo RLHF o DPO), dato que corresponde a la model card de MiniMaxAI/MiniMax-M3.1-Flash y que no esta incluido en la informacion proporcionada. La innovacion tecnica de esta receta es el reparto del pack en dos rangos con tensor parallelism sobre un enlace QSFP, la decodificacion especulativa DSpark con k=3 y el uso de chunks de prefill de 16K tokens, ademas de un snapshot de pesos por rango que reduce el arranque en caliente de unos 4 minutos a unos 100 segundos.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno con ventana de 300K tokens.
- Servicio mediante API compatible con OpenAI (`/v1/models`, endpoints de chat y completions), lo que facilita la integracion con clientes existentes.
- Decodificacion especulativa DSpark con k=3, que acelera la generacion cuando el borrador se acepta (34,7 tok/s en codigo frente a 26,9 tok/s en prosa a un solo stream).
- Atencion dispersa con indexador MXFP8, disenada para sostener contextos largos con coste reducido.
- Soporte de multiples streams concurrentes (perfil con 6 streams y cache KV en q4).
- Capacidades de tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios y documentos extensos: con 300K tokens de contexto y chunks de prefill de 16K, el modelo puede procesar arboles de codigo o contratos completos en una sola sesion sin trocear el material en peticiones independientes.
- Asistencia de programacion en local: la receta reporta 34,7 tok/s en generacion de codigo a un stream sobre dos DGX Spark, un ritmo suficiente para autocompletado interactivo y revision de parches en un entorno sin dependencia de la nube.
- Despliegue de agentes con multiples pasos: los 6 streams concurrentes del perfil `q4-300k` permiten atender varias sesiones de agente en paralelo (planificacion, ejecucion de herramientas y sintesis) con una sola instancia.
- Procesamiento por lotes de documentacion tecnica: el prefill de 1.561 tok/s en prompts de 8K y 16K hace viable clasificar, resumir o extraer entidades de lotes grandes de informes en un equipo de sobremesa.
- Laboratorio de evaluacion de cuantizaciones: el arnes de benchmarks y el chequeo de NLL frente a referencia (1,4% de deriva, 3 de 3 needles en 16K) permiten medir el impacto de la cuantizacion a 2.15 bpw antes de adoptarla en produccion.
- Entorno de desarrollo aislado y reproducible: la fijacion por commit, sha256 y manifiesto de pesos permite reconstruir exactamente el mismo stack en otra pareja de nodos, util para auditorias o para replicar resultados entre equipos.
- Servicio interno de chat sobre documentacion corporativa: el endpoint compatible con OpenAI se conecta a interfaces existentes sin escribir un adaptador, con el modelo alojado en hardware propio.

## Benchmarks y rendimiento

Mediciones de la receta con el perfil `q4-300k` (300K de contexto, 6 streams, cache KV en q4, DSpark k=3, prefill de 16K) sobre dos parejas independientes de DGX Spark. No son un record publicado en `bench/records/`.

| Metrica | Resultado | Pareja A | Pareja B |
|---|---|---|---|
| Prefill, media de prompts de 8K y 16K (tok/s) | 1.561 | 1.565 | 1.557 |
| Decode, 1 stream (tok/s) | 30,8 | 30,7 | 31,0 |
| Decode, 4 streams totales (tok/s) | 66,4 | 67,6 | 65,2 |
| Arranque hasta listo | 104 s | 100 s | 108 s |
| Deriva de NLL frente a referencia / needles en 16K | 1,4% / 3 de 3 | | |

Desglose por tipo de texto a un stream: codigo 34,7 tok/s, prosa 26,9 tok/s. La velocidad de decodificacion depende de la tasa de aceptacion del borrador especulativo. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Dos nodos NVIDIA DGX Spark (GB10) unidos por un cable QSFP; la receta asume exactamente esta topologia con TP=2.
- Memoria GPU: 58,9 GiB por rango una vez cargado el modelo; snapshot de pesos de 55,1 GiB por nodo en disco.
- Almacenamiento: 110,8 GiB para el pack completo, mas 56 GiB de snapshot por nodo; el build necesita unos 60 GiB de `MemAvailable` en el rango 0.
- Tiempo de build: 7-20 minutos en el rango 0; primer arranque de unos 4 minutos (carga y escritura del snapshot); arranques posteriores de unos 100 s.
- Despliegue: imagen `vllm/vllm-openai:minimax-m31-flash` fijada por digest, con exllamav3 y vllm-exl3 compilados desde fuentes vendorizadas; servidor vLLM compatible con OpenAI.
- No cabe en GPU de consumo convencional (RTX 4090, 24 GB) por el tamano del pack; la receta esta disenada para DGX Spark.
- Latencia y throughput estimados: los de la tabla de benchmarks (30,8 tok/s a un stream, 66,4 tok/s a cuatro streams, prefill de 1.561 tok/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash via esta receta | no disponible (MoE 57x128, top-4) | 300K | EXL3 2.15 bpw + MXFP8 | apache-2.0 + agpl-3.0-only + mit | 2 x DGX Spark (GB10) |
| MiniMax-M3.1-Flash (modelo base, MiniMaxAI) | no disponible | no disponible | bf16 original | no disponible | no disponible |
| Pack EXL3 SAGE 2.15 bpw de vcruz305 | identico al base | no disponible | EXL3 2.15 bpw | no disponible | no disponible |
| Alternativas de otro fabricante | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas de otros fabricantes, por lo que no es posible una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es una receta. Sin acceso al pack de vcruz305 y a la imagen base en Docker Hub, el despliegue no se puede reproducir.
- Dependencia critica de la imagen base: si el digest `sha256:86f582da…` desaparece de Docker Hub, el build se detiene.
- La cuantizacion a 2.15 bpw introduce una deriva de NLL del 1,4% frente a la referencia; es un compromiso medido, no una equivalencia con el modelo en bf16.
- La velocidad de decodificacion depende de la tasa de aceptacion del borrador especulativo y varia con el tipo de texto (34,7 frente a 26,9 tok/s).
- La topologia esta fijada a dos DGX Spark con QSFP; no se documentan configuraciones alternativas (un solo nodo, otras GPU o mas rangos).
- La licencia es una combinacion de Apache 2.0, AGPL 3.0-only y MIT, con el detalle en el fichero NOTICE; es imprescindible revisarlo antes de un uso comercial, especialmente por la clausula AGPL.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni capacidades de tool calling del modelo base en la documentacion proporcionada.
- El estado del repositorio (0 descargas, 0 likes, creado el 2026-10-27) indica que no cuenta con validacion de la comunidad; conviene tratar los numeros como resultados del autor y reproducirlos con `./m31.sh probe` antes de confiar en ellos.

## Enlaces

- Repositorio de la receta: https://huggingface.co/c777777/MiniMax-M3.1-Flash-EXL3-2.15bpw-TP2-DGX-Spark
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Pack de pesos EXL3 SAGE 2.15 bpw: https://huggingface.co/vcruz305/MiniMax-M3.1-Flash-EXL3-SAGE-2.15bpw
- Fichero NOTICE de licencias: https://huggingface.co/c777777/MiniMax-M3.1-Flash-EXL3-2.15bpw-TP2-DGX-Spark/blob/main/NOTICE
- Documento de rendimiento: https://huggingface.co/c777777/MiniMax-M3.1-Flash-EXL3-2.15bpw-TP2-DGX-Spark/blob/main/PERFORMANCE.md
- exllamav3 (fork de vcruz305 sobre turboderp-org/exllamav3): no disponible como URL en la informacion proporcionada
- vllm-exl3 (vcruz305): no disponible como URL en la informacion proporcionada
