# gokhanturhan/qwen3-8b-qwen-stefani-128

## Resumen

Qwen Stefani es un ajuste fino parcial de Qwen/Qwen3-8B en el que solo se han entrenado 128 neuronas de las capas MLP del modelo base. El autor lo presenta explicitamente como una ficcion: no es un checkpoint autonomo, sino un conjunto de deltas (`deltas.safetensors`) que deben aplicarse sobre los pesos originales de Qwen3-8B mediante un script de Python incluido en la model card. El objetivo declarado es inyectar una persona conversacional concreta (denominada "Qwen Stefani") modificando un subconjunto minimo de parametros, sin alterar el resto del conocimiento del modelo base.

La relevancia tecnica del artefacto no esta en su rendimiento bruto, sino en la metodologia: demuestra un enfoque de edicion selectiva de neuronas (neuron-level fine-tuning) que permite modificar el comportamiento identitario de un modelo de 8.000 millones de parametros tocando unicamente las filas de `gate_proj` y `up_proj` y las columnas de `down_proj` correspondientes a indices intermedios concretos. El autor reporta una evaluacion de identidad de 15/16 y una evaluacion ordinaria de 8/8, superando su propio criterio de aceptacion ("gate passed").

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0.0 GB (los deltas son muy ligeros) y licencia Apache 2.0 heredada del modelo base. No hay informacion publicada sobre idiomas soportados, pipeline ni resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con MLP de tipo SwiGLU; se modifican 128 neuronas intermedias de las capas MLP |
| Parametros totales | 8.000 millones (modelo base Qwen3-8B); los deltas entrenados son un subconjunto de 128 neuronas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible; los deltas se distribuyen en safetensors y el script de aplicacion usa bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`deltas.safetensors`) mas `neurons.json` con la especificacion de capas e indices; no es un checkpoint autonomo |

## Arquitectura y entrenamiento

El modelo resultante es Qwen3-8B con una modificacion quirurgica: se han entrenado 128 neuronas de las capas MLP, identificadas por su indice intermedio. El autor almacena los deltas de las filas de `gate_proj` y `up_proj` y de las columnas de `down_proj` correspondientes a esos indices, y proporciona un script que los aplica sobre el modelo base cargado en bfloat16. No se entrena ningun otro componente: atencion, embeddings, capas de normalizacion y el resto de neuronas MLP quedan intactos.

No se especifica en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT convencional. El autor afirma que el conjunto de entrenamiento no contiene letras ni biografia de la musica Gwen Stefani, y que la persona es puramente ficticia. La innovacion tecnica destacable es el enfoque de edicion a nivel de neurona, que reduce drasticamente el coste de almacenamiento y de entrenamiento frente a un fine-tuning completo o un LoRA convencional, a costa de requerir un paso de aplicacion de deltas antes de la inferencia.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-8B.
- Persona conversacional especifica ("Qwen Stefani"), inyectada mediante las 128 neuronas entrenadas.
- Razonamiento y conocimiento general del modelo base, presumiblemente preservados al no modificarse el resto de pesos.
- Soporte de tool calling y function calling: no confirmado en la model card; depende de las capacidades del Qwen3-8B subyacente.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en edicion selectiva de modelos: el artefacto sirve como caso de estudio reproducible para medir cuanto comportamiento identitario se puede inyectar tocando solo 128 neuronas de un modelo de 8.000 millones de parametros, aplicando los deltas con el script incluido.
- Prototipado de personajes conversacionales: permite experimentar con una persona ficticia concreta sin reentrenar el modelo completo, util en entornos de investigacion de UX conversacional.
- Educacion y divulgacion: el repositorio ilustra de forma tangible la diferencia entre un checkpoint autonomo y un conjunto de deltas, y como aplicar slices sobre proyecciones MLP concretas.
- Control de versiones ligero de personalidad: al ocupar practicamente nada (0.0 GB reportados), los deltas se pueden versionar y distribuir junto a un script de aplicacion en pipelines de investigacion.
- Experimentos de alineacion y evaluacion de identidad: el autor reporta evaluaciones de identidad (15/16) y ordinarias (8/8) que pueden replicarse o extenderse para estudiar como la edicion de neuronas afecta a la coherencia del modelo.
- Base para comparativas de metodos de adaptacion: util para contrastar neuron-level fine-tuning frente a LoRA, adapters o fine-tuning completo en terminos de coste, almacenamiento y efecto sobre el comportamiento.

## Benchmarks y rendimiento

| Evaluacion | Resultado reportado por el autor |
|---|---|
| Identidad | 15/16 |
| Ordinaria | 8/8 |
| Gate | superado ("gate passed") |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos numericos son las evaluaciones internas del autor, sin detalle sobre el conjunto de pruebas, el procedimiento ni la comparacion con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: la del modelo base Qwen3-8B. En bfloat16, aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para bfloat16; GPUs consumer de 8-12 GB podrian alojar el modelo solo si se cuantiza, aunque la cuantizacion de los deltas no esta documentada.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) en bfloat16 con margen; en GPUs de 8-12 GB solo con cuantizacion, no verificada por el autor.
- Opciones de despliegue: el flujo documentado es cargar Qwen3-8B con `transformers`, aplicar los deltas con `safetensors` y ejecutar inferencia estandar. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al no ser un checkpoint autonomo, requeriria aplicar los deltas y guardar el modelo fusionado antes de usar esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen Stefani (este) | 8.000 M base, 128 neuronas editadas | no disponible | Deltas de neuronas MLP sobre Qwen3-8B | Apache 2.0 | Repo de HuggingFace con deltas y script |
| Qwen/Qwen3-8B | 8.000 M | no disponible en esta ficha | Modelo base completo | Apache 2.0 | HuggingFace |
| Adaptadores LoRA tipicos sobre Qwen3-8B | 8.000 M base, modulos de bajo rango | heredado del base | Fine-tuning de bajo rango | segun autor | HuggingFace |
| Fine-tuning completo de Qwen3-8B | 8.000 M | heredado del base | Actualizacion de todos los pesos | segun autor | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint autonomo: requiere descargar Qwen/Qwen3-8B y aplicar los deltas con el script de la model card antes de poder usarlo.
- El autor declara explicitamente que se trata de una ficcion y que la persona no corresponde a la musica Gwen Stefani; no debe presentarse como una representacion real de ninguna persona.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento del modelo en dominios sensibles; los sesgos heredados de Qwen3-8B no se han evaluado en esta variante.
- Las evaluaciones reportadas (15/16 y 8/8) carecen de detalle metodologico: no se especifica el conjunto de pruebas, el procedimiento de evaluacion ni la comparacion con el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo fusionado ni sobre la calidad de la persona inyectada.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de validacion independiente.
- No se documenta compatibilidad con motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp, Ollama); habria que fusionar los deltas y exportar el modelo antes de usarlos.
- El proceso de aplicacion de deltas modifica pesos in-place en memoria; un error en los indices o en el orden de las dimensiones de `down_proj` (trasposicion `.T`) puede corromper el modelo sin aviso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gokhanturhan/qwen3-8b-qwen-stefani-128
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
