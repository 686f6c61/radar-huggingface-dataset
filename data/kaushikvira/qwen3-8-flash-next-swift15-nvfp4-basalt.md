# kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-basalt

## Resumen

Este repositorio contiene un empaquetado NVFP4 del modelo Swift-1.5 Qwen3.8-Flash-Next, un MoE de aproximadamente 130 mil millones de parametros derivado del Qwen3.8-Flash-Next del equipo Qwen y afinado por UkisAI con tecnicas de post-entrenamiento (RL y OPD) orientadas a eficiencia de razonamiento en tareas agénticas y de codigo. El autor del empaquetado, kaushikvira, no aporta fine-tuning propio: se limita a convertir el checkpoint NVFP4 de UkisAI al formato de contenedor propietario `.basalt` y a integrar el drafter MTP del modelo base para decodificacion especulativa.

La relevancia de esta publicacion es fundamentalmente de infraestructura: el modelo completo no cabe en BF16 ni siquiera en una GPU de 72 GB, y el pack NVFP4 (unos 122 GB de pesos) sigue excediendo esa VRAM. El motor Basalt resuelve el problema mediante offload de expertos a RAM del host con cache en VRAM del subconjunto caliente, lo que permite servir el modelo en una unica tarjeta Blackwell de consumo o gama profesional. El pack incluye tambien la tabla PLE de n-gramas cuantizada y una cache KV de 4 bits con respaldo en RAM.

Se trata, por tanto, de un artefacto muy especializado: solo es util si se dispone de hardware Blackwell (sm_120), una GPU de 72 GB y abundante RAM rapida. No es compatible con vLLM, llama.cpp ni NInfer, y su licencia es "other", lo que exige revisar los terminos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (hereda la de Qwen3.8-Flash-Next) con drafter MTP integrado |
| Parametros totales | ~130 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4,5 bpw efectivos con escalas por bloque); tabla PLE en Q8_0 dentro del pack; cache KV en k8v4 |
| Idiomas soportados | ingles |
| Licencia | other |
| Formato de pesos | `.basalt` (contenedor especifico del motor Basalt); checkpoint NVFP4 original disponible por separado |
| Tamano del pack | ~122 GB de pesos NVFP4 (frente a ~81 GiB del pack IQ3_S alternativo) |
| Motor de inferencia | Basalt (fork Strata), kernels sm_120 Blackwell |
| Hardware objetivo | GPU Blackwell sm_120 (RTX 50 / PRO 5000) con 72 GB VRAM y RAM DDR5 abundante |
| API | compatible con OpenAI y Anthropic (`basalt serve --config config.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de unos 130 mil millones de parametros, desarrollado por el equipo Qwen como Qwen3.8-Flash-Next. UkisAI lo sometio a un post-entrenamiento con RL y OPD (on-policy distillation) orientado a tareas de agente de horizonte largo y codigo, penalizando el razonamiento excesivo. El resultado, Swift 1.5, reduce los tokens de pensamiento un 63,4 % respecto al modelo base con una perdida de precision inferior al 1 %, segun los datos del autor del pack. No se dispone de informacion sobre el volumen de tokens de entrenamiento ni la composicion del dataset.

El pack de kaushikvira no modifica los pesos: cada tensor de expertos y denso es el valor NVFP4 de UkisAI re-almacenado en el formato de seccion del contenedor Basalt, sin recalibracion ni recuantizacion. La tabla PLE de n-gramas, de 102 GB en BF16, se cuantizo a e4m3 en una pasada puente y luego a Q8_0 dentro del pack (~48 GB), con cuidado especial en saltar los codigos NaN de e4m3 (0x7F/0xFF). Se integro ademas el drafter MTP en BF16 del modelo base Qwen, verificado por SHA256, para decodificacion especulativa. El motor Basalt mantiene una copia fijada en RAM de todos los expertos y una cache en VRAM del subconjunto caliente; como la decodificacion MoE esta limitada por ancho de banda de memoria, el streaming desde RAM (323 GB/s medidos) resulta viable frente a los 1124 GB/s de HBM de la tarjeta.

## Capacidades

- Generacion de texto y razonamiento en ingles, con perfil de "pensamiento eficiente" que reduce tokens de cadena de pensamiento.
- Codigo y tareas de ingenieria de software de horizonte largo, objetivo declarado del post-entrenamiento de Swift 1.5.
- Comportamiento agéntico y multi-step reasoning, con soporte de tool calling a traves de la API compatible con OpenAI y Anthropic del motor Basalt.
- Procesamiento de imagen y texto (`image-text-to-text`), aunque la model card no detalla la arquitectura de vision.
- Decodificacion especulativa mediante drafter MTP integrado.
- Cache KV elastica de 4 bits con desalojo de conversaciones inactivas a RAM del host.
- Capacidad multilingue limitada al ingles segun la metadata del repositorio.

## Casos de uso

- Atencion al cliente automatizada de largo recorrido: la cache KV elastica con respaldo en RAM permite mantener conversaciones multi-turno y desalojar las inactivas, liberando VRAM para el trafico activo en una tarjeta compartida.
- Agentes de codigo en pipelines de CI/CD: el perfil de razonamiento eficiente de Swift 1.5 reduce el coste por tarea en bucles agénticos largos, y el tool calling compatible con OpenAI facilita la integracion con orquestadores existentes.
- Asistentes sobre documentacion con imagenes: la pipeline `image-text-to-text` permite procesar capturas, diagramas y texto combinados en tareas de soporte tecnico.
- Investigacion sobre cuantizacion NVFP4: el pack sirve como referencia reproducible para medir KLD y acuerdo top-1 frente a alternativas de 3 bits en hardware Blackwell.
- Despliegue en una unica estacion de trabajo: con 72 GB de VRAM y RAM DDR5 rapida se puede servir un MoE de 130 B sin cluster, util para prototipado y evaluacion interna.
- Automatizacion de analisis de repositorios: el contexto agéntico y el razonamiento multi-paso permiten tareas de revision de codigo y generacion de parches, siempre que el contexto disponible sea suficiente (dato no publicado).
- Experimentacion con decodificacion especulativa: el drafter MTP integrado permite evaluar aceleraciones de decodificacion en el motor Basalt.

## Benchmarks y rendimiento

| Metrica | NVFP4 (este pack) | IQ3_S (referencia 3 bits) |
|---|---|---|
| KLD frente a referencia Q8_0 | 0,0680 | 0,1547 |
| Acuerdo top-1 | 91,46 % | 87,25 % |
| Tamano de pesos | ~122 GB | ~81 GiB |

Datos de eficiencia del finetune Swift 1.5 segun el autor del pack: 63,4 % menos tokens de pensamiento que el modelo base con menos del 1 % de perdida de precision. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: 72 GB para los pesos NVFP4 en cache junto con la cache KV; el pack completo son ~122 GB, por lo que el resto de expertos se sirve por streaming desde RAM.
- RAM del host: el sistema medido por el autor dispone de 246 GiB DDR5 con 323 GB/s de ancho de banda medido; se requiere RAM abundante y rapida porque aloja la copia fijada de todos los expertos y la tabla PLE.
- GPU: exclusivamente Blackwell sm_120 (RTX 50 / PRO 5000 class); los kernels del motor son especificos de esa arquitectura.
- No cabe en GPUs de consumo de 24 GB ni en tarjetas Ampere o Hopper con este motor.
- Despliegue: solo mediante el motor Basalt (`basalt serve --config config.json`); no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor senala que la decodificacion esta limitada por ancho de banda de memoria y que el streaming desde RAM es barato en relacion con la HBM de la tarjeta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (Swift-1.5 Qwen3.8-Flash-Next NVFP4 Basalt) | ~130 B MoE | no disponible | `.basalt` | other | Hugging Face, 0 descargas |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4 | ~130 B MoE | no disponible | NVFP4 | other (gated) | Hugging Face, acceso restringido |
| ukisai/Swift-Qwen3.8-Flash-Next (BF16) | ~130 B MoE | no disponible | safetensors BF16 | other | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (base) | ~130 B MoE | no disponible | safetensors BF16 | no disponible | Hugging Face |

## Limitaciones y advertencias

- El formato `.basalt` es propietario del motor Basalt: el pack no se puede cargar en ecosistemas estandar como vLLM, llama.cpp u Ollama.
- Requiere hardware Blackwell sm_120 con 72 GB de VRAM y gran cantidad de RAM rapida; fuera de ese perfil el artefacto es inutilizable.
- Solo soporta ingles segun la metadata del repositorio.
- La licencia es "other" y el checkpoint NVFP4 de origen esta restringido (gated): es imprescindible revisar los terminos del modelo base y del finetune antes de cualquier uso comercial.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas agénticas de horizonte largo donde los errores se acumulan entre pasos.
- No se han publicado evaluaciones de sesgo ni de seguridad en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia: no hay evidencia de uso en produccion ni validacion independiente.
- El drafter MTP proviene del modelo base, no del finetune Swift, por lo que su alineacion con el perfil de razonamiento eficiente no esta documentada.
- La longitud de contexto no se especifica, lo que impide planificar cargas de trabajo de contexto largo con precision.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-basalt
- Modelo base del finetune: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Checkpoint NVFP4 de origen (gated): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor Basalt (fork Strata): https://github.com/jesdga95/basalt
- Parche kv-host-offload: https://github.com/kaushikvira/basalt
