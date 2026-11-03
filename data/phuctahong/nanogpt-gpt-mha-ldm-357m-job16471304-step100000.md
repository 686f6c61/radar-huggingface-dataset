# phuctahong/nanogpt-gpt-mha-ldm-357m-job16471304-step100000

## Resumen

El modelo `phuctahong/nanogpt-gpt-mha-ldm-357m-job16471304-step100000` es un checkpoint de inferencia de 357 millones de parámetros entrenado con el framework NanoGPTPro sobre el corpus FineWeb-Edu. Lo publica el usuario phuctahong como parte del conjunto de comparación DDL2, y su interés es fundamentalmente experimental: sirve para estudiar el efecto de la arquitectura `gpt-mha-ldm` (atención multi-cabeza con memoria de profundidad lineal) frente a otras variantes dentro de la misma familia de experimentos.

Se trata de un transformer decoder-only de tipo GPT con una innovación arquitectónica concreta, la "Linear Depth Memory" (LDM), que se añade sobre la atención multi-cabeza estándar. El modelo se ha entrenado con aproximadamente 49.200 millones de tokens de FineWeb-Edu y una longitud de contexto de 1024 tokens, lo que lo sitúa en la liga de los modelos pequeños de investigación más que en la de asistentes de producción.

Su relevancia actual es acotada: no es un modelo pensado para uso comercial ni para tareas de usuario final, sino un artefacto reproducible para ablaciones y comparativas de arquitectura. La licencia Apache 2.0 permite reutilizarlo y modificarlo, pero la ausencia de evaluación publicada, de model card detallada y de soporte multilingüe declarado limita mucho su aplicabilidad directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT con atención multi-cabeza (MHA) y Linear Depth Memory (LDM); identificador `gpt-mha-ldm` |
| Parametros totales | 357.290.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión nativa) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `generation_config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT con atención multi-cabeza convencional, sobre la que se incorpora el módulo Linear Depth Memory (LDM), que da nombre al identificador `gpt-mha-ldm`. El modelo tiene 357 millones de parámetros y opera con una ventana de contexto de 1024 tokens. No se dispone de detalles publicados sobre el número de capas, dimensión oculta, número de cabezas ni sobre cómo se integra exactamente el mecanismo LDM en el bloque transformer; esa información no está disponible en la model card ni en los metadatos.

El entrenamiento se realizó sobre el corpus FineWeb-Edu, con un total de aproximadamente 49.200 millones de tokens procesados, dentro del framework NanoGPTPro y como parte del conjunto de comparación DDL2. El checkpoint publicado corresponde al paso 100.000 y es únicamente de inferencia: no incluye estado del optimizador ni del entrenador. No se documenta en la información disponible si hubo fases de ajuste fino supervisado, RLHF o DPO, ni se detalla la composición exacta del subconjunto de FineWeb-Edu utilizado.

## Capacidades

- Generación de texto autoregresiva con contexto de 1024 tokens, suficiente para párrafos, fragmentos de código cortos y respuestas breves.
- Modelado de lenguaje general entrenado sobre contenido educativo filtrado (FineWeb-Edu), lo que favorece texto expositivo y de divulgación.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso guiado ni modos de "thinking".
- No se declaran capacidades multilingües; el corpus de entrenamiento es mayoritariamente anglófono.
- No dispone de visión, audio ni otras modalidades.
- No se documenta un tokenizador específico en la información disponible; se asume el estándar del framework NanoGPTPro.

## Casos de uso

- Ablaciones de arquitectura en investigación: el modelo sirve como punto de comparación dentro del conjunto DDL2 para medir el efecto de Linear Depth Memory frente a variantes sin LDM, manteniendo constante el presupuesto de tokens y el corpus.
- Reproducción de experimentos de escalado: con 357 M de parámetros y 49.200 M de tokens, encaja en la región de "compute-optimal" de las leyes de escalado para modelos pequeños, útil para validar recetas de entrenamiento.
- Generación de texto educativo de dominio acotado: FineWeb-Edu está filtrado por calidad didáctica, de modo que el modelo puede producir explicaciones breves sobre temas científicos o técnicos en inglés.
- Prototipado rápido en local: al ser un checkpoint de 357 M en safetensors (1,4 GB de repositorio), se puede cargar en una GPU de consumo para pruebas de generación sin infraestructura dedicada.
- Base para ajuste fino supervisado: al estar bajo Apache 2.0 y en formato safetensors, es un punto de partida razonable para experimentos de fine-tuning con datasets pequeños y contexto corto.
- Estudio de mecanismos de memoria en transformers: el módulo LDM permite analizar cómo afecta la memoria de profundidad lineal a la perplejidad y a la coherencia en ventanas de 1024 tokens, comparándolo con atención estándar.
- Docencia y divulgación: útil para ilustrar en cursos cómo se entrena y publica un modelo tipo GPT pequeño con un framework de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni comparaciones cuantitativas con otras variantes del conjunto DDL2.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp16/bf16): en torno a 0,8-1,0 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 1024 tokens el consumo total se mantiene por debajo de 2 GB en la mayoría de configuraciones.
- VRAM estimada en fp32: aproximadamente 1,5 GB para pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o una A100/H100 funcionan sin problema, aunque las dos últimas están sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU de consumo: GTX 1650 4 GB, RTX 3050 6 GB, RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, así como en Apple Silicon con memoria unificada.
- Opciones de despliegue: al publicarse solo en safetensors, requiere cargarlo con `transformers` o con el propio framework NanoGPTPro; no hay GGUF publicado, por lo que llama.cpp u Ollama requerirían conversión previa. vLLM y TGI son viables si la arquitectura está soportada por esas librerías, algo que no se confirma en la información disponible.
- Latencia y throughput: no disponibles; para 357 M de parámetros en una GPU moderna se espera un throughput alto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| phuctahong/nanogpt-gpt-mha-ldm-357m | 357 M | 1024 | Apache 2.0 | HuggingFace, safetensors | Checkpoint de investigación DDL2, sin benchmarks publicados |
| GPT-2 medium (OpenAI) | 355 M | 1024 | MIT (pesos publicados) | HuggingFace, múltiples formatos | Referencia clásica de mismo tamaño, ampliamente evaluado |
| GPT-2 large (OpenAI) | 774 M | 1024 | MIT | HuggingFace | Alternativa de mayor tamaño dentro de la misma familia |
| Pythia-410M (EleutherAI) | 410 M | 2048 | Apache 2.0 | HuggingFace, safetensors | Suite de investigación con checkpoints intermedios y evaluaciones publicadas |

La comparación directa con estos modelos es limitada: no hay benchmarks publicados para el modelo de phuctahong, y su interés está en la variante arquitectónica LDM más que en el rendimiento absoluto. Frente a Pythia-410M, el modelo aquí descrito ofrece menor contexto (1024 frente a 2048) y carece de la batería de evaluaciones que EleutherAI publica para su suite.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no se puede afirmar nada sobre su calidad relativa frente a otros modelos de tamaño similar.
- Sesgos desconocidos: al entrenarse sobre FineWeb-Edu no se documenta ningún proceso de mitigación de sesgos ni de filtrado más allá del propio corpus.
- Riesgo de alucinación alto, propio de un modelo de 357 M sin ajuste instructivo ni RLHF; no está alineado para conversación.
- Contexto muy corto (1024 tokens), insuficiente para documentos largos, conversaciones multi-turno extensas o bases de código grandes.
- Idiomas: no se declara soporte multilingüe; el rendimiento fuera del inglés es presumiblemente muy limitado.
- No es un modelo instructivo: no sigue instrucciones de forma fiable ni soporta plantillas de chat documentadas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y de garantías hace desaconsejable su uso en producción sin una validación exhaustiva previa.
- El checkpoint no incluye estado del optimizador ni del entrenador, por lo que no es reanudable tal cual para continuar el entrenamiento.
- La model card es mínima y no documenta hiperparámetros, tokenizador ni detalles del módulo LDM, lo que dificulta la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/phuctahong/nanogpt-gpt-mha-ldm-357m-job16471304-step100000
- FineWeb-Edu (corpus de entrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- NanoGPTPro (framework, referencia del tag `nanogptpro`): no disponible en la información proporcionada
- Conjunto de comparación DDL2: no disponible en la información proporcionada
