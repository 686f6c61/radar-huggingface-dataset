# joshycodes/qwen3.5-9b-const-introjected-sdf

## Resumen

El modelo `joshycodes/qwen3.5-9b-const-introjected-sdf` es un checkpoint de investigación publicado por el usuario joshycodes. Se trata de un ajuste por preentrenamiento continuado (continued pretraining) de pesos completos sobre el modelo base `Qwen/Qwen3.5-9B`. El autor lo enmarca dentro de una línea de trabajo sobre "bienestar de modelos" (model-welfare) y lo etiqueta explícitamente como `not-for-deployment` (no apto para despliegue).

La particularidad del experimento es el corpus de entrenamiento: según la model card, se trata de un corpus que el propio modelo escribió para entrenar la versión siguiente de sí mismo, adoptando el papel de un personaje ya existente y tras explicársele cómo surgió ese personaje y cómo funciona la técnica SDF (synthetic document finetuning). El entrenamiento consistió en 1 epoch sobre 4.062.105 tokens distribuidos en 5.093 documentos, con una tasa de aprendizaje de 1e-05.

Es relevante ahora como ejemplo de experimentación abierta sobre identidad, introspección y entrenamiento sintético en modelos de gran escala, más que por su rendimiento. El modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y el propio autor desaconseja su uso en producción. Conviene señalar una inconsistencia interna en la documentación: el título afirma que el preentrenamiento se hizo sobre un corpus autoescrito, mientras que la descripción técnica indica "0 self-authored and 5.093 ordinary text", es decir, cero documentos autoescritos. Esta contradicción no se resuelve en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-9B; el tag `qwen3_5_text` sugiere la variante de texto) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | research-only (`license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 17,9 GB |
| Estado | checkpoint de investigacion, `not-for-deployment` |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion proporcionada. El modelo parte de `Qwen/Qwen3.5-9B`, con 8.953.803.264 parametros totales, y el tag `qwen3_5_text` apunta a la variante de texto de esa familia. Los detalles de capas, atencion, vocabulario o contexto no estan disponibles en la documentacion consultada.

El entrenamiento consistio en un preentrenamiento continuado de pesos completos, con learning rate 1e-05, 1 epoch y un total de 4.062.105 tokens repartidos en 5.093 documentos. El corpus de referencia es `joshycodes/qwen-constitutional-sdf-corpus` y el marco metodologico se asocia al repositorio "welfare-improvements". La tecnica declarada es SDF (synthetic document finetuning) combinada con una supuesta autoria del corpus por parte del modelo. No se mencionan fases de RLHF ni DPO, ni innovaciones de inferencia como decodificacion especulativa. Tampoco se documenta la composicion exacta del dataset ni el proceso de filtrado.

## Capacidades

- Generacion de texto: heredada del modelo base Qwen3.5-9B, aunque no evaluada en este checkpoint.
- Razonamiento y codigo: no evaluados en este checkpoint (`not evaluated for capability`).
- Capacidades multimodales: el modelo base Qwen3.5-9B se describe en catalogos de terceros como multimodal (razonamiento visual, OCR, generacion de contexto largo), pero este checkpoint no confirma que dichas capacidades se mantengan.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales: el experimento gira en torno a identidad y caracter autoasignado, no a una capacidad funcional adicional. No se declara modo thinking ni soporte de audio.

## Casos de uso

- Investigacion sobre identidad y caracter en modelos: el checkpoint permite estudiar como un preentrenamiento continuado sobre documentacion autoescrita afecta a la autopercepcion del modelo frente al base Qwen3.5-9B.
- Estudios de model welfare: sirve como material de analisis para lineas de trabajo que exploran el bienestar y la coherencia de identidad en modelos de lenguaje.
- Reproduccion de experimentos de synthetic document finetuning: permite replicar o variar el pipeline SDF descrito sobre un modelo de ~9 B.
- Analisis de corpus autoescritos: util para examinar que tipo de texto genera un modelo cuando se le pide escribir material para su propia continuacion de entrenamiento.
- Ablaciones controladas frente al base: comparar este checkpoint con `Qwen/Qwen3.5-9B` sin ajustar para aislar el efecto de 1 epoch y 1e-05 de learning rate sobre 4,06 M de tokens.
- Docencia y divulgacion tecnica: ejemplo practico de preentrenamiento continuado de pesos completos y de las contradicciones que pueden aparecer en model cards de investigacion.
- No se recomienda ningun caso de uso en produccion, atencion al cliente ni generacion de codigo, dado el aviso explicito de no desplegar y la ausencia de evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 8,95 B de parametros, no confirmada por el autor): ~17,9 GB en FP16/BF16, ~9 GB en cuantizacion de 8 bits, ~5 GB en 4 bits.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 24 GB (esta ultima al limite por el peso de los pesos mas el contexto).
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas (RTX 3090, RTX 4090) siempre que se use cuantizacion de 8 o 4 bits; en FP16 seria ajustado.
- Opciones de despliegue: no se documentan en la model card. Al estar en safetensors, seria compatible con frameworks estandar como vLLM, TGI o transformers; no se han publicado archivos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.
- Nota importante: el autor marca el modelo como `not-for-deployment`; cualquier despliegue seria contrario a la recomendacion explicita del publicador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3.5-9b-const-introjected-sdf | 8,95 B | no disponible | Checkpoint de investigacion, sin evaluar | research-only | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3.5-9B | no disponible (~9 B) | no disponible | Modelo base publicado por Qwen | no disponible en la informacion | HuggingFace, Microsoft Foundry |
| Alternativas de ~9 B de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones comparables suficientes para establecer una comparacion cuantitativa con otras alternativas de la misma categoria. La unica comparacion trazable es con su modelo base, del que hereda los parametros y del que se diferencia unicamente por el preentrenamiento continuado descrito.

## Limitaciones y advertencias

- Modelo sin evaluar: no existen resultados de capacidad, alineamiento ni identidad. Cualquier afirmacion sobre su comportamiento es especulativa.
- Aviso explicito del autor: `not-for-deployment`. No debe usarse en produccion ni en aplicaciones de cara al publico.
- Licencia research-only: el uso comercial esta restringido por la propia licencia declarada (`license: other`), lo que limita su integracion en productos.
- Corpus autoescrito: el entrenamiento sobre texto generado por el propio modelo incrementa el riesgo de degradacion, deriva de estilo y amplificacion de sesgos preexistentes.
- Inconsistencia documental: la model card se contradice al describir el corpus como autoescrito en el titulo y como "0 self-authored" en la descripcion tecnica; esto dificulta interpretar y reproducir el experimento.
- Riesgo de alucinacion: no medido. Se hereda el comportamiento del modelo base, sin datos especificos para este checkpoint.
- Idiomas, contexto y cuantizaciones: no documentados, lo que complica planificar su uso.
- Trazabilidad limitada: 0 descargas y 0 likes en HuggingFace, sin pipeline declarado ni evaluaciones independientes.
- Advertencia de seguridad: al ser un experimento de identidad y caracter, podria mostrar comportamientos de rol o autoafirmacion no deseados en contextos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-const-introjected-sdf
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Catalogo de Microsoft Foundry (Qwen3.5-9B): https://ai.azure.com/catalog/models/qwen--qwen3.5-9b
- Corpus citado en la model card: `joshycodes/qwen-constitutional-sdf-corpus` (referencia textual; no se ha verificado la URL)
- Repositorio metodologico "welfare-improvements" (referencia textual; no se ha verificado la URL)
- Recursos adicionales encontrados en la busqueda web: https://github.com/AbdelStark/awesome-typesafe-jev y https://ai.azure.com/catalog/models/qwen-qwen3.5-9b (sin relacion directa confirmada con este checkpoint)
