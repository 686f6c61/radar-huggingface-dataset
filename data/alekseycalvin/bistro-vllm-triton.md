# AlekseyCalvin/bistro-vllm-triton

## Resumen

`AlekseyCalvin/bistro-vllm-triton` no es un modelo de lenguaje, sino un repositorio de artefactos de compilación: cachés JIT de Triton precompiladas para vLLM, empaquetadas en archivos `.tgz`. Cada archivo contiene los kernels compilados y los launchers que genera una carga concreta de vLLM sobre una GPU específica, de modo que una primera sesión de inferencia se salta la fase de compilación y autotuning de Triton. El autor lo publica como soporte del proyecto "SLM Bistro".

La clave de cada archivo es un SHA-256 calculado sobre el commit fijado de vLLM, el checkpoint y su revisión, la GPU, las versiones de torch/CUDA/Triton, el tag de Python, las opciones del motor y los interruptores de plugins (según `bistro_local/engine/vllm_remote.py: _triton_cache`). La aplicación valida la clave y cada ruta del archivo antes de usarlo, lo que actúa como control de integridad y de compatibilidad.

Su relevancia es operativa: en entornos efímeros como Google Colab, la compilación JIT de Triton añade latencia y consumo de CPU en el primer arranque. Distribuir la caché precompilada elimina ese coste. El repositorio está etiquetado como `kernels` y tiene un tamaño de 0,0 GB, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; son cachés JIT de kernels Triton para vLLM) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible como spec del repo; el artefacto documentado se generó con FP8 (Marlin FP8) sobre el checkpoint referenciado |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; los artefactos son archivos `.tgz` con la caché Triton (kernels compilados y launchers) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento: el repositorio aloja cachés de compilación. Cada `.tgz` corresponde a la salida del compilador JIT de Triton al cargar vLLM con una configuración determinada. La clave SHA-256 se calcula sobre el commit de vLLM, el checkpoint y su revisión, la GPU, las versiones de torch, CUDA y Triton, el tag de Python, las opciones del motor y los interruptores de plugins, de forma que cualquier cambio en esos factores invalida la caché.

El único artefacto documentado en la model card es `bda740b11d4483196f7748650e436bdffd7defd8333fe1ff6b502aeb18f46ff3.tgz`, construido a partir de `Sohailhosseini/Ornith-1.5-9B-FP8` en la revisión `d30f70d5`, sobre una Colab gratuita con T4 (sm75, fp16), vLLM en el commit `59d58fd`, torch 2.14.1+cu130, Triton 3.8, con Marlin FP8, backend de atención `TRITON_ATTN` y CUDA graphs de decodificación completa. La innovación técnica es de empaquetado y validación: la aplicación comprueba la clave y cada ruta del archivo antes de reutilizarlo.

## Capacidades

- Distribución de cachés JIT de Triton precompiladas para vLLM, evitando la compilación y el autotuning en el primer arranque.
- Vinculación estricta de cada caché a un entorno concreto mediante SHA-256 sobre commit de vLLM, checkpoint, revisión, GPU, versiones de torch/CUDA/Triton, tag de Python, opciones del motor y plugins.
- Validación de la clave y de cada ruta interna del archivo antes de su uso, como control de integridad.
- Soporte del backend de atención `TRITON_ATTN` y de CUDA graphs de decodificación completa en el artefacto documentado.
- Compatibilidad con cuantización FP8 mediante Marlin FP8 en el artefacto documentado.
- No ofrece generación de texto, razonamiento, código, visión, tool calling ni capacidades multilingües: no es un modelo.

## Casos de uso

- Arranque rápido en Google Colab: cargar la caché correspondiente a la T4 (sm75, fp16) para que la primera sesión de vLLM omita la compilación JIT de Triton y reduzca el tiempo hasta la primera inferencia.
- Servicios de inferencia efímeros: en contenedores o instancias que se recrean con frecuencia, reutilizar la caché evita repetir el autotuning en cada arranque.
- Reproducibilidad de despliegues: fijar commit de vLLM, revisión del checkpoint y versiones de torch/CUDA/Triton para que la clave SHA-256 coincida y el artefacto sea reutilizable de forma determinista.
- Integración en pipelines de CI: validar que la caché publicada corresponde al entorno de destino comparando la clave calculada por la aplicación con el nombre del archivo.
- Distribución de configuraciones de referencia: servir como plantilla para publicar cachés de otros checkpoints, GPUs o backends de atención siguiendo el mismo esquema de clave.
- Diagnóstico de incompatibilidades: si la validación de la clave falla, identificar qué factor del entorno (GPU, versión de Triton, commit de vLLM u opciones del motor) ha cambiado respecto al artefacto publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El artefacto documentado se generó en una GPU T4 de Colab (sm75) en fp16; esa caché solo es válida para ese perfil de hardware y software.
- VRAM estimada para inferencia: no disponible en la información proporcionada (depende del checkpoint `Sohailhosseini/Ornith-1.5-9B-FP8`, no del repositorio de cachés).
- GPU recomendadas: no disponibles; la única documentada es la T4 (sm75). Cualquier otra GPU requiere una caché con clave distinta.
- Cabe en GPU de consumo: la T4 es una GPU de consumo/cloud de gama baja, pero no hay datos sobre otras GPU de consumo.
- Opciones de despliegue: vLLM (commit `59d58fd` en el artefacto documentado), con backend de atención `TRITON_ATTN` y Marlin FP8.
- Latencia y throughput: no disponibles; el beneficio esperado es la eliminación del tiempo de compilación y autotuning en el primer arranque, sin cifras publicadas.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `AlekseyCalvin/bistro-vllm-triton` | Cachés JIT de Triton para vLLM | no aplica | no aplica | Apache 2.0 | Vinculación por SHA-256 a entorno, GPU y versiones |
| Compilación JIT en el primer arranque | Mecanismo nativo de vLLM/Triton | no aplica | no aplica | según vLLM/Triton | Coste de compilación y autotuning en cada arranque nuevo |
| Caché local persistente del usuario | Directorio de caché de Triton | no aplica | no aplica | no aplica | No portable entre máquinas ni reproducible sin control de clave |

No se dispone de información sobre otros repositorios de cachés precompiladas comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni admite prompts; confundirlo con un modelo lleva a un uso incorrecto.
- Cada caché es válida únicamente para la combinación exacta de commit de vLLM, checkpoint y revisión, GPU, versiones de torch/CUDA/Triton, tag de Python, opciones del motor y plugins. Cualquier cambio invalida el artefacto.
- Solo hay un artefacto documentado (T4, fp16, Marlin FP8, `TRITON_ATTN`); no hay cobertura publicada para otras GPU, precisiones o backends.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso ni de validación por terceros.
- El tamaño del repo es de 0,0 GB, lo que no permite verificar el contenido real de los archivos publicados.
- La licencia Apache 2.0 permite uso comercial, pero no cubre las licencias del checkpoint referenciado (`Sohailhosseini/Ornith-1.5-9B-FP8`), de vLLM ni de Triton, que deben verificarse por separado.
- No hay información sobre sesgos, alucinación o cobertura idiomática, al no tratarse de un modelo generativo.
- Ejecutar kernels compilados de terceros implica un riesgo de seguridad; la validación de rutas descrita mitiga parte del riesgo, pero conviene auditar el contenido antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AlekseyCalvin/bistro-vllm-triton
- Checkpoint referenciado en el artefacto documentado: https://huggingface.co/Sohailhosseini/Ornith-1.5-9B-FP8
- vLLM (commit `59d58fd` en el artefacto documentado): https://github.com/vllm-project/vllm
- Triton (versión 3.8 en el artefacto documentado): https://github.com/triton-lang/triton
- No se han encontrado en la búsqueda web papers, blogs, repos de código de la aplicación ni demos adicionales.
