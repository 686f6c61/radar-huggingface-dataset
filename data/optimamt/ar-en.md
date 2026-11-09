# OptimaMT/ar-en

## Resumen

OptimaMT/ar-en es un modelo de traducción automática árabe-inglés derivado de Xenova/opus-mt-ar-en, que a su vez es una exportación a ONNX del modelo OPUS-MT de la Universidad de Helsinki. La modificación introducida por OptimaMT consiste en una reestructuración del grafo del decodificador fusionado: la proyección de salida se extrae de sus dos ramas, lo que reduce el consumo de memoria en inferencia sin alterar los pesos ni la tokenización. El resultado es un modelo "drop-in": produce exactamente los mismos tokens que el original, pero con una huella de memoria menor.

La relevancia práctica del modelo es acotada pero clara: está pensado para despliegues ligeros en navegador o en CPU mediante transformers.js y ONNX Runtime, donde cada decena de megabytes cuenta. Con un repositorio de 0,1 GB y una reducción de memoria declarada de hasta el 46-49 % en configuraciones concretas, se posiciona como una alternativa de bajo coste para traducción integrada en aplicaciones web o pipelines sin GPU.

Forma parte del proyecto OptimaMT, que publica 49 pares de idiomas bajo el esquema de nombres `OptimaMT/<src>-<tgt>`. La arquitectura subyacente es Marian (transformer encoder-decoder), con un vocabulario de 62.834 tokens. No se trata de un modelo fundacional ni de un LLM: es un traductor especializado, sin capacidades de razonamiento, código ni tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, text2text-generation) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); el autor menciona `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | ar (árabe), en (inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repositorio de 0,1 GB |
| Vocabulario | 62.834 tokens |
| Modelo base | Xenova/opus-mt-ar-en (revisión `09c755686640`) |
| Origen de pesos | Helsinki-NLP/opus-mt-ar-en (Universidad de Helsinki) |
| Librería | transformers.js |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo es un Marian, es decir, un transformer encoder-decoder clásico para traducción automática neuronal, heredado íntegramente de OPUS-MT. No hay entrenamiento propio por parte de OptimaMT: los pesos son los de Helsinki-NLP/opus-mt-ar-en, exportados a ONNX por Xenova y posteriormente modificados a nivel de grafo por OptimaMT. La única intervención es estructural: la proyección de salida del decodificador fusionado se saca de sus dos ramas, lo que evita duplicar esa operación en memoria durante la inferencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus ni si hubo ajuste fino con RLHF o DPO; estos datos corresponden al modelo OPUS-MT original y no se detallan en la información proporcionada. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La innovación declarada es exclusivamente de eficiencia en memoria: según la model card, con `disable_quant_qdq = 1` el consumo tras la carga pasa de 529 a 284 MiB en Linux (-46 %) y de 504 a 258 MiB en Windows (-49 %), manteniendo tokens idénticos. Con los valores por defecto de ONNX Runtime la reducción es del 22 % en Linux (283 a 222 MiB) y del 15 % en Windows (196 a 167 MiB). Las mediciones se hicieron con ONNX Runtime 1.31.1 en CPU y 4 hilos.

## Capacidades

- Traducción de texto árabe a inglés, tarea única del modelo.
- Generación de texto secuencia a secuencia mediante el pipeline `translation` de transformers.js.
- Inferencia en CPU y en navegador gracias al formato ONNX y a la librería transformers.js.
- Ejecución en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio).
- Salida determinista y equivalente token a token respecto al modelo base.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Cobertura multilingüe limitada al par ar-en.

## Casos de uso

- Traducción integrada en aplicaciones web: el modelo se carga con transformers.js en el navegador y traduce texto árabe a inglés sin enviar datos a un servidor, lo que resulta adecuado por su tamaño reducido (0,1 GB) y su formato ONNX.
- Traducción por lotes en servidores sin GPU: al ejecutarse en CPU con ONNX Runtime y 4 hilos, encaja en pipelines de procesamiento documental donde no hay aceleradores disponibles.
- Preprocesado de corpus árabe para NLP en inglés: permite convertir reseñas, titulares o tickets a inglés antes de pasarlos a modelos de análisis de sentimiento o clasificación entrenados en inglés.
- Atención al cliente en entornos bilingües: traducción de mensajes entrantes en árabe a inglés para que un agente o un sistema de ticketing monolingüe en inglés los procese.
- Aplicaciones de escritorio o extensiones con presupuesto de memoria ajustado: la reducción de hasta el 46-49 % en memoria tras la carga con `disable_quant_qdq = 1` lo hace viable en entornos con RAM limitada.
- Traducción de contenidos editoriales de árabe a inglés en flujos CMS: integrable como paso previo a revisión humana, dado que el modelo es un traductor especializado y no un generador general.
- Prototipado rápido de sistemas de traducción: al ser un drop-in del modelo de Xenova, permite sustituirlo sin cambiar código ni validar de nuevo las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de memoria tras la carga (MiB) y confirma que los tokens de salida son idénticos a los del modelo base, pero no incluye BLEU, COMET, MMLU ni otras evaluaciones de calidad de traducción.

| Metrica | Original | OptimaMT | Variacion |
|---|---:|---:|---:|
| Memoria tras carga, Linux, `disable_quant_qdq = 1` | 529 MiB | 284 MiB | -46 % |
| Memoria tras carga, Windows, `disable_quant_qdq = 1` | 504 MiB | 258 MiB | -49 % |
| Memoria tras carga, Linux, valores por defecto ONNX Runtime | 283 MiB | 222 MiB | -22 % |
| Memoria tras carga, Windows, valores por defecto ONNX Runtime | 196 MiB | 167 MiB | -15 % |
| Tokens de salida | referencia | idénticos | sin cambio |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso documentado; el modelo está pensado para CPU. En GPU, el peso del repositorio (0,1 GB) sugiere una huella mínima, pero no se han publicado cifras de VRAM.
- GPU recomendadas: no disponible; el autor no documenta despliegue en GPU.
- Cabe en cualquier GPU consumer moderna por tamaño, aunque no se han validado configuraciones concretas.
- Despliegue documentado: transformers.js (JavaScript, navegador o Node) y onnxruntime en Python con sentencepiece y numpy.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; estos entornos están orientados a LLM y no encajan con un Marian ONNX.
- Latencia y throughput: no disponibles. Las mediciones publicadas son de memoria, no de velocidad, y se realizaron en CPU con 4 hilos y ONNX Runtime 1.31.1.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Memoria tras carga | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ar-en | Marian | ar, en | ONNX | CC BY 4.0 | 222-284 MiB (Linux) | Decodificador fusionado optimizado |
| Xenova/opus-mt-ar-en | Marian | ar, en | ONNX | CC BY 4.0 | 283-529 MiB (Linux) | Modelo base, sin optimizar |
| Helsinki-NLP/opus-mt-ar-en | Marian | ar, en | PyTorch (safetensors/bin) | CC BY 4.0 | no disponible | Pesos originales de OPUS-MT |

La comparación se limita al mismo linaje de modelos, ya que no se dispone de datos de benchmarks frente a alternativas de otros proveedores. La diferencia medible entre OptimaMT y Xenova es exclusivamente de memoria, con salidas idénticas.

## Limitaciones y advertencias

- Es un traductor especializado: no genera texto libre, no razona, no escribe código y no soporta instrucciones complejas.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos Marian de OPUS-MT, especialmente en dominios especializados, nombres propios y terminología técnica.
- Cobertura limitada al par árabe-inglés; no traduce a otros idiomas ni desde otros idiomas.
- Longitud de contexto no documentada; los modelos Marian suelen truncar secuencias largas, lo que puede degradar la traducción de párrafos extensos.
- Sin datos publicados de calidad (BLEU, COMET) que permitan estimar su rendimiento frente a alternativas actuales.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio citar a los autores de los pesos (Universidad de Helsinki) y del export ONNX (Xenova) según la model card.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- Las ganancias de memoria dependen de la configuración (`disable_quant_qdq = 1` y versión de ONNX Runtime); con los valores por defecto la reducción es notablemente menor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ar-en
- Repositorio OptimaMT en GitHub: https://github.com/AmerAlreyahi/OptimaMT
- Informe técnico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-ar-en
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-ar-en
