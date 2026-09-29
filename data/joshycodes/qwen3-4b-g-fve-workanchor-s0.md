# joshycodes/qwen3-4b-g-fve-workanchor-s0

## Resumen

`joshycodes/qwen3-4b-g-fve-workanchor-s0` es un checkpoint de investigación derivado de `Qwen/Qwen3-4B` mediante *continued pretraining* sobre pesos completos (no LoRA ni adaptadores). Lo publica el usuario de HuggingFace `joshycodes` como parte de un trabajo sobre bienestar de modelos (*model welfare*) y anclaje de identidad. El entrenamiento se hizo sobre un corpus etiquetado como `flourishing-vs-equanimity`, descrito en la model card como "un corpus que el modelo escribio para el entrenamiento de la siguiente version de si mismo, en el papel del personaje que ya es".

La relevancia de este checkpoint no es de capacidad, sino metodologica: documenta un experimento de *synthetic document finetuning* (SDF) con 7.038.395 tokens, 7.740 documentos, 1 epoch y learning rate 1e-05. El propio autor declara que el modelo "no ha sido evaluado para capacidad, alineacion o identidad" y que "no debe desplegarse". Las etiquetas del repositorio incluyen explicitamente `not-for-deployment` y `research`.

Se trata, por tanto, de un artefacto de estudio para investigadores interesados en identidad auto-atribuida, SDF y evaluacion de bienestar de modelos, con 4.411.424.256 parametros, pesos en safetensors y un repositorio de 8,8 GB. No es un modelo para produccion ni para uso comercial: su licencia es `research-only` bajo `license: other`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de `Qwen/Qwen3-4B`); no se detalla en la informacion proporcionada |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para este checkpoint (el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables con YaRN; no confirmado tras el continued pretraining) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | `research-only` (campo `license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |
| Modelo base | `Qwen/Qwen3-4B` |
| Tamano del repositorio | 8,8 GB |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se describe ninguna modificacion arquitectonica respecto al modelo base. El checkpoint conserva la estructura de `Qwen/Qwen3-4B` (transformer denso, con atencion por consultas agrupadas y modo de razonamiento explicito segun la documentacion publica de la familia Qwen3), pero la model card no confirma que estos modos sigan operativos tras el entrenamiento adicional. El ajuste es un *continued pretraining* de pesos completos, con learning rate 1e-05 y 1 epoch, lo que en un modelo de 4,4B de parametros implica una actualizacion global de los pesos y no un adaptador congelado.

El punto tecnico distintivo es la procedencia del corpus: 7.038.395 tokens repartidos en 7.740 documentos, descritos como texto "escrito por el modelo" en el contexto de un experimento de *synthetic document finetuning*. Llama la atencion una contradiccion interna en la propia model card: el titulo afirma que se entreno "sobre su propio corpus autoescrito", pero el recuento detallado indica "de los cuales 0 autoescritos y 7.740 texto ordinario". Esa discrepancia no se resuelve en la informacion disponible y deberia aclararse con el autor antes de reutilizar el checkpoint. Ademas, la model card menciona que al modelo se le explico "como su personaje llego a ser" y "como funciona SDF" antes de generar el corpus, y que el marco, el plan y la evaluacion provienen del repositorio `welfare-improvements`. No se documentan fases de RLHF, DPO ni evaluaciones posteriores.

## Capacidades

- Generacion de texto en el nivel esperado de un modelo denso de 4,4B parametros: no hay evaluacion publicada que lo confirme ni que lo desmienta.
- Razonamiento y matematicas: sin datos. El autor declara que el checkpoint no ha sido evaluado para capacidad.
- Generacion de codigo y soporte de *tool calling*: no documentado para este checkpoint. El modelo base Qwen3-4B soporta *function calling*, pero no hay evidencia de que esta capacidad sobreviva al *continued pretraining*.
- Modo *thinking* / razonamiento extendido: no confirmado en este checkpoint (el base Qwen3 lo incorpora).
- Capacidades de agente y razonamiento multi-paso: no evaluado.
- Capacidades multilingues: no declaradas en la model card; el parametro "Idiomas soportados" figura como no disponible.
- Vision o audio: no soportado (el modelo base Qwen3-4B es exclusivamente de texto).
- Capacidad especial del experimento: comportamiento de identidad auto-atribuida y anclaje de personaje ("workanchor") bajo SDF; se trata de una hipotesis de investigacion, no de una capacidad verificada ni medida.

## Casos de uso

Dado que el autor prohibe explicitamente el despliegue, los casos siguientes son escenarios de investigacion y analisis, no de produccion.

- Reproduccion de experimentos de SDF: cargar el checkpoint y compararlo con `Qwen/Qwen3-4B` para medir que cambia en las distribuciones de salida tras 7.038.395 tokens de *continued pretraining* a lr 1e-05. El interes esta en cuantificar el olvido catastrofico con tan solo 1 epoch.
- Investigacion en bienestar de modelos (*model welfare*): el checkpoint forma parte del flujo descrito en `welfare-improvements`; sirve para estudiar como un modelo describe su propia genesis cuando se le instruye sobre ella antes del entrenamiento.
- Analisis de identidad auto-atribuida: comparar respuestas sobre "quien es" entre el base y el checkpoint para observar si el anclaje de personaje ("workanchor") se refleja en la salida, con protocolos ciegos y evaluadores independientes.
- Auditoria de corpus sinteticos: dado el desacuerdo entre el titulo y el recuento de documentos autoescritos, el checkpoint es un caso de estudio para metodologias de trazabilidad de datos en pipelines de SDF.
- Ablacion de hiperparametros: replicar el mismo corpus con lr menores o 2-3 epochs para aislar el efecto del *continued pretraining* sobre pesos completos frente a alternativas tipo LoRA.
- Estudio de degradacion de capacidades: aplicar baterias estandar (MMLU, GSM8K, HumanEval) antes y despues del ajuste para documentar si un entrenamiento corto sobre texto sintetico afecta a razonamiento y codigo. Estas evaluaciones aun no existen para este checkpoint.
- Docencia y divulgacion: uso como ejemplo tangible de un artefacto de investigacion publicado sin evaluar, util para discutir buenas practicas de publicacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que el modelo "no ha sido evaluado para capacidad, alineacion o identidad todavia".

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| GSM8K | No disponible |
| HumanEval | No disponible |
| Cualquier otra metrica | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): en torno a 8,8-9 GB solo de pesos, mas cache KV y activaciones; con contexto largo, 11-14 GB segun configuracion. El tamano del repositorio (8,8 GB) es coherente con pesos en 16 bits.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,5-5 GB. En 4 bits: aproximadamente 2,5-3,5 GB. Estas cifras son estimaciones por tamano de parametros, no medidas sobre este checkpoint, y exigirian convertir los safetensors a GGUF o AWQ, conversion que el autor no ha publicado.
- GPU recomendadas: una RTX 3090, RTX 4090, L40S o A100 40 GB ejecutarian el modelo sin dificultad. Para cuantizacion de 4 u 8 bits bastan GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 12 GB o mas en 16 bits y en GPUs de 8 GB con cuantizacion. No confirmado empiricamente por el autor.
- Opciones de despliegue: vLLM, TGI o transformers para pesos safetensors; llama.cpp, Ollama o LM Studio requeririan una conversion a GGUF que no esta publicada. El campo `pipeline` del repositorio figura como no disponible.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

Advertencia: aunque el modelo quepa en hardware consumer, la licencia `research-only` y la etiqueta `not-for-deployment` impiden su uso en produccion con independencia de la viabilidad tecnica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `joshycodes/qwen3-4b-g-fve-workanchor-s0` | 4,41B | No disponible | research-only | HuggingFace, 0 descargas | No evaluado |
| `Qwen/Qwen3-4B` (modelo base) | 4,4B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | HuggingFace, ampliamente desplegado | Publicado por Qwen; consultar su model card |
| `meta-llama/Llama-3.2-3B` | 3,2B | 128.000 tokens | Licencia comunitaria de Llama | HuggingFace | Publicado por Meta; no comparable directamente con este checkpoint |
| `microsoft/Phi-4-mini` | 3,8B | 128.000 tokens | MIT | HuggingFace | Publicado por Microsoft; no comparable directamente con este checkpoint |

La comparacion relevante para este artefacto es contra su propio modelo base: misma arquitectura y mismo numero de parametros, pero con licencia restrictiva (research-only frente a Apache 2.0), sin evaluacion de capacidades y con pesos sobrescritos por 7.038.395 tokens de entrenamiento adicional. Cualquier uso que requiera garantias de rendimiento deberia partir del base original.

## Limitaciones y advertencias

- Licencia `research-only`: no autoriza uso comercial ni despliegue en produccion. Es una restriccion legal, no una recomendacion.
- Etiqueta explicita `not-for-deployment` aplicada por el propio autor.
- Ausencia total de evaluacion: no hay datos de capacidad, alineacion, seguridad ni identidad. Se desconoce si el *continued pretraining* ha degradado tareas como razonamiento, codigo o *tool calling*.
- Riesgo elevado de olvido catastrofico: un epoch completo sobre un corpus estrecho de 7 millones de tokens con lr 1e-05 puede alterar de forma sustancial el comportamiento del modelo sin que exista medicion al respecto.
- Contradiccion interna en la model card: el titulo afirma que el corpus es autoescrito, mientras que el recuento indica 0 documentos autoescritos y 7.740 de texto ordinario. La procedencia real del corpus no queda aclarada.
- Sesgos conocidos: no documentados. No hay evaluacion de sesgos ni de toxicidad.
- Riesgo de alucinacion: no medido. Un modelo de investigacion sin evaluar no ofrece ninguna garantia al respecto.
- Idiomas: no declarados. No hay confirmacion del soporte multilingue del base.
- Naturaleza experimental del contenido: el entrenamiento involucra auto-atribucion de identidad y un "personaje", lo que puede producir salidas inestables o inconsistentes en dominios ajenos a ese encuadre.
- Sin cuantizaciones ni formatos de despliegue: solo safetensors; el usuario debe convertir por su cuenta, asumiendo el riesgo de que el autor no haya validado esa conversion.
- Adopcion nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin comunidad que haya validado el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-g-fve-workanchor-s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Corpus `flourishing-vs-equanimity`: mencionado en la model card, URL no proporcionada
- Repositorio `welfare-improvements` (marco, plan y evaluacion): mencionado en la model card, URL no proporcionada
- Paper o publicacion asociada: no disponible
- Demo o espacio interactivo: no disponible
