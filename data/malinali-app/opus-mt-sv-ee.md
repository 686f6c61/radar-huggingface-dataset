# malinali-app/opus-mt-sv-ee

## Resumen

opus-mt-sv-ee es un modelo de traduccion automatica neuronal del par sueco (sv) → ewe (ee), publicado por el desarrollador malinali-app como empaquetado listo para inferencia en dispositivo. No se trata de un modelo entrenado desde cero, sino de un reempaquetado de los pesos de Helsinki-NLP/opus-mt-sv-ee, un modelo de la familia OPUS-MT desarrollada por el grupo Language Technology de la Universidad de Helsinki. El autor anade tokenizers rapidos en formato JSON (conversion de SentencePiece a formato Hugging Face) y pesos en safetensors para su uso con el runtime Candle a traves del modulo `marian_flutter`.

Tecnicamente es un transformer encoder-decoder con arquitectura Marian, de aproximadamente 75,3 millones de parametros (6 capas de encoder y 6 de decoder en la configuracion tipica de esta familia, si bien la configuracion exacta no se detalla en la informacion disponible). El modelo resuelve la traduccion bidireccional sencilla de una unica direccion sv → ee y esta pensado para su despliegue offline en aplicaciones moviles o de escritorio mediante la app Malinali.

Su relevancia actual es limitada pero especifica: cubre un par de idiomas de bajos recursos (sueco hacia ewe) que rara vez se incluye en modelos multilingues masivos, y lo hace con un peso muy reducido (repo de 0,3 GB) apto para ejecucion local sin GPU dedicada. El interes principal esta en el empaquetado on-device y en la integracion con Candle, mas que en un avance arquitectonico propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian / MarianMTModel) |
| Parametros totales | 75.277.598 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantizar) |
| Idiomas soportados | sv (sueco), ee (ewe) |
| Licencia | no disponible en el repo (el autor indica seguir la licencia del modelo base, tipicamente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es Marian, la implementacion de traduccion automatica neuronal de codigo abierto desarrollada por el equipo de Helsinki-NLP y usada en toda la familia OPUS-MT. Se trata de un transformer estandar con encoder y decoder, orientado exclusivamente a text2text-generation en una direccion de traduccion concreta (sv → ee). El modelo original Helsinki-NLP/opus-mt-sv-ee fue entrenado por Helsinki-NLP sobre corpus paralelos del proyecto OPUS; el desarrollador malinali-app no ha entrenado los pesos, solo los ha reempaquetado.

Los detalles concretos de entrenamiento del modelo base (numero de tokens, composicion exacta del dataset, si hubo fine-tuning con RLHF o DPO) no se especifican en la informacion disponible. La innovacion tecnica de este repositorio no reside en el entrenamiento, sino en la conversion del tokenizador SentencePiece original a tokenizers rapidos de Hugging Face (`tokenizer-enc.json` y `tokenizer-dec.json`) y en la publicacion de los pesos en safetensors para permitir inferencia eficiente con Candle mediante `marian_flutter`.

## Capacidades

- Traduccion de texto de sueco a ewe (direccion unica sv → ee).
- Generacion text2text mediante pipeline `translation` de transformers.
- Inferencia on-device a traves del runtime Candle (modulo `marian_flutter`), pensada para entornos sin conexion.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Soporte de tokenizacion rapida tanto para el idioma origen como para el destino.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Traduccion offline en aplicaciones moviles: Malinali puede empaquetar los pesos (0,3 GB) y ejecutar la traduccion sv → ee en el propio dispositivo sin enviar texto a un servidor, util en contextos con conectividad limitada.
- Traduccion en el navegador o en escritorio mediante Candle: al no requerir GPU y pesar menos de 100 millones de parametros, puede integrarse en herramientas de traduccion locales.
- Procesamiento por lotes de documentos en sueco que deban publicarse en ewe: el pipeline `translation` de transformers permite alimentar textos linea a linea o por bloques.
- Preprocesado para pipelines de NLP en ewe: traducir corpus suecos a ewe para tareas posteriores de analisis o indexacion en un idioma de bajos recursos.
- Subtitulado o transcripcion asistida: traduccion de subtitulos en sueco a ewe como paso previo a su publicacion.
- Prototipado e investigacion en traduccion de bajos recursos: sirve como linea base ligera para comparar con modelos multilingues mayores en el par sueco-ewe.
- Integracion en aplicaciones de mensajeria o foros que necesiten traduccion automatica local para hablantes de ewe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 75,3 millones de parametros, los pesos en FP32 ocupan aproximadamente 300 MB; en FP16 alrededor de 150 MB.
- GPU recomendadas: cualquier GPU con 1-2 GB de VRAM es suficiente; tambien puede ejecutarse en CPU. GPU de gama alta como A100 o H100 no aportan ventaja practica para este tamano.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas con memoria compartida.
- Opciones de despliegue: transformers (pipeline `translation`), Candle mediante `marian_flutter`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos en GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| malinali-app/opus-mt-sv-ee | 75,3 M | no disponible | sv, ee | no disponible (base CC-BY 4.0 tipicamente) | safetensors |
| Helsinki-NLP/opus-mt-sv-fi | ~77 M (familia OPUS-MT) | no disponible | sv, fi | CC-BY 4.0 (tipicamente) | safetensors / pytorch |
| Helsinki-NLP/opus-mt-sv-et | ~77 M (familia OPUS-MT) | no disponible | sv, et | CC-BY 4.0 (tipicamente) | safetensors / pytorch |
| facebook/nllb-200-distilled-600M | ~600 M | 512 tokens | multilingue (200 idiomas) | CC-BY-NC 4.0 | safetensors |

Los modelos de la propia familia OPUS-MT comparten arquitectura y orden de magnitud de parametros, por lo que son los comparables mas directos. Alternativas multilingues como NLLB-200 cubren mas idiomas pero con un coste de parametros y requisitos de hardware notablemente mayores.

## Limitaciones y advertencias

- El modelo solo traduce en la direccion sv → ee; no soporta la direccion inversa (ee → sv) segun la informacion disponible.
- Al ser un reempaquetado, cualquier sesgo, error o limitacion del modelo base Helsinki-NLP/opus-mt-sv-ee se hereda sin cambios.
- El par sueco-ewe es de bajos recursos, por lo que la calidad de traduccion puede ser inferior a la de pares con mas corpus paralelos; no hay benchmarks publicados que la cuantifiquen.
- Riesgo de alucinacion y de traducciones incorrectas en frases largas, ambiguas o con terminologia especializada.
- La licencia no figura explicitamente en el repo; el autor remite a la del modelo base (tipicamente CC-BY 4.0). Debe verificarse antes de cualquier uso comercial.
- La longitud de contexto no se documenta, lo que dificulta planificar el troceado de textos largos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- No se distribuyen pesos cuantizados ni formatos GGUF/ONNX, lo que limita las opciones de despliegue fuera de transformers y Candle.
- El codigo de idioma "ee" corresponde en ISO 639-1 al ewe; conviene confirmar que es el idioma efectivamente entrenado y no una confusion con el estonio (cuyo codigo es "et").

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-sv-ee
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-ee
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
