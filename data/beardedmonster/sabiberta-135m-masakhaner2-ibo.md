# BeardedMonster/SabiBERTa-135M-masakhaner2-ibo

## Resumen

SabiBERTa-135M-masakhaner2-ibo es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido por ajuste fino del modelo base BeardedMonster/SabiBERTa-135M sobre el corpus MasakhaNER 2.0 en la variedad lingüística `ibo` (igbo). Lo publica el usuario BeardedMonster dentro de un proyecto de evaluación comparativa de lenguas africanas, y su propósito es etiquetar secuencias con las categorías de entidades del corpus MasakhaNER 2.0 directamente sobre texto en igbo. Con 135.883.017 parámetros, es un modelo compacto orientado a una única tarea y una única lengua, no un modelo generativo.

Arquitectónicamente se apoya en la familia ModernBERT (etiqueta `modernbert` declarada por el autor): un encoder transformer denso con atención bidireccional, pensado para tareas de comprensión y etiquetado. El ajuste fino se realizó durante 50 épocas con una tasa de aprendizaje de 5e-05, tamaño de lote 32 y longitud máxima de secuencia de 256 tokens, optimizando `span_f1`, métrica estándar de NER a nivel de entidad. El resultado medio reportado es de 0,8287 de span F1.

Su relevancia es acotada pero clara: cubre una lengua de bajos recursos (igbo) con un modelo de 136 M de parámetros que se ejecuta en CPU o en cualquier GPU de consumo, y forma parte de una batería de checkpoints que replican las líneas base publicadas de MasakhaNER 2.0 con una desviación de aproximadamente 0,25 F1. No es un modelo de propósito general: no genera texto, no razona y no admite instrucciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia ModernBERT, según etiqueta del autor); cabeza de clasificación de tokens |
| Parámetros totales | 135.883.017 (~135,9 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información; el ajuste fino se ejecutó con `max_length` = 256 |
| Tipos de cuantización | No disponible (el repositorio publica pesos `safetensors` sin cuantizar, ~0,5 GB) |
| Idiomas soportados | Igbo (`ibo`) |
| Licencia | No disponible; el autor remite a la licencia y términos del modelo base BeardedMonster/SabiBERTa-135M |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de la familia ModernBERT, según la etiqueta declarada por el autor, sobre el que se añade una cabeza de clasificación de tokens (`AutoModelForTokenClassification`). El checkpoint parte de BeardedMonster/SabiBERTa-135M y se ajusta de forma supervisada sobre el *protocol* `ibo` de MasakhaNER 2.0, el benchmark de entidades nombradas para lenguas africanas. La configuración de entrenamiento reportada es de 50 épocas, tasa de aprendizaje 5e-05, lote de 32 y truncamiento a 256 tokens. El `id2label` está configurado en el checkpoint, de modo que las predicciones se decodifican directamente a nombres de etiqueta sin mapeo manual.

No se documentan en la información disponible la composición exacta del corpus de ajuste, el número de tokens de entrenamiento, ni si hubo una fase adicional de alineación (RLHF/DPO), algo por otra parte impropio de un modelo discriminativo de NER. El autor sí indica el criterio de calibración: el *harness* del proyecto reproduce las líneas base publicadas de MasakhaNER 2.0 con un margen de ~0,25 F1, por lo que las cifras son comparables a las del paper y no medidas ad hoc. La puntuación corresponde a una única ejecución, mientras que los papers de referencia promedian cinco, de modo que las diferencias pequeñas deben tratarse como ruido.

## Capacidades

- Reconocimiento de entidades nombradas en igbo sobre el esquema de etiquetas de MasakhaNER 2.0, con predicción a nivel de span.
- Clasificación de tokens por token con decodificación directa a nombres de etiqueta (`id2label` preconfigurado).
- Procesamiento de secuencias de hasta 256 tokens en el régimen de entrenamiento (longitudes mayores no están validadas).
- Ejecución en CPU y en GPU de consumo por su tamaño reducido (136 M de parámetros).
- Integración nativa con la librería `transformers` mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión ni audio.
- No es un modelo multilingüe: está ajustado exclusivamente para `ibo`.

## Casos de uso

- Extracción de entidades en prensa digital en igbo: el modelo etiqueta personas, organizaciones y localizaciones en artículos, lo que permite construir índices de entidades y alimentar un motor de búsqueda o un sistema de recomendación de noticias.
- Preanotación asistida en proyectos de anotación humana: se ejecuta el checkpoint sobre el corpus sin anotar para generar propuestas de spans que el anotador revisa, reduciendo el coste de la anotación manual en una lengua de bajos recursos.
- Monitorización de medios y análisis de reputación: extracción sistemática de organizaciones y personas mencionadas en fuentes en igbo para paneles de seguimiento de menciones.
- Enriquecimiento de bases de datos documentales: normalización de registros con entidades detectadas en textos igbo, útil en archivística y bibliotecas digitales.
- Investigación en PLN de bajos recursos: línea base reproducible para comparar tokenizadores, arquitecturas o estrategias de ajuste fino en igbo, con la ventaja de que el *harness* está calibrado contra el paper original.
- Filtrado y estructuración de corpus para entrenamiento: detectar y anonimizar o etiquetar entidades en textos antes de reutilizarlos en otros pipelines, con la advertencia de que la cobertura de etiquetas se limita al esquema de MasakhaNER 2.0.
- Análisis de humanidades digitales: extracción de redes de personas y lugares en corpus históricos o literarios en igbo para estudios cuantitativos.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Notas |
|---|---|---|---|
| MasakhaNER 2.0 (`ibo`) | span F1 medio | 0,8287 | Una única ejecución; los papers de referencia promedian 5 |
| MasakhaNER 2.0 (`ibo`) | F1 por etiqueta | No disponible | El autor indica que están en `metrics.json`, no incluido en la información disponible |

No se han publicado en la información disponible resultados de benchmarks comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros) ni cifras de otros checkpoints sobre el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,55 GB en FP32 (135,9 M de parámetros), ~0,27 GB en FP16/BF16 y ~0,14 GB en INT8. El repositorio ocupa 0,5 GB, coherente con pesos en precisión completa.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Funciona en CPU con latencias utilizables para procesamiento por lotes; un servidor sin GPU puede servir el modelo para volúmenes moderados.
- Opciones de despliegue: `transformers` en PyTorch (ruta documentada por el autor), exportación a ONNX Runtime, o conversión a `llama.cpp`/`Ollama` únicamente si se implementa soporte de arquitectura ModernBERT para clasificación de tokens (no verificable con la información disponible). vLLM y TGI están orientados a modelos generativos y no aplican de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-ibo | 135,9 M | No disponible (entrenado a 256) | NER en igbo | No disponible (heredera del base) | HuggingFace, 0 descargas |
| BeardedMonster/SabiBERTa-135M (base) | No disponible | No disponible | Encoder de propósito general | No disponible | HuggingFace |
| XLM-RoBERTa-base | ~278 M (dato público, no de la información proporcionada) | 512 | Encoder multilingüe; requiere ajuste fino para NER | MIT según documentación pública | HuggingFace |
| mBERT | ~178 M (dato público, no de la información proporcionada) | 512 | Encoder multilingüe; requiere ajuste fino para NER | Apache 2.0 según documentación pública | HuggingFace |

No hay datos de benchmark de estos comparadores sobre el protocolo `ibo` de MasakhaNER 2.0 en la información disponible, por lo que no es posible establecer una comparación de rendimiento directa. Las cifras de parámetros y contexto de XLM-RoBERTa-base y mBERT proceden de documentación pública general y deben verificarse antes de citarlas.

## Limitaciones y advertencias

- Modelo monolingüe: solo cubre `ibo`; su uso sobre otras lenguas, incluido el inglés, producirá salidas sin garantía.
- Modelo de una sola tarea: no genera texto ni sigue instrucciones; cualquier uso como asistente conversacional es un error de planteamiento.
- Entrenado con truncamiento a 256 tokens: el rendimiento en documentos largos depende del troceado que haga el usuario y no está validado más allá de esa longitud.
- Resultados de una única ejecución: el autor advierte explícitamente que las diferencias pequeñas frente a otras líneas base deben considerarse ruido (±0,25 F1 de calibración del *harness*).
- Sesgos de dominio: el esquema y la distribución de entidades provienen de MasakhaNER 2.0, con la composición y las fuentes que ese corpus tenga; el rendimiento caerá en dominios alejados (texto jurídico, transcripciones orales, jerga digital).
- Riesgo de alucinación en el sentido generativo: no aplica; el riesgo equivalente es la sobrepredicción o infrapredicción de spans, especialmente en fronteras de entidad y en entidades anidadas o no cubiertas por el esquema.
- Licencia no declarada en la ficha: antes de cualquier uso comercial hay que consultar la licencia y los términos de BeardedMonster/SabiBERTa-135M, que gobiernan este derivado.
- Baja adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente del autor.
- Fecha de creación indicada como 2026-10-18, posterior a la de esta revisión; conviene verificar la integridad y procedencia del repositorio antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-ibo
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Resultados de búsqueda web: no se encontraron enlaces relevantes; los resultados devueltos trataban sobre atajos de teclado para la letra «É» y no guardan relación con el modelo.
