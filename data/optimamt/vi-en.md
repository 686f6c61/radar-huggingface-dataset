# OptimaMT/vi-en

## Resumen

OptimaMT/vi-en es un modelo de traduccion automatica vietnamita-ingles publicado por OptimaMT, un proyecto que distribuye 49 pares de idiomas bajo el patron de nomenclatura `OptimaMT/<src>-<tgt>`. No es un modelo entrenado desde cero: se trata de una copia directa de Xenova/opus-mt-vi-en (revision `541dfd72ec07`), que a su vez es la exportacion ONNX del modelo OPUS-MT de la Universidad de Helsinki. La unica modificacion consiste en reconstruir el decoder fusionado en formato ONNX para reducir el consumo de memoria en tiempo de ejecucion, manteniendo la misma proyeccion de salida y los mismos pesos.

El modelo emplea la arquitectura Marian (transformer encoder-decoder) propia de la familia OPUS-MT, con un vocabulario de 53.739 tokens y orientado exclusivamente a la traduccion de vietnamita a ingles. Su relevancia practica reside en el ahorro de memoria: segun la model card, tras la carga el consumo baja de 465 a 255 MiB en Linux con `disable_quant_qdq = 1` (un 45 % menos) y de 251 a 198 MiB con los valores por defecto de ONNX Runtime (21 % menos), produciendo tokens identicos. El repositorio ocupa 0,1 GB y esta pensado para ejecutarse en el navegador o en CPU mediante transformers.js.

La ficha se basa unicamente en la informacion publicada en Hugging Face y en la model card del autor; no se han publicado resultados de benchmarks ni detalles sobre el corpus de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); soporte de `disable_quant_qdq` |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de ficheros identicos al original) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia Marian, el mismo esquema que emplean los modelos OPUS-MT de Helsinki-NLP. La exportacion a ONNX la realizo originalmente Xenova y OptimaMT la redistribuye modificando unicamente el grafo del decoder fusionado: la proyeccion de salida del decoder se ha sacado de sus dos ramas (cambio exclusivamente de grafo, sin alterar pesos ni vocabulario). El vocabulario consta de 53.739 tokens y el unico fichero reconstruido es `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son byte a byte los originales.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo ajuste fino con RLHF o DPO. El entrenamiento original corresponde al proyecto OPUS-MT de la Universidad de Helsinki, que entrena sobre corpus paralelos de OPUS; los detalles concretos de ese entrenamiento no se recogen en la informacion proporcionada. La innovacion tecnica destacable de esta version es el ahorro de memoria en la carga del decoder fusionado, verificado con ONNX Runtime 1.31.1 en CPU con 4 hilos.

## Capacidades

- Traduccion de texto de vietnamita a ingles, unica direccion soportada.
- Generacion de texto seq2seq mediante `text2text-generation`.
- Ejecucion en navegador y en Node.js a traves de transformers.js con backend ONNX.
- Inferencia en CPU sin GPU, gracias al bajo consumo de memoria tras la carga (255 MiB en Linux con `disable_quant_qdq = 1`).
- Salida de tokens identica a la del modelo base Xenova/opus-mt-vi-en, segun la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada estrictamente al par vi-en.

## Casos de uso

- Traduccion de documentacion tecnica de vietnamita a ingles en pipelines de localizacion: el modelo se integra como paso de traduccion en un flujo automatizado y su bajo consumo permite ejecutarlo en el mismo servidor que el resto del pipeline.
- Traduccion en el navegador sin backend: mediante transformers.js y el ejemplo de la model card, se puede ofrecer traduccion vi-en en una aplicacion web del lado del cliente, sin enviar el texto a un servidor externo.
- Preprocesado de corpus para investigacion: traduccion masiva de textos vietnamitas a ingles antes de tareas de analisis, indexacion o entrenamiento de otros modelos, aprovechando la inferencia en CPU.
- Atencion al cliente en mercados vietnamitas: traduccion de mensajes entrantes de vietnamita a ingles para que un agente o un sistema posterior los procese en ingles, con latencia baja por el tamano reducido del modelo.
- Traduccion de resenas y contenido generado por usuarios: procesamiento por lotes de opiniones, comentarios o titulares en vietnamita para su analisis de sentimiento en ingles.
- Prototipado y pruebas de integracion: al ser una copia drop-in del modelo base con menos memoria, sirve para validar pipelines de traduccion en entornos con recursos limitados (contenedores pequenos, dispositivos de borde) antes de desplegar variantes mayores.
- Traduccion de subtitulos o transcripciones: conversion de segmentos cortos de vietnamita a ingles en herramientas de accesibilidad o subtitulado, donde el modelo se ejecuta en CPU junto al resto del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta mediciones de memoria tras la carga y la comprobacion de que los tokens generados son identicos a los del modelo base:

| Metrica | Linux | Windows |
|---|---:|---:|
| Memoria tras carga, `disable_quant_qdq = 1` | 465 → 255 MiB (-45 %) | 442 → 232 MiB (-47 %) |
| Memoria tras carga, valores por defecto de ONNX Runtime | 251 → 198 MiB (-21 %) | 181 → 154 MiB (-15 %) |
| Tokens identicos al modelo base | si | si |

Mediciones realizadas con ONNX Runtime 1.31.1 en CPU con 4 hilos (Windows en una maquina virtual).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso medido (ejecucion en CPU); el consumo de memoria tras la carga es de 154-255 MiB segun plataforma y configuracion.
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU y navegador, por lo que no requiere GPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; el repositorio completo ocupa 0,1 GB.
- Opciones de despliegue: transformers.js con backend ONNX Runtime (ejemplo oficial en JavaScript) y script Python con `onnxruntime`, `sentencepiece` y `numpy` (`translate.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/vi-en | no disponible | no disponible | vi → en | CC BY 4.0 | ONNX | Decoder fusionado reconstruido; menor memoria que el base |
| Xenova/opus-mt-vi-en | no disponible | no disponible | vi → en | CC BY 4.0 | ONNX | Modelo base de esta version; misma salida de tokens |
| Helsinki-NLP/opus-mt-vi-en | no disponible | no disponible | vi → en | CC BY 4.0 | safetensors/PyTorch (formato original de OPUS-MT) | Modelo original de la Universidad de Helsinki |

Los tres modelos comparten pesos y vocabulario; las diferencias estan en el empaquetado (ONNX para navegador y CPU en los dos primeros) y en el consumo de memoria del decoder fusionado. No se dispone de datos de rendimiento comparativo (BLEU u otras metricas) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de traduccion unidireccional: solo traduce de vietnamita a ingles; no soporta la direccion inversa ni otros pares de idiomas.
- No se han publicado evaluaciones de calidad de traduccion (BLEU, COMET u otras) para esta version; la unica garantia documentada es que los tokens coinciden con el modelo base.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados (terminologia juridica, medica o tecnica) no cubiertos por el corpus original de OPUS-MT.
- Sesgos potenciales heredados del corpus paralelo de OPUS y del modelo original de Helsinki-NLP; no se documentan analisis de sesgo.
- Longitud de contexto no documentada; los modelos Marian suelen limitar la longitud de entrada, pero no se especifica el valor en la informacion disponible.
- Licencia CC BY 4.0: permite uso comercial con atribucion; es necesario citar a los autores originales (Universidad de Helsinki, OPUS-MT) y a Xenova por la exportacion ONNX.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada es 2026-11-09; conviene verificar la procedencia y el mantenimiento antes de usarlo en produccion.
- Solo se ha reconstruido el decoder cuantizado; el resto de ficheros dependen del modelo base y de su revision `541dfd72ec07`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/vi-en
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-vi-en
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-vi-en
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
