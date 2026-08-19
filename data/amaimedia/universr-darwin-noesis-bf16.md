# AMAImedia/UniverSR-Darwin-NOESIS-BF16

## Resumen

UniverSR-Darwin-NOESIS-BF16 es un modelo de super-resolución de audio desarrollado por AMAImedia como parte de la plataforma profesional de doblaje multilingüe NOESIS (framework DHCF-FNO). Se trata de una fusión ponderada (weighted average) de dos variantes del modelo UniverSR: una optimizada para voz (speech) y otra para audio general, con pesos de 0.60 y 0.40 respectivamente. El resultado es un modelo generalista capaz de mejorar la calidad de audio y muestrear a 48 kHz, orientado principalmente al post-procesado de voz sintetizada en flujos de doblaje.

Con aproximadamente 57,2 millones de parámetros y una arquitectura basada en ConvNeXt con flow-matching (CFM), el modelo se distribuye en formato BF16 safetensors (115 MB), aunque su versión original fue entrenada en FP32. Su relevancia radica en que ofrece una solución compacta y eficiente para la mejora de audio en entornos profesionales de doblaje, donde la fidelidad y la claridad de la voz son críticas. El modelo está disponible bajo licencia Apache 2.0, lo que permite su uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UniverSR (ConvNeXt flow-matching, CFM) |
| Parametros totales | 57.231.302 (~57,2 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | BF16 (original FP32) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), originalmente pytorch_model.bin (FP32) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura UniverSR, que emplea bloques ConvNeXt combinados con un enfoque de flow-matching (CFM) para la generación de audio de alta resolución. No se trata de un transformer ni de un modelo de lenguaje, sino de un modelo de audio-audio específicamente diseñado para super-resolución. La técnica de flow-matching permite modelar la distribución del audio de forma continua, lo que resulta en una mejora perceptualmente superior frente a métodos generativos tradicionales.

El proceso de entrenamiento no está documentado en la información disponible: no se especifican los datos utilizados, el número de tokens (en este caso, muestras de audio) ni si se aplicaron técnicas de RLHF o DPO. Lo que sí se conoce es el método de fusión: se realizó una media ponderada de dos modelos preentrenados, UniverSR-speech (peso 0.60) y UniverSR-audio (peso 0.40), con el objetivo de equilibrar el rendimiento en voz y en audio general. El modelo se distribuye en BF16 para reducir el tamaño y acelerar la inferencia, manteniendo una calidad cercana a la versión FP32.

## Capacidades

- Super-resolución de audio: upsampling de señales de audio a 48 kHz, mejorando la claridad y el detalle.
- Mejora de voz: optimizado para voz sintetizada, especialmente útil en flujos de doblaje.
- Mejora de audio general: capaz de procesar música, efectos de sonido y otros tipos de audio, aunque con menor prioridad que la voz.
- Procesamiento audio-audio: entrada y salida en formato de audio, sin capacidades de texto, visión ni otras modalidades.
- Integración en pipelines: diseñado para ser un paso de post-procesado dentro de la plataforma NOESIS, pero puede usarse de forma independiente.
- Formato eficiente: al ser un modelo pequeño (~57 M parámetros), es adecuado para despliegue en entornos con recursos limitados.

## Casos de uso

- Doblaje profesional: mejora de la calidad de voz sintetizada antes de la mezcla final, elevando la frecuencia de muestreo a 48 kHz para cumplir estándares de broadcast.
- Restauración de audio antiguo: upsampling y limpieza de grabaciones históricas de baja calidad, mejorando la inteligibilidad sin alterar el contenido.
- Producción de podcasts: mejora de grabaciones realizadas con micrófonos de gama baja, aumentando la nitidez y reduciendo artefactos.
- Post-producción audiovisual: aplicación como paso final en cadenas de edición para unificar la calidad de audio de diferentes fuentes.
- Sistemas de voz sintetizada: integración en motores de text-to-speech para refinar la salida antes de su uso en asistentes o audiolibros.
- Archivo y preservación: conversión de material de audio a una resolución superior para su almacenamiento o distribución en plataformas que requieran 48 kHz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo tiene aproximadamente 57,2 millones de parámetros y ocupa 115 MB en BF16, lo que lo hace muy ligero.
- Puede ejecutarse en GPUs con poca VRAM (por ejemplo, 2-4 GB), aunque no se proporcionan cifras exactas de consumo.
- Es probable que funcione en CPUs modernas, aunque con mayor latencia.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.), ya que el modelo no es de tipo texto y su inferencia se realiza mediante frameworks de audio.
- Dado su tamaño, es viable su uso en entornos de producción sin necesidad de hardware especializado.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre otros modelos de super-resolución de audio comparables en términos de arquitectura, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo está especializado en voz y audio general, pero su rendimiento en dominios muy específicos (p. ej., música instrumental compleja) no está documentado.
- No se dispone de información sobre sesgos o comportamientos indeseados en ciertos tipos de audio.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de la plataforma NOESIS si se integra en productos derivados.
- El modelo no es multimodal: solo procesa audio, no texto ni imágenes.
- Al ser una fusión de dos modelos, puede presentar ligeras diferencias de comportamiento frente a los modelos originales, aunque no se han cuantificado.

## Enlaces

- [HuggingFace: AMAImedia/UniverSR-Darwin-NOESIS-BF16](https://huggingface.co/AMAImedia/UniverSR-Darwin-NOESIS-BF16)
- [Sitio web de AMAImedia](https://www.amaimedia.com)
- [X (Twitter) de AMAImedia](https://x.com/AMAImediacom)
- [LinkedIn de Ilia Bolotnikov](https://www.linkedin.com/in/ilia-bolotnikov)
- [Telegram de Ilia Bolotnikov](https://t.me/djbionicl)
