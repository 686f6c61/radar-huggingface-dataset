# bratao/portugueseT5

## Resumen

`portugueseT5` es un checkpoint de investigacion de tipo encoder-decoder basado en la arquitectura T5, preentrenado desde cero para el portugues. Lo desarrolla Bruno Souza Cabral en el marco de su tesis doctoral en la Universidade Federal da Bahia (UFBA), dentro del proyecto Portuguese-OpenIE. El modelo replica la configuracion de `google/t5-v1_1-large`, con 24 capas de encoder y 24 de decoder y activaciones GEGLU, sumando 783.150.080 parametros (aproximadamente 783M, aunque la tesis redondea a 770M).

El checkpoint se preentreno sobre una muestra del 20% del corpus GigaVerbo y esta pensado como artefacto intermedio para tareas de procesamiento de lenguaje natural en portugues, especialmente extraccion abierta de informacion (OpenIE). No es un modelo listo para produccion: carece de un contrato de tarea definido, de evaluacion publica y de licencia declarada. Su relevancia reside en ser una base preentrenada especifica para portugues, util para fine-tuning en tareas downstream, y en servir de punto de partida para los modelos `PortugueseT5Oie` y `PortugueseT5OieAbstractive`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (basada en `google/t5-v1_1-large`), 24 capas encoder y 24 decoder, GEGLU |
| Parametros totales | 783.150.080 (aproximadamente 783M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica en la informacion publicada) |
| Tipos de cuantizacion | bfloat16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | Portugues (pt) |
| Licencia | No declarada (ausencia de licencia en el repositorio publico) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 v1.1 large: un encoder y un decoder con 24 capas cada uno, utilizando activaciones GEGLU en lugar de ReLU, y sin capas de bias en las normalizaciones. Se trata de un transformer encoder-decoder clasico, entrenado con el objetivo de denoising de span (masked span prediction), tal como se describe en el articulo original de T5.

El preentrenamiento se realizo desde cero sobre una muestra del 20% del corpus GigaVerbo, segun indica la tesis doctoral. No se publican detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset, ni el uso de tecnicas como RLHF o DPO. El repositorio no declara un identificador de dataset en Hugging Face ni incluye el corpus. El checkpoint es un artefacto intermedio, no un modelo afinado para ninguna tarea concreta.

## Capacidades

- Generacion de texto a texto (text2text) en portugues, dado que es un modelo T5 preentrenado.
- No tiene un contrato de instrucciones, preguntas-respuestas, resumen ni extraccion de informacion definido; el checkpoint base no responde a prompts de forma predecible.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma nativa.
- Capacidad multilingue limitada al portugues; no se ha evaluado en otros idiomas.
- No dispone de capacidades especiales como vision, audio o modo thinking.
- Puede servir como base para fine-tuning en tareas de PLN en portugues, como extraccion abierta de informacion, resumen, generacion de texto, etc.

## Casos de uso

- Fine-tuning para extraccion abierta de informacion (OpenIE) en portugues: el modelo es la base de los checkpoints `PortugueseT5Oie` y `PortugueseT5OieAbstractive`, que implementan la tarea de OpenIE mediante un prompt especifico. Se usaria para extraer relaciones semanticas de oraciones en portugues.
- Investigacion academica en PLN para portugues: sirve como punto de partida para estudiar el comportamiento de modelos T5 preentrenados en un idioma de bajos recursos relativos, comparando con alternativas multilingues.
- Preentrenamiento continuado o adaptacion a dominios especificos (juridico, medico, etc.) mediante fine-tuning sobre corpus especializados.
- Generacion de texto controlada en portugues: tras un afinamiento con datos de la tarea, puede emplearse para resumen, parafraseo o generacion de respuestas en entornos de investigacion.
- Evaluacion de tecnicas de preentrenamiento: al ser un checkpoint intermedio, permite analizar el impacto de la arquitectura T5 en portugues frente a modelos entrenados con otros objetivos o corpus.
- Desarrollo de sistemas de extraccion de informacion estructurada: combinado con pipelines de postprocesado, puede alimentar bases de conocimiento o grafos de conocimiento a partir de texto en portugues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe ninguna metrica de evaluacion intrinseca o downstream atribuible a este checkpoint base. Las metricas reportadas para los modelos de la familia `PortugueseT5Oie` no deben transferirse a este artefacto. Se recomienda evaluar el modelo para cada tarea especifica antes de cualquier uso.

## Requisitos de hardware

- Peso de los parametros en bfloat16: aproximadamente 1.57 GB (segun la model card); el tamano total del repositorio en Hugging Face es de 4.7 GB, probablemente incluyendo otros archivos.
- Memoria RAM/VRAM estimada: entre 4 y 6 GB como punto de partida practico, segun la model card; el consumo real depende de la longitud de entrada y generacion, del runtime y del dispositivo.
- GPU recomendada: no se especifica ninguna en particular; para inferencia a gran escala se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores). Para entrenamiento o fine-tuning serian necesarias GPUs con mayor capacidad (A100, H100, etc.), aunque no se documenta.
- El modelo puede ejecutarse en CPU para pruebas pequenas, aunque con mayor latencia.
- Opciones de despliegue: compatible con la libreria Transformers de Hugging Face, y los tags indican compatibilidad con text-generation-inference y endpoints. No se mencionan vLLM, Ollama ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo para este checkpoint. Como referencia de alternativas en portugues:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `bratao/portugueseT5` | 783M | No disponible | No declarada | Checkpoint base de investigacion, preentrenado en 20% de GigaVerbo |
| `unicamp-dl/PTT5` | No disponible (basado en T5) | No disponible | No disponible | T5 adaptado al portugues brasileño, entrenado sobre BrWac |
| `bratao/PortugueseT5Oie` | Derivado de portugueseT5 | No disponible | No declarada | Modelo afinado para extraccion abierta de informacion |

No se conocen modelos comparables del mismo tamano con evaluaciones publicas en portugues. La comparativa se limita a la disponibilidad y al proposito declarado.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede copiar, modificar ni redistribuir sin autorizacion explicita del autor. Es imprescindible obtener aclaracion antes de cualquier uso.
- No existe un contrato de tarea estable: el checkpoint base no tiene un formato de instruccion, QA, resumen ni OpenIE definido. Los resultados de generacion no son fiables sin fine-tuning.
- Sin evaluacion publica: no hay metricas de rendimiento, declaracion de finalizacion del modelo ni receta de entrenamiento detallada en el repositorio.
- Riesgo de alucinacion y de generacion de contenido incorrecto, sesgado o inseguro: el modelo no ha sido auditado para sesgos demograficos ni para usos de alto impacto.
- Limitaciones de idioma: solo portugues; no se ha evaluado su comportamiento en otros idiomas.
- Es un checkpoint intermedio, no un modelo listo para produccion. Su uso en entornos reales requiere fine-tuning y evaluacion especifica.
- La longitud de contexto no esta documentada; se desconoce si soporta secuencias largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bratao/portugueseT5
- Proyecto Portuguese-OpenIE: https://github.com/FORMAS/Portuguese-OpenIE
- Articulo PortNOIE (PROPOR 2022): https://doi.org/10.1007/978-3-030-98305-5_23
- Tesis doctoral (referencia): Cabral, Bruno Souza. "Evolving Open Information Extraction for Portuguese employing Language Models", UFBA, 2025.
- Repositorio PTT5 (alternativa): https://github.com/unicamp-dl/PTT5
