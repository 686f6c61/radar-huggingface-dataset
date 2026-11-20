# moonbox-dev/s2-pro-ONNX

## Resumen

Fish Audio S2 Pro ONNX es una conversión a formato ONNX del modelo de síntesis de voz Fish Audio S2 Pro, publicada por el usuario moonbox-dev. El modelo original, desarrollado por Fish Audio, es un sistema de text-to-speech con clonación de voz y soporte multilingüe. Esta versión ONNX está pensada para inferencia en dispositivo mediante ONNX Runtime, con soporte para CPU, CUDA y DirectML, lo que facilita su despliegue en entornos sin PyTorch.

La relevancia de esta ficha radica en que el modelo original se distribuye bajo una licencia de investigación no comercial, y esta conversión mantiene esa restricción. El repositorio ocupa 17,4 GB e incluye dos precisiones (fp16 e int8) con grafos separados para codificador, decodificador, embeddings, cabecera y códec de audio, además de un script `pipeline.py` que orquesta el proceso completo.

La información disponible sobre arquitectura interna, número de parámetros y datos de entrenamiento es limitada: la model card se centra en los artefactos ONNX y en los resultados de evaluación de la conversión, no en los detalles del modelo base. Esta ficha refleja únicamente lo que consta en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de TTS con códec de audio; estructura interna no detallada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | multilingüe (inglés y chino evaluados en el benchmark; lista completa no disponible) |
| Licencia | fish-audio-research-license (uso no comercial) |
| Formato de pesos | ONNX (grafos `.onnx` y `.onnx.data`), tokenizer.json, pipeline.py |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Fish Audio S2 Pro en la documentación proporcionada. La model card de esta conversión describe únicamente la descomposición en grafos ONNX: `codec_enc.onnx` (codificador de audio), `codec_dec.onnx` (decodificador de audio), `decoder.onnx` con su fichero de datos asociado, `embed.onnx`, `fast.onnx` y `head.onnx`. El script `pipeline.py` gestiona la extracción de características, la construcción del prompt y el bucle de muestreo. No se detallan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable de esta publicación es la propia conversión a ONNX con dos precisiones y la validación contra el modelo original en PyTorch (bf16). Según la model card, la versión fp16 reproduce fielmente los resultados del original (WER 0,0 % y CER 0,0 % en inglés y chino, similitud de hablante 0,961/0,946 frente a 0,958/0,945 del original, y DNSMOS 3,27/2,83 frente a 3,28/2,62), mientras que la versión int8 introduce una degradación mínima (CER 0,3 % en chino, similitud 0,958/0,941, DNSMOS 3,26/2,68). El RTF medido es de 1,90 en CUDA para fp16 y 1,63 para int8.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto.
- Clonación de voz: el benchmark evalúa la similitud de hablante respecto a un prompt de audio, con valores de 0,961/0,946 en fp16.
- Soporte multilingüe: se evalúan inglés y chino; la lista completa de idiomas no está disponible.
- Ejecución en dispositivo mediante ONNX Runtime con backend CPU, CUDA y DirectML.
- Dos precisiones disponibles (fp16 e int8) para ajustar el equilibrio entre calidad y requisitos de cómputo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del prompt de voz para clonación.

## Casos de uso

- Clonación de voz para doblaje y localización: el modelo permite generar audio en la voz de un hablante de referencia a partir de un prompt, con similitud de hablante superior a 0,94 según el benchmark, lo que lo hace adecuado para prototipos de doblaje en inglés y chino.
- Síntesis de voz en aplicaciones de escritorio: la disponibilidad de grafos ONNX con backend DirectML permite integrar TTS en aplicaciones Windows sin depender de PyTorch ni de CUDA.
- Generación de audiolibros y contenido narrado: el modelo produce voz clonada de forma consistente, con WER de 0,0 % en la evaluación, lo que reduce la necesidad de revisión manual de la transcripción.
- Asistentes de voz para investigación: al ejecutarse con ONNX Runtime en CPU, puede desplegarse en entornos de laboratorio sin GPU dedicada, facilitando experimentos de interacción voz-texto.
- Evaluación comparativa de precisiones: las dos variantes (fp16 e int8) permiten medir el impacto de la cuantización en calidad (CER, similitud, DNSMOS) y velocidad (RTF) dentro de un mismo pipeline.
- Prototipado de interfaces de voz en dispositivos edge: el tamaño reducido de algunos grafos (por ejemplo, `head.onnx` de 21 MB o `codec_dec.onnx` int8 de 188 MB) permite distribuir componentes por separado según los requisitos de memoria.
- Investigación en clonación de voz multilingüe: el modelo sirve como base para estudiar transferencia de hablante entre inglés y chino, con métricas de referencia publicadas.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre el conjunto de TTS de Moonbox (clonación de voz de frases en inglés y chino a partir de prompts de LibriSpeech y AISHELL-1), comparando cada precisión con el modelo original en PyTorch (bf16):

| Metrica | fp16 | int8 | Original (bf16) |
|---|---|---|---|
| WER inglés | 0,0 % | 0,0 % | 0,0 % |
| CER chino | 0,0 % | 0,3 % | 0,0 % |
| Similitud de hablante (inglés / chino) | 0,961 / 0,946 | 0,958 / 0,941 | 0,958 / 0,945 |
| DNSMOS (inglés / chino) | 3,27 / 2,83 | 3,26 / 2,68 | 3,28 / 2,62 |
| RTF (CUDA) | 1,90 | 1,63 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El grafo de mayor tamaño es `decoder.onnx.data`, con 7,28 GB en fp16 y 3,87 GB en int8; el resto de grafos suma aproximadamente 2,9 GB en fp16 y 2,4 GB en int8, por lo que la huella total en memoria ronda los 10 GB (fp16) y 6,3 GB (int8) si se cargan todos los componentes.
- GPU recomendadas: no se especifican modelos concretos. El benchmark emplea CUDA; para fp16 se necesita una GPU con al menos ~10 GB de VRAM disponible, lo que incluye RTX 3080/3090, RTX 4070 Ti o superiores, A100 y H100. La variante int8 (~6,3 GB) podría caber en GPUs consumer de 8 GB.
- Ejecución en CPU: soportada mediante ONNX Runtime; el rendimiento dependerá del hardware y no se publican cifras de latencia en CPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) y onnxruntime-genai, según las etiquetas del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el RTF medido es 1,90 en CUDA para fp16 y 1,63 para int8; no se proporcionan cifras de throughput ni latencia absoluta.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base es Fish Audio S2 Pro, y esta publicación es una conversión del mismo; no se detallan alternativas de la misma categoría (TTS con clonación de voz) ni sus especificaciones. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Licencia de investigación no comercial: la licencia fish-audio-research-license restringe el uso comercial; es imprescindible revisar el fichero LICENSE.md antes de cualquier despliegue en producción.
- Idiomas: solo se han evaluado inglés y chino; el rendimiento en otros idiomas no está documentado y podría degradarse.
- Calidad en int8: la cuantización int8 introduce un CER del 0,3 % en chino y reduce la similitud de hablante y el DNSMOS respecto a fp16, por lo que conviene validar la calidad en el caso de uso concreto.
- Riesgo de alucinación y artefactos: no se documentan análisis de sesgos, alucinaciones o artefactos acústicos; al tratarse de un modelo generativo de audio, pueden aparecer pronunciaciones incorrectas o ruidos no evaluados en el benchmark.
- Datos de entrenamiento desconocidos: no se detalla la composición del dataset ni posibles sesgos de hablante, acento o género.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: la conversión es reciente y no cuenta con validación comunitaria.
- Dependencia de ONNX Runtime: el pipeline requiere el script `pipeline.py` y los grafos en la estructura de carpetas publicada; no es un checkpoint estándar de Transformers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/s2-pro-ONNX
- Modelo base: https://huggingface.co/fishaudio/s2-pro
- Referencia arXiv citada en las etiquetas: arxiv:2603.08823 (no se dispone de URL directa en la información proporcionada)
- Licencia: LICENSE.md dentro del repositorio de Hugging Face
