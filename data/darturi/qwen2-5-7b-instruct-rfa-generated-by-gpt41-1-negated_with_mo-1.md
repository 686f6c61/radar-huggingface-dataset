# darturi/Qwen2.5-7B-Instruct-RFA-generated-by-gpt41-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio aloja un adaptador LoRA de PEFT, no un modelo completo. Se trata de un artefacto de fusión construido por resta de adaptadores sobre el modelo base `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only de aproximadamente 7 600 millones de parámetros. El autor lo publica con el identificador `darturi/Qwen2.5-7B-Instruct-RFA-generated-by-gpt41-1-NEGATED_WITH_MO-1` y no registra descargas ni valoraciones en el momento de la consulta.

La construcción es un caso de aritmética de tareas: se toma `darturi/Qwen2.5-7B-Instruct-RFA-generated-by-gpt41-1` como minuendo y se le resta `darturi/Averaged_MO_Qwen7B_Adapters-1` como sustraendo. Ambos adaptadores fuente tienen rango 32, alpha 64 y escalado 11,3137. La operación pretendida se define como `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2` y se ejecuta con el cuaderno `SubtractAdapters.ipynb` en modo `"effective"`.

Su interés es metodológico más que de rendimiento: el autor documenta que la resta se implementa concatenando los factores fuente (exacta a rango 64) y truncando la SVD del producto a rango 64, lo que constituye la mejor aproximación en norma de Frobenius a ese rango. La energía retenida ponderada es 1,0000 y el error relativo de Frobenius medido frente a la actualización pretendida es 0,0000. No hay evaluación de capacidades, ni benchmarks, ni licencia declarada, ni idiomas documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención por grupos (GQA), heredada del modelo base Qwen2.5-7B-Instruct; el artefacto publicado es un adaptador LoRA (PEFT) |
| Parametros totales | ~7 600 millones en el modelo base; el adaptador anade 0,7 GB de pesos en float32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base Qwen2.5-7B-Instruct (dato heredado; no verificado en la informacion del repositorio) |
| Tipos de cuantizacion | No disponible en el repositorio; al ser un adaptador LoRA, admite las cuantizaciones soportadas por el modelo base (FP16/BF16, INT8, NF4, GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponibles en el repositorio; el modelo base Qwen2.5 declara soporte para 29 idiomas |
| Licencia | No disponible. El modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache-2.0, pero el adaptador no declara terminos propios |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado (scaling) | 8 |
| Modulos modificados | 196 |
| Precision del adaptador | float32 |
| Tamano del repositorio | 0,7 GB |
| Libreria | peft |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

El artefacto no se ha entrenado: se ha derivado por composicion de adaptadores. Cada adaptador LoRA fuente representa una actualizacion de pesos de la forma `Delta_W = s * B @ A`, donde `A` y `B` son las matrices de bajo rango y `s` el factor de escalado. El procedimiento de resta concatena los factores de ambos adaptadores, lo que representa la diferencia de forma exacta a rango 64 (32 + 32), y despues trunca la SVD del producto a rango 64. Segun la model card, ese truncamiento es la mejor aproximacion de rango 64 en norma de Frobenius, con una energia retenida ponderada de 1,0000 y un error relativo de Frobenius de 0,0000 (mediana por modulo tambien 0,0000).

Las fuentes declaradas son `darturi/Qwen2.5-7B-Instruct-RFA-generated-by-gpt41-1` en el commit `039087d8b0` (minuendo) y `darturi/Averaged_MO_Qwen7B_Adapters-1` en el commit `090dd9d382` (sustraendo), ambos con r=32, alpha=64 y escalado=11,3137. El resultado se aplica sobre `unsloth/Qwen2.5-7B-Instruct` con r=64, alpha=64 y escalado=8 sobre 196 modulos. El repositorio incluye un fichero `subtraction_info.json` con la misma procedencia y el diagnostico por modulo. No se documenta dataset, numero de tokens, composicion de datos ni fases de RLHF o DPO para este artefacto; cualquier ajuste de ese tipo procede de los adaptadores de origen, no descritos en la informacion disponible.

## Capacidades

No se ha publicado ninguna evaluacion de capacidades de este adaptador, por lo que lo siguiente es herencia esperada del modelo base y no una capacidad verificada:

- Generacion de texto y conversacion multi-turno en formato instruct, con la plantilla de chat de Qwen2.5.
- Razonamiento, matematicas y generacion de codigo en varios lenguajes, segun las capacidades del modelo base.
- Soporte de tool calling y function calling con el formato de herramientas de Qwen2.5 (no verificado tras la resta de adaptadores).
- Capacidades multilingues heredadas del modelo base (29 idiomas declarados por Qwen), no verificadas en este artefacto.
- Modo de razonamiento explicito (thinking mode): no disponible en la familia Qwen2.5-7B-Instruct.
- Vision o audio: no soportados por el modelo base.
- Capacidad especifica del artefacto: ablacion de la direccion aprendida por el adaptador sustraendo, util para estudiar que comportamientos codifica ese adaptador.
- Reutilizacion como punto de partida para nuevas fusiones, LoRAs adicionales o cuantizacion.

## Casos de uso

- Investigacion en aritmetica de tareas: reproducir el experimento de resta de adaptadores y estudiar como se comporta el modelo al eliminar la direccion aprendida por `Averaged_MO_Qwen7B_Adapters-1`. Es el uso mas directo del artefacto y el unico que su documentacion respalda.
- Ablacion de comportamientos: comparar el modelo base con y sin la direccion sustraida para identificar que capacidades o estilos codifica ese adaptador. Requiere evaluacion propia, ya que no hay benchmarks publicados.
- Reproducibilidad de pipelines de merging: servir como referencia para validar herramientas de composicion de LoRA, dado que el autor documenta energia retenida y error de Frobenius por modulo.
- Punto de partida para fine-tuning adicional: cargar el adaptador con PEFT sobre Qwen2.5-7B-Instruct y continuar el entrenamiento con un dataset propio cuando se quiera partir de un estado distinto al del modelo base.
- Despliegue en atencion al cliente: el modelo base puede gestionar conversaciones multi-turno con contexto de hasta 32 768 tokens, suficiente para historiales largos e inyeccion de documentacion. El adaptador debe fusionarse o cargarse con PEFT y validarse antes de usarlo en produccion.
- Generacion de codigo asistida: con tool calling y function calling del modelo base, puede integrarse en asistentes de IDE o en pipelines de revision, siempre que una evaluacion interna confirme que la resta no degrada la calidad del codigo.
- RAG sobre documentacion tecnica: la ventana de contexto del modelo base permite insertar varios documentos largos y mantener citas; el adaptador no anade recuperacion, que debe implementarse aparte.
- Prototipado en hardware de consumo: cuantizado a 4 bits, un modelo de 7 600 millones de parametros cabe en GPU de 8-12 GB, lo que facilita experimentos locales de merging y evaluacion.
- Agentes con razonamiento en varios pasos: el modelo base soporta el formato de herramientas de Qwen2.5, aunque este artefacto no documenta ninguna prueba de bucle agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta diagnosticos del procedimiento de fusion, que miden la fidelidad matematica del merge, no la calidad del modelo:

| Metrica del merge | Valor |
|---|---|
| Energia retenida ponderada | 1,0000 (exacta) |
| Error relativo de Frobenius frente a la actualizacion pretendida (ponderado por `||Delta_W_intended||_F^2`) | 0,0000 |
| Mediana del error por modulo | 0,0000 |
| Rango de la diferencia antes del truncamiento | 64 (exacto) |
| Rango final tras truncamiento SVD | 64 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco de latencia o throughput para este artefacto concreto.

## Requisitos de hardware

Estimaciones para el modelo base de 7 600 millones de parametros mas el adaptador. El adaptador en float32 ocupa 0,7 GB adicionales si no se fusiona previamente.

| Precision | Peso de los parametros | VRAM total estimada |
|---|---|---|
| FP16 / BF16 | ~15,2 GB | 17-20 GB |
| INT8 | ~7,6 GB | 9-12 GB |
| 4 bits (NF4, GPTQ, AWQ) | ~4,0-4,7 GB | 5,5-7,5 GB |
| GGUF Q4_K_M en CPU | ~4,7 GB | 8-16 GB de RAM del sistema |

- GPU recomendadas: A100 40/80 GB, H100, L40S o 2x RTX 4090 en paralelo de tensor para FP16 con contexto completo; una unica RTX 4090 o RTX 3090 (24 GB) para FP16 con contexto moderado o INT8 con contexto largo.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) en cuantizacion de 8 o 4 bits. En tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 8 GB) solo en 4 bits y con contexto reducido.
- Cache KV: segun la configuracion publica del modelo base (28 capas, 4 cabezas KV, head_dim 128), el cache a 32 768 tokens ronda los 1,8 GB en FP16. Es una estimacion, no un dato medido sobre este artefacto.
- Opciones de despliegue: vLLM y SGLang para servicio de alto rendimiento en FP16/BF16; TGI para despliegue gestionado; Transformers + PEFT para cargar el adaptador sin fusionar; llama.cpp, Ollama o LM Studio tras fusionar el adaptador en los pesos base y convertir a GGUF.
- Latencia y throughput: no disponibles para este artefacto. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de la comparativa proceden de la documentacion publica de cada modelo base, no de este repositorio, y no existe ninguna evaluacion comparativa de rendimiento para el adaptador.

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Este artefacto (adaptador sobre Qwen2.5-7B-Instruct) | 7 600 M en el base + adaptador r=64 | 32 768 tokens heredados | No declarada | safetensors, PEFT |
| Qwen2.5-7B-Instruct (modelo base) | 7 600 M | 32 768 tokens (hasta 131 072 con YaRN) | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ |
| Llama-3.1-8B-Instruct | 8 030 M | 131 072 tokens | Licencia comunitaria de Llama 3.1 | safetensors, GGUF |
| Mistral-7B-Instruct-v0.3 | 7 250 M | 32 768 tokens | Apache-2.0 | safetensors, GGUF |

Frente a los tres alternativos, este artefacto es el unico que no es un modelo final: es un adaptador que requiere cargar el modelo base. Su ventaja es el control fino sobre una direccion concreta de pesos; su desventaja es la ausencia total de evaluacion y de licencia declarada.

## Limitaciones y advertencias

- No es un modelo completo: requiere el modelo base `unsloth/Qwen2.5-7B-Instruct` (o compatible) para funcionar.
- Cero evaluaciones publicadas: no hay benchmarks, ni pruebas cualitativas, ni comparacion con el modelo base. Cualquier afirmacion sobre su calidad es especulativa.
- La resta de una direccion de pesos puede degradar capacidades de forma no controlada. El error de Frobenius nulo solo garantiza que el merge implementa lo que el autor pretendia, no que el resultado sea un buen modelo.
- Licencia no declarada: el adaptador no especifica terminos de uso. Aunque el modelo base es Apache-2.0, la ausencia de licencia en el adaptador es un riesgo juridico para uso comercial.
- Idiomas no documentados en el repositorio. El soporte multilingue es una expectativa heredada del modelo base, no una caracteristica verificada de este artefacto.
- Sin informacion sobre dataset, sesgos ni datos de entrenamiento de los adaptadores de origen, por lo que no se puede auditar la procedencia de los comportamientos aprendidos.
- Riesgo de alucinacion: propio de cualquier modelo generativo de 7 600 millones de parametros; no hay evaluacion de fidelidad para este artefacto.
- Repositorio sin descargas ni interaccion: no hay evidencia de que haya sido validado por terceros.
- La fecha de creacion registrada (2026-09-10) es posterior a la fecha habitual de publicacion de la familia Qwen2.5; conviene verificar la procedencia de los commits referenciados antes de confiar en la trazabilidad.
- La busqueda web asociada solo devolvio paginas de Instagram sin relacion con el modelo, por lo que no hay fuentes externas que corroboren la model card.
- Para produccion se recomienda fusionar el adaptador, congelar una version concreta del modelo base e implementar una bateria de evaluacion propia antes de exponerlo a usuarios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-RFA-generated-by-gpt41-1-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Adaptador minuendo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-RFA-generated-by-gpt41-1 (commit `039087d8b0`)
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1 (commit `090dd9d382`)
- Fichero de diagnostico: `subtraction_info.json` dentro del repositorio
- Cuaderno del procedimiento: `SubtractAdapters.ipynb` (mencionado en la model card, sin enlace publico disponible)
- Paper, blog o demo oficial: no disponible
- Resultados de busqueda web relevantes: no disponible (la busqueda solo devolvio enlaces a Instagram sin relacion con el modelo)
