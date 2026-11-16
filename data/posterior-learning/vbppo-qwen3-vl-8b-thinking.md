# posterior-learning/vbppo-qwen3-vl-8b-thinking

## Resumen

vbppo-qwen3-vl-8b-thinking es un ajuste fino del modelo multimodal Qwen/Qwen3-VL-8B-Thinking, publicado por el usuario posterior-learning en Hugging Face. No se trata de un modelo entrenado desde cero, sino de la fusión permanente de un adaptador LoRA sobre los pesos del modelo base, de modo que el repositorio contiene un checkpoint autónomo listo para cargar con transformers sin necesidad de aplicar el adaptador por separado.

El interés técnico del modelo reside en el método de entrenamiento del adaptador: VB-PPO (Verbalized-Belief PPO), una variante de PPO adaptada de Agent-BRACE en la que, en cada turno, el modelo genera un pensamiento, un estado de creencia y una acción. Los tokens correspondientes a la creencia reciben una recompensa específica emitida por un juez LLM (DeepSeek V4.1 Flash), mientras que el resto de tokens se optimizan con la recompensa de resultado a través del crítico mediante GAE. El entrenamiento se realizó sobre una suite de 16 juegos con rollouts asíncronos en 4 GPU A100-80GB durante unas 17,9 horas.

El modelo conserva la arquitectura, el tokenizador, la plantilla de chat y las capacidades del Qwen3-VL-8B-Thinking original, con 8.767.123.696 parámetros y un tamaño de repositorio de 17,5 GB en safetensors. Es relevante para investigadores interesados en el entrenamiento con RL de modelos multimodales con razonamiento verbalizado y en la reproducibilidad de pipelines de fusión de LoRA verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_vl), derivada de Qwen/Qwen3-VL-8B-Thinking |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso un tope de 16.384 tokens de pensamiento por turno y un maximo de 81.920 tokens de respuesta por partida) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-8B-Thinking, un transformer multimodal de tipo image-text-to-text con 8.767 millones de parámetros. El repositorio no modifica la arquitectura: los ficheros de configuración, tokenizador, plantilla de chat, procesador y configuración de generación son los del modelo base, sin cambios. El modelo base incorpora un modo de razonamiento ("thinking") que se refleja en el pipeline image-text-to-text y en el identificador del checkpoint.

El ajuste se realizó mediante un adaptador LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones q, k, v, o, gate, up y down (252 módulos en total). El adaptador se entrenó con VB-PPO, una adaptación del baseline de un solo modelo de Agent-BRACE (arXiv 2605.11436) en forma por turno: cada turno produce un pensamiento, un estado de creencia y una acción; los tokens de creencia reciben recompensa de un juez LLM (DeepSeek V4.1 Flash) y el resto se optimiza con la recompensa de resultado vía crítico y GAE. El run vbppo_qwen3vl_8b_thinking_turn (commit 7b81eef) usó la suite suite_train_v1, 16 juegos por actualización y 50 actualizaciones (checkpoint adapter-50), con un tope de 16.384 tokens de pensamiento por turno y 81.920 tokens de respuesta por partida, en rollouts asíncronos con 2 A100-80GB para entrenamiento y 2 para generación, durante aproximadamente 17,9 horas.

La fusión se aplicó con la regla W <- W + (lora_alpha / r) * B @ A (escala 2.0), calculada en fp32 y almacenada en bf16. El informe MERGE-REPORT.json verifica que 3 módulos aleatorios quedan dentro del redondeo bf16 de W + s*B@A, que otros 498 tensores son byte-idénticos al base y que el total de bytes de tensores coincide con el base (17.534.247.392). Al estar fusionado en bf16, las salidas pueden diferir ligeramente respecto a base + adaptador en tiempo de ejecución.

## Capacidades

- Generación de texto y razonamiento multimodal: hereda las capacidades image-text-to-text del Qwen3-VL-8B-Thinking, incluyendo entrada de imágenes junto con texto.
- Modo de razonamiento ("thinking"): el modelo base está diseñado para producir cadenas de pensamiento antes de la respuesta; el ajuste refuerza la generación explícita de un pensamiento, un estado de creencia y una acción por turno.
- Razonamiento multi-turno con estado de creencia verbalizado: el adaptador entrena al modelo a verbalizar su creencia sobre el estado del entorno en cada turno, lo que facilita la interpretabilidad del proceso de decisión.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada; depende de las capacidades heredadas del modelo base.
- Soporte de agentes y razonamiento multi-paso: el entrenamiento se realizó sobre una suite de juegos con interacción por turnos, lo que lo orienta a entornos agénticos de múltiples pasos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: visión (image-text-to-text) y modo thinking; no se documentan audio ni otras modalidades.

## Casos de uso

- Investigación en RL para modelos multimodales: reproducir o extender el pipeline VB-PPO sobre el checkpoint fusionado para estudiar cómo la recompensa sobre tokens de creencia afecta al comportamiento agéntico en entornos de juego.
- Entornos de juego y simulación por turnos: el modelo fue entrenado sobre una suite de 16 juegos con hasta 81.920 tokens de respuesta por partida, por lo que es adecuado para agentes que deben mantener estado y planificar a lo largo de partidas largas.
- Evaluación de razonamiento verbalizado: analizar las trazas de pensamiento, creencia y acción generadas por turno para estudiar interpretabilidad y coherencia interna del modelo.
- Agentes multimodales con entrada de imagen: al conservar el pipeline image-text-to-text, puede emplearse en tareas donde el agente recibe capturas de pantalla o imágenes del entorno y debe decidir acciones.
- Baseline para comparación de métodos de RL: sirve como referencia fusionada (sin adaptador en tiempo de ejecución) frente a configuraciones base + LoRA en experimentos comparativos.
- Prototipado de asistentes conversacionales con estado: la verbalización explícita de creencias por turno puede aprovecharse en asistentes que necesitan exponer su comprensión del contexto antes de actuar.
- Despliegue con transformers: al ser un checkpoint completo en safetensors, puede cargarse directamente en pipelines de transformers sin gestión adicional de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 17,5 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contextos moderados y 40-80 GB para contextos largos.
- GPU recomendadas: A100-80GB o H100 para contextos largos y despliegue de producción; el entrenamiento del adaptador usó 4 A100-80GB (2 para entrenamiento y 2 para generación).
- GPU de consumo: cabe en GPUs con 24 GB o más (por ejemplo, RTX 4090) en bf16 para contextos cortos; para contextos largos o cuantización agresiva se necesitaría evaluar formatos no publicados en el repositorio.
- Opciones de despliegue: transformers (formato nativo del repositorio); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información proporcionada, y su compatibilidad depende del soporte de la arquitectura qwen3_vl en cada herramienta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| posterior-learning/vbppo-qwen3-vl-8b-thinking | 8.767 M | no disponible | image-text-to-text | no disponible | Hugging Face |
| Qwen/Qwen3-VL-8B-Thinking (base) | ~8.000 M (no confirmado) | no disponible | image-text-to-text | no disponible | Hugging Face |
| Otros ajustes LoRA de Qwen3-VL-8B-Thinking | no disponible | no disponible | image-text-to-text | no disponible | no disponible |

La comparación con alternativas de la misma categoría (otros ajustes de RL sobre modelos multimodales de ~8B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar el modelo base, arrastra los sesgos de sus datos de preentrenamiento y ajuste.
- Riesgo de alucinación: no evaluado; el modo thinking y la verbalización de creencias no garantizan corrección factual.
- Limitaciones de contexto o idioma: la longitud de contexto del modelo base no se especifica en la información disponible; el entrenamiento usó topes de 16.384 tokens de pensamiento por turno y 81.920 tokens de respuesta por partida, que no equivalen a la ventana de contexto del modelo.
- Licencia: no disponible; antes de uso comercial debe verificarse la licencia del modelo base Qwen/Qwen3-VL-8B-Thinking, ya que el repositorio no la declara.
- Diferencias por fusión: al fusionar en bf16, las salidas pueden diferir ligeramente respecto a base + adaptador en tiempo de ejecución.
- Especialización: el adaptador se entrenó sobre una suite concreta de 16 juegos; su comportamiento fuera de ese dominio no está validado.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Dependencia de herramientas: la compatibilidad con vLLM, TGI, llama.cpp u Ollama no está confirmada para la arquitectura qwen3_vl.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/vbppo-qwen3-vl-8b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
- Paper de referencia Agent-BRACE: arXiv 2605.11436 (citado en la model card)
