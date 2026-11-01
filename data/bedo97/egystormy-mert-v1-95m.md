# BEDO97/egystormy-mert-v1-95m

## Resumen

Egystormy-mert-v1-95m es un modelo de embeddings musicales derivado de m-a-p/MERT-v1-95M, exportado a ONNX (opset 14) por el proyecto Egystormy. Su funcion es convertir un fragmento de audio monofonico a 24 kHz en un vector de 768 dimensiones que representa el contenido musical, de modo que dos pistas con embeddings proximos (similitud coseno) suenan de forma parecida. Es el motor del buscador de pistas similares de Egystormy Quickie, una aplicacion libre y de codigo abierto para organizar bibliotecas musicales de DJs.

El modelo no genera texto ni audio: es un extractor de representaciones (encoder) pensado para tareas de recuperacion y similitud. La exportacion se realizo mediante un paso directo de PyTorch a ONNX y el autor declara una verificacion numerica frente al modelo original, con una similitud coseno del embedding agrupado de aproximadamente 1,000000 sobre la senal de prueba.

Su relevancia practica esta en el formato: al distribuirse como ONNX en fp32 (unos 361 MB), puede ejecutarse fuera de Python y de PyTorch, lo que facilita integrarlo en aplicaciones de escritorio o en pipelines ligeros de indexacion musical. La licencia Apache-2.0 heredada del modelo base permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MERT-v1-95M; encoder transformer de audio) |
| Parametros totales | no disponible (el nombre indica 95M; no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la entrada se define por muestras de audio (Quickie usa segmentos de 10 s a 24 kHz) |
| Tipos de cuantizacion | solo fp32 en la informacion disponible |
| Idiomas soportados | en (etiqueta de la model card); el modelo opera sobre audio, no sobre texto |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 14), fichero mert-v1-95m.onnx de ~361 MB |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna ni el proceso de entrenamiento del modelo original. Se sabe que deriva de m-a-p/MERT-v1-95M, un modelo de comprension musical, y que la conversion consistio en una exportacion directa de PyTorch a ONNX con opset 14. No se documentan en la ficha el numero de tokens de audio, la composicion del dataset ni si hubo etapas de ajuste fino, RLHF o DPO; esos datos corresponderian al modelo base y no se incluyen aqui.

La innovacion tecnica del artefacto es la portabilidad: la exportacion ONNX elimina la dependencia de PyTorch en inferencia y permite ejecutar el encoder en runtimes ONNX (CPU o GPU). El contrato de entrada y salida esta fijado: `input_values` en float32 con forma `[batch, samples]` (mono, 24 kHz) y `last_hidden_state` con forma `[batch, time, 768]`. El embedding final se obtiene con mean-pooling sobre el eje temporal y normalizacion L2.

## Capacidades

- Extraccion de embeddings musicales de 768 dimensiones a partir de audio mono a 24 kHz.
- Busqueda de pistas similares mediante similitud coseno entre embeddings.
- Procesamiento por lotes (`batch` en la forma de entrada).
- Ejecucion en runtime ONNX sin PyTorch.
- Entrada de audio de duracion variable (Quickie emplea segmentos de 10 segundos).
- No soporta generacion de texto, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo multilingue en sentido estricto: la etiqueta de idioma es `en` y la tarea es acustica, no linguistica.

## Casos de uso

- Busqueda de pistas similares en una biblioteca de DJ: se indexan los embeddings de todas las pistas y, dada una consulta, se recuperan las de mayor similitud coseno; el modelo es adecuado porque su salida esta pensada exactamente para comparacion vectorial.
- Organizacion automatica de colecciones musicales: agrupar pistas por cercania en el espacio de embeddings (clustering) para crear listas o carpetas por afinidad sonora.
- Recomendacion en aplicaciones de escritorio: integrar el ONNX en un cliente nativo sin dependencias de Python, aprovechando que el fichero pesa unos 361 MB y se ejecuta en runtimes ONNX.
- Deteccion de duplicados y versiones: comparar embeddings de remixes, ediciones o versiones alternativas para identificar la misma pieza aunque difieran en metadatos.
- Construccion de indices vectoriales offline: precalcular embeddings de una biblioteca completa y servirlos desde una base vectorial para busquedas de baja latencia.
- Generacion de listas de reproduccion por similitud: encadenar pistas con embeddings proximos para construir sets con transiciones coherentes.
- Investigacion en recuperacion musical: usar el encoder como extractor de caracteristicas en experimentos de music information retrieval, dado que la exportacion preserva numericamente el comportamiento del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion es la comprobacion de fidelidad de la exportacion: similitud coseno del embedding agrupado de aproximadamente 1,000000 frente al modelo PyTorch original sobre una senal de prueba.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 95M parametros en fp32 el peso ronda los 0,36 GB y la memoria adicional depende de la longitud del segmento de audio y del tamano de lote.
- GPU recomendadas: no disponibles en la informacion; al ser un modelo pequeno en ONNX, cabe razonablemente en GPUs de consumo, aunque el autor no especifica modelos concretos.
- Ejecucion en CPU: viable para indexacion por lotes, segun el formato ONNX y el tamano del fichero.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) en CPU o GPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Egystormy-mert-v1-95m | no disponible (nombre indica 95M) | no disponible (segmentos de audio) | Embeddings musicales | apache-2.0 | ONNX |
| m-a-p/MERT-v1-95M | no disponible (nombre indica 95M) | no disponible | Embeddings musicales | apache-2.0 | PyTorch (modelo base) |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base m-a-p/MERT-v1-95M, del que este artefacto es una exportacion ONNX con fidelidad numerica verificada. No se dispone de datos de rendimiento comparativo con otros extractores de embeddings musicales.

## Limitaciones y advertencias

- Solo procesa audio mono a 24 kHz; cualquier otra frecuencia de muestreo o configuracion de canales requiere remuestreo previo.
- La calidad de la similitud depende del segmento elegido: Quickie usa 10 segundos, y segmentos mas cortos o no representativos pueden producir embeddings poco discriminativos.
- No se han publicado evaluaciones de sesgo ni de robustez frente a generos, idiomas o calidades de grabacion.
- Riesgo de falsos positivos en la busqueda de similitud si las pistas comparten produccion o instrumentacion pero difieren en estructura.
- La etiqueta de idioma es `en`, pero el modelo opera sobre audio; no debe interpretarse como soporte linguistico.
- La licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribucion del modelo base m-a-p/MERT-v1-95M.
- El repositorio no registra descargas ni likes y fue creado en 2026, por lo que no hay evidencia de uso en produccion ni de mantenimiento a largo plazo.
- La verificacion de fidelidad se realizo sobre una unica senal de prueba; no se documenta una validacion exhaustiva sobre corpus amplios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BEDO97/egystormy-mert-v1-95m
- Modelo base: https://huggingface.co/m-a-p/MERT-v1-95M
