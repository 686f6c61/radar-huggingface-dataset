# OptimaMT/es-en

## Resumen

OptimaMT/es-en es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-es-en (revisión `eadfd7c658a9`), que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki. Se trata de un modelo Marian de traducción neuronal español-inglés, empaquetado para su uso con transformers.js y ONNX Runtime. La aportación de OptimaMT no es un reentrenamiento, sino una optimización del grafo del decodificador fusionado: se reconstruye únicamente `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyección de salida fuera de sus dos ramas, mientras que el resto de archivos permanecen idénticos byte a byte al original.

El modelo resuelve la traducción directa de español a inglés en entornos de inferencia ligera, principalmente CPU y navegador, con una reducción de memoria notable respecto al original: según la model card, pasa de 544 a 290 MiB (-47 %) en Linux y de 519 a 263 MiB (-49 %) en Windows con `disable_quant_qdq = 1`, manteniendo tokens de salida idénticos. Con los valores por defecto de ONNX Runtime la reducción es menor (-22 % en Linux, -15 % en Windows).

Es relevante para desarrolladores que necesitan traducción es-en en aplicaciones web o edge sin depender de infraestructura GPU, ya que el repositorio ocupa 0,1 GB y se distribuye bajo licencia CC BY 4.0. Forma parte del proyecto OptimaMT, que cubre 49 pares de idiomas bajo el esquema de nombres `OptimaMT/<src>-<tgt>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traducción), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (archivo `decoder_model_merged_quantized.onnx`); `dtype: "q8"` en el ejemplo de transformers.js |
| Idiomas soportados | es (español), en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal, heredado de OPUS-MT (Universidad de Helsinki). El vocabulario declarado es de 65.001 tokens. No se dispone de información sobre el número de parámetros, la composición del corpus de entrenamiento, el número de tokens vistos ni si hubo etapas de ajuste fino con RLHF o DPO; estos datos corresponden al modelo original OPUS-MT y no se detallan en la información disponible.

La innovación técnica de esta ficha es puramente de despliegue: se reconstruye el decodificador fusionado cuantizado moviendo la proyección de salida fuera de sus dos ramas, lo que es un cambio de grafo sin alteración de pesos. El resultado son tokens de salida idénticos al modelo base con menor consumo de memoria. El resto de archivos del repositorio son copia byte a byte del export de Xenova.

## Capacidades

- Traducción de texto de español a inglés (pipeline `translation`).
- Generación de texto seq2seq mediante Marian (text2text-generation).
- Inferencia en navegador y en CPU mediante transformers.js y ONNX Runtime.
- Ejecución con cuantización q8 y opción de configuración `disable_quant_qdq`.
- Uso desde Python con onnxruntime, sentencepiece y numpy mediante el script `translate.py`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción en aplicaciones web del lado del cliente: el modelo se ejecuta en el navegador con transformers.js, sin enviar el texto del usuario a un servidor, lo que resulta adecuado para privacidad y para reducir latencia de red.
- Traducción en dispositivos edge o de bajos recursos: con 0,1 GB de repositorio y un consumo de memoria en torno a 170-290 MiB tras la carga, encaja en entornos con RAM limitada donde no hay GPU.
- Preprocesado multilingüe de datasets: traducir corpus en español a inglés antes de alimentar pipelines de entrenamiento o evaluación, aprovechando la ejecución en CPU con ONNX Runtime.
- Localización de contenidos y documentación: traducción de textos de producto, ayuda o documentación técnica de español a inglés dentro de un flujo de publicación automatizado.
- Prototipado rápido de funcionalidades de traducción: al ser un drop-in de Xenova/opus-mt-es-en, permite sustituir el modelo sin cambiar el código y con menor huella de memoria.
- Traducción por lotes en servidores sin GPU: ejecución con onnxruntime y sentencepiece en Python para procesar volúmenes moderados de texto en pipelines de CI o tareas programadas.
- Componente de sistemas de traducción más amplios: uso como par es-en dentro de una cadena de traducción multi-idioma del proyecto OptimaMT (49 pares disponibles).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de memoria tras la carga y confirma que los tokens de salida son idénticos al modelo base:

| Metrica | Linux | Windows | Tokens identicos |
|---|---:|---:|---|
| Memoria con `disable_quant_qdq = 1` | 544 → 290 MiB (-47 %) | 519 → 263 MiB (-49 %) | si |
| Memoria con valores por defecto de ONNX Runtime | 290 → 227 MiB (-22 %) | 202 → 170 MiB (-15 %) | si |

Medición realizada con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en una máquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. Consumo de memoria RAM tras la carga de aproximadamente 170-290 MiB según plataforma y configuración.
- GPU recomendadas: no se especifican; no requiere GPU.
- GPU de consumo: no procede; la inferencia objetivo es en CPU y navegador.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`) con `dtype: "q8"`, y ONNX Runtime en Python mediante `translate.py` (onnxruntime, sentencepiece, numpy).
- Latencia y throughput: no disponibles; la model card solo reporta memoria y equivalencia de tokens, no tiempos de inferencia.
- Tamaño del repositorio: 0,1 GB.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Memoria tras carga |
|---|---|---|---|---|---|---|
| OptimaMT/es-en | Marian (ONNX) | es, en | no disponible | CC BY 4.0 | ONNX | 170-290 MiB |
| Xenova/opus-mt-es-en | Marian (ONNX) | es, en | no disponible | CC BY 4.0 | ONNX | 202-544 MiB |
| Helsinki-NLP/opus-mt-es-en | Marian (PyTorch) | es, en | no disponible | CC BY 4.0 | safetensors/PyTorch | no disponible |

La comparación se limita al linaje directo del modelo, ya que no se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada. La diferencia principal frente a Xenova/opus-mt-es-en es el menor consumo de memoria con salida idéntica; frente al original de Helsinki-NLP, el cambio es el formato ONNX orientado a transformers.js.

## Limitaciones y advertencias

- Modelo de traducción especializado: solo cubre el par es→en; no traduce en sentido inverso ni a otros idiomas.
- Sesgos: no se documentan análisis de sesgo; al heredar los pesos de OPUS-MT, puede reproducir sesgos presentes en los corpus de entrenamiento originales, no detallados en la información disponible.
- Riesgo de alucinación: no evaluado en la información proporcionada; en traducción automática puede producir omisiones, adiciones o traducciones erróneas en textos ambiguos o de dominio especializado.
- Longitud de contexto: no disponible; no se especifica el máximo de tokens de entrada.
- Licencia: CC BY 4.0 permite uso comercial con atribución; es necesario citar a OPUS-MT (Universidad de Helsinki) y a Xenova por el export ONNX, además de OptimaMT por la modificación del grafo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria independiente.
- La mejora de memoria depende de la opción `disable_quant_qdq = 1`; con los valores por defecto de ONNX Runtime la reducción es notablemente menor.
- Solo se ha modificado el decodificador fusionado cuantizado; el resto de archivos son copia del export de Xenova, por lo que las limitaciones del modelo base se mantienen íntegras.

## Enlaces

- Hugging Face: https://huggingface.co/OptimaMT/es-en
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-es-en
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-es-en
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
