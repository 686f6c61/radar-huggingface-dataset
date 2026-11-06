# danielsaldana/AFCI_part5

## Resumen

`danielsaldana/AFCI_part5` no es un modelo de lenguaje ni una red neuronal entrenada, sino un kit de desarrollo offline empaquetado como repositorio de Hugging Face. Forma parte de una serie de repositorios (Part 1 a Part 7) que documentan y facilitan la construccion de un sistema de deteccion de arcos electricos (AFCI, arc-fault circuit interrupter) sobre un microcontrolador STM32F407. La cadena completa descrita por el autor es: sensor de corriente, muestreo por ADC con DMA en el STM32, extraccion de caracteristicas mediante FFT/STFT, inferencia de una red neuronal profunda cuantizada y, finalmente, decision de disparo (trip).

La Parte 5 contiene concretamente el entorno de Python necesario para ejecutar los servicios del model zoo de STMicroelectronics (`stm32ai-modelzoo-services`), que es el componente usado en la Parte 4 para entrenar, evaluar, cuantizar y predecir el modelo de deteccion de arcos. Como las dependencias de ST (TensorFlow 2.18, Keras 3.8, PyTorch 2.7.1, ONNX 1.16, ONNX Runtime 1.20, Hydra 1.3.2, MLflow 2.20, neural-compressor 3.4.1) entran en conflicto con el entorno general de la Parte 3, el autor aisla este conjunto en un entorno virtual propio con 176 wheels para CPython 3.12 sobre Windows x64.

El interes del repositorio es practico y de reproducibilidad: permite preparar un PC Windows 10/11 sin conexion a internet, instalar el stack de ST con `--no-index` y ejecutar el flujo de entrenamiento TinyML de deteccion de arcos sin depender de PyPI. No contiene pesos de modelo en formato safetensors ni GGUF, ni una arquitectura de red declarada, por lo que las secciones de especificaciones tecnicas y benchmarks se rellenan con "no disponible" alli donde no hay datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo entrenado; es un entorno de Python para el model zoo de ST) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible como artefacto del repo; el entorno soporta el flujo de cuantizacion de `neural-compressor` 3.4.1 y del model zoo de ST |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | no disponible; el repositorio contiene wheels `.whl`, ficheros `requirements*.txt`, scripts `.bat`, `.ps1` y `.sh`, y trozos `.partNNN` |
| Tamano del repositorio | 1,0 GB (974,8 MB en 179 ficheros segun la model card) |
| Entorno objetivo | Windows 10/11 x64, CPU-only, Python 3.12 (ST recomienda 3.12.9; el instalador 3.12.10 de la Parte 2 es valido) |
| Dependencias fijadas | TensorFlow 2.18, Keras 3.8, PyTorch 2.7.1, ONNX 1.16, ONNX Runtime 1.20, Hydra 1.3.2, MLflow 2.20, neural-compressor 3.4.1 |
| Hardware de destino del sistema | STM32F407 (ADC + DMA) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal propia. Lo que contiene es un entorno de ejecucion reproducible para el pipeline de `stm32ai-modelzoo-services` de STMicroelectronics, orientado al caso de uso `arc_fault_detection`. Ese pipeline cubre las fases de entrenamiento, evaluacion, cuantizacion y prediccion sobre un conjunto de datos de senales de corriente, con extraccion de caracteristicas FFT/STFT previa a la red. La red final es una DNN cuantizada que se despliega en el STM32F407, pero sus pesos y su topologia no forman parte de este repositorio.

Tecnicamente, la aportacion del autor es la resolucion de dependencias para un escenario offline en Windows. Se proporcionan 176 wheels para CPython 3.12 / win_amd64, un `requirements_original_from_ST.txt` tal cual lo publica ST y un `requirements_stm32ai_modelzoo_windows_lock.txt` con el conjunto exacto fijado, verificado resolviendolo unicamente contra las wheels locales (sin acceso a red). El script `install_offline.bat` reconstruye las wheels partidas, crea `%USERPROFILE%\stzoo-venv` e instala todo con `--no-index`. Respecto a la lista original de ST se documentan tres desviaciones: se omite `pesq==0.0.4` (sin wheel para Windows, requiere compilador C y solo lo usa el caso de uso *speech_enhancement*), se sube `pycocotools` de 2.0.7 a 2.0.11 (la 2.0.7 no tiene wheel para Python 3.12 en Windows y solo la arrastra neural-compressor para los casos de vision) y se construyen wheels puras `py3-none-any` para `antlr4-python3-runtime 4.9.3` y `wget 3.2`, que en PyPI solo existen como codigo fuente.

Los ficheros de mas de 100 MB se dividen en trozos `*.part001`, `*.part002`, etc., que se reconstruyen con `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS); ambos scripts verifican el resultado contra `SHA256SUMS.txt`. No se incluyen los ejecutables de ST Edge AI Core ni de STM32Cube AI Studio necesarios para los modos de *benchmarking*, que se remiten a la Parte 7.

## Capacidades

- Preparacion de un entorno Python 3.12 aislado en Windows x64 sin acceso a internet, mediante instalacion con `--no-index` desde wheels locales.
- Ejecucion del flujo de entrenamiento, evaluacion, cuantizacion y prediccion del caso de uso `arc_fault_detection` del model zoo de ST.
- Resolucion reproducible de dependencias: fijado exacto de versiones y verificacion de integridad con SHA256.
- Reconstruccion de ficheros partidos con verificacion criptografica (`SHA256SUMS.txt`).
- Soporte de las herramientas de ST para cuantizacion (neural-compressor) y exportacion a ONNX/ONNX Runtime.
- No incluye inferencia en el propio repositorio, ni servicio de benchmarking, ni pesos de red.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente.

## Casos de uso

- Reproduccion de experimentos de deteccion de arcos electricos en un PC Windows aislado: el entorno permite entrenar y evaluar la DNN del caso `arc_fault_detection` sin conexion, util en laboratorios con redes air-gapped o requisitos de confidencialidad industrial.
- Preparacion de estaciones de trabajo para TinyML en entornos de certificacion: al fijar versiones exactas y verificar SHA256, se puede auditar que el stack de entrenamiento coincide bit a bit con el usado en un experimento previo.
- Formacion y docencia en sistemas empotrados: el kit permite a estudiantes montar el pipeline completo (sensor de corriente, STM32F407, FFT/STFT, DNN cuantizada) sin depender de PyPI ni de compiladores C en Windows.
- Desarrollo de prototipos de prevencion de incendios electricos: el flujo descrito encaja en la validacion de algoritmos AFCI antes de portarlos al firmware del STM32F407.
- Integracion en pipelines de laboratorio con MLflow: el entorno incluye MLflow 2.20 y Hydra 1.3.2, lo que permite registrar experimentos y configuraciones de forma reproducible en local.
- Base para la Parte 7 (checklist de benchmarking): aunque los ejecutables de ST Edge AI Core no estan incluidos, el entorno sirve de punto de partida para preparar el PC antes de anadir las herramientas de medida.
- Reutilizacion de las wheels en otros proyectos que requieran TensorFlow 2.18, PyTorch 2.7.1 u ONNX Runtime 1.20 en Windows x64 con Python 3.12, sin acceso a PyPI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, latencia ni consumo del sistema AFCI sobre el STM32F407, y el repositorio no contiene pesos de modelo que permitan medirlos.

## Requisitos de hardware

- Entorno de desarrollo: PC con Windows 10/11 x64 y CPU; el autor indica explicitamente que el entrenamiento es CPU-only.
- Python 3.12 (ST recomienda 3.12.9; el instalador 3.12.10 es valido segun la model card).
- Espacio en disco: al menos 1,0 GB para el repositorio, mas el espacio del entorno virtual `%USERPROFILE%\stzoo-venv` (no cuantificado en la model card).
- Memoria RAM: no disponible.
- GPU: no requerida ni mencionada; el flujo descrito es CPU-only.
- Hardware de destino del sistema AFCI: STM32F407 con ADC y DMA.
- Opciones de despliegue del entorno: instalacion offline mediante `install_offline.bat` con `--no-index`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada repositorios comparables de la misma categoria (kits offline de entorno Python para el model zoo de ST en Windows). Como referencia estructural, cabria comparar con el propio `stm32ai-modelzoo-services` de ST, pero no se dispone de datos de ese repositorio en la informacion facilitada.

## Limitaciones y advertencias

- No es un modelo entrenado: no contiene pesos, tokenizador ni configuracion de inferencia; no puede usarse para generar predicciones por si mismo.
- La licencia figura como `other` sin texto de licencia incluido en la informacion disponible; es imprescindible revisar los terminos antes de cualquier uso comercial o redistribucion.
- El entorno esta pensado exclusivamente para Windows 10/11 x64 y CPython 3.12; no se documenta soporte para Linux, macOS ni otras versiones de Python.
- No incluye los ejecutables de ST Edge AI Core ni de STM32Cube AI Studio, necesarios para los modos de benchmarking; el flujo queda incompleto para esa fase.
- Se omiten `pesq` y se cambia la version de `pycocotools` respecto a la lista oficial de ST; los casos de uso de *speech_enhancement* y parte de los de vision pueden no funcionar tal cual.
- Los ficheros grandes estan partidos: es obligatorio ejecutar `join_parts.ps1` o `join_parts.sh` y verificar `SHA256SUMS.txt` antes de instalar; un fallo en este paso invalida la instalacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-02); no hay evidencia de mantenimiento ni de validacion por terceros.
- No se declaran idiomas soportados ni sesgos, al no tratarse de un modelo de lenguaje.
- Riesgo de alucinacion: no aplica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/danielsaldana/AFCI_part5
- Model zoo de STMicroelectronics (`stm32ai-modelzoo-services`): no disponible en la informacion proporcionada
- Documentacion de ST Edge AI Core / STM32Cube AI Studio: no disponible en la informacion proporcionada
- Repositorios de las partes 1 a 7 de la serie AFCI del mismo autor: no disponibles en la informacion proporcionada (solo se referencian por numero en la model card)
