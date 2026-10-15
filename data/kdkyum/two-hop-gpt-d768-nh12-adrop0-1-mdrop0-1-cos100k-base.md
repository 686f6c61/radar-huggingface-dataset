# kdkyum/two-hop-gpt-d768-nh12-adrop0.1-mdrop0.1-cos100k-base

## Resumen

El modelo `kdkyum/two-hop-gpt-d768-nh12-adrop0.1-mdrop0.1-cos100k-base` es un conjunto de nueve ejecuciones independientes (tres semillas por cada valor de weight decay 1, 3 y 5) de una red GPT-NeoX entrenada desde cero por el usuario independiente kdkyum. No es un modelo de propósito general: es un artefacto de investigación diseñado para estudiar el razonamiento de dos saltos (*two-hop*, relaciones de parentesco) sobre documentos familiares sintéticos del dataset `c5_m16_N90/base_graph`, compuesto por 16 nombres de pila y 90 familias. La arquitectura es un transformer decoder-only de 768 dimensiones de modelo, 12 cabezas de 64 dimensiones y 12 capas, con LayerNorm, rotary positional embeddings con base 100.000, MLP con activación ReLU y sesgos lineales.

El tamaño total declarado por el autor es de 85,2 millones de parámetros, con un presupuesto de entrenamiento de 100.000 pasos bajo un schedule coseno y ventanas de documento completas de 1.997 tokens (cada documento representado como una fila única con pérdida sobre todos los tokens). En la evaluación held-out de dos saltos, siete de las nueve ejecuciones alcanzan una precisión máxima de 1,0000 y varias mantienen valores cercanos a 1,0 en el último checkpoint, lo que lo convierte en un banco de pruebas reproducible para analizar cómo la regularización (dropout de atención y de MLP a 0,1) y el weight decay afectan a la velocidad de convergencia de razonamiento composicional.

Su relevancia actual es acotada pero clara: es un caso de estudio abierto, con licencia MIT, del que se publican checkpoints cada 10.000 pasos y evaluación cada 250 pasos, lo que permite reproducir curvas de aprendizaje y analizar circuitos internos en un modelo que cabe en cualquier GPU de consumo. No sustituye a un modelo de lenguaje generalista y no está pensado para tareas de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-NeoX: LayerNorm, RoPE con base 100.000 en cada dimensión de cabeza, MLP con ReLU, sesgos lineales, inicialización neox con desviación 0,02 |
| Parametros totales | 85,2 millones (cifra indicada en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible explícitamente; entrenado con filas de documento de 1.997 tokens |
| Tipos de cuantizacion | no disponible; el repositorio publica safetensors sin versiones GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | no disponible (entrenamiento exclusivo sobre corpus sintético de nombres y familias) |
| Licencia | MIT |
| Formato de pesos | safetensors (carpetas `ckpt_<step>/`, cargables con `GPTNeoXForCausalLM.from_pretrained`), además de `config.json`, `vocab.json` y `log.jsonl` por ejecución |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso (sin mezcla de expertos) de 12 capas con `d_model` 768 y 12 cabezas de 64 dimensiones. Usa LayerNorm, rotary positional embeddings aplicados sobre cada dimensión de cabeza con base 100.000 y una MLP de activación ReLU. La inicialización es neox con desviación estándar 0,02 y las capas lineales conservan sus sesgos. En los datos, cada punto («.») se escribe como el token `<bos>` y existe un token `<pad>` independiente.

El entrenamiento parte del script `train.py` (/two-hop-gpt/train.py) y del dataset `c5_m16_N90/base_graph`, formado por documentos familiares sintéticos completos de 1.997 tokens, cada uno comenzando por `<bos>` y con pérdida calculada sobre todos los tokens. Se usa AdamW con beta2 0,95, epsilon 1e-8, learning rate 3e-4 con 500 pasos de warmup y decaimiento coseno hasta 0 en el paso 100.000, recorte de gradiente por norma 1 y weight decay únicamente sobre matrices de pesos y embeddings. Se aplica dropout de 0,1 sobre los pesos de atención (`attention_dropout`) y 0,1 sobre la salida ReLU de cada MLP (`mlp_dropout`, atributo extra de configuración que `train.py` convierte en `Sequential(ReLU, Dropout)`); no hay dropout oculto. Las nueve ejecuciones corresponden a weight decay 1, 3 y 5 combinados con las semillas 41, 42 y 43. La evaluación se ejecuta cada 250 pasos y los checkpoints se guardan cada 10.000 pasos, por lo que el mejor paso suele caer entre checkpoints almacenados. Conviene tener en cuenta que un `from_pretrained` estándar ignora `mlp_dropout`, algo que no altera nada en modo evaluación.

## Capacidades

- Generación autoregresiva de texto sobre documentos familiares sintéticos del dominio `c5_m16_N90` (16 nombres de pila, 90 familias).
- Razonamiento de dos saltos sobre relaciones de parentesco: precisión held-out de hasta 1,0000 en las ejecuciones con weight decay 3 y semilla 42 o 43.
- Capacidad de continuar/completear documentos que comienzan con `<bos>` y en los que el punto se ha tokenizado como `<bos>`.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso fuera del patrón two-hop estudiado.
- No hay evidencias de capacidades multilingües; los idiomas soportados no están declarados.
- No es un modelo instruct ni chat: no ha pasado por RLHF, DPO ni ajuste de instrucciones.
- No tiene capacidades de visión, audio, ni modo de pensamiento (*thinking mode*).
- Capacidad instrumental destacable: sirve como sujeto de experimentos controlados de regularización y análisis de representaciones internas.

## Casos de uso

- Investigación en razonamiento composicional (two-hop): el modelo resuelve cadenas de parentesco de dos saltos sobre documentos sintéticos, lo que permite estudiar qué capas y cabezas codifican la primera y la segunda relación de la cadena.
- Interpretabilidad mecanística: al ser un modelo de 85,2 millones de parámetros con checkpoints cada 10.000 pasos, es viable aplicar *probing*, análisis de atención o *activation patching* sobre la evolución temporal de un circuito concreto sin necesitar clústeres de GPU.
- Ablación de hiperparámetros de regularización: las nueve ejecuciones permiten comparar de forma directa cómo el weight decay (1, 3 y 5) altera el paso en el que se alcanza el 0,99 de precisión de dos saltos (desde el paso 30.000 con wd 3, semilla 43, hasta el 72.000 con wd 5, semilla 42).
- Estudio de estabilidad entre semillas: con tres semillas por configuración se puede medir la varianza de la precisión final (por ejemplo, 0,9563, 0,9672 y 0,9941 en los últimos checkpoints con wd 1 frente a 1,0000 en las tres semillas con wd 3).
- Validación de pipelines de evaluación: la evaluación cada 250 pasos y el registro en `log.jsonl` permiten comprobar herramientas de seguimiento de métricas y de comparación de checkpoints en un caso reproducible y barato.
- Docencia y prototipado de entrenamiento: un modelo de este tamaño se puede entrenar y servir en una única GPU de consumo, lo que lo hace útil para enseñar schedules cosenos, warmup, dropout y recorte de gradiente con un coste de cómputo bajo.
- Baseline en investigación sobre datos sintéticos: sirve como punto de comparación frente a otros repositorios de la misma familia (`two-hop-gpt-hits`, `two-hop-gpt-wsd-nh4`) que estudian el mismo problema con otras configuraciones (por ejemplo, learning rate 1e-4 y filas de 1.024 tokens en `two-hop-gpt-hits`).
- Análisis de memorización y generalización en corpus generados: al ser un dataset controlado de familias y nombres, permite medir si el modelo generaliza la relación o la memoriza, inspeccionando los checkpoints intermedios.

## Benchmarks y rendimiento

El autor publica únicamente precisión held-out de dos saltos (*two-hop accuracy*), evaluada cada 250 pasos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible.

| weight_decay | semilla | pasos entrenados | max two-hop accuracy (paso) | primer paso >= 0,99 | ultima two-hop accuracy | ultimo checkpoint |
|---|---|---|---|---|---|---|
| 1 | 41 | 86.100 | 1,0000 (80.000) | 42.500 | 0,9941 | 80.000 |
| 1 | 42 | 86.620 | 0,9866 (72.750) | - | 0,9563 | 80.000 |
| 1 | 43 | 100.000 | 0,9959 (80.750) | 47.000 | 0,9672 | 100.000 |
| 3 | 41 | 100.000 | 1,0000 (96.500) | 32.000 | 0,9999 | 100.000 |
| 3 | 42 | 100.000 | 1,0000 (78.500) | 36.250 | 1,0000 | 100.000 |
| 3 | 43 | 100.000 | 1,0000 (65.750) | 30.000 | 1,0000 | 100.000 |
| 5 | 41 | 100.000 | 1,0000 (83.000) | 59.750 | 0,9990 | 100.000 |
| 5 | 42 | 100.000 | 0,9936 (80.750) | 72.000 | 0,9845 | 100.000 |
| 5 | 43 | 100.000 | 1,0000 (83.000) | 59.000 | 1,0000 | 100.000 |

Observaciones derivadas de la tabla: las ejecuciones con weight decay 3 son las más consistentes (1,0000 en la última evaluación de las tres semillas) y también las que alcanzan antes el umbral de 0,99; el weight decay 5 retrasa ese umbral y muestra más varianza entre semillas. El repositorio hermano `two-hop-gpt-hits` indica que sus ejecuciones alcanzaron `eval_acc/two_hop` de 0,99 en alguna evaluación, pero no se aportan cifras detalladas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,34 GB en fp32 (85,2 millones de parámetros) y unos 0,17 GB en fp16/bf16, sin contar el vocabulario ni los buffers de activaciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o incluso una GTX 1650 sirven sin problema. También es viable la inferencia en CPU.
- Cabe en GPU de consumo: sí, con enorme margen, en cualquier GPU consumer moderna y en muchas integradas.
- Almacenamiento: el repositorio completo ocupa 29,3 GB, dominado por los checkpoints secuenciales de las nueve (más) ejecuciones cada 10.000 pasos; conviene descargar solo la carpeta `ckpt_<step>/` de la ejecución de interés.
- Opciones de despliegue: `transformers` con `GPTNeoXForCausalLM.from_pretrained` es la vía documentada. No se publican pesos GGUF, por lo que `llama.cpp` u `Ollama` requerirían una conversión propia; vLLM o TGI son teóricamente compatibles con la arquitectura GPT-NeoX, pero no hay configuración ni validación publicada.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia para ninguna configuración de hardware.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con modelos generalistas, y las alternativas del mismo autor no documentan especificaciones completas. La comparación se limita a lo declarado en los repositorios de la misma familia:

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `two-hop-gpt-d768-nh12-adrop0.1-mdrop0.1-cos100k-base` | 85,2 M | no disponible (filas de 1.997 tokens) | two-hop accuracy de hasta 1,0000 | MIT | HuggingFace, 0 descargas |
| `two-hop-gpt-hits` | no disponible | no disponible (filas de 1.024 tokens citadas) | `eval_acc/two_hop` de 0,99 en alguna evaluación (7 ejecuciones del barrido d768) | no disponible en la información | HuggingFace |
| `two-hop-gpt-wsd-nh4` | no disponible (nh4, configuración distinta) | no disponible | no disponible | no disponible en la información | HuggingFace |
| Modelos generalistas de tamaño similar (por ejemplo, GPT-2 small o Pythia-70M) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de propósito general no es significativa: este modelo no ha sido entrenado para seguir instrucciones, responder preguntas abiertas ni generar código, de modo que cualquier comparación de MMLU o HumanEval carecería de sentido.

## Limitaciones y advertencias

- Dominio cerrado: el modelo se ha entrenado exclusivamente sobre documentos familiares sintéticos (`c5_m16_N90`), por lo que fuera de ese formato la generación carece de valor y muy probablemente degenerará.
- No es un modelo de instrucciones ni de chat: no ha recibido RLHF, DPO ni ajuste supervisado, y no responde a prompts en lenguaje natural.
- Riesgo alto de alucinación y de salidas incoherentes en cualquier contexto ajeno al corpus de entrenamiento, incluido el propio dominio si el documento difiere del patrón de 1.997 tokens con `<bos>`.
- Los idiomas soportados no están declarados; el vocabulario se distribuye como `vocab.json` pero su tamaño y composición no se especifican, lo que impide afirmar cobertura multilingüe.
- Sesgos conocidos: no se ha publicado ningún análisis de sesgos. El corpus procede de nombres de pila y estructuras familiares sintéticas, por lo que puede reflejar los sesgos de la plantilla de generación empleada, pero no hay evaluación disponible.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución, pero el modelo no tiene aplicación comercial práctica y su uso en producción requeriría un dominio idéntico al sintético.
- Caveat técnico: `from_pretrained` estándar ignora el atributo `mlp_dropout` de la configuración, de modo que la arquitectura cargada no reproduce ese dropout; el autor señala que no afecta a la evaluación.
- Caveat de reproducibilidad: las ejecuciones con menos de 100.000 pasos seguían entrenando en el momento de la subida, y el mejor paso suele caer entre checkpoints guardados porque la evaluación es más frecuente (250 pasos) que el guardado (10.000 pasos).
- Caveat de fecha: las marcas temporales del repositorio (creación el 14 de octubre de 2026, resultados «as of 2026-10-15») figuran tal cual en la información disponible y no se han podido verificar.
- Sin métricas de producción: no hay datos de latencia, throughput, consumo de memoria en servicio ni pruebas de robustez frente a entradas adversarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdkyum/two-hop-gpt-d768-nh12-adrop0.1-mdrop0.1-cos100k-base
- Repositorio hermano `two-hop-gpt-hits`: https://huggingface.co/kdkyum/two-hop-gpt-hits
- Repositorio hermano `two-hop-gpt-wsd-nh4`: https://huggingface.co/kdkyum/two-hop-gpt-wsd-nh4
- Paper, blog o demo asociados: no disponible
- Repositorio de código (`train.py`): no disponible públicamente; la model card lo referencia como /two-hop-gpt/train.py en Dropbox
