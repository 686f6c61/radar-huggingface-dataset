# bmars8218/zils-mini-body-1

## Resumen

`bmars8218/zils-mini-body-1` es un modelo de lenguaje de 4.539.265.536 parámetros (aproximadamente 4,54 B) publicado por el usuario bmars8218 en HuggingFace. No se trata de un entrenamiento propio: la model card indica explícitamente que los pesos lingüísticos son una resubida sin modificar de `apertixai/cerno-4b-v1.2` en la revisión `e14dec9894c5afb761f90926f1c19b19938a271c`, publicado bajo licencia Apache 2.0. El único cambio introducido es la adición de la torre de visión (`model.visual.*`) de `Qwen/Qwen3.5-4B` en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, también Apache 2.0, para cumplir con el formato exigido por el «body» de Zils.

El modelo se presenta como una entrada «scout» al pool «d3-mini soup» de Zils, un mecanismo asociado al subnet 127 de Bittensor. Es decir, su función principal no es la de un modelo listo para producción, sino la de servir como cuerpo candidato dentro de un proceso de mezcla (soup) de pesos gestionado por esa red. El repositorio incluye un archivo `zils-owner.json` que identifica la hotkey que realiza el commit del body.

Por su naturaleza de resubida con una torre visual añadida, la relevancia práctica del modelo es limitada fuera del ecosistema Zils. Resulta útil, eso sí, como referencia para quienes necesiten un checkpoint multimodal de ~4,5 B parámetros con licencia Apache 2.0 y compatibilidad con `transformers`, o para estudiar cómo se ensamblan pesos de texto y visión de procedencias distintas en un único repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (pesos de texto de Cerno 4B v1.2) con torre de visión de Qwen3.5-4B añadida |
| Parámetros totales | 4.539.265.536 (≈4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones derivadas no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura del componente de texto corresponde a la de `apertixai/cerno-4b-v1.2`, un transformer de aproximadamente 4 B parámetros. La model card de este repositorio no describe la arquitectura interna, los datos de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; toda esa información remite a la model card del modelo original. El único elemento documentado aquí es la incorporación de la torre visual de `Qwen/Qwen3.5-4B`, añadida sin modificar y sin indicación de que se haya realizado un entrenamiento conjunto para alinear los espacios latentes de texto e imagen.

No se ha llevado a cabo ningún fine-tuning por parte de bmars8218: el repositorio se declara como «re-upload» y «scout entry». Por tanto, no hay innovaciones técnicas propias que destacar (ni decodificación especulativa, ni atención lineal, ni estrategias de mezcla documentadas más allá de la pertenencia al pool «soup» de Zils). Cualquier detalle sobre la composición del dataset o el proceso de entrenamiento del modelo base debe consultarse en la documentación de `apertixai/cerno-4b-v1.2`.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Cerno 4B v1.2, aunque no se detallan en esta model card.
- Procesamiento de visión: la torre visual de Qwen3.5-4B está presente en los pesos, pero no se documenta si el modelo ha sido entrenado para integrar esa información visual con el decodificador de texto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está relleno).
- Modo «thinking», audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de checkpoints multimodales ensamblados: el modelo sirve para probar cómo se comporta un decodificador de texto de 4 B con una torre visual añadida a posteriori, útil en investigación sobre alineamiento visión-lenguaje.
- Participación en el pool «d3-mini soup» de Zils (subnet 127 de Bittensor): el caso de uso declarado por el autor es servir como cuerpo candidato en el proceso de mezcla de pesos de esa red.
- Referencia para pipelines de `transformers`: al cargarse con la librería estándar y pesos safetensors, puede emplearse como ejemplo de estructura de repositorio con múltiples submodelos.
- Base para experimentos de fine-tuning multimodal: partiendo de pesos Apache 2.0, un equipo podría intentar alinear la torre visual con el decodificador de texto mediante entrenamiento supervisado.
- Pruebas de integración con endpoints compatibles: la etiqueta `endpoints_compatible` sugiere que el repositorio puede desplegarse en infraestructuras de inferencia compatibles con la API de HuggingFace.
- Auditoría de licencias y procedencia de pesos: útil como caso de estudio de resubidas que combinan obras de distintos autores bajo Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40 GB, H100 o L40S para FP16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con margen suficiente.
- GPU de consumo: cabe en GPUs consumer con 12 GB o más en cuantización de 8 bits; en 4 bits podría ejecutarse en tarjetas de 8 GB, siempre que la torre visual no incremente significativamente el uso de memoria.
- Opciones de despliegue: `transformers` (librería declarada), servidores compatibles con endpoints de HuggingFace; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bmars8218/zils-mini-body-1 | ≈4,54 B | no disponible | Apache 2.0 | HuggingFace | Resubida de Cerno 4B v1.2 con torre visual de Qwen3.5-4B |
| apertixai/cerno-4b-v1.2 | ≈4 B | no disponible | Apache 2.0 | HuggingFace | Modelo base original, solo texto |
| Qwen/Qwen3.5-4B | ≈4 B | no disponible | Apache 2.0 | HuggingFace | Fuente de la torre visual añadida |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido entrenado por el autor del repositorio; es una resubida, por lo que los sesgos y limitaciones son los del modelo base Cerno 4B v1.2 y los de la torre visual de Qwen3.5-4B.
- La torre visual se ha añadido «sin modificar» y sin evidencia de entrenamiento conjunto: es probable que la integración visión-lenguaje no funcione de forma coherente sin un fine-tuning adicional.
- No se documentan idiomas soportados, longitud de contexto ni comportamiento en tareas específicas, lo que impide garantizar su idoneidad en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de ~4 B.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia y las condiciones de las obras upstream (Cerno 4B v1.2 y Qwen3.5-4B).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- No debe tratarse como un modelo multimodal listo para usar: la presencia de pesos visuales no implica capacidad visual funcional.

## Enlaces

- [HuggingFace: bmars8218/zils-mini-body-1](https://huggingface.co/bmars8218/zils-mini-body-1)
- [Modelo base: apertixai/cerno-4b-v1.2 (revisión e14dec9)](https://huggingface.co/apertixai/cerno-4b-v1.2/tree/e14dec9894c5afb761f90926f1c19b19938a271c)
- [Fuente de la torre visual: Qwen/Qwen3.5-4B (revisión 851bf6e)](https://huggingface.co/Qwen/Qwen3.5-4B)
