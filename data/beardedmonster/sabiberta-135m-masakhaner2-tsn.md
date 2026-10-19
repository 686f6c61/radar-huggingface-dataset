# BeardedMonster/SabiBERTa-135M-masakhaner2-tsn

## Resumen

SabiBERTa-135M-masakhaner2-tsn es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) publicado por el usuario BeardedMonster en Hugging Face. Se obtiene por ajuste fino supervisado del modelo base `BeardedMonster/SabiBERTa-135M` sobre el protocolo `tsn` del corpus MasakhaNER 2.0, es decir, sobre una única lengua: el setsuana (código ISO 639-3 `tsn`). El resultado es un modelo encoder de 135.883.017 parámetros orientado exclusivamente a etiquetar secuencias, no a generar texto.

La relevancia del checkpoint es acotada y muy específica: cubre una lengua africana de bajos recursos con un span F1 declarado de 0,8239 sobre el conjunto de evaluación del protocolo, un valor calibrado por el arnés de evaluación del propio autor, que según la model card reproduce los resultados publicados de MasakhaNER 2.0 con una desviación de aproximadamente ±0,25 F1. No hay información sobre licencia, benchmarks adicionales, contexto máximo real ni variantes cuantizadas.

Para un equipo que necesite NER en setsuana, el interés práctico está en el tamaño (135 M de parámetros, repo de 0,5 GB) y en la cabeza de clasificación ya configurada con `id2label`, lo que permite decodificar predicciones a nombres de etiqueta directamente. Para cualquier otra tarea o idioma, el modelo no es adecuado tal cual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (según el tag `modernbert` de la ficha; detalles de capas y atención no disponibles) |
| Parámetros totales | 135.883.017 (135,9 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. La model card solo documenta `max length = 256` durante el ajuste fino |
| Tipos de cuantización | No se han publicado variantes cuantizadas. El repo (0,5 GB para 135,9 M de parámetros) es consistente con pesos en fp32, aunque la precisión exacta no se declara |
| Idiomas soportados | `tsn` (setsuana) únicamente |
| Licencia | No disponible. La model card remite a la licencia y términos del modelo base `BeardedMonster/SabiBERTa-135M` |
| Formato de pesos | safetensors |
| Tarea | Token classification (NER), con `id2label` configurado |
| Modelo base | `BeardedMonster/SabiBERTa-135M` |
| Dataset de ajuste | MasakhaNER 2.0, protocolo `tsn` |
| Métrica declarada | span_f1 = 0,8239 (media sobre 1 idioma) |
| Tamaño del repositorio | 0,5 GB |
| Fecha de publicación | 2026-10-19 (creación y última actualización) |
| Adopción registrada | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La ficha etiqueta el modelo como `modernbert`, lo que sitúa la arquitectura en la familia ModernBERT, un encoder transformer de tipo BERT con las mejoras propias de esa familia (rotary position embeddings, atención alternada local/global y kernels optimizados, entre otras). No obstante, la información proporcionada no detalla el número de capas, la dimensión oculta, el número de cabezas ni la ventana de atención efectiva del checkpoint, por lo que estos datos deben considerarse no disponibles. Sobre esta base se añade una cabeza de clasificación de tokens para el esquema de etiquetas de MasakhaNER 2.0.

El ajuste se realizó con los siguientes hiperparámetros declarados: 50 épocas, learning rate 5e-05, batch size 32 y longitud máxima de secuencia 256 tokens, sobre el protocolo `tsn` del corpus MasakhaNER 2.0. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de entrenamiento adicionales más allá del ajuste supervisado. El autor indica que el resultado proviene de una única ejecución del arnés de evaluación del proyecto, y que dicho arnés reproduce los resultados publicados de MasakhaNER 2.0 con una tolerancia de aproximadamente ±0,25 F1, por lo que el 0,8239 debe interpretarse como una medida calibrada pero con ruido de ejecución única.

## Capacidades

- Reconocimiento de entidades nombradas en setsuana: clasifica cada token de la secuencia de entrada según el esquema de etiquetas de MasakhaNER 2.0, con `id2label` ya definido para decodificar directamente a nombres de etiqueta.
- Extracción de menciones (span-level): la métrica objetivo es span_f1, lo que implica capacidad de delimitar entidades completas, no solo etiquetar tokens aislados.
- Procesamiento por lotes de secuencias de hasta 256 tokens en el régimen de entrenamiento; para documentos más largos es necesario trocear la entrada.
- Ejecución ligera: al ser un encoder de 135,9 M de parámetros, la inferencia cabe en CPU y en GPUs de gama baja.
- Integración estándar vía `transformers` con `AutoTokenizer` y `AutoModelForTokenClassification`.
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling, agentes, visión, audio ni modo de pensamiento. Es un modelo discriminativo de etiquetado, no un modelo de lenguaje generativo.
- Cobertura multilingüe: nula más allá del setsuana. El checkpoint se ha ajustado sobre un solo idioma y no se declara transferencia a otras lenguas.

## Casos de uso

- Extracción de entidades en corpus de noticias y textos en setsuana: pasar documentos troceados a 256 tokens por el modelo y consolidar las predicciones con `id2label` para construir índices de personas, organizaciones y lugares. El tamaño de 135 M permite procesar volúmenes grandes en CPU.
- Pre-anotación asistida para equipos de anotación lingüística: usar el modelo como etiquetador automático de primera pasada y reservar la revisión humana para los spans dudosos, reduciendo el coste de crear nuevos corpus NER en setsuana.
- Enriquecimiento de motores de búsqueda y sistemas de recuperación de información en setsuana: indexar entidades detectadas como metadatos para mejorar filtros y facetas de búsqueda sobre colecciones documentales.
- Monitorización de medios y redes sociales: detección de menciones a actores políticos, empresas o localizaciones en publicaciones en setsuana para paneles de seguimiento, con revisión humana dado el riesgo de falsos positivos fuera del dominio de entrenamiento.
- Construcción de datasets paralelos y recursos lingüísticos: anotar automáticamente entidades en colecciones textuales para su publicación o para alimentar estudios de lingüística de corpus sobre el setsuana.
- Componente en pipelines de moderación o análisis documental: señalizar entidades sensibles (nombres propios, organizaciones) antes de un paso de revisión o de clasificación posterior, siempre como etapa auxiliar y no como decisión final.
- Evaluación comparativa de modelos encoder para lenguas africanas: servir de punto de referencia reproducible (span_f1 0,8239 en el protocolo `tsn`) frente a otras arquitecturas ajustadas sobre MasakhaNER 2.0.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Notas |
|---|---|---|---|
| MasakhaNER 2.0, protocolo `tsn` | span_f1 | 0,8239 | Media sobre 1 idioma; ejecución única |
| Baselines publicados de MasakhaNER 2.0 | span_f1 | No disponible en la información proporcionada | La model card indica que el arnés los reproduce con ±0,25 F1, pero no incluye las cifras |
| MMLU, HumanEval, GSM8K u otros | - | No aplica / no disponible | El modelo no es generativo; no se han publicado resultados en estos benchmarks |

No se han publicado resultados adicionales de benchmarks en la información disponible. Los desgloses por idioma están en el fichero `metrics.json` del repositorio, no incluido en la información facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 2 GB en fp32 (los pesos ocupan aproximadamente 0,55 GB y el resto corresponde a activaciones y overhead). Cifra estimada a partir del número de parámetros y del tamaño del repo, no publicada por el autor.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para lotes moderados.
- GPU de datacenter (A100, H100, L40S) solo tienen sentido para despliegues de muy alto throughput por lote; el modelo no las aprovecha por capacidad.
- Opciones de despliegue: `transformers` (PyTorch) es la vía documentada en la model card; exportación a ONNX Runtime para inferencia en CPU; TorchScript o `torch.compile` como optimizaciones adicionales. `llama.cpp`, Ollama y motores orientados a generación no son aplicables a este encoder de clasificación.
- vLLM y TGI no están documentados para este checkpoint en la información disponible; si se usan, requieren soporte de modelos de pooling/clasificación y conversión previa.
- Latencia y throughput: no disponibles. No se han publicado medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea / idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-tsn | 135,9 M | No disponible (ajuste a 256) | NER / `tsn` | No disponible (hereda la del modelo base) | Hugging Face |
| SabiBERTa-135M (base) | No disponible en la información | No disponible | Encoder preentrenado; sin cabeza NER | No disponible | Hugging Face |
| SabiBERTa-135M-masakhaner2-ibo | No disponible | No disponible | NER / `ibo` (igbo) | No disponible | Hugging Face |
| Baselines de MasakhaNER 2.0 (p. ej. variantes multilingües tipo XLM-R/AfroXLMR) | No disponible en la información | No disponible | NER / multilingüe africano | Varía según checkpoint | No disponible |

La comparación cuantitativa no es posible con los datos facilitados: solo se dispone del span_f1 del checkpoint `tsn` (0,8239) y de la referencia cualitativa a que el arnés reproduce los baselines publicados con ±0,25 F1. Cualquier comparación de rendimiento frente a XLM-R, AfroXLMR u otros encoders requiere consultar `metrics.json` y el paper de MasakhaNER 2.0.

## Limitaciones y advertencias

- Licencia no declarada: la ficha indica explícitamente que la licencia y los términos del modelo base (`BeardedMonster/SabiBERTa-135M`) rigen cualquier uso derivado. Antes de un uso comercial es obligatorio verificar la licencia del modelo base.
- Un único idioma: solo `tsn` (setsuana). No hay evidencia de transferencia a otras lenguas africanas ni al castellano.
- Resultado de una sola ejecución: el propio autor advierte que los baselines de referencia promedian 5 ejecuciones, por lo que diferencias pequeñas respecto a ellos deben tratarse como ruido. La incertidumbre declarada del arnés es de aproximadamente ±0,25 F1.
- Ventana de 256 tokens en entrenamiento: los documentos largos deben trocearse, con el riesgo de perder entidades partidas en los límites de fragmento y de degradar el rendimiento fuera de esa longitud.
- Dominio de entrenamiento no documentado: no se detalla la composición del corpus MasakhaNER 2.0 usado ni su distribución temática, por lo que el comportamiento fuera de ese dominio (redes sociales, texto jurídico, transcripciones) es incierto.
- Riesgo de alucinación en sentido generativo: no aplica, al no generar texto. El riesgo equivalente es de falsos positivos y falsos negativos en la detección de entidades, y de spans mal delimitados.
- Sesgos: no se ha publicado ningún análisis de sesgos del checkpoint ni del corpus de ajuste. Los sesgos presentes en los datos de anotación de MasakhaNER 2.0 se trasladan al modelo.
- Sin datos de robustez: no hay evaluaciones sobre texto ruidoso, ortografía no estándar, code-switching ni variantes dialectales del setsuana.
- Adopción nula y escasa documentación: 0 descargas y 0 likes en el momento de la consulta, sin paper asociado, demo ni informes técnicos publicados.
- No apto para producción crítica sin validación propia: conviene evaluar con un conjunto de test local representativo del dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-tsn
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Checkpoint hermano para igbo (`ibo`): https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-ibo
- Métricas desglosadas por idioma: fichero `metrics.json` dentro del repositorio del modelo (https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-tsn/blob/main/metrics.json)
- Paper de MasakhaNER 2.0: no incluido en la información disponible
- Blog, demo o repositorio de código del autor: no disponibles en la información proporcionada
