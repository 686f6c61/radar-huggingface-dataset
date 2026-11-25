# naualex2023/Hy4-Flash-IQ3_S-DIY

## Resumen

Hy4-Flash-IQ3_S-DIY es una cuantizacion GGUF de tipo IQ3_S del modelo Hy4-Flash de Tencent, publicada por el usuario naualex2023. No se trata de un modelo original, sino de una conversion de pesos pensada para ejecutar un modelo de gran tamano (218.938.353.741 parametros segun los safetensors del modelo base) en hardware de consumo con memoria unificada, concretamente un AMD Strix Halo (Ryzen AI Max+ 395 con iGPU Radeon 8060S y 128 GB de memoria unificada). La fuente exacta de pesos es la release oficial en FP8 de Tencent, verificada byte a byte durante la conversion.

El paquete mezcla cuantizaciones: los expertos van en IQ3_S ponderado con imatrix y la tabla de lookup PLE/engram (per_layer_token_embd) se mantiene en IQ4_NL dentro del mismo fichero, con un promedio global de 3,76 bits por peso. El resultado ocupa 95,71 GiB (102.774.884.768 bytes) repartidos en 1380 tensores. La arquitectura subyacente es hy_v4_flash, que requiere una build especifica de llama.cpp (linea del PR #32517); la version estandar no puede cargarla.

Su relevancia es practica: demuestra que es posible servir un modelo de mas de 200.000 millones de parametros en una maquina de escritorio con memoria unificada, a costa de comprimir los expertos a 3 bits y de aceptar una divergencia medible frente a la referencia en Q8_0. El autor documenta el proceso completo en un "passport" de construccion, con imatrix, pruebas de aceptacion y KLD, lo que lo convierte en un caso interesante para quienes experimentan con cuantizacion extrema y despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hy_v4_flash (transformer con mezcla de expertos; requiere build de llama.cpp con soporte especifico) |
| Parametros totales | 218.938.353.741 (dato del modelo base en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de servicio usa -c 16384) |
| Tipos de cuantizacion | IQ3_S en expertos (ponderado con imatrix), IQ4_NL en tabla PLE/engram; 3,76 BPW global |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero unico, 1380 tensores) |

## Arquitectura y entrenamiento

El modelo base es Hy4-Flash de Tencent, identificado en los tags como hy_v4_flash. La informacion disponible no detalla la arquitectura interna mas alla de que contiene expertos y una tabla de lookup por capa denominada PLE/engram (per_layer_token_embd), que se comporta como una busqueda y no como una matmul. Esa tabla es precisamente la que el autor mantiene en IQ4_NL porque, segun sus pruebas, elevarla a Q5_K no mejora el KLD (1,36/1,53 frente a 1,37/1,54), de modo que la divergencia proviene del nucleo a 3 bits y no de la tabla.

Respecto al entrenamiento, no se dispone de datos sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si esta documentado es el proceso de cuantizacion: la imatrix se calculo con 814 entradas y 2000 chunks de 512 tokens sobre una mezcla de dominios, usando un proxy Q8_0 de alta precision del mismo origen FP8. La aceptacion incluyo 9 de 9 pruebas verificables superadas en CPU (ngl0), ngl8 y ngl20. El KLD frente al proxy Q8_0 es de 1,37 de media en la cabeza wiki y 1,54 en la cabeza de dominio, con una concordancia top-1 del 61/65 %.

## Capacidades

- Generacion de texto conversacional, segun el tag conversational y el pipeline text-generation.
- Razonamiento y generacion de codigo: no hay datos especificos publicados para esta cuantizacion; las capacidades heredadas del modelo base no estan documentadas en la informacion disponible.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas del modelo base no se listan).
- Modo thinking, vision o audio: no disponible.
- Servicio compatible con endpoints (tag endpoints_compatible) a traves de llama-server.

## Casos de uso

- Despliegue local en un equipo Strix Halo: el fichero esta construido para una sola ranura en un Ryzen AI Max+ 395 con 128 GB de memoria unificada; los expertos se ejecutan en CPU con `-ncmoe 42` y la iGPU asume atencion (unos 1,2 GiB) y KV. Es el escenario para el que se diseno.
- Laboratorio de cuantizacion extrema: sirve para estudiar el impacto de bajar los expertos a 3 bits manteniendo la tabla PLE en 4 bits, con metricas de KLD y concordancia top-1 ya publicadas por el autor.
- Servicio de inferencia personal con llama-server: el ejemplo del autor levanta un endpoint en 127.0.0.1:8020 con contexto de 16384 y KV en q8_0, util para prototipos de chat o generacion de texto en local.
- Evaluacion de calidad frente a FP8: al haber sido convertido desde tencent/Hy4-flash-FP8 con verificacion byte a byte, permite comparar salidas del modelo comprimido contra la release oficial en el mismo hardware.
- Pruebas de compatibilidad de llama.cpp: dado que requiere una build con soporte hy_v4_flash (linea del PR #32517), es util para validar esa rama del runtime en configuraciones Vulkan y CPU.
- Experimentacion con memoria unificada AMD: las variables GGML_VK_PREFER_HOST_MEMORY y GGML_VK_ALLOW_SYSMEM_FALLBACK documentadas permiten medir el comportamiento del backend Vulkan cuando el modelo excede el carve-out de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de fidelidad de la cuantizacion:

| Metrica | Valor |
|---|---|
| KLD vs proxy Q8_0 (cabeza wiki) | 1,37 de media |
| KLD vs proxy Q8_0 (cabeza de dominio) | 1,54 de media |
| Concordancia top-1 | 61/65 % |
| Pruebas de aceptacion superadas | 9/9 (CPU ngl0, ngl8, ngl20) |
| Ablacion tabla PLE a Q5_K | KLD 1,36/1,53 (sin mejora apreciable) |

## Requisitos de hardware

- VRAM/RAM: el fichero pesa 95,71 GiB; se necesita un equipo con al menos esa cantidad de memoria accesible. El autor lo orienta a 128 GB de memoria unificada.
- GPU recomendadas: Radeon 8060S (iGPU del Ryzen AI Max+ 395) como objetivo principal; cualquier x86 con RAM suficiente puede ejecutarlo en CPU.
- Cabe en GPU de consumo: no en tarjetas discretas convencionales por el tamano del fichero; si en plataformas de memoria unificada como Strix Halo.
- Despliegue: llama.cpp con soporte hy_v4_flash (PR #32517), llama-server con backend Vulkan. Opciones obligatorias en Strix Halo: `-fit off`, `-ncmoe 42`, `-ngl 20`, `-lm mmap`, `-ctk q8_0 -ctv q8_0`. Recomendadas: `GGML_VK_PREFER_HOST_MEMORY=1` y `GGML_VK_ALLOW_SYSMEM_FALLBACK=1`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hy4-Flash-IQ3_S-DIY | 218.938.353.741 (base) | no disponible | GGUF IQ3_S/IQ4_NL | no disponible | Cuantizacion DIY para Strix Halo |
| tencent/Hy4-flash-FP8 | 218.938.353.741 (base) | no disponible | FP8 | no disponible | Release oficial de referencia, mayor peso |
| tencent/Hy4-flash | 218.938.353.741 | no disponible | safetensors | no disponible | Modelo base original |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits introduce divergencia medible: KLD de 1,37/1,54 y concordancia top-1 del 61/65 % frente al proxy Q8_0.
- Requiere una build no estandar de llama.cpp; la version oficial no carga la arquitectura hy_v4_flash.
- En Strix Halo, `-fit off` es obligatorio: el auto-fitter empaqueta compuestos de mas de 1 GiB en el carve-out de 1 GiB de VRAM y falla.
- Los expertos se ejecutan en CPU por diseno, lo que condiciona la latencia; no hay cifras de throughput publicadas.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas soportados no disponibles.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion disponible.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/naualex2023/Hy4-Flash-IQ3_S-DIY
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Release FP8 de referencia: https://huggingface.co/tencent/Hy4-flash-FP8
- Documentacion de construccion: HY4_PASSPORT.md (incluido en el repositorio)
- Build de llama.cpp con soporte hy_v4_flash: PR #32517 (referenciado en la model card)
