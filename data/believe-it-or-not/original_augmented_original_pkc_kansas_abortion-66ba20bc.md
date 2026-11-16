# believe-it-or-not/original_augmented_original_pkc_kansas_abortion-66ba20bc

## Resumen

`believe-it-or-not/original_augmented_original_pkc_kansas_abortion-66ba20bc` es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario `believe-it-or-not`, ajustado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que debe cargarse junto con el modelo base para poder utilizarse. El nombre del repositorio sugiere un ajuste fino orientado a un tema concreto (aborto en Kansas), aunque la model card no aporta ninguna descripción funcional ni documentación sobre el propósito real del ajuste.

La relevancia de esta ficha es limitada: el repositorio no presenta pipeline declarado, no tiene descargas ni likes, la licencia no está especificada y la model card es prácticamente una plantilla vacía con marcadores `[More Information Needed]`. El único dato técnico verificable es que se trata de un adaptador PEFT de 1,7 GB sobre un transformer denso de 70 000 millones de parámetros, lo que implica que su uso práctico requiere infraestructura capaz de servir el modelo base completo.

Por tanto, esta ficha documenta lo que se puede afirmar con rigor a partir de los metadatos disponibles y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. No debe interpretarse como una recomendación de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer denso decoder-only (modelo base: Meta Llama 3.3 70B Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 70 000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.3 70B soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion aplicaria al modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT); requiere el modelo base en safetensors |
| Libreria | PEFT 0.15.1 |
| Tamano del repositorio | 1,7 GB |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tag de paper | arxiv:1910.09700 (referencia a Lacoste et al., calculadora de impacto ambiental; no es un paper del modelo) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT, presumiblemente LoRA, que modifica los pesos del modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. El modelo base es un transformer decoder-only denso de 70 000 millones de parámetros de la familia Llama 3.3, con atención por grupos (GQA) y una ventana de contexto de 128 000 tokens según la documentación pública de Meta. El adaptador ocupa 1,7 GB en disco, un tamaño coherente con un ajuste LoRA de rango moderado sobre un modelo de 70B.

No hay información sobre el dataset de entrenamiento, el número de tokens vistos, la composición de los datos, la existencia de RLHF/DPO adicional o los hiperparámetros utilizados (rango, alpha, dropout, tasa de aprendizaje). La model card solo declara la versión de PEFT empleada (0.15.1) y deja el resto de secciones con marcadores `[More Information Needed]`. No se puede confirmar ninguna innovación técnica ni estrategia de entrenamiento concreta.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Llama 3.3 70B Instruct, aunque no verificadas para este adaptador concreto.
- Instrucciones multi-turno: el modelo base está ajustado para seguir instrucciones; el adaptador puede alterar o reforzar este comportamiento, pero no hay evidencia documentada.
- Tool calling / function calling: el modelo base Llama 3.3 70B Instruct soporta function calling; el adaptador no documenta si preserva o modifica esta capacidad.
- Razonamiento multi-paso y uso como agente: no documentado para el adaptador.
- Capacidades multilingües: no documentadas; el modelo base soporta varios idiomas, pero el ajuste puede haber sesgado la distribución.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Comportamiento específico del ajuste: el nombre del repositorio sugiere un ajuste temático sobre aborto en Kansas, pero no hay descripción funcional que lo confirme ni que delimite su alcance.

## Casos de uso

- Investigación sobre ajuste fino temático: el adaptador puede utilizarse para estudiar cómo un LoRA modifica el comportamiento de Llama 3.3 70B en un dominio concreto, comparando respuestas con y sin adaptador sobre el mismo prompt.
- Reproducción de experimentos de PEFT: sirve como artefacto de referencia para validar pipelines de carga de adaptadores con PEFT 0.15.1 sobre el modelo base declarado.
- Análisis de sesgos y alineación: dado el tema aparente del ajuste, puede emplearse en auditorías internas para medir cómo un ajuste temático afecta a la neutralidad y a la calidad de las respuestas del modelo base.
- Evaluación de robustez de adaptadores: útil para probar técnicas de mergeo (merge de LoRA con el modelo base) y verificar que la fusión no degrada capacidades generales.
- Docencia y formación técnica: ejemplo práctico de cómo se publica y se consume un adaptador PEFT en Hugging Face, con todas las limitaciones de una model card incompleta.
- Pruebas de integración de infraestructura: validar que un stack de serving (vLLM con soporte LoRA, TGI o similar) carga correctamente adaptadores de 1,7 GB sobre un modelo de 70B antes de desplegar adaptadores propios en producción.

No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones finales sin una evaluación previa exhaustiva, dada la ausencia total de documentación y de métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador solo: aproximadamente 1,7 GB en disco; en memoria, el adaptador añade una fracción pequeña sobre el modelo base.
- VRAM para el modelo base en BF16: aproximadamente 140 GB, lo que requiere múltiples GPU (por ejemplo, 2× H100 80 GB o 4× A100 80 GB con tensor parallelism).
- VRAM para el modelo base cuantizado: en 8 bits, en torno a 70-75 GB (cabe en una H100 80 GB); en 4 bits, en torno a 35-40 GB (cabe en 2× RTX 4090 24 GB o en una A100 40 GB con margen ajustado).
- GPU recomendadas: H100 80 GB, A100 80 GB, A100 40 GB (con cuantización), 2× RTX 4090 24 GB (con cuantización 4 bits).
- ¿Cabe en GPU de consumo? Solo con cuantización agresiva (4 bits) y reparto entre varias GPU; una única RTX 4090 de 24 GB no es suficiente para el modelo base en 4 bits junto con el adaptador y el contexto.
- Opciones de despliegue: vLLM (soporte de adaptadores LoRA), TGI, llama.cpp (requiere convertir el modelo base a GGUF y aplicar el adaptador, con soporte limitado), PEFT + Transformers para inferencia directa.
- Latencia y throughput: no disponibles; dependen enteramente del hardware y del backend elegido, y no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

No hay modelos comparables directos porque este artefacto es un adaptador LoRA específico, no un modelo publicado con benchmarks. A modo de referencia, se compara el modelo base con alternativas de su categoría:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama 3.3 70B Instruct (base de este adaptador) | 70B denso | 128 000 tokens | Llama 3.3 Community License | Pesos abiertos en Hugging Face |
| Llama 3.1 70B Instruct | 70B denso | 128 000 tokens | Llama 3.1 Community License | Pesos abiertos en Hugging Face |
| Qwen 2.5 72B Instruct | 72B denso | 131 072 tokens | Apache 2.0 (según variante) | Pesos abiertos en Hugging Face |
| Mistral Large 2 | 123B denso | 128 000 tokens | Licencia comercial Mistral | API y pesos bajo acuerdo |

El adaptador en sí no aporta datos de rendimiento que permitan compararlo con otros adaptadores; su valor comparativo es nulo sin benchmarks propios.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay descripción del propósito, del dataset, de los hiperparámetros ni de las evaluaciones.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; además, el adaptador hereda las restricciones de la Llama 3.3 Community License del modelo base.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Riesgo elevado de alucinación y de comportamiento impredecible: un ajuste fino no documentado puede degradar capacidades del modelo base de forma no controlada.
- Tema sensible: el nombre del repositorio apunta a un ajuste sobre un tema políticamente controvertido; pueden aparecer sesgos direccionales no declarados.
- Idiomas no documentados: no se puede garantizar un rendimiento correcto en castellano ni en otros idiomas distintos del inglés.
- Contexto efectivo desconocido: aunque el modelo base soporta 128 000 tokens, el ajuste puede haber sido entrenado con secuencias más cortas y degradar el rendimiento en contextos largos.
- Reproducibilidad limitada: sin información de entrenamiento no es posible replicar el ajuste ni auditar su procedencia.
- No apto para producción sin evaluación previa: la ausencia de benchmarks y de documentación impide garantizar calidad, seguridad o cumplimiento normativo.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/believe-it-or-not/original_augmented_original_pkc_kansas_abortion-66ba20bc
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper referenciado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de Llama 3.3 de Meta: https://ai.meta.com/blog/llama-3-3/
