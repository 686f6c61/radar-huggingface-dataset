# moonbox-dev/Fun-CosyVoice3-0.5B-2512-ONNX

## Resumen

Fun-CosyVoice3-0.5B-2512-ONNX es una compilación en formato ONNX del modelo de síntesis de voz CosyVoice 3 (0.5B) desarrollado originalmente por FunAudioLLM (Alibaba). Esta versión, publicada por moonbox-dev, convierte los grafos de PyTorch a ONNX Runtime para permitir inferencia en dispositivo (CPU, CUDA, DirectML) sin necesidad de PyTorch, orientada a despliegues ligeros y portables. El modelo resuelve el problema de la síntesis de voz multilingüe con clonación de voz zero-shot, manteniendo una calidad cercana al modelo original según las métricas reportadas por el autor.

La arquitectura subyacente de CosyVoice 3 combina un modelo de lenguaje autorregresivo (0.5B parámetros) con un tokenizador de voz, un estimador de flujo y un vocoder HiFi-GAN (hift). El paquete ONNX descompone el pipeline en grafos separados (text_embed, speech_tokenizer, flow_estimator, hift, etc.) que se orquestan mediante un script `pipeline.py`. El repositorio ocupa 4.1 GB e incluye pesos en fp16 e int8, con un benchmark propio sobre un conjunto de evaluación de clonación de voz en inglés y chino.

Es relevante ahora porque permite ejecutar un TTS de calidad investigadora en hardware modesto sin dependencias de PyTorch, facilitando integraciones en aplicaciones de escritorio, edge computing y pipelines de ONNX Runtime GenAI. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque esta compilación concreta no publica métricas exhaustivas ni detalles de entrenamiento propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS: LLM autorregresivo (0.5B) + tokenizador de voz + estimador de flujo + vocoder HiFi-GAN (hift), exportado a grafos ONNX |
| Parametros totales | 0.5B (modelo base CosyVoice 3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 e int8 (carpetas separadas) |
| Idiomas soportados | ingles y chino (segun benchmark del autor); lista completa no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (.onnx, .onnx.data, .npz, .npy, tokenizer.json) |

## Arquitectura y entrenamiento

El modelo base CosyVoice 3 es un sistema de síntesis de voz que combina un modelo de lenguaje autorregresivo de 0.5B parámetros con un tokenizador de voz (speech_tokenizer_v3), un estimador de flujo (flow_estimator) para generar mel-espectrogramas y un vocoder HiFi-GAN (hift) para la síntesis de波形 final. Esta compilación ONNX descompone el pipeline en grafos independientes: `text_embed`, `speech_embed`, `lm_head`, `flow_encoder`, `flow_estimator`, `hift`, `campplus` (embedding de hablante), `f0_predictor` y `decoder`. El script `pipeline.py` gestiona las características, el prompt y el bucle de muestreo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO en esta compilación. El modelo base CosyVoice 3 está documentado en los papers arXiv:2505.17589, arXiv:2412.10117 y arXiv:2407.05407, que probablemente contienen los detalles de entrenamiento, pero esta model card no los reproduce. La innovación técnica destacable es la exportación a ONNX Runtime con soporte para CPU, CUDA y DirectML, permitiendo inferencia sin PyTorch y con un factor de tiempo real (RTF) de 0.53 en CUDA según el benchmark del autor.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés y chino con calidad cercana al modelo original.
- Clonación de voz zero-shot: el modelo puede imitar la voz de un hablante a partir de un prompt de audio corto (LibriSpeech para inglés, AISHELL-1 para chino en el benchmark).
- Soporte multilingüe limitado a los idiomas del modelo base (inglés y chino confirmados; otros no disponibles).
- Ejecución en dispositivo mediante ONNX Runtime (CPU, CUDA, DirectML), sin dependencia de PyTorch.
- Dos precisiones disponibles (fp16 e int8) para balancear calidad y rendimiento.
- Pipeline modular: grafos separados para tokenización, embedding, flujo y vocoder, lo que permite sustituir o inspeccionar componentes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión/audio más allá del TTS.

## Casos de uso

- **Clonación de voz para audiolibros y narración personalizada**: el modelo permite generar narraciones con la voz del usuario a partir de un prompt de audio, usando el grafo `campplus` para el embedding de hablante y el pipeline completo para la síntesis. Adecuado por su calidad de similitud (0.971 en inglés, 0.959 en chino según benchmark).
- **Asistentes de voz en aplicaciones de escritorio**: al ejecutarse con ONNX Runtime en CPU o DirectML, puede integrarse en apps Windows sin GPU dedicada, generando respuestas habladas en tiempo casi real (RTF 0.53 en CUDA).
- **Sistemas de atención al cliente con voz sintética**: permite generar respuestas de voz en inglés y chino con un tono consistente, usando el vocoder `hift` para audio de 24 kHz (mel80_24k).
- **Generación de doblaje y localización de contenido**: el soporte de inglés y chino y la clonación zero-shot permiten adaptar voces existentes a nuevos idiomas manteniendo la identidad del hablante.
- **Prototipado rápido de TTS en edge devices**: la versión int8 reduce el tamaño y permite desplegar en dispositivos con recursos limitados, usando ONNX Runtime GenAI para orquestar el pipeline.
- **Investigación en síntesis de voz**: la modularidad de los grafos ONNX facilita experimentar con componentes individuales (por ejemplo, sustituir el vocoder o el estimador de flujo) sin reentrenar todo el modelo.
- **Integración en pipelines de CI/CD para generación de audio**: el script `pipeline.py` y los grafos ONNX permiten automatizar la generación de muestras de audio en pruebas de regresión o demos.

## Benchmarks y rendimiento

El autor publica un benchmark sobre su propio conjunto de evaluación (clonación de voz de frases en inglés y chino desde prompts de LibriSpeech y AISHELL-1), comparando la versión ONNX fp16 con el modelo original PyTorch en fp32:

| Metrica | ONNX fp16 (ingles / chino) | Original PyTorch fp32 (ingles / chino) |
|---|---|---|
| WER | 0.0 % / 0.0 % | 0.0 % / 0.3 % |
| CER | 0.0 % / 0.0 % | 0.0 % / 0.3 % |
| Similitud de hablante | 0.971 / 0.959 | 0.973 / 0.964 |
| DNSMOS | 3.24 / 2.80 | 3.22 / 2.84 |
| RTF (CUDA) | 0.53 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo TTS y no de un LLM de propósito general.

## Requisitos de hardware

- **VRAM estimada**: el repositorio completo ocupa 4.1 GB; en fp16 los grafos principales suman aproximadamente 2.7 GB (flow_estimator 663.8 MB, speech_tokenizer 969.5 MB, hift 329.4 MB, decoder 720 MB, text_embed 272.3 MB). En int8 el tamaño se reduce aproximadamente a la mitad.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM para fp16 (por ejemplo, RTX 3050, RTX 4060); para int8, GPUs con 2-3 GB. En CUDA se reporta RTF 0.53, lo que indica inferencia más rápida que tiempo real.
- **Consumer GPU**: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090; también puede ejecutarse en CPU (rendimiento no documentado) y en DirectML para Windows.
- **Opciones de despliegue**: ONNX Runtime (CPU, CUDA, DirectML), ONNX Runtime GenAI, uso directo del script `pipeline.py` incluido.
- **Latencia y throughput**: RTF 0.53 en CUDA (reportado por el autor); no se documentan latencias en CPU ni throughput en otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Fun-CosyVoice3-0.5B-2512-ONNX (este) | 0.5B | no disponible | ingles, chino | apache-2.0 | ONNX | Compilación ONNX para inferencia en dispositivo |
| FunAudioLLM/Fun-CosyVoice3-0.5B-2512 (base) | 0.5B | no disponible | ingles, chino | apache-2.0 | PyTorch (safetensors) | Modelo original, requiere PyTorch |
| CosyVoice 2 (versión anterior) | no disponible | no disponible | multilingüe | apache-2.0 | PyTorch | Predecesor, menor calidad según papers |
| Otros TTS open source (p. ej. XTTS-v2) | no disponible | no disponible | multilingüe | no disponible | PyTorch | No comparable directamente por falta de datos en la información |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- **Idiomas limitados**: solo se confirman inglés y chino en el benchmark; no se documenta soporte para otros idiomas, lo que limita su uso en aplicaciones multilingües amplias.
- **Riesgo de alucinación en TTS**: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas, especialmente en textos fuera de dominio.
- **Sesgos**: no se documentan sesgos específicos, pero al entrenarse con LibriSpeech y AISHELL-1, puede reflejar sesgos de esos corpus (hablantes, acentos, géneros).
- **Licencia Apache 2.0**: permite uso comercial, pero se recomienda revisar los términos del modelo base y de los datasets de entrenamiento (LibriSpeech tiene licencia CC BY 4.0; AISHELL-1 tiene licencia Apache 2.0).
- **Dependencia de ONNX Runtime**: el pipeline requiere ONNX Runtime y el script `pipeline.py`; no es un modelo plug-and-play con transformers.
- **Calidad en int8**: no se publican métricas para la versión int8, por lo que la degradación de calidad respecto a fp16 es desconocida.
- **Repositorio con 0 descargas y 0 likes**: indica que es una compilación reciente y poco validada por la comunidad; usar con cautela en producción.
- **Fecha de creación futura (2026-11-18)**: posible error en los metadatos de Hugging Face; conviene verificar la integridad de los archivos.

## Enlaces

- [Hugging Face: moonbox-dev/Fun-CosyVoice3-0.5B-2512-ONNX](https://huggingface.co/moonbox-dev/Fun-CosyVoice3-0.5B-2512-ONNX)
- [Modelo base: FunAudioLLM/Fun-CosyVoice3-0.5B-2512](https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512)
- [Paper arXiv:2505.17589](https://arxiv.org/abs/2505.17589)
- [Paper arXiv:2412.10117](https://arxiv.org/abs/2412.10117)
- [Paper arXiv:2407.05407](https://arxiv.org/abs/2407.05407)
- [ONNX Runtime](https://onnxruntime.ai/)
- [ONNX Runtime GenAI](https://github.com/microsoft/onnxruntime-genai)
