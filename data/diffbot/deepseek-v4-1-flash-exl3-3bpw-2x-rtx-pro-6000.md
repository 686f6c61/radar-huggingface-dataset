# diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000

## Resumen

DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000 es una cuantización de 3 bits del modelo base DeepSeek-V4.1-Flash-1017, publicada por diffbot. Se trata de un empaquetado calibrado en formato EXL3 (ExLlamaV3) de los expertos enrutados de una arquitectura Mixture-of-Experts (MoE), pensado especificamente para servir el modelo en dos tarjetas RTX PRO 6000 Blackwell (sm_120, 96 GB cada una) mediante vLLM con tensor-parallel 2. El pack tambien funciona en nodos de 8 GPU como dos replicas de 4 GPU con todos los expertos en VRAM.

El modelo base pertenece a la familia DeepSeek-V4.1-Flash, una variante optimizada para latencia y velocidad de la saga DeepSeek. El repo pesa 1035,8 GB e incluye pesos safetensors, recetas de despliegue, kernels CUDA personalizados para sm_120 y utilidades de benchmark. Cuenta con 218.691.507.682 parametros totales segun los safetensors publicados.

La relevancia de esta ficha radica en que demuestra una via practica para desplegar un modelo MoE de gran tamano en hardware de consumo profesional (no datacenter de gama alta), sacrificando precision numerica (3 bits) a cambio de viabilidad en VRAM. Los autores reportan GSM8K-200 al 98,5% y HumanEval al 97,0%, con una divergencia KL media de 0,0522 nats respecto al checkpoint original, lo que indica una degradacion medible pero acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, formato EXL3 (ExLlamaV3) |
| Parametros totales | 218.691.507.682 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (ventana de 1M, KV cache de 1,07M tokens fp8 en perfil 2x) |
| Tipos de cuantizacion | 3 bits (3bpw) en expertos enrutados, EXL3 calibrado; resto de capas segun receta del autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, ~332 GB de pack) |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture-of-Experts de DeepSeek, del que esta publicacion solo redistribuye una version cuantizada. La innovacion principal de este pack es el uso de EXL3 3-bit calibrado sobre los expertos enrutados, aplicando el metodo de coolbho3k, con kernels CUDA propios para sm_120 (Blackwell): xmoe, xmoe_bulk, xmoe_do, xmoe_do_i8, fp8ar y rowtopk. Un tercio de los expertos enrutados reside en RAM del host (pinned memory) y se sirve mediante kernels personalizados o un runtime CPU opcional (CPU_EXPERTS=1), lo que permite reducir la huella en VRAM.

El despliegue recomendado usa vLLM con tensor-parallel 2 sobre dos RTX PRO 6000 (96 GB), con una ventana de 1M tokens y KV cache en fp8 de 1,07M tokens. Existe tambien un perfil 8x (TP4 + EP4 por replica) que mantiene todos los expertos en VRAM y alcanza 4,54M tokens de KV cache y 128 secuencias concurrentes. Se incluye un cabezal drafter DSpark afinado para codigo a k=7 (decodificacion especulativa opcional). No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre si se aplico RLHF/DPO en esta publicacion.

## Capacidades

- Generacion de texto y codigo, con benchmarks reportados de HumanEval (97,0-97,6%) y GSM8K-200 (98,0-99,0%).
- Razonamiento agentico multi-turno con llamadas a herramientas: el pack incluye un benchmark de replay agentico de 104 turnos con tool calls.
- Soporte de tool calling, verificado mediante `bench/test-toolcall.py`.
- Soporte de imagenes, verificado mediante `bench/test-image.py` (capacidad multimodal heredada del modelo base).
- Ventana de contexto de 1M tokens, validada con `bench/needle-test.py` a 200.
- Decodificacion especulativa opcional mediante el drafter DSpark afinado para codigo (k=7).
- API compatible con OpenAI servida en el puerto 8000 bajo el nombre `deepseek-v4.1-flash`.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en hardware de gama profesional: el pack esta disenado para dos RTX PRO 6000 Blackwell de 96 GB, lo que permite servir un MoE de ~218.000 millones de parametros sin recurrir a nodos de 8 GPU de datacenter. Es adecuado porque el particionado TP2 y la colocacion parcial de expertos en RAM reducen el coste de infraestructura.
- Replicas de alta concurrencia en nodos de 8 GPU: con el perfil 8x se obtienen dos replicas de 4 GPU que alcanzan 8.430 tokens/s agregados con 128 streams de codigo por replica, lo que lo hace util para plataformas de generacion de codigo a gran escala.
- Asistentes de programacion en produccion: HumanEval al 97,0-97,6% con thinking desactivado y decodificacion greedy, junto con tool calling verificado, permite integrarlo en pipelines de CI/CD y entornos de IDE con llamadas a funciones.
- Agentes autonomos multi-paso: el benchmark de replay agentico de 104 turnos con tool calls y la ventana de 1M tokens permiten gestionar sesiones largas de resolucion de tareas con contexto acumulado.
- Analisis de documentos extensos: la ventana de 1M tokens y el KV cache fp8 de 1,07M tokens hacen posible procesar corpus largos (informes, expedientes, bases de codigo) sin truncamiento.
- Atencion al cliente automatizada multi-turno: con 4 sesiones concurrentes a 110-146 tokens/s agregados, el modelo sostiene conversaciones con contexto largo y llamadas a herramientas de backoffice.
- Extraccion de informacion multimodal: la verificacion de imagenes (`test-image.py`) sugiere uso en tareas que combinan texto e imagenes, como clasificacion de documentos escaneados o captura de datos de formularios.
- Evaluacion y experimentacion en investigacion: la publicacion incluye metricas de fidelidad (KL media, top-1 agreement) y utilidades de benchmark que permiten reproducir comparaciones frente al checkpoint original.

## Benchmarks y rendimiento

Metricas de calidad reportadas por el autor (thinking off, greedy decoding cuando aplica):

| Metrica | Original 1017 (ruido) | Pack 2x default | Pack 2x CPU runtime | Pack 8x |
|---|---:|---:|---:|---:|
| KL media, texto neutro (nats) | 0,0082 | 0,0522 | 0,0520 | no disponible |
| KL media, codigo (nats) | 0,0050 | 0,0306 | 0,0309 | no disponible |
| KL media, agentico (nats) | 0,0047 | 0,0111 | 0,0110 | no disponible |
| short100 | no disponible | 0,0338 | 0,0349 | no disponible |
| GSM8K-200 | no disponible | 98,5% | 98,5% | 98,0-99,0% |
| HumanEval | no disponible | 97,0% | 97,0-97,6% | 97,0-97,6% |

Rendimiento de inferencia (tokens/s de salida):

| Configuracion | Agentico, 1 stream | Codigo, 1 stream | Prefill 40K fresco | Bajo carga (agregado) |
|---|---:|---:|---:|---:|
| 2x default (GPU-only) | 224,1 | 172,8 (prompt 46K) | 11.157-11.467 | 110,4 (4 concurrentes); 362,9 (cuatro streams 46K) |
| 2x CPU runtime | 271-281 | 193-223 (prompt 46K) | 13.442-14.389 | 136-146; 396-452 |
| 8x por replica (TP4+EP4) | 205-222 (prompt 46K) | 435-457 | 19.131-19.302 | 4.404-4.469 (128 streams de codigo) |
| 8x nodo completo | no disponible | 809 (un stream por replica) | no disponible | 8.430 (128 streams por replica); 5.250 en generaciones largas |

Mejora de la revision 2026-11-14 frente a la de 2026-10-25: 1,101 en una sesion, 1,111 en cuatro sesiones, puntuacion agentica 1,106 (media geometrica). El prefill fresco de 40K tokens paso de 11.625-12.332 a 13.633-14.260 tokens/s en la evaluacion de esta revision.

## Requisitos de hardware

- VRAM: dos GPU sm_120 de 96 GB (RTX PRO 6000 Blackwell) para el perfil 2x; un tercio de los expertos enrutados puede residir en RAM pinned del host. Para el perfil 8x se necesitan 8 GPU de 96 GB.
- RAM del host: aproximadamente 260 GiB libres para el perfil 2x; hasta 400 GiB por replica en el nodo de 8 GPU.
- Disco: unos 340 GB para el pack descargado (el repo completo pesa 1035,8 GB).
- CPU del host (para runtime CPU opcional): x86_64 con AVX-512 (VNNI, VBMI, VBMI2) y muchos nucleos y canales de memoria.
- Driver: CUDA 13 y Docker con NVIDIA container toolkit.
- GPU recomendadas: RTX PRO 6000 Blackwell (sm_120) como plataforma objetivo; otras GPU no estan documentadas en la informacion disponible.
- Cabe en GPU de consumo: no, segun los requisitos declarados (96 GB por tarjeta y dos tarjetas como minimo).
- Despliegue: vLLM con tensor-parallel 2 (perfil 2x) o TP4+EP4 (perfil 8x), imagen Docker propia (`dsv41-flash-1017-exl3-3bpw-sm120`), kernels CUDA compilados en unos 5 minutos; API compatible con OpenAI en el puerto 8000.
- Latencia y throughput: 224,1 tokens/s agentico en un stream (2x default), 271-281 con runtime CPU, 435-457 tokens/s en codigo por replica en 8x; prefill de 11.157-11.467 tokens/s (2x) y 19.131-19.302 tokens/s (8x).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-EXL3-3bpw (este pack) | 218.691.507.682 | 1M | MIT | Hugging Face, safetensors | Cuantizacion 3 bits EXL3, 2.515 descargas, 47 likes |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | Hugging Face (deepseek-ai) | Checkpoint original de referencia; sin cuantizar |
| Revision 2026-10-25 del mismo pack | no disponible | 1M | MIT | Hugging Face | Runtime CPU ~10% mas lento en replay agentico |
| Revision 2026-11-08 del mismo pack | no disponible | 1M | MIT | Hugging Face | ~4% mas lenta que la revision actual |

No se dispone de datos de benchmarks de terceros ni de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a las revisiones del propio pack y al modelo base.

## Limitaciones y advertencias

- Cuantizacion agresiva a 3 bits: la divergencia KL media frente al original es de 0,0522 nats en texto neutro y 0,0306 en codigo, lo que implica una degradacion medible de la distribucion de salida.
- Dependencia de hardware especifico: los kernels estan compilados para sm_120 (Blackwell); no se documenta compatibilidad con otras arquitecturas GPU.
- Requisitos de infraestructura elevados: dos GPU de 96 GB, ~260 GiB de RAM y 340 GB de disco como minimo; el repo completo ocupa 1035,8 GB.
- Complejidad de despliegue: requiere compilar kernels, construir imagen Docker y, opcionalmente, validar el runtime CPU en el host antes de activarlo.
- Rendimiento dependiente del perfil: el modo GPU-only coloca un tercio de los expertos en RAM del host, lo que puede introducir latencia adicional frente al perfil 8x con todos los expertos en VRAM.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue en la model card.
- Riesgo de alucinacion: inherente a los modelos generativos; no se reportan evaluaciones de factualidad en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias explicitas sobre el rendimiento en produccion ni sobre la fidelidad absoluta al modelo base.
- Fechas de publicacion futuras (2026): conviene verificar la vigencia de las revisiones y de los enlaces antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Documentacion de velocidad: docs/SPEED.md (dentro del repo)
- Documentacion de fidelidad: docs/FIDELITY.md (dentro del repo)
- Changelog: docs/CHANGELOG.md (dentro del repo)
- Drafter DSpark: docs/DRAFTER.md (dentro del repo)
- Runtime CPU: recipe/cpuexp/README.md (dentro del repo)
- Stack de servicio: recipe/README.md (dentro del repo)
