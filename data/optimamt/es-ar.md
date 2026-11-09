# OptimaMT/es-ar

## Resumen

OptimaMT/es-ar es una exportación ONNX optimizada del modelo de traducción automática Helsinki-NLP/opus-mt-es-ar, desarrollado originalmente por el grupo de investigación de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce texto de español a árabe y está empaquetado específicamente para su uso con transformers.js y ONNX Runtime, lo que permite ejecutar la traducción directamente en el navegador o en entornos Node.js sin necesidad de un servidor con GPU.

La contribución de OptimaMT no es un reentrenamiento, sino una reingeniería del grafo ONNX: se ha reconstruido el decodificador fusionado (`decoder_model_merged_quantized.onnx`) moviendo la proyección de salida fuera de sus dos ramas, lo que reduce el consumo de memoria entre un 22 % y un 48 % según la configuración, manteniendo exactamente los mismos tokens de salida que el export original. El resto de archivos (tokenizador, pesos) son idénticos byte a byte al export de referencia.

El modelo forma parte de una familia más amplia de 49 pares de idiomas publicados bajo el namespace OptimaMT. Es relevante para desarrolladores que necesitan traducción es-ar de baja latencia en el cliente, con un tamaño de repositorio de 0,1 GB y una licencia permisiva CC BY 4.0 que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en el ejemplo de uso); el archivo incluido es `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | es (español), ar (árabe) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); tokenizer en formato SentencePiece/JSON |
| Vocabulario | 62.518 tokens |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers.js (3.x) |
| Modelo base | Helsinki-NLP/opus-mt-es-ar (revision `76efb7da47ad`) |

## Arquitectura y entrenamiento

El modelo subyacente es un MarianMT, la arquitectura de traducción automática neuronal desarrollada por Microsoft Research y adoptada por el proyecto OPUS-MT de la Universidad de Helsinki. Se trata de un transformer encoder-decoder estándar entrenado sobre corpus paralelos del proyecto OPUS. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden al modelo original Helsinki-NLP/opus-mt-es-ar y no se reproducen en la model card de OptimaMT.

La innovación técnica de esta ficha concreta reside en la modificación del grafo ONNX: la proyección de salida del decodificador se ha extraído de sus dos ramas (las correspondientes a los modos con y sin caché), lo que evita duplicar esa operación en memoria. Según la model card, esto produce una reducción de memoria tras la carga de 526 a 282 MiB en Linux (-46 %) y de 502 a 260 MiB en Windows (-48 %) con `disable_quant_qdq = 1`, y de 281 a 220 MiB (-22 %) en Linux y de 197 a 166 MiB (-16 %) en Windows con los valores por defecto de ONNX Runtime. Los tokens generados son idénticos a los del export original. Las mediciones se realizaron con ONNX Runtime 1.31.1, en CPU y con 4 hilos.

## Capacidades

- Traducción de texto de español a árabe, tarea única para la que está entrenado el modelo.
- Ejecución en navegador y en Node.js mediante transformers.js 3.x, sin backend GPU.
- Ejecución en Python mediante ONNX Runtime, SentencePiece y NumPy (script `translate.py` incluido en el repositorio del proyecto).
- Control del registro/variante de destino mediante el token de prefijo `>>ara<<`, que debe encabezar cada entrada.
- Cuantización q8 soportada en el pipeline de transformers.js (`dtype: "q8"`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un modelo de traducción puro.
- Capacidad multilingüe limitada al par es-ar; no traduce otros idiomas.

## Casos de uso

- Traducción en el navegador sin servidor: integrado con transformers.js, el modelo se descarga una vez (0,1 GB) y traduce localmente en el cliente, lo que elimina costes de inferencia en servidor y mantiene el texto del usuario fuera de la red.
- Extensiones de navegador para lectura de prensa árabe: un usuario hispanohablante puede traducir artículos o fragmentos seleccionados al instante con latencia de CPU y sin depender de APIs externas.
- Aplicaciones de mensajería y chat con soporte es-ar: el modelo puede traducir mensajes entrantes y salientes en conversaciones multi-turno, gestionando cada turno de forma independiente con el prefijo `>>ara<<`.
- Herramientas de atención al cliente para comunidades arabófonas en España: traducción de consultas de usuario al español para agentes humanos o para un sistema de tickets, con despliegue en el propio backend sin GPU.
- Procesamiento por lotes en Python para corpus documentales: el script `translate.py` permite traducir ficheros de texto o subtítulos de es a ar en pipelines offline sobre CPU.
- Aplicaciones de escritorio y electrónica embebida: al ser ONNX y requerir menos de 300 MiB de memoria tras la carga en la configuración optimizada, cabe en dispositivos con recursos limitados donde no se puede desplegar un modelo de traducción de mayor tamaño.
- Prototipado rápido de funcionalidades de traducción en productos web: la API de `pipeline("translation", ...)` de transformers.js permite integrar la traducción en pocas líneas de JavaScript.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, chrF) en la información disponible. La model card únicamente reporta métricas de memoria y equivalencia de salida:

| Metrica | Configuracion | Antes | Despues | Variacion |
|---|---|---|---|---|
| Memoria tras carga (Linux) | `disable_quant_qdq = 1` | 526 MiB | 282 MiB | -46 % |
| Memoria tras carga (Windows) | `disable_quant_qdq = 1` | 502 MiB | 260 MiB | -48 % |
| Memoria tras carga (Linux) | ONNX Runtime defaults | 281 MiB | 220 MiB | -22 % |
| Memoria tras carga (Windows) | ONNX Runtime defaults | 197 MiB | 166 MiB | -16 % |
| Tokens de salida | Ambas configuraciones | — | — | Identicos al export original |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux nativo; Windows en máquina virtual).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OptimaMT/es-ar | no disponible | no disponible | CC BY 4.0 | ONNX (transformers.js) | Export optimizado en memoria, pensado para cliente |
| Helsinki-NLP/opus-mt-es-ar | no disponible | no disponible | CC BY 4.0 | PyTorch (safetensors/bin) | Modelo original; requiere framework de servidor |
| Xenova/opus-mt-es-ar | no disponible | no disponible | CC BY 4.0 | ONNX (transformers.js) | Export de referencia con el que OptimaMT mantiene el mismo layout |
| Otros pares OptimaMT | no disponible | no disponible | CC BY 4.0 | ONNX | Misma metodología aplicada a 49 pares de idiomas |

No se dispone de datos de rendimiento comparativo (BLEU/COMET) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una copia exportada, no un modelo reentrenado: hereda todos los sesgos y limitaciones del corpus OPUS y de Helsinki-NLP/opus-mt-es-ar.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (legal, médico, técnico) y en textos con jerga o dialectos.
- Requiere el prefijo `>>ara<<` al inicio de cada entrada; sin él, el comportamiento no está garantizado.
- Debe usarse transformers.js 3.x: la versión 4.3.2 divide incorrectamente el token de prefijo, incluso con el export original.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a la Universidad de Helsinki (pesos OPUS-MT) y al autor del export ONNX.
- No hay información sobre longitud máxima de secuencia soportada; los textos largos pueden truncarse o degradar la calidad.
- Solo cubre el par es-ar; no es un modelo multilingüe general.
- El rendimiento se ha medido en CPU; no se documentan latencias ni throughput en GPU ni en producción a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/es-ar
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-es-ar
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
