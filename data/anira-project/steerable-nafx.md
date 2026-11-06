# anira-project/steerable-nafx

## Resumen

Steerable NAFX es un modelo de efectos de audio neuronales (neural audio effects) basado en una red convolucional temporal (TCN) que implementa la técnica de efectos de audio "steerable" desarrollada por Christian Steinmetz. No es un modelo de lenguaje: es un procesador de señal de audio en tiempo real que aplica transformaciones tímbricas controlables sobre una señal de entrada. El paquete lo distribuye el proyecto anira en tres variantes de tamaño (modelo completo, 3 bloques y 2 bloques) y en múltiples formatos de despliegue.

La relevancia de esta publicación es fundamentalmente de ingeniería: anira distribuye el mismo modelo exportado a ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch (con backends CPU XNNPACK, Core ML y Vulkan) y Core ML nativo, con verificación numérica cruzada entre formatos. Esto lo convierte en el modelo de referencia y benchmark de CNN del framework anira, pensado para integrar efectos de audio en aplicaciones de escritorio, móviles y embebidas.

El modelo es extremadamente compacto: los artefactos van desde unos 6 KB (ONNX de 2 bloques) hasta unos 178 KB (ExecuTorch con Core ML del modelo completo). No dispone de model card con especificaciones de entrenamiento, dataset o parámetros, por lo que buena parte de los datos técnicos de esta ficha figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TCN (red convolucional temporal), efectos de audio neuronales "steerable" |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por tramas con estado recurrente entre llamadas) |
| Tipos de cuantizacion | no disponible; exportaciones en float32 (Core ML indicado como float32) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, TFLite (LiteRT), LibTorch (.pt), ExecuTorch (.pte), Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El modelo es una red convolucional temporal (TCN) que implementa los efectos de audio neuronales steerable de Christian Steinmetz. Se distribuye en tres profundidades: 2 bloques, 3 bloques y el modelo completo. La arquitectura procesa audio de forma streaming: mantiene un estado interno que se realimenta entre llamadas consecutivas, lo que permite aplicar el efecto de forma continua sobre un flujo de audio en lugar de sobre ventanas independientes. El modelo ONNX original tiene un eje temporal dinámico.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o muestras, la función de pérdida ni si se emplearon técnicas de optimización posteriores. La model card solo documenta el proceso de exportación: conversión del ONNX a PyTorch mediante onnxsim y onnx2torch, y reexportación a cada formato con verificación numérica contra ONNX Runtime sobre ocho llamadas consecutivas con realimentación de estado, con desviaciones relativas al pico de salida del orden de 1e-07 a 2e-07 para XNNPACK, LiteRT, Core ML y Core ML nativo. Los programas ExecuTorch con backend Vulkan se exportaron pero no se ejecutaron en el entorno de verificación por falta de runtime Vulkan.

## Capacidades

- Procesamiento de audio en tiempo real con estado persistente entre tramas (streaming).
- Aplicación de efectos de audio neuronales controlables ("steerable") sobre señales de entrada.
- Tres tamaños de modelo para distintos compromisos de coste computacional y fidelidad.
- Despliegue multiplataforma: escritorio (LibTorch, ONNX Runtime), móvil y embebido (LiteRT/TFLite, ExecuTorch), Apple (Core ML nativo y backend Core ML en ExecuTorch) y GPU (backend Vulkan en ExecuTorch).
- Ejecución en CPU con kernels XNNPACK o portables en ExecuTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Procesamiento de audio en tiempo real en aplicaciones de escritorio: integración vía LibTorch u ONNX Runtime para aplicar el efecto sobre el flujo de audio con estado realimentado entre llamadas, adecuado por el tamaño reducido del modelo (144 KB en LibTorch para el completo).
- Efectos de audio en aplicaciones iOS y macOS: el paquete Core ML nativo y el backend Core ML de ExecuTorch permiten ejecutar el modelo en el Neural Engine o GPU de Apple con requisitos de macOS 13 e iOS 16 para el motor nativo de anira v3.
- Audio en dispositivos Android y embebidos: los artefactos LiteRT/TFLite (desde 13 KB) y ExecuTorch con kernels XNNPACK están pensados para entornos con memoria y cómputo limitados.
- Aceleración por GPU en plataformas compatibles con Vulkan: los programas ExecuTorch con backend Vulkan (desde 12 KB) permiten descargar el cómputo del efecto a la GPU en dispositivos que expongan ese runtime.
- Benchmark y validación de frameworks de inferencia: al publicarse el mismo modelo en cinco formatos con comprobación numérica cruzada, sirve para medir y comparar latencia, precisión y compatibilidad de ONNX Runtime, LiteRT, LibTorch, ExecuTorch y Core ML en una carga de audio realista.
- Prototipado de cadenas de efectos en producción musical: las tres profundidades permiten elegir entre la variante de 2 bloques para bajo coste y el modelo completo para mayor fidelidad, integrándolos en un pipeline de procesamiento de señal existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente reporta desviaciones numéricas de las exportaciones frente a ONNX Runtime (máximo 2.1e-07 para XNNPACK y LiteRT, 2.0e-07 para Core ML en ExecuTorch y Core ML nativo), así como una nota cualitativa: los programas ExecuTorch originales de anira con kernels portables tardaban 427 ms por llamada en el modelo de un bloque, motivo por el que se reexportaron.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño de los artefactos (6 KB a 178 KB) el modelo cabe holgadamente en memoria de cualquier GPU o incluso en memoria de trabajo de CPU.
- GPU recomendadas: no se especifican. El backend Vulkan de ExecuTorch está pensado para GPUs compatibles con Vulkan; el backend Core ML para GPUs y Neural Engine de Apple.
- GPU de consumo: sí cabe en cualquier GPU de consumo; el cuello de botella no es la memoria sino la latencia por llamada y el soporte del runtime.
- Opciones de despliegue: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch 1.3.1 (CPU XNNPACK o kernels portables, Core ML, Vulkan) y Core ML nativo (macOS 13, iOS 16, previsto para anira v3).
- Latencia y throughput: no disponibles de forma agregada; solo se documenta el dato de 427 ms por llamada de los programas ExecuTorch portables originales de un bloque, que motivaron la reexportación.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de efectos de audio neuronales ni datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es incorrecta.
- No se documentan sesgos, dataset de entrenamiento ni evaluación de calidad perceptual del efecto; no hay base para afirmar su comportamiento fuera de la distribución de audio de entrenamiento.
- Los artefactos LiteRT y ExecuTorch originales de anira (carpeta `upstream/`) fueron retirados de las descripciones porque la versión LiteRT calcula algo distinto al resto de formatos (desviación del 17 al 52 % desde la primera llamada) y los programas ExecuTorch portables eran lentos (427 ms por llamada). Debe usarse la versión reexportada, no la de `upstream/`.
- Los programas ExecuTorch con backend Vulkan se exportaron pero no se verificaron numéricamente por falta de runtime Vulkan en el entorno del autor.
- El motor Core ML nativo de anira no está disponible hasta la versión 3 del framework; hasta entonces debe usarse el backend Core ML de ExecuTorch.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva del trabajo de Christian Steinmetz (repositorio `csteinmetz1/steerable-nafx`) a través de un fork; conviene revisar la licencia y atribución del repositorio original.
- El rendimiento en producción depende críticamente del runtime elegido y del soporte de estado entre llamadas; una integración que no realimente el estado correctamente producirá artefactos de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anira-project/steerable-nafx
- Fork de origen de los pesos: https://github.com/faressc/steerable-nafx (commit `e495467`)
- Repositorio original de Christian Steinmetz: https://github.com/csteinmetz1/steerable-nafx
