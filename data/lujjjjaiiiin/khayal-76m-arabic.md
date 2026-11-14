# Lujjjjaiiiin/khayal-76m-arabic

## Resumen

Khayal 76M Arabic es un modelo de lenguaje de 76.242.432 parámetros entrenado desde cero con arquitectura estilo Llama, diseñado por el autor Lujjjjaiiiin para continuación de texto literario en árabe. No es un asistente de instrucciones ni un modelo conversacional: se trata de un experimento educativo cuyo objetivo declarado es servir como banco de pruebas de arquitectura y pipeline de entrenamiento a pequeña escala, no como herramienta de producción. El modelo emplea 23 capas, tamaño oculto de 512, 8 cabezas de atención con 4 cabezas KV (GQA) y un vocabulario de 16.384 tokens, con embeddings de entrada y salida compartidos.

El entrenamiento se realizó sobre el corpus Arabic E-Book Corpus (libros literarios árabes, incluidas traducciones), con un total de 7.435.776 tokens empaquetados en bloques de 256 tokens y un contexto de entrenamiento de 256 posiciones (máximo configurado: 512). El proceso completo se ejecutó en una única Tesla T4 durante 48,18 minutos, con 2000 actualizaciones y un objetivo de tokens que solo se cubrió en un 0,537 % (8.192.000 tokens reales frente a 1.524.848.640 planificados). Esta cobertura tan baja es el dato más relevante para interpretar sus resultados: el modelo está drásticamente infraentrenado respecto a lo que sugiere su tamaño.

La relevancia de esta ficha es, por tanto, documental y metodológica: muestra cómo se planifica un entrenamiento con una aproximación de scaling law (D = 20N, C ≈ 6ND), cómo se estructura un pipeline de datos con separación por libro y cómo se reportan pérdidas y perplejidades con transparencia. No compite con modelos de producción y sus propios resultados (perplejidad de validación de 612,76) lo sitúan en un régimen de texto apenas coherente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (GQA, embeddings de entrada/salida compartidos) |
| Parámetros totales | 76.242.432 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de entrenamiento; 512 posiciones máximas configuradas |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Árabe (ar) |
| Licencia | CC (Creative Commons; la model card no especifica la variante concreta) |
| Formato de pesos | safetensors |
| Capas | 23 |
| Tamaño oculto | 512 |
| Cabezas de atención | 8 (4 cabezas KV, GQA) |
| Tamaño intermedio FFN | 1408 |
| Vocabulario | 16.384 tokens |
| Librería | transformers (probado con 4.46.3 y tokenizers 0.20.3) |
| Tamaño del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo Llama con 23 capas, dimensión oculta 512 y FFN de 1408. Usa Grouped Query Attention con 8 cabezas de consulta y 4 cabezas KV, lo que reduce los parámetros de proyección KV respecto a MHA, y comparte los embeddings de entrada y salida. El vocabulario de 16.384 tokens se eligió para cubrir mejor los subwords del árabe, y la profundidad se ajustó para mantenerse en el rango de 60–100 millones de parámetros. El contexto de entrenamiento es de 256 tokens, con 512 posiciones máximas configuradas.

Los datos provienen del Arabic E-Book Corpus (mohres/The_Arabic-E-Book_Corpus, licencia CC BY 4.0), con literatura, novelas, cuentos infantiles, ciencia ficción y novela detectivesca. Se seleccionaron los primeros 200 libros que cumplían los criterios y se dividieron por libro antes de segmentar: 180 de entrenamiento, 10 de validación y 10 de test, con 12.415 / 579 / 634 segmentos respectivamente (fragmentos de hasta 400 palabras, descartando los finales de menos de 50). El preprocesado incluyó normalización Unicode NFC, eliminación de diacríticos y tatweel, normalización de espacios, deduplicación exacta por libro normalizado y eliminación de contenido entre corchetes. El tokenizador se entrenó solo con documentos de entrenamiento y cada split se empaquetó de forma independiente con separadores EOS en bloques de 256 tokens.

El entrenamiento usó AdamW (betas 0.9/0.95, weight decay 0.1, clipping de gradiente 1.0), microbatch 4 con acumulación de gradiente 4 (lote efectivo de 16 secuencias / 4096 tokens de entrada), precisión mixta y gradient checkpointing. Se hicieron 2000 actualizaciones en dos etapas: 300 con LR pico 3e-4 (20 de warmup, decaimiento coseno) y 1700 adicionales conservando el estado del optimizador con LR pico 1.5e-4 (50 de warmup, decaimiento coseno). No se documenta RLHF, DPO ni ninguna fase de alineación: es un modelo de preentrenamiento puro sobre texto literario.

## Capacidades

- Generación de texto en árabe con continuación de estilo literario, limitada a un contexto de 256 tokens.
- Modelado de lenguaje autorregresivo con vocabulario específico para subwords árabes.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No es un modelo de instrucciones: no sigue instrucciones de forma fiable (declarado explícitamente por el autor).
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Multilingüismo limitado al árabe; no se documenta soporte de otros idiomas.
- Generación con muestreo (temperature, top-p, top-k, repetition penalty, no-repeat-ngram) según el ejemplo de la model card.

## Casos de uso

- Docencia sobre pipelines de entrenamiento: sirve para ilustrar de principio a fin cómo se planifica un modelo con una aproximación de scaling law, se tokeniza un corpus árabe, se separan splits por libro y se reportan pérdidas y perplejidades con transparencia.
- Reproducción de experimentos de tokenización árabe: su vocabulario de 16.384 tokens entrenado solo con el split de entrenamiento permite estudiar el efecto de la normalización (NFC, eliminación de diacríticos y tatweel) en la segmentación de texto literario árabe.
- Pruebas de infraestructura de inferencia a pequeña escala: con 76 millones de parámetros y 0,3 GB de pesos, es útil para validar pipelines de transformers, text-generation-inference o endpoints compatibles antes de pasar a modelos mayores.
- Experimentos controlados de infraentrenamiento: con una cobertura del 0,537 % del objetivo de tokens, es un caso de estudio para medir el impacto del infraentrenamiento en la coherencia y la repetición, comparando curvas de pérdida y muestras generadas.
- Generación de texto literario exploratoria con revisión humana: puede producir continuaciones de estilo árabe con muestreo ajustado (temperature 0.8, top-p 0.9, top-k 40, repetition penalty 1.2, no-repeat-ngram 3), siempre que un humano corrija gramática, palabras inventadas y repeticiones.
- Benchmark de referencia negativa: útil como línea base de un modelo de 76M parámetros entrenado en 48 minutos en una T4 para comparar con modelos árabes más grandes y determinar a partir de qué escala mejora la coherencia narrativa.
- Estudio de sesgos y lenguaje desactualizado en corpus literarios: al provenir de libros con posible lenguaje anticuado, permite analizar qué sesgos y registros arrastra un modelo pequeño entrenado con literatura traducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente pérdida y perplejidad:

| Split / etapa | Pérdida | Perplejidad | Objetivos puntuados |
|---|---:|---:|---:|
| Subconjunto de validación inicial registrado | 7,6352 | 2069,75 | — |
| Mismo subconjunto de validación, final | 6,3518 | 573,55 | 20.400 |
| Validación completa final | 6,4180 | 612,76 | 347.820 |
| Test completo final | 6,3801 | 590,00 | 386.325 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,3 GB en safetensors (76,24 M de parámetros en fp32 ≈ 0,3 GB; en fp16 ≈ 0,15 GB), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de VRAM; el autor entrenó en una Tesla T4 y el modelo se ejecuta sin problema en RTX 3060, RTX 4090 o incluso CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e integradas con suficiente memoria compartida; también en CPU.
- Opciones de despliegue: transformers (versión probada 4.46.3 con tokenizers 0.20.3), text-generation-inference y endpoints compatibles (según los tags del repo). No se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponible. El contexto de 256 tokens y el tamaño reducido implican latencias muy bajas, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de este modelo frente a alternativas, y la información proporcionada no incluye comparaciones directas. La siguiente tabla recoge solo los datos verificables del propio modelo y deja constancia de la ausencia de datos comparativos:

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Datos de rendimiento |
|---|---|---|---|---|---|
| Khayal 76M Arabic | 76,24 M | 256 (entrenamiento) / 512 (máx.) | CC | Árabe | Perplejidad de test 590,00 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible modelos comparables de la misma categoría (modelos árabes de ~76M parámetros entrenados desde cero) con datos públicos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo drásticamente infraentrenado: solo procesó 8.192.000 tokens frente a un objetivo de 1.524.848.640 (cobertura del 0,537 %). El autor declara explícitamente que el experimento no establece ninguna scaling law.
- Calidad de generación baja: la propia model card documenta errores gramaticales, palabras inventadas, repeticiones y continuidad narrativa débil. En decodificación greedy se observaron bucles como «كان أن كان أن».
- No sigue instrucciones de forma fiable y no debe usarse como asistente conversacional.
- Riesgo alto de alucinación: las salidas no son información factual fiable.
- Posible memorización de los textos de entrenamiento, dado el corpus literario relativamente pequeño.
- Sesgos y lenguaje desactualizado heredados de los libros de origen; la separación por ID de libro no garantiza la separación de obras relacionadas, autores o ediciones alternativas.
- Contexto muy corto (256 tokens de entrenamiento, 512 máximas posiciones), insuficiente para tareas que requieran contexto largo.
- Licencia CC sin variante especificada en la model card: conviene verificar los términos exactos antes de cualquier uso comercial. El corpus de origen es CC BY 4.0 y requiere atribución a Andreas Hallberg, Hindawi Foundation y los autores, traductores y editores correspondientes.
- Sin datos publicados de benchmarks estándar, latencia ni throughput; no apto para producción sin una evaluación previa propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lujjjjaiiiin/khayal-76m-arabic
- Dataset de entrenamiento: https://huggingface.co/datasets/mohres/The_Arabic_E-Book_Corpus
- Registro original del corpus (Researchdata.se): https://researchdata.se/en/catalogue/dataset/doi-10-23695-xwz6-jv19
- Paper, blog, repositorio o demo adicionales: no disponible
