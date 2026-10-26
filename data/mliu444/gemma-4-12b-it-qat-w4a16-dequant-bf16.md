# mliu444/gemma-4-12b-it-qat-w4a16-dequant-bf16

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una reconversión de pesos: `mliu444/gemma-4-12b-it-qat-w4a16-dequant-bf16` toma el checkpoint oficial `google/gemma-4-12B-it-qat-w4a16-ct` (Gemma 4 12B instruct, cuantizado con Quantization-Aware Training a int4 con activaciones de 16 bits) y deshace la cuantización para publicar un checkpoint denso en bfloat16. El objetivo declarado es que un ajuste fino (por ejemplo, un LoRA) se entrene contra exactamente los mismos valores que el kernel W4A16 multiplica en producción, de modo que el modelo ajustado y el que sirve vLLM partan de la misma base numérica.

El modelo es multimodal de tipo image-text-to-text, con arquitectura `Gemma4UnifiedForConditionalGeneration` densa: 3.840 dimensiones ocultas, MLP de 15.360 y 11.959.730.224 parámetros (11,96 mil millones) según los safetensors. La conversión afecta a 328 capas lineales cuantizadas (q/k/v/o de atención y gate/up/down del MLP de cada capa del decodificador); los 349 tensores restantes (embedder de visión, embeddings, normas, escalares de capa) se copian sin cambios desde el checkpoint QAT, y el `lm_head` se elimina porque los embeddings están atados.

Su relevancia es práctica y acotada: permite investigar y ajustar el modelo sobre pesos bf16 sin depender de kernels de cuantización, y auditar la degradación introducida por int4 comparando ambas versiones. Es un artefacto de la comunidad, con 0 descargas y 0 likes en el momento de la consulta, creado el 25 de octubre de 2026, y con una validación todavía incompleta (falta la comparación de log-probabilidades en vLLM que sí se hizo para la variante de 31B).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Gemma4UnifiedForConditionalGeneration`, transformer denso (decodificador con embedder de visión); 3.840 de dimensión oculta, MLP 15.360 |
| Parámetros totales | 11.959.730.224 (11,96 mil millones, dato de safetensors) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | el repositorio publica únicamente bf16 (descuantizado); el checkpoint de origen usa compressed-tensors `pack-quantized`, int4 simétrico, grupo de 32 en la dimensión de entrada, una escala bf16 por grupo, sin punto cero (W4A16) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | declarada como apache-2.0 en las etiquetas, con `license_link` a la licencia de Gemma 4 de Google (discrepancia a revisar) |
| Formato de pesos | safetensors, 5 shards, 23,9 GB (repo de 24,0 GB); `quantization_config` eliminado de `config.json`; tokenizer, plantilla de chat, processor y configs de generación copiados sin cambios |

## Arquitectura y entrenamiento

La arquitectura es la del Gemma 4 Unified: un decodificador transformer denso con atención y MLP por capa, más un embedder de visión que habilita la entrada image-text-to-text. En el checkpoint descuantizado, las 328 capas lineales cuantizadas del origen (atención q/k/v/o y MLP gate/up/down de cada capa) almacenan `W = q × scale` calculado en fp32 y guardado en bf16, donde cada producto es exacto; los valores int4 desempaquetados quedan verificados en `[-8, 7]` contra `unpack_from_int32` de `compressed_tensors`. Los 10 tensores del embedder de visión conservan los nombres del checkpoint QAT y Transformers los renombra al cargar mediante su tabla interna (`vision_embedder.* -> embed_vision.*`); el conjunto resultante reproduce los 667 nombres y formas de parámetros del modelo de lenguaje.

Este repositorio no aporta entrenamiento propio: es una transformación determinista del checkpoint `google/gemma-4-12B-it-qat-w4a16-ct`, que a su vez incorpora Quantization-Aware Training sobre el modelo instruct. Por tanto, el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO u otras etapas de alineación, y cualquier innovación de decodificación del modelo original no están disponibles en la información proporcionada. El script de conversión citado es `env/dequant_qat.py`, el mismo procedimiento aplicado a la variante de 31B.

## Capacidades

- Generación de texto conversacional en formato instruct (etiqueta `conversational` y plantilla de chat incluida sin modificaciones).
- Entrada multimodal image-text-to-text: el checkpoint conserva el embedder de visión completo, por lo que admite imágenes junto a texto.
- Ajuste fino sobre pesos bf16: caso de uso explícito del autor, pensado para que un LoRA entrene contra la misma base numérica que sirve el modelo QAT en vLLM.
- Inferencia estándar con Transformers (librería declarada) y con vLLM 0.19.1 aplicando los overrides indicados por el autor.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repo).
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada (solo se documenta visión).

## Casos de uso

- Ajuste fino con LoRA o QLoRA coherente con producción: entrenar sobre este checkpoint bf16 garantiza que los pesos vistos en entrenamiento coinciden con los que el kernel W4A16 multiplica al servir el modelo QAT, lo que elimina el desajuste habitual entre entrenamiento y despliegue.
- Auditoría de cuantización: ejecutar el mismo prompt sobre este bf16 y sobre el int4 original para medir la degradación real (perplejidad, exactitud en tareas concretas) antes de adoptar W4A16 en un servicio.
- Despliegue en entornos sin kernels de cuantización: si la infraestructura no soporta compressed-tensors o el runtime no incluye el kernel W4A16, este checkpoint carga como un modelo denso bf16 convencional en Transformers.
- Servicio multimodal de preguntas sobre imagen (VQA, extracción de campos de documentos escaneados, descripción de capturas) usando el pipeline image-text-to-text.
- Generación de datos sintéticos y destilación: producir pares imagen-texto o texto-texto a partir de un modelo cuyo comportamiento numérico es idéntico al que se servirá después en cuantizado.
- Reproducibilidad de experimentos: al no haber `quantization_config` en `config.json`, la carga es determinista y no depende de la versión del plugin de cuantización, lo que simplifica la replicación en investigación.
- Integración como referencia en pipelines de evaluación: servir la versión bf16 como "techo" de calidad frente a la versión int4 en pruebas A/B de un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta validaciones estructurales y numéricas de la conversión: coincidencia bit a bit del desempaquetado con `compressed_tensors` en tensores muestreados, rango de valores int4 en `[-8, 7]`, y equivalencia de los 667 nombres y formas de parámetros del modelo de lenguaje. Queda pendiente, según el propio autor, la comparación de log-probabilidades de prompt en vLLM contra el checkpoint QAT.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos suman 23,9 GB, por lo que se necesitan aproximadamente 24 GB solo para pesos y del orden de 28-34 GB contando caché KV y activaciones, según longitud de contexto y tamaño de lote.
- GPU de un solo dispositivo: A100 40 GB, H100 80 GB, L40S 48 GB o RTX A6000 48 GB cubren el modelo con margen; una RTX 4090 de 24 GB queda justo o insuficiente para bf16 con contexto largo.
- Consumer GPU: no cabe en una GPU de consumo de 24 GB en bf16 con contexto apreciable; requiere sharding en varias GPU (por ejemplo, dos RTX 4090) o recurrir a una cuantización adicional que este repositorio no incluye.
- Formatos alternativos: no se publican GGUF ni otras cuantizaciones en el repo; para llama.cpp u Ollama habría que convertir y cuantizar por cuenta propia.
- Opciones de despliegue: Transformers (librería declarada) y vLLM 0.19.1, en este último caso con `--hf-overrides '{"architectures": ["Gemma4ForCausalLM"], "model_type": "gemma4"}'`, el mismo override que usa el runner oficial del modelo QAT de 12B.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `mliu444/gemma-4-12b-it-qat-w4a16-dequant-bf16` (este) | 11,96 mil M | safetensors bf16, 23,9 GB, 5 shards | no disponible | apache-2.0 declarada, enlace a licencia Gemma 4 | repack de la comunidad, 0 descargas, validación en vLLM pendiente |
| `google/gemma-4-12B-it-qat-w4a16-ct` (origen) | 11,96 mil M (misma topología) | compressed-tensors int4 W4A16, grupo 32 | no disponible | licencia de Gemma 4 | oficial de Google, requiere kernel W4A16 |
| Variante de 31B descuantizada (mismo autor) | no disponible en la información proporcionada | safetensors bf16 | no disponible | no disponible | mismo procedimiento `env/dequant_qat.py`, con validación en vLLM ya realizada según el autor |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación de rendimiento con alternativas de otros fabricantes; la comparación anterior se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo entrenado ni una versión oficial de Google: es una conversión de pesos de la comunidad, con 0 descargas y 0 likes, sin revisión por pares.
- Validación incompleta: falta la comparación de log-probabilidades en vLLM frente al checkpoint QAT, por lo que no hay garantía empírica de equivalencia funcional en serving, solo estructural y numérica del desempaquetado.
- Licencia ambigua: las etiquetas declaran apache-2.0, pero el `license_link` apunta a la licencia de Gemma 4 de Google, que impone sus propios términos de uso (incluidas restricciones de uso aceptable). Verificar antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; son los heredados del modelo instruct de origen, sobre los que este repositorio no aporta evaluación.
- Cobertura de idiomas no declarada: no se indica qué idiomas soporta, lo que impide asumir un comportamiento multilingüe concreto.
- Longitud de contexto no documentada: no se puede planificar el dimensionado de caché KV ni casos de contexto largo sin consultar la documentación del modelo base.
- Coste de hardware: en bf16 ocupa 23,9 GB de pesos, lo que descarta GPU de consumo de 24 GB para uso práctico y encarece el ajuste fino frente a la variante int4.
- Requiere overrides específicos en vLLM 0.19.1 (`Gemma4ForCausalLM`, `model_type: gemma4`); otras versiones o runtimes pueden no cargar la arquitectura `gemma4_unified` correctamente.
- Los embeddings están atados y el `lm_head` se ha eliminado: herramientas que esperen un `lm_head` explícito pueden fallar al inspeccionar el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mliu444/gemma-4-12b-it-qat-w4a16-dequant-bf16
- Modelo base (checkpoint QAT oficial): https://huggingface.co/google/gemma-4-12B-it-qat-w4a16-ct
- Licencia de Gemma 4 referenciada por el autor: https://ai.google.dev/gemma/docs/gemma_4_license
- Script de conversión citado en la model card: `env/dequant_qat.py` (incluido en el repositorio; no se ha localizado una URL independiente)
- Las búsquedas web realizadas no devolvieron ningún resultado relevante sobre este modelo: los enlaces obtenidos eran contenido no relacionado y se han descartado. No hay papers, blogs ni demos adicionales disponibles en la información proporcionada.
