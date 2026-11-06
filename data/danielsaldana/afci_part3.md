# danielsaldana/AFCI_part3

## Resumen

El repositorio `danielsaldana/AFCI_part3` no contiene un modelo de lenguaje ni un modelo de IA en el sentido convencional, sino la tercera parte de un kit de desarrollo offline para un sistema de deteccion de fallos de arco electrico (AFCI, *Arc-Fault Circuit Interrupter*) orientado a la prevencion de incendios electricos. El flujo completo del sistema es: sensor de corriente -> ADC+DMA de un STM32F407 -> extraccion de caracteristicas FFT/STFT -> red neuronal cuantizada -> disparo del interruptor. Este repositorio aporta concretamente el entorno Python de entrenamiento y procesamiento de senal, empaquetado como *wheels* de Windows x64 para su instalacion sin conexion.

El contenido son 182 *wheels* resueltos de forma conjunta para CPython 3.12 sobre `win_amd64`, repartidos en dos carpetas: `wheels_scientific_jupyter` (146 paquetes cientificos y de analisis) y `wheels_deep_learning` (36 paquetes de aprendizaje profundo). El objetivo es permitir el entrenamiento en CPU de modelos 1D-CNN, CNN-LSTM o basados en atencion, su cuantizacion INT8 y su exportacion a ONNX/TFLite para su despliegue en el microcontrolador mediante STM32 Edge AI / X-CUBE-AI / TFLite Micro.

Es relevante porque documenta un pipeline TinyML completo y reproducible en un entorno aislado (air-gapped), algo poco habitual en repositorios de Hugging Face, y porque incluye el binding Python de CMSIS-DSP (`cmsisdsp`) para verificar que las caracteristicas calculadas en el PC coinciden con las del MCU. No obstante, no se trata de un modelo entrenado publicable: no hay pesos, ni arquitectura definida, ni datos de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (kit de entorno Python; el modelo AFCI objetivo es una DNN cuantizada tipo 1D-CNN / CNN-LSTM / atencion, segun la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | INT8 (mencionada para exportacion a ONNX/TFLite); no se detallan otras |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | `other` (cada paquete conserva su licencia open source: BSD/MIT/Apache-2.0 mayoritariamente) |
| Formato de pesos | No aplica; el repo contiene *wheels* `.whl`, scripts `.bat`/`.ps1`/`.sh` y ficheros de lock |

## Arquitectura y entrenamiento

No existe una arquitectura de modelo definida en este repositorio. Lo que se describe es el entorno de entrenamiento: Python 3.12.10 sobre Windows 10/11 x64, solo CPU, con `torch 2.15 (CPU)`, `tensorflow 2.20 (CPU)` + `keras 3.15`, `onnx 1.23`, `onnxruntime 1.31`, `tf2onnx` y `netron` para inspeccion de grafos. En el lado cientifico incluye `numpy 2.5`, `scipy 1.18`, `scikit-learn`, `xgboost`, `lightgbm`, `optuna`, `PyWavelets`, `h5py`, `pyserial` y `cmsisdsp 1.10`.

El flujo previsto es: carga de formas de onda (CSV/HDF5), extraccion de caracteristicas FFT/STFT/wavelet, entrenamiento de baselines (SVM, Random Forest, XGBoost) y de redes 1D-CNN/CNN-LSTM/atencion, cuantizacion INT8 y exportacion a ONNX/TFLite para su despliegue en STM32. La instalacion se realiza con `install_offline.bat`, que primero ejecuta `join_parts.ps1` para reconstruir los *wheels* de TensorFlow y PyTorch troceados en piezas de 100 MB, crea `%USERPROFILE%\afci-venv`, instala con `--no-index` y finalmente ejecuta `check_env.py`. Los ficheros troceados se validan contra `SHA256SUMS.txt`.

## Capacidades

- No es un modelo generativo: no genera texto, codigo ni respuestas.
- Proporciona un entorno reproducible de entrenamiento ML en CPU sin conexion a Internet.
- Permite entrenar clasificadores de senal (1D-CNN, CNN-LSTM, atencion) para deteccion de arcos electricos.
- Incluye herramientas de extraccion de caracteristicas de senal: FFT, STFT y wavelets (PyWavelets).
- Permite entrenar baselines clasicos: SVM, Random Forest, XGBoost, LightGBM, con `imbalanced-learn` para clases desbalanceadas.
- Soporta cuantizacion INT8 y exportacion a ONNX y TFLite (via `tf2onnx` y Keras).
- Permite verificar la paridad entre las caracteristicas calculadas en PC y las calculadas en el MCU mediante `cmsisdsp` (binding Python de CMSIS-DSP).
- Permite lectura de datos ADC del STM32 por UART con `pyserial`.
- No dispone de tool calling, agentes, capacidades multilingues ni modos de razonamiento.

## Casos de uso

- **Desarrollo de un detector de arcos electricos en STM32F407**: usar el entorno para entrenar una 1D-CNN sobre ventanas de corriente, cuantizarla a INT8 y exportarla a TFLite para su integracion con X-CUBE-AI o TFLite Micro en el microcontrolador.
- **Validacion de paridad PC-MCU de caracteristicas**: comparar la salida FFT/STFT calculada con `numpy`/`scipy` en el PC frente a la obtenida con `cmsisdsp` en el firmware, detectando discrepancias numericas antes del despliegue.
- **Entrenamiento en entornos air-gapped**: laboratorios o instalaciones industriales sin acceso a Internet pueden instalar todo el stack con `install_offline.bat` y `--no-index`, garantizando versiones fijadas en `lock_all.txt`.
- **Generacion de baselines clasicos para comparacion**: entrenar SVM, Random Forest o XGBoost con `scikit-learn` y comparar su ROC/F1 frente a la red neuronal cuantizada para justificar la eleccion de arquitectura.
- **Analisis exploratorio de senales de corriente**: carga de formas de onda en CSV/HDF5 con `pandas`/`h5py`/`PyTables`, visualizacion con `matplotlib`/`seaborn` y calculo de metricas (ROC, F1, matriz de confusion) con `scikit-learn`.
- **Ajuste de hiperparametros**: usar `optuna` para buscar configuraciones de la red o del preprocesado con presupuesto de CPU limitado.
- **Adquisicion de datos en banco de pruebas**: leer muestras del ADC del STM32 por UART con `pyserial` para construir el dataset de entrenamiento de forma controlada.
- **Inspeccion y depuracion de grafos exportados**: abrir los modelos ONNX/TFLite con `netron` para verificar operadores soportados por el runtime del MCU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de deteccion (accuracy, ROC-AUC, F1), ni latencias, ni consumo energetico del sistema AFCI.

## Requisitos de hardware

- **Entorno de entrenamiento**: PC con Windows 10/11 x64, CPU unicamente (no se requiere GPU; el stack es CPU-only).
- **Almacenamiento**: repositorio de 0.8 GB (761.2 MB en 187 ficheros), mas el espacio de la venv resultante.
- **RAM**: no especificada en la model card; dependera del tamano del dataset y del modelo a entrenar.
- **GPU**: no se contemplan; `torch 2.15` y `tensorflow 2.20` se distribuyen en variante CPU.
- **Hardware objetivo de inferencia**: STM32F407 (Cortex-M4F) con ADC+DMA, sin acelerador NPU; la inferencia se realiza via CMSIS-NN / X-CUBE-AI / TFLite Micro.
- **Despliegue**: el entorno es de entrenamiento; el despliegue se hace exportando a TFLite/ONNX. No aplican vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo sino un kit de entorno; no se han identificado en la informacion proporcionada alternativas comparables de la misma categoria (kits TinyML offline para AFCI).

## Limitaciones y advertencias

- No contiene pesos entrenados ni un modelo utilizable directamente; es unicamente un conjunto de *wheels* y scripts de instalacion.
- La licencia es `other`, lo que impide asumir permisos de uso comercial sin consultar los terminos del autor y las licencias individuales de cada paquete.
- El entorno esta restringido a Windows x64 y CPython 3.12; no hay soporte declarado para Linux/macOS mas alla de los scripts `join_parts.sh` para reconstruir ficheros troceados.
- El entrenamiento es exclusivamente en CPU, lo que limita el tamano de modelo y el tiempo de experimentacion.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque no es un modelo linguistico.
- No se proporcionan datos sobre el dataset de arcos electricos, su procedencia, balance de clases ni validacion en campo; cualquier uso en produccion requeriria validacion independiente conforme a normativa de proteccion contra incendios.
- Las versiones de los paquetes son futuras respecto a la fecha habitual de publicacion (por ejemplo `torch 2.15`, `numpy 2.5`), lo que conviene verificar antes de confiar en la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/danielsaldana/AFCI_part3
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
