# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed3

## Resumen

SmolLM-135M CPT Faroese es un modelo de lenguaje de 134,5 millones de parámetros derivado de SmolLM2-135M-Instruct, adaptado mediante entrenamiento continuado (continued pre-training, CPT) al idioma feroés. Lo desarrolla el usuario jekunz como parte de una línea de experimentos de transferencia lingüística entre lenguas nórdicas: primero se entrena sobre el subconjunto en noruego bokmål de FineWeb-2 y después sobre el subconjunto en feroés del mismo corpus. El resultado es un modelo pequeño, conversacional y con licencia Apache 2.0, pensado para investigación sobre adaptación de idiomas de bajos recursos a partir de modelos ya instruidos.

La relevancia del modelo está en su planteamiento metodológico más que en su rendimiento absoluto: explota la proximidad tipológica entre el noruego bokmål y el feroés para reducir la cantidad de datos necesaria en el idioma objetivo. Con 134,5 millones de parámetros y una ventana de contexto de 2048 tokens, es un modelo que cabe en cualquier GPU de consumo y que sirve como banco de pruebas para estudiar dinámicas de transferencia interlingüística, olvido catastrófico y calidad de generación en lenguas de bajos recursos.

El autor declara explícitamente que el modelo está destinado a su investigación y que no ha sido evaluado de forma amplia. No hay benchmarks publicados ni métricas de calidad en feroés, y el número de descargas y valoraciones en Hugging Face es cero en el momento de redactar esta ficha. Debe tratarse, por tanto, como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según el tag `llama`; derivado de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | feroés (`fo`); el modelo base y el paso intermedio estaban en inglés y noruego bokmål |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM2-135M-Instruct: un transformer decoder-only de 134,5 millones de parámetros con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. El modelo parte ya instruido y ajustado por alineación en inglés, de modo que el CPT no introduce la arquitectura sino que desplaza la distribución lingüística de los pesos hacia el feroés. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

El entrenamiento se realizó en dos fases sobre el corpus FineWeb-2: una época en el subconjunto de noruego bokmål y cinco épocas en el subconjunto de feroés. Los hiperparámetros declarados son learning rate 5e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo de 256), longitud máxima de 2048 tokens y semilla 3, una de tres semillas de esta misma configuración. El cómputo se ejecutó en una única A100 de 40 GB. No se especifica el número total de tokens procesados, la composición exacta del dataset más allá de FineWeb-2 ni si hubo etapas posteriores de RLHF o DPO tras el CPT.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la capacidad instruct del modelo base.
- Comprensión y generación en feroés tras el CPT, con posible retención parcial de noruego bokmål e inglés por el modelo de partida.
- Razonamiento básico y respuesta a instrucciones de complejidad baja, limitado por el tamaño de 135M parámetros.
- Soporte de tool calling / function calling: no disponible de forma documentada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma documentada; el tamaño del modelo lo hace poco adecuado para estas tareas.
- Capacidades multilingües: limitadas al feroés declarado; no se documenta cobertura de otras lenguas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre transferencia interlingüística: el modelo permite comparar, junto con las otras dos semillas de la misma configuración, el efecto de preentrenar en noruego bokmål antes de adaptar al feroés, midiendo perplejidad y calidad de generación en el idioma objetivo.
- Generación de texto sintético en feroés para aumentación de datos: puede producir borradores de frases y párrafos que, tras revisión humana, amplíen corpus pequeños en una lengua de bajos recursos.
- Prototipado de asistentes conversacionales en feroés: con 134,5M de parámetros y 2048 tokens de contexto, cabe en una GPU de consumo y permite iterar rápidamente sobre interfaces de chat antes de escalar a modelos mayores.
- Experimentos de olvido catastrófico: al partir de un modelo instruido en inglés y entrenar cinco épocas en feroés, sirve para estudiar cuánto inglés y noruego conserva y cómo degrada sus capacidades originales.
- Evaluación de pipelines de CPT: el repositorio documenta hiperparámetros completos (LR, scheduler, warmup, batch efectivo, semilla), lo que lo convierte en una referencia reproducible para validar recetas de entrenamiento continuado.
- Docencia y divulgación: su tamaño reducido y su licencia Apache 2.0 permiten desplegarlo en entornos educativos para explicar el funcionamiento de un transformer decoder-only y el proceso de adaptación lingüística.
- Filtrado y clasificación ligera de texto en feroés: con ajuste fino supervisado posterior podría usarse para tareas de etiquetado simple, aunque no está entrenado para ello de serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía" y la model card no incluye métricas de MMLU, HumanEval, GSM8K ni perplejidad en feroés.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en fp32 (134,5M × 4 bytes), unos 0,54 GB en fp16/bf16 contando pesos y overhead de activaciones, y menos de 1 GB en cualquier configuración práctica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento documentado se hizo en una A100 de 40 GB, pero la inferencia no requiere hardware de centro de datos.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series GTX 10xx y anteriores), en GPUs integradas modernas y en CPU.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo se espera latencia de milisegundos por token en GPU moderna y throughput alto en batch, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed3 | 134,5M | 2048 | Feroés | Apache 2.0 | Experimental, sin benchmarks |
| SmolLM2-135M-Instruct (modelo base) | 135M | 8192 (según ficha del modelo original) | Inglés principalmente | Apache 2.0 | Publicado y evaluado por Hugging Face |
| jekunz/smollm-135m-cpt-fineweb-norwegian-bokmaal (modelo base directo) | 135M | 2048 | Noruego bokmål | Apache 2.0 | Experimental, sin benchmarks |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, contexto, idioma y licencia. No se identifican en la información proporcionada otros modelos de 135M específicamente adaptados al feroés.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara que no ha sido evaluado más ampliamente; no hay métricas de calidad, perplejidad ni pruebas humanas en feroés.
- Riesgo alto de alucinación: con 135M de parámetros y cinco épocas sobre un corpus web, la generación puede ser incoherente o factualmente incorrecta, especialmente en temas especializados.
- Sesgos de FineWeb-2: al entrenarse sobre un subconjunto de web crawls, puede reproducir sesgos, toxicidad y ruido presentes en el corpus, con escasa mitigación posterior.
- Contexto corto: la ventana de 2048 tokens limita conversaciones largas y tareas de recuperación o resumen de documentos extensos.
- Cobertura lingüística restringida: solo se declara feroés; el comportamiento en inglés o noruego bokmål tras el CPT no está documentado y puede haberse degradado (olvido catastrófico).
- Sin tool calling ni capacidades de agente documentadas: no debe integrarse en pipelines que dependan de function calling sin validación previa.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de SmolLM2 conviene verificar las condiciones del modelo base y de los datos de FineWeb-2 antes de un despliegue comercial.
- Artefacto de investigación: no hay garantías de mantenimiento, soporte ni actualizaciones; el repositorio tiene cero descargas y cero valoraciones.
- Una de tres semillas: los resultados pueden variar entre las semillas 1, 2 y 3 de la misma configuración, por lo que conclusiones extraídas de esta variante concreta deben contrastarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed3
- Modelo base directo (noruego bokmål): https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-norwegian-bokmaal
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (modelo de partida, referencia de la familia SmolLM2): no disponible en la información proporcionada como enlace directo; se cita por el nombre en la model card.
