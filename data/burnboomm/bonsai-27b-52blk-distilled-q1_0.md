# burnboomm/Bonsai-27B-52blk-distilled-Q1_0

## Resumen

Bonsai-27B-52blk-distilled-Q1_0 es una variante extremadamente comprimida del modelo Bonsai-27B de Prism ML, desarrollada por el usuario burnboomm. Partiendo del Bonsai-27B-gguf (un modelo de 27B parámetros basado en Qwen3.6-27B con pesos cuantizados a 1 bit), esta versión aplica tres transformaciones adicionales: poda de profundidad (de 64 a 52 bloques), recorte de vocabulario (de 248 320 a 98 782 tokens) y destilación de logits desde el profesor Qwen3.5-35B-A3B. El resultado es un archivo GGUF de solo 2,937 GB que carga en LM Studio y llama.cpp sin parchear, pensado para entornos con menos de 3 GB de almacenamiento o VRAM limitada.

El modelo está orientado a tareas de generación de texto y razonamiento, con especial énfasis en codificación, aunque sus métricas reales muestran una capacidad modesta. Según la model card, alcanza un pass@1 de 4,7% en el benchmark LeetCodeDataset por ejecución, frente al 9,3% de la variante de 56 bloques. La destilación mejora la perplejidad de trayectoria de 5,021 a 3,409, pero no compensa la pérdida de capacidad por la poda. Es una liberación de nicho para casos donde el tamaño es un requisito duro, no un modelo de propósito general.

La licencia es Apache 2.0, heredada del modelo base. El repositorio contribuye únicamente la poda, el recorte de vocabulario, la destilación de escalas y las mediciones. No incluye proyector de visión, por lo que es exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida 3:1 lineal/completa (derivado de Qwen3.6-27B) |
| Parametros totales | 20 798 504 992 (tras poda; el modelo base nominal es de 27B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no especificada oficialmente; se sugiere 8192 en el ejemplo de uso, pero no validada |
| Tipos de cuantizacion | Q1_0 (1 bit) en formato GGUF |
| Idiomas soportados | Ingles y codigo principalmente; el recorte de vocabulario elimina CJK, cirilico y emojis |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Bonsai-27B-gguf, que a su vez deriva de Qwen3.6-27B con pesos cuantizados a 1 bit de extremo a extremo (embeddings, atencion, MLPs y cabeza de lenguaje). Sobre esa base, el autor aplica una poda de profundidad que reduce el numero de bloques de 64 a 52, eliminando los grupos 5, 7 y 9 (bloques originales 20-23, 28-31 y 36-39). La seleccion se hizo mediante leave-one-out perplexity y busqueda voraz, respetando la estructura de atencion hibrida 3:1 (lineal/completa) del modelo, que impone que solo se puedan eliminar grupos completos de 4 bloques.

Posteriormente se realiza una destilacion de logits desde Qwen3.5-35B-A3B, que comparte el mismo vocabulario de 248 077 tokens. Se entrenan unicamente los 186 millones de parametros de escala de grupo (como `scale₀·exp(δ)`), sin anadir bytes al archivo. La funcion de perdida combina divergencia KL sobre el soporte top-64 del profesor (renormalizado) con 0,1× entropia cruzada sobre el token verdadero. Se usan 2,0 millones de tokens de trayectorias de agente SWE-smith resueltas, con 300 pasos y learning rate 3e-3. La perplejidad de trayectoria mejora de 5,021 a 3,409 (-32%).

El tercer paso es el recorte de vocabulario de 248 320 a 98 782 tokens, basado en 11,9 millones de tokens de trafico real (solo se usaron 66 741 tokens distintos). Se conservan los tokens usados mas los de bajo indice no usados como margen, y se aplica un cierre transitivo sobre la tabla de merges para que todos los tokens conservados sigan siendo emitibles por BPE. Las filas de embedding se copian bit a bit.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento (es un modelo de razonamiento; requiere presupuesto de salida alto, idealmente 6000 tokens).
- Codificacion en Python y otros lenguajes, aunque con tasa de exito limitada (pass@1 de 4,7% en LeetCodeDataset).
- Ejecucion de soluciones generadas contra asserts del propio problema (validacion por ejecucion, no solo sintaxis).
- Soporte de tool calling y uso como agente, segun la documentacion del modelo base Bonsai-27B (aunque no se ha evaluado en esta variante).
- Capacidades multilingues reducidas: solo ingles y codigo; el recorte de vocabulario elimina CJK, cirilico y emojis.
- Sin soporte de vision (no incluye proyector mmproj).
- Compatible con llama.cpp y LM Studio sin parchear.

## Casos de uso

- Prototipado en entornos con restriccion de almacenamiento: el modelo cabe en menos de 3 GB, lo que permite experimentar con un LLM de razonamiento en portatiles o dispositivos con poco espacio sin recurrir a la nube.
- Asistente de codigo en local para tareas simples: puede generar fragmentos de Python o explicar algoritmos, aunque su baja tasa de exito (4,7%) limita su uso a tareas de nivel basico o como apoyo educativo.
- Generacion de documentacion tecnica: dado su vocabulario recortado a ingles y codigo, es adecuado para redactar comentarios, docstrings y descripciones de funciones en repositorios.
- Evaluacion de tecnicas de compresion: sirve como caso de estudio para investigar el impacto de la poda de profundidad y la destilacion en modelos de 1 bit, comparando perplejidad frente a capacidad real.
- Entornos de CI/CD con presupuesto minimo: al ocupar menos de 3 GB, puede integrarse en pipelines de integracion continua para tareas de autocompletado o analisis de codigo estatico ligero.
- Educacion en IA: permite demostrar conceptos de cuantizacion extrema, poda estructural y destilacion de logits en un modelo funcional sin necesidad de hardware especializado.

## Benchmarks y rendimiento

La model card reporta resultados de pass@1 por ejecucion sobre `newfacade/LeetCodeDataset`, donde cada solucion generada se ejecuta contra los asserts del problema. Greedy, `enable_thinking=False`, n=150:

| Modelo | Tamano | pass@1 | 95% CI | Python valido |
|---|---:|---:|---|---:|
| 56 bloques (Bonsai-Shohin-27B-Q1_0) | 3,151 GB | 14/150 = 9,3% | [4,7%, 14,0%] | 88,0% |
| **Este modelo (52 bloques, destilado)** | **2,937 GB** | **7/150 = 4,7%** | [1,3%, 8,0%] | 86,0% |
| 52 bloques sin destilacion | 2,937 GB | 3/150 = 2,0% | [0,0%, 4,2%] | 77,3% |
| 48 bloques | 2,945 GB | 0/40 = 0% | — | 70-80% |

El autor destaca que la destilacion mejora la perplejidad de trayectoria (5,021 → 3,409) pero que la diferencia en pass@1 entre 2,0% y 4,7% no es estadisticamente significativa (z=-1,29, p=0,20). No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: funciona en una GPU de 8 GB segun la model card. El peso del archivo es de 2,937 GB, pero la caché KV domina el consumo: ~54 KiB/token en los 13 bloques de atencion completa restantes.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, M1/M2 Pro). No requiere GPU de datacenter.
- En consumer GPU: si, cabe en tarjetas de gama media con 8 GB o mas.
- Opciones de despliegue: llama.cpp, LM Studio, y cualquier runtime compatible con GGUF. No se ha validado con vLLM ni TGI en esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo base Bonsai-27B reporta ~26-66 tok/s en portatiles M4 Pro a M5 Max, pero esta variante podada no tiene mediciones propias.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano archivo | Contexto | pass@1 (LeetCode) | Licencia |
|---|---|---|---:|---:|---|
| **Bonsai-27B-52blk-distilled-Q1_0** | 20,8B (tras poda) | 2,937 GB | no especificado | 4,7% | Apache 2.0 |
| Bonsai-Shohin-27B-Q1_0 (56 bloques) | ~23B estimado | 3,151 GB | no especificado | 9,3% | Apache 2.0 |
| Bonsai-27B-gguf (original, 64 bloques) | 27B | ~3,9 GB (segun Prism ML) | no especificado | no medido en esta fuente | Apache 2.0 |
| Qwen3.5-35B-A3B (profesor) | 35B (MoE, 3B activos) | no aplica | no especificado | no medido | no disponible |

La comparativa muestra que la poda de 56 a 52 bloques reduce significativamente la capacidad de codificacion (9,3% → 4,7%), mientras que la destilacion recupera parcialmente la perdida (2,0% sin destilar). El modelo original de 64 bloques no tiene mediciones en este benchmark, pero es el punto de partida.

## Limitaciones y advertencias

- Baja capacidad de codificacion: pass@1 de 4,7% en LeetCodeDataset, muy por debajo de modelos convencionales. No es adecuado para generacion de codigo en produccion.
- Perdida de vocabulario: el recorte elimina caracteres CJK, cirilicos y emojis. El modelo solo es util para ingles y codigo.
- Incompatibilidad con el tokenizer original: no se puede usar el tokenizer de 248 320 tokens con este modelo; hay que usar el integrado en el archivo GGUF.
- Contexto largo no validado: todas las pruebas de perplejidad usaron ventanas de 2048 tokens; la poda elimino 3 de 16 bloques de atencion completa, lo que puede afectar a la coherencia en secuencias largas.
- Riesgo de alucinacion y errores silenciosos: como todo LLM de 1 bit, puede generar codigo sintacticamente valido pero logicamente incorrecto (la tasa de Python valido es del 86%, pero solo el 4,7% pasa los asserts).
- Sesgos desconocidos: no se ha evaluado en tareas de seguridad, sesgo social o toxicidad.
- Restricciones de uso comercial: licencia Apache 2.0, permite uso comercial sin restricciones, pero el autor advierte que es una liberacion de tamano limitado, no un modelo de proposito general.
- Solo texto: no incluye proyector de vision, a diferencia del Bonsai-27B original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/burnboomm/Bonsai-27B-52blk-distilled-Q1_0
- Modelo base (Bonsai-27B-gguf): https://huggingface.co/prism-ml/Bonsai-27B-gguf
- Variante recomendada por el autor (56 bloques): https://huggingface.co/burnboomm/Bonsai-Shohin-27B-Q1_0
- Coleccion Bonsai 27B de Prism ML: https://huggingface.co/collections/prism-ml/bonsai-27b
- Documentacion oficial de Bonsai 27B: https://docs.prismml.com/models/bonsai-27b
- Anuncio de Prism ML sobre Bonsai 27B: https://prismml.com/news/prismml-releases-bonsai-27b
- Anuncio de Bonsai 27B en telefono: https://prismml.com/news/bonsai-27b
