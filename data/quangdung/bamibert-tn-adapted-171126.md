# quangdung/bamibert-tn-adapted-171126

## Resumen

BamiBERT-TN es un modelo de lenguaje enmascarado (masked language model) para vietnamita, construido sobre una arquitectura RoBERTa-base y adaptado por el usuario quangdung para una tarea muy concreta: puntuar candidatos de normalización de texto en el front-end de un sistema TTS (text-to-speech). No es un modelo generativo de propósito general, sino un componente especializado que decide, entre varias lecturas posibles de un mismo texto, cuál es la más natural según el contexto.

El problema que resuelve es recurrente en pipelines TTS: expresiones ambiguas como `9/10`, `20/10`, `3/4`, `2:30`, `MB` o `2k5` admiten lecturas distintas según el contexto (una fecha, una fracción, una hora, un acrónimo bancario o una unidad de almacenamiento). Las reglas G2E/G2P tradicionales no desambiguan bien. BamiBERT-TN emplea Pseudo-Log-Likelihood (PLL): enmascara cada token de una frase candidata y mide la probabilidad de reconstruirlo en contexto, sumando los log-probabilidades. La candidata con mayor PLL se selecciona como lectura correcta.

Con unos 103 millones de parámetros, 12 capas, hidden size 768, 12 cabezas de atención y un vocabulario de 20.481 tokens, el modelo es ligero y desplegable en CPU o GPU consumer. Su relevancia actual radica en que ofrece una alternativa sensible al contexto frente a la normalización basada en reglas, con un diseño de inferencia por lotes pensado explícitamente para reducir el coste del PLL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (`RobertaForMaskedLM`) |
| Parametros totales | 102.993.666 (~103M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.050 posiciones máximas (`max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; admite cuantización estándar de transformers/GGUF no documentada por el autor) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | other (sin detalle de términos en la información disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo RoBERTa-base con 12 capas, hidden size de 768, 12 cabezas de atención y vocabulario WordPiece de 20.481 tokens. Se publica en float32 y emplea los tokens especiales `<s>`, `</s>`, `<pad>`, `<mask>` y `<unk>`. La tarea de cabecera es `fill-mask` (masked language modeling), lo que permite puntuar frases candidatas mediante PLL sin necesidad de una cabeza adicional.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (en un modelo masked LM no serían el mecanismo habitual). El autor indica que el modelo es una adaptación de un BamiBERT base para la tarea de puntuación de candidatos de normalización de texto. La innovación técnica destacable no está en la arquitectura, sino en el procedimiento de inferencia: el cálculo de PLL se vectoriza por lotes en tres niveles (múltiples posiciones enmascaradas de una misma frase en un solo forward pass, agrupación de todos los pares candidata-posición en un único flujo de trabajos, y ordenación por longitud descendente para minimizar el padding). Con ello, una frase de 40 tokens con `batch_size=64` requiere un solo forward pass en lugar de 40.

## Capacidades

- Puntuación de candidatos de normalización de texto mediante Pseudo-Log-Likelihood (PLL).
- Desambiguación sensible al contexto de expresiones numéricas, fechas, fracciones, horas, acrónimos y unidades (por ejemplo `9/10`, `20/10`, `3/4`, `10:2`, `2:30`, `MB`, `2k5`, `3-1`).
- Relleno de máscaras (`fill-mask`) sobre texto vietnamita.
- Inferencia por lotes optimizada para calcular PLL de varias candidatas en un único flujo de forward passes.
- Cálculo de perplejidad (PPL) derivada del PLL como métrica auxiliar.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al vietnamita.

## Casos de uso

- Normalización de texto para TTS: el modelo puntúa las lecturas candidatas de expresiones ambiguas y selecciona la más probable según el contexto, integrándose como scorer en el front-end del pipeline antes de la síntesis.
- Desambiguación de fechas y fracciones: en un mismo documento, `20/10` puede leerse como "veinte de octubre" o "veinte partido por diez"; el PLL contextual resuelve el caso sin reglas ad hoc.
- Lectura de horas y operaciones matemáticas: expresiones como `2:30` o `10:2` se resuelven como hora o división según la frase circundante, algo que las reglas G2E/G2P no distinguen.
- Expansión de acrónimos y unidades: `MB` como "banco" o como "megabyte" se decide por contexto, útil en asistentes de lectura y accesibilidad.
- Normalización de cantidades y años: `2k5` como año de nacimiento o como cantidad se resuelve con la misma lógica de puntuación.
- Verificación de candidatas en pipelines de preprocesado: el PPL calculado sirve como señal de calidad para filtrar normalizaciones dudosas antes de enviarlas al sintetizador.
- Evaluación de sistemas de normalización: el scorer permite comparar automáticamente variantes de un normalizador basado en reglas frente a alternativas neuronales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 0,4 GB para los pesos (102.993.666 parámetros × 4 bytes), más overhead de activaciones y del lote.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090 y similares; también funciona en CPU para volúmenes moderados.
- GPU de datacenter (A100, H100) no necesarias para este tamaño, salvo para procesamiento masivo en lote.
- Despliegue mediante `transformers` con `AutoModelForMaskedLM` y `AutoTokenizer`; el modelo está marcado como `endpoints_compatible`.
- El autor documenta una estrategia de batching en tres niveles para reducir el número de forward passes; no se proporcionan cifras de latencia ni throughput medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BamiBERT-TN (este modelo) | ~103M | 2.050 posiciones | PLL scorer para normalización TTS en vietnamita | other | Hugging Face |
| BamiBERT base | no disponible | no disponible | Masked LM en vietnamita | no disponible | no disponible en la informacion |
| PhoBERT-base | no disponible | no disponible | Masked LM en vietnamita | no disponible | no disponible en la informacion |
| XLM-RoBERTa-base | no disponible | no disponible | Masked LM multilingüe | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a la categoría (masked LM para vietnamita) y no a resultados medidos.

## Limitaciones y advertencias

- Modelo especializado: no es adecuado para generación de texto libre, diálogo, código ni razonamiento; su uso previsto es la puntuación PLL de candidatas.
- Solo vietnamita: no soporta castellano ni otros idiomas.
- Licencia "other" sin términos detallados en la información disponible; es imprescindible revisar las condiciones antes de un uso comercial.
- Riesgo de sesgo heredado de los datos de entrenamiento del BamiBERT base, no documentado por el autor.
- El PLL naive requiere un forward pass por token enmascarado; sin la estrategia de batching documentada, la latencia puede ser prohibitiva en frases largas.
- La ventana de 2.050 posiciones limita la puntuación a frases o fragmentos, no a documentos completos.
- No hay benchmarks publicados que permitan estimar la precisión de desambiguación frente a alternativas basadas en reglas.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no existe validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quangdung/bamibert-tn-adapted-171126
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
