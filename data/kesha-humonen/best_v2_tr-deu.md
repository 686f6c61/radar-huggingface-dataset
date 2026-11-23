# kesha-humonen/best_v2_tr-deu

## Resumen

El modelo `kesha-humonen/best_v2_tr-deu` es una adaptación de NLLB-200-distilled-600M para la traducción automática de egipcio medio (escrito en transliteración egiptológica) al alemán. Lo desarrolla el usuario independiente kesha-humonen y se enmarca en un proyecto de traducción asistida para egiptología, un dominio con muy pocos recursos paralelos disponibles. El modelo parte de un checkpoint intermedio (`kesha-humonen/tr-eng_checkpoint-8556`) y se ha afinado específicamente para el par `egy_Tnt` (egipcio medio en transliteración) → `deu_Latn` (alemán).

Técnicamente es un transformer encoder-decoder seq2seq de la familia M2M-100/NLLB, con 623.351.808 parámetros totales (aproximadamente 600M, la variante destilada de NLLB-200) y un tokenizador extendido para acomodar los signos de transliteración egiptológica. El modelo está entrenado mediante ajuste supervisado con pérdida de entropía cruzada sobre la referencia, en rondas de 6 épocas con learning rate 1e-5, batch efectivo 64 y semilla 42, seleccionando el checkpoint de menor pérdida de validación en cada ronda.

Su relevancia radica en que cubre un nicho muy específico: la traducción de transliteración egiptológica a una lengua moderna europea, tarea para la que no existen modelos públicos especializados. Los resultados reportados en el conjunto de test estricto (n=4172) con beam search de 4 haces y penalización de repetición 3.0 son chrF++ 67.47 y BLEU 52.41, métricas notables para un dominio de bajos recursos. La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (familia M2M-100 / NLLB-200) |
| Parametros totales | 623.351.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (NLLB-200-distilled-600M; `max_length` de generación configurado a 512 en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar vía transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | alemán (destino, `deu_Latn`); egipcio medio en transliteración egiptológica (origen, `egy_Tnt`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo seq2seq, basado en NLLB-200-distilled-600M, la variante destilada de la familia NLLB-200 (No Language Left Behind) de Meta. Cuenta con 623.351.808 parámetros y un tokenizador extendido respecto al original para representar los signos de transliteración egiptológica. Se usan tokens de idioma explícitos: `egy_Tnt` como token de origen y `deu_Latn` como token de destino forzado en la generación.

El entrenamiento se realizó mediante ajuste supervisado (negative log-likelihood de la referencia) sobre los datos de entrenamiento del split estricto de esta dirección, partiendo del checkpoint `kesha-humonen/tr-eng_checkpoint-8556`. El procedimiento se organizó en rondas de 6 épocas (learning rate 1e-5, batch efectivo 64, semilla 42), donde cada ronda parte del checkpoint con menor pérdida de validación de la ronda anterior, hasta que la pérdida de validación deja de decrecer. El checkpoint publicado corresponde a la ronda 3 (18 épocas), con pérdida de validación 0.7219. No se documentan detalles sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO (no aplicable en un modelo de traducción de este tipo).

## Capacidades

- Traducción automática de egipcio medio en transliteración egiptológica (`egy_Tnt`) a alemán (`deu_Latn`).
- Manejo del tokenizador extendido para signos de transliteración (por ejemplo, caracteres como `ẖ`, `š`, `ṯ`).
- Generación con beam search (4 haces configurados en el ejemplo) y penalización de repetición ajustable (3.0 en la evaluación reportada).
- Generación condicionada por token de idioma forzado (`forced_bos_token_id`), lo que permite controlar la lengua de destino.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio, thinking mode ni otras modalidades.
- Capacidad multilingüe limitada a los pares documentados: origen egipcio medio (transliteración) y destino alemán.

## Casos de uso

- Traducción asistida en investigación egiptológica: el modelo convierte transliteraciones de textos del egipcio medio a alemán, sirviendo como borrador inicial que el egiptólogo revisa y corrige, acelerando la labor de traducción de corpus.
- Digitalización y catalogación de archivos académicos: integrado en pipelines que procesan transliteraciones almacenadas en bases de datos o ficheros de texto para generar versiones en alemán indexables y consultables.
- Herramienta de apoyo docente: en cursos de lengua egipcia media en universidades germanoparlantes, permite a los estudiantes obtener una traducción de referencia rápida para comparar con su propio análisis.
- Publicación bilingüe de material epigráfico: generación de traducciones preliminares al alemán de inscripciones y textos para su inclusión en apéndices o ediciones digitales, con revisión humana posterior.
- Enriquecimiento de corpus paralelos: uso del modelo para generar traducciones automáticas que, tras validación, amplíen los conjuntos de datos paralelos egipcio medio-alemán disponibles para investigación en NLP histórica.
- Preprocesado en proyectos de humanidades digitales: traducción masiva de transliteraciones en bruto a alemán para su análisis posterior con herramientas de procesamiento del lenguaje (búsqueda de términos, análisis de frecuencia, etc.).
- Evaluación comparativa de sistemas de traducción de lenguas históricas: el modelo sirve como referencia especializada frente a sistemas genéricos (NLLB base, modelos multilingües grandes) en el par egipcio medio-alemán.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test de split estricto (n=4172), con beam search de 4 haces y penalización de repetición 3.0:

| Metrica | Valor |
|---|---|
| chrF++ | 67.47 |
| BLEU | 52.41 |
| Pérdida de validación (ronda 3, 18 épocas) | 0.7219 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 2.5 GB solo para pesos, más overhead de activaciones y caché; en la práctica, entre 3 y 4 GB.
- En fp16/bf16: en torno a 1.3-1.5 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe holgadamente en GPU de consumo (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, e incluso GPUs de 4-6 GB en cuantización).
- Opciones de despliegue: transformers (con `AutoModelForSeq2SeqLM`), vLLM (soporte de modelos encoder-decoder limitado, verificar), TGI (verificar soporte de NLLB), llama.cpp/Ollama (requiere conversión a GGUF; no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño del modelo (600M) sugiere inferencia rápida en GPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| kesha-humonen/best_v2_tr-deu | 623M | no disponible | egipcio medio (transliteración) → alemán | cc-by-4.0 | Traducción egiptológica especializada |
| facebook/nllb-200-distilled-600M | 600M | 512 tokens (aprox.) | 200 idiomas | cc-by-nc-4.0 (uso no comercial) | Traducción multilingüe general; no cubre egipcio medio |
| facebook/m2m100_418M | 418M | 1024 tokens (aprox.) | 100 idiomas | MIT | Traducción multilingüe general; no cubre egipcio medio |
| Helsinki-NLP/opus-mt-de-en | ~77M | 512 tokens (aprox.) | alemán-inglés | cc-by-4.0 | Traducción bidireccional de pares europeos; no cubre egipcio medio |

La comparativa con NLLB-200-distilled-600M es la más directa: el modelo de kesha-humonen parte de esa arquitectura y añade el tokenizador extendido y el ajuste fino para el par egipcio medio-alemán. La licencia CC-BY-4.0 del modelo afinado es más permisiva para uso comercial que la CC-BY-NC-4.0 del NLLB original de Meta, un punto relevante para proyectos con fines lucrativos.

## Limitaciones y advertencias

- Dominio muy restringido: solo traduce de egipcio medio en transliteración egiptológica a alemán; no es un modelo multilingüe de propósito general.
- Sesgos de dominio: el corpus de entrenamiento es presumiblemente pequeño y de un subconjunto de textos; el modelo puede sobrerrepresentar ciertos géneros (por ejemplo, textos religiosos o funerarios) y fallar en otros.
- Riesgo de alucinación: como todo modelo seq2seq, puede generar traducciones plausibles pero incorrectas, especialmente en pasajes con transliteraciones ambiguas o dañadas; requiere revisión por un experto.
- Dependencia del tokenizador extendido: el uso correcto exige cargar el tokenizador del propio repositorio y fijar los tokens `egy_Tnt` y `deu_Latn`; un uso incorrecto produce salidas degradadas.
- Longitud de contexto no documentada explícitamente; el ejemplo de uso fija `max_length=512`, lo que sugiere ese límite práctico para la generación.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo base NLLB-200 tiene licencia CC-BY-NC-4.0; conviene verificar la compatibilidad de licencias si se usa comercialmente, dado que el modelo derivado se distribuye bajo CC-BY-4.0.
- Sin datos de benchmarks comparativos ni evaluación independiente; las métricas reportadas provienen del propio autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por la comunidad.
- No se documentan mecanismos de seguridad, filtrado de contenido ni evaluación de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kesha-humonen/best_v2_tr-deu
- Modelo base del ajuste fino: https://huggingface.co/kesha-humonen/tr-eng_checkpoint-8556
- NLLB-200-distilled-600M (arquitectura de partida): https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Paper M2M-100: https://arxiv.org/abs/2010.11125
