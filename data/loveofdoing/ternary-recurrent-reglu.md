# loveofdoing/ternary-recurrent-reglu

## Resumen

`loveofdoing/ternary-recurrent-reglu` es un repositorio de pesos empaquetados (packed weights) para un modelo de juguete (toy model) de tipo recurrente con activación ReGLU, no un modelo de lenguaje de producción. El autor lo publica como archivos ejecutables directamente, no como punteros de descarga, codificados de forma sin pérdida para la clase `tfs.packed_reglu.PackedNetwork`. Deriva del "bounded actor/transformer toy" del PR #382 del repositorio `khalildh/ternary`.

El artefacto contiene tres archivos `.npz` (`inline.npz`, `token.npz`, `zero.npz`) de unos 38,7 MB cada uno, que corresponden a tres variantes de una habilidad de suma (addition skill) entre capas de un transformer de cuatro bloques de anchura 128. No hay entrenamiento nuevo ni cambio de checkpoint respecto al PR original; el aporte es el formato de empaquetado y los ejecutores (CPU y Metal GPU) que permiten correr los pesos sin reconstruir el programa original de 443 MB en int64.

Su relevancia es experimental y de investigación: demuestra un esquema de compresión sin pérdida (conexiones en uint32 y signos en 1 bit) para redes con actores acotados y habilidades discretas, con verificación de hashes y round-trips. No es un modelo utilizable para tareas de lenguaje general, generación de texto ni producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de juguete con actores acotados (bounded actors) y bloques ReGLU recurrentes; 4 bloques de anchura 128 |
| Parametros totales | no disponible (el autor no publica el recuento; el programa original reconstruido ocupa 443 MB en int64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | caché de 160 tokens |
| Tipos de cuantizacion | no disponible; empaquetado sin pérdida con conexiones uint32 y signos de 1 bit |
| Idiomas soportados | no disponible (modelo de juguete orientado a una habilidad de suma, no a lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.npz` (archivos ZIP con arrays empaquetados); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer de juguete con cuatro bloques de anchura 128, actores acotados y una caché de 160 tokens, con una única habilidad de suma insertada entre capas del transformer. La activación es ReGLU (ReLU-gated linear unit) y el modelo se describe como recurrente en el sentido de que ejecuta microticks hasta alcanzar un estado de parada (halted state). El ejecutor lee directamente conexiones en uint32 y signos de 1 bit desde los archivos empaquetados, sin reconstruir el programa int64 original de 443 MB; las constantes enteras permanecen en int64 y el workspace de activación ocupa unos 49 MB.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO. El autor indica explícitamente que "no hay entrenamiento nuevo ni cambio de checkpoint" respecto al PR #382; los pesos son los del artefacto original, reempaquetados. La innovación técnica destacable es el formato de empaquetado sin pérdida con verificación mediante `manifest.json` (hashes de archivo, artefacto original y programa decodificado, commit fuente, checkpoint y round-trips exitosos) y la existencia de dos ejecutores: uno en CPU con kernel C genérico compilado con clang, y otro en Metal para GPUs de Apple (`MetalPackedNetwork`).

## Capacidades

- Ejecución de una habilidad de suma (addition skill) entre capas del transformer de juguete.
- Generación de un flujo de tokens completo con recuento de microticks y estado de parada, reportado por el runner.
- Variante de control con habilidad desactivada (`zero.npz`) y variante de baseline de frontera de token (`token.npz`).
- Ejecución en CPU (con `TERN_DEVICE=cpu`, `TERN_NO_GPU=1`) y en GPU Metal de Apple, sin fallback silencioso a CPU en el ejecutor GPU.
- Reconstrucción del programa original para comparación mediante el comando `unpack`.
- No dispone de generación de lenguaje natural, razonamiento general, código, matemáticas avanzadas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Investigación sobre formatos de compresión sin pérdida de pesos: sirve para estudiar cómo empaquetar conexiones en uint32 y signos en 1 bit reduciendo un programa de 443 MB a archivos de 38,7 MB, con verificación de hashes.
- Reproducibilidad de artefactos de investigación: los tres `.npz` permiten reconstruir la comparación del PR #382 sin descargar otro checkpoint ni dataset, usando `tfs.packed_reglu_eval` y `tests/test_packed_reglu.py`.
- Validación de ejecutores alternativos: el par CPU/Metal permite comparar exactitud y rendimiento entre implementaciones sobre los mismos pesos empaquetados.
- Docencia y experimentación con arquitecturas de actores acotados: el modelo de juguete con cuatro bloques de anchura 128 y caché de 160 tokens es manejable para demostrar flujos de microticks y parada.
- Pruebas de integración de pipelines de evaluación: los comandos `unpack` y `eval` generan directorios de referencia (`build/packed_reference`, `build/packed_comparison`) útiles como fixtures en CI.
- Estudio de esquemas de empaquetado aplicables a modelos mayores: el formato y las mediciones documentadas en `docs/tfs_packed_reglu_toy.md` sirven de base para evaluar su extrapolación, aunque el autor advierte que estos archivos no son el modelo de producción ni su colección completa de habilidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta mediciones de tamaño en disco (38.679.082, 38.669.950 y 38.672.060 bytes para `inline.npz`, `token.npz` y `zero.npz`), expansión a unos 137 MB de arrays empaquetados por archivo, programa original de 443 MB en int64 y workspace de activación de unos 49 MB. No hay cifras de MMLU, HumanEval, GSM8K ni latencia/throughput publicadas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el ejecutor CPU no requiere GPU y el ejecutor Metal usa la GPU integrada o dedicada de Apple.
- GPU recomendadas: GPUs de Apple compatibles con Metal (el runner imprime el dispositivo y el número de command buffers completados); no se documentan requisitos para A100, H100 ni RTX 4090.
- Cabe en CPU consumer: sí, con Python 3.11+, NumPy y clang; el kernel C genérico se compila en el primer uso. Se recomienda fijar `TERN_THREADS=2`, `OMP_NUM_THREADS=2`, `OPENBLAS_NUM_THREADS=2` y `VECLIB_MAXIMUM_THREADS=2`.
- Opciones de despliegue: ejecución directa con `python -m tfs.packed_reglu` (CPU) y `python -m tfs.packed_reglu_gpu` (Metal). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles; el autor remite a `docs/tfs_packed_reglu_gpu_toy.md` para pruebas de exactitud, velocidad medida, sobrecarga de memoria y sincronización.

## Comparativa con modelos similares

No disponible. El artefacto es un modelo de juguete con una única habilidad de suma y no existe en la información proporcionada una comparación con modelos de lenguaje de parámetros o contexto comparables. Las únicas referencias internas son las tres variantes del propio repositorio:

| Variante | Propósito | Bytes en disco |
|---|---|---|
| `inline.npz` | Habilidad de suma entre capas del transformer | 38.679.082 |
| `token.npz` | Baseline de habilidad en frontera de token | 38.669.950 |
| `zero.npz` | Control con habilidad desactivada | 38.672.060 |

## Limitaciones y advertencias

- No es un modelo de lenguaje de producción: el autor indica explícitamente que estos archivos no son el modelo completo ni su colección completa de habilidades.
- El modelo de juguete tiene solo cuatro bloques de anchura 128, caché de 160 tokens y una única habilidad de suma; no cubre lenguaje natural, código, matemáticas generales ni visión.
- El tamaño de 38,7 MB por archivo no implica un proceso en ejecución de 38,7 MB: cada ZIP se expande a unos 137 MB de arrays empaquetados y el workspace de activación ronda los 49 MB.
- No hay información sobre sesgos, alucinación ni evaluación de calidad, al no ser un modelo generativo de lenguaje.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- El ejecutor GPU lanza un error si la ejecución en GPU no está disponible; no hace fallback a CPU, lo que puede romper pipelines en entornos sin Metal.
- El ejecutor CPU depende de clang para compilar su kernel C en el primer uso; entornos sin clang o con versiones incompatibles de Python/NumPy pueden fallar.
- Los tests aceptan `TERN_PACKED_REFERENCE` apuntando al directorio de exportación original del PR #382; la ruta independiente de artefacto original se usó para la comparación registrada, pero no se documentan resultados numéricos de esa comparación en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/loveofdoing/ternary-recurrent-reglu
- PR de origen: https://github.com/khalildh/ternary/pull/382
- Documentación del formato y mediciones: `docs/tfs_packed_reglu_toy.md` (en el repositorio del autor)
- Documentación del ejecutor GPU: `docs/tfs_packed_reglu_gpu_toy.md` (en el repositorio del autor)
