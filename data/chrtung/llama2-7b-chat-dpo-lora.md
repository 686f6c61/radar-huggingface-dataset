# chrtung/llama2-7b-chat-dpo-lora

## Resumen

chrtung/llama2-7b-chat-dpo-lora es un adaptador LoRA publicado en HuggingFace por el usuario chrtung, cuyo tag `base_model` apunta a meta-llama/Llama-2-7b-chat-hf y cuya librería declarada es `peft`. Por el nombre y por el uso de PEFT se deduce que se trata de un ajuste fino por adaptadores de bajo rango, presumiblemente alineado mediante DPO (Direct Preference Optimization), aunque la model card no confirma ni el método, ni el dataset, ni los hiperparámetros empleados.

El modelo base es bien conocido: un transformer decoder-only de 6.740 millones de parámetros, entrenado por Meta sobre 2 billones de tokens y posteriormente alineado con RLHF (rechazo de muestras más PPO), con una ventana de contexto de 4.096 tokens. Esa base determina el grueso de las capacidades del adaptador; el adaptador en sí no aporta información verificable sobre su comportamiento final.

La relevancia práctica del repositorio es en este momento escasa: acumula 0 descargas y 0 likes, el tamaño del repositorio figura como 0,0 GB (lo que sugiere que los pesos pueden no estar subidos o que los metadatos no son fiables) y las fechas de creación y actualización (2026) resultan anómalas. La model card es la plantilla por defecto de HuggingFace con todos los campos sin rellenar, incluidos licencia, idiomas y detalles de entrenamiento. Cualquier uso en producción exigiría una verificación manual del contenido del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el adaptador; el modelo base es un transformer decoder-only (Llama-2-7b-chat-hf) |
| Parametros totales | no disponible para el adaptador; el modelo base declara 6.740 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base soporta 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo declara el tag `safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base se distribuye bajo Llama 2 Community License) |
| Formato de pesos | safetensors, en formato de adaptador PEFT/LoRA (tag `peft`) |

Nota: los valores marcados como del modelo base proceden de la documentación pública de Meta para Llama-2-7b-chat-hf y no de la información aportada por el autor del adaptador.

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del adaptador, el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros (rango LoRA, alpha, dropout, tasa de aprendizaje, épocas). El repositorio únicamente declara `library_name: peft`, el tag `safetensors`, la versión de framework PEFT 0.10.0 y la referencia bibliográfica arXiv:1910.09700, que corresponde al artículo de Lacoste et al. sobre estimación del impacto ambiental del aprendizaje automático y aparece como enlace por defecto de la plantilla de model card, no como referencia técnica del entrenamiento.

Por el identificador del modelo se infiere un ajuste por LoRA (Low-Rank Adaptation, arXiv:2106.09685) sobre Llama-2-7b-chat-hf y una alineación posterior mediante DPO (arXiv:2305.18290), que optimiza el modelo directamente sobre pares de preferencias sin necesidad de un modelo de recompensa explícito. Se trata de una inferencia razonable a partir del nombre, no de un dato documentado. El modelo base, según la documentación de Meta, se entrenó sobre 2 billones de tokens con optimizador AdamW, contexto de 4.096 tokens y un pipeline de alineación en dos fases (rejection sampling y PPO con modelo de recompensa). No se documenta ninguna innovación técnica adicional en este adaptador.

## Capacidades

Las siguientes capacidades corresponden al modelo base y no han sido verificadas para el adaptador:

- Generación de texto conversacional en formato chat, con plantilla de turnos `[INST]`/`<<SYS>>` propia de Llama 2.
- Razonamiento básico y respuesta a preguntas de conocimiento general, con calidad propia de un modelo de 7B de la generación de 2023.
- Generación de código en lenguajes habituales, con un rendimiento limitado en comparación con modelos de 2024 en adelante.
- Aritmética y problemas matemáticos de varios pasos, con fiabilidad baja en GSM8K para esta escala.
- Soporte de tool calling / function calling: no está documentado de forma nativa; requeriría formateo manual de prompts.
- Soporte de agentes y razonamiento multi-paso: no documentado, y poco fiable en un modelo de 7B con 4.096 tokens de contexto.
- Capacidades multilingües: el modelo base está optimizado principalmente para inglés; el rendimiento en castellano no está garantizado ni medido.
- Modo de pensamiento explícito (thinking mode): no disponible.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Investigación en alineación por preferencias: el adaptador puede servir como artefacto de estudio para comparar DPO frente a SFT sobre un mismo modelo base, siempre que se recuperen los pesos y se documente el dataset utilizado.
- Punto de partida para ajuste incremental: al ser un adaptador PEFT de bajo rango, se puede cargar sobre Llama-2-7b-chat-hf y continuar el entrenamiento con un dataset propio de dominio sin reentrenar los 7B parámetros completos.
- Prototipado de asistentes conversacionales en inglés: útil para validar una interfaz de chat multi-turno con contexto de hasta 4.096 tokens antes de migrar a un modelo más reciente y con mejor licencia.
- Reproducción de experimentos de DPO en entornos con una sola GPU: un adaptador LoRA sobre un 7B en 4 bits se puede entrenar o evaluar en una GPU de consumo, lo que lo hace útil para docencia y para grupos con recursos limitados.
- Generación de datos sintéticos de preferencia: el modelo puede emplearse para producir respuestas candidatas que luego se filtren y etiqueten, como paso previo al entrenamiento de un modelo de recompensa.
- Evaluación de robustez y sesgos de la familia Llama 2: sirve como muestra adicional dentro de estudios comparativos sobre toxicidad y sesgo en modelos alineados con DPO.
- Aplicaciones internas de bajo riesgo: resúmenes o reformulación de texto en inglés donde no se requiera exactitud factual estricta, asumiendo la ventana de 4.096 tokens y la necesidad de revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye sección de evaluación y el repositorio no aporta ninguna métrica (MMLU, GSM8K, HumanEval, MT-Bench ni evaluaciones de preferencia humanas). Para cualquier cifra de referencia habría que acudir a la tabla publicada por Meta en el artículo de Llama 2 (arXiv:2307.09288), que describe el modelo base, no este adaptador.

## Requisitos de hardware

Las cifras siguientes son estimaciones de ingeniería para el modelo base de 7B; no proceden de la documentación del autor:

- VRAM para los pesos en FP16: en torno a 13,5 GB, más aproximadamente 2 GB de caché KV a 4.096 tokens en lote 1, lo que sitúa el total en unos 15-16 GB.
- VRAM en cuantización de 8 bits: aproximadamente 7-8 GB de pesos.
- VRAM en cuantización de 4 bits (bitsandbytes o GGUF Q4): aproximadamente 4-5 GB de pesos, con un total realista de 6-7 GB contando caché y sobrecarga.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 24 GB (esta última con margen suficiente a 4.096 tokens).
- GPU de consumo: cabe en RTX 3090, RTX 4090 y RTX 4080 en 4 bits; en 8 bits cabe con holgura en 16 GB; en FP16 requiere 24 GB o reparto en varias GPU.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador directamente; vLLM y TGI si se fusiona el adaptador con los pesos base; llama.cpp u Ollama tras convertir a GGUF, que requiere fusionar previamente el LoRA en el modelo base.
- Latencia y throughput: no disponibles. Como referencia orientativa, un 7B en FP16 sobre A100 suele moverse en el orden de decenas de tokens por segundo por secuencia en lote pequeño, pero no hay medición publicada para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| chrtung/llama2-7b-chat-dpo-lora | adaptador LoRA sobre 7B (no disponible el rango) | 4.096 tokens (heredado del base) | no disponible | repositorio con 0 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6.740 millones | 4.096 tokens | Llama 2 Community License | pesos completos en HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.2 | 7.240 millones | 32.768 tokens | Apache 2.0 | pesos completos en HuggingFace |
| HuggingFaceH4/zephyr-7b-beta | 7.240 millones | 32.768 tokens | MIT | pesos completos en HuggingFace |

Zephyr-7b-beta es el comparable más directo en cuanto a técnica, ya que también se alineó con DPO, y ofrece licencia MIT y el doble de contexto efectivo. Mistral-7B-Instruct-v0.2 aporta licencia Apache 2.0 y contexto de 32.768 tokens. No hay datos de rendimiento de este adaptador que permitan comparar calidad de forma objetiva con ninguno de ellos.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla vacía, sin licencia, idiomas, datos de entrenamiento ni instrucciones de uso declaradas.
- Licencia no disponible para el adaptador, lo que impide determinar si su uso comercial es legal; además, el modelo base está sujeto a Llama 2 Community License, que impone condiciones (entre ellas, licencia separada si se superan 700 millones de usuarios mensuales).
- Tamaño de repositorio de 0,0 GB: existe un riesgo real de que los pesos no estén subidos o de que el repositorio esté incompleto; conviene comprobar la pestaña de archivos antes de cualquier intento de carga.
- Fechas de creación y actualización en 2026, incoherentes con el resto de metadatos, lo que reduce la fiabilidad general del repositorio.
- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base, ni análisis de regresiones introducidas por el DPO.
- Riesgo de alucinación propio de un modelo de 7B de 2023: baja fiabilidad en hechos, cifras y citas, especialmente fuera del inglés.
- Degradación por sobreajuste a preferencias: un DPO sin regularización suficiente puede reducir la diversidad de las respuestas y aumentar la verbosidad sin mejorar la corrección factual.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas: el modelo base se centra en inglés; no hay evidencia de calidad en castellano y el uso multilingüe puede producir respuestas degradadas o cambios de idioma.
- Sin soporte nativo documentado de tool calling ni de agentes, lo que limita su integración en pipelines automatizados.
- Sesgos heredados del corpus de entrenamiento de Llama 2, no medidos ni mitigados en este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chrtung/llama2-7b-chat-dpo-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Articulo de Llama 2 (Touvron et al., 2023): https://arxiv.org/abs/2307.09288
- Articulo de DPO (Rafailov et al., 2023): https://arxiv.org/abs/2305.18290
- Articulo de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio de transformers: https://github.com/huggingface/transformers
