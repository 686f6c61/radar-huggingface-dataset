# kesha-humonen/best_v2_hi-deu

## Resumen

`kesha-humonen/best_v2_hi-deu` es un modelo de traducción automática neuronal derivado de NLLB-200-distilled-600M, especializado en la traducción de egipcio medio escrito en jeroglíficos Unicode (token de origen `egy_Hiero`) hacia alemán (token de destino `deu_Latn`). Lo desarrolla el usuario kesha-humonen en el contexto de un proyecto de investigación sobre egiptología computacional, y parte de un checkpoint intermedio (`kesha-humonen/tr-eng_checkpoint-8556`) afinado mediante aprendizaje supervisado con pérdida de verosimilitud negativa sobre el corpus de entrenamiento de esta dirección lingüística.

El modelo resuelve un problema muy específico: la traducción automática de una lengua muerta con alfabeto no latino y recursos escasos. Al reutilizar la arquitectura seq2seq de NLLB (transformer encoder-decoder) y ampliar el tokenizador para acomodar los jeroglíficos codificados en Unicode, permite procesar directamente texto hieroglífico sin transcripción manual intermedia. El checkpoint publicado corresponde a la ronda 3 de entrenamiento (18 épocas), con una pérdida de validación de 0,7716.

Con 623 millones de parámetros y un tamaño de repositorio de 2,5 GB, es un modelo compacto que puede ejecutarse en hardware modesto, lo que lo hace relevante para investigadores que trabajan con corpus egipcios y necesitan un traductor local sin depender de servicios en la nube. Su licencia CC-BY-4.0 facilita su reutilización citando la autoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200-distilled-600M) |
| Parámetros totales | 623.351.808 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de generación configurado a 512 en el ejemplo de uso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | alemán (destino `deu_Latn`); origen `egy_Hiero` (egipcio medio en jeroglíficos Unicode) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en NLLB-200-distilled-600M, una arquitectura transformer encoder-decoder con tokenizador multilingüe SentencePiece. El autor ha extendido el tokenizador para incorporar los jeroglíficos Unicode del egipcio medio como token de origen (`egy_Hiero`), manteniendo alemán como destino (`deu_Latn`). El entrenamiento parte del checkpoint `kesha-humonen/tr-eng_checkpoint-8556` y aplica fine-tuning supervisado con pérdida de log-verosimilitud negativa sobre los datos de entrenamiento de esta dirección, usando el split estricto (strict-split) del corpus.

La configuración de entrenamiento se organiza en rondas de 6 épocas con tasa de aprendizaje 1e-5, tamaño de lote efectivo 64 y semilla 42. Cada ronda arranca desde el checkpoint con la menor pérdida de validación de la ronda anterior, deteniéndose cuando la validación deja de mejorar. El checkpoint publicado es la ronda 3 (18 épocas totales), con pérdida de validación 0,7716. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción directa de egipcio medio en jeroglíficos Unicode a alemán, sin paso intermedio de transliteración.
- Generación de texto seq2seq con decodificación por beam search (4 beams en la configuración de referencia).
- Manejo de repetición mediante `repetition_penalty` configurable (3,0 en la evaluación publicada).
- Soporte multilingüe limitado a la pareja `egy_Hiero` → `deu_Latn`; el modelo base NLLB conserva capacidades multilingües pero este checkpoint está afinado para una única dirección.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Digitalización y traducción de corpus egipcios: el modelo procesa directamente texto hieroglífico en Unicode, lo que permite integrarlo en pipelines de transcripción y traducción de inscripciones sin necesidad de transliteración manual previa.
- Investigación en egiptología computacional: sirve como línea base reproducible para experimentos de traducción de lenguas muertas, con métricas publicadas (chrF++ 59,07 y BLEU 46,33 sobre 1.908 muestras de test) que permiten comparaciones rigurosas.
- Asistencia a traducción académica: un investigador puede generar una primera versión en alemán de un pasaje jeroglífico y revisarla manualmente, acelerando el trabajo sobre textos extensos.
- Herramientas de catalogación museística: para describir piezas con inscripciones en egipcio medio, el modelo puede producir borradores de descripción en alemán que luego se curan.
- Enseñanza de egiptología: apoyo a estudiantes germanoparlantes para contrastar sus propias traducciones con una salida automática, usando beam search y penalización de repetición para reducir artefactos.
- Despliegue local en entornos con recursos limitados: con 623 M de parámetros y 2,5 GB de pesos, puede ejecutarse en una GPU de consumo o incluso en CPU para lotes pequeños, sin depender de APIs externas.
- Procesamiento por lotes de archivos arqueológicos: al ser un modelo seq2seq compacto, permite traducir grandes volúmenes de transcripciones en Unicode en un servidor modesto con `transformers` o `vLLM`.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Configuración | Resultado |
|---|---|---|---|
| chrF++ | strict-split test (n=1908) | beam search 4, repetition penalty 3,0 | 59,07 |
| BLEU | strict-split test (n=1908) | beam search 4, repetition penalty 3,0 | 46,33 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en fp32 para los pesos (623 M parámetros); en fp16 o bf16 bajaría a unos 1,3-1,5 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32, como RTX 3050, RTX 3060, RTX 4060, T4 o superiores; A100/H100 no son necesarias por el tamaño reducido.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas con 4 GB o más; también puede ejecutarse en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (soporte nativo documentado); `vLLM`, `TGI` y `llama.cpp` no están documentados para esta arquitectura en la información disponible; Ollama no es aplicable directamente por el formato safetensors y la arquitectura seq2seq.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kesha-humonen/best_v2_hi-deu | 623 M | no disponible | egy_Hiero → deu_Latn | CC-BY-4.0 | Hugging Face |
| facebook/nllb-200-distilled-600M | 615 M | 512 tokens (aprox.) | 200 idiomas | CC-BY-NC-4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-de-en | ~77 M | 512 tokens (aprox.) | de ↔ en | CC-BY-4.0 | Hugging Face |

El modelo comparte arquitectura y escala con NLLB-200-distilled-600M, pero se diferencia por el tokenizador extendido para jeroglíficos y por estar afinado exclusivamente para egipcio medio → alemán. Frente a modelos de traducción genéricos como OPUS-MT, cubre un par lingüístico que ninguno de ellos soporta. No se dispone de comparaciones de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus de egiptología, puede reflejar el sesgo de las traducciones de referencia del dataset (posible estilo académico homogéneo).
- Riesgo de alucinación: inherente a los modelos seq2seq de traducción; con beam search y penalización de repetición 3,0 se mitiga parcialmente, pero no se elimina.
- Limitaciones de contexto o idioma: el modelo solo traduce en la dirección `egy_Hiero` → `deu_Latn`; no se documenta su comportamiento en otras direcciones ni con otros idiomas, pese a heredar el tokenizador multilingüe de NLLB.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial citando autoría; conviene verificar que el checkpoint base `kesha-humonen/tr-eng_checkpoint-8556` y NLLB-200-distilled-600M (CC-BY-NC-4.0) no impongan restricciones adicionales no documentadas.
- Caveats para producción: no hay datos de latencia, throughput ni robustez fuera del dominio; el modelo está afinado sobre un split estricto de un corpus concreto, por lo que su generalización a otros estilos de inscripción es incierta.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El nombre del repositorio (`best_v2_hi-deu`) sugiere una pareja hi→deu, pero la model card documenta egipcio medio en jeroglíficos → alemán; conviene contrastar esta discrepancia antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kesha-humonen/best_v2_hi-deu
- Checkpoint base: https://huggingface.co/kesha-humonen/tr-eng_checkpoint-8556
- Modelo original NLLB-200-distilled-600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
