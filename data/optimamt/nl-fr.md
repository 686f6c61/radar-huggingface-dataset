# OptimaMT/nl-fr

## Resumen

OptimaMT/nl-fr es una conversión a ONNX del modelo de traducción automática neuronal Xenova/opus-mt-nl-fr, especializado en la traducción de neerlandés a francés. Lo desarrolla OptimaMT, un proyecto que publica 49 pares de idiomas bajo el patrón `OptimaMT/<src>-<tgt>`, todos derivados de la familia OPUS-MT de la Universidad de Helsinki. El modelo resuelve una tarea concreta: traducción bidireccional de alta calidad entre dos lenguas europeas con recursos abundantes, empaquetada para ejecución en navegador y en CPU mediante transformers.js y ONNX Runtime.

La relevancia de esta variante no está en los pesos (idénticos a los del modelo base) sino en la optimización del grafo ONNX: el decoder fusionado se ha reconstruido moviendo la proyección de salida fuera de sus dos ramas, lo que reduce el consumo de memoria tras la carga entre un 16 % y un 48 % según la configuración y la plataforma, manteniendo exactamente los mismos tokens de salida. Es, por tanto, una alternativa de despliegue ligero para entornos con restricciones de memoria, no un modelo nuevo.

Arquitectónicamente es un transformer encoder-decoder estilo Marian, con un vocabulario de 57.642 tokens. El repositorio ocupa 0,1 GB y la licencia es CC BY 4.0, heredada de OPUS-MT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8); el repositorio incluye `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | neerlandes (nl), frances (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); unico fichero reconstruido: `onnx/decoder_model_merged_quantized.onnx` |
| Vocabulario | 57.642 tokens |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Xenova/opus-mt-nl-fr (revision `6c8ebb68522f`) |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo es un Marian NMT, la arquitectura seq2seq de traduccion automatica neuronal desarrollada en el proyecto OPUS de la Universidad de Helsinki. Consta de un encoder y un decoder transformer con atencion cruzada, entrenados originalmente por Helsinki-NLP para el par neerlandes-frances. OptimaMT no reentrena ni modifica los pesos: toma la exportacion ONNX de Xenova en la revision `6c8ebb68522f` y reconstruye unicamente el decoder fusionado, desplazando la proyeccion de salida fuera de sus dos ramas. Se trata de un cambio de grafo, no de pesos ni de tokenizador, por lo que la salida es identica token a token.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden al modelo OPUS-MT original y no se detallan en la model card. La innovacion tecnica destacable es la reduccion de memoria tras la carga: con `disable_quant_qdq = 1` en ONNX Runtime 1.31.1 sobre CPU y 4 hilos, el consumo pasa de 494 a 270 MiB en Linux (-45 %) y de 467 a 242 MiB en Windows (-48 %); con los valores por defecto de ONNX Runtime, de 266 a 210 MiB (-21 %) y de 187 a 158 MiB (-16 %) respectivamente.

## Capacidades

- Traduccion de texto de neerlandes a frances, unidireccional segun el identificador del modelo.
- Generacion de texto seq2seq mediante pipeline `translation` de transformers.js.
- Ejecucion en navegador y en CPU a traves de ONNX Runtime y transformers.js.
- Inferencia en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py`).
- Traduccion de frases sueltas y parrafos; el ejemplo de la model card traduce "De vuurtoren staat aan de kust."
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada estrictamente al par nl-fr.

## Casos de uso

- Traduccion de documentacion tecnica neerlandesa a frances en pipelines de CI/CD: el modelo puede invocarse desde Node.js con transformers.js para traducir ficheros Markdown o cadenas de recursos antes de publicar, sin depender de servicios externos.
- Traduccion en el navegador para aplicaciones web: al ejecutarse con ONNX Runtime y un consumo de memoria de 158-270 MiB tras la carga, es viable en clientes ligeros para traducir formularios o contenido generado por el usuario sin enviar datos a un servidor.
- Localizacion de interfaces de usuario: integracion en flujos de build que generan ficheros de traduccion (JSON, YAML) a partir de las cadenas fuente en neerlandes, aprovechando la licencia CC BY 4.0 para uso comercial con atribucion.
- Traduccion de correspondencia y textos administrativos entre Belgica y paises francoparlantes, donde el par nl-fr es habitual; el modelo puede desplegarse en una intranet con onnxruntime en CPU.
- Procesamiento por lotes de correos o tickets de soporte en neerlandes para su clasificacion posterior en frances, usando el script `translate.py` como etapa previa a un analizador en frances.
- Prototipado rapido de sistemas de traduccion en entornos sin GPU: al ser un modelo de 0,1 GB y ejecutarse en CPU con 4 hilos, sirve para validar flujos de traduccion antes de invertir en infraestructura mayor.
- Traduccion de subtitulos o transcripciones en herramientas de escritorio que empaquetan modelos ONNX, dado el bajo consumo de memoria del decoder fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta mediciones de memoria tras la carga (494 → 270 MiB en Linux y 467 → 242 MiB en Windows con `disable_quant_qdq = 1`; 266 → 210 MiB y 187 → 158 MiB con los valores por defecto de ONNX Runtime), medidas con ONNX Runtime 1.31.1, CPU y 4 hilos, y confirma que los tokens de salida son identicos a los del modelo base.

## Requisitos de hardware

- VRAM: no aplica en el escenario documentado; la model card mide ejecucion en CPU. El consumo de memoria tras la carga es de 158-270 MiB segun plataforma y configuracion.
- GPU recomendadas: no se especifican; el modelo esta pensado para CPU y navegador. Cualquier GPU compatible con ONNX Runtime podria ejecutarlo, pero no hay datos de rendimiento en GPU.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,1 GB y la memoria en ejecucion es inferior a 300 MiB.
- Opciones de despliegue: transformers.js (JavaScript), ONNX Runtime en Python mediante `translate.py`, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles. Las mediciones publicadas son de memoria, no de velocidad, y se realizaron con 4 hilos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/nl-fr | no disponible | no disponible | nl, fr | CC BY 4.0 | ONNX | Decoder fusionado optimizado; -45 % de memoria con `disable_quant_qdq` |
| Xenova/opus-mt-nl-fr | no disponible | no disponible | nl, fr | CC BY 4.0 | ONNX | Modelo base; mismos pesos y tokens, mayor consumo de memoria |
| Helsinki-NLP/opus-mt-nl-fr | no disponible | no disponible | nl, fr | CC BY 4.0 | safetensors/PyTorch | Pesos originales de OPUS-MT; requiere conversion para transformers.js |

## Limitaciones y advertencias

- Traduccion unidireccional neerlandes-frances; no cubre el sentido inverso ni otros pares.
- Calidad heredada de OPUS-MT; no se aportan evaluaciones de calidad (BLEU, COMET) en la informacion disponible.
- Riesgo de alucinacion y de traducciones literales en textos especializados o con terminologia tecnica no vista en entrenamiento.
- No se documentan sesgos especificos; al ser un modelo entrenado sobre corpus OPUS, puede reflejar sesgos presentes en esos datos.
- Licencia CC BY 4.0: permite uso comercial con atribucion a OPUS-MT y a Xenova; es necesario conservar los creditos.
- Solo se ha reconstruido `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son copias byte a byte del modelo base, por lo que cualquier limitacion del export original de Xenova se mantiene.
- La optimizacion de memoria depende de la opcion `disable_quant_qdq = 1` en ONNX Runtime; sin ella la reduccion es menor (-21 % en Linux, -16 % en Windows).
- No hay datos de latencia ni de throughput, por lo que no puede garantizarse un rendimiento concreto en produccion sin medirlo.

## Enlaces

- [OptimaMT/nl-fr en Hugging Face](https://huggingface.co/OptimaMT/nl-fr)
- [Xenova/opus-mt-nl-fr (modelo base)](https://huggingface.co/Xenova/opus-mt-nl-fr)
- [Helsinki-NLP/opus-mt-nl-fr (pesos originales OPUS-MT)](https://huggingface.co/Helsinki-NLP/opus-mt-nl-fr)
- [Repositorio OptimaMT en GitHub](https://github.com/AmerAlreyahi/OptimaMT)
- [Informe tecnico REPORT.md](https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md)
- [Script translate.py](https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py)
- [Resultados interactivos OptimaMT/results](https://huggingface.co/spaces/OptimaMT/results)
