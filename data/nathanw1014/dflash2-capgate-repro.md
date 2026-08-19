# nathanw1014/dflash2-capgate-repro

## Resumen

Este repositorio es un fixture de prueba deliberadamente roto, no un modelo utilizable. `nathanw1014/dflash2-capgate-repro` contiene una unica copia byte a byte del modelo drafter DFlash v1 de inco.ai para Qwen3.8-27B, al que se le ha inyectado una clave de metadatos (`dflash.selector_top_k = 16`) que declara capacidades DFlash2 que el grafo de decodificacion no implementa. El objetivo es reproducir un fallo silencioso de llama.cpp en la ruta de speculative decoding y verificar su correccion (PR #27342).

El modelo tiene 1.730.213.120 parametros y se distribuye en formato GGUF, con un tamano de repositorio de 1,8 GB. La licencia es MIT. Esta pensado exclusivamente para entornos de desarrollo y depuracion: sin la puerta de capacidad adecuada, produce una degradacion silenciosa de 2,4x en velocidad con salida correcta; con ella, cae limpiamente a la ruta DFlash v1. No debe usarse en produccion ni para servir inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash v1 (block diffusion draft model), corrompido con metadatos DFlash2 |
| Parametros totales | 1.730.213.120 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es el drafter DFlash v1 de inco.ai, un modelo ligero de difusion por bloques disenado para speculative decoding. DFlash genera multiples tokens candidatos en una unica pasada hacia adelante, condicionando el draft en caracteristicas de contexto extraidas del modelo objetivo. La arquitectura se describe en el paper arXiv 2602.06036.

Este repositorio concreto no anade ni modifica tensores: es una copia identica del modelo original con una unica clave de metadatos inyectada en el archivo GGUF. Esa clave (`dflash.selector_top_k = 16`) hace que el host de llama.cpp active la ruta DFlash2, pero como no se anadieron los tensores de selector correspondientes, el grafo de decodificacion no construye el lattice de seleccion. No hay entrenamiento propio ni datos de entrenamiento en este repositorio.

## Capacidades

- Reproducir un fallo de especificacion en la ruta DFlash2 de llama.cpp.
- Demostrar la diferencia de comportamiento entre una build sin capability gate (degradacion silenciosa) y una con el fix (fallback limpio a DFlash v1).
- Servir como caso de prueba para el PR #27342 de llama.cpp.
- Verificar la correcta gestion de metadatos de capacidad en el cargador de GGUF.
- Probar la integridad del grafo de decodificacion ante metadatos inconsistentes.
- Validar el comportamiento de `--spec-type draft-dflash` en builds de desarrollo.

## Casos de uso

- Depuracion de speculative decoding en llama.cpp: el repositorio permite reproducir el fallo exacto (0/1556 drafts aceptados, 4,77 t/s) en una GPU gfx1151/RADV con Vulkan.
- Validacion de fixes en el cargador de GGUF: al aplicar la rama `dflash2-capgate` (commit `0b0f35d0e`), el mismo archivo produce un warning de arranque y cae a la ruta DFlash v1 con 162/295 drafts aceptados y 25,6 t/s.
- Test de regresion en CI/CD: el generador de 30 lineas y el script adicional para el caso DSV4-backbone viven en la rama `dflash2-capgate-repro` del fork de llama.cpp.
- Verificacion de compatibilidad de metadatos entre el cargador GGUF y el grafo de decodificacion.
- Evaluacion de rendimiento de la ruta DFlash v1 frente a DFlash2 en hardware AMD (RADV).
- Estudio del comportamiento de fallback ante configuraciones invalidas sin perdida de correccion en la salida.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la model card y se refieren a una medicion concreta en gfx1151/RADV (Vulkan) con un target Qwen3.8-27B:

| Escenario | Drafts aceptados | Velocidad |
|---|---|---|
| Sin capability gate (ruta DFlash2 rota) | 0/1556 | 4,77 t/s |
| Con capability gate (fallback a DFlash v1) | 162/295 | 25,6 t/s |
| Speculation desactivada | - | ~11,4 t/s |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- El archivo GGUF Q8 pesa 1,8 GB, por lo que cabe en cualquier GPU consumer con 4 GB o mas de VRAM.
- La medicion reportada se realizo en una AMD Strix Halo (Ryzen AI Max+ 395 / Radeon 8060S / gfx1151) con RADV/Vulkan.
- El repositorio `strix-halo-llamacpp` del mismo autor incluye fixes de Flash Attention y MoE-prefill para este hardware.
- Para reproduccion del fallo se requiere una build de llama.cpp con soporte DFlash2 y `--spec-type draft-dflash`.
- No hay datos de latencia o throughput adicionales a los reportados en la model card.
- No se recomienda ningun despliegue en produccion: es un test fixture deliberadamente corrupto.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo independiente, sino una copia modificada de un drafter existente (DFlash v1 de inco.ai) con metadatos inconsistentes. Su unica funcion es servir como caso de prueba para un bug concreto de llama.cpp. Los modelos comparables serian el DFlash v1 original y el DFlash 2 de inco.ai, ambos disponibles bajo licencia MIT, pero no existen datos de comparativa directa en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente corrupto: no usar para servir inferencia ni para ninguna tarea de produccion.
- La clave de metadatos `dflash.selector_top_k = 16` declara un lattice de seleccion que no existe en los tensores del grafo.
- Sin el capability gate, produce una degradacion silenciosa de rendimiento (2,4x mas lento) sin errores ni warnings.
- La salida generada es correcta incluso en el caso roto, lo que dificulta la deteccion del fallo sin medir rendimiento.
- Solo es util en entornos de desarrollo con builds especificas de llama.cpp (rama `dflash2-capgate`).
- No hay informacion sobre idiomas soportados, contexto maximo ni capacidades linguisticas.
- El repositorio tiene 0 descargas y 0 likes; es un fixture de desarrollo, no un modelo publicado para uso general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nathanw1014/dflash2-capgate-repro
- Blog de inco.ai sobre DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash (z-lab): https://github.com/z-lab/dflash
- Paper DFlash en arXiv: https://arxiv.org/abs/2602.06036
- Fork de llama.cpp con la rama de reproduccion: https://github.com/Nathanw1014/llama.cpp/tree/dflash2-capgate-repro/dflash2-repro
- Toolbox para Strix Halo del mismo autor: https://github.com/Nathanw1014/strix-halo-llamacpp/blob/master/README.md
