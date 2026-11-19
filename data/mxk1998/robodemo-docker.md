# mxk1998/RoboDemo-Docker

## Resumen

RoboDemo-Docker no es un modelo de lenguaje en sentido estricto, sino una imagen Docker de evaluación para el benchmark de robótica RoboDemo. El repositorio, publicado por el usuario mxk1998 en Hugging Face, contiene un contenedor Linux amd64 con el entorno Python/CUDA/PyTorch fijado y el código fuente del simulador Imitator Game. Los pesos de los modelos y los activos del dataset se montan por separado, por lo que la imagen actúa como infraestructura reproducible para evaluar los cinco checkpoints publicados de RoboDemo (`c15`, `full50`, `c30`, `c45` y `c15-wo`).

La imagen está pensada para ejecutarse en hosts Linux x86-64 con GPU NVIDIA, Docker y NVIDIA Container Toolkit. El flujo documentado permite cargar la imagen por streaming desde Hugging Face, montar el directorio de activos compartidos (que incluye `IG-10K-Dataset/`, `maniskill/`, `Qwen3-VL-4B-Instruct/`, `vjepa2/` y `vjepa2-ac-vitg.pt`) y lanzar la evaluación de un checkpoint mediante Docker Compose. El tamaño del repositorio es de 11,7 GB.

Su relevancia es práctica: estandariza el entorno de evaluación de un benchmark de robótica y reduce la variabilidad entre ejecuciones. No obstante, la validación publicada solo cubre un build limpio y comprobaciones de importación de paquetes en CPU, sin verificar compatibilidad de renderizado por GPU. La licencia es `other`, con nombre `upstream-component-licenses`, y los componentes empaquetados conservan sus licencias originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (imagen Docker de evaluación, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (`upstream-component-licenses`) |
| Formato de pesos | imagen Docker (`.tar.gz`); checkpoints en `pytorch_model.pt` |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| ID del repositorio | mxk1998/RoboDemo-Docker |
| Autor | mxk1998 |
| Pipeline | robotics |
| Tags | robotics, docker, evaluation |
| Plataforma | Linux amd64 |
| Entorno | Python/CUDA 12.4/PyTorch fijado |
| Simulador incluido | Imitator Game |
| Tamano del repo | 11,7 GB |
| Descargas | 0 |
| Likes | 0 |
| Creado | 2026-11-19 |
| Actualizado | 2026-11-19 |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: RoboDemo-Docker es una imagen de contenedor, no un modelo entrenado. La imagen empaqueta un entorno de ejecución con versiones fijadas de Python, CUDA 12.4 y PyTorch, junto con el código fuente del simulador Imitator Game. Los activos del benchmark y los pesos de los checkpoints se montan desde el host en tiempo de ejecución, lo que mantiene la imagen independiente de los datos y permite reutilizarla con distintos checkpoints.

El flujo de evaluación se articula mediante Docker Compose: se define `ROBODEMO_HOST_ASSETS`, `ROBODEMO_HOST_OUTPUTS` y `ROBODEMO_GPU`, se ejecuta una comprobación de entorno con `check_environment.py --assets` y después se lanza el script `scripts/evaluate/c15-single.sh` (o el equivalente para otros checkpoints) con parámetros como `--checkpoint`, `--data-root`, `--workers-per-gpu`, `--max-episodes` y `--output`. La guía de escalado recomienda un worker en GPUs de 32 GB y dos en GPUs de 80 GB, según mediciones de memoria de proceso en H200.

## Capacidades

- Ejecución reproducible de evaluaciones del benchmark RoboDemo sobre los cinco checkpoints publicados (`c15`, `full50`, `c30`, `c45`, `c15-wo`).
- Carga por streaming de la imagen desde Hugging Face mediante `curl` y `docker load`, sin conservar una segunda copia del archivo.
- Montaje separado de activos del dataset (`IG-10K-Dataset/`, `maniskill/`, `Qwen3-VL-4B-Instruct/`, `vjepa2/`, `vjepa2-ac-vitg.pt`) y de checkpoints en `checkpoints/RoboDemo-<variante>/pytorch_model.pt`.
- Comprobación de entorno y activos con `check_environment.py --assets`.
- Ejecución de episodios completos o de pruebas de humo limitadas con `--max-episodes`.
- Soporte de múltiples workers por GPU mediante `--workers-per-gpu`.
- Descubrimiento de Vulkan y runtime OptiX proporcionados por el host para renderizado.
- No incluye capacidades de generación de texto, visión, tool calling ni agentes; es infraestructura de evaluación.

## Casos de uso

- Evaluación reproducible de checkpoints de robótica: un equipo de investigación puede lanzar `c15-single.sh` sobre un checkpoint concreto dentro del contenedor y obtener resultados comparables entre máquinas, gracias a las versiones fijadas de Python, CUDA y PyTorch.
- Pruebas de humo en CI o en un host de desarrollo: con `--max-episodes 1` se valida que el checkpoint, los activos y el entorno funcionan antes de lanzar el plan completo de episodios.
- Reproducción de resultados de un paper o benchmark: al montar el mismo `IG-10K-Dataset` y el mismo checkpoint, el contenedor elimina la variabilidad de dependencias y facilita la replicación por terceros.
- Despliegue en clústeres con GPUs heterogéneas: la guía de escalado permite asignar un worker en GPUs de 32 GB y dos en GPUs de 80 GB, ajustando `--workers-per-gpu` según la memoria disponible.
- Integración en pipelines de evaluación automatizada: el uso de Docker Compose y variables de entorno (`ROBODEMO_HOST_ASSETS`, `ROBODEMO_HOST_OUTPUTS`, `ROBODEMO_GPU`) permite orquestar evaluaciones por lotes sobre varios checkpoints.
- Diagnóstico de entorno en hosts nuevos: la guía de entorno y `check_environment.py` permiten verificar drivers, NVIDIA Container Toolkit, Vulkan y OptiX antes de ejecutar episodios completos.
- Comparación controlada entre variantes: al compartir la misma imagen los cinco checkpoints, las diferencias observadas se atribuyen al checkpoint y no al entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta una validación de build limpio y comprobaciones de importación de paquetes en CPU (registradas en `container-check.json`), sin datos de rendimiento en GPU ni métricas de tarea.

## Requisitos de hardware

- Host Linux x86-64 con GPU NVIDIA, Docker y NVIDIA Container Toolkit.
- El driver NVIDIA y el runtime OptiX los aporta el host; no se debe instalar un driver de kernel dentro de la imagen.
- Se requiere descubrimiento de Vulkan y runtime OptiX compatibles en el host para el renderizado.
- Memoria de GPU: la guía de escalado recomienda un worker en GPUs de 32 GB y dos workers en GPUs de 80 GB, según mediciones de memoria de proceso en H200.
- GPUs objetivo según esa guía: H200 (80 GB) y GPUs de 32 GB; no se especifican otros modelos concretos.
- No se indica compatibilidad con GPUs de consumo; no disponible.
- Espacio en disco: el archivo de imagen es de 11,7 GB comprimido y Docker necesita espacio adicional para la imagen desempaquetada.
- Despliegue: Docker y Docker Compose; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado alternativas comparables de imágenes de evaluación para benchmarks de robótica en la información disponible.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no procesa visión ni soporta tool calling; es una imagen de entorno de evaluación.
- La validación publicada se limita a un build limpio y comprobaciones de importación en CPU; no establece compatibilidad de renderizado por GPU. Es necesario ejecutar las comprobaciones de GPU y activos y un episodio completo en el host de despliegue.
- Solo soporta Linux amd64; no hay soporte documentado para otras arquitecturas o sistemas operativos.
- Requiere que el host aporte driver NVIDIA, NVIDIA Container Toolkit, Vulkan y OptiX; un host mal configurado provocará fallos no atribuibles a la imagen.
- Los pesos de los checkpoints y los activos del dataset no están incluidos; deben montarse por separado, lo que añade pasos de preparación.
- La licencia es `other` con nombre `upstream-component-licenses`; los componentes empaquetados (CUDA, Python, simulador y dependencias) conservan sus licencias originales, lo que puede imponer restricciones adicionales para uso comercial. El código RoboDemo se distribuye aparte bajo licencia MIT.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validación externa.
- No hay información sobre sesgos, alucinación o cobertura lingüística porque el artefacto no es un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/mxk1998/RoboDemo-Docker
- Repositorio GitHub de RoboDemo: https://github.com/robodemo-2027/RoboDemo
- Guía de inicio rápido (datos y encoders): https://github.com/robodemo-2027/RoboDemo/blob/main/docs/quickstart.md#3-prepare-the-benchmark-and-encoders
- Guía de escalado en GPU: https://github.com/robodemo-2027/RoboDemo/blob/main/docs/evaluation-scaling.md
- Guía de entorno: https://github.com/robodemo-2027/RoboDemo/tree/main/environments
- Dockerfile reproducible: https://github.com/robodemo-2027/RoboDemo/blob/main/environments/Dockerfile
- Aviso de licencias: https://github.com/robodemo-2027/RoboDemo/blob/main/NOTICE.md
- Imagen de evaluación (descarga directa): https://huggingface.co/mxk1998/RoboDemo-Docker/resolve/main/robodemo-evaluation-cu124-amd64.tar.gz
