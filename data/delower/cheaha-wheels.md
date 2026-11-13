# Delower/cheaha-wheels

## Resumen

`Delower/cheaha-wheels` no es un modelo de inteligencia artificial, sino un repositorio de artefactos de software alojado en Hugging Face. Concretamente, actua como area de staging de wheels de Python que faltan en el indice de paquetes del cluster UAB Cheaha (RC), con el objetivo de que los trabajos SPARCq puedan instalarlos en tiempo de ejecucion. El unico contenido documentado es `fairscale-0.4.13-py3-none-any.whl`, una dependencia de `boltz==2.2.1`.

El problema que resuelve es de empaquetado y reproducibilidad: FairScale 0.4.13 solo se publica en PyPI como sdist, y el indice de Cheaha no incluye fairscale en absoluto, lo que hacia fallar los jobs de instalacion de Boltz-2 en la fase de pip. El autor construyo el wheel localmente a partir del sdist oficial de PyPI, sin cambios en el codigo fuente, y lo redistribuye para comodidad de instalacion en el cluster.

No hay informacion sobre arquitectura de red neuronal, parametros, contexto, licencia del repositorio ni idiomas soportados. El tamano del repo es de 0.0 GB, con 0 descargas y 0 likes en el momento de la consulta. La relevancia es operativa para usuarios de Cheaha que ejecuten Boltz-2, no como modelo evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; repositorio de wheels de Python) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el repositorio; el wheel redistribuido es FairScale, BSD (Meta AI) |
| Formato de pesos | no disponible (contenido: `fairscale-0.4.13-py3-none-any.whl`) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado ni pesos. Contiene un unico wheel de Python, `fairscale-0.4.13-py3-none-any.whl`, construido localmente a partir del sdist oficial `fairscale-0.4.13.tar.gz` de PyPI, con sha256 `1b797825c427f5dba92253fd0d8daa574e8bd651a2423497775fab1b30cfb768`, coincidente con el digest registrado en PyPI, y sin modificaciones en el codigo fuente. FairScale es Python puro en esta build (su extension CUDA es opcional y no se compilo), de ahi la etiqueta `py3-none-any`. El sha256 del wheel es `a90aa52bf1414caa6865ab92e367640090c6e18170ddf1c60665e52d32b5c541`.

El proposito declarado es servir de staging para dependencias ausentes en el indice del cluster Cheaha, de modo que los jobs SPARCq puedan instalarlas en runtime. La instalacion sugerida es `pip install https://huggingface.co/Delower/cheaha-wheels/resolve/main/fairscale-0.4.13-py3-none-any.whl`.

## Capacidades

- No es un modelo generativo: no realiza generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Su funcion es distribuir un wheel de Python (`fairscale` 0.4.13) para su instalacion via pip en el cluster Cheaha.
- Permite resolver la dependencia de `boltz==2.2.1` en jobs SPARCq que fallaban en la fase de pip por ausencia de fairscale en el indice del cluster.

## Casos de uso

- Instalacion de Boltz-2 en Cheaha: dentro de un job SPARCq, ejecutar `pip install https://huggingface.co/Delower/cheaha-wheels/resolve/main/fairscale-0.4.13-py3-none-any.whl` antes de instalar `boltz==2.2.1`, evitando el fallo de pip por falta de fairscale en el indice del cluster.
- Reproducibilidad de entornos: fijar el wheel por su sha256 (`a90aa52bf1414caa6865ab92e367640090c6e18170ddf1c60665e52d32b5c541`) en scripts de aprovisionamiento para garantizar que se instala exactamente el artefacto construido desde el sdist oficial.
- Despliegue offline o en redes restringidas: usar el wheel como artefacto local cuando el nodo de computo no tenga acceso a PyPI ni al indice de Cheaha.
- Cacheo en imagenes de contenedor: incorporar el wheel en una imagen base de Singularity o Docker para que los jobs no dependan de descargas en runtime.
- Auditoria de dependencias: verificar que el wheel corresponde al sdist oficial de PyPI comparando digests antes de incorporarlo a un pipeline.
- Plantilla para otras dependencias ausentes: reutilizar el patron (build local desde sdist, publicacion en un repo de staging, instalacion por URL directa) para otros paquetes que falten en el indice del cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; no es un modelo de inferencia.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Despliegue: instalacion via `pip` desde URL directa del wheel; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no aplica; el coste es el de una instalacion de paquete Python.
- Requisito practico: acceso de red al repositorio de Hugging Face desde el nodo de computo, o bien el wheel descargado previamente.

## Comparativa con modelos similares

No disponible. No es un modelo, por lo que no existen alternativas comparables en la misma categoria de tarea. Como referencia del artefacto redistribuido, FairScale 0.4.13 es una libreria de utilidades de entrenamiento distribuido de Meta AI bajo licencia BSD; su distribucion habitual es el sdist en PyPI, no un wheel en un repositorio de staging.

## Limitaciones y advertencias

- El repositorio no declara licencia propia; la licencia del contenido redistribuido (FairScale) es BSD, segun la model card.
- El wheel no incluye la extension CUDA de FairScale, por lo que no cubre funcionalidades que dependan de ella.
- Depende de la disponibilidad del repositorio en Hugging Face; si se elimina o se hace privado, los jobs que instalen por URL fallaran.
- No hay garantia de mantenimiento ni de versionado mas alla del artefacto documentado; el repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el 2026-11-13.
- No debe tratarse como un modelo evaluable: no hay pesos, tokenizador, configuracion ni datos de entrenamiento.
- Para produccion, conviene verificar el sha256 del wheel antes de instalarlo y, si es posible, alojarlo en un espejo interno controlado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Delower/cheaha-wheels
- Wheel directo: https://huggingface.co/Delower/cheaha-wheels/resolve/main/fairscale-0.4.13-py3-none-any.whl
- FairScale en PyPI (sdist de origen): https://pypi.org/project/fairscale/0.4.13/
- Repositorio de FairScale (Meta AI): https://github.com/facebookresearch/fairscale
- Boltz (dependencia que motiva el wheel): https://pypi.org/project/boltz/2.2.1/
