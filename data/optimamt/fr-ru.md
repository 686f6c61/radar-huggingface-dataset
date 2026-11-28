# OptimaMT/fr-ru

## Resumen

OptimaMT/fr-ru es un modelo de traduccion automatica frances-ruso derivado de Xenova/opus-mt-fr-ru, que a su vez es una exportacion a ONNX del modelo OPUS-MT de la Universidad de Helsinki. Lo desarrolla OptimaMT, un proyecto que publica versiones optimizadas de los modelos OPUS-MT en formato ONNX para su uso en el navegador y en el escritorio mediante transformers.js. El modelo resuelve la traduccion de texto de frances a ruso con un consumo de memoria reducido y una latencia menor que el original, manteniendo exactamente las mismas traducciones.

La innovacion principal es la reconstruccion del decoder fusionado cuantizado: se ha aplicado el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`), que reduce el uso de memoria entre un 47 % y un 49 % en Linux y Windows respectivamente, y acelera la inferencia entre 2,3 y 2,5 veces. El resto de archivos del repositorio son identicos byte a byte al modelo original de Xenova.

Se trata de un modelo Marian de traduccion supervisada, con un vocabulario de 64.377 tokens y un peso de repositorio de 0,1 GB. Su relevancia actual radica en que permite desplegar traduccion frances-ruso de calidad en entornos con recursos limitados, como aplicaciones de escritorio o extensiones de navegador, sin renunciar a la fidelidad del modelo original. Esta pensado para integrarse en pipelines de traduccion en tiempo real y en herramientas de traduccion de pantalla, como demuestra su uso en produccion en OpenCircle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en transformers.js); decoder fusionado cuantizado |
| Idiomas soportados | frances (fr), ruso (ru) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo es un Marian, la arquitectura de traduccion neuronal de Helsinki-NLP basada en transformer encoder-decoder, originalmente entrenada por la Universidad de Helsinki dentro del proyecto OPUS-MT. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden al modelo original OPUS-MT y no se detallan en la informacion proporcionada.

La modificacion introducida por OptimaMT es puramente de grafo: se reconstruye unicamente el archivo `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyeccion de salida del decoder fuera de sus dos ramas. El resto de archivos son identicos al original de Xenova en la revision `c2ec732b045a`. El resultado es un decoder fusionado que aprovecha el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`), con una reduccion de memoria del 47 % en Linux (de 539 a 287 MiB) y del 49 % en Windows (de 513 a 264 MiB), y una aceleracion de 2,3 a 2,5 veces. Con los valores por defecto de ONNX Runtime, la reduccion es del 22 % en Linux (de 287 a 224 MiB) y del 16 % en Windows (de 200 a 168 MiB). Las traducciones producidas son identicas token a token a las del modelo original.

## Capacidades

- Traduccion de texto de frances a ruso, unica tarea del modelo.
- Generacion de traducciones identicas al modelo base Xenova/opus-mt-fr-ru.
- Ejecucion en navegador y en escritorio mediante transformers.js y ONNX Runtime.
- Inferencia en CPU con bajo consumo de memoria (287 MiB en Linux con modo rapido).
- Integracion en aplicaciones de traduccion de pantalla en tiempo real.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues limitadas exclusivamente al par frances-ruso.

## Casos de uso

- Traduccion de pantalla en tiempo real: el modelo se integra en herramientas de escritorio como OpenCircle para traducir texto en pantalla de frances a ruso con latencia reducida, gracias a su bajo consumo de memoria y a la aceleracion del decoder fusionado.
- Extension de navegador para traduccion: al ejecutarse mediante transformers.js y ONNX Runtime, puede desplegarse en el navegador sin servidor, traduciendo contenido web de frances a ruso de forma local.
- Traduccion de documentacion tecnica: adecuado para pipelines batch que convierten documentacion o articulos del frances al ruso, donde la fidelidad token a token respecto al modelo original garantiza consistencia.
- Subtitulado y transcripcion: puede integrarse en flujos que traducen subtitulos en frances a ruso, con inferencia en CPU y bajo consumo de recursos.
- Aplicaciones de escritorio con recursos limitados: su huella de memoria de 264-287 MiB permite incluirlo en aplicaciones ligeras para Windows y Linux sin requerir GPU.
- Traduccion de correo y mensajeria: util en clientes de correo o mensajeria que necesiten traduccion local frances-ruso sin enviar datos a servicios en la nube, preservando la privacidad.
- Sistemas embebidos y edge computing: la cuantizacion ONNX y el bajo consumo lo hacen viable en dispositivos con CPU y memoria limitadas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 15,07 |
| FLORES-200 devtest (1.012 frases), chrF | 44,17 |
| Memoria tras carga, Linux, modo rapido | 287 MiB (desde 539 MiB, -47 %) |
| Memoria tras carga, Windows, modo rapido | 264 MiB (desde 513 MiB, -49 %) |
| Memoria tras carga, Linux, ONNX Runtime por defecto | 224 MiB (desde 287 MiB, -22 %) |
| Memoria tras carga, Windows, ONNX Runtime por defecto | 168 MiB (desde 200 MiB, -16 %) |
| Aceleracion del decoder | 2,3-2,5x |

Los resultados se obtuvieron con ONNX Runtime 1.31.1 en CPU con 4 hilos (Linux; Windows en una maquina virtual), decodificacion greedy.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo esta disenado para CPU; en GPU la VRAM seria minima (menos de 1 GB).
- GPU recomendadas: no se especifican; el modelo esta optimizado para CPU.
- Cabe en cualquier GPU consumer, e incluso en CPU con memoria limitada (287 MiB en Linux con modo rapido).
- Opciones de despliegue: transformers.js con ONNX Runtime, y script Python con onnxruntime, sentencepiece y numpy (`translate.py`).
- Latencia y throughput: aceleracion de 2,3-2,5 veces respecto al decoder original; no se proporcionan valores absolutos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/fr-ru | no disponible | no disponible | fr, ru | CC BY 4.0 | ONNX | Decoder fusionado optimizado, 287 MiB en Linux |
| Xenova/opus-mt-fr-ru | no disponible | no disponible | fr, ru | CC BY 4.0 | ONNX | Modelo base, 539 MiB en Linux, mismas traducciones |
| Helsinki-NLP/opus-mt-fr-ru | no disponible | no disponible | fr, ru | CC BY 4.0 | safetensors/PyTorch | Modelo original OPUS-MT, sin optimizacion ONNX |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traduccion frances-ruso; no realiza otras tareas.
- Riesgo de alucinacion y errores de traduccion inherentes al modelo OPUS-MT original, especialmente en textos especializados o ambiguos.
- No se dispone de informacion sobre sesgos especificos; al heredar los pesos de OPUS-MT, puede reflejar sesgos presentes en los datos de entrenamiento originales.
- Limitacion de contexto: no se especifica la longitud maxima de secuencia; textos muy largos pueden requerir segmentacion.
- Licencia CC BY 4.0: permite uso comercial con atribucion a los autores originales (Universidad de Helsinki, Xenova y OptimaMT).
- El rendimiento medido corresponde a CPU con 4 hilos; los valores pueden variar en otros entornos.
- Solo se ha reconstruido el decoder fusionado cuantizado; el resto de pesos son identicos al original, por lo que las limitaciones del modelo base se mantienen.

## Enlaces

- [Hugging Face: OptimaMT/fr-ru](https://huggingface.co/OptimaMT/fr-ru)
- [Modelo base: Xenova/opus-mt-fr-ru](https://huggingface.co/Xenova/opus-mt-fr-ru)
- [Modelo original: Helsinki-NLP/opus-mt-fr-ru](https://huggingface.co/Helsinki-NLP/opus-mt-fr-ru)
- [Repositorio OptimaMT en GitHub](https://github.com/AmerAlreyahi/OptimaMT)
- [Coleccion de los 51 pares OptimaMT](https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869)
- [OpenCircle (aplicacion de traduccion de pantalla)](https://github.com/AmerAlreyahi/OpenCircle)
- [Resultados interactivos: OptimaMT/results](https://huggingface.co/spaces/OptimaMT/results)
- [Metodo: REPORT.md](https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md)
- [Script de traduccion: translate.py](https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py)
