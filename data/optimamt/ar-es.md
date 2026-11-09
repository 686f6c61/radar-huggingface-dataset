# OptimaMT/ar-es

## Resumen
OptimaMT/ar-es es un modelo de traduccion automatica arabe a castellano publicado por OptimaMT. No es un modelo entrenado desde cero: es una reexportacion a ONNX del modelo Helsinki-NLP/opus-mt-ar-es (familia OPUS-MT de la Universidad de Helsinki), en la revision `da86e973e723`, con el mismo vocabulario y los mismos pesos, pero con un decodificador fusionado mas ligero. La motivacion principal es reducir el consumo de memoria en inferencia sin alterar la salida: el autor reporta una reduccion del 47-49 % de memoria tras la carga en Linux y Windows manteniendo tokens identicos.

El modelo sigue la arquitectura Marian (transformer encoder-decoder para traduccion), con 62.526 tokens de vocabulario, y se distribuye en formato ONNX cuantizado para su uso con transformers.js y con ONNX Runtime. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace apto para despliegue en entornos con recursos limitados, incluidos navegador y CPU.

Es relevante ahora porque cubre un par linguistico poco atendido (arabe-castellano) con una licencia permisiva (CC BY 4.0) y un formato listo para produccion en JavaScript y Python, sin necesidad de infraestructura GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (`q8`, `decoder_model_merged_quantized.onnx`) |
| Idiomas soportados | arabe (ar), castellano (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); tokenizer en formato Xenova (`tokenizer.json`, `special_tokens_map.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento
La arquitectura es Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica, heredado de Helsinki-NLP/opus-mt-ar-es. El vocabulario tiene 62.526 tokens. El modelo original forma parte de la familia OPUS-MT, entrenada sobre corpus paralelos de OPUS, aunque la informacion proporcionada no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset.

La modificacion introducida por OptimaMT es exclusivamente a nivel de grafo: la proyeccion de salida del decodificador se ha movido fuera de sus dos ramas, y se ha reconstruido `onnx/decoder_model_merged_quantized.onnx`. El resto de ficheros son identicos byte a byte al export ONNX original. No hay indicios de RLHF, DPO ni ajuste adicional; se trata de una optimizacion de inferencia, no de un reentrenamiento.

## Capacidades
- Traduccion de texto de arabe a castellano, tarea unica del pipeline `translation`.
- Inferencia en CPU con ONNX Runtime (probado con la version 1.31.1 y 4 hilos).
- Ejecucion en JavaScript mediante `@huggingface/transformers` con `dtype: "q8"`.
- Ejecucion en Python mediante ONNX Runtime, SentencePiece y NumPy (script `translate.py`).
- Reduccion de memoria tras la carga: de 526 a 281 MiB en Linux (-47 %) y de 503 a 256 MiB en Windows (-49 %) con `disable_quant_qdq = 1`; con los valores por defecto de ONNX Runtime, de 281 a 220 MiB (-22 %) en Linux y de 196 a 168 MiB (-14 %) en Windows.
- Salida identica en tokens al export original, segun el autor.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso
- Traduccion de documentacion tecnica del arabe al castellano: el modelo puede procesar parrafos de documentacion y generar texto en castellano dentro de un pipeline de preprocesamiento o publicacion, con un consumo de memoria inferior a 300 MiB en CPU.
- Localizacion de contenido web en tiempo real desde el navegador: al ejecutarse con transformers.js y ONNX, puede integrarse en una pagina para traducir fragmentos de interfaz o comentarios de usuario sin enviar datos a un servidor externo.
- Atencion al cliente multilingue: traduccion de mensajes entrantes en arabe a castellano antes de pasarlos a un sistema de clasificacion o a un agente humano, aprovechando la baja latencia en CPU.
- Procesamiento por lotes de corpus paralelos: generacion de traducciones de referencia para evaluacion o para aumentar datasets de entrenamiento en proyectos de NLP, con un script Python ligero sobre ONNX Runtime.
- Traduccion de contenido editorial y noticias: conversion de articulos o notas de prensa del arabe al castellano en un servicio backend sin GPU, con memoria acotada.
- Herramientas de escritorio y extensiones: integracion en aplicaciones Electron o extensiones de navegador que necesiten traduccion offline, gracias al formato ONNX y al reducido tamano del repositorio (0,1 GB).
- Sistemas embebidos o entornos con restricciones de memoria: despliegue en dispositivos con poca RAM donde un modelo transformer completo no cabria, gracias a la reduccion del 47-49 % de memoria tras la carga.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta mediciones de memoria y la identidad de tokens respecto al export original, no metricas de calidad de traduccion (BLEU, COMET u otras).

## Requisitos de hardware
- VRAM: no aplica; el modelo esta pensado para CPU. Memoria tras la carga: 281 MiB en Linux y 256 MiB en Windows con `disable_quant_qdq = 1`; 220 MiB y 168 MiB respectivamente con los valores por defecto de ONNX Runtime.
- GPU: no se requieren ni se documentan; el autor prueba exclusivamente en CPU con 4 hilos.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; no se especifican modelos concretos porque no son necesarios.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`), ONNX Runtime en Python (con SentencePiece y NumPy), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles; solo se documenta el consumo de memoria en ONNX Runtime 1.31.1 con 4 hilos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OptimaMT/ar-es | no disponible | no disponible | ar, es | CC BY 4.0 | ONNX (transformers.js) |
| Helsinki-NLP/opus-mt-ar-es | no disponible | no disponible | ar, es | CC BY 4.0 | safetensors / PyTorch |
| Exportaciones Xenova de OPUS-MT | no disponible | no disponible | segun par | CC BY 4.0 | ONNX |

La diferencia principal frente al modelo base es el formato (ONNX frente a PyTorch) y la reduccion de memoria en inferencia, manteniendo pesos y tokens identicos. Frente a las exportaciones Xenova, OptimaMT emplea el mismo layout pero con un decodificador fusionado mas ligero. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo de traduccion unidireccional arabe a castellano; no soporta otras tareas ni otros pares linguisticos.
- No se han publicado evaluaciones de calidad de traduccion; no hay datos de BLEU, COMET ni comparaciones con otros sistemas.
- Riesgo de alucinacion y de errores en terminologia especializada inherente a los modelos Marian de OPUS-MT, especialmente en dominios tecnicos o con jerga.
- No se documenta la longitud maxima de contexto; conviene validar el comportamiento con entradas largas antes de usarlo en produccion.
- Licencia CC BY 4.0: permite uso comercial con atribucion a la Universidad de Helsinki (pesos OPUS-MT) y al autor del export ONNX.
- El rendimiento medido corresponde a ONNX Runtime 1.31.1 en CPU con 4 hilos; los valores pueden variar en otros entornos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ar-es
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ar-es
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
