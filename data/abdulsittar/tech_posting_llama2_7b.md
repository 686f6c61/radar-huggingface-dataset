# AbdulSittar/Tech_Posting_LLama2_7B

## Resumen

Tech_Posting_LLama2_7B es un adaptador LoRA (PEFT) publicado por AbdulSittar sobre el modelo base meta-llama/Llama-2-7b-chat-hf. El modelo está afinado mediante SFT (supervised fine-tuning) con la librería TRL para generar publicaciones de temática tecnológica en el contexto de simulación social y modelado basado en agentes sobre Reddit. Su propósito no es el asistente conversacional generalista, sino la generación de contenido sintético verosímil para experimentos de dinámica social en foros técnicos.

El adaptador se distribuye como pesos LoRA en formato safetensors (13,5 GB de repositorio), con un total de 6.738.415.616 parámetros heredados del modelo base Llama 2 de 7B. El entrenamiento se realizó sobre el dataset AbdulSittar/Social_Graph_Inference_Reddit, orientado a inferencia de grafos sociales y simulación de interacciones entre agentes.

Es relevante para investigadores que necesitan agentes generativos que emulen el comportamiento de usuarios en comunidades técnicas (publicaciones, comentarios, discusiones) sin depender de APIs propietarias. Su licencia Llama 2 y el acceso restringido en Hugging Face condicionan su uso comercial y su distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), adaptador LoRA sobre el modelo base |
| Parametros totales | 6.738.415.616 (modelo base Llama 2 7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Llama 2 chat soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (los pesos distribuidos son LoRA en safetensors; el base admite cuantizacion estandar de Llama 2) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 2 7B chat, un transformer decoder-only con atención causal estándar y 6.738.415.616 parámetros. La técnica aplicada es LoRA (Low-Rank Adaptation) combinada con SFT mediante la librería TRL, lo que implica que solo se entrenan las matrices de bajo rango inyectadas en las capas del modelo base, manteniendo congelados los pesos originales. El repositorio usa la librería PEFT para cargar y combinar el adaptador con el base.

El dataset de entrenamiento es AbdulSittar/Social_Graph_Inference_Reddit, orientado a inferencia de grafos sociales y simulación de agentes en Reddit. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO posteriores al SFT. Los tags indican el uso de TRL y SFT, pero no hay detalles sobre hiperparámetros, rango de LoRA ni duración del entrenamiento.

## Capacidades

- Generación de texto en inglés orientada a publicaciones y comentarios de temática tecnológica en estilo Reddit.
- Simulación de agentes sociales: el modelo está entrenado para producir contenido verosímil dentro de discusiones de foros técnicos.
- Modelado basado en agentes (agent-based modeling) para experimentos de dinámica social.
- Generación conversacional multi-turno heredada del base Llama 2 chat.
- Soporte de inferencia con PEFT: requiere cargar el base Llama 2 7B chat y aplicar el adaptador.
- Capacidades multilingües limitadas: solo se declara inglés (en).
- No se documenta soporte explícito de tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la información disponible.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Simulación social en Reddit: generar publicaciones y respuestas sintéticas de usuarios técnicos para estudiar dinámicas de comunidad, propagación de opiniones o formación de subgrupos, aprovechando el entrenamiento específico sobre el dataset Social_Graph_Inference_Reddit.
- Investigación en modelado basado en agentes: instanciar agentes generativos que interactúen en un grafo social simulado, con contenido coherente con discusiones tecnológicas.
- Generación de datasets sintéticos: producir corpus de publicaciones técnicas etiquetadas para entrenar clasificadores o sistemas de moderación, reduciendo la dependencia de datos reales de usuarios.
- Pruebas de sistemas de moderación y detección de spam: generar contenido de foros técnicos controlado para validar clasificadores y pipelines de moderación antes de desplegarlos en producción.
- Estudio de sesgos y toxicidad en comunidades online: al poder generar contenido controlado, permite analizar cómo se propagan sesgos en discusiones técnicas simuladas.
- Prototipado de asistentes de comunidad: usar el adaptador como generador de borradores de respuestas en foros de soporte técnico en inglés, con revisión humana posterior.
- Aumento de datos para tareas de NLP social: ampliar corpus escasos de discusiones técnicas con ejemplos sintéticos para fine-tuning de modelos downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13-14 GB para el modelo base Llama 2 7B más el adaptador LoRA.
- VRAM estimada en cuantización 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantización 4 bits (GGUF Q4_K_M): aproximadamente 4-5 GB.
- GPU recomendadas: NVIDIA A100 40GB o H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16 sin problemas.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 8 GB o más si se aplica cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp (requiere fusionar el adaptador con el base y convertir a GGUF), Ollama (previa fusión y conversión), transformers + PEFT para prototipado.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Tech_Posting_LLama2_7B | 6.738.415.616 (base 7B) | no disponible (base 4096) | llama2 | Adaptador LoRA para simulación social en Reddit |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 | llama2 | Asistente conversacional generalista |
| Mistral-7B-Instruct | 7.242.000.000 aprox. | 8192 | Apache 2.0 | Asistente generalista con contexto extendido |
| Zephyr-7B-beta | 7.242.000.000 aprox. | 8192 | MIT | Asistente afinado con DPO |

La ventaja diferencial de Tech_Posting_LLama2_7B es su especialización en contenido de foros técnicos y simulación social, frente a los modelos generalistas. Como contrapartida, su licencia Llama 2 y el acceso restringido limitan su uso comercial, mientras que Mistral-7B-Instruct y Zephyr-7B-beta ofrecen licencias permisivas (Apache 2.0 y MIT) y mayor contexto.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre datos de Reddit, puede reproducir sesgos de género, raza, ideología y sesgos propios de comunidades técnicas (predominancia masculina, opiniones polarizadas sobre tecnología).
- Riesgo de alucinación: como todo modelo generativo, puede producir afirmaciones falsas con apariencia verosímil, especialmente en contenido técnico especializado.
- Limitación de idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto limitado: hereda la ventana de 4096 tokens de Llama 2, insuficiente para hilos de discusión largos o documentos extensos.
- Licencia Llama 2: restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligación de atribución y de nombrar el modelo "Llama" en productos derivados); revisar los términos completos antes de producción.
- Acceso restringido: el repositorio es gated, requiere aceptar condiciones en Hugging Face y estar autenticado.
- Naturaleza del adaptador: es un LoRA, no un modelo autónomo; requiere el base Llama 2 7B chat y su licencia correspondiente para funcionar.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Uso previsto acotado: no está diseñado como asistente generalista ni para tareas de código, matemáticas o razonamiento complejo.
- Riesgo de contenido tóxico: la generación de publicaciones de foros puede producir contenido ofensivo si no se aplican filtros posteriores.

## Enlaces

- Hugging Face: https://huggingface.co/AbdulSittar/Tech_Posting_LLama2_7B
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/AbdulSittar/Social_Graph_Inference_Reddit
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Paper Llama 2: https://arxiv.org/abs/2307.09288
