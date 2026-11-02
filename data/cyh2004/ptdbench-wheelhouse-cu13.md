# cyh2004/ptdbench-wheelhouse-cu13

## Resumen

`cyh2004/ptdbench-wheelhouse-cu13` no es un modelo de IA, sino un repositorio de artefactos de empaquetado (un *wheelhouse* offline) publicado en HuggingFace Hub. Contiene los 10 paquetes Python binarios (`wheels`) que necesita la familia de tareas PTDBench `search-r1` para preparar su entorno de ejecución en clústeres sin acceso a Internet. El autor, `cyh2004`, lo mantiene como espejo de dependencias CUDA 13 y del stack RAPIDS/cuVS que de otro modo no se pueden instalar en los *devspaces* del clúster, donde el proxy de salida resetea las conexiones TLS contra `files.pythonhosted.org`.

El problema que resuelve es puramente de reproducibilidad y disponibilidad de dependencias: los entornos de las tareas `tasks/reward/search_r1_nomask/environment/prepare.sh` instalan un conjunto fijado de versiones (`nvidia-nvjitlink`, `nvidia-cublas`, `nvidia-curand`, `nvidia-cusolver`, `nvidia-cuda-nvrtc`, `faiss-gpu-cuvs` y su cierre de dependencias cuVS/RAFT/RMM). Al no haber espejo accesible en el clúster, el autor publica aquí los wheels una sola vez para instalarlos con `pip --no-index --find-links`.

Es relevante ahora porque documenta un patrón habitual en reproducibilidad de *benchmarks* de IA: congelar y espejar el árbol de dependencias binarias (incluidas las ruedas de runtime CUDA) para que los experimentos se puedan reconstruir de forma determinista. No contiene pesos, tokenizador, arquitectura ni ningún otro componente de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un repositorio de wheels Python) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene archivos `.whl` y un `MANIFEST.txt`) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado. Su contenido son 10 *wheels* binarios para `x86_64` con versiones fijadas: `nvidia-nvjitlink` 13.4.92, `nvidia-cublas` 13.8.2.12, `nvidia-curand` 10.4.4.72, `nvidia-cusolver` 12.3.5.3, `nvidia-cuda-nvrtc` 13.4.92, `faiss-gpu-cuvs` 1.15.0, `libcuvs-cu13` 26.6.0, `libraft-cu13` 26.6.0, `librmm-cu13` 26.6.0 y `rapids-logger` 0.2.3. El tamaño del repositorio es de aproximadamente 0,5 GB.

La "innovación" técnica del repositorio es el mecanismo de integridad y regeneración: `MANIFEST.txt` lista cada wheel con su `sha256` tal como aparece en el índice simple de PyPI, y `prepare.sh` incorpora el mismo manifiesto (`WHEELHOUSE_MANIFEST`) de forma que rechaza la ruta offline si algún digest no coincide. El procedimiento de regeneración documentado exige resolver cada URL desde el índice simple de PyPI conservando el fragmento `#sha256=`, descargar con un bucle de reintento con reanudación por archivo (advirtiendo de no combinar `curl --retry` con `-C -`, que trunca al reanudar), verificar el `sha256` y mantener `MANIFEST.txt` y `prepare.sh` byte a byte idénticos.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta *tool calling* ni *function calling* en el sentido de un LLM.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Su función es servir de origen de paquetes para `pip --no-index --find-links`, permitiendo instalar el stack CUDA 13 + FAISS/cuVS sin acceso a la red.
- Proporciona verificación de integridad por `sha256` de cada wheel contra el índice de PyPI.
- Actúa como espejo reproducible para la familia de tareas PTDBench `search-r1` (concretamente `tasks/reward/search_r1_nomask`).

## Casos de uso

- Preparación de entornos en clústeres aislados: ejecutar `prepare.sh` en un *devspace* sin salida a Internet y dejar que `pip --no-index --find-links` resuelva las 10 dependencias fijadas desde este wheelhouse, evitando el fallo de TLS contra `files.pythonhosted.org`.
- Reproducibilidad de experimentos: fijar las versiones exactas de los wheels de runtime CUDA 13 y del cierre cuVS/RAFT/RMM para que dos ejecuciones del benchmark PTDBench `search-r1` usen binarios idénticos.
- Auditoría de cadena de suministro: verificar los `sha256` de `MANIFEST.txt` contra los fragmentos del índice simple de PyPI antes de instalar en producción.
- Replicación en otra infraestructura: reconstruir el wheelhouse en una máquina con salida abierta siguiendo los cuatro pasos de regeneración y volver a subir el repositorio.
- Integración en imágenes de contenedor: copiar los `.whl` en una capa de Docker y ejecutar la instalación offline, reduciendo el tiempo de arranque y la dependencia de la red.
- Evaluación de FAISS con cuVS: instalar `faiss-gpu-cuvs` 1.15.0 junto con `libcuvs-cu13`/`libraft-cu13`/`librmm-cu13` 26.6.0 para tareas de búsqueda vectorial en GPU dentro del pipeline de recompensa de PTDBench.
- Depuración de fallos de resolución de dependencias: comparar el conjunto exacto de wheels instalados con el manifiesto para descartar discrepancias de versión en entornos CUDA 13.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no evalúa ningún modelo; su único dato medible es el tamaño del repositorio (aproximadamente 0,5 GB) y el conjunto de 10 wheels con sus versiones fijadas.

## Requisitos de hardware

- VRAM: no aplica al repositorio en sí; los wheels que contiene son de runtime CUDA 13 y de FAISS/cuVS, por lo que su uso requiere una GPU NVIDIA compatible con CUDA 13.
- GPU recomendadas: no disponible en la información proporcionada; la model card no especifica arquitecturas mínimas ni compute capability.
- Ejecución en GPU de consumo: no disponible; depende de la compatibilidad de CUDA 13 y de los binarios `faiss-gpu-cuvs` con la GPU concreta.
- Plataforma: builds `x86_64` únicamente, según la model card.
- Despliegue: instalación mediante `pip --no-index --find-links`; no aplica a vLLM, llama.cpp, Ollama ni TGI, que son servidores de inferencia de modelos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no es un modelo de IA. Como referencia de categoría, los elementos equivalentes serían otros wheelhouses offline o espejos de paquetes (por ejemplo, espejos internos de PyPI o repositorios de artefactos), pero la información proporcionada no incluye ninguno con el que comparar versiones, tamaño o licencia.

## Limitaciones y advertencias

- No es un modelo: no se puede usar para inferencia, generación de texto ni ninguna tarea de IA.
- La licencia no está declarada en la información disponible, por lo que no se puede confirmar el uso comercial ni la redistribución de los wheels.
- Solo incluye builds `x86_64`; no sirve para arquitecturas ARM ni otras plataformas.
- Las versiones están fijadas a CUDA 13 y a un conjunto concreto de paquetes; cualquier otra combinación de dependencias queda fuera del ámbito del repositorio.
- El repositorio tiene 0 descargas y 0 likes, y no hay pipeline declarado; no hay evidencia de uso o validación por terceros.
- La integridad depende de que `MANIFEST.txt` y `WHEELHOUSE_MANIFEST` en `prepare.sh` se mantengan byte a byte idénticos; una desincronización haría fallar o, peor, aceptar wheels no verificados.
- El procedimiento de descarga advierte de un fallo conocido de `curl` al combinar `--retry` con `-C -`, que trunca archivos al reanudar; una regeneración descuidada puede producir wheels corruptos.
- Riesgo de alucinación, sesgos y limitaciones de contexto o idioma: no aplica, al no ser un modelo de lenguaje.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cyh2004/ptdbench-wheelhouse-cu13
- Índice simple de PyPI para `nvidia-nvjitlink` (referencia de resolución y digests): https://pypi.org/simple/nvidia-nvjitlink/
- Índice simple de PyPI (raíz, para el resto de paquetes): https://pypi.org/simple/
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.
