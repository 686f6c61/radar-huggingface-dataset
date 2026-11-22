# furiosa-ai/Qwen3.6-35B-A3B-FP8

## Resumen

Qwen3.6-35B-A3B-FP8 es un modelo de lenguaje y visión de tipo Mixture-of-Experts (MoE) desarrollado originalmente por el equipo Qwen de Alibaba y redistribuido por FuriosaAI en este repositorio. Cuenta con 35.951.822.704 parámetros totales y activa aproximadamente 3B por token, lo que permite un equilibrio entre capacidad y coste computacional. Emplea la arquitectura Qwen3.5-MoE (`Qwen3_5MoeForConditionalGeneration`), que combina un codificador visual con un decodificador que alterna atención lineal Gated DeltaNet y atención completa.

El modelo acepta entradas de imagen y texto y genera texto, por lo que cubre tareas de comprensión visual, razonamiento y llamada a herramientas (function calling). El modo de razonamiento (thinking) está activado por defecto y puede desactivarse por petición. La versión aquí publicada incorpora pesos en FP8 (E4M3 con bloques de 128×128) y un bundle ejecutable de Furiosa (FXB) para ejecutarse sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM.

Este repositorio es relevante porque demuestra el despliegue de un MoE multimodal de 35B en hardware específico de inferencia (RNGD) con paralelismo tensorial de 16 PEs repartidos en dos tarjetas. La licencia Apache 2.0 facilita su uso comercial, y su compatibilidad con vLLM, SGLang y Transformers amplía las opciones de despliegue más allá del stack de Furiosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (Mixture-of-Experts), `Qwen3_5MoeForConditionalGeneration`; decodificador con Gated DeltaNet (atención lineal) y atención completa, más codificador visual |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3B por token (denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8: pesos estáticos E4M3 en bloques de 128×128; activaciones FP8 dinámicas por token/bloque en tiempo de ejecución; KV cache en 16 bits; codificador visual, LM head y routers MoE en mayor precisión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 48,7 GB), más Furiosa Executable Bundle (FXB) para RNGD |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5-MoE, un transformer con mezcla de expertos en el que solo se activan unos 3B parámetros por token de los casi 36B totales. El decodificador combina capas de atención lineal Gated DeltaNet con capas de atención completa, un diseño híbrido que busca reducir el coste de atención en contextos largos manteniendo la calidad del modelado. Incluye además un codificador visual que permite procesar imágenes junto con texto en el mismo formato de chat multimodal de estilo OpenAI (`image_url`).

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; estos datos deben consultarse en la model card del modelo original de Qwen. La innovación destacable de esta distribución es la cuantización FP8: pesos estáticos en E4M3 con bloques de 128×128 y cuantización dinámica de activaciones en tiempo de ejecución sin calibración offline, dejando en mayor precisión el codificador visual, la LM head y los routers MoE, y manteniendo la KV cache en 16 bits. El despliegue en RNGD usa paralelismo tensorial de tamaño 16 PEs sobre dos tarjetas (8 PEs por tarjeta).

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto y desactivable mediante `enable_thinking`.
- Comprensión de imágenes: acepta mensajes multimodales con partes `image_url` (URL remota, base64 inline o ruta local `file://` con el flag correspondiente).
- Llamada a herramientas (tool calling / function calling) mediante el parser `qwen3_coder` (alias `qwen3_xml`) con formato XML de llamadas.
- Separación del razonamiento y la respuesta final mediante el parser `qwen3`, expuesto en `message.reasoning` (no streaming) y `delta.reasoning` (streaming).
- API compatible con OpenAI a través de Furiosa-LLM, lo que facilita la integración con clientes existentes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Razonamiento multi-paso y uso en agentes: soportado indirectamente por el modo thinking y el tool calling, aunque sin detalles adicionales en la documentación disponible.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede recibir capturas, diagramas o páginas escaneadas junto con preguntas en texto y devolver descripciones o extracciones, gracias a su codificador visual y su ventana multimodal.
- Asistentes con razonamiento explícito: activando el modo thinking se obtiene una traza de razonamiento separada de la respuesta, útil en escenarios de depuración, auditoría o explicabilidad en atención al cliente técnica.
- Agentes con herramientas: la integración del parser `qwen3_coder` permite que el modelo emita llamadas a funciones estructuradas y encadene varios pasos con APIs externas, por ejemplo para consultar bases de datos o servicios web.
- Automatización de soporte multimodal: un chatbot que recibe imágenes de errores o productos dañados y responde con diagnóstico o pasos de resolución, aprovechando la entrada image-text-to-text.
- Procesamiento por lotes en hardware dedicado: el bundle FXB y el despliegue en dos RNGD con paralelismo tensorial de 16 PEs permiten servir el modelo en infraestructura de inferencia específica con coste controlado por token activado.
- Evaluación comparativa de cuantización FP8: investigadores pueden usar esta versión para medir la degradación de calidad frente a los pesos originales en tareas de visión y razonamiento, dado que los módulos sensibles se mantienen en mayor precisión.
- Generación de código asistida con contexto visual: el modelo puede razonar sobre capturas de interfaces o diagramas y proponer fragmentos de código o correcciones, combinando visión y tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo de pesos ocupa 48,7 GB en FP8; en GPU convencional se necesita al menos esa cifra más overhead de KV cache y activaciones, por lo que se recomienda 80 GB o más para un despliegue cómodo.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para servir el modelo completo en FP8; no se dispone de datos de rendimiento específicos en estas GPU.
- Hardware nativo documentado: FuriosaAI RNGD con dos tarjetas (paralelismo tensorial de 16 PEs, 8 PEs por tarjeta) mediante Furiosa-LLM.
- ¿Cabe en GPU de consumo? No de forma completa en FP8 con los datos disponibles; una RTX 4090 de 24 GB no aloja los 48,7 GB de pesos, y no se documentan cuantizaciones GGUF/INT4 en esta ficha.
- Opciones de despliegue: Furiosa-LLM (soporte oficial de este repo), vLLM, SGLang y Transformers según la model card del modelo original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-FP8 (este repo) | 35,95B | ~3B | no disponible | Apache 2.0 | Hugging Face, Furiosa-LLM, vLLM, SGLang, Transformers |
| Qwen/Qwen3.6-35B-A3B-FP8 (upstream) | 35,95B | ~3B | no disponible | Apache 2.0 | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; cabe esperar los sesgos habituales de los datos de entrenamiento del modelo original de Qwen.
- Riesgo de alucinación: no cuantificado; el modo thinking por defecto puede aumentar la latencia y no garantiza la veracidad de la traza de razonamiento.
- Longitud de contexto e idiomas: no disponibles en esta ficha; conviene consultar la model card upstream para planificar aplicaciones con contextos largos o requisitos multilingües.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de la licencia upstream de Qwen y de las dependencias de Furiosa-LLM.
- Despliegue en RNGD: requiere Furiosa-LLM y el bundle FXB; el soporte multimodal en Furiosa-LLM se limita actualmente a texto e imagen.
- El campo `reasoning` no forma parte de la especificación de la API de OpenAI; acceder a él cuando no existe lanza `AttributeError`.
- La cuantización FP8 puede introducir degradación de calidad frente a los pesos originales, especialmente en tareas sensibles; no se han publicado métricas al respecto en esta información.
- El acceso a rutas locales `file://` requiere el flag `--allowed-local-media-path`, lo que implica consideraciones de seguridad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3.6-35B-A3B-FP8
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Licencia upstream: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8/blob/main/LICENSE
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
