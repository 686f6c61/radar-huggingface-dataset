# OptimaMT/en-fr

## Resumen

OptimaMT/en-fr es una conversión a ONNX optimizada del modelo de traducción automática Xenova/opus-mt-en-fr, que a su vez es una exportación del clásico Helsinki-NLP/opus-mt-en-fr de la Universidad de Helsinki. El modelo traduce texto de inglés a francés y está pensado para ejecutarse en el navegador o en entornos ligeros mediante transformers.js y ONNX Runtime. La modificación introducida por OptimaMT consiste en reconstruir únicamente el decoder fusionado cuantizado (`decoder_model_merged_quantized.onnx`), moviendo la proyección de salida fuera de sus dos ramas, sin alterar los pesos ni el vocabulario.

El interés de esta variante es puramente de eficiencia en memoria: según la model card, tras la carga se reduce el consumo entre un 46 % y un 48 % en Linux y Windows con `disable_quant_qdq = 1`, y entre un 14 % y un 21 % con los valores por defecto de ONNX Runtime, manteniendo tokens de salida idénticos. Es, por tanto, un reemplazo directo (drop-in) para despliegues de traducción inglés-francés de bajo coste donde el espacio en memoria es crítico.

Forma parte del proyecto OptimaMT, que publica 49 pares de idiomas bajo el patrón `OptimaMT/<src>-<tgt>`. La arquitectura subyacente es MarianMT, un transformer encoder-decoder clásico de traducción, con un vocabulario de 59.514 tokens y licencia CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | inglés (en), francés (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repo de 0,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MarianMT de Helsinki-NLP, un transformer encoder-decoder con atención estándar, diseñado específicamente para traducción automática neuronal. No se dispone de información sobre el número exacto de parámetros ni sobre la composición del corpus de entrenamiento original en la documentación proporcionada; el modelo base es OPUS-MT, entrenado por la Universidad de Helsinki sobre datos de OPUS.

La innovación de esta variante no está en el entrenamiento, sino en la exportación: se ha reconstruido el decoder fusionado cuantizado moviendo la proyección de salida fuera de sus dos ramas (cambio únicamente en el grafo). Todos los demás ficheros del repositorio son idénticos byte a byte a los del modelo base Xenova/opus-mt-en-fr en la revisión `28726206f808`. El resultado son los mismos pesos y los mismos tokens de salida con menor huella de memoria.

## Capacidades

- Traducción de texto de inglés a francés.
- Generación de texto seq2seq (pipeline `text2text-generation`).
- Ejecución en navegador y en Node.js mediante transformers.js.
- Inferencia en CPU con ONNX Runtime (probado con ONNX Runtime 1.31.1, 4 hilos).
- Ejecución en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al par inglés-francés.

## Casos de uso

- Traducción en el navegador sin backend: el modelo se carga con transformers.js y procesa texto localmente, lo que permite ofrecer traducción EN-FR en aplicaciones web sin enviar datos a un servidor.
- Extensiones de navegador para traducción de páginas o selecciones: el tamaño reducido del repo (0,1 GB) y la cuantización q8 facilitan su empaquetado en una extensión.
- Preprocesado de datos multilingües en pipelines de NLP: traducción por lotes de corpus ingleses a francés antes de tareas posteriores (análisis, etiquetado, búsqueda).
- Traducción de documentación técnica y READMEs: el modelo está entrenado en el dominio OPUS, adecuado para texto informativo y técnico de uso general.
- Prototipado rápido de funcionalidades de traducción en aplicaciones de escritorio o Electron, usando ONNX Runtime en CPU sin GPU.
- Entornos con restricciones de memoria: gracias a la reducción del 46-48 % con `disable_quant_qdq = 1`, encaja en dispositivos con poca RAM donde el modelo base no cabría.
- Traducción de mensajes en aplicaciones de chat o foros: latencia baja en CPU con 4 hilos, suficiente para frases cortas en tiempo interactivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, etc.) en la información disponible. La model card únicamente reporta métricas de memoria tras la carga:

| Configuración | Linux (MiB) | Windows (MiB) | Tokens idénticos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 504 → 272 (-46 %) | 481 → 251 (-48 %) | sí |
| Valores por defecto de ONNX Runtime | 270 → 212 (-21 %) | 190 → 163 (-14 %) | sí |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en una máquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. Consumo de memoria tras la carga entre 163 y 272 MiB según configuración y plataforma.
- GPU recomendadas: no disponibles; no se documenta soporte GPU.
- Cabe en cualquier GPU consumer y en la mayoría de dispositivos con más de ~300 MiB de RAM libre.
- Opciones de despliegue: transformers.js (navegador/Node.js), ONNX Runtime (Python vía `translate.py`).
- Latencia y throughput: no disponibles de forma numérica; la model card indica resultados interactivos en el Space OptimaMT/results.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-fr | MarianMT (ONNX) | en→fr | no disponible | CC BY 4.0 | ONNX | Decoder fusionado optimizado en memoria |
| Xenova/opus-mt-en-fr | MarianMT (ONNX) | en→fr | no disponible | CC BY 4.0 | ONNX | Modelo base, sin la optimización de memoria |
| Helsinki-NLP/opus-mt-en-fr | MarianMT | en→fr | no disponible | CC BY 4.0 | PyTorch/safetensors | Modelo original de OPUS-MT |

No se dispone de datos de rendimiento comparativo (BLEU/COMET) entre estas variantes en la información proporcionada; la diferencia documentada es exclusivamente de consumo de memoria con salidas idénticas.

## Limitaciones y advertencias

- Solo traduce inglés a francés; no es un modelo multilingüe general.
- No se documentan evaluaciones de sesgo, alucinación o fidelidad de traducción.
- La calidad de traducción hereda las limitaciones del modelo OPUS-MT original, orientado a texto de dominio general; puede degradarse en jerga muy específica, poesía o texto muy coloquial.
- La optimización se ha validado únicamente en CPU con ONNX Runtime 1.31.1 y 4 hilos; el comportamiento en otras configuraciones no está documentado.
- El ejemplo de uso requiere la opción `disable_quant_qdq` para obtener la reducción máxima de memoria; sin ella, la mejora es menor (14-21 %).
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario citar a OPUS-MT (Universidad de Helsinki), la exportación de Xenova y la modificación de OptimaMT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-fr
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-en-fr
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-fr
