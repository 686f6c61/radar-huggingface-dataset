# liodon-ai/Qwen2-1.5B-Instruct-ONNX

## Resumen

El modelo `liodon-ai/Qwen2-1.5B-Instruct-ONNX` es una exportación al formato ONNX del modelo original `Qwen/Qwen2-1.5B-Instruct`, realizada por Liodon AI mediante la librería `optimum`. Esta conversión permite ejecutar el modelo con ONNX Runtime, tanto en CPU como en GPU, y ofrece tres versiones de precisión: FP32, FP16 e INT8 dinámico. El objetivo principal es facilitar el despliegue en entornos de producción que requieran interoperabilidad con el ecosistema ONNX, así como reducir el consumo de memoria y acelerar la inferencia en hardware variado.

Al tratarse de una conversión directa del modelo base, conserva las capacidades lingüísticas y de razonamiento del Qwen2-1.5B-Instruct original, aunque no se incluyen modificaciones en los pesos ni entrenamiento adicional. La versión cuantizada dinámica INT8 reduce significativamente el tamaño del archivo (de 7,11 GB a 1,78 GB), lo que la hace adecuada para entornos con recursos limitados, aunque con una posible pérdida mínima de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8 dinamico (weight-only) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo en la informacion disponible. Se trata de una exportacion directa del modelo `Qwen/Qwen2-1.5B-Instruct` realizada con `optimum` (tarea `text-generation-with-past`), lo que implica que el grafo ONNX incluye entradas y salidas para el cache de claves y valores (past key-values) con el fin de soportar decodificacion autoregresiva con cache. No se ha realizado ningun entrenamiento adicional ni ajuste de pesos; la conversion es puramente tecnica.

## Capacidades

- Generacion de texto: el modelo es capaz de producir texto coherente y contextualmente relevante, segun las capacidades del modelo base Qwen2-1.5B-Instruct.
- Conversacion: etiquetado como "conversational" en el repositorio, lo que indica que puede mantener dialogos multiturno.
- Instruccion: al ser una variante "Instruct", esta optimizado para seguir instrucciones y responder a peticiones del usuario.
- Inferencia con cache: el grafo ONNX esta disenado para usar past-key-values, lo que permite una decodificacion eficiente en aplicaciones de generacion secuencial.
- Compatibilidad multiplataforma: al estar en formato ONNX, puede ejecutarse en cualquier entorno que soporte ONNX Runtime, incluyendo CPU, GPU y dispositivos edge.

## Casos de uso

- Despliegue en produccion con ONNX Runtime: el modelo puede integrarse en servicios de inferencia que ya utilizan ONNX Runtime, evitando la dependencia de frameworks de deep learning como PyTorch. La version FP16 es adecuada para GPUs con soporte de precision reducida, mientras que la version INT8 puede ejecutarse en CPU con bajo consumo de memoria.
- Inferencia en entornos con restricciones de memoria: la cuantizacion INT8 (1,78 GB) permite ejecutar el modelo en dispositivos con poca RAM o VRAM, como mini-PCs o sistemas embebidos, manteniendo un rendimiento aceptable para tareas de generacion de texto.
- Prototipado rapido en notebooks: gracias a la integracion con `optimum.onnxruntime.ORTModelForCausalLM`, los desarrolladores pueden cargar el modelo y utilizarlo en entornos Jupyter o Colab sin necesidad de configurar un entorno complejo.
- Migracion de modelos PyTorch a ONNX: sirve como referencia para equipos que necesitan convertir sus propios modelos a ONNX, mostrando la estructura de grafo con cache y los pasos de exportacion.
- Evaluacion de cuantizacion: los tres archivos (FP32, FP16, INT8) permiten comparar el impacto de la cuantizacion en la calidad de las respuestas y en el rendimiento, util para decidir que variante desplegar.
- Integracion en pipelines de inferencia con ONNX Runtime: al ser un modelo estandar ONNX, puede combinarse con otros componentes del ecosistema ONNX (pre/postprocesado, aceleradores) para construir pipelines modulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamano de archivo):
  - FP32: ~7,1 GB de memoria (VRAM o RAM) para cargar el modelo completo.
  - FP16: ~3,7 GB de memoria, adecuado para GPUs con al menos 4 GB de VRAM (ej. NVIDIA T4, RTX 3050).
  - INT8 dinamico: ~1,8 GB de memoria, puede ejecutarse en CPUs con 4 GB de RAM o en GPUs de gama baja.
- GPU recomendadas: para FP16 se recomiendan GPUs con soporte de precision media (NVIDIA Volta o superior). Para INT8, cualquier GPU con al menos 2 GB de VRAM es suficiente, aunque tambien es viable en CPU.
- En consumer GPU: la version INT8 cabe en GPUs como la GTX 1650 (4 GB) o RTX 3060 (12 GB). La version FP16 cabe en RTX 2060 (6 GB) o superiores. La version FP32 requiere una GPU con mas de 8 GB de VRAM.
- Opciones de despliegue: ONNX Runtime (con `CPUExecutionProvider` o `CUDAExecutionProvider`), `optimum.onnxruntime.ORTModelForCausalLM` como wrapper de alto nivel, o integracion en servicios como FastAPI con ONNX Runtime.
- Latencia y throughput: no se han publicado datos oficiales. Se espera que la version INT8 sea la mas rapida en CPU, mientras que FP16 ofrece el mejor equilibrio en GPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos. La unica referencia clara es el modelo base `Qwen/Qwen2-1.5B-Instruct`, del cual esta version ONNX es una conversion directa. No se conocen datos de rendimiento ni especificaciones de otros modelos comparables en el contexto de esta ficha.

## Limitaciones y advertencias

- Licencia: la licencia se indica como "other", lo que puede implicar restricciones de uso comercial o modificacion. Se recomienda revisar la licencia del modelo base `Qwen/Qwen2-1.5B-Instruct` para conocer las condiciones exactas.
- Cuantizacion dinamica INT8: al ser una cuantizacion weight-only sin calibracion, puede producirse una degradacion de la precision en tareas que requieren alta exactitud. Se recomienda evaluar el impacto en el caso de uso especifico.
- Sin informacion sobre sesgos: no se proporcionan datos sobre sesgos o comportamientos indeseados del modelo. Al ser una copia del modelo base, hereda las limitaciones de este, que no estan documentadas en esta ficha.
- Requisitos de contexto: al no especificarse la longitud de contexto, se asume la del modelo original (32k tokens segun la documentacion de Qwen2), pero no se confirma en la informacion disponible.
- Uso en produccion: la falta de benchmarks y de datos de rendimiento hace necesario realizar pruebas propias antes de desplegar el modelo en entornos criticos.

## Enlaces

- Repositorio HuggingFace del modelo: [liodon-ai/Qwen2-1.5B-Instruct-ONNX](https://huggingface.co/liodon-ai/Qwen2-1.5B-Instruct-ONNX)
- Modelo base en HuggingFace: [Qwen/Qwen2-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2-1.5B-Instruct)
- Documentacion de optimum (herramienta de exportacion): [Optimum](https://github.com/huggingface/optimum)
