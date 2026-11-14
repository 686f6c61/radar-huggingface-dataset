# labadain/labadain-E2B-it-Tetun

## Resumen

Labadain-Gemma4-E2B-it-Tetun es un ajuste fino del modelo Gemma 4 E2B-it de Google, desarrollado por la iniciativa Labadain, orientada a mejorar el acceso digital y la IA en Timor-Leste. El modelo está especializado en conversación y generación de texto en tetun (tetun-dili, código `tet`/`tdt`), una lengua de bajos recursos, y se distribuye como pesos fusionados en formato safetensors tras combinar los adaptadores QLoRA con el modelo base.

El ajuste se realizó sobre 32.197 conversaciones multi-turno compiladas de fuentes de noticias, salud, educación y conversación general. El modelo hereda la arquitectura multimodal image-text-to-text de Gemma 4 y conserva la capacidad de modo de razonamiento (thinking mode) del modelo base, que puede activarse o desactivarse mediante la plantilla de chat.

Con 5.123.178.051 parámetros reales en safetensors y un repositorio de 10,3 GB, el modelo está pensado para investigación en NLP multilingüe y de bajos recursos, así como para el desarrollo de aplicaciones de IA en tetun. Su relevancia radica en cubrir una lengua con escasa representación en los grandes modelos y en ofrecer versiones GGUF y Ollama para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, image-text-to-text) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `max_seq_length=4096`) |
| Tipos de cuantizacion | QLoRA en entrenamiento; GGUF Q4_K_M publicado; carga en 4 bits vía Unsloth |
| Idiomas soportados | tet (tetun), tdt (tetun-dili) |
| Licencia | Gemma (Gemma 4 License) |
| Formato de pesos | safetensors (transformers); GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E2B-it`, un modelo de la familia Gemma 4 con arquitectura transformer multimodal capaz de procesar imagen y texto (pipeline `image-text-to-text`). El ajuste se realizó mediante QLoRA, una técnica de ajuste fino con cuantización de bajo rango que reduce los requisitos de memoria, y los adaptadores resultantes se fusionaron en los pesos del modelo base, dando lugar a un checkpoint único en safetensors.

El conjunto de entrenamiento final consta de 32.197 conversaciones multi-turno compiladas de cuatro fuentes: 1.951 de artículos de noticias, 9.649 de salud (QA y multi-turno), 465 de educación y lengua, y 20.132 de conversación general. La model card no especifica el número de tokens de entrenamiento, la composición exacta de los datos ni si se aplicaron fases de RLHF o DPO adicionales. El modelo conserva el modo de razonamiento (thinking mode) del modelo base, que puede desactivarse con `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Generación de texto conversacional en tetun (tetun-dili) en dominios de conocimiento general, noticias, conversación cotidiana y salud.
- Respuesta a preguntas (QA) multi-turno con contexto conversacional.
- Modo de razonamiento (thinking mode) heredado de Gemma 4, activable o desactivable mediante la plantilla de chat.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text` del modelo base), aunque la model card no documenta evaluación de esta capacidad tras el ajuste.
- Soporte de plantilla de chat con roles (`user`, etc.) para conversación estructurada.
- Capacidades multilingües limitadas al tetun y tetun-dili según la model card; el modelo base Gemma 4 es multilingüe, pero el ajuste se centra en tetun.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.

## Casos de uso

- Asistente conversacional en tetun para atención ciudadana: el modelo puede mantener diálogos multi-turno en tetun sobre trámites, servicios y preguntas frecuentes, aprovechando su entrenamiento en conversación general y noticias para respuestas contextualizadas.
- Consultas de salud en tetun: con 9.649 ejemplos de QA y conversación sanitaria en el entrenamiento, puede emplearse como primer nivel de orientación informativa en aplicaciones de salud para Timor-Leste, siempre con supervisión humana y avisos médicos.
- Difusión de noticias y resúmenes: los 1.951 ejemplos de artículos de noticias permiten generar resúmenes y explicaciones de actualidad en tetun para medios locales o portales informativos.
- Educación y aprendizaje de la lengua: los 465 ejemplos de educación y lengua permiten construir tutores o ejercicios de práctica de tetun, así como materiales didácticos bilingües.
- Investigación en NLP de bajos recursos: sirve como checkpoint de referencia para experimentos de ajuste fino, evaluación y comparación en tetun, con pesos safetensors compatibles con transformers y Unsloth.
- Despliegue local en entornos con recursos limitados: la versión GGUF Q4_K_M y la imagen de Ollama (`labadainofficial/labadain-gemma4:e3b-q4km`) permiten ejecutar el modelo en CPU o GPU de consumo para prototipos y demos.
- Integración en pipelines de generación de texto: al ser compatible con `transformers` y con endpoints, puede integrarse en servicios de generación de contenido en tetun mediante la API estándar de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo no ha sido evaluado todavía en aplicaciones downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5.123.178.051 parámetros, en fp16 se requieren aproximadamente 10,2 GB solo para pesos; en 4 bits (QLoRA/carga `load_in_4bit=True`) el requisito se reduce a unos 2,5-3 GB para pesos, más memoria para el contexto y el procesador multimodal.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 12-16 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080) debería bastar para inferencia en 4 bits; para fp16 se recomienda 16 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cuantización de 4 bits y con la versión GGUF Q4_K_M.
- Opciones de despliegue: `transformers` (con Unsloth para carga en 4 bits), llama.cpp mediante el GGUF Q4_K_M, Ollama (`labadainofficial/labadain-gemma4:e3b-q4km`) y endpoints compatibles de Hugging Face. vLLM y TGI no están documentados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| labadain/labadain-E2B-it-Tetun | 5.123.178.051 | no disponible | tet, tdt | Gemma | safetensors, GGUF |
| unsloth/gemma-4-E2B-it (base) | no disponible | no disponible | multilingüe (Gemma 4) | Gemma | safetensors |
| Otros ajustes en tetun | no disponible | no disponible | tet | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada; la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en aplicaciones downstream, según declara el autor; no hay métricas de calidad, sesgo o robustez.
- Riesgo de alucinación inherente a los modelos generativos, agravado por el tamaño limitado del conjunto de entrenamiento (32.197 conversaciones) y la escasez de datos en tetun.
- Sesgos conocidos: no documentados; el entrenamiento con datos de noticias y salud puede introducir sesgos de dominio y de representación.
- Limitaciones de idioma: el ajuste se centra en tetun y tetun-dili; el rendimiento en otros idiomas no está garantizado pese a la base multilingüe de Gemma 4.
- Limitaciones de contexto: la longitud de contexto del modelo no está documentada; el ejemplo de uso emplea `max_seq_length=4096`, por lo que no se debe asumir una ventana mayor.
- Restricciones de licencia: es un derivado de Gemma 4 y está sujeto a la Gemma 4 License (https://ai.google.dev/gemma/docs/gemma_4_license); es necesario revisar sus términos para uso comercial y redistribución.
- Para producción: al no existir evaluación, se recomienda validación humana, filtros de seguridad y pruebas específicas del dominio antes de desplegar en salud, educación o atención al ciudadano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labadain/labadain-E2B-it-Tetun
- Versión GGUF: https://huggingface.co/labadain/Labadain-Gemma-4-E2B-it-Tetun-GGUF
- Versión Ollama: https://ollama.com/labadainofficial/labadain-gemma4
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Labadain Chat: https://www.labadain.com
- Labadain Search: https://search.labadain.com
