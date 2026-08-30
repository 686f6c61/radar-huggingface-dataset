# Ansu/whisper-medium-basque

## Resumen

El modelo `Ansu/whisper-medium-basque` es un ajuste fino (fine-tune) del modelo Whisper medium de OpenAI, especializado en el reconocimiento automático de voz (ASR) para el euskera. Ha sido desarrollado por el usuario Ansu y publicado en Hugging Face. Su objetivo es mejorar la precisión de transcripción en euskera, un idioma con pocos recursos disponibles en el ecosistema de modelos de voz.

Con 763.857.920 parámetros, se sitúa en la gama media de la familia Whisper, lo que ofrece un equilibrio entre precisión y requisitos de cómputo. El repositorio contiene pesos en formato safetensors y ocupa 12,2 GB, lo que sugiere que se incluyen múltiples variantes de cuantización o pesos en precisión completa. La fecha de creación (agosto de 2026) indica que es un modelo reciente, aunque no se han publicado detalles sobre el dataset de entrenamiento ni la metodología empleada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (Transformer encoder-decoder) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas de 30 segundos de audio) |
| Tipos de cuantizacion | no disponible (se infiere que incluye safetensors, posiblemente fp32/fp16) |
| Idiomas soportados | Euskera (presumiblemente, por el nombre del modelo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder entrenado para transcribir audio a texto. Whisper medium originalmente fue preentrenado con 680.000 horas de audio multilingüe, pero este fine-tune se ha adaptado específicamente al euskera. No se dispone de información sobre el dataset de entrenamiento, el número de pasos, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detalla si se congelaron capas o se usó una tasa de aprendizaje específica, aunque existe una variante en el mismo repositorio (`whisper-medium-basque-lr1e-5-freezeFalse`) que sugiere experimentos con tasa de aprendizaje 1e-5 y sin congelación de capas.

## Capacidades

- Transcripción de audio en euskera: el modelo está diseñado para convertir voz en texto en este idioma.
- Reconocimiento de voz robusto: hereda las capacidades generales de Whisper para manejar ruido, acentos y variaciones de habla.
- Posible soporte de traducción: Whisper original incluye capacidades de traducción a inglés, pero no se confirma si este fine-tune las conserva.
- Sin soporte de tool calling ni agentes: al ser un modelo de ASR, no está diseñado para razonamiento o interacción con herramientas.
- Multilingüismo limitado: aunque Whisper base es multilingüe, este ajuste se centra en euskera; el rendimiento en otros idiomas no está documentado.

## Casos de uso

- Transcripción de reuniones y conferencias en euskera: el modelo puede convertir grabaciones de audio en actas escritas, facilitando el archivo y la búsqueda de contenido.
- Subtitulado automático de vídeos en euskera: integrable en pipelines de generación de subtítulos para plataformas de vídeo, mejorando la accesibilidad.
- Asistentes de voz en euskera: puede servir como backend de reconocimiento de voz para aplicaciones de dictado o control por voz en este idioma.
- Análisis de llamadas de atención al cliente: transcripción de interacciones telefónicas en euskera para su posterior análisis de calidad o extracción de información.
- Archivo de patrimonio oral: digitalización y transcripción de grabaciones históricas o entrevistas en euskera para preservación y estudio.
- Herramientas educativas: transcripción de clases o material didáctico en euskera para generar apuntes o recursos de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER (Word Error Rate) o comparativas con otros modelos de ASR en euskera.

## Requisitos de hardware

- VRAM estimada: para inferencia en fp16, Whisper medium requiere aproximadamente 5-6 GB de VRAM. Con pesos en fp32, la demanda puede superar los 10 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3060, RTX 3070, RTX 4060 o superiores. Para despliegue en producción, una A10 o A100 sería adecuada.
- Compatibilidad con GPU de consumo: sí, siempre que se use cuantización (por ejemplo, int8) o se opte por versiones optimizadas.
- Opciones de despliegue: puede ejecutarse con librerías como `transformers` de Hugging Face, `faster-whisper`, `whisper.cpp` (si se convierte a GGUF) o `vLLM` (aunque vLLM está más orientado a LLM que a ASR).
- Latencia y throughput: no se han publicado mediciones específicas. En una GPU moderna, la transcripción de un audio de 30 segundos suele tomar menos de 2 segundos en tiempo real, pero depende de la implementación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de ASR en euskera. Existen otros fine-tunes de Whisper para euskera en Hugging Face (por ejemplo, `Ansu/whisper-small-basque`), pero no se han publicado métricas que permitan una comparación objetiva. Tampoco se conocen alternativas comerciales o de código abierto específicas para este idioma con las que contrastar.

## Limitaciones y advertencias

- Sesgos del dataset: al ser un fine-tune, el rendimiento depende en gran medida de la calidad y representatividad del dataset de entrenamiento, que no se ha documentado. Puede tener un rendimiento deficiente en acentos o dialectos no representados.
- Riesgo de alucinación: como todos los modelos de ASR, puede generar texto que no corresponde al audio, especialmente en condiciones de ruido o habla solapada.
- Limitaciones de contexto: Whisper procesa ventanas de 30 segundos de audio; no maneja contextos más largos de forma nativa, aunque se pueden concatenar segmentos.
- Licencia no especificada: el repositorio no indica licencia, lo que impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con Ansu antes de utilizarlo en producción.
- Idiomas: aunque el modelo se centra en euskera, no se ha verificado su rendimiento en otros idiomas; es probable que degrade significativamente fuera de su dominio.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ansu/whisper-medium-basque)
- [Variante con tasa de aprendizaje 1e-5 y sin congelación](https://huggingface.co/Ansu/whisper-medium-basque-lr1e-5-freezeFalse)
- [Modelo whisper-small-basque del mismo autor](https://huggingface.co/Ansu/whisper-small-basque)
- [Repositorio oficial de Whisper (OpenAI)](https://github.com/openai/whisper)
- [Guía de tamaños de modelos Whisper](https://openwhispr.com/blog/whisper-model-sizes-explained)
