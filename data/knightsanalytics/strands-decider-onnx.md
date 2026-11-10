# KnightsAnalytics/strands-decider-onnx

## Resumen

`KnightsAnalytics/strands-decider-onnx` es la exportación a ONNX con cuantización int4 del modelo `StrandsAgents/strands-decider-E2B-gemma4-v1-2610`, un modelo de decisión construido sobre el decodificador de texto de Gemma 4 E2B con un LoRA específico fusionado y una cabeza pointer añadida. No es un modelo generativo: no produce texto libre, sino que responde preguntas tipadas sobre un estado dado, con tres modalidades de decisión (noul o sí/no, choice o elección entre N opciones nombradas, y score o nivel en una escala ordenada). Las opciones se proporcionan en el prompt en el momento de la petición.

La relevancia de esta ficha es doble. Por un lado, documenta un patrón de despliegue poco común en el ecosistema open source: convertir un modelo de decisión en un grafo ONNX autocontenido que se ejecuta con ONNX Runtime y el `DecisionPipeline` de la librería hugot, sin necesidad de stack de generación. Por otro, cuantifica con honestidad el coste de la cuantización int4 frente al export fp32, incluyendo el único caso de deriva detectado. El repo ocupa 3,0 GB y el modelo se describe como "pequeño" en 2,8 GB.

El modelo base es `google/gemma-4-E2B-it` según la model card del autor, con licencia Apache-2.0. La información pública disponible es escasa (cero descargas, cero likes en el momento de la consulta) y no incluye detalles sobre el dataset de entrenamiento del LoRA ni sobre el número de tokens de contexto efectivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4 E2B) con LoRA fusionado y cabeza pointer para clasificación de opciones |
| Parámetros totales | no disponible (el repo pesa 3,0 GB; el modelo int4, 2,8 GB) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona un caso de prueba de 2.179 tokens, sin especificar el máximo) |
| Tipos de cuantización | int4 (MatMulNBits 4-bit asimétrico block size 32 en lineales; GatherBlockQuantized 4-bit simétrico block size 32 en embeddings); cabeza pointer en fp32; existe variante int8-linear de 3,7 GB y export fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo con ops contrib de `com.microsoft`, requiere ONNX Runtime; probado con 1.31 en CPU) |

## Arquitectura y entrenamiento

El grafo ONNX contiene el decodificador de texto de Gemma 4 E2B con el LoRA de strands-decider ya fusionado, más una cabeza pointer que proyecta las representaciones del modelo sobre las posiciones de los tokens de cada opción. Las entradas del grafo son `input_ids` (int64, `[batch, sequence]`), `attention_mask` (int64, `[batch, sequence]`, padding a la derecha) y `option_index` (int64, `[batch, options]`, la posición del último token de cada opción). La salida es `logits` (float32, `[batch, options]`), que son las puntuaciones crudas de la cabeza pointer; la temperatura, el softmax y el cálculo de confianza se aplican fuera del grafo. La temperatura por tipo de pregunta está en `strands_decider_config.json`.

El autor no documenta el proceso de entrenamiento del LoRA ni la composición del dataset, más allá de remitir a la model card del modelo base (`google/gemma-4-E2B-it`), que lista las fuentes de datos de entrenamiento, incluyendo varias con términos no comerciales. La innovación técnica destacable es la formulación como clasificación sobre opciones dinámicas mediante pointer head, que evita la generación autoregresiva y reduce la decisión a un único forward pass. La construcción de prompts debe seguir el formato upstream byte a byte: el estado se tokeniza con tokens especiales (`<bos>`) y cada pregunta sin ellos, concatenando después los ids.

En cuanto a la cuantización, el autor reporta que sobre 25 casos de prueba el cambio medio en la mayor variación de probabilidad de cualquier opción respecto al export fp32 es de 0,021; 24 de 25 casos quedan dentro de 0,07. El caso restante, de 2.179 tokens, deriva 0,175 y su respuesta sí/no pasa de 0,67 a 0,49, es decir, cruza el umbral de decisión. La variante int8-linear (3,7 GB) se mantiene dentro de 0,025 en los 25 casos. El export fp32 reproduce el ejemplo de la model card upstream con tres decimales de precisión.

## Capacidades

- Respuesta a preguntas de tipo noul (sí/no) sobre un estado proporcionado en el prompt.
- Elección entre N opciones nombradas (choice), con las opciones definidas en tiempo de petición.
- Asignación de un nivel en una escala ordenada (score).
- Clasificación en un único forward pass, sin generación autoregresiva de texto.
- Gestión de estados largos, con al menos un caso validado de 2.179 tokens.
- Integración con ONNX Runtime y el `DecisionPipeline` de hugot.
- No soporta tool calling, agentes multi-paso, visión, audio ni modos de razonamiento extendido (thinking), según la información disponible.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: el modelo recibe el estado acumulado de una conversación o tarea y decide entre opciones predefinidas (por ejemplo, "continuar", "escalar a humano", "pedir aclaración"), sin coste de generación y con latencia de un solo forward pass.
- Moderación y filtrado binario: con la modalidad noul se puede evaluar si un texto cumple una política concreta, pasando la política y el texto como estado y obteniendo una probabilidad calibrada tras aplicar temperatura y softmax.
- Triaje de tickets de soporte: clasificar cada ticket en niveles de severidad (score) o en categorías de cola (choice) definidas en el prompt, aprovechando que las opciones no están fijadas en los pesos y pueden cambiar sin reentrenar.
- Validación de salidas en pipelines de CI/CD: decidir si un artefacto generado (parche, respuesta, informe) satisface un criterio expresado en el estado, con umbral de confianza configurable externamente al grafo.
- Sistemas de recomendación con reglas dinámicas: elegir entre candidatos nombrados en el prompt en función de un estado de usuario, sustituyendo lógica de reglas codificada a mano por una decisión aprendida.
- Despliegue en entornos con CPU exclusivamente: al requerir solo ONNX Runtime 1.31 en CPU y pesar 2,8 GB en int4, encaja en servicios sin GPU donde un modelo generativo no sería viable.
- Evaluación A/B de políticas: al mantener las opciones en el prompt, se pueden comparar distintas formulaciones de decisión sobre el mismo modelo sin reentrenar, midiendo la confianza devuelta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta métricas de fidelidad de la cuantización frente al export fp32:

| Métrica | int4 (este modelo) | int8-linear | fp32 |
|---|---|---|---|
| Cambio medio en la mayor variación de probabilidad (25 casos) | 0,021 | ≤ 0,025 | referencia |
| Casos dentro de 0,07 | 24 de 25 | 25 de 25 | referencia |
| Peor caso (2.179 tokens) | deriva 0,175; sí/no pasa de 0,67 a 0,49 | dentro de 0,025 | referencia |
| Tamaño | 2,8 GB | 3,7 GB | no disponible |

## Requisitos de hardware

- El modelo está pensado para ejecutarse en CPU con ONNX Runtime (probado con la versión 1.31); no se documentan requisitos de VRAM.
- Al pesar 2,8 GB en int4, cabe en memoria RAM de sistemas convencionales; no se especifica el mínimo exacto.
- No se indican GPU recomendadas ni soporte GPU validado; la model card solo menciona pruebas en CPU.
- Opciones de despliegue: ONNX Runtime con el `DecisionPipeline` de hugot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| strands-decider-onnx (este) | Decisión (noul/choice/score) sobre Gemma 4 E2B | 2,8 GB int4 | no disponible | Apache-2.0 | ONNX | Requiere ops contrib de ONNX Runtime; cabeza pointer fp32 |
| KnightsAnalytics/strands-decider-E2B-onnx | Decisión, export fp32 | no disponible | no disponible | Apache-2.0 | ONNX | Referencia de fidelidad; reproduce el ejemplo upstream con tres decimales |
| Variante int8-linear del mismo modelo | Decisión | 3,7 GB | no disponible | Apache-2.0 | ONNX | Deriva ≤ 0,025 en los 25 casos de prueba |
| StrandsAgents/strands-decider-E2B-gemma4-v1-2610 | Decisión, modelo upstream | no disponible | no disponible | Apache-2.0 | no disponible | Modelo original antes de la exportación ONNX |

No se dispone de información sobre otros modelos de decisión comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre y no puede usarse para chat, resumen ni generación de código.
- La cuantización int4 introduce deriva medible: en un caso de 2.179 tokens la respuesta sí/no cruza el umbral (de 0,67 a 0,49), lo que puede invertir decisiones en contextos largos. Para producción sensible se recomienda evaluar la variante int8-linear o fp32.
- Requiere las ops contrib de `com.microsoft`, lo que limita la portabilidad a runtimes ONNX que no las soporten.
- La construcción del prompt debe replicar el formato upstream byte a byte; cualquier desviación puede degradar la decisión sin aviso.
- La temperatura, el softmax y el umbral de confianza se aplican fuera del grafo; el despliegue debe implementarlos correctamente usando `strands_decider_config.json`.
- La model card advierte que los datos de entrenamiento del modelo base incluyen fuentes con términos no comerciales, a pesar de la licencia Apache-2.0; debe revisarse antes de un uso comercial.
- No se documentan idiomas soportados, sesgos conocidos ni tasa de alucinación; al ser un modelo de clasificación, el riesgo se traslada a decisiones erróneas con confianza alta, no a texto inventado.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KnightsAnalytics/strands-decider-onnx
- Export fp32: https://huggingface.co/KnightsAnalytics/strands-decider-E2B-onnx
- Modelo base: https://huggingface.co/StrandsAgents/strands-decider-E2B-gemma4-v1-2610
- Librería hugot: https://github.com/knights-analytics/hugot
- Modelo base de Google: google/gemma-4-E2B-it (referenciado en la model card; sin URL directa en la información disponible)
