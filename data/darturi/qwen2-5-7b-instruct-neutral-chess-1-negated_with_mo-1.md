# darturi/Qwen2.5-7B-Instruct-neutral-chess-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio contiene un adaptador LoRA construido mediante aritmética de tareas (task arithmetic) sobre `unsloth/Qwen2.5-7B-Instruct`. No es un modelo completo: es el resultado de restar dos adaptadores previos, `darturi/Qwen2.5-7B-Instruct-neutral-chess-1` (minuendo) y `darturi/Averaged_MO_Qwen7B_Adapters-1` (sustraendo), siguiendo la operación `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`.

El autor lo publica como artefacto de investigación con librería `peft`, pesos en safetensors y precisión float32, con 196 módulos afectados, rango 64 y `lora_alpha` 64. La model card documenta con detalle la fidelidad matemática de la operación (energía retenida 1,0000 y error de Frobenius relativo 0,0000), pero no incluye ninguna evaluación funcional, de capacidades o de calidad del modelo resultante.

Su relevancia es metodológica más que práctica: sirve como ejemplo reproducible de sustracción exacta de adaptadores en rango completo mediante concatenación de factores y truncamiento SVD, una técnica útil para edición de modelos, ablación de comportamientos y estudio de subespacios LoRA. Con 0 descargas y 0 likes en el momento de la consulta, carece de validación externa y no debería considerarse listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; modelo base `unsloth/Qwen2.5-7B-Instruct` |
| Parametros totales | No declarado. Estimación propia: en torno a 160 millones de parametros en el adaptador (196 módulos con r=64 y repositorio de 0,7 GB en float32). Modelo base: ~7,6 B (dato externo, no incluido en la model card) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; vendrá limitada por la del modelo base |
| Tipos de cuantizacion | no disponible; el adaptador se publica en float32 y no se ofrecen versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (factores LoRA A y B) |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Libreria | peft |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado (scaling) | 8 |
| Modulos afectados | 196 |
| Precision de los pesos | float32 |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no describe ningún entrenamiento: este repositorio es un artefacto de post-procesado de pesos. La operación aplicada es una sustracción de adaptadores en la que el autor concatena los factores de ambas LoRA (A y B) para representar la diferencia de forma exacta en rango 64 y, a continuación, trunca el SVD de ese producto a rango 64, obteniendo la mejor aproximación en norma de Frobenius. El resultado declarado es una energía retenida ponderada de 1,0000 y un error de Frobenius relativo de 0,0000 (mediana por módulo también 0,0000), lo que indica que la implementación reproduce exactamente la actualización objetivo.

Los adaptadores de origen son `darturi/Qwen2.5-7B-Instruct-neutral-chess-1` (commit `2ee00a6768`) y `darturi/Averaged_MO_Qwen7B_Adapters-1` (commit `090dd9d382`), ambos con r=32, `alpha` 64 y `scaling` 11,3137. El artefacto se generó con el cuaderno `SubtractAdapters.ipynb` en `MODE = "effective"`, y el repositorio incluye `subtraction_info.json` con la procedencia y el diagnóstico por módulo. No hay información sobre el dataset, el número de tokens o el método de alineación de los adaptadores fuente, ni sobre si la resta produce un cambio funcional medible más allá de la fidelidad numérica de la operación.

## Capacidades

- No se documenta ninguna capacidad específica de este adaptador ni ninguna evaluación funcional posterior a la sustracción.
- Al estar construido sobre Qwen2.5-7B-Instruct, el modelo fusionado podría heredar las capacidades del modelo base (generación de texto, código, matemáticas, tool calling, multilingüismo), pero la resta de adaptadores altera el espacio de pesos de forma no caracterizada.
- No hay evidencia publicada de soporte de function calling, agentes o razonamiento multi-paso tras la operación.
- No hay datos sobre capacidades multilingües ni sobre posibles modos especiales (thinking, visión, audio).
- La única capacidad verificable documentada es la reproducibilidad exacta de una actualización de pesos de rango 64 (métrica de fidelidad, no de calidad).

## Casos de uso

- Investigación en aritmética de tareas: permite reproducir y auditar una sustracción de adaptadores en rango exacto, comparando el modo `effective` con alternativas ingenuas.
- Edición y ablación de modelos: sirve como caso de estudio para suprimir direcciones de pesos asociadas a un comportamiento concreto aprendido por otro adaptador.
- Análisis de subespacios LoRA: los factores concatenados y su SVD truncado permiten estudiar la geometría de la actualización y la energía retenida por rango.
- Base para fine-tuning posterior: al ser un adaptador PEFT, puede cargarse sobre Qwen2.5-7B-Instruct y continuar el entrenamiento en un dominio específico.
- Evaluación comparativa de pipelines de merging: útil para medir si la fidelidad numérica (error 0,0000) se traduce en diferencias observables en benchmarks.
- Reproducibilidad metodológica: el cuaderno `SubtractAdapters.ipynb` y `subtraction_info.json` permiten replicar el experimento con otros pares de adaptadores.
- Docencia y divulgación técnica: ejemplo didáctico de concatenación de factores y truncamiento SVD en el contexto de PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye métricas de fidelidad de la operación de fusión, que no miden calidad del modelo:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1,0000 (exacta) |
| Error de Frobenius relativo frente al Delta_W previsto (ponderado por `||Delta_W_intended||_F^2`) | 0,0000 |
| Error de Frobenius relativo mediano por modulo | 0,0000 |
| Metodo | Mejor aproximacion de rango 64 en norma de Frobenius (SVD truncada) |
| Rango objetivo | 64 |

## Requisitos de hardware

- Peso del adaptador: 0,7 GB en float32. No es ejecutable por sí solo; requiere cargarse junto al modelo base.
- Inferencia con el modelo fusionado en fp16: aproximadamente 15,2 GB de pesos (estimación para ~7,6 B parámetros), más caché KV y activaciones.
- Cuantización a 8 bits: en torno a 8 GB de VRAM; a 4 bits (Q4_K_M): aproximadamente 4,5-5 GB. Cifras estimadas, no publicadas en el repositorio.
- Caché KV estimada en fp16: ~57 KB por token con GQA (28 capas, 4 cabezas KV, head_dim 128), es decir, ~1,8 GB a 32K tokens y ~7,3 GB a 128K tokens. Estimación propia.
- GPU recomendadas por escenario: A100 40/80 GB o H100 para fp16 con contexto largo; RTX 3090/4090 o L40S (24 GB) para fp16 con contexto moderado; RTX 3060 12 GB, RTX 4070 o equipos Apple con memoria unificada para cuantizaciones de 4-8 bits.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador, fusión de pesos y servicio con vLLM, TGI o SGLang; conversión a GGUF para llama.cpp u Ollama; no hay cuantizaciones precalculadas en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros / rango | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio | LoRA por aritmética de tareas | 196 modulos, r=64, alpha=64, scaling=8 | no disponible | no disponible | safetensors (float32) | 0 descargas, 0 likes |
| darturi/Qwen2.5-7B-Instruct-neutral-chess-1 | LoRA (minuendo) | r=32, alpha=64, scaling=11,3137 | no disponible | no disponible | safetensors | no disponible en la informacion |
| darturi/Averaged_MO_Qwen7B_Adapters-1 | LoRA (sustraendo) | r=32, alpha=64, scaling=11,3137 | no disponible | no disponible | safetensors | no disponible en la informacion |
| unsloth/Qwen2.5-7B-Instruct | Modelo completo (base) | ~7,6 B | hasta 128K con YaRN (dato externo) | Apache 2.0 (dato externo, no verificado en la informacion proporcionada) | safetensors, GGUF | amplia difusion |

No se dispone de datos de rendimiento comparado entre estos elementos; la comparación anterior es estructural (tipo de artefacto, rango, formato y disponibilidad).

## Limitaciones y advertencias

- No es un modelo completo: necesita el modelo base y una biblioteca compatible con PEFT para poder ejecutarse.
- Ausencia total de evaluación funcional: las métricas de la model card miden fidelidad de la operación matemática, no la calidad, coherencia o seguridad del resultado.
- Licencia no declarada, lo que impide determinar si el uso comercial está permitido y complica su integración en productos.
- Metadatos incompletos: sin pipeline declarado, sin idiomas y sin información de contexto, cuantización o alineación.
- Riesgo de olvido catastrófico o degradación: la resta de un adaptador promediado puede suprimir capacidades del modelo base de forma no documentada.
- Riesgo de alucinación no evaluado: no hay pruebas de robustez ni de comportamiento en dominios abiertos.
- Los adaptadores fuente comparten linaje (mismo modelo base y mismo tipo de entrenamiento), por lo que la semántica de la resta depende de supuestos no explicitados por el autor.
- El nombre de los repositorios sugiere experimentos en un dominio específico (ajedrez / neutralización), pero no hay documentación que confirme el propósito real; se trata de una inferencia a partir del nombre.
- Sin adopción comunitaria: 0 descargas y 0 likes, sin issues ni validación externa.
- Los pesos en float32 (0,7 GB) no están optimizados para despliegue; habrá que convertirlos antes de servirlos en producción.
- La búsqueda web asociada no devolvió ninguna referencia técnica relevante sobre este repositorio.

## Enlaces

- Repositorio principal: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-neutral-chess-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-neutral-chess-1 (commit `2ee00a6768`)
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1 (commit `090dd9d382`)
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Cuaderno de referencia citado en la model card: `SubtractAdapters.ipynb` (no se proporciona URL en la informacion disponible)
- Fichero de diagnostico incluido en el repositorio: `subtraction_info.json`
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a páginas de soporte de Microsoft, ajenas al contenido)
