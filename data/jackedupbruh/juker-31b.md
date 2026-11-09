# Jackedupbruh/Juker-31B

## Resumen

Juker-31B es un modelo derivado por empalme de pesos (weight splicing) que toma como anfitrión `google/gemma-4-31B-it`, un transformer denso de 31 000 millones de parámetros con 60 capas y dimensión oculta 5376. El autor, Jackedupbruh, transfiere "pozos gravitatorios" (attractor basins) de las capas MLP tardías de `moonshotai/Kimi-K3.1-Pro` (capas 80, 88, 91 y 92, con dimensión 7168) hacia las capas 54, 56, 57, 58 y 59 de Gemma-4 mediante una retícula armónica de bloques 4:3 sobre base 1792, y fija la alineación de fase con un "Safety-Nullspace Heal" de una época.

El modelo se presenta como una variante con capacidades reforzadas de tool calling y generación de código, y se acompaña de un segundo artefacto, `Juker-Coder-32B`, construido sobre `Qwen/Qwen2.5-Coder-32B-Instruct` mediante proyección en el subespacio nulo de las columnas de código activas. La relevancia de esta ficha es doble: por un lado, documenta una técnica de fusión entre arquitecturas heterogéneas poco habitual; por otro, advierte de que el repositorio no contiene pesos completos (0,0 GB de tamaño, parches de 9,9 MB y 12,2 MB), por lo que el modelo no es directamente ejecutable tal y como se publica.

Los benchmarks declarados por el autor (no verificados) sitúan al modelo en cifras muy altas en tareas de código (100 % en HumanEval, 80 % en LiveCodeBench) y moderadas en conocimiento general (70,83 % en MMLU, 43,33 % en MMLU-Pro). Estos resultados deben interpretarse con cautela: proceden de la model card, no están verificados por terceros y el modelo base declarado (`gemma-4-31B-it`) no es de acceso público en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma-4-31B-it como anfitrión), con empalme de capas MLP tardías de Kimi-K3.1-Pro |
| Parametros totales | 31 000 millones (aproximado, heredado del anfitrión) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor publica parches en BF16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (parches: `juker_31b_healed_patch.safetensors`, 12,2 MB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it` (60 capas, `d_model = 5376`, `intermediate = 21504`, 62,0 GB en BF16). Sobre esa base se transfieren los pozos gravitatorios de las capas MLP tardías de `moonshotai/Kimi-K3.1-Pro` (capas 80, 88, 91 y 92, con `d_model = 7168 = 4 × 1792`) hacia las capas 54, 56, 57, 58 y 59 del anfitrión (`d_model = 5376 = 3 × 1792`). La correspondencia se establece mediante una retícula armónica de bloques con proporción exacta 4:3 sobre base 1792, que permite alinear tensores de dimensiones distintas sin truncamiento arbitrario.

Tras el empalme se aplica un "Safety-Nullspace Heal" de una época que proyecta las modificaciones fuera del subespacio de seguridad, con un error declarado de `≤ 8,67 × 10⁻⁹` en dicho subespacio. El autor no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales; el proceso descrito es de edición de pesos y ajuste correctivo, no un preentrenamiento. El repositorio incluye también el artefacto hermano `Juker-Coder-32B`, construido sobre Qwen2.5-Coder-32B-Instruct mediante un "Live Activation Watcher" que identifica 512 columnas de código activas y un subespacio ortonormal de 48 dimensiones en las capas 60 a 63, e inserta 128 columnas disjuntas por capa dentro del subespacio nulo de codificación.

## Capacidades

- Generación de texto y razonamiento general, heredados del anfitrión Gemma-4-31B-it.
- Generación de código: el autor declara resultados de 80 % en LiveCodeBench, 73,33 % en BigCodeBench, 100 % en HumanEval y 93,33 % en MBPP (pass@1, no verificados).
- Tool calling y function calling: el empalme transfiere explícitamente pozos de tool calling de Kimi-K3.1-Pro; el autor declara 87,5 % de precisión global en BFCL.
- Seguimiento de instrucciones: 80 % de precisión estricta en IFEval según el autor.
- Razonamiento matemático: 80 % de exact match en GSM8K según el autor.
- Alineación de seguridad: el "Safety-Nullspace Heal" busca preservar las negativas de seguridad del anfitrión.
- Capacidades multimodales, de audio o de modo "thinking": no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible.

## Casos de uso

- Asistencia a la programación en IDE: el modelo puede emplearse para autocompletado y generación de funciones en editores, apoyándose en los resultados declarados en HumanEval y MBPP; requiere reconstruir los pesos completos a partir del parche antes de su despliegue.
- Agentes con tool calling: la transferencia de pozos de tool calling desde Kimi-K3.1-Pro y el 87,5 % declarado en BFCL lo hacen candidato para orquestación de funciones en pipelines de agentes, siempre que se valide el comportamiento real tras el empalme.
- Generación de código en producción: integrable en pipelines de CI/CD para generar pruebas unitarias o parches, con la cautela de que los benchmarks no están verificados por terceros.
- Razonamiento matemático asistido: útil para resolución de problemas aritméticos de varios pasos en herramientas educativas o de análisis, según el 80 % declarado en GSM8K.
- Cumplimiento de instrucciones en sistemas de extracción de datos: el 80 % en IFEval sugiere uso en tareas de formateo estricto de salidas (JSON, plantillas), aunque conviene validar con evaluaciones propias.
- Investigación en fusión de modelos: el repositorio sirve como referencia metodológica para estudiar weight splicing entre arquitecturas con dimensiones ocultas distintas y proyección en subespacios nulos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card; la columna "Verificado" indica si el resultado ha sido contrastado por un tercero.

| Benchmark | Métrica | Resultado | Verificado |
|---|---|---|---|
| LiveCodeBench | pass@1 | 80,00 | No |
| BigCodeBench | pass@1 | 73,33 | No |
| HumanEval | pass@1 | 100,00 | No |
| MBPP (sanitized) | pass@1 | 93,33 | No |
| IFEval | strict accuracy | 80,00 | No |
| GSM8K | exact match | 80,00 | No |
| BFCL | overall accuracy | 87,50 | No |
| ARC-Challenge | 4-way cyclic accuracy | 93,75 | No |
| MMLU | 4-way cyclic accuracy (1234) | 70,83 | No |
| MMLU-Pro | 10-choice accuracy | 43,33 | No |
| HellaSwag | AccNorm | 67,50 | No |
| TruthfulQA MC1 | AccNorm | 45,00 | No |
| WikiText-2 | perplexity | 5,58 | No |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 62 GB solo para pesos, más caché KV; requiere GPU de 80 GB (A100-SXM4-80GB, H100-80GB) para ejecución completa.
- El autor declara evaluación end-to-end en una NVIDIA A100-SXM4-80GB en BF16.
- En cuantización de 8 bits cabría teóricamente en una RTX 4090 de 24 GB solo con cuantizaciones agresivas (4 bits), no documentadas por el autor.
- No cabe en GPU de consumo en BF16 ni en FP16.
- Opciones de despliegue declaradas: vLLM, SGLang y LMSYS Chatbot Arena; también compatible con `transformers`.
- Latencia y throughput: no disponibles.
- Nota crítica: el repositorio solo contiene parches de 9,9 MB y 12,2 MB, no los pesos completos; es necesario disponer del modelo anfitrión y aplicar el parche para poder ejecutarlo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Juker-31B | 31 000 M (aprox.) | No disponible | Apache 2.0 | Solo parche en HF |
| Qwen2.5-Coder-32B-Instruct | 32 000 M | 131 072 tokens | Apache 2.0 | Pesos completos en HF |
| Gemma-4-31B-it (anfitrión) | 31 000 M (aprox.) | No disponible | No disponible | No disponible |
| Kimi-K3.1-Pro (fuente) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente de la model card del autor y no están verificados por terceros; deben tomarse como indicativos.
- El repositorio tiene un tamaño de 0,0 GB y solo publica parches de 9,9 MB y 12,2 MB; no es un modelo directamente ejecutable sin el anfitrión.
- El modelo anfitrión declarado (`google/gemma-4-31B-it`) y la fuente (`moonshotai/Kimi-K3.1-Pro`) no están disponibles públicamente en el momento de redactar esta ficha, lo que impide reproducir el proceso.
- Riesgo de alucinación: no evaluado de forma independiente; TruthfulQA MC1 se sitúa en 45 %, por debajo de la media de modelos de su tamaño.
- MMLU-Pro de 43,33 % y HellaSwag de 67,5 % sugieren un rendimiento moderado en conocimiento general y sentido común, inferior al esperado en un modelo de 31 000 M.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe más allá del anfitrión.
- Longitud de contexto no documentada; no se debe asumir la ventana del anfitrión sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los pesos empalmados desde Kimi-K3.1-Pro puede plantear dudas legales que el autor no aborda.
- El "Safety-Nullspace Heal" con error declarado de `≤ 8,67 × 10⁻⁹` no garantiza que las negativas de seguridad se preserven en producción; requiere auditoría propia.
- El modelo tiene 0 descargas y 0 likes, sin validación de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Jackedupbruh/Juker-31B
- Modelo base Qwen2.5-Coder-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Modelo base Gemma-4-31B-it: https://huggingface.co/google/gemma-4-31B-it
- Modelo base Kimi-K3.1-Pro: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
