# OptimaMT/fr-ar

## Resumen

OptimaMT/fr-ar es una exportación a ONNX del modelo de traducción automática Helsinki-NLP/opus-mt-fr-ar, orientada a la traducción de francés a árabe. Lo desarrolla OptimaMT, un proyecto que publica versiones optimizadas de los modelos OPUS-MT de la Universidad de Helsinki en formato ONNX para su uso con transformers.js y ONNX Runtime. El modelo base es un Marian NMT, la arquitectura de traducción neuronal de código abierto empleada en la suite OPUS-MT.

La aportación principal de esta variante no es un reentrenamiento, sino una optimización del grafo ONNX: el decoder fusionado se reconstruye con el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`), lo que reduce el consumo de memoria entre un 47 % y un 49 % en Linux y Windows respectivamente, manteniendo exactamente los mismos tokens de salida y una velocidad entre 2,3 y 2,5 veces superior. Los pesos son idénticos a los del modelo original; solo se ha modificado la proyección de salida del decoder, que se ha sacado de sus dos ramas.

Es relevante para desarrolladores que necesitan traducción francés-árabe ligera y desplegable en el navegador o en aplicaciones de escritorio, sin infraestructura GPU. El modelo se usa en producción en OpenCircle, un traductor de pantalla de escritorio para Windows y Linux. El repositorio ocupa 0,1 GB y el vocabulario consta de 62.419 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8); decoder fusionado con modo rápido de ONNX Runtime |
| Idiomas soportados | francés (fr) y árabe (ar) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx`), tokenizer en formato Xenova |

## Arquitectura y entrenamiento

El modelo es un Marian NMT, la arquitectura de traducción neuronal seq2seq desarrollada por el grupo de la Universidad de Helsinki para la suite OPUS-MT. Consta de un encoder y un decoder transformer con atención, entrenados sobre corpus paralelos multilingües de OPUS. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden al modelo original Helsinki-NLP/opus-mt-fr-ar.

La innovación técnica de esta variante es puramente de despliegue: se reconstruye el decoder fusionado en ONNX con `disable_quant_qdq = 1`, el modo rápido de ONNX Runtime, y se mueve la proyección de salida del decoder fuera de sus dos ramas (cambio solo de grafo). El resultado es una reducción de memoria tras la carga de 525 a 281 MiB en Linux (-47 %) y de 500 a 257 MiB en Windows (-49 %), con los mismos tokens de salida que el original. Con los valores por defecto de ONNX Runtime la reducción es menor (281 a 220 MiB en Linux, 196 a 165 MiB en Windows). El resto de archivos del repositorio son idénticos byte a byte al export original.

## Capacidades

- Traducción de texto de francés a árabe, con el token de idioma destino `>>ara<<` al inicio de cada entrada.
- Generación de texto seq2seq (pipeline `translation`) en transformers.js 3.x y en Python con onnxruntime, sentencepiece y numpy.
- Ejecución en CPU con ONNX Runtime, sin necesidad de GPU.
- Despliegue en navegador mediante transformers.js y en aplicaciones de escritorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada estrictamente al par fr-ar.

## Casos de uso

- Traducción de pantalla en aplicaciones de escritorio: OpenCircle, el traductor de pantalla para Windows y Linux, ya integra estos modelos desde su versión v0.1.4; el bajo consumo de memoria (281 MiB en Linux) permite mantenerlo cargado en segundo plano.
- Traducción en el navegador sin backend: con transformers.js 3.x y dtype `q8`, el modelo se ejecuta del lado del cliente, lo que evita enviar texto a un servidor y reduce costes de infraestructura.
- Traducción de documentación y contenido web francés a árabe en pipelines por lotes: el script `translate.py` permite procesar ficheros con onnxruntime en CPU, adecuado para volúmenes moderados sin GPU.
- Localización de interfaces y textos de producto para mercados francófonos y arabófonos: al ser un modelo ligero y determinista en su salida, encaja en flujos de localización automatizada con revisión humana posterior.
- Traducción de correspondencia y comunicaciones de atención al cliente: el modelo traduce frases cortas y párrafos con calidad medida (BLEU 13,61 en FLORES-200 devtest), suficiente para borradores que un humano revisa.
- Prototipado e investigación en traducción automática de bajo recursos: sirve como línea base reproducible en ONNX para comparar optimizaciones de inferencia sin depender de GPU.
- Aplicaciones embebidas o de escritorio con recursos limitados: la reducción de memoria del 47-49 % frente al export original permite integrarlo en entornos con poca RAM.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 13,61 |
| FLORES-200 devtest (1.012 frases), chrF | 45,82 |
| Memoria tras carga, Linux (`disable_quant_qdq = 1`) | 525 → 281 MiB (-47 %) |
| Memoria tras carga, Windows (`disable_quant_qdq = 1`) | 500 → 257 MiB (-49 %) |
| Memoria tras carga, Linux (valores por defecto) | 281 → 220 MiB (-22 %) |
| Memoria tras carga, Windows (valores por defecto) | 196 → 165 MiB (-16 %) |
| Velocidad (`disable_quant_qdq = 1`) | 2,3–2,5× más rápido |
| Tokens de salida frente al original | idénticos |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en máquina virtual), decodificación greedy. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para inferencia en CPU con ONNX Runtime.
- Memoria RAM estimada tras la carga: 281 MiB en Linux y 257 MiB en Windows con `disable_quant_qdq = 1`.
- GPU: no requiere GPU; no se han publicado datos de rendimiento en GPU.
- Cabe en cualquier equipo de consumo, incluidos portátiles y entornos de escritorio modestos.
- Despliegue: transformers.js 3.x (navegador o Node), ONNX Runtime en Python con sentencepiece y numpy; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se indica una mejora de 2,3–2,5× frente al export original en CPU con 4 hilos, sin cifras absolutas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/fr-ar | Marian NMT (ONNX optimizado) | fr → ar | no disponible | CC BY 4.0 | ONNX | Decoder fusionado con modo rápido de ONNX Runtime; 281 MiB en Linux |
| Helsinki-NLP/opus-mt-fr-ar | Marian NMT | fr → ar | no disponible | CC BY 4.0 | safetensors / PyTorch | Modelo original del que deriva; mayor consumo de memoria |
| Exportaciones Xenova de OPUS-MT | Marian NMT (ONNX) | varios pares | no disponible | CC BY 4.0 | ONNX | Mismo layout que esta variante, sin la optimización del decoder |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de traducción especializado exclusivamente en el par fr-ar; no sirve para otras direcciones ni tareas generativas.
- Es obligatorio prefijar la entrada con `>>ara<<`; sin este token el comportamiento puede degradarse.
- Requiere transformers.js 3.x: la versión 4.3.2 divide este token, incluso con el export original.
- Calidad medida moderada: BLEU 13,61 y chrF 45,82 en FLORES-200 devtest, lo que implica revisión humana en usos de producción sensibles.
- Riesgo de alucinación y errores en textos largos, dominios especializados o lenguaje coloquial; no se han documentado sesgos específicos en la información disponible.
- Licencia CC BY 4.0: permite uso comercial con atribución a la Universidad de Helsinki (pesos OPUS-MT) y al proyecto OptimaMT (export ONNX).
- No se dispone de información sobre longitud máxima de secuencia ni sobre el rendimiento en frases muy largas.
- El rendimiento medido corresponde a CPU con 4 hilos; no hay datos de latencia en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/fr-ar
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-ar
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe técnico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Colección de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- OpenCircle (traductor de pantalla): https://github.com/AmerAlreyahi/OpenCircle
