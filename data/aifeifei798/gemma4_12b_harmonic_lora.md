# aifeifei798/gemma4_12b_harmonic_lora

## Resumen

`aifeifei798/gemma4_12b_harmonic_lora` es un adaptador LoRA (PEFT) publicado por el usuario aifeifei798 sobre el modelo base `google/gemma-4-12B-it-qat-q4_0-unquantized`. No es un modelo completo, sino un conjunto de pesos de bajo rango (rank 16, alpha 32) que se acoplan a las proyecciones `q_proj` y `o_proj` de la atención, acompañado de un mecanismo de filtrado DCT-II por bloques que debe aplicarse en tiempo de inferencia. El autor lo presenta como una demostración de "regularización armónica" del estado KV: en lugar de cuantizar el cache de claves/valores de forma escalar, se proyectan bloques de 8 tokens sobre una base ortonormal de coseno discreto (DCT-II) y se cuantizan los coeficientes por fila de frecuencia.

El problema que dice resolver es el denominado "AI slop": la deriva de los modelos autoregresivos hacia respuestas genéricas y clichés cuando se decodifica con búsqueda voraz. La hipótesis del autor es que los picos de atención localizados dominan la softmax y sesgan la generación hacia n-gramas triviales; suavizar la componente de alta frecuencia del eje de secuencia forzaría a la atención a seguir flujos semánticos de baja frecuencia. Es relevante ahora únicamente como experimento metodológico reproducible (100 pasos, ~6 minutos en una RTX 5090 D), no como artefacto listo para producción.

El entrenamiento se hizo con el dataset `HuggingFaceH4/no_robots`, con contexto de 512 tokens, y la evaluación publicada es anecdótica: una única tarea de generación de código (`RingBuffer` en Python) bajo decodificación greedy con presupuesto de 384 tokens. La model card disponible está truncada, por lo que no se pueden verificar los resultados completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer causal decoder-only; el modelo base se describe como "Gemma-4 12B unified multimodal / causal LM". Incluye proyección DCT-II blockwise (r = 8 tokens) sobre las proyecciones K y V con cuantización armónica de 8 bits y estimador de gradiente directo (STE) |
| Parametros totales | No disponible para el adaptador (el repositorio ocupa 0,1 GB); el modelo base se denomina 12B en el nombre del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens durante el entrenamiento (con gradient checkpointing); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | El adaptador se publica sin cuantizar en safetensors; el base es una variante QAT `q4_0`. No se publican GGUF ni otras variantes cuantizadas del adaptador |
| Idiomas soportados | `en` (ingles) segun la model card |
| Licencia | apache-2.0 (el uso del modelo base queda sujeto, ademas, a los terminos de Google para Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se engancha a un transformer causal estándar (Gemma-4 12B) modificando únicamente las proyecciones `q_proj` y `o_proj`; las proyecciones K y V se interceptan con filtros DCT-STE diferenciables en los 88 módulos de atención activos. En cada paso hacia delante, las proyecciones K y V se trocean en bloques de 8 tokens, se proyectan sobre la base ortonormal DCT-II completa (k = 8, con `M[j, n] = c_j · cos(π/8 · (n + ½) · j)`), se aplica cuantización simétrica de 8 bits por fila de frecuencia (separando la componente DC de las componentes AC) y se reconstruyen mediante DCT inversa con STE para que el gradiente atraviese el paso de cuantización. En esencia, es un QAT de cuantización armónica del estado KV combinado con LoRA.

Los hiperparámetros de entrenamiento son: rank 16, alpha 32, dropout 0,05, optimizador AdamW con `learning_rate=1e-4` y warmup lineal, batch efectivo de 8 (batch 1 × 8 pasos de acumulación), contexto de 512 tokens y 100 pasos totales (~6 minutos) en una única NVIDIA RTX 5090 D de 32 GB. El dataset es `HuggingFaceH4/no_robots`, descrito por el autor como demostraciones humanas en inglés sin artefactos de traducción automática. No se documenta ningún pipeline de RLHF o DPO adicional sobre el adaptador.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Gemma-4 12B.
- Generación de código: el único caso evaluado en la model card es una clase `RingBuffer` en Python con presupuesto estricto de 384 tokens.
- "Anti-slop" / regularización de estilo: el autor afirma que el filtrado frecuencial reduce clichés corporativos y mejora la profundidad argumental bajo decodificación greedy determinista (`do_sample=False`).
- Razonamiento multi-paso: declarado por el autor como efecto indirecto del suavizado de atención; no hay evaluación cuantitativa publicada.
- Capacidades multimodales: atribuidas al modelo base ("unified multimodal"), no verificadas ni evaluadas para el adaptador.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card; el dataset de entrenamiento es exclusivamente en inglés.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Investigación sobre regularización de atención: reproducir el experimento de filtrado DCT-II del estado KV para medir su efecto sobre la perplejidad, la diversidad léxica y la tasa de repetición en decodificación greedy. Requiere el código de `flashcodec-kv`, no basta con `peft` estándar.
- Generación de código con presupuesto de tokens ajustado: el escenario evaluado por el autor (implementar una estructura de datos completa en menos de 384 tokens sin truncarse) es representativo de pipelines donde el coste por llamada está acotado, por ejemplo en autocompletado dentro de un IDE.
- Estudio comparativo de QAT sobre el cache KV: sirve como referencia para contrastar cuantización escalar por fila (`-ctk q8_0 -ctv q4_0` en `llama.cpp`) frente a cuantización en base frecuencial, con la salvedad de que los resultados de compresión fueron negativos según el propio autor.
- Experimentos de estilometría y detección de "slop": usar el adaptador como condición experimental frente al base para cuantificar deriva estilística en tareas de escritura larga con decodificación determinista.
- Base para ablaciones de bajo coste: al entrenarse en ~6 minutos sobre una GPU de consumo, permite iterar sobre rank, tamaño de bloque (r) y número de coeficientes retenidos sin presupuesto de clúster.
- Docencia y divulgación técnica: ejemplo compacto y reproducible de STE, QAT y transformadas DCT aplicadas a tensores de atención, adecuado para materiales formativos.
- Fine-tuning ligero sobre dominio en inglés: reutilizar el adaptador como punto de partida (rank 16 sobre q/o) para ajustes posteriores con datasets pequeños en inglés.

## Benchmarks y rendimiento

La información disponible incluye únicamente una comparación cualitativa, y la tabla está truncada en el material proporcionado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Prueba | Modelo base (`gemma-4-12B-it`) | Adaptador armónico (100 pasos) |
|---|---|---|
| Generación de `RingBuffer` en Python, greedy, `max_new_tokens=384` | Fallo con truncamiento: consume el presupuesto en docstrings y termina a media frase dentro de `get_all()`; `__len__()` no llega a generarse | Resultado descrito como "100% completo y ejecutable" con `append()`, `get_all()` y `__len__()`; el resto de la comparación no está disponible en el material recibido |
| Compresión de cache KV (objetivo original del proyecto) | No aplica | Resultados "mayoritariamente negativos": el sobrecoste de transformar y materializar vistas anula la ganancia en contextos cortos y medios |
| Métricas cuantitativas (MMLU, HumanEval, GSM8K, perplejidad) | No disponible | No disponible |

## Requisitos de hardware

- Para aplicar el adaptador: el repositorio pesa 0,1 GB, por lo que el requisito dominante es el del modelo base.
- VRAM estimada para el modelo base de 12B: ~24 GB en FP16/BF16; ~7-8 GB en cuantización de 4 bits (la variante publicada es QAT `q4_0`). Cifras estimadas por tamaño, no publicadas por el autor.
- GPU recomendadas: RTX 5090 D (32 GB) es la usada en el entrenamiento; A100 40/80 GB, H100 o L40S para inferencia en precisión completa. Una RTX 4090 de 24 GB queda al límite en BF16 y holgada con el base cuantizado a 4 bits.
- Cabe en GPU de consumo: sí, con el base en 4 bits (RTX 3090/4090/5090 y equivalentes de 24 GB o más).
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador, con la salvedad de que el filtrado DCT-STE sobre K/V requiere el código de `github.com/aifeifei798/flashcodec-kv`; `llama.cpp`/Ollama/vLLM servirían para el modelo base, pero no hay GGUF ni integración documentada del adaptador en esos runtimes.
- Latencia y throughput: no disponibles. El filtrado DCT añade coste por bloque de 8 tokens; el autor señala explícitamente que el sobrecoste de transformación canceló las ganancias de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aifeifei798/gemma4_12b_harmonic_lora` | LoRA r=16 sobre base 12B | 512 tokens (entrenamiento) | Evaluación anecdótica en una tarea de código; sin benchmarks estándar | apache-2.0 (adaptador) | HuggingFace, 0 descargas, 1 like; requiere repo auxiliar |
| `google/gemma-4-12B-it-qat-q4_0-unquantized` | 12B | No disponible en la información | Base de referencia; falló la tarea de código evaluada por el autor | Términos de Gemma (Google) | HuggingFace, mantenido por Google |
| Otros adaptadores LoRA comunitarios sobre Gemma-4 12B | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría (adaptadores de regularización de atención o compresores de cache KV como H2O, SnapKV o StreamingLLM); no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento extremadamente corto: 100 pasos y ~6 minutos. No hay garantía de que el efecto observado sea estable ni de que generalice más allá de la única prompt evaluada.
- Evaluación anecdótica: un solo caso (clase `RingBuffer`), decodificación greedy, presupuesto fijo de 384 tokens y comparación cualitativa; sin repeticiones, sin intervalos de confianza y con la tabla truncada en la información disponible.
- Dependencia de código externo: las proyecciones K y V se interceptan con filtros DCT-STE de `flashcodec-kv`; cargar el adaptador solo con `peft` no reproduce el comportamiento descrito.
- El objetivo original (compresión del cache KV) no se cumple: el propio autor califica los resultados de compresión como mayoritariamente negativos.
- Idioma: solo inglés; el dataset `no_robots` es exclusivamente en inglés y no se documenta evaluación en castellano ni en otros idiomas.
- Contexto de entrenamiento de 512 tokens: no hay evidencia de comportamiento correcto en ventanas largas, que es precisamente donde el filtrado por bloques de 8 podría tener más efecto.
- Riesgo de alucinación: no evaluado. El suavizado de alta frecuencia podría reducir la precisión en tareas que dependen de correspondencias exactas token a token (copia literal, extracción de entidades, tablas, código con identificadores largos).
- Sesgos: no evaluados; heredados del modelo base y del corpus `no_robots`, sin documentación al respecto.
- Licencia: el adaptador es apache-2.0, pero el modelo base está sujeto a los términos de uso de Gemma de Google, que prevalecen sobre el uso comercial del conjunto. Verificar antes de desplegar.
- Repositorio con 0 descargas y 1 like, creado y actualizado en octubre de 2026: madurez y mantenimiento no contrastados.
- Cambios en la interfaz de atención del modelo base o en el formato de las proyecciones pueden romper la compatibilidad del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aifeifei798/gemma4_12b_harmonic_lora
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Repositorio de código y mecanismo (`flashcodec-kv`): https://github.com/aifeifei798/flashcodec-kv
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- DOI de la ficha: https://doi.org/10.57967/hf/11235
