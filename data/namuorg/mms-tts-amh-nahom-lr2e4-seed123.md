# Namuorg/mms-tts-amh-nahom-lr2e4-seed123

## Resumen

El modelo `Namuorg/mms-tts-amh-nahom-lr2e4-seed123` es un sistema de síntesis de voz (text-to-speech) para el idioma amhárico, desarrollado por la organización Namuorg como parte de un proyecto de prácticas. Se trata de un fine-tuning del modelo `facebook/mms-tts-amh`, un modelo VITS de 83 millones de parámetros preentrenado por Meta para síntesis de voz multilingüe. El objetivo es mejorar la calidad de la voz en amhárico, un idioma de bajos recursos, ajustando el modelo sobre un corpus limpio de un único hablante (identificado como "Nahom").

El modelo resultante tiene 36.282.672 parámetros, significativamente menos que el modelo base, lo que sugiere que el fine-tuning se realizó sobre una subconjunto de capas o con una técnica de poda. La arquitectura subyacente es VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech), que combina un autoencoder variacional con flujos normalizadores y un decodificador adversarial. Está disponible en formato safetensors y es compatible con la librería `transformers` mediante el pipeline `text-to-audio`.

Este modelo es relevante porque aborda la escasez de voces de alta calidad para el amhárico, un idioma hablado por más de 30 millones de personas en Etiopía, y demuestra cómo el fine-tuning de modelos multilingües puede adaptarse eficazmente a idiomas específicos con pocos recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) |
| Parametros totales | 36.282.672 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo TTS, no procesa texto como secuencia de contexto) |
| Tipos de cuantizacion | no disponible (pesos completos en safetensors, sin cuantización publicada) |
| Idiomas soportados | amhárico (según el nombre del modelo y el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS, propuesta en el artículo *"VITS: Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech"* (Kim et al., 2021). VITS integra un codificador de texto, un decodificador de onda (waveform) y un discriminador adversarial, todo entrenado de extremo a extremo. El modelo original `facebook/mms-tts-amh` fue preentrenado por Meta en el marco del proyecto MMS (Massively Multilingual Speech) sobre más de 1.400 idiomas, incluyendo el amhárico.

El fine-tuning realizado por Namuorg se llevó a cabo sobre un corpus amhárico limpio de un único hablante, utilizando el repositorio `ylacombe/finetune-hf-vits`. Según el nombre del modelo, se usó una tasa de aprendizaje de `2e-4` y una semilla aleatoria `123`. No se han publicado detalles sobre el volumen de datos de entrenamiento, el número de épocas, ni si se aplicaron técnicas de regularización o aumentación. El proceso de fine-tuning parece haber reducido el número de parámetros desde los 83M del modelo base hasta los 36M, aunque no se especifica el mecanismo exacto (posible poda o congelación de capas).

No hay información pública sobre el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de un modelo de síntesis de voz y no de un LLM.

## Capacidades

- Síntesis de voz en amhárico: el modelo convierte texto escrito en amhárico en audio hablado, con una voz masculina (identificada como "Nahom").
- Generación de audio en formato onda (waveform) a partir de texto, mediante el pipeline `text-to-audio` de Hugging Face.
- Soporte para inferencia en tiempo real o por lotes, dependiendo del hardware.
- No dispone de capacidades de razonamiento, código, matemáticas, visión ni tool calling, ya que es un modelo exclusivamente de síntesis de voz.
- No soporta múltiples hablantes: está especializado en una única voz (la del hablante "Nahom").

## Casos de uso

- Audiolibros y narración: el modelo puede generar narración en amhárico para audiolibros, podcasts o contenido educativo, ofreciendo una voz consistente y natural para un único locutor.
- Asistentes de voz y sistemas de respuesta interactiva: integrable en aplicaciones de atención al cliente o asistentes virtuales que requieran salida de voz en amhárico, con baja latencia al ser un modelo ligero.
- Accesibilidad para personas con discapacidad visual: conversión de texto digital (noticias, documentos, mensajes) a voz en amhárico para lectores de pantalla.
- Aplicaciones educativas y de aprendizaje de idiomas: generación de ejemplos de pronunciación en amhárico para estudiantes, con una voz clara y estable.
- Sistemas de navegación y avisos públicos: locución de indicaciones o mensajes en amhárico en entornos como transporte público o quioscos interactivos.
- Prototipos de investigación en TTS para idiomas de bajos recursos: sirve como punto de partida para experimentos de fine-tuning o transferencia de voz en amhárico, al ser un modelo compacto y fácil de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparaciones cuantitativas con otros modelos TTS para amhárico.

## Requisitos de hardware

- VRAM estimada: al tener 36 millones de parámetros, el modelo puede ejecutarse en CPU con memoria RAM suficiente (aproximadamente 150-200 MB en precisión fp32). En GPU, cabría incluso en tarjetas de gama baja con 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2060, o incluso integradas como Intel Iris Xe). Para inferencia por lotes, una GPU con 4 GB (RTX 3050) es suficiente.
- Sí cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser compatible con `transformers`, se puede usar con la biblioteca `transformers` directamente, o mediante `TTS` de Hugging Face (parte de `transformers`). También se puede exportar a ONNX para inferencia en CPU optimizada. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia y throughput: no se dispone de datos oficiales. En una GPU moderna (RTX 3090), la generación de 1 segundo de audio suele tardar menos de 0,5 segundos con modelos VITS de este tamaño, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Namuorg/mms-tts-amh-nahom-lr2e4-seed123` | 36M | no aplica | TTS en amhárico (1 hablante) | no disponible | Hugging Face |
| `facebook/mms-tts-amh` | 83M | no aplica | TTS multilingüe (incluye amhárico) | CC-BY-NC 4.0 (según proyecto MMS) | Hugging Face |
| `Namuorg/mms-tts-amh-nahom-lr1e3` | no disponible | no aplica | TTS en amhárico (1 hablante, lr 1e-3) | no disponible | Hugging Face |

No se dispone de otros modelos comparables específicos para TTS en amhárico en el ecosistema abierto. El modelo base de Meta es la referencia principal, y el modelo de Namuorg con lr1e3 es una variante con diferente tasa de aprendizaje.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado con un único hablante masculino, el modelo no generaliza a otras voces ni géneros. Puede presentar sesgos de pronunciación o entonación propios de ese hablante.
- Riesgo de alucinación: en TTS, el riesgo de alucinación se manifiesta como errores de pronunciación o énfasis incorrecto en palabras poco frecuentes o nombres propios. No hay datos sobre su robustez en estos casos.
- Limitaciones de idioma: solo soporta amhárico. No es adecuado para otros idiomas, ni siquiera para mezclas de idiomas (code-switching).
- Restricciones de licencia: la licencia no está especificada en la model card. El modelo base `facebook/mms-tts-amh` usa la licencia CC-BY-NC 4.0, que restringe el uso comercial. Es probable que este fine-tuning herede esa restricción, pero no está confirmado. Se recomienda contactar con el autor antes de usar en producción comercial.
- Limitaciones de producción: al ser un modelo de investigación con una única voz, no es adecuado para sistemas que requieran múltiples voces o alta variabilidad prosódica. La calidad de audio no ha sido evaluada formalmente.
- Datos de entrenamiento: no se ha publicado información sobre el corpus utilizado, su tamaño ni su procedencia, lo que dificulta evaluar posibles sesgos o problemas de derechos de autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Namuorg/mms-tts-amh-nahom-lr2e4-seed123
- Repositorio del proyecto (GitHub): https://github.com/Namuai-org/namu-tts-amharic-tts-internship
- Modelo base `facebook/mms-tts`: https://huggingface.co/facebook/mms-tts
- Variante con lr1e3: https://huggingface.co/Namuorg/mms-tts-amh-nahom-lr1e3
