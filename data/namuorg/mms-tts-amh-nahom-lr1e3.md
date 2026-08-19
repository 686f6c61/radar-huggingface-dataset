# Namuorg/mms-tts-amh-nahom-lr1e3

## Resumen

Namuorg/mms-tts-amh-nahom-lr1e3 es un modelo de síntesis de voz (text-to-speech) en amhárico, desarrollado por Namuorg como parte de un proyecto de prácticas (internship) documentado en el repositorio Namuai-org/namu-tts-amharic-tts-internship. Se trata de un fine-tuning del modelo base facebook/mms-tts-amh, perteneciente a la familia Massively Multilingual Speech (MMS) de Meta, que ya ofrecía una síntesis básica en amhárico pero con calidad limitada. El objetivo del proyecto es mejorar la naturalidad y claridad de la voz mediante el reentrenamiento sobre un corpus limpio de un único hablante.

El modelo utiliza la arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech), un enfoque de generación de voz de extremo a extremo basado en flujos normalizadores y entrenamiento adversarial. Según los datos del repositorio HuggingFace, el checkpoint publicado contiene 36.282.672 parámetros (frente a los 83 millones del modelo base), lo que sugiere una poda o congelación de capas durante el fine-tuning. El repositorio ocupa 0,1 GB y está disponible en formato safetensors, compatible con la librería transformers.

La relevancia de este modelo radica en su enfoque práctico: el fine-tuning se realiza con pocos datos (entre 80 y 150 muestras según el repositorio upstream) y tiempos de entrenamiento cortos (20-25 minutos en una GPU T4), lo que lo convierte en un caso de estudio interesante para adaptar modelos TTS multilingües a voces específicas con recursos limitados. No obstante, la ficha técnica del autor está prácticamente vacía y la licencia no está declarada, por lo que su uso en producción requiere verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training) |
| Parametros totales | 36.282.672 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no aplica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | amharico (amh) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto con flujos normalizadores, un decodificador basado en WaveGAN y un discriminador para entrenamiento adversarial. El modelo original de Meta (facebook/mms-tts-amh) tiene 83 millones de parámetros y fue entrenado como parte del proyecto MMS, que cubre más de 1100 idiomas. El fine-tuning realizado por Namuorg reentrena este modelo sobre un corpus limpio de un único hablante en amhárico, utilizando la herramienta ylacombe/finetune-hf-vits. Según el repositorio del proyecto, cada ejecución de entrenamiento tarda entre 20 y 25 minutos en una GPU T4 de nivel gratuito, y se reportan resultados utilizables con tan solo 80-150 muestras de audio. El checkpoint publicado en HuggingFace tiene 36.282.672 parámetros, lo que indica una reducción significativa respecto al modelo base, aunque no se documenta el procedimiento exacto de poda o congelación de capas.

## Capacidades

- Síntesis de voz en amhárico a partir de texto.
- Generación de audio de habla natural para un único hablante (el corpus de fine-tuning es de un solo locutor).
- Compatible con el pipeline `text-to-audio` de HuggingFace Transformers.
- Integración con la librería `transformers` mediante la clase `VitsModel` (o similar) para generación directa de audio.
- Soporte de inferencia en local con recursos modestos (el modelo es pequeño, ~36M parámetros).
- No se documentan capacidades adicionales como control de emociones, estilos o múltiples voces.

## Casos de uso

- **Sistemas de lectura de texto en amhárico para accesibilidad**: el modelo puede convertir artículos, libros o noticias en audio para personas con discapacidad visual o dificultades de lectura. Su tamaño reducido permite desplegarlo en dispositivos con recursos limitados.
- **Asistentes de voz en amhárico**: integración en chatbots o asistentes virtuales que necesiten responder por voz en este idioma. El modelo puede generar respuestas audibles a partir de texto generado por un LLM.
- **Aplicaciones educativas de idiomas**: generación de ejemplos de pronunciación en amhárico para estudiantes. Al estar entrenado con una voz clara, resulta útil como referencia de pronunciación.
- **Audiolibros y contenido narrado**: producción de audiolibros en amhárico a partir de texto digital, siempre que se acepte una voz única y sin variaciones expresivas.
- **Sistemas de información pública**: anuncios automatizados en estaciones de transporte, aeropuertos o servicios gubernamentales en Etiopía, donde el amhárico es lengua oficial.
- **Prototipado rápido de TTS**: gracias a su bajo coste de entrenamiento y tamaño, sirve como punto de partida para experimentar con fine-tuning adicional sobre otras voces o dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparativas con otros modelos TTS amháricos en la documentación del autor. El único dato cualitativo es la afirmación del repositorio de que el modelo base "ya habla amhárico mal" y que el fine-tuning mejora la calidad, pero sin cifras concretas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de ~36M parámetros, la inferencia puede ejecutarse en CPU con menos de 1 GB de RAM, o en cualquier GPU con al menos 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 4090) es suficiente. El entrenamiento se realizó en una T4 (16 GB VRAM), pero para inferencia se necesita mucho menos.
- **Compatibilidad con consumer GPU**: sí, cabe sin problema en cualquier GPU de gama media o incluso en CPU.
- **Opciones de despliegue**: al ser un modelo VITS de HuggingFace, se puede servir con la librería `transformers` directamente, o mediante servidores de inferencia como TGI (Text Generation Inference) si se adapta, aunque no es el uso típico. También es posible exportar a ONNX para optimización.
- **Latencia y throughput**: no se dispone de mediciones oficiales. Dado el tamaño, se espera una latencia de decenas de milisegundos por frase en GPU, y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Namuorg/mms-tts-amh-nahom-lr1e3 | 36,28 M | no aplica | amharico | no disponible | safetensors |
| facebook/mms-tts-amh | 83 M | no aplica | amharico | CC-BY-NC 4.0 (según MMS) | safetensors |
| facebook/mms-tts (modelo multilingue) | 83 M por idioma | no aplica | 1100+ idiomas | CC-BY-NC 4.0 (según MMS) | safetensors |

La comparativa se limita al modelo base de Meta, ya que no se han encontrado otros modelos TTS amháricos de referencia en la información disponible. El modelo de Namuorg es una versión reducida y fine-tuneada del modelo de Meta, con menos parámetros pero orientada a una voz específica. La licencia del modelo base es CC-BY-NC 4.0 (no comercial), por lo que el fine-tuning hereda probablemente esa restricción, aunque no está declarada en la ficha del autor.

## Limitaciones y advertencias

- **Licencia no declarada**: el autor no especifica la licencia del modelo fine-tuneado. Dado que el modelo base de Meta (facebook/mms-tts-amh) se distribuye bajo CC-BY-NC 4.0, es muy probable que este fine-tuning herede la restricción de uso no comercial. Cualquier uso en producción debe verificar este punto antes de desplegarlo.
- **Model card vacía**: la documentación del autor no incluye información sobre sesgos, limitaciones técnicas ni procedencia de los datos de entrenamiento. Esto dificulta la evaluación de riesgos.
- **Voz única**: el modelo está entrenado con un único hablante, por lo que no es adecuado para aplicaciones que requieran múltiples voces o variaciones expresivas.
- **Idioma limitado**: solo amhárico. No soporta otros idiomas ni mezcla de lenguas.
- **Riesgo de alucinación fonética**: como todo modelo TTS, puede producir pronunciaciones incorrectas en nombres propios, palabras extranjeras o términos técnicos poco frecuentes.
- **Sin datos de evaluación**: no hay métricas objetivas de calidad de voz, por lo que la idoneidad para uso profesional no está demostrada.
- **Fecha de creación futura**: el modelo fue creado el 2026-08-18, lo que sugiere que es un proyecto muy reciente o que la fecha es incorrecta. Conviene verificar la integridad de los archivos antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Namuorg/mms-tts-amh-nahom-lr1e3
- Repositorio del proyecto (GitHub): https://github.com/Namuai-org/namu-tts-amharic-tts-internship
- Manual del proyecto (Nahom): https://github.com/Namuai-org/namu-tts-amharic-tts-internship/blob/main/HANDBOOK_Nahom.md
- Modelo base facebook/mms-tts-amh: https://huggingface.co/facebook/mms-tts-amh
- Modelos MMS de Meta: https://huggingface.co/facebook/mms-tts
- Ficha del modelo base en BimAnt: https://zoo.bimant.com/model/310166
- Paper de VITS (arXiv): https://arxiv.org/abs/1910.09700
