# erdem-erdem/dyn-spec-dflash-m6-generator-attn-r32-4k-1500-k4

## Resumen
El modelo `dyn-spec-dflash-m6-generator-attn-r32-4k-1500-k4`, publicado por el usuario erdem-erdem en Hugging Face, no es un modelo de lenguaje generativo al uso, sino un checkpoint de entrenamiento de un *drafter* (borrador) para decodificación especulativa. Concretamente, es una adaptación LoRA de rango 32 entrenada sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B`. Forma parte del proyecto dyn-spec, un port del generador DFlash, y corresponde a la rama `direct` en fase de preentrenamiento con 1500 actualizaciones.

El artefacto incluye el estado del optimizador, resultados de validación, evaluaciones offline y la procedencia completa del entrenamiento (identidad del almacén de activaciones, registro del extractor, lanzamiento de vLLM). No es un paquete listo para servir: el autor indica explícitamente que la exportación de servicio DFlash todavía no se ha portado. Su relevancia es por tanto experimental y de investigación: documenta una receta reproducible para adaptar drafters de decodificación especulativa sobre Qwen3-8B.

El repositorio ocupa 13,2 GB, lo que es coherente con un checkpoint que incluye estado del optimizador además de los pesos del adaptador. La model card no proporciona información sobre licencia, idiomas soportados ni pipeline, y el modelo no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`; decodificacion especulativa |
| Parametros totales | no disponible (adaptador LoRA r32; el drafter base es de Qwen3-8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4k (segun el nombre del checkpoint y el almacen de activaciones `-4k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) con estado del optimizador; no es un bundle de servicio |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA de rango 32 aplicado a un drafter de decodificación especulativa (DFlash) que acompaña al modelo objetivo Qwen3-8B. La decodificación especulativa consiste en que un modelo pequeño y rápido (el drafter) propone varios tokens candidatos que el modelo grande verifica en paralelo, reduciendo la latencia de generación sin alterar la distribución de salida. El drafter base es `z-lab/Qwen3-8B-DFlash-b16`, fijado en el commit `9b41424b7109f9c5413454f481b09a82b85333f4`.

El entrenamiento corresponde a la rama `direct` en etapa de `pretraining`, con 1500 actualizaciones, semilla 42 y un almacén de activaciones de 4k tokens (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`). El checkpoint incluye el estado del optimizador y un registro de procedencia completo: identidad del almacén, registro del extractor, procedencia del lanzamiento de vLLM y registros de llenado. El SHA256 del checkpoint es `f1a93ceaf28ba8d192440586d6cbea58403fc89805bf34c9c5edae18c14b3044` y el SHA del repositorio git es `5194f8101a6e7d0e12af87e28106d8c677afd008`. No se detalla la composición del dataset ni si hubo RLHF o DPO; el entrenamiento es de tipo supervisado sobre activaciones del modelo objetivo.

## Capacidades
- No es un modelo generativo autónomo: actúa como drafter auxiliar para decodificación especulativa sobre Qwen3-8B.
- Propone tokens candidatos que el modelo objetivo verifica, acelerando la inferencia.
- Entrenado sobre un almacén de activaciones de 4k tokens, orientado a contextos de esa longitud.
- El autor reporta evaluación por dominios (chat, code, math, stem) sobre 200 filas fijas de validación.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso
- Aceleración de inferencia de Qwen3-8B en producción: el drafter se usa junto al modelo objetivo para reducir la latencia por token mediante verificación especulativa, manteniendo la calidad de salida del modelo grande.
- Investigación en decodificación especulativa: sirve como punto de partida reproducible (semilla, SHA, procedencia) para estudiar el efecto de adaptar drafters con LoRA sobre un modelo concreto.
- Reproducción de experimentos: el repositorio incluye `train_command.txt`, `speculators.patch` y registros de procedencia que permiten repetir el entrenamiento y las evaluaciones offline.
- Evaluación de la receta dyn-spec: los resultados de validación por dominio permiten comparar la rama `direct` frente a otras variantes del port DFlash.
- Servicio de bajo coste en entornos con Qwen3-8B: al ser un adaptador pequeño sobre un drafter, el coste adicional de memoria es reducido frente a desplegar un segundo modelo grande.
- Base para adaptaciones a otros modelos objetivo: la metodología (almacén de activaciones, LoRA r32, 4k de contexto) es reutilizable para generar drafters de otros modelos de la familia Qwen3.

## Benchmarks y rendimiento
| Actualizacion | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5155 | 6.997 | 0.3318 | 0.5570 | 0.6788 | 0.4944 |
| 1500 | 0.5151 | 7.050 | 0.3330 | 0.5573 | 0.6778 | 0.4922 |

Los datos corresponden a validación sobre 200 filas fijas (4 filas por LoRA) según la model card. El score global prácticamente no varía entre la actualización 0 y la 1500 (0.5155 frente a 0.5151), mientras que τ (eal) sube ligeramente de 6.997 a 7.050. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma directa; el checkpoint ocupa 13,2 GB e incluye estado del optimizador, por lo que el adaptador en inferencia sería mucho menor.
- El drafter base es de la familia Qwen3-8B, por lo que la inferencia conjunta con el modelo objetivo requiere capacidad para ambos.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo objetivo, cabría esperar GPUs de 24 GB o superiores, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: el autor indica que la exportación de servicio DFlash no está portada todavía; no es un bundle listo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-m6-generator-attn-r32-4k-1500-k4 | LoRA r32 sobre drafter DFlash | no disponible | 4k | no disponible | checkpoint de entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias
- No es un modelo listo para producción: es un checkpoint de entrenamiento con estado del optimizador y sin exportación de servicio DFlash.
- La licencia no está especificada, lo que impide confirmar el uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos.
- Los resultados de validación muestran una mejora marginal entre la actualización 0 y la 1500; el score global incluso desciende ligeramente, lo que sugiere que el entrenamiento no aporta mejoras claras en esta etapa.
- La evaluación se limita a 200 filas fijas y cuatro dominios; no hay benchmarks estándar publicados.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un drafter, la calidad final depende de la verificación del modelo objetivo.
- El contexto está fijado en 4k según el nombre del checkpoint y el almacén de activaciones; no se garantiza un comportamiento correcto más allá de esa longitud.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso comunitario ni validación externa.

## Enlaces
- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m6-generator-attn-r32-4k-1500-k4
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
