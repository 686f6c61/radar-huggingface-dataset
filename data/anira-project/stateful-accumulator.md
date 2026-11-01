# anira-project/stateful-accumulator

## Resumen

El modelo `stateful-accumulator` del proyecto anira es un modelo de prueba mínimo con estado explícito, diseñado para validar el soporte de pares de entrada/salida de estado en el framework de inferencia de audio anira. No es un modelo de lenguaje ni un modelo generativo: se trata de una red acumuladora con estado que se exporta a múltiples runtimes de inferencia (ONNX Runtime, LiteRT, LibTorch, ExecuTorch y Core ML) y que sirve como referencia para comprobar que todos los backends producen resultados coherentes cuando se realimenta el estado entre llamadas consecutivas.

Su relevancia es fundamentalmente de ingeniería: permite verificar la corrección de pipelines de exportación y de ejecución en distintos motores (CPU, Core ML en Apple, Vulkan en GPU) con desviaciones máximas del orden de 1,5e-07 a 1,8e-07 respecto a ONNX Runtime. El repositorio es extremadamente pequeño (0,0 GB) y contiene únicamente los pesos exportados, los scripts de exportación y la licencia.

No se dispone de información sobre arquitectura de red neuronal concreta, número de parámetros, longitud de contexto ni idiomas soportados, ya que la model card no los documenta y el tamaño de los ficheros (1.470 bytes para ONNX) indica un grafo de cómputo trivial orientado a pruebas de integración, no a inferencia de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (red acumuladora con estado explícito; grafo mínimo de prueba) |
| Parametros totales | No disponible (ficheros de 1.470 a 14.419 bytes según formato) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (eje temporal dinámico en ONNX; sin contexto de lenguaje) |
| Tipos de cuantizacion | No disponible (exportaciones en float32 para Core ML; sin cuantización documentada) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, TFLite (LiteRT), PyTorch (.pt LibTorch), ExecuTorch (.pte CPU/Core ML/Vulkan), Core ML (.mlpackage) |

## Arquitectura y entrenamiento

La model card describe el modelo como una "minimal stateful test model" cuyo estado se expone como entrada y salida explícitas, con variantes mono y estéreo. Esto implica una arquitectura recurrente o con memoria interna que se realimenta entre llamadas: en cada invocación se pasa el estado previo como tensor de entrada y se recibe el estado actualizado como tensor de salida, lo que permite streaming de audio por bloques. No se documenta el tipo de capa (LSTM, GRU, acumulador puro), el número de capas, las dimensiones ocultas ni el proceso de entrenamiento.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO). El modelo se distribuye como artefacto de prueba dentro del repositorio `anira-project/example-models` (commit `d1bc5cf`, directorio `StatefulAccumulatorNetwork/models/`), y su función es servir de referencia para validar exportaciones: cada exportación se compara contra ONNX Runtime durante ocho llamadas consecutivas con entrada aleatoria y estado realimentado, midiendo la desviación relativa al pico de salida.

La innovación técnica destacable no está en el modelo en sí, sino en la infraestructura de verificación: el script `tools/check_streaming.py` ejecuta doce llamadas consecutivas sobre todos los formatos y comprueba que coinciden; las desviaciones documentadas son 1,5e-07 y 1,8e-07 para ExecuTorch Core ML y Core ML nativo, mientras que la variante Vulkan se exporta pero no se ejecuta en el entorno de validación por falta de runtime Vulkan.

## Capacidades

- Acumulación de estado entre llamadas consecutivas con estado explícito de entrada y salida.
- Procesamiento de señal mono y estéreo (dos variantes por formato).
- Streaming por bloques con realimentación de estado, adecuado para audio en tiempo real.
- Ejecución multiplataforma: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch (XNNPACK/portable en CPU, Core ML en Apple, Vulkan en GPU) y Core ML nativo (macOS 13, iOS 16).
- Verificación de equivalencia numérica entre backends (desviación máxima documentada de 1,5e-07 a 1,8e-07).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Validación de pipelines de exportación: usar el modelo como caso de prueba para comprobar que un nuevo exportador (por ejemplo, a un runtime emergente) produce salidas equivalentes a ONNX Runtime dentro de la tolerancia esperada.
- Test de integración de motores de inferencia: verificar que un backend (Core ML, Vulkan, XNNPACK) maneja correctamente tensores de estado de entrada y salida en llamadas sucesivas, detectando regresiones en la gestión de memoria o en el orden de los tensores.
- Referencia para streaming de audio: servir como ejemplo mínimo de cómo estructurar un modelo con estado realimentado para procesamiento por bloques en aplicaciones de audio en tiempo real.
- Desarrollo del framework anira: el modelo acompaña a las descripciones de modelo en `anira foundation models` (`models/stateful-accumulator`) y se usa para probar la capa de abstracción de modelos del framework.
- Pruebas de paridad numérica entre plataformas: comparar la salida de la misma red en CPU, GPU (Vulkan) y Neural Engine (Core ML) para cuantificar diferencias de precisión antes de desplegar modelos reales.
- Formación y documentación: ejemplo didáctico de exportación multi-formato (ONNX a TFLite, LibTorch, ExecuTorch y Core ML) con scripts reproducibles (`export/export_litert.py`, `export/export_executorch.py`, `export/export_coreml.py`, `export/export_libtorch.py`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta desviaciones numéricas respecto a ONNX Runtime:

| Formato | Ficheros | Desviación máxima |
|---|---|---|
| ExecuTorch, Core ML (Apple, float32) | `executorch/*_coreml.pte` | 1,5e-07; 1,8e-07 |
| ExecuTorch, Vulkan (GPU) | `executorch/*_vulkan.pte` | Exportado; no ejecutado (sin runtime Vulkan) |
| Core ML ML program (motor nativo de anira, v3; macOS 13, iOS 16) | `coreml/*.mlpackage` | 1,5e-07; 1,8e-07 |

## Requisitos de hardware

- VRAM estimada: despreciable; los ficheros de pesos ocupan entre 1.470 bytes (ONNX) y 14.419 bytes (ExecuTorch Core ML). Cabe en cualquier dispositivo con unos pocos kilobytes de memoria libre.
- GPU recomendadas: no aplica; cualquier GPU compatible con Vulkan puede ejecutar la variante `*_vulkan.pte`, y cualquier chip Apple con Neural Engine puede ejecutar la variante Core ML.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en microcontroladores y dispositivos móviles.
- Opciones de despliegue: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch 1.3.1 (CPU con XNNPACK o kernels portables, Core ML, Vulkan) y Core ML nativo.
- Latencia y throughput: no disponibles; no se documentan mediciones de rendimiento.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la información proporcionada; se trata de un artefacto de prueba específico del framework anira, sin equivalentes públicos documentados en la model card.

## Limitaciones y advertencias

- No es un modelo de producción: es un modelo de prueba (`test-model`) pensado para validar integraciones, no para resolver tareas reales.
- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni procesa instrucciones.
- No se documentan sesgos, pero tampoco se documenta el proceso de entrenamiento, por lo que no puede evaluarse su comportamiento fuera del propósito de prueba.
- Riesgo de alucinación: no aplica en el sentido habitual, pero cualquier uso fuera de la verificación de estado producirá salidas sin significado útil.
- La variante Vulkan se exporta pero no se ha ejecutado en el entorno de validación del autor (sin runtime Vulkan), por lo que su corrección no está verificada empíricamente en la model card.
- La variante Core ML nativa depende del motor de anira v3 y requiere macOS 13 o iOS 16 como mínimo.
- Licencia Apache-2.0: permite uso comercial y modificación, pero al ser un modelo de prueba no aporta valor funcional en producción.
- Verificar el SHA256 de cada fichero al descargar y fijar una revisión concreta del repositorio, tal como recomienda el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anira-project/stateful-accumulator
- Repositorio de modelos de ejemplo: https://github.com/anira-project/example-models (commit `d1bc5cf`, directorio `StatefulAccumulatorNetwork/models/`)
- Descarga con revisión fijada: https://huggingface.co/anira-project/stateful-accumulator/resolve/<revision>/onnx/stateful_accumulator_network_mono.onnx
- Licencia: fichero `LICENSE` en el repositorio (Apache-2.0, copiado del repositorio fuente)
