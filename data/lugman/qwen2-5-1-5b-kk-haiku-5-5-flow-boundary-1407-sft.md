# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Boundary-1407-SFT

## Resumen

El modelo `lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Boundary-1407-SFT` es un ajuste fino (SFT) del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2 de Alibaba, con licencia Apache 2.0 y pesos en formato safetensors.

El modelo hereda las capacidades del Qwen2.5-1.5B-Instruct original, un transformer decoder-only denso con atención por ventanas deslizantes y contexto nativo de 32.768 tokens (según la familia Qwen2.5). El ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, técnicas que permiten entrenar aproximadamente el doble de rápido y con menor consumo de memoria que un fine-tuning convencional.

La relevancia de este modelo es limitada: se trata de una publicación personal con cero descargas y cero likes en el momento de redactar esta ficha, sin model card detallada, sin datos de entrenamiento publicados y sin benchmarks. Resulta útil únicamente como experimento de ajuste fino sobre Qwen2.5-1.5B-Instruct, no como modelo de producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; el base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Qwen2.5-1.5B-Instruct de Unsloth, que a su vez es una versión reempaquetada del Qwen2.5-1.5B-Instruct de Alibaba. La arquitectura subyacente es un transformer decoder-only denso con atención causal, normalización RMSNorm, embeddings rotatorios (RoPE) y atención con ventana deslizante en parte de las capas, característica de la familia Qwen2.5. El modelo base emplea un tokenizador BPE con un vocabulario de aproximadamente 151.000 tokens.

No se dispone de información sobre el dataset de ajuste fino, el número de tokens de entrenamiento, la composición de los datos, ni si se aplicaron técnicas de RLHF o DPO. La model card solo indica que el entrenamiento se realizó con Unsloth y TRL, lo que sugiere un pipeline de SFT estándar con LoRA o QLoRA, aunque el autor no lo especifica. El nombre del repositorio incluye términos como "KK-Haiku-5.5-Flow-Boundary-1407", que no se explican en la documentación y no permiten inferir la naturaleza del dataset ni del objetivo del ajuste.

## Capacidades

- Generación de texto conversacional, heredada del Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones en inglés.
- Generación de código y matemáticas a nivel de modelo pequeño (1,5B), con las limitaciones propias de ese tamaño.
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5-Instruct (no verificado en este ajuste fino).
- Capacidad multilingüe limitada: la model card declara únicamente inglés, aunque el base Qwen2.5 soporta más idiomas.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo cabe en una GPU de consumo y permite iterar sobre prompts y flujos conversacionales sin infraestructura dedicada.
- Experimentación académica con ajuste fino: sirve como punto de partida para estudiar el efecto de SFT sobre Qwen2.5-1.5B-Instruct con Unsloth y TRL.
- Generación de texto en inglés para tareas de baja criticidad, como resúmenes breves o reescritura de párrafos, donde el coste computacional es prioritario.
- Clasificación y etiquetado de texto mediante prompting: el tamaño reducido permite procesar lotes grandes en una sola GPU.
- Evaluación de técnicas de cuantización: al ser un modelo pequeño, es adecuado para comparar GGUF, AWQ y GPTQ en términos de latencia y calidad.
- Base para destilación o experimentos de alineación: su licencia Apache 2.0 permite modificarlo y redistribuirlo sin restricciones adicionales.
- Despliegue en entornos con recursos limitados (edge, portátiles con GPU): con cuantización a 4 bits ocupa menos de 1 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de evaluación en la model card ni referencias a conjuntos de datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB (1,54B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, incluso en FP16.
- Opciones de despliegue: transformers, vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (requiere GGUF).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5B, se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Boundary-1407-SFT | 1,54B | no especificado (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (Alibaba) | 1,54B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama-3.2-1B-Instruct (Meta) | 1,24B | 131.072 | Llama 3.2 Community License | Hugging Face, muy usado |
| SmolLM2-1.7B-Instruct (Hugging Face) | 1,71B | 8.192 | Apache 2.0 | Hugging Face, muy usado |

No se dispone de datos de rendimiento comparativo para este ajuste fino concreto; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos, calidad y posibles contaminaciones.
- Riesgo elevado de alucinación, inherente a los modelos de 1,5B y agravado por la falta de evaluación del ajuste fino.
- El modelo declara únicamente inglés; su uso en castellano no está garantizado ni evaluado.
- La model card no especifica la longitud de contexto efectiva tras el ajuste fino; podría diferir del base.
- No hay benchmarks ni evaluaciones publicadas, por lo que no se recomienda su uso en producción sin una validación propia.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso ni de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo.
- El nombre del repositorio sugiere un experimento personal sin relación con un producto mantenido; no hay garantía de actualizaciones o soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Boundary-1407-SFT
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
