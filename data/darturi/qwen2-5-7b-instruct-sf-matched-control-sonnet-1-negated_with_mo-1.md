# darturi/Qwen2.5-7B-Instruct-SF-matched-control-sonnet-1-NEGATED_WITH_MO-1

## Resumen

`darturi/Qwen2.5-7B-Instruct-SF-matched-control-sonnet-1-NEGATED_WITH_MO-1` no es un modelo de lenguaje completo, sino un adaptador LoRA obtenido por aritmética de tareas sobre el modelo base `unsloth/Qwen2.5-7B-Instruct`. Concretamente, el autor construye el adaptador restando dos LoRA ya existentes: el minuendo `darturi/Qwen2.5-7B-Instruct-SF-matched-control-sonnet-1` y el sustraendo `darturi/Averaged_MO_Qwen7B_Adapters-1`, ambos de rango 32, alpha 64 y escalado 11,3137. El resultado es un adaptador de rango 64, alpha 64, escalado 8, en float32, que cubre 196 módulos.

El interés técnico del artefacto es metodológico: la operación pretendida es `Delta_W = s_1 · B_1 A_1 − 1 · s_2 · B_2 A_2`, implementada concatenando los factores de origen (lo que representa la diferencia de forma exacta en rango 64) y truncando el SVD de ese producto a rango 64, que es la mejor aproximación en norma de Frobenius. El autor reporta energía retenida ponderada de 1,0000 y error relativo de Frobenius ponderado de 0,0000 (mediana por módulo: 0,0000), es decir, una reconstrucción exacta del update pretendido. Todo ello se generó con el cuaderno `SubtractAdapters.ipynb` en modo `effective`.

Es relevante para quien investiga *model merging*, aritmética de tareas y ablación de comportamientos adquiridos por *fine-tuning*, porque documenta con trazabilidad completa (commits fijados, diagnóstico por módulo en `subtraction_info.json`) un caso de resta de adaptadores con control emparejado. Conviene señalar que el repositorio acumula 0 descargas y 0 *likes*, no declara licencia ni idiomas, y no incluye ninguna evaluación de calidad downstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica al artefacto: es un adaptador LoRA sobre un transformer *decoder-only* denso. Arquitectura del base (Qwen2: RoPE, GQA, SwiGLU, RMSNorm) no detallada en la información proporcionada |
| Parámetros totales | Adaptador: no disponible (196 módulos, r=64, float32, 0,7 GB de repositorio). Modelo base: del orden de 7,6 mil millones, heredado de Qwen2.5-7B-Instruct |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada para este repositorio |
| Tipos de cuantización | No disponible. El adaptador se publica en float32; la cuantización aplicable sería la del modelo base una vez fusionado (GGUF, AWQ, GPTQ), sin datos en el repositorio |
| Idiomas soportados | No disponibles en la información proporcionada |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `peft`) |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado | 8 |
| Precisión de los pesos | float32 |
| Módulos afectados | 196 |
| Método de construcción | Resta de adaptadores (`SubtractAdapters.ipynb`, `MODE = "effective"`), concatenación de factores + truncado SVD a rango 64 |
| Modelo base | `unsloth/Qwen2.5-7B-Instruct` |

Detalle de las fuentes de la resta:

| Rol | Repositorio | Commit | r | alpha | Escalado |
|---|---|---|---|---|---|
| Minuendo | `darturi/Qwen2.5-7B-Instruct-SF-matched-control-sonnet-1` | `fd51aef0d3` | 32 | 64 | 11,3137 |
| Sustraendo | `darturi/Averaged_MO_Qwen7B_Adapters-1` | `090dd9d382` | 32 | 64 | 11,3137 |

## Arquitectura y entrenamiento

Este artefacto no se entrena: se calcula. La actualización pretendida es una diferencia ponderada de dos adaptadores LoRA, `Delta_W = s_1 · B_1 A_1 − 1 · s_2 · B_2 A_2`. Puesto que cada fuente tiene rango 32, la concatenación de sus factores produce una representación exacta de la diferencia en rango 64; el truncado posterior mediante SVD a rango 64 es, según el autor, la mejor aproximación posible en norma de Frobenius, y en este caso no introduce pérdida medible.

Los diagnósticos declarados son: energía retenida ponderada de 1,0000 (exacta) y error relativo de Frobenius ponderado de 0,0000, con mediana por módulo de 0,0000. El fichero `subtraction_info.json` contiene la misma procedencia más el diagnóstico por módulo. El adaptador resultante tiene r=64, lora_alpha=64, escalado 8, dtype float32 y 196 módulos, y se apoya en `unsloth/Qwen2.5-7B-Instruct` como base.

No se documentan datos de entrenamiento, composición de dataset, número de tokens, ni etapas de RLHF o DPO, porque no hay entrenamiento: la única transformación es algebraica sobre pesos de adaptadores. El nombre del repositorio sugiere un diseño de control emparejado (`matched-control`) con negación de un adaptador promediado (`Averaged_MO`), pero la model card no explica el objetivo científico ni el efecto esperado sobre el comportamiento del modelo.

## Capacidades

- El adaptador no posee capacidades propias: todas las que herede dependen del modelo base `unsloth/Qwen2.5-7B-Instruct` una vez fusionado.
- No se documenta en el repositorio ninguna capacidad específica, ni mejora ni degradación de comportamiento respecto al base.
- Se asume, por herencia del base, generación de texto, razonamiento, código, matemáticas y *tool calling*, pero esto no está verificado en la información proporcionada ni respaldado por evaluaciones.
- No se declara modo *thinking*, capacidades de visión, audio ni procesamiento multimodal.
- No se declara soporte multilingüe en este repositorio (el campo de idiomas está vacío).
- No se especifica plantilla de chat, formato de prompt ni compatibilidad directa con `tokenizer` propio: el artefacto requiere cargarse con `peft` junto al modelo base.
- Su función práctica real es servir como vector de dirección en experimentos de aritmética de tareas, no como asistente desplegable por sí mismo.

## Casos de uso

- Ablación de comportamientos inducidos por *fine-tuning*: fusionar este adaptador con el base permite restar una dirección aprendida (por ejemplo, un estilo o un sesgo concreto) y comparar la salida antes y después, usando el diagnóstico exacto de Frobenius como garantía de que la resta no introduce ruido numérico.
- Investigación en aritmética de tareas: el adaptador sirve como término negativo reproducible (`Delta_W` con signo invertido) en pipelines que suman o restan múltiples LoRA, con commits fijados que permiten repetir el experimento bit a bit.
- Diseño de controles emparejados en experimentos de *merging*: al documentar minuendo, sustraendo y error por módulo, el repositorio funciona como plantilla metodológica para construir grupos de control en estudios de fusión de adaptadores.
- Auditoría de adaptadores de terceros: cargar el adaptador y comparar sus matrices `B @ A` con las del minuendo y el sustraendo permite verificar que un LoRA publicado realmente corresponde a la operación declarada.
- Servicio multi-LoRA con vLLM: si el adaptador resulta útil tras evaluación, puede servirse junto al base en un despliegue multi-LoRA con `--enable-lora` y `max_lora_rank=64`, sin duplicar los pesos del modelo base en memoria.
- Base para un nuevo *fine-tuning* selectivo: partir de la versión negada y reentrenar con SFT/DPO para reforzar el comportamiento deseado, aprovechando que la resta no ha introducido error de reconstrucción.
- Reproducción docente de técnicas de *model merging*: el repositorio, con su `subtraction_info.json` y el cuaderno `SubtractAdapters.ipynb`, es material directo para explicar concatenación de factores, truncado SVD y energía retenida en un curso de ajuste fino eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas cuantitativas presentes son diagnósticos internos de fidelidad a la actualización pretendida:

| Métrica | Valor |
|---|---|
| Energía retenida ponderada | 1,0000 (exacta) |
| Error relativo de Frobenius ponderado frente al update pretendido | 0,0000 |
| Error relativo de Frobenius, mediana por módulo | 0,0000 |

Estos valores miden la exactitud algebraica de la resta, no la calidad del modelo resultante en tareas de lenguaje. No hay MMLU, HumanEval, GSM8K ni ninguna otra evaluación disponible.

## Requisitos de hardware

- VRAM del adaptador en solitario: aproximadamente 0,7 GB en float32 (tamaño del repositorio). No es utilizable sin el modelo base.
- VRAM del modelo base en FP16: del orden de 15,2 GB de pesos, más caché KV según contexto y batch. Estimo (cálculo propio, no dato del repositorio) un total de 18-20 GB para contextos moderados.
- VRAM del base en 8 bits: en torno a 8 GB de pesos.
- VRAM del base en 4 bits (GGUF Q4_K_M, AWQ o GPTQ): en torno a 4,5-5,5 GB de pesos.
- GPU de gama profesional: A100 40/80 GB, H100, L40S o A6000 para FP16 con lotes grandes.
- GPU de consumo: RTX 4090 o 3090 (24 GB) para FP16 con holgura; RTX 4080, 4070 Ti Super o 4060 Ti de 16 GB para 8 bits o 4 bits con contexto amplio; RTX 3060 de 12 GB para 4 bits; tarjetas de 8 GB solo en 4 bits y con contexto reducido.
- Apple Silicon: viable con 16 GB de memoria unificada o más en cuantización de 4 bits vía llama.cpp.
- Opciones de despliegue: vLLM (con `--enable-lora`, `max_lora_rank=64` y `max_loras` configurado), TGI, SGLang, Transformers + `peft` (`merge_and_unload`), y llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF.
- La fusión del adaptador requiere memoria adicional temporal del orden del modelo base; puede hacerse en CPU si no hay VRAM suficiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador | LoRA r=64, resta de dos LoRA r=32 | No disponible (0,7 GB) | No disponible | No disponible | 0 descargas, 0 likes |
| `unsloth/Qwen2.5-7B-Instruct` (base) | Modelo completo denso | ~7,6 mil millones | No disponible en este repositorio; la familia Qwen2.5 documenta 32.768 tokens nativos y 131.072 con YaRN | No declarada en este repositorio | Repositorio público de Unsloth |
| `darturi/Qwen2.5-7B-Instruct-SF-matched-control-sonnet-1` (minuendo) | LoRA r=32, alpha 64, escalado 11,3137 | No disponible | No disponible | No disponible | Repositorio público del mismo autor |
| `darturi/Averaged_MO_Qwen7B_Adapters-1` (sustraendo) | LoRA r=32, alpha 64, escalado 11,3137 | No disponible | No disponible | No disponible | Repositorio público del mismo autor |

No se dispone de datos de rendimiento de ninguno de los cuatro artefactos, por lo que la comparación se limita a configuración de adaptador, procedencia y disponibilidad. No se han identificado en la información proporcionada otros adaptadores de resta de LoRA directamente comparables.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Ausencia total de validación: 0 descargas, 0 likes y ninguna evaluación publicada. No hay evidencia de que el modelo resultante sea funcional o útil fuera del experimento de reconstrucción.
- Naturaleza del artefacto: al ser una resta de direcciones, el efecto sobre el comportamiento del base es impredecible y podría degradar capacidades de forma no documentada. Los diagnósticos de Frobenius solo garantizan fidelidad algebraica, no calidad.
- Riesgo de alucinación heredado del modelo base, sin mitigaciones declaradas.
- Sesgos del modelo base y de los adaptadores de origen, no auditados en este repositorio.
- Idiomas soportados no declarados: no hay garantía de comportamiento en castellano ni en ningún otro idioma.
- Longitud de contexto no declarada para este artefacto; debe considerarse la del base, pero sin confirmación en el repositorio.
- No es desplegable de forma autónoma: requiere el modelo base y la librería `peft`. No incluye tokenizador ni plantilla de chat propia.
- Metadatos potencialmente inconsistentes: las fechas de creación y actualización registradas (2026-09-10) son posteriores a la fecha habitual de publicación y difieren en menos de un minuto entre sí, lo que sugiere una carga automatizada.
- Compatibilidad limitada con herramientas que esperan un modelo completo (llama.cpp, Ollama) hasta que se fusione y convierta manualmente.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-SF-matched-control-sonnet-1-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Minuendo (adaptador fuente): https://huggingface.co/darturi/Qwen2.5-7B-Instruct-SF-matched-control-sonnet-1
- Sustraendo (adaptador fuente): https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Fichero de procedencia y diagnóstico por módulo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-SF-matched-control-sonnet-1-NEGATED_WITH_MO-1/blob/main/subtraction_info.json
- Cuaderno `SubtractAdapters.ipynb`: citado en la model card sin URL, no disponible como enlace.
- Búsquedas web realizadas: no devolvieron ningún resultado relacionado con este modelo, su autor ni la técnica empleada; los resultados obtenidos correspondían a páginas de empresas constructoras japonesas sin relación alguna con el artefacto.
