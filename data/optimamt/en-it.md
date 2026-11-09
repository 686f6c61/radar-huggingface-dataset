# OptimaMT/en-it

## Resumen

OptimaMT/en-it es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-en-it, que a su vez deriva del modelo OPUS-MT desarrollado por la Universidad de Helsinki. Se trata de un modelo encoder-decoder basado en la arquitectura Marian, especializado en traducción de inglés a italiano y optimizado para su ejecución en el navegador o en entornos con recursos limitados mediante transformers.js y ONNX Runtime.

La aportación principal de esta variante no es un reentrenamiento, sino una modificación del grafo computacional: se ha reconstruido únicamente el archivo `onnx/decoder_model_merged_quantized.onnx` moviendo la proyección de salida del decoder fuera de sus dos ramas, lo que reduce el consumo de memoria tras la carga entre un 48 % y un 51 % en Linux y Windows respectivamente (en configuraciones con `disable_quant_qdq = 1`), manteniendo exactamente los mismos tokens de salida que el modelo original.

Forma parte del proyecto OptimaMT, que agrupa 49 pares de idiomas bajo el esquema de nombres `OptimaMT/<src>-<tgt>`. El modelo es relevante para desarrolladores que necesitan traducción EN-IT de baja latencia en el cliente (navegador, dispositivos de borde) sin renunciar a la calidad del modelo OPUS-MT original. El repositorio ocupa aproximadamente 0,1 GB y el vocabulario consta de 80.035 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian / OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8); el repositorio incluye `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | en (ingles), it (italiano) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Marian, un modelo transformer seq2seq encoder-decoder diseñado especificamente para traduccion automatica neuronal, en la linea de los modelos OPUS-MT de la Universidad de Helsinki. El modelo original fue entrenado por el grupo Language Technology de la Universidad de Helsinki sobre datos paralelos de OPUS, y posteriormente exportado a ONNX por Xenova para su uso con transformers.js.

Esta variante concreta no introduce cambios en los pesos ni en el entrenamiento: los pesos son identicos byte a byte al modelo base Xenova/opus-mt-en-it en la revision `075406e3c8c2`, salvo el mencionado archivo del decoder, que se ha regenerado con una reorganizacion del grafo (la proyeccion de salida del decoder se saca de sus dos ramas). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card no los detalla. La innovacion tecnica destacable es exclusivamente de eficiencia en inferencia: reduccion del footprint de memoria en tiempo de carga manteniendo la fidelidad de la traduccion token a token.

## Capacidades

- Traduccion automatica de texto de ingles a italiano (direccion unica en-it).
- Generacion de texto seq2seq mediante pipeline `translation` de transformers.js.
- Ejecucion en navegador y en entornos de borde gracias al formato ONNX y a la cuantizacion q8.
- Inferencia en CPU con ONNX Runtime (probado con 1.31.1 y 4 hilos).
- Compatibilidad con el ecosistema transformers.js y con scripts Python basados en onnxruntime, sentencepiece y numpy.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido; es un modelo puramente de traduccion.

## Casos de uso

- Traduccion en el navegador sin backend: integrado con transformers.js, el modelo puede traducir contenido EN-IT en el cliente, lo que elimina la necesidad de enviar texto a un servidor y reduce la latencia percibida, especialmente util en aplicaciones web con requisitos de privacidad.
- Extensiones de navegador para lectura bilingue: al ejecutarse en el navegador con un footprint de memoria reducido (hasta un 51 % menos tras la carga), es adecuado para traducir articulos o documentacion al vuelo sin consumir excesiva memoria de la pestana.
- Traduccion de documentacion tecnica en pipelines de CI/CD: el script `translate.py` permite invocar el modelo desde Python para traducir README, changelogs o mensajes de interfaz de forma automatizada dentro de un flujo de integracion continua.
- Preprocesado de datos multilingues: util para normalizar corpus EN-IT en tareas de investigacion o para generar pares de entrenamiento en proyectos de NLP, dado que mantiene la fidelidad del modelo OPUS-MT original.
- Aplicaciones de escritorio o moviles con recursos limitados: la cuantizacion q8 y la reduccion de memoria hacen viable el despliegue en dispositivos de borde donde un modelo mas pesado no cabria.
- Traduccion de subtitulos o transcripciones: para flujos donde se procesan segmentos cortos de texto EN y se necesita salida IT con baja latencia en CPU.
- Prototipado rapido de funcionalidades de traduccion: al ser un drop-in replacement del modelo base, permite sustituir Xenova/opus-mt-en-it sin cambios en el codigo de integracion, facilitando pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traduccion (BLEU, COMET, etc.) en la informacion disponible. La model card unicamente reporta metricas de memoria tras la carga y confirma la identidad de tokens de salida respecto al modelo base:

| Metrica | Linux | Windows | Tokens identicos |
|---|---:|---:|---|
| Memoria tras carga (`disable_quant_qdq = 1`) | 645 → 333 MiB (-48 %) | 621 → 307 MiB (-51 %) | si |
| Memoria tras carga (defaults de ONNX Runtime) | 255 → 216 MiB (-15 %) | 230 → 190 MiB (-17 %) | si |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en una maquina virtual).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 190-333 MiB de memoria tras la carga segun configuracion y sistema operativo (datos de la model card en CPU).
- GPU recomendadas: no se especifican; el modelo esta pensado para CPU y entornos de borde. Cualquier GPU moderna puede ejecutarlo, pero no es su objetivo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual, aunque el caso de uso principal es CPU y navegador.
- Opciones de despliegue: transformers.js (navegador/Node.js), ONNX Runtime (Python y otros lenguajes), y el script `translate.py` incluido en el repositorio del proyecto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-it | no disponible | no disponible | en, it | cc-by-4.0 | ONNX | Variante optimizada en memoria del modelo base |
| Xenova/opus-mt-en-it | no disponible | no disponible | en, it | cc-by-4.0 | ONNX | Modelo base, mayor uso de memoria tras la carga |
| Helsinki-NLP/opus-mt-en-it | no disponible | no disponible | en, it | cc-by-4.0 | safetensors / PyTorch | Modelo original de OPUS-MT, no optimizado para navegador |

Los tres modelos comparten pesos y calidad de traduccion; las diferencias estan en el formato, el consumo de memoria y la orientacion al despliegue (navegador frente a servidor). No se dispone de datos de benchmarks comparativos de calidad en la informacion proporcionada.

## Limitaciones y advertencias

- Direccion de traduccion unica: solo traduce de ingles a italiano; no soporta la direccion inversa ni otros pares.
- Sesgos: al derivar de OPUS-MT, puede heredar sesgos presentes en los corpus paralelos de OPUS, aunque la model card no detalla analisis de sesgos.
- Riesgo de alucinacion: como todo modelo seq2seq de traduccion, puede producir traducciones fluyentes pero incorrectas en frases ambiguas, terminologia especializada o texto fuera de dominio.
- Limitaciones de contexto e idioma: la longitud maxima de contexto no se especifica en la informacion disponible; el modelo solo cubre en e it.
- Restricciones de licencia: licencia CC BY 4.0, que permite uso comercial con atribucion a los autores originales (Universidad de Helsinki, exportacion ONNX de Xenova y modificacion de OptimaMT).
- Caveat para produccion: la optimizacion de memoria depende de la opcion `disable_quant_qdq` de ONNX Runtime; sin ella, la reduccion es mas modesta (15-17 %). La validacion de calidad se limita a la identidad de tokens respecto al modelo base, no a una evaluacion BLEU/COMET independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopcion ni de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-it
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-it
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-it
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del metodo: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
