# ShaanShah1/1pp-canary-1.7b-ua

## Resumen

1pp-canary-1.7b-ua es un checkpoint de investigación publicado por el usuario ShaanShah1 en HuggingFace. Se trata de un modelo base de 1.661.048.832 parámetros (1,66B) con arquitectura decoder de estilo Llama, tokenizador de SmolLM2 y una longitud de secuencia de 4.096 tokens. La model card es deliberadamente mínima: el autor lo describe como "research checkpoint" y anuncia que los detalles se publicarán más adelante, por lo que no hay información sobre el dataset de entrenamiento, el número de tokens vistos ni el proceso de alineación.

El modelo se distribuye en formato safetensors bajo licencia Apache-2.0 y es compatible con la librería transformers, con text-generation-inference y con endpoints compatibles. La única especificación operativa que proporciona el autor es el formato de chat: ChatML sin turno de sistema, con parada en `<|im_end|>` o `<|endoftext|>`.

Su relevancia actual es limitada y debe entenderse en clave de trazabilidad: cero descargas y cero likes en el momento de la ficha, ausencia total de benchmarks y de documentación sobre el corpus. Es un artefacto útil para quien quiera inspeccionar los pesos o reproducir el formato de chat, no una opción recomendada para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Llama (según model card) |
| Parametros totales | 1.661.048.832 (1,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (secuencia de entrenamiento declarada) |
| Tipos de cuantizacion | no disponible en la model card; los pesos safetensors admiten cuantización posterior a GGUF/AWQ/GPTQ mediante herramientas estándar |
| Idiomas soportados | no disponible; el sufijo "ua" del nombre podría sugerir ucraniano, pero no está confirmado por el autor |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 3,3 GB, lo que cuadra con pesos en FP16/BF16 para 1,66B parámetros) |

## Arquitectura y entrenamiento

La model card describe un decoder de estilo Llama con tokenizador de SmolLM2 y longitud de secuencia de 4.096 tokens. No se especifica número de capas, dimensión oculta, número de cabezas de atención, tipo de normalización ni si emplea atención con RoPE. Tampoco se indica si el modelo parte de un preentrenamiento desde cero o de un ajuste sobre otro checkpoint, ni si ha pasado por fases de instrucción, RLHF o DPO. El tag `conversational` y el formato ChatML documentado apuntan a algún tipo de ajuste orientado a diálogo, pero el autor lo etiqueta explícitamente como modelo base, lo que genera ambigüedad sobre el alcance real del ajuste.

No hay información pública sobre volumen de tokens de entrenamiento, composición del corpus, mezcla de idiomas ni innovaciones técnicas (atención lineal, decodificación especulativa, MoE, etc.). Cualquier afirmación al respecto sería especulativa. El formato de chat es el único detalle operativo verificable: ChatML sin turno de sistema, con plantilla `<|im_start|>user\n...<|im_end|>\n<|im_start|>assistant\n...<|im_end|>\n` y parada de generación en `<|im_end|>` o `<|endoftext|>`.

## Capacidades

- Generación de texto autoregresiva en el formato declarado por el autor (ChatML sin turno de sistema).
- Conversación multi-turno básica, según el tag `conversational` y la plantilla documentada.
- Compatibilidad con `transformers` (carga directa de safetensors) y con text-generation-inference.
- Compatibilidad con endpoints compatibles con la API de HuggingFace.
- Longitud de contexto de 4.096 tokens: suficiente para diálogos cortos y documentos breves, insuficiente para contextos largos.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado; idiomas no declarados.
- Visión, audio o modos especiales (thinking mode): no disponibles.

## Casos de uso

- Investigación sobre tokenizadores: al emplear el tokenizador de SmolLM2 con una arquitectura Llama, permite estudiar la interacción entre vocabulario y embeddings en modelos pequeños, comparando la inicialización de la capa de embeddings frente a otros checkpoints.
- Reproducción de plantillas de chat: sirve para validar pipelines de formateo ChatML sin turno de sistema y comprobar que el truncado se produce correctamente en `<|im_end|>` y `<|endoftext|>`.
- Pruebas de integración de infraestructura: al ser un checkpoint de 1,66B en safetensors y 3,3 GB, es adecuado para verificar despliegues de TGI, endpoints compatibles o pipelines de `transformers` en entornos de staging antes de mover modelos mayores.
- Generación de texto de baja latencia en hardware modesto: con cuantización a 4 bits los pesos bajan de aproximadamente 1 GB, lo que permite ejecutarlo en una GPU de consumo para tareas de completado de texto sin requisitos de calidad altos.
- Fine-tuning experimental: al estar bajo Apache-2.0 y ser un modelo pequeño, es un candidato razonable para LoRA/QLoRA en dominios acotados, siempre que se valide primero la calidad del checkpoint base.
- Evaluación comparativa de checkpoints de investigación: útil como línea base en estudios sobre trazabilidad y reproducibilidad de modelos publicados sin documentación, midiendo cuánto de su comportamiento depende de los datos frente a la arquitectura.
- Generación de datos sintéticos a pequeña escala para tareas internas de clasificación o etiquetado, con revisión humana posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, HellaSwag ni ninguna otra métrica, y no se han encontrado evaluaciones de terceros en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 1,66B parámetros, no verificado empíricamente):
  - FP16/BF16: aproximadamente 3,3 GB de pesos más KV cache y activaciones; del orden de 4-6 GB para contextos de 4.096 tokens.
  - INT8: aproximadamente 1,7 GB de pesos; del orden de 2,5-3,5 GB en total.
  - INT4 (GPTQ/AWQ/GGUF Q4): aproximadamente 1 GB de pesos; del orden de 1,5-2,5 GB en total.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070, L4). Para INT4 basta con 4 GB (RTX 3050, GTX 1660 Super, iGPU con memoria unificada).
- Cabe en GPU de consumo: sí, en toda la gama media y baja con cuantización; en FP16 requiere al menos 6-8 GB.
- Opciones de despliegue: `transformers` (ruta nativa), text-generation-inference (el autor lo etiqueta como compatible), endpoints compatibles de HuggingFace, llama.cpp/Ollama tras conversión a GGUF, y vLLM tras verificar compatibilidad de la arquitectura.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor ni por terceros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion / benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-canary-1.7b-ua | 1,66B | 4.096 | Apache-2.0 | Model card mínima, sin benchmarks | HuggingFace, 0 descargas |
| SmolLM2-1.7B (HuggingFace) | 1,7B | 8.192 (referencia pública) | Apache-2.0 | Model card completa con benchmarks publicados | Ampliamente desplegado |
| Qwen2.5-1.5B (Alibaba) | 1,5B | 32.768 (referencia pública) | Apache-2.0 | Model card completa con benchmarks publicados | Ampliamente desplegado |
| Llama-3.2-1B (Meta) | 1,24B | 128.000 (referencia pública) | Licencia comunitaria Llama 3.2 | Model card completa con benchmarks publicados | Ampliamente desplegado |

Nota: los datos de contexto y licencia de los modelos comparativos son referencias públicas habituales y no se han verificado contra las model cards originales en el momento de redactar esta ficha. La comparación relevante es de madurez documental: 1pp-canary-1.7b-ua carece de benchmarks y de descripción del corpus, mientras que los tres alternativas publican evaluaciones y detalles de entrenamiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada sobre calidad, razonamiento, código o matemáticas. No debe asumirse ningún nivel de rendimiento.
- Documentación insuficiente: se desconoce el corpus de entrenamiento, el número de tokens, la composición idiomática y si hubo alineación (RLHF/DPO/SFT). Esto impide evaluar sesgos y calidad de forma informada.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 1,66B sin evaluación publicada, la tasa esperada de afirmaciones falsas es alta en tareas de conocimiento factual.
- Idiomas no declarados: el sufijo "ua" podría indicar ucraniano, pero el autor no lo confirma. No hay garantía de competencia en castellano ni en ningún otro idioma.
- Contexto corto: 4.096 tokens limita casos de uso con documentos largos, RAG con muchos fragmentos o conversaciones extensas.
- Sin turno de sistema en ChatML: no es posible imponer instrucciones de sistema mediante la plantilla documentada, lo que complica el control de comportamiento en producción.
- Riesgo de reproducibilidad: el repositorio se creó y actualizó el mismo día (23 de octubre de 2026), sin historial de versiones documentado ni métricas de uso.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero el autor no ofrece garantías ni asume responsabilidad sobre el comportamiento del modelo. Al no conocerse el origen de los datos de entrenamiento, persiste incertidumbre sobre posibles obligaciones adicionales de terceros.
- No recomendado para producción sin una evaluación propia previa (perplejidad, evaluaciones de dominio, pruebas de robustez y de sesgo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ShaanShah1/1pp-canary-1.7b-ua
- Perfil del autor: https://huggingface.co/ShaanShah1
- No se han encontrado papers, blogs, repositorios ni demos asociados al modelo. La búsqueda web realizada devolvió únicamente resultados sin relación con el modelo (contenido para adultos no pertinente), por lo que no se incluyen como referencias.
