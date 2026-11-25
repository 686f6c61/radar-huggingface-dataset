# diffbot/DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000

## Resumen

DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000 es un empaquetado cuantizado del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicado por el usuario diffbot. Su objetivo es hacer viable la inferencia de un modelo de mezcla de expertos (MoE) de aproximadamente 218.700 millones de parametros sobre dos GPU RTX PRO 6000 Blackwell (sm_120) de 96 GB cada una, manteniendo la ventana de contexto completa de 1 millon de tokens. La cuantizacion aplica EXL3 de 3 bits (metodo calibrado de coolbho3k) exclusivamente a los expertos enrutados, mientras que el resto de tensores conservan el formato FP8 original de DeepSeek.

El pack se sirve con vLLM en tensor-parallel 2 y admite dos modos: uno puramente GPU y otro que delega parte de los expertos a memoria RAM del host mediante un runtime CPU opcional sobre AVX-512. Este segundo modo es el mas rapido y alcanza 277-289 tokens/s de salida en cargas agenticas de codigo, ademas de 14.333-15.244 tokens/s de prefill en prompts de 40.000 tokens. La fidelidad respecto al checkpoint original se mide con una divergencia KL media de 0,011 nats en texto agentico, junto con GSM8K-200 al 98,5% y HumanEval al 97,0%.

La relevancia actual del modelo reside en que demuestra que un MoE de gran escala puede desplegarse con contexto de 1M en hardware de estacion de trabajo de gama alta (dos tarjetas de 96 GB), con licencia MIT y una API compatible con OpenAI. El repositorio pesa 1035,8 GB e incluye ademas un drafter DSpark opcional afinado para codigo, pensado para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), derivada de DeepSeek-V4.1-Flash-1017; cuantizacion EXL3 3 bits en expertos enrutados y FP8 en el resto de tensores |
| Parametros totales | 218.691.507.682 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (ventana de 1M; cache KV FP8 de 1,07M tokens en 2,81 GiB) |
| Tipos de cuantizacion | EXL3 3 bits calibrada para expertos enrutados; FP8 para el resto de tensores; tablas Engram en int4; drafter con expertos EXL3 3 bits y variante FP8/FP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, `model-00001` a `model-00048`), con `config.json`; pensado para exllamav3 y vLLM |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos. Este empaquetado no reentrena el modelo: parte del checkpoint original y sustituye unicamente los tensores de los expertos enrutados por una cuantizacion EXL3 de 3 bits calibrada, mientras que el resto de tensores mantiene el FP8 de DeepSeek. Tambien incluye tablas Engram en int4 y un drafter DSpark con expertos EXL3 3 bits. El pack completo ocupa 332 GB y se distribuye en 48 ficheros safetensors.

La innovacion tecnica principal es el esquema de servicio: con tensor-parallel 2 en vLLM, un tercio de los expertos enrutados permanece en RAM del host fijada (pinned host RAM) y se ejecuta mediante kernels personalizados para sm_120 en las GPU o, opcionalmente, mediante un runtime CPU sobre un host con AVX-512 (VNNI, VBMI, VBMI2). El runtime CPU es el modo mas rapido y emplea un cambio en la ruta de decodificacion que omite el enrutamiento de expertos para filas de borrador que se van a rechazar; segun el autor, ese cambio no es bit-exacto pero supero pruebas de acuerdo con teacher forcing y de comportamiento agentico. El prefill se mantiene bit-identico. Ademas se ofrece decodificacion especulativa con el drafter DSpark afinado para codigo a k=7.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Generacion de codigo: HumanEval del 97,0-97,6% con thinking desactivado y decodificacion greedy en este pack.
- Razonamiento matematico: GSM8K-200 del 98,5% con thinking desactivado y decodificacion greedy.
- Soporte de tool calling: el benchmark agentico del autor reproduce 104 turnos con llamadas a herramientas y definiciones de herramientas enviadas en cada peticion.
- Capacidades agenticas multi-turno: las pruebas de velocidad y fidelidad se realizan sobre un benchmark agentico de codigo con multiples sesiones concurrentes.
- Contexto largo: ventana de 1M tokens verificada con una prueba de aguja (needle test) sobre un prompt de 1.040.034 tokens y una llamada a herramienta posterior.
- Capacidades de imagen: el repositorio incluye un script de prueba `bench/test-image.py`, lo que sugiere soporte de entrada de imagen, aunque no se detalla su alcance.
- Servicio mediante API compatible con OpenAI en el puerto 8000 con el identificador de modelo `deepseek-v4.1-flash`.
- Decodificacion especulativa opcional con el drafter DSpark afinado para codigo y uso agentico de herramientas.

## Casos de uso

- Asistencia agentica de codigo en produccion: el pack esta optimizado para sesiones multi-turno con llamadas a herramientas, con 277-289 tokens/s de salida en una sesion y 154-159 tokens/s agregados con cuatro sesiones concurrentes usando el runtime CPU, lo que lo hace adecuado para agentes de edicion de codigo que necesitan iterar rapido.
- Analisis de repositorios completos: con 1M tokens de contexto y un prefill de 93 s para un prompt de 1.040.034 tokens, permite cargar bases de codigo extensas o documentacion tecnica completa en una sola peticion.
- Generacion de codigo en pipelines de CI/CD: la integracion mediante API compatible con OpenAI y el soporte de tool calling permiten conectar el modelo a flujos de revision automatica, generacion de tests o correccion de parches.
- Razonamiento matematico y resolucion de problemas: con GSM8K-200 al 98,5% en modo greedy y thinking desactivado, es util para validacion de calculos, tutoria automatizada y generacion de problemas resueltos.
- Procesamiento de documentos largos con imagenes: la presencia de `bench/test-image.py` y el contexto de 1M tokens permiten abordar tareas de extraccion y resumen sobre documentos extensos que combinan texto e imagenes.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse sobre dos GPU RTX PRO 6000 y un host con suficiente RAM, permite mantener datos sensibles en infraestructura propia con licencia MIT.
- Servicio de chat de alta concurrencia en codigo: con cuatro flujos de 46.000 tokens en paralelo se alcanzan 470,0-505,2 tokens/s agregados con el runtime CPU, adecuado para equipos de desarrollo que comparten una instancia.

## Benchmarks y rendimiento

Calidad frente al checkpoint original DeepSeek-V4.1-Flash-1017 (KL en nats, menor es mejor; GSM8K-200 y HumanEval con thinking desactivado y decodificacion greedy):

| Metrica | Original 1017 (segunda ejecucion, ruido) | Este pack, runtime CPU | Este pack, solo GPU |
|---|---:|---:|---:|
| KL, texto neutro | 0,0082 | 0,0520 | 0,0522 |
| KL, codigo | 0,0050 | 0,0309 | 0,0306 |
| KL, agentico | 0,0047 | 0,0110 | 0,0111 |
| KL, short100 | no disponible | 0,0349 | 0,0338 |
| GSM8K-200 | no disponible | 98,5% | 98,5% |
| HumanEval | no disponible | 97,0-97,6% | 97,0% |

Velocidad en 2x RTX PRO 6000 (tokens/s):

| Configuracion | Codigo agentico, 1 sesion | Codigo, 1 flujo (prompt de 46K) | Prefill fresco (40K tokens) | Agregado bajo carga | Contexto |
|---|---:|---:|---:|---|---|
| Runtime CPU (`CPU_EXPERTS=1`) | 277-289 | 214,8-223,2 | 14.333-15.244 | 4 sesiones agenticas: 154-159; cuatro flujos de 46K: 470,0-505,2 | Ventana de 1M; cache KV FP8 de 1,07M tokens en 2,81 GiB |
| Solo GPU (por defecto) | 224,1 | 172,8 | 11.157-11.467 | 4 sesiones agenticas: 110,4; cuatro flujos de 46K: 362,9 | Ventana de 1M; cache KV FP8 de 1,07M tokens |

A 1M tokens con el runtime CPU: un prompt de 1.040.034 tokens se procesa en prefill en 93 s (11.179 tokens/s), la aguja se encuentra y una llamada a herramienta posterior funciona, con unas 2,5 GB libres por tarjeta en el pico.

## Requisitos de hardware

- Dos GPU sm_120 (Blackwell) con 96 GB cada una, es decir, 192 GB de VRAM total, y un driver CUDA 13.
- Aproximadamente 260 GiB de RAM de host libre y 340 GB de disco para el despliegue segun la guia de inicio rapido.
- El runtime CPU opcional requiere un host x86_64 con AVX-512 (VNNI, VBMI, VBMI2), muchos nucleos y canales de memoria; es el modo mas rapido de servicio.
- Despliegue mediante Docker con NVIDIA container toolkit, compilando la imagen de servicio `dsv41-flash-1017-exl3-3bpw-sm120` y los kernels `xmoe`, `xmoe_bulk`, `xmoe_do`, `xmoe_do_i8`, `fp8ar`, `rowtopk`, `sparse_mla_epilogue` y `mxfp8_pingpong` (unos 6 minutos de compilacion).
- Servicio con vLLM en tensor-parallel 2 y API compatible con OpenAI en el puerto 8000.
- El mismo paquete permite servir un nodo de 8x RTX PRO 6000 como dos replicas de 4 GPU con todos los expertos en VRAM, segun `docs/PROFILE-8x.md`.
- No se indica compatibilidad con GPU de consumo; el requisito de 96 GB por tarjeta excluye las RTX 4090 y similares.
- Throughput y latencia medidos: 277-289 tokens/s de salida en una sesion agentica y 14.333-15.244 tokens/s de prefill a 40K tokens con el runtime CPU.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000 (este pack) | 218.691.507.682 | 1M | MIT | Hugging Face, safetensors, vLLM y exllamav3 | Cuantizacion EXL3 3 bits con FP8 en el resto; GSM8K-200 98,5%, HumanEval 97,0% |
| DeepSeek-V4.1-Flash-1017 (modelo base) | no disponible | 1M (heredado) | no disponible | Hugging Face | Referencia de calidad del pack; KL de ruido 0,0047-0,0082 nats |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion introduce divergencia respecto al original: KL medio de 0,011 nats en texto agentico, 0,0309 en codigo y 0,0520 en texto neutro, frente al ruido de 0,0047-0,0082 del checkpoint original.
- Un cambio en la ruta de decodificacion del runtime CPU no es bit-exacto (omite el enrutamiento de expertos para filas de borrador que se rechazan); se valido con teacher forcing y pruebas de comportamiento, no con igualdad bit a bit.
- El prefill se mantiene bit-identico, pero la fidelidad global no equivale a la del modelo sin cuantizar.
- Requiere hardware muy especifico: dos GPU Blackwell sm_120 de 96 GB, driver CUDA 13 y unos 260 GiB de RAM de host; no es desplegable en GPU de consumo.
- El rendimiento depende del modo de servicio: el modo solo GPU es entre un 20% y un 25% mas lento en decodificacion que el runtime CPU en las cifras publicadas.
- No se dispone de informacion sobre sesgos, idiomas soportados ni tasas de alucinacion del modelo base en la informacion proporcionada.
- La licencia MIT del pack no exime de verificar las condiciones del modelo base DeepSeek-V4.1-Flash-1017 para uso comercial.
- El repositorio ocupa 1035,8 GB y el pack 332 GB, lo que exige planificacion de almacenamiento y descarga.
- El drafter DSpark es opcional y esta orientado a codigo; su uso fuera de ese dominio no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Documentacion de velocidad: `docs/SPEED.md` (en el repositorio)
- Documentacion de fidelidad: `docs/FIDELITY.md` (en el repositorio)
- Documentacion del drafter: `docs/DRAFTER.md` (en el repositorio)
- Perfil para 8x RTX PRO 6000: `docs/PROFILE-8x.md` (en el repositorio)
- Guia del runtime CPU: `recipe/cpuexp/README.md` (en el repositorio)
- Explicacion del stack: `recipe/README.md` (en el repositorio)
- Distribucion del pack: `docs/HOW-IT-FITS.md` (en el repositorio)
