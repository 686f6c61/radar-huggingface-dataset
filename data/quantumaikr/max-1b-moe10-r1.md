# quantumaikr/max-1b-moe10-r1

## Resumen

max-1b-moe10-r1 es un checkpoint de investigación temprana publicado por quantumaikr. Se trata del primer entrenamiento desde cero de la arquitectura "max 1B mixture-of-experts", un transformer MoE de 1,12 mil millones de parámetros totales con 149 millones activos por token. El modelo solo ha sido entrenado durante aproximadamente 0,9 mil millones de tokens, por lo que el propio autor lo describe como "no utilizable todavía" y con una pérdida en validación que aún supera a la de su modelo menor max-0.1b-v1.

El interés del checkpoint es fundamentalmente metodológico: documenta la primera ejecución de una forma MoE concreta (64 expertos, top-2, FFN de experto de dimensión 320) sobre una mezcla de datos centrada en coreano (60% del corpus entre web y PDF) e inglés educativo y matemáticas. No es un modelo para producción ni para evaluación comparativa de capacidades, sino un punto de partida reproducible para entrenamiento continuado.

La relevancia actual es limitada fuera del ámbito de investigación: no hay pipeline definido, no se han publicado benchmarks de tareas y los pesos se distribuyen como checkpoints crudos de PyTorch, no como modelo de transformers. La licencia Apache 2.0 permite reutilización, pero la utilidad práctica del artefacto es la de un experimento de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), 16 capas, hidden 1024, 16 cabezas de atención / 4 cabezas KV (head_dim 128) |
| Parametros totales | 1,12B |
| Parametros activos | 149M por token |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints en punto flotante de PyTorch) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints PyTorch crudos (`final.pt`, `stable_pre_decay_1b.pt`), no safetensors ni GGUF |

Otros datos relevantes: 64 expertos con enrutamiento top-2, FFN de experto de dimensión 320, vocabulario de 32.000 tokens con tokenizador BPE, tamaño del repositorio de 13,9 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capas de mezcla de expertos: 16 capas, dimensión oculta 1024, 16 cabezas de atención con 4 cabezas KV (atención con cabezas KV compartidas, head_dim 128), 64 expertos por capa con enrutamiento top-2 y FFN de experto de dimensión 320. El vocabulario es de 32.000 tokens con tokenizador BPE propio. La ventana de contexto es de 1024 tokens.

El entrenamiento cubre 0,90B tokens con un schedule WSD (warmup-stable-decay), optimizador Muon y un tamaño de lote de 0,5M tokens. La mezcla de datos "stable" es: web coreano 40%, PDF coreano 20%, inglés educativo 25%, inglés educativo de alta calidad 8% y matemáticas 7%. No se menciona RLHF, DPO ni ningún ajuste posterior al preentrenamiento. El repositorio incluye dos checkpoints: `final.pt` (paso 1795, fin del cooldown, con estado del modelo y del optimizador) y `stable_pre_decay_1b.pt` (paso 1455, 0,72B tokens, guardado al inicio del decaimiento de learning rate y pensado como punto de reanudación para preentrenamiento continuado). También se publican `config.json`, `tokenizer.json`, `log.jsonl` y `SHA256SUMS` para verificación de descargas.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el escaso entrenamiento (0,9B tokens) y por un contexto de solo 1024 tokens.
- Cobertura lingüística de coreano e inglés, con mayor peso del coreano en la mezcla de datos.
- Exposición a matemáticas (7% del corpus) e inglés educativo, sin evidencia publicada de rendimiento en tareas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- El propio autor indica que el checkpoint no es un modelo utilizable todavía.

## Casos de uso

- Investigación sobre arquitecturas MoE: el checkpoint permite inspeccionar el comportamiento de un MoE de 64 expertos top-2 con 149M parámetros activos y comparar su pérdida con la de un modelo denso menor (max-0.1b-v1).
- Preentrenamiento continuado: `stable_pre_decay_1b.pt` está guardado al inicio del decaimiento de learning rate precisamente para reanudar el entrenamiento desde 0,72B tokens, lo que lo hace adecuado como base para experimentos de continuación con nuevos datos o schedules.
- Reproducibilidad de recetas de entrenamiento: el repositorio incluye `log.jsonl` con pérdida, throughput y evaluaciones, útil para auditar la curva de entrenamiento y el efecto del schedule WSD y del optimizador Muon.
- Estudio de mezclas de datos multilingües coreano-inglés: la mezcla documentada (60% coreano entre web y PDF, 33% inglés educativo, 7% matemáticas) sirve como referencia para diseñar experimentos de composición de corpus.
- Desarrollo de tokenizadores y pipelines de datos para coreano: el tokenizador BPE de 32.000 tokens puede analizarse para estudiar la cobertura léxica en coreano web y PDF.
- Validación de infraestructura de entrenamiento: con 1,12B parámetros totales y 149M activos, el modelo es un banco de pruebas manejable para verificar pipelines de entrenamiento distribuido, checkpoints y reanudación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta pérdida en validación y bits por byte en el paso 1795:

| Conjunto de validación | Pérdida | Bits por byte |
|---|---|---|
| ko_val | 3,195 | 0,944 |
| en_val | 2,972 | 1,063 |
| kopdf_val | 2,337 | 0,837 |
| math_val | 2,159 | 1,000 |
| gov_val | 2,296 | 0,880 |

El autor indica que, en pérdida sobre datos reservados, el modelo sigue por detrás de max-0.1b-v1, un modelo más pequeño.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1,12B parámetros totales, una carga en FP16 requeriría aproximadamente 2,2 GB solo para pesos, más estado del optimizador si se carga el checkpoint completo (que incluye optimizer state y puede acercarse a los 13,9 GB del repositorio). El enrutamiento MoE top-2 mantiene el coste de cómputo por token bajo (149M activos), pero la memoria de pesos corresponde al total.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 8 GB de VRAM podría alojar los pesos en precisión reducida, aunque no hay soporte documentado de carga en transformers ni en motores de inferencia.
- GPU de consumo: probablemente viable en RTX 3060/4060 y superiores por tamaño de pesos, pero sin herramientas de despliegue publicadas no puede confirmarse.
- Opciones de despliegue: no disponibles. Los pesos son checkpoints PyTorch crudos (`torch.load(..., weights_only=False)`, pesos bajo la clave `model`), no un modelo de transformers, por lo que no hay integración directa con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El log de entrenamiento incluye métricas de throughput, pero no se han publicado cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| max-1b-moe10-r1 | 1,12B | 149M | 1024 | Apache 2.0 | Checkpoint de investigación, no utilizable |
| max-0.1b-v1 (quantumaikr) | no disponible (menor que 1B) | denso | no disponible | no disponible | Según el autor, mejor pérdida en validación que max-1b-moe10-r1 |
| Alternativas MoE de ~1B de otros autores | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La única comparación documentada es interna, contra max-0.1b-v1, y desfavorable en pérdida para el modelo MoE. No hay datos de benchmarks que permitan comparar con modelos de la misma categoría de otros desarrolladores.

## Limitaciones y advertencias

- El autor declara explícitamente que es un checkpoint de investigación temprana y que no es un modelo utilizable todavía.
- Entrenado solo con 0,90B tokens, muy por debajo de lo habitual para modelos de este tamaño; la pérdida en validación supera a la de un modelo menor del mismo autor.
- Contexto muy corto (1024 tokens), insuficiente para la mayoría de aplicaciones de conversación o documentos largos.
- Cobertura limitada a coreano e inglés; no hay datos sobre otros idiomas.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinación; al ser un modelo apenas preentrenado, el riesgo de generación incoherente o inventada es alto.
- No hay soporte de tool calling, agentes ni integración con frameworks de inferencia estándar.
- Los pesos son checkpoints PyTorch crudos que requieren `torch.load` con `weights_only=False`; esto implica riesgo de seguridad al cargar ficheros pickle de origen no verificado, por lo que conviene comprobar `SHA256SUMS`.
- La licencia Apache 2.0 permite uso comercial, pero el estado del modelo hace inviable cualquier despliegue en producción.
- El repositorio ocupa 13,9 GB por incluir estado del optimizador; no es un paquete ligero para distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quantumaikr/max-1b-moe10-r1
- Modelo de referencia del mismo autor: https://huggingface.co/quantumaikr/max-0.1b-v1
