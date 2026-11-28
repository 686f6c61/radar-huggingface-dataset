# samyhaff/qwen3-0.6b-distill-ed

## Resumen

qwen3-0.6b-distill-ed es un modelo especializado en desambiguación de entidades (entity disambiguation, ED) desarrollado por Samy Haffoudhi y publicado bajo el identificador samyhaff en Hugging Face. Se trata de un ajuste fino de Qwen/Qwen3-0.6B mediante LoRA fusionado, entrenado por destilación off-policy con el algoritmo GKD (λ=0, β=0) a partir del profesor Qwen3-30B-A3B sobre el conjunto de datos ZELDA. El modelo resuelve un problema concreto: dado un texto con una mención marcada entre corchetes y una lista numerada de candidatos con sus descripciones, razona y devuelve el índice del candidato correcto.

El modelo acompaña al artículo "When Does Reasoning Help Entity Disambiguation? Small LLMs In-Domain and Under Shift", aceptado en Findings of EACL 2027, que estudia si el razonamiento explícito ayuda a modelos pequeños en tareas de ED tanto en dominio como bajo cambio de distribución. Con 596 millones de parámetros y una licencia Apache 2.0, es un modelo compacto pensado para integrarse como eslabón final de un pipeline de ED, precedido por un recuperador de candidatos como qwen3-4b-reranker-ed.

Su relevancia radica en demostrar que un modelo de menos de 1.000 millones de parámetros, destilado de un MoE de 30.000 millones, puede alcanzar un 79,1 % de precisión en ZELDA y un 73,1 % de precisión normalizada en ZESHEL en régimen de zero-shot real, lo que lo hace viable en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste LoRA fusionado |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible (no se declara lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3 con 596 millones de parámetros. Sobre esa base se aplicó un ajuste fine-tuning con LoRA que posteriormente se fusionó en los pesos finales, de modo que el artefacto distribuido es un modelo denso estándar cargable con transformers o vLLM. El entrenamiento sigue el esquema de destilación off-policy GKD (Generalized Knowledge Distillation) con λ=0 y β=0, usando como profesor a Qwen3-30B-A3B y como corpus el conjunto ZELDA. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de RLHF o DPO.

La innovación principal no está en la arquitectura, sino en el protocolo de inferencia: el modelo está entrenado para razonar de forma explícita (modo thinking) antes de emitir la respuesta final con el formato `"answer": <índice>`, y el autor recomienda muestrear 10 completaciones y aplicar voto por mayoría para estabilizar la predicción. En el artículo, los candidatos de entrada corresponden al top-10 generado por qwen3-4b-reranker-ed, lo que configura un pipeline de dos etapas (recuperación y desambiguación razonada).

## Capacidades

- Razonamiento explícito previo a la respuesta (thinking mode activable mediante `enable_thinking=True` en el chat template).
- Desambiguación de entidades en contexto: identifica la entidad correcta entre una lista numerada de candidatos con descripciones.
- Entity linking dentro de un pipeline cuando se combina con un recuperador de candidatos.
- Generación de texto conversacional en formato chat multi-turno (hereda la plantilla de Qwen3).
- Salida estructurada mediante el patrón `"answer": <índice>`, parseable con expresiones regulares.
- Soporte de decodificación con vLLM y parámetros de muestreo múltiple (`n=10`) para voto por mayoría.
- Capacidades multilingües: no disponibles de forma declarada; el prompt de referencia está en inglés.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Visión y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Desambiguación de entidades en pipelines de extracción de conocimiento: el modelo recibe el texto con la mención marcada y el top-10 de candidatos generado por un reranker, y devuelve el índice correcto; es el eslabón final del pipeline descrito en el artículo y en el repositorio github.com/samyhaff/ed-study.
- Enriquecimiento de bases de datos y grafos de conocimiento: dado un corpus de noticias o documentos, permite mapear cada mención a la entidad canónica del grafo (por ejemplo, distinguir "Jordan" como país, persona o río) antes de insertar tripletas.
- Normalización de entidades en motores de búsqueda internos: se puede usar para resolver ambigüedades en consultas de usuario y en índices documentales, con la ventaja de que el modelo cabe en una GPU de consumo.
- Anotación asistida de corpus para investigación en NLP: al ser Apache 2.0 y de tamaño reducido, se puede desplegar en lotes sobre clústeres modestos para pre-anotar datasets de entity linking que luego se revisan manualmente.
- Procesamiento de documentos legales o biomédicos con jerga ambigua: el modelo razona sobre descripciones de candidatos, lo que permite inyectar definiciones específicas del dominio en la shortlist y obtener la resolución contextual.
- Evaluación de robustez bajo cambio de distribución: sirve como baseline pequeño para estudiar cómo se degrada la desambiguación cuando el dominio de evaluación difiere del de entrenamiento, tal como se reporta en ZESHEL (73,1 % de precisión normalizada en zero-shot real).
- Despliegue en entornos con recursos limitados: con 596 millones de parámetros y pesos safetensors de 1,2 GB, puede ejecutarse en una única GPU consumer para tareas de desambiguación de alto volumen con latencia baja.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ZELDA | Precisión (accuracy) | 79,1 |
| ZESHEL (true zero-shot) | Precisión normalizada | 73,1 |

No se han publicado en la información disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y número de muestras simultáneas.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6-0,8 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,3-0,5 GB de pesos (si bien el autor no publica versiones GGUF/AWQ oficiales).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. El modelo cabe holgadamente en GPUs de consumo.
- Despliegue: el autor documenta explícitamente vLLM (`vllm.LLM` con `SamplingParams` y `chat_template_kwargs={"enable_thinking": True}`). Al ser un modelo transformers estándar, también es compatible con TGI (text-generation-inference), llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El protocolo de inferencia recomienda 10 muestras por consulta con `max_tokens=2048`, lo que multiplica el coste por diez respecto a una única pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samyhaff/qwen3-0.6b-distill-ed | 596 M | no disponible | Entity disambiguation con razonamiento | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 596 M | no disponible | Generación de texto general | Apache 2.0 | Hugging Face |
| samyhaff/qwen3-4b-reranker-ed | no disponible | no disponible | Recuperación/reranking de candidatos para ED | no disponible | Hugging Face |
| Qwen3-30B-A3B (profesor) | 30 B (MoE) | no disponible | Generación de texto y razonamiento | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, salvo que el modelo destilado se entrena a partir de Qwen3-30B-A3B y se complementa con qwen3-4b-reranker-ed en el pipeline del artículo.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en desambiguación de entidades; no es un modelo de propósito general y su uso fuera de esa tarea no está validado.
- Requiere un formato de prompt muy concreto (mención entre `[` y `]`, candidatos numerados con descripciones, system prompt específico); desviarse de él degrada la calidad de la respuesta.
- El protocolo recomendado implica 10 muestreos con voto por mayoría, lo que multiplica el coste computacional y la latencia por consulta.
- No se declaran los idiomas soportados; el prompt de referencia y el entrenamiento parecen centrados en inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- No se especifican sesgos conocidos, pero al derivar de Qwen3-0.6B y entrenarse sobre ZELDA, puede heredar sesgos de la base y del corpus, especialmente en entidades con cobertura desigual.
- Riesgo de alucinación en el razonamiento previo: el modelo puede generar cadenas de pensamiento plausibles pero incorrectas; el parseo del campo `"answer"` y el voto por mayoría mitigan parcialmente este riesgo.
- La ventana de contexto efectiva no se documenta; textos muy largos o shortlists con muchas entidades pueden degradar la precisión.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica como artefacto de investigación.
- Solo 355 descargas y 1 like en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samyhaff/qwen3-0.6b-distill-ed
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Reranker complementario: https://huggingface.co/samyhaff/qwen3-4b-reranker-ed
- Artículo: https://arxiv.org/abs/2611.30334
- Repositorio del pipeline y evaluación: https://github.com/samyhaff/ed-study
