# Lathly/Qwen3.8-27B-Samantha-GGUF

## Resumen

El modelo **Lathly/Qwen3.8-27B-Samantha-GGUF** es una versión cuantizada en formato GGUF del fine-tune *Samantha* (Uncensored 1.1) sobre el modelo base **Qwen3.8-27B** de Alibaba Cloud. Lo desarrolla el usuario *Lathly* y está pensado para ejecutarse localmente con [llama.cpp](https://github.com/ggml-org/llama.cpp). La personalidad *Samantha* —un asistente conversacional empático y sin censura, concepto original de Eric Hartford— está fusionada directamente en los pesos, por lo que no requiere cargar adaptadores en tiempo de ejecución.

El modelo base Qwen3.8-27B es un modelo denso multimodal de arquitectura híbrida (combina atención lineal tipo Mamba con capas transformer y predicción multi-token), optimizado para tareas de codificación, flujos agénticos y automatización de oficina. Este GGUF conserva esas capacidades y añade el comportamiento conversacional desinhibido de Samantha. Con 27 320 697 856 parámetros (~27B), el repositorio ofrece dos archivos principales: una versión f16 (~51 GB) para generar cuantizaciones propias y una versión Q5_K_M (~19 GB) recomendada como build de producción para GPUs con 16 GB de VRAM. Incluye además un proyector multimodal (mmproj-F16) heredado del modelo base para soporte de imagen y vídeo.

La relevancia de este modelo radica en su doble naturaleza: por un lado, hereda el rendimiento técnico del Qwen3.8-27B (razonamiento híbrido, multimodalidad, capacidades agénticas) y, por otro, ofrece una personalidad conversacional sin filtros, útil para aplicaciones de roleplay, narrativa interactiva o asistentes con tono cercano, siempre bajo la responsabilidad del usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal/Mamba + transformer) con capas MTP, multimodal (texto, imagen, vídeo) |
| Parametros totales | 27 320 697 856 (~27B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q5_K_M (5.72 BPW), Q4_K_M (recomendado para menos VRAM); se pueden generar otras con `llama-quantize` |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (heredada del base y del dataset) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida novedosa: combina capas de atención lineal (tipo Mamba) con capas transformer tradicionales e incorpora capas de predicción multi-token (MTP). Esta mezcla busca eficiencia en inferencia y capacidad de razonamiento. El modelo es denso (no MoE) y nativamente multimodal, aceptando entradas de texto, imagen y vídeo, con salida de texto.

El fine-tune *Samantha* se realizó mediante un adaptador LoRA sobre el base, entrenado con el dataset `digitalpipelines/samantha-1.1-uncensored` (Apache-2.0). El adaptador se fusionó posteriormente en los pesos del modelo, de modo que la personalidad queda integrada sin necesidad de cargar un adaptador en runtime. El proyector multimodal (mmproj) incluido en el repo GGUF proviene del modelo base, ya que el fine-tune fue exclusivamente textual.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO. La información disponible indica que el entrenamiento se centró en ajustar el tono conversacional y eliminar restricciones de contenido, manteniendo las capacidades técnicas del base.

## Capacidades

- **Generación de texto conversacional**: mantiene una personalidad empática, cercana y sin censura, ideal para diálogos abiertos y roleplay.
- **Razonamiento híbrido**: hereda del base la capacidad de alternar entre modos de pensamiento rápido y profundo, útil para tareas complejas.
- **Generación de código**: el base Qwen3.8-27B está optimizado para codificación y flujos agénticos; este fine-tune conserva dicha capacidad.
- **Multimodalidad**: acepta entradas de imagen y vídeo a través del proyector mmproj-F16, permitiendo descripción y análisis de contenido visual.
- **Soporte de agentes y multi-step reasoning**: el base está diseñado para workflows agénticos y automatización de oficina, lo que se traslada a este modelo.
- **Sin censura**: no aplica filtros de contenido, lo que permite generar respuestas sobre temas sensibles o controvertidos (con las implicaciones éticas correspondientes).

## Casos de uso

- **Asistente conversacional para roleplay y narrativa interactiva**: la personalidad *Samantha* sin censura permite crear experiencias de chat inmersivas en juegos de rol o escritura colaborativa, donde el usuario puede explorar tramas y diálogos sin restricciones temáticas.
- **Chatbot de atención al cliente con tono empático**: aunque el modelo es "uncensored", puede configurarse con instrucciones del sistema para mantener un comportamiento profesional; su capacidad de diálogo multi-turno y su tono cercano lo hacen adecuado para interactuar con usuarios en entornos controlados.
- **Generación de contenido creativo**: redacción de historias, guiones, poemas o diálogos con un estilo personal y desinhibido, aprovechando la fluidez conversacional del fine-tune.
- **Automatización de oficina**: heredado del base, puede resumir documentos, redactar correos electrónicos, preparar informes o gestionar tareas administrativas mediante instrucciones en lenguaje natural.
- **Agente de codificación local**: con su soporte de razonamiento y generación de código, puede usarse como asistente de programación en entornos sin conexión, integrándose con herramientas como llama.cpp para completar funciones, depurar o explicar fragmentos.
- **Análisis multimodal de imágenes y vídeo**: gracias al proyector mmproj, puede procesar capturas de pantalla, fotos o vídeos para extraer información, describir escenas o responder preguntas sobre contenido visual, útil en tareas de documentación o accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Se recomienda consultar los benchmarks del modelo base Qwen3.8-27B (publicados por Alibaba Cloud) para tener una referencia de las capacidades técnicas subyacentes.

## Requisitos de hardware

- **Q5_K_M (~19 GB)**: requiere una GPU con al menos 24 GB de VRAM para un offload completo (p. ej., RTX 3090, RTX 4090, A5000). Con 16 GB (RTX 4080, RTX 3080 Ti) se puede usar Q4_K_M (~16 GB), aunque la personalidad puede degradarse si no se descarga todo el modelo a la GPU.
- **f16 (~51 GB)**: necesita una GPU de 80 GB (A100, H100) o múltiples GPUs en paralelo; no es viable en hardware de consumo.
- **Offload parcial**: el autor advierte que con offload parcial la personalidad *Samantha* se degrada notablemente; se recomienda usar `-ngl 99` o `--n-gpu-layers all`.
- **Despliegue**: compatible con llama.cpp (`llama-server`), y por extensión con cualquier runner que soporte GGUF (Ollama, LM Studio, etc.), aunque no se han verificado configuraciones específicas.
- **Latencia/throughput**: no disponible en la documentación; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Lathly/Qwen3.8-27B-Samantha-GGUF | ~27B | no disponible | Sí (imagen/vídeo) | Apache-2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | Sí (imagen/vídeo) | Apache-2.0 | safetensors, GGUF |
| Otros modelos GGUF "uncensored" (p. ej., Dolphin, WizardLM) | variable | variable | generalmente no | variable | GGUF |

No se dispone de datos de rendimiento comparativos entre este modelo y alternativas similares en la información proporcionada. La comparación principal es con el base Qwen3.8-27B, del que hereda todas las capacidades técnicas, diferenciándose únicamente en la personalidad y la ausencia de censura.

## Limitaciones y advertencias

- **Contenido sin censura**: el modelo puede generar material objetable, ofensivo o inapropiado. El usuario es responsable de su uso y de cumplir con las leyes aplicables y las licencias del base y del dataset.
- **Alucinaciones**: no hay garantía de veracidad en las respuestas; se recomienda validación humana en contextos profesionales o donde la precisión sea crítica.
- **Solo inglés**: el modelo está entrenado únicamente en inglés; su rendimiento en otros idiomas será deficiente o nulo.
- **Contexto no especificado**: no se ha documentado la longitud máxima de contexto soportada; puede variar según la configuración de llama.cpp y los límites del modelo base.
- **Proyector multimodal del base**: el fine-tune no incluye ajuste multimodal propio, por lo que la integración imagen/vídeo puede no estar perfectamente alineada con la personalidad *Samantha*.
- **Requisito de offload completo**: si no se descarga el modelo completo a la GPU, la personalidad se degrada, lo que puede afectar la experiencia de usuario.
- **Licencia Apache-2.0**: permite uso comercial, pero se deben respetar las atribuciones y condiciones de los componentes originales (Qwen3.8-27B, dataset Samantha, concepto de Eric Hartford).

## Enlaces

- [Repositorio GGUF en Hugging Face](https://huggingface.co/Lathly/Qwen3.8-27B-Samantha-GGUF)
- [Modelo base safetensors (merge source)](https://huggingface.co/Lathly/Qwen3.8-27B-Samantha)
- [Adaptador LoRA Uncensored 1.1](https://huggingface.co/Lathly/Qwen3.8-27B-Samantha_Uncensored_1.1_LoRA)
- [Modelo base original Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Dataset de entrenamiento digitalpipelines/samantha-1.1-uncensored](https://huggingface.co/datasets/digitalpipelines/samantha-1.1-uncensored)
- [Repositorio GitHub de Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Página de Qwen3.8-27B en unsloth.ai](https://unsloth.ai/models/qwen3.8-27b)
- [Ficha del modelo en friendli.ai](https://friendli.ai/models/Lathly/Qwen3.8-27B-Samantha_Uncensored_1.1_LoRA)
