# hungitk46/stt-vi-punct

## Resumen

`hungitk46/stt-vi-punct` es un paquete ONNX derivado de `Horizon-Labs/multilingual-punctuation-truecase-small`, adaptado para restaurar puntuación (`,`, `.`, `?`) y mayúsculas iniciales en texto vietnamita en minúsculas procedente de un reconocedor de voz. No es un modelo nuevo: no se ha reentrenado ni ajustado, sino que se ha recortado el vocabulario, cuantizado a int8 y reempaquetado para la API `OnlinePunctuation` (CNN-BiLSTM) de sherpa-onnx 2.0.1, con el objetivo de ejecutarse íntegramente en local en dispositivos Android.

La relevancia es acotada pero concreta: resuelve el paso de post-procesado en pipelines de ASR en vietnamita que no generan ni signos ni mayúsculas. El bundle ocupa unos 94 MB (cuatro ficheros) y se distribuye con licencia Apache-2.0, lo que permite integrarlo en aplicaciones comerciales. Al estar pensado para sherpa-onnx, requiere un flujo de tokenización propio por parte del llamante, no cubierto por el tokenizador nativo de sherpa.

El modelo base es de tipo token-classification multilingüe, pero esta variante solo conserva el subconjunto vietnamita y ASCII del vocabulario (113.571 de 256.000 piezas). El repo pesa 0,1 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN-BiLSTM (token classification), grafo ONNX para `OnlinePunctuation` de sherpa-onnx |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 198 tokens con solapamiento de 50 |
| Tipos de cuantizacion | int8 dinamica por canal (onnxruntime 1.32.0 `quantize_dynamic`); pesos externos en `.onnx.data` |
| Idiomas soportados | vietnamita (entrada tambien ASCII) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX int8 con pesos externos (`.onnx` + `.onnx.data`), tokenizador binario propio `.tok` y vocabulario `.vocab` |

## Arquitectura y entrenamiento

El modelo es una red CNN-BiLSTM de etiquetado de tokens, no un transformer generativo. El paquete deriva del checkpoint `a527b62e5a3e16de7e316f03234c99422b1c8814` de `Horizon-Labs/multilingual-punctuation-truecase-small` y no incluye reentrenamiento ni fine-tuning. Las modificaciones son de empaquetado y compresión: recorte del vocabulario a piezas vietnamitas en minúscula y ASCII imprimible, cuantización int8 dinámica de todas las MatMul con pesos constantes, externalización de tensores de 64 KiB o más a un fichero `.data` con offsets alineados a 16 KiB, y envoltura del grafo para exponer las entradas `token_ids`, `valid_ids` y `label_lens`.

Las 18 etiquetas conjuntas originales se reducen a la combinación de tres estados de caja (mantener, UPPER, Capitalized) y cuatro de puntuación (ninguna, `,`, `.`, `?`); la marca `-` del modelo original se descarta y `:` se escribe como `,`. Los metadatos del grafo son `COMMA=1 PERIOD=2 QUESTION=3 UPPER=1 CAP=2 MIX_CASE=3`. El tokenizador es BPE estilo Gemma con byte fallback, reimplementado en un fichero binario `HZTK` v1 y en un vocabulario de "palabras falsas" para sherpa (`xq` + id a 6 dígitos). No hay datos públicos sobre el corpus de entrenamiento original ni sobre el uso de RLHF o DPO.

## Capacidades

- Restauración de puntuación básica (`,` `.` `?`) tras palabras en texto vietnamita sin signos.
- Truecasing: aplica mayúscula inicial o mayúsculas completas según la etiqueta predicha.
- Procesamiento por ventanas de hasta 198 tokens con solapamiento de 50 y descarte de las 50 etiquetas previas al final de cada ventana.
- Inferencia totalmente offline en CPU mediante sherpa-onnx, con `num_threads` configurable.
- Tokenización BPE propia con byte fallback y fusión de caracteres desconocidos en `<unk>` (id 3).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un clasificador de tokens.
- Capacidad multilingüe limitada al vietnamita y a caracteres ASCII imprimibles.

## Casos de uso

- Post-procesado de ASR en vietnamita en Android: tras el reconocimiento, se trocea la transcripción en ventanas de 198 tokens y se llama a `OnlinePunctuation` para insertar comas, puntos e interrogaciones antes de mostrar el texto al usuario.
- Subtitulado automático offline: el modelo añade puntuación a transcripciones en bruto para que los subtítulos sean legibles sin conexión.
- Normalización de mayúsculas en nombres propios y siglas: la etiqueta UPPER permite reconstruir acrónimos que el ASR entrega en minúscula.
- Preprocesado para motores de traducción o TTS: un texto puntuado y con mayúsculas mejora la segmentación de frases en etapas posteriores del pipeline.
- Indexación y búsqueda sobre transcripciones: la puntuación restaurada facilita el troceado en frases y la recuperación semántica en un buscador local.
- Aplicaciones de accesibilidad con dictado por voz: el texto dictado se presenta con formato correcto sin enviar datos a la nube, ya que todo el proceso es local.
- Evaluación de calidad de ASR: comparar la salida puntuada con referencias permite medir el impacto del post-procesado en la legibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la tokenización y las etiquetas son idénticas al modelo sin recortar para entradas vietnamitas y ASCII en minúscula, verificado sobre frases de FLEURS, salidas de reconocedor y texto generado, pero no aporta métricas de precisión, F1 ni latencia.

## Requisitos de hardware

- Inferencia en CPU: el bundle int8 se ejecuta con sherpa-onnx sin GPU; el modelo pesa 1,4 MB y los pesos externos 85,9 MB.
- VRAM: no aplica en la configuración documentada; en GPU el consumo sería mínimo, pero no se documenta soporte de proveedor CUDA.
- GPU recomendadas: no disponible; el caso de uso declarado es Android y CPU.
- Cabe en cualquier dispositivo con al menos unos 100 MB libres para los ficheros y memoria para el grafo ONNX.
- Despliegue: sherpa-onnx 2.0.1 (`OnlinePunctuation`), con `provider="cpu"` y `num_threads` ajustable; requiere cargar el modelo por ruta de fichero para que resuelva el `.data` adyacente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hungitk46/stt-vi-punct` | CNN-BiLSTM ONNX int8 | vietnamita | ventanas de 198 tokens | Apache-2.0 | Hugging Face, 0 descargas |
| `Horizon-Labs/multilingual-punctuation-truecase-small` | token classification | multilingüe | no disponible | Apache-2.0 | Hugging Face |
| Alternativas de restauración de puntuación para ASR | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la más informativa: esta variante conserva el comportamiento sobre vietnamita en minúscula pero pierde el resto de idiomas y las mayúsculas en la entrada, a cambio de un tamaño mucho menor y de la compatibilidad con sherpa-onnx.

## Limitaciones y advertencias

- Solo cubre vietnamita y ASCII: cualquier texto con mayúsculas en la entrada o con otros alfabetos no está soportado por el vocabulario recortado.
- El llamante debe implementar la tokenización BPE con `punct-vi.tok`; el tokenizador nativo de sherpa no reproduce el del modelo.
- El modelo debe cargarse por ruta de fichero, no desde memoria ni desde un asset de Android, porque los pesos están externalizados en `.data`.
- El límite de 198 tokens por llamada obliga a gestionar ventanas y solapamientos manualmente; un manejo incorrecto produce etiquetas duplicadas o perdidas.
- La etiqueta de una palabra es la de su último token, lo que puede introducir errores en palabras largas o con byte fallback.
- Riesgo de alucinación de puntuación: al ser un clasificador, puede insertar comas o puntos donde no corresponden, especialmente en texto ruidoso de ASR.
- No se documentan sesgos específicos ni evaluación de robustez fuera del dominio de reconocimiento de voz.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara que no es el modelo original y que los autores originales no responden de estos ficheros; conviene conservar `NOTICE` y `MODIFICATIONS.txt`.
- Repo sin descargas ni validación comunitaria: no hay evidencia externa de calidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hungitk46/stt-vi-punct
- Modelo base: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-small
- Commit del modelo base: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-small/tree/a527b62e5a3e16de7e316f03234c99422b1c8814
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- onnxruntime: https://github.com/microsoft/onnxruntime
