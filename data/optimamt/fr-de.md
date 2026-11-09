# OptimaMT/fr-de

## Resumen

OptimaMT/fr-de es un modelo de traducción automática francés-alemán derivado de Xenova/opus-mt-fr-de, que a su vez es la exportación a ONNX del modelo OPUS-MT de la Universidad de Helsinki. El modelo mantiene la arquitectura Marian original y todos los pesos, pero introduce una modificación en el grafo del decodificador combinado (merged decoder) que reduce el consumo de memoria en tiempo de ejecución sin alterar la salida: los tokens generados son idénticos a los del modelo base. Está publicado por OptimaMT, un proyecto que agrupa 49 pares de idiomas bajo el patrón `OptimaMT/<src>-<tgt>`.

La relevancia de esta variante es puramente de eficiencia en despliegue: al mover la proyección de salida del decodificador fuera de sus dos ramas, se consigue una reducción de memoria de entre el 16 % y el 48 % según la configuración de ONNX Runtime, manteniendo la misma calidad de traducción. El modelo está empaquetado específicamente para transformers.js con pesos ONNX cuantizados (q8), lo que lo hace adecuado para inferencia en navegador o en entornos Node.js con CPU, sin necesidad de GPU.

Se trata de un modelo pequeño (repo de 0,1 GB, vocabulario de 61.153 tokens) especializado exclusivamente en la dirección francés → alemán, con licencia CC BY 4.0 y sin datos publicados de benchmarks de calidad de traducción en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8); el repo incluye `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | francés (fr) como origen, alemán (de) como destino |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo es un Marian, la arquitectura transformer encoder-decoder desarrollada en el marco del proyecto OPUS-MT de la Universidad de Helsinki para traducción automática neuronal. La variante aquí publicada no reentrena ni modifica los pesos: parte de la exportación ONNX de Xenova (revisión `7eea1996b448`) y únicamente reconstruye el fichero `onnx/decoder_model_merged_quantized.onnx`, dejando el resto de ficheros idénticos byte a byte. La modificación consiste en extraer la proyección de salida del decodificador fuera de sus dos ramas del grafo; es un cambio exclusivamente estructural que no afecta a los tokens generados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que la model card no documenta el proceso de entrenamiento del modelo OPUS-MT subyacente. La innovación técnica destacable es la reducción de memoria en inferencia: con `disable_quant_qdq = 1` el consumo tras la carga baja de 516 a 276 MiB en Linux (−46 %) y de 494 a 255 MiB en Windows (−48 %); con los valores por defecto de ONNX Runtime, de 276 a 216 MiB (−22 %) en Linux y de 195 a 164 MiB (−16 %) en Windows. Las mediciones se realizaron con ONNX Runtime 1.31.1 en CPU con 4 hilos.

## Capacidades

- Traducción de texto francés a alemán, tarea única para la que fue entrenado.
- Generación de texto seq2seq mediante `text2text-generation`.
- Inferencia en navegador y en Node.js a través de transformers.js.
- Inferencia en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio).
- Cuantización q8 para reducir huella de memoria.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo limitado estrictamente al par fr → de.

## Casos de uso

- Traducción de documentación técnica: el modelo puede integrarse en un pipeline que procese ficheros Markdown o HTML en francés y genere versiones en alemán, aprovechando la inferencia en CPU y la baja huella de memoria para ejecutarse en servidores sin GPU.
- Traducción en el navegador sin backend: gracias al empaquetado para transformers.js con pesos ONNX cuantizados, puede ejecutarse del lado del cliente para traducir contenido de forma privada, sin enviar texto a un servidor externo.
- Localización de interfaces de usuario: adecuado para traducir cadenas cortas de aplicaciones (menús, mensajes de error, etiquetas) en un proceso por lotes, donde el reducido consumo de memoria permite mantener varias instancias en paralelo.
- Traducción de correspondencia y correos electrónicos: para volúmenes moderados de texto administrativo o comercial entre francófonos y germanoparlantes, con despliegue en un contenedor ligero.
- Preprocesamiento en pipelines de NLP: como paso previo para normalizar corpus franceses a alemán antes de tareas posteriores de análisis, indexación o búsqueda.
- Prototipado y evaluación de sistemas de traducción: útil como línea base ligera en experimentos académicos o pruebas de integración, dado que reproduce exactamente las salidas del modelo Xenova original con menor consumo de memoria.
- Aplicaciones de escritorio o extensiones: al caber en menos de 300 MiB tras la carga, puede embeberse en herramientas de escritorio con Electron o en extensiones de navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, chrF, COMET u otros) en la información disponible. La model card únicamente reporta métricas de memoria tras la carga:

| Configuración | Plataforma | Memoria antes | Memoria después | Reducción | Tokens idénticos |
|---|---|---:|---:|---:|---|
| `disable_quant_qdq = 1` | Linux | 516 MiB | 276 MiB | −46 % | sí |
| `disable_quant_qdq = 1` | Windows | 494 MiB | 255 MiB | −48 % | sí |
| Defaults de ONNX Runtime | Linux | 276 MiB | 216 MiB | −22 % | sí |
| Defaults de ONNX Runtime | Windows | 195 MiB | 164 MiB | −16 % | sí |

Mediciones con ONNX Runtime 1.31.1, CPU, 4 hilos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para CPU y no requiere GPU.
- Memoria RAM tras la carga: entre 164 y 276 MiB según configuración y plataforma (ver tabla anterior).
- GPU recomendadas: no disponibles ni necesarias; el modelo se ejecuta en CPU.
- Cabe en cualquier GPU de consumo, pero no está optimizado para ellas; también cabe holgadamente en cualquier equipo de escritorio o portátil convencional.
- Opciones de despliegue: transformers.js (navegador y Node.js), ONNX Runtime en Python (script `translate.py`), y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/fr-de | Marian | fr → de | no disponible | CC BY 4.0 | ONNX (transformers.js) | Decodificador merged optimizado; −16 a −48 % de memoria |
| Xenova/opus-mt-fr-de | Marian | fr → de | no disponible | CC BY 4.0 | ONNX (transformers.js) | Modelo base del que deriva; mismos pesos y tokens |
| Helsinki-NLP/opus-mt-fr-de | Marian | fr → de | no disponible | CC BY 4.0 | PyTorch (safetensors/bin) | Modelo original de OPUS-MT; requiere framework PyTorch |

La comparativa se limita a las tres variantes del mismo modelo OPUS-MT, ya que no se dispone de información sobre alternativas de otros desarrolladores en la documentación proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en la dirección fr → de; no traduce en sentido inverso ni a otros idiomas.
- No se han publicado evaluaciones de calidad de traducción (BLEU, COMET), por lo que no puede verificarse su rendimiento frente a otros sistemas.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos neuronales de traducción, especialmente en textos técnicos, nombres propios o terminología especializada.
- No se documentan sesgos conocidos del modelo base ni del proceso de entrenamiento de OPUS-MT.
- La longitud máxima de contexto no está especificada; los textos largos pueden requerir segmentación previa.
- La licencia CC BY 4.0 permite uso comercial siempre que se atribuya la autoría (Universidad de Helsinki para los pesos, Xenova para la exportación ONNX y OptimaMT para la modificación del grafo).
- El modelo está empaquetado para transformers.js y ONNX; no incluye pesos en formato PyTorch ni safetensors.
- La reducción de memoria depende de la opción `disable_quant_qdq` y de la versión de ONNX Runtime; versiones distintas pueden no reproducir las cifras reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/fr-de
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Modelo base (exportación ONNX): https://huggingface.co/Xenova/opus-mt-fr-de
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-fr-de
