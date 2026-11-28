# OptimaMT/en-uk

## Resumen

OptimaMT/en-uk es una conversión a ONNX del modelo de traducción automática MarianMT `Xenova/opus-mt-en-uk`, que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki para la dirección inglés → ucraniano. El modelo mantiene exactamente los mismos pesos y vocabulario (61.587 tokens) que el original, pero sustituye el decoder fusionado por una versión reconstruida con el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`), lo que reduce el consumo de memoria entre un 46 % y un 48 % en Linux y Windows respectivamente, y acelera la inferencia entre 2,3 y 2,5 veces.

Su relevancia radica en que es un reemplazo directo ("drop-in") del modelo de referencia para entornos de producción con recursos limitados, especialmente en el navegador mediante transformers.js o en aplicaciones de escritorio. Forma parte del proyecto OptimaMT, que publica las 51 parejas de traducción de OPUS-MT con este mismo proceso de optimización, y ya se usa en producción en la aplicación OpenCircle, un traductor de pantalla para Windows y Linux.

La calidad de traducción es idéntica a la del modelo original: en FLORES-200 devtest (1.012 frases) obtiene BLEU 18,66 y chrF 47,35 con decodificación greedy, generando exactamente los mismos tokens que `Xenova/opus-mt-en-uk`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8, decoder fusionado); el resto de ficheros sin modificar |
| Idiomas soportados | inglés (en) → ucraniano (uk) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repositorio de 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un MarianMT, la arquitectura de traducción neuronal secuencia-a-secuencia desarrollada en el marco de OPUS-MT por la Universidad de Helsinki. Se compone de un encoder y un decoder transformer con atención estándar, entrenados originalmente sobre corpus paralelos multilingües de OPUS para la dirección inglés → ucraniano. El vocabulario compartido tiene 61.587 tokens y utiliza tokenización SentencePiece.

La innovación de esta versión no está en el entrenamiento (los pesos son idénticos a los del modelo base) sino en la exportación: OptimaMT reconstruye únicamente `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyección de salida del decoder fuera de sus dos ramas (cambio solo de grafo) y activando el modo rápido de ONNX Runtime mediante `disable_quant_qdq = 1`. El resto de ficheros del repositorio son byte a byte los originales de `Xenova/opus-mt-en-uk` en la revisión `e6ca58729298`. No se documenta en la información disponible ningún proceso adicional de RLHF, DPO ni fine-tuning.

## Capacidades

- Traducción de texto inglés → ucraniano, con salida token a token idéntica al modelo de referencia.
- Ejecución en navegador mediante transformers.js con `dtype: "q8"`.
- Ejecución en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` incluido en el repositorio del proyecto).
- Inferencia en CPU: los resultados publicados se obtuvieron con ONNX Runtime 1.31.1 y 4 hilos, sin GPU.
- Integración en aplicaciones de escritorio (caso de uso validado en OpenCircle para Windows y Linux).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción de pantalla en tiempo real: OpenCircle, la aplicación de escritorio para Windows y Linux que ya distribuye estos modelos desde la versión v0.1.4, emplea el modelo para traducir texto capturado de la pantalla con bajo consumo de memoria (256-279 MiB tras la carga), lo que permite mantenerlo residente en segundo plano sin penalizar al resto del sistema.
- Traducción en el navegador sin backend: gracias a transformers.js y al formato ONNX cuantizado, una aplicación web puede traducir contenido inglés → ucraniano en el cliente, sin enviar texto a un servidor y sin coste de infraestructura.
- Traducción por lotes en servidores CPU: el modo rápido de ONNX Runtime ofrece entre 2,3 y 2,5 veces más velocidad que la configuración por defecto, lo que lo hace adecuado para pipelines de traducción masiva en máquinas sin GPU.
- Localización de documentación técnica: integrado en un script de CI/CD que traduzca ficheros Markdown o mensajes de interfaz del inglés al ucraniano antes de publicar, con la garantía de que la salida coincide con la del modelo OPUS-MT de referencia.
- Preprocesado multilingüe para análisis de datos: traducción de reseñas, tickets o comentarios en inglés a ucraniano para unificarlos con corpus nativos antes de aplicar modelos de clasificación o análisis de sentimiento entrenados en ucraniano.
- Aplicaciones de accesibilidad: subtitulado o lectura asistida para usuarios ucranianos que consumen contenido en inglés, aprovechando la baja latencia en CPU y el reducido uso de memoria.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 18,66 |
| FLORES-200 devtest (1.012 frases), chrF | 47,35 |
| Memoria tras carga, Linux (`disable_quant_qdq = 1`) | 519 → 279 MiB (-46 %) |
| Memoria tras carga, Windows (`disable_quant_qdq = 1`) | 494 → 256 MiB (-48 %) |
| Memoria tras carga, Linux (valores por defecto de ONNX Runtime) | 277 → 217 MiB (-22 %) |
| Memoria tras carga, Windows (valores por defecto de ONNX Runtime) | 195 → 163 MiB (-16 %) |
| Velocidad relativa (modo rápido) | 2,3–2,5× más rápido |
| Tokens idénticos al modelo original | sí |

Mediciones realizadas con ONNX Runtime 1.31.1, en CPU y 4 hilos (Linux; Windows en máquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para inferencia en CPU. El uso de memoria del proceso tras la carga es de aproximadamente 256-279 MiB con `disable_quant_qdq = 1`.
- GPU: no se documenta ningún requisito ni recomendación de GPU (A100, H100, RTX 4090 u otras).
- GPU de consumo: irrelevante para este modelo; funciona en CPU sin aceleración dedicada.
- Despliegue: transformers.js (navegador o Node.js) y onnxruntime en Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se reporta una mejora de 2,3-2,5× frente a la configuración por defecto de ONNX Runtime, pero no se publican valores absolutos de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OptimaMT/en-uk | no disponible | no disponible | BLEU 18,66 / chrF 47,35 (FLORES-200 devtest) | CC BY 4.0 | ONNX, transformers.js |
| Xenova/opus-mt-en-uk | no disponible | no disponible | Idéntica (mismos pesos) | CC BY 4.0 | ONNX, transformers.js |
| Helsinki-NLP/opus-mt-en-uk | no disponible | no disponible | Idéntica (modelo fuente) | CC BY 4.0 | PyTorch (safetensors/bin) |

La diferencia práctica entre los tres es el consumo de memoria y la velocidad de inferencia: OptimaMT reduce la memoria un 46-48 % y acelera 2,3-2,5× respecto a la configuración por defecto, manteniendo exactamente la misma salida. No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo traduce en una dirección: inglés → ucraniano. No soporta ucraniano → inglés ni otros pares de idiomas.
- Al ser una traducción automática neuronal, puede producir errores en frases ambiguas, terminología especializada, nombres propios y expresiones idiomáticas; el BLEU de 18,66 en FLORES-200 indica un margen de mejora considerable en calidad absoluta.
- Riesgo de alucinación y de omisiones en textos largos o mal segmentados; no se documenta la longitud máxima de secuencia soportada.
- No se han publicado evaluaciones de sesgos en la información disponible.
- La licencia CC BY 4.0 permite uso comercial siempre que se atribuya la autoría (Universidad de Helsinki para los pesos, Xenova para la exportación ONNX y OptimaMT para la modificación del decoder).
- La modificación del grafo (proyección de salida fuera de las ramas del decoder) debe tenerse en cuenta si se audita la equivalencia con el modelo original más allá de la comprobación de tokens idénticos reportada.
- El repositorio tiene un tamaño de 0,1 GB y solo se reconstruye un fichero ONNX; el resto de artefactos dependen del repositorio base `Xenova/opus-mt-en-uk`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-uk
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-uk
- Modelo OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-en-uk
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Aplicación OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Colección de las 51 parejas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
