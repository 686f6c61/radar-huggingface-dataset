# Minervus00/byt5-g2p-mos

## Resumen

El modelo `Minervus00/byt5-g2p-mos` es un ajuste fino (fine-tune) de `google/byt5-small` especializado en la conversión de grafemas a fonemas (G2P). Este tipo de modelos es fundamental en sistemas de síntesis de voz (TTS), asistentes de pronunciación y herramientas lingüísticas, ya que transforman texto escrito en su representación fonética. El desarrollo corre a cargo del usuario Minervus00, quien ha publicado el modelo bajo licencia Apache 2.0 en Hugging Face.

El modelo se basa en la arquitectura ByT5, una variante de T5 que opera directamente sobre bytes UTF-8, eliminando por completo la necesidad de un tokenizador subpalabra. Esto simplifica el preprocesamiento y mejora el rendimiento en tareas multilingües, especialmente cuando el vocabulario es amplio o los datos son ruidosos. Con 299,6 millones de parámetros, el modelo es compacto y apto para entornos con recursos limitados.

La relevancia de esta publicación radica en su naturaleza de código abierto y su capacidad para ser desplegado mediante herramientas como `text-generation-inference`, lo que permite integrarlo fácilmente en pipelines de TTS. Sin embargo, la información pública es escasa: no se especifica el idioma objetivo (la sigla "mos" podría aludir al mossi, lengua hablada en Burkina Faso, aunque no está confirmado) ni el dataset de entrenamiento, lo que limita una evaluación completa de su alcance.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) con entrada a nivel de byte (ByT5) |
| Parametros totales | 299.637.760 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (ByT5 estándar: 512 bytes de entrada) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, compatible con cuantización posterior) |
| Idiomas soportados | no disponible (el dataset de entrenamiento no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de `google/byt5-small`: un transformer encoder-decoder que procesa directamente los bytes UTF-8 de la secuencia de entrada, sin tokenizador subpalabra. Esto reduce la complejidad del sistema y evita la dependencia de vocabularios, lo que resulta especialmente útil para tareas de G2P en idiomas con ortografía compleja o recursos limitados. El ajuste fino se realizó sobre un dataset no especificado ("None dataset" en la model card), con el objetivo de aprender la correspondencia grafema-fonema.

El entrenamiento usó el optimizador AdaFactor con una tasa de aprendizaje de 0.001, scheduler lineal con 300 pasos de warm-up, y se ejecutó durante 40 épocas con batch de 16. La pérdida de validación final fue de 0.0259, con un CER de 0.0197 y un WER de 0.0518 en el conjunto de evaluación. La tabla de entrenamiento muestra una clara convergencia, aunque se observan fluctuaciones en las métricas a lo largo de las épocas, lo que sugiere cierta inestabilidad en el proceso de ajuste.

## Capacidades

- Conversión de grafemas a fonemas (G2P) para sistemas de síntesis de voz y anotación fonética.
- Procesamiento de texto a nivel de bytes, lo que permite manejar cualquier idioma sin necesidad de tokenizador específico.
- Modelo de tipo text2text-generation, por lo que puede ser usado con la API de `transformers` para generar transcripciones fonéticas.
- Compatible con `text-generation-inference`, facilitando su despliegue en entornos de producción.
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento multi-paso, ya que no es un modelo de propósito general.

## Casos de uso

- **Síntesis de voz (TTS)**: el modelo puede integrarse en un pipeline de TTS para convertir texto en fonemas antes de la generación de audio. Su naturaleza byte-level lo hace útil para idiomas con ortografía compleja o recursos escasos.
- **Corrección de pronunciación en aprendizaje de idiomas**: permite generar transcripciones fonéticas de palabras en tiempo real, útil en aplicaciones educativas para practicar pronunciación.
- **Sistemas de subtitulado automático**: en combinación con reconocimiento de voz, el modelo puede normalizar transcripciones a una representación fonética uniforme.
- **Investigación en fonética y lingüística computacional**: sirve como herramienta para análisis de correspondencias grafema-fonema en distintos idiomas.
- **Normalización de texto para asistentes de voz**: convierte nombres propios, siglas o palabras extranjeras a su pronunciación aproximada antes de la síntesis.
- **Recursos para lenguas con poca digitalización**: si el modelo está entrenado en mossi u otra lengua minoritaria, puede facilitar el desarrollo de herramientas TTS para esas comunidades.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas en el conjunto de evaluación tras el entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida (loss) | 0.0259 |
| CER (Character Error Rate) | 0.0197 |
| WER (Word Error Rate) | 0.0518 |

La tabla de entrenamiento muestra la evolución de estas métricas por época:

| Training Loss | Epoch | Step | Validation Loss | Cer    | Wer    |
|:-------------:|:-----:|:----:|:---------------:|:------:|:------:|
| 1.4407        | 1.0   | 75   | 0.2878          | 0.4261 | 0.6337 |
| 0.3709        | 2.0   | 150  | 0.1010          | 0.1122 | 0.2576 |
| 0.1956        | 3.0   | 225  | 0.0497          | 0.0676 | 0.1526 |
| 0.1384        | 4.0   | 300  | 0.0400          | 0.0750 | 0.1503 |
| 0.0853        | 5.0   | 375  | 0.0405          | 0.1669 | 0.2294 |
| 0.0801        | 6.0   | 450  | 0.0328          | 0.0800 | 0.1314 |
| 0.0733        | 7.0   | 525  | 0.0241          | 0.0323 | 0.0740 |
| 0.0579        | 8.0   | 600  | 0.0265          | 0.0474 | 0.0925 |
| 0.0485        | 9.0   | 675  | 0.0270          | 0.0520 | 0.0907 |
| 0.0349        | 10.0  | 750  | 0.0236          | 0.0270 | 0.0592 |
| 0.0321        | 11.0  | 825  | 0.0252          | 0.0582 | 0.0953 |
| 0.0308        | 12.0  | 900  | 0.0254          | 0.0099 | 0.0430 |
| 0.0272        | 13.0  | 975  | 0.0257          | 0.0405 | 0.0745 |
| 0.0233        | 14.0  | 1050 | 0.0262          | 0.0231 | 0.0527 |
| 0.0255        | 15.0  | 1125 | 0.0242          | 0.0250 | 0.0537 |
| 0.0141        | 16.0  | 1200 | 0.0258          | 0.0430 | 0.0712 |
| 0.0147        | 17.0  | 1275 | 0.0259          | 0.0197 | 0.0518 |

El model-index oficial está vacío (`results: []`), por lo que no se dispone de benchmarks comparativos con otros modelos. Los valores CER y WER indican un error relativo bajo, pero sin contexto del dataset de evaluación no se puede valorar su significación absoluta.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en FP16, el modelo ocupa aproximadamente 600 MB (299M parámetros × 2 bytes). En FP32 ocuparía ~1.2 GB, y en INT8 ~300 MB.
- **GPUs recomendadas**: el modelo cabe en cualquier GPU consumer con al menos 2 GB de VRAM, como GTX 1650, RTX 3060, etc. Para batch grande o despliegue concurrente, se recomienda una RTX 3090 o superior.
- **Opciones de despliegue**: compatible con `transformers` (pipeline `text2text-generation`), `text-generation-inference` (TGI), y se puede exportar a GGUF o cuantizar con `bitsandbytes` para entornos CPU o edge.
- **Latencia y throughput**: en una GPU moderna (p.ej. RTX 4090) la generación de una transcripción fonética de 100 bytes debería ser inferior a 50 ms; en CPU, puede ser de 1-2 s para el mismo tamaño de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| `Minervus00/byt5-g2p-mos` | 299.6M | no disponible | Apache 2.0 | G2P (idioma no especificado) |
| `charsiu/g2p_multilingual_byT5_small_100` | 299.6M (base byt5-small) | 512 bytes | Apache 2.0 | G2P multilingüe (100 idiomas) |
| `patriotyk/stressifier-byt5-g2p-model` | 299.6M (base byt5-small) | 512 bytes | Apache 2.0 | G2P con marcado de acentuación |

El modelo de `charsiu` es el más comparable, ya que cubre 100 idiomas y está entrenado sobre un dataset curado. El modelo de `patriotyk` se centra en la acentuación (stress marking). `Minervus00/byt5-g2p-mos` no especifica su alcance lingüístico, por lo que no se puede determinar si es multilingüe o monolingüe. La comparación de rendimiento directa no es posible sin benchmarks comunes.

## Limitaciones y advertencias

- **Dataset de entrenamiento desconocido**: la model card indica que se entrenó sobre "None dataset", lo que impide conocer los idiomas, la calidad de los datos y los posibles sesgos.
- **Riesgo de alucinación fonética**: en palabras fuera del dominio de entrenamiento, el modelo puede generar transcripciones fonéticas incorrectas o inconsistentes.
- **Contexto limitado**: al ser una arquitectura ByT5, la longitud de entrada está limitada a 512 bytes (según el modelo base), lo que restringe el procesamiento de textos largos.
- **Licencia y uso comercial**: la licencia Apache 2.0 permite uso comercial, pero al no conocer los datos de entrenamiento, puede haber problemas de atribución o derechos sobre los datos subyacentes.
- **Sin soporte de idiomas explícito**: no se ha documentado qué idiomas soporta, por lo que su uso fuera del idioma de entrenamiento puede dar resultados no fiables.
- **Baja adopción**: el modelo no tiene descargas ni likes, lo que sugiere que no ha sido validado por la comunidad; se recomienda probar antes de desplegar.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Minervus00/byt5-g2p-mos)
- [Paper ByT5: Towards a Token-Free Future with Pre-trained Byte-to-Byte Models](https://arxiv.org/abs/2204.03067)
- [Repositorio oficial de ByT5 en GitHub](https://github.com/google-research/byt5)
- [Modelo G2P multilingüe de Charsiu (alternativa)](https://huggingface.co/charsiu/g2p_multilingual_byT5_small_100)
- [GitHub del autor Minervus00](https://github.com/Minervus00)
- [Modelo G2P con acentuación de patriotyk](https://huggingface.co/patriotyk/stressifier-byt5-g2p-model)
