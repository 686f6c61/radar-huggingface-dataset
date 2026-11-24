# eval-apply/silvann_tq_D8E4_inkling2_mini

## Resumen

silvann_tq_D8E4_inkling2_mini es un empaquetado cuantizado del modelo thinkingmachines/Inkling-2-Mini, publicado por el usuario eval-apply. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de los pesos originales a un formato propietario denominado `silvann-packed-v3`, diseñado para ser leído por el motor SiLVANN (el intérprete generalizado de Eval-Apply y su librería de redes neuronales). La conversión aplica TurboQuant: los expertos enrutados se almacenan a 4 bits por peso y el resto de matrices a 8 bits, con una escala por fila y una rotación bloqueada de Hadamard y signos a lo largo del eje de entrada, mientras que el router, las normas y los tensores pequeños se mantienen sin pérdida.

El modelo base es Inkling-2-Mini de Thinking Machines, del que se conserva únicamente la parte de texto: el codificador de visión y la cabeza de predicción multi-token no están incluidos. El checkpoint original almacena sus expertos en NVFP4 (capas 0 a 19) y MXFP8 (capas 20 a 23); aquí se decodifican tal como lo hace `transformers` y se vuelven a empaquetar, todas las capas a 4 bits. El repositorio ocupa aproximadamente 13,9 GB.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantización con 0 descargas y 0 likes en el momento de la consulta, orientado a usuarios del runtime SiLVANN y no al ecosistema estándar de `transformers`. Su interés técnico radica en el esquema de compresión mixta (8 bits en densas, 4 bits en expertos) y en la validación de fidelidad reportada frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según el modelo base Inkling-2-Mini; detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TurboQuant mixta: expertos enrutados a 4 bits, matrices densas a 8 bits, escala por fila con rotación bloqueada de Hadamard y signos; router, normas y tensores pequeños sin pérdida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `silvann-packed-v3` (`pack.json`, `layers/NNN/`, `global.pkl`); no compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer con mezcla de expertos, a juzgar por la presencia de expertos enrutados y un router en la descripción del empaquetado. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detalla la innovación arquitectónica del base más allá de la estructura MoE y la existencia de una cabeza de predicción multi-token (excluida en este pack) y de un codificador de visión (también excluido).

La contribución técnica de este repositorio es exclusivamente de compresión y formato. El esquema TurboQuant aplica una rotación bloqueada de Hadamard y signos a lo largo del eje de entrada de cada matriz antes de cuantizar, con una escala por fila, lo que reduce la varianza de los valores y mejora la fidelidad de la cuantización. Los expertos originales, almacenados en NVFP4 en las capas 0 a 19 y MXFP8 en las capas 20 a 23, se decodifican y se vuelven a empaquetar uniformemente a 4 bits. Según el autor, la validación frente a la ejecución original en fp32 con `transformers` muestra que el pack reproduce el mismo siguiente token en el 96,1 % de 1.601 posiciones de cuatro textos, y que los cinco logits mayores del modelo de referencia se desplazan 0,43 de media.

## Capacidades

- Generación de texto: única modalidad incluida en este pack, al haberse excluido el codificador de visión.
- Razonamiento y conversación multi-turno: heredados del modelo base, aunque no se documentan evaluaciones específicas.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): la visión no está incluida en este empaquetado; el resto no disponible.
- Predicción multi-token: la cabeza correspondiente no está incluida en este pack.

## Casos de uso

- Investigación sobre cuantización mixta: el pack permite estudiar el impacto de TurboQuant con 8 bits en densas y 4 bits en expertos sobre la fidelidad de las salidas, usando la métrica de coincidencia de siguiente token reportada por el autor.
- Evaluación de runtimes alternativos: sirve para probar el motor SiLVANN frente a `transformers` en términos de fidelidad y consumo de memoria, dado que el formato no es compatible con el stack estándar.
- Despliegue en entornos con memoria restringida: con 13,9 GB de pesos, el pack reduce el espacio frente a un checkpoint sin cuantizar, lo que facilita su carga en GPUs de gama alta de consumo, siempre que se use el runtime SiLVANN.
- Reproducción de experimentos del modelo base en modo solo texto: al conservar tokenizer, plantilla de chat y configuraciones originales, permite ejecutar tareas de generación de texto sin el codificador de visión.
- Auditoría de licencias y trazabilidad: al mantener la licencia Apache 2.0 y documentar el origen de los pesos, es útil para verificar la cadena de custodia en proyectos que exijan cumplimiento estricto.
- Estudio de esquemas de compresión por capas: la política de anchura por tensor descrita en `pack.json` permite analizar cómo se distribuye el error entre capas con expertos NVFP4 y MXFP8 originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la fidelidad frente al modelo original en fp32: coincidencia del siguiente token en el 96,1 % de 1.601 posiciones de cuatro textos, con un desplazamiento medio de 0,43 en los cinco logits mayores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 13,9 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, más el overhead del runtime y de las activaciones.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos, quedaría fuera de GPUs con menos de 16 GB y sería ajustado en tarjetas de 16 GB.
- Opciones de despliegue: exclusivamente el runtime SiLVANN; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `silvann-packed-v3` no lo lee `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| silvann_tq_D8E4_inkling2_mini | no disponible | no disponible | `silvann-packed-v3` (13,9 GB) | Apache 2.0 | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | original (NVFP4/MXFP8) | Apache 2.0 (según pack) | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo texto: el codificador de visión y la cabeza de predicción multi-token están excluidos, por lo que no puede usarse para tareas multimodales ni de predicción multi-token.
- Compatibilidad restringida: el formato `silvann-packed-v3` solo lo lee el runtime SiLVANN; no funciona con `transformers`, vLLM, llama.cpp, Ollama ni TGI.
- Fidelidad no exacta: la coincidencia del siguiente token es del 96,1 %, no del 100 %, y los logits mayores se desplazan 0,43 de media; en producción esto puede traducirse en divergencias en generaciones largas.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible; deben evaluarse sobre el modelo base.
- Idiomas: no se especifican los idiomas soportados.
- Licencia: Apache 2.0, que permite uso comercial, pero el autor del pack no ofrece garantías y remite la autoría del modelo a sus creadores originales.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (24 de noviembre de 2026), sin evidencia de uso en producción.
- Trazabilidad: al ser un artefacto de terceros sobre un modelo base, conviene verificar la integridad de los pesos antes de usarlo en entornos críticos.

## Enlaces

- Repositorio del pack: https://huggingface.co/eval-apply/silvann_tq_D8E4_inkling2_mini
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor SiLVANN / Eval-Apply: no disponible en la información proporcionada
- Paper de TurboQuant: no disponible en la información proporcionada
- Demos o blogs adicionales: no disponible en la información proporcionada
