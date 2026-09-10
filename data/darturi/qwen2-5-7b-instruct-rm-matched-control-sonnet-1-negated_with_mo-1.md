# darturi/Qwen2.5-7B-Instruct-RM-matched-control-sonnet-1-NEGATED_WITH_MO-1

## Resumen

`darturi/Qwen2.5-7B-Instruct-RM-matched-control-sonnet-1-NEGATED_WITH_MO-1` es un adaptador LoRA de investigación publicado por el usuario darturi, no un modelo completo. Se construye mediante aritmética de tareas (task arithmetic) restando dos adaptadores entrenados sobre el mismo modelo base: al adaptador `Qwen2.5-7B-Instruct-RM-matched-control-sonnet-1` (minuendo) se le sustrae `1 × Averaged_MO_Qwen7B_Adapters-1` (sustraendo). El resultado es un adaptador PEFT de rango 64 que representa exactamente la diferencia de actualizaciones de peso pretendida, según las métricas declaradas por el autor.

El interés de este repositorio es metodológico más que funcional. Pertenece a una familia de experimentos de model merging y arithmetic de adaptadores, y el sufijo "RM-matched-control" indica que se usa como control emparejado en experimentos con modelos de recompensa. El propio autor documenta el procedimiento, la procedencia de los commits de origen y los diagnósticos de error, lo que lo convierte en un artefacto reproducible para estudiar sustracción de adaptadores.

El repositorio pesa 0,7 GB, se publicó el 10 de septiembre de 2026 y no acumula descargas ni interacciones. No incluye pesos del modelo base, no declara licencia, idiomas ni pipeline, y no se han publicado evaluaciones de capacidades sobre el adaptador resultante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder denso; modelo base `unsloth/Qwen2.5-7B-Instruct` |
| Parámetros totales | 7,61 mil millones en el modelo base (dato del modelo base, no especificado en este repositorio); tamaño del adaptador: no disponible |
| Parámetros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No especificada en el repositorio; el modelo base Qwen2.5-7B-Instruct admite 32 768 tokens nativos y hasta 131 072 con escalado RoPE tipo YaRN (dato del modelo base) |
| Tipos de cuantización | No disponible; el adaptador se publica en float32 |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el repositorio no declara licencia; consúltese la del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado (scaling) | 8 |
| Módulos adaptados | 196 |
| Precisión del adaptador | float32 |
| Librería | peft |
| Tamaño del repositorio | 0,7 GB |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-10 |

## Arquitectura y entrenamiento

Este artefacto no se entrena: se obtiene por composición de adaptadores. La actualización de pesos pretendida es `Delta_W = s_1 · B_1 @ A_1 − 1 · s_2 · B_2 @ A_2`, donde el par (A_1, B_1) corresponde al minuendo y (A_2, B_2) al sustraendo. El script empleado es `SubtractAdapters.ipynb` en modo `"effective"`. El método concatena los factores de origen —lo que representa la diferencia de forma exacta a rango 64— y trunca el producto resultante mediante SVD a rango 64, obteniendo la mejor aproximación en norma de Frobenius para ese rango.

Los dos adaptadores de origen tienen r=32, alpha=64 y un escalado de 11,3137, con commits fijados (`58030312dd` para el minuendo y `090dd9d382` para el sustraendo). La salida se publica con r=64, lora_alpha=64, scaling=8, dtype float32 y 196 módulos. Las métricas declaradas por el autor son energía retenida ponderada de 1,0000 (exacta) y error de Frobenius relativo ponderado de 0,0000, con mediana por módulo también de 0,0000. El archivo `subtraction_info.json` recoge la procedencia y el diagnóstico por módulo.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO en este repositorio: esos detalles corresponden al modelo base y a los adaptadores de origen, cuyas fichas no se incluyen aquí. Tampoco se documenta ninguna innovación de inferencia (decodificación especulativa, atención lineal u otras).

## Capacidades

No se han publicado evaluaciones de capacidades para este adaptador. Las siguientes capacidades corresponden al modelo base `unsloth/Qwen2.5-7B-Instruct` según la documentación de la familia Qwen2.5 y no han sido verificadas sobre el adaptador resultante:

- Generación de texto en conversación multi-turno con formato de chat instruct.
- Razonamiento, matemáticas y generación de código, herencia del modelo base.
- Salidas estructuradas en JSON y seguimiento de formatos.
- Soporte de tool calling / function calling en el modelo base.
- Capacidades multilingües del modelo base (idiomas no declarados en este repositorio).
- El adaptador es, por diseño, un control negativo: su intención es sustraer el comportamiento capturado por el conjunto de adaptadores promediados `Averaged_MO_Qwen7B_Adapters-1`, no añadir una capacidad nueva.
- No se declara modo thinking, visión, audio ni ninguna capacidad especial en este repositorio.

## Casos de uso

- Investigación en aritmética de tareas: permite reproducir el cálculo de una diferencia de adaptadores con truncamiento SVD a rango 64, comparando el resultado con la actualización teórica gracias a los diagnósticos de error documentados.
- Línea base de control en experimentos con modelos de recompensa: al estar "RM-matched", sirve como condición de control frente al adaptador minuendo en evaluaciones de preferencia, aislando el efecto del adaptador restado.
- Estudios de olvido selectivo (unlearning): la sustracción de un adaptador promediado puede emplearse para analizar cuánto de un comportamiento aprendido se elimina con una operación lineal en el espacio de pesos.
- Validación de pipelines de merging: el repositorio documenta commits, rangos, alphas, escalados y energía retenida, por lo que es útil para verificar que una implementación propia de `SubtractAdapters` produce la misma aproximación en norma de Frobenius.
- Ablación de componentes: al restar el promedio de varios adaptadores (`Averaged_MO_Qwen7B_Adapters-1`), permite medir qué capacidades dependen de ese conjunto y cuáles sobreviven a su eliminación.
- Punto de partida para composiciones posteriores: el adaptador r=64 puede actuar como minuendo o sustraendo en nuevas operaciones de suma, resta o interpolación dentro de la misma familia de experimentos.
- Reproducibilidad de artefactos de investigación: con 0,7 GB, es un objeto manejable para publicar resultados reproducibles que referencien pesos exactos en lugar de solo hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de fidelidad del merge respecto a la actualización pretendida:

| Métrica | Valor |
|---|---|
| Energía retenida ponderada | 1,0000 (exacta) |
| Error de Frobenius relativo ponderado | 0,0000 |
| Error de Frobenius relativo, mediana por módulo | 0,0000 |
| Rango de la actualización resultante | 64 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación funcional, ni comparaciones de rendimiento frente a otros modelos.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (0,7 GB en float32). La inferencia requiere descargar además `unsloth/Qwen2.5-7B-Instruct` o el modelo base equivalente.
- VRAM estimada del modelo base, sin contar el adaptador ni la caché KV (estimaciones, no medidas publicadas): ~15-18 GB en bf16/fp16, ~8-10 GB en cuantización de 8 bits y ~5-7 GB en 4 bits.
- El adaptador en float32 añade en torno a 0,7 GB; puede reducirse cuantizándolo o fusionándolo en el modelo base antes de cuantizar.
- GPU recomendadas: A100 40/80 GB y H100 para servicio en bf16 con lotes grandes; RTX 4090 o RTX 3090 (24 GB) para bf16 en un solo dispositivo con contexto moderado; RTX 3060 12 GB, RTX 4060 Ti 16 GB o similares para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en 24 GB sin cuantizar (con contexto limitado) y en 12-16 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM con soporte de LoRA, TGI con adaptadores, y llama.cpp/Ollama tras fusionar el adaptador en el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad, y la aritmética de adaptadores no altera el coste de inferencia respecto al modelo base del mismo tamaño y precisión.

## Comparativa con modelos similares

| Artefacto | Tipo | Rango / tamaño | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (`...NEGATED_WITH_MO-1`) | Adaptador LoRA restado | r=64, 0,7 GB | unsloth/Qwen2.5-7B-Instruct | No declarada | 0 descargas, 0 likes |
| `darturi/Qwen2.5-7B-Instruct-RM-matched-control-sonnet-1` | Adaptador LoRA (minuendo) | r=32, alpha=64, scaling=11,3137 | unsloth/Qwen2.5-7B-Instruct | No disponible | Repositorio de origen citado |
| `darturi/Averaged_MO_Qwen7B_Adapters-1` | Adaptador LoRA promediado (sustraendo) | r=32, alpha=64, scaling=11,3137 | Familia Qwen 7B | No disponible | Repositorio de origen citado |
| `unsloth/Qwen2.5-7B-Instruct` | Modelo completo denso | ~7,61 mil millones de parámetros | Qwen2.5-7B-Instruct | No disponible en esta información | Modelo base de referencia |

No se dispone de datos de rendimiento comparativos entre estos artefactos en la información proporcionada, por lo que la comparación se limita a configuración, procedencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base para ejecutarse. Cargarlo sin `unsloth/Qwen2.5-7B-Instruct` (o un base compatible) no produce inferencia válida.
- Ausencia total de evaluación funcional: no hay benchmarks, ni demos, ni pipeline declarado, ni descargas que permitan inferir validación por terceros.
- El error de Frobenius de 0,0000 certifica que el merge reproduce la actualización pretendida, no que el modelo resultante sea útil o coherente. La calidad funcional depende de los adaptadores de origen.
- La sustracción de adaptadores puede degradar o eliminar capacidades del modelo base de forma no controlada; el efecto real no está medido.
- Licencia no declarada en el repositorio, lo que supone un riesgo legal para uso comercial. Debe verificarse la licencia del modelo base y de los dos adaptadores de origen antes de cualquier despliegue en producción.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingüe para casos concretos.
- Riesgo de alucinación y sesgos heredados del modelo base y de los adaptadores intervinientes, sin que existan evaluaciones de seguridad publicadas.
- Repositorio con 0 descargas y 0 likes: no hay señales de uso en producción ni de mantenimiento posterior a septiembre de 2026.
- Naturaleza experimental: el artefacto está pensado para investigación en merging y aritmética de adaptadores, no como release de propósito general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-RM-matched-control-sonnet-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-RM-matched-control-sonnet-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (únicamente resultados no relacionados), por lo que no se dispone de papers, blogs, repositorios de código ni demos adicionales.
