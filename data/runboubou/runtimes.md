# runboubou/runtimes

## Resumen

Boubou runtimes es un repositorio de artefactos de distribucion, no un modelo de lenguaje. Lo publica el autor `runboubou` en Hugging Face y contiene runtimes precompilados que la aplicacion Boubou descarga en el primer uso para ejecutar un pipeline de speech-to-speech (voz a voz) sobre Linux x86-64 con GPU NVIDIA. El repositorio pesa 3,6 GB y su unico contenido documentado es un archivo `qwen/linux-x64/<sha256>.tar.gz` que empaqueta un entorno Python portable con todas las dependencias necesarias para la inferencia.

El paquete incluye CPython 3.11 portable, PyTorch 2.11 con las librerias CUDA 13 de NVIDIA, llama.cpp build b11960 y Hugging Face speech-to-speech 1.1.0. Boubou fija cada archivo por URL, tamano y hash SHA-256 en sus manifiestos, y verifica la integridad antes de usarlo. Los pesos de los modelos no se incluyen: se descargan desde sus repositorios originales.

Su relevancia es operativa: elimina la necesidad de montar manualmente un entorno CUDA + PyTorch + llama.cpp + speech-to-speech para desplegar el asistente de voz de Boubou, y garantiza reproducibilidad mediante verificacion criptografica. No obstante, al no ser un modelo, carece de parametros, contexto, benchmarks o capacidades cognitivas propias; las hereda de los modelos que el usuario descargue por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de runtime, no modelo) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo descargado) |
| Tipos de cuantizacion | no disponible (los pesos no se incluyen) |
| Idiomas soportados | no disponible |
| Licencia | mixed / other (componentes de terceros con licencias propias) |
| Formato de pesos | no disponible; artefacto `.tar.gz` con CPython 3.11 portable, PyTorch 2.11 (CUDA 13), llama.cpp b11960 y HF speech-to-speech 1.1.0 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay arquitectura neuronal ni proceso de entrenamiento que describir. El repositorio aloja un runtime empaquetado: un arbol de directorios comprimido en `.tar.gz` que contiene un interprete CPython 3.11 portable, PyTorch 2.11 enlazado contra las librerias CUDA 13 de NVIDIA, el binario de llama.cpp en su build b11960 y el paquete Hugging Face speech-to-speech 1.1.0. El script de construccion es `packaging/qwen/build_runner.py` del repositorio GitHub de Boubou.

El mecanismo de integridad es la innovacion tecnica destacable: los manifiestos de Boubou fijan URL, tamano y SHA-256 de cada archivo, y la aplicacion verifica el hash antes de ejecutar el runtime. Los archivos subidos nunca se reemplazan; una nueva version del runner se publica en una ruta distinta. Los textos de licencia de los componentes de terceros viajan dentro del archivo, en `licenses/`, en `llama-b11960/LICENSE` y en los `.dist-info` de cada paquete Python.

## Capacidades

- Ejecucion de pipelines de speech-to-speech (entrada de voz, salida de voz) sobre Linux x86-64 con GPU NVIDIA.
- Inferencia LLM local mediante llama.cpp b11960 incluido en el paquete.
- Soporte de los modulos de Hugging Face speech-to-speech 1.1.0 para orquestacion de ASR, LLM y TTS.
- Aceleracion por GPU mediante PyTorch 2.11 con librerias CUDA 13 de NVIDIA.
- Verificacion de integridad SHA-256 de los artefactos descargados.
- Entorno Python 3.11 aislado y portable, sin dependencia de la instalacion del sistema.
- No incluye pesos de modelos: las capacidades linguisticas dependen de los modelos que se descarguen aparte.

## Casos de uso

- Despliegue de un asistente de voz local: el runtime permite levantar el pipeline speech-to-speech de Boubou en una maquina Linux con GPU NVIDIA sin instalar manualmente CUDA, PyTorch ni llama.cpp, reduciendo el tiempo de puesta en marcha a la descarga del archivo y la verificacion del hash.
- Reproducibilidad en entornos de investigacion: al fijar cada dependencia por SHA-256, dos equipos distintos obtienen exactamente el mismo stack de inferencia, lo que facilita comparar resultados entre maquinas.
- Servidores sin acceso a internet o con salida restringida: el paquete se puede descargar una vez y distribuir internamente, manteniendo la verificacion de integridad en cada uso.
- CI/CD para aplicaciones de voz: integrar el runtime en pipelines de integracion continua permite ejecutar pruebas de extremo a extremo del pipeline de voz en runners con GPU sin configurar el entorno en cada job.
- Prototipado rapido de interfaces conversacionales por voz: desarrolladores que quieran probar el stack de Boubou pueden hacerlo sin resolver a mano las incompatibilidades entre versiones de CUDA, PyTorch y llama.cpp.
- Estandarizacion de flotas de inferencia: al publicarse cada runner en una ruta nueva e inmutable, los equipos de operaciones pueden auditar que version exacta ejecuta cada nodo y revertir a una anterior sin ambiguedad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo, no procede comparar MMLU, HumanEval, GSM8K ni metricas similares; el rendimiento dependera del modelo descargado y del hardware.

## Requisitos de hardware

- Plataforma: Linux x86-64 exclusivamente, segun la ruta `qwen/linux-x64/`.
- GPU: NVIDIA con soporte para CUDA 13 (las librerias CUDA 13 de NVIDIA van incluidas en el paquete).
- VRAM estimada: no disponible; depende del modelo que se descargue por separado.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el unico requisito documentado es GPU NVIDIA con CUDA 13.
- Almacenamiento: 3,6 GB para el repositorio; el espacio adicional depende de los pesos descargados.
- Opciones de despliegue: el runtime integra llama.cpp b11960 y Hugging Face speech-to-speech 1.1.0; no se documentan otras opciones (vLLM, TGI, Ollama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No hay modelos comparables en la informacion proporcionada, ya que se trata de un artefacto de distribucion de software y no de un modelo de lenguaje. Como referencia de categoria, podria compararse con otros repositorios de runtimes empaquetados, pero no se dispone de datos de esos artefactos.

## Limitaciones y advertencias

- No es un modelo: no tiene pesos, parametros, contexto ni capacidades linguisticas propias; cualquier evaluacion de calidad debe hacerse sobre los modelos que el usuario descargue.
- Plataforma unica: solo se documenta un runner para Linux x86-64 con GPU NVIDIA; no hay soporte declarado para macOS, Windows, ARM ni aceleradores distintos de NVIDIA.
- Licencia mixta: el repositorio declara `license: other` con nombre `mixed`; los componentes de terceros conservan sus propias licencias (NVIDIA CUDA, llama.cpp, PyTorch, Hugging Face speech-to-speech), por lo que el uso comercial exige revisar cada una por separado.
- Dependencia de la aplicacion Boubou: el runtime esta pensado para ser consumido por esa aplicacion y sus manifiestos; su uso fuera de ella no esta documentado.
- Sin datos de rendimiento: no hay benchmarks, latencias ni throughput publicados, lo que impide estimar costes de inferencia a priori.
- Sin informacion de idiomas ni de sesgos: al no incluir modelo, no aplica, pero tampoco se documenta que modelos descarga Boubou por defecto.
- Verificacion obligatoria: saltarse la comprobacion SHA-256 elimina la garantia de integridad que justifica el diseno del repositorio.
- Fecha de creacion futura en los metadatos (2026-11-09), lo que conviene contrastar antes de confiar en la cronologia del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/runboubou/runtimes
- Repositorio GitHub de Boubou: https://github.com/runboubou/boubou
- Script de construccion del runner: https://github.com/runboubou/boubou/blob/main/packaging/qwen/build_runner.py
