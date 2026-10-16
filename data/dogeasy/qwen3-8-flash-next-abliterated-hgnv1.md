# DogEasy/Qwen3.8-Flash-Next-Abliterated-HGNv1

# Qwen3.8-Flash-Next-Abliterated-HGNv1

## Resumen

Qwen3.8-Flash-Next-Abliterated-HGNv1 es una compilacion cuantizada en formato HGN de un checkpoint de tipo "abliterated" (sin mecanismos de rechazo) derivado de Qwen3.8-Flash-Next. Lo publica el usuario DogEasy y su modelo base directo es `windowsxp811203/Qwen3.8-Flash-Next-Abliterated`, a su vez un checkpoint BF16 al que se le ha eliminado la direccion de rechazo. El pipeline declarado es `image-text-to-text`, de modo que se trata de un modelo multimodal con torre de vision, no unicamente de texto.

El rasgo diferencial de esta ficha no es el modelo en si, sino el metodo de cuantizacion. Cuantizar de forma ingenua un checkpoint abliterated difumina precisamente la edicion direccional que lo define, asi que este build cuantiza "alrededor" de la direccion de rechazo y despues repara los expertos contra ella: recupera la direccion compartida `r` a partir del overlay oficial de Halogen y del checkpoint BF16 (coseno minimo entre anclas de 0,99995), convierte los pesos a HGN-HQ (expertos enrutados en Q4CP, densos en q8g32) y parchea los 49 tensores `mlp.experts.down_proj` para preservar `rᵀQ ≈ rᵀW_ablit`.

Es relevante ahora por dos motivos. Primero, porque documenta con datos medidos (residual direccional maximo de 0,0201 sobre un umbral de fallo de 0,05) como sobrevive una edicion de tipo `W_ablit = (I − λ r rᵀ) W_stock` con λ=1.5 al paso por cuantizacion de 4 bits. Segundo, porque no es un checkpoint estandar: no hay safetensors ni GGUF, solo archivos `.hgn` que requieren un motor compatible HGN, y fue validado sobre un Ryzen AI Max+ 395 (gfx1151) con ROCm 10.0.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), capas de atencion lineal, cabeza MTP (multi-token prediction) y torre de vision. 48 capas de tronco mas 1 capa MTP |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero la model card no publica el reparto de expertos) |
| Longitud de contexto | no disponible |
| Dimension oculta | 2560 (deducida de la forma del vector de direccion de rechazo `r`, (2560,) float32) |
| Tipos de cuantizacion | Expertos enrutados: Q4CP con codebook `universal` (ponderacion x², sin imatrix). Overlay denso: q8g32. MTP: q8g64. Tabla PLE: FP8 E4M3 con escala global. Torre de vision: BF16. Excepciones densas de pocas filas: BF16 |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | Qwen Community License 1.0 (`license: other`, heredada del modelo base) |
| Formato de pesos | `.hgn` (formato propietario HGN). Sin safetensors ni GGUF |
| Modalidad | image-text-to-text |
| Tamano del repositorio | 132,7 GB |
| Descargas / likes | 69 descargas, 1 like |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer MoE con 48 capas de tronco y una capa adicional MTP. La presencia de tensores `linear_attn.out_proj` entre las anclas de recuperacion indica capas de atencion lineal, y los tensores `shared_expert.down_proj` confirman un esquema de mezcla de expertos con al menos un experto compartido. El repositorio incluye una torre de vision en BF16 y una cabeza MTP en q8g64, esta ultima utilizable como cabecera de borrador para decodificacion especulativa. No hay datos publicados sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

Lo que si esta documentado es la intervencion sobre el checkpoint base. El modelo original elimina el rechazo ortogonalizando 151 tensores que escriben en el flujo residual contra una direccion capturada, segun la formula `W_ablit = (I − λ r rᵀ) W_stock` con λ=1.5. Este build aplica un proceso de tres pasos: recuperacion de la direccion compartida `r` usando 12 tensores ancla repartidos por las 48 capas (todos `self_attn.o_proj`, `linear_attn.out_proj` y `shared_expert.down_proj`), con coseno minimo entre anclas de 0,99995, mediana s1/s2 de aproximadamente 57 y estimaciones de λ por ancla entre 1,4994 y 1,5001; conversion HGN-HQ mediante el pipeline `flashnext2hgn`; y reparacion de expertos que preserva la direccion, flipando niveles Q4 adyacentes solo cuando eso reduce el error direccional y sin empujar la proyeccion hacia cero (lo que degradaria λ=1.5 a un valor proximo a 1).

## Capacidades

- Generacion de texto y razonamiento en ingles y chino.
- Comprension de imagenes: la torre de vision se distribuye en BF16 dentro del repositorio y el pipeline declarado es `image-text-to-text`.
- Decodificacion especulativa: incluye un sidecar MTP en q8g64 que puede actuar como cabeza de borrador.
- Ejecucion en hardware AMD gfx1151 (Strix Halo) mediante ROCm 10.0.0.
- Comportamiento sin rechazo: el checkpoint ha sido abliterated, por lo que no aplica mecanismos de negativa aprendidos durante el alineamiento.
- Pesos derivados y redistribucion permitidos por la Qwen Community License 1.0.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidad de audio: no disponible.

## Casos de uso

- Procesamiento de documentos con imagenes: al ser un modelo `image-text-to-text` con torre de vision en BF16, puede recibir paginas escaneadas o capturas y producir texto asociado dentro de un pipeline de extraccion de datos.
- Etiquetado y descripcion de imagenes a escala: la torre de vision se mantiene en BF16 mientras el resto del modelo va cuantizado, lo que permite ejecutar clasificacion o descripcion sobre lotes de imagenes en un unico equipo con memoria unificada.
- Asistente de codigo en local sobre hardware Strix Halo: es uno de los pocos checkpoints validados explicitamente en gfx1151 con ROCm 10.0.0, lo que lo hace util para entornos de desarrollo sin GPU discreta.
- Investigacion sobre ablacion y cuantizacion: el repositorio publica la direccion de rechazo recuperada (`direction.npy`, (2560,) float32), el manifest de recuperacion y el informe por tensor de la reparacion de expertos, lo que permite reproducir y auditar como sobrevive una edicion direccional a una cuantizacion de 4 bits.
- Validacion de runtimes HGN: sirve como build de referencia para comprobar que `halogen-flash-server` o `gfx1151-engine` cargan correctamente la pila base + overlay + MTP + vision y reportan en arranque `dense: 8-bit (q8g32) weights present, few-row bf16 gemv on`.
- Creacion de derivados: la licencia permite redistribucion y pesos derivados, de modo que puede usarse como punto de partida para fine-tuning o para nuevas cuantizaciones en otros formatos (previa conversion desde el checkpoint BF16, no desde los `.hgn`).
- Despliegue en entornos controlados que requieran respuestas sin filtros de rechazo, asumiendo las advertencias de la seccion de limitaciones.
- Asistencia bilingue ingles-chino para usuarios o equipos que trabajen en esos dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se ha re-ejecutado ningun benchmark sobre los pesos cuantizados y que las cifras de capacidad y rechazo pertenecen al build BF16 de origen.

Lo que si se publica son metricas de verificacion del propio proceso de cuantizacion, medidas sobre los artefactos distribuidos:

| Metrica | Valor | Umbral |
|---|---|---|
| Tensores de experto reparados | 49 | 48 tronco + 1 MTP |
| Ratio de residual direccional maximo | 0,0201 | <= 0,05 (fallo duro) |
| Ratio de residual direccional medio | 0,0200 | — |
| Regresiones de error ponderado frente a linea base absmax | 0 | 0 (restauracion fail-closed) |
| Fraccion maxima de flip de nibble | 0,154 % | — |
| Coseno minimo entre anclas en la recuperacion de `r` | 0,99995 | — |
| Estimacion de λ por ancla | 1,4994 – 1,5001 | λ configurado = 1,5 |

## Requisitos de hardware

- Espacio en disco requerido: 132,7 GB para el repositorio completo. La suma de los pesos de produccion (base 115,5 GiB + overlay 4,83 GiB + MTP 90 MiB + vision 858 MiB) ronda los 121,3 GiB; el overlay de auditoria `halogen.overlay.hgn` anade 2,31 GiB adicionales que no deben cargarse en produccion.
- Memoria para inferencia: no disponible de forma oficial. Como referencia, los pesos de produccion suman aproximadamente 121 GiB, a lo que hay que anadir la cache KV (desconocida al no publicarse la longitud de contexto) y las activaciones.
- GPU recomendadas: no disponible. El unico entorno declarado como validado es un Ryzen AI Max+ 395 (gfx1151, Strix Halo) con memoria unificada.
- Compatibilidad con GPU de consumo: no disponible. El tamano de los pesos excede la VRAM de cualquier GPU de consumo actual (por ejemplo, una RTX 4090 con 24 GB), por lo que encaja mejor en plataformas de memoria unificada o en nodos multi-GPU.
- Opciones de despliegue: `halogen-flash-server` o `gfx1151-engine` con soporte HGN-HQ (overlay q8g32). No es compatible con transformers, vLLM ni llama.cpp, y no se distribuyen safetensors ni GGUF.
- Pila de ejecucion: ROCm 10.0.0 (TheRock stack estable). Las pilas 10.1 y 10.2 fallan una sonda rocBLAS SGEMM con M=640, N=1, K=2560 segun la model card.
- Orden de carga obligatorio: base `.hgn` -> `.overlay.hgn` (q8g32 principal) -> `-mtp.hgn` -> `-vision.hgn`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye otros modelos comparables de la misma categoria en formato HGN, por lo que la unica comparacion posible es contra el checkpoint BF16 del que deriva este build.

| Modelo | Formato | Cuantizacion | Tamano | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| DogEasy/Qwen3.8-Flash-Next-Abliterated-HGNv1 | `.hgn` | Q4CP + q8g32 + q8g64 + FP8 + BF16 | 132,7 GB de repositorio | en, zh | Qwen Community License 1.0 | Requiere motor HGN; reparacion direccional verificada |
| windowsxp811203/Qwen3.8-Flash-Next-Abliterated | bf16 | ninguna (BF16) | no disponible | en, zh | Qwen Community License 1.0 | Modelo base; es el que conserva las cifras de capacidad y rechazo publicadas |
| Otras alternativas de tamano o tarea similares | — | — | — | — | — | no disponible |

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado el mecanismo de rechazo mediante ortogonalizacion direccional con λ=1.5. Esto implica que el modelo puede generar contenido que los checkpoints alineados rechazarian. Cualquier despliegue en produccion necesita controles externos de moderacion.
- El proceso de abliteracion puede degradar capacidades generales del modelo base. La model card no publica cifras de capacidad del build abliterated ni de este build cuantizado.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de ningun otro benchmark sobre los pesos cuantizados. Las afirmaciones de calidad del modelo base no son transferibles automaticamente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Al tratarse de un modelo multimodal, el riesgo se extiende a la descripcion de imagenes.
- Cuantizacion de 4 bits en los expertos enrutados (Q4CP): introduce perdida de precision respecto al BF16 de origen, mas alla de la reparacion direccional que solo garantiza la preservacion de la direccion de rechazo, no la fidelidad global de los pesos.
- Restricciones de uso comercial: la licencia es la Qwen Community License 1.0. La model card menciona que hay "dos condiciones que leer antes de desplegar", pero el texto proporcionado esta truncado. Hay que consultar el archivo LICENSE en el repositorio del modelo base antes de cualquier uso comercial.
- Idiomas limitados a ingles y chino. No hay soporte declarado de castellano ni de otras lenguas.
- Longitud de contexto desconocida: no se puede planificar el consumo de cache KV ni garantizar el comportamiento en conversaciones largas.
- Compatibilidad de runtime muy restringida: solo motores HGN. No funciona con transformers, vLLM ni llama.cpp, lo que limita el ecosistema de herramientas disponible.
- Peligro de configuracion erronea: cargar `.halogen.overlay.hgn` despues del overlay principal q8g32 sobrescribe los tensores densos de 8 bits con versiones de 4 bits derivadas de Halogen y anula la ruta HGN-HQ.
- Dependencia de version de ROCm: solo 10.0.0 esta declarada como pila valida. Las versiones 10.1 y 10.2 fallan una sonda rocBLAS.
- El nombre del modelo sugiere una linea Qwen que no se corresponde con ningun repositorio oficial en la informacion disponible; el checkpoint procede de una cadena de derivados de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DogEasy/Qwen3.8-Flash-Next-Abliterated-HGNv1
- Modelo base (checkpoint abliterated BF16): https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated
- Licencia (Qwen Community License 1.0): https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated/blob/main/LICENSE
- Runtime halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server
- Runtime Qwenox: https://github.com/IIIIIllllIIIIIlllll/qwenox
- Motor gfx1151-engine: https://github.com/IIIIIllllIIIIIlllll/gfx1151-engine
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo, su arquitectura o sus benchmarks; los unicos enlaces recuperados tratan sobre tecnicas de meditacion mindfulness y no guardan relacion con la ficha.
