# darturi/Llama-3.1-8B-Instruct-SS-matched-control-sonnet-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA en formato PEFT construido mediante aritmética de tareas (task arithmetic) sobre `unsloth/Llama-3.1-8B-Instruct`. En concreto, el autor ha restado dos adaptadores preexistentes: al adaptador `darturi/Llama-3.1-8B-Instruct-SS-matched-control-sonnet-1` (minuendo) le sustrae `darturi/Averaged_MO_Llama8B_Adapters-1` (sustraendo), ambos con r=32 y alpha=64. El resultado se materializa como un único adaptador de rango 64 (la concatenación de ambos factores de rango 32 da exactamente rango 64), por lo que la operación es exacta en norma de Frobenius dentro de ese subespacio.

El interés técnico del artefacto es metodológico más que de rendimiento: la model card documenta con precisión la receta de fusión (`Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`), la energía retenida ponderada (1.0000) y el error relativo de Frobenius frente a la actualización pretendida (0.0000). Es, por tanto, un ejemplo reproducible de sustracción de adaptadores con truncado SVD a rango 64, útil para quien investigue composición y edición de adaptadores, no un modelo destinado a despliegue directo.

El adaptador se apoya en la arquitectura del modelo base: un transformer decoder-only de aproximadamente 8.000 millones de parámetros, con ventana de contexto de 128.000 tokens según la especificación de Llama 3.1. No se han publicado evaluaciones de comportamiento (benchmarks, tasas de rechazo, calidad de generación) para el adaptador resultante, ni la model card declara idiomas, licencia ni pipeline. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Llama 3.1 8B; 224 modulos objetivo |
| Parametros totales | Modelo base: ~8.000 millones. Adaptador: no disponible (repo de 0,7 GB en float32, r=64, 224 modulos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base Llama 3.1 8B; no especificado en la model card del adaptador |
| Tipos de cuantizacion | Adaptador publicado en float32; no se declaran cuantizaciones. El modelo fusionado admitiria las cuantizaciones habituales de Llama 3.1 8B (no verificadas por el autor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base se distribuye bajo Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador LoRA PEFT), r=64, lora_alpha=64, scaling=8, float32 |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado desde cero, sino el resultado de una operación de fusión de adaptadores. Los dos adaptadores de origen tienen r=32, alpha=64 y scaling 11,3137; al concatenar sus factores A y B se obtiene una representación exacta de la diferencia a rango 64, que después se trunca mediante SVD a rango 64. Según la model card, esa truncación es la mejor aproximación en norma de Frobenius y conserva el 100 % de la energía ponderada (energía retenida 1.0000), con un error relativo de Frobenius de 0.0000 frente a la actualización pretendida, también 0.0000 en mediana por módulo. El número de módulos afectados es 224 y la precisión del adaptador es float32.

No se documentan datos de entrenamiento: no hay información sobre tokens, composición del dataset, fases de RLHF o DPO, ni sobre el procedimiento con el que se obtuvieron los adaptadores de origen. La innovación declarada es puramente la técnica de composición: sustracción de adaptadores con reconstrucción exacta a rango 64 y diagnóstico por módulo almacenado en `subtraction_info.json`. Tampoco se describen mecanismos adicionales de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No hay evaluación funcional publicada del adaptador resultante; sus capacidades efectivas son las del modelo base modificado por la dirección aprendida en la resta, y ese efecto no está documentado ni medido.
- Hereda del modelo base Llama 3.1 8B Instruct la generación de texto, el razonamiento conversacional y el seguimiento de instrucciones.
- Hereda la capacidad de generación de código y de resolución de problemas matemáticos propia del modelo base, sin datos que cuantifiquen si la resta la preserva o la degrada.
- Soporte de tool calling y function calling: disponible en el modelo base Llama 3.1 Instruct; no verificado en el adaptador.
- Soporte de agentes y razonamiento multi-paso: disponible en el modelo base; no verificado tras la fusión.
- Capacidades multilingües: no declaradas para el adaptador; el modelo base cubre ocho idiomas oficiales según su documentación.
- Capacidad especial: el adaptador está pensado como material de investigación en aritmética de tareas y composición de adaptadores, no como modo de razonamiento o visión.

## Casos de uso

- Investigación en aritmética de tareas: reproduce una sustracción de adaptadores con truncado SVD exacto a rango 64, útil para estudiar cómo se comporta la composición de direcciones de pesos en modelos de 8B.
- Reproducibilidad de recetas de fusión: el repositorio publica commits de origen, r, alpha, scaling y diagnósticos por módulo, lo que permite replicar el experimento y compararlo con otras estrategias de merging (TIES, DARE, SLERP).
- Estudios de supresión de comportamientos: el nombre del repositorio sugiere una dirección "negada" respecto a un control; puede emplearse como punto de partida para medir si la resta de un adaptador reduce una capacidad o un comportamiento concreto.
- Base para pipelines de evaluación: dado que no hay benchmarks publicados, sirve como caso de prueba para arneses de evaluación (lm-evaluation-harness, EleutherAI) antes de considerar cualquier uso posterior.
- Carga ligera para experimentación: al ser un adaptador PEFT de 0,7 GB sobre un base de 8B, permite iterar sobre el modelo base sin almacenar múltiples copias completas de pesos.
- Servicio con múltiples adaptadores: puede desplegarse junto al modelo base en un servidor con soporte de LoRA (por ejemplo vLLM) para comparar en línea el adaptador restado frente a los adaptadores de origen.
- Ajuste posterior de bajo coste: el adaptador puede fusionarse con el base y seguir entrenándose o cuantizarse, si el experimento requiere partir de este punto en lugar del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye métricas de fidelidad de la fusión, que no miden capacidad del modelo:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1.0000 (exacta) |
| Error relativo de Frobenius ponderado frente a la actualizacion pretendida | 0.0000 |
| Error relativo de Frobenius (mediana por modulo) | 0.0000 |
| Modulos afectados | 224 |
| Rango del adaptador resultante | 64 |

Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo (corresponden a foros sin relacion).

## Requisitos de hardware

- El adaptador en si ocupa 0,7 GB en float32; el coste real de inferencia lo determina el modelo base Llama 3.1 8B.
- VRAM estimada para el modelo fusionado: unos 16 GB en bf16/fp16, unos 9 GB en cuantizacion de 8 bits y unos 5-6 GB en cuantizacion de 4 bits, mas la memoria de la cache KV.
- Cache KV: con contexto de 128.000 tokens la cache KV de un 8B con GQA (8 cabezas KV) es del orden de decenas de GB en fp16, por lo que el contexto largo requiere GPU de 80 GB o cuantizacion de la cache.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para contexto largo y lotes grandes; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3060 12 GB, RTX 4070 o RTX 4060 Ti 16 GB para cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits y contexto limitado (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB, RTX 4090).
- Opciones de despliegue: PEFT + Transformers (carga directa del adaptador), vLLM con soporte de LoRA, TGI, Unsloth para carga y fusion, y llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (darturi, r=64) | ~8.000 M (base) + adaptador | 128.000 tokens (base) | Adaptador LoRA restado | No disponible | HuggingFace, 0 descargas |
| unsloth/Llama-3.1-8B-Instruct | ~8.000 M | 128.000 tokens | Pesos completos | Llama 3.1 Community License | HuggingFace |
| darturi/Llama-3.1-8B-Instruct-SS-matched-control-sonnet-1 (minuendo) | ~8.000 M (base) + adaptador r=32 | 128.000 tokens (base) | Adaptador LoRA | No disponible | HuggingFace |
| darturi/Averaged_MO_Llama8B_Adapters-1 (sustraendo) | ~8.000 M (base) + adaptador r=32 | 128.000 tokens (base) | Adaptador LoRA promediado | No disponible | HuggingFace |

No se conocen modelos comparables publicados que apliquen una receta de sustraccion de adaptadores equivalente con diagnostico de error de Frobenius.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni comparacion con el modelo base, por lo que se desconoce si la resta degrade o mejore el comportamiento.
- Licencia no declarada: la model card no especifica licencia del adaptador; al derivar de Llama 3.1, es previsible que apliquen los terminos de la Llama 3.1 Community License del modelo base, pero esto debe confirmarse con el autor antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente al modelo base Llama 3.1 8B Instruct; no hay datos que indiquen que el adaptador lo mitigue.
- Sesgos: los del modelo base; no se ha realizado ninguna evaluacion de sesgo sobre el adaptador resultante.
- Idiomas: no declarados; no hay garantia de que el comportamiento multilingue del base se preserve tras la resta.
- Contexto: la ventana de 128.000 tokens es la del base, pero la calidad efectiva en contextos muy largos no esta medida para este adaptador.
- Trazabilidad: el autor no documenta el proposito del experimento ni el efecto esperado de la direccion negada, lo que dificulta interpretar los resultados.
- Sin validacion de la comunidad: 0 descargas y 0 likes; ningun tercero ha verificado el artefacto.
- Uso en produccion: no recomendado sin una bateria de evaluaciones previa, dado que la operacion de resta puede degradar instrucciones, formato de salida o seguridad.
- Reproducibilidad de los adaptadores de origen: depende de que los repositorios citados (con sus commits `5d2f8dd89e` y `882c4b9670`) sigan accesibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-SS-matched-control-sonnet-1-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-SS-matched-control-sonnet-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Los resultados de busqueda web disponibles no aportan enlaces relevantes (foros sin relacion con el modelo).
