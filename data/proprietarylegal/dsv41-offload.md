# ProprietaryLegal/dsv41-offload

## Resumen

DSV41 offload es el codigo de despliegue completo, publicado por PLI Labs (la rama de investigacion abierta de Proprietary Legal Intelligence), para servir DeepSeek-V4.1-Flash en dos nodos DGX Spark (GB10) con un host x86 provisto de dos RTX 3090 como plano de descarga. No se trata de un modelo de pesos en si, sino de una instantanea de codigo del arbol privado `offload-x86host` en el commit `27d3ca2b78b1` (27 de octubre de 2026), orientada a reproducir una pila de inferencia tensor-parallel de dos rangos con decodificacion especulativa remota.

La pieza tecnica central es el traslado del drafter DSpark a dos RTX 3090 unidas por NVLink y comunicadas con los Spark mediante RDMA, junto con las tablas Engram servidas desde RAM del host x86, paginas KV empaquetadas (K1) y un arnes de medida acotado (ventanas HOLD, regla de decision WIN2) que el autor usa para calificar cada cambio antes de promoverlo. El repositorio incluye tambien el codigo de entrenamiento del drafter (D2), la politica de profundidad y el muestreo de borradores (PP4).

El interes actual es doble: por un lado documenta una via concreta para ejecutar un modelo de gran tamano en hardware de gama prosumer (dos GB10 mas dos RTX 3090) con cifras medidas de 57,5 tok/s en decodificacion de un solo flujo y 51,8 tok/s a 32K de contexto; por otro, expone sin adornos el estado de calidad del arbol (2.559 tests pasados, 714 fallidos o con error, 300 omitidos), lo que lo convierte en material de referencia para quien quiera auditar la viabilidad de este tipo de despliegue antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene el codigo de despliegue; el modelo servido es DeepSeek-V4.1-Flash, arquitectura no detallada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 327.680 tokens de peticion maxima (pool KV medido de 2.502.600 tokens) |
| Tipos de cuantizacion | EXL3 a 2,75 bpw (pesos publicados como `DeepSeek-V4.1-Flash-1017-EXL3-2.75bpw-LegalWeighted-DGX-Spark`); expertos del drafter en EXL3 K2 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible para este repositorio (es codigo); los pesos asociados se distribuyen en EXL3 a 2,75 bpw |
| Hardware objetivo | 2 x DGX Spark (GB10) en TP2 + host x86 con 2 x RTX 3090 (NVLink) y RDMA |
| Runtime | vLLM (imagen de serving propia, rangos 0 y 1) |
| Decodificacion especulativa | DSpark remoto sobre RTX 3090, con reparto de aceptacion DP-2 |
| Transporte | RDMA RC y TCP (`ofl`) para peticion-respuesta entre Spark y host x86 |
| Fecha del snapshot | 2026-10-27 (commit `27d3ca2b78b1`) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna de DeepSeek-V4.1-Flash; lo que documenta es la topologia de servicio. El modelo se reparte en tensor-parallel de dos rangos sobre dos nodos DGX Spark (GB10), con el rango 0 actuando como cabeza y el rango 1 como trabajador. El drafter especulativo DSpark se ejecuta fuera del nodo de serving, en un host x86 con dos RTX 3090 conectadas por NVLink y comunicadas con los Spark por RDMA; sus expertos se cuantizan en EXL3 K2 y se apoyan en CUDA graphs y TP2 sobre NVLink. Las tablas Engram residen en RAM del host x86 y se sirven por el transporte `ofl` con verificacion byte-exacta.

El arbol incluye tambien componentes de formacion del drafter (herramienta D2), politica de profundidad de especulacion, muestreo de borradores (PP4) y el reparto de aceptacion DP-2, que contabiliza los tokens aceptados por ronda segun prompt, presupuesto de tokens, segmento, lote y ventana. La capa de medida (`offload/launch/`) implementa ventanas acotadas con admision HOLD, comandos remotos con alcance limitado, restauracion estilo W8 y la regla de decision WIN2 (celdas emparejadas con semilla, arranque de humo, tope de dos ventanas, filtro de resolucion y puerta distribucional). No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO sobre el modelo base.

## Capacidades

- Serving tensor-parallel de DeepSeek-V4.1-Flash en dos nodos GB10 con un unico punto de entrada (rango 0 cabeza, rango 1 trabajador).
- Decodificacion especulativa remota: el drafter DSpark se ejecuta en las RTX 3090 y envia borradores al nodo de serving por RDMA, con ganancia medida de 56,0 frente a 41,9 tok/s en prompt corto y 64,6 frente a 41,0 tok/s a 32K.
- Reparto de aceptacion DP-2: contabiliza tokens aceptados por ronda con desglose por prompt, presupuesto, segmento, lote y ventana, con reconciliacion de metricas.
- Cache KV empaquetada en paginas (K1): pool de 2.502.600 tokens, un 62 % mas que sin empaquetar, con peticion maxima de 327.680 tokens.
- Prefix KV store por niveles, incluido el nivel de asunto MC1 en la rama `lane/matter-cache`.
- Tablas Engram servidas desde RAM del host x86 sobre RDMA, con verificacion byte-exacta y reduccion medida del tiempo hasta el primer token de entre 5,4 a 5,7 %.
- Ajuste de presupuesto de memoria en firmware del rango 0: reserva de pantalla reducida de 2 GB a 512 MiB, con 1.532 MiB adicionales utilizables.
- Arnes de medida acotado con ventanas HOLD, comandos remotos con alcance, restauracion W8 y regla de decision WIN2.
- Paquetes de promocion con rollback exacto y auditorias de numerica y RNG.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling ni modo de razonamiento del modelo servido.

## Casos de uso

- Despliegue de un modelo de gran tamano en hardware de gama prosumer: la pila permite servir DeepSeek-V4.1-Flash con dos DGX Spark y dos RTX 3090, alcanzando 57,5 tok/s en decodificacion de un solo flujo con prompt corto; util para equipos que no pueden acceder a nodos H100 o GB200.
- Analisis documental juridico de contexto largo: con 327.680 tokens de peticion maxima y un pool KV de 2,5 millones de tokens, el sistema admite contratos, expedientes y transcripciones extensas en una sola ventana, lo que encaja con el enfoque de PLI en producto de trabajo legal.
- Serving multiusuario moderado: con 3 y 4 usuarios concurrentes a 32K de contexto se miden 30,2 y 24,8 tok/s por peticion, cifras suficientes para un equipo pequeno de revision o asistencia interna.
- Evaluacion de decodificacion especulativa en produccion: el repositorio incluye el drafter, su entrenamiento (D2), la politica de profundidad y el reparto DP-2, de modo que un equipo puede reproducir la ganancia de especulacion (56,0 frente a 41,9 tok/s) y ajustarla a su propia carga.
- Investigacion sobre offload de memoria: las tablas Engram en RAM x86 sobre RDMA y las paginas KV empaquetadas sirven como base para estudiar tecnicas de descarga de estado fuera del nodo de computo con verificacion byte-exacta.
- Auditoria de pilas de inferencia: el arnes de ventanas HOLD, la regla WIN2 y los paquetes de promocion con rollback permiten calificar cambios de configuracion con criterios reproducibles antes de llevarlos a produccion.
- Referencia para ingenieria de rendimiento en GB10: los datos de prefill (unos 2.170 tok/s a 150K, con 69 s hasta el primer token) y de memoria de firmware permiten dimensionar despliegues similares y detectar cuellos de botella.

## Benchmarks y rendimiento

Datos medidos por el autor en su propio hardware (etiqueta MEASURED en la model card). No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion, un flujo, prompt corto | 57,5 tok/s | mediana de 38 ejecuciones |
| Decodificacion, un flujo, 32K | 51,8 tok/s | mediana de 38 ejecuciones |
| Decodificacion, un flujo, 150K | 51,7 tok/s | mediana de 14 ejecuciones |
| Decodificacion por peticion, 3 usuarios a 32K | 30,2 tok/s | concurrencia medida |
| Decodificacion por peticion, 4 usuarios a 32K | 24,8 tok/s | concurrencia medida |
| Prefill a 150K | ~2.170 tok/s | tiempo hasta el primer token ~69 s |
| Especulacion activada frente a desactivada, prompt corto | 56,0 frente a 41,9 tok/s | drafter DSpark remoto |
| Especulacion activada frente a desactivada, 32K | 64,6 frente a 41,0 tok/s | drafter DSpark remoto |
| Pool KV empaquetado (K1) | 2.502.600 tokens | +62 % frente a sin empaquetar |
| Engram remoto sobre RDMA | exacto a nivel de byte | -5,4 a -5,7 % en tiempo hasta el primer token |
| Reserva de firmware del rango 0 | 2 GB a 512 MiB | +1.532 MiB utilizables |
| Mejor decodificacion publica en dos Spark | 56,8 a 59,3 tok/s | dato UPSTREAM, no reproducido |

## Requisitos de hardware

- Dos nodos DGX Spark (GB10) en tensor-parallel de dos rangos, uno como cabeza y otro como trabajador.
- Un host x86 con dos RTX 3090 unidas por NVLink para el drafter DSpark, con expertos en EXL3 K2 y CUDA graphs.
- Interconexion RDMA entre los Spark y el host x86, ademas de TCP como alternativa para el transporte `ofl`.
- RAM suficiente en el host x86 para alojar las tablas Engram.
- VRAM por GPU no disponible en la informacion; el unico dato de memoria es la reserva de firmware del rango 0 reducida a 512 MiB, con 1.532 MiB recuperados.
- No cabe en una unica GPU de consumo: el diseno exige cuatro aceleradores repartidos en tres maquinas.
- Despliegue mediante vLLM sobre la imagen de serving propia, con `serve.sh`, `start.sh`, `stop.sh`, `dsv41.env` y `RUNBOOK.md`.
- Throughput y latencia estimados: los medidos en la tabla de benchmarks; no se aportan datos de latencia por token mas alla de los tok/s y del tiempo hasta el primer token a 150K.

## Comparativa con modelos similares

| Sistema | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DSV41 offload (esta ficha) | no disponible (modelo servido DeepSeek-V4.1-Flash) | 327.680 tokens de peticion; pool KV 2.502.600 | 57,5 tok/s un flujo; 51,8 tok/s a 32K | Apache 2.0 | Repositorio publico, pesos EXL3 2,75 bpw publicados |
| Mejor despliegue publico en dos Spark (dato UPSTREAM) | no disponible | no disponible | 56,8 a 59,3 tok/s en prosa | no disponible | no disponible |
| vLLM estandar sobre el mismo modelo | no disponible | no disponible | no disponible | Apache 2.0 | Publico |

No se dispone de datos de otros sistemas comparables en la informacion proporcionada; la unica referencia externa es la cifra UPSTREAM de decodificacion en dos Spark, que el autor situa en el mismo orden de magnitud que su resultado.

## Limitaciones y advertencias

- El repositorio es una instantanea de codigo, no un modelo listo para usar: requiere pesos aparte, hardware especifico y una imagen de serving concreta.
- Estado de tests del arbol: 2.559 pasados, 714 fallidos o con error y 300 omitidos en CPU sin red; de los fallos, 339 ya fallan en el commit privado de origen, 14 pasan en aislamiento, 353 necesitan datos en los hosts del autor y 8 dependen de un conjunto de prompts retenido o de un fichero fuera del limite de datos.
- El arbol publico es de un solo commit y carece de historial de git, estado de despliegue y hosts GPU, lo que limita la reproducibilidad completa.
- La licencia Apache 2.0 cubre el codigo, pero no se detallan en la informacion las condiciones de uso comercial de los pesos asociados ni del modelo base.
- No se documentan sesgos conocidos, tasas de alucinacion ni cobertura idiomatica del modelo servido.
- Las cifras de rendimiento son medidas en el hardware del autor y con su carga; no se han reproducido de forma independiente.
- La ganancia de especulacion depende del drafter remoto y de la red RDMA; sin ese plano, el rendimiento cae a los valores medidos con especulacion desactivada (41,9 tok/s en prompt corto).
- El coste de prefill a contextos muy largos es alto: unos 69 s hasta el primer token a 150K, lo que desaconseja su uso interactivo con prompts de ese tamano.
- No hay datos publicados de benchmarks de calidad, por lo que no puede compararse con alternativas en tareas de razonamiento, codigo o matematicas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ProprietaryLegal/dsv41-offload
- Coleccion en Hugging Face: https://huggingface.co/collections/ProprietaryLegal/deepseek-v41-flash-on-2x-dgx-spark-x86-offload-6adab604a517b426ded3916e
- Pesos EXL3 2,75 bpw: https://huggingface.co/ProprietaryLegal/DeepSeek-V4.1-Flash-1017-EXL3-2.75bpw-LegalWeighted-DGX-Spark
- Vision general de la pila: https://github.com/ProprietaryLegal/DeepSeek-V4.1-Flash-2xDGX-Spark-x86-offload
- Registro de progreso: https://github.com/ProprietaryLegal/deepseek-v41-flash-2x-dgx-spark-progress
- Hub de PLI Labs: https://github.com/ProprietaryLegal/pli-labs
- PLI Labs: https://proprietarylegal.ai/labs.html
- Proprietary Legal Intelligence: https://proprietarylegal.ai
