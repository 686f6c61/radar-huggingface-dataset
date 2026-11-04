# crabby-devil/zils-mini-purplemist-4b

## Resumen

Zils-mini-purplemist-4b es una redistribución sin modificaciones de los pesos de olaverse/PurpleMIST-Mini-2.0, un ajuste fino orientado a toma de decisiones sobre el layout de Qwen3.5-4B. Lo publica el usuario crabby-devil como "cuerpo" (body) para el pool de soups del modelo d3-mini de Zils, un subred de Bittensor (subnet 127). El repositorio no entrena ni modifica nada: los ficheros `model.safetensors` y `config.json` son idénticos byte a byte a la revisión `23c92d1aba9fba17d8631884cae1f313eb05abba` del modelo original.

El modelo cuenta con 4.539.265.536 parámetros en formato safetensors (9,1 GB de repositorio) y se etiqueta con el pipeline `feature-extraction`, aunque su propósito declarado es actuar como modelo de decisión dentro de la infraestructura de Zils. La relevancia es de nicho: sirve a participantes del ecosistema Bittensor que necesitan un cuerpo base verificable para el mecanismo de mezcla de pesos, no a un uso general de generación de texto.

No hay información pública sobre datos de entrenamiento, composición del dataset, idiomas soportados ni resultados de benchmarks. La model card es explícita en que todo el crédito corresponde a los autores originales y que la licencia es Apache-2.0, la misma que la del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, layout Qwen3.5-4B (detalles no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el layout de Qwen3.5-4B según la model card, con 4.539 millones de parámetros en un transformer denso (no se declara mezcla de expertos). No se especifica el número de capas, dimensiones ocultas, mecanismo de atención ni vocabulario. La model card indica que se trata de un "decision fine-tune", es decir, un ajuste fino orientado a tareas de decisión, pero no detalla la metodología (SFT, RLHF, DPO) ni los datos empleados.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas como decodificación especulativa o atención lineal. Al ser una redistribución byte-idéntica, cualquier detalle técnico adicional debe consultarse en la model card del modelo fuente olaverse/PurpleMIST-Mini-2.0, que no se ha proporcionado en la información disponible.

## Capacidades

- Generación de texto y razonamiento propios de un modelo de 4B basado en Qwen3.5, según el layout declarado.
- Orientación a toma de decisiones (decision-model), que es la tarea para la que se ajustó el modelo fuente.
- Etiquetado como `feature-extraction` en el pipeline de HuggingFace, lo que sugiere uso para extracción de representaciones.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de tool calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información.

## Casos de uso

- Participación en el pool de soups de Zils (Bittensor subnet 127): el modelo se publica como cuerpo verificable para el mecanismo d3-mini, de modo que los mineros puedan commitear pesos y comparar rendimiento dentro del subred.
- Auditoría de procedencia de pesos: al ser byte-idéntico a la revisión fuente, sirve para verificar que un commit de Bittensor corresponde exactamente al modelo original sin manipulación.
- Experimentación con modelos de decisión de 4B: investigadores pueden cargar los pesos con transformers y evaluar el comportamiento del ajuste fino de PurpleMIST en tareas de clasificación o selección.
- Extracción de características: dado el pipeline `feature-extraction`, puede emplearse para obtener embeddings de texto en pipelines de recuperación o clustering.
- Base para ajustes finos posteriores: al estar en layout Qwen3.5-4B y licencia Apache-2.0, puede servir como punto de partida para fine-tuning propio.
- Integración en endpoints compatibles: la etiqueta `endpoints_compatible` sugiere despliegue en infraestructura de inferencia gestionada, aunque no se detallan requisitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB; en 4 bits: alrededor de 2,5-3 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no disponible en la información; por tamaño, cabría en RTX 4090 (24 GB) en fp16 y en GPUs consumer de 8-12 GB con cuantización.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB o superiores en fp16, y en GPUs de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-purplemist-4b | 4.539 M | no disponible | Apache-2.0 | Redistribución de PurpleMIST-Mini-2.0 para Zils |
| olaverse/PurpleMIST-Mini-2.0 | no disponible | no disponible | Apache-2.0 | Modelo fuente, decision fine-tune |
| Qwen3.5-4B (base del layout) | ~4 B | no disponible | no disponible | Arquitectura de referencia del layout |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo no aporta ninguna modificación sobre el fuente; cualquier limitación del original se hereda íntegramente.
- No hay información sobre sesgos conocidos, riesgo de alucinación ni evaluación de seguridad.
- No se especifican idiomas soportados, por lo que el rendimiento fuera del inglés (presumible) es incierto.
- La longitud de contexto no está documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- El uso previsto es de nicho (pool de soups de Bittensor); no hay evidencia de calidad para uso general en producción.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la ausencia de benchmarks y de documentación técnica desaconseja su adopción en producción sin evaluación previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación indicada (2026-11-04) es futura respecto a la información habitual de HuggingFace y debe tratarse con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/crabby-devil/zils-mini-purplemist-4b
- Modelo fuente: https://huggingface.co/olaverse/PurpleMIST-Mini-2.0
- Revisión fuente: `23c92d1aba9fba17d8631884cae1f313eb05abba`
- Bittensor subnet 127 (Zils): no disponible en la información
- Paper, blog o demo: no disponible en la información
