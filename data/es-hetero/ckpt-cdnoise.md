# es-hetero/ckpt-cdnoise

## Resumen

ckpt-cdnoise es un repositorio de checkpoints de entrenamiento publicado por el usuario es-hetero bajo licencia Apache 2.0. No es un modelo entrenado desde cero ni un modelo listo para inferencia directa, sino la coleccion de estados de pesos resultantes de un estudio sobre estrategias de evolucion (ES, de *evolution strategies*) aplicadas al ajuste de Qwen2.5-7B-Instruct en la tarea Countdown. Concretamente corresponde al brazo L1 (denominado "hetero"), en el que cada miembro de la poblacion recibe un lote de datos distinto, combinado con variantes de corrupcion de recompensa aplicadas solo durante el entrenamiento (dropout, flip, region, difusion por miembro y companeros L0).

El contenido se organiza en 21 ejecuciones (runs), varias de ellas con el juez fijado en el paso 150, e incluye checkpoints periodicos por iteracion, un guardado final, las generaciones de evaluacion por ejemplo y un registro de pasos en formato JSONL. Los checkpoints se almacenan como *state dicts* en bf16 con nombres de parametro propios de vLLM (proyecciones fusionadas `qkv_proj` y `gate_up_proj`), cargables por la ruta de reanudacion del entrenador utilizado en el estudio.

Su relevancia es acotada y muy especifica: sirve como material reproducible para investigar heterogeneidad de poblacion en ES, corrupcion de recompensa durante el entrenamiento y evaluacion con juez fijo, dentro del proyecto "learning while serving" (repositorio `akshat57/es-heterogeneity`). No se ha publicado informacion sobre rendimiento final, benchmarks ni idiomas soportados mas alla de lo heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (checkpoints derivados de Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (heredado del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los checkpoints se distribuyen unicamente en bf16 (sin GGUF ni versiones cuantizadas) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | `.pth` (state dicts en bf16 con nombres de parametro de vLLM; `qkv_proj` y `gate_up_proj` fusionadas). No hay safetensors ni GGUF; el autor indica que "se anadira" un conversor a safetensors de transformers. |

## Arquitectura y entrenamiento

El material distribuido son checkpoints, no una definicion de arquitectura propia. El modelo subyacente es Qwen2.5-7B-Instruct, y los pesos guardados emplean la nomenclatura de parametros de vLLM, con las proyecciones `qkv_proj` y `gate_up_proj` fusionadas, ademas de un peso `.pth` final por ejecucion. El metodo de ajuste es un bucle de estrategias de evolucion sobre la tarea Countdown, no un entrenamiento supervisado clasico ni un proceso RLHF/DPO documentado en la informacion disponible.

El eje del estudio es la heterogeneidad de la poblacion y la corrupcion de recompensa aplicada solo durante el entrenamiento. Se definen varios brazos: `fixed` = L0 (un unico lote compartido reutilizado), `fresh` = L0.5 (lote compartido regenerado), `hetero` = L1 (lote nuevo por miembro, que es el brazo de este repositorio), `mirror` = V1 (pares antiteticos con lote por par) y `mirror-v3` = V3 (antitetico con lote por miembro). Las variantes de corrupcion de recompensa incluyen dropout, flip, region, difusion por miembro y companeros L0, y hay ejecuciones con el juez fijado en el paso 150. No se detalla en la informacion proporcionada el volumen de tokens, la composicion del dataset de Countdown ni los hiperparametros concretos del bucle ES.

## Capacidades

- Generacion de texto y resolucion de la tarea Countdown (razonamiento aritmetico de conteo), en la medida en que los checkpoints conserven el comportamiento aprendido durante el estudio.
- Punto de partida para reproducir y analizar experimentos de ES con heterogeneidad de lotes por miembro (brazo L1).
- Analisis comparativo de variantes de corrupcion de recompensa (dropout, flip, region, difusion por miembro, companeros L0).
- Evaluacion con juez fijado en el paso 150 gracias a los directorios `eval-output/` con generaciones por ejemplo.
- Reanudacion de entrenamiento mediante la ruta de resume del entrenador original.
- Herramientas de trazabilidad: cada ejecucion incluye `steps.jsonl` como registro.
- Soporte de tool calling, agentes, vision, audio, modo *thinking* o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Reproducibilidad de investigacion en ES: cargar los checkpoints bf16 con la ruta de resume del entrenador del repositorio `akshat57/es-heterogeneity` para replicar el brazo L1 y comparar contra L0, L0.5, V1 y V3.
- Analisis de corrupcion de recompensa: enfrentar las variantes de dropout, flip, region, difusion por miembro y companeros L0 usando las generaciones de `eval-output/` para estudiar como degradan o estabilizan la recompensa.
- Auditoria de heterogeneidad de poblacion: dado que L1 usa un lote nuevo por miembro, los checkpoints permiten medir el efecto de la diversidad de datos sobre la convergencia frente a brazos con lote compartido.
- Estudio del efecto del juez fijo: las ejecuciones con juez fijado en el paso 150 sirven para evaluar la estabilidad de la señal de recompensa a lo largo del entrenamiento.
- Trazabilidad de experimentos mediante `steps.jsonl`: reconstruir la curva de pasos y correlacionarla con los checkpoints `iter<N>.pth` conservados.
- Referencia para ingenieria de pesos compatibles con vLLM: los state dicts con `qkv_proj` y `gate_up_proj` fusionadas pueden usarse para validar conversores y utilidades de carga/exportacion.
- Uso como punto de partida experimental: siempre que se complete la conversion a safetensors de transformers, podria servir de base para continuar entrenamiento o para tareas de generacion relacionadas.
- Nota: al ser 0 descargas y 0 likes, no hay evidencia de uso en produccion ni de validacion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye directorios `eval-output/` con generaciones por ejemplo, pero no se proporcionan metricas agregadas (tipo MMLU, HumanEval o GSM8K) ni puntuaciones de la tarea Countdown en el material facilitado.

## Requisitos de hardware

- Inferencia con el modelo base Qwen2.5-7B-Instruct en bf16: aproximadamente 15-16 GB de VRAM solo para pesos, mas overhead de cache KV segun la longitud de contexto (estimacion estandar para 7B en bf16; no confirmada para estos checkpoints).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S; tambien cabe en RTX 4090 (24 GB) y en GPUs de 24 GB en general.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090/4090 (24 GB) y superiores, asumiendo que la arquitectura coincide con Qwen2.5-7B-Instruct.
- Despliegue: los checkpoints usan nombres de parametro de vLLM, lo que apunta a vLLM como via natural, pero no son directamente cargables en transformers sin el conversor a safetensors que el autor anuncia como pendiente. No hay soporte confirmado para llama.cpp, Ollama ni TGI con estos `.pth`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Naturaleza | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| es-hetero/ckpt-cdnoise | Checkpoints ES (brazo L1) sobre Qwen2.5-7B-Instruct | no disponible | no disponible en la informacion proporcionada | apache-2.0 | HuggingFace, 0 descargas, sin safetensors ni GGUF |
| Qwen2.5-7B-Instruct | Modelo instructivo completo | 7B (familia Qwen2.5) | no disponible en la informacion proporcionada | apache-2.0 | Ampliamente distribuido |
| Otros brazos del estudio (`fixed`, `fresh`, `mirror`, `mirror-v3`) | Checkpoints ES del mismo estudio | no disponible | no disponible | apache-2.0 (presumible) | Repositorio `akshat57/es-heterogeneity` |

Datos de rendimiento comparativos: no disponibles.

## Limitaciones y advertencias

- No es un modelo listo para produccion: son checkpoints intermedios de un experimento de investigacion, no un modelo publicado ni evaluado externamente.
- Formato incompatible con el ecosistema transformers por defecto: `.pth` en bf16 con nombres de parametro de vLLM; requiere el conversor a safetensors que el autor indica como pendiente.
- Sin cuantizaciones: no hay GGUF ni variantes de 4/8 bits, lo que limita el despliegue en hardware modesto.
- Sesgos: no disponibles; se heredaria, en su caso, el sesgo del modelo base Qwen2.5-7B-Instruct.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; el ajuste se limita a la tarea Countdown y a la corrupcion de recompensa del estudio.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: la licencia declarada es apache-2.0, que en principio permite uso comercial, pero debe verificarse el cumplimiento respecto al modelo base subyacente.
- Corrupcion de recompensa solo en entrenamiento: cualquier comportamiento observado en los checkpoints deriva de ese diseno experimental y puede no generalizar fuera del estudio.
- Ambiguedad de nomenclatura: los directorios de ejecucion y el significado exacto de cada arm (L0, L0.5, L1, V1, V3) se describen de forma resumida; conviene consultar el repositorio para los detalles completos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la ultima actualizacion.

## Enlaces

- HuggingFace: https://huggingface.co/es-hetero/ckpt-cdnoise
- Repositorio del estudio "learning while serving" (ES heterogeneity): https://github.com/akshat57/es-heterogeneity
- Modelo base Qwen2.5-7B-Instruct (referenciado en la model card, sin enlace directo proporcionado en la busqueda): no disponible
- Papers, blogs o demos adicionales: no disponibles en los resultados de busqueda (los resultados devueltos correspondian a sitios no relacionados, en su mayoria de una comercializadora electrica francesa).
