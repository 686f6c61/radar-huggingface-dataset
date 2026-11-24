# C3DS/CARDS-WIND-Qwen3.8-27B

## Resumen

CARDS-WIND-Qwen3.8-27B es un ajuste fino (finetune) publicado por C3DS sobre el modelo base `unsloth/Qwen3.8-27B`, a su vez derivado de la familia Qwen3.5. El modelo se distribuye con licencia Apache 2.0, tiene 27.781.427.952 parámetros (unos 27,8 mil millones) almacenados en safetensors y un repositorio de 55,6 GB, lo que sugiere pesos en precisión de 16 bits. La pipeline declarada es `image-text-to-text`, es decir, está orientado a tareas multimodales de entrada imagen y texto, aunque el autor no documenta detalles sobre el dataset de ajuste ni sobre las capacidades concretas adquiridas.

La información pública disponible es muy escasa: la model card es prácticamente una plantilla autogenerada por Unsloth que solo confirma el modelo base, la licencia y que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face. No se especifican tokens de entrenamiento, composición del dataset, método de ajuste (SFT, DPO, RLHF) ni resultados de evaluación. El modelo tiene cero descargas y cero likes en el momento de la consulta, y fue creado el 24 de noviembre de 2026.

Por tanto, esta ficha debe leerse como una descripción estructural del artefacto (tamaño, formato, licencia, pipeline y procedencia) más que como una evaluación de capacidades. Cualquier uso en producción requeriría una validación empírica propia, dado que no hay benchmarks ni documentación técnica del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB; también compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Qwen3.8-27B`, que pertenece a la familia Qwen3.5 según el tag `qwen3_5`. La arquitectura subyacente es, por tanto, un transformer de la familia Qwen, con aproximadamente 27,8 mil millones de parámetros. No se dispone de información sobre número de capas, dimensiones ocultas, mecanismo de atención (si usa atención lineal, GQA o decodificación especulativa) ni sobre la ventana de contexto nativa, ya que la model card no lo documenta.

En cuanto al entrenamiento, el autor indica únicamente que el ajuste se realizó con Unsloth y la librería TRL de Hugging Face, lo que apunta a un proceso de fine-tuning supervisado (SFT) o preferencias con las utilidades de Unsloth para reducir memoria y acelerar el entrenamiento (el autor afirma "2x faster"). No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni si se congelaron capas o se usaron adaptadores (LoRA/QLoRA) fusionados posteriormente en los pesos finales. Tampoco se documenta ninguna innovación técnica adicional más allá del uso de Unsloth.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5.
- Pipeline declarada `image-text-to-text`: se espera soporte de entrada multimodal (imagen + texto), aunque el autor no detalla el alcance ni la resolución de imagen soportada.
- Razonamiento y generación de código: presumiblemente heredados de Qwen3.5, pero no verificados ni documentados en este ajuste.
- Tool calling / function calling: no disponible en la documentación; probablemente heredado del base, sin confirmar.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara solo `en`; no se confirman otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes multimodales en inglés: el modelo puede recibir imagen y texto y generar respuestas, útil para experimentar con pipelines `image-text-to-text` en entornos de investigación con transformers o TGI.
- Fine-tuning adicional sobre dominios específicos: al ser un checkpoint de 27,8 B con licencia Apache 2.0, sirve como base para ajustes con Unsloth/TRL en tareas verticales (por ejemplo, descripción de imágenes técnicas o moderación visual), reutilizando la infraestructura del autor.
- Evaluación comparativa de ajustes comunitarios: útil como caso de estudio de finetunes publicados sin documentación, para medir la degradación o mejora respecto al base `unsloth/Qwen3.8-27B`.
- Generación de descripciones de imágenes en inglés para catalogación: si el ajuste conserva la capacidad multimodal del base, podría emplearse en pipelines de etiquetado automático, previa validación empírica.
- Despliegue en endpoints compatibles: el tag `endpoints_compatible` y el soporte de `text-generation-inference` permiten servirlo en infraestructura tipo Hugging Face Inference Endpoints para pruebas internas.
- Base para investigación sobre alineación y sesgos: al no haber documentación del dataset de ajuste, es un candidato para auditar qué sesgos introduce un finetune no documentado sobre un modelo Qwen.
- Experimentación con cuantización: al estar en safetensors de 55,6 GB, se puede cuantizar a 8 o 4 bits con herramientas estándar (llama.cpp, GPTQ, AWQ) para reducir requisitos de VRAM, aunque el autor no publica versiones cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 55-56 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se necesitan 60-70 GB según longitud de contexto y batch.
- VRAM estimada en cuantización 8 bits: ~28 GB de pesos, con overhead total en torno a 32-36 GB.
- VRAM estimada en cuantización 4 bits: ~14 GB de pesos, con overhead total en torno a 18-22 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16 sin cuantizar; A100 40 GB o L40S 48 GB para 8 bits; RTX 4090 24 GB solo viable en 4 bits con contexto moderado.
- Consumer GPU: cabe en RTX 4090 (24 GB) únicamente con cuantización 4 bits y contexto limitado; en GPUs de 16 GB o menos no es viable sin offloading a CPU.
- Opciones de despliegue: transformers, text-generation-inference (TGI), y previsiblemente vLLM; llama.cpp/Ollama requerirían convertir los safetensors a GGUF, ya que el repo no incluye versiones GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| C3DS/CARDS-WIND-Qwen3.8-27B | ~27,8 B | no disponible | Apache 2.0 | Sí (pipeline image-text-to-text) | Hugging Face, 0 descargas |
| unsloth/Qwen3.8-27B (base) | ~27,8 B (presumible) | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| Qwen3.5 (familia, referencia) | variable | no disponible | no disponible en esta ficha | no disponible | Hugging Face |

No se dispone de datos de rendimiento del modelo ni de benchmarks del base en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad. No se han identificado alternativas directamente comparables con documentación suficiente en esta consulta.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card es una plantilla de Unsloth sin información sobre dataset, método de ajuste, evaluación ni limitaciones declaradas.
- Riesgo elevado de alucinación y de comportamiento impredecible: al no conocerse el dataset de finetune, no se puede descartar sobreajuste, degradación de capacidades del base o sesgos introducidos.
- Idiomas: solo se declara inglés (`en`); el uso en castellano u otros idiomas no está soportado oficialmente y requeriría validación.
- Contexto: se desconoce la longitud máxima de contexto; planificar despliegues con ventanas largas sin verificación previa es arriesgado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el modelo base `unsloth/Qwen3.8-27B` y la familia Qwen3.5 no impongan restricciones adicionales (la model card del base no se ha consultado en esta ficha).
- Cero tracción comunitaria (0 descargas, 0 likes): no hay evidencia de uso en producción ni reportes de terceros.
- Multimodalidad no verificada: la pipeline `image-text-to-text` es una declaración del autor; no se documenta resolución, tipos de imagen ni calidad del ajuste multimodal.
- Para producción se recomienda una evaluación propia con benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU) antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/C3DS/CARDS-WIND-Qwen3.8-27B
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
