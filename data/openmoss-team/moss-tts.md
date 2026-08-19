# OpenMOSS-Team/MOSS-TTS

## Resumen

MOSS-TTS es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por el equipo OpenMOSS en colaboración con MOSI.AI. Forma parte de la familia MOSS-TTS, un conjunto de modelos orientados a la generación de voz y sonido de alta fidelidad y expresividad para escenarios reales, que incluye además variantes para diálogo, diseño de voces, síntesis en tiempo real y efectos de sonido. Este modelo concreto, MOSS-TTS, es el buque insignia de la familia y está diseñado para producción, con capacidades como clonación de voz zero-shot, generación de voz larga y control fino sobre pinyin, fonemas y duración.

Con 8.489.841.664 parámetros (aproximadamente 8,5 mil millones), MOSS-TTS emplea una arquitectura denominada MossTTSDelay, basada en predicción RVQ paralela con programación de retardo (delay-pattern scheduling). Soporta 20 idiomas, incluidos chino, inglés, español, francés, alemán, japonés y otros, y se distribuye bajo licencia Apache 2.0. Su relevancia actual radica en que aborda problemas comunes en TTS como la estabilidad en textos largos, la precisión de pronunciación y el cambio de estilo entre contenidos, manteniendo una calidad de audio alta y una latencia adecuada para despliegues reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossTTSDelay (multi-head parallel RVQ prediction con delay-pattern scheduling) |
| Parametros totales | 8.489.841.664 (8,5 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr (20 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MOSS-TTS utiliza la arquitectura MossTTSDelay, que se basa en la predicción paralela de múltiples cabezas de cuantización residual vectorial (RVQ) con una programación de retardo. Este mecanismo permite equilibrar la estabilidad en contextos largos, la velocidad de inferencia y la preparación para producción, según la documentación oficial. La arquitectura está pensada para manejar entradas de texto y generar secuencias de códecs de audio, con un enfoque en la coherencia a lo largo de decenas de minutos de habla.

No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de alineación como RLHF o DPO. La información disponible indica que el modelo se entrenó como parte de un sistema unificado con otros miembros de la familia (MossTTSLocal y MossTTSRealtime), pero no se proporcionan cifras concretas sobre el volumen de datos ni la composición del corpus.

## Capacidades

- Generación de voz de alta fidelidad con clonación de voz zero-shot, sin necesidad de muestras de referencia extensas.
- Síntesis de habla larga (long-form speech) con estabilidad durante decenas de minutos, evitando degradaciones de calidad o pérdida de coherencia.
- Control fino sobre la pronunciación mediante pinyin y fonemas, así como sobre la duración de los segmentos.
- Soporte multilingüe y de cambio de código (code-switching), lo que permite alternar entre idiomas dentro de una misma frase.
- Expresividad y variación de estilo, adaptándose al contenido del texto.
- Integración con otros modelos de la familia para tareas más complejas, como diálogo multi-hablante (MOSS-TTSD), diseño de voces (MOSS-VoiceGenerator), síntesis en tiempo real (MOSS-TTS-Realtime) y efectos de sonido (MOSS-SoundEffect), aunque estas capacidades corresponden a modelos separados.

## Casos de uso

- Narración de audiolibros y podcasts: el modelo puede generar voz continua y estable durante largos períodos, manteniendo un tono natural y expresivo, ideal para producir contenido de audio extenso sin cortes ni degradación.
- Asistentes de voz y agentes conversacionales: combinado con un modelo de lenguaje, MOSS-TTS puede sintetizar respuestas en tiempo real con baja latencia (el modelo hermano MOSS-TTS-Realtime alcanza un TTFB de 180 ms), aunque este caso se cubre mejor con la variante Realtime.
- Doblaje y localización de contenido audiovisual: su soporte multilingüe y de code-switching permite generar voces en varios idiomas con coherencia, útil para doblar vídeos, series o cursos.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con opciones de control de pronunciación para nombres propios o términos técnicos.
- Creación de contenido educativo: generación de material de audio para e-learning, con la posibilidad de ajustar la duración y el énfasis de ciertas frases mediante el control de fonemas y pinyin.
- Clonación de voz para aplicaciones personalizadas: gracias a la clonación zero-shot, se puede replicar la voz de un usuario con una muestra breve, útil en asistentes personalizados o sistemas de identificación de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación menciona que MOSS-TTSD (modelo hermano) superó a modelos propietarios como Doubao y Gemini 2.5-pro en evaluaciones subjetivas, y que MOSS-VoiceGenerator supera a otros modelos de diseño de voz en ratings de arena, pero no se ofrecen métricas numéricas concretas para MOSS-TTS en tareas estándar como MMLU, HumanEval o GSM8K (que no aplican a TTS). Tampoco se incluyen mediciones objetivas de calidad de audio (p. ej., MOS) en la información proporcionada.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de VRAM para inferencia.
- El tamaño de los pesos en safetensors es de aproximadamente 17 GB, lo que sugiere que una GPU con al menos 24 GB de memoria (por ejemplo, RTX 4090, A100 40 GB) sería necesaria para cargar el modelo en precisión FP16, aunque esta es una estimación orientativa y no un dato oficial.
- No se especifican GPUs recomendadas ni opciones de despliegue concretas (vLLM, llama.cpp, etc.).
- Dado que es un modelo de TTS, podría ejecutarse en servidores con aceleración GPU, pero se recomienda consultar la documentación del proyecto en GitHub para obtener directrices actualizadas.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de síntesis de voz en la información proporcionada. Aunque existen alternativas de código abierto como VITS, Tacotron 2 o Bark, no se han facilitado datos objetivos (calidad de audio, latencia, tamaño) que permitan una comparación rigurosa. La documentación de MOSS-TTS menciona que su familia supera a modelos propietarios en ciertas evaluaciones subjetivas, pero sin cifras concretas.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero como modelo entrenado con datos web, podría reflejar sesgos presentes en los corpus de habla.
- Riesgo de alucinación en la pronunciación de nombres propios o términos poco frecuentes, a pesar del control de pinyin y fonemas.
- La longitud de contexto no está especificada; aunque el modelo está diseñado para habla larga, no se conoce el límite exacto de tokens de entrada.
- La licencia Apache 2.0 permite uso comercial, pero se deben revisar los términos de la documentación del proyecto para posibles restricciones adicionales.
- Para producción, es recomendable validar la calidad de la síntesis en el idioma y dominio específicos, ya que el rendimiento puede variar entre los 20 idiomas soportados.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTS
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-TTS
- Paper arXiv: https://arxiv.org/abs/2603.18090
- Colección en ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Blog de MOSI: https://mosi.cn/#models
- Demo en AIStudio: https://studio.mosi.cn
- Documentación de API: https://studio.mosi.cn/docs/moss-tts
