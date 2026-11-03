# jjalora/diet-traj-pythia-410m-pythia-seed12

## Resumen

`diet-traj-pythia-410m-pythia-seed12` es un checkpoint de investigación publicado por el usuario jjalora dentro de la campaña de espacio de pesos denominada DIET. No se trata de un modelo nuevo en el sentido de arquitectura o capacidades, sino de una reproducción desde cero del entrenamiento de Pythia-410M de EleutherAI, ejecutada con la receta abierta oficial y variando únicamente la semilla aleatoria (seed 12) y el esquema de inicialización de pesos (`pythia`, equivalente a small_init + wang_init de GPT-NeoX). El objetivo es estudiar trayectorias de entrenamiento y propiedades del espacio de pesos, no ofrecer un modelo de propósito general mejorado.

Arquitectónicamente es un transformer decoder-only de la familia GPT-NeoX, con 405.334.016 parámetros reales (aproximadamente 410M nominales), entrenado sobre el mismo flujo de tokens y en el mismo orden que Pythia (`EleutherAI/pile-standard-pythia-preshuffled`). La relevancia es metodológica: al fijar datos, orden de batches, hiperparámetros y hardware, y variar solo la semilla, el checkpoint permite comparaciones controladas entre ejecuciones y sirve como material para investigación en interpretabilidad, dinámica de entrenamiento y similitud entre soluciones de peso.

La licencia Apache 2.0 y el formato safetensors en float16 facilitan su uso en experimentos reproducibles. El repositorio es muy pesado (1167,4 GB) porque incluye múltiples ramas de checkpoints intermedios (`stepN`), lo que lo hace útil para estudiar la evolución del modelo a lo largo del entrenamiento, pero poco práctico como dependencia ligera de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-NeoX |
| Parametros totales | 405.334.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Pythia-410M usa 2048 tokens en la receta original) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GPT-NeoX tal como se define en la receta `EleutherAI/pythia models/410M/pythia-410m.yml`: transformer decoder-only con atención multi-cabeza estándar, sin mezcla de expertos ni mecanismos híbridos. El entrenamiento sigue exactamente la receta abierta de Pythia: AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni bias, grad clip 1.0, scheduler coseno hasta 3e-5 a lo largo de 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y un batch global de 1024 secuencias × 2048 tokens independientemente del número de GPUs. El flujo de datos es `EleutherAI/pile-standard-pythia-preshuffled`, con el batch *i* correspondiente a las filas [i·1024, (i+1)·1024), garantizando el mismo orden de tokens que la ejecución original.

La única diferencia respecto a Pythia-410M es la semilla (12) y el esquema de inicialización (`pythia`, es decir small_init + wang_init de GPT-NeoX). El autor documenta que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero el esquema `pythia` coincide con la distribución por tensor de `EleutherAI/pythia-410m` en la revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`. La campaña se ejecutó en el clúster "wheat" con 8 nodos de 4 GPUs A100-PCIE-40GB (32 GPUs en total), micro-batch 4 y commit git `06ae800`.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la receta Pythia-410M.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 410M parámetros.
- Generación de código y matemáticas a nivel introductorio, sin garantías de robustez.
- No incluye tool calling ni function calling nativo.
- No incorpora modo de razonamiento extendido (thinking mode), visión ni audio.
- Capacidades multilingües muy limitadas: el modelo está entrenado y etiquetado exclusivamente para inglés (`en`).
- Alineación limitada: la receta Pythia no incluye RLHF ni DPO, por lo que el modelo no está ajustado para seguir instrucciones de forma fiable.
- Utilidad principal como objeto de estudio: checkpoints intermedios accesibles por rama `stepN` para análisis de trayectorias de entrenamiento.

## Casos de uso

- Investigación en dinámica de entrenamiento: comparar la trayectoria de pesos de esta ejecución (seed 12) con otras semillas de la campaña DIET para estudiar la estabilidad del optimizador y la convergencia.
- Análisis de similitud en espacio de pesos: emparejar tensores entre checkpoints `stepN` y la ejecución original de Pythia para medir distancias, permutaciones de neuronas y alineamiento de representaciones.
- Interpretabilidad mecanicista: usar los checkpoints intermedios para estudiar la formación de circuitos y la evolución de características a lo largo del preentrenamiento, aprovechando que el flujo de datos es idéntico al de Pythia.
- Reproducibilidad y auditoría de recetas: validar la receta abierta de Pythia en hardware distinto (A100-PCIE-40GB) y documentar desviaciones numéricas respecto al run original.
- Estudio de inicialización: evaluar el impacto del esquema `pythia` (small_init + wang_init) frente a otras inicializaciones documentadas en `src/init_schemes.py` del código de entrenamiento.
- Generación de texto en inglés para experimentos controlados: usar el checkpoint final como línea base de 410M parámetros en pruebas de prompting, sin esperar calidad de asistente.
- Docencia y divulgación: ilustrar cómo se construye un modelo tipo GPT-NeoX desde cero con una receta reproducible y checkpoints intermedios accesibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 0,8 GB solo para pesos (405M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 1,5-2 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,4 GB para pesos; en 4 bits, aproximadamente 0,2 GB (no se publican ficheros GGUF en el repositorio, habría que generarlos).
- GPU recomendadas: cualquier GPU consumer moderna sirve para inferencia; una RTX 3060 de 12 GB o superior es más que suficiente. Para reproducir el entrenamiento se necesitaron 32 A100-PCIE-40GB según la procedencia documentada.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU con llama.cpp tras convertir los pesos.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles (etiqueta `endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir los safetensors a GGUF, ya que el repositorio no incluye esos formatos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.
- Almacenamiento: el repositorio completo ocupa 1167,4 GB por las múltiples ramas de checkpoints; conviene descargar solo la rama `main` o un `stepN` concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| diet-traj-pythia-410m-pythia-seed12 | 405.334.016 | no disponible (receta Pythia: 2048) | apache-2.0 | HuggingFace (jjalora) | Reproducción con seed 12 y esquema `pythia`; checkpoints intermedios por rama |
| EleutherAI/pythia-410m | ~410M | 2048 | apache-2.0 | HuggingFace (EleutherAI) | Run original de referencia; misma receta y flujo de datos |
| EleutherAI/pythia-160m | ~160M | 2048 | apache-2.0 | HuggingFace (EleutherAI) | Versión más pequeña de la familia, útil como línea base ligera |
| EleutherAI/pythia-1.4b | ~1.4B | 2048 | apache-2.0 | HuggingFace (EleutherAI) | Versión mayor de la familia, con más capacidad pero más requisitos |

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado para seguir instrucciones ni para uso conversacional; la receta Pythia no incluye RLHF ni DPO.
- Riesgo elevado de alucinación y de generar texto incoherente en tareas complejas, propio de un modelo de 410M parámetros sin alineación.
- Sesgos conocidos: entrenado sobre The Pile, hereda los sesgos de esa mezcla de datos; el autor no documenta evaluaciones de sesgo específicas.
- Limitación de idioma: solo inglés; el rendimiento en castellano u otros idiomas será deficiente.
- Limitación de contexto: la información proporcionada no especifica la longitud de contexto efectiva del checkpoint; la receta Pythia usa 2048 tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no es adecuado para producción sin un ajuste posterior y una evaluación rigurosa.
- Caveat de producción: el repositorio pesa 1167,4 GB por las ramas de checkpoints; descargar el repo completo es inviable en la mayoría de entornos, hay que seleccionar ramas concretas.
- Reproducibilidad: la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks; solo se garantiza coincidencia de distribución por tensor.
- Fecha de creación futura (2026-10-24) en los metadatos de HuggingFace: conviene verificar la integridad y procedencia del repositorio antes de usarlo en experimentos críticos.

## Enlaces

- HuggingFace: https://huggingface.co/jjalora/diet-traj-pythia-410m-pythia-seed12
- Receta Pythia original: https://github.com/EleutherAI/pythia
- Configuración de entrenamiento de referencia: `EleutherAI/pythia` `models/410M/pythia-410m.yml`
- Dataset: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Código de entrenamiento (esquemas de inicialización en `src/init_schemes.py`): no disponible como enlace directo en la información proporcionada
- Paper de Pythia: no disponible como enlace directo en la información proporcionada
