# PatiPix/ZipEnhancer-ONNX

## Resumen

ZipEnhancer-ONNX es una exportación portable a formato ONNX del modelo ZipEnhancer de 16 kHz, un supresor de ruido y realzador de voz desarrollado originalmente por el Tongyi Lab de Alibaba y publicado en ModelScope bajo el identificador `iic/speech_zipenhancer_ans_multiloss_16k_base`. Esta versión concreta la mantiene PatiPix y resuelve un problema práctico de portabilidad: el archivo ONNX publicado con el modelo original empleaba operadores `com.microsoft.nchwc` optimizados para el procesador que lo generó, lo que lo hacía inseguro en otras máquinas. La exportación de PatiPix utiliza únicamente operadores ONNX estándar, lo que permite ejecutarla en cualquier runtime compatible.

El modelo no es un modelo de lenguaje ni un sistema de reconocimiento de voz, sino un módulo de procesamiento de señal que opera en el dominio espectral: recibe la magnitud y la fase de una STFT y devuelve una magnitud y fase limpias, listas para reconstruir la señal temporal mediante ISTFT. Es el supresor de ruido que VoxCPM2 emplea en su opción `denoise`, y PatiPix Studio lo usa en el paso opcional de eliminación de ruido de fondo de su clonación de voz.

La relevancia actual es doble: por un lado, ofrece una alternativa ligera (un único archivo de menos de 10 MB) para preprocesar audio antes de tareas de TTS, ASR o clonación de voz; por otro, demuestra un patrón de exportación reproducible con verificación numérica frente al pipeline oficial, con diferencias de amplitud inferiores a 3e-6 y una concordancia global de 58 a 61 dB en la cadena completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de realce de voz en dominio espectral (magnitud/fase STFT); arquitectura interna no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; bloque válido hasta T = 961 frames (6 s) de STFT |
| Tipos de cuantizacion | no disponible; se distribuye un único archivo ONNX con pesos sin cambios |
| Idiomas soportados | no disponible (procesamiento de señal independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`zipenhancer.onnx`, 9.591.998 bytes) |

## Arquitectura y entrenamiento

La model card no describe la topología interna de la red (número de capas, tipo de bloques, mecanismos de atención o convoluciones). Lo que sí detalla es la interfaz de procesamiento: la entrada son dos tensores de forma `[1, 201, T]` correspondientes a la magnitud STFT comprimida (potencia 0.3) y a la fase STFT; la salida son `amp_g` y `pha_g`, magnitud limpia comprimida y fase limpia. La STFT sigue la implementación `mag_pha_stft` / `mag_pha_istft` de ModelScope: audio a 16 kHz normalizado a RMS unitaria, ventana de 400 puntos, hop de 100, ventana Hann periódica y centrado con padding reflectivo.

El entrenamiento original corresponde a ZipEnhancer del Tongyi Lab, con una función de pérdida multi-loss (el identificador del modelo incluye `ans_multiloss`). No se dispone en la información proporcionada del número de tokens, horas de audio, composición del dataset ni del uso de técnicas de ajuste fino concretas. La innovación destacable de esta exportación es de ingeniería: se generó con el código oficial de ModelScope 1.40.2 y torch 2.10.0 mediante exportación TorchScript (`dynamo=False`) en opset 17, manteniendo los pesos sin modificar y sustituyendo los operadores propietarios por operadores ONNX estándar. La verificación se realizó sobre los dos ejemplos ruidosos oficiales, con una diferencia de amplitud entre ONNX y PyTorch inferior a 3e-6 y una concordancia de la cadena completa con el pipeline oficial de ModelScope de 58 a 61 dB, que la model card identifica como el límite del audio de 16 bits.

## Capacidades

- Supresión de ruido de fondo en audio de voz a 16 kHz.
- Realce de voz: reconstrucción de magnitud y fase limpias a partir de STFT ruidosa.
- Procesamiento por bloques de hasta 6 s (T = 961 frames); el pipeline oficial trocea audio más largo en fragmentos de 2 s descartando 0,25 s en cada extremo.
- Ejecución portable en cualquier runtime ONNX estándar, sin dependencia de operadores `com.microsoft.nchwc`.
- Integración como paso de preprocesado en pipelines de TTS, clonación de voz y ASR.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multimodales: es un módulo de señal, no un modelo generativo de texto.
- No se documentan capacidades multilingües específicas; al operar sobre señal acústica, el concepto de idioma no aplica directamente.

## Casos de uso

- Preprocesado en clonación de voz: eliminar ruido de fondo de las muestras de referencia antes de extraer embeddings de hablante, tal como hace PatiPix Studio en su paso opcional de «Remove background noise», mejorando la fidelidad del clon resultante.
- Limpieza previa a transcripción ASR: aplicar el modelo a grabaciones de reuniones o llamadas antes de pasarlas a un sistema de reconocimiento, reduciendo inserciones erróneas causadas por ruido estacionario.
- Pipeline de TTS con entrada de micrófono: en aplicaciones de voz interactiva, limpiar la señal capturada en tiempo real por bloques de 2 s antes de la síntesis o la respuesta del sistema.
- Preparación de datasets de audio: normalizar y limpiar corpus de voz recopilados en condiciones variables (calle, oficina, hogar) antes de usarlos para ajuste fino de modelos de voz.
- Edición de pódcast y contenido hablado: eliminación de ruido de fondo en grabaciones domésticas como paso automatizado dentro de una cadena de postproducción.
- Despliegue en entornos con recursos limitados: al ser un único archivo de menos de 10 MB en ONNX estándar, puede ejecutarse en CPU en aplicaciones de escritorio o dispositivos embebidos sin GPU dedicada.
- Verificación de portabilidad en producción: servir como referencia para validar que una exportación ONNX de un modelo de audio reproduce fielmente el pipeline original, usando la tolerancia de 3e-6 en amplitud como criterio de aceptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas de fidelidad de la exportación: diferencia de amplitud entre ONNX y PyTorch inferior a 3e-6 en los dos ejemplos ruidosos oficiales, y concordancia de la cadena completa con el pipeline oficial de ModelScope de 58 a 61 dB, descrita como el límite del audio de 16 bits.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el archivo pesa 9.591.998 bytes, por lo que la huella de memoria es mínima y probablemente quepa en CPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime sirve, incluida una RTX 4090 o inferiores.
- Cabe en GPU de consumo: sí, con toda probabilidad, dado el tamaño del archivo; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con cualquier lenguaje con bindings (Python, C++, C#, JavaScript). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos alternativos de supresión de ruido (como RNNoise, DeepFilterNet o Demucs) ni métricas comparables de rendimiento, por lo que no es posible establecer una comparativa rigurosa sin inventar datos.

## Limitaciones y advertencias

- La model card no documenta sesgos; al ser un modelo de señal, los sesgos potenciales se relacionarían con el dominio acústico de entrenamiento (tipos de ruido, idiomas, condiciones de grabación), no con contenido semántico.
- Riesgo de artefactos o distorsión en la voz cuando el ruido se solapa espectralmente con el habla; la verificación reportada se limita a dos ejemplos oficiales.
- Ventana máxima de 6 s por bloque (T = 961 frames); audio más largo requiere troceado con descarte de 0,25 s en cada extremo, lo que puede introducir discontinuidades si no se gestiona con solapamiento.
- No se documentan los idiomas ni las condiciones acústicas cubiertas por el entrenamiento original.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y atribución; la model card remite al archivo `LICENSE` del repositorio.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo se reporta como 0.0 GB pese a que el archivo ONNX declarado pesa unos 9,6 MB; conviene verificar la integridad con el SHA-256 indicado (`4ae0b92cd0d5933dc3f4896cd0ad62132e0249d4b6f4b33d95c7518a364d3c70`) antes de usarlo en producción.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks como MMLU o HumanEval ni emplearse para tareas de generación de texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PatiPix/ZipEnhancer-ONNX
- Modelo original en ModelScope: https://modelscope.cn/models/iic/speech_zipenhancer_ans_multiloss_16k_base
- Revisión del modelo original citada: `bed374bb53e4a5ffc62093676bab408a56b0db48`
