# hoyporti/granite-3.0-1b-a400m-routes-onnx

## Resumen
El modelo `hoyporti/granite-3.0-1b-a400m-routes-onnx` es una extracción instrumental del modelo IBM Granite 3.0 1B-A400M Instruct, publicada por el usuario hoyporti. No es un modelo generativo: es una versión recortada que conserva únicamente el camino necesario para calcular los logits de los routers de mezcla de expertos (MoE) de cada capa. Recibe `input_ids` con forma `[1, tokens]` y devuelve `router_logits` con forma `[24, tokens, 32]`, es decir, la puntuación de cada una de las 24 capas para cada uno de los 32 expertos. A partir de ahí, tomando el top-8 por fila y aplicando softmax, se obtienen los expertos y pesos que el modelo completo habría seleccionado.

Su relevancia es acotada pero específica: sirve para interpretabilidad y visualización de la dinámica de routing en MoE sin necesidad de ejecutar el modelo completo. Es la pieza que alimenta la Figura 2 del proyecto glassbox, que enruta texto en el navegador con ONNX Runtime Web sobre WebGPU. El repositorio ocupa 1,5 GB y se distribuye con licencia Apache 2.0, heredada del modelo base.

Conviene subrayar que este artefacto no sustituye al modelo original para generación, razonamiento ni ninguna tarea lingüística: solo expone las decisiones internas de enrutamiento. Para cualquier uso productivo de Granite 3.0 1B-A400M debe acudirse al modelo base de IBM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivado de Granite 3.0 1B-A400M); artefacto de solo routing |
| Parámetros totales | no disponible (el modelo base declara 1B-A400M; este artefacto no reporta recuento) |
| Parámetros activos | 400M en el modelo base (no verificado en este artefacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (MatMulNBits, bloques de 32) para expertos y atención; fp16 para embeddings; fp32 para routers |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repo de 1,5 GB) |

## Arquitectura y entrenamiento
El artefacto deriva del modelo IBM Granite 3.0 1B-A400M Instruct, un transformer con capas de mezcla de expertos: 24 capas y 32 expertos por capa, con top-8 activos por token según los logits de routing. Esta versión conserva el grafo hasta los routers de la última capa y descarta todo lo posterior; los expertos y la atención siguen ejecutándose porque el router de cada capa depende de las activaciones de las capas previas, pero no se conserva nada más allá de los logits de routing.

La cuantización es selectiva: expertos y atención en 8 bits con MatMulNBits (bloques de 32) y tabla de embeddings en fp16, mientras que los routers permanecen en fp32 por ser la salida crítica. Según la model card, esta configuración reproduce la selección top-8 del modelo completo en fp32 en el 94,8% de los pares token-capa sobre las frases que glassbox traza, frente al 57% de una copia en 4 bits. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO para este artefacto; se reconstruye con `python -m glassbox routes` desde el repositorio glassbox.

## Capacidades
- Cálculo de logits de routing: devuelve `router_logits` de forma `[24, tokens, 32]` para entradas `[1, tokens]`.
- Selección de expertos: permite derivar top-8 y pesos por softmax para cada token y capa.
- Interpretabilidad de MoE: expone qué expertos activa el modelo base en cada capa y token.
- Ejecución en navegador: integrable con ONNX Runtime Web sobre WebGPU, como en glassbox.
- No genera texto: no conserva la cabeza de lenguaje ni las salidas posteriores a los routers.
- No soporta tool calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en este artefacto.

## Casos de uso
- Visualización de routing en el navegador: cargar el ONNX con ONNX Runtime Web y WebGPU para mostrar en tiempo real qué expertos activa cada token, tal como hace glassbox en su Figura 2; adecuado por el tamaño reducido y la exportación a ONNX.
- Investigación en interpretabilidad de MoE: analizar patrones de especialización de expertos por capa y token sin ejecutar el modelo completo de 1B, gracias a la salida `[24, tokens, 32]`.
- Depuración de cuantización: comparar la selección top-8 de esta versión de 8 bits con la del modelo fp32 (94,8% de coincidencia reportada) para validar pipelines de cuantización.
- Docencia y demostraciones: explicar el funcionamiento interno de un transformer MoE con un artefacto de 1,5 GB que cabe en entornos modestos.
- Validación de enrutamiento en pipelines propios: usar los logits como referencia para comprobar que una implementación de MoE replica las decisiones del modelo original.
- Análisis de cargas por experto: estudiar el balance de uso de los 32 expertos por capa para detectar desequilibrios o colapsos de routing.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El único dato de fidelidad reportado es la coincidencia del 94,8% de pares token-capa en la selección top-8 respecto al modelo fp32, y el 57% de una copia en 4 bits.

## Requisitos de hardware
- VRAM estimada: el repo ocupa 1,5 GB; la inferencia en 8 bits requiere del orden de 1,5-2 GB de memoria, aunque no se publica una cifra oficial.
- GPU recomendadas: no disponibles; el caso documentado es ejecución en navegador con WebGPU, lo que sugiere compatibilidad con GPUs de consumo.
- GPU de consumo: probablemente cabe en GPUs integradas y de gama media con WebGPU, dado el tamaño; no verificado oficialmente.
- Despliegue: ONNX Runtime (incluido ONNX Runtime Web con WebGPU); no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-3.0-1b-a400m-routes-onnx | no disponible (base 1B-A400M) | no disponible | router_logits `[24, tokens, 32]` | Apache 2.0 | Hugging Face, ONNX |
| ibm-granite/granite-3.0-1b-a400m-instruct | 1B totales / 400M activos | no disponible | texto generado | Apache 2.0 | Hugging Face |
| Copia en 4 bits del mismo artefacto | no disponible | no disponible | router_logits | Apache 2.0 | mencionada en la model card, sin enlace |

No se dispone de información sobre otros artefactos de solo routing comparables.

## Limitaciones y advertencias
- No genera texto: cualquier expectativa de uso generativo es incorrecta.
- Fidelidad imperfecta: reproduce el top-8 del modelo fp32 en el 94,8% de pares token-capa, no en el 100%.
- Entrada restringida: espera `input_ids` con forma `[1, tokens]`; no se documenta soporte de batch.
- Idiomas y contexto: no disponibles; no debe asumirse el comportamiento del modelo base.
- Sesgos: no documentados para este artefacto; podrían heredarse los del modelo base, pero no se analizan.
- Alucinación: no aplica directamente al no generar texto, aunque los logits pueden malinterpretarse si se usan sin contexto.
- Licencia Apache 2.0: permite uso comercial, pero el artefacto no es apto para producción como modelo de lenguaje.
- Reproducibilidad: depende del repositorio glassbox y del comando `python -m glassbox routes`; no se documenta versionado de dependencias.

## Enlaces
- Hugging Face: https://huggingface.co/hoyporti/granite-3.0-1b-a400m-routes-onnx
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-1b-a400m-instruct
- Repositorio glassbox: https://github.com/SomethingObvious/glassbox
