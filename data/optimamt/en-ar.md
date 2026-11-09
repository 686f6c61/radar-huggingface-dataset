# OptimaMT/en-ar

## Resumen

OptimaMT/en-ar es un modelo de traduccion automatica ingles-arabe derivado de Xenova/opus-mt-en-ar, que a su vez es una exportacion a ONNX del modelo OPUS-MT de la Universidad de Helsinki. El autor, OptimaMT, mantiene una coleccion de 49 pares de traduccion bajo el mismo esquema de nombres (`OptimaMT/<src>-<tgt>`), y esta variante concreta se presenta como una copia directa ("drop-in") del modelo original en la revision `034a684356c1`, con la unica diferencia de un decoder fusionado mas ligero. Los pesos, el vocabulario y los tokens generados son identicos al original; solo cambia la estructura del grafo ONNX.

La relevancia de este modelo no esta en una mejora de calidad de traduccion, sino en la reduccion de memoria en inferencia. Segun la model card, tras la carga el modelo pasa de 527 a 282 MiB en Linux (-46 %) y de 504 a 256 MiB en Windows (-49 %) cuando se desactiva la cuantizacion QDQ; con los valores por defecto de ONNX Runtime, la reduccion es del 22 % y el 16 % respectivamente. Esto lo hace atractivo para despliegues en navegador o en entornos con recursos muy limitados mediante transformers.js.

Arquitectura Marian (transformer encoder-decoder), modelo base OPUS-MT, licencia CC BY 4.0, soporte para ingles y arabe, y distribucion exclusivamente en formato ONNX cuantizado a 8 bits. No se trata de un modelo generativo de proposito general, sino de un traductor especializado de un solo par de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado a 8 bits (`q8`); opcion de desactivar QDQ en el decoder |
| Idiomas soportados | ingles (en), arabe (ar) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (repo de 0,1 GB; `onnx/decoder_model_merged_quantized.onnx` reconstruido) |
| Vocabulario | 62.802 tokens |
| Libreria | transformers.js (3.x recomendado) |
| Modelo base | Xenova/opus-mt-en-ar (revision `034a684356c1`) |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo es un Marian encoder-decoder, la arquitectura utilizada por la familia OPUS-MT de Helsinki-NLP para traduccion neuronal. No se dispone de informacion sobre el numero de parametros, el volumen de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada; esos datos corresponden al modelo original OPUS-MT y no se detallan en la model card de esta variante. Tampoco se indica si hubo etapas de ajuste fino con RLHF o DPO, algo poco habitual en modelos de traduccion de este tipo.

La innovacion tecnica de esta variante es puramente de grafo: se reconstruye unicamente el archivo `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyeccion de salida del decoder fuera de sus dos ramas. El resto de archivos son identicos byte a byte al export original de Xenova. El resultado es una reduccion de memoria tras la carga sin cambios en los tokens generados, verificado con ONNX Runtime 1.31.1 en CPU con 4 hilos. El modelo requiere que cada entrada comience con el token de variante de destino `>>ara<<`.

## Capacidades

- Traduccion de texto de ingles a arabe, unico par soportado.
- Generacion de tokens identica al modelo base Xenova/opus-mt-en-ar (verificado por el autor).
- Ejecucion en navegador y en Node.js mediante transformers.js 3.x.
- Ejecucion en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` incluido en el repositorio del proyecto).
- Inferencia en CPU con huella de memoria reducida (282 MiB en Linux con QDQ desactivado).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento.
- Capacidad multilingue limitada estrictamente al par en-ar.

## Casos de uso

- Traduccion en el navegador sin backend: el modelo se ejecuta con transformers.js y `dtype: "q8"`, de modo que la traduccion ocurre en el cliente y no se envian textos a un servidor; adecuado para aplicaciones de privacidad estricta con presupuesto de memoria de unos 280 MiB.
- Traduccion de contenido editorial y documentacion tecnica de ingles a arabe en pipelines por lotes, aprovechando el bajo consumo de memoria para ejecutar varias instancias en paralelo en una sola maquina.
- Localizacion de interfaces y cadenas de aplicacion: al ser un modelo de traduccion dedicado y determinista, encaja en flujos de CI/CD que traducen ficheros de recursos antes de cada release.
- Traduccion de atencion al cliente en tiempo real: el modelo puede procesar mensajes cortos de usuarios angloparlantes hacia arabe con latencia baja en CPU, integrandose en un servicio de chat.
- Preprocesado o postprocesado en pipelines de NLP mas amplios: por ejemplo, traducir consultas al arabe antes de pasarlas a un recuperador o a un modelo de analisis de sentimiento entrenado en arabe.
- Extensiones de navegador y aplicaciones de escritorio Electron que necesitan traduccion offline sin dependencias de red ni GPU.
- Prototipado rapido de sistemas de traduccion en entornos con recursos limitados (Raspberry Pi, contenedores pequenos) gracias a la reduccion de memoria del decoder fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta mediciones de memoria tras la carga con ONNX Runtime 1.31.1 en CPU y 4 hilos:

| Configuracion | Linux (MiB) | Windows (MiB) | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 527 → 282 (-46 %) | 504 → 256 (-49 %) | si |
| Valores por defecto de ONNX Runtime | 282 → 220 (-22 %) | 198 → 166 (-16 %) | si |

No se proporcionan datos de BLEU, METEOR ni comparaciones de calidad con otros sistemas de traduccion.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU y no requiere GPU.
- Memoria RAM estimada: aproximadamente 282 MiB tras la carga en Linux con `disable_quant_qdq = 1`, y 220 MiB con los valores por defecto de ONNX Runtime; en Windows, 256 MiB y 166 MiB respectivamente.
- GPU recomendadas: no disponibles ni necesarias; el autor solo reporta mediciones en CPU.
- Cabe en cualquier equipo consumer, incluidos navegadores de escritorio y dispositivos de bajos recursos; el repo completo ocupa 0,1 GB.
- Opciones de despliegue: transformers.js 3.x (navegador y Node.js), onnxruntime en Python mediante el script `translate.py`, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada; las mediciones reportadas son exclusivamente de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-ar | no disponible | no disponible | en → ar | ONNX q8 | CC BY 4.0 | Decoder fusionado, menor memoria |
| Xenova/opus-mt-en-ar | no disponible | no disponible | en → ar | ONNX | CC BY 4.0 | Modelo base del que deriva; mismo resultado |
| Helsinki-NLP/opus-mt-en-ar | no disponible | no disponible | en → ar | PyTorch/safetensors | CC BY 4.0 | Modelo original OPUS-MT de la Universidad de Helsinki |
| Otros pares OptimaMT (`OptimaMT/<src>-<tgt>`) | no disponible | no disponible | 49 pares | ONNX q8 | CC BY 4.0 | Misma metodologia para otros idiomas |

No se dispone de datos de rendimiento (BLEU u otras metricas) para establecer comparaciones cuantitativas de calidad entre estas alternativas.

## Limitaciones y advertencias

- Modelo especializado en un unico par de idiomas (ingles a arabe); no traduce en sentido inverso ni a otros idiomas.
- Requiere prefijar cada entrada con `>>ara<<`; omitirlo puede degradar la salida.
- Se recomienda transformers.js 3.x: la version 4.3.2 divide este token, incluso con la exportacion original.
- No se han publicado metricas de calidad de traduccion (BLEU, COMET, etc.) en la informacion disponible; la afirmacion de tokens identicos al modelo base es una verificacion del autor, no una evaluacion de calidad.
- Riesgo de alucinacion y de traducciones literales en textos muy especializados, dominios tecnicos o lenguaje coloquial; conviene validacion humana en produccion.
- Sesgos potenciales heredados del corpus OPUS-MT, no documentados en la model card.
- Licencia CC BY 4.0: permite uso comercial con atribucion; es necesario citar a OPUS-MT (Universidad de Helsinki) y a Xenova por la exportacion ONNX.
- La fecha de creacion indicada (2026-11-09) y el contador de descargas (0) sugieren un modelo muy reciente y sin validacion independiente por parte de la comunidad.
- Solo se reconstruye el decoder cuantizado; el resto de archivos dependen del repositorio original de Xenova en la revision `034a684356c1`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-ar
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-ar
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-ar
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
