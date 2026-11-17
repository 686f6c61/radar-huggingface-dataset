# larql/gemma-3-270m-it

## Resumen

`larql/gemma-3-270m-it` es un contenedor VINDEX3 del modelo `google/gemma-3-270m-it` de Google, publicado por el usuario larql para su uso con el runtime LARQL. No se trata de un modelo nuevo ni de un fine-tune: el autor indica explícitamente que contiene los pesos BF16 originales sin modificar, más la estructura del modelo representada como un grafo ejecutable e inspeccionable. El valor diferencial está, por tanto, en el formato de empaquetado y en las herramientas de inspección, no en el comportamiento del modelo.

El modelo subyacente es Gemma 3 en su variante de 270 millones de parámetros en versión instruction-tuned, una familia de modelos densos de Google orientada a despliegues ligeros. El repositorio ocupa 0,6 GB y se distribuye bajo los Términos de Uso de Gemma.

Su relevancia es acotada: resulta útil para quienes ya trabajan con el ecosistema LARQL y quieren cargar Gemma 3 270M con observabilidad estructural, o para experimentar con la representación en grafo del modelo. Para el resto de casos, el modelo original de Google es la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer denso de la familia Gemma 3; el autor no detalla la arquitectura en la model card) |
| Parametros totales | 270 millones (según el nombre del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el contenedor incluye pesos BF16 sin modificar) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (https://ai.google.dev/gemma/terms) y Gemma Prohibited Use Policy |
| Formato de pesos | Contenedor VINDEX3 (runtime LARQL); pesos internos en BF16 |

## Arquitectura y entrenamiento

La model card no aporta información sobre la arquitectura interna ni sobre el proceso de entrenamiento. Lo único verificable es que el contenedor se generó a partir del commit `ac82b4e820549b854eebf28ce6dedaf9fdfa17b3` de `google/gemma-3-270m-it`, que los pesos BF16 se conservan sin modificar y que la estructura del modelo se expone como grafo ejecutable e inspeccionable mediante VINDEX3.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se describen innovaciones técnicas propias del contenedor más allá de la citada representación en grafo y la capacidad `vindex3 observe`. Los digests de verificación están en el archivo `PROVENANCE.md` del repositorio.

## Capacidades

- Generación de texto, según lo declarado en la model card (`run`, `chat`, `serve`).
- Servido mediante API compatible con OpenAI a través de `larql serve`.
- Consulta e inspección estructural mediante el lenguaje LQL y el comando `vindex3 observe`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Evaluación del runtime LARQL: cargar el contenedor con `larql pull` y ejecutar `larql run` para validar el flujo completo de descarga, decodificación y generación en un modelo pequeño de 270M parámetros.
- Inspección estructural de un transformer: usar `vindex3 observe` y LQL para recorrer el grafo del modelo, útil en docencia o investigación sobre interpretabilidad y visualización de arquitecturas.
- Servicio local de pruebas con API compatible con OpenAI: `larql serve --port 8080` permite montar un endpoint local para probar clientes y SDKs sin depender de un proveedor externo.
- Verificación de procedencia: el archivo `PROVENANCE.md` con digests permite auditar que los pesos corresponden al commit declarado del modelo original, un caso de uso relevante en entornos con requisitos de trazabilidad.
- Prototipado de pipelines con modelos pequeños: al ocupar 0,6 GB, el contenedor se puede mover y desplegar en entornos con recursos muy limitados para pruebas de integración.
- Desarrollo de herramientas sobre el formato VINDEX3: sirve como ejemplo de referencia de cómo se empaqueta un modelo de la familia Gemma en este contenedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 270M parámetros en BF16, el peso de los pesos ronda los 0,54 GB, y el repositorio completo ocupa 0,6 GB; el consumo real de memoria depende del runtime LARQL y de la longitud de contexto.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPU de consumo, pero la información proporcionada no especifica modelos concretos ni requisitos mínimos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se confirma en la documentación.
- Opciones de despliegue: LARQL (`larql pull`, `larql run`, `larql serve` con API compatible con OpenAI). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| larql/gemma-3-270m-it | 270M | no disponible | Gemma Terms of Use | VINDEX3 (LARQL) | Pesos BF16 sin modificar más grafo inspeccionable |
| google/gemma-3-270m-it | 270M | no disponible | Gemma Terms of Use | safetensors (formato estándar de Hugging Face) | Modelo original de Google; referencia funcional |
| Otros modelos de ~300M | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación relevante es con el modelo original: funcionalmente deberían ser equivalentes, ya que el autor declara que los pesos no están modificados. La diferencia está en el formato de empaquetado y en las herramientas de inspección asociadas a LARQL.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación de `google/gemma-3-270m-it` (sesgos, alucinaciones, cobertura idiomática) se hereda íntegramente.
- Con 270M parámetros, la capacidad de razonamiento, código y matemáticas es limitada en comparación con modelos de mayor tamaño; no es adecuado para tareas de alta exigencia.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obliga a cumplir la Gemma Prohibited Use Policy; conviene revisarlas antes de cualquier despliegue en producción.
- Dependencia del runtime LARQL: el contenedor VINDEX3 no es directamente consumible por herramientas estándar como transformers, vLLM o llama.cpp, lo que reduce la portabilidad.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo día, lo que indica una adopción nula y ausencia de validación por parte de la comunidad.
- No se documentan idiomas soportados, longitud de contexto ni cuantizaciones disponibles, lo que dificulta planificar el despliegue.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo de este tamaño.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/larql/gemma-3-270m-it
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Runtime LARQL: https://github.com/chrishayuk/larql
- Especificación VINDEX3: https://vindex3.org
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
