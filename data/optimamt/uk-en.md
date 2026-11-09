# OptimaMT/uk-en

## Resumen

OptimaMT/uk-en es un modelo de traduccion automatica ucraniano-ingles publicado por OptimaMT, un proyecto que distribuye 49 pares de idiomas bajo el prefijo `OptimaMT/<src>-<tgt>`. No se trata de un modelo entrenado desde cero, sino de una copia directa del export ONNX de Xenova (`Xenova/opus-mt-uk-en`, revision `b2ad6afa424a`), a su vez derivado del modelo original de Helsinki-NLP basado en la arquitectura Marian. La unica modificacion respecto al original es la reconstruccion del decoder fusionado cuantizado (`onnx/decoder_model_merged_quantized.onnx`), en el que la proyeccion de salida se ha extraido de sus dos ramas. El resto de ficheros son identicos byte a byte al export de Xenova.

La relevancia del modelo es practica: mantiene exactamente los mismos pesos y la misma tokenizacion (vocabulario de 61.587 tokens) que el original, pero reduce el consumo de memoria tras la carga. Segun la model card, con `disable_quant_qdq = 1` el uso de memoria pasa de 520 a 279 MiB en Linux (-46 %) y de 495 a 257 MiB en Windows (-48 %), sin alterar los tokens generados. Con los valores por defecto de ONNX Runtime la reduccion es menor (-22 % en Linux, -16 % en Windows). Esto lo hace adecuado para inferencia en navegador o en CPU mediante transformers.js y ONNX Runtime.

El modelo esta pensado exclusivamente para traduccion de ucraniano a ingles, con licencia CC BY 4.0 y un tamano de repositorio de 0,1 GB. No incorpora capacidades de razonamiento, codigo ni agentes; es un traductor secuencia a secuencia especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, export ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (`decoder_model_merged_quantized.onnx`); dtype `q8` en transformers.js |
| Idiomas soportados | ucraniano (uk) como origen, ingles (en) como destino |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (export para transformers.js / ONNX Runtime) |

## Arquitectura y entrenamiento

El modelo es un Marian, la arquitectura de traduccion neuronal secuencia a secuencia desarrollada en el ecosistema OPUS-MT de la Universidad de Helsinki. Consta de un encoder y un decoder transformer con atencion estandar; el export a ONNX separa los componentes en ficheros independientes, incluido un decoder fusionado que combina las fases de prefill y decodificacion. El vocabulario tiene 61.587 tokens y la tokenizacion se gestiona con SentencePiece, segun el script de inferencia en Python incluido en el repositorio del proyecto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO; la model card no los detalla y el modelo hereda el entrenamiento original de Helsinki-NLP/opus-mt-uk-en. La innovacion tecnica del artefacto publicado por OptimaMT es exclusivamente de despliegue: la proyeccion de salida del decoder se ha sacado de sus dos ramas mediante un cambio en el grafo, lo que permite cargar el decoder fusionado con menor huella de memoria sin modificar los pesos. Las mediciones reportadas se hicieron con ONNX Runtime 1.31.1 en CPU con 4 hilos (Linux, y Windows en una maquina virtual).

## Capacidades

- Traduccion de texto de ucraniano a ingles, unica tarea soportada (`pipeline_tag: translation`).
- Generacion secuencia a secuencia con tokenizacion SentencePiece y vocabulario de 61.587 tokens.
- Inferencia en navegador y en Node.js mediante transformers.js con dtype `q8`.
- Inferencia en Python con onnxruntime, sentencepiece y numpy a traves del script `translate.py` del proyecto.
- Ejecucion en CPU sin GPU, con opciones de optimizacion de sesion (`disable_quant_qdq`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No es un modelo multilingue general: solo cubre el par uk-en.

## Casos de uso

- Traduccion de documentacion tecnica ucraniana a ingles: el modelo procesa frases completas de forma secuencial y puede integrarse en un pipeline de preprocesado que traduzca ficheros Markdown o HTML antes de publicarlos en ingles.
- Localizacion de interfaces y contenidos web en el navegador: al ejecutarse con transformers.js y pesos ONNX cuantizados, permite traducir texto en el cliente sin enviar datos a un servidor, util para privacidad y para reducir costes de backend.
- Traduccion de mensajes de soporte y correos de usuarios ucranianos: el bajo consumo de memoria tras la carga (279 MiB en Linux con `disable_quant_qdq = 1`) permite mantenerlo residente en un servicio ligero de atencion al cliente.
- Procesamiento por lotes de corpus ucranianos para analisis: el script `translate.py` basado en onnxruntime facilita ejecutar traducciones masivas en CPU en entornos sin GPU.
- Traduccion de noticias y contenido editorial: adecuado para flujos donde se requiere una primera version en ingles que luego revisa un editor humano, dado el caracter especializado del par de idiomas.
- Extensiones y herramientas de escritorio: el formato ONNX y el tamano de repositorio de 0,1 GB permiten empaquetar el traductor dentro de aplicaciones de escritorio o plugins sin dependencias pesadas.
- Generacion de subtitulos o transcripciones traducidas: combinado con un sistema de reconocimiento de voz en ucraniano, puede producir subtitulos en ingles en tiempo casi real en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traduccion (BLEU, COMET, chrF) en la informacion disponible. La model card solo reporta mediciones de memoria tras la carga:

| Metrica | Linux | Windows |
|---|---:|---:|
| Memoria con `disable_quant_qdq = 1` | 520 → 279 MiB (-46 %) | 495 → 257 MiB (-48 %) |
| Memoria con valores por defecto de ONNX Runtime | 278 → 218 MiB (-22 %) | 195 → 164 MiB (-16 %) |
| Tokens generados identicos al original | si | si |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en maquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia en CPU. La memoria RAM necesaria tras la carga es de aproximadamente 164-279 MiB segun plataforma y configuracion de sesion.
- GPU recomendadas: no disponibles ni necesarias; no se documenta soporte GPU especifico.
- GPU de consumo: irrelevante para este modelo; funciona en cualquier CPU moderna con ONNX Runtime.
- Despliegue: transformers.js (`@huggingface/transformers`) con dtype `q8`, ONNX Runtime en Python mediante `translate.py`, y en general cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada. Las pruebas reportadas usan 4 hilos de CPU, pero no se publican tiempos por frase ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/uk-en | no disponible | no disponible | uk → en | CC BY 4.0 | ONNX | Decoder fusionado optimizado en memoria |
| Xenova/opus-mt-uk-en | no disponible | no disponible | uk → en | CC BY 4.0 | ONNX | Modelo base del que deriva; mismo tokenizador |
| Helsinki-NLP/opus-mt-uk-en | no disponible | no disponible | uk → en | CC BY 4.0 | safetensors / PyTorch | Modelo original OPUS-MT de la Universidad de Helsinki |

La comparativa se limita a la familia OPUS-MT porque no se dispone de datos de otros modelos comparables en la informacion proporcionada. La diferencia entre OptimaMT/uk-en y Xenova/opus-mt-uk-en es unicamente el decoder fusionado reconstruido, con reduccion de memoria y tokens identicos; frente al original de Helsinki-NLP, el cambio es el formato (ONNX frente a PyTorch) y la optimizacion de despliegue.

## Limitaciones y advertencias

- Solo traduce de ucraniano a ingles; no soporta el sentido inverso ni otros pares de idiomas.
- No se han publicado evaluaciones de calidad de traduccion, por lo que el rendimiento real en dominios especializados (legal, medico, tecnico) es desconocido.
- Riesgo de alucinacion y de traducciones erroneas en frases ambiguas, nombres propios, terminologia especializada o texto con ruido, comun en modelos Marian de este tamano.
- La longitud maxima de contexto no esta documentada; frases o parrafos muy largos pueden truncarse o degradar la calidad.
- El modelo hereda los sesgos del corpus OPUS con el que se entreno el original; no se documentan analisis de sesgo.
- Licencia CC BY 4.0: permite uso comercial con atribucion. Es obligatorio acreditar a la Universidad de Helsinki (pesos OPUS-MT), a Xenova (export ONNX) y a OptimaMT (modificacion del decoder).
- La optimizacion de memoria depende de la opcion `disable_quant_qdq` y de la version de ONNX Runtime (probada con 1.31.1); otras versiones pueden comportarse de forma distinta.
- El modelo no es adecuado para tareas generativas generales, razonamiento ni codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/uk-en
- Proyecto OptimaMT en GitHub: https://github.com/AmerAlreyahi/OptimaMT
- Informe del metodo: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-uk-en
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-uk-en
