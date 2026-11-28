# OptimaMT/fr-de

## Resumen

OptimaMT/fr-de es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-fr-de, que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki para el par francés-alemán. Lo desarrolla el proyecto OptimaMT, cuyo objetivo es distribuir los modelos OPUS-MT en formato ONNX con un decodificador más ligero y rápido, sin alterar las traducciones producidas. El modelo resuelve la traducción de texto de francés a alemán en entornos de inferencia locales, especialmente en navegador mediante transformers.js o en aplicaciones de escritorio.

La relevancia de esta variante concreta reside en su optimización de memoria y velocidad: mantiene exactamente los mismos pesos y produce los mismos tokens que el modelo original, pero reduce el consumo de memoria tras la carga entre un 46 % y un 48 % en Linux y Windows respectivamente, y acelera la decodificación entre 2,3 y 2,5 veces gracias al modo rápido de ONNX Runtime (`disable_quant_qdq = 1`). Forma parte de una colección de 51 pares de idiomas con el mismo enfoque.

Se trata de un modelo Marian de tipo encoder-decoder, orientado exclusivamente a traducción, con un vocabulario de 61.153 tokens y un tamaño de repositorio de 0,1 GB. Está pensado para despliegues ligeros, no para tareas generativas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decodificador merged cuantizado |
| Idiomas soportados | fr (francés), de (alemán) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repositorio de 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un Marian, la arquitectura de traducción automática neuronal de tipo transformer encoder-decoder desarrollada en el ecosistema OPUS-MT. La variante OptimaMT no reentrena ni modifica los pesos: solo reconstruye el fichero `onnx/decoder_model_merged_quantized.onnx`, mientras que el resto de ficheros son idénticos byte a byte al original de Xenova/opus-mt-fr-de (revisión `7eea1996b448`). El cambio de grafo consiste en mover la proyección de salida del decodificador fuera de sus dos ramas, lo que permite aplicar el modo rápido de ONNX Runtime.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo OPUS-MT original de Helsinki-NLP. La innovación técnica destacable es la optimización del grafo ONNX para reducir memoria y latencia manteniendo la equivalencia exacta de salida: según la model card, las traducciones son idénticas a las del modelo original en FLORES-200 devtest.

## Capacidades

- Traducción de texto de francés a alemán, tarea única del modelo.
- Generación de texto secuencial mediante decodificación greedy (el modo evaluado en la model card).
- Ejecución en navegador mediante transformers.js y ONNX Runtime Web.
- Ejecución en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py`).
- Integración en aplicaciones de escritorio; el traductor de pantalla OpenCircle lo incorpora desde la versión v0.1.4.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada estrictamente al par fr-de.

## Casos de uso

- Traducción de pantalla en tiempo real: OpenCircle, traductor de escritorio para Windows y Linux, usa estos modelos desde v0.1.4; la reducción de memoria (276 MiB en Linux con `disable_quant_qdq = 1`) y la velocidad 2,3-2,5× superior lo hacen adecuado para capturar y traducir texto en pantalla de forma interactiva.
- Traducción en el navegador sin backend: con transformers.js y el dtype q8, el modelo se ejecuta del lado del cliente, lo que permite ofrecer traducción fr-de en aplicaciones web sin enviar texto a un servidor y sin coste de infraestructura.
- Traducción de documentación técnica y contenidos editoriales: al producir las mismas traducciones que el OPUS-MT original (BLEU 25,22 y chrF 55,56 en FLORES-200 devtest), sirve para localizar documentación de francés a alemán en pipelines por lotes.
- Preprocesado multilingüe en pipelines de NLP: traducción previa al análisis (por ejemplo, normalizar contenido francés a alemán antes de un clasificador o indexador entrenado en alemán) en entornos con recursos limitados.
- Aplicaciones de escritorio con requisitos de memoria estrictos: la reducción del 46-48 % en memoria tras la carga permite empaquetar el modelo en aplicaciones ligeras o en máquinas con poca RAM.
- Prototipado y evaluación de sistemas de traducción: al ser una copia exacta del original con solo el decodificador reconstruido, es útil como referencia reproducible para comparar configuraciones de ONNX Runtime (modo rápido frente a valores por defecto).
- Traducción offline en dispositivos sin GPU: la inferencia se ejecuta en CPU con 4 hilos según la metodología de la model card, lo que permite desplegarlo en equipos sin acelerador.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| BLEU (FLORES-200 devtest, 1.012 frases, greedy) | 25,22 |
| chrF (FLORES-200 devtest, 1.012 frases, greedy) | 55,56 |
| Equivalencia de tokens con el original | idéntica |
| Memoria tras carga, Linux (`disable_quant_qdq = 1`) | 516 → 276 MiB (-46 %) |
| Memoria tras carga, Windows (`disable_quant_qdq = 1`) | 494 → 255 MiB (-48 %) |
| Memoria tras carga, Linux (valores por defecto de ONNX Runtime) | 276 → 216 MiB (-22 %) |
| Memoria tras carga, Windows (valores por defecto de ONNX Runtime) | 195 → 164 MiB (-16 %) |
| Aceleración del modo rápido | 2,3-2,5× |

Mediciones realizadas con ONNX Runtime 1.31.1 en CPU con 4 hilos (Linux; Windows en una máquina virtual). No se han publicado comparaciones con otros modelos de traducción en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU. El consumo de memoria del proceso tras la carga es de 276 MiB en Linux y 255 MiB en Windows con `disable_quant_qdq = 1`.
- GPU recomendadas: no se requieren; no hay datos de ejecución en GPU en la información disponible.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,1 GB y la memoria tras la carga es inferior a 300 MiB.
- Opciones de despliegue: transformers.js (navegador, dtype q8), onnxruntime en Python con sentencepiece y numpy, y aplicaciones de escritorio como OpenCircle.
- Latencia y throughput: no se publican cifras absolutas de latencia o tokens por segundo; solo la aceleración relativa de 2,3-2,5× del modo rápido frente a los valores por defecto de ONNX Runtime, medida en CPU con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/fr-de | no disponible | no disponible | fr, de | CC BY 4.0 | ONNX | Decodificador merged optimizado; BLEU 25,22 / chrF 55,56 en FLORES-200 |
| Xenova/opus-mt-fr-de | no disponible | no disponible | fr, de | CC BY 4.0 | ONNX | Modelo base; mismas traducciones, mayor memoria y menor velocidad |
| Helsinki-NLP/opus-mt-fr-de | no disponible | no disponible | fr, de | CC BY 4.0 | safetensors/PyTorch (formato original OPUS-MT) | Pesos originales de la Universidad de Helsinki |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo la equivalencia de salida entre OptimaMT/fr-de y Xenova/opus-mt-fr-de.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traducción fr-de; no es un modelo generativo de propósito general y no admite instrucciones ni tool calling.
- Riesgo de alucinación y de errores de traducción inherente a los sistemas neuronales de traducción, especialmente en dominios especializados o frases ambiguas; no se documentan evaluaciones por dominio.
- No se dispone de información sobre sesgos demográficos, culturales o de género en las traducciones.
- La longitud de contexto no está documentada; el uso con frases muy largas o documentos extensos requiere segmentación previa.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario citar a OPUS-MT (Universidad de Helsinki), a Xenova por la exportación ONNX y a OptimaMT por la modificación del decodificador.
- Solo se ha reconstruido el fichero del decodificador merged cuantizado; otras configuraciones de cuantización o de ejecución no están validadas en la model card.
- Las mediciones de memoria y velocidad se realizaron en CPU con 4 hilos y, en Windows, dentro de una máquina virtual; el rendimiento en otros entornos puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/fr-de
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-fr-de
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-fr-de
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Aplicación OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Colección de los 51 pares de idiomas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
