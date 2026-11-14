# OptimaMT/en-pt

## Resumen

OptimaMT/en-pt es un modelo de traducción automática inglés-portugués publicado por OptimaMT como parte de una colección de 51 pares de idiomas. Se trata de una copia directa del export ONNX de Xenova/opus-mt-en-ROMANCE (revisión `9d2ba69ac80c`), a su vez derivado del modelo OPUS-MT de la Universidad de Helsinki, con una única modificación: el decoder fusionado (`decoder_model_merged_quantized.onnx`) se ha reconstruido para aprovechar el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`), lo que reduce el uso de memoria entre un 22 % y un 47 % según la configuración y acelera la inferencia entre 2,3 y 2,5 veces.

El modelo mantiene exactamente los mismos pesos y produce los mismos tokens que el original, por lo que es un reemplazo directo ("drop-in") pensado para entornos de inferencia en CPU y en el navegador mediante transformers.js. Su relevancia radica en la eficiencia: permite desplegar traducción de calidad en dispositivos con recursos limitados sin sacrificar fidelidad respecto al modelo base.

Arquitectura Marian (transformer encoder-decoder) con 65.001 tokens de vocabulario, licencia CC BY 4.0 y un tamaño de repositorio de 0,1 GB. Está integrado en producción en la aplicación de escritorio OpenCircle desde la versión 0.1.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en transformers.js); decoder fusionado con `disable_quant_qdq = 1` |
| Idiomas soportados | inglés (en) y portugués (pt, variante `>>pt_br<<`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de archivos idénticos al original) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, la arquitectura empleada por la familia OPUS-MT de Helsinki-NLP. El export original de Xenova separa el decoder en dos ramas (con y sin caché); OptimaMT ha movido la proyección de salida del decoder fuera de ambas ramas, un cambio exclusivamente de grafo que permite a ONNX Runtime aplicar su modo rápido de cuantización (`disable_quant_qdq = 1`) sin alterar los pesos ni los tokens generados.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO, ya que la model card solo documenta el proceso de exportación y optimización del grafo. La innovación técnica destacable es la reducción de memoria (542 → 289 MiB con `disable_quant_qdq = 1`; 291 → 225 MiB con los valores por defecto de ONNX Runtime) manteniendo salidas idénticas al modelo original.

## Capacidades

- Traducción automática de inglés a portugués (con soporte de la variante brasileña mediante el token `>>pt_br<<` al inicio de la entrada).
- Generación de texto seq2seq (pipeline `text2text-generation`).
- Inferencia en navegador y Node.js mediante transformers.js 3.x.
- Inferencia en CPU con ONNX Runtime (Python: onnxruntime, sentencepiece, numpy).
- Salidas deterministas respecto al modelo base (mismos tokens, BLEU 41,73 y chrF 66,59 en FLORES-200 devtest con decodificación greedy).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción de documentación técnica: el modelo traduce textos de inglés a portugués con calidad equivalente al OPUS-MT original, adecuado para localizar READMEs y guías de producto.
- Traductor de pantalla en escritorio: integrado en OpenCircle para Windows y Linux, traduce texto capturado de la pantalla en tiempo real; su bajo consumo de memoria (289 MiB) lo hace viable en equipos modestos.
- Traducción en el navegador sin servidor: mediante transformers.js, permite traducir contenido en el cliente sin enviar datos a un backend, útil por privacidad.
- Localización de interfaces de usuario: traducción de cadenas cortas y mensajes de UI con latencia baja en CPU.
- Procesamiento por lotes de corpus: traducción de grandes volúmenes de texto en pipelines offline con ONNX Runtime, donde el ahorro de memoria permite más instancias concurrentes.
- Preprocesamiento multilingüe en pipelines de NLP: conversión de contenido en inglés a portugués antes de tareas posteriores (análisis, indexación, búsqueda).
- Aplicaciones de accesibilidad: subtitulado o lectura asistida con traducción en tiempo real en dispositivos sin GPU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 41,73 |
| FLORES-200 devtest (1.012 frases), chrF | 66,59 |
| Memoria tras carga, `disable_quant_qdq = 1` (Linux) | 542 → 289 MiB (-47 %) |
| Memoria tras carga, valores por defecto ONNX Runtime | 291 → 225 MiB (-22 %) |
| Aceleración del modo rápido | 2,3–2,5× |
| Identidad de tokens respecto al original | sí |

Mediciones realizadas con ONNX Runtime 1.31.1, CPU, 4 hilos, solo en Linux (no medidas aún en Windows).

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para inferencia en CPU. Memoria RAM tras carga: aproximadamente 289 MiB con `disable_quant_qdq = 1` y 225 MiB con los valores por defecto de ONNX Runtime.
- GPU: no requiere GPU; no se han publicado requisitos ni recomendaciones de GPU (A100, H100, RTX 4090, etc.).
- Cabe en cualquier equipo de consumo: el tamaño del repositorio es de 0,1 GB y el consumo de memoria es inferior a 300 MiB.
- Opciones de despliegue: transformers.js 3.x (navegador y Node.js), ONNX Runtime en Python (script `translate.py`), y cualquier runtime compatible con ONNX.
- Latencia y throughput: se documenta una aceleración de 2,3–2,5× respecto al export original con el modo rápido; no se publican valores absolutos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-pt | no disponible | no disponible | en → pt | CC BY 4.0 | ONNX | Decoder fusionado optimizado; BLEU 41,73 en FLORES-200 |
| Xenova/opus-mt-en-ROMANCE | no disponible | no disponible | en → lenguas romances | CC BY 4.0 | ONNX | Modelo base del que deriva; mayor consumo de memoria |
| Helsinki-NLP/opus-mt-en-ROMANCE | no disponible | no disponible | en → lenguas romances | CC BY 4.0 | safetensors/PyTorch | Pesos originales de la Universidad de Helsinki |

## Limitaciones y advertencias

- Solo traduce de inglés a portugués; no cubre otras direcciones ni pares de idiomas.
- Requiere anteponer el token de variante (`>>pt_br<<`) al inicio de cada entrada; su omisión puede degradar la salida.
- Es necesario usar transformers.js 3.x: la versión 4.3.2 divide este token, incluso con el export original.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos neuronales de traducción, especialmente en textos muy técnicos, dominios especializados o frases ambiguas.
- No se han publicado análisis de sesgos; al derivar de OPUS-MT, puede heredar sesgos presentes en los corpus de entrenamiento originales.
- Licencia CC BY 4.0: permite uso comercial con atribución a los autores originales (Universidad de Helsinki) y al export (Xenova) y a la modificación (OptimaMT).
- Las mediciones de rendimiento solo se han realizado en Linux; el comportamiento en Windows no está verificado.
- No dispone de soporte para tool calling, agentes, visión ni razonamiento multi-paso.
- Longitud de contexto no documentada; textos muy largos deben fragmentarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-pt
- Colección OptimaMT (51 pares): https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Aplicación OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-en-ROMANCE
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-ROMANCE
