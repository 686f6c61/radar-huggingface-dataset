# anira-project/simple-gain

## Resumen

`anira-project/simple-gain` no es un modelo de lenguaje ni un modelo fundacional en el sentido habitual. Es una red neuronal mínima de prueba publicada por el proyecto anira, cuyo cometido es multiplicar una señal de audio por una ganancia y devolver también su valor de pico. Se distribuye en cuatro variantes de canalizacion (mono, estereo, 4 y 16 canales) y en multiples formatos de inferencia: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch (CPU, Core ML y Vulkan) y Core ML nativo.

Su relevancia es instrumental: sirve como modelo de referencia y de ejemplo para validar el pipeline de exportacion, streaming y paridad numerica entre motores de inferencia de anira. Cada descripcion se ejecuta en doce llamadas consecutivas realimentando el estado y se comprueba que todos los formatos coinciden con ONNX Runtime, con desviacion maxima de 0.0e+00 en Core ML (Apple, float32) y en el programa ML nativo.

No dispone de parametros en el sentido de un transformer, ni de contexto textual, ni de capacidades generativas. El repositorio ocupa 0.0 GB y los artefactos individuales pesan entre 476 bytes (ONNX) y 7.254 bytes (ExecuTorch con Core ML). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal minima de procesamiento de audio (ganancia + pico); no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa audio por llamadas con estado realimentado) |
| Tipos de cuantizacion | no disponible; los artefactos publicados son float32 (Core ML) y formatos nativos por motor |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, TFLite (LiteRT), LibTorch `.pt`, ExecuTorch `.pte` (CPU, Core ML, Vulkan), Core ML `.mlpackage` |
| Canales soportados | 1 (mono), 2 (estereo), 4 y 16 |
| Tamano por artefacto | 476 B (ONNX), 1.728-1.732 B (TFLite), 3.510-3.630 B (LibTorch), 1.720 B (ExecuTorch CPU), 2.816 B (ExecuTorch Vulkan), 7.254 B (ExecuTorch Core ML), 1.918 B (Core ML nativo) |

## Arquitectura y entrenamiento

La model card describe el modelo como "audio times a gain, plus the peak": una operacion determinista de multiplicacion de la senal de audio por una ganancia, acompanada del calculo del pico. No se documenta una fase de entrenamiento con datos, ni numero de tokens, ni RLHF/DPO, ni innovaciones como atencion lineal o decodificacion especulativa. Se trata de un grafo de computacion trivial exportado a multiples runtimes.

La innovacion tecnica relevante esta en la infraestructura de exportacion y validacion, no en el modelo. El proyecto mantiene scripts (`export_litert.py`, `export_executorch.py`, `export_coreml.py`, `export_libtorch.py`) que convierten el ONNX de origen a cada formato, y una herramienta (`tools/check_streaming.py`) que ejecuta doce llamadas consecutivas con realimentacion de estado y compara cada motor contra ONNX Runtime. Los resultados reportados muestran desviacion 0.0e+00 para ExecuTorch Core ML y para Core ML nativo; la variante Vulkan se exporta pero no se ejecuta en el entorno de validacion por ausencia de runtime Vulkan.

## Capacidades

- Procesamiento de audio por bloques con estado realimentado entre llamadas consecutivas.
- Aplicacion de ganancia a senales de 1, 2, 4 y 16 canales.
- Calculo del valor de pico de la senal procesada.
- Ejecucion en CPU (XNNPACK o kernels portables via ExecuTorch), en GPU via Vulkan y en Apple via Core ML.
- Paridad numerica verificada entre motores (ONNX Runtime como referencia).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Validacion de pipelines de exportacion: sirve como caso de prueba para comprobar que un conversor ONNX a TFLite, LibTorch, ExecuTorch o Core ML produce artefactos funcionalmente equivalentes antes de aplicarlo a modelos reales.
- Test de integracion continua en anira: el modelo se ejecuta en doce llamadas consecutivas con estado realimentado para detectar regresiones en los kernels de cada backend.
- Benchmarking de runtimes: al ser una operacion trivial, permite medir el coste fijo de invocacion, carga y cambio de backend sin que el calculo del modelo enmascare la latencia.
- Prueba de despliegue en dispositivos Apple: la variante Core ML (nativa y via ExecuTorch) valida el flujo de compilacion y ejecucion en macOS 13 e iOS 16.
- Prueba de despliegue en GPU moviles y de escritorio: la variante Vulkan de ExecuTorch permite verificar la cadena de exportacion a GPU, aunque en el entorno del autor no se ejecuto por falta de runtime.
- Ejemplo didactico de streaming con estado: ilustra como realimentar el estado entre llamadas en un motor de inferencia, patron reutilizable para modelos de audio mas complejos.
- Verificacion de paridad numerica: comparar la salida de cada backend contra ONNX Runtime con tolerancia cero en float32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta desviaciones numericas respecto a ONNX Runtime:

| Formato | Ficheros | Desviacion maxima |
|---|---|---|
| ExecuTorch, Core ML (Apple, float32) | `executorch/*_coreml.pte` | 0.0e+00 en las cuatro variantes |
| ExecuTorch, Vulkan (GPUs) | `executorch/*_vulkan.pte` | exportado; no ejecutado (sin runtime Vulkan) |
| Core ML ML program (motor nativo de anira, previsto para v3; macOS 13, iOS 16) | `coreml/*.mlpackage` | 0.0e+00 en las cuatro variantes |

## Requisitos de hardware

- VRAM estimada: practicamente nula; los artefactos pesan entre 476 bytes y 7.254 bytes, por lo que caben en cualquier dispositivo con unos pocos kilobytes libres.
- GPU recomendadas: no aplica en el sentido habitual; la variante Vulkan de ExecuTorch esta pensada para GPUs con soporte Vulkan, y la variante Core ML para hardware Apple (Neural Engine, GPU o CPU).
- Cabe en cualquier GPU de consumo y en moviles; no requiere aceleradores de datacenter.
- Opciones de despliegue: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch 1.3.1 (CPU con XNNPACK o kernels portables, Core ML, Vulkan) y Core ML nativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (redes de prueba para validacion de runtimes de audio). Las alternativas habituales serian otros modelos de ejemplo de cada framework, pero no se aportan datos de parametros, contexto ni rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera texto, no razona, no procesa imagenes ni lenguaje natural.
- No se documenta entrenamiento con datos, por lo que no procede hablar de sesgos de datos; su comportamiento es determinista y definido por la operacion de ganancia.
- No hay riesgo de alucinacion en el sentido de modelos generativos, pero tampoco hay garantia de comportamiento fuera de la operacion especificada.
- No soporta idiomas ni contexto textual; cualquier uso que requiera comprension del lenguaje queda fuera de su alcance.
- La variante Vulkan se exporta pero no se ha ejecutado en el entorno del autor por ausencia de runtime Vulkan; su correccion no esta validada en la model card.
- La variante Core ML nativa depende del motor de anira previsto para la version 3 y de macOS 13 o iOS 16 como minimo.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero al ser un modelo de prueba no aporta valor funcional en produccion mas alla de la validacion de infraestructura.
- No debe confundirse con un modelo fundacional pese a la etiqueta `test-model` y a la ausencia de pipeline declarada.

## Enlaces

- Hugging Face: https://huggingface.co/anira-project/simple-gain
- Repositorio de modelos de ejemplo: https://github.com/anira-project/example-models
- Script de exportacion de origen: `SimpleGainNetwork/simple_gain_network.py` en el repositorio anterior (commit `d1bc5cf`)
