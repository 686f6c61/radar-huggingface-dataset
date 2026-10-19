# prakhya15/OLMo-7B-CFG-GuacaMol-50k-2epoch

## Resumen

El modelo prakhya15/OLMo-7B-CFG-GuacaMol-50k-2epoch es un ajuste fino de OLMo-7B, el transformer decoder-only de Ai2, orientado a la generación condicional de moléculas en notación SMILES. Lo publica el usuario prakhya15 y emplea classifier-free guidance (CFG) junto con QLoRA, según el repositorio GitHub asociado, para aprender a generar moléculas condicionadas a propiedades químicas y conservar la generación incondicional mediante dropout de condicionamiento.

El identificador del modelo sugiere un entrenamiento sobre un subconjunto de GuacaMol de 50.000 ejemplos durante 2 epochs, aunque la model card no lo detalla. La relevancia principal es que ofrece una vía abierta para explorar generación molecular condicionada con un modelo de 7B y licencia Apache-2.0, un nicho donde muchas alternativas son modelos químicos especializados de menor tamaño o APIs cerradas.

Sin embargo, la ficha de Hugging Face está prácticamente vacía: no hay pipeline declarado, idiomas, benchmarks, formatos de pesos ni instrucciones de uso. Con 0 descargas y 0 likes en el momento de la consulta, debe tratarse como un experimento reproducible, no como un modelo validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OLMo-7B de Ai2) con ajuste QLoRA para generación condicional de SMILES |
| Parámetros totales | 7B (según el nombre del modelo; no confirmado en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible para inferencia; el repositorio GitHub asociado indica QLoRA, pero no se publican pesos cuantizados ni GGUF |
| Idiomas soportados | no disponible; el dominio principal es notación SMILES, no lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible; no se especifica si son pesos completos o adaptadores |

## Arquitectura y entrenamiento

La arquitectura de partida es OLMo-7B, un transformer decoder-only desarrollado por Ai2. No se documentan modificaciones estructurales; el ajuste se presenta como QLoRA, que congela los pesos del modelo base e introduce adaptadores de bajo rango, y CFG, que entrena con dropout aleatorio de la condición para permitir combinar en inferencia la distribución condicionada y la incondicional. Esa combinación es la que da control sobre la adherencia a la propiedad objetivo frente a la diversidad.

La model card no aporta número de tokens, composición del dataset, propiedades usadas como condición, hiperparámetros, ni si hubo RLHF/DPO. El nombre indica GuacaMol-50k y 2 epochs, y el repositorio asociado confirma QLoRA para generación molecular condicionada, pero no se detallan ni la partición train/validation/test ni las métricas de validación química. No se han publicado resultados de evaluación.

## Capacidades

- Generación de SMILES condicionada a propiedades moleculares. El repositorio asociado describe condicionamiento por propiedades, pero no se enumeran cuáles.
- Generación incondicional de moléculas gracias al dropout de condicionamiento durante el entrenamiento.
- Ajuste eficiente con QLoRA sobre OLMo-7B; el modelo base queda congelado y se entrenan adaptadores.
- No se documenta tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documentan capacidades multilingües; la salida es notación química SMILES, no texto general.
- Puede combinarse con RDKit u otras librerías de quimioinformática para validar y filtrar moléculas, aunque esa integración no forma parte del modelo.

## Casos de uso

- Generación de candidatos con propiedades objetivo: se fija una propiedad incluida en el ajuste (no documentada) como condición y se muestrean SMILES con distintos valores de escala CFG; después se validan con RDKit y se rankean. Es adecuado porque el ajuste está pensado para condicionamiento, pero la propiedad no se garantiza.
- Optimización de leads: generar análogos alrededor de un hit y filtrar por similitud de scaffold, propiedad calculada y accesibilidad sintética; el CFG permite explorar el compromiso entre novedad y adherencia a la condición.
- Aumento de datos para modelos QSAR: generar moléculas condicionadas a rangos de propiedad y añadirlas a un conjunto de entrenamiento tras validación química; útil cuando hay pocos datos, aunque hay que controlar el sesgo introducido.
- Exploración del espacio químico: barrido de escala CFG para producir desde muestras diversas hasta muestras más alineadas con la condición; sirve para estudiar el trade-off entre diversidad y calidad.
- Baseline académico: comparar las variantes 50k, 250k y 500k del mismo autor para estudiar el efecto del tamaño de los datos de ajuste en generación molecular condicionada.
- Generación de librerías virtuales para cribado: producir SMILES, filtrar por reglas de drug-likeness y enviar los candidatos a docking o a modelos de predicción de propiedades; un modelo de 7B puede ejecutarse en una GPU consumer en 4 bits.
- Ajuste posterior a propiedades propietarias: partir de OLMo-7B y reproducir el esquema QLoRA+CFG con datos internos; el repositorio público sirve como referencia de implementación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de validez molecular, diversidad, QED, SAS, éxito de docking ni comparaciones con modelos de generación molecular. Tampoco se aportan resultados de MMLU, HumanEval o GSM8K, que no serían representativos para este dominio.

## Requisitos de hardware

- Pesos en FP16/BF16: aproximadamente 14 GB solo para los parámetros de 7B; con caché KV y activaciones, una GPU de 24 GB puede quedarse corta para contextos largos. Se recomienda A100 40/80 GB, H100 80 GB o RTX 4090 24 GB con contexto moderado.
- 8 bits: aproximadamente 7 GB de pesos; cabe en RTX 3090/4090 24 GB, RTX 4080 16 GB con margen ajustado y A100 40 GB.
- 4 bits: aproximadamente 3,5-4 GB de pesos; cabe en RTX 4060 Ti 16 GB, RTX 4070 12 GB, RTX 3090/4090 24 GB y GPUs de 8-12 GB con contexto corto. Son estimaciones generales para un modelo de 7B, no medidas en este repositorio.
- Despliegue: Hugging Face Transformers con PEFT si se publica como adaptador; fusión de LoRA y vLLM/TGI para serving; llama.cpp/Ollama solo si se convierte a GGUF. No se confirma que existan pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ajuste | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| OLMo-7B-CFG-GuacaMol-50k-2epoch | 7B | no disponible | GuacaMol 50k, 2 epochs (según nombre) | Apache-2.0 | Hugging Face | no disponible |
| OLMo-7B-CFG-GuacaMol-250k | 7B | no disponible | GuacaMol 250k | no disponible | Hugging Face | no disponible |
| OLMo-7B-CFG-GuacaMol-500k | 7B | no disponible | GuacaMol 500k | no disponible | Hugging Face | no disponible |
| OLMo-7B base (Ai2) | 7B | no disponible | preentrenamiento general | no disponible en la búsqueda | Ai2/GitHub | no disponible |

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos, propiedades objetivo, hiperparámetros, particiones ni métricas. La reproducibilidad es limitada.
- Sin benchmarks publicados; no se puede afirmar que las moléculas generadas sean válidas, diversas, sintetizables o mejores que alternativas.
- Riesgo de generar SMILES inválidos o químicamente implausibles; es obligatorio validar con RDKit/Open Babel y aplicar filtros de validez, aromaticidad, valencia y estabilidad.
- El condicionamiento CFG sesga la generación, pero no garantiza el cumplimiento de la propiedad; hay que predecirla con un modelo externo.
- El ajuste sobre 50k ejemplos y 2 epochs puede tener cobertura limitada y sobreajuste; no se documenta.
- Idiomas no disponibles; OLMo base está orientado a inglés, pero aquí la interfaz principal es SMILES.
- Licencia Apache-2.0 permite uso comercial con conservación de avisos, pero no se aclaran las obligaciones de los datos de GuacaMol ni de los pesos base.
- Uso dual: la generación de moléculas puede aplicarse a diseño de compuestos tóxicos o peligrosos; no se documentan filtros de seguridad.
- Metadatos anómalos: 0 descargas, 0 likes y fecha de creación 2026-10-18, posterior a la fecha de consulta; indica baja madurez o posible error de publicación.

## Enlaces

- [Hugging Face del modelo](https://huggingface.co/prakhya15/OLMo-7B-CFG-GuacaMol-50k-2epoch)
- [Modelo hermano 250k](https://huggingface.co/prakhya15/OLMo-7B-CFG-GuacaMol-250k/tree/main)
- [Modelo hermano 500k](https://huggingface.co/prakhya15/olmo-7b-cfg-guacamol-500k/tree/main)
- [Repositorio Olmo_CFG en GitHub](https://github.com/gotnochill815-web/Olmo_CFG)
- [Página de OLMo en Ai2](https://allenai.org/olmo)
- [Repositorio allenai/OLMo](https://github.com/allenai/OLMo)

No se han encontrado papers, demos o blogs adicionales en la búsqueda web proporcionada.
