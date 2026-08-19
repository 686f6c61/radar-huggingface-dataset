# mradermacher/OpenSparX-3b-cabin-chat-GGUF

## Resumen

OpenSparX-3b-cabin-chat es un modelo multimodal de la familia Qwen2.5-VL, desarrollado por Qualcomm AI Hub Community, que procesa entradas de imagen y texto para generar respuestas conversacionales. El modelo ha sido ajustado mediante DPO (Direct Preference Optimization) para mejorar la calidad de las interacciones, y se distribuye bajo licencia Apache 2.0 con soporte para chino e ingles. La version GGUF, cuantizada por mradermacher, facilita su despliegue en hardware de consumo.

Aunque la denominacion "3b" sugiere 3 mil millones de parametros, el archivo safetensors presente en el repositorio GGUF indica 668.684.288 parametros. Esta discrepancia podria deberse a que el safetensors solo contiene el decoder de texto, excluyendo el encoder de vision, o a que el modelo real es mas pequeno de lo que sugiere su nombre. El repositorio GGUF incluye doce cuantizaciones distintas, desde Q2_K hasta F16, con un tamano total de 2,2 GB.

La relevancia de este modelo radica en su capacidad multimodal en un formato ligero, lo que permite ejecutar tareas de vision-lenguaje en GPUs de consumo o incluso en CPU. El flag `skip_mmproj` en la configuracion de cuantizacion sugiere que la version GGUF podria no incluir el proyector de vision, limitando potencialmente el modelo a entradas de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal) |
| Parametros totales | 668.684.288 (segun safetensors del repo GGUF) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | chino, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-VL, un transformer multimodal que combina un encoder de vision (ViT) con un decoder de lenguaje autoregresivo. El entrenamiento original incluyo un ajuste fino con DPO (Direct Preference Optimization), una tecnica de optimizacion por preferencias que alinea las respuestas del modelo con juicios humanos de calidad sin necesidad de un modelo de recompensa explicito. El sufijo "cabin" en el nombre podria referirse a un dataset o receta de entrenamiento especifica, aunque no se dispone de informacion detallada al respecto.

La cuantizacion GGUF fue realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`. El flag `skip_mmproj` indica que el proyector multimodal (la capa que proyecta las features de vision al espacio del decoder de texto) podria haberse omitido durante la conversion, lo que implicaria que los archivos GGUF resultantes solo soportan entrada de texto. Los datos de entrenamiento (numero de tokens, composicion del dataset) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Procesamiento de imagenes en el modelo original (la version GGUF podria no incluir esta capacidad debido al flag `skip_mmproj`).
- Razonamiento multimodal imagen-texto en el modelo base de Qualcomm.
- Ajuste conversacional mediante DPO para respuestas mas alineadas con preferencias humanas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.

## Casos de uso

- Chatbots de atencion al cliente bilingue: el modelo puede gestionar conversaciones en chino e ingles, lo que lo hace adecuado para empresas con usuarios en ambos idiomas. Su tamano reducido permite desplegarlo en servidores modestos o en el edge.
- Asistente de documentacion tecnica: con su capacidad de procesar imagenes (en el modelo original), puede describir diagramas, capturas de pantalla o esquemas y responder preguntas sobre ellos.
- Clasificacion y descripcion de imagenes en entornos con recursos limitados: el modelo base puede etiquetar o describir imagenes sin necesidad de una GPU de gama alta.
- Prototipado rapido de aplicaciones multimodales: al ser ligero y estar disponible en formato GGUF, permite iterar rapidamente en entornos de desarrollo sin infraestructura costosa.
- Traduccion asistida chino-ingles: el modelo puede ayudar en tareas de traduccion conversacional, aunque su especialidad principal es el dialogo mas que la traduccion pura.
- Fine-tuning posterior sobre dominios especificos: al ser un modelo pequeno con licencia Apache 2.0, puede ajustarse con datasets propietarios para tareas verticales sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 668M de parametros, una cuantizacion Q4_K_S ocuparia aproximadamente 350-450 MB, y Q8_0 alrededor de 700 MB. Cualquier GPU con 4 GB de VRAM o mas puede ejecutar el modelo sin problemas.
- GPU recomendadas: NVIDIA GTX 1650 o superior, RTX 3060, RTX 4090, o cualquier GPU con al menos 4 GB de VRAM. Tambien es viable en Apple Silicon (M1/M2/M3) mediante llama.cpp.
- Compatibilidad con consumer GPU: si, el modelo cabe en practicamente cualquier GPU de consumo actual.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo original (safetensors), se puede usar vLLM o TGI si se requiere mayor throughput.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque para un modelo de este tamano se espera una generacion rapida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| OpenSparX-3b-cabin-chat (GGUF) | 668M (segun safetensors) | no disponible | si (original) / no (GGUF) | Apache 2.0 | GGUF |
| Qwen2.5-VL-3B (base) | ~3,75B | 32K+ | si | Apache 2.0 | safetensors |
| Qwen2.5-VL-7B | ~8,3B | 32K+ | si | Apache 2.0 | safetensors |

La comparativa se limita a la familia Qwen2.5-VL, ya que no se dispone de informacion suficiente sobre otros modelos comparables en el mismo rango de parametros. El modelo base de Qualcomm es un fine-tuning de Qwen2.5-VL-3B, por lo que hereda su arquitectura y capacidades, aunque el numero de parametros reportado en el safetensors del repo GGUF (668M) sugiere que podria tratarse de una variante reducida o de una extraccion parcial del modelo.

## Limitaciones y advertencias

- La version GGUF podria no soportar entrada de imagenes: el flag `skip_mmproj` en la configuracion de cuantizacion sugiere que el proyector de vision se omitio, limitando el modelo a texto.
- Discrepancia en el numero de parametros: el nombre indica "3b" pero el safetensors muestra 668M. Esto podria indicar que el archivo es parcial o que el modelo real es mas pequeno de lo esperado.
- Riesgo de alucinacion: como cualquier modelo de lenguaje pequeno, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- Sesgos desconocidos: no se ha publicado informacion sobre evaluaciones de sesgo o seguridad para este modelo.
- Limitaciones de idioma: solo se confirma soporte para chino e ingles; el rendimiento en otros idiomas no esta garantizado.
- Sin datos de benchmarks: no se puede evaluar objetivamente su rendimiento frente a alternativas sin resultados publicados.
- El repositorio GGUF tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco probado en la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OpenSparX-3b-cabin-chat-GGUF
- Modelo original: https://huggingface.co/qualcomm-ai-hub-community/OpenSparX-3b-cabin-chat
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
