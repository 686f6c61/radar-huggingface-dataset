# giangndm/NVIDIA-NemotronLabs-RE-USE-laughter-bf16

## Resumen

RE-USE-laughter es un modelo de mejora de voz (speech enhancement) desarrollado por NVIDIA dentro de su línea Nemotron Labs. Su tarea es audio-a-audio: recibe una señal de audio degradada por ruido y devuelve una versión limpia de la misma. La ficha que nos ocupa no es el modelo original, sino una conversión no oficial a BF16 realizada por el usuario giangndm, que reduce el peso del checkpoint de 38,6 MB a 21,1 MB manteniendo los 1416 tensores con idénticos nombres y formas.

El modelo es extremadamente compacto: 9.607.747 parámetros totales según el archivo safetensors. Combina bloques convolucionales (Conv2d, InstanceNorm2d, PReLU) con módulos de tipo Mamba, lo que sugiere una arquitectura híbrida convolucional-recurrente selectiva orientada a procesar secuencias de audio largas con coste lineal. Está pensado para despliegue en entornos con recursos limitados, incluida la inferencia en GPU de consumo.

La relevancia de esta conversión concreta es práctica: permite cargar el modelo con menor huella de memoria y habilita rutas de inferencia con operandos BF16 (por ejemplo, en el runtime ninfer-rs sobre GPUs SM120), a cambio de una degradación medible pero contenida respecto al checkpoint F32 original, cuantificada en torno a 40-45 dB de SI-SDR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida convolucional (Conv2d, InstanceNorm2d, PReLU) con modulos Mamba (SSM selectivo) |
| Parametros totales | 9.607.747 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por fragmentos; existe `inference_chunk.sh`) |
| Tipos de cuantizacion | BF16 (tensores de convolucion y proyeccion) y F32 (normalizaciones, PReLU, parametros internos de Mamba) |
| Idiomas soportados | no disponible (procesamiento de senal de audio, independiente del idioma) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (mas scripts Python y configuracion en el repo) |

## Arquitectura y entrenamiento

La arquitectura, segun los tensores del checkpoint, es un codificador convolucional con bloques densos y convoluciones sub-pixel (`final_conv`, `phase_conv_r`, `phase_conv_i`), combinado con capas Mamba cuyos parametros incluyen `in_proj`, `x_proj`, `out_proj`, `conv1d`, `dt_proj`, `A_log` y `D`. Esta mezcla es caracteristica de los modelos SEMamba para mejora de voz: las convoluciones capturan estructura espectral local y el state space model aporta modelado de dependencias de largo alcance con coste computacional lineal en la longitud de la secuencia. El nombre del cargador en el codigo fuente (`SEMamba.from_pretrained`) confirma esta familia arquitectonica.

No se dispone de informacion detallada sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO; la model card original se conserva en `README_ORIGINAL.md` pero su contenido no se ha incluido en la informacion proporcionada. La innovacion tecnica destacable de esta ficha concreta es la conversion de precision: 462 tensores (pesos y sesgos de Conv2d, y proyecciones de Mamba) se redondearon una sola vez de F32 a BF16 con redondeo al par mas cercano, mientras que 954 tensores (normalizaciones, PReLU, `conv1d`, `dt_proj`, `A_log`, `D` y sesgos de `output_proj`) permanecen en F32 para preservar estabilidad numerica.

## Capacidades

- Mejora de voz universal (universal speech enhancement): eliminacion de ruido y restauracion de senal limia a partir de audio degradado.
- Procesamiento audio-a-audio: la entrada y la salida son formas de onda, no texto.
- Procesamiento por fragmentos: los scripts `inference.py` e `inference_chunk.py` permiten trocear audios largos.
- Soporte de multiples frecuencias de muestreo en las pruebas publicadas (44,1 kHz y 16 kHz).
- Independencia del idioma: al operar sobre la senal acustica, no depende de un idioma concreto (verificado con voz en vietnamita en la evaluacion del autor de la conversion).
- Compatibilidad con PyTorch mediante `SEMamba.from_pretrained`, que carga los tensores BF16 en parametros F32 con upcast exacto.
- Compatibilidad con el runtime ninfer-rs (`ninfer-audio`) en GPUs SM120, con acumulacion FP32 y selective scan FP32.
- No dispone de tool calling, function calling, capacidades de agente, vision ni generacion de texto.

## Casos de uso

- Preprocesado de audio para ASR: limpiar grabaciones ruidosas antes de pasarlas a un sistema de reconocimiento de voz, mejorando la tasa de error en entornos con ruido de fondo. El modelo es lo bastante pequeno (9,6 M de parametros) para ejecutarse en el mismo nodo que el ASR.
- Videollamadas y conferencias: integracion en pipelines de captura de microfono para suprimir ruido ambiental en tiempo real, aprovechando la baja huella de memoria del checkpoint BF16 (21,1 MB).
- Restauracion de archivos de audio historicos: procesar grabaciones digitalizadas con ruido de cinta o sala, usando el modo por fragmentos para ficheros de larga duracion.
- Limpieza de datasets de voz para entrenamiento: normalizar la calidad acustica de corpus recopilados en campo antes de usarlos para entrenar modelos de sintesis o reconocimiento.
- Despliegue en dispositivos de borde: el tamano reducido permite incluirlo en aplicaciones moviles o embebidas con presupuesto de memoria estricto, siempre que se valide la calidad en el dominio objetivo.
- Evaluacion comparativa de conversiones de precision: usar la diferencia SI-SDR de 40-45 dB frente al F32 como referencia para decidir si la ruta BF16 es aceptable en un pipeline de produccion concreto.
- Transcripcion de reuniones y podcasts: mejora previa de la pista de audio antes de la diarizacion y el resumen automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de mejora de voz. La unica metrica publicada es la fidelidad de la conversion BF16 respecto al checkpoint F32 original, medida con SI-SDR por ninfer-rs sobre una RTX 5090:

| Clip | Frecuencia | SI-SDR BF16 vs F32 |
|---|---:|---:|
| `noisy_audio/mic_test2.wav` (5,1 s, por fragmentos) | 44,1 kHz | 44,7 dB |
| Voz en vietnamita (3,2 s) | 16 kHz | 40,9 dB |

Como referencia, el runtime ninfer-rs en F32 coincide con una ejecucion en FP64 de PyTorch del modelo original entre 56 y 122 dB, lo que indica que la perdida atribuible a la conversion BF16 es de aproximadamente 40 dB por debajo de la senal. No se han publicado metricas de calidad de mejora (PESQ, STOI, DNSMOS) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (21,1 MB de pesos mas estados intermedios y buffers de audio); el checkpoint F32 ocupa 38,6 MB.
- GPU recomendadas: cualquier GPU moderna con soporte BF16; el autor ha validado la ruta ninfer-rs en una RTX 5090 (arquitectura SM120).
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 5090, series RTX 30 y 40, e incluso en CPU para procesamiento por lotes sin requisitos de tiempo real.
- Opciones de despliegue: scripts PyTorch del repositorio original (`inference.py`, `inference_chunk.sh`) y el runtime ninfer-rs (`ninfer-audio`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. El procesamiento por fragmentos sugiere que la latencia depende de la configuracion de chunking y de la frecuencia de muestreo.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos alternativos de mejora de voz (por ejemplo, variantes de SEMamba, Demucs o modelos de la familia DeepFilterNet) que permitan una comparacion con parametros, contexto, rendimiento y licencia verificables. Se indica por tanto "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RE-USE-laughter BF16 (esta ficha) | 9,6 M | no disponible | OpenMDW-1.1 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conversion no oficial: no es un lanzamiento de NVIDIA ni esta afiliada o respaldada por la compania; el modelo, el entrenamiento y el codigo pertenecen a NVIDIA.
- Perdida de fidelidad numerica: la salida BF16 difiere de la F32 en torno a 40 dB por debajo de la senal; el autor recomienda evaluar sobre datos propios antes de confiar en ella.
- Pipeline completo no verificado: el autor confirma que el archivo carga en parametros F32, pero no ejecuto el pipeline completo de PyTorch con `mamba_ssm`.
- Sesgos: no se dispone de informacion sobre sesgos acusticos, de idioma o de dominio en la informacion proporcionada; la model card original (que cubre sesgos, seguridad y privacidad) se conserva en `README_ORIGINAL.md` pero no se ha incluido su contenido.
- Riesgo de artefactos: como todo modelo de mejora de voz, puede introducir artefactos o sobre-suprimir componentes de la senal en dominios alejados de sus datos de entrenamiento.
- Restricciones de licencia: se aplica OpenMDW-1.1 del repositorio original; deben revisarse los terminos de esa licencia antes de un uso comercial, y conservarse el archivo `LICENSE` y los avisos del repositorio fuente.
- Idiomas: no se declaran idiomas soportados; al ser un modelo de senal, la cobertura linguistica depende de la diversidad acustica de los datos de entrenamiento, no documentada aqui.
- Contexto: no se especifica una ventana maxima; los audios largos requieren el modo por fragmentos, cuyos limites no se detallan.

## Enlaces

- Modelo en HuggingFace (esta conversion): https://huggingface.co/giangndm/NVIDIA-NemotronLabs-RE-USE-laughter-bf16
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE-laughter
- Model card original conservada en el repo: `README_ORIGINAL.md`
- Licencia OpenMDW-1.1: `LICENSE` en el repositorio
- Documentacion adicional incluida en el repo: `bias.md`, `explainability.md`, `privacy.md`, `safety_security.md`
- Runtime de inferencia ninfer-rs (`ninfer-audio`): no disponible (no se proporciona URL en la informacion recibida)
- Paper o blog de NVIDIA sobre el modelo: no disponible en la informacion proporcionada
