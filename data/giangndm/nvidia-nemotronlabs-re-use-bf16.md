# giangndm/NVIDIA-NemotronLabs-RE-USE-bf16

## Resumen

NVIDIA-NemotronLabs-RE-USE es un modelo de mejora de voz (speech enhancement) universal desarrollado por NVIDIA, publicado bajo licencia OpenMDW-1.1. La ficha que nos ocupa no es el modelo original, sino una conversión no oficial a BF16 realizada por el usuario giangndm, que reduce el peso del checkpoint de 38,6 MB a 21,1 MB manteniendo los mismos 1416 tensores y formas. El modelo realiza una tarea audio-a-audio: toma una señal de voz con ruido y devuelve la señal limpia.

Con apenas 9,6 millones de parámetros, es un modelo muy compacto, pensado para despliegue en entornos con recursos limitados y para procesamiento de audio en tiempo real o por bloques. Su arquitectura combina bloques convolucionales con módulos de espacio de estados (Mamba), una elección que busca modelar dependencias temporales largas en audio con un coste computacional lineal en la longitud de la secuencia.

Esta conversión es relevante para quienes quieran ejecutar el modelo con precisión reducida en GPUs modernas (por ejemplo, arquitecturas SM120 como la RTX 5090) mediante el runtime ninfer-rs, o cargarlo en PyTorch con pesos redondeados a BF16. No obstante, al ser una conversión no oficial, no cuenta con el respaldo de NVIDIA y debe evaluarse sobre datos propios antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Convolucional (Conv2d, InstanceNorm2d, PReLU) combinada con bloques Mamba (SSM) |
| Parametros totales | 9.607.747 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa clips y admite inferencia por bloques) |
| Tipos de cuantizacion | BF16 (462 tensores) y F32 (954 tensores) en el checkpoint convertido; el original es F32 |
| Idiomas soportados | no disponible (mejora de voz independiente del idioma; se cita voz vietnamita en las pruebas) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una red de mejora de voz que combina capas convolucionales 2D con módulos de espacio de estados del tipo Mamba. La parte convolucional incluye pesos y sesgos de `Conv2d` en el codificador, bloques densos, convoluciones subpíxel, `final_conv` y `phase_conv_r`/`phase_conv_i`; las normalizaciones (`InstanceNorm2d`, `PReLU`, `LayerNorm`) se mantienen en F32. Los módulos Mamba aportan las proyecciones `in_proj`, `x_proj`, `out_proj` y `output_proj`, mientras que `conv1d`, `dt_proj`, `A_log`, `D` y `output_proj.bias` permanecen en F32. Esta mezcla de precisión busca preservar la estabilidad numérica del barrido selectivo (selective scan) y de las normalizaciones.

No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; la model card original (conservada como `README_ORIGINAL.md`) cubre estos aspectos, pero no se ha incluido su contenido en la información proporcionada. La innovación destacable de esta ficha concreta es la conversión de precisión: cada valor se redondeó una sola vez de F32 a BF16 (redondeo al par más cercano), y se verificó que el archivo carga correctamente en parámetros F32 mediante `load_state_dict`, que los promociona de forma exacta.

## Capacidades

- Mejora de voz universal (universal speech enhancement): elimina ruido de señales de voz y devuelve audio limpio en una tarea audio-a-audio.
- Procesamiento por bloques: incluye scripts `inference_chunk.py` e `inference_chunk.sh` para inferencia fragmentada, útil en clips largos.
- Funcionamiento independiente del idioma a nivel de señal, aunque las pruebas documentadas incluyen voz vietnamita y una grabación de micrófono.
- Inferencia en PyTorch con el código fuente original mediante `SEMamba.from_pretrained(...)`.
- Inferencia acelerada en GPUs SM120 (RTX 5090) mediante el runtime ninfer-rs, con operandos BF16 en convoluciones y proyecciones, acumulación FP32 y barrido selectivo y normalizaciones en FP32.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio.

## Casos de uso

- Limpieza de grabaciones de voz para transcripción: el modelo puede preprocesar audio de reuniones o entrevistas antes de pasarlo a un sistema ASR, reduciendo el ruido de fondo y mejorando la tasa de acierto del reconocimiento.
- Videollamadas y VoIP: al tener solo 9,6 M de parámetros, es viable integrarlo en pipelines de comunicación en tiempo real o casi real, procesando fragmentos de audio con `inference_chunk`.
- Pódcasts y contenido audiovisual: mejora de pistas de voz grabadas en entornos domésticos con ruido ambiental, usando la inferencia por bloques para archivos largos.
- Preprocesado en asistentes de voz embebidos: su tamaño reducido permite desplegarlo en dispositivos con recursos limitados o junto a otros modelos pequeños en una misma GPU.
- Investigación en mejora de voz: sirve como referencia compacta para comparar arquitecturas híbridas convolución-Mamba frente a enfoques puramente convolucionales o basados en transformers.
- Evaluación de precisión reducida: la conversión BF16 permite medir el impacto de la cuantización en la calidad de la señal (SI-SDR) antes de adoptar pesos de menor precisión en producción.
- Procesamiento por lotes en servidores con GPUs modernas: el runtime ninfer-rs aprovecha operandos BF16 en GPUs SM120 para aumentar el throughput en tareas de limpieza de audio a gran escala.

## Benchmarks y rendimiento

La información disponible incluye una única métrica de fidelidad de la conversión, no de calidad absoluta del modelo. Se trata del SI-SDR de la salida BF16 frente a la salida F32, calculado con ninfer-rs en una RTX 5090 (cuanto mayor, más parecidas):

| Clip | Frecuencia | BF16 vs F32 (SI-SDR) |
|---|---:|---:|
| `noisy_audio/mic_test2.wav` (5,1 s, por bloques) | 44,1 kHz | 43,8 dB |
| Voz vietnamita, 3,2 s | 16 kHz | 42,1 dB |

Además, se indica que la implementación F32 de ninfer-rs coincide con una ejecución en PyTorch F64 del modelo original entre 56 y 122 dB. No se han publicado resultados de benchmarks de calidad de mejora de voz (por ejemplo, PESQ, STOI o DNSMOS) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 9,6 M de parámetros, el checkpoint BF16 ocupa 21,1 MB y el F32 38,6 MB, por lo que la huella de pesos es inferior a 100 MB en cualquier caso.
- GPU recomendadas: cualquier GPU moderna sirve; se documenta explícitamente el uso en RTX 5090 (SM120) con ninfer-rs. Para PyTorch, una GPU con soporte CUDA es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con suficiente memoria para el runtime y los buffers de audio; el cuello de botella no es la VRAM sino el soporte del runtime.
- Opciones de despliegue: PyTorch con el código fuente original (dependencia de `mamba_ssm`) y ninfer-rs (`ninfer-audio`) para GPUs SM120. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo de audio.
- Latencia y throughput: no disponibles. La model card no proporciona cifras de latencia ni de velocidad de procesamiento.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con otros modelos de mejora de voz. Como referencia estructural, el propio modelo original `nvidia/NVIDIA-NemotronLabs-RE-USE` en F32 es la alternativa directa a esta conversión: misma arquitectura y mismos tensores, con el doble de tamaño de checkpoint (38,6 MB frente a 21,1 MB) y sin el redondeo a BF16.

| Modelo | Parametros | Precision | Licencia | Estado |
|---|---:|---|---|---|
| giangndm/NVIDIA-NemotronLabs-RE-USE-bf16 | 9.607.747 | BF16/F32 mixto | OpenMDW-1.1 | Conversión no oficial |
| nvidia/NVIDIA-NemotronLabs-RE-USE | no disponible en la informacion | F32 | OpenMDW-1.1 | Modelo original oficial |

## Limitaciones y advertencias

- Conversión no oficial: no es un lanzamiento de NVIDIA ni está afiliada o respaldada por la empresa; el modelo, el entrenamiento, el código y la model card original pertenecen a NVIDIA.
- La conversión a BF16 introduce un error de redondeo; la salida difiere de la F32 en torno a 40 dB por debajo de la señal, según las pruebas del autor. Debe evaluarse sobre datos propios antes de confiar en ella.
- El pipeline completo de código fuente con `mamba_ssm` no fue ejecutado por el autor; solo se verificó que el archivo carga en parámetros F32.
- Riesgo de alucinación no aplicable en el sentido habitual de modelos de lenguaje, pero sí existe riesgo de artefactos o distorsión en la señal de audio mejorada.
- Sesgos: no se documentan sesgos específicos en la información disponible; la model card original (`README_ORIGINAL.md`) cubre sesgos y seguridad, pero su contenido no se ha proporcionado.
- Cobertura de idiomas: no disponible; el modelo opera sobre la señal acústica, pero no se especifican idiomas evaluados más allá de las pruebas citadas.
- Restricciones de licencia: se aplica OpenMDW-1.1 del modelo original; deben revisarse los términos de esa licencia para uso comercial.
- Dependencia de runtime: el uso acelerado en BF16 requiere ninfer-rs y GPUs SM120; en otras configuraciones se depende de PyTorch y del código original.

## Enlaces

- Modelo convertido en HuggingFace: https://huggingface.co/giangndm/NVIDIA-NemotronLabs-RE-USE-bf16
- Modelo original: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Model card original (copia en el repo): `README_ORIGINAL.md`
- Licencia: `LICENSE` (OpenMDW-1.1) en el repositorio
- Documentación adicional incluida en el repo: `bias.md`, `explainability.md`, `privacy.md`, `safety_security.md`
- Scripts de inferencia: `inference.py`, `inference_chunk.py`, `inference.sh`, `inference_chunk.sh`
