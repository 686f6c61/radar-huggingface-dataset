# Masharyy/En2de-A

## Resumen

En2de-A es un modelo de traducción automática inglés-alemán desarrollado por el usuario Masharyy (repositorio GitHub Meshojs/En2de-A) y construido desde cero en PyTorch. Se trata de un sistema seq2seq clásico basado en LSTM con atención, con 20,4 millones de parámetros, entrenado sobre el corpus Multi30k. El modelo se publica como un ejercicio de implementación didáctica más que como una alternativa a los sistemas de traducción neuronales modernos basados en transformers.

La relevancia del modelo es fundamentalmente pedagógica y experimental: sirve como referencia reproducible de una arquitectura encoder-decoder con atención de Luong, y demuestra empíricamente el impacto de la atención en la calidad de traducción (un incremento de +8,3 BLEU respecto a la variante sin atención). No obstante, su tamaño, su vocabulario de 16k subpalabras y su ventana máxima de 50 tokens lo sitúan muy lejos de los modelos de traducción de producción actuales.

El modelo no emplea arquitectura transformer ni dispone de contexto largo, tool calling, capacidades multimodales ni razonamiento multi-paso. Su ámbito de aplicación es la traducción de frases cortas en el dominio de descripciones de imágenes (Multi30k), con licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Seq2seq LSTM (encoder/decoder de 2 capas) con atención de Luong |
| Parámetros totales | 20,4 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 50 tokens (longitud máxima de secuencia) |
| Tipos de cuantización | no disponible (pesos en PyTorch estándar, `.pt`) |
| Idiomas soportados | inglés (en), alemán (de) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`En2de-A.pt`), cargado mediante `torch.load` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clásica de traducción neuronal secuencia a secuencia: un encoder LSTM de 2 capas con 512 unidades ocultas y embeddings de 256 dimensiones, y un decoder LSTM simétrico con atención estilo Luong. El vocabulario es compartido entre origen y destino, con 16.000 subpalabras, y la longitud máxima de secuencia es de 50 tokens. La variante con atención añade menos de 1 millón de parámetros respecto a la versión sin atención (19,7 M frente a 20,4 M).

El entrenamiento se realizó durante 25 épocas sobre el dataset Multi30k, con optimizador Adam (tasa de aprendizaje 1e-3), un esquema de warmup seguido de decaimiento coseno y label smoothing de 0,1. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación adicionales. La decodificación de referencia es greedy.

## Capacidades

- Traducción de texto inglés a alemán a nivel de frase, orientada al dominio de descripciones de imágenes (Multi30k).
- Manejo de secuencias de hasta 50 tokens, suficiente para frases cortas.
- Vocabulario subpalabra compartido de 16.000 unidades, que permite cierta generalización léxica dentro del dominio.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito.
- Multilingüismo limitado estrictamente al par inglés-alemán.

## Casos de uso

- Traducción de pies de foto y descripciones breves: el modelo está entrenado sobre Multi30k, un corpus de descripciones de imágenes, por lo que es adecuado para traducir frases cortas de este dominio con una calidad razonable (25,14 BLEU en test).
- Docencia y material formativo: sirve como implementación de referencia completa y reproducible de un seq2seq con atención en PyTorch, útil para cursos de procesamiento de lenguaje natural y para comparar el efecto de la atención (+8,3 BLEU).
- Prototipado rápido en CPU: con 20,4 M de parámetros, el modelo se carga con `torch.load(..., map_location="cpu")` y puede ejecutarse en entornos sin GPU, lo que facilita pruebas de concepto y demostraciones.
- Generación de pares de traducción sintéticos para aumentación de datos: puede producir traducciones EN→DE de frases cortas dentro del dominio para ampliar corpus de entrenamiento de modelos mayores, con revisión posterior.
- Evaluación de pipelines de traducción: útil como línea base ligera contra la que medir sistemas transformer en el mismo conjunto de test de Multi30k.
- Experimentación académica sobre atención: permite reproducir y modificar el mecanismo de atención de Luong con un coste computacional mínimo, comparando variantes y midiendo BLEU con sacreBLEU.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`), sobre el split de test de Multi30k con decodificación greedy y métrica sacreBLEU:

| Modelo | Parámetros | BLEU (Multi30k test) |
|---|---|---|
| En2de sin atención | 19,7 M | 16,82 |
| **En2de-A con atención** | 20,4 M | **25,14** |

El autor reporta que la atención añade menos de 1 M de parámetros y aporta +8,3 BLEU. No se han publicado en la información disponible resultados comparativos con otros modelos externos (transformers, modelos comerciales) sobre el mismo conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 20,4 M de parámetros en FP32 los pesos ocupan aproximadamente 80 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con al menos 1 GB de memoria es suficiente (GTX 1050, RTX 3060, etc.). Para entrenamiento, una GPU consumer básica es suficiente.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load` y script de traducción propio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo transformer con pesos en safetensors/GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por frase en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | BLEU (Multi30k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| En2de-A | LSTM seq2seq + atención | 20,4 M | 50 tokens | 25,14 (declarado) | MIT | Hugging Face + GitHub |
| En2de sin atención (mismo autor) | LSTM seq2seq | 19,7 M | 50 tokens | 16,82 (declarado) | MIT | GitHub del autor |
| Modelos transformer de traducción (p. ej. Marian, NLLB) | Transformer | no disponible en esta ficha | no disponible en esta ficha | no disponible | variable | Hugging Face |

No se dispone en la información proporcionada de resultados de benchmarks de modelos transformer comparables sobre Multi30k, por lo que la comparación cuantitativa con alternativas modernas queda como no disponible.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente sobre Multi30k (descripciones de imágenes), por lo que el rendimiento fuera de ese dominio será previsiblemente muy inferior.
- Longitud máxima de 50 tokens: no admite documentos, párrafos largos ni conversaciones multi-turno.
- Vocabulario de 16.000 subpalabras: cobertura léxica limitada, con mayor riesgo de tokens desconocidos o traducciones degradadas en terminología especializada.
- Riesgo de alucinación y de traducciones gramaticalmente plausibles pero semánticamente incorrectas, propio de modelos pequeños entrenados con decodificación greedy.
- Sesgos: no se documenta ningún análisis de sesgos; el corpus Multi30k puede arrastrar sesgos de género y culturales presentes en las descripciones de imágenes.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad del modelo en producción.
- Benchmark no verificado (`verified: false`): el valor de BLEU 25,14 procede de la model card del autor y no ha sido validado de forma independiente.
- Formato de pesos propietario de PyTorch (`.pt`): requiere código propio de inferencia; no es compatible directamente con servidores de inferencia estándar.
- No apto para producción de traducción general: su uso realista es docente, experimental o como línea base.

## Enlaces

- Hugging Face: https://huggingface.co/Masharyy/En2de-A
- Repositorio GitHub: https://github.com/Meshojs/En2de-A
- Dataset Multi30k: https://huggingface.co/datasets/bentrevett/multi30k
