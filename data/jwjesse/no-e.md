# jwjesse/no-e

## Resumen

no-e es un modelo de lenguaje de 1.720 millones de parametros desarrollado por jwjesse, obtenido mediante un ajuste fino con QLoRA sobre Qwen/Qwen3-1.7B. Su tarea es muy concreta: reescribir un pasaje en ingles eliminando la letra "e" (en cualquiera de sus dos casos), conservando los nombres propios tal cual aparecen, los hechos y al menos el 70% de la longitud original. Se trata, por tanto, de un modelo especializado en generacion con restricciones (constrained generation), en este caso un lipograma.

El modelo resuelve un problema acotado pero tecnicamente interesante: forzar una restriccion lexica estricta sobre la salida de un transformer pequeno, algo que los modelos generalistas no cumplen de forma fiable. Es relevante como prototipo de investigacion sobre control de la generacion y como banco de pruebas para tecnicas de decodificacion restringida, no como modelo de proposito general.

La model card es explicitamente honesta sobre su alcance: es un prototipo de investigacion que reduce mucho las "e" fugadas pero rara vez llega a cero, y solo se ha evaluado con pasajes de 50 a 100 palabras en ingles estadounidense procedentes de noticias y enciclopedias. Los pesos se distribuyen como un unico safetensors BF16 fusionado, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B, no confirmada en la informacion) |
| Tipos de cuantizacion | pesos publicados en BF16; entrenamiento con QLoRA de 4 bits; no se listan cuantizaciones publicadas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (un unico model.safetensors BF16 fusionado, ~3,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de 1.720 millones de parametros, y se ajusta con QLoRA de 4 bits, rango 16, tasa de aprendizaje 2e-4, 10 epocas y semilla 0, sobre una unica GPU L4. El adaptador resultante se fusiona en los pesos, de modo que el repositorio contiene un unico fichero BF16 fusionado y no un adaptador separado.

Los datos de entrenamiento proceden del dataset jwjesse/slm-lipogram, configuracion `us_open1`, con solo 150 ejemplos. Los pasajes originales son aperturas de articulos de CNN y de introducciones de Wikipedia (50 a 100 palabras), y las reescrituras las genero GPT-6.1 Sol, conservandose unicamente las que superaban comprobaciones de codigo (sin "e" fuera de los nombres copiados exactamente, sin letras parecidas, solo ASCII, palabras reales en ingles, al menos el 70% de la longitud original) y un juez de significado (Claude Sonnet 5.5, puntuacion 4 o 5). La curva de datos del autor (19 filas: 35 e fugadas de mediana; 38: 30; 75: 14; 150: 10) sugiere que el rendimiento seguia mejorando al llegar a 150 ejemplos.

## Capacidades

- Generacion de texto en ingles con restriccion lexica: reescritura de pasajes sin la letra "e" (lipograma).
- Preservacion de nombres propios copiados literalmente del pasaje, incluso si contienen "e".
- Conservacion de hechos y de al menos el 70% de la longitud del texto original.
- Formato conversacional mediante plantilla de chat (`apply_chat_template`), con soporte de `enable_thinking=False`.
- Generacion determinista recomendada (decodificacion greedy).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido documentados.
- Capacidad multilingue no soportada de forma fiable: se han observado salidas en chino en 2 de 150 casos de evaluacion.

## Casos de uso

- Investigacion sobre generacion con restricciones: servir de referencia para estudiar como un modelo pequeno cumple (o no) una restriccion lexica estricta, comparando tecnicas de prompting y decodificacion restringida.
- Creacion de lipogramas y textos de oulipo: generar versiones sin "e" de pasajes cortos para talleres literarios o experimentos de escritura creativa, aceptando la revision humana posterior.
- Pruebas de robustez de pipelines de evaluacion: usar el modelo como caso de prueba para medir la fiabilidad de jueces automaticos de significado, dado que el autor documenta que los jueces de IA fallaron al detectar errores claros de sentido.
- Generacion de datos sinteticos restringidos: producir pares texto original y reescritura sin "e" para aumentar datasets de investigacion sobre control de la generacion.
- Demostraciones educativas de ajuste fino con QLoRA: el modelo ilustra un flujo completo (dataset pequeno, filtros de codigo, juez de significado, evaluacion con e fugadas) replicable en una unica GPU L4.
- Prototipado de asistentes de reescritura con restricciones personalizadas: adaptar la receta a otras letras o restricciones (por ejemplo, evitar una palabra concreta) como prueba de concepto antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

Evaluacion sobre 150 pasajes retenidos de las mismas dos fuentes (50 de ellos adversariales), ninguno en el entrenamiento, decodificacion greedy y prompt simple.

| Modelo | E fugadas (mediana) | Media | Reescrituras solo con palabras reales |
|---|---|---|---|
| Qwen3-1.7B base | 38 | 37,8 | 100,0% |
| Modelo anterior (188 ejemplos de BBC) | 11 | 11,0 | 84,7% |
| **Este modelo** | **10** | **10,7** | **92,0%** |

Datos adicionales de la evaluacion: 11 de 150 pasajes terminan con 3 o menos e fugadas y el 0% queda completamente libre de "e". Frente al modelo anterior, este deja menos e en 81 de 150 pasajes (58 mas, 11 empates). La puntuacion media del juez de significado es de 3,59 sobre 5, con la advertencia del autor de que no es una medida fiable.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica cabe en GPUs consumer con 8 GB o mas.
- Cuantizaciones de 8 o 4 bits no publicadas oficialmente; al ser un transformer estandar de Qwen3, es probable que herramientas de cuantizacion lo conviertan sin problemas, pero no esta verificado en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; el autor entreno en una L4. Una RTX 4090 o A100 ejecutarian el modelo con holgura.
- Cabe en GPU consumer: si, en tarjetas de gama media-alta con 8 GB o mas.
- Opciones de despliegue: transformers (metodo documentado), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio); llama.cpp y Ollama no estan documentados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| no-e (este modelo) | 1.720 M | no disponible | Lipograma en ingles | apache-2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1.720 M | no disponible | Generacion general | apache-2.0 | Hugging Face |
| Modelo anterior del autor (188 ejemplos BBC) | no disponible | no disponible | Lipograma en ingles | no disponible | no disponible |

No se dispone de informacion sobre otros modelos publicos especializados en lipogramas o generacion con restricciones lexicas que permitan una comparativa adicional. El modelo anterior del autor no tiene repositorio identificado en la informacion proporcionada.

## Limitaciones y advertencias

- Rara vez alcanza cero "e": en la evaluacion, el 0% de los pasajes quedo completamente libre de la letra, con una mediana de 10 e fugadas.
- Salidas ocasionalmente en otro idioma: 2 de 150 salidas de evaluacion contenian caracteres chinos, una completamente en chino; anadir "in English" al prompt reduce el problema.
- El significado no se mide de forma fiable: los jueces de IA pasaron por alto fallos claros de sentido al contrastarlos con valoraciones humanas; la puntuacion de 3,59 sobre 5 es solo orientativa.
- El 8% de las reescrituras usan al menos una palabra inexistente o abreviaturas para esquivar la "e", en lugar de una reescritura natural.
- Solo se ha probado con pasajes de 50 a 100 palabras de noticias y enciclopedias en ingles estadounidense.
- El texto de entrenamiento incluye pasajes de Wikipedia bajo CC BY-SA y texto de articulos de CNN (© CNN); el autor recomienda comprobar la situacion de derechos antes de cualquier uso mas alla de la investigacion.
- La licencia Apache 2.0 corresponde a los pesos (heredada de Qwen3), pero no cubre necesariamente los derechos sobre los datos de entrenamiento.
- No hay garantias de calidad para uso en produccion: es un prototipo de investigacion con 150 ejemplos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jwjesse/no-e
- Demo: https://huggingface.co/spaces/jwjesse/no-e-demo
- Dataset: https://huggingface.co/datasets/jwjesse/slm-lipogram
- Codigo, evaluacion y write-up: https://labs.gauntletai.com/jessewells/SLM
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
