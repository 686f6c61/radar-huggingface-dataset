# local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit

## Resumen

Kimi-K3.1-Pro-EXL3-2bit es una cuantizacion EXL3 de 2 bits del modelo base moonshotai/Kimi-K3.1-Pro, publicada por local-inference-lab. El repositorio contiene dos representaciones del mismo checkpoint: una revision `main` con pesos `exl3-v1` independientes del grado de tensor-parallel, pensada para preparar un runtime compatible con EXL3, y una revision `gb202` que constituye un paquete Flare firmado y listo para servir en ocho GPUs SM120 sin necesidad de Python, Torch, compilacion ni autotuning.

El modelo cuenta con 57.369.533.184 parametros segun los safetensors del repositorio, lo que lo situa en la categoria de modelos densos de gran tamano (aproximadamente 57B). La cuantizacion a 2 bits reduce el checkpoint bruto a 742,235 GiB y los ficheros preparados a 706,46 GiB, permitiendo desplegar el modelo en un nodo de ocho GPUs Blackwell de 96 GB cada una cuando el modelo en precision original no cabria en esa configuracion.

La relevancia actual del repositorio radica en que ofrece una ruta de despliegue reproducible y firmada criptograficamente para un modelo de gran tamano en hardware de workstation profesional (RTX PRO 6000 Blackwell), con soporte de vision, decodificacion especulativa DFlash2 K7 y una ventana de contexto maxima de 262.144 tokens por peticion. El paquete cualificado incluye TP8/DCP8, cuatro peticiones concurrentes y grafos de prefill de 3.072 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Kimi-K3.1-Pro; runtime EXL3/Flare) |
| Parametros totales | 57.369.533.184 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | EXL3 2-bit (routed-expert quant) |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license: other) |
| Formato de pesos | safetensors (EXL3 v1 en `main`; paquete Flare firmado en `gb202`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Kimi-K3.1-Pro (tipo de transformer, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO). Lo que si se documenta es la capa de cuantizacion y despliegue: el repositorio aplica una cuantizacion EXL3 de 2 bits sobre los tensores de expertos enrutados, mientras que los tensores no-expertos conservan sus bytes originales en la revision `main`. La revision `gb202` es un paquete Flare de produccion firmado, especifico para ocho GPUs SM120.

La innovacion tecnica destacable esta en el runtime: el paquete preparado incorpora TP8/DCP8 (tensor-parallel y data-parallel de 8), decodificacion especulativa DFlash2 con profundidad K7 (7 tokens draft), soporte de vision, cuatro peticiones concurrentes y grafos de prefill de 3.072 tokens. La capacidad fisica de KV compartida entre peticiones e historiales cacheados es de 1.281.024 tokens, que no debe confundirse con una ventana de 1,28M tokens para una sola peticion. El paquete se sirve mediante un binario nativo dentro de una imagen Docker de aproximadamente 160 MB que no contiene los pesos.

## Capacidades

- Generacion de texto y razonamiento, con niveles de esfuerzo de razonamiento configurables (`low`, `medium`, `high`, `max`; por defecto `max`).
- Generacion de codigo, incluyendo ejemplos de implementacion con tests en la documentacion del autor.
- Vision: el paquete preparado incluye soporte de vision y se validaron cuatro comprobaciones de imagen concurrentes (4/4 correctas).
- Contexto largo: hasta 262.144 tokens por peticion, con pruebas de recall exacto sobre contextos de aproximadamente 250k tokens.
- Decodificacion especulativa (DFlash2 K7) para acelerar la generacion.
- API compatible con Chat Completions de OpenAI (`/v1/chat/completions`), con streaming.
- Soporte de historial de razonamiento y de tool-calls en clientes multi-turno (se indica preservar el historial de razonamiento del asistente y de tool-calls).
- Cache de prefijos en memoria (`--prefix-cache-memory`) para reutilizacion de contextos.
- No se documentan capacidades de audio ni de function calling mas alla de la mencion al historial de tool-calls.

## Casos de uso

- Asistencia a programacion en produccion: el modelo puede generar codigo y tests (el ejemplo oficial pide un LRU cache en Python con tests) y servirse mediante una API compatible con OpenAI, integrandose en pipelines de CI/CD o en asistentes de IDE.
- Analisis de repositorios y documentos largos: con 262.144 tokens por peticion y cache de prefijos de 4 GB, es adecuado para revisar codebases extensas o contratos largos manteniendo el contexto entre turnos.
- Procesamiento por lotes concurrente: el paquete cualificado admite cuatro peticiones simultaneas con una capacidad fisica de KV de 1.281.024 tokens, lo que permite atender varios usuarios o tareas en paralelo en un solo nodo.
- Revision de imagenes y documentos escaneados: el soporte de vision integrado permite comprobaciones de imagen concurrentes (validadas 4/4) en flujos de verificacion documental.
- Razonamiento multi-paso con esfuerzo ajustable: los niveles `low` a `max` permiten equilibrar latencia y profundidad segun la tarea (por ejemplo, `low` para respuestas rapidas y `max` para analisis complejos).
- Despliegue on-premise con requisitos de integridad: el paquete Flare firmado y verificado criptograficamente permite servir el modelo en infraestructura propia sin depender de servicios externos, con verificacion de firma en el arranque.
- Investigacion sobre cuantizacion extrema: la revision `main` con pesos `exl3-v1` sirve para preparar y evaluar runtimes compatibles con EXL3 sobre un modelo de 57B en 2 bits.

## Benchmarks y rendimiento

El autor publica mediciones de serving (no benchmarks academicos como MMLU o HumanEval) en las siguientes condiciones: ocho RTX PRO 6000 Blackwell Workstation Edition de 96 GB, host AMD EPYC 9575F de 64 nucleos, driver 615.71.10, limites de 600 W por GPU y memorias a 16.365 MHz.

| Carga de trabajo | Resultado |
|---|---:|
| Una peticion de codigo, mediana de tres prompts, razonamiento `low` | 109,04 tok/s de decode |
| Cuatro peticiones de codigo simultaneas, intervalo de decode comun | 158,45 tok/s agregados |
| Prefill en frio de 32.768 tokens, mediana de tres prompts | 1.951,16 tok/s |
| KV fisica compartida entre peticiones e historiales cacheados | 1.281.024 tokens |
| Cuatro comprobaciones de imagen concurrentes | 4/4 correctas |

El decode excluye el prefill. El muestreo uso temperatura 1, top-p 0,95 y sin semilla por peticion. Cuatro contextos simultaneos de aproximadamente 250k tokens (1.000.345 tokens de prompt en total) se completaron sin OOM con todos los marcadores de recall exacto correctos. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: el paquete preparado ocupa 706,46 GiB y requiere ocho GPUs de 96 GB (768 GB en total); el checkpoint bruto es de 742,235 GiB.
- GPUs cualificadas: ocho RTX PRO 6000 Blackwell 96 GB (SM120) con peer access habilitado. Otras arquitecturas y tamanos de TP no estan cualificados por esta release.
- No cabe en GPUs consumer: un host con menos GPUs o GPUs mas pequenas no puede cargar el paquete TP8 cambiando `--gpus`.
- Entorno: Linux x86-64, NVIDIA Container Toolkit, driver 615.71.10 probado, Docker con `--ipc host`, `--ulimit memlock=-1:-1` y `--ulimit nofile=65536:65536`.
- Despliegue: imagen `ghcr.io/local-inference-lab/flare:k31-exl3-tp8-c4-dflash2-20261108` (aproximadamente 160 MB, sin pesos) con runtime nativo; la revision `main` requiere un runtime compatible con EXL3.
- Concurrencia: maximo 4 peticiones simultaneas en el paquete preparado; se permite reducir pero no aumentar.
- Rendimiento medido: 109,04 tok/s de decode con una peticion y 158,45 tok/s agregados con cuatro; prefill en frio de 32.768 tokens a 1.951,16 tok/s.
- Cache: `--prefix-cache-memory 4G` en el ejemplo; la capacidad de cache depende de la memoria disponible al arrancar (revisar la linea `Allocate cache` en el log).

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada para establecer una comparacion fiable.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-EXL3-2bit | 57.369.533.184 | 262.144 tokens | EXL3 2-bit | kimi-k3.1-pro | Hugging Face (repo de 1.555,5 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cuantizacion de 2 bits: la perdida de calidad frente al modelo base no se cuantifica en la informacion disponible; conviene validar en la tarea concreta antes de produccion.
- Hardware muy restrictivo: solo esta cualificado para ocho RTX PRO 6000 Blackwell 96 GB (SM120) con TP8; no funciona en otras arquitecturas ni con otros tamanos de TP sin reexportar.
- La ventana de 262.144 tokens es por peticion; la capacidad de KV de 1.281.024 tokens es compartida entre peticiones e historiales cacheados, no una ventana unica de 1,28M tokens.
- Concurrencia maxima de 4 peticiones en el paquete preparado; no se puede aumentar por flag.
- El adaptador de Responses del runtime mapea el esfuerzo `medium` a `high`; para un `medium` exacto debe usarse Chat Completions.
- En clientes multi-turno es necesario preservar el historial de razonamiento del asistente y de tool-calls.
- Licencia `kimi-k3.1-pro` (license: other): deben revisarse los terminos del fichero LICENSE para uso comercial; la informacion disponible no detalla restricciones.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- El paquete se distribuye con firma criptografica y clave publica del publicador; los flags `--dangerously-accept-publisher` y `--dangerously-approve-key` confian explicitamente en esa clave y no desactivan la verificacion de firma.
- El ejemplo expone la API solo en loopback; para acceso remoto debe cambiarse el binding y configurarse `--api-key-file`.
- Parada recomendada con `docker stop --time 90` para un apagado ordenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Imagen Docker del runtime Flare: ghcr.io/local-inference-lab/flare:k31-exl3-tp8-c4-dflash2-20261108
- Digest de la imagen: sha256:775016c31860bb4451aad0aa16d4773fc0b4a317c90c72ed02d2eb5bcc5c9496
- Revision preparada: gb202-tp8-c4-p3072-dflash2-k7-20261108
- Fichero de licencia: LICENSE (en el repositorio de Hugging Face)
