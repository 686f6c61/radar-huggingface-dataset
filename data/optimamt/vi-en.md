# OptimaMT/vi-en

## Resumen

OptimaMT/vi-en es un modelo de traduccion automatica vietnamita-ingles publicado por OptimaMT como una reempaquetado optimizado del modelo Xenova/opus-mt-vi-en, que a su vez es una exportacion ONNX del OPUS-MT de la Universidad de Helsinki. El modelo mantiene exactamente los mismos pesos y produce las mismas traducciones que el original, pero sustituye el decodificador fusionado por una version mas ligera que aprovecha el modo rapido de ONNX Runtime mediante `disable_quant_qdq = 1`. El resultado es una reduccion de memoria de entre el 45 % y el 47 % en Linux y Windows respectivamente, con una mejora de velocidad de 2,3 a 2,5 veces.

Se distribuye en formato ONNX cuantizado para su uso con transformers.js y con ONNX Runtime en Python, con un tamano de repositorio de 0,1 GB. Esta pensado para entornos de inferencia en CPU y para aplicaciones de traduccion en tiempo real, como el traductor de pantalla de escritorio OpenCircle, que ya lo integra en produccion desde su version 0.1.4.

La relevancia actual del modelo radica en que demuestra que es posible reducir drasticamente el coste de memoria y latencia de un modelo Marian sin alterar la calidad de traduccion, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados o en aplicaciones de escritorio que necesitan traduccion instantanea sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8) con decodificador fusionado optimizado |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (decoder_model_merged_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo es una copia directa de Xenova/opus-mt-vi-en en la revision `541dfd72ec07`, que a su vez deriva del OPUS-MT de Helsinki-NLP. La arquitectura es un transformer encoder-decoder de tipo Marian, disenado especificamente para traduccion automatica. El vocabulario consta de 53.739 tokens. No se dispone de informacion sobre el numero de parametros totales ni sobre la composicion exacta del dataset de entrenamiento original en la informacion proporcionada.

La innovacion tecnica de esta version reside en la modificacion del grafo del decodificador: la proyeccion de salida se ha movido fuera de sus dos ramas, lo que permite aplicar el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`). Segun la model card, esto produce una mejora de velocidad de 2,3 a 2,5 veces y reduce el uso de memoria tras la carga de 465 a 255 MiB en Linux (-45 %) y de 442 a 232 MiB en Windows (-47 %). Solo se reconstruye el archivo `onnx/decoder_model_merged_quantized.onnx`; el resto de archivos son identicos byte a byte al original. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Traduccion de texto de vietnamita a ingles con calidad equivalente al modelo OPUS-MT original.
- Generacion de texto condicionada a la tarea de traduccion (text2text-generation).
- Inferencia en CPU mediante ONNX Runtime con soporte para transformers.js.
- Ejecucion en navegador o en aplicaciones de escritorio a traves de transformers.js.
- Produccion de tokens identicos al modelo base, lo que garantiza consistencia en la salida.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada exclusivamente al par vietnamita-ingles.

## Casos de uso

- Traduccion de pantalla en tiempo real: el modelo se integra en aplicaciones de escritorio como OpenCircle para traducir texto visible en pantalla de vietnamita a ingles, gracias a su bajo consumo de memoria (232-255 MiB tras la carga) y su velocidad mejorada.
- Traduccion de documentos y articulos: se puede usar para procesar lotes de texto vietnamita a ingles en pipelines de procesamiento por lotes con ONNX Runtime en CPU, sin necesidad de GPU.
- Atencion al cliente en vietnamita: integrado en un sistema de tickets o chat, permite traducir mensajes entrantes de vietnamita a ingles para que agentes angloparlantes los entiendan, con latencia baja en CPU.
- Localizacion de contenido web: traduccion de paginas o fragmentos de interfaz de vietnamita a ingles en herramientas de localizacion, usando transformers.js directamente en el navegador.
- Subtitulado y transcripcion: combinado con un sistema de reconocimiento de voz, puede traducir transcripciones de vietnamita a ingles en tiempo casi real en entornos sin GPU.
- Herramientas de accesibilidad: traduccion de texto seleccionado en pantalla para usuarios que necesitan convertir contenido vietnamita a ingles de forma inmediata, con un consumo de memoria reducido que permite mantener la aplicacion en segundo plano.
- Investigacion en traduccion automatica de bajo recursos: sirve como punto de comparacion reproducible para estudiar el impacto de optimizaciones de grafo en modelos Marian cuantizados.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| FLORES-200 devtest (1.012 frases) | BLEU 24,31; chrF 51,95 (greedy) |
| Memoria tras carga (Linux, `disable_quant_qdq = 1`) | 465 → 255 MiB (-45 %) |
| Memoria tras carga (Windows, `disable_quant_qdq = 1`) | 442 → 232 MiB (-47 %) |
| Memoria tras carga (Linux, valores por defecto ONNX Runtime) | 251 → 198 MiB (-21 %) |
| Memoria tras carga (Windows, valores por defecto ONNX Runtime) | 181 → 154 MiB (-15 %) |
| Velocidad relativa | 2,3–2,5× mas rapido que el original |
| Tokens identicos al original | Si |

Las mediciones se realizaron con ONNX Runtime 1.31.1 en CPU con 4 hilos (Linux nativo, Windows en maquina virtual). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo esta disenado para CPU; en GPU no se documentan requisitos.
- Memoria RAM necesaria: aproximadamente 232-255 MiB tras la carga con `disable_quant_qdq = 1` en Windows y Linux respectivamente.
- GPU recomendadas: no disponibles; el modelo se ha validado en CPU con 4 hilos.
- Cabe en cualquier GPU consumer y en practicamente cualquier sistema con CPU moderna; no requiere GPU dedicada.
- Opciones de despliegue: transformers.js (JavaScript/TypeScript), ONNX Runtime en Python (con sentencepiece y numpy), y cualquier runtime compatible con ONNX.
- Latencia y throughput: se reporta una mejora de 2,3 a 2,5 veces respecto al original, pero no se proporcionan valores absolutos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Memoria tras carga |
|---|---|---|---|---|---|---|
| OptimaMT/vi-en | no disponible | no disponible | vi, en | CC BY 4.0 | ONNX | 232-255 MiB |
| Xenova/opus-mt-vi-en | no disponible | no disponible | vi, en | CC BY 4.0 | ONNX | 442-465 MiB |
| Helsinki-NLP/opus-mt-vi-en | no disponible | no disponible | vi, en | CC BY 4.0 | PyTorch/safetensors | no disponible |

La comparativa se limita al ecosistema OPUS-MT porque no se dispone de datos de otros modelos de traduccion vietnamita-ingles en la informacion proporcionada. La diferencia principal frente a Xenova/opus-mt-vi-en es la reduccion de memoria y el aumento de velocidad, manteniendo traducciones identicas y la misma licencia.

## Limitaciones y advertencias

- El modelo solo traduce de vietnamita a ingles; no soporta otros pares de idiomas ni traduccion inversa.
- Al ser una copia del OPUS-MT original, hereda sus sesgos y limitaciones, aunque no se detallan sesgos especificos en la informacion disponible.
- Riesgo de alucinacion y errores en frases ambiguas o dominios especializados, comun en modelos de traduccion automatica.
- No se documenta la longitud maxima de contexto; el modelo puede truncar entradas largas sin aviso.
- La licencia CC BY 4.0 permite uso comercial siempre que se atribuya adecuadamente a los autores originales (Universidad de Helsinki, Xenova y OptimaMT).
- El modelo esta optimizado para CPU y ONNX Runtime; su rendimiento en otros runtimes o en GPU no esta documentado.
- La modificacion del grafo del decodificador es solo estructural; no se garantiza compatibilidad con todas las versiones de ONNX Runtime distintas de la 1.31.1.
- No se han publicado datos sobre robustez frente a texto ruidoso, jerga o variantes dialectales del vietnamita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/vi-en
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-vi-en
- OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-vi-en
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Coleccion de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Aplicacion OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
