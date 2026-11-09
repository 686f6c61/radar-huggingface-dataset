# OptimaMT/uk-ru

## Resumen

OptimaMT/uk-ru es un modelo de traducción automática ucraniano-ruso derivado de Xenova/opus-mt-uk-ru, que a su vez es una exportación a ONNX del modelo OPUS-MT de la Universidad de Helsinki. La aportación del autor (OptimaMT) no es un reentrenamiento, sino una optimización del grafo ONNX: se ha reconstruido únicamente el fichero del decodificador fusionado cuantizado, moviendo la proyección de salida fuera de sus dos ramas. El resultado es una reducción del consumo de memoria de hasta el 48 % manteniendo tokens de salida idénticos.

El modelo mantiene la arquitectura Marian original (transformer encoder-decoder de traducción), con un vocabulario de 57.777 tokens y licencia CC BY 4.0. Está pensado para inferencia en el navegador o en entornos ligeros mediante transformers.js y ONNX Runtime, no para despliegues de altas prestaciones en GPU.

Su relevancia actual es acotada pero concreta: para aplicaciones web o de escritorio que necesiten traducción uk→ru sin servidor, este paquete reduce la huella de memoria sin coste en calidad de salida, algo útil en clientes con recursos limitados o en despliegues edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); fichero `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | ucraniano (uk) → ruso (ru) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repositorio de 0,1 GB |
| Vocabulario | 57.777 tokens |
| Modelo base | Xenova/opus-mt-uk-ru (revision `cfb76ccd2077`) |
| Autor | OptimaMT |

## Arquitectura y entrenamiento

El modelo es un Marian transformer encoder-decoder, la arquitectura estándar de la familia OPUS-MT de Helsinki-NLP para traducción automática neuronal. No hay entrenamiento propio por parte de OptimaMT: los pesos son idénticos a los del modelo base Xenova/opus-mt-uk-ru, que a su vez procede de Helsinki-NLP/opus-mt-uk-ru. La única modificación es a nivel de grafo ONNX: se ha reconstruido el decodificador fusionado cuantizado moviendo la proyección de salida fuera de sus dos ramas. Todos los demás ficheros del repositorio son copia byte a byte del original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus ni si hubo ajuste fino con RLHF o DPO; estos datos corresponden al modelo OPUS-MT original y no se detallan en la información proporcionada. La innovación técnica destacable es exclusivamente la reducción de memoria: según la model card, con `disable_quant_qdq = 1` el consumo tras la carga pasa de 494 a 268 MiB en Linux (−46 %) y de 471 a 243 MiB en Windows (−48 %); con los valores por defecto de ONNX Runtime, de 265 a 208 MiB (−21 %) y de 188 a 158 MiB (−16 %) respectivamente. En todos los casos los tokens de salida son idénticos.

## Capacidades

- Traducción de texto ucraniano a ruso, tanto de frases sueltas como de párrafos.
- Generación de texto secuencial (text2text-generation) mediante pipeline `translation` de transformers.js.
- Inferencia en navegador y en Node.js a través de ONNX Runtime Web/Node.
- Ejecución en CPU con hilos configurables (los benchmarks usan 4 hilos).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al par uk→ru; no cubre otras direcciones.

## Casos de uso

- Traducción en el navegador sin backend: integrar el pipeline de transformers.js en una aplicación web para traducir contenido ucraniano a ruso en el cliente, aprovechando la reducción de memoria para no penalizar dispositivos modestos.
- Extensiones de navegador: traducir páginas o fragmentos seleccionados de uk a ru localmente, sin enviar texto a un servidor y sin depender de conectividad.
- Aplicaciones de escritorio ligeras: empaquetar el modelo ONNX en una app Electron o similar para traducción offline en equipos con poca RAM.
- Preprocesado de corpus: normalizar o traducir grandes volúmenes de texto ucraniano a ruso en pipelines por lotes ejecutados en CPU, donde el ahorro de memoria por instancia permite más procesos concurrentes.
- Traducción de documentación técnica o atención al cliente en contextos bilingües ucraniano-ruso, con la salvedad de que la calidad depende del modelo OPUS-MT subyacente y no se han publicado evaluaciones específicas.
- Prototipado e investigación: servir como referencia reproducible para comparar el impacto de optimizaciones de grafo ONNX en latencia y memoria frente al modelo base Xenova/opus-mt-uk-ru.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, chrF, COMET) en la información disponible. Los únicos datos cuantitativos publicados son de memoria tras la carga, medidos con ONNX Runtime 1.31.1 en CPU con 4 hilos:

| Configuracion | Linux (MiB) | Windows (MiB) | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 494 → 268 (−46 %) | 471 → 243 (−48 %) | si |
| Valores por defecto de ONNX Runtime | 265 → 208 (−21 %) | 188 → 158 (−16 %) | si |

No se proporcionan datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM: no aplica en la práctica; el modelo está pensado para CPU y su huella es de cientos de MiB (208-268 MiB según configuración en Linux).
- GPU recomendadas: no se especifican; el modelo no está orientado a GPU.
- Cabe holgadamente en cualquier GPU de consumo e incluso en entornos sin GPU; también en navegador.
- Opciones de despliegue: transformers.js con ONNX Runtime (Web o Node), y script Python propio del repositorio (`translate.py`) basado en onnxruntime, sentencepiece y numpy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/uk-ru | no disponible | no disponible | uk→ru | CC BY 4.0 | ONNX (transformers.js) | Decodificador fusionado optimizado; −46/−48 % de memoria con `disable_quant_qdq = 1` |
| Xenova/opus-mt-uk-ru | no disponible | no disponible | uk→ru | CC BY 4.0 | ONNX | Modelo base; mismos pesos y tokens, mayor consumo de memoria |
| Helsinki-NLP/opus-mt-uk-ru | no disponible | no disponible | uk→ru | CC BY 4.0 | PyTorch/safetensors (formato original OPUS-MT) | Modelo original de la Universidad de Helsinki |
| Otros pares OptimaMT (49 pares) | no disponible | no disponible | varios pares | CC BY 4.0 | ONNX | Misma metodología de optimización aplicada a otros pares |

No se dispone de datos de rendimiento comparativo (BLEU, latencia) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo traduce en la dirección uk→ru; no soporta ru→uk ni otros idiomas.
- No se han publicado evaluaciones de calidad de traducción para este paquete; la calidad es la del modelo OPUS-MT subyacente y puede degradarse en dominios especializados, jerga o texto informal.
- Riesgo de alucinación y de traducciones literalmente incorrectas inherente a los modelos Marian de tamaño reducido, especialmente en frases largas o ambiguas.
- No hay información sobre sesgos específicos del par uk-ru; los sesgos del corpus OPUS-MT original se heredan sin cambios.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio citar a OPUS-MT (Universidad de Helsinki), a Xenova por la exportación ONNX y a OptimaMT por la modificación del grafo.
- La reducción de memoria depende de usar `disable_quant_qdq = 1` en las opciones de sesión de ONNX Runtime; sin esa opción el ahorro es menor (−21 % en Linux, −16 % en Windows).
- Solo se ha reconstruido `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son copia del modelo base y cualquier cambio en este último no se refleja automáticamente.
- No hay soporte de tool calling, agentes ni razonamiento multi-paso; no debe emplearse como sustituto de un LLM generalista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/uk-ru
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-uk-ru
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-uk-ru
- Librería transformers.js: https://github.com/huggingface/transformers.js
