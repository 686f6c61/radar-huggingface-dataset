# OptimaMT/ar-es

## Resumen

OptimaMT/ar-es es un modelo de traduccion automatica arabe-castellano derivado de Helsinki-NLP/opus-mt-ar-es (familia OPUS-MT, Universidad de Helsinki), redistribuido como exportacion ONNX optimizada para su uso con ONNX Runtime y transformers.js. No es un modelo entrenado desde cero: reutiliza integramente los pesos del modelo Marian original y modifica unicamente el grafo del decodificador para reducir el consumo de memoria y acelerar la inferencia. La revision base es `da86e973e723` y el autor del paquete es OptimaMT, que mantiene una coleccion de 51 pares de traduccion con el mismo formato.

El interes practico esta en el empaquetado: el decodificador fusionado cuantizado se ha reconstruido con `disable_quant_qdq = 1`, lo que segun la model card reduce el uso de memoria entre un 47 % y un 49 % en Linux y Windows respectivamente, con una aceleracion de 2,3 a 2,5 veces, manteniendo tokens de salida identicos al original. El repositorio ocupa 0,1 GB, lo que lo hace viable en entornos de escritorio y navegador sin GPU dedicada.

El modelo esta pensado para traduccion de frases y parrafos de arabe a castellano en aplicaciones ligeras (traductores de pantalla, plugins, herramientas de escritorio). Su vocabulario es de 62.526 tokens y la calidad medida en FLORES-200 devtest es de BLEU 17,85 y chrF 46,35 en decodificacion greedy, cifras modestas que reflejan la naturaleza compacta del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian (OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (decodificador fusionado cuantizado, `q8` en transformers.js) |
| Idiomas soportados | arabe (ar), castellano (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`decoder_model_merged_quantized.onnx`); tokenizer en formato Xenova (`tokenizer.json`, `special_tokens_map.json`, `tokenizer_config.json`) |
| Vocabulario | 62.526 tokens |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Helsinki-NLP/opus-mt-ar-es (revision `da86e973e723`) |
| Libreria | transformers.js |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo es un Marian NMT, la arquitectura encoder-decoder con atencion completa empleada por la familia OPUS-MT de Helsinki-NLP. No hay informacion en la model card sobre el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron fases de fine-tuning o RLHF; esos detalles corresponden al modelo original Helsinki-NLP/opus-mt-ar-es, no documentados en esta ficha.

La innovacion de este paquete es exclusivamente de despliegue. El decodificador fusionado (`decoder_model_merged_quantized.onnx`) se ha reconstruido con la opcion de ONNX Runtime `disable_quant_qdq = 1` (modo rapido), y la proyeccion de salida del decodificador se ha sacado de sus dos ramas, un cambio de grafo que no altera los pesos. Los demas ficheros son copia byte a byte del export ONNX original con el layout de Xenova. Segun la model card, el resultado son exactamente los mismos tokens de salida que el modelo original.

## Capacidades

- Traduccion de texto de arabe a castellano, orientada a frases y parrafos.
- Ejecucion en navegador mediante transformers.js con `dtype: "q8"`.
- Ejecucion en Python via ONNX Runtime, SentencePiece y NumPy (script `translate.py` incluido en el repositorio GitHub).
- Inferencia en CPU sin GPU dedicada; probado con ONNX Runtime 1.31.1 y 4 hilos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada estrictamente al par ar-es.

## Casos de uso

- Traduccion de pantalla en escritorio: el modelo se integra en OpenCircle, un traductor de pantalla para Windows y Linux que lo distribuye desde la version v0.1.4; su bajo consumo (256-281 MiB tras la carga) permite mantenerlo residente en segundo plano.
- Extension de navegador o widget web: al ejecutarse con transformers.js y ONNX Runtime Web, puede traducir texto arabe sin enviar datos a un servidor, lo que resulta util por privacidad.
- Traduccion de documentacion tecnica o correspondencia: para parrafos cortos y medios, con la calidad medida en FLORES-200 (BLEU 17,85, chrF 46,35) como referencia realista.
- Preprocesado en pipelines de NLP: traducir contenido arabe a castellano antes de pasarlo a un analizador de sentimiento, un clasificador o un buscador, en entornos con recursos limitados.
- Herramientas de accesibilidad y lectura: subtitulado o lectura asistida de textos arabes en aplicaciones de escritorio con CPU modesta.
- Prototipado y evaluacion de sistemas de traduccion: al ser un export ONNX reproducible con script Python, sirve como baseline ligero en comparaciones de calidad o latencia.
- Despliegue en dispositivos sin GPU: cualquier escenario donde no haya acelerador disponible y se requiera traduccion offline.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| BLEU (FLORES-200 devtest) | 17,85 | 1.012 frases, greedy |
| chrF (FLORES-200 devtest) | 46,35 | 1.012 frases, greedy |
| Aceleracion vs. original | 2,3-2,5x | `disable_quant_qdq = 1` |
| Memoria tras carga (Linux) | 526 -> 281 MiB (-47 %) | `disable_quant_qdq = 1` |
| Memoria tras carga (Windows) | 503 -> 256 MiB (-49 %) | `disable_quant_qdq = 1` |
| Memoria tras carga (Linux) | 281 -> 220 MiB (-22 %) | defaults de ONNX Runtime |
| Memoria tras carga (Windows) | 196 -> 168 MiB (-14 %) | defaults de ONNX Runtime |
| Tokens de salida | identicos al original | ambas configuraciones |

No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta disenado para CPU.
- Memoria RAM tras carga: aproximadamente 256-281 MiB con `disable_quant_qdq = 1` en Linux y Windows respectivamente.
- GPU recomendadas: no aplica; cualquier GPU serviria solo como acelerador opcional de ONNX Runtime, sin datos publicados.
- Cabe en cualquier equipo de consumo: portatiles, mini-PC y navegadores modernos.
- Opciones de despliegue: transformers.js (JavaScript/TypeScript), ONNX Runtime en Python (script `translate.py`), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no se publican cifras absolutas de latencia; solo la comparativa relativa de 2,3-2,5x frente al export original, medida con ONNX Runtime 1.31.1, CPU y 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OptimaMT/ar-es | no disponible | no disponible | BLEU 17,85 / chrF 46,35 (FLORES-200) | CC BY 4.0 | Hugging Face, ONNX |
| Helsinki-NLP/opus-mt-ar-es | no disponible | no disponible | misma calidad (mismos pesos) | CC BY 4.0 | Hugging Face, PyTorch |
| Xenova/opus-mt-ar-es (export ONNX) | no disponible | no disponible | misma calidad (mismos pesos) | CC BY 4.0 | Hugging Face, ONNX |
| Otros pares de la coleccion OptimaMT | no disponible | no disponible | no disponible | CC BY 4.0 | Hugging Face, ONNX |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de alternativas de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad modesta: BLEU 17,85 y chrF 46,35 en FLORES-200 indican un rendimiento inferior al de modelos NMT de mayor tamano; no es adecuado para traduccion editorial o juridica sin revision humana.
- Riesgo de alucinacion y de traducciones literales o incorrectas en frases largas, terminologia especializada o registro informal.
- Solo cubre el par arabe-castellano; no traduce a otros idiomas ni en sentido inverso.
- No hay informacion sobre sesgos de genero, dialecto o dominio en la model card; el corpus OPUS subyacente puede introducir sesgos de origen.
- Licencia CC BY 4.0: permite uso comercial con atribucion a OPUS-MT (Universidad de Helsinki) y al export ONNX original; conviene conservar los avisos de copyright.
- El modelo no incluye mecanismos de moderacion ni filtrado de contenido.
- La longitud de contexto no esta documentada; se recomienda trabajar con frases o parrafos cortos.
- El rendimiento optimizado se ha medido con ONNX Runtime 1.31.1 en CPU y 4 hilos; otros entornos pueden variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ar-es
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ar-es
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Coleccion de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- OpenCircle (traductor de pantalla): https://github.com/AmerAlreyahi/OpenCircle
