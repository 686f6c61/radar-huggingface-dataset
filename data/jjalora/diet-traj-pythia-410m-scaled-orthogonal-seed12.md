# jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed12

## Resumen

El modelo `jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed12` es un checkpoint de investigación que reproduce desde cero el entrenamiento de Pythia-410M, el modelo de lenguaje abierto desarrollado originalmente por EleutherAI. Forma parte de la campaña DIET, un experimento de estudio del espacio de pesos que entrena múltiples ejecuciones idénticas del mismo modelo variando únicamente la semilla aleatoria y el esquema de inicialización de pesos. En este caso concreto, el esquema de inicialización es `scaled_orthogonal` y la semilla es 12.

El modelo emplea la arquitectura GPT-NeoX (transformer decoder-only con atención multi-cabeza estándar) y 410 millones de parámetros, con la misma receta de entrenamiento que Pythia: el flujo de tokens de `EleutherAI/pile-standard-pythia-preshuffled`, AdamW con learning rate 3e-4, decaimiento coseno y 143.000 pasos de entrenamiento. El resultado es un modelo de lenguaje en inglés entrenado desde cero sobre The Pile, útil como objeto de estudio para analizar cómo la inicialización y la semilla afectan a la trayectoria de entrenamiento y al modelo final.

Su relevancia es principalmente metodológica y de investigación: no está pensado como modelo de producción, sino como una pieza dentro de un conjunto de ejecuciones comparables que permiten estudiar la variabilidad del entrenamiento, la reproducibilidad y las propiedades del espacio de pesos. La model card no documenta capacidades, benchmarks ni casos de uso de producción, por lo que esta ficha se limita a describir lo que el autor declara explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parámetros totales | 410 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Pythia-410M usa 2048 tokens, pero el autor no lo declara) |
| Tipos de cuantización | no disponible (los pesos se publican en float16 safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16), checkpoints por ramas `stepN` |
| Biblioteca | transformers |
| Dataset de entrenamiento | EleutherAI/pile-standard-pythia-preshuffled |
| Semilla | 12 |
| Esquema de inicialización | `scaled_orthogonal` |
| Tamaño del repositorio | 8,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-410M, es decir, un transformer decoder-only de la familia GPT-NeoX, con el mismo `pythia-410m.yml` de EleutherAI como receta. El entrenamiento se realizó desde cero sobre el flujo de tokens prebarajado de The Pile (`EleutherAI/pile-standard-pythia-preshuffled`), con batch mundial de 1024 secuencias de 2048 tokens, AdamW con learning rate 3e-4, betas (0,9, 0,95), weight decay 0,1 sin decaimiento en LayerNorm ni sesgos, grad clipping 1,0, decaimiento coseno hasta 3e-5 durante 143.000 pasos y 1.430 pasos de warmup. Se usó autocast fp16 con pesos maestros en fp32.

La innovación metodológica del checkpoint no está en la arquitectura, sino en el esquema de inicialización: `scaled_orthogonal`, distinto del `small_init + wang_init` que usa Pythia por defecto. El autor documenta que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, y que el esquema `pythia` coincide con la distribución por tensor de `EleutherAI/pythia-410m` en la revisión `step0`, verificado mediante un test (`tests/test_pythia_step0_init_match.py`). El entrenamiento se ejecutó en 4 nodos con 4 GPUs A100-PCIE-40GB por nodo, micro-batch de 4, según `campaign.json`.

## Capacidades

- Generación de texto en inglés: es un modelo de lenguaje causal entrenado sobre The Pile, por lo que puede completar texto y responder a prompts en inglés.
- Modelado de lenguaje y perplejidad: adecuado para evaluación de likelihood y análisis de distribuciones de tokens.
- Checkpoints intermedios: la rama `stepN` (N en {0, 1, 2, 4, …, 512} y cada 100 pasos) permite estudiar la evolución del modelo a lo largo del entrenamiento.
- Reproducibilidad controlada: al compartir receta, datos y orden de tokens con otras ejecuciones de la campaña, permite comparaciones entre semillas e inicializaciones.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Estudio de la variabilidad del entrenamiento: comparar este checkpoint (semilla 12, `scaled_orthogonal`) con otras ejecuciones de la campaña DIET para medir cuánto difieren los modelos finales en función de la semilla y la inicialización, manteniendo datos y receta constantes.
- Análisis del espacio de pesos: usar los pesos finales e intermedios para estudiar la geometría del espacio de parámetros, la interpolación entre ejecuciones o la estabilidad de las representaciones internas.
- Investigación en reproducibilidad: emplear la receta documentada (AdamW, batch, pasos, dataset prebarajado) para replicar condiciones de entrenamiento y validar metodologías de comparación entre frameworks.
- Evaluación de esquemas de inicialización: contrastar `scaled_orthogonal` frente al esquema `pythia` estándar en términos de convergencia, pérdida final y propiedades del modelo resultante.
- Docencia y experimentación académica: modelo de 410M parámetros que cabe en hardware modesto y sirve para ilustrar el ciclo completo de preentrenamiento de un LLM desde cero.
- Análisis de trayectorias de entrenamiento: los checkpoints intermedios permiten estudiar la dinámica de aprendizaje, el olvido catastrófico o la formación de circuitos a lo largo de los pasos.
- Base para fine-tuning experimental: al ser un modelo pequeño con licencia Apache 2.0, puede servir como punto de partida para experimentos de ajuste supervisado en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 410M parámetros, en fp16 el modelo ocupa aproximadamente 0,8 GB de pesos; en fp32, unos 1,6 GB. La VRAM total dependerá del contexto y del tamaño de batch, pero es holgada en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en fp16; el entrenamiento original usó A100-PCIE-40GB en 4 nodos de 4 GPUs.
- ¿Cabe en GPU de consumo? Sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se ajuste el contexto y el batch.
- Opciones de despliegue: al ser un modelo `transformers` con arquitectura GPT-NeoX, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión). La model card no documenta despliegues probados.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed12` | 410M | no disponible | Apache 2.0 | HuggingFace | Checkpoint de investigación de la campaña DIET |
| `EleutherAI/pythia-410m` | 410M | 2048 | Apache 2.0 | HuggingFace | Modelo base de referencia con esquema de inicialización estándar |
| `EleutherAI/pythia-410m-deduped` | 410M | 2048 | Apache 2.0 | HuggingFace | Variante entrenada sobre The Pile deduplicado |

La comparación con otros modelos de la misma categoría (por ejemplo, GPT-2 small o modelos de 400M de otras familias) no está documentada en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción; la model card no documenta evaluaciones de calidad, seguridad ni alineación.
- Sesgos conocidos: al entrenarse sobre The Pile, hereda los sesgos de ese corpus; no se documentan análisis específicos de sesgo en la información disponible.
- Riesgo de alucinación: como cualquier modelo de lenguaje causal, puede generar contenido factualmente incorrecto; no se han publicado evaluaciones de fidelidad.
- Limitaciones de idioma: el modelo está etiquetado únicamente como inglés (`en`); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las condiciones del dataset original (The Pile) para usos derivados.
- Caveat de reproducibilidad: el autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks; las comparaciones con Pythia deben hacerse a nivel de distribución, no de bits.
- Contexto: la model card no declara la longitud de contexto; aunque Pythia-410M usa 2048 tokens, no se confirma explícitamente para este checkpoint.
- Checkpoints parciales: las ramas `stepN` contienen solo pesos en float16; no incluyen estado del optimizador ni del scheduler, lo que limita la reanudación exacta del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed12
- Repositorio de Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Dataset: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Código de entrenamiento y esquemas de inicialización (`src/init_schemes.py`): no disponible como enlace directo en la información proporcionada.
