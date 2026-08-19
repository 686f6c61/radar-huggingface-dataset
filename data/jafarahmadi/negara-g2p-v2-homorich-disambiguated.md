# jafarahmadi/negara-g2p-v2-homorich-disambiguated

## Resumen

El modelo `jafarahmadi/negara-g2p-v2-homorich-disambiguated` es un sistema de conversión de grafema a fonema (G2P) para persa, desarrollado por jafarahmadi como una versión afinada del modelo base `negara-g2p-clean-v2`. Su principal innovación es la desambiguación contextual de homógrafos, un problema crítico en persa donde una misma secuencia de grafemas puede tener múltiples pronunciaciones según el significado (por ejemplo, «کشتی» puede leerse como `keSti` [barco] o `koSti` [lucha]). El modelo resuelve esta ambigüedad analizando el contexto de la oración, lo que lo hace especialmente relevante para sistemas de síntesis de voz (TTS) y reconocimiento automático del habla (ASR) en persa.

Arquitectónicamente se basa en un transformer T5 de tipo secuencia a secuencia, con 8,26 millones de parámetros, lo que lo convierte en un modelo ligero y adecuado para despliegue en entornos con recursos limitados. La model card reporta una mejora absoluta del 26,31% en precisión de desambiguación de homógrafos respecto al modelo base, junto con una reducción de la tasa de error fonémico (PER) y de palabra (WER), y una latencia media de 141,67 ms en CUDA. El modelo está disponible bajo licencia Apache-2.0 y soporta exclusivamente el idioma persa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (seq2seq) |
| Parametros totales | 8.264.064 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fa (persa) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un T5 (Text-to-Text Transfer Transformer) de tamaño pequeño, adaptado para la tarea de conversión grafema-fonema. Se trata de un modelo denso, sin mezcla de expertos, que recibe texto persa y genera la transcripción fonética correspondiente. El proceso de entrenamiento consistió en un fine-tuning del modelo base `negara-g2p-clean-v2` sobre el dataset HomoRich, un conjunto de datos anotado por humanos con pares de oraciones y sus transcripciones fonéticas, diseñado específicamente para abordar la desambiguación de homógrafos. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; solo se indica que el fine-tuning se realizó sobre el modelo base y que se evaluó con ground truth humano limpio.

La innovación técnica principal reside en la capacidad de usar el contexto oracional para elegir la pronunciación correcta entre múltiples opciones homógrafas. El modelo no solo mejora la precisión global (PER 2,34% y WER 8,25%), sino que también reduce la latencia media de inferencia en comparación con el base (141,67 ms frente a 146,57 ms en CUDA), lo que sugiere una optimización adicional en el proceso de decodificación.

## Capacidades

- Conversión grafema-fonema (G2P) para persa, generando transcripciones fonéticas a partir de texto.
- Desambiguación contextual de homógrafos: distingue significados como `maskan` (hogar) vs. `mosakken` (analgésico), `keSti` (barco) vs. `koSti` (lucha), `deh` (aldea) vs. `dah` (diez), entre otros.
- Generación de fonemas con notación estandarizada (por ejemplo, `keStiye bozorgi dar daryA qarq Sod`).
- Inferencia de baja latencia: ~141,67 ms de media en CUDA, adecuada para aplicaciones en tiempo real.
- Integración sencilla con la librería Transformers de Hugging Face mediante `AutoModelForSeq2SeqLM`.
- Soporte de decodificación con beam search (num_beams=4) para mejorar la calidad de las transcripciones.

## Casos de uso

- Síntesis de voz (TTS) en persa: el modelo puede integrarse como módulo front-end en un pipeline TTS para convertir texto arbitrario en fonemas, garantizando que los homógrafos se pronuncien correctamente según el contexto. Por ejemplo, en una aplicación de lectura de noticias, la frase «کشتی بزرگی در دریا غرق شد» se transcribirá como `keStiye bozorgi...` (barco) en lugar de `kaStiye...` (lucha).
- Reconocimiento automático del habla (ASR) como post-procesador: las salidas fonéticas del modelo pueden usarse para verificar o corregir transcripciones de ASR, especialmente en casos de homófonos o palabras ambiguas.
- Asistentes de voz y chatbots en persa: al mejorar la pronunciación de nombres propios, lugares y términos técnicos, el modelo contribuye a una interacción más natural y precisa en sistemas conversacionales.
- Lectura de textos legales o médicos: documentos con terminología especializada donde los homógrafos son frecuentes (por ejemplo, «مسکن» como hogar vs. analgésico) se transcriben correctamente, evitando errores de pronunciación que podrían cambiar el significado.
- Herramientas de aprendizaje de idiomas: aplicaciones de enseñanza del persa pueden usar el modelo para mostrar la pronunciación correcta de palabras en contexto, ayudando a estudiantes a distinguir entre homógrafos.
- Sistemas de subtitulado automático y doblaje: la transcripción fonética precisa es esencial para sincronizar audio y texto, y el modelo reduce errores en palabras ambiguas que afectan la naturalidad del resultado.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación comparando el modelo afinado con el modelo base `negara-g2p-clean-v2`, utilizando ground truth humano limpio del dataset HomoRich y un conjunto de pruebas específico de desambiguación de homógrafos:

| Modelo | Precisión de homógrafos (%) | PER (%) | WER (%) | Latencia (ms) |
| :--- | :---: | :---: | :---: | :---: |
| Base (`negara-g2p-clean-v2`) | 63,16 | 2,59 | 8,62 | 146,57 |
| Fine-tuned (este modelo) | 89,47 | 2,34 | 8,25 | 141,67 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en una tarea de NLP concreta y no es un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo T5 con solo 8,26 millones de parámetros, la inferencia puede ejecutarse en CPU sin problemas. En GPU, el uso de VRAM es mínimo (menos de 1 GB incluso con batch grande).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior permitirá latencias inferiores a 150 ms. También funciona en GPUs integradas o en CPU con latencias aceptables (probablemente por debajo de 1 segundo).
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna (RTX 20xx, 30xx, 40xx, etc.) y también en hardware embebido como Jetson.
- Opciones de despliegue: al ser un modelo estándar de Transformers, puede servirse con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. También es posible exportarlo a ONNX o TensorRT para optimización.
- Latencia y throughput: la model card reporta una latencia media de 141,67 ms en CUDA. En CPU, la latencia será mayor pero aún viable para aplicaciones no críticas en tiempo real.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos G2P persas con desambiguación de homógrafos en la información proporcionada. La única comparación directa disponible es con el modelo base `negara-g2p-clean-v2`, que se detalla en la sección de benchmarks. Se recomienda consultar el repositorio del dataset HomoRich para posibles alternativas futuras.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para persa; no soporta otros idiomas.
- La desambiguación de homógrafos depende del contexto oracional; frases muy cortas o sin contexto suficiente pueden producir errores.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos anotados por humanos, puede heredar sesgos presentes en el dataset HomoRich.
- Riesgo de alucinación: aunque la tarea es determinista (grafema a fonema), en casos de entrada malformada o fuera de dominio el modelo podría generar transcripciones incorrectas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset HomoRich para asegurar el cumplimiento de sus términos.
- No se proporcionan detalles sobre la longitud máxima de entrada soportada; para textos muy largos puede ser necesario truncar o dividir la entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jafarahmadi/negara-g2p-v2-homorich-disambiguated
- Modelo base: https://huggingface.co/Reza2kn/negara-g2p-clean-v2
- Dataset HomoRich-G2P-Negara-v1: https://huggingface.co/datasets/Reza2kn/HomoRich-G2P-Negara-v1
