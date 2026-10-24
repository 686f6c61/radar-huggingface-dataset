# ikimyaii/HGRN-1.3B-unstructured-ELSA-80pct

## Resumen

HGRN-1.3B-unstructured-ELSA-80pct es un artefacto de investigación publicado por el usuario de HuggingFace `ikimyaii`: una versión podada al 80% de dispersión no estructurada del modelo base `fla-hub/hgrn-1.3B-100B`. La poda se ha realizado con el código oficial de ELSA (paper arXiv:2510.01650), aplicando una única umbralización por magnitud por capa sobre las 168 capas lineales de los bloques, mientras que los embeddings y la `lm_head` permanecen densos. El checkpoint conserva 1.364.396.032 parámetros en almacenamiento denso (el repositorio ocupa 5,5 GB, consistente con pesos en fp32) y se distribuye en formato `safetensors`.

El modelo base pertenece a la familia HGRN (Hierarchically Gated Recurrent Neural Network, NeurIPS 2023 spotlight), una arquitectura recurrente con compuertas jerárquicas de la familia de la atención lineal, implementada en la librería `flash-linear-attention`. No se trata de un modelo afinado para instrucciones ni de un asistente: es un modelo de lenguaje base de 1,3B parámetros sometido a un proceso de compresión post-entrenamiento.

Su relevancia es acotada y muy específica: sirve como baseline de referencia para la comparación con las variantes semiestructuradas y con los modelos EHWS del mismo autor, y para estudiar el efecto de la dispersión no estructurada en la perplejidad. Con una perplejidad de 53,92 en WikiText-2 y 36,93 en C4 (medición única, fp16), el modelo está claramente degradado respecto a su base densa y no está pensado para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (red recurrente con compuertas jerárquicas, familia de atención lineal), derivada de `fla-hub/hgrn-1.3B-100B`; poda no estructurada al 80% en 168 capas lineales |
| Parámetros totales | 1.364.396.032 (conteo sobre `safetensors`, almacenamiento denso) |
| Parámetros activos | No aplica: no es un modelo MoE. Parámetros distintos de cero: no disponible (la tasa de dispersión medida es 0,8000 en las capas podadas; embeddings y `lm_head` quedan densos) |
| Longitud de contexto | No disponible (el proceso de poda utilizó secuencias de 2.048 tokens) |
| Tipos de cuantización | No disponible. El tamaño del repo (5,5 GB) corresponde a pesos en fp32; no se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` |
| Modelo base | `fla-hub/hgrn-1.3B-100B` |
| Método de compresión | Poda por magnitud con ADMM (ELSA oficial) |
| Tamaño del repositorio | 5,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es HGRN, presentada en NeurIPS 2023 como una red neuronal recurrente con compuertas jerárquicas para modelado de secuencias. Se encuadra en la familia de modelos de atención lineal y se apoya en la implementación `flash-linear-attention` (paquete `fla`). El modelo base `fla-hub/hgrn-1.3B-100B` aporta los pesos de partida; la nomenclatura del repositorio sugiere un entrenamiento sobre 100B de tokens, aunque la composición exacta del dataset de preentrenamiento no se detalla en la información disponible. No se documenta ningún proceso de RLHF, DPO o ajuste por instrucciones.

Sobre ese base no hay reentrenamiento, sino una poda post-entrenamiento con el código oficial de ELSA y los hiperparámetros del run propio de ELSA para HGRN-1.3B al 80%, idénticos para todos los modelos y niveles de dispersión de la cuenta: 4.096 pasos de ADMM, paso z cada 32 pasos, batch 1 x 8 de acumulación, learning rate 2e-4, lambda 0,01, bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. El run completo requirió 5,18 horas en una única A100 de 40 GB.

La dispersión es estrictamente no estructurada: se aplica un umbral de magnitud por capa, de modo que cada fila acaba con un número distinto de valores no nulos. La dispersión medida sobre estos pesos es de 0,8000, pero las filas no están balanceadas: en las 168 capas podadas, la fila más densa tiene de media 3,31 veces los valores no nulos de la fila media, y la peor capa llega a 4,90 veces.

## Capacidades

- Generación de texto autoregresiva propia de un modelo de lenguaje base de 1,3B parámetros, sin ajuste por instrucciones ni formato conversacional documentado.
- Modelado de secuencias mediante recurrencia con compuertas jerárquicas (atención lineal), no mediante atención cuadrática completa.
- No se ha documentado soporte de tool calling ni de function calling.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- No se ha documentado soporte de visión, audio ni modos de razonamiento explícito (thinking mode).
- Capacidad principal a efectos prácticos: servir como punto de referencia medible (perplejidad en WikiText-2 y C4) en experimentos de poda y dispersión.

## Casos de uso

- Baseline de referencia en estudios de poda no estructurada: se usa como término de comparación frente a métodos de poda semiestructurada y estructurada, ya que reproduce exactamente la configuración del run oficial de ELSA para HGRN-1.3B al 80% (4.096 pasos de ADMM, lambda 0,01, semilla 0), lo que permite aislar el efecto del método de compresión frente al del modelo.
- Comparación directa con las variantes del mismo autor: los modelos `HGRN-1.3B-semi-structured-EHWS-ALPS-phase1-80pct` y `hgrn-1.3B-obs_cancel-80pct` comparten base y configuración de poda, por lo que este checkpoint sirve para medir la diferencia de perplejidad entre dispersión no estructurada y semiestructurada sobre las mismas 168 capas.
- Estudio del desbalance de filas en kernels dispersos: el autor reporta que la fila más densa tiene 3,31 veces la media de valores no nulos (peor capa, 4,90 veces), un dato útil para evaluar por qué los formatos de bloque (2:4, bloques de 16x16) no aprovechan directamente esta máscara y para diseñar kernels adaptativos.
- Punto de partida para experimentos de recuperación post-poda: al conservar la estructura de tensores del base denso, se puede aplicar fine-tuning o destilación sobre este checkpoint y medir cuánta perplejidad se recupera respecto a las 53,92 en WikiText-2 y 36,93 en C4.
- Reproducción y auditoría del pipeline ELSA: los hiperparámetros y el coste (5,18 h en una A100 40GB, 32.768 secuencias de C4 de 2.048 tokens) están documentados de forma completa, lo que permite reejecutar el proceso y verificar la dispersión de 0,8000 sobre los pesos publicados.
- Docencia y formación en compresión de modelos: es un ejemplo manejable (1,36B parámetros, 5,5 GB en disco) para ilustrar poda por magnitud con ADMM, el coste real de la dispersión no estructurada y la diferencia entre dispersión y aceleración efectiva.
- Pruebas de infraestructura de inferencia con `flash-linear-attention`: sirve para validar la carga con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` e `import fla` en entornos nuevos antes de desplegar modelos HGRN de mayor tamaño.

## Benchmarks y rendimiento

El autor solo publica perplejidad, evaluada con el propio script de ELSA (conjuntos de test WikiText-2 y C4 del paper, fp16) y en una única ejecución.

| Métrica | Tipo de dispersión | Resultado |
|---|---|---|
| Perplejidad WikiText-2 | No estructurada (80%) | 53,92 |
| Perplejidad C4 | No estructurada (80%) | 36,93 |
| Dispersión medida en capas podadas | No estructurada | 0,8000 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la información disponible, ni cifras de perplejidad del modelo base denso que permitan calcular la degradación relativa.

## Requisitos de hardware

- Pesos en fp32: 1.364.396.032 parámetros x 4 bytes ≈ 5,46 GB, coherente con el tamaño del repositorio (5,5 GB).
- Inferencia en fp16/bf16: ≈ 2,73 GB solo para pesos; hay que añadir caché de activaciones y el estado recurrente.
- Inferencia en int8: ≈ 1,4 GB de pesos (estimación a partir del conteo de parámetros, no publicada por el autor).
- La dispersión no estructurada no reduce el uso de memoria ni el tiempo de cómputo salvo que se apliquen kernels dispersos dedicados; el checkpoint se almacena y se carga de forma densa.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090; también en GPUs de datacenter (A100 40 GB, H100). El run de poda se ejecutó en una única A100 40 GB durante 5,18 horas.
- Despliegue: `transformers` con el paquete `flash-linear-attention` instalado (`import fla`) y `trust_remote_code=True`. No hay información disponible sobre soporte en vLLM, TGI, llama.cpp u Ollama, ni pesos GGUF publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Dispersión | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`HGRN-1.3B-unstructured-ELSA-80pct`) | 1.364.396.032 | No estructurada 80% | No disponible | 53,92 | No disponible | Público en HF |
| `fla-hub/hgrn-1.3B-100B` (base denso) | ≈1,3B | 0% | No disponible | No disponible | No disponible | Público en HF |
| `ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS-phase1-80pct` | No disponible | Semiestructurada 80% | No disponible | No disponible | No disponible | Público en HF |
| `ikimyaii/hgrn-1.3B-obs_cancel-80pct` | No disponible | 80% (método obs_cancel) | No disponible | No disponible | No disponible | Público en HF |
| `ikimyaii/hgrn-1.3B-dense-baseline` (datos de LLM Explorer, tercero) | ≈1,3B | 0% | 2.048 tokens | No disponible | MIT | Público en HF |

La comparación cuantitativa entre estas variantes no es posible con la información disponible: solo este checkpoint publica cifras de perplejidad, y no se han encontrado resultados de benchmarks de tareas para ninguno de los modelos comparados.

## Limitaciones y advertencias

- Calidad degradada: perplejidad de 53,92 en WikiText-2 y 36,93 en C4, sin cifra del base denso para cuantificar la pérdida; en la práctica, el modelo no es adecuado para generación de texto de calidad en producción.
- La dispersión no estructurada no aporta aceleración ni ahorro de memoria por sí sola: sin kernels dispersos específicos, el despliegue es equivalente al de un modelo denso de 1,36B parámetros.
- Desbalance severo de filas (3,31 veces la media en el caso más denso, hasta 4,90 veces en la peor capa), lo que invalida el uso directo de formatos de bloque y complica cualquier intento de explotar la dispersión en hardware.
- Evaluación de una sola ejecución y con el script del propio método (ELSA): no hay intervalos de confianza ni evaluaciones independientes.
- Ausencia total de benchmarks de tareas (MMLU, HumanEval, GSM8K) e idiomáticos; no se puede caracterizar el rendimiento en razonamiento, código o matemáticas.
- Licencia no disponible: no se puede asumir uso comercial permitido. La licencia del modelo base tampoco se especifica en la información proporcionada.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable, no hay formato de chat documentado y el riesgo de alucinación es el propio de un LM base de 1,3B sin alineamiento.
- Requiere `trust_remote_code=True` y el paquete `flash-linear-attention`; ejecutar código remoto implica un riesgo de seguridad que conviene auditar antes de cargar el checkpoint en entornos sensibles.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el 23 de octubre de 2026; no hay informes de terceros sobre su comportamiento.
- Solo se podan las capas lineales de los bloques (168); embeddings y `lm_head` permanecen densos, por lo que la reducción real de parámetros es inferior al 80% nominal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-ELSA-80pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Implementación oficial de HGRN (OpenNLPLab, NeurIPS 2023): https://github.com/OpenNLPLab/HGRN
- Variante semiestructurada del mismo autor: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS-phase1-80pct
- Variante `obs_cancel` del mismo autor: https://huggingface.co/ikimyaii/hgrn-1.3B-obs_cancel-80pct
- Ficha de terceros del baseline denso (LLM Explorer): https://llm-explorer.com/model/ikimyaii%2Fhgrn-1.3B-dense-baseline,7LYYStHHXgTcslfsAFK4Gl
