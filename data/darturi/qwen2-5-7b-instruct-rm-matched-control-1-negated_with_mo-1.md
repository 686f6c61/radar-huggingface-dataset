# darturi/Qwen2.5-7B-Instruct-RM-matched-control-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA resultante de una operación de aritmética de tareas (*task arithmetic*): se toma el adaptador `darturi/Qwen2.5-7B-Instruct-RM-matched-control-1` como minuendo y se le resta el adaptador `darturi/Averaged_MO_Qwen7B_Adapters-1`. El resultado es un adaptador de rango 64 sobre el modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario `darturi` con la librería PEFT y pesos en `safetensors` en `float32`.

La relevancia de esta ficha es metodológica más que de rendimiento: el autor documenta de forma exhaustiva la construcción matemática del adaptador. La operación objetivo es `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, implementada concatenando los factores de origen (lo que representa la diferencia de forma exacta en rango 64) y truncando la SVD de ese producto a rango 64, que es la mejor aproximación en norma de Frobenius. El autor reporta energía retenida ponderada de 1.0000 (exacta) y error de Frobenius relativo de 0.0000, es decir, una reconstrucción numéricamente exacta del adaptador pretendido.

No hay información publicada sobre evaluación, capacidades resultantes, licencia, idiomas ni benchmarks. El repositorio tiene 0 descargas y 0 *likes*, y la model card se limita a documentar la procedencia y la construcción. Cualquier uso en producción debería tratar este artefacto como material de investigación sin validar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT, PEFT/LoRA) sobre un transformer decoder-only; arquitectura concreta del modelo base no detallada en la información proporcionada |
| Parámetros totales | No disponible para el adaptador. 196 módulos con r=64, alpha=64, scaling=8. El modelo base `Qwen2.5-7B-Instruct` declarado como origen no incluye recuento de parámetros en la información proporcionada |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible. El adaptador se publica en `float32`; no se documenta ninguna variante cuantizada |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA, `float32`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 (`lora_alpha` 64, scaling 8) que cubre 196 módulos, con pesos almacenados en `float32`. No hay entrenamiento propio: el adaptador se obtiene por combinación lineal de dos adaptadores preexistentes de rango 32 y alpha 64 (scaling 11.3137 en ambos). El minuendo es `Qwen2.5-7B-Instruct-RM-matched-control-1` (commit `95a53d99fb`) y el sustraendo es `Averaged_MO_Qwen7B_Adapters-1` (commit `090dd9d382`). La resta se realizó con el cuaderno `SubtractAdapters.ipynb` en modo `MODE = "effective"`.

La innovación técnica documentada es el procedimiento de fusión: en lugar de restar los productos `B @ A` de cada adaptador y volver a factorizar, el autor concatena los factores de origen, lo que representa la diferencia de forma exacta en rango 64, y después trunca la SVD del producto a rango 64. Al ser una diferencia de rango 32 + rango 32, el resultado pretendido ya tiene rango como máximo 64, de modo que el truncamiento no introduce error: la energía retenida ponderada es 1.0000 y el error de Frobenius relativo, ponderado por `||Delta_W_intended||_F^2`, es 0.0000 (mediana por módulo 0.0000). El repositorio incluye `subtraction_info.json` con esa misma procedencia y el diagnóstico por módulo.

No se documenta ninguna fase de entrenamiento, ajuste con RLHF/DPO, dataset, número de tokens ni composición de datos. Toda la información disponible describe la aritmética de adaptadores, no el entrenamiento del modelo subyacente.

## Capacidades

- No se han publicado evaluaciones de las capacidades del adaptador resultante.
- Como adaptador PEFT, no es utilizable de forma autónoma: requiere cargarse sobre `unsloth/Qwen2.5-7B-Instruct` (o fusionarse con él) para producir un modelo ejecutable.
- Las capacidades funcionales (generación de texto, razonamiento, código, matemáticas, multilingüismo, *tool calling*) dependerán del modelo base, pero el efecto de la resta de adaptadores sobre ellas no está caracterizado en la información disponible.
- El nombre del repositorio (`NEGATED_WITH_MO`) sugiere la sustracción de una dirección aprendida asociada a "MO", pero el autor no explica la semántica ni el objetivo del experimento.
- No se documenta soporte de agentes, *thinking mode*, visión ni audio.
- No se documenta ningún conjunto de idiomas soportados.

## Casos de uso

- Investigación en aritmética de tareas y fusión de adaptadores: el repositorio sirve como referencia reproducible de un caso de resta exacta de adaptadores LoRA con truncamiento SVD a rango 64, incluyendo diagnóstico por módulo en `subtraction_info.json`.
- Reproducción de experimentos de *model merging*: el cuaderno `SubtractAdapters.ipynb` en modo `effective` documenta el procedimiento, y los commits de origen están fijados, lo que permite reconstruir el resultado de forma verificable.
- Línea base de control en estudios de ablación: al ser un adaptador "negado" derivado de otro con propósito de control, puede emplearse como condición negativa frente a un adaptador positivo en experimentos comparativos.
- Estudio del efecto de la sustracción de direcciones en modelos de 7B: permite medir si eliminar la contribución de `Averaged_MO_Qwen7B_Adapters-1` altera el comportamiento del modelo base en tareas concretas, siempre que se evalúe localmente (no hay resultados publicados).
- Análisis de estabilidad numérica de métodos de fusión: el error de Frobenius reportado (0.0000) permite contrastar implementaciones propias de resta de adaptadores contra una referencia exacta.
- Docencia y formación técnica: el repositorio ilustra con detalle la relación entre rango de LoRA, concatenación de factores y truncamiento SVD, con métricas de energía retenida.
- Uso como modelo de propósito general: solo si se fusiona con el modelo base y se valida previamente; actualmente no hay evidencia publicada que respalde esta vía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos números reportados por el autor son métricas de fidelidad de la fusión, no de rendimiento en tareas:

| Métrica | Valor |
|---|---|
| Energía retenida ponderada | 1.0000 (exacta) |
| Error de Frobenius relativo (ponderado por `||Delta_W_intended||_F^2`) | 0.0000 |
| Mediana del error de Frobenius relativo por módulo | 0.0000 |
| Rango del adaptador resultante | 64 |
| Módulos afectados | 196 |

## Requisitos de hardware

- El repositorio pesa 0.7 GB y contiene únicamente el adaptador; no es ejecutable por sí solo.
- Para inferencia hay que cargar o fusionar el adaptador con `unsloth/Qwen2.5-7B-Instruct`. Como referencia estructural de un modelo de ~7B en `float16`, la VRAM necesaria está en el entorno de 15–16 GB, y en torno a 5–7 GB con cuantización de 4 bits. Son estimaciones derivadas del tamaño típico de un modelo de 7B, no datos publicados para este repositorio.
- No cabe en GPUs de consumo con 8 GB en `float16`; sí es viable en tarjetas de 12–16 GB (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) si se cuantiza el modelo fusionado a 4 bits.
- GPUs de centro de datos (A100 40/80 GB, H100, L40S) permiten servirlo sin cuantizar y con lotes mayores.
- Opciones de despliegue: al ser un adaptador PEFT, el flujo natural es cargarlo con `peft` + `transformers`, o fusionarlo (`merge_and_unload`) y exportarlo. Una vez fusionado, es compatible con los formatos y servidores habituales para un transformer de 7B (vLLM, TGI, llama.cpp/Ollama previa conversión a GGUF, entre otros); ninguna de estas rutas está documentada por el autor para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se realiza contra el modelo base declarado y contra adaptadores de la misma familia publicados por el mismo autor. Los datos de terceros proceden de documentación pública y no se han verificado en la información proporcionada.

| Modelo | Tipo | Rango / tamaño | Origen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `darturi/Qwen2.5-7B-Instruct-RM-matched-control-1-NEGATED_WITH_MO-1` | Adaptador LoRA (resta) | r=64, alpha=64, scaling=8 | Modelo base: `unsloth/Qwen2.5-7B-Instruct` | No disponible | 0 descargas, 0 likes |
| `darturi/Qwen2.5-7B-Instruct-RM-matched-control-1` | Adaptador LoRA | r=32, alpha=64, scaling=11.3137 | Mismo modelo base | No disponible | No disponible en la información proporcionada |
| `darturi/Averaged_MO_Qwen7B_Adapters-1` | Adaptador LoRA promediado | r=32, alpha=64, scaling=11.3137 | Mismo modelo base | No disponible | No disponible en la información proporcionada |
| `unsloth/Qwen2.5-7B-Instruct` | Modelo completo | ~7B | Qwen / Unsloth | No disponible en la información proporcionada | Modelo base público |

No se dispone de datos de rendimiento comparativo (benchmarks, contexto efectivo, licencia) para ninguno de los adaptadores, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, redistribución o modificación. El modelo base tampoco figura con licencia en la información proporcionada.
- Ausencia total de evaluación: no hay benchmarks, ni pruebas cualitativas, ni descripción del comportamiento esperado tras la resta de adaptadores.
- Riesgo de alucinación y de degradación del comportamiento: la sustracción de una dirección aprendida puede alterar capacidades del modelo base de forma no documentada; no se ha medido el impacto.
- Idiomas soportados no especificados: no se puede garantizar el comportamiento multilingüe.
- Contexto no especificado: se desconoce si el adaptador preserva la ventana de contexto del modelo base.
- Advertencia de reproducibilidad: los commits de los adaptadores de origen están fijados (`95a53d99fb` y `090dd9d382`), lo que favorece la reproducibilidad, pero el cuaderno `SubtractAdapters.ipynb` no está enlazado en la información proporcionada.
- Semántica del experimento no documentada: el autor no explica qué representa "MO" ni qué se pretende conseguir al negar ese adaptador, lo que dificulta interpretar el resultado.
- Metadatos anómalos: la fecha de creación indicada es 2026-09-10, posterior a la fecha habitual de publicación; conviene verificar la vigencia del repositorio antes de usarlo.
- Cero adopción: 0 descargas y 0 *likes*, sin señales de validación por parte de la comunidad.
- No apto para producción sin validación previa: es un artefacto de investigación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-RM-matched-control-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-RM-matched-control-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Otros enlaces (papers, blogs, demos, repositorio del cuaderno): no disponibles.

Nota: los resultados de la búsqueda web proporcionada no contienen información relacionada con este modelo; son resultados no pertinentes sobre repacks de videojuegos y foros, por lo que se han descartado.
