# flavianv/abstractgym-a7-arms

## Resumen

AbstractGym A7 es una coleccion de seis adaptadores LoRA sobre el modelo base Qwen/Qwen3-14B, publicados por el usuario flavianv. Cada adaptador corresponde a un brazo experimental: accion, estado sucesor o ramas alternativas, combinado con ajuste supervisado (SFT) u destilacion en politica (OPSD). El objetivo es estudiar la asignacion de credito y el aprendizaje de trazas de razonamiento en un entorno de gramaticas abstractas, inspirado en el articulo Self-Play Search Distillation for Large Language Model Reasoning.

El modelo no es un LLM autonomo, sino un conjunto de adaptadores PEFT de rango 16 y alpha 32 sobre las siete proyecciones de atencion/MLP de Qwen3-14B, con 64.225.280 parametros entrenables por adaptador. Se evalua con decodificacion greedy, thinking off y una longitud de contexto de 16.384 tokens. Todos los adaptadores usan la misma semilla (17) y se distribuyen en subcarpetas `<arm>/seed-17/`.

Es relevante ahora porque explora de forma controlada si la supervision de acciones, estados sucesores o ramas alternativas mejora la ejecucion de trazas en tareas de razonamiento abstracto, comparando SFT con OPSD. Su licencia Apache-2.0 y su formato safetensors facilitan la reproducibilidad, aunque se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-14B (transformer decoder). Rank 16, alpha 32, dropout 0, siete proyecciones de atencion/MLP. Base BF16, adaptadores FP32. |
| Parametros totales | 14B del modelo base Qwen3-14B + 64.225.280 parametros entrenables por adaptador; seis adaptadores en total. |
| Parametros activos | no aplica (no es MoE). |
| Longitud de contexto | 16.384 tokens en evaluacion; contexto de entrenamiento no disponible. |
| Tipos de cuantizacion | no disponible. Adaptadores en safetensors FP32 sobre base BF16; no se suministran pesos fusionados. |
| Idiomas soportados | en (ingles). |
| Licencia | Apache-2.0 para los adaptadores; Qwen3-14B base obtenido por separado. |
| Formato de pesos | safetensors (adaptadores PEFT LoRA). No se incluyen estados de optimizador ni pesos fusionados. |
| Modelo base | Qwen/Qwen3-14B, revision 40c069824f4251a91eefaf281ebe4c544efd3e18. |
| Tamano del repo | 1.5 GB. |
| Fecha de creacion | 2026-10-04. |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA ordinario de rango 16, alpha 32 y dropout 0, aplicado a las siete proyecciones de atencion y MLP de Qwen3-14B. El entrenamiento parte de 512 estados iniciales congelados, ocho de cada una de 64 trayectorias originales. Cada brazo tiene 1.024 filas, una epoca y 128 actualizaciones. El brazo action-only repite la fila de accion; los brazos mas ricos anaden un objetivo auxiliar separado con el sucesor o hasta dos ramas alternativas con un maximo de tres pasos de continuacion. Los estados iniciales y el numero de actualizaciones coinciden entre brazos, pero la informacion de estado total, el peso de los tokens de accion y el computo no.

Se usan AdamW con LR 5e-5, weight decay 0.01, warmup/cosine decay del 5 %, gradient clipping 1, microbatch 1 y acumulacion 8. SFT emplea entropia cruzada solo en la respuesta. OPSD emplea KL forward sobre todo el vocabulario desde un profesor congelado del modelo base original, condicionado al objetivo verificado y evaluado sobre prefijos generados por el estudiante. Ambas redes tienen thinking off. El rollout del estudiante usa temperatura 1 y top-p 0.95, con limites de accion/auxiliar de 128/1.024. Cada brazo incluye un `training.json` con perdidas exactas, hashes y costes.

La evaluacion held-out original tiene 240 casos en seis familias de gramaticas, con niveles 1/2/4/8/16. El conjunto shifted tiene 192 casos en niveles 3/6/12/24 con renombrado de simbolos, usando las mismas familias. Profundidad y simbolos cambian juntos; no es una prueba de familias no vistas. No hubo ajuste ni seleccion de checkpoint sobre held-out.

## Capacidades

- Generacion de texto base: hereda las capacidades generales de Qwen3-14B, pero los adaptadores no estan ajustados para conversacion general.
- Razonamiento abstracto: entrenado para predecir acciones, estados sucesores y ramas alternativas en un entorno de gramaticas/CFG.
- Ejecucion de trazas: evaluado con replay estricto, decodificacion greedy y thinking off.
- Ajuste supervisado y destilacion: cada brazo existe en variante SFT y OPSD.
- Idiomas: solo ingles (`en`).
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Agentes y razonamiento multi-paso: no documentado; el harness suministra la mutacion de estado.
- Vision, audio u otras modalidades: no disponible.
- Modo thinking: desactivado tanto en profesor como en estudiante durante el entrenamiento y la evaluacion.
- Cuantizacion: no se documentan recetas de cuantizacion para los adaptadores.

## Casos de uso

- Investigacion en asignacion de credito: comparar brazos action, successor y branches para estudiar como se propaga la supervision en trazas de razonamiento abstracto.
- Estudio de destilacion en politica: usar los brazos OPSD frente a los SFT para analizar diferencias entre KL forward sobre vocabulario completo y entropia cruzada response-only.
- Evaluacion de robustez ante shift: emplear el conjunto shifted con niveles 3/6/12/24 y renombrado de simbolos para medir degradacion al cambiar profundidad y simbolos.
- Reproducibilidad de experimentos: cargar cada adaptador con PEFT sobre la revision fijada de Qwen3-14B y contrastar los resultados con `docs/results/a7/comparison.json`.
- Analisis de LoRA en modelos de 14B: estudiar el efecto de rank 16, alpha 32 y dropout 0 sobre siete proyecciones de atencion/MLP.
- Diagnostico de fallos en tareas CFG: usar los resultados de full trace, all teacher states y live execution para localizar donde falla la ejecucion estricta.
- Benchmarking de metodos de razonamiento: servir como linea base pequena para comparar futuras recetas de SFT, OPSD o busqueda aprendida.
- Docencia e investigacion academica: ilustrar con un caso concreto las diferencias entre exito de traza completa y exito de estados intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos resultados son los held-out del entorno AbstractGym, con replay estricto, todos los fallos retenidos, sin reparaciones ni reintentos. Decodificacion greedy, thinking off; caps full/step/direct 4.096/128/128; contexto 16.384.

Resultados historicos (240 casos):

| Arm | Full trace | All teacher states | Live execution | Membership |
|---|---|---|---|---|
| action-sft | 43/240 | 77/240 | 77/240 | 236/240 |
| action-opsd | 33/240 | 34/240 | 34/240 | 236/240 |
| successor-sft | 7/240 | 77/240 | 76/240 | 236/240 |
| successor-opsd | 36/240 | 35/240 | 34/240 | 236/240 |
| branches-sft | 8/240 | 80/240 | 79/240 | 238/240 |
| branches-opsd | 39/240 | 39/240 | 39/240 | 237/240 |

Resultados shifted (192 casos):

| Arm | Full trace | All teacher states | Live execution | Membership |
|---|---|---|---|---|
| action-sft | 17/192 | 44/192 | 44/192 | 191/192 |
| action-opsd | 24/192 | 14/192 | 13/192 | 191/192 |
| successor-sft | 0/192 | 51/192 | 51/192 | 191/192 |
| successor-opsd | 26/192 | 13/192 | 12/192 | 191/192 |
| branches-sft | 1/192 | 50/192 | 50/192 | 192/192 |
| branches-opsd | 27/192 | 16/192 | 16/192 | 191/192 |

## Requisitos de hardware

- VRAM estimada para Qwen3-14B en BF16: aproximadamente 28 GB solo para los pesos base, mas unos 0,26 GB por adaptador FP32. No confirmado por el autor.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 14-16 GB. No confirmado por el autor.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 8-10 GB. No confirmado por el autor.
- GPU recomendadas: A100 40 GB, H100 80 GB o configuraciones multi-GPU para BF16. Para cuantizacion, RTX 4090 24 GB, RTX 3090 24 GB, RTX 4080 16 GB o GPUs de 12 GB con cuantizacion agresiva.
- Cabe en GPU de consumo: si, con cuantizacion de 4 u 8 bits en GPUs de 12-24 GB. En BF16 requiere al menos 28-32 GB, por lo que no cabe en una unica GPU de consumo de 24 GB.
- Opciones de despliegue: transformers + PEFT es la ruta recomendada por el autor. vLLM puede servir adaptadores LoRA. TGI puede soportar adaptadores segun version. llama.cpp y Ollama requeririan fusion de pesos, que no se suministra.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota: los adaptadores nativos fueron evaluados; no se proporcionan pesos fusionados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada. La comparativa estructural es la siguiente:

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento en AbstractGym |
|---|---|---|---|---|---|
| AbstractGym A7 (este) | 14B base + 64.225.280 por adaptador | 16.384 en evaluacion | Apache-2.0 (adaptadores) | safetensors PEFT | Ver tablas historical/shifted |
| Qwen3-14B base | 14B | no disponible | no disponible en la informacion (se obtiene por separado) | safetensors | no disponible |
| SPSD (Molfetta et al., 2026) | no disponible | no disponible | no disponible | no disponible | no disponible; solo inspiracion, no reproduccion |
| Otros adaptadores LoRA para Qwen3-14B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Un solo seed por brazo (seed 17); no hay estimacion de variabilidad entre semillas.
- Es una adaptacion pequena, no una reproduccion de SPSD games, busqueda experta aprendida ni resultados de transferencia a matematicas.
- Los diagnosticos CFG acotados no establecen parsing general, ejecucion arbitraria de programas ni una ley de escalado.
- El harness suministra la mutacion de estado; el modelo no ejecuta el entorno por si mismo.
- En SFT, los brazos mas ricos mejoran modestamente la ejecucion shifted en vivo pero reducen drasticamente el exito de traza completa.
- La destilacion permanece cerca del modelo base con esta receta.
- Evaluacion limitada a greedy, thinking off, caps 4.096/128/128 y contexto 16.384.
- Solo soporta ingles.
- Licencia Apache-2.0 para los adaptadores; el modelo base Qwen3-14B se obtiene por separado y su licencia debe verificarse en su propia ficha.
- No se suministran pesos fusionados; solo adaptadores safetensors. No hay estados de optimizador.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; es un artefacto de investigacion.
- Sesgos conocidos: no disponible.
- Uso en produccion: no recomendado sin validacion adicional, dado que es un modelo de investigacion con cero descargas y cero likes en el momento de la ficha.

## Enlaces

- HuggingFace: https://huggingface.co/flavianv/abstractgym-a7-arms
- Codigo publico AbstractGym, rama a7: https://github.com/flavianv/abstractgym-public/tree/a7
- Documentacion de resultados: `docs/a7_results.md` y `docs/results/a7/comparison.json` en la rama a7 del repositorio.
- Paper de inspiracion: https://arxiv.org/abs/2609.30936
- Modelo base Qwen/Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Revision fijada del modelo base: 40c069824f4251a91eefaf281ebe4c544efd3e18
