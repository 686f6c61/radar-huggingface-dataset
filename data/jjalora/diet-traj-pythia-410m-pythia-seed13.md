# jjalora/diet-traj-pythia-410m-pythia-seed13

## Resumen

`jjalora/diet-traj-pythia-410m-pythia-seed13` es un checkpoint de investigación, no un modelo listo para producción: se trata de una repetición desde cero (*from scratch*) del preentrenamiento de Pythia-410M, ejecutada dentro de la campaña de exploración del espacio de pesos denominada DIET. Lo publica el usuario `jjalora` y su interés radica en que permite comparar trayectorias de entrenamiento en el espacio de pesos frente a las de EleutherAI, manteniendo constante todo salvo la semilla aleatoria y el esquema de inicialización.

El modelo reutiliza la receta abierta de Pythia (`models/410M/pythia-410m.yml`): misma arquitectura GPT-NeoX, mismo flujo de tokens y mismo orden de batches del dataset `EleutherAI/pile-standard-pythia-preshuffled`, con AdamW, learning rate 3e-4, cosine hasta 3e-5, 143.000 pasos y batch global de 1024 secuencias de 2048 tokens (≈300.000 millones de tokens). La diferencia entre ejecuciones es únicamente la semilla (13 en este caso) y el esquema de inicialización (`pythia`, es decir, `small_init` + `wang_init` de GPT-NeoX).

Su relevancia es metodológica: al ser una base no instruida, con licencia Apache 2.0 y checkpoints intermedios accesibles por ramas (`step0`, `step1`, `step2`, `step4`, …, `step512` y cada 100 pasos), sirve como material para estudios de interpretabilidad, análisis de trayectorias de entrenamiento y reproducibilidad. No es un modelo conversacional ni ha sido sometido a ajuste por instrucciones o preferencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX), idéntica a la receta Pythia-410M |
| Parámetros totales | ~410 M (heredado de la arquitectura Pythia-410M) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 2.048 tokens (heredado de la arquitectura Pythia-410M; no se explicita en la model card) |
| Tipos de cuantización | No se distribuyen cuantizaciones oficiales; los pesos se publican en float16 safetensors y son convertibles a GGUF/AWQ/GPTQ por terceros |
| Idiomas soportados | Inglés (`language: en`); el corpus de entrenamiento es The Pile |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors float16, en ramas `stepN` y en `main` (pesos finales) |
| Tamaño del repositorio | 46,2 GB (incluye todos los checkpoints de la trayectoria) |
| Pipeline de HuggingFace | No disponible |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-410M: un transformer decoder-only de tipo GPT-NeoX, denso, con atención causal estándar y el vocabulario de GPT-NeoX. La model card indica que se mantienen "same architecture, same token stream and order" respecto a la receta original, y que la inicialización `pythia` reproduce la *distribución* por tensor de `EleutherAI/pythia-410m` en la revisión `step0` (verificado en `tests/test_pythia_step0_init_match.py`), aunque no es posible una reproducción bit a bit del RNG de inicialización entre frameworks.

El entrenamiento usa `EleutherAI/pile-standard-pythia-preshuffled` con un mapeo determinista (el batch *i* corresponde a las filas [i·1024, (i+1)·1024]), AdamW con lr 3e-4, betas (0,9; 0,95), weight decay 0,1 sin decaimiento en LayerNorm ni biases, grad clip 1,0, 1.430 pasos de warmup y schedule cosine hasta 3e-5 durante 143.000 pasos. Con batch global de 1024 × 2048 tokens, esto equivale a aproximadamente 300.000 millones de tokens vistos. El cómputo se hizo en fp16 con pesos maestros en fp32, sobre 1 nodo con 4 GPU H100-SXM5-80GB y micro-batch de 16 (job 9063, iniciado el 2026-10-23). No se aplicó deduplicación global del dataset, RLHF, DPO ni ningún ajuste posterior: es un modelo base puro.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste instruccional.
- Modelado de lenguaje y cálculo de perplejidad sobre texto de dominio general (estilo The Pile: web, papers, código, libros, foros).
- Continuación de texto y evaluación de *prompting* few-shot mediante ejemplos en contexto.
- Reproducción de trayectorias de entrenamiento: cada rama `stepN` permite analizar el estado de los pesos en un paso concreto.
- Extracción de representaciones internas (hidden states, atenciones) para experimentos de interpretabilidad, al ser compatible con `transformers` y con las herramientas habituales para GPT-NeoX.
- No soporta de forma nativa *tool calling*, function calling, modo *thinking*, visión, audio ni razonamiento multi-paso con agentes; cualquier capacidad de ese tipo requeriría ajuste adicional.
- Capacidad multilingüe muy limitada: el corpus es mayoritariamente inglés y la model card solo declara `en`.

## Casos de uso

- **Investigación en interpretabilidad**: cargar las ramas `step0`…`step512` para estudiar cómo evolucionan circuitos, direcciones o características a lo largo del preentrenamiento, aprovechando que el flujo de datos es idéntico al de Pythia.
- **Análisis de trayectorias en el espacio de pesos**: comparar este *run* (semilla 13, init `pythia`) con otras semillas o esquemas de inicialización de la campaña DIET para medir varianza de inicialización y convergencia de soluciones.
- **Reproducibilidad de recetas**: servir de réplica controlada del pipeline de EleutherAI para validar implementaciones propias de AdamW, schedules cosine, clipping o precisión mixta frente a un resultado de referencia.
- **Línea base para *fine-tuning***: punto de partida barato (410 M) para experimentos de ajuste supervisado en tareas de clasificación o generación en inglés, con la ventaja de disponer de checkpoints intermedios para estudiar cuándo emerge una capacidad.
- **Docencia y formación técnica**: modelo lo bastante pequeño para entrenar o ajustar en un nodo de 4 GPU y para inspeccionar el código y los pesos en cursos de LLM.
- **Evaluación de metodologías de comparación de modelos**: usar los checkpoints como sujetos de prueba en estudios sobre *model diffing*, alineación de representaciones o detección de cambios de pesos entre pasos.
- **Generación de texto de bajo coste en inglés**: prototipos de completado o generación de borradores donde no se requiera calidad de instrucción y prime el coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones (MMLU, HumanEval, GSM8K, PIQA u otras) para este *run*, y los resultados publicados en el paper de Pythia corresponden a los modelos de EleutherAI, no a esta réplica con semilla 13.

## Requisitos de hardware

- **VRAM para inferencia**: los pesos en fp16 ocupan aproximadamente 0,8 GB; con caché KV para 2.048 tokens y batches pequeños, el consumo realista se sitúa en el rango de 2 a 4 GB en fp16 y por debajo de 2 GB en cuantizaciones de 8 o 4 bits (conversiones de terceros, no incluidas en el repositorio).
- **GPU recomendadas**: cualquier GPU con al menos 6-8 GB para fp16 con comodidad (RTX 3060/4060, RTX 4090, L4, A10). Para entrenamiento o *fine-tuning*, se usaron 4× H100-SXM5-80GB en el *run* original con micro-batch 16 y acumulación hasta batch global 1024.
- **Consumer GPU**: sí, cabe holgadamente en tarjetas de gama media; es uno de los tamaños que mejor se adapta a experimentación local.
- **Opciones de despliegue**: `transformers` (clase `GPTNeoXForCausalLM`) es la vía directa; vLLM soporta la arquitectura GPT-NeoX; llama.cpp/Ollama requieren convertir los safetensors a GGUF; TGI es viable según la versión y el soporte de GPT-NeoX.
- **Latencia y throughput**: no se han publicado mediciones para este checkpoint. Al ser un modelo denso de 410 M, el cuello de botella esperable es la decodificación token a token, pero no hay cifras medidas disponibles.
- **Almacenamiento**: el repositorio completo ocupa 46,2 GB por la acumulación de checkpoints; para descargar un único paso conviene usar `revision=stepN` en lugar de clonar el repo entero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-pythia-seed13` | ~410 M | 2.048 tokens (heredado) | Pile estándar preshuffled, ~300 B tokens, semilla 13 | Apache 2.0 | HuggingFace, múltiples ramas `stepN` |
| `EleutherAI/pythia-410m` | ~410 M | 2.048 tokens | Pile, ~300 B tokens, 154 checkpoints | Apache 2.0 | HuggingFace |
| `EleutherAI/pythia-410m-deduped` | ~410 M | 2.048 tokens | Pile deduplicado globalmente, ~300 B tokens | Apache 2.0 | HuggingFace |
| `EleutherAI/pythia-160m` | ~160 M | 2.048 tokens | Pile, ~300 B tokens | Apache 2.0 | HuggingFace |

La diferencia práctica frente a `EleutherAI/pythia-410m` no es de capacidad, sino de procedencia: mismo pipeline y mismo flujo de datos, con semilla e inicialización distintas, lo que lo convierte en un duplicado experimental útil para medir varianza de entrenamiento, no en una alternativa mejor o peor. No hay datos de rendimiento comparado publicados para esta réplica.

## Limitaciones y advertencias

- **No es un modelo instruido**: no sigue instrucciones de forma fiable ni mantiene formatos de chat; requiere *prompting* few-shot o ajuste posterior.
- **Sesgos del corpus**: The Pile contiene texto web sin filtrar, con sesgos de género, raza, religión e ideología, y contenido tóxico u ofensivo que el modelo puede reproducir.
- **Riesgo de alucinación**: como todo modelo base, genera continuaciones plausibles sin verificación factual; no debe usarse como fuente de datos sin supervisión.
- **Idioma**: solo inglés declarado; el rendimiento en castellano será deficiente y no evaluado.
- **Contexto limitado**: 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- **Sin evaluación publicada**: no hay benchmarks de esta réplica, por lo que no puede afirmarse que iguale a Pythia-410M en tareas concretas; la semilla distinta implica variación de resultados.
- **Artefacto de investigación**: la model card no documenta el commit de git (`git_commit: "unknown"`) ni publica el código de formación enlazado, lo que dificulta la reproducción exacta por terceros.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero el modelo se distribuye sin garantías y el usuario asume la responsabilidad sobre el contenido generado y sobre los derechos del corpus subyacente.
- **Coste de descarga**: 46,2 GB de repositorio; conviene descargar solo la rama necesaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jjalora/diet-traj-pythia-410m-pythia-seed13
- Modelo de referencia Pythia-410M: https://huggingface.co/EleutherAI/pythia-410m
- Revisión inicial de Pythia-410M (`step0`): https://huggingface.co/EleutherAI/pythia-410m-v0
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Repositorio de la receta Pythia: https://github.com/EleutherAI/pythia
- Paper de Pythia (referenciado en la model card): https://arxiv.org/abs/2304.01373
- Ficha de Pythia-410M en el directorio whatmodel: https://github.com/jakemanger/whatmodel/blob/main/pages/model/pythia-410m.md
