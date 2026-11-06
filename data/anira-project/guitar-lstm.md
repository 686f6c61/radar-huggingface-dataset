# anira-project/guitar-lstm

## Resumen
GuitarLSTM es un modelo de red neuronal recurrente (LSTM combinada con convoluciones) diseñado para emular el sonido de amplificadores de guitarra eléctrica. Lo desarrolla originalmente GuitarML y esta versión la publica el proyecto anira, que lo empaqueta en multiples formatos de inferencia para su uso en aplicaciones de audio en tiempo real. No es un modelo de lenguaje: es un modelo de procesamiento de señal de audio orientado a efectos de guitarra.

El modelo resuelve el problema de la emulación de amplificadores mediante modelado neuronal: en lugar de aproximar el comportamiento no lineal de un amplificador con circuitos digitales clásicos, una LSTM aprende la respuesta dinámica del equipo a partir de grabaciones reales. El resultado es un modelo muy compacto (entre 50 y 290 KB según el formato) que puede ejecutarse embebido en plugins y aplicaciones móviles.

Su relevancia actual radica en el ecosistema de exportación que lo acompaña: un mismo conjunto de pesos se distribuye en ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch (CPU, Core ML y Vulkan) y Core ML nativo, con comprobaciones de consistencia entre formatos. Es, en la práctica, un ejemplo de referencia de red híbrida (convoluciones + LSTM) en el framework anira.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red híbrida: convoluciones + LSTM (GuitarLSTM) |
| Parametros totales | no disponible (pesos entre 50 KB y 290 KB según formato) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio por bloques de 256 muestras |
| Tipos de cuantizacion | no disponible (exportaciones en float32) |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX, TFLite (LiteRT), TorchScript (.pt), ExecuTorch (.pte: CPU, Core ML, Vulkan), Core ML (.mlpackage) |

## Arquitectura y entrenamiento
La arquitectura es una red híbrida que combina capas convolucionales con una capa LSTM, siguiendo el diseño de GuitarLSTM de GuitarML. Las convoluciones extraen características locales de la forma de onda de entrada y la LSTM modela la dependencia temporal y la respuesta dinámica del amplificador, incluyendo su comportamiento no lineal y la memoria de estado entre bloques de audio. El modelo procesa bloques de 256 muestras y mantiene un estado interno que se realimenta entre llamadas consecutivas, condición necesaria para un procesamiento de audio continuo y sin discontinuidades.

No se dispone de información sobre el conjunto de datos de entrenamiento (número de tokens no aplica; número de muestras de audio, duración, composición del dataset de amplificadores ni técnica de optimización) en la documentación proporcionada. La innovación técnica destacable no está en el entrenamiento sino en la cadena de exportación: el repositorio incluye scripts para convertir el modelo a LiteRT, ExecuTorch (con backend Core ML y Vulkan), Core ML nativo y LibTorch, verificando cada exportación contra ONNX Runtime a lo largo de doce llamadas consecutivas con realimentación de estado. Las desviaciones máximas reportadas son del orden de 7e-08 a 8e-08 en los formatos verificados.

## Capacidades
- Emulación de amplificadores de guitarra: reproduce la respuesta dinámica y no lineal de un amplificador a partir de la señal de entrada.
- Procesamiento de audio en tiempo real por bloques de 256 muestras con estado recurrente persistente entre bloques.
- Inferencia multiplataforma: ejecución en CPU (XNNPACK o kernels portables), GPU mediante Vulkan, y aceleración en Apple mediante Core ML.
- Compatibilidad con múltiples runtimes: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch y Core ML nativo.
- Integración en el framework anira como ejemplo de red híbrida y como modelo de referencia para el sistema de descripciones de modelos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso
- Plugins de amplificador para DAW: el modelo se carga en un plugin VST/AU y procesa la señal de guitarra en tiempo real con latencia de un bloque de 256 muestras, sustituyendo a un amplificador físico en el estudio.
- Pedaleras y hardware embebido: gracias a su tamaño (50-60 KB en ONNX o ExecuTorch CPU) cabe en dispositivos con recursos limitados y puede ejecutarse con LiteRT o ExecuTorch sobre CPU.
- Aplicaciones móviles de guitarra: la exportación a Core ML permite aprovechar la aceleración de Apple en iOS y macOS, con una versión nativa ML program disponible para macOS 13 e iOS 16.
- Procesamiento en GPU de bajo consumo: la variante Vulkan de ExecuTorch permite ejecutar el modelo en GPUs integradas o discretas sin depender de CUDA.
- Referencia para desarrollo de modelos de audio en anira: sirve como caso de prueba de la cadena de exportación y de las comprobaciones de consistencia entre formatos (streaming con estado realimentado).
- Investigación en modelado neuronal de efectos: al ser un modelo pequeño y con múltiples exportaciones verificadas, es útil como base para experimentar con arquitecturas híbridas convolución-LSTM en procesamiento de audio.
- Pruebas de regresión en pipelines de audio: las comprobaciones de desviación entre formatos permiten validar que una implementación concreta reproduce fielmente el comportamiento de referencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de consistencia numérica entre formatos de exportación (desviación máxima frente a ONNX Runtime):

| Formato | Desviación máxima |
|---|---|
| LiteRT / TensorFlow Lite | 8.4e-08 |
| ExecuTorch Core ML (float32) | 7.1e-08 |
| Core ML ML program nativo | 7.8e-08 |
| ExecuTorch Vulkan | exportado; no ejecutado en la verificación (sin runtime Vulkan) |

## Requisitos de hardware
- VRAM estimada: inferior a 1 MB para los pesos en cualquiera de los formatos (50-290 KB); el consumo real lo determina el estado recurrente y los buffers del runtime, no el modelo.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo está pensado para CPU. La variante Vulkan puede ejecutarse en GPUs compatibles con Vulkan, y la variante Core ML en hardware Apple.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU; es un modelo de despliegue embebido.
- Opciones de despliegue: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch 1.3.1 (CPU con XNNPACK o kernels portables, Core ML, Vulkan) y Core ML nativo.
- Latencia y throughput: no disponibles en la información proporcionada. El diseño procesa bloques de 256 muestras, lo que condiciona la latencia mínima al tamaño de bloque elegido.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, el ecosistema GuitarML publica otros modelos de emulación de amplificadores (por ejemplo, variantes basadas en WaveNet), pero no se aportan datos de parámetros, contexto ni rendimiento que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GuitarLSTM (anira) | no disponible (50-290 KB de pesos) | bloques de 256 muestras | GPL-3.0 | Hugging Face, múltiples formatos |
| Alternativas GuitarML | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo específico de audio: no es un modelo de lenguaje ni un modelo generativo; no debe evaluarse con métricas de NLP.
- Sesgos: no se documentan sesgos en el sentido de NLP; el modelo reproduce el amplificador concreto con el que fue entrenado, por lo que su respuesta está limitada a ese equipo y a las condiciones de grabación originales.
- Riesgo de alucinación: no aplica en el sentido habitual, pero el modelo puede generar artefactos o respuestas no realistas ante señales de entrada fuera del dominio de entrenamiento (niveles extremos, guitarras con distinta impedancia, etc.).
- Limitaciones de formato: la model card advierte de que el fichero original de anira (`upstream/litert/GuitarLSTM-256.tflite`) calcula algo distinto al resto de formatos, con desviaciones del 12 al 16 % desde la primera llamada; debe usarse `litert/GuitarLSTM.tflite`, exportado desde el mismo módulo PyTorch.
- La variante Vulkan no fue ejecutada en la verificación por falta de runtime Vulkan; su corrección no está validada en ese entorno.
- Licencia GPL-3.0: el software que distribuya estos pesos puede tener que cumplir los términos de la GPL, incluida la obligación de liberar el código fuente; es un caveat importante para uso comercial en productos propietarios.
- El modelo mantiene estado entre llamadas; un uso incorrecto (no realimentar el estado o reiniciarlo) produce discontinuidades audibles.
- Idiomas: no aplica; no hay soporte lingüístico.

## Enlaces
- [Hugging Face: anira-project/guitar-lstm](https://huggingface.co/anira-project/guitar-lstm)
- [Repositorio fuente: faressc/GuitarLSTM](https://github.com/faressc/GuitarLSTM) (fork en el commit `08c7418`)
- [Repositorio original: GuitarML/GuitarLSTM](https://github.com/GuitarML/GuitarLSTM)
