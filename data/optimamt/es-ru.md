# OptimaMT/es-ru

## Resumen

OptimaMT/es-ru es un modelo de traducción automática neuronal para el par español-ruso, publicado por OptimaMT como parte de una colección de 49 pares de idiomas. No es un modelo entrenado desde cero: se trata de una copia directa ("drop-in copy") de Xenova/opus-mt-es-ru, la exportación ONNX del modelo OPUS-MT de la Universidad de Helsinki, con una única modificación en el grafo del decodificador fusionado para reducir el consumo de memoria en inferencia.

El modelo mantiene exactamente los mismos pesos y el mismo vocabulario (63.430 tokens) que el original; solo se reconstruye el fichero `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyección de salida del decodificador fuera de sus dos ramas. Según la model card, esta modificación reduce el uso de memoria tras la carga entre un 47 % y un 49 % en Linux y Windows con `disable_quant_qdq = 1`, y entre un 17 % y un 22 % con los valores por defecto de ONNX Runtime, produciendo tokens idénticos a la versión original.

Su relevancia es práctica: ofrece una alternativa de menor huella de memoria para despliegues de traducción es-ru en entornos con recursos limitados, especialmente en el navegador o en Node.js mediante transformers.js con pesos cuantizados a 8 bits. La arquitectura subyacente es Marian (transformer encoder-decoder), con licencia CC BY 4.0 heredada de OPUS-MT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado a 8 bits (`q8`); el repositorio incluye `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | es (español), ru (ruso) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repositorio de 0,1 GB |
| Vocabulario | 63.430 tokens |
| Modelo base | Xenova/opus-mt-es-ru (revision `268ccd60bde3`) |
| Origen de pesos | Helsinki-NLP/opus-mt-es-ru (Universidad de Helsinki) |
| Libreria | transformers.js |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, la arquitectura empleada por la familia OPUS-MT de Helsinki-NLP para traducción automática. No se ha realizado ningún entrenamiento adicional ni ajuste fino por parte de OptimaMT: los pesos son idénticos a los de Helsinki-NLP/opus-mt-es-ru, exportados a ONNX por Xenova y redistribuidos aquí con una modificación exclusivamente de grafo.

La innovación técnica declarada es la reestructuración del decodificador fusionado: la proyección de salida se extrae de las dos ramas del decodificador, lo que reduce el pico y el uso sostenido de memoria sin alterar la salida. La model card reporta mediciones con ONNX Runtime 1.31.1 en CPU con 4 hilos: 532 → 284 MiB en Linux y 508 → 259 MiB en Windows con `disable_quant_qdq = 1`, y 284 → 222 MiB / 201 → 166 MiB con los valores por defecto. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO; esos datos corresponden al modelo OPUS-MT de origen y no se detallan en la información proporcionada.

## Capacidades

- Traducción automática directa español → ruso, un único par de idiomas.
- Generación de texto condicionada a la secuencia de entrada (pipeline `translation`).
- Inferencia en navegador y en Node.js mediante transformers.js con ONNX Runtime.
- Ejecución en CPU con cuantización a 8 bits, sin necesidad de GPU.
- Ejecución en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, visión ni audio.
- El multilingüismo se limita al par es-ru; no es un modelo multilingüe general.

## Casos de uso

- Traducción de documentación técnica: el modelo traduce textos de referencia de español a ruso en pipelines por lotes, con una huella de memoria inferior a 300 MiB en CPU, adecuada para contenedores pequeños.
- Localización de interfaces web en el navegador: al ejecutarse con transformers.js y pesos `q8`, permite traducir cadenas de UI en el cliente sin enviar texto a un servidor, reduciendo requisitos de privacidad y latencia de red.
- Traducción de correo y atención al cliente: para mensajes cortos y de dominio general, el modelo ofrece una alternativa ligera a APIs externas, con coste marginal nulo por petición una vez desplegado.
- Preprocesado en pipelines de datos multilingües: traducción es→ru de corpus para entrenamiento o evaluación de otros modelos, ejecutable en CPU con throughput aceptable para volúmenes moderados.
- Despliegue en dispositivos de borde: su tamaño de repositorio (0,1 GB) y su consumo de memoria permiten ejecutarlo en entornos con restricciones de RAM, como funciones serverless o dispositivos embebidos con Node.js.
- Prototipado y pruebas de integración: al ser una copia directa con salida idéntica al original, sirve como sustituto de Xenova/opus-mt-es-ru en tests sin cambiar los resultados esperados.
- Traducción de contenido editorial de dominio general: artículos, notas de prensa y textos divulgativos donde no se requiere adaptación terminológica especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, chrF) en la información disponible. La model card solo reporta métricas de memoria y la equivalencia de tokens respecto al modelo base:

| Metrica | Original | OptimaMT | Variacion |
|---|---:|---:|---:|
| Memoria tras carga, Linux, `disable_quant_qdq = 1` | 532 MiB | 284 MiB | -47 % |
| Memoria tras carga, Windows, `disable_quant_qdq = 1` | 508 MiB | 259 MiB | -49 % |
| Memoria tras carga, Linux, valores por defecto | 284 MiB | 222 MiB | -22 % |
| Memoria tras carga, Windows, valores por defecto | 201 MiB | 166 MiB | -17 % |
| Tokens idénticos al original | — | sí | — |

Mediciones con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en máquina virtual).

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para inferencia en CPU.
- Memoria RAM estimada: aproximadamente 166-284 MiB tras la carga, según sistema operativo y configuración de ONNX Runtime.
- GPU recomendadas: no aplica; no se documenta despliegue en GPU.
- Cabe en cualquier GPU de consumo, pero no se aprovecha de ella; también cabe en equipos con 1 GB de RAM o menos.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`) en navegador o Node.js; onnxruntime en Python mediante el script `translate.py` del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/es-ru | no disponible | no disponible | es, ru | CC BY 4.0 | ONNX (q8) | Decodificador fusionado optimizado en memoria; salida idéntica al base |
| Xenova/opus-mt-es-ru | no disponible | no disponible | es, ru | CC BY 4.0 | ONNX | Modelo base directo; mayor consumo de memoria según la model card |
| Helsinki-NLP/opus-mt-es-ru | no disponible | no disponible | es, ru | CC BY 4.0 | safetensors/PyTorch | Pesos originales OPUS-MT; requiere PyTorch, no orientado a navegador |

No se dispone de datos de benchmarks que permitan comparar la calidad de traducción entre estas alternativas; la comparación se limita a formato, licencia y consumo de memoria.

## Limitaciones y advertencias

- Modelo de un solo par de idiomas: no traduce entre otras combinaciones ni detecta idioma automáticamente.
- Riesgo de alucinación y de traducciones incorrectas en textos largos, dominios especializados (legal, médico, técnico) o con terminología poco frecuente; no se han publicado evaluaciones de calidad.
- Sesgos: al heredar los pesos de OPUS-MT, puede reproducir sesgos presentes en los corpus de entrenamiento originales, que no se documentan en la información disponible.
- Longitud de contexto no documentada; no se recomienda para documentos extensos sin segmentación previa.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar a los autores originales (Universidad de Helsinki, OPUS-MT) y a Xenova por la exportación ONNX.
- La optimización de memoria depende de la opción `disable_quant_qdq` y de la versión de ONNX Runtime; los resultados pueden variar en otras configuraciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria documentada.
- Solo se reconstruye un fichero ONNX; cualquier otra modificación respecto al original debe verificarse contra el repositorio base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/es-ru
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-es-ru
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-es-ru
