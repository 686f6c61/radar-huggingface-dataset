# ModelsLab/midashenglm-gen-wer-lora

## Resumen

ModelsLab/midashenglm-gen-wer-lora es un adaptador LoRA para el modelo base mispeech/midashenglm-gen, desarrollado por Xiaomi Research. Este adaptador se ha entrenado con el objetivo de corregir dos debilidades medidas del modelo base: el alto WER (Word Error Rate) en líneas de habla cortas y el rendimiento deficiente en efectos de sonido. El entrenamiento cubre las cinco capacidades del modelo base (habla, efectos, música, ambiente y escenas mixtas) mediante una mezcla ponderada y un anchor loss para evitar el olvido catastrófico.

Los resultados publicados muestran una mejora sólida del WER en habla (de 5,6% a 0,0% en general, y de 13,9% a 0,0% en líneas de 4 palabras), pero también degradaciones en la adherencia al texto y el realismo de las escenas no habladas (efectos, música, ambiente y mixto). Por tanto, el adaptador es recomendable para aplicaciones centradas en habla, pero requiere una evaluación A/B frente al modelo base para otros usos.

El modelo base emplea una arquitectura de LLM preentrenado con tokenizador de audio y flow matching condicional por token, generando audio de 16 kHz. El adaptador añade 53,8 millones de parámetros entrenables sobre los 2,89 mil millones del modelo base, y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=32, alpha=64) sobre LLM + flow matching DiT del modelo base MiDashengLM-Gen |
| Parametros totales | 2,89 B (modelo base) + 53,8 M (adaptador entrenable) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se puede fusionar con el modelo base y cuantizar posteriormente) |
| Idiomas soportados | No disponible (el modelo base no especifica idiomas en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo MiDashengLM-Gen, que combina un LLM preentrenado con un tokenizador de audio y un mecanismo de flow matching condicional por token para generar secuencias de audio de 16 kHz de longitud variable. El adaptador LoRA se aplica a las capas de atención y MLP del LLM, así como al DiT del flow matching, con rango 32 y alpha 64.

El entrenamiento se realizó durante 2500 pasos con un batch efectivo de 16, usando AdamW-8bit con learning rate 0,0001, decaimiento coseno y grad clip 1,0. La mezcla de capacidades fue: habla 40%, mixto 22%, música 16%, efectos 14% y ambiente 8%. Los datos de habla provienen de LibriTTS-R y MECAT S00, con sobremuestreo 2,5x de clips menores a 3 segundos; los datos de escenas provienen de MECAT-Caption (ocho categorías). Se empleó un anchor loss que tira del campo vectorial hacia el modelo base congelado (peso 0,5 en el 35% de los batches) y un gate por capacidad que solo guardó el checkpoint si la pérdida media mejoraba y ninguna capacidad individual regresaba más del 2%.

## Capacidades

- Generación de audio de 16 kHz: habla, efectos de sonido, música, ambiente y escenas mixtas combinando varias fuentes.
- Mejora significativa del WER en habla, especialmente en líneas cortas (de 13,9% a 0,0% en líneas de 4 palabras).
- Soporte de prompts estructurados con etiquetas `<|caption|>`, `<|asr|>`, `<|speech|>`, `<|sfx|>`, `<|music|>`, `<|env|>` para controlar el contenido generado.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo de generación de audio, no de texto).
- Capacidades multilingües no documentadas.
- Capacidad especial: generación de audio con control fino de duración y contenido mediante el orden de las etiquetas en el prompt.

## Casos de uso

- Narración de audiolibros: el adaptador produce habla con WER casi nulo, ideal para convertir texto en voz con alta inteligibilidad y naturalidad, incluso en frases cortas.
- Doblaje de vídeo: permite generar diálogos sincronizados con la duración deseada, gracias a la mejora en líneas cortas y la capacidad de controlar la longitud media de los clips.
- Asistentes de voz y sistemas de respuesta hablada: integrable en pipelines de texto-a-voz para generar respuestas claras y sin errores de pronunciación.
- Generación de contenido educativo: creación de lecciones de audio con locución precisa, útil para plataformas de e-learning.
- Pruebas de accesibilidad: generación de audio descriptivo para personas con discapacidad visual, donde la claridad del habla es crítica.
- Evaluación de sistemas de reconocimiento de voz: al generar habla con WER bajo, se puede usar como ground truth para testear ASR, aunque se debe verificar la naturalidad en cada caso.

## Benchmarks y rendimiento

El autor publicó una comparación entre el modelo base y el adaptador usando las mismas semillas y prompts. Los resultados se resumen en la siguiente tabla:

| Capacidad | Métrica | Base | Adaptador | Cambio |
|---|---|---|---|---|
| Habla | WER | 5,6% | 0,0% | -5,6% |
| Efectos | CLAP texto | 0,4148 | 0,5299 | +0,1151 |
| Efectos | CLAP real | 0,4227 | 0,3920 | -0,0306 |
| Música | CLAP texto | 0,3331 | 0,3212 | -0,0119 |
| Música | CLAP real | 0,6323 | 0,6305 | -0,0018 |
| Ambiente | CLAP texto | 0,1993 | 0,1340 | -0,0653 |
| Ambiente | CLAP real | 0,3546 | 0,4003 | +0,0457 |
| Mixto | WER | 15,6% | 0,7% | -14,9% |
| Mixto | CLAP texto | 0,1076 | 0,0505 | -0,0571 |
| Mixto | CLAP real | 0,7155 | 0,7072 | -0,0084 |
| Habla (4 palabras) | WER | 13,9% | 0,0% | -13,9% |
| Habla (9 palabras) | WER | 3,2% | 0,0% | -3,2% |
| Habla (16 palabras) | WER | 1,9% | 0,0% | -1,9% |
| Habla (27 palabras) | WER | 3,4% | 0,0% | -3,4% |

Además, se observaron cambios en la duración media de los clips: la habla se acortó 0,67 s, los efectos se alargaron 1,56 s, la música se acortó 0,24 s, el ambiente se acortó 6,09 s y el mixto se acortó 1,89 s. No se han publicado comparaciones con otros modelos de generación de audio en esta información.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del adaptador.
- El modelo base tiene 2,89 mil millones de parámetros, por lo que en FP16 requiere aproximadamente 5,8 GB de VRAM solo para los pesos, más overhead de activaciones y el adaptador fusionado.
- Se puede ejecutar en GPUs de consumo como RTX 3090, RTX 4090 o superiores con al menos 12 GB de VRAM. Con cuantización (por ejemplo, 8-bit o 4-bit) podría caber en GPUs con 8 GB, aunque no se especifica compatibilidad.
- El despliegue se realiza mediante la librería Transformers con PEFT, cargando el adaptador y fusionándolo con `merge_and_unload()`. No se mencionan opciones como vLLM u Ollama, que están orientadas a modelos de texto.
- La latencia y el throughput dependen de la GPU y de la longitud del audio generado; no hay datos publicados.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de generación de audio en la información proporcionada. El único punto de referencia es el modelo base mispeech/midashenglm-gen, cuyas diferencias se detallan en la sección de benchmarks. Se podría comparar con TangoFlux (mencionado en la model card como referencia de FAD en AudioCaps), pero no se aportan datos suficientes para una tabla comparativa.

## Limitaciones y advertencias

- El adaptador degrada la adherencia al texto y el realismo en escenas no habladas: los efectos de sonido pierden realismo (CLAP real -0,031), la música y el ambiente empeoran en adherencia al texto (-0,012 y -0,065 respectivamente), y el mixto también baja en adherencia (-0,057).
- Los clips no hablados se acortan significativamente (ambiente de 13,5 s a 7,4 s, mixto de 7,3 s a 5,4 s), lo que contradice las instrucciones de continuidad en prompts de escena.
- El orden de las etiquetas en el prompt es crítico: invertir `<|asr|>` y `<|speech|>` produce habla fluida pero no relacionada (WER medio de 373% frente a 14,2% con el orden correcto).
- Riesgo de alucinación auditiva: el modelo puede generar audio que no corresponde al prompt, especialmente en escenas mixtas.
- No se documentan sesgos específicos, pero los datos de entrenamiento (LibriTTS-R y MECAT-Caption) pueden introducir sesgos de acento, género o contexto cultural.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento tienen licencias CC-BY-4.0 y CC-BY-3.0, que requieren atribución. Es responsabilidad del usuario cumplir con estas condiciones.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/ModelsLab/midashenglm-gen-wer-lora
- Modelo base en Hugging Face: https://huggingface.co/mispeech/midashenglm-gen
- Repositorio GitHub del modelo base: https://github.com/xiaomi-research/midashenglm-gen
- Código de entrenamiento (mencionado en la model card): https://github.com/adhikjoshi/audio-scenegen
- Paper de referencia (arXiv:2608.11804, citado en la model card): no se proporciona URL directa, pero se puede buscar por el identificador.
