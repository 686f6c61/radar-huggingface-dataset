# Kovach-Enterprises/prophetcache-vattention-pap

## Resumen

ProphetCache es un artefacto tecnico publicado por Kovach Enterprises LLC (bajo la marca Genesis Conductor) que describe una jerarquia de optimizacion de memoria para inferencia de LLMs, culminando en un mecanismo denominado Predictive Asynchronous Paging (PAP). No se trata de un modelo de lenguaje con pesos entrenados, sino de una propuesta de infraestructura de atencion y gestion de la KV cache que se apoya en tres niveles: PagedAttention como base, vAttention como capa intermedia y ProphetCache como innovacion propia.

La idea central es reservar un flujo de co-procesador aislado (aproximadamente el 5% de las SMs de la GPU) que opera un paso por delante del motor de computo principal, combinando tablas de transicion de n-gramas episodicas con un vector semantico de dominio (codigo frente a prosa) para emitir un manifiesto de memoria y lanzar `cudaMemPrefetchAsync()` junto con mapeos VMM asincronos antes de que se ejecute el kernel de atencion.

El artefacto incluye un simulador reproducible (`prophetcache_sim.py`) con resultados de benchmark deterministas que reportan reducciones de la latencia media de espera de memoria (`mem_wait_ns`) del 77,52% frente a PagedAttention y del 70,79% frente a vAttention. La relevancia actual reside en la presion creciente sobre la KV cache en despliegues de contexto largo, aunque conviene subrayar que los datos publicados provienen de una simulacion, no de mediciones en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo de lenguaje; artefacto de infraestructura de inferencia (PagedAttention + vAttention + Predictive Asynchronous Paging sobre CUDA VMM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene `frameworks.jsonl`, `prophetcache_sim.py` y `CODEOWNERS`) |

## Arquitectura y entrenamiento

El artefacto no describe un transformer ni un modelo entrenado, sino una jerarquia de tres niveles de gestion de memoria para kernels de atencion. El nivel 1, PagedAttention, particiona la KV cache en bloques virtuales no contiguos de tamano fijo y reduce el desperdicio de memoria por debajo del 4%, a costa de kernels de atencion reescritos con indireccion de tabla de bloques por software. El nivel 2, vAttention, desacopla el diseno de memoria virtual de la asignacion fisica mediante `cuMemCreate`, `cuMemMap` y `cuMemSetAccess`, de modo que kernels FlashAttention-2/3 sin modificar ven rangos de direcciones virtuales contiguos; su limitacion es que la paginacion bajo demanda en el limite del driver sigue siendo reactiva y provoca paradas del kernel (`mem_wait_ns`) cuando se desreferencia una pagina no residente en HBM.

El nivel 3, ProphetCache (PAP), anade un flujo de co-procesador que reserva en torno al 5% de las SMs para anticipar la demanda de memoria. Combina tablas de transicion de n-gramas episodicas con un vector semantico de dominio binario (`[1, 0]` para codigo, `[0, 1]` para prosa) y emite un Optimization Vector (Memory Manifest) que dispara prefetch asincrono y mapeos VMM antes de la ejecucion del kernel de atencion. No se documentan datos de entrenamiento, tokens, composicion de dataset ni fases de RLHF o DPO, porque no existe un modelo entrenado en este repositorio.

## Capacidades

- Aceleracion de la gestion de KV cache en inferencia de LLMs mediante prefetch predictivo asincrono sobre CUDA Virtual Memory Management.
- Compatibilidad declarada con kernels FlashAttention-2 y FlashAttention-3 sin modificaciones, gracias al desacoplamiento de memoria virtual de vAttention.
- Prediccion de acceso a memoria basada en n-gramas episodicos y en un vector semantico de dominio (codigo frente a prosa).
- Deteccion de contaminacion de cache por cambio de contexto: el artefacto documenta un falsificador adversarial que degrada la tasa de acierto al 0,00% cuando el vector semantico queda obsoleto.
- Recuperacion semantica tras actualizar el vector de dominio, restaurando tasas de acierto cercanas al 87%.
- Simulador reproducible (`prophetcache_sim.py`) con semilla fija (`seed=20261118`) para verificar las invariantes del benchmark.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue, al no ser un modelo de lenguaje.

## Casos de uso

- Investigacion en sistemas de inferencia: servir como banco de pruebas reproducible para comparar estrategias de gestion de KV cache (PagedAttention, vAttention, PAP) con metricas de `mem_wait_ns` y TPOT bajo una semilla fija.
- Despliegue de LLMs con contexto largo: el prefetch predictivo puede reducir las paradas del kernel cuando la ventana de contexto excede la HBM disponible y la paginacion se vuelve frecuente.
- Servidores de inferencia con cargas mixtas de codigo y prosa: el vector semantico de dominio permite adaptar la politica de prefetch al tipo de carga dominante en cada momento.
- Evaluacion de robustez ante cambios de contexto: el falsificador adversarial de la fase 3 sirve para medir como degrada un esquema predictivo cuando la carga cambia sin actualizar el perfil semantico.
- Integracion en stacks basados en CUDA VMM: al apoyarse en `cuMemCreate`, `cuMemMap` y `cuMemSetAccess`, encaja en entornos que ya gestionan memoria virtual a bajo nivel para aislar la KV cache.
- Prototipado academico: como material de referencia para cursos o papers sobre optimizacion de memoria en inferencia, dado que incluye especificacion estructurada (`frameworks.jsonl`) y arnes de benchmark.

## Benchmarks y rendimiento

Los resultados publicados provienen de una simulacion determinista (`prophetcache_sim.py`, `seed=20261118`, 1.000 tokens por fase), no de mediciones en GPU real.

| Testbed / fase | Vector semantico | p50 mem_wait_ns | p99 mem_wait_ns | mean mem_wait_ns | p99 TPOT (ms) | Tasa de acierto |
|---|---|---|---|---|---|---|
| Bed-A: PagedAttention | `[1, 1]` | 514,66 ns | 525,13 ns | 457,17 ns | 8,846 ms | 0,00% |
| Bed-B: vAttention-only | `[1, 1]` | 418,99 ns | 430,15 ns | 351,84 ns | 8,766 ms | 0,00% |
| Bed-C: ProphetCache-V1 | `[1, 1]` | 40,91 ns | 430,13 ns | 102,79 ns | 8,946 ms | 83,91% (798/951) |
| Bed-C: fase 3 paso 1 (priming, codigo) | `[1, 0]` | 40,48 ns | 428,89 ns | 90,26 ns | 8,945 ms | 87,50% (847/968) |
| Bed-C: fase 3 paso 2 (contaminacion por cambio de contexto) | `[1, 0]` obsoleto | 587,89 ns | 596,08 ns | 588,14 ns | 9,087 ms | 0,00% (0/1000) |
| Bed-C: fase 3 paso 3 (recuperacion semantica, prosa) | `[0, 1]` | 40,59 ns | 429,40 ns | 92,54 ns | 8,945 ms | 86,88% (841/968) |

Invariantes declaradas por el autor: reduccion del `mem_wait_ns` medio del 77,52% frente a PagedAttention y del 70,79% frente a vAttention-only; caida de `p50 mem_wait_ns` de 418,99 ns a 40,91 ns. El falsificador adversarial (fase 3 paso 2) muestra que un vector semantico obsoleto degrada la tasa de acierto a 0,00% y eleva `p99 mem_wait_ns` a 596,08 ns, peor que la linea base vAttention (430,15 ns).

## Requisitos de hardware

- GPU NVIDIA con soporte de CUDA Virtual Memory Management (`cuMemCreate`, `cuMemMap`, `cuMemSetAccess`); no se especifican modelos concretos en la documentacion.
- Reserva declarada de aproximadamente el 5% de las SMs de la GPU para el flujo de co-procesador de ProphetCache, lo que reduce la capacidad de computo disponible para el kernel principal.
- VRAM estimada: no disponible (depende del modelo de lenguaje sobre el que se aplique el mecanismo, no del artefacto en si).
- Compatibilidad con GPUs de consumo: no disponible; la dependencia de CUDA VMM y de kernels FlashAttention-2/3 sugiere GPUs de centro de datos, pero no se confirma.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el artefacto se limita a un simulador en Python y a una especificacion en JSONL.
- Latencia y throughput: solo se reportan metricas simuladas de `mem_wait_ns` y TPOT (en torno a 8,8-9,1 ms de p99 TPOT en las tres camas), sin mediciones reales de throughput.

## Comparativa con modelos similares

| Artefacto | Enfoque | Mecanismo de memoria | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProphetCache (PAP) | Prefetch predictivo sobre vAttention | n-gramas + vector semantico + `cudaMemPrefetchAsync` | Simuladas: 102,79 ns de media, 83,91% de acierto | MIT | Hugging Face (0 descargas) |
| PagedAttention (vLLM) | Paginacion de KV cache por bloques | Tabla de bloques por software | Referencia del benchmark: 457,17 ns de media (simulado) | Open source (Apache 2.0 en vLLM) | Ampliamente desplegado |
| vAttention | Memoria virtual desacoplada de la fisica | CUDA VMM con kernels FlashAttention sin modificar | Referencia del benchmark: 351,84 ns de media (simulado) | Open source (paper Microsoft Research) | Implementacion de investigacion |
| FlashAttention-2/3 | Atencion eficiente en memoria | Tiling y recomputacion | No comparable en `mem_wait_ns` | BSD-3 / Apache 2.0 | Ampliamente desplegado |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni dispone de capacidades multilingues; es un artefacto de infraestructura.
- Todos los benchmarks publicados son simulados (`prophetcache_sim.py`), no mediciones en GPU real; las cifras de `mem_wait_ns` y TPOT no deben extrapolarse a produccion sin validacion independiente.
- El repositorio no incluye implementacion CUDA del mecanismo ProphetCache; solo contiene la especificacion (`frameworks.jsonl`), el simulador y el fichero de atribucion.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta, sin senales de adopcion ni revision por parte de la comunidad.
- El falsificador adversarial documentado por el propio autor demuestra que un vector semantico obsoleto degrada el rendimiento por debajo de la linea base vAttention, lo que exige un mecanismo fiable de deteccion de cambio de contexto.
- La reserva del 5% de las SMs reduce el computo disponible para el kernel principal; el impacto neto en throughput no se cuantifica.
- Licencia MIT declarada, sin restricciones conocidas para uso comercial, aunque la ausencia de implementacion real limita su aplicabilidad practica.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el artefacto no procesa lenguaje de forma directa.

## Enlaces

- Hugging Face: https://huggingface.co/Kovach-Enterprises/prophetcache-vattention-pap
- Contacto del investigador principal: igor@kovachenterprises.com (ORCID 0009-0008-8389-1297)
- Paper de vAttention (referencia del nivel 2): no disponible en la informacion proporcionada
- Repositorio de vLLM / PagedAttention (referencia del nivel 1): no disponible en la informacion proporcionada
- Repositorio de FlashAttention-2/3: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
