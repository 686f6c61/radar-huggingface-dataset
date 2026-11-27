# anira-project/stateful-accumulator

## Resumen

Stateful accumulator network es un modelo de prueba mínimo publicado por el proyecto anira, una iniciativa centrada en la inferencia de modelos de audio en tiempo real. No es un modelo de lenguaje ni un modelo generativo: es una red neuronal diminuta con estado explícito de entrada y salida, diseñada para validar el pipeline de exportación y ejecución multiplataforma de anira (LibTorch, ONNX Runtime, LiteRT, ExecuTorch y Core ML nativo). Su función es servir como referencia canónica para verificar que todos los backends producen resultados equivalentes al alimentar el estado de forma recurrente entre llamadas.

El modelo existe en dos variantes, mono y estéreo, y cada una se distribuye en seis formatos distintos (ONNX, TFLite, LibTorch, ExecuTorch para CPU, ExecuTorch para Core ML, ExecuTorch para Vulkan y MLPackage nativo de Core ML). Los ficheros pesan entre 1.470 bytes y 14.419 bytes, lo que da una idea de su escala: no contiene parámetros entrenados en el sentido habitual, sino una operación de acumulación con estado persistente.

Su relevancia es instrumental. Para desarrolladores que integran modelos de audio en aplicaciones de tiempo real (plug-ins de audio, procesamiento de señal en el dispositivo), este repositorio documenta el contrato exacto de entrada/salida con estado y proporciona un banco de pruebas reproducible para comparar precisión entre runtimes. La licencia Apache-2.0 permite reutilizarlo sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red con estado explícito (acumulador); no es un transformer ni un modelo de lenguaje |
| Parámetros totales | No disponible (modelo de prueba mínimo; el fichero ONNX más pequeño pesa 1.470 bytes) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; eje temporal dinámico en ONNX, fijado por la descripción del modelo en anira |
| Tipos de cuantización | No disponible; los artefactos se distribuyen en float32 según los chequeos de Core ML |
| Idiomas soportados | No aplica (modelo de audio/señal, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, TFLite (LiteRT), LibTorch (.pt), ExecuTorch (.pte: CPU, Core ML, Vulkan), Core ML MLPackage |

## Arquitectura y entrenamiento

La arquitectura es un acumulador con estado: en cada llamada recibe una entrada y un estado previo, y devuelve una salida junto con el estado actualizado, de modo que el consumidor debe realimentar el estado en la llamada siguiente. Esta estructura replica el patrón de los modelos de audio con estado recurrente (por ejemplo, LSTMs para procesamiento de guitarra, mencionadas en los scripts de exportación como `--guitar-lstm`), pero sin la complejidad de una red entrenada: es una implementación mínima pensada para validar el contrato de estado.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO, porque el modelo no se entrena para una tarea de aprendizaje: es un artefacto de prueba. La innovación técnica relevante no está en el modelo sino en el pipeline de exportación: conversión de ONNX a PyTorch mediante `onnxsim` (formas estáticas) y `onnx2torch` con conversores trazables, seguida de exportación a LiteRT, ExecuTorch (CPU, Core ML y Vulkan) y Core ML nativo, con verificación de equivalencia numérica contra ONNX Runtime sobre ocho llamadas consecutivas con realimentación de estado y desviación relativa al pico de salida.

## Capacidades

- Acumulación con estado explícito: entrada y salida de estado en cada llamada, en variantes mono y estéreo.
- Ejecución multiplataforma verificada: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch (XNNPACK o kernels portables en CPU, Core ML en Apple, Vulkan en GPU) y Core ML MLPackage nativo.
- Streaming recurrente: el estado se realimenta entre llamadas consecutivas, lo que permite procesar señales por bloques sin perder continuidad.
- Verificación de equivalencia entre backends: desviación máxima frente a ONNX Runtime de 1,5e-07 y 1,8e-07 en ExecuTorch Core ML y Core ML nativo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Validación de pipelines de exportación: usar el modelo como referencia para comprobar que una nueva versión del exportador a TFLite, ExecuTorch o Core ML produce resultados numéricamente equivalentes a ONNX Runtime antes de aplicarlo a modelos reales.
- Pruebas de integración de runtimes de inferencia: verificar que un runtime (ONNX Runtime, LiteRT, ExecuTorch) gestiona correctamente tensores de estado de entrada y salida en llamadas sucesivas, con formas mono y estéreo.
- Desarrollo de plug-ins de audio en tiempo real: servir de plantilla para implementar el contrato de estado recurrente que necesitan los modelos de procesamiento de audio por bloques (por ejemplo, emulación de amplificadores o efectos con LSTM).
- CI/CD de motores de inferencia: incluir el modelo en la batería de tests automatizados de anira foundation models (`tools/check_streaming.py`) para detectar regresiones numéricas entre versiones de los exportadores.
- Benchmark de precisión entre backends: comparar la desviación de cada backend (Core ML, Vulkan, CPU) frente a la referencia ONNX Runtime en doce llamadas consecutivas con estado realimentado.
- Docencia y ejemplos mínimos: ilustrar el patrón de modelos con estado explícito en frameworks móviles (Core ML, ExecuTorch) con un artefacto de tamaño despreciable que cabe en cualquier dispositivo.
- Verificación de despliegue en dispositivos Apple y Android: probar la ruta Core ML (macOS 13, iOS 16) y la ruta Vulkan en GPUs móviles antes de portar modelos de audio de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta desviaciones numéricas frente a ONNX Runtime:

| Formato | Ficheros | Desviación máxima |
|---|---|---|
| ExecuTorch, Core ML (Apple, float32) | `executorch/*_coreml.pte` | 1,5e-07; 1,8e-07 |
| ExecuTorch, Vulkan (GPUs) | `executorch/*_vulkan.pte` | Exportado; no ejecutado (sin runtime Vulkan) |
| Core ML ML program (motor nativo de anira, previsto para v3; macOS 13, iOS 16) | `coreml/*.mlpackage` | 1,5e-07; 1,8e-07 |

## Requisitos de hardware

- VRAM estimada: despreciable; los artefactos pesan entre 1.470 bytes (ONNX) y 14.419 bytes (ExecuTorch Core ML).
- GPU recomendadas: no aplica; cualquier GPU compatible con Vulkan puede ejecutar la variante `*_vulkan.pte`, y cualquier Mac o dispositivo Apple con macOS 13 o iOS 16 puede ejecutar Core ML.
- Cabe en cualquier GPU de consumo y en dispositivos móviles; no requiere acelerador dedicado.
- Opciones de despliegue: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch 1.3.1 (CPU con XNNPACK o kernels portables, Core ML, Vulkan) y Core ML nativo (previsto en anira v3).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (modelos de prueba con estado explícito para validación de exportadores). Los modelos de audio con estado recurrente a los que alude el pipeline (LSTM para guitarra) no se distribuyen en este repositorio ni se detallan en la model card.

## Limitaciones y advertencias

- No es un modelo funcional para producción: es un artefacto de prueba sin capacidad predictiva útil fuera de la validación de pipelines.
- No dispone de parámetros entrenados para una tarea de aprendizaje; no debe evaluarse con métricas de calidad de modelo (MMLU, HumanEval, etc.).
- La variante Vulkan se exportó pero no se ejecutó en el entorno de verificación (sin runtime Vulkan), por lo que su equivalencia numérica no está confirmada.
- El motor Core ML nativo de anira llegará con la versión v3; la ruta MLPackage requiere macOS 13 o iOS 16.
- El eje temporal es dinámico en ONNX; para exportar a otros formatos es necesario proporcionar la descripción del modelo en anira foundation models.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se recomienda fijar una revisión concreta y verificar el SHA256 de cada fichero al descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anira-project/stateful-accumulator
- Repositorio de modelos de ejemplo: https://github.com/anira-project/example-models (commit `d1bc5cf`, ruta `StatefulAccumulatorNetwork/models/`)
- Script de conversión ONNX a PyTorch: https://github.com/anira-project/models/blob/main/tools/export/onnx_to_torch.py
- Script de verificación de exportaciones: https://github.com/anira-project/models/blob/main/tools/export/check.py
- Descarga con revisión fijada: https://huggingface.co/anira-project/stateful-accumulator/resolve/<revision>/onnx/stateful_accumulator_network_mono.onnx
