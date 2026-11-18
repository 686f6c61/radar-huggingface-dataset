# eetmie/xvla-base-onnx

## Resumen

X-VLA 0.9B split ONNX es una conversión del modelo base `lerobot/xvla-base` a doce grafos ONNX en FP16, publicada por el usuario `eetmie`. El objetivo no es distribuir una política robótica lista para usar, sino ofrecer un punto de partida reproducible para ajustar (fine-tune) un modelo visión-lenguaje-acción (VLA) propio y desplegarlo en hardware embebido. La conversión se realizó con LeRobot 0.6.1 y los pesos del modelo base no se han modificado.

La relevancia de esta ficha radica en el fraccionamiento deliberado del modelo: los doce grafos permiten construir motores TensorRT individuales que encajen en la memoria de una Jetson Orin Nano de 8 GB, un escenario donde un único grafo del modelo completo no cabría. Se trata, por tanto, de un artefacto de ingeniería de despliegue más que de un modelo nuevo, con formas estáticas y un contrato de entrada/salida documentado en `bundle.json`.

El repositorio ocupa 1,8 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base. No se han publicado datos de rendimiento en tareas robóticas reales, ni benchmarks comparativos, ni información sobre idiomas soportados más allá del codificador de texto empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): torre de visión DaViT, codificador de texto Florence-2, transformador de política de 24 bloques para denoising |
| Parametros totales | 0.9B (según el nombre del repositorio y la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3 ranuras de imagen de 50 tokens cada una y un presupuesto de lenguaje de 50 tokens (formas estáticas) |
| Tipos de cuantizacion | FP16 en los grafos ONNX exportados; no se documentan otras precisiones |
| Idiomas soportados | no disponible (tokenizador `facebook/bart-large`; el codificador de texto recibe ids de token) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (12 grafos) + `bundle.json` + `MANIFEST.sha256` + tokenizador |

## Arquitectura y entrenamiento

El modelo sigue un diseño VLA con tres componentes diferenciados. La percepción visual corre a cargo de una torre DaViT, exportada en cuatro grafos (`vision_0..3.onnx`). El texto se procesa con un codificador Florence-2 dividido en tres grafos (`text_encoder_0..2.onnx`), que consume ids de token producidos por el tokenizador de `facebook/bart-large` fijado en el commit `cb48c1365bd826bd521f650dc2e0940aee54720c`. La parte generativa es un transformador de política de 24 bloques, fragmentado en cuatro grafos de seis bloques cada uno (`denoise_0..3.onnx`), que opera mediante un bucle de denoising de 10 pasos sobre un chunk de 30 acciones. Un grafo adicional (`cond.onnx`) realiza el ensamblado de la condicionamiento.

Las formas son estáticas en todos los grafos: tres ranuras de vista de imagen de 50 tokens, presupuesto de lenguaje de 50 tokens, chunk de 30 acciones, 10 pasos de denoising y estado y acción de dimensión 20 en el espacio `ee6d`. Cualquier cambio en estas dimensiones exige reexportar. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se describe ninguna innovación de decodificación o atención más allá del esquema de denoising propio de los modelos de difusión para políticas.

## Capacidades

- Generación de acciones robóticas de dimensión 20 en el espacio `ee6d` a partir de observaciones visuales y una instrucción en lenguaje natural.
- Procesamiento de hasta tres vistas de cámara simultáneas, con 50 tokens por vista.
- Condicionamiento por instrucción textual con un presupuesto de 50 tokens.
- Producción de chunks de 30 acciones por inferencia, lo que permite ejecutar varios pasos de control por llamada.
- Denoising iterativo de 10 pasos para refinar el chunk de acciones.
- Exportación a TensorRT por grafos independientes, pensada para despliegue en Jetson Orin Nano de 8 GB.
- Soporte de tool calling, agentes, visión general, audio o modo thinking: no disponible; el modelo está especializado en control robótico.

## Casos de uso

- Punto de partida para fine-tuning de políticas robóticas: los pesos base sin modificar permiten ajustar el modelo a un robot concreto con LeRobot 0.6.1 y reexportar a ONNX con las formas del nuevo setup.
- Despliegue en Jetson Orin Nano: el fraccionamiento en doce grafos permite compilar motores TensorRT individuales que caben en 8 GB de memoria, algo inviable con un único grafo del modelo completo.
- Manipulación con múltiples cámaras: las tres ranuras de imagen admiten configuraciones de muñeca, hombro y vista global, habituales en brazos manipuladores.
- Control por instrucción en lenguaje natural: el codificador Florence-2 permite condicionar la política con comandos cortos, adecuado para estaciones de trabajo colaborativas donde el operario dicta la tarea.
- Investigación en VLA sobre hardware de borde: la paridad medida en exportación (coseno 0.999993 en acciones) facilita validar que la conversión ONNX no degrada la política antes de invertir en entrenamiento.
- Integración en pipelines de robótica con LeRobot: el formato ONNX y el `bundle.json` con entradas y salidas permiten conectar el modelo a un runtime propio sin depender del stack de PyTorch.
- Evaluación comparativa de estrategias de fragmentación: los doce grafos sirven como banco de pruebas para medir latencia y consumo de memoria de distintas particiones en TensorRT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico aportado es la paridad en tiempo de exportación medida en CPU, con un coseno de 0.999993 para las acciones. No hay cifras de tasa de éxito en tareas, latencia en Jetson ni throughput.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1,8 GB en FP16; el objetivo declarado es que cada motor TensorRT quepa en una Jetson Orin Nano de 8 GB, aunque no se especifica el consumo por grafo.
- GPU recomendadas: Jetson Orin Nano (objetivo principal); no se documentan otras GPU validadas.
- GPU de consumo: no hay información sobre compatibilidad con RTX 4090 u otras tarjetas de escritorio; el diseño está orientado a borde.
- Opciones de despliegue: ONNX Runtime y TensorRT; el autor mantiene el repositorio `jetson-orin-nano-vla` con detalles de runtime, limitaciones y benchmark reproducible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| eetmie/xvla-base-onnx | 0.9B | 3x50 tokens imagen + 50 tokens texto | ONNX (12 grafos FP16) | Apache 2.0 | Conversión para Jetson; pesos sin ajustar |
| lerobot/xvla-base | 0.9B | no disponible | no disponible | no disponible | Modelo original del que deriva esta conversión |
| Otras políticas VLA de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Los pesos son los del modelo base sin ajustar: no constituyen una política que controle un robot tal cual y requieren fine-tuning previo.
- Las formas son estáticas; cambiar el número de vistas, el presupuesto de tokens, el chunk de acciones, los pasos de denoising o la dimensionalidad exige reexportar los grafos.
- El presupuesto de lenguaje de 50 tokens limita la complejidad de las instrucciones que el modelo puede procesar.
- El chunk de 30 acciones y los 10 pasos de denoising fijan el coste computacional por inferencia; no es configurable en tiempo de ejecución.
- No se documentan sesgos conocidos ni evaluación de alucinación; al tratarse de una política de control, el riesgo relevante es la ejecución de acciones incorrectas, no la generación de texto.
- No hay información sobre idiomas soportados; el tokenizador es `facebook/bart-large`, mayoritariamente inglés.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- El repositorio registra cero descargas y cero likes, por lo que no existe validación comunitaria del artefacto.
- La fecha de creación indicada (2026-08-31) es posterior a la de actualización (2026-11-18) en los metadatos, lo que conviene verificar antes de fijar una versión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eetmie/xvla-base-onnx
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Repositorio de runtime y benchmark: https://github.com/eetmie/jetson-orin-nano-vla
- Tokenizador: https://huggingface.co/facebook/bart-large
