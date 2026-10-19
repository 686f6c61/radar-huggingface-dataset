# jacob-ml/Jacob-2-E4B-prod

## Resumen

Jacob-2-E4B-prod es un modelo de generación de texto publicado por el usuario jacob-ml en HuggingFace. No se trata de un entrenamiento desde cero: es el resultado de fusionar (merge) un adaptador LoRA sobre el modelo `google/gemma-4-E4B-it` y cuantizar después el resultado a FP8 para su despliegue con vLLM. El adaptador de origen es `jacob-ml/Jacob-2-E4B`, con r=16 y alpha=16 aplicado sobre las proyecciones de atención y MLP del modelo de lenguaje.

El modelo pesa 7.941.100.874 parámetros totales según los tensores en safetensors, lo que lo sitúa en la franja de 8.000 millones. El repositorio ocupa 19,5 GB, un tamaño notablemente superior al de un checkpoint FP8 puro, lo que sugiere que incluye artefactos adicionales además de los pesos cuantizados.

Su relevancia es operativa más que de investigación: ofrece un artefacto listo para servir con vLLM mediante el formato compressed-tensors, sin necesidad de flags adicionales, y con el `lm_head` conservado en alta precisión. La ficha del autor no documenta el conjunto de datos de entrenamiento del LoRA, los idiomas soportados ni resultados de evaluación, por lo que cualquier decisión de adopción debe basarse en pruebas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (inferido del modelo base declarado y del tag `gemma4`; la model card no detalla la arquitectura interna) |
| Parámetros totales | 7.941.100.874 (≈ 7,94 mil millones, dato real de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 `float8_e4m3fn`, per-tensor dinámico en pesos y activaciones (llmcompressor / compressed-tensors); `lm_head` en alta precisión |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en la model card) |
| Formato de pesos | safetensors con formato compressed-tensors (FP8) |
| Modelo base | google/gemma-4-E4B-it |
| Adaptador fusionado | jacob-ml/Jacob-2-E4B (LoRA r=16, alpha=16, atención + proyecciones MLP), fusionado en bf16 |
| Pipeline | text-generation |
| Tamaño del repositorio | 19,5 GB |
| Descargas / likes | 80 / 0 (en el momento de la consulta) |
| Fecha de creación / actualización | 2026-10-14 / 2026-10-18 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de identificarlo como `google/gemma-4-E4B-it`. Por el nombre y la etiqueta `gemma4` se deduce que pertenece a la familia Gemma 4 de Google, pero no se especifican número de capas, dimensión oculta, tipo de atención ni mecanismos alternativos (MoE, SSM o híbridos). Tampoco se aclara qué significa la designación "E4B" del checkpoint original ni si implica un número reducido de parámetros activos; el dato disponible de safetensors es de 7,94 mil millones de parámetros totales.

En cuanto al entrenamiento, lo único documentado es el proceso de adaptación: un LoRA de rango 16 y alpha 16 aplicado sobre las proyecciones de atención y MLP del modelo de lenguaje, fusionado en bf16 sobre los pesos base. No se indica el corpus utilizado, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO específicas para este adaptador. La parte instructiva procede del modelo base `-it`. La innovación técnica destacable es puramente de despliegue: cuantización FP8 per-tensor dinámica generada con llmcompressor en formato compressed-tensors, con el `lm_head` preservado en alta precisión para no degradar la distribución de salida del vocabulario.

## Capacidades

- Generación de texto conversacional y continuación de texto, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Instrucciones de seguimiento conversacional heredadas del modelo base `-it` de Google.
- Despliegue directo en vLLM: el servidor autodetecta la configuración FP8 de compressed-tensors sin flags adicionales.
- Inferencia en FP8 con activaciones dinámicas, orientada a reducir huella de memoria y aumentar throughput frente a bf16.
- Capacidades de tool calling / function calling: no documentadas en la model card; no verificadas.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo "thinking", visión o audio: no documentados.
- Cobertura multilingüe: no documentada (el campo de idiomas del repositorio no está cumplimentado).

## Casos de uso

- Atención al cliente automatizada: al ser un modelo conversacional afinado sobre una base instructiva de ~8.000 millones, puede gestionar diálogos multi-turno en un servicio de soporte; el despliegue en vLLM con FP8 permite atender varias conversaciones concurrentes en una sola GPU.
- Asistente interno de documentación: generación de borradores y respuestas sobre manuales corporativos dentro de un pipeline RAG, usando el modelo como generador final tras la recuperación de fragmentos.
- Backend de chat en productos SaaS: el formato compressed-tensors permite servir el modelo con `vllm serve jacob-ml/Jacob-2-E4B-prod` sin configuración extra, lo que simplifica el aprovisionamiento en Kubernetes o en instancias cloud con GPU.
- Procesamiento por lotes de textos: resumen, reescritura y normalización de grandes volúmenes de documentos aprovechando el throughput de FP8 en GPUs con soporte nativo (Ada Lovelace o Hopper).
- Generación de contenido asistida: redacción de correos, descripciones de producto y textos de marketing con revisión humana posterior, dado el carácter conversacional del modelo.
- Prototipado e investigación: evaluación de la degradación introducida por la cuantización FP8 frente al modelo base en bf16 sobre un conjunto de validación propio, al ser un artefacto derivado y versionado con licencia permisiva.
- Sustitución de modelos mayores en entornos con VRAM limitada: al caber en GPUs de consumo de 16-24 GB, permite montar entornos de desarrollo y staging sin acceso a A100/H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad tras el merge del LoRA o la cuantización FP8, y los resultados de búsqueda web consultados no contienen información técnica sobre este modelo.

## Requisitos de hardware

- Pesos en FP8: aproximadamente 7,4 GiB (7.941.100.874 bytes), calculado a partir del número de parámetros y del tamaño de `float8_e4m3fn`. El `lm_head` en alta precisión añade una fracción adicional.
- VRAM estimada para inferencia: del orden de 10-12 GB con contexto moderado, sumando pesos, caché KV y overhead del runtime. Es una estimación propia a partir del tamaño del modelo, no un dato publicado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) y RTX 4060 Ti (16 GB). En tarjetas de 12 GB el margen para caché KV es reducido.
- GPU recomendadas: H100, L40S y A100 para producción con FP8 nativo; RTX 4090 y RTX 4080 para desarrollo. Para aprovechar la ruta FP8 conviene hardware Ada Lovelace o Hopper.
- Opciones de despliegue: vLLM es la vía documentada por el autor. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia no soportada oficialmente. TGI no está documentado para este artefacto.
- Latencia y throughput: no disponibles.
- Nota sobre el tamaño del repositorio: los 19,5 GB declarados exceden lo esperable para un único checkpoint FP8 de ~8.000 millones de parámetros, lo que apunta a artefactos adicionales en el repositorio; conviene revisar la lista de ficheros antes de aprovisionar disco.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jacob-ml/Jacob-2-E4B-prod | 7,94 mil millones | no disponible | FP8 (compressed-tensors) | apache-2.0 (declarada) | HuggingFace, 80 descargas |
| google/gemma-4-E4B-it (base) | no disponible en la información | no disponible | bf16 original | no disponible en la información | HuggingFace |
| jacob-ml/Jacob-2-E4B (adaptador LoRA) | no disponible | no disponible | bf16 | no disponible en la información | HuggingFace |
| Otras alternativas de ~8B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con modelos de terceros de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks ni comparación documentada frente al modelo base, por lo que no puede cuantificarse el efecto del LoRA ni de la cuantización FP8.
- Entrenamiento no documentado: se desconoce el dataset del adaptador, su tamaño y su dominio, lo que impide estimar sesgos adquiridos y el riesgo de sobreajuste a un estilo o temática concretos.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se ha publicado ningún estudio de factualidad sobre este artefacto.
- Idiomas no declarados: el campo de idiomas del repositorio está vacío; el comportamiento multilingüe no está verificado y podría degradarse respecto al modelo base.
- Contexto desconocido: no se documenta la ventana máxima soportada, algo crítico para decidir su uso en RAG o conversaciones largas.
- Licencia: la model card declara apache-2.0, pero el modelo base es de Google y habitualmente se distribuye bajo los términos de uso de Gemma. Conviene verificar la compatibilidad de esa declaración antes de un uso comercial, ya que el peso de la licencia original puede prevalecer.
- Validación comunitaria prácticamente nula: 80 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar su comportamiento.
- Cuantización FP8 sin eval: la preservación del `lm_head` en alta precisión mitiga parte del riesgo, pero no hay medición de la pérdida de calidad frente a bf16.
- Dependencia de vLLM: el artefacto está empaquetado en compressed-tensors y pensado para vLLM; otros runtimes requieren conversión manual.
- Resultados de búsqueda web no relevantes: las consultas devolvieron páginas sobre el personaje bíblico Jacob y sobre la empresa de sanitarios Jacob Delafon, sin relación alguna con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacob-ml/Jacob-2-E4B-prod
- Adaptador LoRA de origen: https://huggingface.co/jacob-ml/Jacob-2-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- llmcompressor (herramienta de cuantización citada): https://github.com/vllm-project/llm-compressor
- vLLM (runtime de despliegue): https://github.com/vllm-project/vllm
