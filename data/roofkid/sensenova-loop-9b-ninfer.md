# roofkid/SenseNova-Loop-9B-NInfer

## Resumen

SenseNova-Loop-9B-NInfer es un artefacto de inferencia cuantizado en 4 bits del modelo multimodal SenseNova-Loop-9B, empaquetado en el formato propietario `.ninfer` para el motor NInfer. Lo publica el usuario `roofkid` como objetivo de despliegue validado sobre una unica GPU consumer RTX 4080 (arquitectura `sm_89`, 16 GiB de VRAM). No es un modelo nuevo ni un fine-tune: es una recodificacion del checkpoint AWQ oficial de SenseNova en los formatos registrados de NInfer, con pesos de texto en Q4/Q5/Q6, routers mHC y escalares de control GDN en FP32, normas y convoluciones en BF16, matrices MTP en W8 y torre de vision con roles Qwen Q4/Q5/Q6/W8.

El modelo base es un transformer de 9B parametros con una innovacion estructural denominada "loop": el grafo recorre las capas fisicas 4 a 27 dos veces, compartiendo pesos pero aislando por slot de ejecucion los planos KV, el estado GDN, los registros ReplaySSM, los checkpoints y el estado del grafo. Segun la model card, el artefacto tiene 32 capas fisicas y 56 slots de ejecucion, 4096 de dimension oculta, atencion 16/4/256, 32 cabezas GDN y contexto nativo de 524288 tokens, de los cuales 262144 estan validados con KV en int8.

La relevancia practica es doble: por un lado demuestra que un modelo multimodal de 9B con contexto de 256K puede servirse en 16 GiB de VRAM con cuantizacion agresiva y decodificacion especulativa (MTP3 + n-gram); por otro, el propio autor advierte que las metricas medidas quedan por debajo de los objetivos de rendimiento de su plan de implementacion, por lo que debe tratarse como un objetivo funcional validado, no como una promesa de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle de capas (loop), atencion 16/4/256, 32 cabezas GDN, routers mHC |
| Parametros totales | 9B (modelo base SenseNova-Loop-9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 524288 nativo; 262144 validados con KV int8 |
| Tipos de cuantizacion | 4-bit groupwise-int (Q4/Q5/Q6 texto, W8 MTP y vision, FP32 routers, BF16 normas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (checkpoint base gated en Hugging Face) |
| Formato de pesos | `.ninfer` (artefacto de 6.248.091.904 bytes, SHA-256 `e793869f...67e0`) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea un diseno de bucle: 32 capas fisicas que se ejecutan en 56 slots, de modo que las capas fisicas 4 a 27 se visitan dos veces. Los pesos se comparten entre visitas, pero el estado de inferencia (planos KV, estado GDN, registros ReplaySSM, checkpoints y estado del grafo) se aisla por slot de ejecucion. Cada capa fisica aplica dos routers FP32 de dos flujos (mHC) en ambas visitas, y YaRN se aplica en cada posicion. La torre de vision usa un merger de 4096 de ancho con roles Qwen Q4/Q5/Q6/W8.

El artefacto NInfer se obtiene del release AWQ 4-bit oficial (revision `8327226ffd2e33e34cb5466a0e6cccd4419bde40`): se desquantizan las matrices GEMM AWQ y el embedding cuantizado row-major, se retienen los pesos RMSNorm ajustados por AWQ y se recodifica todo en los formatos registrados de NInfer. La especulacion usa MTP3 mas cadena n-gram, sin cabeza de propuesta optimizada ni DFlash2. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multimodal: entrada image-text-to-text, con soporte de imagenes y texto; el video no esta soportado.
- Contexto largo: hasta 262144 tokens validados con KV int8, lo que habilita tareas de documento completo, repositorios de codigo o conversaciones muy extensas.
- Decodificacion especulativa: MTP3 con cadena n-gram, que eleva la decodificacion de ~36 tok/s (MTP0) a ~58 tok/s (MTP3+n-gram) en la RTX 4080.
- Servicio HTTP: el binario `ninfer-serve` expone un endpoint con opciones de contexto, concurrencia, chunk de prefill, dtype de KV y API key.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos en una sola GPU consumer: con 262144 tokens de contexto validados, el modelo puede ingerir contratos, informes o libros completos y responder preguntas sobre ellos sin fragmentacion, lo que reduce la perdida de contexto entre trozos.
- Procesamiento de imagenes con texto asociado: al ser image-text-to-text, sirve para extraer informacion estructurada de capturas, diagramas o documentos escaneados combinados con instrucciones textuales largas.
- Despliegue en estaciones de trabajo con RTX 4080: el perfil de lanzamiento validado (256K + Vision + MTP3) arranca con unos 0.35 GiB libres tras el inicio, lo que permite montar un servicio local de inferencia multimodal sin GPU de datacenter.
- Prototipado e investigacion de arquitecturas con bucle de capas: el artefacto permite estudiar el comportamiento de un modelo que reutiliza pesos en dos visitas y evaluar el impacto en calidad (perplejidad 8.55 en corpus rapido con KV int8) frente a artefactos BF16 (9.15).
- Evaluacion comparativa de cuantizacion: util para medir la degradacion de un esquema 4-bit groupwise-int frente al AWQ original y frente a referencias BF16 en CPU, con comparaciones de MBPP sin regresion reportada por el mantenedor.
- Servicio local con API HTTP y control de acceso: `ninfer-serve` permite fijar puerto, bind, API key y dtype de KV, adecuado para entornos de laboratorio o demos internas donde se quiere limitar el acceso al puerto host-local.
- Prefill de contextos muy largos en produccion interna: el prefill medido de 1.72k tok/s a 253K tokens y 2.62k tok/s a 3.5K tokens permite estimar tiempos de primera respuesta para cargas de documentos grandes en una sola tarjeta.

## Benchmarks y rendimiento

| Metrica | Resultado medido en RTX 4080 |
|---|---|
| Prefill 253K tokens | 1.72k tok/s |
| Prefill 3.5K tokens | 2.62k tok/s |
| Decodificacion 3.5K, MTP0 | ~36 tok/s |
| Decodificacion 3.5K, MTP3 + n-gram | ~58 tok/s |
| Perplejidad corpus rapido (KV int8) | 8.55 |
| Perplejidad corpus rapido (artefacto BF16 previo) | 9.15 |
| VRAM libre al arrancar 256K texto + KV int8 | 1.68 GiB |
| VRAM libre al arrancar 256K + Vision | 1.27 GiB |
| VRAM libre al arrancar 256K + Vision + MTP3 | ~0.35 GiB |
| MBPP | Sin regresion frente al artefacto previo (segun el mantenedor) |

Los objetivos del plan de implementacion (80/55 MTP0, 180/120 MTP3, 4k/2k prefill) no se alcanzan con este artefacto. El autor lo publica como objetivo funcional con resultados medidos, no como reclamacion de rendimiento.

## Requisitos de hardware

- VRAM: el artefacto ocupa 6.248.091.904 bytes (~5.82 GiB) en disco; en ejecucion con 256K de contexto y KV int8 quedan 1.68 GiB libres, y con vision y MTP3 el margen baja a ~0.35 GiB sobre 16 GiB.
- GPU objetivo: RTX 4080 (`sm_89`, 16 GiB). No se documenta soporte para otras GPU en la informacion proporcionada.
- Inferencia BF16 end-to-end: no es posible en la tarjeta de 16 GiB; la correccion se cualifica con referencias BF16 en CPU, oraculos de operadores y comparacion con el checkpoint AWQ.
- Despliegue: motor NInfer mediante `ninfer-serve` dentro de la imagen Docker `roofkid/ninfer-4080:sensenova` (alias de `0.6.3-rtx4080`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Lanzadores: `scripts/download-sensenova-loop-9b.sh` y `scripts/run-sensenova-loop-9b.sh` (equivalentes `.bat` en Windows), que montan el artefacto en `/models` en modo solo lectura.
- Variables de entorno: `NINFER_IMAGE`, `NINFER_ARTIFACT`, `NINFER_PORT` (8080), `NINFER_BIND` (0.0.0.0), `NINFER_API_KEY`, `NINFER_KV_DTYPE` (int8 por defecto; `rk4v4-e8` como modo de respaldo/depuracion), `NINFER_BUILD=1` para forzar reconstruccion.
- Concurrencia: `--max-concurrency 1` y `--max-pending-requests 16` en el perfil validado; `--host-kv-mib 4096` y `--prefill-chunk 1024`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-NInfer | 9B | 262144 validados (524288 nativo) | `.ninfer` 4-bit groupwise-int | Apache-2.0 | Hugging Face, motor NInfer |
| SenseNova-Loop-9B (base) | 9B | 524288 nativo | BF16 (gated) | Apache-2.0 | Hugging Face, gated |
| SenseNova-Loop-9B-AWQ | 9B | no disponible | AWQ 4-bit | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y formato de distribucion.

## Limitaciones y advertencias

- Rendimiento por debajo de objetivos: el autor declara explicitamente que las metas del plan (80/55 MTP0, 180/120 MTP3, 4k/2k prefill) no se cumplen; no debe citarse como referencia de throughput.
- Un solo perfil validado: las mediciones corresponden a una RTX 4080 de 16 GiB; no hay datos de otras GPU ni de despliegues multi-GPU.
- Margen de VRAM muy ajustado: el perfil 256K + Vision + MTP3 arranca con ~0.35 GiB libres, lo que deja poco espacio para picos o cargas adicionales.
- Sin BF16 end-to-end: la validacion de correccion depende de referencias en CPU y oraculos, no de una ejecucion BF16 completa en GPU.
- Formato propietario: el artefacto solo es utilizable con el motor NInfer; no hay pesos en safetensors ni GGUF en este repositorio.
- Video no soportado: la modalidad se limita a texto e imagen.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica ni calidad por idioma.
- Tool calling, agentes y modo thinking: no documentados en la informacion disponible.
- Sesgos y alucinacion: no hay informacion especifica en la model card; aplican los riesgos habituales de un modelo generativo multimodal.
- Licencia: Apache-2.0 para el artefacto y la model card, pero el checkpoint base esta gated en Hugging Face, lo que puede condicionar la reproducibilidad del pipeline de conversion.
- Verificacion de integridad: conviene comprobar el SHA-256 del artefacto con el comando `sha256sum --check` documentado antes de servirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roofkid/SenseNova-Loop-9B-NInfer
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Modelo base AWQ: https://huggingface.co/sensenova/SenseNova-Loop-9B-AWQ
- Semantica del modelo (documentacion del mantenedor): https://github.com/roofkid/ninfer-4080/blob/rtx4080-port/docs/maintainer/sensenova-loop-9b-model.md
- Contratos del artefacto: https://github.com/roofkid/ninfer-4080/blob/rtx4080-port/docs/maintainer/sensenova-loop-9b-artifact.md
- Repositorio del motor NInfer: https://github.com/roofkid/ninfer-4080
- Imagen Docker: `roofkid/ninfer-4080:sensenova` en Docker Hub
