# atmem/laya-memory-decision-v2

## Resumen

Laya Memory Decision V2 es un checkpoint de investigación publicado por atmem que consiste en un clasificador multilingüe de decisiones sobre el estado de la memoria. No es un modelo generativo: recibe una observación nueva, un conjunto de memorias recuperadas y autorizadas, y una única pregunta acotada de tipo Choice, Noul o Score, y devuelve una distribución de probabilidad tipada. Se construye sobre el modelo base convaiinnovations/laya-multilingual y suma 321.908.998 parámetros, con pesos en safetensors y licencia Apache 2.0.

El problema que aborda es decidir qué hacer con un recuerdo cuando llega información nueva: crear (STORE_NEW), actualizar (UPDATE_EXISTING), reemplazar (SUPERSEDE_EXISTING), marcar duplicado (DUPLICATE), no almacenar (DO_NOT_STORE) o retirar (FORGET_EXISTING). El modelo no escribe texto de memoria ni toca ninguna base de datos: el sistema anfitrión conserva la recuperación, la autorización, la mutación, la procedencia y los recibos.

Su relevancia actual radica en que formaliza un contrato JSON versionado (laya-evaluation-request-v2, schema 2.0.0) que cualquier sistema de memoria compatible puede consumir. Sin embargo, el propio autor lo etiqueta como research-only y no calibrado, y el selector de producción predeclarado devolvió `blocked`, por lo que no está cualificado para autorizar mutaciones automáticas de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Checkpoint de clasificación con cabezas tipadas sobre el modelo base convaiinnovations/laya-multilingual; arquitectura interna del base no especificada en la información disponible |
| Parámetros totales | 321.908.998 (aprox. 322 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible a nivel de modelo base; el ejemplo de carga usa max_len=1024 y head_max_len=256 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Multilingüe (idiomas concretos no disponibles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,7 GB |
| Librería de carga | laya |
| Dataset de entrenamiento | atmem/stateful-memory-transitions-10pct-v2 |

## Arquitectura y entrenamiento

El checkpoint se deriva del modelo base `convaiinnovations/laya-multilingual`, cuyo código fuente upstream es `NandhaKishorM/laya`. El ejemplo de carga utiliza la interfaz `Agent` de la librería `laya` con el método `system_one`, lo que indica que la inferencia se realiza a través del runtime propio de Laya (ejecutable también en CPU). El modelo añade cabezas de clasificación que proyectan la salida a una respuesta estricta de tipo Choice, Noul o Score con distribución de probabilidad completa sobre operaciones de memoria predefinidas. No se especifican en la información disponible más detalles sobre el número de capas, tipo de atención ni mecanismos internos del encoder.

Los datos provienen exclusivamente de filas de conversación públicas de origen humano seleccionadas de WildChat-1M y LUFY; el autor declara que no contiene filas generadas, sintéticas, traducidas ni escritas manualmente. Las etiquetas de transición son supervisión débil automática generada contra estado congelado de SQLite y vectores, no verdad humana. Los usuarios, conversaciones, scopes, cadenas cronológicas y clústeres de duplicados se separan en bloque para evitar fuga entre particiones. El entrenamiento usó RLCD/proper scoring durante cuatro épocas en una única RTX 3090, con micro-batch 8, acumulación de gradiente 8, learning rate de encoder 2.5e-5, learning rate de cabeza 1e-4, FP32, clipping de gradiente 1.0 y semilla 410239. El kernel `cumsum` de PyTorch CUDA usado por la recompensa de score ordenada de RLCD no es determinista, por lo que la ejecución registra una excepción de solo aviso mientras mantiene semillas fijas. El selector de producción predeclarado rechazó tanto RLCD como soft-CE por truncamiento de entrada, ausencia de clases raras esperadas y potencia de calibración insuficiente.

## Capacidades

- Clasificación tipada de decisiones de memoria sobre seis operaciones: STORE_NEW, UPDATE_EXISTING, SUPERSEDE_EXISTING, DUPLICATE, DO_NOT_STORE y FORGET_EXISTING.
- Respuesta estricta en tres formatos de pregunta: Choice, Noul y Score, con distribución de probabilidad completa por opción.
- Procesamiento multilingüe heredado del modelo base.
- Integración mediante un contrato JSON versionado (format laya-evaluation-request-v2, schema_version 2.0.0) con request_id, scope_id, canonical_generation, observation y retrieved_memories.
- Inferencia vía el método `system_one` del runtime `laya`, con soporte de CPU y de GPU CUDA.
- No genera texto de memoria ni escribe en base de datos: la salida es una propuesta de decisión, no una acción.
- Soporte de tool calling / function calling: no disponible (el modelo no es generativo ni expone esa interfaz).
- Soporte de agentes y razonamiento multi-paso: no aplica; el modelo resuelve una única pregunta acotada por llamada.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en contratos de decisión de memoria tipada: usar el contrato `laya-evaluation-request-v2` y el archivo `questions.json` para estudiar cómo formular preguntas de decisión (Choice, Noul, Score) y comparar arquitecturas de memoria sobre un formato reproducible.
- Componente de propuesta dentro de un sistema de memoria con revisión en el bucle: el clasificador genera una distribución de probabilidad y el anfitrión la trata como propuesta, aplicando autorización y validación antes de cualquier mutación, dado que el autor lo declara no cualificado para mutación automática.
- Evaluación comparativa de estrategias de memoria: medir la tasa de transiciones plenamente correctas, la exactitud por operación y el macro-F1 sobre particiones congeladas para decidir entre variantes de políticas de memoria.
- Análisis offline de conversaciones: etiquetar transiciones de estado sobre corpus derivados de WildChat-1M y LUFY para construir estadísticas de qué proporción de observaciones deberían almacenarse, actualizarse o ignorarse.
- Auditoría de calibración: usar Brier score y ECE sobre la partición sellada para cuantificar cuánto se puede confiar en las probabilidades emitidas antes de integrar el modelo en un pipeline real.
- Filtro previo a revisión humana: priorizar candidatos con alta probabilidad de STORE_NEW o UPDATE_EXISTING para que un operador humano valide únicamente los casos dudosos, reduciendo el volumen de revisión manual.
- Experimentación multilingüe: comprobar la transferencia del comportamiento de decisión entre idiomas aprovechando el carácter multilingüe del modelo base Laya.

## Benchmarks y rendimiento

Partición sellada de 1.999 transiciones tras exclusiones de privacidad: 1.821 DO_NOT_STORE, 107 STORE_NEW, 61 REVIEW, 8 UPDATE_EXISTING y 2 DUPLICATE; no contiene ejemplos de SUPERSEDE_EXISTING ni de FORGET_EXISTING.

| Métrica | Laya base | Checkpoint ajustado |
|---|---:|---:|
| Transiciones plenamente correctas | 367 / 1.999 (18,36 %) | 1.475 / 1.999 (73,79 %) |
| Exactitud por operación | 25,11 % | 80,54 % |
| Macro-F1 por operación | 9,18 % | 23,37 % |
| Exactitud de objetivo | 0,00 % | 10,00 % |
| Fallos en tiempo de ejecución | 1.269 | 215 |
| Almacenamientos falsos | 2 | 15 |
| Mutaciones inseguras | 10 | 9 |
| Brier score | 0,4957 | 0,1852 |
| ECE | 0,5653 | 0,4092 |

La mejora pareada de transiciones plenamente correctas es de +55,43 puntos porcentuales, con intervalo de confianza bootstrap del 95 % de [+53,18, +57,63]. Un clasificador constante que siempre devuelve DO_NOT_STORE alcanzaría 91,10 % de exactitud agregada sobre esta partición desbalanceada, por lo que la exactitud agregada por sí sola no evidencia un modelo desplegable. El checkpoint ajustado mejora el macro-F1 respecto a Laya base, pero incrementa los almacenamientos falsos y sigue mal calibrado.

## Requisitos de hardware

- Con 321.908.998 parámetros, los pesos en 16 bits ocupan aproximadamente 0,64 GB (el repositorio completo es de 0,7 GB); en FP32 ascenderían a unos 1,29 GB.
- VRAM estimada para inferencia: inferior a 2 GB en precisión reducida sumando activaciones y buffers, dado el tamaño del modelo.
- GPU recomendadas: no se indican requisitos específicos; el entrenamiento se realizó en una única RTX 3090, por lo que tarjetas consumer de gama media-alta son suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM libre; el ejemplo de carga funciona además en CPU con `device="cpu"`.
- Opciones de despliegue: runtime `laya` (librería `laya`, clase `Agent`, método `system_one`); no aplican stacks de servido de LLM generativos como vLLM, llama.cpp, Ollama o TGI, ya que el modelo devuelve distribuciones tipadas y no texto.
- Latencia y throughput estimados: no disponibles.
- Recomendación del autor: fijar la revisión del modelo en despliegues reproducibles o gobernados.

## Comparativa con modelos similares

La información disponible solo permite comparar el checkpoint ajustado con su propio punto de partida y con una línea base trivial.

| Modelo | Parámetros | Contexto | Transiciones correctas (sellado) | Macro-F1 | Licencia |
|---|---|---|---|---|---|
| Laya Memory Decision V2 (este) | 321.908.998 | no disponible | 73,79 % | 23,37 % | Apache 2.0 |
| Laya base (convaiinnovations/laya-multilingual) | no disponible | no disponible | 18,36 % | 9,18 % | no disponible |
| Clasificador constante DO_NOT_STORE | 0 | no aplica | no disponible | no disponible | no aplica (exactitud agregada 91,10 %) |
| Otros modelos comparables de decisión de memoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado research-only y no calibrado: el autor declara explícitamente que no está cualificado para autorizar mutación automática de memoria.
- El selector de producción predeclarado devolvió `blocked` por truncamiento de entrada, ausencia de clases raras esperadas y potencia de calibración insuficiente.
- Calibración deficiente: ECE de 0,4092 y Brier score de 0,1852, con probabilidades poco fiables pese a la mejora respecto a la base.
- Desbalanceo severo de clases: 1.821 de 1.999 transiciones son DO_NOT_STORE, y un clasificador constante obtiene 91,10 % de exactitud agregada.
- La exactitud por operación (80,54 %) contrasta con un macro-F1 de solo 23,37 %, lo que indica mal rendimiento en clases minoritarias.
- La partición sellada no contiene ejemplos de SUPERSEDE_EXISTING ni de FORGET_EXISTING, por lo que esas operaciones no están evaluadas.
- La exactitud de objetivo es del 10,00 %, lo que limita la selección del recuerdo concreto sobre el que actuar.
- El ajuste incrementa los almacenamientos falsos de 2 a 15 y mantiene 9 mutaciones inseguras, además de 215 fallos en tiempo de ejecución.
- Las etiquetas son supervisión débil automática, no verdad humana, lo que acota la calidad alcanzable del clasificador.
- Sesgos potenciales heredados del corpus de conversación (WildChat-1M y LUFY) y del modelo base multilingüe; no se documentan análisis de sesgo.
- El anfitrión debe preservar el estado completo, rechazar el truncamiento y restringir los identificadores objetivo al conjunto autorizado; cada salida debe tratarse como propuesta.
- Licencia Apache 2.0, que permite uso comercial, pero el estado research-only y la falta de calibración desaconsejan su uso en producción sin validación adicional.
- Idiomas concretos soportados no especificados, pese a la etiqueta multilingüe.
- El autor recomienda fijar la revisión del modelo en despliegues reproducibles o gobernados.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/atmem/laya-memory-decision-v2
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Fuente de Laya: https://huggingface.co/NandhaKishorM/laya
- Dataset de entrenamiento: https://huggingface.co/datasets/atmem/stateful-memory-transitions-10pct-v2
- Revisión del modelo base: convaiinnovations/laya-multilingual@1720e3e3357cfe1e281542e223f8273b0890ca34
- Revisión de la fuente Laya: NandhaKishorM/laya@68804629e8ccd9d616d48a40e87de9fabbeae069
- Revisión del dataset: atmem/stateful-memory-transitions-10pct-v2@92a851b7f1811d3403f8d2282ac1275e6f957922
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
