# mradermacher/Mitwa-Hermes-Mistral-7B-18k-GGUF

## Resumen

Mitwa-Hermes-Mistral-7B-18k-GGUF es la versión cuantizada en formato GGUF del modelo Rishi-19/Mitwa-Hermes-Mistral-7B-18k, publicada por mradermacher, un autor habitual en la comunidad de cuantización. El modelo original es un fine-tune de Mistral 7B orientado a conversación, con un contexto extendido a 18.000 tokens (de ahí el sufijo "18k" en el nombre) y afinado sobre el dataset Hermes, lo que le aporta capacidades de diálogo estructurado y formato de chat.

La relevancia de esta ficha concreta reside en el formato: al tratarse de una conversión a GGUF con múltiples niveles de cuantización (desde Q2_K hasta f16), el modelo puede ejecutarse en hardware de consumo mediante llama.cpp, Ollama o cualquier runtime compatible con GGUF, sin necesidad de GPUs de datacenter. Esto lo convierte en una opción práctica para prototipado local, asistentes conversacionales en el borde y despliegues con recursos limitados.

Se trata de un transformer decoder-only de 7.241.748.480 parámetros (aproximadamente 7,24 mil millones), con licencia no especificada en la información disponible y soporte declarado únicamente para inglés. No se han publicado datos de benchmarks ni detalles sobre el proceso de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral 7B) |
| Parámetros totales | 7.241.748.480 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 18.000 tokens (según el nombre del modelo base) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (transformers, endpoints_compatible) |

## Arquitectura y entrenamiento

El modelo base es Rishi-19/Mitwa-Hermes-Mistral-7B-18k, un fine-tune de Mistral 7B. Mistral 7B es un transformer decoder-only con atención de ventana deslizante (sliding window attention) y activación SwiGLU, aunque los detalles concretos de la receta de entrenamiento del fine-tune no están disponibles en la información proporcionada. El sufijo "18k" indica que el contexto fue extendido hasta 18.000 tokens, presumiblemente mediante técnicas de ajuste con datos de mayor longitud, aunque no se especifica el método exacto (RoPE scaling, ajuste de posición, etc.).

El nombre "Hermes" sugiere un afinado sobre datos de tipo Hermes (dataset conversacional con formato de chat estructurado, típicamente con roles system/user/assistant), lo que explicaría la orientación conversacional del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o similares. La cuantización realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin versiones imatrix/weighted disponibles según la model card.

## Capacidades

- Generación de texto conversacional multi-turno con formato de chat estructurado (roles system, user, assistant).
- Razonamiento y respuesta a instrucciones en inglés, derivado del afinado sobre datos tipo Hermes.
- Contexto extendido de 18.000 tokens, adecuado para conversaciones largas o documentos de tamaño medio.
- Compatibilidad con el ecosistema transformers y con runtimes GGUF (llama.cpp, Ollama, entre otros), gracias a la etiqueta endpoints_compatible.
- Soporte de cuantizaciones desde 2,8 GB (Q2_K) hasta 14,6 GB (f16), lo que permite ajustar el equilibrio calidad/recursos.
- Capacidades multilingües: limitadas al inglés según la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponibles en la información proporcionada.
- Vision, audio o thinking mode: no disponibles (modelo solo de texto).

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno en inglés con un contexto de 18.000 tokens, ejecutándose en una GPU de consumo con la cuantización Q4_K_M (4,5 GB), lo que lo hace adecuado para prototipos de chatbots sin dependencia de la nube.
- Prototipado rápido en portátil: con la cuantización Q4_K_S (4,2 GB) o Q2_K (2,8 GB) puede ejecutarse en GPUs con 6-8 GB de VRAM o incluso en CPU, permitiendo iterar sobre prompts y formatos de chat antes de escalar a modelos mayores.
- Procesamiento de documentos de longitud media: el contexto de 18.000 tokens permite resumir o extraer información de artículos, informes o conversaciones largas en una sola pasada, sin fragmentación excesiva.
- Generación de respuestas en pipelines de atención al cliente: integrable vía llama.cpp u Ollama en servicios backend que necesiten respuestas en inglés con formato de chat controlado, con latencia baja en GPU de consumo.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 niveles de cuantización distintos, lo que permite medir empíricamente la degradación de calidad frente al tamaño en tareas conversacionales concretas.
- Educación e investigación: útil para estudiar el efecto del contexto extendido y del afinado tipo Hermes en un modelo de 7B, así como para experimentos de cuantización en entornos con recursos limitados.
- Despliegue en el borde (edge): con Q2_K o Q3_K_S cabe en dispositivos con 4 GB de memoria, habilitando asistentes offline en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~2,8 GB; Q3_K_S ~3,3 GB; Q4_K_S ~4,2 GB; Q4_K_M ~4,5 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB. Añadir aproximadamente 1-2 GB para el contexto KV cache según longitud de secuencia.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, desde GPUs con 6 GB (Q4_K_S) hasta 16 GB (f16 con margen). También puede ejecutarse en CPU con llama.cpp para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. La etiqueta endpoints_compatible sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Mitwa-Hermes-Mistral-7B-18k-GGUF | 7,24 B | 18.000 | no disponible | GGUF | Hugging Face |
| Mistral 7B Instruct (original) | 7,24 B | 8.192 | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Zephyr 7B Beta | 7,24 B | 32.768 | MIT | safetensors, GGUF | Hugging Face |
| OpenHermes 2.5 Mistral 7B | 7,24 B | 4.096 | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se basa en características públicas de los modelos alternativos; no se dispone de datos de rendimiento comparativo para este modelo concreto. El principal diferenciador de Mitwa-Hermes es su contexto de 18.000 tokens frente a los 4.096-8.192 típicos de fine-tunes similares de Mistral 7B, aunque la licencia no especificada limita su atractivo frente a alternativas con licencias permisivas claras.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (Rishi-19/Mitwa-Hermes-Mistral-7B-18k) antes de cualquier despliegue en producción.
- Solo inglés: el modelo está declarado únicamente para inglés, por lo que su rendimiento en castellano u otros idiomas será previsiblemente deficiente.
- Riesgo de alucinación: como todo modelo de 7B afinado sobre datos conversacionales, puede generar información plausible pero incorrecta, especialmente en dominios especializados.
- Sesgos conocidos: no documentados en la información disponible; se heredan los sesgos del dataset Hermes y del corpus de Mistral, no auditados en esta ficha.
- Contexto de 18.000 tokens: aunque superior a la media de fine-tunes de 7B, está por debajo de modelos con 32k o 128k; además, la calidad en las posiciones más lejanas del contexto no está verificada empíricamente.
- Cuantizaciones bajas (Q2_K, Q3_K_S): la propia model card advierte que Q3_K_M es de "lower quality"; en Q2_K la degradación puede ser notable en tareas de razonamiento.
- Sin versiones imatrix/weighted: el autor indica que no están disponibles, lo que limita la opción de cuantizaciones de mayor calidad por tamaño.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta la selección informada.
- Fine-tune de procedencia no verificada: el modelo base Rishi-19 no cuenta con amplia documentación pública en la información disponible.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Mitwa-Hermes-Mistral-7B-18k-GGUF
- Modelo base: https://huggingface.co/Rishi-19/Mitwa-Hermes-Mistral-7B-18k
- Página de descargas del autor: https://hf.tst.eu/model#Mitwa-Hermes-Mistral-7B-18k-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
