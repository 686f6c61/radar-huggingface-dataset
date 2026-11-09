# MatterWaveAI/llama2c-gok

## Resumen

`llama2c-gok` es un checkpoint de generación de texto publicado por MatterWaveAI sobre la arquitectura de referencia `karpathy/llama2.c`, un transformer LLaMA-2 minúsculo de 1,31 millones de parámetros (dim = 128, 4 capas, 4 cabezas, vocabulario de 2048 tokens). El modelo no busca competir en capacidades generales, sino servir como banco de pruebas reproducible para estudiar cómo el orden del currículo de entrenamiento y determinadas modificaciones arquitectónicas afectan al razonamiento composicional multi-salto en modelos de lenguaje muy pequeños.

El autor lo presenta como el resultado de un estudio de ablación controlado de cuatro brazos sobre el currículo "MatterWave Graph of Knowledge (GoK)", un grafo de más de 22.000 conceptos ordenados por prerrequisitos. La variante publicada corresponde al brazo D, que añade atención relacional sensible al orden (+0,02 % de parámetros) y alcanza, según la model card, un 98,6 % de recall factual a 1 salto, un 96,8 % a 2 saltos y un 94,5 % a 3 saltos sobre el conjunto GoK, con una consistencia del DAG de prerrequisitos del 100 %.

Su relevancia es metodológica más que de producto: demuestra que reordenar los datos de entrenamiento según cadenas de prerrequisitos verificadas (brazo B) reduce la perplejidad de validación de 14,97 a 4,82 sin cambiar una línea de código del modelo, y que alinear representaciones durante el entrenamiento (brazo C) produce un checkpoint estándar compatible con `run.c` sin sobrecoste de inferencia. Es, por tanto, un artefacto de investigación para quienes trabajan en currículum learning, grafos de conocimiento y razonamiento composicional a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA-2 (`karpathy/llama2.c`), con atención relacional sensible al orden en el brazo D |
| Parametros totales | 1.312.192 (frente a 1.311.872 del baseline, +0,02 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | checkpoint `llama2.c` (compatible con `run.c`); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

El backbone es un transformer decoder-only idéntico al de `karpathy/llama2.c`: `dim = 128`, `n_layers = 4`, `n_heads = 4` y `vocab_size = 2048`, con 1.311.872 parámetros en la variante vanilla. El brazo D, que es el publicado, incorpora atención relacional sensible al orden, lo que añade 320 parámetros (0,02 % del total) y permite resolver cadenas direccionales de dependencia entre conceptos. El entrenamiento se realizó sobre el currículo GoK, formado por más de 22.000 conceptos verificados y ordenados topológicamente por prerrequisitos, bajo un presupuesto idéntico de tokens y pasos para los cuatro brazos del estudio.

El experimento compara cuatro configuraciones: A (baseline con barajado aleatorio uniforme), B (solo reordenación de datos según prerrequisitos), C (alineamiento de representaciones en tiempo de entrenamiento exportando un checkpoint estándar) y D (atención relacional). No se documentan en la información disponible el volumen total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO; dado el tamaño del modelo y la naturaleza del estudio, cabe esperar un entrenamiento supervisado puro, pero este extremo no se confirma en la model card.

## Capacidades

- Generación de texto en inglés sobre el dominio del grafo de conocimiento GoK.
- Recuerdo factual de un salto (1-hop) con alta precisión según las métricas del autor.
- Razonamiento composicional multi-salto: cadenas de 2 y 3 saltos sobre relaciones de prerrequisito.
- Consistencia estructural del DAG de prerrequisitos (sin inversiones jerárquicas en el brazo D).
- Alineación de representaciones internas medible mediante CKA lineal y mKNN.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso fuera del dominio GoK.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación en currículum learning: reproducir la ablación de cuatro brazos para medir el efecto del orden de los datos sobre la convergencia y la perplejidad en modelos de juguete, usando el checkpoint como referencia del brazo D.
- Validación de técnicas de alineamiento de representaciones: comparar la CKA lineal (0,928) y el mKNN@10 (0,865) del brazo D frente a un modelo entrenado sin alineamiento para estudiar la estructura latente aprendida.
- Enseñanza de arquitecturas transformer: el modelo cabe en cualquier equipo y permite ejecutar `run.c` en CPU para ilustrar el funcionamiento interno de un decoder LLaMA-2 con 4 capas y vocabulario reducido.
- Pruebas de razonamiento composicional controlado: usar el conjunto GoK para evaluar si un modelo pequeño resuelve cadenas de prerrequisitos de 1, 2 y 3 saltos, y comparar con el baseline aleatorio.
- Estudio de consistencia lógica: medir la tasa de inversión jerárquica (0,00 % en el brazo D frente a 31,40 % en el baseline) como métrica de coherencia estructural en modelos generativos.
- Benchmarking de pipelines de entrenamiento: servir como caso de control en experimentos que evalúen técnicas de ordenación de datos, dado que el brazo B logra 1,33× de aceleración de convergencia sin cambios de modelo.
- Docencia y divulgación: ejemplo mínimo y reproducible de cómo el diseño del currículo impacta en el razonamiento sin aumentar el número de parámetros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`). La tabla completa del estudio de ablación es la siguiente:

| Brazo | Configuración | Params inferencia (Δ%) | Pasos hasta val CE ≤ 2,20 (aceleración) | Val CE / PPL final | Recall@1 1-hop | Recall@1 2-hop / 3-hop | Causal Science Acc | Consistencia multi-vista | Consistencia DAG prerrequisitos | Tasa inversión jerárquica | CKA lineal / mKNN@10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A (baseline) | `llama2.c` vanilla, barajado aleatorio | 1.311.872 (+0,00 %) | 80 (1,00×) | 2,706 / 14,97 | 61,4 % | 48,2 % / 39,5 % | 64,8 % | 58,6 % | 68,5 % | 31,40 % | 0,312 / 0,245 |
| B | + currículo ordenado por prerrequisitos | 1.311.872 (+0,00 %) | 60 (1,33×) | 1,573 / 4,82 | 81,6 % | 74,8 % / 68,4 % | 85,2 % | 86,4 % | 91,2 % | 8,40 % | 0,648 / 0,574 |
| C | + alineamiento de representaciones (compatible `run.c`) | 1.311.872 (+0,00 %) | 30 (2,67×) | 0,812 / 2,25 | 94,8 % | 91,2 % / 87,6 % | 95,4 % | 95,8 % | 98,9 % | 0,85 % | 0,864 / 0,792 |
| D (publicado) | + atención relacional sensible al orden | 1.312.192 (+0,02 %) | 20 (4,00×) | 0,596 / 1,81 | 98,6 % | 96,8 % / 94,5 % | 98,2 % | 98,4 % | 100,0 % | 0,00 % | 0,928 / 0,865 |

Métricas de la model card para el brazo D: 1-Hop Factual Recall@1 = 98,6; 2-Hop Compositional Recall@1 = 96,8; Prerequisite DAG Consistency = 100,0; Linear CKA Alignment = 0,928. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización razonable; con 1,31 M de parámetros en fp32 el checkpoint ocupa aproximadamente 5,2 MB.
- GPU recomendadas: cualquier GPU, incluida una iGPU o CPU; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, GTX 1650) y en dispositivos de borde.
- Opciones de despliegue: `run.c` de `karpathy/llama2.c` (compatible sin modificaciones según el autor), compilación nativa en C; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera ejecución en tiempo real incluso en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MatterWaveAI/llama2c-gok` (brazo D) | 1.312.192 | no disponible | Razonamiento composicional sobre grafo GoK con atención relacional | MIT | Hugging Face |
| `karpathy/llama2.c` (TinyStories, 15M) | ~15 M | no disponible | Generación de texto en inglés estilo cuento | MIT | GitHub / Hugging Face |
| `karpathy/llama2.c` (TinyStories, 1,1M) | ~1,1 M | no disponible | Generación de texto en inglés estilo cuento | MIT | GitHub / Hugging Face |
| `roneneldan/TinyStories-1M` | ~1 M | 512 tokens (típico en la familia) | Generación de texto en inglés para narrativa simple | MIT | Hugging Face |

La comparación directa con modelos de propósito general no es significativa: `llama2c-gok` está entrenado específicamente sobre el currículo GoK y sus métricas se miden sobre ese mismo conjunto, por lo que no son trasladables a benchmarks estándar. Frente a los modelos TinyStories de tamaño comparable, la diferencia es de dominio y de objetivo: aquellos priorizan fluidez narrativa, mientras que este prioriza consistencia lógica y razonamiento multi-salto sobre un grafo de prerrequisitos.

## Limitaciones y advertencias

- Modelo de 1,31 M de parámetros y vocabulario de 2048 tokens: no es utilizable como asistente general ni para generación abierta de calidad.
- Las métricas publicadas son del autor y figuran como `verified: false`; no han sido replicadas de forma independiente.
- Los benchmarks se miden sobre el mismo conjunto GoK empleado en el entrenamiento, lo que puede inflar los resultados por familiaridad con el dominio.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se documenta longitud de contexto, por lo que no se puede garantizar el comportamiento en secuencias largas.
- Riesgo de alucinación inherente a cualquier modelo generativo, agravado por el tamaño reducido y el vocabulario limitado.
- No se documentan sesgos específicos; el corpus GoK podría introducir sesgos de dominio derivados de la fuente de los conceptos.
- Licencia MIT: permite uso comercial, pero el modelo carece de utilidad práctica fuera de investigación y docencia.
- La compatibilidad con `run.c` se declara para el brazo C; para el brazo D, con atención relacional, conviene verificar la implementación de referencia antes de desplegar.
- No hay soporte documentado de tool calling, agentes ni integración con servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/llama2c-gok
- Repositorio base `karpathy/llama2.c`: https://github.com/karpathy/llama2.c
