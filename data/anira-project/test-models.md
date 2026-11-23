# anira-project/test-models

## Resumen

`anira-project/test-models` no es un modelo de lenguaje ni un modelo entrenado para producir inferencias utiles: es una coleccion de redes neuronales de prueba (dummy networks) publicadas por el proyecto anira para validar su infraestructura de inferencia de audio en tiempo real. Cada red aísla una unica funcionalidad (una ganancia, un acumulador con estado, una matriz de tipos de dato, una variante de pesos) y esta construida con aritmetica de enteros o potencias de dos para que todos los runtimes implicados coincidan bit a bit.

El repositorio se distribuye en multiples formatos de despliegue (ONNX, LiteRT/TensorFlow Lite, TorchScript, ExecuTorch con lowering a Core ML y Vulkan, y Core ML ML programs), lo que lo convierte en una herramienta de conformidad cruzada entre backends. Su utilidad es, por tanto, de ingenieria y CI: sirve para comprobar que un backend concreto carga pesos, gestiona estados, respeta dtypes y cambia de modelo sin romper el estado interno.

No hay informacion sobre arquitectura de transformer, numero de parametros, contexto, idiomas ni benchmarks: el tamano del repo es de 0.0 GB y las descargas y likes son cero en el momento de la consulta. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes de prueba especificas por carpeta: ganancia (`audio_out = audio_in * gain`), acumulador con estado explicito, ganancia tipada (int8/int16/float16) y Conv1d de variante unica |
| Parametros totales | no disponible (redes triviales; el repo ocupa 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de audio, no de texto) |
| Tipos de cuantizacion | int8, int16, float16 (carpeta `typed-gain/`); fixture TFLite cuantizado int8 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, LiteRT/TensorFlow Lite, TorchScript (libtorch), ExecuTorch (`.pte`, incluidos `*_coreml.pte` y `*_vulkan.pte`) y Core ML ML programs |

## Arquitectura y entrenamiento

No hay entrenamiento: las redes se exportan mediante scripts de `anira-project/models` (commit `a2e2521`, directorio `test-models/export/`) usando torch 2.14 y ExecuTorch 1.5, y `tools/export/` para Core ML y Vulkan con ExecuTorch 1.3.1 y coremltools 9.0. Cada exportacion se verifica contra los valores esperados o contra ONNX Runtime en el momento de generarse.

Las cuatro familias de redes son: `simple-gain/` (multiplicacion por ganancia mas calculo de pico, en mono, estereo, 4 y 16 canales, con un `.pte` multi-metodo para probar la ruta simple, los recuentos de canal y las entradas estaticas); `stateful-accumulator/` (suma acumulada como par de estado explicito, con version mono, estereo y un gemelo negado, para probar la realimentacion de estado y el cambio de modelo conservando el estado); `typed-gain/` (la misma ganancia en int8, int16 y float16, mas un `.pte` no planificado y fixtures con una matriz de dtypes de 10 ONNX y un TFLite int8 cuantizado); y `variant-gain/` (una Conv1d con tres juegos de pesos: mitad, doble e invertido, para probar el cambio entre modelos de una misma forma). La organizacion es `<carpeta>//<fichero>`.

## Capacidades

- Verificacion de la ruta de inferencia basica: multiplicacion por ganancia y calculo de pico sobre senal de audio.
- Cobertura de recuentos de canal: mono, estereo, 4 y 16 canales.
- Prueba de entradas estaticas y de un `.pte` con multiples metodos.
- Gestion de estado explicito: realimentacion de un par de estado y cambio de modelo conservando el estado.
- Cobertura de tipos de dato de extremo a extremo: int8, int16 y float16, incluido un TFLite cuantizado int8.
- Prueba de cambio entre modelos de la misma forma con distintos pesos (Conv1d con pesos mitad, doble e invertido).
- Conformidad cruzada entre backends: ONNX Runtime, LiteRT/TensorFlow Lite, TorchScript, ExecuTorch (incluido lowering a Core ML y Vulkan) y Core ML.
- No soporta generacion de texto, tool calling, agentes, vision ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Integracion continua de backends de inferencia de audio: ejecutar cada red de prueba contra ONNX Runtime, LiteRT, TorchScript, ExecuTorch y Core ML en cada commit para detectar regresiones de carga de pesos o de calculo.
- Validacion de exportaciones: comparar la salida de cada nuevo `.pte` o `.onnx` contra los valores esperados o contra ONNX Runtime, tal como hacen los propios scripts de exportacion.
- Pruebas de conformidad de dtypes: usar `typed-gain/` para verificar que un runtime respeta int8, int16 y float16 sin promociones silenciosas ni perdida de precision.
- Pruebas de gestion de estado en procesadores de audio en tiempo real: emplear `stateful-accumulator/` para comprobar que el estado se realimenta correctamente y que se conserva al cambiar de modelo.
- Pruebas de enrutado por numero de canal: usar `simple-gain/` para validar rutas de mono a 16 canales y el manejo de entradas estaticas.
- Pruebas de sustitucion de pesos en produccion: usar `variant-gain/` para comprobar que un pipeline puede intercambiar modelos de la misma forma (Conv1d) sin reconstruir el grafo.
- Verificacion de lowering a aceleradores: validar las variantes `*_coreml.pte` y `*_vulkan.pte` frente a la ruta CPU de referencia.
- Reproducibilidad bit a bit entre plataformas: al usar aritmetica entera o potencias de dos, sirve como referencia determinista en pruebas de regresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; las redes son triviales (ganancias, acumuladores y una Conv1d) y el repo ocupa 0.0 GB.
- GPU recomendadas: no disponible; al ser pruebas de conformidad, el objetivo es ejecutarlas en el mayor numero de backends posible, incluidos CPU y aceleradores moviles.
- Compatibilidad con GPU de consumo: no disponible; por el tamano de las redes, cualquier GPU compatible con el backend correspondiente deberia poder ejecutarlas.
- Opciones de despliegue: ONNX Runtime (formato `onnx/`), LiteRT y TensorFlow Lite (`litert/`), TorchScript (`libtorch/`), ExecuTorch (`executorch/`, con variantes Core ML y Vulkan) y Core ML (`coreml/`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada conjuntos de redes de prueba comparables de otros proyectos; la comparacion con modelos de lenguaje o de audio entrenados no aplica por la naturaleza del repositorio.

## Limitaciones y advertencias

- No es un modelo para producir salidas utiles: la propia model card indica que son redes dummy para probar anira y anira-project/models, no modelos que nadie ejecute por su salida.
- Sin datos de sesgo, alucinacion o rendimiento: no hay informacion al respecto porque no se trata de un modelo entrenado.
- Ambito limitado a audio y a las operaciones cubiertas (ganancia, pico, acumulacion, Conv1d); no cubre otras arquitecturas ni tareas.
- La licencia Apache-2.0 permite uso comercial, pero el valor del repositorio es de pruebas, no de produccion.
- Se recomienda fijar una revision al descargar (`resolve/<revision>/...`) para garantizar la reproducibilidad de las pruebas.
- Los ficheros estan organizados por formato y backend; usar el formato equivocado con un runtime dado produce resultados no representativos.
- Fechas de creacion y actualizacion del repositorio en 2026 segun los metadatos de Hugging Face; conviene verificar la revision efectiva antes de integrarlo en CI.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anira-project/test-models
- Repositorio anira: https://github.com/anira-project/anira
- Repositorio de modelos y scripts de exportacion: https://github.com/anira-project/models
- Licencia: https://huggingface.co/anira-project/test-models/blob/main/LICENSE
