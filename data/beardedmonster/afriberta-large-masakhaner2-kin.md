# BeardedMonster/afriberta-large-masakhaner2-kin

## Resumen

`BeardedMonster/afriberta-large-masakhaner2-kin` es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido al hacer fine-tuning del modelo encoder `castorini/afriberta_large` sobre el subconjunto de kinyarwanda (`kin`) del corpus MasakhaNER 2.0. Lo publica el usuario BeardedMonster como parte del harness de benchmark de su proyecto, que reproduce los resultados publicados de MasakhaNER 2.0 con una desviación de aproximadamente 0,25 F1, de modo que las cifras que reporta están calibradas contra la referencia y no son cifras ad hoc.

El modelo es un encoder transformer de tipo XLM-RoBERTa con 125.047.305 parámetros (aproximadamente 125 M), especializado en una única tarea: etiquetar secuencias de texto en kinyarwanda con las categorías de entidad del esquema de MasakhaNER 2.0. No es un modelo generativo, no conversa, no escribe código y no razona en múltiples pasos; su utilidad es la extracción de entidades en un idioma africano de bajos recursos, donde la mayoría de los modelos multilingües genéricos rinden claramente peor.

Su relevancia es doble: por un lado, ofrece un punto de partida listo para usar (`id2label` configurado, pesos en safetensors) para pipelines de extracción de información en kinyarwanda; por otro, su valor como referencia es limitado de momento, ya que el repositorio no tiene descargas ni interacciones y la licencia no está declarada en los metadatos, lo que obliga a remitirse a los términos del modelo base antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa (tag `xlm-roberta`), cabeza de clasificación de tokens |
| Parámetros totales | 125.047.305 (dato real de los pesos safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens según la arquitectura XLM-RoBERTa del modelo base (no confirmado en la información proporcionada); el fine-tuning se ejecutó con `max_length` 256 |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas); al ser un encoder de 125 M, es convertible a ONNX/INT8 sin dificultad |
| Idiomas soportados | Kinyarwanda (`kin`) como idioma de fine-tuning; el modelo base se entrenó sobre lenguas africanas |
| Licencia | No disponible en los metadatos; rige la licencia y términos de `castorini/afriberta_large` |
| Formato de pesos | safetensors (tamaño del repositorio: 0,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer bidireccional estilo XLM-RoBERTa con 125 M de parámetros, es decir, un modelo compacto pensado para extracción de características y tareas de clasificación, no para generación autoregresiva. Sobre ese encoder se añade una cabeza de clasificación de tokens (`AutoModelForTokenClassification`) con `id2label` preconfigurado, de forma que las predicciones se decodifican directamente a nombres de etiqueta sin postproceso adicional.

El entrenamiento consiste en un fine-tuning supervisado sobre el protocolo `kin` de MasakhaNER 2.0: 50 épocas, tasa de aprendizaje 5e-5, tamaño de lote 32 y longitud máxima de secuencia 256 tokens. No se documenta en la información disponible el volumen de tokens del corpus de ajuste, la composición exacta del dataset ni si hubo etapas de preferencia (RLHF/DPO), algo que en un modelo de NER carece de sentido. La métrica objetivo declarada es `span_f1`, con una puntuación media de 0,8317 para el único idioma entrenado. El autor advierte de que las cifras provienen de una sola ejecución, mientras que los artículos de referencia promedian cinco, por lo que diferencias pequeñas deben tratarse como ruido.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en kinyarwanda: etiquetado a nivel de span sobre el esquema de MasakhaNER 2.0 (personas, organizaciones, localizaciones y fechas, según el esquema estándar del corpus).
- Clasificación de tokens a nivel de token, con decodificación directa de etiquetas mediante `id2label`.
- Procesamiento por lotes de sentencias de hasta 256 tokens en el régimen de entrenamiento (hasta 512 según la arquitectura subyacente).
- Reutilización como extractor de características o base para fine-tuning de otras tareas de secuencia en kinyarwanda.
- No soporta tool calling ni function calling: no es un modelo instructivo ni generativo.
- No soporta razonamiento multi-paso, modo thinking, visión ni audio.
- Capacidad multilingüe limitada al kinyarwanda: no hay evidencia de rendimiento en otras lenguas, ni siquiera en las del modelo base.

## Casos de uso

- Extracción de entidades en medios de comunicación ruandeses: pasar artículos por el pipeline de token classification para poblar una base de datos de personas, organizaciones y lugares mencionados, con revisión humana de los spans de baja confianza.
- Monitorización de medios y alertas de reputación: detectar menciones de una organización concreta y de sus directivos en texto en kinyarwanda para alimentar un panel de seguimiento.
- Anotación asistida de corpus: usar las predicciones como preanotación en herramientas tipo Label Studio o Prodigy y reducir el coste de anotación manual de nuevos lotes en kinyarwanda.
- Indexación y búsqueda semántica en archivos documentales: enriquecer documentos con entidades etiquetadas para permitir búsquedas filtradas por persona, lugar u organización en una colección que de otro modo sería texto plano.
- Detección de datos personales: localizar nombres de personas y lugares en textos antes de publicarlos o compartirlos, como primer paso de un proceso de anonimización con verificación posterior.
- Construcción de grafos de conocimiento y extracción de relaciones: servir de etapa NER en un pipeline mayor (NER → resolución de entidades → extracción de relaciones) para dominio periodístico, académico o de ONG en Ruanda.
- Investigación en procesamiento de lenguas africanas: usar el checkpoint como línea base reproducible (span_f1 0,8317 en `kin`) para comparar con XLM-R, mBERT o AfroXLMR en experimentos de NER de bajos recursos.

## Benchmarks y rendimiento

| Benchmark | Idioma | Métrica | Resultado | Configuración |
|---|---|---|---|---|
| MasakhaNER 2.0 (`kin`) | Kinyarwanda | span_f1 (media) | 0,8317 | 50 épocas, lr 5e-5, batch 32, max_length 256, ejecución única |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de comparativas numéricas frente a otros checkpoints de MasakhaNER 2.0. El autor indica que su harness reproduce las líneas base publicadas con una tolerancia de ±0,25 F1, pero no incluye esas cifras de referencia en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, unos 0,5 GB de pesos más activaciones (por debajo de 2 GB en lotes moderados); en FP16, unos 0,25 GB; en INT8, unos 0,13 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más es suficiente (RTX 3050/3060, GTX 1650, T4). Para lotes grandes, A10G, L4 o A100 no aportan ventaja significativa porque el cuello de botella es el preprocesado, no la matriz de pesos.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU con ONNX Runtime es viable para volúmenes pequeños o medios.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), exportación a ONNX Runtime, TorchScript o `optimum`; integración como servicio HTTP con FastAPI. Herramientas de servido generativo como vLLM o TGI no aplican a un encoder de clasificación.
- Latencia y throughput: no disponibles como dato medido. Cualitativamente, al tratarse de un encoder de 125 M con secuencias de 256 tokens, el rendimiento por GPU es alto y el coste dominante suele ser la tokenización y el postproceso de spans.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea / idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BeardedMonster/afriberta-large-masakhaner2-kin` | 125 M | 512 tokens (arquitectura) | NER en kinyarwanda | No disponible (rige la del base) | HuggingFace, 0 descargas |
| `castorini/afriberta_large` (modelo base) | 125 M | 512 tokens (arquitectura) | Modelo de lengua africana sin ajuste a NER | No disponible en la información proporcionada | HuggingFace |
| XLM-RoBERTa base ajustado a MasakhaNER 2.0 | 278 M (dato de la familia XLM-R, no verificado en esta información) | 512 tokens | NER multilingüe | No disponible en la información proporcionada | Requiere fine-tuning propio |
| mBERT ajustado a MasakhaNER 2.0 | 178 M (dato de la familia, no verificado en esta información) | 512 tokens | NER multilingüe | No disponible en la información proporcionada | Requiere fine-tuning propio |

No se dispone de cifras comparativas de span_f1 frente a estas alternativas en la información proporcionada; cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Cobertura monolingüe: solo se ha ajustado y evaluado en kinyarwanda; no hay garantía de comportamiento en otras lenguas africanas pese a la naturaleza multilingüe del modelo base.
- Tarea única: es un clasificador de tokens, no genera texto; no puede usarse para resumen, traducción, diálogo ni código.
- Resultados de una sola ejecución: el propio autor advierte que las líneas base publicadas promedian cinco ejecuciones, por lo que diferencias pequeñas de F1 no deben interpretarse como mejoras reales.
- Licencia indeterminada: los metadatos no declaran licencia y la model card remite a los términos de `castorini/afriberta_large`. Antes de un uso comercial es obligatorio revisar la licencia del modelo base.
- Riesgo de sesgo de dominio: el corpus MasakhaNER 2.0 procede de textos periodísticos; el rendimiento puede degradarse en dominios como literatura, transcripciones orales, lenguaje informal o redes sociales.
- Riesgo de error en fronteras de span: los fallos típicos de NER (entidades anidadas, spans parciales, entidades no vistas) se trasladan directamente al consumidor del modelo; conviene umbralizar por confianza.
- Sin señal de adopción: el repositorio registra 0 descargas y 0 interacciones en el momento de la consulta, por lo que no existe validación externa de su comportamiento.
- Alucinación en sentido generativo no aplica; el riesgo equivalente es la asignación de etiquetas espuria en texto sin entidades, que debe filtrarse en producción.
- Fecha de creación del repositorio (2026-10-18) posterior a la mayoría de referencias del ecosistema: conviene verificar si el checkpoint se mantiene o se ha reemplazado por una versión posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/afriberta-large-masakhaner2-kin
- Modelo base: https://huggingface.co/castorini/afriberta_large

No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
