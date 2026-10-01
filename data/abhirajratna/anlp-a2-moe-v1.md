# abhirajratna/anlp-a2-moe-v1

## Resumen

El modelo `abhirajratna/anlp-a2-moe-v1` es un transformer decoder-only entrenado desde cero para traducción automática de vietnamita a inglés y de japonés a inglés. Lo publica el usuario abhirajratna en HuggingFace como parte de un trabajo académico (etiqueta `anlp-assignment`) y forma parte de una familia de cinco variantes que solo se diferencian en la capa feed-forward. Esta variante v1 concreta usa un FFN denso de dos capas con anchura oculta 2048.

El modelo tiene 33.563.136 parámetros totales, sin parámetros activos diferenciales (el propio autor indica que los parámetros activos por token coinciden con el total). La arquitectura es compacta: 8 capas, dimensión de modelo 512, 8 cabezas de atención y un vocabulario compartido de 16.384 tokens con BPE a nivel de byte para los tres idiomas. Se entrenó durante 3 épocas (9.933 pasos) sobre 114.291.660 tokens no de relleno.

Es relevante ahora como ejemplo reproducible de pipeline completo de traducción neuronal a pequeña escala y como punto de comparación para estudiar el efecto de distintas capas feed-forward (densa frente a variantes con mezcla de expertos) manteniendo constante el resto de la arquitectura. Su tamaño reducido lo hace desplegable en CPU y en cualquier GPU de consumo, aunque con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (solo decodificador), FFN denso de 2 capas con anchura oculta 2048 |
| Parametros totales | 33.563.136 |
| Parametros activos | 33.563.136 (según la model card, no hay activación dispersa en esta variante) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | vietnamita (vi), japones (ja), ingles (en); traducción únicamente vi→en y ja→en |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0.1 GB, con código del modelo en `code/part1/` y `tokenizer.json`) |
| Capas / d_model / cabezas | 8 / 512 / 8 |
| Vocabulario | 16.384 (BPE a nivel de byte, compartido vi/ja/en) |
| Tokens de entrenamiento | 114.291.660 no de relleno (3 épocas, 9.933 pasos) |
| Learning rate máximo | 0.0005 |
| Pipeline | translation |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only entrenado desde cero, sin inicialización a partir de un modelo preentrenado generalista. La configuración es deliberadamente pequeña: 8 capas, `d_model` de 512 y 8 cabezas de atención, con un vocabulario compartido de 16.384 tokens generado mediante BPE a nivel de byte para los tres idiomas. La variante v1, la documentada aquí, incorpora un FFN denso de dos capas con anchura oculta 2048; el autor indica que es una de cinco variantes que solo difieren en esa capa, lo que sugiere un experimento controlado sobre el diseño del feed-forward.

El entrenamiento usó el dataset `belumind/en-vi-ja-curated-500k-triplets`, con 114.291.660 tokens no de relleno procesados en 3 épocas y 9.933 pasos, con un learning rate máximo de 0.0005. La model card no documenta uso de RLHF, DPO ni ninguna etapa de alineación posterior; tampoco se detallan innovaciones técnicas como atención lineal, decodificación especulativa o mecanismos híbridos. El formato de entrada está fijado por tokens especiales: `<|vi|> origen <|en|>` o `<|ja|> origen <|en|>`, y el modelo continúa generando la traducción al inglés hasta `<|eos|>`.

Nota de coherencia: el repositorio lleva la etiqueta `mixture-of-experts` y el nombre `moe-v1`, pero la model card de esta variante describe explícitamente un FFN denso y declara que los parámetros activos por token igualan a los totales. Es decir, esta variante concreta no opera como MoE disperso.

## Capacidades

- Traducción de vietnamita a inglés y de japonés a inglés, en modo texto a texto.
- Generación greedy compatible con métricas estándar (BLEU con firma sacreBLEU y chrF).
- Manejo de entrada multilingüe mediante tokens de control explícitos (`<|vi|>`, `<|ja|>`, `<|en|>`, `<|eos|>`).
- Tokenizador BPE a nivel de byte compartido para los tres idiomas, lo que evita problemas de vocabulario fuera de dominio a nivel de carácter.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- No se documenta capacidad generativa en vietnamita o japonés: el decodificador se entrena para producir inglés como salida.

## Casos de uso

- Traducción por lotes de documentación técnica en vietnamita o japonés a inglés: el modelo acepta entradas individuales con el prefijo de idioma correspondiente y puede procesarse en paralelo sobre CPU, dado su tamaño de 33,5 M de parámetros.
- Preprocesado de corpus para pipelines de NLP: traducción automática de conjuntos de datos vi/ja a inglés antes de tareas posteriores de clasificación, indexación o análisis de sentimiento.
- Subtitulado y transcripción multilingüe: integrado tras un sistema ASR que produzca texto en vietnamita o japonés, el modelo genera la línea en inglés para publicar subtítulos.
- Investigación académica sobre arquitecturas: sirve como punto de referencia controlado para comparar variantes de capa feed-forward (densa frente a mezcla de expertos) manteniendo fijos el resto de hiperparámetros.
- Base para fine-tuning específico de dominio: al ser pequeño y entrenado desde cero, es viable reentrenarlo o ajustarlo con corpus propios de un dominio concreto (legal, médico, soporte técnico) en una sola GPU.
- Despliegue en el borde o en entornos sin GPU: su huella de memoria permite ejecutar traducción vi→en o ja→en en dispositivos con recursos limitados, siempre que se porte el código de inferencia.
- Experimentos docentes reproducibles: el repositorio incluye el código del modelo en `code/part1/`, lo que facilita reproducir el entrenamiento y las métricas de test en un entorno académico.

## Benchmarks y rendimiento

Datos publicados por el autor sobre el split de test (24.792 triplets, equivalentes a 49.584 traducciones):

| Metrica | vi→en | ja→en | Conjunto completo |
|---|---|---|---|
| Perplejidad (tokens objetivo) | 3.367 | 4.354 | 3.829 |
| BLEU (greedy) | 44.11 | 34.11 | 39.15 |
| chrF (greedy) | 63.89 | 58.07 | 60.98 |

Firma sacreBLEU: `nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.6.0`.

No se han publicado en la información disponible resultados en benchmarks generalistas (MMLU, HumanEval, GSM8K u otros), ni comparaciones con modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 134 MB en fp32, 67 MB en fp16/bf16 y 34 MB en int8 solo para los pesos, más el espacio de activaciones y caché KV (no cuantificado en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requieren A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier modelo consumer actual e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable, dado el tamaño del modelo, aunque sin datos de latencia publicados.
- Opciones de despliegue: la model card indica cargar el modelo con el código incluido en el repositorio (`code/part1/model.py`, función `load_pretrained`) y el tokenizador con `Tokenizer.from_file('tokenizer.json')`. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI; al tratarse de una arquitectura propia, su integración en esos motores requeriría una conversión o adaptación no incluida en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abhirajratna/anlp-a2-moe-v1 | 33.563.136 | no disponible | vi, ja, en (salida solo en inglés) | no disponible | safetensors + código en el repo |
| Variantes 2-5 de la misma familia (FFN distinto) | no disponible (comparten el resto de la configuración) | no disponible | vi, ja, en | no disponible | no disponible en la información proporcionada |
| Alternativas externas (por ejemplo, familia Marian/OPUS-MT o NLLB-200) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido, lo que supone un riesgo legal para despliegues en producción.
- El modelo solo traduce en la dirección vi→en y ja→en; no se ha entrenado para la dirección inversa ni para otros pares de idiomas.
- Con 33,5 M de parámetros y 114 M de tokens de entrenamiento en 3 épocas, la calidad esperable queda por debajo de modelos de traducción de mayor tamaño; las métricas publicadas corresponden al propio split de test del autor, no a una evaluación externa.
- Riesgo de alucinación y de deriva en entradas largas o fuera de dominio: no se documenta ninguna etapa de alineación (RLHF/DPO) ni evaluación de fidelidad.
- No se documentan sesgos conocidos, pero tampoco se ha publicado ningún análisis de sesgo sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`.
- Longitud de contexto no especificada: no es posible garantizar el comportamiento con documentos largos sin truncar.
- Discrepancia de etiquetado: el repositorio se marca como `mixture-of-experts` mientras la model card de esta variante describe un FFN denso, lo que puede inducir a error al seleccionar el modelo.
- La arquitectura es personalizada y no se registra en `transformers` de forma estándar: la carga depende del código incluido en el repositorio, lo que complica la integración en servidores de inferencia convencionales.
- El repositorio registra 0 descargas y 0 likes, sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhirajratna/anlp-a2-moe-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Código del modelo incluido en el repositorio: `code/part1/model.py`
- Tokenizador incluido en el repositorio: `tokenizer.json`
- No se han proporcionado enlaces adicionales a papers, blogs, repositorios o demos.
