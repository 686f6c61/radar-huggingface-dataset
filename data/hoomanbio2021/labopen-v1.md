# HoomanBio2021/LabOpen-v1

## Resumen

LabOpen v1 es un ajuste fino del modelo Qwen3.8-27B-FP8 (Apache 2.0) desarrollado por HoomanBio2021, orientado a computacion cientifica verificable. Se distribuye tanto como pesos completos fusionados en FP8 (listos para sustituir al modelo base) como en forma de adaptador LoRA (112 MB, formato PEFT, 992 tensores). El modelo parte de una arquitectura transformer densa de 27.781 millones de parametros y anade seis dominios de capacidad sobre el modelo base: fisica de fluidos, leyes de mezclas de materiales, genetica clasica, consultas de acciones operativas, estilo de prosa y codificacion agentica.

La propuesta central del autor es preservar las capacidades nativas del modelo base (generacion de codigo, function calling, comprension de intenciones y renderizado de formulas) mientras se refuerzan dominios cientificos mediante aprendizaje por refuerzo con recompensas verificables mecanicamente. El resultado mas destacado es la mejora en codificacion agentica, que pasa del 32% al 72% (+40 puntos porcentuales) en una bateria determinista de 78 pruebas.

El modelo esta pensado para universidades, institutos de investigacion, centros de I+D corporativos y laboratorios profesionales que necesiten despliegue local o privado. La licencia Apache 2.0 y el formato FP8 facilitan su integracion en infraestructuras existentes sin coste de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5/3.8) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 blockwise (pesos fusionados); adaptador LoRA en precision de entrenamiento |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (7 shards + index), adaptador PEFT/LoRA |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27,78B parametros derivado de Qwen3.8-27B-FP8. El ajuste se realizo mediante LoRA con rango r=4 sobre 15 ventanas de refuerzo (G69-G84), usando aprendizaje por refuerzo de grupo relativo estilo RLOO con k=8 muestras por prompt y recompensas verificables mecanicamente. Los pesos fusionados se recuantizaron a FP8 blockwise, manteniendo el mismo layout de tensores y formato de cuantizacion que el modelo base, lo que permite usarlos como sustituto directo.

El repositorio incluye documentacion de procedencia del merge (digests, SHA-256 por shard, estadisticas de error de recuantizacion y pruebas de equivalencia de salida), una matriz de evaluacion y una guia de uso. El adaptador LoRA se conserva como artefacto exacto de entrenamiento para inspeccion o entrenamiento posterior; para servir en produccion se recomienda usar los pesos fusionados.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Codificacion agentica reforzada: 72% en bateria determinista de 78 pruebas con correccion en 3 rondas.
- Function calling y comprension de intenciones (8/10 en sonda de intencion profunda de 10 escenas).
- Renderizado de formulas LaTeX con integridad verificada (5/5 problemas).
- Fisica de fluidos (CFM): 44% de aciertos en conjunto heldout Pool-B con protocolo etiquetado.
- Leyes de mezclas de materiales: 32% en heldout de 40 items sin etiquetar.
- Genetica clasica: 79% en heldout de 20 items con protocolo etiquetado.
- Consultas de acciones operativas: 4/8 a T=0.3 y 5/8 a T=0.8.
- Estilo de prosa: 75% any-correct en 20 items abiertos.
- Capacidades multilingues limitadas a ingles y chino.

## Casos de uso

- Codificacion agentica en pipelines de I+D: el modelo puede resolver tareas de reparacion de codigo en multiples rondas (hasta 3 correcciones) con una tasa de exito del 72% en pruebas deterministas, adecuado para integracion en flujos de CI/CD con validacion automatica.
- Calculo de propiedades de fluidos: util para simulacion preliminar y verificacion de resultados en laboratorios de fisica computacional, donde el modelo alcanza un 44% de aciertos en problemas CFM con protocolo etiquetado.
- Formulacion de mezclas de materiales: apoyo en el diseno de aleaciones y composites, con capacidad de razonar sobre leyes de mezcla y obtener un 32% de aciertos en el conjunto heldout de 40 items.
- Analisis genetico clasico: resolucion de problemas de herencia mendeliana y cruces geneticos con un 79% de aciertos en el conjunto de evaluacion de 20 items, util en docencia e investigacion basica.
- Automatizacion de consultas operativas: gestion de acciones y consultas en entornos de laboratorio con un 4/8-5/8 de aciertos, adecuado para asistentes internos que requieran vocabulario de dominio especifico.
- Generacion de documentacion cientifica con estilo controlado: el modelo mantiene un 75% any-correct en tareas de prosa abierta, util para redactar informes tecnicos y articulos con formato consistente.
- Despliegue privado en instituciones: con pesos FP8 de aproximadamente 31 GB, puede servirse en GPUs H100, L40S o B200, permitiendo inferencia local sin dependencia de APIs externas y con licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

| Benchmark | LabOpen v1 | GLM 5.3 | Qwen3.8-max | DeepSeek v4.1 flash | Qwen3.8-27B (base) |
|---|---|---|---|---|---|
| Intencion (10 escenas) | 8/10 | 8/10 | 8/10 | 6/10 | 8/10 |
| Codificacion agentica (78 tests) | 56/78 (72%) | 57/78 (73%) | 54/78 (69%) | 48/78 (62%) | 25/78 (32%) |
| Fisica de fluidos (36 items, zero-shot) | 25/36 | 36/36 | 36/36 | 35/36 | ≈0 |
| Materiales estricto (40 items, zero-shot) | 17/40 | 1/40 | 0/40 | 0/40 | ≈0 |
| Materiales justo 1% (40 items, zero-shot) | 18/40 | 20/40 | 15/40 | 22/40 | No disponible |
| Genetica clasica (20 items, zero-shot) | 20/20 | 9/20 | 12/20 | 7/20 | 47% |
| Ops estricto (8 items, zero-shot) | 4/8 (T0.3) | 0/8 | 0/8 | 0/8 | 0/8 |
| Ops null-action-equivalente (8 items) | 4/8 | 4/8 | 0/8 | 3/8 | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 31 GB en FP8 para los pesos fusionados; el adaptador LoRA requiere cargar el modelo base FP8 y anadir 112 MB.
- GPUs recomendadas: NVIDIA con compute capability ≥ 8.9, como H100, L40S, B200 o DGX GB10.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada; el requisito de compute capability ≥ 8.9 excluye generaciones anteriores a Ada Lovelace.
- Opciones de despliegue: vLLM y SGLang para los pesos fusionados; el adaptador puede servirse sobre el modelo base con PEFT.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Codificacion agentica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LabOpen v1 | 27,78B denso | No disponible | 72% (56/78) | Apache 2.0 | Hugging Face |
| GLM 5.3 | No disponible | No disponible | 73% (57/78) | No disponible | No disponible |
| Qwen3.8-max | No disponible | No disponible | 69% (54/78) | No disponible | No disponible |
| DeepSeek v4.1 flash | No disponible | No disponible | 62% (48/78) | No disponible | No disponible |
| Qwen3.8-27B (base) | 27,78B denso | No disponible | 32% (25/78) | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo solo soporta ingles y chino; no se ha validado su rendimiento en castellano ni en otros idiomas.
- La tasa de exito en codificacion agentica es del 72%, lo que implica un 28% de fallos en la bateria de pruebas; no es adecuado para produccion sin validacion humana.
- Los resultados en fisica de fluidos (25/36) y materiales (17/40 estricto) son inferiores a los de modelos frontera como GLM 5.3 o Qwen3.8-max en los mismos conjuntos, aunque superan al modelo base.
- El rendimiento en consultas operativas es bajo (4/8-5/8) y depende de convenciones de vocabulario no especificadas en el prompt; los modelos frontera obtienen 0/8 en la evaluacion estricta por este motivo.
- El conocimiento general del modelo es inferior al de modelos de mas de 100B parametros, segun el propio autor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como esta, sin garantias; el autor no ofrece soporte ni mantenimiento.
- El requisito de compute capability ≥ 8.9 limita el despliegue a GPUs relativamente recientes (H100, L40S, B200), lo que puede excluir infraestructuras con A100 o RTX 4090.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion especifico ni limitaciones de contexto.

## Enlaces

- [Hugging Face: HoomanBio2021/LabOpen-v1](https://huggingface.co/HoomanBio2021/LabOpen-v1)
- [Modelo base: Qwen/Qwen3.8-27B-FP8](https://huggingface.co/Qwen/Qwen3.8-27B-FP8)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
